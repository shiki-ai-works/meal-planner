export const APP_NAME = '完全栄養ランダム献立達人'
export const LEGAL_LAST_UPDATED = '2026-05-25'

export const legalLinks = [
  { href: '/legal/terms', label: '利用規約' },
  { href: '/legal/privacy', label: 'プライバシー' },
  { href: '/legal/attributions', label: '画像クレジット' },
] as const

export type ImageAttributionFit = 'exact' | 'close' | 'representative'

export interface ImageAttribution {
  recipe: string
  sourcePageUrl: string
  author: string
  license: string
  fit: ImageAttributionFit
}

export const imageAttributions: ImageAttribution[] = [
  {
    recipe: '納豆ご飯',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Natto_on_rice.jpg',
    author: 'Shades0404',
    license: 'CC BY 2.5',
    fit: 'exact',
  },
  {
    recipe: '卵かけご飯',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Tamagokake-gohan_001.jpg',
    author: 'Ocdp',
    license: 'CC0 1.0',
    fit: 'exact',
  },
  {
    recipe: 'トースト＋目玉焼き＋サラダ',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Fancy_Toast_(Unsplash).jpg',
    author: 'See Wikimedia Commons file page',
    license: 'See Wikimedia Commons file page',
    fit: 'close',
  },
  {
    recipe: 'オートミール粥',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Oatmeal_porridge_with_fruits_4.jpg',
    author: 'Shisma',
    license: 'CC BY 4.0',
    fit: 'exact',
  },
  {
    recipe: '味噌汁＋焼き鮭＋ご飯',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Breakfast_of_grilled_salmon,_miso_soup_and_rice_by_jetalone.jpg',
    author: 'Hajime NAKANO / jetalone',
    license: 'CC BY 2.0',
    fit: 'exact',
  },
  {
    recipe: 'ヨーグルトパフェ',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Yogurt_parfait_with_granola_and_blueberries_in_shot_glasses_with_silverware_spoons_(17098581522).jpg',
    author: 'See Wikimedia Commons file page',
    license: 'See Wikimedia Commons file page',
    fit: 'exact',
  },
  {
    recipe: 'フレンチトースト',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:00_French_Toast.jpg',
    author: 'Ralph Daily',
    license: 'CC BY 2.0',
    fit: 'exact',
  },
  {
    recipe: '豆腐と野菜の炒め定食',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Crispy_Tofu_-_Stir_Fry_by_CK_2025-04-06.jpg',
    author: 'Andy Li',
    license: 'CC0 1.0',
    fit: 'close',
  },
  {
    recipe: '鶏の唐揚げ定食',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Karaage-teishoku_of_Yoshinoya.jpg',
    author: '毒島みるく',
    license: 'CC0 1.0',
    fit: 'exact',
  },
  {
    recipe: '豚肉と野菜の生姜焼き定食',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Shogayaki_002.jpg',
    author: 'Ocdp',
    license: 'CC0 1.0',
    fit: 'exact',
  },
  {
    recipe: '鮭のムニエル定食',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Sole_meuniere_(4689490702).jpg',
    author: 'Jay Cross',
    license: 'CC BY 2.0',
    fit: 'close',
  },
  {
    recipe: '豚汁定食',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Butajiru_by_kina3.jpg',
    author: 'See Wikimedia Commons file page',
    license: 'See Wikimedia Commons file page',
    fit: 'exact',
  },
  {
    recipe: '冷やし中華',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Hiyashi_chuka_by_k14.jpg',
    author: 'k14',
    license: 'CC BY-SA 2.0',
    fit: 'exact',
  },
  {
    recipe: 'カレーライス',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Beef_curry_rice_003.jpg',
    author: 'Ocdp',
    license: 'CC0 1.0',
    fit: 'exact',
  },
  {
    recipe: 'パスタ ナポリタン',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Spaghetti_alle_vongole_napolitano.JPG',
    author: 'See Wikimedia Commons file page',
    license: 'See Wikimedia Commons file page',
    fit: 'close',
  },
  {
    recipe: '蒸し鶏の冷やしうどん',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Cold_Udon_with_Plum_and_Seaweed_at_Muguinb%C5%8D,_Shinagawa_Kitchen_(20230801172642).jpg',
    author: 'See Wikimedia Commons file page',
    license: 'See Wikimedia Commons file page',
    fit: 'close',
  },
  {
    recipe: '麻婆豆腐定食',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Mapo_tofu.JPG',
    author: 'Yaoleilei',
    license: 'CC BY-SA 2.0',
    fit: 'exact',
  },
  {
    recipe: '肉じゃが',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Nikujaga_by_Takeshi_aka_Momotaro.jpg',
    author: 'Takeshi aka. Momotaro',
    license: 'CC BY 2.0',
    fit: 'exact',
  },
  {
    recipe: 'ハンバーグ（デミグラスソース）',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Hamburg-Steak.jpg',
    author: 'MaedaAkihiko',
    license: 'CC BY-SA 4.0',
    fit: 'close',
  },
  {
    recipe: '白身魚の煮付け',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Kinmedai_Nizakana.JPG',
    author: 'Bruecke-Osteuropa',
    license: 'CC0 1.0',
    fit: 'exact',
  },
  {
    recipe: '豚の角煮',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Kakuni_by_Kanko.jpg',
    author: 'Kanko',
    license: 'CC BY 2.0',
    fit: 'exact',
  },
  {
    recipe: '鶏のトマト煮込み',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Chicken_stew_with_mixed_vegetables.jpg',
    author: 'FBenjr123',
    license: 'CC BY-SA 4.0',
    fit: 'close',
  },
  {
    recipe: 'さばの味噌煮',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Miso_Saba.jpg',
    author: 'Darjeelin / 권재원',
    license: 'CC BY-SA 4.0',
    fit: 'exact',
  },
  {
    recipe: '野菜たっぷり豚汁＋焼き魚',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Breakfast_of_grilled_salmon,_miso_soup_and_rice_by_jetalone.jpg',
    author: 'Hajime NAKANO / jetalone',
    license: 'CC BY 2.0',
    fit: 'close',
  },
  {
    recipe: 'ペペロンチーノ',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Peperoncino.jpg',
    author: 'Akahito Yamabe',
    license: 'CC0 1.0',
    fit: 'exact',
  },
  {
    recipe: '親子丼',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Oyakodon_003.jpg',
    author: 'See Wikimedia Commons file page',
    license: 'See Wikimedia Commons file page',
    fit: 'exact',
  },
  {
    recipe: '牛丼',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Gyudon-withegg-top.jpg',
    author: 'Nesnad',
    license: 'CC BY-SA 3.0',
    fit: 'exact',
  },
  {
    recipe: 'ぶり大根',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Buri-daikon_002.jpg',
    author: 'See Wikimedia Commons file page',
    license: 'See Wikimedia Commons file page',
    fit: 'exact',
  },
  {
    recipe: 'えびチリ',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Ebi_chili.jpg',
    author: 'Thai Pham',
    license: 'CC BY 2.0',
    fit: 'exact',
  },
  {
    recipe: 'バンバンジー（棒棒鶏）',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Bon_bon_chicken_1.jpg',
    author: 'See Wikimedia Commons file page',
    license: 'CC BY-SA 2.0',
    fit: 'exact',
  },
  {
    recipe: 'ガパオライス',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Kao_Rad_Pad_Kra-pao_-_Unithai_2023-07-08.jpg',
    author: 'Andy Li',
    license: 'CC0 1.0',
    fit: 'exact',
  },
  {
    recipe: 'ロールキャベツ（コンソメ煮）',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Stuffed_Cabbage_Golomki.jpg',
    author: 'Steven Depolo',
    license: 'CC BY 2.0',
    fit: 'close',
  },
  {
    recipe: '鶏とごろごろ野菜のクリームシチュー',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Cream_Stew_001.jpg',
    author: 'See Wikimedia Commons file page',
    license: 'See Wikimedia Commons file page',
    fit: 'exact',
  },
  {
    recipe: 'サラダチキンのコブサラダ',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Cobb_salad_with_chicken,_avocado,_etc_-_San_Francisco,_CA.jpg',
    author: 'Daderot',
    license: 'CC0 1.0',
    fit: 'exact',
  },
  {
    recipe: '鶏とナスのグリーンカレー',
    sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Thai_Green_Curry_with_Rice.jpg',
    author: 'Kenamparo',
    license: 'CC BY-SA 4.0',
    fit: 'close',
  },
]
