/**
 * Config del evento — nombre editable por admin, visible público.
 *
 * Fuente: endpoint público GET /api/config, admin PUT /api/admin/config.
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { createApiClient } from '@/api/client'
import { createLogger } from '@/utils/logger'

const log = createLogger('configStore')

interface ConfigResponse {
  event_name: string
}

export const useConfigStore = defineStore('config', () => {
  const eventName = ref<string>('Evento')
  const loading = ref(false)
  const loaded = ref(false)

  async function loadConfig() {
    if (loading.value) return
    loading.value = true
    try {
      const api = createApiClient()
      const data = await api.get<ConfigResponse>('/api/config')
      eventName.value = data.event_name
      loaded.value = true
    } catch (err) {
      log.error('Failed to load event config', err)
    } finally {
      loading.value = false
    }
  }

  async function updateEventName(
    name: string,
    authToken: string | null,
  ): Promise<{ ok: boolean; message?: string }> {
    try {
      const api = createApiClient({ authToken: authToken ?? undefined })
      const data = await api.put<ConfigResponse>('/api/admin/config', {
        event_name: name,
      })
      eventName.value = data.event_name
      return { ok: true }
    } catch (err) {
      log.error('Failed to update event name', err)
      const message = err instanceof Error ? err.message : 'Error desconocido'
      return { ok: false, message }
    }
  }

  return { eventName, loading, loaded, loadConfig, updateEventName }
})
