// Format currency in Turkish Lira
export function formatCurrency(value) {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(value)
}

// Format number with thousands separator
export function formatNumber(value) {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('tr-TR').format(value)
}

// Format percentage
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined) return '-'
  return `%${value.toFixed(decimals)}`
}

// Format date
export function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format relative time
export function formatRelativeTime(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Az önce'
  if (diffMins < 60) return `${diffMins} dakika önce`
  if (diffHours < 24) return `${diffHours} saat önce`
  if (diffDays < 7) return `${diffDays} gün önce`
  return formatDate(dateString)
}

// Truncate text
export function truncate(str, length = 50) {
  if (!str) return '-'
  return str.length > length ? str.substring(0, length) + '...' : str
}
