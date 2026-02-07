import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, ShoppingCart, Heart, User, Menu, X, ChevronRight, ChevronLeft,
  ChevronDown, Truck, RefreshCw, Shield, Clock, Star, Percent, Gift,
  Package, Phone, MapPin, ArrowRight, Sparkles, Zap, Tag, Play, Award,
  ThumbsUp, Mail, Check, CreditCard, Headphones, BadgePercent, Timer,
  TrendingUp, Flame, Crown, Eye, Plus, Minus, Facebook, Twitter, Instagram, Youtube
} from 'lucide-react'
import clsx from 'clsx'

// ============================================
// CHEWY STYLE - RENK PALETİ
// Primary: #1C49C2 (Mavi)
// Secondary: #F5A623 (Sarı/Turuncu)
// Accent: #E53935 (Kırmızı - indirimler)
// ============================================

// Pet Kategorileri (Detaylı - 4 Seviye)
const PETS = [
  {
    id: 'dog',
    name: 'Köpek',
    nameTr: 'Köpek',
    emoji: '🐕',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop',
    color: '#1C49C2',
    count: 3200,
    children: [
      {
        name: 'Köpek Maması',
        children: [
          { name: 'Kuru Mama', children: ['Yavru Köpek', 'Yetişkin Köpek', 'Yaşlı Köpek', 'Büyük Irk', 'Küçük Irk', 'Tahılsız', 'Diyet'] },
          { name: 'Yaş Mama / Konserve', children: ['Konserve', 'Yavru Yaş'] },
          { name: 'Veteriner Diyet' }
        ]
      },
      { name: 'Ödül / Atıştırmalık', children: ['Kemik', 'Stick Ödül', 'Bisküvi', 'Kurutulmuş Et', 'Diş Sağlığı'] },
      { name: 'Sağlık ve Bakım', children: ['Vitamin', 'Pire Kene', 'Şampuan', 'Tarak Fırça', 'Tırnak Bakımı', 'Çiş Pedi'] },
      { name: 'Oyuncaklar', children: ['Kong', 'İp Oyuncak', 'Top', 'Peluş', 'Zeka Oyuncağı'] },
      { name: 'Yatak ve Kulübe', children: ['Köpek Yatağı', 'Kulübe', 'Minder', 'Serinletici'] },
      { name: 'Mama Su Kabı', children: ['Mama Kabı', 'Su Kabı', 'Yavaş Yeme', 'Otomatik Mamalık'] },
      { name: 'Tasma ve Kayış', children: ['Boyun Tasma', 'Göğüs Tasma', 'Flexi Tasma', 'Gezdirme Kayışı'] },
      { name: 'Taşıma ve Seyahat', children: ['Taşıma Çantası', 'Taşıma Kafesi', 'Koltuk Örtüsü'] },
      { name: 'Köpek Kıyafeti', children: ['Mont', 'Kazak', 'Yağmurluk', 'Ayakkabı'] }
    ],
    subcategories: [
      { title: 'Mama', items: ['Kuru Mama', 'Yaş Mama', 'Yavru Mama', 'Yetişkin Mama', 'Yaşlı Mama', 'Diyet Mama'] },
      { title: 'Ödül & Kemik', items: ['Ödül Maması', 'Çiğneme Kemiği', 'Kurutulmuş Et', 'Dental Ödül'] },
      { title: 'Aksesuar', items: ['Tasma & Kayış', 'Giyim', 'Yatak & Minder', 'Mama Kabı', 'Taşıma Çantası'] },
      { title: 'Oyuncak', items: ['Çiğneme Oyuncak', 'Peluş Oyuncak', 'Top & Frizbi', 'Interaktif Oyuncak'] },
      { title: 'Sağlık', items: ['Vitamin', 'Pire & Kene', 'Tüy Bakım', 'Ağız Bakım', 'Kulak Bakım'] }
    ]
  },
  {
    id: 'cat',
    name: 'Kedi',
    nameTr: 'Kedi',
    emoji: '🐱',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=600&fit=crop',
    color: '#9C27B0',
    count: 2500,
    children: [
      {
        name: 'Kedi Maması',
        children: [
          { name: 'Kuru Mama', children: ['Yavru', 'Yetişkin', 'Yaşlı', 'Kısır', 'Diyet', 'Tahılsız', 'Irka Özel'] },
          { name: 'Yaş Mama / Konserve', children: ['Pouch', 'Konserve', 'Yavru Yaş', 'Kısır Yaş'] },
          { name: 'Veteriner Diyet' }
        ]
      },
      { name: 'Ödül / Atıştırmalık', children: ['Stick', 'Püre', 'Bisküvi', 'Catnip'] },
      { name: 'Kedi Kumu', children: ['Bentonit', 'Silika', 'Organik'] },
      { name: 'Kedi Tuvaleti', children: ['Kapalı', 'Açık', 'Otomatik', 'Kum Küreği'] },
      { name: 'Sağlık ve Bakım', children: ['Malt', 'Vitamin', 'Pire Kene', 'Şampuan', 'Tarak'] },
      { name: 'Oyuncaklar', children: ['Olta', 'Lazer', 'Top', 'Tünel', 'Zeka'] },
      { name: 'Yatak ve Ev', children: ['Kedi Yatağı', 'Kedi Evi', 'Tırmalama Ağacı', 'Tırmalama Tahtası'] },
      { name: 'Mama Su Kabı', children: ['Mama Kabı', 'Su Kabı', 'Su Pınarı', 'Otomatik Mamalık'] },
      { name: 'Taşıma', children: ['Taşıma Çantası', 'Taşıma Kafesi', 'Kedi Arabası'] },
      { name: 'Tasma ve Aksesuar', children: ['Boyun Tasma', 'Göğüs Tasma', 'Balkon Filesi'] }
    ],
    subcategories: [
      { title: 'Mama', items: ['Kuru Mama', 'Yaş Mama', 'Yavru Mama', 'Kısır Mama', 'Diyet Mama', 'Tahılsız Mama'] },
      { title: 'Kum & Tuvalet', items: ['Bentonit Kum', 'Silika Kum', 'Organik Kum', 'Kum Kabı', 'Kum Küreği'] },
      { title: 'Aksesuar', items: ['Tırmalama Tahtası', 'Kedi Yatağı', 'Mama Kabı', 'Su Çeşmesi', 'Taşıma Çantası'] },
      { title: 'Oyuncak', items: ['Oltalar', 'Peluş Oyuncak', 'Lazer', 'Kedi Otu', 'Tünel'] },
      { title: 'Sağlık', items: ['Vitamin', 'Pire & Kene', 'Tüy Yumağı', 'Malt Pasta', 'Tırnak Bakım'] }
    ]
  },
  {
    id: 'bird',
    name: 'Kuş',
    nameTr: 'Kuş',
    emoji: '🐦',
    image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&h=600&fit=crop',
    color: '#4CAF50',
    count: 450,
    children: [
      { name: 'Kuş Yemi', children: ['Muhabbet', 'Papağan', 'Kanarya', 'Yavru Kuş'] },
      { name: 'Kafes ve Ekipman', children: ['Kuş Kafesi', 'Tünek', 'Yemlik Suluk', 'Banyo'] },
      { name: 'Sağlık', children: ['Vitamin', 'Gaga Taşı', 'Kalamar'] },
      { name: 'Aksesuar', children: ['Oyuncak', 'Salıncak', 'Ayna'] }
    ],
    subcategories: [
      { title: 'Yem', items: ['Muhabbet Yemi', 'Kanarya Yemi', 'Papağan Yemi', 'Vitamin Takviyesi', 'Kraker'] },
      { title: 'Kafes', items: ['Muhabbet Kafesi', 'Papağan Kafesi', 'Kanarya Kafesi', 'Kafes Aksesuarı'] },
      { title: 'Aksesuar', items: ['Tünek', 'Yemlik', 'Suluk', 'Banyo Kabı', 'Salıncak'] }
    ]
  },
  {
    id: 'fish',
    name: 'Balık',
    nameTr: 'Balık',
    emoji: '🐟',
    image: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=600&h=600&fit=crop',
    color: '#00BCD4',
    count: 890,
    children: [
      { name: 'Balık Yemi' },
      { name: 'Akvaryum' },
      { name: 'Akvaryum Ekipmanı', children: ['Filtre', 'Hava Motoru', 'Isıtıcı', 'Aydınlatma'] },
      { name: 'Su Düzenleyici' },
      { name: 'Dekorasyon' }
    ],
    subcategories: [
      { title: 'Yem', items: ['Pul Yem', 'Granül Yem', 'Tablet Yem', 'Canlı Yem', 'Vitamin'] },
      { title: 'Akvaryum', items: ['Akvaryum Seti', 'Filtre', 'Hava Motoru', 'Isıtıcı', 'Aydınlatma'] },
      { title: 'Dekorasyon', items: ['Bitki', 'Kum & Çakıl', 'Dekor Obje', 'Arka Plan'] }
    ]
  },
  {
    id: 'small-pet',
    name: 'Kemirgen',
    nameTr: 'Kemirgen',
    emoji: '🐹',
    image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&h=600&fit=crop',
    color: '#FF9800',
    count: 320,
    children: [
      { name: 'Kemirgen Yemi', children: ['Tavşan', 'Hamster', 'Guinea Pig', 'Kuru Ot'] },
      { name: 'Kafes' },
      { name: 'Talaş / Altlık' },
      { name: 'Suluk / Yemlik' },
      { name: 'Oyuncak' }
    ],
    subcategories: [
      { title: 'Yem', items: ['Tavşan Yemi', 'Hamster Yemi', 'Guinea Pig Yemi', 'Ödül', 'Vitamin'] },
      { title: 'Kafes', items: ['Hamster Kafesi', 'Tavşan Kafesi', 'Kafes Aksesuarı'] },
      { title: 'Aksesuar', items: ['Talaş', 'Yuva', 'Çark', 'Tünel', 'Yemlik & Suluk'] }
    ]
  },
  {
    id: 'reptile',
    name: 'Sürüngen',
    nameTr: 'Sürüngen',
    emoji: '🦎',
    image: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?w=600&h=600&fit=crop',
    color: '#795548',
    count: 180,
    children: [
      { name: 'Sürüngen Yemi' },
      { name: 'Teraryum' },
      { name: 'Isıtma / Aydınlatma' },
      { name: 'Taban Malzemesi' }
    ],
    subcategories: [
      { title: 'Yem', items: ['Kaplumbağa Yemi', 'Sürüngen Yemi', 'Canlı Yem', 'Vitamin'] },
      { title: 'Teraryum', items: ['Teraryum Seti', 'Isıtıcı', 'UV Lamba', 'Zemin Malzemesi'] },
      { title: 'Aksesuar', items: ['Dekor', 'Saklanma Alanı', 'Su Kabı', 'Yemlik'] }
    ]
  }
]

// Blog/İçerik Kartları
const BLOG_POSTS = [
  { id: 1, title: 'Köpeğiniz İçin En İyi Mama Seçimi', category: 'Beslenme', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=250&fit=crop', readTime: '5 dk', views: 1250 },
  { id: 2, title: 'Kedi Kumu Nasıl Seçilir?', category: 'Bakım', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=250&fit=crop', readTime: '4 dk', views: 980 },
  { id: 3, title: 'Yavru Köpek Eğitimi Rehberi', category: 'Eğitim', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=250&fit=crop', readTime: '8 dk', views: 2100 },
  { id: 4, title: 'Akvaryum Kurulum Rehberi', category: 'Rehber', image: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=400&h=250&fit=crop', readTime: '6 dk', views: 750 }
]

// Sadakat Programı Avantajları
const LOYALTY_BENEFITS = [
  { icon: Gift, title: 'Hoşgeldin Hediyesi', desc: 'İlk siparişte %15 indirim', color: 'orange' },
  { icon: Award, title: 'Puan Kazan', desc: 'Her 1₺ = 1 puan', color: 'blue' },
  { icon: Crown, title: 'VIP Statüsü', desc: 'Özel kampanyalar', color: 'purple' },
  { icon: Truck, title: 'Ücretsiz Kargo', desc: 'VIP üyelere her zaman', color: 'green' }
]

// Markalar
const BRANDS = [
  { id: 'royal-canin', name: 'Royal Canin', color: '#D32F2F', logo: 'RC' },
  { id: 'hills', name: "Hill's", color: '#1976D2', logo: 'H' },
  { id: 'purina', name: 'Pro Plan', color: '#C62828', logo: 'PP' },
  { id: 'acana', name: 'Acana', color: '#1565C0', logo: 'A' },
  { id: 'orijen', name: 'Orijen', color: '#8D6E63', logo: 'O' },
  { id: 'brit', name: 'Brit', color: '#388E3C', logo: 'B' },
  { id: 'reflex', name: 'Reflex', color: '#E64A19', logo: 'R' },
  { id: 'felix', name: 'Felix', color: '#7B1FA2', logo: 'F' },
  { id: 'whiskas', name: 'Whiskas', color: '#6A1B9A', logo: 'W' },
  { id: 'pedigree', name: 'Pedigree', color: '#FFC107', logo: 'P' },
]

// Hero Slides
const HERO_SLIDES = [
  {
    id: 1,
    title: 'Evcil Dostunuz İçin',
    subtitle: 'En İyi Ürünler',
    description: 'Binlerce ürün, güvenilir markalar, hızlı teslimat!',
    cta: 'Alışverişe Başla',
    ctaLink: '/products',
    image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&h=500&fit=crop',
    bgColor: 'from-[#1C49C2] to-[#2563EB]'
  },
  {
    id: 2,
    title: 'İlk Siparişinize',
    subtitle: '%15 İndirim',
    description: 'Hemen üye olun, ilk siparişinizde %15 indirim kazanın!',
    cta: 'Üye Ol',
    ctaLink: '/products',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=500&fit=crop',
    bgColor: 'from-[#9C27B0] to-[#E91E63]'
  },
  {
    id: 3,
    title: 'Otomatik Sipariş ile',
    subtitle: '%10 Tasarruf',
    description: 'Düzenli siparişlerinizi otomatikleştirin, her seferinde %10 kazanın!',
    cta: 'Detaylı Bilgi',
    ctaLink: '/products',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&h=500&fit=crop',
    bgColor: 'from-[#00897B] to-[#26A69A]'
  }
]

// Flash Deals
const FLASH_DEALS = [
  {
    id: 1,
    name: 'Royal Canin Maxi Adult 15kg',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300&h=300&fit=crop',
    originalPrice: 2499,
    salePrice: 1999,
    discount: 20,
    stock: 15,
    soldCount: 85
  },
  {
    id: 2,
    name: "Hill's Science Diet Kedi Mama 7kg",
    image: 'https://images.unsplash.com/photo-1615789591457-74a63395c990?w=300&h=300&fit=crop',
    originalPrice: 1899,
    salePrice: 1519,
    discount: 20,
    stock: 8,
    soldCount: 92
  },
  {
    id: 3,
    name: 'Premium Kedi Kumu 20L',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300&h=300&fit=crop',
    originalPrice: 349,
    salePrice: 249,
    discount: 29,
    stock: 25,
    soldCount: 75
  },
  {
    id: 4,
    name: 'Köpek Tasma Seti Premium',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=300&fit=crop',
    originalPrice: 599,
    salePrice: 399,
    discount: 33,
    stock: 12,
    soldCount: 88
  }
]

// Trending Products
const TRENDING_PRODUCTS = [
  { id: 1, name: 'Acana Wild Prairie Köpek', price: 1299, rating: 4.9, reviews: 245, image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=300&h=300&fit=crop', badge: 'Bestseller' },
  { id: 2, name: 'Orijen Six Fish Kedi', price: 1599, rating: 4.8, reviews: 189, image: 'https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=300&h=300&fit=crop', badge: 'En Çok Satan' },
  { id: 3, name: 'Catit Flower Fountain', price: 449, rating: 4.7, reviews: 312, image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=300&h=300&fit=crop', badge: 'Popüler' },
  { id: 4, name: 'Kong Classic Köpek Oyuncak', price: 189, rating: 4.9, reviews: 567, image: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=300&h=300&fit=crop', badge: 'Favori' },
  { id: 5, name: 'Ferplast Kedi Tırmalama', price: 899, rating: 4.6, reviews: 156, image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=300&h=300&fit=crop', badge: 'Yeni' },
  { id: 6, name: 'Tetra AquaSafe 500ml', price: 129, rating: 4.8, reviews: 423, image: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=300&h=300&fit=crop', badge: 'İndirimli' },
]

// Reviews
const REVIEWS = [
  { id: 1, name: 'Ayşe K.', avatar: 'A', rating: 5, text: 'Siparişim çok hızlı geldi, ürünler orijinal. Kesinlikle tavsiye ederim!', date: '2 gün önce' },
  { id: 2, name: 'Mehmet Y.', avatar: 'M', rating: 5, text: 'Kedim Royal Canin mamasını çok seviyor. Fiyatlar da uygun.', date: '1 hafta önce' },
  { id: 3, name: 'Zeynep S.', avatar: 'Z', rating: 5, text: 'Otomatik sipariş özelliği harika! Artık mama bitmeden yenisi geliyor.', date: '2 hafta önce' },
]

// Hizmetler
const SERVICES = [
  { icon: Truck, title: 'Ücretsiz Kargo', desc: '450₺ üzeri siparişlerde', color: 'blue' },
  { icon: RefreshCw, title: 'Otomatik Sipariş', desc: '%10 ekstra indirim', color: 'green' },
  { icon: Shield, title: 'Güvenli Alışveriş', desc: '256-bit SSL şifreleme', color: 'purple' },
  { icon: Headphones, title: '7/24 Destek', desc: 'Her zaman yanınızda', color: 'orange' }
]

// Quick Categories
const QUICK_CATEGORIES = [
  { name: 'Kuru Mama', icon: '🥣', count: 1250, pet: 'Tümü' },
  { name: 'Yaş Mama', icon: '🥫', count: 890, pet: 'Tümü' },
  { name: 'Kedi Kumu', icon: '🪣', count: 320, pet: 'Kedi' },
  { name: 'Oyuncak', icon: '🎾', count: 560, pet: 'Tümü' },
  { name: 'Tasma & Kayış', icon: '🦮', count: 280, pet: 'Köpek' },
  { name: 'Vitamin', icon: '💊', count: 190, pet: 'Tümü' },
  { name: 'Yatak', icon: '🛏️', count: 145, pet: 'Tümü' },
  { name: 'Tırmalama', icon: '🐾', count: 95, pet: 'Kedi' },
]

// ============================================
// COMPONENTS
// ============================================

// Countdown Timer
function CountdownTimer({ endTime }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 32, seconds: 45 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) { seconds = 59; minutes-- }
        if (minutes < 0) { minutes = 59; hours-- }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59 }
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center gap-1">
      <div className="bg-[#E53935] text-white px-2 py-1 rounded font-bold text-lg min-w-[40px] text-center">
        {String(timeLeft.hours).padStart(2, '0')}
      </div>
      <span className="text-[#E53935] font-bold">:</span>
      <div className="bg-[#E53935] text-white px-2 py-1 rounded font-bold text-lg min-w-[40px] text-center">
        {String(timeLeft.minutes).padStart(2, '0')}
      </div>
      <span className="text-[#E53935] font-bold">:</span>
      <div className="bg-[#E53935] text-white px-2 py-1 rounded font-bold text-lg min-w-[40px] text-center">
        {String(timeLeft.seconds).padStart(2, '0')}
      </div>
    </div>
  )
}

// Header
function Header({ onMenuClick }) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [hoveredPet, setHoveredPet] = useState(null)
  const menuTimeoutRef = useRef(null)

  const handleMouseEnterCategory = (pet) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current)
    setHoveredPet(pet)
  }

  const handleMouseLeaveCategory = () => {
    menuTimeoutRef.current = setTimeout(() => setHoveredPet(null), 150)
  }

  const handleMouseEnterMenu = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current)
  }

  const handleMouseLeaveMenu = () => {
    menuTimeoutRef.current = setTimeout(() => setHoveredPet(null), 150)
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Banner */}
      <div className="bg-[#1C49C2] text-white">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm">
          <Truck className="w-4 h-4" />
          <span><strong>Ücretsiz Kargo</strong> 450₺ ve üzeri siparişlerde!</span>
          <span className="hidden sm:inline mx-2">|</span>
          <span className="hidden sm:inline"><strong>Otomatik Sipariş</strong> ile %10 indirim</span>
          <span className="hidden md:inline mx-2">|</span>
          <span className="hidden md:inline text-yellow-300"><strong>YENİ ÜYE?</strong> İlk siparişe %15 indirim!</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu */}
            <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            {/* Logo */}
            <button onClick={() => navigate('/shop')} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#1C49C2] rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🐾</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-2xl font-black text-[#1C49C2]">petzz</span>
                <span className="text-2xl font-black text-[#F5A623]">shop</span>
              </div>
            </button>

            {/* Search - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Ürün, marka veya kategori ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/products?search=${searchTerm}`)}
                  className="w-full px-4 py-3 pl-12 border-2 border-[#1C49C2] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#1C49C2]/30"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1C49C2]" />
                <button
                  onClick={() => navigate(`/products?search=${searchTerm}`)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#F5A623] text-white rounded-full text-sm font-semibold hover:bg-[#E09612] transition-colors"
                >
                  Ara
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button onClick={() => setShowSearch(!showSearch)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
                <Search className="w-6 h-6 text-gray-700" />
              </button>
              <button className="hidden sm:flex flex-col items-center p-2 hover:bg-gray-100 rounded-lg">
                <User className="w-6 h-6 text-gray-700" />
                <span className="text-xs text-gray-600 mt-0.5">Hesabım</span>
              </button>
              <button className="hidden sm:flex flex-col items-center p-2 hover:bg-gray-100 rounded-lg relative">
                <Heart className="w-6 h-6 text-gray-700" />
                <span className="text-xs text-gray-600 mt-0.5">Favoriler</span>
                <span className="absolute top-0 right-0 w-4 h-4 bg-[#E53935] text-white text-[10px] rounded-full flex items-center justify-center">3</span>
              </button>
              <button onClick={() => navigate('/products')} className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-lg relative">
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                <span className="text-xs text-gray-600 mt-0.5 hidden sm:block">Sepet</span>
                <span className="absolute top-0 right-0 w-5 h-5 bg-[#F5A623] text-white text-xs rounded-full flex items-center justify-center font-bold">2</span>
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {showSearch && (
            <div className="md:hidden mt-3 pb-2">
              <div className="relative">
                <input type="text" placeholder="Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 pl-10 border-2 border-[#1C49C2] rounded-full text-sm" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Nav - Desktop */}
      <nav className="hidden lg:block bg-gray-50 border-b relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center">
            {PETS.map((pet) => (
              <div key={pet.id} className="relative" onMouseEnter={() => handleMouseEnterCategory(pet)} onMouseLeave={handleMouseLeaveCategory}>
                <button
                  onClick={() => navigate(`/products?category=${pet.nameTr}`)}
                  className={clsx(
                    "flex items-center gap-2 px-5 py-3 font-medium text-sm transition-colors",
                    hoveredPet?.id === pet.id ? "text-[#1C49C2] bg-white" : "text-gray-700 hover:text-[#1C49C2] hover:bg-white"
                  )}
                >
                  {pet.nameTr}
                  <ChevronDown className={clsx("w-4 h-4 transition-transform", hoveredPet?.id === pet.id && "rotate-180")} />
                </button>
              </div>
            ))}
            <button onClick={() => navigate('/products?priceStatus=cheaper')} className="flex items-center gap-2 px-5 py-3 text-[#E53935] font-semibold text-sm">
              <Tag className="w-4 h-4" />
              Fırsatlar
            </button>
            <button onClick={() => navigate('/products')} className="flex items-center gap-2 px-5 py-3 text-[#1C49C2] font-semibold text-sm ml-auto">
              <Sparkles className="w-4 h-4" />
              Yeni Ürünler
            </button>
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        {hoveredPet && (
          <div className="absolute left-0 right-0 top-full bg-white shadow-xl border-t z-50" onMouseEnter={handleMouseEnterMenu} onMouseLeave={handleMouseLeaveMenu}>
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex gap-8">
                <div className="w-56 flex-shrink-0">
                  <div className="relative">
                    <img src={hoveredPet.image} alt={hoveredPet.nameTr} className="w-full h-40 object-cover rounded-xl" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 rounded-b-xl text-white" style={{ backgroundColor: hoveredPet.color }}>
                      <h3 className="font-bold text-lg">{hoveredPet.nameTr}</h3>
                      <p className="text-sm opacity-90">{hoveredPet.count}+ ürün</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { navigate(`/products?category=${hoveredPet.nameTr}`); setHoveredPet(null) }}
                    className="mt-4 w-full py-2 bg-[#1C49C2] text-white rounded-lg font-semibold hover:bg-[#1539A2] transition-colors flex items-center justify-center gap-2"
                  >
                    Tümünü Gör <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 grid grid-cols-3 xl:grid-cols-5 gap-6">
                  {hoveredPet.subcategories?.map((subcat, idx) => (
                    <div key={idx}>
                      <h4 className="font-bold text-gray-900 mb-3 pb-2 border-b-2" style={{ borderColor: hoveredPet.color }}>{subcat.title}</h4>
                      <ul className="space-y-2">
                        {subcat.items.map((item, itemIdx) => (
                          <li key={itemIdx}>
                            <button
                              onClick={() => { navigate(`/products?category=${hoveredPet.nameTr}&subcategory=${encodeURIComponent(item)}`); setHoveredPet(null) }}
                              className="text-sm text-gray-600 hover:text-[#1C49C2] transition-colors flex items-center gap-1 group"
                            >
                              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              {item}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-700">Popüler Markalar:</span>
                  <div className="flex gap-2 flex-wrap">
                    {BRANDS.slice(0, 6).map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => { navigate(`/products?category=${hoveredPet.nameTr}&brand=${encodeURIComponent(brand.name)}`); setHoveredPet(null) }}
                        className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full hover:bg-[#1C49C2] hover:text-white transition-colors"
                      >
                        {brand.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

// Hero Carousel
function HeroCarousel() {
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const slide = HERO_SLIDES[currentSlide]

  return (
    <section className={`bg-gradient-to-r ${slide.bgColor} text-white relative overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-2">{slide.title}</h1>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-yellow-300 mb-4">{slide.subtitle}</h2>
            <p className="text-lg text-white/90 mb-8">{slide.description}</p>
            <button
              onClick={() => navigate(slide.ctaLink)}
              className="px-8 py-4 bg-[#F5A623] text-white font-bold rounded-full hover:bg-[#E09612] transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {slide.cta}
            </button>
          </div>
          <div className="hidden md:block relative">
            <img src={slide.image} alt="" className="w-[400px] h-[300px] object-cover rounded-2xl shadow-2xl" />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-black text-xl">
              %15<br/>OFF
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center md:justify-start gap-2 mt-8">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={clsx(
                "w-3 h-3 rounded-full transition-all",
                idx === currentSlide ? "bg-white w-8" : "bg-white/50 hover:bg-white/70"
              )}
            />
          ))}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
    </section>
  )
}

// Quick Categories
function QuickCategories() {
  const navigate = useNavigate()

  return (
    <section className="py-6 bg-white border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {QUICK_CATEGORIES.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => navigate(`/products?search=${encodeURIComponent(cat.name)}`)}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-[#1C49C2] hover:text-white rounded-full transition-all group"
            >
              <span className="text-xl">{cat.icon}</span>
              <span className="font-medium text-sm whitespace-nowrap">{cat.name}</span>
              <span className="text-xs text-gray-500 group-hover:text-white/70">({cat.count})</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

// Pet Category Card (Chewy Style - Circular)
function PetCard({ pet, onClick }) {
  return (
    <button onClick={onClick} className="group flex flex-col items-center">
      <div className="relative mb-3">
        <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
          <img src={pet.image} alt={pet.nameTr} className="w-full h-full object-cover" />
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-white text-xs font-bold shadow-md" style={{ backgroundColor: pet.color }}>
          {pet.count}+ ürün
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1C49C2] transition-colors">{pet.nameTr}</h3>
    </button>
  )
}

// Flash Deal Card
function FlashDealCard({ deal }) {
  const navigate = useNavigate()
  const stockPercent = (deal.soldCount / (deal.stock + deal.soldCount)) * 100

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden group">
      <div className="relative">
        <img src={deal.image} alt={deal.name} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform" />
        <div className="absolute top-3 left-3 px-3 py-1 bg-[#E53935] text-white text-sm font-bold rounded-full">
          -%{deal.discount}
        </div>
        <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
          <Heart className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{deal.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl font-bold text-[#1C49C2]">{deal.salePrice}₺</span>
          <span className="text-sm text-gray-400 line-through">{deal.originalPrice}₺</span>
        </div>
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Satıldı: {deal.soldCount}</span>
            <span>Kalan: {deal.stock}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#E53935] rounded-full transition-all" style={{ width: `${stockPercent}%` }} />
          </div>
        </div>
        <button
          onClick={() => navigate('/products')}
          className="w-full py-2 bg-[#F5A623] text-white font-semibold rounded-lg hover:bg-[#E09612] transition-colors"
        >
          Sepete Ekle
        </button>
      </div>
    </div>
  )
}

// Trending Product Card
function TrendingProductCard({ product }) {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-xl p-4 hover:shadow-lg transition-all group cursor-pointer" onClick={() => navigate('/products')}>
      <div className="relative mb-3">
        <img src={product.image} alt={product.name} className="w-full aspect-square object-cover rounded-lg group-hover:scale-105 transition-transform" />
        {product.badge && (
          <span className="absolute top-2 left-2 px-2 py-1 bg-[#1C49C2] text-white text-xs font-semibold rounded-full">{product.badge}</span>
        )}
      </div>
      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-[#1C49C2] transition-colors">{product.name}</h3>
      <div className="flex items-center gap-1 mb-2">
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        <span className="text-sm font-semibold">{product.rating}</span>
        <span className="text-xs text-gray-500">({product.reviews})</span>
      </div>
      <p className="text-lg font-bold text-[#1C49C2]">{product.price}₺</p>
    </div>
  )
}

// Brand Logo
function BrandLogo({ brand, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-[#1C49C2] hover:shadow-md transition-all group">
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2 group-hover:scale-110 transition-transform" style={{ backgroundColor: brand.color }}>
        {brand.logo || brand.name.charAt(0)}
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-[#1C49C2]">{brand.name}</span>
    </button>
  )
}

// Service Badge
function ServiceBadge({ service }) {
  const Icon = service.icon
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200'
  }

  return (
    <div className={clsx("flex items-center gap-3 p-4 rounded-xl border", colorClasses[service.color])}>
      <Icon className="w-8 h-8" />
      <div>
        <h4 className="font-bold text-gray-900">{service.title}</h4>
        <p className="text-sm text-gray-600">{service.desc}</p>
      </div>
    </div>
  )
}

// Review Card
function ReviewCard({ review }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-[#1C49C2] rounded-full flex items-center justify-center text-white font-bold text-lg">
          {review.avatar}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{review.name}</h4>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={clsx("w-4 h-4", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
            ))}
          </div>
        </div>
        <span className="ml-auto text-sm text-gray-500">{review.date}</span>
      </div>
      <p className="text-gray-600">{review.text}</p>
    </div>
  )
}

// Brand Slider
function BrandSlider() {
  const navigate = useNavigate()
  const scrollRef = useRef(null)

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' })
    }
  }

  return (
    <div className="bg-white border-b py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-gray-500 whitespace-nowrap hidden sm:block">Popüler Markalar:</span>
          <button onClick={() => scroll('left')} className="p-1 hover:bg-gray-100 rounded-full flex-shrink-0">
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div ref={scrollRef} className="flex items-center gap-3 overflow-x-auto scrollbar-hide scroll-smooth flex-1" style={{ scrollbarWidth: 'none' }}>
            {BRANDS.map((brand) => (
              <button
                key={brand.id}
                onClick={() => navigate(`/products?brand=${encodeURIComponent(brand.name)}`)}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-[#1C49C2] hover:text-white border border-gray-100 rounded-full transition-all group"
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: brand.color }}>{brand.logo}</div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-white whitespace-nowrap">{brand.name}</span>
              </button>
            ))}
          </div>
          <button onClick={() => scroll('right')} className="p-1 hover:bg-gray-100 rounded-full flex-shrink-0">
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Blog Card
function BlogCard({ post }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer">
      <div className="relative">
        <img src={post.image} alt={post.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
        <span className="absolute top-3 left-3 px-3 py-1 bg-[#1C49C2] text-white text-xs font-semibold rounded-full">{post.category}</span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#1C49C2] transition-colors line-clamp-2">{post.title}</h3>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

// Loyalty Section
function LoyaltySection() {
  const navigate = useNavigate()

  return (
    <section className="py-12 bg-gradient-to-r from-[#1C49C2] to-[#3B82F6]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-white text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
              <Crown className="w-10 h-10 text-[#F5A623]" />
              <h2 className="text-3xl font-black">Petzz Club</h2>
            </div>
            <p className="text-blue-100 text-lg">Özel fırsatlar, puanlar ve daha fazlası!</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {LOYALTY_BENEFITS.map((benefit, idx) => {
              const Icon = benefit.icon
              return (
                <div key={idx} className="bg-white/10 backdrop-blur rounded-xl p-4 text-center text-white">
                  <Icon className="w-8 h-8 mx-auto mb-2 text-[#F5A623]" />
                  <h4 className="font-bold text-sm">{benefit.title}</h4>
                  <p className="text-xs text-blue-100">{benefit.desc}</p>
                </div>
              )
            })}
          </div>
          <button onClick={() => navigate('/products')} className="px-8 py-4 bg-[#F5A623] text-white font-bold rounded-full hover:bg-[#E09612] transition-all shadow-lg whitespace-nowrap">
            Hemen Katıl
          </button>
        </div>
      </div>
    </section>
  )
}

// Bottom Navigation (Mobile)
function BottomNav() {
  const navigate = useNavigate()
  const items = [
    { icon: Package, label: 'Ana Sayfa', path: '/shop', active: true },
    { icon: Search, label: 'Ara', path: '/products' },
    { icon: Heart, label: 'Favoriler', path: '/products' },
    { icon: ShoppingCart, label: 'Sepet', path: '/products', badge: 2 },
    { icon: User, label: 'Hesap', path: '/products' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg lg:hidden z-40">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => (
          <button key={item.label} onClick={() => navigate(item.path)} className="relative flex flex-col items-center gap-0.5 px-3 py-1">
            <item.icon className={clsx("w-5 h-5", item.active ? "text-[#1C49C2]" : "text-gray-500")} />
            <span className={clsx("text-[10px]", item.active ? "text-[#1C49C2] font-semibold" : "text-gray-500")}>{item.label}</span>
            {item.badge && (
              <span className="absolute -top-1 right-1 w-4 h-4 bg-[#F5A623] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}

// Newsletter
function Newsletter() {
  const [email, setEmail] = useState('')

  return (
    <section className="py-12 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Fırsatlardan Haberdar Olun!</h2>
            <p className="text-gray-400">E-bültenimize abone olun, %10 indirim kazanın!</p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <input
              type="email"
              placeholder="E-posta adresiniz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 md:w-80 px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F5A623] focus:border-transparent"
            />
            <button className="px-6 py-3 bg-[#F5A623] text-white font-semibold rounded-lg hover:bg-[#E09612] transition-colors whitespace-nowrap">
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white overflow-y-auto">
        <div className="sticky top-0 bg-[#1C49C2] text-white p-4 flex items-center justify-between">
          <span className="font-bold text-lg">Menü</span>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-4">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Evcil Hayvanlar</h3>
          {PETS.map((pet) => (
            <button
              key={pet.id}
              onClick={() => { navigate(`/products?category=${pet.nameTr}`); onClose() }}
              className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <img src={pet.image} alt={pet.nameTr} className="w-10 h-10 rounded-full object-cover" />
              <span className="font-medium text-gray-900">{pet.nameTr}</span>
              <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
            </button>
          ))}
        </div>

        <div className="p-4 border-t">
          <button onClick={() => { navigate('/products?priceStatus=cheaper'); onClose() }} className="w-full flex items-center gap-3 px-3 py-3 text-[#E53935] font-semibold">
            <Percent className="w-5 h-5" />
            Fırsatlar
          </button>
          <button onClick={() => { navigate('/products'); onClose() }} className="w-full flex items-center gap-3 px-3 py-3 text-[#1C49C2] font-semibold">
            <Sparkles className="w-5 h-5" />
            Yeni Ürünler
          </button>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Popüler Markalar</h3>
          <div className="flex flex-wrap gap-2">
            {BRANDS.slice(0, 6).map((brand) => (
              <button
                key={brand.id}
                onClick={() => { navigate(`/products?brand=${encodeURIComponent(brand.name)}`); onClose() }}
                className="px-3 py-1.5 bg-white border rounded-full text-sm text-gray-700 hover:border-[#1C49C2] hover:text-[#1C49C2]"
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Footer
function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo & Social */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#1C49C2] rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🐾</span>
              </div>
              <div>
                <span className="text-xl font-black text-white">petzz</span>
                <span className="text-xl font-black text-[#F5A623]">shop</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">Evcil dostlarınız için en iyi ürünler, en uygun fiyatlar.</p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#1C49C2] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#1C49C2] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#1C49C2] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#1C49C2] transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold mb-4">Kategoriler</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {PETS.map((pet) => (
                <li key={pet.id}>
                  <button onClick={() => navigate(`/products?category=${pet.nameTr}`)} className="hover:text-white transition-colors">{pet.nameTr}</button>
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
              <li><button className="hover:text-white transition-colors">Sıkça Sorulan Sorular</button></li>
              <li><button className="hover:text-white transition-colors">İletişim</button></li>
              <li><button className="hover:text-white transition-colors">Canlı Destek</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">İletişim</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F5A623]" />
                0850 123 45 67
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F5A623]" />
                info@petzzshop.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F5A623]" />
                İstanbul, Türkiye
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F5A623]" />
                7/24 Destek
              </li>
            </ul>
          </div>
        </div>

        {/* Payment & Security */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Güvenli Ödeme:</span>
              <div className="flex gap-2">
                <div className="w-12 h-8 bg-white rounded flex items-center justify-center text-xs font-bold text-gray-700">VISA</div>
                <div className="w-12 h-8 bg-white rounded flex items-center justify-center text-xs font-bold text-gray-700">MC</div>
                <div className="w-12 h-8 bg-white rounded flex items-center justify-center text-xs font-bold text-gray-700">TROY</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-500">256-bit SSL ile korunmaktadır</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2024 Petzzshop. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function Shop() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
      <Header onMenuClick={() => setMobileMenuOpen(true)} />
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main>
        {/* Hero Carousel */}
        <HeroCarousel />

        {/* Brand Slider */}
        <BrandSlider />

        {/* Quick Categories */}
        <QuickCategories />

        {/* Services */}
        <section className="py-6 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SERVICES.map((service, i) => (
                <ServiceBadge key={i} service={service} />
              ))}
            </div>
          </div>
        </section>

        {/* Shop by Pet */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-gray-900 mb-2">Evcil Hayvanına Göre Alışveriş</h2>
              <p className="text-gray-600">Dostunuz için en uygun ürünleri keşfedin</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-8">
              {PETS.map((pet) => (
                <PetCard key={pet.id} pet={pet} onClick={() => navigate(`/products?category=${pet.nameTr}`)} />
              ))}
            </div>
          </div>
        </section>

        {/* Flash Deals */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-8 h-8 text-[#E53935]" />
                  <h2 className="text-3xl font-black text-gray-900">Flaş Fırsatlar</h2>
                </div>
                <p className="text-gray-600">Kaçırmayın, sınırlı stok!</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Bitimine kalan:</span>
                <CountdownTimer />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {FLASH_DEALS.map((deal) => (
                <FlashDealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </div>
        </section>

        {/* Loyalty Program */}
        <LoyaltySection />

        {/* Trending Products */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-8 h-8 text-[#1C49C2]" />
                  <h2 className="text-3xl font-black text-gray-900">Trend Ürünler</h2>
                </div>
                <p className="text-gray-600">En çok satan ve beğenilen ürünler</p>
              </div>
              <button onClick={() => navigate('/products')} className="hidden sm:flex items-center gap-2 px-6 py-2 border-2 border-[#1C49C2] text-[#1C49C2] font-semibold rounded-full hover:bg-[#1C49C2] hover:text-white transition-colors">
                Tümünü Gör <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {TRENDING_PRODUCTS.map((product) => (
                <TrendingProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* Pet Tips / Blog Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Play className="w-8 h-8 text-[#1C49C2]" />
                  <h2 className="text-3xl font-black text-gray-900">Pet İpuçları</h2>
                </div>
                <p className="text-gray-600">Evcil hayvanınız için faydalı bilgiler</p>
              </div>
              <button className="hidden sm:flex items-center gap-2 px-6 py-2 border-2 border-[#1C49C2] text-[#1C49C2] font-semibold rounded-full hover:bg-[#1C49C2] hover:text-white transition-colors">
                Tüm Yazılar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {BLOG_POSTS.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>

        {/* Top Brands */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-gray-900 mb-2">Popüler Markalar</h2>
              <p className="text-gray-600">En sevilen markalar bir arada</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-4">
              {BRANDS.map((brand) => (
                <BrandLogo key={brand.id} brand={brand} onClick={() => navigate(`/products?brand=${encodeURIComponent(brand.name)}`)} />
              ))}
            </div>
          </div>
        </section>

        {/* Customer Reviews */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <ThumbsUp className="w-8 h-8 text-[#1C49C2]" />
                <h2 className="text-3xl font-black text-gray-900">Müşteri Yorumları</h2>
              </div>
              <p className="text-gray-600">Binlerce mutlu müşteri</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {REVIEWS.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <Newsletter />

        {/* CTA Banner */}
        <section className="py-12 bg-gradient-to-r from-[#F5A623] to-[#FF8C00]">
          <div className="max-w-7xl mx-auto px-4 text-center text-white">
            <Gift className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-black mb-2">İlk Siparişinize Özel</h2>
            <p className="text-xl mb-6">%15 İndirim + Ücretsiz Kargo!</p>
            <button onClick={() => navigate('/products')} className="px-10 py-4 bg-white text-[#F5A623] font-bold text-lg rounded-full hover:bg-gray-100 transition-colors shadow-lg">
              Hemen Alışverişe Başla
            </button>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-black text-[#1C49C2] mb-2">10K+</div>
                <p className="text-gray-600">Ürün Çeşidi</p>
              </div>
              <div>
                <div className="text-4xl font-black text-[#1C49C2] mb-2">50K+</div>
                <p className="text-gray-600">Mutlu Müşteri</p>
              </div>
              <div>
                <div className="text-4xl font-black text-[#1C49C2] mb-2">100+</div>
                <p className="text-gray-600">Marka</p>
              </div>
              <div>
                <div className="text-4xl font-black text-[#1C49C2] mb-2">4.9</div>
                <p className="text-gray-600">Müşteri Puanı</p>
              </div>
            </div>
          </div>
        </section>

        {/* App Download Banner */}
        <section className="py-12 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-white text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-black mb-2">Mobil Uygulamamızı İndirin!</h2>
                <p className="text-gray-400 mb-4">Özel fırsatlar ve hızlı alışveriş deneyimi</p>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors">
                    <span className="text-2xl">🍎</span>
                    <div className="text-left">
                      <p className="text-[10px] text-gray-500">Download on the</p>
                      <p className="font-bold text-sm">App Store</p>
                    </div>
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors">
                    <span className="text-2xl">▶️</span>
                    <div className="text-left">
                      <p className="text-[10px] text-gray-500">GET IT ON</p>
                      <p className="font-bold text-sm">Google Play</p>
                    </div>
                  </button>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center">
                  <span className="text-6xl">📱</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
