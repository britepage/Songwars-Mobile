# FooterNavigation Component - Complete Documentation

## Overview
This document provides the **complete code** for the FooterNavigation component with exact role-based visibility, Add Song button specs, icons, and active states for mobile app replication.

---

## 1. Complete Component Code

### Location
**File**: `components/FooterNavigation.vue`

### Full Template (Lines 1-72)
```vue
<template>
  <footer v-if="isAuthenticated" class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
    <div class="flex items-center justify-around px-4 py-3">
      <!-- Battle Icon -->
      <button
        @click="goToBattle"
        class="flex flex-col items-center space-y-1 p-2 transition-colors bg-transparent"
        :class="{ 'text-[#ffd200]': isBattleActive, 'text-gray-600 hover:text-gray-800': !isBattleActive }"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span class="text-xs font-medium" :class="{ 'text-[#ffd200]': isBattleActive, 'text-gray-600': !isBattleActive }">Battle</span>
      </button>

      <!-- Leaderboard Icon -->
      <button
        @click="goToLeaderboard"
        class="flex flex-col items-center space-y-1 p-2 transition-colors bg-transparent"
        :class="{ 'text-[#ffd200]': isLeaderboardActive, 'text-gray-600 hover:text-gray-800': !isLeaderboardActive }"
      >
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span class="text-xs font-medium" :class="{ 'text-[#ffd200]': isLeaderboardActive, 'text-gray-600': !isLeaderboardActive }">Leaderboard</span>
      </button>

      <!-- Add Song Button (Centered +) -->
      <button
        v-if="profileStore.profile?.role === 'artist'"
        @click="goToUpload"
        class="flex flex-col items-center space-y-1 p-2 rounded-lg transition-all transform hover:scale-110"
        :class="{ 'scale-110': isUploadActive }"
      >
        <div class="w-12 h-12 bg-[#ffd200] rounded-full flex items-center justify-center shadow-lg border-2 border-black">
          <svg class="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
        </div>
        <span class="text-xs font-medium" :class="{ 'text-[#ffd200]': isUploadActive, 'text-gray-600': !isUploadActive }">Add Song</span>
      </button>

      <!-- My Songs Icon -->
      <button
        v-if="profileStore.profile?.role === 'artist'"
        @click="goToMySongs"
        class="flex flex-col items-center space-y-1 p-2 transition-colors bg-transparent"
        :class="{ 'text-[#ffd200]': isMySongsActive, 'text-gray-600 hover:text-gray-800': !isMySongsActive }"
      >
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
        <span class="text-xs font-medium" :class="{ 'text-[#ffd200]': isMySongsActive, 'text-gray-600': !isMySongsActive }">My Songs</span>
      </button>

      <!-- Profile Icon -->
      <button
        @click="goToProfile"
        class="flex flex-col items-center space-y-1 p-2 transition-colors bg-transparent"
        :class="{ 'text-[#ffd200]': isProfileActive, 'text-gray-600 hover:text-gray-800': !isProfileActive }"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span class="text-xs font-medium" :class="{ 'text-[#ffd200]': isProfileActive, 'text-gray-600': !isProfileActive }">Account</span>
      </button>
    </div>

    <!-- Bottom padding for safe area on mobile -->
    <div class="h-2 md:h-0"></div>
  </footer>
</template>
```

### Full Script Section (Lines 74-123)
```typescript
<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '~/store/authStore'
import { useProfileStore } from '~/store/profileStore'
// Leaderboard store import removed - now using direct navigation

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const profileStore = useProfileStore()
// Leaderboard store removed - now using direct navigation

// Fetch profile on mount to ensure footer has role data for conditional rendering
onMounted(async () => {
  if (authStore.authenticatedUser) {
    await profileStore.fetchProfile()
  }
})

// Computed properties for active states
const isAuthenticated = computed(() => authStore.authenticatedUser)
const isBattleActive = computed(() => route.path === '/dashboard' && !route.query.section)
const isProfileActive = computed(() => route.path === '/account')
const isLeaderboardActive = computed(() => route.path === '/leaderboard')

const isMySongsActive = computed(() => route.path.includes('/my-songs'))
const isUploadActive = computed(() => route.path === '/dashboard' && route.query.section === 'upload')

// Navigation functions
const goToBattle = () => {
  router.push('/dashboard')
}

const goToLeaderboard = () => {
  router.push('/leaderboard')
}

const goToUpload = () => {
  router.push('/dashboard?section=upload')
}

const goToMySongs = () => {
  router.push('/my-songs')
}

const goToProfile = () => {
  router.push('/account')
}
</script>
```

### Full Styles Section (Lines 125-132)
```css
<style scoped>
/* Safe area for mobile devices */
@media (max-width: 768px) {
  .h-2 {
    height: env(safe-area-inset-bottom, 0.5rem);
  }
}
</style>
```

---

## 2. Role-Based Visibility Logic

### Artist-Only Buttons

**Add Song Button** (Line 30):
```vue
<button
  v-if="profileStore.profile?.role === 'artist'"
  @click="goToUpload"
  ...
>
```

**My Songs Tab** (Line 45):
```vue
<button
  v-if="profileStore.profile?.role === 'artist'"
  @click="goToMySongs"
  ...
>
```

### Role Field Details

| Field | Location | Type | Values |
|-------|----------|------|--------|
| `profile.role` | `profileStore.profile.role` | string | `'artist'` or `'fan'` |

### How Role is Accessed

```typescript
// Import profile store
import { useProfileStore } from '~/store/profileStore'

// Access in setup
const profileStore = useProfileStore()

// Fetch profile on mount (CRITICAL for role data)
onMounted(async () => {
  if (authStore.authenticatedUser) {
    await profileStore.fetchProfile() // This loads profile.role
  }
})

// Use in template
v-if="profileStore.profile?.role === 'artist'"
```

### Visibility Matrix

| User Role | Battle Tab | Leaderboard Tab | Add Song Button | My Songs Tab | Account Tab |
|-----------|------------|-----------------|-----------------|--------------|-------------|
| **Fan** | ✅ Visible | ✅ Visible | ❌ Hidden | ❌ Hidden | ✅ Visible |
| **Artist** | ✅ Visible | ✅ Visible | ✅ Visible | ✅ Visible | ✅ Visible |
| **Unauthenticated** | ❌ Footer hidden | ❌ Footer hidden | ❌ Footer hidden | ❌ Footer hidden | ❌ Footer hidden |

### Layout Changes by Role

**Fan Layout** (3 tabs):
```
┌──────────────────────────────────────────┐
│  [Battle]    [Leaderboard]    [Account]  │
└──────────────────────────────────────────┘
```

**Artist Layout** (5 tabs):
```
┌────────────────────────────────────────────────────────┐
│  [Battle] [Leaderboard] [+ Add Song] [My Songs] [Account] │
└────────────────────────────────────────────────────────┘
```

---

## 3. Add Song Button Details

### Exact Specifications

**Button Wrapper** (Lines 29-34):
```vue
<button
  v-if="profileStore.profile?.role === 'artist'"
  @click="goToUpload"
  class="flex flex-col items-center space-y-1 p-2 rounded-lg transition-all transform hover:scale-110"
  :class="{ 'scale-110': isUploadActive }"
>
```

**Circle Container** (Line 35):
```vue
<div class="w-12 h-12 bg-[#ffd200] rounded-full flex items-center justify-center shadow-lg border-2 border-black">
```

### Sizing
| Element | Class | Size | Pixels |
|---------|-------|------|--------|
| Button circle | `w-12 h-12` | 3rem × 3rem | 48px × 48px |
| Icon | `w-6 h-6` | 1.5rem × 1.5rem | 24px × 24px |
| Button padding | `p-2` | 0.5rem | 8px |

### Colors
| Element | Color | Hex Code |
|---------|-------|----------|
| Circle background | `bg-[#ffd200]` | #ffd200 (Brand yellow) |
| Circle border | `border-2 border-black` | #000000 (2px solid) |
| Icon | `text-black` | #000000 |
| Label (active) | `text-[#ffd200]` | #ffd200 |
| Label (inactive) | `text-gray-600` | #4b5563 |

### Positioning & Styling
```css
/* Circle container */
w-12 h-12              /* 48px × 48px */
bg-[#ffd200]           /* Yellow background */
rounded-full           /* Perfect circle */
flex items-center      /* Center content */
justify-center
shadow-lg              /* Large shadow */
border-2 border-black  /* 2px black border */

/* Button wrapper */
flex flex-col          /* Vertical layout */
items-center           /* Horizontally center */
space-y-1              /* 4px gap between icon and label */
p-2                    /* 8px padding */
rounded-lg             /* Rounded corners */
transition-all         /* Smooth transitions */
transform              /* Enable transforms */
hover:scale-110        /* 10% larger on hover */
```

### Active State
When active (on upload section):
```vue
:class="{ 'scale-110': isUploadActive }"
```
- Button permanently scaled 110%
- Label turns yellow: `text-[#ffd200]`

### Navigation Target

**Route**: `/dashboard?section=upload`

```typescript
const goToUpload = () => {
  router.push('/dashboard?section=upload')
}
```

**How It Works**:
1. Navigate to `/dashboard` with query param `section=upload`
2. Dashboard page watches `route.query.section`
3. If `section === 'upload'`, shows upload component
4. If no section query, shows battle component

**Dashboard Logic** (from `pages/dashboard.vue`):
```typescript
const activeSection = ref('battle');

// Watch for URL query parameter changes
watch(() => route.query.section, (newSection) => {
  if (newSection === 'upload') {
    activeSection.value = 'upload';
  } else {
    activeSection.value = 'battle';
  }
}, { immediate: true });
```

**Template** (from `pages/dashboard.vue`):
```vue
<!-- Battle Section -->
<div v-if="activeSection === 'battle'" class="flex flex-col">
  <!-- BattleAnimation component -->
</div>

<!-- Upload Section -->
<div v-if="activeSection === 'upload'" class="h-full overflow-y-auto">
  <SongUploader @upload-complete="handleUploadComplete" />
</div>
```

**Key Point**: It's NOT a modal or separate page - it switches sections within the same dashboard page.

---

## 4. Icon Details

### All Icons with Exact SVG Paths

#### Battle Icon (Bar Chart)
**Lines 10-12**
```svg
<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
</svg>
```
**Description**: Three vertical bars of different heights (like a bar chart/stats icon)

#### Leaderboard Icon (Star)
**Lines 22-24**
```svg
<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
</svg>
```
**Description**: Five-pointed star (filled)

#### Add Song Icon (Plus)
**Lines 36-38**
```svg
<svg class="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
</svg>
```
**Description**: Plus sign (+) - vertical and horizontal lines

#### My Songs Icon (Music Note)
**Lines 50-52**
```svg
<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
</svg>
```
**Description**: Musical note with circle at bottom

#### Account Icon (Person)
**Lines 62-64**
```svg
<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
</svg>
```
**Description**: Person silhouette (circle head + body outline)

### Icon Source

**Not from a library** - These are custom SVG paths, not from an icon library like Heroicons or Ionicons.

**For mobile**: You can either:
1. Copy the exact SVG paths above
2. Use Ionicons equivalents that look similar:
   - Battle → `bar-chart-outline`
   - Leaderboard → `star`
   - Add Song → `add`
   - My Songs → `musical-notes`
   - Account → `person-outline`

---

## 5. Active State Styling

### Color System

| State | Icon Color | Label Color | Hex Code |
|-------|------------|-------------|----------|
| **Active** | `text-[#ffd200]` | `text-[#ffd200]` | #ffd200 (Brand yellow) |
| **Inactive** | `text-gray-600` | `text-gray-600` | #4b5563 (Gray) |
| **Inactive Hover** | `hover:text-gray-800` | — | #1f2937 (Darker gray) |

### Active State Logic

**Battle Tab** (Line 96):
```typescript
const isBattleActive = computed(() => 
  route.path === '/dashboard' && !route.query.section
)
```
- Active when: On `/dashboard` AND no `section` query param
- Inactive when: On `/dashboard?section=upload` (has query)

**Leaderboard Tab** (Line 98):
```typescript
const isLeaderboardActive = computed(() => 
  route.path === '/leaderboard'
)
```
- Active when: Exact path match `/leaderboard`

**Upload Button** (Line 101):
```typescript
const isUploadActive = computed(() => 
  route.path === '/dashboard' && route.query.section === 'upload'
)
```
- Active when: On `/dashboard` AND `section=upload` query param

**My Songs Tab** (Line 100):
```typescript
const isMySongsActive = computed(() => 
  route.path.includes('/my-songs')
)
```
- Active when: Path includes `/my-songs`

**Account Tab** (Line 97):
```typescript
const isProfileActive = computed(() => 
  route.path === '/account'
)
```
- Active when: Exact path match `/account`

### CSS Classes Applied

**Icon & Label** (Example: Battle button, Lines 8-13):
```vue
<button
  class="flex flex-col items-center space-y-1 p-2 transition-colors bg-transparent"
  :class="{ 'text-[#ffd200]': isBattleActive, 'text-gray-600 hover:text-gray-800': !isBattleActive }"
>
  <svg class="w-6 h-6" ...></svg>
  <span class="text-xs font-medium" :class="{ 'text-[#ffd200]': isBattleActive, 'text-gray-600': !isBattleActive }">Battle</span>
</button>
```

**Active state CSS**:
- Icon + Label: `text-[#ffd200]` (yellow)
- No hover changes when active

**Inactive state CSS**:
- Icon + Label: `text-gray-600` (gray)
- Hover: `hover:text-gray-800` (darker gray)

### Add Song Button Active State

**Different from tabs** - Uses scale transform:
```vue
:class="{ 'scale-110': isUploadActive }"
```
- Active: Button scaled to 110% permanently
- Hover: `hover:scale-110` (same effect)
- Label also turns yellow when active

---

## 6. Navigation Methods

### All Navigation Functions (Lines 104-122)

```typescript
// Navigate to battle section (dashboard home)
const goToBattle = () => {
  router.push('/dashboard')
}

// Navigate to leaderboard page
const goToLeaderboard = () => {
  router.push('/leaderboard')
}

// Navigate to upload section on dashboard
const goToUpload = () => {
  router.push('/dashboard?section=upload')
}

// Navigate to my songs page
const goToMySongs = () => {
  router.push('/my-songs')
}

// Navigate to account page
const goToProfile = () => {
  router.push('/account')
}
```

### Navigation Summary

| Tab | Method | Route | Page |
|-----|--------|-------|------|
| Battle | `goToBattle()` | `/dashboard` | Dashboard (battle section) |
| Leaderboard | `goToLeaderboard()` | `/leaderboard` | Leaderboard page |
| Add Song | `goToUpload()` | `/dashboard?section=upload` | Dashboard (upload section) |
| My Songs | `goToMySongs()` | `/my-songs` | My Songs page |
| Account | `goToProfile()` | `/account` | Account page |

### Route Matching for Active States

| Route | Active Tab |
|-------|------------|
| `/dashboard` | Battle |
| `/dashboard?section=upload` | Add Song |
| `/leaderboard` | Leaderboard |
| `/my-songs` | My Songs |
| `/account` | Account |

---

## 7. Layout & Positioning

### Footer Container (Line 2)
```vue
<footer v-if="isAuthenticated" class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
```

**Styles Breakdown**:
```css
v-if="isAuthenticated"    /* Only show for logged-in users */
fixed                     /* Fixed positioning */
bottom-0 left-0 right-0   /* Stick to bottom, full width */
z-50                      /* High z-index (above most content) */
bg-white                  /* White background */
border-t                  /* Top border only */
border-gray-200           /* Light gray border (#e5e7eb) */
```

### Inner Container (Line 3)
```vue
<div class="flex items-center justify-around px-4 py-3">
```

**Styles Breakdown**:
```css
flex                      /* Flexbox layout */
items-center              /* Vertically center items */
justify-around            /* Equal space around each item */
px-4                      /* Horizontal padding: 16px */
py-3                      /* Vertical padding: 12px */
```

### Button Layout (Example: Line 5-14)
```vue
<button class="flex flex-col items-center space-y-1 p-2 transition-colors bg-transparent">
```

**Styles Breakdown**:
```css
flex flex-col             /* Vertical flexbox (icon above label) */
items-center              /* Horizontally center contents */
space-y-1                 /* 4px vertical gap between icon and label */
p-2                       /* 8px padding all around */
transition-colors         /* Smooth color transitions */
bg-transparent            /* No background color */
```

### Safe Area Insets (Lines 70, 127-131)

**Template**:
```vue
<!-- Bottom padding for safe area on mobile -->
<div class="h-2 md:h-0"></div>
```

**Styles**:
```css
@media (max-width: 768px) {
  .h-2 {
    height: env(safe-area-inset-bottom, 0.5rem);
  }
}
```

**Purpose**: Accounts for iOS home indicator and Android navigation bars

**Behavior**:
- Mobile: Uses `env(safe-area-inset-bottom)` or fallback to 0.5rem (8px)
- Desktop (`md:h-0`): No extra padding

### Z-Index Hierarchy

| Element | Z-Index | Purpose |
|---------|---------|---------|
| Footer | `z-50` | Above most content |
| Modal backdrop | `z-40` (elsewhere) | Below footer |
| Modals | `z-50+` (elsewhere) | Above footer |

---

## 8. Mobile Ionic Conversion

### Replace with Ionic Tab Bar

```vue
<template>
  <ion-tabs>
    <ion-router-outlet></ion-router-outlet>
    
    <ion-tab-bar slot="bottom" class="custom-footer">
      <!-- Battle Tab -->
      <ion-tab-button tab="battle" href="/tabs/dashboard">
        <ion-icon :icon="barChart" />
        <ion-label>Battle</ion-label>
      </ion-tab-button>

      <!-- Leaderboard Tab -->
      <ion-tab-button tab="leaderboard" href="/tabs/leaderboard">
        <ion-icon :icon="star" />
        <ion-label>Leaderboard</ion-label>
      </ion-tab-button>

      <!-- Add Song Button (Custom Overlay) -->
      <ion-tab-button 
        v-if="profileStore.profile?.role === 'artist'"
        tab="upload" 
        href="/tabs/dashboard?section=upload"
        class="add-song-tab"
      >
        <div class="add-song-button">
          <ion-icon :icon="add" class="add-icon" />
        </div>
        <ion-label>Add Song</ion-label>
      </ion-tab-button>

      <!-- My Songs Tab -->
      <ion-tab-button 
        v-if="profileStore.profile?.role === 'artist'"
        tab="my-songs" 
        href="/tabs/my-songs"
      >
        <ion-icon :icon="musicalNotes" />
        <ion-label>My Songs</ion-label>
      </ion-tab-button>

      <!-- Account Tab -->
      <ion-tab-button tab="account" href="/tabs/account">
        <ion-icon :icon="person" />
        <ion-label>Account</ion-label>
      </ion-tab-button>
    </ion-tab-bar>
  </ion-tabs>
</template>

<script setup lang="ts">
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/vue';
import { barChart, star, add, musicalNotes, person } from 'ionicons/icons';
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';

const authStore = useAuthStore();
const profileStore = useProfileStore();

onMounted(async () => {
  if (authStore.authenticatedUser) {
    await profileStore.fetchProfile();
  }
});
</script>

<style scoped>
/* Custom footer styling */
.custom-footer {
  --background: white;
  --border: 1px solid #e5e7eb; /* gray-200 */
  --color: #4b5563; /* gray-600 */
  --color-selected: #ffd200; /* Brand yellow */
}

/* Add Song button special styling */
.add-song-tab {
  position: relative;
}

.add-song-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #ffd200;
  border: 2px solid #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: scale(1);
  transition: transform 0.2s;
}

.add-song-tab[aria-selected="true"] .add-song-button,
.add-song-button:hover {
  transform: scale(1.1);
}

.add-icon {
  color: #000000;
  font-size: 24px;
}

/* Safe area handling */
ion-tab-bar {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
```

### Ionic Icon Equivalents

```typescript
import {
  barChart,        // Battle (bar chart)
  star,            // Leaderboard (star)
  add,             // Add Song (plus)
  musicalNotes,    // My Songs (music notes)
  person           // Account (person outline)
} from 'ionicons/icons';
```

### Key Differences: Web vs Ionic

| Aspect | Web App | Ionic Mobile |
|--------|---------|--------------|
| **Container** | `<footer>` | `<ion-tab-bar>` |
| **Buttons** | `<button>` | `<ion-tab-button>` |
| **Icons** | Custom SVG | `<ion-icon :icon="...">` |
| **Navigation** | `router.push()` | `href="/tabs/..."` |
| **Active state** | Manual computed properties | Automatic via `aria-selected` |
| **Layout** | Flexbox with `justify-around` | Automatic tab spacing |

### Preserving Exact Styling

**Colors**:
```css
--color: #4b5563;           /* Inactive: gray-600 */
--color-selected: #ffd200;  /* Active: brand yellow */
--background: white;
--border: 1px solid #e5e7eb; /* gray-200 */
```

**Add Song Button**:
```css
width: 48px;
height: 48px;
border-radius: 50%;
background-color: #ffd200;
border: 2px solid #000000;
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

**Hover/Active**:
```css
transform: scale(1.1); /* 10% larger */
```

---

## 9. Implementation Checklist

### Profile Loading
- [ ] Fetch profile in `onMounted()` before rendering footer
- [ ] Check `authStore.authenticatedUser` before fetching
- [ ] Await `profileStore.fetchProfile()` to ensure role is loaded

### Role-Based Visibility
- [ ] Hide footer entirely if user not authenticated
- [ ] Show Add Song button only if `profile.role === 'artist'`
- [ ] Show My Songs tab only if `profile.role === 'artist'`
- [ ] Always show Battle, Leaderboard, and Account tabs

### Navigation
- [ ] Battle tab → `/dashboard` (or `/tabs/dashboard` on mobile)
- [ ] Leaderboard tab → `/leaderboard`
- [ ] Add Song → `/dashboard?section=upload`
- [ ] My Songs → `/my-songs`
- [ ] Account → `/account`

### Active States
- [ ] Battle active when path is `/dashboard` without query params
- [ ] Upload active when path is `/dashboard?section=upload`
- [ ] Leaderboard active when path is `/leaderboard`
- [ ] My Songs active when path includes `/my-songs`
- [ ] Account active when path is `/account`

### Styling
- [ ] Active tab color: `#ffd200` (yellow)
- [ ] Inactive tab color: `#4b5563` (gray-600)
- [ ] Add Song button: 48px circle, yellow background, black border
- [ ] Add Song button hover/active: scale 110%
- [ ] Footer background: white
- [ ] Footer border-top: 1px solid #e5e7eb
- [ ] Safe area insets: `env(safe-area-inset-bottom)`

### Icons
- [ ] Battle: Bar chart icon (3 vertical bars)
- [ ] Leaderboard: Star icon (filled)
- [ ] Add Song: Plus icon (+)
- [ ] My Songs: Music note icon
- [ ] Account: Person icon
- [ ] Icon size: 24px × 24px (`w-6 h-6`)

---

## 10. Testing Scenarios

### Test as Fan
1. Sign in as fan (role = 'fan')
2. ✅ Footer shows: Battle, Leaderboard, Account (3 tabs)
3. ✅ Add Song button hidden
4. ✅ My Songs tab hidden
5. ✅ Click Battle → Navigate to dashboard
6. ✅ Click Leaderboard → Navigate to leaderboard
7. ✅ Click Account → Navigate to account

### Test as Artist
1. Sign in as artist (role = 'artist')
2. ✅ Footer shows: Battle, Leaderboard, Add Song, My Songs, Account (5 tabs)
3. ✅ Add Song button visible (yellow circle)
4. ✅ My Songs tab visible
5. ✅ Click Add Song → Navigate to upload section
6. ✅ Check active state shows yellow
7. ✅ Click My Songs → Navigate to my-songs page

### Test Active States
1. Navigate to `/dashboard`
2. ✅ Battle tab is yellow (active)
3. Navigate to `/dashboard?section=upload`
4. ✅ Add Song button scaled up and yellow (active)
5. Navigate to `/leaderboard`
6. ✅ Leaderboard tab is yellow (active)
7. Navigate to `/my-songs`
8. ✅ My Songs tab is yellow (active)
9. Navigate to `/account`
10. ✅ Account tab is yellow (active)

### Test Hover States
1. Hover over inactive tab
2. ✅ Color changes to darker gray (#1f2937)
3. Hover over Add Song button
4. ✅ Button scales to 110%

---

## 11. Quick Reference

### Colors
- **Active**: `#ffd200` (yellow)
- **Inactive**: `#4b5563` (gray-600)
- **Inactive hover**: `#1f2937` (gray-800)
- **Footer background**: `#ffffff` (white)
- **Footer border**: `#e5e7eb` (gray-200)
- **Add Song circle**: `#ffd200` with `2px solid #000000`

### Sizes
- **Footer height**: Auto (py-3 = 12px vertical padding)
- **Tab icon**: 24px × 24px
- **Tab label**: 12px font-size (text-xs)
- **Add Song circle**: 48px × 48px
- **Add Song icon**: 24px × 24px

### Role Logic
```typescript
v-if="profileStore.profile?.role === 'artist'"
```

### Active State Logic
```typescript
route.path === '/dashboard' && !route.query.section  // Battle
route.path === '/dashboard' && route.query.section === 'upload'  // Upload
route.path === '/leaderboard'  // Leaderboard
route.path.includes('/my-songs')  // My Songs
route.path === '/account'  // Account
```

---

**Summary**: The footer is a fixed-bottom navigation bar with role-based visibility for artist-only buttons (Add Song, My Songs). The Add Song button is a centered yellow circle that navigates to the upload section via query param, not a modal or separate page.

