<template>
  <div class="almuerzos-admin">
    <div class="card mb-5">
      <div class="card-header">
        <p class="card-header-title">
          <span class="icon"><i class="fas fa-coffee"></i></span>
          <span>Almuerzos</span>
        </p>
        <div class="card-header-icon">
          <button class="button is-primary is-small" @click="showForm = true; isEdit = false; resetForm()">
            <span class="icon is-small">
              <i class="fas fa-plus"></i>
            </span>
            <span>Crear almuerzo</span>
          </button>
        </div>
      </div>
      
      <div class="card-content">
        <div v-if="loading" class="has-text-centered my-5">
          <div class="loading-spinner"></div>
          <p class="mt-3">Cargando almuerzos...</p>
        </div>
        
        <div v-else-if="almuerzos.length > 0" class="almuerzos-grid">
          <div v-for="almuerzo in almuerzos" :key="almuerzo.id" class="almuerzo-card">
            <div class="almuerzo-header">
              <h3 class="almuerzo-title">{{ almuerzo.nombre }}</h3>
              <p class="almuerzo-price">{{ almuerzo.precio }}€</p>
            </div>
            
            <div class="almuerzo-content">
              <img v-if="almuerzo.imagen" :src="getImageUrl(almuerzo)" :alt="almuerzo.nombre" class="almuerzo-image">
              
              <div class="almuerzo-items">
                <div v-for="item in getAlmuerzoItems(almuerzo.id)" :key="item.id" class="almuerzo-item">
                  <div class="item-info">
                    <p class="item-name">{{ item.nombre }}</p>
                    <p v-if="item.descripcion" class="item-description">{{ item.descripcion }}</p>
                  </div>
                  <div class="item-actions">
                    <button @click="editItem(item)" class="edit-item">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="deleteItem(item.id)" class="delete-item">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
                <div v-if="!getAlmuerzoItems(almuerzo.id).length" class="empty-items">
                  <p>No hay items añadidos</p>
                </div>
              </div>
            </div>
            
            <div class="almuerzo-actions">
              <button @click="addItem(almuerzo.id)" class="button is-info is-small">
                <span class="icon is-small">
                  <i class="fas fa-plus"></i>
                </span>
                <span>Añadir ítem</span>
              </button>
              <button @click="editAlmuerzo(almuerzo)" class="button is-warning is-small">
                <span class="icon is-small">
                  <i class="fas fa-edit"></i>
                </span>
                <span>Editar</span>
              </button>
              <button @click="deleteAlmuerzo(almuerzo.id)" class="button is-danger is-small">
                <span class="icon is-small">
                  <i class="fas fa-trash"></i>
                </span>
              </button>
            </div>
          </div>
        </div>
        
        <div v-else class="notification is-warning is-light">
          <p>No hay almuerzos configurados. Crea un nuevo almuerzo usando el botón superior.</p>
        </div>
      </div>
    </div>

    <!-- Modal para crear/editar almuerzo -->
    <div class="modal" :class="{'is-active': showForm}">
      <div class="modal-background" @click="showForm = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ isEdit ? 'Editar' : 'Crear' }} Almuerzo</p>
        </header>
        
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Nombre</label>
            <div class="control">
              <input 
                v-model="almuerzoForm.nombre" 
                class="input" 
                type="text" 
                required
                placeholder="Ej: Petisco"
              >
            </div>
          </div>
          
          <div class="field">
            <label class="label">Precio (€)</label>
            <div class="control">
              <input 
                v-model.number="almuerzoForm.precio" 
                class="input" 
                type="number" 
                step="0.01"
                min="0"
                required
                placeholder="Ej: 3.70"
              >
            </div>
          </div>
          
          <div class="field">
            <label class="label">Imagen</label>
            <div class="file has-name">
              <label class="file-label">
                <input class="file-input" type="file" @change="onFileChange" accept="image/*" required>
                <span class="file-cta">
                  <span class="file-icon">
                    <i class="fas fa-upload"></i>
                  </span>
                  <span class="file-label">
                    Elegir archivo
                  </span>
                </span>
                <span class="file-name">
                  {{ fileName || 'No hay archivo seleccionado' }}
                </span>
              </label>
            </div>
            <p v-if="!almuerzoForm.imagen && !previewImageUrl" class="help is-danger">
              La imagen es obligatoria
            </p>
          </div>
          
          <div v-if="previewImageUrl" class="image-preview mt-3">
            <img :src="previewImageUrl" alt="Vista previa">
          </div>
        </section>
        
        <footer class="modal-card-foot">
          <button 
            @click="saveAlmuerzo" 
            class="button is-primary"
            :disabled="!almuerzoForm.nombre || !almuerzoForm.precio || (!almuerzoForm.imagen && !isEdit)"
          >
            {{ isEdit ? 'Guardar cambios' : 'Crear almuerzo' }}
          </button>
          <button @click="showForm = false" class="button">Cancelar</button>
        </footer>
      </div>
    </div>
    
    <!-- Modal para añadir/editar ítem -->
    <div class="modal" :class="{'is-active': showItemForm}">
      <div class="modal-background" @click="showItemForm = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ isEditingItem ? 'Editar' : 'Añadir' }} Ítem</p>
        </header>
        
        <section class="modal-card-body">
          <div class="field">
            <label class="label">Nombre</label>
            <div class="control">
              <input 
                v-model="itemForm.nombre" 
                class="input" 
                type="text"
                required
                placeholder="Ej: Café con leche"
              >
            </div>
          </div>

          <div class="field">
            <label class="label">Descripción (opcional)</label>
            <div class="control">
              <input 
                v-model="itemForm.descripcion" 
                class="input" 
                type="text"
                placeholder="Ej: Café con leche caliente"
              >
            </div>
          </div>
        </section>
        
        <footer class="modal-card-foot">
          <button @click="saveItem" class="button is-primary" :disabled="!itemForm.nombre">
            {{ isEditingItem ? 'Guardar cambios' : 'Guardar ítem' }}
          </button>
          <button @click="showItemForm = false" class="button">Cancelar</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import pb from '@/services/pocketbase.js'

export default {
  name: 'AlmuerzosAdmin',
  setup() {
    const loading = ref(false)
    const almuerzos = ref([])
    const almuerzoItems = ref({})
    const showForm = ref(false)
    const showItemForm = ref(false)
    const isEdit = ref(false)
    const editId = ref(null)
    const currentAlmuerzoId = ref(null)
    const fileName = ref('')
    const previewImageUrl = ref('')
    const isEditingItem = ref(false)
    const editingItemId = ref(null)
    
    const almuerzoForm = ref({
      nombre: '',
      precio: null,
      imagen: null
    })
    
    const itemForm = ref({
      nombre: '',
      descripcion: '',
      almuerzo: ''
    })
    
    const loadAlmuerzos = async () => {
      loading.value = true
      try {
        const records = await pb.collection('almuerzos').getFullList({
          sort: 'created'
        })
        almuerzos.value = records
        
        // Cargar items para cada almuerzo
        for (const almuerzo of records) {
          const items = await pb.collection('almuerzo_items').getFullList({
            filter: `almuerzo.id = "${almuerzo.id}"`,
            sort: 'created'
          })
          almuerzoItems.value[almuerzo.id] = items
        }
      } catch (error) {
        console.error('Error cargando almuerzos:', error)
      } finally {
        loading.value = false
      }
    }
    
    const getAlmuerzoItems = (almuerzoId) => {
      return almuerzoItems.value[almuerzoId] || []
    }
    
    const getImageUrl = (almuerzo) => {
      if (!almuerzo.imagen) return null
      return pb.files.getUrl(almuerzo, almuerzo.imagen)
    }
    
    const resetForm = () => {
      almuerzoForm.value = {
        nombre: '',
        precio: null,
        imagen: null
      }
      fileName.value = ''
      previewImageUrl.value = ''
      isEdit.value = false
      editId.value = null
    }
    
    const resetItemForm = () => {
      itemForm.value = {
        nombre: '',
        descripcion: '',
        almuerzo: currentAlmuerzoId.value
      }
      isEditingItem.value = false
      editingItemId.value = null
    }
    
    const onFileChange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      
      fileName.value = file.name
      almuerzoForm.value.imagen = file
      
      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        previewImageUrl.value = e.target.result
      }
      reader.readAsDataURL(file)
    }
    
    const saveAlmuerzo = async () => {
      try {
        if (!almuerzoForm.value.nombre || !almuerzoForm.value.precio || (!almuerzoForm.value.imagen && !isEdit.value)) {
          return
        }

        const formData = new FormData()
        formData.append('nombre', almuerzoForm.value.nombre)
        formData.append('precio', almuerzoForm.value.precio)
        if (almuerzoForm.value.imagen) {
          formData.append('imagen', almuerzoForm.value.imagen)
        }
        
        if (isEdit.value) {
          await pb.collection('almuerzos').update(editId.value, formData)
        } else {
          await pb.collection('almuerzos').create(formData)
        }
        showForm.value = false
        await loadAlmuerzos()
      } catch (error) {
        console.error('Error al guardar almuerzo:', error)
      }
    }
    
    const editAlmuerzo = (almuerzo) => {
      isEdit.value = true
      editId.value = almuerzo.id
      almuerzoForm.value = {
        nombre: almuerzo.nombre,
        precio: almuerzo.precio,
        imagen: null
      }
      fileName.value = ''
      previewImageUrl.value = almuerzo.imagen ? getImageUrl(almuerzo) : ''
      showForm.value = true
    }
    
    const deleteAlmuerzo = async (id) => {
      if (!confirm('¿Estás seguro de que deseas eliminar este almuerzo?')) return
      
      try {
        // Primero eliminamos todos los items asociados
        const items = getAlmuerzoItems(id)
        for (const item of items) {
          await pb.collection('almuerzo_items').delete(item.id)
        }
        
        // Luego eliminamos el almuerzo
        await pb.collection('almuerzos').delete(id)
        await loadAlmuerzos()
      } catch (error) {
        console.error('Error al eliminar almuerzo:', error)
      }
    }
    
    const addItem = (almuerzoId) => {
      currentAlmuerzoId.value = almuerzoId
      resetItemForm()
      showItemForm.value = true
    }
    
    const editItem = (item) => {
      currentAlmuerzoId.value = item.almuerzo
      editingItemId.value = item.id
      isEditingItem.value = true
      itemForm.value = {
        nombre: item.nombre,
        descripcion: item.descripcion,
        almuerzo: item.almuerzo
      }
      showItemForm.value = true
    }
    
    const saveItem = async () => {
      try {
        const itemData = {
          nombre: itemForm.value.nombre,
          descripcion: itemForm.value.descripcion,
          almuerzo: currentAlmuerzoId.value
        }

        if (isEditingItem.value) {
          await pb.collection('almuerzo_items').update(editingItemId.value, itemData)
        } else {
          await pb.collection('almuerzo_items').create(itemData)
        }
        showItemForm.value = false
        await loadAlmuerzos()
      } catch (error) {
        console.error('Error al guardar item:', error)
      }
    }
    
    const deleteItem = async (id) => {
      if (!confirm('¿Estás seguro de que deseas eliminar este ítem?')) return
      
      try {
        await pb.collection('almuerzo_items').delete(id)
        await loadAlmuerzos()
      } catch (error) {
        console.error('Error al eliminar item:', error)
      }
    }
    
    onMounted(() => {
      loadAlmuerzos()
    })
    
    return {
      loading,
      almuerzos,
      almuerzoItems,
      showForm,
      showItemForm,
      isEdit,
      editId,
      currentAlmuerzoId,
      fileName,
      previewImageUrl,
      almuerzoForm,
      itemForm,
      isEditingItem,
      getAlmuerzoItems,
      getImageUrl,
      resetForm,
      onFileChange,
      saveAlmuerzo,
      editAlmuerzo,
      deleteAlmuerzo,
      addItem,
      editItem,
      saveItem,
      deleteItem
    }
  }
}
</script>

<style lang="scss" scoped>
.almuerzos-admin {
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background-color: rgba(30, 30, 30, 0.7);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 55, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.card-header {
  background-color: rgba(18, 18, 18, 0.8);
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.card-header-title {
  color: #d4af37;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.almuerzos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 1.2rem;
  padding: 1rem;
}

.almuerzo-card {
  background-color: rgba(18, 18, 18, 0.5);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(212, 175, 55, 0.2);
  display: flex;
  flex-direction: column;
  height: calc((100vh - 20vh) / 2);
}

.almuerzo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.almuerzo-title {
  color: #d4af37;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
}

.almuerzo-price {
  color: #e0e0e0;
  font-weight: 600;
}

.almuerzo-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.almuerzo-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.almuerzo-items {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  background-color: rgba(30, 30, 30, 0.3);
  border-radius: 4px;
  padding: 0.5rem;
}

.empty-items {
  text-align: center;
  padding: 0.5rem;
  color: #888;
  font-style: italic;
  border: 1px dashed rgba(212, 175, 55, 0.2);
  border-radius: 4px;
}

.almuerzo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(30, 30, 30, 0.5);
  border-radius: 4px;
  padding: 0.5rem;
  border-left: 3px solid #d4af37;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
    background-color: rgba(30, 30, 30, 0.8);
  }
}

.item-info {
  flex-grow: 1;
  margin-right: 0.5rem;
}

.item-name {
  color: #d4af37;
  font-weight: 600;
  font-size: 0.9rem;
  margin: 0;
}

.item-description {
  color: #e0e0e0;
  font-size: 0.8rem;
  margin: 0.1rem 0 0;
  font-style: italic;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-item,
.delete-item {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.edit-item {
  color: #3298dc;
  &:hover {
    background-color: rgba(50, 152, 220, 0.1);
  }
}

.delete-item {
  color: #ff3860;
  &:hover {
    background-color: rgba(255, 56, 96, 0.1);
  }
}

.almuerzo-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(212, 175, 55, 0.2);
}

.image-preview {
  max-width: 200px;
  margin: 0 auto;
}

.image-preview img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(212, 175, 55, 0.3);
  border-radius: 50%;
  border-top-color: #d4af37;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1200px) {
  .almuerzos-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
  }
  
  .almuerzo-card {
    height: calc((100vh - 20vh) / 3);
  }
}

@media (max-width: 768px) {
  .almuerzos-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(6, auto);
    gap: 1rem;
  }
  
  .almuerzo-card {
    height: auto;
    min-height: 300px;
  }
  
  .almuerzo-actions {
    flex-wrap: wrap;
  }
  
  .almuerzo-actions .button {
    flex: 1;
  }
}
</style> 