import { prepare } from '../db/database.js';

// Helper function to get storefront URL
const getStorefrontJoin = () => `
  LEFT JOIN (
    SELECT panel_product_id, slug
    FROM storefront_products
    WHERE panel_product_id IS NOT NULL
    GROUP BY panel_product_id
  ) sf ON p.id = sf.panel_product_id
`;

const getPetzzshopUrl = () => `CASE WHEN sf.slug IS NOT NULL THEN 'https://www.petzzshop.com/' || sf.slug ELSE NULL END as petzzshop_url`;

export function getPriceAnomalies() {
  return prepare(`
    SELECT p.id, p.code, p.name, p.brand, p.main_category, p.supplier_name,
           p.buying_price, p.selling_price,
           (p.buying_price - p.selling_price) as loss_amount,
           p.akakce_url,
           ${getPetzzshopUrl()}
    FROM products p
    ${getStorefrontJoin()}
    WHERE p.buying_price > p.selling_price AND p.buying_price > 0 AND p.selling_price > 0
    ORDER BY loss_amount DESC
    LIMIT 500
  `).all();
}

export function getMissingImages() {
  return prepare(`
    SELECT p.id, p.code, p.name, p.brand, p.main_category, p.selling_price,
           p.akakce_url,
           ${getPetzzshopUrl()}
    FROM products p
    ${getStorefrontJoin()}
    WHERE p.images IS NULL OR p.images = '[]' OR p.images = ''
    ORDER BY p.selling_price DESC
  `).all();
}

export function getMissingDescriptions() {
  return prepare(`
    SELECT p.id, p.code, p.name, p.brand, p.main_category, p.selling_price,
           LENGTH(p.description) as desc_length,
           p.akakce_url,
           ${getPetzzshopUrl()}
    FROM products p
    ${getStorefrontJoin()}
    WHERE p.description IS NULL OR LENGTH(p.description) < 50
    ORDER BY p.selling_price DESC
  `).all();
}

export function getMissingBarcodes() {
  return prepare(`
    SELECT p.id, p.code, p.name, p.brand, p.main_category,
           p.akakce_url,
           ${getPetzzshopUrl()}
    FROM products p
    ${getStorefrontJoin()}
    LEFT JOIN product_metas m ON p.id = m.product_id AND m.barcode IS NOT NULL AND m.barcode != ''
    WHERE m.id IS NULL
    ORDER BY p.name
  `).all();
}

export function getPotentialDuplicates() {
  return prepare(`
    SELECT
      p1.id as id1, p1.code as code1, p1.name as name1,
      p2.id as id2, p2.code as code2, p2.name as name2,
      p1.brand
    FROM products p1
    JOIN products p2 ON p1.brand = p2.brand
      AND p1.id < p2.id
      AND p1.name LIKE SUBSTR(p2.name, 1, 20) || '%'
    LIMIT 100
  `).all();
}

export function getWrongCategoryProducts() {
  const keywords = {
    'Kedi': ['kedi', 'cat'],
    'Kopek': ['kopek', 'dog'],
    'Kus': ['kus', 'bird'],
    'Akvaryum': ['akvaryum', 'balik', 'fish'],
    'Kemirgen': ['kemirgen', 'hamster']
  };

  const results = [];

  for (const [expectedCategory, words] of Object.entries(keywords)) {
    for (const word of words) {
      const wrongProducts = prepare(`
        SELECT p.id, p.code, p.name, p.brand, p.main_category, ? as expected_category,
               p.akakce_url,
               ${getPetzzshopUrl()}
        FROM products p
        ${getStorefrontJoin()}
        WHERE LOWER(p.name) LIKE ?
          AND p.main_category != ?
          AND p.main_category IS NOT NULL
        LIMIT 20
      `).all(expectedCategory, `%${word.toLowerCase()}%`, expectedCategory);

      results.push(...wrongProducts);
    }
  }

  const uniqueResults = Array.from(new Map(results.map(r => [r.id, r])).values());
  return uniqueResults.slice(0, 100);
}

export function getAkakceMismatches() {
  return prepare(`
    SELECT
      p.id, p.code, p.name as product_name, p.brand,
      p.akakce_product_id, p.akakce_url,
      ${getPetzzshopUrl()},
      (SELECT COUNT(*) FROM competitors WHERE product_id = p.id) as competitor_count
    FROM products p
    ${getStorefrontJoin()}
    WHERE p.akakce_product_id IS NOT NULL
      AND p.akakce_low_price IS NULL
    ORDER BY p.selling_price DESC
    LIMIT 100
  `).all();
}

export function getZeroMarginProducts() {
  return prepare(`
    SELECT
      p.id, p.code, p.name, p.brand, p.main_category, p.supplier_name,
      p.buying_price, p.selling_price,
      (p.buying_price - p.selling_price) as loss_amount,
      p.akakce_url,
      ${getPetzzshopUrl()},
      CASE
        WHEN p.selling_price > 0 THEN ROUND((p.selling_price - p.buying_price) / p.selling_price * 100, 2)
        ELSE 0
      END as margin_percent
    FROM products p
    ${getStorefrontJoin()}
    WHERE p.buying_price > 0
      AND (p.selling_price <= p.buying_price OR p.selling_price = 0)
    ORDER BY (p.buying_price - p.selling_price) DESC
    LIMIT 500
  `).all();
}

export function getSuspiciousVatProducts() {
  return prepare(`
    SELECT p.id, p.code, p.name, p.brand, p.main_category, p.vat,
           p.akakce_url,
           ${getPetzzshopUrl()}
    FROM products p
    ${getStorefrontJoin()}
    WHERE p.vat NOT IN (0, 1, 8, 10, 18, 20)
      OR p.vat IS NULL
    ORDER BY p.selling_price DESC
  `).all();
}

export function getQualitySummary() {
  const priceAnomalies = prepare(`
    SELECT
      COUNT(*) as count,
      SUM(buying_price - selling_price) as total_loss,
      AVG(buying_price - selling_price) as avg_loss
    FROM products
    WHERE buying_price > selling_price AND buying_price > 0 AND selling_price > 0
  `).get();

  const missingImages = prepare(`
    SELECT COUNT(*) as count FROM products WHERE images IS NULL OR images = '[]' OR images = ''
  `).get();

  const missingDescriptions = prepare(`
    SELECT COUNT(*) as count FROM products WHERE description IS NULL OR LENGTH(description) < 50
  `).get();

  const zeroMargin = prepare(`
    SELECT COUNT(*) as count FROM products WHERE buying_price > 0 AND selling_price <= buying_price
  `).get();

  const outOfStock = prepare(`
    SELECT COUNT(*) as count FROM products WHERE total_quantity = 0 AND is_active = 1
  `).get();

  const totalProducts = prepare(`SELECT COUNT(*) as count FROM products WHERE is_active = 1`).get();

  // Tedarikçi bazlı fiyat anomalisi dağılımı
  const supplierBreakdown = prepare(`
    SELECT
      supplier_name,
      COUNT(*) as count,
      SUM(buying_price - selling_price) as total_loss,
      AVG(buying_price - selling_price) as avg_loss
    FROM products
    WHERE buying_price > selling_price AND buying_price > 0 AND selling_price > 0
    GROUP BY supplier_name
    ORDER BY total_loss DESC
    LIMIT 10
  `).all();

  // Marka bazlı fiyat anomalisi
  const brandBreakdown = prepare(`
    SELECT
      brand,
      COUNT(*) as count,
      SUM(buying_price - selling_price) as total_loss
    FROM products
    WHERE buying_price > selling_price AND buying_price > 0 AND selling_price > 0
    GROUP BY brand
    ORDER BY total_loss DESC
    LIMIT 10
  `).all();

  // Akakce verisi eksik ürünler
  const missingAkakce = prepare(`
    SELECT COUNT(*) as count
    FROM products
    WHERE akakce_product_id IS NULL
      AND is_active = 1
      AND selling_price > 100
  `).get();

  return {
    priceAnomalies: priceAnomalies?.count || 0,
    totalLoss: Math.round(priceAnomalies?.total_loss || 0),
    avgLoss: Math.round(priceAnomalies?.avg_loss || 0),
    missingImages: missingImages?.count || 0,
    missingDescriptions: missingDescriptions?.count || 0,
    zeroMargin: zeroMargin?.count || 0,
    activeOutOfStock: outOfStock?.count || 0,
    missingAkakce: missingAkakce?.count || 0,
    totalProducts: totalProducts?.count || 0,
    supplierBreakdown,
    brandBreakdown
  };
}

export default {
  getPriceAnomalies,
  getMissingImages,
  getMissingDescriptions,
  getMissingBarcodes,
  getPotentialDuplicates,
  getWrongCategoryProducts,
  getAkakceMismatches,
  getZeroMarginProducts,
  getSuspiciousVatProducts,
  getQualitySummary
};
