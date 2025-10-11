<template>
  <ion-page>
    <ion-content :fullscreen="true" class="pt-16">
      <!-- Genre Filter -->
      <div class="filter-section">
        <ion-segment v-model="selectedGenre" @ionChange="handleGenreChange" scrollable>
          <ion-segment-button value="all">
            <ion-label>All</ion-label>
          </ion-segment-button>
          <ion-segment-button value="pop">
            <ion-label>Pop</ion-label>
          </ion-segment-button>
          <ion-segment-button value="rock">
            <ion-label>Rock</ion-label>
          </ion-segment-button>
          <ion-segment-button value="hip-hop">
            <ion-label>Hip Hop</ion-label>
          </ion-segment-button>
          <ion-segment-button value="electronic">
            <ion-label>Electronic</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <ion-spinner name="crescent" color="primary" />
        <p>Loading leaderboard...</p>
      </div>
      
      <!-- Leaderboard Entries -->
      <div v-else class="leaderboard-container">
        <div v-if="leaderboard.length === 0" class="no-entries">
          <ion-icon :icon="trophy" class="no-entries-icon" />
          <h3>No Entries Yet</h3>
          <p>Be the first to compete in this genre!</p>
        </div>
        
        <LeaderboardCard 
          v-for="entry in leaderboard" 
          :key="entry.song_id"
          :entry="entry"
          :show-win-rate="true"
          :show-trend="true"
          :show-play-button="true"
          @play="handlePlay"
        />
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
  IonIcon,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonLabel
} from '@ionic/vue'
import { trophy } from 'ionicons/icons'
import { ref, computed, onMounted } from 'vue'
import { useLeaderboardStore } from '@/stores/leaderboardStore'
import { useProfileStore } from '@/stores/profileStore'
import { useAuthStore } from '@/stores/authStore'
import LeaderboardCard from '@/components/core/LeaderboardCard.vue'
import ThemeToggle from '@/components/core/ThemeToggle.vue'

const leaderboardStore = useLeaderboardStore()
const profileStore = useProfileStore()
const authStore = useAuthStore()

const selectedGenre = ref('all')
const isLoading = ref(false)

const leaderboard = computed(() => leaderboardStore.leaderboard)

const loadLeaderboard = async () => {
  isLoading.value = true
  try {
    await leaderboardStore.fetchLeaderboard(selectedGenre.value, 0)
  } catch (error) {
    console.error('Failed to load leaderboard:', error)
  } finally {
    isLoading.value = false
  }
}

const handleGenreChange = (event: CustomEvent) => {
  selectedGenre.value = event.detail.value
  loadLeaderboard()
}

const handlePlay = (entry: any) => {
  console.log('Playing song from leaderboard:', entry)
  // TODO: Implement audio playback
}

onMounted(async () => {
  // Fetch profile first to ensure it exists
  if (authStore.user) {
    console.log('[Leaderboard] Fetching profile for user:', authStore.user.id)
    await profileStore.fetchProfile()
  }
  
  // Then load leaderboard
  loadLeaderboard()
})
</script>

<style scoped>
.filter-section {
  padding: 1rem;
  padding-bottom: 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  gap: 1rem;
  color: var(--text-secondary);
}

.leaderboard-container {
  padding: 1rem;
}

.no-entries {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.no-entries-icon {
  font-size: 4rem;
  color: var(--text-muted);
  opacity: 0.5;
  margin-bottom: 1rem;
}

.no-entries h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.no-entries p {
  color: var(--text-secondary);
}
</style>