import { prepare, STOREFRONT_JOIN_SQL, STOREFRONT_PRICE_FIELDS } from '../db/database.js';

// Get products with pagination, filtering, sorting
export function getProducts({ page = 1, limit = 50, search, category, subCategory, brand, supplier, stockStatus, priceStatus, hasAkakce, hasStorefront, sortBy = 'name', sortOrder = 'asc' }) {
  const offset = (page - 1) * limit;
  let whereConditions = ['1=1'];
  const params = [];

  if (search) {
    whereConditions.push("(p.name LIKE ? OR p.code LIKE ? OR p.brand LIKE ? OR p.supplier_name LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (category) {
    whereConditions.push('p.main_category = ?');
    params.push(category);
  }

  if (subCategory) {
    whereConditions.push('p.sub_category = ?');
    params.push(subCategory);
  }

  if (brand) {
    whereConditions.push('p.brand = ?');
    params.push(brand);
  }

  // Akakce verisi var/yok filtresi
  if (hasAkakce === 'yes') {
    whereConditions.push('p.akakce_product_id IS NOT NULL');
  } else if (hasAkakce === 'no') {
    whereConditions.push('p.akakce_product_id IS NULL');
  }

  // Storefront eşleşmesi var/yok filtresi
  if (hasStorefront === 'yes') {
    whereConditions.push('sf.slug IS NOT NULL');
  } else if (hasStorefront === 'no') {
    whereConditions.push('sf.slug IS NULL');
  }

  if (supplier) {
    whereConditions.push('p.supplier_name = ?');
    params.push(supplier);
  }

  if (stockStatus === 'in-stock') {
    whereConditions.push('p.total_quantity > 0');
  } else if (stockStatus === 'out-of-stock') {
    whereConditions.push('p.total_quantity = 0');
  } else if (stockStatus === 'low-stock') {
    whereConditions.push('p.total_quantity > 0 AND p.total_quantity < 5');
  }

  if (priceStatus === 'cheaper') {
    whereConditions.push('p.akakce_low_price IS NOT NULL AND p.selling_price < p.akakce_low_price');
  } else if (priceStatus === 'expensive') {
    whereConditions.push('p.akakce_high_price IS NOT NULL AND p.selling_price > p.akakce_high_price');
  } else if (priceStatus === 'competitive') {
    whereConditions.push('p.akakce_low_price IS NOT NULL AND p.selling_price >= p.akakce_low_price AND p.selling_price <= p.akakce_high_price');
  }

  const whereClause = whereConditions.join(' AND ');

  const validSortColumns = {
    'name': 'p.name',
    'code': 'p.code',
    'brand': 'p.brand',
    'buying_price': 'p.buying_price',
    'selling_price': 'p.selling_price',
    'quantity': 'p.total_quantity',
    'category': 'p.main_category'
  };

  const sortColumn = validSortColumns[sortBy] || 'p.name';
  const order = sortOrder === 'desc' ? 'DESC' : 'ASC';

  // Count - JOIN gerekiyorsa (hasStorefront filtresi varsa) JOIN ile yap
  const needsJoin = hasStorefront === 'yes' || hasStorefront === 'no';
  const countResult = needsJoin
    ? prepare(`SELECT COUNT(*) as total FROM products p ${STOREFRONT_JOIN_SQL} WHERE ${whereClause}`).get(...params)
    : prepare(`SELECT COUNT(*) as total FROM products WHERE ${whereClause.replace(/p\./g, '')}`).get(...params);

  const products = prepare(`
    SELECT p.*, sf.slug as storefront_slug, ${STOREFRONT_PRICE_FIELDS}
    FROM products p
    ${STOREFRONT_JOIN_SQL}
    WHERE ${whereClause}
    ORDER BY ${sortColumn} ${order}
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  const formattedProducts = products.map(p => ({
    ...p,
    images: JSON.parse(p.images || '[]'),
    is_active: Boolean(p.is_active),
    petzzshop_url: p.storefront_slug ? `https://www.petzzshop.com/${p.storefront_slug}` : null,
    // Storefront (ikas) verileri - null ise vitrin verisi yok demektir
    storefront: p.storefront_sell_price !== null ? {
      sell_price: p.storefront_sell_price,
      discount_price: p.storefront_discount_price,
      stock: p.storefront_stock,
      discount_percent: p.storefront_discount_percent,
      has_data: true
    } : { has_data: false }
  }));

  return {
    products: formattedProducts,
    pagination: {
      page,
      limit,
      total: countResult?.total || 0,
      totalPages: Math.ceil((countResult?.total || 0) / limit)
    }
  };
}

export function getProductById(id) {
  const product = prepare(`
    SELECT p.*, sf.slug as storefront_slug, ${STOREFRONT_PRICE_FIELDS}
    FROM products p
    ${STOREFRONT_JOIN_SQL}
    WHERE p.id = ?
  `).get(id);
  if (!product) return null;

  const metas = prepare('SELECT * FROM product_metas WHERE product_id = ?').all(id);
  const competitors = prepare('SELECT * FROM competitors WHERE product_id = ? ORDER BY seller_sort ASC').all(id);

  return {
    ...product,
    images: JSON.parse(product.images || '[]'),
    is_active: Boolean(product.is_active),
    petzzshop_url: product.storefront_slug ? `https://www.petzzshop.com/${product.storefront_slug}` : null,
    // Storefront (ikas) verileri
    storefront: product.storefront_sell_price !== null ? {
      sell_price: product.storefront_sell_price,
      discount_price: product.storefront_discount_price,
      stock: product.storefront_stock,
      discount_percent: product.storefront_discount_percent,
      has_data: true
    } : { has_data: false },
    metas,
    competitors
  };
}

export function getProductStats() {
  return prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN total_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
      SUM(CASE WHEN total_quantity > 0 AND total_quantity < 5 THEN 1 ELSE 0 END) as low_stock,
      SUM(CASE WHEN akakce_product_id IS NOT NULL THEN 1 ELSE 0 END) as with_akakce,
      COUNT(DISTINCT brand) as brands,
      COUNT(DISTINCT main_category) as categories,
      COUNT(DISTINCT supplier_name) as suppliers,
      AVG(selling_price) as avg_price,
      SUM(total_quantity * buying_price) as inventory_value
    FROM products
  `).get();
}

export function getCategories() {
  return prepare(`
    SELECT
      main_category,
      sub_category,
      COUNT(*) as product_count,
      SUM(CASE WHEN total_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_count,
      AVG(selling_price) as avg_price
    FROM products
    WHERE main_category IS NOT NULL
    GROUP BY main_category, sub_category
    ORDER BY main_category, sub_category
  `).all();
}

export function getBrands() {
  return prepare(`
    SELECT
      brand,
      COUNT(*) as product_count,
      COUNT(DISTINCT main_category) as category_count,
      AVG(selling_price) as avg_price
    FROM products
    WHERE brand IS NOT NULL AND brand != ''
    GROUP BY brand
    ORDER BY product_count DESC
  `).all();
}

export function getSuppliers() {
  return prepare(`
    SELECT
      supplier_name,
      COUNT(*) as product_count,
      SUM(CASE WHEN total_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_count,
      SUM(total_quantity * buying_price) as inventory_value
    FROM products
    WHERE supplier_name IS NOT NULL AND supplier_name != ''
    GROUP BY supplier_name
    ORDER BY product_count DESC
  `).all();
}

// Get unified products with Single Source of Truth approach
// Alış fiyatı: Panel, Satış fiyatı: ikas, Stok: Panel
export function getUnifiedProducts({ page = 1, limit = 50, search, category, subCategory, brand, supplier, stockStatus, priceStatus, hasAkakce, hasStorefront, sortBy = 'name', sortOrder = 'asc', inconsistencyFilter, petzzRank }) {
  const offset = (page - 1) * limit;
  let whereConditions = ['1=1'];
  const params = [];

  if (search) {
    whereConditions.push("(p.name LIKE ? OR p.code LIKE ? OR p.brand LIKE ? OR p.supplier_name LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (category) {
    whereConditions.push('p.main_category = ?');
    params.push(category);
  }

  if (subCategory) {
    whereConditions.push('p.sub_category = ?');
    params.push(subCategory);
  }

  if (brand) {
    whereConditions.push('p.brand = ?');
    params.push(brand);
  }

  if (hasAkakce === 'yes') {
    whereConditions.push('p.akakce_product_id IS NOT NULL');
  } else if (hasAkakce === 'no') {
    whereConditions.push('p.akakce_product_id IS NULL');
  }

  if (hasStorefront === 'yes') {
    whereConditions.push('sf.slug IS NOT NULL');
  } else if (hasStorefront === 'no') {
    whereConditions.push('sf.slug IS NULL');
  }

  if (supplier) {
    whereConditions.push('p.supplier_name = ?');
    params.push(supplier);
  }

  if (stockStatus === 'in-stock') {
    whereConditions.push('p.total_quantity > 0');
  } else if (stockStatus === 'out-of-stock') {
    whereConditions.push('p.total_quantity = 0');
  } else if (stockStatus === 'low-stock') {
    whereConditions.push('p.total_quantity > 0 AND p.total_quantity < 5');
  }

  // Fiyat karşılaştırmaları gerçek satış fiyatı (indirimli) üzerinden
  if (priceStatus === 'cheaper') {
    whereConditions.push('p.akakce_low_price IS NOT NULL AND COALESCE(sf.discount_price, sf.sell_price, p.selling_price) < p.akakce_low_price');
  } else if (priceStatus === 'expensive') {
    whereConditions.push('p.akakce_high_price IS NOT NULL AND COALESCE(sf.discount_price, sf.sell_price, p.selling_price) > p.akakce_high_price');
  } else if (priceStatus === 'competitive') {
    whereConditions.push('p.akakce_low_price IS NOT NULL AND COALESCE(sf.discount_price, sf.sell_price, p.selling_price) >= p.akakce_low_price AND COALESCE(sf.discount_price, sf.sell_price, p.selling_price) <= p.akakce_high_price');
  }

  // Tutarsızlık filtreleri (indirimli fiyat öncelikli)
  if (inconsistencyFilter === 'price') {
    whereConditions.push('(sf.discount_price IS NOT NULL AND ABS(sf.discount_price - p.selling_price) > 1) OR (sf.sell_price IS NOT NULL AND sf.discount_price IS NULL AND ABS(sf.sell_price - p.selling_price) > 1)');
  } else if (inconsistencyFilter === 'stock') {
    whereConditions.push('sf.stock_count IS NOT NULL AND sf.stock_count != p.total_quantity');
  }

  // Petzz sırası filtresi (Akakce'deki sıralama)
  if (petzzRank) {
    if (petzzRank === '6') {
      // 6-10 arası (seller_sort 5-9)
      whereConditions.push(`EXISTS (
        SELECT 1 FROM competitors c
        WHERE c.product_id = p.id
        AND LOWER(c.seller_name) LIKE '%petzz%'
        AND c.seller_sort >= 5 AND c.seller_sort <= 9
      )`);
    } else {
      const rank = parseInt(petzzRank);
      if (rank >= 1 && rank <= 5) {
        // Petzz'in rakipler arasındaki sırası (seller_sort 0-indexed, +1 ile 1-indexed olur)
        whereConditions.push(`EXISTS (
          SELECT 1 FROM competitors c
          WHERE c.product_id = p.id
          AND LOWER(c.seller_name) LIKE '%petzz%'
          AND c.seller_sort = ?
        )`);
        params.push(rank - 1); // seller_sort 0-indexed
      }
    }
  }

  const whereClause = whereConditions.join(' AND ');

  const validSortColumns = {
    'name': 'p.name',
    'code': 'p.code',
    'brand': 'p.brand',
    'buying_price': 'p.buying_price',
    'selling_price': 'COALESCE(sf.discount_price, sf.sell_price, p.selling_price)',
    'quantity': 'p.total_quantity',
    'category': 'p.main_category',
    'margin': '((COALESCE(sf.discount_price, sf.sell_price, p.selling_price) - p.buying_price) / NULLIF(COALESCE(sf.discount_price, sf.sell_price, p.selling_price), 0))',
    'price_diff': '(COALESCE(sf.discount_price, sf.sell_price, p.selling_price) - p.akakce_low_price)'
  };

  const sortColumn = validSortColumns[sortBy] || 'p.name';
  const order = sortOrder === 'desc' ? 'DESC' : 'ASC';

  // Count query
  const countResult = prepare(`
    SELECT COUNT(*) as total
    FROM products p
    ${STOREFRONT_JOIN_SQL}
    WHERE ${whereClause}
  `).get(...params);

  // Main query with all unified fields
  // Satış fiyatı öncelik sırası: ikas discount_price > ikas sell_price > panel selling_price
  const products = prepare(`
    SELECT
      p.id,
      p.code as sku,
      p.name,
      p.brand,
      p.supplier_name,
      p.main_category,
      p.sub_category,
      p.images,
      p.akakce_url,

      -- Fiyatlandırma (Panel alış, ikas satış)
      p.buying_price,
      p.selling_price as panel_selling_price,
      sf.sell_price as storefront_list_price,
      sf.discount_price as storefront_discount_price,
      sf.discount_percent as storefront_discount_percent,
      -- Gerçek satış fiyatı: indirimli varsa indirimli, yoksa liste, yoksa panel
      COALESCE(sf.discount_price, sf.sell_price, p.selling_price) as effective_sell_price,

      -- Hesaplanan fiyat metrikleri (indirimli fiyat üzerinden)
      CASE
        WHEN COALESCE(sf.discount_price, sf.sell_price, p.selling_price) > 0
        THEN COALESCE(sf.discount_price, sf.sell_price, p.selling_price) - p.buying_price
        ELSE 0
      END as gross_profit,
      CASE
        WHEN COALESCE(sf.discount_price, sf.sell_price, p.selling_price) > 0 AND p.buying_price > 0
        THEN ((COALESCE(sf.discount_price, sf.sell_price, p.selling_price) - p.buying_price) / COALESCE(sf.discount_price, sf.sell_price, p.selling_price)) * 100
        ELSE 0
      END as margin_percent,

      -- Fiyat tutarsızlığı (indirimli fiyat ile panel fiyatı karşılaştırması)
      CASE
        WHEN sf.discount_price IS NOT NULL AND ABS(sf.discount_price - p.selling_price) > 1
        THEN 0
        WHEN sf.sell_price IS NOT NULL AND ABS(sf.sell_price - p.selling_price) > 1
        THEN 0
        ELSE 1
      END as price_synced,

      -- Stok (Panel öncelikli)
      p.total_quantity,
      sf.stock_count as storefront_stock,
      p.total_quantity * p.buying_price as stock_value,
      CASE
        WHEN sf.stock_count IS NOT NULL AND sf.stock_count = p.total_quantity
        THEN 1
        ELSE 0
      END as stock_synced,

      -- Akakce verileri
      p.akakce_product_id,
      p.akakce_low_price,
      p.akakce_high_price,
      p.akakce_petzz_price,
      p.akakce_total_sellers,
      p.akakce_target_price,
      p.akakce_drop_price,
      -- Fark hesabı: gerçek satış fiyatı (indirimli) - akakce min
      COALESCE(sf.discount_price, sf.sell_price, p.selling_price) - p.akakce_low_price as price_diff,
      CASE
        WHEN p.akakce_low_price > 0
        THEN ((COALESCE(sf.discount_price, sf.sell_price, p.selling_price) - p.akakce_low_price) / p.akakce_low_price) * 100
        ELSE NULL
      END as price_diff_percent,

      -- URL'ler
      sf.slug as storefront_slug

    FROM products p
    ${STOREFRONT_JOIN_SQL}
    WHERE ${whereClause}
    ORDER BY ${sortColumn} ${order}
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  // Ürün ID'lerini topla ve rakip verilerini çek
  const productIds = products.map(p => p.id);

  // Her ürün için rakipleri çek (ilk 10)
  const competitorMap = {};
  if (productIds.length > 0) {
    const competitors = prepare(`
      SELECT product_id, seller_name, seller_price, seller_sort
      FROM competitors
      WHERE product_id IN (${productIds.map(() => '?').join(',')})
      ORDER BY product_id, seller_sort ASC
    `).all(...productIds);

    competitors.forEach(c => {
      if (!competitorMap[c.product_id]) {
        competitorMap[c.product_id] = [];
      }
      if (competitorMap[c.product_id].length < 10) {
        competitorMap[c.product_id].push({
          rank: c.seller_sort,
          name: c.seller_name,
          price: c.seller_price
        });
      }
    });
  }

  // Ürünleri formatla
  const formattedProducts = products.map(p => {
    const competitors = competitorMap[p.id] || [];

    // Petzz sırasını bul
    const petzzCompetitor = competitors.find(c =>
      c.name?.toLowerCase().includes('petzz')
    );
    const petzzRank = petzzCompetitor ? competitors.indexOf(petzzCompetitor) + 1 : null;

    return {
      // Temel Bilgiler
      id: p.id,
      sku: p.sku,
      name: p.name,
      brand: p.brand,
      category: p.main_category ? `${p.main_category}${p.sub_category ? ' > ' + p.sub_category : ''}` : null,
      supplier: p.supplier_name,
      images: JSON.parse(p.images || '[]'),

      // Fiyatlandırma
      pricing: {
        buying_price: p.buying_price,
        selling_price: p.effective_sell_price,  // Gerçek satış: discount_price > sell_price > panel
        list_price: p.storefront_list_price,    // ikas liste fiyatı
        discount_price: p.storefront_discount_price,  // ikas indirimli fiyat
        discount_percent: p.storefront_discount_percent || 0,
        gross_profit: p.gross_profit,
        margin_percent: Math.round(p.margin_percent * 10) / 10,
        panel_selling_price: p.panel_selling_price,
        price_synced: Boolean(p.price_synced),
        source: p.storefront_discount_price ? 'ikas_discount' : (p.storefront_list_price ? 'ikas_list' : 'panel')
      },

      // Stok
      stock: {
        quantity: p.total_quantity,
        storefront_quantity: p.storefront_stock,
        stock_value: p.stock_value,
        stock_synced: Boolean(p.stock_synced)
      },

      // Akakce
      akakce: p.akakce_product_id ? {
        low_price: p.akakce_low_price,
        high_price: p.akakce_high_price,
        petzz_price: p.akakce_petzz_price,
        petzz_rank: petzzRank,
        total_sellers: p.akakce_total_sellers,
        price_diff: p.price_diff,
        price_diff_percent: p.price_diff_percent ? Math.round(p.price_diff_percent * 10) / 10 : null,
        target_price: p.akakce_target_price,
        drop_price: p.akakce_drop_price,
        competitors: competitors
      } : null,

      // URL'ler
      urls: {
        petzzshop: p.storefront_slug ? `https://www.petzzshop.com/${p.storefront_slug}` : null,
        akakce: p.akakce_url
      }
    };
  });

  // Özet istatistikler (indirimli fiyat üzerinden)
  const summaryResult = prepare(`
    SELECT
      COUNT(*) as total_products,
      SUM(CASE WHEN sf.discount_price IS NOT NULL AND ABS(sf.discount_price - p.selling_price) > 1 THEN 1
               WHEN sf.sell_price IS NOT NULL AND sf.discount_price IS NULL AND ABS(sf.sell_price - p.selling_price) > 1 THEN 1
               ELSE 0 END) as price_inconsistent,
      SUM(CASE WHEN sf.stock_count IS NOT NULL AND sf.stock_count != p.total_quantity THEN 1 ELSE 0 END) as stock_inconsistent,
      SUM(CASE WHEN p.akakce_low_price IS NOT NULL AND COALESCE(sf.discount_price, sf.sell_price, p.selling_price) < p.akakce_low_price THEN 1 ELSE 0 END) as below_competitors,
      SUM(CASE WHEN p.akakce_low_price IS NOT NULL AND COALESCE(sf.discount_price, sf.sell_price, p.selling_price) > p.akakce_low_price THEN 1 ELSE 0 END) as above_competitors
    FROM products p
    ${STOREFRONT_JOIN_SQL}
  `).get();

  return {
    products: formattedProducts,
    pagination: {
      page,
      limit,
      total: countResult?.total || 0,
      totalPages: Math.ceil((countResult?.total || 0) / limit)
    },
    summary: {
      total_products: summaryResult?.total_products || 0,
      price_inconsistent: summaryResult?.price_inconsistent || 0,
      stock_inconsistent: summaryResult?.stock_inconsistent || 0,
      below_competitors: summaryResult?.below_competitors || 0,
      above_competitors: summaryResult?.above_competitors || 0
    }
  };
}

// Get single product by exact SKU (code field)
export function getProductBySku(sku) {
  const product = prepare(`
    SELECT p.*,
           sf.slug as storefront_slug,
           ${STOREFRONT_PRICE_FIELDS},
           COALESCE(sf.discount_price, sf.sell_price, p.selling_price) as effective_sell_price,
           COALESCE(sf.discount_price, sf.sell_price, p.selling_price) - p.buying_price as gross_profit,
           CASE
             WHEN COALESCE(sf.discount_price, sf.sell_price, p.selling_price) > 0
             THEN (COALESCE(sf.discount_price, sf.sell_price, p.selling_price) - p.buying_price) / COALESCE(sf.discount_price, sf.sell_price, p.selling_price) * 100
             ELSE 0
           END as margin_percent
    FROM products p
    ${STOREFRONT_JOIN_SQL}
    WHERE p.code = ?
    LIMIT 1
  `).get(sku);

  if (!product) return null;

  // Get competitors
  const competitors = prepare(`
    SELECT seller_name, seller_price, seller_sort
    FROM competitors
    WHERE product_id = ?
    ORDER BY seller_sort ASC
    LIMIT 10
  `).all(product.id);

  // Find Petzz rank
  const petzzCompetitor = competitors.find(c =>
    c.seller_name?.toLowerCase().includes('petzz')
  );
  const petzzRank = petzzCompetitor ? competitors.findIndex(c =>
    c.seller_name?.toLowerCase().includes('petzz')
  ) + 1 : null;

  return {
    id: product.id,
    sku: product.code,
    name: product.name,
    brand: product.brand,
    category: product.main_category ? `${product.main_category}${product.sub_category ? ' > ' + product.sub_category : ''}` : null,
    supplier: product.supplier_name,
    images: JSON.parse(product.images || '[]'),

    pricing: {
      buying_price: product.buying_price,
      selling_price: product.effective_sell_price,
      list_price: product.storefront_sell_price,
      discount_price: product.storefront_discount_price,
      discount_percent: product.storefront_discount_percent || 0,
      gross_profit: product.gross_profit,
      margin_percent: Math.round(product.margin_percent * 10) / 10
    },

    stock: {
      quantity: product.total_quantity,
      storefront_quantity: product.storefront_stock
    },

    akakce: product.akakce_product_id ? {
      low_price: product.akakce_low_price,
      high_price: product.akakce_high_price,
      petzz_price: product.akakce_petzz_price,
      petzz_rank: petzzRank,
      total_sellers: product.akakce_total_sellers,
      price_diff: product.effective_sell_price - product.akakce_low_price,
      price_diff_percent: product.akakce_low_price ?
        Math.round((product.effective_sell_price - product.akakce_low_price) / product.akakce_low_price * 100 * 10) / 10 : null,
      competitors: competitors.map(c => ({
        rank: c.seller_sort + 1,
        name: c.seller_name,
        price: c.seller_price
      }))
    } : null,

    urls: {
      petzzshop: product.storefront_slug ? `https://www.petzzshop.com/${product.storefront_slug}` : null,
      akakce: product.akakce_url
    }
  };
}

export default {
  getProducts,
  getProductById,
  getProductBySku,
  getProductStats,
  getCategories,
  getBrands,
  getSuppliers,
  getUnifiedProducts
};
