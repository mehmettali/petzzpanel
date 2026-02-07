import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Package,
  Download, RefreshCw, AlertTriangle, CheckCircle, XCircle, Info,
  Maximize2, Minimize2, Filter, TrendingUp, Award, Target, Zap,
  ExternalLink
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  getDetectiveSummary,
  getDetectiveProducts,
  getDetectiveProductDetail,
  getDetectiveIssueTypes,
  getCategories
} from '../services/api'
import { Card } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/Spinner'
import { Skeleton } from '../components/ui/Skeleton'
import { formatNumber, truncate } from '../utils/formatters'
import clsx from 'clsx'

// Grade Badge Component
function GradeBadge({ grade, score, size = 'md' }) {
  const styles = {
    'A+': 'bg-green-500 text-white',
    'A': 'bg-green-400 text-white',
    'B': 'bg-yellow-400 text-yellow-900',
    'C': 'bg-orange-400 text-white',
    'D': 'bg-orange-500 text-white',
    'F': 'bg-red-500 text-white'
  }

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg'
  }

  return (
    <div className={clsx(
      "rounded-lg flex flex-col items-center justify-center font-bold",
      styles[grade],
      sizes[size]
    )}>
      <span>{grade}</span>
      {size !== 'sm' && <span className="text-[10px] opacity-80">{score}</span>}
    </div>
  )
}

// Score Bar Component
function ScoreBar({ score, showLabel = true }) {
  const getColor = () => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 80) return 'bg-green-400'
    if (score >= 70) return 'bg-yellow-400'
    if (score >= 60) return 'bg-orange-400'
    if (score >= 50) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="w-full">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={clsx("h-full rounded-full transition-all", getColor())}
          style={{ width: `${score}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
          <span>0</span>
          <span>{score}/100</span>
        </div>
      )}
    </div>
  )
}

// Issue Icons Component
function IssueIcons({ issues }) {
  if (!issues || issues.length === 0) {
    return <CheckCircle className="w-4 h-4 text-green-500" />
  }

  const uniqueIcons = [...new Set(issues.map(i => i.icon))]

  return (
    <div className="flex flex-wrap gap-1">
      {uniqueIcons.slice(0, 5).map((icon, i) => (
        <span key={i} className="text-sm" title={issues.find(iss => iss.icon === icon)?.label}>
          {icon}
        </span>
      ))}
      {issues.length > 5 && (
        <span className="text-xs text-gray-400">+{issues.length - 5}</span>
      )}
    </div>
  )
}

// Product Detail Component
function ProductDetail({ productId }) {
  const { data: product, isLoading } = useQuery({
    queryKey: ['detective-product', productId],
    queryFn: () => getDetectiveProductDetail(productId),
    enabled: !!productId,
  })

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 border-t">
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white border-t p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Product Info */}
        <div className="flex gap-3">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt="" className="w-16 h-16 object-cover rounded-lg border" />
          ) : (
            <div className="w-16 h-16 bg-red-50 rounded-lg flex items-center justify-center border border-red-200">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm">{product.name}</p>
            <p className="text-xs text-gray-500 font-mono">{product.code}</p>
            <div className="flex gap-1 mt-2">
              <Badge variant="secondary" size="xs">{product.main_category || 'Kategori Yok'}</Badge>
              {product.sub_category && <Badge variant="secondary" size="xs">{product.sub_category}</Badge>}
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="bg-white rounded-lg border p-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
            <Target className="w-3 h-3" /> Puan Kırılımı
          </h4>
          <div className="space-y-1 text-xs max-h-40 overflow-y-auto">
            <div className="flex justify-between text-gray-600 border-b pb-1 mb-1">
              <span>Başlangıç</span>
              <span className="font-mono font-medium">100</span>
            </div>
            {product.issues?.map((issue, i) => (
              <div key={i} className="flex justify-between text-red-600">
                <span>{issue.icon} {issue.label}</span>
                <span className="font-mono">{issue.points}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold border-t pt-1 mt-1">
              <span>Toplam</span>
              <span className={clsx(
                "font-mono",
                product.score >= 70 ? "text-green-600" : product.score >= 50 ? "text-yellow-600" : "text-red-600"
              )}>
                {product.score}
              </span>
            </div>
          </div>
        </div>

        {/* Potential Improvements */}
        <div className="bg-white rounded-lg border p-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Düzeltilirse
          </h4>
          {product.potentialImprovements?.length > 0 ? (
            <div className="space-y-1 text-xs">
              {product.potentialImprovements.slice(0, 5).map((imp, i) => (
                <div key={i} className="flex justify-between items-center bg-green-50 rounded px-2 py-1">
                  <span className="text-gray-700">{imp.icon} {imp.label} düzelt</span>
                  <span className="text-green-600 font-mono">+{imp.potentialGain}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-green-700 border-t pt-1 mt-1">
                <span>Potansiyel Puan</span>
                <span className="font-mono">{product.maxPotentialScore}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-green-600">
              <CheckCircle className="w-8 h-8 mx-auto mb-1" />
              <p className="text-sm">Sorun yok!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DataDetective() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [grade, setGrade] = useState('')
  const [issueType, setIssueType] = useState('')
  const [category, setCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [stockStatus, setStockStatus] = useState('')
  const [hasImage, setHasImage] = useState('')
  const [hasBrand, setHasBrand] = useState('')
  const [sortBy, setSortBy] = useState('score')
  const [sortOrder, setSortOrder] = useState('asc')
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['detective-summary'],
    queryFn: getDetectiveSummary,
  })

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['detective-products', { page, search, grade, issueType, category, subCategory, brand, stockStatus, hasImage, hasBrand, sortBy, sortOrder }],
    queryFn: () => getDetectiveProducts({
      page, limit: 50, search, grade, issueType, category, subCategory, brand, stockStatus, hasImage, hasBrand, sortBy, sortOrder
    }),
  })

  const { data: issueTypes } = useQuery({
    queryKey: ['detective-issue-types'],
    queryFn: getDetectiveIssueTypes,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => import('../services/api').then(m => m.getBrands()),
  })

  const uniqueCategories = [...new Set(categories?.map(c => c.main_category).filter(Boolean))]
  const subCategories = category
    ? [...new Set(categories?.filter(c => c.main_category === category).map(c => c.sub_category).filter(Boolean))]
    : []

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
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
    setGrade('')
    setIssueType('')
    setCategory('')
    setSubCategory('')
    setBrand('')
    setStockStatus('')
    setHasImage('')
    setHasBrand('')
    setPage(1)
  }

  const hasActiveFilters = search || grade || issueType || category || subCategory || brand || stockStatus || hasImage || hasBrand
  const activeFilterCount = [search, grade, issueType, category, subCategory, brand, stockStatus, hasImage, hasBrand].filter(Boolean).length

  if (summaryLoading) return <LoadingState message="Veri analizi yapılıyor..." />

  const { products, pagination } = productsData || { products: [], pagination: {} }

  return (
    <div className={clsx(
      "transition-all duration-300",
      isFullscreen ? "fixed inset-0 z-50 bg-white overflow-auto p-4" : "space-y-4"
    )}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className={clsx("font-bold text-gray-900 flex items-center gap-2", isFullscreen ? "text-xl" : "text-2xl")}>
            <Search className="w-6 h-6 text-primary-600" />
            Data Dedektifi
          </h1>
          <p className="text-gray-500 text-sm">Veri kalitesi analizi ve puanlama</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/detective/export"
            className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            CSV İndir
          </a>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={clsx(
              "flex items-center gap-2 px-3 py-2 text-sm border rounded-lg",
              isFullscreen ? "bg-primary-50 border-primary-200 text-primary-700" : "hover:bg-gray-50"
            )}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-7 gap-3">
          {/* Overall Score */}
          <Card className="col-span-2 p-4">
            <div className="flex items-center gap-4">
              <GradeBadge grade={summary.grade} score={summary.averageScore} size="lg" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Genel Sağlık Skoru</p>
                <p className="text-2xl font-bold text-gray-900">{summary.averageScore}/100</p>
                <ScoreBar score={summary.averageScore} showLabel={false} />
              </div>
            </div>
          </Card>

          {/* Grade Distribution */}
          {['A+', 'A', 'B', 'C', 'F'].map(g => (
            <Card
              key={g}
              className={clsx(
                "p-3 cursor-pointer transition-all hover:shadow-md",
                grade === g && "ring-2 ring-primary-500"
              )}
              onClick={() => { setGrade(grade === g ? '' : g); setPage(1) }}
            >
              <div className="flex items-center justify-between">
                <GradeBadge grade={g} score="" size="sm" />
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatNumber(summary.gradeDistribution?.[g] || 0)}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    %{((summary.gradeDistribution?.[g] || 0) / summary.totalProducts * 100).toFixed(1)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Top Issues */}
      {summary?.topIssues && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            En Yaygın Sorunlar
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {summary.topIssues.slice(0, 10).map((issue, i) => (
              <button
                key={i}
                onClick={() => { setIssueType(issueType === issue.code ? '' : issue.code); setPage(1) }}
                className={clsx(
                  "flex items-center gap-2 p-2 rounded-lg border text-left transition-all text-sm",
                  issueType === issue.code
                    ? "bg-primary-50 border-primary-300"
                    : "hover:bg-gray-50"
                )}
              >
                <span className="text-lg">{issue.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{issue.label}</p>
                  <p className="text-xs text-gray-500">{formatNumber(issue.count)} ürün</p>
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
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Ürün adı, kod veya marka ara..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>

            <select
              value={grade}
              onChange={(e) => { setGrade(e.target.value); setPage(1) }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Tüm Dereceler</option>
              {['A+', 'A', 'B', 'C', 'D', 'F'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <select
              value={issueType}
              onChange={(e) => { setIssueType(e.target.value); setPage(1) }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Tüm Sorunlar</option>
              {issueTypes?.map(it => (
                <option key={it.code} value={it.code}>{it.icon} {it.label}</option>
              ))}
            </select>

            <select
              value={stockStatus}
              onChange={(e) => { setStockStatus(e.target.value); setPage(1) }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Tüm Stok</option>
              <option value="in-stock">✅ Stokta Var</option>
              <option value="out-of-stock">❌ Stokta Yok</option>
              <option value="low-stock">⚠️ Kritik Stok</option>
            </select>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={clsx(
                "flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors",
                showAdvancedFilters ? "bg-primary-50 border-primary-300 text-primary-700" : "hover:bg-gray-50"
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
          {showAdvancedFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-3 border-t">
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setSubCategory(''); setPage(1) }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">Ana Kategori</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={subCategory}
                onChange={(e) => { setSubCategory(e.target.value); setPage(1) }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                disabled={!category}
              >
                <option value="">Alt Kategori</option>
                {subCategories.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>

              <select
                value={brand}
                onChange={(e) => { setBrand(e.target.value); setPage(1) }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">Tüm Markalar</option>
                {brands?.slice(0, 100).map(b => (
                  <option key={b.brand} value={b.brand}>{b.brand}</option>
                ))}
              </select>

              <select
                value={hasImage}
                onChange={(e) => { setHasImage(e.target.value); setPage(1) }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">Görsel Durumu</option>
                <option value="yes">🖼️ Görseli Var</option>
                <option value="no">❌ Görseli Yok</option>
                <option value="single">⚠️ Tek Görsel</option>
                <option value="multiple">✅ Çoklu Görsel</option>
              </select>

              <select
                value={hasBrand}
                onChange={(e) => { setHasBrand(e.target.value); setPage(1) }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">Marka Durumu</option>
                <option value="yes">✅ Markası Var</option>
                <option value="no">❌ Markası Yok</option>
              </select>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Info className="w-4 h-4" />
                {activeFilterCount} filtre aktif
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Products Table */}
      <Card className="overflow-hidden p-0">
        {productsLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2">Analiz ediliyor...</p>
          </div>
        ) : products.length === 0 ? (
          <EmptyState message="Ürün bulunamadı" icon={Package} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="text-xs text-gray-500 uppercase">
                    <th className="w-6 px-1"></th>
                    <th
                      className="px-2 py-2 text-center cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('score')}
                    >
                      Puan {sortBy === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-2 py-2 text-left">Görsel</th>
                    <th className="px-2 py-2 text-left">Kod</th>
                    <th
                      className="px-2 py-2 text-left cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('name')}
                    >
                      Ürün Adı {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-2 py-2 text-left">Marka</th>
                    <th className="px-2 py-2 text-left">Kategori</th>
                    <th className="px-2 py-2 text-center">Stok</th>
                    <th className="px-2 py-2 text-center">Görsel</th>
                    <th
                      className="px-2 py-2 text-center cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('issues')}
                    >
                      Sorun {sortBy === 'issues' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-2 py-2 text-left">Detay</th>
                    <th className="px-2 py-2 text-center">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => {
                    const isExpanded = expandedRows.has(p.id)

                    return (
                      <>
                        <tr
                          key={p.id}
                          onClick={() => toggleRow(p.id)}
                          className={clsx(
                            'cursor-pointer transition-colors text-xs',
                            isExpanded ? 'bg-primary-50' : 'hover:bg-gray-50',
                            p.score < 50 && !isExpanded && 'bg-red-50/40',
                            p.total_quantity === 0 && !isExpanded && 'bg-orange-50/40'
                          )}
                        >
                          <td className="px-1 py-2">
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-3 h-3 text-gray-400" />
                            )}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <GradeBadge grade={p.grade} score={p.score} size="sm" />
                          </td>
                          <td className="px-2 py-2">
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt="" className="h-8 w-8 rounded object-cover border" />
                            ) : (
                              <div className="h-8 w-8 rounded bg-red-50 border border-red-200 flex items-center justify-center">
                                <XCircle className="h-4 w-4 text-red-400" />
                              </div>
                            )}
                          </td>
                          <td className="px-2 py-2 font-mono text-gray-600">{p.code}</td>
                          <td className="px-2 py-2">
                            <p className={clsx(
                              "truncate max-w-[200px]",
                              p.issues.some(i => i.code === 'NAME_IS_CODE') && "text-red-600"
                            )}>
                              {p.name}
                            </p>
                          </td>
                          <td className="px-2 py-2">
                            {p.brand ? (
                              <span className="text-gray-700">{truncate(p.brand, 12)}</span>
                            ) : (
                              <span className="text-red-500">❌</span>
                            )}
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex flex-col">
                              {p.main_category ? (
                                <span className="text-gray-700">{p.main_category}</span>
                              ) : (
                                <span className="text-red-500">❌</span>
                              )}
                              {p.sub_category && (
                                <span className="text-gray-400 text-[10px]">{truncate(p.sub_category, 20)}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-2 text-center">
                            {p.total_quantity === 0 ? (
                              <Badge variant="danger" size="xs">Yok</Badge>
                            ) : p.total_quantity < 5 ? (
                              <Badge variant="warning" size="xs">{p.total_quantity}</Badge>
                            ) : (
                              <Badge variant="success" size="xs">{p.total_quantity}</Badge>
                            )}
                          </td>
                          <td className="px-2 py-2 text-center">
                            {!p.images || p.images.length === 0 ? (
                              <span className="text-red-500">❌</span>
                            ) : p.images.length === 1 ? (
                              <span className="text-yellow-500">1</span>
                            ) : (
                              <span className="text-green-500">{p.images.length}</span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <Badge variant={p.issueCount === 0 ? 'success' : p.issueCount < 3 ? 'warning' : 'danger'} size="xs">
                              {p.issueCount}
                            </Badge>
                          </td>
                          <td className="px-2 py-2">
                            <IssueIcons issues={p.issues} />
                          </td>
                          <td className="px-2 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {p.petzzshop_url ? (
                                <a
                                  href={p.petzzshop_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                                  title="PetzzShop'da görüntüle"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              ) : (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-50 text-gray-300" title="Vitrin eşleşmesi yok">
                                  <ExternalLink className="w-4 h-4" />
                                </span>
                              )}
                              {p.akakce_url ? (
                                <a
                                  href={p.akakce_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                                  title="Akakce'de görüntüle"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              ) : (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-50 text-gray-300" title="Akakce verisi yok">
                                  <ExternalLink className="w-4 h-4" />
                                </span>
                              )}
                              <Link
                                to={`/products?search=${encodeURIComponent(p.code)}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                title="Panelde aç"
                              >
                                <Search className="w-4 h-4" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${p.id}-detail`}>
                            <td colSpan={12} className="p-0">
                              <ProductDetail productId={p.id} />
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
                  {page} / {pagination.totalPages}
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
