<template>
  <div class="waveform-selector-dual">
    <div class="waveform-container">
      <!-- Song A Waveform -->
      <div class="waveform-section">
        <h4 class="waveform-title">{{ songA?.title || 'Song A' }}</h4>
        <div class="waveform-placeholder" ref="waveformA">
          <div class="waveform-bars">
            <div v-for="i in 50" :key="i" class="waveform-bar" :style="getBarStyle(i)" />
          </div>
        </div>
        <div class="waveform-controls">
          <ion-button size="small" fill="clear" @click="playSongA">
            <ion-icon :icon="playingSongA ? pause : play" />
          </ion-button>
          <span class="time-display">{{ formatTime(currentTimeA) }} / {{ formatTime(durationA) }}</span>
        </div>
      </div>
      
      <!-- VS Divider -->
      <div class="vs-divider">
        <span>VS</span>
      </div>
      
      <!-- Song B Waveform -->
      <div class="waveform-section">
        <h4 class="waveform-title">{{ songB?.title || 'Song B' }}</h4>
        <div class="waveform-placeholder" ref="waveformB">
          <div class="waveform-bars">
            <div v-for="i in 50" :key="i" class="waveform-bar" :style="getBarStyle(i + 50)" />
          </div>
        </div>
        <div class="waveform-controls">
          <ion-button size="small" fill="clear" @click="playSongB">
            <ion-icon :icon="playingSongB ? pause : play" />
          </ion-button>
          <span class="time-display">{{ formatTime(currentTimeB) }} / {{ formatTime(durationB) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonButton, IonIcon } from '@ionic/vue'
import { play, pause } from 'ionicons/icons'
import { ref } from 'vue'

interface Song {
  id: string
  title: string
  url?: string | null
}

interface Props {
  songA?: Song | null
  songB?: Song | null
}

defineProps<Props>()

const emit = defineEmits<{
  playA: []
  playB: []
}>()

const playingSongA = ref(false)
const playingSongB = ref(false)
const currentTimeA = ref(0)
const currentTimeB = ref(0)
const durationA = ref(30)
const durationB = ref(30)

const playSongA = () => {
  playingSongA.value = !playingSongA.value
  emit('playA')
}

const playSongB = () => {
  playingSongB.value = !playingSongB.value
  emit('playB')
}

const getBarStyle = (index: number) => {
  const height = Math.random() * 80 + 20
  return {
    height: `${height}%`,
    animationDelay: `${index * 0.02}s`
  }
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.waveform-selector-dual {
  width: 100%;
  padding: 1rem;
}

.waveform-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.waveform-section {
  flex: 1;
}

.waveform-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  text-align: center;
}

.waveform-placeholder {
  width: 100%;
  height: 80px;
  background: var(--bg-tertiary);
  border-radius: 0.5rem;
  padding: 0.5rem;
  overflow: hidden;
}

.waveform-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 100%;
  gap: 2px;
}

.waveform-bar {
  flex: 1;
  background: var(--ion-color-primary);
  border-radius: 2px;
  transition: height 0.3s ease;
  animation: waveformPulse 2s ease-in-out infinite;
}

@keyframes waveformPulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.waveform-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.time-display {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-family: monospace;
}

.vs-divider {
  text-align: center;
  padding: 0.5rem 0;
}

.vs-divider span {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--ion-color-primary);
}
</style>
