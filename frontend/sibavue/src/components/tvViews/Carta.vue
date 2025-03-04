<template>
  <div class="carta-view">
    <div class="carta-header">
      <h1 class="carta-title">Nuestra Carta</h1>
    </div>
    
    <div v-if="!carta.length" class="carta-empty">
      <div class="empty-container">
        <div class="empty-icon">🍽️</div>
        <h2>No hay platos en la carta</h2>
        <p>Consulte nuestro menú del día o pregunte a nuestro personal</p>
      </div>
    </div>
    
    <div v-else class="carta-content">
      <!-- Agrupamos platos por categoría -->
      <div v-for="(platosPorCategoria, categoria) in platosPorCategoriaMapped" 
           :key="categoria" 
           class="categoria-section">
        
        <div class="categoria-header">
          <h2 class="categoria-title">{{ formatCategoria(categoria) }}</h2>
          <div class="categoria-divider"></div>
        </div>
        
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
                <span class="precio-principal">{{ plato.precio }}€</span>
                <span v-if="plato.precio_medio" class="precio-medio">
                  Media: {{ plato.precio_medio }}€
                </span>
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
.carta-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #242424;
  font-family: 'Montserrat', sans-serif;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><rect width="20" height="20" fill="%23242424"/><circle cx="10" cy="10" r="1" fill="%23333333"/></svg>') repeat;
}

.carta-header {
  text-align: center;
  padding: 1.5rem 1rem;
  background: linear-gradient(to bottom, rgba(18, 18, 18, 0.9), rgba(18, 18, 18, 0.6), transparent);
}

.carta-title {
  color: #d4af37;
  font-size: 2.5rem;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  position: relative;
  display: inline-block;
}

.carta-title::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
}

.carta-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.categoria-section {
  margin-bottom: 3rem;
}

.categoria-header {
  margin-bottom: 1.5rem;
}

.categoria-title {
  color: #d4af37;
  font-size: 1.8rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 0.5rem;
}

.categoria-divider {
  height: 2px;
  width: 120px;
  margin: 0 auto;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.7), transparent);
}

.platos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.plato-card {
  background-color: rgba(30, 30, 30, 0.7);
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.precio-principal {
  color: #ffffff;
  font-size: 1.2rem;
}

.precio-medio {
  font-size: 0.9rem;
  color: #a0a0a0;
  font-style: italic;
}

.carta-empty {
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
  .platos-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
  
  .plato-imagen {
    height: 150px;
  }
  
  .plato-nombre {
    font-size: 1.1rem;
  }
}
</style>