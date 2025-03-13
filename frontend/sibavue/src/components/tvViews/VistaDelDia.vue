<template>
  <div class="tv-view">
    <div class="background-pattern"></div>
    <div class="tv-content">
      <div class="view-header">
        <div class="restaurant-name">O SIBARITA</div>
        <h1 class="view-title">ESPECIALIDADES DEL DÍA</h1>
      </div>
      
      <div class="view-body">
        <div class="vista-grid">
          <!-- Sección Raciones -->
          <div class="section-container">
            <div class="section-header">
              <h2 class="section-title">Raciones</h2>
              <div class="section-divider"></div>
            </div>
            
            <div class="section-content">
              <div v-if="!raciones.length" class="empty-section">
                <p>No hay raciones disponibles hoy</p>
              </div>
              <div v-else class="platos-list">
                <div v-for="(item, index) in raciones" 
                     :key="item.id" 
                     class="plato-item"
                     :class="{ 'highlighted': highlightedIndex === index && currentSection === 'raciones' }">
                  <div class="plato-content">
                    <div class="plato-name">{{ item.nombre }}</div>
                    <div v-if="item.descripcion" class="plato-desc">{{ item.descripcion }}</div>
                  </div>
                  <div class="plato-price">
                    <span class="price-tag">{{ item.precio }}€{{ item.precio_medio ? ' / ' + item.precio_medio + '€' : '' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Sección Tapas -->
          <div class="section-container">
            <div class="section-header">
              <h2 class="section-title">Tapas</h2>
              <div class="section-divider"></div>
            </div>
            
            <div class="section-content">
              <div v-if="!tapas.length" class="empty-section">
                <p>No hay tapas disponibles hoy</p>
              </div>
              <div v-else class="platos-list">
                <div v-for="(item, index) in tapas" 
                     :key="item.id" 
                     class="plato-item"
                     :class="{ 'highlighted': highlightedIndex === index && currentSection === 'tapas' }">
                  <div class="plato-content">
                    <div class="plato-name">{{ item.nombre }}</div>
                    <div v-if="item.descripcion" class="plato-desc">{{ item.descripcion }}</div>
                  </div>
                  <div class="plato-price">
                    <span class="price-tag">{{ item.precio }}€</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Sección Menú del Día -->
          <div class="section-container menu-dia-container">
            <div class="section-header">
              <div class="menu-header-flex">
                <h2 class="section-title">Menú del Día</h2>
                <div v-if="menuDia" class="menu-price">{{ menuDia.precio }}€</div>
              </div>
              <div class="section-divider"></div>
            </div>
            
            <div class="section-content">
              <div v-if="!menuDia" class="empty-section">
                <p>No hay menú del día disponible</p>
              </div>
              <div v-else class="menu-completo">
                <!-- Primeros platos -->
                <div class="menu-seccion">
                  <h4 class="menu-seccion-title">Primeros</h4>
                  <ul class="menu-platos-list">
                    <li v-for="(plato, index) in primeros" 
                        :key="plato.id" 
                        class="menu-plato-item"
                        :class="{ 'highlighted': highlightedIndex === index && currentSection === 'primeros' }">
                      {{ plato.nombre }}
                      <span v-if="plato.descripcion" class="plato-desc-inline">- {{ plato.descripcion }}</span>
                    </li>
                  </ul>
                </div>
                
                <!-- Segundos platos -->
                <div class="menu-seccion">
                  <h4 class="menu-seccion-title">Segundos</h4>
                  <ul class="menu-platos-list">
                    <li v-for="(plato, index) in segundos" 
                        :key="plato.id" 
                        class="menu-plato-item"
                        :class="{ 'highlighted': highlightedIndex === index && currentSection === 'segundos' }">
                      {{ plato.nombre }}
                      <span v-if="plato.descripcion" class="plato-desc-inline">- {{ plato.descripcion }}</span>
                    </li>
                  </ul>
                </div>
                
                <!-- Postres -->
                <div class="menu-seccion">
                  <h4 class="menu-seccion-title">Postres</h4>
                  <ul class="menu-platos-list">
                    <li v-for="(plato, index) in postres" 
                        :key="plato.id" 
                        class="menu-plato-item"
                        :class="{ 'highlighted': highlightedIndex === index && currentSection === 'postres' }">
                      {{ plato.nombre }}
                      <span v-if="plato.descripcion" class="plato-desc-inline">- {{ plato.descripcion }}</span>
                    </li>
                  </ul>
                </div>
                
                <div class="menu-footer-info">
                  <p>Incluye pan, bebida y café</p>
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
  name: 'VistaDelDia',
  setup() {
    const raciones = ref([])
    const tapas = ref([])
    const menuDia = ref(null)
    const primeros = ref([])
    const segundos = ref([])
    const postres = ref([])
    
    const highlightedIndex = ref(0)
    const currentSection = ref('raciones')
    let highlightInterval = null

    const sections = [
      { name: 'raciones', items: raciones },
      { name: 'tapas', items: tapas },
      { name: 'primeros', items: primeros },
      { name: 'segundos', items: segundos },
      { name: 'postres', items: postres }
    ]

    const startHighlightAnimation = () => {
      highlightInterval = setInterval(() => {
        // Encontrar la sección actual
        const currentSectionIndex = sections.findIndex(s => s.name === currentSection.value)
        const currentItems = sections[currentSectionIndex].items.value

        // Si hay items en la sección actual
        if (currentItems.length > 0) {
          // Avanzar al siguiente índice
          highlightedIndex.value = (highlightedIndex.value + 1) % currentItems.length
        }

        // Si llegamos al final de la sección actual
        if (highlightedIndex.value === 0) {
          // Avanzar a la siguiente sección
          const nextSectionIndex = (currentSectionIndex + 1) % sections.length
          currentSection.value = sections[nextSectionIndex].name
          highlightedIndex.value = 0
        }
      }, 3000) // Cambiar cada 3 segundos
    }

    const loadData = async () => {
      try {
        // Obtener raciones
        raciones.value = await pb.collection('platos').getFullList({
          filter: 'categoria = "raciones"',
          sort: 'precio'
        })
        
        // Obtener tapas
        tapas.value = await pb.collection('platos').getFullList({
          filter: 'categoria = "tapas"',
          sort: 'precio'
        })
        
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
        }
      } catch (err) {
        console.error('Error VistaDelDia:', err)
      }
    }

    onMounted(() => {
      loadData()
      startHighlightAnimation()
    })

    onUnmounted(() => {
      if (highlightInterval) {
        clearInterval(highlightInterval)
      }
    })

    return {
      raciones,
      tapas,
      menuDia,
      primeros,
      segundos,
      postres,
      highlightedIndex,
      currentSection
    }
  }
}
</script>

<style scoped>
/* Estilos específicos del componente VistaDelDia */
.tv-view {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  /* Fondo base eliminado para evitar que tape el patrón */
  background: none;
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif;
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
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.vista-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  flex: 1;
  overflow-y: auto;
  padding: 0 1rem;
  height: calc(100% - 60px);
}

.section-container {
  display: flex;
  flex-direction: column;
  background-color: rgba(30, 30, 30, 0.5) !important;
  backdrop-filter: blur(2px);
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  overflow: hidden;
  height: 100%;
  backdrop-filter: blur(3px);
}

.section-header {
  padding: 1vh;
  background-color: rgba(18, 18, 18, 0.6);
  border-bottom: 1px solid rgba(212, 175, 55, 0.25);
}

.menu-header-flex {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  position: relative;
}

.menu-price {
  background-color: #d4af37;
  color: #121212;
  padding: 0.3vh 1vw;
  border-radius: 20px;
  font-weight: 700;
  font-size: 1.1rem;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.section-title {
  color: #d4af37;
  font-size: 2.8vh;
  text-align: center;
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
  flex: 1;
}

.section-divider {
  height: 2px;
  width: 60px;
  margin: 0.5rem auto;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.7), transparent);
}

.section-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.empty-section {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  background-color: rgba(30, 30, 30, 0.4);
  border-radius: 6px;
  color: #a0a0a0;
  font-style: italic;
  border: 1px dashed rgba(160, 160, 160, 0.3);
}

.platos-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.plato-item {
  background-color: rgba(18, 18, 18, 0.5);
  border-radius: 6px;
  padding: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 3px solid #d4af37;
  transition: all 0.5s ease;
}

.plato-item.highlighted {
  transform: translateX(10px);
  background-color: rgba(18, 18, 18, 0.9);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  border-left: 4px solid #d4af37;
}

.plato-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.plato-name {
  font-weight: 600;
  color: #f8f8f8;
  margin-bottom: 0;
  font-size: 1.2rem;
  text-transform: uppercase;
  min-width: 150px;
}

.plato-desc {
  color: #d4af37;
  font-size: 1.1rem;
  flex: 1;
  font-weight: 500;
  margin-left: 0.5rem;
}

.plato-price {
  margin-left: 1.5rem;
  text-align: right;
  min-width: 80px;
  font-size: 1.2rem;
}

.price-tag {
  background-color: #d4af37;
  color: #121212;
  padding: 0.5vh 1vw;
  border-radius: 0.6vh;
  font-weight: 700;
  display: inline-block;
  font-size: 1.2rem;
}

/* Estilos para el Menú del Día */
.menu-dia-container {
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(18, 18, 18, 0.95));
  border: 1px solid rgba(212, 175, 55, 0.4);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.menu-completo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.menu-seccion {
  margin-bottom: 1rem;
  background-color: rgba(18, 18, 18, 0.3);
  border-radius: 6px;
  padding: 0.8rem;
  border-left: 2px solid rgba(212, 175, 55, 0.5);
}

.menu-seccion-title {
  color: #d4af37;
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.menu-platos-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.menu-plato-item {
  padding: 0.8rem 0;
  color: #e0e0e0;
  border-bottom: 1px dashed rgba(160, 160, 160, 0.2);
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.2rem;
  transition: all 0.5s ease;
}

.menu-plato-item.highlighted {
  background-color: rgba(18, 18, 18, 0.9);
  padding-left: 1.5rem;
  border-left: 4px solid #d4af37;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.plato-desc-inline {
  font-size: 1.1rem;
  color: #d4af37;
  text-transform: none;
  flex: 1;
  font-weight: 500;
}

.menu-empty-item {
  color: #a0a0a0;
  font-style: italic;
  text-align: center;
  padding: 0.5rem;
}

.menu-footer-info {
  text-align: center;
  background-color: rgba(18, 18, 18, 0.5);
  padding: 0.7rem;
  border-radius: 6px;
  color: #d4af37;
  font-style: italic;
  margin-top: auto;
}

.vista-footer {
  margin-top: 1rem;
  text-align: center;
}

.horario-box {
  display: inline-block;
  background-color: rgba(18, 18, 18, 0.7);
  padding: 0.8rem 2rem;
  border-radius: 8px;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.horario-title {
  color: #d4af37;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.view-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (max-width: 768px) {
  .vista-grid {
    grid-template-columns: 1fr;
  }
  
  .section-content {
    max-height: none;
  }
  
  .view-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .menu-header-flex {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>