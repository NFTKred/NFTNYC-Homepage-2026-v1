-- Store the PeopleBrowsr user id used for X-On-Behalf-Of on Kred domain calls.
ALTER TABLE public.vibesprint_registrations
  ADD COLUMN IF NOT EXISTS kred_user_id text;
