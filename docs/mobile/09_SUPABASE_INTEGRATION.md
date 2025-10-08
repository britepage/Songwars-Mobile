# 09: Supabase Integration - SongWars Mobile App

## Overview
This guide provides comprehensive instructions for integrating Supabase into the Ionic Vue mobile application. The backend structure remains identical to the web app, so we'll focus on mobile-specific configurations and optimizations.

## Supabase Backend Summary

From the web app documentation, SongWars uses:
- **Tables**: 15 core tables
- **Functions**: 67 RPC functions
- **Triggers**: 3 automated triggers
- **RLS Policies**: 44 security policies
- **Storage Buckets**: 2 (song-audio, avatars)
- **Edge Functions**: 2 (weekly-churn, golden-ears-processor)

## Installation

### 1. Install Supabase Client

```bash
npm install @supabase/supabase-js@^2.50.0
```

### 2. Install Capacitor Storage Plugin

For secure storage of tokens:

```bash
npm install @capacitor/preferences
```

## Environment Configuration

### 1. Update `.env` File

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Supabase Storage
VITE_SUPABASE_STORAGE_URL=https://your-project.supabase.co/storage/v1

# API Configuration
VITE_API_TIMEOUT=30000
VITE_MAX_RETRIES=3
```

### 2. Type Environment Variables

Update `src/types/env.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_STORAGE_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_MAX_RETRIES: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## Supabase Service Layer

### Create Supabase Service

**File**: `src/services/supabase.service.ts`

```typescript
import { createClient, SupabaseClient, User } from '@supabase/supabase-js'
import { Preferences } from '@capacitor/preferences'
import type { Database } from '@/types/supabase'

class SupabaseService {
  private client: SupabaseClient<Database>
  private static instance: SupabaseService

  private constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    this.client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: this.createCustomStorage(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'X-Client-Info': 'songwars-mobile/1.0.0',
        },
      },
    })

    this.setupAuthStateListener()
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService()
    }
    return SupabaseService.instance
  }

  /**
   * Get Supabase client
   */
  public getClient(): SupabaseClient<Database> {
    return this.client
  }

  /**
   * Create custom storage using Capacitor Preferences
   * This ensures tokens are securely stored on mobile devices
   */
  private createCustomStorage() {
    return {
      getItem: async (key: string): Promise<string | null> => {
        const { value } = await Preferences.get({ key })
        return value
      },
      setItem: async (key: string, value: string): Promise<void> => {
        await Preferences.set({ key, value })
      },
      removeItem: async (key: string): Promise<void> => {
        await Preferences.remove({ key })
      },
    }
  }

  /**
   * Setup auth state change listener
   */
  private setupAuthStateListener() {
    this.client.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      
      // Handle auth events
      if (event === 'SIGNED_IN') {
        console.log('User signed in')
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        this.clearCache()
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed')
      } else if (event === 'USER_UPDATED') {
        console.log('User updated')
      }
    })
  }

  /**
   * Clear local cache on sign out
   */
  private async clearCache() {
    try {
      await Preferences.clear()
    } catch (error) {
      console.error('Error clearing cache:', error)
    }
  }

  /**
   * Get current user
   */
  public async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.client.auth.getUser()
    return user
  }

  /**
   * Check if user is authenticated
   */
  public async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await this.client.auth.getSession()
    return !!session
  }

  /**
   * Get current session
   */
  public async getSession() {
    const { data: { session } } = await this.client.auth.getSession()
    return session
  }
}

// Export singleton instance
export const supabaseService = SupabaseService.getInstance()
export const supabase = supabaseService.getClient()
```

## Supabase Composable

### Create useSupabaseService Composable

**File**: `src/composables/useSupabaseService.ts`

```typescript
import { ref, computed } from 'vue'
import { supabase } from '@/services/supabase.service'
import type { User } from '@supabase/supabase-js'

export function useSupabaseService() {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Listen to auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user ?? null
  })

  // Initialize user on composable mount
  const initUser = async () => {
    loading.value = true
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      user.value = currentUser
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Initialize immediately
  initUser()

  return {
    client: supabase,
    user: computed(() => user.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
  }
}
```

## RPC Functions Usage

### Calling Database Functions

All 67 RPC functions from the web app can be called the same way:

```typescript
import { supabase } from '@/services/supabase.service'

// Example: Get available genres
async function getAvailableGenres() {
  const { data, error } = await supabase.rpc('get_available_genres')
  
  if (error) {
    console.error('Error fetching genres:', error)
    return []
  }
  
  return data
}

// Example: Record battle vote
async function recordBattleVote(winnerId: string, loserId: string, userId: string) {
  const { data, error } = await supabase.rpc('record_battle_vote', {
    p_winner_song_id: winnerId,
    p_loser_song_id: loserId,
    p_user_id: userId,
  })
  
  if (error) {
    console.error('Error recording vote:', error)
    throw error
  }
  
  return data
}

// Example: Get leaderboard with pagination
async function getLeaderboard(genre: string, week: number, offset: number = 0) {
  const { data, error } = await supabase.rpc('get_weekly_leaderboard', {
    p_genre: genre,
    p_week: week,
    p_limit: 20,
    p_offset: offset,
  })
  
  if (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }
  
  return data
}
```

### Complete RPC Functions Reference

All 67 functions are documented in `SUPABASE_DATABASE_FUNCTIONS.md`. Key functions for mobile:

**Battle System:**
- `get_random_songs_for_battle(p_genre, p_count)`
- `record_battle_vote(p_winner_song_id, p_loser_song_id, p_user_id)`
- `get_available_genres()`

**Leaderboard:**
- `get_weekly_leaderboard(p_genre, p_week, p_limit, p_offset)`
- `get_hall_of_fame_by_genre(p_genre, p_churn_week, p_limit, p_offset)`

**Songs:**
- `get_user_songs(p_user_id, p_limit, p_offset)`
- `soft_delete_song(p_song_id)`
- `restore_song_from_trash(p_song_id)`
- `hard_delete_song(p_song_id)`

**Profile:**
- `update_user_profile(p_user_id, p_username, p_display_name, p_bio, p_avatar_url)`
- `get_public_profile(p_username)`

**Golden Ears:**
- `get_golden_ears_progress(p_user_id)`
- `get_golden_ears_history(p_user_id)`

**Admin:**
- `get_flagged_songs(p_limit, p_offset)`
- `update_song_status(p_song_id, p_status, p_admin_notes)`

## Storage Integration

### Upload Files to Supabase Storage

```typescript
import { supabase } from '@/services/supabase.service'
import { Camera, CameraResultType } from '@capacitor/camera'

/**
 * Upload audio file to song-audio bucket
 */
async function uploadAudioFile(file: File, userId: string) {
  const fileName = `${userId}/${Date.now()}_${file.name}`
  
  const { data, error } = await supabase.storage
    .from('song-audio')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })
  
  if (error) {
    console.error('Error uploading audio:', error)
    throw error
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('song-audio')
    .getPublicUrl(fileName)
  
  return { path: data.path, url: publicUrl }
}

/**
 * Upload avatar from camera (mobile-specific)
 */
async function uploadAvatarFromCamera(userId: string) {
  // Take photo with camera
  const photo = await Camera.getPhoto({
    resultType: CameraResultType.DataUrl,
    quality: 90,
    width: 500,
    height: 500,
  })
  
  if (!photo.dataUrl) {
    throw new Error('No photo captured')
  }
  
  // Convert data URL to blob
  const response = await fetch(photo.dataUrl)
  const blob = await response.blob()
  const file = new File([blob], `avatar_${Date.now()}.jpg`, { type: 'image/jpeg' })
  
  // Upload to avatars bucket
  const fileName = `${userId}/avatar_${Date.now()}.jpg`
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })
  
  if (error) {
    console.error('Error uploading avatar:', error)
    throw error
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)
  
  return publicUrl
}

/**
 * Delete file from storage
 */
async function deleteStorageFile(bucket: string, path: string) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])
  
  if (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}
```

## Real-Time Subscriptions

### Subscribe to Database Changes

```typescript
import { supabase } from '@/services/supabase.service'
import { ref, onUnmounted } from 'vue'

/**
 * Subscribe to leaderboard updates
 */
function useLeaderboardSubscription() {
  const leaderboard = ref<any[]>([])
  
  const channel = supabase
    .channel('leaderboard-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'songs',
      },
      (payload) => {
        console.log('Leaderboard updated:', payload)
        // Refresh leaderboard data
      }
    )
    .subscribe()
  
  // Clean up subscription on unmount
  onUnmounted(() => {
    supabase.removeChannel(channel)
  })
  
  return { leaderboard }
}

/**
 * Subscribe to user's song updates
 */
function useSongUpdates(userId: string) {
  const songs = ref<any[]>([])
  
  const channel = supabase
    .channel('user-songs')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'songs',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        console.log('Song updated:', payload)
        
        if (payload.eventType === 'INSERT') {
          songs.value.push(payload.new)
        } else if (payload.eventType === 'UPDATE') {
          const index = songs.value.findIndex(s => s.id === payload.new.id)
          if (index !== -1) {
            songs.value[index] = payload.new
          }
        } else if (payload.eventType === 'DELETE') {
          songs.value = songs.value.filter(s => s.id !== payload.old.id)
        }
      }
    )
    .subscribe()
  
  onUnmounted(() => {
    supabase.removeChannel(channel)
  })
  
  return { songs }
}
```

## Error Handling

### Centralized Error Handler

```typescript
// src/utils/supabaseErrorHandler.ts

export interface SupabaseError {
  message: string
  code?: string
  details?: any
}

export function handleSupabaseError(error: any): SupabaseError {
  console.error('Supabase error:', error)
  
  // Network errors
  if (error.message?.includes('Failed to fetch')) {
    return {
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
    }
  }
  
  // Auth errors
  if (error.message?.includes('JWT')) {
    return {
      message: 'Session expired. Please sign in again.',
      code: 'AUTH_ERROR',
    }
  }
  
  // RLS policy errors
  if (error.message?.includes('policy')) {
    return {
      message: 'You do not have permission to perform this action.',
      code: 'PERMISSION_ERROR',
    }
  }
  
  // Unique constraint errors
  if (error.code === '23505') {
    return {
      message: 'This record already exists.',
      code: 'DUPLICATE_ERROR',
    }
  }
  
  // Foreign key errors
  if (error.code === '23503') {
    return {
      message: 'Referenced record not found.',
      code: 'REFERENCE_ERROR',
    }
  }
  
  // Default error
  return {
    message: error.message || 'An unexpected error occurred.',
    code: error.code || 'UNKNOWN_ERROR',
    details: error,
  }
}

// Usage example
import { handleSupabaseError } from '@/utils/supabaseErrorHandler'

async function fetchData() {
  try {
    const { data, error } = await supabase.from('songs').select('*')
    if (error) throw error
    return data
  } catch (error) {
    const handledError = handleSupabaseError(error)
    console.error(handledError.message)
    // Show user-friendly error message
    return []
  }
}
```

## Offline Support

### Queue Requests for Offline Mode

```typescript
// src/services/offlineQueue.service.ts

import { Preferences } from '@capacitor/preferences'
import { Network } from '@capacitor/network'

interface QueuedRequest {
  id: string
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  data: any
  timestamp: number
}

class OfflineQueueService {
  private static QUEUE_KEY = 'supabase_offline_queue'
  
  /**
   * Add request to offline queue
   */
  static async addToQueue(request: Omit<QueuedRequest, 'id' | 'timestamp'>) {
    const queue = await this.getQueue()
    const queuedRequest: QueuedRequest = {
      ...request,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }
    
    queue.push(queuedRequest)
    await this.saveQueue(queue)
  }
  
  /**
   * Process offline queue when back online
   */
  static async processQueue() {
    const status = await Network.getStatus()
    if (!status.connected) return
    
    const queue = await this.getQueue()
    if (queue.length === 0) return
    
    console.log(`Processing ${queue.length} queued requests`)
    
    for (const request of queue) {
      try {
        await this.executeRequest(request)
        // Remove from queue on success
        await this.removeFromQueue(request.id)
      } catch (error) {
        console.error('Error processing queued request:', error)
        // Keep in queue for retry
      }
    }
  }
  
  /**
   * Get offline queue
   */
  private static async getQueue(): Promise<QueuedRequest[]> {
    const { value } = await Preferences.get({ key: this.QUEUE_KEY })
    return value ? JSON.parse(value) : []
  }
  
  /**
   * Save queue
   */
  private static async saveQueue(queue: QueuedRequest[]) {
    await Preferences.set({
      key: this.QUEUE_KEY,
      value: JSON.stringify(queue),
    })
  }
  
  /**
   * Remove from queue
   */
  private static async removeFromQueue(id: string) {
    const queue = await this.getQueue()
    const filtered = queue.filter(r => r.id !== id)
    await this.saveQueue(filtered)
  }
  
  /**
   * Execute queued request
   */
  private static async executeRequest(request: QueuedRequest) {
    const { supabase } = await import('@/services/supabase.service')
    
    if (request.type === 'INSERT') {
      const { error } = await supabase.from(request.table).insert(request.data)
      if (error) throw error
    } else if (request.type === 'UPDATE') {
      const { error } = await supabase.from(request.table)
        .update(request.data)
        .eq('id', request.data.id)
      if (error) throw error
    } else if (request.type === 'DELETE') {
      const { error } = await supabase.from(request.table)
        .delete()
        .eq('id', request.data.id)
      if (error) throw error
    }
  }
}

export default OfflineQueueService

// Usage example
import OfflineQueueService from '@/services/offlineQueue.service'
import { Network } from '@capacitor/network'

async function likeSong(songId: string) {
  try {
    // Try to execute immediately
    const { error } = await supabase.from('song_likes').insert({
      song_id: songId,
      user_id: currentUserId,
    })
    
    if (error) throw error
  } catch (error) {
    // Check if offline
    const status = await Network.getStatus()
    if (!status.connected) {
      // Queue for later
      await OfflineQueueService.addToQueue({
        type: 'INSERT',
        table: 'song_likes',
        data: { song_id: songId, user_id: currentUserId },
      })
      console.log('Queued for offline processing')
    } else {
      throw error
    }
  }
}

// Listen for network status changes
Network.addListener('networkStatusChange', async (status) => {
  if (status.connected) {
    console.log('Back online, processing queue')
    await OfflineQueueService.processQueue()
  }
})
```

## Performance Optimization

### Caching Strategy

```typescript
// src/services/cache.service.ts

import { Preferences } from '@capacitor/preferences'

class CacheService {
  private static CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  
  /**
   * Get cached data
   */
  static async get<T>(key: string): Promise<T | null> {
    const { value } = await Preferences.get({ key: `cache_${key}` })
    if (!value) return null
    
    const cached = JSON.parse(value)
    const age = Date.now() - cached.timestamp
    
    if (age > this.CACHE_DURATION) {
      await this.remove(key)
      return null
    }
    
    return cached.data as T
  }
  
  /**
   * Set cache data
   */
  static async set<T>(key: string, data: T) {
    await Preferences.set({
      key: `cache_${key}`,
      value: JSON.stringify({
        data,
        timestamp: Date.now(),
      }),
    })
  }
  
  /**
   * Remove cached data
   */
  static async remove(key: string) {
    await Preferences.remove({ key: `cache_${key}` })
  }
  
  /**
   * Clear all cache
   */
  static async clear() {
    const { keys } = await Preferences.keys()
    const cacheKeys = keys.filter(k => k.startsWith('cache_'))
    
    for (const key of cacheKeys) {
      await Preferences.remove({ key })
    }
  }
}

export default CacheService

// Usage with Supabase
import CacheService from '@/services/cache.service'

async function getLeaderboard(genre: string, week: number) {
  const cacheKey = `leaderboard_${genre}_${week}`
  
  // Try cache first
  const cached = await CacheService.get(cacheKey)
  if (cached) {
    console.log('Returning cached leaderboard')
    return cached
  }
  
  // Fetch from Supabase
  const { data, error } = await supabase.rpc('get_weekly_leaderboard', {
    p_genre: genre,
    p_week: week,
  })
  
  if (error) throw error
  
  // Cache the result
  await CacheService.set(cacheKey, data)
  
  return data
}
```

## Next Steps

Proceed to:

**[10_AUTHENTICATION.md](10_AUTHENTICATION.md)** - Mobile authentication patterns and OAuth

---

**Document Status**: ✅ Complete  
**Next Guide**: [10_AUTHENTICATION.md](10_AUTHENTICATION.md)  
**Estimated Implementation Time**: 1-2 days

