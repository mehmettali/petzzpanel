import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search, ChevronLeft, ChevronRight, Package, ChevronDown, ChevronUp,
  RefreshCw, AlertTriangle, AlertCircle, Maximize2, Minimize2,
  Trophy, Medal, Award, Target, ExternalLink, Store, ShoppingBag,
  TrendingUp, TrendingDown, DollarSign, Boxes, Download
} from 'lucide-react'
import { getUnifiedProducts, getCategories, getBrands, getSuppliers, quickSyncStorefront } from '../services/api'
import { Card } from './ui/Card'
import Badge from './ui/Badge'
import { LoadingState, ErrorState, EmptyState } from './ui/Spinner'
import { SearchInput } from './ui/Form'
import { formatCurrency, formatNumber, truncate } from '../utils/formatters'
import clsx from 'clsx'

// Summary Stats Card
function SummaryCard({ icon: Icon, label, value, subValue, variant = 'default', onClick }) {
  const variants = {
    default: 'bg-gray-50 border-gray-200',
    warning: 'bg-yellow-50 border-yellow-200',
    danger: 'bg-red-50 border-red-200',
    success: 'bg-green-50 border-green-200',
    info: 'bg-blue-50 border-blue-200'
  }

  return (
    <div
      onClick={onClick}
      className={clsx(
        'border rounded-lg p-3 flex items-center gap-3',
        variants[variant],
        onClick && 'cursor-pointer hover:shadow-sm transition-shadow'
      )}
    >
      <div className={clsx(
        'p-2 rounded-lg',
        variant === 'warning' && 'bg-yellow-100 text-yellow-600',
        variant === 'danger' && 'bg-red-100 text-red-600',
        variant === 'success' && 'bg-green-100 text-green-600',
        variant === 'info' && 'bg-blue-100 text-blue-600',
        variant === 'default' && 'bg-gray-100 text-gray-600'
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-semibold">{formatNumber(value)}</p>
        {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
      </div>
    </div>
  )
}

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

// Price Position Bar
function PricePositionBar({ akakce, sellingPrice }) {
  if (!akakce || !akakce.low_price || !akakce.high_price || !sellingPrice) return null

  const range = akakce.high_price - akakce.low_price
  if (range === 0) return null

  let position = ((sellingPrice - akakce.low_price) / range) * 100
  position = Math.max(0, Math.min(100, position))

  const getColor = () => {
    if (position <= 15) return 'bg-green-500'
    if (position <= 35) return 'bg-lime-500'
    if (position <= 55) return 'bg-yellow-500'
    if (position <= 75) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="w-20">
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${getColor()}`} style={{ width: `${position}%` }} />
      </div>
    </div>
  )
}

// Inconsistency Warning Badge
function InconsistencyBadge({ type, currentValue, expectedValue }) {
  return (
    <div className="flex items-center gap-1 text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 px-2 py-1 rounded">
      <AlertTriangle className="w-3 h-3" />
      <span>
        {type === 'price' && `Panel: ${formatCurrency(expectedValue)}`}
        {type === 'stock' && `Vitrin: ${expectedValue}`}
      </span>
    </div>
  )
}

// Competitor List (Expandable)
function CompetitorList({ competitors, petzzPrice }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!competitors || competitors.length === 0) return <span className="text-gray-400 text-xs">-</span>

  const maxPrice = Math.max(...competitors.map(c => c.price), petzzPrice || 0)

  return (
    <div>
      <button
        onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded) }}
        className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
      >
        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {competitors.length} Rakip
      </button>

      {isExpanded && (
        <div className="absolute z-20 mt-1 bg-white border rounded-lg shadow-lg p-3 min-w-[300px] max-w-[400px]" onClick={(e) => e.stopPropagation()}>
          <h4 className="text-xs font-semibold text-gray-500 mb-2">Rakip Fiyatları</h4>
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
            {competitors.map((c, i) => {
              const width = maxPrice > 0 ? (c.price / maxPrice) * 100 : 0
              const isPetzz = c.name?.toLowerCase().includes('petzz')

              return (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className={clsx(
                    "w-4 text-right font-mono text-gray-400",
                    isPetzz && "font-semibold text-primary-600"
                  )}>
                    {i + 1}.
                  </span>
                  <span className={clsx(
                    "w-28 truncate",
                    isPetzz ? "font-semibold text-primary-600" : "text-gray-600"
                  )}>
                    {c.name}
                  </span>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded overflow-hidden">
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
                    isPetzz && "font-semibold text-primary-600"
                  )}>
                    {formatCurrency(c.price)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// Main Component
export default function UnifiedProductList() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [supplier, setSupplier] = useState('')
  const [stockStatus, setStockStatus] = useState('')
  const [priceStatus, setPriceStatus] = useState('')
  const [hasAkakce, setHasAkakce] = useState('')
  const [hasStorefront, setHasStorefront] = useState('')
  const [inconsistencyFilter, setInconsistencyFilter] = useState('')
  const [petzzRank, setPetzzRank] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['unified-products', { page, search, category, brand, supplier, stockStatus, priceStatus, hasAkakce, hasStorefront, inconsistencyFilter, petzzRank, sortBy, sortOrder }],
    queryFn: () => getUnifiedProducts({ page, limit: 50, search, category, brand, supplier, stockStatus, priceStatus, hasAkakce, hasStorefront, inconsistencyFilter, petzzRank, sortBy, sortOrder }),
  })

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const { data: brands } = useQuery({ queryKey: ['brands'], queryFn: getBrands })
  const { data: suppliers } = useQuery({ queryKey: ['suppliers'], queryFn: getSuppliers })

  const uniqueCategories = useMemo(() =>
    [...new Set(categories?.map(c => c.main_category).filter(Boolean))], [categories]
  )

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

  const handleQuickSync = async () => {
    setIsSyncing(true)
    try {
      await quickSyncStorefront()
      await refetch()
    } catch (err) {
      console.error('Sync error:', err)
    } finally {
      setIsSyncing(false)
    }
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

  const getMarginBadge = (margin) => {
    if (margin === null || margin === undefined) return '-'
    if (margin < 0) return <span className="text-red-600 font-mono text-xs font-bold">%{margin.toFixed(1)}</span>
    if (margin < 10) return <span className="text-red-500 font-mono text-xs">%{margin.toFixed(1)}</span>
    if (margin < 20) return <span className="text-yellow-600 font-mono text-xs">%{margin.toFixed(1)}</span>
    if (margin < 30) return <span className="text-green-600 font-mono text-xs">%{margin.toFixed(1)}</span>
    return <span className="text-green-700 font-mono text-xs font-bold">%{margin.toFixed(1)}</span>
  }

  const getPriceDiffBadge = (diff) => {
    if (diff === null || diff === undefined) return '-'
    if (diff <= -5) return <span className="text-green-600 font-mono text-xs font-bold">{diff.toFixed(1)}%</span>
    if (diff < 0) return <span className="text-green-500 font-mono text-xs">{diff.toFixed(1)}%</span>
    if (diff < 5) return <span className="text-yellow-600 font-mono text-xs">+{diff.toFixed(1)}%</span>
    if (diff < 15) return <span className="text-orange-500 font-mono text-xs">+{diff.toFixed(1)}%</span>
    return <span className="text-red-600 font-mono text-xs font-bold">+{diff.toFixed(1)}%</span>
  }

  const resetFilters = () => {
    setSearch(''); setCategory(''); setBrand(''); setSupplier(''); setStockStatus(''); setPriceStatus(''); setHasAkakce(''); setHasStorefront(''); setInconsistencyFilter(''); setPetzzRank(''); setPage(1)
  }

  // CSV Export function
  const [isExporting, setIsExporting] = useState(false)

  const exportToCSV = async () => {
    setIsExporting(true)
    try {
      // Fetch all products with current filters (up to 5000)
      const allData = await getUnifiedProducts({
        page: 1,
        limit: 5000,
        search, category, brand, supplier, stockStatus, priceStatus,
        hasAkakce, hasStorefront, inconsistencyFilter, petzzRank, sortBy, sortOrder
      })

      const csvRows = []
      // Header row
      csvRows.push([
        'SKU', 'Urun Adi', 'Marka', 'Kategori', 'Tedarikci',
        'Alis Fiyati', 'Satis Fiyati', 'Liste Fiyati', 'Marj %', 'Brut Kar',
        'Stok', 'Stok Degeri',
        'Akakce Min', 'Akakce Max', 'Akakce Petzz', 'Akakce Fark %', 'Rakip Sayisi',
        'Akakce URL', 'Petzzshop URL'
      ].join(';'))

      // Data rows
      for (const p of allData.products) {
        const row = [
          p.sku || '',
          (p.name || '').replace(/;/g, ','),
          p.brand || '',
          p.category || '',
          (p.supplier || '').replace(/;/g, ','),
          p.pricing?.buying_price || '',
          p.pricing?.selling_price || '',
          p.pricing?.list_price || '',
          p.pricing?.margin_percent || '',
          p.pricing?.gross_profit || '',
          p.stock?.quantity || 0,
          p.stock?.stock_value || '',
          p.akakce?.low_price || '',
          p.akakce?.high_price || '',
          p.akakce?.petzz_price || '',
          p.akakce?.price_diff_percent || '',
          p.akakce?.total_sellers || '',
          p.urls?.akakce || '',
          p.urls?.petzzshop || ''
        ]
        csvRows.push(row.join(';'))
      }

      // Create and download file
      const csvContent = '\uFEFF' + csvRows.join('\n') // BOM for Excel UTF-8
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const timestamp = new Date().toISOString().slice(0, 10)
      const filterName = hasAkakce === 'no' ? '_akakce-yok' : hasAkakce === 'yes' ? '_akakce-var' : ''
      link.download = `urunler${filterName}_${timestamp}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('CSV export error:', err)
      alert('CSV export hatası: ' + err.message)
    } finally {
      setIsExporting(false)
    }
  }

  const hasActiveFilters = search || category || brand || supplier || stockStatus || priceStatus || hasAkakce || hasStorefront || inconsistencyFilter || petzzRank

  if (isLoading) return <LoadingState message="Unified ürün verileri yükleniyor..." />
  if (error) return <ErrorState message="Veriler yüklenemedi" />

  const { products, pagination, summary } = data || { products: [], pagination: {}, summary: {} }

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
            Unified Urun Yonetimi
          </h1>
          <p className="text-gray-500 text-sm">
            {formatNumber(pagination.total)} urun • Tek kaynak gorunumu (Alis: Panel, Satis: ikas, Stok: Panel)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleQuickSync}
            disabled={isSyncing}
            className={clsx(
              "flex items-center gap-2 px-3 py-2 text-sm border rounded-lg",
              isSyncing ? "bg-gray-100 text-gray-400" : "hover:bg-gray-50"
            )}
          >
            <RefreshCw className={clsx("w-4 h-4", isSyncing && "animate-spin")} />
            {isSyncing ? "Senkronize ediliyor..." : "Quick Sync"}
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={clsx(
              "flex items-center gap-2 px-3 py-2 text-sm border rounded-lg",
              isFullscreen ? "bg-primary-50 border-primary-200 text-primary-700" : "hover:bg-gray-50"
            )}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {isFullscreen ? "Kucult" : "Tam Ekran"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-3">
        <SummaryCard
          icon={Boxes}
          label="Toplam Urun"
          value={summary.total_products}
          variant="default"
        />
        <SummaryCard
          icon={DollarSign}
          label="Fiyat Tutarsizligi"
          value={summary.price_inconsistent}
          subValue="Panel ≠ ikas"
          variant={summary.price_inconsistent > 0 ? "warning" : "success"}
          onClick={() => setInconsistencyFilter(inconsistencyFilter === 'price' ? '' : 'price')}
        />
        <SummaryCard
          icon={AlertCircle}
          label="Stok Tutarsizligi"
          value={summary.stock_inconsistent}
          subValue="Panel ≠ ikas"
          variant={summary.stock_inconsistent > 0 ? "warning" : "success"}
          onClick={() => setInconsistencyFilter(inconsistencyFilter === 'stock' ? '' : 'stock')}
        />
        <SummaryCard
          icon={TrendingDown}
          label="Rakipten Ucuz"
          value={summary.below_competitors}
          variant="success"
          onClick={() => setPriceStatus(priceStatus === 'cheaper' ? '' : 'cheaper')}
        />
        <SummaryCard
          icon={TrendingUp}
          label="Rakipten Pahali"
          value={summary.above_competitors}
          variant="danger"
          onClick={() => setPriceStatus(priceStatus === 'expensive' ? '' : 'expensive')}
        />
      </div>

      {/* Filters */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[200px]">
            <SearchInput
              placeholder="SKU, urun adi, marka ara..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              onClear={() => { setSearch(''); setPage(1); }}
              size="sm"
            />
          </div>

          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
            <option value="">Kategori</option>
            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <select value={brand} onChange={(e) => { setBrand(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none max-w-[180px]">
            <option value="">Marka</option>
            {brands?.slice(0, 50).map(b => <option key={b.brand} value={b.brand}>{b.brand}</option>)}
          </select>

          <select value={supplier} onChange={(e) => { setSupplier(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none max-w-[180px]">
            <option value="">Tedarikci</option>
            {suppliers?.slice(0, 30).map(s => <option key={s.supplier_name} value={s.supplier_name}>{truncate(s.supplier_name, 20)}</option>)}
          </select>

          <select value={stockStatus} onChange={(e) => { setStockStatus(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
            <option value="">Stok</option>
            <option value="in-stock">Stokta</option>
            <option value="out-of-stock">Yok</option>
            <option value="low-stock">Kritik</option>
          </select>

          <select value={hasStorefront} onChange={(e) => { setHasStorefront(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
            <option value="">Vitrin</option>
            <option value="yes">Vitrinde</option>
            <option value="no">Vitrinde Degil</option>
          </select>

          <select value={hasAkakce} onChange={(e) => { setHasAkakce(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
            <option value="">Akakce</option>
            <option value="yes">Akakce Var</option>
            <option value="no">Akakce Yok</option>
          </select>

          <select value={petzzRank} onChange={(e) => { setPetzzRank(e.target.value); setPage(1); }}
            className={clsx(
              "rounded-lg border px-3 py-2 text-sm focus:border-primary-500 focus:outline-none",
              petzzRank ? "border-yellow-400 bg-yellow-50" : "border-gray-200"
            )}>
            <option value="">Petzz Sirasi</option>
            <option value="1">🥇 1. sirada</option>
            <option value="2">🥈 2. sirada</option>
            <option value="3">🥉 3. sirada</option>
            <option value="4">4. sirada</option>
            <option value="5">5. sirada</option>
            <option value="6">6-10 arasi</option>
          </select>

          {hasActiveFilters && (
            <button onClick={resetFilters} className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
              <RefreshCw className="w-4 h-4" /> Temizle
            </button>
          )}

          <button
            onClick={exportToCSV}
            disabled={isExporting}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'İndiriliyor...' : 'CSV İndir'}
          </button>
        </div>

        {/* Active Filter Badge */}
        {inconsistencyFilter && (
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="warning" size="sm">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {inconsistencyFilter === 'price' ? 'Fiyat tutarsizligi filtresi aktif' : 'Stok tutarsizligi filtresi aktif'}
            </Badge>
            <button
              onClick={() => setInconsistencyFilter('')}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Kaldir
            </button>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        {products.length === 0 ? (
          <EmptyState message="Urun bulunamadi" icon={Package} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="text-xs text-gray-500 uppercase">
                    <th className="w-6 px-1"></th>
                    <th className="px-2 py-2 text-left cursor-pointer hover:text-gray-700" onClick={() => handleSort('code')}>
                      SKU<SortIndicator column="code" />
                    </th>
                    <th className="px-2 py-2 text-left cursor-pointer hover:text-gray-700 min-w-[180px]" onClick={() => handleSort('name')}>
                      Urun<SortIndicator column="name" />
                    </th>
                    <th className="px-2 py-2 text-center cursor-pointer hover:text-gray-700" onClick={() => handleSort('quantity')}>
                      Stok<SortIndicator column="quantity" />
                    </th>
                    <th className="px-2 py-2 text-right cursor-pointer hover:text-gray-700" onClick={() => handleSort('buying_price')}>
                      Alis<SortIndicator column="buying_price" />
                    </th>
                    <th className="px-2 py-2 text-right cursor-pointer hover:text-gray-700" onClick={() => handleSort('selling_price')}>
                      Satis<SortIndicator column="selling_price" />
                    </th>
                    <th className="px-2 py-2 text-center cursor-pointer hover:text-gray-700" onClick={() => handleSort('margin')}>
                      Marj<SortIndicator column="margin" />
                    </th>
                    <th className="px-2 py-2 text-right">Brut Kar</th>
                    <th className="px-2 py-2 text-right">Akakce Min</th>
                    <th className="px-2 py-2 text-center">Sira</th>
                    <th className="px-2 py-2 text-center cursor-pointer hover:text-gray-700" onClick={() => handleSort('price_diff')}>
                      Fark<SortIndicator column="price_diff" />
                    </th>
                    <th className="px-2 py-2 text-center">Pozisyon</th>
                    <th className="px-2 py-2 text-center">Rakipler</th>
                    <th className="px-2 py-2 text-center">Linkler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => {
                    const isExpanded = expandedRows.has(p.id)
                    const hasPriceInconsistency = !p.pricing.price_synced
                    const hasStockInconsistency = !p.stock.stock_synced && p.stock.storefront_quantity !== null

                    return (
                      <>
                        <tr
                          key={p.id}
                          onClick={() => toggleRow(p.id)}
                          className={clsx(
                            'cursor-pointer transition-colors text-xs',
                            isExpanded ? 'bg-primary-50' : 'hover:bg-gray-50',
                            p.stock.quantity === 0 && !isExpanded && 'bg-red-50/40',
                            (hasPriceInconsistency || hasStockInconsistency) && !isExpanded && 'bg-yellow-50/40'
                          )}
                        >
                          <td className="px-1 py-2">
                            {isExpanded ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
                          </td>
                          <td className="px-2 py-2">
                            <span className="font-mono text-gray-600">{p.sku}</span>
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex items-start gap-2">
                              {p.images?.[0] ? (
                                <img src={p.images[0]} alt="" className="h-8 w-8 rounded object-cover border flex-shrink-0" />
                              ) : (
                                <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <Package className="h-4 w-4 text-gray-300" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 truncate max-w-[160px]">{p.name}</p>
                                <p className="text-[10px] text-gray-500">
                                  {p.brand && <span>{p.brand}</span>}
                                  {p.brand && p.supplier && <span className="mx-1">•</span>}
                                  {p.supplier && <span>{truncate(p.supplier, 15)}</span>}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-2 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              {getStockBadge(p.stock.quantity)}
                              {hasStockInconsistency && (
                                <span className="text-[9px] text-yellow-600" title={`Vitrin: ${p.stock.storefront_quantity}`}>
                                  ⚠ {p.stock.storefront_quantity}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-2 text-right font-mono text-gray-600">
                            {formatCurrency(p.pricing.buying_price)}
                          </td>
                          <td className="px-2 py-2 text-right">
                            <div className="flex flex-col items-end gap-0.5">
                              <span className={clsx(
                                "font-mono font-semibold",
                                p.pricing.source.includes('ikas') ? "text-gray-900" : "text-gray-500"
                              )}>
                                {formatCurrency(p.pricing.selling_price)}
                              </span>
                              {p.pricing.list_price && p.pricing.list_price !== p.pricing.selling_price && (
                                <span className="text-[9px] text-gray-400 line-through" title="Liste fiyati">
                                  {formatCurrency(p.pricing.list_price)}
                                </span>
                              )}
                              {p.pricing.source === 'panel' && (
                                <span className="text-[9px] text-yellow-600" title="Panel verisi (ikas yok)">⚠ Panel</span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-2 text-center">{getMarginBadge(p.pricing.margin_percent)}</td>
                          <td className="px-2 py-2 text-right font-mono">
                            <span className={p.pricing.gross_profit < 0 ? "text-red-600" : "text-gray-600"}>
                              {formatCurrency(p.pricing.gross_profit)}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-right font-mono text-gray-600">
                            {p.akakce?.low_price ? formatCurrency(p.akakce.low_price) : '-'}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <AkakcePositionBadge position={p.akakce?.petzz_rank} total={p.akakce?.total_sellers} />
                          </td>
                          <td className="px-2 py-2 text-center">
                            {getPriceDiffBadge(p.akakce?.price_diff_percent)}
                          </td>
                          <td className="px-2 py-2">
                            <PricePositionBar akakce={p.akakce} sellingPrice={p.pricing.selling_price} />
                          </td>
                          <td className="px-2 py-2 text-center relative">
                            <CompetitorList competitors={p.akakce?.competitors} petzzPrice={p.pricing.selling_price} />
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex items-center justify-center gap-1">
                              {p.urls.petzzshop ? (
                                <a
                                  href={p.urls.petzzshop}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                                  title="PetzzShop'da Goruntule"
                                >
                                  <Store className="w-3.5 h-3.5" />
                                </a>
                              ) : (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-50 text-gray-300" title="Vitrin eslesmesi yok">
                                  <Store className="w-3.5 h-3.5" />
                                </span>
                              )}
                              {p.urls.akakce ? (
                                <a
                                  href={p.urls.akakce}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center justify-center w-6 h-6 rounded bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                                  title="Akakce'de Goruntule"
                                >
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                </a>
                              ) : (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-50 text-gray-300" title="Akakce verisi yok">
                                  <ShoppingBag className="w-3.5 h-3.5" />
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Detail Row */}
                        {isExpanded && (
                          <tr key={`${p.id}-detail`}>
                            <td colSpan={14} className="p-0">
                              <div className="bg-gradient-to-b from-gray-50 to-white border-t p-4">
                                <div className="grid grid-cols-4 gap-4">
                                  {/* Product Info */}
                                  <div className="bg-white rounded-lg border p-3">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Urun Bilgisi</h4>
                                    <div className="space-y-2 text-xs">
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Marka</span>
                                        <span className="font-medium">{p.brand || '-'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Kategori</span>
                                        <span className="font-medium truncate max-w-[120px]">{p.category || '-'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Tedarikci</span>
                                        <span className="font-medium truncate max-w-[120px]">{p.supplier || '-'}</span>
                                      </div>
                                      <div className="flex justify-between pt-2 border-t">
                                        <span className="text-gray-500">Stok Degeri</span>
                                        <span className="font-mono font-semibold">{formatCurrency(p.stock.stock_value)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Pricing Details */}
                                  <div className="bg-white rounded-lg border p-3">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Fiyatlandirma</h4>
                                    <div className="space-y-2 text-xs">
                                      <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Alis (Panel)</span>
                                        <span className="font-mono">{formatCurrency(p.pricing.buying_price)}</span>
                                      </div>
                                      {p.pricing.list_price && (
                                        <div className="flex justify-between items-center">
                                          <span className="text-gray-500">Liste Fiyati</span>
                                          <span className="font-mono text-gray-400 line-through">{formatCurrency(p.pricing.list_price)}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between items-center bg-green-50 -mx-3 px-3 py-1">
                                        <span className="text-green-700 font-medium">Satis Fiyati</span>
                                        <span className="font-mono font-bold text-green-700">{formatCurrency(p.pricing.selling_price)}</span>
                                      </div>
                                      {p.pricing.discount_percent > 0 && (
                                        <div className="flex justify-between items-center">
                                          <span className="text-gray-500">Indirim</span>
                                          <span className="font-mono text-green-600">%{p.pricing.discount_percent}</span>
                                        </div>
                                      )}
                                      <div className="border-t pt-2 flex justify-between">
                                        <span className="text-gray-500">Brut Kar</span>
                                        <span className={clsx("font-mono", p.pricing.gross_profit < 0 && "text-red-600")}>
                                          {formatCurrency(p.pricing.gross_profit)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Marj</span>
                                        {getMarginBadge(p.pricing.margin_percent)}
                                      </div>
                                      <div className="border-t pt-2 flex justify-between text-[10px]">
                                        <span className="text-gray-400">Panel Satis</span>
                                        <span className="font-mono text-gray-400">{formatCurrency(p.pricing.panel_selling_price)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Akakce Details */}
                                  <div className="bg-white rounded-lg border p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="text-xs font-semibold text-gray-500 uppercase">Akakce Analiz</h4>
                                      {p.urls.akakce && (
                                        <a
                                          href={p.urls.akakce}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[10px] text-orange-600 hover:text-orange-700 flex items-center gap-1"
                                        >
                                          <ExternalLink className="w-3 h-3" /> Akakce
                                        </a>
                                      )}
                                    </div>
                                    {p.akakce ? (
                                      <div className="space-y-2 text-xs">
                                        <div className="grid grid-cols-2 gap-2">
                                          <div className="bg-green-50 rounded p-2 text-center">
                                            <p className="text-[9px] text-green-600">EN DUSUK</p>
                                            <p className="font-mono font-semibold text-green-700">{formatCurrency(p.akakce.low_price)}</p>
                                          </div>
                                          <div className="bg-red-50 rounded p-2 text-center">
                                            <p className="text-[9px] text-red-600">EN YUKSEK</p>
                                            <p className="font-mono font-semibold text-red-700">{formatCurrency(p.akakce.high_price)}</p>
                                          </div>
                                        </div>
                                        <div className="bg-primary-50 rounded p-2">
                                          <div className="flex justify-between items-center">
                                            <span className="text-[9px] text-primary-600">PETZZ</span>
                                            {p.akakce.petzz_rank && (
                                              <Badge variant="primary" size="xs">#{p.akakce.petzz_rank}</Badge>
                                            )}
                                          </div>
                                          <p className="font-mono font-bold text-primary-700">
                                            {formatCurrency(p.akakce.petzz_price || p.pricing.selling_price)}
                                          </p>
                                        </div>
                                        {p.akakce.price_diff !== null && (
                                          <div className={clsx("rounded p-2", p.akakce.price_diff <= 0 ? "bg-green-50" : "bg-yellow-50")}>
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">En dusukten fark</span>
                                              <span className={p.akakce.price_diff <= 0 ? "text-green-600" : "text-yellow-600"}>
                                                {p.akakce.price_diff > 0 ? '+' : ''}{formatCurrency(p.akakce.price_diff)}
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="text-center py-4 text-gray-400">
                                        <AlertCircle className="w-6 h-6 mx-auto mb-1" />
                                        <p className="text-xs">Akakce verisi yok</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Competitors */}
                                  <div className="bg-white rounded-lg border p-3">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                                      Rakipler ({p.akakce?.competitors?.length || 0})
                                    </h4>
                                    {p.akakce?.competitors && p.akakce.competitors.length > 0 ? (
                                      <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                                        {p.akakce.competitors.map((c, i) => {
                                          const isPetzz = c.name?.toLowerCase().includes('petzz')
                                          const maxPrice = Math.max(...p.akakce.competitors.map(x => x.price))
                                          const width = maxPrice > 0 ? (c.price / maxPrice) * 100 : 0

                                          return (
                                            <div key={i} className="flex items-center gap-2 text-xs">
                                              <span className={clsx(
                                                "w-4 text-right font-mono text-gray-400",
                                                isPetzz && "font-semibold text-primary-600"
                                              )}>
                                                {i + 1}.
                                              </span>
                                              <span className={clsx(
                                                "w-24 truncate",
                                                isPetzz ? "font-semibold text-primary-600" : "text-gray-600"
                                              )}>
                                                {c.name}
                                              </span>
                                              <div className="flex-1 h-2 bg-gray-100 rounded overflow-hidden">
                                                <div
                                                  className={clsx(
                                                    "h-full rounded",
                                                    isPetzz ? "bg-primary-500" : i === 0 ? "bg-green-500" : "bg-gray-300"
                                                  )}
                                                  style={{ width: `${width}%` }}
                                                />
                                              </div>
                                              <span className={clsx(
                                                "w-16 text-right font-mono",
                                                isPetzz && "font-semibold text-primary-600"
                                              )}>
                                                {formatCurrency(c.price)}
                                              </span>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    ) : (
                                      <div className="text-center py-4 text-gray-400">
                                        <Package className="w-6 h-6 mx-auto mb-1" />
                                        <p className="text-xs">Rakip verisi yok</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
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
                {formatNumber(pagination.total)} urunden {(page - 1) * 50 + 1}-{Math.min(page * 50, pagination.total)}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(1)} disabled={page === 1}
                  className="px-2 py-1 border rounded hover:bg-white disabled:opacity-50">Ilk</button>
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
