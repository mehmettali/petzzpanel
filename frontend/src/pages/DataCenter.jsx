import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Database, RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock, Users,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Play, Check, X,
  Tag, Image, FileText, FolderTree, DollarSign, Package, Zap, Target,
  TrendingUp, BarChart3, Layers, Search, Filter, UserCheck, AlertCircle,
  Store, ShoppingBag, ExternalLink
} from 'lucide-react'
import {
  getDataCenterDashboard,
  runFullAnalysis,
  getCategorySuggestions,
  updateCategorySuggestion,
  bulkApproveSuggestions,
  getQualityIssuesList,
  getQualityIssueSummary,
  getTasksList,
  getTasksSummary,
  assignTask,
  completeTask
} from '../services/api'
import { Card } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/Spinner'
import { formatNumber, formatDate } from '../utils/formatters'
import clsx from 'clsx'

// Tab components
const tabs = [
  { id: 'overview', name: 'Genel Bakış', icon: BarChart3 },
  { id: 'quality', name: 'Kalite Sorunları', icon: AlertTriangle },
  { id: 'categories', name: 'Kategori Önerileri', icon: FolderTree },
  { id: 'tasks', name: 'Görevler', icon: CheckCircle },
]

// Severity badge
function SeverityBadge({ severity }) {
  const config = {
    critical: { color: 'bg-red-100 text-red-800', label: 'Kritik' },
    high: { color: 'bg-orange-100 text-orange-800', label: 'Yüksek' },
    medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Orta' },
    low: { color: 'bg-gray-100 text-gray-800', label: 'Düşük' },
  }
  const { color, label } = config[severity] || config.medium
  return <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', color)}>{label}</span>
}

// Issue type icon
function IssueTypeIcon({ code }) {
  const icons = {
    NO_IMAGE: Image,
    SINGLE_IMAGE: Image,
    NO_DESCRIPTION: FileText,
    NO_CATEGORY: FolderTree,
    NO_BRAND: Tag,
    LOW_MARGIN: DollarSign,
    HIGH_MARGIN: DollarSign,
  }
  const Icon = icons[code] || AlertCircle
  return <Icon className="w-4 h-4" />
}

// Overview Tab
function OverviewTab({ dashboard, onAnalyze, isAnalyzing }) {
  if (!dashboard) return <LoadingState message="Dashboard yükleniyor..." />

  const { products, quality, suggestions, tasks, dataSources, attributeCoverage } = dashboard

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Veri Merkezi Durumu</h2>
          <p className="text-sm text-gray-500">Ürün verilerinizin genel sağlık durumu</p>
        </div>
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            isAnalyzing
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-primary-600 text-white hover:bg-primary-700"
          )}
        >
          {isAnalyzing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          {isAnalyzing ? 'Analiz Ediliyor...' : 'Tam Analiz Çalıştır'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatNumber(products?.total_products)}</p>
              <p className="text-sm text-gray-500">Toplam Ürün</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{formatNumber(quality?.critical)}</p>
              <p className="text-sm text-gray-500">Kritik Sorun</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{formatNumber(quality?.high)}</p>
              <p className="text-sm text-gray-500">Yüksek Öncelik</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <FolderTree className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{formatNumber(suggestions?.pending_suggestions)}</p>
              <p className="text-sm text-gray-500">Bekleyen Öneri</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatNumber(tasks?.pending)}</p>
              <p className="text-sm text-gray-500">Bekleyen Görev</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{formatNumber(tasks?.completed_today)}</p>
              <p className="text-sm text-gray-500">Bugün Tamamlanan</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Data Sources */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Database className="w-4 h-4" />
          Veri Kaynakları
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {dataSources?.map((source) => (
            <div
              key={source.code}
              className={clsx(
                "p-3 rounded-lg border",
                source.is_active ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{source.name}</span>
                {source.is_active ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
              </div>
              {source.last_sync_at && (
                <p className="text-xs text-gray-500">
                  Son: {formatDate(source.last_sync_at)}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Attribute Coverage */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Veri Zenginliği
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Özellik Verisi Olan Ürünler</span>
            <span className="font-medium">
              {formatNumber(attributeCoverage?.products_with_attributes)} / {formatNumber(attributeCoverage?.total_products)}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full"
              style={{
                width: `${attributeCoverage?.total_products > 0
                  ? (attributeCoverage?.products_with_attributes / attributeCoverage?.total_products * 100)
                  : 0}%`
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}

// Quality Issues Tab
function QualityTab() {
  const [page, setPage] = useState(1)
  const [severity, setSeverity] = useState('')
  const [issueType, setIssueType] = useState('')

  const { data: summary } = useQuery({
    queryKey: ['quality-summary'],
    queryFn: getQualityIssueSummary
  })

  const { data: issuesData, isLoading } = useQuery({
    queryKey: ['quality-issues', { page, severity, issueType }],
    queryFn: () => getQualityIssuesList({ page, limit: 50, status: 'open', severity, issueType })
  })

  const { issues, pagination } = issuesData || { issues: [], pagination: {} }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      {summary?.totals && (
        <div className="grid grid-cols-5 gap-3">
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold">{formatNumber(summary.totals.total)}</p>
            <p className="text-xs text-gray-500">Toplam Sorun</p>
          </Card>
          <Card className="p-3 text-center bg-red-50">
            <p className="text-2xl font-bold text-red-600">{formatNumber(summary.totals.critical)}</p>
            <p className="text-xs text-red-700">Kritik</p>
          </Card>
          <Card className="p-3 text-center bg-orange-50">
            <p className="text-2xl font-bold text-orange-600">{formatNumber(summary.totals.high)}</p>
            <p className="text-xs text-orange-700">Yüksek</p>
          </Card>
          <Card className="p-3 text-center bg-yellow-50">
            <p className="text-2xl font-bold text-yellow-600">{formatNumber(summary.totals.medium)}</p>
            <p className="text-xs text-yellow-700">Orta</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-gray-600">{formatNumber(summary.totals.low)}</p>
            <p className="text-xs text-gray-500">Düşük</p>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <select
          value={severity}
          onChange={(e) => { setSeverity(e.target.value); setPage(1) }}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Tüm Önem Dereceleri</option>
          <option value="critical">Kritik</option>
          <option value="high">Yüksek</option>
          <option value="medium">Orta</option>
          <option value="low">Düşük</option>
        </select>
        <select
          value={issueType}
          onChange={(e) => { setIssueType(e.target.value); setPage(1) }}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Tüm Sorun Tipleri</option>
          <option value="content">İçerik</option>
          <option value="category">Kategori</option>
          <option value="pricing">Fiyat</option>
        </select>
      </div>

      {/* Issues Table */}
      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400" />
          </div>
        ) : issues.length === 0 ? (
          <EmptyState message="Sorun bulunamadı" icon={CheckCircle} />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 uppercase">
                <th className="px-4 py-2 text-left">Önem</th>
                <th className="px-4 py-2 text-left">Tip</th>
                <th className="px-4 py-2 text-left">SKU</th>
                <th className="px-4 py-2 text-left">Ürün</th>
                <th className="px-4 py-2 text-left">Sorun</th>
                <th className="px-4 py-2 text-left">Tarih</th>
                <th className="px-4 py-2 text-center">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {issues.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2"><SeverityBadge severity={issue.severity} /></td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <IssueTypeIcon code={issue.issue_code} />
                      <span className="text-gray-600">{issue.issue_type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{issue.sku}</td>
                  <td className="px-4 py-2">{issue.product_name?.slice(0, 40)}</td>
                  <td className="px-4 py-2">
                    <p className="font-medium">{issue.title}</p>
                    <p className="text-xs text-gray-500">{issue.description}</p>
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">{formatDate(issue.created_at)}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-1">
                      {issue.petzzshop_url ? (
                        <a href={issue.petzzshop_url} target="_blank" rel="noopener noreferrer"
                          className="p-1 rounded bg-primary-50 text-primary-600 hover:bg-primary-100" title="PetzzShop">
                          <Store className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="p-1 rounded bg-gray-50 text-gray-300"><Store className="w-3.5 h-3.5" /></span>
                      )}
                      {issue.akakce_url ? (
                        <a href={issue.akakce_url} target="_blank" rel="noopener noreferrer"
                          className="p-1 rounded bg-orange-50 text-orange-600 hover:bg-orange-100" title="Akakce">
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="p-1 rounded bg-gray-50 text-gray-300"><ShoppingBag className="w-3.5 h-3.5" /></span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination?.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-2 bg-gray-50">
            <span className="text-sm text-gray-600">
              {formatNumber(pagination.total)} sorun
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 border rounded disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm">{page} / {pagination.totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="p-1 border rounded disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

// Category Suggestions Tab
function CategoriesTab() {
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const queryClient = useQueryClient()

  const { data: suggestionsData, isLoading } = useQuery({
    queryKey: ['category-suggestions', { page }],
    queryFn: () => getCategorySuggestions({ page, limit: 50, status: 'pending' })
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, status }) => updateCategorySuggestion(id, { status, reviewedBy: 'panel_user' }),
    onSuccess: () => queryClient.invalidateQueries(['category-suggestions'])
  })

  const bulkApproveMutation = useMutation({
    mutationFn: (ids) => bulkApproveSuggestions({ ids: Array.from(ids), reviewedBy: 'panel_user' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['category-suggestions'])
      setSelectedIds(new Set())
    }
  })

  const { suggestions, pagination } = suggestionsData || { suggestions: [], pagination: {} }

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === suggestions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(suggestions.map(s => s.id)))
    }
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <Card className="p-3 bg-primary-50 border-primary-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary-700">
              {selectedIds.size} öneri seçildi
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => bulkApproveMutation.mutate(selectedIds)}
                disabled={bulkApproveMutation.isLoading}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                <Check className="w-4 h-4" />
                Tümünü Onayla
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-3 py-1 border rounded text-sm hover:bg-white"
              >
                İptal
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Suggestions Table */}
      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400" />
          </div>
        ) : suggestions.length === 0 ? (
          <EmptyState message="Bekleyen öneri yok" icon={CheckCircle} />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 uppercase">
                <th className="px-4 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === suggestions.length}
                    onChange={selectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-2 text-left">SKU</th>
                <th className="px-4 py-2 text-left">Ürün</th>
                <th className="px-4 py-2 text-left">Önerilen Kategori</th>
                <th className="px-4 py-2 text-left">Güven</th>
                <th className="px-4 py-2 text-left">Sebep</th>
                <th className="px-4 py-2 text-center">Link</th>
                <th className="px-4 py-2 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {suggestions.map((suggestion) => (
                <tr key={suggestion.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(suggestion.id)}
                      onChange={() => toggleSelect(suggestion.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{suggestion.sku}</td>
                  <td className="px-4 py-2">
                    <p>{suggestion.product_name?.slice(0, 35)}</p>
                    <p className="text-xs text-gray-500">{suggestion.brand}</p>
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant="secondary">
                      {suggestion.category_type}: {suggestion.suggested_category}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            "h-full rounded-full",
                            suggestion.confidence >= 0.8 ? "bg-green-500" : suggestion.confidence >= 0.6 ? "bg-yellow-500" : "bg-red-500"
                          )}
                          style={{ width: `${suggestion.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs">{Math.round(suggestion.confidence * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-600">{suggestion.reason}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-1">
                      {suggestion.petzzshop_url ? (
                        <a href={suggestion.petzzshop_url} target="_blank" rel="noopener noreferrer"
                          className="p-1 rounded bg-primary-50 text-primary-600 hover:bg-primary-100" title="PetzzShop">
                          <Store className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="p-1 rounded bg-gray-50 text-gray-300"><Store className="w-3.5 h-3.5" /></span>
                      )}
                      {suggestion.akakce_url ? (
                        <a href={suggestion.akakce_url} target="_blank" rel="noopener noreferrer"
                          className="p-1 rounded bg-orange-50 text-orange-600 hover:bg-orange-100" title="Akakce">
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="p-1 rounded bg-gray-50 text-gray-300"><ShoppingBag className="w-3.5 h-3.5" /></span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => approveMutation.mutate({ id: suggestion.id, status: 'approved' })}
                        disabled={approveMutation.isLoading}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Onayla"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => approveMutation.mutate({ id: suggestion.id, status: 'rejected' })}
                        disabled={approveMutation.isLoading}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Reddet"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination?.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-2 bg-gray-50">
            <span className="text-sm text-gray-600">
              {formatNumber(pagination.total)} öneri
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 border rounded disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm">{page} / {pagination.totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="p-1 border rounded disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

// Tasks Tab
function TasksTab() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('pending')
  const queryClient = useQueryClient()

  const { data: summary } = useQuery({
    queryKey: ['tasks-summary'],
    queryFn: getTasksSummary
  })

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks-list', { page, status }],
    queryFn: () => getTasksList({ page, limit: 50, status: status || undefined })
  })

  const completeMutation = useMutation({
    mutationFn: (id) => completeTask(id, { completedBy: 'panel_user', resolution: 'Tamamlandı' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks-list'])
      queryClient.invalidateQueries(['tasks-summary'])
    }
  })

  const { tasks, pagination } = tasksData || { tasks: [], pagination: {} }

  const statusCounts = summary?.byStatus?.reduce((acc, s) => {
    acc[s.status] = s.count
    return acc
  }, {}) || {}

  return (
    <div className="space-y-4">
      {/* Status Tabs */}
      <div className="flex gap-2">
        {[
          { key: '', label: 'Tümü', count: Object.values(statusCounts).reduce((a, b) => a + b, 0) },
          { key: 'pending', label: 'Bekleyen', count: statusCounts.pending || 0 },
          { key: 'assigned', label: 'Atanmış', count: statusCounts.assigned || 0 },
          { key: 'in_progress', label: 'Devam Eden', count: statusCounts.in_progress || 0 },
          { key: 'completed', label: 'Tamamlanan', count: statusCounts.completed || 0 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatus(tab.key); setPage(1) }}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              status === tab.key
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Tasks Table */}
      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400" />
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState message="Görev bulunamadı" icon={CheckCircle} />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 uppercase">
                <th className="px-4 py-2 text-left">Öncelik</th>
                <th className="px-4 py-2 text-left">Tip</th>
                <th className="px-4 py-2 text-left">SKU</th>
                <th className="px-4 py-2 text-left">Görev</th>
                <th className="px-4 py-2 text-left">Etki</th>
                <th className="px-4 py-2 text-left">Atanan</th>
                <th className="px-4 py-2 text-center">Link</th>
                <th className="px-4 py-2 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2"><SeverityBadge severity={task.priority} /></td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <IssueTypeIcon code={task.task_type} />
                      <span className="text-gray-600 text-xs">{task.task_type}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{task.sku}</td>
                  <td className="px-4 py-2">
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.product_name?.slice(0, 40)}</p>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{ width: `${task.impact_score}%` }}
                        />
                      </div>
                      <span className="text-xs">{task.impact_score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {task.assigned_to || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-center gap-1">
                      {task.petzzshop_url ? (
                        <a href={task.petzzshop_url} target="_blank" rel="noopener noreferrer"
                          className="p-1 rounded bg-primary-50 text-primary-600 hover:bg-primary-100" title="PetzzShop">
                          <Store className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="p-1 rounded bg-gray-50 text-gray-300"><Store className="w-3.5 h-3.5" /></span>
                      )}
                      {task.akakce_url ? (
                        <a href={task.akakce_url} target="_blank" rel="noopener noreferrer"
                          className="p-1 rounded bg-orange-50 text-orange-600 hover:bg-orange-100" title="Akakce">
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="p-1 rounded bg-gray-50 text-gray-300"><ShoppingBag className="w-3.5 h-3.5" /></span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => completeMutation.mutate(task.id)}
                        disabled={completeMutation.isLoading}
                        className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                      >
                        <Check className="w-3 h-3" />
                        Tamamla
                      </button>
                    )}
                    {task.status === 'completed' && (
                      <span className="text-green-600 text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Tamamlandı
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination?.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-2 bg-gray-50">
            <span className="text-sm text-gray-600">
              {formatNumber(pagination.total)} görev
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 border rounded disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm">{page} / {pagination.totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="p-1 border rounded disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

// Main Component
export default function DataCenter() {
  const [activeTab, setActiveTab] = useState('overview')
  const queryClient = useQueryClient()

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['datacenter-dashboard'],
    queryFn: getDataCenterDashboard
  })

  const analyzeMutation = useMutation({
    mutationFn: runFullAnalysis,
    onSuccess: () => {
      queryClient.invalidateQueries(['datacenter-dashboard'])
      queryClient.invalidateQueries(['quality-issues'])
      queryClient.invalidateQueries(['category-suggestions'])
      queryClient.invalidateQueries(['tasks-list'])
    }
  })

  if (isLoading) return <LoadingState message="Data Center yükleniyor..." />

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Database className="w-6 h-6 text-primary-600" />
          Data Center
        </h1>
        <p className="text-gray-500 text-sm">Veri kalitesi, kategori yönetimi ve görev takibi</p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab
          dashboard={dashboard}
          onAnalyze={() => analyzeMutation.mutate()}
          isAnalyzing={analyzeMutation.isLoading}
        />
      )}
      {activeTab === 'quality' && <QualityTab />}
      {activeTab === 'categories' && <CategoriesTab />}
      {activeTab === 'tasks' && <TasksTab />}
    </div>
  )
}
