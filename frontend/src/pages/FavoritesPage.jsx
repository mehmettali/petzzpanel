import { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'
import { useCart } from '../context/CartContext'
import { COLORS } from '../constants/colors'
import StorefrontHeader from '../components/layout/StorefrontHeader'
import StorefrontFooter from '../components/layout/StorefrontFooter'

// Favorite Product Card
const FavoriteCard = memo(function FavoriteCard({ product, onRemove, onAddToCart, isInCart }) {
  const price = product.discount_price || product.sell_price || 0
  const originalPrice = product.sell_price || 0
  const hasDiscount = product.discount_price && product.discount_price < originalPrice
  const discountPercent = hasDiscount ? Math.round((1 - product.discount_price / originalPrice) * 100) : 0

  const imageUrl = product.images && product.images.length > 0
    ? (typeof product.images === 'string' ? JSON.parse(product.images)[0] : product.images[0])
    : null

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden group hover:shadow-lg transition-all">
      {/* Image */}
      <div className="relative aspect-square bg-gray-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div
            className="absolute top-3 left-3 px-2 py-1 rounded-full text-white text-xs font-bold"
            style={{ backgroundColor: COLORS.turuncu }}
          >
            %{discountPercent} İndirim
          </div>
        )}

        {/* Remove Button */}
        <button
          onClick={() => onRemove(product.sku)}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
          title="Favorilerden Çıkar"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {product.brand && (
          <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
        )}

        <Link
          to={`/product/${product.slug}`}
          className="font-medium text-gray-800 hover:text-orange-500 line-clamp-2 h-12"
        >
          {product.name}
        </Link>

        {/* Price */}
        <div className="mt-3 flex items-center gap-2">
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {originalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
            </span>
          )}
          <span className="text-lg font-bold" style={{ color: COLORS.turuncu }}>
            {price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
          </span>
        </div>

        {/* Stock Status */}
        <div className="mt-2">
          {product.stock_count > 0 ? (
            <span className="text-sm text-green-600">Stokta</span>
          ) : (
            <span className="text-sm text-red-500">Stokta Yok</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock_count <= 0 || isInCart}
          className={`w-full mt-4 py-3 rounded-full font-medium transition-all flex items-center justify-center gap-2 ${
            isInCart
              ? 'bg-green-100 text-green-600 cursor-default'
              : product.stock_count > 0
              ? 'text-white hover:scale-[1.02]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          style={!isInCart && product.stock_count > 0 ? { backgroundColor: COLORS.turuncu } : {}}
        >
          {isInCart ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Sepette
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Sepete Ekle
            </>
          )}
        </button>
      </div>
    </div>
  )
})

// Empty Favorites Component
const EmptyFavorites = memo(function EmptyFavorites() {
  return (
    <div className="text-center py-16">
      <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Favori Listeniz Boş</h2>
      <p className="text-gray-500 mb-6">
        Beğendiğiniz ürünleri favorilere ekleyerek daha sonra kolayca bulabilirsiniz.
      </p>
      <Link
        to="/vitrin"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-transform hover:scale-105"
        style={{ backgroundColor: COLORS.turuncu }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Ürünleri Keşfet
      </Link>
    </div>
  )
})

// Main Favorites Page Component
export default function FavoritesPage() {
  const { items, removeFromFavorites, clearFavorites, getFavoritesCount } = useFavorites()
  const { addToCart, isInCart, getCartCount } = useCart()

  const favoritesCount = useMemo(() => getFavoritesCount(), [items])
  const cartCount = useMemo(() => getCartCount(), [])

  const handleAddToCart = (product) => {
    addToCart(product)
  }

  const handleAddAllToCart = () => {
    items.forEach(item => {
      if (item.stock_count > 0 && !isInCart(item.sku)) {
        addToCart(item)
      }
    })
  }

  const availableItems = items.filter(item => item.stock_count > 0 && !isInCart(item.sku))

  return (
    <div className="min-h-screen bg-gray-50">
      <StorefrontHeader cartCount={cartCount} favoritesCount={favoritesCount} showMegaMenu={false} showCategoryTabs={false} />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/vitrin" className="text-gray-500 hover:text-orange-500">Ana Sayfa</Link>
            <span className="text-gray-300">/</span>
            <span style={{ color: COLORS.turuncu }}>Favorilerim</span>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: COLORS.kahverengi }}>
            Favorilerim
            {favoritesCount > 0 && (
              <span className="text-gray-400 font-normal text-lg ml-2">
                ({favoritesCount} ürün)
              </span>
            )}
          </h1>

          {items.length > 0 && (
            <div className="flex items-center gap-3">
              {availableItems.length > 0 && (
                <button
                  onClick={handleAddAllToCart}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: COLORS.turuncu }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Tümünü Sepete Ekle
                </button>
              )}
              <button
                onClick={clearFavorites}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Listeyi Temizle
              </button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyFavorites />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map(product => (
              <FavoriteCard
                key={product.sku}
                product={product}
                onRemove={removeFromFavorites}
                onAddToCart={handleAddToCart}
                isInCart={isInCart(product.sku)}
              />
            ))}
          </div>
        )}

        {/* Continue Shopping */}
        {items.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              to="/vitrin"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Alışverişe Devam Et
            </Link>
          </div>
        )}
      </main>

      <StorefrontFooter showTrustBadges={true} variant="minimal" />
    </div>
  )
}
