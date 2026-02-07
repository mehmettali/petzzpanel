import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Store, RefreshCw, Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Package, ExternalLink, Link2, Link2Off, Tag, Plus, X, Filter, Download,
  CheckCircle, XCircle, AlertTriangle, Percent, BarChart3, TrendingUp,
  Eye, ShoppingCart, Layers, Clock
} from 'lucide-react'
import {
  startStorefrontSync,
  getStorefrontStatus,
  getStorefrontProducts,
  getStorefrontProduct,
  getStorefrontFilters,
  getStorefrontAnalytics,
  addStorefrontTag,
  removeStorefrontTag
} from '../services/api'
import { Card } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/Spinner'
import { Skeleton, CardSkeleton } from '../components/ui/Skeleton'
import { SearchInput } from '../components/ui/Form'
import { formatNumber, formatCurrency, truncate } from '../utils/formatters'
import clsx from 'clsx'

// Tag type labels and colors
const TAG_TYPE_CONFIG = {
  species: { label: 'Tür', color: 'bg-blue-100 text-blue-800', icon: '🐾' },
  age: { label: 'Yaş', color: 'bg-green-100 text-green-800', icon: '📅' },
  flavor: { label: 'Tat', color: 'bg-orange-100 text-orange-800', icon: '🍖' },
  protein: { label: 'Protein', color: 'bg-purple-100 text-purple-800', icon: '💪' },
  special: { label: 'Özel', color: 'bg-pink-100 text-pink-800', icon: '⭐' },
  breed: { label: 'Irk', color: 'bg-yellow-100 text-yellow-800', icon: '🏷️' },
  size: { label: 'Boyut', color: 'bg-cyan-100 text-cyan-800', icon: '📏' }
}

// Tag badge component
function TagBadge({ type, value, onRemove }) {
  const config = TAG_TYPE_CONFIG[type] || { label: type, color: 'bg-gray-100 text-gray-800', icon: '🏷️' }

  return (
    <span className={clsx(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs",
      config.color
    )}>
      <span>{config.icon}</span>
      <span>{value}</span>
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  )
}

// Match status badge
function MatchBadge({ isMatched }) {
  return isMatched ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
      <Link2 className="w-3 h-3" />
      Eşleşti
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">
      <Link2Off className="w-3 h-3" />
      Eşleşmedi
    </span>
  )
}

// Product comparison panel
function ProductComparison({ sku }) {
  const { data: product, isLoading } = useQuery({
    queryKey: ['storefront-product', sku],
    queryFn: () => getStorefrontProduct(sku),
    enabled: !!sku
  })

  const queryClient = useQueryClient()

  const removeMutation = useMutation({
    mutationFn: removeStorefrontTag,
    onSuccess: () => {
      queryClient.invalidateQueries(['storefront-product', sku])
      queryClient.invalidateQueries(['storefront-products'])
    }
  })

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 border-t">
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!product) return null

  const panel = product.panelData

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white border-t p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Product Info & Images */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
            <Eye className="w-3 h-3" /> Ürün Bilgileri
          </h4>
          <div className="flex gap-2">
            {product.images?.slice(0, 4).map((img, i) => (
              <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded-lg border" />
            ))}
            {(!product.images || product.images.length === 0) && (
              <div className="w-16 h-16 bg-red-50 rounded-lg flex items-center justify-center border border-red-200">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
            )}
          </div>
          <div className="text-sm space-y-1">
            <p><span className="text-gray-500">SKU:</span> <span className="font-mono">{product.sku}</span></p>
            <p><span className="text-gray-500">Barkod:</span> <span className="font-mono">{product.barcode || '-'}</span></p>
            <p><span className="text-gray-500">Kategori:</span> {product.category_path || '-'}</p>
            <p><span className="text-gray-500">Marka:</span> {product.brand || '-'}</p>
          </div>
          <a
            href={product.storefrontUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
          >
            <ExternalLink className="w-4 h-4" />
            petzzshop.com'da Gör
          </a>
        </div>

        {/* Price Comparison */}
        <div className="bg-white rounded-lg border p-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1">
            <BarChart3 className="w-3 h-3" /> Fiyat Karşılaştırması
          </h4>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-3 gap-2 text-center border-b pb-2 mb-2">
              <div className="text-xs text-gray-500">Metrik</div>
              <div className="text-xs text-gray-500">Vitrin (ikas)</div>
              <div className="text-xs text-gray-500">Panel (Petzz)</div>
            </div>

            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="text-gray-600">Satış Fiyatı</span>
              <span className="font-medium text-center">{formatCurrency(product.sell_price)}</span>
              <span className={clsx(
                "font-medium text-center",
                panel && product.sell_price === panel.selling_price ? "text-green-600" : "text-orange-600"
              )}>
                {panel ? formatCurrency(panel.selling_price) : '-'}
                {panel && product.sell_price === panel.selling_price && <CheckCircle className="w-3 h-3 inline ml-1" />}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="text-gray-600">Alış Fiyatı</span>
              <span className="font-medium text-center">{formatCurrency(product.buy_price)}</span>
              <span className="font-medium text-center">{panel ? formatCurrency(panel.buying_price) : '-'}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 items-center">
              <span className="text-gray-600">Stok</span>
              <span className={clsx(
                "font-medium text-center",
                product.stock_count > 0 ? "text-green-600" : "text-red-600"
              )}>
                {product.stock_count > 0 ? 'Var' : 'Yok'}
              </span>
              <span className={clsx(
                "font-medium text-center",
                panel?.total_quantity > 0 ? "text-green-600" : "text-red-600"
              )}>
                {panel ? (panel.total_quantity > 0 ? panel.total_quantity : 'Yok') : '-'}
              </span>
            </div>

            {panel?.akakce_low_price && (
              <div className="border-t pt-2 mt-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-500">Akakce Fiyat Aralığı</p>
                  {panel.akakce_url && (
                    <a
                      href={panel.akakce_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Akakce
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-medium">{formatCurrency(panel.akakce_low_price)}</span>
                  <span className="text-gray-400">-</span>
                  <span className="text-red-600 font-medium">{formatCurrency(panel.akakce_high_price)}</span>
                  {panel.akakce_total_sellers && (
                    <span className="text-xs text-gray-500">({panel.akakce_total_sellers} satıcı)</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-lg border p-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Etiketler
          </h4>
          {product.tags && product.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag, i) => (
                <TagBadge
                  key={i}
                  type={tag.tag_type}
                  value={tag.tag_value}
                  onRemove={tag.source === 'manual' ? () => {
                    removeMutation.mutate({
                      sku: product.sku,
                      tagType: tag.tag_type,
                      tagValue: tag.tag_value
                    })
                  } : null}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Etiket bulunamadı</p>
          )}

          {/* Description preview */}
          {product.description && (
            <div className="mt-4 pt-3 border-t">
              <p className="text-xs text-gray-500 mb-1">Açıklama Önizlemesi</p>
              <div
                className="text-xs text-gray-700 max-h-20 overflow-y-auto prose prose-sm"
                dangerouslySetInnerHTML={{ __html: truncate(product.description, 300) }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, subValue, color = 'primary', onClick, active }) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600'
  }

  return (
    <Card
      className={clsx(
        "p-4 transition-all",
        onClick && "cursor-pointer hover:shadow-md",
        active && "ring-2 ring-primary-500"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={clsx("p-2 rounded-lg", colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
          {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
        </div>
      </div>
    </Card>
  )
}

export default function Storefront() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [matchStatus, setMatchStatus] = useState('')
  const [stockStatus, setStockStatus] = useState('')
  const [hasDiscount, setHasDiscount] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [showFilters, setShowFilters] = useState(false)

  const queryClient = useQueryClient()

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['storefront-status'],
    queryFn: getStorefrontStatus,
    refetchInterval: 10000 // Refresh every 10 seconds
  })

  const { data: filters } = useQuery({
    queryKey: ['storefront-filters'],
    queryFn: getStorefrontFilters
  })

  const { data: analytics } = useQuery({
    queryKey: ['storefront-analytics'],
    queryFn: getStorefrontAnalytics
  })

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['storefront-products', { page, search, category, brand, matchStatus, stockStatus, hasDiscount, tag: selectedTag, sortBy, sortOrder }],
    queryFn: () => getStorefrontProducts({
      page, limit: 50, search, category, brand, matchStatus, stockStatus, hasDiscount, tag: selectedTag, sortBy, sortOrder
    })
  })

  const syncMutation = useMutation({
    mutationFn: startStorefrontSync,
    onSuccess: () => {
      queryClient.invalidateQueries(['storefront-status'])
    }
  })

  const toggleRow = (sku) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      next.has(sku) ? next.delete(sku) : next.add(sku)
      return next
    })
  }

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(col)
      setSortOrder('asc')
    }
    setPage(1)
  }

  const resetFilters = () => {
    setSearch('')
    setCategory('')
    setBrand('')
    setMatchStatus('')
    setStockStatus('')
    setHasDiscount('')
    setSelectedTag('')
    setPage(1)
  }

  const hasActiveFilters = search || category || brand || matchStatus || stockStatus || hasDiscount || selectedTag
  const activeFilterCount = [search, category, brand, matchStatus, stockStatus, hasDiscount, selectedTag].filter(Boolean).length

  const stats = status?.stats || {}
  const lastSync = status?.lastSync
  const overview = analytics?.overview || {}
  const { products, pagination } = productsData || { products: [], pagination: {} }

  const isSyncing = lastSync?.status === 'running'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-primary-600" />
            Vitrin Yönetimi
          </h1>
          <p className="text-gray-500 text-sm">ikas mağaza verileri ve petzz panel eşleştirmesi</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => syncMutation.mutate()}
            disabled={isSyncing || syncMutation.isLoading}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              isSyncing || syncMutation.isLoading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-primary-600 text-white hover:bg-primary-700"
            )}
          >
            <RefreshCw className={clsx("w-4 h-4", (isSyncing || syncMutation.isLoading) && "animate-spin")} />
            {isSyncing ? 'Senkronize Ediliyor...' : 'Senkronize Et'}
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {lastSync && (
        <Card className={clsx(
          "p-3 flex items-center justify-between",
          lastSync.status === 'running' && "bg-blue-50 border-blue-200",
          lastSync.status === 'completed' && "bg-green-50 border-green-200",
          lastSync.status === 'failed' && "bg-red-50 border-red-200"
        )}>
          <div className="flex items-center gap-3">
            <Clock className={clsx(
              "w-5 h-5",
              lastSync.status === 'running' && "text-blue-600 animate-pulse",
              lastSync.status === 'completed' && "text-green-600",
              lastSync.status === 'failed' && "text-red-600"
            )} />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {lastSync.status === 'running' && 'Senkronizasyon devam ediyor...'}
                {lastSync.status === 'completed' && 'Son senkronizasyon başarılı'}
                {lastSync.status === 'failed' && 'Son senkronizasyon başarısız'}
              </p>
              <p className="text-xs text-gray-500">
                {lastSync.completed_at ? new Date(lastSync.completed_at).toLocaleString('tr-TR') : new Date(lastSync.started_at).toLocaleString('tr-TR')}
                {lastSync.status === 'completed' && ` • ${formatNumber(lastSync.total_products)} ürün, ${formatNumber(lastSync.matched_count)} eşleşme`}
              </p>
            </div>
          </div>
          {lastSync.status === 'failed' && lastSync.error_message && (
            <p className="text-xs text-red-600">{lastSync.error_message}</p>
          )}
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          icon={Package}
          label="Toplam Ürün"
          value={formatNumber(stats.total || 0)}
          color="primary"
        />
        <StatCard
          icon={Link2}
          label="Eşleşen"
          value={formatNumber(stats.matched || 0)}
          subValue={stats.total ? `%${((stats.matched || 0) / stats.total * 100).toFixed(1)}` : ''}
          color="green"
          onClick={() => { setMatchStatus(matchStatus === 'matched' ? '' : 'matched'); setPage(1) }}
          active={matchStatus === 'matched'}
        />
        <StatCard
          icon={Link2Off}
          label="Eşleşmeyen"
          value={formatNumber(stats.unmatched || 0)}
          color="red"
          onClick={() => { setMatchStatus(matchStatus === 'unmatched' ? '' : 'unmatched'); setPage(1) }}
          active={matchStatus === 'unmatched'}
        />
        <StatCard
          icon={ShoppingCart}
          label="Stokta"
          value={formatNumber(stats.in_stock || 0)}
          color="blue"
          onClick={() => { setStockStatus(stockStatus === 'in-stock' ? '' : 'in-stock'); setPage(1) }}
          active={stockStatus === 'in-stock'}
        />
        <StatCard
          icon={Percent}
          label="İndirimli"
          value={formatNumber(overview.on_sale || 0)}
          color="yellow"
          onClick={() => { setHasDiscount(hasDiscount === 'yes' ? '' : 'yes'); setPage(1) }}
          active={hasDiscount === 'yes'}
        />
        <StatCard
          icon={Layers}
          label="Marka"
          value={formatNumber(stats.brands || 0)}
          color="purple"
        />
      </div>

      {/* Category Breakdown (if analytics available) */}
      {analytics?.categoryBreakdown && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary-600" />
            Kategori Dağılımı
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {analytics.categoryBreakdown.slice(0, 6).map((cat, i) => (
              <button
                key={i}
                onClick={() => { setCategory(category === cat.main_category ? '' : cat.main_category); setPage(1) }}
                className={clsx(
                  "p-3 rounded-lg border text-left transition-all",
                  category === cat.main_category
                    ? "bg-primary-50 border-primary-300"
                    : "hover:bg-gray-50"
                )}
              >
                <p className="font-medium text-gray-900 truncate">{cat.main_category}</p>
                <p className="text-sm text-gray-500">{formatNumber(cat.product_count)} ürün</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-green-600">{formatNumber(cat.matched_count)} eşleşme</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-blue-600">{formatNumber(cat.in_stock_count)} stokta</span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-3">
        <div className="space-y-3">
          {/* Main Filter Row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1 min-w-[200px]">
              <SearchInput
                placeholder="Ürün adı, SKU veya marka ara..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                onClear={() => { setSearch(''); setPage(1) }}
                size="sm"
              />
            </div>

            <select
              value={matchStatus}
              onChange={(e) => { setMatchStatus(e.target.value); setPage(1) }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Tüm Eşleşme</option>
              <option value="matched">✅ Eşleşen</option>
              <option value="unmatched">❌ Eşleşmeyen</option>
            </select>

            <select
              value={stockStatus}
              onChange={(e) => { setStockStatus(e.target.value); setPage(1) }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Tüm Stok</option>
              <option value="in-stock">✅ Stokta Var</option>
              <option value="out-of-stock">❌ Stokta Yok</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors",
                showFilters ? "bg-primary-50 border-primary-300 text-primary-700" : "hover:bg-gray-50"
              )}
            >
              <Filter className="w-4 h-4" />
              Detaylı
              {activeFilterCount > 0 && (
                <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
              >
                <RefreshCw className="w-4 h-4" /> Temizle
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 pt-3 border-t">
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1) }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">Tüm Kategoriler</option>
                {filters?.categories?.map(cat => (
                  <option key={cat.main_category} value={cat.main_category}>
                    {cat.main_category} ({cat.count})
                  </option>
                ))}
              </select>

              <select
                value={brand}
                onChange={(e) => { setBrand(e.target.value); setPage(1) }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">Tüm Markalar</option>
                {filters?.brands?.slice(0, 50).map(b => (
                  <option key={b.brand} value={b.brand}>
                    {b.brand} ({b.count})
                  </option>
                ))}
              </select>

              <select
                value={hasDiscount}
                onChange={(e) => { setHasDiscount(e.target.value); setPage(1) }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">İndirim Durumu</option>
                <option value="yes">🏷️ İndirimli</option>
                <option value="no">💰 Normal Fiyat</option>
              </select>

              <select
                value={selectedTag}
                onChange={(e) => { setSelectedTag(e.target.value); setPage(1) }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">Tüm Etiketler</option>
                {filters?.tags && Object.entries(filters.tags).map(([type, tags]) => (
                  <optgroup key={type} label={TAG_TYPE_CONFIG[type]?.label || type}>
                    {tags.slice(0, 10).map(tag => (
                      <option key={`${type}-${tag.value}`} value={tag.value}>
                        {tag.value} ({tag.count})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}
        </div>
      </Card>

      {/* Products Table */}
      <Card className="overflow-hidden p-0">
        {productsLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2">Yükleniyor...</p>
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            message={stats.total === 0 ? "Henüz senkronizasyon yapılmadı" : "Ürün bulunamadı"}
            icon={Package}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="text-xs text-gray-500 uppercase">
                    <th className="w-6 px-1"></th>
                    <th className="px-2 py-2 text-left">Görsel</th>
                    <th className="px-2 py-2 text-left">SKU</th>
                    <th
                      className="px-2 py-2 text-left cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('name')}
                    >
                      Ürün Adı {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-2 py-2 text-left cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('brand')}
                    >
                      Marka {sortBy === 'brand' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-2 py-2 text-left cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('category')}
                    >
                      Kategori {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-2 py-2 text-right cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('price')}
                    >
                      Fiyat {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th
                      className="px-2 py-2 text-center cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('discount')}
                    >
                      İnd. {sortBy === 'discount' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-2 py-2 text-center">Stok</th>
                    <th className="px-2 py-2 text-center">Eşleşme</th>
                    <th className="px-2 py-2 text-left">Etiketler</th>
                    <th className="px-2 py-2 text-center">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => {
                    const isExpanded = expandedRows.has(p.sku)

                    return (
                      <>
                        <tr
                          key={p.sku}
                          onClick={() => toggleRow(p.sku)}
                          className={clsx(
                            'cursor-pointer transition-colors text-xs',
                            isExpanded ? 'bg-primary-50' : 'hover:bg-gray-50',
                            !p.is_matched && !isExpanded && 'bg-red-50/30'
                          )}
                        >
                          <td className="px-1 py-2">
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-3 h-3 text-gray-400" />
                            )}
                          </td>
                          <td className="px-2 py-2">
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt="" className="h-10 w-10 rounded object-cover border" />
                            ) : (
                              <div className="h-10 w-10 rounded bg-gray-100 border flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-2 font-mono text-gray-600">{p.sku}</td>
                          <td className="px-2 py-2">
                            <p className="truncate max-w-[250px] font-medium text-gray-900">{p.name}</p>
                          </td>
                          <td className="px-2 py-2 text-gray-600">{truncate(p.brand || '-', 15)}</td>
                          <td className="px-2 py-2">
                            <div className="flex flex-col">
                              <span className="text-gray-700">{p.main_category || '-'}</span>
                              {p.sub_category && (
                                <span className="text-gray-400 text-[10px]">{truncate(p.sub_category, 20)}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-2 text-right font-medium">
                            {p.discount_percent > 0 ? (
                              <div>
                                <span className="text-gray-400 line-through text-[10px] block">{formatCurrency(p.buy_price)}</span>
                                <span className="text-green-600">{formatCurrency(p.sell_price)}</span>
                              </div>
                            ) : (
                              <span>{formatCurrency(p.sell_price)}</span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-center">
                            {p.discount_percent > 0 ? (
                              <Badge variant="success" size="xs">%{p.discount_percent}</Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-center">
                            {p.stock_count > 0 ? (
                              <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500 mx-auto" />
                            )}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <MatchBadge isMatched={p.is_matched} />
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                              {p.tags?.slice(0, 3).map((tag, i) => (
                                <TagBadge key={i} type={tag.tag_type} value={tag.tag_value} />
                              ))}
                              {p.tags?.length > 3 && (
                                <span className="text-xs text-gray-400">+{p.tags.length - 3}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-2 text-center">
                            <a
                              href={p.storefrontUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                              title="petzzshop.com'da görüntüle"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${p.sku}-detail`}>
                            <td colSpan={12} className="p-0">
                              <ProductComparison sku={p.sku} />
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
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-2 py-1 border rounded hover:bg-white disabled:opacity-50"
                >
                  İlk
                </button>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 border rounded hover:bg-white disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 py-1 bg-white border rounded font-medium">
                  {page} / {pagination.totalPages || 1}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="p-1 border rounded hover:bg-white disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage(pagination.totalPages)}
                  disabled={page >= pagination.totalPages}
                  className="px-2 py-1 border rounded hover:bg-white disabled:opacity-50"
                >
                  Son
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
