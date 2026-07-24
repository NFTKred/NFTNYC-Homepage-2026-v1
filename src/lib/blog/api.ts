import { supabase } from "@/lib/supabase";
import type { BlogPostRecord, BlogPostSummary } from "@/data/blog/types";

const LIST_FIELDS =
  "id, slug, title, description, hero_image_url, hero_image_alt, tag, published_at, author, read_minutes";

/** Fetch all published posts for the /blog index, newest first. */
export async function fetchPublishedPosts(): Promise<BlogPostSummary[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(LIST_FIELDS)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BlogPostSummary[];
}

/** Fetch a single post by slug. Returns null when not found (404). */
export async function fetchPostBySlug(
  slug: string,
): Promise<BlogPostRecord | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return (data as BlogPostRecord | null) ?? null;
}
