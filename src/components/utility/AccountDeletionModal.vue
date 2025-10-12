<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl max-w-md w-full shadow-xl">
      <div class="p-6">
        <!-- Modal Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-gray-900">Delete Account</h3>
          <button 
            @click="closeModal" 
            class="text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Close delete account modal"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Step 1: Initial Warning -->
        <div v-if="step === 1" class="space-y-4">
          <!-- Warning Icon -->
          <div class="text-center">
            <div class="text-red-500 text-6xl mb-4">⚠️</div>
            <h4 class="text-lg font-semibold text-gray-900 mb-2">Are you absolutely sure?</h4>
            <p class="text-gray-700 text-sm leading-relaxed">
              This action will <strong>permanently delete your account</strong> and all associated data including:
            </p>
          </div>
          
          <!-- Red Warning Box -->
          <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <ul class="text-red-400 text-sm space-y-1">
              <li>• All your uploaded songs (including audio files)</li>
              <li>• Your profile and account settings</li>
              <li>• All votes and battle history</li>
              <li>• Song flags and tags</li>
              <li>• Weekly scores and competition data</li>
            </ul>
          </div>
          
          <!-- Final Warning -->
          <p class="text-gray-600 text-xs text-center">
            <strong>This action cannot be undone.</strong> Once you delete your account, all data will be permanently removed.
          </p>
          
          <!-- Buttons -->
          <div class="flex space-x-3">
            <button 
              @click="closeModal" 
              class="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="nextStep" 
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              I Understand, Continue
            </button>
          </div>
        </div>

        <!-- Step 2: Type Confirmation -->
        <div v-if="step === 2" class="space-y-4">
          <!-- Icon and Header -->
          <div class="text-center">
            <div class="text-red-500 text-6xl mb-4">🗑️</div>
            <h4 class="text-lg font-semibold text-gray-900 mb-2">Final Confirmation</h4>
            <p class="text-gray-700 text-sm">
              To confirm account deletion, please type <strong>DELETE</strong> in the field below:
            </p>
          </div>
          
          <!-- Input Field -->
          <div>
            <input
              v-model="confirmationText"
              type="text"
              placeholder="Type DELETE to confirm"
              class="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              :class="{ 'border-red-500': confirmationText && confirmationText !== 'DELETE' }"
            />
            <p v-if="confirmationText && confirmationText !== 'DELETE'" class="text-red-400 text-xs mt-1">
              Please type exactly "DELETE" to confirm
            </p>
          </div>
          
          <!-- Buttons -->
          <div class="flex space-x-3">
            <button 
              @click="previousStep" 
              class="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors"
            >
              Back
            </button>
            <button 
              @click="confirmDeletion" 
              :disabled="confirmationText !== 'DELETE' || isDeleting"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isDeleting">Deleting...</span>
              <span v-else>Delete My Account</span>
            </button>
          </div>
        </div>

        <!-- Step 3: Deletion in Progress -->
        <div v-if="step === 3" class="space-y-4 text-center">
          <!-- Loading Spinner -->
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto"></div>
          
          <h4 class="text-lg font-semibold text-gray-900">Deleting Your Account</h4>
          
          <p class="text-gray-700 text-sm">
            Please wait while we securely remove your account and all associated data...
          </p>
          
          <!-- Info Box -->
          <div class="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p class="text-blue-400 text-xs">
              This process may take a few moments as we clean up all your data across the system.
            </p>
          </div>
        </div>

        <!-- Step 4: Success -->
        <div v-if="step === 4" class="space-y-4 text-center">
          <!-- Success Icon -->
          <div class="text-green-500 text-6xl mb-4">✅</div>
          
          <h4 class="text-lg font-semibold text-gray-900">Account Deleted Successfully</h4>
          
          <p class="text-gray-700 text-sm">
            Your account and all associated data have been permanently removed from our system.
          </p>
          
          <!-- Success Box -->
          <div class="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <p class="text-green-400 text-xs">
              You will be redirected to the sign-in page in a few seconds.
            </p>
          </div>
        </div>

        <!-- Step 5: Error -->
        <div v-if="step === 5" class="space-y-4 text-center">
          <!-- Error Icon -->
          <div class="text-red-500 text-6xl mb-4">❌</div>
          
          <h4 class="text-lg font-semibold text-gray-900">Deletion Failed</h4>
          
          <p class="text-gray-700 text-sm">
            We encountered an error while deleting your account. Please try again or contact support.
          </p>
          
          <!-- Error Box -->
          <div class="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p class="text-red-400 text-xs">
              Error: {{ errorMessage }}
            </p>
          </div>
          
          <!-- Buttons -->
          <div class="flex space-x-3">
            <button 
              @click="closeModal" 
              class="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors"
            >
              Close
            </button>
            <button 
              @click="retryDeletion" 
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'

// Props
interface Props {
  showModal: boolean
}
const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
}>()

// Stores
const authStore = useAuthStore()
const themeStore = useThemeStore()

// State
const step = ref(1)                    // Current step (1-5)
const confirmationText = ref('')       // User's typed confirmation
const isDeleting = ref(false)         // Loading state during deletion
const errorMessage = ref('')          // Error message if deletion fails

// Methods
const nextStep = () => {
  step.value = Math.min(step.value + 1, 4)
}

const previousStep = () => {
  step.value = Math.max(step.value - 1, 1)
}

const closeModal = () => {
  emit('close')
}

const resetState = () => {
  step.value = 1
  confirmationText.value = ''
  isDeleting.value = false
  errorMessage.value = ''
}

const confirmDeletion = async () => {
  if (confirmationText.value !== 'DELETE') return
  
  step.value = 3
  isDeleting.value = true
  
  try {
    const success = await authStore.deleteUserAccount()
    
    if (success) {
      step.value = 4
      // Auto-redirect handled by authStore
    } else {
      throw new Error('Account deletion failed')
    }
  } catch (error: any) {
    errorMessage.value = error.message || 'Unknown error occurred'
    step.value = 5
  } finally {
    isDeleting.value = false
  }
}

const retryDeletion = () => {
  step.value = 2
  errorMessage.value = ''
}

// Watch for modal close to reset state
watch(() => props.showModal, (newValue) => {
  if (!newValue) {
    resetState()
  }
})
</script>