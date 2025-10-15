# 30-Second Clip Selection System - Complete Implementation Reference

**Document Purpose**: This document provides comprehensive documentation of the complete 30-second clip selection system from the production web app, covering waveform visualization, drag interactions, audio management, and visual design.

**Last Updated**: January 2025  
**Web App Files Referenced**:
- `components/WaveformSelectorDual.vue` (complete file, 708 lines)
- `composables/useAudioContext.ts` (64 lines)
- `composables/useAudioTimeouts.ts` (34 lines)
- `composables/useAudioElements.ts` (106 lines)
- `composables/useAudioProgress.ts` (80 lines)

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Component Overview](#component-overview)
3. [Waveform Visualization](#waveform-visualization)
4. [Draggable Selection Frame](#draggable-selection-frame)
5. [Audio Management](#audio-management)
6. [Real-time Preview System](#real-time-preview-system)
7. [Visual Design System](#visual-design-system)
8. [Audio Composables](#audio-composables)
9. [Complete Code Reference](#complete-code-reference)
10. [Implementation Guide](#implementation-guide)

---

## System Architecture

### Component Structure

```
WaveformSelectorDual.vue (Main Component)
├── Dual Waveform Rendering (WaveSurfer.js)
│   ├── Base Gray Waveform (background layer)
│   └── Yellow Waveform (masked to selection)
├── Draggable Selection Frame (30-second window)
├── Audio Preview System (clean Audio element)
├── Control Buttons (Preview, Stop, Reset)
└── Selection Info Display
```

### Technology Stack

**Waveform Library**: WaveSurfer.js v7.9.9

**Why WaveSurfer**:
- Professional audio waveform visualization
- Canvas-based rendering (performant)
- Built-in audio playback integration
- Extensive API for customization

**Rendering Method**: HTML5 Canvas (via WaveSurfer.js)

**Dual-Layer Approach**:
1. **Base Layer**: Gray waveform (full song)
2. **Yellow Layer**: Yellow waveform (masked to 30-second selection)
3. **Frame Overlay**: Draggable selection frame

---

## Component Overview

### Props Interface

```typescript
interface Props {
  audioUrl: string          // URL of audio file
  initialClipStart?: number // Starting position in seconds (default: 0)
}
```

### Emits Interface

```typescript
const emit = defineEmits<{
  clipChanged: [clipStart: number]  // Emitted when selection changes
}>()
```

### Component State

```typescript
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
```

### Key Features

1. **Dual Waveform Layers**: Gray base + yellow highlight
2. **CSS Masking**: Yellow layer masked to show only selected region
3. **Draggable Frame**: White-bordered frame for 30-second selection
4. **Audio Preview**: Independent audio element for playback
5. **Auto-timeout**: 30-second automatic stop
6. **Scrubbing**: Real-time audio position during drag
7. **Short Song Support**: Songs < 30s use full duration

---

## Waveform Visualization

### WaveSurfer.js Configuration

#### Base Gray Waveform

**Code** (lines 216-226):
```typescript
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
```

**Settings Explanation**:

| Setting | Value | Purpose |
|---------|-------|---------|
| `container` | DOM element ref | Where to render waveform |
| `waveColor` | `#4B5563` | Gray bars (Tailwind gray-600) |
| `progressColor` | `#6B7280` | Slightly lighter gray (gray-500) |
| `cursorColor` | `transparent` | No cursor line |
| `barWidth` | `2` | 2px wide bars |
| `barGap` | `1` | 1px gap between bars |
| `height` | `80` | 80px tall |
| `normalize` | `true` | Normalize amplitude |
| `interact` | `false` | No click/drag on this layer |

#### Yellow Waveform

**Code** (lines 229-239):
```typescript
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
```

**Settings Explanation**:

| Setting | Value | Purpose |
|---------|-------|---------|
| `waveColor` | `#ffd200` | SongWars yellow |
| `progressColor` | `#ffed4e` | Brighter yellow |
| All others | Same as base | Identical rendering |

### Dual-Layer Architecture

```
┌─────────────────────────────────────────────┐
│  Waveform Container (80px height)          │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │  z-0
│  │  Base Gray Waveform (full width)    │   │  (Background)
│  └─────────────────────────────────────┘   │
│  ┌──────────────┐                          │  z-10
│  │ Yellow Wave  │ (masked to selection)    │  (Middle)
│  └──────────────┘                          │
│  ┌──────────────┐                          │  z-20
│  │ Frame Border │ (draggable)              │  (Foreground)
│  └──────────────┘                          │
└─────────────────────────────────────────────┘
```

**Layering**:
- **z-0**: Base gray waveform (always visible)
- **z-10**: Yellow waveform (CSS masked)
- **z-20**: Selection frame (draggable overlay)
- **z-30**: Loading spinner (when visible)

### CSS Masking System

**Purpose**: Shows yellow waveform only in selected 30-second region

**Implementation** (lines 160-186):
```typescript
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
```

**Mask Gradient Explanation**:

For selection from 20s to 50s (in 3-minute song):
```
0% ────────── 33% ═══════ 83% ────────── 100%
transparent    transparent  black    black    transparent  transparent
               [Start=20s]  visible  [End=50s]
```

**Result**: Yellow waveform visible only between 33% and 83% of width

### Waveform Loading

**Code** (lines 306-311):
```typescript
// Load audio into both instances
console.log('🔄 Loading audio URL:', props.audioUrl)
await Promise.all([
  baseWavesurfer.load(props.audioUrl),
  yellowWavesurfer.load(props.audioUrl)
])
```

**Both waveforms load same audio simultaneously**

**Ready Events** (lines 246-269):
- Both must emit 'ready' before component is usable
- Duration extracted from base wavesurfer
- Loading spinner removed when both ready

---

## Draggable Selection Frame

### Frame HTML Structure

**Code** (lines 19-27):
```vue
<div 
  v-if="duration >= 30"
  ref="selectionFrame" 
  class="absolute selection-frame z-20"
  :style="selectionFrameStyle"
  @mousedown="startDrag"
  @touchstart="startDrag"
>
</div>
```

**Conditional Display**: Only shown if song is ≥30 seconds

### Frame Positioning

**Code** (lines 189-203):
```typescript
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
```

**Calculation**:
- **Left Position**: `(selectedStart / duration) * 100%`
- **Width**: `(30 / duration) * 100%`
- **Height**: Fixed 80px
- **Top**: Fixed 0px

**Example**: 3-minute (180s) song, selection at 30s
- Left: `(30 / 180) * 100 = 16.67%`
- Width: `(30 / 180) * 100 = 16.67%`

### Frame Styling

**CSS** (lines 665-683):
```css
.selection-frame {
  border: 5px solid #ffffff;
  border-radius: 8px;
  background: transparent;
  cursor: grab;
  box-shadow: 0 0 0 2px #000000, 0 2px 12px rgba(255, 210, 0, 0.6);
  transition: all 0.2s ease;
  pointer-events: all;
}

.selection-frame:active {
  cursor: grabbing;
  transform: scale(1.02);
  box-shadow: 0 0 0 2px #000000, 0 4px 16px rgba(255, 210, 0, 0.8);
}

.selection-frame:hover {
  box-shadow: 0 0 0 2px #000000, 0 2px 16px rgba(255, 210, 0, 0.7);
}
```

**Visual Breakdown**:
- **Border**: 5px solid white
- **Border Radius**: 8px
- **Background**: Transparent (see-through)
- **Cursor**: Grab (normal), Grabbing (active)
- **Box Shadow**: 
  - Inner: 2px black outline
  - Outer: 12px yellow glow (rgba(255, 210, 0, 0.6))
- **Hover**: Brighter glow (0.7 opacity)
- **Active**: Even brighter glow (0.8 opacity) + 2% scale up

### Drag System Implementation

#### Start Drag

**Code** (lines 341-488):
```typescript
const startDrag = (event: MouseEvent | TouchEvent) => {
  if (duration.value < 30 || !waveformContainer.value) return
  
  event.preventDefault()
  event.stopPropagation()
  isDragging.value = true
  dragStartTime = Date.now()
  
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
      const now = Date.now()
      if (now - dragStartTime >= SCRUB_DELAY_MS && now - lastScrubTime >= SCRUB_THROTTLE_MS) {
        previewAudioRef.value.currentTime = constrainedStart
        lastScrubTime = now
      }
    }
  }
  
  const handleEnd = () => {
    isDragging.value = false
    
    // Re-enable CSS transitions
    if (selectionFrame.value) {
      selectionFrame.value.style.transition = ''
      selectionFrame.value.style.boxShadow = ''
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
```

**Drag Flow**:
1. User mousedown/touchstart on frame
2. Disable transitions for smooth drag
3. Cache container dimensions
4. Add document-level move/end listeners
5. Calculate position on each move
6. Constrain to valid boundaries [0, duration-30]
7. Update frame position and yellow mask
8. Emit clipChanged event
9. On end: cleanup listeners, re-enable transitions

### Boundary Enforcement

**Maximum Start Position**:
```typescript
const maxStart = duration.value - 30
```

**Can't drag past**: `duration - 30` seconds

**Constraint**:
```typescript
const constrainedStart = Math.max(0, Math.min(newStartTime, maxStart))
```

**Ensures**: 0 ≤ selectedStart ≤ (duration - 30)

**Example**: 3-minute song (180s)
- Min: 0s
- Max: 150s
- Selection: 0-30s, 150-180s, or anywhere between

### Touch and Mouse Support

**Detection**:
```typescript
const isTouch = event.type.startsWith('touch')
```

**Client X Extraction**:
```typescript
let clientX: number
if (isTouch && 'touches' in e) {
  clientX = e.touches[0].clientX
} else if ('clientX' in e) {
  clientX = e.clientX
}
```

**Event Listeners**:
- Touch: `touchmove`, `touchend`
- Mouse: `mousemove`, `mouseup`

**Passive False**: `{ passive: false }` allows `preventDefault()`

---

## Audio Management

### Audio Element Lifecycle

#### Creation

**Code** (lines 517-521):
```typescript
const previewAudio = new Audio(props.audioUrl)
previewAudio.preload = 'metadata'
previewAudioRef.value = previewAudio
```

**Independent Audio**: Creates NEW audio element (not using WaveSurfer's audio)

**Why**: Avoids conflicts with WaveSurfer instances

#### Playback Start

**Code** (lines 524-541):
```typescript
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
```

#### Auto-Stop Timeout

**Code** (lines 544-557):
```typescript
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
```

**Timeout Duration**:
- Long song (≥30s): 30 seconds (30000ms)
- Short song (<30s): Full duration

#### Cleanup

**On Unmount** (lines 639-660):
```typescript
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
```

**Complete Cleanup**:
1. Clear all timeouts
2. Stop audio playback
3. Reset audio time
4. Null audio reference
5. Destroy WaveSurfer instances

### Timeout Management

**Code** (lines 145-150):
```typescript
const clearTimeoutForPreview = (previewId: string) => {
  if (timeoutIds[previewId]) {
    clearTimeout(timeoutIds[previewId])
    delete timeoutIds[previewId]
  }
}
```

**Storage**: Dictionary mapping preview ID to timeout ID

**Purpose**: Allows canceling auto-stop when manually stopping

---

## Real-time Preview System

### Preview Selection Function

**Code** (lines 502-566):
```typescript
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
  
  // Set start time
  if (duration.value >= 30) {
    previewAudio.currentTime = selectedStart.value
  } else {
    previewAudio.currentTime = 0
  }
  
  isPlaying.value = true
  
  // Play audio
  previewAudio.play().then(() => {
    console.log('▶️ Audio started playing successfully')
  }).catch((error) => {
    console.error('❌ Failed to play audio:', error)
    isPlaying.value = false
    previewAudioRef.value = null
  })
  
  // Auto-stop timeout
  const previewDuration = duration.value >= 30 ? 30000 : (duration.value * 1000)
  timeoutIds['preview'] = setTimeout(() => {
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
```

### Audio Scrubbing During Drag

**Code** (lines 406-446):
```typescript
// Real-time audio scrubbing while dragging
if (isPlaying.value && previewAudioRef.value) {
  const now = Date.now()
  if (now - dragStartTime >= SCRUB_DELAY_MS && now - lastScrubTime >= SCRUB_THROTTLE_MS) {
    // Update audio position to match selection
    previewAudioRef.value.currentTime = constrainedStart
    lastScrubTime = now
    
    // Visual feedback
    if (selectionFrame.value) {
      selectionFrame.value.style.boxShadow = '0 0 0 2px #000000, 0 4px 20px rgba(255, 0, 0, 0.8)'
    }
    
    // Volume reduction for smoother effect
    if (previewAudioRef.value.volume > 0.3) {
      previewAudioRef.value.volume = 0.3
      setTimeout(() => {
        if (previewAudioRef.value) {
          previewAudioRef.value.volume = 1.0
        }
      }, 100)
    }
    
    // Pitch shift effect
    const scrubSpeed = 1.0 + (Math.random() * 0.1 - 0.05)
    previewAudioRef.value.playbackRate = scrubSpeed
    setTimeout(() => {
      if (previewAudioRef.value) {
        previewAudioRef.value.playbackRate = 1.0
      }
    }, 50)
  }
}
```

**Scrubbing Features**:
1. **Delay**: 200ms delay before scrubbing starts (prevents accidental)
2. **Throttle**: 50ms minimum between updates (performance)
3. **Audio Jump**: Jumps audio position to new selection
4. **Volume Duck**: Reduces to 30% during scrub
5. **Pitch Shift**: Random ±5% speed variation (tape effect)
6. **Visual Feedback**: Red glow on frame
7. **Auto-Reset**: Volume and pitch reset after scrub

### Stop Playback

**Code** (lines 569-596):
```typescript
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
```

---

## Visual Design System

### Colors

| Element | Color | Hex Code |
|---------|-------|----------|
| **Container Background** | Black | `bg-black` |
| **Waveform Background** | Gray 900 | `bg-gray-900` |
| **Base Waveform** | Gray 600 | `#4B5563` |
| **Base Progress** | Gray 500 | `#6B7280` |
| **Yellow Waveform** | SongWars Yellow | `#ffd200` |
| **Yellow Progress** | Bright Yellow | `#ffed4e` |
| **Selection Frame Border** | White | `#ffffff` |
| **Frame Outline** | Black | `#000000` |
| **Frame Glow** | Yellow @ 60% | `rgba(255, 210, 0, 0.6)` |
| **Header Icon** | Yellow | `#ffd200` (`text-[#ffd200]`) |
| **Preview Button** | Yellow | `#ffd200` (`bg-[#ffd200]`) |
| **Preview Hover** | Darker Yellow | `#e6bd00` |
| **Stop Button** | Red 600 | `bg-red-600` |
| **Reset Button** | Gray 700 | `bg-gray-700` |

### Typography

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| **Section Title** | 16px | Medium | White (`text-white`) |
| **Selection Info** | 14px | Normal | Gray 300 (`text-gray-300`) |
| **Selected Times** | 14px | Medium | Yellow (`text-[#ffd200]`) |
| **Total Duration** | 12px | Normal | Gray 400 (`text-gray-400`) |
| **Button Text** | 14px | Medium | Varies by button |
| **Tip Text** | 12px | Normal | Gray 400 |

### Spacing

| Element | Spacing | Pixels | Class |
|---------|---------|--------|-------|
| **Container Padding** | 4 | 16px | `p-4` |
| **Waveform Height** | 20 | 80px | `h-20` |
| **Waveform Bottom** | 4 | 16px | `mb-4` |
| **Info Bottom** | 4 | 16px | `mb-4` |
| **Button Gap** | 2 | 8px | `space-x-2` |
| **Tip Top** | 3 | 12px | `mt-3` |
| **Header Bottom** | 4 | 16px | `mb-4` |
| **Header Icon Right** | 2 | 8px | `mr-2` |

### Border Radius

| Element | Radius | Pixels | Class |
|---------|--------|--------|-------|
| **Container** | Large | 8px | `rounded-lg` |
| **Waveform Container** | Large | 8px | `rounded-lg` |
| **Selection Frame** | Medium | 8px | `border-radius: 8px` |
| **Buttons** | Large | 8px | `rounded-lg` |
| **Tip Box** | Default | 4px | `rounded` |

---

## Audio Composables

### useAudioContext

**File**: `composables/useAudioContext.ts`

**Purpose**: Manages global AudioContext for Web Audio API

**Exports**:
```typescript
{
  globalAudioContext: Ref<AudioContext | null>
  isAudioContextSuspended: Ref<boolean>
  initializeAudioContext: () => AudioContext | null
  resumeAudioContext: () => Promise<boolean>
  ensureAudioContextReady: () => Promise<boolean>
}
```

**Key Function**:
```typescript
const initializeAudioContext = () => {
  if (!globalAudioContext.value) {
    globalAudioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return globalAudioContext.value
}
```

**Browser Compatibility**: AudioContext || webkitAudioContext

---

### useAudioTimeouts

**File**: `composables/useAudioTimeouts.ts`

**Purpose**: Centralized timeout management for audio previews

**Exports**:
```typescript
{
  timeoutIds: Ref<{ [key: string]: NodeJS.Timeout }>
  setAudioTimeout: (songId: string, callback: () => void, delay: number) => void
  clearTimeoutForSong: (songId: string) => void
  clearAllTimeouts: () => void
  hasTimeout: (songId: string) => boolean
}
```

**Usage in Component**:
```typescript
// Store timeout
timeoutIds['preview'] = setTimeout(callback, 30000)

// Clear timeout
clearTimeoutForPreview('preview')
```

**Note**: Component uses inline timeout management (lines 138-150), not this composable

---

### useAudioElements

**File**: `composables/useAudioElements.ts`

**Purpose**: Factory functions for audio element creation and management

**Exports**:
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

**Note**: Component creates audio manually (line 517), not using this composable

---

### useAudioProgress

**File**: `composables/useAudioProgress.ts`

**Purpose**: Track playback progress for multiple audio elements

**Exports**:
```typescript
{
  progress: Ref<{ [key: string]: number }>
  currentTime: Ref<{ [key: string]: number }>
  duration: Ref<{ [key: string]: number }>
  updateProgress: (songId: string, audioElement: HTMLAudioElement) => void
  seekToProgress: (songId: string, audioElement: HTMLAudioElement, percentage: number) => void
  seekToTime: (songId: string, audioElement: HTMLAudioElement, time: number) => void
  resetProgress: (songId: string) => void
  // ... getter methods
}
```

**Note**: Component manages own progress (lines 131-132), not using this composable

---

## Complete Code Reference

### Component: WaveformSelectorDual.vue

**Template**: Lines 1-108
**Script**: Lines 110-660
**Styles**: Lines 663-708

**Key Sections**:
- Lines 206-317: WaveSurfer initialization
- Lines 160-186: Yellow mask calculation
- Lines 189-203: Frame positioning
- Lines 341-488: Drag system
- Lines 502-566: Preview playback
- Lines 569-596: Stop playback
- Lines 665-683: Frame styling

### Helper Function: Format Time

**Code** (lines 153-157):
```typescript
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
```

**Examples**:
- 0 → "0:00"
- 90 → "1:30"
- 185 → "3:05"

### Yellow Mask Update

**Code** (lines 320-338):
```typescript
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
```

**Direct DOM Manipulation**: Updates mask style directly for immediate visual feedback

---

## Implementation Guide

### Step 1: Install WaveSurfer.js

```bash
npm install wavesurfer.js
```

**Version**: 7.9.9 (from package.json)

### Step 2: Create Component

Copy the complete component code from lines 1-708

### Step 3: Required Imports

```typescript
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
```

**Dynamic Import** (line 213):
```typescript
const WaveSurfer = (await import('wavesurfer.js')).default
```

### Step 4: Parent Integration

**In parent component** (songUploader.vue):
```vue
<WaveformSelector 
  v-if="audioPreviewUrl"
  :audio-url="audioPreviewUrl"
  :initial-clip-start="clipStart"
  @clip-changed="handleClipChange"
/>
```

**Handler**:
```typescript
const handleClipChange = (newClipStart: number) => {
  clipStart.value = newClipStart
}
```

### Step 5: Audio URL Creation

```typescript
const audioPreviewUrl = ref<string | null>(null)

// When file selected:
audioPreviewUrl.value = URL.createObjectURL(file)
```

### Step 6: Styling

Include scoped styles from lines 663-708 in component

---

## Complete Control Buttons

### Preview/Stop Button

**Preview Button** (lines 60-71):
```vue
<button
  v-if="!isPlaying"
  @click="previewSelection"
  class="px-4 py-2 bg-[#ffd200] text-black rounded-lg hover:bg-[#e6bd00] transition-colors text-sm font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
  type="button"
  :disabled="!baseWavesurfer || loading"
>
  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
  {{ duration >= 30 ? 'Preview Selection' : 'Preview Song' }}
</button>
```

**Stop Button** (lines 73-83):
```vue
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
```

### Reset Button

**Code** (lines 85-93):
```vue
<button
  v-if="duration >= 30"
  @click="resetToStart"
  class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
  type="button"
  :disabled="!baseWavesurfer || loading || isPlaying"
>
  Reset to Start
</button>
```

---

## Contact & Questions

For questions about this implementation, refer to:
- **Web App Source**: `components/WaveformSelectorDual.vue`
- **WaveSurfer Docs**: https://wavesurfer.xyz/
- **Audio Composables**: `composables/useAudio*.ts`

**Document Version**: 1.0  
**Created**: January 2025  
**For**: Mobile App Implementation Team

