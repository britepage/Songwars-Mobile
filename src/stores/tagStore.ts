import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabaseService } from '@/services/supabase.service'
import { useAuthStore } from '@/stores/authStore'

export const useTagStore = defineStore('tags', () => {
  // User's tagged song IDs
  const taggedIds = ref<Set<string>>(new Set())
  const isLoadingUserTags = ref(false)

  // Future: shared counts cache (for MySongs/Leaderboard/Profile)
  const tagCounts = ref<Map<string, number>>(new Map())
  const fetchedTagCounts = ref<Set<string>>(new Set())
  const isLoadingTagCounts = ref(false)

  const loadUserTags = async (): Promise<void> => {
    const auth = useAuthStore()
    if (!auth.user?.id || isLoadingUserTags.value) return
    isLoadingUserTags.value = true
    try {
      const { data, error } = await supabaseService.getClient()
        .from('user_tags' as any)
        .select('song_id')
        .eq('user_id', auth.user.id)
      if (!error) {
        taggedIds.value = new Set((data || []).map((r: any) => r.song_id))
      }
    } finally {
      isLoadingUserTags.value = false
    }
  }

  const isTagged = (songId?: string): boolean => !!(songId && taggedIds.value.has(songId))

  const tag = async (songId: string): Promise<void> => {
    const auth = useAuthStore()
    if (!auth.user?.id) return
    const { error } = await supabaseService.getClient()
      .from('user_tags' as any)
      .insert({ user_id: auth.user.id, song_id: songId })
    if (!error) taggedIds.value.add(songId)
  }

  const untag = async (songId: string): Promise<void> => {
    const auth = useAuthStore()
    if (!auth.user?.id) return
    const { error } = await supabaseService.getClient()
      .from('user_tags' as any)
      .delete()
      .eq('user_id', auth.user.id)
      .eq('song_id', songId)
    if (!error) taggedIds.value.delete(songId)
  }

  const toggle = async (songId: string): Promise<void> => {
    if (isTagged(songId)) {
      await untag(songId)
    } else {
      await tag(songId)
    }
  }

  // Get tag count for a single song via RPC
  const getSongTagCount = async (songId: string): Promise<number> => {
    try {
      const { data, error } = await supabaseService.getClient().rpc('get_song_tag_count' as any, {
        p_song_id: songId
      })
      
      if (error) {
        console.error('Error fetching tag count:', error)
        return 0
      }
      
      return (data as number) || 0
    } catch (error) {
      console.error('Error fetching tag count:', error)
      return 0
    }
  }

  // Load tag counts for multiple songs (batch loading with caching)
  const loadTagCounts = async (songIds: string[]): Promise<void> => {
    if (songIds.length === 0 || isLoadingTagCounts.value) return
    
    isLoadingTagCounts.value = true
    
    try {
      // Only fetch counts we don't already have (caching)
      const songsToFetch = songIds.filter(id => !fetchedTagCounts.value.has(id))
      if (songsToFetch.length === 0) return

      const tagCountPromises = songsToFetch.map(async (songId) => {
        const count = await getSongTagCount(songId)
        return { songId, count }
      })
      
      const results = await Promise.all(tagCountPromises)
      
      // Update reactive state
      results.forEach(({ songId, count }) => {
        tagCounts.value.set(songId, count)
        fetchedTagCounts.value.add(songId)
      })
    } finally {
      isLoadingTagCounts.value = false
    }
  }

  const clear = (): void => {
    taggedIds.value = new Set()
    tagCounts.value = new Map()
    fetchedTagCounts.value = new Set()
  }

  return {
    taggedIds,
    isLoadingUserTags,
    tagCounts,
    fetchedTagCounts,
    isLoadingTagCounts,
    loadUserTags,
    isTagged,
    tag,
    untag,
    toggle,
    getSongTagCount,
    loadTagCounts,
    clear
  }
})


