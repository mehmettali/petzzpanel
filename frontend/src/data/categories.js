// ============================================
// PETZZSHOP KATEGORİ YAPISI
// CategoryProductMapping.jsx'den alınmıştır
// ============================================

export const PETZZSHOP_CATEGORIES = [
  {
    id: 'kedi',
    name: 'Kedi',
    slug: 'kedi',
    icon: '🐱',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
    description: 'Tüm kedi ürünleri',
    keywords: ['kedi', 'cat', 'kitten', 'feline'],
    children: [
      {
        id: 'kedi-mamasi',
        name: 'Kedi Maması',
        slug: 'kedi-mamasi',
        keywords: ['mama', 'food', 'yemek'],
        children: [
          {
            id: 'kuru-kedi-mamasi',
            name: 'Kuru Mama',
            slug: 'kuru-kedi-mamasi',
            children: [
              { id: 'yavru-kedi-mamasi', name: 'Yavru Kedi Maması', slug: 'yavru-kedi-mamasi', tags: ['0-12 ay', 'kitten'] },
              { id: 'yetiskin-kedi-mamasi', name: 'Yetişkin Kedi Maması', slug: 'yetiskin-kedi-mamasi', tags: ['1-7 yaş', 'adult'] },
              { id: 'yasli-kedi-mamasi', name: 'Yaşlı Kedi Maması', slug: 'yasli-kedi-mamasi', tags: ['7+ yaş', 'senior'] },
              { id: 'kisir-kedi-mamasi', name: 'Kısırlaştırılmış Kedi Maması', slug: 'kisir-kedi-mamasi', tags: ['sterilised', 'neutered'] },
              { id: 'diyet-kedi-mamasi', name: 'Diyet / Light Kedi Maması', slug: 'diyet-kedi-mamasi', tags: ['light', 'diet'] },
              { id: 'tahilsiz-kedi-mamasi', name: 'Tahılsız Kedi Maması', slug: 'tahilsiz-kedi-mamasi', tags: ['grain-free'] },
              { id: 'ozel-irk-kedi-mamasi', name: 'Irka Özel Kedi Maması', slug: 'ozel-irk-kedi-mamasi', tags: ['breed-specific'] }
            ]
          },
          {
            id: 'yas-kedi-mamasi',
            name: 'Yaş Mama',
            slug: 'yas-kedi-mamasi',
            children: [
              { id: 'pouch-mama', name: 'Pouch (Poşet) Mama', slug: 'pouch-kedi-mamasi' },
              { id: 'konserve-mama', name: 'Konserve Mama', slug: 'konserve-kedi-mamasi' },
              { id: 'yavru-yas-mama', name: 'Yavru Yaş Mama', slug: 'yavru-yas-kedi-mamasi' },
              { id: 'kisir-yas-mama', name: 'Kısır Yaş Mama', slug: 'kisir-yas-kedi-mamasi' }
            ]
          },
          { id: 'veteriner-diyet-kedi', name: 'Veteriner Diyet Mama', slug: 'veteriner-diyet-kedi-mamasi', tags: ['prescription', 'therapeutic'] }
        ]
      },
      {
        id: 'kedi-odul',
        name: 'Kedi Ödül / Atıştırmalık',
        slug: 'kedi-odul',
        keywords: ['ödül', 'treat', 'snack', 'atıştırmalık'],
        children: [
          { id: 'stick-odul', name: 'Stick Ödül', slug: 'kedi-stick-odul' },
          { id: 'pure-odul', name: 'Püre / Sıvı Ödül', slug: 'kedi-pure-odul' },
          { id: 'biskuvi-odul', name: 'Bisküvi / Kıtır Ödül', slug: 'kedi-biskuvi-odul' },
          { id: 'catnip', name: 'Catnip / Kedi Otu', slug: 'catnip-kedi-otu' }
        ]
      },
      {
        id: 'kedi-kumu',
        name: 'Kedi Kumu',
        slug: 'kedi-kumu',
        keywords: ['kum', 'litter', 'tuvalet'],
        children: [
          { id: 'bentonit-kum', name: 'Bentonit Kum', slug: 'bentonit-kedi-kumu', tags: ['topaklaşan'] },
          { id: 'silika-kum', name: 'Silika / Kristal Kum', slug: 'silika-kedi-kumu' },
          { id: 'organik-kum', name: 'Organik / Doğal Kum', slug: 'organik-kedi-kumu', tags: ['pelet', 'tofu'] }
        ]
      },
      {
        id: 'kedi-tuvalet',
        name: 'Kedi Tuvaleti',
        slug: 'kedi-tuvaleti',
        keywords: ['tuvalet', 'kabı'],
        children: [
          { id: 'kapali-tuvalet', name: 'Kapalı Tuvalet', slug: 'kapali-kedi-tuvaleti' },
          { id: 'acik-tuvalet', name: 'Açık Tuvalet', slug: 'acik-kedi-tuvaleti' },
          { id: 'otomatik-tuvalet', name: 'Otomatik Tuvalet', slug: 'otomatik-kedi-tuvaleti' },
          { id: 'tuvalet-aksesuar', name: 'Tuvalet Aksesuarları', slug: 'kedi-tuvalet-aksesuar' }
        ]
      },
      {
        id: 'kedi-saglik',
        name: 'Sağlık ve Bakım',
        slug: 'kedi-saglik-bakim',
        keywords: ['vitamin', 'şampuan', 'bakım', 'sağlık'],
        children: [
          { id: 'kedi-vitamin', name: 'Vitamin ve Takviye', slug: 'kedi-vitamin', children: [
            { id: 'malt-macun', name: 'Malt / Macun', slug: 'kedi-malt-macun' },
            { id: 'kedi-vitamini', name: 'Multivitamin', slug: 'kedi-multivitamin' },
            { id: 'kedi-sut-tozu', name: 'Yavru Süt Tozu', slug: 'yavru-kedi-sut-tozu' }
          ]},
          { id: 'pire-kene-kedi', name: 'Pire ve Kene', slug: 'kedi-pire-kene' },
          { id: 'kedi-sampuan', name: 'Şampuan', slug: 'kedi-sampuan' },
          { id: 'kedi-tuy-bakim', name: 'Tüy Bakım', slug: 'kedi-tuy-bakim' },
          { id: 'tirnak-bakim-kedi', name: 'Tırnak Bakımı', slug: 'kedi-tirnak-bakim' },
          { id: 'agiz-dis-kedi', name: 'Ağız ve Diş Bakımı', slug: 'kedi-agiz-dis-bakim' }
        ]
      },
      {
        id: 'kedi-oyuncak',
        name: 'Kedi Oyuncakları',
        slug: 'kedi-oyuncak',
        keywords: ['oyuncak', 'toy', 'oyna'],
        children: [
          { id: 'olta-oyuncak', name: 'Olta Oyuncak', slug: 'kedi-olta-oyuncak' },
          { id: 'lazer-oyuncak', name: 'Lazer Oyuncak', slug: 'kedi-lazer-oyuncak' },
          { id: 'top-oyuncak-kedi', name: 'Top Oyuncak', slug: 'kedi-top-oyuncak' },
          { id: 'tunel-kedi', name: 'Kedi Tüneli', slug: 'kedi-tuneli' },
          { id: 'zeka-oyuncak-kedi', name: 'Zeka Oyuncağı', slug: 'kedi-zeka-oyuncak' },
          { id: 'pelus-oyuncak-kedi', name: 'Peluş Oyuncak', slug: 'kedi-pelus-oyuncak' }
        ]
      },
      {
        id: 'kedi-yatak-ev',
        name: 'Yatak ve Ev',
        slug: 'kedi-yatak-ev',
        keywords: ['yatak', 'ev', 'tırmalama', 'yatağı'],
        children: [
          { id: 'kedi-yatagi', name: 'Kedi Yatağı', slug: 'kedi-yatagi' },
          { id: 'kedi-evi', name: 'Kedi Evi', slug: 'kedi-evi' },
          { id: 'tirmalama-agaci', name: 'Tırmalama Ağacı', slug: 'tirmalama-agaci' },
          { id: 'tirmalama-tahtasi', name: 'Tırmalama Tahtası', slug: 'tirmalama-tahtasi' }
        ]
      },
      {
        id: 'kedi-mama-kabi',
        name: 'Mama ve Su Kabı',
        slug: 'kedi-mama-su-kabi',
        keywords: ['mama kabı', 'su kabı', 'kap'],
        children: [
          { id: 'mama-kabi-kedi', name: 'Mama Kabı', slug: 'kedi-mama-kabi' },
          { id: 'su-kabi-kedi', name: 'Su Kabı', slug: 'kedi-su-kabi' },
          { id: 'su-pinari-kedi', name: 'Su Pınarı / Çeşme', slug: 'kedi-su-pinari' },
          { id: 'otomatik-mamalk-kedi', name: 'Otomatik Mamalık', slug: 'kedi-otomatik-mamalik' }
        ]
      },
      {
        id: 'kedi-tasima',
        name: 'Taşıma ve Seyahat',
        slug: 'kedi-tasima',
        keywords: ['taşıma', 'çanta', 'kafes', 'seyahat'],
        children: [
          { id: 'tasima-cantasi-kedi', name: 'Taşıma Çantası', slug: 'kedi-tasima-cantasi' },
          { id: 'tasima-kafesi-kedi', name: 'Taşıma Kafesi', slug: 'kedi-tasima-kafesi' },
          { id: 'kedi-arabasi', name: 'Kedi Arabası', slug: 'kedi-arabasi' }
        ]
      },
      {
        id: 'kedi-tasma',
        name: 'Tasma ve Aksesuar',
        slug: 'kedi-tasma-aksesuar',
        keywords: ['tasma', 'collar', 'aksesuar'],
        children: [
          { id: 'boyun-tasma-kedi', name: 'Boyun Tasması', slug: 'kedi-boyun-tasma' },
          { id: 'gogus-tasma-kedi', name: 'Göğüs Tasması', slug: 'kedi-gogus-tasma' },
          { id: 'kedi-kiyafet', name: 'Kedi Kıyafeti', slug: 'kedi-kiyafet' }
        ]
      }
    ]
  },
  {
    id: 'kopek',
    name: 'Köpek',
    slug: 'kopek',
    icon: '🐕',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
    description: 'Tüm köpek ürünleri',
    keywords: ['köpek', 'dog', 'puppy', 'canine'],
    children: [
      {
        id: 'kopek-mamasi',
        name: 'Köpek Maması',
        slug: 'kopek-mamasi',
        keywords: ['mama', 'food', 'yemek'],
        children: [
          {
            id: 'kuru-kopek-mamasi',
            name: 'Kuru Mama',
            slug: 'kuru-kopek-mamasi',
            children: [
              { id: 'yavru-kopek-mamasi', name: 'Yavru Köpek Maması', slug: 'yavru-kopek-mamasi', tags: ['puppy'] },
              { id: 'yetiskin-kopek-mamasi', name: 'Yetişkin Köpek Maması', slug: 'yetiskin-kopek-mamasi', tags: ['adult'] },
              { id: 'yasli-kopek-mamasi', name: 'Yaşlı Köpek Maması', slug: 'yasli-kopek-mamasi', tags: ['senior', '7+'] },
              { id: 'diyet-kopek-mamasi', name: 'Diyet / Light Köpek Maması', slug: 'diyet-kopek-mamasi' },
              { id: 'tahilsiz-kopek-mamasi', name: 'Tahılsız Köpek Maması', slug: 'tahilsiz-kopek-mamasi' },
              { id: 'buyuk-irk-kopek', name: 'Büyük Irk Köpek Maması', slug: 'buyuk-irk-kopek-mamasi', tags: ['large breed'] },
              { id: 'kucuk-irk-kopek', name: 'Küçük Irk Köpek Maması', slug: 'kucuk-irk-kopek-mamasi', tags: ['small breed'] }
            ]
          },
          {
            id: 'yas-kopek-mamasi',
            name: 'Yaş Mama',
            slug: 'yas-kopek-mamasi',
            children: [
              { id: 'pouch-kopek', name: 'Pouch (Poşet) Mama', slug: 'pouch-kopek-mamasi' },
              { id: 'konserve-kopek', name: 'Konserve Mama', slug: 'konserve-kopek-mamasi' },
              { id: 'yavru-yas-kopek', name: 'Yavru Yaş Mama', slug: 'yavru-yas-kopek-mamasi' }
            ]
          },
          { id: 'veteriner-diyet-kopek', name: 'Veteriner Diyet Mama', slug: 'veteriner-diyet-kopek-mamasi', tags: ['prescription', 'therapeutic'] }
        ]
      },
      {
        id: 'kopek-odul',
        name: 'Köpek Ödül / Atıştırmalık',
        slug: 'kopek-odul',
        keywords: ['ödül', 'treat', 'kemik', 'atıştırmalık'],
        children: [
          { id: 'kemik-odul', name: 'Kemik / Çiğneme Ödülü', slug: 'kopek-kemik-odul' },
          { id: 'stick-odul-kopek', name: 'Stick Ödül', slug: 'kopek-stick-odul' },
          { id: 'biskuvi-odul-kopek', name: 'Bisküvi Ödül', slug: 'kopek-biskuvi-odul' },
          { id: 'dogal-odul', name: 'Doğal Kurutulmuş Ödül', slug: 'kopek-dogal-odul', tags: ['işkembe', 'ciğer'] },
          { id: 'dis-sagligi-odul', name: 'Diş Sağlığı Ödülü', slug: 'kopek-dis-sagligi-odul' }
        ]
      },
      {
        id: 'kopek-saglik',
        name: 'Sağlık ve Bakım',
        slug: 'kopek-saglik-bakim',
        keywords: ['vitamin', 'şampuan', 'bakım', 'sağlık'],
        children: [
          { id: 'kopek-vitamin', name: 'Vitamin ve Takviye', slug: 'kopek-vitamin' },
          { id: 'pire-kene-kopek', name: 'Pire ve Kene', slug: 'kopek-pire-kene' },
          { id: 'kopek-sampuan', name: 'Şampuan', slug: 'kopek-sampuan' },
          { id: 'kopek-tuy-bakim', name: 'Tüy Bakım', slug: 'kopek-tuy-bakim' },
          { id: 'tirnak-bakim-kopek', name: 'Tırnak Bakımı', slug: 'kopek-tirnak-bakim' },
          { id: 'agiz-dis-kopek', name: 'Ağız ve Diş Bakımı', slug: 'kopek-agiz-dis-bakim' },
          { id: 'cis-pedi', name: 'Çiş Pedi', slug: 'kopek-cis-pedi' },
          { id: 'diski-torbasi', name: 'Dışkı Torbası', slug: 'kopek-diski-torbasi' }
        ]
      },
      {
        id: 'kopek-oyuncak',
        name: 'Köpek Oyuncakları',
        slug: 'kopek-oyuncak',
        keywords: ['oyuncak', 'toy', 'oyna'],
        children: [
          { id: 'kong-oyuncak', name: 'Kong / Kauçuk Oyuncak', slug: 'kopek-kong-oyuncak' },
          { id: 'ip-oyuncak', name: 'İp / Halat Oyuncak', slug: 'kopek-ip-oyuncak' },
          { id: 'top-oyuncak-kopek', name: 'Top / Fırlatmalık', slug: 'kopek-top-oyuncak' },
          { id: 'pelus-oyuncak-kopek', name: 'Peluş Oyuncak', slug: 'kopek-pelus-oyuncak' },
          { id: 'zeka-oyuncak-kopek', name: 'Zeka Oyuncağı', slug: 'kopek-zeka-oyuncak' }
        ]
      },
      {
        id: 'kopek-yatak-ev',
        name: 'Yatak ve Kulübe',
        slug: 'kopek-yatak-kulube',
        keywords: ['yatak', 'kulübe', 'minder'],
        children: [
          { id: 'kopek-yatagi', name: 'Köpek Yatağı', slug: 'kopek-yatagi' },
          { id: 'kopek-kulubesi', name: 'Köpek Kulübesi', slug: 'kopek-kulubesi' },
          { id: 'kopek-minderi', name: 'Köpek Minderi', slug: 'kopek-minderi' },
          { id: 'serinletici-yatak', name: 'Serinletici Yatak', slug: 'kopek-serinletici-yatak' }
        ]
      },
      {
        id: 'kopek-mama-kabi',
        name: 'Mama ve Su Kabı',
        slug: 'kopek-mama-su-kabi',
        keywords: ['mama kabı', 'su kabı', 'kap'],
        children: [
          { id: 'mama-kabi-kopek', name: 'Mama Kabı', slug: 'kopek-mama-kabi' },
          { id: 'su-kabi-kopek', name: 'Su Kabı', slug: 'kopek-su-kabi' },
          { id: 'yavas-yeme-kabi', name: 'Yavaş Yeme Kabı', slug: 'kopek-yavas-yeme-kabi' },
          { id: 'seyahat-suluk', name: 'Seyahat Suluğu', slug: 'kopek-seyahat-suluk' }
        ]
      },
      {
        id: 'kopek-tasma',
        name: 'Tasma ve Kayış',
        slug: 'kopek-tasma-kayis',
        keywords: ['tasma', 'kayış', 'collar', 'leash'],
        children: [
          { id: 'boyun-tasma-kopek', name: 'Boyun Tasması', slug: 'kopek-boyun-tasma' },
          { id: 'gogus-tasma-kopek', name: 'Göğüs Tasması', slug: 'kopek-gogus-tasma' },
          { id: 'gezdirme-kayisi', name: 'Gezdirme Kayışı', slug: 'kopek-gezdirme-kayisi' },
          { id: 'flexi-tasma', name: 'Otomatik (Flexi) Tasma', slug: 'kopek-flexi-tasma' },
          { id: 'kopek-agizligi', name: 'Köpek Ağızlığı', slug: 'kopek-agizligi' },
          { id: 'isimlik-kunye', name: 'İsimlik / Künye', slug: 'kopek-isimlik-kunye' }
        ]
      },
      {
        id: 'kopek-tasima',
        name: 'Taşıma ve Seyahat',
        slug: 'kopek-tasima',
        keywords: ['taşıma', 'çanta', 'kafes', 'seyahat'],
        children: [
          { id: 'tasima-cantasi-kopek', name: 'Taşıma Çantası', slug: 'kopek-tasima-cantasi' },
          { id: 'tasima-kafesi-kopek', name: 'Taşıma Kafesi', slug: 'kopek-tasima-kafesi' },
          { id: 'kopek-arabasi', name: 'Köpek Arabası', slug: 'kopek-arabasi' }
        ]
      },
      {
        id: 'kopek-kiyafet',
        name: 'Köpek Kıyafeti',
        slug: 'kopek-kiyafet',
        keywords: ['kıyafet', 'mont', 'kazak'],
        children: [
          { id: 'mont-yagmurluk', name: 'Mont / Yağmurluk', slug: 'kopek-mont-yagmurluk' },
          { id: 'kazak-kopek', name: 'Kazak', slug: 'kopek-kazak' },
          { id: 'kopek-ayakkabi', name: 'Köpek Ayakkabısı', slug: 'kopek-ayakkabi' }
        ]
      },
      {
        id: 'kopek-egitim',
        name: 'Eğitim Ürünleri',
        slug: 'kopek-egitim',
        keywords: ['eğitim', 'clicker', 'düdük'],
        children: [
          { id: 'egitim-clicker', name: 'Clicker', slug: 'kopek-clicker' },
          { id: 'egitim-dudugu', name: 'Eğitim Düdüğü', slug: 'kopek-egitim-dudugu' },
          { id: 'kopek-citi', name: 'Köpek Çiti', slug: 'kopek-citi' }
        ]
      }
    ]
  },
  {
    id: 'kus',
    name: 'Kuş',
    slug: 'kus',
    icon: '🐦',
    image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=300&fit=crop',
    description: 'Tüm kuş ürünleri',
    keywords: ['kuş', 'bird', 'papağan', 'muhabbet'],
    children: [
      {
        id: 'kus-yemi',
        name: 'Kuş Yemi',
        slug: 'kus-yemi',
        keywords: ['yem', 'seed', 'tohum'],
        children: [
          { id: 'muhabbet-yemi', name: 'Muhabbet Kuşu Yemi', slug: 'muhabbet-kusu-yemi' },
          { id: 'papagan-yemi', name: 'Papağan Yemi', slug: 'papagan-yemi' },
          { id: 'kanarya-yemi', name: 'Kanarya Yemi', slug: 'kanarya-yemi' },
          { id: 'yavru-kus-yemi', name: 'Yavru Kuş Yemi', slug: 'yavru-kus-yemi' }
        ]
      },
      { id: 'kus-odul', name: 'Kraker ve Ödül', slug: 'kus-kraker-odul' },
      { id: 'gaga-tasi', name: 'Gaga Taşı / Kalamar', slug: 'kus-gaga-tasi' },
      { id: 'kus-vitamin', name: 'Kuş Vitamini', slug: 'kus-vitamin' },
      {
        id: 'kus-kafes',
        name: 'Kafes ve Ekipman',
        slug: 'kus-kafes-ekipman',
        keywords: ['kafes', 'tünek'],
        children: [
          { id: 'kus-kafesi', name: 'Kuş Kafesi', slug: 'kus-kafesi' },
          { id: 'tunek', name: 'Tünek', slug: 'kus-tunek' },
          { id: 'yemlik-suluk', name: 'Yemlik ve Suluk', slug: 'kus-yemlik-suluk' },
          { id: 'kafes-altligi', name: 'Kafes Altlığı', slug: 'kus-kafes-altligi' },
          { id: 'kus-banyosu', name: 'Kuş Banyosu', slug: 'kus-banyosu' }
        ]
      },
      { id: 'kus-oyuncak', name: 'Kuş Oyuncağı', slug: 'kus-oyuncak' },
      { id: 'kus-kumu', name: 'Kuş Kumu', slug: 'kus-kumu' }
    ]
  },
  {
    id: 'balik',
    name: 'Balık ve Akvaryum',
    slug: 'balik',
    icon: '🐠',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
    description: 'Akvaryum ve balık ürünleri',
    keywords: ['balık', 'fish', 'akvaryum', 'aquarium'],
    children: [
      { id: 'balik-yemi', name: 'Balık Yemi', slug: 'balik-yemi' },
      { id: 'akvaryum', name: 'Akvaryum', slug: 'akvaryum' },
      {
        id: 'akvaryum-ekipman',
        name: 'Akvaryum Ekipmanı',
        slug: 'akvaryum-ekipman',
        keywords: ['filtre', 'ısıtıcı', 'aydınlatma'],
        children: [
          { id: 'akvaryum-filtre', name: 'Filtre', slug: 'akvaryum-filtre' },
          { id: 'hava-motoru', name: 'Hava Motoru', slug: 'akvaryum-hava-motoru' },
          { id: 'akvaryum-isitici', name: 'Isıtıcı', slug: 'akvaryum-isitici' },
          { id: 'akvaryum-aydinlatma', name: 'Aydınlatma', slug: 'akvaryum-aydinlatma' },
          { id: 'dip-supurgesi', name: 'Dip Süpürgesi', slug: 'akvaryum-dip-supurgesi' }
        ]
      },
      { id: 'su-duzenleyici', name: 'Su Düzenleyici', slug: 'akvaryum-su-duzenleyici' },
      { id: 'akvaryum-dekor', name: 'Dekorasyon', slug: 'akvaryum-dekorasyon' }
    ]
  },
  {
    id: 'kemirgen',
    name: 'Kemirgen',
    slug: 'kemirgen',
    icon: '🐹',
    image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&h=300&fit=crop',
    description: 'Hamster, tavşan ve guinea pig ürünleri',
    keywords: ['kemirgen', 'hamster', 'tavşan', 'guinea pig'],
    children: [
      {
        id: 'kemirgen-yem',
        name: 'Kemirgen Yemi',
        slug: 'kemirgen-yemi',
        keywords: ['yem', 'food'],
        children: [
          { id: 'tavsan-yemi', name: 'Tavşan Yemi', slug: 'tavsan-yemi' },
          { id: 'hamster-yemi', name: 'Hamster Yemi', slug: 'hamster-yemi' },
          { id: 'guinea-pig-yemi', name: 'Guinea Pig Yemi', slug: 'guinea-pig-yemi' },
          { id: 'kuru-ot', name: 'Kuru Ot / Yonca', slug: 'kemirgen-kuru-ot' }
        ]
      },
      { id: 'kemirme-tasi', name: 'Kemirme Taşı', slug: 'kemirgen-kemirme-tasi' },
      { id: 'kemirgen-kafes', name: 'Kafes', slug: 'kemirgen-kafes' },
      { id: 'kemirgen-talas', name: 'Talaş / Altlık', slug: 'kemirgen-talas' },
      { id: 'kemirgen-suluk', name: 'Suluk / Yemlik', slug: 'kemirgen-suluk' },
      { id: 'kemirgen-oyuncak', name: 'Oyuncak', slug: 'kemirgen-oyuncak' }
    ]
  },
  {
    id: 'surungan',
    name: 'Sürüngen',
    slug: 'surungan',
    icon: '🦎',
    image: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?w=400&h=300&fit=crop',
    description: 'Sürüngen ve amfibi ürünleri',
    keywords: ['sürüngen', 'reptile', 'kaplumbağa', 'iguana'],
    children: [
      { id: 'surungan-yemi', name: 'Sürüngen Yemi', slug: 'surungan-yemi' },
      { id: 'teraryum', name: 'Teraryum', slug: 'teraryum' },
      { id: 'teraryum-isitma', name: 'Isıtma / Aydınlatma', slug: 'teraryum-isitma' },
      { id: 'teraryum-altlik', name: 'Taban Malzemesi', slug: 'teraryum-altlik' }
    ]
  }
]

// ============================================
// HELPER FUNCTIONS
// ============================================

// Tüm kategorileri düzleştir (flat list)
export function flattenCategories(categories, parent = null, level = 0) {
  let result = []
  for (const cat of categories) {
    result.push({
      ...cat,
      parent,
      level,
      hasChildren: cat.children && cat.children.length > 0
    })
    if (cat.children) {
      result = [...result, ...flattenCategories(cat.children, cat, level + 1)]
    }
  }
  return result
}

// Slug'dan kategori bul (tüm hiyerarşide)
export function getCategoryBySlug(slug, categories = PETZZSHOP_CATEGORIES) {
  for (const cat of categories) {
    if (cat.slug === slug) {
      return { ...cat, parent: null, ancestors: [] }
    }
    if (cat.children) {
      const found = findCategoryInChildren(slug, cat.children, cat, [cat])
      if (found) return found
    }
  }
  return null
}

function findCategoryInChildren(slug, children, parent, ancestors) {
  for (const child of children) {
    if (child.slug === slug) {
      return { ...child, parent, ancestors }
    }
    if (child.children) {
      const found = findCategoryInChildren(slug, child.children, child, [...ancestors, child])
      if (found) return found
    }
  }
  return null
}

// Kategori yolunu oluştur (breadcrumb için)
export function getCategoryPath(category) {
  if (!category) return []
  const path = category.ancestors ? [...category.ancestors] : []
  if (category.parent && !path.includes(category.parent)) {
    path.push(category.parent)
  }
  path.push(category)
  return path
}

// Toplam kategori sayısı
export function countCategories(categories = PETZZSHOP_CATEGORIES) {
  let count = categories.length
  for (const cat of categories) {
    if (cat.children) {
      count += countCategories(cat.children)
    }
  }
  return count
}

// Arama keyword'leri ile eşleşen kategorileri bul
export function findCategoriesByKeyword(keyword, categories = PETZZSHOP_CATEGORIES) {
  const flat = flattenCategories(categories)
  const lowerKeyword = keyword.toLowerCase()

  return flat.filter(cat => {
    const nameMatch = cat.name.toLowerCase().includes(lowerKeyword)
    const keywordMatch = cat.keywords?.some(k => k.toLowerCase().includes(lowerKeyword))
    const tagMatch = cat.tags?.some(t => t.toLowerCase().includes(lowerKeyword))
    return nameMatch || keywordMatch || tagMatch
  })
}

// ============================================
// KATEGORİ ÜRÜN SAYILARI
// Demo veriler - gerçek sistemde API'den gelecek
// ============================================
export const CATEGORY_PRODUCT_COUNTS = {
  'kedi': 3214, 'kedi-mamasi': 1250, 'kuru-kedi-mamasi': 820, 'yavru-kedi-mamasi': 145,
  'yetiskin-kedi-mamasi': 380, 'yasli-kedi-mamasi': 65, 'kisir-kedi-mamasi': 120,
  'diyet-kedi-mamasi': 45, 'tahilsiz-kedi-mamasi': 55, 'ozel-irk-kedi-mamasi': 28,
  'yas-kedi-mamasi': 380, 'pouch-mama': 220, 'konserve-mama': 140,
  'yavru-yas-mama': 35, 'kisir-yas-mama': 25, 'veteriner-diyet-kedi': 85,
  'kedi-odul': 245, 'stick-odul': 68, 'pure-odul': 92, 'biskuvi-odul': 55, 'catnip': 30,
  'kedi-kumu': 380, 'bentonit-kum': 185, 'silika-kum': 95, 'organik-kum': 100,
  'kedi-tuvalet': 156, 'kapali-tuvalet': 65, 'acik-tuvalet': 42, 'otomatik-tuvalet': 18,
  'tuvalet-aksesuar': 31,
  'kedi-saglik': 420, 'kedi-vitamin': 125, 'malt-macun': 48, 'kedi-vitamini': 52,
  'kedi-sut-tozu': 15, 'pire-kene-kedi': 85, 'kedi-sampuan': 72,
  'kedi-tuy-bakim': 58, 'tirnak-bakim-kedi': 28, 'agiz-dis-kedi': 22,
  'kedi-oyuncak': 312, 'olta-oyuncak': 65, 'lazer-oyuncak': 28, 'top-oyuncak-kedi': 85,
  'tunel-kedi': 42, 'zeka-oyuncak-kedi': 35, 'pelus-oyuncak-kedi': 57,
  'kedi-yatak-ev': 185, 'kedi-yatagi': 68, 'kedi-evi': 45, 'tirmalama-agaci': 52, 'tirmalama-tahtasi': 20,
  'kedi-mama-kabi': 142, 'mama-kabi-kedi': 45, 'su-kabi-kedi': 32, 'su-pinari-kedi': 38,
  'otomatik-mamalk-kedi': 15,
  'kedi-tasima': 98, 'tasima-cantasi-kedi': 48, 'tasima-kafesi-kedi': 38, 'kedi-arabasi': 12,
  'kedi-tasma': 76, 'boyun-tasma-kedi': 32, 'gogus-tasma-kedi': 28, 'kedi-kiyafet': 16,

  'kopek': 3200, 'kopek-mamasi': 1180, 'kuru-kopek-mamasi': 780, 'yavru-kopek-mamasi': 125,
  'yetiskin-kopek-mamasi': 320, 'yasli-kopek-mamasi': 55, 'diyet-kopek-mamasi': 42,
  'tahilsiz-kopek-mamasi': 65, 'buyuk-irk-kopek': 85, 'kucuk-irk-kopek': 60,
  'yas-kopek-mamasi': 320, 'pouch-kopek': 180, 'konserve-kopek': 140,
  'veteriner-diyet-kopek': 95,
  'kopek-odul': 285, 'kemik-odul': 92, 'stick-odul-kopek': 68, 'biskuvi-odul-kopek': 55,
  'dogal-odul': 45, 'dis-sagligi-odul': 25,
  'kopek-saglik': 380, 'kopek-vitamin': 115, 'pire-kene-kopek': 95, 'kopek-sampuan': 82,
  'kopek-tuy-bakim': 52, 'tirnak-bakim-kopek': 22, 'agiz-dis-kopek': 28,
  'cis-pedi': 35, 'diski-torbasi': 18,
  'kopek-oyuncak': 342, 'kong-oyuncak': 85, 'ip-oyuncak': 72, 'top-oyuncak-kopek': 95,
  'pelus-oyuncak-kopek': 55, 'zeka-oyuncak-kopek': 35,
  'kopek-yatak-ev': 165, 'kopek-yatagi': 75, 'kopek-kulubesi': 42, 'kopek-minderi': 32, 'serinletici-yatak': 16,
  'kopek-mama-kabi': 128, 'mama-kabi-kopek': 38, 'su-kabi-kopek': 28, 'yavas-yeme-kabi': 22,
  'seyahat-suluk': 12,
  'kopek-tasma': 245, 'boyun-tasma-kopek': 62, 'gogus-tasma-kopek': 55, 'gezdirme-kayisi': 48,
  'flexi-tasma': 35, 'kopek-agizligi': 18, 'isimlik-kunye': 15,
  'kopek-tasima': 72, 'tasima-cantasi-kopek': 28, 'tasima-kafesi-kopek': 32, 'kopek-arabasi': 12,
  'kopek-kiyafet': 125, 'mont-yagmurluk': 55, 'kazak-kopek': 42, 'kopek-ayakkabi': 28,
  'kopek-egitim': 68, 'egitim-clicker': 18, 'egitim-dudugu': 12, 'kopek-citi': 28,

  'kus': 545, 'kus-yemi': 285, 'muhabbet-yemi': 95, 'papagan-yemi': 85, 'kanarya-yemi': 65, 'yavru-kus-yemi': 40,
  'kus-odul': 45, 'gaga-tasi': 28, 'kus-vitamin': 35,
  'kus-kafes': 125, 'kus-kafesi': 55, 'tunek': 32, 'yemlik-suluk': 22, 'kafes-altligi': 10, 'kus-banyosu': 6,
  'kus-oyuncak': 42, 'kus-kumu': 15,

  'balik': 533, 'balik-yemi': 165, 'akvaryum': 85,
  'akvaryum-ekipman': 185, 'akvaryum-filtre': 62, 'hava-motoru': 45, 'akvaryum-isitici': 32,
  'akvaryum-aydinlatma': 28, 'dip-supurgesi': 18, 'su-duzenleyici': 55, 'akvaryum-dekor': 43,

  'kemirgen': 149, 'kemirgen-yem': 68, 'tavsan-yemi': 25, 'hamster-yemi': 22, 'guinea-pig-yemi': 15, 'kuru-ot': 6,
  'kemirme-tasi': 15, 'kemirgen-kafes': 28, 'kemirgen-talas': 18, 'kemirgen-suluk': 12, 'kemirgen-oyuncak': 8,

  'surungan': 29, 'surungan-yemi': 12, 'teraryum': 8, 'teraryum-isitma': 5, 'teraryum-altlik': 4
}

// Kategori ID'sine göre ürün sayısı döndür
export function getCategoryProductCount(categoryId) {
  return CATEGORY_PRODUCT_COUNTS[categoryId] || 0
}

// ============================================
// SAMPLE PRODUCTS - Demo ürünler
// ============================================
export const SAMPLE_PRODUCTS = [
  // KEDİ MAMALARI
  {
    id: '1',
    name: 'Royal Canin Kitten Yavru Kedi Maması',
    slug: 'royal-canin-kitten-yavru-kedi-mamasi',
    brand: 'Royal Canin',
    category: 'kedi-mamasi',
    categoryPath: ['kedi', 'kedi-mamasi', 'kuru-kedi-mamasi', 'yavru-kedi-mamasi'],
    price: 1000,
    oldPrice: 1325,
    discount: 25,
    stock: 45,
    rating: 4.9,
    reviewCount: 127,
    image: 'https://cdn.royalcanin.com/content/dam/rcmedia/products/kitten/packshot/FHN-Kitten-CV-EretailKit.png',
    images: ['https://cdn.royalcanin.com/content/dam/rcmedia/products/kitten/packshot/FHN-Kitten-CV-EretailKit.png'],
    badges: ['Hızlı Kargo', 'Orijinal'],
    variant: '2 Kg',
    variants: [
      { id: 'v1', name: '400 Gr', price: 285, oldPrice: 350, stock: 15 },
      { id: 'v2', name: '2 Kg', price: 1000, oldPrice: 1325, stock: 8 },
      { id: 'v3', name: '4 Kg', price: 1850, oldPrice: 2400, stock: 5 },
      { id: 'v4', name: '10 Kg', price: 4200, oldPrice: 5500, stock: 3 }
    ]
  },
  {
    id: '2',
    name: 'Pro Plan Adult Tavuklu Yetişkin Kedi Maması',
    slug: 'pro-plan-adult-tavuklu-yetiskin-kedi-mamasi',
    brand: 'Pro Plan',
    category: 'kedi-mamasi',
    categoryPath: ['kedi', 'kedi-mamasi', 'kuru-kedi-mamasi', 'yetiskin-kedi-mamasi'],
    price: 875,
    oldPrice: 1100,
    discount: 20,
    stock: 32,
    rating: 4.7,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop',
    badges: ['Kampanya'],
    variant: '1.5 Kg'
  },
  {
    id: '3',
    name: 'Whiskas Tavuklu Yetişkin Kedi Maması',
    slug: 'whiskas-tavuklu-yetiskin-kedi-mamasi',
    brand: 'Whiskas',
    category: 'kedi-mamasi',
    categoryPath: ['kedi', 'kedi-mamasi', 'kuru-kedi-mamasi', 'yetiskin-kedi-mamasi'],
    price: 245,
    oldPrice: 299,
    discount: 18,
    stock: 120,
    rating: 4.3,
    reviewCount: 245,
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=400&fit=crop',
    badges: ['Çok Satan'],
    variant: '1.4 Kg'
  },
  {
    id: '4',
    name: 'Acana Pacifica Tahılsız Kedi Maması',
    slug: 'acana-pacifica-tahilsiz-kedi-mamasi',
    brand: 'Acana',
    category: 'kedi-mamasi',
    categoryPath: ['kedi', 'kedi-mamasi', 'kuru-kedi-mamasi', 'tahilsiz-kedi-mamasi'],
    price: 2150,
    oldPrice: 2650,
    discount: 19,
    stock: 8,
    rating: 4.95,
    reviewCount: 42,
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop',
    badges: ['Premium', 'Tahılsız'],
    variant: '1.8 Kg'
  },
  {
    id: '5',
    name: 'Hills Science Plan Kısır Kedi Maması',
    slug: 'hills-science-plan-kisir-kedi-mamasi',
    brand: 'Hills',
    category: 'kedi-mamasi',
    categoryPath: ['kedi', 'kedi-mamasi', 'kuru-kedi-mamasi', 'kisir-kedi-mamasi'],
    price: 1450,
    oldPrice: 1750,
    discount: 17,
    stock: 22,
    rating: 4.8,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&h=400&fit=crop',
    badges: ['Veteriner Önerisi'],
    variant: '3 Kg'
  },
  // KEDİ YAŞ MAMA
  {
    id: '6',
    name: 'Felix Sensations Jellies Çeşitli Lezzetler 12li Paket',
    slug: 'felix-sensations-jellies-cesitli-lezzetler-12li',
    brand: 'Felix',
    category: 'yas-kedi-mamasi',
    categoryPath: ['kedi', 'kedi-mamasi', 'yas-kedi-mamasi', 'pouch-mama'],
    price: 285,
    oldPrice: 360,
    discount: 21,
    stock: 65,
    rating: 4.6,
    reviewCount: 312,
    image: 'https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=400&h=400&fit=crop',
    badges: ['12li Paket', 'Ekonomik'],
    variant: '12x85 Gr'
  },
  {
    id: '7',
    name: 'Gourmet Gold Mousse Tavuklu 85gr',
    slug: 'gourmet-gold-mousse-tavuklu-85gr',
    brand: 'Gourmet',
    category: 'yas-kedi-mamasi',
    categoryPath: ['kedi', 'kedi-mamasi', 'yas-kedi-mamasi', 'konserve-mama'],
    price: 42,
    oldPrice: 55,
    discount: 24,
    stock: 200,
    rating: 4.5,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400&h=400&fit=crop',
    badges: [],
    variant: '85 Gr'
  },
  // KEDİ KUMU
  {
    id: '8',
    name: 'Ever Clean Extra Strong Clumping Kedi Kumu',
    slug: 'ever-clean-extra-strong-clumping-kedi-kumu',
    brand: 'Ever Clean',
    category: 'kedi-kumu',
    categoryPath: ['kedi', 'kedi-kumu', 'bentonit-kum'],
    price: 495,
    oldPrice: 620,
    discount: 20,
    stock: 55,
    rating: 4.9,
    reviewCount: 423,
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop',
    badges: ['En Çok Satan', 'Kokusuz'],
    variant: '10 Lt'
  },
  {
    id: '9',
    name: 'Catsan Hygiene Plus Kedi Kumu',
    slug: 'catsan-hygiene-plus-kedi-kumu',
    brand: 'Catsan',
    category: 'kedi-kumu',
    categoryPath: ['kedi', 'kedi-kumu', 'silika-kum'],
    price: 165,
    oldPrice: 199,
    discount: 17,
    stock: 85,
    rating: 4.4,
    reviewCount: 267,
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop',
    badges: ['Silika'],
    variant: '5 Lt'
  },
  // KEDİ OYUNCAK
  {
    id: '10',
    name: 'Trixie Kedi Olta Oyuncağı Tüylü',
    slug: 'trixie-kedi-olta-oyuncagi-tuylu',
    brand: 'Trixie',
    category: 'kedi-oyuncak',
    categoryPath: ['kedi', 'kedi-oyuncak', 'olta-oyuncak'],
    price: 89,
    oldPrice: 120,
    discount: 26,
    stock: 42,
    rating: 4.7,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400&h=400&fit=crop',
    badges: ['Popüler'],
    variant: 'Standart'
  },
  {
    id: '11',
    name: 'Catit Play Lazer Oyuncak',
    slug: 'catit-play-lazer-oyuncak',
    brand: 'Catit',
    category: 'kedi-oyuncak',
    categoryPath: ['kedi', 'kedi-oyuncak', 'lazer-oyuncak'],
    price: 185,
    oldPrice: 240,
    discount: 23,
    stock: 18,
    rating: 4.5,
    reviewCount: 78,
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop',
    badges: ['Pilli'],
    variant: '1 Adet'
  },
  // KEDİ YATAK / TIRMALAMA
  {
    id: '12',
    name: 'Trixie Valencia Tırmalama Ağacı 71cm',
    slug: 'trixie-valencia-tirmalama-agaci-71cm',
    brand: 'Trixie',
    category: 'kedi-yatak-ev',
    categoryPath: ['kedi', 'kedi-yatak-ev', 'tirmalama-agaci'],
    price: 1250,
    oldPrice: 1600,
    discount: 22,
    stock: 12,
    rating: 4.8,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=400&h=400&fit=crop',
    badges: ['Çok Katlı'],
    variant: '71 cm'
  },
  // KÖPEK MAMALARI
  {
    id: '13',
    name: 'Royal Canin Maxi Adult Büyük Irk Köpek Maması',
    slug: 'royal-canin-maxi-adult-buyuk-irk-kopek-mamasi',
    brand: 'Royal Canin',
    category: 'kopek-mamasi',
    categoryPath: ['kopek', 'kopek-mamasi', 'kuru-kopek-mamasi', 'buyuk-irk-kopek'],
    price: 2850,
    oldPrice: 3500,
    discount: 19,
    stock: 25,
    rating: 4.9,
    reviewCount: 234,
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
    badges: ['Büyük Irk', 'Orijinal'],
    variant: '15 Kg'
  },
  {
    id: '14',
    name: 'Pro Plan Medium Adult Tavuklu Köpek Maması',
    slug: 'pro-plan-medium-adult-tavuklu-kopek-mamasi',
    brand: 'Pro Plan',
    category: 'kopek-mamasi',
    categoryPath: ['kopek', 'kopek-mamasi', 'kuru-kopek-mamasi', 'yetiskin-kopek-mamasi'],
    price: 1650,
    oldPrice: 2100,
    discount: 21,
    stock: 18,
    rating: 4.7,
    reviewCount: 167,
    image: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=400&h=400&fit=crop',
    badges: ['Tavuklu'],
    variant: '7.5 Kg'
  },
  {
    id: '15',
    name: 'Pedigree Yetişkin Köpek Maması Biftekli',
    slug: 'pedigree-yetiskin-kopek-mamasi-biftekli',
    brand: 'Pedigree',
    category: 'kopek-mamasi',
    categoryPath: ['kopek', 'kopek-mamasi', 'kuru-kopek-mamasi', 'yetiskin-kopek-mamasi'],
    price: 485,
    oldPrice: 599,
    discount: 19,
    stock: 75,
    rating: 4.4,
    reviewCount: 312,
    image: 'https://images.unsplash.com/photo-1534351450181-ea9f78427fe8?w=400&h=400&fit=crop',
    badges: ['Ekonomik'],
    variant: '3 Kg'
  },
  {
    id: '16',
    name: 'Acana Heritage Adult Dog Tahılsız',
    slug: 'acana-heritage-adult-dog-tahilsiz',
    brand: 'Acana',
    category: 'kopek-mamasi',
    categoryPath: ['kopek', 'kopek-mamasi', 'kuru-kopek-mamasi', 'tahilsiz-kopek-mamasi'],
    price: 3200,
    oldPrice: 3900,
    discount: 18,
    stock: 8,
    rating: 4.95,
    reviewCount: 56,
    image: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=400&h=400&fit=crop',
    badges: ['Premium', 'Tahılsız'],
    variant: '6 Kg'
  },
  // KÖPEK ÖDÜL
  {
    id: '17',
    name: 'Pedigree Dentastix Diş Sağlığı Ödülü 7li',
    slug: 'pedigree-dentastix-dis-sagligi-odulu-7li',
    brand: 'Pedigree',
    category: 'kopek-odul',
    categoryPath: ['kopek', 'kopek-odul', 'dis-sagligi-odul'],
    price: 125,
    oldPrice: 159,
    discount: 21,
    stock: 95,
    rating: 4.6,
    reviewCount: 423,
    image: 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=400&h=400&fit=crop',
    badges: ['Diş Sağlığı'],
    variant: '7 Adet'
  },
  {
    id: '18',
    name: 'Trixie Premio Tavuklu Kemik Ödül 100gr',
    slug: 'trixie-premio-tavuklu-kemik-odul-100gr',
    brand: 'Trixie',
    category: 'kopek-odul',
    categoryPath: ['kopek', 'kopek-odul', 'kemik-odul'],
    price: 85,
    oldPrice: 110,
    discount: 23,
    stock: 68,
    rating: 4.5,
    reviewCount: 189,
    image: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=400&h=400&fit=crop',
    badges: ['Doğal'],
    variant: '100 Gr'
  },
  // KÖPEK TASMA
  {
    id: '19',
    name: 'Flexi New Classic Otomatik Tasma 5m',
    slug: 'flexi-new-classic-otomatik-tasma-5m',
    brand: 'Flexi',
    category: 'kopek-tasma',
    categoryPath: ['kopek', 'kopek-tasma', 'flexi-tasma'],
    price: 385,
    oldPrice: 480,
    discount: 20,
    stock: 35,
    rating: 4.8,
    reviewCount: 267,
    image: 'https://images.unsplash.com/photo-1601758065893-25c11bfa69b5?w=400&h=400&fit=crop',
    badges: ['Otomatik', 'Dayanıklı'],
    variant: 'M - 5m'
  },
  {
    id: '20',
    name: 'Julius K9 IDC Göğüs Tasması',
    slug: 'julius-k9-idc-gogus-tasmasi',
    brand: 'Julius K9',
    category: 'kopek-tasma',
    categoryPath: ['kopek', 'kopek-tasma', 'gogus-tasma-kopek'],
    price: 650,
    oldPrice: 800,
    discount: 19,
    stock: 22,
    rating: 4.9,
    reviewCount: 178,
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&h=400&fit=crop',
    badges: ['Profesyonel'],
    variant: 'Size 1'
  },
  // KÖPEK OYUNCAK
  {
    id: '21',
    name: 'Kong Classic Kırmızı Köpek Oyuncağı',
    slug: 'kong-classic-kirmizi-kopek-oyuncagi',
    brand: 'Kong',
    category: 'kopek-oyuncak',
    categoryPath: ['kopek', 'kopek-oyuncak', 'kong-oyuncak'],
    price: 285,
    oldPrice: 350,
    discount: 19,
    stock: 42,
    rating: 4.9,
    reviewCount: 312,
    image: 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=400&h=400&fit=crop',
    badges: ['Dayanıklı', 'Ödül Doldurulabilir'],
    variant: 'Medium'
  },
  // KUŞ ÜRÜNLERİ
  {
    id: '22',
    name: 'Trill Muhabbet Kuşu Yemi Premium',
    slug: 'trill-muhabbet-kusu-yemi-premium',
    brand: 'Trill',
    category: 'kus-yemi',
    categoryPath: ['kus', 'kus-yemi', 'muhabbet-yemi'],
    price: 125,
    oldPrice: 155,
    discount: 19,
    stock: 85,
    rating: 4.6,
    reviewCount: 145,
    image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=400&fit=crop',
    badges: ['Vitaminli'],
    variant: '500 Gr'
  },
  {
    id: '23',
    name: 'Vitakraft Kracker Ballı Muhabbet Krakerı 3lü',
    slug: 'vitakraft-kracker-balli-muhabbet-krakeri-3lu',
    brand: 'Vitakraft',
    category: 'kus',
    categoryPath: ['kus', 'kus-odul'],
    price: 65,
    oldPrice: 85,
    discount: 24,
    stock: 120,
    rating: 4.5,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1606567595334-d39972c85dfd?w=400&h=400&fit=crop',
    badges: ['3lü Paket'],
    variant: '3 Adet'
  },
  // BALIK ÜRÜNLERİ
  {
    id: '24',
    name: 'Tetra Min Tropikal Balık Yemi',
    slug: 'tetra-min-tropikal-balik-yemi',
    brand: 'Tetra',
    category: 'balik-yemi',
    categoryPath: ['balik', 'balik-yemi'],
    price: 185,
    oldPrice: 230,
    discount: 20,
    stock: 55,
    rating: 4.7,
    reviewCount: 178,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop',
    badges: ['En Popüler'],
    variant: '100 Gr'
  },
  {
    id: '25',
    name: 'Eheim Classic 250 Dış Filtre',
    slug: 'eheim-classic-250-dis-filtre',
    brand: 'Eheim',
    category: 'akvaryum-ekipman',
    categoryPath: ['balik', 'akvaryum-ekipman', 'akvaryum-filtre'],
    price: 2450,
    oldPrice: 2900,
    discount: 16,
    stock: 8,
    rating: 4.9,
    reviewCount: 67,
    image: 'https://images.unsplash.com/photo-1520301255226-bf5f144451c1?w=400&h=400&fit=crop',
    badges: ['Profesyonel', 'Sessiz'],
    variant: '250 Lt'
  },
  // KEMİRGEN ÜRÜNLERİ
  {
    id: '26',
    name: 'Vitakraft Menu Vital Hamster Yemi',
    slug: 'vitakraft-menu-vital-hamster-yemi',
    brand: 'Vitakraft',
    category: 'kemirgen-yem',
    categoryPath: ['kemirgen', 'kemirgen-yem', 'hamster-yemi'],
    price: 145,
    oldPrice: 180,
    discount: 19,
    stock: 45,
    rating: 4.6,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&h=400&fit=crop',
    badges: ['Vitaminli'],
    variant: '400 Gr'
  },
  {
    id: '27',
    name: 'Versele-Laga Complete Tavşan Yemi',
    slug: 'versele-laga-complete-tavsan-yemi',
    brand: 'Versele-Laga',
    category: 'kemirgen-yem',
    categoryPath: ['kemirgen', 'kemirgen-yem', 'tavsan-yemi'],
    price: 195,
    oldPrice: 245,
    discount: 20,
    stock: 32,
    rating: 4.7,
    reviewCount: 56,
    image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=400&fit=crop',
    badges: ['Premium'],
    variant: '500 Gr'
  },
  // KEDİ SAĞLIK
  {
    id: '28',
    name: 'GimCat Malt-Soft Paste Kedi Macunu 100gr',
    slug: 'gimcat-malt-soft-paste-kedi-macunu-100gr',
    brand: 'GimCat',
    category: 'kedi-saglik',
    categoryPath: ['kedi', 'kedi-saglik', 'kedi-vitamin', 'malt-macun'],
    price: 125,
    oldPrice: 159,
    discount: 21,
    stock: 78,
    rating: 4.8,
    reviewCount: 234,
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop',
    badges: ['Tüy Yumağı Önleyici'],
    variant: '100 Gr'
  },
  {
    id: '29',
    name: 'Frontline Plus Kedi Pire Kene Damlası 3lü',
    slug: 'frontline-plus-kedi-pire-kene-damlasi-3lu',
    brand: 'Frontline',
    category: 'kedi-saglik',
    categoryPath: ['kedi', 'kedi-saglik', 'pire-kene-kedi'],
    price: 485,
    oldPrice: 599,
    discount: 19,
    stock: 42,
    rating: 4.9,
    reviewCount: 312,
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop',
    badges: ['3 Ay Koruma', 'Veteriner Önerisi'],
    variant: '3 Pipet'
  },
  // KÖPEK SAĞLIK
  {
    id: '30',
    name: 'Advantix Köpek Pire Kene Damlası 10-25kg',
    slug: 'advantix-kopek-pire-kene-damlasi-10-25kg',
    brand: 'Advantix',
    category: 'kopek-saglik',
    categoryPath: ['kopek', 'kopek-saglik', 'pire-kene-kopek'],
    price: 550,
    oldPrice: 680,
    discount: 19,
    stock: 38,
    rating: 4.9,
    reviewCount: 245,
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
    badges: ['4 Pipet', 'Sivrisinek Koruması'],
    variant: '10-25 Kg'
  },
  // DAHA FAZLA KATEGORİ ÜRÜNLERİ
  {
    id: '31',
    name: 'Catit Flower Kedi Su Pınarı 3Lt',
    slug: 'catit-flower-kedi-su-pinari-3lt',
    brand: 'Catit',
    category: 'kedi-mama-kabi',
    categoryPath: ['kedi', 'kedi-mama-kabi', 'su-pinari-kedi'],
    price: 650,
    oldPrice: 800,
    discount: 19,
    stock: 25,
    rating: 4.8,
    reviewCount: 189,
    image: 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=400&h=400&fit=crop',
    badges: ['Çiçek Tasarım', 'Filtreli'],
    variant: '3 Lt'
  },
  {
    id: '32',
    name: 'Stefanplast Cathy Kapalı Kedi Tuvaleti',
    slug: 'stefanplast-cathy-kapali-kedi-tuvaleti',
    brand: 'Stefanplast',
    category: 'kedi-tuvalet',
    categoryPath: ['kedi', 'kedi-tuvalet', 'kapali-tuvalet'],
    price: 485,
    oldPrice: 599,
    discount: 19,
    stock: 18,
    rating: 4.7,
    reviewCount: 145,
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop',
    badges: ['Filtreli', 'Koku Önleyici'],
    variant: 'Standart'
  },
  {
    id: '33',
    name: 'Ferplast Atlas 20 Kedi Taşıma Çantası',
    slug: 'ferplast-atlas-20-kedi-tasima-cantasi',
    brand: 'Ferplast',
    category: 'kedi-tasima',
    categoryPath: ['kedi', 'kedi-tasima', 'tasima-kafesi-kedi'],
    price: 385,
    oldPrice: 480,
    discount: 20,
    stock: 22,
    rating: 4.6,
    reviewCount: 112,
    image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=400&fit=crop',
    badges: ['IATA Onaylı'],
    variant: '10 Kg\'a Kadar'
  },
  {
    id: '34',
    name: 'Trixie Catnip Kedi Otu 20gr',
    slug: 'trixie-catnip-kedi-otu-20gr',
    brand: 'Trixie',
    category: 'kedi-odul',
    categoryPath: ['kedi', 'kedi-odul', 'catnip'],
    price: 45,
    oldPrice: 60,
    discount: 25,
    stock: 95,
    rating: 4.5,
    reviewCount: 267,
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop',
    badges: ['Doğal'],
    variant: '20 Gr'
  },
  {
    id: '35',
    name: 'Inaba Churu Kedi Sıvı Ödül Tavuklu 4lü',
    slug: 'inaba-churu-kedi-sivi-odul-tavuklu-4lu',
    brand: 'Inaba',
    category: 'kedi-odul',
    categoryPath: ['kedi', 'kedi-odul', 'pure-odul'],
    price: 85,
    oldPrice: 110,
    discount: 23,
    stock: 125,
    rating: 4.9,
    reviewCount: 389,
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=400&fit=crop',
    badges: ['Japon Yapımı', 'Çok Satan'],
    variant: '4x14 Gr'
  },
  // KÖPEK YATAK
  {
    id: '36',
    name: 'Trixie Bendson Köpek Yatağı 80cm',
    slug: 'trixie-bendson-kopek-yatagi-80cm',
    brand: 'Trixie',
    category: 'kopek-yatak-ev',
    categoryPath: ['kopek', 'kopek-yatak-ev', 'kopek-yatagi'],
    price: 750,
    oldPrice: 950,
    discount: 21,
    stock: 15,
    rating: 4.7,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
    badges: ['Ortopedik', 'Yıkanabilir'],
    variant: '80x60 cm'
  },
  // SÜRüNGEN
  {
    id: '37',
    name: 'Exo Terra Kaplumbağa Yemi 250gr',
    slug: 'exo-terra-kaplumbaga-yemi-250gr',
    brand: 'Exo Terra',
    category: 'surungan-yemi',
    categoryPath: ['surungan', 'surungan-yemi'],
    price: 145,
    oldPrice: 180,
    discount: 19,
    stock: 28,
    rating: 4.6,
    reviewCount: 45,
    image: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?w=400&h=400&fit=crop',
    badges: ['Kalsiyumlu'],
    variant: '250 Gr'
  },
  {
    id: '38',
    name: 'Zoo Med Repti Basking Spot Lamba 75W',
    slug: 'zoo-med-repti-basking-spot-lamba-75w',
    brand: 'Zoo Med',
    category: 'teraryum-isitma',
    categoryPath: ['surungan', 'teraryum-isitma'],
    price: 285,
    oldPrice: 350,
    discount: 19,
    stock: 12,
    rating: 4.8,
    reviewCount: 34,
    image: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?w=400&h=400&fit=crop',
    badges: ['UVA/UVB'],
    variant: '75W'
  },
  // MAMA KABI
  {
    id: '39',
    name: 'Trixie Yükseltilmiş Köpek Mama Kabı Seti',
    slug: 'trixie-yukseltilmis-kopek-mama-kabi-seti',
    brand: 'Trixie',
    category: 'kopek-mama-kabi',
    categoryPath: ['kopek', 'kopek-mama-kabi', 'mama-kabi-kopek'],
    price: 385,
    oldPrice: 480,
    discount: 20,
    stock: 22,
    rating: 4.7,
    reviewCount: 78,
    image: 'https://images.unsplash.com/photo-1601758065893-25c11bfa69b5?w=400&h=400&fit=crop',
    badges: ['Yükseltilmiş', 'Paslanmaz Çelik'],
    variant: '2x1.8 Lt'
  },
  {
    id: '40',
    name: 'Outward Hound Fun Feeder Yavaş Yeme Kabı',
    slug: 'outward-hound-fun-feeder-yavas-yeme-kabi',
    brand: 'Outward Hound',
    category: 'kopek-mama-kabi',
    categoryPath: ['kopek', 'kopek-mama-kabi', 'yavas-yeme-kabi'],
    price: 285,
    oldPrice: 360,
    discount: 21,
    stock: 35,
    rating: 4.8,
    reviewCount: 156,
    image: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=400&h=400&fit=crop',
    badges: ['Sindirim Dostu', 'BPA Free'],
    variant: 'Large'
  }
]

// Kategori slug'ına göre ürünleri filtrele
export function getProductsByCategory(categorySlug, limit = 24) {
  if (!categorySlug) return SAMPLE_PRODUCTS.slice(0, limit)

  return SAMPLE_PRODUCTS.filter(product => {
    // Direkt kategori eşleşmesi
    if (product.category === categorySlug) return true
    // CategoryPath içinde eşleşme
    if (product.categoryPath?.includes(categorySlug)) return true
    return false
  }).slice(0, limit)
}

// Arama ile ürün bul
export function searchProducts(query, limit = 24) {
  if (!query) return SAMPLE_PRODUCTS.slice(0, limit)

  const lowerQuery = query.toLowerCase()
  return SAMPLE_PRODUCTS.filter(product => {
    return (
      product.name.toLowerCase().includes(lowerQuery) ||
      product.brand.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery)
    )
  }).slice(0, limit)
}

// Markaya göre ürünleri filtrele
export function getProductsByBrand(brand, limit = 24) {
  if (!brand) return SAMPLE_PRODUCTS.slice(0, limit)

  return SAMPLE_PRODUCTS.filter(product =>
    product.brand.toLowerCase() === brand.toLowerCase()
  ).slice(0, limit)
}

// Tüm markaları getir
export function getAllBrands() {
  const brands = [...new Set(SAMPLE_PRODUCTS.map(p => p.brand))]
  return brands.sort()
}

// Slug'dan ürün bul
export function getProductBySlug(slug) {
  return SAMPLE_PRODUCTS.find(p => p.slug === slug) || null
}

export default PETZZSHOP_CATEGORIES
