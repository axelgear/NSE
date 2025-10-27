import type { AppData } from '~/types'
import { initialData } from './initData'

const STORAGE_KEY = 'stock-emi-data.json'

export const defaultData: AppData = {
  stocks: [],
  loans: [],
  transactions: [],
  brokerageConfig: {
    buyRate: 0.05,          // 0.05% brokerage on buy
    sellRate: 0.05,         // 0.05% brokerage on sell
    minCharge: 20,          // Minimum ₹20
    maxCharge: 20,          // Maximum ₹20 per order (Groww flat fee)
    sttBuy: 0.1,            // 0.1% STT on buy (delivery)
    sttSell: 0.025,         // 0.025% STT on sell (delivery)
    exchangeCharges: 0.00297, // 0.00297% exchange charges
    sebiCharges: 0.00001,   // 0.00001% SEBI turnover fees
    gst: 18,                // 18% GST on brokerage + transaction charges
    stampDutyBuy: 0.015,    // 0.015% stamp duty on buy
    stampDutySell: 0.003    // 0.003% stamp duty on sell
  },
  lastUpdated: new Date().toISOString()
}

export const loadData = (): AppData => {
  if (typeof window === 'undefined') return defaultData
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    } else {
      // First time loading - use initial data from CSV
      saveData(initialData)
      return initialData
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
  return defaultData
}

export const saveData = (data: AppData): void => {
  if (typeof window === 'undefined') return
  
  try {
    data.lastUpdated = new Date().toISOString()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error saving data:', error)
  }
}

export const exportData = (): void => {
  const data = loadData()
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

export const importData = (file: File): Promise<AppData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        saveData(data)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

