# Header Navigation - Complete Implementation Guide

## Overview

This document provides complete, production-ready code for implementing the SongWars authenticated page header in the mobile app using **custom HTML + Tailwind CSS** instead of Ionic header components.

### Why Custom Implementation?

**Abandoning Ionic Components**:
- ❌ `<ion-header>` - Too opinionated, hard to customize
- ❌ `<ion-toolbar>` - Doesn't match web app layout
- ❌ `<ion-title>` - Limited styling control
- ❌ `<ion-buttons>` - Different spacing/alignment

**Custom HTML + Tailwind**:
- ✅ Full control over layout and spacing
- ✅ Exact pixel-perfect match to web app
- ✅ Easier theme integration
- ✅ Better safe area handling
- ✅ Same approach as FooterNavigation (proven to work)

---

## 1. Web App Header Code (Exact Reference)

### Location
**File**: `app.vue` (Lines 3-35)

### Complete Header Template
```vue
<header v-if="isAuthenticated || isUserProfilePage" class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-sm bg-white/95 border-b border-gray-200 theme-header">
  <div class="flex items-center justify-between px-4 py-3">
    <!-- Logo -->
    <div class="flex items-center">
      <NuxtLink to="/dashboard" class="flex items-center">
        <img src="/tapey.svg" alt="SongWars" class="h-10 w-40" />
      </NuxtLink>
    </div>
    
    <!-- Right side buttons -->
    <div class="flex items-center space-x-2">
      <!-- Theme Toggle Button - Client-side only to avoid hydration mismatch -->
      <ClientOnly>
        <button
          @click="toggleTheme"
          class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors duration-200"
          :title="isDarkMode ? 'Switch to Light' : 'Switch to Dark'"
        >
          <svg v-if="!isDarkMode" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/>
          </svg>
          <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
          </svg>
        </button>
      </ClientOnly>
      
      <!-- Hamburger Menu - Hide on user profile pages -->
      <HamburgerMenu v-if="!isUserProfilePage" />
    </div>
  </div>
</header>
```

### Theme Toggle Logic (Lines 87-111)
```typescript
// Theme toggle state for the button (reactive to DOM changes)
const isDarkMode = ref(false)

// CSS-only theme toggle function
const toggleTheme = () => {
  if (typeof document === 'undefined') return
  
  const currentTheme = document.documentElement.getAttribute('data-theme')
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  
  // Temporarily disable transitions to avoid rolling effect
  document.documentElement.classList.add('no-transitions')

  // Update DOM immediately
  document.documentElement.setAttribute('data-theme', newTheme)
  document.documentElement.classList.toggle('dark', newTheme === 'dark')
  document.documentElement.classList.toggle('light', newTheme === 'light')
  isDarkMode.value = newTheme === 'dark'
  
  // Update localStorage
  localStorage.setItem('songwars-theme', newTheme)
  localStorage.setItem('songwars-theme-system', 'false')

  // Re-enable transitions after a tick
  setTimeout(() => {
    document.documentElement.classList.remove('no-transitions')
  }, 60)
}
```

### Visibility Logic (Lines 77-82)
```typescript
// Ensure auth store is reactive
const isAuthenticated = computed(() => authStore.authenticatedUser)

// Hide hamburger menu on user profile pages
const isUserProfilePage = computed(() => {
  return route.path.startsWith('/user/')
})
```

---

## 2. Visual Comparison

### Current Ionic Header (To Be Replaced)
```vue
<!-- ❌ Current Ionic approach -->
<ion-header>
  <ion-toolbar>
    <ion-title>Dashboard</ion-title>
    <ion-buttons slot="end">
      <ion-button @click="toggleTheme">
        <ion-icon :icon="theme"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>
```

**Problems**:
- Generic Ionic styling
- Can't match web app exactly
- Limited customization
- Doesn't support glassmorphism
- Wrong spacing and layout

### Target Web App Header (To Implement)
```vue
<!-- ✅ Custom header with exact parity -->
<header class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-sm bg-white/95 border-b border-gray-200 theme-header">
  <div class="flex items-center justify-between px-4 py-3">
    <NuxtLink to="/dashboard">
      <img src="/tapey.svg" alt="SongWars" class="h-10 w-40" />
    </NuxtLink>
    
    <div class="flex items-center space-x-2">
      <button @click="toggleTheme">Theme</button>
      <HamburgerMenu />
    </div>
  </div>
</header>
```

**Advantages**:
- Exact match to web app
- Full Tailwind control
- Glassmorphism effect (backdrop-blur)
- Custom spacing
- Theme-aware styling

---

## 3. Component Breakdown

### Header Container (Line 4)
```vue
<header 
  v-if="isAuthenticated || isUserProfilePage" 
  class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-sm bg-white/95 border-b border-gray-200 theme-header"
>
```

**Styles Breakdown**:
```css
v-if="isAuthenticated || isUserProfilePage"  /* Only show for authenticated users or public profiles */
fixed                   /* Fixed positioning */
top-0 left-0 right-0    /* Full width at top */
z-50                    /* Above content, below modals */
backdrop-blur-md        /* 12px blur effect (glassmorphism) */
shadow-sm               /* Subtle shadow */
bg-white/95             /* White background, 95% opacity */
border-b                /* Bottom border only */
border-gray-200         /* Light gray border (#e5e7eb) */
theme-header            /* Custom theme class */
```

### Inner Container (Line 5)
```vue
<div class="flex items-center justify-between px-4 py-3">
```

**Styles Breakdown**:
```css
flex                    /* Flexbox layout */
items-center            /* Vertically center items */
justify-between         /* Logo left, buttons right */
px-4                    /* Horizontal padding: 16px */
py-3                    /* Vertical padding: 12px */
```

**Total Header Height**: `py-3` (12px × 2 = 24px) + logo height (40px) = **~64px**

### Logo Section (Lines 7-11)
```vue
<div class="flex items-center">
  <NuxtLink to="/dashboard" class="flex items-center">
    <img src="/tapey.svg" alt="SongWars" class="h-10 w-40" />
  </NuxtLink>
</div>
```

**Logo Specs**:
- **Asset**: `/tapey.svg` (exists in `public/tapey.svg`)
- **Size**: `h-10 w-40` (40px height, 160px width)
- **Click**: Navigates to `/dashboard`
- **Accessibility**: `alt="SongWars"`

### Right Button Group (Lines 14-33)
```vue
<div class="flex items-center space-x-2">
  <!-- Theme toggle -->
  <ClientOnly>
    <button @click="toggleTheme" class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors duration-200">
      <!-- SVG icons -->
    </button>
  </ClientOnly>
  
  <!-- Hamburger menu -->
  <HamburgerMenu v-if="!isUserProfilePage" />
</div>
```

**Layout**:
```css
flex                    /* Horizontal layout */
items-center            /* Vertically align */
space-x-2               /* 8px gap between buttons */
```

### Theme Toggle Button (Lines 17-28)
```vue
<button
  @click="toggleTheme"
  class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors duration-200"
  :title="isDarkMode ? 'Switch to Light' : 'Switch to Dark'"
>
  <svg v-if="!isDarkMode" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <!-- Moon icon (dark mode) -->
  </svg>
  <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <!-- Sun icon (light mode) -->
  </svg>
</button>
```

**Button Specs**:
- **Size**: `p-2` (8px padding) + icon `w-5 h-5` (20px) = **36px touch target** ⚠️ (below 44px minimum)
- **Background**: `bg-gray-100` (inactive), `hover:bg-gray-200` (hover)
- **Text color**: `text-gray-700`, `hover:text-gray-900`
- **Corner radius**: `rounded-lg` (8px)
- **Transition**: `transition-colors duration-200`

**For Mobile**: Increase to 44px touch target:
```vue
<button class="p-3 rounded-lg ...">  <!-- p-3 instead of p-2 -->
  <svg class="w-5 h-5">...</svg>
</button>
```
Touch target: 12px padding × 2 + 20px icon = **44px** ✅

---

## 4. Theme CSS Classes

### From main.css (Lines 272-281)

```css
.theme-header {
  background-color: rgba(255, 255, 255, 0.95) !important;
  border-color: #e5e7eb !important; /* gray-200 */
}

/* Keep header white in both light and dark mode */
[data-theme="dark"] .theme-header {
  background-color: rgba(255, 255, 255, 0.95) !important;
  border-color: #e5e7eb !important;
}
```

**Key Point**: Header stays **white in both themes** - doesn't change to dark mode. This is intentional for consistency.

### From app.vue (Lines 194-197)

```css
/* Mobile header styles */
header {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
```

**Glassmorphism Effect**:
- `backdrop-blur-md` in template (Tailwind)
- `backdrop-filter: blur(12px)` in scoped CSS
- `-webkit-backdrop-filter` for Safari support

---

## 5. Complete HeaderNavigation.vue Implementation

### Full Custom Component (Mobile)

**File**: `src/components/core/HeaderNavigation.vue`

```vue
<template>
  <header 
    v-if="isAuthenticated || isUserProfilePage" 
    class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md shadow-sm bg-white/95 border-b border-gray-200 header-custom"
  >
    <div class="flex items-center justify-between px-4 py-3 safe-area-top">
      <!-- Logo (Left) -->
      <div class="flex items-center">
        <a @click="goToDashboard" class="flex items-center cursor-pointer">
          <img src="/images/tapey.svg" alt="SongWars" class="h-10 w-40" />
        </a>
      </div>
      
      <!-- Right Side Buttons -->
      <div class="flex items-center space-x-2">
        <!-- Theme Toggle Button -->
        <button
          @click="toggleTheme"
          class="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors duration-200"
          :title="isDarkMode ? 'Switch to Light' : 'Switch to Dark'"
          aria-label="Toggle theme"
        >
          <!-- Moon icon (for switching to dark mode) -->
          <svg v-if="!isDarkMode" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"/>
          </svg>
          <!-- Sun icon (for switching to light mode) -->
          <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
          </svg>
        </button>
        
        <!-- Hamburger Menu Button - Hide on public profile pages -->
        <HamburgerMenu v-if="!isUserProfilePage" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { Preferences } from '@capacitor/preferences';
import HamburgerMenu from './HamburgerMenu.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Visibility computed properties
const isAuthenticated = computed(() => authStore.authenticatedUser);
const isUserProfilePage = computed(() => route.path.startsWith('/user/'));

// Theme state
const isDarkMode = ref(false);

// Navigation
const goToDashboard = () => {
  router.push('/tabs/dashboard');
};

// Theme toggle with Capacitor Storage
const toggleTheme = async () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  // Temporarily disable transitions
  document.documentElement.classList.add('no-transitions');

  // Update DOM
  document.documentElement.setAttribute('data-theme', newTheme);
  document.documentElement.classList.toggle('dark', newTheme === 'dark');
  document.documentElement.classList.toggle('light', newTheme === 'light');
  isDarkMode.value = newTheme === 'dark';
  
  // Save to Capacitor Storage (instead of localStorage)
  await Preferences.set({ key: 'songwars-theme', value: newTheme });
  await Preferences.set({ key: 'songwars-theme-system', value: 'false' });

  // Re-enable transitions
  setTimeout(() => {
    document.documentElement.classList.remove('no-transitions');
  }, 60);
};

// Initialize theme state from DOM
onMounted(() => {
  if (typeof document !== 'undefined') {
    isDarkMode.value = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Observe theme changes
    const observer = new MutationObserver(() => {
      isDarkMode.value = document.documentElement.getAttribute('data-theme') === 'dark';
    });
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['data-theme'] 
    });
    
    // Store for cleanup
    onUnmounted(() => {
      observer.disconnect();
    });
  }
});
</script>

<style scoped>
/* Custom header styling */
.header-custom {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Theme-aware styling */
.header-custom {
  background-color: rgba(255, 255, 255, 0.95) !important;
  border-color: #e5e7eb !important;
}

/* Keep white in both themes (matches web app) */
[data-theme="dark"] .header-custom {
  background-color: rgba(255, 255, 255, 0.95) !important;
  border-color: #e5e7eb !important;
}

/* Safe area handling */
.safe-area-top {
  padding-top: max(0.75rem, env(safe-area-inset-top));
}
</style>
```

---

## 6. Exact Styling Specifications

### Header Dimensions

| Property | Value | Pixels | Notes |
|----------|-------|--------|-------|
| **Height** | Auto | ~64px | py-3 (24px) + logo (40px) |
| **Padding horizontal** | `px-4` | 16px | Left/right |
| **Padding vertical** | `py-3` | 12px | Top/bottom |
| **Logo height** | `h-10` | 40px | Fixed height |
| **Logo width** | `w-40` | 160px | Fixed width |

### Colors

| Element | Light Mode | Dark Mode | Notes |
|---------|------------|-----------|-------|
| **Background** | `rgba(255, 255, 255, 0.95)` | `rgba(255, 255, 255, 0.95)` | Same in both! |
| **Border** | `#e5e7eb` (gray-200) | `#e5e7eb` (gray-200) | Same in both! |
| **Theme button bg** | `#f3f4f6` (gray-100) | `#f3f4f6` (gray-100) | Same in both! |
| **Theme button text** | `#374151` (gray-700) | `#374151` (gray-700) | Same in both! |

**Critical**: Header is **always white**, even in dark mode. This maintains consistency across themes.

### Effects

| Effect | CSS | Value |
|--------|-----|-------|
| **Blur** | `backdrop-blur-md` | 12px |
| **Shadow** | `shadow-sm` | 0 1px 2px rgba(0,0,0,0.05) |
| **Opacity** | `bg-white/95` | 95% |

### Button Sizing

| Button | Padding | Icon Size | Total Touch Target |
|--------|---------|-----------|-------------------|
| **Theme toggle (web)** | `p-2` | `w-5 h-5` | 36px × 36px ⚠️ |
| **Theme toggle (mobile)** | `p-3` | `w-5 h-5` | 44px × 44px ✅ |
| **Hamburger (web)** | `p-2` | `w-6 h-6` | 40px × 40px ⚠️ |
| **Hamburger (mobile)** | `p-3` | `w-6 h-6` | 48px × 48px ✅ |

**Mobile Adjustment**: Increase padding from `p-2` to `p-3` to meet 44px minimum touch target.

### Z-Index Layering

| Element | Z-Index | Purpose |
|---------|---------|---------|
| Header | `z-50` | Above page content |
| Hamburger button | `z-60` | Above header |
| Hamburger menu | `z-50` | Same as header |
| Footer | `z-50` | Same as header |
| Modals | `z-50+` | Above everything |

---

## 7. Safe Area Handling

### iOS Notch Support

**Template**:
```vue
<div class="flex items-center justify-between px-4 py-3 safe-area-top">
```

**CSS**:
```css
.safe-area-top {
  padding-top: max(0.75rem, env(safe-area-inset-top));
}
```

**How It Works**:
- `env(safe-area-inset-top)` returns notch height on iOS
- `max(0.75rem, ...)` ensures minimum 12px padding
- On notched devices: Uses actual inset value (e.g., 44px)
- On non-notched devices: Uses 12px default

### Android Status Bar

Android handles status bar differently - no special CSS needed. The system automatically accounts for it.

### Fixed Positioning Best Practices

**Header**:
```css
position: fixed;
top: 0;
left: 0;
right: 0;
```

**Main Content** (Line 48-52):
```vue
<main :class="[
  'flex-1 relative theme-bg-primary transition-all duration-300',
  (isAuthenticated || isUserProfilePage) ? 'pt-16 pb-20' : 'pt-0'
]">
```

**Padding**:
- `pt-16` (64px) - Accounts for fixed header height
- `pb-20` (80px) - Accounts for fixed footer height
- Only applied when authenticated (header/footer visible)

---

## 8. Page Integration

### Remove Ionic Headers from All Pages

**Before** (Current mobile app):
```vue
<template>
  <ion-page>
    <!-- ❌ Remove this entire block -->
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <!-- Page content -->
    </ion-content>
  </ion-page>
</template>
```

**After** (With custom header):
```vue
<template>
  <ion-page>
    <!-- ✅ No ion-header - header is in App.vue -->
    
    <ion-content class="ion-padding-top">
      <!-- Page content -->
    </ion-content>
  </ion-page>
</template>
```

### App-Level Integration

**File**: `src/App.vue` (Mobile)

```vue
<template>
  <ion-app>
    <!-- Custom Header (Global) -->
    <HeaderNavigation />
    
    <!-- Router Outlet -->
    <ion-router-outlet />
    
    <!-- Custom Footer (Global) -->
    <FooterNavigation />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import HeaderNavigation from './components/core/HeaderNavigation.vue';
import FooterNavigation from './components/core/FooterNavigation.vue';
</script>
```

### Content Padding Adjustment

**Add to global CSS** (`src/theme/utilities.css`):

```css
/* Adjust ion-content for fixed header */
ion-content {
  --padding-top: 64px;  /* Header height */
  --padding-bottom: 80px;  /* Footer height */
}

/* Override for public pages (no header/footer) */
.page-public ion-content {
  --padding-top: 0;
  --padding-bottom: 0;
}
```

**Or** use CSS classes on each page:

```vue
<ion-content class="pt-16 pb-20">
  <!-- Content automatically accounts for header/footer -->
</ion-content>
```

### Example: Dashboard Page

```vue
<template>
  <ion-page>
    <!-- NO ion-header here -->
    
    <ion-content class="ion-no-padding">
      <div class="pt-16 pb-20">  <!-- Manual padding for header/footer -->
        <!-- Battle Animation -->
        <BattleAnimation />
        
        <!-- Upload Section -->
        <div v-if="activeSection === 'upload'">
          <SongUploader />
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>
```

### Example: Leaderboard Page

```vue
<template>
  <ion-page>
    <ion-content>
      <div class="pt-16 pb-20">  <!-- Padding for header/footer -->
        <LeaderboardList />
      </div>
    </ion-content>
  </ion-page>
</template>
```

### Example: Account Page

```vue
<template>
  <ion-page>
    <ion-content>
      <div class="pt-16 pb-20 p-4">
        <AccountSettings />
      </div>
    </ion-content>
  </ion-page>
</template>
```

---

## 9. HamburgerMenu Integration

### Web App HamburgerMenu Component

**File**: `components/HamburgerMenu.vue`

**Features**:
- Hamburger button that opens slide-out menu
- Menu slides in from right
- Contains links to FAQs, Community, Feedback, Privacy, Terms
- Full-screen overlay on mobile
- Iframe content viewer for external links
- DMCA protection badge

### Button Structure (Lines 4-32)

```vue
<button
  @click="toggleMenu"
  class="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors duration-200 relative z-60"
  :class="{ 'bg-gray-200': isOpen }"
  title="Menu"
>
  <svg 
    class="w-6 h-6 transition-transform duration-200" 
    :class="{ 'rotate-90': isOpen }"
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <!-- Hamburger icon (3 lines) -->
    <path 
      v-if="!isOpen" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M4 6h16M4 12h16M4 18h16"
    />
    <!-- X icon (close) -->
    <path 
      v-else 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      stroke-width="2" 
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
</button>
```

**Icon Transition**:
- **Closed**: 3 horizontal lines (hamburger)
- **Open**: X (close icon)
- **Rotation**: `rotate-90` when open
- **Size**: `w-6 h-6` (24px × 24px)

### Menu Panel (Lines 36-132)

**Slide-out from right**:
```vue
<div 
  class="fixed top-0 right-0 h-full bg-white z-50 transform transition-all duration-300 ease-in-out"
  :class="[
    isOpen ? 'translate-x-0' : 'translate-x-full',
    showContent ? 'w-full' : 'w-80'
  ]"
>
```

**States**:
- **Closed**: `translate-x-full` (off-screen right)
- **Open (menu)**: `translate-x-0`, `w-80` (320px wide)
- **Open (content)**: `translate-x-0`, `w-full` (full width)

### Menu Items

1. **FAQs** - Opens iframe to https://songwars.com/faqs/
2. **Community** - External link to Facebook group
3. **Submit Feedback** - Opens iframe to https://songwars.com/submit-feedback/
4. **Privacy Policy** - Opens iframe to https://songwars.com/privacy
5. **Terms of Service** - Opens iframe to https://songwars.com/terms

### Mobile Replication

**For Mobile**: Component works as-is! Just ensure:
- Import `HamburgerMenu.vue` from web app
- Copy exact component to mobile project
- Uses standard `<button>` (not Ionic component)
- Already uses Tailwind CSS
- No modifications needed

---

## 10. Complete Code Examples

### File Structure

```
src/
├── components/
│   └── core/
│       ├── HeaderNavigation.vue  (NEW - custom header)
│       ├── FooterNavigation.vue  (Already created)
│       └── HamburgerMenu.vue     (Copy from web app)
├── pages/
│   ├── DashboardPage.vue         (Remove ion-header)
│   ├── LeaderboardPage.vue       (Remove ion-header)
│   ├── MySongsPage.vue           (Remove ion-header)
│   └── AccountPage.vue           (Remove ion-header)
└── App.vue                       (Add HeaderNavigation)
```

### App.vue (Mobile Root)

```vue
<template>
  <ion-app>
    <!-- Global Custom Header -->
    <HeaderNavigation />
    
    <!-- Page Content -->
    <ion-router-outlet />
    
    <!-- Global Custom Footer -->
    <FooterNavigation />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import HeaderNavigation from './components/core/HeaderNavigation.vue';
import FooterNavigation from './components/core/FooterNavigation.vue';
</script>

<style>
/* Global adjustment for fixed header/footer */
ion-router-outlet {
  padding-top: 64px;
  padding-bottom: 80px;
}
</style>
```

### Dashboard Page (Updated)

```vue
<template>
  <ion-page>
    <!-- ✅ NO ion-header -->
    
    <ion-content class="ion-no-padding">
      <!-- Battle or Upload section -->
      <div v-if="activeSection === 'battle'">
        <BattleAnimation />
      </div>
      
      <div v-else-if="activeSection === 'upload'">
        <SongUploader />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { IonPage, IonContent } from '@ionic/vue';
import BattleAnimation from '@/components/BattleAnimation.vue';
import SongUploader from '@/components/dashboard/SongUploader.vue';

const route = useRoute();
const activeSection = ref('battle');

// Watch for section query param
watch(() => route.query.section, (newSection) => {
  activeSection.value = newSection === 'upload' ? 'upload' : 'battle';
}, { immediate: true });
</script>
```

### Leaderboard Page (Updated)

```vue
<template>
  <ion-page>
    <!-- ✅ NO ion-header -->
    
    <ion-content>
      <div class="p-4">
        <LeaderboardList />
      </div>
    </ion-content>
  </ion-page>
</template>
```

### My Songs Page (Updated)

```vue
<template>
  <ion-page>
    <!-- ✅ NO ion-header -->
    
    <ion-content>
      <div class="p-4">
        <SongList />
      </div>
    </ion-content>
  </ion-page>
</template>
```

### Account Page (Updated)

```vue
<template>
  <ion-page>
    <!-- ✅ NO ion-header -->
    
    <ion-content>
      <div class="p-4">
        <AccountSettings />
      </div>
    </ion-content>
  </ion-page>
</template>
```

---

## 11. Testing Checklist

### Visual Parity
- [ ] Header displays at top of all authenticated pages
- [ ] Logo matches web app (40px height, 160px width)
- [ ] Theme toggle button in correct position
- [ ] Hamburger button in correct position
- [ ] 8px spacing between buttons (`space-x-2`)
- [ ] White background with 95% opacity
- [ ] Gray-200 bottom border
- [ ] Backdrop blur effect visible
- [ ] Subtle shadow visible

### Functionality
- [ ] Header only shows when authenticated
- [ ] Header also shows on public user profile pages
- [ ] Logo click navigates to `/tabs/dashboard`
- [ ] Theme toggle switches between light/dark
- [ ] Theme persists to Capacitor Storage
- [ ] Hamburger button opens menu
- [ ] Hamburger hidden on `/user/` profile pages
- [ ] Menu slides in from right
- [ ] Menu items all work (FAQs, Community, etc.)

### Safe Area Support
- [ ] Header doesn't overlap iOS notch
- [ ] Proper padding on iPhone with notch
- [ ] Works on Android with status bar
- [ ] Safe area padding applied correctly
- [ ] No content hidden behind system UI

### Theme Support
- [ ] Header stays white in light mode
- [ ] Header stays white in dark mode (yes, same!)
- [ ] Theme toggle icon swaps (moon ↔ sun)
- [ ] Button backgrounds correct in both themes
- [ ] Border color correct in both themes

### Touch Targets
- [ ] Theme button >= 44px × 44px
- [ ] Hamburger button >= 44px × 44px
- [ ] Logo clickable area adequate
- [ ] All buttons easy to tap with thumb

### Navigation & Scroll
- [ ] Header stays fixed during page scroll
- [ ] Content scrolls underneath header
- [ ] No overlap with footer
- [ ] Page content has proper top padding (64px)
- [ ] Z-index prevents content from appearing above header

### Integration
- [ ] All pages removed `ion-header`
- [ ] All pages have proper content padding
- [ ] HamburgerMenu component works
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Works on iOS simulator
- [ ] Works on Android emulator

---

## 12. Quick Reference

### Header Specs

```css
/* Container */
fixed top-0 left-0 right-0
z-50
backdrop-blur-md
shadow-sm
bg-white/95
border-b border-gray-200

/* Inner */
flex items-center justify-between
px-4 py-3

/* Logo */
h-10 w-40
Click → /tabs/dashboard

/* Theme Button */
p-3 (mobile - 44px touch target)
rounded-lg
bg-gray-100 hover:bg-gray-200

/* Hamburger */
p-3 (mobile - 48px touch target)
w-6 h-6 icon
```

### Color Values

```css
Background: rgba(255, 255, 255, 0.95)
Border: #e5e7eb (gray-200)
Button bg: #f3f4f6 (gray-100)
Button hover: #e5e7eb (gray-200)
Button text: #374151 (gray-700)
Button hover text: #111827 (gray-900)
```

### Files to Create/Modify

**Create**:
- `src/components/core/HeaderNavigation.vue`

**Copy from Web**:
- `src/components/core/HamburgerMenu.vue`

**Modify**:
- `src/App.vue` (add HeaderNavigation)
- All page files (remove ion-header)

**Add CSS**:
- `src/theme/utilities.css` (safe area classes)

---

## 13. Differences Summary

### Layout

| Aspect | Web App | Mobile Ionic | Notes |
|--------|---------|--------------|-------|
| **Component** | `<header>` | `<header>` | Same - NO ion-header |
| **Logo** | `/tapey.svg` | `/images/tapey.svg` | Path may differ |
| **Navigation** | `<NuxtLink>` | `@click="router.push()"` | Use Vue Router |
| **Theme button** | Inline | Inline | Same - no separate component |
| **Hamburger** | Component | Component | Same - copy from web |

### Styling

| Aspect | Web Value | Mobile Value | Change |
|--------|-----------|--------------|--------|
| **Theme button padding** | `p-2` (36px) | `p-3` (44px) | Increase for touch target |
| **Hamburger padding** | `p-2` (40px) | `p-3` (48px) | Increase for touch target |
| **Safe area** | N/A | `env(safe-area-inset-top)` | Add for iOS notch |
| **Storage** | `localStorage` | `Capacitor.Preferences` | Use native storage |

### Key Takeaway

The header is **90% identical** to web app. Only changes:
1. Increase button padding for mobile touch targets
2. Add safe area insets for iOS notch
3. Use Capacitor Storage instead of localStorage
4. Copy HamburgerMenu component as-is

---

**Success Criteria**: When you compare screenshots side-by-side, the mobile header should be **visually indistinguishable** from the web app header at https://songwars.io (when logged in).

