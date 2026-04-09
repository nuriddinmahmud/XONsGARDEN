import { useEffect, useState } from 'react'
import { STORAGE_SYNC_EVENT } from '../constants/storageKeys'
import type { EntityKey } from '../types'
import { readCollection, writeCollection } from '../utils/localStorage'

export function useCrudCollection<T extends { id: string }>(storageKey: EntityKey) {
  const [records, setRecords] = useState<T[]>(() => readCollection<T>(storageKey))

  useEffect(() => {
    writeCollection(storageKey, records)
  }, [records, storageKey])

  useEffect(() => {
    const sync = (event?: Event) => {
      const customEvent = event as CustomEvent<{ key?: string }> | undefined
      if (customEvent?.detail?.key && customEvent.detail.key !== storageKey) {
        return
      }

      setRecords(readCollection<T>(storageKey))
    }

    window.addEventListener(STORAGE_SYNC_EVENT, sync as EventListener)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener(STORAGE_SYNC_EVENT, sync as EventListener)
      window.removeEventListener('storage', sync)
    }
  }, [storageKey])

  const saveRecord = (record: T) => {
    setRecords((current) => {
      const exists = current.some((item) => item.id === record.id)
      if (exists) {
        return current.map((item) => (item.id === record.id ? record : item))
      }

      return [record, ...current]
    })
  }

  const deleteRecord = (id: string) => {
    setRecords((current) => current.filter((item) => item.id !== id))
  }

  return {
    records,
    saveRecord,
    deleteRecord,
    setRecords,
  }
}
