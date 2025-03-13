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
        <div class="eventos-grid">
          <div 
            v-for="(ev, index) in eventos" 
            :key="ev.id"
            class="evento-card" 
            :class="{ 'special': index === 0 }"
          >
            <div class="evento-image" v-if="ev.imagen">
              <img :src="pb.files.getUrl(ev, ev.imagen)" alt="Evento" />
            </div>
            <div class="evento-content">
              <h3 class="evento-title">{{ ev.titulo }}</h3>
              <p class="evento-description">{{ ev.descripcion }}</p>
              <div class="evento-price">
                <span class="price-tag">Desde {{ ev.precio_desde }}€</span>
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
import { ref, onMounted } from 'vue'
import pb from '@/services/pocketbase.js'

export default {
  name: 'Eventos',
  setup() {
    const eventos = ref([])

    const loadEventos = async () => {
      try {
        // Cargar todos los eventos
        eventos.value = await pb.collection('eventos').getFullList({
          sort: '-created'
        })
      } catch (err) {
        console.error('Error Eventos:', err)
      }
    }

    onMounted(() => {
      loadEventos()
    })

    return {
      eventos,
      pb // para usar pb.files.getUrl en el template
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

.eventos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 0 1rem;
  overflow-y: auto;
  max-height: calc(100% - 40px);
}

.evento-card {
  background-color: rgba(30, 30, 30, 0.5) !important; /* Más transparencia */
  backdrop-filter: blur(2px); /* Efecto blur para mejorar legibilidad */
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  transition: all 0.3s ease;
  border: 1px solid rgba(212, 175, 55, 0.2);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(3px);
}

.evento-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  border-color: rgba(212, 175, 55, 0.5);
}

.evento-card.special {
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.8), rgba(18, 18, 18, 0.9));
  border: 1px solid rgba(212, 175, 55, 0.5);
  position: relative;
}

.evento-card.special::before {
  content: 'Destacado';
  position: absolute;
  top: 15px;
  right: -25px;
  background: #d4af37;
  color: #121212;
  padding: 3px 25px;
  transform: rotate(45deg);
  font-size: 0.8rem;
  font-weight: 600;
  z-index: 1;
}

.evento-image {
  position: relative;
  overflow: hidden;
  height: 200px;
}

.evento-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.evento-card:hover .evento-image img {
  transform: scale(1.05);
}

.evento-content {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.evento-title {
  color: #d4af37;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  text-transform: uppercase;
}

.evento-description {
  color: #e0e0e0;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.evento-price {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(212, 175, 55, 0.2);
  font-weight: 600;
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif;
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