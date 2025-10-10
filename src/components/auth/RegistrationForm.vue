<template>
  <form @submit.prevent="handleSubmit" class="registration-form">
    <ion-item>
      <ion-label position="stacked">Username *</ion-label>
      <ion-input v-model="username" type="text" placeholder="Choose a username" required />
    </ion-item>
    
    <ion-item>
      <ion-label position="stacked">Email *</ion-label>
      <ion-input v-model="email" type="email" placeholder="your@email.com" required />
    </ion-item>
    
    <ion-item>
      <ion-label position="stacked">Password *</ion-label>
      <ion-input
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        placeholder="At least 6 characters"
        required
      />
      <ion-button slot="end" fill="clear" @click="showPassword = !showPassword">
        <ion-icon :icon="showPassword ? eyeOff : eye" />
      </ion-button>
    </ion-item>
    
    <ion-item>
      <ion-label position="stacked">Confirm Password *</ion-label>
      <ion-input
        v-model="confirmPassword"
        :type="showPassword ? 'text' : 'password'"
        placeholder="Re-enter password"
        required
      />
    </ion-item>
    
    <ion-text v-if="error" color="danger" class="error-message">
      <p>{{ error }}</p>
    </ion-text>
    
    <ion-button expand="block" type="submit" class="bigbutton" :disabled="isLoading">
      {{ isLoading ? 'Creating Account...' : 'Create Account' }}
    </ion-button>
  </form>
</template>

<script setup lang="ts">
import { IonItem, IonLabel, IonInput, IonButton, IonIcon, IonText } from '@ionic/vue'
import { eye, eyeOff } from 'ionicons/icons'
import { ref } from 'vue'

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)

interface Props {
  isLoading?: boolean
  error?: string | null
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null
})

const emit = defineEmits<{
  submit: [data: { username: string; email: string; password: string }]
}>()

const handleSubmit = () => {
  if (password.value !== confirmPassword.value) {
    return
  }
  emit('submit', {
    username: username.value,
    email: email.value,
    password: password.value
  })
}
</script>

<style scoped>
.registration-form {
  width: 100%;
}

ion-item {
  --background: var(--card-bg);
  --border-color: var(--border-color);
  margin-bottom: 1rem;
}

.error-message {
  display: block;
  margin: 1rem 0;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 0.5rem;
  text-align: center;
}

.error-message p {
  margin: 0;
  font-size: 0.875rem;
}
</style>
