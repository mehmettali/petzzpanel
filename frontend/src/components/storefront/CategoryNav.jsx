// ============================================
// PETZZ PANEL - MERKEZİ KATEGORİ NAVİGASYON COMPONENT
// Tüm vitrin sayfalarında kullanılan kategori kartları
// ============================================

import { memo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { PETZZSHOP_CATEGORIES } from '../../data/categories'

// ==================== CATEGORY CARD ====================
export const CategoryCard = memo(({ category, variant = 'default' }) => {
  // Compact variant for smaller displays
  if (variant === 'compact') {
    return (
      <Link
        to={`/kategori/${category.slug}`}
        className="flex flex-col items-center p-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-[#EF7F1A]/50 hover:shadow-md transition-all group"
      >
        <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{category.icon}</span>
        <span className="font-semibold text-gray-800 text-sm text-center">{category.shortName || category.name}</span>
        {category.productCount && (
          <span className="text-xs text-gray-400 mt-1">{category.productCount.toLocaleString('tr-TR')} ürün</span>
        )}
      </Link>
    )
  }

  // Mobile variant
  if (variant === 'mobile') {
    return (
      <Link
        to={`/kategori/${category.slug}`}
        className="flex flex-col items-center p-4 bg-[#FFF5EB] border-2 border-[#EF7F1A]/20 rounded-2xl hover:border-[#EF7F1A] transition-all"
      >
        <span className="text-3xl mb-2">{category.icon}</span>
        <span className="font-semibold text-[#492D2B]">{category.shortName || category.name}</span>
      </Link>
    )
  }

  // Default variant with image
  return (
    <Link
      to={`/kategori/${category.slug}`}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={category.image || `https://via.placeholder.com/400x300/f6f6f6/ccc?text=${category.name}`}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{category.icon}</span>
          <h3 className="text-lg font-bold">{category.shortName || category.name}</h3>
        </div>
        {category.description && (
          <p className="text-sm opacity-80">{category.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 text-sm">
          {category.productCount && (
            <span className="bg-white/20 px-2 py-0.5 rounded">
              {category.productCount.toLocaleString('tr-TR')} ürün
            </span>
          )}
          <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Keşfet <ChevronRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  )
})

CategoryCard.displayName = 'CategoryCard'

// ==================== CATEGORY GRID ====================
export const CategoryGrid = memo(({
  categories = PETZZSHOP_CATEGORIES,
  variant = 'default',
  columns = { sm: 2, md: 3, lg: 6 },
  limit,
  className = ''
}) => {
  const displayCategories = limit ? categories.slice(0, limit) : categories

  const gridClasses = {
    sm: columns.sm === 2 ? 'grid-cols-2' : columns.sm === 3 ? 'grid-cols-3' : 'grid-cols-4',
    md: columns.md === 2 ? 'md:grid-cols-2' : columns.md === 3 ? 'md:grid-cols-3' : columns.md === 4 ? 'md:grid-cols-4' : 'md:grid-cols-5',
    lg: columns.lg === 4 ? 'lg:grid-cols-4' : columns.lg === 5 ? 'lg:grid-cols-5' : columns.lg === 6 ? 'lg:grid-cols-6' : 'lg:grid-cols-8'
  }

  return (
    <div className={`grid ${gridClasses.sm} ${gridClasses.md} ${gridClasses.lg} gap-4 ${className}`}>
      {displayCategories.map(category => (
        <CategoryCard key={category.id} category={category} variant={variant} />
      ))}
    </div>
  )
})

CategoryGrid.displayName = 'CategoryGrid'

// ==================== CATEGORY CAROUSEL ====================
export const CategoryCarousel = memo(({
  categories = PETZZSHOP_CATEGORIES,
  variant = 'compact',
  className = ''
}) => (
  <div className={`flex gap-4 overflow-x-auto pb-4 scrollbar-hide ${className}`}>
    {categories.map(category => (
      <div key={category.id} className="flex-shrink-0 w-28">
        <CategoryCard category={category} variant={variant} />
      </div>
    ))}
  </div>
))

CategoryCarousel.displayName = 'CategoryCarousel'

// ==================== MOBILE CATEGORY MENU ====================
export const MobileCategoryMenu = memo(({
  categories = PETZZSHOP_CATEGORIES,
  onCategoryClick,
  className = ''
}) => (
  <div className={`grid grid-cols-2 gap-3 ${className}`}>
    {categories.map(category => (
      <Link
        key={category.id}
        to={`/kategori/${category.slug}`}
        onClick={() => onCategoryClick && onCategoryClick(category)}
        className="flex flex-col items-center p-4 bg-[#FFF5EB] border-2 border-[#EF7F1A]/20 rounded-2xl hover:border-[#EF7F1A] transition-all"
      >
        <span className="text-3xl mb-2">{category.icon}</span>
        <span className="font-semibold text-[#492D2B]">{category.shortName || category.name}</span>
      </Link>
    ))}
  </div>
))

MobileCategoryMenu.displayName = 'MobileCategoryMenu'

// ==================== BREADCRUMB ====================
export const CategoryBreadcrumb = memo(({
  items = [],
  separator = '/',
  className = ''
}) => (
  <nav className={`flex items-center gap-2 text-sm ${className}`}>
    <Link to="/vitrin" className="text-gray-500 hover:text-[#EF7F1A] transition-colors">
      Ana Sayfa
    </Link>
    {items.map((item, index) => (
      <span key={item.slug || index} className="flex items-center gap-2">
        <span className="text-gray-300">{separator}</span>
        {index === items.length - 1 ? (
          <span className="text-[#EF7F1A] font-medium">{item.name}</span>
        ) : (
          <Link
            to={`/kategori/${item.slug}`}
            className="text-gray-500 hover:text-[#EF7F1A] transition-colors"
          >
            {item.name}
          </Link>
        )}
      </span>
    ))}
  </nav>
))

CategoryBreadcrumb.displayName = 'CategoryBreadcrumb'

// ==================== EXPORTS ====================
export default {
  CategoryCard,
  CategoryGrid,
  CategoryCarousel,
  MobileCategoryMenu,
  CategoryBreadcrumb
}
