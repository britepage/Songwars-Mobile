<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/dashboard" />
        </ion-buttons>
        <ion-title>Trial Battle</ion-title>
        <ion-buttons slot="end">
          <ThemeToggle />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <!-- Trial Info Banner -->
      <div class="trial-banner">
        <ion-icon :icon="informationCircle" class="info-icon" />
        <div class="banner-text">
          <h3>Trial Mode</h3>
          <p>Try out the battle system before signing up!</p>
        </div>
      </div>
      
      <!-- Battle Interface (same as Dashboard) -->
      <div v-if="currentBattle" class="battle-container">
        <div class="battle-songs">
          <div class="song-section">
            <TapePlayer 
              :song="songA" 
              :is-playing="playingSongId === songA?.id"
              @play="handlePlay(songA)"
            />
            <ion-button 
              expand="block"
              class="vote-button bigbutton"
              @click="handleVote(songA?.id)"
              :disabled="hasVoted"
            >
              Vote for {{ songA?.title }}
            </ion-button>
          </div>
          
          <div class="vs-divider">
            <h2 class="vs-text">VS</h2>
          </div>
          
          <div class="song-section">
            <TapePlayer 
              :song="songB" 
              :is-playing="playingSongId === songB?.id"
              @play="handlePlay(songB)"
            />
            <ion-button 
              expand="block"
              class="vote-button bigbutton"
              @click="handleVote(songB?.id)"
              :disabled="hasVoted"
            >
              Vote for {{ songB?.title }}
            </ion-button>
          </div>
        </div>
        
        <!-- Trial Counter -->
        <div class="trial-counter">
          <p>Trial battles remaining: <strong>{{ trialsRemaining }}</strong></p>
        </div>
        
        <!-- Skip Button -->
        <ion-button 
          fill="outline"
          expand="block"
          class="skip-button"
          @click="skipBattle"
        >
          <ion-icon :icon="playSkipForward" slot="start" />
          Skip Battle
        </ion-button>
      </div>
      
      <!-- Trial Limit Reached -->
      <div v-else class="trial-limit-container">
        <ion-icon :icon="lockClosed" class="limit-icon" />
        <h2>Trial Limit Reached</h2>
        <p>You've used all your trial battles! Sign up to continue battling and upload your own songs.</p>
        
        <div class="cta-buttons">
          <ion-button 
            expand="block"
            class="bigbutton"
            @click="goToRegistration"
          >
            Create Account
          </ion-button>
          
          <ion-button 
            expand="block"
            fill="outline"
            @click="goToSignIn"
          >
            Sign In
          </ion-button>
        </div>
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
  IonBackButton,
  IonButton,
  IonIcon
} from '@ionic/vue'
import { informationCircle, playSkipForward, lockClosed } from 'ionicons/icons'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import TapePlayer from '@/components/core/TapePlayer.vue'
import ThemeToggle from '@/components/core/ThemeToggle.vue'

const router = useRouter()

const trialsRemaining = ref(3)
const hasVoted = ref(false)
const playingSongId = ref<string | null>(null)

// Mock battle data
const currentBattle = computed(() => {
  if (trialsRemaining.value <= 0) return null
  
  return {
    id: 'trial-1',
    song_a_id: 'song-1',
    song_b_id: 'song-2'
  }
})

const songA = computed(() => ({
  id: 'song-1',
  title: 'Sample Song A',
  artist: 'Artist A',
  url: null,
  genre: 'pop'
}))

const songB = computed(() => ({
  id: 'song-2',
  title: 'Sample Song B',
  artist: 'Artist B',
  url: null,
  genre: 'rock'
}))

const handlePlay = (song: any) => {
  if (!song) return
  
  if (playingSongId.value === song.id) {
    playingSongId.value = null
  } else {
    playingSongId.value = song.id
  }
}

const handleVote = (songId: string | undefined) => {
  if (!songId || hasVoted.value) return
  
  hasVoted.value = true
  trialsRemaining.value--
  
  // Load next battle after a short delay
  setTimeout(() => {
    hasVoted.value = false
  }, 1500)
}

const skipBattle = () => {
  hasVoted.value = false
}

const goToRegistration = () => {
  router.push('/registration')
}

const goToSignIn = () => {
  router.push('/sign-in')
}
</script>

<style scoped>
.trial-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.info-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.banner-text h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.banner-text p {
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.9;
}

.battle-container {
  padding: 1rem;
}

.battle-songs {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
}

.song-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.vs-divider {
  text-align: center;
  padding: 1rem 0;
}

.vs-text {
  font-size: 2.5rem;
  font-weight: 900;
  color: #ffd200;
  text-shadow: 0 0 20px rgba(255, 210, 0, 0.5);
  margin: 0;
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    text-shadow: 0 0 20px rgba(255, 210, 0, 0.3);
  }
  50% {
    text-shadow: 0 0 30px rgba(255, 210, 0, 0.6);
  }
}

.vote-button {
  width: 100%;
  max-width: 300px;
}

.trial-counter {
  text-align: center;
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.trial-counter p {
  margin: 0;
  color: var(--text-secondary);
}

.trial-counter strong {
  color: var(--ion-color-primary);
  font-size: 1.25rem;
}

.skip-button {
  --color: var(--text-secondary);
}

.trial-limit-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  text-align: center;
}

.limit-icon {
  font-size: 5rem;
  color: var(--text-muted);
  opacity: 0.5;
  margin-bottom: 1rem;
}

.trial-limit-container h2 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.trial-limit-container p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  max-width: 400px;
  line-height: 1.5;
}

.cta-buttons {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>