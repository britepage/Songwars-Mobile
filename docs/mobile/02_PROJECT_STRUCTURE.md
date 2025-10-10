# 02: Project Structure - SongWars Mobile App

## Overview
This guide provides a detailed explanation of the mobile app's file structure, organization principles, and how it differs from the Nuxt 3 web application structure.

## Complete Project Structure

```
songwars-mobile/
├── android/                          # Android native project
│   ├── app/
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── AndroidManifest.xml
│   │   │       ├── java/com/songwars/mobile/
│   │   │       │   └── MainActivity.java
│   │   │       └── res/              # Android resources
│   │   │           ├── drawable/      # Icons and images
│   │   │           ├── mipmap/        # App icons
│   │   │           ├── values/        # Strings, colors, styles
│   │   │           └── xml/           # XML configs
│   │   └── build.gradle
│   ├── gradle/
│   └── build.gradle
│
├── ios/                              # iOS native project
│   ├── App/
│   │   ├── App/
│   │   │   ├── AppDelegate.swift
│   │   │   ├── Info.plist
│   │   │   ├── Assets.xcassets/       # iOS assets
│   │   │   │   ├── AppIcon.appiconset/
│   │   │   │   └── Splash.imageset/
│   │   │   └── config.xml
│   │   ├── Podfile
│   │   └── App.xcodeproj/
│   └── App.xcworkspace/
│
├── public/                           # Static files (served as-is)
│   ├── favicon.ico
│   └── manifest.json
│
├── src/                              # Main source code
│   ├── assets/                       # Static assets (processed by Vite)
│   │   ├── images/                   # Images and SVGs
│   │   │   ├── tapey.svg
│   │   │   ├── wheel.png
│   │   │   ├── arrow.svg
│   │   │   ├── tapebg.svg
│   │   │   └── tapegear.svg
│   │   ├── sounds/                   # Audio files
│   │   │   ├── roulette.wav
│   │   │   └── battle-complete.wav
│   │   └── styles/                   # Global styles
│   │       └── global.css
│   │
│   ├── components/                   # Vue components (21 total)
│   │   ├── core/                     # Core components (8)
│   │   │   ├── FooterNavigation.vue
│   │   │   ├── TapePlayer.vue
│   │   │   ├── WaveformSelectorDual.vue
│   │   │   ├── HamburgerMenu.vue
│   │   │   ├── ConversionCTA.vue
│   │   │   ├── TrialCounter.vue
│   │   │   ├── SocialLinksDisplay.vue
│   │   │   └── SocialLinksManager.vue
│   │   ├── dashboard/                # Dashboard components (2)
│   │   │   ├── BattleAnimation.vue
│   │   │   ├── SongUploader.vue
│   │   │   └── SongList.vue
│   │   ├── admin/                    # Admin components (2)
│   │   │   ├── AuditLogFeed.vue
│   │   │   └── SystemMetrics.vue
│   │   ├── auth/                     # Auth components (4)
│   │   │   ├── SignInForm.vue
│   │   │   ├── RegistrationForm.vue
│   │   │   ├── PasswordResetForm.vue
│   │   │   └── PasswordResetEmailForm.vue
│   │   ├── goldenEars/               # Golden Ears components (2)
│   │   │   ├── GoldenEarsProgress.vue
│   │   │   └── GoldenEarsHistory.vue
│   │   └── utility/                  # Utility components (3)
│   │       ├── AccountDeletionModal.vue
│   │       ├── AuthDebug.vue
│   │       └── LoadingSpinner.vue
│   │
│   ├── composables/                  # Vue composables (10)
│   │   ├── useAudioContext.ts        # Web Audio API context
│   │   ├── useAudioElements.ts       # Audio element lifecycle
│   │   ├── useAudioPlayer.ts         # Audio playback controls
│   │   ├── useAudioProgress.ts       # Playback progress tracking
│   │   ├── useAudioTimeouts.ts       # 30-second timeout management
│   │   ├── useBattleAudio.ts         # Battle-specific audio
│   │   ├── useTaggedSongs.ts         # Tagged songs functionality
│   │   ├── useSupabaseService.ts     # Supabase client wrapper
│   │   ├── useOAuthSignIn.ts         # OAuth authentication
│   │   └── useMobileDetection.ts     # Device/platform detection
│   │
│   ├── guards/                       # Route guards
│   │   ├── auth.guard.ts             # Authentication guard
│   │   ├── admin.guard.ts            # Admin access guard
│   │   └── trial.guard.ts            # Trial mode guard
│   │
│   ├── router/                       # Vue Router configuration
│   │   ├── index.ts                  # Main router config
│   │   └── routes.ts                 # Route definitions
│   │
│   ├── services/                     # Service layer
│   │   ├── supabase.service.ts       # Supabase service
│   │   ├── storage.service.ts        # Capacitor Storage service
│   │   ├── notification.service.ts   # Push notification service
│   │   ├── camera.service.ts         # Camera service
│   │   └── auth.service.ts           # Authentication service
│   │
│   ├── stores/                       # Pinia stores (8)
│   │   ├── authStore.ts              # Authentication state
│   │   ├── songStore.ts              # Song data and churn
│   │   ├── profileStore.ts           # User profiles
│   │   ├── songComparisonStore.ts    # Battle state
│   │   ├── leaderboardStore.ts       # Leaderboard data
│   │   ├── goldenEarsStore.ts        # Golden Ears awards
│   │   ├── uploadStore.ts            # File upload state
│   │   └── themeStore.ts             # Theme management
│   │
│   ├── theme/                        # Ionic theming
│   │   ├── variables.css             # CSS variables
│   │   ├── dark.css                  # Dark theme
│   │   └── light.css                 # Light theme
│   │
│   ├── types/                        # TypeScript types (3)
│   │   ├── song.ts                   # Song interfaces
│   │   ├── supabase.ts               # Supabase types
│   │   ├── env.d.ts                  # Environment variables
│   │   └── vue.d.ts                  # Vue component types
│   │
│   ├── utils/                        # Utility functions (5)
│   │   ├── audioConverterWebAudio.ts # Audio conversion
│   │   ├── genres.ts                 # Genre definitions
│   │   ├── socialPlatforms.ts        # Social media platforms
│   │   ├── titleExtractor.ts         # Title extraction
│   │   └── trialManager.ts           # Trial system management
│   │
│   ├── views/                        # Page components (12)
│   │   ├── auth/                     # Authentication pages
│   │   │   ├── SignInPage.vue
│   │   │   ├── RegistrationPage.vue
│   │   │   ├── ResetPasswordPage.vue
│   │   │   └── ResetPasswordEmailPage.vue
│   │   ├── main/                     # Main app pages
│   │   │   ├── DashboardPage.vue
│   │   │   ├── MySongsPage.vue
│   │   │   ├── LeaderboardPage.vue
│   │   │   ├── AccountPage.vue
│   │   │   ├── UserProfilePage.vue
│   │   │   ├── PreviewPage.vue
│   │   │   └── IndexPage.vue
│   │   └── admin/                    # Admin pages
│   │       └── FlagsPage.vue
│   │
│   ├── App.vue                       # Root component
│   └── main.ts                       # App entry point
│
├── .env                              # Environment variables (gitignored)
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore rules
├── capacitor.config.ts               # Capacitor configuration
├── index.html                        # HTML entry point
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript config
├── tsconfig.node.json                # TypeScript Node config
├── vite.config.ts                    # Vite bundler config
└── README.md                         # Project readme
```

## Key Differences from Nuxt 3 Structure

### 1. No `pages/` Directory
- **Nuxt 3**: Uses `pages/` for file-based routing
- **Ionic**: Uses `views/` with manual route configuration in `router/index.ts`

### 2. No `middleware/` Directory
- **Nuxt 3**: Uses `middleware/` for route middleware
- **Ionic**: Uses `guards/` for Vue Router navigation guards

### 3. Native Platform Directories
- **Ionic**: Includes `android/` and `ios/` directories for native code
- **Nuxt 3**: Web-only, no native platform directories

### 4. Different Config Files
- **Nuxt 3**: `nuxt.config.ts`
- **Ionic**: `vite.config.ts` + `capacitor.config.ts`

### 5. Service Layer
- **Ionic**: Explicit `services/` directory for platform-specific services
- **Nuxt 3**: Uses `composables/` and server routes

## Component Organization Principles

### 1. Feature-Based Grouping
Components are grouped by feature area, not by type:

```
components/
├── core/           # Used across multiple features
├── dashboard/      # Specific to dashboard
├── admin/          # Specific to admin panel
├── auth/           # Specific to authentication
├── goldenEars/     # Specific to Golden Ears system
└── utility/        # Small utility components
```

### 2. Naming Conventions

- **Components**: PascalCase with descriptive names
  - `BattleAnimation.vue` (not `Battle.vue`)
  - `SongUploader.vue` (not `Uploader.vue`)

- **Views**: PascalCase with "Page" suffix
  - `DashboardPage.vue`
  - `SignInPage.vue`

- **Stores**: camelCase with "Store" suffix
  - `authStore.ts`
  - `songStore.ts`

- **Composables**: camelCase with "use" prefix
  - `useAudioPlayer.ts`
  - `useSupabaseService.ts`

- **Utils**: camelCase descriptive names
  - `audioConverterWebAudio.ts`
  - `titleExtractor.ts`

### 3. Barrel Exports

Each major directory should have an `index.ts` for clean imports:

**Example: `src/components/core/index.ts`**

```typescript
export { default as FooterNavigation } from './FooterNavigation.vue'
export { default as TapePlayer } from './TapePlayer.vue'
export { default as WaveformSelectorDual } from './WaveformSelectorDual.vue'
export { default as HamburgerMenu } from './HamburgerMenu.vue'
export { default as ConversionCTA } from './ConversionCTA.vue'
export { default as TrialCounter } from './TrialCounter.vue'
export { default as SocialLinksDisplay } from './SocialLinksDisplay.vue'
export { default as SocialLinksManager } from './SocialLinksManager.vue'
```

**Usage:**

```typescript
import { FooterNavigation, TapePlayer } from '@/components/core'
```

## File Size Guidelines

### Components
- **Small**: < 200 lines (simple presentational components)
- **Medium**: 200-500 lines (components with logic)
- **Large**: 500-1000 lines (complex feature components)
- **Too Large**: > 1000 lines (should be split into sub-components)

### Views
- **Ideal**: < 300 lines (mostly layout with imported components)
- **Maximum**: 500 lines (if absolutely necessary)

### Stores
- **Ideal**: < 300 lines per store
- **Maximum**: 500 lines (split into multiple stores if needed)

## Asset Organization

### Images

```
src/assets/images/
├── logos/              # App logos
│   ├── tapey.svg
│   └── tapey-white.svg
├── icons/              # Custom icons
│   ├── wheel.png
│   └── arrow.svg
├── backgrounds/        # Background images
│   ├── tapebg.svg
│   └── tapebgA.svg
└── illustrations/      # Decorative illustrations
    └── tapegear.svg
```

### Sounds

```
src/assets/sounds/
├── effects/            # Sound effects
│   ├── roulette.wav
│   └── battle-complete.wav
└── music/              # Background music (if needed)
```

### Styles

```
src/assets/styles/
├── global.css          # Global styles
├── animations.css      # CSS animations
└── utilities.css       # Utility classes
```

## Platform-Specific Code Organization

### Android Resources

```
android/app/src/main/res/
├── drawable/           # Images (all densities)
│   ├── splash.png
│   └── ic_launcher.png
├── drawable-hdpi/      # High density
├── drawable-mdpi/      # Medium density
├── drawable-xhdpi/     # Extra high density
├── drawable-xxhdpi/    # Extra extra high density
├── drawable-xxxhdpi/   # Extra extra extra high density
├── mipmap/             # App icons (all densities)
├── values/             # Configuration values
│   ├── strings.xml     # App strings
│   ├── colors.xml      # Theme colors
│   └── styles.xml      # App styles
└── xml/                # XML configs
    └── file_paths.xml  # File provider paths
```

### iOS Resources

```
ios/App/App/Assets.xcassets/
├── AppIcon.appiconset/     # App icons (all sizes)
│   ├── Contents.json
│   ├── icon-20@2x.png
│   ├── icon-20@3x.png
│   ├── icon-29@2x.png
│   └── ... (more sizes)
├── Splash.imageset/        # Splash screen
│   ├── Contents.json
│   ├── splash.png
│   ├── splash@2x.png
│   └── splash@3x.png
└── Contents.json
```

## Configuration Files Explained

### `capacitor.config.ts`
Platform configuration, plugin settings, native features

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.songwars.mobile',
  appName: 'SongWars',
  webDir: 'dist',
  // Platform-specific settings
  server: { /* ... */ },
  plugins: { /* ... */ }
};

export default config;
```

### `vite.config.ts`
Build tool configuration, aliases, optimizations

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { /* ... */ } },
  build: { /* ... */ }
})
```

### `tsconfig.json`
TypeScript compiler options, path aliases

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "baseUrl": ".",
    "paths": { /* ... */ }
  }
}
```

## Path Aliases Configuration

### TypeScript Path Mapping

In `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/views/*": ["src/views/*"],
      "@/stores/*": ["src/stores/*"],
      "@/composables/*": ["src/composables/*"],
      "@/utils/*": ["src/utils/*"],
      "@/types/*": ["src/types/*"],
      "@/services/*": ["src/services/*"],
      "@/assets/*": ["src/assets/*"]
    }
  }
}
```

### Vite Path Mapping

In `vite.config.ts`:

```typescript
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/views': path.resolve(__dirname, './src/views'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/composables': path.resolve(__dirname, './src/composables'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/assets': path.resolve(__dirname, './src/assets'),
    },
  },
})
```

### Usage Examples

```typescript
// Instead of: import Foo from '../../../components/core/Foo.vue'
import Foo from '@/components/core/Foo.vue'

// Instead of: import { useAuthStore } from '../stores/authStore'
import { useAuthStore } from '@/stores/authStore'

// Instead of: import logo from '../../assets/images/tapey.svg'
import logo from '@/assets/images/tapey.svg'
```

## Code Organization Best Practices

### 1. Single Responsibility Principle
Each file should have one clear purpose:

```
✅ Good:
- authStore.ts (handles all auth state)
- audioPlayer.ts (handles audio playback)

❌ Bad:
- utils.ts (contains random unrelated functions)
- helpers.ts (too generic)
```

### 2. Logical Grouping
Related files should be in the same directory:

```
✅ Good:
components/goldenEars/
  ├── GoldenEarsProgress.vue
  └── GoldenEarsHistory.vue

❌ Bad:
components/
  ├── GoldenEarsProgress.vue
  ├── SongUploader.vue
  └── GoldenEarsHistory.vue
```

### 3. Clear Dependencies
Import paths should reflect logical relationships:

```
✅ Good:
views/ imports from components/
components/ imports from composables/
composables/ imports from services/

❌ Bad:
Circular dependencies
services/ importing from views/
```

## Environment-Specific Organization

### Development vs Production

```
.env                    # Shared defaults
.env.development       # Development overrides
.env.production        # Production overrides
.env.local             # Local developer overrides (gitignored)
```

### Platform-Specific Code

Use guards for platform-specific logic:

```typescript
import { Capacitor } from '@capacitor/core'

if (Capacitor.isNativePlatform()) {
  // Native iOS/Android code
  if (Capacitor.getPlatform() === 'ios') {
    // iOS-specific code
  } else if (Capacitor.getPlatform() === 'android') {
    // Android-specific code
  }
} else {
  // Web fallback
}
```

## Next Steps

Now that you understand the project structure, proceed to:

**[03_CAPACITOR_CONFIGURATION.md](03_CAPACITOR_CONFIGURATION.md)** - Configure native platform features

---

**Document Status**: ✅ Complete  
**Next Guide**: [03_CAPACITOR_CONFIGURATION.md](03_CAPACITOR_CONFIGURATION.md)  
**Estimated Reading Time**: 20-30 minutes


