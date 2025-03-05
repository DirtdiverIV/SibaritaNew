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
              <img :src="pb.files.getUrl(ev, 'imagen')" alt="Evento" />
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
  background: radial-gradient(
    ellipse at center, 
    rgba(30, 30, 30, 0.7) 0%, 
    rgba(20, 20, 20, 0.8) 70%, 
    rgba(10, 10, 10, 0.85) 100%
  );
  font-family: 'Montserrat', sans-serif;
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  opacity: 0.15;
  
  /* Fondo base con gradiente */
  background: linear-gradient(135deg, 
    rgba(25, 25, 25, 0.95) 0%, 
    rgba(35, 35, 35, 0.97) 50%, 
    rgba(25, 25, 25, 0.95) 100%);
  
  /* Patrón de azulejos Alhambra */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><defs><linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23d4af37" stop-opacity="0.07"/><stop offset="100%" stop-color="%23b08b29" stop-opacity="0.05"/></linearGradient></defs><rect width="40" height="40" fill="%23222" fill-opacity="0.7"/><path d="M0,20 L20,0 L40,20 L20,40 Z" fill="%23282828" fill-opacity="0.4"/><path d="M20,0 L40,20 L20,40 L0,20 Z" fill="%23333" fill-opacity="0.3"/><path d="M10,10 L20,20 L10,30 L0,20 Z" fill="url(%23goldGrad)"/><path d="M30,10 L40,20 L30,30 L20,20 Z" fill="url(%23goldGrad)"/></svg>');
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
  background: rgba(30, 30, 30, 0.6);
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
  font-size: 1.4rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.evento-description {
  color: #e0e0e0;
  margin-bottom: 1rem;
  flex-grow: 1;
}

.evento-price {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(212, 175, 55, 0.2);
  font-weight: 600;
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
</style>