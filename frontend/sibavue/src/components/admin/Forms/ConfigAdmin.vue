// src/components/admin/Forms/ConfigAdmin.vue
<template>
  <div>
    <h2>Configuración General</h2>
    
    <form @submit.prevent="saveConfig">
      <div>
        <label>Tiempo de rotación entre vistas (segundos)</label>
        <input 
          v-model.number="rotationSeconds" 
          type="number" 
          min="3" 
          step="1" 
          required 
        />
      </div>
      
      <button type="submit">Guardar configuración</button>
    </form>
    
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
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
    
    // Cargar configuración actual
    const loadConfig = async () => {
      try {
        const config = await pb.collection('config').getFirstListItem('')
        configId.value = config.id
        rotationSeconds.value = config.rotacion_escena_segundos || 10
      } catch (err) {
        console.error('Error loading config:', err)
        
        // Si no existe configuración, creamos una por defecto
        try {
          const newConfig = await pb.collection('config').create({
            rotacion_escena_segundos: 10
          })
          configId.value = newConfig.id
          rotationSeconds.value = 10
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
        } else {
          // Si existe, actualizar
          await pb.collection('config').update(configId.value, {
            rotacion_escena_segundos: rotationSeconds.value
          })
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
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        message.value = ''
      }, 3000)
    }
    
    onMounted(() => {
      loadConfig()
    })
    
    return {
      rotationSeconds,
      message,
      messageType,
      saveConfig
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
  margin-top: 10px;
}

input {
  width: 100%;
  padding: 5px;
  margin: 5px 0;
}

label {
  display: block;
  margin-top: 10px;
}

.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 5px;
}

.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>