import { ref } from 'vue'

export function useBattleAudio() {
  const audioContextForRoulette = ref<AudioContext | null>(null)
  const rouletteSource = ref<AudioBufferSourceNode | null>(null)
  const confettiSound = ref<HTMLAudioElement | null>(null)

  const playRouletteSoundWithPitch = async () => {
    try {
      if (!audioContextForRoulette.value) {
        audioContextForRoulette.value = new AudioContext()
      }
      
      // Use dynamic import for the sound file from assets
      const rouletteSoundUrl = new URL('@/assets/sounds/roulette.wav', import.meta.url).href
      const response = await fetch(rouletteSoundUrl)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioContextForRoulette.value.decodeAudioData(arrayBuffer)
      
      const source = audioContextForRoulette.value.createBufferSource()
      source.buffer = audioBuffer
      
      const gainNode = audioContextForRoulette.value.createGain()
      gainNode.gain.value = 0.7
      
      source.connect(gainNode)
      gainNode.connect(audioContextForRoulette.value.destination)
      source.playbackRate.value = 0.7  // Lower pitch
      
      source.start(0)
      source.loop = true
      
      rouletteSource.value = source
      console.log('Playing roulette sound with Web Audio API')
    } catch (error) {
      console.warn('Could not play roulette sound:', error)
    }
  }

  const stopRouletteSound = () => {
    if (rouletteSource.value) {
      rouletteSource.value.stop()
      rouletteSource.value = null
    }
  }

  const playConfettiSound = async () => {
    try {
      if (!confettiSound.value) {
        // Use dynamic import for the sound file from assets
        const confettiSoundUrl = new URL('@/assets/sounds/confetti.wav', import.meta.url).href
        confettiSound.value = new Audio(confettiSoundUrl)
        confettiSound.value.volume = 0.7
      }
      confettiSound.value.currentTime = 0
      await confettiSound.value.play()
      console.log('Playing confetti sound')
    } catch (error) {
      console.warn('Could not play confetti sound:', error)
    }
  }

  return {
    playRouletteSoundWithPitch,
    stopRouletteSound,
    playConfettiSound
  }
}
