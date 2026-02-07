import { prepare, exec, saveDatabase, STOREFRONT_JOIN_SQL, PRODUCT_URL_FIELDS } from '../db/database.js';

// ═══════════════════════════════════════════════════════════════════════════
// DATA CENTER SERVICE - Merkezi veri yönetimi ve kalite kontrolü
// ═══════════════════════════════════════════════════════════════════════════

// Event loop'a kontrol ver (non-blocking için)
function yieldToEventLoop() {
  return new Promise(resolve => setImmediate(resolve));
}

// ─────────────────────────────────────────────────────────────────────────────
// KATEGORİ ANALİZİ VE ÖNERİLER
// ─────────────────────────────────────────────────────────────────────────────

// Tüm ürünleri analiz et ve eksik kategorileri tespit et
export function analyzeCategories() {
  const rules = prepare(`
    SELECT * FROM category_rules WHERE is_active = 1 ORDER BY priority DESC
  `).all();

  const products = prepare(`
    SELECT p.code as sku, p.name, p.brand, p.main_category, p.sub_category, p.description,
           sp.name as storefront_name, sp.description as storefront_description, sp.category_path
    FROM products p
    LEFT JOIN storefront_products sp ON p.code = sp.sku
    WHERE p.is_active = 1
  `).all();

  let suggestionsCreated = 0;

  for (const product of products) {
    const searchText = `${product.name || ''} ${product.storefront_name || ''} ${product.description || ''} ${product.storefront_description || ''} ${product.category_path || ''}`.toLowerCase();

    for (const rule of rules) {
      const keywords = JSON.parse(rule.keywords || '[]');
      const excludeKeywords = JSON.parse(rule.exclude_keywords || '[]');

      // Exclude kontrolü
      const hasExclude = excludeKeywords.some(kw => searchText.includes(kw.toLowerCase()));
      if (hasExclude) continue;

      // Keyword eşleşme kontrolü
      const matchedKeywords = keywords.filter(kw => searchText.includes(kw.toLowerCase()));

      if (matchedKeywords.length > 0) {
        // Bu öneri zaten var mı kontrol et
        const existing = prepare(`
          SELECT id FROM category_suggestions
          WHERE sku = ? AND suggested_category = ? AND category_type = ? AND status = 'pending'
        `).get(product.sku, rule.category_value, rule.category_type);

        if (!existing) {
          // Mevcut tag/kategori kontrolü
          const hasTag = prepare(`
            SELECT id FROM product_tags WHERE sku = ? AND tag_type = ? AND tag_value = ?
          `).get(product.sku, rule.category_type, rule.category_value);

          if (!hasTag) {
            const confidence = Math.min(0.5 + (matchedKeywords.length * 0.15), 1.0);

            prepare(`
              INSERT INTO category_suggestions (sku, suggested_category, category_type, confidence, reason, matched_keywords)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(
              product.sku,
              rule.category_value,
              rule.category_type,
              confidence,
              `${rule.rule_name}: "${matchedKeywords.join(', ')}" bulundu`,
              JSON.stringify(matchedKeywords)
            );

            suggestionsCreated++;
          }
        }
      }
    }
  }

  return { suggestionsCreated, productsAnalyzed: products.length };
}

// Kategori önerilerini getir
export function getCategorySuggestions({ status = 'pending', categoryType, page = 1, limit = 50 }) {
  const offset = (page - 1) * limit;
  let whereConditions = ['1=1'];
  const params = [];

  if (status) {
    whereConditions.push('cs.status = ?');
    params.push(status);
  }

  if (categoryType) {
    whereConditions.push('cs.category_type = ?');
    params.push(categoryType);
  }

  const whereClause = whereConditions.join(' AND ');

  const countResult = prepare(`
    SELECT COUNT(*) as total FROM category_suggestions cs WHERE ${whereClause}
  `).get(...params);

  const suggestions = prepare(`
    SELECT cs.*, p.name as product_name, p.brand, p.main_category,
           ${PRODUCT_URL_FIELDS}
    FROM category_suggestions cs
    LEFT JOIN products p ON cs.sku = p.code
    ${STOREFRONT_JOIN_SQL}
    WHERE ${whereClause}
    ORDER BY cs.confidence DESC, cs.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  return {
    suggestions,
    pagination: {
      page,
      limit,
      total: countResult?.total || 0,
      totalPages: Math.ceil((countResult?.total || 0) / limit)
    }
  };
}

// Öneriyi onayla veya reddet
export function updateCategorySuggestion(id, status, reviewedBy) {
  const suggestion = prepare('SELECT * FROM category_suggestions WHERE id = ?').get(id);
  if (!suggestion) return { success: false, message: 'Öneri bulunamadı' };

  if (status === 'approved') {
    // Tag olarak ekle
    prepare(`
      INSERT OR IGNORE INTO product_tags (sku, tag_type, tag_value, confidence, source)
      VALUES (?, ?, ?, ?, 'suggestion_approved')
    `).run(suggestion.sku, suggestion.category_type, suggestion.suggested_category, suggestion.confidence);
  }

  prepare(`
    UPDATE category_suggestions SET status = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?
  `).run(status, reviewedBy, new Date().toISOString(), id);

  // Changelog kaydet
  logChange('category_suggestion', id, status === 'approved' ? 'approve' : 'reject', 'status', 'pending', status, reviewedBy, 'panel');

  return { success: true };
}

// Toplu öneri onayla
export function bulkApproveSuggestions(ids, reviewedBy) {
  let approved = 0;
  for (const id of ids) {
    const result = updateCategorySuggestion(id, 'approved', reviewedBy);
    if (result.success) approved++;
  }
  return { approved, total: ids.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// KALİTE ANALİZİ VE SORUN TESPİTİ
// ─────────────────────────────────────────────────────────────────────────────

// Kalite sorunlarını tespit et
export function detectQualityIssues() {
  let issuesCreated = 0;

  // 1. Görsel eksikliği
  const noImages = prepare(`
    SELECT code as sku, name FROM products
    WHERE (images IS NULL OR images = '' OR images = '[]')
    AND is_active = 1
  `).all();

  for (const p of noImages) {
    createQualityIssue(p.sku, 'content', 'NO_IMAGE', 'critical', 'Görsel yok', 'Ürünün hiç görseli bulunmuyor');
    issuesCreated++;
  }

  // 2. Tek görsel
  const singleImage = prepare(`
    SELECT code as sku, name, images FROM products
    WHERE images IS NOT NULL AND images != '' AND images != '[]'
    AND is_active = 1
  `).all();

  for (const p of singleImage) {
    try {
      const images = JSON.parse(p.images || '[]');
      if (images.length === 1) {
        createQualityIssue(p.sku, 'content', 'SINGLE_IMAGE', 'high', 'Tek görsel', 'Ürünün sadece 1 görseli var, en az 3 önerilir');
        issuesCreated++;
      }
    } catch (e) {}
  }

  // 3. Açıklama eksikliği
  const noDesc = prepare(`
    SELECT code as sku FROM products
    WHERE (description IS NULL OR description = '' OR LENGTH(description) < 50)
    AND is_active = 1
  `).all();

  for (const p of noDesc) {
    createQualityIssue(p.sku, 'content', 'NO_DESCRIPTION', 'high', 'Açıklama eksik/yetersiz', 'Ürün açıklaması 50 karakterden kısa');
    issuesCreated++;
  }

  // 4. Kategori eksikliği
  const noCategory = prepare(`
    SELECT code as sku FROM products
    WHERE (main_category IS NULL OR main_category = '')
    AND is_active = 1
  `).all();

  for (const p of noCategory) {
    createQualityIssue(p.sku, 'category', 'NO_CATEGORY', 'critical', 'Kategori atanmamış', 'Ürüne ana kategori atanmamış');
    issuesCreated++;
  }

  // 5. Marka eksikliği
  const noBrand = prepare(`
    SELECT code as sku FROM products
    WHERE (brand IS NULL OR brand = '')
    AND is_active = 1
  `).all();

  for (const p of noBrand) {
    createQualityIssue(p.sku, 'content', 'NO_BRAND', 'medium', 'Marka eksik', 'Ürüne marka atanmamış');
    issuesCreated++;
  }

  // 6. Fiyat anomalisi (marj < 5% veya > 80%)
  const priceIssues = prepare(`
    SELECT code as sku, buying_price, selling_price,
           CASE WHEN buying_price > 0 THEN ((selling_price - buying_price) / buying_price * 100) ELSE 0 END as margin
    FROM products
    WHERE is_active = 1 AND buying_price > 0 AND selling_price > 0
    AND (
      (selling_price - buying_price) / buying_price < 0.05
      OR (selling_price - buying_price) / buying_price > 0.80
    )
  `).all();

  for (const p of priceIssues) {
    const margin = ((p.selling_price - p.buying_price) / p.buying_price * 100).toFixed(1);
    if (margin < 5) {
      createQualityIssue(p.sku, 'pricing', 'LOW_MARGIN', 'high', 'Düşük marj', `Marj sadece %${margin}`);
    } else {
      createQualityIssue(p.sku, 'pricing', 'HIGH_MARGIN', 'low', 'Yüksek marj', `Marj %${margin} - fiyat kontrolü gerekebilir`);
    }
    issuesCreated++;
  }

  return { issuesCreated };
}

// Kalite sorunu oluştur (tekrar etmeyecek şekilde)
function createQualityIssue(sku, issueType, issueCode, severity, title, description) {
  const existing = prepare(`
    SELECT id FROM quality_issues WHERE sku = ? AND issue_code = ? AND status = 'open'
  `).get(sku, issueCode);

  if (!existing) {
    prepare(`
      INSERT INTO quality_issues (sku, issue_type, issue_code, severity, title, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(sku, issueType, issueCode, severity, title, description);
  }
}

// Kalite sorunlarını getir
export function getQualityIssues({ status = 'open', issueType, severity, page = 1, limit = 50 }) {
  const offset = (page - 1) * limit;
  let whereConditions = ['1=1'];
  const params = [];

  if (status) {
    whereConditions.push('qi.status = ?');
    params.push(status);
  }

  if (issueType) {
    whereConditions.push('qi.issue_type = ?');
    params.push(issueType);
  }

  if (severity) {
    whereConditions.push('qi.severity = ?');
    params.push(severity);
  }

  const whereClause = whereConditions.join(' AND ');

  const countResult = prepare(`
    SELECT COUNT(*) as total FROM quality_issues qi WHERE ${whereClause}
  `).get(...params);

  const issues = prepare(`
    SELECT qi.*, p.name as product_name, p.brand, p.selling_price, p.total_quantity,
           ${PRODUCT_URL_FIELDS}
    FROM quality_issues qi
    LEFT JOIN products p ON qi.sku = p.code
    ${STOREFRONT_JOIN_SQL}
    WHERE ${whereClause}
    ORDER BY
      CASE qi.severity
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        ELSE 4
      END,
      qi.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  return {
    issues,
    pagination: {
      page,
      limit,
      total: countResult?.total || 0,
      totalPages: Math.ceil((countResult?.total || 0) / limit)
    }
  };
}

// Kalite sorunu özeti
export function getQualityIssueSummary() {
  const summary = prepare(`
    SELECT
      issue_type,
      issue_code,
      severity,
      COUNT(*) as count
    FROM quality_issues
    WHERE status = 'open'
    GROUP BY issue_type, issue_code, severity
    ORDER BY
      CASE severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
      count DESC
  `).all();

  const totals = prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
      SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high,
      SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium,
      SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low
    FROM quality_issues
    WHERE status = 'open'
  `).get();

  return { summary, totals };
}

// ─────────────────────────────────────────────────────────────────────────────
// GÖREV YÖNETİMİ
// ─────────────────────────────────────────────────────────────────────────────

// Kalite sorunlarından görev oluştur
export function createTasksFromIssues() {
  // Kritik ve yüksek öncelikli sorunlar için görev oluştur
  const issues = prepare(`
    SELECT qi.*, p.selling_price, p.total_quantity
    FROM quality_issues qi
    LEFT JOIN products p ON qi.sku = p.code
    WHERE qi.status = 'open'
    AND qi.severity IN ('critical', 'high')
    AND NOT EXISTS (
      SELECT 1 FROM tasks t WHERE t.sku = qi.sku AND t.task_type = qi.issue_code AND t.status != 'completed'
    )
  `).all();

  let tasksCreated = 0;

  for (const issue of issues) {
    // Impact score hesapla (satış potansiyeline göre)
    const impactScore = calculateImpactScore(issue);

    prepare(`
      INSERT INTO tasks (task_type, priority, title, description, sku, impact_score, impact_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      issue.issue_code,
      issue.severity === 'critical' ? 'critical' : 'high',
      issue.title,
      issue.description,
      issue.sku,
      impactScore,
      `Satış fiyatı: ₺${issue.selling_price || 0}, Stok: ${issue.total_quantity || 0}`
    );

    tasksCreated++;
  }

  return { tasksCreated };
}

// Impact score hesapla
function calculateImpactScore(issue) {
  let score = 0;

  // Fiyata göre (yüksek fiyatlı ürünler daha önemli)
  if (issue.selling_price > 1000) score += 30;
  else if (issue.selling_price > 500) score += 20;
  else if (issue.selling_price > 100) score += 10;

  // Stoka göre (stokta olan ürünler daha önemli)
  if (issue.total_quantity > 10) score += 25;
  else if (issue.total_quantity > 0) score += 15;

  // Sorun tipine göre
  if (issue.issue_code === 'NO_IMAGE') score += 30;
  else if (issue.issue_code === 'SINGLE_IMAGE') score += 20;
  else if (issue.issue_code === 'NO_DESCRIPTION') score += 15;
  else if (issue.issue_code === 'NO_CATEGORY') score += 25;

  return Math.min(score, 100);
}

// Görevleri getir
export function getTasks({ status, assignedTo, taskType, priority, page = 1, limit = 50 }) {
  const offset = (page - 1) * limit;
  let whereConditions = ['1=1'];
  const params = [];

  if (status) {
    whereConditions.push('t.status = ?');
    params.push(status);
  }

  if (assignedTo) {
    whereConditions.push('t.assigned_to = ?');
    params.push(assignedTo);
  }

  if (taskType) {
    whereConditions.push('t.task_type = ?');
    params.push(taskType);
  }

  if (priority) {
    whereConditions.push('t.priority = ?');
    params.push(priority);
  }

  const whereClause = whereConditions.join(' AND ');

  const countResult = prepare(`
    SELECT COUNT(*) as total FROM tasks t WHERE ${whereClause}
  `).get(...params);

  const tasks = prepare(`
    SELECT t.*, p.name as product_name, p.brand, p.images, p.selling_price,
           ${PRODUCT_URL_FIELDS}
    FROM tasks t
    LEFT JOIN products p ON t.sku = p.code
    ${STOREFRONT_JOIN_SQL}
    WHERE ${whereClause}
    ORDER BY
      CASE t.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
      t.impact_score DESC,
      t.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  return {
    tasks: tasks.map(t => ({
      ...t,
      images: JSON.parse(t.images || '[]')
    })),
    pagination: {
      page,
      limit,
      total: countResult?.total || 0,
      totalPages: Math.ceil((countResult?.total || 0) / limit)
    }
  };
}

// Görev ata
export function assignTask(taskId, assignedTo) {
  prepare(`
    UPDATE tasks SET assigned_to = ?, assigned_at = ?, status = 'assigned', updated_at = ?
    WHERE id = ?
  `).run(assignedTo, new Date().toISOString(), new Date().toISOString(), taskId);

  return { success: true };
}

// Görev tamamla
export function completeTask(taskId, completedBy, resolution) {
  const task = prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
  if (!task) return { success: false, message: 'Görev bulunamadı' };

  prepare(`
    UPDATE tasks SET status = 'completed', completed_by = ?, completed_at = ?, resolution = ?, updated_at = ?
    WHERE id = ?
  `).run(completedBy, new Date().toISOString(), resolution, new Date().toISOString(), taskId);

  // İlgili kalite sorununu da kapat
  prepare(`
    UPDATE quality_issues SET status = 'resolved', resolved_by = ?, resolved_at = ?
    WHERE sku = ? AND issue_code = ? AND status = 'open'
  `).run(completedBy, new Date().toISOString(), task.sku, task.task_type);

  return { success: true };
}

// Görev özeti
export function getTaskSummary() {
  const byStatus = prepare(`
    SELECT status, COUNT(*) as count FROM tasks GROUP BY status
  `).all();

  const byType = prepare(`
    SELECT task_type, COUNT(*) as count FROM tasks WHERE status != 'completed' GROUP BY task_type ORDER BY count DESC
  `).all();

  const byAssignee = prepare(`
    SELECT assigned_to, COUNT(*) as count FROM tasks WHERE status IN ('assigned', 'in_progress') GROUP BY assigned_to
  `).all();

  return { byStatus, byType, byAssignee };
}

// ─────────────────────────────────────────────────────────────────────────────
// ÜRÜN ÖZELLİKLERİ (ATTRIBUTES)
// ─────────────────────────────────────────────────────────────────────────────

// Ürün özelliği ekle/güncelle
export function setProductAttribute(sku, group, key, value, options = {}) {
  const { valueNumeric, valueUnit, source = 'manual', confidence = 1.0 } = options;

  prepare(`
    INSERT INTO product_attributes (sku, attribute_group, attribute_key, attribute_value, value_numeric, value_unit, source, confidence, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(sku, attribute_group, attribute_key) DO UPDATE SET
      attribute_value = excluded.attribute_value,
      value_numeric = excluded.value_numeric,
      value_unit = excluded.value_unit,
      source = excluded.source,
      confidence = excluded.confidence,
      updated_at = excluded.updated_at
  `).run(sku, group, key, value, valueNumeric, valueUnit, source, confidence, new Date().toISOString());

  return { success: true };
}

// Ürün özelliklerini getir
export function getProductAttributes(sku) {
  const attributes = prepare(`
    SELECT pa.*, ad.display_name, ad.data_type, ad.unit as default_unit, ad.icon
    FROM product_attributes pa
    LEFT JOIN attribute_definitions ad ON pa.attribute_group = ad.attribute_group AND pa.attribute_key = ad.attribute_key
    WHERE pa.sku = ?
    ORDER BY pa.attribute_group, ad.sort_order
  `).all(sku);

  // Gruplara ayır
  const grouped = {};
  for (const attr of attributes) {
    if (!grouped[attr.attribute_group]) {
      grouped[attr.attribute_group] = [];
    }
    grouped[attr.attribute_group].push(attr);
  }

  return grouped;
}

// Toplu özellik getir
export function getAttributesBulk(skus) {
  if (!skus || skus.length === 0) return {};

  const placeholders = skus.map(() => '?').join(',');
  const attributes = prepare(`
    SELECT * FROM product_attributes WHERE sku IN (${placeholders})
  `).all(...skus);

  const result = {};
  for (const attr of attributes) {
    if (!result[attr.sku]) result[attr.sku] = {};
    if (!result[attr.sku][attr.attribute_group]) result[attr.sku][attr.attribute_group] = {};
    result[attr.sku][attr.attribute_group][attr.attribute_key] = attr.attribute_value;
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// CHANGELOG (DEĞİŞİKLİK LOGLARI)
// ─────────────────────────────────────────────────────────────────────────────

// Değişiklik logla
export function logChange(entityType, entityId, action, fieldName, oldValue, newValue, changedBy, changeSource) {
  prepare(`
    INSERT INTO changelog (entity_type, entity_id, action, field_name, old_value, new_value, changed_by, change_source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(entityType, entityId, action, fieldName, oldValue, newValue, changedBy, changeSource);
}

// Değişiklik geçmişini getir
export function getChangelog({ entityType, entityId, page = 1, limit = 50 }) {
  const offset = (page - 1) * limit;
  let whereConditions = ['1=1'];
  const params = [];

  if (entityType) {
    whereConditions.push('entity_type = ?');
    params.push(entityType);
  }

  if (entityId) {
    whereConditions.push('entity_id = ?');
    params.push(entityId);
  }

  const whereClause = whereConditions.join(' AND ');

  const logs = prepare(`
    SELECT * FROM changelog
    WHERE ${whereClause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  return logs;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA CENTER DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

export function getDataCenterDashboard() {
  // Genel istatistikler
  const productStats = prepare(`
    SELECT
      COUNT(*) as total_products,
      SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_products,
      SUM(CASE WHEN total_quantity > 0 THEN 1 ELSE 0 END) as in_stock,
      COUNT(DISTINCT brand) as brands,
      COUNT(DISTINCT main_category) as categories
    FROM products
  `).get();

  // Kalite sorunları
  const qualityStats = prepare(`
    SELECT
      COUNT(*) as total_issues,
      SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
      SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high
    FROM quality_issues
    WHERE status = 'open'
  `).get();

  // Bekleyen öneriler
  const suggestionStats = prepare(`
    SELECT COUNT(*) as pending_suggestions FROM category_suggestions WHERE status = 'pending'
  `).get();

  // Bekleyen görevler
  const taskStats = prepare(`
    SELECT
      COUNT(*) as total_tasks,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) as assigned,
      SUM(CASE WHEN status = 'completed' AND DATE(completed_at) = DATE('now') THEN 1 ELSE 0 END) as completed_today
    FROM tasks
  `).get();

  // Veri kaynakları durumu
  const dataSources = prepare(`
    SELECT code, name, last_sync_at, is_active FROM data_sources
  `).all();

  // Özellik kapsamı
  const attributeCoverage = prepare(`
    SELECT
      (SELECT COUNT(DISTINCT sku) FROM product_attributes) as products_with_attributes,
      (SELECT COUNT(*) FROM products WHERE is_active = 1) as total_products
  `).get();

  return {
    products: productStats,
    quality: qualityStats,
    suggestions: suggestionStats,
    tasks: taskStats,
    dataSources,
    attributeCoverage
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TAM ANALİZ ÇALIŞTIR
// ─────────────────────────────────────────────────────────────────────────────

export async function runFullAnalysis() {
  const results = {
    startedAt: new Date().toISOString(),
    categoryAnalysis: null,
    qualityIssues: null,
    tasksCreated: null,
    completedAt: null
  };

  console.log('📊 Tam analiz başlatılıyor...');

  // 1. Kategori analizi
  console.log('📁 Kategori analizi yapılıyor...');
  results.categoryAnalysis = await analyzeCategoriesAsync();
  await yieldToEventLoop();

  // 2. Kalite sorunlarını tespit et
  console.log('🔍 Kalite sorunları tespit ediliyor...');
  results.qualityIssues = await detectQualityIssuesAsync();
  await yieldToEventLoop();

  // 3. Görevler oluştur
  console.log('📋 Görevler oluşturuluyor...');
  results.tasksCreated = createTasksFromIssues();

  results.completedAt = new Date().toISOString();

  console.log(`✅ Tam analiz tamamlandı: ${results.categoryAnalysis?.suggestionsCreated || 0} öneri, ${results.qualityIssues?.issuesCreated || 0} sorun, ${results.tasksCreated?.tasksCreated || 0} görev`);

  return results;
}

// Async kategori analizi (batch işleme ile)
async function analyzeCategoriesAsync() {
  const rules = prepare(`
    SELECT * FROM category_rules WHERE is_active = 1 ORDER BY priority DESC
  `).all();

  const products = prepare(`
    SELECT p.code as sku, p.name, p.brand, p.main_category, p.sub_category, p.description,
           sp.name as storefront_name, sp.description as storefront_description, sp.category_path
    FROM products p
    LEFT JOIN storefront_products sp ON p.code = sp.sku
    WHERE p.is_active = 1
  `).all();

  let suggestionsCreated = 0;
  const BATCH_SIZE = 100;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const searchText = `${product.name || ''} ${product.storefront_name || ''} ${product.description || ''} ${product.storefront_description || ''} ${product.category_path || ''}`.toLowerCase();

    for (const rule of rules) {
      const keywords = JSON.parse(rule.keywords || '[]');
      const excludeKeywords = JSON.parse(rule.exclude_keywords || '[]');

      const hasExclude = excludeKeywords.some(kw => searchText.includes(kw.toLowerCase()));
      if (hasExclude) continue;

      const matchedKeywords = keywords.filter(kw => searchText.includes(kw.toLowerCase()));

      if (matchedKeywords.length > 0) {
        const existing = prepare(`
          SELECT id FROM category_suggestions
          WHERE sku = ? AND suggested_category = ? AND category_type = ? AND status = 'pending'
        `).get(product.sku, rule.category_value, rule.category_type);

        if (!existing) {
          const hasTag = prepare(`
            SELECT id FROM product_tags WHERE sku = ? AND tag_type = ? AND tag_value = ?
          `).get(product.sku, rule.category_type, rule.category_value);

          if (!hasTag) {
            const confidence = Math.min(0.5 + (matchedKeywords.length * 0.15), 1.0);

            prepare(`
              INSERT INTO category_suggestions (sku, suggested_category, category_type, confidence, reason, matched_keywords)
              VALUES (?, ?, ?, ?, ?, ?)
            `).run(
              product.sku,
              rule.category_value,
              rule.category_type,
              confidence,
              `${rule.rule_name}: "${matchedKeywords.join(', ')}" bulundu`,
              JSON.stringify(matchedKeywords)
            );

            suggestionsCreated++;
          }
        }
      }
    }

    // Her BATCH_SIZE üründe bir event loop'a dön
    if ((i + 1) % BATCH_SIZE === 0) {
      await yieldToEventLoop();
    }
  }

  return { suggestionsCreated, productsAnalyzed: products.length };
}

// Async kalite sorunları tespiti
async function detectQualityIssuesAsync() {
  let issuesCreated = 0;

  // 1. Görsel eksikliği
  const noImages = prepare(`
    SELECT code as sku, name FROM products
    WHERE (images IS NULL OR images = '' OR images = '[]')
    AND is_active = 1
  `).all();

  for (const p of noImages) {
    createQualityIssue(p.sku, 'content', 'NO_IMAGE', 'critical', 'Görsel yok', 'Ürünün hiç görseli bulunmuyor');
    issuesCreated++;
  }
  await yieldToEventLoop();

  // 2. Tek görsel
  const singleImage = prepare(`
    SELECT code as sku, name, images FROM products
    WHERE images IS NOT NULL AND images != '' AND images != '[]'
    AND is_active = 1
  `).all();

  for (let i = 0; i < singleImage.length; i++) {
    const p = singleImage[i];
    try {
      const images = JSON.parse(p.images || '[]');
      if (images.length === 1) {
        createQualityIssue(p.sku, 'content', 'SINGLE_IMAGE', 'high', 'Tek görsel', 'Ürünün sadece 1 görseli var, en az 3 önerilir');
        issuesCreated++;
      }
    } catch (e) {}

    if ((i + 1) % 500 === 0) await yieldToEventLoop();
  }

  // 3. Açıklama eksikliği
  const noDesc = prepare(`
    SELECT code as sku FROM products
    WHERE (description IS NULL OR description = '' OR LENGTH(description) < 50)
    AND is_active = 1
  `).all();

  for (const p of noDesc) {
    createQualityIssue(p.sku, 'content', 'NO_DESCRIPTION', 'high', 'Açıklama eksik/yetersiz', 'Ürün açıklaması 50 karakterden kısa');
    issuesCreated++;
  }
  await yieldToEventLoop();

  // 4. Kategori eksikliği
  const noCategory = prepare(`
    SELECT code as sku FROM products
    WHERE (main_category IS NULL OR main_category = '')
    AND is_active = 1
  `).all();

  for (const p of noCategory) {
    createQualityIssue(p.sku, 'category', 'NO_CATEGORY', 'critical', 'Kategori atanmamış', 'Ürüne ana kategori atanmamış');
    issuesCreated++;
  }
  await yieldToEventLoop();

  // 5. Marka eksikliği
  const noBrand = prepare(`
    SELECT code as sku FROM products
    WHERE (brand IS NULL OR brand = '')
    AND is_active = 1
  `).all();

  for (const p of noBrand) {
    createQualityIssue(p.sku, 'content', 'NO_BRAND', 'medium', 'Marka eksik', 'Ürüne marka atanmamış');
    issuesCreated++;
  }
  await yieldToEventLoop();

  // 6. Fiyat anomalisi (marj < 5% veya > 80%)
  const priceIssues = prepare(`
    SELECT code as sku, buying_price, selling_price,
           CASE WHEN buying_price > 0 THEN ((selling_price - buying_price) / buying_price * 100) ELSE 0 END as margin
    FROM products
    WHERE is_active = 1 AND buying_price > 0 AND selling_price > 0
    AND (
      (selling_price - buying_price) / buying_price < 0.05
      OR (selling_price - buying_price) / buying_price > 0.80
    )
  `).all();

  for (const p of priceIssues) {
    const margin = ((p.selling_price - p.buying_price) / p.buying_price * 100).toFixed(1);
    if (margin < 5) {
      createQualityIssue(p.sku, 'pricing', 'LOW_MARGIN', 'high', 'Düşük marj', `Marj sadece %${margin}`);
    } else {
      createQualityIssue(p.sku, 'pricing', 'HIGH_MARGIN', 'low', 'Yüksek marj', `Marj %${margin} - fiyat kontrolü gerekebilir`);
    }
    issuesCreated++;
  }

  return { issuesCreated };
}

// ─────────────────────────────────────────────────────────────────────────────
// VERİ TUTARLILIĞI KONTROLÜ
// ─────────────────────────────────────────────────────────────────────────────

export function getDataIntegrity() {
  // 1. Storefront eşleşme durumu
  const storefrontMatching = prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN panel_product_id IS NOT NULL THEN 1 ELSE 0 END) as matched,
      SUM(CASE WHEN panel_product_id IS NULL THEN 1 ELSE 0 END) as unmatched
    FROM storefront_products
  `).get();

  // 2. Panel ürünleri storefront eşleşme durumu
  const panelMatching = prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN sf.id IS NOT NULL THEN 1 ELSE 0 END) as has_storefront,
      SUM(CASE WHEN sf.id IS NULL THEN 1 ELSE 0 END) as no_storefront
    FROM products p
    LEFT JOIN storefront_products sf ON p.id = sf.panel_product_id
    WHERE p.is_active = 1
  `).get();

  // 3. Yetim rekabet verileri (product_id mevcut olmayan)
  const orphanCompetitors = prepare(`
    SELECT COUNT(*) as count
    FROM competitors c
    LEFT JOIN products p ON c.product_id = p.id
    WHERE p.id IS NULL
  `).get();

  // 4. Yetim product_metas (product_id mevcut olmayan)
  const orphanMetas = prepare(`
    SELECT COUNT(*) as count
    FROM product_metas pm
    LEFT JOIN products p ON pm.product_id = p.id
    WHERE p.id IS NULL
  `).get();

  // 5. Fiyat tutarlılığı (alış > satış)
  const priceInconsistency = prepare(`
    SELECT COUNT(*) as count
    FROM products
    WHERE buying_price > 0 AND selling_price > 0
    AND buying_price > selling_price
    AND is_active = 1
  `).get();

  // 6. Stok tutarsızlığı (aktif ama stok 0)
  const stockInconsistency = prepare(`
    SELECT COUNT(*) as count
    FROM products
    WHERE is_active = 1 AND total_quantity = 0
  `).get();

  // 7. Duplicate SKU kontrolü (storefront)
  const duplicateStorefrontSkus = prepare(`
    SELECT sku, COUNT(*) as count
    FROM storefront_products
    GROUP BY sku
    HAVING count > 1
    LIMIT 10
  `).all();

  // 8. Panel-Storefront fiyat uyumsuzluğu
  const priceMismatch = prepare(`
    SELECT COUNT(*) as count
    FROM products p
    INNER JOIN storefront_products sf ON p.id = sf.panel_product_id
    WHERE ABS(p.selling_price - sf.sell_price) > 1
  `).get();

  // 9. Eksik akakce verisi olan yüksek fiyatlı ürünler
  const highPriceNoAkakce = prepare(`
    SELECT COUNT(*) as count
    FROM products
    WHERE selling_price > 500
    AND akakce_product_id IS NULL
    AND is_active = 1
  `).get();

  // 10. Kategori tutarsızlığı (panel vs storefront)
  const categoryMismatch = prepare(`
    SELECT COUNT(*) as count
    FROM products p
    INNER JOIN storefront_products sf ON p.id = sf.panel_product_id
    WHERE p.main_category IS NOT NULL
    AND sf.main_category IS NOT NULL
    AND p.main_category != sf.main_category
  `).get();

  return {
    storefrontMatching: {
      total: storefrontMatching.total,
      matched: storefrontMatching.matched,
      unmatched: storefrontMatching.unmatched,
      matchRate: storefrontMatching.total > 0 ? Math.round(storefrontMatching.matched / storefrontMatching.total * 100) : 0
    },
    panelMatching: {
      total: panelMatching.total,
      hasStorefront: panelMatching.has_storefront,
      noStorefront: panelMatching.no_storefront,
      storefrontRate: panelMatching.total > 0 ? Math.round(panelMatching.has_storefront / panelMatching.total * 100) : 0
    },
    orphanRecords: {
      competitors: orphanCompetitors.count,
      metas: orphanMetas.count
    },
    inconsistencies: {
      priceInversion: priceInconsistency.count,
      activeNoStock: stockInconsistency.count,
      priceMismatch: priceMismatch.count,
      categoryMismatch: categoryMismatch.count,
      highPriceNoAkakce: highPriceNoAkakce.count
    },
    duplicates: {
      storefrontSkus: duplicateStorefrontSkus
    }
  };
}

// ⚠️ DEVRE DIŞI - Bu fonksiyon kaynak verileri değiştirdiği için kullanılmamalı
// Doğru yaklaşım: Unified endpoint'te COALESCE ile SELECT, tutarsızlıkları UI'da göster
// Fiyatları storefront ile senkronize et
// maxDiffPercent: Maksimum kabul edilebilir fiyat farkı yüzdesi (varsayılan %200)
// Çok yüksek farklar birim/paket karışıklığı olabilir
function syncPricesFromStorefront(dryRun = true, maxDiffPercent = 200) {
  // Storefront'taki discount_price ile panel selling_price'ı karşılaştır
  const allMismatches = prepare(`
    SELECT
      p.id, p.code, p.name, p.selling_price as panel_price,
      p.buying_price,
      sf.discount_price as storefront_price,
      sf.sell_price as list_price,
      ABS(p.selling_price - sf.discount_price) as price_diff,
      CASE WHEN p.selling_price > 0
        THEN ABS(p.selling_price - sf.discount_price) / p.selling_price * 100
        ELSE 0 END as diff_percent
    FROM products p
    INNER JOIN storefront_products sf ON p.id = sf.panel_product_id
    WHERE sf.discount_price IS NOT NULL
      AND sf.discount_price > 0
      AND ABS(p.selling_price - sf.discount_price) > 1
    ORDER BY price_diff DESC
  `).all();

  // Anomalileri filtrele (çok yüksek fark = birim/paket karışıklığı olabilir)
  const validMismatches = allMismatches.filter(m => m.diff_percent <= maxDiffPercent);
  const anomalies = allMismatches.filter(m => m.diff_percent > maxDiffPercent);

  const results = {
    totalMismatches: allMismatches.length,
    validMismatches: validMismatches.length,
    anomalies: anomalies.length,
    anomalyNote: `${anomalies.length} ürün >${maxDiffPercent}% fark nedeniyle atlandı (birim/paket karışıklığı olabilir)`,
    updated: 0,
    samples: validMismatches.slice(0, 10).map(m => ({
      code: m.code,
      name: m.name?.substring(0, 40),
      panelPrice: m.panel_price,
      storefrontPrice: m.storefront_price,
      diff: m.price_diff,
      diffPercent: Math.round(m.diff_percent)
    })),
    anomalySamples: anomalies.slice(0, 5).map(m => ({
      code: m.code,
      name: m.name?.substring(0, 40),
      panelPrice: m.panel_price,
      storefrontPrice: m.storefront_price,
      diffPercent: Math.round(m.diff_percent)
    }))
  };

  if (!dryRun) {
    for (const m of validMismatches) {
      prepare(`
        UPDATE products
        SET selling_price = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(m.storefront_price, m.id);
      results.updated++;
    }
  }

  return { dryRun, maxDiffPercent, ...results };
}

// Negatif marjlı ürünleri listele
export function getNegativeMarginProducts(limit = 100) {
  return prepare(`
    SELECT
      p.id, p.code, p.name, p.brand, p.supplier_name,
      p.buying_price, p.selling_price,
      ROUND((p.selling_price - p.buying_price), 2) as profit,
      ROUND((p.selling_price - p.buying_price) / p.selling_price * 100, 2) as margin_percent,
      sf.discount_price as storefront_price,
      sf.sell_price as list_price,
      CASE WHEN sf.slug IS NOT NULL THEN 'https://www.petzzshop.com/' || sf.slug ELSE NULL END as petzzshop_url,
      CASE WHEN sf.panel_product_id IS NOT NULL THEN 1 ELSE 0 END as has_storefront
    FROM products p
    LEFT JOIN storefront_products sf ON p.id = sf.panel_product_id
    WHERE p.buying_price > 0
      AND p.selling_price > 0
      AND p.buying_price > p.selling_price
    ORDER BY (p.buying_price - p.selling_price) DESC
    LIMIT ?
  `).all(limit);
}

// Storefront'ta satılan negatif marjlı ürünleri listele (ACİL)
export function getStorefrontNegativeMargin() {
  return prepare(`
    SELECT
      p.id, p.code, p.name, p.brand, p.supplier_name,
      p.buying_price, p.selling_price,
      ROUND(p.buying_price - p.selling_price, 2) as loss,
      ROUND((p.buying_price - p.selling_price) / p.buying_price * 100, 1) as loss_percent,
      sf.discount_price as storefront_price,
      sf.sell_price as list_price,
      'https://www.petzzshop.com/' || sf.slug as petzzshop_url,
      CASE
        WHEN p.buying_price / p.selling_price > 5 THEN 'BIRIM_KOLI_KARISIKLIGI'
        WHEN p.selling_price < 50 AND p.buying_price > 200 THEN 'OLASI_VERI_HATASI'
        ELSE 'FIYAT_KONTROLU_GEREKLI'
      END as issue_type
    FROM products p
    INNER JOIN storefront_products sf ON p.id = sf.panel_product_id
    WHERE p.buying_price > 0
      AND p.selling_price > 0
      AND p.buying_price > p.selling_price
      AND sf.slug IS NOT NULL
    ORDER BY (p.buying_price - p.selling_price) DESC
  `).all();
}

// Tedarikçi sağlık raporu
export function getSupplierHealth() {
  const suppliers = prepare(`
    SELECT
      supplier_name,
      COUNT(*) as total_products,
      SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_products,
      SUM(CASE WHEN total_quantity > 0 THEN 1 ELSE 0 END) as in_stock,
      SUM(CASE WHEN is_active = 1 AND total_quantity = 0 THEN 1 ELSE 0 END) as active_no_stock,
      SUM(CASE WHEN buying_price > 0 AND selling_price > 0 AND buying_price > selling_price THEN 1 ELSE 0 END) as negative_margin,
      ROUND(AVG(CASE WHEN buying_price > 0 AND selling_price > 0 THEN (selling_price - buying_price) / buying_price * 100 ELSE NULL END), 1) as avg_margin
    FROM products
    WHERE supplier_name IS NOT NULL AND supplier_name != ''
    GROUP BY supplier_name
    ORDER BY total_products DESC
  `).all();

  return suppliers.map(s => {
    const stockRate = s.total_products > 0 ? (s.in_stock / s.total_products * 100) : 0;
    const outOfStockRate = s.active_products > 0 ? (s.active_no_stock / s.active_products * 100) : 0;

    let healthStatus = 'HEALTHY';
    let issues = [];

    if (outOfStockRate >= 95) {
      healthStatus = 'CRITICAL';
      issues.push('Neredeyse tüm ürünler stoksuz');
    } else if (outOfStockRate >= 80) {
      healthStatus = 'WARNING';
      issues.push('Çoğu ürün stoksuz');
    }

    if (s.negative_margin > 0) {
      issues.push(`${s.negative_margin} ürün negatif marjlı`);
    }

    if (s.avg_margin !== null && s.avg_margin < 5) {
      issues.push(`Ortalama marj düşük (%${s.avg_margin})`);
    }

    return {
      supplierName: s.supplier_name,
      totalProducts: s.total_products,
      activeProducts: s.active_products,
      inStock: s.in_stock,
      activeNoStock: s.active_no_stock,
      stockRate: Math.round(stockRate * 10) / 10,
      outOfStockRate: Math.round(outOfStockRate * 10) / 10,
      negativeMargin: s.negative_margin,
      avgMargin: s.avg_margin,
      healthStatus,
      issues
    };
  });
}

// Eşleşmemiş storefront ürünlerini getir
export function getUnmatchedStorefrontProducts() {
  return prepare(`
    SELECT
      sf.id, sf.sku, sf.name, sf.barcode, sf.brand, sf.main_category,
      sf.sell_price, sf.discount_price, sf.slug,
      'https://www.petzzshop.com/' || sf.slug as petzzshop_url
    FROM storefront_products sf
    WHERE sf.panel_product_id IS NULL
    ORDER BY sf.name
  `).all();
}

// Storefront ürünlerini ara (tümü - eşleşmiş ve eşleşmemiş)
export function searchStorefrontProducts(searchTerm, limit = 100) {
  const term = `%${searchTerm}%`;
  return prepare(`
    SELECT
      sf.id, sf.sku, sf.name, sf.barcode, sf.brand, sf.main_category,
      sf.sell_price, sf.discount_price, sf.slug,
      sf.panel_product_id, sf.is_matched,
      'https://www.petzzshop.com/' || sf.slug as petzzshop_url,
      p.code as panel_code, p.name as panel_name
    FROM storefront_products sf
    LEFT JOIN products p ON sf.panel_product_id = p.id
    WHERE sf.name LIKE ? OR sf.brand LIKE ? OR sf.sku LIKE ?
    ORDER BY sf.name
    LIMIT ?
  `).all(term, term, term, limit);
}

// Storefront ürünlerini panel ile eşleştir
export function matchStorefrontProducts(dryRun = true) {
  // Eşleşmemiş SF ürünlerini bul
  const unmatched = prepare(`
    SELECT sf.id, sf.sku, sf.name, sf.barcode, sf.brand
    FROM storefront_products sf
    WHERE sf.panel_product_id IS NULL
  `).all();

  const results = {
    total: unmatched.length,
    matched: {
      bySku: 0,
      byBarcode: 0
    },
    unmatched: 0,
    samples: []
  };

  for (const sf of unmatched) {
    let matched = false;
    let matchType = null;
    let panelProduct = null;

    // 1. SKU ile eşleştir (code = sku)
    if (sf.sku) {
      panelProduct = prepare(`
        SELECT id, code, name FROM products WHERE code = ?
      `).get(sf.sku);

      if (panelProduct) {
        matched = true;
        matchType = 'sku';
        results.matched.bySku++;
      }
    }

    // 2. Barkod ile eşleştir
    if (!matched && sf.barcode) {
      panelProduct = prepare(`
        SELECT p.id, p.code, p.name
        FROM products p
        JOIN product_metas pm ON p.id = pm.product_id
        WHERE pm.barcode = ?
        LIMIT 1
      `).get(sf.barcode);

      if (panelProduct) {
        matched = true;
        matchType = 'barcode';
        results.matched.byBarcode++;
      }
    }

    if (matched && !dryRun) {
      // Eşleştirmeyi kaydet
      prepare(`
        UPDATE storefront_products
        SET panel_product_id = ?, is_matched = 1
        WHERE id = ?
      `).run(panelProduct.id, sf.id);
    }

    if (!matched) {
      results.unmatched++;
    }

    // İlk 10 örneği kaydet
    if (results.samples.length < 10) {
      results.samples.push({
        sfSku: sf.sku,
        sfName: sf.name?.substring(0, 40),
        sfBarcode: sf.barcode,
        matched,
        matchType,
        panelCode: panelProduct?.code,
        panelName: panelProduct?.name?.substring(0, 40)
      });
    }
  }

  return { dryRun, ...results };
}

// Yetim kayıtları temizle
export function cleanOrphanRecords(dryRun = true) {
  const results = { competitors: 0, metas: 0 };

  if (!dryRun) {
    // Yetim competitor kayıtlarını sil
    const competitorIds = prepare(`
      SELECT c.id FROM competitors c
      LEFT JOIN products p ON c.product_id = p.id
      WHERE p.id IS NULL
    `).all();

    for (const { id } of competitorIds) {
      prepare('DELETE FROM competitors WHERE id = ?').run(id);
      results.competitors++;
    }

    // Yetim meta kayıtlarını sil
    const metaIds = prepare(`
      SELECT pm.id FROM product_metas pm
      LEFT JOIN products p ON pm.product_id = p.id
      WHERE p.id IS NULL
    `).all();

    for (const { id } of metaIds) {
      prepare('DELETE FROM product_metas WHERE id = ?').run(id);
      results.metas++;
    }
  } else {
    // Sadece say (dry run)
    results.competitors = prepare(`
      SELECT COUNT(*) as count FROM competitors c
      LEFT JOIN products p ON c.product_id = p.id
      WHERE p.id IS NULL
    `).get().count;

    results.metas = prepare(`
      SELECT COUNT(*) as count FROM product_metas pm
      LEFT JOIN products p ON pm.product_id = p.id
      WHERE p.id IS NULL
    `).get().count;
  }

  return { dryRun, deleted: results };
}

export default {
  // Kategori
  analyzeCategories,
  getCategorySuggestions,
  updateCategorySuggestion,
  bulkApproveSuggestions,

  // Kalite
  detectQualityIssues,
  getQualityIssues,
  getQualityIssueSummary,

  // Görevler
  createTasksFromIssues,
  getTasks,
  assignTask,
  completeTask,
  getTaskSummary,

  // Özellikler
  setProductAttribute,
  getProductAttributes,
  getAttributesBulk,

  // Changelog
  logChange,
  getChangelog,

  // Dashboard
  getDataCenterDashboard,
  runFullAnalysis,

  // Veri Tutarlılığı
  getDataIntegrity,
  cleanOrphanRecords,
  // syncPricesFromStorefront, // DEVRE DIŞI - Kaynak verileri değiştirmemeli
  getNegativeMarginProducts,
  getStorefrontNegativeMargin,
  getSupplierHealth,
  getUnmatchedStorefrontProducts,
  matchStorefrontProducts,
  searchStorefrontProducts
};
