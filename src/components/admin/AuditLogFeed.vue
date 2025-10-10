<template>
  <div class="audit-log-feed">
    <div class="feed-header" v-if="title">
      <h3>{{ title }}</h3>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading && logs.length === 0" class="loading-state">
      <ion-spinner name="crescent" color="primary" />
      <p>Loading audit logs...</p>
    </div>
    
    <!-- Logs List -->
    <ion-list v-else-if="logs.length > 0" class="logs-list">
      <ion-item
        v-for="log in logs"
        :key="log.id"
        class="log-item"
      >
        <div class="log-content">
          <div class="log-header">
            <ion-badge :color="getActionColor(log.action)">
              {{ log.action }}
            </ion-badge>
            <span class="log-time">{{ formatTime(log.created_at) }}</span>
          </div>
          
          <p class="log-description">{{ log.description }}</p>
          
          <div class="log-meta">
            <span class="log-user">by {{ log.user?.username || 'System' }}</span>
            <span v-if="log.target" class="log-target"> • {{ log.target }}</span>
          </div>
        </div>
      </ion-item>
      
      <!-- Infinite Scroll -->
      <ion-infinite-scroll
        v-if="hasMore"
        @ionInfinite="handleInfiniteScroll"
      >
        <ion-infinite-scroll-content
          loading-spinner="crescent"
          loading-text="Loading more logs..."
        />
      </ion-infinite-scroll>
    </ion-list>
    
    <!-- Empty State -->
    <div v-else class="empty-state">
      <ion-icon :icon="documentText" class="empty-icon" />
      <h4>No Audit Logs</h4>
      <p>Audit logs will appear here</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  IonList,
  IonItem,
  IonIcon,
  IonBadge,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent
} from '@ionic/vue'
import { documentText } from 'ionicons/icons'

interface AuditLog {
  id: string
  action: string
  description: string
  created_at: string
  user?: {
    username: string
  }
  target?: string
}

interface Props {
  logs: AuditLog[]
  title?: string
  isLoading?: boolean
  hasMore?: boolean
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
  hasMore: false
})

const emit = defineEmits<{
  loadMore: []
}>()

const getActionColor = (action: string) => {
  const actionLower = action.toLowerCase()
  if (actionLower.includes('delete') || actionLower.includes('remove')) return 'danger'
  if (actionLower.includes('create') || actionLower.includes('add')) return 'success'
  if (actionLower.includes('update') || actionLower.includes('edit')) return 'warning'
  return 'medium'
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const handleInfiniteScroll = (event: any) => {
  emit('loadMore')
  setTimeout(() => {
    event.target.complete()
  }, 500)
}
</script>

<style scoped>
.audit-log-feed {
  width: 100%;
}

.feed-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.feed-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.loading-state {
  gap: 1rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  color: var(--text-muted);
  opacity: 0.5;
  margin-bottom: 1rem;
}

.empty-state h4 {
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: var(--text-secondary);
  margin: 0;
}

.logs-list {
  background: transparent;
}

.log-item {
  --background: var(--card-bg);
  --border-color: var(--border-color);
  margin-bottom: 0.5rem;
}

.log-content {
  width: 100%;
  padding: 0.5rem 0;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.log-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.log-description {
  font-size: 0.875rem;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.log-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.log-user {
  font-weight: 500;
}
</style>
