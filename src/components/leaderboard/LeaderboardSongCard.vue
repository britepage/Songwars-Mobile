<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6 theme-bg-card theme-border-card">
    <!-- Mobile Layout -->
    <div class="md:hidden space-y-3">
      <!-- Row 1: Rank + Audio + Title -->
      <div class="flex items-center gap-3">
        <!-- Rank Badge -->
        <div :class="['w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg', rankClass]">
          {{ song.rank }}
        </div>
        
        <!-- Audio Player -->
        <div class="relative w-12 h-12 cursor-pointer" @click="handlePlayClick">
          <!-- Loading -->
          <div v-if="audioLoading" class="absolute inset-0 flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffd200]"></div>
          </div>
          
          <!-- Error -->
          <div v-else-if="audioError" class="absolute inset-0 flex items-center justify-center" @click.stop="handleRetry">
            <svg class="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          
          <!-- Normal State -->
          <div v-else class="absolute inset-0 flex items-center justify-center">
            <svg v-if="!isPlaying" class="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg v-else class="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </div>
          
        </div>
        
        <!-- Title with Tag Icon -->
        <div class="flex-1 flex items-center">
          <h3 class="font-semibold theme-text-primary text-base flex items-center">
            {{ song.title }}
            <svg 
              @click.stop="tagStore.toggle(song.song_id)"
              class="inline-block w-4 h-4 ml-2 cursor-pointer transition-colors"
              :class="tagStore.isTagged(song.song_id) ? 'text-[#ffd200]' : 'text-gray-400'"
              :fill="tagStore.isTagged(song.song_id) ? 'currentColor' : 'none'"
              :stroke="tagStore.isTagged(song.song_id) ? 'none' : 'currentColor'"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
          </h3>
        </div>
      </div>
      
      <!-- Row 2: Artist -->
      <div class="flex items-center justify-between">
        <a 
          :href="`/user/${song.username}`"
          @click.prevent="router.push(`/user/${song.username}`)"
          class="text-sm theme-text-secondary underline"
        >
          {{ song.artist }}
        </a>
      </div>
      
      <!-- Row 3: Stats -->
      <div class="flex items-center justify-between">
        <div class="text-center">
          <div class="text-2xl font-bold text-[#ffd200]">{{ song.score.toFixed(1) }}</div>
          <div class="text-xs theme-text-muted">Score</div>
        </div>
        <div class="text-center">
          <div class="text-xl font-semibold theme-text-primary">{{ song.total_votes }}</div>
          <div class="text-xs theme-text-muted">Votes</div>
        </div>
        <div class="text-center">
          <span v-if="song.is_active !== false" class="px-3 py-1 rounded-full text-xs font-medium bg-[#ffd200]/20 text-[#ffd200]">
            Active
          </span>
          <span v-else-if="song.completion_date" class="text-xs theme-text-muted">
            {{ formatDate(song.completion_date) }}
          </span>
          <span v-else class="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
            Eliminated
          </span>
        </div>
      </div>
    </div>

    <!-- Desktop Layout -->
    <div class="hidden md:flex items-center gap-4">
      <!-- Rank + Audio -->
      <div class="flex items-center gap-3">
        <div :class="['w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl', rankClass]">
          {{ song.rank }}
        </div>
        <!-- Audio Player -->
        <div class="relative w-16 h-16 cursor-pointer" @click="handlePlayClick">
          <!-- Loading -->
          <div v-if="audioLoading" class="absolute inset-0 flex items-center justify-center">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ffd200]"></div>
          </div>
          
          <!-- Error -->
          <div v-else-if="audioError" class="absolute inset-0 flex items-center justify-center" @click.stop="handleRetry">
            <svg class="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          
          <!-- Normal State -->
          <div v-else class="absolute inset-0 flex items-center justify-center">
            <svg v-if="!isPlaying" class="w-8 h-8 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg v-else class="w-8 h-8 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </div>
          
        </div>
      </div>
      
      <!-- Song Info -->
      <div class="flex-1">
        <h3 class="font-semibold theme-text-primary text-lg flex items-center">
          {{ song.title }}
          <svg 
            @click.stop="tagStore.toggle(song.song_id)"
            class="inline-block w-4 h-4 ml-2 cursor-pointer transition-colors"
            :class="tagStore.isTagged(song.song_id) ? 'text-[#ffd200]' : 'text-gray-400'"
            :fill="tagStore.isTagged(song.song_id) ? 'currentColor' : 'none'"
            :stroke="tagStore.isTagged(song.song_id) ? 'none' : 'currentColor'"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
          </svg>
        </h3>
        <a 
          :href="`/user/${song.username}`"
          @click.prevent="router.push(`/user/${song.username}`)"
          class="text-sm theme-text-secondary underline"
        >
          {{ song.artist }}
        </a>
      </div>
      
      <!-- Stats -->
      <div class="flex items-center gap-6">
        <div class="text-right">
          <div class="text-2xl font-bold text-[#ffd200]">{{ song.score.toFixed(1) }}</div>
          <div class="text-xs theme-text-muted">Score</div>
        </div>
        <div class="text-right">
          <div class="text-xl font-semibold theme-text-primary">{{ song.total_votes }}</div>
          <div class="text-xs theme-text-muted">Votes</div>
        </div>
        <div class="text-right">
          <span v-if="song.is_active !== false" class="px-3 py-1 rounded-full text-xs font-medium bg-[#ffd200]/20 text-[#ffd200]">
            Active
          </span>
          <span v-else-if="song.completion_date" class="text-xs theme-text-muted">
            Completed: {{ formatDate(song.completion_date) }}
          </span>
          <span v-else class="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
            Eliminated
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTagStore } from '@/stores/tagStore'

interface Props {
  song: any
  isPlaying: boolean
  audioLoading: boolean
  audioError: boolean | string | null
  progressValue: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  play: [song: any]
  retry: [songId: string]
}>()

const router = useRouter()
const tagStore = useTagStore()

const rankClass = computed(() => {
  if (props.song.rank === 1) return 'bg-[#ffd200] text-black'
  return 'bg-gray-300 dark:bg-gray-600 theme-text-primary'
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const handlePlayClick = () => {
  if (props.audioError) {
    emit('retry', props.song.song_id)
  } else {
    emit('play', props.song)
  }
}

const handleRetry = () => {
  emit('retry', props.song.song_id)
}
</script>

