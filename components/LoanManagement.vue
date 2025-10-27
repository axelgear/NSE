<template>
  <div class="space-y-6">
    <!-- Add Loan Button -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold text-gray-900">Loan Management</h2>
        <button
          @click="showAddLoan = true"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Icon name="mdi:plus" />
          Add Loan
        </button>
      </div>
    </div>

    <!-- Loan List -->
    <div v-if="data.loans.length > 0" class="space-y-4">
      <div
        v-for="loan in data.loans"
        :key="loan.id"
        class="bg-white rounded-lg shadow-sm p-6"
      >
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-lg font-bold text-gray-900">{{ loan.name }}</h3>
            <p class="text-sm text-gray-500">{{ loan.paymentsSchedule.length }} EMI payments</p>
          </div>
          <div class="flex gap-3">
            <button
              @click="editLoan(loan)"
              class="text-blue-600 hover:text-blue-700"
              title="Edit loan (set payment day/start date)"
            >
              <Icon name="mdi:pencil" />
            </button>
            <button
              @click="deleteLoanItem(loan.id)"
              class="text-red-600 hover:text-red-700"
            >
              <Icon name="mdi:delete" />
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p class="text-xs text-gray-500">Principal Amount</p>
            <p class="text-sm font-semibold">{{ formatCurrency(loan.principalAmount) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Total EMI</p>
            <p class="text-sm font-semibold">{{ formatCurrency(loan.totalEMI) }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Paid EMI</p>
            <p class="text-sm font-semibold text-green-600">
              {{ formatCurrency(calculatePaidEMI(loan)) }}
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Pending EMI</p>
            <p class="text-sm font-semibold text-orange-600">
              {{ formatCurrency(loan.totalEMI - calculatePaidEMI(loan)) }}
            </p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-4">
          <div class="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{{ calculateProgress(loan) }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-green-600 h-2 rounded-full transition-all"
              :style="{ width: calculateProgress(loan) + '%' }"
            ></div>
          </div>
        </div>

        <!-- EMI Schedule -->
        <div class="border-t border-gray-200 pt-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-3">Payment Schedule (Due on {{ loan.paymentDay || 3 }} of each month)</h4>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            <div
              v-for="payment in loan.paymentsSchedule"
              :key="payment.month"
              :class="[
                'flex justify-between items-center p-3 rounded-lg',
                payment.paid ? 'bg-green-50' : 'bg-gray-50'
              ]"
            >
              <div class="flex items-center gap-3">
                <Icon
                  :name="payment.paid ? 'mdi:check-circle' : 'mdi:circle-outline'"
                  :class="payment.paid ? 'text-green-600' : 'text-gray-400'"
                />
                <div>
                  <p class="text-sm font-medium">Month {{ payment.month }}</p>
                  <p class="text-xs text-gray-500">{{ formatCurrency(payment.emiAmount) }}</p>
                  <p v-if="payment.dueDate" class="text-[11px] text-gray-400">Due: {{ new Date(payment.dueDate).toLocaleDateString('en-IN') }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500">Balance</p>
                <p class="text-sm font-semibold">{{ formatCurrency(payment.principalRemaining) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bg-white rounded-lg shadow-sm p-12 text-center">
      <Icon name="mdi:bank" class="text-6xl text-gray-300 mb-4" />
      <p class="text-gray-500">No loans added. Add your first loan to start tracking EMI payments.</p>
    </div>

    <!-- Add Loan Modal -->
    <Modal v-if="showAddLoan" @close="showAddLoan = false" title="Add Loan">
      <form @submit.prevent="addNewLoan" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Loan Name</label>
          <input
            v-model="newLoan.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="e.g., Loan 1"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Principal Amount (₹)</label>
          <input
            v-model.number="newLoan.principalAmount"
            type="number"
            required
            min="0"
            step="0.01"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Number of EMI Payments</label>
          <input
            v-model.number="newLoan.numberOfPayments"
            type="number"
            required
            min="1"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">EMI Amount per Month (₹)</label>
          <input
            v-model.number="newLoan.emiPerMonth"
            type="number"
            required
            min="0"
            step="0.01"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Payment Day (1-28)</label>
            <input
              v-model.number="newLoan.paymentDay"
              type="number"
              min="1"
              max="28"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Default 3"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              v-model="newLoan.startDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="flex justify-between text-sm">
            <span>Total EMI Amount:</span>
            <span class="font-semibold">{{ formatCurrency(totalEmiPreview) }}</span>
          </div>
          <div class="flex justify-between text-xs text-gray-600 mt-1">
            <span>Estimated Last EMI:</span>
            <span class="font-medium">{{ formatCurrency(lastEmiPreview) }}</span>
          </div>
        </div>
        <div class="flex gap-3">
          <button
            type="submit"
            class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add Loan
          </button>
          <button
            type="button"
            @click="showAddLoan = false"
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
import type { Loan, EMIPayment } from '~/types'
import { formatCurrency } from '~/utils/calculations'

const { data, addLoan, updateLoan, saveAppData } = useAppData()

const showAddLoan = ref(false)

const newLoan = ref({
  name: '',
  principalAmount: 0,
  numberOfPayments: 12,
  emiPerMonth: 0,
  paymentDay: 3,
  startDate: ''
})

// Preview totals ensuring total equals principal and last EMI adjusts
const totalEmiPreview = computed(() => newLoan.value.principalAmount || 0)
const lastEmiPreview = computed(() => {
  const n = newLoan.value.numberOfPayments || 0
  const emi = newLoan.value.emiPerMonth || 0
  const principal = newLoan.value.principalAmount || 0
  if (n <= 0) return 0
  const paidBeforeLast = Math.max(0, (n - 1) * emi)
  const remainder = Math.max(0, principal - paidBeforeLast)
  return remainder
})

const calculatePaidEMI = (loan: Loan) => {
  return loan.paymentsSchedule
    .filter((p: any) => p.paid)
    .reduce((sum: number, p: any) => sum + p.emiAmount, 0)
}

const calculateProgress = (loan: Loan) => {
  const paid = calculatePaidEMI(loan)
  return Math.round((paid / loan.totalEMI) * 100)
}

const addNewLoan = () => {
  const totalEMI = newLoan.value.principalAmount
  let remaining = newLoan.value.principalAmount
  
  const paymentsSchedule = []
  const start = newLoan.value.startDate ? new Date(newLoan.value.startDate) : new Date()
  const payDay = newLoan.value.paymentDay || 3
  for (let i = 1; i <= newLoan.value.numberOfPayments; i++) {
    const emiAmount = i === newLoan.value.numberOfPayments 
      ? remaining 
      : newLoan.value.emiPerMonth
    
    remaining -= emiAmount
    // Compute due date as payDay of each month starting next month from start
    const dueBase = new Date(start)
    dueBase.setMonth(dueBase.getMonth() + (i - 1))
    const dueDate = new Date(dueBase.getFullYear(), dueBase.getMonth(), Math.min(payDay, 28))

    paymentsSchedule.push({
      month: i,
      emiAmount,
      principalRemaining: Math.max(0, remaining),
      paid: false,
      dueDate: dueDate.toISOString()
    })
  }

  addLoan({
    name: newLoan.value.name,
    principalAmount: newLoan.value.principalAmount,
    totalEMI,
    emiPerMonth: newLoan.value.emiPerMonth,
    paymentsSchedule,
    startDate: (newLoan.value.startDate ? new Date(newLoan.value.startDate) : new Date()).toISOString(),
    paymentDay: newLoan.value.paymentDay || 3
  })

  // Reset form
  newLoan.value = { name: '', principalAmount: 0, numberOfPayments: 12, emiPerMonth: 0, paymentDay: 3, startDate: '' }
  showAddLoan.value = false
}

const deleteLoanItem = async (id: string) => {
  if (confirm('Are you sure you want to delete this loan?')) {
    data.value.loans = data.value.loans.filter((l: Loan) => l.id !== id)
    await saveAppData()
  }
}

// Simple inline edit: opens a prompt to update payment day and start date
const editLoan = async (loan: Loan) => {
  const dayInput = prompt('Payment day of month (1-28):', String(loan.paymentDay || 3))
  if (!dayInput) return
  const day = Math.min(28, Math.max(1, parseInt(dayInput)))

  const startInput = prompt('Start date (YYYY-MM-DD):', loan.startDate ? loan.startDate.substring(0, 10) : '')
  const startDateStr = startInput && startInput.length > 0 ? startInput : new Date().toISOString().substring(0, 10)

  // Rebuild schedule due dates preserving paid status and amounts
  const start = new Date(startDateStr)
  const updatedSchedule = loan.paymentsSchedule.map((p) => {
    const dueBase = new Date(start)
    dueBase.setMonth(dueBase.getMonth() + (p.month - 1))
    const dueDate = new Date(dueBase.getFullYear(), dueBase.getMonth(), Math.min(day, 28))
    return { ...p, dueDate: dueDate.toISOString() }
  })

  await updateLoan(loan.id, { paymentDay: day, startDate: new Date(startDateStr).toISOString(), paymentsSchedule: updatedSchedule })
}
</script>

