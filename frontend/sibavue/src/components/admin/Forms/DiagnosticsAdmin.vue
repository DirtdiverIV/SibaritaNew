<template>
    <div>
      <h2>Diagnóstico de Permisos y Operaciones</h2>
      <p>
        Pulsa el botón para comprobar <strong>list, create, update y delete</strong>
        de cada colección:
      </p>
      <button @click="runDiagnostics">Ejecutar diagnóstico</button>
  
      <table>
        <thead>
          <tr>
            <th>Colección</th>
            <th>List</th>
            <th>Create</th>
            <th>Update</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="diag in diagnostics" :key="diag.collection">
            <td>{{ diag.collection }}</td>
            <td>{{ diag.listStatus }}</td>
            <td>{{ diag.createStatus }}</td>
            <td>{{ diag.updateStatus }}</td>
            <td>{{ diag.deleteStatus }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue'
  import pb from '@/services/pocketbase.js'
  
  export default {
    name: 'DiagnosticsAdmin',
  
    setup() {
      // Colecciones a testear:
      const collectionsToTest = [
        'config',
        'tv_assignments',
        'views',
        'platos',
        'menu_dia',
        'menu_dia_primeros',
        'menu_dia_segundos',
        'menu_dia_postres',
        'menus_evento',
        'eventos',
      ]
  
      const diagnostics = ref([])
  
      // -- Función auxiliar: crea o busca un menu_dia dummy para enlazar subcolecciones --
      const menuDiaDiagnosticId = ref(null)
      const getOrCreateDiagnosticMenuDia = async () => {
        // Si ya lo tenemos, usamos el mismo
        if (menuDiaDiagnosticId.value) return menuDiaDiagnosticId.value
  
        // 1) Buscar si existe un "Menú día diag" para reusarlo
        try {
          const existing = await pb.collection('menu_dia').getFirstListItem('nombre = "Menú día diag"')
          menuDiaDiagnosticId.value = existing.id
          return existing.id
        } catch (err) {
          // no existe, lo creamos
        }
  
        // 2) Crear uno
        const created = await pb.collection('menu_dia').create({
          nombre: 'Menú día diag',
          precio: 9.99,
        })
        menuDiaDiagnosticId.value = created.id
        return created.id
      }
  
      // Datos "dummy" para cada colección:
      const dummyDataForCollection = async (col) => {
        switch (col) {
          case 'config':
            return {
              rotacion_escena_segundos: 999,
            }
  
          case 'tv_assignments':
            return {
              tv_id: 'diag-' + Math.random().toString(36).substr(2, 5),
              assigned_views: []
            }
  
          case 'views':
            return {
              view_name: 'diag_view_' + Math.random().toString(36).substr(2, 5),
            }
  
          case 'platos':
            // Ajustado a tu schema: nombre, precio, precio_medio, categoria...
            return {
              nombre: 'diagnostic_plato',
              precio: 1.99,        // O "price" si tu schema lo pide
              precio_medio: 0.99,  // O quita si no existe
              categoria: 'diagnostic',
              descripcion: 'test create'
            }
  
          case 'menu_dia':
            return {
              nombre: 'Menú test diag',
              precio: 9.99
            }
  
          case 'menu_dia_primeros':
          case 'menu_dia_segundos':
          case 'menu_dia_postres': {
            // Subcolección que requiere un menu_dia "field"
            const mdId = await getOrCreateDiagnosticMenuDia()
            return {
              nombre: `Subcol ${col} diag`,
              descripcion: 'test subcol',
              // Ajusta el nombre del campo relation si no se llama "field"
              field: mdId
            }
          }
  
          case 'menus_evento':
            return {
              nombre: 'Menú evento diag',
              precio: 29.99
            }
  
          case 'eventos':
            return {
              titulo: 'Evento diag',
              descripcion: 'probando create',
              precio_desde: 10
            }
  
          default:
            return { testField: 'diagnostic' }
        }
      }
  
      const runDiagnostics = async () => {
        diagnostics.value = []
  
        for (const col of collectionsToTest) {
          const result = {
            collection: col,
            listStatus: 'N/A',
            createStatus: 'N/A',
            updateStatus: 'N/A',
            deleteStatus: 'N/A',
          }
  
          // 1) List
          try {
            await pb.collection(col).getFullList({ limit: 1 })
            result.listStatus = 'OK'
          } catch (err) {
            result.listStatus = formatError(err)
          }
  
          // 2) Create
          let createdId = null
          try {
            const createData = await dummyDataForCollection(col)
            const record = await pb.collection(col).create(createData)
            createdId = record.id
            result.createStatus = 'OK'
          } catch (err) {
            result.createStatus = formatError(err)
          }
  
          // 3) Update (si create fue OK)
          if (createdId) {
            try {
              await pb.collection(col).update(createdId, { testField: 'diagnostic update' })
              result.updateStatus = 'OK'
            } catch (err) {
              result.updateStatus = formatError(err)
            }
          }
  
          // 4) Delete (si create fue OK)
          if (createdId) {
            try {
              await pb.collection(col).delete(createdId)
              result.deleteStatus = 'OK'
            } catch (err) {
              result.deleteStatus = formatError(err)
            }
          }
  
          diagnostics.value.push(result)
        }
      }
  
      // Helper: formatea errores en "Status - Mensaje"
      const formatError = (err) => {
        if (!err) return 'Error desconocido'
        if (err.status) {
          return `${err.status} - ${err.message}`
        }
        return err.message || 'Error'
      }
  
      return {
        diagnostics,
        runDiagnostics
      }
    }
  }
  </script>
  
  <style scoped>
  table {
    border-collapse: collapse;
    width: 100%;
    margin-top: 1rem;
  }
  th, td {
    border: 1px solid #ccc;
    padding: 0.5rem;
    text-align: center;
  }
  </style>
  