<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/dashboard" />
        </ion-buttons>
        <ion-title>{{ userProfile?.display_name || username }}</ion-title>
        <ion-buttons slot="end">
          <ThemeToggle />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <ion-spinner name="crescent" color="primary" />
        <p>Loading profile...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <ion-icon :icon="alertCircle" class="error-icon" />
        <h2>Profile Not Found</h2>
        <p>{{ error }}</p>
        <ion-button 
          v-if="isAuthenticated" 
          @click="router.push('/tabs/dashboard')" 
          class="bigbutton"
        >
          Go to Dashboard
        </ion-button>
        <ion-button 
          v-else 
          @click="router.push('/sign-in')" 
          class="bigbutton"
        >
          Sign In
        </ion-button>
      </div>
      
      <!-- Profile Content -->
      <div v-else-if="userProfile" class="profile-container">
        <!-- Profile Header -->
        <div class="profile-header">
          <div class="avatar-container">
            <img 
              v-if="userProfile.avatar_url"
              :src="`${userProfile.avatar_url}?t=${Date.now()}`"
              :alt="userProfile.display_name || username"
              class="avatar"
            />
            <div v-else class="avatar-fallback">
              <ion-icon :icon="personCircle" />
            </div>
          </div>
          
          <h2 class="display-name">{{ userProfile.display_name || username }}</h2>
          <p class="username">@{{ username }}</p>
          
          <!-- Role Badge -->
          <div v-if="userProfile.role && userProfile.role !== 'fan'" class="role-badge">
            {{ userProfile.role === 'artist' ? 'Artist' : userProfile.role === 'judge' ? 'Judge' : userProfile.role }}
          </div>
          
          <p v-if="userProfile.bio" class="bio">{{ userProfile.bio }}</p>
         
        </div>
        
        <!-- Social Links -->
        <div v-if="socialLinks.length > 0" class="social-links-section">
          <h3 class="section-title">
            <svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
            </svg>
            Connect
          </h3>
          <SocialLinks :user-id="userProfile.id" :social-links="socialLinks" />
        </div>
        
        <!-- Golden Ears Progress (only for owner) -->
        <div v-if="isMyProfile" class="golden-ears-section">
          <GoldenEarsProgress
            :progress-data="weeklyProgress"
            :is-loading="goldenEarsLoading"
            @refresh="handleRefreshProgress"
          />
        </div>
        
        <!-- Golden Ears History (always visible) -->
        <div class="golden-ears-section">
          <GoldenEarsHistory
            :awards="goldenEarsHistory"
            :is-loading="goldenEarsLoading"
            @refresh="handleRefreshHistory"
          />
        </div>
        
        <!-- Tagged Songs (only for owner) -->
        <div v-if="isOwnProfile" class="tagged-songs-section">
          <h3 class="section-title">
            <svg class="section-icon tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            Tagged Songs
          </h3>
          
          <!-- Loading State -->
          <div v-if="taggedSongsLoading" class="tagged-songs-loading">
            <ion-spinner name="crescent" color="primary" />
            <p>Loading tagged songs...</p>
          </div>
          
          <!-- Empty State -->
          <div v-else-if="taggedSongs.length === 0" class="tagged-songs-empty">
            <ion-icon :icon="musicalNotes" class="empty-icon" />
            <p>No tagged songs yet</p>
            <p class="empty-hint">Tag songs you discover in battles to save them here</p>
          </div>
          
          <!-- Tagged Songs List -->
          <div v-else class="tagged-songs-list">
            <TaggedSongCard
              v-for="song in taggedSongs"
              :key="song.song_id"
              :song="song"
              :is-playing="isSongPlaying(song.song_id)"
              :audio-loading="audioLoading.get(song.song_id) || false"
              :audio-error="audioErrors.get(song.song_id) || null"
              :progress-value="progress.get(song.song_id) || 0"
              :is-expanded="isSongExpanded(song.song_id)"
              :can-untag="true"
              :is-mobile="isMobile"
              @play="handlePlayTaggedSong"
              @untag="showUntagConfirmation"
              @toggle-expand="toggleSongExpanded"
              @retry="handleRetryAudio"
            />
          </div>
        </div>
      </div>
    </ion-content>
    
    <!-- Untag Confirmation Modal -->
    <ion-modal :is-open="showUntagModal" @didDismiss="closeUntagModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>Remove Tagged Song</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeUntagModal">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <div class="untag-modal-content">
          <ion-icon :icon="alertCircle" class="warning-icon" />
          <h3>Remove this song from your tagged collection?</h3>
          <p v-if="songToUntag" class="song-summary">
            <strong>{{ songToUntag.songs.title }}</strong> by {{ songToUntag.songs.artist }}
          </p>
          <div class="modal-actions">
            <ion-button color="danger" @click="confirmUntagSong">
              Remove Song
            </ion-button>
            <ion-button @click="closeUntagModal">
              Cancel
            </ion-button>
          </div>
        </div>
      </ion-content>
    </ion-modal>
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
  IonIcon,
  IonSpinner,
  IonModal
} from '@ionic/vue'
import { musicalNotes, alertCircle, personCircle } from 'ionicons/icons'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { onIonViewWillEnter } from '@ionic/vue'
import { useProfileStore } from '@/stores/profileStore'
import { useAuthStore } from '@/stores/authStore'
import { useGoldenEarsStore } from '@/stores/goldenEarsStore'
import { useTaggedSongs } from '@/composables/useTaggedSongs'
import SocialLinks from '@/components/core/SocialLinks.vue'
import ThemeToggle from '@/components/core/ThemeToggle.vue'
import GoldenEarsProgress from '@/components/golden-ears/GoldenEarsProgress.vue'
import GoldenEarsHistory from '@/components/golden-ears/GoldenEarsHistory.vue'
import TaggedSongCard from '@/components/profile/TaggedSongCard.vue'

const route = useRoute()
const router = useRouter()
const profileStore = useProfileStore()
const authStore = useAuthStore()
const goldenEarsStore = useGoldenEarsStore()

const username = computed(() => route.params.username as string)
const isLoading = ref(false)
const error = ref<string | null>(null)
const userProfile = ref<any>(null)
const isMobile = ref(false)

// Tagged Songs
const {
  taggedSongs,
  loading: taggedSongsLoading,
  audioLoading,
  audioErrors,
  progress,
  fetchTaggedSongs,
  toggleSongExpanded,
  isSongExpanded,
  playTaggedSong,
  isSongPlaying,
  untagSong,
  retryAudio,
  cleanupAllAudio
} = useTaggedSongs()

// Golden Ears
const weeklyProgress = ref<any>(null)
const goldenEarsHistory = ref<any[]>([])
const goldenEarsLoading = ref(false)

// Untag Modal
const showUntagModal = ref(false)
const songToUntag = ref<any>(null)

// Computed
const isAuthenticated = computed(() => !!authStore.user)
const isMyProfile = computed(() => {
  if (!authStore.user || !userProfile.value) return false
  return authStore.user.id === userProfile.value.id
})
const isOwnProfile = computed(() => isMyProfile.value)

const socialLinks = computed(() => {
  if (!userProfile.value?.social_links) return []
  try {
    const links = typeof userProfile.value.social_links === 'string'
      ? JSON.parse(userProfile.value.social_links)
      : userProfile.value.social_links
    return Array.isArray(links) ? links : []
  } catch {
    return []
  }
})

const songsCount = computed(() => {
  // Count from tagged songs if viewing own profile, otherwise 0
  return isOwnProfile.value ? taggedSongs.value.length : 0
})
const battlesWon = ref(0) // TODO: Get from battles store
const goldenEarsCount = computed(() => goldenEarsHistory.value.length)

const loadUserProfile = async () => {
  if (!username.value) {
    error.value = 'Invalid username'
    isLoading.value = false
    return
  }

  isLoading.value = true
  error.value = null
  
  try {
    let result
    
    // BRANCH A: User is Logged In
    if (authStore.user) {
      // Fetch the current user's profile by ID (matching web app)
      const myProfileResult = await profileStore.fetchProfile()
      const myProfile = myProfileResult?.data
      
      if (myProfile && myProfile.username === username.value) {
        // Viewing own profile - use the profile fetched by ID
        result = { success: true, data: myProfile, error: null }
      } else {
        // Viewing someone else's profile - fetch by username
        result = await profileStore.fetchPublicProfileByUsername(username.value)
      }
    } else {
      // BRANCH B: User is NOT Logged In
      // Not logged in, fetch public profile
      result = await profileStore.fetchPublicProfileByUsername(username.value)
    }
    
    // Error handling (matching web app)
    if (result.error) {
      if (result.error.code === 'PGRST116') {
        error.value = 'Profile not found or is private'
      } else {
        error.value = 'Failed to load profile'
      }
      userProfile.value = null
    } else {
      // Success path
      userProfile.value = result.data
      
      // Fetch tagged songs for this profile (matching web app)
      if (isOwnProfile.value) {
        await fetchTaggedSongs(userProfile.value.id)
      }
      
      // Load Golden Ears data
      await loadGoldenEarsData()
    }
  } catch (err) {
    console.error('Failed to load user profile:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load profile'
    userProfile.value = null
  } finally {
    isLoading.value = false
  }
}

const loadGoldenEarsData = async () => {
  if (!userProfile.value) return
  
  try {
    goldenEarsLoading.value = true
    
    // Load weekly progress (only for own profile)
    if (isOwnProfile.value) {
      const progressResult = await goldenEarsStore.fetchWeeklyProgress(userProfile.value.id)
      if (progressResult.success) {
        weeklyProgress.value = progressResult.data
      }
    }
    
    // Load history (always visible)
    const historyResult = await goldenEarsStore.fetchGoldenEarsHistory(userProfile.value.id)
    if (historyResult.success) {
      goldenEarsHistory.value = historyResult.data || []
    }
  } catch (err) {
    console.error('Failed to load Golden Ears data:', err)
  } finally {
    goldenEarsLoading.value = false
  }
}

const handleRefreshProgress = async () => {
  if (userProfile.value && isOwnProfile.value) {
    await loadGoldenEarsData()
  }
}

const handleRefreshHistory = async () => {
  if (userProfile.value) {
    await loadGoldenEarsData()
  }
}

const handlePlayTaggedSong = async (song: any) => {
  await playTaggedSong(song)
}

const showUntagConfirmation = (songId: string) => {
  const song = taggedSongs.value.find(s => s.song_id === songId)
  if (song) {
    songToUntag.value = song
    showUntagModal.value = true
  }
}

const closeUntagModal = () => {
  showUntagModal.value = false
  songToUntag.value = null
}

const confirmUntagSong = async () => {
  if (!songToUntag.value) return
  
  const success = await untagSong(songToUntag.value.song_id)
  if (success) {
    closeUntagModal()
  }
}

const handleRetryAudio = async (song: any) => {
  await retryAudio(song)
}

// Watch for route changes
watch(() => route.params.username, (newUsername) => {
  if (newUsername) {
    loadUserProfile()
  }
}, { immediate: false })

// Watch for auth changes
watch(() => authStore.user, () => {
  if (userProfile.value) {
    // Reload to update isMyProfile state
    loadUserProfile()
  }
})

// Ionic lifecycle hook
onIonViewWillEnter(() => {
  loadUserProfile()
})

onMounted(() => {
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  loadUserProfile()
})

onUnmounted(() => {
  cleanupAllAudio()
})
</script>

<style scoped>
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  text-align: center;
}

.loading-container {
  gap: 1rem;
  color: var(--text-secondary);
}

.error-icon {
  font-size: 5rem;
  color: var(--text-muted);
  opacity: 0.5;
  margin-bottom: 1rem;
}

.error-container h2 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.error-container p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.profile-container {
  padding-bottom: 6rem;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  background: var(--bg-secondary);
}

.avatar-container {
  margin-bottom: 1rem;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #ffd200;
}

.avatar-fallback {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid #ffd200;
}

.avatar-fallback ion-icon {
  font-size: 4rem;
  color: var(--text-muted);
}

.display-name {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.username {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0 0 0.75rem 0;
}

.role-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: #ffd200;
  color: #000;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.bio {
  font-size: 1rem;
  color: var(--text-secondary);
  text-align: center;
  margin: 0 0 1.5rem 0;
  max-width: 500px;
  line-height: 1.5;
}

.profile-stats {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.social-links-section,
.golden-ears-section,
.tagged-songs-section {
  padding: 1.5rem 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-icon {
  font-size: 1.25rem;
  color: #ffd200;
}

.tag-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.tagged-songs-loading,
.tagged-songs-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
}

.tagged-songs-loading {
  gap: 1rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  color: var(--text-muted);
  opacity: 0.5;
  margin-bottom: 1rem;
}

.tagged-songs-empty p {
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

.empty-hint {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.tagged-songs-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.untag-modal-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
}

.warning-icon {
  font-size: 3rem;
  color: var(--ion-color-warning);
  margin-bottom: 1rem;
}

.untag-modal-content h3 {
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.song-summary {
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.modal-actions ion-button {
  flex: 1;
}
</style>
