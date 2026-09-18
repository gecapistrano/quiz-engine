-- Run this once in Supabase SQL Editor, then: npm run seed
grant all on table public.questions to postgres, service_role;
grant all on table public.submissions to postgres, service_role;
grant usage, select, update on sequence public.questions_id_seq to postgres, service_role;
