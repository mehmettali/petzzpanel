import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  DollarSign,
  FolderTree,
  AlertTriangle,
  Activity,
  Search,
  ShoppingCart,
  Users,
  Settings,
  PawPrint,
  Store,
  Database,
  Layers,
  ListTree,
  GitMerge,
  ShoppingBag,
  ExternalLink,
  Combine
} from 'lucide-react'
import clsx from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Ürünler', href: '/products', icon: Package },
  { name: 'Unified Ürünler', href: '/unified-products', icon: Combine },
  { name: 'Vitrin Yönetimi', href: '/storefront', icon: Store },
  { name: 'Paket İlişkileri', href: '/bundles', icon: Layers },
  { name: 'Data Center', href: '/datacenter', icon: Database },
  { name: 'Fiyatlandırma', href: '/pricing', icon: DollarSign },
  { name: 'Kategoriler', href: '/categories', icon: FolderTree },
  { name: 'Kategori Olusturucu', href: '/category-builder', icon: ListTree },
  { name: 'Kategori Eşleştirme', href: '/category-mapping', icon: GitMerge },
  { name: 'Data Dedektifi', href: '/detective', icon: Search },
  { name: 'Veri Kalitesi', href: '/quality', icon: AlertTriangle },
  { name: 'Veri Sagligi', href: '/data-health', icon: Activity },
  { name: 'Satın Alma', href: '/purchasing', icon: ShoppingCart },
  { name: 'Rakipler', href: '/competitors', icon: Users },
  { name: 'Ayarlar', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-800">
        <PawPrint className="h-8 w-8 text-primary-400" />
        <span className="text-xl font-bold text-white">Petzz Panel</span>
      </div>

      {/* Shop Links - Special */}
      <div className="px-3 pt-4 space-y-2">
        <p className="text-xs text-gray-500 px-3 mb-1">Mağaza Önizleme</p>
        <Link
          to="/shop"
          target="_blank"
          className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all"
        >
          <span className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Tasarım 1
          </span>
          <ExternalLink className="h-3 w-3 opacity-70" />
        </Link>
        <Link
          to="/shop2"
          target="_blank"
          className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          <span className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Tasarım 2 (PetSmart)
          </span>
          <ExternalLink className="h-3 w-3 opacity-70" />
        </Link>
        <Link
          to="/shop3"
          target="_blank"
          className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-gradient-to-r from-cyan-500 to-teal-600 text-white hover:from-cyan-600 hover:to-teal-700 transition-all"
        >
          <span className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Tasarım 3 (Petco)
          </span>
          <ExternalLink className="h-3 w-3 opacity-70" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800 p-4">
        <p className="text-xs text-gray-500">Petzz E-Commerce Panel v1.0</p>
      </div>
    </div>
  )
}
