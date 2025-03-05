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
                <div v-for="item in raciones" :key="item.id" class="plato-item">
                  <div class="plato-content">
                    <div class="plato-name">{{ item.nombre }}</div>
                    <div v-if="item.descripcion" class="plato-desc">{{ item.descripcion }}</div>
                  </div>
                  <div class="plato-price">
                    <span class="price-tag">{{ item.precio }}€<span v-if="item.precio_medio"> (Media: {{ item.precio_medio }}€)</span></span>
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
                <div v-for="item in tapas" :key="item.id" class="plato-item">
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
          
          <!-- Sección Menú del Día Completo -->
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
                    <li v-for="plato in primeros" :key="plato.id" class="menu-plato-item">
                      {{ plato.nombre }}
                      <span v-if="plato.descripcion" class="plato-desc-inline">({{ plato.descripcion }})</span>
                    </li>
                    <li v-if="primeros.length === 0" class="menu-empty-item">No hay primeros disponibles</li>
                  </ul>
                </div>
                
                <!-- Segundos platos -->
                <div class="menu-seccion">
                  <h4 class="menu-seccion-title">Segundos</h4>
                  <ul class="menu-platos-list">
                    <li v-for="plato in segundos" :key="plato.id" class="menu-plato-item">
                      {{ plato.nombre }}
                      <span v-if="plato.descripcion" class="plato-desc-inline">({{ plato.descripcion }})</span>
                    </li>
                    <li v-if="segundos.length === 0" class="menu-empty-item">No hay segundos disponibles</li>
                  </ul>
                </div>
                
                <!-- Postres -->
                <div class="menu-seccion">
                  <h4 class="menu-seccion-title">Postres</h4>
                  <ul class="menu-platos-list">
                    <li v-for="plato in postres" :key="plato.id" class="menu-plato-item">
                      {{ plato.nombre }}
                      <span v-if="plato.descripcion" class="plato-desc-inline">({{ plato.descripcion }})</span>
                    </li>
                    <li v-if="postres.length === 0" class="menu-empty-item">No hay postres disponibles</li>
                  </ul>
                </div>
                
                <div class="menu-footer-info">
                  <p>Incluye pan, bebida y café</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="vista-footer">
          <div class="horario-box">
            <h3 class="horario-title">Horario</h3>
            <p>Lunes a domingo: 12:00 - 16:00 | 20:00 - 23:30</p>
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
  name: 'VistaDelDia',
  setup() {
    const raciones = ref([])
    const tapas = ref([])
    const menuDia = ref(null)
    const primeros = ref([])
    const segundos = ref([])
    const postres = ref([])

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
    })

    return {
      raciones,
      tapas,
      menuDia,
      primeros,
      segundos,
      postres
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
  background: radial-gradient(
    ellipse at center, 
    rgba(30, 30, 30, 0.7) 0%, 
    rgba(20, 20, 20, 0.8) 70%, 
    rgba(10, 10, 10, 0.85) 100%
  );
  font-family: 'Montserrat', sans-serif;
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  opacity: 0.15;
  
  /* Fondo base con gradiente */
  background: linear-gradient(135deg, 
    rgba(25, 25, 25, 0.95) 0%, 
    rgba(35, 35, 35, 0.97) 50%, 
    rgba(25, 25, 25, 0.95) 100%);
  
  /* Patrón de azulejos Alhambra */
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><defs><linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23d4af37" stop-opacity="0.07"/><stop offset="100%" stop-color="%23b08b29" stop-opacity="0.05"/></linearGradient></defs><rect width="40" height="40" fill="%23222" fill-opacity="0.7"/><path d="M0,20 L20,0 L40,20 L20,40 Z" fill="%23282828" fill-opacity="0.4"/><path d="M20,0 L40,20 L20,40 L0,20 Z" fill="%23333" fill-opacity="0.3"/><path d="M10,10 L20,20 L10,30 L0,20 Z" fill="url(%23goldGrad)"/><path d="M30,10 L40,20 L30,30 L20,20 Z" fill="url(%23goldGrad)"/></svg>');
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
  background-color: rgba(30, 30, 30, 0.6);
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
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.menu-price {
  background-color: #d4af37;
  color: #121212;
  padding: 0.3vh 1vw;
  border-radius: 20px;
  font-weight: 700;
  font-size: 1.1rem;
  margin-right: 10px;
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
  width: 60px;
  margin: 0.5rem auto;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.7), transparent);
}

.section-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
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
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-left: 3px solid #d4af37;
  transition: all 0.3s ease;
}

.plato-item:hover {
  transform: translateX(5px);
  background-color: rgba(18, 18, 18, 0.7);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.plato-content {
  flex: 1;
}

.plato-name {
  font-weight: 600;
  color: #f8f8f8;
  margin-bottom: 0.3rem;
  font-size: 1.1rem;
}

.plato-desc {
  color: #b0b0b0;
  font-size: 0.9rem;
  font-style: italic;
}

.plato-price {
  margin-left: 1rem;
  text-align: right;
  min-width: 70px;
}

/* Ajuste precio de la media para que aparezca junto al precio principal */
.price-tag {
  background-color: #d4af37;
  color: #121212;
  padding: 0.4vh 0.8vw;
  border-radius: 0.6vh;
  font-weight: 700;
  display: inline-block;
  font-size: 1.1rem;
}

.price-tag span {
  font-size: 0.9rem;
  font-weight: normal;
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
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.menu-platos-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.menu-plato-item {
  padding: 0.4rem 0;
  color: #e0e0e0;
  border-bottom: 1px dashed rgba(160, 160, 160, 0.2);
}

.menu-plato-item:last-child {
  border-bottom: none;
}

.plato-desc-inline {
  font-size: 0.9rem;
  color: #a0a0a0;
  font-style: italic;
  margin-left: 0.5rem;
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