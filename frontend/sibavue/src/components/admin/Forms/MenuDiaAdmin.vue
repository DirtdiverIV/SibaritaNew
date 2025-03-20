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

          <!-- Sección Inclusión -->
          <div class="column is-12-mobile is-4-tablet">
            <div class="section-card">
              <div class="section-header">
                <h4 class="has-text-centered">Incluye</h4>
              </div>
              
              <div class="section-content">
                <div class="inclusion-item">
                  <i class="fas fa-bread-slice"></i>
                  <span>Pan</span>
                </div>
                <div class="inclusion-item">
                  <i class="fas fa-glass-martini-alt"></i>
                  <span>Bebida</span>
                </div>
                <div class="inclusion-item">
                  <i class="fas fa-coffee"></i>
                  <span>Café o postre</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal para crear nuevo menú -->
    <div class="modal" :class="{ 'is-active': showCreateMenuForm }">
      <div class="modal-background"></div>
      <div class="modal-content">
        <div class="box">
          <h3 class="title has-text-centered">Crear Nuevo Menú del Día</h3>
          <div class="field">
            <label class="label">Nombre</label>
            <div class="control">
              <input v-model="menuForm.nombre" class="input" type="text" placeholder="Nombre del menú">
            </div>
          </div>
          <div class="field">
            <label class="label">Precio</label>
            <div class="control">
              <input v-model="menuForm.precio" class="input" type="number" step="0.01" placeholder="Precio del menú">
            </div>
          </div>
          <div class="field is-grouped is-grouped-centered">
            <div class="control">
              <button @click="createMenuDia" class="button is-primary">Crear</button>
            </div>
            <div class="control">
              <button @click="showCreateMenuForm = false" class="button">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para editar menú -->
    <div class="modal" :class="{ 'is-active': showEditMenuForm }">
      <div class="modal-background"></div>
      <div class="modal-content">
        <div class="box">
          <h3 class="title has-text-centered">Editar Menú del Día</h3>
          <div class="field">
            <label class="label">Nombre</label>
            <div class="control">
              <input v-model="menuForm.nombre" class="input" type="text" placeholder="Nombre del menú">
            </div>
          </div>
          <div class="field">
            <label class="label">Precio</label>
            <div class="control">
              <input v-model="menuForm.precio" class="input" type="number" step="0.01" placeholder="Precio del menú">
            </div>
          </div>
          <div class="field is-grouped is-grouped-centered">
            <div class="control">
              <button @click="updateMenuDia" class="button is-primary">Guardar</button>
            </div>
            <div class="control">
              <button @click="showEditMenuForm = false" class="button">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para añadir plato -->
    <div class="modal" :class="{ 'is-active': showAddPlatoForm }">
      <div class="modal-background"></div>
      <div class="modal-content">
        <div class="box">
          <h3 class="title has-text-centered">Añadir {{ getCategoriaLabel() }}</h3>
          <div class="field">
            <label class="label">Nombre</label>
            <div class="control">
              <input v-model="platoForm.nombre" class="input" type="text" placeholder="Nombre del plato">
            </div>
          </div>
          <div class="field">
            <label class="label">Descripción (opcional)</label>
            <div class="control">
              <textarea v-model="platoForm.descripcion" class="textarea" placeholder="Descripción del plato"></textarea>
            </div>
          </div>
          <div class="field is-grouped is-grouped-centered">
            <div class="control">
              <button @click="addPlato" class="button is-primary">Añadir</button>
            </div>
            <div class="control">
              <button @click="showAddPlatoForm = false" class="button">Cancelar</button>
            </div>
          </div>
        </div>
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
    
    // Formularios
    const menuForm = reactive({
      nombre: '',
      precio: 0
    })
    
    const platoForm = reactive({
      nombre: '',
      descripcion: '',
      tipo: '' // 'primeros' o 'segundos'
    })
    
    // Estado de los modales
    const showCreateMenuForm = ref(false)
    const showEditMenuForm = ref(false)
    const showAddPlatoForm = ref(false)

    // Suscripciones
    let menuSubscription = null
    let primerosSubscription = null
    let segundosSubscription = null
    
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
    }

    // Limpiar suscripciones
    const cleanupSubscriptions = () => {
      if (menuSubscription) pb.collection('menu_dia').unsubscribe()
      if (primerosSubscription) pb.collection('menu_dia_primeros').unsubscribe()
      if (segundosSubscription) pb.collection('menu_dia_segundos').unsubscribe()
      
      menuSubscription = null
      primerosSubscription = null
      segundosSubscription = null
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
  overflow: visible;
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
  background-color: rgba(18, 18, 18, 0.6);
  border-radius: 6px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 3px solid #d4af37;
}

.plato-info {
  flex: 1;
}

.plato-nombre {
  color: #fff;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.plato-desc {
  color: #a0a0a0;
  font-size: 0.9rem;
}

.plato-actions {
  display: flex;
  gap: 0.5rem;
}

.delete-btn {
  background: none;
  border: none;
  color: #ff4444;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.delete-btn:hover {
  background-color: rgba(255, 68, 68, 0.1);
}

.modal-content {
  max-width: 500px;
  margin: 0 auto;
}

.box {
  background-color: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.title {
  color: #d4af37;
}

.label {
  color: #fff;
}

.input, .textarea {
  background-color: rgba(18, 18, 18, 0.6);
  border-color: rgba(212, 175, 55, 0.3);
  color: #fff;
}

.input:focus, .textarea:focus {
  border-color: #d4af37;
  box-shadow: 0 0 0 0.125em rgba(212, 175, 55, 0.25);
}

.button.is-primary {
  background-color: #d4af37;
  border-color: #d4af37;
}

.button.is-primary:hover {
  background-color: #c19b2e;
  border-color: #c19b2e;
}

.button {
  background-color: transparent;
  border-color: #d4af37;
  color: #d4af37;
}

.button:hover {
  background-color: rgba(212, 175, 55, 0.1);
}

.inclusion-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: rgba(18, 18, 18, 0.6);
  border-radius: 6px;
  margin-bottom: 0.8rem;
  border-left: 3px solid #d4af37;
}

.inclusion-item i {
  color: #d4af37;
  font-size: 1.2rem;
}

.inclusion-item span {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 500;
}

.inclusion-item:last-child {
  margin-bottom: 0;
}
</style>