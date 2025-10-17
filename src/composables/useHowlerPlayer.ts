import { ref, computed, onUnmounted } from 'vue'
import { Howl } from 'howler'

interface HowlerPlayerOptions {
  songId: string
  audioUrl: string
  clipStartTime?: number      // Seek to this time (seconds)
  autoStopAfter?: number       // Auto-stop duration (seconds)
}

export function useHowlerPlayer() {
  let currentHowl: Howl | null = null
  let autoStopTimeout: NodeJS.Timeout | null = null
  let progressInterval: number | null = null
  
  const currentSongId = ref<string | null>(null)
  const isPlaying = ref(false)
  const isLoading = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const error = ref<string | null>(null)
  
  const progress = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })
  
  const togglePlay = async (options: HowlerPlayerOptions) => {
    try {
      clearAutoStopTimeout()
      
      // Toggle if same song
      if (currentSongId.value === options.songId && currentHowl) {
        if (currentHowl.playing()) {
          currentHowl.pause()
          isPlaying.value = false
          stopProgressTracking()
        } else {
          currentHowl.play()
          isPlaying.value = true
          startProgressTracking()
        }
        return
      }
      
      // Clean up old sound
      cleanup()
      
      // Create new Howl
      isLoading.value = true
      error.value = null
      currentSongId.value = options.songId
      
      currentHowl = new Howl({
        src: [options.audioUrl],
        html5: true,           // CRITICAL for mobile
        preload: 'metadata',
        onload: () => {
          isLoading.value = false
          duration.value = currentHowl!.duration()
          
          // Seek to clip start time if specified
          if (options.clipStartTime) {
            currentHowl!.seek(options.clipStartTime)
          }
        },
        onplay: () => {
          isPlaying.value = true
          startProgressTracking()
          
          // Set auto-stop timeout if specified
          if (options.autoStopAfter) {
            autoStopTimeout = setTimeout(() => {
              if (currentHowl && currentHowl.playing()) {
                currentHowl.pause()
                isPlaying.value = false
                stopProgressTracking()
              }
            }, options.autoStopAfter * 1000)
          }
        },
        onpause: () => {
          isPlaying.value = false
          stopProgressTracking()
          clearAutoStopTimeout()
        },
        onend: () => {
          isPlaying.value = false
          currentTime.value = 0
          stopProgressTracking()
          clearAutoStopTimeout()
        },
        onstop: () => {
          isPlaying.value = false
          currentTime.value = 0
          stopProgressTracking()
          clearAutoStopTimeout()
        },
        onerror: (id, err) => {
          error.value = `Audio error: ${err}`
          isLoading.value = false
          isPlaying.value = false
        }
      })
      
      // Play immediately
      currentHowl.play()
      
    } catch (err: any) {
      error.value = err.message
      isLoading.value = false
    }
  }
  
  const pause = () => {
    if (currentHowl) {
      currentHowl.pause()
    }
  }
  
  const stop = () => {
    if (currentHowl) {
      currentHowl.stop()
    }
  }
  
  const seek = (time: number) => {
    if (currentHowl) {
      currentHowl.seek(time)
      currentTime.value = time
    }
  }
  
  const cleanup = () => {
    stopProgressTracking()
    clearAutoStopTimeout()
    if (currentHowl) {
      currentHowl.unload()
      currentHowl = null
    }
    currentSongId.value = null
    currentTime.value = 0
    duration.value = 0
    isPlaying.value = false
  }
  
  const startProgressTracking = () => {
    stopProgressTracking()
    progressInterval = window.setInterval(() => {
      if (currentHowl && currentHowl.playing()) {
        currentTime.value = currentHowl.seek() as number
      }
    }, 100) // Update every 100ms
  }
  
  const stopProgressTracking = () => {
    if (progressInterval) {
      clearInterval(progressInterval)
      progressInterval = null
    }
  }
  
  const clearAutoStopTimeout = () => {
    if (autoStopTimeout) {
      clearTimeout(autoStopTimeout)
      autoStopTimeout = null
    }
  }
  
  onUnmounted(() => {
    cleanup()
  })
  
  return {
    // State
    currentSongId,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    progress,
    error,
    
    // Methods
    togglePlay,
    pause,
    stop,
    seek,
    cleanup
  }
}

