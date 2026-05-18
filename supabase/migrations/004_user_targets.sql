-- =====================================================
-- ユーザー目標値: 目標カロリーと PFC バランス
-- =====================================================
-- 注: 003_meal_plans_unique.sql は別途 Supabase SQL Editor から適用済み

alter table public.users
  add column if not exists target_calories integer not null default 2000
    check (target_calories between 1000 and 4000),
  add column if not exists target_pfc_protein integer not null default 20
    check (target_pfc_protein between 10 and 30),
  add column if not exists target_pfc_fat integer not null default 25
    check (target_pfc_fat between 15 and 35),
  add column if not exists target_pfc_carbs integer not null default 55
    check (target_pfc_carbs between 40 and 70);

-- 合計が 100% になることを保証
alter table public.users
  drop constraint if exists users_target_pfc_sum;
alter table public.users
  add constraint users_target_pfc_sum
  check (target_pfc_protein + target_pfc_fat + target_pfc_carbs = 100);
