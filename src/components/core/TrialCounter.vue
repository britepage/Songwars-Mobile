<template>
  <ion-card class="trial-counter-card">
    <ion-card-content>
      <div class="counter-content">
        <div class="counter-icon">
          <ion-icon :icon="time" />
        </div>
        
        <div class="counter-info">
          <h4>Trial Mode</h4>
          <p>{{ trialsRemaining }} of {{ totalTrials }} battles remaining</p>
        </div>
        
        <div class="counter-progress">
          <ion-progress-bar
            :value="progressValue"
            :color="getProgressColor()"
          />
        </div>
      </div>
      
      <div class="counter-actions" v-if="trialsRemaining === 0">
        <p class="limit-message">Trial limit reached!</p>
        <ion-button
          expand="block"
          size="small"
          class="bigbutton"
          @click="handleUpgrade"
        >
          Sign Up to Continue
        </ion-button>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardContent,
  IonIcon,
  IonProgressBar,
  IonButton
} from '@ionic/vue'
import { time } from 'ionicons/icons'
import { computed } from 'vue'

interface Props {
  trialsRemaining: number
  totalTrials?: number
}

const props = withDefaults(defineProps<Props>(), {
  totalTrials: 5
})

const emit = defineEmits<{
  upgrade: []
}>()

const progressValue = computed(() => {
  return props.trialsRemaining / props.totalTrials
})

const getProgressColor = () => {
  const ratio = progressValue.value
  if (ratio > 0.5) return 'success'
  if (ratio > 0.2) return 'warning'
  return 'danger'
}

const handleUpgrade = () => {
  emit('upgrade')
}
</script>

<style scoped>
.trial-counter-card {
  margin: 1rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border: 2px solid var(--ion-color-primary);
}

.counter-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.counter-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ion-color-primary);
  border-radius: 50%;
  color: #000;
  font-size: 1.5rem;
}

.counter-info {
  flex: 1;
}

.counter-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.counter-info p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.counter-progress {
  width: 100%;
  margin-top: 1rem;
}

ion-progress-bar {
  height: 8px;
  border-radius: 4px;
}

.counter-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
}

.limit-message {
  margin: 0 0 1rem 0;
  color: #ef4444;
  font-weight: 600;
}
</style>
