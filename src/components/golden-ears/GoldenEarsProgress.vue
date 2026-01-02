<template>
  <div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center">
        <GoldenEarsIcon class="w-6 h-6 mr-2 text-[#ffd200]" />
        <h3 class="text-xl font-semibold flex items-center theme-text-primary">
          Golden Ears Progress
          <span
            v-if="isQualified"
            class="ml-2 text-green-600 text-sm"
          >
            Qualified
          </span>
        </h3>
      </div>
      <button
        class="text-xs transition-colors theme-text-secondary hover:opacity-80"
        @click="$emit('refresh')"
        :disabled="isLoading"
        aria-label="Refresh"
      >
        <ion-icon :icon="refresh" class="w-4 h-4" />
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center">
      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-[#ffd200] mx-auto" />
    </div>

    <!-- Error / no data -->
    <div
      v-else-if="!hasProgressData"
      class="text-center text-red-600 text-sm"
    >
      Unable to load Golden Ears progress.
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Week Display -->
      <div v-if="weekRange" class="text-sm -mt-4 mb-6 theme-text-secondary">
        {{ weekRange }}
      </div>

      <!-- Progress Bar -->
      <div class="mb-4">
        <div class="flex justify-between text-sm mb-2 theme-text-secondary">
          <span>Battles: {{ battlesCompleted }}/{{ battlesRequired }}</span>
          <span>{{ progressPercentage }}%</span>
        </div>
        <div class="w-full rounded-full h-2 bg-gray-200">
          <div
            class="bg-[#ffd200] h-2 rounded-full transition-all duration-300"
            :style="{ width: `${progressPercentage}%` }"
          />
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="border rounded-lg p-3 text-center theme-bg-subcard-soft theme-border-subcard-soft">
          <div class="font-bold text-lg theme-text-primary">{{ battlesCompleted }}</div>
          <div class="text-xs theme-text-secondary">Battles</div>
        </div>
        <div class="border rounded-lg p-3 text-center theme-bg-subcard-soft theme-border-subcard-soft">
          <div class="font-bold text-lg theme-text-primary">{{ Math.round(accuracy) }}%</div>
          <div class="text-xs theme-text-secondary">Accuracy</div>
        </div>
      </div>

      <!-- Qualification Message -->
      <div class="text-center">
        <p class="text-sm theme-text-secondary">
          {{ qualificationMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonIcon } from '@ionic/vue'
import { refresh } from 'ionicons/icons'
import GoldenEarsIcon from '@/components/icons/GoldenEarsIcon.vue'

interface ProgressData {
  battles_judged?: number
  battles_required?: number
  accuracy?: number
  week_start?: string
  week_end?: string
  qualified?: boolean
  battles_needed?: number
}

interface Props {
  progressData?: ProgressData | null
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  progressData: null,
  isLoading: false
})

const emit = defineEmits<{
  refresh: []
}>()

const battlesCompleted = computed(() => props.progressData?.battles_judged || 0)
const battlesRequired = computed(() => props.progressData?.battles_required || 20)
const accuracy = computed(() => props.progressData?.accuracy || 0)
const isQualified = computed(() => props.progressData?.qualified ?? false)
const hasProgressData = computed(() => !!props.progressData)
const progressPercentage = computed(() => {
  if (battlesRequired.value === 0) return 0
  return Math.min(100, Math.round((battlesCompleted.value / battlesRequired.value) * 100))
})

const weekRange = computed(() => {
  if (!props.progressData?.week_start) return null
  
  const start = new Date(props.progressData.week_start)
  const end = props.progressData.week_end 
    ? new Date(props.progressData.week_end)
    : new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000)
  
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  
  return `Week ${startStr}-${endStr}`
})

const qualificationMessage = computed(() => {
  const needed = battlesRequired.value - battlesCompleted.value
  if (needed <= 0) {
    return 'You\'re qualified for Golden Ears!'
  }
  return `${needed} more ${needed === 1 ? 'battle' : 'battles'} needed to qualify`
})
</script>
