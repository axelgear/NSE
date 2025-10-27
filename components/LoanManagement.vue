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
          <button
            @click="deleteLoanItem(loan.id)"
            class="text-red-600 hover:text-red-700"
          >
            <Icon name="mdi:delete" />
          </button>
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
          <h4 class="text-sm font-semibold text-gray-700 mb-3">Payment Schedule</h4>
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
        <div class="bg-purple-50 p-4 rounded-lg">
          <div class="flex justify-between text-sm">
            <span>Total EMI Amount:</span>
            <span class="font-semibold">{{ formatCurrency(newLoan.numberOfPayments * newLoan.emiPerMonth) }}</span>
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
import type { Loan } from '~/types'
import { formatCurrency } from '~/utils/calculations'

const { data, addLoan, updateLoan } = useAppData()

const showAddLoan = ref(false)

const newLoan = ref({
  name: '',
  principalAmount: 0,
  numberOfPayments: 12,
  emiPerMonth: 0
})

const calculatePaidEMI = (loan: Loan) => {
  return loan.paymentsSchedule
    .filter(p => p.paid)
    .reduce((sum, p) => sum + p.emiAmount, 0)
}

const calculateProgress = (loan: Loan) => {
  const paid = calculatePaidEMI(loan)
  return Math.round((paid / loan.totalEMI) * 100)
}

const addNewLoan = () => {
  const totalEMI = newLoan.value.numberOfPayments * newLoan.value.emiPerMonth
  let remaining = newLoan.value.principalAmount
  
  const paymentsSchedule = []
  for (let i = 1; i <= newLoan.value.numberOfPayments; i++) {
    const emiAmount = i === newLoan.value.numberOfPayments 
      ? remaining 
      : newLoan.value.emiPerMonth
    
    remaining -= emiAmount
    
    paymentsSchedule.push({
      month: i,
      emiAmount,
      principalRemaining: Math.max(0, remaining),
      paid: false
    })
  }

  addLoan({
    name: newLoan.value.name,
    principalAmount: newLoan.value.principalAmount,
    totalEMI,
    emiPerMonth: newLoan.value.emiPerMonth,
    paymentsSchedule,
    startDate: new Date().toISOString()
  })

  // Reset form
  newLoan.value = { name: '', principalAmount: 0, numberOfPayments: 12, emiPerMonth: 0 }
  showAddLoan.value = false
}

const deleteLoanItem = (id: string) => {
  if (confirm('Are you sure you want to delete this loan?')) {
    data.value.loans = data.value.loans.filter(l => l.id !== id)
  }
}
</script>

