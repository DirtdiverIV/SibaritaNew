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
          <h1 class="view-title">CELEBRA TUS EVENTOS</h1>
        </div>
        
        <div v-if="!eventos.length" class="empty-state">
          <div class="empty-icon">📅</div>
          <h2 class="empty-title">No hay eventos programados</h2>
          <p class="empty-subtitle">Consulte en recepción para más información</p>
        </div>
        
        <div v-else class="view-body">
          <div class="evento-card" :class="{ 'fade-in': mostrarEvento }">
            <div v-if="eventoActual.imagen" class="evento-imagen">
              <img :src="pb.files.getUrl(eventoActual, eventoActual.imagen)" alt="evento" />
            </div>
            <div v-else class="evento-imagen evento-imagen-placeholder">
              <span class="placeholder-icon">🎉</span>
            </div>
            
            <div class="evento-content">
              <div class="evento-header">
                <span class="evento-tag">Realiza tus eventos con nosotros</span>
              </div>
              <div class="evento-info">
                <div class="evento-texto">
                  <h2 class="evento-nombre">{{ eventoActual.titulo }}</h2>
                  <p v-if="eventoActual.descripcion" class="evento-descripcion">
                    <template v-for="(linea, index) in eventoActual.descripcion.split('\n')" :key="index">
                      <template v-if="linea.trim().startsWith('-')">
                        <span class="lista-item">{{ linea.trim().substring(1) }}</span><br>
                      </template>
                      <template v-else>
                        {{ linea }}<br>
                      </template>
                    </template>
                  </p>
                </div>
                <div class="evento-precio">
                  <span class="price-tag">Desde {{ eventoActual.precio_desde }}€</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="view-footer">
          <p class="reserve-info">Para reservas: 
            <span class="has-shimmer">
              <i class="fas fa-phone"></i>
              691 36 95 82
            </span>
            <span class="contact-separator">|</span>
            <span class="has-shimmer">
              <i class="fab fa-whatsapp"></i>
              WhatsApp
            </span>
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import pb from '@/services/pocketbase.js'
import TvLoading from './TvLoading.vue'
import '@/assets/styles/tv-theme.scss'

export default {
  name: 'Eventos',
  components: {
    TvLoading
  },
  setup() {
    const isLoading = ref(true)
    const eventos = ref([])
    const eventoActual = ref(null)
    const mostrarEvento = ref(true)
    const currentIndex = ref(0)
    
    const seleccionarSiguienteEvento = () => {
      if (eventos.value.length === 0) return
      mostrarEvento.value = false
      setTimeout(() => {
        currentIndex.value = (currentIndex.value + 1) % eventos.value.length
        eventoActual.value = eventos.value[currentIndex.value]
        mostrarEvento.value = true
      }, 500)
    }

    let eventoInterval = null

    const loadEventos = async () => {
      try {
        isLoading.value = true
        eventos.value = await pb.collection('eventos').getFullList({
          sort: '-created'
        })
        if (eventos.value.length > 0) {
          eventoActual.value = eventos.value[0]
        }
      } catch (err) {
        console.error('Error Eventos:', err)
      } finally {
        isLoading.value = false
      }
    }
    
    onMounted(() => {
      loadEventos()
      eventoInterval = setInterval(seleccionarSiguienteEvento, 8000)
    })

    onUnmounted(() => {
      if (eventoInterval) {
        clearInterval(eventoInterval)
      }
    })

    return {
      isLoading,
      eventos,
      pb,
      eventoActual,
      mostrarEvento
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/tv-theme.scss';

.tv-view {
  @extend .tv-view;
}

.background-pattern {
  @extend .background-pattern;
}

.tv-content {
  @extend .tv-content;
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
  @extend .view-body;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100vh - 15vh);
}

.evento-card {
  @include tv-card;
  width: 100%;
  height: 100%;
  display: flex;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.evento-card.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.evento-imagen {
  flex: 1.2;
  height: 100%;
  overflow: hidden;
}

.evento-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.evento-imagen-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1e1e1e, #2c2c2c);
  display: flex;
  align-items: center;
  justify-content: center;
}

.evento-content {
  flex: 1;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to right, rgba(30, 30, 30, 0.95), rgba(30, 30, 30, 0.85));
  width: 100%;
}

.evento-header {
  margin-bottom: 2rem;
}

.evento-tag {
  @include tv-price-tag;
  font-size: 1.8rem;
  padding: 0.8rem 2rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.evento-info {
  display: flex;
  flex-direction: row;
  gap: 3rem;
  height: 100%;
}

.evento-texto {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.evento-nombre {
  color: $tv-primary-color;
  font-size: 3.5rem;
  margin: 0;
  font-weight: 700;
  text-transform: uppercase;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  line-height: 1.1;
  letter-spacing: 1px;
}

.evento-descripcion {
  color: $tv-text-light;
  font-size: 2.4rem;
  line-height: 1.6;
  margin: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.lista-item {
  display: block;
  padding-left: 2.5rem;
  position: relative;
  font-size: 2.4rem;
  
  &::before {
    content: "•";
    color: $tv-primary-color;
    position: absolute;
    left: 0;
    font-size: 1.8em;
    line-height: 1;
  }
}

.evento-precio {
  display: flex;
  align-items: center;
  padding-left: 2rem;
  border-left: 2px solid $tv-border-color;
  
  .price-tag {
    @include tv-price-tag;
    font-size: 3rem;
    padding: 1rem 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    letter-spacing: 1px;
  }
}

.view-footer {
  text-align: center;
  padding: 1rem;
  background-color: rgba(18, 18, 18, 0.6);
  border-top: 1px solid $tv-border-color;
  margin-top: auto;
}

.contact-separator {
  margin: 0 1rem;
  color: $tv-text-light;
  opacity: 0.5;
}

.reserve-info {
  font-size: 2rem;
  color: $tv-text-light;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  i {
    margin-right: 0.5rem;
    font-size: 1.8rem;
  }
}

.has-shimmer {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: linear-gradient(90deg, 
    rgba($tv-primary-color, 0.1) 0%, 
    rgba($tv-primary-color, 0.3) 50%, 
    rgba($tv-primary-color, 0.1) 100%);
  background-size: 200% 100%;
  animation: shimmer 3s infinite;
  border-radius: 4px;
  font-size: 2rem;
}

@keyframes shimmer {
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
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
  color: $tv-primary-color;
  font-size: 3vh;
  margin-bottom: 2vh;
}

.empty-subtitle {
  font-size: 2vh;
  color: $tv-text-light;
}

@media screen and (max-width: 768px) {
  .evento-content {
    padding: 2rem;
  }
  
  .evento-nombre {
    font-size: 2.5rem;
  }
  
  .evento-descripcion {
    font-size: 1.5rem;
  }
  
  .evento-tag {
    font-size: 1.4rem;
    padding: 0.6rem 1.5rem;
  }
  
  .evento-precio .price-tag {
    font-size: 2rem;
    padding: 0.8rem 1.5rem;
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