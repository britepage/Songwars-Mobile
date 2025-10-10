<template>
  <ion-card class="song-card" :class="{ 'selected': isSelected, 'voted': hasVoted }">
    <div class="card-content">
      <!-- Song info -->
      <div class="song-info">
        <h3 class="song-title">{{ song.title }}</h3>
        <p class="song-artist">{{ song.artist }}</p>
        <p class="song-genre" v-if="song.genre">{{ song.genre }}</p>
      </div>
      
      <!-- Vote button -->
      <ion-button 
        v-if="showVoteButton"
        :fill="hasVoted ? 'solid' : 'outline'"
        :disabled="hasVoted"
        @click="handleVote"
        class="vote-button"
      >
        <ion-icon :icon="hasVoted ? checkmark : thumbsUp" slot="icon-only" />
        {{ hasVoted ? 'Voted' : 'Vote' }}
      </ion-button>
      
      <!-- Stats -->
      <div class="song-stats" v-if="showStats">
        <div class="stat">
          <span class="stat-value">{{ song.likes || 0 }}</span>
          <span class="stat-label">Likes</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ song.dislikes || 0 }}</span>
          <span class="stat-label">Dislikes</span>
        </div>
      </div>
    </div>
    
    <!-- Play button overlay -->
    <div class="play-overlay" v-if="showPlayButton" @click="handlePlay">
      <ion-button fill="clear" class="play-btn">
        <ion-icon :icon="isPlaying ? pause : play" />
      </ion-button>
    </div>
  </ion-card>
</template>

<script setup lang="ts">
// import { computed } from 'vue'
import { IonCard, IonButton, IonIcon } from '@ionic/vue'
import { thumbsUp, checkmark, play, pause } from 'ionicons/icons'

interface Song {
  id: string
  title: string
  artist: string
  genre?: string | null
  url?: string | null
  likes?: number
  dislikes?: number
}

interface Props {
  song: Song
  isSelected?: boolean
  hasVoted?: boolean
  isPlaying?: boolean
  showVoteButton?: boolean
  showStats?: boolean
  showPlayButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  hasVoted: false,
  isPlaying: false,
  showVoteButton: true,
  showStats: false,
  showPlayButton: false
})

const emit = defineEmits<{
  vote: [songId: string]
  play: [song: Song]
}>()

const handleVote = () => {
  if (!props.hasVoted) {
    emit('vote', props.song.id)
  }
}

const handlePlay = () => {
  emit('play', props.song)
}
</script>

<style scoped>
.song-card {
  margin: 0.5rem;
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
  background: var(--card-bg);
  border: 2px solid var(--card-border);
}

.song-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.song-card.selected {
  border-color: #ffd200;
  box-shadow: 0 0 20px rgba(255, 210, 0, 0.3);
}

.song-card.voted {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.card-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.song-info {
  flex: 1;
}

.song-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
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
  margin: 0;
  font-style: italic;
}

.vote-button {
  --color: #ffd200;
  --border-color: #ffd200;
  --background: transparent;
  align-self: flex-start;
}

.vote-button[fill="solid"] {
  --background: #10b981;
  --color: #ffffff;
  --border-color: #10b981;
}

.song-stats {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.play-overlay {
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
[data-theme="dark"] .song-card {
  background: #1f2937 !important;
  border-color: #4b5563 !important;
}

[data-theme="dark"] .song-card:hover {
  background: #374151 !important;
}

[data-theme="dark"] .play-btn {
  --background: rgba(0, 0, 0, 0.8);
  --color: #ffffff;
}
</style>
