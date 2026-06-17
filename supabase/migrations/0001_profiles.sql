-- 0001_profiles.sql
-- ---------------------------------------------------------------------------
-- Free-tier user profiles. One row per authenticated user, owner-scoped via
-- Row-Level Security. This is the Supabase replacement for the Firestore
-- `users/{uid}` collection and the owner-scoped firestore.rules.
--
-- It mirrors the old rules exactly: the same fields, the 8 KB cap on the
-- progress payload, deny-by-default access, and a server-maintained
-- updated_at (the old rules required updatedAt == request.time).
--
-- Apply: paste into the Supabase SQL editor, or `supabase db push` with the CLI.
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  saved_sector       text,
  saved_focus        text,
  playbook_overrides text,
  renewal_date       text,  -- ISO yyyy-mm-dd; kept as text to match the client contract
  progress_json      text check (progress_json is null or char_length(progress_json) <= 8192),
  -- Monetization plan: 'free' (10 AI calls/day) or 'pro' (unlimited, $4.99/mo).
  -- Flipped to 'pro' by the Stripe webhook (functions/api/stripe-webhook.ts).
  plan               text not null default 'free' check (plan in ('free', 'pro')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.profiles is
  'Per-user CNA Career Playbook profile + progress. Owner-scoped via RLS.';

-- Keep updated_at honest on every write (replaces the old updatedAt == request.time rule).
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Monetization integrity: a normal user must NOT be able to grant themselves Pro
-- by PATCHing their own row. Only the service role (used by the Stripe webhook)
-- may change `plan`; for anyone else, any attempted change is silently reverted.
create or replace function public.lock_plan_column()
returns trigger
language plpgsql
as $$
begin
  if new.plan is distinct from old.plan and current_user <> 'service_role' then
    new.plan = old.plan;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_lock_plan on public.profiles;
create trigger profiles_lock_plan
  before update on public.profiles
  for each row execute function public.lock_plan_column();

-- ----- Row-Level Security: a user may only read/write their own row. --------
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- No DELETE policy is defined, so deletes are denied by default — this matches
-- the old deny-by-default Firestore rules (the account row is removed only via
-- the auth.users cascade when the user is deleted).
