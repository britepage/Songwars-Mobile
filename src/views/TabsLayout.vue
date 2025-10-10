<template>
  <ion-page>
    <ion-content>
      <router-view />
    </ion-content>
    
    <!-- Custom Footer -->
    <FooterNavigation />
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue'
import FooterNavigation from '@/components/core/FooterNavigation.vue'
</script>

