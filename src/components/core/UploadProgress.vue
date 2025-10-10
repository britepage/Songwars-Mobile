<template>
  <ion-card class="upload-progress-card" v-if="isVisible">
    <div class="card-content">
      <!-- File info -->
      <div class="file-info">
        <ion-icon :icon="musicalNotes" class="file-icon" />
        <div class="file-details">
          <h4 class="file-name">{{ fileName }}</h4>
          <p class="file-size">{{ formatFileSize(fileSize) }}</p>
        </div>
      </div>
      
      <!-- Progress bar -->
      <div class="progress-section">
        <div class="progress-info">
          <span class="progress-text">{{ statusText }}</span>
          <span class="progress-percentage">{{ Math.round(progress) }}%</span>
        </div>
        <ion-progress-bar 
          :value="progress / 100" 
          :color="progressColor"
          class="progress-bar"
        />
      </div>
      
      <!-- Actions -->
      <div class="actions" v-if="showActions">
        <ion-button 
          v-if="canCancel"
          fill="outline" 
          color="danger"
          @click="handleCancel"
          size="small"
        >
          Cancel
        </ion-button>
        
        <ion-button 
          v-if="canRetry"
          fill="outline" 
          color="warning"
          @click="handleRetry"
          size="small"
        >
          Retry
        </ion-button>
        
        <ion-button 
          v-if="isCompleted"
          fill="solid" 
          color="success"
          @click="handleComplete"
          size="small"
        >
          Done
        </ion-button>
      </div>
    </div>
    
    <!-- Error message -->
    <div class="error-message" v-if="errorMessage">
      <ion-icon :icon="warning" class="error-icon" />
      <span>{{ errorMessage }}</span>
    </div>
  </ion-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonCard, IonIcon, IonProgressBar, IonButton } from '@ionic/vue'
import { musicalNotes, warning } from 'ionicons/icons'

type UploadStatus = 'uploading' | 'processing' | 'completed' | 'error' | 'cancelled'

interface Props {
  fileName: string
  fileSize: number
  progress: number
  status: UploadStatus
  errorMessage?: string
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true
})

const emit = defineEmits<{
  cancel: []
  retry: []
  complete: []
}>()

const isVisible = computed(() => {
  return props.status !== 'completed' || props.showActions
})

const statusText = computed(() => {
  switch (props.status) {
    case 'uploading': return 'Uploading...'
    case 'processing': return 'Processing...'
    case 'completed': return 'Upload complete!'
    case 'error': return 'Upload failed'
    case 'cancelled': return 'Upload cancelled'
    default: return 'Uploading...'
  }
})

const progressColor = computed(() => {
  switch (props.status) {
    case 'completed': return 'success'
    case 'error': return 'danger'
    case 'cancelled': return 'medium'
    default: return 'primary'
  }
})

const canCancel = computed(() => {
  return props.status === 'uploading' || props.status === 'processing'
})

const canRetry = computed(() => {
  return props.status === 'error'
})

const isCompleted = computed(() => {
  return props.status === 'completed'
})

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleCancel = () => {
  emit('cancel')
}

const handleRetry = () => {
  emit('retry')
}

const handleComplete = () => {
  emit('complete')
}
</script>

<style scoped>
.upload-progress-card {
  margin: 0.5rem;
  border-radius: 1rem;
  background: var(--card-bg);
  border: 2px solid var(--card-border);
  transition: all 0.3s ease;
}

.card-content {
  padding: 1.5rem;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.file-icon {
  font-size: 2rem;
  color: var(--ion-color-primary);
}

.file-details {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  word-break: break-all;
}

.file-size {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.progress-section {
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.progress-percentage {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 600;
}

.progress-bar {
  height: 8px;
  border-radius: 4px;
}

.actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: rgba(239, 68, 68, 0.1);
  border-top: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  font-size: 0.875rem;
}

.error-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

/* Animation for progress updates */
.upload-progress-card {
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Dark theme adjustments */
[data-theme="dark"] .upload-progress-card {
  background: #1f2937 !important;
  border-color: #4b5563 !important;
}

[data-theme="dark"] .error-message {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
}
</style>
