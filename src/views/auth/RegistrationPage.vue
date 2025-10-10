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
            <h1 class="auth-title">Join SongWars</h1>
            <p class="auth-subtitle">Create your account and start your musical journey</p>
          </div>

          <!-- Registration Form -->
          <form @submit.prevent="handleRegistration" class="auth-form">
            <div class="form-field">
              <label for="email" class="field-label">Email address</label>
              <div class="input-shell">
                <ion-input
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autocomplete="email"
                  class="field-input"
                />
              </div>
            </div>

            <div class="form-field">
              <label for="password" class="field-label">Password</label>
              <div class="input-shell">
                <ion-input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  required
                  autocomplete="new-password"
                  class="field-input"
                />
              </div>
            </div>


            <!-- Error Message -->
            <div v-if="error" class="error-message">{{ error }}</div>
            <div v-if="success" class="success-message">{{ success }}</div>

            <!-- Submit Button -->
            <div>
              <button
                type="submit"
                :disabled="isLoading"
                class="bigbutton bigbutton-medium w-full"
              >
                {{ isLoading ? 'Creating Account...' : 'Create Account' }}
              </button>
            </div>

            <!-- Divider -->
            <div class="divider">
              <div class="divider-line"></div>
              <span class="divider-text">Or continue with</span>
              <div class="divider-line"></div>
            </div>

            <!-- Social Sign Up -->
            <div>
              <button @click="signUpWithGoogle" :disabled="isLoading" class="oauth-button">
                <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            <div class="mt-3">
              <button @click="signUpWithFacebook" :disabled="isLoading" class="oauth-button">
                <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.325 24H12.82v-9.294H9.692V11.01h3.128V8.414c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24h-1.918c-1.504 0-1.796.715-1.796 1.763v2.312h3.59l-.467 3.696h-3.123V24h6.127C23.407 24 24 23.407 24 22.674V1.326C24 .593 23.407 0 22.675 0z"/>
                </svg>
                Continue with Facebook
              </button>
            </div>
          </form>

          <!-- Links -->
          <div class="mt-8 text-center space-y-3">
            <div class="trial-cta">
              <p class="trial-text">Want to try before signing up?</p>
              <button @click="goToPreview" class="bigbutton bigbutton-small trial-button">Try it out!</button>
            </div>
            <p class="link-text">
              Already have an account?
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

const email = ref('')
const password = ref('')
// removed confirmPassword per web parity
const showPassword = ref(false)
// removed acceptTerms per web parity
const isLoading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const handleRegistration = async () => {
  error.value = null
  success.value = null
  
  // Validation
  if (!email.value || !password.value) {
    error.value = 'Please fill in all required fields'
    return
  }
  
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  
  isLoading.value = true
  
  try {
    const result = await authStore.signUp(email.value, password.value)
    
    if (result.success) {
      success.value = 'Account created! Please check your email to verify your account.'
      
      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        router.push('/sign-in')
      }, 3000)
    } else {
      error.value = result.error || 'Failed to create account'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred'
  } finally {
    isLoading.value = false
  }
}

const signUpWithGoogle = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const result = await authStore.signInWithOAuth('google')
    
    if (!result.success) {
      error.value = result.error || 'Failed to sign up with Google'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred'
  } finally {
    isLoading.value = false
  }
}

const signUpWithFacebook = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const result = await authStore.signInWithOAuth('facebook')
    
    if (!result.success) {
      error.value = result.error || 'Failed to sign up with Facebook'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An error occurred'
  } finally {
    isLoading.value = false
  }
}

// Terms/Privacy handlers removed per parity

const goToSignIn = () => { router.push('/sign-in') }
const goToPreview = () => { router.push('/preview') }
</script>

<style scoped>
/* Page background */
.auth-page-bg { --background: var(--bg-primary); }
ion-content.auth-page-bg { --padding-top: 0; --padding-bottom: 0; --padding-start: 0; --padding-end: 0; }

/* Centered container and card (reuse SignIn styles) */
.auth-page-container { min-height: 100%; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.auth-card { max-width: 448px; width: 100%; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 1rem; box-shadow: var(--shadow); padding: 2rem; margin: 0; }

/* Logo */
.logo-container { width: 100%; display: flex; justify-content: center; margin-bottom: 1.5rem; }
.logo-swap { width: 221px; max-width: 221px; }
.logo-swap img { width: 100%; height: auto; object-fit: contain; }
.logo--light { display: block; }
.logo--dark { display: none; }

/* Header */
.auth-header { text-align: center; margin-bottom: 2rem; }
.auth-title { font-size: 30px; line-height: 36px; font-weight: bold; color: var(--text-primary); margin: 0 0 0.5rem 0; }
.gradient-title { background: linear-gradient(135deg, #ffd200 0%, #ffed4e 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.auth-subtitle { font-size: 0.875rem; color: var(--text-secondary); margin: 0; }

/* Form and inputs */
.auth-form { display: flex; flex-direction: column; gap: 1rem; }
.form-field { display: flex; flex-direction: column; }
.field-label { display: block; font-size: 0.875rem; font-weight: 500; color: var(--text-secondary); margin-bottom: 0.5rem; }
.input-shell { border: 1px solid var(--border-color); border-radius: 0.5rem; background: #ffffff; }
.field-input { --background: transparent; --color: var(--text-primary); --padding-start: 1rem; --padding-end: 1rem; --padding-top: 0.875rem; --padding-bottom: 0.875rem; min-height: 48px; }
.field-input::part(native) { background: #ffffff; border: none; padding: 0.875rem 1rem; }
.input-shell:focus-within { border-color: #ffd200; outline: 2px solid #ffd200; outline-offset: 0; }

/* Terms */
.terms-checkbox { display: flex; align-items: center; gap: 0.75rem; margin: 0.5rem 0 0.25rem 0; }
.terms-checkbox ion-label { font-size: 0.875rem; color: var(--text-secondary); }
.terms-checkbox a { color: #b58900; text-decoration: none; font-weight: 600; }

/* Messages */
.error-message, .success-message { padding: 0.75rem; border-radius: 0.5rem; text-align: center; font-size: 0.875rem; margin: 0.5rem 0; }
.error-message { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; }
.success-message { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: #10b981; }

/* Divider and OAuth */
.divider { position: relative; display: flex; align-items: center; margin: 1rem 0; }
.divider-line { flex: 1; height: 1px; background: var(--border-color); }
.divider-text { padding: 0 0.5rem; font-size: 0.875rem; color: var(--text-secondary); background: var(--card-bg); }
.oauth-button { width: 100%; display: flex; align-items: center; justify-content: center; padding: 0.75rem 1rem; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 0.5rem; color: var(--text-primary); font-size: 1rem; cursor: pointer; transition: all 0.2s; margin: 0; }
.oauth-button:hover { background: var(--bg-tertiary); }
.oauth-button:disabled { opacity: 0.5; cursor: not-allowed; }
.oauth-button svg { margin-right: 0.75rem; }

/* Trial and links */
.trial-cta { margin: 1.75rem 0; padding: 0.875rem; background: rgba(255,210,0,0.1); border: 1px solid rgba(255,210,0,0.2); border-radius: 0.5rem; text-align: center; }
.trial-text { font-size: 0.875rem; color: var(--text-secondary); margin: 0 0 0.5rem 0; }
.trial-button { display: inline-block; }
.link-text { font-size: 0.875rem; color: var(--text-secondary); margin: 0; }
.link-action { color: #b58900; font-weight: 500; cursor: pointer; text-decoration: none; transition: color 0.2s; }
.link-action:hover { color: #866200; }

/* Utilities */
.w-full { width: 100%; }
.w-5 { width: 1.25rem; }
.h-5 { height: 1.25rem; }
.mr-3 { margin-right: 0.75rem; }
.mt-3 { margin-top: 0.75rem; }
.mt-8 { margin-top: 2rem; }
.text-center { text-align: center; }
.space-y-3 > * + * { margin-top: 0.75rem; }
</style>