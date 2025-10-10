<template>
  <ion-page>
    <ion-content :fullscreen="true" class="auth-page-bg ion-no-padding">
      <div class="auth-page-container">
        <ion-card class="auth-card">
          <!-- Logo -->
          <div class="logo-container">
            <div class="logo-swap">
              <img src="/src/assets/images/tapey.svg" alt="SongWars Logo" class="logo--light" />
              <img src="/src/assets/images/tapey-white.svg" alt="SongWars Logo" class="logo--dark" />
            </div>
          </div>

          <!-- Header -->
          <div class="auth-header">
            <h1 class="auth-title">Set New Password</h1>
            <p class="auth-subtitle">Choose a strong password for your account</p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handlePasswordReset" class="auth-form">
            <div class="form-field">
              <label for="password" class="field-label">New Password</label>
              <div class="input-shell">
                <ion-input
                  id="password"
                  v-model="password"
                  type="password"
                  placeholder="At least 6 characters"
                  required
                  autocomplete="new-password"
                  class="field-input"
                />
              </div>
              <p class="field-hint">Minimum 6 characters.</p>
            </div>

            <div class="form-field">
              <label for="confirm" class="field-label">Confirm New Password</label>
              <div class="input-shell">
                <ion-input
                  id="confirm"
                  v-model="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  required
                  autocomplete="new-password"
                  class="field-input"
                />
              </div>
            </div>

            <!-- Error/Success messages -->
            <div v-if="error" class="error-message">{{ error }}</div>
            <div v-if="success" class="success-message">{{ success }}</div>

            <!-- Submit Button -->
            <div>
              <button
                type="submit"
                :disabled="isLoading"
                class="bigbutton bigbutton-medium w-full"
              >
                {{ isLoading ? 'Updating...' : 'Update Password' }}
              </button>
            </div>
          </form>

          <!-- Footer Link -->
          <div class="mt-8 text-center">
            <p class="link-text">
              Remember your password?
              <a @click="goToSignIn" class="link-action">Sign In</a>
            </p>
          </div>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonCard, IonInput } from '@ionic/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const handlePasswordReset = async () => {
  error.value = null
  success.value = null
  
  // Validation
  if (!password.value || !confirmPassword.value) {
    error.value = 'Please fill in all fields'
    return
  }
  
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }
  
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  
  isLoading.value = true
  
  try {
    const result = await authStore.updatePassword(password.value)
    
    if (result.success) {
      success.value = 'Password updated successfully! Redirecting...'
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/tabs/dashboard')
      }, 2000)
    } else {
      error.value = result.error || 'Failed to update password'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred'
  } finally {
    isLoading.value = false
  }
}

const goToSignIn = () => {
  router.push('/sign-in')
}
</script>

<style scoped>
/* Page background */
.auth-page-bg { --background: var(--bg-primary); }
ion-content.auth-page-bg { --padding-top: 0; --padding-bottom: 0; --padding-start: 0; --padding-end: 0; }

/* Centered container and card */
.auth-page-container { min-height: 100%; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.auth-card { max-width: 448px; width: 100%; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 1rem; box-shadow: var(--shadow); padding: 2rem; margin: 0; }

/* Logo */
.logo-container { width: 100%; display: flex; justify-content: center; margin-bottom: 1.5rem; }
.logo-swap { width: 221px; max-width: 221px; }
.logo-swap img { width: 100%; height: auto; object-fit: contain; }
.logo--light { display: block; }
.logo--dark { display: none; }
:root[data-theme="dark"] .logo--light { display: none; }
:root[data-theme="dark"] .logo--dark { display: block; }

/* Header */
.auth-header { text-align: center; margin-bottom: 2rem; }
.auth-title { font-size: 30px; line-height: 36px; font-weight: bold; color: var(--text-primary); margin: 0 0 0.5rem 0; }
.auth-subtitle { font-size: 0.875rem; color: var(--text-secondary); margin: 0; }

/* Form and inputs */
.auth-form { display: flex; flex-direction: column; gap: 1rem; }
.form-field { display: flex; flex-direction: column; }
.field-label { display: block; font-size: 0.875rem; font-weight: 500; color: var(--text-secondary); margin-bottom: 0.5rem; }
.input-shell { border: 1px solid var(--border-color); border-radius: 0.5rem; background: #ffffff; }
.field-input { --background: transparent; --color: var(--text-primary); --padding-start: 1rem; --padding-end: 1rem; --padding-top: 0.875rem; --padding-bottom: 0.875rem; min-height: 48px; }
.field-input::part(native) { background: #ffffff; border: none; padding: 0.875rem 1rem; }
.input-shell:focus-within { border-color: #ffd200; outline: 2px solid #ffd200; outline-offset: 0; }
.field-hint { font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem; }

/* Messages */
.error-message, .success-message { padding: 0.75rem; border-radius: 0.5rem; text-align: center; font-size: 0.875rem; margin: 0.5rem 0; }
.error-message { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; }
.success-message { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #10b981; }

/* Links */
.link-text { font-size: 0.875rem; color: var(--text-secondary); margin: 0; }
.link-action { color: #b58900; font-weight: 500; cursor: pointer; text-decoration: none; transition: color 0.2s; }
.link-action:hover { color: #866200; }

/* Utilities */
.w-full { width: 100%; }
.mt-8 { margin-top: 2rem; }
.text-center { text-align: center; }
</style>