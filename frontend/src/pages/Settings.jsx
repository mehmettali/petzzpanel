import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import {
  RefreshCw, Database, Clock, CheckCircle, XCircle, Activity,
  Zap, Package, Users, BarChart3, AlertTriangle, Timer, TrendingUp,
  Wifi, WifiOff, Store, PieChart, Server, Cloud, AlertCircle,
  Play, Square, Info, ChevronDown, ChevronUp
} from 'lucide-react'
import {
  getDataSourcesStatus,
  getSyncProgress,
  startSourceSync,
  checkSourceConnection,
  getSyncLogs
} from '../services/api'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { formatDate, formatRelativeTime, formatNumber } from '../utils/formatters'
import clsx from 'clsx'

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT: Kaynak Durumu İkonu
// ═══════════════════════════════════════════════════════════════════════════
function StatusIcon({ status, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  switch (status) {
    case 'online':
      return <CheckCircle className={clsx(sizeClasses[size], 'text-green-500')} />
    case 'offline':
      return <WifiOff className={clsx(sizeClasses[size], 'text-red-500')} />
    case 'error':
      return <AlertCircle className={clsx(sizeClasses[size], 'text-red-500')} />
    case 'empty':
      return <AlertTriangle className={clsx(sizeClasses[size], 'text-yellow-500')} />
    case 'syncing':
      return <RefreshCw className={clsx(sizeClasses[size], 'text-blue-500 animate-spin')} />
    default:
      return <Clock className={clsx(sizeClasses[size], 'text-gray-400')} />
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT: Kaynak İkonu
// ═══════════════════════════════════════════════════════════════════════════
function SourceIcon({ icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    green: 'bg-green-100 text-green-600'
  }

  const icons = {
    database: Database,
    store: Store,
    chart: PieChart,
    server: Server,
    cloud: Cloud
  }

  const Icon = icons[icon] || Database

  return (
    <div className={clsx('p-2 rounded-lg', colorClasses[color] || colorClasses.blue)}>
      <Icon className="w-5 h-5" />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT: Veri Kaynağı Kartı
// ═══════════════════════════════════════════════════════════════════════════
function DataSourceCard({ source, onSync, onCheck, syncProgress }) {
  const [expanded, setExpanded] = useState(false)
  const isOnline = source.status === 'online'
  const isSyncing = syncProgress?.phase && syncProgress.phase !== 'completed'
  const hasError = source.status === 'error' || source.status === 'offline'

  const statusText = {
    online: 'Çevrimiçi',
    offline: 'Çevrimdışı',
    error: 'Hata',
    empty: 'Veri Yok',
    unknown: 'Kontrol Edilmedi'
  }

  return (
    <Card className={clsx(
      'transition-all duration-200',
      isSyncing && 'ring-2 ring-blue-300 shadow-lg',
      hasError && 'border-red-200 bg-red-50/30'
    )}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <SourceIcon icon={source.icon} color={source.color} />
            <div>
              <h3 className="font-semibold text-gray-900">{source.name}</h3>
              <p className="text-sm text-gray-500">{source.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon status={isSyncing ? 'syncing' : source.status} />
            <Badge variant={isOnline ? 'success' : hasError ? 'danger' : 'secondary'}>
              {isSyncing ? 'Senkronize Ediliyor' : statusText[source.status] || 'Bilinmiyor'}
            </Badge>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {source.latency && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Gecikme</p>
              <p className="font-semibold text-gray-700">{source.latency}ms</p>
            </div>
          )}
          {source.productCount !== undefined && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Ürün</p>
              <p className="font-semibold text-gray-700">{formatNumber(source.productCount)}</p>
            </div>
          )}
          {source.lastSync && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Son Sync</p>
              <p className="font-semibold text-gray-700 text-xs">{formatRelativeTime(source.lastSync)}</p>
            </div>
          )}
          {source.lastCheck && (
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Son Kontrol</p>
              <p className="font-semibold text-gray-700 text-xs">{formatRelativeTime(source.lastCheck)}</p>
            </div>
          )}
        </div>

        {/* Sync Progress */}
        {isSyncing && syncProgress && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">
                {syncProgress.phase === 'counting' ? 'Sayılıyor...' :
                 syncProgress.phase === 'fetching' ? 'API\'den çekiliyor...' :
                 syncProgress.phase === 'saving' ? 'Kaydediliyor...' :
                 'İşleniyor...'}
              </span>
              <span className="text-sm font-bold text-blue-800">
                %{syncProgress.percentComplete?.toFixed(1) || 0}
              </span>
            </div>
            <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                style={{ width: `${syncProgress.percentComplete || 0}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-blue-600">
              <span>{formatNumber(syncProgress.progress || 0)} / {formatNumber(syncProgress.total || 0)}</span>
              {syncProgress.logs?.length > 0 && (
                <span>{syncProgress.logs[syncProgress.logs.length - 1]?.message?.slice(0, 40)}...</span>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {hasError && source.message && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">Bağlantı Hatası</p>
                <p className="text-xs text-red-600 mt-1">{source.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onSync(source.id)}
            disabled={isSyncing || !isOnline}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              isSyncing || !isOnline
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            )}
          >
            <RefreshCw className={clsx('w-4 h-4', isSyncing && 'animate-spin')} />
            {isSyncing ? 'Senkronize Ediliyor...' : 'Senkronize Et'}
          </button>
          <button
            onClick={() => onCheck(source.id)}
            disabled={isSyncing}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Wifi className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Detaylı Bilgi</h4>
            <div className="text-xs text-gray-600 space-y-1 font-mono bg-gray-50 p-3 rounded">
              <p>API URL: {source.apiUrl || 'N/A'}</p>
              <p>Status: {source.status}</p>
              <p>HTTP Status: {source.httpStatus || 'N/A'}</p>
              {source.stats && (
                <>
                  <p>Total Products: {source.stats.totalProducts}</p>
                  <p>Meta Count: {source.stats.metaCount}</p>
                  <p>Competitor Count: {source.stats.competitorCount}</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function Settings() {
  const queryClient = useQueryClient()
  const [activeSync, setActiveSync] = useState(null)

  // Data sources status
  const { data: sourcesData, isLoading, refetch: refetchSources } = useQuery({
    queryKey: ['dataSourcesStatus'],
    queryFn: getDataSourcesStatus,
    refetchInterval: activeSync ? 1000 : 10000 // Sync varsa her saniye, yoksa 10 saniyede bir
  })

  // Active sync progress
  const { data: syncProgress } = useQuery({
    queryKey: ['syncProgress', activeSync],
    queryFn: () => getSyncProgress(activeSync),
    enabled: !!activeSync,
    refetchInterval: 1000
  })

  // Sync logs
  const { data: syncLogs } = useQuery({
    queryKey: ['syncLogs'],
    queryFn: getSyncLogs
  })

  // Check if sync completed
  useEffect(() => {
    if (syncProgress?.phase === 'completed' || syncProgress?.active === false) {
      setActiveSync(null)
      refetchSources()
      queryClient.invalidateQueries(['syncLogs'])
    }
  }, [syncProgress])

  // Start sync mutation
  const syncMutation = useMutation({
    mutationFn: startSourceSync,
    onSuccess: (_, sourceId) => {
      setActiveSync(sourceId)
    }
  })

  // Check connection mutation
  const checkMutation = useMutation({
    mutationFn: checkSourceConnection,
    onSuccess: () => {
      refetchSources()
    }
  })

  const handleSync = (sourceId) => {
    syncMutation.mutate(sourceId)
  }

  const handleCheck = (sourceId) => {
    checkMutation.mutate(sourceId)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  const sources = sourcesData?.sources || []
  const database = sourcesData?.database || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Veri Kaynakları</h1>
        <p className="text-gray-500">Sistem veri kaynakları ve senkronizasyon yönetimi</p>
      </div>

      {/* Database Summary */}
      <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <Database className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Yerel Veritabanı</h3>
                <p className="text-sm text-gray-600">
                  Son güncelleme: {database.lastSync ? formatRelativeTime(database.lastSync) : 'Henüz yok'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-700">{formatNumber(database.totalProducts)}</p>
                <p className="text-xs text-gray-500">Toplam Ürün</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{formatNumber(database.activeProducts)}</p>
                <p className="text-xs text-gray-500">Aktif</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{formatNumber(database.outOfStock)}</p>
                <p className="text-xs text-gray-500">Stoksuz</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{formatNumber(database.withAkakce)}</p>
                <p className="text-xs text-gray-500">Akakce</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {sources.map((source) => (
          <DataSourceCard
            key={source.id}
            source={source}
            onSync={handleSync}
            onCheck={handleCheck}
            syncProgress={activeSync === source.id ? syncProgress : null}
          />
        ))}
      </div>

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Senkronizasyon Geçmişi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Tarih</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Kaynak</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Durum</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Ürün</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Süre</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {syncLogs?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Henüz senkronizasyon kaydı yok
                    </td>
                  </tr>
                ) : (
                  syncLogs?.map((log) => {
                    const duration = log.completed_at && log.started_at
                      ? Math.round((new Date(log.completed_at) - new Date(log.started_at)) / 1000)
                      : null
                    return (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{formatDate(log.started_at)}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="info">{log.sync_type === 'full' ? 'Tam' : log.sync_type}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          {log.status === 'success' ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">Başarılı</span>
                            </div>
                          ) : log.status === 'failed' ? (
                            <div className="flex items-center gap-1 text-red-600">
                              <XCircle className="h-4 w-4" />
                              <span className="text-sm" title={log.error_message}>Başarısız</span>
                            </div>
                          ) : (
                            <Badge variant="warning">Devam Ediyor</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium">
                          {formatNumber(log.synced_products)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {duration ? `${duration}s` : '-'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Veri Kaynakları Hakkında</h4>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>• <strong>Petzz Panel API:</strong> Ana ürün veritabanı - tüm ürün, stok ve fiyat bilgileri buradan gelir</li>
                <li>• <strong>ikas Storefront:</strong> E-ticaret vitrini - yayınlanan ürünler ve online satış verileri</li>
                <li>• <strong>Akakce Fiyat:</strong> Rakip fiyat karşılaştırma - Petzz API üzerinden otomatik çekilir</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
