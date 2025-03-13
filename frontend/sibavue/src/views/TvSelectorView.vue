<template>
  <div class="tv-selector">
    <div class="container">
      <section class="section">
        <div class="has-text-centered mb-6">
          <h1 class="title is-1 has-text-gold">Sibarita Restaurant</h1>
          <p class="subtitle is-4">Sistema de Visualización TV</p>
        </div>
        
        <div class="card">
          <div class="card-header">
            <p class="card-header-title">
              Acceso a Televisores
            </p>
          </div>
          <div class="card-content">
            <p class="mb-4">Selecciona el televisor que deseas configurar:</p>
            
            <div class="columns is-multiline is-mobile">
              <div class="column is-6-mobile is-3-tablet" v-for="i in 4" :key="i">
                <div class="tv-card" @click="goToTV(`tv${i}`)">
                  <div class="tv-icon">📺</div>
                  <div class="tv-name">TV {{ i }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card mt-5">
          <div class="card-header">
            <p class="card-header-title">
              Administración
            </p>
          </div>
          <div class="card-content">
            <p class="mb-4">Accede al panel de control para configurar contenidos:</p>
            <button 
              @click="goToAdmin" 
              class="button is-primary is-fullwidth"
            >
              Panel de Administración
            </button>
          </div>
        </div>
      </section>
      
      <footer class="footer has-text-centered">
        <p>© {{ new Date().getFullYear() }} Sibarita Restaurant</p>
      </footer>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'TvSelectorView',
  setup() {
    const router = useRouter()
    
    const goToTV = (tvId) => {
      router.push(`/tv/${tvId}`)
    }
    
    const goToAdmin = () => {
      router.push('/admin')
    }
    
    return { 
      goToTV,
      goToAdmin
    }
  }
}
</script>

<style scoped>
.tv-selector {
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.tv-card {
  background: linear-gradient(145deg, rgba(30, 30, 30, 0.8), rgba(44, 44, 44, 0.8));
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: #d4af37;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.tv-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.3);
  border-color: rgba(212, 175, 55, 0.6);
}

.tv-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.tv-name {
  font-weight: 600;
  font-size: 1.2rem;
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.footer {
  background-color: transparent;
  color: #e0e0e0;
  padding: 3rem 1.5rem;
  font-family: 'BelleroSeLight', system-ui, Avenir, Helvetica, Arial, sans-serif;
}

@media screen and (max-width: 768px) {
  .section {
    padding: 1.5rem;
  }
}
</style>
