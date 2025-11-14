import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabaseService } from '@/services/supabase.service'
import type { SocialLink } from '@/utils/socialPlatforms'

interface Profile {
  id: string
  username: string | null
  musical_preferences: string | null
  age_range: string | null
  region: string | null
  bio: string | null
  created_at: string
  is_public: boolean | null
  is_test_data: boolean | null
  social_links: any
  roulette_sound_enabled: boolean | null
  confetti_sound_enabled: boolean | null
  role: string
  avatar_url: string | null
  display_name: string | null
  updated_at: string
}

export const useProfileStore = defineStore('profile', () => {
  // State
  const profile = ref<Profile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getSocialLinks = (): SocialLink[] => {
    if (!profile.value?.social_links) return []
    
    try {
      // Parse JSONB data if it's a string, otherwise use as-is
      const linksData: any = typeof profile.value.social_links === 'string' 
        ? JSON.parse(profile.value.social_links)
        : profile.value.social_links
      
      return Array.isArray(linksData) ? linksData : []
    } catch {
      return []
    }
  }
  
  const socialLinks = computed(() => getSocialLinks())

  const displayName = computed(() => profile.value?.display_name || 'Anonymous')
  const avatarUrl = computed(() => profile.value?.avatar_url)
  const bio = computed(() => profile.value?.bio)
  const role = computed(() => profile.value?.role || 'fan')
  const region = computed(() => profile.value?.region)
  const ageRange = computed(() => profile.value?.age_range)
  const musicalPreferences = computed(() => profile.value?.musical_preferences)

  // Actions
  const fetchProfile = async (userId?: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: fetchError } = await supabaseService.getProfile(userId)
      
      // If profile exists, load it
      if (data) {
        profile.value = data
        console.log('[profileStore] Profile loaded:', data.id)
        return { success: true, data }
      }
      
      // If no profile exists AND no error, create one automatically
      if (!data && !fetchError) {
        console.log('[profileStore] No profile found, creating minimal default profile')

        const currentUser = await supabaseService.getCurrentUser()
        if (!currentUser) {
          throw new Error('No authenticated user')
        }

        const minimalProfile = {
          id: currentUser.id,
          display_name: 'New User',
          role: 'fan',
          is_public: true
        }
        
        const { data: createdProfile, error: createError } = await supabaseService.updateProfile(minimalProfile)
        
        if (createError) {
          throw createError
        }
        
        if (createdProfile) {
          profile.value = createdProfile
          console.log('[profileStore] Profile created:', createdProfile.id)
          return { success: true, data: createdProfile }
        }
      }
      
      // If there was an error, throw it
      if (fetchError) {
        throw fetchError
      }

      return { success: true, data: null }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch profile'
      console.error('[profileStore] Error:', error.value)
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const fetchPublicProfileByUsername = async (username: string) => {
    try {
      const { data, error } = await supabaseService.getClient()
        .from('profiles')
        .select('*')
        .eq('username', username)
        .eq('is_public', true)
        .single()
      
      if (error) {
        return { success: false, error, data: null }
      }
      
      return { success: true, data, error: null }
    } catch (err) {
      return { success: false, error: err as any, data: null }
    }
  }

  const updateProfile = async (updates: {
    display_name?: string
    username?: string
    avatar_url?: string
    bio?: string
    region?: string
    age_range?: string
    musical_preferences?: string
    role?: string
    social_links?: SocialLink[]
    is_public?: boolean
    roulette_sound_enabled?: boolean
    confetti_sound_enabled?: boolean
  }) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: updateError } = await supabaseService.updateProfile(updates)
      
      if (updateError) {
        throw updateError
      }

      profile.value = data
      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update profile'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const updateSocialLinks = async (socialLinks: SocialLink[]) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: updateError } = await supabaseService.updateProfile({
        social_links: socialLinks
      })
      
      if (updateError) {
        throw updateError
      }

      profile.value = data
      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update social links'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const updateAvatar = async (avatarUrl: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: updateError } = await supabaseService.updateProfile({
        avatar_url: avatarUrl
      })
      
      if (updateError) {
        throw updateError
      }

      profile.value = data
      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update avatar'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const updateBio = async (bio: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: updateError } = await supabaseService.updateProfile({
        bio: bio
      })
      
      if (updateError) {
        throw updateError
      }

      profile.value = data
      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update bio'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const updateDisplayName = async (displayName: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: updateError } = await supabaseService.updateProfile({
        display_name: displayName
      })
      
      if (updateError) {
        throw updateError
      }

      profile.value = data
      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update display name'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const updateMusicalPreferences = async (preferences: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: updateError } = await supabaseService.updateProfile({
        musical_preferences: preferences
      })
      
      if (updateError) {
        throw updateError
      }

      profile.value = data
      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update musical preferences'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const updateRegion = async (region: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: updateError } = await supabaseService.updateProfile({
        region: region
      })
      
      if (updateError) {
        throw updateError
      }

      profile.value = data
      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update region'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const updateAgeRange = async (ageRange: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: updateError } = await supabaseService.updateProfile({
        age_range: ageRange
      })
      
      if (updateError) {
        throw updateError
      }

      profile.value = data
      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update age range'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const clearProfile = () => {
    profile.value = null
    error.value = null
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    profile,
    isLoading,
    error,
    
    // Getters
    socialLinks,
    displayName,
    avatarUrl,
    bio,
    role,
    region,
    ageRange,
    musicalPreferences,
    
    // Actions
    fetchProfile,
    fetchPublicProfileByUsername,
    updateProfile,
    updateSocialLinks,
    updateAvatar,
    updateBio,
    updateDisplayName,
    updateMusicalPreferences,
    updateRegion,
    updateAgeRange,
    clearProfile,
    clearError,
  }
})
