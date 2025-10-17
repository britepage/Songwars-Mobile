// DEPRECATED: Mobile app uses useHowlerPlayer.ts for better mobile audio support
// This file may still be used by the web app
import { ref } from 'vue'

export const useAudioTimeouts = () => {
  const timeoutIds = ref<{ [key: string]: NodeJS.Timeout }>({})

  const setAudioTimeout = (songId: string, callback: () => void, delay: number) => {
    clearTimeoutForSong(songId)
    timeoutIds.value[songId] = setTimeout(callback, delay)
  }

  const clearTimeoutForSong = (songId: string) => {
    if (timeoutIds.value[songId]) {
      clearTimeout(timeoutIds.value[songId])
      delete timeoutIds.value[songId]
    }
  }

  const clearAllTimeouts = () => {
    Object.keys(timeoutIds.value).forEach(clearTimeoutForSong)
  }

  const hasTimeout = (songId: string) => {
    return !!timeoutIds.value[songId]
  }

  return {
    timeoutIds,
    setAudioTimeout,
    clearTimeoutForSong,
    clearAllTimeouts,
    hasTimeout
  }
}

