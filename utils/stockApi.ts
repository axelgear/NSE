import type { StockPriceData } from '~/types'

const API_BASE_URL = ''

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

export interface LocalSymbolEntry {
  symbol: string
  name: string
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
    const response = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`)
    const data = await response.json()
    if (data?.success && data?.data) return data.data as StockPriceData
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
export const getStockSymbolSuggestions = async (stockName: string): Promise<string> => {
  const normalized = stockName.toLowerCase().trim()
  try {
    // Load and cache directly from the raw CSV at /public/EQUITY_L.csv
    if (typeof window !== 'undefined') {
      // cache in memory
      // @ts-ignore - attach to window to reuse across calls
      if (!window.__symbol_list_cache) {
        const csvRes = await fetch('/EQUITY_L.csv')
        if (!csvRes.ok) return ''
        const csvText = await csvRes.text()
        const list = parseEquityCsv(csvText)
        // @ts-ignore
        window.__symbol_list_cache = list
      }
      // @ts-ignore
      const list: LocalSymbolEntry[] = window.__symbol_list_cache || []
      const hit = list.find(e => (e.name ?? '').toLowerCase() === normalized) || list.find(e => (e.name ?? '').toLowerCase().includes(normalized))
      return hit ? String(hit.symbol || '') : ''
    }
  } catch (e) {
    console.warn('Local symbol suggestion failed:', e)
  }
  return ''
}

// Minimal CSV parser specific to NSE equity list
const parseEquityCsv = (csv: string): LocalSymbolEntry[] => {
  const lines = csv.split(/\r?\n/).filter(Boolean)
  if (lines.length === 0) return []
  const header: string[] = splitCsvLine(lines[0]).map((h: string) => (h ?? '').trim().toLowerCase())
  const symbolIdx: number = header.findIndex((h: string) => (h || '') === 'symbol')
  const nameIdx: number = header.findIndex((h: string) => ['name of company', 'name', 'company name'].some(k => k === (h || '')))
  if (symbolIdx === -1 || nameIdx === -1) return []
  const entries: LocalSymbolEntry[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i])
    const symbol = (cols[symbolIdx] || '').trim()
    const name = (cols[nameIdx] || '').trim()
    if (symbol && name) entries.push({ symbol, name })
  }
  return entries
}

// Split a CSV line by commas while respecting quotes
const splitCsvLine = (line: string): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { // escaped quote
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

/**
 * Return a list of local symbol suggestions (symbol + name) for a query.
 */
export const searchLocalSymbols = async (query: string, limit = 10): Promise<LocalSymbolEntry[]> => {
  const q = query.toLowerCase().trim()
  if (!q) return []
  // @ts-ignore
  const cache: LocalSymbolEntry[] = (typeof window !== 'undefined' && window.__symbol_list_cache) ? window.__symbol_list_cache : []
  let list: LocalSymbolEntry[] = cache
  if (list.length === 0 && typeof window !== 'undefined') {
    const csvRes = await fetch('/EQUITY_L.csv')
    if (!csvRes.ok) return []
    const csvText = await csvRes.text()
    list = parseEquityCsv(csvText)
    // @ts-ignore
    window.__symbol_list_cache = list
  }
  return list
    .filter(e => (e.symbol || '').toLowerCase().includes(q) || (e.name || '').toLowerCase().includes(q))
    .slice(0, limit)
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

