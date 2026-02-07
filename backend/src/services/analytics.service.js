import { prepare, STOREFRONT_JOIN_SQL, PRODUCT_URL_FIELDS } from '../db/database.js';

export function getPricingAnalytics() {
  const pricePosition = prepare(`
    SELECT
      CASE
        WHEN akakce_low_price IS NULL THEN 'no_data'
        WHEN selling_price < akakce_low_price THEN 'cheapest'
        WHEN selling_price = akakce_low_price THEN 'tied_first'
        WHEN selling_price <= akakce_low_price * 1.05 THEN 'competitive'
        WHEN selling_price <= akakce_high_price THEN 'mid_range'
        ELSE 'expensive'
      END as position,
      COUNT(*) as count
    FROM products
    WHERE is_active = 1
    GROUP BY position
  `).all();

  const marginDistribution = prepare(`
    SELECT
      CASE
        WHEN buying_price = 0 OR buying_price IS NULL THEN 'unknown'
        WHEN (selling_price - buying_price) / selling_price * 100 < 0 THEN 'negative'
        WHEN (selling_price - buying_price) / selling_price * 100 < 10 THEN '0-10%'
        WHEN (selling_price - buying_price) / selling_price * 100 < 20 THEN '10-20%'
        WHEN (selling_price - buying_price) / selling_price * 100 < 30 THEN '20-30%'
        ELSE '30%+'
      END as margin_band,
      COUNT(*) as count
    FROM products
    WHERE is_active = 1
    GROUP BY margin_band
  `).all();

  const topProfit = prepare(`
    SELECT
      p.id, p.code, p.name, p.brand,
      p.buying_price, p.selling_price,
      ${PRODUCT_URL_FIELDS},
      ROUND((p.selling_price - p.buying_price), 2) as profit,
      ROUND((p.selling_price - p.buying_price) / p.selling_price * 100, 2) as margin_percent
    FROM products p
    ${STOREFRONT_JOIN_SQL}
    WHERE p.buying_price > 0 AND p.selling_price > p.buying_price
    ORDER BY profit DESC
    LIMIT 20
  `).all();

  const winnable = prepare(`
    SELECT
      p.id, p.code, p.name, p.brand,
      p.selling_price, p.akakce_low_price,
      ${PRODUCT_URL_FIELDS},
      ROUND(p.selling_price - p.akakce_low_price, 2) as price_diff,
      ROUND((p.selling_price - p.akakce_low_price) / p.selling_price * 100, 2) as diff_percent
    FROM products p
    ${STOREFRONT_JOIN_SQL}
    WHERE p.akakce_low_price IS NOT NULL
      AND p.selling_price > p.akakce_low_price
      AND (p.selling_price - p.akakce_low_price) / p.selling_price * 100 < 10
      AND p.is_active = 1
    ORDER BY p.selling_price DESC
    LIMIT 50
  `).all();

  return { pricePosition, marginDistribution, topProfit, winnable };
}

export function getCategoryAnalytics() {
  return prepare(`
    SELECT
      main_category,
      COUNT(*) as product_count,
      SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count,
      SUM(CASE WHEN total_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
      SUM(CASE WHEN total_quantity > 0 AND total_quantity < 5 THEN 1 ELSE 0 END) as low_stock,
      ROUND(AVG(selling_price), 2) as avg_price,
      ROUND(AVG(CASE WHEN buying_price > 0 THEN (selling_price - buying_price) / selling_price * 100 END), 2) as avg_margin,
      SUM(total_quantity * buying_price) as inventory_value,
      COUNT(DISTINCT brand) as brand_count,
      COUNT(DISTINCT supplier_name) as supplier_count
    FROM products
    WHERE main_category IS NOT NULL
    GROUP BY main_category
    ORDER BY product_count DESC
  `).all();
}

export function getCompetitorAnalytics() {
  const topCompetitors = prepare(`
    SELECT
      seller_name,
      COUNT(*) as product_count,
      COUNT(CASE WHEN seller_sort = 1 THEN 1 END) as first_place_count,
      ROUND(AVG(seller_price), 2) as avg_price
    FROM competitors
    GROUP BY seller_name
    ORDER BY product_count DESC
    LIMIT 20
  `).all();

  const mostCompetitive = prepare(`
    SELECT
      p.id, p.code, p.name, p.brand,
      p.selling_price, p.akakce_low_price,
      ${PRODUCT_URL_FIELDS},
      p.akakce_total_sellers as competitor_count
    FROM products p
    ${STOREFRONT_JOIN_SQL}
    WHERE p.akakce_total_sellers IS NOT NULL
    ORDER BY p.akakce_total_sellers DESC
    LIMIT 20
  `).all();

  const whereWeWin = prepare(`
    SELECT COUNT(*) as count
    FROM products
    WHERE akakce_low_price IS NOT NULL
      AND selling_price <= akakce_low_price
  `).get();

  const whereWeLose = prepare(`
    SELECT COUNT(*) as count
    FROM products
    WHERE akakce_high_price IS NOT NULL
      AND selling_price >= akakce_high_price
  `).get();

  return {
    topCompetitors,
    mostCompetitive,
    winningCount: whereWeWin?.count || 0,
    losingCount: whereWeLose?.count || 0
  };
}

export function getSupplierAnalytics() {
  return prepare(`
    SELECT
      supplier_name,
      COUNT(*) as product_count,
      SUM(CASE WHEN total_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
      ROUND(SUM(CASE WHEN total_quantity = 0 THEN 1.0 ELSE 0 END) / COUNT(*) * 100, 2) as out_of_stock_rate,
      SUM(total_quantity * buying_price) as inventory_value,
      ROUND(AVG(buying_price), 2) as avg_buying_price,
      COUNT(DISTINCT main_category) as category_count,
      COUNT(DISTINCT brand) as brand_count
    FROM products
    WHERE supplier_name IS NOT NULL AND supplier_name != ''
    GROUP BY supplier_name
    HAVING product_count > 5
    ORDER BY product_count DESC
  `).all();
}

export function getStockAnalytics() {
  const stockDistribution = prepare(`
    SELECT
      CASE
        WHEN total_quantity = 0 THEN 'Stokta Yok'
        WHEN total_quantity < 5 THEN 'Kritik (1-4)'
        WHEN total_quantity < 20 THEN 'Dusuk (5-19)'
        WHEN total_quantity < 100 THEN 'Normal (20-99)'
        ELSE 'Yuksek (100+)'
      END as stock_level,
      COUNT(*) as count,
      SUM(total_quantity * buying_price) as value
    FROM products
    WHERE is_active = 1
    GROUP BY stock_level
  `).all();

  const criticalStock = prepare(`
    SELECT
      id, code, name, brand, supplier_name,
      main_category, buying_price, selling_price
    FROM products
    WHERE total_quantity = 0 AND is_active = 1
    ORDER BY selling_price DESC
    LIMIT 50
  `).all();

  const overstocked = prepare(`
    SELECT
      id, code, name, brand,
      total_quantity, buying_price,
      total_quantity * buying_price as stock_value
    FROM products
    WHERE total_quantity > 100
    ORDER BY stock_value DESC
    LIMIT 50
  `).all();

  return { stockDistribution, criticalStock, overstocked };
}

export function getDashboardSummary() {
  const totals = prepare(`
    SELECT
      COUNT(*) as total_products,
      SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_products,
      SUM(CASE WHEN total_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
      SUM(CASE WHEN total_quantity > 0 AND total_quantity < 5 THEN 1 ELSE 0 END) as low_stock,
      COUNT(DISTINCT brand) as total_brands,
      COUNT(DISTINCT main_category) as total_categories,
      COUNT(DISTINCT supplier_name) as total_suppliers,
      SUM(total_quantity * buying_price) as total_inventory_value,
      SUM(CASE WHEN akakce_product_id IS NOT NULL THEN 1 ELSE 0 END) as with_akakce
    FROM products
  `).get();

  const pricePosition = prepare(`
    SELECT
      SUM(CASE WHEN selling_price <= akakce_low_price THEN 1 ELSE 0 END) as winning,
      SUM(CASE WHEN selling_price > akakce_low_price AND selling_price <= akakce_high_price THEN 1 ELSE 0 END) as competitive,
      SUM(CASE WHEN selling_price > akakce_high_price THEN 1 ELSE 0 END) as expensive
    FROM products
    WHERE akakce_low_price IS NOT NULL
  `).get();

  const lastSync = prepare(`
    SELECT completed_at, synced_products
    FROM sync_logs
    WHERE status = 'success'
    ORDER BY completed_at DESC
    LIMIT 1
  `).get();

  return { totals, pricePosition, lastSync };
}

export default {
  getPricingAnalytics,
  getCategoryAnalytics,
  getCompetitorAnalytics,
  getSupplierAnalytics,
  getStockAnalytics,
  getDashboardSummary
};
