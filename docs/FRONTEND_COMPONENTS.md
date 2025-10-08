# SongWars Frontend Components

## Overview
This document provides comprehensive documentation of all Vue.js components in the SongWars frontend application, organized by functionality and purpose.

**Total Components: 21** (Updated January 2025)

## Component Architecture

### Component Categories
1. **Core Components** - Essential application components
2. **Dashboard Components** - Main application interface
3. **Admin Components** - Administrative functionality
4. **Authentication Components** - User authentication
5. **Golden Ears Components** - Award system
6. **Utility Components** - Reusable helper components

## Core Components

### 1. Footer Navigation (`components/FooterNavigation.vue`)
**Purpose**: Mobile bottom navigation
**Features**:
- Primary navigation tabs
- Active state indicators
- Mobile-optimized design
- Touch-friendly interface

### 2. Tape Player (`components/TapePlayer.vue`)
**Purpose**: Retro-styled audio player
**Features**:
- Cassette tape aesthetic
- Play/pause animation
- Progress visualization
- Theme integration

### 3. Waveform Selector Dual (`components/WaveformSelectorDual.vue`)
**Purpose**: Dual waveform comparison and clip selection
**Features**:
- Side-by-side waveforms
- Clip start time selection
- Audio preview
- 30-second clip visualization
- Battle interface integration

### 4. Hamburger Menu (`components/HamburgerMenu.vue`)
**Purpose**: Mobile slide-out navigation menu
**Key Features**:
- **Slide-out Animation**: Smooth right-to-left menu animation
- **Navigation Links**: FAQs, Community, Feedback, Privacy Policy, Terms of Service
- **Iframe Content View**: Embedded page viewing within the menu
- **Back Navigation**: Return to main menu from content view
- **DMCA Badge**: DMCA protection status display
- **Auto-close**: Closes automatically on route changes
- **Keyboard Shortcuts**: ESC key to close menu
- **Loading States**: Spinner during iframe loading

**Menu Items**:
- FAQs (embedded iframe)
- Facebook Community (external link)
- Submit Feedback (embedded iframe)
- Privacy Policy (embedded iframe)
- Terms of Service (embedded iframe)

**User Interactions**:
- Toggle menu open/close
- Navigate to embedded content
- External link handling
- Keyboard navigation support

### 5. Conversion CTA (`components/ConversionCTA.vue`)
**Purpose**: Call-to-action component for trial users
**Key Features**:
- **Benefits Display**: 5 key benefits with icons and descriptions
- **Conversion Buttons**: Sign Up (primary) and Sign In (secondary)
- **Responsive Layout**: Grid layout adapting to screen size
- **Theme Integration**: Dark/light mode support
- **Hover Effects**: Interactive benefit cards

**Benefits Highlighted**:
- 🎵 Unlimited Battles - Vote and discover music
- 🏆 Earn Golden Ears - Recognition for musical taste
- 📈 Top the Leaderboard - Compete with other musicians
- 🎤 Upload Your Music - Share creations
- 🌟 Artist Exposure - Help musicians get discovered

**Usage**: Displayed after trial battles are exhausted

### 6. Trial Counter (`components/TrialCounter.vue`)
**Purpose**: Display remaining trial battles for unauthenticated users
**Key Features**:
- **Battle Counter**: Shows remaining battles (max 5)
- **Progress Bar**: Visual progress indication
- **Real-time Updates**: Monitors sessionStorage changes
- **Exhausted State**: Special display when trials are complete
- **Theme Integration**: Dark/light mode support
- **Auto-refresh**: Updates every second to reflect usage

**States**:
- **Active**: Shows remaining trials with progress bar
- **Exhausted**: Displays completion message with call-to-action

**Dependencies**: trialManager utility, themeStore

### 7. Social Links Display (`components/SocialLinksDisplay.vue`)
**Purpose**: Display user's social media links on public profiles
**Key Features**:
- **Grid Layout**: Responsive 1-3 column grid
- **Platform Icons**: Brand-colored icons for each platform
- **Clickable Cards**: External links with hover effects
- **URL Formatting**: Clean domain display
- **Theme Integration**: Dark/light mode support
- **External Link Icon**: Visual indicator for external navigation

**Supported Platforms**: Spotify, Apple Music, YouTube, Instagram, Twitter, TikTok, SoundCloud, Bandcamp, Facebook, LinkedIn, Twitch, Patreon, and more

**Usage**: User profile pages, public profiles

### 8. Social Links Manager (`components/SocialLinksManager.vue`)
**Purpose**: Manage user's social media links (add/remove)
**Key Features**:
- **Add Links**: Up to 3 social links maximum
- **Platform Detection**: Automatic platform identification from URL
- **URL Validation**: Validates supported platforms
- **Duplicate Prevention**: Prevents adding same platform/URL twice
- **Remove Links**: Delete links with visual confirmation
- **Platform Icons**: Brand-colored icons with visual feedback
- **Theme Integration**: Dark/light mode support
- **Real-time Validation**: Instant URL validation feedback

**Workflow**:
1. Paste social media URL
2. Platform auto-detected
3. URL validated
4. Link added with icon and label
5. Manage up to 3 links

**Dependencies**: socialPlatforms utility, profileStore

**Usage**: Account settings page

## Dashboard Components

### 1. Battle Animation (`components/BattleAnimation.vue`)
**Purpose**: Core battle interface and logic
**Key Features**:
- **Genre Selection**: Dropdown for battle genre selection
- **Song Fetching**: Retrieves random songs for battle
- **Audio Management**: Dynamic audio element creation/destruction with 30-second clips
- **Voting Interface**: Interactive voting with visual feedback
- **Roulette Animation**: Engaging battle start sequence
- **Results Display**: Battle outcome presentation
- **Tagged Songs Integration**: Visual feedback for tagged songs
- **30-Second Clips**: Uses user-chosen clip start time for consistent playback

**State Management**:
- Manages battle state and progression
- Handles audio playback and cleanup with proper timeout management
- Integrates with song and profile stores
- **Timeout Management**: Proper 30-second timeout handling with cleanup

**User Interactions**:
- Genre selection and battle initiation
- Song voting and comparison
- Audio playback control with timeout reset on pause/restart
- Tagged song management

**Audio Timeout Management** (Recently Enhanced):
- **Timeout Storage**: Tracks active timeouts to prevent accumulation
- **Proper Cleanup**: Clears timeouts when pausing, stopping, or switching songs
- **Memory Management**: Prevents memory leaks from orphaned timeouts
- **Spam-Click Protection**: Handles rapid play/pause clicks gracefully

### 2. Song Uploader (`components/dashboard/songUploader.vue`)
**Purpose**: File upload interface for artists
**Key Features**:
- **Drag & Drop**: File drag-and-drop interface
- **File Validation**: Format and size validation
- **Audio Conversion**: MP3 conversion with LameJS
- **Progress Tracking**: Upload progress indication
- **Metadata Extraction**: Automatic title and artist detection
- **Genre Selection**: Song categorization
- **Preview Functionality**: Audio preview before upload

**File Processing**:
- Supports MP3, WAV, M4A formats
- Automatic MP3 conversion
- File size optimization
- Metadata extraction

**User Interactions**:
- File selection and validation
- Metadata editing
- Upload progress monitoring
- Error handling and retry

### 3. Song List (`components/dashboard/songList.vue`)
**Purpose**: Comprehensive song management interface
**Key Features**:
- **Tab Navigation**: Active songs and trash tabs
- **Song Display**: Grid/list view of songs
- **Audio Playback**: Inline audio player
- **Song Actions**: Play, edit, delete, restore operations
- **Bulk Operations**: Multi-select functionality
- **Search & Filter**: Song filtering and search
- **Pagination**: Large dataset handling

**Tab Functionality**:
- **Active Songs**: Currently active songs
- **Trash**: Soft-deleted songs with restore option
- **Song Details**: Expanded song information
- **Action Buttons**: Context-sensitive actions

**User Interactions**:
- Song playback and management
- Soft delete and restore
- Bulk operations
- Search and filtering


## Admin Components

### 1. Audit Log Feed (`components/admin/AuditLogFeed.vue`)
**Purpose**: System activity monitoring interface
**Key Features**:
- **Log Display**: Comprehensive audit log feed
- **Filtering**: Date and action type filtering
- **Pagination**: Infinite scroll implementation
- **Search**: Log entry search functionality
- **Export**: Log data export capabilities
- **Real-time Updates**: Live log updates

**Filtering Options**:
- Date range selection
- Action type filtering
- User-specific logs
- System event filtering

### 2. System Metrics (`components/admin/SystemMetrics.vue`)
**Purpose**: Real-time system statistics dashboard
**Key Features**:
- **Core Metrics**: Songs, users, battles statistics
- **Audit Metrics**: Activity-based statistics
- **Genre Metrics**: Song distribution by genre
- **Battle Metrics**: Battle activity statistics
- **Timezone Support**: Dynamic timezone selection
- **Real-time Updates**: Live metric updates

**Metric Categories**:
- **System Stats**: Total songs, users, battles
- **Activity Stats**: Daily/weekly activity
- **Content Stats**: Genre distribution, uploads
- **Performance Stats**: System performance metrics

## Authentication Components

### 1. Sign In Form (`components/signIn/signInForm.vue`)
**Purpose**: User authentication form
**Features**:
- Email/password input
- OAuth integration
- Form validation
- Error handling

### 2. Registration Form (`components/registration/registrationForm.vue`)
**Purpose**: New user registration form
**Features**:
- Account creation fields
- Password validation
- Terms acceptance
- Email verification

### 3. Password Reset Form (`components/resetPassword/passwordResetForm.vue`)
**Purpose**: Password reset interface
**Features**:
- New password input
- Confirmation field
- Strength validation
- Success feedback

### 4. Password Reset Email Form (`components/resetPasswordEmail/passwordResetFormEmail.vue`)
**Purpose**: Password reset email request
**Features**:
- Email input
- Send confirmation
- Instructions display
- Error handling

## Golden Ears Components

### 1. Golden Ears Progress (`components/goldenEars/GoldenEarsProgress.vue`)
**Purpose**: Golden Ears award progress display
**Key Features**:
- **Progress Bar**: Visual progress indication
- **Accuracy Score**: Current accuracy percentage
- **Qualification Status**: Award eligibility display
- **Week Information**: Current week details
- **Achievement Tracking**: Progress milestones

### 2. Golden Ears History (`components/goldenEars/GoldenEarsHistory.vue`)
**Purpose**: Golden Ears award history
**Key Features**:
- **Award History**: Past awards display
- **Achievement Timeline**: Chronological awards
- **Statistics**: Award statistics and trends
- **Badge Display**: Visual award representation

## Utility Components

### 1. Account Deletion Modal (`components/AccountDeletionModal.vue`)
**Purpose**: Account deletion confirmation
**Features**:
- Warning display
- Confirmation steps
- Data deletion information
- Final confirmation

### 2. Auth Debug (`components/AuthDebug.vue`)
**Purpose**: Development authentication debugging
**Features**:
- User state display
- Token information
- Debug controls
- Development tools

## Component Patterns

### 1. Composition API
- **`<script setup>`**: Modern Vue.js syntax
- **Reactive State**: `ref()` and `reactive()`
- **Computed Properties**: `computed()`
- **Lifecycle Hooks**: `onMounted()`, `onUnmounted()`

### 2. Props and Events
- **Props**: Type-safe component props
- **Events**: Custom event emission
- **Slots**: Content projection
- **Provide/Inject**: Dependency injection

### 3. State Management
- **Pinia Stores**: Global state management
- **Local State**: Component-specific state
- **Composables**: Reusable logic
- **Watchers**: Reactive state watching

### 4. Styling Patterns
- **Tailwind CSS**: Utility-first styling
- **Scoped Styles**: Component-specific styles
- **CSS Variables**: Theme customization
- **Responsive Design**: Mobile-first approach

## Performance Considerations

### 1. Component Optimization
- **Lazy Loading**: Dynamic imports
- **Memoization**: Computed property caching
- **Virtual Scrolling**: Large list optimization
- **Event Cleanup**: Proper event listener cleanup

### 2. Audio Management
- **Dynamic Creation**: Audio elements created as needed
- **Memory Cleanup**: Proper audio element disposal
- **Mobile Optimization**: Reduced preloading on mobile
- **Error Handling**: Graceful audio failure handling

### 3. State Management
- **Store Composition**: Efficient store organization
- **Reactive Updates**: Minimal re-renders
- **Memory Management**: Proper cleanup
- **Error Boundaries**: Component error handling

## Accessibility Features

### 1. ARIA Support
- **ARIA Labels**: Screen reader support
- **Role Attributes**: Semantic roles
- **State Management**: ARIA state attributes
- **Focus Management**: Keyboard navigation

### 2. Keyboard Navigation
- **Tab Order**: Logical tab sequence
- **Keyboard Shortcuts**: Power user features
- **Focus Indicators**: Visual focus feedback
- **Escape Handling**: Modal and overlay management

### 3. Screen Reader Support
- **Semantic HTML**: Proper HTML structure
- **Alt Text**: Image descriptions
- **Live Regions**: Dynamic content announcements
- **Skip Links**: Navigation shortcuts

This comprehensive component documentation provides developers with a complete understanding of the SongWars frontend component architecture, enabling effective development, maintenance, and enhancement of the application.
