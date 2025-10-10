<template>
  <ion-card class="leaderboard-card" :class="{ 'top-three': entry.rank <= 3 }">
    <div class="card-content">
      <!-- Rank badge -->
      <div class="rank-badge" :class="getRankClass(entry.rank)">
        <span class="rank-number">{{ entry.rank }}</span>
        <ion-icon 
          v-if="entry.rank <= 3" 
          :icon="getRankIcon(entry.rank)" 
          class="rank-icon"
        />
      </div>
      
      <!-- Song info -->
      <div class="song-info">
        <h3 class="song-title">{{ entry.title }}</h3>
        <p class="song-artist">{{ entry.artist }}</p>
        <p class="song-genre" v-if="entry.genre">{{ entry.genre }}</p>
        <p class="song-username" v-if="entry.username">by {{ entry.username }}</p>
      </div>
      
      <!-- Stats -->
      <div class="stats">
        <div class="stat-item">
          <span class="stat-value">{{ entry.score.toFixed(1) }}</span>
          <span class="stat-label">Score</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ entry.total_votes }}</span>
          <span class="stat-label">Votes</span>
        </div>
        <div class="stat-item" v-if="showWinRate">
          <span class="stat-value">{{ winRate }}%</span>
          <span class="stat-label">Win Rate</span>
        </div>
      </div>
      
      <!-- Trend indicator -->
      <div class="trend" v-if="showTrend">
        <ion-icon 
          :icon="trendIcon" 
          :class="trendClass"
          class="trend-icon"
        />
        <span class="trend-text">{{ trendText }}</span>
      </div>
    </div>
    
    <!-- Play button -->
    <div class="play-button" v-if="showPlayButton" @click="handlePlay">
      <ion-button fill="clear" class="play-btn">
        <ion-icon :icon="play" />
      </ion-button>
    </div>
  </ion-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonCard, IonIcon, IonButton } from '@ionic/vue'
import { trophy, medal, star, play, trendingUp, trendingDown, remove } from 'ionicons/icons'

interface LeaderboardEntry {
  song_id: string
  title: string
  artist: string
  genre: string
  score: number
  total_votes: number
  rank: number
  week_number: number
  is_active: boolean
  username: string
  previous_rank?: number
  trend?: 'up' | 'down' | 'same'
}

interface Props {
  entry: LeaderboardEntry
  showWinRate?: boolean
  showTrend?: boolean
  showPlayButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showWinRate: true,
  showTrend: true,
  showPlayButton: true
})

const emit = defineEmits<{
  play: [entry: LeaderboardEntry]
}>()

const winRate = computed(() => {
  // Calculate win rate from score and total votes
  // This is a simplified calculation - actual implementation would depend on the scoring algorithm
  return Math.round((props.entry.score / props.entry.total_votes) * 100) || 0
})

const trendIcon = computed(() => {
  if (!props.entry.trend) return remove
  switch (props.entry.trend) {
    case 'up': return trendingUp
    case 'down': return trendingDown
    default: return remove
  }
})

const trendClass = computed(() => {
  if (!props.entry.trend) return 'trend-same'
  return `trend-${props.entry.trend}`
})

const trendText = computed(() => {
  if (!props.entry.trend || props.entry.trend === 'same') return '—'
  
  const change = Math.abs((props.entry.previous_rank || 0) - props.entry.rank)
  if (change === 0) return '—'
  
  const direction = props.entry.trend === 'up' ? '↗' : '↘'
  return `${direction}${change}`
})

const getRankClass = (rank: number) => {
  if (rank === 1) return 'rank-gold'
  if (rank === 2) return 'rank-silver'
  if (rank === 3) return 'rank-bronze'
  return 'rank-normal'
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return trophy
    case 2: return medal
    case 3: return star
    default: return trophy
  }
}

const handlePlay = () => {
  emit('play', props.entry)
}
</script>

<style scoped>
.leaderboard-card {
  margin: 0.5rem;
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  background: var(--card-bg);
  border: 2px solid var(--card-border);
}

.leaderboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.leaderboard-card.top-three {
  border-width: 3px;
}

.rank-gold {
  border-color: #ffd700;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
}

.rank-silver {
  border-color: #c0c0c0;
  background: linear-gradient(135deg, #c0c0c0, #e5e5e5);
}

.rank-bronze {
  border-color: #cd7f32;
  background: linear-gradient(135deg, #cd7f32, #daa520);
}

.card-content {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rank-badge {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #000000;
  font-weight: 900;
  position: relative;
}

.rank-number {
  font-size: 1.25rem;
  line-height: 1;
}

.rank-icon {
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 1rem;
  color: #000000;
}

.rank-normal {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.song-artist {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0 0 0.25rem 0;
}

.song-genre {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0 0 0.25rem 0;
  font-style: italic;
}

.song-username {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin: 0;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 80px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.trend {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 60px;
}

.trend-icon {
  font-size: 1.25rem;
}

.trend-text {
  font-size: 0.875rem;
  font-weight: 600;
}

.trend-up {
  color: #10b981;
}

.trend-down {
  color: #ef4444;
}

.trend-same {
  color: var(--text-muted);
}

.play-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 10;
}

.play-btn {
  --color: var(--text-primary);
  --background: rgba(255, 255, 255, 0.9);
  --border-radius: 50%;
  width: 40px;
  height: 40px;
}

/* Dark theme adjustments */
[data-theme="dark"] .leaderboard-card {
  background: #1f2937 !important;
  border-color: #4b5563 !important;
}

[data-theme="dark"] .leaderboard-card:hover {
  background: #374151 !important;
}

[data-theme="dark"] .play-btn {
  --background: rgba(0, 0, 0, 0.8);
  --color: #ffffff;
}
</style>
