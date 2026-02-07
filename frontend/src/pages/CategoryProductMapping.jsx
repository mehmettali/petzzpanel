import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  FolderTree, ChevronRight, ChevronDown, Search, Package, Check, X,
  AlertTriangle, CheckCircle2, XCircle, ArrowRight, Filter, RefreshCw,
  Layers, Tag, Hash, Link2, Box, ShoppingCart, TrendingUp, Eye,
  Cat, Dog, Bird, Fish, Bug, Squirrel, ChevronLeft, Sparkles,
  PackageCheck, PackageX, AlertCircle, ListTree, Grip, MoreVertical
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/Spinner'
import { formatCurrency, formatNumber, truncate } from '../utils/formatters'
import clsx from 'clsx'
import {
  getProducts,
  getCategories,
  mapProductCategory,
  bulkMapProductCategories
} from '../services/api'

// ============================================
// ÖNERİ KATEGORİ YAPISI (CategoryBuilder'dan)
// ============================================
const ONERI_CATEGORIES = [
  {
    id: 'kedi',
    name: 'Kedi',
    googleId: '4',
    icon: 'cat',
    description: 'Tüm kedi ürünleri',
    children: [
      {
        id: 'kedi-mamasi',
        name: 'Kedi Maması',
        googleId: '3367',
        children: [
          {
            id: 'kuru-kedi-mamasi',
            name: 'Kuru Mama',
            googleId: '543684',
            children: [
              { id: 'yavru-kedi-mamasi', name: 'Yavru Kedi Maması', googleId: '543684', tags: ['0-12 ay', 'kitten'] },
              { id: 'yetiskin-kedi-mamasi', name: 'Yetişkin Kedi Maması', googleId: '543684', tags: ['1-7 yaş', 'adult'] },
              { id: 'yasli-kedi-mamasi', name: 'Yaşlı Kedi Maması', googleId: '543684', tags: ['7+ yaş', 'senior'] },
              { id: 'kisir-kedi-mamasi', name: 'Kısırlaştırılmış Kedi Maması', googleId: '543684', tags: ['sterilised', 'neutered'] },
              { id: 'diyet-kedi-mamasi', name: 'Diyet / Light Kedi Maması', googleId: '543684', tags: ['light', 'diet'] },
              { id: 'tahilsiz-kedi-mamasi', name: 'Tahılsız Kedi Maması', googleId: '543684', tags: ['grain-free'] },
              { id: 'ozel-irk-kedi-mamasi', name: 'Irka Özel Kedi Maması', googleId: '543684', tags: ['breed-specific'] },
              { id: 'tester-kedi-mamasi', name: 'Tester Kedi Maması', googleId: '543684', tags: ['tester', 'deneme'] }
            ]
          },
          {
            id: 'yas-kedi-mamasi',
            name: 'Yaş Mama',
            googleId: '543684',
            children: [
              { id: 'pouch-mama', name: 'Pouch (Poşet) Mama', googleId: '543684' },
              { id: 'konserve-mama', name: 'Konserve Mama', googleId: '543684' },
              { id: 'yavru-yas-mama', name: 'Yavru Yaş Mama', googleId: '543684' },
              { id: 'kisir-yas-mama', name: 'Kısır Yaş Mama', googleId: '543684' }
            ]
          },
          { id: 'veteriner-diyet-kedi', name: 'Veteriner Diyet Mama', googleId: '543683', tags: ['prescription', 'therapeutic'] }
        ]
      },
      {
        id: 'kedi-odul',
        name: 'Kedi Ödül / Atıştırmalık',
        googleId: '5002',
        children: [
          { id: 'stick-odul', name: 'Stick Ödül', googleId: '5002' },
          { id: 'pure-odul', name: 'Püre / Sıvı Ödül', googleId: '5002' },
          { id: 'biskuvi-odul', name: 'Bisküvi / Kıtır Ödül', googleId: '5002' },
          { id: 'catnip', name: 'Catnip / Kedi Otu', googleId: '5002' }
        ]
      },
      {
        id: 'kedi-kumu',
        name: 'Kedi Kumu',
        googleId: '4999',
        children: [
          { id: 'bentonit-kum', name: 'Bentonit Kum', googleId: '4999', tags: ['topaklaşan'] },
          { id: 'silika-kum', name: 'Silika / Kristal Kum', googleId: '4999' },
          { id: 'organik-kum', name: 'Organik / Doğal Kum', googleId: '4999', tags: ['pelet', 'tofu'] }
        ]
      },
      {
        id: 'kedi-tuvalet',
        name: 'Kedi Tuvaleti',
        googleId: '5000',
        children: [
          { id: 'kapali-tuvalet', name: 'Kapalı Tuvalet', googleId: '5000' },
          { id: 'acik-tuvalet', name: 'Açık Tuvalet', googleId: '5000' },
          { id: 'otomatik-tuvalet', name: 'Otomatik Tuvalet', googleId: '5000' },
          { id: 'tuvalet-aksesuar', name: 'Tuvalet Aksesuarları', googleId: '5000', children: [
            { id: 'kum-kuregi', name: 'Kum Küreği', googleId: '5042' },
            { id: 'tuvalet-paspasi', name: 'Tuvalet Paspası', googleId: '7142' },
            { id: 'koku-giderici', name: 'Koku Giderici', googleId: '503733' }
          ]}
        ]
      },
      {
        id: 'kedi-saglik',
        name: 'Sağlık ve Bakım',
        googleId: '6383',
        children: [
          { id: 'kedi-vitamin', name: 'Vitamin ve Takviye', googleId: '5081', children: [
            { id: 'malt-macun', name: 'Malt / Macun', googleId: '5081' },
            { id: 'kedi-vitamini', name: 'Multivitamin', googleId: '5081' },
            { id: 'kedi-sut-tozu', name: 'Yavru Süt Tozu', googleId: '5081' },
            { id: 'sakinlestirici-kedi', name: 'Sakinleştirici (Calming)', googleId: '5081', tags: ['calming', 'stress'] }
          ]},
          { id: 'pire-kene-kedi', name: 'Pire ve Kene', googleId: '6248' },
          { id: 'kedi-sampuan', name: 'Şampuan', googleId: '6406' },
          { id: 'kedi-tuy-bakim', name: 'Tüy Bakım', googleId: '6385', children: [
            { id: 'kedi-taragi', name: 'Tarak ve Fırça', googleId: '6385' },
            { id: 'furminator-kedi', name: 'Furminator', googleId: '6385' }
          ]},
          { id: 'tirnak-bakim-kedi', name: 'Tırnak Bakımı', googleId: '7319' },
          { id: 'agiz-dis-kedi', name: 'Ağız ve Diş Bakımı', googleId: '6383' },
          { id: 'goz-bakim-kedi', name: 'Göz Bakımı', googleId: '6383' },
          { id: 'kulak-bakim-kedi', name: 'Kulak Bakımı', googleId: '6383' },
          { id: 'elizabet-yakalik-kedi', name: 'Elizabet Yakalık', googleId: '5145' }
        ]
      },
      {
        id: 'kedi-oyuncak',
        name: 'Kedi Oyuncakları',
        googleId: '5001',
        children: [
          { id: 'olta-oyuncak', name: 'Olta Oyuncak', googleId: '5001' },
          { id: 'lazer-oyuncak', name: 'Lazer Oyuncak', googleId: '5001' },
          { id: 'top-oyuncak-kedi', name: 'Top Oyuncak', googleId: '5001' },
          { id: 'tunel-kedi', name: 'Kedi Tüneli', googleId: '5001' },
          { id: 'zeka-oyuncak-kedi', name: 'Zeka Oyuncağı', googleId: '5001' },
          { id: 'pelus-oyuncak-kedi', name: 'Peluş Oyuncak', googleId: '5001' }
        ]
      },
      {
        id: 'kedi-yatak-ev',
        name: 'Yatak ve Ev',
        googleId: '4997',
        children: [
          { id: 'kedi-yatagi', name: 'Kedi Yatağı', googleId: '4433' },
          { id: 'kedi-evi', name: 'Kedi Evi', googleId: '4997' },
          { id: 'tirmalama-agaci', name: 'Tırmalama Ağacı', googleId: '4997' },
          { id: 'tirmalama-tahtasi', name: 'Tırmalama Tahtası', googleId: '4997' }
        ]
      },
      {
        id: 'kedi-mama-kabi',
        name: 'Mama ve Su Kabı',
        googleId: '6252',
        children: [
          { id: 'mama-kabi-kedi', name: 'Mama Kabı', googleId: '6252' },
          { id: 'su-kabi-kedi', name: 'Su Kabı', googleId: '6252' },
          { id: 'su-pinari-kedi', name: 'Su Pınarı / Çeşme', googleId: '6252' },
          { id: 'otomatik-mamalk-kedi', name: 'Otomatik Mamalık', googleId: '6252' },
          { id: 'mama-saklama-kedi', name: 'Mama Saklama Kabı', googleId: '5162' }
        ]
      },
      {
        id: 'kedi-tasima',
        name: 'Taşıma ve Seyahat',
        googleId: '6251',
        children: [
          { id: 'tasima-cantasi-kedi', name: 'Taşıma Çantası', googleId: '6251' },
          { id: 'tasima-kafesi-kedi', name: 'Taşıma Kafesi', googleId: '6251' },
          { id: 'kedi-arabasi', name: 'Kedi Arabası', googleId: '6251' }
        ]
      },
      {
        id: 'kedi-tasma',
        name: 'Tasma ve Aksesuar',
        googleId: '500057',
        children: [
          { id: 'boyun-tasma-kedi', name: 'Boyun Tasması', googleId: '500057' },
          { id: 'gogus-tasma-kedi', name: 'Göğüs Tasması', googleId: '500057' },
          { id: 'kedi-kiyafet', name: 'Kedi Kıyafeti', googleId: '5082' }
        ]
      },
      {
        id: 'kedi-guvenlik',
        name: 'Güvenlik',
        googleId: '4497',
        children: [
          { id: 'kedi-filesi', name: 'Balkon Filesi', googleId: '4497' },
          { id: 'kedi-kapisi', name: 'Kedi Kapısı', googleId: '4497' }
        ]
      }
    ]
  },
  {
    id: 'kopek',
    name: 'Köpek',
    googleId: '5',
    icon: 'dog',
    description: 'Tüm köpek ürünleri',
    children: [
      {
        id: 'kopek-mamasi',
        name: 'Köpek Maması',
        googleId: '3530',
        children: [
          {
            id: 'kuru-kopek-mamasi',
            name: 'Kuru Mama',
            googleId: '543682',
            children: [
              { id: 'yavru-kopek-mamasi', name: 'Yavru Köpek Maması', googleId: '543682', tags: ['puppy'] },
              { id: 'yetiskin-kopek-mamasi', name: 'Yetişkin Köpek Maması', googleId: '543682', tags: ['adult'] },
              { id: 'yasli-kopek-mamasi', name: 'Yaşlı Köpek Maması', googleId: '543682', tags: ['senior', '7+'] },
              { id: 'diyet-kopek-mamasi', name: 'Diyet / Light Köpek Maması', googleId: '543682' },
              { id: 'tahilsiz-kopek-mamasi', name: 'Tahılsız Köpek Maması', googleId: '543682' },
              { id: 'irka-ozel-kopek', name: 'Irka Özel Köpek Maması', googleId: '543682' },
              { id: 'buyuk-irk-kopek', name: 'Büyük Irk Köpek Maması', googleId: '543682', tags: ['large breed'] },
              { id: 'kucuk-irk-kopek', name: 'Küçük Irk Köpek Maması', googleId: '543682', tags: ['small breed'] },
              { id: 'tester-kopek-mamasi', name: 'Tester Köpek Maması', googleId: '543682', tags: ['tester', 'deneme'] }
            ]
          },
          {
            id: 'yas-kopek-mamasi',
            name: 'Yaş Mama',
            googleId: '543682',
            children: [
              { id: 'pouch-kopek', name: 'Pouch (Poşet) Mama', googleId: '543682' },
              { id: 'konserve-kopek', name: 'Konserve Mama', googleId: '543682' },
              { id: 'yavru-yas-kopek', name: 'Yavru Yaş Mama', googleId: '543682' }
            ]
          },
          { id: 'veteriner-diyet-kopek', name: 'Veteriner Diyet Mama', googleId: '543681', tags: ['prescription', 'therapeutic'] }
        ]
      },
      {
        id: 'kopek-odul',
        name: 'Köpek Ödül / Atıştırmalık',
        googleId: '5011',
        children: [
          { id: 'kemik-odul', name: 'Kemik / Çiğneme Ödülü', googleId: '5011' },
          { id: 'stick-odul-kopek', name: 'Stick Ödül', googleId: '5011' },
          { id: 'biskuvi-odul-kopek', name: 'Bisküvi Ödül', googleId: '5011' },
          { id: 'dogal-odul', name: 'Doğal Kurutulmuş Ödül', googleId: '5011', tags: ['işkembe', 'ciğer'] },
          { id: 'dis-sagligi-odul', name: 'Diş Sağlığı Ödülü', googleId: '5011' }
        ]
      },
      {
        id: 'kopek-saglik',
        name: 'Sağlık ve Bakım',
        googleId: '6383',
        children: [
          { id: 'kopek-vitamin', name: 'Vitamin ve Takviye', googleId: '5081', children: [
            { id: 'kopek-vitamini', name: 'Multivitamin', googleId: '5081' },
            { id: 'kopek-sut-tozu', name: 'Yavru Süt Tozu', googleId: '5081' },
            { id: 'sakinlestirici-kopek', name: 'Sakinleştirici (Calming)', googleId: '5081', tags: ['calming', 'stress'] }
          ]},
          { id: 'pire-kene-kopek', name: 'Pire ve Kene', googleId: '6248' },
          { id: 'kopek-sampuan', name: 'Şampuan', googleId: '6406' },
          { id: 'kopek-tuy-bakim', name: 'Tüy Bakım', googleId: '6385', children: [
            { id: 'kopek-taragi', name: 'Tarak ve Fırça', googleId: '6385' },
            { id: 'furminator-kopek', name: 'Furminator', googleId: '6385' },
            { id: 'tiras-makinesi', name: 'Tıraş Makinesi', googleId: '6385' }
          ]},
          { id: 'tirnak-bakim-kopek', name: 'Tırnak Bakımı', googleId: '7319' },
          { id: 'agiz-dis-kopek', name: 'Ağız ve Diş Bakımı', googleId: '7144' },
          { id: 'goz-bakim-kopek', name: 'Göz Bakımı', googleId: '6383' },
          { id: 'kulak-bakim-kopek', name: 'Kulak Bakımı', googleId: '6383' },
          { id: 'elizabet-yakalik-kopek', name: 'Elizabet Yakalık', googleId: '5145' },
          { id: 'cis-pedi', name: 'Çiş Pedi', googleId: '6846' },
          { id: 'diski-torbasi', name: 'Dışkı Torbası', googleId: '6846' }
        ]
      },
      {
        id: 'kopek-oyuncak',
        name: 'Köpek Oyuncakları',
        googleId: '5010',
        children: [
          { id: 'kong-oyuncak', name: 'Kong / Kauçuk Oyuncak', googleId: '5010' },
          { id: 'ip-oyuncak', name: 'İp / Halat Oyuncak', googleId: '5010' },
          { id: 'top-oyuncak-kopek', name: 'Top / Fırlatmalık', googleId: '5010' },
          { id: 'pelus-oyuncak-kopek', name: 'Peluş Oyuncak', googleId: '5010' },
          { id: 'zeka-oyuncak-kopek', name: 'Zeka Oyuncağı', googleId: '5010' }
        ]
      },
      {
        id: 'kopek-yatak-ev',
        name: 'Yatak ve Kulübe',
        googleId: '5094',
        children: [
          { id: 'kopek-yatagi', name: 'Köpek Yatağı', googleId: '4434' },
          { id: 'kopek-kulubesi', name: 'Köpek Kulübesi', googleId: '5094' },
          { id: 'kopek-minderi', name: 'Köpek Minderi', googleId: '4434' },
          { id: 'serinletici-yatak', name: 'Serinletici Yatak', googleId: '4434' }
        ]
      },
      {
        id: 'kopek-mama-kabi',
        name: 'Mama ve Su Kabı',
        googleId: '6252',
        children: [
          { id: 'mama-kabi-kopek', name: 'Mama Kabı', googleId: '6252' },
          { id: 'su-kabi-kopek', name: 'Su Kabı', googleId: '6252' },
          { id: 'yavas-yeme-kabi', name: 'Yavaş Yeme Kabı', googleId: '6252' },
          { id: 'otomatik-mamalk-kopek', name: 'Otomatik Mamalık', googleId: '6252' },
          { id: 'seyahat-suluk', name: 'Seyahat Suluğu', googleId: '6252' },
          { id: 'mama-saklama-kopek', name: 'Mama Saklama Kabı', googleId: '5162' }
        ]
      },
      {
        id: 'kopek-tasma',
        name: 'Tasma ve Kayış',
        googleId: '6250',
        children: [
          { id: 'boyun-tasma-kopek', name: 'Boyun Tasması', googleId: '6249' },
          { id: 'gogus-tasma-kopek', name: 'Göğüs Tasması', googleId: '505308' },
          { id: 'gezdirme-kayisi', name: 'Gezdirme Kayışı', googleId: '6250' },
          { id: 'flexi-tasma', name: 'Otomatik (Flexi) Tasma', googleId: '6253' },
          { id: 'kopek-agizligi', name: 'Köpek Ağızlığı', googleId: '5144' },
          { id: 'isimlik-kunye', name: 'İsimlik / Künye', googleId: '5093' },
          { id: 'reflektor-can-yelegi', name: 'Reflektör ve Can Yeleği', googleId: '5005' }
        ]
      },
      {
        id: 'kopek-tasima',
        name: 'Taşıma ve Seyahat',
        googleId: '5094',
        children: [
          { id: 'tasima-cantasi-kopek', name: 'Taşıma Çantası', googleId: '5094' },
          { id: 'tasima-kafesi-kopek', name: 'Taşıma Kafesi', googleId: '5094' },
          { id: 'kopek-arabasi', name: 'Köpek Arabası', googleId: '5094' }
        ]
      },
      {
        id: 'kopek-arac',
        name: 'Araç Ürünleri',
        googleId: '8474',
        children: [
          { id: 'koltuk-ortusu', name: 'Koltuk Örtüsü', googleId: '8474' },
          { id: 'emniyet-kemeri-kopek', name: 'Emniyet Kemeri', googleId: '8474' }
        ]
      },
      {
        id: 'kopek-kiyafet',
        name: 'Köpek Kıyafeti',
        googleId: '5004',
        children: [
          { id: 'mont-yagmurluk', name: 'Mont / Yağmurluk', googleId: '5004' },
          { id: 'kazak-kopek', name: 'Kazak', googleId: '5004' },
          { id: 'kopek-ayakkabi', name: 'Köpek Ayakkabısı', googleId: '6254' }
        ]
      },
      {
        id: 'kopek-egitim',
        name: 'Eğitim Ürünleri',
        googleId: '505311',
        children: [
          { id: 'egitim-clicker', name: 'Clicker', googleId: '505312' },
          { id: 'egitim-dudugu', name: 'Eğitim Düdüğü', googleId: '505312' },
          { id: 'kopek-citi', name: 'Köpek Çiti', googleId: '7274' },
          { id: 'havlama-onleyici', name: 'Havlama Önleyici', googleId: '505312' }
        ]
      },
      {
        id: 'kopek-bahce',
        name: 'Bahçe Ürünleri',
        googleId: '505311',
        children: [
          { id: 'kopek-havuzu', name: 'Köpek Havuzu', googleId: '505311' },
          { id: 'agility-parkur', name: 'Agility Parkuru', googleId: '505314' }
        ]
      }
    ]
  },
  {
    id: 'kus',
    name: 'Kuş',
    googleId: '3',
    icon: 'bird',
    description: 'Tüm kuş ürünleri',
    children: [
      {
        id: 'kus-yemi',
        name: 'Kuş Yemi',
        googleId: '4990',
        children: [
          { id: 'muhabbet-yemi', name: 'Muhabbet Kuşu Yemi', googleId: '4990' },
          { id: 'papagan-yemi', name: 'Papağan Yemi', googleId: '4990' },
          { id: 'kanarya-yemi', name: 'Kanarya Yemi', googleId: '4990' },
          { id: 'yavru-kus-yemi', name: 'Yavru Kuş Yemi', googleId: '4990' }
        ]
      },
      { id: 'kus-odul', name: 'Kraker ve Ödül', googleId: '4993' },
      { id: 'gaga-tasi', name: 'Gaga Taşı / Kalamar', googleId: '4990' },
      { id: 'kus-vitamin', name: 'Kuş Vitamini', googleId: '4990' },
      {
        id: 'kus-kafes',
        name: 'Kafes ve Ekipman',
        googleId: '4989',
        children: [
          { id: 'kus-kafesi', name: 'Kuş Kafesi', googleId: '4989' },
          { id: 'tunek', name: 'Tünek', googleId: '4991' },
          { id: 'yemlik-suluk', name: 'Yemlik ve Suluk', googleId: '7390' },
          { id: 'kafes-altligi', name: 'Kafes Altlığı', googleId: '4989' },
          { id: 'kus-banyosu', name: 'Kuş Banyosu', googleId: '499954' }
        ]
      },
      { id: 'kus-oyuncak', name: 'Kuş Oyuncağı', googleId: '4992' },
      { id: 'kus-kumu', name: 'Kuş Kumu', googleId: '4990' }
    ]
  },
  {
    id: 'balik',
    name: 'Balık ve Akvaryum',
    googleId: '6',
    icon: 'fish',
    description: 'Akvaryum ve balık ürünleri',
    children: [
      { id: 'balik-yemi', name: 'Balık Yemi', googleId: '5024' },
      { id: 'akvaryum', name: 'Akvaryum', googleId: '3238' },
      {
        id: 'akvaryum-ekipman',
        name: 'Akvaryum Ekipmanı',
        googleId: '505306',
        children: [
          { id: 'akvaryum-filtre', name: 'Filtre', googleId: '5020' },
          { id: 'hava-motoru', name: 'Hava Motoru', googleId: '505307' },
          { id: 'akvaryum-isitici', name: 'Isıtıcı', googleId: '500062' },
          { id: 'akvaryum-aydinlatma', name: 'Aydınlatma', googleId: '5079' },
          { id: 'dip-supurgesi', name: 'Dip Süpürgesi', googleId: '500038' }
        ]
      },
      { id: 'su-duzenleyici', name: 'Su Düzenleyici', googleId: '5161' },
      { id: 'akvaryum-dekor', name: 'Dekorasyon', googleId: '5019' }
    ]
  },
  {
    id: 'kemirgen',
    name: 'Kemirgen',
    googleId: '5013',
    icon: 'squirrel',
    description: 'Hamster, tavşan ve guinea pig ürünleri',
    children: [
      {
        id: 'kemirgen-yem',
        name: 'Kemirgen Yemi',
        googleId: '5015',
        children: [
          { id: 'tavsan-yemi', name: 'Tavşan Yemi', googleId: '5015' },
          { id: 'hamster-yemi', name: 'Hamster Yemi', googleId: '5015' },
          { id: 'guinea-pig-yemi', name: 'Guinea Pig Yemi', googleId: '5015' },
          { id: 'kuru-ot', name: 'Kuru Ot / Yonca', googleId: '5015' }
        ]
      },
      { id: 'kemirme-tasi', name: 'Kemirme Taşı', googleId: '7517' },
      { id: 'kemirgen-kafes', name: 'Kafes', googleId: '5017' },
      { id: 'kemirgen-talas', name: 'Talaş / Altlık', googleId: '5014' },
      { id: 'kemirgen-suluk', name: 'Suluk / Yemlik', googleId: '5016' },
      { id: 'kemirgen-oyuncak', name: 'Oyuncak', googleId: '5013' }
    ]
  },
  {
    id: 'surungan',
    name: 'Sürüngen',
    googleId: '7',
    icon: 'bug',
    description: 'Sürüngen ve amfibi ürünleri',
    children: [
      { id: 'surungan-yemi', name: 'Sürüngen Yemi', googleId: '5026' },
      { id: 'teraryum', name: 'Teraryum', googleId: '5029' },
      { id: 'teraryum-isitma', name: 'Isıtma / Aydınlatma', googleId: '5028' },
      { id: 'teraryum-altlik', name: 'Taban Malzemesi', googleId: '5030' }
    ]
  }
]

// ============================================
// HELPER FUNCTIONS
// ============================================
function flattenCategories(categories, parentPath = '', level = 0) {
  let result = []
  for (const cat of categories) {
    const fullPath = parentPath ? `${parentPath} > ${cat.name}` : cat.name
    result.push({
      ...cat,
      fullPath,
      level,
      hasChildren: cat.children && cat.children.length > 0
    })
    if (cat.children) {
      result = [...result, ...flattenCategories(cat.children, fullPath, level + 1)]
    }
  }
  return result
}

function countCategories(categories) {
  let count = categories.length
  for (const cat of categories) {
    if (cat.children) {
      count += countCategories(cat.children)
    }
  }
  return count
}

function getCategoryIcon(iconName) {
  const icons = { cat: Cat, dog: Dog, bird: Bird, fish: Fish, bug: Bug, squirrel: Squirrel }
  return icons[iconName] || FolderTree
}

// Ürün adından kategori tahmini
function suggestCategory(productName, categories) {
  const name = productName.toLowerCase()
  const flatCats = flattenCategories(categories)

  // Basit keyword eşleştirme
  const keywords = {
    'kedi maması': ['kedi', 'kitten', 'cat'],
    'köpek maması': ['köpek', 'puppy', 'dog'],
    'kum': ['kum', 'kedi kumu'],
    'tasma': ['tasma', 'collar'],
    'oyuncak': ['oyuncak', 'toy'],
    'vitamin': ['vitamin', 'takviye'],
    'şampuan': ['şampuan', 'shampoo'],
  }

  for (const cat of flatCats) {
    const catName = cat.name.toLowerCase()
    if (name.includes(catName) || catName.includes(name.split(' ')[0])) {
      return cat
    }
  }

  return null
}

// ============================================
// COMPONENTS
// ============================================

// Kategori Ağacı Item
function CategoryTreeItem({
  category,
  level = 0,
  selectedId,
  onSelect,
  expandedIds,
  onToggleExpand,
  searchTerm,
  productCounts,
  stockCounts
}) {
  const hasChildren = category.children && category.children.length > 0
  const isExpanded = expandedIds.has(category.id)
  const isSelected = selectedId === category.id
  const Icon = level === 0 ? getCategoryIcon(category.icon) : FolderTree

  // Ürün sayısı ve stok durumu
  const productCount = productCounts?.[category.id] || 0
  const inStockCount = stockCounts?.[category.id] || 0
  const outOfStockCount = productCount - inStockCount

  const matchesSearch = searchTerm
    ? category.name.toLowerCase().includes(searchTerm.toLowerCase())
    : true

  if (!matchesSearch && !hasChildren) return null

  const getStockColor = () => {
    if (productCount === 0) return 'text-gray-400 bg-gray-100'
    if (outOfStockCount > inStockCount) return 'text-red-600 bg-red-50'
    if (outOfStockCount > 0) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  return (
    <div>
      <div
        className={clsx(
          "flex items-center gap-1 px-2 py-1.5 hover:bg-gray-50 cursor-pointer rounded transition-colors text-sm",
          isSelected && "bg-primary-50 border-l-2 border-primary-500"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => onSelect({ ...category, fullPath: category.fullPath || category.name })}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleExpand(category.id); }}
            className="p-0.5 hover:bg-gray-200 rounded"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : <span className="w-4" />}

        <Icon className={clsx("w-4 h-4", level === 0 ? "text-primary-600" : "text-gray-400")} />

        <span className={clsx(
          "flex-1 truncate",
          matchesSearch && searchTerm ? "bg-yellow-100" : "",
          productCount === 0 && "text-gray-400"
        )}>
          {category.name}
        </span>

        {/* Stok Badge */}
        <div className={clsx("flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium", getStockColor())}>
          {productCount > 0 ? (
            <>
              <span>{inStockCount}</span>
              {outOfStockCount > 0 && (
                <span className="text-red-500">/{outOfStockCount}</span>
              )}
            </>
          ) : (
            <span>0</span>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {category.children.map(child => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              searchTerm={searchTerm}
              productCounts={productCounts}
              stockCounts={stockCounts}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Ürün Kartı
function ProductCard({ product, isSelected, onSelect, onAssign, suggestedCategory }) {
  const [showSuggestion, setShowSuggestion] = useState(false)

  return (
    <div
      className={clsx(
        "border rounded-lg p-3 transition-all cursor-pointer",
        isSelected ? "border-primary-500 bg-primary-50" : "hover:border-gray-300 hover:shadow-sm",
        product.total_quantity === 0 && "bg-red-50/50"
      )}
      onClick={() => onSelect(product)}
    >
      <div className="flex gap-3">
        {/* Görsel */}
        {product.images?.[0] ? (
          <img src={product.images[0]} alt="" className="w-12 h-12 object-cover rounded border" />
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
            <Package className="w-5 h-5 text-gray-300" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500 font-mono">{product.code}</span>
            {product.brand && <Badge variant="secondary" size="xs">{product.brand}</Badge>}
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{formatCurrency(product.selling_price)}</span>
              <Badge
                variant={product.total_quantity === 0 ? "danger" : product.total_quantity < 5 ? "warning" : "success"}
                size="xs"
              >
                {product.total_quantity} adet
              </Badge>
            </div>

            {/* Mevcut Kategori */}
            {product.main_category && (
              <Badge variant="info" size="xs" className="max-w-[100px] truncate">
                {product.main_category}
              </Badge>
            )}
          </div>

          {/* Öneri */}
          {suggestedCategory && (
            <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
              <span className="text-yellow-700">Öneri: </span>
              <span className="font-medium text-yellow-800">{suggestedCategory.fullPath}</span>
            </div>
          )}
        </div>

        {/* Checkbox */}
        <div className="flex items-start">
          <div className={clsx(
            "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
            isSelected ? "bg-primary-500 border-primary-500" : "border-gray-300"
          )}>
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
      </div>
    </div>
  )
}

// İstatistik Kartı
function StatCard({ icon: Icon, label, value, color = 'primary', subValue, onClick }) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    blue: 'bg-blue-50 text-blue-600'
  }

  return (
    <div
      className={clsx("bg-white border rounded-lg p-3", onClick && "cursor-pointer hover:shadow-md transition-shadow")}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <div className={clsx("p-2 rounded-lg", colorClasses[color])}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
          {subValue && <p className="text-[10px] text-gray-400">{subValue}</p>}
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function CategoryProductMapping() {
  const queryClient = useQueryClient()

  // State
  const [categorySearch, setCategorySearch] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState(new Set())
  const [expandedIds, setExpandedIds] = useState(new Set(['kedi', 'kopek']))
  const [activeTab, setActiveTab] = useState('all') // all, unmatched, matched
  const [page, setPage] = useState(1)
  const [stockFilter, setStockFilter] = useState('all') // all, in-stock, out-of-stock

  // Tüm kategorileri düzleştir
  const flatCategories = useMemo(() => flattenCategories(ONERI_CATEGORIES), [])
  const totalCategories = countCategories(ONERI_CATEGORIES)

  // Kategori filtreleme kuralları - daha stratejik ve kesin
  const categoryFilterRules = useMemo(() => {
    if (!selectedCategory) return null

    const id = selectedCategory.id
    const name = selectedCategory.name.toLowerCase()

    // Her kategori için: { search: API araması, must: içermeli, mustNot: içermemeli }
    const rules = {
      // === KEDİ KURU MAMALARI ===
      'kuru-kedi-mamasi': {
        search: 'kedi mama',
        must: ['kedi'],
        mustNot: ['konserve', 'pouch', 'wet', 'jelly', 'gravy', 'sos', 'parça', 'pate', 'ezme']
      },
      'yavru-kedi-mamasi': {
        search: 'kitten',
        must: ['kitten', 'yavru'],
        mustNot: ['konserve', 'pouch', 'wet', 'pate']
      },
      'yetiskin-kedi-mamasi': {
        search: 'adult kedi',
        must: ['adult'],
        mustNot: ['konserve', 'pouch', 'wet', 'kitten', 'yavru', 'senior', 'pate']
      },
      'yasli-kedi-mamasi': {
        search: 'senior kedi',
        must: ['senior', 'mature', '7+', '+7'],
        mustNot: ['konserve', 'pouch', 'wet', 'pate']
      },
      'kisir-kedi-mamasi': {
        search: 'sterilised kedi',
        must: ['sterilised', 'sterilized', 'neutered', 'indoor'],
        mustNot: ['konserve', 'pouch', 'wet', 'pate']
      },
      'diyet-kedi-mamasi': {
        search: 'light kedi',
        must: ['light', 'diet', 'weight', 'slim'],
        mustNot: ['konserve', 'pouch', 'wet', 'pate']
      },
      'tahilsiz-kedi-mamasi': {
        search: 'grain free kedi',
        must: ['grain free', 'grain-free', 'grainfree'],
        mustNot: ['konserve', 'pouch', 'wet', 'pate']
      },
      'ozel-irk-kedi-mamasi': {
        search: 'persian british maine',
        must: ['persian', 'british', 'maine', 'siamese', 'bengal', 'ragdoll', 'sphynx'],
        mustNot: ['konserve', 'pouch']
      },
      'tester-kedi-mamasi': {
        search: 'tester',
        must: ['tester', 'deneme', 'numune', 'sample', 'trial'],
        mustNot: []
      },

      // === KEDİ YAŞ MAMA / KONSERVE ===
      'yas-kedi-mamasi': {
        search: 'konserve kedi',
        must: ['konserve', 'pouch', 'wet', 'jelly', 'gravy', 'pate', 'ezme', 'sos'],
        mustNot: []
      },
      'pouch-mama': {
        search: 'pouch kedi',
        must: ['pouch', '85 gr', '100 gr', 'sachet'],
        mustNot: []
      },
      'konserve-mama': {
        search: 'konserve kedi',
        must: ['konserve', 'can', '400', '415'],
        mustNot: ['pouch', '85 gr']
      },
      'yavru-yas-mama': {
        search: 'yavru konserve kedi',
        must: ['yavru', 'kitten', 'junior'],
        mustNot: []
      },
      'kisir-yas-mama': {
        search: 'sterilised konserve kedi',
        must: ['sterilised', 'sterilized'],
        mustNot: []
      },
      'veteriner-diyet-kedi': {
        search: 'renal kedi',
        must: ['veterinary', 'renal', 'urinary', 'hepatic', 'gastro', 'prescription', 'hills', 'royal canin vet'],
        mustNot: []
      },

      // === KEDİ ÖDÜL ===
      'kedi-odul': {
        search: 'kedi',
        must: ['treat', 'snack', 'stick', 'cream', 'lick'],
        mustNot: ['mama', 'kum', 'oyuncak', 'tasma']
      },
      'stick-odul': {
        search: 'stick kedi',
        must: ['stick', 'sticks'],
        mustNot: []
      },
      'pure-odul': {
        search: 'cream kedi',
        must: ['cream', 'creamy', 'lick', 'liquid', 'squeeze'],
        mustNot: []
      },
      'biskuvi-odul': {
        search: 'kedi treat',
        must: ['biscuit', 'crunchy', 'crispy', 'dreamies', 'temptations'],
        mustNot: ['stick', 'cream']
      },
      'catnip': {
        search: 'catnip',
        must: ['catnip', 'catmint', 'kedi otu'],
        mustNot: []
      },

      // === KEDİ KUMU ===
      'kedi-kumu': {
        search: 'kedi kumu',
        must: ['kum', 'litter'],
        mustNot: ['oyuncak', 'mama']
      },
      'bentonit-kum': {
        search: 'bentonit',
        must: ['bentonit', 'clumping'],
        mustNot: ['silika', 'kristal', 'crystal']
      },
      'silika-kum': {
        search: 'silika',
        must: ['silika', 'silica', 'kristal', 'crystal'],
        mustNot: ['bentonit']
      },
      'organik-kum': {
        search: 'tofu kum',
        must: ['tofu', 'wood', 'corn', 'wheat', 'plant', 'natural'],
        mustNot: ['bentonit', 'silika', 'silica']
      },

      // === KEDİ TUVALETİ ===
      'kedi-tuvalet': {
        search: 'kedi tuvaleti',
        must: ['tuvalet', 'kap', 'box'],
        mustNot: ['kum', 'kürek']
      },
      'kapali-tuvalet': {
        search: 'kapalı kedi tuvaleti',
        must: ['kapalı', 'covered', 'enclosed'],
        mustNot: []
      },
      'acik-tuvalet': {
        search: 'açık kedi tuvaleti',
        must: ['açık', 'open'],
        mustNot: ['kapalı']
      },
      'otomatik-tuvalet': {
        search: 'otomatik kedi tuvaleti',
        must: ['otomatik', 'automatic', 'self-cleaning', 'akıllı'],
        mustNot: []
      },
      'kum-kuregi': {
        search: 'kum küreği',
        must: ['kürek', 'scoop'],
        mustNot: []
      },
      'koku-giderici': {
        search: 'koku giderici kedi',
        must: ['koku', 'deodorant', 'freshener'],
        mustNot: []
      },

      // === KEDİ SAĞLIK VE BAKIM ===
      'kedi-saglik': {
        search: 'kedi',
        must: ['vitamin', 'supplement', 'health', 'care'],
        mustNot: ['mama', 'kum', 'oyuncak', 'tasma']
      },
      'kedi-vitamin': {
        search: 'vitamin kedi',
        must: ['vitamin', 'supplement', 'tablet', 'paste'],
        mustNot: ['mama']
      },
      'malt-macun': {
        search: 'malt kedi',
        must: ['malt', 'hairball', 'paste'],
        mustNot: []
      },
      'kedi-sut-tozu': {
        search: 'milk kedi kitten',
        must: ['milk', 'kitten milk', 'cat milk'],
        mustNot: []
      },
      'sakinlestirici-kedi': {
        search: 'calming kedi',
        must: ['calming', 'relax', 'stress', 'feliway'],
        mustNot: []
      },
      'pire-kene-kedi': {
        search: 'flea kedi',
        must: ['flea', 'tick', 'pire', 'kene', 'frontline', 'advantix', 'seresto'],
        mustNot: []
      },
      'kedi-sampuan': {
        search: 'shampoo kedi',
        must: ['shampoo', 'sampuan'],
        mustNot: []
      },
      'kedi-taragi': {
        search: 'brush kedi',
        must: ['brush', 'comb', 'tarak'],
        mustNot: ['furminator']
      },
      'furminator-kedi': {
        search: 'furminator',
        must: ['furminator', 'deshedding'],
        mustNot: []
      },
      'tirnak-bakim-kedi': {
        search: 'nail kedi',
        must: ['nail', 'claw', 'clipper'],
        mustNot: []
      },
      'elizabet-yakalik-kedi': {
        search: 'cone kedi',
        must: ['cone', 'collar', 'elizabet', 'elizabeth'],
        mustNot: ['tasma', 'boyun']
      },

      // === KEDİ OYUNCAK ===
      'kedi-oyuncak': {
        search: 'kedi oyuncak',
        must: ['oyuncak', 'toy'],
        mustNot: ['mama', 'kum']
      },
      'olta-oyuncak': {
        search: 'kedi olta',
        must: ['olta', 'wand', 'teaser'],
        mustNot: []
      },
      'lazer-oyuncak': {
        search: 'kedi lazer',
        must: ['lazer', 'laser'],
        mustNot: []
      },
      'top-oyuncak-kedi': {
        search: 'kedi top',
        must: ['top', 'ball'],
        mustNot: []
      },
      'tunel-kedi': {
        search: 'kedi tüneli',
        must: ['tünel', 'tunnel'],
        mustNot: []
      },
      'pelus-oyuncak-kedi': {
        search: 'kedi peluş',
        must: ['peluş', 'plush', 'fare', 'mouse'],
        mustNot: []
      },

      // === KEDİ YATAK/EV ===
      'kedi-yatak-ev': {
        search: 'kedi yatak',
        must: ['yatak', 'ev', 'yuva', 'bed', 'house'],
        mustNot: []
      },
      'kedi-yatagi': {
        search: 'kedi yatağı',
        must: ['yatak', 'minder', 'bed', 'cushion'],
        mustNot: ['ev', 'ağaç']
      },
      'kedi-evi': {
        search: 'kedi evi',
        must: ['ev', 'yuva', 'house', 'igloo'],
        mustNot: ['tırmalama']
      },
      'tirmalama-agaci': {
        search: 'tırmalama ağacı',
        must: ['tırmalama ağacı', 'cat tree', 'scratching tree'],
        mustNot: []
      },
      'tirmalama-tahtasi': {
        search: 'tırmalama tahtası',
        must: ['tırmalama', 'scratching', 'karton'],
        mustNot: ['ağaç', 'tree']
      },

      // === KEDİ MAMA KABI ===
      'kedi-mama-kabi': {
        search: 'kedi mama kabı',
        must: ['kap', 'kase', 'bowl'],
        mustNot: ['taşıma']
      },
      'su-pinari-kedi': {
        search: 'kedi su pınarı',
        must: ['pınar', 'çeşme', 'fountain'],
        mustNot: []
      },
      'otomatik-mamalk-kedi': {
        search: 'otomatik mamalık kedi',
        must: ['otomatik', 'automatic', 'feeder'],
        mustNot: []
      },

      // === KEDİ TAŞIMA ===
      'kedi-tasima': {
        search: 'kedi taşıma',
        must: ['taşıma', 'carrier', 'çanta'],
        mustNot: []
      },
      'tasima-cantasi-kedi': {
        search: 'kedi taşıma çantası',
        must: ['çanta', 'bag'],
        mustNot: ['kafes']
      },
      'tasima-kafesi-kedi': {
        search: 'kedi taşıma kafesi',
        must: ['kafes', 'box', 'cage', 'crate'],
        mustNot: ['çanta']
      },

      // === KEDİ TASMA ===
      'kedi-tasma': {
        search: 'kedi tasma',
        must: ['tasma', 'collar', 'harness'],
        mustNot: []
      },
      'boyun-tasma-kedi': {
        search: 'kedi boyun tasma',
        must: ['boyun', 'collar'],
        mustNot: ['göğüs']
      },
      'gogus-tasma-kedi': {
        search: 'kedi göğüs tasma',
        must: ['göğüs', 'harness'],
        mustNot: []
      },

      // === KÖPEK KURU MAMALARI ===
      'kuru-kopek-mamasi': {
        search: 'dog food',
        must: [],
        mustNot: ['konserve', 'pouch', 'wet', 'jelly', 'can', 'pate']
      },
      'yavru-kopek-mamasi': {
        search: 'puppy',
        must: ['puppy', 'yavru', 'junior'],
        mustNot: ['konserve', 'pouch', 'wet', 'pate']
      },
      'yetiskin-kopek-mamasi': {
        search: 'adult dog',
        must: ['adult'],
        mustNot: ['konserve', 'pouch', 'wet', 'puppy', 'yavru', 'senior', 'pate']
      },
      'yasli-kopek-mamasi': {
        search: 'senior dog',
        must: ['senior', 'mature', '7+'],
        mustNot: ['konserve', 'pouch', 'wet', 'pate']
      },
      'diyet-kopek-mamasi': {
        search: 'light dog',
        must: ['light', 'diet', 'weight'],
        mustNot: ['konserve', 'pouch', 'wet']
      },
      'tahilsiz-kopek-mamasi': {
        search: 'grain free dog',
        must: ['grain free', 'grain-free'],
        mustNot: ['konserve', 'pouch', 'wet']
      },
      'buyuk-irk-kopek': {
        search: 'large breed',
        must: ['large', 'maxi', 'giant'],
        mustNot: ['small', 'mini', 'konserve']
      },
      'kucuk-irk-kopek': {
        search: 'small breed',
        must: ['small', 'mini', 'toy'],
        mustNot: ['large', 'maxi', 'konserve']
      },

      // === KÖPEK YAŞ MAMA ===
      'yas-kopek-mamasi': {
        search: 'konserve dog',
        must: ['konserve', 'pouch', 'wet', 'can', 'pate'],
        mustNot: []
      },
      'konserve-kopek': {
        search: 'konserve dog',
        must: ['konserve', 'can', '400', '800'],
        mustNot: ['pouch']
      },
      'yavru-yas-kopek': {
        search: 'puppy konserve',
        must: ['puppy', 'yavru'],
        mustNot: []
      },

      // === KÖPEK ÖDÜL ===
      'kopek-odul': {
        search: 'dog treat',
        must: ['treat', 'snack', 'bone', 'chew', 'stick'],
        mustNot: ['mama', 'food']
      },
      'kemik-odul': {
        search: 'dog bone',
        must: ['bone', 'chew', 'rawhide', 'dental'],
        mustNot: []
      },
      'stick-odul-kopek': {
        search: 'dog stick',
        must: ['stick', 'sticks'],
        mustNot: []
      },
      'dogal-odul': {
        search: 'dog natural treat',
        must: ['natural', 'dried', 'jerky', 'liver'],
        mustNot: []
      },
      'dis-sagligi-odul': {
        search: 'dental dog',
        must: ['dental', 'dentastix', 'greenies', 'teeth'],
        mustNot: []
      },

      // Varsayılan - ana kategoriler
      'kedi': {
        search: 'kedi',
        must: ['kedi', 'cat', 'kitten'],
        mustNot: ['köpek', 'kuş', 'balık']
      },
      'kopek': {
        search: 'köpek',
        must: ['köpek', 'dog', 'puppy'],
        mustNot: ['kedi', 'kuş', 'balık']
      },
      'kus': {
        search: 'kuş',
        must: ['kuş', 'bird', 'papağan', 'muhabbet', 'kanarya'],
        mustNot: ['kedi', 'köpek']
      },
      'balik': {
        search: 'balık',
        must: ['balık', 'akvaryum', 'fish'],
        mustNot: ['kedi', 'köpek']
      },
      'kemirgen': {
        search: 'kemirgen',
        must: ['kemirgen', 'hamster', 'tavşan', 'guinea'],
        mustNot: []
      },
      'surungan': {
        search: 'sürüngen',
        must: ['sürüngen', 'reptile', 'kaplumbağa', 'kertenkele'],
        mustNot: []
      }
    }

    return rules[id] || { search: name, must: [], mustNot: [] }
  }, [selectedCategory])

  // API arama terimi
  const categorySearchKeyword = useMemo(() => {
    return categoryFilterRules?.search || ''
  }, [categoryFilterRules])

  // Ürün araması için combined search (kullanıcı araması + kategori filtresi)
  const combinedSearch = useMemo(() => {
    if (productSearch) return productSearch
    return categorySearchKeyword
  }, [productSearch, categorySearchKeyword])

  // API Queries
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', { page, search: combinedSearch, stockStatus: stockFilter === 'all' ? '' : stockFilter }],
    queryFn: () => getProducts({
      page,
      limit: 50,
      search: combinedSearch,
      stockStatus: stockFilter === 'all' ? '' : stockFilter === 'in-stock' ? 'in-stock' : 'out-of-stock'
    }),
  })

  const { data: existingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  // Kategori bazlı ürün sayılarını hesapla - Backend sub_category ile eşleştir
  const { productCounts, stockCounts, unmatchedCount, matchedCount } = useMemo(() => {
    const pCounts = {}
    const sCounts = {}
    let unmatched = 0
    let matched = 0

    // Backend sub_category -> Öneri kategori ID eşleştirmesi
    const subCategoryMapping = {
      // KEDİ
      'kuru kedi maması': { ids: ['kedi', 'kedi-mamasi', 'kuru-kedi-mamasi'], animal: 'kedi' },
      'konserve kedi maması': { ids: ['kedi', 'kedi-mamasi', 'yas-kedi-mamasi'], animal: 'kedi' },
      'kedi ödülleri': { ids: ['kedi', 'kedi-odul'], animal: 'kedi' },
      'kedi kumları': { ids: ['kedi', 'kedi-kumu'], animal: 'kedi' },
      'kedi tuvaleti ve ürünleri': { ids: ['kedi', 'kedi-tuvalet'], animal: 'kedi' },
      'kedi oyuncakları': { ids: ['kedi', 'kedi-oyuncak'], animal: 'kedi' },
      'kedi bakım ürünleri': { ids: ['kedi', 'kedi-saglik', 'kedi-tuy-bakim'], animal: 'kedi' },
      'kedi sağlık ürünleri': { ids: ['kedi', 'kedi-saglik', 'kedi-vitamin'], animal: 'kedi' },
      'kedi tasmaları': { ids: ['kedi', 'kedi-tasma'], animal: 'kedi' },
      'kedi mama ve su kapları': { ids: ['kedi', 'kedi-mama-kabi'], animal: 'kedi' },
      'kedi taşıma çantaları ve seyahat ürünleri': { ids: ['kedi', 'kedi-tasima'], animal: 'kedi' },
      'kedi tırmalamaları': { ids: ['kedi', 'kedi-yatak-ev', 'tirmalama-agaci', 'tirmalama-tahtasi'], animal: 'kedi' },
      'kedi yatakları': { ids: ['kedi', 'kedi-yatak-ev', 'kedi-yatagi'], animal: 'kedi' },
      'kedi kafesleri': { ids: ['kedi', 'kedi-tasima', 'tasima-kafesi-kedi'], animal: 'kedi' },
      'kedi kapıları': { ids: ['kedi', 'kedi-guvenlik', 'kedi-kapisi'], animal: 'kedi' },
      'kedi aksesuarları': { ids: ['kedi'], animal: 'kedi' },
      'kedi eğitim ürünleri': { ids: ['kedi'], animal: 'kedi' },
      'yavru kedi': { ids: ['kedi', 'kedi-mamasi', 'yavru-kedi-mamasi'], animal: 'kedi' },

      // KÖPEK
      'kuru köpek maması': { ids: ['kopek', 'kopek-mamasi', 'kuru-kopek-mamasi'], animal: 'kopek' },
      'konserve köpek maması': { ids: ['kopek', 'kopek-mamasi', 'yas-kopek-mamasi'], animal: 'kopek' },
      'köpek ödülleri': { ids: ['kopek', 'kopek-odul'], animal: 'kopek' },
      'köpek oyuncakları': { ids: ['kopek', 'kopek-oyuncak'], animal: 'kopek' },
      'köpek bakım ürünleri': { ids: ['kopek', 'kopek-saglik', 'kopek-tuy-bakim'], animal: 'kopek' },
      'köpek sağlık ürünleri': { ids: ['kopek', 'kopek-saglik', 'kopek-vitamin'], animal: 'kopek' },
      'köpek tasmaları': { ids: ['kopek', 'kopek-tasma'], animal: 'kopek' },
      'köpek mama ve su kapları': { ids: ['kopek', 'kopek-mama-kabi'], animal: 'kopek' },
      'köpek yatakları': { ids: ['kopek', 'kopek-yatak-ev', 'kopek-yatagi'], animal: 'kopek' },
      'köpek taşıma çantaları': { ids: ['kopek', 'kopek-tasima'], animal: 'kopek' },
      'köpek seyahat ürünleri': { ids: ['kopek', 'kopek-arac'], animal: 'kopek' },
      'köpek aksesuarları': { ids: ['kopek', 'kopek-kiyafet'], animal: 'kopek' },
      'köpek eğitim ürünleri': { ids: ['kopek', 'kopek-egitim'], animal: 'kopek' },
      'köpek kafesleri': { ids: ['kopek', 'kopek-tasima'], animal: 'kopek' },
      'köpek kulubeleri': { ids: ['kopek', 'kopek-yatak-ev', 'kopek-kulubesi'], animal: 'kopek' },
      'köpek kapıları': { ids: ['kopek'], animal: 'kopek' },

      // KUŞ
      'kuş yemleri': { ids: ['kus', 'kus-yemi'], animal: 'kus' },
      'kuş ödül ve krakerleri': { ids: ['kus', 'kus-odul'], animal: 'kus' },
      'kuş kafesleri': { ids: ['kus', 'kus-kafes', 'kus-kafesi'], animal: 'kus' },
      'kuş kafesi malzemeleri': { ids: ['kus', 'kus-kafes', 'tunek', 'yemlik-suluk'], animal: 'kus' },
      'kuş oyuncakları': { ids: ['kus', 'kus-oyuncak'], animal: 'kus' },
      'kuş bakım ürünleri': { ids: ['kus'], animal: 'kus' },
      'kuş sağlık ürünleri': { ids: ['kus', 'kus-vitamin'], animal: 'kus' },

      // BALIK / AKVARYUM
      'balık yemleri': { ids: ['balik', 'balik-yemi'], animal: 'balik' },
      'akvaryum malzemeleri': { ids: ['balik', 'akvaryum-ekipman'], animal: 'balik' },
      'akvaryum dekor ürünleri': { ids: ['balik', 'akvaryum-dekor'], animal: 'balik' },
      'akvaryumlar': { ids: ['balik', 'akvaryum'], animal: 'balik' },
      'akvaryum su düzenleyicileri': { ids: ['balik', 'su-duzenleyici'], animal: 'balik' },
      'akvaryum kumları': { ids: ['balik'], animal: 'balik' },
      'bitkili akvaryum ürünleri': { ids: ['balik'], animal: 'balik' },
      'balık sağlık ürünleri': { ids: ['balik'], animal: 'balik' },

      // KEMİRGEN
      'kemirgen yemleri': { ids: ['kemirgen', 'kemirgen-yem'], animal: 'kemirgen' },
      'kemirgen kafesleri': { ids: ['kemirgen', 'kemirgen-kafes'], animal: 'kemirgen' },
      'kemirgen kafes malzemeleri': { ids: ['kemirgen', 'kemirgen-suluk'], animal: 'kemirgen' },
      'kemirgen oyuncakları': { ids: ['kemirgen', 'kemirgen-oyuncak'], animal: 'kemirgen' },
      'kemirgen bakım ürünleri': { ids: ['kemirgen'], animal: 'kemirgen' },
      'kemirgen sağlık ürünleri': { ids: ['kemirgen'], animal: 'kemirgen' },
      'kemirgen ödülleri': { ids: ['kemirgen', 'kemirme-tasi'], animal: 'kemirgen' },
      'kemirgen taşıma çantaları': { ids: ['kemirgen'], animal: 'kemirgen' },

      // SÜRÜNGEN
      'sürüngen yemleri': { ids: ['surungan', 'surungan-yemi'], animal: 'surungan' },
      'sürüngen yaşam alanları': { ids: ['surungan', 'teraryum'], animal: 'surungan' },
      'sürüngen aksesuarları': { ids: ['surungan', 'teraryum-isitma', 'teraryum-altlik'], animal: 'surungan' },
      'sürüngen bakım ürünleri': { ids: ['surungan'], animal: 'surungan' },
    }

    if (existingCategories) {
      existingCategories.forEach(cat => {
        const mainCat = cat.main_category?.toLowerCase().trim()
        const subCat = cat.sub_category?.toLowerCase().trim()
        const productCount = cat.product_count || 0
        const inStockCount = productCount - (cat.out_of_stock_count || 0)

        let matchedIds = []

        // 1. Sub category ile eşleştir
        if (subCat && subCategoryMapping[subCat]) {
          matchedIds = [...subCategoryMapping[subCat].ids]
        }
        // 2. Main category ile eşleştir (sub category yoksa)
        else if (mainCat) {
          if (mainCat.includes('kedi')) matchedIds.push('kedi')
          else if (mainCat.includes('köpek')) matchedIds.push('kopek')
          else if (mainCat.includes('kuş')) matchedIds.push('kus')
          else if (mainCat.includes('balık') || mainCat.includes('akvaryum')) matchedIds.push('balik')
          else if (mainCat.includes('kemirgen')) matchedIds.push('kemirgen')
          else if (mainCat.includes('sürüngen')) matchedIds.push('surungan')
        }

        // Benzersiz ID'ler
        matchedIds = [...new Set(matchedIds)]

        if (matchedIds.length > 0) {
          matchedIds.forEach(id => {
            pCounts[id] = (pCounts[id] || 0) + productCount
            sCounts[id] = (sCounts[id] || 0) + inStockCount
          })
          matched += productCount
        } else {
          unmatched += productCount
        }
      })
    }

    return { productCounts: pCounts, stockCounts: sCounts, unmatchedCount: unmatched, matchedCount: matched }
  }, [existingCategories])

  // Eşleştirme Mutation
  const mapMutation = useMutation({
    mutationFn: (data) => bulkMapProductCategories(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['products'])
      queryClient.invalidateQueries(['categories'])
      setSelectedProducts(new Set())
    }
  })

  // Handlers
  const handleToggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setPage(1) // Sayfa sıfırla
    setSelectedProducts(new Set()) // Seçimleri temizle
  }

  const handleProductSelect = (product) => {
    setSelectedProducts(prev => {
      const next = new Set(prev)
      if (next.has(product.code)) next.delete(product.code)
      else next.add(product.code)
      return next
    })
  }

  const handleSelectAll = () => {
    if (!productsData?.products) return
    const allCodes = new Set(productsData.products.map(p => p.code))
    setSelectedProducts(allCodes)
  }

  const handleDeselectAll = () => {
    setSelectedProducts(new Set())
  }

  const handleAssignCategory = () => {
    if (!selectedCategory || selectedProducts.size === 0) return

    mapMutation.mutate({
      skus: Array.from(selectedProducts),
      categoryId: parseInt(selectedCategory.googleId) || selectedCategory.googleId
    })
  }

  const expandAll = () => {
    setExpandedIds(new Set(flatCategories.map(c => c.id)))
  }

  const collapseAll = () => {
    setExpandedIds(new Set())
  }

  // API'dan gelen ürünleri frontend'de filtrele (must/mustNot kuralları)
  const filteredProducts = useMemo(() => {
    const rawProducts = productsData?.products || []

    // Kategori seçili değilse veya kullanıcı arama yaptıysa filtreleme yapma
    if (!categoryFilterRules || productSearch) {
      return rawProducts
    }

    const { must, mustNot } = categoryFilterRules

    return rawProducts.filter(product => {
      const name = product.name?.toLowerCase() || ''
      const brand = product.brand?.toLowerCase() || ''
      const fullText = `${name} ${brand}`

      // mustNot kontrolü - bunlardan biri varsa ürünü hariç tut
      if (mustNot && mustNot.length > 0) {
        const hasExcluded = mustNot.some(keyword => fullText.includes(keyword.toLowerCase()))
        if (hasExcluded) return false
      }

      // must kontrolü - bunlardan en az biri olmalı (eğer must listesi varsa)
      if (must && must.length > 0) {
        const hasRequired = must.some(keyword => fullText.includes(keyword.toLowerCase()))
        if (!hasRequired) return false
      }

      return true
    })
  }, [productsData?.products, categoryFilterRules, productSearch])

  const products = filteredProducts
  const pagination = productsData?.pagination || {}
  const totalProducts = pagination.total || 0
  const filteredCount = products.length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ListTree className="w-6 h-6 text-primary-600" />
            Kategori - Ürün Eşleştirme
          </h1>
          <p className="text-gray-500 text-sm">Ürünleri öneri kategori yapısına göre eşleştirin</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          icon={Package}
          label="Toplam Ürün"
          value={formatNumber(totalProducts)}
          color="primary"
        />
        <StatCard
          icon={FolderTree}
          label="Toplam Kategori"
          value={totalCategories}
          color="blue"
        />
        <StatCard
          icon={PackageCheck}
          label="Eşleşmiş"
          value={formatNumber(matchedCount)}
          color="green"
          onClick={() => setActiveTab('matched')}
        />
        <StatCard
          icon={PackageX}
          label="Eşleşmemiş"
          value={formatNumber(unmatchedCount)}
          color="red"
          onClick={() => setActiveTab('unmatched')}
        />
        <StatCard
          icon={AlertTriangle}
          label="Stoksuz Kategori"
          value={Object.values(stockCounts).filter(v => v === 0).length}
          color="yellow"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sol Panel: Kategori Ağacı */}
        <Card className="p-0 lg:col-span-1">
          <CardHeader className="border-b p-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-primary-600" />
                Öneri Kategorileri
              </CardTitle>
              <div className="flex gap-1 text-xs">
                <button onClick={expandAll} className="text-primary-600 hover:underline">Aç</button>
                <span className="text-gray-300">|</span>
                <button onClick={collapseAll} className="text-primary-600 hover:underline">Kapat</button>
              </div>
            </div>
          </CardHeader>

          {/* Kategori Arama */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Kategori ara..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Kategori Ağacı */}
          <CardContent className="p-1 max-h-[500px] overflow-y-auto">
            {ONERI_CATEGORIES.map(cat => (
              <CategoryTreeItem
                key={cat.id}
                category={cat}
                selectedId={selectedCategory?.id}
                onSelect={handleCategorySelect}
                expandedIds={expandedIds}
                onToggleExpand={handleToggleExpand}
                searchTerm={categorySearch}
                productCounts={productCounts}
                stockCounts={stockCounts}
              />
            ))}
          </CardContent>

          {/* Seçili Kategori Info */}
          {selectedCategory && (
            <div className="border-t p-3 bg-primary-50">
              <p className="text-xs text-gray-500 mb-1">Seçili Kategori</p>
              <p className="font-medium text-primary-700">{selectedCategory.name}</p>
              {selectedCategory.googleId && (
                <Badge variant="success" size="xs" className="mt-1">G:{selectedCategory.googleId}</Badge>
              )}
            </div>
          )}
        </Card>

        {/* Sağ Panel: Ürünler */}
        <Card className="p-0 lg:col-span-2">
          <CardHeader className="border-b p-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-600" />
                Ürünler
                {selectedProducts.size > 0 && (
                  <Badge variant="primary">{selectedProducts.size} seçili</Badge>
                )}
              </CardTitle>

              <div className="flex items-center gap-2">
                {/* Stok Filtresi */}
                <select
                  value={stockFilter}
                  onChange={(e) => { setStockFilter(e.target.value); setPage(1); }}
                  className="text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">Tüm Stok</option>
                  <option value="in-stock">Stokta Var</option>
                  <option value="out-of-stock">Stokta Yok</option>
                </select>

                {/* Seçim Butonları */}
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-primary-600 hover:underline"
                >
                  Tümünü Seç
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="text-xs text-gray-500 hover:underline"
                >
                  Seçimi Kaldır
                </button>
              </div>
            </div>
          </CardHeader>

          {/* Ürün Arama */}
          <div className="p-3 border-b bg-gray-50">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ürün adı veya kod ara..."
                  value={productSearch}
                  onChange={(e) => { setProductSearch(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Eşleştir Butonu */}
              {selectedProducts.size > 0 && selectedCategory && (
                <button
                  onClick={handleAssignCategory}
                  disabled={mapMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  {mapMutation.isPending ? 'Eşleştiriliyor...' : `${selectedProducts.size} Ürünü Eşleştir`}
                </button>
              )}
            </div>

            {/* Kategori Filtre Bilgisi */}
            {selectedCategory && !productSearch && (
              <div className="mt-2 p-2 bg-purple-50 rounded-lg text-sm text-purple-700 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>
                  <strong>{selectedCategory.name}</strong> → <strong>{filteredCount}</strong> ürün bulundu
                  {categoryFilterRules?.must?.length > 0 && (
                    <span className="text-purple-500"> (içermeli: {categoryFilterRules.must.slice(0,3).join(', ')})</span>
                  )}
                  {categoryFilterRules?.mustNot?.length > 0 && (
                    <span className="text-red-400"> (hariç: {categoryFilterRules.mustNot.slice(0,2).join(', ')}...)</span>
                  )}
                </span>
              </div>
            )}

            {/* Eşleştirme Bilgisi */}
            {selectedProducts.size > 0 && selectedCategory && (
              <div className="mt-2 p-2 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>
                  <strong>{selectedProducts.size}</strong> ürün → <strong>{selectedCategory.name}</strong> kategorisine eşleştirilecek
                </span>
              </div>
            )}
          </div>

          {/* Ürün Listesi */}
          <CardContent className="p-3 max-h-[400px] overflow-y-auto">
            {productsLoading ? (
              <LoadingState message="Ürünler yükleniyor..." />
            ) : products.length === 0 ? (
              <EmptyState message="Ürün bulunamadı" icon={Package} />
            ) : (
              <div className="space-y-2">
                {products.map(product => {
                  const suggested = suggestCategory(product.name, ONERI_CATEGORIES)
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isSelected={selectedProducts.has(product.code)}
                      onSelect={handleProductSelect}
                      suggestedCategory={suggested}
                    />
                  )
                })}
              </div>
            )}
          </CardContent>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="border-t p-3 flex items-center justify-between bg-gray-50">
              <span className="text-sm text-gray-600">
                {formatNumber(pagination.total)} üründen {(page - 1) * 50 + 1}-{Math.min(page * 50, pagination.total)}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-2 py-1 text-xs border rounded hover:bg-white disabled:opacity-50"
                >
                  İlk
                </button>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 border rounded hover:bg-white disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 bg-white border rounded text-sm font-medium">
                  {page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="p-1 border rounded hover:bg-white disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(pagination.totalPages)}
                  disabled={page >= pagination.totalPages}
                  className="px-2 py-1 text-xs border rounded hover:bg-white disabled:opacity-50"
                >
                  Son
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Yardım Bilgisi */}
      <Card className="bg-gradient-to-r from-blue-50 to-primary-50">
        <CardContent className="p-4">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Nasıl Kullanılır?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">1</span>
              <p>Sol panelden bir <strong>kategori</strong> seçin. Kategorilerin yanındaki sayılar stokta olan ürün sayısını gösterir.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">2</span>
              <p>Sağ panelden eşleştirmek istediğiniz <strong>ürünleri</strong> seçin. Birden fazla ürün seçebilirsiniz.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">3</span>
              <p><strong>"Eşleştir"</strong> butonuna tıklayarak seçili ürünleri kategoriye atayın.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
