import { RouteLocationNormalized, Router } from 'vue-router'
import { supabaseService } from '@/services/supabase.service'

export async function authGuard(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: (to?: string | false) => void
) {
  try {
    const currentUser = await supabaseService.getCurrentUser()
    if (currentUser) {
      // User is authenticated, allow access
      next()
    } else {
      // User is not authenticated, redirect to sign-in
      console.log('Auth guard: User not authenticated, redirecting to sign-in')
      next('/sign-in')
    }
  } catch (error) {
    console.error('Auth guard error:', error)
    // On error, redirect to sign-in for safety
    next('/sign-in')
  }
}

export function setupAuthGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    // Check if route requires authentication
    if (to.meta.requiresAuth) {
      await authGuard(to, from, next)
    } else {
      next()
    }
  })
}
