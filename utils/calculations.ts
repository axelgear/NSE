import type { BrokerageConfig, Stock, BrokerageBreakdown, Loan, EMIPayment } from '~/types'

/**
 * Calculate brokerage using Indian market standard formula
 * Formula: max(min(rate% * Trade Value, maxCharge), minCharge)
 * Based on Indian stock market regulations and broker practices
 */
export const calculateBrokerage = (
  amount: number,
  config: BrokerageConfig,
  type: 'buy' | 'sell'
): { brokerage: number; gst: number; total: number } => {
  const rate = type === 'buy' ? config.buyRate : config.sellRate
  
  // Calculate brokerage using the standard formula:
  // max(min(rate% * Trade Value, maxCharge), minCharge)
  const calculatedBrokerage = (amount * rate) / 100
  const brokerage = Math.max(Math.min(calculatedBrokerage, config.maxCharge), config.minCharge)
  
  // GST is applied on brokerage
  const gst = (brokerage * config.gst) / 100
  const total = brokerage + gst
  
  return {
    brokerage: parseFloat(brokerage.toFixed(2)),
    gst: parseFloat(gst.toFixed(2)),
    total: parseFloat(total.toFixed(2))
  }
}

/**
 * Calculate complete brokerage breakdown with all charges
 * Based on Indian stock market regulations and standard broker practices
 * 
 * Charges included:
 * 1. Brokerage: max(min(rate% * turnover, maxCharge), minCharge)
 * 2. STT: 0.1% of total turnover (rounded to rupee)
 * 3. Exchange charges: per exchange rate on total turnover
 * 4. SEBI charges: 0.0001% of total turnover
 * 5. IPFT (NSE): 0.0001% of total turnover
 * 6. GST: 18% on (brokerage + exchange + SEBI + IPFT)
 * 7. Stamp duty: 0.015% of buy value (buy only), rounded to rupee
 */
export const calculateDetailedBrokerage = (
  quantity: number,
  price: number,
  config: BrokerageConfig,
  type: 'buy' | 'sell'
): BrokerageBreakdown => {
  const turnover = quantity * price
  
  // 1. Brokerage charges using correct formula: max(min(rate% * turnover, maxCharge), minCharge)
  const rate = type === 'buy' ? config.buyRate : config.sellRate
  const calculatedBrokerage = (turnover * rate) / 100
  const brokerage = Math.max(Math.min(calculatedBrokerage, config.maxCharge), config.minCharge)
  
  // 2. STT (Securities Transaction Tax) on total turnover (nearest rupee)
  const stt = Math.round((turnover * 0.1) / 100)
  
  // 3. Exchange Transaction Charges (NSE/BSE charges)
  const exchangeCharges = (turnover * config.exchangeCharges) / 100
  
  // 4. SEBI Charges (Regulatory turnover fees)
  const sebiCharges = (turnover * config.sebiCharges) / 100

  // 5. IPFT (NSE) charges (optional in config); default 0 if not set
  const ipft = (turnover * (config.ipftCharges || 0)) / 100
  
  // 6. Stamp Duty - on buy value only, nearest rupee
  const stampDutyRate = type === 'buy' ? config.stampDutyBuy : 0
  const stampDuty = Math.round((turnover * stampDutyRate) / 100)
  
  // 7. GST (18% on brokerage + exchange + sebi + ipft)
  const gstBase = brokerage + exchangeCharges + sebiCharges + ipft
  const gst = (gstBase * config.gst) / 100
  
  // Total charges
  const totalCharges = brokerage + stt + exchangeCharges + sebiCharges + ipft + gst + stampDuty
  
  // Net amount (for buy: turnover + charges, for sell: turnover - charges)
  const netAmount = type === 'buy' ? turnover + totalCharges : turnover - totalCharges
  
  return {
    turnover: parseFloat(turnover.toFixed(2)),
    brokerage: parseFloat(brokerage.toFixed(2)),
    stt: parseFloat(stt.toFixed(2)),
    exchangeCharges: parseFloat(exchangeCharges.toFixed(2)),
    sebiCharges: parseFloat(sebiCharges.toFixed(2)),
    ipft: parseFloat(ipft.toFixed(2)),
    gst: parseFloat(gst.toFixed(2)),
    stampDuty: parseFloat(stampDuty.toFixed(2)),
    totalCharges: parseFloat(totalCharges.toFixed(2)),
    netAmount: parseFloat(netAmount.toFixed(2))
  }
}

export const calculateNetAmount = (
  quantity: number,
  price: number,
  config: BrokerageConfig,
  type: 'buy' | 'sell'
): { grossAmount: number; brokerageTotal: number; netAmount: number } => {
  const breakdown = calculateDetailedBrokerage(quantity, price, config, type)
  
  return {
    grossAmount: breakdown.turnover,
    brokerageTotal: breakdown.totalCharges,
    netAmount: breakdown.netAmount
  }
}

export const calculatePortfolioValue = (stocks: Stock[]): {
  totalInvested: number
  currentValue: number
  profitLoss: number
  profitLossPercent: number
} => {
  const activeStocks = stocks.filter(s => s.status === 'active')
  const totalInvested = activeStocks.reduce((sum, stock) => sum + stock.paid, 0)
  const currentValue = activeStocks.reduce((sum, stock) => sum + stock.value, 0)
  const profitLoss = currentValue - totalInvested
  const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0
  
  return {
    totalInvested: parseFloat(totalInvested.toFixed(2)),
    currentValue: parseFloat(currentValue.toFixed(2)),
    profitLoss: parseFloat(profitLoss.toFixed(2)),
    profitLossPercent: parseFloat(profitLossPercent.toFixed(2))
  }
}

export const calculateEMIRequired = (loans: any[]): {
  totalEMI: number
  paidEMI: number
  pendingEMI: number
  nextEMIAmount: number
} => {
  let totalEMI = 0
  let paidEMI = 0
  let nextEMIAmount = 0
  let foundNext = false
  
  loans.forEach(loan => {
    loan.paymentsSchedule.forEach((payment: any) => {
      totalEMI += payment.emiAmount
      if (payment.paid) {
        paidEMI += payment.emiAmount
      } else if (!foundNext) {
        nextEMIAmount = payment.emiAmount
        foundNext = true
      }
    })
  })
  
  const pendingEMI = totalEMI - paidEMI
  
  return {
    totalEMI: parseFloat(totalEMI.toFixed(2)),
    paidEMI: parseFloat(paidEMI.toFixed(2)),
    pendingEMI: parseFloat(pendingEMI.toFixed(2)),
    nextEMIAmount: parseFloat(nextEMIAmount.toFixed(2))
  }
}

/**
 * Calculate upcoming EMI consolidated for the nearest due date across all loans
 * - Groups all unpaid payments by dueDate
 * - Picks the earliest dueDate (>= today if present, otherwise earliest unpaid overall)
 * - Returns the sum of EMIs due on that date and the count of loans
 */
export const calculateUpcomingEMI = (loans: Loan[], today: Date = new Date()): {
  totalAmount: number
  count: number
  date: string | null
  items: { loanId: string; loanName: string; month: number; amount: number }[]
} => {
  type DueItem = { loan: Loan; p: EMIPayment; due: Date }
  const dueItems: DueItem[] = []

  const getDueFor = (loan: Loan, payment: EMIPayment): Date => {
    if (payment.dueDate) return new Date(payment.dueDate)
    const start = loan.startDate ? new Date(loan.startDate) : new Date()
    const payDay = loan.paymentDay || 3
    const base = new Date(start)
    base.setMonth(base.getMonth() + (payment.month - 1))
    return new Date(base.getFullYear(), base.getMonth(), Math.min(payDay, 28))
  }

  for (const loan of loans) {
    for (const p of loan.paymentsSchedule) {
      if (!p.paid) {
        dueItems.push({ loan, p, due: getDueFor(loan, p) })
      }
    }
  }

  if (dueItems.length === 0) {
    return { totalAmount: 0, count: 0, date: null, items: [] }
  }

  // Find the earliest due date that is >= today, else earliest overall
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const futureOrToday = dueItems.filter(d => d.due >= todayStart)
  const pool = futureOrToday.length > 0 ? futureOrToday : dueItems
  pool.sort((a, b) => a.due.getTime() - b.due.getTime())
  const firstDate = pool[0]!.due
  const sameDay = pool.filter(d => d.due && d.due.getFullYear() === firstDate.getFullYear() && d.due.getMonth() === firstDate.getMonth() && d.due.getDate() === firstDate.getDate())

  const totalAmount = sameDay.reduce((sum, d) => sum + d.p.emiAmount, 0)
  const items = sameDay.map(d => ({ loanId: d.loan.id, loanName: d.loan.name, month: d.p.month, amount: d.p.emiAmount || 0 }))

  return {
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    count: sameDay.length,
    date: firstDate.toISOString(),
    items
  }
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount)
}

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Test function to verify brokerage calculation matches the provided example
 * Example: Ria buys 20 shares at ₹2000 each and sells at ₹2100 each
 * Expected brokerage: ₹20 for buy + ₹20 for sell = ₹40 total
 */
export const testBrokerageCalculation = (): {
  buyBrokerage: number;
  sellBrokerage: number;
  totalBrokerage: number;
  isCorrect: boolean;
} => {
  // Test configuration matching the example
  const testConfig: BrokerageConfig = {
    buyRate: 0.1,           // 0.1%
    sellRate: 0.1,          // 0.1%
    minCharge: 5,           // ₹5 minimum
    maxCharge: 20,          // ₹20 maximum
    sttBuy: 0.1,
    sttSell: 0.025,
    exchangeCharges: 0.00297,
    sebiCharges: 0.00001,
    gst: 18,
    stampDutyBuy: 0.015,
    stampDutySell: 0.003
  };

  // Ria's transaction details
  const quantity = 20;
  const buyPrice = 2000;
  const sellPrice = 2100;

  // Calculate buy brokerage
  const buyTurnover = quantity * buyPrice; // 40,000
  const buyBrokerageCalc = calculateBrokerage(buyTurnover, testConfig, 'buy');
  
  // Calculate sell brokerage  
  const sellTurnover = quantity * sellPrice; // 42,000
  const sellBrokerageCalc = calculateBrokerage(sellTurnover, testConfig, 'sell');

  const totalBrokerage = buyBrokerageCalc.brokerage + sellBrokerageCalc.brokerage;
  
  // Expected result from the example: ₹20 + ₹20 = ₹40
  const isCorrect = (buyBrokerageCalc.brokerage === 20) && 
                   (sellBrokerageCalc.brokerage === 20) && 
                   (totalBrokerage === 40);

  return {
    buyBrokerage: buyBrokerageCalc.brokerage,
    sellBrokerage: sellBrokerageCalc.brokerage,
    totalBrokerage,
    isCorrect
  };
}

