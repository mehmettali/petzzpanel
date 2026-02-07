import { useQuery } from '@tanstack/react-query'
import { DollarSign, TrendingUp, TrendingDown, Target, Store, ShoppingBag } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getPricingAnalytics } from '../services/api'
import { queryKeys, staleTimes } from '../services/queryKeys'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import { LoadingState } from '../components/ui/Spinner'
import { formatCurrency, truncate } from '../utils/formatters'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Pricing() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.analytics.pricing,
    queryFn: getPricingAnalytics,
    staleTime: staleTimes.dashboard,
  })

  if (isLoading) return <LoadingState message="Fiyat analizi yukleniyor..." />

  const { pricePosition, marginDistribution, topProfit, winnable } = data || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fiyatlandirma</h1>
        <p className="text-gray-500">Fiyat ve marj analizleri</p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Price Position Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Fiyat Pozisyonu Dagilimi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pricePosition?.filter(p => p.position !== 'no_data') || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="position"
                    label={({ position, count }) => `${position}: ${count}`}
                  >
                    {pricePosition?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Margin Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Marj Dagilimi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marginDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="margin_band" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="Urun Sayisi" fill="#636ef1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Profit Products */}
        <Card>
          <CardHeader>
            <CardTitle>En Karli Urunler</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Urun</th>
                    <th className="px-4 py-2 text-right">Kar</th>
                    <th className="px-4 py-2 text-right">Marj</th>
                    <th className="px-4 py-2 text-center">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {topProfit?.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <p className="font-medium">{truncate(item.name, 30)}</p>
                        <p className="text-xs text-gray-500">{item.brand}</p>
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-green-600">
                        {formatCurrency(item.profit)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Badge variant="success">%{item.margin_percent}</Badge>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center gap-1">
                          {item.petzzshop_url ? (
                            <a href={item.petzzshop_url} target="_blank" rel="noopener noreferrer"
                              className="p-1 rounded bg-primary-50 text-primary-600 hover:bg-primary-100" title="PetzzShop">
                              <Store className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="p-1 rounded bg-gray-50 text-gray-300"><Store className="w-3.5 h-3.5" /></span>
                          )}
                          {item.akakce_url ? (
                            <a href={item.akakce_url} target="_blank" rel="noopener noreferrer"
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
            </div>
          </CardContent>
        </Card>

        {/* Winnable Products */}
        <Card>
          <CardHeader>
            <CardTitle>Kazanilabilir Urunler (Kucuk indirimle 1. olunabilir)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Urun</th>
                    <th className="px-4 py-2 text-right">Bizim Fiyat</th>
                    <th className="px-4 py-2 text-right">En Dusuk</th>
                    <th className="px-4 py-2 text-right">Fark</th>
                    <th className="px-4 py-2 text-center">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {winnable?.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <p className="font-medium">{truncate(item.name, 25)}</p>
                        <p className="text-xs text-gray-500">{item.brand}</p>
                      </td>
                      <td className="px-4 py-2 text-right font-mono">
                        {formatCurrency(item.selling_price)}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-green-600">
                        {formatCurrency(item.akakce_low_price)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Badge variant="warning">%{item.diff_percent}</Badge>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center gap-1">
                          {item.petzzshop_url ? (
                            <a href={item.petzzshop_url} target="_blank" rel="noopener noreferrer"
                              className="p-1 rounded bg-primary-50 text-primary-600 hover:bg-primary-100" title="PetzzShop">
                              <Store className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="p-1 rounded bg-gray-50 text-gray-300"><Store className="w-3.5 h-3.5" /></span>
                          )}
                          {item.akakce_url ? (
                            <a href={item.akakce_url} target="_blank" rel="noopener noreferrer"
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
