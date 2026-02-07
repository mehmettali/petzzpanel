import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
})

// Request interceptor - add timing
api.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: Date.now() }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - log slow requests & handle errors
api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime
    if (duration > 2000) {
      console.warn(`Slow API call: ${response.config.url} took ${duration}ms`)
    }
    return response
  },
  (error) => {
    const message = error.response?.data?.error || error.message || 'API error'
    console.error(`API Error: ${error.config?.url} - ${message}`)
    return Promise.reject(error)
  }
)

// Products
export const getProducts = (params) => api.get('/products', { params }).then(res => res.data)
export const getProduct = (id) => api.get(`/products/${id}`).then(res => res.data)
export const getProductStats = () => api.get('/products/stats').then(res => res.data)
export const getCategories = () => api.get('/products/categories').then(res => res.data)
export const getBrands = () => api.get('/products/brands').then(res => res.data)
export const getSuppliers = () => api.get('/products/suppliers').then(res => res.data)
export const getUnifiedProducts = (params) => api.get('/products/unified', { params }).then(res => res.data)

// Analytics
export const getDashboard = () => api.get('/analytics/dashboard').then(res => res.data)
export const getPricingAnalytics = () => api.get('/analytics/pricing').then(res => res.data)
export const getCategoryAnalytics = () => api.get('/analytics/categories').then(res => res.data)
export const getCompetitorAnalytics = () => api.get('/analytics/competitors').then(res => res.data)
export const getSupplierAnalytics = () => api.get('/analytics/suppliers').then(res => res.data)
export const getStockAnalytics = () => api.get('/analytics/stock').then(res => res.data)

// Quality
export const getQualitySummary = () => api.get('/quality/summary').then(res => res.data)
export const getPriceAnomalies = () => api.get('/quality/price-anomalies').then(res => res.data)
export const getMissingImages = () => api.get('/quality/missing-images').then(res => res.data)
export const getMissingDescriptions = () => api.get('/quality/missing-descriptions').then(res => res.data)
export const getWrongCategories = () => api.get('/quality/wrong-categories').then(res => res.data)
export const getZeroMargin = () => api.get('/quality/zero-margin').then(res => res.data)

// Sync
export const getSyncStatus = () => api.get('/sync/status').then(res => res.data)
export const startSync = () => api.post('/sync/start').then(res => res.data)
export const getSyncLogs = () => api.get('/sync/logs').then(res => res.data)

// Purchasing (Legacy)
export const getPurchasingSummary = () => api.get('/purchasing/summary').then(res => res.data)
export const getReorderList = (params) => api.get('/purchasing/reorder', { params }).then(res => res.data)
export const getCriticalStock = (params) => api.get('/purchasing/critical', { params }).then(res => res.data)
export const getDeadStock = (params) => api.get('/purchasing/dead-stock', { params }).then(res => res.data)
export const getSupplierOrders = () => api.get('/purchasing/suppliers').then(res => res.data)

// Purchasing (Advanced)
export const getAdvancedPurchasingSummary = () => api.get('/purchasing/advanced-summary').then(res => res.data)
export const getSmartReorderList = (params) => api.get('/purchasing/smart-reorder', { params }).then(res => res.data)
export const getSupplierPerformance = () => api.get('/purchasing/supplier-performance').then(res => res.data)
export const getFastMovers = (params) => api.get('/purchasing/fast-movers', { params }).then(res => res.data)
export const getSlowMovers = (params) => api.get('/purchasing/slow-movers', { params }).then(res => res.data)
export const getCategoryTurnover = () => api.get('/purchasing/category-turnover').then(res => res.data)

// Purchasing Decision Engine (Satın Alma Karar Motoru)
export const getPurchasingDecisionEngine = (params) => api.get('/purchasing/decision-engine', { params }).then(res => res.data)
export const getPurchasingFilterOptions = () => api.get('/purchasing/filter-options').then(res => res.data)

// Purchasing Strategy (Satın Alma Stratejileri)
export const getStrategyTemplates = () => api.get('/purchasing/strategy/templates').then(res => res.data)
export const generatePurchasingStrategy = (params) => api.get('/purchasing/strategy/generate', { params }).then(res => res.data)

// Petzz Sipariş Önerisi (15 Günlük Hedef Stok)
export const getPetzzOrderRecommendations = (params) => api.get('/purchasing/order-recommendations', { params }).then(res => res.data)

// Detective (Data Quality)
export const getDetectiveSummary = () => api.get('/detective/summary').then(res => res.data)
export const getDetectiveProducts = (params) => api.get('/detective/products', { params }).then(res => res.data)
export const getDetectiveProductDetail = (id) => api.get(`/detective/product/${id}`).then(res => res.data)
export const getDetectiveIssueTypes = () => api.get('/detective/issue-types').then(res => res.data)

// Storefront (ikas integration)
export const startStorefrontSync = () => api.get('/storefront/sync').then(res => res.data)
export const quickSyncStorefront = () => api.get('/storefront/sync/quick').then(res => res.data)
export const getStorefrontStatus = () => api.get('/storefront/status').then(res => res.data)
export const getStorefrontProducts = (params) => api.get('/storefront/products', { params }).then(res => res.data)
export const getStorefrontProduct = (sku) => api.get(`/storefront/product/${sku}`).then(res => res.data)
export const getStorefrontUnmatched = (params) => api.get('/storefront/unmatched', { params }).then(res => res.data)
export const getStorefrontTags = () => api.get('/storefront/tags').then(res => res.data)
export const addStorefrontTag = (data) => api.post('/storefront/tag', data).then(res => res.data)
export const removeStorefrontTag = (data) => api.delete('/storefront/tag', { data }).then(res => res.data)
export const getStorefrontFilters = () => api.get('/storefront/filters').then(res => res.data)
export const getStorefrontAnalytics = () => api.get('/storefront/analytics').then(res => res.data)

// Storefront Bundles (Paket İlişkileri)
export const detectBundles = () => api.post('/storefront/bundles/detect').then(res => res.data)
export const getBundles = (params) => api.get('/storefront/bundles', { params }).then(res => res.data)
export const getBundleStats = () => api.get('/storefront/bundles/stats').then(res => res.data)
export const getBundlesByBaseSku = (baseSku) => api.get(`/storefront/bundles/${baseSku}`).then(res => res.data)

// Data Center
export const getDataCenterDashboard = () => api.get('/datacenter/dashboard').then(res => res.data)
export const runFullAnalysis = () => api.post('/datacenter/analyze').then(res => res.data)

// Data Center - Kategori Önerileri
export const analyzeCategories = () => api.post('/datacenter/categories/analyze').then(res => res.data)
export const getCategorySuggestions = (params) => api.get('/datacenter/categories/suggestions', { params }).then(res => res.data)
export const updateCategorySuggestion = (id, data) => api.put(`/datacenter/categories/suggestions/${id}`, data).then(res => res.data)
export const bulkApproveSuggestions = (data) => api.post('/datacenter/categories/suggestions/bulk-approve', data).then(res => res.data)

// Data Center - Kalite Sorunları
export const detectQualityIssues = () => api.post('/datacenter/quality/detect').then(res => res.data)
export const getQualityIssuesList = (params) => api.get('/datacenter/quality/issues', { params }).then(res => res.data)
export const getQualityIssueSummary = () => api.get('/datacenter/quality/summary').then(res => res.data)

// Data Center - Görevler
export const generateTasks = () => api.post('/datacenter/tasks/generate').then(res => res.data)
export const getTasksList = (params) => api.get('/datacenter/tasks', { params }).then(res => res.data)
export const getTasksSummary = () => api.get('/datacenter/tasks/summary').then(res => res.data)
export const assignTask = (id, data) => api.put(`/datacenter/tasks/${id}/assign`, data).then(res => res.data)
export const completeTask = (id, data) => api.put(`/datacenter/tasks/${id}/complete`, data).then(res => res.data)

// Data Center - Ürün Özellikleri
export const getProductAttributes = (sku) => api.get(`/datacenter/attributes/${sku}`).then(res => res.data)
export const setProductAttribute = (sku, data) => api.post(`/datacenter/attributes/${sku}`, data).then(res => res.data)
export const getAttributesBulk = (skus) => api.post('/datacenter/attributes/bulk', { skus }).then(res => res.data)

// Data Center - Changelog
export const getChangelog = (params) => api.get('/datacenter/changelog', { params }).then(res => res.data)

// Data Center - Veri Tutarlılığı
export const getDataIntegrity = () => api.get('/datacenter/integrity').then(res => res.data)
export const cleanOrphanRecords = (dryRun = true) => api.post('/datacenter/integrity/clean', { dryRun }).then(res => res.data)
export const getSupplierHealth = () => api.get('/datacenter/integrity/supplier-health').then(res => res.data)
export const getStorefrontNegative = () => api.get('/datacenter/integrity/storefront-negative').then(res => res.data)
export const syncPrices = (dryRun = true) => api.post('/datacenter/integrity/sync-prices', { dryRun }).then(res => res.data)

// Data Sources (Veri Kaynakları Yönetimi)
export const getDataSourcesStatus = () => api.get('/datasources/status').then(res => res.data)
export const getSyncProgress = (sourceId) => api.get(`/datasources/progress/${sourceId}`).then(res => res.data)
export const getAllSyncProgress = () => api.get('/datasources/progress').then(res => res.data)
export const startSourceSync = (sourceId) => api.post(`/datasources/sync/${sourceId}`).then(res => res.data)
export const checkSourceConnection = (sourceId) => api.get(`/datasources/check/${sourceId}`).then(res => res.data)

// Categories - Google Taxonomy
export const importGoogleTaxonomy = () => api.post('/categories/import-taxonomy').then(res => res.data)
export const autoMapCategories = () => api.post('/categories/auto-map').then(res => res.data)
export const updateCategoryStats = () => api.post('/categories/update-stats').then(res => res.data)
export const getCategoryDashboard = () => api.get('/categories/dashboard').then(res => res.data)
export const getCategoryTree = (parentId) => api.get('/categories/tree', { params: { parentId } }).then(res => res.data)
export const getAllGoogleCategories = () => api.get('/categories/all').then(res => res.data)
export const getCategoryStockSummary = () => api.get('/categories/stock-summary').then(res => res.data)
export const getUnmappedCategoryProducts = (params) => api.get('/categories/unmapped', { params }).then(res => res.data)
export const getCategoryDetail = (id) => api.get(`/categories/${id}`).then(res => res.data)
export const mapProductCategory = (data) => api.post('/categories/map', data).then(res => res.data)
export const bulkMapProductCategories = (data) => api.post('/categories/bulk-map', data).then(res => res.data)

export default api
