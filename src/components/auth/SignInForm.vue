<template>
  <form @submit.prevent="handleSubmit" class="sign-in-form">
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
    
    <ion-item>
      <ion-label position="stacked">Password</ion-label>
      <ion-input
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        placeholder="Enter your password"
        required
        autocomplete="current-password"
      />
      <ion-button
        slot="end"
        fill="clear"
        @click="showPassword = !showPassword"
      >
        <ion-icon :icon="showPassword ? eyeOff : eye" />
      </ion-button>
    </ion-item>
    
    <ion-text v-if="error" color="danger" class="error-message">
      <p>{{ error }}</p>
    </ion-text>
    
    <ion-button
      expand="block"
      type="submit"
      class="bigbutton"
      :disabled="isLoading"
    >
      {{ isLoading ? 'Signing In...' : 'Sign In' }}
    </ion-button>
  </form>
</template>

<script setup lang="ts">
import {
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonText
} from '@ionic/vue'
import { eye, eyeOff } from 'ionicons/icons'
import { ref } from 'vue'

const email = ref('')
const password = ref('')
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
  submit: [email: string, password: string]
}>()

const handleSubmit = () => {
  if (email.value && password.value) {
    emit('submit', email.value, password.value)
  }
}
</script>

<style scoped>
.sign-in-form {
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
