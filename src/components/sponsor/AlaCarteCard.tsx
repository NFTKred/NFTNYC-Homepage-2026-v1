import type { AlaCarteItem } from "@/data/packages";

interface AlaCarteCardProps {
  item: AlaCarteItem;
  onEdit: (item: AlaCarteItem) => void;
  onDelete: (id: number | null) => void;
}

export default function AlaCarteCard({ item, onEdit, onDelete }: AlaCarteCardProps) {
  return (
    <div className="group relative bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-base font-semibold text-foreground">{item.name}</h4>
      </div>
      <p className="text-lg font-bold text-brand-orange mb-2">{item.price}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
      <div className="mt-3">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
          item.availability === "Sold Out"
            ? "bg-red-900/30 text-red-400 border-red-500/30"
            : "bg-primary/10 text-primary border-primary/30"
        }`}>
          {item.availability}
        </span>
      </div>
    </div>
  );
}
