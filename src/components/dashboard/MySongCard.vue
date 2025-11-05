<template>
  <div ref="cardRef" class="border rounded-xl p-6 text-center flex flex-col justify-between transition-all duration-300 border-gray-700 bg-gray-800 theme-bg-card theme-border-card">
    <div>
      <!-- Title with Tag Indicator -->
      <h3 class="font-semibold text-white text-lg mb-1 break-words flex items-center justify-center relative theme-text-primary">
        {{ song.title }}
        <!-- Tag indicator -->
        <svg v-if="tagCount > 0" 
             class="inline-block w-3 h-3 ml-1 text-[#ffd200] cursor-pointer" 
             fill="currentColor" 
             viewBox="0 0 24 24"
             @click="handleTagClick"
             :title="`Tags: ${tagCount}`">
          <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
        </svg>
        <!-- Tag count tooltip -->
        <div v-if="showTagTooltip" 
             class="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white text-black text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap border border-gray-200">
          Tags: {{ tagCount }}
          <div class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-l border-t border-gray-200"></div>
        </div>
      </h3>
      <!-- Artist -->
      <p class="text-black text-sm mb-4 italic">{{ song.artist }}</p>
      
      <!-- Play Circle with Loading/Error States -->
      <div class="mb-4">
        <div class="w-16 h-16 mx-auto mb-2 relative cursor-pointer group" @click="handlePlayClick">
          <!-- Loading State -->
          <div v-if="audioLoading" class="absolute inset-0 flex items-center justify-center z-20">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffd200]"></div>
          </div>
          
          <!-- Error State -->
          <div v-else-if="audioError" class="absolute inset-0 flex items-center justify-center z-20">
            <svg class="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          
          <!-- Normal Play/Pause State -->
          <div v-else class="absolute inset-0 flex items-center justify-center z-10">
            <svg v-if="!isPlaying" class="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg v-else class="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </div>
          
          <!-- Progress Ring -->
          <svg class="w-[72px] h-[72px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-90 z-0">
            <!-- Single thick black ring -->
            <circle
              cx="36"
              cy="36"
              r="34"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              class="text-gray-900"
            />
            <!-- Progress Ring (yellow) -->
            <circle
              cx="36"
              cy="36"
              r="34"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              :stroke-dasharray="2 * Math.PI * 34"
              :stroke-dashoffset="progressOffset"
              class="text-[#ffd200] transition-all duration-200"
            />
          </svg>
        </div>
        
        <!-- Error Message -->
        <div v-if="audioError" class="text-xs text-red-500 text-center mb-2">
          Audio failed to load
        </div>
        
        <!-- Mobile Audio Info -->
        <div v-if="isMobile && audioError" class="text-xs text-gray-500 text-center">
          Tap to retry
        </div>
      </div>
      <!-- Metrics Row -->
      <p class="text-black text-sm flex items-center justify-center space-x-3">
        <span>Total Votes: {{ (song.likes||0) + (song.dislikes||0) }}</span>
        <span class="text-gray-500">|</span>
        <span>Approval: 
          <span :class="{
            'text-[#ffd200]': getApprovalRateNumber(song.likes, song.dislikes) >= 70,
            'text-red-500': getApprovalRateNumber(song.likes, song.dislikes) > 0 && getApprovalRateNumber(song.likes, song.dislikes) < 50,
            'text-black': getApprovalRateNumber(song.likes, song.dislikes) === 0
          }">
            {{ calcApproval(song.likes, song.dislikes) }}%
          </span>
        </span>
      </p>
      <!-- Upload Timestamp -->
      <p class="text-xs text-gray-500 mt-3">Uploaded: {{ formatDate(song.created_at) }}</p>
      <!-- Status Pills -->
      <div class="mt-4 flex items-center justify-center space-x-1">
        <template v-for="(pill, index) in getStatusPills(song)" :key="index">
          <span 
            class="px-3 py-1.5 rounded-full text-xs font-medium"
            :class="pill.class">
            {{ pill.text }}
          </span>
          
          <!-- Info icon appears immediately AFTER pills with showInfoIcon -->
          <div v-if="pill.showInfoIcon" class="relative inline-block">
            <button
              @click.stop="showStatusModal = !showStatusModal"
              class="inline-flex items-center justify-center w-5 h-5 text-gray-400 hover:text-white focus:outline-none cursor-pointer"
              :aria-expanded="showStatusModal"
              title="More info">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
            </button>
            
            <!-- Modal Popover -->
            <div v-if="showStatusModal" 
                 class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                 @click.self="showStatusModal = false">
              <div :class="['border rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto', modalClasses.container]">
                <div class="p-6">
                  <div class="flex items-start justify-between mb-3">
                    <h4 :class="['font-semibold text-lg', modalClasses.title]">
                      {{ song.status === 'under_review' ? 'Song Under Review' : 'Song Removed' }}
                    </h4>
                    <button @click="showStatusModal = false" :class="['-mt-1 -mr-1 w-auto h-auto min-w-0 min-h-0', modalClasses.button]">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                  <p :class="['text-sm', modalClasses.body]" v-html="getStatusMessage(song)"></p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
      <div class="mt-4 flex justify-center space-x-2">
        <button @click="emit('edit', song)" class="px-3 py-2 bg-[#ffd200] text-black rounded-lg hover:bg-[#e6bd00] transition-colors text-sm font-medium flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          <span>Edit</span>
        </button>
        <button @click="emit('delete', song)" class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center space-x-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          <span>Delete</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useTagStore } from '@/stores/tagStore'
import { useThemeStore } from '@/stores/themeStore'

interface Props {
  song: any
  refreshKey?: number
  isPlaying: boolean
  audioLoading: boolean
  audioError: boolean | string
  progressValue: number
  isMobile: boolean
  formatDate: (iso?: string | null) => string
  calcApproval: (likes?: number | null, dislikes?: number | null) => string
  getApprovalRateNumber: (likes?: number | null, dislikes?: number | null) => number
  getStatusPills: (song: any) => Array<{ text: string; class: string; showInfoIcon: boolean }>
  getStatusMessage: (song: any) => string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  play: [song: any]
  edit: [song: any]
  delete: [song: any]
  retry: [songId: string]
}>()

const tagStore = useTagStore()
const themeStore = useThemeStore()

const showTagTooltip = ref(false)
const showStatusModal = ref(false)

// Modal theme classes
const modalClasses = computed(() => ({
  container: themeStore.isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300',
  title: themeStore.isDark ? 'text-white' : 'text-black',
  body: themeStore.isDark ? 'text-gray-300' : 'text-gray-700',
  button: themeStore.isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
}))

// Progress offset calculation
const progressOffset = computed(() => {
  const circumference = 2 * Math.PI * 34
  return circumference * (1 - props.progressValue / 100)
})

// Handle play/retry click
const handlePlayClick = () => {
  if (props.audioError) {
    emit('retry', props.song.id)
  } else {
    emit('play', props.song)
  }
}

// Auto-hide tooltip after 3 seconds
let tooltipTimeout: ReturnType<typeof setTimeout> | null = null

const showTooltip = () => {
  showTagTooltip.value = true
  if (tooltipTimeout) clearTimeout(tooltipTimeout)
  tooltipTimeout = setTimeout(() => {
    showTagTooltip.value = false
  }, 3000)
}

// Local tag count state - always fresh on mount
const tagCount = ref<number>(0)
const isLoadingTagCount = ref(false)
const cardRef = ref<HTMLElement | null>(null)
const isVisible = ref(false) // Track if card is currently visible in viewport

// Create reusable load function
const loadTagCount = async () => {
  if (isLoadingTagCount.value) return
  
  isLoadingTagCount.value = true
  try {
    const count = await tagStore.getSongTagCount(props.song.id)
    tagCount.value = count
  } catch (error) {
    console.error('Error loading tag count in MySongCard:', error)
    tagCount.value = 0
  } finally {
    isLoadingTagCount.value = false
  }
}

// Intersection Observer for lazy loading tag counts
let observer: IntersectionObserver | null = null

onMounted(() => {
  // Fallback: load immediately if Intersection Observer not available
  if (!cardRef.value || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    loadTagCount()
    return
  }

  // Set up Intersection Observer
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible.value = entry.isIntersecting
        
        // Load tag count when card becomes visible
        if (entry.isIntersecting && tagCount.value === 0 && !isLoadingTagCount.value) {
          loadTagCount()
        }
      })
    },
    {
      rootMargin: '100px', // Start loading 100px before card enters viewport (similar to infinite scroll threshold)
      threshold: 0.01 // Trigger when 1% visible
    }
  )
  
  if (cardRef.value) {
    observer.observe(cardRef.value)
    
    // Check if element is already visible immediately after observing
    // Intersection Observer doesn't fire for elements already in viewport, so we need to check manually
    const records = observer.takeRecords()
    if (records.length > 0) {
      records.forEach((entry) => {
        isVisible.value = entry.isIntersecting
        if (entry.isIntersecting && tagCount.value === 0 && !isLoadingTagCount.value) {
          loadTagCount()
        }
      })
    } else {
      // Fallback: manually check if element is in viewport using getBoundingClientRect
      // This handles the case where Intersection Observer hasn't fired yet
      const rect = cardRef.value.getBoundingClientRect()
      const isInViewport = rect.top < window.innerHeight + 100 && rect.bottom > -100
      if (isInViewport && tagCount.value === 0 && !isLoadingTagCount.value) {
        isVisible.value = true
        loadTagCount()
      }
    }
  }
})

// Watch for refresh key changes - only reload if card is currently visible
watch(() => props.refreshKey, (newKey) => {
  if (newKey && newKey > 0 && !isLoadingTagCount.value) {
    // Check if card is currently visible (don't rely on stale isVisible.value)
    if (cardRef.value) {
      const rect = cardRef.value.getBoundingClientRect()
      const isInViewport = rect.top < window.innerHeight + 100 && rect.bottom > -100
      if (isInViewport) {
        isVisible.value = true
        // Always reload tag count on refresh (even if already loaded)
        loadTagCount()
      }
    }
  }
})

// Handle tag click
const handleTagClick = () => {
  showTagTooltip.value = true
  if (tooltipTimeout) clearTimeout(tooltipTimeout)
  tooltipTimeout = setTimeout(() => {
    showTagTooltip.value = false
  }, 3000)
}

// Cleanup on unmount
onUnmounted(() => {
  if (observer && cardRef.value) {
    observer.unobserve(cardRef.value)
    observer.disconnect()
  }
  if (tooltipTimeout) clearTimeout(tooltipTimeout)
})
</script>

<style scoped>
</style>
