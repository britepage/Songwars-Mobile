import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabaseService } from '@/services/supabase.service'

// Simplified types to avoid deep instantiation issues
interface Song {
  id: string
  user_id: string
  created_at: string
  title: string
  artist: string
  filename: string | null
  url: string | null
  likes: number
  dislikes: number
  churnState: any
  genre: string | null
  is_active: boolean | null
  churn_start_date: string | null
  last_score_update: string | null
  clip_start_time: number | null
  is_public: boolean | null
  privacy_level: string | null
  status: 'live' | 'under_review' | 'removed'
  rights_confirmed: boolean
  status_changed_at: string | null
  status_changed_by: string | null
  status_change_reason: string | null
  deleted_at: string | null
  trash_expires_at: string | null
  deleted_by: string | null
  is_test_data: boolean | null
  total_tags_received: number | null
}

type SongInsert = Omit<Song, 'id' | 'created_at'>
type SongUpdate = Partial<SongInsert>

export const useSongStore = defineStore('songs', () => {
  // State
  const songs = ref<Song[]>([])
  const currentSong = ref<Song | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const userSongs = computed(() => songs.value.filter(song => song.status === 'live'))
  const deletedSongs = computed(() => songs.value.filter(song => song.status === 'removed'))
  const songsByGenre = computed(() => {
    return (genre: string) => userSongs.value.filter(song => song.genre === genre)
  })

  // Actions
  const fetchUserSongs = async (userId?: string) => {
    try {
      isLoading.value = true
      error.value = null

      const currentUser = await supabaseService.getCurrentUser()
      const targetUserId = userId || currentUser?.id

      if (!targetUserId) {
        throw new Error('No user ID provided')
      }

      const { data, error: fetchError } = await supabaseService.getClient()
        .from('songs')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      songs.value = data || []
      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch songs'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const fetchSongById = async (songId: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: fetchError } = await supabaseService.getClient()
        .from('songs')
        .select('*')
        .eq('id', songId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      currentSong.value = data
      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch song'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const uploadSong = async (songData: {
    title: string
    artist: string
    genre: string
    file: File
  }) => {
    try {
      isLoading.value = true
      error.value = null

      const currentUser = await supabaseService.getCurrentUser()
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      // Upload file to storage
      const fileName = `${currentUser.id}/${Date.now()}_${songData.file.name}`
      const { error: uploadError } = await supabaseService.uploadFile(
        'song-audio',
        fileName,
        songData.file
      )

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const publicUrl = supabaseService.getPublicUrl('song-audio', fileName)

      // Create song record
      const newSong: SongInsert = {
        user_id: currentUser.id,
        title: songData.title,
        artist: songData.artist,
        genre: songData.genre,
        url: publicUrl,
        filename: songData.file.name,
        likes: 0,
        dislikes: 0,
        churnState: null,
        is_active: true,
        churn_start_date: null,
        last_score_update: null,
        clip_start_time: null,
        is_public: true,
        privacy_level: 'public',
        status: 'live',
        rights_confirmed: true,
        status_changed_at: null,
        status_changed_by: null,
        status_change_reason: null,
        deleted_at: null,
        trash_expires_at: null,
        deleted_by: null,
        is_test_data: false,
        total_tags_received: 0,
      }

      const { data, error: insertError } = await supabaseService.getClient()
        .from('songs')
        .insert(newSong)
        .select()
        .single()

      if (insertError) {
        // Clean up uploaded file if database insert fails
        await supabaseService.deleteFile('song-audio', fileName)
        throw insertError
      }

      // Add to local state
      songs.value.unshift(data)
      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to upload song'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const updateSong = async (songId: string, updates: SongUpdate) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: updateError } = await supabaseService.getClient()
        .from('songs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', songId)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      // Update local state
      const index = songs.value.findIndex(song => song.id === songId)
      if (index !== -1) {
        songs.value[index] = data
      }

      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update song'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const softDeleteSong = async (songId: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: deleteError } = await supabaseService.getClient()
        .rpc('soft_delete_song', { p_song_id: songId })

      if (deleteError) {
        throw deleteError
      }

      // Update local state with the returned song data
      const index = songs.value.findIndex(song => song.id === songId)
      if (index !== -1 && data) {
        songs.value[index] = data
      }

      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete song'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const restoreSong = async (songId: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: restoreError } = await supabaseService.getClient()
        .rpc('restore_song', { p_song_id: songId })

      if (restoreError) {
        throw restoreError
      }

      // Update local state with the returned song data
      const index = songs.value.findIndex(song => song.id === songId)
      if (index !== -1 && data) {
        songs.value[index] = data
      }

      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to restore song'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const permanentlyDeleteSong = async (songId: string) => {
    try {
      isLoading.value = true
      error.value = null

      // Get song info first to delete the file
      const song = songs.value.find(s => s.id === songId)
      if (song && song.url) {
        // Delete file from storage
        const fileName = song.url.split('/').pop()
        if (fileName) {
          await supabaseService.deleteFile('song-audio', `${song.user_id}/${fileName}`)
        }
      }

      // Delete from database
      const { error: deleteError } = await supabaseService.getClient()
        .from('songs')
        .delete()
        .eq('id', songId)

      if (deleteError) {
        throw deleteError
      }

      // Remove from local state
      songs.value = songs.value.filter(song => song.id !== songId)

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to permanently delete song'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const fetchSongsByGenre = async (genre: string, limit = 50) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: fetchError } = await supabaseService.getClient()
        .from('songs')
        .select('*')
        .eq('genre', genre)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (fetchError) {
        throw fetchError
      }

      return { success: true, data: data || [] }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch songs by genre'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const searchSongs = async (query: string, genre?: string) => {
    try {
      isLoading.value = true
      error.value = null

      let queryBuilder = supabaseService.getClient()
        .from('songs')
        .select('*')
        .eq('is_deleted', false)
        .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20)

      if (genre) {
        queryBuilder = queryBuilder.eq('genre', genre)
      }

      const { data, error: searchError } = await queryBuilder

      if (searchError) {
        throw searchError
      }

      return { success: true, data: data || [] }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to search songs'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const clearSongs = () => {
    songs.value = []
    currentSong.value = null
    error.value = null
  }

  const clearError = () => {
    error.value = null
  }

  // General fetch songs method (alias for fetchUserSongs)
  const fetchSongs = fetchUserSongs

  return {
    // State
    songs,
    currentSong,
    isLoading,
    error,
    
    // Getters
    userSongs,
    deletedSongs,
    songsByGenre,
    
    // Actions
    fetchSongs,
    fetchUserSongs,
    fetchSongById,
    uploadSong,
    updateSong,
    softDeleteSong,
    restoreSong,
    permanentlyDeleteSong,
    fetchSongsByGenre,
    searchSongs,
    clearSongs,
    clearError,
  }
})
