<template>
  <div class="tv-view">
    <div class="background-pattern"></div>
    <div class="tv-content">
      <div class="view-header">
        <div class="restaurant-name">O SIBARITA</div>
        <h1 class="view-title">SUGERENCIAS DEL CHEF</h1>
      </div>
      
      <div v-if="!sugerencias.length" class="empty-state">
        <div class="empty-icon">👨‍🍳</div>
        <h2 class="empty-title">No hay sugerencias disponibles</h2>
        <p class="empty-subtitle">Consulte nuestra carta o pregunte a nuestro personal</p>
      </div>
      
      <div v-else class="view-body">
        <div class="chef-message">
          <div class="chef-avatar">
            <div class="chef-icon">👨‍🍳</div>
          </div>
          <div class="message-content">
            <p class="quote">"Estas son mis recomendaciones especiales para hoy. He seleccionado ingredientes frescos de temporada para crear platos únicos que espero disfruten."</p>
            <p class="chef-name">— Javier Romero, Chef Ejecutivo</p>
          </div>
        </div>
        
        <div class="sugerencias-showcase">
          <div 
            v-for="(plato, index) in sugerencias" 
            :key="plato.id"
            class="sugerencia-item"
            :class="{'sugerencia-principal': index === 0}"
          >
            <div class="sugerencia-imagen-container">
              <div v-if="plato.imagen" class="sugerencia-imagen">
                <img :src="pb.files.getUrl(plato, 'imagen')" alt="Sugerencia" />
              </div>
              <div v-else class="sugerencia-imagen sugerencia-imagen-placeholder">
                <span class="placeholder-icon">🍽️</span>
              </div>
            </div>
            
            <div class="sugerencia-detalles">
              <h2 class="sugerencia-nombre">{{ plato.nombre }}</h2>
              <p class="sugerencia-descripcion">{{ plato.descripcion || 'Una exquisita creación de nuestro chef con ingredientes seleccionados.' }}</p>
              
              <div class="sugerencia-footer">
                <div class="sugerencia-precio">
                  <span class="price-tag">{{ plato.precio || '0' }}€{{ plato.precio_medio ? ' / ' + plato.precio_medio + '€' : '' }}</span>
                </div>
                
                <div v-if="index === 0" class="chef-recomendacion">
                  <span>Recomendación del chef</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import pb from '@/services/pocketbase.js'

export default {
  name: 'SugerenciasChef',
  setup() {
    const sugerencias = ref([])

    const loadSugerencias = async () => {
      try {
        sugerencias.value = await pb.collection('platos').getFullList({
          filter: 'categoria = "sugerencias" || categoria = "sugerencias_chef"',
          sort: '-created'
        })
      } catch (error) {
        console.error('Error SugerenciasChef:', error)
      }
    }

    onMounted(() => {
      loadSugerencias()
    })

    return {
      sugerencias,
      pb
    }
  }
}
</script>

<style scoped>
/* Estilos específicos del componente SugerenciasChef */
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
  /* Aumentar la opacidad para que sea visible */
  opacity: 0.3;
  
  /* Fondo base con gradiente */
  background: linear-gradient(135deg, 
    rgba(25, 25, 25, 0.95) 0%, 
    rgba(35, 35, 35, 0.97) 50%, 
    rgba(25, 25, 25, 0.95) 100%);
  
  /* Patrón de azulejos con colores más visibles */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><defs><linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23d4af37" stop-opacity="0.2"/><stop offset="100%" stop-color="%23b08b29" stop-opacity="0.15"/></linearGradient></defs><rect width="40" height="40" fill="%23222" fill-opacity="0.7"/><path d="M0,20 L20,0 L40,20 L20,40 Z" fill="%23282828" fill-opacity="0.4"/><path d="M20,0 L40,20 L20,40 L0,20 Z" fill="%23333" fill-opacity="0.3"/><path d="M10,10 L20,20 L10,30 L0,20 Z" fill="url(%23goldGrad)"/><path d="M30,10 L40,20 L30,30 L20,20 Z" fill="url(%23goldGrad)"/></svg>');
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

.chef-message {
  background: rgba(18, 18, 18, 0.7);
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  border-left: 4px solid #d4af37;
  max-width: 90%;
  margin-left: auto;
  margin-right: auto;
}

.chef-avatar {
  flex-shrink: 0;
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #d4af37, #b08b29);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.chef-icon {
  font-size: 2rem;
}

.message-content {
  flex-grow: 1;
}

.quote {
  font-style: italic;
  color: #f8f8f8;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.chef-name {
  text-align: right;
  color: #d4af37;
  font-weight: 600;
}

.sugerencias-showcase {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  padding: 0 1rem 1rem;
  flex: 1;
}

.sugerencia-item {
  background-color: rgba(30, 30, 30, 0.5) !important; /* Más transparencia */
  backdrop-filter: blur(2px); /* Efecto blur para mejorar legibilidad */
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  border: 1px solid rgba(212, 175, 55, 0.2);
  transition: all 0.3s ease;
  backdrop-filter: blur(3px);
}

.sugerencia-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  border-color: rgba(212, 175, 55, 0.5);
}

.sugerencia-principal {
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(18, 18, 18, 0.95));
  border: 1px solid rgba(212, 175, 55, 0.5);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
}

.sugerencia-imagen-container {
  flex: 0 0 35%;
}

.sugerencia-imagen {
  height: 100%;
  min-height: 220px;
  overflow: hidden;
}

.sugerencia-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.sugerencia-item:hover .sugerencia-imagen img {
  transform: scale(1.05);
}

.sugerencia-imagen-placeholder {
  background: linear-gradient(135deg, #1e1e1e, #2c2c2c);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 3rem;
  opacity: 0.3;
}

.sugerencia-detalles {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.sugerencia-nombre {
  color: #d4af37;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.sugerencia-principal .sugerencia-nombre {
  font-size: 1.8rem;
}

.sugerencia-descripcion {
  color: #e0e0e0;
  margin-bottom: 1.5rem;
  flex-grow: 1;
  line-height: 1.6;
}

.sugerencia-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(212, 175, 55, 0.2);
}

.sugerencia-precio {
  display: flex;
  flex-direction: column;
}

/* Ajuste precio de la media para que aparezca junto al precio principal */
.price-tag {
  background-color: #d4af37;
  color: #121212;
  padding: 0.4vh 0.8vw;
  border-radius: 0.6vh;
  font-weight: 700;
  display: inline-block;
  font-size: 1.1rem;
}

.price-tag span {
  font-size: 0.9rem;
  font-weight: normal;
}

.chef-recomendacion {
  background-color: rgba(212, 175, 55, 0.2);
  color: #d4af37;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  font-style: italic;
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

@media (max-width: 768px) {
  .chef-message {
    flex-direction: column;
    text-align: center;
  }
  
  .chef-avatar {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .chef-name {
    text-align: center;
  }
  
  .sugerencia-item {
    flex-direction: column;
  }
  
  .sugerencia-imagen-container {
    flex: none;
    width: 100%;
  }
  
  .sugerencia-imagen {
    min-height: 180px;
  }
  
  .sugerencia-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
  
  .chef-recomendacion {
    align-self: flex-end;
  }
  
  .view-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>