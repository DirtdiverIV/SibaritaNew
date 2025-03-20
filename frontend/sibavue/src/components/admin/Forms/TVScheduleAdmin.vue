<template>
  <div class="tv-schedule-admin">
    <div class="columns">
      <!-- Panel de TVs -->
      <div class="column is-3">
        <div class="box tv-list">
          <h3 class="title is-4">TVs</h3>
          <div class="tv-items">
            <div 
              v-for="tv in tvs" 
              :key="tv.id" 
              class="tv-item"
              :class="{'is-active': selectedTV === tv.id}"
              @click="selectTV(tv.id)"
            >
              <span class="icon"><i class="fas fa-tv"></i></span>
              <span>TV {{ tv.id }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel de Horarios -->
      <div class="column is-9" v-if="selectedTV">
        <div class="box schedule-panel">
          <!-- Selector de tipo de día -->
          <div class="field">
            <label class="label">Tipo de Día</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="selectedScheduleType">
                  <option v-for="type in scheduleTypes" 
                          :key="type.id" 
                          :value="type.id">
                    {{ getScheduleTypeLabel(type) }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Selector de fecha específica (solo para días personalizados) -->
          <div class="field" v-if="getScheduleTypeName(selectedScheduleType)?.toLowerCase() === 'custom'">
            <label class="label">Fecha Específica</label>
            <div class="control">
              <input type="date" class="input" v-model="customDate">
            </div>
          </div>

          <!-- Horarios -->
          <div class="schedule-slots">
            <h4 class="title is-5">Franjas Horarias</h4>
            
            <!-- Lista de franjas horarias -->
            <div class="schedule-slot" v-for="(slot, index) in timeSlots" :key="index">
              <div class="columns is-vcentered">
                <div class="column is-2">
                  <div class="field">
                    <label class="label is-small">Inicio</label>
                    <div class="control">
                      <div class="select is-fullwidth">
                        <select v-model="slot.startTime">
                          <option v-for="time in timeOptions" :key="time" :value="time">
                            {{ time }}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="column is-2">
                  <div class="field">
                    <label class="label is-small">Fin</label>
                    <div class="control">
                      <div class="select is-fullwidth">
                        <select v-model="slot.endTime">
                          <option v-for="time in timeOptions" :key="time" :value="time">
                            {{ time }}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="column">
                  <div class="field">
                    <label class="label is-small">Vistas Asignadas</label>
                    <div class="control">
                      <div class="views-grid">
                        <button
                          v-for="view in availableViews"
                          :key="view.id"
                          class="view-button"
                          :class="{ 'is-selected': slot.views.includes(view.id) }"
                          @click="toggleView(slot, view.id)"
                          type="button"
                        >
                          <span class="icon">
                            <i class="fas" :class="slot.views.includes(view.id) ? 'fa-check-circle' : 'fa-circle'"></i>
                          </span>
                          <span>{{ formatViewName(view.view_name) }}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="column is-1">
                  <button class="button is-danger" @click="removeTimeSlot(index)">
                    <span class="icon"><i class="fas fa-trash"></i></span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Botón para agregar nueva franja -->
            <button class="button is-primary is-fullwidth mt-4" @click="addTimeSlot">
              <span class="icon"><i class="fas fa-plus"></i></span>
              <span>Agregar Franja Horaria</span>
            </button>
          </div>

          <!-- Botones de acción -->
          <div class="field is-grouped is-grouped-right mt-5">
            <p class="control">
              <button class="button is-primary" @click="saveSchedule">
                <span class="icon"><i class="fas fa-save"></i></span>
                <span>Guardar Cambios</span>
              </button>
            </p>
          </div>
        </div>

        <!-- Botones para días especiales -->
        <div class="box mt-4">
          <div class="columns">
            <div class="column">
              <div class="special-day-card">
                <h4 class="title is-5 mb-2">Marcar Día como Festivo</h4>
                <p class="help mb-3">Esto aplicará la configuración de fin de semana para el día de hoy</p>
                <button class="button is-warning is-fullwidth" @click="markTodayAsHoliday">
                  <span class="icon"><i class="fas fa-calendar-plus"></i></span>
                  <span>Marcar como Festivo</span>
                </button>
              </div>
            </div>
            <div class="column">
              <div class="special-day-card">
                <h4 class="title is-5 mb-2">Marcar Día como Personalizado</h4>
                <p class="help mb-3">Esto permitirá configurar un horario especial para el día de hoy</p>
                <button class="button is-info is-fullwidth" @click="markTodayAsCustom">
                  <span class="icon"><i class="fas fa-calendar-alt"></i></span>
                  <span>Marcar como Personalizado</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import pb from '@/services/pocketbase'
import { useNotification } from '@/composables/useNotification'

export default {
  name: 'TVScheduleAdmin',
  setup() {
    const { showNotification } = useNotification()
    const tvs = ref([])
    const selectedTV = ref(null)
    const selectedScheduleType = ref(null)
    const scheduleTypes = ref([])
    const customDate = ref('')
    const timeSlots = ref([])
    const availableViews = ref([])

    // Generar opciones de tiempo (cada 30 minutos)
    const generateTimeOptions = () => {
      const options = []
      for (let hour = 0; hour < 24; hour++) {
        for (let minute of ['00', '30']) {
          const time = `${hour.toString().padStart(2, '0')}:${minute}`
          options.push(time)
        }
      }
      return options
    }

    const timeOptions = generateTimeOptions()

    // Cargar TVs, vistas y tipos de horario disponibles
    const loadData = async () => {
      try {
        const [tvAssignments, views, types] = await Promise.all([
          pb.collection('tv_assignments').getFullList(),
          pb.collection('views').getFullList(),
          pb.collection('schedule_types').getFullList({
            sort: '-is_default'
          })
        ])
        
        tvs.value = tvAssignments.map(tv => ({ id: tv.tv_id }))
        availableViews.value = views
        scheduleTypes.value = types
        
        // Seleccionar el tipo por defecto o el primero disponible
        const defaultType = types.find(t => t.is_default) || types[0]
        if (defaultType) {
          selectedScheduleType.value = defaultType.id
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    // Observar cambios en el tipo de horario seleccionado
    watch(selectedScheduleType, (newValue, oldValue) => {
      if (newValue !== oldValue && selectedTV.value) {
        // Limpiar las franjas horarias antes de cargar las nuevas
        timeSlots.value = []
        // Cargar los horarios del nuevo tipo
        loadSchedule(selectedTV.value)
      }
    })

    // Cargar horarios para una TV específica
    const loadSchedule = async (tvId) => {
      try {
        timeSlots.value = [] // Limpiar las franjas antes de cargar
        
        let filter = `tv_id = "${tvId}" && schedule_type = "${selectedScheduleType.value}"`
        if (customDate.value) {
          filter += ` && specific_date = "${customDate.value}"`
        }
        
        const schedules = await pb.collection('tv_schedules').getFullList({
          filter: filter,
          sort: 'start_time',
          expand: 'schedule_type'
        })
        
        if (schedules.length > 0) {
          timeSlots.value = schedules.map(schedule => ({
            startTime: schedule.start_time,
            endTime: schedule.end_time,
            views: schedule.assigned_views,
            isActive: schedule.is_active
          }))
        }
        
        console.log(`Cargados ${schedules.length} horarios para TV ${tvId} y tipo ${selectedScheduleType.value}`)
      } catch (error) {
        console.error('Error loading schedule:', error)
        timeSlots.value = []
      }
    }

    // También observar cambios en la fecha personalizada
    watch(customDate, (newValue, oldValue) => {
      if (newValue !== oldValue && selectedTV.value) {
        // Limpiar las franjas horarias antes de cargar las nuevas
        timeSlots.value = []
        // Cargar los horarios de la nueva fecha
        loadSchedule(selectedTV.value)
      }
    })

    const selectTV = (tvId) => {
      selectedTV.value = tvId
      loadSchedule(tvId)
    }

    const addTimeSlot = () => {
      timeSlots.value.push({
        startTime: '09:00',
        endTime: '10:00',
        views: [],
        isActive: true
      })
    }

    const removeTimeSlot = (index) => {
      timeSlots.value.splice(index, 1)
    }

    const saveSchedule = async () => {
      try {
        // Validar que no haya solapamientos
        if (!validateTimeSlots()) {
          showNotification({
            message: 'Hay franjas horarias que se solapan. Por favor, revisa los horarios.',
            type: 'is-danger'
          })
          return
        }

        // Primero eliminamos los horarios existentes
        const existingSchedules = await pb.collection('tv_schedules').getFullList({
          filter: `tv_id = "${selectedTV.value}" && schedule_type = "${selectedScheduleType.value}"`
        })
        
        for (const schedule of existingSchedules) {
          await pb.collection('tv_schedules').delete(schedule.id)
        }

        // Luego creamos los nuevos horarios
        for (const slot of timeSlots.value) {
          if (slot.views.length === 0) continue // Saltamos slots sin vistas asignadas
          
          await pb.collection('tv_schedules').create({
            tv_id: selectedTV.value,
            schedule_type: selectedScheduleType.value,
            start_time: slot.startTime,
            end_time: slot.endTime,
            assigned_views: slot.views,
            is_active: slot.isActive,
            specific_date: customDate.value || null
          })
        }

        showNotification({
          message: 'Horarios guardados correctamente',
          type: 'is-success'
        })
      } catch (error) {
        console.error('Error saving schedule:', error)
        showNotification({
          message: 'Error al guardar los horarios: ' + error.message,
          type: 'is-danger'
        })
      }
    }

    const validateTimeSlots = () => {
      const slots = timeSlots.value.slice().sort((a, b) => a.startTime.localeCompare(b.startTime))
      
      for (let i = 0; i < slots.length - 1; i++) {
        if (slots[i].endTime > slots[i + 1].startTime) {
          return false
        }
      }
      return true
    }

    const markTodayAsCustom = async () => {
      const today = new Date().toISOString().split('T')[0]
      customDate.value = today
      const customType = scheduleTypes.value.find(t => t.name.toLowerCase() === 'custom')
      if (customType) {
        selectedScheduleType.value = customType.id
        timeSlots.value = []
      } else {
        showNotification({
          message: 'No se encontró el tipo de horario personalizado',
          type: 'is-warning'
        })
      }
    }

    const markTodayAsHoliday = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        await pb.collection('holiday_dates').create({
          date: today,
          description: 'Festivo local'
        })
        showNotification({
          message: 'Día marcado como festivo correctamente',
          type: 'is-success'
        })
      } catch (error) {
        console.error('Error marking holiday:', error)
        showNotification({
          message: 'Error al marcar el día como festivo: ' + error.message,
          type: 'is-danger'
        })
      }
    }

    const formatViewName = (name) => {
      return name.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    }

    const toggleView = (slot, viewId) => {
      if (slot.views.includes(viewId)) {
        slot.views = slot.views.filter(id => id !== viewId)
      } else {
        slot.views.push(viewId)
      }
    }

    const getScheduleTypeName = (typeId) => {
      const type = scheduleTypes.value.find(t => t.id === typeId)
      return type ? type.name : ''
    }

    const getScheduleTypeLabel = (type) => {
      switch (type.name.toLowerCase()) {
        case 'workday':
          return 'Día Laboral (Lunes-Viernes)'
        case 'weekend':
          return 'Fin de Semana (Sábado)'
        case 'custom':
          return 'Día Personalizado'
        default:
          return type.name
      }
    }

    onMounted(() => {
      loadData()
    })

    return {
      tvs,
      selectedTV,
      selectedScheduleType,
      scheduleTypes,
      customDate,
      timeSlots,
      availableViews,
      timeOptions,
      selectTV,
      addTimeSlot,
      removeTimeSlot,
      saveSchedule,
      markTodayAsHoliday,
      markTodayAsCustom,
      toggleView,
      formatViewName,
      getScheduleTypeName,
      getScheduleTypeLabel
    }
  }
}
</script>

<style scoped>
.tv-list {
  background-color: rgba(30, 30, 30, 0.8);
}

.tv-item {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tv-item:hover {
  background-color: rgba(212, 175, 55, 0.1);
}

.tv-item.is-active {
  background-color: rgba(212, 175, 55, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.schedule-panel {
  background-color: rgba(30, 30, 30, 0.8);
}

.schedule-slots {
  margin-top: 2rem;
}

.schedule-slot {
  background-color: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
}

.select[multiple] select {
  height: auto;
  max-height: 8rem;
  background-color: rgba(255, 255, 255, 0.1);
}

.label.is-small {
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.views-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  background-color: rgba(18, 18, 18, 0.5);
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.view-button {
  display: flex;
  align-items: center;
  background-color: rgba(30, 30, 30, 0.7);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #e0e0e0;
  width: 100%;
  text-align: left;
}

.view-button:hover {
  background-color: rgba(212, 175, 55, 0.1);
  transform: translateY(-1px);
}

.view-button.is-selected {
  background-color: rgba(212, 175, 55, 0.15);
  border: 1px solid rgba(212, 175, 55, 0.4);
  box-shadow: 0 2px 4px rgba(212, 175, 55, 0.1);
}

.view-button .icon {
  margin-right: 0.5rem;
  color: #888;
  transition: all 0.3s ease;
}

.view-button.is-selected .icon {
  color: #d4af37;
}

.view-button span:not(.icon) {
  flex: 1;
  font-size: 0.9rem;
}

.special-day-card {
  background-color: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 4px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.special-day-card .help {
  color: #888;
}

.navigation-box {
  background-color: rgba(30, 30, 30, 0.8);
}

.level {
  align-items: center;
}

@media (max-width: 768px) {
  .views-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style> 