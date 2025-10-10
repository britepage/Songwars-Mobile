<template>
  <div class="genre-selector">
    <h3 v-if="title" class="selector-title">{{ title }}</h3>
    
    <ion-segment
      :value="selectedGenre"
      @ionChange="handleGenreChange"
      :scrollable="scrollable"
    >
      <ion-segment-button value="all">
        <ion-label>All Genres</ion-label>
      </ion-segment-button>
      
      <ion-segment-button
        v-for="genre in genres"
        :key="genre.value"
        :value="genre.value"
      >
        <ion-icon v-if="genre.icon" :icon="genre.icon" />
        <ion-label>{{ genre.label }}</ion-label>
      </ion-segment-button>
    </ion-segment>
  </div>
</template>

<script setup lang="ts">
import {
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon
} from '@ionic/vue'

interface Genre {
  value: string
  label: string
  icon?: string
}

interface Props {
  selectedGenre: string
  genres?: Genre[]
  title?: string
  scrollable?: boolean
}

withDefaults(defineProps<Props>(), {
  genres: () => [
    { value: 'pop', label: 'Pop' },
    { value: 'rock', label: 'Rock' },
    { value: 'hip-hop', label: 'Hip Hop' },
    { value: 'electronic', label: 'Electronic' },
    { value: 'country', label: 'Country' },
    { value: 'jazz', label: 'Jazz' },
    { value: 'classical', label: 'Classical' },
    { value: 'other', label: 'Other' }
  ],
  scrollable: true
})

const emit = defineEmits<{
  genreChange: [genre: string]
}>()

const handleGenreChange = (event: CustomEvent) => {
  emit('genreChange', event.detail.value)
}
</script>

<style scoped>
.genre-selector {
  width: 100%;
  padding: 1rem;
}

.selector-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

ion-segment {
  --background: var(--bg-tertiary);
}
</style>
