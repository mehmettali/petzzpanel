// ============================================
// MAKCOOP KURUMSAL RENK PALETİ - PETZZSHOP
// Tüm projede kullanılan merkezi renk tanımları
// ============================================

export const COLORS = {
  // ==================== ANA KURUMSAL RENKLER ====================
  turuncu: '#EF7F1A',      // Ana turuncu (RGB: 239, 127, 26)
  dipSarisi: '#FECC00',    // Dip sarısı (RGB: 254, 204, 0)
  kahverengi: '#492D2B',   // Kahverengi (RGB: 73, 45, 43)

  // ==================== TÜRETİLMİŞ RENKLER ====================
  turuncuLight: '#F99D4B', // Açık turuncu
  turuncuDark: '#D66A0F',  // Koyu turuncu
  kahveLight: '#6B4744',   // Açık kahve

  // ==================== ARKA PLAN RENKLERİ ====================
  bgLight: '#FFF9F0',      // Açık krem arka plan
  bgLightAlt: '#FFF5EB',   // Alternatif açık arka plan
  bgOrange: '#FEF3E7',     // Turuncu tonlu arka plan

  // ==================== FONKSİYONEL RENKLER ====================
  success: '#2ea571',      // Yeşil (başarı, stok var)
  danger: '#e22b1b',       // Kırmızı (hata, indirim)
  warning: '#f59e0b',      // Sarı (uyarı)
  info: '#3b82f6',         // Mavi (bilgi)

  // ==================== NÖTR RENKLER ====================
  textDark: '#492D2B',     // Koyu text (kahverengi ile aynı)
  textGray: '#727276',     // Gri text
  textLight: '#9c9c9f',    // Açık gri text
  borderLight: '#e5e5e5',  // Açık border
  borderDark: '#d1d1d1',   // Koyu border

  // ==================== ALIAS (Geriye uyumluluk) ====================
  sari: '#FECC00',         // dipSarisi ile aynı
  primary: '#EF7F1A',      // turuncu ile aynı
  secondary: '#492D2B',    // kahverengi ile aynı
  accent: '#FECC00',       // dipSarisi ile aynı
}

// ==================== GRADIENT TANIMLARI ====================
export const GRADIENTS = {
  primaryGradient: 'linear-gradient(to right, #EF7F1A, #D66A0F)',
  heroGradient: 'linear-gradient(to right, #EF7F1A, #F99D4B, #FECC00)',
  darkGradient: 'linear-gradient(to right, #492D2B, #6B4744)',
}

// ==================== TAILWIND SINIF YARDIMCILARI ====================
export const TW = {
  // Arka plan sınıfları
  bgPrimary: 'bg-[#EF7F1A]',
  bgSecondary: 'bg-[#492D2B]',
  bgAccent: 'bg-[#FECC00]',
  bgLight: 'bg-[#FFF9F0]',

  // Text sınıfları
  textPrimary: 'text-[#EF7F1A]',
  textSecondary: 'text-[#492D2B]',
  textAccent: 'text-[#FECC00]',

  // Border sınıfları
  borderPrimary: 'border-[#EF7F1A]',
  borderSecondary: 'border-[#492D2B]',

  // Hover sınıfları
  hoverPrimary: 'hover:bg-[#D66A0F]',
  hoverText: 'hover:text-[#EF7F1A]',
}

export default COLORS
