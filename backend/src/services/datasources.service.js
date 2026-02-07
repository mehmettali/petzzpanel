import { prepare, saveDatabase, getDb } from '../db/database.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// ═══════════════════════════════════════════════════════════════════════════
// VERİ KAYNAKLARI YÖNETİM SERVİSİ
// ═══════════════════════════════════════════════════════════════════════════

// Veri kaynakları tanımları
const DATA_SOURCES = {
  petzz: {
    id: 'petzz',
    name: 'Petzz Panel API',
    description: 'Ana ürün veritabanı - stok, fiyat, kategori bilgileri',
    icon: 'database',
    color: 'blue',
    apiUrl: process.env.PETZZ_API_URL,
    required: true
  },
  ikas: {
    id: 'ikas',
    name: 'ikas Storefront',
    description: 'E-ticaret vitrini - yayınlanan ürünler',
    icon: 'store',
    color: 'purple',
    apiUrl: process.env.IKAS_API_URL || null,
    required: false
  },
  akakce: {
    id: 'akakce',
    name: 'Akakce Fiyat',
    description: 'Rakip fiyat karşılaştırma verileri',
    icon: 'chart',
    color: 'orange',
    apiUrl: null, // Petzz API üzerinden geliyor
    required: false
  }
};

// Kaynak durumları (memory'de tutulur)
let sourceStatuses = {
  petzz: { status: 'unknown', lastCheck: null, lastSync: null, error: null, stats: null },
  ikas: { status: 'unknown', lastCheck: null, lastSync: null, error: null, stats: null },
  akakce: { status: 'unknown', lastCheck: null, lastSync: null, error: null, stats: null }
};

// Aktif sync işlemleri
let activeSyncs = {};

// ─────────────────────────────────────────────────────────────────────────────
// API BAĞLANTI TESTLERİ
// ─────────────────────────────────────────────────────────────────────────────

// Petzz API bağlantı testi
async function checkPetzzConnection() {
  const startTime = Date.now();

  // Environment variable kontrolü
  const apiUrl = process.env.PETZZ_API_URL;
  if (!apiUrl) {
    return {
      status: 'offline',
      message: 'PETZZ_API_URL tanımlı değil (.env dosyasını kontrol edin)',
      error: 'Missing API URL'
    };
  }

  try {
    const response = await axios.post(
      `${apiUrl}/api/Users/login`,
      {
        username: process.env.PETZZ_USERNAME,
        password: process.env.PETZZ_PASSWORD
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000 // 10 saniye timeout
      }
    );

    if (response.data?.token) {
      const latency = Date.now() - startTime;
      return {
        status: 'online',
        latency,
        message: `Bağlantı başarılı (${latency}ms)`,
        token: response.data.token,
        expiry: response.data.expiration
      };
    } else {
      return {
        status: 'error',
        message: 'Token alınamadı - geçersiz yanıt',
        error: 'Invalid response'
      };
    }
  } catch (error) {
    let errorMsg;
    let status = 'offline';

    if (error.response?.status === 500) {
      errorMsg = 'Petzz API sunucu hatası (500) - Geçici olarak kullanılamıyor';
    } else if (error.response?.status === 401) {
      errorMsg = 'Kimlik doğrulama başarısız - kullanıcı adı/şifre hatalı';
    } else if (error.code === 'ECONNABORTED') {
      errorMsg = 'Bağlantı zaman aşımına uğradı (10sn)';
    } else if (error.code === 'ENOTFOUND') {
      errorMsg = 'Sunucu bulunamadı - DNS hatası';
    } else if (error.code === 'ECONNREFUSED') {
      errorMsg = 'Bağlantı reddedildi - sunucu kapalı';
    } else if (error.message?.includes('Invalid URL')) {
      errorMsg = `Geçersiz URL: ${apiUrl}`;
    } else {
      errorMsg = error.message || 'Bilinmeyen hata';
    }

    return {
      status,
      message: errorMsg,
      error: error.message,
      httpStatus: error.response?.status,
      apiUrl: apiUrl // Debug için
    };
  }
}

// ikas API bağlantı testi
async function checkIkasConnection() {
  const startTime = Date.now();
  // ikas bağlantısı için storefront tablosunu kontrol et
  try {
    const result = prepare(`
      SELECT COUNT(*) as count, MAX(synced_at) as lastSync
      FROM storefront_products
    `).get();

    if (result.count > 0) {
      return {
        status: 'online',
        latency: Date.now() - startTime,
        message: `${result.count.toLocaleString('tr-TR')} ürün mevcut`,
        lastSync: result.lastSync,
        productCount: result.count
      };
    } else {
      return {
        status: 'empty',
        message: 'Henüz veri yok',
        productCount: 0
      };
    }
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      error: error.message
    };
  }
}

// Akakce veri durumu kontrolü
async function checkAkakceStatus() {
  try {
    const result = prepare(`
      SELECT
        COUNT(DISTINCT product_id) as productCount,
        COUNT(*) as sellerCount,
        MAX(updated_at) as lastUpdate
      FROM competitors
    `).get();

    const akakceProducts = prepare(`
      SELECT COUNT(*) as count
      FROM products
      WHERE akakce_product_id IS NOT NULL
    `).get();

    return {
      status: result.productCount > 0 ? 'online' : 'empty',
      message: result.productCount > 0
        ? `${akakceProducts.count.toLocaleString('tr-TR')} ürün eşleşmiş, ${result.sellerCount.toLocaleString('tr-TR')} satıcı kaydı`
        : 'Henüz Akakce verisi yok',
      productCount: akakceProducts.count,
      sellerCount: result.sellerCount,
      lastUpdate: result.lastUpdate
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      error: error.message
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ANA FONKSİYONLAR
// ─────────────────────────────────────────────────────────────────────────────

// Tüm veri kaynaklarının durumunu getir
export async function getDataSourcesStatus() {
  // Her kaynağı paralel kontrol et
  const [petzzStatus, ikasStatus, akakceStatus] = await Promise.all([
    checkPetzzConnection(),
    checkIkasConnection(),
    checkAkakceStatus()
  ]);

  // Veritabanından son sync bilgilerini al
  const lastSyncs = prepare(`
    SELECT sync_type, status, completed_at, synced_products
    FROM sync_logs
    WHERE status = 'success'
    ORDER BY completed_at DESC
    LIMIT 10
  `).all();

  // Durumları güncelle
  sourceStatuses.petzz = {
    ...sourceStatuses.petzz,
    ...petzzStatus,
    lastCheck: new Date().toISOString(),
    isActive: !!activeSyncs.petzz
  };

  sourceStatuses.ikas = {
    ...sourceStatuses.ikas,
    ...ikasStatus,
    lastCheck: new Date().toISOString(),
    isActive: !!activeSyncs.ikas
  };

  sourceStatuses.akakce = {
    ...sourceStatuses.akakce,
    ...akakceStatus,
    lastCheck: new Date().toISOString()
  };

  // Veritabanı istatistikleri
  const dbStats = prepare(`
    SELECT
      COUNT(*) as totalProducts,
      SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as activeProducts,
      SUM(CASE WHEN total_quantity = 0 THEN 1 ELSE 0 END) as outOfStock,
      SUM(CASE WHEN akakce_product_id IS NOT NULL THEN 1 ELSE 0 END) as withAkakce,
      MAX(synced_at) as lastProductSync
    FROM products
  `).get();

  return {
    sources: Object.keys(DATA_SOURCES).map(key => ({
      ...DATA_SOURCES[key],
      ...sourceStatuses[key]
    })),
    database: {
      totalProducts: dbStats.totalProducts || 0,
      activeProducts: dbStats.activeProducts || 0,
      outOfStock: dbStats.outOfStock || 0,
      withAkakce: dbStats.withAkakce || 0,
      lastSync: dbStats.lastProductSync
    },
    lastSyncs: lastSyncs.slice(0, 5)
  };
}

// Belirli bir kaynağı senkronize et
export async function syncDataSource(sourceId, onProgress) {
  if (activeSyncs[sourceId]) {
    throw new Error(`${sourceId} zaten senkronize ediliyor`);
  }

  activeSyncs[sourceId] = {
    startedAt: Date.now(),
    progress: 0,
    total: 0,
    phase: 'starting',
    logs: []
  };

  const addLog = (message, type = 'info') => {
    const log = { time: new Date().toISOString(), message, type };
    activeSyncs[sourceId].logs.push(log);
    if (activeSyncs[sourceId].logs.length > 100) {
      activeSyncs[sourceId].logs = activeSyncs[sourceId].logs.slice(-100);
    }
    console.log(`[${sourceId.toUpperCase()} SYNC] ${message}`);
    if (onProgress) onProgress(activeSyncs[sourceId]);
  };

  try {
    switch (sourceId) {
      case 'petzz':
        return await syncPetzzData(addLog, onProgress);
      case 'ikas':
        return await syncIkasData(addLog, onProgress);
      default:
        throw new Error(`Bilinmeyen kaynak: ${sourceId}`);
    }
  } catch (error) {
    addLog(`❌ HATA: ${error.message}`, 'error');
    sourceStatuses[sourceId] = {
      ...sourceStatuses[sourceId],
      status: 'error',
      error: error.message,
      lastCheck: new Date().toISOString()
    };
    throw error;
  } finally {
    delete activeSyncs[sourceId];
  }
}

// Sync durumunu getir
export function getSyncProgress(sourceId) {
  if (sourceId) {
    return activeSyncs[sourceId] || null;
  }
  return activeSyncs;
}

// ─────────────────────────────────────────────────────────────────────────────
// PETZZ SYNC
// ─────────────────────────────────────────────────────────────────────────────

async function syncPetzzData(addLog, onProgress) {
  addLog('🚀 Petzz API senkronizasyonu başlatıldı', 'info');

  // Önce bağlantı kontrolü
  addLog('🔌 API bağlantısı kontrol ediliyor...', 'info');
  const connectionCheck = await checkPetzzConnection();

  if (connectionCheck.status !== 'online') {
    throw new Error(`API bağlantısı başarısız: ${connectionCheck.message}`);
  }

  addLog(`✅ API bağlantısı başarılı (${connectionCheck.latency}ms)`, 'success');

  const token = connectionCheck.token;
  const sync = activeSyncs.petzz;

  // Sync log kaydı oluştur
  const syncLogResult = prepare(`
    INSERT INTO sync_logs (sync_type, status, started_at)
    VALUES ('petzz', 'running', datetime('now'))
  `).run();
  const syncLogId = syncLogResult.lastInsertRowid;

  try {
    // İlk sayfa - toplam sayıyı al
    addLog('📡 Ürün sayısı alınıyor...', 'info');
    sync.phase = 'counting';

    const countResponse = await axios.get(
      `${process.env.PETZZ_API_URL}/odata/HamurlabsProduct?$top=1&$count=true&$filter=(IsBundle eq false) and (IsObsolete eq false)`,
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 30000
      }
    );

    const totalCount = countResponse.data['@odata.count'];
    sync.total = totalCount;
    addLog(`📦 Toplam ${totalCount.toLocaleString('tr-TR')} ürün bulundu`, 'success');

    // Ürünleri sayfalı olarak çek
    sync.phase = 'fetching';
    const pageSize = 100;
    let allProducts = [];
    let skip = 0;

    while (skip < totalCount) {
      const pageResponse = await axios.get(
        `${process.env.PETZZ_API_URL}/odata/HamurlabsProduct?$top=${pageSize}&$skip=${skip}&$expand=Analytics,Metas,AkakceProduct($expand=AkakceSellers)&$filter=(IsBundle eq false) and (IsObsolete eq false)`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          timeout: 60000
        }
      );

      const products = pageResponse.data.value || [];
      allProducts = allProducts.concat(products);
      sync.progress = allProducts.length;

      const percent = ((allProducts.length / totalCount) * 100).toFixed(1);
      if (allProducts.length % 500 === 0 || allProducts.length === totalCount) {
        addLog(`📥 ${allProducts.length.toLocaleString('tr-TR')}/${totalCount.toLocaleString('tr-TR')} ürün çekildi (%${percent})`, 'info');
      }

      if (onProgress) {
        onProgress({
          ...sync,
          percentComplete: parseFloat(percent)
        });
      }

      skip += pageSize;

      // Rate limiting için küçük bekleme
      await new Promise(r => setTimeout(r, 50));
    }

    // Veritabanına kaydet
    addLog('💾 Veriler veritabanına kaydediliyor...', 'info');
    sync.phase = 'saving';

    const db = getDb();

    // Mevcut verileri temizle
    db.run('DELETE FROM competitors');
    db.run('DELETE FROM product_metas');
    db.run('DELETE FROM products');

    let savedCount = 0;
    let metaCount = 0;
    let competitorCount = 0;

    let analyticsCount = 0;
    for (const p of allProducts) {
      const akakce = p.AkakceProduct;

      // Analytics verilerini al (satış hızı)
      const analytics = p.Analytics;
      if (analytics && (analytics.Sales15Days > 0 || analytics.Sales30Days > 0)) {
        analyticsCount++;
      }

      // Petzz API alan adları: Sales15Days, Sales30Days, Sales60Days, Sales90Days
      const sales15 = analytics?.Sales15Days || 0;
      const sales30 = analytics?.Sales30Days || 0;
      const sales60 = analytics?.Sales60Days || 0;
      const sales90 = analytics?.Sales90Days || 0;
      const dailyAvgSales = sales30 > 0 ? (sales30 / 30) : 0;

      // Ana ürün bilgilerini kaydet
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

      // Analytics verilerini ayrı UPDATE ile kaydet (INSERT sonrası)
      if (sales15 > 0 || sales30 > 0 || sales60 > 0 || sales90 > 0) {
        db.run(`
          UPDATE products
          SET sales_15 = ?, sales_30 = ?, sales_60 = ?, sales_90 = ?, daily_avg_sales = ?
          WHERE id = ?
        `, [sales15, sales30, sales60, sales90, dailyAvgSales, p.Id]);
      }

      savedCount++;

      // Metas
      if (p.Metas?.length > 0) {
        for (const m of p.Metas) {
          db.run(`
            INSERT OR REPLACE INTO product_metas (id, product_id, name, barcode, value, quantity)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [m.Id, p.Id, m.Name, m.Barcode, m.Value, m.Quantity || 0]);
          metaCount++;
        }
      }

      // Competitors
      if (akakce?.AkakceSellers?.length > 0) {
        for (const s of akakce.AkakceSellers) {
          db.run(`
            INSERT OR REPLACE INTO competitors (id, product_id, akakce_product_id, seller_name, seller_price, seller_sort, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [s.Id, p.Id, akakce.Id, s.SellerName, s.SellerPrice, s.SellerSort, s.UpdatedAt]);
          competitorCount++;
        }
      }

      if (savedCount % 1000 === 0) {
        addLog(`💾 ${savedCount.toLocaleString('tr-TR')} ürün kaydedildi...`, 'info');
      }
    }

    saveDatabase();

    // Sync log güncelle
    const duration = Math.round((Date.now() - sync.startedAt) / 1000);
    prepare(`
      UPDATE sync_logs
      SET status = 'success', total_products = ?, synced_products = ?, completed_at = datetime('now')
      WHERE id = ?
    `).run(totalCount, savedCount, syncLogId);

    // Durum güncelle
    sourceStatuses.petzz = {
      status: 'online',
      lastCheck: new Date().toISOString(),
      lastSync: new Date().toISOString(),
      error: null,
      stats: {
        totalProducts: savedCount,
        metaCount,
        competitorCount,
        duration
      }
    };

    addLog('═══════════════════════════════════════════', 'info');
    addLog('✅ SENKRONIZASYON TAMAMLANDI', 'success');
    addLog(`   • Ürün: ${savedCount.toLocaleString('tr-TR')}`, 'info');
    addLog(`   • Meta: ${metaCount.toLocaleString('tr-TR')}`, 'info');
    addLog(`   • Rakip: ${competitorCount.toLocaleString('tr-TR')}`, 'info');
    addLog(`   • Analytics: ${analyticsCount.toLocaleString('tr-TR')} ürün satış verisi`, 'info');
    addLog(`   • Süre: ${duration} saniye`, 'info');
    addLog('═══════════════════════════════════════════', 'info');

    sync.phase = 'completed';

    return {
      success: true,
      stats: sourceStatuses.petzz.stats
    };

  } catch (error) {
    prepare(`
      UPDATE sync_logs
      SET status = 'failed', error_message = ?, completed_at = datetime('now')
      WHERE id = ?
    `).run(error.message, syncLogId);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// IKAS SYNC (Placeholder - mevcut sistemi kullanır)
// ─────────────────────────────────────────────────────────────────────────────

async function syncIkasData(addLog, onProgress) {
  addLog('🚀 ikas senkronizasyonu başlatıldı', 'info');

  // ikas sync logic would go here
  // For now, just update the status based on existing data

  const result = prepare(`
    SELECT COUNT(*) as count FROM storefront_products
  `).get();

  addLog(`📦 Mevcut ${result.count.toLocaleString('tr-TR')} storefront ürünü`, 'info');
  addLog('✅ ikas durumu güncellendi', 'success');

  sourceStatuses.ikas = {
    status: 'online',
    lastCheck: new Date().toISOString(),
    productCount: result.count
  };

  return { success: true, productCount: result.count };
}

export default {
  DATA_SOURCES,
  getDataSourcesStatus,
  syncDataSource,
  getSyncProgress,
  checkPetzzConnection
};
