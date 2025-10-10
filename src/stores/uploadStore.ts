import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UploadProgress {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
  songId?: string
  startTime: number
  estimatedTimeRemaining?: number
}

export const useUploadStore = defineStore('upload', () => {
  // State
  const uploads = ref<UploadProgress[]>([])
  const isUploading = ref(false)
  const maxConcurrentUploads = ref(3)

  // Getters
  const activeUploads = computed(() => 
    uploads.value.filter(upload => 
      upload.status === 'pending' || 
      upload.status === 'uploading' || 
      upload.status === 'processing'
    )
  )

  const completedUploads = computed(() => 
    uploads.value.filter(upload => upload.status === 'completed')
  )

  const failedUploads = computed(() => 
    uploads.value.filter(upload => upload.status === 'error')
  )

  const totalProgress = computed(() => {
    if (uploads.value.length === 0) return 0
    
    const totalProgress = uploads.value.reduce((sum, upload) => sum + upload.progress, 0)
    return Math.round(totalProgress / uploads.value.length)
  })

  const canUploadMore = computed(() => 
    activeUploads.value.length < maxConcurrentUploads.value
  )

  // Actions
  const addUpload = (file: File) => {
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const upload: UploadProgress = {
      id: uploadId,
      file,
      progress: 0,
      status: 'pending',
      startTime: Date.now()
    }

    uploads.value.push(upload)
    return uploadId
  }

  const updateUploadProgress = (uploadId: string, progress: number, status?: UploadProgress['status']) => {
    const upload = uploads.value.find(u => u.id === uploadId)
    if (upload) {
      upload.progress = Math.min(Math.max(progress, 0), 100)
      
      if (status) {
        upload.status = status
      }

      // Calculate estimated time remaining
      if (progress > 0 && upload.status === 'uploading') {
        const elapsed = Date.now() - upload.startTime
        const rate = progress / elapsed
        const remaining = (100 - progress) / rate
        upload.estimatedTimeRemaining = Math.max(0, remaining)
      }
    }
  }

  const setUploadError = (uploadId: string, error: string) => {
    const upload = uploads.value.find(u => u.id === uploadId)
    if (upload) {
      upload.status = 'error'
      upload.error = error
      upload.progress = 0
    }
  }

  const setUploadCompleted = (uploadId: string, songId: string) => {
    const upload = uploads.value.find(u => u.id === uploadId)
    if (upload) {
      upload.status = 'completed'
      upload.progress = 100
      upload.songId = songId
      upload.estimatedTimeRemaining = 0
    }
  }

  const removeUpload = (uploadId: string) => {
    const index = uploads.value.findIndex(u => u.id === uploadId)
    if (index !== -1) {
      uploads.value.splice(index, 1)
    }
  }

  const clearCompletedUploads = () => {
    uploads.value = uploads.value.filter(upload => upload.status !== 'completed')
  }

  const clearFailedUploads = () => {
    uploads.value = uploads.value.filter(upload => upload.status !== 'error')
  }

  const clearAllUploads = () => {
    uploads.value = []
  }

  const retryUpload = (uploadId: string) => {
    const upload = uploads.value.find(u => u.id === uploadId)
    if (upload && upload.status === 'error') {
      upload.status = 'pending'
      upload.progress = 0
      upload.error = undefined
      upload.startTime = Date.now()
    }
  }

  const validateFile = (file: File) => {
    const errors: string[] = []
    const maxSize = 50 * 1024 * 1024 // 50MB
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/flac']

    if (file.size > maxSize) {
      errors.push('File size must be less than 50MB')
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push('File must be an audio file (MP3, WAV, M4A, FLAC)')
    }

    if (file.name.length > 100) {
      errors.push('Filename must be less than 100 characters')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getUploadStats = () => {
    const total = uploads.value.length
    const completed = completedUploads.value.length
    const failed = failedUploads.value.length
    const active = activeUploads.value.length
    
    return {
      total,
      completed,
      failed,
      active,
      successRate: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }

  const pauseUpload = (uploadId: string) => {
    const upload = uploads.value.find(u => u.id === uploadId)
    if (upload && upload.status === 'uploading') {
      // In a real implementation, you would pause the actual upload
      // For now, just mark as pending
      upload.status = 'pending'
    }
  }

  const resumeUpload = (uploadId: string) => {
    const upload = uploads.value.find(u => u.id === uploadId)
    if (upload && upload.status === 'pending') {
      // In a real implementation, you would resume the actual upload
      upload.status = 'uploading'
    }
  }

  const cancelUpload = (uploadId: string) => {
    const upload = uploads.value.find(u => u.id === uploadId)
    if (upload && (upload.status === 'uploading' || upload.status === 'pending')) {
      // In a real implementation, you would cancel the actual upload
      upload.status = 'error'
      upload.error = 'Upload cancelled by user'
    }
  }

  return {
    // State
    uploads,
    isUploading,
    maxConcurrentUploads,
    
    // Getters
    activeUploads,
    completedUploads,
    failedUploads,
    totalProgress,
    canUploadMore,
    
    // Actions
    addUpload,
    updateUploadProgress,
    setUploadError,
    setUploadCompleted,
    removeUpload,
    clearCompletedUploads,
    clearFailedUploads,
    clearAllUploads,
    retryUpload,
    validateFile,
    formatFileSize,
    formatDuration,
    getUploadStats,
    pauseUpload,
    resumeUpload,
    cancelUpload,
  }
})
