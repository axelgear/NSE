<template>
  <div :class="[
    'bg-white rounded-xl shadow-sm p-6 border-l-4 transition-all hover:shadow-md',
    borderColor
  ]">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-600 mb-1">{{ title }}</p>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ value }}</h3>
        <p class="text-xs text-gray-500">{{ subtitle }}</p>
      </div>
      <div :class="['p-3 rounded-lg', iconBgColor]">
        <Icon :name="icon" :class="['text-2xl', iconColor]" />
      </div>
    </div>
    <div v-if="trend !== undefined" class="mt-4 flex items-center">
      <Icon 
        :name="trend >= 0 ? 'mdi:trending-up' : 'mdi:trending-down'" 
        :class="trend >= 0 ? 'text-green-500' : 'text-red-500'"
      />
      <span :class="['text-sm ml-1', trend >= 0 ? 'text-green-600' : 'text-red-600']">
        {{ Math.abs(trend).toFixed(2) }}%
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string
  value: string
  subtitle: string
  icon: string
  color?: string
  trend?: number
}>()

const colorClasses = {
  blue: {
    border: 'border-blue-500',
    iconBg: 'bg-blue-100',
    icon: 'text-blue-600'
  },
  green: {
    border: 'border-green-500',
    iconBg: 'bg-green-100',
    icon: 'text-green-600'
  },
  red: {
    border: 'border-red-500',
    iconBg: 'bg-red-100',
    icon: 'text-red-600'
  },
  purple: {
    border: 'border-purple-500',
    iconBg: 'bg-purple-100',
    icon: 'text-purple-600'
  },
  orange: {
    border: 'border-orange-500',
    iconBg: 'bg-orange-100',
    icon: 'text-orange-600'
  }
}

const currentColor = computed(() => colorClasses[props.color as keyof typeof colorClasses] || colorClasses.blue)
const borderColor = computed(() => currentColor.value.border)
const iconBgColor = computed(() => currentColor.value.iconBg)
const iconColor = computed(() => currentColor.value.icon)
</script>

