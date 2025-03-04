<template>
  <div class="menu-dia">
    <h1>Menú del Día</h1>
    <div v-if="menuDia">
      <p><strong>{{ menuDia.nombre }}</strong> - {{ menuDia.precio }} €</p>

      <h2>Primeros</h2>
      <ul>
        <li v-for="p in primeros" :key="p.id">{{ p.nombre }}</li>
      </ul>

      <h2>Segundos</h2>
      <ul>
        <li v-for="s in segundos" :key="s.id">{{ s.nombre }}</li>
      </ul>

      <h2>Postres</h2>
      <ul>
        <li v-for="po in postres" :key="po.id">{{ po.nombre }}</li>
      </ul>

    </div>
    <div v-else>
      <p>No hay Menú del Día definido.</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import pb from '@/services/pocketbase.js'

export default {
  name: 'MenuDia',
  setup() {
    const menuDia = ref(null)
    const primeros = ref([])
    const segundos = ref([])
    const postres = ref([])

    const loadMenuDia = async () => {
      try {
        // 1) Obtener el menu_dia principal
        const lista = await pb.collection('menu_dia').getFullList({ sort: '-created', limit: 1 })
        if (!lista.length) return
        menuDia.value = lista[0]

        // 2) Cargar subcolecciones si usas ese enfoque. 
        // Ej. menu_dia_primeros con field= la ID del menu_dia
        const id = menuDia.value.id
        primeros.value = await pb.collection('menu_dia_primeros').getFullList({
          filter: `field = "${id}"`
        })
        segundos.value = await pb.collection('menu_dia_segundos').getFullList({
          filter: `field = "${id}"`
        })
        postres.value = await pb.collection('menu_dia_postres').getFullList({
          filter: `field = "${id}"`
        })
      } catch (err) {
        console.error('Error MenuDia:', err)
      }
    }

    onMounted(() => {
      loadMenuDia()
    })

    return {
      menuDia,
      primeros,
      segundos,
      postres
    }
  }
}
</script>

<style scoped>
/* Ajusta estilos a tu gusto */
.menu-dia {
  text-align: center;
}
</style>
