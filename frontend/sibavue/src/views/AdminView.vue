<template>
  <div>
    <h1>Panel Admin</h1><DiagnosticsAdmin />
    <!-- Section Platos -->
    <PlatosAdmin />
    <!-- Section Eventos -->
    <EventosAdmin />
    <!-- Section Menus de evento, etc... -->
    
  </div>
</template>

<script>
import PlatosAdmin from '@/components/admin/Forms/PlatosAdmin.vue'
import EventosAdmin from '@/components/admin/Forms/EventosAdmin.vue'
import DiagnosticsAdmin from '@/components/admin/Forms/DiagnosticsAdmin.vue'
// ...

export default {
  name: 'AdminView',
  components: {
    PlatosAdmin,
    EventosAdmin,
    DiagnosticsAdmin
  }
}
</script>