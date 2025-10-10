<template>
  <ion-card class="golden-ears-progress-card">
    <ion-card-header>
      <div class="header-content">
        <div class="icon-container">
          <ion-icon :icon="ear" class="ears-icon" :class="{ 'golden': hasEarned }" />
        </div>
        <div class="header-text">
          <ion-card-title>Golden Ears Progress</ion-card-title>
          <ion-card-subtitle>{{ subtitle }}</ion-card-subtitle>
        </div>
      </div>
    </ion-card-header>
    
    <ion-card-content>
      <!-- Progress Bar -->
      <div class="progress-section">
        <div class="progress-info">
          <span class="progress-label">Accuracy</span>
          <span class="progress-value">{{ Math.round(accuracy) }}%</span>
        </div>
        <ion-progress-bar
          :value="accuracy / 100"
          :color="getProgressColor(accuracy)"
          class="accuracy-progress"
        />
      </div>
      
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-item">
          <ion-icon :icon="checkmarkCircle" class="stat-icon success" />
          <div class="stat-info">
            <h4>{{ correctVotes }}</h4>
            <p>Correct</p>
          </div>
        </div>
        
        <div class="stat-item">
          <ion-icon :icon="closeCircle" class="stat-icon danger" />
          <div class="stat-info">
            <h4>{{ incorrectVotes }}</h4>
            <p>Incorrect</p>
          </div>
        </div>
        
        <div class="stat-item">
          <ion-icon :icon="trophy" class="stat-icon primary" />
          <div class="stat-info">
            <h4>{{ totalEarned }}</h4>
            <p>Earned</p>
          </div>
        </div>
      </div>
      
      <!-- Achievement Message -->
      <div v-if="hasEarned" class="achievement-message">
        <ion-icon :icon="star" class="achievement-icon" />
        <p>Congratulations! You've earned Golden Ears!</p>
      </div>
      
      <!-- Next Goal -->
      <div v-else class="next-goal">
        <p>{{ getNextGoalMessage() }}</p>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonIcon,
  IonProgressBar
} from '@ionic/vue'
import { ear, checkmarkCircle, closeCircle, trophy, star } from 'ionicons/icons'

interface Props {
  accuracy: number
  correctVotes: number
  incorrectVotes: number
  totalEarned: number
  hasEarned?: boolean
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  hasEarned: false,
  subtitle: 'Track your voting accuracy'
})

const getProgressColor = (accuracy: number) => {
  if (accuracy >= 80) return 'success'
  if (accuracy >= 60) return 'warning'
  return 'danger'
}

const getNextGoalMessage = () => {
  const remaining = Math.max(0, 80 - props.accuracy)
  if (remaining === 0) return 'You\'re ready to earn Golden Ears!'
  return `${remaining.toFixed(1)}% more accuracy needed for Golden Ears`
}
</script>

<style scoped>
.golden-ears-progress-card {
  margin: 1rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-container {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: 50%;
}

.ears-icon {
  font-size: 1.75rem;
  color: var(--text-primary);
}

.ears-icon.golden {
  color: #ffd700;
  animation: goldenGlow 2s ease-in-out infinite;
}

@keyframes goldenGlow {
  0%, 100% {
    filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8));
  }
}

.header-text {
  flex: 1;
}

.progress-section {
  margin-bottom: 1.5rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.progress-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.accuracy-progress {
  height: 12px;
  border-radius: 6px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-icon.success {
  color: #10b981;
}

.stat-icon.danger {
  color: #ef4444;
}

.stat-icon.primary {
  color: var(--ion-color-primary);
}

.stat-info h4 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.stat-info p {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0;
}

.achievement-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 237, 78, 0.1));
  border-radius: 0.5rem;
  border: 2px solid #ffd700;
}

.achievement-icon {
  font-size: 1.5rem;
  color: #ffd700;
}

.achievement-message p {
  margin: 0;
  color: var(--text-primary);
  font-weight: 600;
}

.next-goal {
  text-align: center;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: 0.5rem;
}

.next-goal p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}
</style>
