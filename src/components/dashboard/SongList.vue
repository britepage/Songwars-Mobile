<template>
  <div class="song-list-container">
    <div class="list-header" v-if="title">
      <h3 class="list-title">{{ title }}</h3>
      <ion-badge v-if="songs.length > 0" color="primary">{{ songs.length }}</ion-badge>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <ion-spinner name="crescent" color="primary" />
      <p>Loading songs...</p>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="songs.length === 0" class="empty-state">
      <ion-icon :icon="musicalNotes" class="empty-icon" />
      <h4>{{ emptyMessage }}</h4>
      <p>{{ emptySubtext }}</p>
    </div>
    
    <!-- Songs List -->
    <ion-list v-else class="songs-list">
      <ion-item
        v-for="song in songs"
        :key="song.id"
        button
        @click="handleSongClick(song)"
        class="song-item"
      >
        <ion-icon :icon="musicalNotes" slot="start" class="song-icon" />
        
        <ion-label>
          <h3>{{ song.title }}</h3>
          <p>{{ song.artist }}</p>
          <p class="song-meta">
            <span v-if="song.genre">{{ song.genre }}</span>
            <span v-if="showStats"> • {{ song.likes || 0 }} likes</span>
            <span v-if="showDate"> • {{ formatDate(song.created_at) }}</span>
          </p>
        </ion-label>
        
        <ion-button
          slot="end"
          fill="clear"
          @click.stop="handlePlay(song)"
        >
          <ion-icon :icon="play" />
        </ion-button>
      </ion-item>
    </ion-list>
    
    <!-- Load More Button -->
    <div v-if="hasMore && !isLoading" class="load-more-section">
      <ion-button
        fill="outline"
        @click="handleLoadMore"
      >
        Load More
      </ion-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonSpinner,
  IonBadge
} from '@ionic/vue'
import { musicalNotes, play } from 'ionicons/icons'

interface Song {
  id: string
  title: string
  artist: string
  genre?: string | null
  url?: string | null
  likes?: number
  created_at: string
}

interface Props {
  songs: Song[]
  title?: string
  isLoading?: boolean
  emptyMessage?: string
  emptySubtext?: string
  showStats?: boolean
  showDate?: boolean
  hasMore?: boolean
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
  emptyMessage: 'No songs found',
  emptySubtext: 'Songs will appear here once uploaded',
  showStats: true,
  showDate: true,
  hasMore: false
})

const emit = defineEmits<{
  songClick: [song: Song]
  play: [song: Song]
  loadMore: []
}>()

const handleSongClick = (song: Song) => {
  emit('songClick', song)
}

const handlePlay = (song: Song) => {
  emit('play', song)
}

const handleLoadMore = () => {
  emit('loadMore')
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.song-list-container {
  width: 100%;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.list-title {
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

.songs-list {
  background: transparent;
}

.song-item {
  --background: var(--card-bg);
  --border-color: var(--border-color);
  margin-bottom: 0.5rem;
}

.song-icon {
  color: var(--ion-color-primary);
  font-size: 1.5rem;
}

.song-item h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.song-item p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.song-meta {
  font-size: 0.75rem !important;
  color: var(--text-muted) !important;
  margin-top: 0.25rem !important;
}

.load-more-section {
  display: flex;
  justify-content: center;
  padding: 1rem;
}
</style>
