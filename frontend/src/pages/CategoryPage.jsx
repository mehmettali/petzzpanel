import { useState, useMemo, useCallback, memo } from 'react'
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom'
import {
  Search, ShoppingCart, Heart, Filter, X, ChevronRight, ChevronDown,
  Star, Truck, Shield, Check, Menu, User, Home, Grid3X3, List,
  SlidersHorizontal, ArrowUpDown, Package, Percent, Eye, Zap,
  Clock, Gift, Phone, Mail, CreditCard, RotateCcw, Award
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import {
  PETZZSHOP_CATEGORIES,
  getCategoryBySlug,
  SAMPLE_PRODUCTS,
  getProductsByCategory,
  searchProducts
} from '../data/categories'
import { COLORS } from '../constants/colors'
import { formatPrice, calculateDiscount } from '../utils/helpers'
import StorefrontHeader from '../components/layout/StorefrontHeader'
import StorefrontFooter from '../components/layout/StorefrontFooter'
import ProductCard from '../components/storefront/ProductCard'

// ==================== CATEGORY BANNER ====================
const CategoryBanner = memo(({ category }) => {
  if (!category) return null

  const bannerImages = {
    kedi: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&h=300&fit=crop',
    kopek: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&h=300&fit=crop',
    kus: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=1200&h=300&fit=crop',
    balik: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=300&fit=crop',
    kemirgen: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=1200&h=300&fit=crop',
    surungan: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?w=1200&h=300&fit=crop',
  }

  const bgImage = bannerImages[category.id] || bannerImages.kedi

  return (
    <div className="relative h-40 md:h-52 rounded-2xl overflow-hidden mb-6">
      <img
        src={bgImage}
        alt={category.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div className="absolute inset-0 flex items-center px-6 md:px-10">
        <div className="text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-4xl">{category.icon}</span>
            <h1 className="text-3xl md:text-4xl font-bold">{category.name}</h1>
          </div>
          <p className="text-white/80 max-w-md">
            {category.description || `En kaliteli ${category.name.toLowerCase()} ürünleri uygun fiyatlarla Petzzshop'ta!`}
          </p>
        </div>
      </div>
    </div>
  )
})

// ==================== BREADCRUMB ====================
const Breadcrumb = memo(({ category, searchQuery }) => (
  <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4 overflow-x-auto whitespace-nowrap pb-2">
    <Link to="/vitrin" className="hover:text-[#EF7F1A] transition-colors flex items-center gap-1">
      <Home size={14} />
      Anasayfa
    </Link>
    {category?.ancestors?.map((ancestor) => (
      <span key={ancestor.id} className="flex items-center gap-2">
        <ChevronRight size={14} className="text-gray-400" />
        <Link to={`/kategori/${ancestor.slug}`} className="hover:text-[#EF7F1A] transition-colors">
          {ancestor.name}
        </Link>
      </span>
    ))}
    <ChevronRight size={14} className="text-gray-400" />
    <span className="text-[#EF7F1A] font-medium">
      {searchQuery ? `"${searchQuery}" için sonuçlar` : category?.name || 'Tüm Ürünler'}
    </span>
  </nav>
))

// ==================== SUBCATEGORY CARDS ====================
const SubcategoryCards = memo(({ category }) => {
  if (!category?.children?.length) return null

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Alt Kategoriler</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {category.children.map(sub => (
          <Link
            key={sub.id}
            to={`/kategori/${sub.slug}`}
            className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:border-[#EF7F1A] hover:shadow-lg transition-all group"
          >
            <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              {category.icon}
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-[#EF7F1A] line-clamp-2">
              {sub.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
})

// ==================== FILTER SIDEBAR ====================
const FilterSidebar = memo(({ brands, selectedFilters, onFilterChange, onClearFilters, category }) => {
  const [expandedSections, setExpandedSections] = useState(['category', 'brand', 'price', 'stock'])

  const toggleSection = (section) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    )
  }

  const activeFilterCount = Object.values(selectedFilters).filter(v => v && v !== 'all' && v !== 'newest').length

  const priceRanges = [
    { label: '0 - 100 TL', min: 0, max: 100 },
    { label: '100 - 250 TL', min: 100, max: 250 },
    { label: '250 - 500 TL', min: 250, max: 500 },
    { label: '500 - 1000 TL', min: 500, max: 1000 },
    { label: '1000 TL ve üzeri', min: 1000, max: 99999 },
  ]

  return (
    <div className="space-y-4">
      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="bg-orange-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#492D2B]">Aktif Filtreler ({activeFilterCount})</span>
            <button onClick={onClearFilters} className="text-xs text-[#EF7F1A] hover:underline font-medium">
              Tümünü Temizle
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedFilters.brand && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-xs">
                {selectedFilters.brand}
                <button onClick={() => onFilterChange('brand', '')} className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            )}
            {selectedFilters.hasDiscount === 'true' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-xs">
                İndirimli
                <button onClick={() => onFilterChange('hasDiscount', '')} className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Category Filter */}
      {category?.children?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('category')}
            className="w-full flex items-center justify-between p-4 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Kategori
            <ChevronDown size={16} className={`transition-transform ${expandedSections.includes('category') ? 'rotate-180' : ''}`} />
          </button>
          {expandedSections.includes('category') && (
            <div className="px-4 pb-4 space-y-1">
              {category.children.map(sub => (
                <Link
                  key={sub.id}
                  to={`/kategori/${sub.slug}`}
                  className="block px-3 py-2 text-sm text-gray-600 hover:text-[#EF7F1A] hover:bg-orange-50 rounded-lg transition-colors"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Brand Filter */}
      {brands?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection('brand')}
            className="w-full flex items-center justify-between p-4 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            Marka
            <ChevronDown size={16} className={`transition-transform ${expandedSections.includes('brand') ? 'rotate-180' : ''}`} />
          </button>
          {expandedSections.includes('brand') && (
            <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
              {brands.map(brand => (
                <label key={brand.name} className="flex items-center gap-3 text-sm cursor-pointer hover:text-[#EF7F1A] group">
                  <input
                    type="checkbox"
                    checked={selectedFilters.brand === brand.name}
                    onChange={() => onFilterChange('brand', selectedFilters.brand === brand.name ? '' : brand.name)}
                    className="w-4 h-4 rounded border-gray-300 text-[#EF7F1A] focus:ring-[#EF7F1A]"
                  />
                  <span className="flex-1">{brand.name}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{brand.count}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price Filter */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between p-4 text-sm font-semibold text-gray-800 hover:bg-gray-50"
        >
          Fiyat Aralığı
          <ChevronDown size={16} className={`transition-transform ${expandedSections.includes('price') ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.includes('price') && (
          <div className="px-4 pb-4 space-y-2">
            {priceRanges.map((range, idx) => (
              <label key={idx} className="flex items-center gap-3 text-sm cursor-pointer hover:text-[#EF7F1A]">
                <input
                  type="radio"
                  name="priceRange"
                  className="w-4 h-4 border-gray-300 text-[#EF7F1A] focus:ring-[#EF7F1A]"
                />
                <span>{range.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Discount Filter */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedFilters.hasDiscount === 'true'}
            onChange={() => onFilterChange('hasDiscount', selectedFilters.hasDiscount === 'true' ? '' : 'true')}
            className="w-5 h-5 rounded border-gray-300 text-[#EF7F1A] focus:ring-[#EF7F1A]"
          />
          <div className="flex items-center gap-2">
            <Percent size={18} className="text-red-500" />
            <span className="font-medium">Sadece İndirimli Ürünler</span>
          </div>
        </label>
      </div>

      {/* Stock Filter */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedFilters.stockStatus === 'in_stock'}
            onChange={() => onFilterChange('stockStatus', selectedFilters.stockStatus === 'in_stock' ? '' : 'in_stock')}
            className="w-5 h-5 rounded border-gray-300 text-[#EF7F1A] focus:ring-[#EF7F1A]"
          />
          <div className="flex items-center gap-2">
            <Package size={18} className="text-green-500" />
            <span className="font-medium">Stokta Olanlar</span>
          </div>
        </label>
      </div>
    </div>
  )
})

// ==================== SORT DROPDOWN ====================
const SortDropdown = memo(({ value, onChange }) => {
  const options = [
    { value: 'newest', label: 'En Yeni Ürünler' },
    { value: 'price_asc', label: 'Fiyat: Düşükten Yükseğe' },
    { value: 'price_desc', label: 'Fiyat: Yüksekten Düşüğe' },
    { value: 'discount', label: 'İndirim Oranına Göre' },
    { value: 'rating', label: 'En Yüksek Puan' },
    { value: 'bestseller', label: 'Çok Satanlar' },
  ]

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:border-[#EF7F1A] cursor-pointer hover:border-gray-300 transition-colors"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ArrowUpDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
})

// ==================== PAGINATION ====================
const Pagination = memo(({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  const pages = []
  const showEllipsis = totalPages > 7

  if (showEllipsis) {
    if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(totalPages)
    } else if (currentPage >= totalPages - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(totalPages)
    }
  } else {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2.5 border-2 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        ← Önceki
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page, idx) => (
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                currentPage === page
                  ? 'bg-gradient-to-r from-[#EF7F1A] to-[#D66A0F] text-white shadow-lg'
                  : 'border-2 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {page}
            </button>
          )
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2.5 border-2 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Sonraki →
      </button>
    </div>
  )
})

// ==================== MAIN COMPONENT ====================
export default function CategoryPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState('grid')

  const { addToCart, isInCart, getCartCount } = useCart()
  const { toggleFavorite, isFavorite, getFavoritesCount } = useFavorites()

  const cartCount = getCartCount()
  const favoritesCount = getFavoritesCount()

  const category = slug ? getCategoryBySlug(slug) : null
  const searchQuery = searchParams.get('q') || ''

  const [filters, setFilters] = useState({
    brand: searchParams.get('brand') || '',
    stockStatus: searchParams.get('stock') || '',
    hasDiscount: searchParams.get('discount') || '',
    sortBy: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page')) || 1,
  })

  const filteredProducts = useMemo(() => {
    let result = []

    if (searchQuery) {
      result = searchProducts(searchQuery, 100)
    } else if (slug) {
      result = getProductsByCategory(slug, 100)
    } else {
      result = [...SAMPLE_PRODUCTS]
    }

    if (filters.brand) {
      result = result.filter(p => p.brand === filters.brand)
    }

    if (filters.stockStatus === 'in_stock') {
      result = result.filter(p => (p.stock ?? p.stock_count ?? 0) > 0)
    }

    if (filters.hasDiscount === 'true') {
      result = result.filter(p => (p.discount || 0) > 0)
    }

    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => (a.price || a.discount_price || 0) - (b.price || b.discount_price || 0))
        break
      case 'price_desc':
        result.sort((a, b) => (b.price || b.discount_price || 0) - (a.price || a.discount_price || 0))
        break
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'discount':
        result.sort((a, b) => (b.discount || 0) - (a.discount || 0))
        break
      case 'bestseller':
        result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
        break
      default:
        break
    }

    return result
  }, [slug, searchQuery, filters])

  const pageSize = 12
  const totalPages = Math.ceil(filteredProducts.length / pageSize)
  const products = filteredProducts.slice((filters.page - 1) * pageSize, filters.page * pageSize)
  const pagination = { total: filteredProducts.length, totalPages, page: filters.page }

  const brands = useMemo(() => {
    const brandCounts = {}
    filteredProducts.forEach(p => {
      if (p.brand) brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1
    })
    return Object.entries(brandCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [filteredProducts])

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value, page: 1 }
      const params = new URLSearchParams(searchParams)
      if (value) {
        params.set(key === 'stockStatus' ? 'stock' : key === 'hasDiscount' ? 'discount' : key, value)
      } else {
        params.delete(key === 'stockStatus' ? 'stock' : key === 'hasDiscount' ? 'discount' : key)
      }
      params.delete('page')
      setSearchParams(params)
      return newFilters
    })
  }, [searchParams, setSearchParams])

  const handleSortChange = useCallback((value) => {
    setFilters(prev => ({ ...prev, sortBy: value, page: 1 }))
    const params = new URLSearchParams(searchParams)
    params.set('sort', value)
    params.delete('page')
    setSearchParams(params)
  }, [searchParams, setSearchParams])

  const handlePageChange = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }))
    const params = new URLSearchParams(searchParams)
    if (page > 1) params.set('page', page)
    else params.delete('page')
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [searchParams, setSearchParams])

  const clearFilters = useCallback(() => {
    setFilters({ brand: '', stockStatus: '', hasDiscount: '', sortBy: 'newest', page: 1 })
    setSearchParams(new URLSearchParams())
  }, [setSearchParams])

  return (
    <div className="min-h-screen bg-gray-50">
      <StorefrontHeader
        onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
        cartCount={cartCount}
        favoritesCount={favoritesCount}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Breadcrumb category={category} searchQuery={searchQuery} />

        {category && <CategoryBanner category={category} />}

        {category && <SubcategoryCards category={category} />}

        {/* Results Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {searchQuery ? `"${searchQuery}" için sonuçlar` : category ? `${category.name} Ürünleri` : 'Tüm Ürünler'}
            </h2>
            <p className="text-gray-500 mt-1">
              <span className="font-semibold text-[#EF7F1A]">{pagination.total.toLocaleString('tr-TR')}</span> ürün bulundu
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl text-sm font-medium hover:bg-gray-50"
            >
              <Filter size={18} />
              Filtrele
            </button>

            <div className="hidden sm:flex items-center border-2 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-[#EF7F1A] text-white' : 'hover:bg-gray-50'}`}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-[#EF7F1A] text-white' : 'hover:bg-gray-50'}`}
              >
                <List size={18} />
              </button>
            </div>

            <SortDropdown value={filters.sortBy} onChange={handleSortChange} />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <FilterSidebar
              brands={brands}
              selectedFilters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              category={category}
            />
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Ürün bulunamadı</h3>
                <p className="text-gray-500 mb-6">Arama kriterlerinize uygun ürün bulunamadı.</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-[#EF7F1A] to-[#D66A0F] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Filtreleri Temizle
                </button>
              </div>
            ) : (
              <>
                <div className={`grid gap-4 ${
                  viewMode === 'grid'
                    ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1'
                }`}>
                  {products.map(product => (
                    <ProductCard
                      key={product.id || product.sku}
                      product={product}
                      onAddToCart={addToCart}
                      onToggleFavorite={toggleFavorite}
                      isFavorite={isFavorite(product.sku || product.id)}
                      isInCart={isInCart(product.sku || product.id)}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={filters.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-gray-50 flex flex-col">
            <div className="flex items-center justify-between p-4 bg-white border-b">
              <h3 className="font-bold text-lg">Filtreler</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterSidebar
                brands={brands}
                selectedFilters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                category={category}
              />
            </div>
            <div className="p-4 bg-white border-t">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3.5 bg-gradient-to-r from-[#EF7F1A] to-[#D66A0F] text-white rounded-xl font-bold shadow-lg"
              >
                {pagination.total} Ürünü Göster
              </button>
            </div>
          </div>
        </div>
      )}

      <StorefrontFooter />
    </div>
  )
}
