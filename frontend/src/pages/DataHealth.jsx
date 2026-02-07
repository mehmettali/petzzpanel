import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Activity, AlertTriangle, CheckCircle, XCircle, TrendingDown,
  Package, Store, RefreshCw, Download, ChevronDown, ChevronUp
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import { LoadingState, ErrorState } from '../components/ui/Spinner'
import { formatCurrency } from '../utils/formatters'
import { getDataIntegrity, getSupplierHealth, getStorefrontNegative, syncPrices } from '../services/api'
import clsx from 'clsx'

export default function DataHealth() {
  const queryClient = useQueryClient()
  const [expandedSuppliers, setExpandedSuppliers] = useState(false)
  const [syncResult, setSyncResult] = useState(null)

  const { data: integrity, isLoading: integrityLoading, error: integrityError } = useQuery({
    queryKey: ['dataIntegrity'],
    queryFn: getDataIntegrity,
    staleTime: 5 * 60 * 1000
  })

  const { data: supplierHealth, isLoading: suppliersLoading } = useQuery({
    queryKey: ['supplierHealth'],
    queryFn: getSupplierHealth,
    staleTime: 5 * 60 * 1000
  })

  const { data: storefrontNegative } = useQuery({
    queryKey: ['storefrontNegative'],
    queryFn: getStorefrontNegative,
    staleTime: 5 * 60 * 1000
  })

  const syncMutation = useMutation({
    mutationFn: (dryRun) => syncPrices(dryRun),
    onSuccess: (data) => {
      setSyncResult(data)
      if (!data.dryRun) {
        queryClient.invalidateQueries(['dataIntegrity'])
      }
    }
  })

  if (integrityLoading) return <LoadingState message="Veri sagligi analiz ediliyor..." />
  if (integrityError) return <ErrorState message={integrityError.message} />

  const { storefrontMatching, panelMatching, inconsistencies } = integrity || {}

  const healthScore = Math.round(
    100 - (
      ((inconsistencies?.priceInversion || 0) / (panelMatching?.total || 1) * 30) +
      ((inconsistencies?.activeNoStock || 0) / (panelMatching?.total || 1) * 30) +
      ((inconsistencies?.priceMismatch || 0) / (panelMatching?.total || 1) * 20) +
      ((100 - (storefrontMatching?.matchRate || 100)) * 0.2)
    )
  )

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const criticalSuppliers = supplierHealth?.suppliers?.filter(s => s.healthStatus === 'CRITICAL') || []
  const warningSuppliers = supplierHealth?.suppliers?.filter(s => s.healthStatus === 'WARNING') || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Veri Sagligi</h1>
          <p className="text-gray-500">Veri tutarliligi, tedarikci sagligi ve fiyat senkronizasyonu</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => syncMutation.mutate(true)}
            disabled={syncMutation.isPending}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={clsx('h-4 w-4 mr-2', syncMutation.isPending && 'animate-spin')} />
            Sync Onizle
          </button>
          <button
            onClick={() => syncMutation.mutate(false)}
            disabled={syncMutation.isPending}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            Fiyatlari Senkronize Et
          </button>
        </div>
      </div>

      {/* Health Score */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Genel Veri Sagligi Skoru</p>
              <p className={clsx('text-5xl font-bold', getHealthColor(healthScore))}>
                %{healthScore}
              </p>
            </div>
            <Activity className={clsx('h-16 w-16', getHealthColor(healthScore))} />
          </div>
        </CardContent>
      </Card>

      {/* Sync Result */}
      {syncResult && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">
              {syncResult.dryRun ? 'Sync Onizleme Sonucu' : 'Sync Tamamlandi'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Toplam Uyumsuz</p>
                <p className="text-lg font-semibold">{syncResult.totalMismatches}</p>
              </div>
              <div>
                <p className="text-gray-500">Gecerli (Sync Edilecek)</p>
                <p className="text-lg font-semibold text-green-600">{syncResult.validMismatches}</p>
              </div>
              <div>
                <p className="text-gray-500">Anomali (Atlanan)</p>
                <p className="text-lg font-semibold text-yellow-600">{syncResult.anomalies}</p>
              </div>
              <div>
                <p className="text-gray-500">Guncellenen</p>
                <p className="text-lg font-semibold text-blue-600">{syncResult.updated || 0}</p>
              </div>
            </div>
            {syncResult.anomalyNote && (
              <p className="mt-2 text-xs text-gray-500">{syncResult.anomalyNote}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Negatif Marj"
          value={inconsistencies?.priceInversion || 0}
          icon={TrendingDown}
          valueClassName="text-red-600"
          subtitle="Alis > Satis"
        />
        <StatCard
          title="Aktif + Stok=0"
          value={inconsistencies?.activeNoStock || 0}
          icon={Package}
          valueClassName="text-yellow-600"
          subtitle="Satilamaz"
        />
        <StatCard
          title="Fiyat Uyumsuz"
          value={inconsistencies?.priceMismatch || 0}
          icon={AlertTriangle}
          valueClassName="text-orange-600"
          subtitle="Panel != Storefront"
        />
        <StatCard
          title="SF Eslesen"
          value={`%${storefrontMatching?.matchRate || 0}`}
          icon={Store}
          valueClassName="text-green-600"
          subtitle={`${storefrontMatching?.matched || 0} / ${storefrontMatching?.total || 0}`}
        />
      </div>

      {/* Storefront Negative Margin Alert */}
      {storefrontNegative?.summary?.total > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Acil: Storefront'ta Zararli Urunler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {storefrontNegative.summary.total} urun
                </p>
                <p className="text-sm text-red-700">
                  Toplam zarar riski: {formatCurrency(storefrontNegative.summary.totalLoss)}
                </p>
              </div>
              <div className="text-right">
                {Object.entries(storefrontNegative.summary.byIssueType || {}).map(([type, count]) => (
                  <Badge key={type} variant="danger" className="ml-2">
                    {type}: {count}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="pb-2">Kod</th>
                    <th className="pb-2">Marka</th>
                    <th className="pb-2 text-right">Alis</th>
                    <th className="pb-2 text-right">Satis</th>
                    <th className="pb-2 text-right">Zarar</th>
                    <th className="pb-2">Sorun</th>
                  </tr>
                </thead>
                <tbody>
                  {storefrontNegative.products?.slice(0, 10).map((p, i) => (
                    <tr key={i} className="border-t border-red-100">
                      <td className="py-2 font-mono text-xs">{p.code}</td>
                      <td className="py-2">{p.brand}</td>
                      <td className="py-2 text-right">{formatCurrency(p.buying_price)}</td>
                      <td className="py-2 text-right">{formatCurrency(p.selling_price)}</td>
                      <td className="py-2 text-right text-red-600 font-semibold">
                        {formatCurrency(p.loss)}
                      </td>
                      <td className="py-2">
                        <Badge variant={p.issue_type === 'BIRIM_KOLI_KARISIKLIGI' ? 'warning' : 'danger'}>
                          {p.issue_type?.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supplier Health */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setExpandedSuppliers(!expandedSuppliers)}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Tedarikci Sagligi
              {supplierHealth?.summary && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({supplierHealth.summary.critical} kritik, {supplierHealth.summary.warning} uyari)
                </span>
              )}
            </CardTitle>
            {expandedSuppliers ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </CardHeader>
        {expandedSuppliers && (
          <CardContent>
            {/* Critical Suppliers */}
            {criticalSuppliers.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  Kritik Tedarikciler ({criticalSuppliers.length})
                </h4>
                <div className="space-y-2">
                  {criticalSuppliers.slice(0, 10).map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{s.supplierName?.substring(0, 40)}</p>
                        <p className="text-xs text-gray-500">
                          {s.issues?.join(' | ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-red-600">%{s.outOfStockRate} stoksuz</p>
                        <p className="text-xs text-gray-500">{s.activeNoStock} / {s.activeProducts}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warning Suppliers */}
            {warningSuppliers.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-yellow-600 mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  Uyari Tedarikciler ({warningSuppliers.length})
                </h4>
                <div className="space-y-2">
                  {warningSuppliers.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                      <div>
                        <p className="font-medium text-sm">{s.supplierName?.substring(0, 40)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-yellow-600">%{s.outOfStockRate} stoksuz</p>
                        <p className="text-xs text-gray-500">{s.activeNoStock} / {s.activeProducts}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Panel-Storefront Matching */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Panel → Storefront</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Toplam Panel Urunu</span>
                <span className="font-semibold">{panelMatching?.total?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">SF'ta Var</span>
                <span className="font-semibold text-green-600">{panelMatching?.hasStorefront?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">SF'ta Yok</span>
                <span className="font-semibold text-gray-400">{panelMatching?.noStorefront?.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${panelMatching?.storefrontRate || 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">%{panelMatching?.storefrontRate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Storefront → Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Toplam SF Urunu</span>
                <span className="font-semibold">{storefrontMatching?.total?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Eslesen</span>
                <span className="font-semibold text-green-600">{storefrontMatching?.matched?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Eslesmeyen</span>
                <span className="font-semibold text-yellow-600">{storefrontMatching?.unmatched?.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${storefrontMatching?.matchRate || 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">%{storefrontMatching?.matchRate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
