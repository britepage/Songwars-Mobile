# SongWars Frontend API Integration

## Overview
SongWars frontend integrates with **Supabase** as the primary backend service, providing real-time data synchronization, authentication, file storage, and database operations. The integration follows modern patterns with type safety, error handling, and real-time updates.

## Supabase Integration

### 1. Core Setup
**Configuration**:
```typescript
// nuxt.config.ts
modules: ['@nuxtjs/supabase'],
supabase: {
  url: process.env.NUXT_PUBLIC_SUPABASE_URL,
  key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
  redirect: true,
  redirectOptions: {
    login: '/sign-in',
    callback: '/reset-password',
    exclude: ['/registration', '/reset-password', '/reset-password-email', '/user', '/user/', '/user/*']
  },
  clientOptions: {
    auth: {
      flowType: 'pkce'
    }
  }
}
```

**Environment Variables**:
```env
NUXT_PUBLIC_SUPABASE_URL=your_supabase_url
NUXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

### 2. Client Initialization
**Composables**:
```typescript
// Auto-imported composables
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { $supabase } = useNuxtApp()
```

**Type Safety**:
```typescript
// types/supabase.ts
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          // ... other fields
        }
        // ... other table definitions
      }
    }
  }
}
```

## Authentication Integration

### 1. Authentication Methods
**Email/Password Authentication**:
```typescript
// store/authStore.ts
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return data
}
```

**OAuth Authentication**:
```typescript
const signInWithOAuth = async (provider: 'google' | 'facebook') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  })
  if (error) throw error
  return data
}
```

**User Registration**:
```typescript
const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/reset-password`
    }
  })
  if (error) throw error
  return data
}
```

### 2. Session Management
**User State Watching**:
```typescript
// Automatic user state management
watch(user, async (newUser, oldUser) => {
  authenticatedUser.value = !!newUser
  accessToken.value = newUser?.id || null
  
  if (newUser && (!oldUser || newUser.id !== oldUser?.id)) {
    await profileStore.fetchProfile()
  } else if (!newUser && oldUser) {
    profileStore.profile.value = null
  }
})
```

**Token Management**:
```typescript
// Automatic token refresh handled by Supabase
const { data: { session } } = await supabase.auth.getSession()
const { data: { user } } = await supabase.auth.getUser()
```

## Database Operations

### 1. CRUD Operations
**Create Operations**:
```typescript
// Create new profile
const createProfile = async (profileData: ProfileData) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profileData)
    .select()
    .single()
  
  if (error) throw error
  return data
}
```

**Read Operations**:
```typescript
// Fetch user's songs
const fetchSongs = async () => {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('user_id', user.value?.id)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}
```

**Update Operations**:
```typescript
// Update song metadata
const updateSong = async (songId: string, updates: Partial<Song>) => {
  const { data, error } = await supabase
    .from('songs')
    .update(updates)
    .eq('id', songId)
    .select()
    .single()
  
  if (error) throw error
  return data
}
```

**Delete Operations**:
```typescript
// Soft delete song
const softDeleteSong = async (songId: string) => {
  const { data, error } = await supabase
    .rpc('soft_delete_song', { p_song_id: songId })
  
  if (error) throw error
  return data
}
```

### 2. RPC Function Calls
**Database Functions**:
```typescript
// Call RPC functions
const getFlaggedSongs = async () => {
  const { data, error } = await supabase
    .rpc('get_flagged_songs_summary')
  
  if (error) throw error
  return data
}

const reviewFlag = async (songId: string, decision: string) => {
  const { data, error } = await supabase
    .rpc('review_flag', { 
      p_song_id: songId, 
      p_decision: decision 
    })
  
  if (error) throw error
  return data
}
```

### 3. Complex Queries
**Joins and Relations**:
```typescript
// Fetch songs with profile data
const fetchSongsWithProfiles = async () => {
  const { data, error } = await supabase
    .from('songs')
    .select(`
      *,
      profiles:user_id (
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('is_active', true)
  
  if (error) throw error
  return data
}
```

**Filtering and Sorting**:
```typescript
// Advanced filtering
const fetchFilteredSongs = async (filters: SongFilters) => {
  let query = supabase
    .from('songs')
    .select('*')
    .eq('is_active', true)
  
  if (filters.genre) {
    query = query.eq('genre', filters.genre)
  }
  
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }
  
  if (filters.sortBy) {
    query = query.order(filters.sortBy, { ascending: filters.ascending })
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}
```

## Real-Time Subscriptions

### 1. Real-Time Data Sync
**Song Updates**:
```typescript
// Subscribe to song changes
const subscribeToSongs = () => {
  const channel = supabase
    .channel('songs')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'songs',
      filter: `user_id=eq.${user.value?.id}`
    }, (payload) => {
      console.log('Song changed:', payload)
      // Update local state
      songStore.handleSongUpdate(payload)
    })
    .subscribe()
  
  return channel
}
```

**Battle Results**:
```typescript
// Subscribe to battle results
const subscribeToBattles = () => {
  const channel = supabase
    .channel('battles')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'votes'
    }, (payload) => {
      console.log('New vote:', payload)
      // Update battle state
      battleStore.handleNewVote(payload)
    })
    .subscribe()
  
  return channel
}
```

### 2. Subscription Management
**Lifecycle Management**:
```typescript
// Component subscription management
onMounted(() => {
  const channel = subscribeToSongs()
  
  onUnmounted(() => {
    supabase.removeChannel(channel)
  })
})
```

**Error Handling**:
```typescript
// Subscription error handling
const channel = supabase
  .channel('songs')
  .on('postgres_changes', { /* ... */ }, handleUpdate)
  .on('system', { event: 'error' }, (error) => {
    console.error('Subscription error:', error)
    // Handle reconnection
  })
  .subscribe()
```

## File Storage Integration

### 1. File Upload
**Audio File Upload**:
```typescript
// Upload song audio
const uploadSong = async (file: File, songId: string) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${songId}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('song-audio')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    })
  
  if (error) throw error
  return data
}
```

**Avatar Upload**:
```typescript
// Upload user avatar
const uploadAvatar = async (file: File, userId: string) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    })
  
  if (error) throw error
  return data
}
```

### 2. File Management
**Get Public URL**:
```typescript
// Get public file URL
const getPublicUrl = (bucket: string, fileName: string) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)
  
  return data.publicUrl
}
```

**File Deletion**:
```typescript
// Delete file
const deleteFile = async (bucket: string, fileName: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([fileName])
  
  if (error) throw error
}
```

## Error Handling

### 1. API Error Handling
**Standardized Error Handling**:
```typescript
// Generic error handler
const handleApiError = (error: any) => {
  console.error('API Error:', error)
  
  if (error.code === 'PGRST116') {
    return 'Record not found'
  }
  
  if (error.code === '23505') {
    return 'Record already exists'
  }
  
  return error.message || 'An unexpected error occurred'
}
```

**Store-Level Error Handling**:
```typescript
// Store error handling
const fetchSongs = async () => {
  try {
    loading.value = true
    error.value = null
    
    const { data, error: fetchError } = await supabase
      .from('songs')
      .select('*')
    
    if (fetchError) throw fetchError
    
    songs.value = data
  } catch (err) {
    error.value = handleApiError(err)
  } finally {
    loading.value = false
  }
}
```

### 2. User Feedback
**Error Display**:
```vue
<template>
  <div v-if="error" class="error-message">
    <p>{{ error }}</p>
    <button @click="retry">Retry</button>
  </div>
</template>
```

**Loading States**:
```vue
<template>
  <div v-if="loading" class="loading">
    <div class="spinner"></div>
    <p>Loading...</p>
  </div>
</template>
```

## Performance Optimizations

### 1. Query Optimization
**Selective Fields**:
```typescript
// Only select needed fields
const fetchSongs = async () => {
  const { data } = await supabase
    .from('songs')
    .select('id, title, artist, url, created_at')
    .eq('user_id', user.value?.id)
  
  return data
}
```

**Pagination**:
```typescript
// Implement pagination
const fetchSongsPaginated = async (page: number, limit: number = 20) => {
  const from = page * limit
  const to = from + limit - 1
  
  const { data } = await supabase
    .from('songs')
    .select('*')
    .range(from, to)
    .order('created_at', { ascending: false })
  
  return data
}
```

### 2. Caching Strategy
**Client-Side Caching**:
```typescript
// Simple caching mechanism
const cache = new Map()

const fetchWithCache = async (key: string, fetcher: () => Promise<any>) => {
  if (cache.has(key)) {
    return cache.get(key)
  }
  
  const data = await fetcher()
  cache.set(key, data)
  return data
}
```

**Store Caching**:
```typescript
// Store-level caching
const fetchSongs = async (forceRefresh = false) => {
  if (!forceRefresh && songs.value.length > 0) {
    return songs.value
  }
  
  const data = await supabase
    .from('songs')
    .select('*')
  
  songs.value = data
  return data
}
```

## Security Considerations

### 1. Row Level Security (RLS)
**Automatic RLS**:
```typescript
// RLS policies are enforced automatically
const fetchUserSongs = async () => {
  // Only returns songs user has access to
  const { data } = await supabase
    .from('songs')
    .select('*')
  
  return data
}
```

**Admin Operations**:
```typescript
// Admin operations with service role
const adminOperation = async () => {
  const { data } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', user.value?.id)
    .single()
  
  if (!data) {
    throw new Error('Admin access required')
  }
  
  // Perform admin operation
}
```

### 2. Input Validation
**Client-Side Validation**:
```typescript
// Validate input before API calls
const validateSongData = (data: SongData) => {
  if (!data.title || data.title.trim().length === 0) {
    throw new Error('Title is required')
  }
  
  if (!data.artist || data.artist.trim().length === 0) {
    throw new Error('Artist is required')
  }
  
  return true
}
```

**Type Safety**:
```typescript
// Type-safe API calls
interface SongData {
  title: string
  artist: string
  genre?: string
}

const createSong = async (data: SongData) => {
  validateSongData(data)
  
  const { data: result, error } = await supabase
    .from('songs')
    .insert(data)
    .select()
    .single()
  
  if (error) throw error
  return result
}
```

## Testing Strategy

### 1. API Testing
**Mock Supabase Client**:
```typescript
// Mock Supabase for testing
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        data: mockSongs,
        error: null
      }))
    }))
  }))
}
```

**Store Testing**:
```typescript
// Test store with mocked API
describe('SongStore', () => {
  it('should fetch songs', async () => {
    const store = useSongStore()
    await store.fetchSongs()
    expect(store.songs).toEqual(mockSongs)
  })
})
```

### 2. Integration Testing
**E2E API Testing**:
```typescript
// Test complete API flows
describe('Song Upload Flow', () => {
  it('should upload and create song', async () => {
    const file = new File(['audio'], 'test.mp3')
    const songData = { title: 'Test Song', artist: 'Test Artist' }
    
    const result = await uploadSong(file, songData)
    expect(result).toBeDefined()
  })
})
```

This comprehensive API integration documentation provides developers with a complete understanding of how the SongWars frontend integrates with Supabase, enabling effective development and maintenance of the API layer.
