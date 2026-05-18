-- =====================================================
-- 週間献立プランナー 初期スキーマ
-- =====================================================

-- ユーザー設定
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  default_servings integer default 1,
  disliked_ingredients text[] default '{}',
  allergic_ingredients text[] default '{}',
  selected_persona text default 'mei' check (selected_persona in ('mei', 'arisa', 'tsuzuri', 'iris', 'cleio', 'milra')),
  created_at timestamptz default now()
);

-- レシピマスタ
create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'any')) not null,
  cuisine_genre text check (cuisine_genre in ('和食', '洋食', '中華', 'エスニック', 'その他')),
  cooking_method text check (cooking_method in ('焼く', '煮る', '揚げる', '蒸す', '生')),
  cooking_time_minutes integer,
  difficulty_level integer check (difficulty_level between 1 and 5),
  -- ingredients: [{name, amount, unit, category}]
  ingredients jsonb not null default '[]',
  -- steps: [{order, description, image_url?}]
  steps jsonb not null default '[]',
  -- nutrition: {calories, protein, fat, carbs, fiber, vitamins:{a,b1,b2,b6,b12,c,d,e}, minerals:{iron,calcium,zinc,magnesium,potassium,sodium}}
  nutrition jsonb not null default '{}',
  base_servings integer default 1,
  image_urls text[],
  tags text[],
  created_at timestamptz default now()
);

-- 週間献立プラン
create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  week_start_date date not null,
  -- plan: {0:{breakfast,lunch,dinner,...}, 1:{...}, ..., 6:{...}} (0=月)
  plan jsonb not null default '{}',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 固定枠（ロック）
create table if not exists public.locked_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  day_of_week integer check (day_of_week between 0 and 6) not null,
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner')) not null,
  recipe_id uuid references public.recipes(id),
  is_eating_out boolean default false,
  note text,
  unique (user_id, day_of_week, meal_type)
);

-- 在庫
create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  ingredient_name text not null,
  amount numeric,
  unit text,
  expiry_date date,
  added_at timestamptz default now()
);

-- 常備品テンプレート（ユーザーごとに1つ）
create table if not exists public.pantry_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null unique,
  -- items: [{name, default_amount, unit, category}]
  items jsonb not null default '[]'
);

-- 体調フラグ
create table if not exists public.condition_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  date date not null,
  is_tired boolean default false,
  unique (user_id, date)
);

-- 買い物リスト履歴
create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  meal_plan_id uuid references public.meal_plans(id),
  selected_meals jsonb,
  generated_list jsonb,
  created_at timestamptz default now()
);

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

alter table public.users enable row level security;
alter table public.recipes enable row level security;
alter table public.meal_plans enable row level security;
alter table public.locked_meals enable row level security;
alter table public.inventory enable row level security;
alter table public.pantry_templates enable row level security;
alter table public.condition_flags enable row level security;
alter table public.shopping_lists enable row level security;

-- users: 本人のみ読み書き
create policy "users_self" on public.users
  for all using (auth.uid() = id);

-- recipes: 全ユーザー読み取り可、書き込みはサービスロールのみ
create policy "recipes_read_all" on public.recipes
  for select using (true);

-- meal_plans: 本人のみ
create policy "meal_plans_self" on public.meal_plans
  for all using (auth.uid() = user_id);

-- locked_meals: 本人のみ
create policy "locked_meals_self" on public.locked_meals
  for all using (auth.uid() = user_id);

-- inventory: 本人のみ
create policy "inventory_self" on public.inventory
  for all using (auth.uid() = user_id);

-- pantry_templates: 本人のみ
create policy "pantry_templates_self" on public.pantry_templates
  for all using (auth.uid() = user_id);

-- condition_flags: 本人のみ
create policy "condition_flags_self" on public.condition_flags
  for all using (auth.uid() = user_id);

-- shopping_lists: 本人のみ
create policy "shopping_lists_self" on public.shopping_lists
  for all using (auth.uid() = user_id);

-- =====================================================
-- ユーザー登録トリガー (auth.usersからpublic.usersへ自動コピー)
-- =====================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
