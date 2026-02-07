import { useState, memo, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { COLORS } from '../constants/colors'
import StorefrontHeader from '../components/layout/StorefrontHeader'
import StorefrontFooter from '../components/layout/StorefrontFooter'

// Cart Item Component
const CartItem = memo(function CartItem({ item, onUpdateQuantity, onRemove }) {
  const price = item.discount_price || item.sell_price || 0
  const originalPrice = item.sell_price || 0
  const hasDiscount = item.discount_price && item.discount_price < originalPrice
  const totalPrice = price * item.quantity

  const imageUrl = item.images && item.images.length > 0
    ? (typeof item.images === 'string' ? JSON.parse(item.images)[0] : item.images[0])
    : null

  return (
    <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100">
      {/* Image */}
      <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/product/${item.slug}`}
          className="font-medium text-gray-800 hover:text-orange-500 line-clamp-2"
        >
          {item.name}
        </Link>

        {item.brand && (
          <p className="text-sm text-gray-500 mt-1">{item.brand}</p>
        )}

        {item.variant_value && (
          <p className="text-sm text-gray-400 mt-0.5">{item.variant_type}: {item.variant_value}</p>
        )}

        {/* Price & Quantity */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {originalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </span>
            )}
            <span className="font-bold" style={{ color: COLORS.turuncu }}>
              {price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
            </span>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQuantity(item.sku, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-orange-400 hover:text-orange-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.sku, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-orange-400 hover:text-orange-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Total & Remove */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => onRemove(item.sku)}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Ürünü Kaldır"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <span className="font-bold text-lg" style={{ color: COLORS.kahverengi }}>
          {totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
        </span>
      </div>
    </div>
  )
})

// Empty Cart Component
const EmptyCart = memo(function EmptyCart() {
  return (
    <div className="text-center py-16">
      <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Sepetiniz Boş</h2>
      <p className="text-gray-500 mb-6">
        Haydi, evcil dostunuz için en güzel ürünleri keşfedin!
      </p>
      <Link
        to="/vitrin"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-transform hover:scale-105"
        style={{ backgroundColor: COLORS.turuncu }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Alışverişe Başla
      </Link>
    </div>
  )
})

// Order Summary Component
const OrderSummary = memo(function OrderSummary({ items, total, onCheckout }) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const shippingFree = total >= 500
  const shippingCost = shippingFree ? 0 : 29.90
  const grandTotal = total + shippingCost

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-24">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Sipariş Özeti</h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Ürünler ({itemCount} adet)</span>
          <span className="font-medium">{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Kargo</span>
          {shippingFree ? (
            <span className="text-green-600 font-medium">Ücretsiz</span>
          ) : (
            <span className="font-medium">{shippingCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
          )}
        </div>

        {!shippingFree && (
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <p className="text-sm text-orange-600">
              <span className="font-medium">{(500 - total).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span> daha ekleyin,
              <span className="font-bold"> ücretsiz kargo</span> kazanın!
            </p>
            <div className="mt-2 h-2 bg-orange-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min((total / 500) * 100, 100)}%`,
                  backgroundColor: COLORS.turuncu
                }}
              />
            </div>
          </div>
        )}

        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold" style={{ color: COLORS.kahverengi }}>Toplam</span>
            <span className="text-xl font-bold" style={{ color: COLORS.turuncu }}>
              {grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onCheckout}
        className="w-full mt-6 py-4 rounded-full text-white font-bold text-lg transition-transform hover:scale-[1.02]"
        style={{ backgroundColor: COLORS.turuncu }}
      >
        Siparişi Tamamla
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>256-bit SSL ile güvenli ödeme</span>
      </div>
    </div>
  )
})

// Main Cart Page Component
export default function CartPage() {
  const navigate = useNavigate()
  const { items, getCartTotal, getCartCount, updateQuantity, removeFromCart, clearCart } = useCart()

  const total = useMemo(() => getCartTotal(), [items])
  const cartCount = useMemo(() => getCartCount(), [items])

  const handleCheckout = () => {
    // Navigate to checkout page
    navigate('/odeme')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StorefrontHeader cartCount={cartCount} showMegaMenu={false} showCategoryTabs={false} />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/vitrin" className="text-gray-500 hover:text-orange-500">Ana Sayfa</Link>
            <span className="text-gray-300">/</span>
            <span style={{ color: COLORS.turuncu }}>Sepetim</span>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: COLORS.kahverengi }}>
            Sepetim
            {cartCount > 0 && (
              <span className="text-gray-400 font-normal text-lg ml-2">
                ({cartCount} ürün)
              </span>
            )}
          </h1>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Sepeti Temizle
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <CartItem
                  key={item.sku}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <OrderSummary
                items={items}
                total={total}
                onCheckout={handleCheckout}
              />
            </div>
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
