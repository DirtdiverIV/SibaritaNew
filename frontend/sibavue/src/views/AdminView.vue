// src/views/AdminView.vue
<template>
  <div>
    <h1>Panel Admin</h1>
    
    <!-- Configuración General -->
    <ConfigAdmin />
    
    <!-- Diagnóstico -->
    <DiagnosticsAdmin />
    
    <!-- Asignación de TVs -->
    <TvAssignmentsAdmin />
    
    <!-- Section Platos -->
    <PlatosAdmin />
    
    <!-- Section Eventos -->
    <EventosAdmin />
    
    <!-- Section Menu del día -->
    <MenuDiaAdmin />
    
    <!-- Botón Logout -->
    <div style="margin-top: 30px;">
      <button @click="logout">Cerrar sesión</button>
    </div>
  </div>
</template>

<script>
import PlatosAdmin from '@/components/admin/Forms/PlatosAdmin.vue'
import EventosAdmin from '@/components/admin/Forms/EventosAdmin.vue'
import DiagnosticsAdmin from '@/components/admin/Forms/DiagnosticsAdmin.vue'
import TvAssignmentsAdmin from '@/components/admin/Forms/TvAssignmentsAdmin.vue'
import MenuDiaAdmin from '@/components/admin/Forms/MenuDiaAdmin.vue'
import ConfigAdmin from '@/components/admin/Forms/ConfigAdmin.vue'
import pb from '@/services/pocketbase.js'
import { useRouter } from 'vue-router'

export default {
  name: 'AdminView',
  components: {
    PlatosAdmin,
    EventosAdmin,
    DiagnosticsAdmin,
    TvAssignmentsAdmin,
    MenuDiaAdmin,
    ConfigAdmin
  },
  setup() {
    const router = useRouter()
    
    const logout = () => {
      pb.authStore.clear()
      router.push('/login')
    }
    
    return {
      logout
    }
  }
}
</script>

<style scoped>
/* Estilos básicos para el panel de administración */
</style>