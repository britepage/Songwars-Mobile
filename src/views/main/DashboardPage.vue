<template>
  <ion-page>
    <ion-content :fullscreen="true" class="pt-16">
      <!-- Battle Section -->
      <div v-if="activeSection === 'battle'" class="battle-section">
        
        <!-- Combined Profile Header + Battle Section -->
        <div 
          v-if="!battleStarted" 
          class="p-4 md:p-6 theme-bg-primary pt-[6em] start-battle-screen"
          :class="{ 'screen-fade-out': startScreenFadingOut }"
        >
          <div class="max-w-6xl mx-auto flex flex-col items-center">
            <!-- Profile Picture - Centered and Clickable -->
            <div class="relative cursor-pointer group mb-[12px]" @click="goToProfile">
              <div class="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-[#ffd200] shadow-lg transition-transform duration-200 group-hover:scale-105">
                <img
                  v-if="profileStore.profile?.avatar_url"
                  :src="profileStore.profile.avatar_url"
                  alt="Profile"
                  class="w-full h-full object-cover"
                />
                <svg v-else class="w-full h-full text-gray-400 p-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <!-- Online indicator -->
              <div class="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-3 border-white"></div>
              
              <!-- Edit overlay hint -->
              <div class="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div class="bg-white/90 rounded-full p-2">
                  <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <!-- User Info - Under Profile Picture -->
            <div class="text-center flex flex-col items-center space-y-2">
              <h3 class="text-xl md:text-2xl font-semibold theme-text-primary">
                {{ profileStore.profile?.display_name || 'User' }}
              </h3>
              <!-- Replace handle with dynamic action button -->
              <button
                v-if="profileStore.profile?.username"
                @click="router.push(`/user/${profileStore.profile.username}`)"
                class="bigbutton bigbutton-small"
              >
                Profile
              </button>
              <button
                v-else
                @click="router.push('/account')"
                class="bigbutton bigbutton-small"
              >
                Finish Profile
              </button>
            </div>
            
            <!-- Jump into Battle Section (moved here) -->
            <div class="mt-8 w-full max-w-md">
              <h2 class="text-center text-2xl font-bold theme-text-primary mb-4">
                Jump into Battle
              </h2>
              <!-- Genre Selection Listbox -->
              <Listbox v-model="selectedGenre">
                <div ref="genreSelectRef" class="relative w-full max-w-md mx-auto">
                  <ListboxButton 
                    as="div" 
                    role="button" 
                    tabindex="0"
                    @click="updateGenreOptionsPosition"
                    class="bg-white border-2 border-black rounded shadow-[3px_3px_0_#000] px-4 py-3 text-black text-base font-medium focus:outline-none w-full text-center flex items-center justify-center cursor-pointer hover:shadow-[4px_4px_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-200 max-w-[280px] m-auto"
                  >
                    <span>{{ selectedGenre || 'Select Genre' }}</span>
                    <svg class="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clip-rule="evenodd"/>
                    </svg>
                  </ListboxButton>
                  
                  <Teleport to="body">
                    <ListboxOptions
                      :style="genreOptionsStyle"
                      class="absolute z-50 mt-1 max-h-60 overflow-auto rounded-md border-2 border-black bg-white py-1 text-black shadow-lg outline-none"
                    >
                      <ListboxOption
                        v-for="genre in genres"
                        :key="typeof genre === 'string' ? genre : genre.genre"
                        :value="typeof genre === 'string' ? genre : genre.genre"
                        as="template"
                        v-slot="{ active, selected }"
                      >
                        <li
                          :class="[
                            'cursor-pointer select-none relative py-2 px-4',
                            active && 'bg-gray-100',
                            selected && 'font-semibold bg-[#ffd200]/20'
                          ]"
                        >
                          {{ typeof genre === 'string' ? genre : genre.genre }}
                        </li>
                      </ListboxOption>
                    </ListboxOptions>
                  </Teleport>
                </div>
              </Listbox>

              <!-- Start Battle Button -->
              <ion-button
                expand="block"
                @click="startBattle"
                :disabled="loading || !selectedGenre || loadingGenres || genres.length === 0"
                class="start-battle-btn mt-6 max-w-[280px] m-auto"
              >
                <ion-icon :icon="dice" slot="start" />
                {{ loading ? 'Finding Songs...' : 'Start Battle' }}
              </ion-button>
            </div>
          </div>
        </div>

        <!-- Phase 2: Roulette Wheel -->
        <div 
          v-if="battleStarted && battlePhase === 'roulette'" 
          class="roulette-container"
          :class="{ 
            'wheel-fade-in': wheelFadingIn,
            'roulette-fade-out': rouletteFadingOut 
          }"
        >
          <div class="wheel-wrapper">
            <!-- Arrow pointer above the wheel -->
            <div class="arrow-pointer">
              <img 
                :src="arrowIcon"
                alt="Arrow Pointer"
                class="arrow-image"
              />
            </div>
            
            <img 
              :src="wheelImage"
              alt="Roulette Wheel"
              class="wheel-image"
              :class="{ 'wheel-spinning': wheelAnimating }"
              :style="{ transform: `rotate(${wheelRotation}deg)` }"
            />
          </div>
        </div>

        <!-- Phase 3: Battle Interface -->
        <div 
          v-if="battlePhase === 'recordPlayers'" 
          class="battle-interface"
          :class="{ 'battle-fade-in': tapeSectionFadingIn }"
        >
          <div class="battle-songs pb-[11em] pt-[8em]">
            <!-- Song A -->
            <div class="song-section">
              <h3 class="song-label">
                Song A
                <svg 
                  @click.stop="tagStore.toggle(songs[0]?.id)"
                  class="inline-block w-4 h-4 cursor-pointer transition-colors"
                  :class="tagStore.isTagged(songs[0]?.id) ? 'text-[#ffd200]' : 'text-gray-400'"
                  :fill="tagStore.isTagged(songs[0]?.id) ? 'currentColor' : 'none'"
                  :stroke="tagStore.isTagged(songs[0]?.id) ? 'none' : 'currentColor'"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  aria-label="Tag Song A"
                >
                  <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
              </h3>
              
              <TapePlayer 
                :song="songs[0]"
                :is-playing="audioA.isPlaying.value"
                :progress="audioA.progress.value"
                :current-time="audioA.currentTime.value"
                :duration="30"
                :show-progress="selectedPlayOptionA === 'full'"
                :show-duration-options="true"
                :side="'A'"
                :selected-duration="selectedPlayOptionA === '15s' ? 15 : selectedPlayOptionA === '30s' ? 30 : selectedPlayOptionA === 'full' ? 'full' : null"
                @play="playSongA"
                @seek="(percentage) => seekSong(0, percentage)"
                @duration-select="(duration) => {
                  if (duration === 15) playSongClip(0, 15)
                  else if (duration === 30) playSongClip(0, 30)
                  else if (duration === 'full') playFullSong(0)
                }"
              />
              
              <!-- Status Indicator -->
              <div class="status-indicator">
                <span v-if="songAQualified" class="qualified">
                  ● Song A Ready
                </span>
              </div>
              
              <!-- Vote Button for Song A -->
              <div v-if="canProceedToVoting" class="vote-button-container">
                <ion-button 
                  @click="voteForSong('A')"
                  :disabled="isVoting || voteSubmitted"
                  class="bigbutton bigbutton-medium vote-btn-a !p-0"
                >
                  Vote for Song A
                </ion-button>
              </div>
            </div>
            
            <!-- VS Separator -->
            <div class="vs-divider">
              <h2 class="vs-text">VS</h2>
            </div>
            
            <!-- Song B -->
            <div class="song-section">
              <h3 class="song-label">
                Song B
                <svg 
                  @click.stop="tagStore.toggle(songs[1]?.id)"
                  class="inline-block w-4 h-4 cursor-pointer transition-colors"
                  :class="tagStore.isTagged(songs[1]?.id) ? 'text-[#ffd200]' : 'text-gray-400'"
                  :fill="tagStore.isTagged(songs[1]?.id) ? 'currentColor' : 'none'"
                  :stroke="tagStore.isTagged(songs[1]?.id) ? 'none' : 'currentColor'"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                  aria-label="Tag Song B"
                >
                  <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
              </h3>
              
              <TapePlayer 
                :song="songs[1]"
                :is-playing="audioB.isPlaying.value"
                :progress="audioB.progress.value"
                :current-time="audioB.currentTime.value"
                :duration="30"
                :show-progress="selectedPlayOptionB === 'full'"
                :show-duration-options="true"
                :side="'B'"
                :selected-duration="selectedPlayOptionB === '15s' ? 15 : selectedPlayOptionB === '30s' ? 30 : selectedPlayOptionB === 'full' ? 'full' : null"
                @play="playSongB"
                @seek="(percentage) => seekSong(1, percentage)"
                @duration-select="(duration) => {
                  if (duration === 15) playSongClip(1, 15)
                  else if (duration === 30) playSongClip(1, 30)
                  else if (duration === 'full') playFullSong(1)
                }"
              />
              
              <!-- Status Indicator -->
              <div class="status-indicator">
                <span v-if="songBQualified" class="qualified">
                  ● Song B Ready
                </span>
              </div>
              
              <!-- Vote Button for Song B -->
              <div v-if="canProceedToVoting" class="vote-button-container">
                <ion-button 
                  @click="voteForSong('B')"
                  :disabled="isVoting || voteSubmitted"
                  class="bigbutton bigbutton-medium vote-btn-b !p-0"
                >
                  Vote for Song B
                </ion-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Phase 4: Battle Complete -->
        <div v-if="battlePhase === 'complete'" class="battle-complete">
          <div class="complete-message">
            <h1 class="complete-title animate-battleComplete">
              Battle Complete!
            </h1>
            <p class="complete-subtitle animate-battleCompleteSubtitle">
              Vote recorded successfully!
            </p>
          </div>
        </div>
      </div>

      <!-- Upload Section -->
      <div v-if="activeSection === 'upload'" class="h-full overflow-y-auto px-4 md:px-8 pt-24 pb-36 theme-bg-primary">
        <div class="w-full max-w-6xl mx-auto">
          <!-- Upload Header -->
          <div class="text-center md:text-left mb-8">
            <div class="flex flex-col md:flex-row items-center justify-center md:justify-start space-y-3 md:space-y-0 md:space-x-3 mb-4">
              <div class="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-black font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
                </svg>
              </div>
              <div class="text-center md:text-left">
                <h2 class="text-2xl md:text-3xl font-bold theme-text-primary">Upload Your Song</h2>
                <p class="theme-text-secondary">Share your music with the SongWars community</p>
              </div>
            </div>
          </div>

          <!-- Song Uploader Component -->
          <div>
            <SongUploader @upload-complete="handleUploadComplete" />
          </div>
        </div>
      </div>
    </ion-content>
  

  <!-- Error Screen -->
  <div v-if="battlePhase === 'error'" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white dark:bg-gray-900 rounded-xl max-w-sm w-full mx-4">
      <div class="p-6 text-center">
        <div class="error-icon text-6xl mb-4">⚠️</div>
        <h2 class="text-xl font-bold theme-text-primary mb-4">Battle Failed</h2>
        <p class="theme-text-secondary mb-6">
          {{ battleStatus || 'Unable to start battle. Please try again.' }}
        </p>
        
        <div class="flex flex-col space-y-3">
          <button 
            @click="retryBattle" 
            class="w-full px-4 py-3 bg-[#ffd200] text-black rounded-lg hover:bg-[#e6c200] font-medium"
          >
            🔄 Try Again
          </button>
          <button 
            @click="resetBattle" 
            class="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 theme-text-primary rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium"
          >
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  </div>
</ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, 
  IonContent, 
  IonButton, 
  IonIcon
} from '@ionic/vue'
import { dice } from 'ionicons/icons'
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBattleStore } from '@/stores/songComparisonStore'
import { useSongStore } from '@/stores/songStore'
import { useProfileStore } from '@/stores/profileStore'
import { useAuthStore } from '@/stores/authStore'


import { useUploadStore } from '@/stores/uploadStore'
import TapePlayer from '@/components/core/TapePlayer.vue'
import SongUploader from '@/components/dashboard/SongUploader.vue'
import { useHowlerPlayer } from '@/composables/useHowlerPlayer'
import { useBattleAudio } from '@/composables/useBattleAudio'
import confetti from 'canvas-confetti'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
import { supabaseService } from '@/services/supabase.service'
import { MASTER_GENRES } from '@/utils/genres'
import { useTagStore } from '@/stores/tagStore'
import { useFlagStore } from '@/stores/flagStore'

// Import battle assets
import wheelImage from '@/assets/images/wheel.png'
import arrowIcon from '@/assets/images/arrow.svg'

const router = useRouter()
const route = useRoute()
const battleStore = useBattleStore()
const songStore = useSongStore()
const profileStore = useProfileStore()
const authStore = useAuthStore()
const uploadStore = useUploadStore()
const tagStore = useTagStore()
const flagStore = useFlagStore()

// Battle audio instances
const audioA = useHowlerPlayer()
const audioB = useHowlerPlayer()
const battleAudio = useBattleAudio()

// Battle flow state
const battleStarted = ref(false)
const battlePhase = ref<'loading' | 'roulette' | 'recordPlayers' | 'complete' | 'error'>('loading')
const selectedGenre = ref('')
const genres = ref<(string | { genre: string })[]>([])
const songs = ref<any[]>([])
const loading = ref(false)
const loadingGenres = ref(false)
const battleStatus = ref('')

// Asset preloading state
const assetsPreloaded = ref(false)
const preloadedAssets = ref<{
  rouletteSound: ArrayBuffer | null
}>({
  rouletteSound: null
})

// User data state now managed by Pinia stores (tagStore/flagStore)
const audioAError = ref(false)
const audioBError = ref(false)

// Headless UI Listbox positioning
const genreSelectRef = ref<HTMLElement | null>(null)
const genreOptionsRect = ref<DOMRect | null>(null)

const updateGenreOptionsPosition = () => {
  if (genreSelectRef.value) {
    genreOptionsRect.value = genreSelectRef.value.getBoundingClientRect()
  }
}

const genreOptionsStyle = computed(() => {
  if (!genreOptionsRect.value) return {}
  return {
    position: 'fixed',
    top: `${genreOptionsRect.value.bottom + 4}px`,
    left: `${genreOptionsRect.value.left}px`,
    width: `${genreOptionsRect.value.width}px`
  }
})

// Animation state
const wheelRotation = ref(0)
const wheelAnimating = ref(false)
const rouletteFadingOut = ref(false)
const tapeSectionFadingIn = ref(false)

// Add new fade states
const startScreenFadingOut = ref(false)
const wheelFadingIn = ref(false)

// Animation cleanup - handles both fade states atomically
const cleanupAnimation = () => {
  tapeSectionFadingIn.value = false
}

// Qualification tracking
const songAQualified = ref(false)
const songBQualified = ref(false)
const songAListeningTime = ref(0)
const songBListeningTime = ref(0)

// Watcher references for cleanup
let songAWatcher: (() => void) | null = null
let songBWatcher: (() => void) | null = null

// Playback options
const selectedPlayOptionA = ref<'15s' | '30s' | 'full' | null>(null)
const selectedPlayOptionB = ref<'15s' | '30s' | 'full' | null>(null)

// Voting
const isVoting = ref(false)
const voteSubmitted = ref(false)

// Legacy state (keeping for compatibility)
const isLoading = ref(false)
const hasVoted = ref(false)
const playingSongId = ref<string | null>(null)
const activeSection = ref('battle')

const currentBattle = computed(() => battleStore.currentBattle)

const canProceedToVoting = computed(() => 
  songAQualified.value && songBQualified.value
)

// Watch for URL query parameter changes
watch(() => route.query.section, (newSection) => {
  if (newSection === 'upload') {
    activeSection.value = 'upload'
  } else {
    activeSection.value = 'battle'
  }
}, { immediate: true })

// Battle methods
const startBattle = async () => {
  if (loading.value || !selectedGenre.value) return
  
  loading.value = true
  
  // STEP 1: Fade out start screen
  startScreenFadingOut.value = true
  
  // Wait for start screen to fade out (animation completes)
  await new Promise(resolve => setTimeout(resolve, 400))
  
  try {
    // STEP 2: Wait for assets if not ready yet
    if (!assetsPreloaded.value) {
      console.log('⏳ Waiting for assets to preload...')
      battleStatus.value = 'Loading assets...'
      
      // Wait up to 10 seconds for assets to load
      const startWait = Date.now()
      while (!assetsPreloaded.value && Date.now() - startWait < 10000) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      if (!assetsPreloaded.value) {
        console.warn('⚠️ Assets not preloaded, proceeding anyway')
        assetsPreloaded.value = true
      }
    }
    
    battleStatus.value = 'Finding songs...'
    
    // STEP 2: Fetch random songs (Network calls 1 & 2)
    console.log('About to call fetchRandomComparisonSongs...')
    await battleStore.fetchRandomComparisonSongs(selectedGenre.value)
    console.log('fetchRandomComparisonSongs completed')
    
    // Get songs from store
    songs.value = battleStore.comparisonSongs
    
    if (songs.value.length !== 2) {
      battlePhase.value = 'error'  // Trigger error modal
      battleStatus.value = 'Failed to get songs for battle'
      loading.value = false
      console.error('Battle failed: not enough songs')
      return
    }
    
    // STEP 3: Load tagged songs via global store (Network call 3)
    await tagStore.loadUserTags()
    
    // STEP 4: User flags load automatically via watcher (Network call 4)
    
    // STEP 5: Don't initialize battle audio yet
    // Audio will be played when user clicks play buttons
    
    battleStarted.value = true
    
    // Reset fade flag (cleanup)
    startScreenFadingOut.value = false
    
    loading.value = false
    
    // Reset battle state
    songAQualified.value = false
    songBQualified.value = false
    songAListeningTime.value = 0
    songBListeningTime.value = 0
    isVoting.value = false
    voteSubmitted.value = false
    
    // STEP 6: Set phase to roulette
    battlePhase.value = 'roulette'
    battleStatus.value = 'Spinning for battle...'
    
    // Wait for Vue to update DOM
    await nextTick()
    console.log('DOM updated after nextTick')
    
    // STEP 7: Fade in the wheel
    wheelFadingIn.value = true
    
    // Wait for wheel fade-in (400ms)
    await new Promise(resolve => setTimeout(resolve, 400))
    
    // Reset fade-in flag
    wheelFadingIn.value = false
    
    // Wait for browser to paint (50ms best practice)
    await new Promise(resolve => setTimeout(resolve, 50))
    console.log('Browser paint completed')
    
    // STEP 8: NOW start animation - DOM is guaranteed rendered
    console.log('Starting roulette animation...')
    await runRouletteAnimation()
    console.log('Roulette animation completed')
    
    // STEP 8: Transition to record players (flag already reset in runRouletteAnimation)
    battlePhase.value = 'recordPlayers'
    tapeSectionFadingIn.value = true
    battleStatus.value = 'Choose your battle!'
    console.log('Moving to record players phase')
    
    // Reset tape fade-in flag after animation completes
    setTimeout(() => {
      tapeSectionFadingIn.value = false
    }, 500) // Increased to 500ms to match production
    
  } catch (error) {
    console.error('Error starting battle:', error)
    battlePhase.value = 'error'  // Trigger error modal
    battleStatus.value = 'Error starting battle'
    loading.value = false
  }
}

const runRouletteAnimation = () => {
  return new Promise<void>((resolve) => {
    // Performance monitoring
    performance.mark('roulette-animation-start')
    console.log('runRouletteAnimation: Starting animation')
    
    // Enable GPU optimization
    wheelAnimating.value = true
    
    // Reset the wheel to starting position
    wheelRotation.value = 0
    
    // Start spinning animation
    const startRotation = wheelRotation.value
    const finalRotation = 360 * 5 + Math.random() * 360 // 5 full spins + random final position
    const startTime = Date.now()
    const duration = 3000 // 3 seconds (matches production)
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      wheelRotation.value = startRotation + (finalRotation - startRotation) * easeOut
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        // Performance monitoring
        performance.mark('roulette-animation-end')
        performance.measure('roulette-animation', 'roulette-animation-start', 'roulette-animation-end')
        
        const measure = performance.getEntriesByName('roulette-animation')[0]
        console.log(`🎡 Roulette animation completed in ${measure.duration.toFixed(2)}ms`)
        
        // Animation complete
        wheelAnimating.value = false
        
        // Start fade out
        rouletteFadingOut.value = true
        
        // Wait for fade out to complete
        setTimeout(() => {
          // Reset fade flag BEFORE resolving
          rouletteFadingOut.value = false
          battleAudio.stopRouletteSound()
          resolve()
        }, 500) // Increased to 500ms to match production
      }
    }
    
    animate()
    
    // Play roulette sound
    battleAudio.playRouletteSoundWithPitch()
    
    // Safety timeout
    setTimeout(() => {
      console.log('Safety timeout: stopping roulette sound')
      battleAudio.stopRouletteSound()
    }, 10000)
  })
}

const playSongA = async () => {
  if (!songs.value[0]?.url) return
  
  // Stop Song B if playing
  if (audioB.isPlaying.value) {
    audioB.pause()
  }
  
  // Determine playback parameters based on selected duration
  const song = songs.value[0]
  let clipStartTime = song.clip_start_time || 0
  let autoStopAfter: number | undefined = undefined
  
  if (selectedPlayOptionA.value === '15s') {
    autoStopAfter = 15
  } else if (selectedPlayOptionA.value === '30s') {
    autoStopAfter = 30
  } else if (selectedPlayOptionA.value === 'full') {
    clipStartTime = 0
    autoStopAfter = undefined
  }
  
  // Play Song A with battle mode
  await audioA.playBattleSong(song.id, song.url, clipStartTime, autoStopAfter)
  
  // Track listening time for qualification
  trackListeningTime(0)
}

const playSongB = async () => {
  if (!songs.value[1]?.url) return
  
  // Stop Song A if playing
  if (audioA.isPlaying.value) {
    audioA.pause()
  }
  
  // Determine playback parameters based on selected duration
  const song = songs.value[1]
  let clipStartTime = song.clip_start_time || 0
  let autoStopAfter: number | undefined = undefined
  
  if (selectedPlayOptionB.value === '15s') {
    autoStopAfter = 15
  } else if (selectedPlayOptionB.value === '30s') {
    autoStopAfter = 30
  } else if (selectedPlayOptionB.value === 'full') {
    clipStartTime = 0
    autoStopAfter = undefined
  }
  
  // Play Song B with battle mode
  await audioB.playBattleSong(song.id, song.url, clipStartTime, autoStopAfter)
  
  // Track listening time for qualification
  trackListeningTime(1)
}

const playSongClip = async (songIndex: number, duration: number) => {
  const song = songs.value[songIndex]
  if (!song?.url) return
  
  // Stop any currently playing audio from the other song
  const otherSongIndex = songIndex === 0 ? 1 : 0
  const otherAudio = otherSongIndex === 0 ? audioA : audioB
  if (otherAudio.isPlaying.value) {
    otherAudio.pause()
  }
  
  // Set the selected play option
  const newOption = duration === 15 ? '15s' : '30s'
  if (songIndex === 0) {
    selectedPlayOptionA.value = newOption
  } else {
    selectedPlayOptionB.value = newOption
  }
  
  // Play the clip
  const audio = songIndex === 0 ? audioA : audioB
  const clipStartTime = song.clip_start_time || 0
  
  // CRITICAL: Cleanup to destroy old Howl instance and prevent memory leaks
  audio.cleanup()
  
  await audio.playBattleSong(song.id, song.url, clipStartTime, duration)
  
  // Track listening time for qualification
  trackListeningTime(songIndex)
}

const playFullSong = async (songIndex: number) => {
  const song = songs.value[songIndex]
  if (!song?.url) return
  
  // Stop any currently playing audio from the other song
  const otherSongIndex = songIndex === 0 ? 1 : 0
  const otherAudio = otherSongIndex === 0 ? audioA : audioB
  if (otherAudio.isPlaying.value) {
    otherAudio.pause()
  }
  
  // Set the selected play option
  const newOption = 'full'
  if (songIndex === 0) {
    selectedPlayOptionA.value = newOption
  } else {
    selectedPlayOptionB.value = newOption
  }
  
  // Play from beginning with no timeout
  const audio = songIndex === 0 ? audioA : audioB
  
  // CRITICAL: Cleanup to destroy old Howl instance and prevent memory leaks
  audio.cleanup()
  
  await audio.playBattleSong(song.id, song.url, 0, undefined)
  
  // Track listening time for qualification
  trackListeningTime(songIndex)
}

const seekSong = (songIndex: number, percentage: number) => {
  const audio = songIndex === 0 ? audioA : audioB
  
  // Only allow seeking if audio has been loaded (duration exists)
  if (!audio.duration.value) return
  
  // Calculate target time based on percentage and duration
  const targetTime = (percentage / 100) * audio.duration.value
  
  // Use Howler's seek method to jump to the target time
  audio.seek(targetTime)
}

const trackListeningTime = (songIndex: number) => {
  const audio = songIndex === 0 ? audioA : audioB
  const song = songs.value[songIndex]
  
  // Get the clip start time for this song
  const clipStartTime = song?.clip_start_time || 0
  
  // Reset qualification state for this song before tracking
  if (songIndex === 0) {
    songAQualified.value = false
    songAListeningTime.value = 0
  } else {
    songBQualified.value = false
    songBListeningTime.value = 0
  }
  
  // Stop any existing watcher for this song to prevent accumulation
  if (songIndex === 0 && songAWatcher) {
    songAWatcher()
    songAWatcher = null
  } else if (songIndex === 1 && songBWatcher) {
    songBWatcher()
    songBWatcher = null
  }
  
  // Watch for progress updates to track listening time
  const progressWatcher = watch(audio.currentTime, (currentTime) => {
    // Calculate relative listening time (time since playback started)
    const relativeTime = currentTime - clipStartTime
    
    if (songIndex === 0) {
      songAListeningTime.value = relativeTime
      if (relativeTime >= 3 && !songAQualified.value) {
        songAQualified.value = true
      }
    } else {
      songBListeningTime.value = relativeTime
      if (relativeTime >= 3 && !songBQualified.value) {
        songBQualified.value = true
      }
    }
  })
  
  // Store watcher reference for cleanup
  if (songIndex === 0) {
    songAWatcher = progressWatcher
  } else {
    songBWatcher = progressWatcher
  }
  
  // Clean up watcher when song stops
  const stopWatcher = watch(audio.isPlaying, (isPlaying) => {
    if (!isPlaying) {
      progressWatcher()
      stopWatcher()
      // Clear watcher reference
      if (songIndex === 0) {
        songAWatcher = null
      } else {
        songBWatcher = null
      }
    }
  })
}

const voteForSong = async (choice: 'A' | 'B') => {
  if (isVoting.value || voteSubmitted.value) return
  
  isVoting.value = true
  
  // Get both song IDs (matches production implementation)
  const chosenSong = choice === 'A' ? songs.value[0] : songs.value[1]
  const unchosenSong = choice === 'A' ? songs.value[1] : songs.value[0]
  
  try {
    // Call recordComparisonVote with both song IDs using the authenticated user's id
    await battleStore.recordComparisonVote(
      chosenSong.id,
      unchosenSong.id,
      authStore.user!.id
    )
    voteSubmitted.value = true
    showCelebration()
  } catch (error) {
    console.error('Failed to vote:', error)
    isVoting.value = false
  }
}

const showCelebration = () => {
  battlePhase.value = 'complete'
  
  // Trigger confetti
  confetti({
    particleCount: 200,
    spread: 90,
    origin: { y: 0.7 },
    colors: ['#ffd200', '#ffffff', '#17c964']
  })
  
  // Play confetti sound
  battleAudio.playConfettiSound()
  
  // Reset after 3 seconds
  setTimeout(() => {
    resetBattle()
  }, 3000)
}

const retryBattle = async () => {
  console.log('🔄 Retrying battle with new songs')
  
  // Reset all states
  battlePhase.value = 'loading'
  battleStatus.value = 'Finding songs...'
  audioAError.value = false
  audioBError.value = false
  songs.value = []
  
  // Start fresh battle
  await startBattle()
}

const resetBattle = () => {
  // Reset all fade states
  startScreenFadingOut.value = false
  wheelFadingIn.value = false
  rouletteFadingOut.value = false
  tapeSectionFadingIn.value = false
  
  battleStarted.value = false
  battlePhase.value = 'loading'
  selectedGenre.value = ''
  songs.value = []
  songAQualified.value = false
  songBQualified.value = false
  songAListeningTime.value = 0
  songBListeningTime.value = 0
  
  // Clean up any active watchers
  if (songAWatcher) {
    songAWatcher()
    songAWatcher = null
  }
  if (songBWatcher) {
    songBWatcher()
    songBWatcher = null
  }
  
  selectedPlayOptionA.value = null
  selectedPlayOptionB.value = null
  isVoting.value = false
  voteSubmitted.value = false
  
  // Stop all audio
  audioA.stopBattleAudio()
  audioB.stopBattleAudio()
}

const goToProfile = () => {
  if (profileStore.profile?.username) {
    router.push(`/user/${profileStore.profile.username}`)
  } else {
    router.push('/account')
  }
}

const handleUploadComplete = () => {
  console.log('[Dashboard] Upload completed successfully')
  router.push('/tabs/my-songs')
}

// Load available genres
// Function to fetch available genres for battles (matches production)
const fetchAvailableGenres = async () => {
  try {
    loadingGenres.value = true
    const { data, error } = await supabaseService.getClient().rpc('get_battle_available_genres' as any)
    
    if (error) {
      console.error('Error fetching available genres:', error)
      // Fallback to master genre list if RPC fails
      genres.value = [...MASTER_GENRES]
    } else {
      genres.value = (data as (string | { genre: string })[]) || []
      console.log('Available genres for battles:', genres.value)
    }
  } catch (err) {
    console.error('Exception fetching available genres:', err)
    // Fallback to master genre list
    genres.value = [...MASTER_GENRES]
  } finally {
    loadingGenres.value = false
  }
}

// Asset preloading function
const preloadBattleAssets = async () => {
  try {
    console.log('🔄 Preloading battle assets...')
    
    // Preload roulette.wav
    const response = await fetch('/sounds/roulette.wav')
    const buffer = await response.arrayBuffer()
    preloadedAssets.value.rouletteSound = buffer
    
    console.log('✅ Battle assets preloaded')
    assetsPreloaded.value = true
  } catch (error) {
    console.error('❌ Failed to preload assets:', error)
    // Don't block app - proceed with degraded experience
    assetsPreloaded.value = true
  }
}

// Watch for songs changes to load user flags via store
watch(songs, () => {
  if (songs.value.length > 0) {
    flagStore.loadUserFlags(songs.value.map(s => s.id))
  }
}, { immediate: true })

onMounted(async () => {
  // Start preloading assets immediately
  preloadBattleAssets()
  
  // Load genres for battle
  await fetchAvailableGenres()
})

onUnmounted(() => {
  // Cleanup audio
  audioA.stopBattleAudio()
  audioB.stopBattleAudio()
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

/* Battle Section Styles */
.battle-section {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Genre Selection */
.genre-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
}

.selection-container {
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.selection-title {
  font-size: 2rem;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.selection-subtitle {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}


.start-battle-btn {
  --background: #ffd200;
  --color: #000000;
  --border-radius: 0.5rem;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

/* Roulette Wheel */
.roulette-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
}

.wheel-wrapper {
  position: relative;
  width: 320px;
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-pointer {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.arrow-image {
  width: 64px;
  height: 64px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.wheel-image {
  width: 100%;
  height: 100%;
  will-change: transform; /* Keep GPU acceleration */
  /* Removed CSS transition - using JavaScript animation only */
}

.wheel-spinning {
  will-change: transform;
}

.roulette-fade-out {
  animation: fadeOut 0.5s ease-out;
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

.battle-fade-in {
  animation: battleFadeIn 0.5s ease-in;
}

@keyframes battleFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Battle Interface */
.battle-interface {
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

.song-label {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0;
}

.song-info {
  text-align: center;
  max-width: 200px;
}

.song-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.song-artist {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 0.25rem 0;
}

.song-genre {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin: 0;
}

.status-indicator {
  margin-top: 0.5rem;
  text-align: center;
}

.qualified {
  color: #10b981;
  font-size: 0.875rem;
  font-weight: 600;
}

.not-qualified {
  color: var(--text-secondary);
  font-size: 0.875rem;
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

.vote-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.vote-button-container {
  margin-top: 1rem;
  width: 200px;
  display: flex;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
}

.vote-btn-a,
.vote-btn-b {
  width: 100%;
}

.vote-btn-a:disabled,
.vote-btn-b:disabled {
  --background: var(--text-muted);
  --color: var(--text-secondary);
}

/* Battle Complete */
.battle-complete {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
}

.complete-message {
  text-align: center;
}

.complete-title {
  font-size: 3rem;
  font-weight: bold;
  color: #ffd200;
  margin: 0 0 1rem 0;
}

.complete-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin: 0;
}

.animate-battleComplete {
  animation: battleComplete 0.8s ease-out;
}

.animate-battleCompleteSubtitle {
  animation: battleCompleteSubtitle 1s ease-out 0.3s both;
}

@keyframes battleComplete {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes battleCompleteSubtitle {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* Responsive Design */
@media (min-width: 768px) {
  .battle-songs {
    flex-direction: row;
    gap: 4rem;
  }
  
  .vote-buttons {
    flex-direction: row;
    justify-content: center;
  }
  
  .wheel-wrapper {
    width: 400px;
    height: 400px;
  }
}

/* Start screen fade out */
.screen-fade-out {
  animation: fadeOut 0.4s ease-out forwards;
}

/* Wheel fade in */
.wheel-fade-in {
  animation: fadeIn 0.4s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Note: fadeOut keyframe already exists at line 1167 */
</style>