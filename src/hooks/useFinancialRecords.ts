import { useCallback, useEffect, useState } from 'react'
import { subscribeToGardenTables } from '../lib/realtime'
import type { DebtRecord } from '../types/debt'
import type { IncomeRecord } from '../types/income'
import { readDebts } from '../utils/debtStorage'
import { readIncomeRecords } from '../utils/incomeStorage'
import { useRecordsMap } from './useRecordsMap'

export function useFinancialRecords() {
  const {
    recordsMap,
    loading: recordsMapLoading,
    error: recordsMapError,
    refresh: refreshRecordsMap,
  } = useRecordsMap()
  const [debts, setDebts] = useState<DebtRecord[]>([])
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)

    try {
      const [nextDebts, nextIncomeRecords] = await Promise.all([readDebts(), readIncomeRecords()])
      setDebts(nextDebts)
      setIncomeRecords(nextIncomeRecords)
      setError(null)
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Moliyaviy ma\'lumotlarni yuklab bo\'lmadi.')
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
          channelKey: 'xons-financial-records',
          tables: ['income_records', 'debt_records'],
          onChange: async () => {
            if (!isMounted) {
              return
            }

            try {
              const [nextDebts, nextIncomeRecords] = await Promise.all([
                readDebts(),
                readIncomeRecords(),
              ])

              if (isMounted) {
                setDebts(nextDebts)
                setIncomeRecords(nextIncomeRecords)
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
    debts,
    incomeRecords,
    loading: loading || recordsMapLoading,
    error: error ?? recordsMapError,
    refresh: async () => {
      await Promise.all([refresh(), refreshRecordsMap()])
    },
  }
}
