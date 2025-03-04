// src/components/admin/Forms/MenuDiaAdmin.vue
<template>
  <div>
    <h2>Administrar Menú del Día</h2>
    
    <!-- Menú del día actual -->
    <div v-if="menuDia">
      <h3>Menú actual: {{ menuDia.nombre }} - {{ menuDia.precio }}€</h3>
      
      <div>
        <h4>Primeros</h4>
        <ul>
          <li v-for="item in primeros" :key="item.id">
            {{ item.nombre }}
            <button @click="deletePlato('primeros', item.id)">Eliminar</button>
          </li>
        </ul>
      </div>
      
      <div>
        <h4>Segundos</h4>
        <ul>
          <li v-for="item in segundos" :key="item.id">
            {{ item.nombre }}
            <button @click="deletePlato('segundos', item.id)">Eliminar</button>
          </li>
        </ul>
      </div>
      
      <div>
        <h4>Postres</h4>
        <ul>
          <li v-for="item in postres" :key="item.id">
            {{ item.nombre }}
            <button @click="deletePlato('postres', item.id)">Eliminar</button>
          </li>
        </ul>
      </div>
      
      <button @click="deleteMenuDia(menuDia.id)">Eliminar menú completo</button>
    </div>
    <div v-else>
      <p>No hay menú del día definido.</p>
    </div>
    
    <!-- Formulario para crear nuevo menú del día -->
    <form @submit.prevent="createMenuDia">
      <h3>Crear Nuevo Menú del Día</h3>
      
      <div>
        <label>Nombre del menú</label>
        <input v-model="menuForm.nombre" type="text" required />
      </div>
      
      <div>
        <label>Precio</label>
        <input v-model.number="menuForm.precio" type="number" step="0.01" required />
      </div>
      
      <button type="submit">Crear Menú</button>
    </form>
    
    <!-- Formulario para añadir platos al menú -->
    <form v-if="menuDia" @submit.prevent="addPlato">
      <h3>Añadir Plato al Menú</h3>
      
      <div>
        <label>Tipo</label>
        <select v-model="platoForm.tipo" required>
          <option value="primeros">Primero</option>
          <option value="segundos">Segundo</option>
          <option value="postres">Postre</option>
        </select>
      </div>
      
      <div>
        <label>Nombre del plato</label>
        <input v-model="platoForm.nombre" type="text" required />
      </div>
      
      <div>
        <label>Descripción (opcional)</label>
        <textarea v-model="platoForm.descripcion"></textarea>
      </div>
      
      <button type="submit">Añadir Plato</button>
    </form>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import pb from '@/services/pocketbase.js'

export default {
  name: 'MenuDiaAdmin',
  setup() {
    // Estado
    const menuDia = ref(null)
    const primeros = ref([])
    const segundos = ref([])
    const postres = ref([])
    
    // Formulario para el menú
    const menuForm = reactive({
      nombre: '',
      precio: 0
    })
    
    // Formulario para los platos
    const platoForm = reactive({
      tipo: 'primeros',
      nombre: '',
      descripcion: ''
    })
    
    // Cargar el menú del día y sus platos
    const loadMenuDia = async () => {
      try {
        // Obtener el menú del día más reciente
        const menus = await pb.collection('menu_dia').getFullList({
          sort: '-created',
          limit: 1
        })
        
        if (menus.length > 0) {
          menuDia.value = menus[0]
          await loadPlatos(menuDia.value.id)
        } else {
          menuDia.value = null
          primeros.value = []
          segundos.value = []
          postres.value = []
        }
      } catch (err) {
        console.error('Error loading menu del dia:', err)
      }
    }
    
    // Cargar los platos asociados al menú
    const loadPlatos = async (menuId) => {
      try {
        // Cargar primeros
        primeros.value = await pb.collection('menu_dia_primeros').getFullList({
          filter: `field = "${menuId}"`,
          sort: 'created'
        })
        
        // Cargar segundos
        segundos.value = await pb.collection('menu_dia_segundos').getFullList({
          filter: `field = "${menuId}"`,
          sort: 'created'
        })
        
        // Cargar postres
        postres.value = await pb.collection('menu_dia_postres').getFullList({
          filter: `field = "${menuId}"`,
          sort: 'created'
        })
      } catch (err) {
        console.error('Error loading platos del menu:', err)
      }
    }
    
    // Crear un nuevo menú del día
    const createMenuDia = async () => {
      try {
        const data = {
          nombre: menuForm.nombre,
          precio: menuForm.precio
        }
        
        const newMenu = await pb.collection('menu_dia').create(data)
        
        // Reset formulario
        menuForm.nombre = ''
        menuForm.precio = 0
        
        await loadMenuDia() // Recargar
      } catch (err) {
        console.error('Error creating menu del dia:', err)
        alert('Error al crear menú: ' + err.message)
      }
    }
    
    // Añadir un plato al menú
    const addPlato = async () => {
      if (!menuDia.value) return
      
      // Determinar la colección correcta según el tipo
      let collectionName
      switch (platoForm.tipo) {
        case 'primeros':
          collectionName = 'menu_dia_primeros'
          break
        case 'segundos':
          collectionName = 'menu_dia_segundos'
          break
        case 'postres':
          collectionName = 'menu_dia_postres'
          break
        default:
          return
      }
      
      try {
        const data = {
          nombre: platoForm.nombre,
          descripcion: platoForm.descripcion,
          field: menuDia.value.id // Relación con el menú
        }
        
        await pb.collection(collectionName).create(data)
        
        // Reset formulario
        platoForm.nombre = ''
        platoForm.descripcion = ''
        
        await loadPlatos(menuDia.value.id) // Recargar platos
      } catch (err) {
        console.error(`Error adding plato to ${platoForm.tipo}:`, err)
        alert('Error al añadir plato: ' + err.message)
      }
    }
    
    // Eliminar un plato
    const deletePlato = async (tipo, id) => {
      if (!confirm('¿Seguro que deseas eliminar este plato?')) return
      
      // Determinar la colección correcta según el tipo
      let collectionName
      switch (tipo) {
        case 'primeros':
          collectionName = 'menu_dia_primeros'
          break
        case 'segundos':
          collectionName = 'menu_dia_segundos'
          break
        case 'postres':
          collectionName = 'menu_dia_postres'
          break
        default:
          return
      }
      
      try {
        await pb.collection(collectionName).delete(id)
        await loadPlatos(menuDia.value.id) // Recargar platos
      } catch (err) {
        console.error(`Error deleting plato from ${tipo}:`, err)
        alert('Error al eliminar plato: ' + err.message)
      }
    }
    
    // Eliminar el menú completo
    const deleteMenuDia = async (id) => {
      if (!confirm('¿Seguro que deseas eliminar este menú y todos sus platos?')) return
      
      try {
        // Primero eliminamos los platos asociados
        for (const p of primeros.value) {
          await pb.collection('menu_dia_primeros').delete(p.id)
        }
        
        for (const s of segundos.value) {
          await pb.collection('menu_dia_segundos').delete(s.id)
        }
        
        for (const po of postres.value) {
          await pb.collection('menu_dia_postres').delete(po.id)
        }
        
        // Luego eliminamos el menú
        await pb.collection('menu_dia').delete(id)
        
        await loadMenuDia() // Recargar
      } catch (err) {
        console.error('Error deleting menu del dia:', err)
        alert('Error al eliminar menú: ' + err.message)
      }
    }
    
    onMounted(() => {
      loadMenuDia()
    })
    
    return {
      menuDia,
      primeros,
      segundos,
      postres,
      menuForm,
      platoForm,
      createMenuDia,
      addPlato,
      deletePlato,
      deleteMenuDia
    }
  }
}
</script>

<style scoped>
form {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  margin-right: 5px;
  margin-top: 10px;
}

input, select, textarea {
  width: 100%;
  padding: 5px;
  margin: 5px 0;
}

label {
  display: block;
  margin-top: 10px;
}

ul {
  padding-left: 20px;
}

ul li {
  margin-bottom: 5px;
}
</style>