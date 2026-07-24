import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { BlogPostRecord } from "@/data/blog/types";

/**
 * Admin-side queries + mutations for `blog_posts`. Public read paths
 * live in src/lib/blog/api.ts; everything here assumes an
 * authenticated admin session (RLS policy "blog_posts admin all").
 *
 * Every mutation uses `.select()` so the RLS silent-fail case (no
 * error raised but 0 rows affected) surfaces as a thrown Error, same
 * pattern as src/pages/Admin.tsx.
 */

/** Editable columns (everything except id + db-managed timestamps). */
export type BlogPostPatch = Partial<
  Omit<BlogPostRecord, "id" | "created_at" | "updated_at">
>;

const RLS_HINT =
  "No rows affected. Your session probably lacks write access to blog_posts (check auth), or the row no longer exists.";

function invalidateBlog(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
  queryClient.invalidateQueries({ queryKey: ["admin-blog-post"] });
  queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
  queryClient.invalidateQueries({ queryKey: ["blog-post"] });
}

/* ─── Queries ─── */

/** All posts (draft + scheduled + published) for the admin list. */
export function useAdminBlogPosts() {
  return useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BlogPostRecord[];
    },
  });
}

/** One post by id for the editor. */
export function useAdminBlogPost(id: string | undefined) {
  return useQuery({
    queryKey: ["admin-blog-post", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id as string)
        .maybeSingle();
      if (error) throw error;
      return (data as BlogPostRecord | null) ?? null;
    },
    enabled: !!id,
  });
}

/* ─── Mutations ─── */

/** Create a post. Pass at least { slug, title }; status defaults to draft. */
export function useCreateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: BlogPostPatch & { slug: string; title: string }) => {
      const { data, error } = await supabase
        .from("blog_posts")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as BlogPostRecord;
    },
    onSuccess: () => invalidateBlog(queryClient),
  });
}

/** Update any subset of columns on a post. */
export function useUpdateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: BlogPostPatch }) => {
      const { data, error } = await supabase
        .from("blog_posts")
        .update(patch)
        .eq("id", id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error(RLS_HINT);
      return data[0] as BlogPostRecord;
    },
    onSuccess: () => invalidateBlog(queryClient),
  });
}

/**
 * Publish or unpublish. Publishing stamps published_at on first
 * publish and preserves it on re-publish; unpublishing keeps the
 * stamp so a later re-publish keeps its original date.
 */
export function useSetBlogPostStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      post,
      status,
    }: {
      post: Pick<BlogPostRecord, "id" | "published_at">;
      status: BlogPostRecord["status"];
    }) => {
      const patch: BlogPostPatch = { status };
      if (status === "published" && !post.published_at) {
        patch.published_at = new Date().toISOString();
      }
      const { data, error } = await supabase
        .from("blog_posts")
        .update(patch)
        .eq("id", post.id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error(RLS_HINT);
      return data[0] as BlogPostRecord;
    },
    onSuccess: () => invalidateBlog(queryClient),
  });
}

/** Duplicate a post as a new draft with a unique slug. */
export function useDuplicateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (post: BlogPostRecord) => {
      const copy: BlogPostPatch & { slug: string; title: string } = {
        slug: `${post.slug}-copy-${Date.now().toString(36)}`,
        status: "draft",
        title: `${post.title} (copy)`,
        subtitle: post.subtitle,
        description: post.description,
        author: post.author,
        tag: post.tag,
        hero_image_url: post.hero_image_url,
        hero_image_alt: post.hero_image_alt,
        og_image_url: post.og_image_url,
        read_minutes: post.read_minutes,
        content: post.content,
        published_at: null,
      };
      const { data, error } = await supabase
        .from("blog_posts")
        .insert(copy)
        .select()
        .single();
      if (error) throw error;
      return data as BlogPostRecord;
    },
    onSuccess: () => invalidateBlog(queryClient),
  });
}

/** Delete a post permanently. */
export function useDeleteBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error(RLS_HINT);
    },
    onSuccess: () => invalidateBlog(queryClient),
  });
}
