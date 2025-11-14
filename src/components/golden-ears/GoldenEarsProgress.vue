<template>
  <div class="golden-ears-progress-card theme-bg-card theme-border-card">
    <div class="card-header">
      <div class="header-left">
        <ion-icon :icon="checkmarkCircle" class="header-icon" />
        <h3 class="card-title">Golden Ears Progress</h3>
      </div>
      <button class="refresh-button" @click="$emit('refresh')" aria-label="Refresh">
        <ion-icon :icon="refresh" />
      </button>
    </div>
    
    <div class="card-content">
      <!-- Week Display -->
      <div v-if="weekRange" class="week-range">{{ weekRange }}</div>
      
      <!-- Progress Bar -->
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">Battles: {{ battlesCompleted }}/{{ battlesRequired }}</span>
          <span class="progress-percentage">{{ progressPercentage }}%</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" :style="{ width: `${progressPercentage}%` }"></div>
        </div>
      </div>
      
      <!-- Stats Cards -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-number">{{ battlesCompleted }}</div>
          <div class="stat-label">Battles</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ Math.round(accuracy) }}%</div>
          <div class="stat-label">Accuracy</div>
        </div>
      </div>
      
      <!-- Qualification Message -->
      <div class="qualification-message">
        <p>{{ qualificationMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonIcon } from '@ionic/vue'
import { checkmarkCircle, refresh } from 'ionicons/icons'

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

<style scoped>
.golden-ears-progress-card {
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  font-size: 1.5rem;
  color: #ffd200;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.refresh-button {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.refresh-button:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.week-range {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.progress-percentage {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 600;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: #ffd200;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-card {
  text-align: center;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 0.5rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.qualification-message {
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  text-align: center;
}

.qualification-message p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>
