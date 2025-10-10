<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>My Songs</ion-title>
        <ion-buttons slot="end">
          <ThemeToggle />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <!-- Upload Button -->
      <div class="upload-section">
        <ion-button 
          expand="block"
          class="bigbutton upload-button"
          @click="showUploadModal = true"
        >
          <ion-icon :icon="add" slot="start" />
          Upload New Song
        </ion-button>
      </div>
      
      <!-- Tabs for Active/Deleted Songs -->
      <ion-segment v-model="selectedTab" @ionChange="handleTabChange">
        <ion-segment-button value="active">
          <ion-label>Active ({{ activeSongs.length }})</ion-label>
        </ion-segment-button>
        <ion-segment-button value="deleted">
          <ion-label>Trash ({{ deletedSongs.length }})</ion-label>
        </ion-segment-button>
      </ion-segment>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <ion-spinner name="crescent" color="primary" />
        <p>Loading songs...</p>
      </div>
      
      <!-- Active Songs -->
      <div v-else-if="selectedTab === 'active'" class="songs-container">
        <div v-if="activeSongs.length === 0" class="no-songs">
          <ion-icon :icon="musicalNotes" class="no-songs-icon" />
          <h3>No Songs Yet</h3>
          <p>Upload your first song to get started!</p>
        </div>
        
        <SongCard 
          v-for="song in activeSongs" 
          :key="song.id"
          :song="song"
          :show-stats="true"
          :show-play-button="true"
          @play="handlePlay"
        />
      </div>
      
      <!-- Deleted Songs (Trash) -->
      <div v-else class="songs-container">
        <div v-if="deletedSongs.length === 0" class="no-songs">
          <ion-icon :icon="trash" class="no-songs-icon" />
          <h3>Trash is Empty</h3>
          <p>Deleted songs will appear here</p>
        </div>
        
        <ion-card 
          v-for="song in deletedSongs" 
          :key="song.id"
          class="deleted-song-card"
        >
          <ion-card-content>
            <div class="song-info">
              <h4>{{ song.title }}</h4>
              <p>{{ song.artist }}</p>
              <p class="deleted-date">Deleted {{ formatDate(song.deleted_at) }}</p>
            </div>
            <div class="song-actions">
              <ion-button 
                fill="outline"
                size="small"
                @click="restoreSong(song.id)"
              >
                <ion-icon :icon="arrowUndo" slot="start" />
                Restore
              </ion-button>
              <ion-button 
                fill="clear"
                size="small"
                color="danger"
                @click="permanentlyDelete(song.id)"
              >
                <ion-icon :icon="trashBin" slot="icon-only" />
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
      
      <!-- Upload Modal -->
      <ion-modal :is-open="showUploadModal" @didDismiss="showUploadModal = false">
        <ion-header>
          <ion-toolbar>
            <ion-title>Upload Song</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="showUploadModal = false">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <form @submit.prevent="handleUpload">
            <ion-item>
              <ion-label position="stacked">Title *</ion-label>
              <ion-input v-model="uploadForm.title" required />
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Artist *</ion-label>
              <ion-input v-model="uploadForm.artist" required />
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Genre *</ion-label>
              <ion-select v-model="uploadForm.genre" required>
                <ion-select-option value="pop">Pop</ion-select-option>
                <ion-select-option value="rock">Rock</ion-select-option>
                <ion-select-option value="hip-hop">Hip Hop</ion-select-option>
                <ion-select-option value="electronic">Electronic</ion-select-option>
                <ion-select-option value="country">Country</ion-select-option>
                <ion-select-option value="jazz">Jazz</ion-select-option>
                <ion-select-option value="classical">Classical</ion-select-option>
                <ion-select-option value="other">Other</ion-select-option>
              </ion-select>
            </ion-item>
            
            <ion-item>
              <ion-label position="stacked">Audio File *</ion-label>
              <input 
                type="file" 
                accept="audio/*"
                @change="handleFileSelect"
                class="file-input"
              />
            </ion-item>
            
            <ion-button 
              expand="block"
              type="submit"
              class="bigbutton"
              :disabled="isUploading || !uploadForm.file"
            >
              {{ isUploading ? 'Uploading...' : 'Upload Song' }}
            </ion-button>
          </form>
          
          <UploadProgress 
            v-if="uploadProgress > 0"
            :file-name="uploadForm.file?.name || ''"
            :file-size="uploadForm.file?.size || 0"
            :progress="uploadProgress"
            :status="uploadStatus"
          />
        </ion-content>
      </ion-modal>
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
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardContent,
  IonModal,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption
} from '@ionic/vue'
import { add, musicalNotes, trash, arrowUndo, trashBin } from 'ionicons/icons'
import { ref, computed, onMounted } from 'vue'
import { useSongStore } from '@/stores/songStore'
import SongCard from '@/components/core/SongCard.vue'
import ThemeToggle from '@/components/core/ThemeToggle.vue'
import UploadProgress from '@/components/core/UploadProgress.vue'

const songStore = useSongStore()

const selectedTab = ref('active')
const isLoading = ref(false)
const showUploadModal = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref<'uploading' | 'processing' | 'completed' | 'error' | 'cancelled'>('uploading')

const uploadForm = ref({
  title: '',
  artist: '',
  genre: '',
  file: null as File | null
})

const activeSongs = computed(() => songStore.userSongs)
const deletedSongs = computed(() => songStore.deletedSongs)

const loadSongs = async () => {
  isLoading.value = true
  try {
    await songStore.fetchSongs()
  } catch (error) {
    console.error('Failed to load songs:', error)
  } finally {
    isLoading.value = false
  }
}

const handleTabChange = (event: CustomEvent) => {
  selectedTab.value = event.detail.value
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    uploadForm.value.file = target.files[0]
  }
}

const handleUpload = async () => {
  if (!uploadForm.value.file) return
  
  isUploading.value = true
  uploadProgress.value = 0
  uploadStatus.value = 'uploading'
  
  try {
    // Simulate progress
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 200)
    
    const result = await songStore.uploadSong({
      file: uploadForm.value.file,
      title: uploadForm.value.title,
      artist: uploadForm.value.artist,
      genre: uploadForm.value.genre
    })
    
    clearInterval(progressInterval)
    uploadProgress.value = 100
    uploadStatus.value = 'completed'
    
    if (result.success) {
      // Reset form
      uploadForm.value = {
        title: '',
        artist: '',
        genre: '',
        file: null
      }
      
      // Close modal after a delay
      setTimeout(() => {
        showUploadModal.value = false
        uploadProgress.value = 0
      }, 1500)
    } else {
      uploadStatus.value = 'error'
    }
  } catch (error) {
    console.error('Upload failed:', error)
    uploadStatus.value = 'error'
  } finally {
    isUploading.value = false
  }
}

const handlePlay = (song: any) => {
  console.log('Playing song:', song)
  // TODO: Implement audio playback
}

const restoreSong = async (songId: string) => {
  try {
    await songStore.restoreSong(songId)
  } catch (error) {
    console.error('Failed to restore song:', error)
  }
}

const permanentlyDelete = async (songId: string) => {
  try {
    await songStore.permanentlyDeleteSong(songId)
  } catch (error) {
    console.error('Failed to delete song:', error)
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}

onMounted(() => {
  loadSongs()
})
</script>

<style scoped>
.upload-section {
  padding: 1rem;
}

.upload-button {
  margin-bottom: 0;
}

ion-segment {
  margin: 1rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  gap: 1rem;
  color: var(--text-secondary);
}

.songs-container {
  padding: 1rem;
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

.no-songs h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.no-songs p {
  color: var(--text-secondary);
}

.deleted-song-card {
  margin-bottom: 1rem;
  opacity: 0.7;
}

.deleted-song-card ion-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.song-info h4 {
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
}

.song-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.deleted-date {
  font-size: 0.8rem !important;
  color: var(--text-muted) !important;
}

.song-actions {
  display: flex;
  gap: 0.5rem;
}

.file-input {
  width: 100%;
  padding: 0.5rem 0;
  color: var(--text-primary);
}
</style>