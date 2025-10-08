# SongWars Frontend State Management

## Overview
SongWars uses **Pinia** as the primary state management solution, providing a modern, type-safe, and reactive approach to managing application state. The application follows a modular store architecture with specialized stores for different aspects of the system.

## State Management Architecture

### Core Principles
1. **Centralized State**: Global state managed through Pinia stores
2. **Reactive Updates**: Automatic UI updates when state changes
3. **Type Safety**: Full TypeScript support for state management
4. **Modular Design**: Specialized stores for different concerns
5. **Composition API**: Modern Vue.js patterns throughout

## Pinia Stores

### 1. Authentication Store (`store/authStore.ts`)
**Purpose**: Manages user authentication state and session
**Key State**:
- `authenticatedUser` - Boolean authentication status
- `accessToken` - Current access token
- `refreshToken` - Refresh token for session renewal
- `signInError` - Authentication error messages

**Key Actions**:
- `signIn(email, password)` - User authentication
- `signOut()` - User logout and cleanup
- `signUp(email, password)` - New user registration
- `resetPassword(email)` - Password reset initiation

**Integration**:
- Watches Supabase user state changes
- Automatically updates profile store on login
- Handles route redirection based on auth state
- Manages session persistence

### 2. Song Store (`store/songStore.ts`)
**Purpose**: Manages song data, churn system, and song operations
**Key State**:
- `songs` - Array of user's songs
- `weeklyScores` - Weekly churn scores
- `churnEvents` - Churn system events
- `loadingSongs` - Loading state for song operations
- `totalSongs` - Total song count
- `trashedSongs` - Soft-deleted songs

**Key Actions**:
- `fetchSongs()` - Load user's songs
- `fetchChurnData()` - Load churn system data
- `softDeleteSong(songId)` - Soft delete a song
- `restoreSong(songId)` - Restore from trash
- `hardDeleteSong(songId)` - Permanent deletion
- `updateSong(songId, updates)` - Update song metadata

**Churn System Integration**:
- Manages 4-week competition cycle
- Tracks weekly scores and progression
- Handles song elimination and advancement
- Provides churn state visualization

### 3. Profile Store (`store/profileStore.ts`)
**Purpose**: Manages user profile data and settings
**Key State**:
- `profile` - User profile information
- `loading` - Profile loading state
- `error` - Profile operation errors

**Key Actions**:
- `fetchProfile()` - Load current user's profile
- `updateProfile(profileData)` - Update profile information
- `fetchPublicProfile(username)` - Load public user profile
- `uploadAvatar(file)` - Handle avatar uploads

**Profile Management**:
- Handles profile creation for new users
- Manages avatar uploads to Supabase storage
- Provides public profile access
- Integrates with authentication store

### 4. Song Comparison Store (`store/songComparisonStore.ts`)
**Purpose**: Manages battle comparison state and voting
**Key State**:
- `currentBattle` - Current battle data
- `votingInProgress` - Voting state
- `battleResults` - Battle outcome data
- `selectedSongs` - Songs in current battle

**Key Actions**:
- `startBattle(songs)` - Initialize new battle
- `castVote(songId)` - Submit vote
- `endBattle()` - Complete battle
- `resetBattle()` - Clear battle state

**Battle System Integration**:
- Manages song selection and pairing
- Handles voting logic and validation
- Tracks battle statistics
- Integrates with leaderboard system

### 5. Leaderboard Store (`store/leaderboardStore.ts`)
**Purpose**: Manages leaderboard data and battle results
**Key State**:
- `leaderboard` - Current week's leaderboard with clip_start_time
- `leaderboardByGenre` - Leaderboard grouped by genre
- `availableGenres` - Available genres for filtering
- `loading` - Leaderboard loading state

**Key Actions**:
- `fetchLeaderboard(genre, week)` - Load leaderboard with genre/week filtering
- `fetchAvailableGenres(week)` - Load available genres for filtering
- Supports both regular weeks and Hall of Fame data
- Includes clip_start_time for 30-second audio playback
- `hideLeaderboardModal()` - Hide leaderboard
- `updateBattleResults(results)` - Update battle data

**Leaderboard Features**:
- Weekly leaderboard management
- Battle result tracking
- Modal state management
- Real-time updates

### 6. Golden Ears Store (`store/goldenEarsStore.ts`)
**Purpose**: Manages Golden Ears award system
**Key State**:
- `awards` - User's Golden Ears awards
- `progress` - Current week's progress
- `accuracy` - Judge accuracy score
- `qualification` - Award eligibility status

**Key Actions**:
- `fetchAwards()` - Load user's awards
- `fetchProgress()` - Load current progress
- `calculateAccuracy()` - Calculate judge accuracy
- `checkQualification()` - Check award eligibility

**Award System Integration**:
- Tracks judge accuracy over time
- Manages award qualification criteria
- Provides progress visualization
- Handles award notifications

### 7. Upload Store (`store/uploadStore.ts`)
**Purpose**: Manages file upload state and progress
**Key State**:
- `uploading` - Upload in progress
- `progress` - Upload progress percentage
- `error` - Upload error messages
- `uploadedFile` - Successfully uploaded file

**Key Actions**:
- `startUpload(file)` - Begin upload process
- `updateProgress(percentage)` - Update progress
- `completeUpload(file)` - Mark upload complete
- `handleError(error)` - Handle upload errors

**Upload Management**:
- Tracks upload progress
- Handles file validation
- Manages conversion processes
- Provides error handling

### 8. Theme Store (`store/themeStore.ts`)
**Purpose**: Manages application theme and appearance
**Key State**:
- `theme` - Current theme ('light' or 'dark')
- `systemTheme` - System theme preference
- `isDarkMode` - Computed dark mode state

**Key Actions**:
- `setTheme(theme)` - Set theme preference
- `toggleTheme()` - Toggle between themes
- `initTheme()` - Initialize theme on load
- `watchSystemTheme()` - Watch system theme changes

**Theme Features**:
- Light/dark mode switching
- System theme detection
- Persistent theme storage
- CSS variable management

## Composables

**Total Composables: 10** (Updated January 2025)

### Audio Management Composables (7)

### 1. Tagged Songs Composable (`composables/useTaggedSongs.ts`)
**Purpose**: Manages tagged songs functionality with 30-second clips
**Key Features**:
- **State Management**: Tagged songs list and expanded state
- **Audio Management**: Dynamic audio element creation/destruction
- **30-Second Clips**: Uses user-chosen clip_start_time for playback
- **Auto-Stop**: Automatically stops clips after 30 seconds
- **Clean UI**: No progress bars or "30s Clip" indicators
- **Artist Links**: Clickable links to artist profiles

**Key Functions**:
- `fetchTaggedSongs(userId)` - Load user's tagged songs with clip_start_time
- `playTaggedSong(song)` - Play/pause tagged song with 30-second clips
- `untagSong(songId)` - Remove song from tags
- `toggleSongExpanded(songId)` - Expand/collapse song details

**Audio Management**:
- Creates audio elements dynamically
- Handles mobile optimization
- Manages memory cleanup
- Provides progress tracking

### 2. Audio Context Composable (`composables/useAudioContext.ts`)
**Purpose**: Manages Web Audio API context for enhanced audio playback
**Key Features**:
- **Lazy Initialization**: Context created only when needed
- **iOS Compatibility**: Handles iOS audio restrictions
- **Context Resume**: Automatic context resumption after user interaction
- **Singleton Pattern**: Single audio context for the app

**Key Functions**:
- `audioContext` - Reactive audio context reference
- `initAudioContext()` - Initialize or resume audio context
- `getAudioContext()` - Get existing audio context

**Use Cases**:
- Advanced audio processing
- Audio analysis and visualization
- Low-latency audio playback
- Cross-browser audio compatibility

### 3. Audio Elements Composable (`composables/useAudioElements.ts`)
**Purpose**: Manages audio element lifecycle and memory
**Key Features**:
- **Element Creation**: Dynamic audio element generation
- **Memory Management**: Proper cleanup and disposal
- **Mobile Optimization**: Reduced preloading on mobile
- **Error Handling**: Graceful failure handling

**Key Functions**:
- `createAudioElement(src)` - Create and configure audio element
- `cleanupAudioElement(element)` - Remove and cleanup audio element
- `resetAudioElement(element)` - Reset element to initial state

**Memory Management**:
- Removes elements from DOM when done
- Clears event listeners
- Prevents memory leaks
- Handles mobile device constraints

### 4. Audio Player Composable (`composables/useAudioPlayer.ts`)
**Purpose**: Core audio playback functionality and controls
**Key Features**:
- **Playback Control**: Play, pause, stop, seek operations
- **State Management**: Current playback state tracking
- **Volume Control**: Volume adjustment and muting
- **Error Recovery**: Automatic error handling and retry

**Key Functions**:
- `playAudio(element)` - Start audio playback
- `pauseAudio(element)` - Pause audio playback
- `stopAudio(element)` - Stop and reset audio
- `seekTo(element, time)` - Seek to specific time
- `setVolume(element, volume)` - Adjust volume

**State Tracking**:
- Playing/paused/stopped states
- Current time and duration
- Loading and buffering states
- Error states and messages

### 5. Audio Progress Composable (`composables/useAudioProgress.ts`)
**Purpose**: Track and visualize audio playback progress
**Key Features**:
- **Progress Tracking**: Real-time playback position
- **Time Updates**: Current time and duration
- **Reactive State**: Automatic UI updates
- **Performance Optimized**: Efficient update intervals

**Key Functions**:
- `progress` - Reactive progress percentage (0-100)
- `currentTime` - Current playback time in seconds
- `duration` - Total audio duration
- `updateProgress(element)` - Manually update progress
- `resetProgress()` - Reset progress to zero

**Integration**:
- Works with audio elements
- Updates on timeupdate events
- Provides formatted time strings
- Calculates progress percentages

### 6. Audio Timeouts Composable (`composables/useAudioTimeouts.ts`)
**Purpose**: Manage 30-second auto-stop timeouts for audio clips
**Key Features**:
- **Timeout Management**: Track and clear timeouts
- **30-Second Auto-Stop**: Automatically stop clips after 30 seconds
- **Memory Leak Prevention**: Proper timeout cleanup
- **Spam-Click Protection**: Handle rapid play/pause clicks
- **Multi-Instance Support**: Manage multiple timeouts simultaneously

**Key Functions**:
- `setTimeout30(element, callback)` - Set 30-second timeout with tracking
- `clearTimeout30(timeoutId)` - Clear specific timeout
- `clearAllTimeouts()` - Clear all active timeouts
- `hasTimeout(element)` - Check if element has active timeout

**Critical Features** (See AUDIO_TIMEOUT_MANAGEMENT.md):
- **Timeout ID Storage**: Tracks active timeouts to prevent accumulation
- **Proper Cleanup**: Clears timeouts when pausing, stopping, or switching songs
- **State Synchronization**: Resets timeout when audio is restarted from beginning
- **Error Prevention**: Prevents songs from stopping prematurely due to orphaned timeouts

**Use Cases**:
- Battle audio clips (30-second previews)
- Leaderboard song previews
- Tagged song playback
- Any 30-second audio clip functionality

### 7. Battle Audio Composable (`composables/useBattleAudio.ts`)
**Purpose**: Battle-specific audio management and coordination
**Key Features**:
- **Dual Audio Management**: Handle two songs simultaneously
- **Synchronized Playback**: Coordinate multiple audio elements
- **Battle Flow**: Manage audio through battle lifecycle
- **Cleanup Coordination**: Ensure all audio is properly cleaned up

**Key Functions**:
- `playBattleAudio(songA, songB)` - Play both battle songs
- `stopBattleAudio()` - Stop all battle audio
- `cleanupBattleAudio()` - Clean up all battle audio elements
- `switchAudio(fromSong, toSong)` - Switch between songs

**Battle Integration**:
- Works with BattleAnimation component
- Handles roulette sound effects
- Manages tape player audio
- Coordinates with battle state

### Service Composables (2)

### 8. Supabase Service Composable (`composables/useSupabaseService.ts`)
**Purpose**: Centralized Supabase client and service methods
**Key Features**:
- **Typed RPC Calls**: Type-safe database function calls
- **File Management**: Upload and download helpers
- **Auth Integration**: Automatic authentication
- **Error Handling**: Consistent error management

**Key Functions**:
- `supabase` - Supabase client instance
- `callRPC(functionName, params)` - Call database functions
- `uploadFile(bucket, path, file)` - Upload files to storage
- `downloadFile(bucket, path)` - Download files from storage
- `deleteFile(bucket, path)` - Delete files from storage

**Integration**:
- Used across all stores
- Provides consistent API access
- Handles authentication automatically
- Manages connection state

### 9. OAuth Sign In Composable (`composables/useOAuthSignIn.ts`)
**Purpose**: OAuth authentication flow management (Google, Facebook)
**Key Features**:
- **Provider Support**: Google and Facebook OAuth
- **Redirect Handling**: Post-auth redirect management
- **Error Handling**: OAuth-specific error handling
- **Mobile Support**: Handles mobile OAuth flows

**Key Functions**:
- `signInWithGoogle()` - Initiate Google OAuth flow
- `signInWithFacebook()` - Initiate Facebook OAuth flow
- `handleOAuthCallback()` - Process OAuth callback
- `getOAuthError()` - Get OAuth error messages

**OAuth Flow**:
1. User clicks provider button
2. Redirects to provider
3. User authenticates
4. Redirects back to app
5. Processes auth result
6. Updates auth store

### Utility Composables (1)

### 10. Mobile Detection Composable (`composables/useMobileDetection.ts`)
**Purpose**: Detect mobile devices and browsers for optimization
**Key Features**:
- **Device Detection**: Identify mobile vs desktop
- **Browser Detection**: Identify specific browsers (Safari, Chrome, etc.)
- **OS Detection**: Identify iOS, Android, etc.
- **Reactive State**: Auto-updates on window resize

**Key Functions**:
- `isMobile` - Boolean indicating mobile device
- `isIOS` - Boolean indicating iOS device
- `isSafari` - Boolean indicating Safari browser
- `isAndroid` - Boolean indicating Android device
- `isChrome` - Boolean indicating Chrome browser

**Use Cases**:
- Conditional audio preloading
- Mobile-specific UI adjustments
- Browser-specific workarounds
- Performance optimizations

**Integration**:
- Used in audio components
- Used in animation components
- Used for responsive behavior
- Used for platform-specific features

## State Management Patterns

### 1. Store Composition
- **Single Responsibility**: Each store handles one concern
- **Loose Coupling**: Stores communicate through actions
- **Shared State**: Common state accessed through stores
- **State Isolation**: Store-specific state management

### 2. Reactive Updates
- **Automatic UI Updates**: Vue reactivity system
- **Computed Properties**: Derived state calculation
- **Watchers**: State change monitoring
- **Event-Driven**: Action-based state updates

### 3. Data Flow
- **Unidirectional**: Data flows in one direction
- **Action-Based**: State changes through actions
- **Event-Driven**: Component communication via events
- **Store Integration**: Cross-store communication

### 4. Error Handling
- **Store-Level Errors**: Error state in stores
- **Component-Level Handling**: UI error display
- **Retry Mechanisms**: Automatic retry for failed operations
- **User Feedback**: Clear error messages

## Performance Optimizations

### 1. State Optimization
- **Minimal State**: Only necessary state in stores
- **Computed Properties**: Efficient derived state
- **Lazy Loading**: Load data on demand
- **Memory Management**: Proper cleanup

### 2. Update Optimization
- **Selective Updates**: Only update changed state
- **Batch Updates**: Group related state changes
- **Debounced Updates**: Prevent excessive updates
- **Caching**: Store computed values

### 3. Store Optimization
- **Store Splitting**: Separate concerns
- **Action Batching**: Group related actions
- **State Normalization**: Efficient data structure
- **Cleanup**: Proper store cleanup

## Integration with Supabase

### 1. Real-Time Updates
- **Subscriptions**: Live data updates
- **State Synchronization**: Keep stores in sync
- **Optimistic Updates**: Immediate UI updates
- **Conflict Resolution**: Handle update conflicts

### 2. Authentication Integration
- **User State**: Automatic user state management
- **Session Management**: Token handling
- **Route Protection**: Authentication-based routing
- **Profile Sync**: Automatic profile updates

### 3. Data Persistence
- **Local Storage**: Client-side persistence
- **Session Storage**: Temporary data storage
- **IndexedDB**: Large data storage
- **Supabase Storage**: File storage

## Testing Strategy

### 1. Store Testing
- **Unit Tests**: Individual store testing
- **Integration Tests**: Store interaction testing
- **Mocking**: Supabase client mocking
- **State Validation**: State consistency testing

### 2. Component Testing
- **Store Integration**: Component-store interaction
- **State Mocking**: Mock store state
- **Action Testing**: Action dispatch testing
- **UI Updates**: State change UI testing

### 3. E2E Testing
- **User Flows**: Complete user journey testing
- **State Persistence**: Cross-page state testing
- **Error Scenarios**: Error handling testing
- **Performance**: State management performance

## Best Practices

### 1. Store Design
- **Single Responsibility**: One concern per store
- **Clear Actions**: Descriptive action names
- **Type Safety**: Full TypeScript support
- **Documentation**: Clear store documentation

### 2. State Management
- **Immutable Updates**: Never mutate state directly
- **Action-Based**: Use actions for state changes
- **Error Handling**: Comprehensive error management
- **Cleanup**: Proper resource cleanup

### 3. Performance
- **Minimal State**: Keep state lean
- **Efficient Updates**: Optimize update patterns
- **Memory Management**: Prevent memory leaks
- **Caching**: Cache expensive computations

This comprehensive state management documentation provides developers with a complete understanding of how state is managed throughout the SongWars application, enabling effective development and maintenance of the state management system.
