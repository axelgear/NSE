<template>
  <div class="bg-gray-900 text-white p-4 rounded-lg space-y-3 text-sm">
    <h4 class="font-semibold text-base mb-3">Charges Breakdown</h4>
    
    <!-- Turnover -->
    <div class="flex justify-between pb-2 border-b border-gray-700">
      <span class="text-gray-400">Turnover</span>
      <span class="font-semibold">{{ formatCurrency(breakdown.turnover) }}</span>
    </div>

    <!-- P&L (if selling) -->
    <div v-if="type === 'sell' && profitLoss !== undefined" class="flex justify-between pb-2 border-b border-gray-700">
      <span class="text-gray-400">P&L</span>
      <span :class="profitLoss >= 0 ? 'text-green-400' : 'text-red-400'" class="font-semibold">
        {{ profitLoss >= 0 ? '+' : '' }}{{ formatCurrency(profitLoss) }}
      </span>
    </div>

    <!-- Total Charges -->
    <div class="flex justify-between font-semibold">
      <span class="text-gray-400">Charges</span>
      <span class="text-red-400">{{ formatCurrency(breakdown.totalCharges) }}</span>
    </div>

    <!-- Brokerage Charges -->
    <div class="ml-4 space-y-1 text-xs">
      <div class="flex justify-between">
        <span class="text-gray-500">{{ brokerName }} charges (Brokerage)</span>
        <span>{{ formatCurrency(breakdown.brokerage) }}</span>
      </div>
    </div>

    <!-- Non-Brokerage Charges -->
    <div class="ml-4 space-y-1 text-xs">
      <div class="flex justify-between text-gray-400 font-medium mb-1">
        <span>Non-{{ brokerName }} charges</span>
        <span>{{ formatCurrency(nonBrokerageCharges) }}</span>
      </div>
      
      <div class="ml-4 space-y-1">
        <div class="flex justify-between">
          <span class="text-gray-500">Securities Transaction Tax (STT)</span>
          <span>{{ formatCurrency(breakdown.stt) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Exchange charges</span>
          <span>{{ formatCurrency(breakdown.exchangeCharges) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">SEBI Turnover Fees</span>
          <span>{{ formatCurrency(breakdown.sebiCharges) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">IPFT (NSE)</span>
          <span>{{ formatCurrency(breakdown.ipft) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">GST</span>
          <span>{{ formatCurrency(breakdown.gst) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">Stamp Duty</span>
          <span>{{ formatCurrency(breakdown.stampDuty) }}</span>
        </div>
      </div>
    </div>

    <!-- Net P&L or Net Amount -->
    <div class="flex justify-between pt-3 border-t-2 border-gray-600 font-bold text-base">
      <span>{{ type === 'sell' ? 'Net P&L' : 'Net Amount' }}</span>
      <span :class="netPL >= 0 ? 'text-green-400' : 'text-red-400'">
        {{ formatCurrency(Math.abs(netPL)) }}
      </span>
    </div>

    <!-- Additional Info -->
    <div class="text-xs text-gray-500 pt-2 border-t border-gray-700">
      <p>* All charges are as per Indian stock market regulations</p>
      <p class="mt-1">* STT: {{ type === 'buy' ? '0.1%' : '0.025%' }} on {{ type === 'buy' ? 'buy' : 'sell' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BrokerageBreakdown } from '~/types'
import { formatCurrency } from '~/utils/calculations'

const props = defineProps<{
  breakdown: BrokerageBreakdown
  type: 'buy' | 'sell'
  profitLoss?: number
  brokerName?: string
}>()

const nonBrokerageCharges = computed(() => {
  return props.breakdown.totalCharges - props.breakdown.brokerage
})

const netPL = computed(() => {
  if (props.type === 'sell' && props.profitLoss !== undefined) {
    return props.profitLoss - props.breakdown.totalCharges
  }
  return props.breakdown.netAmount
})
</script>

