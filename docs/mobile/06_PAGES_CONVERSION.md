# Pages Conversion Guide

## Overview
This guide covers the complete conversion of all 12 SongWars pages from Vue.js web components to Ionic mobile pages, including mobile-specific UI patterns, navigation, and user experience optimizations.

## Table of Contents
1. [Page Conversion Overview](#page-conversion-overview)
2. [Public Pages](#public-pages)
3. [Authentication Pages](#authentication-pages)
4. [Authenticated Pages](#authenticated-pages)
5. [Admin Pages](#admin-pages)
6. [Mobile-Specific Patterns](#mobile-specific-patterns)
7. [Page Templates](#page-templates)
8. [Code Examples](#code-examples)

## Page Conversion Overview

### Current Web Pages (12 total)
Based on the SongWars web app structure:

```typescript
const webPages = [
  { path: '/', component: 'index.vue' },                    // Landing page
  { path: '/dashboard', component: 'dashboard.vue' },       // Main battle interface
  { path: '/my-songs', component: 'my-songs.vue' },         // Song management
  { path: '/leaderboard', component: 'leaderboard.vue' },   // Rankings
  { path: '/account', component: 'account.vue' },           // User settings
  { path: '/user/:username', component: 'user/[username].vue' }, // Public profiles
  { path: '/sign-in', component: 'sign-in.vue' },           // Authentication
  { path: '/registration', component: 'registration.vue' }, // User registration
  { path: '/reset-password', component: 'reset-password.vue' }, // Password reset
  { path: '/reset-password-email', component: 'reset-password-email.vue' }, // Email reset
  { path: '/preview', component: 'PreviewPage.vue' },                 // Trial preview (parity with web)
  { path: '/admin/flags', component: 'admin/flags.vue' },   // Admin moderation
];
```

### Mobile Page Structure
Convert to Ionic page structure with mobile-optimized layouts:

```typescript
const mobilePages = [
  { path: '/', component: 'HomePage.vue' },                    // Landing page
  { path: '/tabs/dashboard', component: 'DashboardPage.vue' }, // Main battle interface
  { path: '/tabs/my-songs', component: 'MySongsPage.vue' },    // Song management
  { path: '/tabs/leaderboard', component: 'LeaderboardPage.vue' }, // Rankings
  { path: '/tabs/account', component: 'AccountPage.vue' },     // User settings
  { path: '/user/:username', component: 'UserProfilePage.vue' }, // Public profiles
  { path: '/sign-in', component: 'SignInPage.vue' },           // Authentication
  { path: '/registration', component: 'RegistrationPage.vue' }, // User registration
  { path: '/reset-password', component: 'ResetPasswordPage.vue' }, // Password reset
  { path: '/reset-password-email', component: 'ResetPasswordEmailPage.vue' }, // Email reset
  { path: '/preview', component: 'PreviewPage.vue' },                 // Trial preview (parity with web)
  { path: '/admin/flags', component: 'AdminFlagsPage.vue' },   // Admin moderation
];
```

## Public Pages

### 1. Home Page (Landing)
Convert the landing page to mobile:

```vue
<!-- src/views/HomePage.vue -->
<template>
  <ion-page>
    <ion-content class="home-content">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <img src="/tapey.svg" alt="SongWars" class="logo" />
          <h1 class="hero-title">Battle Your Music</h1>
          <p class="hero-subtitle">
            Upload your songs and compete in head-to-head battles
          </p>
          
          <div class="hero-buttons">
            <ion-button 
              v-if="!isAuthenticated"
              @click="goToSignIn"
              size="large"
              class="hero-button"
            >
              Get Started
            </ion-button>
            <ion-button 
              v-if="!isAuthenticated"
              @click="goToRegistration"
              size="large"
              fill="outline"
              class="hero-button"
            >
              Sign Up
            </ion-button>
            <ion-button 
              v-if="isAuthenticated"
              @click="goToDashboard"
              size="large"
              class="hero-button"
            >
              Start Battling
            </ion-button>
          </div>
        </div>
      </div>
      
      <!-- Features Section -->
      <div class="features-section">
        <h2 class="section-title">How It Works</h2>
        
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
      </div>
      
      <!-- Stats Section -->
      <div class="stats-section">
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
          <p>Users</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton, IonCard, IonCardContent, IonIcon } from '@ionic/vue';
import { musicalNotes, trophy, star } from 'ionicons/icons';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { useSupabaseService } from '@/composables/useSupabaseService';

const router = useRouter();
const authStore = useAuthStore();
const { client: supabase } = useSupabaseService();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const totalSongs = ref(0);
const totalBattles = ref(0);
const totalUsers = ref(0);

const loadStats = async () => {
  try {
    // Load public stats
    const [songsResult, battlesResult, usersResult] = await Promise.all([
      supabase.from('songs').select('id', { count: 'exact', head: true }),
      supabase.from('battles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true })
    ]);
    
    totalSongs.value = songsResult.count || 0;
    totalBattles.value = battlesResult.count || 0;
    totalUsers.value = usersResult.count || 0;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
};

const goToSignIn = () => {
  router.push('/sign-in');
};

const goToRegistration = () => {
  router.push('/registration');
};

const goToDashboard = () => {
  router.push('/tabs/dashboard');
};

onMounted(() => {
  loadStats();
});
</script>

<style scoped>
.home-content {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero-section {
  padding: 2rem 1rem;
  text-align: center;
  color: white;
}

.logo {
  width: 200px;
  height: auto;
  margin-bottom: 1rem;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.hero-button {
  --border-radius: 25px;
  min-width: 200px;
}

.features-section {
  padding: 2rem 1rem;
  background: white;
}

.section-title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  color: #333;
}

.feature-card {
  margin-bottom: 1rem;
  text-align: center;
}

.feature-icon {
  font-size: 3rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.stats-section {
  display: flex;
  justify-content: space-around;
  padding: 2rem 1rem;
  background: #f8f9fa;
}

.stat-item {
  text-align: center;
}

.stat-item h3 {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.stat-item p {
  color: #666;
  font-size: 0.9rem;
}
</style>
```

### 2. User Profile Page
Convert the user profile page:

```vue
<!-- src/views/UserProfilePage.vue -->
<template>
  <ion-page>
    <NavigationHeader 
      :title="userProfile?.display_name || username"
      :show-back-button="true"
    />
    
    <ion-content>
      <div v-if="loading" class="loading-container">
        <ion-spinner name="crescent" />
        <p>Loading profile...</p>
      </div>
      
      <div v-else-if="userProfile" class="profile-container">
        <!-- Profile Header -->
        <div class="profile-header">
          <div class="avatar-container">
            <img 
              :src="userProfile.avatar_url || '/default-avatar.png'" 
              :alt="userProfile.display_name"
              class="avatar"
            />
          </div>
          
          <div class="profile-info">
            <h1 class="display-name">{{ userProfile.display_name }}</h1>
            <p class="username">@{{ username }}</p>
            <p v-if="userProfile.bio" class="bio">{{ userProfile.bio }}</p>
            
            <div class="profile-stats">
              <div class="stat">
                <span class="stat-number">{{ userProfile.songs_count || 0 }}</span>
                <span class="stat-label">Songs</span>
              </div>
              <div class="stat">
                <span class="stat-number">{{ userProfile.battles_won || 0 }}</span>
                <span class="stat-label">Wins</span>
              </div>
              <div class="stat">
                <span class="stat-number">{{ userProfile.golden_ears_count || 0 }}</span>
                <span class="stat-label">Golden Ears</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Social Links (from profile.social_links JSONB) -->
        <div v-if="socialLinks.length > 0" class="social-links">
          <h3>Links</h3>
          <div class="links-grid">
            <a 
              v-for="(link, index) in socialLinks" 
              :key="index"
              :href="link.url" 
              target="_blank"
              class="social-link"
            >
              <ion-icon :icon="getSocialIcon(link.platform)" />
              <span>{{ link.platform }}</span>
            </a>
          </div>
        </div>
        
        <!-- User Songs -->
        <div class="user-songs">
          <h3>Recent Songs</h3>
          <div v-if="userSongs.length === 0" class="no-songs">
            <ion-icon :icon="musicalNotes" />
            <p>No songs uploaded yet</p>
          </div>
          <div v-else class="songs-grid">
            <ion-card 
              v-for="song in userSongs" 
              :key="song.id"
              class="song-card"
              @click="playSong(song)"
            >
              <ion-card-content>
                <div class="song-info">
                  <h4>{{ song.title }}</h4>
                  <p>{{ song.genre }}</p>
                  <div class="song-stats">
                    <span>{{ song.votes_count || 0 }} votes</span>
                    <span>{{ formatDate(song.created_at) }}</span>
                  </div>
                </div>
                <ion-button 
                  fill="clear" 
                  size="small"
                  @click.stop="playSong(song)"
                >
                  <ion-icon :icon="play" />
                </ion-button>
              </ion-card-content>
            </ion-card>
          </div>
        </div>
      </div>
      
      <div v-else class="error-container">
        <ion-icon :icon="personCircle" />
        <h2>User Not Found</h2>
        <p>The user you're looking for doesn't exist.</p>
        <ion-button @click="goBack">Go Back</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonCard, IonCardContent, IonButton, IonIcon, IonSpinner } from '@ionic/vue';
import { musicalNotes, play, personCircle } from 'ionicons/icons';
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSupabaseService } from '@/composables/useSupabaseService';
import { useAudioPlayer } from '@/composables/useAudioPlayer';
import NavigationHeader from '@/components/NavigationHeader.vue';

const route = useRoute();
const router = useRouter();
const { client: supabase } = useSupabaseService();
const audioPlayer = useAudioPlayer();

const username = computed(() => route.params.username as string);
const loading = ref(true);
const userProfile = ref(null);
const userSongs = ref([]);

// Social links are stored in profile.social_links as JSONB array
// See SOCIAL_LINKS_IMPLEMENTATION.md for details
const socialLinks = computed(() => userProfile.value?.social_links || []);

const loadUserProfile = async () => {
  try {
    loading.value = true;
    
    // Load user profile (includes social_links JSONB field)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username.value)
      .single();
    
    if (profileError) {
      console.error('Error loading profile:', profileError);
      return;
    }
    
    userProfile.value = profile;
    
    // Load user songs
    const { data: songs, error: songsError } = await supabase
      .from('songs')
      .select('*')
      .eq('user_id', profile.id)
      .eq('status', 'live')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!songsError) {
      userSongs.value = songs || [];
    }
    
    // Optional: load social links if your backend provides them (not required for parity)

  } catch (error) {
    console.error('Error loading user profile:', error);
  } finally {
    loading.value = false;
  }
};

const playSong = async (song: any) => {
  if (song.url) {
    await audioPlayer.togglePlay({
      songId: song.id,
      audioUrl: song.url,
      clipStartTime: song.clip_start_time || 0,
      autoStopAfter: 30000
    });
  }
};

const getSocialIcon = (platform: string) => {
  // Return appropriate icon based on platform
  const icons = {
    'spotify': 'musical-notes',
    'youtube': 'play-circle',
    'instagram': 'camera',
    'twitter': 'logo-twitter',
    'facebook': 'logo-facebook'
  };
  return icons[platform.toLowerCase()] || 'link';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  loadUserProfile();
});
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.profile-container {
  padding: 1rem;
}

.profile-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.avatar-container {
  flex-shrink: 0;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-info {
  flex: 1;
}

.display-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.username {
  color: #666;
  margin-bottom: 1rem;
}

.bio {
  margin-bottom: 1rem;
  line-height: 1.5;
}

.profile-stats {
  display: flex;
  gap: 1rem;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
}

.social-links {
  margin-bottom: 2rem;
}

.social-links h3 {
  margin-bottom: 1rem;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
}

.user-songs h3 {
  margin-bottom: 1rem;
}

.no-songs {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.songs-grid {
  display: grid;
  gap: 1rem;
}

.song-card {
  cursor: pointer;
}

.song-info h4 {
  margin-bottom: 0.5rem;
}

.song-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.5rem;
}

.error-container {
  text-align: center;
  padding: 2rem;
}

.error-container ion-icon {
  font-size: 4rem;
  color: #ccc;
  margin-bottom: 1rem;
}
</style>
```

## Authentication Pages

### 1. Sign In Page
Convert the sign-in page:

```vue
<!-- src/views/SignInPage.vue -->
<template>
  <ion-page>
    <ion-content class="auth-content">
      <div class="auth-container">
        <div class="auth-header">
          <img src="/tapey.svg" alt="SongWars" class="auth-logo" />
          <h1>Welcome Back</h1>
          <p>Sign in to continue your musical journey</p>
        </div>
        
        <form @submit.prevent="handleSignIn" class="auth-form">
          <ion-item>
            <ion-label position="stacked">Email</ion-label>
            <ion-input
              v-model="email"
              type="email"
              placeholder="Enter your email"
              required
            />
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Password</ion-label>
            <ion-input
              v-model="password"
              type="password"
              placeholder="Enter your password"
              required
            />
          </ion-item>
          
          <ion-button 
            type="submit" 
            expand="block" 
            size="large"
            :disabled="loading"
            class="auth-button"
          >
            <ion-spinner v-if="loading" name="crescent" />
            <span v-else>Sign In</span>
          </ion-button>
        </form>
        
        <div class="auth-divider">
          <span>OR</span>
        </div>
        
        <div class="social-auth">
          <ion-button 
            @click="signInWithGoogle"
            expand="block"
            fill="outline"
            class="social-button"
          >
            <ion-icon :icon="logoGoogle" slot="start" />
            Continue with Google
          </ion-button>
          
          <ion-button 
            @click="signInWithFacebook"
            expand="block"
            fill="outline"
            class="social-button"
          >
            <ion-icon :icon="logoFacebook" slot="start" />
            Continue with Facebook
          </ion-button>
        </div>
        
        <div class="auth-footer">
          <p>
            Don't have an account? 
            <router-link to="/registration">Sign up</router-link>
          </p>
          <p>
            <router-link to="/reset-password-email">Forgot password?</router-link>
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonItem, IonLabel, IonInput, IonButton, IonSpinner, IonIcon } from '@ionic/vue';
import { logoGoogle, logoFacebook } from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { useOAuthSignIn } from '@/composables/useOAuthSignIn';

const router = useRouter();
const authStore = useAuthStore();
const { signInWithGoogle, signInWithFacebook } = useOAuthSignIn();

const email = ref('');
const password = ref('');
const loading = ref(false);

const handleSignIn = async () => {
  if (!email.value || !password.value) return;
  
  loading.value = true;
  try {
    const result = await authStore.signInWithEmail(email.value, password.value);
    
    if (result.error) {
      // Handle error - show toast or alert
      console.error('Sign in error:', result.error);
    } else {
      // Redirect to dashboard
      router.push('/tabs/dashboard');
    }
  } catch (error) {
    console.error('Sign in error:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-content {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-container {
  padding: 2rem 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

.auth-logo {
  width: 150px;
  height: auto;
  margin-bottom: 1rem;
}

.auth-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.auth-header p {
  opacity: 0.9;
}

.auth-form {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.auth-button {
  margin-top: 1rem;
  --border-radius: 25px;
}

.auth-divider {
  text-align: center;
  margin: 1rem 0;
  color: white;
  position: relative;
}

.auth-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
  z-index: 1;
}

.auth-divider span {
  background: transparent;
  padding: 0 1rem;
  position: relative;
  z-index: 2;
}

.social-auth {
  margin-bottom: 1rem;
}

.social-button {
  margin-bottom: 0.5rem;
  --border-radius: 25px;
}

.auth-footer {
  text-align: center;
  color: white;
}

.auth-footer a {
  color: white;
  text-decoration: underline;
}
</style>
```

### 2. Registration Page
Convert the registration page:

```vue
<!-- src/views/RegistrationPage.vue -->
<template>
  <ion-page>
    <ion-content class="auth-content">
      <div class="auth-container">
        <div class="auth-header">
          <img src="/tapey.svg" alt="SongWars" class="auth-logo" />
          <h1>Join SongWars</h1>
          <p>Create your account and start battling</p>
        </div>
        
        <form @submit.prevent="handleRegistration" class="auth-form">
          <ion-item>
            <ion-label position="stacked">Display Name</ion-label>
            <ion-input
              v-model="displayName"
              type="text"
              placeholder="Enter your display name"
              required
            />
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Email</ion-label>
            <ion-input
              v-model="email"
              type="email"
              placeholder="Enter your email"
              required
            />
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Password</ion-label>
            <ion-input
              v-model="password"
              type="password"
              placeholder="Create a password"
              required
            />
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Confirm Password</ion-label>
            <ion-input
              v-model="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              required
            />
          </ion-item>
          
          <ion-item>
            <ion-checkbox v-model="agreeToTerms" />
            <ion-label class="terms-label">
              I agree to the 
              <a href="/terms" target="_blank">Terms of Service</a> 
              and 
              <a href="/privacy" target="_blank">Privacy Policy</a>
            </ion-label>
          </ion-item>
          
          <ion-button 
            type="submit" 
            expand="block" 
            size="large"
            :disabled="loading || !agreeToTerms"
            class="auth-button"
          >
            <ion-spinner v-if="loading" name="crescent" />
            <span v-else>Create Account</span>
          </ion-button>
        </form>
        
        <div class="auth-divider">
          <span>OR</span>
        </div>
        
        <div class="social-auth">
          <ion-button 
            @click="signUpWithGoogle"
            expand="block"
            fill="outline"
            class="social-button"
          >
            <ion-icon :icon="logoGoogle" slot="start" />
            Sign up with Google
          </ion-button>
          
          <ion-button 
            @click="signUpWithFacebook"
            expand="block"
            fill="outline"
            class="social-button"
          >
            <ion-icon :icon="logoFacebook" slot="start" />
            Sign up with Facebook
          </ion-button>
        </div>
        
        <div class="auth-footer">
          <p>
            Already have an account? 
            <router-link to="/sign-in">Sign in</router-link>
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonItem, IonLabel, IonInput, IonButton, IonSpinner, IonIcon, IonCheckbox } from '@ionic/vue';
import { logoGoogle, logoFacebook } from 'ionicons/icons';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';

const router = useRouter();
const authStore = useAuthStore();

const displayName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const agreeToTerms = ref(false);
const loading = ref(false);

const handleRegistration = async () => {
  if (!displayName.value || !email.value || !password.value || !confirmPassword.value) return;
  
  if (password.value !== confirmPassword.value) {
    // Show error - passwords don't match
    return;
  }
  
  loading.value = true;
  try {
    const result = await authStore.signUpNewUser(email.value, password.value);
    
    if (result.error) {
      // Handle error - show toast or alert
      console.error('Registration error:', result.error);
    } else {
      // Redirect to dashboard or show success message
      router.push('/tabs/dashboard');
    }
  } catch (error) {
    console.error('Registration error:', error);
  } finally {
    loading.value = false;
  }
};

const signUpWithGoogle = async () => {
  // Implement Google sign up
};

const signUpWithFacebook = async () => {
  // Implement Facebook sign up
};
</script>

<style scoped>
/* Similar styles to SignInPage */
.auth-content {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-container {
  padding: 2rem 1rem;
  max-width: 400px;
  margin: 0 auto;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
}

.auth-logo {
  width: 150px;
  height: auto;
  margin-bottom: 1rem;
}

.auth-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.auth-header p {
  opacity: 0.9;
}

.auth-form {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.auth-button {
  margin-top: 1rem;
  --border-radius: 25px;
}

.terms-label {
  margin-left: 1rem;
  font-size: 0.9rem;
}

.terms-label a {
  color: #667eea;
  text-decoration: underline;
}

.auth-divider {
  text-align: center;
  margin: 1rem 0;
  color: white;
  position: relative;
}

.auth-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
  z-index: 1;
}

.auth-divider span {
  background: transparent;
  padding: 0 1rem;
  position: relative;
  z-index: 2;
}

.social-auth {
  margin-bottom: 1rem;
}

.social-button {
  margin-bottom: 0.5rem;
  --border-radius: 25px;
}

.auth-footer {
  text-align: center;
  color: white;
}

.auth-footer a {
  color: white;
  text-decoration: underline;
}
</style>
```

## Authenticated Pages

### 1. Dashboard Page (Battle Interface)
Convert the main battle interface:

```vue
<!-- src/views/DashboardPage.vue -->
<template>
  <ion-page>
    <NavigationHeader 
      title="Battle" 
      :show-back-button="false"
      :show-notifications="true"
    />
    
    <ion-content>
      <!-- Trial Counter -->
      <TrialCounter v-if="showTrialCounter" />
      
      <!-- Battle Interface -->
      <div class="battle-container">
        <BattleAnimation />
      </div>
      
      <!-- Quick Actions -->
      <div class="quick-actions">
        <ion-button 
          @click="openUploadModal"
          fill="outline"
          class="quick-action-button"
        >
          <ion-icon :icon="add" slot="start" />
          Upload Song
        </ion-button>
        
        <ion-button 
          @click="goToMySongs"
          fill="outline"
          class="quick-action-button"
        >
          <ion-icon :icon="library" slot="start" />
          My Songs
        </ion-button>
      </div>
      
      <!-- Recent Battles -->
      <div class="recent-battles">
        <h3>Recent Battles</h3>
        <div v-if="recentBattles.length === 0" class="no-battles">
          <ion-icon :icon="musicalNotes" />
          <p>No recent battles</p>
        </div>
        <div v-else class="battles-list">
          <ion-card 
            v-for="battle in recentBattles" 
            :key="battle.id"
            class="battle-card"
          >
            <ion-card-content>
              <div class="battle-info">
                <h4>{{ battle.song_a_title }} vs {{ battle.song_b_title }}</h4>
                <p>{{ battle.winner_title }} won</p>
                <span class="battle-date">{{ formatDate(battle.created_at) }}</span>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonButton, IonIcon, IonCard, IonCardContent } from '@ionic/vue';
import { add, library, musicalNotes } from 'ionicons/icons';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { useTrialStore } from '@/store/trialStore';
import { useModals } from '@/composables/useModals';
import NavigationHeader from '@/components/NavigationHeader.vue';
import BattleAnimation from '@/components/BattleAnimation.vue';
import TrialCounter from '@/components/TrialCounter.vue';

const router = useRouter();
const authStore = useAuthStore();
const trialStore = useTrialStore();
const { openSongUpload } = useModals();

const recentBattles = ref([]);

const showTrialCounter = computed(() => {
  return trialStore.isTrialUser && !trialStore.hasExceededTrialLimit;
});

const loadRecentBattles = async () => {
  // Load recent battles for the user
  // Implementation depends on your battle data structure
};

const openUploadModal = () => {
  openSongUpload();
};

const goToMySongs = () => {
  router.push('/tabs/my-songs');
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

onMounted(() => {
  loadRecentBattles();
});
</script>

<style scoped>
.battle-container {
  margin-bottom: 2rem;
}

.quick-actions {
  display: flex;
  gap: 1rem;
  padding: 0 1rem;
  margin-bottom: 2rem;
}

.quick-action-button {
  flex: 1;
  --border-radius: 25px;
}

.recent-battles {
  padding: 0 1rem;
}

.recent-battles h3 {
  margin-bottom: 1rem;
}

.no-battles {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.battles-list {
  display: grid;
  gap: 1rem;
}

.battle-card {
  cursor: pointer;
}

.battle-info h4 {
  margin-bottom: 0.5rem;
}

.battle-date {
  font-size: 0.8rem;
  color: #666;
}
</style>
```

### 2. My Songs Page
Convert the song management page:

```vue
<!-- src/views/MySongsPage.vue -->
<template>
  <ion-page>
    <NavigationHeader 
      title="My Songs" 
      :show-back-button="false"
      :show-menu-button="true"
    />
    
    <ion-content>
      <ion-refresher slot="fixed" @ion-refresh="handleRefresh">
        <ion-refresher-content />
      </ion-refresher>
      
      <!-- Upload FAB -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="openUploadModal">
          <ion-icon :icon="add" />
        </ion-fab-button>
      </ion-fab>
      
      <!-- Song List -->
      <div class="songs-container">
        <div v-if="loading" class="loading-container">
          <ion-spinner name="crescent" />
          <p>Loading songs...</p>
        </div>
        
        <div v-else-if="songs.length === 0" class="no-songs">
          <ion-icon :icon="musicalNotes" />
          <h3>No Songs Yet</h3>
          <p>Upload your first song to start battling!</p>
          <ion-button @click="openUploadModal">
            Upload Song
          </ion-button>
        </div>
        
        <div v-else class="songs-list">
          <ion-card 
            v-for="song in songs" 
            :key="song.id"
            class="song-card"
          >
            <ion-card-content>
              <div class="song-header">
                <div class="song-info">
                  <h4>{{ song.title }}</h4>
                  <p>{{ song.genre }}</p>
                </div>
                <ion-button 
                  fill="clear" 
                  size="small"
                  @click="playSong(song)"
                >
                  <ion-icon :icon="isPlaying(song.id) ? pause : play" />
                </ion-button>
              </div>
              
              <div class="song-stats">
                <div class="stat">
                  <span class="stat-number">{{ song.votes_count || 0 }}</span>
                  <span class="stat-label">Votes</span>
                </div>
                <div class="stat">
                  <span class="stat-number">{{ song.battles_count || 0 }}</span>
                  <span class="stat-label">Battles</span>
                </div>
                <div class="stat">
                  <span class="stat-number">{{ song.wins_count || 0 }}</span>
                  <span class="stat-label">Wins</span>
                </div>
              </div>
              
              <div class="song-actions">
                <ion-button 
                  fill="clear" 
                  size="small"
                  @click="editSong(song)"
                >
                  <ion-icon :icon="create" slot="start" />
                  Edit
                </ion-button>
                <ion-button 
                  fill="clear" 
                  size="small"
                  @click="deleteSong(song)"
                  color="danger"
                >
                  <ion-icon :icon="trash" />
                  Delete
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonCard, IonCardContent, IonButton, IonIcon, IonSpinner, IonRefresher, IonRefresherContent, IonFab, IonFabButton } from '@ionic/vue';
import { add, musicalNotes, play, pause, create, trash } from 'ionicons/icons';
import { ref, onMounted, computed } from 'vue';
import { useSongStore } from '@/store/songStore';
import { useAudioPlayer } from '@/composables/useAudioPlayer';
import { useModals } from '@/composables/useModals';
import NavigationHeader from '@/components/NavigationHeader.vue';

const songStore = useSongStore();
const audioPlayer = useAudioPlayer();
const { openSongUpload } = useModals();

const loading = ref(false);
const songs = computed(() => songStore.songs);

const isPlaying = (songId: string) => {
  return audioPlayer.currentSongId === songId && audioPlayer.isPlaying;
};

const loadSongs = async () => {
  loading.value = true;
  try {
    await songStore.fetchSongs();
  } finally {
    loading.value = false;
  }
};

const handleRefresh = async (event: CustomEvent) => {
  await loadSongs();
  event.detail.complete();
};

const playSong = async (song: any) => {
  if (song.url) {
    await audioPlayer.togglePlay({
      songId: song.id,
      audioUrl: song.url,
      clipStartTime: song.clip_start_time || 0,
      autoStopAfter: 30000
    });
  }
};

const editSong = (song: any) => {
  // Open edit modal
  console.log('Edit song:', song);
};

const deleteSong = async (song: any) => {
  // Show confirmation dialog
  const confirmed = confirm(`Are you sure you want to delete "${song.title}"?`);
  if (confirmed) {
    await songStore.softDeleteSong(song.id);
  }
};

const openUploadModal = () => {
  openSongUpload();
};

onMounted(() => {
  loadSongs();
});
</script>

<style scoped>
.songs-container {
  padding: 1rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.no-songs {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.no-songs ion-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.songs-list {
  display: grid;
  gap: 1rem;
}

.song-card {
  cursor: pointer;
}

.song-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.song-info h4 {
  margin-bottom: 0.5rem;
}

.song-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
  padding: 1rem 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
}

.song-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
</style>
```

## Admin Pages

### 1. Admin Flags Page
Convert the admin moderation page:

```vue
<!-- src/views/AdminFlagsPage.vue -->
<template>
  <ion-page>
    <NavigationHeader 
      title="Flag Review" 
      :show-back-button="true"
    />
    
    <ion-content>
      <div class="admin-container">
        <div v-if="loading" class="loading-container">
          <ion-spinner name="crescent" />
          <p>Loading flags...</p>
        </div>
        
        <div v-else-if="flags.length === 0" class="no-flags">
          <ion-icon :icon="checkmarkCircle" />
          <h3>All Clear</h3>
          <p>No flags to review at this time</p>
        </div>
        
        <div v-else class="flags-list">
          <ion-card 
            v-for="flag in flags" 
            :key="flag.id"
            class="flag-card"
          >
            <ion-card-content>
              <div class="flag-header">
                <div class="flag-info">
                  <h4>{{ flag.song_title }}</h4>
                  <p>Flagged by {{ flag.flagging_user }}</p>
                  <span class="flag-category">{{ flag.category }}</span>
                </div>
                <div class="flag-actions">
                  <ion-button 
                    @click="approveFlag(flag)"
                    color="success"
                    size="small"
                  >
                    <ion-icon :icon="checkmark" slot="start" />
                    Approve
                  </ion-button>
                  <ion-button 
                    @click="rejectFlag(flag)"
                    color="danger"
                    size="small"
                  >
                    <ion-icon :icon="close" slot="start" />
                    Reject
                  </ion-button>
                </div>
              </div>
              
              <div class="flag-details">
                <p><strong>Reason:</strong> {{ flag.reason || 'No reason provided' }}</p>
                <p><strong>Flagged:</strong> {{ formatDate(flag.created_at) }}</p>
              </div>
              
              <div class="song-preview">
                <h5>Song Preview</h5>
                <div class="preview-controls">
                  <ion-button 
                    @click="playSong(flag.song_url)"
                    fill="clear"
                    size="small"
                  >
                    <ion-icon :icon="play" slot="start" />
                    Play
                  </ion-button>
                  <span class="preview-info">
                    {{ flag.song_genre }} • {{ flag.song_user }}
                  </span>
                </div>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonCard, IonCardContent, IonButton, IonIcon, IonSpinner } from '@ionic/vue';
import { checkmarkCircle, checkmark, close, play } from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import { useSupabaseService } from '@/composables/useSupabaseService';
import { useAudioPlayer } from '@/composables/useAudioPlayer';
import NavigationHeader from '@/components/NavigationHeader.vue';

const { client: supabase } = useSupabaseService();
const audioPlayer = useAudioPlayer();

const loading = ref(false);
const flags = ref([]);

const loadFlags = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('song_flags')
      .select(`
        *,
        songs!inner(title, genre, url, user_id),
        profiles!inner(username)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (!error) {
      flags.value = data || [];
    }
  } catch (error) {
    console.error('Error loading flags:', error);
  } finally {
    loading.value = false;
  }
};

const approveFlag = async (flag: any) => {
  try {
    // Update flag status to approved
    const { error } = await supabase
      .from('song_flags')
      .update({ status: 'approved' })
      .eq('id', flag.id);
    
    if (!error) {
      // Remove song or mark as under review
      await supabase
        .from('songs')
        .update({ status: 'under_review' })
        .eq('id', flag.song_id);
      
      // Remove from local list
      flags.value = flags.value.filter(f => f.id !== flag.id);
    }
  } catch (error) {
    console.error('Error approving flag:', error);
  }
};

const rejectFlag = async (flag: any) => {
  try {
    // Update flag status to rejected
    const { error } = await supabase
      .from('song_flags')
      .update({ status: 'rejected' })
      .eq('id', flag.id);
    
    if (!error) {
      // Remove from local list
      flags.value = flags.value.filter(f => f.id !== flag.id);
    }
  } catch (error) {
    console.error('Error rejecting flag:', error);
  }
};

const playSong = async (songUrl: string) => {
  if (songUrl) {
    await audioPlayer.togglePlay({
      songId: 'preview',
      audioUrl: songUrl,
      autoStopAfter: 30000
    });
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

onMounted(() => {
  loadFlags();
});
</script>

<style scoped>
.admin-container {
  padding: 1rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.no-flags {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.no-flags ion-icon {
  font-size: 4rem;
  color: #28a745;
  margin-bottom: 1rem;
}

.flags-list {
  display: grid;
  gap: 1rem;
}

.flag-card {
  border-left: 4px solid #ffc107;
}

.flag-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.flag-info h4 {
  margin-bottom: 0.5rem;
}

.flag-category {
  display: inline-block;
  background: #ffc107;
  color: #000;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.flag-actions {
  display: flex;
  gap: 0.5rem;
}

.flag-details {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.song-preview {
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.song-preview h5 {
  margin-bottom: 0.5rem;
}

.preview-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.preview-info {
  font-size: 0.9rem;
  color: #666;
}
</style>
```

## Mobile-Specific Patterns

### 1. Pull-to-Refresh
Implement pull-to-refresh for lists:

```vue
<template>
  <ion-content>
    <ion-refresher slot="fixed" @ion-refresh="handleRefresh">
      <ion-refresher-content />
    </ion-refresher>
    
    <!-- Content -->
  </ion-content>
</template>

<script setup lang="ts">
const handleRefresh = async (event: CustomEvent) => {
  await loadData();
  event.detail.complete();
};
</script>
```

### 2. Infinite Scroll
Implement infinite scroll for pagination:

```vue
<template>
  <ion-content>
    <!-- Content -->
    
    <ion-infinite-scroll @ion-infinite="loadMore" threshold="100px">
      <ion-infinite-scroll-content />
    </ion-infinite-scroll>
  </ion-content>
</template>

<script setup lang="ts">
const loadMore = async (event: CustomEvent) => {
  await loadMoreData();
  event.target.complete();
};
</script>
```

### 3. Swipe Actions
Implement swipe actions for list items:

```vue
<template>
  <ion-item-sliding>
    <ion-item>
      <ion-label>{{ item.title }}</ion-label>
    </ion-item>
    
    <ion-item-options side="end">
      <ion-item-option @click="editItem(item)" color="primary">
        <ion-icon :icon="create" />
      </ion-item-option>
      <ion-item-option @click="deleteItem(item)" color="danger">
        <ion-icon :icon="trash" />
      </ion-item-option>
    </ion-item-options>
  </ion-item-sliding>
</template>
```

## Page Templates

### 1. Standard Page Template
Create a reusable page template:

```vue
<!-- src/components/PageTemplate.vue -->
<template>
  <ion-page>
    <NavigationHeader 
      :title="title"
      :show-back-button="showBackButton"
      :show-menu-button="showMenuButton"
    />
    
    <ion-content>
      <ion-refresher slot="fixed" @ion-refresh="handleRefresh">
        <ion-refresher-content />
      </ion-refresher>
      
      <div class="page-content">
        <slot />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  refresh: [];
}>();

const handleRefresh = (event: CustomEvent) => {
  emit('refresh', event);
};
</script>

<style scoped>
.page-content {
  padding: 1rem;
}
</style>
```

### 2. Modal Page Template
Create a modal page template:

```vue
<!-- src/components/ModalPageTemplate.vue -->
<template>
  <ion-modal :is-open="isOpen" @did-dismiss="closeModal">
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title>{{ title }}</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeModal">
              <ion-icon :icon="close" />
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      
      <ion-content>
        <div class="modal-content">
          <slot />
        </div>
      </ion-content>
    </ion-page>
  </ion-modal>
</template>

<script setup lang="ts">
import { IonModal, IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent } from '@ionic/vue';
import { close } from 'ionicons/icons';

interface Props {
  isOpen: boolean;
  title: string;
}

defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

const closeModal = () => {
  emit('close');
};
</script>

<style scoped>
.modal-content {
  padding: 1rem;
}
</style>
```

## Code Examples

### 1. Complete Page with All Features
Full example with all mobile features:

```vue
<!-- src/views/CompletePageExample.vue -->
<template>
  <ion-page>
    <NavigationHeader 
      title="Complete Example" 
      :show-back-button="true"
      :show-notifications="true"
    />
    
    <ion-content>
      <!-- Pull to Refresh -->
      <ion-refresher slot="fixed" @ion-refresh="handleRefresh">
        <ion-refresher-content />
      </ion-refresher>
      
      <!-- Search Bar -->
      <ion-searchbar 
        v-model="searchQuery"
        placeholder="Search..."
        @ion-input="handleSearch"
      />
      
      <!-- Content List -->
      <div class="content-list">
        <ion-item-sliding 
          v-for="item in filteredItems" 
          :key="item.id"
        >
          <ion-item @click="selectItem(item)">
            <ion-label>
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </ion-label>
          </ion-item>
          
          <ion-item-options side="end">
            <ion-item-option @click="editItem(item)" color="primary">
              <ion-icon :icon="create" />
            </ion-item-option>
            <ion-item-option @click="deleteItem(item)" color="danger">
              <ion-icon :icon="trash" />
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </div>
      
      <!-- Infinite Scroll -->
      <ion-infinite-scroll @ion-infinite="loadMore" threshold="100px">
        <ion-infinite-scroll-content />
      </ion-infinite-scroll>
      
      <!-- FAB -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="addItem">
          <ion-icon :icon="add" />
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonSearchbar, IonItemSliding, IonItem, IonLabel, IonItemOptions, IonItemOption, IonIcon, IonRefresher, IonRefresherContent, IonInfiniteScroll, IonInfiniteScrollContent, IonFab, IonFabButton } from '@ionic/vue';
import { create, trash, add } from 'ionicons/icons';
import { ref, computed, onMounted } from 'vue';
import NavigationHeader from '@/components/NavigationHeader.vue';

const searchQuery = ref('');
const items = ref([]);
const loading = ref(false);

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value;
  return items.value.filter(item => 
    item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const loadItems = async () => {
  loading.value = true;
  try {
    // Load items from API
  } finally {
    loading.value = false;
  }
};

const handleRefresh = async (event: CustomEvent) => {
  await loadItems();
  event.detail.complete();
};

const loadMore = async (event: CustomEvent) => {
  await loadMoreItems();
  event.target.complete();
};

const handleSearch = () => {
  // Search is handled by computed property
};

const selectItem = (item: any) => {
  // Navigate to item details
};

const editItem = (item: any) => {
  // Open edit modal
};

const deleteItem = (item: any) => {
  // Show confirmation and delete
};

const addItem = () => {
  // Open add modal
};

onMounted(() => {
  loadItems();
});
</script>

<style scoped>
.content-list {
  padding: 1rem;
}
</style>
```

---

This completes the pages conversion guide. The next step is to convert the state management stores to work with the mobile app.
