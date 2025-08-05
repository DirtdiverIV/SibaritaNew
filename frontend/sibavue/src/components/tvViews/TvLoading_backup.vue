<template>
  <div class="tv-loading">
    <div class="loading-content">
      <div class="loading-text">
        <template v-for="(word, wordIndex) in currentPhrase.split(' ')" :key="wordIndex">
          <span 
            v-if="word.toLowerCase() === 'sibarita'" 
            class="letter sibarita"
            v-for="(letter, letterIndex) in word" 
            :key="`sibarita-${wordIndex}-${letterIndex}`"
          >{{ letter }}</span>
          <span 
            v-else 
            class="letter"
            v-for="(letter, letterIndex) in word" 
            :key="`normal-${wordIndex}-${letterIndex}`"
          >{{ letter }}</span>
          <span v-if="wordIndex < currentPhrase.split(' ').length - 1" class="letter" :key="`space-${wordIndex}`">&nbsp;</span>
        </template>
      </div>
      <div class="loading-spinner">
        <div class="spinner-inner"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'TvLoading',
  setup() {
    const phrases = [
      "Ser SIBARITA es una forma de vida",
      "El placer SIBARITA en cada bocado",
      "Un SIBARITA reconoce la excelencia",
      "Despierta tu SIBARITA interior",
      "Para SIBARITAS del buen comer",
      "La experiencia SIBARITA comienza aquí",
      "El arte SIBARITA de disfrutar",
      "Momentos SIBARITAS que perduran",
      "El gusto SIBARITA no se improvisa",
      "Tradición con esencia SIBARITA",
      "Celebramos tu espíritu SIBARITA",
      "El tiempo de un SIBARITA es sagrado",
      "La delicadeza SIBARITA en cada detalle",
      "O SIBARITA, donde los SIBARITAS se encuentran",
      "El SIBARITA sabe esperar",
      "Un festín para el paladar SIBARITA",
      "La pasión SIBARITA por lo auténtico",
      "El secreto SIBARITA está en nuestros sabores",
      "Cultivamos el estilo SIBARITA",
      "La filosofía SIBARITA: disfrutar sin prisa"
    ]

    // Función para obtener un número aleatorio entre min y max (inclusive)
    const getRandomInt = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1)) + min
    }

    // Seleccionar un índice aleatorio inicial
    const initialIndex = getRandomInt(0, phrases.length - 1)
    const currentPhrase = ref(phrases[initialIndex])
    const currentIndex = ref(initialIndex)
    let phraseInterval = null

    const rotatePhrases = () => {
      const nextIndex = (currentIndex.value + 1) % phrases.length
      currentIndex.value = nextIndex
      currentPhrase.value = phrases[nextIndex]
      console.log('Rotando a frase:', currentPhrase.value) // Para debugging
    }

    onMounted(() => {
      // Rotar cada 5 segundos
      phraseInterval = setInterval(rotatePhrases, 5000)
      console.log('Iniciando rotación de frases desde:', currentPhrase.value) // Para debugging
    })

    onUnmounted(() => {
      if (phraseInterval) {
        clearInterval(phraseInterval)
      }
    })

    return {
      currentPhrase,
      currentIndex
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/tv-theme.scss';

.tv-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background-color: rgba(247, 247, 247, 0.9);
  backdrop-filter: blur(5px);
}

.loading-content {
  text-align: center;
  padding: 2rem;
  background: #EEEEEE;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(57, 62, 70, 0.2);
  border: 1px solid rgba(146, 154, 171, 0.3);
}

.loading-text {
  margin-bottom: 2rem;
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.letter {
  display: inline-block;
  font-size: 3rem;
  font-weight: 700;
  color: #393E46;
  text-shadow: 0 1px 2px rgba(57, 62, 70, 0.1);
  margin: 0 0.1rem;
  animation: bounce 1s infinite;
  animation-delay: calc(0.1s * var(--i));
  opacity: 0;
  transform: translateY(20px);
  animation-fill-mode: forwards;
}

.letter.sibarita {
  color: #929AAB;
  font-weight: 800;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateY(-20px);
    opacity: 0.8;
  }
}

.loading-spinner {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(146, 154, 171, 0.3);
  border-top-color: #393E46;
  animation: spin 1.5s linear infinite;
  margin: 0 auto;
}

.spinner-inner {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid rgba(146, 154, 171, 0.6);
  border-top-color: transparent;
  animation: spin 2s linear infinite reverse;
  margin: 5px auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media screen and (max-width: 768px) {
  .letter {
    font-size: 2rem;
  }
  
  .loading-spinner {
    width: 60px;
    height: 60px;
  }
  
  .spinner-inner {
    width: 45px;
    height: 45px;
  }
}
</style>
