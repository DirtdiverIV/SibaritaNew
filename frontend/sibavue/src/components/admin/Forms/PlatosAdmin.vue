<template>
    <div>
      <h2>Administrar Platos</h2>
  
      <!-- Listado de platos existentes -->
      <ul>
        <li v-for="plato in platos" :key="plato.id">
          <strong>{{ plato.nombre }}</strong> - {{ plato.precio }} €
          <span v-if="plato.precio_medio"> (Media: {{ plato.precio_medio }} €)</span>
          <br>
          Categoría: {{ plato.categoria }}
          <br>
          <em>{{ plato.descripcion }}</em>
          <br>
          <button @click="editPlato(plato)">Editar</button>
          <button @click="deletePlato(plato.id)">Eliminar</button>
          <hr>
        </li>
      </ul>
  
      <!-- Formulario de creación/edición -->
      <form @submit.prevent="onSubmit">
        <h3>{{ isEdit ? 'Editar plato' : 'Crear nuevo plato' }}</h3>
        <div>
          <label>Nombre</label>
          <input v-model="form.nombre" type="text" required />
        </div>
  
        <div>
          <label>Precio</label>
          <input v-model.number="form.precio" type="number" step="0.01" />
        </div>
  
        <div>
          <label>Precio Medio (opcional)</label>
          <input v-model.number="form.precio_medio" type="number" step="0.01" />
        </div>
  
        <div>
          <label>Categoría</label>
          <input v-model="form.categoria" type="text" placeholder="raciones, tapas, carta..." required />
        </div>
  
        <div>
          <label>Imagen (opcional)</label>
          <input type="file" ref="imagen" />
        </div>
  
        <div>
          <label>Descripción</label>
          <textarea v-model="form.descripcion" rows="3"></textarea>
        </div>
  
        <button type="submit">{{ isEdit ? 'Guardar cambios' : 'Crear plato' }}</button>
        <button v-if="isEdit" type="button" @click="resetForm">Cancelar edición</button>
      </form>
    </div>
  </template>
  
  <script>
  import { ref, reactive, onMounted } from 'vue'
  import pb from '@/services/pocketbase' // Asegúrate que apunte a tu archivo pocketbase.js
  
  export default {
    name: 'PlatosAdmin',
    setup() {
      // Lista de platos obtenidos de PB
      const platos = ref([])
      // Estado para saber si estamos editando un plato o creando uno nuevo
      const isEdit = ref(false)
      // Guardamos el ID del plato que se está editando
      const editId = ref(null)
      // Referencia al input "file" (imagen)
      const imagen = ref(null)
  
      // Datos del formulario
      const form = reactive({
        nombre: '',
        precio: 0,
        precio_medio: 0,
        categoria: '',
        descripcion: ''
      })
  
      // --- Cargar la lista de platos al montar el componente ---
      const loadPlatos = async () => {
        try {
          // getFullList -> te devuelve todos los registros (puedes pasar un tamaño).
          // Si tienes muchos platos, considera la paginación: getList()
          platos.value = await pb.collection('platos').getFullList({
            sort: '-created' // ordena del más reciente al más antiguo
          })
        } catch (error) {
          console.error('Error loading platos:', error)
        }
      }
  
      // --- Crear o actualizar plato ---
      const onSubmit = async () => {
        try {
          // Preparamos los datos para PocketBase (puede ser un objeto normal)
          const data = {
            nombre: form.nombre,
            precio: form.precio,
            precio_medio: form.precio_medio,
            categoria: form.categoria,
            descripcion: form.descripcion
          }
  
          // Si se ha seleccionado un archivo (imagen)
          if (imagen.value && imagen.value.files.length > 0) {
            data.imagen = imagen.value.files[0]
          }
  
          if (isEdit.value && editId.value) {
            // Actualizar
            await pb.collection('platos').update(editId.value, data)
          } else {
            // Crear registro nuevo
            await pb.collection('platos').create(data)
          }
  
          // Recargamos la lista
          await loadPlatos()
          resetForm()
        } catch (error) {
          console.error('Error saving plato:', error)
        }
      }
  
      // --- Botón "Editar" ---
      const editPlato = (plato) => {
        isEdit.value = true
        editId.value = plato.id
        // Volcamos los campos en form
        form.nombre = plato.nombre
        form.precio = plato.precio
        form.precio_medio = plato.precio_medio
        form.categoria = plato.categoria
        form.descripcion = plato.descripcion || ''
      }
  
      // --- Botón "Eliminar" ---
      const deletePlato = async (id) => {
        if (!confirm('¿Seguro que deseas eliminar este plato?')) return
  
        try {
          await pb.collection('platos').delete(id)
          // Volvemos a cargar la lista
          await loadPlatos()
        } catch (error) {
          console.error('Error deleting plato:', error)
        }
      }
  
      // --- Resetear formulario ---
      const resetForm = () => {
        isEdit.value = false
        editId.value = null
        form.nombre = ''
        form.precio = 0
        form.precio_medio = 0
        form.categoria = ''
        form.descripcion = ''
        // limpiar input file
        if (imagen.value) {
          imagen.value.value = null
        }
      }
  
      onMounted(() => {
        loadPlatos()
      })
  
      return {
        platos,
        form,
        isEdit,
        imagen,
        onSubmit,
        editPlato,
        deletePlato,
        resetForm
      }
    }
  }
  </script>
  
  <style scoped>
  /* Estilos mínimos, ajusta a tu gusto o usa shadcn para Vue */
  h2 {
    margin-top: 0;
  }
  ul {
    list-style: none;
    padding: 0;
  }
  form {
    margin-top: 1rem;
  }
  form > div {
    margin-bottom: 0.5rem;
  }
  button {
    margin-right: 0.5rem;
  }
  </style>
  