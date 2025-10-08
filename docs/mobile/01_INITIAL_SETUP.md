# 01: Initial Setup - SongWars Mobile App

## Overview
This guide provides step-by-step instructions to initialize an Ionic Vue 3 project for the SongWars mobile application. By the end of this guide, you'll have a fully configured Ionic project ready for component conversion.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js 18.x or higher installed
- [ ] npm 9.x or higher installed
- [ ] Git installed and configured
- [ ] Code editor (VS Code recommended)
- [ ] Terminal/command line access
- [ ] macOS (for iOS development) or Windows/Linux (Android development)

### Verify Installations

```bash
# Check Node.js version (should be 18.x or higher)
node --version

# Check npm version (should be 9.x or higher)
npm --version

# Check Git version
git --version
```

## Step 1: Install Ionic CLI

Install the Ionic CLI globally:

```bash
npm install -g @ionic/cli
```

Verify installation:

```bash
ionic --version
# Should show: 7.x or higher
```

## Step 2: Create New Ionic Vue Project

### Option A: Create from Scratch (Recommended)

Create a new Ionic Vue 3 project with TypeScript:

```bash
# Navigate to your projects folder
cd ~/Desktop/Project-Folders

# Create new Ionic Vue project with TypeScript
ionic start songwars-mobile blank --type=vue --capacitor

# When prompted, choose:
# - Framework: Vue
# - Template: blank (we'll build from scratch)
# - Capacitor: Yes
# - TypeScript: Yes (should be default for Vue)
```

### Project Creation Prompts

You'll be asked several questions:

```
? Framework: Vue
? Starter template: blank
? Capacitor: Yes
? Create free Ionic account? No (optional)
```

### Navigate into Project

```bash
cd songwars-mobile
```

## Step 3: Update Package Dependencies

Replace the default `package.json` dependencies with SongWars-specific versions:

```bash
# Remove the existing package.json dependencies section
# We'll install specific versions matching the web app
```

Edit `package.json` and update the `dependencies` section:

```json
{
  "name": "songwars-mobile",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "test:e2e": "cypress run",
    "test:unit": "vitest",
    "lint": "eslint"
  },
  "dependencies": {
    "@capacitor/android": "^6.1.0",
    "@capacitor/app": "^6.0.0",
    "@capacitor/camera": "^6.0.0",
    "@capacitor/core": "^6.1.0",
    "@capacitor/filesystem": "^6.0.0",
    "@capacitor/haptics": "^6.0.0",
    "@capacitor/ios": "^6.1.0",
    "@capacitor/keyboard": "^6.0.0",
    "@capacitor/local-notifications": "^6.0.0",
    "@capacitor/push-notifications": "^6.0.0",
    "@capacitor/splash-screen": "^6.0.0",
    "@capacitor/status-bar": "^6.0.0",
    "@capacitor/storage": "^1.2.5",
    "@ionic/vue": "^8.0.0",
    "@ionic/vue-router": "^8.0.0",
    "@pinia/nuxt": "^0.11.1",
    "@supabase/supabase-js": "^2.50.0",
    "canvas-confetti": "^1.9.3",
    "dotenv": "^16.5.0",
    "lamejs-fixed": "^1.2.2",
    "pinia": "^3.0.3",
    "uuid": "^11.1.0",
    "vue": "^3.5.13",
    "vue-router": "^4.5.1",
    "wavesurfer.js": "^7.9.9",
    "ionicons": "^7.2.2"
  },
  "devDependencies": {
    "@capacitor/cli": "^6.1.0",
    "@types/canvas-confetti": "^1.9.0",
    "@types/uuid": "^9.0.7",
    "@vitejs/plugin-vue": "^5.0.0",
    "@vue/test-utils": "^2.4.0",
    "cypress": "^13.6.0",
    "eslint": "^8.57.0",
    "eslint-plugin-vue": "^9.20.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "vue-tsc": "^1.8.27"
  }
}
```

Install all dependencies:

```bash
npm install
```

## Step 4: Install Capacitor Plugins

Install all required Capacitor plugins for native functionality:

```bash
# Core Capacitor plugins
npm install @capacitor/core @capacitor/cli

# Device features
npm install @capacitor/camera
npm install @capacitor/filesystem
npm install @capacitor/haptics
npm install @capacitor/keyboard
npm install @capacitor/status-bar
npm install @capacitor/splash-screen

# Storage and notifications
npm install @capacitor/storage
npm install @capacitor/local-notifications
npm install @capacitor/push-notifications

# Platform-specific
npm install @capacitor/app
npm install @capacitor/android
npm install @capacitor/ios
```

## Step 5: Initialize Capacitor

Initialize Capacitor for iOS and Android:

```bash
# Initialize Capacitor with app information
npx cap init songwars-mobile com.songwars.mobile --web-dir=dist

# Add iOS platform
npx cap add ios

# Add Android platform
npx cap add android
```

### Understanding Capacitor Init Parameters

- `songwars-mobile`: App name
- `com.songwars.mobile`: Bundle ID (reverse domain notation)
- `--web-dir=dist`: Build output directory

## Step 6: Configure Capacitor

Edit `capacitor.config.ts` in the project root:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.songwars.mobile',
  appName: 'SongWars',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // For development, you can use:
    // url: 'http://localhost:5173',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffd200',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#000000',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#ffd200',
      sound: 'beep.wav',
    },
  },
};

export default config;
```

## Step 7: Project Structure Setup

Create the initial folder structure:

```bash
# Create main directories
mkdir -p src/components/{core,dashboard,admin,auth,goldenEars,utility}
mkdir -p src/views/{auth,main,admin}
mkdir -p src/stores
mkdir -p src/composables
mkdir -p src/utils
mkdir -p src/types
mkdir -p src/services
mkdir -p src/assets/{images,sounds,styles}
mkdir -p src/theme
```

### Directory Structure Explanation

```
src/
├── components/          # All Vue components
│   ├── core/           # Core components (8)
│   ├── dashboard/      # Dashboard components (2)
│   ├── admin/          # Admin components (2)
│   ├── auth/           # Auth components (4)
│   ├── goldenEars/     # Golden Ears components (2)
│   └── utility/        # Utility components (3)
├── views/              # Page-level components (12 pages)
│   ├── auth/           # Authentication pages
│   ├── main/           # Main app pages
│   └── admin/          # Admin pages
├── stores/             # Pinia stores (8 stores)
├── composables/        # Vue composables (10)
├── utils/              # Utility functions (5)
├── types/              # TypeScript type definitions
├── services/           # Service layers (Supabase, etc.)
├── assets/             # Static assets
│   ├── images/         # Images and icons
│   ├── sounds/         # Audio files
│   └── styles/         # Global styles
├── theme/              # Ionic theming
└── router/             # Vue Router configuration
```

## Step 8: Configure TypeScript

Create or update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "types": ["vite/client", "@types/node"],

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    /* Path aliases */
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
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json` for Node-specific types:

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "types": ["node"]
  },
  "include": ["vite.config.ts", "capacitor.config.ts"]
}
```

## Step 9: Configure Vite

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
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
  optimizeDeps: {
    exclude: ['@ionic/vue', '@ionic/vue-router'],
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'ionic': ['@ionic/vue', '@ionic/vue-router'],
          'vue': ['vue', 'vue-router', 'pinia'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
})
```

## Step 10: Environment Variables Setup

Create `.env` file in project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
VITE_APP_NAME=SongWars
VITE_APP_VERSION=1.0.0

# Development
VITE_DEV_MODE=true
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_PUSH_NOTIFICATIONS=true
VITE_ENABLE_BIOMETRIC_AUTH=true
VITE_ENABLE_OFFLINE_MODE=true
```

Create `.env.example` (without sensitive data):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# App Configuration
VITE_APP_NAME=SongWars
VITE_APP_VERSION=1.0.0

# Development
VITE_DEV_MODE=true
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_PUSH_NOTIFICATIONS=true
VITE_ENABLE_BIOMETRIC_AUTH=true
VITE_ENABLE_OFFLINE_MODE=true
```

Add `.env` to `.gitignore`:

```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore
```

## Step 11: Create Type Definitions

Create `src/types/env.d.ts` for environment variable types:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_DEV_MODE: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_ENABLE_PUSH_NOTIFICATIONS: string
  readonly VITE_ENABLE_BIOMETRIC_AUTH: string
  readonly VITE_ENABLE_OFFLINE_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

Create `src/types/vue.d.ts` for Vue component types:

```typescript
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
```

## Step 12: Copy Assets from Web App

Copy assets from the original SongWars web app:

```bash
# Navigate to the web app directory (adjust path as needed)
cd ~/Desktop/Project-Folders/songwars

# Copy public assets
cp -r public/sounds ~/Desktop/Project-Folders/songwars-mobile/src/assets/sounds
cp public/tapey.svg ~/Desktop/Project-Folders/songwars-mobile/src/assets/images/
cp public/wheel.png ~/Desktop/Project-Folders/songwars-mobile/src/assets/images/
cp public/arrow.svg ~/Desktop/Project-Folders/songwars-mobile/src/assets/images/
cp public/tapebg.svg ~/Desktop/Project-Folders/songwars-mobile/src/assets/images/
cp public/tapegear.svg ~/Desktop/Project-Folders/songwars-mobile/src/assets/images/

# Return to mobile project
cd ~/Desktop/Project-Folders/songwars-mobile
```

## Step 13: Initialize Git Repository

Initialize version control:

```bash
# Initialize Git
git init

# Create .gitignore (if not exists)
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Environment
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
.output/
.nuxt/

# iOS
ios/App/Pods/
ios/App/App.xcworkspace
*.xcuserstate
DerivedData/

# Android
android/app/build/
android/.gradle/
*.apk
*.aab

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Capacitor
.capacitor/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
.nyc_output/

# Misc
.cache/
.temp/
EOF

# Initial commit
git add .
git commit -m "Initial commit: Ionic Vue 3 project setup for SongWars Mobile"
```

## Step 14: Create Basic App Entry Point

Update `src/main.ts`:

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'
import App from './App.vue'
import router from './router'

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

/* Theme variables */
import './theme/variables.css'

const app = createApp(App)
const pinia = createPinia()

app.use(IonicVue)
app.use(pinia)
app.use(router)

router.isReady().then(() => {
  app.mount('#app')
})
```

## Step 15: Create Basic Router

Create `src/router/index.ts`:

```typescript
import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/main/DashboardPage.vue')
  },
  // Additional routes will be added in later guides
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
```

## Step 16: Create Basic App Component

Update `src/App.vue`:

```vue
<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { onMounted } from 'vue'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'

onMounted(async () => {
  // Hide splash screen
  await SplashScreen.hide()
  
  // Configure status bar
  await StatusBar.setStyle({ style: Style.Dark })
  await StatusBar.setBackgroundColor({ color: '#000000' })
})
</script>

<style>
/* Global app styles will be added in theming guide */
</style>
```

## Step 17: Create Placeholder Dashboard Page

Create `src/views/main/DashboardPage.vue`:

```vue
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>SongWars</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <div class="container">
        <h1>SongWars Mobile</h1>
        <p>Setup complete! Ready for component conversion.</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/vue'
</script>

<style scoped>
.container {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}
</style>
```

## Step 18: Test the Setup

### Build the web version

```bash
npm run build
```

This should complete successfully with no errors.

### Run development server

```bash
npm run dev
```

Visit `http://localhost:5173` - you should see the placeholder dashboard.

### Sync with native platforms

```bash
# Sync with iOS
npx cap sync ios

# Sync with Android
npx cap sync android
```

### Open in native IDEs

```bash
# Open Xcode (macOS only)
npx cap open ios

# Open Android Studio
npx cap open android
```

## Step 19: Verify Platform-Specific Files

### iOS Files Created

Check that these files exist:

```
ios/
├── App/
│   ├── App/
│   │   ├── AppDelegate.swift
│   │   ├── Info.plist
│   │   └── Assets.xcassets/
│   ├── Podfile
│   └── App.xcodeproj/
```

### Android Files Created

Check that these files exist:

```
android/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/
│   │       └── res/
│   └── build.gradle
└── build.gradle
```

## Step 20: Install iOS Pods (macOS only)

If on macOS, install CocoaPods dependencies:

```bash
cd ios/App
pod install
cd ../..
```

## Verification Checklist

Before proceeding to the next guide, verify:

- [ ] Ionic project created successfully
- [ ] All npm dependencies installed
- [ ] Capacitor initialized for iOS and Android
- [ ] TypeScript configuration complete
- [ ] Environment variables configured
- [ ] Directory structure created
- [ ] Git repository initialized
- [ ] Development server runs without errors
- [ ] Build completes successfully
- [ ] Native platforms sync successfully
- [ ] iOS project opens in Xcode (if on macOS)
- [ ] Android project opens in Android Studio

## Troubleshooting

### Issue: npm install fails

**Solution**: Clear npm cache and retry

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue: Capacitor sync fails

**Solution**: Rebuild and sync

```bash
npm run build
npx cap sync
```

### Issue: TypeScript errors

**Solution**: Ensure TypeScript version matches

```bash
npm install -D typescript@^5.3.0
```

### Issue: Vite build errors

**Solution**: Check Vite config syntax and plugin compatibility

```bash
npm run build -- --debug
```

## Next Steps

Now that your Ionic project is initialized, proceed to:

**[02_PROJECT_STRUCTURE.md](02_PROJECT_STRUCTURE.md)** - Learn about the detailed project structure and organization

---

## Quick Reference Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview production build

# Capacitor
npx cap sync                   # Sync web code to native platforms
npx cap sync ios              # Sync iOS only
npx cap sync android          # Sync Android only
npx cap open ios              # Open Xcode
npx cap open android          # Open Android Studio
npx cap run ios              # Build and run on iOS
npx cap run android          # Build and run on Android

# Utilities
ionic serve                   # Alternative dev server
ionic build                   # Alternative build command
ionic cap sync               # Ionic CLI sync shortcut
```

---

**Document Status**: ✅ Complete  
**Next Guide**: [02_PROJECT_STRUCTURE.md](02_PROJECT_STRUCTURE.md)  
**Estimated Completion Time**: 2-3 hours

