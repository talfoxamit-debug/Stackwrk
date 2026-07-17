-- Call log synced from Quo (formerly OpenPhone) via webhook: /api/quo/webhook.
-- Run once in the Supabase SQL editor (same project as your leads/team tables).
-- Writes happen server-side with the service-role key. RLS on, no public policies.

create table if not exists public.quo_calls (
  id                text primary key,        -- Quo call id
  direction         text,                    -- 'incoming' | 'outgoing'
  status            text,                    -- 'completed' | 'missed' | 'voicemail' | ...
  phone_digits      text,                    -- other party's number, 10-digit normalized (may be null on an enrichment event that arrives before the call itself)
  phone_pretty      text,                    -- other party's number, formatted
  contact_name      text,                    -- Quo's own contact name, if known
  duration_seconds  integer,
  recording_url     text,
  transcript        text,
  summary           text,
  occurred_at       timestamptz not null default now(), -- set for real by the primary call event; defaulted so enrichment-first inserts still succeed
  raw               jsonb,                   -- full event payload, for debugging/future fields
  created_at        timestamptz not null default now()
);

create index if not exists quo_calls_phone_idx on public.quo_calls (phone_digits);
create index if not exists quo_calls_occurred_idx on public.quo_calls (occurred_at desc);

alter table public.quo_calls enable row level security;
-- (No policies on purpose, only the service-role key may read/write.)

-- If the table already exists from an earlier version, run these once so
-- transcript/summary/recording events that arrive before (or without) the call
-- record can still be stored instead of being silently dropped:
--   alter table public.quo_calls alter column phone_digits drop not null;
--   alter table public.quo_calls alter column occurred_at set default now();
