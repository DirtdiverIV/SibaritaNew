<!-- TVSelectorView.vue -->
<template>
    <div>
      <h1>Selector de TV</h1>
      <p>Aquí habrá un selector para cada televisor y un botón para ir al panel de admin.</p>
      <!-- Ejemplo de enlace a /admin -->
      <router-link to="/admin">Ir al Admin</router-link>
    </div>
  </template>
  
  <script>
  export default {
    name: 'TVSelectorView',
  }
  </script>
  