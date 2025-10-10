<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Set New Password</ion-title>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="auth-container">
        <!-- Icon -->
        <div class="icon-container">
          <ion-icon :icon="lockClosedOutline" class="reset-icon" />
        </div>
        
        <!-- Heading -->
        <div class="heading">
          <h1>Create New Password</h1>
          <p>Enter your new password below.</p>
        </div>
        
        <!-- Password Form -->
        <form @submit.prevent="handlePasswordReset" class="reset-form">
          <ion-item>
            <ion-label position="stacked">New Password</ion-label>
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
            <ion-label position="stacked">Confirm New Password</ion-label>
            <ion-input
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Re-enter your password"
              required
              autocomplete="new-password"
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
            {{ isLoading ? 'Updating...' : 'Update Password' }}
          </ion-button>
        </form>
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
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonText
} from '@ionic/vue'
import { lockClosedOutline, eye, eyeOff } from 'ionicons/icons'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
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
</style>