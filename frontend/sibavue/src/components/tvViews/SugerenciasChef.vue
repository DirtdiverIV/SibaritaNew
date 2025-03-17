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
          <h1 class="view-title">SUGERENCIAS DEL CHEF</h1>
        </div>
        
        <div v-if="!sugerencias.length" class="empty-state">
          <div class="empty-icon">👨‍🍳</div>
          <h2 class="empty-title">No hay sugerencias disponibles</h2>
          <p class="empty-subtitle">Consulte nuestra carta o pregunte a nuestro personal</p>
        </div>
        
        <div v-else class="view-body">
          <div class="sugerencia-principal" v-if="sugerenciaActual">
            <div class="sugerencia-header">
              <h2 class="sugerencia-titulo">HOY RECOMENDAMOS</h2>
            </div>
            
            <div class="sugerencia-content">
              <div class="sugerencia-imagen-container">
                <div v-if="sugerenciaActual.imagen" class="sugerencia-imagen">
                  <img :src="pb.files.getUrl(sugerenciaActual, sugerenciaActual.imagen)" :alt="sugerenciaActual.nombre" />
                </div>
                <div v-else class="sugerencia-imagen sugerencia-imagen-placeholder">
                  <span class="placeholder-icon">🍽️</span>
                </div>
              </div>
              
              <div class="sugerencia-detalles">
                <h3 class="sugerencia-nombre">{{ sugerenciaActual.nombre }}</h3>
                <p class="sugerencia-descripcion">{{ sugerenciaActual.descripcion || 'Una exquisita creación de nuestro chef con ingredientes seleccionados.' }}</p>
                
                <div class="sugerencia-footer">
                  <div class="sugerencia-precio">
                    <span class="price-tag">{{ sugerenciaActual.precio }}€</span>
                    <span v-if="sugerenciaActual.precio_medio" class="price-medio">
                      Media: {{ sugerenciaActual.precio_medio }}€
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import pb from '@/services/pocketbase.js'
import TvLoading from './TvLoading.vue'

export default {
  name: 'SugerenciasChef',
  components: {
    TvLoading
  },
  setup() {
    const isLoading = ref(true)
    const sugerencias = ref([])
    const sugerenciaActual = ref(null)
    const currentIndex = ref(0)
    let rotationInterval

    const loadSugerencias = async () => {
      try {
        console.log('Cargando sugerencias...')
        const records = await pb.collection('platos').getFullList({
          filter: 'categoria = "carta" && es_sugerencia = true',
          sort: '-created'
        })
        console.log('Sugerencias cargadas:', records)
        sugerencias.value = records
        if (sugerencias.value.length > 0) {
          sugerenciaActual.value = sugerencias.value[0]
          console.log('Sugerencia actual:', sugerenciaActual.value)
          if (sugerenciaActual.value.imagen) {
            console.log('URL de la imagen:', pb.files.getUrl(sugerenciaActual.value, sugerenciaActual.value.imagen))
          } else {
            console.log('La sugerencia actual no tiene imagen')
          }
        }
        isLoading.value = false
      } catch (error) {
        console.error('Error SugerenciasChef:', error)
        isLoading.value = false
      }
    }

    const rotarSugerencias = () => {
      if (sugerencias.value.length > 0) {
        currentIndex.value = (currentIndex.value + 1) % sugerencias.value.length
        sugerenciaActual.value = sugerencias.value[currentIndex.value]
        console.log('Rotando a sugerencia:', sugerenciaActual.value)
      }
    }

    onMounted(() => {
      loadSugerencias()
      // Rotar cada 30 segundos
      rotationInterval = setInterval(rotarSugerencias, 30000)
    })

    onUnmounted(() => {
      if (rotationInterval) {
        clearInterval(rotationInterval)
      }
    })

    return {
      isLoading,
      sugerencias,
      sugerenciaActual,
      pb
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/tv-theme.scss';

/* Estilos específicos del componente SugerenciasChef */
.tv-view {
  @extend .tv-view;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: none;
  font-family: 'Montserrat', sans-serif;
}

.background-pattern {
  @extend .background-pattern;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}

.tv-content {
  @extend .tv-content;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 1.5vh 1.5vw;
  overflow: hidden;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 15vh);
  padding: 2vh;
}

.sugerencia-principal {
  background: rgba(18, 18, 18, 0.8);
  border-radius: 15px;
  overflow: hidden;
  margin: 0 auto;
  width: 95%;
  height: 80vh;
  border: 2px solid rgba(212, 175, 55, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.sugerencia-header {
  background: linear-gradient(135deg, #d4af37, #b08b29);
  padding: 2vh;
  text-align: center;
}

.sugerencia-titulo {
  color: #fff;
  font-size: 4vh;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 3px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.sugerencia-content {
  display: flex;
  padding: 3vh;
  gap: 3vh;
  align-items: center;
  flex: 1;
}

.sugerencia-imagen-container {
  flex: 0 0 50%;
  height: 100%;
  overflow: hidden;
  border-radius: 10px;
  border: 3px solid rgba(212, 175, 55, 0.2);
  aspect-ratio: 4/3;
  max-height: 60vh;
}

.sugerencia-imagen {
  width: 100%;
  height: 100%;
  position: relative;
}

.sugerencia-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
}

.sugerencia-detalles {
  flex: 1;
  color: #fff;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.sugerencia-nombre {
  font-size: 5vh;
  margin: 0 0 2vh;
  color: #d4af37;
  line-height: 1.2;
}

.sugerencia-descripcion {
  font-size: 3vh;
  line-height: 1.6;
  margin-bottom: 3vh;
  font-style: italic;
  flex: 1;
}

.sugerencia-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.sugerencia-precio {
  text-align: right;
}

.price-tag {
  font-size: 6vh;
  color: #d4af37;
  font-weight: bold;
}

.price-medio {
  display: block;
  font-size: 3vh;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 1vh;
}

.sugerencia-imagen-placeholder {
  background: rgba(212, 175, 55, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.placeholder-icon {
  font-size: 10vh;
  color: rgba(212, 175, 55, 0.3);
}

.empty-state {
  @extend .empty-state;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  
  .empty-icon {
    font-size: 10vh;
    margin-bottom: 3vh;
    opacity: 0.6;
  }
  
  .empty-title {
    color: #d4af37;
    font-size: 4vh;
    margin-bottom: 2vh;
  }
  
  .empty-subtitle {
    font-size: 2.5vh;
    color: #e0e0e0;
  }
}

@media (max-width: 768px) {
  .sugerencia-content {
    flex-direction: column;
  }
  
  .sugerencia-imagen-container {
    width: 100%;
    height: 40vh;
  }
  
  .sugerencia-nombre {
    font-size: 4vh;
  }
  
  .sugerencia-descripcion {
    font-size: 2.5vh;
  }
  
  .price-tag {
    font-size: 5vh;
  }
  
  .price-medio {
    font-size: 2.5vh;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.sugerencia-principal {
  animation: fadeIn 0.5s ease-out;
}
</style>