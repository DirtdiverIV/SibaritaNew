<template>
  <div class="tv-view">
    <div class="background-pattern"></div>
    <div class="tv-content">
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
        <!-- Agrupamos platos por categoría -->
        <div class="categoria-sections">
          <div v-for="(platosPorCategoria, categoria) in platosPorCategoriaMapped" 
               :key="categoria" 
               class="categoria-section">
            
            
            <div class="platos-grid">
              <div v-for="plato in platosPorCategoria" 
                   :key="plato.id"
                   class="plato-card">
                
                <div v-if="plato.imagen" class="plato-imagen">
                  <img :src="pb.files.getUrl(plato, 'imagen')" alt="plato" />
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
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import pb from '@/services/pocketbase.js'

export default {
  name: 'Carta',
  setup() {
    const carta = ref([])
    
    // Agrupar platos por categoría
    const platosPorCategoriaMapped = computed(() => {
      const categoriasMap = {};
      
      carta.value.forEach(plato => {
        // Extraer subcategoría si existe (formato: categoria:subcategoria)
        const categoriaBase = plato.categoria.split(':')[0].trim();
        
        if (!categoriasMap[categoriaBase]) {
          categoriasMap[categoriaBase] = [];
        }
        
        categoriasMap[categoriaBase].push(plato);
      });
      
      return categoriasMap;
    });

    const loadCarta = async () => {
      try {
        carta.value = await pb.collection('platos').getFullList({
          filter: 'categoria = "carta" || categoria ~ "carta:"',
          sort: 'categoria,nombre'
        })
      } catch (err) {
        console.error('Error Carta:', err)
      }
    }
    
    // Formatea el nombre de la categoría para visualización
    const formatCategoria = (categoria) => {
      // Convertir primera letra a mayúscula y el resto en minúsculas
      return categoria.charAt(0).toUpperCase() + categoria.slice(1).toLowerCase();
    }

    onMounted(() => {
      loadCarta()
    })

    return {
      carta,
      platosPorCategoriaMapped,
      formatCategoria,
      pb
    }
  }
}
</script>

<style scoped>
/* Estilos específicos del componente Carta */
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

.categoria-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 0 1rem;
  overflow-y: auto;
  height: 100%;
}

.categoria-section {
  background-color: rgba(30, 30, 30, 0.5) !important; /* Más transparencia */
  backdrop-filter: blur(2px); /* Efecto blur para mejorar legibilidad */
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 55, 0.2);
  padding-bottom: 1rem;
  padding-top: 1rem;
  backdrop-filter: blur(3px);
}

.platos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 0 1rem;
}

.plato-card {
  background-color: rgba(30, 30, 30, 0.5) !important; /* Más transparencia */
  backdrop-filter: blur(2px); /* Efecto blur para mejorar legibilidad */
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 55, 0.2);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.plato-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  border-color: rgba(212, 175, 55, 0.5);
}

.plato-imagen {
  height: 180px;
  overflow: hidden;
  position: relative;
}

.plato-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.plato-card:hover .plato-imagen img {
  transform: scale(1.05);
}

.plato-imagen-placeholder {
  background: linear-gradient(135deg, #1e1e1e, #2c2c2c);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 3rem;
  opacity: 0.3;
}

.plato-content {
  flex: 1;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
}

.plato-nombre {
  color: #d4af37;
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
  font-weight: 600;
}

.plato-descripcion {
  color: #e0e0e0;
  margin-bottom: 1rem;
  flex-grow: 1;
  font-size: 0.95rem;
  font-style: italic;
}

.plato-precio {
  margin-top: auto;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(212, 175, 55, 0.2);
  font-weight: 600;
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

.view-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (max-width: 768px) {
  .platos-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
  
  .plato-imagen {
    height: 150px;
  }
  
  .plato-nombre {
    font-size: 1.1rem;
  }
  
  .view-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>