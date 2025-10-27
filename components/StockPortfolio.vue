<template>
  <div class="space-y-6">
    <!-- Add Stock Button -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold text-gray-900">Stock Portfolio</h2>
        <button
          @click="showAddStock = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Icon name="mdi:plus" />
          Add Stock
        </button>
      </div>
    </div>

    <!-- Stock List -->
    <div v-if="activeStocks.length > 0" class="space-y-4">
      <div
        v-for="stock in activeStocks"
        :key="stock.id"
        class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-bold text-gray-900">{{ stock.name }}</h3>
            <p class="text-sm text-gray-500">{{ stock.quantity }} shares</p>
          </div>
          <span :class="[
            'px-3 py-1 rounded-full text-sm font-medium',
            stock.profitLoss >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          ]">
            {{ stock.profitLoss >= 0 ? '+' : '' }}{{ formatCurrency(stock.profitLoss) }}
          </span>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p class="text-xs text-gray-500">Avg. Buy Price</p>
            <p class="text-sm font-semibold">{{ formatCurrency(stock.tradePrice) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Current Price</p>
            <p class="text-sm font-semibold">{{ formatCurrency(stock.currentPrice) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Invested</p>
            <p class="text-sm font-semibold">{{ formatCurrency(stock.paid) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Current Value</p>
            <p class="text-sm font-semibold">{{ formatCurrency(stock.value) }}</p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-if="stock.symbol"
            @click="updatePriceFromAPI(stock)"
            class="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-1 justify-center"
            :disabled="updatingPrice === stock.id"
          >
            <Icon :name="updatingPrice === stock.id ? 'mdi:loading' : 'mdi:cloud-sync'" :class="updatingPrice === stock.id ? 'animate-spin' : ''" />
            API Update
          </button>
          <button
            @click="openUpdatePrice(stock)"
            class="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            Manual Update
          </button>
          <button
            @click="openSellStock(stock)"
            class="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Sell Stock
          </button>
          <button
            @click="deleteStockItem(stock.id)"
            class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <Icon name="mdi:delete" />
          </button>
        </div>
      </div>
    </div>

    <div v-else class="bg-white rounded-lg shadow-sm p-12 text-center">
      <Icon name="mdi:chart-line-variant" class="text-6xl text-gray-300 mb-4" />
      <p class="text-gray-500">No stocks in portfolio. Add your first stock to get started.</p>
    </div>

    <!-- Add Stock Modal -->
    <Modal v-if="showAddStock" @close="showAddStock = false" title="Add Stock">
      <form @submit.prevent="addNewStock" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Stock Name</label>
          <input
            v-model="newStock.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Tata Gold Exchange Traded Fund"
            @input="suggestSymbol"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Stock Symbol (for API)
            <span class="text-xs text-gray-500">Optional</span>
          </label>
          <input
            v-model="newStock.symbol"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., ATHERENERGY, TGOLDETF"
          />
          <p class="text-xs text-gray-500 mt-1">Used for automatic price updates via API</p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              v-model.number="newStock.quantity"
              type="number"
              required
              min="1"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Buy Price (₹)</label>
            <input
              v-model.number="newStock.tradePrice"
              type="number"
              required
              min="0"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Current Price (₹)</label>
          <input
            v-model.number="newStock.currentPrice"
            type="number"
            required
            min="0"
            step="0.01"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="flex justify-between text-sm mb-2">
            <span>Total Investment:</span>
            <span class="font-semibold">{{ formatCurrency(newStock.quantity * newStock.tradePrice) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>Current Value:</span>
            <span class="font-semibold">{{ formatCurrency(newStock.quantity * newStock.currentPrice) }}</span>
          </div>
        </div>
        <div class="flex gap-3">
          <button
            type="submit"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Stock
          </button>
          <button
            type="button"
            @click="showAddStock = false"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>

    <!-- Update Price Modal -->
    <Modal v-if="showUpdatePrice" @close="showUpdatePrice = false" title="Update Current Price">
      <form @submit.prevent="updateStockPrice" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Current Price (₹)</label>
          <input
            v-model.number="updatePrice"
            type="number"
            required
            min="0"
            step="0.01"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div class="flex gap-3">
          <button
            type="submit"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Update
          </button>
          <button
            type="button"
            @click="showUpdatePrice = false"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>

    <!-- Sell Stock Modal -->
    <Modal v-if="showSellStock" @close="showSellStock = false" title="Sell Stock">
      <form @submit.prevent="sellStock" class="space-y-4">
        <div>
          <p class="text-sm text-gray-600 mb-2">
            Available: <strong>{{ selectedStock?.quantity }} shares</strong>
          </p>
          <p v-if="selectedStock?.soldQuantity" class="text-xs text-gray-500">
            Previously sold: {{ selectedStock.soldQuantity }} shares @ {{ formatCurrency(selectedStock.soldPrice || 0) }}
          </p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Purpose of Sale</label>
          <select
            v-model="sellPurpose"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="profit">Take Profit</option>
            <option value="reinvest">Sell to Buy Another Stock</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Quantity to Sell</label>
            <input
              v-model.number="sellQuantity"
              type="number"
              required
              min="1"
              :max="selectedStock?.quantity"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sell Price (₹)</label>
            <input
              v-model.number="sellPrice"
              type="number"
              required
              min="0"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div v-if="sellPurpose !== 'profit'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea
            v-model="sellNotes"
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Buying RELIANCE stocks with this money"
          ></textarea>
        </div>

        <!-- Detailed Brokerage Breakdown -->
        <BrokerageBreakdown
          :breakdown="sellBrokerageBreakdown"
          type="sell"
          :profitLoss="sellProfitLoss"
          brokerName="Groww"
        />

        <div v-if="sellPurpose === 'reinvest'" class="bg-blue-50 p-3 rounded-lg text-xs text-blue-800">
          <p class="font-semibold mb-1">💡 Tip: After selling, you can:</p>
          <p>1. Use the proceeds ({{ formatCurrency(netSellAmount) }}) to buy another stock</p>
          <p>2. The transaction will be linked for tracking</p>
        </div>

        <div class="flex gap-3">
          <button
            type="submit"
            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Confirm Sale
          </button>
          <button
            type="button"
            @click="showSellStock = false"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import type { Stock } from '~/types'
import { formatCurrency, calculateDetailedBrokerage } from '~/utils/calculations'

const { data, addStock, updateStock, deleteStock, sellStock: sellStockAction } = useAppData()
const { updateStockPriceFromAPI, syncPriceAcrossStocks, getSuggestedSymbol } = useStockPrice()

const showAddStock = ref(false)
const showUpdatePrice = ref(false)
const showSellStock = ref(false)
const selectedStock = ref<Stock | null>(null)
const updatingPrice = ref<string | null>(null)

const newStock = ref({
  name: '',
  symbol: '',
  quantity: 1,
  tradePrice: 0,
  currentPrice: 0
})

const updatePrice = ref(0)
const sellQuantity = ref(1)
const sellPrice = ref(0)
const sellPurpose = ref<'profit' | 'reinvest' | 'other'>('profit')
const sellNotes = ref('')

const activeStocks = computed(() => data.value.stocks.filter(s => s.status === 'active'))

const sellBrokerageBreakdown = computed(() => {
  return calculateDetailedBrokerage(
    sellQuantity.value,
    sellPrice.value,
    data.value.brokerageConfig,
    'sell'
  )
})

const sellProfitLoss = computed(() => {
  if (!selectedStock.value) return 0
  const costBasis = (selectedStock.value.paid / selectedStock.value.quantity) * sellQuantity.value
  const saleAmount = sellQuantity.value * sellPrice.value
  return saleAmount - costBasis
})

const netSellAmount = computed(() => sellBrokerageBreakdown.value.netAmount)

const suggestSymbol = () => {
  if (newStock.value.name && !newStock.value.symbol) {
    const suggested = getSuggestedSymbol(newStock.value.name)
    if (suggested) {
      newStock.value.symbol = suggested
    }
  }
}

const addNewStock = () => {
  const paid = newStock.value.quantity * newStock.value.tradePrice
  const value = newStock.value.quantity * newStock.value.currentPrice
  
  addStock({
    name: newStock.value.name,
    symbol: newStock.value.symbol || undefined,
    paid,
    tradePrice: newStock.value.tradePrice,
    quantity: newStock.value.quantity,
    currentPrice: newStock.value.currentPrice,
    value,
    profitLoss: value - paid,
    status: 'active',
    purchaseDate: new Date().toISOString()
  })

  // Reset form
  newStock.value = { name: '', symbol: '', quantity: 1, tradePrice: 0, currentPrice: 0 }
  showAddStock.value = false
}

const updatePriceFromAPI = async (stock: Stock) => {
  try {
    updatingPrice.value = stock.id
    await updateStockPriceFromAPI(stock.id)
    
    // Sync price across all stocks with same name
    syncPriceAcrossStocks(stock.name, data.value.stocks.find(s => s.id === stock.id)?.currentPrice || 0)
  } catch (error: any) {
    alert(error.message || 'Failed to update price from API')
  } finally {
    updatingPrice.value = null
  }
}

const openUpdatePrice = (stock: Stock) => {
  selectedStock.value = stock
  updatePrice.value = stock.currentPrice
  showUpdatePrice.value = true
}

const updateStockPrice = () => {
  if (selectedStock.value) {
    const newValue = selectedStock.value.quantity * updatePrice.value
    const newProfitLoss = newValue - selectedStock.value.paid
    
    updateStock(selectedStock.value.id, {
      currentPrice: updatePrice.value,
      value: newValue,
      profitLoss: newProfitLoss
    })

    // Sync price across all stocks with same name
    syncPriceAcrossStocks(selectedStock.value.name, updatePrice.value)
  }
  showUpdatePrice.value = false
}

const openSellStock = (stock: Stock) => {
  selectedStock.value = stock
  sellQuantity.value = 1
  sellPrice.value = stock.currentPrice
  showSellStock.value = true
}

const sellStock = () => {
  if (!selectedStock.value) return

  // Use the new sellStock action with purpose and notes
  sellStockAction(
    selectedStock.value.id,
    sellQuantity.value,
    sellPrice.value,
    sellPurpose.value,
    sellNotes.value || undefined
  )

  // Show success message with proceeds
  if (sellPurpose.value === 'reinvest') {
    const proceeds = netSellAmount.value
    alert(`Stock sold successfully!\n\nNet proceeds: ${formatCurrency(proceeds)}\n\nYou can now add a new stock purchase.`)
  }

  // Reset form
  sellQuantity.value = 1
  sellPrice.value = 0
  sellPurpose.value = 'profit'
  sellNotes.value = ''
  showSellStock.value = false
}

const deleteStockItem = (id: string) => {
  if (confirm('Are you sure you want to delete this stock?')) {
    deleteStock(id)
  }
}
</script>


