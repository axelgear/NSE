import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  const SRC_URL = 'https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv'
  try {
    const res = await fetch(SRC_URL, { headers: { 'cache-control': 'no-cache' } })
    if (!res.ok) {
      throw new Error(`Failed to download CSV (${res.status})`)
    }
    const csv = await res.text()
    const target = join(process.cwd(), 'public', 'EQUITY_L.csv')
    await writeFile(target, csv, 'utf8')
    return { success: true, bytes: Buffer.byteLength(csv), saved: target }
  } catch (err: any) {
    console.error('Symbol refresh error:', err)
    throw createError({ statusCode: 500, statusMessage: err?.message || 'Failed to refresh symbols' })
  }
})


