import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabaseService } from '@/services/supabase.service'
import type { Database } from '@/types/supabase'

type Battle = Database['public']['Tables']['battles']['Row']

export const useBattleStore = defineStore('battle', () => {
  // State
  const currentBattle = ref<Battle | null>(null)
  const battleHistory = ref<Battle[]>([])
  const comparisonSongs = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const hasVoted = ref(false)
  const loadingComparison = ref(false)
  const comparisonMessage = ref<string | null>(null)

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

  const recordComparisonVote = async (chosenSongId: string, unchosenSongId: string, userId: string) => {
    try {
      comparisonMessage.value = 'Recording your vote...';
      isLoading.value = true;
      error.value = null;

      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Record the vote using RPC function (RPC creates battle automatically)
      const { error: voteError } = await supabaseService.getClient()
        .rpc('record_comparison_vote', {
          chosen_song_id: chosenSongId,
          unchosen_song_id: unchosenSongId,
          user_id: userId
        });

      if (voteError) {
        throw voteError;
      }

      comparisonMessage.value = 'Vote recorded successfully!';
      hasVoted.value = true;
      comparisonSongs.value = []; // Clear for next comparison

      return { success: true, message: 'Vote recorded successfully' };
    } catch (err: any) {
      error.value = err instanceof Error ? err.message : 'Failed to record vote';
      comparisonMessage.value = err instanceof Error ? err.message : 'Failed to record vote';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

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

  const fetchBattleHistory = async (userId: string, limit = 20) => {
    try {
      isLoading.value = true
      error.value = null

      const targetUserId = userId
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

  const checkUserVote = async (userId: string) => {
    try {
      if (!currentBattle.value) return

      if (!userId) return

      const { data, error: fetchError } = await supabaseService.getClient()
        .from('votes')
        .select('*')
        .eq('comparison_id', currentBattle.value.id)
        .eq('user_id', userId)
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

  const fetchRandomComparisonSongs = async (genre?: string) => {
    loadingComparison.value = true;
    comparisonMessage.value = 'Picking two random songs...';
    comparisonSongs.value = []; // Clear previous songs

    try {
      // Get all active songs IDs for the genre
      let query = supabaseService.getClient()
        .from('songs')
        .select('id')
        .eq('is_active', true)
        .eq('status', 'live');
      
      if (genre) {
        query = query.eq('genre', genre);
      }
      
      const { data: songIds, error: idsError } = await query;
      
      if (idsError) {
        throw idsError;
      }

      if (!songIds || songIds.length < 2) {
        comparisonMessage.value = `Need at least 2 songs for comparison. Only ${songIds?.length || 0} available.`;
        return;
      }

      // Get two random indices
      const index1 = Math.floor(Math.random() * songIds.length);
      let index2;
      do {
        index2 = Math.floor(Math.random() * songIds.length);
      } while (index2 === index1);

      // Fetch the two random songs by their IDs
      const { data: songs, error: songsError } = await supabaseService.getClient()
        .from('songs')
        .select('*')
        .in('id', [songIds[index1].id, songIds[index2].id]);

      if (songsError) {
        throw songsError;
      }

      if (!songs || songs.length !== 2) {
        comparisonMessage.value = 'Failed to retrieve two random songs.';
        return;
      }

      // Randomize the order of the two songs
      const randomizedSongs = Math.random() > 0.5 ? songs : [songs[1], songs[0]];
      comparisonSongs.value = randomizedSongs;
      comparisonMessage.value = 'Two random songs retrieved for comparison!';

    } catch (error: any) {
      console.error('Error fetching random songs:', error.message);
      comparisonMessage.value = `An unexpected error occurred: ${error.message}`;
    } finally {
      loadingComparison.value = false;
    }
  };

  const clearBattle = () => {
    currentBattle.value = null
    hasVoted.value = false
    error.value = null
  }

  const clearError = () => {
    error.value = null
  }

  // Fetch a random battle (alias for fetchRandomComparisonSongs)
  const fetchRandomBattle = fetchRandomComparisonSongs

  // Record vote (alias for voteForSong)
  const recordVote = voteForSong

  return {
    // State
    currentBattle,
    battleHistory,
    comparisonSongs,
    isLoading,
    error,
    hasVoted,
    loadingComparison,
    comparisonMessage,
    
    // Getters
    battleSongs,
    isBattleComplete,
    battleProgress,
    
    // Actions
    createBattle,
    voteForSong,
    recordVote,
    recordComparisonVote,
    refreshBattle,
    fetchBattleHistory,
    fetchBattleById,
    fetchRandomBattle,
    checkUserVote,
    getBattleStats,
    fetchRandomComparisonSongs,
    clearBattle,
    clearError,
  }
})
