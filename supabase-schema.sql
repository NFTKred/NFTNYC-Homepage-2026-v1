-- ═══════════════════════════════════════════════
-- NFT.NYC Admin Dashboard Schema
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- 1. Admin users whitelist
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed with your admin email(s)
INSERT INTO admin_users (email) VALUES ('cameronbale@peoplebrowsr.com')
ON CONFLICT (email) DO NOTHING;

-- 2. Resources table
CREATE TABLE IF NOT EXISTS resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vertical_id TEXT NOT NULL CHECK (vertical_id IN ('ai','gaming','infra','social','communities','creator','defi','brands','culture','marketplaces')),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('blog','youtube','podcast','tweet','paper','news')),
  date DATE NOT NULL,
  source TEXT NOT NULL,
  topic_tag TEXT NOT NULL,
  description TEXT,
  image TEXT,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected')),
  auto_found BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 3. Speakers table
CREATE TABLE IF NOT EXISTS speakers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vertical_id TEXT NOT NULL CHECK (vertical_id IN ('ai','gaming','infra','social','communities','creator','defi','brands','culture','marketplaces')),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  eco TEXT,
  eco_color TEXT,
  why TEXT,
  handle TEXT,
  outreach_channel TEXT CHECK (outreach_channel IN ('twitter_dm','email','linkedin','telegram','intro','other')),
  outreach_status TEXT DEFAULT 'not_started' CHECK (outreach_status IN ('not_started','contacted','responded','confirmed','declined')),
  outreach_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = auth.jwt()->>'email'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Resources: public can read approved, admins can do everything
CREATE POLICY "Public read approved resources" ON resources
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Admins full access resources" ON resources
  FOR ALL USING (is_admin());

-- Speakers: public can read, admins can write
CREATE POLICY "Public read speakers" ON speakers
  FOR SELECT USING (true);

CREATE POLICY "Admins full access speakers" ON speakers
  FOR ALL USING (is_admin());

-- Admin users: only admins can read
CREATE POLICY "Admins read admin_users" ON admin_users
  FOR SELECT USING (is_admin());
