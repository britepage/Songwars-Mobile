import { ref, computed } from 'vue'
import { Howl } from 'howler'

interface AudioPlayerOptions {
  songId: string
  audioUrl: string
  clipStartTime?: number
  autoStopAfter?: number
}

export function useAudioPlayer() {
  const currentSound = ref<Howl | null>(null)
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
      // If same song is playing, pause it
      if (currentSongId.value === options.songId && currentSound.value) {
        if (isPlaying.value) {
          currentSound.value.pause()
          isPlaying.value = false
        } else {
          currentSound.value.play()
          isPlaying.value = true
        }
        return
      }

      // Stop current sound if different song
      if (currentSound.value) {
        currentSound.value.stop()
        currentSound.value.unload()
      }

      // Load new sound
      isLoading.value = true
      error.value = null
      currentSongId.value = options.songId

      const sound = new Howl({
        src: [options.audioUrl],
        html5: true,
        preload: true,
        onload: () => {
          isLoading.value = false
          duration.value = sound.duration()
          
          // Seek to clip start time if specified
          if (options.clipStartTime) {
            sound.seek(options.clipStartTime)
          }
          
          sound.play()
          isPlaying.value = true
        },
        onplay: () => {
          isPlaying.value = true
          updateProgress()
        },
        onpause: () => {
          isPlaying.value = false
        },
        onstop: () => {
          isPlaying.value = false
          currentTime.value = 0
        },
        onend: () => {
          isPlaying.value = false
          currentTime.value = 0
        },
        onloaderror: (_id: any, err: any) => {
          error.value = `Failed to load audio: ${err}`
          isLoading.value = false
        },
        onplayerror: (_id: any, err: any) => {
          error.value = `Failed to play audio: ${err}`
          isPlaying.value = false
        }
      })

      currentSound.value = sound

      // Auto-stop after specified duration
      if (options.autoStopAfter) {
        setTimeout(() => {
          if (currentSound.value === sound) {
            sound.stop()
          }
        }, options.autoStopAfter)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Audio playback failed'
      isLoading.value = false
    }
  }

  const updateProgress = () => {
    if (currentSound.value && isPlaying.value) {
      currentTime.value = currentSound.value.seek() as number
      requestAnimationFrame(updateProgress)
    }
  }

  const stop = () => {
    if (currentSound.value) {
      currentSound.value.stop()
      isPlaying.value = false
      currentTime.value = 0
    }
  }

  const seek = (time: number) => {
    if (currentSound.value) {
      currentSound.value.seek(time)
      currentTime.value = time
    }
  }

  const cleanup = () => {
    if (currentSound.value) {
      currentSound.value.unload()
      currentSound.value = null
    }
    isPlaying.value = false
    currentTime.value = 0
    duration.value = 0
    currentSongId.value = null
  }

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

