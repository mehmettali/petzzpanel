import axios from 'axios';
import { initDatabase, prepare, saveDatabase } from './src/db/database.js';

async function manualSync() {
  await initDatabase();

  console.log('📥 ikas verisi indiriliyor...');
  const url = 'https://ikas-exporter-app.ikasapps.com/api/exports/5d436c51-cce5-440f-8a93-9d38ba8fb37f/d50df405-abfa-46ca-85a4-6c4670d7f97a.json';

  const res = await axios.get(url, { timeout: 60000 });
  const ikasProducts = res.data;
  console.log('✅ ' + ikasProducts.length + ' ürün indirildi');

  // Update statement
  const updateStmt = prepare(`
    UPDATE storefront_products
    SET sell_price = ?, discount_price = ?, stock_count = ?, price_updated_at = datetime('now')
    WHERE sku = ?
  `);

  let updated = 0;
  let skipped = 0;
  let totalVariants = 0;

  for (const product of ikasProducts) {
    if (!product.variants) continue;

    for (const variant of product.variants) {
      if (!variant.sku) continue;

      totalVariants++;

      const price = variant.prices?.[0] || {};
      const sellPrice = price.sellPrice || 0;
      const discountPrice = price.discountPrice || sellPrice;

      // Stok hesapla
      let stock = 0;
      if (variant.stocks) {
        for (const s of variant.stocks) {
          stock += (s.stockCount || 0);
        }
      }

      try {
        updateStmt.run(sellPrice, discountPrice, stock, variant.sku);
        updated++;
      } catch (e) {
        skipped++;
      }
    }

    // Progress
    if (ikasProducts.indexOf(product) % 1000 === 0) {
      console.log(`İşlenen: ${ikasProducts.indexOf(product)}/${ikasProducts.length}`);
    }
  }

  saveDatabase();

  // Sync log güncelle
  prepare(`
    UPDATE storefront_sync_logs
    SET status = 'completed', completed_at = datetime('now'), total_variants = ?, matched_count = ?
    WHERE id = (SELECT MAX(id) FROM storefront_sync_logs)
  `).run(totalVariants, updated);
  saveDatabase();

  console.log('\n✅ SYNC TAMAMLANDI');
  console.log('Toplam varyant:', totalVariants);
  console.log('Güncellenen:', updated);
  console.log('Atlanan:', skipped);
}

manualSync().catch(console.error);
