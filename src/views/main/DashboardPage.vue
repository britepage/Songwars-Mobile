<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>SongWars</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <div class="container">
        <h1>SongWars Mobile</h1>
        <p>Setup complete! Ready for component conversion.</p>
        <ion-card>
          <ion-card-header>
            <ion-card-title>Welcome to SongWars Mobile</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            The Ionic Vue project has been successfully initialized with:
            <ul>
              <li>✅ Ionic Framework 8.x</li>
              <li>✅ Vue 3.5.x with TypeScript</li>
              <li>✅ Capacitor for iOS & Android</li>
              <li>✅ Supabase client</li>
              <li>✅ Pinia state management</li>
              <li>✅ Audio libraries (WaveSurfer.js)</li>
              <li>✅ All required Capacitor plugins</li>
            </ul>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/vue'
</script>

<style scoped>
.container {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: var(--ion-color-primary);
}

p {
  margin-bottom: 2rem;
  color: var(--ion-color-medium);
}

ul {
  text-align: left;
  margin-top: 1rem;
}

li {
  margin: 0.5rem 0;
}
</style>

