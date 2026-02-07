import { Router } from 'express';
import qualityService from '../services/quality.service.js';

const router = Router();

// GET /api/quality/summary - Quality summary
router.get('/summary', (req, res) => {
  try {
    const summary = qualityService.getQualitySummary();
    res.json(summary);
  } catch (error) {
    console.error('Error getting quality summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/quality/price-anomalies - Products with buying > selling price
router.get('/price-anomalies', (req, res) => {
  try {
    const products = qualityService.getPriceAnomalies();
    res.json(products);
  } catch (error) {
    console.error('Error getting price anomalies:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/quality/missing-images - Products without images
router.get('/missing-images', (req, res) => {
  try {
    const products = qualityService.getMissingImages();
    res.json(products);
  } catch (error) {
    console.error('Error getting missing images:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/quality/missing-descriptions - Products without descriptions
router.get('/missing-descriptions', (req, res) => {
  try {
    const products = qualityService.getMissingDescriptions();
    res.json(products);
  } catch (error) {
    console.error('Error getting missing descriptions:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/quality/missing-barcodes - Products without barcodes
router.get('/missing-barcodes', (req, res) => {
  try {
    const products = qualityService.getMissingBarcodes();
    res.json(products);
  } catch (error) {
    console.error('Error getting missing barcodes:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/quality/duplicates - Potential duplicate products
router.get('/duplicates', (req, res) => {
  try {
    const products = qualityService.getPotentialDuplicates();
    res.json(products);
  } catch (error) {
    console.error('Error getting duplicates:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/quality/wrong-categories - Products possibly in wrong category
router.get('/wrong-categories', (req, res) => {
  try {
    const products = qualityService.getWrongCategoryProducts();
    res.json(products);
  } catch (error) {
    console.error('Error getting wrong categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/quality/akakce-mismatches - Akakce mismatched products
router.get('/akakce-mismatches', (req, res) => {
  try {
    const products = qualityService.getAkakceMismatches();
    res.json(products);
  } catch (error) {
    console.error('Error getting Akakce mismatches:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/quality/zero-margin - Products with zero or negative margin
router.get('/zero-margin', (req, res) => {
  try {
    const products = qualityService.getZeroMarginProducts();
    res.json(products);
  } catch (error) {
    console.error('Error getting zero margin products:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/quality/suspicious-vat - Products with suspicious VAT rates
router.get('/suspicious-vat', (req, res) => {
  try {
    const products = qualityService.getSuspiciousVatProducts();
    res.json(products);
  } catch (error) {
    console.error('Error getting suspicious VAT products:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
