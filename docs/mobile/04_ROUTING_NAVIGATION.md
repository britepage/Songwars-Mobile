# Routing & Navigation Conversion Guide

## Overview
This guide covers the complete conversion from Vue Router to Ionic Navigation, including stack-based routing, navigation patterns, and mobile-specific navigation features.

## Table of Contents
1. [Vue Router vs Ionic Navigation](#vue-router-vs-ionic-navigation)
2. [Route Structure Conversion](#route-structure-conversion)
3. [Navigation Components](#navigation-components)
4. [Route Guards & Middleware](#route-guards--middleware)
5. [Deep Linking](#deep-linking)
6. [Navigation Patterns](#navigation-patterns)
7. [Tab Navigation](#tab-navigation)
8. [Modal Navigation](#modal-navigation)
9. [Code Examples](#code-examples)

## Vue Router vs Ionic Navigation

### Web Navigation (Current)
```typescript
// Current Vue Router setup
const routes = [
  { path: '/', component: Home },
  { path: '/dashboard', component: Dashboard },
  { path: '/my-songs', component: MySongs },
  { path: '/user/:username', component: UserProfile }
];

// Navigation
router.push('/dashboard');
router.replace('/my-songs');
```

### Mobile Navigation (Ionic)
```typescript
// Ionic Navigation setup
const routes = [
  { path: '/', component: HomePage },
  { path: '/dashboard', component: DashboardPage },
  { path: '/my-songs', component: MySongsPage },
  { path: '/user/:username', component: UserProfilePage }
];

// Navigation
router.push('/dashboard');
router.replace('/my-songs');
```

## Route Structure Conversion

### 1. Current Web Routes
Based on the SongWars web app structure:

```typescript
// Current routes from pages/ directory
const webRoutes = [
  { path: '/', component: 'index.vue' },           // Landing page
  { path: '/dashboard', component: 'dashboard.vue' }, // Main battle interface
  { path: '/my-songs', component: 'my-songs.vue' },   // Song management
  { path: '/leaderboard', component: 'leaderboard.vue' }, // Rankings
  { path: '/account', component: 'account.vue' },     // User settings
  { path: '/user/:username', component: 'user/[username].vue' }, // Public profiles
  { path: '/sign-in', component: 'sign-in.vue' },     // Authentication
  { path: '/registration', component: 'registration.vue' }, // User registration
  { path: '/reset-password', component: 'reset-password.vue' }, // Password reset
  { path: '/reset-password-email', component: 'reset-password-email.vue' }, // Email reset
  { path: '/preview', component: 'preview.vue' },     // Song preview
  { path: '/admin/flags', component: 'admin/flags.vue' }, // Admin moderation
  { path: '/trial', component: 'trial/' },            // Trial system
];
```

### 2. Mobile Route Structure
Convert to Ionic navigation structure:

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/home'
  },
  {
    path: '/tabs/',
    component: () => import('@/components/TabsPage.vue'),
    children: [
      {
        path: '',
        redirect: '/tabs/home'
      },
      {
        path: 'home',
        component: () => import('@/views/HomePage.vue')
      },
      {
        path: 'dashboard',
        component: () => import('@/views/DashboardPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'my-songs',
        component: () => import('@/views/MySongsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'leaderboard',
        component: () => import('@/views/LeaderboardPage.vue')
      },
      {
        path: 'account',
        component: () => import('@/views/AccountPage.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/sign-in',
    component: () => import('@/views/SignInPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/registration',
    component: () => import('@/views/RegistrationPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/reset-password',
    component: () => import('@/views/ResetPasswordPage.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/user/:username',
    component: () => import('@/views/UserProfilePage.vue')
  },
  {
    path: '/admin/flags',
    component: () => import('@/views/AdminFlagsPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
```

## Navigation Components

### 1. Tabs Navigation
Create the main tabs component:

```vue
<!-- src/components/TabsPage.vue -->
<template>
  <ion-tabs>
    <ion-tab-bar slot="bottom">
      <ion-tab-button tab="home" href="/tabs/home">
        <ion-icon :icon="home"></ion-icon>
        <ion-label>Home</ion-label>
      </ion-tab-button>
      
      <ion-tab-button tab="dashboard" href="/tabs/dashboard">
        <ion-icon :icon="musicalNotes"></ion-icon>
        <ion-label>Battle</ion-label>
      </ion-tab-button>
      
      <ion-tab-button tab="my-songs" href="/tabs/my-songs">
        <ion-icon :icon="library"></ion-icon>
        <ion-label>My Songs</ion-label>
      </ion-tab-button>
      
      <ion-tab-button tab="leaderboard" href="/tabs/leaderboard">
        <ion-icon :icon="trophy"></ion-icon>
        <ion-label>Leaderboard</ion-label>
      </ion-tab-button>
      
      <ion-tab-button tab="account" href="/tabs/account">
        <ion-icon :icon="person"></ion-icon>
        <ion-label>Account</ion-label>
      </ion-tab-button>
    </ion-tab-bar>
  </ion-tabs>
</template>

<script setup lang="ts">
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/vue';
import { home, musicalNotes, library, trophy, person } from 'ionicons/icons';
</script>
```

### 2. Navigation Header
Create a reusable navigation header:

```vue
<!-- src/components/NavigationHeader.vue -->
<template>
  <ion-header>
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-back-button 
          v-if="showBackButton"
          :default-href="defaultHref"
          @click="handleBackClick"
        />
        <ion-menu-button v-else-if="showMenuButton" />
      </ion-buttons>
      
      <ion-title>{{ title }}</ion-title>
      
      <ion-buttons slot="end">
        <ion-button 
          v-if="showThemeToggle"
          @click="toggleTheme"
          fill="clear"
        >
          <ion-icon :icon="isDark ? sunny : moon" />
        </ion-button>
        
        <ion-button 
          v-if="showNotifications"
          @click="openNotifications"
          fill="clear"
        >
          <ion-icon :icon="notifications" />
          <ion-badge v-if="notificationCount > 0" color="danger">
            {{ notificationCount }}
          </ion-badge>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonBadge, IonBackButton, IonMenuButton } from '@ionic/vue';
import { sunny, moon, notifications } from 'ionicons/icons';
import { computed } from 'vue';
import { useThemeStore } from '@/store/themeStore';

interface Props {
  title: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showThemeToggle?: boolean;
  showNotifications?: boolean;
  defaultHref?: string;
}

const props = withDefaults(defineProps<Props>(), {
  showBackButton: false,
  showMenuButton: false,
  showThemeToggle: false,
  showNotifications: false,
  defaultHref: '/tabs/home'
});

const emit = defineEmits<{
  backClick: [];
  menuClick: [];
  themeToggle: [];
  notificationsClick: [];
}>();

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.isDarkMode);
const notificationCount = computed(() => 0); // TODO: Implement notification count

const toggleTheme = () => {
  themeStore.toggleTheme();
  emit('themeToggle');
};

const handleBackClick = () => {
  emit('backClick');
};

const openNotifications = () => {
  emit('notificationsClick');
};
</script>
```

## Route Guards & Middleware

### 1. Authentication Guard
Convert the existing auth middleware:

```typescript
// src/router/guards/auth.ts
import { RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/store/authStore';

export const authGuard = async (to: RouteLocationNormalized) => {
  const authStore = useAuthStore();
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // Redirect to sign-in with return URL
      return {
        path: '/sign-in',
        query: { redirect: to.fullPath }
      };
    }
  }
  
  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest) {
    if (authStore.isAuthenticated) {
      // Redirect to dashboard if already authenticated
      return '/tabs/dashboard';
    }
  }
  
  // Check admin access
  if (to.meta.requiresAdmin) {
    if (!authStore.isAdmin) {
      // Redirect to dashboard if not admin
      return '/tabs/dashboard';
    }
  }
  
  return true;
};
```

### 2. Route Guard Setup
Apply guards to the router:

```typescript
// src/router/index.ts
import { authGuard } from './guards/auth';

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// Apply route guards
router.beforeEach(authGuard);

export default router;
```

### 3. Trial System Guard
Convert the trial system middleware:

```typescript
// src/router/guards/trial.ts
import { RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { useTrialStore } from '@/store/trialStore';

export const trialGuard = async (to: RouteLocationNormalized) => {
  const authStore = useAuthStore();
  const trialStore = useTrialStore();
  
  // Skip trial check for non-authenticated users
  if (!authStore.isAuthenticated) {
    return true;
  }
  
  // Check if user has exceeded trial limit
  if (trialStore.hasExceededTrialLimit) {
    // Redirect to upgrade page
    return '/upgrade';
  }
  
  return true;
};
```

## Deep Linking

### 1. URL Scheme Configuration
Update `capacitor.config.ts` for deep linking:

```typescript
const config: CapacitorConfig = {
  appId: 'com.songwars.app',
  appName: 'SongWars',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    App: {
      appUrlOpen: {
        iosCustomScheme: 'songwars',
        androidCustomScheme: 'songwars'
      }
    }
  }
};
```

### 2. Deep Link Handling
Create deep link handler:

```typescript
// src/composables/useDeepLinking.ts
import { App, AppUrlOpen } from '@capacitor/app';
import { useRouter } from 'vue-router';

export function useDeepLinking() {
  const router = useRouter();
  
  const setupDeepLinking = () => {
    // Handle app URL open events
    App.addListener('appUrlOpen', (event: AppUrlOpen) => {
      const url = new URL(event.url);
      const path = url.pathname;
      const params = Object.fromEntries(url.searchParams);
      
      // Route to the appropriate page
      router.push({ path, query: params });
    });
  };
  
  const handleExternalLink = (url: string) => {
    // Strict parity: only route to authenticated app screens.
    if (url.includes('songwars.app/user/')) {
      const username = url.split('/user/')[1];
      router.push(`/user/${username}`);
    } else {
      // Default to dashboard for all other app links
      router.push('/tabs/dashboard');
    }
  };
  
  return {
    setupDeepLinking,
    handleExternalLink
  };
}
```

## Navigation Patterns

### 1. Stack Navigation
Implement stack-based navigation:

```vue
<!-- src/views/DashboardPage.vue -->
<template>
  <ion-page>
    <NavigationHeader title="Battle" />
    <ion-content>
      <!-- Battle content -->
      <BattleAnimation />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import { useRouter } from 'vue-router';
import BattleAnimation from '@/components/BattleAnimation.vue';
import NavigationHeader from '@/components/NavigationHeader.vue';

const router = useRouter();

// Navigate to song details (parity: handled within existing pages/components)
const viewSongDetails = (songId: string) => {
  // Keep user within existing tabs; no standalone song route
  router.push('/tabs/my-songs');
};

// Navigate to user profile
const viewUserProfile = (username: string) => {
  router.push(`/user/${username}`);
};
</script>
```

### 2. Modal Navigation
Create modal navigation patterns:

```vue
<!-- src/components/SongUploadModal.vue -->
<template>
  <ion-modal :is-open="isOpen" @did-dismiss="closeModal">
    <ion-header>
      <ion-toolbar>
        <ion-title>Upload Song</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closeModal">
            <ion-icon :icon="close" />
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <SongUploader @upload-complete="handleUploadComplete" />
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent } from '@ionic/vue';
import { close } from 'ionicons/icons';
import SongUploader from '@/components/SongUploader.vue';

interface Props {
  isOpen: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  close: [];
  uploadComplete: [songId: string];
}>();

const closeModal = () => {
  emit('close');
};

const handleUploadComplete = (songId: string) => {
  emit('uploadComplete', songId);
  closeModal();
};
</script>
```

## Tab Navigation

### 1. Tab State Management
Create tab state management:

```typescript
// src/store/tabStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useTabStore = defineStore('tab', () => {
  const activeTab = ref('home');
  const tabHistory = ref<string[]>(['home']);
  
  const setActiveTab = (tab: string) => {
    activeTab.value = tab;
    if (!tabHistory.value.includes(tab)) {
      tabHistory.value.push(tab);
    }
  };
  
  const getPreviousTab = () => {
    return tabHistory.value[tabHistory.value.length - 2] || 'home';
  };
  
  return {
    activeTab,
    tabHistory,
    setActiveTab,
    getPreviousTab
  };
});
```

### 2. Tab Navigation Component
Enhanced tab navigation:

```vue
<!-- src/components/EnhancedTabsPage.vue -->
<template>
  <ion-tabs>
    <ion-tab-bar slot="bottom">
      <ion-tab-button 
        v-for="tab in tabs" 
        :key="tab.tab"
        :tab="tab.tab" 
        :href="tab.href"
        @click="setActiveTab(tab.tab)"
      >
        <ion-icon :icon="tab.icon" />
        <ion-label>{{ tab.label }}</ion-label>
        <ion-badge 
          v-if="tab.badge && tab.badge > 0" 
          color="danger"
        >
          {{ tab.badge }}
        </ion-badge>
      </ion-tab-button>
    </ion-tab-bar>
  </ion-tabs>
</template>

<script setup lang="ts">
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/vue';
import { home, musicalNotes, library, trophy, person } from 'ionicons/icons';
import { computed } from 'vue';
import { useTabStore } from '@/store/tabStore';

const tabStore = useTabStore();

const tabs = computed(() => [
  {
    tab: 'home',
    href: '/tabs/home',
    icon: home,
    label: 'Home',
    badge: 0
  },
  {
    tab: 'dashboard',
    href: '/tabs/dashboard',
    icon: musicalNotes,
    label: 'Battle',
    badge: 0
  },
  {
    tab: 'my-songs',
    href: '/tabs/my-songs',
    icon: library,
    label: 'My Songs',
    badge: 0
  },
  {
    tab: 'leaderboard',
    href: '/tabs/leaderboard',
    icon: trophy,
    label: 'Leaderboard',
    badge: 0
  },
  {
    tab: 'account',
    href: '/tabs/account',
    icon: person,
    label: 'Account',
    badge: 0
  }
]);

const setActiveTab = (tab: string) => {
  tabStore.setActiveTab(tab);
};
</script>
```

## Modal Navigation

### 1. Modal Service
Create a modal service for consistent modal handling:

```typescript
// src/services/modalService.ts
import { ref } from 'vue';

export interface ModalOptions {
  component: any;
  props?: Record<string, any>;
  presentingElement?: HTMLElement;
  canDismiss?: boolean;
}

class ModalService {
  private modals = ref<Map<string, any>>(new Map());
  
  async open(modalId: string, options: ModalOptions) {
    const { component, props = {}, presentingElement, canDismiss = true } = options;
    
    const modal = await modalController.create({
      component,
      componentProps: props,
      presentingElement,
      canDismiss
    });
    
    this.modals.value.set(modalId, modal);
    await modal.present();
    
    return modal;
  }
  
  async close(modalId: string) {
    const modal = this.modals.value.get(modalId);
    if (modal) {
      await modal.dismiss();
      this.modals.value.delete(modalId);
    }
  }
  
  async closeAll() {
    for (const [id, modal] of this.modals.value) {
      await modal.dismiss();
    }
    this.modals.value.clear();
  }
}

export const modalService = new ModalService();
```

### 2. Modal Usage Examples
Examples of modal usage:

```typescript
// src/composables/useModals.ts
import { modalService } from '@/services/modalService';
import SongUploadModal from '@/components/SongUploadModal.vue';
import UserProfileModal from '@/components/UserProfileModal.vue';

export function useModals() {
  const openSongUpload = async () => {
    const modal = await modalService.open('songUpload', {
      component: SongUploadModal,
      props: {
        isOpen: true
      }
    });
    
    return modal;
  };
  
  const openUserProfile = async (username: string) => {
    const modal = await modalService.open('userProfile', {
      component: UserProfileModal,
      props: {
        username,
        isOpen: true
      }
    });
    
    return modal;
  };
  
  const closeModal = (modalId: string) => {
    modalService.close(modalId);
  };
  
  return {
    openSongUpload,
    openUserProfile,
    closeModal
  };
}
```

## Code Examples

### 1. Complete Page Example
Full page with navigation:

```vue
<!-- src/views/MySongsPage.vue -->
<template>
  <ion-page>
    <NavigationHeader 
      title="My Songs" 
      :show-back-button="false"
      :show-menu-button="true"
    />
    
    <ion-content>
      <ion-refresher slot="fixed" @ion-refresh="handleRefresh">
        <ion-refresher-content />
      </ion-refresher>
      
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="openUploadModal">
          <ion-icon :icon="add" />
        </ion-fab-button>
      </ion-fab>
      
      <SongList 
        :songs="songs"
        @song-select="viewSongDetails"
        @user-select="viewUserProfile"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonRefresher, IonRefresherContent, IonFab, IonFabButton, IonIcon } from '@ionic/vue';
import { add } from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSongStore } from '@/store/songStore';
import { useModals } from '@/composables/useModals';
import NavigationHeader from '@/components/NavigationHeader.vue';
import SongList from '@/components/SongList.vue';

const router = useRouter();
const songStore = useSongStore();
const { openSongUpload } = useModals();

const songs = ref([]);
const loading = ref(false);

const loadSongs = async () => {
  loading.value = true;
  try {
    await songStore.fetchSongs();
    songs.value = songStore.songs;
  } finally {
    loading.value = false;
  }
};

const handleRefresh = async (event: CustomEvent) => {
  await loadSongs();
  event.detail.complete();
};

const viewSongDetails = (songId: string) => {
  router.push(`/user/${songId}`); // Changed to /user/:username
};

const viewUserProfile = (username: string) => {
  router.push(`/user/${username}`);
};

const openUploadModal = () => {
  openSongUpload();
};

onMounted(() => {
  loadSongs();
});
</script>
```

### 2. Navigation Service
Centralized navigation service:

```typescript
// src/services/navigationService.ts
import { useRouter } from 'vue-router';
import { useTabStore } from '@/store/tabStore';

class NavigationService {
  private router = useRouter();
  private tabStore = useTabStore();
  
  // Tab navigation
  navigateToTab(tab: string) {
    this.tabStore.setActiveTab(tab);
    this.router.push(`/tabs/${tab}`);
  }
  
  // Stack navigation
  push(route: string, params?: Record<string, any>) {
    this.router.push({ path: route, query: params });
  }
  
  replace(route: string, params?: Record<string, any>) {
    this.router.replace({ path: route, query: params });
  }
  
  back() {
    this.router.back();
  }
  
  // Modal navigation
  openModal(modalId: string, props?: Record<string, any>) {
    // Implementation depends on modal service
  }
  
  // Deep linking
  handleDeepLink(url: string) {
    // Parse and route deep links
  }
}

export const navigationService = new NavigationService();
```

---

This completes the routing and navigation conversion guide. The next step is to convert all the pages to mobile-friendly Ionic pages.
