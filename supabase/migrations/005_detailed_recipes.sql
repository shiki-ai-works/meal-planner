-- =====================================================
-- 詳細レシピ 10件追加（プロのコツを反映した詳しい手順）
-- 出典: キッコーマン / クラシル / おいしい健康 / 三越伊勢丹 FOODIE /
--       みんなのきょうの料理 / デリッシュキッチン / カロリーSlism /
--       文部科学省食品成分DB 等を参照
-- =====================================================

insert into public.recipes (name, meal_type, cuisine_genre, cooking_method, cooking_time_minutes, difficulty_level, ingredients, steps, nutrition, base_servings, tags) values

-- ========== 親子丼 ==========
('親子丼', 'lunch', '和食', '煮る', 20, 2,
'[
  {"name":"ご飯","amount":200,"unit":"g","category":"その他"},
  {"name":"鶏もも肉","amount":100,"unit":"g","category":"精肉"},
  {"name":"卵","amount":120,"unit":"g","category":"その他"},
  {"name":"玉ねぎ","amount":60,"unit":"g","category":"青果"},
  {"name":"三つ葉","amount":5,"unit":"g","category":"青果"},
  {"name":"だし","amount":100,"unit":"ml","category":"調味料"},
  {"name":"醤油","amount":15,"unit":"ml","category":"調味料"},
  {"name":"みりん","amount":15,"unit":"ml","category":"調味料"},
  {"name":"砂糖","amount":5,"unit":"g","category":"調味料"},
  {"name":"酒","amount":10,"unit":"ml","category":"調味料"}
]',
'[
  {"order":1,"description":"鶏もも肉は筋に沿って3等分→筋に直角にそぎ切りにし、塩少々と酒をもみ込んで10分置く（やわらか化）"},
  {"order":2,"description":"玉ねぎは繊維に沿って5mm厚のくし切り、三つ葉は3cm長に切る"},
  {"order":3,"description":"卵は別ボウルに割り入れ、白身を切るように箸で5〜6回だけ動かす（混ぜすぎないのがふわとろのコツ）"},
  {"order":4,"description":"親子鍋（または小フライパン）にだし・醤油・みりん・砂糖を入れ中火で煮立てる"},
  {"order":5,"description":"玉ねぎを加え、しんなりするまで2分煮る"},
  {"order":6,"description":"鶏もも肉を皮目を下にして並べ、弱火で5分煮て一度返し、さらに1分煮る"},
  {"order":7,"description":"溶き卵の2/3量を中心から外へ「の」の字を描くように回し入れ、すぐに蓋をして40秒蒸し煮にする"},
  {"order":8,"description":"蓋を開け、残りの卵を回し入れ、表面が半熟になったらすぐ火を止める（余熱で固まる）"},
  {"order":9,"description":"丼に温かいご飯を盛り、鍋肌から滑らせるように卵を乗せ、三つ葉を散らす"}
]',
'{
  "calories":620,"protein":34,"fat":18,"carbs":78,"fiber":1.8,
  "vitamins":{"a":150,"b1":0.18,"b2":0.45,"b6":0.35,"b12":1.2,"c":6,"d":1.5,"e":1.2},
  "minerals":{"iron":2.2,"calcium":55,"zinc":2.5,"magnesium":40,"potassium":480,"sodium":1200}
}',
1, ARRAY['丼','タンパク質','定番','卵','ふわとろ']),

-- ========== 牛丼 ==========
('牛丼', 'lunch', '和食', '煮る', 20, 2,
'[
  {"name":"ご飯","amount":200,"unit":"g","category":"その他"},
  {"name":"牛バラ薄切り肉","amount":120,"unit":"g","category":"精肉"},
  {"name":"玉ねぎ","amount":100,"unit":"g","category":"青果"},
  {"name":"しょうが","amount":5,"unit":"g","category":"青果"},
  {"name":"紅しょうが","amount":10,"unit":"g","category":"青果"},
  {"name":"だし","amount":150,"unit":"ml","category":"調味料"},
  {"name":"醤油","amount":20,"unit":"ml","category":"調味料"},
  {"name":"みりん","amount":20,"unit":"ml","category":"調味料"},
  {"name":"砂糖","amount":10,"unit":"g","category":"調味料"},
  {"name":"酒","amount":15,"unit":"ml","category":"調味料"},
  {"name":"白ワイン","amount":10,"unit":"ml","category":"調味料"}
]',
'[
  {"order":1,"description":"玉ねぎは繊維に対し垂直に5mm厚にスライスする（煮崩れず形が残る厚み）"},
  {"order":2,"description":"しょうがは千切り、牛バラは4〜5cm長さに切り揃える"},
  {"order":3,"description":"鍋にだし・酒・白ワイン・みりん・砂糖・醤油を合わせて強火で煮立てる（白ワインは吉野家風の隠し味、コクが出る）"},
  {"order":4,"description":"煮立ったら玉ねぎとしょうがを入れ、再沸騰したら中火に落として3分煮る"},
  {"order":5,"description":"牛肉を1枚ずつほぐしながら入れる（団子状にならないようにする）"},
  {"order":6,"description":"アクを丁寧に取りながら中弱火で3分の「炒め煮」（長く煮ると硬くなるので注意）"},
  {"order":7,"description":"煮汁が肉の半分くらいになったら火を止め、5分置いて味を含ませる"},
  {"order":8,"description":"丼にご飯を盛り、汁ごと具を乗せ、紅しょうがを添える"}
]',
'{
  "calories":680,"protein":24,"fat":22,"carbs":85,"fiber":2.0,
  "vitamins":{"a":5,"b1":0.16,"b2":0.22,"b6":0.28,"b12":1.5,"c":5,"d":0,"e":0.6},
  "minerals":{"iron":2.0,"calcium":35,"zinc":4.0,"magnesium":40,"potassium":420,"sodium":1400}
}',
1, ARRAY['丼','タンパク質','定番','時短','吉野家風']),

-- ========== ぶり大根 ==========
('ぶり大根', 'dinner', '和食', '煮る', 60, 3,
'[
  {"name":"ぶり","amount":150,"unit":"g","category":"鮮魚"},
  {"name":"大根","amount":250,"unit":"g","category":"青果"},
  {"name":"しょうが","amount":10,"unit":"g","category":"青果"},
  {"name":"だし","amount":300,"unit":"ml","category":"調味料"},
  {"name":"醤油","amount":25,"unit":"ml","category":"調味料"},
  {"name":"みりん","amount":25,"unit":"ml","category":"調味料"},
  {"name":"砂糖","amount":10,"unit":"g","category":"調味料"},
  {"name":"酒","amount":30,"unit":"ml","category":"調味料"},
  {"name":"米","amount":5,"unit":"g","category":"乾物"}
]',
'[
  {"order":1,"description":"大根は2.5cm厚の輪切りにし、皮を厚めに（5mm）むく。片面に十文字の隠し包丁を入れ、角を面取りする（煮崩れ防止）"},
  {"order":2,"description":"鍋に大根とかぶる量の水・米大さじ1を入れ、強火で煮立ててから弱火で15分下ゆでする（米のでんぷんがえぐみを吸着）"},
  {"order":3,"description":"竹串がスッと通ったら大根をザルにあげ、流水で米粒を洗い流す"},
  {"order":4,"description":"ぶりは両面に塩小さじ1/2をふって10分置き、出てきた水分（臭みの元）をペーパーで丁寧に拭き取る"},
  {"order":5,"description":"鍋に湯を沸かしぶりを5秒ほどくぐらせる（霜降り）。すぐ氷水に取って表面の白くなった汚れと血合いを優しく洗い、水気を拭く"},
  {"order":6,"description":"鍋にだし・酒・みりん・砂糖を入れて煮立て、大根を並べてから、ぶりとしょうがの薄切りを乗せる"},
  {"order":7,"description":"アルミホイルで落とし蓋をし、弱めの中火で15分煮る"},
  {"order":8,"description":"醤油を加え、落とし蓋をしてさらに弱火で15分、煮汁が1/3量になるまで煮含める"},
  {"order":9,"description":"火を止めて10分以上置き、味をしみ込ませる。器に盛り、しょうがの千切り（針しょうが）を天盛りにする"}
]',
'{
  "calories":340,"protein":28,"fat":14,"carbs":22,"fiber":2.5,
  "vitamins":{"a":35,"b1":0.20,"b2":0.30,"b6":0.45,"b12":3.0,"c":15,"d":8.0,"e":2.0},
  "minerals":{"iron":1.6,"calcium":60,"zinc":1.2,"magnesium":45,"potassium":680,"sodium":1100}
}',
1, ARRAY['魚','和食','DHA','EPA','ビタミンD']),

-- ========== えびチリ ==========
('えびチリ', 'dinner', '中華', '焼く', 25, 3,
'[
  {"name":"えび","amount":150,"unit":"g","category":"鮮魚"},
  {"name":"長ねぎ","amount":40,"unit":"g","category":"青果"},
  {"name":"にんにく","amount":5,"unit":"g","category":"青果"},
  {"name":"しょうが","amount":5,"unit":"g","category":"青果"},
  {"name":"卵白","amount":15,"unit":"g","category":"その他"},
  {"name":"片栗粉","amount":20,"unit":"g","category":"乾物"},
  {"name":"ケチャップ","amount":30,"unit":"g","category":"調味料"},
  {"name":"豆板醤","amount":5,"unit":"g","category":"調味料"},
  {"name":"鶏がらスープ","amount":80,"unit":"ml","category":"調味料"},
  {"name":"砂糖","amount":8,"unit":"g","category":"調味料"},
  {"name":"酒","amount":10,"unit":"ml","category":"調味料"},
  {"name":"ごま油","amount":10,"unit":"ml","category":"調味料"},
  {"name":"サラダ油","amount":10,"unit":"ml","category":"調味料"}
]',
'[
  {"order":1,"description":"えびは殻と尾を取り、背に浅く切り込みを入れて背わたを竹串で取り除く"},
  {"order":2,"description":"えびに塩小さじ1/4と片栗粉小さじ1をまぶしてもみ、出てきた灰色のぬめりを流水で洗う（透明になるまで2〜3回繰り返すと臭み解消）"},
  {"order":3,"description":"水気をペーパーで完全に拭き取り、卵白・酒・片栗粉小さじ1・サラダ油小さじ1をもみ込む（プリプリ食感のコーティング）"},
  {"order":4,"description":"長ねぎ・にんにく・しょうがをそれぞれみじん切りにする"},
  {"order":5,"description":"ケチャップ・砂糖・鶏がらスープを混ぜ合わせておく"},
  {"order":6,"description":"フライパンにサラダ油を熱し、えびを中火で広げて30秒、返してさらに30秒焼き、半生で一度取り出す"},
  {"order":7,"description":"同じフライパンにごま油を入れ、にんにく・しょうが・豆板醤を弱火で香りが立つまで30秒炒める"},
  {"order":8,"description":"合わせ調味料を加えて煮立たせ、長ねぎとえびを戻して全体に絡める"},
  {"order":9,"description":"片栗粉小さじ1を水大さじ1で溶いた水溶き片栗粉を加える直前にもう一度混ぜてから回し入れ、強火でとろみを付ける"},
  {"order":10,"description":"仕上げにごま油少々を回しかけ、皿に盛る"}
]',
'{
  "calories":320,"protein":22,"fat":12,"carbs":28,"fiber":1.0,
  "vitamins":{"a":15,"b1":0.10,"b2":0.18,"b6":0.20,"b12":1.5,"c":8,"d":0,"e":2.5},
  "minerals":{"iron":1.0,"calcium":60,"zinc":1.5,"magnesium":40,"potassium":350,"sodium":1300}
}',
1, ARRAY['中華','タンパク質','えび','低脂質','プリプリ']),

-- ========== バンバンジー ==========
('バンバンジー（棒棒鶏）', 'lunch', '中華', '蒸す', 30, 2,
'[
  {"name":"鶏むね肉","amount":150,"unit":"g","category":"精肉"},
  {"name":"きゅうり","amount":80,"unit":"g","category":"青果"},
  {"name":"トマト","amount":80,"unit":"g","category":"青果"},
  {"name":"白すりごま","amount":15,"unit":"g","category":"乾物"},
  {"name":"練りごま","amount":15,"unit":"g","category":"調味料"},
  {"name":"醤油","amount":15,"unit":"ml","category":"調味料"},
  {"name":"酢","amount":10,"unit":"ml","category":"調味料"},
  {"name":"砂糖","amount":5,"unit":"g","category":"調味料"},
  {"name":"ラー油","amount":3,"unit":"ml","category":"調味料"},
  {"name":"酒","amount":15,"unit":"ml","category":"調味料"},
  {"name":"長ねぎ","amount":20,"unit":"g","category":"青果"}
]',
'[
  {"order":1,"description":"鶏むね肉の厚い部分にフォークで数か所穴を開ける（火を均一に通すため）"},
  {"order":2,"description":"鶏肉に酒・塩少々をすり込み、室温で15分置く"},
  {"order":3,"description":"鍋にたっぷりの湯を沸かし、長ねぎの青い部分と酒大さじ1を加える"},
  {"order":4,"description":"沸騰したら鶏肉を入れ、再沸騰したらすぐに火を止め、蓋をして15分放置（茹でずに余熱でしっとり調理）"},
  {"order":5,"description":"鶏肉を取り出し粗熱を取り、繊維に沿って手で食べやすく裂く"},
  {"order":6,"description":"きゅうりは斜め薄切りから千切り、トマトはくし切り、長ねぎの白い部分は粗みじん切りにする"},
  {"order":7,"description":"ボウルに練りごまと砂糖を入れ、なめらかになるまで先に練る（後で液体を加えるとダマになりにくい）"},
  {"order":8,"description":"醤油・酢・刻んだ長ねぎ・すりごま・ラー油を順に加えてのばし、ごまだれを完成させる"},
  {"order":9,"description":"皿にきゅうりを敷き、鶏肉、トマトの順に盛り付ける"},
  {"order":10,"description":"食べる直前にたれをかける（先にかけると野菜から水が出てぼやける）"}
]',
'{
  "calories":290,"protein":32,"fat":13,"carbs":12,"fiber":2.5,
  "vitamins":{"a":50,"b1":0.15,"b2":0.20,"b6":0.55,"b12":0.3,"c":15,"d":0,"e":1.8},
  "minerals":{"iron":1.2,"calcium":110,"zinc":1.5,"magnesium":55,"potassium":520,"sodium":900}
}',
1, ARRAY['中華','高タンパク','低糖質','鶏むね','野菜']),

-- ========== ガパオライス ==========
('ガパオライス', 'lunch', 'エスニック', '焼く', 20, 2,
'[
  {"name":"ご飯","amount":200,"unit":"g","category":"その他"},
  {"name":"鶏ひき肉","amount":120,"unit":"g","category":"精肉"},
  {"name":"卵","amount":60,"unit":"g","category":"その他"},
  {"name":"パプリカ赤","amount":40,"unit":"g","category":"青果"},
  {"name":"パプリカ黄","amount":40,"unit":"g","category":"青果"},
  {"name":"玉ねぎ","amount":40,"unit":"g","category":"青果"},
  {"name":"バジル","amount":5,"unit":"g","category":"青果"},
  {"name":"にんにく","amount":5,"unit":"g","category":"青果"},
  {"name":"唐辛子","amount":1,"unit":"g","category":"調味料"},
  {"name":"ナンプラー","amount":15,"unit":"ml","category":"調味料"},
  {"name":"オイスターソース","amount":10,"unit":"ml","category":"調味料"},
  {"name":"砂糖","amount":5,"unit":"g","category":"調味料"},
  {"name":"サラダ油","amount":15,"unit":"ml","category":"調味料"}
]',
'[
  {"order":1,"description":"パプリカ・玉ねぎは1cm角、にんにくはみじん切り、唐辛子は種を取って小口切りにする"},
  {"order":2,"description":"バジルは葉だけを摘み取っておく（茎は香りが弱いので除く）"},
  {"order":3,"description":"オイスターソース・砂糖・ナンプラー2/3量を合わせ調味料として混ぜる（残り1/3は仕上げ用）"},
  {"order":4,"description":"フライパンにサラダ油の半量を熱し、卵を割り入れて目玉焼きを作る（半熟・縁カリッ）。器に取る"},
  {"order":5,"description":"同じフライパンに残りの油を熱し、にんにく・唐辛子を弱火で30秒、香りが立つまで炒める"},
  {"order":6,"description":"鶏ひき肉を加え、強めの中火でほぐしながら色が変わるまで炒める"},
  {"order":7,"description":"玉ねぎを加えて1分、パプリカを加えてさらに1分炒める（食感を残すため炒めすぎない）"},
  {"order":8,"description":"合わせ調味料を回し入れ、強火で水分を飛ばしながら絡める"},
  {"order":9,"description":"火を止めてからバジルを加え、余熱でさっと和える（火を通すと香りが飛ぶ）"},
  {"order":10,"description":"味を見て残りのナンプラーで調整。皿にご飯と一緒に盛り、目玉焼きを乗せる"}
]',
'{
  "calories":620,"protein":28,"fat":20,"carbs":78,"fiber":2.5,
  "vitamins":{"a":120,"b1":0.20,"b2":0.35,"b6":0.45,"b12":0.8,"c":80,"d":1.0,"e":2.2},
  "minerals":{"iron":2.0,"calcium":60,"zinc":2.0,"magnesium":50,"potassium":580,"sodium":1500}
}',
1, ARRAY['エスニック','タンパク質','ビタミンC','人気','タイ料理']),

-- ========== ロールキャベツ ==========
('ロールキャベツ（コンソメ煮）', 'dinner', '洋食', '煮る', 70, 3,
'[
  {"name":"キャベツ","amount":220,"unit":"g","category":"青果"},
  {"name":"合いびき肉","amount":120,"unit":"g","category":"精肉"},
  {"name":"玉ねぎ","amount":50,"unit":"g","category":"青果"},
  {"name":"卵","amount":15,"unit":"g","category":"その他"},
  {"name":"パン粉","amount":10,"unit":"g","category":"乾物"},
  {"name":"牛乳","amount":15,"unit":"ml","category":"乳製品"},
  {"name":"塩","amount":1,"unit":"g","category":"調味料"},
  {"name":"こしょう","amount":0.5,"unit":"g","category":"調味料"},
  {"name":"ナツメグ","amount":0.2,"unit":"g","category":"調味料"},
  {"name":"コンソメ","amount":5,"unit":"g","category":"調味料"},
  {"name":"水","amount":400,"unit":"ml","category":"その他"},
  {"name":"ローリエ","amount":1,"unit":"g","category":"調味料"},
  {"name":"白ワイン","amount":15,"unit":"ml","category":"調味料"}
]',
'[
  {"order":1,"description":"キャベツの芯の周りに包丁で円錐状の切り込みを入れ、芯を抜く"},
  {"order":2,"description":"芯を抜いた穴を上にして鍋に入れ、たっぷりの熱湯で5分ゆで、葉を1枚ずつそっとはがす（破れにくくなる）"},
  {"order":3,"description":"外葉から4枚使う。芯の硬い部分は包丁で薄くそぎ切りにして平らにする（巻きやすくなる）。そぎ切りした芯はみじん切りに"},
  {"order":4,"description":"玉ねぎとキャベツの芯のみじん切りをラップに包んで電子レンジ600Wで1分加熱し、粗熱を取る（生臭み除去＆甘み増し）"},
  {"order":5,"description":"パン粉に牛乳を加えてふやかしておく"},
  {"order":6,"description":"ボウルに合いびき肉・玉ねぎ・パン粉・卵・塩・こしょう・ナツメグを入れ、白っぽく粘りが出るまで2分しっかり練る"},
  {"order":7,"description":"肉だねを4等分し、それぞれ俵形にまとめる"},
  {"order":8,"description":"キャベツの葉の手前に肉だねを置き、軽く巻いて両端を内側にしっかり折りたたみ、最後まで巻き終える"},
  {"order":9,"description":"鍋に巻き終わりを下にして隙間なく並べる（隙間があるとほどけるので、余ったキャベツで埋める）"},
  {"order":10,"description":"水・白ワイン・コンソメ・ローリエを加え、強火で煮立てたらアクを取り、落とし蓋をして弱火で35分煮る"},
  {"order":11,"description":"塩こしょうで味を調え、器に煮汁ごと盛り付ける"}
]',
'{
  "calories":340,"protein":22,"fat":18,"carbs":18,"fiber":3.5,
  "vitamins":{"a":40,"b1":0.25,"b2":0.20,"b6":0.30,"b12":1.0,"c":60,"d":0.5,"e":1.2},
  "minerals":{"iron":2.0,"calcium":85,"zinc":3.0,"magnesium":35,"potassium":520,"sodium":1100}
}',
1, ARRAY['洋食','野菜','タンパク質','作り置き','じっくり']),

-- ========== クリームシチュー ==========
('鶏とごろごろ野菜のクリームシチュー', 'dinner', '洋食', '煮る', 40, 2,
'[
  {"name":"鶏もも肉","amount":120,"unit":"g","category":"精肉"},
  {"name":"じゃがいも","amount":120,"unit":"g","category":"青果"},
  {"name":"にんじん","amount":60,"unit":"g","category":"青果"},
  {"name":"玉ねぎ","amount":80,"unit":"g","category":"青果"},
  {"name":"ブロッコリー","amount":50,"unit":"g","category":"青果"},
  {"name":"バター","amount":20,"unit":"g","category":"乳製品"},
  {"name":"小麦粉","amount":18,"unit":"g","category":"乾物"},
  {"name":"牛乳","amount":250,"unit":"ml","category":"乳製品"},
  {"name":"水","amount":150,"unit":"ml","category":"その他"},
  {"name":"コンソメ","amount":4,"unit":"g","category":"調味料"},
  {"name":"塩","amount":1,"unit":"g","category":"調味料"},
  {"name":"こしょう","amount":0.5,"unit":"g","category":"調味料"},
  {"name":"ローリエ","amount":1,"unit":"g","category":"調味料"}
]',
'[
  {"order":1,"description":"鶏もも肉は3cm角に切り、塩こしょうで下味を付けて10分置く"},
  {"order":2,"description":"じゃがいも・にんじんは乱切り、玉ねぎは1.5cm角、ブロッコリーは小房に分ける"},
  {"order":3,"description":"鍋にバター10gを溶かし、鶏肉を皮目から入れて中火で焼き色を付け、裏返してさっと焼き取り出す"},
  {"order":4,"description":"同じ鍋に玉ねぎ→にんじん→じゃがいもの順に加え、油が回るまで3分炒める"},
  {"order":5,"description":"水・コンソメ・ローリエ・鶏肉を加え、強火で煮立ててアクを取り、蓋をして弱火で10分煮る"},
  {"order":6,"description":"別の小フライパンで残りのバター10gを弱火で溶かし、小麦粉を加えてヘラで混ぜながら2分炒める（粉っぽさを飛ばす）"},
  {"order":7,"description":"一度火を止めて冷たい牛乳を一気に加え、泡立て器でダマがなくなるまで混ぜる（このタイミングが最重要）"},
  {"order":8,"description":"弱火に戻し、混ぜ続けながら7〜8分煮立てとろみを付ける（なめらかなホワイトソース完成）"},
  {"order":9,"description":"ホワイトソースを野菜の鍋に加え、弱火で5分煮込んで全体になじませる"},
  {"order":10,"description":"別ゆで（または電子レンジ加熱）したブロッコリーを加え、塩こしょうで味を調えて完成"}
]',
'{
  "calories":540,"protein":28,"fat":24,"carbs":48,"fiber":5.5,
  "vitamins":{"a":380,"b1":0.30,"b2":0.40,"b6":0.55,"b12":1.2,"c":85,"d":1.0,"e":1.8},
  "minerals":{"iron":1.8,"calcium":280,"zinc":2.2,"magnesium":55,"potassium":900,"sodium":900}
}',
1, ARRAY['洋食','タンパク質','カルシウム','野菜たっぷり','ルーなし']),

-- ========== コブサラダ ==========
('サラダチキンのコブサラダ', 'lunch', '洋食', '生', 15, 1,
'[
  {"name":"サラダチキン","amount":100,"unit":"g","category":"精肉"},
  {"name":"ゆで卵","amount":50,"unit":"g","category":"その他"},
  {"name":"アボカド","amount":50,"unit":"g","category":"青果"},
  {"name":"トマト","amount":80,"unit":"g","category":"青果"},
  {"name":"きゅうり","amount":50,"unit":"g","category":"青果"},
  {"name":"レタス","amount":50,"unit":"g","category":"青果"},
  {"name":"コーン","amount":30,"unit":"g","category":"乾物"},
  {"name":"ベビーチーズ","amount":20,"unit":"g","category":"乳製品"},
  {"name":"マヨネーズ","amount":15,"unit":"g","category":"調味料"},
  {"name":"ケチャップ","amount":8,"unit":"g","category":"調味料"},
  {"name":"プレーンヨーグルト","amount":15,"unit":"g","category":"乳製品"},
  {"name":"レモン汁","amount":5,"unit":"ml","category":"調味料"},
  {"name":"はちみつ","amount":3,"unit":"g","category":"調味料"}
]',
'[
  {"order":1,"description":"レタスは包丁を使わず手で食べやすい大きさにちぎる（切断面が粗くなりドレッシングが絡みやすい）"},
  {"order":2,"description":"サラダチキン・トマト・きゅうり・チーズはそれぞれ1cm角に切り揃える（サイズを統一すると見た目が整う）"},
  {"order":3,"description":"アボカドは縦に一周切り込みを入れて手で2つにひねり、種を取って皮をむき、1cm角に切る"},
  {"order":4,"description":"ゆで卵は8等分のくし切りにする"},
  {"order":5,"description":"小ボウルにマヨネーズ・ケチャップ・ヨーグルト・レモン汁・はちみつ・塩こしょう少々を混ぜ、コブサラダドレッシングを作る"},
  {"order":6,"description":"皿にレタスを敷き詰める"},
  {"order":7,"description":"レタスの上に具材を「列状」に並べる（色が対称になるよう赤系（トマト）と緑系（きゅうり・アボカド）を交互に）"},
  {"order":8,"description":"コーンを散らし、ゆで卵を縁に配置する"},
  {"order":9,"description":"食べる直前にドレッシングを線描きするようにかける（混ぜずに自分で和えるのが本場流）"}
]',
'{
  "calories":440,"protein":30,"fat":28,"carbs":17,"fiber":4.5,
  "vitamins":{"a":120,"b1":0.18,"b2":0.40,"b6":0.55,"b12":0.8,"c":25,"d":1.5,"e":3.0},
  "minerals":{"iron":1.8,"calcium":180,"zinc":2.0,"magnesium":50,"potassium":650,"sodium":900}
}',
1, ARRAY['サラダ','高タンパク','低糖質','ビタミンE','色鮮やか']),

-- ========== グリーンカレー ==========
('鶏とナスのグリーンカレー', 'dinner', 'エスニック', '煮る', 30, 2,
'[
  {"name":"ご飯","amount":180,"unit":"g","category":"その他"},
  {"name":"鶏もも肉","amount":120,"unit":"g","category":"精肉"},
  {"name":"なす","amount":80,"unit":"g","category":"青果"},
  {"name":"パプリカ","amount":40,"unit":"g","category":"青果"},
  {"name":"たけのこ水煮","amount":50,"unit":"g","category":"乾物"},
  {"name":"ココナッツミルク","amount":200,"unit":"ml","category":"その他"},
  {"name":"グリーンカレーペースト","amount":25,"unit":"g","category":"調味料"},
  {"name":"ナンプラー","amount":15,"unit":"ml","category":"調味料"},
  {"name":"砂糖","amount":8,"unit":"g","category":"調味料"},
  {"name":"バジル","amount":3,"unit":"g","category":"青果"},
  {"name":"こぶみかんの葉","amount":1,"unit":"g","category":"調味料"},
  {"name":"サラダ油","amount":10,"unit":"ml","category":"調味料"}
]',
'[
  {"order":1,"description":"鶏もも肉は一口大、なすは1cm厚の半月切り、パプリカは1cm幅、たけのこは食べやすい大きさにそぎ切りにする"},
  {"order":2,"description":"ココナッツミルクは缶を振らずに開け、上澄みの濃厚な部分（クリーム）と下のさらっとした部分に分けておく"},
  {"order":3,"description":"鍋にサラダ油を熱し、グリーンカレーペーストを弱火で1分炒める（辛みと香りを引き出す。長く炒めるほど辛さが増す）"},
  {"order":4,"description":"ココナッツミルクの上澄み（クリーム）部分を加え、ヘラで混ぜながら2分煮詰めて油分を浮き上がらせる"},
  {"order":5,"description":"鶏もも肉を加え、表面の色が変わるまで2分炒め煮する"},
  {"order":6,"description":"残りのココナッツミルク・なす・たけのこ・こぶみかんの葉を加え、弱火で10分静かに煮込む（強く煮立てると雑味が出る）"},
  {"order":7,"description":"パプリカを加えてさらに3分煮る（食感を残す）"},
  {"order":8,"description":"ナンプラーと砂糖を加え、塩味と甘みのバランスを調える（ナンプラーは少しずつ味見しながら）"},
  {"order":9,"description":"火を止めてバジルの葉をちぎって加え、余熱で香りを移す"},
  {"order":10,"description":"皿にご飯を盛り、隣にグリーンカレーを注いで完成"}
]',
'{
  "calories":680,"protein":24,"fat":32,"carbs":75,"fiber":4.0,
  "vitamins":{"a":85,"b1":0.20,"b2":0.30,"b6":0.45,"b12":0.5,"c":55,"d":0.5,"e":2.5},
  "minerals":{"iron":2.5,"calcium":50,"zinc":2.0,"magnesium":60,"potassium":680,"sodium":1300}
}',
1, ARRAY['エスニック','カレー','タンパク質','スパイス','タイ料理']);
