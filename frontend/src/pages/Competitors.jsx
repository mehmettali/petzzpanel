import { useQuery } from '@tanstack/react-query'
import { Users, Trophy, TrendingDown, Target, Store, ShoppingBag } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getCompetitorAnalytics } from '../services/api'
import { queryKeys, staleTimes } from '../services/queryKeys'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import { LoadingState } from '../components/ui/Spinner'
import { formatCurrency, formatNumber, truncate } from '../utils/formatters'

export default function Competitors() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.analytics.competitors,
    queryFn: getCompetitorAnalytics,
    staleTime: staleTimes.dashboard,
  })

  if (isLoading) return <LoadingState message="Rakip analizi yukleniyor..." />

  const { topCompetitors, mostCompetitive, winningCount, losingCount } = data || {}

  const chartData = topCompetitors?.slice(0, 10).map(c => ({
    name: c.seller_name?.substring(0, 15) || 'Diger',
    urunSayisi: c.product_count,
    birincilik: c.first_place_count,
  })) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rakip Analizi</h1>
        <p className="text-gray-500">Rakip saticilar ve pazar pozisyonu</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Kazandigimiz Urunler"
          value={formatNumber(winningCount)}
          icon={Trophy}
          valueClassName="text-green-600"
        />
        <StatCard
          title="Kaybettigimiz Urunler"
          value={formatNumber(losingCount)}
          icon={TrendingDown}
          valueClassName="text-red-600"
        />
        <StatCard
          title="Toplam Rakip"
          value={formatNumber(topCompetitors?.length)}
          icon={Users}
        />
        <StatCard
          title="En Rekabetci"
          value={mostCompetitive?.[0]?.competitor_count || 0}
          icon={Target}
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>En Aktif Rakipler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="urunSayisi" name="Urun Sayisi" fill="#636ef1" radius={[0, 4, 4, 0]} />
                <Bar dataKey="birincilik" name="1. Sirada" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Competitors Table */}
        <Card>
          <CardHeader>
            <CardTitle>Rakip Listesi</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Satici</th>
                    <th className="px-4 py-2 text-right">Urun</th>
                    <th className="px-4 py-2 text-right">1. Sirada</th>
                    <th className="px-4 py-2 text-right">Ort. Fiyat</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {topCompetitors?.map((competitor, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{truncate(competitor.seller_name, 25)}</td>
                      <td className="px-4 py-2 text-right">{formatNumber(competitor.product_count)}</td>
                      <td className="px-4 py-2 text-right">
                        <Badge variant="success">{competitor.first_place_count}</Badge>
                      </td>
                      <td className="px-4 py-2 text-right font-mono">{formatCurrency(competitor.avg_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Most Competitive Products */}
        <Card>
          <CardHeader>
            <CardTitle>En Cok Rekabet Edilen Urunler</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Urun</th>
                    <th className="px-4 py-2 text-right">Bizim</th>
                    <th className="px-4 py-2 text-right">En Dusuk</th>
                    <th className="px-4 py-2 text-center">Rakip</th>
                    <th className="px-4 py-2 text-center">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mostCompetitive?.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <p className="font-medium">{truncate(product.name, 25)}</p>
                        <p className="text-xs text-gray-500">{product.brand}</p>
                      </td>
                      <td className="px-4 py-2 text-right font-mono">{formatCurrency(product.selling_price)}</td>
                      <td className="px-4 py-2 text-right font-mono text-green-600">
                        {formatCurrency(product.akakce_low_price)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Badge variant="info">{product.competitor_count}</Badge>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center gap-1">
                          {product.petzzshop_url ? (
                            <a href={product.petzzshop_url} target="_blank" rel="noopener noreferrer"
                              className="p-1 rounded bg-primary-50 text-primary-600 hover:bg-primary-100" title="PetzzShop">
                              <Store className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="p-1 rounded bg-gray-50 text-gray-300"><Store className="w-3.5 h-3.5" /></span>
                          )}
                          {product.akakce_url ? (
                            <a href={product.akakce_url} target="_blank" rel="noopener noreferrer"
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
