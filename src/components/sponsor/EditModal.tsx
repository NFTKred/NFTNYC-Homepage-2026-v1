import { useState, useEffect } from "react";
import type { Package, AlaCarteItem } from "@/data/packages";

interface EditModalProps {
  item: Package | AlaCarteItem;
  type: "package" | "alacarte";
  onSave: (updated: any) => void;
  onClose: () => void;
}

function Field({ label, value, onChange, textarea, type = "text" }: {
  label: string;
  value: string | number | undefined;
  onChange: (v: string) => void;
  textarea?: boolean;
  type?: string;
}) {
  const cls = "w-full bg-secondary border border-brand-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-brand-orange";
  return (
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
      {textarea ? (
        <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={3} className={cls} />
      ) : (
        <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </div>
  );
}

export default function EditModal({ item, type, onSave, onClose }: EditModalProps) {
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (item) setForm({ ...item });
  }, [item]);

  if (!item) return null;

  const set = (key: string, val: string) => setForm((f: any) => ({ ...f, [key]: val }));
  const setTicket = (key: string, val: string) =>
    setForm((f: any) => ({ ...f, tickets: { ...f.tickets, [key]: parseInt(val) || 0 } }));

  const handleBrandingChange = (index: number, val: string) => {
    const updated = [...form.branding];
    updated[index] = val;
    setForm((f: any) => ({ ...f, branding: updated }));
  };

  const addBrandingItem = () => {
    setForm((f: any) => ({ ...f, branding: [...(f.branding || []), ""] }));
  };

  const removeBrandingItem = (index: number) => {
    setForm((f: any) => ({ ...f, branding: f.branding.filter((_: string, i: number) => i !== index) }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-brand-card border border-brand-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {(item as any).id ? "Edit" : "Add"} {type === "package" ? "Package" : "A La Carte Option"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Name" value={form.name} onChange={(v) => set("name", v)} />
          <Field label="Price" value={form.price} onChange={(v) => set("price", v)} />
          <Field label="Description" value={form.description} onChange={(v) => set("description", v)} textarea />

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Availability</label>
            <select
              value={form.availability || "Limited"}
              onChange={(e) => set("availability", e.target.value)}
              className="w-full bg-secondary border border-brand-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-brand-orange"
            >
              <option value="Limited">Limited</option>
              <option value="Sold Out">Sold Out</option>
              <option value="Available">Available</option>
            </select>
          </div>

          {type === "package" && (
            <>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Tier</label>
                <select
                  value={form.tier || "standard"}
                  onChange={(e) => set("tier", e.target.value)}
                  className="w-full bg-secondary border border-brand-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-brand-orange"
                >
                  <option value="premium">Premium</option>
                  <option value="standard">Standard</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Field label="VIP Tickets" type="number" value={form.tickets?.vip} onChange={(v) => setTicket("vip", v)} />
                <Field label="GA Tickets" type="number" value={form.tickets?.ga} onChange={(v) => setTicket("ga", v)} />
                <Field label="Staff Passes" type="number" value={form.tickets?.staff} onChange={(v) => setTicket("staff", v)} />
              </div>

              <Field label="Billboard" value={form.billboard} onChange={(v) => set("billboard", v)} />
              <Field label="Speaking" value={form.speaking} onChange={(v) => set("speaking", v)} />
              <Field label="Expo Space" value={form.expoSpace} onChange={(v) => set("expoSpace", v)} />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-muted-foreground">Branding Items</label>
                  <button
                    onClick={addBrandingItem}
                    className="text-xs text-brand-orange hover:text-brand-orange/80 font-medium"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {(form.branding || []).map((brandItem: string, i: number) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={brandItem}
                        onChange={(e) => handleBrandingChange(i, e.target.value)}
                        className="flex-1 bg-secondary border border-brand-border rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:border-brand-orange"
                      />
                      <button
                        onClick={() => removeBrandingItem(i)}
                        className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-brand-border">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-brand-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-brand-orange text-foreground font-medium hover:bg-brand-orange/90 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
