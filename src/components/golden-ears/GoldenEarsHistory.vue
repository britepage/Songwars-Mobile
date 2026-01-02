<template>
  <div class="golden-ears-history theme-bg-card theme-border-card">
    <div class="card-header">
      <div class="header-left">
        <GoldenEarsIcon class="w-6 h-6 header-icon" />
        <h3 class="card-title">{{ title }}</h3>
      </div>
      <button class="refresh-button" @click="$emit('refresh')" aria-label="Refresh">
        <ion-icon :icon="refresh" />
      </button>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <ion-spinner name="crescent" color="primary" />
      <p>Loading history...</p>
    </div>
    
    <!-- Awards List -->
    <div v-else-if="awards.length > 0" class="awards-list">
      <div
        v-for="award in awards"
        :key="award.id"
        class="award-card"
      >
        <div class="award-date-range">{{ formatDateRange(award.week_start, award.week_end) }}</div>
        <div class="award-badge-label">Golden Ears</div>
        
        <div class="award-stats">
          <div class="award-stat">
            <span class="stat-label">Battles:</span>
            <span class="stat-value">{{ award.battles_judged }}</span>
          </div>
          <div class="award-stat">
            <span class="stat-label">Accuracy:</span>
            <span class="stat-value">{{ Math.round(award.accuracy_score) }}%</span>
          </div>
        </div>
        
        <div class="award-rank">
          <span class="rank-label">Rank:</span>
          <span class="rank-value">#{{ award.rank_position }}</span>
          <ion-icon :icon="trophy" class="trophy-icon" />
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="empty-state">
      <ion-icon :icon="ear" class="empty-icon" />
      <h4>No Golden Ears Yet</h4>
      <p>Golden Ears awards will appear here</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonSpinner } from '@ionic/vue'
import { ear, refresh, trophy } from 'ionicons/icons'
import GoldenEarsIcon from '@/components/icons/GoldenEarsIcon.vue'

interface GoldenEarsAward {
  id: string
  judge_id: string
  week_start: string
  week_end: string
  battles_judged: number
  accuracy_score: number
  rank_position: number
  awarded: boolean
}

interface Props {
  awards: GoldenEarsAward[]
  title?: string
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Golden Ears History',
  isLoading: false
})

const emit = defineEmits<{
  refresh: []
}>()

const formatDateRange = (start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  
  const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  
  return `${startStr}-${endStr}`
}
</script>

<style scoped>
.golden-ears-history {
  border-radius: 0.5rem;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  width: 24px;
  height: 24px;
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

.awards-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.award-card {
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
}

.award-date-range {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.award-badge-label {
  display: inline-block;
  color: #ffd200;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.award-stats {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 0.75rem;
}

.award-stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.award-rank {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rank-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.rank-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.trophy-icon {
  font-size: 1.25rem;
  color: #ffd200;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 1rem;
  text-align: center;
}

.loading-state {
  gap: 1rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  color: #ffd200;
  margin-bottom: 1rem;
}

.empty-state h4 {
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.awards-list {
  background: transparent;
}

.award-item {
  --background: var(--card-bg);
  --border-color: var(--border-color);
  margin-bottom: 0.5rem;
}

.award-avatar {
  position: relative;
}

.golden-overlay {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--card-bg);
}

.golden-overlay ion-icon {
  font-size: 0.75rem;
  color: #000;
}

.award-item h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.award-item p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.award-meta {
  font-size: 0.75rem !important;
  color: var(--text-muted) !important;
  margin-top: 0.25rem !important;
}

.award-badge {
  display: flex;
  align-items: center;
}
</style>
