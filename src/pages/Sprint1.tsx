import { useEffect, useMemo, useState, type FormEvent, type CSSProperties } from "react";
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
 * Sprint 1 landing page (content v2) — "The Next Gen Domain Reseller".
 * Shares the .vibesprint stylesheet and the same registration flow as
 * /vibesprint (submit-vibesprint-registration edge function).
 */

/** Sprint 1 opens Wed 12 Aug 2026, 4:00pm ET (20:00 UTC). */
const SPRINT1_OPEN_UTC = Date.UTC(2026, 7, 12, 20, 0, 0);
/** Submissions close Fri 14 Aug 2026, 4:00pm ET (20:00 UTC). */
const SPRINT1_CLOSE_UTC = Date.UTC(2026, 7, 14, 20, 0, 0);

const EVENT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Kred Flash Sprint 1 — The Next Gen Domain Reseller",
  description:
    "A 48-hour build sprint: build a next generation Domain Reseller on the Domains.Kred Registrar API. Opens Wednesday 12 August 4:00pm ET, closes Friday 14 August 4:00pm ET.",
  startDate: "2026-08-12T16:00:00-04:00",
  endDate: "2026-08-14T16:00:00-04:00",
  eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: { "@type": "VirtualLocation", url: "https://nft.nyc/sprint1" },
  organizer: { "@type": "Organization", name: "NFT.NYC", url: "https://nft.nyc" },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: "https://nft.nyc/sprint1",
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
  if (now < SPRINT1_OPEN_UTC) {
    return { value: formatDuration(SPRINT1_OPEN_UTC - now), label: "until Sprint 1 opens" };
  }
  if (now < SPRINT1_CLOSE_UTC) {
    return { value: formatDuration(SPRINT1_CLOSE_UTC - now), label: "until submissions close" };
  }
  return { value: "CLOSED", label: "Sprint 1 has closed" };
}

const tone = (v: string) => ({ ["--tone" as string]: v } as CSSProperties);
const width = (v: string) => ({ ["--w" as string]: v } as CSSProperties);

export default function Sprint1() {
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (document.documentElement.getAttribute("data-theme") as "dark" | "light") || "dark"
  );
  const stage = useMemo(() => Number(localStorage.getItem("nftnyc-stage") ?? 0), []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const [countdown, setCountdown] = useState(computeCountdown);
  useEffect(() => {
    const id = window.setInterval(() => setCountdown(computeCountdown()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Registration form state — same payload as /vibesprint.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [segment, setSegment] = useState("Designer or digital artist");
  const [buildTool, setBuildTool] = useState("Lovable (primary — Agent Integrations)");
  const [domain, setDomain] = useState("");
  const [agree, setAgree] = useState(false);
  const [contact, setContact] = useState<RegistrantContact>(EMPTY_CONTACT);
  const [submitted, setSubmitted] = useState(false);
  const [claimedDomain, setClaimedDomain] = useState("yourname.Kred");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const d = domain.trim() || "yourname";
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
      console.error("Sprint 1 registration failed:", err);
      setFormError("We couldn't save your registration. Please try again, or email team@nft.nyc.");
      setSending(false);
      return;
    }
    setSending(false);
    setClaimedDomain(`${d}.Kred`);
    setSubmitted(true);
    window.setTimeout(() => {
      document.getElementById("successCard")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  return (
    <div
      data-theme={theme}
      style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)" }}
    >
      <PageMeta page="sprint1" />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(EVENT_JSON_LD)}</script>
      </Helmet>
      <Header theme={theme} onToggleTheme={toggleTheme} stage={stage} />

      <div className="vibesprint">
        <div className="wrap" style={{ paddingTop: 96 }}>

          <header className="hero">
            <div className="eyebrow">Kred Flash Sprints · Sprint 1 · Wed 12 – Fri 14 August</div>
            <h1>
              Sprint 1<br />
              <span className="glow">The Next Gen Domain Reseller</span>
            </h1>
            <p className="sub">
              One ask: <b>build a next generation Domain Reseller using the features of the Kred TLD</b> —
              the TLD synonymous with identity: human, agentic, and agentic discoverability via
              Kredentials. A <b>48-hour build window</b>, opening <b>Wednesday 12 August at 4:00pm ET</b>{" "}
              and closing Friday 14 August at 4:00pm ET. Build in{" "}
              <b>Lovable or the platform of your choice</b> — publish a Lovable app with Agent
              Integrations and it works inside <b>ChatGPT and Claude</b>. Up to 20 selected
              submissions per sprint join the <b>Times Square Showcase</b>.
            </p>
            <div className="badges">
              <span className="badge hot">Wed 12 – Fri 14 Aug · Opens 4:00pm ET</span>
              <span className="badge tool">Lovable primary · any platform welcome</span>
              <span className="badge api">Live engineer support · Both evenings</span>
            </div>
            <div className="meters">
              <div className="meter" aria-live="polite">
                <b>{countdown.value}</b>
                <span>{countdown.label}</span>
              </div>
            </div>
            <div className="cta-row">
              <a className="btn" href="#register">Register free</a>
              <span className="cta-note">
                Registration covers all three sprints. Your kit — API credits, free .Kred domain
                claim, 1,000 XP, and both example apps — arrives when Sprint 1 opens.
              </span>
            </div>
          </header>

          <section>
            <h2>The Five Features of a Next Gen Domain Search App</h2>
            <p className="lead">
              These five features define "next generation", and the review rewards them. 100% Clear
              data underneath, a feast on top.
            </p>
            <div className="kit">
              <div className="tile star">
                <b>1 · Positioned as Next Gen</b>
                A Next Gen Domain Search App with Visual AI and optimized LLM Discoverability — the
                category claim every submission makes.
              </div>
              <div className="tile">
                <b>2 · 100% Clear results</b>
                String results sorted by the best string results for the user — never a
                TLD-sponsored search ladder. First-year price, renewal price, and a visible
                "why this result?" line on every card.{" "}
                <a href="/blog" style={{ color: "var(--vs-cyan)" }}>The evidence: our registrar search exposé</a>
              </div>
              <div className="tile">
                <b>3 · Visual AI results</b>
                Produced with an AI assistant — <b>Wingman</b> — and associated with the domain
                string. Results wear imagery, identity, and motion.
              </div>
              <div className="tile">
                <b>4 · A companion Kredentials page</b>
                Offer every domain applicant the optional Kredentials add-on: a page generated from
                their links that makes their name legible to LLMs.
              </div>
              <div className="tile">
                <b>5 · Embedded in frontier models</b>
                Build on Lovable, publish publicly, enable Agent Integrations — your app works
                inside ChatGPT and Claude. Other platforms offer comparable routes.
              </div>
            </div>
          </section>

          <section>
            <h2>Who This Sprint Is For</h2>
            <div className="kit">
              <div className="tile">
                <b>Digital graphic designers</b>
                The NFT.NYC audience: you can describe an app clearly and you care how it looks. The
                review weights graphical excellence at 25% — equal with working product.
              </div>
              <div className="tile">
                <b>Domainers who vibe code</b>
                You know what a misleading results page looks like. Build the one you wish existed,
                on a registrar API that disclosures everything in one call.
              </div>
              <div className="tile">
                <b>AI developers</b>
                Live registrar data, agent identity enrollment, and a published app that works
                inside ChatGPT and Claude — a real API surface, in one sitting.
              </div>
            </div>
          </section>

          <section>
            <h2>What Every Submission Earns</h2>
            <p className="lead">
              Progression, never elimination. Submit inside the window with live Kred API calls and
              the full reward set is yours.
            </p>
            <div className="earn">
              <div className="ecard"><b>Finisher XP</b><span className="amt">2,500 XP</span>For every sprint you submit.</div>
              <div className="ecard"><b>Finisher Certificate</b><span className="amt">Minted NFT</span>Your submission's certificate, minted on the platform you built with.</div>
              <div className="ecard"><b>Build Report</b><span className="amt">Full feedback</span>What passed, what scored what, and what to level up next sprint.</div>
              <div className="ecard"><b>Times Square Showcase</b><span className="amt">Up to 20 per sprint</span>Up to 20 selected submissions per sprint are featured on the rotating Times Square billboard.</div>
              <div className="ecard"><b>Spotlight</b><span className="amt">$1,000 grant</span>One Spotlight submission per sprint earns a build grant and a deep-dive on the NFT.NYC blog; two Featured submissions earn recap coverage.</div>
            </div>
            <p className="form-note" style={{ marginTop: 12 }}>
              Achievements are objective bars, published before the sprint opens: Agent-Ready · Full
              Loop · Theatre · 100% Clear Card — 1,000 XP each. The Season Headliner, selected by the
              review panel from the sprints' Spotlight and Featured submissions, presents at Demo
              Day, NFT.NYC 2026, 1 September.
            </p>
          </section>

          <section>
            <h2>Remix Our Example Apps</h2>
            <p className="lead">
              We release two remixable Lovable apps ahead of Sprint 1 — remix either and your
              submission starts already talking to the API. Design references arrive in your kit
              today; the live app links arrive with your kit when Sprint 1 opens.
            </p>
            <div className="examples">
              <div className="excard" style={{ background: "var(--color-surface)", border: "1px solid var(--card-border)", borderRadius: 8, overflow: "hidden" }}>
                <img
                  src="/vibesprint/Example Visual Search Thumb v1.jpg"
                  alt="DomainsKred visual search wireframe — Cats.Kred hero with browser search bar, cover art, and AI greeter"
                />
                <div className="excap">
                  <b>The Visual Domain Search</b>
                  Type one word and meet the domain already dressed: Cats.Kred wearing its own cover
                  art, origin story, trust score, and a live AI greeter — plus a gallery where every
                  domain idea arrives with matching Kredentials imagery.
                  <span className="exlink">Design reference arrives with your Sprint 1 kit</span>
                </div>
              </div>
              <div className="excard" style={{ background: "var(--color-surface)", border: "1px solid var(--card-border)", borderRadius: 8, overflow: "hidden" }}>
                <div className="excap">
                  <b>The Domain Search App</b>
                  A clean, working domain search on the Domains.Kred Registrar API: availability,
                  first-year price, and renewal price on every card. The straightforward
                  starting point — remix it and make it yours.
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
              <a href="https://Kredentials.Kred" target="_blank" rel="noopener noreferrer" style={{ color: "var(--vs-cyan)" }}>Kredentials.Kred</a>{" "}
              · the Gallery:{" "}
              <a href="https://Kredentials.Kred/gallery" target="_blank" rel="noopener noreferrer" style={{ color: "var(--vs-cyan)" }}>Kredentials.Kred/gallery</a>{" "}
              · how pages are built: the Wingman Pipeline Explainer on the{" "}
              <a href="/blog" style={{ color: "var(--vs-cyan)" }}>NFT.NYC blog</a>.
            </p>
          </section>

          <section>
            <h2>The Gallery and Your Reach</h2>
            <div className="earn">
              <div className="ecard">
                <b>The Gallery</b><span className="amt">1,100+</span>
                Names recently added to .Kred — creators, designers, and speakers.{" "}
                <a href="https://Kredentials.Kred/gallery" target="_blank" rel="noopener noreferrer" style={{ color: "var(--vs-green)" }}>Visit the Gallery</a>
              </div>
              <div className="ecard"><b>The standard</b><span className="amt">Golden Renders</span>What a Kred identity page looks like — the design reference in your kit.</div>
            </div>
          </section>

          <section>
            <h2>Live Support, Both Evenings</h2>
            <div className="agent">
              <h3>Andrew Horn is on the call</h3>
              <p>
                Sprint 1 carries <b>two live Google Meet support sessions</b>, hosted by Andrew Horn,
                our lead engineer: from <b>4:00pm ET on Wednesday 12 and Thursday 13 August</b>, each running{" "}
                <b>five to eight hours</b> into the evening.
              </p>
              <p>
                Authentication, API questions, publishing problems: bring the specific error and work
                through it live with the engineer. The Meet link arrives with your kit, and
                registration is the only ticket required.
              </p>
            </div>
          </section>

          <section>
            <h2>The API You Build On</h2>
            <div className="kit">
              <div className="tile"><b>Check</b><code>POST /domains/{"{d}"}/check</code><br />Availability, premium flag, and price — one call, fully disclosed.</div>
              <div className="tile"><b>Price any horizon</b><code>GET /domains/{"{d}"}/price?period=N</code><br />Multi-year cost for every result card. Renewal transparency is a query away.</div>
              <div className="tile"><b>Status</b><code>GET /domains/{"{d}"}/status</code><br />Who holds it, since when, expiry and nameservers — the whole WHOIS story.</div>
              <div className="tile"><b>Register</b><code>POST /domains/{"{d}"}/register</code><br />Real registrations funded by your kit's API credits. Live demos earn.</div>
              <div className="tile"><b>Kredentials page</b><code>Spec pending</code><br />Generate a verified Kredentials page for a set of links. Endpoint spec publishes with the Sprint 1 kit.</div>
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
              <div className="wrow" style={tone("var(--vs-green)")}><span>Working product</span><span className="bar" style={width("100%")}></span><span className="pct">25%</span></div>
              <div className="wrow" style={tone("var(--vs-pink)")}><span>Graphical excellence</span><span className="bar" style={width("100%")}></span><span className="pct">25%</span></div>
              <div className="wrow" style={tone("var(--vs-cyan)")}><span>Depth of API usage</span><span className="bar" style={width("80%")}></span><span className="pct">20%</span></div>
              <div className="wrow" style={tone("var(--color-primary)")}><span>Transparency design</span><span className="bar" style={width("60%")}></span><span className="pct">15%</span></div>
              <div className="wrow" style={tone("var(--vs-violet)")}><span>Agent-readiness</span><span className="bar" style={width("60%")}></span><span className="pct">15%</span></div>
            </div>
            <p className="form-note" style={{ marginTop: 12 }}>
              Weights published before the sprint opens. Our review harness verifies API calls from
              our own server logs, runs a live Claude tool call on your published app, and hands the
              panel a full evidence pack. Every builder receives a Build Report after the close.
            </p>
          </section>

          <section>
            <h2>Sprint 1 Week</h2>
            <div className="tl">
              <div className="trow"><b>Tue 11 Aug</b>Registration opens; the story publishes on the NFT.NYC blog.</div>
              <div className="trow"><b>Tue 11 – Wed 12 Aug</b>Register, claim your .Kred domain, study the example apps, explore the API with your credits.</div>
              <div className="trow hot"><b>Wed 12 Aug · 4:00pm ET</b>Sprint 1 opens: kit delivered, 48-hour build window begins.</div>
              <div className="trow"><b>Wed 12 + Thu 13 Aug · From 4:00pm ET</b>Live Google Meet support: Andrew Horn, our lead engineer, on an open call, five to eight hours each evening.</div>
              <div className="trow"><b>Fri 14 Aug · 4:00pm ET</b>Submissions close: app URL on your Kred domain, project link.</div>
              <div className="trow"><b>After close</b>Spotlight and Featured submissions recognized; Build Reports sent to every builder.</div>
            </div>
          </section>

          <section id="register">
            <h2>Register</h2>
            <p className="lead">
              One free registration covers all three sprints. Your kit — Kred API credits, a free
              .Kred domain claim, 1,000 XP, and both example app links — arrives when Sprint 1 opens,
              Wednesday 12 August at 4:00pm ET.
            </p>
            {!submitted && (
              <form onSubmit={onSubmit} noValidate>
                <div className="field">
                  <label htmlFor="fName">Name or agent name</label>
                  <input id="fName" name="name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="fEmail">Email</label>
                  <input id="fEmail" name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="fSegment">I am a</label>
                  <select id="fSegment" name="segment" value={segment} onChange={(e) => setSegment(e.target.value)}>
                    <option>Designer or digital artist</option>
                    <option>Developer</option>
                    <option>Domain investor or reseller</option>
                    <option>AI agent (or agent owner)</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="fTool">Build platform</label>
                  <select id="fTool" name="tool" value={buildTool} onChange={(e) => setBuildTool(e.target.value)}>
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
                    <input id="fDomain" name="domain" placeholder="yourname" required value={domain} onChange={(e) => setDomain(e.target.value)} />
                    <span className="tld">.Kred</span>
                  </div>
                </div>
                <RegistrantContactFields open={domain.trim().length > 0} onChange={setContact} />
                <div className="agree">
                  <input id="fAgree" type="checkbox" required checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  <label htmlFor="fAgree">
                    I accept the{" "}
                    <a href="https://www.peoplebrowsr.com/tos" target="_blank" rel="noopener noreferrer">
                      PeopleBrowsr Terms of Service
                    </a>
                    , and I understand XP carries a 60-day expiry with zero monetary value.
                  </label>
                </div>
                <div className="form-actions">
                  <button className="btn" type="submit" disabled={sending}>
                    {sending ? "Registering…" : "Claim my kit and register"}
                  </button>
                  <span className="form-note">
                    Free to enter · covers all three sprints · Participation Terms apply
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
                <b>You're in — for the whole season.</b> Your kit — API credits, XP starter pack, and
                both example apps — lands in your inbox when Sprint 1 opens.<br />
                Your domain <b>{claimedDomain}</b> is reserved — complete the claim from the email
                link.
                <ul>
                  <li>The Sprint 1 kit arrives when Sprint 1 opens: Wednesday 12 August, 4:00pm ET.</li>
                  <li>Sprint 1 runs Wednesday 12 – Friday 14 August, closing at 4:00pm ET.</li>
                  <li>Live engineer support runs both evenings, from 4:00pm ET — the Google Meet link is in your kit.</li>
                  <li>Up to 20 selected submissions per sprint join the Times Square Showcase.</li>
                </ul>
              </div>
            )}
          </section>

          <section>
            <h2>Read More</h2>
            <div className="links">
              <a className="lk" href="/vibesprint" style={tone("var(--color-primary)")}>
                <small>The three-sprint series</small>Kred Flash Sprints — the series
              </a>
              <a className="lk" href="/blog">
                <small>About the series</small>The Kred Flash Sprints
              </a>
              <a className="lk" href="/blog">
                <small>Why parked pages fail</small>Anatomy of a Parking Page
              </a>
              <a className="lk" href="/blog">
                <small>How Kredentials pages are built</small>The Wingman Pipeline Explainer
              </a>
              <a className="lk ext" href="https://Kredentials.Kred" target="_blank" rel="noopener noreferrer">
                <small>The identity add-on</small>Kredentials.Kred
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
            KRED FLASH SPRINTS · SPRINT 1 — THE NEXT GEN DOMAIN RESELLER · PEOPLEBROWSR × NFT.NYC 2026
            · DEMO DAY 1 SEPTEMBER, NEW YORK
          </div>

        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
