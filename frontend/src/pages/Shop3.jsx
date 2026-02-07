import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, ShoppingCart, Heart, User, Menu, X, ChevronRight, ChevronLeft,
  ChevronDown, Truck, RefreshCw, Shield, Clock, Star, Percent, Gift,
  Package, Phone, MapPin, ArrowRight, Sparkles, Zap, Tag, Play, Award,
  ThumbsUp, Mail, Check, CreditCard, Headphones, BadgePercent, Timer,
  TrendingUp, Flame, Crown, Eye, Plus, Minus, Facebook, Twitter, Instagram, Youtube,
  Home, Store, Calendar, Stethoscope, Scissors, PawPrint, MapPinned, Bell
} from 'lucide-react'
import clsx from 'clsx'

// ============================================
// PETCO STYLE - RENK PALETİ
// Primary: #0056A4 (Koyu Mavi)
// Secondary: #00A0AF (Teal/Cyan)
// Accent: #E85D04 (Coral/Turuncu - CTA)
// Background: #F7F7F7 (Açık Gri)
// ============================================

// ============================================
// TAM KATEGORİ YAPISI (4 SEVİYE)
// ============================================
const FULL_CATEGORIES = [
  {
    id: 'kedi',
    name: 'Kedi',
    emoji: '🐱',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop',
    color: '#0056A4',
    productCount: 2500,
    children: [
      {
        id: 'kedi-mamasi',
        name: 'Kedi Maması',
        children: [
          {
            id: 'kuru-kedi-mamasi',
            name: 'Kuru Mama',
            children: [
              { id: 'yavru-kedi-mamasi', name: 'Yavru Kedi Maması' },
              { id: 'yetiskin-kedi-mamasi', name: 'Yetişkin Kedi Maması' },
              { id: 'yasli-kedi-mamasi', name: 'Yaşlı Kedi Maması' },
              { id: 'kisir-kedi-mamasi', name: 'Kısırlaştırılmış Kedi Maması' },
              { id: 'diyet-kedi-mamasi', name: 'Diyet / Light Kedi Maması' },
              { id: 'tahilsiz-kedi-mamasi', name: 'Tahılsız Kedi Maması' },
              { id: 'ozel-irk-kedi-mamasi', name: 'Irka Özel Kedi Maması' }
            ]
          },
          {
            id: 'yas-kedi-mamasi',
            name: 'Yaş Mama / Konserve',
            children: [
              { id: 'pouch-mama', name: 'Pouch (Poşet) Mama' },
              { id: 'konserve-mama', name: 'Konserve Mama' },
              { id: 'yavru-yas-mama', name: 'Yavru Yaş Mama' },
              { id: 'kisir-yas-mama', name: 'Kısır Yaş Mama' }
            ]
          },
          { id: 'veteriner-diyet-kedi', name: 'Veteriner Diyet Mama' }
        ]
      },
      {
        id: 'kedi-odul',
        name: 'Ödül / Atıştırmalık',
        children: [
          { id: 'stick-odul', name: 'Stick Ödül' },
          { id: 'pure-odul', name: 'Püre / Sıvı Ödül' },
          { id: 'biskuvi-odul', name: 'Bisküvi / Kıtır Ödül' },
          { id: 'catnip', name: 'Catnip / Kedi Otu' }
        ]
      },
      {
        id: 'kedi-kumu',
        name: 'Kedi Kumu',
        children: [
          { id: 'bentonit-kum', name: 'Bentonit Kum' },
          { id: 'silika-kum', name: 'Silika / Kristal Kum' },
          { id: 'organik-kum', name: 'Organik / Doğal Kum' }
        ]
      },
      {
        id: 'kedi-tuvalet',
        name: 'Kedi Tuvaleti',
        children: [
          { id: 'kapali-tuvalet', name: 'Kapalı Tuvalet' },
          { id: 'acik-tuvalet', name: 'Açık Tuvalet' },
          { id: 'otomatik-tuvalet', name: 'Otomatik Tuvalet' },
          { id: 'kum-kuregi', name: 'Kum Küreği' },
          { id: 'tuvalet-paspasi', name: 'Tuvalet Paspası' },
          { id: 'koku-giderici', name: 'Koku Giderici' }
        ]
      },
      {
        id: 'kedi-saglik',
        name: 'Sağlık ve Bakım',
        children: [
          { id: 'malt-macun', name: 'Malt / Macun' },
          { id: 'kedi-vitamini', name: 'Vitamin / Takviye' },
          { id: 'kedi-sut-tozu', name: 'Yavru Süt Tozu' },
          { id: 'sakinlestirici-kedi', name: 'Sakinleştirici' },
          { id: 'pire-kene-kedi', name: 'Pire ve Kene' },
          { id: 'kedi-sampuan', name: 'Şampuan' },
          { id: 'kedi-taragi', name: 'Tarak ve Fırça' },
          { id: 'furminator-kedi', name: 'Furminator' },
          { id: 'tirnak-bakim-kedi', name: 'Tırnak Bakımı' },
          { id: 'agiz-dis-kedi', name: 'Ağız ve Diş Bakımı' },
          { id: 'goz-bakim-kedi', name: 'Göz Bakımı' },
          { id: 'kulak-bakim-kedi', name: 'Kulak Bakımı' }
        ]
      },
      {
        id: 'kedi-oyuncak',
        name: 'Oyuncaklar',
        children: [
          { id: 'olta-oyuncak', name: 'Olta Oyuncak' },
          { id: 'lazer-oyuncak', name: 'Lazer Oyuncak' },
          { id: 'top-oyuncak-kedi', name: 'Top Oyuncak' },
          { id: 'tunel-kedi', name: 'Kedi Tüneli' },
          { id: 'zeka-oyuncak-kedi', name: 'Zeka Oyuncağı' },
          { id: 'pelus-oyuncak-kedi', name: 'Peluş Oyuncak' }
        ]
      },
      {
        id: 'kedi-yatak-ev',
        name: 'Yatak ve Ev',
        children: [
          { id: 'kedi-yatagi', name: 'Kedi Yatağı' },
          { id: 'kedi-evi', name: 'Kedi Evi' },
          { id: 'tirmalama-agaci', name: 'Tırmalama Ağacı' },
          { id: 'tirmalama-tahtasi', name: 'Tırmalama Tahtası' }
        ]
      },
      {
        id: 'kedi-mama-kabi',
        name: 'Mama ve Su Kabı',
        children: [
          { id: 'mama-kabi-kedi', name: 'Mama Kabı' },
          { id: 'su-kabi-kedi', name: 'Su Kabı' },
          { id: 'su-pinari-kedi', name: 'Su Pınarı / Çeşme' },
          { id: 'otomatik-mamalk-kedi', name: 'Otomatik Mamalık' },
          { id: 'mama-saklama-kedi', name: 'Mama Saklama Kabı' }
        ]
      },
      {
        id: 'kedi-tasima',
        name: 'Taşıma ve Seyahat',
        children: [
          { id: 'tasima-cantasi-kedi', name: 'Taşıma Çantası' },
          { id: 'tasima-kafesi-kedi', name: 'Taşıma Kafesi' },
          { id: 'kedi-arabasi', name: 'Kedi Arabası' }
        ]
      },
      {
        id: 'kedi-tasma',
        name: 'Tasma ve Aksesuar',
        children: [
          { id: 'boyun-tasma-kedi', name: 'Boyun Tasması' },
          { id: 'gogus-tasma-kedi', name: 'Göğüs Tasması' },
          { id: 'kedi-kiyafet', name: 'Kedi Kıyafeti' }
        ]
      },
      {
        id: 'kedi-guvenlik',
        name: 'Güvenlik',
        children: [
          { id: 'kedi-filesi', name: 'Balkon Filesi' },
          { id: 'kedi-kapisi', name: 'Kedi Kapısı' }
        ]
      }
    ]
  },
  {
    id: 'kopek',
    name: 'Köpek',
    emoji: '🐕',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
    color: '#00A0AF',
    productCount: 3200,
    children: [
      {
        id: 'kopek-mamasi',
        name: 'Köpek Maması',
        children: [
          {
            id: 'kuru-kopek-mamasi',
            name: 'Kuru Mama',
            children: [
              { id: 'yavru-kopek-mamasi', name: 'Yavru Köpek Maması' },
              { id: 'yetiskin-kopek-mamasi', name: 'Yetişkin Köpek Maması' },
              { id: 'yasli-kopek-mamasi', name: 'Yaşlı Köpek Maması' },
              { id: 'diyet-kopek-mamasi', name: 'Diyet / Light Köpek Maması' },
              { id: 'tahilsiz-kopek-mamasi', name: 'Tahılsız Köpek Maması' },
              { id: 'irka-ozel-kopek', name: 'Irka Özel Köpek Maması' },
              { id: 'buyuk-irk-kopek', name: 'Büyük Irk Köpek Maması' },
              { id: 'kucuk-irk-kopek', name: 'Küçük Irk Köpek Maması' }
            ]
          },
          {
            id: 'yas-kopek-mamasi',
            name: 'Yaş Mama / Konserve',
            children: [
              { id: 'konserve-kopek', name: 'Konserve Mama' },
              { id: 'yavru-yas-kopek', name: 'Yavru Yaş Mama' }
            ]
          },
          { id: 'veteriner-diyet-kopek', name: 'Veteriner Diyet Mama' }
        ]
      },
      {
        id: 'kopek-odul',
        name: 'Ödül / Atıştırmalık',
        children: [
          { id: 'kemik-odul', name: 'Kemik / Çiğneme Ödülü' },
          { id: 'stick-odul-kopek', name: 'Stick Ödül' },
          { id: 'biskuvi-odul-kopek', name: 'Bisküvi Ödül' },
          { id: 'dogal-odul', name: 'Doğal Kurutulmuş Ödül' },
          { id: 'dis-sagligi-odul', name: 'Diş Sağlığı Ödülü' }
        ]
      },
      {
        id: 'kopek-saglik',
        name: 'Sağlık ve Bakım',
        children: [
          { id: 'kopek-vitamini', name: 'Vitamin / Takviye' },
          { id: 'kopek-sut-tozu', name: 'Yavru Süt Tozu' },
          { id: 'sakinlestirici-kopek', name: 'Sakinleştirici' },
          { id: 'pire-kene-kopek', name: 'Pire ve Kene' },
          { id: 'kopek-sampuan', name: 'Şampuan' },
          { id: 'kopek-taragi', name: 'Tarak ve Fırça' },
          { id: 'furminator-kopek', name: 'Furminator' },
          { id: 'tiras-makinesi', name: 'Tıraş Makinesi' },
          { id: 'tirnak-bakim-kopek', name: 'Tırnak Bakımı' },
          { id: 'agiz-dis-kopek', name: 'Ağız ve Diş Bakımı' },
          { id: 'cis-pedi', name: 'Çiş Pedi' },
          { id: 'diski-torbasi', name: 'Dışkı Torbası' }
        ]
      },
      {
        id: 'kopek-oyuncak',
        name: 'Oyuncaklar',
        children: [
          { id: 'kong-oyuncak', name: 'Kong / Kauçuk Oyuncak' },
          { id: 'ip-oyuncak', name: 'İp / Halat Oyuncak' },
          { id: 'top-oyuncak-kopek', name: 'Top / Fırlatmalık' },
          { id: 'pelus-oyuncak-kopek', name: 'Peluş Oyuncak' },
          { id: 'zeka-oyuncak-kopek', name: 'Zeka Oyuncağı' }
        ]
      },
      {
        id: 'kopek-yatak-ev',
        name: 'Yatak ve Kulübe',
        children: [
          { id: 'kopek-yatagi', name: 'Köpek Yatağı' },
          { id: 'kopek-kulubesi', name: 'Köpek Kulübesi' },
          { id: 'kopek-minderi', name: 'Köpek Minderi' },
          { id: 'serinletici-yatak', name: 'Serinletici Yatak' }
        ]
      },
      {
        id: 'kopek-mama-kabi',
        name: 'Mama ve Su Kabı',
        children: [
          { id: 'mama-kabi-kopek', name: 'Mama Kabı' },
          { id: 'su-kabi-kopek', name: 'Su Kabı' },
          { id: 'yavas-yeme-kabi', name: 'Yavaş Yeme Kabı' },
          { id: 'otomatik-mamalk-kopek', name: 'Otomatik Mamalık' },
          { id: 'seyahat-suluk', name: 'Seyahat Suluğu' }
        ]
      },
      {
        id: 'kopek-tasma',
        name: 'Tasma ve Kayış',
        children: [
          { id: 'boyun-tasma-kopek', name: 'Boyun Tasması' },
          { id: 'gogus-tasma-kopek', name: 'Göğüs Tasması' },
          { id: 'gezdirme-kayisi', name: 'Gezdirme Kayışı' },
          { id: 'flexi-tasma', name: 'Otomatik (Flexi) Tasma' },
          { id: 'kopek-agizligi', name: 'Köpek Ağızlığı' },
          { id: 'isimlik-kunye', name: 'İsimlik / Künye' }
        ]
      },
      {
        id: 'kopek-tasima',
        name: 'Taşıma ve Seyahat',
        children: [
          { id: 'tasima-cantasi-kopek', name: 'Taşıma Çantası' },
          { id: 'tasima-kafesi-kopek', name: 'Taşıma Kafesi' },
          { id: 'kopek-arabasi', name: 'Köpek Arabası' }
        ]
      },
      {
        id: 'kopek-arac',
        name: 'Araç Ürünleri',
        children: [
          { id: 'koltuk-ortusu', name: 'Koltuk Örtüsü' },
          { id: 'emniyet-kemeri-kopek', name: 'Emniyet Kemeri' }
        ]
      },
      {
        id: 'kopek-kiyafet',
        name: 'Köpek Kıyafeti',
        children: [
          { id: 'mont-yagmurluk', name: 'Mont / Yağmurluk' },
          { id: 'kazak-kopek', name: 'Kazak' },
          { id: 'kopek-ayakkabi', name: 'Köpek Ayakkabısı' }
        ]
      },
      {
        id: 'kopek-egitim',
        name: 'Eğitim Ürünleri',
        children: [
          { id: 'egitim-clicker', name: 'Clicker' },
          { id: 'egitim-dudugu', name: 'Eğitim Düdüğü' },
          { id: 'kopek-citi', name: 'Köpek Çiti' }
        ]
      }
    ]
  },
  {
    id: 'kus',
    name: 'Kuş',
    emoji: '🐦',
    image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=400&fit=crop',
    color: '#4CAF50',
    productCount: 450,
    children: [
      {
        id: 'kus-yemi',
        name: 'Kuş Yemi',
        children: [
          { id: 'muhabbet-yemi', name: 'Muhabbet Kuşu Yemi' },
          { id: 'papagan-yemi', name: 'Papağan Yemi' },
          { id: 'kanarya-yemi', name: 'Kanarya Yemi' },
          { id: 'yavru-kus-yemi', name: 'Yavru Kuş Yemi' }
        ]
      },
      { id: 'kus-odul', name: 'Kraker ve Ödül' },
      { id: 'gaga-tasi', name: 'Gaga Taşı / Kalamar' },
      { id: 'kus-vitamin', name: 'Kuş Vitamini' },
      {
        id: 'kus-kafes',
        name: 'Kafes ve Ekipman',
        children: [
          { id: 'kus-kafesi', name: 'Kuş Kafesi' },
          { id: 'tunek', name: 'Tünek' },
          { id: 'yemlik-suluk', name: 'Yemlik ve Suluk' },
          { id: 'kafes-altligi', name: 'Kafes Altlığı' },
          { id: 'kus-banyosu', name: 'Kuş Banyosu' }
        ]
      },
      { id: 'kus-oyuncak', name: 'Kuş Oyuncağı' },
      { id: 'kus-kumu', name: 'Kuş Kumu' }
    ]
  },
  {
    id: 'balik',
    name: 'Balık',
    emoji: '🐟',
    image: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=400&h=400&fit=crop',
    color: '#06B6D4',
    productCount: 890,
    children: [
      { id: 'balik-yemi', name: 'Balık Yemi' },
      { id: 'akvaryum', name: 'Akvaryum' },
      {
        id: 'akvaryum-ekipman',
        name: 'Akvaryum Ekipmanı',
        children: [
          { id: 'akvaryum-filtre', name: 'Filtre' },
          { id: 'hava-motoru', name: 'Hava Motoru' },
          { id: 'akvaryum-isitici', name: 'Isıtıcı' },
          { id: 'akvaryum-aydinlatma', name: 'Aydınlatma' },
          { id: 'dip-supurgesi', name: 'Dip Süpürgesi' }
        ]
      },
      { id: 'su-duzenleyici', name: 'Su Düzenleyici' },
      { id: 'akvaryum-dekor', name: 'Dekorasyon' }
    ]
  },
  {
    id: 'kemirgen',
    name: 'Kemirgen',
    emoji: '🐹',
    image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&h=400&fit=crop',
    color: '#F59E0B',
    productCount: 320,
    children: [
      {
        id: 'kemirgen-yem',
        name: 'Kemirgen Yemi',
        children: [
          { id: 'tavsan-yemi', name: 'Tavşan Yemi' },
          { id: 'hamster-yemi', name: 'Hamster Yemi' },
          { id: 'guinea-pig-yemi', name: 'Guinea Pig Yemi' },
          { id: 'kuru-ot', name: 'Kuru Ot / Yonca' }
        ]
      },
      { id: 'kemirme-tasi', name: 'Kemirme Taşı' },
      { id: 'kemirgen-kafes', name: 'Kafes' },
      { id: 'kemirgen-talas', name: 'Talaş / Altlık' },
      { id: 'kemirgen-suluk', name: 'Suluk / Yemlik' },
      { id: 'kemirgen-oyuncak', name: 'Oyuncak' }
    ]
  },
  {
    id: 'surungan',
    name: 'Sürüngen',
    emoji: '🦎',
    image: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?w=400&h=400&fit=crop',
    color: '#8B5CF6',
    productCount: 180,
    children: [
      { id: 'surungan-yemi', name: 'Sürüngen Yemi' },
      { id: 'teraryum', name: 'Teraryum' },
      { id: 'teraryum-isitma', name: 'Isıtma / Aydınlatma' },
      { id: 'teraryum-altlik', name: 'Taban Malzemesi' }
    ]
  }
]

// Markalar
const BRANDS = [
  { id: 'royal-canin', name: 'Royal Canin', color: '#C41230', logo: 'RC', premium: true },
  { id: 'hills', name: "Hill's", color: '#003DA5', logo: 'H', premium: true },
  { id: 'purina', name: 'Pro Plan', color: '#E31837', logo: 'PP', premium: true },
  { id: 'acana', name: 'Acana', color: '#1B365D', logo: 'A', premium: true },
  { id: 'orijen', name: 'Orijen', color: '#C4A958', logo: 'O', premium: true },
  { id: 'brit', name: 'Brit', color: '#00A651', logo: 'B' },
  { id: 'reflex', name: 'Reflex', color: '#E94E1B', logo: 'R' },
  { id: 'advance', name: 'Advance', color: '#00599C', logo: 'A' },
  { id: 'gimcat', name: 'GimCat', color: '#FFD700', logo: 'G' },
  { id: 'felix', name: 'Felix', color: '#FF6B00', logo: 'F' },
  { id: 'whiskas', name: 'Whiskas', color: '#6B2D7B', logo: 'W' },
  { id: 'pedigree', name: 'Pedigree', color: '#FFD100', logo: 'P' },
]

// Hero Slides
const HERO_SLIDES = [
  {
    id: 1,
    title: 'Dostunuzun Sağlığı',
    subtitle: 'Bizim Önceliğimiz',
    description: 'Veteriner onaylı ürünler, uzman kadro, %100 müşteri memnuniyeti',
    cta: 'Keşfet',
    image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200&h=600&fit=crop',
    bgGradient: 'from-[#0056A4] via-[#0056A4] to-[#00A0AF]'
  },
  {
    id: 2,
    title: 'Vital Care',
    subtitle: 'Üyelik Programı',
    description: 'Aylık özel indirimler, ücretsiz veteriner danışmanlığı, öncelikli kargo',
    cta: 'Üye Ol',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&h=600&fit=crop',
    bgGradient: 'from-[#00A0AF] via-[#00A0AF] to-[#0056A4]'
  },
  {
    id: 3,
    title: 'Aynı Gün Teslimat',
    subtitle: 'İstanbul İçi',
    description: 'Saat 14:00\'e kadar verilen siparişler aynı gün kapınızda!',
    cta: 'Sipariş Ver',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1200&h=600&fit=crop',
    bgGradient: 'from-[#E85D04] via-[#E85D04] to-[#00A0AF]'
  }
]

// Featured Products
const FEATURED_PRODUCTS = [
  { id: 1, name: 'Royal Canin Indoor 27', category: 'Kedi Maması', price: 899, originalPrice: 1099, rating: 4.9, reviews: 324, image: 'https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=300&h=300&fit=crop', badge: 'En Çok Satan', inStock: true },
  { id: 2, name: 'Acana Wild Prairie', category: 'Köpek Maması', price: 1299, originalPrice: null, rating: 4.8, reviews: 567, image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=300&h=300&fit=crop', badge: 'Premium', inStock: true },
  { id: 3, name: 'Catit Pixi Fountain', category: 'Su Pınarı', price: 549, originalPrice: 649, rating: 4.7, reviews: 189, image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=300&h=300&fit=crop', badge: 'Yeni', inStock: true },
  { id: 4, name: "Hill's Prescription Diet", category: 'Veteriner Diyet', price: 1899, originalPrice: null, rating: 4.9, reviews: 412, image: 'https://images.unsplash.com/photo-1615789591457-74a63395c990?w=300&h=300&fit=crop', badge: 'Reçeteli', inStock: true },
  { id: 5, name: 'Kong Classic XL', category: 'Köpek Oyuncak', price: 189, originalPrice: 229, rating: 4.8, reviews: 678, image: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=300&h=300&fit=crop', badge: 'Popüler', inStock: true },
  { id: 6, name: 'Premium Bentonit Kum 20L', category: 'Kedi Kumu', price: 249, originalPrice: 299, rating: 4.6, reviews: 234, image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300&h=300&fit=crop', badge: '%17 İndirim', inStock: true },
]

// Pet Services
const PET_SERVICES = [
  { id: 1, icon: Scissors, title: 'Pet Kuaför', desc: 'Profesyonel tımar hizmeti', color: '#0056A4' },
  { id: 2, icon: Stethoscope, title: 'Veteriner', desc: 'Ücretsiz danışmanlık', color: '#00A0AF' },
  { id: 3, icon: Calendar, title: 'Otomatik Sipariş', desc: '%10 ekstra indirim', color: '#E85D04' },
  { id: 4, icon: Truck, title: 'Aynı Gün Teslimat', desc: 'İstanbul içi', color: '#4CAF50' },
]

// Reviews
const REVIEWS = [
  { id: 1, name: 'Deniz K.', avatar: 'D', rating: 5, text: 'Vital Care üyeliği gerçekten değer. Her ay ekstra indirimler ve veteriner danışmanlığı çok işe yarıyor.', date: '2 gün önce', verified: true },
  { id: 2, name: 'Canan T.', avatar: 'C', rating: 5, text: 'Aynı gün teslimat muhteşem! Kedimin maması bitmeden hemen sipariş verdim, 3 saat içinde geldi.', date: '1 hafta önce', verified: true },
  { id: 3, name: 'Oğuz M.', avatar: 'O', rating: 5, text: 'Ürün çeşitliliği ve fiyatlar çok iyi. Artık sadece buradan alışveriş yapıyorum.', date: '2 hafta önce', verified: true },
]

// ============================================
// COMPONENTS
// ============================================

// Countdown Timer
function CountdownTimer() {
  const [time, setTime] = useState({ h: 6, m: 45, s: 30 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev
        s--
        if (s < 0) { s = 59; m-- }
        if (m < 0) { m = 59; h-- }
        if (h < 0) { h = 23; m = 59; s = 59 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center gap-1">
      <div className="bg-[#0056A4] text-white px-2.5 py-1 rounded-lg font-bold text-lg">{String(time.h).padStart(2, '0')}</div>
      <span className="text-[#0056A4] font-bold text-lg">:</span>
      <div className="bg-[#0056A4] text-white px-2.5 py-1 rounded-lg font-bold text-lg">{String(time.m).padStart(2, '0')}</div>
      <span className="text-[#0056A4] font-bold text-lg">:</span>
      <div className="bg-[#0056A4] text-white px-2.5 py-1 rounded-lg font-bold text-lg">{String(time.s).padStart(2, '0')}</div>
    </div>
  )
}

// Alt kategori grupları (petzzshop.com tarzı) - KISALTILMIŞ İSİMLER
const SUBCATEGORY_GROUPS = {
  kedi: [
    { id: 'mama', name: 'Mama', categories: ['kedi-mamasi'] },
    { id: 'konserve', name: 'Konserve', categories: ['kedi-mamasi'] },
    { id: 'odul', name: 'Ödül', categories: ['kedi-odul'] },
    { id: 'kum', name: 'Kum', categories: ['kedi-kumu'] },
    { id: 'tuvalet', name: 'Tuvalet', categories: ['kedi-tuvalet'] },
    { id: 'saglik', name: 'Sağlık', categories: ['kedi-saglik'] },
    { id: 'oyuncak', name: 'Oyuncak', categories: ['kedi-oyuncak'] },
    { id: 'yatak', name: 'Yatak', categories: ['kedi-yatak-ev'] },
    { id: 'kap', name: 'Kap', categories: ['kedi-mama-kabi'] },
    { id: 'tasima', name: 'Taşıma', categories: ['kedi-tasima'] },
    { id: 'tasma', name: 'Tasma', categories: ['kedi-tasma'] }
  ],
  kopek: [
    { id: 'mama', name: 'Mama', categories: ['kopek-mamasi'] },
    { id: 'konserve', name: 'Konserve', categories: ['kopek-mamasi'] },
    { id: 'odul', name: 'Ödül', categories: ['kopek-odul'] },
    { id: 'saglik', name: 'Sağlık', categories: ['kopek-saglik'] },
    { id: 'oyuncak', name: 'Oyuncak', categories: ['kopek-oyuncak'] },
    { id: 'yatak', name: 'Yatak', categories: ['kopek-yatak-ev'] },
    { id: 'kap', name: 'Kap', categories: ['kopek-mama-kabi'] },
    { id: 'tasma', name: 'Tasma', categories: ['kopek-tasma'] },
    { id: 'tasima', name: 'Taşıma', categories: ['kopek-tasima'] },
    { id: 'kiyafet', name: 'Kıyafet', categories: ['kopek-kiyafet'] },
    { id: 'egitim', name: 'Eğitim', categories: ['kopek-egitim'] }
  ],
  kus: [
    { id: 'yem', name: 'Yem', categories: ['kus-yemi'] },
    { id: 'odul', name: 'Kraker', categories: ['kus-odul'] },
    { id: 'vitamin', name: 'Vitamin', categories: ['kus-vitamin'] },
    { id: 'kafes', name: 'Kafes', categories: ['kus-kafes'] },
    { id: 'oyuncak', name: 'Oyuncak', categories: ['kus-oyuncak'] },
    { id: 'kum', name: 'Kum', categories: ['kus-kumu'] }
  ],
  balik: [
    { id: 'yem', name: 'Yem', categories: ['balik-yemi'] },
    { id: 'akvaryum', name: 'Akvaryum', categories: ['akvaryum'] },
    { id: 'ekipman', name: 'Ekipman', categories: ['akvaryum-ekipman'] },
    { id: 'su', name: 'Su Bakım', categories: ['su-duzenleyici'] },
    { id: 'dekor', name: 'Dekor', categories: ['akvaryum-dekor'] }
  ],
  kemirgen: [
    { id: 'yem', name: 'Yem', categories: ['kemirgen-yem'] },
    { id: 'kemirme', name: 'Kemirme', categories: ['kemirme-tasi'] },
    { id: 'kafes', name: 'Kafes', categories: ['kemirgen-kafes'] },
    { id: 'altlik', name: 'Altlık', categories: ['kemirgen-talas'] },
    { id: 'suluk', name: 'Suluk', categories: ['kemirgen-suluk'] }
  ],
  surungan: [
    { id: 'yem', name: 'Yem', categories: ['surungan-yemi'] },
    { id: 'teraryum', name: 'Teraryum', categories: ['teraryum'] },
    { id: 'isitma', name: 'Isıtma', categories: ['teraryum-isitma'] },
    { id: 'altlik', name: 'Altlık', categories: ['teraryum-altlik'] }
  ]
}

// Petzzshop tarzı Mega Menu (2. satırdan açılan)
function MegaMenuDropdown({ navigate, onClose, activePet, activeGroup }) {
  if (!activePet || !activeGroup) return null

  // Get categories for this group
  const petData = FULL_CATEGORIES.find(p => p.id === activePet.id)
  if (!petData) return null

  const groupCategories = petData.children?.filter(cat =>
    activeGroup.categories.includes(cat.id)
  ) || []

  // Build columns from subcategories
  const columns = []

  groupCategories.forEach(cat => {
    if (cat.children && cat.children.length > 0) {
      // Category has children - each child becomes a column or items
      cat.children.forEach(subCat => {
        if (subCat.children && subCat.children.length > 0) {
          // Has level 3 children
          columns.push({
            title: subCat.name,
            items: subCat.children.map(item => ({
              id: item.id,
              name: item.name
            }))
          })
        } else {
          // No children - add as single item to a general column
          const existingCol = columns.find(c => c.title === cat.name)
          if (existingCol) {
            existingCol.items.push({ id: subCat.id, name: subCat.name })
          } else {
            columns.push({
              title: cat.name,
              items: [{ id: subCat.id, name: subCat.name }]
            })
          }
        }
      })
    } else {
      // No children - single category
      columns.push({
        title: cat.name,
        items: [{ id: cat.id, name: 'Tüm ' + cat.name }]
      })
    }
  })

  // If no columns generated, create a default one
  if (columns.length === 0 && groupCategories.length > 0) {
    columns.push({
      title: activeGroup.name,
      items: groupCategories.map(cat => ({ id: cat.id, name: cat.name }))
    })
  }

  // Limit to 4 columns for layout
  const displayColumns = columns.slice(0, 4)

  return (
    <div
      className="absolute left-0 right-0 top-full bg-white shadow-xl border-t z-50"
      onMouseLeave={onClose}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Category Columns */}
          <div className="flex-1 grid grid-cols-5 gap-6">
            {displayColumns.map((col, idx) => (
              <div key={idx}>
                <h4 className="font-bold text-[#0056A4] text-sm mb-3 pb-2 border-b border-gray-200">
                  {col.title}
                </h4>
                <ul className="space-y-1.5">
                  {col.items.slice(0, 10).map((item, i) => (
                    <li key={i}>
                      <button
                        onClick={() => { navigate(`/products?search=${encodeURIComponent(item.name)}`); onClose() }}
                        className="text-sm text-gray-600 hover:text-[#E85D04] transition-colors block text-left"
                      >
                        {item.name}
                      </button>
                    </li>
                  ))}
                  {col.items.length > 10 && (
                    <li>
                      <button
                        onClick={() => { navigate(`/products?search=${encodeURIComponent(col.title)}`); onClose() }}
                        className="text-xs text-[#0056A4] font-semibold hover:text-[#E85D04] transition-colors"
                      >
                        Tümünü Gör ({col.items.length}) →
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            ))}

            {/* Brands Column */}
            <div>
              <h4 className="font-bold text-[#0056A4] text-sm mb-3 pb-2 border-b border-gray-200">
                Popüler Markalar
              </h4>
              <ul className="space-y-1.5">
                {BRANDS.slice(0, 8).map((brand) => (
                  <li key={brand.id}>
                    <button
                      onClick={() => { navigate(`/products?brand=${encodeURIComponent(brand.name)}&category=${activePet.name}`); onClose() }}
                      className="text-sm text-gray-600 hover:text-[#E85D04] transition-colors block"
                    >
                      {brand.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right side - Pet image & Quick Links */}
          <div className="w-52 flex-shrink-0 space-y-4">
            <div className="relative rounded-xl overflow-hidden">
              <img src={activePet.image} alt={activePet.name} className="w-full h-28 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 left-2 text-white">
                <p className="text-xs font-bold">{activePet.name} Ürünleri</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-[#F7F7F7] rounded-xl p-3">
              <p className="text-xs font-bold text-[#0056A4] mb-2">Hızlı Erişim</p>
              <div className="space-y-1">
                <button
                  onClick={() => { navigate(`/products?category=${activePet.name}&priceStatus=cheaper`); onClose() }}
                  className="flex items-center gap-2 text-xs text-gray-600 hover:text-[#E85D04] w-full"
                >
                  <Tag className="w-3 h-3" /> İndirimli Ürünler
                </button>
                <button
                  onClick={() => { navigate(`/products?category=${activePet.name}&sort=newest`); onClose() }}
                  className="flex items-center gap-2 text-xs text-gray-600 hover:text-[#E85D04] w-full"
                >
                  <Sparkles className="w-3 h-3" /> Yeni Ürünler
                </button>
                <button
                  onClick={() => { navigate(`/products?category=${activePet.name}&sort=bestseller`); onClose() }}
                  className="flex items-center gap-2 text-xs text-gray-600 hover:text-[#E85D04] w-full"
                >
                  <TrendingUp className="w-3 h-3" /> Çok Satanlar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Logos */}
        <div className="mt-5 pt-4 border-t flex items-center gap-3 overflow-x-auto">
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Markalar:</span>
          {BRANDS.slice(0, 10).map((brand) => (
            <button
              key={brand.id}
              onClick={() => { navigate(`/products?brand=${encodeURIComponent(brand.name)}&category=${activePet.name}`); onClose() }}
              className="flex-shrink-0 px-4 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100"
            >
              <span className="font-semibold text-xs" style={{ color: brand.color }}>{brand.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Header - 2 Satır Sabit (petzzshop.com tarzı)
function Header({ onMenuClick }) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [activePet, setActivePet] = useState(null)
  const [activeGroup, setActiveGroup] = useState(null)
  const menuTimeoutRef = useRef(null)

  const handlePetHover = (pet) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current)
    setActivePet(pet)
    // Set first group as default
    const groups = SUBCATEGORY_GROUPS[pet.id]
    if (groups && groups.length > 0) {
      setActiveGroup(groups[0])
    }
  }

  const handlePetLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setActivePet(null)
      setActiveGroup(null)
    }, 150)
  }

  const handleGroupHover = (group) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current)
    setActiveGroup(group)
  }

  const handleMenuEnter = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current)
  }

  const handleMenuLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setActivePet(null)
      setActiveGroup(null)
    }, 150)
  }

  const closeMenu = () => {
    setActivePet(null)
    setActiveGroup(null)
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Row 0: Top Announcement Bar */}
      <div className="bg-[#0056A4] text-white text-center py-2 text-sm">
        <span>450 TL ve Üzeri <strong>Ücretsiz Kargo</strong></span>
      </div>

      {/* Row 1: Logo + Pet Categories + Search + Icons */}
      <div className="bg-[#E85D04]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-14 gap-4">
            {/* Mobile Menu */}
            <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-white/20 rounded-lg text-white">
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <button onClick={() => navigate('/shop3')} className="flex items-center gap-2 text-white">
              <PawPrint className="w-7 h-7" />
              <span className="text-xl font-black hidden sm:block">petzzshop</span>
            </button>

            {/* Pet Categories - Desktop */}
            <nav className="hidden lg:flex items-center gap-1 ml-6">
              {FULL_CATEGORIES.map((pet) => (
                <div
                  key={pet.id}
                  onMouseEnter={() => handlePetHover(pet)}
                  onMouseLeave={handlePetLeave}
                >
                  <button
                    onClick={() => navigate(`/products?category=${pet.name}`)}
                    className={clsx(
                      "px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors",
                      activePet?.id === pet.id && "bg-white/20 text-white"
                    )}
                  >
                    {pet.name}
                  </button>
                </div>
              ))}
              <button
                onClick={() => navigate('/products?priceStatus=cheaper')}
                className="px-4 py-2 text-sm font-bold text-yellow-300 hover:text-yellow-200 transition-colors"
              >
                Kampanyalar
              </button>
            </nav>

            {/* Search */}
            <div className="flex-1 max-w-md ml-auto hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ürün, kategori veya marka ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/products?search=${searchTerm}`)}
                  className="w-full px-4 py-2 pl-10 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 text-white">
              <button className="md:hidden p-2 hover:bg-white/20 rounded-lg">
                <Search className="w-5 h-5" />
              </button>
              <button className="hidden sm:flex p-2 hover:bg-white/20 rounded-lg relative">
                <Heart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-[#E85D04] text-[10px] font-bold rounded-full flex items-center justify-center">2</span>
              </button>
              <button className="hidden sm:flex p-2 hover:bg-white/20 rounded-lg">
                <User className="w-5 h-5" />
              </button>
              <button onClick={() => navigate('/products')} className="p-2 hover:bg-white/20 rounded-lg relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-[#E85D04] text-[10px] font-bold rounded-full flex items-center justify-center">1</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Subcategory Tabs (shows when pet is hovered) */}
      {activePet && (
        <div
          className="hidden lg:block bg-white border-b shadow-sm"
          onMouseEnter={handleMenuEnter}
          onMouseLeave={handleMenuLeave}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center">
              {SUBCATEGORY_GROUPS[activePet.id]?.map((group) => (
                <button
                  key={group.id}
                  onMouseEnter={() => handleGroupHover(group)}
                  onClick={() => { navigate(`/products?search=${encodeURIComponent(group.name)}`); closeMenu() }}
                  className={clsx(
                    "px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors",
                    activeGroup?.id === group.id
                      ? "text-[#E85D04] border-[#E85D04]"
                      : "text-gray-600 border-transparent hover:text-[#E85D04] hover:border-[#E85D04]/50"
                  )}
                >
                  {group.name}
                </button>
              ))}
              <button
                onClick={() => { navigate(`/products?category=${activePet.name}`); closeMenu() }}
                className="px-3 py-2.5 text-xs font-semibold text-[#0056A4] hover:text-[#E85D04] ml-auto"
              >
                Tümü →
              </button>
            </div>
          </div>

          {/* Dropdown Menu */}
          {activeGroup && (
            <MegaMenuDropdown
              navigate={navigate}
              onClose={closeMenu}
              activePet={activePet}
              activeGroup={activeGroup}
            />
          )}
        </div>
      )}
    </header>
  )
}

// Hero Carousel
function HeroCarousel() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % HERO_SLIDES.length), 6000)
    return () => clearInterval(timer)
  }, [])

  const slide = HERO_SLIDES[current]

  return (
    <section className="relative overflow-hidden">
      <div className={`bg-gradient-to-r ${slide.bgGradient} transition-all duration-700`}>
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl text-center md:text-left z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full text-white text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                Yeni Kampanya
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-3 leading-tight">{slide.title}</h1>
              <h2 className="text-3xl md:text-5xl font-black text-white/90 mb-6">{slide.subtitle}</h2>
              <p className="text-lg text-white/80 mb-8">{slide.description}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button
                  onClick={() => navigate('/products')}
                  className="px-10 py-4 bg-[#E85D04] text-white font-bold rounded-2xl hover:bg-[#D14D00] transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  {slide.cta}
                </button>
                <button
                  onClick={() => navigate('/products?priceStatus=cheaper')}
                  className="px-10 py-4 bg-white/20 backdrop-blur text-white font-bold rounded-2xl hover:bg-white/30 transition-all border-2 border-white/30"
                >
                  Fırsatları Gör
                </button>
              </div>
            </div>
            <div className="hidden md:block relative">
              <img src={slide.image} alt="" className="w-[450px] h-[350px] object-cover rounded-3xl shadow-2xl" />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#00A0AF] rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-[#0056A4]">Aynı Gün Teslimat</p>
                    <p className="text-xs text-gray-500">İstanbul içi siparişler</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Indicators */}
          <div className="flex justify-center md:justify-start gap-3 mt-12">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={clsx(
                  "h-2 rounded-full transition-all",
                  idx === current ? "bg-white w-10" : "bg-white/40 w-2 hover:bg-white/60"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
    </section>
  )
}

// Services Bar
function ServicesBar() {
  return (
    <section className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PET_SERVICES.map((service) => {
            const Icon = service.icon
            return (
              <button key={service.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${service.color}15` }}>
                  <Icon className="w-6 h-6" style={{ color: service.color }} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#0056A4] transition-colors">{service.title}</h4>
                  <p className="text-xs text-gray-500">{service.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Shop by Pet Section
function ShopByPet() {
  const navigate = useNavigate()

  return (
    <section className="py-12 bg-[#F7F7F7]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-[#0056A4] mb-2">Evcil Hayvanına Göre Alışveriş</h2>
          <p className="text-gray-600">Dostunuz için en uygun ürünleri keşfedin</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {FULL_CATEGORIES.map((pet) => (
            <button
              key={pet.id}
              onClick={() => navigate(`/products?category=${pet.name}`)}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
            >
              <div className="aspect-square overflow-hidden">
                <img src={pet.image} alt={pet.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{pet.emoji}</span>
                  <h3 className="text-lg font-bold">{pet.name}</h3>
                </div>
                <p className="text-sm text-white/80">{pet.productCount.toLocaleString()}+ ürün</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-[#00A0AF] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Keşfet</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

// Product Card
function ProductCard({ product }) {
  const navigate = useNavigate()
  const discountPercent = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group">
      <div className="relative">
        <img src={product.image} alt={product.name} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform" />
        {product.badge && (
          <span className={clsx(
            "absolute top-3 left-3 px-3 py-1 text-white text-xs font-bold rounded-full",
            product.badge.includes('İndirim') ? 'bg-[#E85D04]' : 'bg-[#0056A4]'
          )}>
            {product.badge}
          </span>
        )}
        <button className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white hover:text-[#E85D04] transition-all opacity-0 group-hover:opacity-100">
          <Heart className="w-5 h-5" />
        </button>
        {product.inStock && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
            <Check className="w-3 h-3" /> Stokta
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-[#00A0AF] font-semibold mb-1">{product.category}</p>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#0056A4] transition-colors">{product.name}</h3>
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-bold">{product.rating}</span>
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-black text-[#0056A4]">{product.price}₺</span>
          {product.originalPrice && (
            <>
              <span className="text-sm text-gray-400 line-through">{product.originalPrice}₺</span>
              <span className="text-xs text-[#E85D04] font-bold">-%{discountPercent}</span>
            </>
          )}
        </div>
        <button
          onClick={() => navigate('/products')}
          className="w-full py-3 bg-[#0056A4] text-white font-bold rounded-xl hover:bg-[#004080] transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Sepete Ekle
        </button>
      </div>
    </div>
  )
}

// Featured Products Section
function FeaturedProducts() {
  const navigate = useNavigate()

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black text-[#0056A4] mb-2">Öne Çıkan Ürünler</h2>
            <p className="text-gray-600">En çok tercih edilen ve beğenilen ürünler</p>
          </div>
          <button onClick={() => navigate('/products')} className="flex items-center gap-2 px-6 py-3 border-2 border-[#0056A4] text-[#0056A4] font-bold rounded-xl hover:bg-[#0056A4] hover:text-white transition-colors">
            Tümünü Gör <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {FEATURED_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Deal of the Day
function DealOfTheDay() {
  const navigate = useNavigate()

  return (
    <section className="py-12 bg-gradient-to-r from-[#0056A4] to-[#00A0AF]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-white text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
              <Flame className="w-8 h-8 text-[#E85D04]" />
              <h2 className="text-3xl font-black">Günün Fırsatı</h2>
            </div>
            <p className="text-blue-100 text-lg mb-6">Kaçırmayın! Bu fırsat sadece bugün geçerli.</p>
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
              <span className="text-sm">Bitimine kalan:</span>
              <CountdownTimer />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl max-w-sm">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&h=300&fit=crop" alt="Deal" className="w-full h-48 object-cover rounded-2xl" />
                <span className="absolute top-3 left-3 px-4 py-2 bg-[#E85D04] text-white text-sm font-bold rounded-full">-%35</span>
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-gray-900 mb-2">Royal Canin Maxi Adult 15kg</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-black text-[#0056A4]">1.624₺</span>
                  <span className="text-sm text-gray-400 line-through">2.499₺</span>
                </div>
                <button onClick={() => navigate('/products')} className="w-full py-3 bg-[#E85D04] text-white font-bold rounded-xl hover:bg-[#D14D00] transition-colors">
                  Hemen Al
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Vital Care Section
function VitalCare() {
  const navigate = useNavigate()

  return (
    <section className="py-12 bg-[#F7F7F7]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-[#0056A4] to-[#00A0AF] rounded-3xl p-8 md:p-12 overflow-hidden relative">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="text-white text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm mb-4">
                <Crown className="w-5 h-5 text-[#E85D04]" />
                Premium Üyelik
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-4">Vital Care Üyeliği</h2>
              <p className="text-blue-100 text-lg mb-6 max-w-md">
                Aylık sadece 49₺ ile özel indirimler, ücretsiz veteriner danışmanlığı ve çok daha fazlası!
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-[#E85D04]" />
                  <span className="text-sm">%20 Ekstra İndirim</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-[#E85D04]" />
                  <span className="text-sm">Ücretsiz Kargo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-[#E85D04]" />
                  <span className="text-sm">Veteriner Danışmanlık</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-[#E85D04]" />
                  <span className="text-sm">Öncelikli Destek</span>
                </div>
              </div>
              <button onClick={() => navigate('/products')} className="px-10 py-4 bg-[#E85D04] text-white font-bold rounded-2xl hover:bg-[#D14D00] transition-all shadow-xl">
                Hemen Üye Ol - 49₺/ay
              </button>
            </div>
            <div className="hidden lg:block">
              <img src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=400&fit=crop" alt="Vital Care" className="w-80 h-80 object-cover rounded-3xl shadow-2xl" />
            </div>
          </div>
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>
      </div>
    </section>
  )
}

// Reviews Section
function ReviewsSection() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-[#0056A4] mb-2">Müşteri Yorumları</h2>
          <p className="text-gray-600">50.000+ mutlu müşteri</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((review) => (
            <div key={review.id} className="bg-[#F7F7F7] rounded-2xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-[#0056A4] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {review.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900">{review.name}</h4>
                    {review.verified && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <Check className="w-3 h-3" /> Doğrulanmış
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={clsx("w-4 h-4", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-3">{review.text}</p>
              <span className="text-xs text-gray-400">{review.date}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Newsletter
function Newsletter() {
  const [email, setEmail] = useState('')

  return (
    <section className="py-12 bg-[#0056A4]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black mb-2">E-Bültene Abone Olun</h2>
            <p className="text-blue-100">Kampanyalardan ilk siz haberdar olun, %15 indirim kazanın!</p>
          </div>
          <div className="flex w-full md:w-auto gap-3">
            <input
              type="email"
              placeholder="E-posta adresiniz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 md:w-80 px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E85D04]"
            />
            <button className="px-8 py-4 bg-[#E85D04] text-white font-bold rounded-xl hover:bg-[#D14D00] transition-colors whitespace-nowrap">
              Abone Ol
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// Mobile Menu
function MobileMenu({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [expandedPet, setExpandedPet] = useState(null)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white overflow-y-auto">
        <div className="sticky top-0 bg-[#0056A4] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PawPrint className="w-6 h-6" />
            <span className="font-bold text-lg">Menü</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Ara..." className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-sm" />
          </div>
        </div>

        <div className="px-4 pb-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Kategoriler</h3>
          {FULL_CATEGORIES.map((pet) => (
            <div key={pet.id} className="mb-2">
              <button
                onClick={() => setExpandedPet(expandedPet === pet.id ? null : pet.id)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{pet.emoji}</span>
                  <span className="font-semibold text-gray-900">{pet.name}</span>
                </div>
                <ChevronDown className={clsx("w-5 h-5 text-gray-400 transition-transform", expandedPet === pet.id && "rotate-180")} />
              </button>
              {expandedPet === pet.id && (
                <div className="pl-12 pr-4 py-2 space-y-1">
                  {pet.children?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { navigate(`/products?search=${encodeURIComponent(cat.name)}`); onClose() }}
                      className="w-full text-left text-sm text-gray-600 hover:text-[#0056A4] py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {cat.name}
                    </button>
                  ))}
                  <button
                    onClick={() => { navigate(`/products?category=${pet.name}`); onClose() }}
                    className="w-full text-left text-sm text-[#E85D04] font-semibold py-2 px-3"
                  >
                    Tümünü Gör →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <button onClick={() => { navigate('/products?priceStatus=cheaper'); onClose() }} className="w-full flex items-center gap-3 p-3 text-[#E85D04] font-semibold rounded-xl hover:bg-white transition-colors">
            <Zap className="w-5 h-5" /> Fırsatlar
          </button>
          <button onClick={() => { navigate('/products'); onClose() }} className="w-full flex items-center gap-3 p-3 text-[#0056A4] font-semibold rounded-xl hover:bg-white transition-colors">
            <Sparkles className="w-5 h-5" /> Yeni Ürünler
          </button>
        </div>
      </div>
    </div>
  )
}

// Bottom Navigation
function BottomNav() {
  const navigate = useNavigate()
  const items = [
    { icon: Home, label: 'Ana Sayfa', path: '/shop3', active: true },
    { icon: Search, label: 'Ara', path: '/products' },
    { icon: Heart, label: 'Favoriler', path: '/products' },
    { icon: ShoppingCart, label: 'Sepet', path: '/products', badge: 2 },
    { icon: User, label: 'Hesap', path: '/products' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg lg:hidden z-40">
      <div className="flex items-center justify-around py-2 safe-area-pb">
        {items.map((item) => (
          <button key={item.label} onClick={() => navigate(item.path)} className="relative flex flex-col items-center gap-0.5 px-4 py-2">
            <item.icon className={clsx("w-6 h-6", item.active ? "text-[#0056A4]" : "text-gray-400")} />
            <span className={clsx("text-[10px]", item.active ? "text-[#0056A4] font-semibold" : "text-gray-400")}>{item.label}</span>
            {item.badge && (
              <span className="absolute top-0 right-2 w-4 h-4 bg-[#E85D04] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}

// Footer
function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="bg-[#0A1628] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#0056A4] rounded-xl flex items-center justify-center">
                <PawPrint className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-black text-white">petzz</span>
                <span className="text-xl font-black text-[#00A0AF]">shop</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">Evcil dostlarınızın sağlığı ve mutluluğu için.</p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#0056A4] transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold mb-4">Kategoriler</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {FULL_CATEGORIES.map((pet) => (
                <li key={pet.id}>
                  <button onClick={() => navigate(`/products?category=${pet.name}`)} className="hover:text-white transition-colors">{pet.name}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h4 className="font-bold mb-4">Markalar</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {BRANDS.slice(0, 6).map((brand) => (
                <li key={brand.id}>
                  <button onClick={() => navigate(`/products?brand=${encodeURIComponent(brand.name)}`)} className="hover:text-white transition-colors">{brand.name}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-bold mb-4">Yardım</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><button className="hover:text-white transition-colors">Sipariş Takibi</button></li>
              <li><button className="hover:text-white transition-colors">İade & Değişim</button></li>
              <li><button className="hover:text-white transition-colors">SSS</button></li>
              <li><button className="hover:text-white transition-colors">İletişim</button></li>
              <li><button className="hover:text-white transition-colors">Mağaza Bul</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">İletişim</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#00A0AF]" />0850 123 45 67</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#00A0AF]" />info@petzzshop.com</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#00A0AF]" />İstanbul, Türkiye</li>
              <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#00A0AF]" />7/24 Destek</li>
            </ul>
          </div>
        </div>

        {/* Payment & Security */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Güvenli Ödeme:</span>
              <div className="flex gap-2">
                {['VISA', 'MC', 'TROY', 'AMEX'].map((card) => (
                  <div key={card} className="w-12 h-8 bg-white rounded flex items-center justify-center text-xs font-bold text-gray-700">
                    {card}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-500">256-bit SSL ile korunmaktadır</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          © 2024 Petzzshop. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function Shop3() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-20 lg:pb-0">
      <Header onMenuClick={() => setMobileMenuOpen(true)} />
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main>
        <HeroCarousel />
        <ServicesBar />
        <ShopByPet />
        <FeaturedProducts />
        <DealOfTheDay />
        <VitalCare />
        <ReviewsSection />
        <Newsletter />

        {/* Trust Stats */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-black text-[#0056A4] mb-2">10K+</div>
                <p className="text-gray-600">Ürün Çeşidi</p>
              </div>
              <div>
                <div className="text-4xl font-black text-[#00A0AF] mb-2">50K+</div>
                <p className="text-gray-600">Mutlu Müşteri</p>
              </div>
              <div>
                <div className="text-4xl font-black text-[#0056A4] mb-2">100+</div>
                <p className="text-gray-600">Marka</p>
              </div>
              <div>
                <div className="text-4xl font-black text-[#00A0AF] mb-2">4.9</div>
                <p className="text-gray-600">Müşteri Puanı</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  )
}
