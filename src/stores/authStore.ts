import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabaseService } from '@/services/supabase.service'
import type { User, Session } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.app_metadata?.role === 'admin')

  // Actions
  const initializeAuth = async () => {
    try {
      isLoading.value = true
      error.value = null

      // Get current session
      const { data: { session: currentSession }, error: sessionError } = await supabaseService.getClient().auth.getSession()
      
      if (sessionError) {
        throw sessionError
      }

      session.value = currentSession
      user.value = currentSession?.user || null

      // Set up auth state listener
      const { data: { subscription } } = supabaseService.getClient().auth.onAuthStateChange(
        async (event, newSession) => {
          console.log('Auth state change:', event, newSession?.user?.id)
          
          session.value = newSession
          user.value = newSession?.user || null

          if (event === 'SIGNED_OUT') {
            // Clear any cached data on sign out
            user.value = null
            session.value = null
          }
        }
      )

      // Return cleanup function
      return () => subscription.unsubscribe()

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Authentication initialization failed'
      console.error('Auth initialization error:', err)
    } finally {
      isLoading.value = false
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: signInError } = await supabaseService.signInWithEmail(email, password)
      
      if (signInError) {
        throw signInError
      }

      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign in failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: signUpError } = await supabaseService.signUpWithEmail(email, password)
      
      if (signUpError) {
        throw signUpError
      }

      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign up failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const signOut = async () => {
    try {
      isLoading.value = true
      error.value = null

      const { error: signOutError } = await supabaseService.signOut()
      
      if (signOutError) {
        throw signOutError
      }

      // Clear local state
      user.value = null
      session.value = null
      
      // Clear profile store to prevent stale data
      const { useProfileStore } = await import('@/stores/profileStore')
      const profileStore = useProfileStore()
      profileStore.profile = null

      // Clear tag and flag stores (cached user-specific data)
      try {
        const { useTagStore } = await import('@/stores/tagStore')
        const tagStore = useTagStore()
        tagStore.clear()
      } catch {}
      try {
        const { useFlagStore } = await import('@/stores/flagStore')
        const flagStore = useFlagStore()
        flagStore.clear()
      } catch {}

      return { success: true }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Sign out failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const resetPassword = async (email: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: resetError } = await supabaseService.resetPassword(email)
      
      if (resetError) {
        throw resetError
      }

      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Password reset failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const signInWithGoogle = async () => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: googleError } = await supabaseService.signInWithGoogle()
      
      if (googleError) {
        throw googleError
      }

      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Google sign in failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const signInWithFacebook = async () => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: facebookError } = await supabaseService.signInWithFacebook()
      
      if (facebookError) {
        throw facebookError
      }

      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Facebook sign in failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      isLoading.value = true
      error.value = null

      const { data, error: updateError } = await supabaseService.updatePassword(newPassword)
      
      if (updateError) {
        throw updateError
      }

      return { success: true, data }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Password update failed'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const deleteUserAccount = async (): Promise<boolean> => {
    if (!user.value) {
      throw new Error('No authenticated user found')
    }

    try {
      isLoading.value = true
      error.value = null

      // Call backend RPC function
      const { error: deleteError } = await supabaseService.getClient().rpc('delete_user_account' as any)
      if (deleteError) throw deleteError

      // Clear local auth data
      user.value = null
      session.value = null
      
      // Sign out and redirect
      await signOut()
      
      return true
    } catch (error) {
      console.error('Account deletion error:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // General OAuth sign in method
  const signInWithOAuth = async (provider: 'google' | 'facebook') => {
    if (provider === 'google') {
      return signInWithGoogle()
    } else {
      return signInWithFacebook()
    }
  }

  // Aliases for convenience
  const signIn = signInWithEmail
  const signUp = signUpWithEmail

  return {
    // State
    user,
    session,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    isAdmin,
    
    // Actions
    initializeAuth,
    signIn,
    signUp,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    signOut,
    resetPassword,
    signInWithGoogle,
    signInWithFacebook,
    updatePassword,
    deleteUserAccount,
    clearError,
  }
})
