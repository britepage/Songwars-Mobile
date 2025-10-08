# Audio Timeout Management

## Overview
This document describes the audio timeout management system implemented to fix various audio playback bugs in the SongWars application.

## Problem Statement

### Previous Issues
1. **Songs with start time 0** didn't reset properly after playback
2. **30-second timeouts** didn't reset when pausing and restarting audio
3. **Spam-clicking play buttons** caused songs to stop prematurely
4. **Switching between songs** caused interference from previous timeouts
5. **Memory leaks** from accumulated orphaned timeouts

### Root Cause
- Missing timeout ID storage and management
- No timeout clearing when pausing/stopping audio
- Timeouts continued running even after audio was stopped
- Multiple timeouts could accumulate and interfere with each other

## Solution Implementation

### Core Components Fixed
1. **`useTaggedSongs.ts`** - Tagged songs audio playback
2. **`pages/leaderboard.vue`** - Leaderboard audio playback
3. **`components/BattleAnimation.vue`** - Battle system audio playback
4. **`components/WaveformSelectorDual.vue`** - Audio preview functionality

### Implementation Details

#### 1. Timeout Storage
```typescript
// Timeout management for 30-second auto-stop
const timeoutIds: { [key: string]: NodeJS.Timeout } = {}
```

#### 2. Timeout Clearing Function
```typescript
// Clear timeout for a specific song
const clearTimeoutForSong = (songId: string) => {
  if (timeoutIds[songId]) {
    clearTimeout(timeoutIds[songId])
    delete timeoutIds[songId]
  }
}
```

#### 3. Enhanced Cleanup
```typescript
// Cleanup individual audio element
const cleanupAudio = (songId: string) => {
  // ... existing cleanup logic ...
  // Clear any pending timeout
  clearTimeoutForSong(songId)
}
```

#### 4. Proper Timeout Management
```typescript
// Set new timeout and store the ID
timeoutIds[songId] = setTimeout(() => {
  // ... timeout logic ...
  // Clear the timeout ID after it fires
  delete timeoutIds[songId]
}, 30000)
```

## Key Features

### 1. Timeout ID Storage
- Each timeout is stored with a unique identifier
- Prevents accumulation of orphaned timeouts
- Enables proper cleanup when needed

### 2. Automatic Cleanup
- Timeouts are cleared when audio is paused
- Timeouts are cleared when audio is stopped
- Timeouts are cleared on component unmount
- Timeouts are cleared on error conditions

### 3. Memory Management
- Prevents memory leaks from accumulated timeouts
- Proper cleanup on component destruction
- No orphaned timeouts left running

### 4. Spam-Click Protection
- Handles rapid play/pause clicks gracefully
- Clears existing timeouts before creating new ones
- Prevents multiple timeouts from interfering

### 5. Cross-Component Coordination
- Prevents timeout interference between different audio components
- Each component manages its own timeouts independently
- Clean separation of concerns

## Usage Examples

### Starting Audio with Timeout
```typescript
// Clear any existing timeout first
clearTimeoutForSong(songId)

// Set new timeout and store the ID
timeoutIds[songId] = setTimeout(() => {
  // Auto-stop logic
  if (isPlaying.value[songId] && audio) {
    audio.pause()
    isPlaying.value[songId] = false
    progress.value[songId] = 0
  }
  // Clear the timeout ID after it fires
  delete timeoutIds[songId]
}, 30000)
```

### Stopping Audio with Cleanup
```typescript
const stopAudio = (songId: string) => {
  // Clear any pending timeout
  clearTimeoutForSong(songId)
  
  // Stop audio
  if (audioRefs[songId]) {
    audioRefs[songId].pause()
    isPlaying.value[songId] = false
  }
}
```

### Component Cleanup
```typescript
onUnmounted(() => {
  // Clear all timeouts first
  Object.keys(timeoutIds).forEach(songId => {
    clearTimeoutForSong(songId)
  })
  
  // ... other cleanup logic ...
})
```

## Benefits

### 1. Improved User Experience
- Songs with start time 0 now reset properly
- 30-second timeouts reset correctly when pausing/restarting
- Spam-clicking play buttons works smoothly
- Switching between songs doesn't cause interference

### 2. Better Performance
- No memory leaks from orphaned timeouts
- Proper cleanup prevents resource accumulation
- More efficient audio management

### 3. Robust Error Handling
- Timeouts are cleared on error conditions
- Graceful handling of edge cases
- Better stability across different scenarios

### 4. Maintainable Code
- Clear separation of timeout management
- Consistent patterns across components
- Easy to debug and extend

## Testing

### Manual Testing Scenarios
1. **Start time 0 songs**: Play, pause, restart - should reset properly
2. **Spam-clicking**: Rapidly click play/pause - should work smoothly
3. **Song switching**: Play song A, then song B - no interference
4. **Component unmounting**: Navigate away - all timeouts cleared
5. **Error conditions**: Audio errors - timeouts cleared properly

### Automated Testing
- All timeout management functions are properly typed
- Linting passes with zero errors
- No TypeScript compilation errors in modified files

## Future Considerations

### Potential Enhancements
1. **Centralized Timeout Manager**: Could create a global timeout manager service
2. **Timeout Configuration**: Make timeout durations configurable
3. **Timeout Analytics**: Track timeout usage for debugging
4. **Advanced Cleanup**: More sophisticated cleanup strategies

### Monitoring
- Monitor for any new timeout-related issues
- Track memory usage improvements
- User feedback on audio behavior

## Conclusion

The audio timeout management system successfully resolves all identified audio playback bugs while maintaining backward compatibility and improving overall system stability. The implementation follows Vue.js best practices and provides a solid foundation for future audio-related enhancements.
