<template>
  <div class="system-admin">
    <!-- Sección de Pantallas TV -->
    <div class="card mb-5">
      <div class="card-header">
        <p class="card-header-title">
          <span class="icon"><i class="fas fa-tv"></i></span>
          <span>Pantallas TV</span>
        </p>
      </div>
      
      <div class="card-content">
        <div v-if="loadingTvs" class="has-text-centered my-5">
          <div class="loading-spinner"></div>
          <p class="mt-3">Cargando pantallas...</p>
        </div>
        
        <div v-else-if="tvs.length > 0" class="tv-grid">
          <div 
            v-for="tv in tvs" 
            :key="tv.id"
            class="tv-card"
          >
            <div class="tv-header">
              <div class="tv-icon">📺</div>
              <h3 class="tv-id">{{ tv.tv_id }}</h3>
            </div>
            
            <div class="tv-actions">
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
              <button 
                @click="editTv(tv)"
                class="button is-info is-small"
              >
                <span class="icon is-small">
                  <i class="fas fa-edit"></i>
                </span>
                <span>Editar</span>
              </button>
            </div>
          </div>
        </div>
        
        <div v-else class="notification is-light is-warning">
          <p>No hay televisores configurados.</p>
        </div>
        
        <button 
          @click="showTvForm = true; isEdit = false; resetTvForm()"
          class="button is-primary is-fullwidth mt-4"
        >
          <span class="icon">
            <i class="fas fa-plus"></i>
          </span>
          <span>Añadir nueva pantalla</span>
        </button>
      </div>
    </div>
    
    <!-- Sección de Configuración -->
    <div class="card mb-5">
      <div class="card-header">
        <p class="card-header-title">
          <span class="icon"><i class="fas fa-cog"></i></span>
          <span>Configuración General</span>
        </p>
      </div>
      
      <div class="card-content">
        <form @submit.prevent="saveConfig">
          <div class="field">
            <label class="label">Tiempo de rotación entre vistas (segundos)</label>
            <div class="control">
              <input 
                v-model.number="rotationSeconds" 
                type="number" 
                min="3" 
                step="1" 
                required 
                class="input"
              />
              <p class="help">Tiempo en segundos que cada vista permanecerá en pantalla antes de cambiar a la siguiente.</p>
            </div>
          </div>
          
          <div class="field mt-4">
            <div class="control">
              <button type="submit" class="button is-primary">
                <span class="icon">
                  <i class="fas fa-save"></i>
                </span>
                <span>Guardar configuración</span>
              </button>
            </div>
          </div>
        </form>
        
        <div v-if="configMessage" :class="['notification mt-4', configMessageType === 'success' ? 'is-success' : 'is-danger']">
          <button class="delete" @click="configMessage = ''"></button>
          {{ configMessage }}
        </div>
      </div>
    </div>
    
    <!-- Sección de Diagnóstico -->
    <div class="card">
      <div class="card-header">
        <p class="card-header-title">
          <span class="icon"><i class="fas fa-stethoscope"></i></span>
          <span>Diagnóstico del Sistema</span>
        </p>
      </div>
      
      <div class="card-content">
        <div class="content">
          <p class="mb-4">
            Comprueba el estado del sistema y los permisos de las colecciones.
          </p>
          
          <div class="has-text-centered mb-4">
            <button 
              @click="runDiagnostics" 
              class="button is-primary"
              :class="{'is-loading': isRunning}"
              :disabled="isRunning"
            >
              <span class="icon">
                <i class="fas fa-stethoscope"></i>
              </span>
              <span>Ejecutar diagnóstico</span>
            </button>
          </div>

          <div class="table-container">
            <table class="table is-fullwidth is-hoverable">
              <thead>
                <tr>
                  <th>Colección</th>
                  <th class="has-text-centered">List</th>
                  <th class="has-text-centered">Create</th>
                  <th class="has-text-centered">Update</th>
                  <th class="has-text-centered">Delete</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="diag in diagnostics" :key="diag.collection">
                  <td>
                    <span class="collection-name">{{ diag.collection }}</span>
                  </td>
                  <td class="has-text-centered">
                    <span :class="getStatusClass(diag.listStatus)">
                      {{ diag.listStatus }}
                    </span>
                  </td>
                  <td class="has-text-centered">
                    <span :class="getStatusClass(diag.createStatus)">
                      {{ diag.createStatus }}
                    </span>
                  </td>
                  <td class="has-text-centered">
                    <span :class="getStatusClass(diag.updateStatus)">
                      {{ diag.updateStatus }}
                    </span>
                  </td>
                  <td class="has-text-centered">
                    <span :class="getStatusClass(diag.deleteStatus)">
                      {{ diag.deleteStatus }}
                    </span>
                  </td>
                </tr>
                <tr v-if="diagnostics.length === 0">
                  <td colspan="5" class="has-text-centered">
                    <span v-if="isRunning">Ejecutando diagnóstico...</span>
                    <span v-else>Ejecuta el diagnóstico para ver los resultados</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal para editar/crear TV -->
    <div class="modal" :class="{'is-active': showTvForm}">
      <div class="modal-background" @click="showTvForm = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            {{ isEdit ? 'Editar' : 'Nueva' }} Pantalla TV
          </p>
        </header>
        
        <section class="modal-card-body">
          <div class="field">
            <label class="label">ID de la Pantalla</label>
            <div class="control">
              <input 
                v-model="tvForm.tv_id" 
                type="text" 
                class="input" 
                required
                placeholder="Ej: tv1"
              />
            </div>
            <p class="help">Este identificador se usará para acceder a la pantalla</p>
          </div>
        </section>
        
        <footer class="modal-card-foot">
          <button 
            class="button is-success" 
            @click="saveTv"
            :disabled="!tvForm.tv_id"
          >
            <span class="icon">
              <i class="fas fa-save"></i>
            </span>
            <span>Guardar</span>
          </button>
          <button 
            class="button" 
            @click="showTvForm = false"
          >
            Cancelar
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import pb from '@/services/pocketbase.js'

export default {
  name: 'SystemAdmin',
  setup() {
    // Estado para TVs
    const tvs = ref([])
    const loadingTvs = ref(false)
    const showTvForm = ref(false)
    const isEdit = ref(false)
    const editId = ref(null)
    const tvForm = ref({
      tv_id: ''
    })
    
    // Estado para configuración
    const rotationSeconds = ref(10)
    const configId = ref(null)
    const configMessage = ref('')
    const configMessageType = ref('success')
    
    // Estado para diagnóstico
    const diagnostics = ref([])
    const isRunning = ref(false)
    
    // Añadimos el ID para menu_dia diagnóstico
    const menuDiaDiagnosticId = ref(null)

    // Cargar TVs
    const loadTvs = async () => {
      loadingTvs.value = true
      try {
        const response = await pb.collection('tv_assignments').getFullList({
          sort: 'tv_id'
        })
        console.log('Respuesta de PocketBase:', response)
        tvs.value = response
      } catch (err) {
        console.error('Error al cargar TVs:', err)
        // Mostrar mensaje de error al usuario
        const errorMessage = err.message || 'Error al cargar las pantallas TV'
        alert(errorMessage)
      } finally {
        loadingTvs.value = false
      }
    }
    
    const resetTvForm = () => {
      tvForm.value = {
        tv_id: ''
      }
      isEdit.value = false
      editId.value = null
    }
    
    const editTv = (tv) => {
      isEdit.value = true
      editId.value = tv.id
      tvForm.value = {
        tv_id: tv.tv_id
      }
      showTvForm.value = true
    }
    
    const saveTv = async () => {
      try {
        if (isEdit.value) {
          await pb.collection('tv_assignments').update(editId.value, {
            tv_id: tvForm.value.tv_id
          })
        } else {
          await pb.collection('tv_assignments').create({
            tv_id: tvForm.value.tv_id,
            assigned_views: []
          })
        }
        showTvForm.value = false
        await loadTvs()
      } catch (err) {
        console.error('Error al guardar TV:', err)
        alert('Error al guardar la pantalla TV: ' + err.message)
      }
    }
    
    // Cargar configuración
    const loadConfig = async () => {
      try {
        const config = await pb.collection('config').getFirstListItem('')
        configId.value = config.id
        rotationSeconds.value = config.rotacion_escena_segundos || 10
      } catch (err) {
        console.error('Error al cargar configuración:', err)
        try {
          const newConfig = await pb.collection('config').create({
            rotacion_escena_segundos: 10
          })
          configId.value = newConfig.id
          rotationSeconds.value = 10
        } catch (createErr) {
          console.error('Error al crear configuración:', createErr)
        }
      }
    }
    
    // Guardar configuración
    const saveConfig = async () => {
      try {
        if (!configId.value) {
          await pb.collection('config').create({
            rotacion_escena_segundos: rotationSeconds.value
          })
        } else {
          await pb.collection('config').update(configId.value, {
            rotacion_escena_segundos: rotationSeconds.value
          })
        }
        showConfigMessage('Configuración guardada correctamente', 'success')
      } catch (err) {
        console.error('Error al guardar configuración:', err)
        showConfigMessage('Error al guardar la configuración: ' + err.message, 'danger')
      }
    }
    
    // Funciones auxiliares para diagnóstico
    const getStatusClass = (status) => {
      if (status === 'OK') return 'tag is-success'
      if (status && status.startsWith('403')) return 'tag is-danger'
      if (status && status.startsWith('400')) return 'tag is-warning'
      return 'tag is-light'
    }
    
    // Función para obtener o crear menú día de diagnóstico
    const getOrCreateDiagnosticMenuDia = async () => {
      if (menuDiaDiagnosticId.value) return menuDiaDiagnosticId.value

      try {
        const existing = await pb.collection('menu_dia').getFirstListItem('nombre = "Menú día diag"')
        menuDiaDiagnosticId.value = existing.id
        return existing.id
      } catch (err) {
        // no existe, lo creamos
      }

      const created = await pb.collection('menu_dia').create({
        nombre: 'Menú día diag',
        precio: 9.99,
      })
      menuDiaDiagnosticId.value = created.id
      return created.id
    }

    // Función para generar datos de prueba
    const dummyDataForCollection = async (col) => {
      switch (col) {
        case 'config':
          return {
            rotacion_escena_segundos: 999,
          }

        case 'tv_assignments':
          return {
            tv_id: 'diag-' + Math.random().toString(36).substr(2, 5),
            assigned_views: []
          }

        case 'views':
          return {
            view_name: 'diag_view_' + Math.random().toString(36).substr(2, 5),
          }

        case 'platos':
          return {
            nombre: 'diagnostic_plato',
            precio: 1.99,
            precio_medio: 0.99,
            categoria: 'diagnostic',
            descripcion: 'test create'
          }

        case 'menu_dia':
          return {
            nombre: 'Menú test diag',
            precio: 9.99
          }

        case 'menu_dia_primeros':
        case 'menu_dia_segundos':
        case 'menu_dia_postres': {
          const mdId = await getOrCreateDiagnosticMenuDia()
          return {
            nombre: `Subcol ${col} diag`,
            descripcion: 'test subcol',
            field: mdId
          }
        }

        case 'menus_evento':
          return {
            nombre: 'Menú evento diag',
            precio: 29.99
          }

        case 'eventos':
          return {
            titulo: 'Evento diag',
            descripcion: 'probando create',
            precio_desde: 10
          }

        case 'almuerzos':
          // Crear un archivo de imagen de prueba
          const imageBlob = new Blob(['test'], { type: 'image/png' })
          const testFile = new File([imageBlob], 'test.png', { type: 'image/png' })
          const formData = new FormData()
          formData.append('nombre', 'Almuerzo diag')
          formData.append('precio', '8.50')
          formData.append('imagen', testFile)
          return formData

        case 'almuerzo_items':
          const almuerzoId = await getOrCreateDiagnosticAlmuerzo()
          return {
            nombre: 'Item almuerzo diag',
            descripcion: 'test item',
            almuerzo: almuerzoId
          }

        case 'tv_schedules':
          return {
            tv_id: 'diag-tv',
            schedule_type: await getOrCreateDiagnosticScheduleType(),
            start_time: '09:00',
            end_time: '10:00',
            assigned_views: [],
            is_active: true,
            specific_date: null
          }

        case 'schedule_types':
          return {
            name: 'diagnostic_type',
            is_default: false
          }

        case 'holiday_dates':
          return {
            date: new Date().toISOString().split('T')[0],
            description: 'Día diagnóstico'
          }

        default:
          return { testField: 'diagnostic' }
      }
    }

    // Función para formatear errores
    const formatError = (err) => {
      if (!err) return 'Error desconocido'
      if (err.status) {
        return `${err.status}`
      }
      return err.message || 'Error'
    }

    const runDiagnostics = async () => {
      isRunning.value = true
      diagnostics.value = []

      const collections = [
        'config',
        'tv_assignments',
        'views',
        'platos',
        'menu_dia',
        'menu_dia_primeros',
        'menu_dia_segundos',
        'menu_dia_postres',
        'menus_evento',
        'eventos',
        'almuerzos',
        'almuerzo_items',
        'tv_schedules',
        'schedule_types',
        'holiday_dates'
      ]

      for (const col of collections) {
        const result = {
          collection: col,
          listStatus: 'N/A',
          createStatus: 'N/A',
          updateStatus: 'N/A',
          deleteStatus: 'N/A'
        }

        // 1) List
        try {
          await pb.collection(col).getFullList({ limit: 1 })
          result.listStatus = 'OK'
        } catch (err) {
          result.listStatus = formatError(err)
        }

        // 2) Create
        let createdId = null
        try {
          const createData = await dummyDataForCollection(col)
          const record = await pb.collection(col).create(createData)
          createdId = record.id
          result.createStatus = 'OK'
        } catch (err) {
          result.createStatus = formatError(err)
        }

        // 3) Update (si create fue OK)
        if (createdId) {
          try {
            await pb.collection(col).update(createdId, { testField: 'diagnostic update' })
            result.updateStatus = 'OK'
          } catch (err) {
            result.updateStatus = formatError(err)
          }
        }

        // 4) Delete (si create fue OK)
        if (createdId) {
          try {
            await pb.collection(col).delete(createdId)
            result.deleteStatus = 'OK'
          } catch (err) {
            result.deleteStatus = formatError(err)
          }
        }

        diagnostics.value.push(result)
        
        // Pequeña pausa para no sobrecargar la API
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      isRunning.value = false
    }
    
    const showConfigMessage = (text, type = 'success') => {
      configMessage.value = text
      configMessageType.value = type
      setTimeout(() => {
        configMessage.value = ''
      }, 5000)
    }
    
    // Función para obtener o crear almuerzo de diagnóstico
    const getOrCreateDiagnosticAlmuerzo = async () => {
      try {
        const existing = await pb.collection('almuerzos').getFirstListItem('nombre = "Almuerzo diag"')
        return existing.id
      } catch (err) {
        // Crear un archivo de imagen de prueba para el almuerzo
        const imageBlob = new Blob(['test'], { type: 'image/png' })
        const testFile = new File([imageBlob], 'test.png', { type: 'image/png' })
        const formData = new FormData()
        formData.append('nombre', 'Almuerzo diag')
        formData.append('precio', '8.50')
        formData.append('imagen', testFile)
        
        const created = await pb.collection('almuerzos').create(formData)
        return created.id
      }
    }

    // Función para obtener o crear un tipo de horario de diagnóstico
    const getOrCreateDiagnosticScheduleType = async () => {
      try {
        const existing = await pb.collection('schedule_types').getFirstListItem('name = "diagnostic_type"')
        return existing.id
      } catch (err) {
        const created = await pb.collection('schedule_types').create({
          name: 'diagnostic_type',
          is_default: false
        })
        return created.id
      }
    }
    
    onMounted(async () => {
      await Promise.all([
        loadTvs(),
        loadConfig()
      ])
    })
    
    return {
      tvs,
      loadingTvs,
      showTvForm,
      isEdit,
      tvForm,
      rotationSeconds,
      configMessage,
      configMessageType,
      diagnostics,
      isRunning,
      getStatusClass,
      runDiagnostics,
      resetTvForm,
      editTv,
      saveTv,
      saveConfig
    }
  }
}
</script>

<style scoped>
.system-admin {
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background-color: rgba(30, 30, 30, 0.7);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 55, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.card-header {
  background-color: rgba(18, 18, 18, 0.8);
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
}

.card-header-title {
  color: #d4af37;
  font-weight: 600;
}

.card-header-title .icon {
  margin-right: 0.5rem;
}

.tv-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.tv-card {
  background-color: rgba(18, 18, 18, 0.5);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.tv-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.tv-icon {
  font-size: 2rem;
  margin-right: 0.5rem;
}

.tv-id {
  color: #d4af37;
  font-weight: 600;
  margin: 0;
}

.tv-actions {
  display: flex;
  gap: 0.5rem;
}

.table {
  background-color: rgba(18, 18, 18, 0.5);
  color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.table th {
  color: #d4af37;
  border-bottom-color: rgba(212, 175, 55, 0.3);
  background-color: rgba(18, 18, 18, 0.8);
}

.table td {
  border-color: rgba(80, 80, 80, 0.3);
  vertical-align: middle;
}

.table tr:hover {
  background-color: rgba(30, 30, 30, 0.8);
}

.collection-name {
  font-weight: 600;
  color: #f0f0f0;
}

.modal-card {
  background-color: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.modal-card-head {
  background-color: rgba(18, 18, 18, 0.8);
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
}

.modal-card-title {
  color: #d4af37;
}

.modal-card-body {
  background-color: rgba(30, 30, 30, 0.7);
}

.modal-card-foot {
  background-color: rgba(18, 18, 18, 0.8);
  border-top: 1px solid rgba(212, 175, 55, 0.3);
}

@media (max-width: 768px) {
  .tv-grid {
    grid-template-columns: 1fr;
  }
  
  .table-container {
    overflow-x: auto;
  }
}
</style> 