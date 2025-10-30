import { RouteLocationNormalized, Router } from 'vue-router'
import { supabaseService } from '@/services/supabase.service'

export async function adminGuard(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: (to?: string | false) => void
) {
  try {
    const currentUser = await supabaseService.getCurrentUser()
    if (!currentUser) {
      // User not authenticated, redirect to sign-in
      console.log('Admin guard: User not authenticated, redirecting to sign-in')
      next('/sign-in')
      return
    }

    // Check if user has admin role
    const { data: profile, error } = await supabaseService.getClient()
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    if (error) {
      console.error('Admin guard: Error fetching user profile:', error)
      next('/tabs/dashboard')
      return
    }

    if (profile?.role === 'admin') {
      // User is admin, allow access
      next()
    } else {
      // User is not admin, redirect to dashboard
      console.log('Admin guard: User is not admin, redirecting to dashboard')
      next('/tabs/dashboard')
    }
  } catch (error) {
    console.error('Admin guard error:', error)
    // On error, redirect to dashboard for safety
    next('/tabs/dashboard')
  }
}

export function setupAdminGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    // Check if route requires admin role
    if (to.meta.requiresAdmin) {
      await adminGuard(to, from, next)
    } else {
      next()
    }
  })
}
