<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="dashboard" href="/tabs/dashboard">
          <ion-icon :icon="homeOutline"></ion-icon>
          <ion-label>Dashboard</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="my-songs" href="/tabs/my-songs">
          <ion-icon :icon="musicalNotesOutline"></ion-icon>
          <ion-label>My Songs</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="leaderboard" href="/tabs/leaderboard">
          <ion-icon :icon="trophyOutline"></ion-icon>
          <ion-label>Leaderboard</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="account" href="/tabs/account">
          <ion-icon :icon="personOutline"></ion-icon>
          <ion-label>Account</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, 
  IonTabs, 
  IonTabBar, 
  IonTabButton, 
  IonIcon, 
  IonLabel, 
  IonRouterOutlet 
} from '@ionic/vue'
import { 
  homeOutline, 
  musicalNotesOutline, 
  trophyOutline, 
  personOutline 
} from 'ionicons/icons'
</script>
