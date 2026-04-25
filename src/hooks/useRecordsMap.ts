import { useCallback, useEffect, useState } from 'react'
import { subscribeToGardenTables } from '../lib/realtime'
import type { RecordsMap } from '../types'
import { readRecordsMap } from '../utils/localStorage'

export function useRecordsMap() {
  const [recordsMap, setRecordsMap] = useState<RecordsMap>({
    workers: [],
    foods: [],
    fertilizers: [],
    transports: [],
    energies: [],
    oils: [],
    remonts: [],
    taxes: [],
    drainages: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)

    try {
      const nextRecordsMap = await readRecordsMap()
      setRecordsMap(nextRecordsMap)
      setError(null)
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Ma\'lumotlarni yuklab bo\'lmadi.')
    } finally {
      setLoading(false)
    }
  }, [])

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
          channelKey: 'xons-records-map',
          tables: [
            'worker_expenses',
            'food_expenses',
            'fertilizer_expenses',
            'transport_expenses',
            'energy_expenses',
            'oil_expenses',
            'remont_expenses',
            'tax_expenses',
            'drainage_expenses',
          ],
          onChange: async () => {
            if (!isMounted) {
              return
            }

            try {
              const nextRecordsMap = await readRecordsMap()

              if (isMounted) {
                setRecordsMap(nextRecordsMap)
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
    recordsMap,
    loading,
    error,
    refresh,
  }
}
