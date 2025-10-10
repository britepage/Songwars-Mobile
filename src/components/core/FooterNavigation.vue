<template>
  <footer v-if="isAuthenticated" class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
    <div class="flex items-center justify-around px-4 py-3">
      <!-- Battle Icon -->
      <button
        @click="goToBattle"
        class="flex flex-col items-center space-y-1 p-2 transition-colors bg-transparent"
        :class="{ 'text-[#ffd200]': isBattleActive, 'text-gray-600 hover:text-gray-800': !isBattleActive }"
      >
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 13h4v8H3v-8zm6-6h4v14H9V7zm6-4h4v18h-4V3z"/>
        </svg>
        <span class="text-xs font-medium" :class="{ 'text-[#ffd200]': isBattleActive, 'text-gray-600': !isBattleActive }">Battle</span>
      </button>

      <!-- Leaderboard Icon -->
      <button
        @click="goToLeaderboard"
        class="flex flex-col items-center space-y-1 p-2 transition-colors bg-transparent"
        :class="{ 'text-[#ffd200]': isLeaderboardActive, 'text-gray-600 hover:text-gray-800': !isLeaderboardActive }"
      >
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span class="text-xs font-medium" :class="{ 'text-[#ffd200]': isLeaderboardActive, 'text-gray-600': !isLeaderboardActive }">Leaderboard</span>
      </button>

      <!-- Add Song Button (Centered +) -->
      <button
        v-if="profileStore.profile?.role === 'artist'"
        @click="goToUpload"
        class="flex flex-col items-center space-y-1 p-2 rounded-lg transition-all transform hover:scale-110"
        :class="{ 'scale-110': isUploadActive }"
      >
        <div class="w-12 h-12 bg-[#ffd200] rounded-full flex items-center justify-center shadow-lg border-2 border-black">
          <svg class="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
        </div>
        <span class="text-xs font-medium" :class="{ 'text-[#ffd200]': isUploadActive, 'text-gray-600': !isUploadActive }">Add Song</span>
      </button>

      <!-- My Songs Icon -->
      <button
        v-if="profileStore.profile?.role === 'artist'"
        @click="goToMySongs"
        class="flex flex-col items-center space-y-1 p-2 transition-colors bg-transparent"
        :class="{ 'text-[#ffd200]': isMySongsActive, 'text-gray-600 hover:text-gray-800': !isMySongsActive }"
      >
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
        <span class="text-xs font-medium" :class="{ 'text-[#ffd200]': isMySongsActive, 'text-gray-600': !isMySongsActive }">My Songs</span>
      </button>

      <!-- Profile Icon -->
      <button
        @click="goToProfile"
        class="flex flex-col items-center space-y-1 p-2 transition-colors bg-transparent"
        :class="{ 'text-[#ffd200]': isProfileActive, 'text-gray-600 hover:text-gray-800': !isProfileActive }"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span class="text-xs font-medium" :class="{ 'text-[#ffd200]': isProfileActive, 'text-gray-600': !isProfileActive }">Account</span>
      </button>
    </div>

    <!-- Bottom padding for safe area on mobile -->
    <div class="h-2 md:h-0"></div>
  </footer>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const profileStore = useProfileStore()

// Fetch profile on mount to ensure footer has role data
onMounted(async () => {
  if (authStore.user) {
    await profileStore.fetchProfile()
  }
})

// Computed properties for active states
const isAuthenticated = computed(() => authStore.user)
const isBattleActive = computed(() => route.path === '/tabs/dashboard' && !route.query.section)
const isProfileActive = computed(() => route.path === '/tabs/account')
const isLeaderboardActive = computed(() => route.path === '/tabs/leaderboard')
const isMySongsActive = computed(() => route.path.includes('/my-songs'))
const isUploadActive = computed(() => route.path === '/tabs/dashboard' && route.query.section === 'upload')

// Navigation functions
const goToBattle = () => {
  router.push('/tabs/dashboard')
}

const goToLeaderboard = () => {
  router.push('/tabs/leaderboard')
}

const goToUpload = () => {
  router.push('/tabs/dashboard?section=upload')
}

const goToMySongs = () => {
  router.push('/tabs/my-songs')
}

const goToProfile = () => {
  router.push('/tabs/account')
}
</script>

<style scoped>
/* Safe area for mobile devices */
@media (max-width: 768px) {
  .h-2 {
    height: env(safe-area-inset-bottom, 0.5rem);
  }
}
</style>