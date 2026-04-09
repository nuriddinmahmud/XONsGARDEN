import { useEffect, useState } from 'react'
import { STORAGE_SYNC_EVENT } from '../constants/storageKeys'
import type { RecordsMap } from '../types'
import { readRecordsMap } from '../utils/localStorage'

export function useRecordsMap() {
  const [recordsMap, setRecordsMap] = useState<RecordsMap>(() => readRecordsMap())

  useEffect(() => {
    const sync = () => {
      setRecordsMap(readRecordsMap())
    }

    window.addEventListener(STORAGE_SYNC_EVENT, sync)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener(STORAGE_SYNC_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return recordsMap
}
