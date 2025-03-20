<template>
  <div id="app">
    <NotificationContainer />
    <router-view />
  </div>
</template>
<script>
import NotificationContainer from '@/components/common/NotificationContainer.vue'

export default {
  name: 'App',
  components: {
    NotificationContainer,
  }
}
</script>
<style>
/* estilos globales aquí o en assets/styles/global.css */
</style>
