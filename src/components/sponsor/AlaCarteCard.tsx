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
        <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(item)}
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 rounded hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
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
