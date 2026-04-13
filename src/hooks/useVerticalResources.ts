import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { VERTICAL_RESOURCES, type VerticalResource } from '@/data/verticalResources';

export function useVerticalResources(verticalId: string) {
  return useQuery<VerticalResource[]>({
    queryKey: ['resources', verticalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('vertical_id', verticalId)
        .eq('status', 'approved')
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('date', { ascending: false });

      if (error || !data || data.length === 0) {
        return VERTICAL_RESOURCES[verticalId] ?? [];
      }

      return data.map(r => ({
        title: r.title,
        url: r.url,
        type: r.type as VerticalResource['type'],
        date: r.date,
        source: r.source,
        topicTag: r.topic_tag,
        description: r.description ?? undefined,
        image: r.image ?? undefined,
        displayOrder: r.display_order ?? null,
      }));
    },
    placeholderData: VERTICAL_RESOURCES[verticalId] ?? [],
    staleTime: 30 * 1000, // 30 seconds — resources update quickly after admin changes
  });
}
