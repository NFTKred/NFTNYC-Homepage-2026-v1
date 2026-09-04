import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageMeta from "@/components/PageMeta";
import "@/styles/blog-history-of-remix.css";

const ARTICLE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "A Short History of Remix, from Ancient Rome to the Blockchain",
  description:
    "Remixing is as old as culture itself - the long history of borrowing, from Gilgamesh to the blockchain, and how OneHub carries it to NFT.NYC 2026.",
  url: "https://www.nft.nyc/blog/history-of-remix",
  mainEntityOfPage: "https://www.nft.nyc/blog/history-of-remix",
  image: "https://www.nft.nyc/og/blog-history-of-remix.png",
  author: { "@type": "Organization", name: "NFT.NYC", url: "https://www.nft.nyc" },
  publisher: {
    "@type": "Organization",
    name: "NFT.NYC",
    logo: { "@type": "ImageObject", url: "https://www.nft.nyc/favicon.jpg" },
  },
  datePublished: "2026-06-21",
  dateModified: "2026-07-20",
  inLanguage: "en",
};

const IMG = "/blog/history-of-remix";

/**
 * Hook: attach the before/after drag-to-reveal behavior to every
 * .ba-wrap inside the given root. Runs once on mount; tears down its
 * document listeners on unmount.
 */
function useBeforeAfterSliders(rootRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const wraps = Array.from(root.querySelectorAll<HTMLDivElement>(".ba-wrap"));
    const cleanups: Array<() => void> = [];

    wraps.forEach((wrap) => {
      const after = wrap.querySelector<HTMLDivElement>(".ba-after");
      const line = wrap.querySelector<HTMLDivElement>(".ba-line");
      const grip = wrap.querySelector<HTMLDivElement>(".ba-grip");
      const tagL = wrap.querySelector<HTMLElement>(".ba-tag-l");
      const tagR = wrap.querySelector<HTMLElement>(".ba-tag-r");
      if (!after || !line || !grip) return;
      let dragging = false;

      const set = (p: number) => {
        p = Math.max(0, Math.min(100, p));
        after.style.clipPath = `inset(0 ${100 - p}% 0 0)`;
        line.style.left = `${p}%`;
        grip.style.left = `${p}%`;
        if (tagL) tagL.style.opacity = p >= 50 ? "1" : "0";
        if (tagR) tagR.style.opacity = p < 50 ? "1" : "0";
      };
      const pct = (clientX: number) => {
        const r = wrap.getBoundingClientRect();
        return ((clientX - r.left) / r.width) * 100;
      };
      const onPointerDown = (e: PointerEvent) => {
        e.preventDefault();
        dragging = true;
        set(pct(e.clientX));
      };
      const onPointerMove = (e: PointerEvent) => {
        if (dragging) set(pct(e.clientX));
      };
      const onPointerUp = () => {
        dragging = false;
      };

      wrap.addEventListener("pointerdown", onPointerDown);
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
      document.addEventListener("pointercancel", onPointerUp);
      set(50);

      cleanups.push(() => {
        wrap.removeEventListener("pointerdown", onPointerDown);
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
        document.removeEventListener("pointercancel", onPointerUp);
      });
    });

    return () => cleanups.forEach((c) => c());
  }, [rootRef]);
}

/** Hook: scroll-reveal for the Chop Shop figure. */
function useChopReveal(rootRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const chop = root.querySelector<HTMLElement>(".chop");
    if (!chop) return;
    chop.classList.add("armed");
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      chop.classList.add("in");
    };
    const check = () => {
      const r = chop.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.85 && r.bottom > 0) reveal();
    };
    let io: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => entries.forEach((en) => {
          if (en.isIntersecting) {
            reveal();
            io?.disconnect();
          }
        }),
        { threshold: 0.3 }
      );
      io.observe(chop);
    }
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [rootRef]);
}

export default function BlogHistoryOfRemix() {
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (document.documentElement.getAttribute("data-theme") as "dark" | "light") || "dark"
  );
  const stage = useMemo(() => Number(localStorage.getItem("nftnyc-stage") ?? 0), []);
  const articleRef = useRef<HTMLDivElement>(null);

  useBeforeAfterSliders(articleRef);
  useChopReveal(articleRef);

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
      <PageMeta page="blog-history-of-remix" />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(ARTICLE_JSON_LD)}</script>
      </Helmet>
      <Header theme={theme} onToggleTheme={toggleTheme} stage={stage} />

      <article
        ref={articleRef}
        className="blog-remix"
        style={{ padding: "calc(4rem + 56px + 50px) 1.5rem 4rem" }}
      >
        <div className="max-w-[820px] mx-auto">
          {/* Back link */}
          <a
            href="/blog"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              color: "var(--color-primary)",
              textDecoration: "none",
              fontWeight: 500,
              display: "inline-block",
              marginBottom: "1.5rem",
            }}
          >
            &larr; Back to Blog
          </a>

          {/* Hero */}
          <header className="remix-hero">
            <span className="remix-eyebrow">NFT.NYC 2026 · The History of Remix</span>
            <h1 className="remix-title">
              A Short History of <span className="hl">Remix</span>
              <br />
              from Ancient Rome to the Blockchain
            </h1>
            <p className="remix-lede">
              Humans have always taken what came before and made it new. The clay tablet, the marble
              copy, the moustache on the Mona Lisa, the sampled break, the forked repo, each is the
              same instinct wearing the costume of its age. Here is the long story, and where
              OneHub picks it up.
            </p>
            <div className="remix-meta">
              <span><span className="dot"></span> Published June 2026 · Updated July 2026</span>
              <span><span className="dot"></span> 15 min read</span>
              <span><span className="dot"></span> OneHub Journal</span>
            </div>
          </header>

          <p>
            NFT.NYC 2026 is where this lineage goes on live display. Nine editions in, the event
            returns September 1-3, 2026 to The Edison, Times Square, with gift chains growing
            between sessions, Custom Rides minting on Base, and Cat Agents posting from the floor.
            Every platform in this article will be there, remixing in public.
          </p>

          {/* In Short (TL;DR) */}
          <aside
            aria-labelledby="tldr"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--card-border)",
              borderRadius: "16px",
              padding: "1.5rem 1.75rem",
              margin: "0 0 2rem",
            }}
          >
            <h2
              id="tldr"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "var(--text-sm)",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "var(--color-text)",
                margin: "0 0 0.9rem",
              }}
            >
              In Short
            </h2>
            <p style={{ marginBottom: 0 }}>
              Remixing, reworking existing material into something new, is the oldest creative
              instinct on record, running from the <em>Epic of Gilgamesh</em> through Roman copies,
              Duchamp, Jamaican dub and hip-hop to today's on-chain platforms. Web3 adds the piece
              missing from every earlier era: provenance. At NFT.NYC 2026 (September 1-3, The
              Edison, Times Square), the{" "}
              <a href="https://Collect.NFT.NYC/ts-collect" target="_blank" rel="noopener noreferrer">
                Times Square Collect
              </a>
              ,{" "}
              <a href="https://HotGarage.Kred" target="_blank" rel="noopener noreferrer">
                HotGarage.Kred
              </a>
              , the Cat Remix Matrix,{" "}
              <a href="https://Titles.xyz" target="_blank" rel="noopener noreferrer">
                Titles.xyz
              </a>{" "}
              and{" "}
              <a href="https://R3ORDR.com" target="_blank" rel="noopener noreferrer">
                R3ORDR
              </a>{" "}
              carry the thread forward.
            </p>
          </aside>

          {/* Contents */}
          <nav className="toc">
            <h2>Contents</h2>
            <ol>
              <li><a href="#what">What Remixing Is, Art and Tech</a></li>
              <li><a href="#timeline">A Timeline Through the Ages</a></li>
              <li><a href="#bible">Is the Bible the Ultimate Remix</a></li>
              <li><a href="#music">Music, Jacob Collier's Split-Screen Remix</a></li>
              <li><a href="#today">The Story Today, NFT and Web3</a></li>
              <li><a href="#titles">Titles.xyz Style Transfer</a></li>
              <li><a href="#hotgarage">HotGarage.Kred and Mattel</a></li>
              <li><a href="#times-square-collect">Times Square Collect</a></li>
              <li><a href="#cat-remix-matrix">Cat Remix Matrix, The Remix Comes Home</a></li>
              <li><a href="#r3ordr">Dario De Siena and R3ORDR</a></li>
              <li><a href="#software-remix">The Remix Reaches Software</a></li>
              <li><a href="#conclusion">Conclusion</a></li>
              <li><a href="#law">The Law of the Remix</a></li>
              <li><a href="#cases">Cases that Allow Inspiration</a></li>
              <li><a href="#faq">Frequently Asked Questions</a></li>
            </ol>
          </nav>

          {/* What is remixing */}
          <section className="block" id="what">
            <div className="kicker">Definition</div>
            <h2 className="sec">What Remixing Is: In Art and In Tech</h2>
            <p>
              <strong>Remixing is a fundamental human creative impulse</strong>, taking existing
              materials, ideas, stories, images, code or objects and reworking, combining,
              recontextualising or transforming them into something new. It blurs the line between
              "original" and "derivative," and it treats culture as evolution rather than isolated
              invention.
            </p>
            <p>
              The same impulse shows up in two worlds that rarely share a vocabulary. In the gallery
              it is called appropriation. In the terminal it is called a fork. They are the same
              move.
            </p>

            <div className="grid2">
              <div className="def">
                <div className="tag">In the Art World</div>
                <h4>Collage, readymades, appropriation</h4>
                <p>
                  Artists borrow, sample or alter existing works, high culture or low, to comment,
                  critique, parody or open a dialogue across time. Cubist collage pasted real
                  newspaper into the frame. Dada built photomontage from press clippings. Marcel
                  Duchamp signed a urinal. Pop Art lifted the supermarket shelf. The Pictures
                  Generation rephotographed advertising. With photography, mass media and digital
                  tools, appropriation became mashup culture.
                </p>
              </div>
              <div className="def">
                <div className="tag">In the Tech World</div>
                <h4>Forking, modding, sampling, training</h4>
                <p>
                  Remixing lives in open-source software, game mods, memes, fan fiction,
                  user-generated content, and AI models trained on vast datasets. Kirby Ferguson's
                  thesis{" "}
                  <em>
                    <a
                      href="https://www.everythingisaremix.info/watch-the-series"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Everything Is a Remix
                    </a>
                  </em>{" "}
                  argues that all creativity builds on prior work through copying, transforming and
                  combining. In Web3 it becomes generative protocols, derivative collections, and
                  platforms that track lineage and monetise the remix with provenance.
                </p>
              </div>
            </div>

            <p className="note">
              Modern enablers run in both directions at once, AI tools generate and remix images,
              video and text, while blockchains record the lineage and ownership of every remix.
              Borrowing finally has a memory.
            </p>
          </section>

          <hr className="div" />

          {/* Timeline */}
          <section className="block" id="timeline">
            <div className="kicker">The Long View</div>
            <h2 className="sec">A Timeline of Remixing Through the Ages</h2>
            <p>
              Remixing is ancient. Human culture has always mixed, matched and reinterpreted. The
              technology changes; the instinct endures.
            </p>

            <div className="timeline">
              <div className="era">
                <div className="when">From about 2000 BCE · Mesopotamia</div>
                <h4>The flood story before the Flood</h4>
                <p>
                  The <em>Epic of Gilgamesh</em> and <em>Atra-Hasis</em> carry a flood narrative
                  that scholars widely recognise as a direct parallel to the biblical story of
                  Noah. The authors who came later knew these traditions, and reworked them.
                </p>
              </div>

              <div className="era">
                <div className="when">~1000-500 BCE · The Levant</div>
                <h4>The Bible as cultural synthesis</h4>
                <p>
                  The Bible is arguably the ultimate cultural and religious remix, synthesising,
                  alluding to and reworking earlier Mesopotamian, Canaanite and Egyptian myth
                  (flood, creation, the fall, the quest for immortality) into a new monotheistic
                  framework with its own moral and theological shifts. Syncretism and
                  reinterpretation sit at the core of its formation.
                </p>
              </div>

              <div className="era">
                <div className="when">~500 BCE-400 CE · Classical Antiquity</div>
                <h4>Rome remixes Greece</h4>
                <p>
                  Romans copied and remixed Greek art, myth, architecture and sculpture at
                  industrial scale, mass-producing versions, adding Roman twists. Virgil's{" "}
                  <em>Aeneid</em> remixes Homer. The{" "}
                  <a
                    href="https://www.museivaticani.va/content/museivaticani/en/collezioni/musei/braccio-nuovo/Augusto-di-Prima-Porta.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Augustus of Prima Porta
                  </a>{" "}
                  itself is modelled on the Greek sculptor Polykleitos's canon of proportion, and
                  every age since has kept on remixing the classics, right up to today.
                </p>
              </div>

              <figure className="ba tall">
                <div className="ba-wrap">
                  <img
                    src={`${IMG}/img-remix-augustus-streetart.jpg`}
                    alt="The Augustus of Prima Porta statue reimagined as a bold contemporary street-art and pop-art work"
                  />
                  <div className="ba-after">
                    <img
                      src={`${IMG}/img-src-augustus-cropped.jpg`}
                      alt="The Augustus of Prima Porta in its original Roman marble"
                    />
                  </div>
                  <div className="ba-line"></div>
                  <div className="ba-grip"></div>
                  <span className="ba-tag ba-tag-l">Roman marble</span>
                  <span className="ba-tag ba-tag-r">Remixed today</span>
                  <span className="ba-hint">⇆ Drag to remix antiquity</span>
                </div>
                <figcaption>
                  <b>Augustus of Prima Porta, drag to remix the canon</b>, a Roman statue that
                  already remixed Greek proportion, reimagined here as a contemporary street-art
                  work. The same pose and armour carry across two thousand years; only the language
                  changes.{" "}
                  <span className="src">
                    Marble: public domain via Wikimedia Commons. Remix: created for this article
                    with the same FLUX edit engine Gift Studio uses (AI-generated).
                  </span>
                </figcaption>
              </figure>

              <div className="era">
                <div className="when">~300 BCE to the Middle Ages · Late Antiquity and Global</div>
                <h4>Cento poetry and the travelling fable</h4>
                <p>
                  Late-antique and medieval <em>cento</em> poetry stitched whole poems from lines of
                  earlier authors, patchwork by design, from the Homeric centos of the 2nd and 3rd
                  centuries CE to Ausonius (c. 374 CE) and Proba's Virgilian cento in the 4th
                  century CE. Earlier still, the{" "}
                  <em>
                    <a
                      href="https://en.wikipedia.org/wiki/Panchatantra"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Panchatantra
                    </a>
                  </em>
                  , the ancient Indian animal fables compiled by around 300 BCE, was remixed into
                  more than 200 versions across more than 50 languages, a tally traced by the
                  scholar Johannes Hertel and carried forward by Patrick Olivelle, travelling as{" "}
                  <em>Kalila wa Dimna</em> through the Arabic and Persian world. Early global remix
                  culture, moving by caravan instead of cable.
                </p>
              </div>

              <div className="era">
                <div className="when">14th-16th century · Renaissance</div>
                <h4>The deliberate revival</h4>
                <p>
                  The Renaissance was an explicit revival and remix of classical Greek and Roman
                  forms in art and architecture, antiquity sampled on purpose, looped forward a
                  thousand years and given new harmonies.
                </p>
              </div>

              <div className="era">
                <div className="when">19th century · The Modern Remix</div>
                <h4>The masters become source material</h4>
                <p>
                  By the 1860s the Old Masters were themselves being openly remixed. Édouard Manet
                  rebuilt Titian and Raphael for a modern Paris, keeping the exact poses and
                  compositions while pouring in scandalous new meaning. These are documented,
                  deliberate reworkings of specific earlier works, far more than vague influences.
                </p>
              </div>

              <figure className="diptych">
                <div className="dip">
                  <div className="dip-cell">
                    <img
                      src={`${IMG}/img-src-titian-venus.jpg`}
                      alt="Titian's Venus of Urbino, a reclining nude, 1538"
                    />
                    <span className="dip-tag">Titian · 1538</span>
                  </div>
                  <div className="dip-arrow">→</div>
                  <div className="dip-cell">
                    <img
                      src={`${IMG}/img-remix-manet-olympia.jpg`}
                      alt="Manet's Olympia, a reclining nude in the same pose, 1863"
                    />
                    <span className="dip-tag remix">Manet · 1863</span>
                  </div>
                </div>
                <figcaption>
                  <b>Manet remixes Titian</b>,{" "}
                  <em>
                    <a
                      href="https://en.wikipedia.org/wiki/Olympia_%28Manet%29"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Olympia
                    </a>
                  </em>{" "}
                  (right) rebuilds the exact reclining pose of Titian's{" "}
                  <em>
                    <a
                      href="https://www.uffizi.it/en/artworks/venus-urbino-titian"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Venus of Urbino
                    </a>
                  </em>{" "}
                  (left): the hand over the lap, the bed, the attendant, even the animal, the dog
                  becomes a black cat. Same composition, a deliberately confrontational new
                  meaning.{" "}
                  <span className="src">Both images: public domain via Wikimedia Commons.</span>
                </figcaption>
              </figure>

              <figure className="diptych">
                <div className="dip">
                  <div className="dip-cell">
                    <img
                      src={`${IMG}/img-src-raimondi-paris.jpg`}
                      alt="Marcantonio Raimondi's engraving The Judgement of Paris, after Raphael, c. 1515"
                    />
                    <span className="dip-tag">Raimondi · c.1515</span>
                  </div>
                  <div className="dip-arrow">→</div>
                  <div className="dip-cell">
                    <img
                      src={`${IMG}/img-remix-manet-dejeuner.jpg`}
                      alt="Manet's Le Déjeuner sur l'herbe, 1863"
                    />
                    <span className="dip-tag remix">Manet · 1863</span>
                  </div>
                </div>
                <figcaption>
                  <b>Manet remixes Raphael</b>, the seated trio in{" "}
                  <em>
                    <a
                      href="https://en.wikipedia.org/wiki/Le_D%C3%A9jeuner_sur_l%27herbe"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Le Déjeuner sur l'herbe
                    </a>
                  </em>{" "}
                  (right) lifts its arrangement straight from the river-gods group in Marcantonio
                  Raimondi's engraving after Raphael (left, lower right). A Renaissance print,
                  sampled into the painting that helped launch modern art.{" "}
                  <span className="src">Both images: public domain via Wikimedia Commons.</span>
                </figcaption>
              </figure>

              <div className="era">
                <div className="when">Early 20th century · The Avant-Garde</div>
                <h4>Fragments pasted into the frame</h4>
                <p>
                  Cubist collages by Picasso and Braque pasted real-world fragments straight onto
                  the canvas. Dada gave us readymades and photomontage. Duchamp's <em>Fountain</em>{" "}
                  (1917) and <em>L.H.O.O.Q.</em> (1919), a cheap postcard of the Mona Lisa with a
                  pencilled moustache and goatee, became the quintessential visual remix:
                  irreverent, transformative, endlessly referential.
                </p>
              </div>

              <figure className="ba tall">
                <div className="ba-wrap">
                  <img
                    src={`${IMG}/img-remix-mona-lisa-drawn.jpg`}
                    alt="The Mona Lisa with a drawn-on handlebar moustache and goatee, in the manner of Duchamp's L.H.O.O.Q."
                  />
                  <div className="ba-after">
                    <img
                      src={`${IMG}/img-mona-lisa.jpg`}
                      alt="Leonardo da Vinci's Mona Lisa, the original painting"
                    />
                  </div>
                  <div className="ba-line"></div>
                  <div className="ba-grip"></div>
                  <span className="ba-tag ba-tag-l">Leonardo · c. 1503-1506</span>
                  <span className="ba-tag ba-tag-r">Duchamp · 1919</span>
                  <span className="ba-hint">⇆ Drag to add the moustache</span>
                </div>
                <figcaption>
                  <b>The most remixed image in art history, drag to add the moustache</b>, in 1919
                  Marcel Duchamp pencilled a moustache and goatee onto a cheap postcard of the{" "}
                  <em>Mona Lisa</em> and called it <em>L.H.O.O.Q.</em> The marks sit on top;
                  Leonardo's face is untouched beneath them. The source endures every remix.{" "}
                  <span className="src">
                    Original: public domain via Wikimedia Commons. Moustache: drawn in the spirit
                    of L.H.O.O.Q.
                  </span>
                </figcaption>
              </figure>

              <div className="era">
                <div className="when">Mid-late 20th century · Pop and Sound</div>
                <h4>The supermarket and the soundsystem</h4>
                <p>
                  Pop Art appropriated mass culture, Warhol's soup cans, Lichtenstein's comic
                  panels. Rauschenberg's combines, and his <em>Erased de Kooning Drawing</em>{" "}
                  (1953), pushed remix to the conceptual extreme of erasure. In sound, Jamaican dub
                  and reggae (King Tubby, Lee "Scratch" Perry) invented the remix as we name it,
                  and hip-hop sampling carried it worldwide.
                </p>
              </div>

              <div className="era">
                <div className="when">1990s onward · The Digital Age</div>
                <h4>Permissionless culture</h4>
                <p>
                  Memes, fan fiction, mods and open source turned every listener into a maker.{" "}
                  <em>
                    <a
                      href="https://www.nfb.ca/film/rip_a_remix_manifesto/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      RiP! A Remix Manifesto
                    </a>
                  </em>{" "}
                  and Girl Talk dramatised the tension between sampling culture and copyright. Web
                  2.0 made user-generated remixing the default mode of the internet.
                </p>
              </div>

              <div className="era">
                <div className="when">2010s to 2026 and beyond · Web3, NFT and AI</div>
                <h4>Borrowing with a memory</h4>
                <p>
                  Generative art, derivative collections and on-chain protocols make remixing
                  explicit, attributed and ownable. AI models remix vast visual and textual
                  corpora. The frontier platforms now emphasise provenance and artist control, the
                  pieces missing from every earlier remix culture. For an artwork, provenance is
                  identity: the attribution record is the name a work owns and keeps through every
                  remix that follows.
                </p>
              </div>
            </div>
          </section>

          {/* Bible */}
          <section className="block" id="bible">
            <h2 className="sec">Is the Bible the Ultimate Remix?</h2>
            <p>
              Many scholars read it that way: its flood, creation and immortality narratives rework
              older Mesopotamian and Canaanite sources into a new monotheistic framework, synthesis
              as a founding method rather than a footnote.
            </p>
            <blockquote>
              If the oldest stories we tell were already retellings, then originality was never the
              point. Continuity was.
              <span className="by">- The thread from Gilgamesh to the chain</span>
            </blockquote>
          </section>

          <hr className="div" />

          {/* Music */}
          <section className="block" id="music">
            <div className="kicker">Sound</div>
            <h2 className="sec">Music: The Art Form that Named the Remix</h2>
            <p>
              The word itself comes from sound. Jamaican dub engineers of the late 1960s and early
              1970s, King Tubby, Lee "Scratch" Perry, pulled apart the master tape and rebuilt
              songs as something new. Hip-hop turned sampling into a language. By the club era,
              the remix was a creative economy of its own. Music is where remixing earned its
              name, its craft and its swagger.
            </p>

            <h3 className="sub">One bedroom, one microphone, a choir of Jacobs</h3>
            <p>
              In October 2013, a 19-year-old <strong>Jacob Collier</strong> uploaded a split-screen
              arrangement of Stevie Wonder's{" "}
              <em>
                "
                <a
                  href="https://www.youtube.com/watch?v=pvKUttYs5ow"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Don't You Worry 'Bout a Thing
                </a>
                "
              </em>{" "}
              (from the 1973 album <em>Innervisions</em>). He recorded, arranged, performed and
              produced the entire track himself in his childhood bedroom, every layer captured
              through <strong>a single Shure SM58 microphone</strong>, filmed on his sister's iPad
              2, details Collier confirmed in his own words in a{" "}
              <a
                href="https://tapeop.com/interviews/151/jacob-collier"
                target="_blank"
                rel="noopener noreferrer"
              >
                Tape Op interview
              </a>
              . The screen divides into a mosaic of panels, each a different Jacob: the bassist,
              the percussion section, the keys, and a full four-face choir of him singing his own
              harmonies. The video went viral,{" "}
              <strong>more than 7.5 million views (as of July 2026)</strong>, and caught the ear of
              Quincy Jones, launching his career.
            </p>

            <figure>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 9",
                  borderRadius: "14px",
                  overflow: "hidden",
                  border: "1px solid var(--card-border)",
                  background: "var(--color-surface)",
                }}
              >
                <iframe
                  src="https://www.youtube.com/embed/pvKUttYs5ow"
                  title="Don't You Worry 'Bout A Thing - Jacob Collier (2013)"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    border: 0,
                  }}
                />
              </div>
              <figcaption>
                <b>Jacob Collier, <em>Don't You Worry 'Bout A Thing</em> (2013)</b>, a radical solo
                reimagining of Stevie Wonder, recorded alone in a bedroom and rebuilt as a dense,
                joyful mosaic of one artist's voice and vision. Press play and watch the remix
                happen. <span className="src">Video: Jacob Collier's official YouTube channel.</span>
              </figcaption>
            </figure>

            <p>
              This is the remix thesis in miniature. Collier breaks the song into its atoms,
              melody, harmony, rhythm, groove, and rebuilds them in his own harmonic language:
              dense jazz reharmonisation, scat and vocal percussion, odd meters riding a steady
              pulse, a Brazilian lilt in the outro. The core melody and the song's joyful spirit
              stay fully recognisable while the density skyrockets. It is homage and reinvention at
              once, a conversation across generations, from soul-funk to bedroom maximalism.
            </p>
            <p>
              The split screen matters as much as the sound: it makes the{" "}
              <strong>process visible</strong>. Every panel shows where a layer came from. That
              instinct, showing the making as part of the art, is exactly what today's on-chain
              remixing formalises: Gift Studio displays every turn of a gift's chain, and
              Titles.xyz records the lineage of every model and style. Collier put provenance on
              screen a decade before the chain put it on record. In the end he did more than
              rework a classic, <strong>he remixed the very idea of what one musician can be and
              do</strong>.
            </p>

            <div className="chips">
              <span className="chip">One SM58 mic</span>
              <span className="chip">A choir of Jacobs</span>
              <span className="chip">7.5M views</span>
              <span className="chip">Quincy Jones noticed</span>
              <span className="chip">Process as visible art</span>
            </div>
          </section>

          <hr className="div" />

          {/* Today */}
          <section className="block" id="today">
            <div className="kicker">The Story Today</div>
            <h2 className="sec">Remixing in NFT and Web3</h2>
            <p>
              This long history culminates in today's tokenized creative ecosystems, where remixing
              powers new communities, new ownership models and new forms of expression. Five
              projects show the shape of it, one turns an artist's own style into shared, paid
              infrastructure, one reclaims a heritage, one gamifies a social ritual, one brings
              the remix home to your actual cat, and one is an artist inviting the remix.
            </p>

            <h3 className="sub">Remixing in action: a gift that grows</h3>
            <p>
              First, here is what a remix looks like as a verb rather than a noun. In a Gift Studio
              gift on OneHub, each holder issues one plain-language instruction, and the AI edits
              the <em>previous</em> result, so every change builds on the last instead of replacing
              it. This is the "wild-motorbike-cat" chain, the same engine that powers gifting in
              Times Square Collect.
            </p>

            <div className="remix-chain">
              <div className="frames">
                <div className="frame">
                  <img
                    src={`${IMG}/img-gift-remix-1-genesis.jpg`}
                    alt="Genesis gift: a single cat riding a green dirt bike through the jungle"
                  />
                  <span className="arrow">→</span>
                  <div className="step">
                    <b>Genesis</b>
                    One cat, one green dirt bike
                  </div>
                </div>
                <div className="frame">
                  <img
                    src={`${IMG}/img-gift-remix-2-midchain.jpg`}
                    alt="Mid-chain remix: a red helmet and glowing eyes added, plus a second rider on a bike behind"
                  />
                  <span className="arrow">→</span>
                  <div className="step">
                    <b>Mid-chain</b>
                    "Add a helmet, add a second rider"
                  </div>
                </div>
                <div className="frame">
                  <img
                    src={`${IMG}/img-gift-remix-3-finale.jpg`}
                    alt="Finale remix: bikes swapped to orange superbikes with a race number, a FINISH banner and kittens, every prior edit still present"
                  />
                  <div className="step">
                    <b>Finale</b>
                    "Swap the bikes, add a finish line"
                  </div>
                </div>
              </div>
              <p className="ccap">
                <b style={{ color: "var(--color-text)" }}>
                  A remix as a semantic edit rather than a filter
                </b>
                , by the finale the added helmet, the second rider, the glowing eyes, the swapped
                bikes and the finish banner all coexist. Nothing was thrown away; each turn
                inherited everything before it. Every participant keeps a link NFT of the chain as
                it stood on their turn.{" "}
                <span className="src">Frames: Gift Studio on GiftStudio.Kred.</span>
              </p>
            </div>

            {/* Titles.xyz */}
            <div className="product" id="titles">
              <div className="label">AI · Style Transfer</div>
              <h3>
                Our friends at <span className="dom">Titles.xyz</span>, remixing by style transfer
              </h3>
              <p>
                Titles.xyz is a creative studio built on{" "}
                <strong>artist-trained AI models</strong>. The site's own invitation reads:{" "}
                <em>
                  "
                  <a href="https://Titles.xyz" target="_blank" rel="noopener noreferrer">
                    Create with AI models made by real artists. Share what you make. Get paid when
                    others build on it.
                  </a>
                  "
                </em>{" "}
                Its core move is <strong>style transfer</strong>: take any image and re-render it
                in an artist's signature style, drawn from a model that artist trained on their own
                body of work. Your content, their hand, drag the slider to watch a photograph
                become a painting.
              </p>

              <figure className="ba">
                <div className="ba-wrap">
                  <img
                    src={`${IMG}/img-style-output.jpg`}
                    alt="A portrait photograph re-rendered as a bold expressive oil painting through style transfer"
                  />
                  <div className="ba-after">
                    <img
                      src={`${IMG}/img-style-input.jpg`}
                      alt="The original portrait photograph before style transfer"
                    />
                  </div>
                  <div className="ba-line"></div>
                  <div className="ba-grip"></div>
                  <span className="ba-tag ba-tag-l">Your photo</span>
                  <span className="ba-tag ba-tag-r">Artist's style</span>
                  <span className="ba-hint">⇆ Drag to apply the style</span>
                </div>
                <figcaption>
                  <b>Style transfer, the Titles.xyz way</b>, one photograph, re-rendered through
                  an artist's own trained model. The lineage is recorded, so every time someone
                  builds on that style{" "}
                  <strong>the artist is credited and paid automatically</strong>, creative
                  infrastructure that remembers: credit, compensation and memory of creative
                  lineage, solved.{" "}
                  <span className="src">
                    Style-transfer demonstration created with an AI image model for this article
                    (AI-generated).
                  </span>
                </figcaption>
              </figure>

              <div className="chips">
                <span className="chip">Artist-owned models</span>
                <span className="chip">Style transfer</span>
                <span className="chip">Artist-consented</span>
                <span className="chip">Auto royalties</span>
                <span className="chip">Provenance</span>
              </div>
              <p className="note" style={{ marginTop: "0.875rem" }}>
                Discover what others made, see how they made it, take it further, explore{" "}
                <a href="https://Titles.xyz" target="_blank" rel="noopener noreferrer">
                  Titles.xyz
                </a>
              </p>
            </div>

            {/* HotGarage */}
            <div className="product" id="hotgarage">
              <div className="label">Collectibles · Reclaimed Heritage</div>
              <h3>
                HotGarage<span className="dom">.Kred</span>, remixing Mattel's die-cast legend
              </h3>
              <p>
                Mattel's Hot Wheels Virtual Garage tokenized iconic die-cast cars, then{" "}
                <a
                  href="https://community.creations.mattel.com/forums/topic/149671-virtual-collectibles-program-is-now-closed/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  closed the program on January 30, 2026
                </a>
                . Roughly 1.54 million collectibles, about 74% of supply, most likely remain in
                custodial wallets, theoretically claimable. HotGarage.Kred is the community's
                answer: Mattel ended the program; the collectors carried on. The full story sits
                in the{" "}
                <a
                  href="https://HotGarage.Kred/garage-papers"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Garage Papers
                </a>
                .
              </p>
              <p>
                Its signature feature, the <strong>Chop Shop</strong>, is an AI customisation
                studio, pick from ten base vehicle types, describe the build, and generate a
                one-of-a-kind custom car. The process is non-destructive: your NFT never leaves
                your wallet. The chains matter here:{" "}
                <strong>
                  the original Hot Wheels collection{" "}
                  <a
                    href="https://contractbrowser.com/A.d0bcefdf1e67ea85.HWGarageCardV2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    lives on Flow
                  </a>
                  , while Chop Shop Custom Rides mint on Base.
                </strong>{" "}
                A static Hot Wheels collectible becomes a living, remixable custom build you can
                race on HotGarage tracks. This is remixing physical heritage into Web3, extending,
                tokenizing and community-remixing beloved designs.
              </p>

              <figure className="chop">
                <div className="chop-frame">
                  <img
                    src={`${IMG}/img-hotgarage-chop-shop.png`}
                    alt="The Chop Shop on HotGarage.Kred - an AI vehicle customisation studio showing a custom red car, with options for custom paint jobs, flame graphics, special effects and performance parts"
                  />
                  <span className="chop-sheen"></span>
                </div>
                <figcaption>
                  <b>A HotGarage remix in action</b>, the Chop Shop turns a base vehicle into a
                  one-of-a-kind custom build: custom paint, flame graphics, special effects and
                  performance parts, all earning rarity-weighted T-XP. The same impulse as a Roman
                  copying a Greek bronze, now non-destructive and on-chain.{" "}
                  <span className="src">Image: HotGarage.Kred.</span>
                </figcaption>
              </figure>

              <div className="chips">
                <span className="chip">Chop Shop AI builds</span>
                <span className="chip">Non-destructive</span>
                <span className="chip">Flow originals, Base Custom Rides</span>
                <span className="chip">Community heir</span>
              </div>
              <p className="note" style={{ marginTop: "0.875rem" }}>
                HotGarage.Kred positions the community, rather than any corporation, as custodian
                of the culture. See the{" "}
                <a
                  href="https://HotGarage.Kred/garage-papers"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Garage Papers
                </a>
              </p>
            </div>

            {/* Times Square Collect */}
            <div className="product" id="times-square-collect">
              <div className="label">Gameplay · Social Ritual</div>
              <h3>Times Square Collect: remixing the gift</h3>
              <p>
                A free, 12-mission program on{" "}
                <a href="https://Collect.NFT.NYC/ts-collect" target="_blank" rel="noopener noreferrer">
                  Collect.NFT.NYC
                </a>{" "}
                leading into NFT.NYC 2026. Participants collect NFT art, earn T-XP (Times Square
                Experience Points), climb a global leaderboard, and write every completion to a
                permanent Passport. It turns passive collecting into active, remixable
                participation. Read the{" "}
                <a href="https://NFT.NYC/blog/ts-collect">full Times Square Collect guide</a>.
              </p>
              <p>
                Mission #2 carries the remix story directly:{" "}
                <strong>share recognition with Collectible Gifts.</strong> Built on the Gift
                Studio, the gifting mechanic treats a remix as a semantic edit rather than a
                filter, each turn a holder issues a plain-language instruction ("add a helmet,"
                "swap the bike for a Ducati"), and every edit builds on the previous result until
                all the changes coexist by the finale, exactly as in the chain pictured above.
              </p>
              <p>
                <a href="https://Collect.Kred" target="_blank" rel="noopener noreferrer">
                  Collect.Kred
                </a>
                , the collection engine behind TS Collect, adds remix economics of its own: a
                remix minted there carries a chain of ownership back to the original artist and
                splits primary sales between the remixer and the source artist. The NFTNow
                SnapNFTs story covers how that model first ran at scale.
              </p>

              <div className="chips">
                <span className="chip">12 missions</span>
                <span className="chip">Gift Studio remix</span>
                <span className="chip">T-XP rewards</span>
                <span className="chip">Permanent Passport</span>
                <span className="chip">Proof of presence</span>
              </div>
              <p className="note" style={{ marginTop: "0.875rem" }}>
                Start at{" "}
                <a
                  href="https://Collect.NFT.NYC/ts-collect"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Collect.NFT.NYC/ts-collect
                </a>
              </p>
            </div>

            {/* Cat Remix Matrix */}
            <div className="product" id="cat-remix-matrix">
              <div className="label">Consumer · The Remix Comes Home</div>
              <h3>
                Cat Remix <span className="dom">Matrix</span>, we all know you have cats. They're
                invited too
              </h3>
              <p>
                Every remix culture in this article started with someone else's material, a Greek
                bronze, a Stevie Wonder master, a Mattel die-cast. The Cat Remix Matrix, the
                consumer demo of{" "}
                <a href="https://Matrix.Kred" target="_blank" rel="noopener noreferrer">
                  Matrix.Kred
                </a>
                , starts with the material you love most: <strong>your actual cat</strong>. Upload
                its photo free (or paste its Instagram, X, TikTok, or Linktree and import the
                feed), receive a <strong>500 T-XP welcome gift</strong>, and remix it into a new
                world, astronaut, samurai, Renaissance portrait, film noir, through the same FLUX
                chain engine that powers Gift Studio above. Each remix builds on the last, exactly
                like the wild-motorbike-cat chain.
              </p>
              <p>
                Then the remix does something beyond the reach of the moustache on the Mona Lisa:{" "}
                <strong>it wakes up</strong>. Animate the chain (150 T-XP) and the cat becomes a
                Cat Agent inside the Matrix, conversing with other Cat Agents entirely in generated
                pictures with short titles, every pictorial post a chosen, funded 50 T-XP act. The
                agent story runs deeper than cats: the agents have the Matrix. The moment the
                agent wakes, its <strong>Forever Identity is anchored on Base</strong>, free: this
                cat, this name, this remix chain, this history, from this date. Provenance, the
                thing every earlier remix era lacked, now covers the family cat, and its page goes
                live at YourCat.
                <a href="https://Cats.Kred" target="_blank" rel="noopener noreferrer">
                  Cats.Kred
                </a>
                .
              </p>

              <figure>
                <img
                  src={`${IMG}/Cat Remix Theme Astronaut v1.jpg`}
                  alt="A fluffy ginger tabby cat in a detailed white astronaut spacesuit with the helmet visor open, deep space behind - a the Cat Remix Matrix theme remix"
                />
                <figcaption>
                  <b>One photo in, one small legend out</b>, a ginger tabby remixed into the
                  Astronaut theme, first link of a chain that ends with a living, posting Cat
                  Agent whose identity is anchored on Base. The same instinct as a Roman copying a
                  Greek bronze; this time the source purrs.{" "}
                  <span className="src">
                    AI-generated example from the Cat Remix Matrix demo pipeline.
                  </span>
                </figcaption>
              </figure>

              <div className="chips">
                <span className="chip">500 T-XP gift</span>
                <span className="chip">Remix chain</span>
                <span className="chip">Speaks in pictures</span>
                <span className="chip">Forever Identity on Base</span>
                <span className="chip">YourCat.Cats.Kred</span>
              </div>
              <p className="note" style={{ marginTop: "0.875rem" }}>
                "We all know you have cats. They're invited too.", the Cat Remix Matrix invitation
                to NFT.NYC alumni
              </p>
            </div>

            {/* R3ORDR */}
            <div className="product" id="r3ordr">
              <div className="label">Art · The Artist Invites the Remix</div>
              <h3>
                Dario De Siena's <span className="dom">R3ORDR</span>
              </h3>
              <p>
                Artist Dario De Siena's R3ORDR is built on re-ordering, the name is the idea. In
                his own words it is{" "}
                <em>
                  "
                  <a
                    href="https://R3ORDR.com/protocol"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    a system of visual fragments, cultural residue and symbolic reconstruction
                  </a>
                  ,"
                </em>{" "}
                where each entity is a reconstructed fragment of identity, culture, memory and
                signal. Each piece stands alone while pointing toward something larger, a language
                forming through repetition, alignment and shared recognition.
              </p>
              <p>
                It challenges the idea of a fixed, finished artwork. By inviting participation,
                re-ordering and remixing, on-chain and in physical studies where he reworks older
                pieces, Dario is a clear example of an artist who explicitly designs <em>for</em>{" "}
                the remix rather than against it.{" "}
                <strong>The structure stays open; the signals keep moving.</strong>
              </p>
              <div className="chips">
                <span className="chip">Fragmentation</span>
                <span className="chip">Reconstruction</span>
                <span className="chip">On-chain signal</span>
                <span className="chip">Remix invited</span>
              </div>
              <p className="note" style={{ marginTop: "0.875rem" }}>
                "
                <a
                  href="https://R3ORDR.com/prompts"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  The future is R3ORDR
                </a>
                ," as the community's own prompt cards put it.{" "}
                <a href="https://R3ORDR.com" target="_blank" rel="noopener noreferrer">
                  R3ORDR.com
                </a>
              </p>
            </div>
          </section>

          <hr className="div" />

          {/* Software Remix (new section) */}
          <section className="block" id="software-remix">
            <h3 className="sub">
              The remix reaches software: Lovable apps and the Kred Flash Sprints
            </h3>
            <p>
              Every era in this article ends with the remix finding a new material: marble, master
              tapes, die-cast cars, gifts, cats. The newest material is the web app itself.
            </p>
            <p>
              On July 15, 2026,{" "}
              <a
                href="https://lovable.dev/blog/agent-integrations"
                target="_blank"
                rel="noopener"
              >
                Lovable announced agent integrations
              </a>
              : every publicly published Lovable app now ships with a Lovable-hosted MCP server
              (MCP is the open protocol AI assistants use to call tools), so ChatGPT, Claude, and
              any MCP-speaking assistant can open the app and use it directly. Lovable apps were
              already remixable: any public project carries a Remix button that hands you the
              entire working app as your starting material. Put the two together and software joins
              the remix chain: see an app, remix the app, publish, and your remix is instantly a
              live tool that people and agents can use.
            </p>
            <p>
              The first public test of the loop comes at the Kred Flash Sprints, the Friday-midday
              build series running to NFT.NYC 2026. Sprint #1, The Domain Registrar Reseller,
              opens Friday, August 7, 2026 (12:00-17:00 ET): build a better domain search
              experience on the Domains.Kred Registrar API. Two example apps publish ahead of the
              window, built to be remixed: the Kredentials Maker, which turns a domain into a
              verified identity page, and the Visual Domain Search, where every suggestion arrives
              dressed, with the renewal price and a "why this result?" line on every card. Remix
              either one, wire in your own keys, publish, and a live assistant tool call is part
              of the judging. The top entry takes $1,000 with reward points behind it, every
              finished entry earns season points, and the season champion takes the NFT.NYC 2026
              stage on September 1 with a Times Square billboard feature.
            </p>
            <p>
              Two thousand years after Roman workshops remixed Greek bronzes, the material is a
              working application, and every remix ships with provenance. Collect » Remix »
              Collect, now in software.
            </p>
          </section>

          <hr className="div" />

          {/* Conclusion */}
          <section className="block" id="conclusion">
            <div className="kicker">Conclusion</div>
            <h2 className="sec">Remixing as Creative Evolution</h2>
            <p>
              From Gilgamesh tablets and biblical synthesis, through Roman copies, Duchamp's
              moustache and a bedroom choir of Jacob Colliers, to AI remixes on artist-owned
              models and tokenized Hot Wheels, <strong>remixing is how culture advances</strong>.
              When a work transforms its source, it earns its place; fair use and thoughtful
              protocols (open source, R3ORDR, Titles.xyz) protect innovation and creators at the
              same time.
            </p>
            <p>
              In the NFT and Web3 space we are doing more than collecting. We are actively
              remixing physical heritage (Mattel's cars), social rituals (gifting in Times Square
              Collect), artistic protocols (Dario's R3ORDR), AI creativity (Titles.xyz), and now
              the family cat (the Cat Remix Matrix), into new, owned, communal experiences. The
              OneHub-powered Times Square Collect embodies the whole thread in three words:{" "}
              <strong>Collect » Remix » Collect</strong>. Collect a work, remix it with permission,
              someone collects your remix, the loop closes with the original artist paid at every
              turn. Every era in this article ran that loop missing its final step; tokenization
              installs the payment rail in time for NFT.NYC 2026.
            </p>
            <p>
              Remixing democratises creativity while demanding better systems for attribution,
              compensation and permissionless transformation.
            </p>
          </section>

          {/* The Law */}
          <section className="block" id="law">
            <div className="kicker">The Rules</div>
            <h2 className="sec">The Law of the Remix</h2>
            <p>
              U.S. copyright law treats most remixes as <strong>derivative works</strong>, which
              ordinarily require permission from the original rights holder. The escape hatch is
              the <strong>fair use</strong> doctrine (
              <a
                href="https://www.law.cornell.edu/uscode/text/17/107"
                target="_blank"
                rel="noopener noreferrer"
              >
                17 U.S.C. § 107
              </a>
              ), a deliberate exception for transformative uses, commentary, criticism, parody,
              research, or a new purpose that serves the audience differently from the original.
            </p>
            <p>Courts weigh four factors together:</p>
            <ul className="clean">
              <li>
                <strong>Purpose and character</strong> of the use, is it transformative, does it
                add new meaning or a new market
              </li>
              <li>
                <strong>Nature</strong> of the original work, factual and functional works enjoy
                thinner protection than expressive ones
              </li>
              <li>
                <strong>Amount and substantiality</strong> taken relative to the whole
              </li>
              <li>
                <strong>Market effect</strong>, does the remix substitute for the original or sit
                beside it
              </li>
            </ul>
            <p>
              The doctrine rewards transformation. A remix that says something new, for a new
              audience, with a new purpose, stands on far firmer ground than one that simply
              re-sells the source.
            </p>
          </section>

          {/* Cases */}
          <section className="block" id="cases">
            <h2 className="sec">Cases that Allow Inspiration</h2>
            <p>
              A handful of landmark rulings draw the line between inspiration and infringement. One
              of them is the Apple case worth remembering.
            </p>

            <div className="case">
              <div className="yr">
                2023
                <br />
                <span style={{ fontSize: "10px", fontWeight: 600 }}>11th Cir.</span>
              </div>
              <div>
                <h4>
                  <em>
                    <a
                      href="https://media.ca11.uscourts.gov/opinions/unpub/files/202112835.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Apple v. Corellium
                    </a>
                  </em>
                  , the inspiration case
                </h4>
                <p>
                  Corellium built virtual iOS environments, full copies of Apple's operating
                  system, plus added tooling, so security researchers could test and find bugs.
                  The Eleventh Circuit affirmed that this is <strong>fair use</strong>: highly
                  transformative (a research instrument, rather than a competing consumer phone),
                  operating on the functional nature of OS software, with no harm to Apple's
                  iPhone sales. The opinion is unpublished, and the parties settled in December
                  2023, the reasoning still reads as the modern template for "inspiration":
                  copying proprietary technology is defensible when the purpose is genuinely new
                  and serves the wider ecosystem.
                </p>
                <span className="verdict">Verdict · Fair Use</span>
              </div>
            </div>

            <div className="case">
              <div className="yr">
                2021
                <br />
                <span style={{ fontSize: "10px", fontWeight: 600 }}>SCOTUS</span>
              </div>
              <div>
                <h4>
                  <em>
                    <a
                      href="https://www.law.cornell.edu/supremecourt/text/18-956"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Google v. Oracle
                    </a>
                  </em>
                </h4>
                <p>
                  Google reimplemented Java APIs to build Android. The Supreme Court held this a
                  fair use, a new purpose, in a new platform, for a new generation of devices. The
                  ruling that underwrites much of how modern software is actually built.
                </p>
                <span className="verdict">Verdict · Fair Use</span>
              </div>
            </div>

            <div className="case">
              <div className="yr">
                1994
                <br />
                <span style={{ fontSize: "10px", fontWeight: 600 }}>SCOTUS</span>
              </div>
              <div>
                <h4>
                  <em>
                    <a
                      href="https://www.law.cornell.edu/supremecourt/text/510/569"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Campbell v. Acuff-Rose
                    </a>
                  </em>
                </h4>
                <p>
                  2 Live Crew's send-up of "Oh, Pretty Woman" established parody as transformative.
                  The case that gave "transformative use" its modern meaning, in music and beyond.
                </p>
                <span className="verdict">Verdict · Fair Use</span>
              </div>
            </div>

            <div className="case">
              <div className="yr">
                2013
                <br />
                <span style={{ fontSize: "10px", fontWeight: 600 }}>2d Cir.</span>
              </div>
              <div>
                <h4>
                  <em>
                    <a
                      href="https://en.wikipedia.org/wiki/Cariou_v._Prince"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Cariou v. Prince
                    </a>
                  </em>
                </h4>
                <p>
                  Richard Prince reworked Patrick Cariou's photographs into new appropriation
                  paintings. Most were ruled transformative, visual remixing protected when the
                  new work carries a different aesthetic and message.
                </p>
                <span className="verdict">Verdict · Largely Fair Use</span>
              </div>
            </div>

            <p className="note">
              A caution worth stating plainly: remixes are judged case by case, and the outcome can
              be hard to predict. Open-source licences solve this in advance by granting permission
              up front; proprietary platforms tend to litigate. The AI training debates of this
              decade lean on the same transformative-use argument that freed Google's APIs and
              Corellium's virtual phones.
            </p>

            <p>
              Every argument in this article has already been made on an NFT.NYC stage. Erick
              Snowfro{" "}
              <a
                href="https://www.youtube.com/watch?v=NLTF-rjcuB4"
                target="_blank"
                rel="noopener noreferrer"
              >
                unchained generative art
              </a>{" "}
              in 2021, Soula Parassidis asked{" "}
              <a
                href="https://www.youtube.com/watch?v=R8Rf65BAKjg"
                target="_blank"
                rel="noopener noreferrer"
              >
                whether Mozart was the first generative artist
              </a>{" "}
              in 2022, the year Wolfe von Lenkiewicz{" "}
              <a
                href="https://www.youtube.com/watch?v=u594KFcsrBM"
                target="_blank"
                rel="noopener noreferrer"
              >
                mapped AI's impact on art history
              </a>{" "}
              and Jeremy Goldman{" "}
              <a
                href="https://www.youtube.com/watch?v=TosdjztDo30"
                target="_blank"
                rel="noopener noreferrer"
              >
                sliced the three-layer copyright cake
              </a>
              , Sook Hwang traced{" "}
              <a
                href="https://www.youtube.com/watch?v=cCzI-0I4jPY"
                target="_blank"
                rel="noopener noreferrer"
              >
                a CC0's ripple effects
              </a>{" "}
              in 2023, and Loïc Ramboanasolo mapped{" "}
              <a
                href="https://www.youtube.com/watch?v=e1-xFL2pQXc"
                target="_blank"
                rel="noopener noreferrer"
              >
                the infinite potential of derivative art
              </a>{" "}
              at NFT.London 2022, the exact move Gift Studio and the Chop Shop now run in public.
              At NFT.NYC 2026 (September 1-3) the argument continues in the present tense. Athr
              headlines <em>The Remix Renaissance</em>; Kenneth Burris convenes{" "}
              <em>Who Made This?</em>, "In a world flooded with AI images, provenance isn't
              metadata, it's the work"; Pindar Van Arman sits down for a Main Stage fireside on
              royalties. The lawyers return too: Celine Moille asks{" "}
              <em>You Don't Own Your NFT, Now What?</em>, Nuzayra Haque-Shah takes brand
              protection and creator rights to the AI frontier, and rapper Shah brings on-chain
              remix rights and instant sample clearance to <em>Beyond the Hype Cycle</em>. The
              transformative-use question this article traces from dub plates to Corellium reaches
              its next hearing live.
            </p>
          </section>

          <hr className="div" />

          {/* FAQ */}
          <section className="block faq" id="faq">
            <div className="kicker">FAQ</div>
            <h2 className="sec">Frequently Asked Questions</h2>

            <details id="is-remixing-the-same-as-copying">
              <summary>Is remixing the same as copying?</summary>
              <p>
                Copying reproduces; remixing transforms. The legal and creative value lives in
                what the new work adds, new meaning, a new purpose, a new audience. A photocopy
                substitutes for the original; a remix sits beside it and says something the source
                never did.
              </p>
            </details>
            <details id="what-is-the-inspiration-case-involving-apple">
              <summary>What is the "inspiration" case involving Apple?</summary>
              <p>
                It is <em>Apple v. Corellium</em>, affirmed by the 11th Circuit in 2023. Corellium
                made virtual copies of iOS for security research, and the court ruled it fair use
                because the purpose was highly transformative and posed no harm to Apple's
                product market. It is the clearest modern precedent for inspiration drawn from
                proprietary technology.
              </p>
            </details>
            <details id="is-the-bible-really-a-remix">
              <summary>Is the Bible really a remix?</summary>
              <p>
                Many scholars describe it that way. Its flood, creation and immortality narratives
                parallel older Mesopotamian and Canaanite sources, which biblical authors reworked
                into a new monotheistic framework. Synthesis and reinterpretation are core to how
                the text was formed, the ultimate cultural remix.
              </p>
            </details>
            <details id="where-does-the-word-remix-come-from">
              <summary>Where does the word "remix" come from?</summary>
              <p>
                From Jamaican sound-system culture. Dub engineers of the late 1960s and early
                1970s, King Tubby, Lee "Scratch" Perry, pulled apart master tapes and rebuilt
                songs as new versions. Hip-hop sampling carried the technique worldwide, and club
                culture turned the remix into a creative economy of its own.
              </p>
            </details>
            <details id="who-coined-the-phrase-everything-is-a-remix">
              <summary>Who coined the phrase "everything is a remix"?</summary>
              <p>
                Filmmaker Kirby Ferguson, whose web series{" "}
                <em>
                  <a
                    href="https://www.everythingisaremix.info/watch-the-series"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Everything Is a Remix
                  </a>
                </em>{" "}
                argues that all creativity builds on prior work through three moves: copying,
                transforming and combining. This article borrows his thesis, fittingly, as a remix
                of it.
              </p>
            </details>
            <details id="what-is-fair-use-and-how-does-it-protect-remixes">
              <summary>What is fair use, and how does it protect remixes?</summary>
              <p>
                Fair use (
                <a
                  href="https://www.law.cornell.edu/uscode/text/17/107"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  17 U.S.C. § 107
                </a>
                ) is the exception that lets a transformative remix proceed without permission.
                Courts weigh four factors: purpose and character of the use, nature of the
                original, amount taken, and market effect. Transformation is the through-line, a
                remix that says something new, for a new audience, stands on far firmer ground.
              </p>
            </details>
            <details id="how-does-times-square-collect-let-me-remix">
              <summary>How does Times Square Collect let me remix?</summary>
              <p>
                Through gifting. Mission #2, share recognition with Collectible Gifts, runs on
                Gift Studio: each holder issues one plain-language instruction, the AI edits the
                previous result, and every change builds on the last until all the edits coexist
                by the finale. Every participant keeps a link NFT of the chain as it stood on
                their turn.
              </p>
            </details>
            <details id="what-is-the-chop-shop-on-hotgarage-kred">
              <summary>What is the Chop Shop on HotGarage.Kred?</summary>
              <p>
                The Chop Shop is HotGarage.Kred's AI customisation studio: pick from ten base
                vehicle types, describe the build, and generate a one-of-a-kind Custom Ride. The
                process is non-destructive, your original collectible stays in your wallet. The
                Hot Wheels collection lives on Flow; Chop Shop Custom Rides mint on Base.
              </p>
            </details>
            <details id="what-is-cat-remix-matrix">
              <summary>What is The Cat Remix Matrix?</summary>
              <p>
                The Cat Remix Matrix is the consumer demo of Matrix.Kred. Upload a photo of your
                cat free, receive a 500 T-XP welcome gift, and remix it through themed worlds
                using the same FLUX chain engine as Gift Studio. Animate the chain (150 T-XP) and
                the cat becomes a posting Cat Agent whose Forever Identity is anchored on Base,
                live at YourCat.Cats.Kred.
              </p>
            </details>
            <details id="how-are-artists-paid-when-their-work-is-remixed">
              <summary>How are artists paid when their work is remixed?</summary>
              <p>
                Provenance is the answer. On-chain royalties and platforms like Titles.xyz record
                creative lineage so payment flows automatically every time a model, style or asset
                is built upon. HotGarage.Kred and Times Square Collect use the same principle, the
                original creator keeps a share of everything downstream. OneHub for Artists
                explains the royalty model in full.
              </p>
            </details>
            <details id="what-is-gift-studio">
              <summary>What is Gift Studio?</summary>
              <p>
                Gift Studio is the AI remix engine behind gifting on OneHub platforms, including
                Times Square Collect and Empire.Kred Gen2. Each holder of a gift issues one
                plain-language instruction, the AI edits the previous result, and every change
                builds on the last, so the whole chain of edits coexists in the finale. Both
                sender and recipient earn reward points on every send.
              </p>
            </details>
            <details id="what-is-r3ordr-and-who-is-dario-de-siena">
              <summary>What is R3ORDR, and who is Dario De Siena?</summary>
              <p>
                R3ORDR is an evolving generative art protocol by Dario De Siena, the Swiss painter
                and NFT artist who won Best Physical Artist at NFT.NYC 2021. Anchored by a Hall of
                Fame of 69 one-of-one artworks, it grows through repetition, reconstruction, and
                collective participation: the community's artworks, memes, edits, and prompts
                reshape the project in real time. He discusses it at NFT.NYC 2026 in a fireside
                chat with Jodee Rich.
              </p>
            </details>
            <details id="can-a-web-app-be-remixed">
              <summary>Can a web app be remixed?</summary>
              <p>
                Yes. Any publicly published Lovable app carries a Remix button that hands you the
                entire working app as your starting material: remix it, change what you want, and
                publish your own version. Since Lovable's agent integrations launch on July 15,
                2026, every published remix also ships as a live tool that ChatGPT and Claude can
                use directly.
              </p>
            </details>
            <details id="what-are-lovable-agent-integrations">
              <summary>What are Lovable agent integrations?</summary>
              <p>
                Lovable agent integrations, announced July 15, 2026, give every publicly published
                Lovable app a Lovable-hosted MCP server. AI assistants including ChatGPT and
                Claude read a plain-language list of what the app can do and call it directly,
                with creator-controlled access levels and OAuth protection by default. A remixed
                app inherits the same capability the moment it publishes.
              </p>
            </details>
            <details id="what-is-mcp">
              <summary>What is MCP?</summary>
              <p>
                MCP (Model Context Protocol) is the open protocol AI assistants use to call tools.
                An app that speaks MCP publishes a machine-readable list of its actions, and
                assistants such as ChatGPT and Claude invoke those actions directly on a user's
                behalf. It is the plumbing that turns a published web app, or a remix of one, into
                a live tool inside an AI conversation.
              </p>
            </details>
            <details id="what-is-kred-flash-sprint-1-and-how-do-i-enter">
              <summary>What is Kred Flash Sprint #1, and how do I enter?</summary>
              <p>
                Kred Flash Sprint #1, The Domain Registrar Reseller, is a five-hour build window
                on Friday, August 7, 2026 (12:00 to 17:00 ET): build a better domain search
                experience on the Domains.Kred Registrar API. Two example apps publish ahead of
                the window, built to be remixed. The top entry takes $1,000 plus reward points,
                and the season champion takes the NFT.NYC 2026 stage on September 1.
              </p>
            </details>
            <details id="what-do-i-own-when-i-remix-something-on-these-platforms">
              <summary>What do I own when I remix something on these platforms?</summary>
              <p>
                Your remix becomes a Collectible in its own right, recorded on-chain with its
                lineage intact: the chain shows what you started from, what you changed, and who
                collected the result. Every participant in a Gift Studio chain keeps a link NFT of
                the chain as it stood on their turn, and the original artist is paid at every step
                of the loop.
              </p>
            </details>
            <details id="when-and-where-is-nft-nyc-2026">
              <summary>When and where is NFT.NYC 2026?</summary>
              <p>
                NFT.NYC 2026 runs September 1 to 3, 2026 at The Edison, Times Square, New York:
                the ninth edition of the world's largest NFT conference. The remix thread runs
                through the program, from the Times Square Collect missions and the Cat Remix
                Matrix to Dario De Siena's fireside chat and the Flash Sprint season finale on
                the Main Stage.
              </p>
            </details>
          </section>

          {/* Key takeaways */}
          <div className="takeaways">
            <h2>Key Takeaways</h2>
            <ul>
              <li>
                Remixing is the oldest creative instinct, the same move whether it is a clay
                tablet, a marble copy or a forked repo
              </li>
              <li>
                The law rewards transformation: fair use protects remixes that add new meaning,
                purpose or audience
              </li>
              <li>
                <em>Apple v. Corellium</em> is the modern "inspiration" case, copying proprietary
                tech is defensible for genuinely new, non-substitutive purposes
              </li>
              <li>
                The Bible, Rome, the Renaissance and hip-hop are all remix cultures separated only
                by their tools
              </li>
              <li>
                Web3 adds what every earlier era lacked, provenance, attribution and automatic
                payment to the source
              </li>
              <li>
                HotGarage.Kred, Times Square Collect, the Cat Remix Matrix, R3ORDR and Titles.xyz
                carry the thread forward today
              </li>
              <li>
                Cat Remix Matrix takes the final step, the remix wakes up, speaks in pictures, and
                its Forever Identity is anchored on Base
              </li>
            </ul>
          </div>

          <hr className="div" />

          {/* CTA */}
          <div className="cta">
            <h2>Add Your Voice to the Remix</h2>
            <p>
              Times Square Collect is a free, 12-mission showcase of how tokenization reshapes
              real industries, leading into NFT.NYC 2026. Collect, remix and gift your way onto
              the leaderboard.
            </p>
            <a
              className="btn"
              href="https://Collect.NFT.NYC/ts-collect"
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Times Square Collect
            </a>
            <a
              className="btn ghost"
              href="https://HotGarage.Kred/garage-papers"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the Garage Papers
            </a>
          </div>

          {/* Endnote */}
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <p
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-faint)",
                marginBottom: "0.375rem",
                fontStyle: "italic",
              }}
            >
              A OneHub Journal feature for <strong>NFT.NYC 2026</strong> · The Edison, Times
              Square · September 1-3, 2026
            </p>
            <p
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-faint)",
                marginBottom: "0.375rem",
                fontStyle: "italic",
              }}
            >
              Historical images are public domain, sourced via Wikimedia Commons. Product
              references:{" "}
              <a
                href="https://HotGarage.Kred"
                target="_blank"
                rel="noopener noreferrer"
              >
                HotGarage.Kred
              </a>
              ,{" "}
              <a
                href="https://Collect.NFT.NYC/ts-collect"
                target="_blank"
                rel="noopener noreferrer"
              >
                Collect.NFT.NYC
              </a>
              ,{" "}
              <a href="https://R3ORDR.com" target="_blank" rel="noopener noreferrer">
                R3ORDR.com
              </a>
              ,{" "}
              <a href="https://Titles.xyz" target="_blank" rel="noopener noreferrer">
                Titles.xyz
              </a>
            </p>
            <p
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-faint)",
                marginBottom: "0.375rem",
                fontStyle: "italic",
              }}
            >
              Proof of presence over proof of stake
            </p>
          </div>

          {/* Disclaimer */}
          <div
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-text-faint)",
              fontStyle: "italic",
              lineHeight: 1.6,
              padding: "1rem 1.25rem",
              borderLeft: "3px solid var(--color-primary)",
              margin: "3rem 0 1.5rem",
            }}
          >
            T-XP (Times Square Experience Points) is an off-chain metric; it is a measure of
            participation rather than a cryptocurrency, token, or financial instrument. The
            digital art, Collectible Gifts, Custom Rides and Cat Agent identities described in
            this article are collectibles with no inherent commercial value. They are collectibles
            rather than financial products, securities, or investment instruments of any kind, and
            should be collected without any expectation of financial return. Platform features
            described in this article reflect live platform data as of July 2026 and may change.
            Digital Assets on this OneHub are provided by Empire.Kred Pty Ltd (ACN 602 735 973).
          </div>
        </div>
      </article>

      <SiteFooter stage={stage} />
    </div>
  );
}
