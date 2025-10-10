<template>
  <ion-card class="song-uploader-card">
    <ion-card-header>
      <ion-card-title>Upload New Song</ion-card-title>
      <ion-card-subtitle>Share your music with the community</ion-card-subtitle>
    </ion-card-header>
    
    <ion-card-content>
      <form @submit.prevent="handleSubmit">
        <!-- Title Input -->
        <ion-item>
          <ion-label position="stacked">Song Title *</ion-label>
          <ion-input
            v-model="formData.title"
            placeholder="Enter song title"
            required
          />
        </ion-item>
        
        <!-- Artist Input -->
        <ion-item>
          <ion-label position="stacked">Artist Name *</ion-label>
          <ion-input
            v-model="formData.artist"
            placeholder="Enter artist name"
            required
          />
        </ion-item>
        
        <!-- Genre Select -->
        <ion-item>
          <ion-label position="stacked">Genre *</ion-label>
          <ion-select v-model="formData.genre" placeholder="Select genre" required>
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
        
        <!-- File Input -->
        <div class="file-input-section">
          <ion-label>Audio File *</ion-label>
          <div class="file-input-container">
            <input
              type="file"
              accept="audio/*"
              @change="handleFileSelect"
              ref="fileInput"
              class="hidden-input"
            />
            <ion-button
              fill="outline"
              @click="triggerFileInput"
              class="file-select-button"
            >
              <ion-icon :icon="musicalNotes" slot="start" />
              {{ selectedFileName || 'Choose Audio File' }}
            </ion-button>
          </div>
        </div>
        
        <!-- Upload Button -->
        <ion-button
          expand="block"
          type="submit"
          class="bigbutton upload-button"
          :disabled="!canSubmit || isUploading"
        >
          {{ isUploading ? 'Uploading...' : 'Upload Song' }}
        </ion-button>
      </form>
      
      <!-- Upload Progress -->
      <UploadProgress
        v-if="showProgress"
        :file-name="selectedFileName"
        :file-size="fileSize"
        :progress="uploadProgress"
        :status="uploadStatus"
        :error-message="uploadError"
      />
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon
} from '@ionic/vue'
import { musicalNotes } from 'ionicons/icons'
import { ref, computed } from 'vue'
import { useSongStore } from '@/stores/songStore'
import UploadProgress from '@/components/core/UploadProgress.vue'

const songStore = useSongStore()

const fileInput = ref<HTMLInputElement | null>(null)
const formData = ref({
  title: '',
  artist: '',
  genre: ''
})
const selectedFile = ref<File | null>(null)
const selectedFileName = ref('')
const fileSize = ref(0)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref<'uploading' | 'processing' | 'completed' | 'error' | 'cancelled'>('uploading')
const uploadError = ref<string | undefined>(undefined)
const showProgress = ref(false)

const emit = defineEmits<{
  uploadComplete: [songId: string]
  uploadError: [error: string]
}>()

const canSubmit = computed(() => {
  return formData.value.title && 
         formData.value.artist && 
         formData.value.genre && 
         selectedFile.value
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
    selectedFileName.value = target.files[0].name
    fileSize.value = target.files[0].size
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value || !selectedFile.value) return
  
  isUploading.value = true
  showProgress.value = true
  uploadProgress.value = 0
  uploadStatus.value = 'uploading'
  uploadError.value = undefined
  
  try {
    // Simulate progress
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 200)
    
    const result = await songStore.uploadSong({
      file: selectedFile.value,
      title: formData.value.title,
      artist: formData.value.artist,
      genre: formData.value.genre
    })
    
    clearInterval(progressInterval)
    uploadProgress.value = 100
    
    if (result.success) {
      uploadStatus.value = 'completed'
      
      // Reset form
      formData.value = { title: '', artist: '', genre: '' }
      selectedFile.value = null
      selectedFileName.value = ''
      
      if (result.data) {
        emit('uploadComplete', result.data.id)
      }
      
      // Hide progress after delay
      setTimeout(() => {
        showProgress.value = false
        uploadProgress.value = 0
      }, 2000)
    } else {
      uploadStatus.value = 'error'
      uploadError.value = result.error || 'Upload failed'
      emit('uploadError', uploadError.value)
    }
  } catch (error) {
    uploadStatus.value = 'error'
    uploadError.value = error instanceof Error ? error.message : 'Upload failed'
    emit('uploadError', uploadError.value)
  } finally {
    isUploading.value = false
  }
}
</script>

<style scoped>
.song-uploader-card {
  margin: 1rem;
}

ion-item {
  --background: var(--card-bg);
  --border-color: var(--border-color);
  margin-bottom: 1rem;
}

.file-input-section {
  margin: 1rem 0;
}

.file-input-section ion-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.file-input-container {
  position: relative;
}

.hidden-input {
  display: none;
}

.file-select-button {
  width: 100%;
  --border-color: var(--border-color);
  text-transform: none;
  font-weight: normal;
}

.upload-button {
  margin-top: 1.5rem;
}
</style>
