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
}

export const useLeaderboardStore = defineStore('leaderboard', () => {
  // State
  const leaderboard = ref<LeaderboardEntry[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentGenre = ref('all')
  const currentWeek = ref(0)

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

  // Actions
  const fetchLeaderboard = async (genre = 'all', weekOffset = 0) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: fetchError } = await supabaseService.getClient()
        .rpc('get_leaderboard_by_genre_and_week', {
          genre_filter: genre,
          week: weekOffset
        })

      if (fetchError) {
        throw fetchError
      }

      leaderboard.value = data || []
      currentGenre.value = genre
      currentWeek.value = weekOffset
      
      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch leaderboard'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const fetchLeaderboardByGenre = async (genre: string, weekOffset = 0) => {
    return await fetchLeaderboard(genre, weekOffset)
  }

  const fetchWeeklyLeaderboard = async (weekOffset = 0) => {
    return await fetchLeaderboard('all', weekOffset)
  }

  const fetchMonthlyLeaderboard = async () => {
    // 4 weeks back for monthly view
    return await fetchLeaderboard('all', -4)
  }

  const fetchAllTimeLeaderboard = async () => {
    // Week offset 0 gets all-time data
    return await fetchLeaderboard('all', 0)
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
    return await fetchLeaderboard(currentGenre.value, currentWeek.value)
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
    
    // Getters
    topSongs,
    topSongsByGenre,
    genreStats,
    
    // Actions
    fetchLeaderboard,
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
