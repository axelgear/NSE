import type { AppData } from '~/types'
import { saveData } from './storage'

/**
 * Force update the configuration to ensure the latest brokerage settings are used
 * This helps resolve caching issues where old localStorage data is being used
 */
export const forceUpdateBrokerageConfig = async (): Promise<void> => {
  if (typeof window === 'undefined') return

  try {
    // Updated configuration with correct values
    const correctConfig = {
      buyRate: 0.1,           // 0.1% brokerage on buy
      sellRate: 0.1,          // 0.1% brokerage on sell  
      minCharge: 5,           // Minimum ₹5 (as per Indian market standards)
      maxCharge: 20,          // Maximum ₹20 per order
      sttBuy: 0.1,            // 0.1% STT on buy (delivery)
      sttSell: 0.025,         // 0.025% STT on sell (delivery)
      exchangeCharges: 0.00297, // 0.00297% exchange charges
      sebiCharges: 0.00001,   // 0.00001% SEBI turnover fees
      gst: 18,                // 18% GST on brokerage + transaction charges
      stampDutyBuy: 0.015,    // 0.015% stamp duty on buy
      stampDutySell: 0.003    // 0.003% stamp duty on sell
    }

    // Get current data from localStorage
    const currentData = localStorage.getItem('stock-emi-data.json')
    
    if (currentData) {
      const data: AppData = JSON.parse(currentData)
      
      // Update the brokerage configuration
      data.brokerageConfig = correctConfig
      
      // Save the updated data
      await saveData(data)
      
      console.log('✅ Brokerage configuration updated successfully!')
      console.log('New configuration:', correctConfig)
      
      // Force page reload to ensure changes are applied
      if (confirm('Configuration updated! The page will reload to apply changes.')) {
        window.location.reload()
      }
    } else {
      console.log('No data found in localStorage')
    }
  } catch (error) {
    console.error('Error updating brokerage configuration:', error)
  }
}

/**
 * Check if the current configuration needs updating
 */
export const checkConfigurationVersion = (): boolean => {
  if (typeof window === 'undefined') return false

  try {
    const currentData = localStorage.getItem('stock-emi-data.json')
    if (!currentData) return false

    const data: AppData = JSON.parse(currentData)
    const config = data.brokerageConfig

    // Check if configuration matches expected values
    const isCorrect = (
      config.buyRate === 0.1 &&
      config.sellRate === 0.1 &&
      config.minCharge === 5 &&
      config.maxCharge === 20
    )

    return isCorrect
  } catch (error) {
    console.error('Error checking configuration:', error)
    return false
  }
}
