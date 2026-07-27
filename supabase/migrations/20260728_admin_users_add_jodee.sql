-- Add Jodee Rich to admin_users so the account has full admin rights
-- (it could already authenticate, but is_admin() gated all draft
-- reads and writes). With this, all five auth accounts are admins.

insert into public.admin_users (email) values
  ('jodeerich@peoplebrowsr.ceo')
on conflict (email) do nothing;
