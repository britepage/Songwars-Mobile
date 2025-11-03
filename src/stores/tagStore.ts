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

  // Placeholders for future consolidation
  const getSongTagCount = async (_songId: string): Promise<number> => {
    return tagCounts.value.get(_songId) ?? 0
  }

  const loadTagCounts = async (_songIds: string[]): Promise<void> => {
    // Intentionally left minimal for now; MySongs keeps its local logic
    return
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


