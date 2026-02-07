// Merkezi Query Key tanımları - tutarlılık ve cache yönetimi için

export const queryKeys = {
  // Products
  products: {
    all: ['products'],
    list: (filters) => ['products', 'list', filters],
    detail: (id) => ['products', 'detail', id],
    stats: ['products', 'stats'],
    categories: ['products', 'categories'],
    brands: ['products', 'brands'],
    suppliers: ['products', 'suppliers'],
  },

  // Analytics
  analytics: {
    dashboard: ['analytics', 'dashboard'],
    pricing: ['analytics', 'pricing'],
    categories: ['analytics', 'categories'],
    competitors: ['competitorAnalytics'],
    suppliers: ['analytics', 'suppliers'],
    stock: ['analytics', 'stock'],
  },

  // Storefront
  storefront: {
    status: ['storefront', 'status'],
    products: (filters) => ['storefront', 'products', filters],
    product: (sku) => ['storefront', 'product', sku],
    unmatched: (filters) => ['storefront', 'unmatched', filters],
    tags: ['storefront', 'tags'],
    filters: ['storefront', 'filters'],
    analytics: ['storefront', 'analytics'],
  },

  // Bundles
  bundles: {
    all: ['bundles'],
    list: (filters) => ['bundles', 'list', filters],
    stats: ['bundles', 'stats'],
    byBaseSku: (baseSku) => ['bundles', 'baseSku', baseSku],
  },

  // Data Center
  dataCenter: {
    dashboard: ['dataCenter', 'dashboard'],
    suggestions: (filters) => ['dataCenter', 'suggestions', filters],
    issues: (filters) => ['dataCenter', 'issues', filters],
    issueSummary: ['dataCenter', 'issueSummary'],
    tasks: (filters) => ['dataCenter', 'tasks', filters],
    taskSummary: ['dataCenter', 'taskSummary'],
    attributes: (sku) => ['dataCenter', 'attributes', sku],
    changelog: (filters) => ['dataCenter', 'changelog', filters],
  },

  // Detective
  detective: {
    summary: ['detective', 'summary'],
    products: (filters) => ['detective', 'products', filters],
    productDetail: (id) => ['detective', 'productDetail', id],
    issueTypes: ['detective', 'issueTypes'],
  },

  // Categories (Google Taxonomy)
  categories: {
    dashboard: ['categories', 'dashboard'],
    tree: (parentId) => ['categories', 'tree', parentId],
    all: ['categories', 'all'],
    stockSummary: ['categories', 'stockSummary'],
    unmapped: (filters) => ['categories', 'unmapped', filters],
    detail: (id) => ['categories', 'detail', id],
  },

  // Quality
  quality: {
    summary: ['quality', 'summary'],
    priceAnomalies: ['quality', 'priceAnomalies'],
    missingImages: ['quality', 'missingImages'],
    missingDescriptions: ['quality', 'missingDescriptions'],
    wrongCategories: ['quality', 'wrongCategories'],
    zeroMargin: ['quality', 'zeroMargin'],
  },

  // Sync
  sync: {
    status: ['sync', 'status'],
    logs: ['sync', 'logs'],
  },

  // Purchasing
  purchasing: {
    summary: ['purchasing', 'summary'],
    reorder: (filters) => ['purchasing', 'reorder', filters],
    critical: (filters) => ['purchasing', 'critical', filters],
    deadStock: (filters) => ['purchasing', 'deadStock', filters],
    suppliers: ['purchasing', 'suppliers'],
  },
}

// Farklı veri türleri için önerilen staleTime değerleri
export const staleTimes = {
  // Çok sık değişmeyen veriler (30 dakika)
  static: 30 * 60 * 1000,

  // Dashboard ve istatistikler (10 dakika)
  dashboard: 10 * 60 * 1000,

  // Listeler (5 dakika - varsayılan)
  list: 5 * 60 * 1000,

  // Detay sayfaları (2 dakika)
  detail: 2 * 60 * 1000,

  // Sık değişen veriler (1 dakika)
  realtime: 1 * 60 * 1000,

  // Anında güncellenmesi gereken (30 saniye)
  instant: 30 * 1000,
}

export default queryKeys
