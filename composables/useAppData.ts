import type { AppData, Stock, Loan, Transaction } from '~/types'
import { loadData, saveData, loadDataSync } from '~/utils/storage'
import { calculateNetAmount } from '~/utils/calculations'

export const useAppData = () => {
  // Use synchronous loading for initial state, then async for updates
  const data = useState<AppData>('appData', () => loadDataSync())

  const refreshData = async () => {
    try {
      data.value = await loadData()
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }

  const saveAppData = async () => {
    try {
      await saveData(data.value)
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }

  // Removed local <-> server sync; server is the single source of truth

  // Stock operations
  const addStock = async (stock: Omit<Stock, 'id'>) => {
    const newStock: Stock = {
      id: `stock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...stock
    }
    data.value.stocks.push(newStock)
    // Create buy transaction entry for history
    await addTransaction(
      'buy',
      newStock.id,
      newStock.name,
      newStock.quantity,
      newStock.tradePrice
    )
    await saveAppData()
  }

  const updateStock = async (id: string, updates: Partial<Omit<Stock, 'id'>>) => {
    const index = data.value.stocks.findIndex((s: Stock) => s.id === id)
    if (index !== -1) {
      const currentStock = data.value.stocks[index]!
      data.value.stocks[index] = { ...currentStock, ...updates, id: currentStock.id } as Stock
      await saveAppData()
    }
  }

  const deleteStock = async (id: string) => {
    data.value.stocks = data.value.stocks.filter((s: Stock) => s.id !== id)
    await saveAppData()
  }

  // Loan operations
  const addLoan = async (loan: Omit<Loan, 'id'>) => {
    const newLoan: Loan = {
      id: `loan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...loan
    }
    data.value.loans.push(newLoan)
    await saveAppData()
  }

  const updateLoan = async (id: string, updates: Partial<Omit<Loan, 'id'>>) => {
    const index = data.value.loans.findIndex((l: Loan) => l.id === id)
    if (index !== -1) {
      const currentLoan = data.value.loans[index]!
      data.value.loans[index] = { ...currentLoan, ...updates, id: currentLoan.id } as Loan
      await saveAppData()
    }
  }

  const markEMIPaid = async (loanId: string, month: number, stocksSold: string[] = []) => {
    const loan = data.value.loans.find((l: Loan) => l.id === loanId)
    if (loan) {
      const payment = loan.paymentsSchedule.find((p: any) => p.month === month)
      if (payment) {
        payment.paid = true
        payment.paidDate = new Date().toISOString()
        payment.stocksSold = stocksSold
        await saveAppData()
      }
    }
  }

  // Transaction operations
  const addTransaction = async (
    type: 'buy' | 'sell',
    stockId: string,
    stockName: string,
    quantity: number,
    price: number,
    loanId?: string,
    emiMonth?: number,
    purpose?: 'emi' | 'reinvest' | 'profit' | 'other',
    linkedBuyId?: string,
    notes?: string
  ) => {
    const { grossAmount, brokerageTotal, netAmount } = calculateNetAmount(
      quantity,
      price,
      data.value.brokerageConfig,
      type
    )

    const avgCostPerShare = (() => {
      const stock = data.value.stocks.find((s: Stock) => s.id === stockId)
      if (stock && stock.quantity > 0) return stock.paid / stock.quantity
      return price
    })()
    const costTotal = avgCostPerShare * quantity

    const buyAmount = grossAmount
    const transaction: Transaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      stockId,
      stockName,
      quantity,
      price,
      totalAmount: grossAmount,
      brokerage: brokerageTotal,
      netAmount,
      date: new Date().toISOString(),
      loanId,
      emiMonth,
      purpose,
      linkedBuyId,
      notes,
      costPerShare: avgCostPerShare,
      costTotal,
      realizedPnL: type === 'sell' ? (netAmount - costTotal) : 0,
      buyAmount: type === 'buy' ? buyAmount : 0,
      sellAmount: type === 'sell' ? grossAmount : 0,
      profitLoss: type === 'sell' ? (netAmount - costTotal) : 0
    }

    data.value.transactions.push(transaction)
    await saveAppData()
    return transaction
  }

  // Sell stocks to pay EMI
  const sellStocksForEMI = async (
    stockId: string,
    quantity: number,
    price: number,
    loanId: string,
    emiMonth: number
  ) => {
    const stock = data.value.stocks.find((s: Stock) => s.id === stockId)
    if (!stock) return null

    // Create transaction with EMI purpose
    const transaction = await addTransaction('sell', stockId, stock.name, quantity, price, loanId, emiMonth, 'emi')

    // Update stock
    const soldQty = (stock.soldQuantity || 0) + quantity
    
    if (stock.quantity === quantity) {
      await updateStock(stockId, {
        status: 'sold',
        soldDate: new Date().toISOString(),
        soldPrice: price,
        soldQuantity: soldQty,
        quantity: 0
      })
    } else {
      const newQuantity = stock.quantity - quantity
      const newPaid = stock.paid * (newQuantity / stock.quantity)
      const newValue = newQuantity * stock.currentPrice
      const newProfitLoss = newValue - newPaid
      
      await updateStock(stockId, {
        quantity: newQuantity,
        paid: newPaid,
        value: newValue,
        profitLoss: newProfitLoss,
        soldPrice: price,
        soldQuantity: soldQty,
        status: 'partial'
      })
    }

    return transaction
  }

  // Sell stocks for general purpose (not EMI)
  const sellStock = async (
    stockId: string,
    quantity: number,
    price: number,
    purpose: 'reinvest' | 'profit' | 'other' = 'other',
    notes?: string
  ) => {
    const stock = data.value.stocks.find((s: Stock) => s.id === stockId)
    if (!stock) return null

    // Create transaction
    const transaction = await addTransaction('sell', stockId, stock.name, quantity, price, undefined, undefined, purpose, undefined, notes)

    // Update stock
    const soldQty = (stock.soldQuantity || 0) + quantity
    
    if (stock.quantity === quantity) {
      await updateStock(stockId, {
        status: 'sold',
        soldDate: new Date().toISOString(),
        soldPrice: price,
        soldQuantity: soldQty,
        quantity: 0
      })
    } else {
      const newQuantity = stock.quantity - quantity
      const newPaid = stock.paid * (newQuantity / stock.quantity)
      const newValue = newQuantity * stock.currentPrice
      const newProfitLoss = newValue - newPaid
      
      await updateStock(stockId, {
        quantity: newQuantity,
        paid: newPaid,
        value: newValue,
        profitLoss: newProfitLoss,
        soldPrice: price,
        soldQuantity: soldQty,
        status: 'partial'
      })
    }

    return transaction
  }

  // Get active lots (positions) for a stock name (same-name buys at different times)
  const getActiveLotsByName = (stockName: string): Stock[] => {
    // Consider all unsold lots (active or partial)
    return data.value.stocks
      .filter((s: Stock) => s.status !== 'sold' && s.name === stockName)
      .sort((a: Stock, b: Stock) => new Date(a.purchaseDate || 0).getTime() - new Date(b.purchaseDate || 0).getTime())
  }

  // Get aggregated view for a stock name
  const getAggregateByName = (stockName: string) => {
    const lots = getActiveLotsByName(stockName)
    const totalQuantity = lots.reduce((sum, s) => sum + s.quantity, 0)
    const totalPaid = lots.reduce((sum, s) => sum + s.paid, 0)
    const currentPrice = lots.length > 0 ? lots[0]!.currentPrice : 0
    const value = totalQuantity * currentPrice
    const profitLoss = value - totalPaid
    const avgTradePrice = totalQuantity > 0 ? totalPaid / totalQuantity : 0
    return { totalQuantity, totalPaid, currentPrice, value, profitLoss, avgTradePrice }
  }

  // Sell by stock name across multiple lots (FIFO)
  const sellStockByName = async (
    stockName: string,
    quantity: number,
    price: number,
    purpose: 'reinvest' | 'profit' | 'other' = 'other',
    notes?: string
  ): Promise<{ transactions: Transaction[]; totalNetAmount: number; totalBrokerage: number } | null> => {
    let remaining = quantity
    const initialLots = getActiveLotsByName(stockName)
    if (initialLots.length === 0) return null

    // Validate available quantity
    const available = initialLots.reduce((sum, s) => sum + s.quantity, 0)
    if (remaining > available) {
      throw new Error(`Requested quantity (${remaining}) exceeds available (${available})`)
    }

    const lotIdsQueue = initialLots.map(l => l.id)
    const transactions: Transaction[] = []
    let totalNetAmount = 0
    let totalBrokerage = 0

    while (remaining > 0 && lotIdsQueue.length > 0) {
      const lotId = lotIdsQueue.shift() as string
      // fetch the latest lot state to avoid stale quantities
      const lot = data.value.stocks.find((s: Stock) => s.id === lotId)
      if (!lot || lot.status === 'sold' || lot.quantity <= 0) {
        continue
      }
      const sellQty = Math.min(remaining, lot.quantity)
      const txn = await sellStock(lot.id, sellQty, price, purpose, notes)
      if (txn) {
        transactions.push(txn)
        totalNetAmount += txn.netAmount
        totalBrokerage += txn.brokerage
      }
      remaining -= sellQty
    }

    if (remaining > 0) {
      throw new Error('Failed to execute full quantity')
    }

    return { transactions, totalNetAmount, totalBrokerage }
  }

  // Buy stock using proceeds from another sale
  const buyStockWithProceeds = async (
    sellTransactionId: string,
    stockData: Omit<Stock, 'id'>
  ) => {
    const newStock: Stock = {
      ...stockData,
      id: `stock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    
    data.value.stocks.push(newStock)

    // Create buy transaction
    const { grossAmount, brokerageTotal, netAmount } = calculateNetAmount(
      stockData.quantity,
      stockData.tradePrice,
      data.value.brokerageConfig,
      'buy'
    )

    const transaction: Transaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'buy',
      stockId: newStock.id,
      stockName: newStock.name,
      quantity: stockData.quantity,
      price: stockData.tradePrice,
      totalAmount: grossAmount,
      brokerage: brokerageTotal,
      netAmount,
      date: new Date().toISOString(),
      purpose: 'reinvest',
      linkedBuyId: sellTransactionId,
      notes: 'Purchased using proceeds from stock sale',
      costPerShare: stockData.tradePrice,
      costTotal: grossAmount,
      realizedPnL: 0
    }

    data.value.transactions.push(transaction)
    await saveAppData()
    
    return { stock: newStock, transaction }
  }

  const updateBrokerageConfig = async (config: Partial<typeof data.value.brokerageConfig>) => {
    data.value.brokerageConfig = { ...data.value.brokerageConfig, ...config }
    await saveAppData()
  }

  // Update transaction purpose/notes
  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const idx = data.value.transactions.findIndex(t => t.id === id)
    if (idx !== -1) {
      data.value.transactions[idx] = { ...data.value.transactions[idx]!, ...updates }
      await saveAppData()
    }
  }

  // Revert a sell transaction: restore quantities back to the original stock (by stockId)
  const revertTransaction = async (id: string): Promise<boolean> => {
    const txn = data.value.transactions.find(t => t.id === id)
    if (!txn || txn.reverted) return false
    if (txn.type !== 'sell') return false

    const stock = data.value.stocks.find((s: Stock) => s.id === txn.stockId)
    if (!stock) return false

    // Restore quantity and paid proportionally using average cost at the time of sale
    const originalQty = stock.quantity
    const originalPaid = stock.paid

    const newQuantity = originalQty + txn.quantity
    const avgCostPerShare = originalQty > 0 ? originalPaid / originalQty : txn.price
    const restoredPaid = avgCostPerShare * txn.quantity

    const newPaid = originalPaid + restoredPaid
    const newValue = newQuantity * stock.currentPrice
    const newProfitLoss = newValue - newPaid

    // Mark transaction as reverted
    txn.reverted = true
    txn.revertedAt = new Date().toISOString()

    // Update stock back
    await updateStock(stock.id, {
      quantity: newQuantity,
      paid: newPaid,
      value: newValue,
      profitLoss: newProfitLoss,
      status: 'active'
    })

    await saveAppData()
    return true
  }

  // Delete a transaction (does not auto-revert; use revertTransaction for sells)
  const deleteTransaction = async (id: string): Promise<boolean> => {
    const before = data.value.transactions.length
    data.value.transactions = data.value.transactions.filter(t => t.id !== id)
    await saveAppData()
    return data.value.transactions.length < before
  }

  return {
    data,
    refreshData,
    saveAppData,
    addStock,
    updateStock,
    deleteStock,
    addLoan,
    updateLoan,
    markEMIPaid,
    addTransaction,
    sellStocksForEMI,
    sellStock,
    getActiveLotsByName,
    getAggregateByName,
    sellStockByName,
    buyStockWithProceeds,
    updateBrokerageConfig,
    updateTransaction,
    revertTransaction,
    deleteTransaction
  }
}

