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

<style scoped>
/* Estilos específicos del componente MenuDia */
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
  padding: 0.8vh 1vw;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* Nuevo header con título a la derecha y nombre del restaurante a la izquierda */
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8vh;
  padding-bottom: 0.4vh;
  border-bottom: 2px solid #d4af37;
}

.restaurant-name {
  color: #ffffff;
  font-size: 2.5vh;
  font-weight: 700;
  letter-spacing: 2px;
}

.title-price-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.view-title {
  color: #d4af37;
  font-size: 2.8vh;
  font-weight: 700;
  text-transform: uppercase;
  margin: 0;
  letter-spacing: 3px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.menu-price {
  background-color: #d4af37;
  color: #121212;
  padding: 0.4vh 1.2vw;
  border-radius: 30px;
  font-weight: 700;
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
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: rgba(30, 30, 30, 0.5) !important;
  backdrop-filter: blur(2px);
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  overflow: hidden;
  max-width: 1600px;
  margin: 0 auto;
  width: 98%;
}

.menu-columns {
  display: grid;
  grid-template-columns: 1fr 1fr 0.8fr;
  gap: 1rem;
  padding: 1rem;
  height: 100%;
  overflow: hidden;
}

.menu-section {
  display: flex;
  flex-direction: column;
  background-color: rgba(30, 30, 30, 0.5) !important;
  backdrop-filter: blur(2px);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 55, 0.2);
  height: 100%;
}

.menu-section:nth-child(1),
.menu-section:nth-child(2) {
  min-height: 85vh;
}

.menu-section:nth-child(3) {
  min-height: 85vh;
}

.section-header {
  padding: 0.8vh;
  background-color: rgba(18, 18, 18, 0.6);
  border-bottom: 1px solid rgba(212, 175, 55, 0.25);
}

.section-title {
  color: #d4af37;
  font-size: 3vh;
  text-align: center;
  font-weight: 600;
  margin: 0;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.section-divider {
  height: 2px;
  width: 100px;
  margin: 0.5rem auto;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.7), transparent);
}

.platos-lista {
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  gap: 0.8rem;
}

.platos-lista.justify-evenly {
  justify-content: space-evenly;
}

.plato-item {
  padding: 1rem;
  border-bottom: 1px dashed rgba(212, 175, 55, 0.2);
  transition: all 0.5s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 30%;
  background-color: rgba(18, 18, 18, 0.3);
  border-radius: 6px;
  transform: translateX(0);
}

.plato-item.highlighted {
  background-color: rgba(212, 175, 55, 0.15);
  transform: translateX(10px);
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3);
  border: 1px solid rgba(212, 175, 55, 0.4);
}

.plato-item.highlighted .plato-nombre {
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  font-weight: 800;
}

.plato-item.highlighted .plato-descripcion {
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.plato-item:hover {
  background-color: rgba(212, 175, 55, 0.1);
  transform: translateX(5px);
  box-shadow: 0 2px 10px rgba(212, 175, 55, 0.2);
}

.plato-item:last-child {
  border-bottom: none;
}

.plato-nombre {
  font-weight: 700;
  color: #f8f8f8;
  margin-bottom: 1rem;
  font-size: 2.6vh;
  text-align: center;
  line-height: 1.3;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.plato-descripcion {
  color: #b0b0b0;
  font-size: 2.2vh;
  text-align: center;
  line-height: 1.4;
  padding: 0 1rem;
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
  padding: 0.8rem;
  background-color: rgba(18, 18, 18, 0.8);
  border-top: 1px solid rgba(212, 175, 55, 0.3);
  color: #d4af37;
  font-style: italic;
  font-size: 1.6vh;
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
  
  .plato-item {
    height: 45%;
  }
}

@media (max-width: 768px) {
  .menu-container {
    width: 100%;
  }
  
  .menu-columns {
    grid-template-columns: 1fr;
    gap: 0.8rem;
    padding: 0.8rem;
  }
  
  .menu-section:nth-child(3) {
    height: auto;
  }
  
  .plato-item {
    height: 25vh;
  }
  
  .section-title {
    font-size: 2.8vh;
  }
  
  .plato-nombre {
    font-size: 2.4vh;
  }
  
  .plato-descripcion {
    font-size: 2vh;
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