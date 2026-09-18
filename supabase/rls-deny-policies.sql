-- Silences Security Advisor "RLS Enabled No Policy" without opening public access.
-- The quiz API still uses the service role key, which bypasses RLS.

create policy questions_deny_all on questions
  for all to anon, authenticated
  using (false)
  with check (false);

create policy submissions_deny_all on submissions
  for all to anon, authenticated
  using (false)
  with check (false);
