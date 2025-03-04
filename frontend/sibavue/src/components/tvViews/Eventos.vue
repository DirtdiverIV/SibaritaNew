<template>
  <div class="eventos-view">
    <div v-if="!eventos.length">No hay eventos</div>

    <div v-else>
      <div class="evento" v-for="(ev, index) in eventos" :key="ev.id">
        <img
          v-if="ev.imagen"
          :src="pb.files.getUrl(ev, 'imagen')"
          alt="Evento"
          class="img-evento"
        />
        <h2>{{ ev.titulo }}</h2>
        <p>{{ ev.descripcion }}</p>
        <p>Desde {{ ev.precio_desde }} €</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import pb from '@/services/pocketbase.js'

export default {
  name: 'Eventos',
  setup() {
    const eventos = ref([])

    const loadEventos = async () => {
      try {
        // Cargar todos los eventos
        eventos.value = await pb.collection('eventos').getFullList({
          sort: '-created'
        })
      } catch (err) {
        console.error('Error Eventos:', err)
      }
    }

    onMounted(() => {
      loadEventos()
    })

    return {
      eventos,
      pb // para usar pb.files.getUrl en el template
    }
  }
}
</script>

<style scoped>
.eventos-view {
  /* ajusta estilos */
}
.img-evento {
  max-width: 300px;
  display: block;
  margin: 1rem auto;
}
</style>
