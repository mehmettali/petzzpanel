import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Package, RefreshCw, Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  ExternalLink, Layers, AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
  Box, Calculator, Percent, BarChart3, Hash, Store, ShoppingBag
} from 'lucide-react'
import {
  detectBundles,
  getBundles,
  getBundleStats,
  getBundlesByBaseSku
} from '../services/api'
import { Card } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { EmptyState } from '../components/ui/Spinner'
import { Skeleton } from '../components/ui/Skeleton'
import { formatNumber, formatCurrency } from '../utils/formatters'
import clsx from 'clsx'

// Stat Card Component
function StatCard({ icon: Icon, label, value, subValue, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600'
  }

  return (
    <Card className="p-4">
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

// Bundle Detail Panel
function BundleDetail({ baseSku }) {
  const { data, isLoading } = useQuery({
    queryKey: ['bundle-detail', baseSku],
    queryFn: () => getBundlesByBaseSku(baseSku),
    enabled: !!baseSku
  })

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 border-t">
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!data) return null

  const { baseProduct, bundles, summary } = data

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white border-t p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Base Product Info */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
            <Package className="w-3 h-3" /> Ana Urun (Tekli)
          </h4>
          <div className="bg-white rounded-lg border p-3">
            <p className="font-medium text-gray-900 text-sm mb-2">{baseProduct.name}</p>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-500">SKU:</span> <span className="font-mono">{baseProduct.code}</span></p>
              <p><span className="text-gray-500">Marka:</span> {baseProduct.brand || '-'}</p>
              <p><span className="text-gray-500">Alis:</span> <span className="text-orange-600 font-medium">{formatCurrency(baseProduct.buying_price)}</span></p>
              <p><span className="text-gray-500">Satis:</span> <span className="text-green-600 font-medium">{formatCurrency(baseProduct.selling_price)}</span></p>
              <p><span className="text-gray-500">Stok:</span> {baseProduct.total_quantity || 0} adet</p>
            </div>
            {/* Links */}
            <div className="flex gap-2 mt-3 pt-3 border-t">
              {baseProduct.petzzshop_url ? (
                <a href={baseProduct.petzzshop_url} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-primary-50 text-primary-600 hover:bg-primary-100 text-xs">
                  <Store className="w-3 h-3" /> PetzzShop
                </a>
              ) : (
                <span className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-gray-50 text-gray-400 text-xs">
                  <Store className="w-3 h-3" /> Vitrin Yok
                </span>
              )}
              {baseProduct.akakce_url ? (
                <a href={baseProduct.akakce_url} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-orange-50 text-orange-600 hover:bg-orange-100 text-xs">
                  <ShoppingBag className="w-3 h-3" /> Akakce
                </a>
              ) : (
                <span className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded bg-gray-50 text-gray-400 text-xs">
                  <ShoppingBag className="w-3 h-3" /> Akakce Yok
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bundles List */}
        <div className="lg:col-span-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1 mb-3">
            <Layers className="w-3 h-3" /> Paket Varyantlari ({bundles.length})
          </h4>
          <div className="space-y-2">
            {bundles.map((bundle, i) => (
              <div key={i} className="bg-white rounded-lg border p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="primary" size="sm">x{bundle.multiplier}</Badge>
                      <span className="font-mono text-xs text-gray-500">{bundle.related_sku}</span>
                    </div>
                    <p className="text-sm text-gray-900 truncate">{bundle.bundle_name}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-xs text-gray-400 line-through">{formatCurrency(bundle.expected_price)}</p>
                        <p className="font-medium text-green-600">{formatCurrency(bundle.actual_price)}</p>
                      </div>
                      {bundle.savings > 0 ? (
                        <Badge variant="success" size="sm">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          %{bundle.savings_percent}
                        </Badge>
                      ) : bundle.savings < 0 ? (
                        <Badge variant="danger" size="sm">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +%{Math.abs(bundle.savings_percent)}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" size="sm">Esit</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Stok: {bundle.stock_count || 0}
                    </p>
                  </div>
                </div>
                {bundle.storefront_url && (
                  <a
                    href={bundle.storefront_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-primary-600 hover:text-primary-700"
                  >
                    <ExternalLink className="w-3 h-3" />
                    petzzshop.com'da Gor
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-500">
              Mevcut Carpanlar: {summary.multipliers.map(m => `x${m}`).join(', ')}
            </span>
          </div>
          <span className="text-gray-500">
            Toplam Potansiyel Gelir: <span className="font-medium text-green-600">{formatCurrency(summary.total_potential_revenue)}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Bundles() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [multiplierFilter, setMultiplierFilter] = useState('')
  const [expandedRows, setExpandedRows] = useState(new Set())

  const queryClient = useQueryClient()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['bundle-stats'],
    queryFn: getBundleStats
  })

  const { data: bundlesData, isLoading: bundlesLoading } = useQuery({
    queryKey: ['bundles', { page, baseSku: search, multiplier: multiplierFilter }],
    queryFn: () => getBundles({
      page,
      limit: 50,
      baseSku: search,
      multiplier: multiplierFilter
    })
  })

  const detectMutation = useMutation({
    mutationFn: detectBundles,
    onSuccess: () => {
      queryClient.invalidateQueries(['bundle-stats'])
      queryClient.invalidateQueries(['bundles'])
      queryClient.invalidateQueries(['storefront-status'])
    }
  })

  const toggleRow = (baseSku) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      next.has(baseSku) ? next.delete(baseSku) : next.add(baseSku)
      return next
    })
  }

  const overview = stats?.overview || {}
  const multiplierDist = stats?.multiplierDistribution || []
  const topBundled = stats?.topBundledProducts || []
  const priceAnalysis = stats?.priceAnalysis || {}
  const { bundles, pagination } = bundlesData || { bundles: [], pagination: {} }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary-600" />
            Paket Iliskileri
          </h1>
          <p className="text-gray-500 text-sm">
            Coklu paket urunlerin (6'li, 12'li, 24'lu) ana urunlerle iliskisi
          </p>
        </div>
        <button
          onClick={() => detectMutation.mutate()}
          disabled={detectMutation.isLoading}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            detectMutation.isLoading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-primary-600 text-white hover:bg-primary-700"
          )}
        >
          <RefreshCw className={clsx("w-4 h-4", detectMutation.isLoading && "animate-spin")} />
          {detectMutation.isLoading ? 'Tespit Ediliyor...' : 'Bundle Tespit Et'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          icon={Layers}
          label="Toplam Bundle"
          value={formatNumber(overview.total_bundles || 0)}
          color="primary"
        />
        <StatCard
          icon={Package}
          label="Benzersiz Ana Urun"
          value={formatNumber(overview.unique_base_products || 0)}
          color="blue"
        />
        <StatCard
          icon={Hash}
          label="Ort. Carpan"
          value={overview.avg_multiplier?.toFixed(1) || '-'}
          subValue={`Min: x${overview.min_multiplier || '-'} / Max: x${overview.max_multiplier || '-'}`}
          color="purple"
        />
        <StatCard
          icon={TrendingDown}
          label="Karli Bundle"
          value={formatNumber(priceAnalysis.profitable_bundles || 0)}
          subValue={`%${priceAnalysis.avg_savings_percent || 0} ort. tasarruf`}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Zararli Bundle"
          value={formatNumber(priceAnalysis.loss_bundles || 0)}
          color="red"
        />
      </div>

      {/* Multiplier Distribution */}
      {multiplierDist.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary-600" />
            Carpan Dagilimi
          </h3>
          <div className="flex flex-wrap gap-2">
            {multiplierDist.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setMultiplierFilter(multiplierFilter === String(item.multiplier) ? '' : String(item.multiplier))
                  setPage(1)
                }}
                className={clsx(
                  "px-4 py-2 rounded-lg border text-sm transition-all",
                  multiplierFilter === String(item.multiplier)
                    ? "bg-primary-50 border-primary-300 text-primary-700"
                    : "hover:bg-gray-50"
                )}
              >
                <span className="font-bold">x{item.multiplier}</span>
                <span className="text-gray-500 ml-2">{formatNumber(item.count)} paket</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Top Bundled Products */}
      {topBundled.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Box className="w-4 h-4 text-primary-600" />
            En Cok Paketlenen Urunler
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {topBundled.slice(0, 8).map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setSearch(item.base_sku)
                  setPage(1)
                }}
                className="p-3 rounded-lg border text-left hover:bg-gray-50 transition-all"
              >
                <p className="font-mono text-xs text-gray-500">{item.base_sku}</p>
                <p className="text-sm font-medium text-gray-900 truncate">{item.base_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="primary" size="xs">{item.bundle_count} paket</Badge>
                  <span className="text-xs text-gray-500">
                    {item.multipliers.map(m => `x${m}`).join(', ')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Base SKU ara..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          <select
            value={multiplierFilter}
            onChange={(e) => { setMultiplierFilter(e.target.value); setPage(1) }}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="">Tum Carpanlar</option>
            <option value="2">x2 (Ikili)</option>
            <option value="6">x6 (Altili)</option>
            <option value="12">x12 (Onikili)</option>
            <option value="24">x24 (Yirmi Dortlu)</option>
          </select>

          {(search || multiplierFilter) && (
            <button
              onClick={() => { setSearch(''); setMultiplierFilter(''); setPage(1) }}
              className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
            >
              <RefreshCw className="w-4 h-4" /> Temizle
            </button>
          )}
        </div>
      </Card>

      {/* Bundles Table */}
      <Card className="overflow-hidden p-0">
        {bundlesLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500 mt-2">Yukleniyor...</p>
          </div>
        ) : bundles.length === 0 ? (
          <EmptyState
            message={overview.total_bundles === 0 ? "Henuz bundle tespiti yapilmadi" : "Bundle bulunamadi"}
            icon={Layers}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="text-xs text-gray-500 uppercase">
                    <th className="w-6 px-1"></th>
                    <th className="px-3 py-2 text-left">Base SKU</th>
                    <th className="px-3 py-2 text-left">Bundle SKU</th>
                    <th className="px-3 py-2 text-center">Carpan</th>
                    <th className="px-3 py-2 text-left">Ana Urun</th>
                    <th className="px-3 py-2 text-right">Birim Fiyat</th>
                    <th className="px-3 py-2 text-right">Beklenen</th>
                    <th className="px-3 py-2 text-right">Gercek</th>
                    <th className="px-3 py-2 text-center">Tasarruf</th>
                    <th className="px-3 py-2 text-center">Stok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bundles.map((b, i) => {
                    const isExpanded = expandedRows.has(b.sku)
                    const expectedPrice = (b.base_selling_price || 0) * b.multiplier
                    const actualPrice = b.bundle_sell_price || 0
                    const savings = expectedPrice - actualPrice
                    const savingsPercent = expectedPrice > 0 ? (savings / expectedPrice * 100).toFixed(1) : 0

                    return (
                      <>
                        <tr
                          key={i}
                          onClick={() => toggleRow(b.sku)}
                          className={clsx(
                            'cursor-pointer transition-colors text-xs',
                            isExpanded ? 'bg-primary-50' : 'hover:bg-gray-50'
                          )}
                        >
                          <td className="px-1 py-2">
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-3 h-3 text-gray-400" />
                            )}
                          </td>
                          <td className="px-3 py-2 font-mono text-gray-600">{b.sku}</td>
                          <td className="px-3 py-2 font-mono text-gray-600">{b.related_sku}</td>
                          <td className="px-3 py-2 text-center">
                            <Badge variant="primary" size="sm">x{b.multiplier}</Badge>
                          </td>
                          <td className="px-3 py-2">
                            <p className="truncate max-w-[200px] font-medium text-gray-900">{b.base_name || '-'}</p>
                          </td>
                          <td className="px-3 py-2 text-right font-medium">
                            {formatCurrency(b.base_selling_price || 0)}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-500">
                            {formatCurrency(expectedPrice)}
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-green-600">
                            {formatCurrency(actualPrice)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {savings > 0 ? (
                              <Badge variant="success" size="xs">%{savingsPercent}</Badge>
                            ) : savings < 0 ? (
                              <Badge variant="danger" size="xs">+%{Math.abs(savingsPercent)}</Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {b.bundle_stock > 0 ? (
                              <span className="text-green-600 font-medium">{b.bundle_stock}</span>
                            ) : (
                              <span className="text-red-500">0</span>
                            )}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${b.sku}-detail`}>
                            <td colSpan={10} className="p-0">
                              <BundleDetail baseSku={b.sku} />
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
                {formatNumber(pagination.total)} bundle'dan {(page - 1) * 50 + 1}-{Math.min(page * 50, pagination.total)}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-2 py-1 border rounded hover:bg-white disabled:opacity-50"
                >
                  Ilk
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
