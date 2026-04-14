import EcoIcon from '@/components/EcoIcon';
import { ECOSYSTEMS } from '@/data/nftnyc';

// Build trackIcons from the same EcoIcon component + color palette used on
// the homepage ecosystem section, keyed by the ecosystem display name so
// TrackTiles can look them up.
export const trackIcons: Record<string, { icon: React.ReactNode; color: string }> =
  Object.fromEntries(
    ECOSYSTEMS.map(eco => [
      eco.name,
      {
        color: eco.color,
        icon: <EcoIcon ecoId={eco.id} color={eco.color} size={48} animated={false} />,
      },
    ])
  );
