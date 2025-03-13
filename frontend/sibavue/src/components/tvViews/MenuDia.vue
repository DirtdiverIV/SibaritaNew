<template>
  <div class="tv-view">
    <div class="background-pattern"></div>
    <div class="tv-content">
      <div class="view-header">
        <div class="restaurant-name">O SIBARITA</div>
        <div class="title-price-container">
          <h1 class="view-title">MENÚ DEL DÍA</h1>
          <div v-if="menuDia" class="menu-price">{{ menuDia.precio }}€</div>
        </div>
      </div>
      
      <div v-if="!menuDia" class="empty-state">
        <div class="empty-icon">🍽️</div>
        <h2 class="empty-title">No hay menú del día disponible</h2>
        <p class="empty-subtitle">Consulte nuestras sugerencias o la carta</p>
      </div>
      
      <div v-else class="view-body">
        <div class="menu-container">
          <div class="menu-columns">
            <!-- Primeros platos -->
            <div class="menu-section">
              <div class="section-header">
                <h3 class="section-title">Primeros</h3>
                <div class="section-divider"></div>
              </div>
              
              <div class="platos-lista" :class="{ 'justify-evenly': primeros.length === 2 }">
                <div v-if="primeros.length === 0" class="empty-section">
                  <p>No hay primeros disponibles</p>
                </div>
                <div v-else v-for="(plato, index) in primeros" :key="plato.id" class="plato-item" :class="{ 'highlighted': currentHighlighted === `primeros-${index}` }">
                  <div class="plato-nombre">{{ plato.nombre }}</div>
                  <div v-if="plato.descripcion" class="plato-descripcion">{{ plato.descripcion }}</div>
                </div>
              </div>
            </div>
            
            <!-- Segundos platos -->
            <div class="menu-section">
              <div class="section-header">
                <h3 class="section-title">Segundos</h3>
                <div class="section-divider"></div>
              </div>
              
              <div class="platos-lista" :class="{ 'justify-evenly': segundos.length === 2 }">
                <div v-if="segundos.length === 0" class="empty-section">
                  <p>No hay segundos disponibles</p>
                </div>
                <div v-else v-for="(plato, index) in segundos" :key="plato.id" class="plato-item" :class="{ 'highlighted': currentHighlighted === `segundos-${index}` }">
                  <div class="plato-nombre">{{ plato.nombre }}</div>
                  <div v-if="plato.descripcion" class="plato-descripcion">{{ plato.descripcion }}</div>
                </div>
              </div>
            </div>
            
            <!-- Postres -->
            <div class="menu-section">
              <div class="section-header">
                <h3 class="section-title">Postres</h3>
                <div class="section-divider"></div>
              </div>
              
              <div class="platos-lista" :class="{ 'justify-evenly': postres.length === 2 }">
                <div v-if="postres.length === 0" class="empty-section">
                  <p>No hay postres disponibles</p>
                </div>
                <div v-else v-for="(plato, index) in postres" :key="plato.id" class="plato-item" :class="{ 'highlighted': currentHighlighted === `postres-${index}` }">
                  <div class="plato-nombre">{{ plato.nombre }}</div>
                  <div v-if="plato.descripcion" class="plato-descripcion">{{ plato.descripcion }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="menu-footer">
            <p>Incluye pan, bebida y café</p>
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
  name: 'MenuDia',
  setup() {
    const menuDia = ref(null)
    const primeros = ref([])
    const segundos = ref([])
    const postres = ref([])
    const currentHighlighted = ref(null)
    let highlightInterval = null

    const highlightNextItem = () => {
      const allItems = [
        ...primeros.value.map((_, i) => `primeros-${i}`),
        ...segundos.value.map((_, i) => `segundos-${i}`),
        ...postres.value.map((_, i) => `postres-${i}`)
      ]

      const currentIndex = allItems.indexOf(currentHighlighted.value)
      const nextIndex = (currentIndex + 1) % allItems.length
      currentHighlighted.value = allItems[nextIndex]
    }

    const startHighlightAnimation = () => {
      // Iniciar con el primer elemento
      currentHighlighted.value = 'primeros-0'
      
      // Cambiar cada 3 segundos
      highlightInterval = setInterval(highlightNextItem, 3000)
    }

    const stopHighlightAnimation = () => {
      if (highlightInterval) {
        clearInterval(highlightInterval)
        highlightInterval = null
      }
    }

    const loadData = async () => {
      try {
        // Obtener menú del día
        const lista = await pb.collection('menu_dia').getFullList({
          sort: '-created',
          limit: 1
        })
        
        if (lista.length) {
          menuDia.value = lista[0]
          
          // Cargar los platos del menú del día
          const menuId = menuDia.value.id
          
          // Cargar primeros
          primeros.value = await pb.collection('menu_dia_primeros').getFullList({
            filter: `field = "${menuId}"`,
            sort: 'created'
          })
          
          // Cargar segundos
          segundos.value = await pb.collection('menu_dia_segundos').getFullList({
            filter: `field = "${menuId}"`,
            sort: 'created'
          })
          
          // Cargar postres
          postres.value = await pb.collection('menu_dia_postres').getFullList({
            filter: `field = "${menuId}"`,
            sort: 'created'
          })
          
          // Iniciar la animación después de cargar los datos
          startHighlightAnimation()
        }
      } catch (err) {
        console.error('Error MenuDia:', err)
      }
    }

    onMounted(() => {
      loadData()
    })

    onUnmounted(() => {
      stopHighlightAnimation()
    })

    return {
      menuDia,
      primeros,
      segundos,
      postres,
      currentHighlighted
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

.title-price-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.menu-price {
  @include tv-price-tag;
  font-size: 2vh;
}

.view-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.menu-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
  box-sizing: border-box;
}

.menu-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  flex: 1;
  min-height: 0;
}

.menu-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: rgba(30, 30, 30, 0.5);
  backdrop-filter: blur(2px);
  border-radius: 8px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  overflow: hidden;
}

.section-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
  text-align: center;
}

.section-title {
  color: #d4af37;
  font-size: 3vh;
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
  text-align: center;
}

.section-divider {
  height: 2px;
  width: 100px;
  margin: 0.5rem auto;
  background: linear-gradient(90deg, transparent, rgba($tv-primary-color, 0.7), transparent);
}

.platos-lista {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  min-height: 0;
  justify-content: space-between;
}

.platos-lista.justify-evenly {
  justify-content: space-evenly;
}

.plato-item {
  background-color: rgba(18, 18, 18, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  border-left: 2px solid transparent;
  width: 100%;
  box-sizing: border-box;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.plato-item.highlighted {
  background-color: rgba(18, 18, 18, 0.9);
  border-left: 3px solid #d4af37;
  transform: translateX(5px);
}

.plato-nombre {
  color: #ffffff;
  font-size: 3.5vh;
  font-weight: 600;
  margin-bottom: 0.8rem;
}

.plato-descripcion {
  color: #d4af37;
  font-size: 2.8vh;
  line-height: 1.3;
}

.empty-section {
  text-align: center;
  padding: 2rem;
  color: #a0a0a0;
  font-style: italic;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 2.4vh;
  background-color: rgba(18, 18, 18, 0.3);
  border-radius: 6px;
}

.menu-footer {
  text-align: center;
  padding: 1rem;
  color: #d4af37;
  font-style: italic;
  font-size: 2vh;
  border-top: 1px solid rgba(212, 175, 55, 0.3);
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

@media (max-width: 1200px) {
  .menu-columns {
    grid-template-columns: 1fr 1fr;
  }
  
  .menu-section:nth-child(3) {
    grid-column: 1 / -1;
    height: 35%;
  }
}

@media (max-width: 768px) {
  .menu-container {
    padding: 0.8rem;
  }
  
  .menu-columns {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  
  .menu-section:nth-child(3) {
    height: auto;
  }
  
  .section-title {
    font-size: 3.2vh;
  }
  
  .plato-nombre {
    font-size: 3.2vh;
  }
  
  .plato-descripcion {
    font-size: 2.6vh;
  }

  .plato-item {
    padding: 1.2rem;
  }
}

.menu-dia-container {
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.menu-title {
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.menu-item {
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif;
}
</style>