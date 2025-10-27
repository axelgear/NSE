<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Stock & EMI Dashboard</h1>
            <p class="text-sm text-gray-500 mt-1">Manage your portfolio and loan EMI payments</p>
          </div>
          <div class="flex gap-3">
            <button
              @click="updateAllPrices"
              :disabled="updatingAllPrices"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Icon :name="updatingAllPrices ? 'mdi:loading' : 'mdi:cloud-sync'" :class="updatingAllPrices ? 'animate-spin' : ''" />
              Update Prices
            </button>
            <button
              @click="fixBrokerageConfig" 
              class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              title="Fix brokerage calculation issues"
            >
              <Icon name="mdi:calculator" />
              Fix Calculator
            </button>
            <button
              @click="refreshData"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Icon name="mdi:refresh" />
              Refresh
            </button>
            <button
              @click="refreshSymbols"
              class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
              title="Download latest NSE equity list"
            >
              <Icon name="mdi:download" />
              Update Symbols
            </button>
            <button
              @click="exportData"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Icon name="mdi:download" />
              Export
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="Portfolio Value"
          :value="formatCurrency(portfolioStats.currentValue)"
          :subtitle="`Invested: ${formatCurrency(portfolioStats.totalInvested)}`"
          icon="mdi:chart-line"
          :trend="portfolioStats.profitLossPercent"
          color="blue"
        />
        <SummaryCard
          title="Profit/Loss"
          :value="formatCurrency(portfolioStats.profitLoss)"
          :subtitle="`${portfolioStats.profitLossPercent.toFixed(2)}%`"
          icon="mdi:trending-up"
          :trend="portfolioStats.profitLossPercent"
          :color="portfolioStats.profitLoss >= 0 ? 'green' : 'red'"
        />
        <SummaryCard
          title="Total EMI Pending"
          :value="formatCurrency(emiStats.pendingEMI)"
          :subtitle="`Paid: ${formatCurrency(emiStats.paidEMI)}`"
          icon="mdi:currency-rupee"
          color="purple"
        />
        <SummaryCard
          :title="`Upcoming EMI (${upcoming.count})`"
          :value="formatCurrency(upcoming.totalAmount)"
          :subtitle="upcoming.date ? new Date(upcoming.date).toLocaleDateString('en-IN') : 'All paid'"
          icon="mdi:calendar-clock"
          color="orange"
        />
      </div>

      <!-- Tab Navigation -->
      <div class="bg-white rounded-lg shadow-sm mb-6">
        <div class="flex border-b border-gray-200">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex-1 px-6 py-4 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            <Icon :name="tab.icon" class="inline-block mr-2" />
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="transition-all duration-300">
        <StockPortfolio v-if="activeTab === 'portfolio'" />
        <LoanManagement v-if="activeTab === 'loans'" />
        <EMIPayments v-if="activeTab === 'emi'" />
        <TransactionHistory v-if="activeTab === 'transactions'" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { calculatePortfolioValue, calculateEMIRequired, calculateUpcomingEMI, formatCurrency } from '~/utils/calculations'
import { exportData as exportDataUtil } from '~/utils/storage'
import { forceUpdateBrokerageConfig, checkConfigurationVersion } from '~/utils/forceUpdateConfig'

const { data, refreshData: refreshAppData } = useAppData()
const { updateAllStockPrices } = useStockPrice()

const activeTab = ref('portfolio')
const updatingAllPrices = ref(false)

const tabs = [
  { id: 'portfolio', label: 'Stock Portfolio', icon: 'mdi:chart-box' },
  { id: 'loans', label: 'Loans', icon: 'mdi:bank' },
  { id: 'emi', label: 'EMI Payments', icon: 'mdi:calendar-check' },
  { id: 'transactions', label: 'Transactions', icon: 'mdi:receipt' }
]

const portfolioStats = computed(() => calculatePortfolioValue(data.value.stocks))
const emiStats = computed(() => calculateEMIRequired(data.value.loans))
const upcoming = computed(() => calculateUpcomingEMI(data.value.loans))

const refreshData = () => {
  refreshAppData()
}

const exportData = () => {
  exportDataUtil()
}

const updateAllPrices = async () => {
  try {
    updatingAllPrices.value = true
    await updateAllStockPrices()
    alert('All stock prices updated successfully!')
  } catch (error: any) {
    alert(error.message || 'Failed to update prices. Make sure stocks have symbols configured.')
  } finally {
    updatingAllPrices.value = false
  }
}

const fixBrokerageConfig = async () => {
  const isCorrect = checkConfigurationVersion()
  
  if (isCorrect) {
    alert('✅ Brokerage configuration is already correct!\n\nCurrent settings:\n• Buy/Sell Rate: 0.1%\n• Min Charge: ₹5\n• Max Charge: ₹20\n\nIf you\'re still seeing incorrect calculations, try refreshing the page.')
    return
  }
  
  const shouldUpdate = confirm(
    '🔧 Fix Brokerage Calculator\n\n' +
    'This will update your brokerage configuration to:\n' +
    '• Buy/Sell Rate: 0.1%\n' +
    '• Min Charge: ₹5\n' +
    '• Max Charge: ₹20\n\n' +
    'This follows Indian market standards and will fix calculation issues.\n\n' +
    'Continue?'
  )
  
  if (shouldUpdate) {
    await forceUpdateBrokerageConfig()
  }
}

const refreshSymbols = async () => {
  try {
    const res = await $fetch('/api/symbols/refresh')
    if ((res as any)?.success) {
      alert('Symbols updated successfully!')
    } else {
      alert('Failed to update symbols')
    }
  } catch (e: any) {
    alert(e?.statusMessage || 'Failed to update symbols')
  }
}

// Initialize data on mount
onMounted(() => {
  refreshData()
})
</script>

