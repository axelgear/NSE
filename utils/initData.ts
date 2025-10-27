import type { AppData } from '~/types'

export const initialData: AppData = {
  stocks: [
    {
      id: 'stock-1',
      name: 'Tata Gold Exchange Traded Fund',
      symbol: 'TGOLDETF',
      paid: 11030,
      tradePrice: 11.03,
      quantity: 1000,
      currentPrice: 11.96,
      value: 11960,
      profitLoss: 930,
      status: 'active',
      purchaseDate: '2024-01-15T00:00:00.000Z'
    },
    {
      id: 'stock-2',
      name: 'Tata Gold Exchange Traded Fund',
      symbol: 'TGOLDETF',
      paid: 231800,
      tradePrice: 11.59,
      quantity: 20000,
      currentPrice: 11.97,
      value: 239400,
      profitLoss: 7600,
      status: 'active',
      purchaseDate: '2024-02-10T00:00:00.000Z'
    },
    {
      id: 'stock-3',
      name: 'Tata Gold Exchange Traded Fund',
      symbol: 'TGOLDETF',
      paid: 245244.4,
      tradePrice: 11.59,
      quantity: 21160,
      currentPrice: 11.96,
      value: 253073.6,
      profitLoss: 7829.2,
      status: 'active',
      purchaseDate: '2024-03-05T00:00:00.000Z'
    },
    {
      id: 'stock-4',
      name: 'Ather Energy',
      symbol: 'ATHERENERGY',
      paid: 22154.55,
      tradePrice: 671.35,
      quantity: 33,
      currentPrice: 743.35,
      value: 24530.55,
      profitLoss: 2376,
      status: 'active',
      purchaseDate: '2024-04-12T00:00:00.000Z'
    },
    {
      id: 'stock-5',
      name: 'Ather Energy',
      symbol: 'ATHERENERGY',
      paid: 16243.2,
      tradePrice: 676.8,
      quantity: 24,
      currentPrice: 743.35,
      value: 17840.4,
      profitLoss: 1597.2,
      status: 'active',
      purchaseDate: '2024-05-08T00:00:00.000Z'
    },
    {
      id: 'stock-6',
      name: 'Ather Energy',
      symbol: 'ATHERENERGY',
      paid: 387819.04,
      tradePrice: 682.78,
      quantity: 568,
      currentPrice: 743.35,
      value: 422222.8,
      profitLoss: 34403.76,
      status: 'active',
      purchaseDate: '2024-06-20T00:00:00.000Z'
    },
    {
      id: 'stock-7',
      name: 'Ather Energy',
      symbol: 'ATHERENERGY',
      paid: 238280.25,
      tradePrice: 733.17,
      quantity: 325,
      currentPrice: 743.35,
      value: 241588.75,
      profitLoss: 3308.5,
      status: 'active',
      purchaseDate: '2024-07-15T00:00:00.000Z'
    },
    {
      id: 'stock-8',
      name: 'Ather Energy',
      symbol: 'ATHERENERGY',
      paid: 263934,
      tradePrice: 733.15,
      quantity: 360,
      currentPrice: 743.35,
      value: 267606,
      profitLoss: 3672,
      status: 'active',
      purchaseDate: '2024-08-10T00:00:00.000Z'
    }
  ],
  loans: [
    {
      id: 'loan-1',
      name: 'LOAN 1',
      principalAmount: 511911.28,
      totalEMI: 511911.28,
      emiPerMonth: 85427,
      startDate: '2024-01-01T00:00:00.000Z',
      paymentsSchedule: [
        {
          month: 1,
          emiAmount: 85427,
          principalRemaining: 426484.28,
          paid: false
        },
        {
          month: 2,
          emiAmount: 85427,
          principalRemaining: 341057.28,
          paid: false
        },
        {
          month: 3,
          emiAmount: 85427,
          principalRemaining: 255630.28,
          paid: false
        },
        {
          month: 4,
          emiAmount: 85427,
          principalRemaining: 170203.28,
          paid: false
        },
        {
          month: 5,
          emiAmount: 85427,
          principalRemaining: 84776.28,
          paid: false
        },
        {
          month: 6,
          emiAmount: 84776.28,
          principalRemaining: 0,
          paid: false
        }
      ]
    },
    {
      id: 'loan-2',
      name: 'LOAN 2',
      principalAmount: 436980,
      totalEMI: 436980,
      emiPerMonth: 36670,
      startDate: '2024-01-01T00:00:00.000Z',
      paymentsSchedule: [
        {
          month: 1,
          emiAmount: 36670,
          principalRemaining: 400310,
          paid: false
        },
        {
          month: 2,
          emiAmount: 36670,
          principalRemaining: 363640,
          paid: false
        },
        {
          month: 3,
          emiAmount: 36670,
          principalRemaining: 326970,
          paid: false
        },
        {
          month: 4,
          emiAmount: 36670,
          principalRemaining: 290300,
          paid: false
        },
        {
          month: 5,
          emiAmount: 36670,
          principalRemaining: 253630,
          paid: false
        },
        {
          month: 6,
          emiAmount: 36670,
          principalRemaining: 216960,
          paid: false
        },
        {
          month: 7,
          emiAmount: 36670,
          principalRemaining: 180290,
          paid: false
        },
        {
          month: 8,
          emiAmount: 36670,
          principalRemaining: 143620,
          paid: false
        },
        {
          month: 9,
          emiAmount: 36670,
          principalRemaining: 106950,
          paid: false
        },
        {
          month: 10,
          emiAmount: 36670,
          principalRemaining: 70280,
          paid: false
        },
        {
          month: 11,
          emiAmount: 36670,
          principalRemaining: 33610,
          paid: false
        },
        {
          month: 12,
          emiAmount: 33610,
          principalRemaining: 0,
          paid: false
        }
      ]
    }
  ],
  transactions: [],
  brokerageConfig: {
    buyRate: 0.05,
    sellRate: 0.05,
    minCharge: 20,
    maxCharge: 20,
    sttBuy: 0.1,
    sttSell: 0.025,
    exchangeCharges: 0.00297,
    sebiCharges: 0.00001,
    gst: 18,
    stampDutyBuy: 0.015,
    stampDutySell: 0.003
  },
  lastUpdated: new Date().toISOString()
}

