import { Router } from 'express';
import productService from '../services/product.service.js';

const router = Router();

// GET /api/products - List products with pagination and filters
router.get('/', (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      category,
      subCategory,
      brand,
      supplier,
      stockStatus,
      priceStatus,
      hasAkakce,
      hasStorefront,
      sortBy,
      sortOrder
    } = req.query;

    const result = productService.getProducts({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      category,
      subCategory,
      brand,
      supplier,
      stockStatus,
      priceStatus,
      hasAkakce,
      hasStorefront,
      sortBy,
      sortOrder
    });

    res.json(result);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/unified - Unified product view with Single Source of Truth
router.get('/unified', (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      category,
      subCategory,
      brand,
      supplier,
      stockStatus,
      priceStatus,
      hasAkakce,
      hasStorefront,
      sortBy,
      sortOrder,
      inconsistencyFilter,
      petzzRank
    } = req.query;

    const result = productService.getUnifiedProducts({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      category,
      subCategory,
      brand,
      supplier,
      stockStatus,
      priceStatus,
      hasAkakce,
      hasStorefront,
      sortBy,
      sortOrder,
      inconsistencyFilter,
      petzzRank
    });

    res.json(result);
  } catch (error) {
    console.error('Error getting unified products:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/stats - Get product statistics
router.get('/stats', (req, res) => {
  try {
    const stats = productService.getProductStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/categories - Get all categories
router.get('/categories', (req, res) => {
  try {
    const categories = productService.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/brands - Get all brands
router.get('/brands', (req, res) => {
  try {
    const brands = productService.getBrands();
    res.json(brands);
  } catch (error) {
    console.error('Error getting brands:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/suppliers - Get all suppliers
router.get('/suppliers', (req, res) => {
  try {
    const suppliers = productService.getSuppliers();
    res.json(suppliers);
  } catch (error) {
    console.error('Error getting suppliers:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', (req, res) => {
  try {
    const product = productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
