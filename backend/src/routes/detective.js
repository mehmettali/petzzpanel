import { Router } from 'express';
import detectiveService from '../services/detective.service.js';

const router = Router();

// GET /api/detective/summary - Genel özet ve skor dağılımı
router.get('/summary', (req, res) => {
  try {
    const summary = detectiveService.getSummary();
    res.json(summary);
  } catch (error) {
    console.error('Error getting detective summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/detective/products - Ürün listesi puanlarla
router.get('/products', (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      grade,
      issueType,
      category,
      subCategory,
      brand,
      stockStatus,
      hasImage,
      hasBrand,
      search,
      sortBy = 'score',
      sortOrder = 'asc'
    } = req.query;

    const result = detectiveService.getProducts({
      page: parseInt(page),
      limit: parseInt(limit),
      grade,
      issueType,
      category,
      subCategory,
      brand,
      stockStatus,
      hasImage,
      hasBrand,
      search,
      sortBy,
      sortOrder
    });

    res.json(result);
  } catch (error) {
    console.error('Error getting detective products:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/detective/product/:id - Tek ürün detayı
router.get('/product/:id', (req, res) => {
  try {
    const product = detectiveService.getProductDetail(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error getting product detail:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/detective/issue-types - Sorun tipleri listesi
router.get('/issue-types', (req, res) => {
  try {
    const issueTypes = detectiveService.getIssueTypes();
    res.json(issueTypes);
  } catch (error) {
    console.error('Error getting issue types:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/detective/export - CSV export
router.get('/export', (req, res) => {
  try {
    const data = detectiveService.exportCSV();

    // Convert to CSV
    if (data.length === 0) {
      return res.status(404).json({ error: 'No data to export' });
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(h => {
          const val = row[h]?.toString() || '';
          // Escape quotes and wrap in quotes if contains comma
          if (val.includes(',') || val.includes('"') || val.includes('\n')) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        }).join(',')
      )
    ];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=data-detective-export.csv');
    res.send('\uFEFF' + csvRows.join('\n')); // BOM for Excel UTF-8
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
