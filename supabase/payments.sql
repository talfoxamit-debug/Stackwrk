-- Optional: durable log of Stripe payment events (webhook → /api/webhooks/stripe).
-- Run once in the Supabase SQL editor. The webhook works without it; this just
-- keeps a record you can query. RLS on, service-role writes only.

create table if not exists public.payments (
  id                   text primary key,   -- Stripe event id (idempotent)
  type                 text,
  email                text,
  amount_cents         integer,
  status               text,
  client_reference_id  text,               -- joins a payment back to a lead
  utm_source           text,               -- channel attribution from checkout metadata
  utm_medium           text,
  utm_campaign         text,
  created_at           timestamptz not null default now()
);

alter table public.payments enable row level security;
-- (No policies on purpose, only the service-role key may read/write.)

-- If the payments table already exists, run this once so Stripe revenue can be
-- attributed to a channel and joined to a lead:
--   alter table public.payments add column if not exists client_reference_id text;
--   alter table public.payments add column if not exists utm_source   text;
--   alter table public.payments add column if not exists utm_medium   text;
--   alter table public.payments add column if not exists utm_campaign text;
