<template>
  <div>
    <h2>Asignar Vistas a TVs</h2>
    <ul>
      <li v-for="tv in tvs" :key="tv.id">
        <strong>{{ tv.tv_id }}</strong>: 
        <!-- mostramos las vistas asignadas -->
        <span v-for="v in tv.expand.field" :key="v.id">
          {{ v.view_name }}
        </span>
        <br>
        <button @click="editTv(tv)">Editar</button>
      </li>
    </ul>

    <!-- Formulario para crear/editar un tv_assignments -->
    <form @submit.prevent="onSubmit">
      <label>TV ID</label>
      <input v-model="form.tv_id" type="text" required />
      
      <label>Vistas Asignadas</label>
      <!-- multi-select manual o un plugin. Aquí un input normal, se complicaría un poco. -->
      <select multiple v-model="form.assigned_views">
        <option
          v-for="v in allViews"
          :key="v.id"
          :value="v.id"
        >
          {{ v.view_name }}
        </option>
      </select>

      <button type="submit">{{ isEdit ? 'Guardar' : 'Crear' }}</button>
      <button v-if="isEdit" type="button" @click="resetForm">Cancelar</button>
    </form>

  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import pb from '@/services/pocketbase.js'

export default {
  name: 'TvAssignmentsAdmin',
  setup() {
    const tvs = ref([])
    const allViews = ref([])
    const isEdit = ref(false)
    const editId = ref(null)

    const form = reactive({
      tv_id: '',
      assigned_views: []  // array de IDs
    })

    const loadTvs = async () => {
      try {
        // expand para traer data de la relation (views)
        tvs.value = await pb.collection('tv_assignments').getFullList({
          expand: 'field', // en tu schema, el campo relation se llama "field" (o "assigned_views")
          sort: '-created'
        })
      } catch (err) {
        console.error('Error loadTvs:', err)
      }
    }

    const loadViews = async () => {
      try {
        // todas las vistas
        allViews.value = await pb.collection('views').getFullList()
      } catch (err) {
        console.error('Error loadViews:', err)
      }
    }

    const editTv = (tv) => {
      isEdit.value = true
      editId.value = tv.id
      form.tv_id = tv.tv_id
      // assigned_views es un array de IDs. tv.expand.field es la data expandida.
      // hay que convertirlo a array de IDs
      form.assigned_views = tv.expand.field?.map(v => v.id) || []
    }

    const onSubmit = async () => {
      try {
        const data = {
          tv_id: form.tv_id,
          field: form.assigned_views // en tu schema, supongo se llama "field" o "assigned_views"
        }
        if (isEdit.value && editId.value) {
          await pb.collection('tv_assignments').update(editId.value, data)
        } else {
          await pb.collection('tv_assignments').create(data)
        }
        await loadTvs()
        resetForm()
      } catch (err) {
        console.error('Error saving tv_assignments:', err)
      }
    }

    const resetForm = () => {
      isEdit.value = false
      editId.value = null
      form.tv_id = ''
      form.assigned_views = []
    }

    onMounted(() => {
      loadTvs()
      loadViews()
    })

    return {
      tvs,
      allViews,
      form,
      isEdit,
      onSubmit,
      editTv,
      resetForm
    }
  }
}
</script>
