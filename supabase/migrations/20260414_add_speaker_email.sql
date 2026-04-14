-- Add email column to speakers table for storing contact email addresses
ALTER TABLE speakers ADD COLUMN IF NOT EXISTS email text;
