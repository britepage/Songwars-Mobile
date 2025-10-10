# Capacitor Configuration Guide

## Overview
This guide covers the complete setup and configuration of Capacitor for the SongWars mobile application, including native platform configuration, plugins, and build settings.

## Table of Contents
1. [Initial Capacitor Setup](#initial-capacitor-setup)
2. [Platform Configuration](#platform-configuration)
3. [Native Plugins](#native-plugins)
4. [Build Configuration](#build-configuration)
5. [Environment Setup](#environment-setup)
6. [Security Configuration](#security-configuration)
7. [Performance Optimization](#performance-optimization)
8. [Testing Configuration](#testing-configuration)

## Initial Capacitor Setup

### 1. Install Capacitor
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
```

### 2. Add Platforms
```bash
# Add iOS platform (macOS only)
npm install @capacitor/ios
npx cap add ios

# Add Android platform
npm install @capacitor/android
npx cap add android
```

### 3. Basic Configuration
Update `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.songwars.app',
  appName: 'SongWars',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffd200",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#000000",
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#ffd200'
    }
  }
};

export default config;
```

## Platform Configuration

### iOS Configuration

#### 1. Info.plist Updates
Add to `ios/App/App/Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>SongWars needs access to your microphone to record audio for battles.</string>

<key>NSCameraUsageDescription</key>
<string>SongWars needs access to your camera to take profile pictures.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>SongWars needs access to your photo library to select profile pictures.</string>

<key>NSMusicLibraryUsageDescription</key>
<string>SongWars needs access to your music library to import songs.</string>

<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

#### 2. iOS Build Settings
Update `ios/App/App.xcodeproj/project.pbxproj`:

```bash
# Set deployment target to iOS 13.0+
IPHONEOS_DEPLOYMENT_TARGET = 13.0

# Enable bitcode
ENABLE_BITCODE = NO

# Set build configuration
DEBUG_INFORMATION_FORMAT = dwarf-with-dsym
```

#### 3. iOS Capabilities
Enable in Xcode:
- **Background Modes**: Audio, AirPlay, and Picture in Picture
- **Push Notifications**: For battle notifications
- **App Groups**: For data sharing between app and extensions

### Android Configuration

#### 1. AndroidManifest.xml Updates
Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<application
    android:usesCleartextTraffic="true"
    android:requestLegacyExternalStorage="true">
    
    <activity
        android:name="com.capacitorjs.plugins.splashscreen.SplashScreenActivity"
        android:exported="false"
        android:screenOrientation="portrait">
    </activity>
</application>
```

#### 2. Android Build Configuration
Update `android/app/build.gradle`:

```gradle
android {
    compileSdkVersion 34
    defaultConfig {
        applicationId "com.songwars.app"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
    
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

## Native Plugins

### 1. Essential Plugins
Install required plugins:

```bash
# Core plugins
npm install @capacitor/app
npm install @capacitor/haptics
npm install @capacitor/keyboard
npm install @capacitor/network
npm install @capacitor/preferences
npm install @capacitor/splash-screen
npm install @capacitor/status-bar

# Audio and media
npm install @capacitor-community/native-audio
npm install @capacitor-community/media

# Camera and files
npm install @capacitor/camera
npm install @capacitor/filesystem

# Push notifications
npm install @capacitor/push-notifications
npm install @capacitor/local-notifications

# Device features
npm install @capacitor/device
npm install @capacitor/screen-orientation
```

### 2. Plugin Configuration

#### Audio Plugin Setup
```typescript
// src/composables/useNativeAudio.ts
import { NativeAudio } from '@capacitor-community/native-audio';

export function useNativeAudio() {
  const preloadAudio = async (audioId: string, assetPath: string) => {
    try {
      await NativeAudio.preload({
        assetId: audioId,
        assetPath,
        volume: 0.7,
        audioChannelNum: 1,
        isUrl: true
      });
    } catch (error) {
      console.error('Error preloading audio:', error);
    }
  };

  const playAudio = async (audioId: string) => {
    try {
      await NativeAudio.play({ assetId: audioId });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const stopAudio = async (audioId: string) => {
    try {
      await NativeAudio.stop({ assetId: audioId });
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  return {
    preloadAudio,
    playAudio,
    stopAudio
  };
}
```

#### Camera Plugin Setup
```typescript
// src/composables/useCamera.ts
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export function useCamera() {
  const takePicture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      
      return image.webPath;
    } catch (error) {
      console.error('Error taking picture:', error);
      throw error;
    }
  };

  const selectFromGallery = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });
      
      return image.webPath;
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      throw error;
    }
  };

  return {
    takePicture,
    selectFromGallery
  };
}
```

#### Push Notifications Setup
```typescript
// src/composables/usePushNotifications.ts
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';

export function usePushNotifications() {
  const registerForPush = async () => {
    try {
      // Register for push notifications
      await PushNotifications.register();

      // Listen for registration
      PushNotifications.addListener('registration', (token: Token) => {
        console.log('Push registration success, token: ' + token.value);
        // Send token to your server
        sendTokenToServer(token.value);
      });

      // Listen for registration errors
      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      // Listen for push notifications
      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('Push received: ' + JSON.stringify(notification));
      });

      // Listen for push notification actions
      PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
      });

    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  const sendTokenToServer = async (token: string) => {
    // Optional: call a backend endpoint to store device tokens if your server supports it.
  };

  return {
    registerForPush
  };
}
```

## Build Configuration

### 1. Ionic Build Configuration
Update `ionic.config.json`:

```json
{
  "name": "songwars",
  "integrations": {
    "capacitor": {}
  },
  "type": "vue"
}
```

### 2. Vite Configuration
Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true,
    port: 3000
  },
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', '@ionic/vue'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
});
```

### 3. TypeScript Configuration
Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Environment Setup

### 1. Environment Variables
Create `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# App Configuration
VITE_APP_NAME=SongWars
VITE_APP_VERSION=1.0.0

# Development
VITE_DEBUG=true
VITE_API_URL=https://your-api.com

# Production
# VITE_SUPABASE_URL=https://your-prod-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-prod-anon-key
```

### 2. Environment-Specific Configuration
Create `src/config/environment.ts`:

```typescript
import { Capacitor } from '@capacitor/core';

export const environment = {
  production: import.meta.env.PROD,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  appName: import.meta.env.VITE_APP_NAME,
  appVersion: import.meta.env.VITE_APP_VERSION,
  debug: import.meta.env.VITE_DEBUG === 'true',
  platform: Capacitor.getPlatform(),
  isNative: Capacitor.isNativePlatform()
};
```

## Security Configuration

### 1. Network Security
Update `capacitor.config.ts` for security:

```typescript
const config: CapacitorConfig = {
  appId: 'com.songwars.app',
  appName: 'SongWars',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false
  },
  plugins: {
    SplashScreen: {
      // ... splash screen config
    },
    StatusBar: {
      // ... status bar config
    }
  }
};
```

### 2. Certificate Pinning
For production, implement certificate pinning:

```typescript
// src/utils/certificatePinning.ts
import { CapacitorHttp } from '@capacitor/core';

export const secureHttpRequest = async (url: string, options: any) => {
  if (Capacitor.isNativePlatform()) {
    return await CapacitorHttp.request({
      url,
      ...options,
      // Add certificate pinning configuration
    });
  }
  
  // Fallback to regular fetch for web
  return fetch(url, options);
};
```

## Performance Optimization

### 1. Bundle Optimization
Update `vite.config.ts` for better performance:

```typescript
export default defineConfig({
  plugins: [vue()],
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', '@ionic/vue'],
          supabase: ['@supabase/supabase-js'],
          audio: ['@capacitor-community/native-audio']
        }
      }
    }
  }
});
```

### 2. Lazy Loading
Implement lazy loading for routes:

```typescript
// src/router/index.ts
const routes: Array<RouteRecordRaw> = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-songs',
    name: 'MySongs',
    component: () => import('@/views/MySongs.vue'),
    meta: { requiresAuth: true }
  }
];
```

## Testing Configuration

### 1. Unit Testing Setup
Install testing dependencies:

```bash
npm install --save-dev @vue/test-utils vitest jsdom
```

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true
  }
});
```

### 2. E2E Testing Setup
Install E2E testing tools:

```bash
npm install --save-dev @playwright/test
```

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
```

## Build Commands

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Sync with native platforms
npx cap sync

# Open in native IDEs
npx cap open ios
npx cap open android
```

### Production
```bash
# Build and sync
npm run build
npx cap sync

# Build native apps
npx cap build ios
npx cap build android
```

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Clear node_modules and reinstall
   - Update Capacitor to latest version
   - Check platform-specific requirements

2. **Plugin Issues**
   - Ensure plugins are properly installed
   - Check platform-specific configurations
   - Verify permissions are set correctly

3. **Performance Issues**
   - Enable lazy loading
   - Optimize bundle size
   - Use native plugins for heavy operations

### Debug Commands
```bash
# Check Capacitor version
npx cap --version

# List installed plugins
npx cap ls

# Check platform status
npx cap doctor

# Sync and update
npx cap sync --force
```

---

This completes the Capacitor configuration guide. The next step is to set up the routing and navigation system for the mobile app.
