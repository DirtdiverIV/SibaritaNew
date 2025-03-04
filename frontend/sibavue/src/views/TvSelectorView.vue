// src/views/TvSelectorView.vue
<template>
  <div class="tv-selector">
    <div class="container">
      <div class="header">
        <h1>Sibarita Restaurant</h1>
        <p>Sistema de Visualización TV</p>
      </div>
      
      <div class="content">
        <div class="section">
          <h2>Acceso a Televisores</h2>
          <p>Selecciona el televisor que deseas configurar:</p>
          
          <div class="tv-grid">
            <div class="tv-card" v-for="i in 4" :key="i" @click="goToTV(`tv${i}`)">
              <div class="tv-icon">📺</div>
              <div class="tv-name">TV {{ i }}</div>
            </div>
          </div>
        </div>
        
        <div class="admin-section">
          <h2>Administración</h2>
          <p>Accede al panel de control para configurar contenidos:</p>
          <button @click="goToAdmin" class="admin-button">Panel de Administración</button>
        </div>
      </div>
      
      <div class="footer">
        <p>© 2023 Sibarita Restaurant</p>
      </div>
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
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Montserrat', sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0;
  color: #343a40;
}

.header p {
  font-size: 1.2rem;
  color: #6c757d;
}

.content {
  background-color: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
}

.section, .admin-section {
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #e9ecef;
}

.section h2, .admin-section h2 {
  margin-top: 0;
  color: #343a40;
}

.tv-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.tv-card {
  background-color: #007bff;
  color: white;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s, background-color 0.3s;
}

.tv-card:hover {
  transform: translateY(-5px);
  background-color: #0056b3;
}

.tv-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.tv-name {
  font-weight: bold;
}

.admin-button {
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 12px 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.admin-button:hover {
  background-color: #218838;
}

.footer {
  text-align: center;
  margin-top: 30px;
  color: #6c757d;
}

/* Responsive */
@media (max-width: 768px) {
  .tv-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .header h1 {
    font-size: 2rem;
  }
}
</style>