-- =====================================================
-- 初回ユーザー導線: 自炊頻度・目標・完了日時
-- =====================================================

alter table public.users
  add column if not exists self_cook_frequency text not null default 'sometimes'
    check (self_cook_frequency in ('rarely', 'sometimes', 'often')),
  add column if not exists planning_goal text not null default 'balanced'
    check (planning_goal in ('balanced', 'time_saving', 'budget', 'protein', 'family')),
  add column if not exists onboarding_completed_at timestamptz;
