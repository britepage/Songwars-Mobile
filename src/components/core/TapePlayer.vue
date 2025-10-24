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
    
    <!-- Play/Pause button -->
    <ion-button 
      :fill="isPlaying ? 'solid' : 'outline'"
      @click="togglePlay"
      class="play-button"
    >
      <ion-icon :icon="isPlaying ? pause : play" slot="icon-only" />
    </ion-button>
    
    <!-- Progress bar -->
    <div v-if="showProgress" class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      </div>
      <div class="time-display">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ formatTime(duration) }}</span>
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
    
    <!-- Song info -->
    <div class="song-info" v-if="song">
      <h3 class="song-title">{{ song.title }}</h3>
      <p class="song-artist">{{ song.artist }}</p>
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

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
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
  margin-top: 1rem;
  --color: #ffd200;
  --border-color: #ffd200;
  --background: transparent;
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
  width: 100%;
  margin-top: 1rem;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #ffd200;
  transition: width 0.1s ease;
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
  border: 1px solid var(--border-color);
  background-color: transparent;
  color: var(--text-primary);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.duration-btn:hover {
  background-color: var(--border-color);
}

.duration-btn.selected {
  background-color: #ffd200;
  color: #000000;
  border-color: #ffd200;
}
</style>
