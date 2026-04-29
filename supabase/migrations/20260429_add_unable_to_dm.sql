-- Add unable_to_dm column to speakers table — flag for speakers whose X profile
-- doesn't accept DMs (closed inbox, follow-required, etc.). Surfaced as a
-- checkbox next to Handle in the admin Speakers tab.
ALTER TABLE speakers ADD COLUMN IF NOT EXISTS unable_to_dm BOOLEAN NOT NULL DEFAULT false;
