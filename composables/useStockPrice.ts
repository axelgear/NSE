import type { Stock } from '~/types'
import { fetchStockPrice, fetchMultipleStockPrices, getStockSymbolSuggestions, searchLocalSymbols } from '~/utils/stockApi'

export const useStockPrice = () => {
  const { data, updateStock, saveAppData } = useAppData()

  /**
   * Update current price for a single stock from API
   */
  const updateStockPriceFromAPI = async (stockId: string) => {
    const stock = data.value.stocks.find((s: Stock) => s.id === stockId)
    if (!stock || !stock.symbol) {
      throw new Error('Stock not found or no symbol specified')
    }

    const priceData = await fetchStockPrice(stock.symbol)
    if (priceData) {
      const newValue = stock.quantity * priceData.last_price
      const newProfitLoss = newValue - stock.paid

      updateStock(stockId, {
        currentPrice: priceData.last_price,
        value: newValue,
        profitLoss: newProfitLoss
      })

      // Update cache
      if (!data.value.priceCache) {
        data.value.priceCache = {}
      }
      data.value.priceCache[stock.symbol] = priceData
      saveAppData()

      return priceData
    }

    return null
  }

  /**
   * Sync price across all stocks with the same name
   * When one stock price is updated, update all stocks with the same name
   */
  const syncPriceAcrossStocks = (stockName: string, newPrice: number) => {
    const matchingStocks = data.value.stocks.filter(
      (s: Stock) => s.name.toLowerCase() === stockName.toLowerCase() && s.status === 'active'
    )

    matchingStocks.forEach((stock: Stock) => {
      const newValue = stock.quantity * newPrice
      const newProfitLoss = newValue - stock.paid

      updateStock(stock.id, {
        currentPrice: newPrice,
        value: newValue,
        profitLoss: newProfitLoss
      })
    })

    saveAppData()
  }

  /**
   * Update all stocks that share the same symbol from API
   */
  const updateAllStocksBySymbol = async (symbol: string) => {
    const priceData = await fetchStockPrice(symbol)
    if (!priceData) return null

    const matchingStocks = data.value.stocks.filter(
      (s: Stock) => s.symbol === symbol && s.status === 'active'
    )

    matchingStocks.forEach((stock: Stock) => {
      const newValue = stock.quantity * priceData.last_price
      const newProfitLoss = newValue - stock.paid

      updateStock(stock.id, {
        currentPrice: priceData.last_price,
        value: newValue,
        profitLoss: newProfitLoss
      })
    })

    // Update cache
    if (!data.value.priceCache) {
      data.value.priceCache = {}
    }
    data.value.priceCache[symbol] = priceData
    saveAppData()

    return priceData
  }

  /**
   * Update all stocks from API (batch update)
   */
  const updateAllStockPrices = async () => {
    const uniqueSymbols = [...new Set(
      data.value.stocks
        .filter((s: Stock) => s.symbol && s.status === 'active')
        .map((s: Stock) => s.symbol as string)
    )] as string[]

    if (uniqueSymbols.length === 0) {
      throw new Error('No stocks with symbols to update')
    }

    const priceData = await fetchMultipleStockPrices(uniqueSymbols)

    // Update all matching stocks
    Object.entries(priceData).forEach(([symbol, price]) => {
      const matchingStocks = data.value.stocks.filter(
        (s: Stock) => s.symbol === symbol && s.status === 'active'
      )

      matchingStocks.forEach((stock: Stock) => {
        const newValue = stock.quantity * price.last_price
        const newProfitLoss = newValue - stock.paid

        updateStock(stock.id, {
          currentPrice: price.last_price,
          value: newValue,
          profitLoss: newProfitLoss
        })
      })
    })

    // Update cache
    data.value.priceCache = { ...data.value.priceCache, ...priceData }
    saveAppData()

    return priceData
  }

  /**
   * Get suggested symbol for a stock name
   */
  const getSuggestedSymbol = async (stockName: string): Promise<string> => {
    return await getStockSymbolSuggestions(stockName)
  }

  const searchSymbols = async (query: string) => {
    return await searchLocalSymbols(query)
  }

  /**
   * Get cached price for a symbol
   */
  const getCachedPrice = (symbol: string) => {
    return data.value.priceCache?.[symbol] || null
  }

  /**
   * Get unique stock names (for grouping)
   */
  const getUniqueStockNames = computed(() => {
    return [...new Set(data.value.stocks.map((s: Stock) => s.name))]
  })

  /**
   * Get all stocks with the same name
   */
  const getStocksByName = (stockName: string) => {
    return data.value.stocks.filter(
      (s: Stock) => s.name.toLowerCase() === stockName.toLowerCase()
    )
  }

  return {
    updateStockPriceFromAPI,
    syncPriceAcrossStocks,
    updateAllStocksBySymbol,
    updateAllStockPrices,
    getSuggestedSymbol,
    searchSymbols,
    getCachedPrice,
    getUniqueStockNames,
    getStocksByName
  }
}

