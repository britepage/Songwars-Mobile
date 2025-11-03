import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabaseService } from '@/services/supabase.service'
import { useAuthStore } from '@/stores/authStore'

type FlagCategory = 'hate_speech' | 'copyright'

export const useFlagStore = defineStore('flags', () => {
  const userFlags = ref<Record<string, Record<FlagCategory, boolean>>>({})
  const isLoadingFlags = ref(false)

  const loadUserFlags = async (songIds: string[]): Promise<void> => {
    const auth = useAuthStore()
    if (!auth.user?.id || songIds.length === 0) return
    isLoadingFlags.value = true
    try {
      const { data, error } = await supabaseService.getClient()
        .from('song_flags')
        .select('song_id, category')
        .eq('user_id', auth.user.id)
        .in('song_id', songIds)
      if (!error) {
        const next: Record<string, Record<FlagCategory, boolean>> = {}
        ;(data || []).forEach((row: any) => {
          const id = row.song_id as string
          const cat = row.category as FlagCategory
          if (!next[id]) next[id] = { hate_speech: false, copyright: false }
          next[id][cat] = true
        })
        userFlags.value = next
      }
    } finally {
      isLoadingFlags.value = false
    }
  }

  const hasUserFlagged = (songId?: string, category?: FlagCategory): boolean => {
    if (!songId) return false
    if (!category) return !!userFlags.value[songId] && (userFlags.value[songId].hate_speech || userFlags.value[songId].copyright)
    return !!userFlags.value[songId]?.[category]
  }

  const hasAny = (songId?: string): boolean => hasUserFlagged(songId)

  const flagSong = async (songId: string, category: FlagCategory, reason?: string | null): Promise<void> => {
    await supabaseService.getClient().rpc('flag_song' as any, {
      p_song_id: songId,
      p_category: category,
      p_reason: reason || null
    })
    // Refresh just this song's flags
    await loadUserFlags([songId])
  }

  const clear = (): void => {
    userFlags.value = {}
  }

  return {
    userFlags,
    isLoadingFlags,
    loadUserFlags,
    hasUserFlagged,
    hasAny,
    flagSong,
    clear
  }
})


