<template>
    <div>
      <h1>Login</h1>
      <form @submit.prevent="loginUser">
        <div>
          <label>Email:</label>
          <input v-model="email" type="email" required />
        </div>
        <div>
          <label>Contraseña:</label>
          <input v-model="password" type="password" required />
        </div>
        <button type="submit">Entrar</button>
      </form>
  
      <div v-if="error">
        <p style="color: red;">{{ error }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue'
  import pb from '@/services/pocketbase.js'
  
  export default {
    name: 'LoginForm',
    setup() {
      const email = ref('')
      const password = ref('')
      const error = ref(null)
  
      const loginUser = async () => {
        error.value = null
        try {
          // Llamada a PocketBase para autenticar
          await pb.collection('users').authWithPassword(email.value, password.value)
          // Si se autentica bien, podemos redirigir a /admin
          window.location.href = '/admin'
        } catch (err) {
          error.value = 'Error de login: ' + (err.message || 'Credenciales inválidas')
        }
      }
  
      return {
        email,
        password,
        error,
        loginUser
      }
    }
  }
  </script>
  