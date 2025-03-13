<template>
  <div class="eventos-admin">
    <div class="card mb-5">
      <div class="card-header">
        <p class="card-header-title">
          Administrar Eventos
        </p>
        <div class="card-header-icon">
          <button class="button is-primary is-small" @click="showForm = true; isEdit = false; resetForm()">
            <span class="icon is-small">
              <i class="fas fa-plus"></i>
            </span>
            <span>Crear evento</span>
          </button>
        </div>
      </div>
      
      <div class="card-content">
        <!-- Lista de eventos -->
        <div v-if="eventos.length === 0" class="notification is-light is-warning">
          <p>No hay eventos configurados. Crea un nuevo evento usando el botón superior.</p>
        </div>
        
        <div v-else class="eventos-grid">
          <div v-for="evento in eventos" :key="evento.id" class="evento-card">
            <div class="evento-header">
              <h3 class="evento-title">{{ evento.titulo }}</h3>
              <div class="evento-precio">Desde {{ evento.precio_desde }}€</div>
            </div>
            
            <div class="evento-content">
              <div class="columns">
                <div class="column is-4 evento-imagen-container">
                  <div v-if="evento.imagen" class="evento-imagen">
                    <img :src="pb.files.getUrl(evento, evento.imagen, { 'thumb': '100x100' })" alt="Evento" />
                  </div>
                  <div v-else class="evento-imagen evento-imagen-placeholder">
                    <span class="placeholder-icon">🖼️</span>
                  </div>
                </div>
                
                <div class="column">
                  <div class="evento-descripcion">
                    <p>{{ evento.descripcion || 'Sin descripción' }}</p>
                  </div>
                  
                  <div class="evento-actions">
                    <button @click="editEvento(evento)" class="button is-info is-small">
                      <span class="icon is-small">
                        <i class="fas fa-edit"></i>
                      </span>
                      <span>Editar</span>
                    </button>
                    
                    <button @click="deleteEvento(evento.id)" class="button is-danger is-small">
                      <span class="icon is-small">
                        <i class="fas fa-trash"></i>
                      </span>
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de formulario para crear/editar evento -->
    <div class="modal" :class="{'is-active': showForm}">
      <div class="modal-background" @click="showForm = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ isEdit ? 'Editar' : 'Crear' }} Evento</p>
          <button @click="showForm = false" class="delete" aria-label="close"></button>
        </header>
        
        <section class="modal-card-body">
          <form @submit.prevent="onSubmit">
            <div class="field">
              <label class="label">Título</label>
              <div class="control">
                <input 
                  v-model="form.titulo" 
                  type="text" 
                  class="input"
                  placeholder="Nombre del evento"
                  required 
                />
              </div>
            </div>
            
            <div class="field">
              <label class="label">Descripción</label>
              <div class="control">
                <textarea 
                  v-model="form.descripcion" 
                  class="textarea"
                  placeholder="Descripción del evento"
                  rows="4"
                ></textarea>
              </div>
            </div>
            
            <div class="field">
              <label class="label">Precio desde (€)</label>
              <div class="control">
                <input 
                  v-model.number="form.precio_desde" 
                  type="number" 
                  class="input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            
            <div class="field">
              <label class="label">Imagen</label>
              <div class="file has-name is-fullwidth">
                <label class="file-label">
                  <input type="file" class="file-input" ref="imagen" @change="handleFileChange">
                  <span class="file-cta">
                    <span class="file-icon">
                      <i class="fas fa-upload"></i>
                    </span>
                    <span class="file-label">
                      Elegir archivo
                    </span>
                  </span>
                  <span class="file-name">
                    {{ selectedFileName || 'Ningún archivo seleccionado' }}
                  </span>
                </label>
              </div>
            </div>
            
            <!-- Vista previa de la imagen -->
            <div v-if="previewImageUrl" class="field">
              <label class="label">Vista previa</label>
              <div class="imagen-preview">
                <img :src="previewImageUrl" alt="Vista previa">
                <div class="image-caption">{{ isEdit ? 'Imagen actual' : 'Nueva imagen' }}</div>
              </div>
            </div>
          </form>
        </section>
        
        <footer class="modal-card-foot">
          <button class="button is-primary" @click="onSubmit">
            {{ isEdit ? 'Guardar cambios' : 'Crear evento' }}
          </button>
          <button class="button" @click="showForm = false">Cancelar</button>
        </footer>
      </div>
    </div>
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
    const showForm = ref(false)
    const selectedFileName = ref('')
    const previewImageUrl = ref('')

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

    const handleFileChange = () => {
      if (imagen.value && imagen.value.files.length > 0) {
        selectedFileName.value = imagen.value.files[0].name
        // Crear URL para vista previa
        previewImageUrl.value = URL.createObjectURL(imagen.value.files[0])
      } else {
        selectedFileName.value = ''
        previewImageUrl.value = ''
      }
    }

    const updatePreviewImage = (evento) => {
      if (evento && evento.imagen) {
        previewImageUrl.value = pb.files.getUrl(evento, evento.imagen, { 'thumb': '100x100' })
      } else {
        previewImageUrl.value = ''
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
          // Actualizar
          await pb.collection('eventos').update(editId.value, data)
        } else {
          // Crear
          await pb.collection('eventos').create(data)
        }
        
        await loadEventos()
        resetForm()
        showForm.value = false
      } catch (err) {
        console.error('Error saving evento:', err)
        alert('Error al guardar: ' + err.message)
      }
    }

    const editEvento = (ev) => {
      isEdit.value = true
      editId.value = ev.id
      form.titulo = ev.titulo
      form.descripcion = ev.descripcion || ''
      form.precio_desde = ev.precio_desde || 0
      
      updatePreviewImage(ev)
      showForm.value = true
    }

    const deleteEvento = async (id) => {
      if (!confirm('¿Estás seguro de eliminar este evento?')) return
      
      try {
        await pb.collection('eventos').delete(id)
        await loadEventos()
      } catch (err) {
        console.error('Error deleting evento:', err)
        alert('Error al eliminar: ' + err.message)
      }
    }

    const resetForm = () => {
      isEdit.value = false
      editId.value = null
      form.titulo = ''
      form.descripcion = ''
      form.precio_desde = 0
      selectedFileName.value = ''
      previewImageUrl.value = ''
      
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
      showForm,
      selectedFileName,
      previewImageUrl,
      pb,
      onSubmit,
      editEvento,
      deleteEvento,
      resetForm,
      handleFileChange
    }
  }
}
</script>

<style scoped>
.eventos-admin {
  max-width: 1000px;
  margin: 0 auto;
}

.eventos-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.evento-card {
  background-color: rgba(30, 30, 30, 0.7);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 55, 0.2);
  transition: all 0.3s ease;
}

.evento-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  border-color: rgba(212, 175, 55, 0.5);
}

.evento-header {
  background-color: rgba(18, 18, 18, 0.8);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
}

.evento-title {
  color: #d4af37;
  font-weight: 600;
  font-size: 1.3rem;
  margin: 0;
}

.evento-precio {
  background-color: #d4af37;
  color: #121212;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.9rem;
}

.evento-content {
  padding: 1rem;
}

.evento-imagen-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.evento-imagen {
  width: 100%;
  height: 150px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.evento-imagen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.evento-imagen-placeholder {
  background-color: rgba(18, 18, 18, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 2.5rem;
  opacity: 0.3;
}

.evento-descripcion {
  margin-bottom: 1rem;
  color: #e0e0e0;
  min-height: 80px;
}

.evento-actions {
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
}

.imagen-preview {
  margin-top: 0.5rem;
  max-width: 200px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.imagen-preview img {
  width: 100%;
  display: block;
}

.image-caption {
  text-align: center;
  font-size: 0.8rem;
  color: #e0e0e0;
  margin-top: 0.2rem;
}

.modal-card {
  width: 80%;
  max-width: 600px;
}

.modal-card-head,
.modal-card-foot {
  background-color: rgba(18, 18, 18, 0.8);
  border-color: rgba(212, 175, 55, 0.3);
}

.modal-card-title {
  color: #d4af37;
}

.modal-card-body {
  background-color: rgba(30, 30, 30, 0.9);
  color: #e0e0e0;
}

.label {
  color: #e0e0e0;
}

.input,
.textarea,
.file-cta,
.file-name {
  background-color: rgba(18, 18, 18, 0.5);
  border-color: rgba(80, 80, 80, 0.3);
  color: #e0e0e0;
}

.input:focus,
.textarea:focus {
  border-color: #d4af37;
  box-shadow: 0 0 0 0.125em rgba(212, 175, 55, 0.25);
}

@media screen and (max-width: 768px) {
  .evento-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .evento-precio {
    margin-top: 0.5rem;
  }
  
  .evento-imagen {
    height: 120px;
    margin-bottom: 1rem;
  }
  
  .evento-actions {
    justify-content: center;
  }
  
  .modal-card {
    width: 95%;
  }
}
</style>