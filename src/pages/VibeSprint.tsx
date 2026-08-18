import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageMeta from "@/components/PageMeta";
import { supabase } from "@/lib/supabase";
import {
  RegistrantContactFields,
  EMPTY_CONTACT,
  type RegistrantContact,
} from "@/components/vibesprint/RegistrantContactFields";
import "@/styles/vibesprint.css";
const SKETCHLIGHT_IMAGE_URL = "/vibesprint/sketchlight-example.jpg";

/**
 * Kred Flash Sprints landing page (content v14 — merged P30 + P31 consolidated 8 Aug).
 *
 * Styles live in src/styles/vibesprint.css scoped under `.vibesprint`,
 * bound to NFT.NYC design tokens. The two-stage countdown, live counter,
 * and registration form are React state/effects; the form posts to the
 * `submit-vibesprint-registration` edge function.
 */

/** Registration opens Tue 11 Aug 2026, 9:00am ET (13:00 UTC). */
const REG_OPEN_UTC = Date.UTC(2026, 7, 11, 13, 0, 0);
/** Sprint 1 Round 1 opens Mon 17 Aug 2026, 4:00pm ET (20:00 UTC). */
const SPRINT1_UTC = Date.UTC(2026, 7, 17, 20, 0, 0);
/** Sprint 1 Round 1 submissions close Wed 19 Aug 2026, 4:00pm ET (20:00 UTC). */
const SPRINT1_CLOSE_UTC = Date.UTC(2026, 7, 19, 20, 0, 0);

const EVENT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Kred Flash Sprint 1 — The Next Gen Domain Reseller",
  description:
    "Build a next generation Domain Reseller on the Domains.Kred Registrar API. A 48-hour vibe coding sprint — build in Lovable or the platform of your choice, publish an agent-ready app that ChatGPT and Claude can call. Sprint 1 of three.",
  startDate: "2026-08-17T16:00:00-04:00",
  endDate: "2026-08-19T16:00:00-04:00",
  eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: {
    "@type": "VirtualLocation",
    url: "https://nft.nyc/vibesprint",
  },
  organizer: {
    "@type": "Organization",
    name: "NFT.NYC",
    url: "https://nft.nyc",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: "https://nft.nyc/vibesprint",
    validFrom: "2026-08-11T09:00:00-04:00",
  },
  inLanguage: "en",
};

function formatDuration(ms: number): string {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${d}d ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ============================================================
   Live Support session data + Add-to-Calendar helpers
   ============================================================ */

interface SupportSession {
  title: string;
  description: string;
  location: string;
  /** In UTC. Sprint 1 sessions run 4:00pm-9:00pm ET; ET is EDT (UTC-4)
   *  in August 2026, so 20:00-01:00 UTC (end lands on the next day). */
  startUtc: Date;
  endUtc: Date;
}

const SUPPORT_SESSIONS: SupportSession[] = [
  {
    title: "Kred Flash Sprint 1 - Live Engineer Support (Mon)",
    description:
      "Live Google Meet support with the Kred Flash Sprint 1 lead engineer. Bring your specific error and work through it live. The Meet link arrives with your Sprint 1 kit. More: https://nft.nyc/vibesprint",
    location: "Online - Google Meet (link in Sprint 1 kit)",
    startUtc: new Date(Date.UTC(2026, 7, 17, 20, 0, 0)),
    endUtc: new Date(Date.UTC(2026, 7, 18, 1, 0, 0)),
  },
  {
    title: "Kred Flash Sprint 1 - Live Engineer Support (Tue)",
    description:
      "Live Google Meet support with the Kred Flash Sprint 1 lead engineer. Bring your specific error and work through it live. The Meet link arrives with your Sprint 1 kit. More: https://nft.nyc/vibesprint",
    location: "Online - Google Meet (link in Sprint 1 kit)",
    startUtc: new Date(Date.UTC(2026, 7, 18, 20, 0, 0)),
    endUtc: new Date(Date.UTC(2026, 7, 19, 1, 0, 0)),
  },
];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Format Date as iCalendar UTC timestamp: YYYYMMDDTHHMMSSZ. */
function toIcsDate(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}` +
    `T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`
  );
}

/** Google Calendar's URL template only supports one event at a time,
 *  so we build one URL per session and open both in new tabs. */
function googleCalendarUrl(s: SupportSession): string {
  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", s.title);
  url.searchParams.set("dates", `${toIcsDate(s.startUtc)}/${toIcsDate(s.endUtc)}`);
  url.searchParams.set("details", s.description);
  url.searchParams.set("location", s.location);
  return url.toString();
}

/** Outlook.com deeplink - same one-event-at-a-time constraint. */
function outlookCalendarUrl(s: SupportSession): string {
  const url = new URL("https://outlook.live.com/calendar/0/deeplink/compose");
  url.searchParams.set("path", "/calendar/action/compose");
  url.searchParams.set("rru", "addevent");
  url.searchParams.set("subject", s.title);
  url.searchParams.set("startdt", s.startUtc.toISOString());
  url.searchParams.set("enddt", s.endUtc.toISOString());
  url.searchParams.set("body", s.description);
  url.searchParams.set("location", s.location);
  return url.toString();
}

/** Build a single .ics text carrying both sessions. Works with Apple
 *  Calendar, Outlook desktop, and imports into Google / Outlook web. */
function buildIcs(sessions: SupportSession[]): string {
  const stamp = toIcsDate(new Date(Date.UTC(2026, 7, 12, 0, 0, 0))); // stable DTSTAMP so re-downloads are idempotent
  const events = sessions.map((s, i) => {
    const uid = `vibesprint-support-${i + 1}-${s.startUtc.getTime()}@nft.nyc`;
    const desc = s.description.replace(/\n/g, "\\n").replace(/,/g, "\\,");
    return [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${toIcsDate(s.startUtc)}`,
      `DTEND:${toIcsDate(s.endUtc)}`,
      `SUMMARY:${s.title.replace(/,/g, "\\,")}`,
      `DESCRIPTION:${desc}`,
      `LOCATION:${s.location.replace(/,/g, "\\,")}`,
      "URL:https://nft.nyc/vibesprint",
      "END:VEVENT",
    ].join("\r\n");
  });
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NFT.NYC//VibeSprint//EN",
    "METHOD:PUBLISH",
    "CALSCALE:GREGORIAN",
    ...events,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

function downloadCombinedIcs() {
  const blob = new Blob([buildIcs(SUPPORT_SESSIONS)], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vibesprint-sprint1-support-sessions.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

const SESSION_META: ReadonlyArray<{ ordinal: string; date: string; time: string }> = [
  { ordinal: "Session 1", date: "Mon 17 Aug", time: "4:00 - 9:00pm ET" },
  { ordinal: "Session 2", date: "Tue 18 Aug", time: "4:00 - 9:00pm ET" },
];

function CalendarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function CalendarLinks() {
  const pill: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    borderRadius: 999,
    border: "1px solid var(--card-border)",
    background: "transparent",
    color: "var(--vs-cyan)",
    fontFamily: "var(--vs-mono)",
    fontSize: 12,
    letterSpacing: ".04em",
    cursor: "pointer",
    textDecoration: "none",
    transition: "border-color 120ms ease, background 120ms ease",
  };
  // Per-session rows so each anchor click opens exactly one tab -
  // browsers block the second window.open in a rapid pair when
  // triggered from a single user gesture.
  return (
    <div
      style={{
        marginTop: 18,
        padding: "16px 18px",
        border: "1px solid var(--card-border)",
        borderRadius: 12,
        background: "rgba(255, 255, 255, 0.02)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "var(--vs-mono)",
          fontSize: 11,
          letterSpacing: ".18em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          marginBottom: 14,
        }}
      >
        <CalendarIcon />
        Add to your calendar
      </div>

      {SUPPORT_SESSIONS.map((s, i) => {
        const meta = SESSION_META[i];
        return (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              alignItems: "center",
              gap: 12,
              padding: "10px 0",
              borderBottom:
                i < SUPPORT_SESSIONS.length - 1
                  ? "1px solid var(--card-border)"
                  : "none",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--vs-mono)",
                  fontSize: 10,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                }}
              >
                {meta.ordinal}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--color-text)",
                  marginTop: 2,
                }}
              >
                {meta.date}{" "}
                <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>
                  · {meta.time}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <a
                href={googleCalendarUrl(s)}
                target="_blank"
                rel="noopener noreferrer"
                style={pill}
                title={`Add ${meta.date} to Google Calendar`}
              >
                Google
              </a>
              <a
                href={outlookCalendarUrl(s)}
                target="_blank"
                rel="noopener noreferrer"
                style={pill}
                title={`Add ${meta.date} to Outlook`}
              >
                Outlook
              </a>
            </div>
          </div>
        );
      })}

      <div
        style={{
          marginTop: 14,
          paddingTop: 14,
          borderTop: "1px solid var(--card-border)",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily: "var(--vs-mono)",
            fontSize: 12,
            color: "var(--color-text-muted)",
          }}
        >
          Both sessions in one file · works with Apple Calendar, Outlook desktop,
          and imports into Google
        </div>
        <button
          type="button"
          style={pill}
          onClick={downloadCombinedIcs}
          title="Download an .ics with both sessions"
        >
          Download .ics
        </button>
      </div>
    </div>
  );
}

function computeCountdown(): { value: string; label: string } {
  const now = Date.now();
  if (now < REG_OPEN_UTC) {
    return { value: formatDuration(REG_OPEN_UTC - now), label: "until registration opens" };
  }
  if (now < SPRINT1_UTC) {
    return { value: formatDuration(SPRINT1_UTC - now), label: "until Sprint 1 opens" };
  }
  return { value: "LIVE", label: "Sprint 1 is open" };
}

function computeSubmitCountdown(): { value: string; label: string } {
  const now = Date.now();
  if (now < SPRINT1_UTC) {
    return { value: formatDuration(SPRINT1_UTC - now), label: "until submissions open" };
  }
  if (now < SPRINT1_CLOSE_UTC) {
    return { value: formatDuration(SPRINT1_CLOSE_UTC - now), label: "until submissions close" };
  }
  return { value: "CLOSED", label: "Sprint 1 submissions have closed" };
}

export default function VibeSprint() {
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (document.documentElement.getAttribute("data-theme") as "dark" | "light") || "dark"
  );
  const stage = useMemo(() => Number(localStorage.getItem("nftnyc-stage") ?? 0), []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  // Two-stage countdown — updates once per second.
  const [countdown, setCountdown] = useState(computeCountdown);
  useEffect(() => {
    const id = window.setInterval(() => setCountdown(computeCountdown()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Submissions countdown for the Submit Your Build section.
  const [submitCountdown, setSubmitCountdown] = useState(computeSubmitCountdown);
  useEffect(() => {
    const id = window.setInterval(() => setSubmitCountdown(computeSubmitCountdown()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Demo-only live counter, ticks up realistically.
  const [regCount, setRegCount] = useState<number>(67);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (Math.random() < 0.35) setRegCount((n) => n + 1);
    }, 2600);
    return () => window.clearInterval(id);
  }, []);

  // Registration form state.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [segment, setSegment] = useState("Designer or digital artist");
  const [buildTool, setBuildTool] = useState("Lovable (primary, Agent Integrations)");
  const [domain, setDomain] = useState("");
  const [agree, setAgree] = useState(false);
  const [contact, setContact] = useState<RegistrantContact>(EMPTY_CONTACT);
  const [domainCheck, setDomainCheck] = useState<
    { state: "idle" | "checking" | "available" | "taken" | "unknown"; message?: string }
  >({ state: "idle" });
  const [submitted, setSubmitted] = useState(false);
  const [claimedDomain, setClaimedDomain] = useState("yourname.Kred");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ---- Sprint submission form (submit-sprint-submission) ----
  const [subEmail, setSubEmail] = useState("");
  const [subAppUrl, setSubAppUrl] = useState("");
  const [subProjectUrl, setSubProjectUrl] = useState("");
  const [subTeam, setSubTeam] = useState("");
  const [subSent, setSubSent] = useState(false);
  const [subWasUpdate, setSubWasUpdate] = useState(false);
  const [subSending, setSubSending] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);

  const isKredUrl = (raw: string) => {
    const s = raw.trim();
    if (!s) return false;
    try {
      const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
      return /\.kred$/i.test(u.hostname);
    } catch {
      return false;
    }
  };

  const onSubmitBuild = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (!subAppUrl.trim()) {
      setSubError("Please enter your app name.");
      return;
    }
    setSubSending(true);
    setSubError(null);
    try {
      const { data, error } = await supabase.functions.invoke("submit-sprint-submission", {
        body: {
          sprint: "sprint1",
          email: subEmail.trim(),
          app_name: subAppUrl.trim(),
          project_url: subProjectUrl.trim(),
          team_members: subTeam.trim(),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSubWasUpdate(Boolean(data?.updated));
    } catch (err) {
      console.error("Sprint submission failed:", err);
      setSubError(
        err instanceof Error && err.message
          ? err.message
          : "We couldn't save your submission. Please try again, or email team@nft.nyc."
      );
      setSubSending(false);
      return;
    }
    setSubSending(false);
    setSubSent(true);
    window.setTimeout(() => {
      document
        .getElementById("buildSuccessCard")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  // Debounced .Kred availability check.
  useEffect(() => {
    const d = domain.trim().toLowerCase().replace(/\.kred$/i, "");
    if (!d) {
      setDomainCheck({ state: "idle" });
      return;
    }
    if (!/^[a-z0-9-]+$/.test(d)) {
      setDomainCheck({ state: "unknown", message: "Letters, numbers and hyphens only." });
      return;
    }
    setDomainCheck({ state: "checking" });
    const t = window.setTimeout(async () => {
      try {
        const { data, error } = await supabase.functions.invoke(
          "submit-vibesprint-registration",
          { body: { action: "check_domain", domain: d } }
        );
        if (error) throw error;
        if (data?.available === true) setDomainCheck({ state: "available" });
        else if (data?.available === false)
          setDomainCheck({ state: "taken", message: data?.error ?? undefined });
        else setDomainCheck({ state: "unknown", message: "Couldn't check availability right now." });
      } catch {
        setDomainCheck({ state: "unknown", message: "Couldn't check availability right now." });
      }
    }, 500);
    return () => window.clearTimeout(t);
  }, [domain]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const d = domain.trim() || "yourname";
    if (domainCheck.state === "taken") {
      setFormError(`${d}.Kred is already taken — please choose another name.`);
      return;
    }
    if (domainCheck.state === "checking") {
      setFormError("Just checking that domain is available — try again in a moment.");
      return;
    }
    setSending(true);
    setFormError(null);
    try {
      const { data, error } = await supabase.functions.invoke(
        "submit-vibesprint-registration",
        {
          body: {
            name: name.trim(),
            email: email.trim(),
            segment,
            domain: d,
            build_tool: buildTool,
            agreed_tos: agree,
            ...contact,
          },
        }
      );
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    } catch (err) {
      console.error("VibeSprint registration failed:", err);
      setFormError("We couldn't save your registration. Please try again, or email team@nft.nyc.");
      setSending(false);
      return;
    }
    setSending(false);
    setClaimedDomain(`${d}.Kred`);
    setSubmitted(true);
    window.setTimeout(() => {
      document.getElementById("successCard")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 0);
  };

  return (
    <div
      data-theme={theme}
      style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)" }}
    >
      <PageMeta page="vibesprint" />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(EVENT_JSON_LD)}</script>
      </Helmet>
      <Header theme={theme} onToggleTheme={toggleTheme} stage={stage} />

      <div className="vibesprint">
        <div className="wrap" style={{ paddingTop: 96 }}>

          <header className="hero">
            <div className="eyebrow">PeopleBrowsr × NFT.NYC 2026</div>
            <h1>
              Kred Flash Sprints<br />
              <span className="glow">Three Sprints to NFT.NYC</span>
            </h1>
            <p className="sub">
              <b>
                Kred is requesting our digital creators design the next generation of domain search
              </b>{" "}
              — customized, <b>very visual</b>, AI driven, and made for the{" "}
              <b>creator community</b>. Three <b>48-hour vibe coding sprints</b> run in{" "}
              <b>audience rounds</b>, each round opening Monday at <b>4:00pm ET</b>, starting{" "}
              <b>17 August</b>. Build in <b>Lovable or the platform of your choice</b> — publish a
              Lovable app with Agent Integrations and it works inside <b>ChatGPT and Claude</b>.
            </p>
            <div className="badges">
              <span className="badge hot">Registration open now</span>
              <span className="badge hot">
                Sprint 1 Round 1 · Mon 17 – Wed 19 Aug · Opens 4:00pm ET
              </span>
              <span className="badge tool">Lovable primary · any platform welcome</span>
              <span className="badge api">Live engineer support · Both evenings</span>
            </div>
            <div className="meters">
              <div className="meter" aria-live="polite">
                <b>{countdown.value}</b>
                <span>{countdown.label}</span>
              </div>
              <div className="meter reg" aria-live="polite">
                <b>{regCount}</b>
                <span>builders registered</span>
              </div>
            </div>
            <div className="cta-row">
              <a className="btn" href="#register">Register free</a>
              <span className="cta-note">
                One free registration covers all three sprints. Your Sprint 1 kit — Kred API
                credits, Lovable build credits in our sponsored workspace, a free .Kred domain
                claim, 1,000 XP, both example apps, the Kredentials API spec, and the "Connect
                your Kred app to ChatGPT and Claude" one-pager, publishes when Sprint 1 opens.
              </span>
            </div>
          </header>

          <section>
            <h2>Why Now</h2>
            <p className="lead">
              Digital identity matters more every year, and the rise of <b>agentic identity</b> is
              accelerating it: AI agents now need names they can verify and act on. This community
              saw it first. A domain name can be <b>tokenized on the blockchain</b>, it can{" "}
              <b>address a wallet</b>, and for a creator it is becoming the one name that carries
              your gallery, your payments, and your brand.{" "}
              <b>Every digital creator should have a .Kred name</b>, and every .Kred domain
              becomes its owner's AI-optimized story.
            </p>
            <p className="lead">
              The timing is real. ICANN has just closed its{" "}
              <a
                href="https://www.icann.org/resources/pages/newgtlds-history-2023-04-05-en"
                style={{ color: "var(--vs-cyan)" }}
              >
                second round of new top-level domain applications, the first in 13 years
              </a>
              . Over the next 18 months, hundreds of new TLDs will arrive for domain registrars
              like GoDaddy and others to sell — through a search experience that has barely changed
              in decades. Out in the market today, names are sold as "available" when they are
              already owned, paid placement goes undisclosed, and renewal prices hide behind
              tooltips.{" "}
              <a href="https://www.nft.nyc/blog/navigating-the-domain-search-muddle" style={{ color: "var(--vs-cyan)" }}>
                We documented all three
              </a>
              . There is a unique opening to build a{" "}
              <b>better, visual, AI driven domain search</b>, and the skills it needs are vibe
              coding, AI remixing, tokenization and visual images.{" "}
              <b>These are your skills, and they are exactly what domain search needs.</b>
            </p>
            <p className="lead" style={{ marginTop: 14 }}>
              <b>The top three designs are cited by the .Kred registry for two years.</b> Every
              submission earns, and the full reward set is below.
            </p>
          </section>

          <section>
            <h2>Meet Kred</h2>
            <div className="agent">
              <h3>Our sister company's APIs</h3>
              <p>
                As many of you know, <b>Kred is a sister company of NFT.NYC</b> and owns the{" "}
                <b>.Kred top-level domain</b>. Kred has built a series of{" "}
                <a href="https://api.Domains.Kred/docs" style={{ color: "var(--vs-cyan)" }}>
                  domain and identity APIs
                </a>
                , packaged as <b>MCP</b> (the open protocol AI assistants use to call tools), ready
                to use from vibe coding platforms like Lovable.
              </p>
              <p>
                One ask: <b>design the next generation of domain search</b> — a next generation
                Domain Reseller built on the features of the Kred TLD, the TLD synonymous with
                identity. Describe the app you want to an AI coding agent and it builds with you.
                Design sense counts for more than syntax, and digital designers think out of the
                box and think deeply — that is exactly who this build needs.
              </p>
            </div>
          </section>

          <section>
            <h2>The Three Sprints</h2>
            <p className="lead">
              Each sprint runs in <b>audience rounds</b> — the same brief, run for a specific
              community, with one submission per round.
            </p>
            <div className="sprints">
              <div className="sp live" style={{ ["--tone" as string]: "var(--vs-pink)" } as React.CSSProperties}>
                <span className="no">1</span>
                <span className="date">
                  R1 · Mon 17 – Wed 19 Aug · NFT.NYC creators
                  <br />
                  R2 · Mon 24 – Wed 26 Aug · NamePros
                </span>
                <h3>The Next Gen Domain Reseller</h3>
                <p className="oneline"><b>Humans buying identity.</b></p>
                <p>
                  Build a next generation Domain Reseller on the Domains.Kred Registrar API — a
                  very visual experience, 100% Clear pricing on every card, every result explained.
                </p>
                <span className="chip">Registration open now</span>
              </div>
              <div className="sp" style={{ ["--tone" as string]: "var(--vs-cyan)" } as React.CSSProperties}>
                <span className="no">2</span>
                <span className="date">R1 · Mon 24 – Wed 26 Aug · NFT.NYC creators</span>
                <h3>The Agentic Domain Registrar</h3>
                <p className="oneline"><b>Agents buying identity.</b></p>
                <p>
                  The customer flips to agents: they discover, price, register, and enroll their
                  own .Kred agentic identity — AID, ANS, MCP-I, DNSid — end to end.
                </p>
                <span className="chip">Brief publishes Thu 20 Aug</span>
              </div>
              <div className="sp" style={{ ["--tone" as string]: "var(--vs-violet)" } as React.CSSProperties}>
                <span className="no">3</span>
                <span className="date">
                  R1 · Mon 31 Aug – Wed 2 Sep · Hugging Face + NFT.NYC creators
                </span>
                <h3>Agentic Debate on the Matrix</h3>
                <p className="oneline"><b>Agents in conversation.</b></p>
                <p>
                  Agents with .Kred identities join Matrix.Kred Nodes to discuss, debate, govern,
                  and score — one week before NFT.NYC.
                </p>
                <span className="chip">Brief publishes Thu 27 Aug</span>
              </div>
            </div>
            <p className="form-note" style={{ marginTop: 10 }}>
              September 2 · Live presentations on the main stage at NFT.NYC 2026, The Edison, Times
              Square. Sprint 3 runs
              right through the conference, built for the community building from anywhere. Every
              submission appears in the reel shown at NFT.NYC 2026; up to 20 selected submissions
              per sprint join the Times Square Showcase.
            </p>
          </section>

          <section className="dividersec">
            <h2 className="divider">Inside Sprint 1</h2>
          </section>

          <section>
            <h3 className="sub-h2">The Six Features of a Next Gen Domain Search App</h3>
            <p className="lead">
              Domain search should be a <b>very visual experience</b>: every result arrives
              dressed — cover art, story, both prices, and proof — with 100% Clear data
              underneath. These six features define "next generation", and the review rewards them.
            </p>
            <div className="kit">
              <div className="tile star">
                <b>1 · Positioned as Next Gen</b>
                A Next Gen Domain Search App with Visual AI and optimized LLM Discoverability —
                the category claim every submission makes.
              </div>
              <div className="tile">
                <b>2 · DNS ENS Tokenization</b>
                Mint a domain as a token through the API, with an ENS bridge — ownership readable
                the way this community expects. <code>POST /domains/{"{d}"}/token</code>
              </div>
              <div className="tile">
                <b>3 · 100% Clear results</b>
                String results sorted by the best string results for the user — never a
                TLD-sponsored search ladder — with the renewal price beside every first-year price
                and a visible "why this result?" line on every card.{" "}
                <a href="https://www.nft.nyc/blog/navigating-the-domain-search-muddle" style={{ color: "var(--vs-cyan)" }}>
                  The evidence: our registrar search exposé
                </a>
              </div>
              <div className="tile">
                <b>4 · Visual AI results</b>
                Produced with an AI assistant — <b>Wingman AI</b> — and associated with the domain
                string. Results wear imagery, identity, and motion.
              </div>
              <div className="tile">
                <b>5 · The Kredentials Lander on every name</b>
                Every .Kred name your app sells ships with a page from the first minute — and it
                grows into a full identity record. The section below has the whole story.
              </div>
              <div className="tile">
                <b>6 · Embedded in frontier models</b>
                Build on Lovable, publish publicly, enable Agent Integrations — your app works
                inside ChatGPT and Claude. Other platforms offer comparable routes.
              </div>
            </div>
          </section>

          <section>
            <h3 className="sub-h2">Start From Our Example Apps</h3>
            <p className="lead">
              Two remixable Lovable apps arrive with your Sprint 1 kit — remix either and your
              submission starts already talking to the API. Design references arrive at
              registration; the live app links arrive when Sprint 1 opens.
            </p>
            <p className="lead" style={{ marginTop: 10 }}>
              <b>Your Lovable credits are covered.</b> Your Sprint 1 kit carries an invite to our
              sponsored Vibe Sprint Workspace: join and receive <b>100 free credits</b> to build
              with. All remixes are visible to the workspace, so you build in the open, alongside
              your peers. To build outside the workspace instead, the referral link in your kit
              starts you with 15 credits.
            </p>
            <p className="lead" style={{ marginTop: 10 }}>
              <b>The whole remix is five steps and needs zero code.</b> Copy the project, paste in
              two keys, and you are taking payments from day one on the shared Stripe account.
            </p>
            <div className="examples">
              <div className="excard" style={{ background: "var(--color-surface)", border: "1px solid var(--card-border)", borderRadius: 8, overflow: "hidden" }}>
                <img
                  src="/vibesprint/demoapp-visualsearch-v4.jpg"
                  alt="Cats.Kred visual search demo — a 'catsonmotorbikes' one-word query surfaces the domain with an available badge, buy price, and three preview parking-page variants featuring AI-generated cat imagery"
                />
                <div className="excap">
                  <b>The Visual Domain Search</b>
                  Built for digital creators: type your artist name and three Kredentials Lander
                  previews come back already dressed — an illustration from the name, the name in
                  large type, one sentence introducing you, Make an Offer, and email capture. Pick
                  your discipline, compare six image generators, and browse the creative gallery
                  live at{" "}
                  <a
                    href="https://Kredentials.Kred/gallery"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--vs-cyan)" }}
                  >
                    Kredentials.Kred/gallery
                  </a>
                  .
                  <span className="exlink">Live app link arrives with your Sprint 1 kit</span>
                </div>
              </div>
              <div className="excard" style={{ background: "var(--color-surface)", border: "1px solid var(--card-border)", borderRadius: 8, overflow: "hidden" }}>
                <img
                  src="/vibesprint/demoapp-domainreseller-v2.jpg"
                  alt="dot.kred registrar demo — search available .kred names with a live availability check, whois status card, and a network visualization of the .kred namespace"
                />
                <div className="excap">
                  <b>The Domain Search App</b>
                  A clean, working domain search on the Domains.Kred Registrar API: availability,
                  first-year price, and renewal price on every card. The straightforward starting
                  point — remix it and make it yours.
                  <span className="exlink">Live app link arrives with your Sprint 1 kit</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="sub-h2">The Kredentials Lander</h3>
            <p className="lead">
              The page every .Kred name ships with — built by{" "}
              <a href="https://NFT.NYC/blog" style={{ color: "var(--vs-cyan)" }}>
                <b>Wingman AI</b>
              </a>{" "}
              in the minutes after registration, anchored on-chain by a <b>Domain Token</b>. Your
              search app sells names that arrive with a working page from the first minute, and the
              page grows with its owner.
            </p>
            <div
              style={{
                margin: "20px auto 22px",
                border: "1px solid var(--card-border)",
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              <img
                src={SKETCHLIGHT_IMAGE_URL}
                alt="The live Kredentials record at Sketchlight.Kred — the Bio banner, name, and verified links"
                loading="lazy"
                style={{ display: "block", width: "100%", height: "auto" }}
              />
            </div>
            <p className="form-note" style={{ maxWidth: 440, margin: "0 auto 18px", textAlign: "center" }}>
              A live record at its own name:{" "}
              <a href="https://Sketchlight.Kred" style={{ color: "var(--vs-cyan)" }}>
                Sketchlight.Kred
              </a>{" "}
              — light-painting photographer Ray Vagner: the banner from her own work, verified
              links, and Wingman AI live on the page. The Lander is where every new name starts;
              this is where it grows.
            </p>
            <div className="kit">
              <div className="tile star">
                <b>Ships at registration</b>
                One AI-generated illustration from the name itself, the name displayed in large
                type, one line of story, a Make an Offer button, and an email collector — with
                JSON-LD and /llms.txt underneath so AI assistants can read it. Minimal on the
                surface, complete underneath.
              </div>
              <div className="tile">
                <b>Grows into Kredentials</b>
                The Lander is the floor. The owner adds their links — a Linktree (it stays live and
                untouched), a .com website, socials, press — and Wingman AI writes the full verified
                record: every fact with a source and a date, worn in one of three formats.
              </div>
              <div className="tile">
                <b>Beyond the Lander</b>
                The same name can become a personal profile, a business page, an ENS-bridged wallet
                address, an agent with a Kred Score, or a full website — with Wingman AI attached to
                every path, refreshing the record and watching AI-crawler visibility.
              </div>
              <div className="tile">
                <b>In your app</b>
                The Kredentials API generates Landers and pages from a set of links — the spec
                arrives with your Sprint 1 kit. Every domain your app sells can carry its identity
                from the moment of purchase.
              </div>
            </div>
          </section>

          <section>
            <h2>What Every Submission Earns</h2>
            <p className="lead">
              Progression, never elimination. Submit inside the window with live Kred API calls
              and the full reward set is yours.
            </p>
            <div className="earn">
              <div className="ecard"><b>Finisher XP</b><span className="amt">2,500 XP</span>For every sprint you submit.</div>
              <div className="ecard"><b>Finisher Certificate</b><span className="amt">Minted NFT</span>Your submission's certificate, minted on the platform you built with.</div>
              <div className="ecard"><b>Build Report</b><span className="amt">Full feedback</span>What passed, what scored what, and what to level up next sprint.</div>
              <div className="ecard"><b>Times Square Showcase</b><span className="amt">Up to 20 per sprint</span>Up to 20 selected submissions per sprint are featured on the rotating Times Square billboard.</div>
              <div className="ecard"><b>Spotlight</b><span className="amt">$1,000 grant</span>One Spotlight submission per sprint earns a build grant and a deep-dive on the NFT.NYC blog; two Featured submissions earn recap coverage.</div>
            </div>
            <p className="form-note" style={{ marginTop: 12 }}>
              Achievements are objective bars, published before each sprint opens: Agent-Ready
              &middot; Full Loop &middot; Theatre &middot; 100% Clear Card, 1,000 XP each. The full
              reward detail lives in the About Pillar:{" "}
              <a href="https://www.nft.nyc/blog/the-kred-flash-sprints-from-first-prompt-to-the-nft-nyc-2026-stage" style={{ color: "var(--vs-cyan)" }}>
                The Kred Flash Sprints
              </a>
              .
            </p>
            <h3 style={{ marginTop: 30 }}>The top three designs</h3>
            <p className="lead">
              Above every submission's reward set sits one more:{" "}
              <b>
                the top three designs are acknowledged by the .Kred registry for the next two
                years.
              </b>
            </p>
            <div className="kit">
              <div className="tile star">
                <b>1 · Your credit, live</b>
                A design credit on Kred's domain search surfaces, linked to your .Kred page.
              </div>
              <div className="tile">
                <b>2 · Your design, deployed</b>
                The three winning designs run as official Kred search experiences.
              </div>
              <div className="tile">
                <b>3 · Your name, cited</b>
                Across the .Kred gallery, the Sprint 1 kit, and Kred marketing for the full two
                years.
              </div>
            </div>
            <p className="form-note" style={{ marginTop: 12 }}>
              Design once and be cited for two years — with your work promoted to the NFT.NYC
              community of <b>180,000+ members</b>.
            </p>
            <p className="form-note" style={{ marginTop: 8 }}>
              Every submission publishes under an open license (CC BY 4.0): anyone may use it,
              always with credit to the designer — full detail in the{" "}
              <a href="https://f005.backblazeb2.com/file/PB-HubSpot/Kred_Flash_Sprints_Participation_Terms_v1.pdf" style={{ color: "var(--vs-cyan)" }}>
                Participation Terms
              </a>
              .
            </p>
          </section>

          <section>
            <h2>Who We're Inviting</h2>
            <div className="kit">
              <div className="tile">
                <b>Digital graphic designers</b>
                This community. The review rewards visually attractive work: graphical excellence
                carries 25%, equal with working product.
              </div>
              <div className="tile">
                <b>Domainers who vibe code</b>
                NamePros and other domainer forums: you know the results pages. Build the one you
                wish existed.
              </div>
              <div className="tile">
                <b>AI developers via Hugging Face</b>
                Live registrar data, agent identity enrollment, and a published app that works
                inside ChatGPT and Claude.
              </div>
            </div>
            <p className="form-note" style={{ marginTop: 12 }}>
              <b style={{ color: "var(--color-text)" }}>Who your app serves:</b> creators above all
              — digital artists, designers, and speakers who need their name findable by humans and
              AI alike — then Linktree users who want to control their own domain, people tired of
              misleading mainstream search, and anyone who wants to be found by LLMs.
            </p>
          </section>

          <section>
            <h2>Live Support Both Evenings</h2>
            <div className="agent">
              <h3>Our lead engineer is on the call</h3>
              <p>
                Every sprint carries <b>two live Google Meet support sessions</b>, hosted by our
                lead engineer: from <b>4:00pm ET on the first two evenings</b> of the build
                window, each running <b>five to eight hours</b>. Sprint 1 sessions: Monday 17 and
                Tuesday 18 August.
              </p>
              <p>
                Authentication, API questions, publishing problems: bring the specific error and
                work through it live with the engineer. The Meet link arrives with your Sprint 1 kit,
                and registration is the only ticket required.
              </p>
              <CalendarLinks />
            </div>
          </section>

          <section>
            <h2>The API You Build On</h2>
            <div className="kit">
              <div className="tile"><b>Check</b><code>POST /domains/{"{d}"}/check</code><br />Availability, premium flag, and price — one call, fully disclosed.</div>
              <div className="tile"><b>Price any horizon</b><code>GET /domains/{"{d}"}/price?period=N</code><br />Multi-year cost for every result card. Renewal transparency is a query away.</div>
              <div className="tile"><b>Status</b><code>GET /domains/{"{d}"}/status</code><br />Who holds it, since when, expiry and nameservers — the whole WHOIS story.</div>
              <div className="tile"><b>Register</b><code>POST /domains/{"{d}"}/register</code><br />Real registrations funded by your Sprint 1 kit's API credits. Live demos earn.</div>
              <div className="tile"><b>Tokenize</b><code>POST /domains/{"{d}"}/token</code><br />Mint a domain token; ENS bridge; DNS zones; SSL.</div>
              <div className="tile"><b>Agent identity</b><code>POST /domains/{"{d}"}/agent</code><br />AID, ANS, MCP-I, DNSid — the AgenticID.Kred enrollment stack. Sprint 2's core.</div>
              <div className="tile"><b>Kredentials page</b><code>Spec pending</code><br />Generate a Lander or a full Kredentials page for a set of links. Endpoint spec publishes with the Sprint 1 kit.</div>
            </div>
            <p className="form-note" style={{ marginTop: 12 }}>
              Full interactive docs:{" "}
              <a href="https://api.Domains.Kred/docs" target="_blank" rel="noopener noreferrer" style={{ color: "var(--vs-cyan)" }}>api.Domains.Kred/docs</a>{" "}
              · Keys from{" "}
              <a href="https://console.Domains.Kred" target="_blank" rel="noopener noreferrer" style={{ color: "var(--vs-cyan)" }}>console.Domains.Kred</a>{" "}
              · For registrars:{" "}
              <a href="https://www.nic.kred/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--vs-cyan)" }}>Nic.Kred</a>
            </p>
          </section>

          <section>
            <h2>How Submissions Are Reviewed</h2>
            <div className="weights">
              <div className="wrow" style={{ ["--tone" as string]: "var(--vs-green)" } as React.CSSProperties}><span>Working product</span><span className="bar" style={{ ["--w" as string]: "100%" } as React.CSSProperties}></span><span className="pct">25%</span></div>
              <div className="wrow" style={{ ["--tone" as string]: "var(--vs-pink)" } as React.CSSProperties}><span>Graphical excellence</span><span className="bar" style={{ ["--w" as string]: "100%" } as React.CSSProperties}></span><span className="pct">25%</span></div>
              <div className="wrow" style={{ ["--tone" as string]: "var(--vs-cyan)" } as React.CSSProperties}><span>Depth of API usage</span><span className="bar" style={{ ["--w" as string]: "80%" } as React.CSSProperties}></span><span className="pct">20%</span></div>
              <div className="wrow" style={{ ["--tone" as string]: "var(--color-primary)" } as React.CSSProperties}><span>Transparency design</span><span className="bar" style={{ ["--w" as string]: "60%" } as React.CSSProperties}></span><span className="pct">15%</span></div>
              <div className="wrow" style={{ ["--tone" as string]: "var(--vs-violet)" } as React.CSSProperties}><span>Agent-readiness</span><span className="bar" style={{ ["--w" as string]: "60%" } as React.CSSProperties}></span><span className="pct">15%</span></div>
            </div>
            <p className="form-note" style={{ marginTop: 12 }}>
              Weights published before every sprint. Our review harness verifies API calls from
              our own server logs, runs a live Claude tool call on your published app, and hands
              the panel a full evidence pack. Every builder receives a Build Report after each
              close.
            </p>
          </section>

          <section>
            <h2>Sprint 1 Week</h2>
            <div className="tl">
              <div className="trow"><b>Tue 11 Aug</b>Sprint 1 announced; the story publishes on the NFT.NYC blog; registration opens.</div>
              <div className="trow"><b>Tue 11 – Mon 17 Aug</b>Register, claim your .Kred domain, study the example apps, explore the API with your credits.</div>
              <div className="trow hot"><b>Mon 17 Aug · 4:00pm ET</b>Sprint 1 opens: Sprint 1 kit published, 48-hour build window begins.</div>
              <div className="trow"><b>Mon 17 + Tue 18 Aug · From 4:00pm ET</b>Live Google Meet support: our lead engineer on an open call, five to eight hours each evening.</div>
              <div className="trow"><b>Wed 19 Aug · 4:00pm ET</b>Submissions close: app URL on your Kred domain, project link, MCP link, API evidence.</div>
              <div className="trow"><b>After close</b>Spotlight and Featured submissions recognized; Build Reports sent to every builder.</div>
            </div>
          </section>

          <section id="register">
            <h2>Register</h2>
            <p className="lead">
              One free registration covers all three sprints. Your Sprint 1 kit — Kred API credits,
              Lovable build credits in our sponsored workspace, a free .Kred domain claim, 1,000
              XP, both example app links, the Kredentials API spec, and the "Connect your Kred app
              to ChatGPT and Claude" one-pager, publishes when Sprint 1 opens, Monday 17 August at
              4:00pm ET.
            </p>
            <div className="success" role="status" style={{ marginBottom: 16 }}>
              <b>Sprint 1 registrations are closed.</b>
              <br />
              Sprint 2 is coming soon — check back shortly to claim your kit.
            </div>
            {submitted && (
              <div className="success" id="successCard" role="status">
                <b>You're in — for the whole season.</b> Your Sprint 1 kit — API credits, XP starter
                pack, and both example apps — arrives when Sprint 1 opens.<br />
                Your domain <b>{claimedDomain}</b> is reserved. You will receive an email from{" "}
                noreply@emailverification.info requesting that you verify your email address.
                <ul>
                  <li>The Sprint 1 kit arrives when Sprint 1 opens: Monday 17 August, 4:00pm ET.</li>
                  <li>Sprint 1 Round 1 runs Monday 17 – Wednesday 19 August, opening at 4:00pm ET.</li>
                  <li>Live engineer support runs both evenings, from 4:00pm ET — the Google Meet link is in your kit.</li>
                  <li>Up to 20 selected submissions per sprint join the Times Square Showcase.</li>
                </ul>
                <CalendarLinks />
              </div>
            )}
            <p className="form-note" style={{ marginTop: 10 }}>
              <a
                href="https://www.peoplebrowsr.com/tos"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--color-text-muted)" }}
              >
                PeopleBrowsr Terms of Service
              </a>{" "}
              ·{" "}
              <a
                href="https://f005.backblazeb2.com/file/PB-HubSpot/Kred_Flash_Sprints_Participation_Terms_v1.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--color-text-muted)" }}
              >
                Kred Flash Sprint ToS
              </a>
            </p>
          </section>

          <section id="submit">
            <h2>Submit Your Build</h2>
            <p className="lead">
              Submissions open with Sprint 1, <b>Monday 17 August at 4:00pm ET</b>, and hard close{" "}
              <b>Wednesday 19 August at 4:00pm ET</b>. You can edit or resubmit any time before
              close.
            </p>
            <div className="meters" style={{ margin: "18px 0 22px" }}>
              <div className="meter" aria-live="polite">
                <b>{submitCountdown.value}</b>
                <span>{submitCountdown.label}</span>
              </div>
            </div>
            <h3 className="sub-h2" style={{ fontSize: 20 }}>
              What you will need
            </h3>
            <p className="lead">
              Worth reading before you build rather than on the day, because the second one shapes
              where you publish.
            </p>
            <ol className="req-list">
              <li>
                <b>The email you registered with.</b> It ties your submission to your registration.
              </li>
              <li>
                <b>Your app URL, live on your .Kred domain.</b> The build has to be published on
                the .Kred name that came with your Sprint 1 kit. Building somewhere else and
                moving it later is the one avoidable way to miss the close.
              </li>
              <li>
                <b>Your project link.</b> Lovable, Replit, Vercel, Base44, Bolt, or wherever you
                built.
              </li>
              <li>
                <b>Team members, optional.</b> Anyone else who worked on it, named for the reward
                set only. Team size plays no part in judging.
              </li>
            </ol>
            {!subSent && (
              <form onSubmit={onSubmitBuild} noValidate style={{ marginTop: 20 }}>
                <div className="field">
                  <label htmlFor="sEmail">Registration email</label>
                  <input
                    id="sEmail"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={subEmail}
                    onChange={(e) => setSubEmail(e.target.value)}
                  />
                </div>
                <div className="field full">
                  <label htmlFor="sAppUrl">App Name</label>
                  <input
                    id="sAppUrl"
                    name="app_name"
                    type="text"
                    required
                    placeholder="e.g. My Kred App"
                    value={subAppUrl}
                    onChange={(e) => { setSubAppUrl(e.target.value); setSubError(null); }}
                  />
                  <span className="form-note">The name of your app as you'd like it shown on your submission.</span>
                </div>
                <div className="field full">
                  <label htmlFor="sProjectUrl">Project link</label>
                  <input
                    id="sProjectUrl"
                    name="project_url"
                    type="url"
                    required
                    placeholder="https://lovable.dev/projects/..."
                    value={subProjectUrl}
                    onChange={(e) => setSubProjectUrl(e.target.value)}
                  />
                  <span className="form-note">Lovable, Replit, Vercel, Base44, Bolt, or other.</span>
                </div>
                <div className="field full">
                  <label htmlFor="sTeam">Team members (optional)</label>
                  <textarea
                    id="sTeam"
                    name="team_members"
                    rows={3}
                    placeholder={"Name — email (one per line)"}
                    value={subTeam}
                    onChange={(e) => setSubTeam(e.target.value)}
                  />
                  <span className="form-note">
                    Anyone else who worked on this — for reward credit only, not used in judging.
                  </span>
                </div>
                <div className="form-actions">
                  <button className="btn" type="submit" disabled={subSending}>
                    {subSending ? "Submitting…" : "Submit my build"}
                  </button>
                  <span className="form-note">
                    Not registered yet?{" "}
                    <a href="#register" style={{ color: "var(--vs-cyan)" }}>
                      Register free first
                    </a>
                    , it takes a minute and covers all three sprints.
                  </span>
                </div>
                {subError && (
                  <p className="form-note" role="alert" style={{ marginTop: 10, color: "#F15621" }}>
                    {subError}
                  </p>
                )}
              </form>
            )}
            {subSent && (
              <div className="success" id="buildSuccessCard" role="status">
                <b>{subWasUpdate ? "Submission updated — you're in." : "You're in — submission received."}</b>{" "}
                We have your app URL and project link on file for Sprint 1.
                <ul>
                  <li>Keep building — you can resubmit with the same email any time before close.</li>
                  <li>Every valid submission earns Finisher XP, a Finisher Certificate, and a Build Report.</li>
                  <li>Up to 20 selected submissions per sprint join the Times Square Showcase.</li>
                </ul>
                <div className="form-actions" style={{ marginTop: 12 }}>
                  <button className="btn ghost" type="button" onClick={() => setSubSent(false)}>
                    Edit my submission
                  </button>
                </div>
              </div>
            )}
          </section>

          <section>
            <h2>Read More</h2>
            <div className="links">
              <a className="lk ext" href="https://www.nft.nyc/blog/the-kred-flash-sprints-from-first-prompt-to-the-nft-nyc-2026-stage" target="_blank" rel="noopener noreferrer">
                <small>About the series</small>The Kred Flash Sprints
              </a>
              <a className="lk ext" href="https://www.nft.nyc/blog/navigating-the-domain-search-muddle" target="_blank" rel="noopener noreferrer">
                <small>The market, documented</small>Navigating the Domain Search Muddle
              </a>
              <a className="lk ext" href="https://kredentials.lovable.app/guides/anatomy-of-a-parking-page" target="_blank" rel="noopener noreferrer">
                <small>Four eras ending at the Lander</small>Anatomy of a Parking Page
              </a>
              <a className="lk ext" href="https://kredentials.kred/guides/how-wingman-builds-your-page" target="_blank" rel="noopener noreferrer">
                <small>How Kredentials pages are built</small>The Wingman Pipeline Explainer
              </a>
              <a className="lk ext" href="https://Kredentials.Kred" target="_blank" rel="noopener noreferrer">
                <small>The identity layer</small>Kredentials.Kred
              </a>
              <a className="lk ext" href="https://Kredentials.Kred/gallery" target="_blank" rel="noopener noreferrer">
                <small>1,100+ names recently added</small>The Gallery
              </a>
              <a className="lk ext" href="https://www.nic.kred/" target="_blank" rel="noopener noreferrer">
                <small>For registrars</small>Nic.Kred
              </a>
            </div>
          </section>


        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
