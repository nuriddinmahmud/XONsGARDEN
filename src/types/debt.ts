export type DebtStatus = "to'lanmagan" | "qisman to'langan" | "to'langan"

export interface DebtRecord {
  id: string
  personOrCompany: string
  category: string
  reason: string
  amount: number
  date: string
  dueDate: string
  status: DebtStatus
  phone?: string
  note?: string
}
