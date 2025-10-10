<template>
  <ion-card class="auth-debug-card" v-if="showDebug">
    <ion-card-header>
      <ion-card-title>Auth Debug Info</ion-card-title>
      <ion-button
        slot="end"
        fill="clear"
        size="small"
        @click="toggleExpanded"
      >
        <ion-icon :icon="isExpanded ? chevronUp : chevronDown" />
      </ion-button>
    </ion-card-header>
    
    <ion-card-content v-if="isExpanded">
      <!-- Auth Status -->
      <div class="debug-section">
        <h4>Authentication Status</h4>
        <div class="debug-item">
          <span class="debug-label">Authenticated:</span>
          <ion-badge :color="isAuthenticated ? 'success' : 'danger'">
            {{ isAuthenticated ? 'Yes' : 'No' }}
          </ion-badge>
        </div>
        <div class="debug-item">
          <span class="debug-label">User ID:</span>
          <span class="debug-value">{{ user?.id || 'N/A' }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Email:</span>
          <span class="debug-value">{{ user?.email || 'N/A' }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Role:</span>
          <ion-badge :color="getRoleColor(user?.role)">
            {{ user?.role || 'user' }}
          </ion-badge>
        </div>
      </div>
      
      <!-- Session Info -->
      <div class="debug-section">
        <h4>Session Info</h4>
        <div class="debug-item">
          <span class="debug-label">Access Token:</span>
          <span class="debug-value truncate">{{ session?.access_token?.substring(0, 20) || 'N/A' }}...</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Expires At:</span>
          <span class="debug-value">{{ formatDate(session?.expires_at) }}</span>
        </div>
      </div>
      
      <!-- Environment -->
      <div class="debug-section">
        <h4>Environment</h4>
        <div class="debug-item">
          <span class="debug-label">Supabase URL:</span>
          <span class="debug-value truncate">{{ supabaseUrl }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Environment:</span>
          <ion-badge color="primary">{{ environment }}</ion-badge>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="debug-actions">
        <ion-button
          fill="outline"
          size="small"
          @click="refreshSession"
        >
          <ion-icon :icon="refresh" slot="start" />
          Refresh Session
        </ion-button>
        
        <ion-button
          fill="outline"
          size="small"
          @click="clearCache"
        >
          <ion-icon :icon="trash" slot="start" />
          Clear Cache
        </ion-button>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonBadge
} from '@ionic/vue'
import { chevronUp, chevronDown, refresh, trash } from 'ionicons/icons'
import { ref, computed } from 'vue'

interface User {
  id: string
  email?: string
  role?: string
}

interface Session {
  access_token?: string
  expires_at?: number
}

interface Props {
  user?: User | null
  session?: Session | null
  isAuthenticated?: boolean
  showDebug?: boolean
}

withDefaults(defineProps<Props>(), {
  isAuthenticated: false,
  showDebug: true
})

const emit = defineEmits<{
  refreshSession: []
  clearCache: []
}>()

const isExpanded = ref(false)

const supabaseUrl = computed(() => import.meta.env.VITE_SUPABASE_URL || 'Not set')
const environment = computed(() => {
  const url = supabaseUrl.value
  if (url.includes('mobile-dev')) return 'mobile-dev'
  if (url.includes('localhost')) return 'local'
  return 'production'
})

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const getRoleColor = (role?: string) => {
  if (role === 'admin') return 'danger'
  if (role === 'moderator') return 'warning'
  return 'medium'
}

const formatDate = (timestamp?: number) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp * 1000)
  return date.toLocaleString()
}

const refreshSession = () => {
  emit('refreshSession')
}

const clearCache = () => {
  emit('clearCache')
}
</script>

<style scoped>
.auth-debug-card {
  margin: 1rem;
  border: 2px dashed var(--ion-color-warning);
}

.debug-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.debug-section:last-of-type {
  border-bottom: none;
}

.debug-section h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.debug-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.debug-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.debug-value {
  color: var(--text-primary);
  font-family: monospace;
}

.debug-value.truncate {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.debug-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.debug-actions ion-button {
  flex: 1;
}
</style>
