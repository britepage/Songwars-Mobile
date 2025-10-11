<template>
  <div class="hamburger-menu">
    <!-- Hamburger Button -->
    <button
      @click="toggleMenu"
      class="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors duration-200 relative z-60"
      :class="{ 'bg-gray-200': isOpen }"
      title="Menu"
      aria-label="Toggle menu"
    >
      <svg 
        class="w-6 h-6 transition-transform duration-200" 
        :class="{ 'rotate-90': isOpen }"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <!-- Hamburger icon (3 lines) -->
        <path 
          v-if="!isOpen" 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M4 6h16M4 12h16M4 18h16"
        />
        <!-- X icon (close) -->
        <path 
          v-else 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>

    <!-- Menu Panel -->
    <div 
      class="fixed top-0 right-0 h-full bg-white z-50 transform transition-all duration-300 ease-in-out"
      :class="[
        isOpen ? 'translate-x-0' : 'translate-x-full',
        showContent ? 'w-full' : 'w-80'
      ]"
    >
      <!-- Menu Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Menu</h2>
        <button 
          @click="closeMenu"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          aria-label="Close menu"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Menu Content -->
      <div v-if="!showContent" class="p-4">
        <nav class="space-y-2">
          <button 
            @click="navigate('/tabs/dashboard')"
            class="w-full flex items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h4v8H3v-8zm6-6h4v14H9V7zm6-4h4v18h-4V3z"/>
            </svg>
            Dashboard
          </button>
          
          <button 
            @click="navigate('/tabs/my-songs')"
            class="w-full flex items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            My Songs
          </button>
          
          <button 
            @click="navigate('/tabs/leaderboard')"
            class="w-full flex items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 4V2c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1zM5 14c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM19 4V2c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1zM17 14c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM11 6V4c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1zM9 16c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
            </svg>
            Leaderboard
          </button>
          
          <button 
            @click="navigate('/tabs/account')"
            class="w-full flex items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            Account
          </button>
          
          <button 
            v-if="isAdmin" 
            @click="navigate('/admin/flags')"
            class="w-full flex items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z"/>
            </svg>
            Moderation
          </button>
        </nav>
      </div>

      <!-- Content Viewer (for external links) -->
      <div v-if="showContent" class="h-full">
        <iframe 
          :src="contentUrl" 
          class="w-full h-full border-0"
          title="Content"
        />
      </div>
    </div>

    <!-- Backdrop -->
    <div 
      v-if="isOpen"
      @click="closeMenu"
      class="fixed inset-0 bg-black bg-opacity-50 z-40"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { computed } from 'vue'

const router = useRouter()
const authStore = useAuthStore()

const isAdmin = computed(() => authStore.isAdmin)
const isOpen = ref(false)
const showContent = ref(false)
const contentUrl = ref('')

const toggleMenu = () => {
  isOpen.value = !isOpen.value
  if (!isOpen.value) {
    showContent.value = false
    contentUrl.value = ''
  }
}

const closeMenu = () => {
  isOpen.value = false
  showContent.value = false
  contentUrl.value = ''
}

const navigate = (path: string) => {
  closeMenu()
  router.push(path)
}

const openContent = (url: string) => {
  contentUrl.value = url
  showContent.value = true
}
</script>

<style scoped>
.hamburger-menu {
  position: relative;
}
</style>
