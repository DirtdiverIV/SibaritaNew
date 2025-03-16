<template>
  <div class="platos-admin">
    <div class="card">
      <div class="card-header">
        <p class="card-header-title">
          Gestión de Platos
        </p>
      </div>
      
      <div class="card-content">
        <!-- Botón para añadir plato y búsqueda -->
        <div class="columns">
          <div class="column is-4">
            <button 
              @click="showForm = true; isEdit = false; resetForm()"
              class="button is-primary is-fullwidth"
            >
              <span class="icon">
                <i class="fas fa-plus"></i>
              </span>
              <span>Añadir nuevo plato</span>
            </button>
          </div>
          <div class="column">
            <input 
              v-model="filter" 
              class="input" 
              type="text" 
              placeholder="Buscar plato..." 
            />
          </div>
        </div>

        <!-- Tabs de categorías -->
        <div class="tabs is-boxed">
          <ul>
            <li :class="{ 'is-active': selectedTab === 'todos' }">
              <a @click="selectedTab = 'todos'">Todos</a>
            </li>
            <li v-for="cat in categoriasAgrupadas" 
                :key="cat.id" 
                :class="{ 'is-active': selectedTab === cat.id }">
              <a @click="selectedTab = cat.id">{{ cat.nombre }}</a>
            </li>
          </ul>
        </div>
        
        <!-- Tabla de platos -->
        <div class="table-container">
          <table class="table is-fullwidth is-hoverable">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="plato in platosFiltrados" :key="plato.id">
                <td class="is-narrow">
                  <div class="plato-img-container">
                    <img 
                      v-if="plato.imagen" 
                      :src="pb.files.getUrl(plato, plato.imagen, { 'thumb': '100x100' })" 
                      alt="Plato" 
                      class="plato-img"
                    />
                    <span v-else class="no-image">No imagen</span>
                  </div>
                </td>
                <td>
                  <p class="plato-nombre">{{ plato.nombre }}</p>
                  <p class="plato-descripcion" v-if="plato.descripcion">
                    {{ truncateText(plato.descripcion, 50) }}
                  </p>
                </td>
                <td>
                  {{ plato.precio }}€
                  <span v-if="plato.precio_medio" class="precio-medio">
                    (Media: {{ plato.precio_medio }}€)
                  </span>
                </td>
                <td>{{ formatCategoria(plato.categoria) }}</td>
                <td class="is-narrow">
                  <div class="buttons are-small">
                    <button 
                      v-if="plato.categoria === 'carta'"
                      @click="toggleSugerencia(plato)"
                      class="button is-warning is-small"
                      :class="{'is-light': !plato.es_sugerencia}"
                      :title="plato.es_sugerencia ? 'Quitar de sugerencias' : 'Marcar como sugerencia'"
                    >
                      <span class="icon is-small">
                        <i class="fas fa-star"></i>
                      </span>
                    </button>
                    <button 
                      @click="editPlato(plato)"
                      class="button is-info is-small"
                    >
                      <span class="icon is-small">
                        <i class="fas fa-edit"></i>
                      </span>
                    </button>
                    <button 
                      @click="deletePlato(plato.id)"
                      class="button is-danger is-small"
                    >
                      <span class="icon is-small">
                        <i class="fas fa-trash"></i>
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="platosFiltrados.length === 0">
                <td colspan="5" class="has-text-centered">
                  No se encontraron platos{{ 
                    selectedTab !== 'todos' ? ` en la categoría ${formatCategoria(selectedTab)}` : '' 
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Modal de formulario -->
    <div class="modal" :class="{'is-active': showForm}">
      <div class="modal-background" @click="showForm = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ isEdit ? 'Editar plato' : 'Crear nuevo plato' }}</p>
          <button 
            @click="showForm = false" 
            class="delete" 
            aria-label="close"
          ></button>
        </header>
        
        <section class="modal-card-body">
          <!-- Formulario -->
          <form @submit.prevent="onSubmit">
            <div class="field">
              <label class="label">Nombre</label>
              <div class="control">
                <input 
                  v-model="form.nombre" 
                  class="input" 
                  type="text" 
                  placeholder="Nombre del plato"
                  required
                />
              </div>
            </div>
            
            <div class="columns">
              <div class="column">
                <div class="field">
                  <label class="label">Precio</label>
                  <div class="control">
                    <input 
                      v-model.number="form.precio" 
                      class="input" 
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div class="column">
                <div class="field">
                  <label class="label">Precio Medio (opcional)</label>
                  <div class="control">
                    <input 
                      v-model.number="form.precio_medio" 
                      class="input" 
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div class="field">
              <label class="label">Categoría</label>
              <div class="control">
                <div class="select is-fullwidth">
                  <select v-model="form.categoria" required>
                    <option value="" disabled>Selecciona una categoría</option>
                    <option v-for="cat in categoriasOptions" :key="cat" :value="cat">
                      {{ formatCategoria(cat) }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="field">
              <label class="label">Descripción</label>
              <div class="control">
                <textarea 
                  v-model="form.descripcion" 
                  class="textarea" 
                  placeholder="Descripción del plato"
                  rows="3"
                ></textarea>
              </div>
            </div>
            
            <div v-if="form.categoria === 'carta'" class="field">
              <div class="control">
                <label class="checkbox">
                  <input 
                    type="checkbox" 
                    v-model="form.es_sugerencia"
                  >
                  Marcar como sugerencia del chef
                </label>
              </div>
            </div>
            
            <div class="field">
              <label class="label">Imagen</label>
              <div class="file has-name">
                <label class="file-label">
                  <input 
                    class="file-input" 
                    type="file" 
                    ref="imagen"
                    @change="handleFileChange"
                    accept="image/*"
                  >
                  <span class="file-cta">
                    <span class="file-icon">
                      <i class="fas fa-upload"></i>
                    </span>
                    <span class="file-label">
                      Seleccionar imagen...
                    </span>
                  </span>
                  <span class="file-name">
                    {{ fileName || 'Ningún archivo seleccionado' }}
                  </span>
                </label>
              </div>
              
              <!-- Vista previa de la imagen -->
              <div v-if="previewImageUrl" class="field">
                <label class="label">Vista previa</label>
                <div class="image-preview">
                  <img :src="previewImageUrl" alt="Vista previa" />
                  <div class="image-caption">{{ isEdit ? 'Imagen actual' : 'Nueva imagen' }}</div>
                </div>
              </div>
            </div>
          </form>
        </section>
        
        <footer class="modal-card-foot">
          <button @click="onSubmit" class="button is-primary">
            {{ isEdit ? 'Guardar cambios' : 'Crear plato' }}
          </button>
          <button @click="showForm = false" class="button">Cancelar</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive, onMounted } from 'vue'
import pb from '@/services/pocketbase.js'

export default {
  name: 'PlatosAdmin',
  setup() {
    // Estado
    const platos = ref([])
    const isEdit = ref(false)
    const editId = ref(null)
    const imagen = ref(null)
    const showForm = ref(false)
    const fileName = ref('')
    const filter = ref('')
    const selectedTab = ref('todos')
    const previewImageUrl = ref('')
    
    // Categorías agrupadas
    const categoriasAgrupadas = [
      { id: 'carta', nombre: 'Carta' },
      { id: 'raciones', nombre: 'Raciones' },
      { id: 'tapas', nombre: 'Tapas' },
      { id: 'desayunos', nombre: 'Desayunos', subcategorias: [
        'desayuno_dulce',
        'desayuno_salado',
        'desayuno_cafes',
        'desayuno_infusiones',
        'desayuno_otros'
      ]},
      { id: 'sugerencias_chef', nombre: 'Sugerencias del Chef' }
    ]
    
    // Lista predefinida de categorías para el formulario
    const categoriasOptions = [
      'carta',
      'raciones',
      'tapas',
      'sugerencias_chef',
      'desayuno_dulce',
      'desayuno_salado',
      'desayuno_cafes',
      'desayuno_infusiones',
      'desayuno_otros'
    ]
    
    // Platos filtrados por búsqueda y categoría
    const platosFiltrados = computed(() => {
      return platos.value.filter(plato => {
        // Filtro por texto
        const matchesText = !filter.value || 
          plato.nombre.toLowerCase().includes(filter.value.toLowerCase()) ||
          (plato.descripcion && plato.descripcion.toLowerCase().includes(filter.value.toLowerCase()))
        
        // Filtro por categoría seleccionada
        let matchesCategoria = true
        if (selectedTab.value !== 'todos') {
          const categoriaSeleccionada = categoriasAgrupadas.find(cat => cat.id === selectedTab.value)
          if (categoriaSeleccionada && categoriaSeleccionada.subcategorias) {
            matchesCategoria = categoriaSeleccionada.subcategorias.includes(plato.categoria)
          } else {
            matchesCategoria = plato.categoria === selectedTab.value
          }
        }
        
        return matchesText && matchesCategoria
      })
    })
    
    // Formulario
    const form = reactive({
      nombre: '',
      precio: 0,
      precio_medio: 0,
      categoria: '',
      descripcion: '',
      es_sugerencia: false
    })
    
    // Cargar platos
    const loadPlatos = async () => {
      try {
        platos.value = await pb.collection('platos').getFullList({
          sort: 'categoria,nombre'
        })
      } catch (error) {
        console.error('Error al cargar platos:', error)
      }
    }
    
    // Manejar cambio de archivo
    const handleFileChange = () => {
      if (imagen.value && imagen.value.files.length > 0) {
        fileName.value = imagen.value.files[0].name
        // Crear URL para vista previa
        previewImageUrl.value = URL.createObjectURL(imagen.value.files[0])
      } else {
        fileName.value = ''
        previewImageUrl.value = ''
      }
    }
    
    // Actualizar vista previa de imagen
    const updatePreviewImage = (plato) => {
      if (plato && plato.imagen) {
        // Usar el ID del registro y el nombre del archivo
        previewImageUrl.value = pb.files.getUrl(plato, plato.imagen, { 'thumb': '100x100' })
      } else {
        previewImageUrl.value = ''
      }
    }
    
    // Editar plato
    const editPlato = (plato) => {
      isEdit.value = true
      editId.value = plato.id
      
      form.nombre = plato.nombre
      form.precio = plato.precio
      form.precio_medio = plato.precio_medio || 0
      form.categoria = plato.categoria
      form.descripcion = plato.descripcion || ''
      form.es_sugerencia = plato.es_sugerencia || false
      
      // Actualizar la vista previa de la imagen
      updatePreviewImage(plato)
      showForm.value = true
    }
    
    // Toggle sugerencia
    const toggleSugerencia = async (plato) => {
      try {
        await pb.collection('platos').update(plato.id, {
          es_sugerencia: !plato.es_sugerencia
        })
        await loadPlatos()
      } catch (error) {
        console.error('Error al actualizar sugerencia:', error)
        alert(`Error: ${error.message}`)
      }
    }
    
    // Crear o actualizar plato
    const onSubmit = async () => {
      try {
        const data = {
          nombre: form.nombre,
          precio: form.precio,
          precio_medio: form.precio_medio || null,
          categoria: form.categoria,
          descripcion: form.descripcion || '',
          es_sugerencia: form.es_sugerencia
        }
        
        // Imagen
        if (imagen.value && imagen.value.files.length > 0) {
          data.imagen = imagen.value.files[0]
        }
        
        if (isEdit.value && editId.value) {
          // Actualizar
          await pb.collection('platos').update(editId.value, data)
        } else {
          // Crear
          await pb.collection('platos').create(data)
        }
        
        // Cerrar modal y recargar
        showForm.value = false
        await loadPlatos()
      } catch (error) {
        console.error('Error al guardar plato:', error)
        alert(`Error: ${error.message}`)
      }
    }
    
    // Eliminar plato
    const deletePlato = async (id) => {
      if (!confirm('¿Estás seguro de eliminar este plato?')) return
      
      try {
        await pb.collection('platos').delete(id)
        await loadPlatos()
      } catch (error) {
        console.error('Error al eliminar plato:', error)
        alert(`Error: ${error.message}`)
      }
    }
    
    // Resetear formulario
    const resetForm = () => {
      form.nombre = ''
      form.precio = 0
      form.precio_medio = 0
      form.categoria = ''
      form.descripcion = ''
      form.es_sugerencia = false
      fileName.value = ''
      previewImageUrl.value = ''
      
      if (imagen.value) {
        imagen.value.value = null
      }
    }
    
    // Formatear nombre de categoría
    const formatCategoria = (categoria) => {
      if (!categoria) return '';
      
      // Reemplazar guiones por espacios y capitalizar
      return categoria
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    // Truncar texto largo
    const truncateText = (text, maxLength) => {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
    
    onMounted(() => {
      loadPlatos()
    })
    
    return {
      platos,
      platosFiltrados,
      form,
      isEdit,
      imagen,
      showForm,
      fileName,
      filter,
      selectedTab,
      categoriasAgrupadas,
      categoriasOptions,
      previewImageUrl,
      pb,
      editPlato,
      deletePlato,
      onSubmit,
      resetForm,
      formatCategoria,
      truncateText,
      handleFileChange,
      toggleSugerencia
    }
  }
}
</script>

<style scoped>
.platos-admin {
  margin-bottom: 2rem;
}

.tabs {
  margin-top: 1rem;
}

.plato-img-container {
  width: 50px;
  height: 50px;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.plato-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  font-size: 0.7rem;
  color: #a0a0a0;
  text-align: center;
}

.plato-nombre {
  font-weight: 600;
}

.plato-descripcion {
  font-size: 0.85rem;
  color: #a0a0a0;
  font-style: italic;
}

.precio-medio {
  display: block;
  font-size: 0.85rem;
  color: #a0a0a0;
  font-style: italic;
}

.image-preview {
  max-width: 200px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.image-caption {
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  font-size: 0.8rem;
  text-align: center;
  padding: 0.3rem;
}

/* Estilos para móvil */
@media screen and (max-width: 768px) {
  .table {
    font-size: 0.9rem;
  }
  
  .buttons.are-small {
    justify-content: center;
  }
  
  .modal-card {
    margin: 0 15px;
    max-height: calc(100vh - 30px);
  }
  
  .table-container {
    overflow-x: auto;
  }
}
</style>