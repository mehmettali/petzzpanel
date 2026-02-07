import { Router } from 'express';
import purchasingService from '../services/purchasing.service.js';

const router = Router();

// ═══════════════════════════════════════════════════════════════════════════
// SATIN ALMA KARAR MOTORU (Decision Engine)
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/purchasing/decision-engine - Karar Motoru Ana API
router.get('/decision-engine', (req, res) => {
  try {
    const { supplier, category, brand, minScore = 0, action, stockStatus = 'low', limit = 300 } = req.query;
    const result = purchasingService.getPurchasingDecisionEngine({
      supplier,
      category,
      brand,
      minScore: parseInt(minScore),
      action: action || null,
      stockStatus,
      limit: parseInt(limit)
    });
    res.json(result);
  } catch (error) {
    console.error('Error in decision engine:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/purchasing/filter-options - Filtre seçenekleri (markalar, tedarikçiler, kategoriler)
router.get('/filter-options', (req, res) => {
  try {
    const options = purchasingService.getPurchasingFilterOptions();
    res.json(options);
  } catch (error) {
    console.error('Error getting filter options:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SATIN ALMA STRATEJİLERİ
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/purchasing/strategy/templates - Strateji şablonlarını getir
router.get('/strategy/templates', (req, res) => {
  try {
    const templates = purchasingService.getStrategyTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Error getting strategy templates:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/purchasing/strategy/generate - Satın alma stratejisi oluştur
router.get('/strategy/generate', (req, res) => {
  try {
    const { templateId = 'weekly_90day', supplier, category, brand, limit = 500 } = req.query;
    const strategy = purchasingService.generatePurchasingStrategy({
      templateId,
      supplier: supplier || null,
      category: category || null,
      brand: brand || null,
      limit: parseInt(limit)
    });
    res.json(strategy);
  } catch (error) {
    console.error('Error generating strategy:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// PETZZ SİPARİŞ ÖNERİSİ (15 Günlük Hedef Stok Bazlı)
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/purchasing/order-recommendations - Petzz sipariş önerisi
router.get('/order-recommendations', (req, res) => {
  try {
    const { supplier, category, brand, minOrderValue = 0, limit = 1000 } = req.query;
    const result = purchasingService.getPetzzOrderRecommendations({
      supplier: supplier || null,
      category: category || null,
      brand: brand || null,
      minOrderValue: parseFloat(minOrderValue),
      limit: parseInt(limit)
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting order recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// GELİŞMİŞ SATIN ALMA API'LERİ
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/purchasing/advanced-summary - Gelişmiş satın alma özeti
router.get('/advanced-summary', (req, res) => {
  try {
    const summary = purchasingService.getAdvancedPurchasingSummary();
    res.json(summary);
  } catch (error) {
    console.error('Error getting advanced summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/purchasing/smart-reorder - Akıllı sipariş listesi (öncelik skorlu)
router.get('/smart-reorder', (req, res) => {
  try {
    const { supplier, category, minScore = 0, limit = 200 } = req.query;
    const products = purchasingService.getSmartReorderList({
      supplier,
      category,
      minScore: parseInt(minScore),
      limit: parseInt(limit)
    });
    res.json(products);
  } catch (error) {
    console.error('Error getting smart reorder list:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/purchasing/supplier-performance - Tedarikçi performans analizi
router.get('/supplier-performance', (req, res) => {
  try {
    const suppliers = purchasingService.getSupplierPerformance();
    res.json(suppliers);
  } catch (error) {
    console.error('Error getting supplier performance:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/purchasing/fast-movers - Hızlı hareket eden ürünler
router.get('/fast-movers', (req, res) => {
  try {
    const { limit = 50, minSalesRate = 0.5 } = req.query;
    const products = purchasingService.getFastMovers({
      limit: parseInt(limit),
      minSalesRate: parseFloat(minSalesRate)
    });
    res.json(products);
  } catch (error) {
    console.error('Error getting fast movers:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/purchasing/slow-movers - Yavaş hareket eden ürünler
router.get('/slow-movers', (req, res) => {
  try {
    const { limit = 50, minStock = 20 } = req.query;
    const products = purchasingService.getSlowMovers({
      limit: parseInt(limit),
      minStock: parseInt(minStock)
    });
    res.json(products);
  } catch (error) {
    console.error('Error getting slow movers:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/purchasing/category-turnover - Kategori bazlı stok devir analizi
router.get('/category-turnover', (req, res) => {
  try {
    const analysis = purchasingService.getCategoryTurnoverAnalysis();
    res.json(analysis);
  } catch (error) {
    console.error('Error getting category turnover:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// LEGACY API'LER (Geriye uyumluluk)
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/purchasing/summary - Purchasing summary
router.get('/summary', (req, res) => {
  try {
    const summary = purchasingService.getPurchasingSummary();
    res.json(summary);
  } catch (error) {
    console.error('Error getting purchasing summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/purchasing/reorder - Reorder list
router.get('/reorder', (req, res) => {
  try {
    const { supplier, category, minValue } = req.query;
    const products = purchasingService.getReorderList({
      supplier,
      category,
      minValue: minValue ? parseFloat(minValue) : 0
    });
    res.json(products);
  } catch (error) {
    console.error('Error getting reorder list:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/purchasing/critical - Critical stock items
router.get('/critical', (req, res) => {
  try {
    const { threshold = 5 } = req.query;
    const products = purchasingService.getCriticalStock({
      threshold: parseInt(threshold)
    });
    res.json(products);
  } catch (error) {
    console.error('Error getting critical stock:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/purchasing/dead-stock - Dead stock items
router.get('/dead-stock', (req, res) => {
  try {
    const { minQuantity = 50 } = req.query;
    const products = purchasingService.getDeadStock({
      minQuantity: parseInt(minQuantity)
    });
    res.json(products);
  } catch (error) {
    console.error('Error getting dead stock:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/purchasing/suppliers - Supplier order summary
router.get('/suppliers', (req, res) => {
  try {
    const suppliers = purchasingService.getSupplierOrderSummary();
    res.json(suppliers);
  } catch (error) {
    console.error('Error getting supplier summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/purchasing/suppliers/:name - Order by specific supplier
router.get('/suppliers/:name', (req, res) => {
  try {
    const products = purchasingService.getOrderBySupplier(req.params.name);
    res.json(products);
  } catch (error) {
    console.error('Error getting supplier order:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/purchasing/inventory/suppliers - Inventory by supplier
router.get('/inventory/suppliers', (req, res) => {
  try {
    const inventory = purchasingService.getInventoryBySupplier();
    res.json(inventory);
  } catch (error) {
    console.error('Error getting inventory by supplier:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/purchasing/inventory/categories - Inventory by category
router.get('/inventory/categories', (req, res) => {
  try {
    const inventory = purchasingService.getInventoryByCategory();
    res.json(inventory);
  } catch (error) {
    console.error('Error getting inventory by category:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/purchasing/debug-analytics - Analytics yapısını kontrol et (DEBUG)
router.get('/debug-analytics', async (req, res) => {
  try {
    const axios = (await import('axios')).default;

    // Token al
    const loginRes = await axios.post(
      `${process.env.PETZZ_API_URL}/api/Users/login`,
      { username: process.env.PETZZ_USERNAME, password: process.env.PETZZ_PASSWORD },
      { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
    );

    const token = loginRes.data?.token;
    if (!token) return res.status(500).json({ error: 'Token alınamadı' });

    // Stoku olan bir ürünü Analytics ile çek
    const productRes = await axios.get(
      `${process.env.PETZZ_API_URL}/odata/HamurlabsProduct?$top=3&$expand=Analytics&$filter=(TotalQuantity gt 5)&$orderby=TotalQuantity desc`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }, timeout: 30000 }
    );

    const products = productRes.data?.value || [];
    res.json({
      message: 'Analytics yapısı',
      productCount: products.length,
      products: products.map(p => ({
        code: p.Code,
        name: p.ProductName,
        stock: p.TotalQuantity,
        analytics: p.Analytics
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
