import axios from 'axios';
import { prepare, exec, saveDatabase } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

// ═══════════════════════════════════════════════════════════════════════════
// ikas JSON Feed URL
// ═══════════════════════════════════════════════════════════════════════════
const IKAS_JSON_URL = 'https://ikas-exporter-app.ikasapps.com/api/exports/5d436c51-cce5-440f-8a93-9d38ba8fb37f/d50df405-abfa-46ca-85a4-6c4670d7f97a.json';

// ═══════════════════════════════════════════════════════════════════════════
// TAG EXTRACTION RULES - Otomatik etiket çıkarma kuralları
// ═══════════════════════════════════════════════════════════════════════════
const TAG_RULES = {
  species: {
    kedi: ['kedi', 'cat', 'kitten', 'feline', 'kediler için'],
    kopek: ['köpek', 'kopek', 'dog', 'puppy', 'canine', 'köpekler için'],
    kus: ['kuş', 'kus', 'bird', 'parrot', 'muhabbet', 'kanarya', 'papağan'],
    balik: ['balık', 'balik', 'fish', 'akvaryum'],
    kemirgen: ['kemirgen', 'hamster', 'tavşan', 'tavsan', 'guinea pig', 'kobay', 'fare', 'sincap'],
    surunger: ['sürüngen', 'surunger', 'reptile', 'kaplumbağa', 'kaplumbaga', 'iguana']
  },
  age: {
    yavru: ['yavru', 'puppy', 'kitten', 'junior', 'baby', 'starter', 'büyüme'],
    yetiskin: ['yetişkin', 'yetiskin', 'adult', '1-7 yaş', '1-6 yaş', 'olgun'],
    yasli: ['yaşlı', 'yasli', 'senior', '+7', '7+', 'mature', '7 yaş üzeri', '8+']
  },
  flavor: {
    tavuk: ['tavuk', 'tavuklu', 'chicken', 'poultry', 'kümes'],
    somon: ['somon', 'somonlu', 'salmon'],
    kuzu: ['kuzu', 'kuzulu', 'lamb'],
    sigir: ['sığır', 'sigir', 'sığırlı', 'beef', 'dana', 'danali'],
    ton: ['ton balığı', 'ton', 'tuna', 'tonlu'],
    hindi: ['hindi', 'hindili', 'turkey'],
    ordek: ['ördek', 'ordek', 'duck', 'ördekli'],
    balik_tat: ['balık', 'balik', 'balıklı', 'fish'],
    ciger: ['ciğer', 'ciger', 'liver', 'ciğerli'],
    geyik: ['geyik', 'deer', 'venison', 'geyikli'],
    tavsan_tat: ['tavşan', 'tavsan', 'rabbit', 'tavşanlı']
  },
  special: {
    kisir: ['kısır', 'kisir', 'sterilised', 'sterilized', 'neutered', 'kısırlaştırılmış'],
    tahilsiz: ['tahılsız', 'tahilsiz', 'grain free', 'grainfree', 'tahıl içermez'],
    hipoalerjenik: ['hipoalerjenik', 'hypoallergenic', 'hassas', 'sensitive', ' ha '],
    diyet: ['diyet', 'diet', 'light', 'weight control', 'kilo kontrol', 'obezite'],
    indoor: ['indoor', 'ev kedisi', 'ev içi', 'apartment'],
    hairball: ['hairball', 'tüy yumağı', 'tüy yumak'],
    urinary: ['urinary', 'idrar', 'böbrek', 'kidney', 'renal'],
    dental: ['dental', 'diş', 'ağız', 'oral'],
    digestive: ['digestive', 'sindirim', 'mide', 'bağırsak', 'gastrointestinal'],
    dermatosis: ['dermatosis', 'cilt', 'deri', 'skin', 'coat', 'tüy']
  },
  size: {
    mini: ['mini', 'toy', 'x-small', 'xs', 'minik', 'cep'],
    small: ['small', 'küçük', 'kucuk', 'small breed', 'küçük ırk'],
    medium: ['medium', 'orta', 'orta boy', 'orta ırk'],
    large: ['large', 'büyük', 'buyuk', 'large breed', 'büyük ırk'],
    giant: ['giant', 'dev', 'extra large', 'xl', 'dev ırk']
  },
  product_type: {
    kuru_mama: ['kuru mama', 'dry food', 'kuru', 'granül'],
    yas_mama: ['yaş mama', 'wet food', 'konserve', 'pouch', 'pate', 'jöle', 'sos'],
    odul: ['ödül', 'odul', 'treat', 'snack', 'stick', 'kemik', 'çiğneme'],
    aksesuar: ['aksesuar', 'oyuncak', 'tasma', 'mama kabı', 'su kabı'],
    bakim: ['şampuan', 'sampuan', 'tarak', 'fırça', 'tırnak', 'bakım'],
    saglik: ['vitamin', 'takviye', 'supplement', 'ilaç', 'damla', 'sprey']
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// Event loop'a kontrol ver (non-blocking için)
function yieldToEventLoop() {
  return new Promise(resolve => setImmediate(resolve));
}

// Kategori path'ini string'e çevir
function formatCategoryPath(categories) {
  if (!categories || categories.length === 0) return '';
  const cat = categories[0];
  if (cat.name && Array.isArray(cat.name)) {
    return cat.name.join(' > ');
  }
  return '';
}

// Ana ve alt kategoriyi ayıkla
function extractCategories(categories) {
  if (!categories || categories.length === 0) return { main: '', sub: '', detail: '' };
  const cat = categories[0];
  if (cat.name && Array.isArray(cat.name)) {
    return {
      main: cat.name[0] || '',
      sub: cat.name[1] || '',
      detail: cat.name[2] || ''
    };
  }
  return { main: '', sub: '', detail: '' };
}

// Toplam stok hesapla
function calculateTotalStock(stocks) {
  if (!stocks || stocks.length === 0) return 0;
  return stocks.reduce((sum, s) => sum + (s.stockCount || 0), 0);
}

// Varyant değerlerini formatla
function formatVariantValues(variantValues) {
  if (!variantValues || variantValues.length === 0) return { type: '', value: '' };
  const mainVariant = variantValues[0];
  return {
    type: mainVariant.variantTypeName || '',
    value: mainVariant.variantValueName || ''
  };
}

// İndirim yüzdesi hesapla
function calculateDiscountPercent(buyPrice, discountPrice) {
  if (!buyPrice || !discountPrice || buyPrice <= 0) return 0;
  if (discountPrice >= buyPrice) return 0;
  return Math.round((1 - discountPrice / buyPrice) * 100);
}

// Ürün açıklamasından etiketleri çıkar
function extractTags(product, variant) {
  const tags = [];
  const searchText = `${product.name || ''} ${product.description || ''} ${formatCategoryPath(product.categories)}`.toLowerCase();

  for (const [tagType, tagValues] of Object.entries(TAG_RULES)) {
    for (const [tagValue, keywords] of Object.entries(tagValues)) {
      for (const keyword of keywords) {
        if (searchText.includes(keyword.toLowerCase())) {
          const exists = tags.some(t => t.type === tagType && t.value === tagValue);
          if (!exists) {
            tags.push({
              type: tagType,
              value: tagValue,
              confidence: keyword.length > 4 ? 0.9 : 0.7,
              source: 'auto'
            });
          }
          break;
        }
      }
    }
  }

  return tags;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// ikas JSON verisini çek (streaming ile)
export async function fetchIkasJSON() {
  try {
    console.log('📦 ikas JSON verisi çekiliyor (streaming)...');
    const response = await axios.get(IKAS_JSON_URL, {
      timeout: 300000, // 5 dakika timeout
      maxContentLength: 500 * 1024 * 1024, // 500MB max
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Petzz-Panel/1.0'
      },
      decompress: true
    });

    console.log(`✅ JSON indirildi: ${response.data.length} ürün`);
    return response.data;
  } catch (error) {
    console.error('❌ ikas JSON çekme hatası:', error.message);
    throw error;
  }
}

// Batch insert için hazırla
const BATCH_SIZE = 500; // Her batch'te 500 ürün işle (artırıldı)

// Panel ürün kodlarını bellekte tut
let panelProductCache = null;

function loadPanelProductCache() {
  if (panelProductCache !== null) return panelProductCache;

  console.log('📦 Panel ürün kodları cache\'e yükleniyor...');
  const products = prepare('SELECT id, code FROM products WHERE code IS NOT NULL').all();
  panelProductCache = new Map();
  for (const p of products) {
    panelProductCache.set(p.code, p.id);
  }
  console.log(`✅ ${panelProductCache.size} panel ürün kodu cache'e yüklendi`);
  return panelProductCache;
}

function clearPanelProductCache() {
  panelProductCache = null;
}

// Basitleştirilmiş tag çıkarma (sadece isim ve kategoriden)
function extractTagsFast(productName, categoryPath) {
  const tags = [];
  const searchText = `${productName || ''} ${categoryPath || ''}`.toLowerCase();

  // Sadece en önemli etiketleri çıkar
  const quickRules = {
    species: [
      ['kedi', 'kedi'], ['köpek', 'kopek'], ['kuş', 'kus'],
      ['balık', 'balik'], ['kemirgen', 'kemirgen']
    ],
    age: [
      ['yavru', 'yavru'], ['yetişkin', 'yetiskin'], ['yaşlı', 'yasli'],
      ['puppy', 'yavru'], ['kitten', 'yavru'], ['adult', 'yetiskin'], ['senior', 'yasli']
    ],
    special: [
      ['kısır', 'kisir'], ['sterilised', 'kisir'],
      ['tahılsız', 'tahilsiz'], ['grain free', 'tahilsiz'],
      ['indoor', 'indoor']
    ]
  };

  for (const [tagType, rules] of Object.entries(quickRules)) {
    for (const [keyword, tagValue] of rules) {
      if (searchText.includes(keyword)) {
        const exists = tags.some(t => t.type === tagType && t.value === tagValue);
        if (!exists) {
          tags.push({ type: tagType, value: tagValue, confidence: 0.8, source: 'auto' });
        }
        break; // Her tip için sadece ilk eşleşme
      }
    }
  }

  return tags;
}

function processBatchFast(insertStmt, tagInsertStmt, batch, stats, panelCache) {
  for (const item of batch) {
    const { product, variant, categoryPath, mainCategory, subCategory } = item;

    const sku = variant.sku;

    // Panel ile eşleştir (cache'den - çok hızlı)
    const panelProductId = panelCache.get(sku) || null;
    const isMatched = panelProductId ? 1 : 0;

    if (isMatched) stats.matchedCount++;
    else stats.unmatchedCount++;

    // Fiyat bilgilerini al
    const price = variant.prices?.[0] || {};
    const sellPrice = price.sellPrice || 0;
    const buyPrice = price.buyPrice || 0;
    const discountPrice = price.discountPrice || sellPrice;
    const discountPercent = calculateDiscountPercent(buyPrice, discountPrice);

    // Stok hesapla
    const stockCount = calculateTotalStock(variant.stocks);

    // Varyant bilgileri
    const variantInfo = formatVariantValues(variant.variantValues);

    // Görseller (sadece ilk 5)
    const images = (variant.images || []).slice(0, 5).map(img => img.imageUrl);

    // Barkod
    const barcode = variant.barcodeList?.[0] || '';

    // Veritabanına kaydet
    const id = uuidv4();
    insertStmt.run(
      id,
      product.id,
      variant.id,
      sku,
      product.name,
      product.brand?.name || '',
      (product.description || '').substring(0, 5000), // Açıklamayı sınırla
      product.metaData?.slug || '',
      categoryPath,
      mainCategory,
      subCategory,
      sellPrice,
      buyPrice,
      discountPrice,
      discountPercent,
      stockCount,
      variantInfo.type,
      variantInfo.value,
      barcode,
      JSON.stringify(images),
      isMatched,
      panelProductId,
      new Date().toISOString()
    );

    // Etiketleri çıkar ve kaydet (basitleştirilmiş)
    const tags = extractTagsFast(product.name, categoryPath);
    for (const tag of tags) {
      tagInsertStmt.run(sku, tag.type, tag.value, tag.confidence, tag.source);
      stats.tagsExtracted++;
    }
  }
}

// Vitrin ürünlerini senkronize et (optimize edilmiş)
export async function syncStorefrontProducts() {
  const startTime = new Date().toISOString();
  let syncLogId;

  try {
    // Sync log oluştur
    const logResult = prepare(`
      INSERT INTO storefront_sync_logs (status, started_at)
      VALUES ('running', ?)
    `).run(startTime);
    syncLogId = logResult.lastInsertRowid;

    // Panel ürün cache'ini yükle
    const panelCache = loadPanelProductCache();

    // ikas verilerini çek
    console.log('📥 ikas JSON verisi indiriliyor...');
    const ikasProducts = await fetchIkasJSON();

    if (!ikasProducts || ikasProducts.length === 0) {
      throw new Error('ikas verisinde ürün bulunamadı');
    }

    const totalProductCount = ikasProducts.length;
    console.log(`🔄 ${totalProductCount} ana ürün işlenecek (batch size: ${BATCH_SIZE})...`);

    // Mevcut verileri temizle
    console.log('🗑️ Mevcut veriler temizleniyor...');
    exec('DELETE FROM storefront_products');
    exec('DELETE FROM product_tags WHERE source = "auto"');
    saveDatabase();

    // Prepared statements
    const insertStmt = prepare(`
      INSERT INTO storefront_products (
        id, ikas_product_id, ikas_variant_id, sku, name, brand, description, slug,
        category_path, main_category, sub_category, sell_price, buy_price,
        discount_price, discount_percent, stock_count, variant_type, variant_value,
        barcode, images, is_matched, panel_product_id, synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const tagInsertStmt = prepare(`
      INSERT INTO product_tags (sku, tag_type, tag_value, confidence, source)
      VALUES (?, ?, ?, ?, ?)
    `);

    const stats = {
      totalVariants: 0,
      matchedCount: 0,
      unmatchedCount: 0,
      tagsExtracted: 0
    };

    let batch = [];
    let processedProducts = 0;
    const startProcess = Date.now();

    // Ürünleri işle - batch halinde
    for (let i = 0; i < ikasProducts.length; i++) {
      const product = ikasProducts[i];

      if (!product.variants || product.variants.length === 0) {
        processedProducts++;
        continue;
      }

      const categoryPath = formatCategoryPath(product.categories);
      const { main: mainCategory, sub: subCategory } = extractCategories(product.categories);

      // Her varyantı batch'e ekle
      for (const variant of product.variants) {
        if (!variant.sku) continue;

        stats.totalVariants++;
        batch.push({
          product,
          variant,
          categoryPath,
          mainCategory,
          subCategory
        });

        // Batch dolduğunda işle
        if (batch.length >= BATCH_SIZE) {
          processBatchFast(insertStmt, tagInsertStmt, batch, stats, panelCache);
          batch = [];

          // Her 2000 varyantta bir kaydet ve event loop'a kontrol ver
          if (stats.totalVariants % 2000 === 0) {
            saveDatabase();
            await yieldToEventLoop(); // Server'ın diğer requestlere cevap vermesini sağla
          }
        }
      }

      processedProducts++;

      // İlerleme göster (her 500 üründe bir)
      if (processedProducts % 500 === 0) {
        const percent = ((processedProducts / totalProductCount) * 100).toFixed(1);
        const elapsed = ((Date.now() - startProcess) / 1000).toFixed(1);
        console.log(`📊 [${percent}%] ${processedProducts}/${totalProductCount} ürün, ${stats.totalVariants} varyant (${elapsed}s)`);
        await yieldToEventLoop(); // Server'ın diğer requestlere cevap vermesini sağla
      }
    }

    // Kalan batch'i işle
    if (batch.length > 0) {
      processBatchFast(insertStmt, tagInsertStmt, batch, stats, panelCache);
    }

    // Son kaydetme
    saveDatabase();

    // Cache'i temizle
    clearPanelProductCache();

    // Sync log güncelle
    prepare(`
      UPDATE storefront_sync_logs
      SET status = 'completed', total_products = ?, total_variants = ?,
          matched_count = ?, unmatched_count = ?, tags_extracted = ?,
          completed_at = ?
      WHERE id = ?
    `).run(
      totalProductCount,
      stats.totalVariants,
      stats.matchedCount,
      stats.unmatchedCount,
      stats.tagsExtracted,
      new Date().toISOString(),
      syncLogId
    );

    // Data source güncelle
    prepare(`
      UPDATE data_sources SET last_sync_at = ? WHERE code = 'ikas_storefront'
    `).run(new Date().toISOString());

    saveDatabase();

    const matchRate = stats.totalVariants > 0 ? ((stats.matchedCount / stats.totalVariants) * 100).toFixed(1) : 0;

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║               SENKRONIZASYON TAMAMLANDI ✅                    ║
╠══════════════════════════════════════════════════════════════╣
║  Ana Ürün:         ${String(totalProductCount).padEnd(8)}                             ║
║  Toplam Varyant:   ${String(stats.totalVariants).padEnd(8)}                             ║
║  Eşleşen:          ${String(stats.matchedCount).padEnd(8)} (%${matchRate})                   ║
║  Eşleşmeyen:       ${String(stats.unmatchedCount).padEnd(8)}                             ║
║  Çıkarılan Etiket: ${String(stats.tagsExtracted).padEnd(8)}                             ║
╚══════════════════════════════════════════════════════════════╝
    `);

    return {
      success: true,
      totalProducts: totalProductCount,
      totalVariants: stats.totalVariants,
      matchedCount: stats.matchedCount,
      unmatchedCount: stats.unmatchedCount,
      matchRate,
      tagsExtracted: stats.tagsExtracted
    };
  } catch (error) {
    console.error('❌ Senkronizasyon hatası:', error);

    if (syncLogId) {
      prepare(`
        UPDATE storefront_sync_logs
        SET status = 'failed', error_message = ?, completed_at = ?
        WHERE id = ?
      `).run(error.message, new Date().toISOString(), syncLogId);
      saveDatabase();
    }

    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// QUICK SYNC - Sadece fiyat/stok güncellemesi (hızlı sync)
// ═══════════════════════════════════════════════════════════════════════════

// Hızlı fiyat/stok güncelleme - sadece dinamik alanları günceller
export async function quickSyncPrices() {
  const startTime = new Date().toISOString();
  let syncLogId;

  try {
    // Sync log oluştur
    const logResult = prepare(`
      INSERT INTO storefront_sync_logs (status, sync_type, started_at)
      VALUES ('running', 'quick', ?)
    `).run(startTime);
    syncLogId = logResult.lastInsertRowid;

    console.log('⚡ Quick sync başlatılıyor...');
    const startProcess = Date.now();

    // ikas verilerini çek
    console.log('📥 ikas JSON verisi indiriliyor...');
    const ikasProducts = await fetchIkasJSON();

    if (!ikasProducts || ikasProducts.length === 0) {
      throw new Error('ikas verisinde ürün bulunamadı');
    }

    console.log(`📦 ${ikasProducts.length} ana ürün alındı`);

    // Mevcut fiyatları al (bellekte tutulacak)
    console.log('💾 Mevcut fiyat/stok verileri yükleniyor...');
    const currentPrices = prepare(`
      SELECT sku, sell_price, discount_price, stock_count
      FROM storefront_products
    `).all();

    if (currentPrices.length === 0) {
      throw new Error('Veritabanında storefront ürünü bulunamadı. Önce full sync yapın.');
    }

    const currentMap = new Map(currentPrices.map(p => [p.sku, p]));
    console.log(`✅ ${currentMap.size} SKU bellekte`);

    // Update statement hazırla
    const updateStmt = prepare(`
      UPDATE storefront_products
      SET sell_price = ?, discount_price = ?, discount_percent = ?,
          stock_count = ?, price_updated_at = ?
      WHERE sku = ?
    `);

    const stats = {
      totalVariants: 0,
      updated: 0,
      unchanged: 0,
      skipped: 0 // SKU veritabanında yok
    };

    // Ürünleri işle
    for (let i = 0; i < ikasProducts.length; i++) {
      const product = ikasProducts[i];

      if (!product.variants || product.variants.length === 0) continue;

      for (const variant of product.variants) {
        if (!variant.sku) continue;

        stats.totalVariants++;

        const current = currentMap.get(variant.sku);
        if (!current) {
          stats.skipped++; // Yeni ürün - quick sync'te atla
          continue;
        }

        // Fiyat bilgilerini al
        const price = variant.prices?.[0] || {};
        const newSellPrice = price.sellPrice || 0;
        const newBuyPrice = price.buyPrice || 0;
        const newDiscountPrice = price.discountPrice || newSellPrice;
        const newStock = calculateTotalStock(variant.stocks);
        const newDiscountPercent = calculateDiscountPercent(newBuyPrice, newDiscountPrice);

        // Değişiklik var mı kontrol et
        if (current.sell_price !== newSellPrice ||
            current.discount_price !== newDiscountPrice ||
            current.stock_count !== newStock) {

          updateStmt.run(
            newSellPrice,
            newDiscountPrice,
            newDiscountPercent,
            newStock,
            new Date().toISOString(),
            variant.sku
          );
          stats.updated++;
        } else {
          stats.unchanged++;
        }
      }

      // Her 500 üründe event loop'a kontrol ver
      if ((i + 1) % 500 === 0) {
        const percent = ((i / ikasProducts.length) * 100).toFixed(1);
        console.log(`⚡ [${percent}%] ${i}/${ikasProducts.length} ürün işlendi`);
        await yieldToEventLoop();
      }
    }

    // Kaydet
    saveDatabase();

    const elapsed = ((Date.now() - startProcess) / 1000).toFixed(1);

    // Sync log güncelle
    prepare(`
      UPDATE storefront_sync_logs
      SET status = 'completed', total_products = ?, total_variants = ?,
          matched_count = ?, unmatched_count = ?, completed_at = ?
      WHERE id = ?
    `).run(
      ikasProducts.length,
      stats.totalVariants,
      stats.updated,
      stats.skipped,
      new Date().toISOString(),
      syncLogId
    );

    // Data source güncelle
    prepare(`
      UPDATE data_sources SET last_sync_at = ? WHERE code = 'ikas_storefront'
    `).run(new Date().toISOString());

    saveDatabase();

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║               QUICK SYNC TAMAMLANDI ⚡                        ║
╠══════════════════════════════════════════════════════════════╣
║  Süre:            ${String(elapsed + 's').padEnd(10)}                           ║
║  Toplam Varyant:  ${String(stats.totalVariants).padEnd(8)}                             ║
║  Güncellenen:     ${String(stats.updated).padEnd(8)}                             ║
║  Değişmemiş:      ${String(stats.unchanged).padEnd(8)}                             ║
║  Atlanan (yeni):  ${String(stats.skipped).padEnd(8)}                             ║
╚══════════════════════════════════════════════════════════════╝
    `);

    return {
      success: true,
      type: 'quick',
      duration: elapsed,
      totalProducts: ikasProducts.length,
      totalVariants: stats.totalVariants,
      updated: stats.updated,
      unchanged: stats.unchanged,
      skipped: stats.skipped,
      message: `${stats.updated} ürün fiyatı güncellendi (${elapsed}s)`
    };
  } catch (error) {
    console.error('❌ Quick sync hatası:', error);

    if (syncLogId) {
      prepare(`
        UPDATE storefront_sync_logs
        SET status = 'failed', error_message = ?, completed_at = ?
        WHERE id = ?
      `).run(error.message, new Date().toISOString(), syncLogId);
      saveDatabase();
    }

    throw error;
  }
}

// Son sync zamanını getir
export function getLastSyncDate() {
  const lastSync = prepare(`
    SELECT completed_at FROM storefront_sync_logs
    WHERE status = 'completed'
    ORDER BY id DESC LIMIT 1
  `).get();

  return lastSync?.completed_at || null;
}

// Sync durumunu getir
export function getSyncStatus() {
  const lastSync = prepare(`
    SELECT * FROM storefront_sync_logs
    ORDER BY id DESC LIMIT 1
  `).get();

  const stats = prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN is_matched = 1 THEN 1 ELSE 0 END) as matched,
      SUM(CASE WHEN is_matched = 0 THEN 1 ELSE 0 END) as unmatched,
      SUM(CASE WHEN stock_count > 0 THEN 1 ELSE 0 END) as in_stock,
      SUM(CASE WHEN stock_count = 0 THEN 1 ELSE 0 END) as out_of_stock,
      SUM(CASE WHEN discount_percent > 0 THEN 1 ELSE 0 END) as on_discount,
      COUNT(DISTINCT brand) as brands,
      COUNT(DISTINCT main_category) as categories,
      AVG(sell_price) as avg_price,
      AVG(discount_percent) as avg_discount
    FROM storefront_products
  `).get();

  return { lastSync, stats };
}

// Vitrin ürünlerini getir (filtreli, sayfalı)
export function getStorefrontProducts({
  page = 1,
  limit = 50,
  search,
  category,
  brand,
  matchStatus,
  stockStatus,
  hasDiscount,
  tag,
  sortBy = 'name',
  sortOrder = 'asc'
}) {
  const offset = (page - 1) * limit;
  let whereConditions = ['1=1'];
  const params = [];

  if (search) {
    whereConditions.push('(sp.name LIKE ? OR sp.sku LIKE ? OR sp.brand LIKE ? OR sp.barcode LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (category) {
    whereConditions.push('sp.main_category = ?');
    params.push(category);
  }

  if (brand) {
    whereConditions.push('sp.brand = ?');
    params.push(brand);
  }

  if (matchStatus === 'matched') {
    whereConditions.push('sp.is_matched = 1');
  } else if (matchStatus === 'unmatched') {
    whereConditions.push('sp.is_matched = 0');
  }

  if (stockStatus === 'in-stock') {
    whereConditions.push('sp.stock_count > 0');
  } else if (stockStatus === 'out-of-stock') {
    whereConditions.push('sp.stock_count = 0');
  }

  if (hasDiscount === 'yes') {
    whereConditions.push('sp.discount_percent > 0');
  } else if (hasDiscount === 'no') {
    whereConditions.push('(sp.discount_percent = 0 OR sp.discount_percent IS NULL)');
  }

  const whereClause = whereConditions.join(' AND ');

  let tagJoin = '';
  if (tag) {
    tagJoin = 'INNER JOIN product_tags pt ON sp.sku = pt.sku AND pt.tag_value = ?';
    params.unshift(tag);
  }

  const validSortColumns = {
    'name': 'sp.name',
    'sku': 'sp.sku',
    'brand': 'sp.brand',
    'price': 'sp.sell_price',
    'discount': 'sp.discount_percent',
    'stock': 'sp.stock_count',
    'category': 'sp.main_category'
  };

  const sortColumn = validSortColumns[sortBy] || 'sp.name';
  const order = sortOrder === 'desc' ? 'DESC' : 'ASC';

  const countResult = prepare(`
    SELECT COUNT(DISTINCT sp.id) as total
    FROM storefront_products sp
    ${tagJoin}
    WHERE ${whereClause}
  `).get(...params);

  const products = prepare(`
    SELECT DISTINCT sp.*
    FROM storefront_products sp
    ${tagJoin}
    WHERE ${whereClause}
    ORDER BY ${sortColumn} ${order}
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  const formattedProducts = products.map(p => {
    const tags = prepare(`
      SELECT tag_type, tag_value, confidence, source
      FROM product_tags WHERE sku = ?
    `).all(p.sku);

    let panelData = null;
    if (p.is_matched && p.panel_product_id) {
      panelData = prepare(`
        SELECT selling_price, buying_price, total_quantity, akakce_low_price,
               akakce_high_price, akakce_total_sellers, description as panel_description
        FROM products WHERE id = ?
      `).get(p.panel_product_id);
    }

    return {
      ...p,
      images: JSON.parse(p.images || '[]'),
      tags,
      panelData,
      storefrontUrl: `https://www.petzzshop.com/${p.slug}`
    };
  });

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

// Tek ürün detayı (karşılaştırmalı)
export function getStorefrontProductBySku(sku) {
  const product = prepare('SELECT * FROM storefront_products WHERE sku = ?').get(sku);
  if (!product) return null;

  const tags = prepare('SELECT * FROM product_tags WHERE sku = ?').all(sku);

  let panelData = null;
  let competitors = [];
  if (product.is_matched && product.panel_product_id) {
    panelData = prepare('SELECT * FROM products WHERE id = ?').get(product.panel_product_id);
    if (panelData) {
      competitors = prepare(`
        SELECT * FROM competitors WHERE product_id = ? ORDER BY seller_sort ASC
      `).all(product.panel_product_id);
      panelData.images = JSON.parse(panelData.images || '[]');
    }
  }

  // Aynı ana ürünün diğer varyantları
  const otherVariants = prepare(`
    SELECT sku, variant_type, variant_value, sell_price, discount_price, stock_count
    FROM storefront_products
    WHERE ikas_product_id = ? AND sku != ?
    ORDER BY sell_price ASC
  `).all(product.ikas_product_id, sku);

  return {
    ...product,
    images: JSON.parse(product.images || '[]'),
    tags,
    panelData,
    competitors,
    otherVariants,
    storefrontUrl: `https://www.petzzshop.com/${product.slug}`
  };
}

// Eşleşmeyen ürünleri getir
export function getUnmatchedProducts({ page = 1, limit = 50, category, brand }) {
  const offset = (page - 1) * limit;
  let whereConditions = ['is_matched = 0'];
  const params = [];

  if (category) {
    whereConditions.push('main_category = ?');
    params.push(category);
  }

  if (brand) {
    whereConditions.push('brand = ?');
    params.push(brand);
  }

  const whereClause = whereConditions.join(' AND ');

  const countResult = prepare(`
    SELECT COUNT(*) as total FROM storefront_products WHERE ${whereClause}
  `).get(...params);

  const products = prepare(`
    SELECT * FROM storefront_products
    WHERE ${whereClause}
    ORDER BY brand, name ASC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  return {
    products: products.map(p => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
      storefrontUrl: `https://www.petzzshop.com/${p.slug}`
    })),
    pagination: {
      page,
      limit,
      total: countResult?.total || 0,
      totalPages: Math.ceil((countResult?.total || 0) / limit)
    }
  };
}

// Tüm etiketleri gruplu getir
export function getAllTags() {
  const tagCounts = prepare(`
    SELECT tag_type, tag_value, COUNT(*) as count
    FROM product_tags
    GROUP BY tag_type, tag_value
    ORDER BY tag_type, count DESC
  `).all();

  const grouped = {};
  for (const tag of tagCounts) {
    if (!grouped[tag.tag_type]) {
      grouped[tag.tag_type] = [];
    }
    grouped[tag.tag_type].push({
      value: tag.tag_value,
      count: tag.count
    });
  }

  return grouped;
}

// Etiket ekle
export function addTag(sku, tagType, tagValue) {
  const existing = prepare(`
    SELECT id FROM product_tags WHERE sku = ? AND tag_type = ? AND tag_value = ?
  `).get(sku, tagType, tagValue);

  if (existing) {
    return { success: false, message: 'Etiket zaten mevcut' };
  }

  prepare(`
    INSERT INTO product_tags (sku, tag_type, tag_value, confidence, source)
    VALUES (?, ?, ?, 1.0, 'manual')
  `).run(sku, tagType, tagValue);

  return { success: true };
}

// Etiket kaldır
export function removeTag(sku, tagType, tagValue) {
  prepare(`
    DELETE FROM product_tags WHERE sku = ? AND tag_type = ? AND tag_value = ?
  `).run(sku, tagType, tagValue);

  return { success: true };
}

// Filtre seçeneklerini getir
export function getFilterOptions() {
  const categories = prepare(`
    SELECT main_category, COUNT(*) as count
    FROM storefront_products
    WHERE main_category IS NOT NULL AND main_category != ''
    GROUP BY main_category
    ORDER BY count DESC
  `).all();

  const brands = prepare(`
    SELECT brand, COUNT(*) as count
    FROM storefront_products
    WHERE brand IS NOT NULL AND brand != ''
    GROUP BY brand
    ORDER BY count DESC
    LIMIT 100
  `).all();

  const tags = getAllTags();

  return { categories, brands, tags };
}

// Analitik verileri getir
export function getStorefrontAnalytics() {
  const overview = prepare(`
    SELECT
      COUNT(*) as total_products,
      SUM(CASE WHEN is_matched = 1 THEN 1 ELSE 0 END) as matched_products,
      SUM(CASE WHEN is_matched = 0 THEN 1 ELSE 0 END) as unmatched_products,
      SUM(CASE WHEN stock_count > 0 THEN 1 ELSE 0 END) as in_stock,
      SUM(CASE WHEN stock_count = 0 THEN 1 ELSE 0 END) as out_of_stock,
      SUM(CASE WHEN discount_percent > 0 THEN 1 ELSE 0 END) as on_sale,
      AVG(sell_price) as avg_price,
      AVG(discount_percent) as avg_discount,
      COUNT(DISTINCT brand) as brand_count,
      COUNT(DISTINCT main_category) as category_count
    FROM storefront_products
  `).get();

  const categoryBreakdown = prepare(`
    SELECT
      main_category,
      COUNT(*) as product_count,
      SUM(CASE WHEN is_matched = 1 THEN 1 ELSE 0 END) as matched_count,
      SUM(CASE WHEN stock_count > 0 THEN 1 ELSE 0 END) as in_stock_count,
      AVG(sell_price) as avg_price,
      AVG(discount_percent) as avg_discount
    FROM storefront_products
    WHERE main_category IS NOT NULL AND main_category != ''
    GROUP BY main_category
    ORDER BY product_count DESC
  `).all();

  const brandBreakdown = prepare(`
    SELECT
      brand,
      COUNT(*) as product_count,
      SUM(CASE WHEN is_matched = 1 THEN 1 ELSE 0 END) as matched_count,
      AVG(sell_price) as avg_price,
      AVG(discount_percent) as avg_discount
    FROM storefront_products
    WHERE brand IS NOT NULL AND brand != ''
    GROUP BY brand
    ORDER BY product_count DESC
    LIMIT 20
  `).all();

  const tagStats = prepare(`
    SELECT tag_type, COUNT(DISTINCT sku) as product_count
    FROM product_tags
    GROUP BY tag_type
    ORDER BY product_count DESC
  `).all();

  const priceComparison = prepare(`
    SELECT
      SUM(CASE WHEN ABS(sp.sell_price - p.selling_price) < 1 THEN 1 ELSE 0 END) as price_match,
      SUM(CASE WHEN sp.sell_price < p.selling_price THEN 1 ELSE 0 END) as storefront_cheaper,
      SUM(CASE WHEN sp.sell_price > p.selling_price THEN 1 ELSE 0 END) as panel_cheaper
    FROM storefront_products sp
    INNER JOIN products p ON sp.panel_product_id = p.id
    WHERE sp.is_matched = 1
  `).get();

  // Stok uyumsuzlukları
  const stockMismatch = prepare(`
    SELECT COUNT(*) as count
    FROM storefront_products sp
    INNER JOIN products p ON sp.panel_product_id = p.id
    WHERE sp.is_matched = 1
    AND ((sp.stock_count > 0 AND p.total_quantity = 0) OR (sp.stock_count = 0 AND p.total_quantity > 0))
  `).get();

  return {
    overview,
    categoryBreakdown,
    brandBreakdown,
    tagStats,
    priceComparison,
    stockMismatch: stockMismatch?.count || 0
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// BUNDLE (PAKET) İLİŞKİ SİSTEMİ
// ═══════════════════════════════════════════════════════════════════════════

// Bundle SKU pattern: {base_sku}-{multiplier} (örn: 406-660964-6)
const BUNDLE_PATTERN = /^(.+)-(\d+)$/;

// Bundle ilişkilerini tespit et ve kaydet
export async function detectAndCreateBundles() {
  console.log('🔍 Bundle ilişkileri tespit ediliyor...');

  // Eşleşmeyen ürünleri al
  const unmatchedProducts = prepare(`
    SELECT sku, name, sell_price, discount_price, stock_count
    FROM storefront_products
    WHERE is_matched = 0
  `).all();

  console.log(`📦 ${unmatchedProducts.length} eşleşmeyen ürün analiz edilecek...`);

  // Mevcut bundle ilişkilerini temizle
  exec(`DELETE FROM product_relations WHERE relation_type = 'bundle'`);

  const stats = {
    analyzed: 0,
    bundlesCreated: 0,
    orphanedBundles: 0,
    multiplierDistribution: {}
  };

  const insertStmt = prepare(`
    INSERT OR REPLACE INTO product_relations (sku, related_sku, relation_type, sort_order, metadata)
    VALUES (?, ?, 'bundle', ?, ?)
  `);

  for (const product of unmatchedProducts) {
    stats.analyzed++;

    const match = product.sku.match(BUNDLE_PATTERN);
    if (!match) continue;

    const baseSku = match[1];
    const multiplier = parseInt(match[2], 10);

    // Base SKU Panel'de var mı kontrol et
    const panelProduct = prepare(`
      SELECT id, code, buying_price, selling_price, name
      FROM products WHERE code = ?
    `).get(baseSku);

    if (panelProduct) {
      // Bundle ilişkisini kaydet
      const metadata = JSON.stringify({
        multiplier,
        base_buying_price: panelProduct.buying_price,
        base_selling_price: panelProduct.selling_price,
        calculated_bundle_price: panelProduct.buying_price * multiplier,
        actual_bundle_price: product.sell_price,
        bundle_name: product.name,
        base_name: panelProduct.name
      });

      insertStmt.run(baseSku, product.sku, multiplier, metadata);
      stats.bundlesCreated++;

      // Multiplier dağılımı
      const key = `x${multiplier}`;
      stats.multiplierDistribution[key] = (stats.multiplierDistribution[key] || 0) + 1;

      // Storefront ürününü güncelle - artık eşleşmiş sayılır (bundle olarak)
      prepare(`
        UPDATE storefront_products
        SET is_matched = 1, panel_product_id = ?
        WHERE sku = ?
      `).run(panelProduct.id, product.sku);
    } else {
      stats.orphanedBundles++;
    }

    // Her 500 üründe event loop'a kontrol ver
    if (stats.analyzed % 500 === 0) {
      await yieldToEventLoop();
    }
  }

  saveDatabase();

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║           BUNDLE TESPİT SONUÇLARI ✅                          ║
╠══════════════════════════════════════════════════════════════╣
║  Analiz Edilen:      ${String(stats.analyzed).padEnd(8)}                           ║
║  Bundle Oluşturulan: ${String(stats.bundlesCreated).padEnd(8)}                           ║
║  Yetim Bundle:       ${String(stats.orphanedBundles).padEnd(8)} (base SKU yok)          ║
╠══════════════════════════════════════════════════════════════╣
║  Çarpan Dağılımı:                                            ║
${Object.entries(stats.multiplierDistribution)
  .sort((a, b) => parseInt(a[0].slice(1)) - parseInt(b[0].slice(1)))
  .map(([k, v]) => `║    ${k.padEnd(6)}: ${String(v).padEnd(6)} paket                              ║`)
  .join('\n')}
╚══════════════════════════════════════════════════════════════╝
  `);

  return stats;
}

// Tüm bundle ilişkilerini getir
export function getBundleRelations({ page = 1, limit = 50, baseSku, multiplier }) {
  const offset = (page - 1) * limit;
  let whereConditions = [`relation_type = 'bundle'`];
  const params = [];

  if (baseSku) {
    whereConditions.push('sku LIKE ?');
    params.push(`%${baseSku}%`);
  }

  if (multiplier) {
    whereConditions.push('sort_order = ?');
    params.push(parseInt(multiplier, 10));
  }

  const whereClause = whereConditions.join(' AND ');

  const countResult = prepare(`
    SELECT COUNT(*) as total FROM product_relations WHERE ${whereClause}
  `).get(...params);

  const bundles = prepare(`
    SELECT
      pr.*,
      p.name as base_name,
      p.buying_price as base_buying_price,
      p.selling_price as base_selling_price,
      sp.name as bundle_name,
      sp.sell_price as bundle_sell_price,
      sp.discount_price as bundle_discount_price,
      sp.stock_count as bundle_stock
    FROM product_relations pr
    LEFT JOIN products p ON pr.sku = p.code
    LEFT JOIN storefront_products sp ON pr.related_sku = sp.sku
    WHERE ${whereClause}
    ORDER BY pr.sku, pr.sort_order
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  // Metadata'yı parse et
  const formattedBundles = bundles.map(b => ({
    ...b,
    metadata: JSON.parse(b.metadata || '{}'),
    multiplier: b.sort_order,
    price_efficiency: b.base_selling_price && b.bundle_sell_price
      ? ((b.base_selling_price * b.sort_order - b.bundle_sell_price) / (b.base_selling_price * b.sort_order) * 100).toFixed(1)
      : null
  }));

  return {
    bundles: formattedBundles,
    pagination: {
      page,
      limit,
      total: countResult?.total || 0,
      totalPages: Math.ceil((countResult?.total || 0) / limit)
    }
  };
}

// Belirli bir base SKU için tüm bundle'ları getir
export function getBundlesByBaseSku(baseSku) {
  const baseProduct = prepare(`
    SELECT p.*, sf.slug as storefront_slug
    FROM products p
    LEFT JOIN (
      SELECT panel_product_id, slug
      FROM storefront_products
      WHERE panel_product_id IS NOT NULL
      GROUP BY panel_product_id
    ) sf ON p.id = sf.panel_product_id
    WHERE p.code = ?
  `).get(baseSku);

  if (!baseProduct) {
    return null;
  }

  const bundles = prepare(`
    SELECT
      pr.*,
      sp.name as bundle_name,
      sp.sell_price,
      sp.discount_price,
      sp.stock_count,
      sp.slug,
      sp.images
    FROM product_relations pr
    LEFT JOIN storefront_products sp ON pr.related_sku = sp.sku
    WHERE pr.sku = ? AND pr.relation_type = 'bundle'
    ORDER BY pr.sort_order
  `).all(baseSku);

  // Tek birim fiyatı ve bundle fiyat karşılaştırması
  const formattedBundles = bundles.map(b => {
    const multiplier = b.sort_order;
    const unitPrice = baseProduct.selling_price;
    const expectedPrice = unitPrice * multiplier;
    const actualPrice = b.sell_price || 0;
    const savings = expectedPrice - actualPrice;
    const savingsPercent = expectedPrice > 0 ? (savings / expectedPrice * 100).toFixed(1) : 0;

    return {
      ...b,
      metadata: JSON.parse(b.metadata || '{}'),
      multiplier,
      unit_price: unitPrice,
      expected_price: expectedPrice,
      actual_price: actualPrice,
      savings,
      savings_percent: savingsPercent,
      images: JSON.parse(b.images || '[]'),
      storefront_url: b.slug ? `https://www.petzzshop.com/${b.slug}` : null
    };
  });

  return {
    baseProduct: {
      ...baseProduct,
      images: JSON.parse(baseProduct.images || '[]'),
      petzzshop_url: baseProduct.storefront_slug ? `https://www.petzzshop.com/${baseProduct.storefront_slug}` : null,
      akakce_url: baseProduct.akakce_url || null
    },
    bundles: formattedBundles,
    summary: {
      total_bundles: bundles.length,
      multipliers: bundles.map(b => b.sort_order).sort((a, b) => a - b),
      total_potential_revenue: formattedBundles.reduce((sum, b) => sum + (b.actual_price * b.stock_count), 0)
    }
  };
}

// Bundle istatistiklerini getir
export function getBundleStats() {
  const overview = prepare(`
    SELECT
      COUNT(*) as total_bundles,
      COUNT(DISTINCT sku) as unique_base_products,
      AVG(sort_order) as avg_multiplier,
      MIN(sort_order) as min_multiplier,
      MAX(sort_order) as max_multiplier
    FROM product_relations
    WHERE relation_type = 'bundle'
  `).get();

  const multiplierDistribution = prepare(`
    SELECT
      sort_order as multiplier,
      COUNT(*) as count
    FROM product_relations
    WHERE relation_type = 'bundle'
    GROUP BY sort_order
    ORDER BY sort_order
  `).all();

  const topBundledProducts = prepare(`
    SELECT
      pr.sku as base_sku,
      p.name as base_name,
      p.brand,
      COUNT(*) as bundle_count,
      GROUP_CONCAT(pr.sort_order) as multipliers
    FROM product_relations pr
    LEFT JOIN products p ON pr.sku = p.code
    WHERE pr.relation_type = 'bundle'
    GROUP BY pr.sku
    ORDER BY bundle_count DESC
    LIMIT 20
  `).all();

  // Fiyat tutarlılığı analizi
  const priceAnalysis = prepare(`
    SELECT
      pr.sku,
      pr.related_sku,
      pr.sort_order as multiplier,
      p.selling_price as unit_price,
      sp.sell_price as bundle_price,
      (p.selling_price * pr.sort_order) as expected_price,
      (p.selling_price * pr.sort_order - sp.sell_price) as savings
    FROM product_relations pr
    LEFT JOIN products p ON pr.sku = p.code
    LEFT JOIN storefront_products sp ON pr.related_sku = sp.sku
    WHERE pr.relation_type = 'bundle'
    AND p.selling_price > 0 AND sp.sell_price > 0
  `).all();

  const avgSavingsPercent = priceAnalysis.length > 0
    ? (priceAnalysis.reduce((sum, p) => {
        const expected = p.unit_price * p.multiplier;
        return sum + (expected > 0 ? (p.savings / expected * 100) : 0);
      }, 0) / priceAnalysis.length).toFixed(1)
    : 0;

  return {
    overview,
    multiplierDistribution,
    topBundledProducts: topBundledProducts.map(p => ({
      ...p,
      multipliers: p.multipliers ? p.multipliers.split(',').map(Number).sort((a, b) => a - b) : []
    })),
    priceAnalysis: {
      total_analyzed: priceAnalysis.length,
      avg_savings_percent: avgSavingsPercent,
      profitable_bundles: priceAnalysis.filter(p => p.savings > 0).length,
      loss_bundles: priceAnalysis.filter(p => p.savings < 0).length
    }
  };
}

export default {
  fetchIkasJSON,
  syncStorefrontProducts,
  quickSyncPrices,
  getLastSyncDate,
  getSyncStatus,
  getStorefrontProducts,
  getStorefrontProductBySku,
  getUnmatchedProducts,
  getAllTags,
  addTag,
  removeTag,
  getFilterOptions,
  getStorefrontAnalytics,
  // Bundle functions
  detectAndCreateBundles,
  getBundleRelations,
  getBundlesByBaseSku,
  getBundleStats
};
