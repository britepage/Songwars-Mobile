# Trash Page Complete Implementation - Production Web App Reference

**Document Version:** 1.0  
**Last Updated:** October 15, 2025  
**Purpose:** Comprehensive implementation guide for trash management functionality to achieve pixel-perfect parity between mobile and web app

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Database Functions & API](#database-functions--api)
3. [State Management](#state-management)
4. [Trash Card UI Design](#trash-card-ui-design)
5. [Tab Navigation](#tab-navigation)
6. [Confirmation Modals](#confirmation-modals)
7. [Error Handling & Edge Cases](#error-handling--edge-cases)
8. [Loading States](#loading-states)
9. [Empty State](#empty-state)
10. [Integration Guidelines](#integration-guidelines)
11. [Complete Code Examples](#complete-code-examples)

---

## Executive Summary

### Key Features
- **Soft Delete System**: 10-day trash window with automatic expiration
- **Dual Confirmation Modals**: Separate modals for soft delete vs hard delete
- **Real-time Count Display**: Dynamic tab count showing trashed songs
- **Expiration Countdown**: Live countdown showing days until permanent deletion
- **Restore Logic**: Smart restoration based on song churn state (week 4 vs active)
- **Comprehensive Error Handling**: Network failures, ownership validation, expired trash

### Database Architecture
- **4 RPC Functions**: Complete trash lifecycle management
- **Security**: User ownership validation on all operations
- **Audit Logging**: All operations logged for compliance
- **Storage Cleanup**: Automatic file deletion on hard delete

---

## Database Functions & API

### 1. get_my_trashed_songs()

**Purpose:** Retrieves all songs in trash for the current user with expiration info

**Function Signature:**
```sql
CREATE OR REPLACE FUNCTION public.get_my_trashed_songs()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  title text,
  artist text,
  filename text,
  url text,
  likes integer,
  dislikes integer,
  created_at timestamptz,
  status song_status,
  churn_start_date timestamptz,
  "churnState" jsonb,
  is_active boolean,
  last_score_update timestamptz,
  genre text,
  clip_start_time numeric,
  deleted_at timestamptz,
  trash_expires_at timestamptz,
  deleted_by uuid
)
```

**Security Rules:**
- Only returns songs belonging to authenticated user (`auth.uid()`)
- Filters out expired trash (`trash_expires_at > now()`)
- Orders by deletion date (newest first)

**Usage:**
```typescript
const { data, error } = await supabase.rpc('get_my_trashed_songs');
```

### 2. restore_song(p_song_id uuid)

**Purpose:** Restores a song from trash with smart active state restoration

**Function Signature:**
```sql
CREATE OR REPLACE FUNCTION public.restore_song(p_song_id uuid)
RETURNS public.songs
```

**Restoration Logic:**
- **Week 4 Songs (Eliminated)**: Restore as inactive (`is_active = false`)
- **Active Songs (Weeks 0-3)**: Restore as active (`is_active = true`)
- Clears deletion timestamps (`deleted_at`, `trash_expires_at`, `deleted_by`)

**Security Validation:**
- User ownership verification
- Trash status verification
- Expiration check (`trash_expires_at > now()`)

**Error Conditions:**
- `'Not authenticated'` - No valid user session
- `'Song not found, not in trash, expired, or not owned by you'` - Invalid restoration attempt

### 3. hard_delete_song(p_song_id uuid)

**Purpose:** Permanently deletes a song and its audio file

**Function Signature:**
```sql
CREATE OR REPLACE FUNCTION public.hard_delete_song(p_song_id uuid)
RETURNS boolean
```

**Process:**
1. Validates user ownership and trash status
2. Logs hard deletion action in audit_log
3. Deletes song record from database
4. Removes audio file from storage bucket

**Storage Cleanup:**
```sql
DELETE FROM storage.objects 
WHERE bucket_id = 'song-audio' AND name = v_filename;
```

**Security Validation:**
- User ownership verification
- Trash status verification (song must be soft deleted)

### 4. soft_delete_song(p_song_id uuid)

**Purpose:** Moves a song to trash with 10-day expiration

**Function Signature:**
```sql
CREATE OR REPLACE FUNCTION public.soft_delete_song(p_song_id uuid)
RETURNS boolean
```

**Process:**
1. Sets `deleted_at` to current timestamp
2. Sets `trash_expires_at` to 10 days from now
3. Sets `is_active` to false
4. Logs deletion action

**Expiration Logic:**
- **10-day window**: `trash_expires_at = now() + interval '10 days'`
- **Automatic cleanup**: Daily cron job purges expired trash

---

## State Management

### SongStore Implementation

**Location:** `store/songStore.ts`

#### State Variables
```typescript
// Trash state management
const trashedSongs = ref<Song[]>([]);
const loadingTrashedSongs = ref(false);
```

#### Core Functions

**fetchTrashedSongs()**
```typescript
const fetchTrashedSongs = async () => {
  loadingTrashedSongs.value = true;
  trashedSongs.value = [];

  if (!user.value) {
    console.warn('SongStore: No authenticated user found to fetch trashed songs for.');
    loadingTrashedSongs.value = false;
    return;
  }

  try {
    const { data, error } = await supabase.rpc('get_my_trashed_songs');

    if (error) {
      console.error('SongStore: Failed to fetch trashed songs:', error.message);
      trashedSongs.value = [];
      return;
    }
    trashedSongs.value = data as Song[] || [];
    console.log(`SongStore: Fetched ${trashedSongs.value.length} trashed songs for user.`);
  } catch (error: any) {
    console.error('SongStore: Unexpected error fetching trashed songs:', error.message);
    trashedSongs.value = [];
  } finally {
    loadingTrashedSongs.value = false;
  }
};
```

**softDeleteSong(songId: string)**
```typescript
const softDeleteSong = async (songId: string): Promise<boolean> => {
  if (!user.value) {
    console.error('SongStore: No authenticated user found for soft delete.');
    return false;
  }

  try {
    const { error } = await supabase.rpc('soft_delete_song', { p_song_id: songId });

    if (error) {
      console.error('SongStore: Failed to soft delete song:', error.message);
      return false;
    }

    // Remove from active songs list
    songs.value = songs.value.filter(song => song.id !== songId);
    
    // Refresh trash if it's currently loaded
    if (trashedSongs.value.length > 0) {
      await fetchTrashedSongs();
    }

    console.log('SongStore: Song soft deleted successfully:', songId);
    return true;
  } catch (error: any) {
    console.error('SongStore: Unexpected error soft deleting song:', error.message);
    return false;
  }
};
```

**restoreSong(songId: string)**
```typescript
const restoreSong = async (songId: string): Promise<boolean> => {
  if (!user.value) {
    console.error('SongStore: No authenticated user found for restore.');
    return false;
  }

  try {
    const { error } = await supabase.rpc('restore_song', { p_song_id: songId });

    if (error) {
      console.error('SongStore: Failed to restore song:', error.message);
      return false;
    }

    // Remove from trashed songs list
    trashedSongs.value = trashedSongs.value.filter(song => song.id !== songId);
    
    // Don't refresh active songs here - let the component handle it with proper filters
    // await fetchSongs(); // Removed to prevent clearing filters

    console.log('SongStore: Song restored successfully:', songId);
    return true;
  } catch (error: any) {
    console.error('SongStore: Unexpected error restoring song:', error.message);
    return false;
  }
};
```

**hardDeleteSong(songId: string)**
```typescript
const hardDeleteSong = async (songId: string): Promise<boolean> => {
  if (!user.value) {
    console.error('SongStore: No authenticated user found for hard delete.');
    return false;
  }

  try {
    const { error } = await supabase.rpc('hard_delete_song', { p_song_id: songId });

    if (error) {
      console.error('SongStore: Failed to hard delete song:', error.message);
      return false;
    }

    // Remove from trashed songs list
    trashedSongs.value = trashedSongs.value.filter(song => song.id !== songId);

    console.log('SongStore: Song hard deleted successfully:', songId);
    return true;
  } catch (error: any) {
    console.error('SongStore: Unexpected error hard deleting song:', error.message);
    return false;
  }
};
```

#### Store Exports
```typescript
export const useSongStore = defineStore('song', () => {
  // ... other state and functions

  return {
    // ... other exports
    trashedSongs,
    loadingTrashedSongs,
    fetchSongs,
    fetchTrashedSongs,
    softDeleteSong,
    restoreSong,
    hardDeleteSong,
    // ... other exports
  };
});
```

---

## Trash Card UI Design

### Card Container Styling

**Location:** `components/dashboard/songList.vue` (lines 351-407)

**Container Classes:**
```vue
<div v-for="song in songStore.trashedSongs" :key="song.id" 
  class="border rounded-xl p-6 text-center flex flex-col justify-between hover:border-red-500/50 transition-all duration-300 border-gray-700 bg-gray-800 theme-bg-card theme-border-card">
```

**Visual Specifications:**
- **Background**: Dark gray (`bg-gray-800`) with theme support
- **Border**: Gray border (`border-gray-700`) with red hover effect
- **Padding**: 24px (`p-6`)
- **Border Radius**: Extra large (`rounded-xl`)
- **Hover Effect**: Red border highlight (`hover:border-red-500/50`)

### Song Information Display

**Title and Artist:**
```vue
<h3 class="font-semibold text-gray-300 text-lg mb-1 break-words">{{ song.title }}</h3>
<p class="text-gray-500 text-sm mb-4 italic">{{ song.artist }}</p>
```

**Visual Specifications:**
- **Title**: Large, semibold, gray text (`text-gray-300 text-lg font-semibold`)
- **Artist**: Small, italic, muted gray (`text-gray-500 text-sm italic`)

### Trash Status Box

**Red Status Container:**
```vue
<div class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
  <p class="text-red-400 text-sm font-medium">Moved to trash</p>
  <p class="text-red-300 text-xs mt-1">
    {{ getTrashExpiryText(song.trash_expires_at || null) }}
  </p>
</div>
```

**Visual Specifications:**
- **Background**: Red tint (`bg-red-500/10`)
- **Border**: Red border (`border-red-500/20`)
- **Padding**: 12px (`p-3`)
- **Border Radius**: Large (`rounded-lg`)
- **Status Text**: Red medium weight (`text-red-400 text-sm font-medium`)
- **Expiry Text**: Lighter red, extra small (`text-red-300 text-xs`)

### Metrics Display

**Votes and Approval:**
```vue
<p class="text-gray-400 text-sm flex items-center justify-center space-x-3">
  <span>Total Votes: {{ (song.likes || 0) + (song.dislikes || 0) }}</span>
  <span class="text-gray-600">|</span>
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
```

**Color Logic:**
- **≥70%**: Yellow (`text-[#ffd200]`)
- **<50%**: Red (`text-red-500`)
- **0%**: Gray (`text-gray-400`)

### Timestamps

**Upload and Deletion Dates:**
```vue
<p class="text-xs text-gray-500 mt-3">Uploaded: {{ formatDate(song.created_at) }}</p>
<p class="text-xs text-red-400 mt-1">Deleted: {{ song.deleted_at ? formatDate(song.deleted_at) : 'Unknown' }}</p>
```

**Visual Specifications:**
- **Upload Date**: Gray, extra small (`text-xs text-gray-500`)
- **Deletion Date**: Red, extra small (`text-xs text-red-400`)

### Action Buttons

**Button Container:**
```vue
<div class="mt-4 flex justify-center space-x-2">
```

**Restore Button:**
```vue
<button
  @click="restoreSong(song.id)"
  :disabled="restoringSong === song.id"
  class="px-3 py-2 bg-[#ffd200] text-black rounded-lg hover:bg-[#e6bd00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center"
>
  <svg v-if="restoringSong !== song.id" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
  </svg>
  <div v-else class="animate-spin rounded-full h-4 w-4 mr-1 border-b-2 border-black"></div>
  {{ restoringSong === song.id ? 'Restoring...' : 'Restore' }}
</button>
```

**Hard Delete Button:**
```vue
<button
  @click="confirmHardDelete(song)"
  :disabled="hardDeletingSong === song.id"
  class="px-3 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center"
>
  <svg v-if="hardDeletingSong !== song.id" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16"/>
  </svg>
  <div v-else class="animate-spin rounded-full h-4 w-4 mr-1 border-b-2 border-white"></div>
  {{ hardDeletingSong === song.id ? 'Deleting...' : 'Delete Permanently' }}
</button>
```

**Button Specifications:**
- **Restore**: Yellow background (`bg-[#ffd200]`), black text, restore icon
- **Delete**: Red background (`bg-red-700`), white text, trash icon
- **Loading**: Spinner animation with disabled state
- **Spacing**: 8px gap between buttons (`space-x-2`)

---

## Tab Navigation

### Tab Structure

**Location:** `components/dashboard/songList.vue` (lines 27-42)

**Tab Implementation:**
```vue
<nav class="flex space-x-8" role="tablist" aria-label="Song management tabs">
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
```

### Tab Specifications

**Active State:**
- **Border**: Yellow underline (`border-[#ffd200]`)
- **Text**: Yellow color (`text-[#ffd200]`)

**Inactive State:**
- **Border**: Transparent (`border-transparent`)
- **Text**: Gray color (`text-gray-400`)
- **Hover**: Light gray text and border

**Dynamic Count:**
- **Active Songs**: Shows total count with loading state
- **Trash**: Shows trashed songs count (`songStore.trashedSongs.length`)

**Accessibility:**
- **ARIA Labels**: Descriptive labels with counts
- **Keyboard Navigation**: Tab keydown handling
- **Role Attributes**: Proper tablist/tab roles

---

## Confirmation Modals

### 1. Soft Delete Modal

**Location:** `components/dashboard/songList.vue` (lines 418-459)

**Modal Structure:**
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

**Visual Specifications:**
- **Background**: Dark overlay (`bg-black bg-opacity-50`)
- **Modal**: Dark gray (`bg-gray-900`) with rounded corners
- **Warning Box**: Yellow tint (`bg-yellow-500/10`) with yellow border
- **Primary Button**: Red (`bg-red-600`) with loading state
- **Secondary Button**: Gray (`bg-gray-700`)

### 2. Hard Delete Modal

**Location:** `components/dashboard/songList.vue` (lines 462-510)

**Modal Structure:**
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
          :disabled="!canConfirmHardDelete || hardDeleting"
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

**Key Features:**
- **Red Warning Box**: More severe warning than soft delete
- **Name Confirmation**: Required text input matching song title
- **Disabled Submit**: Button disabled until name matches exactly
- **Stronger Language**: "Permanently delete" vs "Move to Trash"

**Confirmation Logic:**
```typescript
const canConfirmHardDelete = computed(() => {
  return songNameConfirmation.value === songToHardDelete.value?.title;
});
```

---

## Error Handling & Edge Cases

### 1. Expired Trash Handling

**Scenario:** Songs past the 10-day expiration limit

**Database Behavior:**
- `get_my_trashed_songs()` filters out expired songs (`trash_expires_at > now()`)
- Expired songs are automatically purged by daily cron job

**UI Behavior:**
- Expired songs don't appear in trash list
- No special UI needed - they simply don't exist

**Error Prevention:**
```sql
-- Restore function validates expiration
AND s.trash_expires_at > now()
```

### 2. Ownership Validation Errors

**Database Errors:**
- `'Song not found or access denied'` - Invalid song ID or wrong user
- `'Song not found in trash or access denied'` - Song not in trash or wrong user

**UI Handling:**
```typescript
if (error) {
  console.error('SongStore: Failed to restore song:', error.message);
  return false;
}
```

**User Feedback:**
- Console error logging
- Silent failure with no user notification (security best practice)

### 3. Network Failure Recovery

**Implementation:**
```typescript
try {
  const { data, error } = await supabase.rpc('get_my_trashed_songs');
  // ... success handling
} catch (error: any) {
  console.error('SongStore: Unexpected error fetching trashed songs:', error.message);
  trashedSongs.value = [];
} finally {
  loadingTrashedSongs.value = false;
}
```

**Recovery Strategy:**
- Clear existing data on error
- Reset loading state
- Allow user to retry operation

### 4. Storage Cleanup Failures

**Database Implementation:**
```sql
-- Clean up storage if filename exists
IF v_filename IS NOT NULL THEN
  DELETE FROM storage.objects 
  WHERE bucket_id = 'song-audio' AND name = v_filename;
END IF;
```

**Error Handling:**
- Storage cleanup failure doesn't prevent database deletion
- Logged for admin investigation
- Orphaned files cleaned up by periodic maintenance

### 5. Restore Logic for Eliminated Songs

**Smart Restoration:**
```sql
-- Store the original is_active state before deletion
SELECT 
  CASE 
    WHEN ("churnState"->>'week')::integer = 5 THEN false  -- Eliminated songs stay inactive
    ELSE true  -- Songs still in churn (weeks 0-4) become active again
  END INTO v_original_is_active
FROM public.songs 
WHERE id = p_song_id;
```

**Logic:**
- **Week 4 Songs**: Restored as inactive (churn completed)
- **Active Songs**: Restored as active (still in churn)

---

## Loading States

### 1. Initial Trash Load

**Location:** `components/dashboard/songList.vue` (lines 346-349)

**Loading Spinner:**
```vue
<div v-if="songStore.loadingTrashedSongs" class="text-center py-8">
  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffd200] mx-auto"></div>
  <p class="mt-4 text-gray-400">Loading trashed songs...</p>
</div>
```

**Specifications:**
- **Spinner Size**: 48px (`h-12 w-12`)
- **Spinner Color**: Yellow (`border-[#ffd200]`)
- **Animation**: Spin (`animate-spin`)
- **Text**: Gray loading message

### 2. Per-Button Loading States

**Restore Button Loading:**
```vue
<div v-else class="animate-spin rounded-full h-4 w-4 mr-1 border-b-2 border-black"></div>
{{ restoringSong === song.id ? 'Restoring...' : 'Restore' }}
```

**Delete Button Loading:**
```vue
<div v-else class="animate-spin rounded-full h-4 w-4 mr-1 border-b-2 border-white"></div>
{{ hardDeletingSong === song.id ? 'Deleting...' : 'Delete Permanently' }}
```

**Loading Specifications:**
- **Spinner Size**: 16px (`h-4 w-4`)
- **Restore Spinner**: Black border (matches button text)
- **Delete Spinner**: White border (matches button text)
- **Text Changes**: "Restoring..." / "Deleting..."
- **Disabled State**: `disabled:opacity-50 disabled:cursor-not-allowed`

### 3. State Management

**Loading State Variables:**
```typescript
const restoringSong = ref<string | null>(null);
const hardDeletingSong = ref<string | null>(null);
```

**Loading Pattern:**
```typescript
const restoreSong = async (songId: string) => {
  restoringSong.value = songId;
  try {
    const success = await songStore.restoreSong(songId);
    if (success) {
      // Success handling
    }
  } finally {
    restoringSong.value = null;
  }
};
```

---

## Empty State

### Empty State Design

**Location:** `components/dashboard/songList.vue` (lines 409-413)

**Empty State Structure:**
```vue
<div v-else class="text-center py-12">
  <div class="text-gray-600 text-6xl mb-4">🗑️</div>
  <p class="text-gray-500 text-lg">No trashed songs</p>
  <p class="text-gray-600 mt-2">Deleted songs will appear here for 10 days</p>
</div>
```

**Visual Specifications:**
- **Icon**: Trash can emoji (6xl size)
- **Main Text**: "No trashed songs" (large, gray)
- **Subtext**: "Deleted songs will appear here for 10 days" (smaller, lighter gray)
- **Spacing**: 48px vertical padding (`py-12`)
- **Layout**: Centered text alignment

**Conditional Display:**
- Shows when `songStore.trashedSongs.length === 0`
- Only displays when not loading (`!songStore.loadingTrashedSongs`)

---

## Integration Guidelines

### Implementation Checklist

#### 1. Database Integration
- [ ] Implement all 4 RPC functions (`get_my_trashed_songs`, `restore_song`, `hard_delete_song`, `soft_delete_song`)
- [ ] Add proper error handling for all database operations
- [ ] Implement user ownership validation
- [ ] Add audit logging for all operations

#### 2. State Management
- [ ] Add trash state to existing songStore
- [ ] Implement reactive updates for all operations
- [ ] Add loading states for all async operations
- [ ] Handle error states gracefully

#### 3. UI Components
- [ ] Add trash tab to existing SongList component
- [ ] Implement trash card design matching production
- [ ] Add both confirmation modals (soft delete + hard delete)
- [ ] Implement loading states and animations
- [ ] Add empty state design

#### 4. Helper Functions
- [ ] Implement `getTrashExpiryText()` for countdown display
- [ ] Implement `formatDate()` for timestamp formatting
- [ ] Add approval rate calculation functions
- [ ] Implement confirmation validation logic

#### 5. Error Handling
- [ ] Handle network failures
- [ ] Handle ownership validation errors
- [ ] Handle expired trash edge cases
- [ ] Add proper error logging

#### 6. Testing Requirements
- [ ] Test 10-day expiration logic
- [ ] Test restore behavior for eliminated vs active songs
- [ ] Test confirmation modal validation
- [ ] Test loading states and animations
- [ ] Test empty state display

### Integration Points

#### Existing SongList Component
- **Location**: `components/dashboard/songList.vue`
- **Integration**: Add trash tab to existing tab navigation
- **State**: Use existing `activeTab` state management
- **Styling**: Match existing card design patterns

#### Existing SongStore
- **Location**: `store/songStore.ts`
- **Integration**: Add trash functions to existing store
- **State**: Extend existing state management patterns
- **Error Handling**: Follow existing error handling patterns

#### Existing Modal System
- **Integration**: Add trash modals to existing modal system
- **Styling**: Match existing modal design patterns
- **Behavior**: Follow existing confirmation patterns

---

## Complete Code Examples

### Helper Functions

**Trash Expiry Text:**
```typescript
const getTrashExpiryText = (trashExpiresAt: string | null) => {
  if (!trashExpiresAt) return 'Unknown expiry';
  
  const now = new Date();
  const expiry = new Date(trashExpiresAt);
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) {
    return 'Expires today';
  } else if (diffDays === 1) {
    return 'Expires tomorrow';
  } else {
    return `Expires in ${diffDays} days`;
  }
};
```

**Date Formatting:**
```typescript
const formatDate = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};
```

**Approval Rate Calculation:**
```typescript
const calculateApprovalRate = (likes: number, dislikes: number) => {
  const total = (likes || 0) + (dislikes || 0);
  if (total === 0) return 0;
  return Math.round(((likes || 0) / total) * 100);
};

const getApprovalRateNumber = (likes: number, dislikes: number) => {
  const total = (likes || 0) + (dislikes || 0);
  if (total === 0) return 0;
  return Math.round(((likes || 0) / total) * 100);
};
```

### Modal State Management

**Modal State Variables:**
```typescript
const showDeleteModal = ref(false);
const showHardDeleteModal = ref(false);
const songToDelete = ref<Song | null>(null);
const songToHardDelete = ref<Song | null>(null);
const songNameConfirmation = ref('');
const deleting = ref(false);
const hardDeleting = ref(false);
```

**Modal Control Functions:**
```typescript
const confirmDelete = (song: Song) => {
  songToDelete.value = song;
  showDeleteModal.value = true;
};

const confirmHardDelete = (song: Song) => {
  songToHardDelete.value = song;
  songNameConfirmation.value = '';
  showHardDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  songToDelete.value = null;
};

const closeHardDeleteModal = () => {
  showHardDeleteModal.value = false;
  songToHardDelete.value = null;
  songNameConfirmation.value = '';
};
```

### Action Handlers

**Soft Delete Handler:**
```typescript
const deleteSong = async () => {
  if (!songToDelete.value) return;
  
  deleting.value = true;
  try {
    const success = await songStore.softDeleteSong(songToDelete.value.id);
    if (success) {
      closeDeleteModal();
    }
  } finally {
    deleting.value = false;
  }
};
```

**Hard Delete Handler:**
```typescript
const hardDeleteSong = async () => {
  if (!songToHardDelete.value) return;
  
  hardDeleting.value = true;
  try {
    const success = await songStore.hardDeleteSong(songToHardDelete.value.id);
    if (success) {
      closeHardDeleteModal();
    }
  } finally {
    hardDeleting.value = false;
  }
};
```

**Restore Handler:**
```typescript
const restoreSong = async (songId: string) => {
  restoringSong.value = songId;
  try {
    const success = await songStore.restoreSong(songId);
    if (success) {
      // Success feedback
    }
  } finally {
    restoringSong.value = null;
  }
};
```

### Confirmation Validation

**Hard Delete Confirmation:**
```typescript
const canConfirmHardDelete = computed(() => {
  return songNameConfirmation.value === songToHardDelete.value?.title;
});
```

### Complete Trash Card Template

```vue
<div v-for="song in songStore.trashedSongs" :key="song.id" 
  class="border rounded-xl p-6 text-center flex flex-col justify-between hover:border-red-500/50 transition-all duration-300 border-gray-700 bg-gray-800 theme-bg-card theme-border-card">
  <div>
    <!-- Song Title and Artist -->
    <h3 class="font-semibold text-gray-300 text-lg mb-1 break-words">{{ song.title }}</h3>
    <p class="text-gray-500 text-sm mb-4 italic">{{ song.artist }}</p>
    
    <!-- Trash Status Box -->
    <div class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
      <p class="text-red-400 text-sm font-medium">Moved to trash</p>
      <p class="text-red-300 text-xs mt-1">
        {{ getTrashExpiryText(song.trash_expires_at || null) }}
      </p>
    </div>

    <!-- Metrics Row -->
    <p class="text-gray-400 text-sm flex items-center justify-center space-x-3">
      <span>Total Votes: {{ (song.likes || 0) + (song.dislikes || 0) }}</span>
      <span class="text-gray-600">|</span>
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
    
    <!-- Timestamps -->
    <p class="text-xs text-gray-500 mt-3">Uploaded: {{ formatDate(song.created_at) }}</p>
    <p class="text-xs text-red-400 mt-1">Deleted: {{ song.deleted_at ? formatDate(song.deleted_at) : 'Unknown' }}</p>
    
    <!-- Action Buttons -->
    <div class="mt-4 flex justify-center space-x-2">
      <button
        @click="restoreSong(song.id)"
        :disabled="restoringSong === song.id"
        class="px-3 py-2 bg-[#ffd200] text-black rounded-lg hover:bg-[#e6bd00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center"
      >
        <svg v-if="restoringSong !== song.id" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
        </svg>
        <div v-else class="animate-spin rounded-full h-4 w-4 mr-1 border-b-2 border-black"></div>
        {{ restoringSong === song.id ? 'Restoring...' : 'Restore' }}
      </button>
      <button
        @click="confirmHardDelete(song)"
        :disabled="hardDeletingSong === song.id"
        class="px-3 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center"
      >
        <svg v-if="hardDeletingSong !== song.id" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
        <div v-else class="animate-spin rounded-full h-4 w-4 mr-1 border-b-2 border-white"></div>
        {{ hardDeletingSong === song.id ? 'Deleting...' : 'Delete Permanently' }}
      </button>
    </div>
  </div>
</div>
```

---

## Summary

This comprehensive implementation guide provides everything needed to implement trash management functionality with exact production parity. The system includes:

- **Complete Database Layer**: 4 RPC functions with security and audit logging
- **Robust State Management**: Reactive updates with error handling
- **Pixel-Perfect UI**: Exact styling matching production design
- **Comprehensive Modals**: Dual confirmation system with validation
- **Smart Logic**: Expiration handling, restore logic, and edge cases
- **Production-Ready Code**: Complete examples ready for implementation

The implementation follows existing patterns in the codebase while providing the specialized functionality needed for trash management.

---

**End of Document**
