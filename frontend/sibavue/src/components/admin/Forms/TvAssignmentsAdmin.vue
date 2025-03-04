<template>
  <div class="tv-assignments-admin">
    <!-- Sección de asignaciones de TV -->
    <div class="card mb-5">
      <div class="card-header">
        <p class="card-header-title">
          Asignaciones de Televisores
        </p>
      </div>
      
      <div class="card-content">
        <div v-if="loading" class="has-text-centered my-5">
          <div class="loading-spinner"></div>
          <p class="mt-3">Cargando datos...</p>
        </div>
        
        <div v-else-if="tvs.length > 0">
          <div class="assignment-cards">
            <div 
              v-for="tv in tvs" 
              :key="tv.id"
              class="assignment-card"
            >
              <div class="assignment-header">
                <div class="tv-icon">📺</div>
                <h3 class="tv-id">{{ tv.tv_id }}</h3>
              </div>
              
              <div class="assignment-views">
                <h4 class="views-title">Vistas asignadas:</h4>
                <div v-if="getAssignedViewNames(tv).length > 0" class="views-list">
                  <div 
                    v-for="(viewName, index) in getAssignedViewNames(tv)" 
                    :key="viewName"
                    class="view-tag"
                  >
                    {{ formatViewName(viewName) }}
                  </div>
                </div>
                <p v-else class="no-views">Sin vistas asignadas</p>
              </div>
              
              <div class="assignment-actions">
                <button 
                  @click="editTv(tv)"
                  class="button is-info is-small"
                >
                  <span class="icon is-small">
                    <i class="fas fa-edit"></i>
                  </span>
                  <span>Editar</span>
                </button>
                <button 
                  @click="deleteTv(tv.id)"
                  class="button is-danger is-small"
                >
                  <span class="icon is-small">
                    <i class="fas fa-trash"></i>
                  </span>
                  <span>Eliminar</span>
                </button>
                <a 
                  :href="`/tv/${tv.tv_id}`" 
                  target="_blank"
                  class="button is-primary is-small"
                >
                  <span class="icon is-small">
                    <i class="fas fa-eye"></i>
                  </span>
                  <span>Ver</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="notification is-light is-warning">
          <p>No hay televisores configurados. Crea una nueva asignación de televisor.</p>
        </div>
        
        <!-- Botón para añadir nueva asignación -->
        <button 
          @click="showAssignmentForm = true; isEdit = false; resetForm()"
          class="button is-primary is-fullwidth mt-4"
        >
          <span class="icon">
            <i class="fas fa-plus"></i>
          </span>
          <span>Añadir nueva asignación de TV</span>
        </button>
      </div>
    </div>
    
    <!-- Sección de gestión de vistas -->
    <div class="card">
      <div class="card-header">
        <p class="card-header-title">
          Gestión de Vistas Disponibles
        </p>
      </div>
      
      <div class="card-content">
        <div v-if="loadingViews" class="has-text-centered my-5">
          <div class="loading-spinner"></div>
          <p class="mt-3">Cargando vistas...</p>
        </div>
        
        <div v-else>
          <!-- Vistas disponibles -->
          <div class="views-container mb-5">
            <h3 class="subtitle is-5 mb-3">Vistas disponibles</h3>
            
            <div v-if="allViews.length > 0" class="available-views">
              <div 
                v-for="view in allViews" 
                :key="view.id"
                class="view-item"
              >
                <span class="view-name">{{ formatViewName(view.view_name) }}</span>
                <button 
                  @click="deleteView(view.id)"
                  class="button is-danger is-small is-outlined"
                >
                  <span class="icon is-small">
                    <i class="fas fa-times"></i>
                  </span>
                </button>
              </div>
            </div>
            
            <div v-else class="notification is-light is-warning">
              <p>No hay vistas disponibles. Crea primero algunas vistas.</p>
            </div>
          </div>
          
          <!-- Formulario para crear nueva vista -->
          <div class="add-view-form">
            <h3 class="subtitle is-5 mb-3">Crear nueva vista</h3>
            
            <form @submit.prevent="createView" class="field has-addons">
              <div class="control is-expanded">
                <input 
                  v-model="newViewName" 
                  class="input" 
                  type="text" 
                  placeholder="ej: vista_del_dia, carta..." 
                  required
                />
              </div>
              <div class="control">
                <button type="submit" class="button is-info">
                  <span class="icon is-small">
                    <i class="fas fa-plus"></i>
                  </span>
                  <span>Crear vista</span>
                </button>
              </div>
            </form>
            
            <p class="help mt-2">
              <strong>Nota:</strong> Las vistas deben coincidir con los nombres de componentes disponibles: 
              <span class="tag is-info is-light mr-1 mb-1">vista_del_dia</span>
              <span class="tag is-info is-light mr-1 mb-1">carta</span>
              <span class="tag is-info is-light mr-1 mb-1">eventos</span>
              <span class="tag is-info is-light mr-1 mb-1">sugerencias_chef</span>
              <span class="tag is-info is-light mr-1 mb-1">menu_dia</span>
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de formulario para asignación de TV -->
    <div class="modal" :class="{'is-active': showAssignmentForm}">
      <div class="modal-background" @click="showAssignmentForm = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ isEdit ? 'Editar asignación de TV' : 'Nueva asignación de TV' }}</p>
          <button 
            @click="showAssignmentForm = false" 
            class="delete" 
            aria-label="close"
          ></button>
        </header>
        
        <section class="modal-card-body">
          <form @submit.prevent="onSubmit">
            <div class="field">
              <label class="label">ID del Televisor</label>
              <div class="control">
                <input 
                  v-model="form.tv_id" 
                  class="input" 
                  type="text" 
                  placeholder="ej: tv1, tv2, tv3..." 
                  required
                />
              </div>
              <p class="help">
                Este identificador se usará en la URL (ej: /tv/tv1)
              </p>
            </div>
            
            <div class="field">
              <label class="label">Vistas asignadas</label>
              <div v-if="allViews.length > 0" class="view-selection">
                <div 
                  v-for="view in allViews" 
                  :key="view.id"
                  class="view-option"
                >
                  <label class="checkbox">
                    <input 
                      type="checkbox" 
                      :value="view.id" 
                      v-model="form.assigned_views"
                    />
                    <span class="view-label">{{ formatViewName(view.view_name) }}</span>
                  </label>
                </div>
              </div>
              <div v-else class="notification is-light is-warning">
                <p>No hay vistas disponibles. Crea algunas vistas primero.</p>
              </div>
            </div>
          </form>
        </section>
        
        <footer class="modal-card-foot">
          <button 
            @click="onSubmit" 
            class="button is-primary" 
            :disabled="!form.tv_id || allViews.length === 0"
          >
            {{ isEdit ? 'Guardar cambios' : 'Crear asignación' }}
          </button>
          <button @click="showAssignmentForm = false" class="button">Cancelar</button>
        </footer>
      </div>
    </div>
    
    <!-- Mensajes de notificación -->
    <div 
      v-if="message" 
      class="notification mt-4" 
      :class="'is-' + messageType"
    >
      <button class="delete" @click="clearMessage"></button>
      {{ message }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import pb from '@/services/pocketbase.js'

export default {
  name: 'TvAssignmentsAdmin',
  setup() {
    // Estado
    const tvs = ref([])
    const allViews = ref([])
    const isEdit = ref(false)
    const editId = ref(null)
    const showAssignmentForm = ref(false)
    const newViewName = ref('')
    const message = ref('')
    const messageType = ref('info')
    const loading = ref(true)
    const loadingViews = ref(true)
    
    // Formulario
    const form = reactive({
      tv_id: '',
      assigned_views: []
    })
    
    // Extraer nombres de vistas asignadas
    const getAssignedViewNames = (tv) => {
      const viewNames = []
      
      // Si tiene expand.assigned_views
      if (tv.expand && tv.expand.assigned_views) {
        viewNames.push(...tv.expand.assigned_views.map(v => v.view_name))
      }
      // Si solo tiene IDs, buscamos los nombres
      else if (tv.assigned_views && tv.assigned_views.length > 0) {
        const viewIds = Array.isArray(tv.assigned_views) ? tv.assigned_views : [tv.assigned_views]
        viewIds.forEach(id => {
          const view = allViews.value.find(v => v.id === id)
          if (view) {
            viewNames.push(view.view_name)
          }
        })
      }
      
      return viewNames
    }
    
    // Formatear nombre de vista
    const formatViewName = (viewName) => {
      if (!viewName) return ''
      
      // Reemplazar guiones por espacios y capitalizar
      return viewName
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }
    
    // Cargar asignaciones de TV
    const loadTvs = async () => {
      loading.value = true
      
      try {
        tvs.value = await pb.collection('tv_assignments').getFullList({
          expand: 'assigned_views',
          sort: 'tv_id'
        })
      } catch (err) {
        console.error('Error al cargar asignaciones:', err)
        showMessage('Error al cargar asignaciones: ' + err.message, 'danger')
      } finally {
        loading.value = false
      }
    }
    
    // Cargar vistas disponibles
    const loadViews = async () => {
      loadingViews.value = true
      
      try {
        allViews.value = await pb.collection('views').getFullList({
          sort: 'view_name'
        })
      } catch (err) {
        console.error('Error al cargar vistas:', err)
        showMessage('Error al cargar vistas: ' + err.message, 'danger')
      } finally {
        loadingViews.value = false
      }
    }
    
    // Editar asignación de TV
    const editTv = (tv) => {
      isEdit.value = true
      editId.value = tv.id
      form.tv_id = tv.tv_id
      
      // Extraer IDs de vistas asignadas
      if (tv.assigned_views) {
        form.assigned_views = Array.isArray(tv.assigned_views) ? 
          tv.assigned_views : [tv.assigned_views]
      } else {
        form.assigned_views = []
      }
      
      showAssignmentForm.value = true
    }
    
    // Eliminar asignación de TV
    const deleteTv = async (id) => {
      if (!confirm('¿Estás seguro de eliminar esta asignación de TV?')) return
      
      try {
        await pb.collection('tv_assignments').delete(id)
        showMessage('Asignación de TV eliminada correctamente', 'success')
        await loadTvs()
      } catch (err) {
        console.error('Error al eliminar asignación:', err)
        showMessage('Error al eliminar: ' + err.message, 'danger')
      }
    }
    
    // Crear o actualizar asignación de TV
    const onSubmit = async () => {
      try {
        const data = {
          tv_id: form.tv_id,
          assigned_views: form.assigned_views
        }
        
        if (isEdit.value && editId.value) {
          // Actualizar
          await pb.collection('tv_assignments').update(editId.value, data)
          showMessage('Asignación de TV actualizada correctamente', 'success')
        } else {
          // Crear
          await pb.collection('tv_assignments').create(data)
          showMessage('Asignación de TV creada correctamente', 'success')
        }
        
        showAssignmentForm.value = false
        await loadTvs()
        resetForm()
      } catch (err) {
        console.error('Error al guardar asignación:', err)
        showMessage('Error al guardar: ' + err.message, 'danger')
      }
    }
    
    // Crear nueva vista
    const createView = async () => {
      if (!newViewName.value.trim()) return
      
      try {
        await pb.collection('views').create({
          view_name: newViewName.value.trim()
        })
        
        showMessage('Vista creada correctamente', 'success')
        newViewName.value = ''
        await loadViews()
      } catch (err) {
        console.error('Error al crear vista:', err)
        showMessage('Error al crear vista: ' + err.message, 'danger')
      }
    }
    
    // Eliminar vista
    const deleteView = async (id) => {
      if (!confirm('¿Estás seguro de eliminar esta vista?')) return
      
      try {
        await pb.collection('views').delete(id)
        showMessage('Vista eliminada correctamente', 'success')
        await loadViews()
      } catch (err) {
        console.error('Error al eliminar vista:', err)
        showMessage('Error al eliminar vista: ' + err.message, 'danger')
      }
    }
    
    // Resetear formulario
    const resetForm = () => {
      form.tv_id = ''
      form.assigned_views = []
      isEdit.value = false
      editId.value = null
    }
    
    // Mostrar mensaje
    const showMessage = (text, type = 'info') => {
      message.value = text
      messageType.value = type
      
      // Auto-ocultar después de 5 segundos
      setTimeout(() => {
        clearMessage()
      }, 5000)
    }
    
    // Limpiar mensaje
    const clearMessage = () => {
      message.value = ''
    }
    
    onMounted(() => {
      loadViews()
      loadTvs()
    })
    
    return {
      tvs,
      allViews,
      form,
      isEdit,
      showAssignmentForm,
      newViewName,
      message,
      messageType,
      loading,
      loadingViews,
      editTv,
      deleteTv,
      onSubmit,
      resetForm,
      createView,
      deleteView,
      getAssignedViewNames,
      formatViewName,
      clearMessage
    }
  }
}
</script>

<style scoped>
.tv-assignments-admin {
  margin-bottom: 2rem;
}

.assignment-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.assignment-card {
  background: rgba(30, 30, 30, 0.7);
  border-radius: 8px;
  padding: 1.2rem;
  border: 1px solid rgba(212, 175, 55, 0.2);
  transition: all 0.3s ease;
}

.assignment-card:hover {
  border-color: rgba(212, 175, 55, 0.5);
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.assignment-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  padding-bottom: 0.8rem;
}

.tv-icon {
  font-size: 1.8rem;
  margin-right: 0.8rem;
}

.tv-id {
  font-size: 1.3rem;
  font-weight: 600;
  color: #d4af37;
}

.views-title {
  font-size: 0.9rem;
  color: #e0e0e0;
  margin-bottom: 0.5rem;
}

.views-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.view-tag {
  background: rgba(212, 175, 55, 0.15);
  color: #d4af37;
  border: 1px solid rgba(212, 175, 55, 0.3);
  font-size: 0.85rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.no-views {
  font-style: italic;
  color: #a0a0a0;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.assignment-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.view-selection {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

.view-option {
  background: rgba(30, 30, 30, 0.5);
  padding: 0.8rem;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.view-option:hover {
  background: rgba(30, 30, 30, 0.8);
}

.checkbox {
  display: flex;
  align-items: center;
}

.view-label {
  margin-left: 0.5rem;
}

.available-views {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

.view-item {
  display: flex;
  align-items: center;
  background: rgba(30, 30, 30, 0.6);
  padding: 0.5rem 0.8rem;
  border-radius: 4px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.view-name {
  margin-right: 0.5rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid rgba(212, 175, 55, 0.3);
  border-top-color: #d4af37;
  animation: spin 1.5s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Estilos para móvil */
@media screen and (max-width: 768px) {
  .assignment-cards {
    grid-template-columns: 1fr;
  }
  
  .assignment-actions {
    justify-content: space-between;
  }
  
  .view-selection {
    grid-template-columns: 1fr;
  }
}
</style>