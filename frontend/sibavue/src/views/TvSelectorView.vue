<template>
  <div>
    <h1>Selector de Televisor</h1>
    <p>Selecciona a qué TV quieres acceder:</p>
    <button @click="goToTV('tv1')">TV 1</button>
    <button @click="goToTV('tv2')">TV 2</button>
    <!-- etc -->
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

    return { goToTV }
  }
}
</script>
  