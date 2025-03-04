<template>
    <div class="vista-del-dia">
      <section class="raciones">
        <h1>Raciones</h1>
        <ul>
          <li v-for="item in raciones" :key="item.id">
            {{ item.nombre }} - {{ item.precio }} €
            <span v-if="item.precio_medio"> (Media: {{ item.precio_medio }}€)</span>
          </li>
        </ul>
      </section>
  
      <section class="tapas">
        <h1>Tapas</h1>
        <ul>
          <li v-for="item in tapas" :key="item.id">
            {{ item.nombre }} - {{ item.precio }} €
          </li>
        </ul>
      </section>
  
      <section class="menu-del-dia">
        <h1>Menú del Día</h1>
        <div v-if="menuDia">
          <p>Nombre: {{ menuDia.nombre }}</p>
          <p>Precio: {{ menuDia.precio }} €</p>
          <!-- Si usas subcolecciones (primeros, segundos), podrías mostrarlo aquí -->
        </div>
        <div v-else>
          <p>No hay menú del día definido.</p>
        </div>
      </section>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue'
  import pb from '@/services/pocketbase.js'
  
  export default {
    name: 'VistaDelDia',
    setup() {
      const raciones = ref([])
      const tapas = ref([])
      const menuDia = ref(null)
  
      const loadData = async () => {
        try {
          // Obtener raciones
          raciones.value = await pb.collection('platos').getFullList({
            filter: 'categoria = "raciones"'
          })
          // Obtener tapas
          tapas.value = await pb.collection('platos').getFullList({
            filter: 'categoria = "tapas"'
          })
          // Obtener menú del día (ej: primero o getFullList(1) si solo tienes uno)
          // Ajusta si usas un criterio de "activo".
          const lista = await pb.collection('menu_dia').getFullList({
            sort: '-created', // el más reciente
            limit: 1
          })
          if (lista.length) {
            menuDia.value = lista[0]
          }
        } catch (err) {
          console.error('Error VistaDelDia:', err)
        }
      }
  
      onMounted(() => {
        loadData()
      })
  
      return {
        raciones,
        tapas,
        menuDia
      }
    }
  }
  </script>
  
  <style scoped>
  .vista-del-dia {
    /* Ajusta estilos a tu gusto */
    display: flex;
    gap: 2rem;
    /* etc... */
  }
  </style>
  