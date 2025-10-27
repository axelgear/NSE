import type { BrokerageConfig, Stock, BrokerageBreakdown } from '~/types'

/**
 * Calculate detailed brokerage breakdown matching Groww's calculation
 * Based on Indian stock market regulations
 */
export const calculateBrokerage = (
  amount: number,
  config: BrokerageConfig,
  type: 'buy' | 'sell'
): { brokerage: number; gst: number; total: number } => {
  const rate = type === 'buy' ? config.buyRate : config.sellRate
  let brokerage = (amount * rate) / 100
  
  // Apply minimum charge
  if (brokerage < config.minCharge) {
    brokerage = config.minCharge
  }
  
  // Apply maximum charge (e.g., ₹20 per order for intraday/delivery)
  if (brokerage > config.maxCharge) {
    brokerage = config.maxCharge
  }
  
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
 * Matches Groww's detailed calculation
 */
export const calculateDetailedBrokerage = (
  quantity: number,
  price: number,
  config: BrokerageConfig,
  type: 'buy' | 'sell'
): BrokerageBreakdown => {
  const turnover = quantity * price
  
  // 1. Brokerage charges
  const rate = type === 'buy' ? config.buyRate : config.sellRate
  let brokerage = (turnover * rate) / 100
  if (brokerage < config.minCharge) brokerage = config.minCharge
  if (brokerage > config.maxCharge) brokerage = config.maxCharge
  
  // 2. STT (Securities Transaction Tax)
  const sttRate = type === 'buy' ? config.sttBuy : config.sttSell
  const stt = (turnover * sttRate) / 100
  
  // 3. Exchange Transaction Charges
  const exchangeCharges = (turnover * config.exchangeCharges) / 100
  
  // 4. SEBI Charges (Turnover Fees)
  const sebiCharges = (turnover * config.sebiCharges) / 100
  
  // 5. Stamp Duty
  const stampDutyRate = type === 'buy' ? config.stampDutyBuy : config.stampDutySell
  const stampDuty = (turnover * stampDutyRate) / 100
  
  // 6. GST (18% on brokerage + transaction charges)
  const gstBase = brokerage + exchangeCharges + sebiCharges
  const gst = (gstBase * config.gst) / 100
  
  // Total charges
  const totalCharges = brokerage + stt + exchangeCharges + sebiCharges + gst + stampDuty
  
  // Net amount (for buy: turnover + charges, for sell: turnover - charges)
  const netAmount = type === 'buy' ? turnover + totalCharges : turnover - totalCharges
  
  return {
    turnover: parseFloat(turnover.toFixed(2)),
    brokerage: parseFloat(brokerage.toFixed(2)),
    stt: parseFloat(stt.toFixed(2)),
    exchangeCharges: parseFloat(exchangeCharges.toFixed(2)),
    sebiCharges: parseFloat(sebiCharges.toFixed(2)),
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

