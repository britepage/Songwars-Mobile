<template>
  <div class="waveform-selector">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold theme-text-primary">Select 30-Second Clip</h3>
      <div class="flex items-center space-x-2">
        <span class="text-sm theme-text-secondary">{{ formatTime(clipStart) }} - {{ formatTime(clipStart + 30) }}</span>
        <button 
          @click="togglePlayback"
          :disabled="!audioBuffer || isProcessing"
          class="p-2 rounded-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <svg v-if="!isPlaying" class="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg v-else class="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Waveform Canvas -->
    <div class="relative bg-gray-100 rounded-lg p-4 mb-4">
      <canvas 
        ref="waveformCanvas"
        :width="canvasWidth"
        :height="canvasHeight"
        class="w-full border border-gray-300 rounded cursor-pointer"
        @click="handleCanvasClick"
        @mousemove="handleMouseMove"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseLeave"
      ></canvas>
      
      <!-- Selection Overlay -->
      <div 
        v-if="selectionWidth > 0"
        class="absolute top-4 bottom-4 bg-yellow-400 bg-opacity-30 border-2 border-yellow-500 rounded"
        :style="{
          left: `${selectionLeft}px`,
          width: `${selectionWidth}px`,
          pointerEvents: 'none'
        }"
      ></div>

      <!-- Time Labels -->
      <div class="flex justify-between mt-2 text-xs theme-text-secondary">
        <span>{{ formatTime(0) }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>
    </div>

    <!-- Clip Controls -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <button 
          @click="moveClipLeft"
          :disabled="clipStart <= 0 || isProcessing"
          class="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded transition-colors"
        >
          ← Move Left
        </button>
        <button 
          @click="moveClipRight"
          :disabled="clipStart + 30 >= duration || isProcessing"
          class="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded transition-colors"
        >
          Move Right →
        </button>
      </div>
      
      <div class="text-sm theme-text-secondary">
        Clip Duration: {{ Math.min(30, duration - clipStart).toFixed(1) }}s
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isProcessing" class="mt-4 text-center">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500 mx-auto mb-2"></div>
      <p class="text-sm theme-text-secondary">{{ processingMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

// Props
interface Props {
  audioUrl: string
  initialClipStart?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialClipStart: 0
})

// Emits
const emit = defineEmits<{
  clipChanged: [clipStart: number]
}>()

// Reactive state
const waveformCanvas = ref<HTMLCanvasElement>()
const audioBuffer = ref<AudioBuffer | null>(null)
const audioContext = ref<AudioContext | null>(null)
const audioSource = ref<AudioBufferSourceNode | null>(null)
const gainNode = ref<GainNode | null>(null)

const duration = ref(0)
const clipStart = ref(props.initialClipStart)
const isPlaying = ref(false)
const isProcessing = ref(false)
const processingMessage = ref('')

// Canvas dimensions
const canvasWidth = ref(800)
const canvasHeight = ref(120)

// Selection state
const isDragging = ref(false)
const dragStartX = ref(0)
const selectionLeft = ref(0)
const selectionWidth = ref(0)

// Initialize audio context and load audio file
onMounted(async () => {
  try {
    isProcessing.value = true
    processingMessage.value = 'Loading audio file...'
    
    audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Load audio file
    const response = await fetch(props.audioUrl)
    const arrayBuffer = await response.arrayBuffer()
    audioBuffer.value = await audioContext.value.decodeAudioData(arrayBuffer)
    
    duration.value = audioBuffer.value.duration
    clipStart.value = Math.min(props.initialClipStart, duration.value - 30)
    
    processingMessage.value = 'Rendering waveform...'
    await nextTick()
    await renderWaveform()
    
    isProcessing.value = false
  } catch (error) {
    console.error('Error loading audio:', error)
    isProcessing.value = false
  }
})

// Clean up audio context
onUnmounted(() => {
  if (audioSource.value) {
    audioSource.value.stop()
  }
  if (audioContext.value) {
    audioContext.value.close()
  }
})

// Watch for clip start changes
watch(clipStart, (newValue) => {
  updateSelectionDisplay()
  emit('clipChanged', newValue)
})

// Render waveform visualization
const renderWaveform = async () => {
  if (!waveformCanvas.value || !audioBuffer.value) return
  
  const canvas = waveformCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // Set canvas size
  canvasWidth.value = canvas.offsetWidth
  canvas.height = canvasHeight.value
  canvas.width = canvasWidth.value
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // Get audio data
  const channelData = audioBuffer.value.getChannelData(0)
  const samplesPerPixel = channelData.length / canvas.width
  
  // Draw waveform
  ctx.strokeStyle = '#374151'
  ctx.lineWidth = 1
  ctx.beginPath()
  
  for (let x = 0; x < canvas.width; x++) {
    const start = Math.floor(x * samplesPerPixel)
    const end = Math.floor((x + 1) * samplesPerPixel)
    
    let max = 0
    let min = 0
    
    for (let i = start; i < end; i++) {
      if (i < channelData.length) {
        max = Math.max(max, channelData[i])
        min = Math.min(min, channelData[i])
      }
    }
    
    const y1 = (1 - max) * (canvas.height / 2)
    const y2 = (1 - min) * (canvas.height / 2)
    
    if (x === 0) {
      ctx.moveTo(x, y1)
    } else {
      ctx.lineTo(x, y1)
    }
    
    ctx.moveTo(x, y2)
    ctx.lineTo(x, y2)
  }
  
  ctx.stroke()
  
  // Update selection display
  updateSelectionDisplay()
}

// Update selection overlay position and size
const updateSelectionDisplay = () => {
  if (!waveformCanvas.value || !duration.value) return
  
  const canvas = waveformCanvas.value
  const pixelsPerSecond = canvas.width / duration.value
  
  selectionLeft.value = clipStart.value * pixelsPerSecond
  selectionWidth.value = Math.min(30, duration.value - clipStart.value) * pixelsPerSecond
}

// Canvas interaction handlers
const handleCanvasClick = (event: MouseEvent) => {
  if (!waveformCanvas.value || !duration.value) return
  
  const canvas = waveformCanvas.value
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const pixelsPerSecond = canvas.width / duration.value
  
  // Calculate new clip start (center the 30-second window)
  let newClipStart = (x / pixelsPerSecond) - 15
  
  // Clamp to valid range
  newClipStart = Math.max(0, Math.min(newClipStart, duration.value - 30))
  
  clipStart.value = newClipStart
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return
  
  // Handle dragging logic here if needed
  // For now, just update cursor
  if (waveformCanvas.value) {
    waveformCanvas.value.style.cursor = 'grabbing'
  }
}

const handleMouseDown = (event: MouseEvent) => {
  isDragging.value = true
  dragStartX.value = event.clientX
  
  if (waveformCanvas.value) {
    waveformCanvas.value.style.cursor = 'grabbing'
  }
}

const handleMouseUp = () => {
  isDragging.value = false
  
  if (waveformCanvas.value) {
    waveformCanvas.value.style.cursor = 'pointer'
  }
}

const handleMouseLeave = () => {
  isDragging.value = false
  
  if (waveformCanvas.value) {
    waveformCanvas.value.style.cursor = 'pointer'
  }
}

// Move clip controls
const moveClipLeft = () => {
  const newClipStart = Math.max(0, clipStart.value - 5)
  clipStart.value = newClipStart
}

const moveClipRight = () => {
  const newClipStart = Math.min(duration.value - 30, clipStart.value + 5)
  clipStart.value = newClipStart
}

// Audio playback
const togglePlayback = async () => {
  if (!audioBuffer.value || !audioContext.value) return
  
  if (isPlaying.value) {
    stopPlayback()
  } else {
    await startPlayback()
  }
}

const startPlayback = async () => {
  if (!audioBuffer.value || !audioContext.value) return
  
  try {
    // Resume audio context if suspended
    if (audioContext.value.state === 'suspended') {
      await audioContext.value.resume()
    }
    
    // Create source and gain nodes
    audioSource.value = audioContext.value.createBufferSource()
    gainNode.value = audioContext.value.createGain()
    
    audioSource.value.buffer = audioBuffer.value
    audioSource.value.connect(gainNode.value)
    gainNode.value.connect(audioContext.value.destination)
    
    // Set playback start time
    audioSource.value.start(0, clipStart.value, 30)
    
    isPlaying.value = true
    
    // Stop after 30 seconds
    setTimeout(() => {
      if (isPlaying.value) {
        stopPlayback()
      }
    }, 30000)
    
  } catch (error) {
    console.error('Error starting playback:', error)
  }
}

const stopPlayback = () => {
  if (audioSource.value) {
    try {
      audioSource.value.stop()
    } catch (error) {
      // Source might already be stopped
    }
    audioSource.value = null
  }
  
  isPlaying.value = false
}

// Utility functions
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.waveform-selector {
  @apply space-y-4;
}

canvas {
  image-rendering: pixelated;
}
</style>
