<template>
  <div class="space-y-6">
    <!-- EMI Summary -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4">EMI Payment Management</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <p class="text-sm text-blue-700 mb-1">Total EMI</p>
          <p class="text-2xl font-bold text-blue-900">{{ formatCurrency(emiStats.totalEMI) }}</p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <p class="text-sm text-green-700 mb-1">Paid EMI</p>
          <p class="text-2xl font-bold text-green-900">{{ formatCurrency(emiStats.paidEMI) }}</p>
        </div>
        <div class="bg-orange-50 p-4 rounded-lg">
          <p class="text-sm text-orange-700 mb-1">Pending EMI</p>
          <p class="text-2xl font-bold text-orange-900">{{ formatCurrency(emiStats.pendingEMI) }}</p>
        </div>
      </div>
    </div>

    <!-- Pay EMI Section -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-4">Pay Next EMI</h3>
      
      <div v-if="nextPendingPayment" class="space-y-4">
        <div class="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
          <div>
            <p class="text-sm text-gray-600">Next Payment</p>
            <p class="text-lg font-bold">{{ nextPendingPayment.loanName }} - Month {{ nextPendingPayment.payment.month }}</p>
            <p class="text-2xl font-bold text-orange-600 mt-1">
              {{ formatCurrency(nextPendingPayment.payment.emiAmount) }}
            </p>
            <p v-if="nextPendingPayment.payment.dueDate" class="text-xs text-gray-500 mt-1">
              Due on {{ new Date(nextPendingPayment.payment.dueDate).toLocaleDateString('en-IN') }}
            </p>
          </div>
          <button
            @click="openPayEMI(nextPendingPayment)"
            class="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
          >
            Pay Now
          </button>
        </div>

        <!-- Stock Selection for EMI Payment -->
        <div class="border-t border-gray-200 pt-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-3">Select Stocks to Sell for EMI</h4>
          <div class="space-y-3">
            <div
              v-for="stock in activeStocks"
              :key="stock.id"
              class="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <p class="font-semibold">{{ stock.name }}</p>
                  <p class="text-sm text-gray-500">
                    Available: {{ stock.quantity }} shares @ {{ formatCurrency(stock.currentPrice) }}
                  </p>
                  <p class="text-sm text-gray-500">
                    Total Value: {{ formatCurrency(stock.value) }}
                  </p>
                </div>
                <button
                  @click="selectStockForEMI(stock)"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8">
        <Icon name="mdi:check-circle" class="text-6xl text-green-500 mb-2" />
        <p class="text-gray-600">All EMI payments completed!</p>
      </div>
    </div>

    <!-- Payment History by Loan -->
  <div v-for="loan in data.loans" :key="loan.id" class="bg-white rounded-lg shadow-sm p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-2">{{ loan.name }} - Payment History</h3>
      <p class="text-xs text-gray-500 mb-4">Due on {{ loan.paymentDay || 3 }} of each month</p>
      <div class="space-y-2">
        <div
          v-for="payment in loan.paymentsSchedule"
          :key="payment.month"
          :class="[
            'flex justify-between items-center p-4 rounded-lg',
            payment.paid ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
          ]"
        >
          <div class="flex items-center gap-4">
            <Icon
              :name="payment.paid ? 'mdi:check-circle' : 'mdi:clock-outline'"
              :class="payment.paid ? 'text-green-600 text-2xl' : 'text-gray-400 text-2xl'"
            />
            <div>
              <p class="font-semibold">Month {{ payment.month }}</p>
              <p class="text-sm text-gray-500">{{ formatCurrency(payment.emiAmount) }}</p>
              <p v-if="payment.dueDate" class="text-[11px] text-gray-400">Due: {{ new Date(payment.dueDate).toLocaleDateString('en-IN') }}</p>
              <p v-if="payment.paidDate" class="text-xs text-gray-400">
                Paid on {{ formatDate(payment.paidDate) }}
              </p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">Balance</p>
            <p class="font-semibold">{{ formatCurrency(payment.principalRemaining) }}</p>
          </div>
          <button
            v-if="!payment.paid"
            @click="markPaymentPaid(loan.id, payment.month)"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Mark Paid
          </button>
        </div>
      </div>
    </div>

    <!-- Sell Stock for EMI Modal -->
    <Modal v-if="showSellForEMI" @close="showSellForEMI = false" title="Sell Stock for EMI Payment">
      <form @submit.prevent="confirmSellForEMI" class="space-y-4">
        <div class="bg-yellow-50 p-4 rounded-lg mb-4">
          <p class="text-sm text-gray-700">EMI Amount Required:</p>
          <p class="text-2xl font-bold text-orange-600">
            {{ formatCurrency(selectedEMIPayment?.payment.emiAmount || 0) }}
          </p>
        </div>

        <div class="bg-blue-50 p-4 rounded-lg mb-4">
          <p class="text-sm text-gray-700 mb-2">Selected Stock:</p>
          <p class="font-semibold">{{ selectedStockForEMI?.name }}</p>
          <p class="text-sm text-gray-500">
            Available: {{ selectedStockForEMI?.quantity }} shares @ {{ formatCurrency(selectedStockForEMI?.currentPrice || 0) }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Quantity to Sell</label>
            <input
              v-model.number="sellForEMIQuantity"
              type="number"
              required
              min="1"
              :max="selectedStockForEMI?.quantity"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="updateEMICalculations"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sell Price (₹)</label>
            <input
              v-model.number="sellForEMIPrice"
              type="number"
              required
              min="0"
              step="0.01"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="updateEMICalculations"
            />
          </div>
        </div>

        <!-- Detailed Brokerage Breakdown -->
        <BrokerageBreakdown
          :breakdown="emiSellBreakdown"
          type="sell"
          brokerName="Groww"
        />
        
        <!-- EMI Coverage Check -->
        <div 
          v-if="emiSellBreakdown.netAmount < (selectedEMIPayment?.payment.emiAmount || 0)"
          class="text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-200"
        >
          ⚠️ <strong>Warning:</strong> Net proceeds ({{ formatCurrency(emiSellBreakdown.netAmount) }}) are less than EMI amount ({{ formatCurrency(selectedEMIPayment?.payment.emiAmount || 0) }}).
          <br>
          You need {{ formatCurrency((selectedEMIPayment?.payment.emiAmount || 0) - emiSellBreakdown.netAmount) }} more.
        </div>
        <div 
          v-else
          class="text-green-600 text-xs bg-green-50 p-3 rounded-lg border border-green-200"
        >
          ✓ <strong>Sufficient to cover EMI payment!</strong>
          <br>
          Net proceeds: {{ formatCurrency(emiSellBreakdown.netAmount) }} ≥ EMI: {{ formatCurrency(selectedEMIPayment?.payment.emiAmount || 0) }}
        </div>

        <div class="flex gap-3">
          <button
            type="submit"
            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Confirm Sale & Pay EMI
          </button>
          <button
            type="button"
            @click="showSellForEMI = false"
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
import type { Stock, Loan, EMIPayment } from '~/types'
import { formatCurrency, formatDate, calculateEMIRequired, calculateDetailedBrokerage } from '~/utils/calculations'

const { data, markEMIPaid, sellStocksForEMI } = useAppData()

const showSellForEMI = ref(false)
const selectedEMIPayment = ref<{ loan: Loan; loanName: string; payment: EMIPayment } | null>(null)
const selectedStockForEMI = ref<Stock | null>(null)
const sellForEMIQuantity = ref(1)
const sellForEMIPrice = ref(0)

const emiStats = computed(() => calculateEMIRequired(data.value.loans))
const activeStocks = computed(() => data.value.stocks.filter((s: Stock) => s.status === 'active'))

// Show the earliest due date across all loans, including all items due that day
const nextPendingPayment = computed(() => {
  type Item = { loan: Loan; loanName: string; payment: EMIPayment }
  const items: { loan: Loan; p: EMIPayment; due: Date }[] = []
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  for (const loan of data.value.loans as Loan[]) {
    for (const p of loan.paymentsSchedule as EMIPayment[]) {
      if (!p.paid) {
        const due = p.dueDate
          ? new Date(p.dueDate)
          : (() => {
              const s = loan.startDate ? new Date(loan.startDate) : new Date()
              const base = new Date(s)
              base.setMonth(base.getMonth() + (p.month - 1))
              return new Date(base.getFullYear(), base.getMonth(), Math.min(loan.paymentDay || 3, 28))
            })()
        items.push({ loan, p, due })
      }
    }
  }

  if (items.length === 0) return null
  const future = items.filter(i => i.due && i.due >= startOfDay)
  const pool = future.length > 0 ? future : items
  pool.sort((a, b) => a.due.getTime() - b.due.getTime())
  const firstDate = pool[0]!.due
  const sameDay = pool.filter(i => i.due && i.due.getFullYear() === firstDate.getFullYear() && i.due.getMonth() === firstDate.getMonth() && i.due.getDate() === firstDate.getDate())
  const total = sameDay.reduce((sum, i) => sum + (i.p.emiAmount || 0), 0)

  // Return a merged item with total on that date and list of loans
  return {
    loan: { ...sameDay[0]!.loan },
    loanName: `${sameDay.length} loan(s)` as any,
    payment: { ...sameDay[0]!.p, emiAmount: total, dueDate: firstDate.toISOString() } as EMIPayment
  } as Item
})

const emiSellBreakdown = computed(() => {
  return calculateDetailedBrokerage(
    sellForEMIQuantity.value,
    sellForEMIPrice.value,
    data.value.brokerageConfig,
    'sell'
  )
})

const openPayEMI = (payment: any) => {
  selectedEMIPayment.value = payment
}

const selectStockForEMI = (stock: Stock) => {
  selectedStockForEMI.value = stock
  sellForEMIQuantity.value = 1
  sellForEMIPrice.value = stock.currentPrice
  showSellForEMI.value = true
}

const updateEMICalculations = () => {
  // Trigger reactivity
}

const confirmSellForEMI = async () => {
  if (!selectedStockForEMI.value || !selectedEMIPayment.value) return

  // Sell the stock
  const transaction = await sellStocksForEMI(
    selectedStockForEMI.value.id,
    sellForEMIQuantity.value,
    sellForEMIPrice.value,
    selectedEMIPayment.value.loan.id,
    selectedEMIPayment.value.payment.month
  )

  // Mark EMI as paid
  if (transaction) {
    markEMIPaid(
      selectedEMIPayment.value.loan.id,
      selectedEMIPayment.value.payment.month,
      [selectedStockForEMI.value.id]
    )
  }

  showSellForEMI.value = false
  selectedEMIPayment.value = null
  selectedStockForEMI.value = null
}

const markPaymentPaid = (loanId: string, month: number) => {
  if (confirm('Mark this EMI payment as paid?')) {
    markEMIPaid(loanId, month)
  }
}
</script>

