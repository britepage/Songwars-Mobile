<template>
  <ion-tab-bar slot="bottom" v-if="showFooter">
    <ion-tab-button tab="dashboard" href="/tabs/dashboard">
      <ion-icon :icon="home" />
      <ion-label>Battle</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="leaderboard" href="/tabs/leaderboard">
      <ion-icon :icon="trophy" />
      <ion-label>Leaderboard</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="my-songs" href="/tabs/my-songs">
      <ion-icon :icon="musicalNotes" />
      <ion-label>My Songs</ion-label>
    </ion-tab-button>

    <ion-tab-button tab="account" href="/tabs/account">
      <ion-icon :icon="person" />
      <ion-label>Account</ion-label>
    </ion-tab-button>
  </ion-tab-bar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/vue'
import { home, trophy, musicalNotes, person } from 'ionicons/icons'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const authStore = useAuthStore()

// Hide footer on certain pages
const showFooter = computed(() => {
  const hiddenRoutes = ['/sign-in', '/registration', '/reset-password', '/preview']
  return !hiddenRoutes.includes(route.path) && authStore.isAuthenticated
})
</script>

<style scoped>
ion-tab-bar {
  --background: var(--ion-color-step-50);
  --color: var(--ion-color-medium);
  --color-selected: var(--ion-color-primary);
  --border: 1px solid var(--ion-color-step-150);
}

/* Footer styling from COMPLETE_STYLE_GUIDE.md */
ion-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb; /* gray-200 */
}

/* Nav buttons */
ion-tab-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  transition: color 0.2s;
  background-color: transparent;
  color: #4b5563; /* gray-600 */
}

ion-tab-button.tab-selected {
  color: #ffd200;
}

ion-tab-button:not(.tab-selected):hover {
  color: #1f2937; /* gray-800 */
}

/* Keep footer white in both themes */
[data-theme="dark"] ion-tab-bar {
  background-color: rgba(255, 255, 255, 0.95) !important;
  border-color: #e5e7eb !important;
}
</style>
