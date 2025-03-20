<template>
  <div class="notification-container">
    <Notification
      v-for="notification in notifications"
      :key="notification.id"
      :message="notification.message"
      :type="notification.type"
      :duration="notification.duration"
      @close="removeNotification(notification.id)"
    />
  </div>
</template>

<script>
import { useNotification } from '@/composables/useNotification'
import Notification from './Notification.vue'

export default {
  name: 'NotificationContainer',
  components: {
    Notification
  },
  setup() {
    const { notifications, removeNotification } = useNotification()

    return {
      notifications,
      removeNotification
    }
  }
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style> 