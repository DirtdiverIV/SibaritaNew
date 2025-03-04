<template>
  <div class="admin-page">
    <!-- Navbar -->
    <nav class="navbar admin-navbar" role="navigation" aria-label="main navigation">
      <div class="container">
        <div class="navbar-brand">
          <a class="navbar-item" href="/">
            <span class="icon mr-2">
              <i class="fas fa-utensils"></i>
            </span>
            Sibarita Admin
          </a>
          
          <a 
            role="button" 
            class="navbar-burger" 
            :class="{'is-active': isNavbarActive}" 
            aria-label="menu" 
            aria-expanded="false" 
            @click="toggleNavbar"
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>
        
        <div class="navbar-menu" :class="{'is-active': isNavbarActive}">
          <div class="navbar-end">
            <a 
              v-for="(section, index) in sections" 
              :key="index"
              class="navbar-item" 
              :class="{'is-active': activeSection === index}"
              @click="activeSection = index"
            >
              {{ section.name }}
            </a>
            
            <div class="navbar-item">
              <button @click="logout" class="button is-small">
                <span class="icon">
                  <i class="fas fa-sign-out-alt"></i>
                </span>
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- Contenido principal -->
    <div class="container main-container">
      <div class="box admin-content">
        <h1 class="title is-3 has-text-centered">
          Panel de Administración
        </h1>
        
        <!-- Secciones dinámicas -->
        <div class="tabs is-centered is-boxed">
          <ul>
            <li 
              v-for="(section, index) in sections" 
              :key="index"
              :class="{'is-active': activeSection === index}"
            >
              <a @click="activeSection = index">
                <span class="icon is-small"><i :class="section.icon"></i></span>
                <span>{{ section.name }}</span>
              </a>
            </li>
          </ul>
        </div>
        
        <!-- Componente activo -->
        <div class="tab-content p-4">
          <keep-alive>
            <component :is="currentComponent" />
          </keep-alive>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <footer class="footer has-text-centered">
      <div class="container">
        <p>© {{ new Date().getFullYear() }} Sibarita Restaurant</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, defineAsyncComponent } from 'vue'
import pb from '@/services/pocketbase.js'
import { useRouter } from 'vue-router'

// Importación asíncrona de componentes para mejorar rendimiento
const ConfigAdmin = defineAsyncComponent(() => import('@/components/admin/Forms/ConfigAdmin.vue'))
const TvAssignmentsAdmin = defineAsyncComponent(() => import('@/components/admin/Forms/TvAssignmentsAdmin.vue'))
const PlatosAdmin = defineAsyncComponent(() => import('@/components/admin/Forms/PlatosAdmin.vue'))
const MenuDiaAdmin = defineAsyncComponent(() => import('@/components/admin/Forms/MenuDiaAdmin.vue'))
const EventosAdmin = defineAsyncComponent(() => import('@/components/admin/Forms/EventosAdmin.vue'))
const DiagnosticsAdmin = defineAsyncComponent(() => import('@/components/admin/Forms/DiagnosticsAdmin.vue'))

export default {
  name: 'AdminView',
  components: {
    ConfigAdmin,
    TvAssignmentsAdmin,
    PlatosAdmin,
    MenuDiaAdmin,
    EventosAdmin,
    DiagnosticsAdmin
  },
  setup() {
    const router = useRouter()
    const isNavbarActive = ref(false)
    const activeSection = ref(0)
    
    const sections = [
      { 
        name: 'Configuración', 
        component: 'ConfigAdmin',
        icon: 'fas fa-cog'
      },
      { 
        name: 'Pantallas TV', 
        component: 'TvAssignmentsAdmin',
        icon: 'fas fa-tv'
      },
      { 
        name: 'Platos', 
        component: 'PlatosAdmin',
        icon: 'fas fa-utensils'
      },
      { 
        name: 'Menú del Día', 
        component: 'MenuDiaAdmin',
        icon: 'fas fa-clipboard-list'
      },
      { 
        name: 'Eventos', 
        component: 'EventosAdmin',
        icon: 'fas fa-calendar-alt'
      },
      { 
        name: 'Diagnóstico', 
        component: 'DiagnosticsAdmin',
        icon: 'fas fa-stethoscope'
      }
    ]
    
    // Componente actual para mostrar
    const currentComponent = computed(() => {
      return sections[activeSection.value].component
    })
    
    const toggleNavbar = () => {
      isNavbarActive.value = !isNavbarActive.value
    }
    
    const logout = () => {
      pb.authStore.clear()
      router.push('/login')
    }
    
    return {
      sections,
      activeSection,
      isNavbarActive,
      toggleNavbar,
      logout,
      currentComponent
    }
  }
}
</script>

<style scoped>
.admin-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-container {
  flex: 1;
  padding: 2rem 1rem;
}

.admin-content {
  background-color: rgba(30, 30, 30, 0.8);
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.tab-content {
  border-radius: 0 0 6px 6px;
  min-height: 50vh;
}

.tabs li.is-active a {
  border-bottom-color: #d4af37;
  color: #d4af37;
}

.tabs a {
  color: #e0e0e0;
}

.tabs a:hover {
  color: #f8e8a7;
  border-bottom-color: #b08b29;
}

.footer {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: transparent;
  color: #e0e0e0;
}

@media screen and (max-width: 768px) {
  .main-container {
    padding: 1rem 0.5rem;
  }
  
  .tabs {
    overflow-x: auto;
  }
}
</style>