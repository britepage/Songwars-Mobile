<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>SongWars</ion-title>
        <ion-buttons slot="end">
          <ThemeToggle />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Battle Your Music</h1>
          <p class="hero-subtitle">
            Upload your songs and compete in head-to-head battles to climb the leaderboard
          </p>
          
          <div class="hero-buttons">
            <ion-button 
              v-if="!isAuthenticated"
              @click="goToRegistration"
              size="large"
              class="bigbutton hero-button"
            >
              Get Started
            </ion-button>
            
            <ion-button 
              v-if="!isAuthenticated"
              @click="goToSignIn"
              size="large"
              fill="outline"
              class="hero-button"
            >
              Sign In
            </ion-button>
            
            <ion-button 
              v-if="isAuthenticated"
              @click="goToDashboard"
              size="large"
              class="bigbutton hero-button"
            >
              Start Battling
            </ion-button>
            
            <ion-button 
              v-if="!isAuthenticated"
              @click="goToPreview"
              size="large"
              fill="clear"
              class="hero-button"
            >
              Try Demo
            </ion-button>
          </div>
        </div>
      </div>
      
      <!-- Features Section -->
      <div class="features-section">
        <h2 class="section-title">How It Works</h2>
        
        <div class="features-grid">
          <ion-card class="feature-card">
            <ion-card-content>
              <ion-icon :icon="musicalNotes" class="feature-icon" />
              <h3>Upload Your Music</h3>
              <p>Share your songs and let others discover your talent</p>
            </ion-card-content>
          </ion-card>
          
          <ion-card class="feature-card">
            <ion-card-content>
              <ion-icon :icon="trophy" class="feature-icon" />
              <h3>Battle & Compete</h3>
              <p>Go head-to-head with other artists in music battles</p>
            </ion-card-content>
          </ion-card>
          
          <ion-card class="feature-card">
            <ion-card-content>
              <ion-icon :icon="star" class="feature-icon" />
              <h3>Win Golden Ears</h3>
              <p>Earn recognition for your musical judgment skills</p>
            </ion-card-content>
          </ion-card>
          
          <ion-card class="feature-card">
            <ion-card-content>
              <ion-icon :icon="podium" class="feature-icon" />
              <h3>Climb the Leaderboard</h3>
              <p>Compete for the top spot in your genre</p>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
      
      <!-- Stats Section -->
      <div class="stats-section">
        <h2 class="section-title">Join the Community</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <h3>{{ totalSongs }}</h3>
            <p>Songs</p>
          </div>
          <div class="stat-item">
            <h3>{{ totalBattles }}</h3>
            <p>Battles</p>
          </div>
          <div class="stat-item">
            <h3>{{ totalUsers }}</h3>
            <p>Artists</p>
          </div>
        </div>
      </div>
      
      <!-- CTA Section -->
      <div class="cta-section">
        <h2>Ready to Battle?</h2>
        <p>Join thousands of artists competing in music battles</p>
        <ion-button 
          v-if="!isAuthenticated"
          @click="goToRegistration"
          size="large"
          class="bigbutton"
        >
          Sign Up Now
        </ion-button>
        <ion-button 
          v-else
          @click="goToDashboard"
          size="large"
          class="bigbutton"
        >
          Go to Dashboard
        </ion-button>
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
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent
} from '@ionic/vue'
import { musicalNotes, trophy, star, podium } from 'ionicons/icons'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import ThemeToggle from '@/components/core/ThemeToggle.vue'

const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

// Mock stats - TODO: Fetch from backend
const totalSongs = ref('10K+')
const totalBattles = ref('50K+')
const totalUsers = ref('5K+')

const goToRegistration = () => {
  router.push('/registration')
}

const goToSignIn = () => {
  router.push('/sign-in')
}

const goToDashboard = () => {
  router.push('/tabs/dashboard')
}

const goToPreview = () => {
  router.push('/preview')
}
</script>

<style scoped>
.hero-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 3rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.hero-content {
  max-width: 600px;
}

.hero-title {
  font-size: 3rem;
  font-weight: 900;
  margin: 0 0 1rem 0;
  line-height: 1.2;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 1.25rem;
  margin: 0 0 2rem 0;
  line-height: 1.6;
  opacity: 0.95;
}

.hero-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.hero-button {
  min-width: 200px;
}

.features-section {
  padding: 3rem 1rem;
  background: var(--bg-primary);
}

.section-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 2rem 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  text-align: center;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  color: var(--ion-color-primary);
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.feature-card p {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.stats-section {
  padding: 3rem 1rem;
  background: var(--bg-tertiary);
}

.stats-grid {
  display: flex;
  justify-content: space-around;
  max-width: 800px;
  margin: 0 auto;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-item h3 {
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--ion-color-primary);
  margin: 0 0 0.5rem 0;
}

.stat-item p {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.cta-section {
  padding: 4rem 1rem;
  text-align: center;
  background: var(--bg-primary);
}

.cta-section h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.cta-section p {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .stats-grid {
    flex-direction: column;
    gap: 1.5rem;
  }
}
</style>