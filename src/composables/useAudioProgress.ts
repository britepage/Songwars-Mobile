import { ref, computed } from 'vue'

export const useAudioProgress = () => {
  const progress = ref<{ [key: string]: number }>({})
  const currentTime = ref<{ [key: string]: number }>({})
  const duration = ref<{ [key: string]: number }>({})

  const updateProgress = (songId: string, audioElement: HTMLAudioElement) => {
    const current = audioElement.currentTime
    const dur = audioElement.duration || 30
    const progressValue = (current / dur) * 100

    currentTime.value[songId] = current
    duration.value[songId] = dur
    progress.value[songId] = Math.min(progressValue, 100)
  }

  const seekToProgress = (songId: string, audioElement: HTMLAudioElement, percentage: number) => {
    const dur = audioElement.duration || 30
    const newTime = (percentage / 100) * dur
    audioElement.currentTime = newTime

    currentTime.value[songId] = newTime
    progress.value[songId] = Math.min(percentage, 100)
  }

  const seekToTime = (songId: string, audioElement: HTMLAudioElement, time: number) => {
    audioElement.currentTime = time
    currentTime.value[songId] = time
    
    const dur = audioElement.duration || 30
    const progressValue = (time / dur) * 100
    progress.value[songId] = Math.min(progressValue, 100)
  }

  const resetProgress = (songId: string) => {
    progress.value[songId] = 0
    currentTime.value[songId] = 0
  }

  const getProgress = (songId: string) => {
    return progress.value[songId] || 0
  }

  const getCurrentTime = (songId: string) => {
    return currentTime.value[songId] || 0
  }

  const getDuration = (songId: string) => {
    return duration.value[songId] || 0
  }

  // Computed properties for battle-specific songs
  const songAProgress = computed(() => getProgress('A'))
  const songBProgress = computed(() => getProgress('B'))
  const songACurrentTime = computed(() => getCurrentTime('A'))
  const songBCurrentTime = computed(() => getCurrentTime('B'))
  const songADuration = computed(() => getDuration('A'))
  const songBDuration = computed(() => getDuration('B'))

  return {
    progress,
    currentTime,
    duration,
    updateProgress,
    seekToProgress,
    seekToTime,
    resetProgress,
    getProgress,
    getCurrentTime,
    getDuration,
    songAProgress,
    songBProgress,
    songACurrentTime,
    songBCurrentTime,
    songADuration,
    songBDuration
  }
}

