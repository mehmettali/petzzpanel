import { Router } from 'express';
import dataSourcesService from '../services/datasources.service.js';

const router = Router();

// ═══════════════════════════════════════════════════════════════════════════
// VERİ KAYNAKLARI API
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/datasources/status - Tüm kaynakların durumu
router.get('/status', async (req, res) => {
  try {
    const status = await dataSourcesService.getDataSourcesStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting datasources status:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/datasources/progress/:sourceId - Sync ilerleme durumu
router.get('/progress/:sourceId', (req, res) => {
  try {
    const progress = dataSourcesService.getSyncProgress(req.params.sourceId);
    res.json(progress || { active: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/datasources/progress - Tüm sync işlemleri
router.get('/progress', (req, res) => {
  try {
    const progress = dataSourcesService.getSyncProgress();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/datasources/sync/:sourceId - Belirli kaynağı senkronize et
router.post('/sync/:sourceId', async (req, res) => {
  const { sourceId } = req.params;

  try {
    // Sync'i başlat ama bitirmesini bekleme (async)
    res.json({
      success: true,
      message: `${sourceId} senkronizasyonu başlatıldı`,
      sourceId
    });

    // Background'da çalıştır
    dataSourcesService.syncDataSource(sourceId, (progress) => {
      // Progress callback - SSE veya WebSocket ile gönderilebilir
      console.log(`[${sourceId}] Progress:`, progress.percentComplete || 0);
    }).catch(error => {
      console.error(`[${sourceId}] Sync failed:`, error.message);
    });

  } catch (error) {
    console.error('Error starting sync:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/datasources/check/:sourceId - Tek kaynağın bağlantı kontrolü
router.get('/check/:sourceId', async (req, res) => {
  const { sourceId } = req.params;

  try {
    let result;

    switch (sourceId) {
      case 'petzz':
        result = await dataSourcesService.checkPetzzConnection();
        break;
      default:
        // Genel durum kontrolü
        const status = await dataSourcesService.getDataSourcesStatus();
        result = status.sources.find(s => s.id === sourceId);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

export default router;
