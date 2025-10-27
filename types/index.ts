export interface Stock {
  id: string
  name: string
  symbol?: string  // Stock symbol for API (e.g., ATHERENERGY.NS, TGOLDETF.NS)
  paid: number
  tradePrice: number
  quantity: number
  currentPrice: number
  soldPrice?: number
  soldQuantity?: number  // Track how many were sold
  value: number
  profitLoss: number
  purchaseDate?: string
  soldDate?: string
  status: 'active' | 'sold' | 'partial'
}

export interface EMIPayment {
  month: number
  emiAmount: number
  principalRemaining: number
  paid: boolean
  paidDate?: string
  stocksSold?: string[]
}

export interface Loan {
  id: string
  name: string
  principalAmount: number
  totalEMI: number
  emiPerMonth: number
  paymentsSchedule: EMIPayment[]
  startDate: string
}

export interface Transaction {
  id: string
  type: 'buy' | 'sell'
  stockId: string
  stockName: string
  quantity: number
  price: number
  totalAmount: number
  brokerage: number
  netAmount: number
  date: string
  loanId?: string
  emiMonth?: number
  purpose?: 'emi' | 'reinvest' | 'profit' | 'other'  // Purpose of sale
  linkedBuyId?: string  // If sold to buy another stock, link to new stock purchase
  notes?: string
}

export interface BrokerageConfig {
  buyRate: number           // Brokerage percentage (e.g., 0.05%)
  sellRate: number          // Brokerage percentage (e.g., 0.05%)
  minCharge: number         // Minimum brokerage charge (e.g., ₹20)
  maxCharge: number         // Maximum brokerage charge (e.g., ₹20 per order)
  sttBuy: number            // STT on buy (0.1%)
  sttSell: number           // STT on sell (0.025%)
  exchangeCharges: number   // Exchange charges (0.00297%)
  sebiCharges: number       // SEBI turnover fees (0.00001%)
  gst: number               // GST on brokerage + transaction charges (18%)
  stampDutyBuy: number      // Stamp duty on buy (0.015%)
  stampDutySell: number     // Stamp duty on sell (0.003%)
}

export interface BrokerageBreakdown {
  turnover: number
  brokerage: number
  stt: number
  exchangeCharges: number
  sebiCharges: number
  gst: number
  stampDuty: number
  totalCharges: number
  netAmount: number
}

export interface StockPriceData {
  symbol: string
  last_price: number
  change: number
  percent_change: number
  day_high: number
  day_low: number
  volume: number
  last_update: string
}

export interface AppData {
  stocks: Stock[]
  loans: Loan[]
  transactions: Transaction[]
  brokerageConfig: BrokerageConfig
  lastUpdated: string
  priceCache?: Record<string, StockPriceData>  // Cache API prices
}

