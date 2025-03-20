import { ref } from 'vue'

const notifications = ref([])

export function useNotification() {
  const showNotification = ({ message, type = 'is-success', duration = 3000 }) => {
    const id = Date.now()
    notifications.value.push({ id, message, type, duration })
    
    setTimeout(() => {
      removeNotification(id)
    }, duration)
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  return {
    notifications,
    showNotification,
    removeNotification
  }
} 