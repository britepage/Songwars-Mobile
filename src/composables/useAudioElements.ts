import { ref, type Ref } from 'vue'

export interface AudioElementOptions {
  isMobile: boolean
  onLoadedMetadata?: () => void
  onError?: () => void
  onTimeUpdate?: () => void
  onEnded?: () => void
  preload?: 'none' | 'metadata' | 'auto'
  volume?: number
  loop?: boolean
}

export const useAudioElements = () => {
  const createAudioElement = (url: string, options: AudioElementOptions) => {
    const audio = new Audio(url)
    audio.preload = options.isMobile ? 'none' : (options.preload || 'metadata')
    
    if (options.volume !== undefined) {
      audio.volume = options.volume
    }
    
    if (options.loop !== undefined) {
      audio.loop = options.loop
    }
    
    // Add event listeners
    if (options.onLoadedMetadata) {
      audio.addEventListener('loadedmetadata', options.onLoadedMetadata)
    }
    if (options.onError) {
      audio.addEventListener('error', options.onError)
    }
    if (options.onTimeUpdate) {
      audio.addEventListener('timeupdate', options.onTimeUpdate)
    }
    if (options.onEnded) {
      audio.addEventListener('ended', options.onEnded)
    }
    
    return audio
  }

  const cleanupAudio = (audioRef: Ref<HTMLAudioElement | null>) => {
    const audio = audioRef.value
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      audio.src = '' // Clear source to free memory
      audio.load() // Reset audio element
      audioRef.value = null // Clear reference
    }
  }

  const cleanupAllAudio = (audioRefs: Ref<HTMLAudioElement | null>[]) => {
    audioRefs.forEach(cleanupAudio)
  }

  const playAudio = async (audio: HTMLAudioElement | null) => {
    if (!audio) return false
    
    try {
      await audio.play()
      return true
    } catch (error) {
      console.warn('Audio play failed:', error)
      return false
    }
  }

  const pauseAudio = (audio: HTMLAudioElement | null) => {
    if (audio && !audio.paused) {
      audio.pause()
    }
  }

  const stopAudio = (audio: HTMLAudioElement | null) => {
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
  }

  const setAudioTime = (audio: HTMLAudioElement | null, time: number) => {
    if (audio) {
      audio.currentTime = time
    }
  }

  const getAudioProgress = (audio: HTMLAudioElement | null) => {
    if (!audio || !audio.duration) return 0
    return (audio.currentTime / audio.duration) * 100
  }

  return {
    createAudioElement,
    cleanupAudio,
    cleanupAllAudio,
    playAudio,
    pauseAudio,
    stopAudio,
    setAudioTime,
    getAudioProgress
  }
}

