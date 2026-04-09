export function formatDate(date: string) {
  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return "Sana noto'g'ri"
  }

  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(parsed)
}

export function formatShortDate(date: string) {
  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return "Sana yo'q"
  }

  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: 'short',
  }).format(parsed)
}

export function formatMonthLabel(date: string) {
  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) {
    return "Noma'lum"
  }

  return new Intl.DateTimeFormat('uz-UZ', {
    month: 'long',
    year: 'numeric',
  }).format(parsed)
}

export function formatCurrency(amount: number, currencyLabel = "so'm") {
  return `${new Intl.NumberFormat('uz-UZ').format(Math.round(amount))} ${currencyLabel}`
}
