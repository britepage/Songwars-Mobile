<template>
  <ion-page>
    <ion-content :fullscreen="true" class="pt-16">
      <!-- Battle Section -->
      <div v-if="activeSection === 'battle'">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-container">
          <ion-spinner name="crescent" color="primary" />
          <p>Loading battle...</p>
        </div>
        
        <!-- Battle Interface -->
        <div v-else-if="currentBattle" class="battle-container">
        <!-- Tape Players for both songs -->
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
        
        <!-- Skip Battle Button -->
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
      
      <!-- No Battles Available -->
      <div v-else class="no-battles-container">
        <ion-icon :icon="musicalNotes" class="no-battles-icon" />
        <h2>No Battles Available</h2>
        <p>There are no active battles right now. Check back later or upload your own songs!</p>
        <ion-button 
          @click="goToMySongs"
          class="bigbutton"
        >
          <ion-icon :icon="add" slot="start" />
          Upload Song
        </ion-button>
      </div>
      
        <!-- Recent Battles Section -->
        <div v-if="recentBattles.length > 0" class="recent-battles">
          <h3 class="section-title">Recent Battles</h3>
          <ion-card 
            v-for="battle in recentBattles" 
            :key="battle.id"
            class="battle-history-card"
          >
            <ion-card-content>
              <div class="battle-info">
                <p class="battle-matchup">
                  Battle #{{ battle.id.substring(0, 8) }}
                </p>
                <p class="battle-date">{{ formatDate(battle.created_at) }}</p>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <!-- Upload Section -->
      <div v-if="activeSection === 'upload'" class="upload-container">
        <div class="upload-placeholder">
          <ion-icon :icon="add" class="upload-icon" />
          <h2>Upload Section</h2>
          <p>Upload functionality will be implemented here</p>
          <ion-button 
            @click="activeSection = 'battle'"
            fill="outline"
          >
            Back to Battle
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
  IonButton, 
  IonButtons,
  IonIcon, 
  IonSpinner,
  IonCard,
  IonCardContent
} from '@ionic/vue'
import { musicalNotes, add, playSkipForward } from 'ionicons/icons'
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBattleStore } from '@/stores/songComparisonStore'
import { useSongStore } from '@/stores/songStore'
import { useProfileStore } from '@/stores/profileStore'
import { useAuthStore } from '@/stores/authStore'
import TapePlayer from '@/components/core/TapePlayer.vue'
import ThemeToggle from '@/components/core/ThemeToggle.vue'

const router = useRouter()
const route = useRoute()
const battleStore = useBattleStore()
const songStore = useSongStore()
const profileStore = useProfileStore()
const authStore = useAuthStore()

const isLoading = ref(false)
const hasVoted = ref(false)
const playingSongId = ref<string | null>(null)
const activeSection = ref('battle')

const currentBattle = computed(() => battleStore.currentBattle)
const recentBattles = computed(() => battleStore.battleHistory.slice(0, 5))

const songA = computed(() => {
  if (!currentBattle.value) return null
  return songStore.songs.find(s => s.id === currentBattle.value?.song_a_id)
})

const songB = computed(() => {
  if (!currentBattle.value) return null
  return songStore.songs.find(s => s.id === currentBattle.value?.song_b_id)
})

// Watch for URL query parameter changes
watch(() => route.query.section, (newSection) => {
  if (newSection === 'upload') {
    activeSection.value = 'upload'
  } else {
    activeSection.value = 'battle'
  }
}, { immediate: true })

const loadBattle = async () => {
  isLoading.value = true
  hasVoted.value = false
  try {
    // Fetch a random battle
    await battleStore.fetchRandomBattle()
    
    // Load songs if needed
    if (currentBattle.value) {
      await songStore.fetchSongs()
    }
  } catch (error) {
    console.error('Failed to load battle:', error)
  } finally {
    isLoading.value = false
  }
}

const handlePlay = (song: any) => {
  if (!song) return
  
  if (playingSongId.value === song.id) {
    playingSongId.value = null
    // TODO: Stop audio playback
  } else {
    playingSongId.value = song.id
    // TODO: Start audio playback
  }
}

const handleVote = async (songId: string | undefined) => {
  if (!songId || !currentBattle.value || hasVoted.value) return
  
  hasVoted.value = true
  
  try {
    await battleStore.recordVote(songId)
    
    // Load next battle after a short delay
    setTimeout(() => {
      loadBattle()
    }, 1500)
  } catch (error) {
    console.error('Failed to record vote:', error)
    hasVoted.value = false
  }
}

const skipBattle = () => {
  loadBattle()
}

const goToMySongs = () => {
  router.push('/tabs/my-songs')
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  // Fetch profile first to ensure it exists
  if (authStore.user) {
    console.log('[Dashboard] Fetching profile for user:', authStore.user.id)
    await profileStore.fetchProfile()
  }
  
  // Then load battle
  loadBattle()
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 1rem;
  color: var(--text-secondary);
}

.battle-container {
  padding: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.battle-songs {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
  justify-content: center;
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

.skip-button {
  margin-top: 1rem;
  --color: var(--text-secondary);
}

.no-battles-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  text-align: center;
}

.no-battles-icon {
  font-size: 5rem;
  color: var(--text-muted);
  opacity: 0.5;
  margin-bottom: 1rem;
}

.no-battles-container h2 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.no-battles-container p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.recent-battles {
  padding: 1rem;
  margin-top: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.battle-history-card {
  margin-bottom: 0.5rem;
}

.battle-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.battle-matchup {
  margin: 0;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.battle-date {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.8rem;
}

/* Upload Section Styles */
.upload-container {
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-placeholder {
  text-align: center;
  max-width: 400px;
}

.upload-icon {
  font-size: 4rem;
  color: #ffd200;
  margin-bottom: 1rem;
}

.upload-placeholder h2 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.upload-placeholder p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}
</style>