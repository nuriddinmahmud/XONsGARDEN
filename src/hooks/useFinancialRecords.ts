import { useEffect, useState } from 'react'
import { STORAGE_KEYS, STORAGE_SYNC_EVENT } from '../constants/storageKeys'
import type { DebtRecord } from '../types/debt'
import type { IncomeRecord } from '../types/income'
import { readDebts } from '../utils/debtStorage'
import { readIncomeRecords } from '../utils/incomeStorage'
import { useRecordsMap } from './useRecordsMap'

export function useFinancialRecords() {
  const recordsMap = useRecordsMap()
  const [debts, setDebts] = useState<DebtRecord[]>(() => readDebts())
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>(() => readIncomeRecords())

  useEffect(() => {
    const sync = (event?: Event) => {
      const customEvent = event as CustomEvent<{ key?: string }> | undefined

      if (
        customEvent?.detail?.key &&
        customEvent.detail.key !== STORAGE_KEYS.xonsgarden_debts &&
        customEvent.detail.key !== STORAGE_KEYS.xonsgarden_income
      ) {
        return
      }

      setDebts(readDebts())
      setIncomeRecords(readIncomeRecords())
    }

    window.addEventListener(STORAGE_SYNC_EVENT, sync as EventListener)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener(STORAGE_SYNC_EVENT, sync as EventListener)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return {
    recordsMap,
    debts,
    incomeRecords,
  }
}
