import { useEffect, useState } from 'react'
import { STORAGE_KEYS, STORAGE_SYNC_EVENT } from '../constants/storageKeys'
import type { AppSettings } from '../types'
import { readSettings } from '../utils/localStorage'

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => readSettings())

  useEffect(() => {
    const sync = (event?: Event) => {
      const customEvent = event as CustomEvent<{ key?: string }> | undefined
      if (customEvent?.detail?.key && customEvent.detail.key !== STORAGE_KEYS.settings) {
        return
      }

      setSettings(readSettings())
    }

    window.addEventListener(STORAGE_SYNC_EVENT, sync as EventListener)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener(STORAGE_SYNC_EVENT, sync as EventListener)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return settings
}
