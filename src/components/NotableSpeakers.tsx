import { useEffect, useState } from "react";

/**
 * "Featured Voices at NFT.NYC 2026" — a compact grid of 2026's Top Speakers.
 *
 * Data source: the same Sessionize view /speakers uses. We fetch on mount,
 * filter to speakers who (a) have an Accepted session and (b) are flagged
 * `isTopSpeaker` in Sessionize, then render up to FEATURED_MAX of them in
 * the same card layout the previous hard-coded list used.
 *
 * If the API is unavailable or returns zero featured speakers, the section
 * hides itself rather than rendering an empty grid.
 */

const SESSIONIZE_URL = "https://sessionize.com/api/v2/x65weaqz/view/All";

/** Cap on how many featured speakers to render here. Twelve preserves the
 *  visual density of the previous static grid; more than that and the
 *  section starts to compete with the /speakers page itself. */
const FEATURED_MAX = 12;

interface FeaturedSpeaker {
  id: string;
  name: string;
  tagline: string;
  image: string;
}

// Sessionize response shape - only the fields we read. Kept loose because
// Sessionize adds fields over time and we're a read-only consumer.
interface RawSpeaker {
  id?: string | number;
  fullName?: string;
  tagLine?: string;
  profilePicture?: string;
  isTopSpeaker?: boolean;
  questionAnswers?: Array<{ questionId?: number; answerValue?: string }>;
}
interface RawSession {
  status?: string;
  speakers?: Array<string | number>;
}
interface RawSessionize {
  speakers?: RawSpeaker[];
  sessions?: RawSession[];
}

/** Same "Company Name" question id /speakers reads for its subtitle. */
const COMPANY_QUESTION_ID = 124328;

function extractFeatured(api: RawSessionize): FeaturedSpeaker[] {
  // Acceptance gate: only include speakers whose session was Accepted.
  const acceptedIds = new Set<string>();
  (api.sessions ?? []).forEach((sess) => {
    if (String(sess?.status ?? "").toLowerCase() !== "accepted") return;
    for (const spkId of sess.speakers ?? []) acceptedIds.add(String(spkId));
  });

  return (api.speakers ?? [])
    .filter((s) => s?.isTopSpeaker && acceptedIds.has(String(s?.id ?? "")))
    .slice(0, FEATURED_MAX)
    .map((s) => {
      const company =
        (s.questionAnswers ?? []).find(
          (qa) => qa?.questionId === COMPANY_QUESTION_ID,
        )?.answerValue ?? "";
      const tagline = (s.tagLine ?? company ?? "").toString().trim();
      return {
        id: String(s.id ?? ""),
        name: String(s.fullName ?? "").trim() || "(unnamed)",
        tagline,
        image: String(s.profilePicture ?? ""),
      };
    });
}

export default function NotableSpeakers() {
  const [speakers, setSpeakers] = useState<FeaturedSpeaker[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(SESSIONIZE_URL, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          if (!cancelled) setSpeakers([]);
          return;
        }
        const data = (await res.json()) as RawSessionize;
        if (cancelled) return;
        setSpeakers(extractFeatured(data));
      } catch {
        if (!cancelled) setSpeakers([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Section hides itself entirely on error / empty. Prevents an "empty
  // grid" from appearing between other sections on the homepage.
  if (speakers !== null && speakers.length === 0) return null;

  return (
    <section style={{ padding: "clamp(3rem, 8vw, 6rem) 0" }}>
      <div className="max-w-[960px] mx-auto px-6">
        <div className="text-center mb-12">
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-xs)",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "var(--color-text-faint)",
              marginBottom: "0.75rem",
            }}
          >
            Featured at NFT.NYC 2026
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.75rem, 1rem + 2.5vw, 3rem)",
              fontWeight: 700,
              color: "var(--color-text)",
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
            }}
          >
            Meet Our Featured Speakers
          </h2>
        </div>
        <div
          className="notable-speakers-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1rem 3rem",
          }}
        >
          {(speakers ?? []).map((s) => (
            <a
              key={s.id}
              href={`/speakers?speaker=${encodeURIComponent(s.name)}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "0.75rem 1rem",
                borderRadius: "0.75rem",
                border: "1px solid var(--card-border)",
                background: "var(--color-surface)",
                textDecoration: "none",
                color: "inherit",
                transition: "border-color var(--transition-interactive)",
              }}
            >
              {s.image ? (
                <img
                  src={s.image}
                  alt={s.name}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    objectFit: "cover",
                    flexShrink: 0,
                    border: "2px solid var(--card-border)",
                  }}
                />
              ) : (
                <div
                  aria-hidden="true"
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "var(--card-border)",
                    flexShrink: 0,
                  }}
                />
              )}
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--color-text)",
                    textTransform: "uppercase",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.2,
                  }}
                >
                  {s.name}
                </p>
                {s.tagline && (
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-muted)",
                      marginTop: "0.25rem",
                    }}
                  >
                    {s.tagline}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .notable-speakers-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
