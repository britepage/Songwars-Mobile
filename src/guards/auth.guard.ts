import { RouteLocationNormalized, Router } from 'vue-router'
import { supabaseService } from '@/services/supabase.service'

export async function authGuard(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: (to?: string | false | { path: string; replace?: boolean }) => void
) {
  try {
    // Read Supabase session first for immediate accuracy after sign-in
    const client = supabaseService.getClient()
    const { data: { session } } = await client.auth.getSession()
    const currentUser = session?.user || await supabaseService.getCurrentUser()

    if (currentUser) {
      next()
      return
    }

    // Unauthenticated → redirect with replace to avoid stale history
    next({ path: '/sign-in', replace: true })
  } catch (error) {
    console.error('Auth guard error:', error)
    next({ path: '/sign-in', replace: true })
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
