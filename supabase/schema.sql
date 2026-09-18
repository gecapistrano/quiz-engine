-- 22nd Birthday Quiz schema
-- Run this in the Supabase SQL editor (once per project).
-- The service role key bypasses RLS; the anon key cannot read answers.

create table if not exists questions (
  id serial primary key,
  round text not null check (round in ('easy', 'moderate', 'difficult')),
  order_index int not null,
  question_text text not null,
  question_type text not null default 'multiple_choice' check (question_type in ('multiple_choice', 'text_input')),
  options jsonb, -- array of strings, null for text_input questions
  correct_answers jsonb not null -- array of strings (multiple correct answers allowed)
);

create unique index if not exists questions_order_index_key on questions (order_index);

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  ig_username text, -- nullable, lowercase-normalized, trimmed
  browser_id text not null, -- uuid stored in a cookie, used for "one try" lock
  answers jsonb not null, -- {question_id: selected_option}
  score int not null,
  is_perfect boolean not null default false,
  completed_at timestamptz not null default now(),
  time_taken_seconds int
);

-- Prevent duplicate IG usernames from qualifying twice (case-insensitive)
create unique index if not exists unique_ig_username
  on submissions (lower(ig_username))
  where ig_username is not null and ig_username != '';

-- Prevent same browser from submitting twice
create unique index if not exists unique_browser_id on submissions (browser_id);

alter table questions enable row level security;
alter table submissions enable row level security;

-- Deny all browser/anon access. The Next.js API uses the service role key,
-- which bypasses RLS. These policies exist so Security Advisor is satisfied
-- without opening the tables to the public.
create policy questions_deny_all on questions
  for all to anon, authenticated
  using (false)
  with check (false);

create policy submissions_deny_all on submissions
  for all to anon, authenticated
  using (false)
  with check (false);

revoke all on table questions from anon, authenticated;
revoke all on table submissions from anon, authenticated;
revoke all on sequence questions_id_seq from anon, authenticated;

grant all on table questions to postgres, service_role;
grant all on table submissions to postgres, service_role;
grant usage, select, update on sequence questions_id_seq to postgres, service_role;
