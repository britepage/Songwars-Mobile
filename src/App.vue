<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { onMounted } from 'vue'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'

onMounted(async () => {
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
})
</script>

<style>
/* Global app styles will be added in theming guide */
</style>
