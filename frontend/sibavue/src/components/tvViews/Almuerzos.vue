<template>
  <div class="tv-view">
    <div class="background-pattern"></div>
    <div class="tv-content">
      <div class="view-header">
        <div class="restaurant-name">O SIBARITA</div>
        <h1 class="view-title">ALMUERZOS</h1>
      </div>
      
      <div class="view-body">
        <div class="almuerzos-grid">
          <div v-for="almuerzo in almuerzos" 
               :key="almuerzo.id" 
               class="almuerzo-card"
               :class="{ 'highlighted': almuerzo.id === highlightedId }">
            <div class="almuerzo-content">
              <div class="almuerzo-header">
                <h2 class="almuerzo-nombre">{{ almuerzo.nombre }}</h2>
                <div class="almuerzo-precio">{{ almuerzo.precio }}€</div>
              </div>

              <div class="almuerzo-body">
                <div class="almuerzo-imagen" v-if="almuerzo.imagen">
                  <img :src="getImageUrl(almuerzo)" :alt="almuerzo.nombre">
                </div>
                
                <div class="almuerzo-items">
                  <div v-for="item in almuerzoItems[almuerzo.id] || []" 
                       :key="item.id" 
                       class="almuerzo-item">
                    <div class="item-nombre">{{ item.nombre }}</div>
                    <div v-if="item.descripcion" class="item-descripcion">{{ item.descripcion }}</div>
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
import { ref, onMounted, onUnmounted } from 'vue'
import pb from '@/services/pocketbase.js'

export default {
  name: 'Almuerzos',
  setup() {
    const almuerzos = ref([])
    const almuerzoItems = ref({})
    const highlightedId = ref(null)
    let highlightInterval = null

    const loadAlmuerzos = async () => {
      try {
        console.log('Cargando almuerzos...')
        const records = await pb.collection('almuerzos').getFullList({
          sort: 'created'
        })
        
        console.log('Almuerzos cargados:', records)
        almuerzos.value = records
        
        // Cargar todos los items de una vez
        const allItems = await pb.collection('almuerzo_items').getFullList({
          sort: 'created'
        })
        
        console.log('Todos los items:', allItems)
        
        // Organizar los items por almuerzo
        records.forEach(almuerzo => {
          const items = allItems.filter(item => 
            item.almuerzo && item.almuerzo.includes(almuerzo.id)
          )
          console.log('Items filtrados para almuerzo', almuerzo.id, ':', items)
          almuerzoItems.value[almuerzo.id] = items
        })
      } catch (error) {
        console.error('Error cargando almuerzos:', error)
      }
    }

    const getImageUrl = (item) => {
      if (!item || !item.imagen) return ''
      return pb.files.getUrl(item, item.imagen)
    }

    const startHighlightRotation = () => {
      let currentIndex = 0
      highlightInterval = setInterval(() => {
        if (almuerzos.value.length > 0) {
          highlightedId.value = almuerzos.value[currentIndex].id
          currentIndex = (currentIndex + 1) % almuerzos.value.length
        }
      }, 5000)
    }

    onMounted(() => {
      loadAlmuerzos()
      startHighlightRotation()
    })

    onUnmounted(() => {
      if (highlightInterval) {
        clearInterval(highlightInterval)
      }
    })

    return {
      almuerzos,
      almuerzoItems,
      highlightedId,
      getImageUrl
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/tv-theme.scss';

.tv-view {
  @extend .tv-view;
}

.background-pattern {
  @extend .background-pattern;
}

.tv-content {
  @extend .tv-content;
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
  overflow: hidden;
  padding: 1.5rem;
}

.almuerzos-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
  gap: 1.5rem;
  flex: 1;
  height: calc(100vh - 15vh);
}

.almuerzo-card {
  @include tv-card;
  display: flex;
  flex-direction: column;
  transition: all 0.5s ease;
  padding: 0;
  overflow: hidden;
  width: calc(33% - 1rem);
  min-width: 300px;
  height: calc((100vh - 20vh) / 2);
  
  &.highlighted {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
    border-color: $tv-primary-color;
    background-color: rgba(18, 18, 18, 0.9);
  }
}

.almuerzo-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.almuerzo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1.2rem;
  background-color: rgba(18, 18, 18, 0.8);
  border-bottom: 2px solid rgba(212, 175, 55, 0.3);
}

.almuerzo-body {
  display: flex;
  flex: 1;
  padding: 0.8rem;
  gap: 0.8rem;
}

.almuerzo-nombre {
  color: $tv-primary-color;
  font-size: 2.5vh;
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
}

.almuerzo-precio {
  @include tv-price-tag;
  font-size: 2.2vh;
  padding: 0.3rem 0.8rem;
}

.almuerzo-imagen {
  width: 30%;
  height: auto;
  min-height: 100%;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
  }
}

.almuerzo-items {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  gap: 0.5rem;
  flex: 1;
  background-color: rgba(18, 18, 18, 0.6);
  border-radius: 6px;
  padding: 0.8rem;
}

.almuerzo-item {
  background-color: rgba(30, 30, 30, 0.5);
  border-radius: 6px;
  padding: 0.6rem 1rem;
  border-left: 4px solid $tv-primary-color;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
    background-color: rgba(30, 30, 30, 0.8);
  }
}

.item-nombre {
  color: #ffffff;
  font-size: 2.2vh;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.item-descripcion {
  color: $tv-primary-color;
  font-size: 1.8vh;
  font-style: italic;
}

@media (max-width: 1200px) {
  .almuerzo-card {
    width: calc(50% - 1rem);
  }
  
  .almuerzo-body {
    flex-direction: column;
  }
  
  .almuerzo-imagen {
    width: 100%;
    height: 15vh;
    min-height: auto;
  }

  .item-nombre {
    font-size: 2vh;
  }
  
  .item-descripcion {
    font-size: 1.6vh;
  }
}

@media (max-width: 768px) {
  .almuerzo-card {
    width: 100%;
  }
  
  .almuerzo-nombre {
    font-size: 2.2vh;
  }
  
  .almuerzo-precio {
    font-size: 2vh;
  }
  
  .item-nombre {
    font-size: 1.8vh;
  }
  
  .item-descripcion {
    font-size: 1.5vh;
  }
}
</style> 