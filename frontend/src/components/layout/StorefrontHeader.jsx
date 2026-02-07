// ============================================
// PETZZ PANEL - VİTRİN HEADER COMPONENT
// Tüm vitrin sayfalarında kullanılan header
// ============================================

import { useState, memo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, ShoppingCart, Heart, Menu, User, ChevronDown, ChevronRight,
  Truck, Shield, Phone, RotateCcw, Zap
} from 'lucide-react'
import { COLORS } from '../../constants/colors'
import { PETZZSHOP_CATEGORIES } from '../../data/categories'

const StorefrontHeader = memo(({
  cartCount = 0,
  favoritesCount = 0,
  onMobileMenuOpen,
  showMegaMenu = true,
  showCategoryTabs = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCategoryMenu, setShowCategoryMenu] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/kategori?q=${encodeURIComponent(searchTerm)}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#EF7F1A] to-[#D66A0F] text-white">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Truck size={16} />
              <span className="hidden sm:inline">300₺ Üzeri</span> Ücretsiz Kargo
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <Shield size={16} />
              Güvenli Alışveriş
            </span>
            <span className="hidden lg:flex items-center gap-1.5">
              <RotateCcw size={16} />
              14 Gün İade
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <a href="tel:08505551234" className="hover:underline flex items-center gap-1">
              <Phone size={14} />
              <span className="hidden sm:inline">0850 555 12 34</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4 md:gap-6">
            {/* Mobile Menu Button */}
            <button
              onClick={onMobileMenuOpen}
              className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} style={{ color: COLORS.kahverengi }} />
            </button>

            {/* Logo */}
            <Link to="/vitrin" className="flex-shrink-0">
              <span className="text-xl md:text-2xl font-bold">
                <span style={{ color: COLORS.kahverengi }}>petzz</span>
                <span
                  style={{
                    color: COLORS.dipSarisi,
                    textShadow: `1px 1px 0 ${COLORS.kahverengi}`
                  }}
                >
                  shop
                </span>
              </span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ürün, marka veya kategori ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#EF7F1A] transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#EF7F1A] text-white rounded-lg hover:bg-[#D66A0F] transition-colors"
                >
                  <Search size={18} />
                </button>
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-1 md:gap-3 ml-auto">
              <Link
                to="/hesabim"
                className="hidden md:flex flex-col items-center px-3 py-1 text-[#492D2B] hover:text-[#EF7F1A] transition-colors"
              >
                <User size={22} />
                <span className="text-xs mt-0.5">Hesabım</span>
              </Link>
              <Link
                to="/favoriler"
                className="flex flex-col items-center px-2 md:px-3 py-1 text-[#492D2B] hover:text-[#EF7F1A] transition-colors relative"
              >
                <Heart size={22} />
                <span className="text-xs mt-0.5 hidden md:block">Favoriler</span>
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 right-0 md:right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {favoritesCount > 99 ? '99+' : favoritesCount}
                  </span>
                )}
              </Link>
              <Link
                to="/sepet"
                className="flex flex-col items-center px-2 md:px-3 py-1 text-[#492D2B] hover:text-[#EF7F1A] transition-colors relative"
              >
                <div className="relative">
                  <ShoppingCart size={22} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#EF7F1A] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-0.5">Sepetim</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation with Mega Menu */}
      {showCategoryTabs && (
        <div className="bg-white border-b hidden lg:block">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex items-center">
              {/* Mega Menu Trigger */}
              {showMegaMenu && (
                <div
                  className="relative"
                  onMouseEnter={() => setShowCategoryMenu(true)}
                  onMouseLeave={() => { setShowCategoryMenu(false); setActiveCategory(null) }}
                >
                  <button className="flex items-center gap-2 px-4 py-3 bg-[#EF7F1A] text-white font-semibold rounded-t-lg">
                    <Menu size={18} />
                    Tüm Kategoriler
                    <ChevronDown size={16} />
                  </button>

                  {/* Mega Menu Dropdown */}
                  {showCategoryMenu && (
                    <div className="absolute top-full left-0 bg-white border rounded-b-lg shadow-xl z-50 flex min-w-[800px]">
                      {/* Main Categories */}
                      <div className="w-64 border-r bg-gray-50">
                        {PETZZSHOP_CATEGORIES.map((cat) => (
                          <div
                            key={cat.id}
                            onMouseEnter={() => setActiveCategory(cat.id)}
                            className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
                              activeCategory === cat.id ? 'bg-white text-[#EF7F1A]' : 'hover:bg-white'
                            }`}
                          >
                            <span className="text-xl">{cat.icon}</span>
                            <span className="font-medium">{cat.name}</span>
                            <ChevronRight size={16} className="ml-auto" />
                          </div>
                        ))}
                      </div>

                      {/* Sub Categories */}
                      {activeCategory && (
                        <div className="flex-1 p-6">
                          {(() => {
                            const cat = PETZZSHOP_CATEGORIES.find(c => c.id === activeCategory)
                            if (!cat?.children) return null
                            return (
                              <div className="grid grid-cols-3 gap-6">
                                {cat.children.slice(0, 9).map(sub => (
                                  <div key={sub.id}>
                                    <Link
                                      to={`/kategori/${sub.slug}`}
                                      className="font-semibold text-[#492D2B] hover:text-[#EF7F1A] block mb-2"
                                    >
                                      {sub.name}
                                    </Link>
                                    {sub.children && (
                                      <ul className="space-y-1">
                                        {sub.children.slice(0, 5).map(item => (
                                          <li key={item.id}>
                                            <Link
                                              to={`/kategori/${item.slug}`}
                                              className="text-sm text-gray-600 hover:text-[#EF7F1A]"
                                            >
                                              {item.name}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Category Tabs */}
              {PETZZSHOP_CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/kategori/${cat.slug}`}
                  className="px-4 py-3 text-sm font-semibold whitespace-nowrap text-[#492D2B] hover:text-[#EF7F1A] transition-colors flex items-center gap-1.5"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.shortName || cat.name}</span>
                </Link>
              ))}

              {/* Special Links */}
              <Link
                to="/kategori?discount=true"
                className="px-4 py-3 text-sm font-bold whitespace-nowrap text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <Zap size={16} />
                Fırsatlar
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Search */}
      <div className="p-3 border-b bg-[#FFF5EB] lg:hidden">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <input
              type="text"
              placeholder="Ne aramıştınız?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#EF7F1A]/30 rounded-xl text-sm focus:outline-none focus:border-[#EF7F1A]"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EF7F1A]" />
          </div>
        </form>
      </div>
    </header>
  )
})

StorefrontHeader.displayName = 'StorefrontHeader'

export default StorefrontHeader
