<template>
  <div class="battle-animation" :class="{ 'active': isActive }">
    <!-- VS text with glow effect -->
    <div class="vs-container">
      <h2 class="vs-text">VS</h2>
    </div>
    
    <!-- Song A (Left) -->
    <div class="song-container song-a">
      <div class="song-card">
        <div class="song-info">
          <h3 class="song-title">{{ songA?.title || 'Song A' }}</h3>
          <p class="song-artist">{{ songA?.artist || 'Artist A' }}</p>
        </div>
        <div class="vote-count" v-if="showVotes">
          {{ votesA || 0 }}
        </div>
      </div>
    </div>
    
    <!-- Song B (Right) -->
    <div class="song-container song-b">
      <div class="song-card">
        <div class="song-info">
          <h3 class="song-title">{{ songB?.title || 'Song B' }}</h3>
          <p class="song-artist">{{ songB?.artist || 'Artist B' }}</p>
        </div>
        <div class="vote-count" v-if="showVotes">
          {{ votesB || 0 }}
        </div>
      </div>
    </div>
    
    <!-- Battle progress bar -->
    <div class="progress-container" v-if="showProgress">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      <div class="progress-text">
        {{ totalVotes }} votes
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Song {
  id: string
  title: string
  artist: string
  url?: string
}

interface Props {
  songA?: Song
  songB?: Song
  votesA?: number
  votesB?: number
  isActive?: boolean
  showVotes?: boolean
  showProgress?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
  showVotes: true,
  showProgress: true
})

const totalVotes = computed(() => (props.votesA || 0) + (props.votesB || 0))

const progressPercentage = computed(() => {
  if (totalVotes.value === 0) return 50
  return ((props.votesA || 0) / totalVotes.value) * 100
})
</script>

<style scoped>
.battle-animation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 2rem;
  position: relative;
}

.vs-container {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.vs-text {
  font-size: 3rem;
  font-weight: 900;
  color: #ffd200;
  text-shadow: 0 0 20px rgba(255, 210, 0, 0.5);
  margin: 0;
  animation: pulse-glow 2s infinite;
}

.song-container {
  flex: 1;
  display: flex;
  justify-content: center;
}

.song-a {
  justify-content: flex-end;
}

.song-b {
  justify-content: flex-start;
}

.song-card {
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  min-width: 200px;
  transition: all 0.3s ease;
  position: relative;
}

.song-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.song-info {
  margin-bottom: 1rem;
}

.song-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.song-artist {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.vote-count {
  font-size: 2rem;
  font-weight: 900;
  color: #ffd200;
  text-shadow: 0 0 10px rgba(255, 210, 0, 0.3);
}

.progress-container {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd200, #ffed4e);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: var(--text-muted);
}

/* Pulse glow animation */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 210, 0, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 210, 0, 0.6);
  }
}

.battle-animation.active .vs-text {
  animation: pulse-glow 1s infinite;
}

/* Dark theme adjustments */
[data-theme="dark"] .song-card {
  background: #1f2937 !important;
  border-color: #4b5563 !important;
}

[data-theme="dark"] .song-card:hover {
  background: #374151 !important;
}
</style>
