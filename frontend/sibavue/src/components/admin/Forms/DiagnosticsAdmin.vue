<template>
  <div class="diagnostics-admin">
    <div class="card">
      <div class="card-header">
        <p class="card-header-title">
          Diagnóstico de Permisos y Operaciones
        </p>
      </div>
      
      <div class="card-content">
        <div class="content">
          <p class="mb-4">
            Esta herramienta permite comprobar los permisos de las colecciones, realizando operaciones CRUD (Create, Read, Update, Delete) sobre cada una de ellas.
          </p>
          
          <div class="notification is-warning is-light mb-4">
            <p>
              <span class="icon"><i class="fas fa-exclamation-triangle"></i></span>
              <span>Esta herramienta creará y eliminará registros de prueba. No afectará a sus datos existentes, pero utilícela con precaución.</span>
            </p>
          </div>
          
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
    
    <div class="card mt-5">
      <div class="card-header">
        <p class="card-header-title">
          Información del Diagnóstico
        </p>
      </div>
      
      <div class="card-content">
        <div class="content">
          <div class="columns is-multiline">
            <div class="column is-6">
              <div class="info-box">
                <h3 class="subtitle is-6">Significado de los estados:</h3>
                <ul>
                  <li><span class="tag is-success">OK</span> - Operación permitida y ejecutada correctamente.</li>
                  <li><span class="tag is-danger">403</span> - Error de permisos (no autorizado).</li>
                  <li><span class="tag is-warning">400</span> - Error en los datos enviados.</li>
                  <li><span class="tag is-light">N/A</span> - No se pudo probar (depende de otra operación).</li>
                </ul>
              </div>
            </div>
            
            <div class="column is-6">
              <div class="info-box">
                <h3 class="subtitle is-6">¿Qué hacer con los resultados?</h3>
                <p>Si encuentras errores de permisos (403), deberías revisar las reglas de acceso en PocketBase para esa colección.</p>
                <p>Si encuentras errores de datos (400), comprueba los campos requeridos y las validaciones.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import pb from '@/services/pocketbase.js'

export default {
  name: 'DiagnosticsAdmin',

  setup() {
    // Colecciones a testear:
    const collectionsToTest = [
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
    ]

    const diagnostics = ref([])
    const isRunning = ref(false)

    // -- Función auxiliar: crea o busca un menu_dia dummy para enlazar subcolecciones --
    const menuDiaDiagnosticId = ref(null)
    const getOrCreateDiagnosticMenuDia = async () => {
      // Si ya lo tenemos, usamos el mismo
      if (menuDiaDiagnosticId.value) return menuDiaDiagnosticId.value

      // 1) Buscar si existe un "Menú día diag" para reusarlo
      try {
        const existing = await pb.collection('menu_dia').getFirstListItem('nombre = "Menú día diag"')
        menuDiaDiagnosticId.value = existing.id
        return existing.id
      } catch (err) {
        // no existe, lo creamos
      }

      // 2) Crear uno
      const created = await pb.collection('menu_dia').create({
        nombre: 'Menú día diag',
        precio: 9.99,
      })
      menuDiaDiagnosticId.value = created.id
      return created.id
    }

    // Datos "dummy" para cada colección:
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
          // Ajustado a tu schema: nombre, precio, precio_medio, categoria...
          return {
            nombre: 'diagnostic_plato',
            precio: 1.99,        // O "price" si tu schema lo pide
            precio_medio: 0.99,  // O quita si no existe
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
          // Subcolección que requiere un menu_dia "field"
          const mdId = await getOrCreateDiagnosticMenuDia()
          return {
            nombre: `Subcol ${col} diag`,
            descripcion: 'test subcol',
            // Ajusta el nombre del campo relation si no se llama "field"
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

        default:
          return { testField: 'diagnostic' }
      }
    }

    // Determinar la clase CSS según el estado
    const getStatusClass = (status) => {
      if (status === 'OK') return 'tag is-success'
      if (status && status.startsWith('403')) return 'tag is-danger'
      if (status && status.startsWith('400')) return 'tag is-warning'
      return 'tag is-light'
    }

    const runDiagnostics = async () => {
      isRunning.value = true
      diagnostics.value = []

      for (const col of collectionsToTest) {
        const result = {
          collection: col,
          listStatus: 'N/A',
          createStatus: 'N/A',
          updateStatus: 'N/A',
          deleteStatus: 'N/A',
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

    // Helper: formatea errores en "Status - Mensaje"
    const formatError = (err) => {
      if (!err) return 'Error desconocido'
      if (err.status) {
        return `${err.status}`
      }
      return err.message || 'Error'
    }

    return {
      diagnostics,
      isRunning,
      runDiagnostics,
      getStatusClass
    }
  }
}
</script>

<style scoped>
.diagnostics-admin {
  max-width: 900px;
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

.info-box {
  background-color: rgba(30, 30, 30, 0.5);
  padding: 1rem;
  border-radius: 6px;
  height: 100%;
  border-left: 3px solid rgba(212, 175, 55, 0.3);
}

.info-box .subtitle {
  color: #d4af37;
  margin-bottom: 0.8rem;
}

.tag {
  min-width: 40px;
}
</style>