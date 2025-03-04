<template>
  <div class="vista-del-dia">
    <div class="vista-header">
      <h1 class="vista-title">Especialidades del Día</h1>
    </div>
    
    <div class="vista-content">
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
                  <span class="price-tag">{{ item.precio }}€</span>
                  <span v-if="item.precio_medio" class="price-media">Media: {{ item.precio_medio }}€</span>
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
        
        <!-- Sección Menú del Día Completo - MODIFICADA -->
        <div class="section-container menu-dia-container">
          <div class="section-header">
            <h2 class="section-title">Menú del Día</h2>
            <div class="section-divider"></div>
          </div>
          
          <div class="section-content">
            <div v-if="!menuDia" class="empty-section">
              <p>No hay menú del día disponible</p>
            </div>
            <div v-else class="menu-completo">
              <div class="menu-header-info">
                <h3 class="menu-name">{{ menuDia.nombre }}</h3>
                <div class="menu-price">{{ menuDia.precio }}€</div>
              </div>
              
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
.vista-del-dia {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #242424;
  font-family: 'Montserrat', sans-serif;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23242424"/><path d="M0 0 L50 50 L0 100 Z" fill="%23282828" fill-opacity="0.2"/><path d="M100 0 L50 50 L100 100 Z" fill="%23282828" fill-opacity="0.2"/></svg>') repeat;
}

.vista-header {
  text-align: center;
  padding: 1.5rem 1rem;
  background: linear-gradient(to bottom, rgba(18, 18, 18, 0.9), rgba(18, 18, 18, 0.6), transparent);
}

.vista-title {
  color: #d4af37;
  font-size: 2.5rem;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  position: relative;
  display: inline-block;
}

.vista-title::after {
  content: "";
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
}

.vista-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  overflow-y: auto;
}

.vista-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  flex: 1;
}

.section-container {
  display: flex;
  flex-direction: column;
  background-color: rgba(30, 30, 30, 0.7);
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  overflow: hidden;
}

.section-header {
  padding: 1rem;
  background-color: rgba(18, 18, 18, 0.6);
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
}

.section-title {
  color: #d4af37;
  font-size: 1.6rem;
  text-align: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.section-divider {
  height: 2px;
  width: 60px;
  margin: 0 auto;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.7), transparent);
}

.section-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  max-height: 400px;
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

.price-tag {
  background-color: #d4af37;
  color: #121212;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: 700;
  display: inline-block;
}

.price-media {
  display: block;
  font-size: 0.8rem;
  color: #a0a0a0;
  margin-top: 0.3rem;
}

/* Nuevos estilos para la sección de menú del día */
.menu-dia-container {
  background: linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(18, 18, 18, 0.95));
  border: 1px solid rgba(212, 175, 55, 0.4);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.menu-completo {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.menu-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
}

.menu-name {
  color: #d4af37;
  font-size: 1.4rem;
  font-weight: 600;
}

.menu-price {
  background-color: #d4af37;
  color: #121212;
  padding: 0.3rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 1.1rem;
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
  margin-top: 0.5rem;
}

.vista-footer {
  margin-top: 1.5rem;
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

@media (max-width: 768px) {
  .vista-grid {
    grid-template-columns: 1fr;
  }
  
  .section-content {
    max-height: none;
  }
}
</style>