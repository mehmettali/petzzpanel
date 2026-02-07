import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import { PETZZSHOP_CATEGORIES, getProductBySlug, SAMPLE_PRODUCTS } from '../data/categories'
import {
  ShoppingCart, Heart, Share2, ChevronRight, ChevronLeft, Star, Check,
  Truck, Shield, Clock, Package, Minus, Plus, X, ChevronDown, ChevronUp,
  MessageCircle, Award, Leaf, AlertCircle, Phone, Info, Zap, Gift, Users,
  ThumbsUp, Calendar, Menu, Search, User, Home, RotateCcw, CreditCard,
  Mail, Eye, Copy, Facebook, Twitter, Send, Play, Percent, Tag, Box
} from 'lucide-react'
import { COLORS } from '../constants/colors'
import { formatPrice, calculateDiscount } from '../utils/helpers'
import StorefrontHeader from '../components/layout/StorefrontHeader'
import StorefrontFooter from '../components/layout/StorefrontFooter'

// ==================== MOCK DATA ====================
const MOCK_PRODUCT = {
  id: '1',
  name: 'Royal Canin Kitten Yavru Kedi Maması',
  brand: 'Royal Canin',
  brandLogo: 'https://cdn.royalcanin.com/content/dam/rcmedia/royal-canin-logo.svg',
  slug: 'royal-canin-kitten-yavru-kedi-mamasi',
  sku: 'RC-KIT-2KG',
  barcode: '3182550702423',
  category: ['Kedi', 'Kedi Maması', 'Yavru Kedi Maması'],
  rating: 4.91,
  reviewCount: 127,
  soldCount: 2850,
  description: `
    <h3>Royal Canin Kitten - Yavru Kediler İçin Özel Formül</h3>
    <p>Royal Canin Kitten, 4-12 aylık yavru kedilerin büyüme dönemindeki beslenme ihtiyaçlarını karşılamak için özel olarak formüle edilmiştir.</p>
    <ul>
      <li><strong>Sağlıklı Büyüme:</strong> Yüksek kaliteli proteinler ve dengeli besin değerleri</li>
      <li><strong>Bağışıklık Sistemi:</strong> Antioksidan kompleksi ile güçlü bağışıklık</li>
      <li><strong>Sindirim Sağlığı:</strong> Prebiyotikler ile sağlıklı sindirim</li>
      <li><strong>Özel Kibble:</strong> Yavru kedilerin çenesine uygun boyut ve şekil</li>
    </ul>
  `,
  features: [
    { icon: 'protein', label: 'Yüksek Protein', value: '%36 protein içeriği' },
    { icon: 'immune', label: 'Bağışıklık Desteği', value: 'Antioksidan kompleksi' },
    { icon: 'digest', label: 'Sindirim Sağlığı', value: 'Prebiyotik içerir' },
    { icon: 'kibble', label: 'Özel Kibble', value: 'Yavru ağzına uygun' },
  ],
  variants: [
    { id: 'v1', weight: '400 Gr', price: 285, oldPrice: 350, stock: 15, sku: 'RC-KIT-400G' },
    { id: 'v2', weight: '2 Kg', price: 1000, oldPrice: 1325, stock: 8, sku: 'RC-KIT-2KG' },
    { id: 'v3', weight: '4 Kg', price: 1850, oldPrice: 2400, stock: 5, sku: 'RC-KIT-4KG' },
    { id: 'v4', weight: '10 Kg', price: 4200, oldPrice: 5500, stock: 3, sku: 'RC-KIT-10KG' },
  ],
  images: [
    'https://cdn.royalcanin.com/content/dam/rcmedia/products/kitten/packshot/FHN-Kitten-CV-EretailKit.png',
    'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&h=600&fit=crop',
  ],
  badges: ['Orijinal Ürün', 'Hızlı Kargo', 'SKT Güvencesi'],
  faq: [
    { q: 'Bu mama kaç aylık kedilere uygundur?', a: '4-12 aylık yavru kediler için önerilir. 12 aydan sonra yetişkin mamasına geçiş yapılmalıdır.' },
    { q: 'Günde ne kadar mama vermeliyim?', a: 'Kedinizin kilosuna göre besleme tablosunu takip edin. Genel olarak 2 kg bir yavru kedi için günlük 55-70 gram önerilir.' },
    { q: 'Yaş mama ile birlikte verilebilir mi?', a: 'Evet, kuru mama ile yaş mamayı birlikte verebilirsiniz. Karma beslenme kedilerin su alımını artırır.' },
  ],
}

const MOCK_REVIEWS = [
  { id: 1, author: 'Ayşe K.', avatar: 'A', rating: 5, date: '2 gün önce', text: 'Kedim bayıldı! Hızlı kargo için teşekkürler.', verified: true, helpful: 12, images: [] },
  { id: 2, author: 'Mehmet Y.', avatar: 'M', rating: 5, date: '1 hafta önce', text: 'Orijinal ürün, güvenle alışveriş yapabilirsiniz. SKT çok uzun.', verified: true, helpful: 8, images: [] },
  { id: 3, author: 'Zeynep A.', avatar: 'Z', rating: 4, date: '2 hafta önce', text: 'Ürün kaliteli ama biraz pahalı buldum Jean de kedimin sağlığı için tercih ediyorum.', verified: true, helpful: 5, images: [] },
  { id: 4, author: 'Ali R.', avatar: 'A', rating: 5, date: '3 hafta önce', text: '3 aydır kullanıyoruz, kedimizin tüyleri parlıyor!', verified: true, helpful: 15, images: [] },
]

// ==================== IMAGE GALLERY ====================
const ImageGallery = memo(({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })

  const handleMouseMove = (e) => {
    if (!isZoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  const nextImage = () => setActiveIndex((prev) => (prev + 1) % images.length)
  const prevImage = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div
        className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden cursor-zoom-in group"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={images[activeIndex]}
          alt={productName}
          className={`w-full h-full object-contain p-8 transition-transform duration-300 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : {}}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevImage() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Zoom Hint */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <Eye size={14} />
          Yakınlaştırmak için fareyi gezdirin
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 justify-center">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                idx === activeIndex
                  ? 'border-[#EF7F1A] shadow-lg scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-contain p-2 bg-gray-50" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

// ==================== VARIANT SELECTOR ====================
const VariantSelector = memo(({ variants, selectedId, onSelect }) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-700">Boyut Seçin:</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedId
          const discount = calculateDiscount(variant.oldPrice, variant.price)
          const isOutOfStock = variant.stock === 0

          return (
            <button
              key={variant.id}
              onClick={() => !isOutOfStock && onSelect(variant.id)}
              disabled={isOutOfStock}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                isOutOfStock
                  ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                  : isSelected
                  ? 'border-[#EF7F1A] bg-orange-50 shadow-lg'
                  : 'border-gray-200 hover:border-[#EF7F1A]/50 hover:shadow'
              }`}
            >
              {discount > 0 && !isOutOfStock && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  %{discount}
                </span>
              )}
              <div className="font-bold text-gray-800">{variant.weight}</div>
              <div className="mt-1">
                <span className="text-lg font-bold text-[#EF7F1A]">{formatPrice(variant.price)}</span>
                {variant.oldPrice > variant.price && (
                  <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(variant.oldPrice)}</span>
                )}
              </div>
              {isOutOfStock ? (
                <span className="text-xs text-red-500 mt-1 block">Stokta Yok</span>
              ) : variant.stock <= 5 ? (
                <span className="text-xs text-orange-500 mt-1 block">Son {variant.stock} adet!</span>
              ) : null}
              {isSelected && !isOutOfStock && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[#EF7F1A] rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
})

// ==================== QUANTITY SELECTOR ====================
const QuantitySelector = memo(({ quantity, maxQuantity, onChange }) => {
  return (
    <div className="flex items-center gap-4">
      <label className="text-sm font-semibold text-gray-700">Adet:</label>
      <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => onChange(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
          className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Minus size={18} />
        </button>
        <span className="w-16 text-center font-bold text-lg">{quantity}</span>
        <button
          onClick={() => onChange(Math.min(maxQuantity, quantity + 1))}
          disabled={quantity >= maxQuantity}
          className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={18} />
        </button>
      </div>
      {maxQuantity <= 10 && (
        <span className="text-sm text-orange-500">Maksimum {maxQuantity} adet</span>
      )}
    </div>
  )
})

// ==================== TRUST BADGES ====================
const TrustBadges = memo(() => (
  <div className="grid grid-cols-2 gap-3 mt-6">
    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
      <Truck className="text-green-600" size={24} />
      <div>
        <div className="text-sm font-semibold text-green-800">Ücretsiz Kargo</div>
        <div className="text-xs text-green-600">300₺ üzeri siparişlerde</div>
      </div>
    </div>
    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
      <Shield className="text-blue-600" size={24} />
      <div>
        <div className="text-sm font-semibold text-blue-800">Orijinal Ürün</div>
        <div className="text-xs text-blue-600">%100 orjinallik garantisi</div>
      </div>
    </div>
    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
      <RotateCcw className="text-purple-600" size={24} />
      <div>
        <div className="text-sm font-semibold text-purple-800">14 Gün İade</div>
        <div className="text-xs text-purple-600">Koşulsuz iade garantisi</div>
      </div>
    </div>
    <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
      <Clock className="text-amber-600" size={24} />
      <div>
        <div className="text-sm font-semibold text-amber-800">Hızlı Teslimat</div>
        <div className="text-xs text-amber-600">1-3 iş günü içinde</div>
      </div>
    </div>
  </div>
))

// ==================== PRODUCT TABS ====================
const ProductTabs = memo(({ product, reviews }) => {
  const [activeTab, setActiveTab] = useState('description')

  const tabs = [
    { id: 'description', label: 'Ürün Açıklaması', icon: Info },
    { id: 'features', label: 'Özellikler', icon: Award },
    { id: 'reviews', label: `Değerlendirmeler (${reviews.length})`, icon: Star },
    { id: 'faq', label: 'Sıkça Sorulan Sorular', icon: MessageCircle },
  ]

  return (
    <div className="mt-12">
      {/* Tab Headers */}
      <div className="flex overflow-x-auto border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#EF7F1A] text-[#EF7F1A]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-8">
        {activeTab === 'description' && (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
        )}

        {activeTab === 'features' && (
          <div className="grid md:grid-cols-2 gap-6">
            {product.features?.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-[#EF7F1A]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="text-[#EF7F1A]" size={24} />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{feature.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{feature.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Rating Summary */}
            <div className="flex flex-col md:flex-row gap-8 p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl">
              <div className="text-center md:text-left">
                <div className="text-5xl font-bold text-[#EF7F1A]">{product.rating}</div>
                <div className="flex items-center justify-center md:justify-start gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-600 mt-1">{product.reviewCount} değerlendirme</div>
              </div>
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter(r => r.rating === star).length
                  const percent = (count / reviews.length) * 100
                  return (
                    <div key={star} className="flex items-center gap-3 mb-2">
                      <span className="text-sm w-12">{star} Yıldız</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-sm text-gray-500 w-8">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-6 bg-white border rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#EF7F1A] to-[#D66A0F] rounded-full flex items-center justify-center text-white font-bold">
                        {review.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 flex items-center gap-2">
                          {review.author}
                          {review.verified && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check size={10} /> Onaylı Alıcı
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">{review.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-700">{review.text}</p>
                  <div className="mt-4 flex items-center gap-4">
                    <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#EF7F1A]">
                      <ThumbsUp size={14} />
                      Faydalı ({review.helpful})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="space-y-4">
            {product.faq?.map((item, idx) => (
              <details key={idx} className="group bg-white border rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50">
                  <span className="font-semibold text-gray-800">{item.q}</span>
                  <ChevronDown size={20} className="text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-gray-600">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

// ==================== RELATED PRODUCTS ====================
const RelatedProducts = memo(({ currentProductId }) => {
  const { addToCart, isInCart } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()

  const relatedProducts = SAMPLE_PRODUCTS.filter(p => p.id !== currentProductId).slice(0, 4)

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Benzer Ürünler</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {relatedProducts.map((product) => {
          const discount = product.discount || calculateDiscount(product.oldPrice, product.price)
          const productId = product.sku || product.id

          return (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              className="group bg-white rounded-2xl border hover:border-[#EF7F1A]/30 hover:shadow-xl transition-all overflow-hidden"
            >
              <div className="relative aspect-square bg-gray-50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform"
                />
                {discount > 0 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                    %{discount}
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    toggleFavorite({
                      sku: productId,
                      name: product.name,
                      brand: product.brand,
                      slug: product.slug,
                      sell_price: product.oldPrice || product.price,
                      discount_price: product.price,
                      images: JSON.stringify([product.image]),
                    })
                  }}
                  className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow ${
                    isFavorite(productId) ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart size={14} fill={isFavorite(productId) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="p-4">
                <span className="text-xs text-[#EF7F1A] font-semibold">{product.brand}</span>
                <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mt-1 group-hover:text-[#EF7F1A]">
                  {product.name}
                </h3>
                {product.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs text-gray-600">{product.rating}</span>
                  </div>
                )}
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-lg font-bold text-[#EF7F1A]">{formatPrice(product.price)}</span>
                  {product.oldPrice && (
                    <span className="text-xs text-gray-400 line-through">{formatPrice(product.oldPrice)}</span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
})

// ==================== MAIN COMPONENT ====================
export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const foundProduct = useMemo(() => {
    const sampleProduct = getProductBySlug(slug)
    if (sampleProduct) {
      return {
        ...MOCK_PRODUCT,
        id: sampleProduct.id,
        name: sampleProduct.name,
        brand: sampleProduct.brand,
        slug: sampleProduct.slug,
        category: sampleProduct.categoryPath || ['Genel'],
        rating: sampleProduct.rating || 4.5,
        reviewCount: sampleProduct.reviewCount || 0,
        images: sampleProduct.images || [sampleProduct.image],
        badges: sampleProduct.badges || [],
        variants: sampleProduct.variants || [
          {
            id: 'v1',
            weight: sampleProduct.variant || 'Standart',
            price: sampleProduct.price,
            oldPrice: sampleProduct.oldPrice,
            stock: sampleProduct.stock || 10,
            sku: sampleProduct.id
          }
        ]
      }
    }
    return MOCK_PRODUCT
  }, [slug])

  const [product] = useState(foundProduct)
  const [selectedVariantId, setSelectedVariantId] = useState(foundProduct.variants[0]?.id || 'v1')
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  const { addToCart, isInCart, getCartCount } = useCart()
  const { toggleFavorite, isFavorite, getFavoritesCount } = useFavorites()

  const cartCount = getCartCount()
  const favoritesCount = getFavoritesCount()

  const selectedVariant = useMemo(() =>
    product.variants.find(v => v.id === selectedVariantId) || product.variants[0],
    [product.variants, selectedVariantId]
  )

  const discount = calculateDiscount(selectedVariant?.oldPrice, selectedVariant?.price)
  const productId = selectedVariant?.sku || product.sku || product.id

  const productForCart = useMemo(() => ({
    sku: productId,
    name: product.name,
    brand: product.brand,
    slug: product.slug,
    sell_price: selectedVariant?.oldPrice || selectedVariant?.price,
    discount_price: selectedVariant?.price,
    stock_count: selectedVariant?.stock || 0,
    images: JSON.stringify(product.images),
    variant_type: 'Boyut',
    variant_value: selectedVariant?.weight || '',
  }), [product, selectedVariant, productId])

  const handleAddToCart = useCallback(() => {
    if (selectedVariant?.stock === 0) return

    setIsAddingToCart(true)
    for (let i = 0; i < quantity; i++) {
      addToCart(productForCart)
    }

    setAddedToCart(true)
    setTimeout(() => {
      setIsAddingToCart(false)
      setAddedToCart(false)
    }, 2000)
  }, [addToCart, productForCart, quantity, selectedVariant])

  const handleToggleFavorite = useCallback(() => {
    toggleFavorite(productForCart)
  }, [toggleFavorite, productForCart])

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Link kopyalandı!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StorefrontHeader cartCount={cartCount} favoritesCount={favoritesCount} showMegaMenu={false} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap">
          <Link to="/vitrin" className="hover:text-[#EF7F1A] flex items-center gap-1">
            <Home size={14} />
            Anasayfa
          </Link>
          {product.category?.map((cat, idx) => (
            <span key={idx} className="flex items-center gap-2">
              <ChevronRight size={14} className="text-gray-400" />
              <Link to={`/kategori/${cat.toLowerCase().replace(/ /g, '-')}`} className="hover:text-[#EF7F1A]">
                {cat}
              </Link>
            </span>
          ))}
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product Section */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left - Images */}
          <div className="lg:sticky lg:top-32 lg:self-start">
            <ImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Right - Product Info */}
          <div className="space-y-6">
            {/* Brand & Badges */}
            <div className="flex items-center justify-between">
              <Link
                to={`/kategori?brand=${product.brand}`}
                className="text-sm font-semibold text-[#EF7F1A] hover:underline uppercase tracking-wide"
              >
                {product.brand}
              </Link>
              <div className="flex items-center gap-2">
                {product.badges?.slice(0, 2).map((badge, idx) => (
                  <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating & Stats */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="font-semibold">{product.rating}</span>
                <span className="text-gray-500">({product.reviewCount} değerlendirme)</span>
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <Users size={14} />
                {product.soldCount?.toLocaleString()}+ satış
              </div>
            </div>

            {/* Price */}
            <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl">
              <div className="flex items-end gap-4">
                <span className="text-4xl font-bold text-[#EF7F1A]">
                  {formatPrice(selectedVariant?.price)}
                </span>
                {selectedVariant?.oldPrice > selectedVariant?.price && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(selectedVariant.oldPrice)}
                    </span>
                    <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      %{discount} İndirim
                    </span>
                  </>
                )}
              </div>
              {selectedVariant?.oldPrice > selectedVariant?.price && (
                <p className="text-sm text-green-600 mt-2 font-medium">
                  🎉 Bu üründe {formatPrice(selectedVariant.oldPrice - selectedVariant.price)} tasarruf ediyorsunuz!
                </p>
              )}
            </div>

            {/* Variants */}
            <VariantSelector
              variants={product.variants}
              selectedId={selectedVariantId}
              onSelect={setSelectedVariantId}
            />

            {/* Quantity */}
            <QuantitySelector
              quantity={quantity}
              maxQuantity={selectedVariant?.stock || 10}
              onChange={setQuantity}
            />

            {/* Add to Cart & Favorite */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={selectedVariant?.stock === 0 || isAddingToCart}
                className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                  selectedVariant?.stock === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : addedToCart
                    ? 'bg-green-500 text-white'
                    : 'bg-gradient-to-r from-[#EF7F1A] to-[#D66A0F] text-white hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5'
                }`}
              >
                {selectedVariant?.stock === 0 ? (
                  'Stokta Yok'
                ) : addedToCart ? (
                  <>
                    <Check size={24} />
                    Sepete Eklendi!
                  </>
                ) : isAddingToCart ? (
                  <span className="animate-pulse">Ekleniyor...</span>
                ) : (
                  <>
                    <ShoppingCart size={24} />
                    Sepete Ekle
                  </>
                )}
              </button>

              <button
                onClick={handleToggleFavorite}
                className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all ${
                  isFavorite(productId)
                    ? 'bg-red-50 border-red-500 text-red-500'
                    : 'border-gray-200 text-gray-400 hover:border-red-500 hover:text-red-500'
                }`}
              >
                <Heart size={24} fill={isFavorite(productId) ? 'currentColor' : 'none'} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="w-16 h-16 rounded-2xl border-2 border-gray-200 text-gray-400 hover:border-[#EF7F1A] hover:text-[#EF7F1A] flex items-center justify-center transition-all"
                >
                  <Share2 size={24} />
                </button>
                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border p-4 z-10 min-w-[200px]">
                    <div className="space-y-2">
                      <button onClick={copyLink} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm">
                        <Copy size={16} /> Linki Kopyala
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm text-blue-600">
                        <Facebook size={16} /> Facebook
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm text-sky-500">
                        <Twitter size={16} /> Twitter
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm text-green-600">
                        <Send size={16} /> WhatsApp
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trust Badges */}
            <TrustBadges />

            {/* SKU & Barcode */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 pt-4 border-t">
              <span>SKU: <strong>{selectedVariant?.sku || product.sku}</strong></span>
              <span>Barkod: <strong>{product.barcode}</strong></span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <ProductTabs product={product} reviews={MOCK_REVIEWS} />

        {/* Related Products */}
        <RelatedProducts currentProductId={product.id} />
      </main>

      <StorefrontFooter />

      {/* Sticky Add to Cart Bar (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-4 lg:hidden z-40">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-2xl font-bold text-[#EF7F1A]">{formatPrice(selectedVariant?.price)}</div>
            {discount > 0 && (
              <div className="text-sm text-gray-400 line-through">{formatPrice(selectedVariant?.oldPrice)}</div>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={selectedVariant?.stock === 0}
            className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 ${
              selectedVariant?.stock === 0
                ? 'bg-gray-200 text-gray-500'
                : addedToCart
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-[#EF7F1A] to-[#D66A0F] text-white'
            }`}
          >
            {addedToCart ? <Check size={20} /> : <ShoppingCart size={20} />}
            {addedToCart ? 'Eklendi!' : 'Sepete Ekle'}
          </button>
        </div>
      </div>
    </div>
  )
}
