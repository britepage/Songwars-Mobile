import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabaseService } from '@/services/supabase.service'
import type { Database } from '@/types/supabase'

type Battle = Database['public']['Tables']['battles']['Row']

export const useBattleStore = defineStore('battle', () => {
  // State
  const currentBattle = ref<Battle | null>(null)
  const battleHistory = ref<Battle[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const hasVoted = ref(false)

  // Getters
  const battleSongs = computed(() => {
    if (!currentBattle.value) return null
    
    return {
      songA: currentBattle.value.song_a_id,
      songB: currentBattle.value.song_b_id
    }
  })

  const isBattleComplete = computed(() => false) // Battles don't have winners in new schema
  const battleProgress = computed(() => {
    if (!currentBattle.value) return 0
    // Progress is tracked separately in votes table
    return 0
  })

  // Actions
  const createBattle = async (song1Id: string, song2Id: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: createError } = await supabaseService.getClient()
        .from('battles')
        .insert({
          song_a_id: song1Id,
          song_b_id: song2Id
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      currentBattle.value = data
      hasVoted.value = false
      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create battle'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const voteForSong = async (songId: string) => {
    try {
      isLoading.value = true
      error.value = null

      if (!currentBattle.value) {
        throw new Error('No active battle')
      }

      if (hasVoted.value) {
        throw new Error('You have already voted in this battle')
      }

      const currentUser = await supabaseService.getCurrentUser()
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      // Record the vote using RPC function
      const { error: voteError } = await supabaseService.getClient()
        .rpc('record_comparison_vote', {
          chosen_song_id: songId,
          unchosen_song_id: currentBattle.value.song_a_id === songId ? currentBattle.value.song_b_id : currentBattle.value.song_a_id,
          user_id: currentUser.id
        })

      if (voteError) {
        throw voteError
      }

      hasVoted.value = true
      
      // Refresh battle data to get updated vote count
      await refreshBattle()

      return { success: true, message: 'Vote recorded successfully' }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to vote'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const refreshBattle = async () => {
    try {
      if (!currentBattle.value) return

      const { data, error: fetchError } = await supabaseService.getClient()
        .from('battles')
        .select('*')
        .eq('id', currentBattle.value.id)
        .single()

      if (fetchError) {
        throw fetchError
      }

      currentBattle.value = data
      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to refresh battle'
      return { success: false, error: error.value }
    }
  }

  const fetchBattleHistory = async (userId?: string, limit = 20) => {
    try {
      isLoading.value = true
      error.value = null

      const currentUser = await supabaseService.getCurrentUser()
      const targetUserId = userId || currentUser?.id

      if (!targetUserId) {
        throw new Error('No user ID provided')
      }

      // Fetch battles where user's songs participated
      const { data, error: fetchError } = await supabaseService.getClient()
        .from('battles')
        .select(`
          *,
          songA:songs!battles_song_a_id_fkey(*),
          songB:songs!battles_song_b_id_fkey(*)
        `)
        .or(`songA.user_id.eq.${targetUserId},songB.user_id.eq.${targetUserId}`)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (fetchError) {
        throw fetchError
      }

      battleHistory.value = data || []
      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch battle history'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const fetchBattleById = async (battleId: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: fetchError } = await supabaseService.getClient()
        .from('battles')
        .select(`
          *,
          songA:songs!battles_song_a_id_fkey(*),
          songB:songs!battles_song_b_id_fkey(*)
        `)
        .eq('id', battleId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      currentBattle.value = data
      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch battle'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const checkUserVote = async () => {
    try {
      if (!currentBattle.value) return

      const currentUser = await supabaseService.getCurrentUser()
      if (!currentUser) return

      const { data, error: fetchError } = await supabaseService.getClient()
        .from('votes')
        .select('*')
        .eq('comparison_id', currentBattle.value.id)
        .eq('user_id', currentUser.id)
        .maybeSingle()

      if (fetchError) {
        throw fetchError
      }

      hasVoted.value = !!data
      return !!data
    } catch (err) {
      console.error('Error checking user vote:', err)
      return false
    }
  }

  const getBattleStats = async (songId: string) => {
    try {
      const { data, error: fetchError } = await supabaseService.getClient()
        .from('battles')
        .select('*')
        .or(`song_a_id.eq.${songId},song_b_id.eq.${songId}`)

      if (fetchError) {
        throw fetchError
      }

      const battles = data || []
      // In the new schema, we need to count votes to determine wins
      const totalBattles = battles.length
      const winRate = 0 // Will need to be calculated from votes table

      return {
        totalBattles,
        wins: 0, // Will need to be calculated from votes table
        losses: totalBattles,
        winRate: Math.round(winRate * 100) / 100
      }
    } catch (err) {
      console.error('Error getting battle stats:', err)
      return {
        totalBattles: 0,
        wins: 0,
        losses: 0,
        winRate: 0
      }
    }
  }

  const startNewBattle = async (genre?: string) => {
    try {
      isLoading.value = true
      error.value = null

      // Fetch two random songs for battle
      let queryBuilder = supabaseService.getClient()
        .from('songs')
        .select('*')
        .eq('is_deleted', false)
        .limit(2)

      if (genre && genre !== 'all') {
        queryBuilder = queryBuilder.eq('genre', genre)
      }

      const { data: songs, error: songsError } = await queryBuilder

      if (songsError) {
        throw songsError
      }

      if (!songs || songs.length < 2) {
        throw new Error('Not enough songs available for battle')
      }

      // Create battle with the two songs
      const result = await createBattle(songs[0].id, songs[1].id)
      
      if (result.success) {
        // Check if user has already voted
        await checkUserVote()
      }

      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to start new battle'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const clearBattle = () => {
    currentBattle.value = null
    hasVoted.value = false
    error.value = null
  }

  const clearError = () => {
    error.value = null
  }

  // Fetch a random battle (alias for startNewBattle)
  const fetchRandomBattle = startNewBattle

  // Record vote (alias for voteForSong)
  const recordVote = voteForSong

  return {
    // State
    currentBattle,
    battleHistory,
    isLoading,
    error,
    hasVoted,
    
    // Getters
    battleSongs,
    isBattleComplete,
    battleProgress,
    
    // Actions
    createBattle,
    voteForSong,
    recordVote,
    refreshBattle,
    fetchBattleHistory,
    fetchBattleById,
    fetchRandomBattle,
    checkUserVote,
    getBattleStats,
    startNewBattle,
    clearBattle,
    clearError,
  }
})
