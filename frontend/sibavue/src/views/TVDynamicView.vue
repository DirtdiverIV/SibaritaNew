<template>
  <div>
    <!-- Muestra el componente actual (ej. VistaDelDia, Carta...) -->
    <component :is="currentViewComponent" />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'        // <-- Para leer params de la ruta
import pb from '@/services/pocketbase.js'

// Importa tus componentes reales
import VistaDelDia from '@/components/tvViews/VistaDelDia.vue'
import Carta from '@/components/tvViews/Carta.vue'
import Eventos from '@/components/tvViews/Eventos.vue'
import Sugerencias from '@/components/tvViews/SugerenciasChef.vue'

export default {
  name: 'TVDynamicView',
  setup() {
    const route = useRoute()      // <-- Hook para acceder a route.params
    const assignedViews = ref([])
    const currentIndex = ref(0)
    const rotationInterval = ref(null)

    // Diccionario que asocia nombre de la vista (en BD) => componente Vue
    const viewMap = {
      vista_del_dia: VistaDelDia,
      carta: Carta,
      eventos: Eventos,
      sugerencias_chef: Sugerencias
      // ... Agrega más si tienes otras vistas
    }

    const currentViewName = computed(() => {
      if (!assignedViews.value.length) return null
      return assignedViews.value[currentIndex.value] // p.ej "vista_del_dia"
    })

    const currentViewComponent = computed(() => {
      if (!currentViewName.value) return null
      return viewMap[currentViewName.value] || null
    })

    // Carga la configuración de tv_assignments para un tvId dado
    const loadTvAssignment = async (tvId) => {
      try {
        // OJO: Fíjate en los espacios: "tv_id = \"tvId\""
        const record = await pb.collection('tv_assignments')
          .getFirstListItem(`tv_id = "${tvId}"`, { expand: 'assigned_views' })

        // Asumiendo el campo relation se llama assigned_views (y no "field")
        assignedViews.value = record.expand.assigned_views?.map(v => v.view_name) || []
      } catch (err) {
        console.error('No se encontró la asignación para ' + tvId, err)
        assignedViews.value = []
      }
    }

    const startRotation = async () => {
      try {
        // Obtenemos la config global (ej. rotacion_escena_segundos)
        const configRecord = await pb.collection('config').getFirstListItem('')
        const seconds = configRecord.rotacion_escena_segundos || 10

        // Rotamos cada "seconds" segundos
        rotationInterval.value = setInterval(() => {
          if (assignedViews.value.length) {
            currentIndex.value = (currentIndex.value + 1) % assignedViews.value.length
          }
        }, seconds * 1000)
      } catch (err) {
        console.error('Error al leer config:', err)
      }
    }

    onMounted(async () => {
      // 1) Leer param :tvId de la ruta actual (por ejemplo /tv/tv1 => tvId= "tv1")
      const tvId = route.params.tvId
      // 2) Cargar la asignación en tv_assignments
      await loadTvAssignment(tvId)
      // 3) Iniciar la rotación de vistas
      await startRotation()
    })

    onUnmounted(() => {
      // Limpiamos el interval al salir
      if (rotationInterval.value) clearInterval(rotationInterval.value)
    })

    return {
      assignedViews,
      currentIndex,
      currentViewComponent
    }
  }
}
</script>

<style>
/* Ajusta estilos para pantalla completa si quieres */
</style>
