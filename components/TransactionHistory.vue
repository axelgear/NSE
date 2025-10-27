<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold text-gray-900">Transaction History</h2>
        <div class="flex gap-2 items-center">
          <input v-model="search" type="text" placeholder="Search stock/purpose/notes" class="px-3 py-2 border rounded-lg" />
          <select v-model="sortKey" class="px-3 py-2 border rounded-lg">
            <option value="date">Date</option>
            <option value="stockName">Stock</option>
            <option value="type">Type</option>
            <option value="price">Price</option>
            <option value="quantity">Quantity</option>
            <option value="brokerage">Brokerage</option>
            <option value="netAmount">Net Amount</option>
          </select>
          <select v-model="sortDir" class="px-3 py-2 border rounded-lg">
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
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
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
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
      <div class="bg-white rounded-lg shadow-sm p-6">
        <p class="text-sm text-gray-600 mb-1">Realized P&L</p>
        <p :class="['text-2xl font-bold', realizedPnL >= 0 ? 'text-green-600' : 'text-red-600']">{{ formatCurrency(realizedPnL) }}</p>
      </div>
      <div class="bg-white rounded-lg shadow-sm p-6">
        <p class="text-sm text-gray-600 mb-1">Brokerage (Total)</p>
        <p class="text-2xl font-bold text-red-600">{{ formatCurrency(totalBrokerage) }}</p>
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
                P&L
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cumulative P&L
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Purpose
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
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
              <td class="px-6 py-4 whitespace-nowrap text-sm" :class="(transaction.profitLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(transaction.profitLoss || 0) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm" :class="getCumulativeClass(transaction.id)">
                {{ formatCurrency(getCumulative(transaction.id)) }}
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
              <td class="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                <button
                  class="px-2 py-1 bg-indigo-100 text-indigo-700 rounded"
                  @click="openEdit(transaction)"
                >Edit</button>
                <button
                  v-if="transaction.type === 'sell' && !transaction.reverted"
                  class="px-2 py-1 bg-red-100 text-red-700 rounded"
                  @click="confirmRevert(transaction)"
                >Revert</button>
                <button
                  class="px-2 py-1 bg-gray-100 text-gray-700 rounded"
                  @click="confirmDelete(transaction)"
                >Delete</button>
                <span v-if="transaction.reverted" class="text-xs text-gray-500">Reverted</span>
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

    <!-- Edit Transaction Modal -->
    <Modal v-if="showEdit" @close="showEdit = false" title="Edit Transaction">
      <form @submit.prevent="saveEdit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
          <select v-model="editForm.purpose" class="w-full px-3 py-2 border rounded-lg">
            <option value="emi">EMI</option>
            <option value="reinvest">Reinvest</option>
            <option value="profit">Profit</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
            <input v-model.number="editForm.price" type="number" min="0" step="0.01" class="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input v-model.number="editForm.quantity" type="number" min="1" class="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Brokerage (override)</label>
            <input v-model.number="editForm.brokerage" type="number" min="0" step="0.01" class="w-full px-3 py-2 border rounded-lg" />
            <p class="text-[11px] text-gray-500 mt-1">Set to override auto-calculated brokerage</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Net Amount</label>
            <input v-model.number="editForm.netAmount" type="number" min="0" step="0.01" class="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea v-model="editForm.notes" rows="3" class="w-full px-3 py-2 border rounded-lg" />
        </div>
        <div class="flex gap-3">
          <button type="submit" class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
          <button type="button" @click="showEdit = false" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">Cancel</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { formatCurrency, formatDate } from '~/utils/calculations'

const { data, updateTransaction, revertTransaction, deleteTransaction } = useAppData()

const filterType = ref<'all' | 'buy' | 'sell'>('all')
const search = ref('')
const sortKey = ref<'date'|'stockName'|'type'|'price'|'quantity'|'brokerage'|'netAmount'>('date')
const sortDir = ref<'asc'|'desc'>('desc')
const currentPage = ref(1)
const itemsPerPage = 10

const filteredTransactions = computed(() => {
  let list = [...data.value.transactions]
  // filter
  if (filterType.value !== 'all') list = list.filter(t => t.type === filterType.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(t => (
      (t.stockName || '').toLowerCase().includes(q) ||
      (t.purpose || '').toString().toLowerCase().includes(q) ||
      (t.notes || '').toLowerCase().includes(q)
    ))
  }
  // sort
  list.sort((a: any, b: any) => {
    let av: any = a[sortKey.value]
    let bv: any = b[sortKey.value]
    if (sortKey.value === 'date') { av = new Date(a.date).getTime(); bv = new Date(b.date).getTime() }
    if (typeof av === 'string') av = av.toLowerCase()
    if (typeof bv === 'string') bv = bv.toLowerCase()
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir.value === 'asc' ? cmp : -cmp
  })
  return list
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
    .filter((t: any) => t.type === 'buy')
    .reduce((sum: number, t: any) => sum + t.netAmount, 0)
)

const totalSellAmount = computed(() => 
  data.value.transactions
    .filter((t: any) => t.type === 'sell')
    .reduce((sum: number, t: any) => sum + t.netAmount, 0)
)

const totalBrokerage = computed(() => 
  data.value.transactions.reduce((sum: number, t: any) => sum + (t.brokerage || 0), 0)
)

const realizedPnL = computed(() => 
  data.value.transactions
    .filter((t: any) => t.type === 'sell' && !t.reverted)
    .reduce((sum: number, t: any) => sum + (t.realizedPnL || 0), 0)
)

// Cumulative P&L (sorted by view order) helpers
const cumulativeMap = computed(() => {
  const map = new Map<string, number>()
  let running = 0
  filteredTransactions.value.slice().reverse().forEach((t) => { /* oldest to newest */
    // For buys use 0, for sells use profitLoss
    const pnl = (t.type === 'sell' && !t.reverted) ? (t.profitLoss || 0) : 0
    running += pnl
    map.set(t.id, running)
  })
  return map
})

const getCumulative = (id: string) => {
  return cumulativeMap.value.get(id) || 0
}

const getCumulativeClass = (id: string) => {
  const v = getCumulative(id)
  return v >= 0 ? 'text-green-600' : 'text-red-600'
}

watch(filterType, () => {
  currentPage.value = 1
})

// Edit modal state
const showEdit = ref(false)
const editForm = reactive<{ id: string | null; purpose?: any; notes?: string; price?: number; quantity?: number; brokerage?: number; netAmount?: number }>({ id: null, purpose: undefined, notes: '', price: undefined, quantity: undefined, brokerage: undefined, netAmount: undefined })

const openEdit = (txn: any) => {
  editForm.id = txn.id
  editForm.purpose = txn.purpose || 'other'
  editForm.notes = txn.notes || ''
  showEdit.value = true
}

const saveEdit = async () => {
  if (!editForm.id) return
  const updates: any = { purpose: editForm.purpose, notes: editForm.notes }
  if (typeof editForm.price === 'number') updates.price = editForm.price
  if (typeof editForm.quantity === 'number') updates.quantity = editForm.quantity
  if (typeof editForm.brokerage === 'number') { updates.brokerage = editForm.brokerage; updates.brokerageOverridden = true }
  if (typeof editForm.netAmount === 'number') updates.netAmount = editForm.netAmount
  await updateTransaction(editForm.id, updates)
  showEdit.value = false
}

const confirmRevert = async (txn: any) => {
  if (confirm('Revert this transaction? This will restore the sold quantity back to holdings.')) {
    const ok = await revertTransaction(txn.id)
    if (!ok) alert('Could not revert transaction')
  }
}

const confirmDelete = async (txn: any) => {
  if (confirm('Delete this transaction? This will not alter holdings.')) {
    const ok = await deleteTransaction(txn.id)
    if (!ok) alert('Could not delete transaction')
  }
}
</script>

