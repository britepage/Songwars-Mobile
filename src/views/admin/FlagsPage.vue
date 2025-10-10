<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/dashboard" />
        </ion-buttons>
        <ion-title>Content Moderation</ion-title>
        <ion-buttons slot="end">
          <ThemeToggle />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <!-- Filter Tabs -->
      <ion-segment v-model="selectedFilter" @ionChange="handleFilterChange">
        <ion-segment-button value="pending">
          <ion-label>Pending ({{ pendingFlags.length }})</ion-label>
        </ion-segment-button>
        <ion-segment-button value="resolved">
          <ion-label>Resolved ({{ resolvedFlags.length }})</ion-label>
        </ion-segment-button>
      </ion-segment>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <ion-spinner name="crescent" color="primary" />
        <p>Loading flags...</p>
      </div>
      
      <!-- Flags List -->
      <div v-else class="flags-container">
        <div v-if="currentFlags.length === 0" class="no-flags">
          <ion-icon :icon="shieldCheckmark" class="no-flags-icon" />
          <h3>No {{ selectedFilter }} flags</h3>
          <p>{{ selectedFilter === 'pending' ? 'All clear! No pending reports.' : 'No resolved flags to show.' }}</p>
        </div>
        
        <ion-card 
          v-for="flag in currentFlags" 
          :key="flag.id"
          class="flag-card"
        >
          <ion-card-header>
            <div class="flag-header">
              <ion-badge :color="getCategoryColor(flag.category)">
                {{ flag.category }}
              </ion-badge>
              <span class="flag-date">{{ formatDate(flag.created_at) }}</span>
            </div>
          </ion-card-header>
          
          <ion-card-content>
            <!-- Song Info -->
            <div class="song-info">
              <h3>{{ flag.song?.title || 'Unknown Song' }}</h3>
              <p>by {{ flag.song?.artist || 'Unknown Artist' }}</p>
            </div>
            
            <!-- Flag Details -->
            <div class="flag-details">
              <p class="flag-reason"><strong>Reason:</strong> {{ flag.reason || 'No reason provided' }}</p>
              <p class="flag-reporter">Reported by: {{ flag.reporter?.username || 'Anonymous' }}</p>
            </div>
            
            <!-- Actions (for pending flags) -->
            <div v-if="selectedFilter === 'pending'" class="flag-actions">
              <ion-button
                fill="solid"
                color="danger"
                @click="removeSong(flag)"
              >
                <ion-icon :icon="trash" slot="start" />
                Remove Song
              </ion-button>
              
              <ion-button
                fill="outline"
                color="success"
                @click="dismissFlag(flag)"
              >
                <ion-icon :icon="checkmark" slot="start" />
                Dismiss Flag
              </ion-button>
            </div>
            
            <!-- Resolution Info (for resolved flags) -->
            <div v-else class="resolution-info">
              <ion-badge :color="flag.action === 'removed' ? 'danger' : 'success'">
                {{ flag.action === 'removed' ? 'Song Removed' : 'Flag Dismissed' }}
              </ion-badge>
              <p>Resolved by {{ flag.resolved_by?.username || 'Admin' }}</p>
            </div>
          </ion-card-content>
        </ion-card>
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
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonBadge
} from '@ionic/vue'
import { shieldCheckmark, trash, checkmark } from 'ionicons/icons'
import { ref, computed } from 'vue'
import ThemeToggle from '@/components/core/ThemeToggle.vue'

const selectedFilter = ref('pending')
const isLoading = ref(false)

// Mock data - TODO: Replace with actual data from store
const flags = ref<any[]>([])

const pendingFlags = computed(() => flags.value.filter(f => !f.resolved))
const resolvedFlags = computed(() => flags.value.filter(f => f.resolved))

const currentFlags = computed(() => {
  return selectedFilter.value === 'pending' ? pendingFlags.value : resolvedFlags.value
})

const handleFilterChange = (event: CustomEvent) => {
  selectedFilter.value = event.detail.value
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'hate_speech':
      return 'danger'
    case 'copyright':
      return 'warning'
    default:
      return 'medium'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const removeSong = async (flag: any) => {
  console.log('Removing song:', flag)
  // TODO: Implement song removal
  // - Call soft delete on song
  // - Mark flag as resolved with action 'removed'
}

const dismissFlag = async (flag: any) => {
  console.log('Dismissing flag:', flag)
  // TODO: Implement flag dismissal
  // - Mark flag as resolved with action 'dismissed'
}
</script>

<style scoped>
ion-segment {
  margin: 1rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  gap: 1rem;
  color: var(--text-secondary);
}

.flags-container {
  padding: 1rem;
}

.no-flags {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.no-flags-icon {
  font-size: 4rem;
  color: var(--ion-color-success);
  opacity: 0.5;
  margin-bottom: 1rem;
}

.no-flags h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.no-flags p {
  color: var(--text-secondary);
}

.flag-card {
  margin-bottom: 1rem;
}

.flag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flag-date {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.song-info {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.song-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.song-info p {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.flag-details {
  margin-bottom: 1rem;
}

.flag-reason,
.flag-reporter {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

.flag-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.flag-actions ion-button {
  flex: 1;
}

.resolution-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.resolution-info p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}
</style>