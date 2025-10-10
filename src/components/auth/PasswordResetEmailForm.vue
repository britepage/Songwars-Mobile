<template>
  <form @submit.prevent="handleSubmit" class="password-reset-email-form">
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
    
    <ion-text v-if="error" color="danger" class="error-message">
      <p>{{ error }}</p>
    </ion-text>
    
    <ion-text v-if="success" color="success" class="success-message">
      <p>{{ success }}</p>
    </ion-text>
    
    <ion-button expand="block" type="submit" class="bigbutton" :disabled="isLoading">
      {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
    </ion-button>
  </form>
</template>

<script setup lang="ts">
import { IonItem, IonLabel, IonInput, IonButton, IonText } from '@ionic/vue'
import { ref } from 'vue'

const email = ref('')

interface Props {
  isLoading?: boolean
  error?: string | null
  success?: string | null
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null,
  success: null
})

const emit = defineEmits<{
  submit: [email: string]
}>()

const handleSubmit = () => {
  if (email.value) {
    emit('submit', email.value)
  }
}
</script>

<style scoped>
.password-reset-email-form {
  width: 100%;
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
</style>
