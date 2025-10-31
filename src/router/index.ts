import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import { setupAuthGuard } from '@/guards/auth.guard'
import { setupAdminGuard } from '@/guards/admin.guard'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/dashboard'
  },
  // Auth routes
  {
    path: '/sign-in',
    name: 'SignIn',
    component: () => import('@/views/auth/SignInPage.vue')
  },
  {
    path: '/registration',
    name: 'Registration',
    component: () => import('@/views/auth/RegistrationPage.vue')
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/auth/ResetPasswordPage.vue')
  },
  {
    path: '/reset-password-email',
    name: 'ResetPasswordEmail',
    component: () => import('@/views/auth/ResetPasswordEmailPage.vue')
  },
  // Main app routes (flattened - no tabs structure)
  {
    path: '/tabs/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/main/DashboardPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tabs/my-songs',
    name: 'MySongs',
    component: () => import('@/views/main/MySongsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tabs/leaderboard',
    name: 'Leaderboard',
    component: () => import('@/views/main/LeaderboardPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/tabs/account',
    name: 'Account',
    component: () => import('@/views/main/AccountPage.vue'),
    meta: { requiresAuth: true }
  },
  // User profile route
  {
    path: '/user/:username',
    name: 'UserProfile',
    component: () => import('@/views/main/UserProfilePage.vue'),
    meta: { requiresAuth: true }
  },
  // Admin route with admin guard
  {
    path: '/admin/flags',
    name: 'Flags',
    component: () => import('@/views/admin/FlagsPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  // Preview route for trial battles
  {
    path: '/preview',
    name: 'Preview',
    component: () => import('@/views/PreviewPage.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Setup navigation guards
setupAuthGuard(router)
setupAdminGuard(router)

export default router
