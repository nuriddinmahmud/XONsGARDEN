const DEFAULT_CURRENCY_LABEL = "so'm"

export function normalizeCurrencyLabel(currencyLabel?: string | null) {
  const trimmed = currencyLabel?.trim()
  return trimmed ? trimmed : DEFAULT_CURRENCY_LABEL
}

export function formatMoney(amount: number, currencyLabel?: string | null) {
  return `${new Intl.NumberFormat('uz-UZ').format(Math.round(amount))} ${normalizeCurrencyLabel(currencyLabel)}`
}

export function formatCompactMoney(amount: number, currencyLabel?: string | null) {
  return `${new Intl.NumberFormat('uz-UZ', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount)} ${normalizeCurrencyLabel(currencyLabel)}`
}
