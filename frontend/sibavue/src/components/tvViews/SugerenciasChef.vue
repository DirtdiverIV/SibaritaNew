<template>
  <div class="sugerencias-chef">
    <h1>Sugerencias del Chef</h1>
    <div v-if="!sugerencias.length">No hay sugerencias</div>
    <div class="plato-destacado" v-for="p in sugerencias" :key="p.id">
      <img
        v-if="p.imagen"
        :src="pb.files.getUrl(p, 'imagen')"
        alt="Sugerencia"
        class="sugerencia-img"
      />
      <h2>{{ p.nombre }} - {{ p.price }}€</h2>
      <p>{{ p.descripcion }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import pb from '@/services/pocketbase.js'

export default {
  name: 'SugerenciasChef',
  setup() {
    const sugerencias = ref([])

    const loadSugerencias = async () => {
      try {
        sugerencias.value = await pb.collection('platos').getFullList({
          filter: 'categoria = "sugerencias"',
          sort: '-created'
        })
      } catch (error) {
        console.error('Error SugerenciasChef:', error)
      }
    }

    onMounted(() => {
      loadSugerencias()
    })

    return {
      sugerencias,
      pb
    }
  }
}
</script>

<style scoped>
.sugerencias-chef {
  text-align: center;
}
.sugerencia-img {
  width: 400px;
  margin: 0 auto;
}
</style>
