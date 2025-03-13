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

.vista-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  flex: 1;
  overflow: hidden;
  padding: 0 1rem;
  height: calc(100% - 60px);
}

.section-container {
  @include tv-card;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  backdrop-filter: blur(3px);

  &:hover {
    @include tv-card-hover;
  }
}

.section-header {
  padding: 1vh;
  background-color: rgba(18, 18, 18, 0.6);
  border-bottom: 1px solid $tv-border-color;
}

.menu-header-flex {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  position: relative;
}

.menu-price {
  @include tv-price-tag;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.section-title {
  color: $tv-primary-color;
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
  background: linear-gradient(90deg, transparent, rgba($tv-primary-color, 0.7), transparent);
}

.section-content {
  flex: 1;
  padding: 1rem;
  overflow: hidden;
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
  height: 100%;
  overflow: hidden;
}

.plato-item {
  @include tv-card;
  padding: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 3px solid $tv-primary-color;
  transition: all 0.5s ease;

  &:hover {
    @include tv-card-hover;
  }

  &.highlighted {
    transform: translateX(10px);
    background-color: rgba(18, 18, 18, 0.9);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
    border-left: 4px solid $tv-primary-color;
  }
}

.plato-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.plato-name {
  font-weight: 600;
  color: $tv-text-light;
  margin-bottom: 0;
  font-size: 1.2rem;
  text-transform: uppercase;
  min-width: 150px;
}

.plato-desc {
  color: $tv-primary-color;
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
  @include tv-price-tag;
}

.menu-dia-container {
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(18, 18, 18, 0.95));
  border: 1px solid rgba($tv-primary-color, 0.4);
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
  border-left: 2px solid rgba($tv-primary-color, 0.5);
}

.menu-seccion-title {
  color: $tv-primary-color;
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

  &:hover {
    background-color: rgba(18, 18, 18, 0.9);
    padding-left: 1.5rem;
    border-left: 4px solid $tv-primary-color;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
}

.plato-desc-inline {
  font-size: 1.1rem;
  color: $tv-primary-color;
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
  color: $tv-primary-color;
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
  border: 1px solid $tv-border-color;
}

.horario-title {
  color: $tv-primary-color;
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