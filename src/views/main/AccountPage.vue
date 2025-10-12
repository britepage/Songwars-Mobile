<template>
  <ion-page>
    <ion-content class="pt-16 pb-20">
      <div class="min-h-screen px-4 pt-[5.5rem] pb-[8.5rem] bg-white">
        <!-- Profile Header -->
        <div class="text-center mb-8">
          <div class="relative inline-block">
            <img 
              :src="avatarPreview || form.avatar_url || '/default-avatar.png'" 
              :alt="form.display_name || 'User'"
              class="w-24 h-24 rounded-full border-4 border-[#ffd200] object-cover cursor-pointer"
              @click="selectAvatar"
            />
            <button 
              @click="selectAvatar"
              class="absolute -bottom-1 -right-1 w-8 h-8 bg-[#ffd200] rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900"
            >
              <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </button>
          </div>
          
          <h2 class="text-2xl font-bold theme-text-primary mt-4 mb-4">
            {{ form.display_name || 'User' }}
          </h2>
          
          <!-- Profile Button (if username exists) -->
          <button 
            v-if="profileStore.profile?.username"
            @click="router.push(`/user/${profileStore.profile.username}`)"
            class="bigbutton bigbutton-small"
          >
            Profile
          </button>
        </div>

        <!-- Profile Form -->
        <div class="space-y-6">
          <!-- Display Name -->
          <div>
            <label class="block text-sm font-medium theme-text-primary mb-2">
              Display Name
            </label>
            <input
              v-model="form.display_name"
              type="text"
              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#ffd200] focus:border-transparent theme-input"
              placeholder="Enter your display name"
            />
          </div>

          <!-- Username with Read-Only Logic -->
          <div>
            <label class="block text-sm font-medium theme-text-primary mb-2">
              Username
            </label>
            <input
              v-model="form.username"
              type="text"
              :disabled="isUsernameLocked"
              :class="[
                'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#ffd200] focus:border-transparent theme-input',
                isUsernameLocked ? 'opacity-60 cursor-not-allowed' : ''
              ]"
              placeholder="Choose a username"
            />
            <p v-if="isUsernameLocked" class="mt-1 text-xs theme-text-muted">
              Username is set and cannot be changed.
            </p>
          </div>

          <!-- Bio -->
          <div>
            <label class="block text-sm font-medium theme-text-primary mb-2">
              Bio
            </label>
            <textarea
              v-model="form.bio"
              rows="3"
              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#ffd200] focus:border-transparent theme-input resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          <!-- Privacy Toggle -->
          <div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
            <h3 class="text-lg font-semibold mb-6 flex items-center theme-text-primary">
              <svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              Privacy
            </h3>
            
            <div class="flex items-center justify-between">
              <span class="text-sm theme-text-primary">Private Profile</span>
              
              <div class="toggle-switch" @click="handlePrivacyToggle">
                <input 
                  type="checkbox" 
                  class="toggle-input" 
                  :checked="form.is_public"
                />
                <label class="toggle-label"></label>
              </div>
              
              <span class="text-sm theme-text-primary">Public Profile</span>
            </div>
            
            <p class="text-sm mt-2 theme-text-secondary">
              {{ form.is_public ? 'Your profile is visible to everyone' : 'Your profile is only visible to you' }}
            </p>
          </div>

          <!-- Theme Toggle -->
          <div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
            <h3 class="text-lg font-semibold mb-6 flex items-center theme-text-primary">
              <svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
              Theme
            </h3>
            
            <div class="flex items-center justify-between">
              <span class="text-sm theme-text-primary">Light Mode</span>
              
              <div class="toggle-switch" @click="toggleTheme">
                <input 
                  type="checkbox" 
                  class="toggle-input" 
                  :checked="isDarkMode"
                />
                <label class="toggle-label"></label>
              </div>
              
              <span class="text-sm theme-text-primary">Dark Mode</span>
            </div>
            
          </div>

          <!-- Audio Settings -->
          <div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
            <h3 class="text-lg font-semibold mb-6 flex items-center theme-text-primary">
              <svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
              </svg>
              Audio Settings
            </h3>
            
            <div class="space-y-4">
              <!-- Roulette Sound -->
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium theme-text-primary">Roulette Sound</p>
                  <p class="text-xs theme-text-secondary">Sound when spinning the roulette</p>
                </div>
                
                <div class="toggle-switch" @click="toggleRouletteSound">
                  <input 
                    type="checkbox" 
                    class="toggle-input" 
                    :checked="form.roulette_sound_enabled"
                  />
                  <label class="toggle-label"></label>
                </div>
              </div>
              
              <!-- Confetti Sound -->
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium theme-text-primary">Confetti Sound</p>
                  <p class="text-xs theme-text-secondary">Play sound when you vote in battles</p>
                </div>
                
                <div class="toggle-switch" @click="toggleConfettiSound">
                  <input 
                    type="checkbox" 
                    class="toggle-input" 
                    :checked="form.confetti_sound_enabled"
                  />
                  <label class="toggle-label"></label>
                </div>
              </div>
            </div>
          </div>

          <!-- Account Type Toggle (Judge ↔ Artist) -->
          <div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
            <h3 class="text-lg font-semibold mb-6 flex items-center theme-text-primary">
              <svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              Account Type
            </h3>
            
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm theme-text-primary">Judge</span>
              
              <div class="toggle-switch" @click="handleAccountTypeToggle">
                <input 
                  type="checkbox" 
                  class="toggle-input" 
                  :checked="form.role === 'artist'"
                />
                <label class="toggle-label"></label>
              </div>
              
              <span class="text-sm theme-text-primary">Artist</span>
            </div>
            
            <p class="text-sm theme-text-secondary mb-4">
              Switch to Artist mode to unlock song upload features
            </p>
            
            <!-- Artist Mode Active Message -->
            <div v-if="form.role === 'artist'" class="mt-3 p-3 bg-[#ffd200]/20 border border-[#ffd200]/30 rounded-lg">
              <p class="text-sm text-[#ffd200] font-medium">
                🎵 Artist Mode Active! You can now upload and manage your songs.
              </p>
            </div>
          </div>

          <!-- Social Links (Artists Only) -->
          <div v-if="form.role === 'artist'" class="rounded-2xl p-6 border theme-bg-card theme-border-card">
            <h3 class="text-lg font-semibold mb-6 flex items-center theme-text-primary">
              <svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
              Social Links
            </h3>
            
            <!-- Intro Text -->
            <p class="text-sm mb-6 theme-text-secondary">
              Add up to 3 social media or streaming platform links to showcase your music and connect with fans.
            </p>
            
            <!-- Existing Links Display -->
            <div v-if="form.social_links.length > 0" class="space-y-4 mb-4">
              <div v-for="(link, index) in form.social_links" :key="index" class="flex items-center space-x-3 p-4 rounded-lg border theme-bg-subcard theme-border-subcard">
                <!-- Platform Icon (40px × 40px circular) -->
                <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                     :style="{ 
                       backgroundColor: getPlatformColor(link.platform) + '20',
                       width: '40px',
                       height: '40px'
                     }">
                  <div class="w-6 h-6" 
                       :style="{ color: getPlatformColor(link.platform) }"
                       v-html="getPlatformIcon(link.platform)"></div>
                </div>
                
                <!-- Link Info -->
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium theme-text-primary">{{ link.label || link.platform }}</div>
                  <div class="text-sm truncate theme-text-secondary">{{ link.url }}</div>
                </div>
                
                <!-- Remove Button -->
                <button
                  @click="removeSocialLink(index)"
                  class="flex-shrink-0 p-2 text-red-500 hover:text-red-700 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Add Link Interface (Single URL input + Add button) -->
            <div v-if="form.social_links.length < 3" class="mt-6">
              <div class="flex space-x-3">
                <div class="flex-1">
                  <input
                    v-model="newLinkUrl"
                    type="url"
                    placeholder="https://open.spotify.com/artist/..."
                    class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#ffd200] focus:border-transparent theme-input"
                    @keyup.enter="addSocialLink"
                  />
                </div>
                <button
                  @click="addSocialLink"
                  :disabled="!newLinkUrl.trim()"
                  class="px-6 py-3 bg-[#ffd200] text-black rounded-lg font-medium hover:bg-[#ffd200]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
              <div class="mt-3 text-xs theme-text-muted">
                Supported platforms: Spotify, Apple Music, YouTube, Instagram, Twitter, TikTok, SoundCloud, Bandcamp, Facebook, LinkedIn, Twitch, Patreon, and more
              </div>
            </div>
            
            <!-- Max Links Reached Message (if >= 3 links) -->
            <div v-else class="mt-6 p-4 rounded-lg border theme-bg-subcard theme-border-subcard">
              <p class="text-sm text-center theme-text-secondary">
                You've reached the maximum of 3 social links.
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-4">
            <!-- Save Profile -->
            <button 
              @click="saveProfile" 
              :disabled="isSaving"
              class="bigbutton bigbutton-medium w-full"
            >
              {{ isSaving ? 'Saving...' : 'Save Profile' }}
            </button>

            <!-- Logout -->
            <button 
              @click="handleLogout"
              class="w-full px-4 py-3 theme-text-primary border theme-border-input rounded-lg hover:theme-bg-secondary transition-colors"
            >
              Logout
            </button>

            <!-- Manage Flags (Admin Only) -->
            <div v-if="isAdmin" class="mt-4">
              <button 
                @click="router.push('/admin/flags')"
                class="w-full px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                Manage Flags
              </button>
            </div>

            <!-- Delete Account -->
            <button 
              @click="showDeleteModal = true"
              class="w-full px-4 py-2 text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Account Modal -->
      <AccountDeletionModal
        :show-modal="showDeleteModal"
        @close="showDeleteModal = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent } from '@ionic/vue'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Preferences } from '@capacitor/preferences'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'
import { useThemeStore } from '@/stores/themeStore'
import { supabaseService } from '@/services/supabase.service'
import AccountDeletionModal from '@/components/utility/AccountDeletionModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const themeStore = useThemeStore()

// Reactive state
const isSaving = ref(false)
const showDeleteModal = ref(false)
const isAdmin = ref(false)
const newLinkUrl = ref('')

// Avatar upload state
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string>('')

// Form state
const form = ref({
  username: '',
  display_name: '',
  bio: '',
  avatar_url: '',
  role: 'user' as 'user' | 'artist',
  is_public: true,
  roulette_sound_enabled: true,
  confetti_sound_enabled: true,
  social_links: [] as Array<{ platform: string; url: string; label: string }>
})

// Computed properties
const user = computed(() => authStore.user)
const isDarkMode = computed(() => themeStore.theme === 'dark')

// Username read-only logic
const isUsernameLocked = computed(() => {
  const existing = profileStore.profile?.username
  return !!existing && !!form.value.username && form.value.username === existing
})

// Admin check function
const checkAdmin = async () => {
  if (!user.value) {
    isAdmin.value = false
    return
  }
  
  try {
    // Check if user exists in admin_users table
    // Note: admin_users table exists in production but not in types yet
    const { data: adminData } = await supabaseService.getClient()
      .from('admin_users' as any)
      .select('id')
      .eq('id', user.value.id)
      .maybeSingle()
    isAdmin.value = !!adminData
  } catch (error) {
    console.error('Error checking admin status:', error)
    isAdmin.value = false
  }
}

// Toggle handlers (update form state only, save on "Save Profile" button)
const handlePrivacyToggle = () => {
  form.value.is_public = !form.value.is_public
}

const toggleTheme = () => {
  // Theme is special - saves immediately to localStorage (not database)
  themeStore.toggleTheme()
}

const toggleRouletteSound = () => {
  form.value.roulette_sound_enabled = !form.value.roulette_sound_enabled
}

const toggleConfettiSound = () => {
  form.value.confetti_sound_enabled = !form.value.confetti_sound_enabled
}

// Account type toggle
const handleAccountTypeToggle = () => {
  const newRole = form.value.role === 'artist' ? 'user' : 'artist'
  form.value.role = newRole
}

// Social links
const detectPlatform = (url: string): { platform: string; label: string } => {
  const urlLower = url.toLowerCase()
  
  if (urlLower.includes('spotify.com')) return { platform: 'spotify', label: 'Spotify' }
  if (urlLower.includes('instagram.com')) return { platform: 'instagram', label: 'Instagram' }
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return { platform: 'twitter', label: 'Twitter' }
  if (urlLower.includes('facebook.com')) return { platform: 'facebook', label: 'Facebook' }
  if (urlLower.includes('tiktok.com')) return { platform: 'tiktok', label: 'TikTok' }
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return { platform: 'youtube', label: 'YouTube' }
  if (urlLower.includes('soundcloud.com')) return { platform: 'soundcloud', label: 'SoundCloud' }
  if (urlLower.includes('apple.com') || urlLower.includes('music.apple')) return { platform: 'apple_music', label: 'Apple Music' }
  if (urlLower.includes('bandcamp.com')) return { platform: 'bandcamp', label: 'Bandcamp' }
  if (urlLower.includes('linkedin.com')) return { platform: 'linkedin', label: 'LinkedIn' }
  if (urlLower.includes('twitch.tv')) return { platform: 'twitch', label: 'Twitch' }
  if (urlLower.includes('patreon.com')) return { platform: 'patreon', label: 'Patreon' }
  
  return { platform: 'website', label: 'Website' }
}

// Platform icon and color helpers
const getPlatformIcon = (platform: string): string => {
  const platformConfigs: Record<string, string> = {
    spotify: '<img src="https://cdn.simpleicons.org/spotify/1DB954" alt="Spotify" width="24" height="24" />',
    apple_music: '<img src="https://cdn.simpleicons.org/applemusic/FA243C" alt="Apple Music" width="24" height="24" />',
    youtube: '<img src="https://cdn.simpleicons.org/youtube/FF0000" alt="YouTube" width="24" height="24" />',
    instagram: '<img src="https://cdn.simpleicons.org/instagram/E4405F" alt="Instagram" width="24" height="24" />',
    twitter: '<img src="https://cdn.simpleicons.org/x/000000" alt="X" width="24" height="24" />',
    tiktok: '<img src="https://cdn.simpleicons.org/tiktok/000000" alt="TikTok" width="24" height="24" />',
    soundcloud: '<img src="https://cdn.simpleicons.org/soundcloud/FF3300" alt="SoundCloud" width="24" height="24" />',
    bandcamp: '<img src="https://cdn.simpleicons.org/bandcamp/629aa0" alt="Bandcamp" width="24" height="24" />',
    facebook: '<img src="https://cdn.simpleicons.org/facebook/1877F2" alt="Facebook" width="24" height="24" />',
    linkedin: '<img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg" alt="LinkedIn" width="24" height="24" />',
    twitch: '<img src="https://cdn.simpleicons.org/twitch/9146FF" alt="Twitch" width="24" height="24" />',
    patreon: '<img src="https://cdn.simpleicons.org/patreon/FF424D" alt="Patreon" width="24" height="24" />',
    website: '<img src="https://api.iconify.design/mdi:globe.svg" alt="Website" width="24" height="24" />'
  }
  return platformConfigs[platform] || '🔗'
}

const getPlatformColor = (platform: string): string => {
  const platformColors: Record<string, string> = {
    spotify: '#1DB954',
    apple_music: '#FA243C',
    youtube: '#FF0000',
    instagram: '#E4405F',
    twitter: '#000000',
    tiktok: '#000000',
    soundcloud: '#FF3300',
    bandcamp: '#629aa0',
    facebook: '#1877F2',
    linkedin: '#0A66C2',
    twitch: '#9146FF',
    patreon: '#FF424D',
    website: '#6B7280'
  }
  return platformColors[platform] || '#6B7280'
}

const addSocialLink = () => {
  if (!newLinkUrl.value.trim()) return
  
  // Auto-detect platform from URL
  const { platform, label } = detectPlatform(newLinkUrl.value)
  
  // Add to form state only (saves on "Save Profile" button)
  form.value.social_links.push({ 
    platform, 
    url: newLinkUrl.value.trim(), 
    label 
  })
  
  // Clear input
  newLinkUrl.value = ''
}

const removeSocialLink = (index: number) => {
  form.value.social_links.splice(index, 1)
}

// Avatar selection (store file, show preview, don't upload yet)
const selectAvatar = async () => {
  try {
    // Take/select photo with data URL result type
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      quality: 90,
      width: 500,
      height: 500,
      allowEditing: true,
      source: CameraSource.Photos
    })
    
    if (!photo.dataUrl) {
      throw new Error('No photo captured')
    }
    
    // Convert data URL to blob
    const response = await fetch(photo.dataUrl)
    const blob = await response.blob()
    
    // Detect file extension from blob type
    const extension = blob.type.split('/')[1] || 'jpg'
    const file = new File([blob], `avatar.${extension}`, { type: blob.type })
    
    // Store file for later upload
    avatarFile.value = file
    
    // Show preview immediately (temporary blob URL)
    avatarPreview.value = photo.dataUrl
    
    console.log('Avatar selected, will upload on save')
  } catch (error) {
    console.error('Error selecting avatar:', error)
  }
}

// Upload avatar to Supabase storage with cleanup
const uploadAvatar = async (): Promise<string | null> => {
  if (!avatarFile.value || !user.value?.id) {
    return null
  }
  
  try {
    const userId = user.value.id
    
    // 1. FIRST: Delete old avatar if it exists
    if (form.value.avatar_url && form.value.avatar_url.includes('/avatars/')) {
      const oldFileName = form.value.avatar_url.split('/avatars/')[1]
      if (oldFileName) {
        console.log('🗑️ Deleting old avatar:', oldFileName)
        const { error: deleteError } = await supabaseService.getClient().storage
          .from('avatars')
          .remove([oldFileName])
        
        if (deleteError) {
          console.warn('Failed to delete old avatar:', deleteError)
          // Don't fail the upload if deletion fails
        } else {
          console.log('✅ Old avatar deleted successfully')
        }
      }
    }
    
    // 2. THEN: Upload new avatar
    const extension = avatarFile.value.name.split('.').pop() || 'jpg'
    const fileName = `${userId}-${Date.now()}.${extension}`
    
    console.log('📤 Uploading new avatar:', fileName)
    
    const { error: uploadError } = await supabaseService.getClient().storage
      .from('avatars')
      .upload(fileName, avatarFile.value, {
        cacheControl: '3600',
        upsert: true,
      })
    
    if (uploadError) {
      console.error('❌ Error uploading avatar:', uploadError)
      throw uploadError
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabaseService.getClient().storage
      .from('avatars')
      .getPublicUrl(fileName)
    
    console.log('✅ Avatar uploaded successfully:', publicUrl)
    return publicUrl
  } catch (error) {
    console.error('❌ Error in uploadAvatar:', error)
    return null
  }
}

// Save profile
const saveProfile = async () => {
  try {
    isSaving.value = true
    
    // Upload avatar if new file selected
    if (avatarFile.value) {
      const avatarUrl = await uploadAvatar()
      if (avatarUrl) {
        form.value.avatar_url = avatarUrl
      }
    }
    
    // Update profile in database (includes ALL form fields)
    const { success, error } = await profileStore.updateProfile({
      display_name: form.value.display_name,
      username: form.value.username,
      bio: form.value.bio,
      avatar_url: form.value.avatar_url,
      role: form.value.role,
      social_links: form.value.social_links,
      is_public: form.value.is_public,
      roulette_sound_enabled: form.value.roulette_sound_enabled,
      confetti_sound_enabled: form.value.confetti_sound_enabled
    })
    
    if (success) {
      console.log('Profile saved successfully')
      // Clear avatar upload state
      avatarFile.value = null
      avatarPreview.value = ''
      // Redirect to dashboard on success
      router.push('/tabs/dashboard')
    } else {
      console.error('Failed to save profile:', error)
    }
  } catch (error) {
    console.error('Error saving profile:', error)
  } finally {
    isSaving.value = false
  }
}

// Logout
const handleLogout = async () => {
  try {
    await authStore.signOut()
    router.push('/sign-in')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Delete account - now handled by AccountDeletionModal component

// Load preferences on mount
const loadPreferences = async () => {
  try {
    const { value: theme } = await Preferences.get({ key: 'songwars-theme' })
    if (theme) {
      themeStore.setTheme(theme as 'light' | 'dark')
    }
    
    const { value: rouletteSound } = await Preferences.get({ key: 'songwars-roulette-sound' })
    if (rouletteSound !== null) {
      form.value.roulette_sound_enabled = rouletteSound === 'true'
    }
    
    const { value: confettiSound } = await Preferences.get({ key: 'songwars-confetti-sound' })
    if (confettiSound !== null) {
      form.value.confetti_sound_enabled = confettiSound === 'true'
    }
  } catch (error) {
    console.error('Error loading preferences:', error)
  }
}

// Initialize on mount
onMounted(async () => {
  if (user.value) {
    // Fetch profile
    const { data: profile } = await profileStore.fetchProfile()
    if (profile) {
      form.value = { 
        username: profile.username || '',
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        role: (profile.role as 'user' | 'artist') || 'user',
        is_public: profile.is_public ?? true,
        roulette_sound_enabled: profile.roulette_sound_enabled ?? true,
        confetti_sound_enabled: profile.confetti_sound_enabled ?? true,
        social_links: Array.isArray(profile.social_links) ? 
          profile.social_links.map((link: any) => ({
            platform: link.platform || '',
            url: link.url || '',
            label: link.label || ''
          })) : []
      }
    }
    
    // Check admin status
    await checkAdmin()
    
    // Load preferences
    await loadPreferences()
  }
})

// Watch for user changes
watch(user, async (newUser) => {
  if (newUser) {
    await checkAdmin()
  } else {
    isAdmin.value = false
  }
})
</script>

<style scoped>
/* Toggle Switch Styling */
.toggle-switch {
  position: relative;
  width: 40px;
  height: 24px;
  cursor: pointer;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #6b7280;
  transition: .4s;
  border-radius: 24px;
}

.toggle-label:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.toggle-input:checked + .toggle-label {
  background-color: #ffd200;
}

.toggle-input:checked + .toggle-label:before {
  transform: translateX(16px);
}

.toggle-input:focus + .toggle-label {
  box-shadow: 0 0 1px #ffd200;
}

/* Dark mode adjustments */
.dark .toggle-label {
  background-color: #4b5563;
}

.dark .toggle-input:checked + .toggle-label {
  background-color: #ffd200;
}

/* Let theme classes handle input styling naturally */
</style>