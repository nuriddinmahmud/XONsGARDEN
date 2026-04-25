import { useCallback, useEffect, useState } from 'react'
import { subscribeToGardenTables } from '../lib/realtime'
import type { AppSettings } from '../types'
import { readSettings, writeSettings } from '../utils/localStorage'

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    gardenName: '',
    managerName: '',
    phone: '',
    location: '',
    currencyLabel: "so'm",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)

    try {
      const nextSettings = await readSettings()
      setSettings(nextSettings)
      setError(null)
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Sozlamalarni yuklab bo\'lmadi.')
    } finally {
      setLoading(false)
    }
  }, [])

  const saveSettings = async (value: AppSettings) => {
    const nextSettings = await writeSettings(value)
    setSettings(nextSettings)
    setError(null)
    return nextSettings
  }

  useEffect(() => {
    let isMounted = true
    let unsubscribe: (() => void) | undefined

    const setup = async () => {
      await refresh()

      if (!isMounted) {
        return
      }

      try {
        unsubscribe = await subscribeToGardenTables({
          channelKey: 'xons-settings',
          tables: ['gardens'],
          onChange: async () => {
            if (!isMounted) {
              return
            }

            try {
              const nextSettings = await readSettings()

              if (isMounted) {
                setSettings(nextSettings)
                setError(null)
              }
            } catch (subscriptionError) {
              if (isMounted) {
                setError(
                  subscriptionError instanceof Error
                    ? subscriptionError.message
                    : 'Realtime sinxronizatsiya amalga oshmadi.',
                )
              }
            }
          },
        })
      } catch (subscriptionError) {
        if (isMounted) {
          setError(
            subscriptionError instanceof Error
              ? subscriptionError.message
              : 'Realtime ulanishini yaratib bo\'lmadi.',
          )
        }
      }
    }

    void setup()

    return () => {
      isMounted = false
      unsubscribe?.()
    }
  }, [refresh])

  return {
    ...settings,
    loading,
    error,
    refresh,
    saveSettings,
  }
}
