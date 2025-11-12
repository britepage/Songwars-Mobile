<template>
  <ion-page>
    <ion-content :fullscreen="true" class="pt-16">
      <!-- Header -->
    <div class="pt-[5em] pb-[5em]">
      <div class="p-4 md:p-6 theme-bg-primary">
        <h1 class="text-3xl md:text-4xl font-bold theme-text-primary mb-2">Leaderboard</h1>
        <p class="text-sm md:text-base theme-text-secondary">
          <span v-if="selectedWeek !== 'hof'">
            Top 10 songs per genre are revealed each week during the churn process. Leaderboard updates every Monday.
          </span>
          <span v-else>
            Hall of Fame: Songs from Churn {{ selectedChurnWeek !== 'all' ? selectedChurnWeek : 'All' }}
          </span>
        </p>
      </div>

      <!-- Filters Section -->
      <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <!-- Genre Filter -->
        <div class="mb-4">
          <label class="block text-sm font-medium theme-text-primary mb-2">Genre</label>
          <Listbox v-model="selectedGenre">
            <div class="relative">
              <ListboxButton class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-left flex items-center justify-between theme-text-primary theme-border">
                <span>{{ selectedGenre || 'All Genres' }}</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clip-rule="evenodd"/>
                </svg>
              </ListboxButton>
              <ListboxOptions class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-1 shadow-lg theme-text-black-light">
                <ListboxOption value="" as="template" v-slot="{ active, selected }">
                  <li :class="['px-4 py-2 cursor-pointer', active && 'bg-gray-100 dark:bg-gray-700', selected && 'font-semibold']">
                    All Genres
                  </li>
                </ListboxOption>
                <ListboxOption v-for="genre in genres" :key="genre" :value="genre" as="template" v-slot="{ active, selected }">
                  <li :class="['px-4 py-2 cursor-pointer', active && 'bg-gray-100 dark:bg-gray-700', selected && 'font-semibold']">
                    {{ genre }}
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </div>
          </Listbox>
        </div>

        <!-- Week Filter -->
        <div class="mb-4">
          <label class="block text-sm font-medium theme-text-primary mb-2">Week</label>
          <Listbox v-model="selectedWeek">
            <div class="relative">
              <ListboxButton class="w-full bg-white dark:bg-gray-800 border-2 border-[#ffd200] rounded-lg px-4 py-3 text-left flex items-center justify-between theme-text-primary theme-border">
                <span>
                  <span v-if="selectedWeek === 'hof'">🏆 </span>
                  {{ weekLabel }}
                </span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clip-rule="evenodd"/>
                </svg>
              </ListboxButton>
              <ListboxOptions class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-1 shadow-lg theme-text-black-light">
                <ListboxOption value="1" as="template" v-slot="{ active, selected }">
                  <li :class="['px-4 py-2 cursor-pointer', active && 'bg-gray-100 dark:bg-gray-700', selected && 'font-semibold']">
                    Week 1
                  </li>
                </ListboxOption>
                <ListboxOption value="2" as="template" v-slot="{ active, selected }">
                  <li :class="['px-4 py-2 cursor-pointer', active && 'bg-gray-100 dark:bg-gray-700', selected && 'font-semibold']">
                    Week 2
                  </li>
                </ListboxOption>
                <ListboxOption value="3" as="template" v-slot="{ active, selected }">
                  <li :class="['px-4 py-2 cursor-pointer', active && 'bg-gray-100 dark:bg-gray-700', selected && 'font-semibold']">
                    Week 3
                  </li>
                </ListboxOption>
                <ListboxOption value="hof" as="template" v-slot="{ active, selected }">
                  <li :class="['px-4 py-2 cursor-pointer', active && 'bg-gray-100 dark:bg-gray-700', selected && 'font-semibold']">
                    🏆 Hall of Fame
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </div>
          </Listbox>
        </div>

        <!-- Churn Week Filter (only for Hall of Fame) -->
        <div v-if="selectedWeek === 'hof'" class="mb-4">
          <label class="block text-sm font-medium theme-text-primary mb-2">Churn Week</label>
          <Listbox v-model="selectedChurnWeek">
            <div class="relative">
              <ListboxButton class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-left flex items-center justify-between theme-text-primary theme-border">
                <span>{{ churnWeekLabel }}</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clip-rule="evenodd"/>
                </svg>
              </ListboxButton>
              <ListboxOptions class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-1 shadow-lg theme-text-black-light">
                <ListboxOption value="all" as="template" v-slot="{ active, selected }">
                  <li :class="['px-4 py-2 cursor-pointer', active && 'bg-gray-100 dark:bg-gray-700', selected && 'font-semibold']">
                    All Churn Weeks
                  </li>
                </ListboxOption>
                <ListboxOption v-for="event in churnEvents" :key="event.churn_week_number" :value="event.churn_week_number.toString()" as="template" v-slot="{ active, selected }">
                  <li :class="['px-4 py-2 cursor-pointer', active && 'bg-gray-100 dark:bg-gray-700', selected && 'font-semibold']">
                    Churn {{ event.churn_week_number }}
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </div>
          </Listbox>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="leaderboardStore.isLoading" class="flex flex-col items-center justify-center py-12">
        <ion-spinner name="crescent" />
        <p class="mt-4 theme-text-secondary">Loading leaderboard...</p>
      </div>

      <!-- Leaderboard Content -->
      <div v-else class="p-4 md:p-6">
        <!-- Empty State -->
        <div v-if="Object.keys(filteredLeaderboardByGenre).length === 0" class="text-center py-12">
          <div class="text-6xl mb-4">🏆</div>
          <h3 class="text-xl font-semibold theme-text-primary mb-2">No Entries Yet</h3>
          <p class="theme-text-secondary">Be the first to compete in this genre!</p>
        </div>

        <!-- Genre Sections -->
        <div v-for="(songs, genre) in filteredLeaderboardByGenre" :key="genre" class="mb-8">
          <!-- Genre Header -->
          <div class="flex items-center mb-4">
            <div class="bg-[#ffd200] rounded-lg p-2 mr-3">
              <svg class="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <h2 class="text-2xl font-bold theme-text-primary">{{ genre }}</h2>
            <div class="flex-1 h-px bg-gray-300 dark:bg-gray-600 ml-4"></div>
          </div>

          <!-- Songs Grid -->
          <div class="grid gap-4 md:gap-6">
            <LeaderboardSongCard
              v-for="song in songs"
              :key="song.song_id"
              :song="song"
              :is-playing="audio.currentSongId.value === song.song_id && audio.isPlaying.value"
              :audio-loading="audio.currentSongId.value === song.song_id && audio.isLoading.value"
              :audio-error="audio.currentSongId.value === song.song_id ? audio.error.value : null"
              :progress-value="audio.currentSongId.value === song.song_id ? audio.progress.value : 0"
              @play="handlePlay"
              @retry="handleRetry"
            />
          </div>
        </div>
      </div>
    </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonSpinner } from '@ionic/vue'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useLeaderboardStore } from '@/stores/leaderboardStore'
import { useTagStore } from '@/stores/tagStore'
import { useHowlerPlayer } from '@/composables/useHowlerPlayer'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
import { onIonViewWillEnter } from '@ionic/vue'
import LeaderboardSongCard from '@/components/leaderboard/LeaderboardSongCard.vue'

const leaderboardStore = useLeaderboardStore()
const tagStore = useTagStore()
const audio = useHowlerPlayer()

// State
const selectedGenre = ref<string>('')
const selectedWeek = ref<string>('3')
const selectedChurnWeek = ref<string>('all')

// Computed
const genres = computed(() => leaderboardStore.genres)
const churnEvents = computed(() => leaderboardStore.churnEvents)
const leaderboardByGenre = computed(() => leaderboardStore.leaderboardByGenre)

const weekLabel = computed(() => {
  if (selectedWeek.value === 'hof') return 'Hall of Fame'
  return `Week ${selectedWeek.value}`
})

const churnWeekLabel = computed(() => {
  if (selectedChurnWeek.value === 'all') return 'All Churn Weeks'
  return `Churn ${selectedChurnWeek.value}`
})

const filteredLeaderboardByGenre = computed(() => {
  if (!selectedGenre.value) {
    return leaderboardByGenre.value
  }
  return { [selectedGenre.value]: leaderboardByGenre.value[selectedGenre.value] || [] }
})

// Load data
const loadLeaderboard = async () => {
  const week = selectedWeek.value === 'hof' ? '4' : selectedWeek.value
  const churnWeek = selectedWeek.value === 'hof' ? selectedChurnWeek.value : undefined
  await leaderboardStore.fetchLeaderboard(selectedGenre.value, week as '1' | '2' | '3' | '4', churnWeek)
}

const loadGenres = async () => {
  const week = selectedWeek.value === 'hof' ? '4' : selectedWeek.value
  await leaderboardStore.fetchAvailableGenres(week as '1' | '2' | '3' | '4')
}

// Audio handlers
const handlePlay = async (song: any) => {
  if (!song.audio_url) return
  
  // Stop all other audio
  audio.stopBattleAudio()
  
  // Play 30-second clip
  const clipStartTime = song.clip_start_time || 0
  await audio.playBattleSong(song.song_id, song.audio_url, clipStartTime, 30)
}

const handleRetry = (songId: string) => {
  const song = leaderboardStore.leaderboard.find(s => s.song_id === songId)
  if (song) handlePlay(song)
}

// Watchers
watch([selectedGenre, selectedWeek], async () => {
  if (selectedWeek.value === 'hof') {
    await leaderboardStore.fetchChurnEvents()
    if (selectedChurnWeek.value === 'all' && churnEvents.value.length > 0) {
      selectedChurnWeek.value = churnEvents.value[0].churn_week_number.toString()
    }
  }
  await tagStore.loadUserTags()
  await loadGenres()
  await loadLeaderboard()
})

watch(selectedChurnWeek, async () => {
  if (selectedWeek.value === 'hof') {
    await tagStore.loadUserTags()
    await loadLeaderboard()
  }
})

// Lifecycle
onIonViewWillEnter(async () => {
  await tagStore.loadUserTags()
  
  if (selectedWeek.value === 'hof') {
    await leaderboardStore.fetchChurnEvents()
    if (selectedChurnWeek.value === 'all' && churnEvents.value.length > 0) {
      selectedChurnWeek.value = churnEvents.value[0].churn_week_number.toString()
    }
  }
  
  await loadGenres()
  await loadLeaderboard()
})

onMounted(async () => {
  await tagStore.loadUserTags()
})

onUnmounted(() => {
  audio.cleanup()
})
</script>
