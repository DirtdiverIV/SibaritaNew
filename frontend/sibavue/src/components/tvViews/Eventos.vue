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
        <div class="eventos-container">
          <div class="eventos-scroll">
            <!-- Primera copia de los eventos -->
            <div v-for="evento in eventos" 
                 :key="'first-' + evento.id"
                 class="evento-card">
              <div v-if="evento.imagen" class="evento-imagen">
                <img :src="pb.files.getUrl(evento, evento.imagen)" alt="evento" />
              </div>
              <div v-else class="evento-imagen evento-imagen-placeholder">
                <span class="placeholder-icon">🎉</span>
              </div>
              
              <div class="evento-content">
                <h3 class="evento-nombre">{{ evento.titulo }}</h3>
                <p v-if="evento.descripcion" class="evento-descripcion">
                  {{ evento.descripcion }}
                </p>
                <div class="evento-precio">
                  <span class="price-tag">Desde {{ evento.precio_desde }}€</span>
                </div>
              </div>
            </div>
            <!-- Segunda copia de los eventos -->
            <div v-for="evento in eventos" 
                 :key="'second-' + evento.id"
                 class="evento-card">
              <div v-if="evento.imagen" class="evento-imagen">
                <img :src="pb.files.getUrl(evento, evento.imagen)" alt="evento" />
              </div>
              <div v-else class="evento-imagen evento-imagen-placeholder">
                <span class="placeholder-icon">🎉</span>
              </div>
              
              <div class="evento-content">
                <h3 class="evento-nombre">{{ evento.titulo }}</h3>
                <p v-if="evento.descripcion" class="evento-descripcion">
                  {{ evento.descripcion }}
                </p>
                <div class="evento-precio">
                  <span class="price-tag">Desde {{ evento.precio_desde }}€</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Evento destacado -->
        <div v-if="eventoDestacado" class="evento-destacado" :class="{ 'fade-in': mostrarDestacado }">
          <div class="destacado-imagen">
            <img v-if="eventoDestacado.imagen" :src="pb.files.getUrl(eventoDestacado, eventoDestacado.imagen)" alt="evento destacado" />
            <div v-else class="destacado-imagen-placeholder">
              <span class="placeholder-icon">🎉</span>
            </div>
          </div>
          <div class="destacado-content">
            <div class="destacado-header">
              <span class="destacado-tag">Realiza tus eventos con nosotros</span>
            </div>
            <div class="destacado-info">
              <div class="destacado-texto">
                <h2 class="destacado-nombre">{{ eventoDestacado.titulo }}</h2>
                <p v-if="eventoDestacado.descripcion" class="destacado-descripcion">
                  {{ eventoDestacado.descripcion }}
                </p>
              </div>
              <div class="destacado-precio">
                <span class="price-tag">Desde {{ eventoDestacado.precio_desde }}€</span>
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
    const eventoDestacado = ref(null)
    const mostrarDestacado = ref(true)
    const currentIndex = ref(0)
    
    // Función para seleccionar un evento aleatorio
    const seleccionarEventoDestacado = () => {
      if (eventos.value.length === 0) return
      const eventoAleatorio = eventos.value[Math.floor(Math.random() * eventos.value.length)]
      eventoDestacado.value = eventoAleatorio
    }

    // Función para manejar el scroll horizontal
    const scrollEventos = () => {
      const container = document.querySelector('.eventos-scroll')
      if (container) {
        const cardWidth = container.clientWidth / 6
        currentIndex.value++
        
        // Si llegamos al final de la primera copia, volvemos al inicio sin animación
        if (currentIndex.value >= eventos.value.length) {
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

    const loadEventos = async () => {
      try {
        eventos.value = await pb.collection('eventos').getFullList({
          sort: '-created'
        })
        seleccionarEventoDestacado()
      } catch (err) {
        console.error('Error Eventos:', err)
      }
    }
    
    onMounted(() => {
      loadEventos()
      scrollInterval = setInterval(scrollEventos, 3000) // Cambia cada 3 segundos
      destacadoInterval = setInterval(() => {
        mostrarDestacado.value = false
        setTimeout(() => {
          seleccionarEventoDestacado()
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
      eventos,
      pb,
      eventoDestacado,
      mostrarDestacado
    }
  }
}
</script>

<style scoped>
/* Estilos específicos del componente Eventos */
.tv-view {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  /* Fondo base eliminado para evitar que tape el patrón */
  background: none;
  font-family: 'Montserrat', sans-serif;
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  /* Aumentar la opacidad para que sea más visible */
  opacity: 0.5;
  
  /* Fondo base con gradiente */
  background: linear-gradient(135deg,
     rgba(25, 25, 25, 0.95) 0%,
     rgba(35, 35, 35, 0.97) 50%,
     rgba(25, 25, 25, 0.95) 100%);
  
  /* Patrón con la forma del segundo ejemplo pero con los colores del primero */
  background-image: url('data:image/svg+xml;utf8,<svg width="80" height="88" viewBox="0 0 80 88" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23d4af37" stop-opacity="0.6"/><stop offset="100%" stop-color="%23b08b29" stop-opacity="0.5"/></linearGradient></defs><rect width="80" height="88" fill="%23222" fill-opacity="0.7"/><path d="M22 21.91V26h-2c-9.94 0-18 8.06-18 18 0 9.943 8.058 18 18 18h2v4.09c8.012.722 14.785 5.738 18 12.73 3.212-6.99 9.983-12.008 18-12.73V62h2c9.94 0 18-8.06 18-18 0-9.943-8.058-18-18-18h-2v-4.09c-8.012-.722-14.785-5.738-18-12.73-3.212 6.99-9.983 12.008-18 12.73zM54 58v4.696c-5.574 1.316-10.455 4.428-14 8.69-3.545-4.262-8.426-7.374-14-8.69V58h-5.993C12.27 58 6 51.734 6 44c0-7.732 6.275-14 14.007-14H26v-4.696c5.574-1.316 10.455-4.428 14-8.69 3.545 4.262 8.426 7.374 14 8.69V30h5.993C67.73 30 74 36.266 74 44c0 7.732-6.275 14-14.007 14H54zM42 88c0-9.94 8.06-18 18-18h2v-4.09c8.016-.722 14.787-5.738 18-12.73v7.434c-3.545 4.262-8.426 7.374-14 8.69V74h-5.993C52.275 74 46 80.268 46 88h-4zm-4 0c0-9.943-8.058-18-18-18h-2v-4.09c-8.012-.722-14.785-5.738-18-12.73v7.434c3.545 4.262 8.426 7.374 14 8.69V74h5.993C27.73 74 34 80.266 34 88h4zm4-88c0 9.943 8.058 18 18 18h2v4.09c8.012.722 14.785 5.738 18 12.73v-7.434c-3.545-4.262-8.426-7.374-14-8.69V14h-5.993C52.27 14 46 7.734 46 0h-4zM0 34.82c3.213-6.992 9.984-12.008 18-12.73V18h2c9.94 0 18-8.06 18-18h-4c0 7.732-6.275 14-14.007 14H14v4.696c-5.574 1.316-10.455 4.428-14 8.69v7.433z" fill="url(%23goldGrad)" fill-opacity="0.8" fill-rule="evenodd"/></svg>');
}

.tv-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 1.5vh 1.5vw;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* Nuevo header con título a la derecha y nombre del restaurante a la izquierda */
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
}

.eventos-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  margin-bottom: 1rem;
  height: 35vh;
}

.eventos-scroll {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  padding: 0 1rem;
  height: 100%;
  overflow-x: auto;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.eventos-scroll::-webkit-scrollbar {
  display: none;
}

.evento-card {
  width: calc((100vw - 12rem) / 6);
  height: 100%;
  background-color: rgba(30, 30, 30, 0.5);
  backdrop-filter: blur(2px);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 55, 0.2);
  transition: all 0.3s ease;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.evento-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  border-color: rgba(212, 175, 55, 0.5);
}

.evento-imagen {
  height: 60%;
  overflow: hidden;
  position: relative;
}

.evento-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.evento-card:hover .evento-imagen img {
  transform: scale(1.05);
}

.evento-imagen-placeholder {
  background: linear-gradient(135deg, #1e1e1e, #2c2c2c);
  display: flex;
  align-items: center;
  justify-content: center;
}

.evento-content {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.evento-nombre {
  color: #d4af37;
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.evento-descripcion {
  color: #e0e0e0;
  margin-bottom: 1rem;
  flex-grow: 1;
  font-size: 0.95rem;
}

.evento-precio {
  margin-top: auto;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(212, 175, 55, 0.2);
  font-weight: 600;
}

/* Estilos para el evento destacado */
.evento-destacado {
  position: relative;
  width: 100%;
  height: 45vh;
  margin-top: 1rem;
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

.evento-destacado.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.destacado-imagen {
  flex: 1.2;
  height: 100%;
  overflow: hidden;
}

.destacado-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.destacado-imagen-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1e1e1e, #2c2c2c);
  display: flex;
  align-items: center;
  justify-content: center;
}

.destacado-content {
  flex: 1;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to right, rgba(30, 30, 30, 0.95), rgba(30, 30, 30, 0.85));
  width: 100%;
}

.destacado-header {
  margin-bottom: 2rem;
}

.destacado-tag {
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

.destacado-info {
  display: flex;
  flex-direction: row;
  gap: 3rem;
  height: 100%;
}

.destacado-texto {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.destacado-nombre {
  color: #d4af37;
  font-size: 3.5rem;
  margin: 0;
  font-weight: 700;
  text-transform: uppercase;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  line-height: 1.1;
  letter-spacing: 1px;
}

.destacado-descripcion {
  color: #e0e0e0;
  font-size: 2rem;
  line-height: 1.6;
  margin: 0;
  flex: 1;
  display: flex;
  align-items: center;
}

.destacado-precio {
  display: flex;
  align-items: center;
  padding-left: 2rem;
  border-left: 2px solid rgba(212, 175, 55, 0.3);
}

.destacado-precio .price-tag {
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

.price-tag {
  background-color: #d4af37;
  color: #121212;
  padding: 0.4vh 0.8vw;
  border-radius: 0.6vh;
  font-weight: 700;
  display: inline-block;
  font-size: 1.1rem;
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif;
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
  .evento-card {
    margin-bottom: 1.5rem;
  }
  
  .evento-image {
    height: 180px;
  }
  
  .view-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}

.eventos-container {
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.evento-item {
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif;
}
</style>