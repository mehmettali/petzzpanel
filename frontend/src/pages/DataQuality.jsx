import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle, Image, FileText, Tag, DollarSign, Percent, ExternalLink,
  Store, ShoppingBag, Download, TrendingDown, Building, Layers, Package,
  AlertCircle, CheckCircle, XCircle, BarChart3
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  getQualitySummary,
  getPriceAnomalies,
  getMissingImages,
  getMissingDescriptions,
  getWrongCategories,
  getZeroMargin
} from '../services/api'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { LoadingState } from '../components/ui/Spinner'
import { formatCurrency, formatNumber, truncate } from '../utils/formatters'
import clsx from 'clsx'

const tabs = [
  { id: 'price-anomalies', name: 'Fiyat Anomalileri', icon: DollarSign, color: 'red' },
  { id: 'zero-margin', name: 'Negatif Marj', icon: TrendingDown, color: 'purple' },
  { id: 'missing-images', name: 'Eksik Gorseller', icon: Image, color: 'yellow' },
  { id: 'missing-descriptions', name: 'Eksik Aciklamalar', icon: FileText, color: 'orange' },
  { id: 'wrong-categories', name: 'Yanlis Kategoriler', icon: Tag, color: 'blue' },
]

export default function DataQuality() {
  const [activeTab, setActiveTab] = useState('price-anomalies')
  const [sortBy, setSortBy] = useState('loss')
  const [sortOrder, setSortOrder] = useState('desc')

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['qualitySummary'],
    queryFn: getQualitySummary,
  })

  const { data: priceAnomalies } = useQuery({
    queryKey: ['priceAnomalies'],
    queryFn: getPriceAnomalies,
    enabled: activeTab === 'price-anomalies',
  })

  const { data: missingImages } = useQuery({
    queryKey: ['missingImages'],
    queryFn: getMissingImages,
    enabled: activeTab === 'missing-images',
  })

  const { data: missingDescriptions } = useQuery({
    queryKey: ['missingDescriptions'],
    queryFn: getMissingDescriptions,
    enabled: activeTab === 'missing-descriptions',
  })

  const { data: wrongCategories } = useQuery({
    queryKey: ['wrongCategories'],
    queryFn: getWrongCategories,
    enabled: activeTab === 'wrong-categories',
  })

  const { data: zeroMargin } = useQuery({
    queryKey: ['zeroMargin'],
    queryFn: getZeroMargin,
    enabled: activeTab === 'zero-margin',
  })

  if (summaryLoading) return <LoadingState message="Veri kalitesi analizi yukleniyor..." />

  const getActiveData = () => {
    let data = []
    switch (activeTab) {
      case 'price-anomalies': data = priceAnomalies || []; break
      case 'missing-images': data = missingImages || []; break
      case 'missing-descriptions': data = missingDescriptions || []; break
      case 'wrong-categories': data = wrongCategories || []; break
      case 'zero-margin': data = zeroMargin || []; break
      default: data = []
    }

    // Sorting
    if (activeTab === 'price-anomalies' || activeTab === 'zero-margin') {
      return [...data].sort((a, b) => {
        let aVal, bVal
        if (sortBy === 'loss') {
          aVal = a.loss_amount || (a.buying_price - a.selling_price)
          bVal = b.loss_amount || (b.buying_price - b.selling_price)
        } else if (sortBy === 'buying') {
          aVal = a.buying_price
          bVal = b.buying_price
        } else if (sortBy === 'selling') {
          aVal = a.selling_price
          bVal = b.selling_price
        } else {
          aVal = a.name || ''
          bVal = b.name || ''
        }
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
      })
    }
    return data
  }

  const exportToCSV = () => {
    const data = getActiveData()
    if (data.length === 0) return

    let headers, rows
    if (activeTab === 'price-anomalies' || activeTab === 'zero-margin') {
      headers = ['Kod', 'Urun Adi', 'Marka', 'Kategori', 'Tedarikci', 'Alis', 'Satis', 'Zarar', 'Marj %']
      rows = data.map(item => [
        item.code,
        `"${item.name || ''}"`,
        item.brand || '',
        item.main_category || '',
        `"${item.supplier_name || ''}"`,
        item.buying_price,
        item.selling_price,
        (item.buying_price - item.selling_price).toFixed(2),
        item.selling_price > 0 ? ((item.selling_price - item.buying_price) / item.selling_price * 100).toFixed(1) : 0
      ])
    } else {
      headers = ['Kod', 'Urun Adi', 'Marka', 'Kategori']
      rows = data.map(item => [
        item.code,
        `"${item.name || item.product_name || ''}"`,
        item.brand || '',
        item.main_category || ''
      ])
    }

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `veri_kalitesi_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const qualityScore = summary ? Math.round(
    100 - (
      (summary.priceAnomalies / summary.totalProducts * 50) +
      (summary.missingImages / summary.totalProducts * 20) +
      (summary.missingDescriptions / summary.totalProducts * 15) +
      (summary.activeOutOfStock / summary.totalProducts * 15)
    )
  ) : 0

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBg = (score) => {
    if (score >= 80) return 'from-green-50 to-green-100 border-green-200'
    if (score >= 60) return 'from-yellow-50 to-yellow-100 border-yellow-200'
    if (score >= 40) return 'from-orange-50 to-orange-100 border-orange-200'
    return 'from-red-50 to-red-100 border-red-200'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Veri Kalitesi Analizi</h1>
          <p className="text-gray-500">Urun verilerinizi analiz edin, sorunlari tespit edin ve duzeltme aksiyonlari alin</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download className="w-4 h-4" />
          CSV Indir
        </button>
      </div>

      {/* Quality Score + Critical Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Quality Score Card */}
        <Card className={clsx("p-6 bg-gradient-to-br", getScoreBg(qualityScore))}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BarChart3 className={clsx("w-6 h-6", getScoreColor(qualityScore))} />
              <span className="text-sm font-medium text-gray-600">Veri Kalite Skoru</span>
            </div>
            <p className={clsx("text-5xl font-bold", getScoreColor(qualityScore))}>{qualityScore}</p>
            <p className="text-sm text-gray-500 mt-1">/ 100</p>
          </div>
        </Card>

        {/* Critical: Price Anomalies */}
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-red-600 font-medium uppercase">Fiyat Anomalisi</p>
              <p className="text-3xl font-bold text-red-700 mt-1">{formatNumber(summary?.priceAnomalies || 0)}</p>
              <p className="text-xs text-red-600 mt-1">urun zarar ediyor</p>
            </div>
            <div className="p-2 bg-red-500 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-red-200">
            <p className="text-sm text-red-700">
              Toplam Zarar: <span className="font-bold">{formatCurrency(summary?.totalLoss || 0)}</span>
            </p>
            <p className="text-xs text-red-600">
              Ort. urun basi: {formatCurrency(summary?.avgLoss || 0)}
            </p>
          </div>
        </Card>

        {/* Active Out of Stock */}
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-orange-600 font-medium uppercase">Aktif & Stoksuz</p>
              <p className="text-3xl font-bold text-orange-700 mt-1">{formatNumber(summary?.activeOutOfStock || 0)}</p>
              <p className="text-xs text-orange-600 mt-1">satis kaybediliyor</p>
            </div>
            <div className="p-2 bg-orange-500 rounded-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>

        {/* Missing Akakce */}
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-purple-600 font-medium uppercase">Akakce Eksik</p>
              <p className="text-3xl font-bold text-purple-700 mt-1">{formatNumber(summary?.missingAkakce || 0)}</p>
              <p className="text-xs text-purple-600 mt-1">rekabet takipsiz</p>
            </div>
            <div className="p-2 bg-purple-500 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Supplier & Brand Breakdown */}
      {(summary?.supplierBreakdown?.length > 0 || summary?.brandBreakdown?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Supplier Breakdown */}
          <Card>
            <CardHeader className="bg-red-50 border-b border-red-100">
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Building className="w-5 h-5" />
                Tedarikci Bazli Fiyat Anomalisi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-xs text-gray-500">
                    <th className="px-4 py-2 text-left">Tedarikci</th>
                    <th className="px-4 py-2 text-center">Urun</th>
                    <th className="px-4 py-2 text-right">Toplam Zarar</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {summary?.supplierBreakdown?.map((s, i) => (
                    <tr key={i} className="hover:bg-red-50/50">
                      <td className="px-4 py-2 font-medium">{truncate(s.supplier_name || 'Bilinmiyor', 30)}</td>
                      <td className="px-4 py-2 text-center">
                        <Badge variant="danger" size="xs">{s.count}</Badge>
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-red-600">
                        -{formatCurrency(s.total_loss)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Brand Breakdown */}
          <Card>
            <CardHeader className="bg-purple-50 border-b border-purple-100">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Layers className="w-5 h-5" />
                Marka Bazli Fiyat Anomalisi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-xs text-gray-500">
                    <th className="px-4 py-2 text-left">Marka</th>
                    <th className="px-4 py-2 text-center">Urun</th>
                    <th className="px-4 py-2 text-right">Toplam Zarar</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {summary?.brandBreakdown?.map((b, i) => (
                    <tr key={i} className="hover:bg-purple-50/50">
                      <td className="px-4 py-2 font-medium">{truncate(b.brand || 'Markasiz', 30)}</td>
                      <td className="px-4 py-2 text-center">
                        <Badge variant="secondary" size="xs">{b.count}</Badge>
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-purple-600">
                        -{formatCurrency(b.total_loss)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Fiyat Anomalisi</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(summary?.priceAnomalies || 0)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Image className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Eksik Gorsel</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(summary?.missingImages || 0)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Eksik Aciklama</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(summary?.missingDescriptions || 0)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Percent className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Sifir/Negatif Marj</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(summary?.zeroMargin || 0)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Package className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Toplam Urun</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(summary?.totalProducts || 0)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs & Data Table */}
      <Card className="p-0">
        <div className="border-b">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
                <Badge
                  variant={tab.color === 'red' ? 'danger' : tab.color === 'yellow' ? 'warning' : 'secondary'}
                  size="xs"
                >
                  {tab.id === 'price-anomalies' && summary?.priceAnomalies}
                  {tab.id === 'zero-margin' && summary?.zeroMargin}
                  {tab.id === 'missing-images' && summary?.missingImages}
                  {tab.id === 'missing-descriptions' && summary?.missingDescriptions}
                  {tab.id === 'wrong-categories' && '?'}
                </Badge>
              </button>
            ))}
          </nav>
        </div>

        {/* Sort Controls for price tabs */}
        {(activeTab === 'price-anomalies' || activeTab === 'zero-margin') && (
          <div className="px-4 py-2 bg-gray-50 border-b flex items-center gap-4">
            <span className="text-sm text-gray-600">Siralama:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="loss">Zarar Miktari</option>
              <option value="buying">Alis Fiyati</option>
              <option value="selling">Satis Fiyati</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="desc">Azalan</option>
              <option value="asc">Artan</option>
            </select>
          </div>
        )}

        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Kod</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Urun Adi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Marka</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Kategori</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Linkler</th>
                  {(activeTab === 'price-anomalies' || activeTab === 'zero-margin') && (
                    <>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500 bg-red-50">Alis</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500 bg-green-50">Satis</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500 bg-red-50">Zarar</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Marj %</th>
                    </>
                  )}
                  {activeTab === 'wrong-categories' && (
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Olmasi Gereken</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {getActiveData().slice(0, 200).map((item, index) => {
                  const loss = item.loss_amount || (item.buying_price - item.selling_price)
                  const margin = item.selling_price > 0
                    ? ((item.selling_price - item.buying_price) / item.selling_price * 100)
                    : 0

                  return (
                    <tr key={item.id || index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-600">{item.code}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="font-medium text-gray-900">{truncate(item.name || item.product_name, 35)}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.brand || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.main_category || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {item.petzzshop_url ? (
                            <a href={item.petzzshop_url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-6 h-6 rounded bg-primary-50 text-primary-600 hover:bg-primary-100"
                              title="PetzzShop">
                              <Store className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-50 text-gray-300" title="Vitrin yok">
                              <Store className="w-3.5 h-3.5" />
                            </span>
                          )}
                          {item.akakce_url ? (
                            <a href={item.akakce_url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-6 h-6 rounded bg-orange-50 text-orange-600 hover:bg-orange-100"
                              title="Akakce">
                              <ShoppingBag className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-50 text-gray-300" title="Akakce yok">
                              <ShoppingBag className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <Link to={`/products?search=${encodeURIComponent(item.code)}`}
                            className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                            title="Panelde ac">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                      {(activeTab === 'price-anomalies' || activeTab === 'zero-margin') && (
                        <>
                          <td className="px-4 py-3 text-right text-sm font-mono bg-red-50/50">
                            {formatCurrency(item.buying_price)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-mono bg-green-50/50">
                            {formatCurrency(item.selling_price)}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-mono font-bold text-red-600 bg-red-50/50">
                            -{formatCurrency(loss)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Badge variant={margin < -20 ? 'danger' : margin < 0 ? 'warning' : 'secondary'} size="xs">
                              %{margin.toFixed(1)}
                            </Badge>
                          </td>
                        </>
                      )}
                      {activeTab === 'wrong-categories' && (
                        <td className="px-4 py-3">
                          <Badge variant="warning">{item.expected_category}</Badge>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-600">
            Gosterilen: {Math.min(200, getActiveData().length)} / {getActiveData().length} kayit
            {getActiveData().length > 200 && (
              <span className="text-orange-600 ml-2">(Tum listeyi gormek icin CSV indirin)</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
