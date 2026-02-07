import { useState, memo, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, ShoppingCart, Heart, ChevronRight, Star, Truck, Shield,
  Menu, User, X, Home, Phone, Mail, MapPin, Clock, Gift, Percent,
  ArrowRight, Package, Sparkles, TrendingUp, Award, Zap, Check
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { PETZZSHOP_CATEGORIES, SAMPLE_PRODUCTS, getProductsByCategory } from '../data/categories'
import { COLORS } from '../constants/colors'
import { formatPrice, calculateDiscount } from '../utils/helpers'
import StorefrontHeader from '../components/layout/StorefrontHeader'
import StorefrontFooter from '../components/layout/StorefrontFooter'
import ProductCard from '../components/storefront/ProductCard'
import { ProductCardSkeleton } from '../components/ui/Skeleton'

// Popüler markalar
const POPULAR_BRANDS = [
  { name: 'Royal Canin', logo: 'https://cdn.royalcanin.com/content/dam/rcmedia/royal-canin-logo.svg', slug: 'royal-canin' },
  { name: 'Pro Plan', logo: 'https://via.placeholder.com/120x60/f6f6f6/333?text=Pro+Plan', slug: 'pro-plan' },
  { name: 'Hills', logo: 'https://via.placeholder.com/120x60/f6f6f6/333?text=Hills', slug: 'hills' },
  { name: 'Acana', logo: 'https://via.placeholder.com/120x60/f6f6f6/333?text=Acana', slug: 'acana' },
  { name: 'Orijen', logo: 'https://via.placeholder.com/120x60/f6f6f6/333?text=Orijen', slug: 'orijen' },
  { name: 'Reflex', logo: 'https://via.placeholder.com/120x60/f6f6f6/333?text=Reflex', slug: 'reflex' },
]

// ==================== HERO BANNER ====================
const HeroBanner = memo(() => (
  <section className="bg-gradient-to-r from-[#EF7F1A] via-[#F99D4B] to-[#FECC00] text-white">
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1 text-sm mb-4">
            <Zap size={16} />
            Yeni Sezon Ürünleri
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Dostlarınız İçin<br />En İyi Ürünler
          </h1>
          <p className="text-lg opacity-90 mb-6">
            7.000+ ürün, 100+ marka ile evcil hayvanlarınızın tüm ihtiyaçları tek adreste.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/kategori/kedi"
              className="px-6 py-3 bg-white text-[#EF7F1A] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              🐱 Kedi Ürünleri
            </Link>
            <Link
              to="/kategori/kopek"
              className="px-6 py-3 bg-[#492D2B] text-white font-semibold rounded-lg hover:bg-[#3a2422] transition-colors"
            >
              🐕 Köpek Ürünleri
            </Link>
          </div>
        </div>
        <div className="hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&h=400&fit=crop"
            alt="Happy pets"
            className="rounded-2xl shadow-2xl"
          />
        </div>
      </div>
    </div>
  </section>
))

// ==================== FEATURES BAR ====================
const FeaturesBar = memo(() => (
  <section className="bg-white border-b">
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FFF5EB] rounded-full flex items-center justify-center">
            <Truck size={24} className="text-[#EF7F1A]" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Ücretsiz Kargo</p>
            <p className="text-sm text-gray-500">300₺ üzeri siparişlerde</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FFF5EB] rounded-full flex items-center justify-center">
            <Shield size={24} className="text-[#EF7F1A]" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Orijinal Ürün</p>
            <p className="text-sm text-gray-500">%100 Garantili</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FFF5EB] rounded-full flex items-center justify-center">
            <Clock size={24} className="text-[#EF7F1A]" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Hızlı Teslimat</p>
            <p className="text-sm text-gray-500">1-3 iş günü içinde</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FFF5EB] rounded-full flex items-center justify-center">
            <Award size={24} className="text-[#EF7F1A]" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">Güvenli Ödeme</p>
            <p className="text-sm text-gray-500">256-bit SSL şifreleme</p>
          </div>
        </div>
      </div>
    </div>
  </section>
))

// ==================== CATEGORY CARD ====================
const CategoryCard = memo(({ category }) => (
  <Link
    to={`/kategori/${category.slug}`}
    className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all"
  >
    <div className="aspect-[4/3] overflow-hidden">
      <img
        src={category.image}
        alt={category.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{category.icon}</span>
        <h3 className="text-lg font-bold">{category.shortName}</h3>
      </div>
      <p className="text-sm opacity-80">{category.description}</p>
      <div className="flex items-center gap-2 mt-2 text-sm">
        <span className="bg-white/20 px-2 py-0.5 rounded">{category.productCount.toLocaleString('tr-TR')} ürün</span>
        <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Keşfet <ChevronRight size={16} />
        </span>
      </div>
    </div>
  </Link>
))

// ==================== SECTION HEADER ====================
const SectionHeader = memo(({ title, subtitle, link, linkText }) => (
  <div className="flex items-end justify-between mb-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
    </div>
    {link && (
      <Link
        to={link}
        className="flex items-center gap-1 text-[#EF7F1A] font-medium hover:underline"
      >
        {linkText || 'Tümünü Gör'}
        <ArrowRight size={18} />
      </Link>
    )}
  </div>
))

// ==================== BRAND CAROUSEL ====================
const BrandCarousel = memo(() => (
  <section className="py-8 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4">
      <SectionHeader title="Popüler Markalar" link="/kategori/markalar" />
      <div className="flex items-center gap-8 overflow-x-auto pb-4 scrollbar-hide">
        {POPULAR_BRANDS.map(brand => (
          <Link
            key={brand.slug}
            to={`/kategori/arama?q=${brand.name}`}
            className="flex-shrink-0 bg-white rounded-xl border border-gray-200 p-6 hover:border-[#EF7F1A] hover:shadow-md transition-all"
          >
            <img
              src={brand.logo}
              alt={brand.name}
              className="h-8 w-auto object-contain grayscale hover:grayscale-0 transition-all"
              onError={(e) => {
                e.target.parentNode.innerHTML = `<span class="font-bold text-gray-600">${brand.name}</span>`
              }}
            />
          </Link>
        ))}
      </div>
    </div>
  </section>
))

// ==================== MAIN COMPONENT ====================
export default function ShopHome() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  // Cart & Favorites context
  const { addToCart, isInCart, getCartCount } = useCart()
  const { toggleFavorite, isFavorite, getFavoritesCount } = useFavorites()

  const cartCount = getCartCount()
  const favoritesCount = getFavoritesCount()

  // Get products from local sample data
  const discountedProducts = useMemo(() =>
    SAMPLE_PRODUCTS
      .filter(p => p.discount > 0)
      .sort((a, b) => b.discount - a.discount)
      .slice(0, 8),
    []
  )

  const newProducts = useMemo(() =>
    SAMPLE_PRODUCTS.slice(0, 8),
    []
  )

  const catProducts = useMemo(() =>
    getProductsByCategory('kedi', 4),
    []
  )

  const dogProducts = useMemo(() =>
    getProductsByCategory('kopek', 4),
    []
  )

  const discountedLoading = false
  const newLoading = false

  // Product card render helper
  const renderProductCard = (product) => (
    <ProductCard
      key={product.id || product.sku}
      product={product}
      onAddToCart={addToCart}
      onToggleFavorite={toggleFavorite}
      isFavorite={isFavorite(product.sku)}
      isInCart={isInCart(product.sku)}
    />
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <StorefrontHeader
        onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
        cartCount={cartCount}
        favoritesCount={favoritesCount}
      />

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-white flex flex-col">
            <div className="bg-gradient-to-r from-[#EF7F1A] to-[#D66A0F] text-white p-4 flex items-center justify-between">
              <span className="font-bold text-lg">Kategoriler</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-white/20 rounded-full">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                {PETZZSHOP_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/kategori/${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex flex-col items-center p-4 bg-[#FFF5EB] border-2 border-[#EF7F1A]/20 rounded-2xl hover:border-[#EF7F1A] transition-all"
                  >
                    <span className="text-3xl mb-2">{cat.icon}</span>
                    <span className="font-semibold text-[#492D2B]">{cat.shortName}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <HeroBanner />

      {/* Features Bar */}
      <FeaturesBar />

      {/* Categories Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader
            title="Kategoriler"
            subtitle="Evcil dostlarınız için ihtiyacınız olan her şey"
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PETZZSHOP_CATEGORIES.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Discounted Products */}
      <section className="py-12 bg-gradient-to-b from-red-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader
            title="🔥 Fırsat Ürünleri"
            subtitle="Kaçırılmayacak indirimler"
            link="/kategori/kampanyalar"
          />
          {discountedLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {discountedProducts.slice(0, 8).map(renderProductCard)}
            </div>
          )}
        </div>
      </section>

      {/* Brand Carousel */}
      <BrandCarousel />

      {/* New Products */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader
            title="✨ Yeni Ürünler"
            subtitle="En son eklenen ürünler"
            link="/kategori/yeni"
          />
          {newLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newProducts.slice(0, 8).map(renderProductCard)}
            </div>
          )}
        </div>
      </section>

      {/* Cat & Dog Products Side by Side */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Cat Products */}
            <div>
              <SectionHeader title="🐱 Kedi Ürünleri" link="/kategori/kedi" linkText="Tümü" />
              <div className="grid grid-cols-2 gap-4">
                {catProducts.slice(0, 4).map(renderProductCard)}
              </div>
            </div>
            {/* Dog Products */}
            <div>
              <SectionHeader title="🐕 Köpek Ürünleri" link="/kategori/kopek" linkText="Tümü" />
              <div className="grid grid-cols-2 gap-4">
                {dogProducts.slice(0, 4).map(renderProductCard)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-12 bg-[#492D2B] text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Fırsatlardan Haberdar Olun!</h2>
          <p className="text-gray-300 mb-6">E-bültenimize abone olun, indirimlerden ilk siz haberdar olun.</p>
          <form className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="E-posta adresiniz"
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FECC00]"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#EF7F1A] rounded-lg font-semibold hover:bg-[#D66A0F] transition-colors"
            >
              Abone Ol
            </button>
          </form>
        </div>
      </section>

      <StorefrontFooter />
    </div>
  )
}
