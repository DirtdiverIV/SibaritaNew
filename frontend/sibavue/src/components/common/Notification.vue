<template>
  <transition name="fade">
    <div v-if="isVisible" :class="['notification', typeClass]">
      <button class="delete" @click="close"></button>
      {{ message }}
    </div>
  </transition>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'Notification',
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'is-success',
      validator: (value) => {
        return ['is-success', 'is-warning', 'is-danger', 'is-info'].includes(value)
      }
    },
    duration: {
      type: Number,
      default: 3000
    },
    autoClose: {
      type: Boolean,
      default: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const isVisible = ref(true)

    const typeClass = {
      'is-success': props.type === 'is-success',
      'is-warning': props.type === 'is-warning',
      'is-danger': props.type === 'is-danger',
      'is-info': props.type === 'is-info'
    }

    const close = () => {
      isVisible.value = false
      emit('close')
    }

    onMounted(() => {
      if (props.autoClose) {
        setTimeout(close, props.duration)
      }
    })

    return {
      isVisible,
      typeClass,
      close
    }
  }
}
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  min-width: 300px;
  max-width: 600px;
  margin: 0;
  padding: 1.25rem 2.5rem 1.25rem 1.5rem;
  box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 