import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../../database.sqlite');

let db = null;

// Initialize database
export async function initDatabase() {
  const SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      site_name TEXT,
      brand TEXT,
      supplier_name TEXT,
      supplier_code TEXT,
      main_category TEXT,
      sub_category TEXT,
      detail_category TEXT,
      buying_price REAL DEFAULT 0,
      selling_price REAL DEFAULT 0,
      last_price REAL DEFAULT 0,
      total_quantity INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      is_bundle INTEGER DEFAULT 0,
      is_obsolete INTEGER DEFAULT 0,
      vat INTEGER DEFAULT 0,
      deci REAL DEFAULT 0,
      images TEXT,
      description TEXT,
      akakce_product_id TEXT,
      akakce_low_price REAL,
      akakce_high_price REAL,
      akakce_petzz_price REAL,
      akakce_target_price REAL,
      akakce_drop_price REAL,
      akakce_total_sellers INTEGER,
      akakce_url TEXT,
      last_seen_at TEXT,
      synced_at TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      -- Satış verileri (Analytics)
      sales_15 INTEGER DEFAULT 0,
      sales_30 INTEGER DEFAULT 0,
      sales_60 INTEGER DEFAULT 0,
      sales_90 INTEGER DEFAULT 0,
      daily_avg_sales REAL DEFAULT 0
    )
  `);

  // Satış sütunlarını ekle (migration için)
  try {
    db.run(`ALTER TABLE products ADD COLUMN sales_15 INTEGER DEFAULT 0`);
    db.run(`ALTER TABLE products ADD COLUMN sales_30 INTEGER DEFAULT 0`);
    db.run(`ALTER TABLE products ADD COLUMN sales_60 INTEGER DEFAULT 0`);
    db.run(`ALTER TABLE products ADD COLUMN sales_90 INTEGER DEFAULT 0`);
    db.run(`ALTER TABLE products ADD COLUMN daily_avg_sales REAL DEFAULT 0`);
  } catch (e) {
    // Sütunlar zaten varsa hata verir, sorun değil
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS product_metas (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      name TEXT,
      barcode TEXT,
      value TEXT,
      quantity INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS competitors (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      akakce_product_id TEXT,
      seller_name TEXT,
      seller_price REAL,
      seller_sort INTEGER,
      updated_at TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sync_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sync_type TEXT,
      status TEXT,
      total_products INTEGER,
      synced_products INTEGER,
      started_at TEXT,
      completed_at TEXT,
      error_message TEXT
    )
  `);

  // Create indexes - Products
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_code ON products(code)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_main_category ON products(main_category)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_sub_category ON products(sub_category)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_detail_category ON products(detail_category)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_name)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_quantity ON products(total_quantity)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_selling_price ON products(selling_price)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_buying_price ON products(buying_price)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_bundle ON products(is_bundle)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_akakce ON products(akakce_product_id)`);
  // Composite indexes for common queries
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_category_stock ON products(main_category, total_quantity)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_brand_category ON products(brand, main_category)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_active_stock ON products(is_active, total_quantity)`);
  // Additional composite indexes for frequent analytics queries
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_active_akakce ON products(is_active, akakce_product_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_price_comparison ON products(akakce_low_price, selling_price)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_margin ON products(buying_price, selling_price)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_products_supplier_category ON products(supplier_name, main_category)`);

  // Product metas & competitors indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_metas_product ON product_metas(product_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_metas_barcode ON product_metas(barcode)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_competitors_product ON competitors(product_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_competitors_seller ON competitors(seller_name)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_competitors_akakce ON competitors(akakce_product_id)`);

  // Storefront (ikas) tables
  db.run(`
    CREATE TABLE IF NOT EXISTS storefront_products (
      id TEXT PRIMARY KEY,
      ikas_product_id TEXT,
      ikas_variant_id TEXT,
      sku TEXT UNIQUE NOT NULL,
      name TEXT,
      brand TEXT,
      description TEXT,
      slug TEXT,
      category_path TEXT,
      main_category TEXT,
      sub_category TEXT,
      sell_price REAL,
      buy_price REAL,
      discount_price REAL,
      discount_percent INTEGER,
      stock_count INTEGER DEFAULT 0,
      variant_type TEXT,
      variant_value TEXT,
      barcode TEXT,
      images TEXT,
      is_matched INTEGER DEFAULT 0,
      panel_product_id TEXT,
      synced_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      price_updated_at TEXT
    )
  `);

  // Migration: Add price_updated_at column if it doesn't exist
  try {
    db.run(`ALTER TABLE storefront_products ADD COLUMN price_updated_at TEXT`);
  } catch (e) {
    // Column already exists
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS product_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL,
      tag_type TEXT NOT NULL,
      tag_value TEXT NOT NULL,
      confidence REAL DEFAULT 1.0,
      source TEXT DEFAULT 'auto',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tag_definitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tag_type TEXT NOT NULL,
      tag_value TEXT NOT NULL,
      keywords TEXT,
      icon TEXT,
      color TEXT,
      UNIQUE(tag_type, tag_value)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS storefront_sync_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT,
      sync_type TEXT DEFAULT 'full',
      total_products INTEGER,
      total_variants INTEGER,
      matched_count INTEGER,
      unmatched_count INTEGER,
      tags_extracted INTEGER,
      started_at TEXT,
      completed_at TEXT,
      error_message TEXT
    )
  `);

  // Migration: Add sync_type column if it doesn't exist
  try {
    db.run(`ALTER TABLE storefront_sync_logs ADD COLUMN sync_type TEXT DEFAULT 'full'`);
  } catch (e) {
    // Column already exists
  }

  // Storefront indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_storefront_sku ON storefront_products(sku)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_storefront_brand ON storefront_products(brand)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_storefront_category ON storefront_products(main_category)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_storefront_matched ON storefront_products(is_matched)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_storefront_panel_id ON storefront_products(panel_product_id)`);
  // Composite index for storefront JOIN performance
  db.run(`CREATE INDEX IF NOT EXISTS idx_storefront_panel_slug ON storefront_products(panel_product_id, slug)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_tags_sku ON product_tags(sku)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_tags_type ON product_tags(tag_type)`);

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA CENTER TABLES - Esnek ve genişletilebilir yapı
  // ═══════════════════════════════════════════════════════════════════════════

  // Veri Kaynakları - Her yeni veri kaynağı burada tanımlanır
  db.run(`
    CREATE TABLE IF NOT EXISTS data_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      source_type TEXT,
      endpoint_url TEXT,
      auth_config TEXT,
      sync_frequency TEXT,
      last_sync_at TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ürün Özellikleri - Esnek key-value yapısı (protein, kullanım şekli, vb.)
  db.run(`
    CREATE TABLE IF NOT EXISTS product_attributes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL,
      attribute_group TEXT NOT NULL,
      attribute_key TEXT NOT NULL,
      attribute_value TEXT,
      value_numeric REAL,
      value_unit TEXT,
      source TEXT,
      confidence REAL DEFAULT 1.0,
      verified_at TEXT,
      verified_by TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(sku, attribute_group, attribute_key)
    )
  `);

  // Özellik Tanımları - Hangi özellikler var, nasıl gösterilir
  db.run(`
    CREATE TABLE IF NOT EXISTS attribute_definitions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attribute_group TEXT NOT NULL,
      attribute_key TEXT NOT NULL,
      display_name TEXT,
      description TEXT,
      data_type TEXT DEFAULT 'text',
      unit TEXT,
      is_filterable INTEGER DEFAULT 0,
      is_searchable INTEGER DEFAULT 1,
      is_required INTEGER DEFAULT 0,
      validation_rules TEXT,
      icon TEXT,
      sort_order INTEGER DEFAULT 0,
      UNIQUE(attribute_group, attribute_key)
    )
  `);

  // Kategori Kuralları - Otomatik kategorileme için
  db.run(`
    CREATE TABLE IF NOT EXISTS category_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rule_name TEXT NOT NULL,
      category_type TEXT NOT NULL,
      category_value TEXT NOT NULL,
      parent_category TEXT,
      keywords TEXT,
      exclude_keywords TEXT,
      brand_filter TEXT,
      min_confidence REAL DEFAULT 0.7,
      priority INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Kategori Önerileri - Tespit edilen eksik kategoriler
  db.run(`
    CREATE TABLE IF NOT EXISTS category_suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL,
      suggested_category TEXT NOT NULL,
      category_type TEXT DEFAULT 'category',
      confidence REAL DEFAULT 0.8,
      reason TEXT,
      matched_keywords TEXT,
      status TEXT DEFAULT 'pending',
      reviewed_by TEXT,
      reviewed_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Görevler - Çalışan görev yönetimi
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_type TEXT NOT NULL,
      priority TEXT DEFAULT 'medium',
      title TEXT NOT NULL,
      description TEXT,
      sku TEXT,
      sku_list TEXT,
      impact_score REAL,
      impact_reason TEXT,
      assigned_to TEXT,
      assigned_at TEXT,
      due_date TEXT,
      status TEXT DEFAULT 'pending',
      resolution TEXT,
      completed_by TEXT,
      completed_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Kalite Sorunları - Tespit edilen problemler
  db.run(`
    CREATE TABLE IF NOT EXISTS quality_issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL,
      issue_type TEXT NOT NULL,
      issue_code TEXT NOT NULL,
      severity TEXT DEFAULT 'medium',
      title TEXT,
      description TEXT,
      current_value TEXT,
      expected_value TEXT,
      impact_score REAL,
      auto_fixable INTEGER DEFAULT 0,
      fix_suggestion TEXT,
      status TEXT DEFAULT 'open',
      resolved_by TEXT,
      resolved_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Değişiklik Logu - Audit trail
  db.run(`
    CREATE TABLE IF NOT EXISTS changelog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      field_name TEXT,
      old_value TEXT,
      new_value TEXT,
      changed_by TEXT,
      change_source TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ürün Skorları - Kalite, SEO, rekabet skorları
  db.run(`
    CREATE TABLE IF NOT EXISTS product_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL,
      score_type TEXT NOT NULL,
      score REAL NOT NULL,
      max_score REAL DEFAULT 100,
      grade TEXT,
      breakdown TEXT,
      calculated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(sku, score_type)
    )
  `);

  // Çalışanlar
  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      role TEXT,
      department TEXT,
      permissions TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Müşteri Soruları - Trendyol, site, vb. gelen sorular
  db.run(`
    CREATE TABLE IF NOT EXISTS customer_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT,
      source TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT,
      answered_by TEXT,
      answered_at TEXT,
      ai_suggested_answer TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sık Sorulan Sorular - Ürün bazlı FAQ
  db.run(`
    CREATE TABLE IF NOT EXISTS product_faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT,
      brand TEXT,
      category TEXT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      answer_source TEXT,
      usage_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Fiyat Geçmişi
  db.run(`
    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL,
      price_type TEXT NOT NULL,
      price REAL NOT NULL,
      source TEXT,
      recorded_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Stok Geçmişi
  db.run(`
    CREATE TABLE IF NOT EXISTS stock_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      location TEXT,
      source TEXT,
      recorded_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // İlişkili Ürünler (varyantlar, setler, tavsiyeler)
  db.run(`
    CREATE TABLE IF NOT EXISTS product_relations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL,
      related_sku TEXT NOT NULL,
      relation_type TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      metadata TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(sku, related_sku, relation_type)
    )
  `);

  // Data Center İndeksleri
  db.run(`CREATE INDEX IF NOT EXISTS idx_attributes_sku ON product_attributes(sku)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_attributes_group ON product_attributes(attribute_group)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_attributes_key ON product_attributes(attribute_key)`);
  // Composite index for attribute lookups
  db.run(`CREATE INDEX IF NOT EXISTS idx_attributes_sku_group ON product_attributes(sku, attribute_group)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_suggestions_sku ON category_suggestions(sku)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_suggestions_status ON category_suggestions(status)`);
  // Composite index for suggestion queries
  db.run(`CREATE INDEX IF NOT EXISTS idx_suggestions_status_type ON category_suggestions(status, category_type)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_sku ON tasks(sku)`);
  // Composite indexes for task queries
  db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_status_priority ON tasks(status, priority)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_sku_type ON tasks(sku, task_type)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_issues_sku ON quality_issues(sku)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_issues_status ON quality_issues(status)`);
  // Composite indexes for issue queries
  db.run(`CREATE INDEX IF NOT EXISTS idx_issues_status_severity ON quality_issues(status, severity)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_issues_sku_code ON quality_issues(sku, issue_code)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_changelog_entity ON changelog(entity_type, entity_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_scores_sku ON product_scores(sku)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_price_history_sku ON price_history(sku)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_stock_history_sku ON stock_history(sku)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_relations_sku ON product_relations(sku)`);

  // ═══════════════════════════════════════════════════════════════════════════
  // GOOGLE TAXONOMY - Standart kategori yapısı
  // ═══════════════════════════════════════════════════════════════════════════

  // Google Taxonomy kategorileri
  db.run(`
    CREATE TABLE IF NOT EXISTS google_taxonomy (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      full_path TEXT NOT NULL,
      parent_id INTEGER,
      level INTEGER DEFAULT 1,
      is_leaf INTEGER DEFAULT 0,
      product_count INTEGER DEFAULT 0,
      stock_count INTEGER DEFAULT 0,
      stock_value REAL DEFAULT 0,
      avg_turnover_days REAL,
      icon TEXT,
      color TEXT,
      is_active INTEGER DEFAULT 1,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ürün-Kategori eşleştirmesi
  db.run(`
    CREATE TABLE IF NOT EXISTS product_category_mapping (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL,
      google_category_id INTEGER NOT NULL,
      confidence REAL DEFAULT 1.0,
      source TEXT DEFAULT 'auto',
      mapped_by TEXT,
      mapped_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(sku, google_category_id)
    )
  `);

  // Kategori eşleştirme kuralları
  db.run(`
    CREATE TABLE IF NOT EXISTS category_mapping_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rule_name TEXT NOT NULL,
      google_category_id INTEGER NOT NULL,
      keywords TEXT,
      brand_filter TEXT,
      exclude_keywords TEXT,
      priority INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      match_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Stok devir hızı geçmişi (kategori bazlı)
  db.run(`
    CREATE TABLE IF NOT EXISTS category_turnover_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      google_category_id INTEGER NOT NULL,
      period_start TEXT NOT NULL,
      period_end TEXT NOT NULL,
      opening_stock INTEGER,
      closing_stock INTEGER,
      units_sold INTEGER,
      turnover_rate REAL,
      days_of_stock REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Google Taxonomy indeksleri
  db.run(`CREATE INDEX IF NOT EXISTS idx_taxonomy_parent ON google_taxonomy(parent_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_taxonomy_level ON google_taxonomy(level)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_mapping_sku ON product_category_mapping(sku)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_mapping_category ON product_category_mapping(google_category_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_turnover_category ON category_turnover_history(google_category_id)`);

  // Varsayılan veri kaynakları ekle
  db.run(`
    INSERT OR IGNORE INTO data_sources (code, name, description, source_type)
    VALUES
      ('petzz_panel', 'Petzz Panel', 'Dahili ürün yönetim sistemi', 'internal'),
      ('ikas_storefront', 'ikas Vitrin', 'petzzshop.com vitrin verileri', 'api'),
      ('akakce', 'Akakce', 'Rakip fiyat ve sıralama verileri', 'scraper'),
      ('google_sc', 'Google Search Console', 'SEO performans verileri', 'api'),
      ('google_analytics', 'Google Analytics', 'Trafik ve dönüşüm verileri', 'api'),
      ('trendyol', 'Trendyol', 'Marketplace verileri', 'api'),
      ('manual', 'Manuel Giriş', 'Elle girilen veriler', 'manual')
  `);

  // Varsayılan özellik grupları
  db.run(`
    INSERT OR IGNORE INTO attribute_definitions (attribute_group, attribute_key, display_name, data_type, is_filterable)
    VALUES
      ('nutrition', 'protein', 'Protein Oranı', 'percentage', 1),
      ('nutrition', 'fat', 'Yağ Oranı', 'percentage', 1),
      ('nutrition', 'fiber', 'Lif Oranı', 'percentage', 1),
      ('nutrition', 'moisture', 'Nem Oranı', 'percentage', 0),
      ('nutrition', 'ash', 'Kül Oranı', 'percentage', 0),
      ('nutrition', 'calories', 'Kalori', 'number', 0),
      ('feeding', 'daily_portion', 'Günlük Porsiyon', 'text', 0),
      ('feeding', 'feeding_guide', 'Besleme Kılavuzu', 'text', 0),
      ('product', 'weight', 'Ağırlık', 'number', 1),
      ('product', 'ingredients', 'İçindekiler', 'text', 0),
      ('product', 'shelf_life', 'Raf Ömrü', 'text', 0),
      ('product', 'storage', 'Saklama Koşulları', 'text', 0),
      ('product', 'origin_country', 'Üretim Ülkesi', 'text', 1),
      ('target', 'species', 'Tür', 'select', 1),
      ('target', 'age_group', 'Yaş Grubu', 'select', 1),
      ('target', 'breed_size', 'Irk Boyutu', 'select', 1),
      ('target', 'special_needs', 'Özel İhtiyaç', 'multi_select', 1),
      ('seo', 'meta_title', 'Meta Başlık', 'text', 0),
      ('seo', 'meta_description', 'Meta Açıklama', 'text', 0),
      ('seo', 'focus_keyword', 'Odak Anahtar Kelime', 'text', 0)
  `);

  // Varsayılan kategori kuralları
  db.run(`
    INSERT OR IGNORE INTO category_rules (rule_name, category_type, category_value, keywords, priority)
    VALUES
      ('Hipoalerjenik Tespit', 'special_need', 'hipoalerjenik', '["hipoalerjenik","hypoallergenic","ha ","hassas sindirim","sensitive"]', 10),
      ('Tahılsız Tespit', 'special_need', 'tahilsiz', '["tahılsız","tahilsiz","grain free","grainfree","tahıl içermez"]', 10),
      ('Kısır Tespit', 'special_need', 'kisir', '["kısır","kisir","sterilised","sterilized","neutered","kısırlaştırılmış"]', 10),
      ('Yavru Tespit', 'age_group', 'yavru', '["yavru","puppy","kitten","junior","baby","starter"]', 10),
      ('Yaşlı Tespit', 'age_group', 'yasli', '["yaşlı","yasli","senior","7+","+7","mature","7 yaş üzeri"]', 10),
      ('Indoor Tespit', 'lifestyle', 'indoor', '["indoor","ev kedisi","ev içi","apartment","daire"]', 8),
      ('Kedi Tespit', 'species', 'kedi', '["kedi","cat","kitten","feline"]', 15),
      ('Köpek Tespit', 'species', 'kopek', '["köpek","kopek","dog","puppy","canine"]', 15),
      ('Tavuk Tespit', 'flavor', 'tavuk', '["tavuk","tavuklu","chicken","poultry"]', 5),
      ('Somon Tespit', 'flavor', 'somon', '["somon","somonlu","salmon"]', 5),
      ('Kuzu Tespit', 'flavor', 'kuzu', '["kuzu","kuzulu","lamb"]', 5)
  `);

  saveDatabase();
  console.log('Database initialized');
  return db;
}

// Save database to file
export function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SQL HELPER CONSTANTS - DRY principle için tekrarlayan SQL parçaları
// ═══════════════════════════════════════════════════════════════════════════

// Storefront JOIN subquery - panel_product_id üzerinden ürün-storefront eşleştirmesi
// ikas vitrin fiyatları (sell_price, discount_price) ve stok bilgisi dahil
export const STOREFRONT_JOIN_SQL = `
  LEFT JOIN (
    SELECT panel_product_id, slug, sell_price, discount_price, stock_count, discount_percent
    FROM storefront_products
    WHERE panel_product_id IS NOT NULL
    GROUP BY panel_product_id
  ) sf ON p.id = sf.panel_product_id`;

// Storefront fiyat alanları - ikas'tan gelen gerçek satış fiyatları
export const STOREFRONT_PRICE_FIELDS = `sf.sell_price as storefront_sell_price, sf.discount_price as storefront_discount_price, sf.stock_count as storefront_stock, sf.discount_percent as storefront_discount_percent`;

// PetzzShop URL expression - slug'dan tam URL oluşturur
export const PETZZSHOP_URL_EXPR = `CASE WHEN sf.slug IS NOT NULL THEN 'https://www.petzzshop.com/' || sf.slug ELSE NULL END`;

// Alias'lı versiyon - SELECT içinde kullanım için
export function petzzUrlAs(alias = 'petzzshop_url') {
  return `${PETZZSHOP_URL_EXPR} as ${alias}`;
}

// Tam product URL seti - hem PetzzShop hem Akakce
export const PRODUCT_URL_FIELDS = `p.akakce_url, ${PETZZSHOP_URL_EXPR} as petzzshop_url`;

// Helper functions to mimic better-sqlite3 API
export function prepare(sql) {
  return {
    run: (...params) => {
      db.run(sql, params);
      saveDatabase();
      return { lastInsertRowid: db.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] };
    },
    get: (...params) => {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row;
      }
      stmt.free();
      return null;
    },
    all: (...params) => {
      const results = [];
      const stmt = db.prepare(sql);
      stmt.bind(params);
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    }
  };
}

export function exec(sql) {
  db.run(sql);
  saveDatabase();
}

export function transaction(fn) {
  return (...args) => {
    db.run('BEGIN TRANSACTION');
    try {
      const result = fn(...args);
      db.run('COMMIT');
      saveDatabase();
      return result;
    } catch (error) {
      db.run('ROLLBACK');
      throw error;
    }
  };
}

export function getDb() {
  return db;
}

export default {
  initDatabase,
  saveDatabase,
  prepare,
  exec,
  transaction,
  getDb,
  // SQL Helpers
  STOREFRONT_JOIN_SQL,
  STOREFRONT_PRICE_FIELDS,
  PETZZSHOP_URL_EXPR,
  PRODUCT_URL_FIELDS,
  petzzUrlAs
};
