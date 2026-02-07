// ============================================
// PETZZ PANEL - MERKEZİ PRODUCT CARD COMPONENT
// Tüm vitrin sayfalarında kullanılan ürün kartı
// ============================================

import { useState, memo } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Eye, Star, Check, Award } from 'lucide-react'
import { formatPrice, calculateDiscount } from '../../utils/helpers'

const ProductCard = memo(({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  isInCart = false,
  showQuickView = true,
  variant = 'default' // 'default', 'compact', 'horizontal'
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Normalize product data (support both API and local data formats)
  const sellPrice = product.sell_price || product.oldPrice || product.price
  const discountPrice = product.discount_price || product.price
  const stockCount = product.stock_count ?? product.stock ?? 0
  const discount = product.discount || calculateDiscount(sellPrice, discountPrice)
  const displayPrice = discountPrice || sellPrice
  const rating = product.rating || 4.5
  const reviewCount = product.reviewCount || 0

  // Get first image from various formats
  const getFirstImage = () => {
    if (product.image) return product.image
    if (product.images) {
      if (typeof product.images === 'string') {
        try { return JSON.parse(product.images)[0] } catch { return product.images }
      }
      if (Array.isArray(product.images)) return product.images[0]
    }
    return 'https://via.placeholder.com/300x300/f6f6f6/ccc?text=Ürün'
  }
  const firstImage = getFirstImage()

  // Prepare cart product data
  const prepareProductData = () => ({
    sku: product.sku || product.id,
    name: product.name,
    brand: product.brand,
    slug: product.slug,
    sell_price: sellPrice,
    discount_price: discountPrice,
    stock_count: stockCount,
    images: JSON.stringify([firstImage]),
    variant_type: product.variant_type || 'Boyut',
    variant_value: product.variant_value || product.variant || '',
  })

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (stockCount > 0 && onAddToCart) {
      onAddToCart(prepareProductData())
    }
  }

  const handleToggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onToggleFavorite) {
      onToggleFavorite(prepareProductData())
    }
  }

  // Compact variant for smaller displays
  if (variant === 'compact') {
    return (
      <Link
        to={`/product/${product.slug || product.id}`}
        className="group bg-white rounded-xl border border-gray-100 hover:border-[#EF7F1A]/30 hover:shadow-lg transition-all overflow-hidden"
      >
        <div className="relative aspect-square bg-gray-50">
          <img
            src={firstImage}
            alt={product.name}
            className="w-full h-full object-contain p-2"
            loading="lazy"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300/f6f6f6/ccc?text=Ürün' }}
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
              %{discount}
            </span>
          )}
          {stockCount === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded">Tükendi</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-xs font-medium text-gray-800 line-clamp-2">{product.name}</h3>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-bold text-[#EF7F1A]">{formatPrice(displayPrice)}</span>
            {discount > 0 && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(sellPrice)}</span>
            )}
          </div>
        </div>
      </Link>
    )
  }

  // Default variant
  return (
    <Link
      to={`/product/${product.slug || product.id}`}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-[#EF7F1A]/30 hover:shadow-xl transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-200" />
        )}
        <img
          src={firstImage}
          alt={product.name}
          className={`w-full h-full object-contain p-4 transition-transform duration-500 ${
            isHovered ? 'scale-110' : 'scale-100'
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300/f6f6f6/ccc?text=Ürün'
            setImageLoaded(true)
          }}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
              %{discount} İndirim
            </span>
          )}
          {product.badges?.includes('Çok Satan') && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
              <Award size={12} /> Çok Satan
            </span>
          )}
          {stockCount > 0 && stockCount <= 5 && (
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-lg">
              Son {stockCount} Adet!
            </span>
          )}
        </div>

        {/* Quick Actions (Desktop) */}
        <div className={`absolute top-3 right-3 flex-col gap-2 transition-all duration-300 hidden lg:flex ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}>
          <button
            onClick={handleToggleFavorite}
            className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isFavorite
                ? 'bg-red-500 text-white scale-110'
                : 'bg-white hover:bg-red-50 text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          {showQuickView && (
            <button
              className="w-10 h-10 rounded-full bg-white hover:bg-gray-50 text-gray-400 hover:text-[#EF7F1A] flex items-center justify-center shadow-lg transition-all"
            >
              <Eye size={18} />
            </button>
          )}
        </div>

        {/* Mobile Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all lg:hidden ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400'
          }`}
        >
          <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        {/* Out of Stock Overlay */}
        {stockCount === 0 && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-white text-gray-800 font-bold px-6 py-3 rounded-xl shadow-lg">
              Stokta Yok
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand */}
        {product.brand && (
          <span className="text-xs text-[#EF7F1A] font-semibold uppercase tracking-wide">
            {product.brand}
          </span>
        )}

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mt-1 min-h-[40px] group-hover:text-[#EF7F1A] transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({reviewCount})</span>
          </div>
        )}

        {/* Variant */}
        {(product.variant_value || product.variant) && (
          <span className="text-xs text-gray-500 mt-1 bg-gray-100 px-2 py-0.5 rounded inline-block">
            {product.variant_value || product.variant}
          </span>
        )}

        {/* Price */}
        <div className="mt-3 flex items-end justify-between">
          <div>
            <span className="text-xl font-bold text-[#EF7F1A]">
              {formatPrice(displayPrice)}
            </span>
            {discount > 0 && (
              <span className="text-sm text-gray-400 line-through ml-2">
                {formatPrice(sellPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={stockCount === 0}
          className={`w-full mt-3 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            stockCount === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isInCart
              ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
              : 'bg-gradient-to-r from-[#EF7F1A] to-[#D66A0F] text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-0.5'
          }`}
        >
          {stockCount === 0 ? (
            'Stokta Yok'
          ) : isInCart ? (
            <>
              <Check size={16} />
              Sepette
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              Sepete Ekle
            </>
          )}
        </button>
      </div>
    </Link>
  )
})

ProductCard.displayName = 'ProductCard'

export default ProductCard
