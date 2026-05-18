-- =====================================================
-- サンプルレシピ 25件 (文部科学省食品成分DB参考)
-- 朝食8件、昼食9件、夕食8件
-- =====================================================

insert into public.recipes (name, meal_type, cuisine_genre, cooking_method, cooking_time_minutes, difficulty_level, ingredients, steps, nutrition, base_servings, tags) values

-- ========== 朝食 (breakfast) ==========

('納豆ご飯', 'breakfast', '和食', '生', 5, 1,
'[
  {"name":"ご飯","amount":150,"unit":"g","category":"その他"},
  {"name":"納豆","amount":40,"unit":"g","category":"その他"},
  {"name":"醤油","amount":5,"unit":"ml","category":"調味料"},
  {"name":"ねぎ","amount":10,"unit":"g","category":"青果"}
]',
'[
  {"order":1,"description":"ご飯を茶碗に盛る"},
  {"order":2,"description":"納豆を醤油・ねぎと混ぜてご飯に乗せる"}
]',
'{
  "calories":290,"protein":14,"fat":6,"carbs":47,"fiber":3.5,
  "vitamins":{"a":0,"b1":0.08,"b2":0.18,"b6":0.12,"b12":0,"c":1,"d":0,"e":0.5},
  "minerals":{"iron":1.5,"calcium":45,"zinc":1.2,"magnesium":45,"potassium":280,"sodium":340}
}',
1, ARRAY['発酵食品','タンパク質','簡単']),

('卵かけご飯', 'breakfast', '和食', '生', 5, 1,
'[
  {"name":"ご飯","amount":150,"unit":"g","category":"その他"},
  {"name":"卵","amount":60,"unit":"g","category":"その他"},
  {"name":"醤油","amount":5,"unit":"ml","category":"調味料"}
]',
'[
  {"order":1,"description":"ご飯を茶碗に盛る"},
  {"order":2,"description":"卵を割って乗せ、醤油をかける"}
]',
'{
  "calories":295,"protein":12,"fat":7,"carbs":46,"fiber":0.5,
  "vitamins":{"a":75,"b1":0.07,"b2":0.28,"b6":0.1,"b12":0.6,"c":0,"d":1.8,"e":0.8},
  "minerals":{"iron":1.0,"calcium":30,"zinc":1.0,"magnesium":20,"potassium":200,"sodium":350}
}',
1, ARRAY['卵','簡単','時短']),

('トースト＋目玉焼き＋サラダ', 'breakfast', '洋食', '焼く', 10, 1,
'[
  {"name":"食パン","amount":60,"unit":"g","category":"その他"},
  {"name":"卵","amount":60,"unit":"g","category":"その他"},
  {"name":"バター","amount":5,"unit":"g","category":"乳製品"},
  {"name":"レタス","amount":50,"unit":"g","category":"青果"},
  {"name":"トマト","amount":50,"unit":"g","category":"青果"},
  {"name":"塩","amount":1,"unit":"g","category":"調味料"}
]',
'[
  {"order":1,"description":"食パンをトースターで焼きバターを塗る"},
  {"order":2,"description":"フライパンで目玉焼きを作る"},
  {"order":3,"description":"野菜を洗って皿に盛る"}
]',
'{
  "calories":310,"protein":14,"fat":13,"carbs":35,"fiber":2.0,
  "vitamins":{"a":100,"b1":0.1,"b2":0.3,"b6":0.12,"b12":0.6,"c":15,"d":1.8,"e":1.0},
  "minerals":{"iron":1.2,"calcium":80,"zinc":1.0,"magnesium":22,"potassium":280,"sodium":520}
}',
1, ARRAY['卵','野菜','洋風']),

('オートミール粥', 'breakfast', '洋食', '煮る', 10, 1,
'[
  {"name":"オートミール","amount":40,"unit":"g","category":"その他"},
  {"name":"牛乳","amount":200,"unit":"ml","category":"乳製品"},
  {"name":"バナナ","amount":100,"unit":"g","category":"青果"},
  {"name":"はちみつ","amount":10,"unit":"g","category":"調味料"}
]',
'[
  {"order":1,"description":"鍋にオートミールと牛乳を入れ中火で5分煮る"},
  {"order":2,"description":"器に盛りバナナとはちみつをトッピングする"}
]',
'{
  "calories":360,"protein":12,"fat":7,"carbs":63,"fiber":4.5,
  "vitamins":{"a":60,"b1":0.15,"b2":0.35,"b6":0.28,"b12":0.5,"c":8,"d":0.8,"e":0.4},
  "minerals":{"iron":1.5,"calcium":240,"zinc":1.5,"magnesium":55,"potassium":580,"sodium":85}
}',
1, ARRAY['食物繊維','カルシウム','時短']),

('味噌汁＋焼き鮭＋ご飯', 'breakfast', '和食', '焼く', 20, 2,
'[
  {"name":"ご飯","amount":150,"unit":"g","category":"その他"},
  {"name":"鮭","amount":80,"unit":"g","category":"鮮魚"},
  {"name":"豆腐","amount":50,"unit":"g","category":"その他"},
  {"name":"わかめ","amount":5,"unit":"g","category":"その他"},
  {"name":"味噌","amount":15,"unit":"g","category":"調味料"},
  {"name":"だし","amount":180,"unit":"ml","category":"調味料"}
]',
'[
  {"order":1,"description":"だしに豆腐とわかめを入れ、味噌を溶かして味噌汁を作る"},
  {"order":2,"description":"鮭をグリルで両面焼く"},
  {"order":3,"description":"ご飯を盛る"}
]',
'{
  "calories":430,"protein":28,"fat":8,"carbs":60,"fiber":2.0,
  "vitamins":{"a":20,"b1":0.25,"b2":0.25,"b6":0.55,"b12":5.0,"c":1,"d":19.0,"e":1.5},
  "minerals":{"iron":1.5,"calcium":100,"zinc":1.8,"magnesium":50,"potassium":550,"sodium":900}
}',
1, ARRAY['魚','タンパク質','ビタミンD','和食']),

('ヨーグルトパフェ', 'breakfast', '洋食', '生', 5, 1,
'[
  {"name":"プレーンヨーグルト","amount":150,"unit":"g","category":"乳製品"},
  {"name":"グラノーラ","amount":30,"unit":"g","category":"その他"},
  {"name":"いちご","amount":50,"unit":"g","category":"青果"},
  {"name":"ブルーベリー","amount":30,"unit":"g","category":"青果"},
  {"name":"はちみつ","amount":10,"unit":"g","category":"調味料"}
]',
'[
  {"order":1,"description":"器にヨーグルトを盛る"},
  {"order":2,"description":"グラノーラ、果物をトッピングしてはちみつをかける"}
]',
'{
  "calories":285,"protein":9,"fat":5,"carbs":52,"fiber":3.0,
  "vitamins":{"a":50,"b1":0.08,"b2":0.22,"b6":0.08,"b12":0.4,"c":35,"d":0,"e":0.5},
  "minerals":{"iron":0.8,"calcium":200,"zinc":0.8,"magnesium":30,"potassium":400,"sodium":80}
}',
1, ARRAY['乳製品','フルーツ','腸活','簡単']),

('フレンチトースト', 'breakfast', '洋食', '焼く', 20, 2,
'[
  {"name":"食パン","amount":60,"unit":"g","category":"その他"},
  {"name":"卵","amount":60,"unit":"g","category":"その他"},
  {"name":"牛乳","amount":60,"unit":"ml","category":"乳製品"},
  {"name":"バター","amount":8,"unit":"g","category":"乳製品"},
  {"name":"砂糖","amount":5,"unit":"g","category":"調味料"},
  {"name":"メープルシロップ","amount":10,"unit":"g","category":"調味料"}
]',
'[
  {"order":1,"description":"卵・牛乳・砂糖を混ぜ食パンを浸す（10分）"},
  {"order":2,"description":"バターを熱したフライパンで両面焼く"},
  {"order":3,"description":"メープルシロップをかけて完成"}
]',
'{
  "calories":365,"protein":12,"fat":14,"carbs":48,"fiber":1.0,
  "vitamins":{"a":110,"b1":0.1,"b2":0.32,"b6":0.1,"b12":0.7,"c":0,"d":2.0,"e":0.9},
  "minerals":{"iron":1.0,"calcium":110,"zinc":0.9,"magnesium":18,"potassium":220,"sodium":420}
}',
1, ARRAY['卵','乳製品','週末朝食']),

('豆腐と野菜の炒め定食', 'breakfast', '和食', '焼く', 15, 2,
'[
  {"name":"ご飯","amount":150,"unit":"g","category":"その他"},
  {"name":"木綿豆腐","amount":100,"unit":"g","category":"その他"},
  {"name":"ほうれん草","amount":60,"unit":"g","category":"青果"},
  {"name":"にんじん","amount":30,"unit":"g","category":"青果"},
  {"name":"ごま油","amount":5,"unit":"ml","category":"調味料"},
  {"name":"醤油","amount":8,"unit":"ml","category":"調味料"},
  {"name":"みりん","amount":5,"unit":"ml","category":"調味料"}
]',
'[
  {"order":1,"description":"豆腐を一口大に切り、野菜を千切りにする"},
  {"order":2,"description":"ごま油で野菜を炒め、豆腐を加えて調味料で味付け"},
  {"order":3,"description":"ご飯と一緒に盛る"}
]',
'{
  "calories":360,"protein":16,"fat":9,"carbs":52,"fiber":3.5,
  "vitamins":{"a":280,"b1":0.18,"b2":0.18,"b6":0.2,"b12":0,"c":22,"d":0,"e":1.8},
  "minerals":{"iron":3.5,"calcium":180,"zinc":1.5,"magnesium":60,"potassium":480,"sodium":620}
}',
1, ARRAY['大豆','鉄分','野菜','ヘルシー']),

-- ========== 昼食 (lunch) ==========

('鶏の唐揚げ定食', 'lunch', '和食', '揚げる', 30, 3,
'[
  {"name":"鶏もも肉","amount":150,"unit":"g","category":"精肉"},
  {"name":"ご飯","amount":200,"unit":"g","category":"その他"},
  {"name":"キャベツ","amount":80,"unit":"g","category":"青果"},
  {"name":"醤油","amount":15,"unit":"ml","category":"調味料"},
  {"name":"みりん","amount":10,"unit":"ml","category":"調味料"},
  {"name":"おろし生姜","amount":5,"unit":"g","category":"調味料"},
  {"name":"片栗粉","amount":20,"unit":"g","category":"乾物"},
  {"name":"揚げ油","amount":30,"unit":"ml","category":"調味料"}
]',
'[
  {"order":1,"description":"鶏肉を醤油・みりん・生姜で15分漬け込む"},
  {"order":2,"description":"片栗粉をまぶして170℃の油で5〜6分揚げる"},
  {"order":3,"description":"ご飯・千切りキャベツと一緒に盛る"}
]',
'{
  "calories":620,"protein":34,"fat":22,"carbs":73,"fiber":1.5,
  "vitamins":{"a":30,"b1":0.2,"b2":0.25,"b6":0.5,"b12":0.5,"c":20,"d":0.3,"e":1.0},
  "minerals":{"iron":1.5,"calcium":35,"zinc":3.0,"magnesium":45,"potassium":580,"sodium":850}
}',
1, ARRAY['鶏肉','揚げ物','定食','人気']),

('豚肉と野菜の生姜焼き定食', 'lunch', '和食', '焼く', 20, 2,
'[
  {"name":"豚ロース薄切り","amount":130,"unit":"g","category":"精肉"},
  {"name":"ご飯","amount":200,"unit":"g","category":"その他"},
  {"name":"キャベツ","amount":100,"unit":"g","category":"青果"},
  {"name":"玉ねぎ","amount":60,"unit":"g","category":"青果"},
  {"name":"醤油","amount":15,"unit":"ml","category":"調味料"},
  {"name":"みりん","amount":10,"unit":"ml","category":"調味料"},
  {"name":"おろし生姜","amount":8,"unit":"g","category":"調味料"},
  {"name":"サラダ油","amount":8,"unit":"ml","category":"調味料"}
]',
'[
  {"order":1,"description":"豚肉と玉ねぎをフライパンで炒める"},
  {"order":2,"description":"醤油・みりん・生姜を加えて絡める"},
  {"order":3,"description":"ご飯・キャベツと一緒に盛る"}
]',
'{
  "calories":575,"protein":32,"fat":15,"carbs":76,"fiber":2.0,
  "vitamins":{"a":5,"b1":0.72,"b2":0.28,"b6":0.55,"b12":0.8,"c":25,"d":0.2,"e":0.5},
  "minerals":{"iron":1.5,"calcium":30,"zinc":3.0,"magnesium":45,"potassium":650,"sodium":820}
}',
1, ARRAY['豚肉','ビタミンB1','定食','人気']),

('鮭のムニエル定食', 'lunch', '洋食', '焼く', 20, 2,
'[
  {"name":"鮭切り身","amount":120,"unit":"g","category":"鮮魚"},
  {"name":"ご飯","amount":200,"unit":"g","category":"その他"},
  {"name":"ブロッコリー","amount":80,"unit":"g","category":"青果"},
  {"name":"バター","amount":10,"unit":"g","category":"乳製品"},
  {"name":"レモン","amount":20,"unit":"g","category":"青果"},
  {"name":"塩","amount":2,"unit":"g","category":"調味料"},
  {"name":"こしょう","amount":1,"unit":"g","category":"調味料"},
  {"name":"小麦粉","amount":10,"unit":"g","category":"乾物"}
]',
'[
  {"order":1,"description":"鮭に塩こしょうをして小麦粉をまぶす"},
  {"order":2,"description":"バターを熱したフライパンで両面焼く"},
  {"order":3,"description":"ブロッコリーを茹でてレモンと一緒に盛る"}
]',
'{
  "calories":540,"protein":35,"fat":14,"carbs":68,"fiber":3.5,
  "vitamins":{"a":40,"b1":0.22,"b2":0.25,"b6":0.72,"b12":6.0,"c":60,"d":25.0,"e":2.0},
  "minerals":{"iron":1.5,"calcium":60,"zinc":1.5,"magnesium":65,"potassium":720,"sodium":700}
}',
1, ARRAY['魚','ビタミンD','ビタミンC','洋食']),

('豚汁定食', 'lunch', '和食', '煮る', 30, 2,
'[
  {"name":"豚バラ薄切り","amount":80,"unit":"g","category":"精肉"},
  {"name":"ご飯","amount":200,"unit":"g","category":"その他"},
  {"name":"大根","amount":80,"unit":"g","category":"青果"},
  {"name":"にんじん","amount":40,"unit":"g","category":"青果"},
  {"name":"ごぼう","amount":30,"unit":"g","category":"青果"},
  {"name":"こんにゃく","amount":50,"unit":"g","category":"その他"},
  {"name":"味噌","amount":20,"unit":"g","category":"調味料"},
  {"name":"だし","amount":300,"unit":"ml","category":"調味料"},
  {"name":"ごま油","amount":5,"unit":"ml","category":"調味料"}
]',
'[
  {"order":1,"description":"野菜を食べやすく切り、豚バラと一緒にごま油で炒める"},
  {"order":2,"description":"だしを加えて野菜が柔らかくなるまで煮る"},
  {"order":3,"description":"味噌を溶き入れて完成、ご飯と一緒に盛る"}
]',
'{
  "calories":500,"protein":22,"fat":15,"carbs":72,"fiber":5.0,
  "vitamins":{"a":150,"b1":0.38,"b2":0.18,"b6":0.35,"b12":0.4,"c":10,"d":0.2,"e":0.5},
  "minerals":{"iron":2.0,"calcium":60,"zinc":2.5,"magnesium":50,"potassium":680,"sodium":1050}
}',
1, ARRAY['豚肉','根菜','食物繊維','和食']),

('冷やし中華', 'lunch', '中華', '生', 15, 2,
'[
  {"name":"中華麺","amount":120,"unit":"g","category":"乾物"},
  {"name":"ハム","amount":50,"unit":"g","category":"精肉"},
  {"name":"きゅうり","amount":50,"unit":"g","category":"青果"},
  {"name":"トマト","amount":60,"unit":"g","category":"青果"},
  {"name":"卵","amount":60,"unit":"g","category":"その他"},
  {"name":"醤油","amount":15,"unit":"ml","category":"調味料"},
  {"name":"酢","amount":20,"unit":"ml","category":"調味料"},
  {"name":"ごま油","amount":8,"unit":"ml","category":"調味料"},
  {"name":"砂糖","amount":10,"unit":"g","category":"調味料"}
]',
'[
  {"order":1,"description":"麺を茹でて冷水で締める"},
  {"order":2,"description":"卵を薄焼きにして千切りにする"},
  {"order":3,"description":"タレを合わせ、具材を盛り付ける"}
]',
'{
  "calories":520,"protein":22,"fat":14,"carbs":75,"fiber":2.5,
  "vitamins":{"a":60,"b1":0.2,"b2":0.25,"b6":0.2,"b12":0.5,"c":18,"d":1.5,"e":1.0},
  "minerals":{"iron":1.5,"calcium":40,"zinc":1.5,"magnesium":30,"potassium":420,"sodium":950}
}',
1, ARRAY['麺','夏','卵','中華']),

('カレーライス', 'lunch', '洋食', '煮る', 45, 2,
'[
  {"name":"ご飯","amount":220,"unit":"g","category":"その他"},
  {"name":"鶏もも肉","amount":120,"unit":"g","category":"精肉"},
  {"name":"玉ねぎ","amount":100,"unit":"g","category":"青果"},
  {"name":"じゃがいも","amount":80,"unit":"g","category":"青果"},
  {"name":"にんじん","amount":60,"unit":"g","category":"青果"},
  {"name":"カレールー","amount":35,"unit":"g","category":"調味料"},
  {"name":"サラダ油","amount":10,"unit":"ml","category":"調味料"}
]',
'[
  {"order":1,"description":"野菜と鶏肉を一口大に切り油で炒める"},
  {"order":2,"description":"水を加えて野菜が柔らかくなるまで煮る"},
  {"order":3,"description":"火を止めてカレールーを溶かし、再度煮込む"}
]',
'{
  "calories":660,"protein":28,"fat":18,"carbs":95,"fiber":4.0,
  "vitamins":{"a":180,"b1":0.25,"b2":0.2,"b6":0.55,"b12":0.4,"c":25,"d":0.2,"e":1.5},
  "minerals":{"iron":2.0,"calcium":45,"zinc":2.5,"magnesium":55,"potassium":750,"sodium":1100}
}',
1, ARRAY['鶏肉','野菜','人気','ご飯もの']),

('パスタ ナポリタン', 'lunch', '洋食', '焼く', 25, 2,
'[
  {"name":"スパゲッティ","amount":100,"unit":"g","category":"乾物"},
  {"name":"ウインナー","amount":60,"unit":"g","category":"精肉"},
  {"name":"玉ねぎ","amount":60,"unit":"g","category":"青果"},
  {"name":"ピーマン","amount":40,"unit":"g","category":"青果"},
  {"name":"トマトケチャップ","amount":40,"unit":"g","category":"調味料"},
  {"name":"バター","amount":8,"unit":"g","category":"乳製品"},
  {"name":"塩","amount":2,"unit":"g","category":"調味料"}
]',
'[
  {"order":1,"description":"パスタを塩茹でする（8分）"},
  {"order":2,"description":"ウインナー・野菜をバターで炒める"},
  {"order":3,"description":"パスタを加えてケチャップで炒め合わせる"}
]',
'{
  "calories":575,"protein":20,"fat":16,"carbs":87,"fiber":4.0,
  "vitamins":{"a":35,"b1":0.3,"b2":0.15,"b6":0.3,"b12":0.3,"c":35,"d":0.1,"e":1.5},
  "minerals":{"iron":2.5,"calcium":35,"zinc":1.5,"magnesium":45,"potassium":480,"sodium":1050}
}',
1, ARRAY['パスタ','洋食','人気']),

('蒸し鶏の冷やしうどん', 'lunch', '和食', '蒸す', 20, 2,
'[
  {"name":"うどん","amount":200,"unit":"g","category":"その他"},
  {"name":"鶏むね肉","amount":100,"unit":"g","category":"精肉"},
  {"name":"きゅうり","amount":60,"unit":"g","category":"青果"},
  {"name":"大葉","amount":5,"unit":"g","category":"青果"},
  {"name":"醤油","amount":15,"unit":"ml","category":"調味料"},
  {"name":"酢","amount":10,"unit":"ml","category":"調味料"},
  {"name":"ごま油","amount":8,"unit":"ml","category":"調味料"},
  {"name":"白ごま","amount":5,"unit":"g","category":"その他"}
]',
'[
  {"order":1,"description":"鶏むね肉を耐熱袋に入れて沸騰したお湯で10分蒸す"},
  {"order":2,"description":"うどんを茹でて冷水で締める"},
  {"order":3,"description":"鶏肉を裂いて盛り付け、タレをかける"}
]',
'{
  "calories":480,"protein":32,"fat":10,"carbs":66,"fiber":2.0,
  "vitamins":{"a":20,"b1":0.15,"b2":0.15,"b6":0.65,"b12":0.3,"c":8,"d":0.1,"e":0.8},
  "minerals":{"iron":1.5,"calcium":55,"zinc":1.5,"magnesium":40,"potassium":500,"sodium":750}
}',
1, ARRAY['鶏肉','麺','ヘルシー','夏']),

('麻婆豆腐定食', 'lunch', '中華', '煮る', 20, 2,
'[
  {"name":"木綿豆腐","amount":150,"unit":"g","category":"その他"},
  {"name":"豚ひき肉","amount":80,"unit":"g","category":"精肉"},
  {"name":"ご飯","amount":200,"unit":"g","category":"その他"},
  {"name":"豆板醤","amount":5,"unit":"g","category":"調味料"},
  {"name":"甜麺醤","amount":8,"unit":"g","category":"調味料"},
  {"name":"にんにく","amount":5,"unit":"g","category":"青果"},
  {"name":"生姜","amount":5,"unit":"g","category":"青果"},
  {"name":"鶏ガラスープ","amount":150,"unit":"ml","category":"調味料"},
  {"name":"片栗粉","amount":8,"unit":"g","category":"乾物"},
  {"name":"ごま油","amount":5,"unit":"ml","category":"調味料"}
]',
'[
  {"order":1,"description":"にんにく・生姜・豆板醤をごま油で炒める"},
  {"order":2,"description":"ひき肉を加えて炒め、スープと甜麺醤を加える"},
  {"order":3,"description":"豆腐を加えて煮込み、水溶き片栗粉でとろみをつける"}
]',
'{
  "calories":590,"protein":30,"fat":18,"carbs":78,"fiber":2.5,
  "vitamins":{"a":5,"b1":0.25,"b2":0.18,"b6":0.3,"b12":0.4,"c":3,"d":0,"e":0.5},
  "minerals":{"iron":3.0,"calcium":180,"zinc":2.5,"magnesium":80,"potassium":550,"sodium":1100}
}',
1, ARRAY['豆腐','豚肉','中華','スパイシー']),

-- ========== 夕食 (dinner) ==========

('肉じゃが', 'dinner', '和食', '煮る', 35, 2,
'[
  {"name":"牛薄切り肉","amount":120,"unit":"g","category":"精肉"},
  {"name":"じゃがいも","amount":200,"unit":"g","category":"青果"},
  {"name":"玉ねぎ","amount":100,"unit":"g","category":"青果"},
  {"name":"にんじん","amount":60,"unit":"g","category":"青果"},
  {"name":"糸こんにゃく","amount":80,"unit":"g","category":"その他"},
  {"name":"醤油","amount":25,"unit":"ml","category":"調味料"},
  {"name":"みりん","amount":20,"unit":"ml","category":"調味料"},
  {"name":"砂糖","amount":10,"unit":"g","category":"調味料"},
  {"name":"だし","amount":200,"unit":"ml","category":"調味料"}
]',
'[
  {"order":1,"description":"野菜と牛肉を炒め、だし・調味料を加える"},
  {"order":2,"description":"落とし蓋をして弱火で20分煮込む"},
  {"order":3,"description":"汁が少なくなったら完成"}
]',
'{
  "calories":420,"protein":22,"fat":12,"carbs":52,"fiber":4.0,
  "vitamins":{"a":180,"b1":0.2,"b2":0.22,"b6":0.55,"b12":1.2,"c":35,"d":0.2,"e":0.5},
  "minerals":{"iron":2.5,"calcium":35,"zinc":3.5,"magnesium":45,"potassium":850,"sodium":950}
}',
1, ARRAY['牛肉','煮物','和食','定番']),

('ハンバーグ（デミグラスソース）', 'dinner', '洋食', '焼く', 40, 3,
'[
  {"name":"合いびき肉","amount":150,"unit":"g","category":"精肉"},
  {"name":"玉ねぎ","amount":60,"unit":"g","category":"青果"},
  {"name":"卵","amount":30,"unit":"g","category":"その他"},
  {"name":"パン粉","amount":15,"unit":"g","category":"乾物"},
  {"name":"牛乳","amount":20,"unit":"ml","category":"乳製品"},
  {"name":"デミグラスソース缶","amount":80,"unit":"g","category":"調味料"},
  {"name":"バター","amount":8,"unit":"g","category":"乳製品"},
  {"name":"塩","amount":2,"unit":"g","category":"調味料"},
  {"name":"こしょう","amount":1,"unit":"g","category":"調味料"}
]',
'[
  {"order":1,"description":"玉ねぎをみじん切りにしてバターで炒め冷ます"},
  {"order":2,"description":"ひき肉に玉ねぎ・卵・パン粉・牛乳・塩こしょうを加えてよく混ぜる"},
  {"order":3,"description":"成形してフライパンで両面焼き、デミグラスソースで煮込む"}
]',
'{
  "calories":480,"protein":28,"fat":28,"carbs":22,"fiber":1.0,
  "vitamins":{"a":35,"b1":0.2,"b2":0.28,"b6":0.4,"b12":1.5,"c":5,"d":0.8,"e":0.8},
  "minerals":{"iron":3.0,"calcium":55,"zinc":4.5,"magnesium":30,"potassium":480,"sodium":680}
}',
1, ARRAY['牛肉','洋食','人気','子供向け']),

('白身魚の煮付け', 'dinner', '和食', '煮る', 25, 2,
'[
  {"name":"かれい","amount":150,"unit":"g","category":"鮮魚"},
  {"name":"醤油","amount":20,"unit":"ml","category":"調味料"},
  {"name":"みりん","amount":20,"unit":"ml","category":"調味料"},
  {"name":"砂糖","amount":8,"unit":"g","category":"調味料"},
  {"name":"酒","amount":20,"unit":"ml","category":"調味料"},
  {"name":"生姜","amount":8,"unit":"g","category":"青果"}
]',
'[
  {"order":1,"description":"調味料と生姜・水を合わせて煮立てる"},
  {"order":2,"description":"かれいを入れて落とし蓋で15分煮る"},
  {"order":3,"description":"器に盛り煮汁をかける"}
]',
'{
  "calories":240,"protein":28,"fat":3,"carbs":20,"fiber":0.2,
  "vitamins":{"a":15,"b1":0.08,"b2":0.12,"b6":0.2,"b12":1.5,"c":0,"d":3.0,"e":1.0},
  "minerals":{"iron":0.8,"calcium":40,"zinc":0.8,"magnesium":30,"potassium":400,"sodium":1050}
}',
1, ARRAY['魚','低カロリー','和食','たんぱく質']),

('豚の角煮', 'dinner', '和食', '煮る', 90, 4,
'[
  {"name":"豚バラブロック","amount":200,"unit":"g","category":"精肉"},
  {"name":"醤油","amount":30,"unit":"ml","category":"調味料"},
  {"name":"みりん","amount":25,"unit":"ml","category":"調味料"},
  {"name":"砂糖","amount":15,"unit":"g","category":"調味料"},
  {"name":"酒","amount":30,"unit":"ml","category":"調味料"},
  {"name":"生姜","amount":10,"unit":"g","category":"青果"},
  {"name":"ゆで卵","amount":60,"unit":"g","category":"その他"}
]',
'[
  {"order":1,"description":"豚バラを大きく切り熱湯で下茹で（30分）"},
  {"order":2,"description":"調味料と生姜を合わせた煮汁で弱火で1時間煮込む"},
  {"order":3,"description":"ゆで卵を加えてさらに10分煮て完成"}
]',
'{
  "calories":580,"protein":25,"fat":38,"carbs":28,"fiber":0.2,
  "vitamins":{"a":30,"b1":0.55,"b2":0.22,"b6":0.38,"b12":1.0,"c":1,"d":1.5,"e":0.5},
  "minerals":{"iron":1.5,"calcium":25,"zinc":3.0,"magnesium":25,"potassium":400,"sodium":1200}
}',
1, ARRAY['豚肉','煮物','週末','特別料理']),

('鶏のトマト煮込み', 'dinner', '洋食', '煮る', 40, 2,
'[
  {"name":"鶏もも肉","amount":180,"unit":"g","category":"精肉"},
  {"name":"トマト缶","amount":200,"unit":"g","category":"その他"},
  {"name":"玉ねぎ","amount":80,"unit":"g","category":"青果"},
  {"name":"にんにく","amount":5,"unit":"g","category":"青果"},
  {"name":"オリーブオイル","amount":10,"unit":"ml","category":"調味料"},
  {"name":"塩","amount":3,"unit":"g","category":"調味料"},
  {"name":"バジル","amount":2,"unit":"g","category":"青果"},
  {"name":"こしょう","amount":1,"unit":"g","category":"調味料"}
]',
'[
  {"order":1,"description":"鶏もも肉を塩こしょうしてオリーブオイルで皮面から焼く"},
  {"order":2,"description":"玉ねぎ・にんにくを炒め、トマト缶を加えて煮立てる"},
  {"order":3,"description":"鶏肉を加えて弱火で20分煮込み、バジルで仕上げる"}
]',
'{
  "calories":380,"protein":30,"fat":20,"carbs":15,"fiber":3.0,
  "vitamins":{"a":55,"b1":0.18,"b2":0.25,"b6":0.5,"b12":0.4,"c":20,"d":0.2,"e":2.5},
  "minerals":{"iron":1.5,"calcium":40,"zinc":2.0,"magnesium":40,"potassium":680,"sodium":680}
}',
1, ARRAY['鶏肉','トマト','洋食','ヘルシー']),

('さばの味噌煮', 'dinner', '和食', '煮る', 25, 2,
'[
  {"name":"さば","amount":150,"unit":"g","category":"鮮魚"},
  {"name":"味噌","amount":20,"unit":"g","category":"調味料"},
  {"name":"みりん","amount":20,"unit":"ml","category":"調味料"},
  {"name":"砂糖","amount":10,"unit":"g","category":"調味料"},
  {"name":"酒","amount":20,"unit":"ml","category":"調味料"},
  {"name":"生姜","amount":10,"unit":"g","category":"青果"}
]',
'[
  {"order":1,"description":"さばに切り込みを入れ、熱湯をかけて臭みを取る"},
  {"order":2,"description":"調味料と生姜を合わせて煮立て、さばを入れ10分煮る"},
  {"order":3,"description":"煮汁を絡めながら仕上げる"}
]',
'{
  "calories":320,"protein":28,"fat":16,"carbs":16,"fiber":0.5,
  "vitamins":{"a":30,"b1":0.25,"b2":0.35,"b6":0.4,"b12":12.0,"c":0,"d":11.0,"e":2.5},
  "minerals":{"iron":1.5,"calcium":20,"zinc":1.5,"magnesium":35,"potassium":480,"sodium":900}
}',
1, ARRAY['魚','青魚','DHA','EPA','ビタミンD']),

('野菜たっぷり豚汁＋焼き魚', 'dinner', '和食', '焼く', 30, 2,
'[
  {"name":"鯵","amount":120,"unit":"g","category":"鮮魚"},
  {"name":"豚こま切れ","amount":60,"unit":"g","category":"精肉"},
  {"name":"大根","amount":100,"unit":"g","category":"青果"},
  {"name":"ごぼう","amount":40,"unit":"g","category":"青果"},
  {"name":"にんじん","amount":40,"unit":"g","category":"青果"},
  {"name":"里芋","amount":60,"unit":"g","category":"青果"},
  {"name":"味噌","amount":20,"unit":"g","category":"調味料"},
  {"name":"だし","amount":350,"unit":"ml","category":"調味料"},
  {"name":"塩","amount":2,"unit":"g","category":"調味料"}
]',
'[
  {"order":1,"description":"豚汁を作る（野菜を切って炒め、だしで煮て味噌を溶く）"},
  {"order":2,"description":"鯵に塩を振ってグリルで焼く（両面10分）"},
  {"order":3,"description":"一緒に盛り付ける"}
]',
'{
  "calories":390,"protein":32,"fat":12,"carbs":38,"fiber":6.0,
  "vitamins":{"a":200,"b1":0.35,"b2":0.3,"b6":0.5,"b12":8.0,"c":15,"d":5.0,"e":2.0},
  "minerals":{"iron":3.0,"calcium":80,"zinc":2.0,"magnesium":65,"potassium":920,"sodium":1050}
}',
1, ARRAY['魚','豚肉','根菜','食物繊維','和食']),

('ペペロンチーノ', 'dinner', '洋食', '焼く', 20, 2,
'[
  {"name":"スパゲッティ","amount":100,"unit":"g","category":"乾物"},
  {"name":"にんにく","amount":10,"unit":"g","category":"青果"},
  {"name":"鷹の爪","amount":2,"unit":"g","category":"調味料"},
  {"name":"オリーブオイル","amount":20,"unit":"ml","category":"調味料"},
  {"name":"塩","amount":5,"unit":"g","category":"調味料"},
  {"name":"パセリ","amount":3,"unit":"g","category":"青果"},
  {"name":"アンチョビ","amount":10,"unit":"g","category":"鮮魚"}
]',
'[
  {"order":1,"description":"パスタを塩茹でする（茹で汁を取っておく）"},
  {"order":2,"description":"オリーブオイルでにんにく・鷹の爪を弱火で炒める"},
  {"order":3,"description":"アンチョビを加え、茹で汁でエマルジョン化してパスタを絡める"}
]',
'{
  "calories":480,"protein":14,"fat":22,"carbs":58,"fiber":2.5,
  "vitamins":{"a":20,"b1":0.28,"b2":0.08,"b6":0.15,"b12":0.2,"c":5,"d":0.2,"e":3.5},
  "minerals":{"iron":2.0,"calcium":30,"zinc":1.0,"magnesium":40,"potassium":280,"sodium":1100}
}',
1, ARRAY['パスタ','洋食','シンプル','ニンニク']);
