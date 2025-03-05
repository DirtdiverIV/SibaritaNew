<template>
  <div class="tv-fullscreen">
    <!-- Contenido principal: ocupa todo el espacio disponible -->
    <div class="tv-content">
      <transition name="fade" mode="out-in">
        <component 
          :is="currentViewComponent" 
          v-if="currentViewComponent" 
          :key="currentViewName"
          class="fullheight-component"
        />
        <div v-else class="tv-loading">
          <div class="loading-content">
            <div class="loading-spinner">
              <div class="spinner-inner"></div>
            </div>
            <h2>Cargando contenido...</h2>
            <p>Vista actual: {{ currentViewName || 'ninguna' }}</p>
            <p>Componente: {{ currentViewComponent ? (currentViewComponent.name || 'Sin nombre') : 'No disponible' }}</p>
            <p>Total de vistas: {{ assignedViews.length }}</p>
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          </div>
        </div>
      </transition>
    </div>
    
    <!-- Barra de progreso minimalista en la parte inferior -->
    <div class="view-indicator" v-if="assignedViews.length > 0">
      <div class="progress-wrapper">
        <div 
          class="progress-bar"
          :style="{ width: progressBarWidth + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import pb from '@/services/pocketbase.js'

// Importamos los componentes de vistas
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
    const progressValue = ref(0)
    const rotationSeconds = ref(10) // Valor por defecto

    // Diccionario que asocia nombre de la vista (en BD) => componente Vue
    const viewMap = {
      vista_del_dia: VistaDelDia,
      carta: Carta,
      eventos: Eventos,
      sugerencias_chef: SugerenciasChef,
      menu_dia: MenuDia
    }
    
    // Añadir console.log para verificar los componentes
    console.log('Componentes disponibles:', Object.keys(viewMap));
    console.log('MenuDia component:', MenuDia);

    // Format view name for display
    const formatViewName = (viewName) => {
      if (!viewName) return '';
      
      // Replace underscores with spaces and capitalize each word
      return viewName
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    // Vista actual
    const currentViewName = computed(() => {
      if (!assignedViews.value.length) return null
      return assignedViews.value[currentIndex.value]
    })

    // Componente actual a mostrar
    const currentViewComponent = computed(() => {
      console.log('Calculando componente para:', currentViewName.value);
      if (!currentViewName.value) return null;
      
      // Añade este console.log para depurar
      console.log('¿Existe el componente?', viewMap[currentViewName.value] ? 'Sí' : 'No');
      
      return viewMap[currentViewName.value] || null;
      
      // Descomentar para forzar MenuDia durante depuración
      // return MenuDia;
    })

    // Ancho de la barra de progreso
    const progressBarWidth = computed(() => {
      return progressValue.value
    })

    // Progreso de la rotación
    const updateProgress = () => {
      // Actualizamos cada 100ms para que sea fluido
      const interval = 100
      const steps = rotationSeconds.value * 1000 / interval
      const increment = 100 / steps
      
      let progress = 0
      
      const progressInterval = setInterval(() => {
        progress += increment
        progressValue.value = Math.min(progress, 100)
        
        if (progress >= 100) {
          clearInterval(progressInterval)
        }
      }, interval)
      
      return progressInterval
    }

    // Progreso inicial
    let progressInterval = null

    // Cargar vistas disponibles (fallback)
    const loadAvailableViews = async () => {
      try {
        const views = await pb.collection('views').getFullList({
          sort: 'view_name'
        })
        return views.map(v => v.view_name)
      } catch (err) {
        console.error('Error al cargar vistas para fallback:', err)
        return []
      }
    }

    // Carga la configuración de tv_assignments para un tvId dado
    const loadTvAssignment = async (tvId) => {
      try {
        console.log('Cargando asignaciones para TV:', tvId)
        
        // Intentar obtener la asignación específica para este TV
        const record = await pb.collection('tv_assignments')
          .getFirstListItem(`tv_id = "${tvId}"`)
        
        console.log('Registro encontrado:', record)
        
        // Verificar si tiene expand.assigned_views
        if (record.expand && record.expand.assigned_views && record.expand.assigned_views.length > 0) {
          assignedViews.value = record.expand.assigned_views.map(v => v.view_name)
          console.log('Vistas asignadas (de expand):', assignedViews.value)
        } 
        // Verificar si tiene asignaciones directas
        else if (record.assigned_views && record.assigned_views.length > 0) {
          // Obtener las vistas asignadas
          try {
            const viewIds = Array.isArray(record.assigned_views) 
                          ? record.assigned_views 
                          : [record.assigned_views]
            
            // Obtener detalles de cada vista por ID
            const viewsPromises = viewIds.map(id => 
              pb.collection('views').getOne(id)
            )
            const views = await Promise.all(viewsPromises)
            assignedViews.value = views.map(v => v.view_name)
            console.log('Vistas asignadas (de IDs):', assignedViews.value)
          } catch (error) {
            console.error('Error al obtener vistas:', error)
            errorMessage.value = 'Error al cargar vistas asignadas'
            await useFallbackViews()
          }
        } else {
          // No hay vistas asignadas
          errorMessage.value = 'No hay vistas asignadas a este TV'
          await useFallbackViews()
        }
      } catch (err) {
        console.error('Error al cargar asignación:', err)
        errorMessage.value = `No se encontró configuración para TV ${tvId}`
        await useFallbackViews()
      }
    }

    // Usar vistas fallback si no hay asignaciones
    const useFallbackViews = async () => {
      console.log('Usando vistas fallback')
      
      // Intentar cargar vistas disponibles
      const availableViews = await loadAvailableViews()
      
      // Usar vistas disponibles o un conjunto predeterminado
      if (availableViews.length > 0) {
        assignedViews.value = availableViews
      } else {
        // Conjunto predeterminado
        assignedViews.value = ['vista_del_dia', 'carta', 'eventos']
            .filter(name => viewMap[name])
      }
      
      if (assignedViews.value.length === 0) {
        // Si aún no hay vistas, usar todas las disponibles en viewMap
        assignedViews.value = Object.keys(viewMap)
      }
      
      console.log('Vistas fallback asignadas:', assignedViews.value)
    }

    // Cargar configuración global
    const loadConfig = async () => {
      try {
        const configList = await pb.collection('config').getFullList({
          sort: '-created',
          limit: 1
        })
        
        if (configList.length > 0) {
          const configRecord = configList[0]
          rotationSeconds.value = configRecord.rotacion_escena_segundos || 20
        } else {
          rotationSeconds.value = 20 // Valor predeterminado
        }
        
        console.log('Tiempo de rotación configurado:', rotationSeconds.value, 'segundos')
      } catch (err) {
        console.error('Error al cargar configuración:', err)
        rotationSeconds.value = 20 // Valor predeterminado
        console.log('Usando tiempo predeterminado:', rotationSeconds.value, 'segundos')
      }
    }

    // Función para forzar vista inicial
    const forceInitialView = () => {
      if (assignedViews.value.length > 0) {
        console.log('Forzando vista inicial:', assignedViews.value[0]);
        currentIndex.value = 0;
        // Forzar actualización del componente
        nextTick(() => {
          console.log('Componente actual después de forzar:', currentViewComponent.value);
        });
      }
    }

    // Iniciar rotación
    const startRotation = () => {
      // Limpiar intervalo existente si hay
      if (rotationInterval.value) {
        clearInterval(rotationInterval.value)
      }
      
      // Iniciar progreso
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      progressValue.value = 0
      progressInterval = updateProgress()
      
      // Establecer intervalo de rotación
      rotationInterval.value = setInterval(() => {
        if (assignedViews.value.length) {
          // Avanzar al siguiente índice
          currentIndex.value = (currentIndex.value + 1) % assignedViews.value.length
          
          // Reiniciar progreso
          progressValue.value = 0
          if (progressInterval) {
            clearInterval(progressInterval)
          }
          progressInterval = updateProgress()
        }
      }, rotationSeconds.value * 1000)
    }

    // Observar cambios en rotationSeconds
    watch(rotationSeconds, () => {
      if (assignedViews.value.length > 0) {
        startRotation()
      }
    })

    onMounted(async () => {
      // 1) Leer param :tvId de la ruta actual
      const tvId = route.params.tvId
      
      // 2) Cargar la configuración global
      await loadConfig()
      
      // 3) Cargar la asignación de TV
      await loadTvAssignment(tvId)
      
      // Forzar vista inicial para depuración
      forceInitialView()
      
      // 4) Iniciar la rotación si hay vistas asignadas
      if (assignedViews.value.length > 0) {
        startRotation()
      }
    })

    onUnmounted(() => {
      // Limpiar intervalos al salir
      if (rotationInterval.value) {
        clearInterval(rotationInterval.value)
      }
      
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      
      // Salir de pantalla completa
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen()
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        }
      } catch (e) {
        console.log('No se pudo salir de pantalla completa:', e)
      }
    })

    return {
      route,
      assignedViews,
      currentIndex,
      currentViewName,
      currentViewComponent,
      errorMessage,
      viewMap,
      progressBarWidth,
      formatViewName
    }
  }
}
</script>

<style scoped>
.tv-fullscreen {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #242424;
  position: relative;
}

.tv-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* Clase para los componentes de vista */
.fullheight-component {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.tv-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  text-align: center;
}

.loading-content {
  padding: 2rem;
  background: rgba(18, 18, 18, 0.8);
  border-radius: 8px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 3px solid rgba(212, 175, 55, 0.3);
  border-top-color: #d4af37;
  animation: spin 1.5s linear infinite;
  margin: 0 auto 1.5rem;
}

.spinner-inner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid rgba(212, 175, 55, 0.6);
  border-top-color: transparent;
  animation: spin 2s linear infinite reverse;
  margin: 5px auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: rgba(220, 53, 69, 0.2);
  border: 1px solid rgba(220, 53, 69, 0.5);
  border-radius: 4px;
  color: #f8d7da;
  max-width: 80%;
}

/* View Indicator simplificado */
.view-indicator {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: transparent;
  padding: 0;
  z-index: 10;
}

.progress-wrapper {
  height: 4px;
  background-color: rgba(212, 175, 55, 0.1);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(to right, #b08b29, #d4af37);
  transition: width 0.1s linear;
}

/* Transition effects */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media screen and (max-width: 768px) {
  .restaurant-logo {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
    left: 15px;
  }
  
  .restaurant-name {
    font-size: 1.5rem;
  }
}
</style>