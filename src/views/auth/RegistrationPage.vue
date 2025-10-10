<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/sign-in" />
        </ion-buttons>
        <ion-title>Create Account</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="auth-container">
        <!-- Branding -->
        <div class="branding">
          <h1 class="app-title">Join SongWars</h1>
          <p class="app-subtitle">Start battling your music today</p>
        </div>
        
        <!-- Registration Form -->
        <form @submit.prevent="handleRegistration" class="auth-form">
          <ion-item>
            <ion-label position="stacked">Username *</ion-label>
            <ion-input
              v-model="username"
              type="text"
              placeholder="Choose a username"
              required
              autocomplete="username"
            />
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Email *</ion-label>
            <ion-input
              v-model="email"
              type="email"
              placeholder="your@email.com"
              required
              autocomplete="email"
            />
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Password *</ion-label>
            <ion-input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="At least 6 characters"
              required
              autocomplete="new-password"
            />
            <ion-button
              slot="end"
              fill="clear"
              @click="showPassword = !showPassword"
            >
              <ion-icon :icon="showPassword ? eyeOff : eye" />
            </ion-button>
          </ion-item>
          
          <ion-item>
            <ion-label position="stacked">Confirm Password *</ion-label>
            <ion-input
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Re-enter your password"
              required
              autocomplete="new-password"
            />
          </ion-item>
          
          <!-- Terms Checkbox -->
          <div class="terms-checkbox">
            <ion-checkbox v-model="acceptTerms" />
            <ion-label>
              I agree to the
              <a href="#" @click.prevent="showTerms">Terms of Service</a>
              and
              <a href="#" @click.prevent="showPrivacy">Privacy Policy</a>
            </ion-label>
          </div>
          
          <!-- Error Message -->
          <ion-text v-if="error" color="danger" class="error-message">
            <p>{{ error }}</p>
          </ion-text>
          
          <!-- Success Message -->
          <ion-text v-if="success" color="success" class="success-message">
            <p>{{ success }}</p>
          </ion-text>
          
          <!-- Sign Up Button -->
          <ion-button
            expand="block"
            type="submit"
            class="bigbutton submit-button"
            :disabled="isLoading || !acceptTerms"
          >
            {{ isLoading ? 'Creating Account...' : 'Create Account' }}
          </ion-button>
        </form>
        
        <!-- Divider -->
        <div class="divider">
          <span>or</span>
        </div>
        
        <!-- Social Sign Up -->
        <div class="social-auth">
          <ion-button
            expand="block"
            fill="outline"
            @click="signUpWithGoogle"
            class="social-button"
          >
            <ion-icon :icon="logoGoogle" slot="start" />
            Continue with Google
          </ion-button>
          
          <ion-button
            expand="block"
            fill="outline"
            @click="signUpWithFacebook"
            class="social-button"
          >
            <ion-icon :icon="logoFacebook" slot="start" />
            Continue with Facebook
          </ion-button>
        </div>
        
        <!-- Sign In Link -->
        <div class="signin-link">
          <p>
            Already have an account?
            <ion-button
              fill="clear"
              size="small"
              @click="goToSignIn"
            >
              Sign In
            </ion-button>
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonCheckbox,
  IonText
} from '@ionic/vue'
import { eye, eyeOff, logoGoogle, logoFacebook } from 'ionicons/icons'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const acceptTerms = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const handleRegistration = async () => {
  error.value = null
  success.value = null
  
  // Validation
  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'Please fill in all required fields'
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
  
  if (!acceptTerms.value) {
    error.value = 'Please accept the Terms of Service and Privacy Policy'
    return
  }
  
  isLoading.value = true
  
  try {
    const result = await authStore.signUp(email.value, password.value)
    
    // TODO: Update profile with username after signup
    
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

const showTerms = () => {
  console.log('Show terms of service')
  // TODO: Show terms modal or navigate to terms page
}

const showPrivacy = () => {
  console.log('Show privacy policy')
  // TODO: Show privacy modal or navigate to privacy page
}

const goToSignIn = () => {
  router.push('/sign-in')
}
</script>

<style scoped>
.auth-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.branding {
  text-align: center;
  margin-bottom: 3rem;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #ffd200 0%, #ffed4e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin: 0;
}

.auth-form {
  margin-bottom: 2rem;
}

ion-item {
  --background: var(--card-bg);
  --border-color: var(--border-color);
  margin-bottom: 1rem;
}

.terms-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.5rem 0;
  padding: 0 0.5rem;
}

.terms-checkbox ion-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.terms-checkbox a {
  color: var(--ion-color-primary);
  text-decoration: none;
  font-weight: 600;
}

.error-message,
.success-message {
  display: block;
  margin: 1rem 0;
  padding: 0.75rem;
  border-radius: 0.5rem;
  text-align: center;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
}

.success-message {
  background: rgba(16, 185, 129, 0.1);
}

.error-message p,
.success-message p {
  margin: 0;
  font-size: 0.875rem;
}

.submit-button {
  margin-top: 1.5rem;
}

.divider {
  position: relative;
  text-align: center;
  margin: 2rem 0;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background: var(--border-color);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  background: var(--bg-primary);
  padding: 0 1rem;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.social-auth {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.social-button {
  --border-color: var(--border-color);
}

.signin-link {
  text-align: center;
  margin-top: 2rem;
}

.signin-link p {
  color: var(--text-secondary);
  margin: 0;
}

.signin-link ion-button {
  --color: var(--ion-color-primary);
  font-weight: 600;
}
</style>