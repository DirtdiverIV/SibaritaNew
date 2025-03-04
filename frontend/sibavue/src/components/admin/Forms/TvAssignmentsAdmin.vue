// src/components/admin/Forms/TvAssignmentsAdmin.vue
<template>
  <div>
    <h2>Asignar Vistas a TVs</h2>
    
    <!-- Listado de asignaciones existentes -->
    <div v-if="tvs.length > 0">
      <h3>Televisores configurados</h3>
      <ul>
        <li v-for="tv in tvs" :key="tv.id">
          <strong>{{ tv.tv_id }}</strong>: 
          <span v-if="tv.expand?.assigned_views?.length">
            <span v-for="(view, index) in tv.expand.assigned_views" :key="view.id">
              {{ view.view_name }}{{ index < tv.expand.assigned_views.length - 1 ? ', ' : '' }}
            </span>
          </span>
          <span v-else>No tiene vistas asignadas</span>
          <br />
          <button @click="editTv(tv)">Editar</button>
          <button @click="deleteTv(tv.id)">Eliminar</button>
          <hr />
        </li>
      </ul>
      
      <!-- Debug info -->
      <div class="debug-info">
        <h4>Información de depuración:</h4>
        <div v-for="tv in tvs" :key="'debug-' + tv.id">
          <p><strong>TV ID:</strong> {{ tv.tv_id }}</p>
          <p><strong>Assigned Views (IDs):</strong> {{ JSON.stringify(tv.assigned_views) }}</p>
          <p><strong>Expand:</strong> {{ tv.expand ? 'Existe' : 'No existe' }}</p>
          <p v-if="tv.expand"><strong>Expand keys:</strong> {{ Object.keys(tv.expand).join(', ') }}</p>
          <hr />
        </div>
      </div>
    </div>
    <div v-else>
      <p>No hay televisores configurados. Crea uno nuevo.</p>
    </div>

    <!-- Formulario para crear/editar asignaciones -->
    <form @submit.prevent="onSubmit">
      <h3>{{ isEdit ? 'Editar asignación de TV' : 'Crear nueva asignación de TV' }}</h3>
      
      <div>
        <label>ID del Televisor (ejemplo: tv1, tv2, etc.)</label>
        <input v-model="form.tv_id" type="text" required />
      </div>
      
      <div>
        <label>Vistas asignadas (selecciona múltiples)</label>
        <div v-if="allViews.length > 0">
          <div v-for="view in allViews" :key="view.id" style="margin: 5px 0;">
            <input 
              type="checkbox" 
              :id="view.id" 
              :value="view.id" 
              v-model="form.assigned_views"
            />
            <label :for="view.id">{{ view.view_name }}</label>
          </div>
        </div>
        <div v-else>
          <p>No hay vistas disponibles. Crea algunas vistas primero.</p>
        </div>
      </div>

      <button type="submit" :disabled="allViews.length === 0">
        {{ isEdit ? 'Guardar cambios' : 'Crear asignación' }}
      </button>
      <button type="button" @click="resetForm" v-if="isEdit">Cancelar</button>
    </form>

    <!-- Sección para crear vistas si no existen -->
    <div class="create-views" style="margin-top: 30px;">
      <h3>Crear nueva vista</h3>
      <form @submit.prevent="createView">
        <div>
          <label>Nombre de la vista</label>
          <input v-model="newViewName" type="text" placeholder="ej: vista_del_dia, carta..." required />
          <button type="submit">Crear vista</button>
        </div>
      </form>

      <h3>Vistas disponibles</h3>
      <ul>
        <li v-for="view in allViews" :key="view.id">
          {{ view.view_name }} (ID: {{ view.id }})
          <button @click="deleteView(view.id)">Eliminar</button>
        </li>
      </ul>
    </div>
    
    <!-- Mensaje de estado -->
    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import pb from '@/services/pocketbase.js'

export default {
  name: 'TvAssignmentsAdmin',
  setup() {
    // Estado
    const tvs = ref([])
    const allViews = ref([])
    const isEdit = ref(false)
    const editId = ref(null)
    const newViewName = ref('')
    const message = ref('')
    const messageType = ref('success')

    // Formulario para las asignaciones
    const form = reactive({
      tv_id: '',
      assigned_views: []  // array de IDs - corregido a assigned_views
    })

    // Cargar las asignaciones existentes
    const loadTvs = async () => {
      try {
        console.log('Cargando asignaciones de TV...')
        tvs.value = await pb.collection('tv_assignments').getFullList({
          expand: 'assigned_views', // Corregido a assigned_views
          sort: 'tv_id'
        })
        console.log('Asignaciones cargadas:', tvs.value)
      } catch (err) {
        console.error('Error loading TV assignments:', err)
        showMessage('Error al cargar asignaciones: ' + err.message, 'error')
      }
    }

    // Cargar todas las vistas disponibles
    const loadViews = async () => {
      try {
        console.log('Cargando vistas disponibles...')
        allViews.value = await pb.collection('views').getFullList({
          sort: 'view_name'
        })
        console.log('Vistas cargadas:', allViews.value)
      } catch (err) {
        console.error('Error loading views:', err)
        showMessage('Error al cargar vistas: ' + err.message, 'error')
      }
    }

    // Editar una asignación existente
    const editTv = (tv) => {
      isEdit.value = true
      editId.value = tv.id
      form.tv_id = tv.tv_id
      
      // Extraer IDs de vistas asignadas
      if (tv.expand?.assigned_views) {
        form.assigned_views = tv.expand.assigned_views.map(v => v.id)
      } else if (tv.assigned_views) {
        // Si no hay expansión pero tenemos los IDs directamente
        form.assigned_views = Array.isArray(tv.assigned_views) ? tv.assigned_views : [tv.assigned_views]
      } else {
        form.assigned_views = []
      }
      
      console.log('Editando TV:', tv.tv_id, 'con vistas:', form.assigned_views)
    }

    // Eliminar una asignación
    const deleteTv = async (id) => {
      if (!confirm('¿Seguro que deseas eliminar esta asignación?')) return
      
      try {
        console.log('Eliminando asignación ID:', id)
        await pb.collection('tv_assignments').delete(id)
        showMessage('Asignación eliminada correctamente', 'success')
        await loadTvs() // Recargar la lista
      } catch (err) {
        console.error('Error deleting TV assignment:', err)
        showMessage('Error al eliminar: ' + err.message, 'error')
      }
    }

    // Crear o actualizar una asignación
    const onSubmit = async () => {
      try {
        const data = {
          tv_id: form.tv_id,
          assigned_views: form.assigned_views // Corregido a assigned_views
        }
        
        console.log('Guardando datos de asignación:', data)
        
        if (isEdit.value && editId.value) {
          // Actualizar
          console.log('Actualizando asignación ID:', editId.value)
          await pb.collection('tv_assignments').update(editId.value, data)
          showMessage('Asignación actualizada correctamente', 'success')
        } else {
          // Crear nuevo
          console.log('Creando nueva asignación')
          await pb.collection('tv_assignments').create(data)
          showMessage('Asignación creada correctamente', 'success')
        }
        
        await loadTvs() // Recargar lista
        resetForm()
      } catch (err) {
        console.error('Error saving TV assignment:', err)
        showMessage('Error al guardar: ' + err.message, 'error')
      }
    }

    // Resetear formulario
    const resetForm = () => {
      isEdit.value = false
      editId.value = null
      form.tv_id = ''
      form.assigned_views = []
    }

    // Crear una nueva vista
    const createView = async () => {
      if (!newViewName.value.trim()) return
      
      try {
        console.log('Creando nueva vista:', newViewName.value)
        await pb.collection('views').create({
          view_name: newViewName.value.trim()
        })
        
        showMessage('Vista creada correctamente', 'success')
        newViewName.value = ''
        await loadViews() // Recargar vistas
      } catch (err) {
        console.error('Error creating view:', err)
        showMessage('Error al crear vista: ' + err.message, 'error')
      }
    }

    // Eliminar una vista
    const deleteView = async (id) => {
      if (!confirm('¿Seguro que deseas eliminar esta vista?')) return
      
      try {
        console.log('Eliminando vista ID:', id)
        await pb.collection('views').delete(id)
        showMessage('Vista eliminada correctamente', 'success')
        await loadViews() // Recargar vistas
      } catch (err) {
        console.error('Error deleting view:', err)
        showMessage('Error al eliminar vista: ' + err.message, 'error')
      }
    }

    // Mostrar mensaje
    const showMessage = (text, type = 'success') => {
      message.value = text
      messageType.value = type
      
      // Limpiar después de 5 segundos
      setTimeout(() => {
        message.value = ''
      }, 5000)
    }

    // Cargar datos al montar el componente
    onMounted(() => {
      loadTvs()
      loadViews()
    })

    return {
      tvs,
      allViews,
      form,
      isEdit,
      newViewName,
      message,
      messageType,
      editTv,
      deleteTv,
      onSubmit,
      resetForm,
      createView,
      deleteView
    }
  }
}
</script>

<style scoped>
form {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  margin-right: 5px;
  margin-top: 10px;
}

input[type="text"] {
  width: 100%;
  padding: 5px;
  margin: 5px 0;
}

label {
  display: block;
  margin-top: 10px;
}

hr {
  margin: 10px 0;
}

.debug-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-family: monospace;
  font-size: 14px;
}

.message {
  margin-top: 20px;
  padding: 10px;
  border-radius: 5px;
}

.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>