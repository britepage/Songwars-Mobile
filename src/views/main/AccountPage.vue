<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Account</ion-title>
        <ion-buttons slot="end">
          <ThemeToggle />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="avatar-container">
          <img 
            :src="profile?.avatar_url || '/default-avatar.png'" 
            :alt="profile?.display_name || 'User'"
            class="avatar"
          />
          <ion-button 
            fill="clear"
            size="small"
            class="edit-avatar-button"
            @click="changeAvatar"
          >
            <ion-icon :icon="camera" />
          </ion-button>
        </div>
        
        <h2 class="display-name">{{ profile?.display_name || 'User' }}</h2>
        <p class="username">@{{ profile?.username || 'username' }}</p>
      </div>
      
      <!-- Stats -->
      <div class="stats-section">
        <div class="stat-card">
          <ion-icon :icon="musicalNotes" class="stat-icon" />
          <div class="stat-info">
            <h3>{{ userSongsCount }}</h3>
            <p>Songs</p>
          </div>
        </div>
        
        <div class="stat-card">
          <ion-icon :icon="trophy" class="stat-icon" />
          <div class="stat-info">
            <h3>{{ battlesWon }}</h3>
            <p>Wins</p>
          </div>
        </div>
        
        <div class="stat-card">
          <ion-icon :icon="star" class="stat-icon" />
          <div class="stat-info">
            <h3>{{ goldenEarsCount }}</h3>
            <p>Golden Ears</p>
          </div>
        </div>
      </div>
      
      <!-- Settings List -->
      <ion-list>
        <ion-list-header>
          <ion-label>Settings</ion-label>
        </ion-list-header>
        
        <ion-item button @click="editProfile">
          <ion-icon :icon="person" slot="start" />
          <ion-label>Edit Profile</ion-label>
        </ion-item>
        
        <ion-item>
          <ion-icon :icon="moon" slot="start" />
          <ion-label>Dark Mode</ion-label>
          <ion-toggle 
            :checked="isDarkMode"
            @ionChange="toggleTheme"
          />
        </ion-item>
        
        <ion-item button @click="manageNotifications">
          <ion-icon :icon="notifications" slot="start" />
          <ion-label>Notifications</ion-label>
        </ion-item>
        
        <ion-item button @click="viewPrivacy">
          <ion-icon :icon="lockClosed" slot="start" />
          <ion-label>Privacy</ion-label>
        </ion-item>
        
        <ion-item button @click="viewHelp">
          <ion-icon :icon="helpCircle" slot="start" />
          <ion-label>Help & Support</ion-label>
        </ion-item>
      </ion-list>
      
      <!-- Social Links -->
      <div class="social-links-section">
        <SocialLinks 
          :title="'Social Links'"
          :show-add-button="true"
          @add-link="addSocialLink"
        />
      </div>
      
      <!-- Logout Button -->
      <div class="logout-section">
        <ion-button 
          expand="block"
          color="danger"
          @click="handleLogout"
        >
          <ion-icon :icon="logOut" slot="start" />
          Logout
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
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonToggle
} from '@ionic/vue'
import {
  camera,
  musicalNotes,
  trophy,
  star,
  person,
  moon,
  notifications,
  lockClosed,
  helpCircle,
  logOut
} from 'ionicons/icons'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'
import { useSongStore } from '@/stores/songStore'
import { useThemeStore } from '@/stores/themeStore'
import SocialLinks from '@/components/core/SocialLinks.vue'
import ThemeToggle from '@/components/core/ThemeToggle.vue'

const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const songStore = useSongStore()
const themeStore = useThemeStore()

const profile = computed(() => profileStore.profile)
const userSongsCount = computed(() => songStore.userSongs.length)
const battlesWon = ref(0) // TODO: Get from battles store
const goldenEarsCount = ref(0) // TODO: Get from golden ears store
const isDarkMode = computed(() => themeStore.theme === 'dark')

const loadProfile = async () => {
  try {
    if (authStore.user) {
      await profileStore.fetchProfile(authStore.user.id)
    }
  } catch (error) {
    console.error('Failed to load profile:', error)
  }
}

const changeAvatar = () => {
  console.log('Change avatar')
  // TODO: Implement avatar upload
}

const editProfile = () => {
  console.log('Edit profile')
  // TODO: Navigate to edit profile page
}

const toggleTheme = () => {
  themeStore.toggleTheme()
}

const manageNotifications = () => {
  console.log('Manage notifications')
  // TODO: Navigate to notifications settings
}

const viewPrivacy = () => {
  console.log('View privacy')
  // TODO: Navigate to privacy settings
}

const viewHelp = () => {
  console.log('View help')
  // TODO: Navigate to help page
}

const addSocialLink = () => {
  console.log('Add social link')
  // TODO: Show add social link modal
}

const handleLogout = async () => {
  try {
    await authStore.signOut()
    router.push('/sign-in')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  background: var(--bg-secondary);
}

.avatar-container {
  position: relative;
  margin-bottom: 1rem;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--ion-color-primary);
}

.edit-avatar-button {
  position: absolute;
  bottom: 0;
  right: 0;
  --background: var(--ion-color-primary);
  --color: #000000;
  --border-radius: 50%;
  width: 32px;
  height: 32px;
}

.display-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.username {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 0.5rem;
  text-align: center;
}

.stat-icon {
  font-size: 2rem;
  color: var(--ion-color-primary);
  margin-bottom: 0.5rem;
}

.stat-info h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.stat-info p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

ion-list {
  margin: 1rem 0;
}

.social-links-section {
  padding: 1rem;
}

.logout-section {
  padding: 1rem;
  margin-top: 2rem;
}
</style>