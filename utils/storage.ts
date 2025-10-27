import type { AppData } from '~/types'

export const defaultData: AppData = {
  stocks: [],
  loans: [],
  transactions: [],
  brokerageConfig: {
    buyRate: 0.1,           // 0.1% brokerage on buy (as per example)
    sellRate: 0.1,          // 0.1% brokerage on sell (as per example)
    minCharge: 2,           // Minimum ₹2 per side (Groww delivery)
    maxCharge: 20,          // Maximum ₹20 per order (as per example)
    sttBuy: 0.1,            // 0.1% STT on buy (delivery)
    sttSell: 0.025,         // 0.025% STT on sell (delivery)
    exchangeCharges: 0.00297, // 0.00297% exchange charges
    sebiCharges: 0.00001,   // 0.00001% SEBI turnover fees
    ipftCharges: 0.0001,    // 0.0001% IPFT (NSE) of turnover
    gst: 18,                // 18% GST on brokerage + transaction charges
    stampDutyBuy: 0.015,    // 0.015% stamp duty on buy
    stampDutySell: 0.003    // 0.003% stamp duty on sell
  },
  lastUpdated: new Date().toISOString()
}

// Save data to server file via API
const saveToFile = async (data: AppData): Promise<boolean> => {
  if (typeof window === 'undefined') return false
  
  try {
    const response = await $fetch<{ success: boolean; message: string; lastUpdated: string }>('/api/data', {
      method: 'POST',
      body: data
    })
    return response.success === true
  } catch (error) {
    console.error('Error saving data to file:', error)
    return false
  }
}

// Load data from server file via API
const loadFromFile = async (): Promise<AppData | null> => {
  if (typeof window === 'undefined') return null
  
  try {
    const response = await $fetch<{ success: boolean; data: AppData } | null>('/api/data', {
      method: 'GET'
    })
    return response?.data || null
  } catch (error) {
    console.error('Error loading data from file:', error)
    return null
  }
}

export const loadData = async (): Promise<AppData> => {
  if (typeof window === 'undefined') return defaultData
  
  try {
    // Load from server file
    const fileData = await loadFromFile()
    if (fileData) return fileData
    
    // If file missing on server, initialize with defaultData and persist to server
    await saveToFile(defaultData)
    return defaultData
  } catch (error) {
    console.error('Error loading data:', error)
    return defaultData
  }
}

export const saveData = async (data: AppData): Promise<void> => {
  if (typeof window === 'undefined') return
  
  try {
    const fileSaved = await saveToFile(data)
    if (!fileSaved) {
      throw new Error('Server save failed')
    }
  } catch (error) {
    console.error('Error saving data:', error)
    throw error
  }
}

// Synchronous version for backward compatibility
export const loadDataSync = (): AppData => {
  if (typeof window === 'undefined') return defaultData
  
  try {
    // No synchronous server read possible – return default skeleton until async refresh
    return defaultData
  } catch (error) {
    console.error('Error loading data synchronously:', error)
  }
  return defaultData
}

export const exportData = async (): Promise<void> => {
  const data = await loadData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `stock-emi-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const importData = async (file: File): Promise<AppData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        await saveData(data)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

