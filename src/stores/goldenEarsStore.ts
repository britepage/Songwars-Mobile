import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabaseService } from '@/services/supabase.service'
import type { Database } from '@/types/supabase'

type GoldenEars = Database['public']['Tables']['golden_ears']['Row']

export const useGoldenEarsStore = defineStore('goldenEars', () => {
  // State
  const awards = ref<GoldenEars[]>([])
  const userStats = ref<{
    totalAwards: number
    recentAwards: number
    streak: number
    accuracy: number
  }>({
    totalAwards: 0,
    recentAwards: 0,
    streak: 0,
    accuracy: 0
  })
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const totalAwards = computed(() => awards.value.length)
  const recentAwards = computed(() => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    return awards.value.filter(award => 
      new Date(award.created_at) > oneWeekAgo
    ).length
  })

  const awardsByGenre = computed(() => {
    // This would need to be implemented with a join to get song genre
    // For now, return empty object
    return {}
  })

  const currentStreak = computed(() => {
    // Calculate current streak based on consecutive days with awards
    const sortedAwards = [...awards.value].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const award of sortedAwards) {
      const awardDate = new Date(award.created_at)
      awardDate.setHours(0, 0, 0, 0)
      
      const dayDiff = Math.floor((currentDate.getTime() - awardDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (dayDiff === streak) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else if (dayDiff > streak) {
        break
      }
    }

    return streak
  })

  // Actions
  const fetchUserAwards = async (userId?: string) => {
    try {
      isLoading.value = true
      error.value = null

      const currentUser = await supabaseService.getCurrentUser()
      const targetUserId = userId || currentUser?.id

      if (!targetUserId) {
        throw new Error('No user ID provided')
      }

      const { data, error: fetchError } = await supabaseService.getClient()
        .from('golden_ears')
        .select(`
          *,
          judge:profiles!golden_ears_judge_id_fkey(display_name, avatar_url)
        `)
        .eq('judge_id', targetUserId)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      awards.value = data || []
      await calculateUserStats()
      
      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch golden ears awards'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const calculateUserStats = async () => {
    try {
      const currentUser = await supabaseService.getCurrentUser()
      if (!currentUser) return

      // Get total votes count for accuracy calculation
      const { data: votesData, error: votesError } = await supabaseService.getClient()
        .from('votes')
        .select('*', { count: 'exact' })
        .eq('user_id', currentUser.id)

      if (votesError) {
        console.error('Error fetching votes for stats:', votesError)
        return
      }

      const totalVotes = votesData?.length || 0
      const accuracy = totalVotes > 0 ? (awards.value.length / totalVotes) * 100 : 0

      userStats.value = {
        totalAwards: awards.value.length,
        recentAwards: recentAwards.value,
        streak: currentStreak.value,
        accuracy: Math.round(accuracy * 100) / 100
      }
    } catch (err) {
      console.error('Error calculating user stats:', err)
    }
  }

  const checkForGoldenEars = async () => {
    try {
      // In the new schema, golden ears are awarded based on accuracy over time
      // This function would need to be updated to work with the weekly tracking system
      const currentUser = await supabaseService.getCurrentUser()
      if (!currentUser) return

        const { data: existingAward, error: existingError } = await supabaseService.getClient()
        .from('golden_ears')
        .select('*')
        .eq('judge_id', currentUser.id)
          .eq('week_start', new Date().toISOString().split('T')[0])
          .maybeSingle()

        if (existingError) {
          console.error('Error checking existing award:', existingError)
          return
        }

        if (!existingAward) {
          // Award golden ears
          await awardGoldenEars()
          return true
        }

      return false
    } catch (err) {
      console.error('Error checking for golden ears:', err)
      return false
    }
  }

  const awardGoldenEars = async () => {
    try {
      const currentUser = await supabaseService.getCurrentUser()
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      const { data, error: awardError } = await supabaseService.getClient()
        .from('golden_ears')
        .insert({
          judge_id: currentUser.id,
          week_start: new Date().toISOString().split('T')[0],
          week_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          battles_judged: 1,
          accuracy_score: 1.0,
          rank_position: 1,
          awarded: true
        })
        .select()
        .single()

      if (awardError) {
        throw awardError
      }

      // Add to local state
      awards.value.unshift(data)
      await calculateUserStats()

      return { success: true, data }
    } catch (err) {
      console.error('Error awarding golden ears:', err)
      return { success: false, error: err }
    }
  }

  const getLeaderboard = async (limit = 50) => {
    try {
      isLoading.value = true
      error.value = null

      // Fetch all awards with user profiles
      const { data, error: fetchError } = await supabaseService.getClient()
        .from('golden_ears')
        .select(`
          judge_id,
          judge:profiles!golden_ears_judge_id_fkey(display_name, avatar_url)
        `)

      if (fetchError) {
        throw fetchError
      }

      // Group by user_id and count awards
      const leaderboardMap = new Map<string, { user_id: string; display_name: string; avatar_url: string | null; count: number }>()
      
      data?.forEach((award: any) => {
        const userId = award.user_id
        const existing = leaderboardMap.get(userId)
        
        if (existing) {
          existing.count++
        } else {
          leaderboardMap.set(userId, {
            user_id: userId,
            display_name: award.profiles?.display_name || 'Anonymous',
            avatar_url: award.profiles?.avatar_url || null,
            count: 1
          })
        }
      })

      // Convert to array and sort by count
      const leaderboardData = Array.from(leaderboardMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)

      return { success: true, data: leaderboardData }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch golden ears leaderboard'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const getRecentAwards = (limit = 10) => {
    return awards.value.slice(0, limit)
  }

  const getAwardsByDateRange = (startDate: Date, endDate: Date) => {
    return awards.value.filter(award => {
      const awardDate = new Date(award.created_at)
      return awardDate >= startDate && awardDate <= endDate
    })
  }

  const getMonthlyStats = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const monthlyAwards = awards.value.filter(award => {
      const awardDate = new Date(award.created_at)
      return awardDate.getMonth() === currentMonth && awardDate.getFullYear() === currentYear
    })

    return {
      count: monthlyAwards.length,
      awards: monthlyAwards
    }
  }

  const getYearlyStats = () => {
    const now = new Date()
    const currentYear = now.getFullYear()

    const yearlyAwards = awards.value.filter(award => {
      const awardDate = new Date(award.created_at)
      return awardDate.getFullYear() === currentYear
    })

    return {
      count: yearlyAwards.length,
      awards: yearlyAwards
    }
  }

  const clearAwards = () => {
    awards.value = []
    userStats.value = {
      totalAwards: 0,
      recentAwards: 0,
      streak: 0,
      accuracy: 0
    }
    error.value = null
  }

  const clearError = () => {
    error.value = null
  }

  const fetchWeeklyProgress = async (userId: string, weekStart?: string) => {
    try {
      isLoading.value = true
      error.value = null

      const params: any = {
        user_id: userId
      }
      if (weekStart) {
        params.week_start = weekStart
      }

      const { data, error: fetchError } = await supabaseService.getClient()
        .rpc('get_user_weekly_progress', params)

      if (fetchError) {
        throw fetchError
      }

      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch weekly progress'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const fetchGoldenEarsHistory = async (userId: string) => {
    try {
      isLoading.value = true
      error.value = null

      // Fetch from golden_ears table, ordered by week_start descending
      const { data, error: fetchError } = await supabaseService.getClient()
        .from('golden_ears')
        .select('*')
        .eq('judge_id', userId)
        .eq('awarded', true)
        .order('week_start', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      return { success: true, data: data || [] }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch golden ears history'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    awards,
    userStats,
    isLoading,
    error,
    
    // Getters
    totalAwards,
    recentAwards,
    awardsByGenre,
    currentStreak,
    
    // Actions
    fetchUserAwards,
    calculateUserStats,
    checkForGoldenEars,
    awardGoldenEars,
    getLeaderboard,
    getRecentAwards,
    getAwardsByDateRange,
    getMonthlyStats,
    getYearlyStats,
    clearAwards,
    clearError,
    fetchWeeklyProgress,
    fetchGoldenEarsHistory,
  }
})
