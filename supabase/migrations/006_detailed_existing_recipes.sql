-- =====================================================
-- 既存25レシピの手順を詳細化（プロのコツを反映）
-- 出典: 白ごはん.com / 三越伊勢丹FOODIE / みんなのきょうの料理 /
--       オレンジページ / キッコーマン / クラシル / カゴメ /
--       樋口直哉(TravelingFoodLab) / dressing / macaroni 等
-- =====================================================

-- ========== 朝食 ==========

update public.recipes set steps = '[
  {"order":1,"description":"納豆のフタを開け、付属のタレと辛子は使わず取り除く（醤油で塩味を調整するため）"},
  {"order":2,"description":"納豆だけを箸で50回ほどしっかり混ぜる（タレを入れる前に練ることで粘りと旨味が最大化）"},
  {"order":3,"description":"ねぎは小口切り、海苔があれば手でちぎっておく"},
  {"order":4,"description":"納豆に醤油とねぎを加えてさらに10回混ぜる"},
  {"order":5,"description":"温かいご飯を茶碗に盛り、納豆を中央にこんもり乗せる（食べる時に好みで混ぜる）"}
]'::jsonb where name = '納豆ご飯';

update public.recipes set steps = '[
  {"order":1,"description":"卵は割れた殻が入らないよう、まず別の小さい器に1個割り入れて確認する"},
  {"order":2,"description":"温かいご飯を茶碗に盛り、中央に箸でくぼみを作る"},
  {"order":3,"description":"くぼみに卵を流し入れる（黄身が崩れないように静かに）"},
  {"order":4,"description":"醤油を黄身の周りに数滴ずつ垂らす（黄身に直接かけると味が濃くなりすぎる）"},
  {"order":5,"description":"白身を切るように箸で2〜3回だけ混ぜて食べる（混ぜすぎると粘りで重くなる）"}
]'::jsonb where name = '卵かけご飯';

update public.recipes set steps = '[
  {"order":1,"description":"レタスは手でちぎって冷水に5分浸け、シャキッとさせてから水気をよく切る"},
  {"order":2,"description":"トマトはヘタを取り、くし切りにする"},
  {"order":3,"description":"食パンをトースターで2〜3分、表面がきつね色になるまで焼く"},
  {"order":4,"description":"フライパンに油（分量外少々）を弱火で熱し、卵を割り入れる"},
  {"order":5,"description":"白身が固まり始めたら水大さじ1を入れて蓋をし、30秒蒸し焼きにする（半熟ふっくら）"},
  {"order":6,"description":"焼き上がった食パンにバターを塗り、目玉焼きを乗せる"},
  {"order":7,"description":"皿にトースト・レタス・トマトを盛り、目玉焼きに塩を軽くふる"}
]'::jsonb where name = 'トースト＋目玉焼き＋サラダ';

update public.recipes set steps = '[
  {"order":1,"description":"バナナは1cm厚の輪切りにする"},
  {"order":2,"description":"小鍋にオートミールと牛乳を入れ、中火で混ぜながら温める"},
  {"order":3,"description":"沸騰直前で弱火に落とし、とろみが出るまで3〜4分、ヘラで底を混ぜながら煮る（焦げ付き防止）"},
  {"order":4,"description":"火を止めて2分置き、好みのとろみまでなじませる"},
  {"order":5,"description":"器に盛り、バナナを並べて、はちみつを糸を引くように回しかける"}
]'::jsonb where name = 'オートミール粥';

update public.recipes set steps = '[
  {"order":1,"description":"鮭は両面に塩少々（分量外）を振り10分置いて、出てきた水分を拭く（臭み取り）"},
  {"order":2,"description":"豆腐は1.5cm角に切り、わかめは水で戻して水気を絞る"},
  {"order":3,"description":"魚焼きグリルを2分予熱し、鮭の皮目を下にして強めの中火で4分焼く"},
  {"order":4,"description":"返してさらに3分焼く（皮目パリッ・身ふっくら）"},
  {"order":5,"description":"鮭を焼いている間に、小鍋にだしを温めて豆腐とわかめを加え、煮立つ直前で火を弱める"},
  {"order":6,"description":"だしの一部を玉杓子に取り、味噌を溶きながら鍋に戻す（味噌を直接入れると塊が残る）"},
  {"order":7,"description":"沸騰させないように温めて火を止める（沸かすと風味が飛ぶ）"},
  {"order":8,"description":"ご飯を茶碗に盛り、鮭・味噌汁とともに膳に並べる"}
]'::jsonb where name = '味噌汁＋焼き鮭＋ご飯';

update public.recipes set steps = '[
  {"order":1,"description":"いちごはヘタを取り半分に切る。ブルーベリーは洗って水気を切る"},
  {"order":2,"description":"グラスを冷蔵庫で5分冷やしておく（パフェがダレない）"},
  {"order":3,"description":"グラスの底にヨーグルトの1/3量を入れる"},
  {"order":4,"description":"グラノーラの半量→残りのヨーグルト半量→グラノーラの残り→フルーツの順に層状に重ねる"},
  {"order":5,"description":"最上層に残りのヨーグルトとフルーツを飾り、はちみつを糸を引くようにかける"}
]'::jsonb where name = 'ヨーグルトパフェ';

update public.recipes set steps = '[
  {"order":1,"description":"卵・牛乳・砂糖をバットでよく混ぜる（卵液）"},
  {"order":2,"description":"食パンを半分に切り、フォークで両面に数か所穴を開ける（卵液を素早く浸み込ませる）"},
  {"order":3,"description":"卵液に食パンを並べ、片面5分→裏返して5分浸す（時間に余裕があれば冷蔵庫で1時間〜一晩浸すとふわとろになる）"},
  {"order":4,"description":"フライパンを中火で温め、バターを溶かす"},
  {"order":5,"description":"バターが泡立ったら浸したパンを入れ、片面を2分焼いてきれいな焼き色をつける"},
  {"order":6,"description":"裏返したら弱火に落とし蓋をして、2〜3分蒸し焼きにする（中までふっくら）"},
  {"order":7,"description":"皿に盛り、メープルシロップを上からかけて完成"}
]'::jsonb where name = 'フレンチトースト';

update public.recipes set steps = '[
  {"order":1,"description":"豆腐は2cm角に切り、ペーパーで包んで5分置き水切りする（味が薄まらない）"},
  {"order":2,"description":"ほうれん草はさっと茹で冷水にとり、水気を絞って3cm長に切る（アク抜き）"},
  {"order":3,"description":"にんじんは千切りにする"},
  {"order":4,"description":"フライパンにごま油を熱し、にんじんを先に1分炒める（火が通りにくい順）"},
  {"order":5,"description":"豆腐を加え、崩さないように木べらで返しながら焼き色を付ける"},
  {"order":6,"description":"ほうれん草を加え、醤油・みりんを鍋肌から回し入れて全体を1分炒め合わせる"},
  {"order":7,"description":"ご飯と一緒に皿に盛り付ける"}
]'::jsonb where name = '豆腐と野菜の炒め定食';

-- ========== 昼食 ==========

update public.recipes set steps = '[
  {"order":1,"description":"鶏もも肉は皮目から3cm角に切り、ポリ袋に入れる"},
  {"order":2,"description":"砂糖小さじ1/2（分量外）を加えてもみ込む（保水効果でジューシーに）"},
  {"order":3,"description":"醤油・みりん・おろし生姜・おろしにんにく少々を加えて15分以上漬け込む"},
  {"order":4,"description":"キャベツは芯を除いて細く千切りにし、冷水に浸けてシャキッとさせる"},
  {"order":5,"description":"鶏肉から余分な漬け汁を軽く拭き取り、片栗粉を全体にしっかりまぶす"},
  {"order":6,"description":"170℃の油で2分30秒揚げ、一旦取り出して5分休ませる（余熱で中まで火を通す）"},
  {"order":7,"description":"油を180℃に上げ、再度1分弱、全体がきつね色になるまで二度揚げする（カリッと感）"},
  {"order":8,"description":"網に上げて余分な油を切る"},
  {"order":9,"description":"皿にご飯・水気を切ったキャベツ・唐揚げを盛り付ける"}
]'::jsonb where name = '鶏の唐揚げ定食';

update public.recipes set steps = '[
  {"order":1,"description":"豚ロースは脂身と赤身の境目に2cm間隔で切り込みを入れる（縮み防止）"},
  {"order":2,"description":"玉ねぎは繊維と垂直に5mm厚にスライス"},
  {"order":3,"description":"醤油・みりん・おろし生姜を合わせ調味料として混ぜておく"},
  {"order":4,"description":"豚肉の片面のみに片栗粉を薄くまぶす（タレが絡みやすくなる）"},
  {"order":5,"description":"フライパンにサラダ油を中火で熱し、豚肉を片栗粉の付いた面から焼き、色が変わったら返してさらに30秒"},
  {"order":6,"description":"一旦豚肉を取り出し、同じフライパンで玉ねぎを2分炒める"},
  {"order":7,"description":"豚肉を戻し、合わせ調味料を回し入れて強火で30秒絡める"},
  {"order":8,"description":"ご飯・千切りキャベツとともに盛り付ける"}
]'::jsonb where name = '豚肉と野菜の生姜焼き定食';

update public.recipes set steps = '[
  {"order":1,"description":"鮭の表面の水分をペーパーで完全に拭き取り、両面に塩こしょうをふる"},
  {"order":2,"description":"全体に薄く小麦粉をまぶし、余分な粉ははたき落とす（薄衣がポイント）"},
  {"order":3,"description":"ブロッコリーは小房に分け、塩茹で（湯1Lに塩小さじ1）2分→ザルにあげる"},
  {"order":4,"description":"レモンはくし切りにする"},
  {"order":5,"description":"冷たいフライパンにバターの半量とサラダ油少々（分量外）を入れ、弱めの中火で温める"},
  {"order":6,"description":"バターが泡立ち香りが出たら、鮭の皮目を下にして並べ、3分動かさずに焼く"},
  {"order":7,"description":"裏返してさらに2分焼き、最後に残りのバターを加えて溶かしたバターを鮭にかけながら（アロゼ）30秒"},
  {"order":8,"description":"皿にご飯・ブロッコリー・鮭を盛り、レモンを添えてフライパンのバターをかける"}
]'::jsonb where name = '鮭のムニエル定食';

update public.recipes set steps = '[
  {"order":1,"description":"ごぼうはたわしで皮をこそげ落とし、ささがきにして酢水（水500ml＋酢小さじ1）に5分浸けてアク抜き"},
  {"order":2,"description":"大根・にんじんは5mm厚のいちょう切り、こんにゃくは手でちぎる（味がしみやすい）"},
  {"order":3,"description":"豚バラは3cm長さに切る"},
  {"order":4,"description":"鍋にごま油を熱し、水気を切ったごぼうを2分炒めて香りを出す"},
  {"order":5,"description":"豚バラを加えて色が変わるまで炒め、大根・にんじん・こんにゃくを順に加えて全体に油を回す"},
  {"order":6,"description":"だしを加え、強火で煮立ててアクを丁寧に取る"},
  {"order":7,"description":"弱火にして蓋をし、根菜が柔らかくなるまで15分煮る"},
  {"order":8,"description":"火を止めて味噌を玉杓子の中で溶かしながら鍋に戻し入れる（沸騰させない）"},
  {"order":9,"description":"ご飯と一緒に椀によそって完成"}
]'::jsonb where name = '豚汁定食';

update public.recipes set steps = '[
  {"order":1,"description":"中華麺を表示時間通りに茹で、流水でぬめりを洗い氷水でしっかり冷やして締める"},
  {"order":2,"description":"水気をペーパーでしっかり拭き取り、ごま油小さじ1（分量内）をまぶしてくっつき防止"},
  {"order":3,"description":"卵は溶きほぐして塩少々を加え、薄焼き卵にして千切り（錦糸卵）にする"},
  {"order":4,"description":"きゅうりは千切り、トマトはくし切り、ハムは細切りにする"},
  {"order":5,"description":"醤油・酢・砂糖・残りのごま油・水大さじ1を混ぜてタレを作り、冷蔵庫で5分冷やす"},
  {"order":6,"description":"皿に麺を盛り、ハム・きゅうり・トマト・錦糸卵を放射状に色よく並べる"},
  {"order":7,"description":"中央に紅しょうがや白ごまを散らす（あれば）"},
  {"order":8,"description":"食べる直前にタレを全体に回しかける"}
]'::jsonb where name = '冷やし中華';

update public.recipes set steps = '[
  {"order":1,"description":"玉ねぎは1cm角、じゃがいも・にんじんは乱切りにする"},
  {"order":2,"description":"鶏もも肉は3cm角に切り、塩こしょう（分量外）で下味"},
  {"order":3,"description":"鍋にサラダ油を熱し、玉ねぎの半量を中火でしんなりするまで5分炒める（飴色一歩手前で旨味アップ）"},
  {"order":4,"description":"鶏肉を加え皮目から焼き色が付くまで2分炒める"},
  {"order":5,"description":"残りの玉ねぎ・にんじん・じゃがいもを加え、油が回るまで2分炒める"},
  {"order":6,"description":"水500ml（分量外）を加え、強火で煮立ててアクを取る"},
  {"order":7,"description":"弱火に落とし蓋をして、にんじん・じゃがいもが柔らかくなるまで15分煮る"},
  {"order":8,"description":"一旦火を止めてカレールーを溶かし入れる（沸騰中だとダマになる）"},
  {"order":9,"description":"再び弱火で10分煮込み、とろみを付ける。ご飯を皿に盛りカレーをかける"}
]'::jsonb where name = 'カレーライス';

update public.recipes set steps = '[
  {"order":1,"description":"スパゲッティを表示時間＋1分茹で、ザルにあげサラダ油小さじ1（分量外）をまぶし冷ましておく（喫茶店風のもちもち食感に。時間があれば冷蔵庫で30分以上寝かせる）"},
  {"order":2,"description":"玉ねぎは5mm厚のスライス、ピーマンは5mm幅の輪切り、ウインナーは斜め薄切りにする"},
  {"order":3,"description":"フライパンにバターを溶かし、ウインナーを中火で焼き目が付くまで炒める"},
  {"order":4,"description":"玉ねぎ→ピーマンの順に加え、玉ねぎがしんなりするまで2分炒める"},
  {"order":5,"description":"フライパンの端に具材を寄せ、空いた場所にケチャップを入れて30秒煮詰める（酸味を飛ばす）"},
  {"order":6,"description":"茹で置いたパスタを加え、全体にケチャップを絡めながら強めの中火で炒める"},
  {"order":7,"description":"塩こしょうで味を調え、皿に盛る"},
  {"order":8,"description":"好みで粉チーズ・タバスコ（分量外）を添える"}
]'::jsonb where name = 'パスタ ナポリタン';

update public.recipes set steps = '[
  {"order":1,"description":"鶏むね肉は厚みのある部分にフォークで穴を開け、塩・酒少々を揉み込んで10分置く"},
  {"order":2,"description":"耐熱袋に鶏肉を入れて口を閉じ、沸騰した湯に入れて火を止め、蓋をして15分余熱調理（しっとり）"},
  {"order":3,"description":"うどんは表示時間通りに茹で、冷水で締めてしっかり水気を切る"},
  {"order":4,"description":"きゅうりは千切り、大葉は細切り、白ごまは指先で軽くひねって香りを立てる"},
  {"order":5,"description":"鶏肉を袋から取り出し、繊維に沿って手で食べやすく裂く"},
  {"order":6,"description":"醤油・酢・ごま油・白ごまを混ぜてタレを作る"},
  {"order":7,"description":"器にうどんを盛り、鶏肉・きゅうり・大葉を乗せてタレを回しかける"}
]'::jsonb where name = '蒸し鶏の冷やしうどん';

update public.recipes set steps = '[
  {"order":1,"description":"豆腐はペーパーで包み重しをして10分水切りし、1.5cm角に切る"},
  {"order":2,"description":"沸騰した湯に塩少々を加え、豆腐をさっと茹でてザルにあげる（水っぽさ・大豆臭を除去）"},
  {"order":3,"description":"にんにく・生姜はみじん切りにする"},
  {"order":4,"description":"フライパンにごま油を熱し、にんにく・生姜・豆板醤を弱火で30秒、香りが立つまで炒める"},
  {"order":5,"description":"豚ひき肉を加え、強めの中火でほぐしながら色が変わって脂が透き通るまで炒める（旨味が引き出る）"},
  {"order":6,"description":"甜麺醤を加え、肉に絡めながら1分炒める"},
  {"order":7,"description":"鶏ガラスープを注ぎ、煮立ったら豆腐を加え、優しく混ぜながら3分煮る"},
  {"order":8,"description":"片栗粉を水大さじ1で溶いた水溶き片栗粉を回し入れる直前にもう一度混ぜ、強火でとろみを付ける"},
  {"order":9,"description":"仕上げにごま油を回しかけ、ご飯と一緒に盛る"}
]'::jsonb where name = '麻婆豆腐定食';

-- ========== 夕食 ==========

update public.recipes set steps = '[
  {"order":1,"description":"じゃがいもは皮をむき4等分し、面取りして水にさらす（煮崩れ防止）"},
  {"order":2,"description":"にんじんは乱切り、玉ねぎはくし切り、糸こんにゃくは食べやすく切って下茹で"},
  {"order":3,"description":"牛肉は食べやすく切り、酒少々（分量外）をふっておく"},
  {"order":4,"description":"鍋にサラダ油（分量外）を熱し、牛肉を強火で色が変わるまで炒める"},
  {"order":5,"description":"水気を切ったじゃがいも・にんじん・玉ねぎを加え、油が回るまで2分炒める"},
  {"order":6,"description":"だし・砂糖・みりん・酒を加えて煮立てる"},
  {"order":7,"description":"アクを取り、糸こんにゃくと醤油を加え、落とし蓋をして弱めの中火で15分煮る"},
  {"order":8,"description":"煮汁が1/3量になったら火を止め、10分置いて味を含ませる（冷める時に味が入る）"},
  {"order":9,"description":"器に盛り、好みで絹さや（分量外）を添える"}
]'::jsonb where name = '肉じゃが';

update public.recipes set steps = '[
  {"order":1,"description":"玉ねぎはみじん切りにし、バターで透き通るまで5分炒めて完全に冷ます（粗熱が肉だねに伝わると脂が溶け出す）"},
  {"order":2,"description":"パン粉に牛乳を加えてふやかしておく"},
  {"order":3,"description":"ボウルに合いびき肉と塩を入れ、白っぽく粘りが出るまで30秒練る（先に塩で粘りを出す）"},
  {"order":4,"description":"冷めた玉ねぎ・卵・パン粉・こしょう・ナツメグ少々（分量外）を加え、よく混ぜる"},
  {"order":5,"description":"両手にサラダ油（分量外）を塗り、肉だねを2等分して空気を抜くようにキャッチボールしながら成形"},
  {"order":6,"description":"中央を指で押してくぼみを作る（焼きむら防止）"},
  {"order":7,"description":"フライパンを中火で熱し、サラダ油（分量外）を引き、ハンバーグを並べて2分焼く"},
  {"order":8,"description":"返したら水50ml（分量外）を入れ蓋をして、弱めの中火で6〜8分蒸し焼き"},
  {"order":9,"description":"竹串を中央に刺して透明な肉汁が出れば焼き上がり。取り出して皿へ"},
  {"order":10,"description":"フライパンの肉汁にデミグラスソースを加えて温め、ハンバーグにかける"}
]'::jsonb where name = 'ハンバーグ（デミグラスソース）';

update public.recipes set steps = '[
  {"order":1,"description":"かれいはウロコがあれば包丁の背でこそげ取り、内臓を取り除く（切り身ならそのまま）"},
  {"order":2,"description":"皮目に十文字の飾り包丁を入れる（味の浸透＆煮崩れ防止）"},
  {"order":3,"description":"バットに並べ熱湯を全体に回しかけ、すぐ氷水に取って表面の汚れを優しく洗う（霜降り）"},
  {"order":4,"description":"水気をペーパーで完全に拭く"},
  {"order":5,"description":"生姜は薄切り、または針生姜にする"},
  {"order":6,"description":"鍋に醤油・みりん・砂糖・酒・水100ml・生姜を入れて煮立てる（魚を入れる前に煮立てておくと身崩れしない）"},
  {"order":7,"description":"かれいを皮目を上にして並べ、アルミホイルで落とし蓋をして弱めの中火で10分煮る"},
  {"order":8,"description":"煮汁をスプーンで魚にかけながら2分、ツヤを出して完成。器に皮目を上にして盛り、煮汁と針生姜を添える"}
]'::jsonb where name = '白身魚の煮付け';

update public.recipes set steps = '[
  {"order":1,"description":"豚バラブロックは4cm角に切る"},
  {"order":2,"description":"フライパンを油なしで熱し、豚バラの表面全面に焼き色を付ける（余分な脂を落としつつ旨味を閉じ込める）"},
  {"order":3,"description":"鍋に豚肉とかぶる量の水・長ねぎの青い部分（分量外）・生姜の薄切り半量を入れ、強火で煮立てる"},
  {"order":4,"description":"アクを丁寧にすくい、弱火に落として蓋をずらして1時間下茹でする（圧力鍋なら15分加圧→自然放置）"},
  {"order":5,"description":"豚肉をザルにあげ、流水で表面の脂を洗い流す"},
  {"order":6,"description":"鍋に豚肉と残りの生姜・酒・水400ml（分量外）・砂糖を入れ、落とし蓋で20分煮る"},
  {"order":7,"description":"みりんを加えてさらに10分、醤油を加えてさらに15分煮る（調味料を順に入れることでムラなく染みる）"},
  {"order":8,"description":"火を止めて30分以上置く（冷める時に味が深く入る）"},
  {"order":9,"description":"再び弱火にかけ、煮汁が半量になるまで煮詰める"},
  {"order":10,"description":"半割りのゆで卵を加えて10分含め煮し、器に盛って煮汁をかける"}
]'::jsonb where name = '豚の角煮';

update public.recipes set steps = '[
  {"order":1,"description":"鶏もも肉は皮目にフォークで数か所穴を開け、3cm角に切り、塩こしょうで下味を付け10分置く"},
  {"order":2,"description":"玉ねぎはみじん切り、にんにくは芽を取って包丁の腹でつぶす"},
  {"order":3,"description":"冷たいフライパンにオリーブオイルとにんにくを入れて弱火で1分、香りを引き出す"},
  {"order":4,"description":"中火に上げ、鶏肉を皮目を下にして並べ、動かさず3分焼いてパリッと焼き色を付ける"},
  {"order":5,"description":"返してさらに1分焼き、玉ねぎを加えて2分炒める"},
  {"order":6,"description":"トマト缶を加え、缶に半量の水（約100ml）を入れて洗い流すように鍋に注ぐ"},
  {"order":7,"description":"塩こしょうで下味、弱火で蓋をして20分煮込む（時々混ぜて焦げ付き防止）"},
  {"order":8,"description":"火を止めバジルをちぎって散らし、5分蓋をして香りを移してから器に盛る"}
]'::jsonb where name = '鶏のトマト煮込み';

update public.recipes set steps = '[
  {"order":1,"description":"さばは半身を半分に切り（2切れに）、皮目に十文字の切り込みを入れる"},
  {"order":2,"description":"ザルに並べ、熱湯を表面が白くなるまで回しかける（霜降り）"},
  {"order":3,"description":"流水で血合いや表面の汚れを優しく洗い、水気をペーパーで丁寧に拭く"},
  {"order":4,"description":"生姜は皮ごと薄切りにする"},
  {"order":5,"description":"フライパンまたは浅鍋に水100ml・酒・みりん・砂糖・生姜を入れ、強火で煮立てる"},
  {"order":6,"description":"味噌の2/3量を煮汁の少量で溶いてから加える（先入れの味付け味噌）"},
  {"order":7,"description":"さばを皮目を上にして並べ、煮汁をかけてからアルミホイルの落とし蓋をして、弱めの中火で10分煮る"},
  {"order":8,"description":"残りの味噌を同様に煮汁で溶いて加え、味噌の風味を立てる（仕上げ味噌）。煮汁をかけながら3分煮る"},
  {"order":9,"description":"皿に盛り、煮汁を上からかけて完成"}
]'::jsonb where name = 'さばの味噌煮';

update public.recipes set steps = '[
  {"order":1,"description":"鯵は内臓・エラを取り（または下処理済みを購入）、表面の水分を拭いて両面に塩を振り10分置く"},
  {"order":2,"description":"ごぼうは斜め薄切りにして酢水でアク抜き、大根・にんじんはいちょう切り、里芋は皮をむき1.5cm角に切る"},
  {"order":3,"description":"鍋にごま油（分量外少々）を熱し、豚こまをほぐしながら炒める"},
  {"order":4,"description":"水気を切ったごぼう→大根→にんじん→里芋の順に加え、油が回るまで炒める"},
  {"order":5,"description":"だしを加え、煮立ったらアクを取り、蓋をして弱火で15分煮る（里芋が柔らかくなるまで）"},
  {"order":6,"description":"豚汁を煮ている間にグリルを予熱、鯵の表面の水を拭いて中火で皮目から5分、返して5分焼く"},
  {"order":7,"description":"豚汁の鍋を火から下ろし、味噌を玉杓子で溶きながら加える（沸かさない）"},
  {"order":8,"description":"再び弱火で温め直し、塩で味を調える"},
  {"order":9,"description":"豚汁を椀によそい、鯵は皿に盛り大根おろし（あれば）を添えて完成"}
]'::jsonb where name = '野菜たっぷり豚汁＋焼き魚';

update public.recipes set steps = '[
  {"order":1,"description":"鍋にたっぷりの湯を沸かし、塩を1.3%濃度（湯1Lに塩13g）で加える（やや濃いめがコク）"},
  {"order":2,"description":"パスタを表示時間より1分短く茹で始める"},
  {"order":3,"description":"にんにくは芽を取って薄切り、鷹の爪は半分にちぎって種を出す、パセリはみじん切りにする"},
  {"order":4,"description":"冷たいフライパンにオリーブオイル・にんにく・鷹の爪を入れ、弱火でじっくり香りと色を出す（10分・焦がさない）"},
  {"order":5,"description":"にんにくが軽いきつね色になったら、アンチョビを加えてヘラで崩しながら30秒"},
  {"order":6,"description":"パスタの茹で汁お玉1杯をフライパンに加え、強火で煽って白濁・とろみが出るまで30秒乳化させる"},
  {"order":7,"description":"茹で上がったパスタの水気を軽く切り（茹で汁が少し付いた状態でOK）フライパンに加える"},
  {"order":8,"description":"中火でフライパンを煽りながらソースを絡め、必要なら茹で汁少々で固さを調整"},
  {"order":9,"description":"火を止めてパセリを散らし、皿に盛る"}
]'::jsonb where name = 'ペペロンチーノ';
