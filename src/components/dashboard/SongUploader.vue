<template>
  <div class="max-w-7xl mx-auto space-y-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Left Column - Main Upload Area (2/3 width on desktop) -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- Section 1: File Upload Section -->
        <div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
          <h3 class="text-lg font-semibold theme-text-primary mb-4">🔽 Select Audio File</h3>
          
          <div 
            @drop.prevent="handleDrop"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            :class="[
              'relative border-2 border-dashed rounded-xl p-8 transition-all',
              isDragging ? 'border-[#ffd200] bg-yellow-50/10' : 'theme-border-card',
              uploadStore.selectedFile ? 'bg-blue-50/5' : ''
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
              <div class="text-6xl mb-4">☁️</div>
              <h4 class="text-lg font-semibold theme-text-primary mb-2">Upload your song</h4>
              <p class="theme-text-secondary mb-4">Drag and drop an audio file or browse</p>
              <p class="text-sm theme-text-secondary mb-6">MP3, WAV, M4A up to 50MB</p>
              <button
                @click="$refs.fileInput.click()"
                class="px-6 py-2 bg-[#ffd200] text-black font-semibold rounded-lg hover:bg-yellow-400 transition"
              >
                Browse Files
              </button>
            </div>
            
            <!-- File Selected State -->
            <div v-else class="text-center">
              <div class="text-6xl mb-4">🎵</div>
              <h4 class="text-lg font-semibold theme-text-primary mb-2">{{ uploadStore.selectedFile.name }}</h4>
              <p class="theme-text-secondary mb-2">{{ uploadStore.fileSizeFormatted }}</p>
              <p v-if="uploadStore.needsFileConversion" class="text-sm text-blue-600 mb-4">
                ⚠️ WAV file will be converted to MP3 (est. {{ uploadStore.estimatedConversionTime }})
              </p>
              <button
                @click="uploadStore.removeFile()"
                class="text-red-600 hover:text-red-700 font-medium"
              >
                Remove file
              </button>
            </div>
          </div>
        </div>
        
        <!-- Section 2: Song Details Form -->
        <div class="rounded-2xl p-6 border theme-bg-card theme-border-card">
          <h3 class="text-lg font-semibold theme-text-primary mb-4">📝 Song Details</h3>
          
          <div class="space-y-4">
            <!-- Song Title -->
            <div>
              <label class="block text-sm font-medium theme-text-primary mb-2">Song Title *</label>
              <input
                v-model="uploadStore.songTitle"
                type="text"
                placeholder="Enter song title"
                class="w-full px-4 py-2 rounded-lg border theme-bg-card theme-border-card theme-text-primary focus:ring-2 focus:ring-[#ffd200] focus:border-transparent"
              />
            </div>
            
            <!-- Artist Name and Genre (side by side on desktop) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium theme-text-primary mb-2">Artist Name *</label>
                <input
                  v-model="uploadStore.artistName"
                  type="text"
                  placeholder="Enter artist name"
                  class="w-full px-4 py-2 rounded-lg border theme-bg-card theme-border-card theme-text-primary focus:ring-2 focus:ring-[#ffd200] focus:border-transparent"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium theme-text-primary mb-2">Genre *</label>
                <select
                  v-model="uploadStore.selectedGenre"
                  class="w-full px-4 py-2 rounded-lg border theme-bg-card theme-border-card theme-text-primary focus:ring-2 focus:ring-[#ffd200] focus:border-transparent"
                >
                  <option value="">Select genre</option>
                  <option 
                    v-for="genreItem in uploadStore.battleReadyGenres" 
                    :key="genreItem.genre"
                    :value="genreItem.genre"
                  >
                    {{ genreItem.is_battle_ready ? '●' : '○' }} {{ genreItem.genre }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Section 3: Waveform Clip Selection -->
        <div v-if="uploadStore.audioPreviewUrl" class="rounded-2xl p-6 border theme-bg-card theme-border-card">
          <h3 class="text-lg font-semibold theme-text-primary mb-4">✂️ Select 30-Second Clip</h3>
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
          <h3 class="text-lg font-semibold theme-text-primary mb-4">📊 Upload Status</h3>
          
          <div class="space-y-3">
            <!-- File Selected -->
            <div class="flex items-center space-x-2">
              <div :class="['w-3 h-3 rounded-full', uploadStore.hasValidFile ? 'bg-green-500' : 'bg-gray-300']"></div>
              <span class="text-sm theme-text-secondary">File Selected</span>
            </div>
            
            <!-- Details Complete -->
            <div class="flex items-center space-x-2">
              <div :class="['w-3 h-3 rounded-full', uploadStore.hasCompleteDetails ? 'bg-green-500' : 'bg-gray-300']"></div>
              <span class="text-sm theme-text-secondary">Details Complete</span>
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
            <div class="flex items-center space-x-2">
              <div :class="['w-3 h-3 rounded-full', uploadStore.canUpload ? 'bg-green-500' : 'bg-gray-300']"></div>
              <span class="text-sm theme-text-secondary">Ready to Upload</span>
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
            uploadStore.isSuccess ? 'bg-green-500 text-white' :
            uploadStore.isDuplicate ? 'bg-gray-400 text-gray-700 cursor-not-allowed' :
            uploadStore.uploading || uploadStore.isGeneratingFingerprint ? 'bg-blue-500 text-white' :
            uploadStore.canUpload ? 'bg-[#ffd200] text-black hover:bg-yellow-400' :
            'bg-gray-300 text-gray-500 cursor-not-allowed'
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
          <span v-else-if="uploadStore.isGeneratingFingerprint">
            Verifying File...
          </span>
          <span v-else-if="uploadStore.uploading">
            {{ uploadStore.conversionStage === 'decoding' ? 'Decoding...' : 
               uploadStore.conversionStage === 'encoding' ? 'Converting...' : 
               'Uploading...' }}
          </span>
          <span v-else>
            Upload Song
          </span>
        </button>
        
        <!-- Section 7: Upload Guidelines -->
        <div class="rounded-2xl p-6 border border-yellow-400/30 bg-yellow-50/5">
          <div class="flex items-start space-x-2 mb-4">
            <span class="text-yellow-500">ℹ️</span>
            <h3 class="text-sm font-semibold theme-text-primary">Upload Guidelines</h3>
          </div>
          
          <ul class="space-y-2">
            <li class="flex items-start space-x-2 text-sm theme-text-secondary">
              <span class="text-green-500 mt-0.5">✓</span>
              <span>Only original music you own the rights to</span>
            </li>
            <li class="flex items-start space-x-2 text-sm theme-text-secondary">
              <span class="text-green-500 mt-0.5">✓</span>
              <span>High quality audio files (MP3, WAV, M4A)</span>
            </li>
            <li class="flex items-start space-x-2 text-sm theme-text-secondary">
              <span class="text-green-500 mt-0.5">✓</span>
              <span>Maximum file size: 50MB</span>
            </li>
            <li class="flex items-start space-x-2 text-sm theme-text-secondary">
              <span class="text-green-500 mt-0.5">✓</span>
              <span>Songs enter the weekly battle rotation</span>
            </li>
          </ul>
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
