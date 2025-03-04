<template>
  <div class="carta-view">
    <h1>Carta</h1>
    <div class="plato" v-for="p in carta" :key="p.id">
      <img
        v-if="p.imagen"
        :src="pb.files.getUrl(p, 'imagen')"
        alt="plato"
        class="plato-img"
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
  name: 'Carta',
  setup() {
    const carta = ref([])

    const loadCarta = async () => {
      try {
        carta.value = await pb.collection('platos').getFullList({
          filter: 'categoria = "carta"',
          sort: '-created'
        })
      } catch (err) {
        console.error('Error Carta:', err)
      }
    }

    onMounted(() => {
      loadCarta()
    })

    return {
      carta,
      pb
    }
  }
}
</script>

<style scoped>
.carta-view {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.plato {
  border: 1px solid #ccc;
  margin: 1rem;
  padding: 1rem;
  width: 300px;
}
.plato-img {
  width: 100%;
  height: auto;
}
</style>
