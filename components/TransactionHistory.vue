<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold text-gray-900">Transaction History</h2>
        <div class="flex gap-2">
          <select
            v-model="filterType"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Transactions</option>
            <option value="buy">Buy Only</option>
            <option value="sell">Sell Only</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Transaction Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <p class="text-sm text-gray-600 mb-1">Total Transactions</p>
        <p class="text-2xl font-bold text-gray-900">{{ filteredTransactions.length }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <p class="text-sm text-gray-600 mb-1">Total Buy Amount</p>
        <p class="text-2xl font-bold text-blue-600">{{ formatCurrency(totalBuyAmount) }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <p class="text-sm text-gray-600 mb-1">Total Sell Amount</p>
        <p class="text-2xl font-bold text-green-600">{{ formatCurrency(totalSellAmount) }}</p>
      </div>
    </div>

    <!-- Transaction List -->
    <div v-if="filteredTransactions.length > 0" class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Brokerage
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Net Amount
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Purpose
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="transaction in paginatedTransactions"
              :key="transaction.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(transaction.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 py-1 text-xs font-semibold rounded-full',
                  transaction.type === 'buy' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                ]">
                  {{ transaction.type.toUpperCase() }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                {{ transaction.stockName }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ transaction.quantity }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatCurrency(transaction.price) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                {{ formatCurrency(transaction.brokerage) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                {{ formatCurrency(transaction.netAmount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span v-if="transaction.purpose" :class="[
                  'text-xs px-2 py-1 rounded',
                  transaction.purpose === 'emi' ? 'bg-purple-100 text-purple-800' :
                  transaction.purpose === 'reinvest' ? 'bg-blue-100 text-blue-800' :
                  transaction.purpose === 'profit' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                ]">
                  {{ transaction.purpose === 'emi' ? `EMI ${transaction.emiMonth}` : transaction.purpose.toUpperCase() }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                <span v-if="transaction.notes" :title="transaction.notes">
                  {{ transaction.notes }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-700">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to 
            {{ Math.min(currentPage * itemsPerPage, filteredTransactions.length) }} of 
            {{ filteredTransactions.length }} transactions
          </p>
          <div class="flex gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Previous
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bg-white rounded-lg shadow-sm p-12 text-center">
      <Icon name="mdi:receipt-text-outline" class="text-6xl text-gray-300 mb-4" />
      <p class="text-gray-500">No transactions found.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency, formatDate } from '~/utils/calculations'

const { data } = useAppData()

const filterType = ref<'all' | 'buy' | 'sell'>('all')
const currentPage = ref(1)
const itemsPerPage = 10

const filteredTransactions = computed(() => {
  const sorted = [...data.value.transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  if (filterType.value === 'all') return sorted
  return sorted.filter(t => t.type === filterType.value)
})

const totalPages = computed(() => 
  Math.ceil(filteredTransactions.value.length / itemsPerPage)
)

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTransactions.value.slice(start, end)
})

const totalBuyAmount = computed(() => 
  data.value.transactions
    .filter(t => t.type === 'buy')
    .reduce((sum, t) => sum + t.netAmount, 0)
)

const totalSellAmount = computed(() => 
  data.value.transactions
    .filter(t => t.type === 'sell')
    .reduce((sum, t) => sum + t.netAmount, 0)
)

watch(filterType, () => {
  currentPage.value = 1
})
</script>

