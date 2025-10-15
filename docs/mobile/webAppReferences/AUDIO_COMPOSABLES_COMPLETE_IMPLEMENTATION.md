# Audio Composables - Complete Implementation Reference

**Document Purpose**: This document provides the complete implementation code for all audio-related composables from the production web app, enabling mobile app to replicate identical audio management architecture.

**Last Updated**: January 2025  
**Web App Files Referenced**:
- `composables/useAudioContext.ts` (64 lines)
- `composables/useAudioTimeouts.ts` (34 lines)
- `composables/useAudioElements.ts` (106 lines)
- `composables/useAudioProgress.ts` (80 lines)

---

## Table of Contents

1. [Overview](#overview)
2. [useAudioContext](#useaudiocontext)
3. [useAudioTimeouts](#useaudiotimeouts)
4. [useAudioElements](#useaudioelements)
5. [useAudioProgress](#useaudioprogress)
6. [Integration Patterns](#integration-patterns)

---

## Overview

The web app uses **four audio composables** to manage audio playback, context management, timeout handling, and progress tracking across multiple components.

**Composables Architecture**:
```
useAudioContext.ts    → Global AudioContext management
useAudioTimeouts.ts   → 30-second timeout management
useAudioElements.ts   → Audio element creation and lifecycle
useAudioProgress.ts   → Progress tracking for multiple songs
```

**Purpose**: Centralize audio management logic for reuse across battle, waveform, and upload components.

---

## useAudioContext

### File Information

**Path**: `composables/useAudioContext.ts`  
**Lines**: 64  
**Dependencies**: None  
**Purpose**: Manages global AudioContext for Web Audio API with browser compatibility

### Complete Implementation Code

```typescript
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
```

### Exports

```typescript
{
  globalAudioContext: Ref<AudioContext | null>
  isAudioContextSuspended: Ref<boolean>
  initializeAudioContext: () => AudioContext | null
  resumeAudioContext: () => Promise<boolean>
  ensureAudioContextReady: () => Promise<boolean>
}
```

### Usage Example

```typescript
import { useAudioContext } from '~/composables/useAudioContext'

// In component
const { 
  globalAudioContext, 
  isAudioContextSuspended,
  ensureAudioContextReady 
} = useAudioContext()

// Ensure context is ready before playing audio
const playAudio = async () => {
  await ensureAudioContextReady()
  // Now safe to play audio
  audio.play()
}
```

### Implementation Notes

**Browser Compatibility**:
- Primary: `window.AudioContext` (modern browsers)
- Fallback: `window.webkitAudioContext` (Safari, older browsers)
- TypeScript cast: `(window as any).webkitAudioContext`

**Singleton Pattern**: Creates single global AudioContext instance (reused across app)

**State Monitoring**: Listens for 'suspended' state and tracks in reactive ref

**Auto-Resume**: Browsers may suspend AudioContext to save power - must resume before use

---

## useAudioTimeouts

### File Information

**Path**: `composables/useAudioTimeouts.ts`  
**Lines**: 34  
**Dependencies**: None  
**Purpose**: Centralized timeout management for audio previews (30-second auto-stop)

### Complete Implementation Code

```typescript
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
```

### Exports

```typescript
{
  timeoutIds: Ref<{ [key: string]: NodeJS.Timeout }>
  setAudioTimeout: (songId: string, callback: () => void, delay: number) => void
  clearTimeoutForSong: (songId: string) => void
  clearAllTimeouts: () => void
  hasTimeout: (songId: string) => boolean
}
```

### Usage Example

```typescript
import { useAudioTimeouts } from '~/composables/useAudioTimeouts'

// In component
const { setAudioTimeout, clearTimeoutForSong, clearAllTimeouts } = useAudioTimeouts()

// Set 30-second auto-stop
setAudioTimeout('song-preview', () => {
  audio.pause()
  audio.currentTime = 0
}, 30000)

// Clear specific timeout
clearTimeoutForSong('song-preview')

// Cleanup on unmount
onUnmounted(() => {
  clearAllTimeouts()
})
```

### Implementation Notes

**Dictionary Pattern**: Uses object with string keys for flexible timeout management

**Auto-Clear**: `setAudioTimeout` automatically clears existing timeout for same songId

**Cleanup**: `clearAllTimeouts()` essential for preventing memory leaks on unmount

**Common Use**: 30-second battle clip auto-stop, preview timeouts

---

## useAudioElements

### File Information

**Path**: `composables/useAudioElements.ts`  
**Lines**: 106  
**Dependencies**: None  
**Purpose**: Factory functions for audio element creation, playback, and lifecycle management

### Complete Implementation Code

```typescript
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
```

### Type Definitions

```typescript
interface AudioElementOptions {
  isMobile: boolean                     // Mobile-specific behavior
  onLoadedMetadata?: () => void        // Metadata loaded callback
  onError?: () => void                  // Error callback
  onTimeUpdate?: () => void            // Time update callback
  onEnded?: () => void                  // Playback ended callback
  preload?: 'none' | 'metadata' | 'auto'  // Preload strategy
  volume?: number                       // Initial volume (0-1)
  loop?: boolean                        // Loop playback
}
```

### Exports

```typescript
{
  createAudioElement: (url: string, options: AudioElementOptions) => HTMLAudioElement
  cleanupAudio: (audioRef: Ref<HTMLAudioElement | null>) => void
  cleanupAllAudio: (audioRefs: Ref<HTMLAudioElement | null>[]) => void
  playAudio: (audio: HTMLAudioElement | null) => Promise<boolean>
  pauseAudio: (audio: HTMLAudioElement | null) => void
  stopAudio: (audio: HTMLAudioElement | null) => void
  setAudioTime: (audio: HTMLAudioElement | null, time: number) => void
  getAudioProgress: (audio: HTMLAudioElement | null) => number
}
```

### Usage Example

```typescript
import { useAudioElements } from '~/composables/useAudioElements'

// In component
const { createAudioElement, cleanupAudio, playAudio, stopAudio } = useAudioElements()

// Create audio element
const audioRef = ref<HTMLAudioElement | null>(null)
audioRef.value = createAudioElement('https://example.com/song.mp3', {
  isMobile: false,
  preload: 'metadata',
  onLoadedMetadata: () => console.log('Metadata loaded'),
  onEnded: () => console.log('Playback finished')
})

// Play audio
await playAudio(audioRef.value)

// Cleanup on unmount
onUnmounted(() => {
  cleanupAudio(audioRef)
})
```

### Implementation Notes

**Mobile Optimization**: `isMobile: true` sets `preload: 'none'` to save bandwidth

**Memory Cleanup**: 
- Pauses audio
- Resets time to 0
- Clears source (`audio.src = ''`)
- Calls `load()` to free memory
- Nulls reference

**Promise Handling**: `playAudio()` catches autoplay policy errors

**Null Safety**: All helper functions check for null audio elements

---

## useAudioProgress

### File Information

**Path**: `composables/useAudioProgress.ts`  
**Lines**: 80  
**Dependencies**: None  
**Purpose**: Track playback progress for multiple audio elements simultaneously

### Complete Implementation Code

```typescript
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
```

### Exports

```typescript
{
  // Reactive state
  progress: Ref<{ [key: string]: number }>
  currentTime: Ref<{ [key: string]: number }>
  duration: Ref<{ [key: string]: number }>
  
  // Update functions
  updateProgress: (songId: string, audioElement: HTMLAudioElement) => void
  seekToProgress: (songId: string, audioElement: HTMLAudioElement, percentage: number) => void
  seekToTime: (songId: string, audioElement: HTMLAudioElement, time: number) => void
  resetProgress: (songId: string) => void
  
  // Getters
  getProgress: (songId: string) => number
  getCurrentTime: (songId: string) => number
  getDuration: (songId: string) => number
  
  // Battle-specific computed
  songAProgress: ComputedRef<number>
  songBProgress: ComputedRef<number>
  songACurrentTime: ComputedRef<number>
  songBCurrentTime: ComputedRef<number>
  songADuration: ComputedRef<number>
  songBDuration: ComputedRef<number>
}
```

### Usage Example

```typescript
import { useAudioProgress } from '~/composables/useAudioProgress'

// In battle component
const { 
  updateProgress, 
  songAProgress, 
  songBProgress,
  resetProgress 
} = useAudioProgress()

// Update progress on timeupdate
audioA.addEventListener('timeupdate', () => {
  updateProgress('A', audioA)
})

// Display progress
<div>Song A Progress: {{ songAProgress }}%</div>

// Reset on battle end
resetProgress('A')
resetProgress('B')
```

### Implementation Notes

**Dictionary Pattern**: Tracks multiple audio elements by string keys

**Default Duration**: Uses 30 seconds if duration not available (battle clips)

**Clamping**: Progress capped at 100% with `Math.min(progressValue, 100)`

**Battle Optimization**: Pre-computed refs for songs A and B (common use case)

---

## Integration Patterns

### Pattern 1: WaveSurfer Component

**From**: `components/WaveformSelectorDual.vue`

**Uses**: Inline timeout management (not composable)

```typescript
// Inline timeout dictionary
const timeoutIds: { [key: string]: NodeJS.Timeout } = {}

// Inline clear function
const clearTimeoutForPreview = (previewId: string) => {
  if (timeoutIds[previewId]) {
    clearTimeout(timeoutIds[previewId])
    delete timeoutIds[previewId]
  }
}

// Set timeout
timeoutIds['preview'] = setTimeout(callback, 30000)
```

**Why Inline**: Component-specific, not reused elsewhere

---

### Pattern 2: Battle Component

**Likely Uses**: 
- `useAudioContext` for AudioContext management
- `useAudioTimeouts` for 30-second battle auto-stop
- `useAudioProgress` for progress bars

**Example**:
```typescript
const { ensureAudioContextReady } = useAudioContext()
const { setAudioTimeout, clearAllTimeouts } = useAudioTimeouts()
const { updateProgress, songAProgress, songBProgress } = useAudioProgress()

// Start battle
await ensureAudioContextReady()
audioA.play()
audioB.play()

// Set auto-stop
setAudioTimeout('A', () => audioA.pause(), 30000)
setAudioTimeout('B', () => audioB.pause(), 30000)

// Track progress
audioA.addEventListener('timeupdate', () => {
  updateProgress('A', audioA)
})
```

---

### Pattern 3: Song List Component

**Likely Uses**: 
- `useAudioElements` for audio creation/cleanup
- `useAudioTimeouts` for preview timeouts

**Example**:
```typescript
const { createAudioElement, cleanupAudio, playAudio } = useAudioElements()
const { setAudioTimeout } = useAudioTimeouts()

// Create audio for preview
const audioRef = ref<HTMLAudioElement | null>(null)
audioRef.value = createAudioElement(songUrl, {
  isMobile: false,
  preload: 'metadata'
})

// Play with auto-stop
await playAudio(audioRef.value)
setAudioTimeout('preview', () => {
  audioRef.value?.pause()
}, 30000)
```

---

## Implementation Checklist

### useAudioContext
- [ ] Copy complete code from reference
- [ ] Import in components needing AudioContext
- [ ] Call `ensureAudioContextReady()` before playback
- [ ] Handle webkit fallback for Safari
- [ ] Monitor suspended state if needed

### useAudioTimeouts
- [ ] Copy complete code from reference
- [ ] Import in components with timed audio
- [ ] Set timeouts for 30-second auto-stop
- [ ] Clear timeouts on manual stop
- [ ] Call `clearAllTimeouts()` in onUnmounted

### useAudioElements
- [ ] Copy complete code from reference
- [ ] Define AudioElementOptions interface
- [ ] Use `createAudioElement()` for audio creation
- [ ] Set mobile flag appropriately
- [ ] Use `cleanupAudio()` in onUnmounted
- [ ] Handle playback promises

### useAudioProgress
- [ ] Copy complete code from reference
- [ ] Import in components showing progress
- [ ] Call `updateProgress()` on timeupdate events
- [ ] Use computed properties (songAProgress, etc.) for battles
- [ ] Reset progress on battle/preview end

---

## Quick Reference

### Import All Composables

```typescript
import { useAudioContext } from '~/composables/useAudioContext'
import { useAudioTimeouts } from '~/composables/useAudioTimeouts'
import { useAudioElements } from '~/composables/useAudioElements'
import { useAudioProgress } from '~/composables/useAudioProgress'
```

### Complete Integration Example

```typescript
// Setup
const { ensureAudioContextReady } = useAudioContext()
const { setAudioTimeout, clearAllTimeouts } = useAudioTimeouts()
const { createAudioElement, cleanupAudio } = useAudioElements()
const { updateProgress, songAProgress } = useAudioProgress()

// Create audio
const audioRef = ref<HTMLAudioElement | null>(null)
audioRef.value = createAudioElement(url, { isMobile: false })

// Play with management
await ensureAudioContextReady()
audioRef.value?.play()

// Track progress
audioRef.value?.addEventListener('timeupdate', () => {
  updateProgress('A', audioRef.value!)
})

// Auto-stop after 30s
setAudioTimeout('A', () => audioRef.value?.pause(), 30000)

// Cleanup
onUnmounted(() => {
  clearAllTimeouts()
  cleanupAudio(audioRef)
})
```

---

## Contact & Questions

For questions about these composables, refer to:
- **Web App Source**: `composables/useAudio*.ts`
- **Web Audio API Docs**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

**Document Version**: 1.0  
**Created**: January 2025  
**For**: Mobile App Implementation Team

