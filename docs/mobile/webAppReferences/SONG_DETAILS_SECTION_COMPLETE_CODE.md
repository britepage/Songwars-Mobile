# Song Details Section - Complete Implementation Code

**Document Purpose**: This document provides the EXACT Song Details section implementation from the production web app, ready for direct copy-paste into mobile app.

**Last Updated**: January 2025  
**Web App File Referenced**:
- `components/dashboard/songUploader.vue` (lines 73-124, 359-440)

---

## Complete Vue Template

**Copy-paste ready template for Song Details section:**

```vue
<!-- Song Details Section -->
<div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
  <h3 class="text-lg font-semibold theme-text-primary mb-6 flex items-center">
    <svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
    </svg>
    Song Details
  </h3>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Song Title -->
    <div class="md:col-span-2">
      <label class="block text-sm font-medium theme-text-secondary mb-2">Song Title</label>
      <input
        type="text"
        v-model="songTitle"
        placeholder="Enter song title"
        class="w-full px-4 py-3 theme-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all"
      />
    </div>
    
    <!-- Artist Name -->
    <div>
      <label class="block text-sm font-medium theme-text-secondary mb-2">Artist Name</label>
      <input
        type="text"
        v-model="songArtist"
        placeholder="Enter artist name"
        class="w-full px-4 py-3 theme-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all"
      />
    </div>
    
    <!-- Genre -->
    <div>
      <label class="block text-sm font-medium theme-text-secondary mb-2">Genre</label>
      <select
        v-model="songGenre"
        class="w-full px-4 py-3 theme-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all appearance-none cursor-pointer"
      >
        <option value="" disabled class="theme-bg-card">Select Genre</option>
        <option 
          v-for="genre in genres" 
          :key="genre" 
          :value="genre" 
          class="theme-bg-card theme-text-primary"
        >
          {{ genre }}{{ isBattleReady(genre) ? ' ●' : ' ○' }}
        </option>
      </select>
    </div>
  </div>
</div>
```

---

## Complete Script Implementation

### Required Imports

```typescript
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import { MASTER_GENRES } from '~/utils/genres'
```

### State Declarations

```typescript
// Form fields
const songTitle = ref('')
const songArtist = ref('')
const songGenre = ref('')

// Genre list and battle-ready tracking
const genres = MASTER_GENRES
const battleReadyGenres = ref<string[]>([])
```

### Supabase Client

```typescript
const supabase = useSupabaseClient()
```

### Fetch Battle-Ready Genres Function

```typescript
const fetchBattleReadyGenres = async () => {
  try {
    const { data, error } = await supabase.rpc('get_battle_available_genres')
    
    if (error) {
      console.error('Error fetching battle-ready genres:', error)
      battleReadyGenres.value = []
      return
    }
    
    // Extract genre strings from the returned objects
    battleReadyGenres.value = data?.map((item: any) => item.genre) || []
  } catch (error) {
    console.error('Error fetching battle-ready genres:', error)
    battleReadyGenres.value = []
  }
}
```

### Check Battle-Ready Function

```typescript
const isBattleReady = (genre: string) => {
  return battleReadyGenres.value.includes(genre)
}
```

### Lifecycle Hook

```typescript
onMounted(() => {
  fetchBattleReadyGenres()
})
```

---

## Musical Note SVG Icon

**Copy-paste ready SVG for section header:**

```xml
<svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
</svg>
```

**Attributes**:
- `class="w-5 h-5 mr-2 text-[#ffd200]"` - 20px × 20px, yellow color
- `fill="none"` - Outline style
- `stroke="currentColor"` - Uses text color (#ffd200)
- `viewBox="0 0 24 24"` - Coordinate system
- `stroke-width="2"` - 2px stroke

---

## Complete CSS Classes Reference

### Card Container

```css
rounded-2xl p-6 border theme-bg-card theme-border-card
```

- `rounded-2xl` - 16px border radius
- `p-6` - 24px padding all sides
- `border` - 1px border
- `theme-bg-card` - Theme-aware background
- `theme-border-card` - Theme-aware border color

### Section Header

```css
text-lg font-semibold theme-text-primary mb-6 flex items-center
```

- `text-lg` - 18px font size
- `font-semibold` - 600 font weight
- `theme-text-primary` - Primary text color
- `mb-6` - 24px bottom margin
- `flex items-center` - Horizontal layout with vertical centering

### Header Icon

```css
w-5 h-5 mr-2 text-[#ffd200]
```

- `w-5 h-5` - 20px × 20px
- `mr-2` - 8px right margin
- `text-[#ffd200]` - Yellow color

### Form Grid

```css
grid grid-cols-1 md:grid-cols-2 gap-6
```

- `grid` - CSS Grid layout
- `grid-cols-1` - 1 column on mobile
- `md:grid-cols-2` - 2 columns at md breakpoint
- `gap-6` - 24px gap between items

### Song Title Container

```css
md:col-span-2
```

- Spans 2 columns on tablet/desktop (full width)
- 1 column on mobile (default)

### Input Labels

```css
block text-sm font-medium theme-text-secondary mb-2
```

- `block` - Block display
- `text-sm` - 14px font size
- `font-medium` - 500 font weight
- `theme-text-secondary` - Secondary text color
- `mb-2` - 8px bottom margin

### Input Fields (Text and Select)

```css
w-full px-4 py-3 theme-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all
```

- `w-full` - 100% width
- `px-4` - 16px horizontal padding
- `py-3` - 12px vertical padding
- `theme-input` - Theme-aware input background
- `border` - 1px border
- `rounded-lg` - 8px border radius
- `focus:outline-none` - No outline on focus
- `focus:ring-2` - 2px focus ring
- `focus:ring-[#ffd200]` - Yellow focus ring
- `focus:border-transparent` - Hide border on focus
- `transition-all` - Smooth transitions

### Select Additional Classes

```css
appearance-none cursor-pointer
```

- `appearance-none` - Remove native dropdown arrow
- `cursor-pointer` - Pointer cursor

### Select Options

```css
class="theme-bg-card theme-text-primary"
```

- `theme-bg-card` - Theme-aware background
- `theme-text-primary` - Primary text color

---

## Complete Working Component

**Full component with all code combined:**

```vue
<template>
  <!-- Song Details Section -->
  <div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
    <h3 class="text-lg font-semibold theme-text-primary mb-6 flex items-center">
      <svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
      </svg>
      Song Details
    </h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Song Title -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium theme-text-secondary mb-2">Song Title</label>
        <input
          type="text"
          v-model="songTitle"
          placeholder="Enter song title"
          class="w-full px-4 py-3 theme-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all"
        />
      </div>
      
      <!-- Artist Name -->
      <div>
        <label class="block text-sm font-medium theme-text-secondary mb-2">Artist Name</label>
        <input
          type="text"
          v-model="songArtist"
          placeholder="Enter artist name"
          class="w-full px-4 py-3 theme-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all"
        />
      </div>
      
      <!-- Genre -->
      <div>
        <label class="block text-sm font-medium theme-text-secondary mb-2">Genre</label>
        <select
          v-model="songGenre"
          class="w-full px-4 py-3 theme-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all appearance-none cursor-pointer"
        >
          <option value="" disabled class="theme-bg-card">Select Genre</option>
          <option 
            v-for="genre in genres" 
            :key="genre" 
            :value="genre" 
            class="theme-bg-card theme-text-primary"
          >
            {{ genre }}{{ isBattleReady(genre) ? ' ●' : ' ○' }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import { MASTER_GENRES } from '~/utils/genres'

// Form fields
const songTitle = ref('')
const songArtist = ref('')
const songGenre = ref('')

// Genre list and battle-ready tracking
const genres = MASTER_GENRES
const battleReadyGenres = ref<string[]>([])

// Supabase client
const supabase = useSupabaseClient()

// Fetch battle-ready genres
const fetchBattleReadyGenres = async () => {
  try {
    const { data, error } = await supabase.rpc('get_battle_available_genres')
    
    if (error) {
      console.error('Error fetching battle-ready genres:', error)
      battleReadyGenres.value = []
      return
    }
    
    // Extract genre strings from the returned objects
    battleReadyGenres.value = data?.map((item: any) => item.genre) || []
  } catch (error) {
    console.error('Error fetching battle-ready genres:', error)
    battleReadyGenres.value = []
  }
}

// Check if genre is battle-ready
const isBattleReady = (genre: string) => {
  return battleReadyGenres.value.includes(genre)
}

// Fetch battle-ready genres on mount
onMounted(() => {
  fetchBattleReadyGenres()
})
</script>
```

---

## Required Dependencies

### NPM Packages

```json
{
  "dependencies": {
    "vue": "^3.5.13",
    "@supabase/supabase-js": "^2.50.0"
  }
}
```

### Imports Required

```typescript
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import { MASTER_GENRES } from '~/utils/genres'
```

### Files Needed

**1. utils/genres.ts**

Must export `MASTER_GENRES` array:

```typescript
export const MASTER_GENRES = [
  'Rock',
  'Pop',
  'Hip-Hop',
  'Electronic',
  'Jazz',
  'Classical',
  'Country',
  'R&B',
  'Folk',
  'Metal',
  'Funk',
  'Blues',
  'Reggae',
  'Latin',
  'Alternative'
]
```

**2. Supabase Configuration**

Must have `get_battle_available_genres` RPC function available.

---

## Implementation Notes

### Theme Classes

The following classes require theme support (light/dark mode):

- `theme-bg-card` - Card background color
- `theme-border-card` - Card border color
- `theme-text-primary` - Primary text color
- `theme-text-secondary` - Secondary text color
- `theme-input` - Input field background

**For Mobile Without Theme System**: Replace with specific colors:
- `theme-bg-card` → `bg-white` (light) or `bg-gray-800` (dark)
- `theme-border-card` → `border-gray-200` (light) or `border-gray-700` (dark)
- `theme-text-primary` → `text-black` (light) or `text-white` (dark)
- `theme-text-secondary` → `text-gray-600` (light) or `text-gray-400` (dark)
- `theme-input` → `bg-white` (light) or `bg-gray-700` (dark)

### Responsive Behavior

**Mobile** (< 768px):
- All fields stack vertically (1 column)
- Song Title: Full width
- Artist Name: Full width
- Genre: Full width

**Tablet/Desktop** (≥ 768px):
- Grid becomes 2 columns
- Song Title: Spans both columns (full width)
- Artist Name: Left column
- Genre: Right column (side-by-side with Artist)

### Genre Indicators

**Unicode Characters**:
- `●` (U+25CF) - Filled circle for battle-ready genres
- `○` (U+25CB) - Empty circle for not-ready genres

**Logic**: Appended inline to genre name with space separator

---

## Ionic/Mobile Adaptations

### For Ionic Framework

**Replace `<select>` with `<ion-select>`:**

```vue
<ion-select
  v-model="songGenre"
  interface="action-sheet"
  placeholder="Select Genre"
>
  <ion-select-option 
    v-for="genre in genres" 
    :key="genre" 
    :value="genre"
  >
    {{ genre }}{{ isBattleReady(genre) ? ' ●' : ' ○' }}
  </ion-select-option>
</ion-select>
```

**Replace `<input>` with `<ion-input>`:**

```vue
<ion-input
  v-model="songTitle"
  placeholder="Enter song title"
  type="text"
></ion-input>
```

### Styling Adaptations for Ionic

**Card Container**:
```vue
<ion-card class="song-details-card">
  <!-- content -->
</ion-card>
```

**Custom CSS**:
```css
.song-details-card {
  border-radius: 16px;
  padding: 24px;
  margin: 0;
}
```

---

## Complete Code Blocks

### Template Only (Copy-Paste)

```vue
<div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
  <h3 class="text-lg font-semibold theme-text-primary mb-6 flex items-center">
    <svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
    </svg>
    Song Details
  </h3>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="md:col-span-2">
      <label class="block text-sm font-medium theme-text-secondary mb-2">Song Title</label>
      <input type="text" v-model="songTitle" placeholder="Enter song title" class="w-full px-4 py-3 theme-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all" />
    </div>
    
    <div>
      <label class="block text-sm font-medium theme-text-secondary mb-2">Artist Name</label>
      <input type="text" v-model="songArtist" placeholder="Enter artist name" class="w-full px-4 py-3 theme-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all" />
    </div>
    
    <div>
      <label class="block text-sm font-medium theme-text-secondary mb-2">Genre</label>
      <select v-model="songGenre" class="w-full px-4 py-3 theme-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all appearance-none cursor-pointer">
        <option value="" disabled class="theme-bg-card">Select Genre</option>
        <option v-for="genre in genres" :key="genre" :value="genre" class="theme-bg-card theme-text-primary">
          {{ genre }}{{ isBattleReady(genre) ? ' ●' : ' ○' }}
        </option>
      </select>
    </div>
  </div>
</div>
```

### Script Only (Copy-Paste)

```typescript
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import { MASTER_GENRES } from '~/utils/genres'

const songTitle = ref('')
const songArtist = ref('')
const songGenre = ref('')
const genres = MASTER_GENRES
const battleReadyGenres = ref<string[]>([])
const supabase = useSupabaseClient()

const fetchBattleReadyGenres = async () => {
  try {
    const { data, error } = await supabase.rpc('get_battle_available_genres')
    if (error) {
      console.error('Error fetching battle-ready genres:', error)
      battleReadyGenres.value = []
      return
    }
    battleReadyGenres.value = data?.map((item: any) => item.genre) || []
  } catch (error) {
    console.error('Error fetching battle-ready genres:', error)
    battleReadyGenres.value = []
  }
}

const isBattleReady = (genre: string) => {
  return battleReadyGenres.value.includes(genre)
}

onMounted(() => {
  fetchBattleReadyGenres()
})
```

---

## Quick Implementation Guide

### Step 1: Add Imports

```typescript
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import { MASTER_GENRES } from '~/utils/genres'
```

### Step 2: Add State

```typescript
const songTitle = ref('')
const songArtist = ref('')
const songGenre = ref('')
const genres = MASTER_GENRES
const battleReadyGenres = ref<string[]>([])
const supabase = useSupabaseClient()
```

### Step 3: Add Functions

```typescript
const fetchBattleReadyGenres = async () => {
  try {
    const { data, error } = await supabase.rpc('get_battle_available_genres')
    if (error) {
      console.error('Error fetching battle-ready genres:', error)
      battleReadyGenres.value = []
      return
    }
    battleReadyGenres.value = data?.map((item: any) => item.genre) || []
  } catch (error) {
    console.error('Error fetching battle-ready genres:', error)
    battleReadyGenres.value = []
  }
}

const isBattleReady = (genre: string) => {
  return battleReadyGenres.value.includes(genre)
}
```

### Step 4: Add Lifecycle Hook

```typescript
onMounted(() => {
  fetchBattleReadyGenres()
})
```

### Step 5: Add Template

Copy the complete template from the "Complete Working Component" section above.

---

## Contact & Questions

For questions about this implementation, refer to:
- **Web App Source**: `components/dashboard/songUploader.vue`
- **Lines**: 73-124 (template), 359-440 (script)

**Document Version**: 1.0  
**Created**: January 2025  
**For**: Mobile App Implementation Team

