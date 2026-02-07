import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import UnifiedProducts from './pages/UnifiedProducts'
import Storefront from './pages/Storefront'
import Bundles from './pages/Bundles'
import DataCenter from './pages/DataCenter'
import Pricing from './pages/Pricing'
import Categories from './pages/Categories'
import CategoryBuilder from './pages/CategoryBuilder'
import CategoryProductMapping from './pages/CategoryProductMapping'
import DataQuality from './pages/DataQuality'
import DataHealth from './pages/DataHealth'
import DataDetective from './pages/DataDetective'
import Purchasing from './pages/Purchasing'
import Competitors from './pages/Competitors'
import Settings from './pages/Settings'
import Shop from './pages/Shop'
import Shop2 from './pages/Shop2'
import Shop3 from './pages/Shop3'
import ProductDetail from './pages/ProductDetail'
import CategoryPage from './pages/CategoryPage'
import ShopHome from './pages/ShopHome'
import CartPage from './pages/CartPage'
import FavoritesPage from './pages/FavoritesPage'

function App() {
  return (
    <Routes>
      {/* E-Commerce Frontend - Petzzshop */}
      <Route path="/vitrin" element={<ShopHome />} />
      <Route path="/sepet" element={<CartPage />} />
      <Route path="/favoriler" element={<FavoritesPage />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/shop2" element={<Shop2 />} />
      <Route path="/shop3" element={<Shop3 />} />
      <Route path="/product/:slug" element={<ProductDetail />} />
      <Route path="/kategori/:slug" element={<CategoryPage />} />
      <Route path="/kategori" element={<CategoryPage />} />

      {/* Admin panel routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="unified-products" element={<UnifiedProducts />} />
        <Route path="storefront" element={<Storefront />} />
        <Route path="bundles" element={<Bundles />} />
        <Route path="datacenter" element={<DataCenter />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="categories" element={<Categories />} />
        <Route path="category-builder" element={<CategoryBuilder />} />
        <Route path="category-mapping" element={<CategoryProductMapping />} />
        <Route path="quality" element={<DataQuality />} />
        <Route path="data-health" element={<DataHealth />} />
        <Route path="detective" element={<DataDetective />} />
        <Route path="purchasing" element={<Purchasing />} />
        <Route path="competitors" element={<Competitors />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
