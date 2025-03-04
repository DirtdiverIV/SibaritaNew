<template>
  <div class="sugerencias-view">
    <div class="sugerencias-header">
      <h1 class="sugerencias-title">Sugerencias del Chef</h1>
    </div>
    
    <div v-if="!sugerencias.length" class="sugerencias-empty">
      <div class="empty-container">
        <div class="empty-icon">👨‍🍳</div>
        <h2>No hay sugerencias disponibles</h2>
        <p>Consulte nuestra carta o pregunte a nuestro personal</p>
      </div>
    </div>
    
    <div v-else class="sugerencias-content">
      <!-- Mensaje del chef -->
      <div class="chef-message">
        <div class="chef-avatar">
          <div class="chef-icon">👨‍🍳</div>
        </div>
        <div class="message-content">
          <p class="quote">"Estas son mis recomendaciones especiales para hoy. He seleccionado ingredientes frescos de temporada para crear platos únicos que espero disfruten."</p>
          <p class="chef-name">— Javier Romero, Chef Ejecutivo</p>
        </div>
      </div>
      
      <!-- Sugerencias principales -->
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
                <span class="precio-valor">{{ plato.precio || '0' }}€</span>
                <span v-if="plato.precio_medio" class="precio-medio">(Media: {{ plato.precio_medio }}€)</span>
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
.sugerencias-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #242424;
  font-family: 'Montserrat', sans-serif;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23242424"/><path d="M0 20 L20 0 L40 20 L20 40 Z" fill="%23282828" fill-opacity="0.2"/></svg>') repeat;
}

.sugerencias-header {
  text-align: center;
  padding: 1.5rem 1rem;
  background: linear-gradient(to bottom, rgba(18, 18, 18, 0.9), rgba(18, 18, 18, 0.6), transparent);
}

.sugerencias-title {
  color: #d4af37;
  font-size: 2.5rem;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  position: relative;
  display: inline-block;
}

.sugerencias-title::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
}

.sugerencias-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  overflow-y: auto;
}

.chef-message {
  background: rgba(18, 18, 18, 0.7);
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  border-left: 4px solid #d4af37;
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
  flex: 1;
}

.sugerencia-item {
  background: rgba(30, 30, 30, 0.7);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  border: 1px solid rgba(212, 175, 55, 0.2);
  transition: all 0.3s ease;
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

.precio-valor {
  background: #d4af37;
  color: #121212;
  font-weight: 600;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 1.2rem;
}

.precio-medio {
  margin-top: 0.3rem;
  color: #a0a0a0;
  font-style: italic;
  font-size: 0.9rem;
}

.chef-recomendacion {
  background-color: rgba(212, 175, 55, 0.2);
  color: #d4af37;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  font-style: italic;
}

.sugerencias-empty {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.empty-container {
  text-align: center;
  padding: 3rem;
  background-color: rgba(30, 30, 30, 0.8);
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.6;
}

.empty-container h2 {
  color: #d4af37;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.empty-container p {
  color: #b0b0b0;
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
}
</style>