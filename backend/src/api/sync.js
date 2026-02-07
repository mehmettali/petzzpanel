import { prepare, saveDatabase, getDb } from '../db/database.js';
import { fetchAllProducts } from './petzz.js';

// ═══════════════════════════════════════════════════════════════════════════
// GELİŞMİŞ SYNC DURUMU - Gerçek Zamanlı İlerleme ve Log
// ═══════════════════════════════════════════════════════════════════════════

let syncStatus = {
  isRunning: false,
  progress: 0,
  total: 0,
  status: 'idle',
  phase: null,           // 'fetching' | 'processing' | 'saving' | 'completed'
  phaseProgress: 0,      // Mevcut fazın ilerlemesi
  phaseTotal: 0,         // Mevcut fazın toplam sayısı
  percentComplete: 0,    // Toplam yüzde (ondalıklı)
  itemsPerSecond: 0,     // Saniyede işlenen öğe
  estimatedRemaining: null, // Kalan tahmini süre (saniye)
  lastSync: null,
  error: null,
  startedAt: null,
  logs: []               // Canlı log mesajları
};

// Log ekleme fonksiyonu
function addLog(message, type = 'info') {
  const logEntry = {
    time: new Date().toISOString(),
    message,
    type // 'info' | 'success' | 'warning' | 'error'
  };
  syncStatus.logs.push(logEntry);
  // Son 50 log'u tut
  if (syncStatus.logs.length > 50) {
    syncStatus.logs = syncStatus.logs.slice(-50);
  }
  console.log(`[SYNC ${type.toUpperCase()}] ${message}`);
}

// İlerleme güncelleme fonksiyonu
function updateProgress(phase, current, total, extraInfo = {}) {
  syncStatus.phase = phase;
  syncStatus.phaseProgress = current;
  syncStatus.phaseTotal = total;

  // Toplam yüzde hesapla (3 faz: fetch %40, process %40, save %20)
  let basePercent = 0;
  let phaseWeight = 0;

  switch (phase) {
    case 'fetching':
      basePercent = 0;
      phaseWeight = 40;
      break;
    case 'processing':
      basePercent = 40;
      phaseWeight = 40;
      break;
    case 'saving':
      basePercent = 80;
      phaseWeight = 20;
      break;
    case 'completed':
      basePercent = 100;
      phaseWeight = 0;
      break;
  }

  const phasePercent = total > 0 ? (current / total) * phaseWeight : 0;
  syncStatus.percentComplete = Math.round((basePercent + phasePercent) * 10) / 10;

  // Hız ve kalan süre hesapla
  if (syncStatus.startedAt && current > 0) {
    const elapsedSeconds = (Date.now() - syncStatus.startedAt) / 1000;
    syncStatus.itemsPerSecond = Math.round((current / elapsedSeconds) * 10) / 10;

    if (syncStatus.itemsPerSecond > 0 && total > current) {
      syncStatus.estimatedRemaining = Math.round((total - current) / syncStatus.itemsPerSecond);
    }
  }

  // Ekstra bilgileri ekle
  Object.assign(syncStatus, extraInfo);
}

export function getSyncStatus() {
  return { ...syncStatus };
}

// Son logları temizle
export function clearLogs() {
  syncStatus.logs = [];
}

export async function startSync() {
  if (syncStatus.isRunning) {
    throw new Error('Sync already in progress');
  }

  // Sync durumunu sıfırla
  syncStatus = {
    isRunning: true,
    progress: 0,
    total: 0,
    status: 'running',
    phase: 'fetching',
    phaseProgress: 0,
    phaseTotal: 0,
    percentComplete: 0,
    itemsPerSecond: 0,
    estimatedRemaining: null,
    lastSync: null,
    error: null,
    startedAt: Date.now(),
    logs: []
  };

  addLog('🚀 Senkronizasyon başlatıldı', 'info');

  const syncLogResult = prepare(`
    INSERT INTO sync_logs (sync_type, status, started_at)
    VALUES ('full', 'running', datetime('now'))
  `).run();

  const syncLogId = syncLogResult.lastInsertRowid;

  try {
    // ═══════════════════════════════════════════════════════════════════════
    // FAZ 1: API'den Veri Çekme (%40)
    // ═══════════════════════════════════════════════════════════════════════
    addLog('📡 Petzz API\'den ürün verileri çekiliyor...', 'info');

    const products = await fetchAllProducts((progress, total) => {
      syncStatus.progress = progress;
      syncStatus.total = total;
      updateProgress('fetching', progress, total);

      // Her 100 üründe bir log
      if (progress % 100 === 0 || progress === total) {
        addLog(`📦 ${progress}/${total} ürün çekildi (${syncStatus.percentComplete}%)`, 'info');
      }
    });

    addLog(`✅ API'den ${products.length} ürün başarıyla çekildi`, 'success');

    // ═══════════════════════════════════════════════════════════════════════
    // FAZ 2: Veri İşleme (%40)
    // ═══════════════════════════════════════════════════════════════════════
    addLog('🔄 Veriler işleniyor ve hazırlanıyor...', 'info');
    updateProgress('processing', 0, products.length);

    const db = getDb();

    // Mevcut verileri temizle
    addLog('🗑️ Eski veriler temizleniyor...', 'info');
    db.run('DELETE FROM competitors');
    db.run('DELETE FROM product_metas');
    db.run('DELETE FROM products');
    addLog('✅ Eski veriler temizlendi', 'success');

    // İstatistikler
    let productCount = 0;
    let metaCount = 0;
    let competitorCount = 0;
    let withAkakce = 0;
    let activeProducts = 0;
    let outOfStock = 0;

    // ═══════════════════════════════════════════════════════════════════════
    // FAZ 3: Veritabanına Kaydetme (%20)
    // ═══════════════════════════════════════════════════════════════════════
    addLog('💾 Veriler veritabanına kaydediliyor...', 'info');
    updateProgress('saving', 0, products.length);

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const akakce = p.AkakceProduct;

      db.run(`
        INSERT OR REPLACE INTO products (
          id, code, name, site_name, brand, supplier_name, supplier_code,
          main_category, sub_category, detail_category,
          buying_price, selling_price, last_price,
          total_quantity, is_active, is_bundle, is_obsolete,
          vat, deci, images, description,
          akakce_product_id, akakce_low_price, akakce_high_price,
          akakce_petzz_price, akakce_target_price, akakce_drop_price,
          akakce_total_sellers, akakce_url,
          last_seen_at, synced_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [
        p.Id,
        p.Code || `NOCODE-${p.Id}`,
        p.ProductName || p.Code || `Ürün ${p.Id}`,
        p.SiteName || '',
        p.Brand || '',
        p.SupplierName || '',
        p.SupplierCode || '',
        p.MainCategory || '',
        p.SubCategory || '',
        p.DetailCategory || '',
        p.BuyingPrice || 0,
        p.SellingPrice || 0,
        p.LastPrice || 0,
        p.TotalQuantity || 0,
        p.IsActive ? 1 : 0,
        p.IsBundle ? 1 : 0,
        p.IsObsolete ? 1 : 0,
        p.Vat || 0,
        p.Deci || 0,
        JSON.stringify(p.Images || []),
        p.Description || '',
        akakce?.Id || null,
        akakce?.LowPrice || null,
        akakce?.HighPrice || null,
        akakce?.PetzzPrice || null,
        akakce?.TargetPrice || null,
        akakce?.DropPrice || null,
        akakce?.TotalSellers || null,
        akakce?.AkakceUrl || null,
        p.LastSeenAt || null
      ]);

      productCount++;

      // İstatistik topla
      if (p.IsActive) activeProducts++;
      if (p.TotalQuantity === 0) outOfStock++;
      if (akakce?.Id) withAkakce++;

      // Meta verileri kaydet
      if (p.Metas && p.Metas.length > 0) {
        for (const m of p.Metas) {
          db.run(`
            INSERT OR REPLACE INTO product_metas (id, product_id, name, barcode, value, quantity)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [m.Id, p.Id, m.Name, m.Barcode, m.Value, m.Quantity || 0]);
          metaCount++;
        }
      }

      // Rakip verileri kaydet
      if (akakce?.AkakceSellers && akakce.AkakceSellers.length > 0) {
        for (const s of akakce.AkakceSellers) {
          db.run(`
            INSERT OR REPLACE INTO competitors (id, product_id, akakce_product_id, seller_name, seller_price, seller_sort, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [s.Id, p.Id, akakce.Id, s.SellerName, s.SellerPrice, s.SellerSort, s.UpdatedAt]);
          competitorCount++;
        }
      }

      // İlerleme güncelle
      updateProgress('saving', i + 1, products.length);

      // Her 200 üründe bir log
      if ((i + 1) % 200 === 0) {
        addLog(`💾 ${i + 1}/${products.length} ürün kaydedildi (${syncStatus.percentComplete}%)`, 'info');
      }
    }

    // Veritabanını diske kaydet
    addLog('📀 Veritabanı diske yazılıyor...', 'info');
    saveDatabase();
    addLog('✅ Veritabanı kaydedildi', 'success');

    // Tamamlandı
    const totalDuration = Math.round((Date.now() - syncStatus.startedAt) / 1000);
    updateProgress('completed', products.length, products.length);

    // Özet log
    addLog('═══════════════════════════════════════════', 'info');
    addLog('📊 SENKRONIZASYON TAMAMLANDI', 'success');
    addLog(`   • Toplam Ürün: ${productCount.toLocaleString('tr-TR')}`, 'info');
    addLog(`   • Aktif Ürün: ${activeProducts.toLocaleString('tr-TR')}`, 'info');
    addLog(`   • Stoksuz Ürün: ${outOfStock.toLocaleString('tr-TR')}`, 'info');
    addLog(`   • Akakce Eşleşen: ${withAkakce.toLocaleString('tr-TR')}`, 'info');
    addLog(`   • Meta Kayıt: ${metaCount.toLocaleString('tr-TR')}`, 'info');
    addLog(`   • Rakip Kayıt: ${competitorCount.toLocaleString('tr-TR')}`, 'info');
    addLog(`   • Süre: ${totalDuration} saniye`, 'info');
    addLog('═══════════════════════════════════════════', 'info');

    // Veritabanı log güncelle
    prepare(`
      UPDATE sync_logs
      SET status = 'success', total_products = ?, synced_products = ?, completed_at = datetime('now')
      WHERE id = ?
    `).run(products.length, products.length, syncLogId);

    syncStatus = {
      ...syncStatus,
      isRunning: false,
      progress: products.length,
      total: products.length,
      status: 'completed',
      phase: 'completed',
      percentComplete: 100,
      lastSync: new Date().toISOString(),
      error: null,
      stats: {
        totalProducts: productCount,
        activeProducts,
        outOfStock,
        withAkakce,
        metaCount,
        competitorCount,
        duration: totalDuration
      }
    };

    return { success: true, count: products.length, stats: syncStatus.stats };

  } catch (error) {
    addLog(`❌ HATA: ${error.message}`, 'error');
    console.error('Sync failed:', error.message);

    prepare(`
      UPDATE sync_logs
      SET status = 'failed', error_message = ?, completed_at = datetime('now')
      WHERE id = ?
    `).run(error.message, syncLogId);

    syncStatus = {
      ...syncStatus,
      isRunning: false,
      status: 'failed',
      phase: 'failed',
      error: error.message
    };

    throw error;
  }
}

export default { getSyncStatus, startSync, clearLogs };
