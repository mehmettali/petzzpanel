import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Package,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Tag,
  Building,
  DollarSign,
  ShoppingCart,
  Store,
  ExternalLink
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getDashboard, getCategoryAnalytics, getQualitySummary, getStorefrontStatus } from '../services/api'
import { queryKeys, staleTimes } from '../services/queryKeys'
import StatCard from '../components/ui/StatCard'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { LoadingState, ErrorState } from '../components/ui/Spinner'
import { formatCurrency, formatNumber } from '../utils/formatters'

const COLORS = ['#636ef1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function Dashboard() {
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: queryKeys.analytics.dashboard,
    queryFn: getDashboard,
    staleTime: staleTimes.dashboard,
  })

  const { data: categories } = useQuery({
    queryKey: queryKeys.analytics.categories,
    queryFn: getCategoryAnalytics,
    staleTime: staleTimes.dashboard,
  })

  const { data: quality } = useQuery({
    queryKey: queryKeys.quality.summary,
    queryFn: getQualitySummary,
    staleTime: staleTimes.dashboard,
  })

  if (isLoading) return <LoadingState message="Dashboard yukleniyor..." />
  if (error) return <ErrorState message="Dashboard yuklenemedi" />

  const { totals, pricePosition } = dashboard || {}

  // Prepare chart data
  const categoryData = categories?.slice(0, 6).map(c => ({
    name: c.main_category || 'Diger',
    urunSayisi: c.product_count,
    stoksuz: c.out_of_stock
  })) || []

  const pricePositionData = pricePosition ? [
    { name: 'Kazaniyoruz', value: pricePosition.winning || 0 },
    { name: 'Rekabetci', value: pricePosition.competitive || 0 },
    { name: 'Pahali', value: pricePosition.expensive || 0 },
  ] : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">E-ticaret panelinize genel bakis</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Toplam Urun"
          value={formatNumber(totals?.total_products)}
          icon={Package}
        />
        <StatCard
          title="Aktif Urun"
          value={formatNumber(totals?.active_products)}
          icon={CheckCircle}
          valueClassName="text-green-600"
        />
        <StatCard
          title="Stokta Yok"
          value={formatNumber(totals?.out_of_stock)}
          icon={AlertTriangle}
          valueClassName="text-red-600"
        />
        <StatCard
          title="Kritik Stok"
          value={formatNumber(totals?.low_stock)}
          icon={TrendingUp}
          valueClassName="text-yellow-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Toplam Marka"
          value={formatNumber(totals?.total_brands)}
          icon={Tag}
        />
        <StatCard
          title="Toplam Kategori"
          value={formatNumber(totals?.total_categories)}
          icon={Building}
        />
        <StatCard
          title="Tedarikci Sayisi"
          value={formatNumber(totals?.total_suppliers)}
          icon={ShoppingCart}
        />
        <StatCard
          title="Envanter Degeri"
          value={formatCurrency(totals?.total_inventory_value)}
          icon={DollarSign}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Kategori Dagilimi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="urunSayisi" name="Urun Sayisi" fill="#636ef1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="stoksuz" name="Stoksuz" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Price Position */}
        <Card>
          <CardHeader>
            <CardTitle>Fiyat Pozisyonu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pricePositionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pricePositionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Alerts - Clickable */}
      {quality && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Veri Kalitesi Uyarilari</span>
              <Link to="/quality" className="text-sm text-primary-600 hover:text-primary-700 font-normal flex items-center gap-1">
                Detay <ExternalLink className="w-3 h-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <Link to="/quality" className="rounded-lg bg-red-50 p-4 text-center hover:bg-red-100 transition-colors cursor-pointer">
                <p className="text-2xl font-bold text-red-600">{quality.priceAnomalies}</p>
                <p className="text-sm text-red-700">Fiyat Anomalisi</p>
              </Link>
              <Link to="/quality" className="rounded-lg bg-yellow-50 p-4 text-center hover:bg-yellow-100 transition-colors cursor-pointer">
                <p className="text-2xl font-bold text-yellow-600">{quality.missingImages}</p>
                <p className="text-sm text-yellow-700">Gorsel Eksik</p>
              </Link>
              <Link to="/quality" className="rounded-lg bg-orange-50 p-4 text-center hover:bg-orange-100 transition-colors cursor-pointer">
                <p className="text-2xl font-bold text-orange-600">{quality.missingDescriptions}</p>
                <p className="text-sm text-orange-700">Aciklama Eksik</p>
              </Link>
              <Link to="/quality" className="rounded-lg bg-purple-50 p-4 text-center hover:bg-purple-100 transition-colors cursor-pointer">
                <p className="text-2xl font-bold text-purple-600">{quality.zeroMargin}</p>
                <p className="text-sm text-purple-700">Sifir/Negatif Marj</p>
              </Link>
              <Link to="/purchasing" className="rounded-lg bg-red-50 p-4 text-center hover:bg-red-100 transition-colors cursor-pointer">
                <p className="text-2xl font-bold text-red-600">{quality.activeOutOfStock}</p>
                <p className="text-sm text-red-700">Aktif & Stoksuz</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
