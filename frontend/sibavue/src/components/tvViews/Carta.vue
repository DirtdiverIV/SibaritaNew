<template>
  <div class="tv-view">
    <div class="background-pattern"></div>
    <div class="tv-content">
      <div v-if="isLoading" class="tv-loading-container">
        <TvLoading />
      </div>
      <template v-else>
        <div class="view-header">
          <div class="restaurant-name">O SIBARITA</div>
          <h1 class="view-title">NUESTRA CARTA</h1>
        </div>
        
        <div v-if="!carta.length" class="empty-state">
          <div class="empty-icon">🍽️</div>
          <h2 class="empty-title">No hay platos en la carta</h2>
          <p class="empty-subtitle">Consulte nuestro menú del día o pregunte a nuestro personal</p>
        </div>
        
        <div v-else class="view-body">
          <!-- Plato destacado -->
          <div v-if="platoDestacado" class="plato-destacado" :class="{ 'fade-in': mostrarDestacado }">
            <div class="destacado-imagen">
              <img v-if="platoDestacado.imagen" :src="pb.files.getUrl(platoDestacado, platoDestacado.imagen)" alt="plato destacado" />
              <div v-else class="destacado-imagen-placeholder">
                <span class="placeholder-icon">🍽️</span>
              </div>
            </div>
            <div class="destacado-content">
              <div class="destacado-header">
                <span class="destacado-tag">Hoy recomendamos</span>
              </div>
              <div class="destacado-info">
                <div class="destacado-texto">
                  <h2 class="destacado-nombre">{{ platoDestacado.nombre }}</h2>
                  <p v-if="platoDestacado.descripcion" class="destacado-descripcion">
                    {{ platoDestacado.descripcion }}
                  </p>
                </div>
                <div class="destacado-precio">
                  <span class="price-tag">{{ platoDestacado.precio }}€{{ platoDestacado.precio_medio ? ' / ' + platoDestacado.precio_medio + '€' : '' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Sección de platos -->
          <div class="platos-container">
            <div class="platos-scroll">
              <!-- Primera copia de los platos -->
              <div v-for="plato in carta" 
                   :key="'first-' + plato.id"
                   class="plato-card">
                <div v-if="plato.imagen" class="plato-imagen">
                  <img :src="pb.files.getUrl(plato, plato.imagen)" alt="plato" />
                </div>
                <div v-else class="plato-imagen plato-imagen-placeholder">
                  <span class="placeholder-icon">🍽️</span>
                </div>
                
                <div class="plato-content">
                  <h3 class="plato-nombre">{{ plato.nombre }}</h3>
                  <p v-if="plato.descripcion" class="plato-descripcion">
                    {{ plato.descripcion }}
                  </p>
                  <div class="plato-precio">
                    <span class="price-tag">{{ plato.precio }}€{{ plato.precio_medio ? ' / ' + plato.precio_medio + '€' : '' }}</span>
                  </div>
                </div>
              </div>
              <!-- Segunda copia de los platos -->
              <div v-for="plato in carta" 
                   :key="'second-' + plato.id"
                   class="plato-card">
                <div v-if="plato.imagen" class="plato-imagen">
                  <img :src="pb.files.getUrl(plato, plato.imagen)" alt="plato" />
                </div>
                <div v-else class="plato-imagen plato-imagen-placeholder">
                  <span class="placeholder-icon">🍽️</span>
                </div>
                
                <div class="plato-content">
                  <h3 class="plato-nombre">{{ plato.nombre }}</h3>
                  <p v-if="plato.descripcion" class="plato-descripcion">
                    {{ plato.descripcion }}
                  </p>
                  <div class="plato-precio">
                    <span class="price-tag">{{ plato.precio }}€{{ plato.precio_medio ? ' / ' + plato.precio_medio + '€' : '' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import pb from '@/services/pocketbase.js'
import TvLoading from './TvLoading.vue'

export default {
  name: 'Carta',
  components: {
    TvLoading
  },
  setup() {
    const isLoading = ref(true)
    const carta = ref([])
    const platoDestacado = ref(null)
    const mostrarDestacado = ref(true)
    const currentIndex = ref(0)
    
    // Función para seleccionar un plato aleatorio
    const seleccionarPlatoDestacado = () => {
      if (carta.value.length === 0) return
      const platoAleatorio = carta.value[Math.floor(Math.random() * carta.value.length)]
      platoDestacado.value = platoAleatorio
    }

    // Función para manejar el scroll horizontal
    const scrollPlatos = () => {
      const container = document.querySelector('.platos-scroll')
      if (container) {
        const cardWidth = container.clientWidth / 6
        currentIndex.value++
        
        // Si llegamos al final de la primera copia, volvemos al inicio sin animación
        if (currentIndex.value >= carta.value.length) {
          currentIndex.value = 0
          container.scrollLeft = 0
        }
        
        container.scrollTo({
          left: currentIndex.value * cardWidth,
          behavior: 'smooth'
        })
      }
    }

    let scrollInterval = null
    let destacadoInterval = null

    const loadData = async () => {
      try {
        isLoading.value = true
        carta.value = await pb.collection('platos').getFullList({
          filter: 'categoria = "carta" || categoria ~ "carta:"',
          sort: 'categoria,nombre'
        })
        seleccionarPlatoDestacado()
      } catch (err) {
        console.error('Error Carta:', err)
      } finally {
        isLoading.value = false
      }
    }
    
    onMounted(() => {
      loadData()
      scrollInterval = setInterval(scrollPlatos, 3000) // Cambia cada 3 segundos
      destacadoInterval = setInterval(() => {
        mostrarDestacado.value = false
        setTimeout(() => {
          seleccionarPlatoDestacado()
          mostrarDestacado.value = true
        }, 500)
      }, 8000)
    })

    onUnmounted(() => {
      if (scrollInterval) {
        clearInterval(scrollInterval)
      }
      if (destacadoInterval) {
        clearInterval(destacadoInterval)
      }
    })

    return {
      isLoading,
      carta,
      pb,
      platoDestacado,
      mostrarDestacado
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/tv-theme.scss';

.tv-view {
  @extend .tv-view;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.background-pattern {
  @extend .background-pattern;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}

.tv-content {
  @extend .tv-content;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 1.5vh 1.5vw;
  overflow: hidden;
}

.view-header {
  @extend .view-header;
}

.restaurant-name {
  @extend .restaurant-name;
}

.view-title {
  @extend .view-title;
}

.view-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100vh - 15vh);
  margin: 0;
  padding: 0;
}

.platos-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  margin-top: 1rem;
  height: 35vh;
  width: 100%;
}

.platos-scroll {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  padding: 0 1rem;
  height: 100%;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  margin: 0;

  &::-webkit-scrollbar {
    display: none;
  }
}

.plato-card {
  @include tv-card;
  width: calc((100vw - 12rem) / 6);
  height: 100%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;

  &:hover {
    @include tv-card-hover;
  }
}

.plato-imagen {
  height: 60%;
  overflow: hidden;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
}

.plato-content {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: rgba(18, 18, 18, 0.7);
}

.plato-nombre {
  color: $tv-text-light;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.plato-descripcion {
  color: #b0b0b0;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  flex: 1;
}

.plato-precio {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price-tag {
  @include tv-price-tag;
}

.destacado-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(18, 18, 18, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.destacado-content {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.destacado-imagen {
  flex: 1;
  height: 100%;
  overflow: hidden;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.destacado-header {
  margin-bottom: 2rem;
}

.destacado-tag {
  background-color: $tv-primary-color;
  color: $tv-text-dark;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-size: 1.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.destacado-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2rem;
}

.destacado-texto {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.destacado-nombre {
  color: $tv-primary-color;
  font-size: 3.5rem;
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  line-height: 1.2;
}

.destacado-descripcion {
  color: $tv-text-light;
  font-size: 1.8rem;
  line-height: 1.6;
  margin: 0;
  max-width: 80%;
}

.destacado-precio {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 2rem;
  border-top: 2px solid rgba($tv-primary-color, 0.3);
}

.destacado-precio .price-tag {
  font-size: 2.5rem;
  padding: 1rem 2rem;
  background-color: $tv-primary-color;
  color: $tv-text-dark;
  border-radius: 12px;
  font-weight: 700;
  display: inline-block;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  letter-spacing: 1px;
}

.destacado-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: $tv-primary-color;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    color: $tv-text-light;
    transform: scale(1.1);
  }
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.6;
}

.empty-title {
  color: #d4af37;
  font-size: 3vh;
  margin-bottom: 2vh;
}

.empty-subtitle {
  font-size: 2vh;
  color: #e0e0e0;
}

.carta-container {
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.carta-title {
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.plato-item {
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif;
}

/* Estilos para el plato destacado */
.plato-destacado {
  position: relative;
  width: 100%;
  height: 45vh;
  margin: 0 0 1rem 0;
  border-radius: 12px;
  overflow: hidden;
  background-color: rgba(30, 30, 30, 0.7);
  backdrop-filter: blur(4px);
  border: 2px solid rgba(212, 175, 55, 0.3);
  display: flex;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.plato-destacado.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.destacado-imagen-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1e1e1e, #2c2c2c);
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .plato-destacado {
    height: 50vh;
    flex-direction: column;
  }

  .destacado-content {
    padding: 1.5rem;
  }

  .destacado-nombre {
    font-size: 2.8rem;
  }

  .destacado-descripcion {
    font-size: 1.5rem;
    max-width: 100%;
  }

  .destacado-precio {
    padding-top: 1.5rem;
  }

  .destacado-precio .price-tag {
    font-size: 2.2rem;
    padding: 0.8rem 1.5rem;
  }

  .destacado-tag {
    font-size: 1.4rem;
    padding: 0.6rem 1.5rem;
  }
}

.tv-loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
}
</style>