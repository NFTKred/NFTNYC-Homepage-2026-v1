import { supabase } from "@/lib/supabase";

/**
 * Upload helper for the public `blog-media` Supabase Storage bucket
 * (created in supabase/migrations/20260728_add_blog_posts.sql).
 * Writes require an authenticated admin session (RLS); reads are public.
 */
const BUCKET = "blog-media";

function safeBaseName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "");
  const slug = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "file";
}

/**
 * Upload a file to blog-media and return its public URL.
 * Path shape: <folder>/<timestamp>-<slugified-name>.<ext>
 * The timestamp prefix keeps paths unique so re-uploads never collide
 * and public URLs stay stable/cacheable.
 */
export async function uploadBlogMedia(
  file: File,
  folder: string = "uploads",
): Promise<string> {
  const ext = file.name.includes(".")
    ? file.name.split(".").pop()!.toLowerCase()
    : "bin";
  const path = `${folder}/${Date.now()}-${safeBaseName(file.name)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
