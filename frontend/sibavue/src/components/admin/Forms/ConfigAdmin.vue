<template>
  <div class="config-admin">
    <div class="card">
      <div class="card-header">
        <p class="card-header-title">
          Configuración General
        </p>
      </div>
      
      <div class="card-content">
        <form @submit.prevent="saveConfig">
          <div class="field">
            <label class="label">Tiempo de rotación entre vistas (segundos)</label>
            <div class="control">
              <input 
                v-model.number="rotationSeconds" 
                type="number" 
                min="3" 
                step="1" 
                required 
                class="input"
              />
              <p class="help">Tiempo en segundos que cada vista permanecerá en pantalla antes de cambiar a la siguiente.</p>
            </div>
          </div>
          
          <div class="field mt-4">
            <div class="control">
              <button type="submit" class="button is-primary">
                <span class="icon">
                  <i class="fas fa-save"></i>
                </span>
                <span>Guardar configuración</span>
              </button>
            </div>
          </div>
        </form>
        
        <div v-if="message" :class="['notification mt-4', messageType === 'success' ? 'is-success' : 'is-danger']">
          <button class="delete" @click="message = ''"></button>
          {{ message }}
        </div>
      </div>
    </div>
    
    <div class="card mt-5">
      <div class="card-header">
        <p class="card-header-title">
          Información del Sistema
        </p>
      </div>
      
      <div class="card-content">
        <div class="columns">
          <div class="column is-6">
            <div class="field">
              <label class="label">Última actualización</label>
              <p>{{ lastUpdate }}</p>
            </div>
          </div>
          
          <div class="column is-6">
            <div class="field">
              <label class="label">Estado</label>
              <p>
                <span class="tag is-success">
                  <span class="icon"><i class="fas fa-check"></i></span>
                  <span>Activo</span>
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div class="notification is-info is-light mt-4">
          <p>
            <span class="icon"><i class="fas fa-info-circle"></i></span>
            <span>Esta configuración se aplica globalmente a todas las pantallas de TV.</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import pb from '@/services/pocketbase.js'

export default {
  name: 'ConfigAdmin',
  setup() {
    const rotationSeconds = ref(10)
    const configId = ref(null)
    const message = ref('')
    const messageType = ref('success')
    const lastUpdate = ref('No disponible')
    
    // Cargar configuración actual
    const loadConfig = async () => {
      try {
        const config = await pb.collection('config').getFirstListItem('')
        configId.value = config.id
        rotationSeconds.value = config.rotacion_escena_segundos || 10
        
        // Formatear la fecha de última actualización
        if (config.updated) {
          const date = new Date(config.updated)
          lastUpdate.value = date.toLocaleString()
        }
      } catch (err) {
        console.error('Error loading config:', err)
        
        // Si no existe configuración, creamos una por defecto
        try {
          const newConfig = await pb.collection('config').create({
            rotacion_escena_segundos: 10
          })
          configId.value = newConfig.id
          rotationSeconds.value = 10
          
          // Actualizar fecha
          if (newConfig.created) {
            const date = new Date(newConfig.created)
            lastUpdate.value = date.toLocaleString()
          }
        } catch (createErr) {
          console.error('Error creating default config:', createErr)
          showMessage('No se pudo crear configuración por defecto. Verifica permisos.', 'error')
        }
      }
    }
    
    // Guardar configuración
    const saveConfig = async () => {
      try {
        if (!configId.value) {
          // Si no existe, crear nuevo
          const newConfig = await pb.collection('config').create({
            rotacion_escena_segundos: rotationSeconds.value
          })
          configId.value = newConfig.id
          
          // Actualizar fecha
          if (newConfig.created) {
            const date = new Date(newConfig.created)
            lastUpdate.value = date.toLocaleString()
          }
        } else {
          // Si existe, actualizar
          const updated = await pb.collection('config').update(configId.value, {
            rotacion_escena_segundos: rotationSeconds.value
          })
          
          // Actualizar fecha
          if (updated.updated) {
            const date = new Date(updated.updated)
            lastUpdate.value = date.toLocaleString()
          }
        }
        
        showMessage('Configuración guardada correctamente', 'success')
      } catch (err) {
        console.error('Error saving config:', err)
        showMessage('Error al guardar la configuración: ' + err.message, 'error')
      }
    }
    
    // Mostrar mensaje temporal
    const showMessage = (text, type = 'success') => {
      message.value = text
      messageType.value = type
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => {
        message.value = ''
      }, 5000)
    }
    
    onMounted(() => {
      loadConfig()
    })
    
    return {
      rotationSeconds,
      message,
      messageType,
      lastUpdate,
      saveConfig
    }
  }
}
</script>

<style scoped>
.config-admin {
  max-width: 800px;
  margin: 0 auto;
}

.notification {
  padding: 1rem;
}

.button {
  transition: all 0.3s ease;
}

.button:hover {
  transform: translateY(-2px);
}

.label {
  color: #e0e0e0;
  font-weight: 600;
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
}

.card-header-title {
  color: #d4af37;
  font-weight: 600;
}

.input {
  background-color: rgba(18, 18, 18, 0.5);
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: #e0e0e0;
}

.input:focus {
  border-color: #d4af37;
  box-shadow: 0 0 0 0.125em rgba(212, 175, 55, 0.25);
}

.help {
  color: #b0b0b0;
  font-style: italic;
}
</style>