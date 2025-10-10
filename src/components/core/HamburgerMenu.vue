<template>
  <ion-menu content-id="main-content" type="overlay">
    <ion-header>
      <ion-toolbar>
        <ion-title>Menu</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content>
      <ion-list>
        <ion-item button @click="navigate('/tabs/dashboard')">
          <ion-icon :icon="home" slot="start" />
          <ion-label>Dashboard</ion-label>
        </ion-item>
        
        <ion-item button @click="navigate('/tabs/my-songs')">
          <ion-icon :icon="musicalNotes" slot="start" />
          <ion-label>My Songs</ion-label>
        </ion-item>
        
        <ion-item button @click="navigate('/tabs/leaderboard')">
          <ion-icon :icon="trophy" slot="start" />
          <ion-label>Leaderboard</ion-label>
        </ion-item>
        
        <ion-item button @click="navigate('/tabs/account')">
          <ion-icon :icon="person" slot="start" />
          <ion-label>Account</ion-label>
        </ion-item>
        
        <ion-item v-if="isAdmin" button @click="navigate('/admin/flags')">
          <ion-icon :icon="flag" slot="start" />
          <ion-label>Moderation</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-menu>
</template>

<script setup lang="ts">
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  menuController
} from '@ionic/vue'
import { home, musicalNotes, trophy, person, flag } from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { computed } from 'vue'

const router = useRouter()
const authStore = useAuthStore()

const isAdmin = computed(() => authStore.isAdmin)

const navigate = async (path: string) => {
  await menuController.close()
  router.push(path)
}
</script>

<style scoped>
ion-menu {
  --width: 280px;
}
</style>
