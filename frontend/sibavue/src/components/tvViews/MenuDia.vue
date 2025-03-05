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
              
              <div class="platos-lista">
                <div v-if="primeros.length === 0" class="empty-section">
                  <p>No hay primeros disponibles</p>
                </div>
                <div v-else v-for="plato in primeros" :key="plato.id" class="plato-item">
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
              
              <div class="platos-lista">
                <div v-if="segundos.length === 0" class="empty-section">
                  <p>No hay segundos disponibles</p>
                </div>
                <div v-else v-for="plato in segundos" :key="plato.id" class="plato-item">
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
              
              <div class="platos-lista">
                <div v-if="postres.length === 0" class="empty-section">
                  <p>No hay postres disponibles</p>
                </div>
                <div v-else v-for="plato in postres" :key="plato.id" class="plato-item">
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
import { ref, onMounted } from 'vue'
import pb from '@/services/pocketbase.js'

export default {
  name: 'MenuDia',
  setup() {
    const menuDia = ref(null)
    const primeros = ref([])
    const segundos = ref([])
    const postres = ref([])

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
        }
      } catch (err) {
        console.error('Error MenuDia:', err)
      }
    }

    onMounted(() => {
      loadData()
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

.title-price-container {
  display: flex;
  align-items: center;
  gap: 15px;
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

.menu-price {
  background-color: #d4af37;
  color: #121212;
  padding: 0.5vh 1.5vw;
  border-radius: 30px;
  font-weight: 700;
  font-size: 2.2vh;
}

.view-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.menu-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: rgba(30, 30, 30, 0.5) !important; /* Más transparencia */
  backdrop-filter: blur(2px); /* Efecto blur para mejorar legibilidad */
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  overflow: hidden;
  max-width: 1000px;
  margin: 0 auto;
  width: 90%;
  backdrop-filter: blur(3px);
}

/* Convertimos las secciones en columnas */
.menu-columns {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.menu-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: rgba(30, 30, 30, 0.5) !important; /* Más transparencia */
  backdrop-filter: blur(2px); /* Efecto blur para mejorar legibilidad */
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.section-header {
  padding: 1vh;
  background-color: rgba(18, 18, 18, 0.6);
  border-bottom: 1px solid rgba(212, 175, 55, 0.25);
}

.section-title {
  color: #d4af37;
  font-size: 2.5vh;
  text-align: center;
  font-weight: 600;
  margin: 0;
}

.section-divider {
  height: 2px;
  width: 80px;
  margin: 0.5rem auto;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.7), transparent);
}

.platos-lista {
  padding: 1rem;
}

.plato-item {
  padding: 1rem;
  border-bottom: 1px dashed rgba(212, 175, 55, 0.2);
  transition: all 0.3s ease;
}

.plato-item:last-child {
  border-bottom: none;
}

.plato-item:hover {
  background-color: rgba(18, 18, 18, 0.7);
  transform: translateX(5px);
}

/* Nombres de platos más grandes y destacados */
.plato-nombre {
  font-weight: 700;
  color: #f8f8f8;
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
}

.plato-descripcion {
  font-style: italic;
  color: #b0b0b0;
  font-size: 0.9rem;
}

.empty-section {
  text-align: center;
  padding: 1.5rem;
  color: #a0a0a0;
  font-style: italic;
}

.menu-footer {
  text-align: center;
  padding: 1rem;
  background-color: rgba(18, 18, 18, 0.8);
  border-top: 1px solid rgba(212, 175, 55, 0.3);
  color: #d4af37;
  font-style: italic;
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

@media (max-width: 768px) {
  .menu-container {
    width: 95%;
  }
  
  .menu-columns {
    flex-direction: column;
    gap: 1rem;
  }
  
  .title-price-container {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .plato-item {
    padding: 0.6rem;
  }
  
  .plato-nombre {
    font-size: 1rem;
  }
}
</style>