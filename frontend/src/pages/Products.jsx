import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Search, Filter, ChevronLeft, ChevronRight, Package, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, Minus, BarChart3, Users, Truck,
  Tag, Box, Download, RefreshCw, AlertCircle, Maximize2, Minimize2,
  Trophy, Medal, Award, Target, Zap, ExternalLink, Store, ShoppingBag
} from 'lucide-react'
import { getProducts, getProduct, getCategories, getBrands, getSuppliers } from '../services/api'
import { Card } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/Spinner'
import { Skeleton } from '../components/ui/Skeleton'
import { SearchInput } from '../components/ui/Form'
import { formatCurrency, formatNumber, formatDate, truncate } from '../utils/formatters'
import clsx from 'clsx'

// Akakce Position Badge
function AkakcePositionBadge({ position, total }) {
  if (!position || !total) return <span className="text-gray-400 text-xs">-</span>

  const getStyle = () => {
    if (position === 1) return { icon: Trophy, color: 'text-yellow-600 bg-yellow-50', label: '1.' }
    if (position === 2) return { icon: Medal, color: 'text-gray-500 bg-gray-50', label: '2.' }
    if (position === 3) return { icon: Award, color: 'text-orange-600 bg-orange-50', label: '3.' }
    if (position <= 5) return { icon: Target, color: 'text-blue-600 bg-blue-50', label: `${position}.` }
    return { icon: null, color: 'text-gray-600 bg-gray-50', label: `${position}.` }
  }

  const style = getStyle()
  const Icon = style.icon

  return (
    <div className={clsx("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", style.color)}>
      {Icon && <Icon className="w-3 h-3" />}
      <span>{style.label}</span>
      <span className="text-gray-400">/ {total}</span>
    </div>
  )
}

// Mini Price Position Bar
function PricePositionBar({ product, compact = false }) {
  if (!product.akakce_low_price || !product.akakce_high_price) return null

  const low = product.akakce_low_price
  const high = product.akakce_high_price
  // ikas fiyatı varsa onu kullan, yoksa panel fiyatı
  const petzz = product.storefront?.has_data ? product.storefront.sell_price : product.selling_price
  if (!petzz) return null

  const range = high - low
  if (range === 0) return null

  let position = ((petzz - low) / range) * 100
  position = Math.max(0, Math.min(100, position))

  const getColor = () => {
    if (position <= 15) return 'bg-green-500'
    if (position <= 35) return 'bg-lime-500'
    if (position <= 55) return 'bg-yellow-500'
    if (position <= 75) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className={compact ? "w-16" : "w-20"}>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${getColor()}`} style={{ width: `${position}%` }} />
      </div>
    </div>
  )
}

// Competitor Chart
function CompetitorChart({ competitors, petzzPrice }) {
  if (!competitors || competitors.length === 0) return null

  const maxPrice = Math.max(...competitors.map(c => c.seller_price), petzzPrice)

  return (
    <div className="space-y-1">
      {competitors.slice(0, 10).map((c, i) => {
        const width = maxPrice > 0 ? (c.seller_price / maxPrice) * 100 : 0
        const isPetzz = c.seller_name?.toLowerCase().includes('petzz')

        return (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className={clsx(
              "w-32 truncate",
              isPetzz ? "font-semibold text-primary-600" : "text-gray-600"
            )}>
              {i + 1}. {c.seller_name}
            </span>
            <div className="flex-1 h-3 bg-gray-100 rounded overflow-hidden">
              <div
                className={clsx(
                  "h-full rounded",
                  isPetzz ? "bg-primary-500" : i === 0 ? "bg-green-500" : "bg-gray-300"
                )}
                style={{ width: `${width}%` }}
              />
            </div>
            <span className={clsx(
              "w-20 text-right font-mono",
              isPetzz ? "font-semibold text-primary-600" : ""
            )}>
              {formatCurrency(c.seller_price)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// Expanded Row Detail - rowProduct contains the already-loaded row data
function ProductDetail({ productId, rowProduct, isFullscreen }) {
  // Only fetch additional data (competitors, metas) - use row data for basic fields
  const { data: extraData, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId),
    enabled: !!productId,
  })

  // Merge: use row data as base, add competitors/metas from extra query
  const product = rowProduct ? {
    ...rowProduct,
    competitors: extraData?.competitors || [],
    metas: extraData?.metas || [],
    // Keep petzzshop_url from row data (already correct)
  } : extraData

  if (isLoading && !rowProduct) {
    return (
      <div className="p-6 bg-gray-50 border-t">
        <Skeleton className="h-4 w-3/4" />
      </div>
    )
  }

  if (!product) return null

  // Gerçek satış fiyatını al (ikas > panel)
  const effectiveSellPrice = product.storefront?.has_data
    ? product.storefront.sell_price
    : product.selling_price
  const hasSfData = product.storefront?.has_data

  const margin = effectiveSellPrice > 0 && product.buying_price > 0
    ? ((effectiveSellPrice - product.buying_price) / effectiveSellPrice) * 100
    : 0

  const priceDiffFromMin = product.akakce_low_price && effectiveSellPrice
    ? effectiveSellPrice - product.akakce_low_price
    : null

  const priceDiffPercent = product.akakce_low_price && product.akakce_low_price > 0 && effectiveSellPrice
    ? ((effectiveSellPrice - product.akakce_low_price) / product.akakce_low_price) * 100
    : null

  // Petzz'i competitors'da bul (varsa en güncel veri oradan gelir)
  const petzzCompetitor = product.competitors?.find(c =>
    c.seller_name?.toLowerCase().includes('petzz')
  )
  const petzzPosition = petzzCompetitor
    ? product.competitors.indexOf(petzzCompetitor)
    : -1
  // Petzz fiyatı: önce competitor, sonra akakce_petzz_price, sonra storefront, en son panel
  const petzzPrice = petzzCompetitor?.seller_price || product.akakce_petzz_price || effectiveSellPrice

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white border-t">
      <div className={clsx("p-4", isFullscreen ? "grid grid-cols-5 gap-4" : "grid grid-cols-4 gap-6")}>

        {/* Column 1: Product Info */}
        <div className="space-y-3">
          <div className="flex gap-3">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt="" className="w-16 h-16 object-cover rounded-lg border" />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-300" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm leading-tight">{product.name}</p>
              <p className="text-xs text-gray-500 mt-1 font-mono">{product.code}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex gap-2 mt-2">
            {product.petzzshop_url ? (
              <a
                href={product.petzzshop_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors text-xs font-medium"
              >
                <Store className="w-4 h-4" />
                PetzzShop
              </a>
            ) : (
              <span className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-400 text-xs">
                <Store className="w-4 h-4" />
                Vitrin Yok
              </span>
            )}
            {product.akakce_url ? (
              <a
                href={product.akakce_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors text-xs font-medium"
              >
                <ShoppingBag className="w-4 h-4" />
                Akakce
              </a>
            ) : (
              <span className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-gray-400 text-xs">
                <ShoppingBag className="w-4 h-4" />
                Akakce Yok
              </span>
            )}
          </div>

          {product.metas && product.metas.length > 0 && (
            <div className="bg-white rounded border p-2">
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Varyantlar</h4>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {product.metas.map((m, i) => (
                  <div key={i} className="flex justify-between text-xs bg-gray-50 rounded px-2 py-1">
                    <span>{m.value || 'Standart'}</span>
                    <span className={m.quantity === 0 ? "text-red-600" : "text-green-600"}>
                      {m.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Financial */}
        <div className="bg-white rounded border p-3">
          <h4 className="text-[10px] font-semibold text-gray-500 uppercase mb-2">Finansal</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Alış</span>
              <span className="font-mono">{formatCurrency(product.buying_price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Satış {!hasSfData && <span className="text-[9px] text-yellow-600">(Panel)</span>}</span>
              {effectiveSellPrice ? (
                <span className="font-mono font-semibold">{formatCurrency(effectiveSellPrice)}</span>
              ) : (
                <span className="text-gray-400 text-xs">Veri Yok</span>
              )}
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-500">Brüt Kar</span>
              <span className={clsx("font-mono", (effectiveSellPrice - product.buying_price) < 0 && "text-red-600")}>
                {effectiveSellPrice ? formatCurrency(effectiveSellPrice - product.buying_price) : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Marj</span>
              <span className={clsx(
                "font-mono font-semibold",
                margin < 10 ? "text-red-600" : margin < 20 ? "text-yellow-600" : "text-green-600"
              )}>%{margin.toFixed(1)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-500">Stok Değeri</span>
              <span className="font-mono">{formatCurrency(product.total_quantity * product.buying_price)}</span>
            </div>
          </div>
        </div>

        {/* Column 3: Akakce */}
        <div className="bg-white rounded border p-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[10px] font-semibold text-gray-500 uppercase">Akakce Analiz</h4>
            {product.akakce_url && (
              <a
                href={product.akakce_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Akakce
              </a>
            )}
          </div>
          {product.akakce_product_id ? (
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 rounded p-1.5 text-center">
                  <p className="text-[9px] text-green-600">EN DÜŞÜK</p>
                  <p className="font-mono font-semibold text-green-700">{formatCurrency(product.akakce_low_price)}</p>
                </div>
                <div className="bg-red-50 rounded p-1.5 text-center">
                  <p className="text-[9px] text-red-600">EN YÜKSEK</p>
                  <p className="font-mono font-semibold text-red-700">{formatCurrency(product.akakce_high_price)}</p>
                </div>
              </div>
              <div className="bg-primary-50 rounded p-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-primary-600">PETZZ</span>
                  {petzzPosition >= 0 && (
                    <Badge variant="primary" size="xs">#{petzzPosition + 1}</Badge>
                  )}
                </div>
                <p className="font-mono font-bold text-primary-700">{formatCurrency(petzzPrice)}</p>
              </div>
              {priceDiffFromMin !== null && (
                <div className={clsx("rounded p-1.5", priceDiffFromMin <= 0 ? "bg-green-50" : "bg-yellow-50")}>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fark</span>
                    <span className={priceDiffFromMin <= 0 ? "text-green-600" : "text-yellow-600"}>
                      {priceDiffFromMin > 0 ? '+' : ''}{formatCurrency(priceDiffFromMin)} ({priceDiffPercent?.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-gray-400">Hedef</span>
                  <p className="font-mono">{formatCurrency(product.akakce_target_price)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Drop</span>
                  <p className="font-mono">{formatCurrency(product.akakce_drop_price)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400">
              <AlertCircle className="w-6 h-6 mx-auto mb-1" />
              <p className="text-xs">Akakce verisi yok</p>
            </div>
          )}
        </div>

        {/* Column 4: Competitors */}
        <div className={clsx("bg-white rounded border p-3", isFullscreen && "col-span-2")}>
          <h4 className="text-[10px] font-semibold text-gray-500 uppercase mb-2">
            Rakipler ({product.competitors?.length || 0})
          </h4>
          {product.competitors && product.competitors.length > 0 ? (
            <CompetitorChart competitors={product.competitors} petzzPrice={effectiveSellPrice || 0} />
          ) : (
            <div className="text-center py-4 text-gray-400">
              <Users className="w-6 h-6 mx-auto mb-1" />
              <p className="text-xs">Rakip verisi yok</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Products() {
  const [searchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [brandSearch, setBrandSearch] = useState('')
  const [supplier, setSupplier] = useState('')
  const [stockStatus, setStockStatus] = useState('')
  const [priceStatus, setPriceStatus] = useState('')
  const [hasAkakce, setHasAkakce] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // URL'den arama parametresini al
  useEffect(() => {
    const urlSearch = searchParams.get('search')
    if (urlSearch) {
      setSearch(urlSearch)
    }
  }, [searchParams])

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', { page, search, category, subCategory, brand, supplier, stockStatus, priceStatus, hasAkakce, sortBy, sortOrder }],
    queryFn: () => getProducts({ page, limit: 50, search, category, subCategory, brand, supplier, stockStatus, priceStatus, hasAkakce, sortBy, sortOrder }),
  })

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const { data: brands } = useQuery({ queryKey: ['brands'], queryFn: getBrands })
  const { data: suppliers } = useQuery({ queryKey: ['suppliers'], queryFn: getSuppliers })

  const uniqueCategories = useMemo(() =>
    [...new Set(categories?.map(c => c.main_category).filter(Boolean))], [categories]
  )

  // Seçili ana kategoriye göre alt kategoriler
  const subCategories = useMemo(() => {
    if (!category || !categories) return []
    return [...new Set(
      categories
        .filter(c => c.main_category === category)
        .map(c => c.sub_category)
        .filter(Boolean)
    )]
  }, [categories, category])

  // Marka aramasına göre filtrelenmiş markalar
  const filteredBrands = useMemo(() => {
    if (!brands) return []
    if (!brandSearch) return brands
    const search = brandSearch.toLowerCase()
    return brands.filter(b => b.brand?.toLowerCase().includes(search))
  }, [brands, brandSearch])

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const SortIndicator = ({ column }) => {
    if (sortBy !== column) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-primary-600 ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
  }

  const getStockBadge = (quantity) => {
    if (quantity === 0) return <Badge variant="danger" size="xs">Yok</Badge>
    if (quantity < 5) return <Badge variant="warning" size="xs">{quantity}</Badge>
    if (quantity < 20) return <Badge variant="info" size="xs">{quantity}</Badge>
    return <Badge variant="success" size="xs">{quantity}</Badge>
  }

  // Gerçek satış fiyatını al (ikas'tan, yoksa panel'den)
  const getEffectiveSellPrice = (p) => {
    // Öncelik: ikas storefront fiyatı
    if (p.storefront?.has_data && p.storefront.sell_price) {
      return { price: p.storefront.sell_price, source: 'storefront' }
    }
    // Fallback: Panel fiyatı (eski veri)
    if (p.selling_price) {
      return { price: p.selling_price, source: 'panel' }
    }
    return { price: null, source: null }
  }

  const getMargin = (p) => {
    const sellInfo = getEffectiveSellPrice(p)
    if (!p.buying_price || !sellInfo.price || p.buying_price === 0) return null
    return ((sellInfo.price - p.buying_price) / sellInfo.price) * 100
  }

  const getMarginBadge = (margin) => {
    if (margin === null) return '-'
    if (margin < 0) return <span className="text-red-600 font-mono text-xs">%{margin.toFixed(0)}</span>
    if (margin < 10) return <span className="text-red-500 font-mono text-xs">%{margin.toFixed(0)}</span>
    if (margin < 20) return <span className="text-yellow-600 font-mono text-xs">%{margin.toFixed(0)}</span>
    if (margin < 30) return <span className="text-green-600 font-mono text-xs">%{margin.toFixed(0)}</span>
    return <span className="text-green-700 font-mono text-xs font-bold">%{margin.toFixed(0)}</span>
  }

  const getPriceDiff = (p) => {
    if (!p.akakce_low_price) return null
    const sellInfo = getEffectiveSellPrice(p)
    if (!sellInfo.price) return null
    return ((sellInfo.price - p.akakce_low_price) / p.akakce_low_price) * 100
  }

  const getPriceDiffBadge = (diff) => {
    if (diff === null) return '-'
    if (diff <= -5) return <span className="text-green-600 font-mono text-xs font-bold">{diff.toFixed(0)}%</span>
    if (diff < 0) return <span className="text-green-500 font-mono text-xs">{diff.toFixed(0)}%</span>
    if (diff < 5) return <span className="text-yellow-600 font-mono text-xs">+{diff.toFixed(0)}%</span>
    if (diff < 15) return <span className="text-orange-500 font-mono text-xs">+{diff.toFixed(0)}%</span>
    return <span className="text-red-600 font-mono text-xs font-bold">+{diff.toFixed(0)}%</span>
  }

  // Mock Akakce position - in real scenario this would come from API
  const getAkakcePosition = (p) => {
    if (!p.akakce_total_sellers || !p.akakce_low_price) return null
    // ikas fiyatı varsa onu kullan, yoksa panel fiyatı
    const sellInfo = getEffectiveSellPrice(p)
    if (!sellInfo.price) return null
    // Estimate position based on price
    const diff = sellInfo.price - p.akakce_low_price
    const range = p.akakce_high_price - p.akakce_low_price
    if (range === 0) return 1
    const percentile = diff / range
    return Math.max(1, Math.min(p.akakce_total_sellers, Math.ceil(percentile * p.akakce_total_sellers)))
  }

  const resetFilters = () => {
    setSearch(''); setCategory(''); setSubCategory(''); setBrand(''); setBrandSearch(''); setSupplier(''); setStockStatus(''); setPriceStatus(''); setHasAkakce(''); setPage(1)
  }

  const hasActiveFilters = search || category || subCategory || brand || supplier || stockStatus || priceStatus || hasAkakce

  if (isLoading) return <LoadingState message="Ürünler yükleniyor..." />
  if (error) return <ErrorState message="Ürünler yüklenemedi" />

  const { products, pagination } = data || { products: [], pagination: {} }

  return (
    <div className={clsx(
      "transition-all duration-300",
      isFullscreen
        ? "fixed inset-0 z-50 bg-white overflow-auto p-4"
        : "space-y-4"
    )}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={clsx("font-bold text-gray-900", isFullscreen ? "text-xl" : "text-2xl")}>
            Ürün Yönetimi
          </h1>
          <p className="text-gray-500 text-sm">
            {formatNumber(pagination.total)} ürün • Detay için satıra tıklayın
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={clsx(
              "flex items-center gap-2 px-3 py-2 text-sm border rounded-lg",
              isFullscreen ? "bg-primary-50 border-primary-200 text-primary-700" : "hover:bg-gray-50"
            )}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {isFullscreen ? "Küçült" : "Tam Ekran"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[200px]">
            <SearchInput
              placeholder="Ara..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              onClear={() => { setSearch(''); setPage(1); }}
              size="sm"
            />
          </div>

          <select value={category} onChange={(e) => { setCategory(e.target.value); setSubCategory(''); setPage(1); }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
            <option value="">Ana Kategori</option>
            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          {category && subCategories.length > 0 && (
            <select value={subCategory} onChange={(e) => { setSubCategory(e.target.value); setPage(1); }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
              <option value="">Alt Kategori</option>
              {subCategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
            </select>
          )}

          {/* Marka Arama + Seçim */}
          <div className="relative">
            <input
              type="text"
              placeholder="Marka ara..."
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              className="w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
          <select value={brand} onChange={(e) => { setBrand(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none max-w-[200px]">
            <option value="">Marka ({filteredBrands?.length || 0})</option>
            {filteredBrands?.map(b => <option key={b.brand} value={b.brand}>{b.brand} ({b.product_count})</option>)}
          </select>

          <select value={supplier} onChange={(e) => { setSupplier(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
            <option value="">Tedarikçi</option>
            {suppliers?.slice(0, 30).map(s => <option key={s.supplier_name} value={s.supplier_name}>{truncate(s.supplier_name, 25)}</option>)}
          </select>

          <select value={stockStatus} onChange={(e) => { setStockStatus(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
            <option value="">Stok</option>
            <option value="in-stock">Stokta</option>
            <option value="out-of-stock">Yok</option>
            <option value="low-stock">Kritik</option>
          </select>

          <select value={priceStatus} onChange={(e) => { setPriceStatus(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
            <option value="">Fiyat Durumu</option>
            <option value="cheaper">En Ucuz</option>
            <option value="competitive">Rekabetçi</option>
            <option value="expensive">Pahalı</option>
          </select>

          <select value={hasAkakce} onChange={(e) => { setHasAkakce(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
            <option value="">Akakce Durumu</option>
            <option value="yes">Akakce Var ✓</option>
            <option value="no">Akakce Yok ✗</option>
          </select>

          {hasActiveFilters && (
            <button onClick={resetFilters} className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
              <RefreshCw className="w-4 h-4" /> Temizle
            </button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        {products.length === 0 ? (
          <EmptyState message="Ürün bulunamadı" icon={Package} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="text-xs text-gray-500 uppercase">
                    <th className="w-6 px-1"></th>
                    <th className="px-2 py-2 text-left">Görsel</th>
                    <th className="px-2 py-2 text-left cursor-pointer hover:text-gray-700" onClick={() => handleSort('code')}>
                      Kod<SortIndicator column="code" />
                    </th>
                    <th className="px-2 py-2 text-left cursor-pointer hover:text-gray-700 min-w-[200px]" onClick={() => handleSort('name')}>
                      Ürün Adı<SortIndicator column="name" />
                    </th>
                    <th className="px-2 py-2 text-left">Marka</th>
                    <th className="px-2 py-2 text-left">Kategori</th>
                    <th className="px-2 py-2 text-left">Tedarikçi</th>
                    <th className="px-2 py-2 text-right cursor-pointer hover:text-gray-700" onClick={() => handleSort('buying_price')}>
                      Alış<SortIndicator column="buying_price" />
                    </th>
                    <th className="px-2 py-2 text-right cursor-pointer hover:text-gray-700" onClick={() => handleSort('selling_price')}>
                      Satış<SortIndicator column="selling_price" />
                    </th>
                    <th className="px-2 py-2 text-center">Marj</th>
                    <th className="px-2 py-2 text-center cursor-pointer hover:text-gray-700" onClick={() => handleSort('quantity')}>
                      Stok<SortIndicator column="quantity" />
                    </th>
                    <th className="px-2 py-2 text-right">Akakce Min</th>
                    <th className="px-2 py-2 text-right">Akakce Max</th>
                    <th className="px-2 py-2 text-center">Akakce Sıra</th>
                    <th className="px-2 py-2 text-center">Fark %</th>
                    <th className="px-2 py-2 text-center">Pozisyon</th>
                    <th className="px-2 py-2 text-center">Rakip</th>
                    <th className="px-2 py-2 text-center">Linkler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => {
                    const isExpanded = expandedRows.has(p.id)
                    const margin = getMargin(p)
                    const priceDiff = getPriceDiff(p)
                    const akakcePos = getAkakcePosition(p)

                    return (
                      <>
                        <tr
                          key={p.id}
                          onClick={() => toggleRow(p.id)}
                          className={clsx(
                            'cursor-pointer transition-colors text-xs',
                            isExpanded ? 'bg-primary-50' : 'hover:bg-gray-50',
                            p.total_quantity === 0 && !isExpanded && 'bg-red-50/40'
                          )}
                        >
                          <td className="px-1 py-2">
                            {isExpanded ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
                          </td>
                          <td className="px-2 py-2">
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt="" className="h-8 w-8 rounded object-cover border" />
                            ) : (
                              <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
                                <Package className="h-4 w-4 text-gray-300" />
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-2 font-mono text-gray-600">{p.code}</td>
                          <td className="px-2 py-2">
                            <p className="font-medium text-gray-900 truncate max-w-[200px]">{p.name}</p>
                          </td>
                          <td className="px-2 py-2 text-gray-600">{truncate(p.brand, 15) || '-'}</td>
                          <td className="px-2 py-2">
                            <span className="text-gray-600">{p.main_category}</span>
                            {p.sub_category && <span className="text-gray-400 text-[10px] block">{p.sub_category}</span>}
                          </td>
                          <td className="px-2 py-2 text-gray-500 text-[10px]">{truncate(p.supplier_name, 20) || '-'}</td>
                          <td className="px-2 py-2 text-right font-mono text-gray-600">{formatCurrency(p.buying_price)}</td>
                          <td className="px-2 py-2 text-right">
                            {(() => {
                              const sellInfo = getEffectiveSellPrice(p)
                              if (!sellInfo.price) {
                                return <span className="text-gray-400 text-xs">Veri Yok</span>
                              }
                              return (
                                <span className={clsx(
                                  "font-mono font-semibold",
                                  sellInfo.source === 'storefront' ? "text-gray-900" : "text-gray-500"
                                )}>
                                  {formatCurrency(sellInfo.price)}
                                  {sellInfo.source === 'panel' && <span className="text-[9px] text-yellow-600 ml-1" title="Panel verisi (ikas yok)">⚠</span>}
                                </span>
                              )
                            })()}
                          </td>
                          <td className="px-2 py-2 text-center">{getMarginBadge(margin)}</td>
                          <td className="px-2 py-2 text-center">{getStockBadge(p.total_quantity)}</td>
                          <td className="px-2 py-2 text-right font-mono text-gray-600">
                            {p.akakce_low_price ? formatCurrency(p.akakce_low_price) : '-'}
                          </td>
                          <td className="px-2 py-2 text-right font-mono text-gray-600">
                            {p.akakce_high_price ? formatCurrency(p.akakce_high_price) : '-'}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <AkakcePositionBadge position={akakcePos} total={p.akakce_total_sellers} />
                          </td>
                          <td className="px-2 py-2 text-center">{getPriceDiffBadge(priceDiff)}</td>
                          <td className="px-2 py-2">
                            <PricePositionBar product={p} compact />
                          </td>
                          <td className="px-2 py-2 text-center">
                            {p.akakce_total_sellers ? (
                              <Badge variant="secondary" size="xs">{p.akakce_total_sellers}</Badge>
                            ) : '-'}
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex items-center justify-center gap-1">
                              {/* PetzzShop Link */}
                              {p.petzzshop_url ? (
                                <a
                                  href={p.petzzshop_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                                  title="PetzzShop'da Görüntüle"
                                >
                                  <Store className="w-3.5 h-3.5" />
                                </a>
                              ) : (
                                <span
                                  className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-50 text-gray-300"
                                  title="Vitrin eşleşmesi yok"
                                >
                                  <Store className="w-3.5 h-3.5" />
                                </span>
                              )}
                              {/* Akakce Link */}
                              {p.akakce_url ? (
                                <a
                                  href={p.akakce_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center justify-center w-6 h-6 rounded bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                                  title="Akakce'de Görüntüle"
                                >
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                </a>
                              ) : (
                                <span
                                  className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-50 text-gray-300"
                                  title="Akakce verisi yok"
                                >
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${p.id}-detail`}>
                            <td colSpan={18} className="p-0">
                              <ProductDetail productId={p.id} rowProduct={p} isFullscreen={isFullscreen} />
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t px-4 py-2 bg-gray-50 text-sm">
              <span className="text-gray-600">
                {formatNumber(pagination.total)} üründen {(page - 1) * 50 + 1}-{Math.min(page * 50, pagination.total)}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(1)} disabled={page === 1}
                  className="px-2 py-1 border rounded hover:bg-white disabled:opacity-50">İlk</button>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1 border rounded hover:bg-white disabled:opacity-50">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 py-1 bg-white border rounded font-medium">{page} / {pagination.totalPages}</span>
                <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}
                  className="p-1 border rounded hover:bg-white disabled:opacity-50">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button onClick={() => setPage(pagination.totalPages)} disabled={page >= pagination.totalPages}
                  className="px-2 py-1 border rounded hover:bg-white disabled:opacity-50">Son</button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
