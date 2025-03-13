<template>
  <div class="tv-view">
    <div class="background-pattern"></div>
    <div class="tv-content">
      <div class="view-header">
        <div class="restaurant-name">O SIBARITA</div>
        <h1 class="view-title">PRÓXIMOS EVENTOS</h1>
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
                  {{ eventoActual.descripcion }}
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
          <span class="has-shimmer">info@sibaritatestaurant.com</span> o 
          <span class="has-shimmer">+34 91 234 5678</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import pb from '@/services/pocketbase.js'

export default {
  name: 'Eventos',
  setup() {
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
        eventos.value = await pb.collection('eventos').getFullList({
          sort: '-created'
        })
        if (eventos.value.length > 0) {
          eventoActual.value = eventos.value[0]
        }
      } catch (err) {
        console.error('Error Eventos:', err)
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
      eventos,
      pb,
      eventoActual,
      mostrarEvento
    }
  }
}
</script>

<style scoped>
.tv-view {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: none;
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif !important;
}

.background-pattern {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  opacity: 0.5;
  background: linear-gradient(135deg,
    rgba(25, 25, 25, 0.95) 0%,
    rgba(35, 35, 35, 0.97) 50%,
    rgba(25, 25, 25, 0.95) 100%);
  background-image: url('data:image/svg+xml;utf8,<svg width="80" height="88" viewBox="0 0 80 88" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23d4af37" stop-opacity="0.6"/><stop offset="100%" stop-color="%23b08b29" stop-opacity="0.5"/></linearGradient></defs><rect width="80" height="88" fill="%23222" fill-opacity="0.7"/><path d="M22 21.91V26h-2c-9.94 0-18 8.06-18 18 0 9.943 8.058 18 18 18h2v4.09c8.012.722 14.785 5.738 18 12.73 3.212-6.99 9.983-12.008 18-12.73V62h2c9.94 0 18-8.06 18-18 0-9.943-8.058-18-18-18h-2v-4.09c-8.012-.722-14.785-5.738-18-12.73-3.212 6.99-9.983 12.008-18 12.73zM54 58v4.696c-5.574 1.316-10.455 4.428-14 8.69-3.545-4.262-8.426-7.374-14-8.69V58h-5.993C12.27 58 6 51.734 6 44c0-7.732 6.275-14 14.007-14H26v-4.696c5.574-1.316 10.455-4.428 14-8.69 3.545 4.262 8.426 7.374 14 8.69V30h5.993C67.73 30 74 36.266 74 44c0 7.732-6.275 14-14.007 14H54zM42 88c0-9.94 8.06-18 18-18h2v-4.09c8.016-.722 14.787-5.738 18-12.73v7.434c-3.545 4.262-8.426 7.374-14 8.69V74h-5.993C52.275 74 46 80.268 46 88h-4zm-4 0c0-9.943-8.058-18-18-18h-2v-4.09c-8.012-.722-14.785-5.738-18-12.73v7.434c3.545 4.262 8.426 7.374 14 8.69V74h5.993C27.73 74 34 80.266 34 88h4zm4-88c0 9.943 8.058 18 18 18h2v4.09c8.012.722 14.785 5.738 18 12.73v-7.434c-3.545-4.262-8.426-7.374-14-8.69V14h-5.993C52.27 14 46 7.734 46 0h-4zM0 34.82c3.213-6.992 9.984-12.008 18-12.73V18h2c9.94 0 18-8.06 18-18h-4c0 7.732-6.275 14-14.007 14H14v4.696c-5.574 1.316-10.455 4.428-14 8.69v7.433z" fill="url(%23goldGrad)" fill-opacity="0.8" fill-rule="evenodd"/></svg>');
}

.tv-content {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  padding: 1.5vh 1.5vw;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2vh;
  padding-bottom: 1vh;
  border-bottom: 2px solid #d4af37;
}

.restaurant-name {
  color: #ffffff;
  font-size: 2.8vh;
  font-weight: 700;
  letter-spacing: 2px;
}

.view-title {
  color: #d4af37;
  font-size: 3vh;
  font-weight: 700;
  text-transform: uppercase;
  margin: 0;
  letter-spacing: 3px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.view-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100vh - 15vh);
}

.evento-card {
  width: 100%;
  height: 100%;
  background-color: rgba(30, 30, 30, 0.7);
  backdrop-filter: blur(4px);
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(212, 175, 55, 0.3);
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
  background-color: #d4af37;
  color: #121212;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-size: 1.8rem;
  font-weight: 700;
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
  color: #d4af37;
  font-size: 3.5rem;
  margin: 0;
  font-weight: 700;
  text-transform: uppercase;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  line-height: 1.1;
  letter-spacing: 1px;
}

.evento-descripcion {
  color: #e0e0e0;
  font-size: 2rem;
  line-height: 1.6;
  margin: 0;
  flex: 1;
  display: flex;
  align-items: center;
}

.evento-precio {
  display: flex;
  align-items: center;
  padding-left: 2rem;
  border-left: 2px solid rgba(212, 175, 55, 0.3);
}

.evento-precio .price-tag {
  font-size: 3rem;
  padding: 1rem 2rem;
  background-color: #d4af37;
  color: #121212;
  border-radius: 12px;
  font-weight: 700;
  display: inline-block;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  letter-spacing: 1px;
}

.view-footer {
  text-align: center;
  padding: 1rem;
  background-color: rgba(18, 18, 18, 0.6);
  border-top: 1px solid rgba(212, 175, 55, 0.2);
  margin-top: auto;
}

.reserve-info {
  font-size: 1.1rem;
  color: #e0e0e0;
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.has-shimmer {
  display: inline-block;
  padding: 2px 6px;
  background: linear-gradient(90deg, 
    rgba(212, 175, 55, 0.1) 0%, 
    rgba(212, 175, 55, 0.3) 50%, 
    rgba(212, 175, 55, 0.1) 100%);
  background-size: 200% 100%;
  animation: shimmer 3s infinite;
  border-radius: 4px;
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
  color: #d4af37;
  font-size: 3vh;
  margin-bottom: 2vh;
}

.empty-subtitle {
  font-size: 2vh;
  color: #e0e0e0;
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
</style>