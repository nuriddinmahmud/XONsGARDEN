export interface IncomeRecord {
  id: string
  amount: number
  reason: string
  date: string
  sourceLocation?: string
  comment?: string
  createdAt?: string
}
