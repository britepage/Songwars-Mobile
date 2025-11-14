<template>
  <div class="tagged-song-card theme-bg-card theme-border-card">
    <div class="song-header">
      <!-- Artist Avatar -->
      <router-link 
        v-if="song.artist_profile?.username"
        :to="`/user/${song.artist_profile.username}`"
        class="artist-avatar-link"
      >
        <img
          v-if="song.artist_profile.avatar_url"
          :src="song.artist_profile.avatar_url"
          :alt="song.artist_profile.display_name || song.artist_profile.username"
          class="artist-avatar"
        />
        <div v-else class="artist-avatar-fallback">
          <ion-icon :icon="personCircle" />
        </div>
      </router-link>
      <div v-else class="artist-avatar-fallback">
        <ion-icon :icon="personCircle" />
      </div>

      <!-- Song Info -->
      <div class="song-info">
        <router-link
          v-if="song.artist_profile?.username"
          :to="`/user/${song.artist_profile.username}`"
          class="song-title-link"
        >
          <h4 class="song-title">{{ song.songs.title }}</h4>
        </router-link>
        <h4 v-else class="song-title">{{ song.songs.title }}</h4>
        
        <p class="song-artist">by {{ song.songs.artist }}</p>
        
        <router-link
          v-if="song.artist_profile?.username"
          :to="`/user/${song.artist_profile.username}`"
          class="song-username-link"
        >
          <p class="song-username">@{{ song.artist_profile.username }}</p>
        </router-link>
        <p v-else-if="song.artist_profile?.display_name" class="song-username">
          {{ song.artist_profile.display_name }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="song-actions">
        <!-- Play/Pause Button -->
        <button
          class="play-button"
          :class="{ 'is-playing': isPlaying, 'has-error': hasError }"
          :disabled="audioLoading"
          @click="handlePlayClick"
          @keydown.enter.prevent="handlePlayClick"
          @keydown.space.prevent="handlePlayClick"
          :aria-label="isPlaying ? 'Pause' : 'Play'"
          :aria-pressed="isPlaying"
        >
          <ion-spinner v-if="audioLoading" name="crescent" />
          <ion-icon v-else-if="hasError" :icon="alertCircle" class="error-icon" />
          <ion-icon v-else-if="isPlaying" :icon="pause" />
          <ion-icon v-else :icon="play" />
        </button>

        <!-- Untag Button (only for profile owner) -->
        <button
          v-if="canUntag"
          class="untag-button"
          @click="$emit('untag', song.song_id)"
          :aria-label="`Untag ${song.songs.title}`"
        >
          <ion-icon :icon="close" />
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="hasError" class="error-message">
      <p>{{ audioError }}</p>
      <button class="retry-button" @click="handleRetry">
        {{ isMobile ? 'Tap to retry' : 'Retry' }}
      </button>
    </div>

    <!-- Expand/Collapse Toggle -->
    <button
      class="expand-toggle"
      @click="handleToggleExpand"
      :aria-expanded="isExpanded"
      :aria-label="isExpanded ? 'Show less' : 'Show more'"
    >
      <span>{{ isExpanded ? 'Show less' : 'Show more' }}</span>
      <ion-icon :icon="isExpanded ? chevronUp : chevronDown" />
    </button>

    <!-- Expanded Details -->
    <div v-if="isExpanded" class="expanded-details">
      <div class="detail-item">
        <span class="detail-label">Genre:</span>
        <span class="detail-value">{{ song.songs.genre || 'Unknown' }}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Tagged:</span>
        <span class="detail-value">{{ formatTaggedDate(song.created_at) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonIcon, IonSpinner } from '@ionic/vue'
import { play, pause, close, personCircle, alertCircle, chevronDown, chevronUp } from 'ionicons/icons'
import type { TaggedSong } from '@/composables/useTaggedSongs'

interface Props {
  song: TaggedSong
  isPlaying: boolean
  audioLoading: boolean
  audioError: string | null
  progressValue: number
  isExpanded: boolean
  canUntag?: boolean
  isMobile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canUntag: false,
  isMobile: false
})

const emit = defineEmits<{
  play: [song: TaggedSong]
  untag: [songId: string]
  toggleExpand: [songId: string]
  retry: [song: TaggedSong]
}>()

const hasError = computed(() => !!props.audioError)

const handlePlayClick = () => {
  if (props.audioError) {
    emit('retry', props.song)
  } else {
    emit('play', props.song)
  }
}

const handleToggleExpand = () => {
  emit('toggleExpand', props.song.song_id)
}

const handleRetry = () => {
  emit('retry', props.song)
}

const formatTaggedDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Recently'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}
</script>

<style scoped>
.tagged-song-card {
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
}

.song-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.artist-avatar-link {
  flex-shrink: 0;
}

.artist-avatar,
.artist-avatar-fallback {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--border-color);
}

.artist-avatar-fallback ion-icon {
  font-size: 2rem;
  color: var(--text-muted);
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-title-link,
.song-username-link {
  text-decoration: none;
  color: inherit;
}

.song-title-link:hover .song-title,
.song-username-link:hover .song-username {
  color: var(--ion-color-primary);
}

.song-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-artist {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-username {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.play-button,
.untag-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 40px;
  min-height: 40px;
}

.play-button:hover,
.untag-button:hover {
  background: var(--bg-tertiary);
  transform: scale(1.05);
}

.play-button:active,
.untag-button:active {
  transform: scale(0.95);
}

.play-button.is-playing {
  background: var(--ion-color-primary);
  color: white;
}

.play-button.has-error {
  background: var(--ion-color-danger);
  color: white;
}

.play-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.play-button ion-icon,
.untag-button ion-icon {
  font-size: 1.25rem;
}

.error-icon {
  font-size: 1.25rem;
}

.untag-button {
  background: rgba(239, 68, 68, 0.1);
  color: var(--ion-color-danger);
}

.untag-button:hover {
  background: rgba(239, 68, 68, 0.2);
}

.error-message {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.error-message p {
  margin: 0;
  color: var(--ion-color-danger);
  font-size: 0.875rem;
}

.retry-button {
  padding: 0.5rem 1rem;
  background: var(--ion-color-danger);
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  font-weight: 500;
}

.retry-button:hover {
  opacity: 0.9;
}

.expand-toggle {
  width: 100%;
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: color 0.2s;
}

.expand-toggle:hover {
  color: var(--text-primary);
}

.expanded-details {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.detail-label {
  font-weight: 600;
  color: var(--text-secondary);
}

.detail-value {
  color: var(--text-primary);
}
</style>
