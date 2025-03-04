<template>
  <section class="section">
    <div class="container">
      <div class="columns is-centered">
        <div class="column is-one-third-desktop is-half-tablet">
          <div class="login-container">
            <div class="login-header">
              <h1 class="title is-4">Sibarita Restaurant</h1>
              <h2 class="subtitle is-6">Acceso Administración</h2>
            </div>
            
            <div class="login-body">
              <form @submit.prevent="loginUser">
                <div class="field">
                  <label class="label">Email</label>
                  <div class="control has-icons-left">
                    <input 
                      v-model="email" 
                      class="input" 
                      type="email" 
                      placeholder="Tu email"
                      required
                    >
                    <span class="icon is-small is-left">
                      <i class="fas fa-envelope"></i>
                    </span>
                  </div>
                </div>
                
                <div class="field">
                  <label class="label">Contraseña</label>
                  <div class="control has-icons-left">
                    <input 
                      v-model="password" 
                      class="input" 
                      type="password" 
                      placeholder="Tu contraseña"
                      required
                    >
                    <span class="icon is-small is-left">
                      <i class="fas fa-lock"></i>
                    </span>
                  </div>
                </div>
                
                <div v-if="error" class="notification is-danger is-light">
                  <p>{{ error }}</p>
                </div>
                
                <div class="field mt-5">
                  <div class="control">
                    <button type="submit" class="button is-primary is-fullwidth">
                      Iniciar Sesión
                    </button>
                  </div>
                </div>
              </form>
              
              <div class="has-text-centered mt-4">
                <button @click="goToHome" class="button is-text">
                  Volver al Inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
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
.login-header h1 {
  margin-bottom: 0.5rem !important;
}

.login-header h2 {
  opacity: 0.8;
}

.login-body {
  padding: 1.5rem;
}

.notification {
  padding: 0.75rem;
  font-size: 0.9rem;
}

.button.is-text {
  text-decoration: none;
  color: #d4af37;
}

.button.is-text:hover {
  color: #f8e8a7;
  background-color: transparent;
}
</style>