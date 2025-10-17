// DEPRECATED: Mobile app uses useHowlerPlayer.ts for better mobile audio support
// This file may still be used by the web app
import { ref, computed, onUnmounted } from 'vue'
import { useAudioContext } from './useAudioContext'
import { useAudioElements } from './useAudioElements'
import { useAudioTimeouts } from './useAudioTimeouts'

interface AudioPlayerOptions {
  songId: string
  audioUrl: string
  clipStartTime?: number
  autoStopAfter?: number
}

export function useAudioPlayer() {
  const { resumeAudioContext, ensureAudioContextReady } = useAudioContext()
  const { createAudioElement, cleanupAudio } = useAudioElements()
  const { setAudioTimeout, clearAllTimeouts } = useAudioTimeouts()

  const currentAudio = ref<HTMLAudioElement | null>(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentSongId = ref<string | null>(null)

  const progress = computed(() => {
    if (duration.value === 0) return 0
    return (currentTime.value / duration.value) * 100
  })

  const togglePlay = async (options: AudioPlayerOptions) => {
    try {
      // Initialize and resume AudioContext for mobile compatibility
      await ensureAudioContextReady()

      // If same song is playing, pause it
      if (currentSongId.value === options.songId && currentAudio.value) {
        if (isPlaying.value) {
          currentAudio.value.pause()
          isPlaying.value = false
        } else {
          await resumeAudioContext() // Ensure context is ready
          await currentAudio.value.play()
          isPlaying.value = true
        }
        return
      }

      // Stop current audio if different song
      if (currentAudio.value) {
        currentAudio.value.pause()
        currentAudio.value.currentTime = 0
        currentAudio.value.src = ''
        currentAudio.value.load()
        currentAudio.value = null
      }

      // Load new audio
      isLoading.value = true
      error.value = null
      currentSongId.value = options.songId

      const audio = createAudioElement(options.audioUrl, {
        preload: 'metadata',
        isMobile: true // Mobile-optimized settings
      })

      currentAudio.value = audio

      // WAIT FOR METADATA TO LOAD (Promise wrapper)
      await new Promise<void>((resolve, reject) => {
        const handleMetadata = () => {
          duration.value = audio.duration
          
          if (options.clipStartTime) {
            audio.currentTime = options.clipStartTime
          }
          
          audio.removeEventListener('loadedmetadata', handleMetadata)
          audio.removeEventListener('error', handleError)
          resolve()
        }
        
        const handleError = (e: Event) => {
          audio.removeEventListener('loadedmetadata', handleMetadata)
          audio.removeEventListener('error', handleError)
          reject(new Error('Failed to load audio metadata'))
        }
        
        audio.addEventListener('loadedmetadata', handleMetadata)
        audio.addEventListener('error', handleError)
      })

      // NOW play (metadata is guaranteed loaded)
      await audio.play()
      isPlaying.value = true
      isLoading.value = false

      // Add remaining event listeners
      audio.addEventListener('play', () => {
        isPlaying.value = true
        updateProgress()
      })

      audio.addEventListener('pause', () => {
        isPlaying.value = false
      })

      audio.addEventListener('ended', () => {
        isPlaying.value = false
        currentTime.value = 0
      })

      audio.addEventListener('timeupdate', () => {
        currentTime.value = audio.currentTime
      })

      // Auto-stop after specified duration
      if (options.autoStopAfter) {
        setAudioTimeout(options.songId, () => {
          if (currentAudio.value === audio && isPlaying.value) {
            audio.pause()
            isPlaying.value = false
          }
        }, options.autoStopAfter)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Audio playback failed'
      isLoading.value = false
    }
  }

  const updateProgress = () => {
    if (currentAudio.value && isPlaying.value) {
      currentTime.value = currentAudio.value.currentTime
      requestAnimationFrame(updateProgress)
    }
  }

  const stop = () => {
    if (currentAudio.value) {
      currentAudio.value.pause()
      isPlaying.value = false
      currentTime.value = 0
    }
  }

  const seek = (time: number) => {
    if (currentAudio.value) {
      currentAudio.value.currentTime = time
      currentTime.value = time
    }
  }

  const cleanup = () => {
    if (currentAudio.value) {
      currentAudio.value.pause()
      currentAudio.value.currentTime = 0
      currentAudio.value.src = ''
      currentAudio.value.load()
      currentAudio.value = null
    }
    clearAllTimeouts()
    isPlaying.value = false
    currentTime.value = 0
    duration.value = 0
    currentSongId.value = null
  }

  // Cleanup on unmount
  onUnmounted(() => {
    cleanup()
  })

  return {
    isPlaying,
    currentTime,
    duration,
    progress,
    isLoading,
    error,
    currentSongId,
    togglePlay,
    stop,
    seek,
    cleanup
  }
}

