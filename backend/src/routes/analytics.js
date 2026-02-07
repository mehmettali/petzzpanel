import { Router } from 'express';
import analyticsService from '../services/analytics.service.js';

const router = Router();

// GET /api/analytics/dashboard - Dashboard summary
router.get('/dashboard', (req, res) => {
  try {
    const summary = analyticsService.getDashboardSummary();
    res.json(summary);
  } catch (error) {
    console.error('Error getting dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/pricing - Pricing analytics
router.get('/pricing', (req, res) => {
  try {
    const analytics = analyticsService.getPricingAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error getting pricing analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/categories - Category analytics
router.get('/categories', (req, res) => {
  try {
    const analytics = analyticsService.getCategoryAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error getting category analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/competitors - Competitor analytics
router.get('/competitors', (req, res) => {
  try {
    const analytics = analyticsService.getCompetitorAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error getting competitor analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/suppliers - Supplier analytics
router.get('/suppliers', (req, res) => {
  try {
    const analytics = analyticsService.getSupplierAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error getting supplier analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/stock - Stock analytics
router.get('/stock', (req, res) => {
  try {
    const analytics = analyticsService.getStockAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error getting stock analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
