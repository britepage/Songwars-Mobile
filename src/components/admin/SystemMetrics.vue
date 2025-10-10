<template>
  <div class="system-metrics">
    <h3 v-if="title" class="metrics-title">{{ title }}</h3>
    
    <div class="metrics-grid">
      <!-- Total Users -->
      <ion-card class="metric-card">
        <ion-card-content>
          <div class="metric-icon-container">
            <ion-icon :icon="people" class="metric-icon" />
          </div>
          <h4 class="metric-value">{{ formatNumber(metrics.totalUsers) }}</h4>
          <p class="metric-label">Total Users</p>
          <div class="metric-change" :class="getChangeClass(metrics.usersChange)">
            <ion-icon :icon="getTrendIcon(metrics.usersChange)" />
            <span>{{ formatChange(metrics.usersChange) }}</span>
          </div>
        </ion-card-content>
      </ion-card>
      
      <!-- Total Songs -->
      <ion-card class="metric-card">
        <ion-card-content>
          <div class="metric-icon-container">
            <ion-icon :icon="musicalNotes" class="metric-icon" />
          </div>
          <h4 class="metric-value">{{ formatNumber(metrics.totalSongs) }}</h4>
          <p class="metric-label">Total Songs</p>
          <div class="metric-change" :class="getChangeClass(metrics.songsChange)">
            <ion-icon :icon="getTrendIcon(metrics.songsChange)" />
            <span>{{ formatChange(metrics.songsChange) }}</span>
          </div>
        </ion-card-content>
      </ion-card>
      
      <!-- Total Battles -->
      <ion-card class="metric-card">
        <ion-card-content>
          <div class="metric-icon-container">
            <ion-icon :icon="flash" class="metric-icon" />
          </div>
          <h4 class="metric-value">{{ formatNumber(metrics.totalBattles) }}</h4>
          <p class="metric-label">Total Battles</p>
          <div class="metric-change" :class="getChangeClass(metrics.battlesChange)">
            <ion-icon :icon="getTrendIcon(metrics.battlesChange)" />
            <span>{{ formatChange(metrics.battlesChange) }}</span>
          </div>
        </ion-card-content>
      </ion-card>
      
      <!-- Active Flags -->
      <ion-card class="metric-card">
        <ion-card-content>
          <div class="metric-icon-container">
            <ion-icon :icon="flag" class="metric-icon" />
          </div>
          <h4 class="metric-value">{{ formatNumber(metrics.activeFlags) }}</h4>
          <p class="metric-label">Active Flags</p>
          <ion-badge v-if="metrics.activeFlags > 0" color="danger" class="alert-badge">
            Needs Attention
          </ion-badge>
        </ion-card-content>
      </ion-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardContent,
  IonIcon,
  IonBadge
} from '@ionic/vue'
import { people, musicalNotes, flash, flag, trendingUp, trendingDown, remove } from 'ionicons/icons'

interface SystemMetrics {
  totalUsers: number
  totalSongs: number
  totalBattles: number
  activeFlags: number
  usersChange?: number
  songsChange?: number
  battlesChange?: number
}

interface Props {
  metrics: SystemMetrics
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: 'System Metrics'
})

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const formatChange = (change?: number) => {
  if (!change) return '—'
  const sign = change > 0 ? '+' : ''
  return `${sign}${change}%`
}

const getChangeClass = (change?: number) => {
  if (!change) return 'neutral'
  return change > 0 ? 'positive' : 'negative'
}

const getTrendIcon = (change?: number) => {
  if (!change) return remove
  return change > 0 ? trendingUp : trendingDown
}
</script>

<style scoped>
.system-metrics {
  width: 100%;
  padding: 1rem;
}

.metrics-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.metric-card {
  margin: 0;
  text-align: center;
}

.metric-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  background: var(--bg-tertiary);
  border-radius: 50%;
}

.metric-icon {
  font-size: 2rem;
  color: var(--ion-color-primary);
}

.metric-value {
  font-size: 2rem;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.metric-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
}

.metric-change {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.metric-change.positive {
  color: #10b981;
}

.metric-change.negative {
  color: #ef4444;
}

.metric-change.neutral {
  color: var(--text-muted);
}

.alert-badge {
  margin-top: 0.5rem;
}
</style>
