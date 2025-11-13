<template>
  <div>
    <!-- Tabs -->
    <div class="mb-6 border-b">
      <nav class="flex space-x-8" role="tablist" aria-label="Song management tabs">
        <button
          id="active-tab"
          @click="activeTab = 'active'"
          :class="['py-2 px-1 font-medium text-sm transition-colors', activeTab === 'active' ? 'border-b-2 border-solid border-[#ffd200] text-[#ffd200]' : 'border-b-2 border-solid border-transparent text-black hover:text-gray-600 hover:border-gray-300']"
          role="tab"
          :aria-selected="activeTab === 'active'"
          aria-controls="active-songs-panel"
        >
          Active Songs ({{ totalActiveCount }})
        </button>
        <button
          id="trash-tab"
          @click="activeTab = 'trash'"
          :class="['py-2 px-1 font-medium text-sm transition-colors', activeTab === 'trash' ? 'border-b-2 border-solid border-[#ffd200] text-[#ffd200]' : 'border-b-2 border-solid border-transparent text-black hover:text-gray-600 hover:border-gray-300']"
          role="tab"
          :aria-selected="activeTab === 'trash'"
          aria-controls="trash-panel"
        >
          Trash ({{ trashedCount }})
        </button>
      </nav>
    </div>

    <!-- Filters/Search (Active only) -->
    <div v-if="activeTab === 'active'" class="mb-6 flex items-center flex-wrap gap-3">
      <div class="relative flex items-center space-x-2 z-50">
        <label class="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by Genre:</label>
        <!-- Headless UI Listbox replacement for native select -->
        <Listbox v-model="selectedGenre">
          <div ref="genreTriggerRef" class="relative">
            <ListboxButton as="div" role="button" tabindex="0" @click="updateOptionsPosition" class="bg-white border border-gray-300 border-solid rounded-md px-3 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent w-[180px] text-left flex items-center justify-between">
              <span>{{ selectedGenre || 'All Genres' }}</span>
              <svg class="ml-2 h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clip-rule="evenodd"/></svg>
            </ListboxButton>
            <Teleport to="body">
              <ListboxOptions
                :style="optionsStyle"
                class="absolute z-50 mt-1 max-h-60 w-[180px] overflow-auto rounded-md border border-gray-200 bg-white py-1 text-gray-900 outline-none"
              >
                <ListboxOption
                  v-for="g in [''].concat(availableGenres)"
                  :key="g || 'all'"
                  :value="g"
                  as="template"
                  v-slot="{ active, selected }"
                >
                  <li
                    :class="[
                      'px-3 py-2 text-sm cursor-pointer text-gray-900',
                      active && 'bg-gray-100',
                      selected && 'font-medium'
                    ]"
                  >
                    {{ g || 'All Genres' }}
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </Teleport>
          </div>
        </Listbox>
        <button v-if="selectedGenre" @click="selectedGenre = ''" class="text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1">Clear</button>
      </div>
      <div class="flex items-center space-x-2 flex-1 max-w-md">
        <label class="text-sm font-medium text-gray-700 whitespace-nowrap">Search Songs:</label>
        <div class="relative flex-1">
          <input v-model="searchQuery" type="text" placeholder="Search by song title..." class="w-full bg-white border border-gray-300 rounded-md pl-10 pr-4 py-2 text-gray-900 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ffd200] focus:border-transparent shadow-sm" />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
        <button v-if="searchQuery" @click="searchQuery = ''" class="text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1">Clear</button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="songStore.isLoading" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffd200] mx-auto"></div>
      <p class="mt-4 text-gray-400">Loading songs...</p>
    </div>

    <!-- Active Songs Empty State -->
    <div v-else-if="!songStore.isLoading && filteredActiveSongs.length === 0 && !selectedGenre && !searchQuery" class="text-center py-12">
      <div class="text-gray-400 text-6xl mb-4">🎵</div>
      <p class="text-gray-400 text-lg">No songs uploaded yet</p>
      <p class="text-gray-500 mt-2">Your uploaded songs will appear here</p>
    </div>

    <!-- Active Songs Grid -->
    <div v-if="activeTab==='active' && filteredActiveSongs.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <MySongCard
        v-for="song in filteredActiveSongs"
        :key="song.id"
        :song="song"
        :refresh-key="props.refreshKey"
        :is-playing="isPlaying(song.id)"
        :audio-loading="audioLoading[song.id] || false"
        :audio-error="audioErrors[song.id] || false"
        :progress-value="audio.currentSongId.value === song.id ? audio.progress.value : 0"
        :is-mobile="isMobile"
        :format-date="formatDate"
        :calc-approval="calcApproval"
        :get-approval-rate-number="getApprovalRateNumber"
        :get-status-pills="getStatusPills"
        :get-status-message="getStatusMessage"
        @play="toggleSong"
        @edit="openEdit"
        @delete="openDelete"
        @retry="retryAudio"
      />
    </div>

    <!-- Trash Loading State -->
    <div v-if="activeTab==='trash' && songStore.loadingTrashedSongs" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffd200] mx-auto"></div>
      <p class="mt-4 text-gray-400">Loading trashed songs...</p>
    </div>

    <!-- Trash Cards Grid -->
    <div v-else-if="activeTab==='trash' && songStore.trashedSongs.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="song in songStore.trashedSongs" :key="song.id" 
        class="border rounded-xl p-6 text-center flex flex-col justify-between hover:border-red-500/50 transition-all duration-300 border-gray-700 bg-gray-800 theme-bg-card theme-border-card">
        <div>
          <!-- Song Title and Artist -->
          <h3 class="font-semibold text-black text-lg mb-1 break-words">{{ song.title }}</h3>
          <p class="text-gray-500 text-sm mb-4 italic">{{ song.artist }}</p>
          
          <!-- Trash Status Box -->
          <div class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p class="text-red-400 text-sm font-medium">Moved to trash</p>
            <p class="text-red-300 text-xs mt-1">
              {{ getTrashExpiryText(song.trash_expires_at || null) }}
            </p>
          </div>

          <!-- Metrics Row -->
          <p class="text-black text-sm flex items-center justify-center space-x-3">
            <span>Total Votes: {{ (song.likes || 0) + (song.dislikes || 0) }}</span>
            <span class="text-black">|</span>
            <span>Approval: 
              <span :class="{
                'text-[#ffd200]': getApprovalRateNumber(song.likes, song.dislikes) >= 70,
                'text-red-500': getApprovalRateNumber(song.likes, song.dislikes) < 50,
                'text-gray-400': getApprovalRateNumber(song.likes, song.dislikes) === 0
              }">
                {{ calcApproval(song.likes, song.dislikes) }}%
              </span>
            </span>
          </p>
          
          <!-- Timestamps -->
          <p class="text-xs text-gray-500 mt-3">Uploaded: {{ formatDate(song.created_at) }}</p>
          <p class="text-xs text-red-400 mt-1">Deleted: {{ song.deleted_at ? formatDate(song.deleted_at) : 'Unknown' }}</p>
          
          <!-- Action Buttons -->
          <div class="mt-4 flex justify-center space-x-2">
            <button
              @click="restoreSong(song.id)"
              :disabled="restoringSong === song.id"
              class="px-3 py-2 bg-[#ffd200] text-black rounded-lg hover:bg-[#e6bd00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center"
            >
              <svg v-if="restoringSong !== song.id" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
              </svg>
              <div v-else class="animate-spin rounded-full h-4 w-4 mr-1 border-b-2 border-black"></div>
              {{ restoringSong === song.id ? 'Restoring...' : 'Restore' }}
            </button>
            <button
              @click="confirmHardDelete(song)"
              :disabled="hardDeletingSong === song.id"
              class="px-3 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center"
            >
              <svg v-if="hardDeletingSong !== song.id" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              <div v-else class="animate-spin rounded-full h-4 w-4 mr-1 border-b-2 border-white"></div>
              {{ hardDeletingSong === song.id ? 'Deleting...' : 'Delete Permanently' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Trash Empty State -->
    <div v-else-if="activeTab==='trash'" class="text-center py-12">
      <div class="text-gray-600 text-6xl mb-4">🗑️</div>
      <p class="text-gray-500 text-lg">No trashed songs</p>
      <p class="text-gray-600 mt-2">Deleted songs will appear here for 10 days</p>
    </div>

    <!-- Load More (Infinite Scroll) -->
    <div v-if="activeTab==='active' && hasMoreActive" class="flex items-center justify-center py-4">
      <button @click="loadMore" class="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 text-gray-300 transition-colors">Load more</button>
    </div>
    
    <!-- Loading More Indicator -->
    <div v-if="loadingMore" class="flex items-center justify-center space-x-2 text-gray-400 py-4">
      <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-[#ffd200]"></div>
      <span class="text-sm">Loading more songs...</span>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-black">Delete Song</h3>
            <button @click="showDeleteModal=false" class="text-gray-500 hover:text-gray-700 w-auto h-auto min-w-0 min-h-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="mb-6">
            <p class="text-gray-800 mb-4">
              Are you sure you want to delete "<strong>{{ songToDelete?.title }}</strong>" by {{ songToDelete?.artist }}?
            </p>
            <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p class="text-yellow-600 text-sm">
                <strong>Note:</strong> This will move the song to trash where it will be automatically deleted after 10 days. 
                You can restore it anytime before then.
              </p>
            </div>
          </div>
          
          <div class="flex space-x-3">
            <button
              @click="confirmDelete"
              :disabled="deleting"
              class="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {{ deleting ? 'Deleting...' : 'Move to Trash' }}
            </button>
            <button
              @click="showDeleteModal=false"
              class="px-4 py-3 bg-white text-black border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Hard Delete Modal -->
    <div v-if="showHardDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-black">Permanently Delete Song</h3>
            <button @click="closeHardDelete" class="text-gray-400 hover:text-white min-w-0 min-h-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="mb-6">
            <p class="text-black mb-4">
              Are you absolutely sure you want to <strong>permanently delete</strong> "<strong>{{ songToHardDelete?.title }}</strong>" by {{ songToHardDelete?.artist }}?
            </p>
            <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p class="text-red-400 text-sm">
                <strong>Warning:</strong> This action cannot be undone. The song will be permanently removed from the system and all associated files will be deleted.
              </p>
            </div>
            
            <!-- Song name confirmation input -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-black mb-2">
                Type the song name to confirm: <strong>"{{ songToHardDelete?.title }}"</strong>
              </label>
              <input
                v-model="songNameConfirmation"
                type="text"
                class="w-full px-3 py-2 bg-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-black placeholder-gray-400"
                placeholder="Enter song name to confirm"
              />
            </div>
          </div>
          
          <div class="flex space-x-3">
            <button
              @click="hardDeleteSong"
              :disabled="hardDeleting || !canConfirmHardDelete"
              class="flex-1 px-4 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {{ hardDeleting ? 'Deleting...' : 'Delete Permanently' }}
            </button>
            <button
              @click="closeHardDelete"
              class="px-4 py-3 text-black rounded-lg hover:bg-gray-600 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div class="bg-white rounded-xl max-w-4xl w-full max-h-[calc(100vh-8rem)] overflow-y-auto">
        <div class="p-6 space-y-4 pb-[4em]">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-black">Edit Song</h3>
            <button @click="showEditModal=false" class="text-gray-400 hover:text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-black mb-1">Title</label>
              <input v-model="editForm.title" class="w-full px-3 py-2 bg-white border border-gray-600 rounded-lg text-black focus:ring-2 focus:ring-[#ffd200] focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-medium text-black mb-1">Artist</label>
              <input v-model="editForm.artist" class="w-full px-3 py-2 bg-white border border-gray-600 rounded-lg text-black focus:ring-2 focus:ring-[#ffd200] focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-medium text-black mb-1">Genre</label>
              <select
                v-model="editForm.genre"
                class="w-full px-3 py-2 bg-white border border-gray-600 rounded-lg text-black focus:ring-2 focus:ring-[#ffd200] focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="">Select genre</option>
                <option 
                  v-for="genreItem in uploadStore.battleReadyGenres" 
                  :key="genreItem.genre"
                  :value="genreItem.genre"
                >
                  {{ genreItem.genre }}{{ genreItem.is_battle_ready ? ' ●' : ' ○' }}
                </option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-black mb-2">Clip Start (preview)</label>
            <WaveformSelectorDual v-if="editForm.url" :audio-url="editForm.url" :initial-clip-start="editForm.clipStartTime || 0" @clip-changed="(t:number)=>editForm.clipStartTime=t" />
          </div>
          <div class="flex justify-end space-x-3 pt-2">
            <button @click="saveEdit" class="flex-1 px-4 py-2 rounded-lg bg-[#ffd200] text-black hover:bg-[#e6bd00]">Save Changes</button>
            <button @click="showEditModal=false" class="px-4 py-2 text-black hover:text-gray-600">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useHowlerPlayer } from '@/composables/useHowlerPlayer'
import { useSongStore } from '@/stores/songStore'
import { useThemeStore } from '@/stores/themeStore'
import { useUploadStore } from '@/stores/uploadStore'
import { useTagStore } from '@/stores/tagStore'
import { supabaseService } from '@/services/supabase.service'
import WaveformSelectorDual from '@/components/dashboard/WaveformSelectorDual.vue'
import MySongCard from '@/components/dashboard/MySongCard.vue'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'

interface Props {
  refreshKey?: number
}

const props = defineProps<Props>()

const songStore = useSongStore()
const initialLoadComplete = ref(false)
const audio = useHowlerPlayer()
const themeStore = useThemeStore()
const uploadStore = useUploadStore()
const tagStore = useTagStore()

const activeTab = ref<'active'|'trash'>('active')
const selectedGenre = ref('')
const searchQuery = ref('')

// Headless UI Listbox positioning state
const triggerRect = ref<DOMRect | null>(null)
const genreTriggerRef = ref<HTMLElement | null>(null)
const updateOptionsPosition = () => {
  if (genreTriggerRef.value) {
    triggerRect.value = genreTriggerRef.value.getBoundingClientRect()
  }
}
const optionsStyle = computed(() => {
  if (!triggerRect.value) return {}
  return {
    position: 'absolute',
    left: `${triggerRect.value.left}px`,
    top: `${triggerRect.value.bottom + 4}px`
  } as Record<string, string>
})

// Modal states
const showDeleteModal = ref(false)
const showHardDeleteModal = ref(false)
const showEditModal = ref(false)
const songToDelete = ref<any>(null)
const songToHardDelete = ref<any>(null)
const editingSongId = ref<string | null>(null)
const songNameConfirmation = ref('')
const deleting = ref(false)
const hardDeleting = ref(false)
const loadingMore = ref(false)

// Trash state variables
const restoringSong = ref<string | null>(null)
const hardDeletingSong = ref<string | null>(null)

// Tag and status states (removed - now handled in MySongCard component)

// Audio player states - adapt Howler to existing interface
const isMobile = ref(false)

// Helper functions to adapt Howler player to song-specific interface
const isPlaying = (songId: string) => audio.currentSongId.value === songId && audio.isPlaying.value
const audioLoading = computed(() => ({ [audio.currentSongId.value || '']: audio.isLoading.value }))
const audioErrors = computed(() => ({ [audio.currentSongId.value || '']: audio.error.value || '' }))

// Edit form
const editForm = ref<any>({ title: '', artist: '', genre: '', url: '', clipStartTime: 0 })

const totalActiveCount = computed(() => songStore.songs?.length || 0)
const trashedCount = computed(() => songStore.trashedSongs?.length || 0)

// Modal theme classes
const modalClasses = computed(() => ({
  container: themeStore.isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300',
  title: themeStore.isDark ? 'text-white' : 'text-black',
  body: themeStore.isDark ? 'text-gray-300' : 'text-gray-700',
  button: themeStore.isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
}))

const availableGenres = computed(() => {
  const set = new Set<string>()
  ;(songStore.songs || []).forEach(s => { if (s.genre) set.add(String(s.genre)) })
  return Array.from(set).sort()
})

const filteredActiveSongs = computed(() => {
  let list = songStore.songs || []
  if (selectedGenre.value) list = list.filter(s => String(s.genre) === selectedGenre.value)
  if (searchQuery.value) list = list.filter(s => (s.title || '').toLowerCase().includes(searchQuery.value.toLowerCase()))
  return list
})

const hasMoreActive = computed(() => (songStore as any).hasMoreSongs ?? false)

const calcApproval = (likes?: number|null, dislikes?: number|null) => {
  const l = likes || 0, d = dislikes || 0
  const t = l + d
  if (!t) return 'N/A'
  return Math.round((l / t) * 100)
}

const getApprovalRateNumber = (likes?: number|null, dislikes?: number|null) => {
  const l = likes || 0, d = dislikes || 0
  const t = l + d
  if (!t) return 0
  return (l / t) * 100
}

const getStatusPills = (song: any) => {
  const pills = []
  
  // Moderation statuses (can show with other pills)
  if (song.status === 'under_review') {
    pills.push({ 
      text: 'Under Review', 
      class: 'bg-yellow-400/10 text-yellow-400',
      showInfoIcon: true 
    })
  } else if (song.status === 'removed') {
    pills.push({ 
      text: 'Removed', 
      class: 'bg-red-500/10 text-red-500',
      showInfoIcon: true 
    })
  } else {
    // Only show Active/Churn statuses if NOT under moderation
    if (song.is_active && song.churnState?.week < 4) {
      pills.push({ 
        text: 'Active', 
        class: 'bg-green-400/10 text-green-400',
        showInfoIcon: false 
      })
    }
    
    if (!song.is_active && song.churnState?.week === 4) {
      pills.push({ 
        text: 'Churn Completed', 
        class: 'bg-gray-400/10 text-gray-400',
        showInfoIcon: false 
      })
    }
  }
  
  // Show "Pending Final Score" as plain black text (no pill background)
  if (!song.churnState?.finalScore) {
    pills.push({ 
      text: 'Pending Final Score', 
      class: 'text-black',  // Plain black text, no background pill
      showInfoIcon: false 
    })
  }
  
  if (!song.is_active && song.churnState?.finalScore) {
    pills.push({ 
      text: `Final Score: ${song.churnState.finalScore}`, 
      class: 'bg-yellow-400/10 text-yellow-400',
      showInfoIcon: false 
    })
  }
  
  return pills
}

const getStatusMessage = (song: any) => {
  const reason = song.status_change_reason || ''
  const reasonSegment = reason ? ` for ${reason}` : ' after reaching our report threshold'
  const lastUpdate = song.status_changed_at ? ` Last update: ${formatDate(song.status_changed_at)}.` : ''
  
  if (song.status === 'under_review') {
    return `Your song is under review${reasonSegment}. It is temporarily paused from battles.${lastUpdate}<br><br>To appeal please email: <a href="mailto:policy@songwars.com" class="text-blue-600 hover:text-blue-800 underline">policy@songwars.com</a>`
  }
  
  if (song.status === 'removed') {
    const details = reason && !reason.includes('threshold') ? ` Details: ${reason}.` : ''
    return `Your song was removed following a review${reasonSegment}.${details}${lastUpdate}<br><br>To appeal please email: <a href="mailto:policy@songwars.com" class="text-blue-600 hover:text-blue-800 underline">policy@songwars.com</a>`
  }
  
  return ''
}

const getProgressOffset = (songId: string) => {
  const circumference = 2 * Math.PI * 34
  // Only show progress for the currently playing song
  const progressValue = audio.currentSongId.value === songId ? audio.progress.value : 0
  return circumference * (1 - progressValue / 100)
}

const toggleSong = async (song: any) => {
  if (!song?.url) return
  
  await audio.togglePlay({
    songId: song.id,
    audioUrl: song.url,
    clipStartTime: 0
  })
}

const retryAudio = async (songId: string) => {
  const song = songStore.songs.find(s => s.id === songId)
  if (!song?.url) return
  
  await toggleSong(song)
}

// Tag tooltip and status modal now handled in MySongCard component

const openDelete = (song: any) => {
  songToDelete.value = song
  showDeleteModal.value = true
}

const closeHardDelete = () => {
  showHardDeleteModal.value = false
  songToHardDelete.value = null
  songNameConfirmation.value = ''
}

const openEdit = async (song: any) => {
  editingSongId.value = song.id
  editForm.value = { 
    title: song.title, 
    artist: song.artist, 
    genre: song.genre, 
    url: song.url || song.audioUrl, 
    clipStartTime: song.clip_start_time || 0 
  }
  
  // Load battle-ready genres for dropdown
  await uploadStore.loadBattleReadyGenres()
  
  showEditModal.value = true
}

const saveEdit = async () => {
  if (!editingSongId.value) return
  try {
    await songStore.updateSong?.(editingSongId.value, {
      title: editForm.value.title,
      artist: editForm.value.artist,
      genre: editForm.value.genre,
      clip_start_time: editForm.value.clipStartTime
    })
    showEditModal.value = false
  } catch (e) {
    console.error('save edit failed', e)
  }
}

const canConfirmHardDelete = computed(() => songNameConfirmation.value === songToHardDelete.value?.title)

// Trash action handlers
const restoreSong = async (songId: string) => {
  restoringSong.value = songId
  try {
    const success = await songStore.restoreSong(songId)
    if (success) {
      // Refresh active songs to show restored song
      await songStore.fetchSongs()
    }
  } finally {
    restoringSong.value = null
  }
}

const confirmHardDelete = (song: any) => {
  songToHardDelete.value = song
  songNameConfirmation.value = ''
  showHardDeleteModal.value = true
}

const hardDeleteSong = async () => {
  if (!songToHardDelete.value) return
  
  hardDeleting.value = true
  try {
    const success = await songStore.hardDeleteSong(songToHardDelete.value.id)
    if (success) {
      closeHardDelete()
    }
  } finally {
    hardDeleting.value = false
  }
}

const loadMore = async () => {
  if (loadingMore.value) return
  loadingMore.value = true
  try {
    await songStore.loadMoreSongs()
  } finally {
    loadingMore.value = false
  }
}

const confirmDelete = async () => {
  if (!songToDelete.value) return
  
  deleting.value = true
  try {
    const success = await songStore.softDeleteSong(songToDelete.value.id)
    if (success) {
      showDeleteModal.value = false
      songToDelete.value = null
    }
  } finally {
    deleting.value = false
  }
}

const formatDate = (iso?: string|null) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
}

const getTrashExpiryText = (trashExpiresAt: string | null) => {
  if (!trashExpiresAt) return 'Unknown expiry'
  
  const now = new Date()
  const expiry = new Date(trashExpiresAt)
  const diffMs = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 0) {
    return 'Expires today'
  } else if (diffDays === 1) {
    return 'Expires tomorrow'
  } else {
    return `Expires in ${diffDays} days`
  }
}

// Simple debounce for search UX
let searchTimeout: any
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {}, 300)
})

// Watch for tab changes to fetch trashed songs
watch(activeTab, async (newTab) => {
  if (newTab === 'trash') {
    await songStore.fetchTrashedSongs()
  }
})

// Tag counts now loaded individually by each MySongCard component on mount

// Mobile detection
watch(
  () => props.refreshKey,
  async () => {
    isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    loadingMore.value = false
    songStore.clearSongs()
    try {
      await songStore.fetchSongs()
      if (activeTab.value === 'trash') {
        await songStore.fetchTrashedSongs()
      } else {
        songStore.fetchTrashedSongs()
      }
    } catch (e) {
      console.error('Failed to fetch songs', e)
    } finally {
      initialLoadComplete.value = true
    }
  },
  { immediate: true }
)

onMounted(() => {
  // Infinite scroll (200px threshold)
  const onScroll = () => {
    if (activeTab.value !== 'active' || !songStore.loadMoreSongs) return
    const scrollTop = window.scrollY
    const windowH = window.innerHeight
    const docH = document.documentElement.scrollHeight
    if (scrollTop + windowH >= docH - 200) {
      loadMore()
    }
  }
  window.addEventListener('scroll', onScroll)
  cleanupFns.push(() => window.removeEventListener('scroll', onScroll))
})

// Optional: clean up listeners
const cleanupFns: Array<() => void> = []
onUnmounted(() => { cleanupFns.forEach(fn => fn()) })
</script>

<style scoped>
</style>
