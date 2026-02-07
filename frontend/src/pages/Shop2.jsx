import { useState, useRef, useMemo, useCallback, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, ShoppingCart, ChevronRight,
  User, Menu, X, Shield, Phone, Truck, Heart,
  Star, MapPin, Mail, Home
} from 'lucide-react'
import clsx from 'clsx'
import { PETZZSHOP_CATEGORIES } from '../data/categories'
import { COLORS } from '../constants/colors'

// ============================================
// LAZY IMAGE COMPONENT
// ============================================
const LazyImage = memo(function LazyImage({ src, alt, className }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
    />
  )
})

// ============================================
// PETZZSHOP KATEGORİ YAPISI
// ONERI_CATEGORIES'den alındı
// ============================================
// ============================================
// PETZZSHOP KURUMSAL RENKLER
// ============================================
const BRAND = {
  primary: '#ffa726',      // Ana turuncu (petzzshop)
  primaryDark: '#f57c00',  // Koyu turuncu
  primaryLight: '#ffcc80', // Açık turuncu
  accent: '#d7a1a1',       // Soft pembe-kahve (petzzshop)
  secondary: '#ff7043',    // İkincil turuncu
  dark: '#37474f',         // Koyu gri (text)
  light: '#fff8e1',        // Krem arka plan
}

// Kategori renkleri - tutarlı turuncu tonları
const CAT_COLORS = {
  kedi: '#ff7043',         // Deep orange
  kopek: '#ffa726',        // Orange (ana renk)
  kus: '#ffb300',          // Amber
  balik: '#ff8a65',        // Light deep orange
  kemirgen: '#ffcc80',     // Açık turuncu
  surungan: '#f57c00',     // Koyu turuncu
}

// PETZZSHOP_CATEGORIES artık '../data/categories' dosyasından import ediliyor
// CAT_COLORS ile renk eşleştirmesi için helper:
const getCategoryColor = (categoryId) => CAT_COLORS[categoryId] || COLORS.turuncu

// Kategorilere shortName ve color ekleyen helper
const enrichedCategories = PETZZSHOP_CATEGORIES.map(cat => ({
  ...cat,
  shortName: cat.shortName || cat.name.split(' ')[0],
  color: getCategoryColor(cat.id)
}))

// Eski yerel kategori tanımı kaldırıldı (~370 satır)
// Şimdi merkezi '../data/categories' kullanılıyor
// enrichedCategories: shortName ve color eklenerek zenginleştirilmiş kategoriler


// Özel menü öğeleri
const SPECIAL_MENU_ITEMS = [
  { id: 'kampanyalar', name: 'Kampanyalar', color: '#e53935', isSpecial: true },
  { id: 'markalar', name: 'Markalar', color: BRAND.primaryDark, isSpecial: true },
]

// ============================================
// CATEGORY INDEX MAP (O(1) lookup)
// ============================================
const CATEGORY_MAP = new Map()
PETZZSHOP_CATEGORIES.forEach(cat => {
  CATEGORY_MAP.set(cat.id, cat)
})

// Popüler Ürünler
const PRODUCTS = [
  { id: 1, name: 'Royal Canin Indoor Kedi Maması 10kg', brand: 'Royal Canin', price: 1899, oldPrice: 2199, image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&h=300&fit=crop', rating: 4.9, reviews: 234 },
  { id: 2, name: 'Pro Plan Adult Köpek Maması 14kg', brand: 'Pro Plan', price: 1649, oldPrice: 1899, image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=300&h=300&fit=crop', rating: 4.8, reviews: 187 },
  { id: 3, name: 'Premium Bentonit Kedi Kumu 20L', brand: 'Catzone', price: 299, oldPrice: 379, image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300&h=300&fit=crop', rating: 4.7, reviews: 456 },
  { id: 4, name: 'Acana Grasslands Kedi Maması 5.4kg', brand: 'Acana', price: 1399, oldPrice: null, image: 'https://images.unsplash.com/photo-1615789591457-74a63395c990?w=300&h=300&fit=crop', rating: 4.9, reviews: 123 },
  { id: 5, name: "Hill's Science Diet Adult 12kg", brand: "Hill's", price: 1799, oldPrice: 2099, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&h=300&fit=crop', rating: 4.8, reviews: 345 },
  { id: 6, name: 'Orijen Six Fish Kedi Maması 5.4kg', brand: 'Orijen', price: 1599, oldPrice: null, image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=300&h=300&fit=crop', rating: 4.9, reviews: 98 },
]

// Alt kategorilerin detaylarını düzleştir
function getSubcategoryDetails(subcategory) {
  if (!subcategory.children || subcategory.children.length === 0) return []

  let details = []
  for (const child of subcategory.children) {
    if (child.children && child.children.length > 0) {
      // Alt kategorinin de çocukları varsa onları ekle
      details = [...details, child, ...child.children]
    } else {
      details.push(child)
    }
  }
  return details
}

// ============================================
// CATEGORY TAB COMPONENT (Memoized) - Petlebi yapısı, canlı renkler
// ============================================
const CategoryTab = memo(function CategoryTab({ cat, isActive, onEnter, onLeave, onClick }) {
  return (
    <div onMouseEnter={() => onEnter(cat.id)} onMouseLeave={onLeave}>
      <button
        onClick={onClick}
        className={clsx(
          "px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-[3px] transition-all",
          isActive
            ? "border-brand-400 text-brand-600 bg-brand-50"
            : "border-transparent text-gray-700 hover:text-brand-500 hover:bg-brand-50/50"
        )}
      >
        {cat.name}
      </button>
    </div>
  )
})

// ============================================
// SUBCATEGORY BUTTON (Memoized) - Canlı renkler
// ============================================
const SubcategoryButton = memo(function SubcategoryButton({ sub, isActive, onEnter, onClick }) {
  return (
    <button
      onMouseEnter={() => onEnter(sub.id)}
      onClick={onClick}
      className={clsx(
        "w-full flex items-center justify-between px-4 py-3 text-sm transition-all border-l-4",
        isActive
          ? "bg-white text-brand-600 font-semibold border-brand-400 shadow-md"
          : "text-gray-700 hover:bg-white hover:text-brand-500 border-transparent hover:border-brand-200"
      )}
    >
      <span>{sub.name}</span>
      <ChevronRight className={clsx("w-4 h-4 transition-all", isActive ? "text-brand-400 translate-x-1" : "text-gray-400")} />
    </button>
  )
})

// ============================================
// DETAIL CATEGORY BUTTON (Memoized)
// ============================================
const DetailCategoryButton = memo(function DetailCategoryButton({ detail, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-all group"
    >
      <div className="w-12 h-12 rounded-lg bg-gray-100 group-hover:bg-brand-100 flex items-center justify-center mb-2">
        <span className="text-xl">🏷️</span>
      </div>
      <span className="text-xs text-gray-700 group-hover:text-brand-600 text-center line-clamp-2">
        {detail.name}
      </span>
    </button>
  )
})

// ============================================
// HEADER COMPONENT - Petlebi Style (Optimized)
// ============================================
const Header = memo(function Header({ onMobileMenuOpen, activeMainCategory, setActiveMainCategory }) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSubCategory, setActiveSubCategory] = useState(null)
  const menuTimeout = useRef(null)

  const handleMainCategoryEnter = useCallback((catId) => {
    if (menuTimeout.current) clearTimeout(menuTimeout.current)
    setActiveMainCategory(catId)
    const cat = CATEGORY_MAP.get(catId)
    if (cat?.children?.length > 0) {
      setActiveSubCategory(cat.children[0].id)
    }
  }, [setActiveMainCategory])

  const handleMenuLeave = useCallback(() => {
    menuTimeout.current = setTimeout(() => {
      setActiveMainCategory(null)
      setActiveSubCategory(null)
    }, 150)
  }, [setActiveMainCategory])

  const handleSearch = useCallback(() => {
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`)
    }
  }, [navigate, searchTerm])

  // O(1) lookups using pre-built maps
  const activeCategory = useMemo(() =>
    CATEGORY_MAP.get(activeMainCategory),
    [activeMainCategory]
  )

  const activeSubCat = useMemo(() =>
    activeCategory?.children?.find(s => s.id === activeSubCategory),
    [activeCategory, activeSubCategory]
  )

  const subcategoryDetails = useMemo(() =>
    activeSubCat ? getSubcategoryDetails(activeSubCat) : [],
    [activeSubCat]
  )

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Top Banner - Petzzshop turuncu */}
      <div className="bg-gradient-to-r from-brand-400 to-brand-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4" />
              300₺ Üzeri Ücretsiz Kargo
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Güvenli Alışveriş
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="hover:underline">Yardım</button>
            <span>|</span>
            <button className="hover:underline">Sipariş Takibi</button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-6">
            {/* Mobile Menu Button */}
            <button onClick={onMobileMenuOpen} className="lg:hidden p-2 -ml-2">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            {/* Logo */}
            <button onClick={() => navigate('/shop2')} className="flex-shrink-0">
              <span className="text-2xl font-bold">
                <span className="text-gray-800">petzz</span>
                <span className="text-brand-500">shop</span>
              </span>
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ürün, marka veya kategori ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <button className="hidden md:flex flex-col items-center px-3 py-1 text-gray-600 hover:text-brand-500 transition-colors">
                <User className="w-5 h-5" />
                <span className="text-xs mt-0.5">Hesabım</span>
              </button>
              <button className="hidden md:flex flex-col items-center px-3 py-1 text-gray-600 hover:text-brand-500 transition-colors relative">
                <Heart className="w-5 h-5" />
                <span className="text-xs mt-0.5">Favoriler</span>
                <span className="absolute top-0 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">2</span>
              </button>
              <button className="flex flex-col items-center px-3 py-1 text-gray-600 hover:text-brand-500 transition-colors relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="text-xs mt-0.5">Sepetim</span>
                <span className="absolute top-0 right-1 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Category Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            {PETZZSHOP_CATEGORIES.map((cat) => (
              <CategoryTab
                key={cat.id}
                cat={cat}
                isActive={activeMainCategory === cat.id}
                onEnter={handleMainCategoryEnter}
                onLeave={handleMenuLeave}
                onClick={() => navigate(`/products?category=${cat.shortName}`)}
              />
            ))}
            {SPECIAL_MENU_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/products?category=${item.name}`)}
                className="px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 border-transparent transition-colors"
                style={{ color: item.color }}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mega Menu - Petlebi yapısı (sol sidebar + sağ içerik), petzzshop tasarımı */}
      {activeMainCategory && activeCategory && (
        <div
          className="absolute left-0 right-0 bg-white border-b shadow-xl z-50 transform-gpu"
          style={{ willChange: 'opacity' }}
          onMouseEnter={() => { if (menuTimeout.current) clearTimeout(menuTimeout.current) }}
          onMouseLeave={handleMenuLeave}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex min-h-[400px]">
              {/* Sol - Alt Kategoriler (Petlebi tarzı) */}
              <div className="w-72 bg-brand-50 border-r border-brand-100">
                <div className="p-4 border-b border-brand-200 bg-gradient-to-r from-brand-400 to-brand-500">
                  <h3 className="font-bold text-white">{activeCategory.name}</h3>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  {activeCategory.children.map((sub) => (
                    <SubcategoryButton
                      key={sub.id}
                      sub={sub}
                      isActive={activeSubCategory === sub.id}
                      onEnter={setActiveSubCategory}
                      onClick={() => { navigate(`/products?search=${encodeURIComponent(sub.name)}`); setActiveMainCategory(null) }}
                    />
                  ))}
                </div>
              </div>

              {/* Sağ - Detay Kategoriler (Petlebi tarzı) */}
              <div className="flex-1 p-6 max-h-[60vh] overflow-y-auto bg-white">
                {activeSubCat && (
                  <>
                    <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-brand-300">
                      <h3 className="text-lg font-bold text-gray-800">
                        {activeSubCat.name}
                      </h3>
                      <button
                        onClick={() => { navigate(`/products?search=${encodeURIComponent(activeSubCat.name)}`); setActiveMainCategory(null) }}
                        className="text-sm text-white bg-brand-400 hover:bg-brand-500 px-4 py-1.5 rounded-full font-medium transition-colors"
                      >
                        Tümünü Gör →
                      </button>
                    </div>

                    {subcategoryDetails.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {subcategoryDetails.map((detail) => (
                          <button
                            key={detail.id}
                            onClick={() => { navigate(`/products?search=${encodeURIComponent(detail.name)}`); setActiveMainCategory(null) }}
                            className="text-left p-3 rounded-lg border border-brand-100 bg-brand-50/30 hover:border-brand-300 hover:bg-brand-100 transition-all group"
                          >
                            <span className="text-sm text-gray-700 group-hover:text-brand-700 font-medium">
                              {detail.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-12">
                        <button
                          onClick={() => { navigate(`/products?search=${encodeURIComponent(activeSubCat.name)}`); setActiveMainCategory(null) }}
                          className="px-8 py-3 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 transition-colors shadow-lg"
                        >
                          {activeSubCat.name} Ürünlerini Gör
                        </button>
                      </div>
                    )}

                    {/* Alakalı Kategoriler */}
                    {activeCategory.children.length > 1 && (
                      <div className="mt-8 pt-5 border-t border-brand-100">
                        <h4 className="text-sm font-semibold text-brand-600 mb-3">Alakalı Kategoriler</h4>
                        <div className="flex flex-wrap gap-2">
                          {activeCategory.children
                            .filter(c => c.id !== activeSubCat.id)
                            .slice(0, 8)
                            .map((rel) => (
                              <button
                                key={rel.id}
                                onClick={() => { navigate(`/products?search=${encodeURIComponent(rel.name)}`); setActiveMainCategory(null) }}
                                className="px-4 py-2 bg-brand-100 hover:bg-brand-400 hover:text-white rounded-full text-sm text-brand-700 font-medium transition-colors"
                              >
                                {rel.name}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
})

// ============================================
// CATEGORY ICONS for Mobile
// ============================================
const MOBILE_CAT_ICONS = {
  kedi: { emoji: '🐱', bg: 'bg-orange-100', color: 'text-orange-600' },
  kopek: { emoji: '🐕', bg: 'bg-blue-100', color: 'text-blue-600' },
  kus: { emoji: '🐦', bg: 'bg-green-100', color: 'text-green-600' },
  balik: { emoji: '🐠', bg: 'bg-cyan-100', color: 'text-cyan-600' },
  kemirgen: { emoji: '🐹', bg: 'bg-amber-100', color: 'text-amber-600' },
  surungan: { emoji: '🦎', bg: 'bg-purple-100', color: 'text-purple-600' },
}

// ============================================
// MOBILE MENU - Yeni Nesil Step-by-Step Navigation
// ============================================
const MobileMenu = memo(function MobileMenu({ isOpen, onClose }) {
  const navigate = useNavigate()
  // Navigation state: null = ana menü, {cat} = alt kategoriler, {cat, sub} = detaylar
  const [navState, setNavState] = useState({ level: 0, cat: null, sub: null })

  // Reset on close
  const handleClose = useCallback(() => {
    setNavState({ level: 0, cat: null, sub: null })
    onClose()
  }, [onClose])

  // Navigate to category
  const goToCategory = useCallback((cat) => {
    setNavState({ level: 1, cat, sub: null })
  }, [])

  // Navigate to subcategory
  const goToSubcategory = useCallback((sub) => {
    setNavState(prev => ({ ...prev, level: 2, sub }))
  }, [])

  // Go back one level
  const goBack = useCallback(() => {
    setNavState(prev => {
      if (prev.level === 2) return { ...prev, level: 1, sub: null }
      if (prev.level === 1) return { level: 0, cat: null, sub: null }
      return prev
    })
  }, [])

  // Navigate to products and close
  const goToProducts = useCallback((searchTerm) => {
    navigate(`/products?search=${encodeURIComponent(searchTerm)}`)
    handleClose()
  }, [navigate, handleClose])

  if (!isOpen) return null

  const activeCat = navState.cat
  const activeSub = navState.sub
  const activeSubDetails = activeSub ? getSubcategoryDetails(activeSub) : []

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" onClick={handleClose} />

      {/* Full Screen Menu */}
      <div className="absolute inset-0 bg-white flex flex-col">

        {/* Header - Context Aware */}
        <div className="bg-gradient-to-r from-brand-400 to-brand-500 text-white safe-area-pt">
          <div className="flex items-center justify-between p-4">
            {navState.level > 0 ? (
              <button onClick={goBack} className="flex items-center gap-2 p-2 -ml-2 hover:bg-white/20 rounded-xl active:bg-white/30">
                <ChevronRight className="w-6 h-6 rotate-180" />
                <span className="font-semibold text-lg">Geri</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-3xl">🐾</span>
                <span className="font-bold text-xl">Kategoriler</span>
              </div>
            )}
            <button onClick={handleClose} className="p-3 hover:bg-white/20 rounded-full active:bg-white/30">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Breadcrumb */}
          {navState.level > 0 && (
            <div className="px-4 pb-3 flex items-center gap-2 text-white/80 text-sm overflow-x-auto">
              <button onClick={() => setNavState({ level: 0, cat: null, sub: null })} className="hover:text-white">
                Ana Menü
              </button>
              {activeCat && (
                <>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  <button
                    onClick={() => setNavState({ level: 1, cat: activeCat, sub: null })}
                    className={clsx("hover:text-white", navState.level === 1 && "text-white font-semibold")}
                  >
                    {activeCat.name}
                  </button>
                </>
              )}
              {activeSub && (
                <>
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  <span className="text-white font-semibold truncate">{activeSub.name}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="relative">
            <input
              type="text"
              placeholder="Ne aramıştınız?"
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl text-base focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Content Area - Animated */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* LEVEL 0: Ana Kategoriler - Visual Cards */}
          {navState.level === 0 && (
            <div className="p-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Kategoriler</h2>
              <div className="grid grid-cols-2 gap-3">
                {PETZZSHOP_CATEGORIES.map((cat) => {
                  const iconData = MOBILE_CAT_ICONS[cat.id] || { emoji: '📦', bg: 'bg-gray-100', color: 'text-gray-600' }
                  return (
                    <button
                      key={cat.id}
                      onClick={() => goToCategory(cat)}
                      className="flex flex-col items-center p-5 bg-white border-2 border-gray-100 rounded-2xl hover:border-brand-300 active:bg-brand-50 active:border-brand-400 transition-all shadow-sm"
                    >
                      <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center mb-3", iconData.bg)}>
                        <span className="text-4xl">{iconData.emoji}</span>
                      </div>
                      <span className="font-semibold text-gray-800 text-center text-[15px]">{cat.shortName}</span>
                      <span className="text-xs text-gray-500 mt-1">{cat.children?.length} kategori</span>
                    </button>
                  )
                })}
              </div>

              {/* Quick Links */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => goToProducts('Kampanyalar')}
                  className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-base rounded-2xl active:opacity-90 shadow-lg"
                >
                  <span className="text-2xl">🏷️</span>
                  <span>Kampanyalı Ürünler</span>
                  <ChevronRight className="w-5 h-5 ml-auto" />
                </button>
                <button
                  onClick={() => goToProducts('Markalar')}
                  className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-brand-400 to-brand-500 text-white font-bold text-base rounded-2xl active:opacity-90 shadow-lg"
                >
                  <span className="text-2xl">⭐</span>
                  <span>Tüm Markalar</span>
                  <ChevronRight className="w-5 h-5 ml-auto" />
                </button>
              </div>
            </div>
          )}

          {/* LEVEL 1: Alt Kategoriler - List with Icons */}
          {navState.level === 1 && activeCat && (
            <div className="p-4">
              {/* Category Header Card */}
              <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl p-4 mb-4 flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-3xl">{MOBILE_CAT_ICONS[activeCat.id]?.emoji || '📦'}</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">{activeCat.name}</h2>
                  <p className="text-sm text-gray-600">{activeCat.children?.length} alt kategori</p>
                </div>
              </div>

              {/* Tümünü Gör Button */}
              <button
                onClick={() => goToProducts(activeCat.name)}
                className="w-full flex items-center justify-between p-4 mb-3 bg-brand-500 text-white font-semibold rounded-xl active:bg-brand-600"
              >
                <span>Tüm {activeCat.name}</span>
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Subcategories List */}
              <div className="space-y-2">
                {activeCat.children.map((sub, idx) => (
                  <button
                    key={sub.id}
                    onClick={() => sub.children?.length > 0 ? goToSubcategory(sub) : goToProducts(sub.name)}
                    className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-brand-200 active:bg-brand-50 active:border-brand-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                        {['🍖', '🎁', '🧹', '🚽', '💊', '🎾', '🛏️', '🥣', '🧳', '📿', '🔒'][idx % 11]}
                      </div>
                      <span className="font-medium text-gray-800 text-[15px]">{sub.name}</span>
                    </div>
                    {sub.children?.length > 0 && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <span className="text-xs">{getSubcategoryDetails(sub).length}</span>
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* LEVEL 2: Detay Kategoriler - Chips/Tags Style */}
          {navState.level === 2 && activeSub && (
            <div className="p-4">
              {/* Subcategory Header */}
              <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl p-4 mb-4">
                <h2 className="text-lg font-bold text-gray-800 mb-1">{activeSub.name}</h2>
                <p className="text-sm text-gray-600">{activeSubDetails.length} ürün kategorisi</p>
              </div>

              {/* Tümünü Gör */}
              <button
                onClick={() => goToProducts(activeSub.name)}
                className="w-full flex items-center justify-between p-4 mb-4 bg-brand-500 text-white font-semibold rounded-xl active:bg-brand-600"
              >
                <span>Tüm {activeSub.name}</span>
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Detail Categories - Large Touch Targets */}
              <div className="space-y-2">
                {activeSubDetails.map((detail) => (
                  <button
                    key={detail.id}
                    onClick={() => goToProducts(detail.name)}
                    className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-xl hover:border-brand-200 active:bg-brand-50 active:border-brand-300 transition-all text-left"
                  >
                    <span className="font-medium text-gray-800 text-[15px]">{detail.name}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Trust Bar */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 safe-area-pb">
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-6 h-6 text-brand-500" />
              <span className="text-[11px] font-medium text-gray-600">Ücretsiz Kargo</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Shield className="w-6 h-6 text-brand-500" />
              <span className="text-[11px] font-medium text-gray-600">Güvenli</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Phone className="w-6 h-6 text-brand-500" />
              <span className="text-[11px] font-medium text-gray-600">7/24 Destek</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

// ============================================
// PRODUCT CARD (Optimized)
// ============================================
const ProductCard = memo(function ProductCard({ product, onClick }) {
  const discount = useMemo(() =>
    product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : null,
    [product.price, product.oldPrice]
  )

  return (
    <div onClick={onClick} className="bg-white rounded-xl border border-brand-100 hover:border-brand-300 hover:shadow-xl transition-all cursor-pointer group overflow-hidden">
      <div className="relative aspect-square overflow-hidden">
        <LazyImage src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        {discount && <span className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-brand-500 to-deep-400 text-white text-xs font-bold rounded-lg shadow">%{discount}</span>}
        <button onClick={(e) => e.stopPropagation()} className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-50">
          <Heart className="w-4 h-4 text-brand-500" />
        </button>
      </div>
      <div className="p-3">
        <p className="text-xs text-brand-600 font-medium mb-1">{product.brand}</p>
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 group-hover:text-brand-600 min-h-[40px]">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-3 h-3 text-brand-400 fill-brand-400" />
          <span className="text-xs font-medium text-gray-700">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.reviews})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-brand-600">{product.price.toLocaleString()}₺</span>
          {product.oldPrice && <span className="text-sm text-gray-400 line-through">{product.oldPrice.toLocaleString()}₺</span>}
        </div>
      </div>
    </div>
  )
})

// ============================================
// FOOTER (Optimized)
// ============================================
const Footer = memo(function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-8">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <span className="text-xl font-bold">petzz<span className="text-brand-500">shop</span></span>
            <p className="text-gray-400 text-sm mt-2">Evcil dostlarınız için en iyi ürünler, en uygun fiyatlar.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Kategoriler</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {PETZZSHOP_CATEGORIES.slice(0, 4).map(cat => (
                <li key={cat.id}><button className="hover:text-white">{cat.name}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Yardım</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><button className="hover:text-white">Sipariş Takibi</button></li>
              <li><button className="hover:text-white">İade ve Değişim</button></li>
              <li><button className="hover:text-white">SSS</button></li>
              <li><button className="hover:text-white">İletişim</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">İletişim</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-brand-500" />0850 123 45 67</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-brand-500" />info@petzzshop.com</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-500" />İstanbul, Türkiye</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
        © 2024 Petzzshop. Tüm hakları saklıdır.
      </div>
    </footer>
  )
})

// ============================================
// BOTTOM NAV - Yaşlı Kullanıcı Dostu (Büyük Dokunma Alanları)
// ============================================
const BottomNav = memo(function BottomNav() {
  const navigate = useNavigate()

  const navItems = [
    { icon: Home, label: 'Ana Sayfa', path: '/shop2', active: true },
    { icon: Search, label: 'Ara', path: '/products' },
    { icon: Heart, label: 'Favoriler', path: '/products', badge: 2 },
    { icon: ShoppingCart, label: 'Sepet', path: '/products', badge: 3 },
    { icon: User, label: 'Hesap', path: '/products' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-brand-200 lg:hidden z-40 shadow-2xl">
      <div className="flex items-center justify-around py-2 px-1 safe-area-pb">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={clsx(
              "flex flex-col items-center justify-center min-w-[64px] py-2 px-3 rounded-xl transition-all relative",
              item.active
                ? "text-brand-500 bg-brand-50"
                : "text-gray-500 hover:text-brand-500 active:bg-brand-50"
            )}
          >
            <item.icon className={clsx("w-6 h-6 mb-1", item.active && "text-brand-500")} />
            <span className="text-[11px] font-semibold">{item.label}</span>
            {item.badge && (
              <span className="absolute top-0 right-1 min-w-[20px] h-5 px-1 bg-brand-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  )
})

// ============================================
// TRUST BADGES (Extracted & Memoized)
// ============================================
const TRUST_BADGES = [
  { icon: '🚚', title: 'Hızlı Kargo', desc: 'Aynı gün kargo' },
  { icon: '🔒', title: 'Güvenli Ödeme', desc: '256bit SSL' },
  { icon: '↩️', title: 'Kolay İade', desc: '14 gün içinde' },
  { icon: '📞', title: '7/24 Destek', desc: 'Müşteri hizmetleri' },
]

const TrustBadge = memo(function TrustBadge({ icon, title, desc }) {
  return (
    <div className="bg-white rounded-lg p-4 text-center shadow-sm">
      <span className="text-2xl mb-2 block">{icon}</span>
      <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  )
})

// ============================================
// MAIN COMPONENT (Optimized)
// ============================================
export default function Shop2() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeMainCategory, setActiveMainCategory] = useState(null)

  // Memoized callbacks
  const handleMobileMenuOpen = useCallback(() => setMobileMenuOpen(true), [])
  const handleMobileMenuClose = useCallback(() => setMobileMenuOpen(false), [])
  const handleNavigateProducts = useCallback(() => navigate('/products'), [navigate])

  return (
    <div className="min-h-screen bg-gray-100 pb-16 lg:pb-0">
      <Header
        onMobileMenuOpen={handleMobileMenuOpen}
        activeMainCategory={activeMainCategory}
        setActiveMainCategory={setActiveMainCategory}
      />
      <MobileMenu isOpen={mobileMenuOpen} onClose={handleMobileMenuClose} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Banner - Canlı turuncu gradient */}
        <div className="bg-gradient-to-r from-brand-400 via-brand-500 to-deep-400 rounded-2xl p-6 md:p-8 text-white mb-6 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Evcil Dostunuz İçin En İyisi!</h1>
              <p className="text-white/80 mb-4">10.000+ ürün, 100+ marka, aynı gün kargo</p>
              <button onClick={handleNavigateProducts} className="px-6 py-2.5 bg-white text-brand-600 font-bold rounded-lg hover:bg-brand-50 shadow-md transition-all">
                Alışverişe Başla
              </button>
            </div>
            <LazyImage src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=300&h=200&fit=crop" alt="Pet" className="w-56 h-36 object-cover rounded-xl shadow-xl hidden md:block border-4 border-white/20" />
          </div>
        </div>

        {/* Popüler Ürünler */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Popüler Ürünler</h2>
            <button onClick={handleNavigateProducts} className="text-sm text-brand-500 font-medium hover:underline">Tümünü Gör →</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} onClick={handleNavigateProducts} />
            ))}
          </div>
        </div>

        {/* Güven Rozetleri */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {TRUST_BADGES.map((item, i) => (
            <TrustBadge key={i} {...item} />
          ))}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  )
}
