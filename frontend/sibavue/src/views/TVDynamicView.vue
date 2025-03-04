// src/views/TVDynamicView.vue
<template>
  <div class="tv-screen">
    <div class="tv-header">
      <h1>Sibarita Restaurant</h1>
    </div>
    
    <div class="tv-content">
      <!-- Muestra el componente actual (ej. VistaDelDia, Carta...) -->
      <component :is="currentViewComponent" v-if="currentViewComponent" />
      <div v-else class="tv-loading">
        <h2>Cargando vistas...</h2>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        
        <!-- Información de depuración -->
        <div class="debug-info">
          <h3>Información de depuración:</h3>
          <p>TV ID: {{ route.params.tvId }}</p>
          <p>Vistas asignadas: {{ JSON.stringify(assignedViews) }}</p>
          <p>Vista actual: {{ currentViewName }}</p>
          <p>Componente actual: {{ currentViewComponent ? currentViewComponent.name : 'ninguno' }}</p>
          <p>Diccionario de vistas: {{ Object.keys(viewMap).join(', ') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import pb from '@/services/pocketbase.js'

// Importa tus componentes reales
import VistaDelDia from '@/components/tvViews/VistaDelDia.vue'
import Carta from '@/components/tvViews/Carta.vue'
import Eventos from '@/components/tvViews/Eventos.vue'
import SugerenciasChef from '@/components/tvViews/SugerenciasChef.vue'
import MenuDia from '@/components/tvViews/MenuDia.vue'

export default {
  name: 'TVDynamicView',
  setup() {
    const route = useRoute()
    const assignedViews = ref([])
    const currentIndex = ref(0)
    const rotationInterval = ref(null)
    const errorMessage = ref('')
    const debugInfo = ref({})

    // Diccionario que asocia nombre de la vista (en BD) => componente Vue
    const viewMap = {
      vista_del_dia: VistaDelDia,
      carta: Carta,
      eventos: Eventos,
      sugerencias_chef: SugerenciasChef,
      menu_dia: MenuDia
    }

    const currentViewName = computed(() => {
      if (!assignedViews.value.length) return null
      return assignedViews.value[currentIndex.value]
    })

    const currentViewComponent = computed(() => {
      if (!currentViewName.value) return null
      return viewMap[currentViewName.value] || null
    })

    // Carga la configuración de tv_assignments para un tvId dado
    const loadTvAssignment = async (tvId) => {
      try {
        console.log('Intentando cargar asignaciones para TV:', tvId)
        
        // Intentar obtener todas las asignaciones para depuración
        const allAssignments = await pb.collection('tv_assignments').getFullList()
        console.log('Todas las asignaciones disponibles:', allAssignments)
        
        // Intentar obtener la asignación específica para este TV
        const record = await pb.collection('tv_assignments')
          .getFirstListItem(`tv_id = "${tvId}"`, { expand: 'assigned_views' })
        
        console.log('Registro encontrado:', record)
        
        // Verificar el nombre del campo (ahora corregido a assigned_views con doble 's')
        if (record.expand && record.expand.assigned_views) {
          console.log('Vistas expandidas:', record.expand.assigned_views)
          // Extrae los view_name de cada vista asignada
          assignedViews.value = record.expand.assigned_views.map(v => v.view_name) || []
          console.log('Nombres de vistas extraídos:', assignedViews.value)
        } else {
          console.log('No se encontró el campo expand.assigned_views en el registro')
          console.log('Campos disponibles en record:', Object.keys(record))
          console.log('Campos disponibles en record.expand (si existe):', record.expand ? Object.keys(record.expand) : 'record.expand no existe')
          
          // Intentar buscar el campo directo
          if (record.assigned_views) {
            console.log('Encontrado campo assigned_views directo:', record.assigned_views)
            
            // Si assigned_views es un array de IDs, intentar cargar las vistas
            try {
              const viewsPromises = record.assigned_views.map(id => 
                pb.collection('views').getOne(id)
              )
              const views = await Promise.all(viewsPromises)
              console.log('Vistas cargadas manualmente:', views)
              assignedViews.value = views.map(v => v.view_name)
              console.log('Nombres de vistas extraídos manualmente:', assignedViews.value)
            } catch (err) {
              console.error('Error al cargar vistas manualmente:', err)
            }
          }
          
          // Si aún no tenemos vistas, mostrar error
          if (assignedViews.value.length === 0) {
            errorMessage.value = 'No hay vistas asignadas a este TV'
          }
        }
      } catch (err) {
        console.error('Error al cargar asignación para ' + tvId + ':', err)
        errorMessage.value = `No se encontró configuración para TV ${tvId}. Crea una en el panel de administración.`
        
        // Obtener vistas disponibles para mostrar en el fallback
        try {
          const views = await pb.collection('views').getFullList()
          console.log('Vistas disponibles para fallback:', views)
          
          // Fallback: usar vistas por defecto si no hay asignaciones
          assignedViews.value = ['vista_del_dia', 'carta', 'eventos'].filter(
            name => views.some(v => v.view_name === name)
          )
        } catch (viewsErr) {
          console.error('Error al obtener vistas para fallback:', viewsErr)
          assignedViews.value = []
        }
      }
    }

    const startRotation = async () => {
      try {
        // Obtener la configuración global
        const configRecord = await pb.collection('config').getFirstListItem('')
        console.log('Configuración cargada:', configRecord)
        const seconds = configRecord.rotacion_escena_segundos || 10
        console.log('Tiempo de rotación configurado:', seconds, 'segundos')

        // Rotamos cada "seconds" segundos
        rotationInterval.value = setInterval(() => {
          if (assignedViews.value.length) {
            currentIndex.value = (currentIndex.value + 1) % assignedViews.value.length
            console.log('Rotando a vista:', assignedViews.value[currentIndex.value])
          }
        }, seconds * 1000)
      } catch (err) {
        console.error('Error al leer config:', err)
        // Valor predeterminado si no hay configuración
        const seconds = 10
        console.log('Usando tiempo de rotación por defecto:', seconds, 'segundos')
        rotationInterval.value = setInterval(() => {
          if (assignedViews.value.length) {
            currentIndex.value = (currentIndex.value + 1) % assignedViews.value.length
            console.log('Rotando a vista:', assignedViews.value[currentIndex.value])
          }
        }, seconds * 1000)
      }
    }

    onMounted(async () => {
      // 1) Leer param :tvId de la ruta actual
      const tvId = route.params.tvId
      console.log('TV ID de la ruta:', tvId)
      
      // 2) Cargar la asignación
      await loadTvAssignment(tvId)
      
      // 3) Iniciar la rotación
      await startRotation()
    })

    onUnmounted(() => {
      // Limpiamos el interval al salir
      if (rotationInterval.value) {
        console.log('Limpiando intervalo de rotación')
        clearInterval(rotationInterval.value)
      }
    })

    return {
      route,
      assignedViews,
      currentIndex,
      currentViewName,
      currentViewComponent,
      errorMessage,
      viewMap
    }
  }
}
</script>

<style scoped>
.tv-screen {
  background-color: var(--background-dark);
  color: var(--text-light);
  min-height: 100vh;
}

.tv-header {
  background-color: var(--primary-color);
  border-bottom: 3px solid var(--secondary-color);
  padding: 15px;
  text-align: center;
}

.tv-header h1 {
  color: var(--secondary-color);
  font-weight: 700;
  letter-spacing: 2px;
}

.tv-content {
  padding: 20px;
}

.tv-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  text-align: center;
}

.error-message {
  margin-top: 20px;
  padding: 15px;
  background-color: rgba(220, 53, 69, 0.2);
  border: 1px solid var(--danger-color);
  border-radius: 5px;
  max-width: 80%;
}

.debug-info {
  margin-top: 40px;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  border: 1px solid #555;
  text-align: left;
  border-radius: 5px;
  font-family: monospace;
  width: 80%;
}

.debug-info h3 {
  margin-bottom: 15px;
  color: #fff;
}

.debug-info p {
  margin: 5px 0;
  font-size: 14px;
}
</style>