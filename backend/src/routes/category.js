import { Router } from 'express';
import categoryService from '../services/category.service.js';

const router = Router();

// ═══════════════════════════════════════════════════════════════════════════
// TAXONOMY IMPORT & MAPPING
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/categories/import-taxonomy - Google Taxonomy'yi içe aktar
router.post('/import-taxonomy', async (req, res) => {
  try {
    res.json({
      message: 'Taxonomy içe aktarma başlatıldı',
      status: 'running',
      startedAt: new Date().toISOString()
    });

    // Arka planda çalıştır
    categoryService.importGoogleTaxonomy()
      .then(result => {
        console.log('Taxonomy import completed:', result);
      })
      .catch(error => {
        console.error('Taxonomy import failed:', error);
      });
  } catch (error) {
    console.error('Error starting taxonomy import:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/categories/auto-map - Otomatik kategori eşleştirme
router.post('/auto-map', async (req, res) => {
  try {
    res.json({
      message: 'Otomatik eşleştirme başlatıldı',
      status: 'running',
      startedAt: new Date().toISOString()
    });

    // Arka planda çalıştır
    categoryService.autoMapProducts()
      .then(result => {
        console.log('Auto mapping completed:', result);
      })
      .catch(error => {
        console.error('Auto mapping failed:', error);
      });
  } catch (error) {
    console.error('Error starting auto mapping:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/categories/update-stats - Kategori istatistiklerini güncelle
router.post('/update-stats', async (req, res) => {
  try {
    await categoryService.updateCategoryStats();
    res.json({ success: true, message: 'İstatistikler güncellendi' });
  } catch (error) {
    console.error('Error updating category stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY QUERIES
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/categories/dashboard - Dashboard özeti
router.get('/dashboard', (req, res) => {
  try {
    const dashboard = categoryService.getCategoryDashboard();
    res.json(dashboard);
  } catch (error) {
    console.error('Error getting category dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/categories/tree - Kategori ağacı
router.get('/tree', (req, res) => {
  try {
    const { parentId } = req.query;
    const tree = categoryService.getCategoryTree(parentId ? parseInt(parentId) : null);
    res.json(tree);
  } catch (error) {
    console.error('Error getting category tree:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/categories/all - Tüm kategoriler
router.get('/all', (req, res) => {
  try {
    const categories = categoryService.getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error getting all categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/categories/stock-summary - Stok özeti
router.get('/stock-summary', (req, res) => {
  try {
    const summary = categoryService.getCategoryStockSummary();
    res.json(summary);
  } catch (error) {
    console.error('Error getting stock summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/categories/unmapped - Eşleşmemiş ürünler
router.get('/unmapped', (req, res) => {
  try {
    const { page = 1, limit = 50, search, category, brand } = req.query;
    const result = categoryService.getUnmappedProducts({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      category,
      brand
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting unmapped products:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/categories/:id - Kategori detayı
router.get('/:id', (req, res) => {
  try {
    const category = categoryService.getCategoryById(parseInt(req.params.id));
    if (!category) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error getting category:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// MAPPING OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/categories/map - Tek ürün eşleştir
router.post('/map', (req, res) => {
  try {
    const { sku, categoryId } = req.body;
    if (!sku || !categoryId) {
      return res.status(400).json({ error: 'SKU ve categoryId gerekli' });
    }
    const result = categoryService.mapProductToCategory(sku, categoryId);
    res.json(result);
  } catch (error) {
    console.error('Error mapping product:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/categories/bulk-map - Toplu eşleştirme
router.post('/bulk-map', (req, res) => {
  try {
    const { skus, categoryId } = req.body;
    if (!skus || !Array.isArray(skus) || !categoryId) {
      return res.status(400).json({ error: 'SKU listesi ve categoryId gerekli' });
    }
    const result = categoryService.bulkMapProducts(skus, categoryId);
    res.json(result);
  } catch (error) {
    console.error('Error bulk mapping products:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
