import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabaseService } from '@/services/supabase.service'

type LeaderboardEntry = {
  song_id: string
  title: string
  artist: string
  genre: string
  score: number
  total_votes: number
  rank: number
  week_number: number
  is_active: boolean
  username: string
  audio_url?: string
  clip_start_time?: number
  completion_date?: string
}

export const useLeaderboardStore = defineStore('leaderboard', () => {
  // State
  const leaderboard = ref<LeaderboardEntry[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentGenre = ref('all')
  const currentWeek = ref(0)
  const availableGenres = ref<string[]>([])
  const genresLoading = ref(false)
  const churnEvents = ref<any[]>([])
  const churnEventsLoading = ref(false)

  // Getters
  const topSongs = computed(() => leaderboard.value.slice(0, 10))
  const topSongsByGenre = computed(() => {
    return (genre: string) => leaderboard.value.filter(entry => entry.genre === genre).slice(0, 10)
  })

  const genreStats = computed(() => {
    const stats: Record<string, { count: number; avgScore: number }> = {}
    
    leaderboard.value.forEach(entry => {
      if (!stats[entry.genre]) {
        stats[entry.genre] = { count: 0, avgScore: 0 }
      }
      stats[entry.genre].count++
      stats[entry.genre].avgScore += entry.score
    })

    // Calculate average scores
    Object.keys(stats).forEach(genre => {
      stats[genre].avgScore = stats[genre].avgScore / stats[genre].count
    })

    return stats
  })

  const leaderboardByGenre = computed(() => {
    const grouped: Record<string, LeaderboardEntry[]> = {}
    leaderboard.value.forEach(entry => {
      if (!grouped[entry.genre]) {
        grouped[entry.genre] = []
      }
      if (grouped[entry.genre].length < 10) {
        grouped[entry.genre].push(entry)
      }
    })
    return grouped
  })

  const genres = computed(() => {
    return [...availableGenres.value].sort()
  })

  // Actions
  const fetchLeaderboard = async (
    genre: string = 'all', 
    week: '1' | '2' | '3' | '4' = '3',
    churnWeek?: string
  ) => {
    try {
      isLoading.value = true
      error.value = null

      let data: any[] = []

      // Handle Hall of Fame (week 4) separately
      if (week === '4') {
        // Get churn week date range if specified
        let startDate: string | undefined
        let endDate: string | undefined
        
        if (churnWeek && churnWeek !== 'all') {
          const event = churnEvents.value.find(e => e.churn_week_number === parseInt(churnWeek))
          if (event) {
            startDate = event.event_date
            // End date is next event or current date
            const nextEvent = churnEvents.value.find(e => e.churn_week_number === parseInt(churnWeek) + 1)
            endDate = nextEvent ? nextEvent.event_date : new Date().toISOString()
          }
        }

        const { data: hofData, error: hofError } = await supabaseService.getClient()
          .rpc('get_hall_of_fame_per_genre', {
            p_churn_week_start: startDate || null,
            p_churn_week_end: endDate || null
          })

        if (hofError) throw hofError
        data = hofData || []
      } else {
        // Regular weeks (1-3)
        // Build RPC parameters conditionally - omit genre_filter when all genres selected
        const rpcParams: any = {
          week: parseInt(week)
        }

        // Only include genre_filter if a specific genre is selected
        if (genre && genre !== 'all' && genre !== '') {
          rpcParams.genre_filter = genre
        }

        const { data: weekData, error: weekError } = await supabaseService.getClient()
          .rpc('get_leaderboard_by_genre_and_week', rpcParams)

        if (weekError) throw weekError
        data = weekData || []

        // Fetch audio URLs separately for regular weeks
        if (data.length > 0) {
          const songIds = data.map((entry: any) => entry.song_id)
          const { data: songsData, error: songsError } = await supabaseService.getClient()
            .from('songs')
            .select('id, url, clip_start_time')
            .in('id', songIds)

          if (!songsError && songsData) {
            const audioMap = new Map(songsData.map((s: any) => [s.id, { url: s.url, clip_start_time: s.clip_start_time || 0 }]))
            data = data.map((entry: any) => ({
              ...entry,
              audio_url: audioMap.get(entry.song_id)?.url,
              clip_start_time: audioMap.get(entry.song_id)?.clip_start_time || 0
            }))
          }
        }
      }

      leaderboard.value = data
      currentGenre.value = genre
      currentWeek.value = week === 'hof' ? 4 : parseInt(week)
      
      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch leaderboard'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const fetchAvailableGenres = async (week: '1' | '2' | '3' | '4' = '3') => {
    try {
      genresLoading.value = true
      const { data, error: fetchError } = await supabaseService.getClient()
        .rpc('get_leaderboard_available_genres', {
          week: week === '4' ? 4 : parseInt(week)
        })

      if (fetchError) throw fetchError

      // Extract genre strings from returned data
      availableGenres.value = (data || []).map((item: any) => 
        typeof item === 'string' ? item : item.genre || item.name
      ).filter(Boolean)
    } catch (err) {
      console.error('Failed to fetch available genres:', err)
      availableGenres.value = []
    } finally {
      genresLoading.value = false
    }
  }

  const fetchChurnEvents = async () => {
    // Return cached data if already loaded
    if (churnEvents.value.length > 0) {
      return churnEvents.value
    }

    try {
      churnEventsLoading.value = true
      const { data, error: fetchError } = await supabaseService.getClient()
        .rpc('get_churn_events_with_song_counts')

      if (fetchError) throw fetchError

      // Map events with churn week numbers and sort by date
      churnEvents.value = (data || [])
        .map((event: any, index: number) => ({
          ...event,
          churn_week_number: index + 1
        }))
        .sort((a: any, b: any) => 
          new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
        )
    } catch (err) {
      console.error('Failed to fetch churn events:', err)
      churnEvents.value = []
    } finally {
      churnEventsLoading.value = false
    }
  }

  const fetchLeaderboardByGenre = async (genre: string, weekOffset = 0) => {
    return await fetchLeaderboard(genre, weekOffset.toString() as '1' | '2' | '3' | '4')
  }

  const fetchWeeklyLeaderboard = async (weekOffset = 0) => {
    const week = weekOffset.toString() as '1' | '2' | '3' | '4'
    return await fetchLeaderboard('all', week)
  }

  const fetchMonthlyLeaderboard = async () => {
    // Use week 3 for monthly view
    return await fetchLeaderboard('all', '3')
  }

  const fetchAllTimeLeaderboard = async () => {
    // Use week 3 for all-time data
    return await fetchLeaderboard('all', '3')
  }

  const getSongRank = (songId: string) => {
    const entry = leaderboard.value.find(entry => entry.song_id === songId)
    return entry ? entry.rank : null
  }

  const getSongStats = (songId: string) => {
    const entry = leaderboard.value.find(entry => entry.song_id === songId)
    return entry ? {
      rank: entry.rank,
      totalVotes: entry.total_votes,
      score: entry.score
    } : null
  }

  const refreshLeaderboard = async () => {
    const week = currentWeek.value.toString() as '1' | '2' | '3' | '4'
    return await fetchLeaderboard(currentGenre.value, week)
  }

  const getTopGenres = (limit = 5) => {
    const stats = genreStats.value
    return Object.entries(stats)
      .sort(([,a], [,b]) => b.avgScore - a.avgScore)
      .slice(0, limit)
      .map(([genre, stats]) => ({
        genre,
        count: stats.count,
        avgScore: stats.avgScore
      }))
  }

  const getTrendingSongs = (limit = 10) => {
    // Songs with high win rate and recent activity
    return leaderboard.value
      .filter(entry => entry.score > 70 && entry.total_votes > 5)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  const getRisingSongs = (limit = 10) => {
    // Songs with good win rate but fewer votes (potential to rise)
    return leaderboard.value
      .filter(entry => entry.score > 60 && entry.total_votes < 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  const searchLeaderboard = (query: string) => {
    const searchTerm = query.toLowerCase()
    return leaderboard.value.filter(entry => 
      entry.title.toLowerCase().includes(searchTerm) ||
      entry.artist.toLowerCase().includes(searchTerm)
    )
  }

  const getGenreLeaderboard = (genre: string) => {
    return leaderboard.value
      .filter(entry => entry.genre === genre)
      .sort((a, b) => a.rank - b.rank)
  }

  const exportLeaderboard = () => {
    const data = leaderboard.value.map(entry => ({
      rank: entry.rank,
      title: entry.title,
      artist: entry.artist,
      genre: entry.genre,
      totalVotes: entry.total_votes,
      score: entry.score
    }))

    const csv = [
      'Rank,Title,Artist,Genre,Total Votes,Score',
      ...data.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `songwars-leaderboard-${currentGenre.value}-week-${currentWeek.value}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const clearLeaderboard = () => {
    leaderboard.value = []
    error.value = null
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    leaderboard,
    isLoading,
    error,
    currentGenre,
    currentWeek,
    availableGenres,
    genresLoading,
    churnEvents,
    churnEventsLoading,
    
    // Getters
    topSongs,
    topSongsByGenre,
    genreStats,
    leaderboardByGenre,
    genres,
    
    // Actions
    fetchLeaderboard,
    fetchAvailableGenres,
    fetchChurnEvents,
    fetchLeaderboardByGenre,
    fetchWeeklyLeaderboard,
    fetchMonthlyLeaderboard,
    fetchAllTimeLeaderboard,
    getSongRank,
    getSongStats,
    refreshLeaderboard,
    getTopGenres,
    getTrendingSongs,
    getRisingSongs,
    searchLeaderboard,
    getGenreLeaderboard,
    exportLeaderboard,
    clearLeaderboard,
    clearError,
  }
})
