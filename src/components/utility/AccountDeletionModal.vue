<template>
  <ion-modal :is-open="isOpen" @didDismiss="handleDismiss">
    <ion-header>
      <ion-toolbar>
        <ion-title>Delete Account</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="handleDismiss">Cancel</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content class="ion-padding">
      <div class="modal-content">
        <!-- Warning Icon -->
        <div class="warning-section">
          <ion-icon :icon="warning" class="warning-icon" />
          <h2>Are you absolutely sure?</h2>
        </div>
        
        <!-- Warning Text -->
        <div class="warning-text">
          <p><strong>This action cannot be undone.</strong></p>
          <p>Deleting your account will permanently remove:</p>
          <ul>
            <li>Your profile and account information</li>
            <li>All uploaded songs</li>
            <li>Your battle history</li>
            <li>Your Golden Ears awards</li>
            <li>All associated data</li>
          </ul>
        </div>
        
        <!-- Confirmation Input -->
        <div class="confirmation-section">
          <ion-item>
            <ion-label position="stacked">
              Type "DELETE" to confirm
            </ion-label>
            <ion-input
              v-model="confirmationText"
              placeholder="DELETE"
              @ionInput="handleInput"
            />
          </ion-item>
        </div>
        
        <!-- Error Message -->
        <ion-text v-if="error" color="danger" class="error-message">
          <p>{{ error }}</p>
        </ion-text>
        
        <!-- Action Buttons -->
        <div class="action-buttons">
          <ion-button
            expand="block"
            fill="outline"
            @click="handleDismiss"
          >
            Cancel
          </ion-button>
          
          <ion-button
            expand="block"
            color="danger"
            @click="handleDelete"
            :disabled="!canDelete || isDeleting"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete Account' }}
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonText
} from '@ionic/vue'
import { warning } from 'ionicons/icons'
import { ref, computed } from 'vue'

interface Props {
  isOpen: boolean
  isDeleting?: boolean
  error?: string | null
}

withDefaults(defineProps<Props>(), {
  isDeleting: false,
  error: null
})

const emit = defineEmits<{
  dismiss: []
  delete: []
}>()

const confirmationText = ref('')

const canDelete = computed(() => {
  return confirmationText.value.trim().toUpperCase() === 'DELETE'
})

const handleInput = (event: any) => {
  confirmationText.value = event.target.value
}

const handleDismiss = () => {
  confirmationText.value = ''
  emit('dismiss')
}

const handleDelete = () => {
  if (canDelete.value) {
    emit('delete')
  }
}
</script>

<style scoped>
.modal-content {
  max-width: 600px;
  margin: 0 auto;
}

.warning-section {
  text-align: center;
  margin-bottom: 2rem;
}

.warning-icon {
  font-size: 5rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.warning-section h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.warning-text {
  margin-bottom: 2rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.warning-text p {
  margin: 0 0 1rem 0;
}

.warning-text strong {
  color: #ef4444;
}

.warning-text ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.warning-text li {
  margin: 0.5rem 0;
}

.confirmation-section {
  margin-bottom: 2rem;
}

ion-item {
  --background: var(--card-bg);
  --border-color: var(--border-color);
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

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 2rem;
}
</style>
