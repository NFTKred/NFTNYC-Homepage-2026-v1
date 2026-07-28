import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageMeta from "@/components/PageMeta";
import "@/styles/vibesprint.css";

/**
 * Kred Flash Sprints landing page.
 *
 * Source of truth: /Users/cameronbale/claude-workspace/NFT.NYC/Flash Sprint Landing Page v3.html
 * The source's inline styles live in src/styles/vibesprint.css scoped
 * under `.vibesprint`, bound to NFT.NYC design tokens (fonts, colors,
 * borders). The countdown, live counter, and registration form are
 * ported to React state/effects.
 */

/** Target: Friday 7 August 2026, 12:00 ET (16:00 UTC). */
const TARGET_UTC = Date.UTC(2026, 7, 7, 16, 0, 0);

const EVENT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Kred Flash Sprint 1 — The Domain Registrar Reseller",
  description:
    "Build a better domain search experience on the Domains.Kred Registrar API. Five hours, all-Lovable, publish an agent-enabled entry that ChatGPT and Claude can call. Sprint 1 of three, leading to NFT.NYC 2026.",
  startDate: "2026-08-07T12:00:00-04:00",
  endDate: "2026-08-07T17:00:00-04:00",
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
    validFrom: "2026-08-03T08:00:00-04:00",
  },
  inLanguage: "en",
};

function formatCountdown(ms: number): string {
  if (ms <= 0) return "LIVE NOW";
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${d}d ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
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

  // Countdown — updates once per second.
  const [countdown, setCountdown] = useState<string>(() => formatCountdown(TARGET_UTC - Date.now()));
  useEffect(() => {
    const id = window.setInterval(() => {
      setCountdown(formatCountdown(TARGET_UTC - Date.now()));
    }, 1000);
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
  const [domain, setDomain] = useState("");
  const [agree, setAgree] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [claimedDomain, setClaimedDomain] = useState("yourname.Kred");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const d = domain.trim() || "yourname";
    setClaimedDomain(`${d}.Kred`);
    setSubmitted(true);
    // TODO: wire this to a Supabase edge function (see
    // supabase/functions/submit-media-pass, submit-visa-request,
    // submit-volunteer-application for the pattern) so registrations
    // persist. For now we only show the client-side success card.
    // Payload: { name, email, segment, domain: d }.
    void name;
    void email;
    void segment;
    // Scroll the success card into view once React renders it.
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
              <span className="glow">Three Fridays to NFT.NYC</span>
            </h1>
            <p className="sub">
              Three <b>5-hour vibe coding flash sprints</b> - Fridays <b>7, 14, and 21 August</b>,
              12:00-17:00 ET, livestreamed. Build on the Kred domain and agent identity APIs in{" "}
              <b>Lovable</b>, publish with Agent Integrations, and your entry becomes a tool{" "}
              <b>ChatGPT and Claude can call</b>. The season ends on stage at NFT.NYC 2026 in New
              York on 1 September.
            </p>
            <div className="badges">
              <span className="badge tool">All-Lovable · remix our example apps</span>
              <span className="badge api">Every entry becomes an agent tool</span>
              <span className="badge hot">Sprint 1 · Fri 7 Aug · 12:00-17:00 ET</span>
            </div>
            <div className="meters">
              <div className="meter" aria-live="polite">
                <b>{countdown}</b>
                <span>until Sprint 1</span>
              </div>
              <div className="meter reg" aria-live="polite">
                <b>{regCount}</b>
                <span>builders registered</span>
              </div>
            </div>
            <div className="cta-row">
              <a className="btn" href="#register">Register free</a>
              <span className="cta-note">
                Registration includes Kred API credits, a free Kred domain claim, and 1,000 XP.
              </span>
            </div>
          </header>

          <section>
            <h2>Three Sprints, One Season</h2>
            <div className="sprints">
              <div className="sp live" style={{ ["--tone" as string]: "var(--vs-pink)" } as React.CSSProperties}>
                <span className="no">1</span>
                <span className="date">Fri 7 Aug · 12:00-17:00 ET</span>
                <h3>The Domain Registrar Reseller</h3>
                <p>
                  Build a better domain search experience on the Domains.Kred Registrar API - a
                  very visual experience, honest pricing on every card, every result explained.
                </p>
                <span className="chip">Registration open</span>
              </div>
              <div className="sp" style={{ ["--tone" as string]: "var(--vs-cyan)" } as React.CSSProperties}>
                <span className="no">2</span>
                <span className="date">Fri 14 Aug · 12:00-17:00 ET</span>
                <h3>The Agentic Domain Registrar</h3>
                <p>
                  The customer flips to agents: they discover, price, register, and enroll their
                  own .Kred agentic identity - AID, ANS, MCP-I, DNSid - end to end.
                </p>
                <span className="chip">Brief drops Mon 10 Aug</span>
              </div>
              <div className="sp" style={{ ["--tone" as string]: "var(--vs-violet)" } as React.CSSProperties}>
                <span className="no">3</span>
                <span className="date">Fri 21 Aug · 12:00-17:00 ET</span>
                <h3>Agentic Debate on the Matrix</h3>
                <p>
                  Agents with .Kred identities join Matrix.Kred Nodes to discuss, debate, govern,
                  and score - one week before NFT.NYC.
                </p>
                <span className="chip">Brief drops Mon 17 Aug</span>
              </div>
            </div>
            <p className="form-note" style={{ marginTop: 10 }}>
              Every finished entry earns points on the shared Kred Vibe Series season table. The
              season champion presents on the NFT.NYC 2026 stage on 1 September, with a Times
              Square billboard feature.
            </p>
          </section>

          <section>
            <h2>Your App Becomes a ChatGPT and Claude Tool</h2>
            <div className="agent">
              <h3>Publish once. Every assistant can use it</h3>
              <p>
                Lovable's new <b>Agent Integrations</b> turns any published entry into an MCP
                server that ChatGPT, Claude, and any MCP client call directly. Submissions include
                your MCP link, and judging features a <b>live tool call from Claude</b> on every
                shortlisted entry.
              </p>
              <p>
                Each sprint opens with the proof: <b>Claude registering a domain live</b> through
                our own example app - then you remix that app as your starting point.
              </p>
              <p className="mono">Dark patterns die when the customer is an agent.</p>
            </div>
          </section>

          <section>
            <h2>Sprint 1 - The Search Result That Started This</h2>
            <div className="hook">
              <div className="big">$4,288.00</div>
              <p className="claim">"islandbakery.com is available for $4,288.00 for the first year!"</p>
              <p className="truth">
                One registrar's search hero, July 2026. WHOIS shows the domain registered since{" "}
                <b>2001</b> - held by the registrar's own corporate family. Across six major
                registrars, the same one-word search returned six differently merchandised sales
                pages: <b>PROMOTED</b> suggestion cards, teaser prices locked to 3-year terms,
                renewal prices hidden in tooltips. The pattern regulators condemned in Trivago and
                LendEDU, live in domain search today.
              </p>
              <div className="spread" role="img" aria-label="Price spread for the same domain across six registrars">
                <div className="srow"><span className="who">Registrar A</span><span className="bar" style={{ ["--w" as string]: "100%" } as React.CSSProperties}></span><span className="amt">AU$7,255</span></div>
                <div className="srow"><span className="who">Registrar B</span><span className="bar" style={{ ["--w" as string]: "85%" } as React.CSSProperties}></span><span className="amt">A$6,141</span></div>
                <div className="srow"><span className="who">Registrar C</span><span className="bar" style={{ ["--w" as string]: "59%" } as React.CSSProperties}></span><span className="amt">$4,288</span></div>
                <div className="srow"><span className="who">Registrar D</span><span className="bar" style={{ ["--w" as string]: "59%" } as React.CSSProperties}></span><span className="amt">$4,288</span></div>
                <div className="srow"><span className="who">Registrar E</span><span className="bar" style={{ ["--w" as string]: "59%" } as React.CSSProperties}></span><span className="amt">$4,288</span></div>
                <div className="srow good"><span className="who">New reg</span><span className="bar" style={{ ["--w" as string]: "2%" } as React.CSSProperties}></span><span className="amt">~$15</span></div>
              </div>
              <p className="spread-note">
                Same domain, same day, same aftermarket feed - retail markups included. The green
                bar is a standard new registration on an open name. The full story publishes on
                the NFT.NYC blog Monday 3 August.
              </p>
            </div>
          </section>

          <section>
            <h2>Sprint 1 Mission</h2>
            <p className="lead">
              Judged on the eyes first. Domain search should be <b>theatre</b>: every result
              arrives dressed - cover art, story, true price, and proof. Honest data underneath,
              a feast on top. A page of grey rows is an automatic loss.
            </p>
            <div className="kit">
              <div className="tile star">
                <b>A very visual experience</b>
                Results wear imagery, identity, and motion. Availability constellations,
                price-spread charts, renewal-trap warnings - data display that belongs on a
                billboard.
              </div>
              <div className="tile">
                <b>Search that answers</b>
                One query in, honest results out: availability, true first-year price, and
                renewal price on every single card.
              </div>
              <div className="tile">
                <b>Every result explained</b>
                A visible "why this result?" line on every suggestion - your answer to the
                PROMOTED card.
              </div>
              <div className="tile">
                <b>Agent-enabled by default</b>
                Publish publicly, enable Agent Integrations, submit your MCP link. Reference
                model: <code>https://AgenticID.Kred</code>
              </div>
            </div>
          </section>

          <section>
            <h2>Remix Our Example Apps</h2>
            <p className="lead">
              We release two remixable, agent-enabled Lovable apps before the whistle - remix
              either at kickoff and your build starts already talking to the API. Design
              references below ship in your kit today; the live app links land in your kit
              Wednesday 5 August.
            </p>
            <div className="examples">
              <a className="excard" href="DomainsKred%20Catch-All%20Wireframe%20v8b%202026-05-04.html">
                <img
                  src="/vibesprint/Example Visual Search Thumb v1.jpg"
                  alt="DomainsKred visual search wireframe - Cats.Kred hero with browser search bar, cover art, and AI greeter"
                />
                <div className="excap">
                  <b>The Visual Domain Search</b>
                  Type one word and meet the domain already dressed: Cats.Kred wearing its own
                  cover art, origin story, trust score, and a live AI greeter - plus a gallery
                  where every domain idea ships with matching Kredentials imagery.
                  <span className="exlink">Open the design reference →</span>
                </div>
              </a>
              <a className="excard" href="ByronWaller%20Kredentials%20v7%20Golden%20Render%20v1%202026-07-20.html">
                <img
                  src="/vibesprint/Example Kredentials Thumb v1.jpg"
                  alt="Byron Waller Kredentials golden render - verified profile record with fact counts and editorial photography"
                />
                <div className="excap">
                  <b>The Kredentials Maker</b>
                  What a domain becomes after purchase: a verified identity record - 38 verified
                  facts, 21 full-text answers, 21 cited sources - editorial for humans,
                  machine-readable for answer engines. Your search results can preview this
                  future for every name.
                  <span className="exlink">Open the design reference →</span>
                </div>
              </a>
            </div>
          </section>

          <section>
            <h2>The API You Build On</h2>
            <div className="kit">
              <div className="tile"><b>Check</b><code>POST /domains/{"{d}"}/check</code><br />Availability, premium flag, and price - one call, fully disclosed.</div>
              <div className="tile"><b>Price any horizon</b><code>GET /domains/{"{d}"}/price?period=N</code><br />Multi-year cost for every result card. Renewal transparency is a query away.</div>
              <div className="tile"><b>Status</b><code>GET /domains/{"{d}"}/status</code><br />Who holds it, since when, expiry and nameservers - the whole WHOIS story.</div>
              <div className="tile"><b>Register</b><code>POST /domains/{"{d}"}/register</code><br />Real registrations funded by your kit's API credits. Live demos win.</div>
              <div className="tile"><b>Agent identity</b><code>POST /domains/{"{d}"}/agent</code><br />AID, ANS, MCP-I, DNSid - the AgenticID.Kred enrollment stack. Sprint 2's core.</div>
              <div className="tile"><b>Standout extras</b><code>POST /domains/{"{d}"}/token</code><br />Mint a domain token; ENS bridge; DNS zones; SSL.</div>
            </div>
            <p className="form-note" style={{ marginTop: 12 }}>
              Full interactive docs:{" "}
              <a href="https://api.Domains.Kred/docs" style={{ color: "var(--vs-cyan)" }}>api.Domains.Kred/docs</a>{" "}
              · Keys from{" "}
              <a href="https://console.Domains.Kred" style={{ color: "var(--vs-cyan)" }}>console.Domains.Kred</a>
            </p>
          </section>

          <section>
            <h2>How You Win Sprint 1</h2>
            <div className="weights">
              <div className="wrow" style={{ ["--tone" as string]: "var(--vs-green)" } as React.CSSProperties}><span>Working product</span><span className="bar" style={{ ["--w" as string]: "100%" } as React.CSSProperties}></span><span className="pct">25%</span></div>
              <div className="wrow" style={{ ["--tone" as string]: "var(--vs-pink)" } as React.CSSProperties}><span>Graphical excellence</span><span className="bar" style={{ ["--w" as string]: "100%" } as React.CSSProperties}></span><span className="pct">25%</span></div>
              <div className="wrow" style={{ ["--tone" as string]: "var(--vs-cyan)" } as React.CSSProperties}><span>Depth of API usage</span><span className="bar" style={{ ["--w" as string]: "80%" } as React.CSSProperties}></span><span className="pct">20%</span></div>
              <div className="wrow" style={{ ["--tone" as string]: "var(--color-primary)" } as React.CSSProperties}><span>Transparency design</span><span className="bar" style={{ ["--w" as string]: "60%" } as React.CSSProperties}></span><span className="pct">15%</span></div>
              <div className="wrow" style={{ ["--tone" as string]: "var(--vs-violet)" } as React.CSSProperties}><span>Agent-readiness</span><span className="bar" style={{ ["--w" as string]: "60%" } as React.CSSProperties}></span><span className="pct">15%</span></div>
            </div>
            <p className="form-note" style={{ marginTop: 12 }}>
              Agent-readiness is scored by a live Claude tool call on your MCP link. Fair by
              design: our judging harness verifies every entry's API calls from our own server
              logs and hands human judges a full evidence pack. Every entrant receives a
              scorecard Monday - winners and eliminated alike.
            </p>
          </section>

          <section>
            <h2>The Road to Friday</h2>
            <div className="tl">
              <div className="trow"><b>Mon 3 Aug · 08:00 ET</b>The story drops on the NFT.NYC blog; announcement and forum threads follow at 09:00.</div>
              <div className="trow"><b>Mon 3 - Thu 6 Aug</b>Register, claim your Kred domain, study the example apps, explore the API with your credits.</div>
              <div className="trow"><b>Wed 5 Aug</b>Kits complete: both live example apps, the "Connect your Kred app to ChatGPT and Claude" one-pager, Lovable credit codes.</div>
              <div className="trow hot"><b>Fri 7 Aug · 12:00-17:00 ET</b>Sprint 1. Opens with Claude registering a domain live. Five hours, Lovable open to ship.</div>
              <div className="trow"><b>Fri 7 Aug · 17:00 ET</b>Submissions close: app URL on your Kred domain, Lovable project link, MCP link, 60-second demo video, API evidence.</div>
              <div className="trow"><b>Mon 10 Aug</b>Winners, scorecards, season points - and the Sprint 2 brief drops the same morning.</div>
            </div>
          </section>

          <section>
            <h2>Prizes</h2>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr><th>Prize</th><th>What you win</th></tr>
                </thead>
                <tbody>
                  <tr><td>Sprint winner (each sprint)</td><td className="num">$1,000 USD and 10,000 XP</td></tr>
                  <tr><td>2nd place</td><td className="num">5,000 XP</td></tr>
                  <tr><td>3rd place</td><td className="num">2,500 XP</td></tr>
                  <tr><td>Every finished entry</td><td>Season points on the shared Kred Vibe Series table - the season champion takes the NFT.NYC 2026 stage on 1 September and a Times Square billboard feature</td></tr>
                </tbody>
              </table>
            </div>
            <p className="form-note" style={{ marginTop: 10 }}>
              Season points: 1st = 10, 2nd = 5, 3rd = 3, every finished submission = 1. Flash
              points and Vibe Series weekend points accrue on one table.
            </p>
          </section>

          <section id="register">
            <h2>Register</h2>
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
                  <label>Build tool</label>
                  <div className="lovable-lock">
                    <span className="dot"></span>Lovable - every flash entry ships from Lovable
                  </div>
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
                </div>
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
                  <button className="btn" type="submit">Claim my kit and register</button>
                  <span className="form-note">
                    Free to enter. One registration covers all three sprints.
                  </span>
                </div>
              </form>
            )}
            {submitted && (
              <div className="success" id="successCard" role="status">
                <b>You're in - for the whole season.</b> Your API credits and XP starter pack
                will be delivered to your inbox in an onboarding welcome email from{" "}
                team@nft.nyc on Wednesday 5 August.<br />
                We've registered your request for <b>{claimedDomain}</b> - complete the claim
                from the welcome email link.
                <ul>
                  <li>The Sprint 1 brief, the story, and the example apps arrive in your welcome email.</li>
                  <li>Sprint 1: Friday 7 August, 12:00-17:00 ET, livestreamed.</li>
                  <li>Sprints 2 and 3: Fridays 14 and 21 August - briefs drop each Monday.</li>
                </ul>
              </div>
            )}
          </section>

        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
