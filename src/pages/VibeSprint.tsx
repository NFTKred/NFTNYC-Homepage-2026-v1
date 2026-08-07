import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageMeta from "@/components/PageMeta";
import { supabase } from "@/lib/supabase";
import "@/styles/vibesprint.css";

/**
 * Kred Flash Sprints landing page (content v11 — three 48-hour sprints).
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
              One ask: <b>build a next generation Domain Reseller using the features of the Kred TLD</b> —
              the TLD synonymous with identity: human, agentic, and agentic discoverability via
              Kredentials. Three <b>48-hour vibe coding sprints</b> — each opening Wednesday at{" "}
              <b>4:00pm ET</b>, one week apart, starting <b>12 August</b>. Build in{" "}
              <b>Lovable or the platform of your choice</b> — publish a Lovable app with Agent
              Integrations and it works inside <b>ChatGPT and Claude</b>.{" "}
              <b>Up to 20 selected submissions per sprint join the Times Square Showcase</b>, and
              the season ends at Demo Day on the NFT.NYC 2026 stage, 1 September.
            </p>
            <div className="badges">
              <span className="badge tool">Lovable primary · any platform welcome</span>
              <span className="badge api">Lovable apps work inside ChatGPT + Claude</span>
              <span className="badge hot">Registration opens Tue 11 Aug</span>
              <span className="badge hot">Sprint 1 · Wed 12 – Fri 14 Aug · Opens 4:00pm ET</span>
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
                Registration secures your Kred API credits, free domain claim, and 1,000 XP —
                delivered when Sprint 1 opens.
              </span>
            </div>
          </header>

          <section>
            <h2>Three Sprints, One Season</h2>
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
                <span className="chip">Brief publishes Fri 14 Aug</span>
              </div>
              <div className="sp" style={{ ["--tone" as string]: "var(--vs-violet)" } as React.CSSProperties}>
                <span className="no">3</span>
                <span className="date">Wed 26 – Fri 28 Aug · Opens 4:00pm ET</span>
                <h3>Agentic Debate on the Matrix</h3>
                <p>
                  Agents with .Kred identities join Matrix.Kred Nodes to discuss, debate, govern,
                  and score — one week before NFT.NYC.
                </p>
                <span className="chip">Brief publishes Fri 21 Aug</span>
              </div>
            </div>
            <p className="form-note" style={{ marginTop: 10 }}>
              The Season Headliner — one builder, selected by the review panel from the season's
              Spotlight and Featured submissions — presents the marquee demo at Demo Day, NFT.NYC
              2026, 1 September. Every submission appears in the Demo Day reel; up to 20 selected
              submissions per sprint join the Times Square Showcase.
            </p>
          </section>

          <section>
            <h2>Every Submission Earns</h2>
            <p className="lead">
              Progression, never elimination. Submit inside the window with live Kred API calls and
              the full reward set is yours.
            </p>
            <div className="earn">
              <div className="ecard"><b>Finisher XP</b><span className="amt">2,500 XP</span>For every sprint you submit.</div>
              <div className="ecard"><b>Finisher Certificate</b><span className="amt">Minted NFT</span>Your submission's certificate, minted on the platform you built with.</div>
              <div className="ecard"><b>Gallery + recap credit</b><span className="amt">Public card</span>Your submission on this page's gallery and in the recap post.</div>
              <div className="ecard"><b>Build Report</b><span className="amt">Full feedback</span>What passed, what scored what, and what to level up next Sprint.</div>
              <div className="ecard"><b>Times Square Showcase</b><span className="amt">Up to 20 per sprint</span>Up to 20 selected submissions per sprint are featured on the rotating Times Square billboard.</div>
            </div>
            <div className="ach">
              <span className="achip">Agent-Ready<small>Claude uses your published app live · 1,000 XP</small></span>
              <span className="achip">Full Loop<small>Search → register, end to end · 1,000 XP</small></span>
              <span className="achip">Theatre<small>The visual bar, met · 1,000 XP</small></span>
              <span className="achip">100% Clear Card<small>Renewal + "why this result?" everywhere · 1,000 XP</small></span>
            </div>
            <p className="form-note" style={{ marginTop: 12 }}>
              Achievements are objective bars, published before each sprint opens.
            </p>
          </section>

          <section>
            <h2>Spotlights — The Editorial Showcase</h2>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr><th>Selection</th><th>What it carries</th></tr>
                </thead>
                <tbody>
                  <tr><td>Spotlight submission (one per Sprint)</td><td className="num">$1,000 build grant, 10,000 XP, and a deep-dive on the NFT.NYC blog</td></tr>
                  <tr><td>Featured submissions (two per Sprint)</td><td className="num">5,000 XP and recap coverage</td></tr>
                  <tr><td>Season Headliner (selected from the season's Spotlight and Featured submissions)</td><td>The marquee demo at Demo Day, NFT.NYC 2026, 1 September</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>Lovable Apps Work Inside ChatGPT and Claude</h2>
            <div className="agent">
              <h3>Make your app available inside AI tools</h3>
              <p>
                Lovable's <b>Agent Integrations</b> lets any published Lovable app work inside
                ChatGPT and Claude: enable it on your public project and Lovable generates the
                connection for you (OAuth on by default). Build on Lovable and your submission
                carries this from the moment you publish. The <b>Agent-Ready achievement</b> is
                verified by a live Claude tool call on your published app.
              </p>
              <p>
                Every kit arrives with proof up front: a{" "}
                <b>recorded demo of Claude registering a domain live</b> through our own example
                app — remix that app as your starting point.
              </p>
            </div>
          </section>

          <section>
            <h2>Sprint 1 — The Search Result That Started This</h2>
            <div className="hook">
              <div className="big">$4,288.00</div>
              <p className="claim">"islandbakery.com is available for $4,288.00 for the first year!"</p>
              <p className="truth">
                One registrar's search hero, July 2026. WHOIS shows the domain registered since{" "}
                <b>2001</b> — held by the registrar's own corporate family. Across six major
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
                Same domain, same day, same aftermarket feed — retail markups included. The green
                bar is a standard new registration on an open name. The full story publishes on the{" "}
                <a href="/blogs" style={{ color: "var(--vs-cyan)" }}>NFT.NYC blog</a> Tuesday 11 August.
              </p>
            </div>
          </section>

          <section>
            <h2>Sprint 1 Mission — The Five Features of a Next Gen Domain Search App</h2>
            <p className="lead">
              Reviewed on the eyes first. Domain search should be <b>theatre</b>: every result
              arrives dressed — cover art, story, true price, and proof. 100% Clear data
              underneath, a feast on top. These five features define "next generation", and the
              review rewards them.
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
                TLD-sponsored search ladder. True first-year price, renewal price, and a visible
                "why this result?" line on every card.{" "}
                <a href="/blogs" style={{ color: "var(--vs-cyan)" }}>The evidence: our registrar search exposé</a>
              </div>
              <div className="tile">
                <b>3 · Visual AI results</b>
                Produced with an AI assistant — <b>Wingman</b> — and associated with the domain
                string. Results wear imagery, identity, and motion.
              </div>
              <div className="tile">
                <b>4 · A companion Kredentials page</b>
                Offer every domain applicant the optional Kredentials add-on: a page generated
                from their links that makes their name legible to LLMs.
              </div>
              <div className="tile">
                <b>5 · Embedded in frontier models</b>
                Build on Lovable, publish publicly, enable Agent Integrations — your app works
                inside ChatGPT and Claude. Other platforms offer comparable routes.
              </div>
            </div>
          </section>

          <section>
            <h2>Remix Our Example Apps</h2>
            <p className="lead">
              We release two remixable Lovable apps ahead of Sprint 1 — remix either and your
              submission starts already talking to the API. Design references arrive in your kit
              today; the live app links arrive with your kit when Sprint 1 opens, Wednesday 12
              August at 4:00pm ET.
            </p>
            <div className="examples">
              <div className="excard" style={{ background: "var(--color-surface)", border: "1px solid var(--card-border)", borderRadius: 8, overflow: "hidden" }}>
                <img
                  src="/vibesprint/Example Visual Search Thumb v1.jpg"
                  alt="DomainsKred visual search wireframe — Cats.Kred hero with browser search bar, cover art, and AI greeter"
                />
                <div className="excap">
                  <b>The Visual Domain Search</b>
                  Type one word and meet the domain already dressed: Cats.Kred wearing its own
                  cover art, origin story, trust score, and a live AI greeter — plus a gallery
                  where every domain idea arrives with matching Kredentials imagery.
                  <span className="exlink">Design reference arrives with your Sprint 1 kit</span>
                </div>
              </div>
              <div className="excard" style={{ background: "var(--color-surface)", border: "1px solid var(--card-border)", borderRadius: 8, overflow: "hidden" }}>
                <img
                  src="/vibesprint/Example Kredentials Thumb v1.jpg"
                  alt="Byron Waller Kredentials golden render — verified profile record with fact counts and editorial photography"
                />
                <div className="excap">
                  <b>The Domain Search App</b>
                  A clean, working domain search on the Domains.Kred Registrar API: availability,
                  true first-year price, and renewal price on every card. The straightforward
                  starting point — remix it and make it yours.
                  <span className="exlink">Live app link arrives with your Sprint 1 kit</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2>The Kredentials Add-On</h2>
            <p className="lead">
              Every Kred domain can carry a companion <b>Kredentials page</b> — a supplemental
              add-on for anyone who receives a Kred domain, and the identity layer your search app
              can offer with every name it sells.
            </p>
            <div className="kit">
              <div className="tile">
                <b>Built from their links</b>
                A pasted Linktree (which stays live and untouched), a .com website, social
                profiles, press links. Wingman, the agent behind every page, gathers the sources,
                writes the page, verifies every fact, and watches for changes.
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
              Live examples:{" "}
              <a href="https://Kredentials.Kred" target="_blank" rel="noopener noreferrer" style={{ color: "var(--vs-cyan)" }}>
                Kredentials.Kred
              </a>{" "}
              · the Byron Waller Golden Render design reference arrives with your Sprint 1 kit.
            </p>
          </section>

          <section>
            <h2>The Gallery — Over 1,100 Names Recently Added to .Kred</h2>
            <p className="lead">
              Over 1,100 names — creators, designers, and speakers — were recently added to .Kred.
              They set the bar for what a Kred identity looks like. Your distribution comes from
              us: <b>we promote submissions to the NFT.NYC alumni community of over 180,000
              members</b>.
            </p>
            <div className="earn">
              <div className="ecard">
                <b>The Gallery</b><span className="amt">1,100+</span>
                Names recently added to .Kred — creators, designers, and speakers.{" "}
                <a href="https://Kredentials.Kred/gallery" target="_blank" rel="noopener noreferrer" style={{ color: "var(--vs-green)" }}>
                  Visit the Gallery
                </a>
              </div>
              <div className="ecard"><b>Your reach</b><span className="amt">180,000+</span>NFT.NYC alumni community members — where submissions are promoted.</div>
              <div className="ecard"><b>The standard</b><span className="amt">Golden Renders</span>What a Kred identity page looks like — the design reference in your kit.</div>
            </div>
          </section>

          <section>
            <h2>Live Support, Both Evenings</h2>
            <div className="agent">
              <h3>Our lead engineer is on the call</h3>
              <p>
                Every sprint carries <b>two live Google Meet support sessions</b>, hosted by our
                lead engineer: from <b>4:00pm ET on the first two evenings</b> of the build window,
                each running <b>five to eight hours</b> into the evening.
              </p>
              <p>
                Authentication, API questions, publishing problems: bring the specific error and
                work through it live with the engineer. The Meet link arrives with your kit, and
                registration is the only ticket required.
              </p>
              <p className="mono">Sprint 1 sessions: Wed 12 Aug + Thu 13 Aug · from 4:00pm ET</p>
            </div>
          </section>

          <section>
            <h2>The API You Build On</h2>
            <div className="kit">
              <div className="tile"><b>Check</b><code>POST /domains/{"{d}"}/check</code><br />Availability, premium flag, and price — one call, fully disclosed.</div>
              <div className="tile"><b>Price any horizon</b><code>GET /domains/{"{d}"}/price?period=N</code><br />Multi-year cost for every result card. Renewal transparency is a query away.</div>
              <div className="tile"><b>Status</b><code>GET /domains/{"{d}"}/status</code><br />Who holds it, since when, expiry and nameservers — the whole WHOIS story.</div>
              <div className="tile"><b>Register</b><code>POST /domains/{"{d}"}/register</code><br />Real registrations funded by your kit's API credits. Live demos earn.</div>
              <div className="tile"><b>Agent identity</b><code>POST /domains/{"{d}"}/agent</code><br />AID, ANS, MCP-I, DNSid — the AgenticID.Kred enrollment stack. Sprint 2's core.</div>
              <div className="tile"><b>Standout extras</b><code>POST /domains/{"{d}"}/token</code><br />Mint a domain token; ENS bridge; DNS zones; SSL.</div>
              <div className="tile"><b>Kredentials page</b><code>Spec pending</code><br />Generate a verified Kredentials page for a set of links. Endpoint spec publishes with the Sprint 1 kit.</div>
            </div>
            <p className="form-note" style={{ marginTop: 12 }}>
              Full interactive docs:{" "}
              <a href="https://api.Domains.Kred/docs" target="_blank" rel="noopener noreferrer" style={{ color: "var(--vs-cyan)" }}>api.Domains.Kred/docs</a>{" "}
              · Keys from{" "}
              <a href="https://console.Domains.Kred" target="_blank" rel="noopener noreferrer" style={{ color: "var(--vs-cyan)" }}>console.Domains.Kred</a>
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
              Weights published before every Sprint. Our review harness verifies API calls from our
              own server logs, runs a live Claude tool call on your MCP link, and hands the panel a
              full evidence pack. Every builder receives a Build Report after the sprint closes —
              the feedback is the reward, whichever submissions are Spotlighted.
            </p>
          </section>

          <section>
            <h2>The Road to Sprint 1</h2>
            <div className="tl">
              <div className="trow"><b>Tue 11 Aug</b>Sprint 1 announced; the story publishes on the NFT.NYC blog; registration opens.</div>
              <div className="trow"><b>Tue 11 – Wed 12 Aug</b>Register, claim your Kred domain, study the example apps, explore the API with your credits.</div>
              <div className="trow hot"><b>Wed 12 Aug · 4:00pm ET</b>Sprint 1 opens: kit delivered, 48-hour build window begins.</div>
              <div className="trow"><b>Wed 12 + Thu 13 Aug · From 4:00pm ET</b>Live Google Meet support: our lead engineer on an open call, five to eight hours each evening.</div>
              <div className="trow"><b>Fri 14 Aug · 4:00pm ET</b>Submissions close: app URL on your Kred domain, project link, MCP link, API evidence.</div>
              <div className="trow"><b>After close</b>Spotlight and Featured submissions recognized; Build Reports sent to every builder.</div>
            </div>
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
                  <button className="btn" type="submit" disabled={sending}>
                    {sending ? "Registering…" : "Claim my kit and register"}
                  </button>
                  <span className="form-note">
                    Free to enter. One registration covers all three Sprints. Kit issued when
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
                <b>You're in — for the whole season.</b> Your kit — API credits, XP starter pack,
                and the example app — lands in your inbox when Sprint 1 opens.<br />
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

        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
