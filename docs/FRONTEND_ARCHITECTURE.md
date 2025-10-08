# SongWars Frontend Architecture

## Overview
SongWars is built using **Nuxt.js 3** with **Vue.js 3** as the core framework, providing a modern, reactive, and performant frontend experience. The application follows a component-based architecture with centralized state management using **Pinia**.

## Technology Stack

### Core Framework
- **Nuxt.js 3.17.2** - Full-stack Vue.js framework with SSR/SSG capabilities
- **Vue.js 3.5.13** - Progressive JavaScript framework with Composition API
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server

### State Management
- **Pinia 3.0.3** - Modern state management for Vue.js
- **8 specialized stores** for different aspects of the application

### Styling & UI
- **Tailwind CSS 4.1.8** - Utility-first CSS framework
- **Custom retro-themed components** with SongWars branding
- **Responsive design** with mobile-first approach

### Backend Integration
- **Supabase 2.50.0** - Backend-as-a-Service integration
- **Real-time subscriptions** for live data updates
- **Authentication** with email/password and OAuth support

### Audio Processing
- **Web Audio API** - Advanced audio manipulation
- **Wavesurfer.js 7.9.9** - Audio visualization
- **LameJS** - MP3 encoding for file conversion

## Project Structure

```
songwars/
├── app.vue                 # Root application component
├── nuxt.config.ts         # Nuxt configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── pages/                 # File-based routing
│   ├── index.vue          # Landing page
│   ├── dashboard.vue      # Main battle interface
│   ├── my-songs.vue       # Song management
│   ├── account.vue        # User account settings
│   ├── user/[username].vue # Public user profiles
│   ├── admin/flags.vue    # Admin moderation
│   └── auth/              # Authentication pages
├── components/            # Reusable Vue components
│   ├── admin/             # Admin-specific components
│   ├── dashboard/         # Dashboard components
│   ├── goldenEars/        # Golden Ears system
│   └── [other components]
├── store/                 # Pinia state stores
│   ├── authStore.ts       # Authentication state
│   ├── songStore.ts       # Song management
│   ├── profileStore.ts    # User profiles
│   └── [other stores]
├── composables/           # Vue composables
│   └── useTaggedSongs.ts  # Tagged songs functionality
├── middleware/            # Route middleware
│   ├── auth.ts           # Authentication guard
│   └── admin.ts          # Admin access guard
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
├── assets/                # Static assets
└── public/                # Public static files
```

## Core Architecture Patterns

### 1. Component-Based Architecture
- **Atomic Design Principles**: Components are organized by complexity and reusability
- **Single Responsibility**: Each component has a focused purpose
- **Composition API**: Modern Vue.js patterns with `<script setup>`

### 2. State Management Strategy
- **Centralized Stores**: Pinia stores for global state
- **Reactive State**: Vue's reactivity system for automatic updates
- **Store Composition**: Multiple specialized stores working together

### 3. Routing & Navigation
- **File-Based Routing**: Nuxt.js automatic route generation
- **Middleware Protection**: Route-level authentication and authorization
- **Dynamic Routes**: Parameterized routes for user profiles

### 4. Data Flow Architecture
- **Unidirectional Data Flow**: Predictable state updates
- **Event-Driven Communication**: Component communication via events
- **Real-Time Updates**: Supabase subscriptions for live data

## Key Features

### 1. Authentication System
- **Multi-Provider Auth**: Email/password and OAuth (Google, Facebook)
- **Protected Routes**: Middleware-based route protection
- **Session Management**: Automatic token refresh and logout

### 2. Battle System
- **Real-Time Battles**: Live song comparisons
- **Audio Management**: Dynamic audio element creation/destruction
- **Voting Interface**: Interactive voting with visual feedback
- **Roulette Animation**: Engaging battle start sequence

### 3. Song Management
- **Upload System**: Drag-and-drop file upload with conversion
- **Soft Delete**: Trash system with expiration
- **Tagged Songs**: User bookmark system
- **Admin Moderation**: Flag review and content management

### 4. User Experience
- **Responsive Design**: Mobile-first responsive layout
- **Dark/Light Themes**: User preference-based theming
- **Loading States**: Comprehensive loading indicators
- **Error Handling**: User-friendly error messages

### 5. Admin Dashboard
- **Flag Review**: Content moderation interface
- **Audit Logs**: System activity tracking
- **Metrics Dashboard**: Real-time system statistics
- **User Management**: Admin user controls

## Performance Optimizations

### 1. Code Splitting
- **Route-Based Splitting**: Automatic code splitting by route
- **Component Lazy Loading**: Dynamic imports for heavy components
- **Bundle Optimization**: Vite-based build optimization

### 2. Caching Strategy
- **Browser Caching**: Static asset caching
- **API Caching**: Supabase query caching
- **State Persistence**: Local storage for user preferences

### 3. Audio Performance
- **Dynamic Audio Elements**: Create/destroy as needed
- **Mobile Optimization**: Reduced preloading on mobile
- **Memory Management**: Proper cleanup of audio resources

### 4. Image Optimization
- **Lazy Loading**: Images loaded on demand
- **Format Optimization**: WebP support with fallbacks
- **CDN Integration**: Supabase storage CDN

## Security Considerations

### 1. Authentication Security
- **JWT Tokens**: Secure token-based authentication
- **Route Protection**: Middleware-based access control
- **Session Management**: Secure session handling

### 2. Data Protection
- **Input Validation**: Client and server-side validation
- **XSS Prevention**: Sanitized user inputs
- **CSRF Protection**: Built-in CSRF protection

### 3. API Security
- **RLS Policies**: Row-level security in Supabase
- **Rate Limiting**: API rate limiting
- **Error Handling**: Secure error messages

## Development Workflow

### 1. Development Environment
- **Hot Module Replacement**: Instant updates during development
- **TypeScript Support**: Full type checking and IntelliSense
- **ESLint Integration**: Code quality and consistency

### 2. Build Process
- **Vite Build**: Fast production builds
- **Asset Optimization**: Automatic asset optimization
- **Environment Configuration**: Environment-specific builds

### 3. Testing Strategy
- **Component Testing**: Vue component testing
- **Integration Testing**: Store and composable testing
- **E2E Testing**: End-to-end user flow testing

## Browser Support

### 1. Modern Browsers
- **Chrome 90+**: Full feature support
- **Firefox 88+**: Full feature support
- **Safari 14+**: Full feature support
- **Edge 90+**: Full feature support

### 2. Mobile Support
- **iOS Safari 14+**: Mobile-optimized experience
- **Chrome Mobile 90+**: Full mobile support
- **Responsive Design**: Adaptive layouts for all screen sizes

## Route Middleware

**Total Middleware: 3** (Updated January 2025)

### 1. Authentication Middleware (`middleware/auth.ts`)
**Purpose**: Protect authenticated routes from unauthorized access
**Key Features**:
- **Session Check**: Verifies active user session
- **Redirect Logic**: Redirects to sign-in if not authenticated
- **Route Protection**: Applied to protected pages
- **Session Persistence**: Maintains authentication across page loads

**Protected Routes**:
- `/dashboard` - Main battle interface
- `/my-songs` - Song management
- `/account` - Account settings
- `/leaderboard` - Weekly rankings

**Implementation**:
```typescript
middleware: ['auth']
```

**Behavior**:
- Checks Supabase session state
- Redirects to `/sign-in` if no valid session
- Allows access if authenticated
- Preserves intended destination for post-login redirect

### 2. Admin Middleware (`middleware/admin.ts`)
**Purpose**: Restrict access to admin-only routes
**Key Features**:
- **Admin Verification**: Checks `admin_users` table membership
- **Role-Based Access**: Only allows verified admins
- **Cascade Protection**: Runs after auth middleware
- **Security Layer**: Additional security for sensitive pages

**Protected Routes**:
- `/admin/flags` - Content moderation dashboard

**Implementation**:
```typescript
middleware: ['auth', 'admin']
```

**Behavior**:
- First checks authentication (via auth middleware)
- Queries `admin_users` table for user ID
- Redirects to `/dashboard` if not admin
- Allows access only if user is verified admin

**Admin Management**: Admins are managed via Supabase SQL (see ADMIN_GUIDE.md)

### 3. Trial Middleware (`middleware/trial.ts`)
**Purpose**: Manage trial battle limits for unauthenticated users
**Key Features**:
- **Session Tracking**: Uses sessionStorage for trial state
- **Battle Limiting**: Enforces 5-battle maximum
- **Conversion Flow**: Redirects to preview page after limit
- **Public Access**: Applied to public battle routes

**Trial System**:
- **Maximum Battles**: 5 per session
- **Storage**: sessionStorage (resets on browser close)
- **Counter**: Real-time trial usage tracking
- **Redirect**: Automatic redirect when trials exhausted

**Protected Routes**:
- `/` (index) - Main entry point for trials

**Behavior**:
- Checks if user is authenticated (skip if yes)
- Tracks trial battles in sessionStorage
- Increments counter on each battle
- Redirects to `/preview` when 5 battles reached
- Shows conversion CTA to encourage sign-up

**Integration**: Works with `TrialCounter.vue` component and `trialManager` utility

## Utility Functions

**Total Utilities: 5** (Updated January 2025)

### 1. Audio Converter (`utils/audioConverterWebAudio.ts`)
**Purpose**: Convert uploaded audio files to MP3 format
**Key Features**:
- **Web Audio API**: Browser-based audio conversion
- **Format Support**: MP3, WAV, M4A, OGG input formats
- **MP3 Output**: Converts all formats to MP3 for consistency
- **Quality Control**: Configurable bitrate and quality settings

**Key Functions**:
- `convertToMp3(file)` - Convert audio file to MP3 format
- `decodeAudioData(arrayBuffer)` - Decode audio data
- `encodeToMp3(audioBuffer)` - Encode audio buffer to MP3

**Use Cases**:
- Song upload processing
- Format standardization
- File size optimization
- Cross-browser compatibility

**Integration**: Used by `songUploader.vue` component

### 2. Genres (`utils/genres.ts`)
**Purpose**: Genre definitions and management
**Key Features**:
- **Genre Constants**: Centralized genre list
- **Validation**: Genre validation functions
- **Labels**: Human-readable genre labels
- **Consistency**: Single source of truth for genres

**Key Exports**:
- `GENRES` - Array of all available genres
- `getGenreLabel(genreId)` - Get display label for genre
- `validateGenre(genre)` - Validate genre value
- `isValidGenre(genre)` - Check if genre exists

**Available Genres**:
Rock, Pop, Hip Hop, Electronic, Country, R&B, Jazz, Classical, Metal, Folk, Indie, Punk, Blues, Reggae, and more

**Use Cases**:
- Battle genre selection
- Song categorization
- Leaderboard filtering
- Genre-based querying

### 3. Social Platforms (`utils/socialPlatforms.ts`)
**Purpose**: Social media platform definitions and URL handling
**Key Features**:
- **Platform Detection**: Auto-detect platform from URL
- **Icon Management**: Platform-specific icons and colors
- **URL Validation**: Validate platform URLs
- **Label Generation**: Auto-generate labels from URLs

**Key Exports**:
- `PLATFORMS` - Array of supported platforms
- `getPlatformConfig(platform)` - Get platform icon and color
- `createSocialLink(url)` - Create social link from URL
- `validateSocialLink(url)` - Validate social media URL

**Supported Platforms**:
- Music: Spotify, Apple Music, SoundCloud, Bandcamp, YouTube Music
- Social: Instagram, Twitter/X, Facebook, TikTok
- Professional: LinkedIn
- Creator: Patreon, Twitch

**Platform Data**:
- Brand colors (hex codes)
- SVG icons
- URL patterns for detection
- Display labels

**Use Cases**:
- Social link management in profiles
- Platform auto-detection
- Icon and color styling
- URL validation

### 4. Title Extractor (`utils/titleExtractor.ts`)
**Purpose**: Extract song titles from filenames intelligently
**Key Features**:
- **Smart Extraction**: Remove file extensions and clean up
- **Artist Detection**: Separate artist from title if present
- **Special Character Handling**: Clean up underscores, hyphens
- **Fallback Logic**: Graceful handling of edge cases

**Key Functions**:
- `extractTitle(filename)` - Extract song title from filename
- `cleanFilename(filename)` - Remove extensions and clean up
- `separateArtistAndTitle(filename)` - Split artist and title

**Extraction Rules**:
- Removes file extensions (.mp3, .wav, etc.)
- Converts underscores/hyphens to spaces
- Handles "Artist - Title" format
- Trims whitespace
- Handles numbered prefixes

**Use Cases**:
- Song upload form pre-filling
- Automatic metadata generation
- User experience improvement
- Filename parsing

### 5. Trial Manager (`utils/trialManager.ts`)
**Purpose**: Manage trial battle system state
**Key Features**:
- **SessionStorage**: Persistent within browser session
- **Battle Counting**: Track battles used
- **Expiration**: Resets on browser close
- **State Management**: Get/set/increment trial state

**Key Functions**:
- `initTrial()` - Initialize trial state
- `getTrialsUsed()` - Get current trial count
- `getTrialsRemaining()` - Calculate remaining trials
- `incrementTrialBattles()` - Increment battle count
- `isTrialExpired()` - Check if trials exhausted
- `canPlayTrial()` - Check if user can still battle
- `resetTrial()` - Reset trial state (for testing)

**Trial Configuration**:
- **Max Battles**: 5 per session
- **Storage Key**: `songwars_trial_battles`
- **Reset Behavior**: Automatic on browser/tab close
- **Persistence**: SessionStorage only

**Use Cases**:
- Trial middleware logic
- TrialCounter component
- Preview page state
- Conversion flow management

**Integration**: Works with trial middleware and TrialCounter component

## Type Definitions

**Total Type Files: 3** (Updated January 2025)

### 1. Song Types (`types/song.ts`)
**Purpose**: TypeScript types for song-related data structures
**Key Types**:
- `Song` - Complete song object with all properties
- `SongMetadata` - Song metadata (title, artist, genre, etc.)
- `BattleResult` - Battle outcome data
- `TaggedSong` - Song with tagging information
- `SongStatus` - Song status enum (live, under_review, removed)

**Song Interface**:
- `id` - UUID
- `title` - Song title
- `artist_name` - Artist name
- `genre` - Genre string
- `url` - Storage URL
- `clip_start_time` - 30-second clip start (seconds)
- `wilson_score` - Ranking score
- `created_at` - Upload timestamp
- `status` - Moderation status
- And more...

**Use Cases**:
- Type-safe song operations
- Component prop typing
- Store state typing
- API response typing

### 2. Supabase Types (`types/supabase.ts`)
**Purpose**: Auto-generated Supabase database types
**Generation**: Generated via Supabase CLI from database schema
**Key Types**:
- **Database Tables**: Type definitions for all tables
- **RPC Functions**: Type definitions for database functions
- **Enums**: Type definitions for database enums
- **Relationships**: Foreign key relationships

**Important Tables**:
- `profiles` - User profiles
- `songs` - Song data
- `battles` - Battle records
- `golden_ears` - Award data
- `user_tags` - Song tagging

**Update Process**:
```bash
supabase gen types typescript --project-id [id] > types/supabase.ts
```

**Use Cases**:
- Database query typing
- RPC function call typing
- Consistent database schema
- Type-safe Supabase operations

### 3. LameJS Types (`types/lamejs-fixed.d.ts`)
**Purpose**: Type definitions for LameJS MP3 encoder library
**Key Classes**:
- `Mp3Encoder` - Main encoder class
- Encoding configuration options
- Audio buffer types
- Output buffer handling

**Use Cases**:
- Audio conversion typing
- MP3 encoding operations
- TypeScript compilation
- Library integration

**Note**: This is a custom type definition file for the LameJS library which doesn't have official types

## Future Enhancements

### 1. Performance Improvements
- **Service Worker**: Offline functionality
- **PWA Support**: Progressive Web App features
- **Advanced Caching**: More sophisticated caching strategies

### 2. User Experience
- **Accessibility**: Enhanced accessibility features
- **Internationalization**: Multi-language support
- **Advanced Animations**: More engaging animations

### 3. Technical Upgrades
- **Vue 3.4+**: Latest Vue.js features
- **Nuxt 3.8+**: Latest Nuxt.js capabilities
- **TypeScript 5+**: Enhanced type safety

This architecture provides a solid foundation for the SongWars application, ensuring scalability, maintainability, and excellent user experience across all devices and platforms.
