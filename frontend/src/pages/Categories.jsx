import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FolderTree, Package, AlertTriangle, RefreshCw, ChevronRight, ChevronDown,
  Download, Search, Layers, Box, BarChart3, ArrowRight, Check, X,
  ChevronLeft, TrendingUp, TrendingDown, ExternalLink
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Treemap } from 'recharts'
import {
  getCategoryAnalytics,
  importGoogleTaxonomy,
  autoMapCategories,
  getCategoryDashboard,
  getCategoryTree,
  getAllGoogleCategories,
  getCategoryStockSummary,
  getUnmappedCategoryProducts,
  getCategoryDetail
} from '../services/api'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { LoadingState, EmptyState } from '../components/ui/Spinner'
import { formatCurrency, formatNumber } from '../utils/formatters'
import clsx from 'clsx'

// Tab Component
function TabButton({ active, onClick, children, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
        active
          ? "bg-primary-600 text-white"
          : "text-gray-600 hover:bg-gray-100"
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  )
}

// Stat Card
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

// Category Tree Item
function CategoryTreeItem({ category, level = 0, onSelect, selectedId }) {
  const [expanded, setExpanded] = useState(level < 2)
  const hasChildren = category.has_children || category.child_count > 0

  const { data: children } = useQuery({
    queryKey: ['category-tree', category.id],
    queryFn: () => getCategoryTree(category.id),
    enabled: expanded && hasChildren
  })

  return (
    <div>
      <div
        className={clsx(
          "flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors",
          selectedId === category.id && "bg-primary-50 border-l-4 border-primary-500"
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => onSelect(category)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="p-0.5 hover:bg-gray-200 rounded"
          >
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <FolderTree className="w-4 h-4 text-gray-400" />
        <span className="flex-1 text-sm truncate">{category.name}</span>
        {category.product_count > 0 && (
          <Badge variant="secondary" size="xs">{category.product_count}</Badge>
        )}
      </div>
      {expanded && children && (
        <div>
          {children.map(child => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Google Taxonomy Tab
function GoogleTaxonomyTab() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const queryClient = useQueryClient()

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['category-dashboard'],
    queryFn: getCategoryDashboard
  })

  const { data: rootCategories, isLoading: treeLoading } = useQuery({
    queryKey: ['category-tree', null],
    queryFn: () => getCategoryTree(null)
  })

  const { data: categoryDetail } = useQuery({
    queryKey: ['category-detail', selectedCategory?.id],
    queryFn: () => getCategoryDetail(selectedCategory.id),
    enabled: !!selectedCategory?.id
  })

  const importMutation = useMutation({
    mutationFn: importGoogleTaxonomy,
    onSuccess: () => {
      queryClient.invalidateQueries(['category-tree'])
      queryClient.invalidateQueries(['category-dashboard'])
    }
  })

  const mapMutation = useMutation({
    mutationFn: autoMapCategories,
    onSuccess: () => {
      queryClient.invalidateQueries(['category-tree'])
      queryClient.invalidateQueries(['category-dashboard'])
    }
  })

  const overview = dashboard?.overview || {}

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Layers}
          label="Toplam Kategori"
          value={formatNumber(overview.total_categories || 0)}
          color="primary"
        />
        <StatCard
          icon={Package}
          label="Eslesmis Urun"
          value={formatNumber(overview.total_products_mapped || 0)}
          color="green"
        />
        <StatCard
          icon={AlertTriangle}
          label="Eslesmemis Urun"
          value={formatNumber(overview.unmapped_products || 0)}
          color="red"
        />
        <StatCard
          icon={Box}
          label="Toplam Stok Degeri"
          value={formatCurrency(overview.total_stock_value || 0)}
          color="blue"
        />
      </div>

      {/* Action Buttons */}
      <Card className="p-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => importMutation.mutate()}
            disabled={importMutation.isLoading}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              importMutation.isLoading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            <Download className={clsx("w-4 h-4", importMutation.isLoading && "animate-spin")} />
            {importMutation.isLoading ? 'Iceri Aktariliyor...' : 'Google Taxonomy Ice Aktar'}
          </button>

          <button
            onClick={() => mapMutation.mutate()}
            disabled={mapMutation.isLoading}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              mapMutation.isLoading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            )}
          >
            <RefreshCw className={clsx("w-4 h-4", mapMutation.isLoading && "animate-spin")} />
            {mapMutation.isLoading ? 'Eslestiriliyor...' : 'Otomatik Urun Esle'}
          </button>
        </div>
      </Card>

      {/* Category Tree and Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tree */}
        <Card className="lg:col-span-1 p-0">
          <CardHeader className="border-b">
            <CardTitle className="text-sm">Kategori Agaci</CardTitle>
          </CardHeader>
          <CardContent className="p-2 max-h-[600px] overflow-y-auto">
            {treeLoading ? (
              <div className="p-4 text-center text-gray-500">Yukleniyor...</div>
            ) : rootCategories?.length > 0 ? (
              rootCategories.map(cat => (
                <CategoryTreeItem
                  key={cat.id}
                  category={cat}
                  onSelect={setSelectedCategory}
                  selectedId={selectedCategory?.id}
                />
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                Henuz kategori yok. "Google Taxonomy Ice Aktar" butonuna tiklayin.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail */}
        <Card className="lg:col-span-2 p-0">
          <CardHeader className="border-b">
            <CardTitle className="text-sm">
              {selectedCategory ? selectedCategory.name : 'Kategori Secin'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {categoryDetail ? (
              <div className="space-y-4">
                {/* Breadcrumb */}
                {categoryDetail.breadcrumb.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    {categoryDetail.breadcrumb.map((b, i) => (
                      <span key={b.id} className="flex items-center gap-1">
                        {i > 0 && <ChevronRight className="w-3 h-3" />}
                        <button
                          onClick={() => setSelectedCategory(b)}
                          className="hover:text-primary-600"
                        >
                          {b.name}
                        </button>
                      </span>
                    ))}
                    <ChevronRight className="w-3 h-3" />
                    <span className="font-medium text-gray-700">{categoryDetail.name}</span>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">{categoryDetail.product_count}</p>
                    <p className="text-xs text-gray-500">Urun</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">{categoryDetail.stock_count || 0}</p>
                    <p className="text-xs text-gray-500">Stok</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(categoryDetail.stock_value || 0)}</p>
                    <p className="text-xs text-gray-500">Stok Degeri</p>
                  </div>
                </div>

                {/* Children */}
                {categoryDetail.children?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Alt Kategoriler</h4>
                    <div className="flex flex-wrap gap-2">
                      {categoryDetail.children.map(child => (
                        <button
                          key={child.id}
                          onClick={() => setSelectedCategory(child)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                        >
                          <FolderTree className="w-3 h-3" />
                          {child.name}
                          <Badge variant="secondary" size="xs">{child.product_count}</Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products */}
                {categoryDetail.products?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Urunler ({categoryDetail.products.length})
                    </h4>
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-2 py-1 text-left">SKU</th>
                            <th className="px-2 py-1 text-left">Urun Adi</th>
                            <th className="px-2 py-1 text-right">Stok</th>
                            <th className="px-2 py-1 text-right">Fiyat</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {categoryDetail.products.map((p, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-2 py-1 font-mono">{p.sku}</td>
                              <td className="px-2 py-1 truncate max-w-[200px]">{p.name}</td>
                              <td className="px-2 py-1 text-right">
                                <span className={p.total_quantity > 0 ? 'text-green-600' : 'text-red-500'}>
                                  {p.total_quantity}
                                </span>
                              </td>
                              <td className="px-2 py-1 text-right font-medium">{formatCurrency(p.selling_price)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <FolderTree className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Sol taraftan bir kategori secin</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      {dashboard?.topCategories?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>En Cok Urun Iceren Kategoriler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {dashboard.topCategories.map((cat, i) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className="p-3 border rounded-lg hover:bg-gray-50 text-left transition-colors"
                >
                  <p className="font-medium text-gray-900 truncate">{cat.name}</p>
                  <p className="text-sm text-gray-500">{formatNumber(cat.product_count)} urun</p>
                  <p className="text-xs text-gray-400">{formatNumber(cat.stock_count)} stok</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Legacy Analytics Tab
function LegacyAnalyticsTab() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categoryAnalytics'],
    queryFn: getCategoryAnalytics,
  })

  if (isLoading) return <LoadingState message="Kategori analizi yukleniyor..." />

  const chartData = categories?.slice(0, 10).map(c => ({
    name: c.main_category?.substring(0, 15) || 'Diger',
    urunler: c.product_count,
    stoksuz: c.out_of_stock,
  })) || []

  return (
    <div className="space-y-6">
      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori Dagilimi (Top 10)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="urunler" name="Toplam Urun" fill="#636ef1" radius={[0, 4, 4, 0]} />
                <Bar dataKey="stoksuz" name="Stoksuz" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tum Kategoriler</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Kategori</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Urun Sayisi</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Aktif</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Stoksuz</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Dusuk Stok</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Ort. Fiyat</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Ort. Marj</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Envanter Degeri</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Marka</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories?.map((cat, index) => {
                  const outOfStockRate = cat.product_count > 0
                    ? (cat.out_of_stock / cat.product_count * 100).toFixed(1)
                    : 0
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FolderTree className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{cat.main_category || 'Kategorisiz'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{formatNumber(cat.product_count)}</td>
                      <td className="px-4 py-3 text-right text-green-600">{formatNumber(cat.active_count)}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={outOfStockRate > 30 ? 'danger' : outOfStockRate > 15 ? 'warning' : 'success'}>
                          {cat.out_of_stock} ({outOfStockRate}%)
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-yellow-600">{formatNumber(cat.low_stock)}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatCurrency(cat.avg_price)}</td>
                      <td className="px-4 py-3 text-right">
                        {cat.avg_margin ? (
                          <Badge variant={cat.avg_margin > 20 ? 'success' : cat.avg_margin > 10 ? 'warning' : 'danger'}>
                            %{cat.avg_margin?.toFixed(1)}
                          </Badge>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{formatCurrency(cat.inventory_value)}</td>
                      <td className="px-4 py-3 text-right">{cat.brand_count}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Component
export default function Categories() {
  const [activeTab, setActiveTab] = useState('taxonomy')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-primary-600" />
            Kategoriler
          </h1>
          <p className="text-gray-500 text-sm">Google Taxonomy ve kategori yonetimi</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <TabButton
          active={activeTab === 'taxonomy'}
          onClick={() => setActiveTab('taxonomy')}
          icon={Layers}
        >
          Google Taxonomy
        </TabButton>
        <TabButton
          active={activeTab === 'analytics'}
          onClick={() => setActiveTab('analytics')}
          icon={BarChart3}
        >
          Mevcut Kategori Analizi
        </TabButton>
      </div>

      {/* Tab Content */}
      {activeTab === 'taxonomy' && <GoogleTaxonomyTab />}
      {activeTab === 'analytics' && <LegacyAnalyticsTab />}
    </div>
  )
}
