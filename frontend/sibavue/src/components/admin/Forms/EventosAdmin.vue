<template>
  <div>
    <h2>Administrar Eventos</h2>
    <!-- Listado de eventos -->
    <ul>
      <li v-for="ev in eventos" :key="ev.id">
        <strong>{{ ev.titulo }}</strong> - Desde {{ ev.precio_desde }}€
        <br />
        <em>{{ ev.descripcion }}</em>
        <br />
        <button @click="editEvento(ev)">Editar</button>
        <button @click="deleteEvento(ev.id)">Eliminar</button>
        <hr />
      </li>
    </ul>

    <!-- Formulario de creación/edición -->
    <form @submit.prevent="onSubmit">
      <h3>{{ isEdit ? 'Editar' : 'Crear' }} Evento</h3>
      <div>
        <label>Título</label>
        <input v-model="form.titulo" type="text" required />
      </div>
      <div>
        <label>Descripción</label>
        <textarea v-model="form.descripcion"></textarea>
      </div>
      <div>
        <label>Precio desde</label>
        <input v-model.number="form.precio_desde" type="number" step="0.01" />
      </div>
      <div>
        <label>Imagen</label>
        <input type="file" ref="imagen" />
      </div>
      <!-- Si quisieras enlazar menús de evento, harías un multiselect aquí -->
      <button type="submit">{{ isEdit ? 'Guardar' : 'Crear' }}</button>
      <button v-if="isEdit" type="button" @click="resetForm">Cancelar</button>
    </form>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import pb from '@/services/pocketbase.js'

export default {
  name: 'EventosAdmin',
  setup() {
    const eventos = ref([])
    const isEdit = ref(false)
    const editId = ref(null)
    const imagen = ref(null)

    const form = reactive({
      titulo: '',
      descripcion: '',
      precio_desde: 0,
    })

    const loadEventos = async () => {
      try {
        eventos.value = await pb.collection('eventos').getFullList({
          sort: '-created'
        })
      } catch (err) {
        console.error('Error loading eventos:', err)
      }
    }

    const onSubmit = async () => {
      try {
        const data = {
          titulo: form.titulo,
          descripcion: form.descripcion,
          precio_desde: form.precio_desde
        }
        // Imagen
        if (imagen.value && imagen.value.files.length > 0) {
          data.imagen = imagen.value.files[0]
        }

        if (isEdit.value && editId.value) {
          // update
          await pb.collection('eventos').update(editId.value, data)
        } else {
          // create
          await pb.collection('eventos').create(data)
        }
        await loadEventos()
        resetForm()
      } catch (err) {
        console.error('Error saving evento:', err)
      }
    }

    const editEvento = (ev) => {
      isEdit.value = true
      editId.value = ev.id
      form.titulo = ev.titulo
      form.descripcion = ev.descripcion
      form.precio_desde = ev.precio_desde || 0
    }

    const deleteEvento = async (id) => {
      if (!confirm('¿Eliminar evento?')) return
      try {
        await pb.collection('eventos').delete(id)
        await loadEventos()
      } catch (err) {
        console.error('Error deleting evento:', err)
      }
    }

    const resetForm = () => {
      isEdit.value = false
      editId.value = null
      form.titulo = ''
      form.descripcion = ''
      form.precio_desde = 0
      if (imagen.value) {
        imagen.value.value = null
      }
    }

    onMounted(() => {
      loadEventos()
    })

    return {
      eventos,
      form,
      isEdit,
      imagen,
      onSubmit,
      editEvento,
      deleteEvento,
      resetForm
    }
  }
}
</script>
