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
    <div v-if="songStore.loadingSongs" class="text-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffd200] mx-auto"></div>
      <p class="mt-4 text-gray-400">Loading songs...</p>
    </div>

    <!-- Active Songs Empty State -->
    <div v-else-if="!songStore.loadingSongs && filteredActiveSongs.length === 0 && !selectedGenre && !searchQuery" class="text-center py-12">
      <div class="text-gray-400 text-6xl mb-4">🎵</div>
      <p class="text-gray-400 text-lg">No songs uploaded yet</p>
      <p class="text-gray-500 mt-2">Your uploaded songs will appear here</p>
    </div>

    <!-- Active Songs Grid -->
    <div v-if="activeTab==='active' && filteredActiveSongs.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="song in filteredActiveSongs" :key="song.id" class="border rounded-xl p-6 text-center flex flex-col justify-between transition-all duration-300 border-gray-700 bg-gray-800 theme-bg-card theme-border-card">
        <div>
          <!-- Play Circle with Loading/Error States -->
          <div class="mb-4">
            <div class="w-16 h-16 mx-auto mb-2 relative cursor-pointer group" @click="audioErrors[song.id] ? retryAudio(song.id) : toggleSong(song)">
              <!-- Loading State -->
              <div v-if="audioLoading[song.id]" class="absolute inset-0 flex items-center justify-center z-20">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffd200]"></div>
              </div>
              
              <!-- Error State -->
              <div v-else-if="audioErrors[song.id]" class="absolute inset-0 flex items-center justify-center z-20">
                <svg class="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              
              <!-- Normal Play/Pause State -->
              <div v-else class="absolute inset-0 flex items-center justify-center z-10">
                <svg v-if="!isPlaying(song.id)" class="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <svg v-else class="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              </div>
              
              <!-- Progress Ring -->
              <svg class="w-[72px] h-[72px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-90 z-0">
                <circle
                  cx="36"
                  cy="36"
                  r="34"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                  class="text-gray-800"
                />
                <circle
                  cx="36"
                  cy="36"
                  r="34"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                  :stroke-dasharray="2 * Math.PI * 34"
                  :stroke-dashoffset="getProgressOffset(song.id)"
                  class="text-[#ffd200] transition-all duration-200"
                />
              </svg>
              
              <!-- Background Circle -->
              <div class="absolute inset-0 rounded-full transition-colors z-0 border-2 border-gray-600"></div>
            </div>
            
            <!-- Error Message -->
            <div v-if="audioErrors[song.id]" class="text-xs text-red-500 text-center mb-2">
              Audio failed to load
            </div>
            
            <!-- Mobile Audio Info -->
            <div v-if="isMobile && audioErrors[song.id]" class="text-xs text-gray-500 text-center">
              Tap to retry
            </div>
          </div>
          <!-- Title with Tag Indicator -->
          <h3 class="font-semibold text-white text-lg mb-1 break-words flex items-center justify-center relative theme-text-primary">
            {{ song.title }}
            <!-- Tag indicator -->
            <svg v-if="songTagCounts[song.id] > 0" 
                 class="inline-block w-3 h-3 ml-1 text-[#ffd200] cursor-pointer" 
                 fill="currentColor" 
                 viewBox="0 0 24 24"
                 @click="showTagTooltip(song.id)"
                 :title="`Tags: ${songTagCounts[song.id]}`">
              <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            <!-- Tag count tooltip -->
            <div v-if="showTagTooltipId === song.id" 
                 class="absolute top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
              Tags: {{ songTagCounts[song.id] }}
              <div class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
            </div>
          </h3>
          <!-- Artist -->
          <p class="text-gray-400 text-sm mb-4 italic">{{ song.artist }}</p>
          <!-- Metrics Row -->
          <p class="text-gray-300 text-sm flex items-center justify-center space-x-3">
            <span>Total Votes: {{ (song.likes||0) + (song.dislikes||0) }}</span>
            <span class="text-gray-500">|</span>
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
          <!-- Upload Timestamp -->
          <p class="text-xs text-gray-500 mt-3">Uploaded: {{ formatDate(song.created_at) }}</p>
          <!-- Status Pills -->
          <div class="mt-4 flex items-center justify-center space-x-1">
            <span class="px-3 py-1.5 rounded-full text-xs font-medium"
              :class="getStatusPill(song).class">
              {{ getStatusPill(song).text }}
            </span>
            
            <!-- Info icon for moderation statuses -->
            <div v-if="song.status === 'under_review' || song.status === 'removed'" class="relative inline-block">
              <button
                @click.stop="toggleStatusInfo(song.id)"
                class="inline-flex items-center justify-center w-5 h-5 text-gray-400 hover:text-white focus:outline-none cursor-pointer"
                :aria-expanded="openInfoForId === song.id"
                title="More info"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </button>
              <!-- Popover content would go here -->
            </div>
          </div>
          <div class="mt-4 flex justify-center space-x-2">
            <button @click="openEdit(song)" class="px-3 py-2 bg-[#ffd200] text-black rounded-lg hover:bg-[#e6bd00] transition-colors text-sm font-medium">Edit</button>
            <button @click="openDelete(song)" class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Trash Empty State -->
    <div v-if="activeTab==='trash'" class="text-center py-12">
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
      <div class="bg-gray-900 rounded-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-white">Delete Song</h3>
            <button @click="showDeleteModal=false" class="text-gray-400 hover:text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="mb-6">
            <p class="text-gray-300 mb-4">
              Are you sure you want to delete "<strong>{{ songToDelete?.title }}</strong>" by {{ songToDelete?.artist }}?
            </p>
            <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p class="text-yellow-400 text-sm">
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
              class="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Hard Delete Modal -->
    <div v-if="showHardDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-900 rounded-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-white">Permanently Delete Song</h3>
            <button @click="closeHardDelete" class="text-gray-400 hover:text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="mb-6">
            <p class="text-gray-300 mb-4">
              Are you absolutely sure you want to <strong>permanently delete</strong> "<strong>{{ songToHardDelete?.title }}</strong>" by {{ songToHardDelete?.artist }}?
            </p>
            <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p class="text-red-400 text-sm">
                <strong>Warning:</strong> This action cannot be undone. The song will be permanently removed from the system and all associated files will be deleted.
              </p>
            </div>
            
            <!-- Song name confirmation input -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-300 mb-2">
                Type the song name to confirm: <strong>"{{ songToHardDelete?.title }}"</strong>
              </label>
              <input
                v-model="songNameConfirmation"
                type="text"
                class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400"
                placeholder="Enter song name to confirm"
              />
            </div>
          </div>
          
          <div class="flex space-x-3">
            <button
              @click="confirmHardDelete"
              :disabled="hardDeleting || !canConfirmHardDelete"
              class="flex-1 px-4 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {{ hardDeleting ? 'Deleting...' : 'Delete Permanently' }}
            </button>
            <button
              @click="closeHardDelete"
              class="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div class="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[calc(100vh-8rem)] overflow-y-auto">
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-white">Edit Song</h3>
            <button @click="showEditModal=false" class="text-gray-400 hover:text-white">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Title</label>
              <input v-model="editForm.title" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-[#ffd200] focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Artist</label>
              <input v-model="editForm.artist" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-[#ffd200] focus:border-transparent" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Genre</label>
              <input v-model="editForm.genre" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-[#ffd200] focus:border-transparent" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">Clip Start (preview)</label>
            <WaveformSelectorDual v-if="editForm.url" :audio-url="editForm.url" :initial-clip-start="editForm.clipStartTime || 0" @clip-changed="(t:number)=>editForm.clipStartTime=t" />
          </div>
          <div class="flex justify-end space-x-3 pt-2">
            <button @click="showEditModal=false" class="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700">Cancel</button>
            <button @click="saveEdit" class="px-4 py-2 rounded-lg bg-[#ffd200] text-black hover:bg-[#e6bd00]">Save</button>
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
import WaveformSelectorDual from '@/components/dashboard/WaveformSelectorDual.vue'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'

const songStore = useSongStore()
const audio = useHowlerPlayer()

const activeTab = ref<'active'|'trash'>('active')
const selectedGenre = ref('')
const searchQuery = ref('')

// Headless UI Listbox positioning state
const listboxOpen = ref(false)
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

// Tag and status states
const songTagCounts = ref<{ [key: string]: number }>({})
const showTagTooltipId = ref<string | null>(null)
const openInfoForId = ref<string | null>(null)

// Audio player states - adapt Howler to existing interface
const isMobile = ref(false)

// Helper functions to adapt Howler player to song-specific interface
const isPlaying = (songId: string) => audio.currentSongId.value === songId && audio.isPlaying.value
const audioLoading = computed(() => ({ [audio.currentSongId.value || '']: audio.isLoading.value }))
const audioErrors = computed(() => ({ [audio.currentSongId.value || '']: audio.error.value || '' }))

// Edit form
const editForm = ref<any>({ title: '', artist: '', genre: '', url: '', clipStartTime: 0 })

const totalActiveCount = computed(() => songStore.songs?.length || 0)
const trashedCount = computed(() => songStore.deletedSongs?.length || 0)

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

const clearAllFilters = () => {
  selectedGenre.value = ''
  searchQuery.value = ''
}

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

const getStatusPill = (song: any) => {
  if (song.status === 'live' || song.is_active) {
    return { text: 'Active', class: 'bg-green-400/10 text-green-400' }
  }
  if (song.status === 'under_review') {
    return { text: 'Under Review', class: 'bg-yellow-400/10 text-yellow-400' }
  }
  if (song.status === 'removed') {
    return { text: 'Removed', class: 'bg-red-500/10 text-red-500' }
  }
  return { text: 'Pending Final Score', class: 'bg-gray-400/10 text-gray-400' }
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
    clipStartTime: song.clip_start_time || 0,
    autoStopAfter: 30
  })
}

const retryAudio = async (songId: string) => {
  const song = songStore.songs.find(s => s.id === songId)
  if (!song?.url) return
  
  await toggleSong(song)
}

const showTagTooltip = (songId: string) => {
  showTagTooltipId.value = showTagTooltipId.value === songId ? null : songId
}

const toggleStatusInfo = (songId: string) => {
  openInfoForId.value = openInfoForId.value === songId ? null : songId
}

const openDelete = (song: any) => {
  songToDelete.value = song
  showDeleteModal.value = true
}

const openHardDelete = (song: any) => {
  songToHardDelete.value = song
  songNameConfirmation.value = ''
  showHardDeleteModal.value = true
}

const closeHardDelete = () => {
  showHardDeleteModal.value = false
  songToHardDelete.value = null
  songNameConfirmation.value = ''
}

const openEdit = (song: any) => {
  editingSongId.value = song.id
  editForm.value = { 
    title: song.title, 
    artist: song.artist, 
    genre: song.genre, 
    url: song.url || song.audioUrl, 
    clipStartTime: song.clip_start_time || 0 
  }
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

const formatDate = (iso?: string|null) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
}

// Simple debounce for search UX
let searchTimeout: any
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {}, 300)
})

// Mobile detection
onMounted(() => {
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  // Initial fetch
  try {
    songStore.fetchSongs()
  } catch (e) {
    console.error('Failed to fetch songs', e)
  }
  
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
