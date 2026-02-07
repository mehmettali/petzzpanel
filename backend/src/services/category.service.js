import axios from 'axios';
import { prepare, exec, saveDatabase, getDb } from '../db/database.js';

// ═══════════════════════════════════════════════════════════════════════════
// GOOGLE TAXONOMY SERVICE
// ═══════════════════════════════════════════════════════════════════════════

const GOOGLE_TAXONOMY_URL = 'https://www.google.com/basepages/producttype/taxonomy-with-ids.tr-TR.txt';

// Pet-related category IDs (root: 1 - Hayvanlar ve Evcil Hayvan Ürünleri)
const PET_ROOT_CATEGORY_ID = 1;

// Event loop'a kontrol ver
function yieldToEventLoop() {
  return new Promise(resolve => setImmediate(resolve));
}

// ═══════════════════════════════════════════════════════════════════════════
// TAXONOMY IMPORT
// ═══════════════════════════════════════════════════════════════════════════

// Google Taxonomy'yi indir ve parse et
export async function importGoogleTaxonomy() {
  console.log('📥 Google Taxonomy indiriliyor...');

  try {
    const response = await axios.get(GOOGLE_TAXONOMY_URL, {
      timeout: 30000,
      responseType: 'text'
    });

    const lines = response.data.split('\n').filter(line => line.trim());

    // Pet kategorilerini filtrele (ID 1 ile başlayanlar ve ilgili alt kategoriler)
    const petCategories = lines.filter(line => {
      const lowerLine = line.toLowerCase();
      return lowerLine.includes('hayvan') ||
             lowerLine.includes('evcil') ||
             lowerLine.includes('kedi') ||
             lowerLine.includes('köpek') ||
             lowerLine.includes('kuş') ||
             lowerLine.includes('balık') ||
             lowerLine.includes('akvaryum') ||
             lowerLine.includes('sürüngen');
    });

    console.log(`📊 ${petCategories.length} pet kategorisi bulundu`);

    // Mevcut kategorileri temizle
    exec('DELETE FROM google_taxonomy');

    const insertStmt = prepare(`
      INSERT OR REPLACE INTO google_taxonomy
      (id, name, full_path, parent_id, level, is_leaf)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    let imported = 0;
    const categoryMap = new Map();

    for (const line of petCategories) {
      const match = line.match(/^(\d+)\s*-\s*(.+)$/);
      if (!match) continue;

      const id = parseInt(match[1], 10);
      const fullPath = match[2].trim();
      const parts = fullPath.split(' > ');
      const name = parts[parts.length - 1];
      const level = parts.length;

      // Parent ID'yi bul
      let parentId = null;
      if (parts.length > 1) {
        const parentPath = parts.slice(0, -1).join(' > ');
        parentId = categoryMap.get(parentPath) || null;
      }

      categoryMap.set(fullPath, id);

      insertStmt.run(id, name, fullPath, parentId, level, 0);
      imported++;
    }

    // Leaf kategorileri işaretle (çocuğu olmayanlar)
    exec(`
      UPDATE google_taxonomy
      SET is_leaf = 1
      WHERE id NOT IN (SELECT DISTINCT parent_id FROM google_taxonomy WHERE parent_id IS NOT NULL)
    `);

    saveDatabase();

    console.log(`✅ ${imported} kategori içe aktarıldı`);

    return {
      success: true,
      imported,
      total: petCategories.length
    };
  } catch (error) {
    console.error('❌ Taxonomy import hatası:', error.message);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY MAPPING
// ═══════════════════════════════════════════════════════════════════════════

// Otomatik kategori eşleştirme kuralları
const AUTO_MAPPING_RULES = [
  // Kedi Mamaları
  { categoryId: 3367, keywords: ['kedi', 'cat'], subKeywords: ['mama', 'food', 'yem'], name: 'Kedi Mamaları' },
  { categoryId: 543684, keywords: ['kedi', 'cat'], subKeywords: ['mama', 'food'], excludeKeywords: ['tedavi', 'veteriner', 'renal', 'urinary', 'hepatic'], name: 'Normal Kedi Mamaları' },
  { categoryId: 543683, keywords: ['kedi', 'cat'], subKeywords: ['tedavi', 'veteriner', 'renal', 'urinary', 'hepatic', 'gastro'], name: 'Tedaviye Yönelik Kedi Mamaları' },

  // Köpek Mamaları
  { categoryId: 3530, keywords: ['köpek', 'dog'], subKeywords: ['mama', 'food', 'yem'], name: 'Köpek Mamaları' },
  { categoryId: 543682, keywords: ['köpek', 'dog'], subKeywords: ['mama', 'food'], excludeKeywords: ['tedavi', 'veteriner', 'renal', 'hepatic'], name: 'Normal Köpek Mamaları' },
  { categoryId: 543681, keywords: ['köpek', 'dog'], subKeywords: ['tedavi', 'veteriner', 'renal', 'hepatic', 'gastro'], name: 'Tedaviye Yönelik Köpek Mamaları' },

  // Ödül Mamaları
  { categoryId: 5002, keywords: ['kedi', 'cat'], subKeywords: ['ödül', 'treat', 'snack', 'stick', 'atıştırma'], name: 'Kedi Ödül Mamaları' },
  { categoryId: 5011, keywords: ['köpek', 'dog'], subKeywords: ['ödül', 'treat', 'snack', 'stick', 'kemik', 'çiğneme'], name: 'Köpek Ödül Mamaları' },

  // Kum ve Tuvalet
  { categoryId: 4999, keywords: ['kedi', 'cat'], subKeywords: ['kum', 'litter'], name: 'Kedi Kumları' },
  { categoryId: 5000, keywords: ['kedi', 'cat'], subKeywords: ['tuvalet', 'kabı', 'box'], name: 'Kedi Tuvaletleri' },

  // Oyuncaklar
  { categoryId: 5001, keywords: ['kedi', 'cat'], subKeywords: ['oyuncak', 'toy'], name: 'Kedi Oyuncakları' },
  { categoryId: 5010, keywords: ['köpek', 'dog'], subKeywords: ['oyuncak', 'toy'], name: 'Köpek Oyuncakları' },

  // Yataklar
  { categoryId: 4433, keywords: ['kedi', 'cat'], subKeywords: ['yatak', 'bed', 'minder', 'yuva'], name: 'Kedi Yatakları' },
  { categoryId: 4434, keywords: ['köpek', 'dog'], subKeywords: ['yatak', 'bed', 'minder'], name: 'Köpek Yatakları' },

  // Kıyafetler
  { categoryId: 5082, keywords: ['kedi', 'cat'], subKeywords: ['kıyafet', 'giysi', 'mont', 'kazak'], name: 'Kedi Kıyafetleri' },
  { categoryId: 5004, keywords: ['köpek', 'dog'], subKeywords: ['kıyafet', 'giysi', 'mont', 'kazak', 'yağmurluk'], name: 'Köpek Kıyafetleri' },

  // Tasmalar ve Kayışlar
  { categoryId: 6249, keywords: ['tasma'], excludeKeywords: ['kayış', 'uzatma'], name: 'Evcil Hayvan Tasmaları' },
  { categoryId: 6250, keywords: ['kayış', 'tasma'], subKeywords: ['kayış', 'gezdirme'], name: 'Evcil Hayvan Tasma ve Kayışları' },
  { categoryId: 6253, keywords: ['uzatma', 'flexi'], subKeywords: ['tasma'], name: 'Evcil Hayvan Uzatma Tasmaları' },

  // Taşıma
  { categoryId: 6251, keywords: ['taşıma', 'çanta', 'kafes', 'carrier', 'bag'], name: 'Evcil Hayvan Taşıma Çantaları ve Sandıkları' },

  // Mama Kapları
  { categoryId: 6252, keywords: ['mama', 'su'], subKeywords: ['kabı', 'kap', 'suluk', 'yemlik', 'bowl'], name: 'Evcil Hayvan Mama Kapları' },

  // Tımarlama
  { categoryId: 6383, keywords: ['fırça', 'tarak', 'tırnak', 'bakım', 'tımar', 'groom'], name: 'Evcil Hayvan Tımarlama Ürünleri' },
  { categoryId: 6406, keywords: ['şampuan', 'shampoo', 'yıkama'], name: 'Evcil Hayvan Şampuan ve Bakım Kremleri' },

  // Sağlık
  { categoryId: 5081, keywords: ['vitamin', 'takviye', 'supplement'], name: 'Evcil Hayvan Vitaminleri ve Besin Takviyeleri' },
  { categoryId: 5086, keywords: ['ilaç', 'damla', 'sprey', 'medicine'], name: 'Evcil Hayvan İlaçları' },
  { categoryId: 6248, keywords: ['pire', 'kene', 'flea', 'tick'], name: 'Evcil Hayvan Pire ve Kene Kontrolü' },

  // Kuş Ürünleri
  { categoryId: 4990, keywords: ['kuş', 'bird', 'papağan', 'muhabbet', 'kanarya'], subKeywords: ['yem', 'mama', 'food'], name: 'Kuş Yemleri' },
  { categoryId: 4989, keywords: ['kuş', 'bird'], subKeywords: ['kafes'], name: 'Kuş Kafesleri ve Stantları' },

  // Balık/Akvaryum
  { categoryId: 5024, keywords: ['balık', 'fish', 'akvaryum'], subKeywords: ['yem', 'mama', 'food'], name: 'Balık Yemleri' },
  { categoryId: 3238, keywords: ['akvaryum'], excludeKeywords: ['yem', 'filtre', 'ışık'], name: 'Akvaryumlar' },
  { categoryId: 5020, keywords: ['akvaryum'], subKeywords: ['filtre', 'filter'], name: 'Akvaryum Filtreleri' },

  // Küçük Hayvanlar
  { categoryId: 5015, keywords: ['hamster', 'tavşan', 'kobay', 'guinea', 'kemirgen'], subKeywords: ['yem', 'mama'], name: 'Küçük Hayvan Yemleri' },
  { categoryId: 5017, keywords: ['hamster', 'tavşan', 'kobay', 'guinea', 'kemirgen'], subKeywords: ['kafes'], name: 'Küçük Hayvan Ortamları ve Kafesleri' },

  // Sürüngenler
  { categoryId: 5026, keywords: ['sürüngen', 'kaplumbağa', 'iguana'], subKeywords: ['yem', 'mama'], name: 'Sürüngen ve Amfibi Yemleri' },
  { categoryId: 5029, keywords: ['sürüngen', 'kaplumbağa', 'iguana', 'teraryum'], excludeKeywords: ['yem'], name: 'Sürüngen ve Amfibi Ortamları' }
];

// Ürünleri kategorilere otomatik eşleştir
export async function autoMapProducts() {
  console.log('🔄 Otomatik kategori eşleştirmesi başlatılıyor...');

  // Panel + Storefront ürünlerini al
  const products = prepare(`
    SELECT
      p.code as sku,
      p.name,
      p.main_category,
      p.sub_category,
      p.brand,
      sp.category_path as storefront_category
    FROM products p
    LEFT JOIN storefront_products sp ON p.code = sp.sku
    WHERE p.code IS NOT NULL
  `).all();

  console.log(`📦 ${products.length} ürün analiz edilecek...`);

  // Mevcut otomatik eşleştirmeleri temizle
  const db = getDb();
  db.run(`DELETE FROM product_category_mapping WHERE source = 'auto'`);
  await yieldToEventLoop();

  // Direct DB access for faster batch inserts (no save per insert)

  const stats = {
    mapped: 0,
    unmapped: 0,
    byCategory: {}
  };

  const BATCH_SIZE = 100;
  const startTime = Date.now();

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const searchText = `${product.name || ''} ${product.main_category || ''} ${product.sub_category || ''} ${product.storefront_category || ''}`.toLowerCase();

    let bestMatch = null;
    let bestScore = 0;

    for (const rule of AUTO_MAPPING_RULES) {
      let score = 0;

      // Ana anahtar kelime kontrolü
      const hasMainKeyword = rule.keywords.some(kw => searchText.includes(kw.toLowerCase()));
      if (!hasMainKeyword) continue;
      score += 10;

      // Alt anahtar kelime kontrolü
      if (rule.subKeywords) {
        const hasSubKeyword = rule.subKeywords.some(kw => searchText.includes(kw.toLowerCase()));
        if (hasSubKeyword) score += 5;
        else continue; // Alt anahtar kelime zorunlu
      }

      // Hariç tutma kontrolü
      if (rule.excludeKeywords) {
        const hasExcluded = rule.excludeKeywords.some(kw => searchText.includes(kw.toLowerCase()));
        if (hasExcluded) continue;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = rule;
      }
    }

    if (bestMatch) {
      const confidence = Math.min(bestScore / 15, 1);
      // Direct insert without auto-save for speed
      db.run(
        `INSERT OR REPLACE INTO product_category_mapping (sku, google_category_id, confidence, source) VALUES (?, ?, ?, 'auto')`,
        [product.sku, bestMatch.categoryId, confidence]
      );
      stats.mapped++;
      stats.byCategory[bestMatch.name] = (stats.byCategory[bestMatch.name] || 0) + 1;
    } else {
      stats.unmapped++;
    }

    // Her 50 üründe event loop'a kontrol ver (non-blocking)
    if (i % 50 === 0) {
      await yieldToEventLoop();
    }

    // Her 1000 üründe kaydet ve ilerleme göster
    if (i % 1000 === 0 && i > 0) {
      saveDatabase();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const percent = ((i / products.length) * 100).toFixed(1);
      console.log(`📊 [${percent}%] ${i}/${products.length} ürün işlendi (${elapsed}s)`);
      await yieldToEventLoop();
    }
  }

  saveDatabase();

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║           OTOMATİK EŞLEŞTİRME TAMAMLANDI ✅                   ║
╠══════════════════════════════════════════════════════════════╣
║  Eşleşen:      ${String(stats.mapped).padEnd(8)}                                 ║
║  Eşleşmeyen:   ${String(stats.unmapped).padEnd(8)}                                 ║
╚══════════════════════════════════════════════════════════════╝
  `);

  // Kategori istatistiklerini güncelle
  await updateCategoryStats();

  return stats;
}

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY STATS
// ═══════════════════════════════════════════════════════════════════════════

// Kategori istatistiklerini güncelle
export async function updateCategoryStats() {
  console.log('📊 Kategori istatistikleri güncelleniyor...');

  // Her kategorideki ürün sayısı ve stok değeri
  const stats = prepare(`
    SELECT
      pcm.google_category_id,
      COUNT(DISTINCT pcm.sku) as product_count,
      SUM(p.total_quantity) as stock_count,
      SUM(p.total_quantity * p.buying_price) as stock_value
    FROM product_category_mapping pcm
    LEFT JOIN products p ON pcm.sku = p.code
    GROUP BY pcm.google_category_id
  `).all();

  const updateStmt = prepare(`
    UPDATE google_taxonomy
    SET product_count = ?, stock_count = ?, stock_value = ?, updated_at = ?
    WHERE id = ?
  `);

  for (const stat of stats) {
    updateStmt.run(
      stat.product_count || 0,
      stat.stock_count || 0,
      stat.stock_value || 0,
      new Date().toISOString(),
      stat.google_category_id
    );
  }

  saveDatabase();
  console.log('✅ Kategori istatistikleri güncellendi');
}

// ═══════════════════════════════════════════════════════════════════════════
// QUERY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// Kategori ağacını getir
export function getCategoryTree(parentId = null) {
  const categories = prepare(`
    SELECT
      gt.*,
      (SELECT COUNT(*) FROM google_taxonomy WHERE parent_id = gt.id) as child_count
    FROM google_taxonomy gt
    WHERE ${parentId === null ? 'gt.parent_id IS NULL' : 'gt.parent_id = ?'}
    ORDER BY gt.product_count DESC, gt.name ASC
  `).all(parentId === null ? [] : [parentId]);

  return categories.map(cat => ({
    ...cat,
    has_children: cat.child_count > 0
  }));
}

// Tüm kategorileri flat liste olarak getir
export function getAllCategories() {
  return prepare(`
    SELECT
      gt.*,
      (SELECT COUNT(*) FROM google_taxonomy WHERE parent_id = gt.id) as child_count,
      (SELECT name FROM google_taxonomy WHERE id = gt.parent_id) as parent_name
    FROM google_taxonomy gt
    ORDER BY gt.level, gt.product_count DESC
  `).all();
}

// Kategori detayı
export function getCategoryById(id) {
  const category = prepare(`
    SELECT * FROM google_taxonomy WHERE id = ?
  `).get(id);

  if (!category) return null;

  // Alt kategoriler
  const children = prepare(`
    SELECT * FROM google_taxonomy
    WHERE parent_id = ?
    ORDER BY product_count DESC
  `).all(id);

  // Üst kategoriler (breadcrumb)
  const breadcrumb = [];
  let currentId = category.parent_id;
  while (currentId) {
    const parent = prepare(`SELECT id, name, parent_id FROM google_taxonomy WHERE id = ?`).get(currentId);
    if (parent) {
      breadcrumb.unshift(parent);
      currentId = parent.parent_id;
    } else {
      break;
    }
  }

  // Bu kategorideki ürünler
  const products = prepare(`
    SELECT
      p.code as sku,
      p.name,
      p.brand,
      p.buying_price,
      p.selling_price,
      p.total_quantity,
      pcm.confidence
    FROM product_category_mapping pcm
    JOIN products p ON pcm.sku = p.code
    WHERE pcm.google_category_id = ?
    ORDER BY p.total_quantity DESC
    LIMIT 100
  `).all(id);

  return {
    ...category,
    children,
    breadcrumb,
    products
  };
}

// Eşleşmemiş ürünleri getir
export function getUnmappedProducts({ page = 1, limit = 50, search, category, brand }) {
  const offset = (page - 1) * limit;
  let whereConditions = [`p.code NOT IN (SELECT sku FROM product_category_mapping)`];
  const params = [];

  if (search) {
    whereConditions.push('(p.name LIKE ? OR p.code LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    whereConditions.push('p.main_category = ?');
    params.push(category);
  }

  if (brand) {
    whereConditions.push('p.brand = ?');
    params.push(brand);
  }

  const whereClause = whereConditions.join(' AND ');

  const countResult = prepare(`
    SELECT COUNT(*) as total FROM products p WHERE ${whereClause}
  `).get(...params);

  const products = prepare(`
    SELECT
      p.code as sku,
      p.name,
      p.brand,
      p.main_category,
      p.sub_category,
      p.buying_price,
      p.selling_price,
      p.total_quantity
    FROM products p
    WHERE ${whereClause}
    ORDER BY p.total_quantity DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  return {
    products,
    pagination: {
      page,
      limit,
      total: countResult?.total || 0,
      totalPages: Math.ceil((countResult?.total || 0) / limit)
    }
  };
}

// Kategori bazlı stok özeti
export function getCategoryStockSummary() {
  return prepare(`
    SELECT
      gt.id,
      gt.name,
      gt.full_path,
      gt.level,
      gt.product_count,
      gt.stock_count,
      gt.stock_value,
      CASE
        WHEN gt.stock_count = 0 THEN 'out_of_stock'
        WHEN gt.stock_count < 10 THEN 'low_stock'
        ELSE 'in_stock'
      END as stock_status
    FROM google_taxonomy gt
    WHERE gt.product_count > 0
    ORDER BY gt.stock_value DESC
  `).all();
}

// Dashboard için özet istatistikler
export function getCategoryDashboard() {
  const overview = prepare(`
    SELECT
      COUNT(*) as total_categories,
      SUM(product_count) as total_products_mapped,
      SUM(stock_count) as total_stock,
      SUM(stock_value) as total_stock_value
    FROM google_taxonomy
    WHERE product_count > 0
  `).get();

  const unmappedCount = prepare(`
    SELECT COUNT(*) as count
    FROM products
    WHERE code NOT IN (SELECT sku FROM product_category_mapping)
  `).get();

  const topCategories = prepare(`
    SELECT id, name, product_count, stock_count, stock_value
    FROM google_taxonomy
    WHERE product_count > 0
    ORDER BY product_count DESC
    LIMIT 10
  `).all();

  const lowStockCategories = prepare(`
    SELECT id, name, product_count, stock_count
    FROM google_taxonomy
    WHERE product_count > 0 AND stock_count < 10
    ORDER BY stock_count ASC
    LIMIT 10
  `).all();

  const byLevel = prepare(`
    SELECT
      level,
      COUNT(*) as category_count,
      SUM(product_count) as product_count
    FROM google_taxonomy
    WHERE product_count > 0
    GROUP BY level
    ORDER BY level
  `).all();

  return {
    overview: {
      ...overview,
      unmapped_products: unmappedCount?.count || 0
    },
    topCategories,
    lowStockCategories,
    byLevel
  };
}

// Manuel kategori eşleştirme
export function mapProductToCategory(sku, categoryId, mappedBy = 'manual') {
  prepare(`
    INSERT OR REPLACE INTO product_category_mapping
    (sku, google_category_id, confidence, source, mapped_by, mapped_at)
    VALUES (?, ?, 1.0, 'manual', ?, ?)
  `).run(sku, categoryId, mappedBy, new Date().toISOString());

  return { success: true };
}

// Toplu kategori eşleştirme
export function bulkMapProducts(skus, categoryId, mappedBy = 'bulk') {
  const insertStmt = prepare(`
    INSERT OR REPLACE INTO product_category_mapping
    (sku, google_category_id, confidence, source, mapped_by, mapped_at)
    VALUES (?, ?, 1.0, 'manual', ?, ?)
  `);

  const now = new Date().toISOString();
  let mapped = 0;

  for (const sku of skus) {
    insertStmt.run(sku, categoryId, mappedBy, now);
    mapped++;
  }

  saveDatabase();

  return { success: true, mapped };
}

export default {
  importGoogleTaxonomy,
  autoMapProducts,
  updateCategoryStats,
  getCategoryTree,
  getAllCategories,
  getCategoryById,
  getUnmappedProducts,
  getCategoryStockSummary,
  getCategoryDashboard,
  mapProductToCategory,
  bulkMapProducts
};
