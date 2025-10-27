import type { StockPriceData } from '~/types'

const API_BASE_URL = 'http://nse-api-khaki.vercel.app:5000'

export interface StockApiResponse {
  status: string
  symbol: string
  exchange: string
  ticker: string
  data: {
    company_name: string
    last_price: number
    change: number
    percent_change: number
    previous_close: number
    open: number
    day_high: number
    day_low: number
    year_high: number
    year_low: number
    volume: number
    market_cap: number
    pe_ratio: number
    dividend_yield: number
    last_update: string
    timestamp: string
  }
}

export interface SearchResult {
  symbol: string
  company_name: string
  match_type: string
}

/**
 * Search for stock symbols by company name
 */
export const searchStock = async (query: string): Promise<SearchResult[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`)
    const data = await response.json()
    
    if (data.status === 'success') {
      return data.results || []
    }
    return []
  } catch (error) {
    console.error('Error searching stock:', error)
    return []
  }
}

/**
 * Fetch real-time stock price from NSE/BSE
 * @param symbol - Stock symbol (e.g., 'ATHERENERGY', 'RELIANCE.NS', 'TCS.BO')
 * @returns Stock price data
 */
export const fetchStockPrice = async (symbol: string): Promise<StockPriceData | null> => {
  try {
    // If symbol doesn't have exchange suffix, default to NSE
    const ticker = symbol.includes('.') ? symbol : `${symbol}.NS`
    
    const response = await fetch(`${API_BASE_URL}/stock?symbol=${encodeURIComponent(ticker)}&res=num`)
    const data: StockApiResponse = await response.json()
    
    if (data.status === 'success' && data.data) {
      return {
        symbol: data.symbol,
        last_price: data.data.last_price,
        change: data.data.change,
        percent_change: data.data.percent_change,
        day_high: data.data.day_high,
        day_low: data.data.day_low,
        volume: data.data.volume,
        last_update: data.data.last_update
      }
    }
    
    return null
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error)
    return null
  }
}

/**
 * Fetch prices for multiple stocks in parallel
 */
export const fetchMultipleStockPrices = async (symbols: string[]): Promise<Record<string, StockPriceData>> => {
  const results: Record<string, StockPriceData> = {}
  
  const promises = symbols.map(async (symbol) => {
    const data = await fetchStockPrice(symbol)
    if (data) {
      results[symbol] = data
    }
  })
  
  await Promise.all(promises)
  return results
}

/**
 * Get suggested stock symbols based on common names
 */
export const getStockSymbolSuggestions = (stockName: string): string => {
  const symbolMap: Record<string, string> = {
    'ather energy': 'ATHERENERGY',
    'atherenergy': 'ATHERENERGY',
    'ather': 'ATHERENERGY',
    'tata gold': 'TGOLDETF',
    'tata gold etf': 'TGOLDETF',
    'tata gold exchange traded fund': 'TGOLDETF',
    'reliance': 'RELIANCE',
    'reliance industries': 'RELIANCE',
    'tcs': 'TCS',
    'tata consultancy': 'TCS',
    'infosys': 'INFY',
    'hdfc bank': 'HDFCBANK',
    'icici bank': 'ICICIBANK',
    'itc': 'ITC',
    'wipro': 'WIPRO',
    'bharti airtel': 'BHARTIARTL',
    'airtel': 'BHARTIARTL'
  }
  
  const normalized = stockName.toLowerCase().trim()
  return symbolMap[normalized] || ''
}

/**
 * Validate if a stock symbol exists
 */
export const validateStockSymbol = async (symbol: string): Promise<boolean> => {
  try {
    const data = await fetchStockPrice(symbol)
    return data !== null
  } catch {
    return false
  }
}

