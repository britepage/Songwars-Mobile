import { ref, computed, onUnmounted } from 'vue'
import { supabaseService } from '@/services/supabase.service'
import { useTagStore } from '@/stores/tagStore'
import { useHowlerPlayer } from './useHowlerPlayer'

export interface TaggedSong {
  song_id: string
  created_at: string
  songs: {
    id: string
    title: string
    artist: string
    genre: string | null
    url: string | null
    clip_start_time: number | null
    user_id: string
  }
  artist_profile?: {
    id: string
    username: string | null
    display_name: string | null
    avatar_url: string | null
  }
}

export function useTaggedSongs() {
  const tagStore = useTagStore()
  const audio = useHowlerPlayer()
  
  const taggedSongs = ref<TaggedSong[]>([])
  const expandedSongs = ref<Set<string>>(new Set())
  const loading = ref(false)
  const audioLoading = ref<Map<string, boolean>>(new Map())
  const audioErrors = ref<Map<string, string | null>>(new Map())
  const progress = ref<Map<string, number>>(new Map())
  const isPlaying = ref<Map<string, boolean>>(new Map())

  const fetchTaggedSongs = async (userId: string) => {
    try {
      loading.value = true
      
      const { data, error } = await supabaseService.getClient()
        .from('user_tags')
        .select(`
          song_id,
          created_at,
          songs!inner (
            id,
            title,
            artist,
            genre,
            url,
            clip_start_time,
            user_id
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Fetch artist profiles separately
      if (data && data.length > 0) {
        const artistIds = [...new Set(data.map((tag: any) => tag.songs?.user_id).filter(Boolean))]
        
        if (artistIds.length > 0) {
          const { data: profilesData } = await supabaseService.getClient()
            .from('profiles')
            .select('id, username, display_name, avatar_url')
            .in('id', artistIds)

          const profilesMap = new Map((profilesData || []).map((p: any) => [p.id, p]))
          
          // Attach profiles to songs
          data.forEach((tag: any) => {
            if (tag.songs?.user_id) {
              tag.songs.profiles = profilesMap.get(tag.songs.user_id)
            }
          })
        }
      }

      if (error) {
        console.error('Error fetching tagged songs:', error)
        taggedSongs.value = []
        return
      }

      // Transform the data to match our interface
      taggedSongs.value = (data || []).map((tag: any) => ({
        song_id: tag.song_id,
        created_at: tag.created_at,
        songs: {
          id: tag.songs.id,
          title: tag.songs.title,
          artist: tag.songs.artist,
          genre: tag.songs.genre,
          url: tag.songs.url,
          clip_start_time: tag.songs.clip_start_time || 0,
          user_id: tag.songs.user_id
        },
        artist_profile: tag.songs.profiles ? {
          id: tag.songs.profiles.id,
          username: tag.songs.profiles.username,
          display_name: tag.songs.profiles.display_name,
          avatar_url: tag.songs.profiles.avatar_url
        } : undefined
      }))
    } catch (err) {
      console.error('Error fetching tagged songs:', err)
      taggedSongs.value = []
    } finally {
      loading.value = false
    }
  }

  const toggleSongExpanded = (songId: string) => {
    if (expandedSongs.value.has(songId)) {
      expandedSongs.value.delete(songId)
    } else {
      expandedSongs.value.add(songId)
    }
  }

  const isSongExpanded = (songId: string): boolean => {
    return expandedSongs.value.has(songId)
  }

  const playTaggedSong = async (song: TaggedSong) => {
    if (!song.songs.url) {
      audioErrors.value.set(song.song_id, 'No audio URL available')
      return
    }

    // If same song is playing, toggle pause
    if (audio.currentSongId.value === song.song_id && audio.isPlaying.value) {
      audio.stopBattleAudio()
      isPlaying.value.set(song.song_id, false)
      progress.value.set(song.song_id, 0)
      return
    }

    // Stop any currently playing audio
    audio.stopBattleAudio()
    
    // Reset state for this song
    audioLoading.value.set(song.song_id, true)
    audioErrors.value.set(song.song_id, null)
    isPlaying.value.set(song.song_id, false)

    try {
      const clipStartTime = song.songs.clip_start_time || 0
      await audio.playBattleSong(
        song.song_id,
        song.songs.url,
        clipStartTime,
        30 // 30-second clip
      )

      // Watch for audio state changes
      isPlaying.value.set(song.song_id, audio.isPlaying.value)
      audioLoading.value.set(song.song_id, audio.isLoading.value)
      
      // Watch for progress updates
      const progressInterval = setInterval(() => {
        if (audio.currentSongId.value === song.song_id) {
          progress.value.set(song.song_id, audio.progress.value)
          isPlaying.value.set(song.song_id, audio.isPlaying.value)
          audioLoading.value.set(song.song_id, audio.isLoading.value)
          
          if (audio.error.value) {
            audioErrors.value.set(song.song_id, audio.error.value)
          }
        } else {
          clearInterval(progressInterval)
          isPlaying.value.set(song.song_id, false)
          progress.value.set(song.song_id, 0)
        }
      }, 100)

      // Store interval for cleanup
      setTimeout(() => {
        clearInterval(progressInterval)
      }, 31000) // Clear after 31 seconds (30s clip + 1s buffer)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to play audio'
      audioErrors.value.set(song.song_id, errorMsg)
      audioLoading.value.set(song.song_id, false)
    } finally {
      // Loading will be set to false when audio loads
    }
  }

  const isSongPlaying = (songId: string): boolean => {
    return audio.currentSongId.value === songId && audio.isPlaying.value
  }

  const untagSong = async (songId: string): Promise<boolean> => {
    try {
      await tagStore.untag(songId)
      
      // Remove from local state
      taggedSongs.value = taggedSongs.value.filter(song => song.song_id !== songId)
      
      // Stop audio if this song is playing
      if (audio.currentSongId.value === songId) {
        audio.stopBattleAudio()
      }
      
      // Clean up state
      expandedSongs.value.delete(songId)
      audioLoading.value.delete(songId)
      audioErrors.value.delete(songId)
      progress.value.delete(songId)
      isPlaying.value.delete(songId)
      
      return true
    } catch (err) {
      console.error('Error untagging song:', err)
      return false
    }
  }

  const retryAudio = async (song: TaggedSong) => {
    audioErrors.value.set(song.song_id, null)
    await playTaggedSong(song)
  }

  const cleanupAllAudio = () => {
    audio.stopBattleAudio()
    audio.cleanup()
    
    // Clear all state
    audioLoading.value.clear()
    audioErrors.value.clear()
    progress.value.clear()
    isPlaying.value.clear()
  }

  // Cleanup on unmount
  onUnmounted(() => {
    cleanupAllAudio()
  })

  return {
    taggedSongs,
    expandedSongs,
    loading,
    audioLoading,
    audioErrors,
    progress,
    isPlaying,
    fetchTaggedSongs,
    toggleSongExpanded,
    isSongExpanded,
    playTaggedSong,
    isSongPlaying,
    untagSong,
    retryAudio,
    cleanupAllAudio
  }
}
