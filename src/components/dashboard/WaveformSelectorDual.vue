<template>
  <div class="waveform-selector-container bg-white rounded-lg p-4">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-medium text-black flex items-center">
        <svg class="w-[3em] h-[3em] mr-2 text-[#ffd200]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
        Select 30s Clip – Drag the Frame to Your Best Segment
      </h3>
    </div>


    <!-- Waveform Container -->
    <div ref="waveformContainer" class="waveform-container relative h-20 mb-4 rounded-lg overflow-hidden">
      <!-- Base Gray Waveform (z-0) -->
      <div ref="baseWaveform" class="absolute inset-0 z-0"></div>
      
      <!-- Yellow Waveform with CSS Mask (z-10) -->
      <div 
        ref="yellowWaveform" 
        class="absolute inset-0 z-10"
        :style="yellowMaskStyle"
      ></div>
      
      <!-- Draggable Selection Frame (z-20) -->
      <div 
        v-if="duration >= 30"
        ref="selectionFrame"
        class="absolute selection-frame z-20"
        :style="selectionFrameStyle"
        @mousedown="startDrag"
        @touchstart="startDrag"
      ></div>
      
      <!-- Loading Spinner (z-30) -->
      <div v-if="loading" class="absolute inset-0 z-30 flex items-center justify-center bg-black/50">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffd200]"></div>
      </div>
    </div>

    <!-- Selection Info -->
    <div v-if="!loading && duration > 0" class="flex justify-between items-center mb-4">
      <div class="text-sm text-black">
        <span v-if="duration >= 30">
          <span class="text-[#ffd200] font-medium">Selected: {{ formatTime(selectedStart) }}</span> →
          <span class="text-[#ffd200] font-medium">{{ formatTime(selectedStart + 30) }}</span>
          <span class="ml-2 text-black">(30 seconds)</span>
        </span>
        <span v-else class="text-green-400">
          ✓ Entire song will be used ({{ formatTime(duration) }})
        </span>
      </div>
      <div class="text-xs text-black">Total: {{ formatTime(duration) }}</div>
    </div>

    <!-- Control Buttons -->
    <div class="flex items-center space-x-2">
      <!-- Preview Button (shown when not playing) -->
      <button
        v-if="!isPlaying"
        @click="previewSelection"
        class="px-4 py-2 bg-[#ffd200] text-black rounded-lg hover:bg-[#e6bd00] transition-colors text-sm font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        type="button"
        :disabled="loading || !baseWavesurfer"
      >
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
        {{ duration >= 30 ? 'Preview Selection' : 'Preview Song' }}
      </button>

      <!-- Stop Button (shown when playing) -->
      <button
        v-if="isPlaying"
        @click="stopPlayback"
        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center"
        type="button"
      >
        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
        </svg>
        Stop
      </button>

      <!-- Reset Button (only for songs >= 30s) -->
      <button
        v-if="duration >= 30"
        @click="resetToStart"
        class="px-4 py-2 bg-transparent text-black rounded-lg hover:bg-transparent transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        type="button"
        :disabled="loading || !baseWavesurfer || isPlaying"
      >
        Reset to Start
      </button>
    </div>

    <!-- Tip Block -->
    <div class="mt-3 text-xs text-black rounded p-2">
      <span v-if="duration >= 30">
        💡 <strong>Tip:</strong> Drag the golden frame across the waveform to select your best 30-second clip. 
        The yellow waveform bars show exactly what will be used in battles!
      </span>
      <span v-else>
        ✅ <strong>Perfect!</strong> Your song is under 30 seconds, so the entire track will be used in battles. 
        The yellow waveform shows your full song!
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'

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

// DOM refs
const waveformContainer = ref<HTMLElement | null>(null)
const baseWaveform = ref<HTMLElement | null>(null)
const yellowWaveform = ref<HTMLElement | null>(null)
const selectionFrame = ref<HTMLElement | null>(null)

// Component state
const loading = ref(true)
const selectedStart = ref(props.initialClipStart || 0)
const duration = ref(0)
const isPlaying = ref(false)
const isDragging = ref(false)

// Audio preview
const previewAudioRef = ref<HTMLAudioElement | null>(null)

// Timeout management
const timeoutIds: { [key: string]: NodeJS.Timeout } = {}

// WaveSurfer instances
let baseWavesurfer: any = null
let yellowWavesurfer: any = null

// Utility functions
const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const clearTimeoutForPreview = (previewId: string) => {
  if (timeoutIds[previewId]) {
    clearTimeout(timeoutIds[previewId])
    delete timeoutIds[previewId]
  }
}

// CSS Masking for yellow waveform
const yellowMaskStyle = computed(() => {
  if (duration.value === 0) {
    return { 
      webkitMask: 'linear-gradient(to right, transparent 100%, transparent 100%)',
      mask: 'linear-gradient(to right, transparent 100%, transparent 100%)'
    }
  }
  
  if (duration.value < 30) {
    // Show entire yellow waveform for short songs
    return {
      webkitMask: 'linear-gradient(to right, black 0%, black 100%)',
      mask: 'linear-gradient(to right, black 0%, black 100%)'
    }
  } else {
    // Mask yellow waveform to only show in selected region
    const durationValue = duration.value
    const startValue = selectedStart.value
    const startPercent = (startValue / durationValue) * 100
    const endPercent = ((startValue + 30) / durationValue) * 100
    
    return {
      webkitMask: `linear-gradient(to right, transparent 0%, transparent ${startPercent}%, black ${startPercent}%, black ${endPercent}%, transparent ${endPercent}%, transparent 100%)`,
      mask: `linear-gradient(to right, transparent 0%, transparent ${startPercent}%, black ${startPercent}%, black ${endPercent}%, transparent ${endPercent}%, transparent 100%)`
    }
  }
})

// Selection frame positioning
const selectionFrameStyle = computed(() => {
  if (duration.value === 0 || duration.value < 30) {
    return { display: 'none' }
  }
  
  const startPercent = (selectedStart.value / duration.value) * 100
  const widthPercent = (30 / duration.value) * 100
  
  return {
    left: `${startPercent}%`,
    width: `${widthPercent}%`,
    height: '80px',
    top: '0px'
  }
})

// Update yellow mask directly (for immediate visual feedback during drag)
const updateYellowClippingDirect = (startTime: number) => {
  if (!yellowWaveform.value || duration.value === 0) return
  
  if (duration.value < 30) {
    yellowWaveform.value.style.webkitMask = 'linear-gradient(to right, black 0%, black 100%)'
    yellowWaveform.value.style.mask = 'linear-gradient(to right, black 0%, black 100%)'
  } else {
    const durationValue = duration.value
    const startPercent = (startTime / durationValue) * 100
    const endPercent = ((startTime + 30) / durationValue) * 100
    
    const maskValue = `linear-gradient(to right, transparent 0%, transparent ${startPercent}%, black ${startPercent}%, black ${endPercent}%, transparent ${endPercent}%, transparent 100%)`
    
    yellowWaveform.value.style.webkitMask = maskValue
    yellowWaveform.value.style.mask = maskValue
  }
}

// Initialize WaveSurfer
onMounted(async () => {
  try {
    loading.value = true
    
    // Wait for DOM to be ready
    await nextTick()
    
    if (!baseWaveform.value || !yellowWaveform.value) {
      console.error('Waveform container refs not available')
      return
    }
    
    // Dynamic import of WaveSurfer
    console.log('🔄 Loading WaveSurfer.js...')
    const WaveSurfer = (await import('wavesurfer.js')).default
    
    // Create base gray waveform
    console.log('🔄 Creating base waveform...')
    baseWavesurfer = WaveSurfer.create({
      container: baseWaveform.value,
      waveColor: '#4B5563',      // Gray-600 bars
      progressColor: '#6B7280',  // Gray-500 for progress
      cursorColor: 'transparent',
      barWidth: 2,
      barGap: 1,
      height: 80,
      normalize: true,
      interact: false // Disable interaction on base layer
    })
    
    // Create yellow waveform
    console.log('🔄 Creating yellow waveform...')
    yellowWavesurfer = WaveSurfer.create({
      container: yellowWaveform.value,
      waveColor: '#ffd200',      // Bright yellow bars
      progressColor: '#ffed4e',  // Brighter yellow for progress
      cursorColor: 'transparent',
      barWidth: 2,
      barGap: 1,
      height: 80,
      normalize: true,
      interact: false // Disable interaction on yellow layer
    })
    
    // Set up ready event listeners
    let baseReady = false
    let yellowReady = false
    
    const checkBothReady = () => {
      if (baseReady && yellowReady) {
        duration.value = baseWavesurfer.getDuration()
        
        // Ensure clip start is valid
        if (duration.value < 30) {
          selectedStart.value = 0
        } else {
          selectedStart.value = Math.min(props.initialClipStart, duration.value - 30)
        }
        
        loading.value = false
        console.log('✅ Waveforms loaded successfully. Duration:', duration.value)
        
        // Update yellow clipping after initialization
        updateYellowClippingDirect(selectedStart.value)
      }
    }
    
    baseWavesurfer.on('ready', () => {
      console.log('✅ Base waveform ready')
      baseReady = true
      checkBothReady()
    })
    
    yellowWavesurfer.on('ready', () => {
      console.log('✅ Yellow waveform ready')
      yellowReady = true
      checkBothReady()
    })
    
    // Handle errors
    baseWavesurfer.on('error', (error: any) => {
      console.error('❌ Base waveform error:', error)
      loading.value = false
    })
    
    yellowWavesurfer.on('error', (error: any) => {
      console.error('❌ Yellow waveform error:', error)
      loading.value = false
    })
    
    // Load audio into both instances
    console.log('🔄 Loading audio URL:', props.audioUrl)
    await Promise.all([
      baseWavesurfer.load(props.audioUrl),
      yellowWavesurfer.load(props.audioUrl)
    ])
    
  } catch (error) {
    console.error('❌ Error initializing waveforms:', error)
    loading.value = false
  }
})

// Draggable frame system
const startDrag = (event: MouseEvent | TouchEvent) => {
  if (duration.value < 30 || !waveformContainer.value) return
  
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = true
  
  // Disable CSS transitions during drag for immediate response
  if (selectionFrame.value) {
    selectionFrame.value.style.transition = 'none'
  }
  
  // Cache container rect to avoid repeated getBoundingClientRect calls
  const containerRect = waveformContainer.value.getBoundingClientRect()
  const containerWidth = containerRect.width
  const maxStart = duration.value - 30
  
  // Determine if this is a touch or mouse event
  const isTouch = event.type.startsWith('touch')
  
  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging.value) return
    
    // Get client coordinates from either mouse or touch event
    let clientX: number
    if (isTouch && 'touches' in e) {
      clientX = e.touches[0].clientX
    } else if ('clientX' in e) {
      clientX = e.clientX
    } else {
      return
    }
    
    // Calculate relative position within container
    const relativeX = clientX - containerRect.left
    const relativePercent = relativeX / containerWidth
    
    // Calculate new start time based on position
    const newStartTime = relativePercent * duration.value
    
    // Constrain to valid range (can't go past duration - 30)
    const constrainedStart = Math.max(0, Math.min(newStartTime, maxStart))
    
    // Update reactive values
    selectedStart.value = constrainedStart
    emit('clipChanged', constrainedStart)
    
    // Update yellow clipping immediately
    updateYellowClippingDirect(constrainedStart)
    
    // Audio scrubbing during drag (if playing)
    if (isPlaying.value && previewAudioRef.value) {
      previewAudioRef.value.currentTime = constrainedStart
    }
  }
  
  const handleEnd = () => {
    isDragging.value = false
    
    // Re-enable CSS transitions
    if (selectionFrame.value) {
      selectionFrame.value.style.transition = ''
    }
    
    // Remove event listeners
    if (isTouch) {
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleEnd)
    } else {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
    }
    
    updateYellowClippingDirect(selectedStart.value)
  }
  
  // Add event listeners
  if (isTouch) {
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('touchend', handleEnd)
  } else {
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleEnd)
  }
}

// Audio playback functions
const previewSelection = () => {
  if (!props.audioUrl) return

  // Stop any existing preview
  if (previewAudioRef.value) {
    previewAudioRef.value.pause()
    previewAudioRef.value.currentTime = 0
  }
  
  // Clear any existing timeout
  clearTimeoutForPreview('preview')

  // Create clean audio element
  const previewAudio = new Audio(props.audioUrl)
  previewAudio.preload = 'metadata'
  previewAudioRef.value = previewAudio
  
  // Set the start time for the clip
  if (duration.value >= 30) {
    previewAudio.currentTime = selectedStart.value
  } else {
    previewAudio.currentTime = 0
  }

  // Update playing state
  isPlaying.value = true

  // Play with promise handling
  previewAudio.play().then(() => {
    console.log('▶️ Audio started playing successfully')
  }).catch((error) => {
    console.error('❌ Failed to play audio:', error)
    isPlaying.value = false
    previewAudioRef.value = null
  })

  // Stop after appropriate duration
  const previewDuration = duration.value >= 30 ? 30000 : (duration.value * 1000)

  // Set timeout
  timeoutIds['preview'] = setTimeout(() => {
    console.log('⏹️ Auto-stopping preview after', previewDuration, 'ms')
    if (previewAudioRef.value === previewAudio) {
      previewAudio.pause()
      previewAudio.currentTime = 0
      isPlaying.value = false
      previewAudioRef.value = null
    }
    delete timeoutIds['preview']
  }, previewDuration)
  
  // Cleanup on ended
  previewAudio.onended = () => {
    if (previewAudioRef.value === previewAudio) {
      isPlaying.value = false
      previewAudioRef.value = null
    }
  }
}

const stopPlayback = () => {
  // Clear timeout
  clearTimeoutForPreview('preview')
  
  // Stop audio
  if (previewAudioRef.value) {
    previewAudioRef.value.pause()
    previewAudioRef.value.currentTime = 0
    previewAudioRef.value = null
  }
  
  isPlaying.value = false
  
  // Reset waveform position
  if (duration.value >= 30) {
    baseWavesurfer?.setTime(selectedStart.value)
    yellowWavesurfer?.setTime(selectedStart.value)
  } else {
    baseWavesurfer?.setTime(0)
    yellowWavesurfer?.setTime(0)
  }
}

const resetToStart = () => {
  if (duration.value < 30) return
  
  selectedStart.value = 0
  emit('clipChanged', 0)
  
  updateYellowClippingDirect(0)
}

// Watch for audio URL changes
watch(() => props.audioUrl, async (newUrl) => {
  if (newUrl && baseWavesurfer && yellowWavesurfer) {
    loading.value = true
    selectedStart.value = 0
    
    await Promise.all([
      baseWavesurfer.load(newUrl),
      yellowWavesurfer.load(newUrl)
    ])
  }
})

// Cleanup on unmount
onUnmounted(() => {
  // Clear all timeouts
  Object.keys(timeoutIds).forEach(previewId => {
    clearTimeoutForPreview(previewId)
  })
  
  // Stop and cleanup audio
  if (previewAudioRef.value) {
    previewAudioRef.value.pause()
    previewAudioRef.value.currentTime = 0
    previewAudioRef.value = null
  }
  
  // Destroy WaveSurfer instances
  if (baseWavesurfer) {
    baseWavesurfer.destroy()
  }
  if (yellowWavesurfer) {
    yellowWavesurfer.destroy()
  }
})
</script>

<style scoped>
.waveform-selector-container {
  @apply space-y-4;
}

.waveform-container {
  position: relative;
}

.selection-frame {
  border: 5px solid #ffffff;
  border-radius: 8px;
  background: transparent;
  cursor: grab;
  box-shadow: 0 0 0 2px #000000, 0 2px 12px rgba(255, 210, 0, 0.6);
  transition: all 0.2s ease;
  pointer-events: all;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.selection-frame:active {
  cursor: grabbing;
  transform: scale(1.02);
  box-shadow: 0 0 0 2px #000000, 0 4px 16px rgba(255, 210, 0, 0.8);
}

.selection-frame:hover {
  box-shadow: 0 0 0 2px #000000, 0 2px 16px rgba(255, 210, 0, 0.7);
}
</style>
