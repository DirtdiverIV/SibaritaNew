// src/components/admin/Auth/LoginForm.vue
<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>Sibarita Restaurant</h1>
        <h2>Acceso Administración</h2>
      </div>
      
      <form @submit.prevent="loginUser" class="login-form">
        <div class="form-group">
          <label for="email">Email:</label>
          <input 
            v-model="email" 
            type="email" 
            id="email" 
            placeholder="Introduce tu email" 
            required 
          />
        </div>
        
        <div class="form-group">
          <label for="password">Contraseña:</label>
          <input 
            v-model="password" 
            type="password" 
            id="password" 
            placeholder="Introduce tu contraseña" 
            required 
          />
        </div>
        
        <button type="submit" class="login-button">
          Iniciar Sesión
        </button>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
      
      <div class="login-footer">
        <button @click="goToHome" class="back-button">
          Volver al Inicio
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import pb from '@/services/pocketbase.js'

export default {
  name: 'LoginForm',
  setup() {
    const router = useRouter()
    const email = ref('')
    const password = ref('')
    const error = ref(null)
    
    const loginUser = async () => {
      error.value = null
      
      try {
        // Llamada a PocketBase para autenticar
        await pb.collection('users').authWithPassword(email.value, password.value)
        // Si se autentica bien, redirigimos a /admin
        router.push('/admin')
      } catch (err) {
        error.value = 'Error de acceso: ' + (err.message || 'Credenciales inválidas')
      }
    }
    
    const goToHome = () => {
      router.push('/')
    }
    
    return {
      email,
      password,
      error,
      loginUser,
      goToHome
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  font-family: 'Montserrat', sans-serif;
}

.login-container {
  width: 400px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.login-header {
  background-color: #343a40;
  color: white;
  padding: 30px;
  text-align: center;
}

.login-header h1 {
  margin: 0 0 10px;
  font-size: 1.8rem;
}

.login-header h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: normal;
}

.login-form {
  padding: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #495057;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  border-color: #007bff;
  outline: none;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #0056b3;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
}

.login-footer {
  padding: 20px;
  text-align: center;
  border-top: 1px solid #e9ecef;
}

.back-button {
  padding: 8px 15px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: #5a6268;
}

/* Responsive */
@media (max-width: 480px) {
  .login-container {
    width: 95%;
  }
}
</style>