import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
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
import "@/styles/sprint2.css";

/**
 * Sprint 2 landing page (content draft v8) — "Agents Buying Identity".
 * Shares the .vibesprint stylesheet for the common blocks and adds the
 * Sprint 2-only blocks via sprint2.css. Registration is not open yet, so
 * the "Count me in" CTAs render disabled (no link, no form).
 */

const EVENT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Kred Flash Sprint 2 — Agents Buying Identity",
  description:
    "A 48-hour build sprint: agents that find, price, register, and set up .Kred identities on the Domains.Kred API. Opens Monday 24 August 4:00pm ET, closes Wednesday 26 August 4:00pm ET.",
  startDate: "2026-08-24T16:00:00-04:00",
  endDate: "2026-08-26T16:00:00-04:00",
  eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: { "@type": "VirtualLocation", url: "https://nft.nyc/sprint2" },
  organizer: { "@type": "Organization", name: "NFT.NYC", url: "https://nft.nyc" },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: "https://nft.nyc/sprint2",
  },
  inLanguage: "en",
};

const tone = (v: string) => ({ ["--tone" as string]: v } as CSSProperties);

export default function Sprint2() {
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (document.documentElement.getAttribute("data-theme") as "dark" | "light") || "dark"
  );
  const stage = useMemo(() => Number(localStorage.getItem("nftnyc-stage") ?? 0), []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <div
      data-theme={theme}
      style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)" }}
    >
      <PageMeta page="sprint2" />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(EVENT_JSON_LD)}</script>
      </Helmet>
      <Header theme={theme} onToggleTheme={toggleTheme} stage={stage} />

      <div className="vibesprint sprint2">
        <div className="wrap" style={{ paddingTop: 96 }}>

          <header className="hero">
            <div className="eyebrow">PeopleBrowsr × NFT.NYC 2026 · Kred Flash Sprints</div>
            <div className="sprintmark">
              <span className="num">Sprint 2</span>
              <span className="rnd">Round 1</span>
              <span className="of">where the buyer becomes an agent</span>
            </div>
            <h1>
              Agents Buying <span className="glow">Identity</span>
            </h1>
            <p className="sub">
              In Sprint 1, people buy names. In Sprint 2, agents do. An agent finds a name, checks
              the price, registers it, and sets up its own <b>.Kred</b> identity from start to
              finish. <b>Four possible design approaches</b> sit below. Pick one.
            </p>
            <div className="badges">
              <span className="badge hot">Brief publishes Thu 20 Aug</span>
              <span className="badge hot">Opens Mon 24 Aug · 4:00pm ET</span>
              <span className="badge">Closes Wed 26 Aug · 4:00pm ET</span>
              <span className="badge tool">Lovable primary · any platform welcome</span>
            </div>
            <div className="cta-row">
              <button type="button" className="btn" disabled aria-disabled="true">
                Count me in for Sprint 2
              </button>
              <span className="cta-soon">Registration opens shortly</span>
              <span className="cta-note">
                One click if you built in Sprint 1, we know you already. New here? The same button
                registers you free, and covers all three sprints.
              </span>
            </div>
          </header>

          <section>
            <h2>The Ask</h2>
            <p className="lead">
              Kred is requesting our digital creators design{" "}
              <b>the next generation of identity on the Kred TLD</b>.<br />
              Sprint 1 covers the domain search people buy from.<br />
              Sprint 2 covers the registrar agents buy from, together with everything a person needs
              in order to trust an agent with money.<br />
              Every result an agent weighs, every registration it completes, and every identity it
              sets up runs on the Domains.Kred API your kit already funds. Design sense counts for
              more than syntax here, the same as it does in Sprint 1.
            </p>
          </section>

          <section>
            <h2>Four Possible Design Approaches</h2>
            <div className="tracks4">
              <a className="tk" href="#trust" style={tone("var(--s2-pink)")}>
                <div className="who">Design</div>
                <h3>The Trust Surface</h3>
                <p>Somebody has to design the moment a machine spends your money.</p>
              </a>
              <a className="tk" href="#portfolio" style={tone("var(--s2-amber)")}>
                <div className="who">Commerce</div>
                <h3>The Portfolio Agent</h3>
                <p>An agent that watches, prices, and buys inside a ceiling you set.</p>
              </a>
              <a className="tk" href="#registrar" style={tone("var(--s2-cyan)")}>
                <div className="who">Agents</div>
                <h3>The Registrar Agent</h3>
                <p>Give your agent an address that people and other agents can find.</p>
              </a>
              <a className="tk" href="#bridge" style={tone("var(--s2-violet)")}>
                <div className="who">Standards</div>
                <h3>The Identity Bridge</h3>
                <p>Public standards give an agent a record. Joining that record to a name is open ground.</p>
              </a>
            </div>
          </section>

          <section id="trust">
            <div className="track" style={tone("var(--s2-pink)")}>
              <span className="tag">Approach 1 · Design</span>
              <h3>The Trust Surface</h3>
              <p>
                Somebody has to design the moment a machine spends your money.{" "}
                <b>The build is four screens.</b>
              </p>
              <ul className="blist">
                <li><b>The delegation screen</b>, where a person hands an agent a budget, a scope, and a stop condition.</li>
                <li><b>The shortlist</b>, where the agent reports what it found and why, in a form you can approve in seconds.</li>
                <li><b>The receipt</b>, showing what it bought and what it cost.</li>
                <li>
                  <b>The Governance Card</b>, showing what a <code>.Kred</code> name looks like when
                  its owner is software, reading live status from the public endpoint every time the
                  page loads.
                </li>
              </ul>
              <p>All four are open ground.</p>
              <p>
                <b>Worth knowing.</b> This is a design build. The APIs already work. What remains is
                everything a person sees, and graphical excellence carries 25% of the review, the
                same weight it carries in every sprint.
              </p>
              <div className="ideas">
                <div className="lbl">Ideas for the build</div>
                <div className="waysin">
                  <div className="wi"><div className="t">The Budget Dial</div><div className="d">One screen where an owner sets the ceiling, the scope, and the stop condition, in plain controls anyone can read.</div></div>
                  <div className="wi"><div className="t">The Quick Approve</div><div className="d">Domain candidates as a card stack, so one glance and one tap clears the shortlist.</div></div>
                  <div className="wi"><div className="t">The Governance Card</div><div className="d">Live status and history, read fresh from the public endpoint every time the page loads.</div></div>
                </div>
              </div>
            </div>
          </section>

          <section id="portfolio">
            <div className="track" style={tone("var(--s2-amber)")}>
              <span className="tag">Approach 2 · Commerce</span>
              <h3>The Portfolio Agent</h3>
              <p>
                An agent that runs a name portfolio while its owner sleeps. It watches a want list,
                checks candidates, prices them across several years, flags renewals, and buys inside
                a budget ceiling. Every one of those is a call the registrar API already supports.
                Create a registrant contact once with <code>POST /contacts</code> and the agent
                reuses it for every purchase after.
              </p>
              <p>
                <b>Keep your judgment yours.</b> Put your scoring in a rule set the app reads while
                it runs, and ship a sample rule set for the review. The review scores whether the
                agent follows a rule set correctly, and leaves the quality of your own weights alone.
              </p>
              <p>
                <b>Worth knowing.</b> Every .Kred domain name can have a matching a Kred Domain
                Token: an ERC-721 minted on Base for speed and cost, with the name's identity record
                anchored to Ethereum through ENS, so one name resolves across DNS, ENS, and the
                ERC-8004 agent registry. Ownership reads the way this community expects, and it
                transfers with zero registrar transfer window.
              </p>
              <div className="ideas">
                <div className="lbl">Ideas for the build</div>
                <div className="waysin">
                  <div className="wi"><div className="t">The Levers Console</div><div className="d">Your buying rules as levers on one console. Slide name length, keyword class, price ceiling, and hold period, and watch the shortlist rebuild live underneath.</div></div>
                  <div className="wi"><div className="t">Drop Watcher</div><div className="d">Feed it a want list. It checks candidates on a schedule and pings the moment one frees up.</div></div>
                  <div className="wi"><div className="t">Night Buyer</div><div className="d">Buys inside the ceiling its owner set, with the receipt waiting in the morning.</div></div>
                  <div className="wi"><div className="t">Renewal Guard</div><div className="d">Every name you hold, sorted by what it costs to keep and how long you have left.</div></div>
                </div>
              </div>
            </div>
          </section>

          <section id="registrar">
            <div className="track" style={tone("var(--s2-cyan)")}>
              <span className="tag">Approach 3 · Agents</span>
              <h3>The Registrar Agent</h3>
              <p>
                An AI agent already ships with a short file describing what it is and what it can do.
                Give it an address to go with that description. <b>The build:</b> an agent that
                searches for a name, creates a registrant contact, previews the cost, registers the
                name, and sets up its own agent identity, all through the MCP server and all with
                zero people in the loop. It is the shortest path from having an agent to having an
                agent that completed a real purchase. Publish it with Agent Integrations and it works
                inside ChatGPT and Claude.
              </p>
              <p>
                <b>Worth knowing.</b> An address on its own is hard to remember and hard to quote.
                Discovery, delegation, and reputation all work better from a name.
              </p>
              <div className="ideas">
                <div className="lbl">Ideas for the build</div>
                <div className="waysin">
                  <div className="wi"><div className="t">Name My Agent</div><div className="d">Takes a theme in plain words and returns a name it already registered and set up.</div></div>
                  <div className="wi"><div className="t">Bulk Scout</div><div className="d">Search, price, and rank many candidates in one pass, then preview the cost before spending.</div></div>
                  <div className="wi"><div className="t">MCP Drop-in</div><div className="d">The registrar as a tool inside any MCP client, including a public governance check.</div></div>
                </div>
              </div>
            </div>
          </section>

          <section id="bridge">
            <div className="track" style={tone("var(--s2-violet)")}>
              <span className="tag">Approach 4 · Standards</span>
              <h3>The Identity Bridge</h3>
              <p>
                Public agent identity standards answer who an agent is. How you reach it, quote it,
                and decide whether to let it spend is open ground.{" "}
                <b>The build is two registrations, stitched together.</b>
              </p>
              <ul className="blist">
                <li><b>An agent identity</b> in a public registry such as ERC-8004.</li>
                <li><b>A <code>.Kred</code> name</b> carrying a DNSid governance record.</li>
              </ul>
              <p>
                Join them by naming the domain in the agent's registration file and proving control
                the way the standard already expects.
              </p>
              <p>
                <b>Worth knowing.</b> A registered name can have a matching Kred Domain Token the
                holder keeps, and governance standing is a public record anyone can query without a
                key. Both are claims a counterparty can check for themselves.
              </p>
              <div className="ideas">
                <div className="lbl">Ideas for the build</div>
                <div className="waysin">
                  <div className="wi"><div className="t">The Bridge Itself</div><div className="d">Register through Kred and through a public identity registry as two calls, then be first to join them.</div></div>
                  <div className="wi"><div className="t">Governance Validator</div><div className="d">Build the piece that is open ground: a validator that reads governance status and posts a signal anyone can check.</div></div>
                  <div className="wi"><div className="t">Agent Passport</div><div className="d">A portable identity file other agents read before they trade with yours.</div></div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="stack">
              <h3>The Agentic ID Stack</h3>
              <p>
                Every approach touches the same identity layer underneath:{" "}
                <b>AID, ANS, MCP-I, and DNSid</b>, the AgenticID.Kred enrollment stack, and the core
                of this sprint. Enrollment starts from a domain you have already registered.
              </p>
              <div className="idgrid">
                <div className="idc"><div className="n">AID</div><p>Agent Identity and Discovery. A keypair and an agent card published in DNS, carrying the name, the endpoint, and what the agent can do.</p></div>
                <div className="idc"><div className="n">ANS</div><p>Agent Name Service. A verified name certificate and a trust badge.</p></div>
                <div className="idc"><div className="n">MCP-I</div><p>A DID document, scoped to exactly what the agent may do.</p></div>
                <div className="idc"><div className="n">DNSid</div><p>Governance. Active, revoked, or retired, with an ordered audit log of every operation.</p></div>
              </div>
              <p style={{ marginTop: 16 }}>
                <b>Why DNSid is worth your attention.</b> The other three set an agent up. DNSid
                answers whether that authority still holds right now, and its status endpoint is
                public with zero key required, so any counterparty can check an agent before trading
                with it. The audit log sits behind your API key. Reading real status into whatever
                you build scores well, and enrollment on its own scores less.
              </p>
            </div>
          </section>

          <section>
            <h2>What Every Submission Earns</h2>
            <p className="lead">
              Progression, every time. Submit inside the window with live Kred API calls and the full
              reward set is yours.
            </p>
            <div className="kit">
              <div className="tile"><b>Finisher XP</b>2,500 XP for every sprint you submit.</div>
              <div className="tile"><b>Finisher Certificate</b>Minted NFT, on the platform you built with.</div>
              <div className="tile"><b>Build Report</b>Full feedback: what passed, what scored what, and what to level up next sprint.</div>
              <div className="tile"><b>Times Square Showcase</b>Up to 3 selected submissions per sprint on the rotating billboard.</div>
              <div className="tile"><b>Spotlight and Featured</b>One Spotlight per sprint earns a $1,000 build grant and an NFT.NYC blog deep dive. Two Featured submissions earn recap coverage.</div>
            </div>

            <h2 style={{ marginTop: 34 }}>The Top Three Designs</h2>
            <p className="lead">Above every submission's reward set sits one more, carried from Sprint 1.</p>
            <div className="top3">
              <div className="t3"><b>You named live</b><p>The designer named live on Kred's domain surfaces, linked to their .Kred page.</p></div>
              <div className="t3"><b>Your design deployed</b><p>The three winning designs run as official Kred experiences.</p></div>
              <div className="t3"><b>Your name cited</b><p>Across the .Kred gallery, the sprint kits, and Kred marketing for two full years.</p></div>
            </div>
            <p className="lead" style={{ marginTop: 14 }}>
              September 2 · Live presentations on the main stage at NFT.NYC 2026, The Edison, Times
              Square.
            </p>
          </section>

          <section>
            <h2>The API You Build On</h2>
            <p className="lead">
              The real Domains.Kred endpoints, funded by the API credits in your kit. One signup
              covers it.
            </p>
            <div className="kit">
              <div className="tile"><b>Create contact</b><code>POST /contacts</code><br />Required once, before any registration.</div>
              <div className="tile"><b>Check</b><code>POST /domains/&#123;d&#125;/check</code><br />Availability, premium flag, and price, fully disclosed.</div>
              <div className="tile"><b>Price any horizon</b><code>GET /domains/&#123;d&#125;/price</code><br />Multi-year cost on every quote.</div>
              <div className="tile"><b>Preview a registration</b><code>POST /domains/&#123;d&#125;/register/preview</code><br />Validate cost and eligibility, spend nothing.</div>
              <div className="tile"><b>Register</b><code>POST /domains/&#123;d&#125;/register</code><br />Real registrations, funded by your kit credits.</div>
              <div className="tile"><b>Tokenize</b><code>POST /domains/&#123;d&#125;/token</code><br />Mint the Kred Domain Token for a registered name, with the ENS bridge.</div>
              <div className="tile"><b>Enroll agent identity</b><code>POST /domains/&#123;d&#125;/agent</code><br />AID, ANS, MCP-I, DNSid. The core of this sprint.</div>
              <div className="tile"><b>Governance status</b><code>GET /domains/&#123;d&#125;/agent/dnsid/status</code><br />Active, revoked, or retired.<span className="pub">Public · no key</span></div>
              <div className="tile"><b>Governance log</b><code>GET /domains/&#123;d&#125;/agent/dnsid/log</code><br />The ordered audit trail of every operation.<span className="key">Your API key</span></div>
            </div>
            <p className="lead" style={{ marginTop: 12 }}>
              Full interactive docs:{" "}
              <a href="https://api.Domains.Kred/docs" style={{ color: "var(--s2-cyan)" }}>api.Domains.Kred/docs</a>{" "}
              · keys from{" "}
              <a href="https://console.Domains.Kred" style={{ color: "var(--s2-cyan)" }}>console.Domains.Kred</a>{" "}
              · the MCP server ships with your kit.
            </p>
          </section>

          <section>
            <h2>How Submissions Are Reviewed</h2>
            <p className="lead">Weights publish before every sprint. These are Sprint 2's.</p>
            <div className="weights">
              <div className="wrow"><b>Working product</b><span className="pct">25%</span><span className="bar"><i style={{ width: "100%" }} /></span></div>
              <div className="wrow"><b>Graphical excellence</b><span className="pct">25%</span><span className="bar"><i style={{ width: "100%" }} /></span></div>
              <div className="wrow"><b>Depth of API usage</b><span className="pct">20%</span><span className="bar"><i style={{ width: "80%" }} /></span></div>
              <div className="wrow"><b>Transparency design</b><span className="pct">15%</span><span className="bar"><i style={{ width: "60%" }} /></span></div>
              <div className="wrow"><b>Agent-readiness</b><span className="pct">15%</span><span className="bar"><i style={{ width: "60%" }} /></span></div>
            </div>
            <div className="jrow"><b>Verified automatically</b><span>The review harness verifies API calls from our own server logs, runs a live Claude tool call on your published app, and hands the panel a full evidence pack.</span></div>
            <div className="jrow"><b>A completed registration</b><span>The verifiable transaction event. A real name registered through the API during the window.</span></div>
            <div className="jrow"><b>A valid agent card served</b><span>AID published and resolving.</span></div>
            <div className="jrow"><b>DNSid put to work</b><span>A status check, a log read, or a revoke and retire flow surfaced somewhere real, over and above enrollment.</span></div>
            <div className="jrow"><b>Rule sets judged as mechanism</b><span>Where a build reads a rule set, the review scores whether it follows one correctly, and leaves the quality of your own weights alone.</span></div>
            <div className="jrow"><b>Every builder</b><span>Receives a Build Report after the close. The Sprint 1 promise, held.</span></div>
          </section>

          <section>
            <div className="support">
              <h3>Live Engineer Support Both Evenings</h3>
              <p>
                Two live Google Meet sessions hosted by our lead engineer, from 4:00pm ET on the
                first two evenings of the build window, each running five to eight hours.
                Authentication, API questions, publishing problems: bring the specific error and work
                through it live.
              </p>
              <p>The Meet link arrives with your Sprint 2 kit. Registration is the only ticket required.</p>
              <div className="sessions">
                <div className="sess"><b>Session 1</b>Mon 24 Aug · from 4:00pm ET</div>
                <div className="sess"><b>Session 2</b>Tue 25 Aug · from 4:00pm ET</div>
              </div>
            </div>
          </section>

          <section>
            <h2>The Road to Sprint 2 Round 1</h2>
            <div className="tl">
              <div className="trow"><b>Thu 20 Aug</b>The Sprint 2 brief publishes.</div>
              <div className="trow"><b>Mon 24 Aug · 4:00pm ET</b>Round 1 opens. Your kit publishes: API credits, Lovable credits in our sponsored Vibe Sprint Workspace, the MCP server, the reference builds, and the Meet link.</div>
              <div className="trow"><b>Mon 24 and Tue 25 Aug · from 4:00pm ET</b>Live engineer support, five to eight hours each evening.</div>
              <div className="trow"><b>Wed 26 Aug · 4:00pm ET</b>Submissions close. App URL on your .Kred domain, project link, MCP link, API evidence.</div>
              <div className="trow"><b>After close</b>Spotlight and Featured submissions recognized. Build Reports to every builder.</div>
              <div className="trow"><b>September 2</b>Live presentations on the main stage at NFT.NYC 2026, The Edison, Times Square.</div>
            </div>
          </section>

          <section id="register">
            <h2>Count Me In</h2>
            <div className="regbox">
              <p>
                <b>Tell us you are building in Sprint 2.</b> One click puts you on the list, and it
                means your kit, your Meet link, and your engineer support are ready and waiting when
                Round 1 opens on Monday 24 August at 4:00pm ET.
              </p>
              <p><b>Built in Sprint 1?</b> We know you already. One click is all it takes, with nothing to fill in.</p>
              <p><b>Joining fresh?</b> The same button registers you free, and one registration covers all three sprints.</p>
              <div className="cta-row">
                <button type="button" className="btn" disabled aria-disabled="true">
                  Count me in for Sprint 2
                </button>
                <span className="cta-soon">Registration opens shortly</span>
              </div>
              <p style={{ margin: "16px 0 0", fontSize: 13 }}>
                Places are uncapped. Knowing the numbers in advance lets us size the support sessions
                and have every kit issued before the window opens.
              </p>
              <div className="licence">
                <b>Your work stays yours.</b> You keep full ownership and copyright of everything you
                build. Every submission publishes under an open licence, Creative Commons Attribution
                4.0, so anyone may use and adapt it while naming you as the designer every time.
                Acknowledgement always. It is the one term that asks something of you, so it sits
                here beside the rewards rather than inside the terms. Full detail in the{" "}
                <a
                  href="https://f005.backblazeb2.com/file/PB-HubSpot/Kred_Flash_Sprints_Participation_Terms_v1.pdf"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "var(--s2-cyan)" }}
                >
                  Kred Flash Sprint ToS
                </a>
                .
              </div>
            </div>
          </section>

        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
