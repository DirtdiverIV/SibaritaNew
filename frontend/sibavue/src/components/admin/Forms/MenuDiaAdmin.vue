<template>
  <div class="menu-dia-admin">
    <!-- Header con título y botón de crear menú -->
    <div class="header-section">
      <h2 class="title has-text-centered">Menú del Día</h2>
      <div v-if="!menuDia" class="create-menu-container">
        <div class="create-menu-box has-text-centered">
          <p class="mb-4">No hay ningún menú del día configurado</p>
          <button @click="showCreateMenuForm = true" class="button is-primary is-medium">
            <span class="icon"><i class="fas fa-plus"></i></span>
            <span>Crear Menú del Día</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Sección principal cuando hay un menú del día -->
    <div v-if="menuDia" class="menu-container">
      <!-- Cabecera del menú -->
      <div class="menu-header has-background-dark p-3 is-flex is-justify-content-space-between is-align-items-center">
        <div>
          <h3 class="title is-5 has-text-gold mb-1">{{ menuDia.nombre }}</h3>
          <p class="subtitle is-6 has-text-light">Precio: {{ menuDia.precio }}€</p>
        </div>
        <div class="menu-actions">
          <button @click="showEditMenuForm = true" class="button is-warning is-small mr-2">
            <span class="icon"><i class="fas fa-edit"></i></span>
            <span>Editar</span>
          </button>
          <button @click="deleteMenuDia(menuDia.id)" class="button is-danger is-small">
            <span class="icon"><i class="fas fa-trash"></i></span>
          </button>
        </div>
      </div>
      
      <!-- Secciones del menú -->
      <div class="menu-sections">
        <div class="columns is-multiline">
          <!-- Sección Primeros -->
          <div class="column is-12-mobile is-4-tablet">
            <div class="section-card">
              <div class="section-header">
                <h4 class="has-text-centered">Primeros Platos</h4>
                <button @click="openAddPlatoForm('primeros')" class="button is-primary is-small">
                  <span class="icon is-small"><i class="fas fa-plus"></i></span>
                </button>
              </div>
              
              <div class="section-content">
                <div v-if="primeros.length === 0" class="empty-section">
                  <p>No hay primeros platos añadidos</p>
                </div>
                <div v-else class="platos-list">
                  <div v-for="plato in primeros" :key="plato.id" class="plato-item">
                    <div class="plato-info">
                      <p class="plato-nombre">{{ plato.nombre }}</p>
                      <p v-if="plato.descripcion" class="plato-desc">{{ plato.descripcion }}</p>
                    </div>
                    <div class="plato-actions">
                      <button @click="deletePlato('primeros', plato.id)" class="delete-btn">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Sección Segundos -->
          <div class="column is-12-mobile is-4-tablet">
            <div class="section-card">
              <div class="section-header">
                <h4 class="has-text-centered">Segundos Platos</h4>
                <button @click="openAddPlatoForm('segundos')" class="button is-primary is-small">
                  <span class="icon is-small"><i class="fas fa-plus"></i></span>
                </button>
              </div>
              
              <div class="section-content">
                <div v-if="segundos.length === 0" class="empty-section">
                  <p>No hay segundos platos añadidos</p>
                </div>
                <div v-else class="platos-list">
                  <div v-for="plato in segundos" :key="plato.id" class="plato-item">
                    <div class="plato-info">
                      <p class="plato-nombre">{{ plato.nombre }}</p>
                      <p v-if="plato.descripcion" class="plato-desc">{{ plato.descripcion }}</p>
                    </div>
                    <div class="plato-actions">
                      <button @click="deletePlato('segundos', plato.id)" class="delete-btn">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Sección Postres -->
          <div class="column is-12-mobile is-4-tablet">
            <div class="section-card">
              <div class="section-header">
                <h4 class="has-text-centered">Postres</h4>
                <button @click="openAddPlatoForm('postres')" class="button is-primary is-small">
                  <span class="icon is-small"><i class="fas fa-plus"></i></span>
                </button>
              </div>
              
              <div class="section-content">
                <div v-if="postres.length === 0" class="empty-section">
                  <p>No hay postres añadidos</p>
                </div>
                <div v-else class="platos-list">
                  <div v-for="plato in postres" :key="plato.id" class="plato-item">
                    <div class="plato-info">
                      <p class="plato-nombre">{{ plato.nombre }}</p>
                      <p v-if="plato.descripcion" class="plato-desc">{{ plato.descripcion }}</p>
                    </div>
                    <div class="plato-actions">
                      <button @click="deletePlato('postres', plato.id)" class="delete-btn">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal para crear nuevo menú -->
    <div class="modal" :class="{'is-active': showCreateMenuForm}">
      <div class="modal-background" @click="showCreateMenuForm = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Crear Nuevo Menú del Día</p>
          <button @click="showCreateMenuForm = false" class="delete" aria-label="close"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Nombre del menú</label>
            <div class="control">
              <input 
                v-model="menuForm.nombre" 
                class="input" 
                type="text" 
                placeholder="Ej: Menú Ejecutivo, Menú Especial..." 
                required
              />
            </div>
          </div>
          
          <div class="field">
            <label class="label">Precio (€)</label>
            <div class="control">
              <input 
                v-model.number="menuForm.precio" 
                class="input" 
                type="number" 
                step="0.01" 
                min="0" 
                placeholder="0.00" 
                required
              />
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button @click="createMenuDia" class="button is-primary">Crear Menú</button>
          <button @click="showCreateMenuForm = false" class="button">Cancelar</button>
        </footer>
      </div>
    </div>
    
    <!-- Modal para editar menú existente -->
    <div class="modal" :class="{'is-active': showEditMenuForm}">
      <div class="modal-background" @click="showEditMenuForm = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Editar Menú del Día</p>
          <button @click="showEditMenuForm = false" class="delete" aria-label="close"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Nombre del menú</label>
            <div class="control">
              <input 
                v-model="menuForm.nombre" 
                class="input" 
                type="text" 
                placeholder="Ej: Menú Ejecutivo, Menú Especial..." 
                required
              />
            </div>
          </div>
          
          <div class="field">
            <label class="label">Precio (€)</label>
            <div class="control">
              <input 
                v-model.number="menuForm.precio" 
                class="input" 
                type="number" 
                step="0.01" 
                min="0" 
                placeholder="0.00" 
                required
              />
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button @click="updateMenuDia" class="button is-primary">Guardar Cambios</button>
          <button @click="showEditMenuForm = false" class="button">Cancelar</button>
        </footer>
      </div>
    </div>
    
    <!-- Modal para añadir plato al menú -->
    <div class="modal" :class="{'is-active': showAddPlatoForm}">
      <div class="modal-background" @click="showAddPlatoForm = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Añadir {{ getCategoriaLabel() }}</p>
          <button @click="showAddPlatoForm = false" class="delete" aria-label="close"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Nombre del plato</label>
            <div class="control">
              <input 
                v-model="platoForm.nombre" 
                class="input" 
                type="text" 
                placeholder="Nombre del plato" 
                required
              />
            </div>
          </div>
          
          <div class="field">
            <label class="label">Descripción (opcional)</label>
            <div class="control">
              <textarea 
                v-model="platoForm.descripcion" 
                class="textarea" 
                placeholder="Descripción o ingredientes principales"
                rows="3"
              ></textarea>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button @click="addPlato" class="button is-primary">Añadir Plato</button>
          <button @click="showAddPlatoForm = false" class="button">Cancelar</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import pb from '@/services/pocketbase.js'

export default {
  name: 'MenuDiaAdmin',
  setup() {
    // Estado
    const menuDia = ref(null)
    const primeros = ref([])
    const segundos = ref([])
    const postres = ref([])
    
    // Formularios
    const menuForm = reactive({
      nombre: '',
      precio: 0
    })
    
    const platoForm = reactive({
      nombre: '',
      descripcion: '',
      tipo: '' // 'primeros', 'segundos' o 'postres'
    })
    
    // Estado de los modales
    const showCreateMenuForm = ref(false)
    const showEditMenuForm = ref(false)
    const showAddPlatoForm = ref(false)

    // Suscripciones
    let menuSubscription = null
    let primerosSubscription = null
    let segundosSubscription = null
    let postresSubscription = null
    
    // Cargar el menú del día más reciente
    const loadMenuDia = async () => {
      try {
        const menus = await pb.collection('menu_dia').getFullList({
          sort: '-created',
          limit: 1
        })
        
        if (menus.length > 0) {
          menuDia.value = menus[0]
          await loadPlatos(menuDia.value.id)
          setupSubscriptions(menuDia.value.id)
        } else {
          menuDia.value = null
          primeros.value = []
          segundos.value = []
          postres.value = []
          cleanupSubscriptions()
        }
      } catch (err) {
        console.error('Error al cargar el menú del día:', err)
        alert('Error al cargar el menú del día')
      }
    }

    // Configurar suscripciones en tiempo real
    const setupSubscriptions = (menuId) => {
      cleanupSubscriptions()

      // Suscripción al menú del día
      menuSubscription = pb.collection('menu_dia').subscribe('*', async (e) => {
        if (e.record.id === menuId) {
          menuDia.value = e.record
        }
      })

      // Suscripción a primeros platos
      primerosSubscription = pb.collection('menu_dia_primeros').subscribe(`field = "${menuId}"`, async (e) => {
        await loadPlatos(menuId)
      })

      // Suscripción a segundos platos
      segundosSubscription = pb.collection('menu_dia_segundos').subscribe(`field = "${menuId}"`, async (e) => {
        await loadPlatos(menuId)
      })

      // Suscripción a postres
      postresSubscription = pb.collection('menu_dia_postres').subscribe(`field = "${menuId}"`, async (e) => {
        await loadPlatos(menuId)
      })
    }

    // Limpiar suscripciones
    const cleanupSubscriptions = () => {
      if (menuSubscription) pb.collection('menu_dia').unsubscribe()
      if (primerosSubscription) pb.collection('menu_dia_primeros').unsubscribe()
      if (segundosSubscription) pb.collection('menu_dia_segundos').unsubscribe()
      if (postresSubscription) pb.collection('menu_dia_postres').unsubscribe()
      
      menuSubscription = null
      primerosSubscription = null
      segundosSubscription = null
      postresSubscription = null
    }
    
    // Cargar los platos del menú del día
    const loadPlatos = async (menuId) => {
      try {
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
      } catch (err) {
        console.error('Error al cargar platos del menú:', err)
      }
    }
    
    // Crear un nuevo menú del día
    const createMenuDia = async () => {
      if (!menuForm.nombre || !menuForm.precio) {
        alert('Debes completar todos los campos')
        return
      }
      
      try {
        const data = {
          nombre: menuForm.nombre,
          precio: menuForm.precio
        }
        
        const newMenu = await pb.collection('menu_dia').create(data)
        showCreateMenuForm.value = false
        
        // Reiniciar formulario
        menuForm.nombre = ''
        menuForm.precio = 0
        
        await loadMenuDia()
      } catch (err) {
        console.error('Error al crear menú del día:', err)
        alert('Error al crear el menú del día: ' + err.message)
      }
    }
    
    // Actualizar menú existente
    const updateMenuDia = async () => {
      if (!menuDia.value) return
      
      try {
        const data = {
          nombre: menuForm.nombre,
          precio: menuForm.precio
        }
        
        await pb.collection('menu_dia').update(menuDia.value.id, data)
        showEditMenuForm.value = false
        
        await loadMenuDia()
      } catch (err) {
        console.error('Error al actualizar menú:', err)
        alert('Error al actualizar el menú: ' + err.message)
      }
    }
    
    // Eliminar menú completo
    const deleteMenuDia = async (id) => {
      if (!confirm('¿Estás seguro de eliminar este menú y todos sus platos?')) return
      
      try {
        // Primero eliminamos los platos asociados
        for (const p of primeros.value) {
          await pb.collection('menu_dia_primeros').delete(p.id)
        }
        
        for (const s of segundos.value) {
          await pb.collection('menu_dia_segundos').delete(s.id)
        }
        
        for (const po of postres.value) {
          await pb.collection('menu_dia_postres').delete(po.id)
        }
        
        // Luego eliminamos el menú
        await pb.collection('menu_dia').delete(id)
        
        // Recargar datos
        await loadMenuDia()
      } catch (err) {
        console.error('Error al eliminar menú del día:', err)
        alert('Error al eliminar el menú: ' + err.message)
      }
    }
    
    // Abrir formulario para añadir plato
    const openAddPlatoForm = (tipo) => {
      platoForm.tipo = tipo
      platoForm.nombre = ''
      platoForm.descripcion = ''
      showAddPlatoForm.value = true
    }
    
    // Obtener etiqueta según tipo de plato
    const getCategoriaLabel = () => {
      switch (platoForm.tipo) {
        case 'primeros': return 'Primer Plato'
        case 'segundos': return 'Segundo Plato'
        case 'postres': return 'Postre'
        default: return 'Plato'
      }
    }
    
    // Añadir plato al menú
    const addPlato = async () => {
      if (!menuDia.value || !platoForm.nombre) {
        alert('Debes introducir un nombre para el plato')
        return
      }
      
      // Determinar la colección según el tipo
      let collectionName = ''
      switch (platoForm.tipo) {
        case 'primeros': collectionName = 'menu_dia_primeros'; break
        case 'segundos': collectionName = 'menu_dia_segundos'; break
        case 'postres': collectionName = 'menu_dia_postres'; break
        default: return
      }
      
      try {
        const data = {
          nombre: platoForm.nombre,
          descripcion: platoForm.descripcion || '',
          field: menuDia.value.id // Relación con el menú
        }
        
        await pb.collection(collectionName).create(data)
        showAddPlatoForm.value = false
        
        // Recargar platos
        await loadPlatos(menuDia.value.id)
      } catch (err) {
        console.error(`Error al añadir plato a ${platoForm.tipo}:`, err)
        alert('Error al añadir plato: ' + err.message)
      }
    }
    
    // Eliminar plato
    const deletePlato = async (tipo, id) => {
      if (!confirm('¿Estás seguro de eliminar este plato?')) return
      
      // Determinar la colección según el tipo
      let collectionName = ''
      switch (tipo) {
        case 'primeros': collectionName = 'menu_dia_primeros'; break
        case 'segundos': collectionName = 'menu_dia_segundos'; break
        case 'postres': collectionName = 'menu_dia_postres'; break
        default: return
      }
      
      try {
        await pb.collection(collectionName).delete(id)
        
        // Recargar platos
        if (menuDia.value) {
          await loadPlatos(menuDia.value.id)
        }
      } catch (err) {
        console.error(`Error al eliminar plato de ${tipo}:`, err)
        alert('Error al eliminar plato: ' + err.message)
      }
    }
    
    // Cargar datos al montar el componente
    onMounted(() => {
      loadMenuDia()
    })

    onUnmounted(() => {
      cleanupSubscriptions()
    })
    
    return {
      menuDia,
      primeros,
      segundos,
      postres,
      menuForm,
      platoForm,
      showCreateMenuForm,
      showEditMenuForm,
      showAddPlatoForm,
      loadMenuDia,
      createMenuDia,
      updateMenuDia,
      deleteMenuDia,
      openAddPlatoForm,
      getCategoriaLabel,
      addPlato,
      deletePlato
    }
  }
}
</script>

<style scoped>
.menu-dia-admin {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header-section {
  margin-bottom: 1.5rem;
}

.create-menu-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
}

.create-menu-box {
  background-color: rgba(30, 30, 30, 0.7);
  border: 1px dashed rgba(212, 175, 55, 0.5);
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
}

.menu-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.menu-header {
  border-radius: 8px 8px 0 0;
  border-bottom: 2px solid #d4af37;
}

.has-text-gold {
  color: #d4af37 !important;
}

.menu-sections {
  flex-grow: 1;
  padding: 1rem 0;
}

.section-card {
  background-color: rgba(30, 30, 30, 0.7);
  border-radius: 8px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-header {
  background-color: rgba(18, 18, 18, 0.6);
  padding: 0.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
}

.section-header h4 {
  color: #d4af37;
  font-weight: 600;
  margin: 0;
  flex-grow: 1;
}

.section-content {
  padding: 1rem;
  flex-grow: 1;
  overflow-y: auto;
  max-height: 300px;
}

.empty-section {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: #a0a0a0;
  font-style: italic;
  text-align: center;
  border: 1px dashed rgba(160, 160, 160, 0.3);
  border-radius: 4px;
}

.platos-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.plato-item {
  background-color: rgba(18, 18, 18, 0.4);
  border-radius: 6px;
  padding: 0.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 3px solid #d4af37;
}

.plato-info {
  flex-grow: 1;
}

.plato-nombre {
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.plato-desc {
  font-size: 0.85rem;
  color: #a0a0a0;
  font-style: italic;
}

.plato-actions {
  margin-left: 1rem;
}

.delete-btn {
  background-color: transparent;
  border: none;
  color: #f14668;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background-color: rgba(241, 70, 104, 0.2);
}

@media screen and (max-width: 768px) {
  .section-card {
    margin-bottom: 1.5rem;
  }
  
  .section-content {
    max-height: 200px;
  }
}
</style>