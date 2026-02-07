// ============================================
// PETZZ PANEL - VİTRİN FOOTER COMPONENT
// Tüm vitrin sayfalarında kullanılan footer
// ============================================

import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Truck, RotateCcw, CreditCard, Clock, Phone, Mail, MapPin } from 'lucide-react'
import { COLORS } from '../../constants/colors'
import { PETZZSHOP_CATEGORIES } from '../../data/categories'

const StorefrontFooter = memo(({ showTrustBadges = true, variant = 'full' }) => {
  return (
    <footer className="bg-[#492D2B] text-white mt-16">
      {/* Trust Badges */}
      {showTrustBadges && (
        <div className="border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Truck size={24} className="text-[#FECC00]" />
                </div>
                <div>
                  <div className="font-semibold text-sm md:text-base">Ücretsiz Kargo</div>
                  <div className="text-xs md:text-sm text-white/60">300₺ üzeri siparişlerde</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <RotateCcw size={24} className="text-[#FECC00]" />
                </div>
                <div>
                  <div className="font-semibold text-sm md:text-base">14 Gün İade</div>
                  <div className="text-xs md:text-sm text-white/60">Koşulsuz iade garantisi</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <CreditCard size={24} className="text-[#FECC00]" />
                </div>
                <div>
                  <div className="font-semibold text-sm md:text-base">Güvenli Ödeme</div>
                  <div className="text-xs md:text-sm text-white/60">256-bit SSL şifreleme</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Clock size={24} className="text-[#FECC00]" />
                </div>
                <div>
                  <div className="font-semibold text-sm md:text-base">Hızlı Teslimat</div>
                  <div className="text-xs md:text-sm text-white/60">1-3 iş günü içinde</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      {variant === 'full' && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="text-2xl font-bold mb-4">
                <span className="text-white">petzz</span>
                <span style={{ color: COLORS.dipSarisi }}>shop</span>
              </div>
              <p className="text-sm text-white/60 mb-4">
                Evcil hayvanlarınız için en kaliteli ürünler, en uygun fiyatlarla.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://facebook.com/petzzshop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com/petzzshop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://twitter.com/petzzshop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="font-bold mb-4">Kategoriler</h4>
              <ul className="space-y-2 text-sm text-white/60">
                {PETZZSHOP_CATEGORIES.map(cat => (
                  <li key={cat.id}>
                    <Link
                      to={`/kategori/${cat.slug}`}
                      className="hover:text-[#FECC00] transition-colors flex items-center gap-2"
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="font-bold mb-4">Müşteri Hizmetleri</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <a href="/sss" className="hover:text-[#FECC00] transition-colors">
                    Sıkça Sorulan Sorular
                  </a>
                </li>
                <li>
                  <a href="/siparis-takip" className="hover:text-[#FECC00] transition-colors">
                    Sipariş Takibi
                  </a>
                </li>
                <li>
                  <a href="/iade-degisim" className="hover:text-[#FECC00] transition-colors">
                    İade ve Değişim
                  </a>
                </li>
                <li>
                  <a href="/kargo-bilgileri" className="hover:text-[#FECC00] transition-colors">
                    Kargo Bilgileri
                  </a>
                </li>
                <li>
                  <a href="/gizlilik-politikasi" className="hover:text-[#FECC00] transition-colors">
                    Gizlilik Politikası
                  </a>
                </li>
                <li>
                  <a href="/kullanim-kosullari" className="hover:text-[#FECC00] transition-colors">
                    Kullanım Koşulları
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4">İletişim</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <Phone size={16} className="text-[#FECC00] flex-shrink-0" />
                  <a href="tel:08505551234" className="hover:text-[#FECC00] transition-colors">
                    0850 555 12 34
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={16} className="text-[#FECC00] flex-shrink-0" />
                  <a href="mailto:info@petzzshop.com" className="hover:text-[#FECC00] transition-colors">
                    info@petzzshop.com
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin size={16} className="text-[#FECC00] flex-shrink-0 mt-0.5" />
                  <span>Maslak, Sarıyer<br />İstanbul, Türkiye</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock size={16} className="text-[#FECC00] flex-shrink-0 mt-0.5" />
                  <span>Pazartesi - Cumartesi<br />09:00 - 18:00</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="border-t border-white/10 mt-8 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span>Ödeme Yöntemleri:</span>
                <div className="flex items-center gap-2">
                  <div className="bg-white rounded px-2 py-1">
                    <span className="text-blue-600 font-bold text-xs">VISA</span>
                  </div>
                  <div className="bg-white rounded px-2 py-1">
                    <span className="text-red-500 font-bold text-xs">MC</span>
                  </div>
                  <div className="bg-white rounded px-2 py-1">
                    <span className="text-blue-800 font-bold text-xs">TROY</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-white/60">
                <span>Güvenli alışveriş sertifikası</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-white/40">
          © {new Date().getFullYear()} Petzzshop. Tüm hakları saklıdır. MAKCOOP Grup şirketidir.
        </div>
      </div>
    </footer>
  )
})

StorefrontFooter.displayName = 'StorefrontFooter'

export default StorefrontFooter
