<template>
  <div class="menu-dia-view">
    <div class="menu-header">
      <h1 class="menu-title">Menú del Día</h1>
      <div v-if="menuDia" class="menu-info">
        <h2 class="menu-name">{{ menuDia.nombre }}</h2>
        <div class="menu-price">{{ menuDia.precio }}€</div>
      </div>
    </div>
    
    <div v-if="menuDia" class="menu-content">
      <div class="menu-sections">
        <!-- Primeros -->
        <div class="menu-section">
          <div class="section-header">
            <h3 class="section-title">Primeros</h3>
            <div class="section-divider"></div>
          </div>
          
          <div class="section-content">
            <div v-if="primeros.length === 0" class="empty-message">
              No hay primeros platos
            </div>
            <ul v-else class="platos-list">
              <li v-for="plato in primeros" :key="plato.id" class="plato-item">
                <div class="plato-name">{{ plato.nombre }}</div>
                <div v-if="plato.descripcion" class="plato-desc">{{ plato.descripcion }}</div>
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Segundos -->
        <div class="menu-section">
          <div class="section-header">
            <h3 class="section-title">Segundos</h3>
            <div class="section-divider"></div>
          </div>
          
          <div class="section-content">
            <div v-if="segundos.length === 0" class="empty-message">
              No hay segundos platos
            </div>
            <ul v-else class="platos-list">
              <li v-for="plato in segundos" :key="plato.id" class="plato-item">
                <div class="plato-name">{{ plato.nombre }}</div>
                <div v-if="plato.descripcion" class="plato-desc">{{ plato.descripcion }}</div>
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Postres -->
        <div class="menu-section">
          <div class="section-header">
            <h3 class="section-title">Postres</h3>
            <div class="section-divider"></div>
          </div>
          
          <div class="section-content">
            <div v-if="postres.length === 0" class="empty-message">
              No hay postres
            </div>
            <ul v-else class="platos-list">
              <li v-for="plato in postres" :key="plato.id" class="plato-item">
                <div class="plato-name">{{ plato.nombre }}</div>
                <div v-if="plato.descripcion" class="plato-desc">{{ plato.descripcion }}</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="menu-footer">
        <div class="includes-text">El menú incluye pan, bebida y café</div>
      </div>
    </div>
    
    <div v-else class="menu-empty">
      <div class="empty-container">
        <div class="empty-icon">🍽️</div>
        <h2>No hay Menú del Día disponible</h2>
        <p>Consulte nuestra carta o pregunte a nuestro personal</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import pb from '@/services/pocketbase.js'

export default {
  name: 'MenuDia',
  setup() {
    const menuDia = ref(null)
    const primeros = ref([])
    const segundos = ref([])
    const postres = ref([])

    const loadMenuDia = async () => {
      try {
        // 1) Obtener el menu_dia principal
        const lista = await pb.collection('menu_dia').getFullList({ sort: '-created', limit: 1 })
        if (!lista.length) return
        menuDia.value = lista[0]

        // 2) Cargar subcolecciones
        const id = menuDia.value.id
        primeros.value = await pb.collection('menu_dia_primeros').getFullList({
          filter: `field = "${id}"`
        })
        segundos.value = await pb.collection('menu_dia_segundos').getFullList({
          filter: `field = "${id}"`
        })
        postres.value = await pb.collection('menu_dia_postres').getFullList({
          filter: `field = "${id}"`
        })
      } catch (err) {
        console.error('Error MenuDia:', err)
      }
    }

    onMounted(() => {
      loadMenuDia()
    })

    return {
      menuDia,
      primeros,
      segundos,
      postres
    }
  }
}
</script>

<style scoped>
.menu-dia-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23242424"/><path d="M0 50 L50 0 L100 50 L50 100 Z" fill="%23282828"/></svg>') repeat;
  font-family: 'Montserrat', sans-serif;
}

.menu-header {
  text-align: center;
  padding: 2rem 1rem 1.5rem;
  background: linear-gradient(to bottom, rgba(18, 18, 18, 0.9), rgba(18, 18, 18, 0.6), transparent);
}

.menu-title {
  color: #d4af37;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.menu-info {
  display: inline-block;
  border: 2px solid rgba(212, 175, 55, 0.4);
  border-radius: 8px;
  padding: 0.8rem 3rem;
  background-color: rgba(30, 30, 30, 0.7);
}

.menu-name {
  color: #f8f9fa;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.menu-price {
  display: inline-block;
  background-color: #d4af37;
  color: #121212;
  padding: 0.3rem 1.5rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 1.2rem;
}

.menu-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  overflow-y: auto;
}

.menu-sections {
  display: flex;
  justify-content: space-around;
  gap: 2rem;
  flex: 1;
}

@media (max-width: 768px) {
  .menu-sections {
    flex-direction: column;
  }
}

.menu-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-header {
  margin-bottom: 1.5rem;
  position: relative;
}

.section-title {
  color: #d4af37;
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
  text-align: center;
}

.section-divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.6), transparent);
  margin: 0 auto;
  width: 70%;
}

.section-content {
  flex: 1;
  padding: 0 0.5rem;
}

.platos-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.plato-item {
  background-color: rgba(30, 30, 30, 0.7);
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 0.8rem;
  border-left: 3px solid #d4af37;
  transition: transform 0.3s ease;
}

.plato-item:hover {
  transform: translateX(5px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
}

.plato-name {
  color: #f8f9fa;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.4rem;
}

.plato-desc {
  color: #b0b0b0;
  font-size: 0.9rem;
  font-style: italic;
}

.empty-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 120px;
  background-color: rgba(30, 30, 30, 0.4);
  border-radius: 6px;
  color: #a0a0a0;
  font-style: italic;
  border: 1px dashed rgba(160, 160, 160, 0.3);
}

.menu-footer {
  text-align: center;
  margin-top: 2rem;
  background-color: rgba(18, 18, 18, 0.6);
  padding: 1rem;
  border-radius: 8px;
}

.includes-text {
  color: #d4af37;
  font-style: italic;
  font-size: 1.1rem;
}

.menu-empty {
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
</style>