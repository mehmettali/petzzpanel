import { Router } from 'express';
import datacenterService from '../services/datacenter.service.js';

const router = Router();

// ═══════════════════════════════════════════════════════════════════════════
// DATA CENTER API ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/datacenter/dashboard - Data Center dashboard
router.get('/dashboard', (req, res) => {
  try {
    const dashboard = datacenterService.getDataCenterDashboard();
    res.json(dashboard);
  } catch (error) {
    console.error('Error getting data center dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/datacenter/analyze - Tam analiz çalıştır (arka planda)
router.post('/analyze', async (req, res) => {
  try {
    // Hemen yanıt ver, analiz arka planda çalışsın
    res.json({
      message: 'Analiz başlatıldı',
      status: 'running',
      startedAt: new Date().toISOString()
    });

    // Arka planda analiz çalıştır
    setImmediate(async () => {
      try {
        const results = await datacenterService.runFullAnalysis();
        console.log('Full analysis completed:', results);
      } catch (error) {
        console.error('Full analysis failed:', error);
      }
    });
  } catch (error) {
    console.error('Error starting analysis:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// KATEGORİ ÖNERİLERİ
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/datacenter/categories/analyze - Kategori analizi başlat
router.post('/categories/analyze', (req, res) => {
  try {
    const results = datacenterService.analyzeCategories();
    res.json(results);
  } catch (error) {
    console.error('Error analyzing categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/datacenter/categories/suggestions - Kategori önerileri listesi
router.get('/categories/suggestions', (req, res) => {
  try {
    const { status, categoryType, page = 1, limit = 50 } = req.query;
    const result = datacenterService.getCategorySuggestions({
      status,
      categoryType,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting category suggestions:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/datacenter/categories/suggestions/:id - Öneri onayla/reddet
router.put('/categories/suggestions/:id', (req, res) => {
  try {
    const { status, reviewedBy } = req.body;
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be approved or rejected.' });
    }
    const result = datacenterService.updateCategorySuggestion(
      parseInt(req.params.id),
      status,
      reviewedBy || 'system'
    );
    res.json(result);
  } catch (error) {
    console.error('Error updating category suggestion:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/datacenter/categories/suggestions/bulk-approve - Toplu onay
router.post('/categories/suggestions/bulk-approve', (req, res) => {
  try {
    const { ids, reviewedBy } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'ids array is required' });
    }
    const result = datacenterService.bulkApproveSuggestions(ids, reviewedBy || 'system');
    res.json(result);
  } catch (error) {
    console.error('Error bulk approving suggestions:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// KALİTE SORUNLARI
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/datacenter/quality/detect - Kalite sorunlarını tespit et
router.post('/quality/detect', (req, res) => {
  try {
    const results = datacenterService.detectQualityIssues();
    res.json(results);
  } catch (error) {
    console.error('Error detecting quality issues:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/datacenter/quality/issues - Kalite sorunları listesi
router.get('/quality/issues', (req, res) => {
  try {
    const { status, issueType, severity, page = 1, limit = 50 } = req.query;
    const result = datacenterService.getQualityIssues({
      status,
      issueType,
      severity,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting quality issues:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/datacenter/quality/summary - Kalite özeti
router.get('/quality/summary', (req, res) => {
  try {
    const summary = datacenterService.getQualityIssueSummary();
    res.json(summary);
  } catch (error) {
    console.error('Error getting quality summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GÖREVLER
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/datacenter/tasks/generate - Sorunlardan görev oluştur
router.post('/tasks/generate', (req, res) => {
  try {
    const results = datacenterService.createTasksFromIssues();
    res.json(results);
  } catch (error) {
    console.error('Error generating tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/datacenter/tasks - Görev listesi
router.get('/tasks', (req, res) => {
  try {
    const { status, assignedTo, taskType, priority, page = 1, limit = 50 } = req.query;
    const result = datacenterService.getTasks({
      status,
      assignedTo,
      taskType,
      priority,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/datacenter/tasks/summary - Görev özeti
router.get('/tasks/summary', (req, res) => {
  try {
    const summary = datacenterService.getTaskSummary();
    res.json(summary);
  } catch (error) {
    console.error('Error getting task summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/datacenter/tasks/:id/assign - Görev ata
router.put('/tasks/:id/assign', (req, res) => {
  try {
    const { assignedTo } = req.body;
    if (!assignedTo) {
      return res.status(400).json({ error: 'assignedTo is required' });
    }
    const result = datacenterService.assignTask(parseInt(req.params.id), assignedTo);
    res.json(result);
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/datacenter/tasks/:id/complete - Görev tamamla
router.put('/tasks/:id/complete', (req, res) => {
  try {
    const { completedBy, resolution } = req.body;
    const result = datacenterService.completeTask(
      parseInt(req.params.id),
      completedBy || 'system',
      resolution
    );
    res.json(result);
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ÜRÜN ÖZELLİKLERİ
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/datacenter/attributes/:sku - Ürün özellikleri
router.get('/attributes/:sku', (req, res) => {
  try {
    const attributes = datacenterService.getProductAttributes(req.params.sku);
    res.json(attributes);
  } catch (error) {
    console.error('Error getting product attributes:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/datacenter/attributes/:sku - Özellik ekle/güncelle
router.post('/attributes/:sku', (req, res) => {
  try {
    const { group, key, value, valueNumeric, valueUnit, source } = req.body;
    if (!group || !key) {
      return res.status(400).json({ error: 'group and key are required' });
    }
    const result = datacenterService.setProductAttribute(
      req.params.sku,
      group,
      key,
      value,
      { valueNumeric, valueUnit, source }
    );
    res.json(result);
  } catch (error) {
    console.error('Error setting product attribute:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/datacenter/attributes/bulk - Toplu özellik getir
router.post('/attributes/bulk', (req, res) => {
  try {
    const { skus } = req.body;
    if (!skus || !Array.isArray(skus)) {
      return res.status(400).json({ error: 'skus array is required' });
    }
    const attributes = datacenterService.getAttributesBulk(skus);
    res.json(attributes);
  } catch (error) {
    console.error('Error getting bulk attributes:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CHANGELOG
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/datacenter/changelog - Değişiklik geçmişi
router.get('/changelog', (req, res) => {
  try {
    const { entityType, entityId, page = 1, limit = 50 } = req.query;
    const logs = datacenterService.getChangelog({
      entityType,
      entityId,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    res.json(logs);
  } catch (error) {
    console.error('Error getting changelog:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// VERİ TUTARLILIĞI
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/datacenter/integrity - Veri tutarlılığı raporu
router.get('/integrity', (req, res) => {
  try {
    const report = datacenterService.getDataIntegrity();
    res.json(report);
  } catch (error) {
    console.error('Error getting data integrity report:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/datacenter/integrity/clean - Yetim kayıtları temizle
router.post('/integrity/clean', (req, res) => {
  try {
    const { dryRun = true } = req.body;
    const result = datacenterService.cleanOrphanRecords(dryRun);
    res.json(result);
  } catch (error) {
    console.error('Error cleaning orphan records:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/datacenter/integrity/sync-prices - DEVRE DIŞI
// Kaynak verileri değiştirmemeli - tutarsızlıklar UI'da gösterilmeli
router.post('/integrity/sync-prices', (req, res) => {
  res.status(403).json({
    error: 'Bu fonksiyon devre dışı bırakıldı',
    reason: 'Kaynak verileri (Panel/ikas) değiştirilmemeli. Tutarsızlıklar UI\'da uyarı olarak gösterilir.'
  });
});

// GET /api/datacenter/integrity/negative-margin - Negatif marjlı ürünler
router.get('/integrity/negative-margin', (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const products = datacenterService.getNegativeMarginProducts(parseInt(limit));
    res.json(products);
  } catch (error) {
    console.error('Error getting negative margin products:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/datacenter/integrity/unmatched-storefront - Eşleşmemiş SF ürünleri
router.get('/integrity/unmatched-storefront', (req, res) => {
  try {
    const products = datacenterService.getUnmatchedStorefrontProducts();
    res.json({
      total: products.length,
      products: products.slice(0, 100) // İlk 100
    });
  } catch (error) {
    console.error('Error getting unmatched storefront products:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/datacenter/integrity/search-storefront - Storefront ürünlerini ara
router.get('/integrity/search-storefront', (req, res) => {
  try {
    const { q, limit = 100 } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }
    const products = datacenterService.searchStorefrontProducts(q, parseInt(limit));
    res.json({
      query: q,
      total: products.length,
      products
    });
  } catch (error) {
    console.error('Error searching storefront products:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/datacenter/integrity/match-storefront - SF ürünlerini panel ile eşleştir
router.post('/integrity/match-storefront', (req, res) => {
  try {
    const { dryRun = true } = req.body;
    const result = datacenterService.matchStorefrontProducts(dryRun);
    res.json(result);
  } catch (error) {
    console.error('Error matching storefront products:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/datacenter/integrity/supplier-health - Tedarikçi sağlık raporu
router.get('/integrity/supplier-health', (req, res) => {
  try {
    const suppliers = datacenterService.getSupplierHealth();

    // Özet hesapla
    const summary = {
      total: suppliers.length,
      healthy: suppliers.filter(s => s.healthStatus === 'HEALTHY').length,
      warning: suppliers.filter(s => s.healthStatus === 'WARNING').length,
      critical: suppliers.filter(s => s.healthStatus === 'CRITICAL').length
    };

    res.json({ summary, suppliers });
  } catch (error) {
    console.error('Error getting supplier health:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/datacenter/integrity/storefront-negative - Storefront'ta satılan negatif marjlılar (ACİL)
router.get('/integrity/storefront-negative', (req, res) => {
  try {
    const products = datacenterService.getStorefrontNegativeMargin();

    // Özet hesapla
    const summary = {
      total: products.length,
      totalLoss: products.reduce((sum, p) => sum + (p.loss || 0), 0),
      byIssueType: {},
      byBrand: {}
    };

    products.forEach(p => {
      // Issue type
      summary.byIssueType[p.issue_type] = (summary.byIssueType[p.issue_type] || 0) + 1;
      // Brand
      const brand = p.brand || 'Bilinmiyor';
      if (!summary.byBrand[brand]) {
        summary.byBrand[brand] = { count: 0, loss: 0 };
      }
      summary.byBrand[brand].count++;
      summary.byBrand[brand].loss += p.loss || 0;
    });

    res.json({ summary, products });
  } catch (error) {
    console.error('Error getting storefront negative margin:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
