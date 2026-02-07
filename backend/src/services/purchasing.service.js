import { prepare } from '../db/database.js';

// ═══════════════════════════════════════════════════════════════════════════
// SATIN ALMA SERVİSİ - E-TİCARET UZMAN PERSPEKTİFİ
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// STOK DEVİR HIZI & TAHMİNİ STOK GÜNÜ HESAPLAMA
// ─────────────────────────────────────────────────────────────────────────────

// Stok hareketlerinden günlük ortalama satış hesapla (son 30 gün)
function calculateDailySalesRate(stockHistory) {
  if (!stockHistory || stockHistory.length < 2) return null;

  // Stok düşüşlerini bul (satış = stok azalması)
  let totalSold = 0;
  for (let i = 1; i < stockHistory.length; i++) {
    const diff = stockHistory[i-1].quantity - stockHistory[i].quantity;
    if (diff > 0) totalSold += diff;
  }

  // Gün sayısı hesapla
  const firstDate = new Date(stockHistory[0].recorded_at);
  const lastDate = new Date(stockHistory[stockHistory.length - 1].recorded_at);
  const days = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)));

  return totalSold / days;
}

// Tahmini stok günü hesapla
function calculateDaysOfStock(currentStock, dailySalesRate) {
  if (!dailySalesRate || dailySalesRate <= 0) return null;
  return Math.round(currentStock / dailySalesRate);
}

// ─────────────────────────────────────────────────────────────────────────────
// SİPARİŞ ÖNCELİK SKORU HESAPLAMA (0-100) - LEGACY
// ─────────────────────────────────────────────────────────────────────────────
// Faktörler:
// - Stok durumu (40 puan): 0 stok = 40, kritik = 30, düşük = 15
// - Satış hızı (25 puan): Hızlı satan = daha yüksek puan
// - Marj (20 puan): Yüksek marjlı ürünler öncelikli
// - Rekabet pozisyonu (15 puan): Akakce'de iyi fiyatlı = yüksek puan

function calculatePriorityScore(product) {
  let score = 0;
  const factors = {};

  // 1. STOK DURUMU (40 puan)
  if (product.total_quantity === 0) {
    factors.stock = 40;
  } else if (product.total_quantity < 5) {
    factors.stock = 30;
  } else if (product.total_quantity < 10) {
    factors.stock = 20;
  } else if (product.total_quantity < 20) {
    factors.stock = 10;
  } else {
    factors.stock = 0;
  }
  score += factors.stock;

  // 2. SATIŞ HIZI (25 puan) - Tahmini günlük satış oranına göre
  if (product.daily_sales_rate) {
    if (product.daily_sales_rate >= 2) factors.velocity = 25;      // Çok hızlı
    else if (product.daily_sales_rate >= 1) factors.velocity = 20;  // Hızlı
    else if (product.daily_sales_rate >= 0.5) factors.velocity = 15; // Normal
    else if (product.daily_sales_rate >= 0.2) factors.velocity = 10; // Yavaş
    else factors.velocity = 5;
  } else {
    factors.velocity = 12; // Veri yok, ortalama puan
  }
  score += factors.velocity;

  // 3. MARJ (20 puan)
  const margin = product.selling_price > 0 && product.buying_price > 0
    ? ((product.selling_price - product.buying_price) / product.selling_price) * 100
    : 0;

  if (margin >= 30) factors.margin = 20;
  else if (margin >= 25) factors.margin = 16;
  else if (margin >= 20) factors.margin = 12;
  else if (margin >= 15) factors.margin = 8;
  else if (margin >= 10) factors.margin = 4;
  else factors.margin = 0;
  score += factors.margin;

  // 4. REKABET POZİSYONU (15 puan)
  if (product.akakce_low_price && product.selling_price) {
    const priceDiff = ((product.selling_price - product.akakce_low_price) / product.akakce_low_price) * 100;

    if (priceDiff <= 0) factors.competition = 15;       // En ucuz
    else if (priceDiff <= 5) factors.competition = 12;  // Rekabetçi
    else if (priceDiff <= 10) factors.competition = 8;  // Kabul edilebilir
    else if (priceDiff <= 20) factors.competition = 4;  // Pahalı
    else factors.competition = 0;                        // Çok pahalı
  } else {
    factors.competition = 7; // Veri yok, ortalama puan
  }
  score += factors.competition;

  return { score: Math.min(100, score), factors };
}

// ═══════════════════════════════════════════════════════════════════════════
// SATIN ALMA KARAR MOTORU (Purchasing Decision Engine)
// ═══════════════════════════════════════════════════════════════════════════
// Ağırlıklar:
// - Stokout riski: %45 (45 puan)
// - Satış hızı / potansiyel: %25 (25 puan)
// - Kârlılık: %20 (20 puan)
// - Rekabet pozisyonu: %10 (10 puan)
// ═══════════════════════════════════════════════════════════════════════════

// Konfigürasyon sabitleri
const ENGINE_CONFIG = {
  leadTimeDays: 7,           // Tedarik süresi (gün)
  safetyStockDays: 3,        // Güvenlik stoku (gün)
  targetCoverDays: 30,       // Hedef stok karşılama süresi (gün)
  priceTolerancePct: 5,      // Fiyat toleransı (%)
  minMarginPct: 10,          // Minimum kabul edilebilir marj (%)
  criticalStockThreshold: 5, // Kritik stok eşiği
  lowStockThreshold: 10      // Düşük stok eşiği
};

// Yeni öncelik skoru hesaplama (Karar Motoru için)
function calculateDecisionScore(product, derived) {
  let score = 0;
  const factors = {};
  const reasons = [];

  // 1. STOKOUT RİSKİ (45 puan)
  if (product.total_quantity === 0) {
    factors.stockoutRisk = 45;
    reasons.push('Stok tamamen tükendi - ACİL SİPARİŞ');
  } else if (derived.daysOfCover !== null && derived.daysOfCover < 7) {
    factors.stockoutRisk = 40;
    reasons.push(`Stok ${Math.round(derived.daysOfCover)} gün içinde tükenecek`);
  } else if (product.total_quantity < ENGINE_CONFIG.criticalStockThreshold) {
    factors.stockoutRisk = 35;
    reasons.push(`Kritik stok seviyesi: ${product.total_quantity} adet`);
  } else if (derived.daysOfCover !== null && derived.daysOfCover < 14) {
    factors.stockoutRisk = 25;
    reasons.push(`Düşük stok karşılama: ${Math.round(derived.daysOfCover)} gün`);
  } else if (product.total_quantity < ENGINE_CONFIG.lowStockThreshold) {
    factors.stockoutRisk = 20;
    reasons.push(`Düşük stok: ${product.total_quantity} adet`);
  } else if (derived.daysOfCover !== null && derived.daysOfCover < 30) {
    factors.stockoutRisk = 10;
    reasons.push(`Stok yakında azalabilir: ${Math.round(derived.daysOfCover)} gün`);
  } else {
    factors.stockoutRisk = 0;
  }
  score += factors.stockoutRisk;

  // 2. SATIŞ HIZI / POTANSİYEL (25 puan)
  if (derived.dailySalesRate !== null) {
    if (derived.dailySalesRate >= 3) {
      factors.velocity = 25;
      reasons.push(`Çok hızlı satış: günde ${derived.dailySalesRate.toFixed(1)} adet`);
    } else if (derived.dailySalesRate >= 1.5) {
      factors.velocity = 22;
      reasons.push(`Hızlı satış: günde ${derived.dailySalesRate.toFixed(1)} adet`);
    } else if (derived.dailySalesRate >= 0.7) {
      factors.velocity = 18;
      reasons.push(`İyi satış hızı: günde ${derived.dailySalesRate.toFixed(1)} adet`);
    } else if (derived.dailySalesRate >= 0.3) {
      factors.velocity = 12;
      reasons.push(`Normal satış hızı: günde ${derived.dailySalesRate.toFixed(2)} adet`);
    } else if (derived.dailySalesRate >= 0.1) {
      factors.velocity = 6;
      reasons.push(`Yavaş satış: haftada ${(derived.dailySalesRate * 7).toFixed(1)} adet`);
    } else {
      factors.velocity = 2;
      reasons.push('Çok yavaş satış - dikkatli değerlendir');
    }
  } else {
    factors.velocity = 10; // Veri yok - ortalama tahmin
    reasons.push('Satış verisi yetersiz');
  }
  score += factors.velocity;

  // 3. KARLILIK (20 puan)
  const margin = product.selling_price > 0 && product.buying_price > 0
    ? ((product.selling_price - product.buying_price) / product.selling_price) * 100
    : 0;

  if (margin >= 35) {
    factors.profitability = 20;
    reasons.push(`Yüksek kârlılık: %${margin.toFixed(1)} marj`);
  } else if (margin >= 28) {
    factors.profitability = 17;
    reasons.push(`İyi kârlılık: %${margin.toFixed(1)} marj`);
  } else if (margin >= 22) {
    factors.profitability = 14;
  } else if (margin >= 15) {
    factors.profitability = 10;
  } else if (margin >= 10) {
    factors.profitability = 5;
    reasons.push(`Düşük marj: %${margin.toFixed(1)}`);
  } else if (margin > 0) {
    factors.profitability = 2;
    reasons.push(`Çok düşük marj: %${margin.toFixed(1)} - fiyat revizyonu gerekli`);
  } else {
    factors.profitability = 0;
    reasons.push('Negatif veya sıfır marj - DURDUR');
  }
  score += factors.profitability;

  // 4. REKABET POZİSYONU (10 puan)
  if (derived.priceGapPct !== null) {
    if (derived.priceGapPct <= 0) {
      factors.competition = 10;
      reasons.push('Piyasada en ucuz fiyat');
    } else if (derived.priceGapPct <= ENGINE_CONFIG.priceTolerancePct) {
      factors.competition = 8;
      reasons.push(`Rekabetçi fiyat: Akakce'den %${derived.priceGapPct.toFixed(1)} yüksek`);
    } else if (derived.priceGapPct <= 10) {
      factors.competition = 5;
      reasons.push(`Kabul edilebilir fiyat farkı: %${derived.priceGapPct.toFixed(1)}`);
    } else if (derived.priceGapPct <= 20) {
      factors.competition = 2;
      reasons.push(`Fiyat pahalı: Akakce'den %${derived.priceGapPct.toFixed(1)} yüksek - FİYAT DÜZELT`);
    } else {
      factors.competition = 0;
      reasons.push(`Çok pahalı: Akakce'den %${derived.priceGapPct.toFixed(1)} yüksek - satış zor`);
    }
  } else {
    factors.competition = 5; // Veri yok - ortalama
  }
  score += factors.competition;

  return { score: Math.min(100, score), factors, reasons, margin };
}

// Aksiyon belirleme
function determineAction(product, derived, score, margin) {
  // DURDUR: Negatif marj veya hiç talep yok
  if (margin <= 0) {
    return 'STOP';
  }

  // FİYAT DÜZELT: Rekabette çok pahalı
  if (derived.priceGapPct !== null && derived.priceGapPct > 15) {
    return 'FIX_PRICE';
  }

  // SİPARİŞ VER: Yüksek skor ve stok ROP altında
  if (score >= 50 && (product.total_quantity === 0 ||
      (derived.rop !== null && product.total_quantity < derived.rop))) {
    return 'ORDER';
  }

  // SİPARİŞ VER: Kritik stok seviyesi
  if (product.total_quantity === 0 && score >= 30) {
    return 'ORDER';
  }

  // İZLE: Orta skor veya belirsiz veri
  if (score >= 25 || derived.dailySalesRate === null) {
    return 'WATCH';
  }

  // DURDUR: Düşük potansiyel
  return 'STOP';
}

// Önerilen sipariş miktarı hesaplama
function calculateSuggestedOrder(product, derived) {
  if (derived.dailySalesRate === null || derived.dailySalesRate <= 0) {
    // Satış verisi yoksa minimum 1 adet öner (eğer stok 0 ise)
    return product.total_quantity === 0 ? 1 : 0;
  }

  // ÖnerilenSipariş = max(0, (günlükSatış × hedefGün) - mevcutStok)
  const targetStock = derived.dailySalesRate * ENGINE_CONFIG.targetCoverDays;
  const suggestedQty = Math.max(0, Math.ceil(targetStock - product.total_quantity));

  return suggestedQty;
}

// ─────────────────────────────────────────────────────────────────────────────
// ANA KARAR MOTORU FONKSİYONU
// ─────────────────────────────────────────────────────────────────────────────

export function getPurchasingDecisionEngine({
  supplier,
  category,
  brand,
  minScore = 0,
  action = null,
  stockStatus = 'low', // 'all', 'low', 'zero', 'critical'
  limit = 300
}) {
  let whereConditions = ['p.is_active = 1'];
  const params = [];

  // Stok durumu filtresi
  if (stockStatus === 'zero') {
    whereConditions.push('p.total_quantity = 0');
  } else if (stockStatus === 'critical') {
    whereConditions.push('p.total_quantity < 5');
  } else if (stockStatus === 'low') {
    whereConditions.push('p.total_quantity < 20');
  }
  // stockStatus === 'all' ise filtre ekleme

  if (supplier) {
    whereConditions.push('p.supplier_name = ?');
    params.push(supplier);
  }

  if (category) {
    whereConditions.push('p.main_category = ?');
    params.push(category);
  }

  if (brand) {
    whereConditions.push('p.brand = ?');
    params.push(brand);
  }

  // Ürün verilerini çek
  const products = prepare(`
    SELECT
      p.id, p.code, p.name, p.brand, p.supplier_name,
      p.main_category, p.sub_category,
      p.buying_price, p.selling_price, p.total_quantity,
      p.akakce_low_price, p.akakce_high_price, p.akakce_petzz_price,
      p.akakce_total_sellers, p.akakce_url,
      CASE WHEN sf.slug IS NOT NULL THEN 'https://www.petzzshop.com/' || sf.slug ELSE NULL END as petzzshop_url
    FROM products p
    LEFT JOIN (
      SELECT panel_product_id, slug
      FROM storefront_products
      WHERE panel_product_id IS NOT NULL
      GROUP BY panel_product_id
    ) sf ON p.id = sf.panel_product_id
    WHERE ${whereConditions.join(' AND ')}
    ORDER BY p.total_quantity ASC
    LIMIT ?
  `).all(...params, limit * 2);

  // Her ürün için metrikler hesapla
  const items = [];
  let totalOrderCost = 0;
  let totalOutOfStock = 0;
  let totalCriticalStock = 0;
  let scoreSum = 0;
  let potentialDailyLoss = 0;

  for (const p of products) {
    // Stok geçmişinden satış hızı hesapla
    const stockHistory = prepare(`
      SELECT quantity, recorded_at
      FROM stock_history
      WHERE sku = ?
      ORDER BY recorded_at DESC
      LIMIT 30
    `).all(p.code);

    const dailySalesRate = calculateDailySalesRate(stockHistory);

    // Derived değerleri hesapla
    const derived = {
      dailySalesRate: dailySalesRate !== null ? Math.round(dailySalesRate * 100) / 100 : null,
      daysOfCover: p.total_quantity > 0 && dailySalesRate > 0
        ? Math.round(p.total_quantity / dailySalesRate)
        : (p.total_quantity === 0 ? 0 : null),
      rop: dailySalesRate > 0
        ? Math.ceil((dailySalesRate * ENGINE_CONFIG.leadTimeDays) + (dailySalesRate * ENGINE_CONFIG.safetyStockDays))
        : null,
      priceGapPct: p.akakce_low_price > 0 && p.selling_price > 0
        ? Math.round(((p.selling_price - p.akakce_low_price) / p.akakce_low_price) * 1000) / 10
        : null
    };

    // Karar skoru hesapla
    const { score, factors, reasons, margin } = calculateDecisionScore(p, derived);

    // Aksiyon belirle
    const itemAction = determineAction(p, derived, score, margin);

    // Aksiyon filtresi
    if (action && itemAction !== action) continue;

    // Minimum skor filtresi
    if (score < minScore) continue;

    // Önerilen sipariş miktarı
    const suggestedOrderQty = itemAction === 'ORDER' ? calculateSuggestedOrder(p, derived) : 0;
    const suggestedOrderCost = suggestedOrderQty * (p.buying_price || 0);

    // KPI hesaplamaları
    if (p.total_quantity === 0) totalOutOfStock++;
    if (p.total_quantity > 0 && p.total_quantity < ENGINE_CONFIG.criticalStockThreshold) totalCriticalStock++;
    scoreSum += score;
    if (itemAction === 'ORDER') totalOrderCost += suggestedOrderCost;
    if (p.total_quantity === 0 && dailySalesRate) {
      potentialDailyLoss += dailySalesRate * (p.selling_price || 0);
    }

    // Öncelik etiketi
    let priorityLabel = 'LOW';
    if (score >= 70) priorityLabel = 'HIGH';
    else if (score >= 45) priorityLabel = 'MEDIUM';

    items.push({
      productId: p.id,
      code: p.code,
      name: p.name,
      brand: p.brand,
      supplierName: p.supplier_name,
      mainCategory: p.main_category,
      subCategory: p.sub_category,
      currentStock: p.total_quantity,
      buyingPrice: p.buying_price,
      sellingPrice: p.selling_price,
      akakceLowPrice: p.akakce_low_price,
      akakceTotalSellers: p.akakce_total_sellers,
      akakceUrl: p.akakce_url,
      petzzshopUrl: p.petzzshop_url,
      priorityScore: score,
      priorityLabel,
      priorityFactors: factors,
      suggestedOrderQty,
      suggestedOrderCost: Math.round(suggestedOrderCost * 100) / 100,
      action: itemAction,
      reasons,
      derived,
      marginPct: Math.round(margin * 10) / 10
    });
  }

  // Öncelik skoruna göre sırala
  items.sort((a, b) => b.priorityScore - a.priorityScore);

  // Limit uygula
  const limitedItems = items.slice(0, limit);

  // Aksiyon dağılımı
  const actionDistribution = {
    ORDER: limitedItems.filter(i => i.action === 'ORDER').length,
    WATCH: limitedItems.filter(i => i.action === 'WATCH').length,
    FIX_PRICE: limitedItems.filter(i => i.action === 'FIX_PRICE').length,
    STOP: limitedItems.filter(i => i.action === 'STOP').length
  };

  // Öncelik dağılımı
  const priorityDistribution = {
    HIGH: limitedItems.filter(i => i.priorityLabel === 'HIGH').length,
    MEDIUM: limitedItems.filter(i => i.priorityLabel === 'MEDIUM').length,
    LOW: limitedItems.filter(i => i.priorityLabel === 'LOW').length
  };

  return {
    kpis: {
      totalOutOfStock,
      totalCriticalStock,
      avgPriorityScore: items.length > 0 ? Math.round(scoreSum / items.length) : 0,
      potentialDailyLoss: Math.round(potentialDailyLoss),
      totalOrderCost: Math.round(totalOrderCost),
      totalItems: limitedItems.length
    },
    actionDistribution,
    priorityDistribution,
    config: ENGINE_CONFIG,
    items: limitedItems
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AKILLI SİPARİŞ LİSTESİ (Öncelik skoruyla)
// ─────────────────────────────────────────────────────────────────────────────

export function getSmartReorderList({ supplier, category, minScore = 0, limit = 200 }) {
  let whereConditions = ['p.total_quantity < 10', 'p.is_active = 1'];
  const params = [];

  if (supplier) {
    whereConditions.push('p.supplier_name = ?');
    params.push(supplier);
  }

  if (category) {
    whereConditions.push('p.main_category = ?');
    params.push(category);
  }

  // Temel ürün verileri
  const products = prepare(`
    SELECT
      p.id, p.code, p.name, p.brand, p.supplier_name,
      p.main_category, p.sub_category,
      p.buying_price, p.selling_price, p.total_quantity,
      p.akakce_low_price, p.akakce_high_price, p.akakce_petzz_price,
      p.akakce_total_sellers, p.akakce_url,
      CASE WHEN sf.slug IS NOT NULL THEN 'https://www.petzzshop.com/' || sf.slug ELSE NULL END as petzzshop_url,
      ROUND((p.selling_price - p.buying_price) / p.selling_price * 100, 1) as margin_percent,
      CASE
        WHEN p.akakce_low_price > 0 THEN
          ROUND((p.selling_price - p.akakce_low_price) / p.akakce_low_price * 100, 1)
        ELSE NULL
      END as price_diff_percent
    FROM products p
    LEFT JOIN (
      SELECT panel_product_id, slug
      FROM storefront_products
      WHERE panel_product_id IS NOT NULL
      GROUP BY panel_product_id
    ) sf ON p.id = sf.panel_product_id
    WHERE ${whereConditions.join(' AND ')}
    ORDER BY p.total_quantity ASC, p.selling_price DESC
    LIMIT ?
  `).all(...params, limit * 2);

  // Her ürün için stok geçmişinden satış hızı hesapla
  const enrichedProducts = products.map(p => {
    // Son 30 günlük stok geçmişi
    const stockHistory = prepare(`
      SELECT quantity, recorded_at
      FROM stock_history
      WHERE sku = ?
      ORDER BY recorded_at DESC
      LIMIT 30
    `).all(p.code);

    const dailySalesRate = calculateDailySalesRate(stockHistory);
    const daysOfStock = p.total_quantity > 0 ? calculateDaysOfStock(p.total_quantity, dailySalesRate) : 0;

    const productWithMetrics = {
      ...p,
      daily_sales_rate: dailySalesRate,
      days_of_stock: daysOfStock,
      stock_history_count: stockHistory.length
    };

    const { score, factors } = calculatePriorityScore(productWithMetrics);

    return {
      ...productWithMetrics,
      priority_score: score,
      priority_factors: factors,
      priority_level: score >= 70 ? 'critical' : score >= 50 ? 'high' : score >= 30 ? 'medium' : 'low'
    };
  });

  // Öncelik skoruna göre sırala ve filtrele
  return enrichedProducts
    .filter(p => p.priority_score >= minScore)
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, limit);
}

// ─────────────────────────────────────────────────────────────────────────────
// GELİŞMİŞ SATIN ALMA ÖZETİ
// ─────────────────────────────────────────────────────────────────────────────

export function getAdvancedPurchasingSummary() {
  // Temel metrikler
  const basic = prepare(`
    SELECT
      COUNT(*) as total_products,
      SUM(CASE WHEN total_quantity = 0 AND is_active = 1 THEN 1 ELSE 0 END) as out_of_stock,
      SUM(CASE WHEN total_quantity > 0 AND total_quantity < 5 AND is_active = 1 THEN 1 ELSE 0 END) as critical_stock,
      SUM(CASE WHEN total_quantity >= 5 AND total_quantity < 10 AND is_active = 1 THEN 1 ELSE 0 END) as low_stock,
      SUM(CASE WHEN total_quantity >= 50 THEN 1 ELSE 0 END) as overstock,
      SUM(total_quantity * buying_price) as total_inventory_value,
      SUM(CASE WHEN total_quantity = 0 AND is_active = 1 THEN buying_price ELSE 0 END) as reorder_estimated_cost
    FROM products
  `).get();

  // Kategoriye göre stok durumu
  const categoryStock = prepare(`
    SELECT
      main_category,
      COUNT(*) as total,
      SUM(CASE WHEN total_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
      SUM(CASE WHEN total_quantity > 0 AND total_quantity < 5 THEN 1 ELSE 0 END) as critical,
      ROUND(SUM(CASE WHEN total_quantity = 0 THEN 1.0 ELSE 0 END) / COUNT(*) * 100, 1) as out_of_stock_rate
    FROM products
    WHERE is_active = 1 AND main_category IS NOT NULL
    GROUP BY main_category
    ORDER BY out_of_stock DESC
  `).all();

  // Tedarikçiye göre sipariş ihtiyacı
  const supplierOrders = prepare(`
    SELECT
      supplier_name,
      COUNT(*) as items_to_order,
      SUM(buying_price) as estimated_cost,
      ROUND(AVG(
        CASE WHEN akakce_low_price > 0 THEN
          (selling_price - akakce_low_price) / akakce_low_price * 100
        ELSE NULL END
      ), 1) as avg_price_position
    FROM products
    WHERE total_quantity = 0 AND is_active = 1
      AND supplier_name IS NOT NULL AND supplier_name != ''
    GROUP BY supplier_name
    ORDER BY items_to_order DESC
    LIMIT 20
  `).all();

  // Akakce rekabet analizi
  const competitionAnalysis = prepare(`
    SELECT
      SUM(CASE WHEN selling_price <= akakce_low_price THEN 1 ELSE 0 END) as cheapest,
      SUM(CASE WHEN selling_price > akakce_low_price AND selling_price <= akakce_low_price * 1.05 THEN 1 ELSE 0 END) as competitive,
      SUM(CASE WHEN selling_price > akakce_low_price * 1.05 AND selling_price <= akakce_low_price * 1.15 THEN 1 ELSE 0 END) as acceptable,
      SUM(CASE WHEN selling_price > akakce_low_price * 1.15 THEN 1 ELSE 0 END) as expensive,
      COUNT(*) as total_with_akakce
    FROM products
    WHERE akakce_low_price IS NOT NULL AND akakce_low_price > 0 AND is_active = 1
  `).get();

  // Öncelik dağılımı
  const smartList = getSmartReorderList({ limit: 500 });
  const priorityDistribution = {
    critical: smartList.filter(p => p.priority_level === 'critical').length,
    high: smartList.filter(p => p.priority_level === 'high').length,
    medium: smartList.filter(p => p.priority_level === 'medium').length,
    low: smartList.filter(p => p.priority_level === 'low').length
  };

  // Potansiyel kayıp (stoksuz ürünlerin günlük tahmini satış kaybı)
  const potentialLoss = smartList
    .filter(p => p.total_quantity === 0 && p.daily_sales_rate)
    .reduce((sum, p) => sum + (p.daily_sales_rate * p.selling_price), 0);

  return {
    // Stok Durumu
    stock: {
      outOfStock: basic.out_of_stock || 0,
      critical: basic.critical_stock || 0,
      low: basic.low_stock || 0,
      overstock: basic.overstock || 0,
      totalValue: basic.total_inventory_value || 0,
      reorderCost: basic.reorder_estimated_cost || 0
    },
    // Kategori Analizi
    categoryAnalysis: categoryStock,
    // Tedarikçi Siparişleri
    supplierOrders,
    // Rekabet Analizi
    competition: competitionAnalysis,
    // Öncelik Dağılımı
    priorityDistribution,
    // Potansiyel Günlük Kayıp
    potentialDailyLoss: Math.round(potentialLoss),
    // Acil Aksiyon Gerektiren
    urgentActionCount: priorityDistribution.critical + priorityDistribution.high
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TEDARİKÇİ PERFORMANS ANALİZİ
// ─────────────────────────────────────────────────────────────────────────────

export function getSupplierPerformance() {
  return prepare(`
    SELECT
      supplier_name,
      COUNT(*) as total_products,
      SUM(CASE WHEN total_quantity > 0 THEN 1 ELSE 0 END) as in_stock_products,
      SUM(CASE WHEN total_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_products,
      ROUND(SUM(CASE WHEN total_quantity > 0 THEN 1.0 ELSE 0 END) / COUNT(*) * 100, 1) as availability_rate,
      SUM(total_quantity * buying_price) as inventory_value,
      ROUND(AVG(
        CASE WHEN selling_price > 0 AND buying_price > 0 THEN
          (selling_price - buying_price) / selling_price * 100
        ELSE NULL END
      ), 1) as avg_margin,
      COUNT(DISTINCT main_category) as category_count,
      COUNT(DISTINCT brand) as brand_count
    FROM products
    WHERE supplier_name IS NOT NULL AND supplier_name != ''
    GROUP BY supplier_name
    HAVING total_products >= 5
    ORDER BY total_products DESC
  `).all();
}

// ─────────────────────────────────────────────────────────────────────────────
// HIZLI HAREKET EDEN ÜRÜNLER (Fast Movers)
// ─────────────────────────────────────────────────────────────────────────────

export function getFastMovers({ limit = 50, minSalesRate = 0.5 }) {
  const products = prepare(`
    SELECT
      p.id, p.code, p.name, p.brand, p.supplier_name,
      p.main_category, p.total_quantity,
      p.buying_price, p.selling_price,
      p.akakce_low_price
    FROM products p
    WHERE p.is_active = 1
    ORDER BY p.total_quantity ASC
    LIMIT 500
  `).all();

  const withSalesRate = products.map(p => {
    const stockHistory = prepare(`
      SELECT quantity, recorded_at
      FROM stock_history
      WHERE sku = ?
      ORDER BY recorded_at DESC
      LIMIT 30
    `).all(p.code);

    return {
      ...p,
      daily_sales_rate: calculateDailySalesRate(stockHistory),
      days_of_stock: p.total_quantity > 0
        ? calculateDaysOfStock(p.total_quantity, calculateDailySalesRate(stockHistory))
        : 0
    };
  });

  return withSalesRate
    .filter(p => p.daily_sales_rate && p.daily_sales_rate >= minSalesRate)
    .sort((a, b) => b.daily_sales_rate - a.daily_sales_rate)
    .slice(0, limit);
}

// ─────────────────────────────────────────────────────────────────────────────
// YAVAŞ HAREKET EDEN ÜRÜNLER (Slow Movers / Dead Stock Risk)
// ─────────────────────────────────────────────────────────────────────────────

export function getSlowMovers({ limit = 50, minStock = 20 }) {
  const products = prepare(`
    SELECT
      p.id, p.code, p.name, p.brand, p.supplier_name,
      p.main_category, p.total_quantity,
      p.buying_price, p.selling_price,
      p.total_quantity * p.buying_price as stock_value
    FROM products p
    WHERE p.is_active = 1 AND p.total_quantity >= ?
    ORDER BY p.total_quantity * p.buying_price DESC
    LIMIT 200
  `).all(minStock);

  const withSalesRate = products.map(p => {
    const stockHistory = prepare(`
      SELECT quantity, recorded_at
      FROM stock_history
      WHERE sku = ?
      ORDER BY recorded_at DESC
      LIMIT 60
    `).all(p.code);

    const dailySalesRate = calculateDailySalesRate(stockHistory);

    return {
      ...p,
      daily_sales_rate: dailySalesRate,
      days_of_stock: dailySalesRate ? calculateDaysOfStock(p.total_quantity, dailySalesRate) : 999
    };
  });

  // Yavaş hareket edenler: düşük satış hızı veya veri yok
  return withSalesRate
    .filter(p => !p.daily_sales_rate || p.daily_sales_rate < 0.1 || p.days_of_stock > 180)
    .sort((a, b) => b.stock_value - a.stock_value)
    .slice(0, limit);
}

// ─────────────────────────────────────────────────────────────────────────────
// KATEGORİ BAZLI STOK DEVİR ANALİZİ
// ─────────────────────────────────────────────────────────────────────────────

export function getCategoryTurnoverAnalysis() {
  const categories = prepare(`
    SELECT
      main_category,
      COUNT(*) as product_count,
      SUM(total_quantity) as total_units,
      SUM(total_quantity * buying_price) as inventory_value,
      SUM(CASE WHEN total_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
      ROUND(AVG(
        CASE WHEN selling_price > 0 AND buying_price > 0 THEN
          (selling_price - buying_price) / selling_price * 100
        ELSE NULL END
      ), 1) as avg_margin
    FROM products
    WHERE is_active = 1 AND main_category IS NOT NULL
    GROUP BY main_category
  `).all();

  // Her kategori için ortalama devir hızı hesapla
  return categories.map(cat => {
    const turnoverData = prepare(`
      SELECT AVG(turnover_rate) as avg_turnover
      FROM category_turnover_history cth
      INNER JOIN google_taxonomy gt ON cth.google_category_id = gt.id
      WHERE gt.full_path LIKE ?
    `).get(`%${cat.main_category}%`);

    return {
      ...cat,
      avg_turnover_rate: turnoverData?.avg_turnover || null,
      out_of_stock_rate: cat.product_count > 0
        ? Math.round(cat.out_of_stock / cat.product_count * 100)
        : 0
    };
  }).sort((a, b) => b.inventory_value - a.inventory_value);
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY FUNCTIONS (Geriye uyumluluk için)
// ─────────────────────────────────────────────────────────────────────────────

export function getReorderList({ supplier, category, minValue = 0 }) {
  let whereConditions = ['p.total_quantity = 0', 'p.is_active = 1'];
  const params = [];

  if (supplier) {
    whereConditions.push('p.supplier_name = ?');
    params.push(supplier);
  }

  if (category) {
    whereConditions.push('p.main_category = ?');
    params.push(category);
  }

  if (minValue > 0) {
    whereConditions.push('p.selling_price >= ?');
    params.push(minValue);
  }

  return prepare(`
    SELECT
      p.id, p.code, p.name, p.brand, p.supplier_name,
      p.main_category, p.sub_category,
      p.buying_price, p.selling_price,
      p.akakce_low_price, p.akakce_total_sellers, p.akakce_url,
      CASE WHEN sf.slug IS NOT NULL THEN 'https://www.petzzshop.com/' || sf.slug ELSE NULL END as petzzshop_url
    FROM products p
    LEFT JOIN (
      SELECT panel_product_id, slug
      FROM storefront_products
      WHERE panel_product_id IS NOT NULL
      GROUP BY panel_product_id
    ) sf ON p.id = sf.panel_product_id
    WHERE ${whereConditions.join(' AND ')}
    ORDER BY p.selling_price DESC
  `).all(...params);
}

export function getCriticalStock({ threshold = 5 }) {
  return prepare(`
    SELECT
      id, code, name, brand, supplier_name,
      main_category, total_quantity,
      buying_price, selling_price
    FROM products
    WHERE total_quantity > 0
      AND total_quantity < ?
      AND is_active = 1
    ORDER BY total_quantity ASC, selling_price DESC
  `).all(threshold);
}

export function getDeadStock({ minQuantity = 50 }) {
  return prepare(`
    SELECT
      id, code, name, brand, supplier_name,
      main_category, total_quantity,
      buying_price,
      total_quantity * buying_price as stock_value,
      last_seen_at
    FROM products
    WHERE total_quantity >= ?
      AND is_active = 1
    ORDER BY stock_value DESC
    LIMIT 100
  `).all(minQuantity);
}

export function getSupplierOrderSummary() {
  return prepare(`
    SELECT
      supplier_name,
      COUNT(*) as reorder_items,
      SUM(buying_price) as estimated_cost,
      GROUP_CONCAT(DISTINCT main_category) as categories
    FROM products
    WHERE total_quantity = 0
      AND is_active = 1
      AND supplier_name IS NOT NULL
      AND supplier_name != ''
    GROUP BY supplier_name
    ORDER BY reorder_items DESC
  `).all();
}

export function getOrderBySupplier(supplierName) {
  return prepare(`
    SELECT
      id, code, name, brand,
      main_category,
      buying_price, selling_price,
      akakce_low_price
    FROM products
    WHERE supplier_name = ?
      AND total_quantity = 0
      AND is_active = 1
    ORDER BY main_category, name
  `).all(supplierName);
}

export function getInventoryBySupplier() {
  return prepare(`
    SELECT
      supplier_name,
      COUNT(*) as total_products,
      SUM(total_quantity) as total_units,
      SUM(total_quantity * buying_price) as inventory_value,
      SUM(CASE WHEN total_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_count,
      ROUND(SUM(CASE WHEN total_quantity = 0 THEN 1.0 ELSE 0 END) / COUNT(*) * 100, 2) as out_of_stock_rate
    FROM products
    WHERE supplier_name IS NOT NULL AND supplier_name != ''
    GROUP BY supplier_name
    ORDER BY inventory_value DESC
  `).all();
}

export function getInventoryByCategory() {
  return prepare(`
    SELECT
      main_category,
      COUNT(*) as total_products,
      SUM(total_quantity) as total_units,
      SUM(total_quantity * buying_price) as inventory_value,
      SUM(CASE WHEN total_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_count
    FROM products
    WHERE main_category IS NOT NULL
    GROUP BY main_category
    ORDER BY inventory_value DESC
  `).all();
}

export function getPurchasingSummary() {
  const reorderNeeded = prepare(`
    SELECT COUNT(*) as count, SUM(buying_price) as estimated_value
    FROM products WHERE total_quantity = 0 AND is_active = 1
  `).get();

  const criticalStock = prepare(`
    SELECT COUNT(*) as count
    FROM products WHERE total_quantity > 0 AND total_quantity < 5 AND is_active = 1
  `).get();

  const totalInventory = prepare(`
    SELECT SUM(total_quantity * buying_price) as value
    FROM products
  `).get();

  const supplierCount = prepare(`
    SELECT COUNT(DISTINCT supplier_name) as count
    FROM products WHERE total_quantity = 0 AND is_active = 1
  `).get();

  return {
    reorderNeeded: reorderNeeded?.count || 0,
    reorderValue: reorderNeeded?.estimated_value || 0,
    criticalStock: criticalStock?.count || 0,
    totalInventoryValue: totalInventory?.value || 0,
    suppliersToOrder: supplierCount?.count || 0
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SATIN ALMA STRATEJİLERİ (Purchasing Strategies)
// ═══════════════════════════════════════════════════════════════════════════

// Strateji şablonları
const STRATEGY_TEMPLATES = {
  weekly_90day: {
    id: 'weekly_90day',
    name: 'Haftalık Alım (90 Gün Ortalama)',
    description: '90 günlük satış ortalamasına göre haftalık stok ihtiyacı',
    analysisDays: 90,
    coverDays: 7,
    safetyMultiplier: 1.2, // %20 güvenlik payı
    minOrderValue: 500,
    icon: 'calendar-week'
  },
  biweekly_60day: {
    id: 'biweekly_60day',
    name: '2 Haftalık Alım (60 Gün Ortalama)',
    description: '60 günlük satış ortalamasına göre 2 haftalık stok ihtiyacı',
    analysisDays: 60,
    coverDays: 14,
    safetyMultiplier: 1.15,
    minOrderValue: 1000,
    icon: 'calendar'
  },
  monthly_90day: {
    id: 'monthly_90day',
    name: 'Aylık Alım (90 Gün Ortalama)',
    description: '90 günlük satış ortalamasına göre aylık stok ihtiyacı',
    analysisDays: 90,
    coverDays: 30,
    safetyMultiplier: 1.1,
    minOrderValue: 2500,
    icon: 'calendar-month'
  }
};

// 90 günlük satış ortalamasını hesapla (stok geçmişinden)
function calculate90DaySalesRate(sku) {
  const stockHistory = prepare(`
    SELECT quantity, recorded_at
    FROM stock_history
    WHERE sku = ?
    ORDER BY recorded_at DESC
    LIMIT 90
  `).all(sku);

  if (!stockHistory || stockHistory.length < 2) return null;

  // Stok düşüşlerini bul (satış = stok azalması)
  let totalSold = 0;
  for (let i = 1; i < stockHistory.length; i++) {
    const diff = stockHistory[i-1].quantity - stockHistory[i].quantity;
    if (diff > 0) totalSold += diff;
  }

  // Gün sayısı hesapla
  const firstDate = new Date(stockHistory[0].recorded_at);
  const lastDate = new Date(stockHistory[stockHistory.length - 1].recorded_at);
  const days = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)));

  return {
    dailyRate: totalSold / days,
    totalSold,
    analysisDays: days,
    dataPoints: stockHistory.length
  };
}

// Satın Alma Stratejisi Oluştur
export function generatePurchasingStrategy({
  templateId = 'weekly_90day',
  supplier = null,
  category = null,
  brand = null,
  limit = 500
}) {
  const template = STRATEGY_TEMPLATES[templateId] || STRATEGY_TEMPLATES.weekly_90day;

  // Filtreler - stoku düşük olanları öncelikle al
  let whereConditions = ['p.is_active = 1', 'p.total_quantity < 20'];
  const params = [];

  if (supplier) {
    whereConditions.push('p.supplier_name = ?');
    params.push(supplier);
  }
  if (category) {
    whereConditions.push('p.main_category = ?');
    params.push(category);
  }
  if (brand) {
    whereConditions.push('p.brand = ?');
    params.push(brand);
  }

  // Düşük stoklu ürünleri çek
  const products = prepare(`
    SELECT
      p.id, p.code, p.name, p.brand, p.supplier_name,
      p.main_category, p.sub_category,
      p.buying_price, p.selling_price, p.total_quantity,
      p.akakce_low_price, p.akakce_high_price,
      CASE WHEN sf.slug IS NOT NULL THEN 'https://www.petzzshop.com/' || sf.slug ELSE NULL END as petzzshop_url,
      -- Vitrin stoku (varsa)
      COALESCE((SELECT SUM(sf2.stock_count) FROM storefront_products sf2 WHERE sf2.panel_product_id = p.id), 0) as vitrin_stock
    FROM products p
    LEFT JOIN (
      SELECT panel_product_id, slug
      FROM storefront_products
      WHERE panel_product_id IS NOT NULL
      GROUP BY panel_product_id
    ) sf ON p.id = sf.panel_product_id
    WHERE ${whereConditions.join(' AND ')}
    ORDER BY p.total_quantity ASC, p.selling_price DESC
    LIMIT ?
  `).all(...params, limit * 2);

  // Her ürün için strateji hesapla
  const recommendations = [];
  let totalOrderCost = 0;
  let totalOrderUnits = 0;
  let totalProducts = 0;
  const bySupplier = {};
  const byCategory = {};
  const byBrand = {};
  const byPriority = { critical: [], high: [], medium: [], low: [] };

  for (const p of products) {
    // Satış hızı hesapla (varsa)
    const salesData = calculate90DaySalesRate(p.code);

    // Satış verisi yoksa fiyata göre varsayılan satış hızı tahmin et
    // Pahalı ürünler daha yavaş, ucuz ürünler daha hızlı satar varsayımı
    let dailyRate = 0.1; // Varsayılan: haftada 0.7 adet
    let hasRealSalesData = false;

    if (salesData && salesData.dailyRate >= 0.01) {
      dailyRate = salesData.dailyRate;
      hasRealSalesData = true;
    } else if (p.selling_price) {
      // Fiyata göre tahmini satış hızı
      if (p.selling_price < 100) dailyRate = 0.3;       // Ucuz: haftada ~2
      else if (p.selling_price < 300) dailyRate = 0.2;  // Orta: haftada ~1.4
      else if (p.selling_price < 600) dailyRate = 0.15; // Pahalı: haftada ~1
      else dailyRate = 0.1;                              // Çok pahalı: haftada ~0.7
    }

    // Hedef stok hesapla
    const targetStock = Math.ceil(dailyRate * template.coverDays * template.safetyMultiplier);
    const currentStock = p.total_quantity || 0;
    const orderQty = Math.max(0, targetStock - currentStock);

    // Stok 0 ise en az 1 adet öner
    const finalOrderQty = currentStock === 0 ? Math.max(1, orderQty) : orderQty;

    if (finalOrderQty === 0) continue; // Sipariş gerekmiyorsa atla

    const orderCost = finalOrderQty * (p.buying_price || 0);
    if (orderCost < 5) continue; // Çok küçük siparişleri atla

    // Marj hesapla
    const margin = p.selling_price > 0 && p.buying_price > 0
      ? ((p.selling_price - p.buying_price) / p.selling_price) * 100
      : 0;

    // Öncelik belirle
    let priority = 'low';
    let priorityScore = 0;
    const daysOfStock = dailyRate > 0 ? currentStock / dailyRate : 999;

    if (currentStock === 0) {
      priority = 'critical';
      priorityScore = 100;
    } else if (daysOfStock < 3) {
      priority = 'critical';
      priorityScore = 90;
    } else if (daysOfStock < 7) {
      priority = 'high';
      priorityScore = 70;
    } else if (daysOfStock < 14) {
      priority = 'medium';
      priorityScore = 50;
    } else {
      priority = 'low';
      priorityScore = 30;
    }

    // Satış hızına göre bonus puan
    if (dailyRate >= 1) priorityScore += 15;
    else if (dailyRate >= 0.5) priorityScore += 10;
    else if (dailyRate >= 0.2) priorityScore += 5;

    const item = {
      productId: p.id,
      code: p.code,
      name: p.name,
      brand: p.brand,
      supplierName: p.supplier_name,
      mainCategory: p.main_category,
      currentStock,
      targetStock,
      orderQty: finalOrderQty,
      orderCost: Math.round(orderCost * 100) / 100,
      buyingPrice: p.buying_price,
      sellingPrice: p.selling_price,
      marginPct: Math.round(margin * 10) / 10,
      dailySalesRate: Math.round(dailyRate * 100) / 100,
      weeklySalesRate: Math.round(dailyRate * 7 * 10) / 10,
      daysOfStock: Math.round(daysOfStock),
      priority,
      priorityScore,
      petzzshopUrl: p.petzzshop_url,
      hasRealSalesData,
      analysisInfo: salesData ? {
        totalSold: salesData.totalSold,
        analysisDays: salesData.analysisDays,
        dataPoints: salesData.dataPoints
      } : { estimated: true }
    };

    recommendations.push(item);
    totalOrderCost += orderCost;
    totalOrderUnits += finalOrderQty;
    totalProducts++;

    // Grupla
    byPriority[priority].push(item);

    const supplierKey = p.supplier_name || 'Bilinmiyor';
    if (!bySupplier[supplierKey]) {
      bySupplier[supplierKey] = { items: 0, units: 0, cost: 0, products: [] };
    }
    bySupplier[supplierKey].items++;
    bySupplier[supplierKey].units += finalOrderQty;
    bySupplier[supplierKey].cost += orderCost;
    bySupplier[supplierKey].products.push(item);

    const categoryKey = p.main_category || 'Diğer';
    if (!byCategory[categoryKey]) {
      byCategory[categoryKey] = { items: 0, units: 0, cost: 0 };
    }
    byCategory[categoryKey].items++;
    byCategory[categoryKey].units += finalOrderQty;
    byCategory[categoryKey].cost += orderCost;

    const brandKey = p.brand || 'Diğer';
    if (!byBrand[brandKey]) {
      byBrand[brandKey] = { items: 0, units: 0, cost: 0 };
    }
    byBrand[brandKey].items++;
    byBrand[brandKey].units += finalOrderQty;
    byBrand[brandKey].cost += orderCost;
  }

  // Önceliğe göre sırala
  recommendations.sort((a, b) => b.priorityScore - a.priorityScore);

  // Tedarikçi özetini sırala
  const supplierSummary = Object.entries(bySupplier)
    .map(([name, data]) => ({
      name,
      items: data.items,
      units: data.units,
      cost: Math.round(data.cost * 100) / 100,
      topProducts: data.products.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 5)
    }))
    .sort((a, b) => b.cost - a.cost);

  // Kategori özetini sırala
  const categorySummary = Object.entries(byCategory)
    .map(([name, data]) => ({
      name,
      items: data.items,
      units: data.units,
      cost: Math.round(data.cost * 100) / 100
    }))
    .sort((a, b) => b.cost - a.cost);

  // Marka özetini sırala
  const brandSummary = Object.entries(byBrand)
    .map(([name, data]) => ({
      name,
      items: data.items,
      units: data.units,
      cost: Math.round(data.cost * 100) / 100
    }))
    .sort((a, b) => b.cost - a.cost);

  return {
    template: {
      ...template,
      generatedAt: new Date().toISOString()
    },
    summary: {
      totalProducts,
      totalOrderUnits,
      totalOrderCost: Math.round(totalOrderCost * 100) / 100,
      avgOrderValue: totalProducts > 0 ? Math.round(totalOrderCost / totalProducts * 100) / 100 : 0,
      priorityBreakdown: {
        critical: byPriority.critical.length,
        high: byPriority.high.length,
        medium: byPriority.medium.length,
        low: byPriority.low.length
      }
    },
    supplierSummary,
    categorySummary,
    brandSummary: brandSummary.slice(0, 20),
    recommendations: recommendations.slice(0, limit),
    // Acil siparişler (kritik + yüksek öncelikli)
    urgentOrders: [...byPriority.critical, ...byPriority.high]
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 50)
  };
}

// Strateji şablonlarını getir
export function getStrategyTemplates() {
  return Object.values(STRATEGY_TEMPLATES);
}

// ═══════════════════════════════════════════════════════════════════════════
// PETZZ SİPARİŞ ÖNERİSİ (15 Günlük Hedef Stok Bazlı)
// ═══════════════════════════════════════════════════════════════════════════
// Kurallar:
// 1. Son 90 günde hareket görmüş (satış > 0) ürünler
// 2. Son 15 günde satış = 0 ise dahil etme
// 3. 15 günlük hedef stok = max(son15gün, round(son30gün/2))
// 4. Sipariş = max(0, hedef - mevcut)
// ═══════════════════════════════════════════════════════════════════════════

// Stok geçmişinden dönemsel satış hesapla
function calculatePeriodSales(sku) {
  // Önce stock_history tablosunu dene
  try {
    const history = prepare(`
      SELECT quantity, recorded_at
      FROM stock_history
      WHERE sku = ?
        AND recorded_at >= datetime('now', '-90 days')
      ORDER BY recorded_at ASC
    `).all(sku);

    if (history && history.length >= 2) {
      const now = new Date();
      const sales = { days15: 0, days30: 0, days60: 0, days90: 0 };

      for (let i = 1; i < history.length; i++) {
        const diff = history[i-1].quantity - history[i].quantity;
        if (diff > 0) {
          const recordDate = new Date(history[i].recorded_at);
          const daysAgo = Math.floor((now - recordDate) / (1000 * 60 * 60 * 24));

          if (daysAgo <= 15) sales.days15 += diff;
          if (daysAgo <= 30) sales.days30 += diff;
          if (daysAgo <= 60) sales.days60 += diff;
          if (daysAgo <= 90) sales.days90 += diff;
        }
      }

      if (sales.days90 > 0) {
        return { sales15: sales.days15, sales30: sales.days30, sales60: sales.days60, sales90: sales.days90, source: 'history' };
      }
    }
  } catch (e) {
    // stock_history tablosu yoksa devam et
  }

  return null; // Veri yok
}

// Fiyat bazlı tahmini satış hızı (stok geçmişi yoksa kullanılır)
function estimateSalesFromPrice(sellingPrice, currentStock) {
  // Fiyata göre günlük satış tahmini
  let dailyRate = 0.1;
  if (sellingPrice < 50) dailyRate = 0.5;
  else if (sellingPrice < 100) dailyRate = 0.35;
  else if (sellingPrice < 200) dailyRate = 0.25;
  else if (sellingPrice < 500) dailyRate = 0.15;
  else if (sellingPrice < 1000) dailyRate = 0.1;
  else dailyRate = 0.05;

  return {
    sales15: Math.round(dailyRate * 15),
    sales30: Math.round(dailyRate * 30),
    sales60: Math.round(dailyRate * 60),
    sales90: Math.round(dailyRate * 90),
    source: 'estimated'
  };
}

// Ana sipariş önerisi fonksiyonu
export function getPetzzOrderRecommendations({
  supplier = null,
  category = null,
  brand = null,
  minOrderValue = 0,
  limit = 1000
}) {
  // Filtreler
  let whereConditions = ['p.is_active = 1'];
  const params = [];

  if (supplier) {
    whereConditions.push('p.supplier_name = ?');
    params.push(supplier);
  }
  if (category) {
    whereConditions.push('p.main_category = ?');
    params.push(category);
  }
  if (brand) {
    whereConditions.push('p.brand = ?');
    params.push(brand);
  }

  // Tüm aktif ürünleri satış verileriyle birlikte çek
  const products = prepare(`
    SELECT
      p.id,
      p.code,
      p.name,
      p.brand,
      p.supplier_name,
      p.main_category,
      p.total_quantity as current_stock,
      COALESCE(p.deci, 0) as desi,
      COALESCE(p.buying_price, 0) as buying_price,
      COALESCE(p.selling_price, 0) as selling_price,
      COALESCE(p.akakce_low_price, 0) as akakce_price,
      COALESCE(p.sales_15, 0) as sales_15,
      COALESCE(p.sales_30, 0) as sales_30,
      COALESCE(p.sales_60, 0) as sales_60,
      COALESCE(p.sales_90, 0) as sales_90,
      COALESCE(p.daily_avg_sales, 0) as daily_avg_sales,
      CASE WHEN sf.slug IS NOT NULL THEN 'https://www.petzzshop.com/' || sf.slug ELSE NULL END as petzzshop_url
    FROM products p
    LEFT JOIN (
      SELECT panel_product_id, slug
      FROM storefront_products
      WHERE panel_product_id IS NOT NULL
      GROUP BY panel_product_id
    ) sf ON p.id = sf.panel_product_id
    WHERE ${whereConditions.join(' AND ')}
  `).all(...params);

  const recommendations = [];
  let totalOrderQty = 0;
  let totalOrderValue = 0;
  let totalDesi = 0;
  const bySupplier = {};
  const byBrand = {};

  for (const p of products) {
    // Satış verilerini al (veritabanından)
    const sales15 = p.sales_15 || 0;
    const sales30 = p.sales_30 || 0;
    const sales60 = p.sales_60 || 0;
    const sales90 = p.sales_90 || 0;

    // KURAL 1: Son 90 günde hareket olmalı
    if (sales90 <= 0) continue;

    // KURAL 3: Son 15 günde satış = 0 ise dahil etme
    if (sales15 <= 0) continue;

    // KURAL 2: 15 günlük hedef stok = max(son15gün, round(son30gün/2))
    const targetStock15 = Math.max(sales15, Math.round(sales30 / 2));

    // KURAL 4: Sipariş = max(0, hedef - mevcut)
    const currentStock = p.current_stock || 0;
    const orderQty = Math.max(0, targetStock15 - currentStock);

    // Sipariş yoksa atla
    if (orderQty === 0) continue;

    const orderValue = orderQty * (p.buying_price || 0);
    const orderDesi = orderQty * (p.desi || 0);
    const akakceDiff = (p.akakce_price || 0) - (p.buying_price || 0);

    // Minimum sipariş tutarı filtresi
    if (minOrderValue > 0 && orderValue < minOrderValue) continue;

    const item = {
      code: p.code,
      name: p.name,
      brand: p.brand,
      supplierName: p.supplier_name,
      mainCategory: p.main_category,
      currentStock,
      sales15,
      sales30,
      sales60,
      sales90,
      targetStock15,
      orderQty,
      desi: p.desi || 0,
      buyingPrice: p.buying_price || 0,
      orderValue: Math.round(orderValue * 100) / 100,
      orderDesi: Math.round(orderDesi * 100) / 100,
      akakcePrice: p.akakce_price || 0,
      akakceDiff: Math.round(akakceDiff * 100) / 100,
      sellingPrice: p.selling_price || 0,
      petzzshopUrl: p.petzzshop_url,
      dataSource: 'petzz_analytics',
      note: '90 gün hareket var, hedef stok: max(15g, 30g/2)'
    };

    recommendations.push(item);

    // Toplamlar
    totalOrderQty += orderQty;
    totalOrderValue += orderValue;
    totalDesi += orderDesi;

    // Tedarikçi bazlı
    const supplierKey = p.supplier_name || 'Bilinmiyor';
    if (!bySupplier[supplierKey]) {
      bySupplier[supplierKey] = { items: 0, qty: 0, value: 0, desi: 0 };
    }
    bySupplier[supplierKey].items++;
    bySupplier[supplierKey].qty += orderQty;
    bySupplier[supplierKey].value += orderValue;
    bySupplier[supplierKey].desi += orderDesi;

    // Marka bazlı
    const brandKey = p.brand || 'Diğer';
    if (!byBrand[brandKey]) {
      byBrand[brandKey] = { items: 0, qty: 0, value: 0 };
    }
    byBrand[brandKey].items++;
    byBrand[brandKey].qty += orderQty;
    byBrand[brandKey].value += orderValue;
  }

  // KURAL 6: Sıralama - Sipariş Tutarı DESC, Sipariş Adet DESC, Son 15 gün DESC
  recommendations.sort((a, b) => {
    if (b.orderValue !== a.orderValue) return b.orderValue - a.orderValue;
    if (b.orderQty !== a.orderQty) return b.orderQty - a.orderQty;
    return b.sales15 - a.sales15;
  });

  // Limit uygula
  const limitedItems = recommendations.slice(0, limit);

  // Tedarikçi özeti sırala
  const supplierSummary = Object.entries(bySupplier)
    .map(([name, data]) => ({
      name,
      items: data.items,
      qty: data.qty,
      value: Math.round(data.value * 100) / 100,
      desi: Math.round(data.desi * 100) / 100
    }))
    .sort((a, b) => b.value - a.value);

  // Marka özeti sırala
  const brandSummary = Object.entries(byBrand)
    .map(([name, data]) => ({
      name,
      items: data.items,
      qty: data.qty,
      value: Math.round(data.value * 100) / 100
    }))
    .sort((a, b) => b.value - a.value);

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      rules: {
        description: '15 günlük hedef stok bazlı sipariş önerisi',
        targetFormula: 'max(son15gün_satış, round(son30gün_satış/2))',
        orderFormula: 'max(0, hedef_stok - mevcut_stok)',
        filters: {
          rule1: 'Son 90 günde satış > 0',
          rule2: 'Son 15 günde satış > 0',
          rule3: 'Sipariş adedi > 0'
        }
      }
    },
    summary: {
      totalProducts: limitedItems.length,
      totalOrderQty,
      totalOrderValue: Math.round(totalOrderValue * 100) / 100,
      totalDesi: Math.round(totalDesi * 100) / 100,
      avgOrderValue: limitedItems.length > 0
        ? Math.round(totalOrderValue / limitedItems.length * 100) / 100
        : 0
    },
    supplierSummary,
    brandSummary: brandSummary.slice(0, 30),
    recommendations: limitedItems
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FİLTRE SEÇENEKLERİ (Tüm veritabanından)
// ─────────────────────────────────────────────────────────────────────────────

export function getPurchasingFilterOptions() {
  // Tüm markalar (ürün sayısına göre sıralı)
  const brands = prepare(`
    SELECT
      brand,
      COUNT(*) as product_count,
      SUM(CASE WHEN total_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
      SUM(CASE WHEN total_quantity > 0 AND total_quantity < 10 THEN 1 ELSE 0 END) as low_stock
    FROM products
    WHERE is_active = 1 AND brand IS NOT NULL AND brand != ''
    GROUP BY brand
    HAVING product_count >= 3
    ORDER BY product_count DESC
  `).all();

  // Tüm tedarikçiler
  const suppliers = prepare(`
    SELECT
      supplier_name,
      COUNT(*) as product_count,
      SUM(CASE WHEN total_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
      SUM(CASE WHEN total_quantity > 0 AND total_quantity < 10 THEN 1 ELSE 0 END) as low_stock
    FROM products
    WHERE is_active = 1 AND supplier_name IS NOT NULL AND supplier_name != ''
    GROUP BY supplier_name
    HAVING product_count >= 3
    ORDER BY product_count DESC
  `).all();

  // Tüm kategoriler
  const categories = prepare(`
    SELECT
      main_category,
      COUNT(*) as product_count,
      SUM(CASE WHEN total_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
      SUM(CASE WHEN total_quantity > 0 AND total_quantity < 10 THEN 1 ELSE 0 END) as low_stock
    FROM products
    WHERE is_active = 1 AND main_category IS NOT NULL AND main_category != ''
    GROUP BY main_category
    ORDER BY product_count DESC
  `).all();

  return {
    brands: brands.map(b => ({
      value: b.brand,
      label: b.brand,
      count: b.product_count,
      outOfStock: b.out_of_stock,
      lowStock: b.low_stock
    })),
    suppliers: suppliers.map(s => ({
      value: s.supplier_name,
      label: s.supplier_name,
      count: s.product_count,
      outOfStock: s.out_of_stock,
      lowStock: s.low_stock
    })),
    categories: categories.map(c => ({
      value: c.main_category,
      label: c.main_category,
      count: c.product_count,
      outOfStock: c.out_of_stock,
      lowStock: c.low_stock
    }))
  };
}

export default {
  // Karar Motoru (Decision Engine)
  getPurchasingDecisionEngine,
  // Satın Alma Stratejileri
  generatePurchasingStrategy,
  getStrategyTemplates,
  // Petzz Sipariş Önerisi (15 Günlük Hedef)
  getPetzzOrderRecommendations,
  // Filtre seçenekleri
  getPurchasingFilterOptions,
  // Yeni gelişmiş fonksiyonlar
  getSmartReorderList,
  getAdvancedPurchasingSummary,
  getSupplierPerformance,
  getFastMovers,
  getSlowMovers,
  getCategoryTurnoverAnalysis,
  // Legacy fonksiyonlar
  getReorderList,
  getCriticalStock,
  getDeadStock,
  getSupplierOrderSummary,
  getOrderBySupplier,
  getInventoryBySupplier,
  getInventoryByCategory,
  getPurchasingSummary
};
