<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/sign-in" />
        </ion-buttons>
        <ion-title>Reset Password</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="auth-container">
        <!-- Icon -->
        <div class="icon-container">
          <ion-icon :icon="mailOutline" class="reset-icon" />
        </div>
        
        <!-- Heading -->
        <div class="heading">
          <h1>Forgot Password?</h1>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
        </div>
        
        <!-- Email Form -->
        <form @submit.prevent="handleResetRequest" class="reset-form">
          <ion-item>
            <ion-label position="stacked">Email</ion-label>
            <ion-input
              v-model="email"
              type="email"
              placeholder="your@email.com"
              required
              autocomplete="email"
            />
          </ion-item>
          
          <!-- Error Message -->
          <ion-text v-if="error" color="danger" class="error-message">
            <p>{{ error }}</p>
          </ion-text>
          
          <!-- Success Message -->
          <ion-text v-if="success" color="success" class="success-message">
            <p>{{ success }}</p>
          </ion-text>
          
          <!-- Submit Button -->
          <ion-button
            expand="block"
            type="submit"
            class="bigbutton submit-button"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
          </ion-button>
        </form>
        
        <!-- Back to Sign In -->
        <div class="back-link">
          <ion-button
            fill="clear"
            @click="goToSignIn"
          >
            <ion-icon :icon="arrowBack" slot="start" />
            Back to Sign In
          </ion-button>
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
  IonText
} from '@ionic/vue'
import { mailOutline, arrowBack } from 'ionicons/icons'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const isLoading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const handleResetRequest = async () => {
  error.value = null
  success.value = null
  
  if (!email.value) {
    error.value = 'Please enter your email address'
    return
  }
  
  isLoading.value = true
  
  try {
    const result = await authStore.resetPassword(email.value)
    
    if (result.success) {
      success.value = 'Password reset link sent! Please check your email.'
      email.value = ''
    } else {
      error.value = result.error || 'Failed to send reset link'
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
.auth-container {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.icon-container {
  text-align: center;
  margin-bottom: 2rem;
}

.reset-icon {
  font-size: 5rem;
  color: var(--ion-color-primary);
}

.heading {
  text-align: center;
  margin-bottom: 3rem;
}

.heading h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.heading p {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.reset-form {
  margin-bottom: 2rem;
}

ion-item {
  --background: var(--card-bg);
  --border-color: var(--border-color);
  margin-bottom: 1rem;
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

.back-link {
  text-align: center;
  margin-top: 2rem;
}

.back-link ion-button {
  --color: var(--text-secondary);
}
</style>