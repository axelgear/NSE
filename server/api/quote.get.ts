export default defineEventHandler(async (event) => {
  const { symbol } = getQuery(event)
  if (!symbol || typeof symbol !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'symbol is required' })
  }

  const upstream = `https://www.nseindia.com/api/quote-equity?symbol=${encodeURIComponent(symbol)}`
  try {
    const res = await fetch(upstream, {
      headers: {
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'referer': 'https://www.nseindia.com/',
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9'
      }
    })
    if (!res.ok) throw new Error(`Upstream ${res.status}`)
    const data: any = await res.json()
    const p = data?.priceInfo || {}
    const ihl = p?.intraDayHighLow || {}
    const out = {
      symbol,
      last_price: Number(p?.lastPrice ?? 0),
      change: Number(p?.change ?? 0),
      percent_change: Number(p?.pChange ?? 0),
      day_high: Number(ihl?.max ?? 0),
      day_low: Number(ihl?.min ?? 0),
      volume: Number(data?.preOpenMarket?.totalTradedVolume ?? data?.securityWiseDP?.quantityTraded ?? 0),
      last_update: data?.metadata?.lastUpdateTime || new Date().toISOString()
    }
    return { success: true, data: out }
  } catch (err: any) {
    // Fallback: parse from the get-quotes HTML page
    try {
      const pageUrl = `https://www.nseindia.com/get-quotes/equity?symbol=${encodeURIComponent(symbol)}`
      const htmlRes = await fetch(pageUrl, {
        headers: {
          'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'referer': 'https://www.nseindia.com/',
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.9'
        }
      })
      if (!htmlRes.ok) throw new Error(`Fallback page ${htmlRes.status}`)
      const html = await htmlRes.text()
      // Try to find the specific block for the requested symbol, then priceInfo.lastPrice
      const symBlock = new RegExp(`"symbol"\s*:\s*"${symbol}"[\s\S]{0,2000}?"priceInfo"\s*:\s*\{[\s\S]*?"lastPrice"\s*:\s*"?([\d,]+(?:\.\d+)?)"?`, 'i')
      let m = html.match(symBlock)
      if (!m) {
        // fallback: any lastPrice (less reliable)
        m = html.match(/"priceInfo"\s*:\s*\{[\s\S]*?"lastPrice"\s*:\s*"?([\d,]+(?:\.\d+)?)"?/i)
      }
      const lastPrice = m ? Number((m[1] || '0').replace(/,/g, '')) : 0
      if (!lastPrice) throw new Error('No lastPrice in page')
      const out = {
        symbol,
        last_price: lastPrice,
        change: 0,
        percent_change: 0,
        day_high: 0,
        day_low: 0,
        volume: 0,
        last_update: new Date().toISOString()
      }
      return { success: true, data: out }
    } catch (fbErr) {
      console.error('quote fallback error:', fbErr)
      throw createError({ statusCode: 502, statusMessage: 'Failed to fetch quote' })
    }
  }
})


