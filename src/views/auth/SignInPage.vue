<template>
  <ion-page>
    <ion-content :fullscreen="true" class="auth-page-bg">
      <div class="auth-page-container">
        <ion-card class="auth-card">
          <!-- Large cassette tape logo -->
          <div class="logo-container">
            <div class="logo-swap">
              <img src="/src/assets/images/tapey.svg" alt="SongWars Logo" class="logo--light" />
              <img src="/src/assets/images/tapey-white.svg" alt="SongWars Logo" class="logo--dark" />
            </div>
          </div>

          <!-- Header -->
          <div class="auth-header">
            <h1 class="auth-title">Welcome Back</h1>
            <p class="auth-subtitle">Sign in to your SongWars account</p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSignIn" class="auth-form">
            <div class="form-field">
              <label for="email" class="field-label">Email address</label>
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
          
            <div class="form-field">
              <label for="password" class="field-label">Password</label>
              <ion-input
                id="password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                required
                autocomplete="current-password"
                class="field-input"
              />
            </div>
          
            <!-- Display error message from authStore -->
            <div v-if="authStore.error" class="error-message">
              {{ authStore.error }}
            </div>
          
            <div>
              <button
                type="submit"
                :disabled="signingIn"
                class="bigbutton bigbutton-medium w-full"
              >
                <svg v-if="signingIn" class="spinner" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ signingIn ? 'Signing In...' : 'Sign In' }}
              </button>
            </div>

            <!-- Divider -->
            <div class="divider">
              <div class="divider-line"></div>
              <span class="divider-text">Or continue with</span>
              <div class="divider-line"></div>
            </div>

            <!-- Google Sign In Button -->
            <div>
              <button
                @click="handleGoogleSignIn"
                :disabled="signingInWithGoogle"
                class="oauth-button"
              >
                <svg v-if="signingInWithGoogle" class="spinner" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {{ signingInWithGoogle ? 'Signing in with Google...' : 'Continue with Google' }}
              </button>
            </div>

            <!-- Facebook Sign In Button -->
            <div class="mt-3">
              <button
                @click="handleFacebookSignIn"
                :disabled="signingInWithFacebook"
                class="oauth-button"
              >
                <svg v-if="signingInWithFacebook" class="spinner" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#1877F2" d="M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.325 24H12.82v-9.294H9.692V11.01h3.128V8.414c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24h-1.918c-1.504 0-1.796.715-1.796 1.763v2.312h3.59l-.467 3.696h-3.123V24h6.127C23.407 24 24 23.407 24 22.674V1.326C24 .593 23.407 0 22.675 0z"/>
                </svg>
                {{ signingInWithFacebook ? 'Signing in with Facebook...' : 'Continue with Facebook' }}
              </button>
            </div>
          </form>

          <!-- Links -->
          <div class="mt-8 text-center space-y-3">
            <div class="trial-cta">
              <p class="trial-text">New to SongWars?</p>
              <button
                @click="goToPreview"
                class="bigbutton bigbutton-small trial-button"
              >
                Try it out!
              </button>
            </div>
            <p class="link-text">
              Don't have an account?
              <a @click="goToRegistration" class="link-action">Create Account</a>
            </p>
            <p class="link-text">
              <a @click="goToResetPassword" class="link-action">Forgot your password?</a>
            </p>
          </div>
        </ion-card>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonCard,
  IonInput
} from '@ionic/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const signingIn = ref(false)
const signingInWithGoogle = ref(false)
const signingInWithFacebook = ref(false)

const handleSignIn = async () => {
  signingIn.value = true
  
  try {
    await authStore.signInWithEmail(email.value, password.value)
    // Auth watcher will handle redirect
  } catch (err) {
    console.error('Sign-in process caught in component:', err)
  } finally {
    signingIn.value = false
  }
}

const handleGoogleSignIn = async () => {
  signingInWithGoogle.value = true
  
  try {
    await authStore.signInWithGoogle()
  } catch (err) {
    console.error('Google sign-in process caught in component:', err)
  } finally {
    signingInWithGoogle.value = false
  }
}

const handleFacebookSignIn = async () => {
  signingInWithFacebook.value = true
  
  try {
    await authStore.signInWithFacebook()
  } catch (err) {
    console.error('Facebook sign-in process caught in component:', err)
  } finally {
    signingInWithFacebook.value = false
  }
}

const goToPreview = () => {
  router.push('/preview')
}

const goToResetPassword = () => {
  router.push('/reset-password-email')
}

const goToRegistration = () => {
  router.push('/registration')
}
</script>

<style scoped>
/* Page background */
.auth-page-bg {
  --background: var(--bg-primary);
}

/* Centered container */
.auth-page-container {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

/* Card with rounded corners and shadow */
.auth-card {
  max-width: 448px;
  width: 100%;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 1rem;
  box-shadow: var(--shadow);
  padding: 2rem;
}

/* Logo */
.logo-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.logo-swap {
  width: 65%;
  max-width: 260px;
}

.logo-swap img {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.logo--light {
  display: block;
}

.logo--dark {
  display: none;
}

:root[data-theme="dark"] .logo--light {
  display: none;
}

:root[data-theme="dark"] .logo--dark {
  display: block;
}

/* Header */
.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-title {
  font-size: 1.875rem;
  font-weight: bold;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.auth-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.field-input {
  --background: var(--bg-tertiary);
  --color: var(--text-primary);
  --border-color: var(--border-color);
  --border-radius: 0.5rem;
  --padding-start: 1rem;
  --padding-end: 1rem;
  --padding-top: 0.875rem;
  --padding-bottom: 0.875rem;
  min-height: 48px;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
}

.field-input:focus-within {
  --border-color: #ffd200;
  outline: 2px solid #ffd200;
  outline-offset: 0;
}

/* Error */
.error-message {
  padding: 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

:root[data-theme="dark"] .error-message {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
  color: #fca5a5;
}

/* Divider */
.divider {
  position: relative;
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.divider-text {
  padding: 0 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  background: var(--card-bg);
}

/* OAuth Buttons */
.oauth-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.5rem;
}

.oauth-button:hover {
  background: var(--bg-tertiary);
}

.oauth-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.oauth-button svg {
  margin-right: 0.75rem;
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Trial CTA */
.trial-cta {
  margin: 1.75rem 0;
  padding: 0.875rem;
  background: rgba(255, 210, 0, 0.1);
  border: 1px solid rgba(255, 210, 0, 0.2);
  border-radius: 0.5rem;
  text-align: center;
}

.trial-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
}

.trial-button {
  display: inline-block;
}

/* Links */
.auth-links {
  margin-top: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.link-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.link-action {
  color: #b58900;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s;
}

.link-action:hover {
  color: #866200;
}

/* Utility classes */
.w-full {
  width: 100%;
}

.w-5 {
  width: 1.25rem;
}

.h-5 {
  height: 1.25rem;
}

.mr-3 {
  margin-right: 0.75rem;
}

.mt-3 {
  margin-top: 0.75rem;
}

.mt-8 {
  margin-top: 2rem;
}

.text-center {
  text-align: center;
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}
</style>