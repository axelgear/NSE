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

    <!-- Collated Stock List -->
    <div v-if="groups.length > 0" class="space-y-4">
      <div
        v-for="group in groups"
        :key="group.name"
        class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <button @click="toggleExpand(group.name)" class="w-6 h-6 rounded-full border flex items-center justify-center">
                <Icon :name="expanded.has(group.name) ? 'mdi:minus' : 'mdi:plus'" />
              </button>
              {{ group.name }}
            </h3>
            <p class="text-sm text-gray-500">{{ group.totalQuantity }} shares</p>
          </div>
          <span :class="[
            'px-3 py-1 rounded-full text-sm font-medium',
            group.profitLoss >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          ]">
            {{ group.profitLoss >= 0 ? '+' : '' }}{{ formatCurrency(group.profitLoss) }}
          </span>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p class="text-xs text-gray-500">Avg. Buy Price</p>
            <p class="text-sm font-semibold">{{ formatCurrency(group.avgTradePrice) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Current Price</p>
            <p class="text-sm font-semibold">{{ formatCurrency(group.currentPrice) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Invested</p>
            <p class="text-sm font-semibold">{{ formatCurrency(group.totalPaid) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Current Value</p>
            <p class="text-sm font-semibold">{{ formatCurrency(group.value) }}</p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            @click="group.lots[0] && updatePriceFromAPI(group.lots[0] as Stock)"
            class="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm disabled:opacity-60"
            :disabled="updatingPrice === group.lots[0]?.id"
          >
            <span v-if="updatingPrice === group.lots[0]?.id">Updating…</span>
            <span v-else>Update Price (API)</span>
          </button>
          <button
            @click="openSellGroup(group.name, group)"
            class="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Sell Stock
          </button>
        </div>

        <!-- Expanded lots -->
        <div v-if="expanded.has(group.name)" class="mt-4 border-t pt-4 space-y-3">
          <div v-for="lot in group.lots" :key="lot.id" class="p-3 rounded-lg border">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-semibold">Lot: {{ new Date(lot.purchaseDate || '').toLocaleDateString('en-IN') }}</p>
                <p class="text-xs text-gray-500">{{ lot.quantity }} shares @ {{ formatCurrency(lot.tradePrice) }}</p>
              </div>
              <span :class="[
                'px-2 py-0.5 rounded-full text-xs font-medium',
                lot.profitLoss >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              ]">
                {{ lot.profitLoss >= 0 ? '+' : '' }}{{ formatCurrency(lot.profitLoss) }}
              </span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              <div>
                <p class="text-[11px] text-gray-500">Current Price</p>
                <p class="text-sm font-semibold">{{ formatCurrency(lot.currentPrice) }}</p>
              </div>
              <div>
                <p class="text-[11px] text-gray-500">Invested</p>
                <p class="text-sm font-semibold">{{ formatCurrency(lot.paid) }}</p>
              </div>
              <div>
                <p class="text-[11px] text-gray-500">Current Value</p>
                <p class="text-sm font-semibold">{{ formatCurrency(lot.value) }}</p>
              </div>
              <div class="flex items-center gap-2 justify-end">
                <button
                  @click="openSellStock(lot)"
                  class="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
                >Sell</button>
                <button
                  @click="openEditPurchaseDate(lot)"
                  class="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs"
                >Edit Date</button>
                <button
                  @click="deleteStockItem(lot.id)"
                  class="px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs"
                ><Icon name="mdi:delete" /></button>
              </div>
            </div>
          </div>
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
          <div class="relative">
            <input
              v-model="newStock.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Tata Gold Exchange Traded Fund"
              @input="handleNameInput"
              @focus="handleNameInput"
            />
            <div v-if="showSuggestions" class="absolute z-10 mt-1 w-full bg-white border rounded-md shadow max-h-56 overflow-auto">
              <div
                v-for="item in suggestions"
                :key="item.symbol"
                class="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                @click="selectSuggestion(item)"
              >
                <span class="font-medium">{{ item.symbol }}</span>
                <span class="text-gray-500"> – {{ item.name }}</span>
              </div>
              <div v-if="suggestions.length === 0" class="px-3 py-2 text-gray-400 text-sm">No matches</div>
            </div>
          </div>
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
          <label class="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
          <input
            v-model="newStock.purchaseDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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

    <!-- Sell Stock Modal (single lot) -->
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

    <!-- Sell Group Modal (collated) -->
    <Modal v-if="showSellGroup" @close="showSellGroup = false" :title="`Sell ${selectedGroupName}`">
      <form @submit.prevent="sellGroup" class="space-y-4">
        <div>
          <p class="text-sm text-gray-600 mb-2">
            Available: <strong>{{ selectedGroupAgg?.totalQuantity || 0 }} shares</strong>
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Quantity to Sell</label>
            <input
              v-model.number="sellQuantity"
              type="number"
              required
              min="1"
              :max="selectedGroupAgg?.totalQuantity || 1"
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

        <BrokerageBreakdown
          :breakdown="sellBrokerageBreakdown"
          type="sell"
          :profitLoss="sellGroupProfitLoss"
          brokerName="Groww"
        />

        <div class="flex gap-3">
          <button type="submit" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">Confirm Sale</button>
          <button type="button" @click="showSellGroup = false" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
        </div>
      </form>
    </Modal>

    <!-- Edit Purchase Date Modal -->
    <Modal v-if="showEditDate" @close="showEditDate = false" title="Edit Purchase Date">
      <form @submit.prevent="saveEditPurchaseDate" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
          <input
            v-model="editPurchaseDate"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div class="flex gap-3">
          <button type="submit" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Save</button>
          <button type="button" @click="showEditDate = false" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import type { Stock } from '~/types'
import { formatCurrency, calculateDetailedBrokerage } from '~/utils/calculations'

const { data, addStock, updateStock, deleteStock, sellStock: sellStockAction, getAggregateByName, sellStockByName } = useAppData()
const { updateStockPriceFromAPI, syncPriceAcrossStocks, getSuggestedSymbol, searchSymbols } = useStockPrice()

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
  currentPrice: 0,
  purchaseDate: new Date().toISOString().substring(0,10)
})

const updatePrice = ref(0)
const sellQuantity = ref(1)
const sellPrice = ref(0)
const sellPurpose = ref<'profit' | 'reinvest' | 'other'>('profit')
const sellNotes = ref('')

// Show all holdings that are not fully sold (include 'active' and 'partial')
const activeStocks = computed(() => data.value.stocks.filter((s: Stock) => s.status !== 'sold'))

// Grouped by stock name (collated)
const groups = computed(() => {
  const map = new Map<string, Stock[]>()
  activeStocks.value.forEach((s) => {
    map.set(s.name, [...(map.get(s.name) || []), s])
  })
  return Array.from(map.entries()).map(([name, lots]) => {
    lots.sort((a, b) => new Date(a.purchaseDate || 0).getTime() - new Date(b.purchaseDate || 0).getTime())
    const agg = getAggregateByName(name)
    return { name, lots, ...agg }
  })
})

const expanded = reactive(new Set<string>())
const toggleExpand = (name: string) => {
  if (expanded.has(name)) expanded.delete(name)
  else expanded.add(name)
}

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

// Group sell modal state
const showSellGroup = ref(false)
const selectedGroupName = ref<string>('')
const selectedGroupAgg = ref<any | null>(null)
const sellGroupProfitLoss = computed(() => {
  if (!selectedGroupAgg.value) return 0
  const avg = selectedGroupAgg.value.avgTradePrice || 0
  const costBasis = avg * sellQuantity.value
  const saleAmount = sellQuantity.value * sellPrice.value
  return saleAmount - costBasis
})

const showSuggestions = ref(false)
const suggestions = ref<{ symbol: string; name: string }[]>([])

const handleNameInput = async () => {
  const q = newStock.value.name.trim()
  if (!q) { showSuggestions.value = false; suggestions.value = []; return }
  suggestions.value = await searchSymbols(q)
  showSuggestions.value = suggestions.value.length > 0
  // do not auto fill symbol here; only on select
}

const selectSuggestion = (item: { symbol: string; name: string }) => {
  newStock.value.name = item.name
  newStock.value.symbol = item.symbol
  showSuggestions.value = false
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
    purchaseDate: (newStock.value.purchaseDate ? new Date(newStock.value.purchaseDate) : new Date()).toISOString()
  })

  // Reset form
  newStock.value = { name: '', symbol: '', quantity: 1, tradePrice: 0, currentPrice: 0, purchaseDate: new Date().toISOString().substring(0,10) }
  showAddStock.value = false
}

const updatePriceFromAPI = async (stock: Stock) => {
  try {
    updatingPrice.value = stock.id
    await updateStockPriceFromAPI(stock.id)
    
    // Sync price across all stocks with same name
    syncPriceAcrossStocks(stock.name, data.value.stocks.find((s: Stock) => s.id === stock.id)?.currentPrice || 0)
  } catch (error: any) {
    alert(error.message || 'Failed to update price from API')
  } finally {
    updatingPrice.value = null
  }
}

const openUpdatePrice = (stock: Stock) => {
  // For single lot updates we still allow opening the modal, but saving will sync to all lots
  selectedStock.value = stock
  updatePrice.value = stock.currentPrice
  showUpdatePrice.value = true
}

const updateStockPrice = () => {
  if (!selectedStock.value) return
  // Sync the updated price across all lots of the same stock name
  syncPriceAcrossStocks(selectedStock.value.name, updatePrice.value)
  showUpdatePrice.value = false
}

// Group-level manual update to apply one current price to all lots
const openUpdateGroup = (group: any) => {
  selectedStock.value = group.lots[0]
  updatePrice.value = group.currentPrice
  showUpdatePrice.value = true
}

const openSellStock = (stock: Stock) => {
  selectedStock.value = stock
  sellQuantity.value = 1
  sellPrice.value = stock.currentPrice
  showSellStock.value = true
}

const openSellGroup = (name: string, group: any) => {
  selectedGroupName.value = name
  selectedGroupAgg.value = group
  sellQuantity.value = 1
  sellPrice.value = group.currentPrice
  showSellGroup.value = true
}

const sellGroup = async () => {
  if (!selectedGroupAgg.value) return
  const maxQty = selectedGroupAgg.value.totalQuantity || 0
  if (sellQuantity.value > maxQty) {
    alert('Quantity exceeds available shares')
    return
  }
  const result = await sellStockByName(selectedGroupName.value, sellQuantity.value, sellPrice.value, sellPurpose.value, sellNotes.value || undefined)
  if (result) {
    alert(`Sold ${sellQuantity.value} shares of ${selectedGroupName.value}.\nNet proceeds: ${formatCurrency(result.totalNetAmount)}`)
  }
  showSellGroup.value = false
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

// Edit purchase date state
const showEditDate = ref(false)
const editPurchaseDate = ref<string>('')
const selectedLotForDate = ref<Stock | null>(null)

const openEditPurchaseDate = (lot: Stock) => {
  selectedLotForDate.value = lot
  const d = lot.purchaseDate ? new Date(lot.purchaseDate) : new Date()
  editPurchaseDate.value = new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().substring(0,10)
  showEditDate.value = true
}

const saveEditPurchaseDate = async () => {
  if (!selectedLotForDate.value || !editPurchaseDate.value) return
  await updateStock(selectedLotForDate.value.id, {
    purchaseDate: new Date(editPurchaseDate.value).toISOString()
  })
  showEditDate.value = false
}
</script>


