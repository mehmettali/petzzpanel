import { Router } from 'express';
import storefrontService from '../services/storefront.service.js';

const router = Router();

// GET /api/storefront/sync - Start sync process
router.get('/sync', async (req, res) => {
  try {
    // Start sync in background and return immediately
    res.json({
      message: 'Sync started',
      status: 'running',
      startedAt: new Date().toISOString()
    });

    // Run sync in background
    storefrontService.syncStorefrontProducts()
      .then(result => {
        console.log('Storefront sync completed:', result);
      })
      .catch(error => {
        console.error('Storefront sync failed:', error);
      });
  } catch (error) {
    console.error('Error starting sync:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/storefront/sync - Start sync process (alternative)
router.post('/sync', async (req, res) => {
  try {
    const result = await storefrontService.syncStorefrontProducts();
    res.json(result);
  } catch (error) {
    console.error('Error during sync:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/storefront/sync/quick - Quick sync (only prices/stock)
router.get('/sync/quick', async (req, res) => {
  try {
    // Hemen yanıt dön
    res.json({
      message: 'Quick sync başlatıldı',
      status: 'running',
      type: 'quick',
      startedAt: new Date().toISOString()
    });

    // Arka planda çalıştır
    storefrontService.quickSyncPrices()
      .then(result => {
        console.log('Quick sync completed:', result);
      })
      .catch(error => {
        console.error('Quick sync failed:', error);
      });
  } catch (error) {
    console.error('Error starting quick sync:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/storefront/sync/quick - Quick sync (alternative, blocking)
router.post('/sync/quick', async (req, res) => {
  try {
    const result = await storefrontService.quickSyncPrices();
    res.json(result);
  } catch (error) {
    console.error('Error during quick sync:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/storefront/status - Get sync status
router.get('/status', (req, res) => {
  try {
    const status = storefrontService.getSyncStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting sync status:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/storefront/products - List storefront products
router.get('/products', (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      category,
      brand,
      matchStatus,
      stockStatus,
      hasDiscount,
      tag,
      sortBy,
      sortOrder
    } = req.query;

    const result = storefrontService.getStorefrontProducts({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      category,
      brand,
      matchStatus,
      stockStatus,
      hasDiscount,
      tag,
      sortBy,
      sortOrder
    });

    res.json(result);
  } catch (error) {
    console.error('Error getting storefront products:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/storefront/product/:sku - Get single product with comparison
router.get('/product/:sku', (req, res) => {
  try {
    const product = storefrontService.getStorefrontProductBySku(req.params.sku);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error getting storefront product:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/storefront/unmatched - Get unmatched products
router.get('/unmatched', (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const result = storefrontService.getUnmatchedProducts({
      page: parseInt(page),
      limit: parseInt(limit)
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting unmatched products:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/storefront/tags - Get all tags
router.get('/tags', (req, res) => {
  try {
    const tags = storefrontService.getAllTags();
    res.json(tags);
  } catch (error) {
    console.error('Error getting tags:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/storefront/tag - Add tag to product
router.post('/tag', (req, res) => {
  try {
    const { sku, tagType, tagValue } = req.body;
    if (!sku || !tagType || !tagValue) {
      return res.status(400).json({ error: 'Missing required fields: sku, tagType, tagValue' });
    }
    const result = storefrontService.addTag(sku, tagType, tagValue);
    res.json(result);
  } catch (error) {
    console.error('Error adding tag:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/storefront/tag - Remove tag from product
router.delete('/tag', (req, res) => {
  try {
    const { sku, tagType, tagValue } = req.body;
    if (!sku || !tagType || !tagValue) {
      return res.status(400).json({ error: 'Missing required fields: sku, tagType, tagValue' });
    }
    const result = storefrontService.removeTag(sku, tagType, tagValue);
    res.json(result);
  } catch (error) {
    console.error('Error removing tag:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/storefront/filters - Get filter options
router.get('/filters', (req, res) => {
  try {
    const filters = storefrontService.getFilterOptions();
    res.json(filters);
  } catch (error) {
    console.error('Error getting filter options:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/storefront/analytics - Get analytics
router.get('/analytics', (req, res) => {
  try {
    const analytics = storefrontService.getStorefrontAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// BUNDLE (PAKET) ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/storefront/bundles/detect - Bundle ilişkilerini tespit et
router.post('/bundles/detect', async (req, res) => {
  try {
    // Hemen yanıt dön
    res.json({
      message: 'Bundle tespiti başlatıldı',
      status: 'running',
      startedAt: new Date().toISOString()
    });

    // Arka planda çalıştır
    storefrontService.detectAndCreateBundles()
      .then(result => {
        console.log('Bundle detection completed:', result);
      })
      .catch(error => {
        console.error('Bundle detection failed:', error);
      });
  } catch (error) {
    console.error('Error starting bundle detection:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/storefront/bundles - Tüm bundle ilişkilerini getir
router.get('/bundles', (req, res) => {
  try {
    const { page = 1, limit = 50, baseSku, multiplier } = req.query;
    const result = storefrontService.getBundleRelations({
      page: parseInt(page),
      limit: parseInt(limit),
      baseSku,
      multiplier
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting bundle relations:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/storefront/bundles/stats - Bundle istatistikleri
router.get('/bundles/stats', (req, res) => {
  try {
    const stats = storefrontService.getBundleStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting bundle stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/storefront/bundles/:baseSku - Belirli base SKU için bundle'lar
router.get('/bundles/:baseSku', (req, res) => {
  try {
    const result = storefrontService.getBundlesByBaseSku(req.params.baseSku);
    if (!result) {
      return res.status(404).json({ error: 'Base product not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error getting bundles by base SKU:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
