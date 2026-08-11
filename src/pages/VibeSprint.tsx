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
/** Sprint 1 opens Wed 12 Aug 2026, 4:00pm ET (20:00 UTC). */
const SPRINT1_UTC = Date.UTC(2026, 7, 12, 20, 0, 0);

const EVENT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Kred Flash Sprint 1 — The Next Gen Domain Reseller",
  description:
    "Build a next generation Domain Reseller on the Domains.Kred Registrar API. A 48-hour vibe coding sprint — build in Lovable or the platform of your choice, publish an agent-ready app that ChatGPT and Claude can call. Sprint 1 of three, leading to Demo Day at NFT.NYC 2026.",
  startDate: "2026-08-12T16:00:00-04:00",
  endDate: "2026-08-14T16:00:00-04:00",
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
  const [buildTool, setBuildTool] = useState("Lovable (primary — Agent Integrations)");
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
            <div className="eyebrow">PeopleBrowsr × NFT.NYC 2026 · https://NFT.NYC/vibesprint</div>
            <h1>
              Kred Flash Sprints<br />
              <span className="glow">Three Sprints to NFT.NYC</span>
            </h1>
            <p className="sub">
              Help us build a better domain identity search experience — customized,{" "}
              <b>very visual</b>, AI driven, and made for the <b>creator community</b>. Three{" "}
              <b>48-hour vibe coding sprints</b>, each opening Wednesday at <b>4:00pm ET</b>,
              starting <b>12 August</b>. Build in <b>Lovable or the platform of your choice</b> —
              publish a Lovable app with Agent Integrations and it works inside{" "}
              <b>ChatGPT and Claude</b>.
            </p>
            <div className="badges">
              <span className="badge hot">Registration opens Tue 11 Aug</span>
              <span className="badge hot">Sprint 1 · Wed 12 – Fri 14 Aug · Opens 4:00pm ET</span>
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
                One free registration covers all three sprints. Your Sprint 1 kit — API credits, free
                .Kred domain claim, 1,000 XP, and both example apps — arrives when Sprint 1 opens.
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
              your gallery, your payments, and your brand.
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
              in decades. There is a unique opening to build a{" "}
              <b>better, visual, AI driven domain search</b>, and the skills it needs — vibe
              coding, AI remixing, tokenization, visual images — are the skills this community
              already has.
            </p>
          </section>

          <section>
            <h2>Meet Kred</h2>
            <div className="agent">
              <h3>Our sister company's APIs</h3>
              <p>
                As many of you know, <b>Kred is a sister company of NFT.NYC</b> and owns the{" "}
                <b>.Kred top-level domain</b>. Kred has built a series of domain and identity
                APIs, packaged as <b>MCP</b> (the open protocol AI assistants use to call tools),
                ready to use from vibe coding platforms like Lovable.
              </p>
              <p>
                One ask: <b>build a next generation Domain Reseller using the features of the Kred
                TLD</b> — the TLD synonymous with identity. Describe the app you want to an AI
                coding agent and it builds with you. Design sense counts for more than syntax, and
                digital designers think out of the box and think deeply — that is exactly who this
                build needs.
              </p>
            </div>
          </section>

          <section>
            <h2>The Three Sprints</h2>
            <div className="sprints">
              <div className="sp live" style={{ ["--tone" as string]: "var(--vs-pink)" } as React.CSSProperties}>
                <span className="no">1</span>
                <span className="date">Wed 12 – Fri 14 Aug · Opens 4:00pm ET</span>
                <h3>The Next Gen Domain Reseller</h3>
                <p>
                  Build a next generation Domain Reseller on the Domains.Kred Registrar API — a
                  very visual experience, 100% Clear pricing on every card, every result explained.
                </p>
                <span className="chip">Registration opens Tue 11 Aug</span>
              </div>
              <div className="sp" style={{ ["--tone" as string]: "var(--vs-cyan)" } as React.CSSProperties}>
                <span className="no">2</span>
                <span className="date">Wed 19 – Fri 21 Aug · Opens 4:00pm ET</span>
                <h3>The Agentic Domain Registrar</h3>
                <p>
                  The customer flips to agents: they discover, price, register, and enroll their
                  own .Kred agentic identity — AID, ANS, MCP-I, DNSid — end to end.
                </p>
                <span className="chip">Brief arrives Fri 14 Aug</span>
              </div>
              <div className="sp" style={{ ["--tone" as string]: "var(--vs-violet)" } as React.CSSProperties}>
                <span className="no">3</span>
                <span className="date">Wed 26 – Fri 28 Aug · Opens 4:00pm ET</span>
                <h3>Agentic Debate on the Matrix</h3>
                <p>
                  Agents with .Kred identities join Matrix.Kred Nodes to discuss, debate, govern,
                  and score — one week before NFT.NYC.
                </p>
                <span className="chip">Brief arrives Fri 21 Aug</span>
              </div>
            </div>
            <p className="form-note" style={{ marginTop: 10 }}>
              One builder — selected by the review panel from the sprints' Spotlight and Featured
              submissions — presents the marquee demo at Demo Day, NFT.NYC 2026, 1 September.
              Up to 20 selected submissions per sprint join the Times Square Showcase.
            </p>
          </section>

          <section>
            <h2>The Five Features of a Next Gen Domain Search App</h2>
            <p className="lead">
              Domain search should be a <b>very visual experience</b>: every result arrives
              dressed — cover art, story, both prices, and proof — with 100% Clear data
              underneath. These five features define "next generation", and the review rewards them.
            </p>
            <div className="kit">
              <div className="tile star">
                <b>1 · Positioned as Next Gen</b>
                A Next Gen Domain Search App with Visual AI and optimized LLM Discoverability —
                the category claim every submission makes.
              </div>
              <div className="tile">
                <b>2 · 100% Clear results</b>
                String results sorted by the best string results for the user — never a
                TLD-sponsored search ladder — with the renewal price beside every first-year price
                and a visible "why this result?" line on every card.{" "}
                <a href="https://NFT.NYC/blog" style={{ color: "var(--vs-cyan)" }}>
                  The evidence: our registrar search exposé
                </a>
              </div>
              <div className="tile">
                <b>3 · Visual AI results</b>
                Produced with an AI assistant — <b>Wingman</b> — and associated with the domain
                string. Results wear imagery, identity, and motion.
              </div>
              <div className="tile">
                <b>4 · A companion Kredentials page</b>
                Offer every domain buyer the optional Kredentials add-on: a page generated from
                their links. The section below has the whole story.
              </div>
              <div className="tile">
                <b>5 · Embedded in frontier models</b>
                Build on Lovable, publish publicly, enable Agent Integrations — your app works
                inside ChatGPT and Claude. Other platforms offer comparable routes.
              </div>
            </div>
          </section>

          <section>
            <h2>Start From Our Example Apps</h2>
            <p className="lead">
              Two remixable Lovable apps arrive with your Sprint 1 kit — remix either and your
              submission starts already talking to the API. Design references arrive at
              registration; the live app links arrive when Sprint 1 opens.
            </p>
            <div className="examples">
              <div className="excard" style={{ background: "var(--color-surface)", border: "1px solid var(--card-border)", borderRadius: 8, overflow: "hidden" }}>
                <img
                  src="/vibesprint/demoapp-visualsearch-v4.jpg"
                  alt="Cats.Kred visual search demo — a 'catsonmotorbikes' one-word query surfaces the domain with an available badge, buy price, and three preview parking-page variants featuring AI-generated cat imagery"
                />
                <div className="excap">
                  <b>The Visual Domain Search</b>
                  Built for digital creators: type your artist name and meet YourName.Kred already
                  dressed — your cover art, your origin story, and a live AI greeter — plus a
                  gallery where every creator name arrives with matching Kredentials imagery.
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
            <h2>The Kredentials Add-On</h2>
            <p className="lead">
              Every Kred domain can carry a companion <b>Kredentials page</b> — a supplemental add-on
              for anyone who receives a Kred domain, and the identity layer your search app can
              offer with every name it sells.
            </p>
            <p className="form-note" style={{ maxWidth: 440, margin: "0 auto 18px", textAlign: "center" }}>
              A live record at its own name:{" "}
              <a href="https://Sketchlight.Kred" style={{ color: "var(--vs-cyan)" }}>
                Sketchlight.Kred
              </a>{" "}
              - light-painting photographer Ray Vagner, with Wingman-verified links,
              machine-readable identity, worn in the Bio format.
            </p>
            <div className="kit">
              <div className="tile">
                <b>Built from their links</b>
                A pasted Linktree (which stays live and untouched), a .com website, social profiles,
                press links. Wingman, the agent behind every page, gathers the sources, writes the
                page, and verifies every fact.
              </div>
              <div className="tile">
                <b>Made for answer engines</b>
                A verified, machine-readable identity record — on the golden renders: 38 verified
                facts, 21 full-text answers, 21 cited sources. Editorial for humans, readable by
                LLMs.
              </div>
              <div className="tile">
                <b>In your app</b>
                The Kredentials API generates a page from a set of links — spec arrives with your
                Sprint 1 kit. Offer it as the add-on on every domain your app sells.
              </div>
            </div>
            <p className="form-note" style={{ marginTop: 12 }}>
              Live pages:{" "}
              <a href="https://Kredentials.Kred" target="_blank" rel="noopener noreferrer" style={{ color: "var(--vs-cyan)" }}>
                Kredentials.Kred
              </a>{" "}
              · the Gallery:{" "}
              <a href="https://Kredentials.Kred/gallery" target="_blank" rel="noopener noreferrer" style={{ color: "var(--vs-cyan)" }}>
                Kredentials.Kred/gallery
              </a>{" "}
              · how pages are built: the Wingman Pipeline Explainer on the{" "}
              <a href="https://NFT.NYC/blog" style={{ color: "var(--vs-cyan)" }}>NFT.NYC blog</a>.
            </p>
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
              Achievements are objective bars, published before each sprint opens: Agent-Ready ·
              Full Loop · Theatre · 100% Clear Card — 1,000 XP each.
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
              <b style={{ color: "var(--color-text)" }}>Who your app serves:</b> Linktree users who
              want to control their own domain and care about their identity and AI
              discoverability, people tired of misleading mainstream search, and anyone who wants
              to be found by LLMs.
            </p>
          </section>

          <section>
            <h2>Live Support Both Evenings</h2>
            <div className="agent">
              <h3>Our lead engineer is on the call</h3>
              <p>
                Every sprint carries <b>two live Google Meet support sessions</b>, hosted by our
                lead engineer: from <b>4:00pm ET on the first two evenings</b> of the build
                window, each running <b>five to eight hours</b>. Sprint 1 sessions: Wednesday 12
                and Thursday 13 August.
              </p>
              <p>
                Authentication, API questions, publishing problems: bring the specific error and
                work through it live with the engineer. The Meet link arrives with your Sprint 1 kit,
                and registration is the only ticket required.
              </p>
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
              <div className="tile"><b>Kredentials page</b><code>Spec pending</code><br />Generate a Lander or a full Kredentials page for a set of links. Endpoint spec arrives with the Sprint 1 kit.</div>
            </div>
            <p className="form-note" style={{ marginTop: 12 }}>
              Full interactive docs:{" "}
              <a href="https://api.Domains.Kred/docs" target="_blank" rel="noopener noreferrer" style={{ color: "var(--vs-cyan)" }}>api.Domains.Kred/docs</a>{" "}
              · Keys from{" "}
              <a href="https://console.Domains.Kred" target="_blank" rel="noopener noreferrer" style={{ color: "var(--vs-cyan)" }}>console.Domains.Kred</a>{" "}
              · For registrars:{" "}
              <a href="https://Nic.Kred" target="_blank" rel="noopener noreferrer" style={{ color: "var(--vs-cyan)" }}>Nic.Kred</a>
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
              <div className="trow"><b>Tue 11 – Wed 12 Aug</b>Register, claim your .Kred domain, study the example apps, explore the API with your credits.</div>
              <div className="trow hot"><b>Wed 12 Aug · 4:00pm ET</b>Sprint 1 opens: Sprint 1 kit published, 48-hour build window begins.</div>
              <div className="trow"><b>Wed 12 + Thu 13 Aug · From 4:00pm ET</b>Live Google Meet support: our lead engineer on an open call, five to eight hours each evening.</div>
              <div className="trow"><b>Fri 14 Aug · 4:00pm ET</b>Submissions close: app URL on your Kred domain, project link.</div>
              <div className="trow"><b>After close</b>Spotlight and Featured submissions recognized; Build Reports sent to every builder.</div>
            </div>
          </section>

          <section id="register">
            <h2>Register</h2>
            <p className="lead">
              One free registration covers all three sprints. Your Sprint 1 kit — Kred API credits, a
              free .Kred domain claim, 1,000 XP, and both example app links — arrives when
              Sprint 1 opens, Wednesday 12 August at 4:00pm ET.
            </p>
            {!submitted && (
              <form onSubmit={onSubmit} noValidate>
                <div className="field">
                  <label htmlFor="fName">Name or agent name</label>
                  <input
                    id="fName"
                    name="name"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="fEmail">Email</label>
                  <input
                    id="fEmail"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="fSegment">I am a</label>
                  <select
                    id="fSegment"
                    name="segment"
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                  >
                    <option>Designer or digital artist</option>
                    <option>Developer</option>
                    <option>Domain investor or reseller</option>
                    <option>AI agent (or agent owner)</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="fTool">Build platform</label>
                  <select
                    id="fTool"
                    name="tool"
                    value={buildTool}
                    onChange={(e) => setBuildTool(e.target.value)}
                  >
                    <option>Lovable (primary — Agent Integrations)</option>
                    <option>Replit</option>
                    <option>Vercel + GitHub</option>
                    <option>Base44</option>
                    <option>Bolt</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="field full">
                  <label htmlFor="fDomain">Claim your free Kred domain</label>
                  <div className="domain-row">
                    <input
                      id="fDomain"
                      name="domain"
                      placeholder="yourname"
                      required
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                    />
                    <span className="tld">.Kred</span>
                  </div>
                  {domainCheck.state === "checking" && (
                    <p className="form-note" style={{ marginTop: 6 }}>Checking availability…</p>
                  )}
                  {domainCheck.state === "available" && (
                    <p className="form-note" style={{ marginTop: 6, color: "#12a150" }}>
                      {domain.trim()}.Kred is available.
                    </p>
                  )}
                  {domainCheck.state === "taken" && (
                    <p className="form-note" style={{ marginTop: 6, color: "#F15621" }}>
                      {domainCheck.message || `${domain.trim()}.Kred is already taken — try another name.`}
                    </p>
                  )}
                  {domainCheck.state === "unknown" && domainCheck.message && (
                    <p className="form-note" style={{ marginTop: 6 }}>{domainCheck.message}</p>
                  )}
                </div>
                <RegistrantContactFields open={domain.trim().length > 0} onChange={setContact} />
                <div className="agree">
                  <input
                    id="fAgree"
                    type="checkbox"
                    required
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                  />
                  <label htmlFor="fAgree">
                    I accept the{" "}
                    <a
                      href="https://www.peoplebrowsr.com/tos"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      PeopleBrowsr Terms of Service
                    </a>
                    , and I understand XP carries a 60-day expiry with zero monetary value.
                  </label>
                </div>
                <div className="form-actions">
                  <button
                    className="btn"
                    type="submit"
                    disabled={sending || domainCheck.state === "taken" || domainCheck.state === "checking"}
                  >
                    {sending ? "Registering…" : "Claim my kit and register"}
                  </button>
                  <span className="form-note">
                    Free to enter. One registration covers all three sprints. Kit issued when
                    Sprint 1 opens.
                  </span>
                </div>
                {formError && (
                  <p className="form-note" role="alert" style={{ marginTop: 10, color: "#F15621" }}>
                    {formError}
                  </p>
                )}
              </form>
            )}
            {submitted && (
              <div className="success" id="successCard" role="status">
                <b>You're in — for the whole season.</b> Your Sprint 1 kit — API credits, XP starter
                pack, and both example apps — arrives when Sprint 1 opens.<br />
                Your domain <b>{claimedDomain}</b> is reserved — complete the claim from the email
                link.
                <ul>
                  <li>The Sprint 1 kit arrives when Sprint 1 opens: Wednesday 12 August, 4:00pm ET.</li>
                  <li>Sprint 1 runs Wednesday 12 – Friday 14 August, opening at 4:00pm ET.</li>
                  <li>Live engineer support runs both evenings, from 4:00pm ET — the Google Meet link is in your kit.</li>
                  <li>Up to 20 selected submissions per sprint join the Times Square Showcase.</li>
                </ul>
              </div>
            )}
          </section>

          <section>
            <h2>Read More</h2>
            <div className="links">
              <a className="lk ext" href="https://NFT.NYC/blog" target="_blank" rel="noopener noreferrer">
                <small>About the series (P14)</small>The Kred Flash Sprints — About Pillar
              </a>
              <a className="lk ext" href="https://NFT.NYC/blog" target="_blank" rel="noopener noreferrer">
                <small>The market, documented (P24)</small>Navigating the Domain Search Muddle
              </a>
              <a className="lk ext" href="https://NFT.NYC/blog" target="_blank" rel="noopener noreferrer">
                <small>Four eras ending at the Lander (P3)</small>Anatomy of a Parking Page
              </a>
              <a className="lk ext" href="https://NFT.NYC/blog" target="_blank" rel="noopener noreferrer">
                <small>How Kredentials pages are built (P22)</small>The Wingman Pipeline Explainer
              </a>
              <a className="lk ext" href="https://Kredentials.Kred" target="_blank" rel="noopener noreferrer">
                <small>The identity layer</small>Kredentials.Kred
              </a>
              <a className="lk ext" href="https://Kredentials.Kred/gallery" target="_blank" rel="noopener noreferrer">
                <small>1,100+ names recently added</small>The Gallery
              </a>
              <a className="lk ext" href="https://Nic.Kred" target="_blank" rel="noopener noreferrer">
                <small>For registrars</small>Nic.Kred
              </a>
            </div>
          </section>

          <div className="foot">
            KRED FLASH SPRINTS · BUILD A BETTER DOMAIN IDENTITY SEARCH · PEOPLEBROWSR × NFT.NYC 2026 · DEMO DAY 1 SEPTEMBER, NEW YORK<br />
            MOCKUP V14 · THE MERGED PAGE (P30 + P31 CONSOLIDATED 8 AUG) · DEPLOYS TO HTTPS://NFT.NYC/VIBESPRINT · REGISTRATION FLOW BUILT SEPARATELY IN LOVABLE · COUNTDOWN IS DEMO-ONLY
          </div>

        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
