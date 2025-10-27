<template>
  <div class="tape-player">
    <!-- Cassette tape background -->
    <div class="tape-container" :class="{ 'playing': isPlaying }">
      <div class="tape-background">
        <!-- Use actual tape image from assets -->
        <img 
          v-if="tapeImage" 
          :src="tapeImage" 
          alt="Cassette Tape" 
          class="tape-image"
        />
        <div v-else class="tape-placeholder"></div>
      </div>
      
      <!-- Left gear -->
      <div 
        class="left-gear"
        :style="{ transform: `rotate(${leftReelRotation}deg)` }"
      >
        <img v-if="gearImage" :src="gearImage" alt="Gear" class="gear-image" />
        <div v-else class="gear-placeholder"></div>
      </div>
      
      <!-- Right gear -->
      <div 
        class="right-gear"
        :style="{ transform: `rotate(${rightReelRotation}deg)` }"
      >
        <img v-if="gearImage" :src="gearImage" alt="Gear" class="gear-image" />
        <div v-else class="gear-placeholder"></div>
      </div>
    </div>
    
    <!-- Duration options -->
    <div v-if="showDurationOptions" class="duration-options">
      <button 
        @click="$emit('duration-select', 15)"
        :class="{ 'selected': selectedDuration === 15 }"
        class="duration-btn"
      >
        15s
      </button>
      <button 
        @click="$emit('duration-select', 30)"
        :class="{ 'selected': selectedDuration === 30 }"
        class="duration-btn"
      >
        30s
      </button>
      <button 
        @click="$emit('duration-select', 'full')"
        :class="{ 'selected': selectedDuration === 'full' }"
        class="duration-btn"
      >
        Full
      </button>
    </div>
    
    <!-- Play/Pause button and Progress bar (only shown for 'full' duration) -->
    <div v-if="showProgress" class="playback-controls">
      <ion-button 
        fill="solid"
        @click="togglePlay"
        class="play-button"
      >
        <ion-icon :icon="isPlaying ? pause : play" slot="icon-only" />
      </ion-button>
      
      <div class="progress-container">
        <div 
          class="progress-bar"
          @click="handleProgressBarClick"
          @mousedown="handleScrubberMouseDown"
          @touchstart="handleScrubberTouchStart"
        >
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { IonButton, IonIcon } from '@ionic/vue'
import { play, pause } from 'ionicons/icons'

// Import tape assets
import tapebgA from '@/assets/images/tapebgA.svg'
import tapebgB from '@/assets/images/tapebgB.svg'
import tapegear from '@/assets/images/tapegear.svg'

interface Song {
  id: string
  title: string
  artist: string
  url?: string | null
  genre?: string | null
}

interface Props {
  song?: Song | null
  isPlaying?: boolean
  audioUrl?: string
  clipStartTime?: number
  progress?: number      // NEW: for progress bar
  currentTime?: number   // NEW: for time display
  duration?: number      // NEW: for time display
  showDurationOptions?: boolean  // NEW: show 15s/30s/Full buttons
  showProgress?: boolean  // NEW: show progress bar
  side?: 'A' | 'B'       // NEW: which side (A or B) for different tape images
  selectedDuration?: number | string | null  // NEW: currently selected duration
}

const props = withDefaults(defineProps<Props>(), {
  isPlaying: false,
  progress: 0,
  currentTime: 0,
  duration: 30,
  showDurationOptions: false,
  showProgress: false,
  side: 'A',
  selectedDuration: null
})

const emit = defineEmits<{
  play: [song: Song]
  'duration-select': [duration: number | string]
  seek: [percentage: number]
}>()

// Gear rotation state
const leftReelRotation = ref(0)
const rightReelRotation = ref(0)
let animationFrame: number | null = null

// Computed properties for tape images
const tapeImage = computed(() => {
  return props.side === 'A' ? tapebgA : tapebgB
})

const gearImage = computed(() => tapegear)

const togglePlay = () => {
  if (props.song) {
    emit('play', props.song)
  }
}

// Seeking functionality
const handleProgressBarClick = (event: MouseEvent) => {
  const progressBar = event.currentTarget as HTMLElement
  const rect = progressBar.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = (clickX / rect.width) * 100
  emit('seek', percentage)
}

let isDragging = false

const handleScrubberMouseDown = (event: MouseEvent) => {
  isDragging = true
  handleProgressBarClick(event)
  
  const handleMouseMove = (moveEvent: MouseEvent) => {
    if (isDragging) {
      const progressBar = event.currentTarget as HTMLElement
      const rect = progressBar.getBoundingClientRect()
      const moveX = moveEvent.clientX - rect.left
      const percentage = Math.max(0, Math.min(100, (moveX / rect.width) * 100))
      emit('seek', percentage)
    }
  }
  
  const handleMouseUp = () => {
    isDragging = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleScrubberTouchStart = (event: TouchEvent) => {
  isDragging = true
  const touch = event.touches[0]
  const progressBar = event.currentTarget as HTMLElement
  const rect = progressBar.getBoundingClientRect()
  const touchX = touch.clientX - rect.left
  const percentage = (touchX / rect.width) * 100
  emit('seek', percentage)
  
  const handleTouchMove = (moveEvent: TouchEvent) => {
    if (isDragging) {
      const moveTouch = moveEvent.touches[0]
      const moveX = moveTouch.clientX - rect.left
      const percentage = Math.max(0, Math.min(100, (moveX / rect.width) * 100))
      emit('seek', percentage)
    }
  }
  
  const handleTouchEnd = () => {
    isDragging = false
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  }
  
  document.addEventListener('touchmove', handleTouchMove)
  document.addEventListener('touchend', handleTouchEnd)
}

// Gear animation control
const startReelAnimation = () => {
  const animate = () => {
    leftReelRotation.value += 3
    rightReelRotation.value += 3
    
    if (leftReelRotation.value >= 360) {
      leftReelRotation.value = 0
    }
    if (rightReelRotation.value >= 360) {
      rightReelRotation.value = 0
    }
    
    animationFrame = requestAnimationFrame(animate)
  }
  animate()
}

const stopReelAnimation = () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
  leftReelRotation.value = 0
  rightReelRotation.value = 0
}

// Watch isPlaying prop to control gear animation
watch(() => props.isPlaying, (playing) => {
  if (playing) {
    startReelAnimation()
  } else {
    stopReelAnimation()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  stopReelAnimation()
})
</script>

<style scoped>
/* Cassette tape container from COMPLETE_STYLE_GUIDE.md */
.tape-player {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.tape-container {
  position: relative;
  width: 200px;
  height: 120px;
}

.tape-background {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tape-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  border: 2px solid var(--border-color);
}

.gear-placeholder {
  width: 28px;
  height: 28px;
  background: radial-gradient(circle, #ffd200 0%, #e0b900 100%);
  border-radius: 50%;
  border: 2px solid #000;
}

/* Gear positioning (exact from TapePlayer.vue) */
.left-gear {
  position: absolute;
  left: 21.6%;
  top: 38.5%;
  width: 28px;
  height: 28px;
}

.right-gear {
  position: absolute;
  left: 64.7%;
  top: 38.5%;
  width: 28px;
  height: 28px;
}


.play-button {
  margin-top: 0;
  --color: #ffd200;
  --border-color: #ffd200;
  --background: transparent;
  width: 48px;
  height: 48px;
  --border-radius: 50%;
  --border-width: 2px;
  --padding-start: 0;
  --padding-end: 0;
}

.play-button[fill="solid"] {
  --background: #ffd200;
  --color: #000000;
}

.song-info {
  text-align: center;
  margin-top: 1rem;
}

.song-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.song-artist {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

/* New battle-specific styles */
.tape-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.gear-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.progress-container {
  flex: 1;
  margin-top: 0;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: var(--border-color);
  border-radius: 2px;
  overflow: visible;
  position: relative;
  cursor: pointer;
}

.progress-fill {
  height: 100%;
  background-color: #ffd200;
  transition: width 0.1s ease;
  position: relative;
}

/* Add visible scrubber/thumb indicator */
.progress-fill::after {
  content: '';
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background-color: #ffd200;
  border: 2px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
}

.time-display {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.duration-options {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  width: 100%;
}

.duration-btn {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #000;
  background-color: #000000;
  color: #ffffff;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.duration-btn:hover {
  background-color: #333333;
}

.duration-btn.selected {
  background-color: #ffd200;
  color: #000000;
  border-color: #ffd200;
}

/* Make playback controls horizontal like production */
.playback-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  flex-direction: row;
}
</style>
