import type { AppData, Stock, Loan, Transaction } from '~/types'
import { loadData, saveData } from '~/utils/storage'
import { calculateNetAmount } from '~/utils/calculations'

export const useAppData = () => {
  const data = useState<AppData>('appData', () => loadData())

  const refreshData = () => {
    data.value = loadData()
  }

  const saveAppData = () => {
    saveData(data.value)
  }

  // Stock operations
  const addStock = (stock: Omit<Stock, 'id'>) => {
    const newStock: Stock = {
      id: `stock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...stock
    }
    data.value.stocks.push(newStock)
    saveAppData()
  }

  const updateStock = (id: string, updates: Partial<Omit<Stock, 'id'>>) => {
    const index = data.value.stocks.findIndex(s => s.id === id)
    if (index !== -1) {
      const currentStock = data.value.stocks[index]!
      data.value.stocks[index] = { ...currentStock, ...updates, id: currentStock.id } as Stock
      saveAppData()
    }
  }

  const deleteStock = (id: string) => {
    data.value.stocks = data.value.stocks.filter(s => s.id !== id)
    saveAppData()
  }

  // Loan operations
  const addLoan = (loan: Omit<Loan, 'id'>) => {
    const newLoan: Loan = {
      id: `loan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...loan
    }
    data.value.loans.push(newLoan)
    saveAppData()
  }

  const updateLoan = (id: string, updates: Partial<Omit<Loan, 'id'>>) => {
    const index = data.value.loans.findIndex(l => l.id === id)
    if (index !== -1) {
      const currentLoan = data.value.loans[index]!
      data.value.loans[index] = { ...currentLoan, ...updates, id: currentLoan.id } as Loan
      saveAppData()
    }
  }

  const markEMIPaid = (loanId: string, month: number, stocksSold: string[] = []) => {
    const loan = data.value.loans.find(l => l.id === loanId)
    if (loan) {
      const payment = loan.paymentsSchedule.find(p => p.month === month)
      if (payment) {
        payment.paid = true
        payment.paidDate = new Date().toISOString()
        payment.stocksSold = stocksSold
        saveAppData()
      }
    }
  }

  // Transaction operations
  const addTransaction = (
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
      notes
    }

    data.value.transactions.push(transaction)
    saveAppData()
    return transaction
  }

  // Sell stocks to pay EMI
  const sellStocksForEMI = (
    stockId: string,
    quantity: number,
    price: number,
    loanId: string,
    emiMonth: number
  ) => {
    const stock = data.value.stocks.find(s => s.id === stockId)
    if (!stock) return null

    // Create transaction with EMI purpose
    const transaction = addTransaction('sell', stockId, stock.name, quantity, price, loanId, emiMonth, 'emi')

    // Update stock
    const soldQty = (stock.soldQuantity || 0) + quantity
    
    if (stock.quantity === quantity) {
      updateStock(stockId, {
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
      
      updateStock(stockId, {
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
  const sellStock = (
    stockId: string,
    quantity: number,
    price: number,
    purpose: 'reinvest' | 'profit' | 'other' = 'other',
    notes?: string
  ) => {
    const stock = data.value.stocks.find(s => s.id === stockId)
    if (!stock) return null

    // Create transaction
    const transaction = addTransaction('sell', stockId, stock.name, quantity, price, undefined, undefined, purpose, undefined, notes)

    // Update stock
    const soldQty = (stock.soldQuantity || 0) + quantity
    
    if (stock.quantity === quantity) {
      updateStock(stockId, {
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
      
      updateStock(stockId, {
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

  // Buy stock using proceeds from another sale
  const buyStockWithProceeds = (
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
      notes: 'Purchased using proceeds from stock sale'
    }

    data.value.transactions.push(transaction)
    saveAppData()
    
    return { stock: newStock, transaction }
  }

  const updateBrokerageConfig = (config: Partial<typeof data.value.brokerageConfig>) => {
    data.value.brokerageConfig = { ...data.value.brokerageConfig, ...config }
    saveAppData()
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
    buyStockWithProceeds,
    updateBrokerageConfig
  }
}

