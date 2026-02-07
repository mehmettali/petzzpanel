// ============================================
// PETZZ PANEL - MERKEZİ YARDIMCI FONKSİYONLAR
// Tüm projede kullanılan ortak utility fonksiyonları
// ============================================

/**
 * Fiyatı Türk Lirası formatında gösterir
 * @param {number} price - Fiyat değeri
 * @param {boolean} showDecimal - Kuruş gösterilsin mi (varsayılan: false)
 * @returns {string} Formatlanmış fiyat (örn: ₺1.250)
 */
export const formatPrice = (price, showDecimal = false) => {
  if (!price && price !== 0) return '₺0'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: showDecimal ? 2 : 0,
    maximumFractionDigits: showDecimal ? 2 : 0,
  }).format(price)
}

/**
 * İndirim yüzdesini hesaplar
 * @param {number} oldPrice - Eski fiyat
 * @param {number} newPrice - Yeni fiyat
 * @returns {number} İndirim yüzdesi (örn: 25)
 */
export const calculateDiscount = (oldPrice, newPrice) => {
  if (!oldPrice || !newPrice || oldPrice <= newPrice) return 0
  return Math.round(((oldPrice - newPrice) / oldPrice) * 100)
}

/**
 * Metni URL-friendly slug'a çevirir
 * @param {string} text - Çevrilecek metin
 * @returns {string} Slug (örn: "kedi-mamasi")
 */
export const slugify = (text) => {
  if (!text) return ''
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[üÜ]/g, 'u')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c')
    .replace(/[şŞ]/g, 's')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[ıİ]/g, 'i')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Metni kısaltır ve ... ekler
 * @param {string} text - Metin
 * @param {number} maxLength - Maksimum karakter sayısı
 * @returns {string} Kısaltılmış metin
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Sayıyı kısaltılmış formatta gösterir (1K, 1M, vb.)
 * @param {number} num - Sayı
 * @returns {string} Kısaltılmış sayı
 */
export const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'K'
  return num.toString()
}

/**
 * Tarih formatlama
 * @param {string|Date} date - Tarih
 * @param {string} format - Format tipi: 'short', 'long', 'relative'
 * @returns {string} Formatlanmış tarih
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return ''
  const d = new Date(date)

  if (format === 'relative') {
    const now = new Date()
    const diff = now - d
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Az önce'
    if (minutes < 60) return `${minutes} dakika önce`
    if (hours < 24) return `${hours} saat önce`
    if (days < 7) return `${days} gün önce`
  }

  if (format === 'long') {
    return d.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * Stok durumu metni
 * @param {number} stock - Stok sayısı
 * @returns {object} { text, color, icon }
 */
export const getStockStatus = (stock) => {
  if (!stock || stock <= 0) {
    return { text: 'Stokta Yok', color: 'red', available: false }
  }
  if (stock <= 5) {
    return { text: `Son ${stock} ürün!`, color: 'orange', available: true }
  }
  if (stock <= 20) {
    return { text: 'Sınırlı Stok', color: 'yellow', available: true }
  }
  return { text: 'Stokta', color: 'green', available: true }
}

/**
 * Debounce fonksiyonu
 * @param {Function} func - Çalıştırılacak fonksiyon
 * @param {number} wait - Bekleme süresi (ms)
 * @returns {Function} Debounced fonksiyon
 */
export const debounce = (func, wait = 300) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * localStorage'dan güvenli okuma
 * @param {string} key - Anahtar
 * @param {*} defaultValue - Varsayılan değer
 * @returns {*} Değer
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * localStorage'a güvenli yazma
 * @param {string} key - Anahtar
 * @param {*} value - Değer
 */
export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn('localStorage yazma hatası:', e)
  }
}

export default {
  formatPrice,
  calculateDiscount,
  slugify,
  truncateText,
  formatNumber,
  formatDate,
  getStockStatus,
  debounce,
  getFromStorage,
  setToStorage,
}
