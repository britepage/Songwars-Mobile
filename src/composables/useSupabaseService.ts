import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabaseService } from '@/services/supabase.service'
import type { User, Session } from '@supabase/supabase-js'

const currentUser = ref<User | null>(null)
const currentSession = ref<Session | null>(null)
const isLoading = ref(true)

export function useSupabaseService() {
  const isAuthenticated = computed(() => !!currentUser.value)
  const user = computed(() => currentUser.value)
  const session = computed(() => currentSession.value)

  const initializeAuth = async () => {
    try {
      isLoading.value = true
      
      // Get current session
      const { data: { session }, error } = await supabaseService.getClient().auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        return
      }

      currentSession.value = session
      currentUser.value = session?.user || null

      // Set up auth state listener
      const { data: { subscription } } = supabaseService.getClient().auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state change:', event, session?.user?.id)
          
          currentSession.value = session
          currentUser.value = session?.user || null
          isLoading.value = false

          // Handle specific events
          if (event === 'SIGNED_IN') {
            console.log('User signed in:', session?.user?.email)
          } else if (event === 'SIGNED_OUT') {
            console.log('User signed out')
            currentUser.value = null
            currentSession.value = null
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed')
          } else if (event === 'USER_UPDATED') {
            console.log('User updated:', session?.user?.email)
          }
        }
      )

      // Clean up subscription on unmount
      onUnmounted(() => {
        subscription.unsubscribe()
      })

    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      isLoading.value = false
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      isLoading.value = true
      const { data, error } = await supabaseService.signInWithEmail(email, password)
      
      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error }
    } finally {
      isLoading.value = false
    }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      isLoading.value = true
      const { data, error } = await supabaseService.signUpWithEmail(email, password)
      
      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    } finally {
      isLoading.value = false
    }
  }

  const signOut = async () => {
    try {
      isLoading.value = true
      const { error } = await supabaseService.signOut()
      
      if (error) {
        throw error
      }

      currentUser.value = null
      currentSession.value = null
      
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error }
    } finally {
      isLoading.value = false
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabaseService.resetPassword(email)
      
      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Reset password error:', error)
      return { data: null, error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabaseService.signInWithGoogle()
      
      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Google sign in error:', error)
      return { data: null, error }
    }
  }

  const signInWithFacebook = async () => {
    try {
      const { data, error } = await supabaseService.signInWithFacebook()
      
      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Facebook sign in error:', error)
      return { data: null, error }
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      const { data, error } = await supabaseService.updatePassword(newPassword)
      
      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Update password error:', error)
      return { data: null, error }
    }
  }

  // Initialize auth on mount
  onMounted(() => {
    initializeAuth()
  })

  return {
    // State
    user,
    session,
    isAuthenticated,
    isLoading,
    
    // Methods
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
    signInWithGoogle,
    signInWithFacebook,
    updatePassword,
    initializeAuth,
  }
}
