# Song Tag Count Implementation Guide

## Overview

This document explains how the web app implements song tag count functionality, enabling mobile developers to recreate the same behavior in the Ionic/Capacitor mobile app.

### What Are Tag Counts?

Song tag counts display how many times users have "tagged" a song (likely for categorization, favorites, or other user interactions). The system shows:
- A yellow tag icon next to song titles when tags exist
- A tooltip displaying "Tags: X" when hovering over the icon
- Real-time updates when tag counts change

### Visual Appearance

- **Icon**: Small yellow tag SVG icon (3x3 size)
- **Position**: Inline with song title, right-aligned
- **Tooltip**: Dark background with white text, appears on click/hover
- **Color**: `#ffd200` (yellow) for the tag icon

## Database Layer

### RPC Function: `get_song_tag_count`

The system uses a Supabase RPC function to fetch tag counts:

```sql
-- Function signature (inferred from usage)
CREATE OR REPLACE FUNCTION public.get_song_tag_count(p_song_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
-- Implementation counts tags for the given song
-- Returns integer count of tags
$$;
```

**Parameters:**
- `p_song_id` (UUID): The song's unique identifier

**Return Value:**
- Integer: Number of tags for the song (0 if no tags)

**Usage Example:**
```typescript
const { data, error } = await supabase.rpc('get_song_tag_count', {
  p_song_id: songId
});
```

## Data Fetching Implementation

### Individual Song Tag Count Function

```typescript
// Get tag count for a single song
const getSongTagCount = async (songId: string) => {
  try {
    const { data, error } = await supabase.rpc('get_song_tag_count', {
      p_song_id: songId
    });
    
    if (error) {
      console.error('Error fetching tag count:', error);
      return 0;
    }
    
    return data || 0;
  } catch (error) {
    console.error('Error fetching tag count:', error);
    return 0;
  }
};
```

**Key Points:**
- Returns 0 on any error (graceful degradation)
- Logs errors for debugging
- Handles both Supabase errors and network errors

### Batch Loading Function

```typescript
// Load tag counts for all songs
const loadTagCounts = async () => {
  if (!songStore.songs.length || isLoadingTagCounts.value) return;
  
  isLoadingTagCounts.value = true;
  
  try {
    // Only fetch counts we don't already have (caching)
    const songsToFetch = songStore.songs.filter(s => !fetchedTagCounts.value.has(s.id));
    if (songsToFetch.length === 0) return;

    const tagCountPromises = songsToFetch.map(async (song) => {
      const count = await getSongTagCount(song.id);
      return { songId: song.id, count };
    });
    
    const results = await Promise.all(tagCountPromises);
    
    // Update reactive state
    results.forEach(({ songId, count }) => {
      songTagCounts.value[songId] = count;
      fetchedTagCounts.value.add(songId);
    });
  } finally {
    isLoadingTagCounts.value = false;
  }
};
```

**Performance Optimizations:**
- **Caching**: Only fetches counts for songs not already cached
- **Batch Processing**: Uses `Promise.all()` for parallel requests
- **Loading State**: Prevents multiple simultaneous loads
- **Early Exit**: Skips if no songs or already loading

## State Management

### Reactive State Variables

```typescript
// Tag count state
const songTagCounts = ref<{ [key: string]: number }>({});
const showTagTooltipId = ref<string | null>(null);
// Cache to avoid re-fetching counts repeatedly in one session
const fetchedTagCounts = ref<Set<string>>(new Set());
const isLoadingTagCounts = ref(false);
```

**Data Structures:**
- `songTagCounts`: Object mapping song ID → tag count
- `showTagTooltipId`: Currently displayed tooltip (for single tooltip at a time)
- `fetchedTagCounts`: Set of song IDs already fetched (prevents duplicate requests)
- `isLoadingTagCounts`: Loading state to prevent concurrent requests

## Automatic Loading

### onMounted Integration

```typescript
onMounted(async () => {
  await songStore.fetchSongs();
  await songStore.fetchTrashedSongs();
  // Ensure tag counts load after initial fetch
  await loadTagCounts();
  
  // ... other initialization
});
```

**Loading Order:**
1. Fetch songs from store
2. Fetch trashed songs
3. Load tag counts for all songs
4. Other initialization tasks

### Watcher for Song Changes

```typescript
// Watch a stable signature of song IDs so in-place mutations trigger the watcher
const lastProcessedSignature = ref<string>('');
const pendingSignature = ref<string | null>(null);

watch(() => songStore.songs.map(s => s.id).join(','), async (newSignature) => {
  if (!newSignature) return;

  // If a load is already in progress, mark pending and exit
  if (isLoadingTagCounts.value) {
    pendingSignature.value = newSignature;
    return;
  }

  if (newSignature === lastProcessedSignature.value) return;

  isLoadingTagCounts.value = true;
  try {
    await loadTagCounts();
    lastProcessedSignature.value = newSignature;
  } finally {
    isLoadingTagCounts.value = false;
    // If something changed during the load, run once more
    if (pendingSignature.value && pendingSignature.value !== lastProcessedSignature.value) {
      const sig = pendingSignature.value;
      pendingSignature.value = null;
      lastProcessedSignature.value = sig;
      await loadTagCounts();
    }
  }
}, { immediate: false });
```

**Smart Loading Logic:**
- **Signature-based**: Watches song ID changes, not individual song properties
- **Debouncing**: Prevents multiple loads during rapid changes
- **Pending Queue**: Handles changes that occur during loading
- **Immediate: false**: Doesn't trigger on initial setup

## UI Implementation

### Tag Icon Rendering

```vue
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
```

**UI Features:**
- **Conditional Rendering**: Only shows icon if `songTagCounts[song.id] > 0`
- **Click Handler**: `@click="showTagTooltip(song.id)"`
- **Native Tooltip**: `:title` attribute for accessibility
- **Custom Tooltip**: Positioned absolutely with arrow pointer
- **Styling**: Yellow color (`#ffd200`), small size (3x3), inline positioning

### Tooltip Management

```typescript
// Show tag tooltip
const showTagTooltip = (songId: string) => {
  showTagTooltipId.value = songId;
  // Auto-hide after 3 seconds
  setTimeout(() => {
    showTagTooltipId.value = null;
  }, 3000);
};
```

**Tooltip Behavior:**
- **Single Tooltip**: Only one tooltip visible at a time
- **Auto-hide**: Disappears after 3 seconds
- **Manual Control**: Can be triggered by click or hover

## Mobile Considerations

### When to Fetch Tag Counts

**Recommended Approach:**
1. **Page Load**: Fetch tag counts immediately after songs load
2. **Song Changes**: Re-fetch when song list changes (new songs, deletions)
3. **Lazy Loading**: Consider lazy loading for large song lists

**Mobile-Specific Timing:**
```typescript
// In Ionic page lifecycle
ionViewDidEnter() {
  // Load tag counts when page becomes visible
  this.loadTagCounts();
}

// Or in Vue composition API
onMounted(async () => {
  await this.fetchSongs();
  await this.loadTagCounts();
});
```

### Network Call Optimization

**Batch Loading Strategy:**
- Load all tag counts in parallel using `Promise.all()`
- Cache results to avoid re-fetching
- Implement retry logic for failed requests

**Mobile Network Considerations:**
```typescript
// Add retry logic for mobile networks
const getSongTagCountWithRetry = async (songId: string, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await getSongTagCount(songId);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

### Caching Strategy for Offline Support

**Local Storage Caching:**
```typescript
// Cache tag counts in local storage
const cacheTagCounts = (songId: string, count: number) => {
  const cache = JSON.parse(localStorage.getItem('tagCounts') || '{}');
  cache[songId] = { count, timestamp: Date.now() };
  localStorage.setItem('tagCounts', JSON.stringify(cache));
};

const getCachedTagCount = (songId: string) => {
  const cache = JSON.parse(localStorage.getItem('tagCounts') || '{}');
  const cached = cache[songId];
  if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
    return cached.count;
  }
  return null;
};
```

### Performance Tips for Low-End Devices

1. **Limit Concurrent Requests**: Process songs in batches of 5-10
2. **Debounce Loading**: Wait for song list to stabilize before loading tags
3. **Memory Management**: Clear old tag counts when songs change
4. **Background Loading**: Load tag counts after UI is rendered

## Code Examples

### Complete Mobile Implementation

```typescript
// Mobile song list component
import { ref, onMounted, watch } from 'vue';
import { useSupabaseService } from '@/composables/useSupabaseService';

export default {
  setup() {
    const { client: supabase } = useSupabaseService();
    
    // State
    const songs = ref([]);
    const songTagCounts = ref<{ [key: string]: number }>({});
    const fetchedTagCounts = ref<Set<string>>(new Set());
    const isLoadingTagCounts = ref(false);
    const showTagTooltipId = ref<string | null>(null);
    
    // Functions
    const getSongTagCount = async (songId: string) => {
      try {
        const { data, error } = await supabase.rpc('get_song_tag_count', {
          p_song_id: songId
        });
        
        if (error) {
          console.error('Error fetching tag count:', error);
          return 0;
        }
        
        return data || 0;
      } catch (error) {
        console.error('Error fetching tag count:', error);
        return 0;
      }
    };
    
    const loadTagCounts = async () => {
      if (!songs.value.length || isLoadingTagCounts.value) return;
      
      isLoadingTagCounts.value = true;
      
      try {
        const songsToFetch = songs.value.filter(s => !fetchedTagCounts.value.has(s.id));
        if (songsToFetch.length === 0) return;

        const tagCountPromises = songsToFetch.map(async (song) => {
          const count = await getSongTagCount(song.id);
          return { songId: song.id, count };
        });
        
        const results = await Promise.all(tagCountPromises);
        
        results.forEach(({ songId, count }) => {
          songTagCounts.value[songId] = count;
          fetchedTagCounts.value.add(songId);
        });
      } finally {
        isLoadingTagCounts.value = false;
      }
    };
    
    const showTagTooltip = (songId: string) => {
      showTagTooltipId.value = songId;
      setTimeout(() => {
        showTagTooltipId.value = null;
      }, 3000);
    };
    
    // Lifecycle
    onMounted(async () => {
      await fetchSongs(); // Your song fetching logic
      await loadTagCounts();
    });
    
    // Watch for song changes
    watch(() => songs.value.map(s => s.id).join(','), async () => {
      await loadTagCounts();
    });
    
    return {
      songs,
      songTagCounts,
      showTagTooltipId,
      showTagTooltip
    };
  }
};
```

### Ionic Template Example

```vue
<template>
  <ion-list>
    <ion-item v-for="song in songs" :key="song.id">
      <ion-label>
        <h2>
          {{ song.title }}
          <!-- Tag icon -->
          <ion-icon 
            v-if="songTagCounts[song.id] > 0"
            name="pricetag" 
            color="warning"
            size="small"
            @click="showTagTooltip(song.id)"
            :title="`Tags: ${songTagCounts[song.id]}`">
          </ion-icon>
        </h2>
        <p>{{ song.artist }}</p>
      </ion-label>
      
      <!-- Custom tooltip -->
      <div v-if="showTagTooltipId === song.id" class="tooltip">
        Tags: {{ songTagCounts[song.id] }}
      </div>
    </ion-item>
  </ion-list>
</template>
```

## Testing Strategy

### Verification Steps

1. **Network Tab Verification:**
   - Open browser dev tools → Network tab
   - Load My Songs page
   - Look for `get_song_tag_count` RPC calls
   - Verify calls are made for each song

2. **UI Verification:**
   - Check that tag icons appear for songs with tags
   - Verify tooltips show correct counts
   - Test tooltip auto-hide functionality

3. **Performance Testing:**
   - Monitor network request timing
   - Check for duplicate requests
   - Verify caching works correctly

### Edge Cases to Test

1. **No Tags**: Songs with 0 tags should not show icons
2. **Many Tags**: Songs with high tag counts should display correctly
3. **Loading States**: UI should handle loading gracefully
4. **Network Errors**: Should degrade gracefully (show 0 counts)
5. **Rapid Changes**: Multiple song list updates should not cause duplicate requests

### Debugging Tips

```typescript
// Add debug logging
const loadTagCounts = async () => {
  console.log('Loading tag counts for', songs.value.length, 'songs');
  
  const songsToFetch = songs.value.filter(s => !fetchedTagCounts.value.has(s.id));
  console.log('Songs to fetch:', songsToFetch.length);
  
  // ... rest of implementation
};
```

**Common Issues:**
- **No RPC calls**: Check if `get_song_tag_count` function exists in database
- **Icons not showing**: Verify `songTagCounts[song.id] > 0` condition
- **Tooltips not working**: Check click handlers and state management
- **Performance issues**: Monitor batch size and caching effectiveness

## Summary

The tag count functionality is a well-optimized system that:

1. **Fetches data efficiently** using batch RPC calls
2. **Caches results** to prevent duplicate requests
3. **Updates automatically** when song lists change
4. **Handles errors gracefully** with fallback values
5. **Provides good UX** with loading states and tooltips

For mobile implementation, focus on:
- Network optimization for mobile connections
- Proper caching for offline support
- Performance considerations for low-end devices
- Ionic-specific UI components and styling
