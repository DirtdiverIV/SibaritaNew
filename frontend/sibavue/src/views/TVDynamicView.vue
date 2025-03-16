<template>
  <div class="tv-fullscreen">
    <div class="background-pattern"></div>
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
  components: {
    VistaDelDia,
    MenuDia,
    Carta,
    Eventos
  },
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

      // 5) Activar modo pantalla completa
      const element = document.documentElement
      if (element.requestFullscreen) {
        element.requestFullscreen()
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen()
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen()
      }

      // Agregar clases para modo TV
      document.documentElement.classList.add('tv-mode');
      document.body.classList.add('tv-mode');
      document.getElementById('app').classList.add('tv-mode');
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
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }

      // Remover clases al desmontar
      document.documentElement.classList.remove('tv-mode');
      document.body.classList.remove('tv-mode');
      document.getElementById('app').classList.remove('tv-mode');
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
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif !important;
}

.background-pattern {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background-color: rgba(25, 25, 25, 0.95);
  background-image: 
    linear-gradient(135deg, 
      rgba(25, 25, 25, 0.92) 0%, 
      rgba(35, 35, 35, 0.95) 50%, 
      rgba(25, 25, 25, 0.92) 100%),
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><defs><linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23d4af37" stop-opacity="0.3"/><stop offset="100%" stop-color="%23b08b29" stop-opacity="0.25"/></linearGradient><pattern id="smallGrid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M12.5,0 L12.5,25 M0,12.5 L25,12.5" stroke="%23d4af37" stroke-width="0.5" stroke-opacity="0.2"/></pattern></defs><rect width="100" height="100" fill="%23222" fill-opacity="0.7"/><rect width="100" height="100" fill="url(%23smallGrid)"/><path d="M50,0 L100,50 L50,100 L0,50 Z" fill="%23282828" fill-opacity="0.4"/><path d="M50,0 L100,50 L50,100 L0,50 Z" fill="url(%23goldGrad)" transform="rotate(45 50 50)"/><path d="M25,25 h50 v50 h-50 Z" fill="none" stroke="%23d4af37" stroke-width="1" stroke-opacity="0.3"/><path d="M40,40 L60,40 L60,60 L40,60 Z" fill="url(%23goldGrad)"/><path d="M0,0 Q25,25 50,0 T100,0 M0,50 Q25,75 50,50 T100,50 M0,100 Q25,125 50,100 T100,100" stroke="%23d4af37" stroke-width="1" stroke-opacity="0.2" fill="none"/><circle cx="50" cy="50" r="8" fill="%23d4af37" fill-opacity="0.2"/><path d="M50,42 L58,50 L50,58 L42,50 Z" fill="%23d4af37" fill-opacity="0.3"/></svg>');
  background-size: 100px 100px;
  background-position: center center;
  background-blend-mode: overlay;
  opacity: 1;
  pointer-events: none;
}

.tv-content {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.3);
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif !important;
}

/* Clase para los componentes de vista */
.fullheight-component {
  flex: 1;
  position: relative;
  z-index: 2;
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif !important;
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
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif;
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
  transition: opacity 0.3s ease;
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

.tv-name {
  font-weight: 600;
  font-size: 1.2rem;
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif;
}
</style>