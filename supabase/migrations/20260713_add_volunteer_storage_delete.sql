-- Admins reviewing volunteer applications need to delete files (photo IDs
-- and intro videos) when they delete an application. Add DELETE policies
-- on both buckets for authenticated users.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'volunteer_photo_ids_admin_delete' AND tablename = 'objects') THEN
    CREATE POLICY volunteer_photo_ids_admin_delete ON storage.objects
      FOR DELETE TO authenticated USING (bucket_id = 'volunteer-photo-ids');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'volunteer_videos_admin_delete' AND tablename = 'objects') THEN
    CREATE POLICY volunteer_videos_admin_delete ON storage.objects
      FOR DELETE TO authenticated USING (bucket_id = 'volunteer-videos');
  END IF;
END $$;
