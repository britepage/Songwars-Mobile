<template>
  <div class="golden-ears-history">
    <div class="history-header" v-if="title">
      <h3>{{ title }}</h3>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <ion-spinner name="crescent" color="primary" />
      <p>Loading history...</p>
    </div>
    
    <!-- Awards List -->
    <ion-list v-else-if="awards.length > 0" class="awards-list">
      <ion-item
        v-for="award in awards"
        :key="award.id"
        class="award-item"
      >
        <ion-avatar slot="start" class="award-avatar">
          <img
            :src="award.judge?.avatar_url || '/default-avatar.png'"
            :alt="award.judge?.username"
          />
          <div class="golden-overlay">
            <ion-icon :icon="ear" />
          </div>
        </ion-avatar>
        
        <ion-label>
          <h3>{{ award.judge?.username || 'Unknown' }}</h3>
          <p>{{ award.accuracy_score }}% accuracy</p>
          <p class="award-meta">
            Week {{ award.week_number }} • Rank #{{ award.rank_position }}
          </p>
        </ion-label>
        
        <div slot="end" class="award-badge">
          <GoldenEarsBadge
            :is-earned="true"
            :accuracy="award.accuracy_score"
            :show-text="false"
            :show-tooltip="false"
          />
        </div>
      </ion-item>
    </ion-list>
    
    <!-- Empty State -->
    <div v-else class="empty-state">
      <ion-icon :icon="ear" class="empty-icon" />
      <h4>No Golden Ears Yet</h4>
      <p>Golden Ears awards will appear here</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonIcon,
  IonSpinner
} from '@ionic/vue'
import { ear } from 'ionicons/icons'
import GoldenEarsBadge from '@/components/core/GoldenEarsBadge.vue'

interface GoldenEarsAward {
  id: string
  judge_id: string
  week_start: string
  week_end: string
  battles_judged: number
  accuracy_score: number
  rank_position: number
  awarded: boolean
  week_number?: number
  judge?: {
    username: string
    avatar_url?: string
  }
}

interface Props {
  awards: GoldenEarsAward[]
  title?: string
  isLoading?: boolean
}

withDefaults(defineProps<Props>(), {
  title: 'Golden Ears History',
  isLoading: false
})
</script>

<style scoped>
.golden-ears-history {
  width: 100%;
}

.history-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.history-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.loading-state {
  gap: 1rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  color: var(--text-muted);
  opacity: 0.5;
  margin-bottom: 1rem;
}

.empty-state h4 {
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: var(--text-secondary);
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
