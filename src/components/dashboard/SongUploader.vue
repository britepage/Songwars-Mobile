<template>
  <div class="max-w-7xl mx-auto space-y-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Left Column - Main Upload Area (2/3 width on desktop) -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- Section 1: File Upload Section -->
        <div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
          <h3 class="text-lg font-semibold theme-text-primary mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
            </svg>
            Select Audio File
          </h3>
          
          <div 
            @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            :class="[
              'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer group border-[#e5e7eb]',
              isDragging ? 'border-[#ffd200]' : '',
              uploadStore.selectedFile ? 'bg-[#ffd200]/5' : ''
            ]"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".mp3,.wav,.m4a,.aac,.ogg,audio/*"
              @change="handleFileSelect"
              class="hidden"
            />
            
            <!-- Empty State -->
            <div v-if="!uploadStore.selectedFile" class="text-center">
              <div class="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg class="w-12 h-12 theme-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
                </svg>
              </div>
              <p class="text-xl font-medium theme-text-primary mb-2">Upload your song</p>
              <p class="theme-text-secondary">Drag and drop an audio file or <button @click="$refs.fileInput.click()" class="text-[#ffd200] font-medium hover:underline cursor-pointer outline-none focus:outline-none">browse</button></p>
              <p class="text-sm theme-text-muted mt-2">MP3, WAV, M4A up to 50MB</p>
            </div>
            
            <!-- File Selected State -->
            <div v-else class="space-y-3">
              <div class="w-16 h-16 mx-auto bg-[#ffd200] rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
              <div>
                <p class="text-lg font-medium text-[#ffd200]">{{ uploadStore.selectedFile.name }}</p>
                <div class="theme-text-secondary space-y-1">
                  <p>Original: {{ uploadStore.fileSizeFormatted }}</p>
                  <div v-if="uploadStore.needsFileConversion" class="text-sm">
                    <p class="text-green-400">After conversion: {{ uploadStore.estimatedFileSize }}</p>
                    <p class="text-green-300 text-xs">{{ uploadStore.compressionInfo }}</p>
                    <p v-if="uploadStore.selectedFile?.name.toLowerCase().endsWith('.wav')" class="text-yellow-400 text-xs mt-1">⚡ Converting to MP3 (may take 30-60s)</p>
                  </div>
                </div>
                <button
                  @click="uploadStore.removeFile()"
                  class="text-red-400 hover:text-red-300 text-sm font-medium mt-2 transition-colors"
                >
                  Remove file
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Section 2: Song Details Form -->
        <div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
          <h3 class="text-lg font-semibold theme-text-primary mb-6 flex items-center">
            <svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
            </svg>
            Song Details
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Song Title -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium theme-text-secondary mb-2">Song Title</label>
              <input
                v-model="uploadStore.songTitle"
                type="text"
                placeholder="Enter song title"
                class="w-full px-4 py-3 rounded-lg border theme-bg-card theme-border-card theme-text-primary focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all"
              />
            </div>
            
            <!-- Artist Name -->
            <div>
              <label class="block text-sm font-medium theme-text-secondary mb-2">Artist Name</label>
              <input
                v-model="uploadStore.artistName"
                type="text"
                placeholder="Enter artist name"
                class="w-full px-4 py-3 rounded-lg border theme-bg-card theme-border-card theme-text-primary focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all"
              />
            </div>
            
            <!-- Genre -->
            <div>
              <label class="block text-sm font-medium theme-text-secondary mb-2">Genre</label>
              <select
                v-model="uploadStore.selectedGenre"
                class="w-full px-4 py-3 rounded-lg border theme-bg-card theme-border-card theme-text-primary focus:ring-2 focus:ring-[#ffd200] focus:border-transparent transition-all appearance-none cursor-pointer"
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
        </div>
        
        <!-- Section 3: Waveform Clip Selection -->
        <div v-if="uploadStore.audioPreviewUrl" class="rounded-2xl p-6 border theme-bg-card theme-border-card">
          
          <WaveformSelectorDual
            :audio-url="uploadStore.audioPreviewUrl"
            :initial-clip-start="uploadStore.clipStartTime"
            @clip-changed="uploadStore.setClipStartTime"
          />
        </div>
      </div>
      
      <!-- Right Column - Upload Actions & Status (1/3 width on desktop) -->
      <div class="lg:col-span-1 space-y-6">
        
        <!-- Section 4: Upload Status Panel -->
        <div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
          <h3 class="text-lg font-semibold theme-text-primary mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Upload Status
          </h3>
          
          <div class="space-y-3">
            <!-- File Selected -->
            <div class="flex items-center justify-between">
              <span class="theme-text-secondary">File Selected</span>
              <div class="flex items-center">
                <div class="w-2 h-2 rounded-full mr-2" :class="uploadStore.selectedFile ? 'bg-green-400' : 'bg-gray-600'"></div>
                <span class="text-sm" :class="uploadStore.selectedFile ? 'text-green-400' : 'theme-text-muted'">
                  {{ uploadStore.selectedFile ? 'Yes' : 'No' }}
                </span>
              </div>
            </div>
            
            <!-- Details Complete -->
            <div class="flex items-center justify-between">
              <span class="theme-text-secondary">Details Complete</span>
              <div class="flex items-center">
                <div class="w-2 h-2 rounded-full mr-2" :class="uploadStore.hasCompleteDetails ? 'bg-green-400' : 'bg-gray-600'"></div>
                <span class="text-sm" :class="uploadStore.hasCompleteDetails ? 'text-green-400' : 'theme-text-muted'">
                  {{ uploadStore.hasCompleteDetails ? 'Yes' : 'No' }}
                </span>
              </div>
            </div>
            
            <!-- File Verified -->
            <div class="flex items-center justify-between">
              <span class="theme-text-secondary">File Verified</span>
              <div class="flex items-center">
                <div class="w-2 h-2 rounded-full mr-2" 
                     :class="{
                       'bg-green-400': uploadStore.fingerprintGenerated && !uploadStore.isDuplicate,
                       'bg-red-400': uploadStore.isDuplicate,
                       'bg-yellow-400': uploadStore.isGeneratingFingerprint,
                       'bg-gray-600': !uploadStore.fingerprintGenerated && !uploadStore.isGeneratingFingerprint
                     }"></div>
                <span class="text-sm" 
                      :class="{
                        'text-green-400': uploadStore.fingerprintGenerated && !uploadStore.isDuplicate,
                        'text-red-400': uploadStore.isDuplicate,
                        'text-yellow-400': uploadStore.isGeneratingFingerprint,
                        'theme-text-muted': !uploadStore.fingerprintGenerated && !uploadStore.isGeneratingFingerprint
                      }">
                  {{ uploadStore.isGeneratingFingerprint ? 'Processing...' : 
                     uploadStore.isDuplicate ? 'Duplicate' :
                     uploadStore.fingerprintGenerated ? 'Verified' : 'Pending' }}
                </span>
              </div>
            </div>
            
            <!-- Ready to Upload -->
            <div class="flex items-center justify-between">
              <span class="theme-text-secondary">Ready to Upload</span>
              <div class="flex items-center">
                <div class="w-2 h-2 rounded-full mr-2" :class="uploadStore.canUpload ? 'bg-green-400' : 'bg-gray-600'"></div>
                <span class="text-sm" :class="uploadStore.canUpload ? 'text-green-400' : 'theme-text-muted'">
                  {{ uploadStore.canUpload ? 'Yes' : 'No' }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Section 5: Rights Confirmation -->
        <div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
          <label class="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              v-model="uploadStore.rightsConfirmed"
              class="mt-1"
            />
            <span class="text-sm theme-text-secondary">
              I confirm I own the rights to upload and distribute this audio.
            </span>
          </label>
        </div>
        
        <!-- Section 6: Upload Button (6 States) -->
        <button
          @click="handleUpload"
          :disabled="!uploadStore.canUpload || uploadStore.uploading || uploadStore.isGeneratingFingerprint"
          :class="[
            'w-full py-4 rounded-lg font-bold text-lg transition-all',
            uploadStore.isSuccess ? 'bg-green-500 text-white shadow-lg shadow-black/20' :
            uploadStore.isDuplicate ? 'bg-transparent text-black cursor-not-allowed' :
            uploadStore.uploading || uploadStore.isGeneratingFingerprint
              ? 'bg-yellow-50 text-black border border-yellow-200 shadow-none' :
            uploadStore.canUpload ? 'bg-[#ffd200] text-black hover:bg-yellow-400 shadow-lg shadow-black/20' :
            'bg-transparent text-black cursor-not-allowed'
          ]"
        >
          <span v-if="uploadStore.isSuccess" class="flex items-center justify-center">
            <svg class="w-6 h-6 mr-2 animate-scale-check" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            Success!
          </span>
          <span v-else-if="uploadStore.isDuplicate" class="flex items-center justify-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Duplicate Detected
          </span>
          <span v-else-if="uploadStore.isGeneratingFingerprint" class="flex items-center justify-center">
            <svg class="w-5 h-5 mr-2 animate-spin text-gray-600" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity=".25"/><path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="4" opacity=".9"/></svg>
            Verifying File...
          </span>
          <span v-else-if="uploadStore.uploading" class="flex items-center justify-center">
            <svg class="w-5 h-5 mr-2 animate-spin text-gray-600" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity=".25"/><path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="4" opacity=".9"/></svg>
            {{ uploadStore.conversionStage === 'decoding' ? 'Decoding...' : 
               uploadStore.conversionStage === 'encoding' ? 'Converting...' : 
               'Uploading...' }}
          </span>
          <span v-else-if="!uploadStore.canUpload" class="flex items-center justify-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
            </svg>
            Upload Song
          </span>
          <span v-else class="flex items-center justify-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
            </svg>
            Upload Song
          </span>
        </button>
        
        <!-- Section 7: Upload Guidelines -->
        <div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
          <h3 class="text-lg font-semibold theme-text-primary mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-[#ffd200]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Upload Guidelines
          </h3>
          
          <div class="space-y-3 text-sm theme-text-secondary">
            <div class="flex items-start">
              <svg class="w-4 h-4 mr-2 mt-0.5 text-[#ffd200] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Only original music you own the rights to</span>
            </div>
            <div class="flex items-start">
              <svg class="w-4 h-4 mr-2 mt-0.5 text-[#ffd200] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>High quality audio files (MP3, WAV, M4A)</span>
            </div>
            <div class="flex items-start">
              <svg class="w-4 h-4 mr-2 mt-0.5 text-[#ffd200] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Maximum file size: 50MB</span>
            </div>
            <div class="flex items-start">
              <svg class="w-4 h-4 mr-2 mt-0.5 text-[#ffd200] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Songs enter the weekly battle rotation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Section 8: Error Display (full width) -->
    <div 
      v-if="uploadStore.uploadError && !uploadStore.uploading && !uploadStore.isSuccess"
      class="rounded-2xl p-6 border-2 border-red-500 bg-red-50/10"
    >
      <div class="flex items-start space-x-3">
        <span class="text-red-500 text-xl">⚠️</span>
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-red-600 mb-2">Upload Error</h3>
          <pre class="text-sm text-red-700 whitespace-pre-wrap">{{ uploadStore.uploadError }}</pre>
          
          <!-- WAV Conversion Help (conditional) -->
          <div v-if="uploadStore.uploadError.toLowerCase().includes('wav')" class="mt-4 p-4 bg-blue-50/10 rounded-lg border border-blue-300">
            <h4 class="font-semibold text-blue-700 mb-2">WAV Conversion Help</h4>
            <p class="text-sm text-blue-600 mb-3">Try converting your WAV file to MP3 before uploading:</p>
            <ul class="text-sm text-blue-600 space-y-1">
              <li>• <a href="https://cloudconvert.com/wav-to-mp3" target="_blank" class="underline">CloudConvert</a> - Free online converter</li>
              <li>• <a href="https://www.audacityteam.org/" target="_blank" class="underline">Audacity</a> - Free audio editor</li>
            </ul>
            <p class="text-sm text-blue-600 mt-3">Export as MP3, 320kbps recommended</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUploadStore } from '@/stores/uploadStore'
import { useRouter } from 'vue-router'
import { extractMetadataFromFilename } from '@/utils/titleExtractor'
import WaveformSelectorDual from './WaveformSelectorDual.vue'

const uploadStore = useUploadStore()
const router = useRouter()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const emit = defineEmits<{
  uploadComplete: []
}>()

// Load battle-ready genres on mount
onMounted(async () => {
  await uploadStore.loadBattleReadyGenres()
})

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    
    // Clear any previous upload status and fingerprint state
    uploadStore.clearUploadStatus()
    uploadStore.clearFingerprintState()
    
    // Process file for duplicate detection
    const result = await uploadStore.handleFileSelection(file)
    
    if (result.success) {
      // Load file into form
      uploadStore.selectedFile = file
      uploadStore.audioPreviewUrl = URL.createObjectURL(file)
      uploadStore.clipStartTime = 0
      
      // Auto-extract title and artist from filename
      const metadata = extractMetadataFromFilename(file.name)
      if (metadata.artist) {
        uploadStore.artistName = metadata.artist
      }
      if (metadata.title) {
        uploadStore.songTitle = metadata.title
      }
    } else {
      // Show duplicate error
      alert(result.message)
      // Clear the file input
      if (fileInput.value) {
        fileInput.value.value = ''
      }
      uploadStore.selectedFile = null
      uploadStore.audioPreviewUrl = null
    }
  }
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    
    // Clear any previous upload status and fingerprint state
    uploadStore.clearUploadStatus()
    uploadStore.clearFingerprintState()
    
    // Process file for duplicate detection
    const result = await uploadStore.handleFileSelection(file)
    
    if (result.success) {
      // Load file into form
      uploadStore.selectedFile = file
      uploadStore.audioPreviewUrl = URL.createObjectURL(file)
      uploadStore.clipStartTime = 0
      
      // Auto-extract title and artist from filename
      const metadata = extractMetadataFromFilename(file.name)
      if (metadata.artist) {
        uploadStore.artistName = metadata.artist
      }
      if (metadata.title) {
        uploadStore.songTitle = metadata.title
      }
    } else {
      // Show duplicate error
      alert(result.message)
      // Clear the file input
      target.value = ''
      uploadStore.selectedFile = null
      uploadStore.audioPreviewUrl = null
    }
  }
}

const handleUpload = async () => {
  if (!uploadStore.selectedFile) return
  
  try {
    await uploadStore.uploadSong(
      uploadStore.selectedFile,
      uploadStore.songTitle,
      uploadStore.artistName,
      uploadStore.selectedGenre,
      uploadStore.clipStartTime,
      uploadStore.rightsConfirmed
    )
    
    // Emit completion event
    emit('uploadComplete')
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
