import axios from 'axios';
import { initDatabase, prepare, exec, saveDatabase, getDb } from './src/db/database.js';
import { v4 as uuidv4 } from 'uuid';

const IKAS_JSON_URL = 'https://ikas-exporter-app.ikasapps.com/api/exports/5d436c51-cce5-440f-8a93-9d38ba8fb37f/d50df405-abfa-46ca-85a4-6c4670d7f97a.json';

function formatCategoryPath(categories) {
  if (!categories || categories.length === 0) return '';
  const cat = categories[0];
  if (cat.name && Array.isArray(cat.name)) {
    return cat.name.join(' > ');
  }
  return '';
}

function extractCategories(categories) {
  if (!categories || categories.length === 0) return { main: '', sub: '' };
  const cat = categories[0];
  if (cat.name && Array.isArray(cat.name)) {
    return {
      main: cat.name[0] || '',
      sub: cat.name[1] || ''
    };
  }
  return { main: '', sub: '' };
}

function calculateTotalStock(stocks) {
  if (!stocks || stocks.length === 0) return 0;
  return stocks.reduce((sum, s) => sum + (s.stockCount || 0), 0);
}

function calculateDiscountPercent(sellPrice, discountPrice) {
  if (!sellPrice || !discountPrice || sellPrice <= 0) return 0;
  if (discountPrice >= sellPrice) return 0;
  return Math.round((1 - discountPrice / sellPrice) * 100);
}

async function fullSync() {
  await initDatabase();
  const db = getDb();

  console.log('📥 ikas verisi indiriliyor...');
  const res = await axios.get(IKAS_JSON_URL, { timeout: 120000 });
  const ikasProducts = res.data;
  console.log(`✅ ${ikasProducts.length} ürün indirildi`);

  // Panel ürün kodlarını cache'e al
  console.log('📦 Panel ürün kodları yükleniyor...');
  const panelProducts = prepare('SELECT id, code FROM products WHERE code IS NOT NULL').all();
  const panelCache = new Map();
  for (const p of panelProducts) {
    panelCache.set(p.code, p.id);
  }
  console.log(`✅ ${panelCache.size} panel ürün kodu yüklendi`);

  // Mevcut storefront verilerini temizle
  console.log('🗑️ Mevcut storefront verileri temizleniyor...');
  exec('DELETE FROM storefront_products');
  saveDatabase();

  // Insert statement
  const insertStmt = prepare(`
    INSERT INTO storefront_products (
      id, ikas_product_id, ikas_variant_id, sku, name, brand, description, slug,
      category_path, main_category, sub_category, sell_price, buy_price,
      discount_price, discount_percent, stock_count, variant_type, variant_value,
      barcode, images, is_matched, panel_product_id, synced_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const stats = {
    totalVariants: 0,
    matchedCount: 0,
    unmatchedCount: 0
  };

  let processedProducts = 0;

  for (const product of ikasProducts) {
    if (!product.variants) continue;

    const categoryPath = formatCategoryPath(product.categories);
    const { main: mainCategory, sub: subCategory } = extractCategories(product.categories);

    for (const variant of product.variants) {
      if (!variant.sku) continue;

      stats.totalVariants++;

      const sku = variant.sku;
      const panelProductId = panelCache.get(sku) || null;
      const isMatched = panelProductId ? 1 : 0;

      if (isMatched) stats.matchedCount++;
      else stats.unmatchedCount++;

      // Fiyat bilgileri
      const price = variant.prices?.[0] || {};
      const sellPrice = price.sellPrice || 0;
      const buyPrice = price.buyPrice || 0;
      const discountPrice = price.discountPrice || sellPrice;
      const discountPercent = calculateDiscountPercent(sellPrice, discountPrice);

      // Stok
      const stockCount = calculateTotalStock(variant.stocks);

      // Varyant bilgileri
      const variantInfo = variant.variantValues?.[0] || {};
      const variantType = variantInfo.variantTypeName || '';
      const variantValue = variantInfo.variantValueName || '';

      // Görseller
      const images = (variant.images || []).slice(0, 5).map(img => img.imageUrl);

      // Barkod
      const barcode = variant.barcodeList?.[0] || '';

      try {
        insertStmt.run(
          uuidv4(),
          product.id,
          variant.id,
          sku,
          product.name,
          product.brand?.name || '',
          (product.description || '').substring(0, 5000),
          product.metaData?.slug || '',
          categoryPath,
          mainCategory,
          subCategory,
          sellPrice,
          buyPrice,
          discountPrice,
          discountPercent,
          stockCount,
          variantType,
          variantValue,
          barcode,
          JSON.stringify(images),
          isMatched,
          panelProductId,
          new Date().toISOString()
        );
      } catch (e) {
        console.error(`Hata SKU ${sku}:`, e.message);
      }
    }

    processedProducts++;

    // Progress
    if (processedProducts % 500 === 0) {
      const percent = ((processedProducts / ikasProducts.length) * 100).toFixed(1);
      console.log(`📊 [${percent}%] ${processedProducts}/${ikasProducts.length} ürün, ${stats.totalVariants} varyant`);
      saveDatabase();
    }
  }

  saveDatabase();

  // Sync log güncelle
  try {
    prepare(`
      INSERT INTO storefront_sync_logs (status, total_products, total_variants, matched_count, unmatched_count, started_at, completed_at)
      VALUES ('completed', ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(ikasProducts.length, stats.totalVariants, stats.matchedCount, stats.unmatchedCount);
    saveDatabase();
  } catch (e) {
    console.log('Sync log kaydedilemedi:', e.message);
  }

  const matchRate = stats.totalVariants > 0 ? ((stats.matchedCount / stats.totalVariants) * 100).toFixed(1) : 0;

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║             FULL SYNC TAMAMLANDI ✅                           ║
╠══════════════════════════════════════════════════════════════╣
║  Ana Ürün:         ${String(ikasProducts.length).padEnd(8)}                             ║
║  Toplam Varyant:   ${String(stats.totalVariants).padEnd(8)}                             ║
║  Eşleşen:          ${String(stats.matchedCount).padEnd(8)} (%${matchRate})                   ║
║  Eşleşmeyen:       ${String(stats.unmatchedCount).padEnd(8)}                             ║
╚══════════════════════════════════════════════════════════════╝
  `);
}

fullSync().catch(console.error);
