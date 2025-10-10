<template>
  <div class="social-links-container">
    <h3 class="section-title" v-if="title">{{ title }}</h3>
    
    <div class="social-cards" v-if="socialLinks.length > 0">
      <div 
        v-for="link in socialLinks" 
        :key="link.platform"
        class="social-card"
        @click="handleLinkClick(link)"
      >
        <div class="social-icon" v-html="getPlatformIcon(link.platform)"></div>
        <div class="social-info">
          <h4 class="platform-name">{{ getPlatformName(link.platform) }}</h4>
          <p class="platform-url">{{ formatUrl(link.url) }}</p>
        </div>
        <ion-icon :icon="openOutline" class="external-icon" />
      </div>
    </div>
    
    <div class="no-links" v-else>
      <ion-icon :icon="linkOutline" class="no-links-icon" />
      <p>No social links available</p>
    </div>
    
    <!-- Add new link button -->
    <ion-button 
      v-if="showAddButton"
      fill="outline" 
      @click="handleAddLink"
      class="add-link-button"
    >
      <ion-icon :icon="addOutline" slot="start" />
      Add Social Link
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonIcon, IonButton } from '@ionic/vue'
import { openOutline, linkOutline, addOutline } from 'ionicons/icons'
import { useProfileStore } from '@/stores/profileStore'
import { getPlatformConfig } from '@/utils/socialPlatforms'

interface SocialLink {
  platform: string
  url: string
  label: string
}

interface Props {
  userId?: string
  title?: string
  showAddButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showAddButton: false
})

const profileStore = useProfileStore()

const socialLinks = computed(() => {
  if (props.userId) {
    // TODO: Fetch other user's social links
    return []
  }
  return profileStore.socialLinks
})

const emit = defineEmits<{
  addLink: []
  editLink: [link: SocialLink]
}>()

const getPlatformIcon = (platform: string) => {
  const config = getPlatformConfig(platform)
  return config?.icon || ''
}

const getPlatformName = (platform: string) => {
  const config = getPlatformConfig(platform)
  return config?.name || platform
}

const formatUrl = (url: string) => {
  try {
    // Just return the URL as-is for now
    return url
  } catch {
    return url
  }
}

const handleLinkClick = (link: SocialLink) => {
  window.open(link.url, '_blank')
}

const handleAddLink = () => {
  emit('addLink')
}
</script>

<style scoped>
.social-links-container {
  width: 100%;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.social-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Social card styling from COMPLETE_STYLE_GUIDE.md */
.social-card {
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 0.5rem;
  padding: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.social-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .social-card {
  background-color: #ffffff !important;
  border-color: #e5e7eb !important; /* gray-200 */
}

[data-theme="dark"] .social-card {
  background-color: #1f2937 !important; /* gray-800 */
  border-color: #4b5563 !important; /* gray-600 */
}

[data-theme="dark"] .social-card:hover {
  background-color: #374151 !important; /* gray-700 */
}

.social-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: var(--bg-tertiary);
}

.social-icon :deep(img) {
  width: 24px;
  height: 24px;
}

.social-info {
  flex: 1;
  min-width: 0;
}

.platform-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.platform-url {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  word-break: break-all;
}

.external-icon {
  color: var(--text-muted);
  font-size: 1.25rem;
}

.no-links {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}

.no-links-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.add-link-button {
  --color: #ffd200;
  --border-color: #ffd200;
  --background: transparent;
  margin-top: 1rem;
  width: 100%;
}

.add-link-button:hover {
  --background: #ffd200;
  --color: #000000;
}
</style>
