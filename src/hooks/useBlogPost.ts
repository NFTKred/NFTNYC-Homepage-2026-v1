import { useQuery } from "@tanstack/react-query";
import { fetchPostBySlug, fetchPublishedPosts } from "@/lib/blog/api";

export function useBlogPost(slug: string | undefined) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => fetchPostBySlug(slug as string),
    enabled: !!slug,
  });
}

export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog-posts"],
    queryFn: fetchPublishedPosts,
  });
}
