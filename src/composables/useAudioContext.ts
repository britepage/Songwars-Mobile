// DEPRECATED: Mobile app uses useHowlerPlayer.ts for better mobile audio support
// This file may still be used by the web app
import { ref } from 'vue'

export const useAudioContext = () => {
  const globalAudioContext = ref<AudioContext | null>(null)
  const isAudioContextSuspended = ref(false)

  const initializeAudioContext = () => {
    if (!globalAudioContext.value) {
      try {
        globalAudioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)()
        console.log('Audio context initialized with state:', globalAudioContext.value.state)
        
        // Listen for state changes
        globalAudioContext.value.addEventListener('statechange', () => {
          console.log('Audio context state changed to:', globalAudioContext.value?.state)
          isAudioContextSuspended.value = globalAudioContext.value?.state === 'suspended'
        })
      } catch (error) {
        console.warn('Failed to initialize audio context:', error)
        return null
      }
    }
    return globalAudioContext.value
  }

  const resumeAudioContext = async () => {
    if (globalAudioContext.value && globalAudioContext.value.state === 'suspended') {
      try {
        await globalAudioContext.value.resume()
        isAudioContextSuspended.value = false
        console.log('Audio context resumed')
        return true
      } catch (error) {
        console.warn('Failed to resume audio context:', error)
        return false
      }
    }
    return true
  }

  const ensureAudioContextReady = async () => {
    try {
      const context = initializeAudioContext()
      if (context && context.state === 'suspended') {
        console.log('Audio context is suspended, attempting to resume...')
        return await resumeAudioContext()
      }
      return true
    } catch (error) {
      console.warn('Failed to ensure audio context ready:', error)
      // Return true to allow fallback to regular audio.play()
      return true
    }
  }

  return {
    globalAudioContext,
    isAudioContextSuspended,
    initializeAudioContext,
    resumeAudioContext,
    ensureAudioContextReady
  }
}

