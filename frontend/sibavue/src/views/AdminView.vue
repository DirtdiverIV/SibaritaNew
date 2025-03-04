<template>
  <div>
    <h1>Panel de Administración</h1>
    <PlatosAdmin />
    <!-- Más secciones de administración (eventos, menús, etc.) -->
  </div>
</template>

<script>
import PlatosAdmin from '@/components/admin/Forms/PlatosAdmin.vue'

export default {
  name: 'AdminView',
  components: {
    PlatosAdmin
  }
}
</script>