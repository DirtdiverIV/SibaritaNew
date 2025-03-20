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
            <div v-if="loading" class="has-text-centered my-5">
              <div class="loading-spinner"></div>
              <p class="mt-3">Cargando pantallas...</p>
            </div>

            <div v-else>
              <p class="mb-4" v-if="tvs.length > 0">Selecciona el televisor que deseas ver en esta TV:</p>
              <p class="mb-4" v-else>No hay televisores configurados. Añade uno desde el panel de administración.</p>
              
              <div class="columns is-multiline is-mobile">
                <div class="column is-6-mobile is-3-tablet" v-for="tv in tvs" :key="tv.id">
                  <div class="tv-card" @click="goToTV(tv.tv_id)">
                    <div class="tv-icon">📺</div>
                    <div class="tv-name">{{ tv.tv_id }}</div>
                  </div>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import pb from '@/services/pocketbase'

export default {
  name: 'TvSelectorView',
  setup() {
    const router = useRouter()
    const tvs = ref([])
    const loading = ref(false)
    
    const loadTvs = async () => {
      loading.value = true
      try {
        const response = await pb.collection('tv_assignments').getFullList({
          sort: 'tv_id'
        })
        tvs.value = response
      } catch (err) {
        console.error('Error al cargar TVs:', err)
      } finally {
        loading.value = false
      }
    }
    
    const goToTV = (tvId) => {
      router.push(`/tv/${tvId}`)
    }
    
    const goToAdmin = () => {
      router.push('/admin')
    }

    onMounted(() => {
      loadTvs()
    })
    
    return { 
      tvs,
      loading,
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

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(212, 175, 55, 0.3);
  border-radius: 50%;
  border-top-color: #d4af37;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
