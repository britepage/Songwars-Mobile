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
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { useProfileStore } from '@/stores/profileStore'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const profileStore = useProfileStore()

onMounted(async () => {
  // Initialize theme FIRST (before splash screen)
  await themeStore.initializeTheme()
  
  // Hide splash screen
  await SplashScreen.hide()
  
  // Configure status bar
  try {
    await StatusBar.setStyle({ style: themeStore.isDark ? Style.Dark : Style.Light })
    await StatusBar.setBackgroundColor({ color: themeStore.isDark ? '#000000' : '#ffffff' })
  } catch (error) {
    // Status bar API not available in web
    console.log('Status bar not available')
  }
  
  // Initialize auth - this loads session from Capacitor Storage
  await authStore.initializeAuth()
  
  console.log('[App.vue] Auth initialized, user:', authStore.user?.id)
  
  // Fetch profile if user exists but profile doesn't (handles page refresh case)
  if (authStore.user && !profileStore.profile) {
    await profileStore.fetchProfile(authStore.user.id)
  }
})

// Watch for theme changes and update status bar
watch(() => themeStore.isDark, async (isDark) => {
  try {
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light })
    await StatusBar.setBackgroundColor({ color: isDark ? '#000000' : '#ffffff' })
  } catch {}
})

// Watch for auth state changes and fetch profile when user signs in
watch(() => authStore.user, async (newUser, oldUser) => {
  // When user signs in (goes from null to user)
  if (newUser && !oldUser) {
    // Fetch profile if it doesn't exist yet
    if (!profileStore.profile) {
      await profileStore.fetchProfile(newUser.id)
    }
  }
  // When user signs out (goes from user to null), profile is already cleared in signOut
}, { immediate: false })
</script>

<style>
/* Global app styles will be added in theming guide */
</style>
