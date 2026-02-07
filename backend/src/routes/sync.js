import { Router } from 'express';
import { getSyncStatus, startSync } from '../api/sync.js';
import { prepare } from '../db/database.js';

const router = Router();

// GET /api/sync/status - Get current sync status
router.get('/status', (req, res) => {
  try {
    const status = getSyncStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting sync status:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sync/start - Start full sync
router.post('/start', async (req, res) => {
  try {
    // Return immediately, sync runs in background
    res.json({ message: 'Sync started', status: 'running' });

    // Start sync in background
    startSync().catch(error => {
      console.error('Background sync failed:', error);
    });
  } catch (error) {
    console.error('Error starting sync:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sync/logs - Get sync history
router.get('/logs', (req, res) => {
  try {
    const logs = prepare(`
      SELECT * FROM sync_logs
      ORDER BY started_at DESC
      LIMIT 20
    `).all();
    res.json(logs);
  } catch (error) {
    console.error('Error getting sync logs:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
