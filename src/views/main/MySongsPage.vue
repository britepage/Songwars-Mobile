<template>
  <ion-page>
    <ion-content :fullscreen="true" class="theme-bg-primary">
      <div class="min-h-screen p-4 md:p-8 pt-28 pb-[8em] theme-bg-primary">
        <div class="max-w-6xl mx-auto">
          <!-- Header -->
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              </div>
              <div>
                <h1 class="text-2xl md:text-3xl font-bold text-white theme-text-primary">Your Songs</h1>
                <p class="text-gray-400 theme-text-secondary">Manage your uploaded tracks</p>
              </div>
            </div>
          </div>

          <!-- Song List -->
          <SongList />
        </div>
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
import { IonPage, IonContent, IonButton, IonButtons, IonModal, IonItem, IonInput, IonSelect, IonSelectOption, IonHeader, IonToolbar, IonTitle, IonLabel } from '@ionic/vue'
import { ref, onMounted } from 'vue'
import { useSongStore } from '@/stores/songStore'
import SongList from '@/components/dashboard/SongList.vue'
import UploadProgress from '@/components/core/UploadProgress.vue'

const songStore = useSongStore()

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

// SongList handles its own tabs/filters/data

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

onMounted(async () => {
  // Profile is fetched centrally in App.vue
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