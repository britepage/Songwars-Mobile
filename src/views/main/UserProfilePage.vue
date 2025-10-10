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
      
      <!-- Profile Content -->
      <div v-else-if="userProfile" class="profile-container">
        <!-- Profile Header -->
        <div class="profile-header">
          <div class="avatar-container">
            <img 
              :src="userProfile.avatar_url || '/default-avatar.png'" 
              :alt="userProfile.display_name || username"
              class="avatar"
            />
          </div>
          
          <h2 class="display-name">{{ userProfile.display_name || username }}</h2>
          <p class="username">@{{ username }}</p>
          
          <p v-if="userProfile.bio" class="bio">{{ userProfile.bio }}</p>
          
          <!-- Stats -->
          <div class="profile-stats">
            <div class="stat">
              <span class="stat-number">{{ songsCount }}</span>
              <span class="stat-label">Songs</span>
            </div>
            <div class="stat">
              <span class="stat-number">{{ battlesWon }}</span>
              <span class="stat-label">Wins</span>
            </div>
            <div class="stat">
              <span class="stat-number">{{ goldenEarsCount }}</span>
              <span class="stat-label">Golden Ears</span>
            </div>
          </div>
        </div>
        
        <!-- Social Links -->
        <div v-if="socialLinks.length > 0" class="social-links-section">
          <h3 class="section-title">Social Links</h3>
          <SocialLinks :user-id="userProfile.id" />
        </div>
        
        <!-- User Songs -->
        <div class="user-songs-section">
          <h3 class="section-title">Songs</h3>
          
          <div v-if="userSongs.length === 0" class="no-songs">
            <ion-icon :icon="musicalNotes" class="no-songs-icon" />
            <p>No songs uploaded yet</p>
          </div>
          
          <div v-else class="songs-grid">
            <SongCard 
              v-for="song in userSongs" 
              :key="song.id"
              :song="song"
              :show-stats="true"
              :show-play-button="true"
              @play="handlePlay"
            />
          </div>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else class="error-container">
        <ion-icon :icon="alertCircle" class="error-icon" />
        <h2>Profile Not Found</h2>
        <p>This user profile could not be found.</p>
        <ion-button @click="goBack" class="bigbutton">
          Go Back
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
  IonBackButton,
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/vue'
import { musicalNotes, alertCircle } from 'ionicons/icons'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profileStore'
import { useSongStore } from '@/stores/songStore'
import SocialLinks from '@/components/core/SocialLinks.vue'
import SongCard from '@/components/core/SongCard.vue'
import ThemeToggle from '@/components/core/ThemeToggle.vue'

const route = useRoute()
const router = useRouter()
const profileStore = useProfileStore()
const songStore = useSongStore()

const username = computed(() => route.params.username as string)
const isLoading = ref(false)
const userProfile = ref<any>(null)
const userSongs = ref<any[]>([])
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

const songsCount = computed(() => userSongs.value.length)
const battlesWon = ref(0) // TODO: Get from battles store
const goldenEarsCount = ref(0) // TODO: Get from golden ears store

const loadUserProfile = async () => {
  isLoading.value = true
  
  try {
    // TODO: Fetch user profile by username
    // For now, using the current user's profile as placeholder
    await profileStore.fetchProfile(username.value)
    userProfile.value = profileStore.profile
    
    // Fetch user's songs
    if (userProfile.value) {
      await songStore.fetchUserSongs(userProfile.value.id)
      userSongs.value = songStore.songs.filter(s => s.user_id === userProfile.value.id)
    }
  } catch (error) {
    console.error('Failed to load user profile:', error)
    userProfile.value = null
  } finally {
    isLoading.value = false
  }
}

const handlePlay = (song: any) => {
  console.log('Playing song:', song)
  // TODO: Implement audio playback
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadUserProfile()
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
  padding-bottom: 2rem;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.avatar-container {
  margin-bottom: 1rem;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--ion-color-primary);
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
  margin: 0 0 1rem 0;
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
.user-songs-section {
  padding: 1.5rem 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.no-songs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.no-songs-icon {
  font-size: 4rem;
  color: var(--text-muted);
  opacity: 0.5;
  margin-bottom: 1rem;
}

.no-songs p {
  color: var(--text-secondary);
  margin: 0;
}

.songs-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>