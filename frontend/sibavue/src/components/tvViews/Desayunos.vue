<template>
  <div class="tv-view">
    <div class="background-pattern"></div>
    <div class="tv-content">
      <div class="view-header">
        <div class="restaurant-name">O SIBARITA</div>
        <h1 class="view-title">DESAYUNOS</h1>
      </div>
      
      <div class="view-body">
        <div class="desayunos-grid">
          <!-- Sección Dulces -->
          <div class="section-container">
            <div class="section-header">
              <h2 class="section-title">Dulces</h2>
              <div class="section-divider"></div>
            </div>
            <div class="section-content">
              <div v-if="!dulces.length" class="empty-section">
                <p>No hay desayunos dulces disponibles</p>
              </div>
              <div v-else class="platos-list">
                <div v-for="(item, index) in dulces" 
                     :key="item.id" 
                     class="plato-item"
                     :class="{ 'highlighted': highlightedIndex === index && currentSection === 'dulces' }">
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

          <!-- Sección Salados -->
          <div class="section-container">
            <div class="section-header">
              <h2 class="section-title">Salados</h2>
              <div class="section-divider"></div>
            </div>
            <div class="section-content">
              <div v-if="!salados.length" class="empty-section">
                <p>No hay desayunos salados disponibles</p>
              </div>
              <div v-else class="platos-list">
                <div v-for="(item, index) in salados" 
                     :key="item.id" 
                     class="plato-item"
                     :class="{ 'highlighted': highlightedIndex === index && currentSection === 'salados' }">
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

          <!-- Sección Cafés -->
          <div class="section-container">
            <div class="section-header">
              <h2 class="section-title">Cafés</h2>
              <div class="section-divider"></div>
            </div>
            <div class="section-content">
              <div v-if="!cafes.length" class="empty-section">
                <p>No hay cafés disponibles</p>
              </div>
              <div v-else class="platos-list">
                <div v-for="(item, index) in cafes" 
                     :key="item.id" 
                     class="plato-item"
                     :class="{ 'highlighted': highlightedIndex === index && currentSection === 'cafes' }">
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

          <!-- Sección Infusiones -->
          <div class="section-container">
            <div class="section-header">
              <h2 class="section-title">Infusiones</h2>
              <div class="section-divider"></div>
            </div>
            <div class="section-content">
              <div v-if="!infusiones.length" class="empty-section">
                <p>No hay infusiones disponibles</p>
              </div>
              <div v-else class="platos-list">
                <div v-for="(item, index) in infusiones" 
                     :key="item.id" 
                     class="plato-item"
                     :class="{ 'highlighted': highlightedIndex === index && currentSection === 'infusiones' }">
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

          <!-- Sección Otros -->
          <div class="section-container">
            <div class="section-header">
              <h2 class="section-title">Otros</h2>
              <div class="section-divider"></div>
            </div>
            <div class="section-content">
              <div v-if="!otros.length" class="empty-section">
                <p>No hay otros desayunos disponibles</p>
              </div>
              <div v-else class="platos-list">
                <div v-for="(item, index) in otros" 
                     :key="item.id" 
                     class="plato-item"
                     :class="{ 'highlighted': highlightedIndex === index && currentSection === 'otros' }">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import pb from '@/services/pocketbase.js'

export default {
  name: 'Desayunos',
  setup() {
    const dulces = ref([])
    const salados = ref([])
    const cafes = ref([])
    const infusiones = ref([])
    const otros = ref([])
    const highlightedIndex = ref(0)
    const currentSection = ref('dulces')
    
    const sections = ['dulces', 'salados', 'cafes', 'infusiones', 'otros']
    let highlightInterval = null

    const loadPlatos = async () => {
      try {
        // Cargar platos por categoría
        dulces.value = await pb.collection('platos').getFullList({
          filter: 'categoria = "desayuno_dulce"',
          sort: 'nombre'
        })
        
        salados.value = await pb.collection('platos').getFullList({
          filter: 'categoria = "desayuno_salado"',
          sort: 'nombre'
        })
        
        cafes.value = await pb.collection('platos').getFullList({
          filter: 'categoria = "desayuno_cafes"',
          sort: 'nombre'
        })
        
        infusiones.value = await pb.collection('platos').getFullList({
          filter: 'categoria = "desayuno_infusiones"',
          sort: 'nombre'
        })
        
        otros.value = await pb.collection('platos').getFullList({
          filter: 'categoria = "desayuno_otros"',
          sort: 'nombre'
        })
      } catch (error) {
        console.error('Error al cargar los desayunos:', error)
      }
    }

    const startHighlightAnimation = () => {
      let sectionIndex = 0
      highlightInterval = setInterval(() => {
        currentSection.value = sections[sectionIndex]
        const currentList = {
          dulces: dulces.value,
          salados: salados.value,
          cafes: cafes.value,
          infusiones: infusiones.value,
          otros: otros.value
        }[currentSection.value]

        if (currentList && currentList.length > 0) {
          highlightedIndex.value = (highlightedIndex.value + 1) % currentList.length
        } else {
          highlightedIndex.value = 0
        }

        // Cambiar de sección cada vez que se complete una vuelta
        if (highlightedIndex.value === 0) {
          sectionIndex = (sectionIndex + 1) % sections.length
        }
      }, 3000)
    }

    onMounted(async () => {
      await loadPlatos()
      startHighlightAnimation()
    })

    onUnmounted(() => {
      if (highlightInterval) {
        clearInterval(highlightInterval)
      }
    })

    return {
      dulces,
      salados,
      cafes,
      infusiones,
      otros,
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

.desayunos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
  height: calc(100vh - 15vh);
  overflow: hidden;
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

.section-title {
  color: $tv-primary-color;
  font-size: 2.8vh;
  text-align: center;
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
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

@media (max-width: 768px) {
  .desayunos-grid {
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
}
</style> 