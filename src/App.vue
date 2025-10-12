<template>
  <ion-app>
    <!-- Global Custom Header -->
    <HeaderNavigation />
    
    <!-- Page Content -->
    <ion-router-outlet />
    
    <!-- Global Custom Footer -->
    <FooterNavigation />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import HeaderNavigation from './components/core/HeaderNavigation.vue'
import FooterNavigation from './components/core/FooterNavigation.vue'
import { onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { AUTH_STORE_REDIRECT_ROUTES } from '@/constants/publicRoutes'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

onMounted(async () => {
  // Initialize theme FIRST (before splash screen)
  await themeStore.initializeTheme()
  
  // Hide splash screen
  await SplashScreen.hide()
  
  // Configure status bar
  try {
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#000000' })
  } catch (error) {
    // Status bar API not available in web
    console.log('Status bar not available')
  }
  
  // Initialize auth - this loads session from Capacitor Storage
  await authStore.initializeAuth()
  
  console.log('[App.vue] Auth initialized, user:', authStore.user?.id)
})

// Watch for auth state changes and handle redirects
watch(() => authStore.user, (newUser) => {
  const currentPath = router.currentRoute.value.path
  console.log('[Auth Watcher] Path:', currentPath, 'user:', newUser?.id, 'isAuthenticated:', authStore.isAuthenticated)
  
  // Check if current route is public
  const isPublic = AUTH_STORE_REDIRECT_ROUTES.some(route => 
    currentPath === route || currentPath.startsWith(route + '/')
  )
  
  // Special case: Never redirect away from /reset-password
  if (currentPath.startsWith('/reset-password')) {
    return
  }
  
  if (newUser) {
    // User is authenticated - redirect from public routes to dashboard
    if (isPublic && currentPath !== '/preview') {
      console.log('[Auth Watcher] Redirecting authenticated user to dashboard')
      router.push('/tabs/dashboard')
    }
  } else {
    // User is not authenticated - redirect from protected routes to sign-in
    if (!isPublic) {
      console.log('[Auth Watcher] Redirecting unauthenticated user to sign-in')
      router.push('/sign-in')
    }
  }
}, { immediate: true })
</script>

<style>
/* Global app styles will be added in theming guide */
</style>
