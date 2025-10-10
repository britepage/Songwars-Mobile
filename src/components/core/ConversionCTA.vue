<template>
  <ion-card class="conversion-cta-card">
    <ion-card-content>
      <div class="cta-content">
        <div class="cta-icon">
          <ion-icon :icon="rocket" />
        </div>
        
        <div class="cta-text">
          <h3>{{ title }}</h3>
          <p>{{ message }}</p>
        </div>
        
        <ion-button
          expand="block"
          class="bigbutton cta-button"
          @click="handleClick"
        >
          {{ buttonText }}
        </ion-button>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon
} from '@ionic/vue'
import { rocket } from 'ionicons/icons'

interface Props {
  title: string
  message: string
  buttonText: string
}

defineProps<Props>()

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
.conversion-cta-card {
  margin: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.cta-content {
  text-align: center;
}

.cta-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.cta-text h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.cta-text p {
  font-size: 1rem;
  margin: 0 0 1.5rem 0;
  opacity: 0.9;
}

.cta-button {
  --background: white;
  --color: #667eea;
}
</style>
