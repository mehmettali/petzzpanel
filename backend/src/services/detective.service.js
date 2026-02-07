import { prepare, STOREFRONT_JOIN_SQL } from '../db/database.js';

// Puan düşürücü faktörler
const SCORING_RULES = {
  // Görsel
  NO_IMAGE: { points: -25, code: 'NO_IMAGE', label: 'Görsel yok', icon: '🖼️' },
  SINGLE_IMAGE: { points: -10, code: 'SINGLE_IMAGE', label: 'Tek görsel', icon: '🖼️' },
  FEW_IMAGES: { points: -3, code: 'FEW_IMAGES', label: '2-3 görsel', icon: '🖼️' },

  // İsim
  SHORT_NAME: { points: -15, code: 'SHORT_NAME', label: 'İsim çok kısa', icon: '📛' },
  NAME_IS_CODE: { points: -20, code: 'NAME_IS_CODE', label: 'İsim = Ürün kodu', icon: '📛' },

  // Marka
  NO_BRAND: { points: -15, code: 'NO_BRAND', label: 'Marka boş', icon: '🏢' },

  // Açıklama
  NO_DESCRIPTION: { points: -15, code: 'NO_DESCRIPTION', label: 'Açıklama yok', icon: '📝' },
  SHORT_DESCRIPTION_50: { points: -10, code: 'SHORT_DESCRIPTION_50', label: 'Açıklama < 50 kar.', icon: '📝' },
  SHORT_DESCRIPTION_100: { points: -5, code: 'SHORT_DESCRIPTION_100', label: 'Açıklama < 100 kar.', icon: '📝' },

  // Kategori
  NO_MAIN_CATEGORY: { points: -25, code: 'NO_MAIN_CATEGORY', label: 'Ana kategori boş', icon: '📁' },
  NO_SUB_CATEGORY: { points: -10, code: 'NO_SUB_CATEGORY', label: 'Alt kategori boş', icon: '📁' },
  NO_DETAIL_CATEGORY: { points: -5, code: 'NO_DETAIL_CATEGORY', label: 'Detay kategori boş', icon: '📁' },
  WRONG_CATEGORY: { points: -20, code: 'WRONG_CATEGORY', label: 'Yanlış kategori', icon: '⚠️' },
  MULTI_CATEGORY_MISSING: { points: -10, code: 'MULTI_CATEGORY_MISSING', label: 'Çoklu kategori eksik', icon: '🔀' },

  // Tedarikçi
  NO_SUPPLIER: { points: -10, code: 'NO_SUPPLIER', label: 'Tedarikçi boş', icon: '🚚' },
  NO_SUPPLIER_CODE: { points: -5, code: 'NO_SUPPLIER_CODE', label: 'Tedarikçi kodu boş', icon: '🚚' },

  // Fiyat
  NO_SELLING_PRICE: { points: -20, code: 'NO_SELLING_PRICE', label: 'Satış fiyatı yok', icon: '💰' },
  NO_BUYING_PRICE: { points: -10, code: 'NO_BUYING_PRICE', label: 'Alış fiyatı yok', icon: '💰' },

  // Diğer
  NO_VAT: { points: -5, code: 'NO_VAT', label: 'KDV oranı yok', icon: '📊' },
  NO_DECI: { points: -3, code: 'NO_DECI', label: 'Desi bilgisi yok', icon: '📦' },
};

// Kategori anahtar kelimeleri
const CATEGORY_KEYWORDS = {
  species: {
    kedi: ['kedi', 'cat', 'kitten', 'feline', 'whiskas', 'felix', 'gourmet', 'miglior gatto'],
    kopek: ['köpek', 'kopek', 'dog', 'puppy', 'canine', 'pedigree', 'cesar', 'miglior cane']
  },
  age: {
    yavru: ['yavru', 'puppy', 'kitten', 'junior', 'baby', 'starter'],
    yetiskin: ['yetişkin', 'yetiskin', 'adult'],
    yasli: ['yaşlı', 'yasli', 'senior', 'mature', '+7', '+11', '7+', '11+']
  },
  special: {
    hipoalerjenik: ['hipoalerjenik', 'hypoallergenic', 'hassas', 'sensitive'],
    tahilsiz: ['tahılsız', 'tahilsiz', 'grain free', 'grainfree'],
    kisir: ['kısır', 'kisir', 'sterilised', 'sterilized', 'neutered'],
    diyet: ['diyet', 'diet', 'light', 'weight', 'obesity', 'satiety']
  }
};

// Çoklu kategori gerektiren kelimeler
const MULTI_CATEGORY_KEYWORDS = [
  'kedi ve köpek', 'kedi köpek', 'cat and dog', 'cat & dog',
  'tüm yaşlar', 'all ages', 'all life stages'
];

function getGrade(score) {
  if (score >= 90) return { grade: 'A+', color: 'green' };
  if (score >= 80) return { grade: 'A', color: 'green' };
  if (score >= 70) return { grade: 'B', color: 'yellow' };
  if (score >= 60) return { grade: 'C', color: 'orange' };
  if (score >= 50) return { grade: 'D', color: 'orange' };
  return { grade: 'F', color: 'red' };
}

function analyzeProduct(product) {
  let score = 100;
  const issues = [];
  const images = JSON.parse(product.images || '[]');
  const nameLower = (product.name || '').toLowerCase();
  const mainCatLower = (product.main_category || '').toLowerCase();
  const subCatLower = (product.sub_category || '').toLowerCase();

  // Görsel kontrolü
  if (!images || images.length === 0) {
    score += SCORING_RULES.NO_IMAGE.points;
    issues.push(SCORING_RULES.NO_IMAGE);
  } else if (images.length === 1) {
    score += SCORING_RULES.SINGLE_IMAGE.points;
    issues.push(SCORING_RULES.SINGLE_IMAGE);
  } else if (images.length <= 3) {
    score += SCORING_RULES.FEW_IMAGES.points;
    issues.push(SCORING_RULES.FEW_IMAGES);
  }

  // İsim kontrolü
  if (!product.name || product.name.length < 15) {
    score += SCORING_RULES.SHORT_NAME.points;
    issues.push(SCORING_RULES.SHORT_NAME);
  }
  if (product.name && product.code &&
      (product.name === product.code || product.name.trim() === product.code.trim())) {
    score += SCORING_RULES.NAME_IS_CODE.points;
    issues.push(SCORING_RULES.NAME_IS_CODE);
  }

  // Marka kontrolü
  if (!product.brand || product.brand.trim() === '') {
    score += SCORING_RULES.NO_BRAND.points;
    issues.push(SCORING_RULES.NO_BRAND);
  }

  // Açıklama kontrolü
  const descLength = (product.description || '').length;
  if (descLength === 0) {
    score += SCORING_RULES.NO_DESCRIPTION.points;
    issues.push(SCORING_RULES.NO_DESCRIPTION);
  } else if (descLength < 50) {
    score += SCORING_RULES.SHORT_DESCRIPTION_50.points;
    issues.push(SCORING_RULES.SHORT_DESCRIPTION_50);
  } else if (descLength < 100) {
    score += SCORING_RULES.SHORT_DESCRIPTION_100.points;
    issues.push(SCORING_RULES.SHORT_DESCRIPTION_100);
  }

  // Kategori kontrolü
  if (!product.main_category || product.main_category.trim() === '') {
    score += SCORING_RULES.NO_MAIN_CATEGORY.points;
    issues.push(SCORING_RULES.NO_MAIN_CATEGORY);
  }
  if (!product.sub_category || product.sub_category.trim() === '') {
    score += SCORING_RULES.NO_SUB_CATEGORY.points;
    issues.push(SCORING_RULES.NO_SUB_CATEGORY);
  }
  if (!product.detail_category || product.detail_category.trim() === '') {
    score += SCORING_RULES.NO_DETAIL_CATEGORY.points;
    issues.push(SCORING_RULES.NO_DETAIL_CATEGORY);
  }

  // Yanlış kategori kontrolü
  let wrongCategory = false;

  // Kedi ürünü köpek kategorisinde mi?
  const hasKediKeyword = CATEGORY_KEYWORDS.species.kedi.some(k => nameLower.includes(k));
  const hasKopekKeyword = CATEGORY_KEYWORDS.species.kopek.some(k => nameLower.includes(k));

  if (hasKediKeyword && !hasKopekKeyword && mainCatLower.includes('köpek')) {
    wrongCategory = true;
  }
  if (hasKopekKeyword && !hasKediKeyword && mainCatLower.includes('kedi')) {
    wrongCategory = true;
  }

  // Yavru ürünü yetişkin kategorisinde mi?
  const hasYavruKeyword = CATEGORY_KEYWORDS.age.yavru.some(k => nameLower.includes(k));
  const hasYetiskinKeyword = CATEGORY_KEYWORDS.age.yetiskin.some(k => nameLower.includes(k));
  const hasYasliKeyword = CATEGORY_KEYWORDS.age.yasli.some(k => nameLower.includes(k));

  if (hasYavruKeyword && !hasYetiskinKeyword &&
      (subCatLower.includes('yetişkin') || subCatLower.includes('adult'))) {
    wrongCategory = true;
  }
  if (hasYasliKeyword &&
      (subCatLower.includes('yavru') || subCatLower.includes('yetişkin'))) {
    wrongCategory = true;
  }

  if (wrongCategory) {
    score += SCORING_RULES.WRONG_CATEGORY.points;
    issues.push(SCORING_RULES.WRONG_CATEGORY);
  }

  // Çoklu kategori eksik mi?
  const needsMultiCategory = MULTI_CATEGORY_KEYWORDS.some(k => nameLower.includes(k)) ||
                             (hasKediKeyword && hasKopekKeyword);
  if (needsMultiCategory) {
    score += SCORING_RULES.MULTI_CATEGORY_MISSING.points;
    issues.push(SCORING_RULES.MULTI_CATEGORY_MISSING);
  }

  // Tedarikçi kontrolü
  if (!product.supplier_name || product.supplier_name.trim() === '') {
    score += SCORING_RULES.NO_SUPPLIER.points;
    issues.push(SCORING_RULES.NO_SUPPLIER);
  }
  if (!product.supplier_code || product.supplier_code.trim() === '') {
    score += SCORING_RULES.NO_SUPPLIER_CODE.points;
    issues.push(SCORING_RULES.NO_SUPPLIER_CODE);
  }

  // Fiyat kontrolü
  if (!product.selling_price || product.selling_price === 0) {
    score += SCORING_RULES.NO_SELLING_PRICE.points;
    issues.push(SCORING_RULES.NO_SELLING_PRICE);
  }
  if (!product.buying_price || product.buying_price === 0) {
    score += SCORING_RULES.NO_BUYING_PRICE.points;
    issues.push(SCORING_RULES.NO_BUYING_PRICE);
  }

  // Diğer kontroller
  if (!product.vat || product.vat === 0) {
    score += SCORING_RULES.NO_VAT.points;
    issues.push(SCORING_RULES.NO_VAT);
  }
  if (!product.deci || product.deci === 0) {
    score += SCORING_RULES.NO_DECI.points;
    issues.push(SCORING_RULES.NO_DECI);
  }

  // Minimum 0 puan
  score = Math.max(0, score);

  return {
    score,
    ...getGrade(score),
    issues,
    issueCount: issues.length
  };
}

export function getSummary() {
  const products = prepare('SELECT * FROM products WHERE is_active = 1').all();

  let totalScore = 0;
  const gradeDistribution = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
  const issueStats = {};

  // Initialize issue stats
  Object.keys(SCORING_RULES).forEach(key => {
    issueStats[key] = { ...SCORING_RULES[key], count: 0 };
  });

  for (const product of products) {
    const analysis = analyzeProduct(product);
    totalScore += analysis.score;
    gradeDistribution[analysis.grade]++;

    for (const issue of analysis.issues) {
      issueStats[issue.code].count++;
    }
  }

  const avgScore = products.length > 0 ? Math.round(totalScore / products.length) : 0;

  // Sort issues by count
  const topIssues = Object.values(issueStats)
    .filter(i => i.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalProducts: products.length,
    averageScore: avgScore,
    ...getGrade(avgScore),
    gradeDistribution,
    topIssues,
    healthPercentage: Math.round((gradeDistribution['A+'] + gradeDistribution['A']) / products.length * 100)
  };
}

export function getProducts({ page = 1, limit = 50, grade, issueType, category, subCategory, brand, stockStatus, hasImage, hasBrand, search, sortBy = 'score', sortOrder = 'asc' }) {
  const offset = (page - 1) * limit;

  let whereConditions = ['p.is_active = 1'];
  const params = [];

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

  if (stockStatus === 'in-stock') {
    whereConditions.push('p.total_quantity > 0');
  } else if (stockStatus === 'out-of-stock') {
    whereConditions.push('p.total_quantity = 0');
  } else if (stockStatus === 'low-stock') {
    whereConditions.push('p.total_quantity > 0 AND p.total_quantity < 5');
  }

  if (hasBrand === 'yes') {
    whereConditions.push("p.brand IS NOT NULL AND p.brand != ''");
  } else if (hasBrand === 'no') {
    whereConditions.push("(p.brand IS NULL OR p.brand = '')");
  }

  if (search) {
    whereConditions.push('(p.name LIKE ? OR p.code LIKE ? OR p.brand LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const whereClause = whereConditions.join(' AND ');

  // Get all matching products first (we need to analyze each)
  const allProducts = prepare(`
    SELECT p.*, sf.slug as storefront_slug
    FROM products p
    ${STOREFRONT_JOIN_SQL}
    WHERE ${whereClause}
  `).all(...params);

  // Analyze each product
  let analyzedProducts = allProducts.map(p => {
    const analysis = analyzeProduct(p);
    return {
      id: p.id,
      code: p.code,
      name: p.name,
      brand: p.brand,
      main_category: p.main_category,
      sub_category: p.sub_category,
      detail_category: p.detail_category,
      total_quantity: p.total_quantity,
      selling_price: p.selling_price,
      images: JSON.parse(p.images || '[]'),
      akakce_url: p.akakce_url,
      petzzshop_url: p.storefront_slug ? `https://www.petzzshop.com/${p.storefront_slug}` : null,
      ...analysis
    };
  });

  // Filter by grade if specified
  if (grade) {
    analyzedProducts = analyzedProducts.filter(p => p.grade === grade);
  }

  // Filter by issue type if specified
  if (issueType) {
    analyzedProducts = analyzedProducts.filter(p =>
      p.issues.some(i => i.code === issueType)
    );
  }

  // Filter by image status
  if (hasImage === 'yes') {
    analyzedProducts = analyzedProducts.filter(p => p.images && p.images.length > 0);
  } else if (hasImage === 'no') {
    analyzedProducts = analyzedProducts.filter(p => !p.images || p.images.length === 0);
  } else if (hasImage === 'single') {
    analyzedProducts = analyzedProducts.filter(p => p.images && p.images.length === 1);
  } else if (hasImage === 'multiple') {
    analyzedProducts = analyzedProducts.filter(p => p.images && p.images.length > 1);
  }

  // Sort
  analyzedProducts.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'score') {
      comparison = a.score - b.score;
    } else if (sortBy === 'name') {
      comparison = (a.name || '').localeCompare(b.name || '');
    } else if (sortBy === 'issues') {
      comparison = a.issueCount - b.issueCount;
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const total = analyzedProducts.length;
  const paginatedProducts = analyzedProducts.slice(offset, offset + limit);

  return {
    products: paginatedProducts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export function getProductDetail(id) {
  const product = prepare('SELECT * FROM products WHERE id = ?').get(id);
  if (!product) return null;

  const analysis = analyzeProduct(product);
  const metas = prepare('SELECT * FROM product_metas WHERE product_id = ?').all(id);

  // Calculate potential score if issues are fixed
  const potentialImprovements = analysis.issues.map(issue => ({
    ...issue,
    potentialGain: Math.abs(issue.points)
  }));

  return {
    ...product,
    images: JSON.parse(product.images || '[]'),
    metas,
    ...analysis,
    potentialImprovements,
    maxPotentialScore: Math.min(100, analysis.score + potentialImprovements.reduce((sum, i) => sum + i.potentialGain, 0))
  };
}

export function getIssueTypes() {
  return Object.entries(SCORING_RULES).map(([code, rule]) => ({
    code,
    ...rule
  }));
}

export function exportCSV() {
  const products = prepare('SELECT * FROM products WHERE is_active = 1').all();

  const rows = products.map(p => {
    const analysis = analyzeProduct(p);
    return {
      kod: p.code,
      isim: p.name,
      marka: p.brand || '',
      ana_kategori: p.main_category || '',
      alt_kategori: p.sub_category || '',
      detay_kategori: p.detail_category || '',
      puan: analysis.score,
      derece: analysis.grade,
      sorun_sayisi: analysis.issueCount,
      sorunlar: analysis.issues.map(i => i.label).join('; ')
    };
  });

  return rows;
}

export default {
  getSummary,
  getProducts,
  getProductDetail,
  getIssueTypes,
  exportCSV
};
