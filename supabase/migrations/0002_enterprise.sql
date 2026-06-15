-- 0002_enterprise.sql
-- ---------------------------------------------------------------------------
-- Enterprise (multi-tenant) scaffolding. This is the Supabase replacement for
-- firestore.rules.enterprise: per-tenant isolation, an append-only audit
-- ledger, and role-gated reads. Tenant + role are read from the JWT
-- app_metadata claims that the SSO/IdP provisioner sets on the user.
--
-- This is a future enterprise tier — it deploys safely and is inert until you
-- start setting tenant claims and writing tenant rows. Apply the same way as
-- 0001 (Supabase SQL editor or `supabase db push`).
-- ---------------------------------------------------------------------------

create schema if not exists enterprise;

-- ----- Claim helpers (tenant + role come from JWT app_metadata) -------------
create or replace function enterprise.tenant_id() returns text
  language sql stable as $$ select auth.jwt() -> 'app_metadata' ->> 'tenant_id' $$;

create or replace function enterprise.role() returns text
  language sql stable as $$ select auth.jwt() -> 'app_metadata' ->> 'role' $$;

-- ----- Append-only, hash-chained audit ledger (SupabaseAuditStore writes here)
create table if not exists enterprise.audit_log (
  event_id      uuid primary key,
  ts            bigint not null,            -- event timestamp (epoch ms), matches AuditEvent.timestamp
  actor         jsonb  not null,            -- { uid, email, ip, userAgent }
  action        text   not null,
  resource      text   not null,
  tenant_id     text,
  outcome       text   not null,
  previous_hash text   not null,
  hash          text   not null,
  created_at    timestamptz not null default now()
);
create index if not exists audit_log_ts_idx     on enterprise.audit_log (ts);
create index if not exists audit_log_tenant_idx on enterprise.audit_log (tenant_id);

alter table enterprise.audit_log enable row level security;

-- Insert if you belong to the tenant; read only as an org_admin of that tenant.
drop policy if exists audit_insert_tenant on enterprise.audit_log;
create policy audit_insert_tenant on enterprise.audit_log
  for insert with check (tenant_id = enterprise.tenant_id());

drop policy if exists audit_read_admin on enterprise.audit_log;
create policy audit_read_admin on enterprise.audit_log
  for select using (tenant_id = enterprise.tenant_id() and enterprise.role() = 'org_admin');
-- No UPDATE/DELETE policies → the ledger is append-only (tamper-evidence holds).

-- ----- Per-user tenant docs: owner read/write; org admins may read ----------
create table if not exists enterprise.tenant_users (
  tenant_id  text not null,
  user_id    uuid not null references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);
alter table enterprise.tenant_users enable row level security;

drop policy if exists tenant_users_owner on enterprise.tenant_users;
create policy tenant_users_owner on enterprise.tenant_users
  for all
  using      (tenant_id = enterprise.tenant_id() and user_id = auth.uid())
  with check (tenant_id = enterprise.tenant_id() and user_id = auth.uid());

drop policy if exists tenant_users_admin_read on enterprise.tenant_users;
create policy tenant_users_admin_read on enterprise.tenant_users
  for select using (tenant_id = enterprise.tenant_id() and enterprise.role() = 'org_admin');

-- ----- Cohort aggregates: managers/admins read; service role writes only ----
create table if not exists enterprise.tenant_aggregates (
  tenant_id    text not null,
  aggregate_id text not null,
  data         jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now(),
  primary key (tenant_id, aggregate_id)
);
alter table enterprise.tenant_aggregates enable row level security;

drop policy if exists aggregates_read_mgr on enterprise.tenant_aggregates;
create policy aggregates_read_mgr on enterprise.tenant_aggregates
  for select using (
    tenant_id = enterprise.tenant_id()
    and enterprise.role() in ('manager', 'org_admin')
  );
-- No write policy → only the service role (which bypasses RLS) writes aggregates.
