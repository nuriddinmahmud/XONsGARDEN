import { useCallback, useEffect, useState } from 'react'
import { subscribeToGardenTables } from '../lib/realtime'
import type { EntityKey, EntityRecord } from '../types'
import { deleteCollectionRecord, readCollection, saveCollection } from '../utils/localStorage'

const entityRealtimeTables: Record<EntityKey, Parameters<typeof subscribeToGardenTables>[0]['tables'][number]> = {
  workers: 'worker_expenses',
  foods: 'food_expenses',
  fertilizers: 'fertilizer_expenses',
  transports: 'transport_expenses',
  energies: 'energy_expenses',
  oils: 'oil_expenses',
  remonts: 'remont_expenses',
  taxes: 'tax_expenses',
  drainages: 'drainage_expenses',
}

export function useCrudCollection<T extends EntityRecord>(storageKey: EntityKey) {
  const [records, setRecords] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)

    try {
      const nextRecords = await readCollection<T>(storageKey)
      setRecords(nextRecords)
      setError(null)
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Ma\'lumotlarni yuklab bo\'lmadi.')
    } finally {
      setLoading(false)
    }
  }, [storageKey])

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
          channelKey: `xons-${storageKey}`,
          tables: [entityRealtimeTables[storageKey]],
          onChange: async () => {
            if (!isMounted) {
              return
            }

            try {
              const nextRecords = await readCollection<T>(storageKey)

              if (isMounted) {
                setRecords(nextRecords)
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
  }, [refresh, storageKey])

  const saveRecord = async (record: T) => {
    const savedRecord = await saveCollection<T>(storageKey, record)

    setRecords((current) => {
      const exists = current.some((item) => item.id === record.id)
      if (exists) {
        return current.map((item) => (item.id === record.id ? savedRecord : item))
      }

      return [savedRecord, ...current]
    })

    setError(null)
    return savedRecord
  }

  const deleteRecord = async (id: string) => {
    await deleteCollectionRecord(storageKey, id)
    setRecords((current) => current.filter((item) => item.id !== id))
    setError(null)
  }

  return {
    records,
    saveRecord,
    deleteRecord,
    setRecords,
    refresh,
    loading,
    error,
  }
}
