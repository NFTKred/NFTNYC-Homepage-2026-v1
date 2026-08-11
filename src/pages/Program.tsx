// /program — Full NFT.NYC 2026 conference schedule.
//
// Data source: src/data/schedule.ts (generated from the Sessionize export).
// Style: mirrors /speakers — hero → day filter chips + search → session
// cards grouped by day. Cards show time badge, title, speakers, and room.

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Clock, MapPin, Users } from "lucide-react";
import Header from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageMeta from "@/components/PageMeta";
import { SCHEDULE, ScheduleSession } from "@/data/schedule";

// Same endpoint the Speakers page uses. Cache-Control: max-age=117
// means most page loads share this fetch with /speakers.
const SESSIONIZE_URL = "https://sessionize.com/api/v2/x65weaqz/view/All";

interface AvatarInfo {
  url: string;
  displayName: string; // canonical Sessionize fullName (for the deep-link)
}

const DAY_LABELS: Record<string, { short: string; full: string; date: string; color: string }> = {
  Tue: { short: "Tue", full: "Tuesday",  date: "Sept 1", color: "#8B5CF6" },
  Wed: { short: "Wed", full: "Wednesday", date: "Sept 2", color: "#3B82F6" },
  Thu: { short: "Thu", full: "Thursday",  date: "Sept 3", color: "#EC4899" },
};
const DAY_ORDER = ["Tue", "Wed", "Thu"];
const dayColor = (d: string) => DAY_LABELS[d]?.color ?? "#f06347";

export default function Program() {
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    (document.documentElement.getAttribute("data-theme") as "dark" | "light") || "dark"
  );
  const stage = useMemo(() => Number(localStorage.getItem("nftnyc-stage") ?? 0), []);
  const [search, setSearch] = useState("");
  const [activeDay, setActiveDay] = useState<string>("all");
  const [avatarPool, setAvatarPool] = useState<AvatarInfo[]>([]);

  // Fetch Sessionize once. We keep the full pool of accepted speakers
  // (name + avatar URL) and match schedule names against it fuzzily —
  // the schedule sometimes has more of the legal name than Sessionize
  // (e.g. "Jenifer Pepen Aquino" vs "Jenifer Pepen"), so we accept
  // either side being a substring of the other.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(SESSIONIZE_URL);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        // No acceptance filter here: the schedule itself is our approval
        // gate — anyone who appears on it is already confirmed. We just
        // want the avatar/name mapping for everyone Sessionize knows.
        const pool: AvatarInfo[] = [];
        (data.speakers ?? []).forEach((s: any) => {
          const name = String(s.fullName ?? "").trim();
          const pic = String(s.profilePicture ?? "").trim();
          if (!name || !pic) return;
          pool.push({ url: pic, displayName: name });
        });
        setAvatarPool(pool);
      } catch {
        // silent — no avatars is a fine fallback
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Precompute exact + substring lookup. Exact wins over substring.
  const avatarLookup = useMemo(() => {
    const exact = new Map<string, AvatarInfo>();
    for (const a of avatarPool) exact.set(a.displayName.toLowerCase(), a);
    return (rawName: string): AvatarInfo | undefined => {
      const q = rawName.trim().toLowerCase();
      if (!q) return undefined;
      const hit = exact.get(q);
      if (hit) return hit;
      // Fuzzy: either the schedule name contains the Sessionize name,
      // or the Sessionize name contains the schedule name (matches on
      // word boundary to avoid "Al" matching "Alexandra").
      for (const a of avatarPool) {
        const s = a.displayName.toLowerCase();
        if (s === q) return a;
        if (q.startsWith(s + " ") || q.endsWith(" " + s) || q.includes(" " + s + " ")) return a;
        if (s.startsWith(q + " ") || s.endsWith(" " + q) || s.includes(" " + q + " ")) return a;
      }
      return undefined;
    };
  }, [avatarPool]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const availableDays = useMemo(() => {
    const seen = new Set(SCHEDULE.map((s) => s.day));
    return DAY_ORDER.filter((d) => seen.has(d));
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return SCHEDULE.filter((s) => {
      if (activeDay !== "all" && s.day !== activeDay) return false;
      if (!term) return true;
      const hay = `${s.title} ${s.speakers.join(" ")} ${s.room}`.toLowerCase();
      return hay.includes(term);
    });
  }, [search, activeDay]);

  const grouped = useMemo(() => {
    const groups: Record<string, ScheduleSession[]> = {};
    for (const s of filtered) {
      (groups[s.day] ||= []).push(s);
    }
    return DAY_ORDER.filter((d) => groups[d]?.length).map((d) => ({ day: d, sessions: groups[d] }));
  }, [filtered]);

  return (
    <div data-theme={theme} style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)" }}>
      <PageMeta page="program" />
      <Header theme={theme} onToggleTheme={toggleTheme} stage={stage} />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto" style={{ padding: "5rem 1.5rem 2rem" }}>
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#f06347",
              marginBottom: "0.75rem",
            }}
          >
            Preliminary Program V.1 · Sept 1–3, 2026 · Times Square, NYC
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: 700,
              textTransform: "uppercase",
              color: "var(--color-text)",
              margin: 0,
              lineHeight: 1.05,
            }}
          >
            Program
          </h1>
          <p
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
              fontSize: "16px",
              marginTop: "1.25rem",
              maxWidth: "640px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            The preliminary NFT.NYC 2026 conference schedule. Sessions and times are subject to change.
          </p>
        </div>
      </section>

      {/* ── Filter + search row ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto" style={{ padding: "0 1.5rem 1.5rem" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", flex: 1, minWidth: 0 }}>
            <FilterChip label="All Days" active={activeDay === "all"} onClick={() => setActiveDay("all")} />
            {availableDays.map((d) => (
              <FilterChip
                key={d}
                label={`${DAY_LABELS[d].full} · ${DAY_LABELS[d].date}`}
                color={dayColor(d)}
                active={activeDay === d}
                onClick={() => setActiveDay(d)}
              />
            ))}
          </div>
          <div style={{ position: "relative", minWidth: 240 }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-muted)",
                pointerEvents: "none",
              }}
            />
            <input
              type="search"
              placeholder="Search sessions or speakers"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
                padding: "0.55rem 0.9rem 0.55rem 2.25rem",
                borderRadius: 999,
                fontSize: 13,
                width: 240,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Session groups per day ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto" style={{ padding: "1rem 1.5rem 5rem" }}>
        {grouped.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "3rem 1rem",
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            No sessions match that search.
          </div>
        )}

        {grouped.map(({ day, sessions }) => {
          const meta = DAY_LABELS[day];
          const color = dayColor(day);
          return (
            <div key={day} style={{ marginBottom: "3rem" }}>
              {/* Day header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "0.85rem",
                  marginBottom: "1.25rem",
                  paddingBottom: "0.75rem",
                  borderBottom: `1px solid var(--color-border)`,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(20px, 3vw, 28px)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--color-text)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {meta.full}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color,
                  }}
                >
                  {meta.date}
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    fontFamily: "var(--font-body)",
                    fontSize: "12px",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {sessions.length} {sessions.length === 1 ? "session" : "sessions"}
                </div>
              </div>

              {/* Session cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {sessions.map((s, i) => (
                  <SessionCard key={`${day}-${i}`} session={s} accent={color} lookupAvatar={avatarLookup} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <SiteFooter stage={stage} />
    </div>
  );
}

// ─── Session card ────────────────────────────────────────────────────────
function SessionCard({
  session,
  accent,
  lookupAvatar,
}: {
  session: ScheduleSession;
  accent: string;
  lookupAvatar: (name: string) => AvatarInfo | undefined;
}) {
  return (
    <article
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid var(--color-border)",
        borderRadius: 16,
        padding: "1.1rem 1.25rem",
        display: "grid",
        gridTemplateColumns: "minmax(0, 155px) 1fr",
        gap: "1.25rem",
        alignItems: "start",
        transition: "border-color 200ms ease, background 200ms ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
        (e.currentTarget as HTMLElement).style.borderColor = accent;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
      }}
    >
      {/* Left column: time */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            color: accent,
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          <Clock size={12} />
          {session.time}
        </div>
      </div>

      {/* Right column: title + speakers + room */}
      <div style={{ minWidth: 0 }}>
        <h3
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(15px, 1.75vw, 17px)",
            fontWeight: 600,
            color: "var(--color-text)",
            margin: 0,
            marginBottom: session.speakers.length ? "0.5rem" : "0.65rem",
            lineHeight: 1.4,
          }}
        >
          {session.title}
        </h3>

        {session.speakers.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0.5rem 0.75rem",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "var(--color-text-muted)",
              marginBottom: "0.6rem",
              lineHeight: 1.5,
            }}
          >
            {session.speakers.map((name) => {
              const info = lookupAvatar(name);
              const linkTarget = info?.displayName ?? name;
              return (
                <Link
                  key={name}
                  to={`/speakers?speaker=${encodeURIComponent(linkTarget)}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    color: "var(--color-text)",
                    textDecoration: "none",
                    padding: "3px 10px 3px 3px",
                    borderRadius: 999,
                    border: "1px solid var(--color-border)",
                    background: "rgba(255,255,255,0.03)",
                    transition: "all 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = accent;
                    (e.currentTarget as HTMLElement).style.color = accent;
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
                    (e.currentTarget as HTMLElement).style.color = "var(--color-text)";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                  }}
                >
                  {info?.url ? (
                    <img
                      src={info.url}
                      alt=""
                      loading="lazy"
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        objectFit: "cover",
                        flexShrink: 0,
                        display: "block",
                      }}
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.08)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-text-muted)",
                        flexShrink: 0,
                      }}
                    >
                      <Users size={12} />
                    </span>
                  )}
                  <span style={{ fontSize: "12.5px", fontWeight: 500, whiteSpace: "nowrap" }}>{name}</span>
                </Link>
              );
            })}
          </div>
        )}

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            fontFamily: "var(--font-body)",
            fontSize: "11px",
            color: "var(--color-text-faint)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          <MapPin size={11} />
          {session.room}
        </div>
      </div>
    </article>
  );
}

// ─── Filter chip (mirrors Speakers page) ─────────────────────────────────
function FilterChip({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color?: string;
  active: boolean;
  onClick: () => void;
}) {
  const c = color ?? "#f06347";
  return (
    <button
      onClick={onClick}
      style={{
        appearance: "none",
        background: active ? c : "rgba(255,255,255,0.04)",
        color: active ? "#0a0a0f" : "var(--color-text)",
        border: `1px solid ${active ? c : "var(--color-border)"}`,
        borderRadius: 999,
        padding: "0.5rem 0.9rem",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.02em",
        cursor: "pointer",
        transition: "all 180ms ease",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.borderColor = c;
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border)";
      }}
    >
      {label}
    </button>
  );
}
