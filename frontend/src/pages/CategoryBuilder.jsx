import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FolderTree, ChevronRight, ChevronDown, Search, Plus, Edit2, X,
  Layers, Package, Copy, Download, Link2, Tag, Hash, FileText,
  Cat, Dog, Bird, Fish, Bug, Squirrel, Store, Building2, ArrowLeftRight,
  CheckCircle2, XCircle, AlertCircle, Eye, EyeOff, Star, Sparkles,
  Globe, ShoppingBag
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import clsx from 'clsx'
import {
  getAllGoogleCategories,
  getCategoryDashboard
} from '../services/api'

// ============================================
// ÖNERİ KATEGORİ YAPISI (FİNAL - KULLANILACAK)
// En iyi pratikler + Google Taxonomy + SEO optimizasyonu
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
            name: 'Yaş Mama / Konserve',
            googleId: '543684',
            children: [
              { id: 'pouch-mama', name: 'Pouch (Poşet) Mama', googleId: '543684' },
              { id: 'konserve-mama', name: 'Konserve Mama', googleId: '543684' },
              { id: 'yavru-yas-mama', name: 'Yavru Yaş Mama', googleId: '543684' },
              { id: 'kisir-yas-mama', name: 'Kısır Yaş Mama', googleId: '543684' }
            ]
          },
          {
            id: 'veteriner-diyet-kedi',
            name: 'Veteriner Diyet Mama',
            googleId: '543683',
            tags: ['prescription', 'therapeutic']
          }
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
            name: 'Yaş Mama / Konserve',
            googleId: '543682',
            children: [
              { id: 'konserve-kopek', name: 'Konserve Mama', googleId: '543682' },
              { id: 'yavru-yas-kopek', name: 'Yavru Yaş Mama', googleId: '543682' }
            ]
          },
          {
            id: 'veteriner-diyet-kopek',
            name: 'Veteriner Diyet Mama',
            googleId: '543681',
            tags: ['prescription', 'therapeutic']
          }
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
// PETZZSHOP.COM MEVCUT YAPI (CANLI SİTE)
// ============================================
const MEVCUT_CATEGORIES = [
  {
    id: 'm-kedi',
    name: 'Kedi Ürünleri',
    icon: 'cat',
    children: [
      {
        id: 'm-kedi-mama',
        name: 'Kedi Maması',
        children: [
          { id: 'm-yavru-kedi', name: 'Yavru Kedi Maması' },
          { id: 'm-yetiskin-kedi', name: 'Yetişkin Kedi Maması' },
          { id: 'm-kisir-kedi', name: 'Kısırlaştırılmış Kedi Maması' }
        ]
      },
      { id: 'm-kedi-konserve', name: 'Kedi Konservesi & Yaş Mama' },
      { id: 'm-kedi-odul', name: 'Kedi Ödül Maması' },
      { id: 'm-kedi-bakim', name: 'Bakım ve Sağlık Ürünleri' },
      {
        id: 'm-kedi-kum-tuvalet',
        name: 'Kum ve Tuvalet Ürünleri',
        children: [
          { id: 'm-kedi-kumu', name: 'Kedi Kumu' },
          { id: 'm-kedi-tuvaleti', name: 'Kedi Tuvaleti' }
        ]
      },
      {
        id: 'm-kedi-aksesuar',
        name: 'Aksesuar, Eğitim ve Oyuncaklar',
        children: [
          { id: 'm-kedi-oyuncak', name: 'Kedi Oyuncakları' },
          { id: 'm-tirmalama', name: 'Kedi Tırmalama Tahtası' }
        ]
      },
      {
        id: 'm-kedi-tasma-kap',
        name: 'Tasmalar, Mama ve Su Kapları',
        children: [
          { id: 'm-kedi-kap', name: 'Kedi Mama ve Su Kabı' },
          { id: 'm-su-pinari', name: 'Kedi Su Pınarı' },
          { id: 'm-kedi-tasma', name: 'Kedi Tasması' }
        ]
      },
      { id: 'm-kedi-yatak', name: 'Kedi Yatağı' },
      { id: 'm-kedi-tarak', name: 'Kedi Tarağı' },
      { id: 'm-kedi-otu', name: 'Kedi Otu' },
      { id: 'm-kedi-evi', name: 'Kedi Evi' },
      { id: 'm-kedi-sampuan', name: 'Kedi Şampuanı' },
      { id: 'm-kedi-malti', name: 'Kedi Maltı' },
      { id: 'm-vet-kedi', name: 'Veteriner Diyet Kedi Maması' }
    ]
  },
  {
    id: 'm-kopek',
    name: 'Köpek Ürünleri',
    icon: 'dog',
    children: [
      {
        id: 'm-kopek-mama',
        name: 'Köpek Maması',
        children: [
          { id: 'm-yavru-kopek', name: 'Yavru Köpek Maması' },
          { id: 'm-yetiskin-kopek', name: 'Yetişkin Köpek Maması' }
        ]
      },
      { id: 'm-kopek-konserve', name: 'Köpek Konservesi & Yaş Mama' },
      { id: 'm-kopek-odul', name: 'Köpek Ödül Maması' },
      { id: 'm-kopek-oyuncak', name: 'Köpek Oyuncakları' },
      { id: 'm-kopek-canta', name: 'Köpek Taşıma Çantası' },
      { id: 'm-kopek-kap', name: 'Köpek Mama Kabı' },
      { id: 'm-kopek-tasma', name: 'Köpek Tasmaları' },
      { id: 'm-kopek-yatak', name: 'Köpek Yatakları' },
      { id: 'm-kopek-sampuan', name: 'Köpek Şampuanı' }
    ]
  },
  {
    id: 'm-kus',
    name: 'Kuş Ürünleri',
    icon: 'bird',
    children: [
      { id: 'm-kus-yemi', name: 'Kuş Yemleri' },
      { id: 'm-muhabbet-yemi', name: 'Muhabbet Kuşu Yemi' },
      { id: 'm-kus-oyuncak', name: 'Kuş Oyuncakları' }
    ]
  },
  { id: 'm-balik', name: 'Balık ve Akvaryum Ürünleri', icon: 'fish' },
  { id: 'm-kemirgen', name: 'Kemirgen Ürünleri', icon: 'squirrel' },
  { id: 'm-surungan', name: 'Sürüngen Ürünleri', icon: 'bug' }
]

// ============================================
// PETLEBİ KATEGORİ YAPISI (RAKİP - REFERANS)
// ============================================
const PETLEBI_CATEGORIES = [
  {
    id: 'pl-kedi',
    name: 'Kedi Ürünleri',
    icon: 'cat',
    children: [
      {
        id: 'pl-kedi-mama',
        name: 'Kedi Maması',
        children: [
          { id: 'pl-kisir', name: 'Kısırlaştırılmış Kedi Maması' },
          { id: 'pl-yetiskin', name: 'Yetişkin Kedi Maması' },
          { id: 'pl-yavru', name: 'Yavru Kedi Maması' },
          { id: 'pl-light', name: 'Light Kedi Maması' },
          { id: 'pl-vet', name: 'Veteriner Diyet Maması' },
          { id: 'pl-yasli', name: 'Yaşlı Kedi Maması' },
          { id: 'pl-irk', name: 'Özel Irk Kedi Maması' }
        ]
      },
      {
        id: 'pl-konserve',
        name: 'Kedi Konserve Maması',
        children: [
          { id: 'pl-yet-kons', name: 'Yetişkin Konserve' },
          { id: 'pl-yav-kons', name: 'Yavru Konserve' },
          { id: 'pl-kis-kons', name: 'Kısır Konserve' }
        ]
      },
      {
        id: 'pl-odul',
        name: 'Kedi Ödül Maması',
        children: [
          { id: 'pl-krema', name: 'Krema' },
          { id: 'pl-taneli', name: 'Taneli' },
          { id: 'pl-cubuk', name: 'Çubuk' },
          { id: 'pl-corba', name: 'Çorba' },
          { id: 'pl-catnip', name: 'Catnipler' }
        ]
      },
      {
        id: 'pl-kum',
        name: 'Kedi Kumu',
        children: [
          { id: 'pl-bentonit', name: 'Bentonit Kumu' },
          { id: 'pl-koku', name: 'Koku Gidericiler' }
        ]
      },
      {
        id: 'pl-vitamin',
        name: 'Vitaminler',
        children: [
          { id: 'pl-macun', name: 'Macun' },
          { id: 'pl-sivi', name: 'Sıvı' },
          { id: 'pl-tablet', name: 'Tablet' },
          { id: 'pl-cim', name: 'Kedi Çimi' }
        ]
      },
      {
        id: 'pl-oyuncak',
        name: 'Kedi Oyuncağı',
        children: [
          { id: 'pl-olta', name: 'Olta' },
          { id: 'pl-top', name: 'Top' },
          { id: 'pl-fare', name: 'Fare' },
          { id: 'pl-pelus', name: 'Peluş' },
          { id: 'pl-lazer', name: 'Lazer' },
          { id: 'pl-tunel', name: 'Tünel' },
          { id: 'pl-zeka', name: 'Zeka Oyuncağı' }
        ]
      },
      {
        id: 'pl-bakim',
        name: 'Bakım ve Temizlik',
        children: [
          { id: 'pl-tuy', name: 'Tüy Bakımı' },
          { id: 'pl-dis', name: 'Diş Sağlığı' },
          { id: 'pl-tirnak', name: 'Tırnak Bakımı' },
          { id: 'pl-pire', name: 'Pire ve Kene' },
          { id: 'pl-sampuan', name: 'Şampuan' }
        ]
      },
      {
        id: 'pl-kap',
        name: 'Mama ve Su Kabı',
        children: [
          { id: 'pl-otomatik', name: 'Otomatik' },
          { id: 'pl-seramik', name: 'Seramik' },
          { id: 'pl-celik', name: 'Çelik' }
        ]
      },
      {
        id: 'pl-tuvalet',
        name: 'Kedi Tuvaleti',
        children: [
          { id: 'pl-kapali', name: 'Kapalı' },
          { id: 'pl-acik', name: 'Açık' },
          { id: 'pl-oto-tuv', name: 'Otomatik' }
        ]
      },
      { id: 'pl-tirmalama', name: 'Tırmalama Tahtası' },
      { id: 'pl-tasma', name: 'Kedi Tasması' },
      { id: 'pl-tasima', name: 'Taşıma Ekipmanları' },
      { id: 'pl-ev', name: 'Kedi Evleri ve Yatakları' }
    ]
  },
  {
    id: 'pl-kopek',
    name: 'Köpek Ürünleri',
    icon: 'dog',
    children: [
      { id: 'pl-k-mama', name: 'Köpek Maması' },
      { id: 'pl-k-odul', name: 'Köpek Ödül Maması' },
      { id: 'pl-k-konserve', name: 'Köpek Konserve' },
      { id: 'pl-k-bakim', name: 'Bakım Ürünleri' },
      { id: 'pl-k-vitamin', name: 'Vitamin' },
      { id: 'pl-k-oyuncak', name: 'Köpek Oyuncağı' },
      { id: 'pl-k-kap', name: 'Mama Kabı' },
      { id: 'pl-k-tasma', name: 'Tasma ve Kayış' },
      { id: 'pl-k-yatak', name: 'Köpek Yatağı' },
      { id: 'pl-k-tasima', name: 'Taşıma' },
      { id: 'pl-k-elbise', name: 'Köpek Elbiseleri' },
      { id: 'pl-k-egitim', name: 'Eğitim Ürünleri' },
      { id: 'pl-k-arac', name: 'Araç Ekipmanları' },
      { id: 'pl-k-bahce', name: 'Bahçe Ürünleri' }
    ]
  },
  { id: 'pl-kus', name: 'Kuş Ürünleri', icon: 'bird' },
  { id: 'pl-kemirgen', name: 'Kemirgen Ürünleri', icon: 'squirrel' }
]

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================
function flattenCategories(categories, parentPath = '', level = 0, source = 'oneri') {
  let result = []
  for (const cat of categories) {
    const fullPath = parentPath ? `${parentPath} > ${cat.name}` : cat.name
    result.push({
      ...cat,
      fullPath,
      level,
      source,
      hasChildren: cat.children && cat.children.length > 0
    })
    if (cat.children) {
      result = [...result, ...flattenCategories(cat.children, fullPath, level + 1, source)]
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
  const icons = { cat: Cat, dog: Dog, bird: Bird, fish: Fish, bug: Bug, squirrel: Squirrel, tag: Tag }
  return icons[iconName] || FolderTree
}

// ============================================
// COMPONENTS
// ============================================
function CategoryTreeItem({ category, level = 0, selectedId, onSelect, expandedIds, onToggleExpand, searchTerm, source }) {
  const hasChildren = category.children && category.children.length > 0
  const isExpanded = expandedIds.has(category.id)
  const isSelected = selectedId === category.id
  const Icon = level === 0 ? getCategoryIcon(category.icon) : FolderTree

  const matchesSearch = searchTerm
    ? category.name.toLowerCase().includes(searchTerm.toLowerCase()) || category.googleId?.includes(searchTerm)
    : true

  if (!matchesSearch && !hasChildren) return null

  const sourceColors = {
    oneri: 'text-green-600',
    mevcut: 'text-blue-600',
    petlebi: 'text-orange-600'
  }

  return (
    <div>
      <div
        className={clsx(
          "flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 cursor-pointer rounded transition-colors text-sm",
          isSelected && "bg-green-50 border-l-2 border-green-500"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => onSelect({ ...category, source })}
      >
        {hasChildren ? (
          <button onClick={(e) => { e.stopPropagation(); onToggleExpand(category.id); }} className="p-0.5 hover:bg-gray-200 rounded">
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : <span className="w-4" />}
        <Icon className={clsx("w-4 h-4", level === 0 ? sourceColors[source] || 'text-primary-600' : "text-gray-400")} />
        <span className={clsx("flex-1 truncate", matchesSearch && searchTerm ? "bg-yellow-100" : "")}>{category.name}</span>
        {category.googleId && <Badge variant="success" size="xs" className="font-mono text-[10px]">G:{category.googleId}</Badge>}
      </div>
      {isExpanded && hasChildren && (
        <div>
          {category.children.map(child => (
            <CategoryTreeItem key={child.id} category={child} level={level + 1} selectedId={selectedId} onSelect={onSelect}
              expandedIds={expandedIds} onToggleExpand={onToggleExpand} searchTerm={searchTerm} source={source} />
          ))}
        </div>
      )}
    </div>
  )
}

function CategoryDetailPanel({ category, onClose }) {
  if (!category) return null
  const breadcrumb = category.fullPath?.split(' > ') || [category.name]
  const sourceLabels = { oneri: 'Öneri', mevcut: 'Mevcut', petlebi: 'Petlebi' }
  const sourceColors = { oneri: 'bg-green-100 text-green-700', mevcut: 'bg-blue-100 text-blue-700', petlebi: 'bg-orange-100 text-orange-700' }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <Badge className={sourceColors[category.source] || 'bg-gray-100'}>{sourceLabels[category.source] || category.source}</Badge>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-2 mb-1">
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                <span className={i === breadcrumb.length - 1 ? "font-medium text-gray-700" : ""}>{item}</span>
              </span>
            ))}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-600 mb-1"><Hash className="w-4 h-4" /><span className="text-xs font-medium">ID</span></div>
          <p className="font-mono text-sm font-bold text-blue-900">{category.id}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-600 mb-1"><Link2 className="w-4 h-4" /><span className="text-xs font-medium">Google ID</span></div>
          <p className="font-mono text-sm font-bold text-green-900">{category.googleId || '-'}</p>
        </div>
      </div>
      {category.tags && category.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {category.tags.map((tag, i) => <Badge key={i} variant="secondary" size="xs">{tag}</Badge>)}
        </div>
      )}
      {category.children && category.children.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Alt Kategoriler ({category.children.length})</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {category.children.map(child => (
              <div key={child.id} className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded text-sm">
                <span>{child.name}</span>
                {child.googleId && <Badge variant="success" size="xs" className="font-mono">G:{child.googleId}</Badge>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color = 'primary', subLabel }) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600', green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600', orange: 'bg-orange-50 text-orange-600'
  }
  return (
    <div className="bg-white border rounded-lg p-3">
      <div className="flex items-center gap-2">
        <div className={clsx("p-2 rounded-lg", colorClasses[color])}><Icon className="w-4 h-4" /></div>
        <div>
          <p className="text-xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
          {subLabel && <p className="text-[10px] text-gray-400">{subLabel}</p>}
        </div>
      </div>
    </div>
  )
}

function ExportModal({ isOpen, onClose }) {
  const [format, setFormat] = useState('json')
  if (!isOpen) return null

  const handleExport = () => {
    let content = format === 'json' ? JSON.stringify(ONERI_CATEGORIES, null, 2) :
      flattenCategories(ONERI_CATEGORIES).map(c => `${'  '.repeat(c.level)}${c.name}${c.googleId ? ` (G:${c.googleId})` : ''}`).join('\n')
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `oneri-kategori-yapisi.${format}`
    a.click()
    URL.revokeObjectURL(url)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 max-w-full mx-4">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-green-600" /> Öneri Yapısını Dışarı Aktar</h3>
        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="radio" name="format" value="json" checked={format === 'json'} onChange={(e) => setFormat(e.target.value)} />
            <div><p className="font-medium">JSON Format</p><p className="text-xs text-gray-500">İkas import için</p></div>
          </label>
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="radio" name="format" value="txt" checked={format === 'txt'} onChange={(e) => setFormat(e.target.value)} />
            <div><p className="font-medium">TXT Format</p><p className="text-xs text-gray-500">Okunabilir liste</p></div>
          </label>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">İptal</button>
          <button onClick={handleExport} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">İndir</button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function CategoryBuilder() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [oneriExpanded, setOneriExpanded] = useState(new Set(['kedi', 'kopek']))
  const [mevcutExpanded, setMevcutExpanded] = useState(new Set(['m-kedi', 'm-kopek']))
  const [petlebiExpanded, setPetlebiExpanded] = useState(new Set(['pl-kedi', 'pl-kopek']))
  const [showExportModal, setShowExportModal] = useState(false)
  const [activeTab, setActiveTab] = useState('oneri') // oneri, karsilastir

  const oneriFlat = useMemo(() => flattenCategories(ONERI_CATEGORIES, '', 0, 'oneri'), [])
  const mevcutFlat = useMemo(() => flattenCategories(MEVCUT_CATEGORIES, '', 0, 'mevcut'), [])
  const petlebiFlat = useMemo(() => flattenCategories(PETLEBI_CATEGORIES, '', 0, 'petlebi'), [])

  const oneriTotal = countCategories(ONERI_CATEGORIES)
  const mevcutTotal = countCategories(MEVCUT_CATEGORIES)
  const petlebiTotal = countCategories(PETLEBI_CATEGORIES)
  const oneriWithGoogle = oneriFlat.filter(c => c.googleId).length

  const handleToggle = (setter) => (id) => {
    setter(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-green-600" />
            Kategori Oluşturucu
          </h1>
          <p className="text-gray-500 text-sm">Öneri kategori yapısı - İkas'a aktarılacak final yapı</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">
            <Download className="w-4 h-4" /> Öneri Yapısını İndir
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Sparkles} label="Öneri Yapısı" value={oneriTotal} color="green" subLabel={`${oneriWithGoogle} Google ID`} />
        <StatCard icon={Globe} label="Mevcut (Canlı)" value={mevcutTotal} color="blue" subLabel="petzzshop.com" />
        <StatCard icon={Building2} label="Petlebi (Rakip)" value={petlebiTotal} color="orange" subLabel="Referans" />
        <StatCard icon={CheckCircle2} label="Google ID Eşleşme" value={`%${Math.round(oneriWithGoogle / oneriTotal * 100)}`} color="primary" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b">
        <button onClick={() => setActiveTab('oneri')}
          className={clsx("px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
            activeTab === 'oneri' ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700")}>
          <Star className="w-4 h-4" /> Öneri Yapısı (FİNAL)
        </button>
        <button onClick={() => setActiveTab('karsilastir')}
          className={clsx("px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
            activeTab === 'karsilastir' ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700")}>
          <ArrowLeftRight className="w-4 h-4" /> Karşılaştır
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Kategori ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>

      {/* Content */}
      {activeTab === 'oneri' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 p-0">
            <CardHeader className="border-b p-3 bg-green-50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-green-600" /> ÖNERİ KATEGORİ YAPISI ({oneriTotal} kategori)
                </CardTitle>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => setOneriExpanded(new Set(oneriFlat.map(c => c.id)))} className="text-green-600 hover:underline">Tümünü Aç</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => setOneriExpanded(new Set())} className="text-green-600 hover:underline">Kapat</button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2 max-h-[600px] overflow-y-auto">
              {ONERI_CATEGORIES.map(cat => (
                <CategoryTreeItem key={cat.id} category={cat} selectedId={selectedCategory?.id} onSelect={setSelectedCategory}
                  expandedIds={oneriExpanded} onToggleExpand={handleToggle(setOneriExpanded)} searchTerm={searchTerm} source="oneri" />
              ))}
            </CardContent>
          </Card>
          <Card className="p-0">
            <CardHeader className="border-b p-3"><CardTitle className="text-sm">Kategori Detayı</CardTitle></CardHeader>
            <CardContent className="p-4">
              {selectedCategory ? <CategoryDetailPanel category={selectedCategory} onClose={() => setSelectedCategory(null)} /> :
                <div className="text-center text-gray-500 py-12">
                  <FolderTree className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p className="text-sm">Bir kategori seçin</p>
                </div>}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'karsilastir' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Öneri */}
          <Card className="p-0">
            <CardHeader className="border-b p-2 bg-green-50">
              <CardTitle className="text-xs flex items-center gap-1"><Sparkles className="w-3 h-3 text-green-600" /> ÖNERİ ({oneriTotal})</CardTitle>
            </CardHeader>
            <CardContent className="p-1 max-h-[400px] overflow-y-auto text-xs">
              {ONERI_CATEGORIES.map(cat => (
                <CategoryTreeItem key={cat.id} category={cat} selectedId={selectedCategory?.id} onSelect={setSelectedCategory}
                  expandedIds={oneriExpanded} onToggleExpand={handleToggle(setOneriExpanded)} searchTerm={searchTerm} source="oneri" />
              ))}
            </CardContent>
          </Card>
          {/* Mevcut */}
          <Card className="p-0">
            <CardHeader className="border-b p-2 bg-blue-50">
              <CardTitle className="text-xs flex items-center gap-1"><Globe className="w-3 h-3 text-blue-600" /> MEVCUT ({mevcutTotal})</CardTitle>
            </CardHeader>
            <CardContent className="p-1 max-h-[400px] overflow-y-auto text-xs">
              {MEVCUT_CATEGORIES.map(cat => (
                <CategoryTreeItem key={cat.id} category={cat} selectedId={selectedCategory?.id} onSelect={setSelectedCategory}
                  expandedIds={mevcutExpanded} onToggleExpand={handleToggle(setMevcutExpanded)} searchTerm={searchTerm} source="mevcut" />
              ))}
            </CardContent>
          </Card>
          {/* Petlebi */}
          <Card className="p-0">
            <CardHeader className="border-b p-2 bg-orange-50">
              <CardTitle className="text-xs flex items-center gap-1"><Building2 className="w-3 h-3 text-orange-600" /> PETLEBİ ({petlebiTotal})</CardTitle>
            </CardHeader>
            <CardContent className="p-1 max-h-[400px] overflow-y-auto text-xs">
              {PETLEBI_CATEGORIES.map(cat => (
                <CategoryTreeItem key={cat.id} category={cat} selectedId={selectedCategory?.id} onSelect={setSelectedCategory}
                  expandedIds={petlebiExpanded} onToggleExpand={handleToggle(setPetlebiExpanded)} searchTerm={searchTerm} source="petlebi" />
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="p-4">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-green-600" /> Öneri Yapısı Özeti</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
            <div><p className="text-2xl font-bold text-green-600">6</p><p className="text-gray-500">Ana Kategori</p></div>
            <div><p className="text-2xl font-bold text-green-600">{oneriTotal}</p><p className="text-gray-500">Toplam Kategori</p></div>
            <div><p className="text-2xl font-bold text-green-600">{oneriWithGoogle}</p><p className="text-gray-500">Google ID</p></div>
            <div><p className="text-2xl font-bold text-blue-600">+{oneriTotal - mevcutTotal}</p><p className="text-gray-500">Yeni Kategori</p></div>
            <div><p className="text-2xl font-bold text-primary-600">4</p><p className="text-gray-500">Seviye Derinlik</p></div>
            <div><p className="text-2xl font-bold text-purple-600">SEO</p><p className="text-gray-500">Optimizeli</p></div>
          </div>
        </CardContent>
      </Card>

      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
    </div>
  )
}
