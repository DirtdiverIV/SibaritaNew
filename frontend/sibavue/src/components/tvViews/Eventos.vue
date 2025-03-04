<template>
  <div class="eventos-view">
    <div class="has-text-centered mb-5">
      <h1 class="title is-1 has-text-gold">Próximos Eventos</h1>
      <div class="divider"><span>✦</span></div>
    </div>
    
    <div v-if="!eventos.length" class="no-eventos has-text-centered">
      <p class="subtitle is-4">No hay eventos programados</p>
      <p>Consulte en recepción para más información</p>
    </div>
    
    <div v-else class="columns is-multiline">
      <div 
        v-for="(ev, index) in eventos" 
        :key="ev.id"
        class="column is-12-mobile is-6-tablet is-4-desktop"
      >
        <div class="evento-card" :class="{ 'special': index === 0 }">
          <div class="evento-image" v-if="ev.imagen">
            <img :src="pb.files.getUrl(ev, 'imagen')" alt="Evento" />
          </div>
          <div class="evento-content">
            <h3 class="evento-title">{{ ev.titulo }}</h3>
            <p class="evento-description">{{ ev.descripcion }}</p>
            <div class="evento-price">
              <span>Desde {{ ev.precio_desde }}€</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="has-text-centered mt-6">
      <p class="reserve-info">Para reservas: 
        <span class="has-shimmer">info@sibaritatestaurant.com</span> o 
        <span class="has-shimmer">+34 91 234 5678</span>
      </p>
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
.eventos-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.has-text-gold {
  color: #d4af37;
}

.divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 45%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5));
}

.divider::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  width: 45%;
  height: 1px;
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.5), transparent);
}

.divider span {
  display: inline-block;
  padding: 0 10px;
  color: #d4af37;
  position: relative;
  font-size: 1.2rem;
}

.evento-card {
  background: rgba(30, 30, 30, 0.7);
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  transition: all 0.3s ease;
  border: 1px solid rgba(212, 175, 55, 0.2);
  display: flex;
  flex-direction: column;
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
  font-size: 1.1rem;
  color: #fff;
}

.no-eventos {
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.reserve-info {
  font-size: 1.1rem;
  color: #e0e0e0;
}

.has-shimmer {
  display: inline-block;
  padding: 2px 6px;
}

@media screen and (max-width: 768px) {
  .eventos-view {
    padding: 1rem;
  }
  
  .evento-card {
    margin-bottom: 1.5rem;
  }
  
  .evento-image {
    height: 180px;
  }
}
</style>