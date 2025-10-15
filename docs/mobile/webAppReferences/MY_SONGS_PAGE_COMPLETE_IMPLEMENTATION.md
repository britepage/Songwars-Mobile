# My Songs (Active) Page - Complete Implementation Reference

**Document Version:** 1.0  
**Last Updated:** October 15, 2025  
**Purpose:** Complete implementation reference for My Songs page in mobile app for pixel-perfect parity with production web app

---

## Table of Contents

1. [Overview](#overview)
2. [Page Structure](#page-structure)
3. [Tab Navigation](#tab-navigation)
4. [Filters and Search](#filters-and-search)
5. [Song Card Component](#song-card-component)
6. [Audio Player System](#audio-player-system)
7. [Empty States](#empty-states)
8. [Modals](#modals)
9. [Data Queries and State Management](#data-queries-and-state-management)
10. [Visual Design System](#visual-design-system)
11. [Behavioral Details](#behavioral-details)
12. [Complete Code Files](#complete-code-files)

---

## Overview

The My Songs page allows users to view and manage their uploaded songs. It consists of two tabs:
- **Active Songs**: Shows non-deleted songs with full management capabilities
- **Trash**: Shows soft-deleted songs with restore/permanent delete options

### Key Features
- Tabbed navigation between Active and Trash
- Genre filtering and text search (title-based)
- Infinite scroll pagination (20 songs per batch)
- In-place song editing (title, artist, genre, clip start time)
- Soft delete with 10-day trash retention
- Hard delete with confirmation
- Real-time audio preview with progress ring
- Tag count indicators for flagged songs
- Moderation status indicators (under review, removed)

---

## Page Structure

### Main Container

**File:** `pages/my-songs.vue`

```vue
<template>
  <div class="min-h-screen p-4 md:p-8 bg-black theme-bg-primary">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center space-x-3">
          <!-- Yellow music icon circle -->
          <div class="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <div>
            <h1 class="text-2xl md:text-3xl font-bold text-white theme-text-primary">Your Songs</h1>
            <p class="text-gray-400 theme-text-secondary">Manage your uploaded tracks</p>
          </div>
        </div>
      </div>

      <!-- Song List Component (includes tabs, filters, cards) -->
      <SongList ref="songListRef" />
    </div>
  </div>
</template>
```

### Visual Specifications
- **Container Background:** `bg-black` with `theme-bg-primary` class
- **Max Width:** `max-w-6xl` (1152px)
- **Padding:** `p-4` on mobile, `md:p-8` on desktop
- **Header Icon:**
  - Size: `w-12 h-12` (48px)
  - Background: `bg-gradient-to-r from-yellow-400 to-yellow-500`
  - Border radius: `rounded-full`
  - Inner icon: `w-6 h-6` (24px), black color
- **Title Typography:**
  - Font size: `text-2xl` (24px) on mobile, `md:text-3xl` (30px) on desktop
  - Weight: `font-bold`
  - Color: `text-white` with `theme-text-primary`
- **Subtitle Typography:**
  - Color: `text-gray-400` with `theme-text-secondary`

---

## Tab Navigation

### HTML Structure

**File:** `components/dashboard/songList.vue` (lines 3-43)

```vue
<div class="mb-6 border-b border-gray-700">
  <nav class="flex space-x-8" role="tablist" aria-label="Song management tabs">
    <!-- Active Songs Tab -->
    <button
      id="active-tab"
      @click="activeTab = 'active'"
      @keydown="handleTabKeydown"
      :class="[
        'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
        activeTab === 'active'
          ? 'border-[#ffd200] text-[#ffd200]'
          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
      ]"
      role="tab"
      :aria-selected="activeTab === 'active'"
      :aria-controls="'active-songs-panel'"
      :aria-label="`Active Songs tab, ${isRefreshingFilters ? '0' : songStore.totalSongs} songs`"
      tabindex="0"
    >
      Active Songs {{ isRefreshingFilters ? '(0)' : `(${songStore.totalSongs})` }}
    </button>
    
    <!-- Trash Tab -->
    <button
      id="trash-tab"
      @click="activeTab = 'trash'"
      @keydown="handleTabKeydown"
      :class="[
        'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
        activeTab === 'trash'
          ? 'border-[#ffd200] text-[#ffd200]'
          : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
      ]"
      role="tab"
      :aria-selected="activeTab === 'trash'"
      :aria-controls="'trash-panel'"
      :aria-label="`Trash tab, ${songStore.trashedSongs.length} songs`"
      tabindex="0"
    >
      Trash ({{ songStore.trashedSongs.length }})
    </button>
  </nav>
</div>
```

### Visual Specifications

**Tabs Container:**
- Margin bottom: `mb-6` (24px)
- Border bottom: `border-b border-gray-700`

**Individual Tab Button:**
- Padding: `py-2 px-1` (vertical: 8px, horizontal: 4px)
- Border bottom: `border-b-2` (2px solid)
- Font: `font-medium text-sm` (14px, medium weight)
- Transition: `transition-colors`

**Active Tab:**
- Border color: `#ffd200` (yellow)
- Text color: `#ffd200` (yellow)

**Inactive Tab:**
- Border: `border-transparent`
- Text color: `text-gray-400`
- Hover text: `hover:text-gray-300`
- Hover border: `hover:border-gray-300`

**Tab Spacing:**
- Gap between tabs: `space-x-8` (32px)

### Keyboard Navigation

Tabs support full keyboard navigation:
- **Arrow Right/Down:** Move to next tab
- **Arrow Left/Up:** Move to previous tab
- **Home:** Jump to first tab
- **End:** Jump to last tab

---

## Filters and Search

### Genre Filter

**File:** `components/dashboard/songList.vue` (lines 54-76)

```vue
<div class="mb-6 flex items-center space-x-4">
  <label for="genre-filter" class="text-sm font-medium text-gray-300">Filter by Genre:</label>
  <select
    id="genre-filter"
    v-model="selectedGenre"
    @change="handleGenreChange"
    class="bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent"
  >
    <option value="">All Genres</option>
    <option v-for="genre in availableGenres" :key="genre" :value="genre">
      {{ genre }}
    </option>
  </select>
  
  <!-- Clear Filter Button (only show when filter is active) -->
  <button
    v-if="selectedGenre"
    @click="clearGenreFilter"
    class="text-xs text-gray-400 hover:text-white transition-colors"
  >
    Clear Filter
  </button>
</div>
```

### Search Input

**File:** `components/dashboard/songList.vue` (lines 78-106)

```vue
<div class="mb-6 flex items-center space-x-4">
  <label for="search-songs" class="text-sm font-medium text-gray-300">Search Songs:</label>
  <div class="relative flex-1 max-w-md">
    <input
      id="search-songs"
      v-model="searchQuery"
      @input="handleSearchInput"
      type="text"
      placeholder="Search by song title..."
      class="w-full bg-gray-800 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent"
    />
    <!-- Search Icon -->
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  </div>
  
  <!-- Clear Search Button (only show when search is active) -->
  <button
    v-if="searchQuery"
    @click="clearSearch"
    class="text-xs text-gray-400 hover:text-white transition-colors"
  >
    Clear Search
  </button>
</div>
```

### No Results Message

```vue
<div v-if="(selectedGenre || searchQuery) && !songStore.loadingSongs && songStore.songs.length === 0" class="mb-4 text-center">
  <div class="inline-flex items-center space-x-2 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-600/50">
    <span class="text-sm text-gray-400">
      No songs found matching your criteria
    </span>
    <button @click="clearAllFilters" class="text-xs text-[#ffd200] hover:text-[#e6bd00] underline">
      Clear all filters
    </button>
  </div>
</div>
```

### Visual Specifications

**Filter/Search Container:**
- Margin bottom: `mb-6` (24px)
- Layout: `flex items-center space-x-4` (16px gap)

**Label:**
- Font: `text-sm font-medium` (14px, medium weight)
- Color: `text-gray-300`

**Select/Input:**
- Background: `bg-gray-800`
- Border: `border border-gray-600`
- Border radius: `rounded-md` (6px)
- Padding: `px-3 py-2` (horizontal: 12px, vertical: 8px)
- Text: `text-white text-sm` (white, 14px)
- Focus ring: `focus:ring-2 focus:ring-[#ffd200]`
- Focus border: `focus:border-transparent`

**Search Input Specific:**
- Width: `w-full` with `max-w-md` container (448px max)
- Left padding: `pl-10` (40px, to accommodate icon)
- Icon position: `absolute inset-y-0 left-0 pl-3`
- Icon size: `h-4 w-4` (16px)
- Icon color: `text-gray-400`

**Clear Buttons:**
- Font: `text-xs` (12px)
- Color: `text-gray-400`
- Hover: `hover:text-white`

### Behavioral Specifications

**Search Debouncing:**
- Delay: 300ms
- Searches on song title only (case-insensitive)

**Filter Combination:**
- Genre and search can be combined
- Both filters work together in AND logic
- Clearing one maintains the other

**Available Genres:**
- Populated from user's actual uploaded songs
- Sorted alphabetically
- Only shows genres that have at least one song

---

## Song Card Component

### Card HTML Structure

**File:** `components/dashboard/songList.vue` (lines 130-299)

```vue
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <div v-for="song in songStore.songs" :key="song.id" 
    class="border rounded-xl p-6 text-center flex flex-col justify-between hover:border-[#ffd200]/50 hover:!border-[#ffd200]/50 transition-all duration-300 border-gray-700 bg-gray-800 theme-bg-card theme-border-card">
    <div>
      <!-- Title with Tag Indicator -->
      <h3 class="font-semibold text-white text-lg mb-1 break-words flex items-center justify-center relative">
        {{ song.title }}
        <!-- Tag indicator -->
        <svg v-if="songTagCounts[song.id] > 0" 
             class="inline-block w-3 h-3 ml-1 text-[#ffd200] cursor-pointer" 
             fill="currentColor" 
             viewBox="0 0 24 24"
             @click="showTagTooltip(song.id)"
             :title="`Tags: ${songTagCounts[song.id]}`">
          <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
        </svg>
        <!-- Tag count tooltip -->
        <div v-if="showTagTooltipId === song.id" 
             class="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
          Tags: {{ songTagCounts[song.id] }}
          <div class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
        </div>
      </h3>
      
      <!-- Artist -->
      <p class="text-gray-400 text-sm mb-4 italic">{{ song.artist }}</p>
      
      <!-- Audio Player (see Audio Player section) -->
      
      <!-- Metrics Row -->
      <p class="text-gray-300 text-sm flex items-center justify-center space-x-3">
        <span>Total Votes: {{ song.likes + song.dislikes }}</span>
        <span class="text-gray-500">|</span>
        <span>Approval: 
          <span :class="{
            'text-[#ffd200]': getApprovalRateNumber(song.likes, song.dislikes) >= 70,
            'text-red-500': getApprovalRateNumber(song.likes, song.dislikes) < 50,
            'text-gray-400': getApprovalRateNumber(song.likes, song.dislikes) === 0
          }">
            {{ calculateApprovalRate(song.likes, song.dislikes) }}%
          </span>
        </span>
      </p>
      
      <!-- Upload Timestamp -->
      <p class="text-xs text-gray-500 mt-3">Uploaded: {{ formatDate(song.created_at) }}</p>
      
      <!-- Status Pills -->
      <div class="mt-4 flex items-center justify-center space-x-1">
        <span class="px-3 py-1.5 rounded-full text-xs font-medium"
          :class="getStatusPill(song).class">
          {{ getStatusPill(song).text }}
        </span>
        
        <!-- Info icon for moderation statuses -->
        <div v-if="song.status === 'under_review' || song.status === 'removed'" class="relative inline-block">
          <button
            @click.stop="toggleStatusInfo(song.id)"
            class="inline-flex items-center justify-center w-5 h-5 text-gray-900 hover:text-black focus:outline-none cursor-pointer"
            :aria-expanded="openInfoForId === song.id"
            title="More info"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
          </button>
          <!-- Popunder (see below) -->
        </div>
        
        <!-- Score Pill -->
        <span v-if="getLatestScore(song.id)" 
          class="px-3 py-1.5 rounded-full text-xs font-medium bg-[#ffd200]/10 text-[#ffd200]">
          Score: {{ getLatestScore(song.id)?.score }} (Week {{ (getLatestScore(song.id)?.week_number ?? 0) + 1 }})
        </span>
        <span v-else-if="!song.is_active && song.churnState?.finalScore" 
          class="px-3 py-1.5 rounded-full text-xs font-medium bg-[#ffd200]/10 text-[#ffd200]">
          Final Score: {{ song.churnState.finalScore }}
        </span>
        <span v-else class="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-800 text-gray-400">
          Pending Final Score
        </span>
      </div>
      
      <!-- Action Buttons -->
      <div class="mt-4 flex justify-center space-x-2">
        <button
          @click="editSong(song)"
          class="px-3 py-2 bg-[#ffd200] text-black rounded-lg hover:bg-[#e6bd00] transition-colors text-sm font-medium flex items-center"
          :aria-label="`Edit song: ${song.title} by ${song.artist}`"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          Edit
        </button>
        <button
          @click="confirmDelete(song)"
          class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center"
          :aria-label="`Delete song: ${song.title} by ${song.artist}`"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          Delete
        </button>
      </div>
    </div>
  </div>
</div>
```

### Visual Specifications

**Grid Layout:**
- Mobile: `grid-cols-1` (1 column)
- Small: `sm:grid-cols-2` (2 columns, ≥640px)
- Large: `lg:grid-cols-3` (3 columns, ≥1024px)
- Extra Large: `xl:grid-cols-4` (4 columns, ≥1280px)
- Gap: `gap-6` (24px)

**Card Container:**
- Border: `border border-gray-700`
- Border radius: `rounded-xl` (12px)
- Background: `bg-gray-800`
- Padding: `p-6` (24px)
- Text align: `text-center`
- Layout: `flex flex-col justify-between`
- Hover border: `hover:border-[#ffd200]/50`
- Transition: `transition-all duration-300`

**Title:**
- Font: `font-semibold text-lg` (18px, semibold)
- Color: `text-white`
- Margin: `mb-1` (4px)
- Word wrap: `break-words`
- Layout: `flex items-center justify-center relative`

**Tag Indicator Icon:**
- Size: `w-3 h-3` (12px)
- Margin: `ml-1` (4px)
- Color: `text-[#ffd200]`
- Display: `inline-block`
- Cursor: `cursor-pointer`

**Tag Tooltip:**
- Position: `absolute top-8 left-1/2 transform -translate-x-1/2`
- Background: `bg-gray-800`
- Text: `text-white text-xs` (12px)
- Padding: `px-2 py-1` (horizontal: 8px, vertical: 4px)
- Border radius: `rounded`
- Shadow: `shadow-lg`
- Z-index: `z-10`
- Arrow: `w-2 h-2` diamond rotated 45deg

**Artist:**
- Font: `text-sm` (14px)
- Color: `text-gray-400`
- Style: `italic`
- Margin: `mb-4` (16px)

**Metrics Row:**
- Font: `text-sm` (14px)
- Color: `text-gray-300`
- Layout: `flex items-center justify-center space-x-3` (12px gap)
- Divider: `text-gray-500`

**Approval Rate Colors:**
- ≥70%: `text-[#ffd200]` (yellow/gold)
- <50%: `text-red-500` (red)
- 0% (no votes): `text-gray-400`

**Upload Timestamp:**
- Font: `text-xs` (12px)
- Color: `text-gray-500`
- Margin: `mt-3` (12px)

**Status Pills:**
- Padding: `px-3 py-1.5` (horizontal: 12px, vertical: 6px)
- Border radius: `rounded-full`
- Font: `text-xs font-medium` (12px, medium weight)
- Margin: `mt-4` (16px)
- Layout: `flex items-center justify-center space-x-1` (4px gap)

**Status Pill Classes:**
- **Active:** `bg-green-400/10 text-green-400`
- **Under Review:** `bg-yellow-400/10 text-yellow-400`
- **Removed:** `bg-red-500/10 text-red-500`
- **Churn Completed:** `bg-gray-400/10 text-gray-400`
- **Score:** `bg-[#ffd200]/10 text-[#ffd200]`
- **Pending Score:** `bg-gray-800 text-gray-400`

**Action Buttons:**
- Padding: `px-3 py-2` (horizontal: 12px, vertical: 8px)
- Border radius: `rounded-lg` (8px)
- Font: `text-sm font-medium` (14px, medium weight)
- Layout: `flex items-center`
- Icon size: `w-4 h-4` (16px)
- Icon margin: `mr-1` (4px)
- Container margin: `mt-4` (16px)
- Spacing: `space-x-2` (8px)

**Edit Button:**
- Background: `bg-[#ffd200]`
- Text: `text-black`
- Hover: `hover:bg-[#e6bd00]`

**Delete Button:**
- Background: `bg-red-600`
- Text: `text-white`
- Hover: `hover:bg-red-700`

### Tag Count Feature

**Supabase RPC:**
```sql
get_song_tag_count(p_song_id: uuid) -> integer
```

**Loading Strategy:**
- Tags are loaded lazily after songs are fetched
- Cached in `fetchedTagCounts` Set to avoid refetching
- Only visible tags (songs currently in the list) are fetched
- New songs loaded via infinite scroll trigger tag count fetch

---

## Audio Player System

### Audio Player Component

**File:** `components/dashboard/songList.vue` (lines 154-219)

```vue
<div class="mb-4">
  <div class="w-16 h-16 mx-auto mb-2 relative cursor-pointer group" @click="audioErrors[song.id] ? retryAudio(song.id) : togglePlay(song.id)">
    <!-- Loading State -->
    <div v-if="audioLoading[song.id]" class="absolute inset-0 flex items-center justify-center z-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffd200]"></div>
    </div>
    
    <!-- Error State -->
    <div v-else-if="audioErrors[song.id]" class="absolute inset-0 flex items-center justify-center z-20">
      <svg class="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    </div>
    
    <!-- Normal Play/Pause State -->
    <div v-else class="absolute inset-0 flex items-center justify-center z-10">
      <svg v-if="!isPlaying[song.id]" class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>
      <svg v-else class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>
    </div>
    
    <!-- Progress Ring -->
    <svg class="w-[72px] h-[72px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-90 z-0">
      <circle
        cx="36"
        cy="36"
        r="34"
        stroke="currentColor"
        stroke-width="2"
        fill="none"
        class="text-gray-800"
      />
      <circle
        cx="36"
        cy="36"
        r="34"
        stroke="currentColor"
        stroke-width="2"
        fill="none"
        :stroke-dasharray="2 * Math.PI * 34"
        :stroke-dashoffset="getProgressOffset(song.id)"
        class="text-[#ffd200] transition-all duration-200"
      />
    </svg>
    
    <!-- Background Circle -->
    <div class="absolute inset-0 theme-bg-card rounded-full group-hover:bg-[#ffd200] transition-colors z-0 border-2 play-inner"></div>
  </div>
  
  <!-- Error Message -->
  <div v-if="audioErrors[song.id]" class="text-xs text-red-500 text-center mb-2">
    Audio failed to load
  </div>
  
  <!-- Mobile Audio Info -->
  <div v-if="isMobile && audioErrors[song.id]" class="text-xs text-gray-500 text-center">
    Tap to retry
  </div>
</div>
```

### Visual Specifications

**Player Container:**
- Size: `w-16 h-16` (64px)
- Margin: `mx-auto mb-2` (centered, 8px bottom)
- Position: `relative`
- Cursor: `cursor-pointer`
- Group hover: `group`

**Loading Spinner:**
- Position: `absolute inset-0 flex items-center justify-center`
- Z-index: `z-20`
- Spinner size: `h-8 w-8` (32px)
- Spinner color: `border-[#ffd200]`
- Animation: `animate-spin`

**Play/Pause Icon:**
- Size: `w-6 h-6` (24px)
- Color: `text-white`
- Z-index: `z-10`

**Progress Ring (SVG):**
- Size: `w-[72px] h-[72px]` (72px × 72px)
- Position: `absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`
- Rotation: `-rotate-90` (start at top)
- Z-index: `z-0`

**Progress Ring Circles:**
- Center: `cx="36" cy="36"`
- Radius: `r="34"` (34px)
- Stroke width: `stroke-width="2"` (2px)
- Fill: `none`
- Background circle: `text-gray-800`
- Progress circle: `text-[#ffd200]`, `transition-all duration-200`
- Dash array: `2 * Math.PI * 34` (circumference)
- Dash offset: Calculated based on progress percentage

**Background Circle:**
- Position: `absolute inset-0`
- Border radius: `rounded-full`
- Border: `border-2`
- Theme: `theme-bg-card`
- Hover: `group-hover:bg-[#ffd200]`
- Transition: `transition-colors`
- Z-index: `z-0`

### Audio Player Logic

**Composable Used:** `composables/useAudioPlayer.ts`

**Toggle Play Function:**
```typescript
const togglePlay = async (songId: string) => {
  const song = songStore.songs.find(s => s.id === songId);
  if (!song?.url) return;

  await audioPlayer.togglePlay({
    songId,
    audioUrl: song.url,
    preservePositionOnPause: true, // Keep position when paused
    onEnded: () => { /* Handle song ended */ },
    onProgress: (progress) => { /* Progress automatically updated */ },
    onError: (error) => { console.error(`Audio error for song ${songId}:`, error) },
    onLoadingChange: (isLoading) => { /* Loading state automatically updated */ }
  });
};
```

**Key Features:**
- Only one song plays at a time (stops others automatically)
- Preserves position on pause (resume from where it was paused)
- Progress ring shows playback progress
- Mobile optimization (on-demand loading, cleanup on errors)
- Error handling with retry capability

**Progress Calculation:**
```typescript
const getProgressOffset = (songId: string) => {
  const circumference = 2 * Math.PI * 34;
  const progressValue = progress.value[songId] || 0;
  return circumference * (1 - progressValue / 100);
};
```

---

## Empty States

### Active Songs - No Songs

**File:** `components/dashboard/songList.vue` (lines 328-332)

```vue
<div v-else-if="!songStore.loadingSongs && !isRefreshingFilters && !songStore.loadingTrashedSongs && songStore.songs.length === 0" class="text-center py-12">
  <div class="text-gray-400 text-6xl mb-4">🎵</div>
  <p class="text-gray-400 text-lg">No songs uploaded yet</p>
  <p class="text-gray-500 mt-2">Your uploaded songs will appear here</p>
</div>
```

**Visual Specifications:**
- Padding: `py-12` (48px vertical)
- Alignment: `text-center`
- Emoji size: `text-6xl` (60px)
- Emoji margin: `mb-4` (16px)
- Primary text: `text-lg` (18px), `text-gray-400`
- Secondary text: `text-gray-500`, `mt-2` (8px)

### Trash - No Trashed Songs

**File:** `components/dashboard/songList.vue` (lines 409-413)

```vue
<div v-else class="text-center py-12">
  <div class="text-gray-600 text-6xl mb-4">🗑️</div>
  <p class="text-gray-500 text-lg">No trashed songs</p>
  <p class="text-gray-600 mt-2">Deleted songs will appear here for 10 days</p>
</div>
```

**Visual Specifications:**
- Same layout as Active empty state
- Different emoji: 🗑️
- Slightly darker text colors: `text-gray-600`, `text-gray-500`

### Loading States

**Initial Loading:**
```vue
<div v-if="songStore.loadingSongs" class="text-center py-8">
  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffd200] mx-auto"></div>
  <p class="mt-4 text-gray-400">Loading songs...</p>
  <p v-if="isMobile" class="mt-2 text-xs text-gray-500">This may take a moment on mobile</p>
</div>
```

**Filter Refreshing:**
```vue
<div v-else-if="isRefreshingFilters" class="text-center py-8">
  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffd200] mx-auto"></div>
  <p class="mt-4 text-gray-400">Refreshing filters...</p>
</div>
```

**Load More (Infinite Scroll):**
```vue
<div v-if="loadingMore" class="flex items-center justify-center space-x-2 text-gray-400">
  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-[#ffd200]"></div>
  <span class="text-sm">Loading more songs...</span>
</div>
```

---

## Modals

### Delete Confirmation Modal

**File:** `components/dashboard/songList.vue` (lines 417-459)

```vue
<div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  <div class="bg-gray-900 rounded-xl max-w-md w-full">
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-white">Delete Song</h3>
        <button @click="closeDeleteModal" class="text-gray-400 hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <div class="mb-6">
        <p class="text-gray-300 mb-4">
          Are you sure you want to delete "<strong>{{ songToDelete?.title }}</strong>" by {{ songToDelete?.artist }}?
        </p>
        <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <p class="text-yellow-400 text-sm">
            <strong>Note:</strong> This will move the song to trash where it will be automatically deleted after 10 days. 
            You can restore it anytime before then.
          </p>
        </div>
      </div>
      
      <div class="flex space-x-3">
        <button
          @click="deleteSong"
          :disabled="deleting"
          class="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {{ deleting ? 'Deleting...' : 'Move to Trash' }}
        </button>
        <button
          @click="closeDeleteModal"
          class="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>
```

### Hard Delete Confirmation Modal

**File:** `components/dashboard/songList.vue` (lines 461-515)

```vue
<div v-if="showHardDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  <div class="bg-gray-900 rounded-xl max-w-md w-full">
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold text-white">Permanently Delete Song</h3>
        <button @click="closeHardDeleteModal" class="text-gray-400 hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      
      <div class="mb-6">
        <p class="text-gray-300 mb-4">
          Are you absolutely sure you want to <strong>permanently delete</strong> "<strong>{{ songToHardDelete?.title }}</strong>" by {{ songToHardDelete?.artist }}?
        </p>
        <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p class="text-red-400 text-sm">
            <strong>Warning:</strong> This action cannot be undone. The song will be permanently removed from the system and all associated files will be deleted.
          </p>
        </div>
        
        <!-- Song name confirmation input -->
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Type the song name to confirm: <strong>"{{ songToHardDelete?.title }}"</strong>
          </label>
          <input
            v-model="songNameConfirmation"
            type="text"
            class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400"
            placeholder="Enter song name to confirm"
          />
        </div>
      </div>
      
      <div class="flex space-x-3">
        <button
          @click="hardDeleteSong"
          :disabled="hardDeleting || !canConfirmDelete"
          class="flex-1 px-4 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {{ hardDeleting ? 'Deleting...' : 'Delete Permanently' }}
        </button>
        <button
          @click="closeHardDeleteModal"
          class="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>
```

**Confirmation Logic:**
```typescript
const canConfirmDelete = computed(() => songNameConfirmation.value === songToHardDelete.value?.title);
```

### Edit Song Modal

**File:** `components/dashboard/songList.vue` (lines 517-619)

Key features:
- Full modal with scrollable content
- Title, Artist, Genre fields
- WaveformSelectorDual component for clip start time
- Mobile-optimized scrolling with safe area insets
- Sticky action buttons on mobile

**Visual Specifications:**
- Background overlay: `bg-black bg-opacity-50`
- Modal: `bg-gray-900 rounded-xl max-w-4xl`
- Max height: `max-h-[calc(100vh-8rem)]`
- Overflow: `overflow-y-auto`
- Z-index: `z-[100]`

---

## Data Queries and State Management

### Supabase Queries

**Store:** `store/songStore.ts`

### Fetch Songs Query

```typescript
// Get total count
const { count, error: countError } = await supabase
  .from('songs')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.value?.id)
  .is('deleted_at', null);

// Fetch first batch
const { data, error } = await supabase
  .from('songs')
  .select('*')
  .eq('user_id', user.value?.id)
  .is('deleted_at', null)
  .order('created_at', { ascending: false })
  .limit(pageSize.value); // pageSize = 20
```

### Fetch Trashed Songs Query

```typescript
const { data, error } = await supabase
  .rpc('get_my_trashed_songs');
```

**RPC Function:** Returns songs where `deleted_at IS NOT NULL` and `trash_expires_at > NOW()` for current user.

### Apply Genre Filter Query

```typescript
const { data, error } = await supabase
  .from('songs')
  .select('*')
  .eq('user_id', user.value?.id)
  .is('deleted_at', null)
  .eq('genre', genre)
  .order('created_at', { ascending: false })
  .limit(pageSize.value);
```

### Search Songs Query

```typescript
const { data, error } = await supabase
  .from('songs')
  .select('*')
  .eq('user_id', user.value?.id)
  .is('deleted_at', null)
  .ilike('title', `%${query}%`) // Case-insensitive search
  .order('created_at', { ascending: false })
  .limit(pageSize.value);
```

### Combined Filter Query (Genre + Search)

```typescript
const { data, error } = await supabase
  .from('songs')
  .select('*')
  .eq('user_id', user.value?.id)
  .is('deleted_at', null)
  .eq('genre', genre)
  .ilike('title', `%${searchQuery}%`)
  .order('created_at', { ascending: false })
  .limit(pageSize.value);
```

### Load More (Pagination)

```typescript
const { data, error } = await supabase
  .from('songs')
  .select('*')
  .eq('user_id', user.value?.id)
  .is('deleted_at', null)
  // Apply filters if active
  .eq('genre', selectedGenre.value) // if genre filter active
  .ilike('title', `%${searchQuery.value}%`) // if search active
  .order('created_at', { ascending: false })
  .range(lastLoadedIndex.value, lastLoadedIndex.value + pageSize.value - 1);
```

### Soft Delete

```typescript
const { error } = await supabase
  .rpc('soft_delete_song', { p_song_id: songId });
```

### Restore Song

```typescript
const { error } = await supabase
  .rpc('restore_song', { p_song_id: songId });
```

### Hard Delete

```typescript
const { error } = await supabase
  .rpc('hard_delete_song', { p_song_id: songId });
```

### Update Song

```typescript
const { error } = await supabase
  .from('songs')
  .update({
    title: editForm.value.title,
    artist: editForm.value.artist,
    genre: editForm.value.genre,
    clip_start_time: editForm.value.clipStartTime
  })
  .eq('id', editingSong.value.id);
```

### Get Available Genres

```typescript
const { data, error } = await supabase
  .from('songs')
  .select('genre')
  .eq('user_id', user.value?.id)
  .is('deleted_at', null)
  .not('genre', 'is', null);

// Extract unique genres
const genres = [...new Set(data.map(song => song.genre).filter(genre => genre && genre.trim()))];
return genres.sort();
```

### Get Battle-Ready Genres

```typescript
const { data, error } = await supabase.rpc('get_battle_available_genres');

// Returns: [{genre: "Funk"}, {genre: "Rock"}, ...]
battleReadyGenres.value = data?.map((item: any) => item.genre) || [];
```

### Get Song Tag Count

```typescript
const { data, error } = await supabase.rpc('get_song_tag_count', {
  p_song_id: songId
});

return data || 0;
```

### Get Moderation Summary

```typescript
const { data, error } = await supabase.rpc('get_my_song_moderation', { p_song_id: songId });

// Returns moderation flag counts and status metadata
return {
  counts: {
    hate_speech: Number(row.hate_speech_count || 0),
    copyright: Number(row.copyright_count || 0)
  },
  meta: {
    status_changed_at: row.status_changed_at || null,
    status_change_reason: row.status_change_reason || null
  }
};
```

### Store State

**File:** `store/songStore.ts`

```typescript
const songs = ref<Song[]>([]); // Active songs list
const trashedSongs = ref<Song[]>([]); // Trashed songs list
const loadingSongs = ref(false); // Loading state
const loadingTrashedSongs = ref(false); // Trash loading state

// Pagination state
const hasMoreSongs = ref(true); // More songs available?
const lastLoadedIndex = ref(0); // Index of last loaded song
const pageSize = ref(20); // Songs per batch
const totalSongs = ref(0); // Total song count

// Filter state
const selectedGenre = ref(''); // Active genre filter
const searchQuery = ref(''); // Active search query
const loadingMore = ref(false); // Loading more songs?

// Churn data
const weeklyScores = ref<WeeklyScore[]>([]); // Weekly churn scores
const churnEvents = ref<ChurnEvent[]>([]); // Churn event history
```

### Date Formatting

```typescript
const formatDate = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};
```

**Format:** "10/15/2025 3:45:30 PM"

### Approval Rate Calculation

```typescript
const calculateApprovalRate = (likes: number | null, dislikes: number | null) => {
  const likesNum = likes || 0;
  const dislikesNum = dislikes || 0;
  
  const totalVotes = likesNum + dislikesNum;
  if (totalVotes === 0) {
    return 'N/A'; 
  }
  const percentage = (likesNum / totalVotes) * 100;
  return percentage.toFixed(0); 
};

const getApprovalRateNumber = (likes: number | null, dislikes: number | null) => {
  const likesNum = likes || 0;
  const dislikesNum = dislikes || 0;
  
  const totalVotes = likesNum + dislikesNum;
  if (totalVotes === 0) {
    return 0; 
  }
  return (likesNum / totalVotes) * 100;
};
```

---

## Visual Design System

### Color Palette

**Primary Colors:**
- Yellow/Gold: `#ffd200` (primary accent)
- Yellow Hover: `#e6bd00` (darker yellow for hover states)

**Status Colors:**
- Active/Success: `green-400` (#4ade80)
- Warning/Under Review: `yellow-400` (#facc15)
- Error/Removed: `red-500` (#ef4444), `red-600`, `red-700`
- Inactive/Pending: `gray-400` (#9ca3af)

**Background Colors:**
- Primary BG: `black` (#000000)
- Card BG: `gray-800` (#1f2937)
- Modal BG: `gray-900` (#111827)
- Input BG: `gray-800` (#1f2937)

**Border Colors:**
- Default: `gray-700` (#374151)
- Input: `gray-600` (#4b5563)
- Divider: `gray-700` (#374151)

**Text Colors:**
- Primary: `white` (#ffffff)
- Secondary: `gray-300` (#d1d5db)
- Tertiary: `gray-400` (#9ca3af)
- Muted: `gray-500` (#6b7280)
- Disabled: `gray-600` (#4b5563)

### Typography

**Font Family:** System default (inherited)

**Font Sizes:**
- `text-xs`: 12px (0.75rem)
- `text-sm`: 14px (0.875rem)
- `text-base`: 16px (1rem)
- `text-lg`: 18px (1.125rem)
- `text-xl`: 20px (1.25rem)
- `text-2xl`: 24px (1.5rem)
- `text-3xl`: 30px (1.875rem)
- `text-6xl`: 60px (3.75rem)

**Font Weights:**
- `font-normal`: 400
- `font-medium`: 500
- `font-semibold`: 600
- `font-bold`: 700

### Spacing System

**Padding/Margin Scale:**
- `1`: 4px (0.25rem)
- `2`: 8px (0.5rem)
- `3`: 12px (0.75rem)
- `4`: 16px (1rem)
- `5`: 20px (1.25rem)
- `6`: 24px (1.5rem)
- `8`: 32px (2rem)
- `12`: 48px (3rem)

### Border Radius

- `rounded`: 4px (0.25rem)
- `rounded-md`: 6px (0.375rem)
- `rounded-lg`: 8px (0.5rem)
- `rounded-xl`: 12px (0.75rem)
- `rounded-full`: 9999px (full circle)

### Shadows

- `shadow-lg`: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
- `shadow-xl`: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
- `shadow-2xl`: 0 25px 50px -12px rgba(0, 0, 0, 0.25)

### Transitions

- Default: `transition-colors` (150ms ease)
- All: `transition-all duration-300` (300ms ease)
- Progress: `transition-all duration-200` (200ms ease)

---

## Behavioral Details

### Reactive Updates After Delete/Edit

**After Soft Delete:**
1. Removed from `songs.value` array immediately
2. `songStore.fetchTrashedSongs()` called to update trash count
3. Active filters maintained (genre/search not cleared)

**After Restore:**
1. Removed from `trashedSongs.value` immediately
2. Active songs list refreshed with current filters applied
3. Trash list refreshed

**After Edit:**
1. Modal closed
2. `songStore.fetchSongs()` called to refresh list
3. Filters maintained

**After Hard Delete:**
1. Removed from `trashedSongs.value` immediately
2. No refresh needed (permanent deletion)

### Search Functionality

**Search Target:**
- Searches song **title only** (not artist, not genre)
- Case-insensitive using Supabase `.ilike()`

**Debouncing:**
- Delay: 300ms
- Clears previous timeout on each keystroke
- Triggers search after user stops typing

**Search Query Format:**
```sql
.ilike('title', '%{searchQuery}%')
```

### Genre Filter Combination with Search

**Behavior:**
- Genre and search filters work together in AND logic
- Both can be active simultaneously
- Clearing one maintains the other
- Example: Genre="Rock" AND Title contains "love"

### Sort Order

**Default Sort:**
```sql
.order('created_at', { ascending: false })
```

**Result:** Newest songs first (most recent upload at top)

### Infinite Scroll

**Trigger:**
- When user scrolls within 200px of page bottom

**Batch Size:**
- 20 songs per load

**Behavior:**
- Appends new songs to existing array
- Maintains current filters (genre + search)
- Shows loading indicator at bottom
- Disabled when `hasMoreSongs = false`

**Implementation:**
```typescript
const handleScroll = () => {
  if (loadingMore.value || !hasMoreSongs.value) return;
  
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  
  // Load more when within 200px of bottom
  if (scrollTop + windowHeight >= documentHeight - 200) {
    loadMoreSongs();
  }
};
```

### Mobile Optimizations

**Audio Elements:**
- Created on-demand (when play is tapped)
- Cleaned up on errors to prevent memory issues
- Preload setting: `preload="none"` on mobile

**Loading Messages:**
- Shows "This may take a moment on mobile" during initial load
- Shows "Tap to retry" for failed audio on mobile

**Performance Note:**
- Bottom-of-page message: "Mobile Optimized: Audio elements are loaded on-demand to prevent freezing"

### Real-time Updates

**Supabase Realtime Subscription:**
```typescript
supabase
  .channel(`songs_user_${user.value?.id}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'songs'
  }, (payload) => {
    // Handle INSERT, UPDATE, DELETE
  })
  .subscribe();
```

**Behavior:**
- Auto-updates songs list on database changes
- Handles likes/dislikes updates in real-time
- Adds newly uploaded songs to top of list
- Removes deleted songs from list

---

## Complete Code Files

### Main Page Component

**File:** `pages/my-songs.vue`

**Purpose:** Page wrapper that contains header and SongList component

**Key Imports:**
```typescript
import { ref, onMounted } from 'vue';
import { useProfileStore } from '~/store/profileStore';
import SongList from '~/components/dashboard/songList.vue';
```

**Middleware:**
```typescript
definePageMeta({
  middleware: ['auth']
});
```

**Script Logic:**
- Fetches user profile on mount
- Exposes SongList ref for potential parent access

---

### Song List Component

**File:** `components/dashboard/songList.vue`

**Purpose:** Complete song management interface with tabs, filters, cards, and modals

**Key Imports:**
```typescript
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useSongStore } from '~/store/songStore';
import { useAuthStore } from '~/store/authStore';
import { useSupabaseClient } from '#imports';
import WaveformSelectorDual from '~/components/WaveformSelectorDual.vue';
import { MASTER_GENRES } from '~/utils/genres';
import { useAudioPlayer } from '~/composables/useAudioPlayer';
```

**Major State Variables:**
```typescript
const activeTab = ref<'active' | 'trash'>('active');
const selectedGenre = ref('');
const searchQuery = ref('');
const showDeleteModal = ref(false);
const showHardDeleteModal = ref(false);
const showEditModal = ref(false);
const songToDelete = ref<any>(null);
const songToHardDelete = ref<any>(null);
const editingSong = ref<any>(null);
const songTagCounts = ref<{ [key: string]: number }>({});
const battleReadyGenres = ref<string[]>([]);
const availableGenres = ref<string[]>([]);
```

**Lifecycle Hooks:**
- `onMounted()`: Fetch songs, trash, genres, battle-ready genres, setup listeners
- `onUnmounted()`: Cleanup audio players, remove event listeners

**Key Functions:**
- `fetchSongs()`: Load active songs with pagination
- `fetchTrashedSongs()`: Load trashed songs
- `handleGenreChange()`: Apply genre filter
- `handleSearchInput()`: Debounced search
- `togglePlay(songId)`: Play/pause audio
- `editSong(song)`: Open edit modal
- `confirmDelete(song)`: Open delete confirmation
- `deleteSong()`: Soft delete (move to trash)
- `restoreSong(songId)`: Restore from trash
- `hardDeleteSong()`: Permanent deletion
- `loadMoreSongs()`: Infinite scroll pagination

---

### Song Store

**File:** `store/songStore.ts`

**Purpose:** Centralized state management for songs with pagination, filtering, and search

**Key State:**
```typescript
const songs = ref<Song[]>([]);
const trashedSongs = ref<Song[]>([]);
const loadingSongs = ref(false);
const loadingTrashedSongs = ref(false);
const hasMoreSongs = ref(true);
const lastLoadedIndex = ref(0);
const pageSize = ref(20);
const totalSongs = ref(0);
const selectedGenre = ref('');
const searchQuery = ref('');
const loadingMore = ref(false);
const weeklyScores = ref<WeeklyScore[]>([]);
const churnEvents = ref<ChurnEvent[]>([]);
```

**Key Functions:**
```typescript
fetchSongs(): Promise<void>
loadMoreSongs(): Promise<void>
loadMoreWithFilters(): Promise<void>
applyGenreFilter(genre: string): Promise<void>
searchSongs(query: string): Promise<void>
searchSongsWithGenre(query: string, genre: string): Promise<void>
applyGenreFilterWithSearch(genre: string, searchQuery: string): Promise<void>
clearFilters(): Promise<void>
getAvailableGenres(): Promise<string[]>
softDeleteSong(songId: string): Promise<boolean>
restoreSong(songId: string): Promise<boolean>
hardDeleteSong(songId: string): Promise<boolean>
fetchTrashedSongs(): Promise<void>
```

---

### Audio Player Composable

**File:** `composables/useAudioPlayer.ts`

**Purpose:** Centralized audio management with mobile optimization

**Sub-Composables Used:**
- `useAudioContext`: Global AudioContext management
- `useAudioElements`: Audio element lifecycle and controls
- `useAudioTimeouts`: Timeout management for auto-stop
- `useAudioProgress`: Progress tracking for multiple audio elements
- `useMobileDetection`: Mobile device detection

**Key Features:**
- Single audio player at a time (auto-stops others)
- Progress tracking with circular ring
- Mobile on-demand loading
- Error handling with retry
- Preserve position on pause option
- Auto-stop timeout support

**Main Functions:**
```typescript
createPlayer(options: AudioPlayerOptions): HTMLAudioElement | null
playAudio(options: AudioPlayerOptions): Promise<void>
togglePlay(options: AudioPlayerOptions): Promise<void>
pausePlayer(songId: string): void
stopPlayer(songId: string): void
stopAllPlayers(): void
cleanupPlayer(songId: string): void
cleanupAllPlayers(): void
retryAudio(songId: string): Promise<void>
```

**Exposed State:**
```typescript
isPlaying: ComputedRef<{ [key: string]: boolean }>
audioLoading: ComputedRef<{ [key: string]: boolean }>
audioErrors: ComputedRef<{ [key: string]: string }>
audioProgress: ComputedRef<{ [key: string]: number }>
```

---

### Genres Utility

**File:** `utils/genres.ts`

**Purpose:** Master genre list (single source of truth)

```typescript
export const MASTER_GENRES = [
  'Alternative', 'Blues', 'Christian', 'Classical', 'Country', 
  'Dance', 'Electronic', 'Folk', 'Funk', 'Gospel', 'Hip-Hop', 
  'Indie', 'Jazz', 'Latin', 'Metal', 'Pop', 'Punk', 'R&B', 
  'Reggae', 'Rock', 'Ska', 'Soul', 'World', 'Other'
] as const;

export type Genre = typeof MASTER_GENRES[number];
```

**Usage:**
- Edit modal genre dropdown uses `MASTER_GENRES`
- Filter dropdown uses `availableGenres` (dynamically from user's songs)

---

## Implementation Checklist

### Phase 1: Page Structure
- [ ] Create `my-songs.vue` page with header
- [ ] Implement yellow music icon with gradient
- [ ] Add page title and subtitle

### Phase 2: Tab Navigation
- [ ] Implement Active/Trash tabs
- [ ] Add tab state management
- [ ] Implement keyboard navigation
- [ ] Show dynamic counts in tab labels

### Phase 3: Filters and Search
- [ ] Create genre filter dropdown
- [ ] Create search input with icon
- [ ] Implement search debouncing (300ms)
- [ ] Add "Clear Filter" and "Clear Search" buttons
- [ ] Show "No results" message

### Phase 4: Song Cards
- [ ] Implement grid layout (responsive columns)
- [ ] Add song title, artist, genre display
- [ ] Implement tag indicator and tooltip
- [ ] Add metrics row (votes, approval)
- [ ] Add upload timestamp
- [ ] Add status pills (Active, Under Review, Removed)
- [ ] Add score pills
- [ ] Add Edit and Delete buttons

### Phase 5: Audio Player
- [ ] Implement circular play button
- [ ] Add progress ring (SVG)
- [ ] Add loading spinner
- [ ] Add error state with retry
- [ ] Integrate `useAudioPlayer` composable
- [ ] Implement toggle play logic

### Phase 6: Modals
- [ ] Create Delete Confirmation Modal
- [ ] Create Hard Delete Modal with name confirmation
- [ ] Create Edit Song Modal with WaveformSelectorDual
- [ ] Implement mobile scroll fixes for Edit Modal

### Phase 7: Empty States
- [ ] Add "No songs" empty state for Active
- [ ] Add "No trashed songs" empty state for Trash
- [ ] Add loading states (initial, refresh, load more)

### Phase 8: Data Integration
- [ ] Integrate `songStore` for data fetching
- [ ] Implement pagination (20 songs per batch)
- [ ] Implement infinite scroll
- [ ] Implement genre filter queries
- [ ] Implement search queries
- [ ] Implement combined filter queries

### Phase 9: CRUD Operations
- [ ] Implement soft delete (move to trash)
- [ ] Implement restore from trash
- [ ] Implement hard delete (permanent)
- [ ] Implement song editing (title, artist, genre, clip)

### Phase 10: Polish
- [ ] Add hover states for all interactive elements
- [ ] Add transitions and animations
- [ ] Implement mobile optimizations
- [ ] Add accessibility attributes (ARIA)
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility

---

## Testing Checklist

### Functional Testing
- [ ] Songs load on page mount
- [ ] Tab switching works correctly
- [ ] Genre filter shows correct results
- [ ] Search filter shows correct results
- [ ] Combined filters work together
- [ ] Infinite scroll loads more songs
- [ ] Audio plays/pauses correctly
- [ ] Only one audio plays at a time
- [ ] Progress ring updates correctly
- [ ] Soft delete moves song to trash
- [ ] Restore brings song back from trash
- [ ] Hard delete permanently removes song
- [ ] Edit modal saves changes correctly
- [ ] Tag counts display correctly
- [ ] Battle-ready indicators show correctly

### Visual Testing
- [ ] Card layout matches design
- [ ] Colors match exactly (#ffd200 yellow)
- [ ] Typography sizes and weights correct
- [ ] Spacing and padding match design
- [ ] Border radius matches design
- [ ] Hover states work correctly
- [ ] Transitions are smooth
- [ ] Icons are correct size and color

### Mobile Testing
- [ ] Audio loads on-demand on mobile
- [ ] Scroll performance is good
- [ ] Edit modal scrolls correctly
- [ ] Touch interactions work
- [ ] Retry button works for failed audio
- [ ] Layout is responsive at all breakpoints

### Edge Cases
- [ ] Empty state shows when no songs
- [ ] Loading state shows during fetch
- [ ] Error handling for failed queries
- [ ] Search with no results
- [ ] Filter with no results
- [ ] Audio error handling
- [ ] Network error handling

---

## Notes for Mobile Implementation

1. **Audio Elements:** Create on-demand to prevent freezing on mobile devices

2. **Infinite Scroll:** Use native scroll listeners, not intersection observer (better mobile performance)

3. **Modals:** Implement proper mobile scroll handling with safe area insets

4. **Touch Interactions:** Ensure all buttons have adequate touch target size (minimum 44px)

5. **Loading States:** Show appropriate mobile-specific messages

6. **Memory Management:** Clean up audio players aggressively on mobile

7. **Network Optimization:** Batch requests where possible, use pagination

8. **Error Recovery:** Provide clear retry mechanisms for failed operations

---

**End of Document**

