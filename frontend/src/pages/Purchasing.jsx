import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ShoppingCart, AlertTriangle, Package, Building, Store, ShoppingBag,
  ExternalLink, TrendingUp, TrendingDown, Zap, Clock, Target,
  BarChart3, Filter, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight,
  Truck, DollarSign, Activity, Layers, RefreshCw, Plus, Minus, Trash2,
  Calendar, Download, FileText, Check, X, Eye, AlertCircle, StopCircle,
  HelpCircle, Info
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  getPurchasingDecisionEngine,
  getPurchasingFilterOptions,
  getSupplierPerformance,
  getFastMovers,
  getSlowMovers,
  getCategoryTurnover,
  generatePurchasingStrategy,
  getPetzzOrderRecommendations
} from '../services/api'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { LoadingState } from '../components/ui/Spinner'
import { formatCurrency, formatNumber, truncate } from '../utils/formatters'
import clsx from 'clsx'

// ═══════════════════════════════════════════════════════════════════════════
// SATIN ALMA KARAR MOTORU - UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// Action Badge Component
function ActionBadge({ action }) {
  const styles = {
    ORDER: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', icon: ShoppingCart, label: 'SİPARİŞ VER' },
    WATCH: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', icon: Eye, label: 'İZLE' },
    FIX_PRICE: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', icon: AlertCircle, label: 'FİYAT DÜZELT' },
    STOP: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: StopCircle, label: 'DURDUR' }
  }

  const style = styles[action] || styles.WATCH
  const Icon = style.icon

  return (
    <span className={clsx(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border',
      style.bg, style.text, style.border
    )}>
      <Icon className="w-3 h-3" />
      {style.label}
    </span>
  )
}

// Priority Label Badge
function PriorityBadge({ label, score }) {
  const styles = {
    HIGH: 'bg-red-100 text-red-800 border-red-200',
    MEDIUM: 'bg-orange-100 text-orange-800 border-orange-200',
    LOW: 'bg-gray-100 text-gray-600 border-gray-200'
  }
  const icons = { HIGH: Zap, MEDIUM: Clock, LOW: Target }
  const labels = { HIGH: 'Yüksek', MEDIUM: 'Orta', LOW: 'Düşük' }
  const Icon = icons[label] || Target

  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', styles[label])}>
      <Icon className="w-3 h-3" />
      {labels[label]} ({score})
    </span>
  )
}

// Reasons Tooltip Component
function ReasonsTooltip({ reasons }) {
  if (!reasons || reasons.length === 0) return null

  return (
    <div className="group relative inline-flex">
      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
      <div className="absolute z-50 left-0 top-full mt-1 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
        <ul className="space-y-1">
          {reasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-1">
              <span className="text-gray-400">•</span>
              {reason}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Days of Cover Badge
function DaysOfCoverBadge({ days, rop }) {
  if (days === null || days === undefined) return <span className="text-gray-400 text-xs">-</span>
  if (days === 0) return <Badge variant="danger" size="xs">Stok Yok</Badge>
  if (rop && days < rop / 2) return <Badge variant="danger" size="xs">{days} gün</Badge>
  if (days < 7) return <Badge variant="danger" size="xs">{days} gün</Badge>
  if (days < 14) return <Badge variant="warning" size="xs">{days} gün</Badge>
  if (days < 30) return <Badge variant="info" size="xs">{days} gün</Badge>
  return <Badge variant="success" size="xs">{days}+ gün</Badge>
}

// Price Gap Indicator
function PriceGapIndicator({ gap }) {
  if (gap === null || gap === undefined) return <span className="text-gray-400 text-xs">-</span>
  if (gap <= 0) return <span className="inline-flex items-center gap-0.5 text-green-600 text-xs font-medium"><ArrowDownRight className="w-3 h-3" />En ucuz</span>
  if (gap <= 5) return <span className="text-green-500 text-xs font-medium">+%{gap.toFixed(0)}</span>
  if (gap <= 10) return <span className="text-yellow-600 text-xs">+%{gap.toFixed(0)}</span>
  if (gap <= 20) return <span className="inline-flex items-center gap-0.5 text-orange-600 text-xs"><ArrowUpRight className="w-3 h-3" />+%{gap.toFixed(0)}</span>
  return <span className="inline-flex items-center gap-0.5 text-red-600 text-xs font-bold"><ArrowUpRight className="w-3 h-3" />+%{gap.toFixed(0)}</span>
}

// Quantity Input Component
function QuantityInput({ value, onChange, min = 0, max = 9999 }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(min, (value || 0) - 1))}
        className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
        disabled={value <= min}
      >
        <Minus className="w-3 h-3" />
      </button>
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(Math.min(max, Math.max(min, parseInt(e.target.value) || 0)))}
        className="w-14 h-6 text-center text-xs border rounded focus:border-primary-500 focus:outline-none"
        min={min}
        max={max}
      />
      <button
        onClick={() => onChange(Math.min(max, (value || 0) + 1))}
        className="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function Purchasing() {
  const [activeTab, setActiveTab] = useState('order-recommendations')
  const [supplierFilter, setSupplierFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [stockStatusFilter, setStockStatusFilter] = useState('low')
  const [minScoreFilter, setMinScoreFilter] = useState(0)

  // Strategy state
  const [strategyTemplate, setStrategyTemplate] = useState('weekly_90day')
  const [strategySupplier, setStrategySupplier] = useState('')
  const [strategyCategory, setStrategyCategory] = useState('')
  const [strategyBrand, setStrategyBrand] = useState('')

  // Order Recommendations state (15 Günlük Hedef)
  const [orderSupplier, setOrderSupplier] = useState('')
  const [orderCategory, setOrderCategory] = useState('')
  const [orderBrand, setOrderBrand] = useState('')

  // Sipariş Sepeti State
  const [orderCart, setOrderCart] = useState({})
  const [orderPeriod, setOrderPeriod] = useState('monthly')
  const [customDays, setCustomDays] = useState(30)
  const [showCart, setShowCart] = useState(false)

  // Period gün hesaplama
  const periodDays = useMemo(() => {
    switch (orderPeriod) {
      case 'weekly': return 7
      case 'biweekly': return 14
      case 'monthly': return 30
      case 'quarterly': return 90
      case 'custom': return customDays
      default: return 30
    }
  }, [orderPeriod, customDays])

  // Filter Options Query (tüm markalar, tedarikçiler, kategoriler)
  const { data: filterOptions } = useQuery({
    queryKey: ['purchasingFilterOptions'],
    queryFn: getPurchasingFilterOptions,
    staleTime: 5 * 60 * 1000, // 5 dakika cache
  })

  // Decision Engine Query
  const { data: engineData, isLoading: engineLoading, error: engineError } = useQuery({
    queryKey: ['purchasingDecisionEngine', {
      supplier: supplierFilter,
      category: categoryFilter,
      brand: brandFilter,
      minScore: minScoreFilter,
      action: actionFilter || null,
      stockStatus: stockStatusFilter
    }],
    queryFn: () => getPurchasingDecisionEngine({
      supplier: supplierFilter || undefined,
      category: categoryFilter || undefined,
      brand: brandFilter || undefined,
      minScore: minScoreFilter,
      action: actionFilter || undefined,
      stockStatus: stockStatusFilter,
      limit: 500
    }),
  })

  // Other queries
  const { data: supplierPerf } = useQuery({
    queryKey: ['supplierPerformance'],
    queryFn: getSupplierPerformance,
  })

  const { data: fastMovers } = useQuery({
    queryKey: ['fastMovers'],
    queryFn: () => getFastMovers({ limit: 30 }),
  })

  const { data: slowMovers } = useQuery({
    queryKey: ['slowMovers'],
    queryFn: () => getSlowMovers({ limit: 30 }),
  })

  const { data: categoryTurnover } = useQuery({
    queryKey: ['categoryTurnover'],
    queryFn: getCategoryTurnover,
  })

  // Purchasing Strategy Query
  const { data: strategyData, isLoading: strategyLoading, refetch: refetchStrategy } = useQuery({
    queryKey: ['purchasingStrategy', strategyTemplate, strategySupplier, strategyCategory, strategyBrand],
    queryFn: () => generatePurchasingStrategy({
      templateId: strategyTemplate,
      supplier: strategySupplier || undefined,
      category: strategyCategory || undefined,
      brand: strategyBrand || undefined,
      limit: 500
    }),
    enabled: activeTab === 'strategy',
  })

  // Order Recommendations Query (15 Günlük Hedef)
  const { data: orderData, isLoading: orderLoading } = useQuery({
    queryKey: ['orderRecommendations', orderSupplier, orderCategory, orderBrand],
    queryFn: () => getPetzzOrderRecommendations({
      supplier: orderSupplier || undefined,
      category: orderCategory || undefined,
      brand: orderBrand || undefined,
      limit: 1000
    }),
    enabled: activeTab === 'order-recommendations',
  })

  // Sepet işlemleri
  const addToCart = (product, quantity) => {
    if (quantity > 0) {
      setOrderCart(prev => ({ ...prev, [product.productId]: { product, quantity } }))
    } else {
      removeFromCart(product.productId)
    }
  }

  const removeFromCart = (productId) => {
    setOrderCart(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

  const clearCart = () => setOrderCart({})

  // Tüm ORDER aksiyonlu ürünleri sepete ekle
  const addAllOrders = () => {
    const newCart = {}
    engineData?.items?.filter(item => item.action === 'ORDER').forEach(item => {
      if (item.suggestedOrderQty > 0) {
        newCart[item.productId] = { product: item, quantity: item.suggestedOrderQty }
      }
    })
    setOrderCart(newCart)
  }

  // Sepet özeti hesaplama
  const cartSummary = useMemo(() => {
    const items = Object.values(orderCart)
    const totalItems = items.length
    const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalCost = items.reduce((sum, item) => sum + (item.quantity * (item.product.buyingPrice || 0)), 0)
    const bySupplier = {}

    items.forEach(item => {
      const supplier = item.product.supplierName || 'Bilinmiyor'
      if (!bySupplier[supplier]) {
        bySupplier[supplier] = { count: 0, units: 0, cost: 0 }
      }
      bySupplier[supplier].count++
      bySupplier[supplier].units += item.quantity
      bySupplier[supplier].cost += item.quantity * (item.product.buyingPrice || 0)
    })

    return { totalItems, totalUnits, totalCost, bySupplier }
  }, [orderCart])

  // CSV Export
  const exportToCSV = () => {
    const items = Object.values(orderCart)
    if (items.length === 0) return

    const headers = ['Kod', 'Ürün Adı', 'Marka', 'Tedarikçi', 'Aksiyon', 'Öncelik', 'Mevcut Stok', 'Sipariş Miktarı', 'Birim Fiyat', 'Toplam']
    const rows = items.map(item => [
      item.product.code,
      `"${item.product.name}"`,
      item.product.brand || '',
      `"${item.product.supplierName || ''}"`,
      item.product.action,
      item.product.priorityLabel,
      item.product.currentStock,
      item.quantity,
      item.product.buyingPrice || 0,
      (item.quantity * (item.product.buyingPrice || 0)).toFixed(2)
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `siparis_karar_motoru_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (engineLoading) return <LoadingState message="Satın alma karar motoru yükleniyor..." />

  // Use filter options from dedicated endpoint (tüm veritabanından)
  const brands = filterOptions?.brands || []
  const suppliers = filterOptions?.suppliers || []
  const categories = filterOptions?.categories || []
  const kpis = engineData?.kpis || {}
  const actionDist = engineData?.actionDistribution || {}
  const priorityDist = engineData?.priorityDistribution || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Satın Alma Karar Motoru</h1>
          <p className="text-gray-500">Akıllı sipariş önerileri ve stok yönetimi</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCart(!showCart)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-colors",
              Object.keys(orderCart).length > 0
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            <ShoppingCart className="w-4 h-4" />
            Sepet ({cartSummary.totalItems})
            {cartSummary.totalCost > 0 && (
              <span className="font-semibold">{formatCurrency(cartSummary.totalCost)}</span>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards - Decision Engine Specific */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="p-3 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-500 rounded-lg">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-green-600 font-medium">SİPARİŞ VER</p>
              <p className="text-xl font-bold text-green-700">{actionDist.ORDER || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500 rounded-lg">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium">İZLE</p>
              <p className="text-xl font-bold text-blue-700">{actionDist.WATCH || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-yellow-500 rounded-lg">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-yellow-700 font-medium">FİYAT DÜZELT</p>
              <p className="text-xl font-bold text-yellow-800">{actionDist.FIX_PRICE || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-500 rounded-lg">
              <StopCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-red-600 font-medium">DURDUR</p>
              <p className="text-xl font-bold text-red-700">{actionDist.STOP || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-500 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Stoksuz</p>
              <p className="text-xl font-bold text-gray-900">{kpis.totalOutOfStock || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-500 rounded-lg">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Ort. Skor</p>
              <p className="text-xl font-bold text-gray-900">{kpis.avgPriorityScore || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-500 rounded-lg">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-purple-600 font-medium">Sipariş Maliyeti</p>
              <p className="text-lg font-bold text-purple-700">{formatCurrency(kpis.totalOrderCost || 0)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Priority Distribution Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-700">Öncelik Dağılımı</h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Yüksek: {priorityDist.HIGH || 0}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-400"></span> Orta: {priorityDist.MEDIUM || 0}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-400"></span> Düşük: {priorityDist.LOW || 0}</span>
          </div>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
          {priorityDist.HIGH > 0 && (
            <div className="bg-red-500 h-full" style={{ width: `${(priorityDist.HIGH / kpis.totalItems) * 100}%` }}></div>
          )}
          {priorityDist.MEDIUM > 0 && (
            <div className="bg-orange-400 h-full" style={{ width: `${(priorityDist.MEDIUM / kpis.totalItems) * 100}%` }}></div>
          )}
          {priorityDist.LOW > 0 && (
            <div className="bg-gray-400 h-full" style={{ width: `${(priorityDist.LOW / kpis.totalItems) * 100}%` }}></div>
          )}
        </div>
      </Card>

      {/* Action Bar */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-700">Sipariş Dönemi:</span>
            <div className="flex gap-1">
              {[
                { id: 'weekly', label: 'Haftalık', days: 7 },
                { id: 'biweekly', label: '2 Hafta', days: 14 },
                { id: 'monthly', label: 'Aylık', days: 30 },
                { id: 'quarterly', label: '3 Ay', days: 90 }
              ].map(period => (
                <button
                  key={period.id}
                  onClick={() => setOrderPeriod(period.id)}
                  className={clsx(
                    "px-3 py-1.5 text-sm rounded-lg transition-colors",
                    orderPeriod === period.id
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-blue-100"
                  )}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Tedarik: <strong>{engineData?.config?.leadTimeDays || 7}</strong> gün |
              Hedef: <strong>{engineData?.config?.targetCoverDays || 30}</strong> gün
            </span>
            <button
              onClick={addAllOrders}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Tüm Siparişleri Ekle
            </button>
          </div>
        </div>
      </Card>

      {/* Cart Panel */}
      {showCart && Object.keys(orderCart).length > 0 && (
        <Card className="border-green-200">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <ShoppingCart className="w-5 h-5" />
                Sipariş Sepeti - {cartSummary.totalItems} ürün, {cartSummary.totalUnits} adet
              </CardTitle>
              <div className="flex gap-2">
                <button onClick={exportToCSV} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                  CSV İndir
                </button>
                <button onClick={clearCart} className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                  Temizle
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-3 max-h-64 overflow-y-auto">
                {Object.entries(cartSummary.bySupplier).map(([supplier, data]) => (
                  <div key={supplier} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{truncate(supplier, 30)}</span>
                      <span className="text-sm text-gray-600">{data.count} ürün, {formatCurrency(data.cost)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Object.values(orderCart)
                        .filter(item => (item.product.supplierName || 'Bilinmiyor') === supplier)
                        .map(item => (
                          <span key={item.product.productId} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-white rounded border">
                            {truncate(item.product.name, 20)} x{item.quantity}
                            <button onClick={() => removeFromCart(item.product.productId)} className="text-red-500 hover:text-red-700">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">Sipariş Özeti</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam Ürün:</span>
                    <span className="font-medium">{cartSummary.totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Toplam Adet:</span>
                    <span className="font-medium">{cartSummary.totalUnits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tedarikçi Sayısı:</span>
                    <span className="font-medium">{Object.keys(cartSummary.bySupplier).length}</span>
                  </div>
                  <hr className="border-green-200" />
                  <div className="flex justify-between text-lg">
                    <span className="font-medium text-green-700">Toplam Maliyet:</span>
                    <span className="font-bold text-green-800">{formatCurrency(cartSummary.totalCost)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {[
            { id: 'order-recommendations', label: 'Sipariş Önerisi (15 Gün)', icon: ShoppingCart },
            { id: 'strategy', label: 'Satın Alma Stratejisi', icon: Target },
            { id: 'decision-engine', label: 'Karar Motoru', icon: Zap },
            { id: 'suppliers', label: 'Tedarikçi Analizi', icon: Truck },
            { id: 'categories', label: 'Kategori Devir Hızı', icon: BarChart3 },
            { id: 'velocity', label: 'Ürün Hızı Analizi', icon: Activity }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content - Order Recommendations (15 Günlük Hedef) */}
      {activeTab === 'order-recommendations' && (
        <div className="space-y-6">
          {/* Header */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-600 rounded-xl">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Petzz Sipariş Önerisi</h2>
                    <p className="text-sm text-gray-600">15 günlük hedef stok bazlı • max(son15gün, son30gün/2)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Hızlı Filtreler */}
                  <div className="flex items-center gap-1 border-r pr-3 mr-2">
                    <span className="text-xs text-gray-500 font-medium">Hızlı:</span>
                    <button
                      onClick={() => setOrderBrand('Royal Canin')}
                      className={clsx(
                        "px-2 py-1 text-xs rounded-lg font-medium transition-colors",
                        orderBrand === 'Royal Canin'
                          ? "bg-red-600 text-white"
                          : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                      )}
                    >
                      Royal Canin
                    </button>
                    <button
                      onClick={() => setOrderBrand("Hill's")}
                      className={clsx(
                        "px-2 py-1 text-xs rounded-lg font-medium transition-colors",
                        orderBrand === "Hill's"
                          ? "bg-blue-600 text-white"
                          : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                      )}
                    >
                      Hill's
                    </button>
                    <button
                      onClick={() => setOrderBrand('Purina')}
                      className={clsx(
                        "px-2 py-1 text-xs rounded-lg font-medium transition-colors",
                        orderBrand === 'Purina'
                          ? "bg-purple-600 text-white"
                          : "bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100"
                      )}
                    >
                      Purina
                    </button>
                    {orderBrand && (
                      <button
                        onClick={() => setOrderBrand('')}
                        className="px-2 py-1 text-xs rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <select
                    value={orderBrand}
                    onChange={(e) => setOrderBrand(e.target.value)}
                    className="text-sm border rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="">Tüm Markalar</option>
                    {brands.slice(0, 100).map(b => (
                      <option key={b.value} value={b.value}>{truncate(b.label, 20)}</option>
                    ))}
                  </select>
                  <select
                    value={orderCategory}
                    onChange={(e) => setOrderCategory(e.target.value)}
                    className="text-sm border rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <select
                    value={orderSupplier}
                    onChange={(e) => setOrderSupplier(e.target.value)}
                    className="text-sm border rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="">Tüm Tedarikçiler</option>
                    {suppliers.slice(0, 50).map(s => (
                      <option key={s.value} value={s.value}>{truncate(s.label, 22)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {orderLoading ? (
            <LoadingState message="Sipariş önerileri hesaplanıyor..." />
          ) : orderData ? (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <div className="text-center">
                    <p className="text-xs text-blue-600 font-medium mb-1">Toplam Ürün</p>
                    <p className="text-3xl font-bold text-blue-700">{orderData.summary?.totalProducts || 0}</p>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <div className="text-center">
                    <p className="text-xs text-green-600 font-medium mb-1">Sipariş Adet</p>
                    <p className="text-3xl font-bold text-green-700">{formatNumber(orderData.summary?.totalOrderQty || 0)}</p>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <div className="text-center">
                    <p className="text-xs text-purple-600 font-medium mb-1">Sipariş Tutarı</p>
                    <p className="text-2xl font-bold text-purple-700">{formatCurrency(orderData.summary?.totalOrderValue || 0)}</p>
                  </div>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <div className="text-center">
                    <p className="text-xs text-orange-600 font-medium mb-1">Toplam Desi</p>
                    <p className="text-3xl font-bold text-orange-700">{formatNumber(orderData.summary?.totalDesi || 0)}</p>
                  </div>
                </Card>
              </div>

              {/* Supplier & Brand Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="bg-blue-50 border-b border-blue-100">
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <Truck className="w-5 h-5" />
                      Tedarikçi Bazlı Sipariş
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr className="text-xs text-gray-500">
                          <th className="px-3 py-2 text-left">Tedarikçi</th>
                          <th className="px-3 py-2 text-center">Ürün</th>
                          <th className="px-3 py-2 text-center">Adet</th>
                          <th className="px-3 py-2 text-center">Desi</th>
                          <th className="px-3 py-2 text-right">Tutar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {orderData.supplierSummary?.slice(0, 15).map((s, i) => (
                          <tr key={i} className="hover:bg-blue-50/50">
                            <td className="px-3 py-2 font-medium">{truncate(s.name, 25)}</td>
                            <td className="px-3 py-2 text-center">{s.items}</td>
                            <td className="px-3 py-2 text-center">{s.qty}</td>
                            <td className="px-3 py-2 text-center text-gray-500">{s.desi?.toFixed(1)}</td>
                            <td className="px-3 py-2 text-right font-mono text-blue-600">{formatCurrency(s.value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-purple-50 border-b border-purple-100">
                    <CardTitle className="flex items-center gap-2 text-purple-700">
                      <Layers className="w-5 h-5" />
                      Marka Bazlı Sipariş
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr className="text-xs text-gray-500">
                          <th className="px-3 py-2 text-left">Marka</th>
                          <th className="px-3 py-2 text-center">Ürün</th>
                          <th className="px-3 py-2 text-center">Adet</th>
                          <th className="px-3 py-2 text-right">Tutar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {orderData.brandSummary?.slice(0, 15).map((b, i) => (
                          <tr key={i} className="hover:bg-purple-50/50">
                            <td className="px-3 py-2 font-medium">{truncate(b.name, 25)}</td>
                            <td className="px-3 py-2 text-center">{b.items}</td>
                            <td className="px-3 py-2 text-center">{b.qty}</td>
                            <td className="px-3 py-2 text-right font-mono text-purple-600">{formatCurrency(b.value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>

              {/* Main Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Sipariş Önerisi Tablosu
                      <Badge variant="primary">{orderData.recommendations?.length || 0}</Badge>
                    </CardTitle>
                    <button
                      onClick={() => {
                        const items = orderData.recommendations || []
                        if (items.length === 0) return
                        const headers = ['Stok Kodu', 'Ürün Adı', 'Marka', 'Tedarikçi', 'Mevcut Stok', 'Son 15 Gün', 'Son 30 Gün', '15G Hedef', 'Sipariş Adet', 'Desi', 'Alış Fiyatı', 'Sipariş Tutarı', 'Akakçe Fiyatı', 'Akakçe-Alış Fark', 'Not']
                        const rows = items.map(item => [
                          item.code,
                          `"${item.name}"`,
                          item.brand || '',
                          `"${item.supplierName || ''}"`,
                          item.currentStock,
                          item.sales15,
                          item.sales30,
                          item.targetStock15,
                          item.orderQty,
                          item.desi,
                          item.buyingPrice,
                          item.orderValue,
                          item.akakcePrice,
                          item.akakceDiff,
                          `"${item.note}"`
                        ])
                        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
                        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                        const link = document.createElement('a')
                        link.href = URL.createObjectURL(blob)
                        link.download = `siparis_onerisi_15gun_${new Date().toISOString().split('T')[0]}.csv`
                        link.click()
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Download className="w-4 h-4" />
                      CSV İndir
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto max-h-[600px]">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr className="text-xs text-gray-500 uppercase">
                          <th className="px-2 py-2 text-left">Stok Kodu</th>
                          <th className="px-2 py-2 text-left">Ürün Adı</th>
                          <th className="px-2 py-2 text-center">Mevcut</th>
                          <th className="px-2 py-2 text-center">15G Satış</th>
                          <th className="px-2 py-2 text-center">30G Satış</th>
                          <th className="px-2 py-2 text-center bg-yellow-50">15G Hedef</th>
                          <th className="px-2 py-2 text-center bg-green-50">Sipariş</th>
                          <th className="px-2 py-2 text-center">Desi</th>
                          <th className="px-2 py-2 text-right">Alış</th>
                          <th className="px-2 py-2 text-right bg-green-50">Tutar</th>
                          <th className="px-2 py-2 text-right">Akakçe</th>
                          <th className="px-2 py-2 text-right">Fark</th>
                          <th className="px-2 py-2 text-center">Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {orderData.recommendations?.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-2 py-2 font-mono text-xs text-gray-600">{item.code}</td>
                            <td className="px-2 py-2">
                              <p className="font-medium truncate max-w-[200px]" title={item.name}>{item.name}</p>
                              <p className="text-xs text-gray-500">{item.brand} • {truncate(item.supplierName, 15)}</p>
                            </td>
                            <td className="px-2 py-2 text-center">
                              <Badge variant={item.currentStock === 0 ? 'danger' : item.currentStock < 5 ? 'warning' : 'secondary'} size="xs">
                                {item.currentStock}
                              </Badge>
                            </td>
                            <td className="px-2 py-2 text-center font-medium text-blue-600">{item.sales15}</td>
                            <td className="px-2 py-2 text-center text-gray-600">{item.sales30}</td>
                            <td className="px-2 py-2 text-center bg-yellow-50 font-semibold">{item.targetStock15}</td>
                            <td className="px-2 py-2 text-center bg-green-50">
                              <span className="font-bold text-green-700">{item.orderQty}</span>
                            </td>
                            <td className="px-2 py-2 text-center text-gray-500 text-xs">{item.desi?.toFixed(2)}</td>
                            <td className="px-2 py-2 text-right font-mono text-xs">{formatCurrency(item.buyingPrice)}</td>
                            <td className="px-2 py-2 text-right bg-green-50 font-mono font-semibold text-green-700">{formatCurrency(item.orderValue)}</td>
                            <td className="px-2 py-2 text-right font-mono text-xs text-orange-600">{item.akakcePrice > 0 ? formatCurrency(item.akakcePrice) : '-'}</td>
                            <td className="px-2 py-2 text-right">
                              {item.akakceDiff !== 0 && (
                                <span className={clsx(
                                  'text-xs font-mono',
                                  item.akakceDiff > 0 ? 'text-green-600' : 'text-red-600'
                                )}>
                                  {item.akakceDiff > 0 ? '+' : ''}{formatCurrency(item.akakceDiff)}
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-2 text-center">
                              {item.petzzshopUrl && (
                                <a href={item.petzzshopUrl} target="_blank" rel="noopener noreferrer"
                                  className="w-6 h-6 inline-flex items-center justify-center rounded bg-primary-50 text-primary-600 hover:bg-primary-100">
                                  <Store className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Footer */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-gray-500">Toplam Sipariş Adet</p>
                        <p className="text-xl font-bold text-gray-900">{formatNumber(orderData.summary?.totalOrderQty || 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Toplam Sipariş Tutarı</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(orderData.summary?.totalOrderValue || 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Toplam Desi</p>
                        <p className="text-xl font-bold text-orange-600">{formatNumber(orderData.summary?.totalDesi || 0)}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      <p>Kurallar: 90 günde satış &gt; 0 • 15 günde satış &gt; 0</p>
                      <p>Hedef = max(15G satış, 30G satış / 2)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      )}

      {/* Tab Content - Strategy */}
      {activeTab === 'strategy' && (
        <div className="space-y-6">
          {/* Strategy Header */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-600 rounded-xl">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Haftalık Satın Alma Stratejisi</h2>
                    <p className="text-sm text-gray-600">90 günlük satış ortalamasına göre haftalık stok ihtiyacı</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <select
                    value={strategyTemplate}
                    onChange={(e) => setStrategyTemplate(e.target.value)}
                    className="text-sm border rounded-lg px-3 py-2 bg-white font-medium"
                  >
                    <option value="weekly_90day">📅 Haftalık (90 Gün Ort.)</option>
                    <option value="biweekly_60day">📆 2 Haftalık (60 Gün Ort.)</option>
                    <option value="monthly_90day">🗓️ Aylık (90 Gün Ort.)</option>
                  </select>
                  <select
                    value={strategyBrand}
                    onChange={(e) => setStrategyBrand(e.target.value)}
                    className="text-sm border rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="">Tüm Markalar</option>
                    {brands.slice(0, 100).map(b => (
                      <option key={b.value} value={b.value}>{truncate(b.label, 20)}</option>
                    ))}
                  </select>
                  <select
                    value={strategyCategory}
                    onChange={(e) => setStrategyCategory(e.target.value)}
                    className="text-sm border rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="">Tüm Kategoriler</option>
                    {categories.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <select
                    value={strategySupplier}
                    onChange={(e) => setStrategySupplier(e.target.value)}
                    className="text-sm border rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="">Tüm Tedarikçiler</option>
                    {suppliers.slice(0, 50).map(s => (
                      <option key={s.value} value={s.value}>{truncate(s.label, 22)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {strategyLoading ? (
            <LoadingState message="Strateji hesaplanıyor..." />
          ) : strategyData ? (
            <>
              {/* Strategy Summary KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <Card className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                  <div className="text-center">
                    <p className="text-xs text-indigo-600 font-medium">Toplam Ürün</p>
                    <p className="text-2xl font-bold text-indigo-700">{strategyData.summary?.totalProducts || 0}</p>
                  </div>
                </Card>
                <Card className="p-3 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <div className="text-center">
                    <p className="text-xs text-green-600 font-medium">Sipariş Adet</p>
                    <p className="text-2xl font-bold text-green-700">{formatNumber(strategyData.summary?.totalOrderUnits || 0)}</p>
                  </div>
                </Card>
                <Card className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <div className="text-center">
                    <p className="text-xs text-purple-600 font-medium">Toplam Maliyet</p>
                    <p className="text-xl font-bold text-purple-700">{formatCurrency(strategyData.summary?.totalOrderCost || 0)}</p>
                  </div>
                </Card>
                <Card className="p-3 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                  <div className="text-center">
                    <p className="text-xs text-red-600 font-medium">Kritik</p>
                    <p className="text-2xl font-bold text-red-700">{strategyData.summary?.priorityBreakdown?.critical || 0}</p>
                  </div>
                </Card>
                <Card className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <div className="text-center">
                    <p className="text-xs text-orange-600 font-medium">Yüksek Öncelik</p>
                    <p className="text-2xl font-bold text-orange-700">{strategyData.summary?.priorityBreakdown?.high || 0}</p>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-medium">Ort. Sipariş</p>
                    <p className="text-xl font-bold text-gray-700">{formatCurrency(strategyData.summary?.avgOrderValue || 0)}</p>
                  </div>
                </Card>
              </div>

              {/* Supplier Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="bg-blue-50 border-b border-blue-100">
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <Truck className="w-5 h-5" />
                      Tedarikçi Bazlı Sipariş Özeti
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 max-h-80 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr className="text-xs text-gray-500">
                          <th className="px-3 py-2 text-left">Tedarikçi</th>
                          <th className="px-3 py-2 text-center">Ürün</th>
                          <th className="px-3 py-2 text-center">Adet</th>
                          <th className="px-3 py-2 text-right">Maliyet</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {strategyData.supplierSummary?.slice(0, 20).map((s, i) => (
                          <tr key={i} className="hover:bg-blue-50/50">
                            <td className="px-3 py-2 font-medium">{truncate(s.name, 25)}</td>
                            <td className="px-3 py-2 text-center">{s.items}</td>
                            <td className="px-3 py-2 text-center">{s.units}</td>
                            <td className="px-3 py-2 text-right font-mono text-blue-600">{formatCurrency(s.cost)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-purple-50 border-b border-purple-100">
                    <CardTitle className="flex items-center gap-2 text-purple-700">
                      <Layers className="w-5 h-5" />
                      Marka Bazlı Sipariş Özeti
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 max-h-80 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr className="text-xs text-gray-500">
                          <th className="px-3 py-2 text-left">Marka</th>
                          <th className="px-3 py-2 text-center">Ürün</th>
                          <th className="px-3 py-2 text-center">Adet</th>
                          <th className="px-3 py-2 text-right">Maliyet</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {strategyData.brandSummary?.slice(0, 20).map((b, i) => (
                          <tr key={i} className="hover:bg-purple-50/50">
                            <td className="px-3 py-2 font-medium">{truncate(b.name, 25)}</td>
                            <td className="px-3 py-2 text-center">{b.items}</td>
                            <td className="px-3 py-2 text-center">{b.units}</td>
                            <td className="px-3 py-2 text-right font-mono text-purple-600">{formatCurrency(b.cost)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>

              {/* Urgent Orders */}
              {strategyData.urgentOrders?.length > 0 && (
                <Card className="border-red-200">
                  <CardHeader className="bg-red-50 border-b border-red-100">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="w-5 h-5" />
                        Acil Siparişler (Kritik + Yüksek Öncelik)
                        <Badge variant="danger">{strategyData.urgentOrders.length}</Badge>
                      </CardTitle>
                      <button
                        onClick={() => {
                          const urgent = {}
                          strategyData.urgentOrders.forEach(item => {
                            urgent[item.productId] = { product: item, quantity: item.orderQty }
                          })
                          setOrderCart(urgent)
                          setShowCart(true)
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Tümünü Sepete Ekle
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr className="text-xs text-gray-500 uppercase">
                            <th className="px-2 py-2 text-left">Öncelik</th>
                            <th className="px-2 py-2 text-left">Ürün</th>
                            <th className="px-2 py-2 text-left">Marka</th>
                            <th className="px-2 py-2 text-center">Stok</th>
                            <th className="px-2 py-2 text-center">Hedef</th>
                            <th className="px-2 py-2 text-center">Sipariş</th>
                            <th className="px-2 py-2 text-center">Haftalık Satış</th>
                            <th className="px-2 py-2 text-center">Stok Gün</th>
                            <th className="px-2 py-2 text-right">Maliyet</th>
                            <th className="px-2 py-2 text-center">Ekle</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {strategyData.urgentOrders.map((item) => (
                            <tr key={item.productId} className={clsx(
                              'hover:bg-gray-50',
                              item.priority === 'critical' && 'bg-red-50/50',
                              item.priority === 'high' && 'bg-orange-50/30'
                            )}>
                              <td className="px-2 py-2">
                                <Badge
                                  variant={item.priority === 'critical' ? 'danger' : 'warning'}
                                  size="xs"
                                >
                                  {item.priority === 'critical' ? 'KRİTİK' : 'YÜKSEK'}
                                </Badge>
                              </td>
                              <td className="px-2 py-2">
                                <p className="font-medium truncate max-w-[180px]" title={item.name}>{item.name}</p>
                                <p className="text-xs text-gray-500">{item.code}</p>
                              </td>
                              <td className="px-2 py-2 text-gray-600 text-xs">{item.brand}</td>
                              <td className="px-2 py-2 text-center">
                                <Badge variant={item.currentStock === 0 ? 'danger' : 'warning'} size="xs">
                                  {item.currentStock}
                                </Badge>
                              </td>
                              <td className="px-2 py-2 text-center text-gray-600">{item.targetStock}</td>
                              <td className="px-2 py-2 text-center">
                                <span className="font-bold text-green-600">{item.orderQty}</span>
                              </td>
                              <td className="px-2 py-2 text-center text-blue-600 text-xs">{item.weeklySalesRate}/hafta</td>
                              <td className="px-2 py-2 text-center">
                                <DaysOfCoverBadge days={item.daysOfStock} />
                              </td>
                              <td className="px-2 py-2 text-right font-mono text-gray-600">{formatCurrency(item.orderCost)}</td>
                              <td className="px-2 py-2 text-center">
                                <button
                                  onClick={() => addToCart({ ...item, productId: item.productId, buyingPrice: item.buyingPrice }, item.orderQty)}
                                  className="p-1 text-green-600 hover:bg-green-100 rounded"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Full Recommendations */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Tüm Sipariş Önerileri
                      <Badge variant="primary">{strategyData.recommendations?.length || 0}</Badge>
                    </CardTitle>
                    <button
                      onClick={exportToCSV}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      <Download className="w-4 h-4" />
                      CSV İndir
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto max-h-[500px]">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr className="text-xs text-gray-500 uppercase">
                          <th className="px-2 py-2 text-left">Öncelik</th>
                          <th className="px-2 py-2 text-left">Ürün</th>
                          <th className="px-2 py-2 text-left">Tedarikçi</th>
                          <th className="px-2 py-2 text-center">Stok</th>
                          <th className="px-2 py-2 text-center">Hedef</th>
                          <th className="px-2 py-2 text-center">Sipariş</th>
                          <th className="px-2 py-2 text-center">Günlük Satış</th>
                          <th className="px-2 py-2 text-center">Marj</th>
                          <th className="px-2 py-2 text-right">Maliyet</th>
                          <th className="px-2 py-2 text-center">Ekle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {strategyData.recommendations?.map((item) => (
                          <tr key={item.productId} className={clsx(
                            'hover:bg-gray-50',
                            item.priority === 'critical' && 'bg-red-50/30',
                            item.priority === 'high' && 'bg-orange-50/20',
                            orderCart[item.productId] && 'bg-green-50/50 ring-1 ring-inset ring-green-200'
                          )}>
                            <td className="px-2 py-2">
                              <Badge
                                variant={
                                  item.priority === 'critical' ? 'danger' :
                                  item.priority === 'high' ? 'warning' :
                                  item.priority === 'medium' ? 'info' : 'secondary'
                                }
                                size="xs"
                              >
                                {item.priorityScore}
                              </Badge>
                            </td>
                            <td className="px-2 py-2">
                              <p className="font-medium truncate max-w-[160px]" title={item.name}>{item.name}</p>
                              <p className="text-xs text-gray-500">{item.code} • {item.brand}</p>
                            </td>
                            <td className="px-2 py-2 text-gray-600 text-xs">{truncate(item.supplierName, 16)}</td>
                            <td className="px-2 py-2 text-center">
                              <Badge variant={item.currentStock === 0 ? 'danger' : item.currentStock < 5 ? 'warning' : 'info'} size="xs">
                                {item.currentStock}
                              </Badge>
                            </td>
                            <td className="px-2 py-2 text-center text-gray-500">{item.targetStock}</td>
                            <td className="px-2 py-2 text-center font-bold text-green-600">{item.orderQty}</td>
                            <td className="px-2 py-2 text-center text-blue-600 text-xs">{item.dailySalesRate}/gün</td>
                            <td className="px-2 py-2 text-center">
                              <span className={clsx(
                                'text-xs',
                                item.marginPct >= 25 ? 'text-green-600' :
                                item.marginPct >= 15 ? 'text-yellow-600' : 'text-red-600'
                              )}>
                                %{item.marginPct}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-right font-mono text-xs">{formatCurrency(item.orderCost)}</td>
                            <td className="px-2 py-2 text-center">
                              <button
                                onClick={() => addToCart({ ...item, productId: item.productId, buyingPrice: item.buyingPrice }, item.orderQty)}
                                className="p-1 text-green-600 hover:bg-green-100 rounded"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      )}

      {/* Tab Content - Decision Engine */}
      {activeTab === 'decision-engine' && (
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary-600" />
                Karar Motoru Sonuçları
                <Badge variant="primary">{engineData?.items?.length || 0}</Badge>
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value)}
                  className="text-sm border rounded-lg px-2 py-1.5 bg-orange-50 border-orange-200"
                >
                  <option value="all">Tüm Stoklar</option>
                  <option value="zero">Stok Yok (0)</option>
                  <option value="critical">Kritik (&lt;5)</option>
                  <option value="low">Düşük (&lt;20)</option>
                </select>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="text-sm border rounded-lg px-2 py-1.5"
                >
                  <option value="">Tüm Aksiyonlar</option>
                  <option value="ORDER">SİPARİŞ VER</option>
                  <option value="WATCH">İZLE</option>
                  <option value="FIX_PRICE">FİYAT DÜZELT</option>
                  <option value="STOP">DURDUR</option>
                </select>
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="text-sm border rounded-lg px-2 py-1.5"
                >
                  <option value="">Tüm Markalar ({brands.length})</option>
                  {brands.slice(0, 100).map(b => (
                    <option key={b.value} value={b.value}>
                      {truncate(b.label, 20)} ({b.outOfStock}/{b.count})
                    </option>
                  ))}
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-sm border rounded-lg px-2 py-1.5"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map(c => (
                    <option key={c.value} value={c.value}>
                      {c.label} ({c.outOfStock}/{c.count})
                    </option>
                  ))}
                </select>
                <select
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                  className="text-sm border rounded-lg px-2 py-1.5"
                >
                  <option value="">Tüm Tedarikçiler</option>
                  {suppliers.slice(0, 50).map(s => (
                    <option key={s.value} value={s.value}>
                      {truncate(s.label, 22)} ({s.outOfStock})
                    </option>
                  ))}
                </select>
                <select
                  value={minScoreFilter}
                  onChange={(e) => setMinScoreFilter(parseInt(e.target.value))}
                  className="text-sm border rounded-lg px-2 py-1.5"
                >
                  <option value="0">Tüm Skorlar</option>
                  <option value="70">Yüksek (70+)</option>
                  <option value="45">Orta+ (45+)</option>
                  <option value="25">Düşük+ (25+)</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="text-xs text-gray-500 uppercase">
                    <th className="px-2 py-3 text-left">Aksiyon</th>
                    <th className="px-2 py-3 text-left">Öncelik</th>
                    <th className="px-2 py-3 text-left">Ürün</th>
                    <th className="px-2 py-3 text-left">Tedarikçi</th>
                    <th className="px-2 py-3 text-center">Stok</th>
                    <th className="px-2 py-3 text-center">Stok Gün</th>
                    <th className="px-2 py-3 text-center">ROP</th>
                    <th className="px-2 py-3 text-right">Alış</th>
                    <th className="px-2 py-3 text-center">Marj</th>
                    <th className="px-2 py-3 text-center">Akakce Fark</th>
                    <th className="px-2 py-3 text-center">Öneri</th>
                    <th className="px-2 py-3 text-center">Sipariş</th>
                    <th className="px-2 py-3 text-center">Nedenler</th>
                    <th className="px-2 py-3 text-center">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {engineData?.items?.map((item) => {
                    const currentQty = orderCart[item.productId]?.quantity || 0

                    return (
                      <tr key={item.productId} className={clsx(
                        'hover:bg-gray-50 transition-colors',
                        item.action === 'ORDER' && 'bg-green-50/30',
                        item.action === 'FIX_PRICE' && 'bg-yellow-50/30',
                        item.action === 'STOP' && 'bg-red-50/20',
                        currentQty > 0 && 'bg-green-50/50 ring-1 ring-inset ring-green-200'
                      )}>
                        <td className="px-2 py-2">
                          <ActionBadge action={item.action} />
                        </td>
                        <td className="px-2 py-2">
                          <PriorityBadge label={item.priorityLabel} score={item.priorityScore} />
                        </td>
                        <td className="px-2 py-2">
                          <div>
                            <p className="font-medium text-gray-900 truncate max-w-[160px]" title={item.name}>{item.name}</p>
                            <p className="text-xs text-gray-500">{item.code} • {item.brand}</p>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-gray-600 text-xs">
                          {truncate(item.supplierName, 16) || '-'}
                        </td>
                        <td className="px-2 py-2 text-center">
                          {item.currentStock === 0 ? (
                            <Badge variant="danger" size="xs">Yok</Badge>
                          ) : (
                            <Badge variant={item.currentStock < 5 ? 'warning' : 'info'} size="xs">
                              {item.currentStock}
                            </Badge>
                          )}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <DaysOfCoverBadge days={item.derived?.daysOfCover} rop={item.derived?.rop} />
                        </td>
                        <td className="px-2 py-2 text-center text-xs text-gray-600">
                          {item.derived?.rop || '-'}
                        </td>
                        <td className="px-2 py-2 text-right font-mono text-gray-600 text-xs">
                          {formatCurrency(item.buyingPrice)}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <span className={clsx(
                            'font-mono text-xs',
                            item.marginPct >= 25 ? 'text-green-600' :
                            item.marginPct >= 15 ? 'text-yellow-600' :
                            item.marginPct >= 0 ? 'text-orange-600' : 'text-red-600 font-bold'
                          )}>
                            %{item.marginPct || '-'}
                          </span>
                        </td>
                        <td className="px-2 py-2 text-center">
                          <PriceGapIndicator gap={item.derived?.priceGapPct} />
                        </td>
                        <td className="px-2 py-2 text-center">
                          {item.action === 'ORDER' && item.suggestedOrderQty > 0 ? (
                            <button
                              onClick={() => addToCart(item, item.suggestedOrderQty)}
                              className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium"
                            >
                              +{item.suggestedOrderQty}
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {item.action === 'ORDER' ? (
                            <QuantityInput
                              value={currentQty}
                              onChange={(qty) => addToCart(item, qty)}
                            />
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-center">
                          <ReasonsTooltip reasons={item.reasons} />
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center justify-center gap-1">
                            {item.petzzshopUrl && (
                              <a href={item.petzzshopUrl} target="_blank" rel="noopener noreferrer"
                                className="w-6 h-6 flex items-center justify-center rounded bg-primary-50 text-primary-600 hover:bg-primary-100">
                                <Store className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {item.akakceUrl && (
                              <a href={item.akakceUrl} target="_blank" rel="noopener noreferrer"
                                className="w-6 h-6 flex items-center justify-center rounded bg-orange-50 text-orange-600 hover:bg-orange-100">
                                <ShoppingBag className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab Content - Suppliers */}
      {activeTab === 'suppliers' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Tedarikçi Performans Analizi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-xs text-gray-500 uppercase">
                    <th className="px-4 py-3 text-left">Tedarikçi</th>
                    <th className="px-4 py-3 text-center">Toplam</th>
                    <th className="px-4 py-3 text-center">Stokta</th>
                    <th className="px-4 py-3 text-center">Stok Yok</th>
                    <th className="px-4 py-3 text-center">Bulunurluk</th>
                    <th className="px-4 py-3 text-right">Envanter</th>
                    <th className="px-4 py-3 text-center">Marj</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {supplierPerf?.slice(0, 30).map((s, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{truncate(s.supplier_name, 35)}</td>
                      <td className="px-4 py-3 text-center">{s.total_products}</td>
                      <td className="px-4 py-3 text-center text-green-600">{s.in_stock_products}</td>
                      <td className="px-4 py-3 text-center">
                        {s.out_of_stock_products > 0 ? (
                          <Badge variant="danger">{s.out_of_stock_products}</Badge>
                        ) : '0'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={clsx(
                          'font-medium',
                          s.availability_rate >= 80 ? 'text-green-600' :
                          s.availability_rate >= 50 ? 'text-yellow-600' : 'text-red-600'
                        )}>%{s.availability_rate}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{formatCurrency(s.inventory_value)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={clsx('font-mono', s.avg_margin >= 20 ? 'text-green-600' : s.avg_margin >= 0 ? 'text-yellow-600' : 'text-red-600')}>
                          %{s.avg_margin?.toFixed(0) || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab Content - Categories */}
      {activeTab === 'categories' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Kategori Bazlı Stok Analizi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-xs text-gray-500 uppercase">
                    <th className="px-4 py-3 text-left">Kategori</th>
                    <th className="px-4 py-3 text-center">Ürün</th>
                    <th className="px-4 py-3 text-center">Adet</th>
                    <th className="px-4 py-3 text-center">Stok Yok %</th>
                    <th className="px-4 py-3 text-right">Envanter</th>
                    <th className="px-4 py-3 text-center">Marj</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {categoryTurnover?.map((c, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{c.main_category}</td>
                      <td className="px-4 py-3 text-center">{c.product_count}</td>
                      <td className="px-4 py-3 text-center">{formatNumber(c.total_units)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={clsx(
                          'font-medium',
                          c.out_of_stock_rate <= 20 ? 'text-green-600' :
                          c.out_of_stock_rate <= 50 ? 'text-yellow-600' : 'text-red-600'
                        )}>%{c.out_of_stock_rate}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{formatCurrency(c.inventory_value)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={clsx('font-mono', c.avg_margin >= 20 ? 'text-green-600' : c.avg_margin >= 0 ? 'text-yellow-600' : 'text-red-600')}>
                          %{c.avg_margin?.toFixed(0) || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab Content - Velocity */}
      {activeTab === 'velocity' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="bg-green-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <TrendingUp className="w-5 h-5" />
                Hızlı Satanlar (Öncelikli)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="text-xs text-gray-500">
                    <th className="px-3 py-2 text-left">Ürün</th>
                    <th className="px-3 py-2 text-center">Stok</th>
                    <th className="px-3 py-2 text-center">Hız</th>
                    <th className="px-3 py-2 text-center">Gün</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {fastMovers?.map((p, i) => (
                    <tr key={i} className="hover:bg-green-50/50">
                      <td className="px-3 py-2">
                        <p className="font-medium truncate max-w-[180px]">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.brand}</p>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Badge variant={p.total_quantity < 5 ? 'danger' : 'info'} size="xs">{p.total_quantity}</Badge>
                      </td>
                      <td className="px-3 py-2 text-center text-green-600 text-xs font-medium">
                        {p.daily_sales_rate?.toFixed(1)}/gün
                      </td>
                      <td className="px-3 py-2 text-center">
                        <DaysOfCoverBadge days={p.days_of_stock} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-yellow-50 border-b border-yellow-100">
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <TrendingDown className="w-5 h-5" />
                Yavaş Satanlar (İndirim Adayı)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="text-xs text-gray-500">
                    <th className="px-3 py-2 text-left">Ürün</th>
                    <th className="px-3 py-2 text-center">Stok</th>
                    <th className="px-3 py-2 text-right">Değer</th>
                    <th className="px-3 py-2 text-center">Gün</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {slowMovers?.map((p, i) => (
                    <tr key={i} className="hover:bg-yellow-50/50">
                      <td className="px-3 py-2">
                        <p className="font-medium truncate max-w-[180px]">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.brand}</p>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Badge variant="secondary" size="xs">{p.total_quantity}</Badge>
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs">{formatCurrency(p.stock_value)}</td>
                      <td className="px-3 py-2 text-center text-yellow-600 text-xs">
                        {p.days_of_stock > 365 ? '365+' : p.days_of_stock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
