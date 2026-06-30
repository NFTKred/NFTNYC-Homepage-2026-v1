import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageMeta from "@/components/PageMeta";
import "@/styles/blog-history-of-remix.css";

const ARTICLE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Everything Is a Remix: A Short History of Borrowing - From Gilgamesh to the Blockchain",
  description:
    "Humans have always taken what came before and made it new. From the flood tablets of Gilgamesh to AI models on Titles.xyz, the long history of borrowing - and how OneHub, the Times Square Challenge, HotGarage.Kred and R3ORDR carry it forward.",
  url: "https://www.nft.nyc/blog/history-of-remix",
  mainEntityOfPage: "https://www.nft.nyc/blog/history-of-remix",
  image: "https://www.nft.nyc/og/blog-history-of-remix.png",
  author: { "@type": "Organization", name: "NFT.NYC", url: "https://www.nft.nyc" },
  publisher: {
    "@type": "Organization",
    name: "NFT.NYC",
    logo: { "@type": "ImageObject", url: "https://www.nft.nyc/favicon.jpg" },
  },
  datePublished: "2026-06-30",
  dateModified: "2026-06-30",
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
        style={{ padding: "calc(4rem + 56px) 1.5rem 4rem" }}
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
              Everything Is a <span className="hl">Remix</span>
              <br />
              A Short History of Borrowing - From Gilgamesh to the Blockchain
            </h1>
            <p className="remix-lede">
              Humans have always taken what came before and made it new. The clay tablet, the marble
              copy, the moustache on the Mona Lisa, the sampled break, the forked repo - each is the
              same instinct wearing the costume of its age. Here is the long story, and where OneHub
              picks it up.
            </p>
            <div className="remix-meta">
              <span><span className="dot"></span> Published June 2026</span>
              <span><span className="dot"></span> 14 min read</span>
              <span><span className="dot"></span> OneHub Journal</span>
            </div>
          </header>

          {/* Contents */}
          <nav className="toc">
            <h2>Contents</h2>
            <ol>
              <li><a href="#what">What Remixing Is - Art and Tech</a></li>
              <li><a href="#timeline">A Timeline Through the Ages</a></li>
              <li><a href="#bible">Is the Bible the Ultimate Remix</a></li>
              <li><a href="#today">The Story Today - NFT and Web3</a></li>
              <li><a href="#titles">Titles.xyz Style Transfer</a></li>
              <li><a href="#hotgarage">HotGarage.Kred and Mattel</a></li>
              <li><a href="#tschallenge">The Times Square Challenge</a></li>
              <li><a href="#r3ordr">Dario De Siena and R3ORDR</a></li>
              <li><a href="#conclusion">Conclusion</a></li>
              <li><a href="#law">The Law of the Remix</a></li>
              <li><a href="#cases">Cases That Allow Inspiration</a></li>
              <li><a href="#faq">Frequently Asked Questions</a></li>
            </ol>
          </nav>

          {/* What is remixing */}
          <section className="block" id="what">
            <div className="kicker">Definition</div>
            <h2 className="sec">What Remixing Is - In Art and In Tech</h2>
            <p>
              <strong>Remixing is a fundamental human creative impulse</strong> - taking existing
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
                  Artists borrow, sample or alter existing works - high culture or low - to comment,
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
                  thesis <em>Everything Is a Remix</em> argues that all creativity builds on prior
                  work through copying, transforming and combining. In Web3 it becomes generative
                  protocols, derivative collections, and platforms that track lineage and monetise
                  the remix with provenance.
                </p>
              </div>
            </div>

            <p className="note">
              Modern enablers run in both directions at once - AI tools generate and remix images,
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
              technology changes; the instinct never does.
            </p>

            <div className="timeline">
              <div className="era">
                <div className="when">~2000+ BCE · Mesopotamia</div>
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
                  The Bible is arguably the ultimate cultural and religious remix - synthesising,
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
                  industrial scale - mass-producing versions, adding Roman twists. Virgil's{" "}
                  <em>Aeneid</em> remixes Homer. The Augustus of Prima Porta itself reworks the
                  Greek sculptor Polykleitos's canon of proportion - and every age since has kept
                  on remixing the classics, right up to today.
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
                  <b>Augustus of Prima Porta - drag to remix the canon</b> - a Roman statue that
                  already remixed Greek proportion, reimagined here as a contemporary street-art
                  work. The same pose and armour carry across two thousand years; only the language
                  changes.{" "}
                  <span className="src">
                    Marble: public domain via Wikimedia Commons. Remix: created for this article
                    with the same FLUX edit engine GiftChain uses.
                  </span>
                </figcaption>
              </figure>

              <div className="era">
                <div className="when">~400 BCE onward · Medieval and Global</div>
                <h4>Cento poetry and the travelling fable</h4>
                <p>
                  Medieval <em>cento</em> poetry stitched whole poems from lines of earlier authors
                  - patchwork by design. The <em>Panchatantra</em>, the ancient Indian animal
                  fables, was remixed and reinterpreted more than 200 times across 50+ languages
                  over the centuries, travelling as <em>Kalila wa Dimna</em> through the Arabic and
                  Persian world. Early global remix culture, moving by caravan instead of cable.
                </p>
              </div>

              <div className="era">
                <div className="when">14th-16th century · Renaissance</div>
                <h4>The deliberate revival</h4>
                <p>
                  The Renaissance was an explicit revival and remix of classical Greek and Roman
                  forms in art and architecture - antiquity sampled on purpose, looped forward a
                  thousand years and given new harmonies.
                </p>
              </div>

              <div className="era">
                <div className="when">19th century · The Modern Remix</div>
                <h4>The masters become source material</h4>
                <p>
                  By the 1860s the Old Masters were themselves being openly remixed. Édouard Manet
                  rebuilt Titian and Raphael for a modern Paris - keeping the exact poses and
                  compositions while pouring in scandalous new meaning. These are not vague
                  influences; they are documented, deliberate reworkings of specific earlier works.
                </p>
              </div>

              <figure className="diptych">
                <div className="dip">
                  <div className="dip-cell">
                    <img
                      src={`${IMG}/img-src-titian-venus.jpg`}
                      alt="Titian's Venus of Urbino, a reclining nude, 1534"
                    />
                    <span className="dip-tag">Titian · 1534</span>
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
                  <b>Manet remixes Titian</b> - <em>Olympia</em> (right) rebuilds the exact
                  reclining pose of Titian's <em>Venus of Urbino</em> (left): the hand over the
                  lap, the bed, the attendant, even the animal - the dog becomes a black cat. Same
                  composition, a deliberately confrontational new meaning.{" "}
                  <span className="src">Both images: public domain via Wikimedia Commons.</span>
                </figcaption>
              </figure>

              <figure className="diptych">
                <div className="dip">
                  <div className="dip-cell">
                    <img
                      src={`${IMG}/img-src-raimondi-paris.jpg`}
                      alt="Marcantonio Raimondi's engraving The Judgement of Paris, after Raphael, c.1515"
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
                  <b>Manet remixes Raphael</b> - the seated trio in{" "}
                  <em>Le Déjeuner sur l'herbe</em> (right) lifts its arrangement straight from the
                  river-gods group in Marcantonio Raimondi's engraving after Raphael (left, lower
                  right). A Renaissance print, sampled into the painting that helped launch modern
                  art.{" "}
                  <span className="src">Both images: public domain via Wikimedia Commons.</span>
                </figcaption>
              </figure>

              <div className="era">
                <div className="when">Early 20th century · The Avant-Garde</div>
                <h4>Fragments pasted into the frame</h4>
                <p>
                  Cubist collages by Picasso and Braque pasted real-world fragments straight onto
                  the canvas. Dada gave us readymades and photomontage. Duchamp's <em>Fountain</em>{" "}
                  (1917) and <em>L.H.O.O.Q.</em> (1919) - a cheap postcard of the Mona Lisa with a
                  pencilled moustache and goatee - became the quintessential visual remix:
                  irreverent, transformative, endlessly referential.
                </p>
              </div>

              <figure className="ba tall">
                <div className="ba-wrap">
                  <img
                    src={`${IMG}/img-mona-lisa_0000_remix.jpg`}
                    alt="The Mona Lisa with a drawn-on handlebar moustache and goatee, in the manner of Duchamp's L.H.O.O.Q."
                  />
                  <div className="ba-after">
                    <img
                      src={`${IMG}/img-mona-lisa_0001_original.jpg`}
                      alt="Leonardo da Vinci's Mona Lisa, the original painting"
                    />
                  </div>
                  <div className="ba-line"></div>
                  <div className="ba-grip"></div>
                  <span className="ba-tag ba-tag-l">Leonardo · 1503</span>
                  <span className="ba-tag ba-tag-r">Duchamp · 1919</span>
                  <span className="ba-hint">⇆ Drag to add the moustache</span>
                </div>
                <figcaption>
                  <b>The most remixed image in art history - drag to add the moustache</b> - in
                  1919 Marcel Duchamp pencilled a moustache and goatee onto a cheap postcard of the{" "}
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
                  Pop Art appropriated mass culture - Warhol's soup cans, Lichtenstein's comic
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
                  <em>RiP: A Remix Manifesto</em> and Girl Talk dramatised the tension between
                  sampling culture and copyright. Web 2.0 made user-generated remixing the default
                  mode of the internet.
                </p>
              </div>

              <div className="era">
                <div className="when">2010s-2026+ · Web3, NFT and AI</div>
                <h4>Borrowing with a memory</h4>
                <p>
                  Generative art, derivative collections and on-chain protocols make remixing
                  explicit, attributed and ownable. AI models remix vast visual and textual
                  corpora. The frontier platforms now emphasise provenance and artist control - the
                  missing pieces that earlier remix cultures never had.
                </p>
              </div>
            </div>
          </section>

          {/* Bible pullquote */}
          <section className="block" id="bible">
            <blockquote>
              If the oldest stories we tell were already retellings, then originality was never the
              point. Continuity was.
              <span className="by">- The thread from Gilgamesh to the chain</span>
            </blockquote>
          </section>

          <hr className="div" />

          {/* Today */}
          <section className="block" id="today">
            <div className="kicker">The Story Today</div>
            <h2 className="sec">Remixing in NFT and Web3</h2>
            <p>
              This long history culminates in today's tokenised creative ecosystems, where remixing
              powers new communities, new ownership models and new forms of expression. Four
              projects show the shape of it - one turns an artist's own style into shared, paid
              infrastructure, one reclaims a heritage, one gamifies a social ritual, and one is an
              artist inviting the remix.
            </p>

            <h3 className="sub">Remixing in action - a gift that grows</h3>
            <p>
              First, here is what a remix looks like as a verb rather than a noun. In a GiftChain
              gift on OneHub, each holder issues one plain-language instruction, and the AI edits
              the <em>previous</em> result - so every change builds on the last instead of
              replacing it. This is the verified "wild-motorbike-cat" chain, the same engine that
              powers gifting in the Times Square Challenge.
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
                <b>A remix as a semantic edit, not a filter</b> - by the finale the added helmet,
                the second rider, the glowing eyes, the swapped bikes and the finish banner all
                coexist. Nothing was thrown away; each turn inherited everything before it. Every
                participant keeps a link NFT of the chain as it stood on their turn.{" "}
                <span className="src">Frames: GiftChain on GiftStudio.Kred.</span>
              </p>
            </div>

            {/* Titles.xyz */}
            <div className="product" id="titles">
              <div className="label">AI · Style Transfer</div>
              <h3>
                Our friends at <span className="dom">Titles.xyz</span> - remixing by style transfer
              </h3>
              <p>
                Titles.xyz is a creative studio built on{" "}
                <strong>artist-trained, artist-owned AI models</strong> -{" "}
                <em>"models built and owned by real artists, not scraped."</em> Its core move is{" "}
                <strong>style transfer</strong>: take any image and re-render it in an artist's
                signature style, drawn from a model that artist trained on their own body of work.
                Your content, their hand - drag the slider to watch a photograph become a painting.
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
                  <b>Style transfer, the Titles.xyz way</b> - one photograph, re-rendered through
                  an artist's own trained model. The lineage is recorded, so every time someone
                  builds on that style{" "}
                  <strong>the artist is credited and paid automatically</strong>. They call it{" "}
                  <em>"Creative Infrastructure That Remembers"</em> - credit, compensation and
                  memory of creative lineage, solved.{" "}
                  <span className="src">
                    Style-transfer demonstration created with an AI image model for this article.
                  </span>
                </figcaption>
              </figure>

              <div className="chips">
                <span className="chip">Artist-owned models</span>
                <span className="chip">Style transfer</span>
                <span className="chip">Not scraped</span>
                <span className="chip">Auto royalties</span>
                <span className="chip">Provenance</span>
              </div>
              <p className="note" style={{ marginTop: "0.875rem" }}>
                "Discover what others made. See how they made it. Take it further." Explore{" "}
                <a href="https://Titles.xyz" target="_blank" rel="noopener noreferrer">
                  Titles.xyz ↗
                </a>
              </p>
            </div>

            {/* HotGarage */}
            <div className="product" id="hotgarage">
              <div className="label">Collectibles · Reclaimed Heritage</div>
              <h3>
                HotGarage<span className="dom">.Kred</span> - remixing Mattel's die-cast legend
              </h3>
              <p>
                Mattel's Hot Wheels Virtual Garage tokenised iconic die-cast cars, then closed the
                program in January 2026 - leaving roughly 1.54 million collectibles, about 74% of
                supply, stranded in custodial wallets. HotGarage.Kred is the community's answer:{" "}
                <strong>"Mattel ended the program. The collectors didn't."</strong>
              </p>
              <p>
                Its signature feature, the <strong>Chop Shop</strong>, is an AI customisation
                studio - pick from ten base vehicle types, describe the build, and generate a
                one-of-a-kind custom car. The process is non-destructive: your NFT never leaves
                your wallet. A static Hot Wheels collectible becomes a living, remixable "digital
                twin" you can tune across eight race tracks. This is remixing physical heritage
                into Web3 - extending, tokenising and community-remixing beloved designs.
              </p>

              <figure className="chop">
                <div className="chop-frame">
                  <video
                    src={`${IMG}/remix-chopshop-v1.mp4`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    aria-label="The Chop Shop on HotGarage.Kred - an AI vehicle customization studio showing a custom red car, with options for custom paint jobs, flame graphics, special effects and performance parts"
                  />
                  <span className="chop-sheen"></span>
                </div>
                <figcaption>
                  <b>A HotGarage remix in action</b> - the Chop Shop turns a base vehicle into a
                  one-of-a-kind custom build: custom paint, flame graphics, special effects and
                  performance parts, all earning rarity-weighted XP. The same impulse as a Roman
                  copying a Greek bronze, now non-destructive and on-chain.{" "}
                  <span className="src">Image: HotGarage.Kred.</span>
                </figcaption>
              </figure>

              <div className="chips">
                <span className="chip">Chop Shop AI builds</span>
                <span className="chip">Non-destructive</span>
                <span className="chip">Digital twin racing</span>
                <span className="chip">Community heir</span>
              </div>
              <p className="note" style={{ marginTop: "0.875rem" }}>
                "Custodians of the culture - the community heir, never the corporate heir." See the{" "}
                <a
                  href="https://HotGarage.Kred/garage-papers"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Garage Papers ↗
                </a>
              </p>
            </div>

            {/* TS Challenge */}
            <div className="product" id="tschallenge">
              <div className="label">Gameplay · Social Ritual</div>
              <h3>The Times Square Challenge - remixing the gift</h3>
              <p>
                A free, 12-mission program on OneHub.NFT.NYC leading into NFT.NYC 2026.
                Participants explore an interactive map of New York City, collect NFT art, earn
                T-XP, climb a global leaderboard, and write every completion to a permanent
                Passport. It turns passive collecting into active, remixable participation.
              </p>
              <p>
                Two mechanics carry the remix story directly.{" "}
                <strong>Mission #2 invites you to remix a 2025 billboard artwork</strong> through
                Collect.Kred - the new piece carries a chain of ownership back to the original
                artist, displays on the Times Square billboard <em>beside</em> the original, and
                splits primary sales{" "}
                <strong>40% to the remixer and 40% to the original artist</strong>. "Take the
                community's work. Add your voice to it." Alongside it, the gifting mechanic - built
                on GiftChain - treats <strong>a remix as a semantic edit, not a filter</strong>:
                each turn a holder issues a plain-language instruction ("add a helmet," "swap the
                bike for a Ducati"), and every edit builds on the previous result until all the
                changes coexist by the finale.
              </p>

              <div className="chips">
                <span className="chip">12 missions</span>
                <span className="chip">Remix a billboard</span>
                <span className="chip">40 / 40 split</span>
                <span className="chip">GiftChain remix</span>
                <span className="chip">Proof of presence</span>
              </div>
              <p className="note" style={{ marginTop: "0.875rem" }}>
                Start at{" "}
                <a
                  href="https://OneHub.NFT.NYC/ts-challenge"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OneHub.NFT.NYC/ts-challenge ↗
                </a>
              </p>
            </div>

            {/* R3ORDR */}
            <div className="product" id="r3ordr">
              <div className="label">Art · The Artist Invites the Remix</div>
              <h3>
                Dario De Siena's <span className="dom">R3ORDR</span>
              </h3>
              <p>
                Artist Dario De Siena's R3ORDR is built on re-ordering - the name is the idea. In
                his own words it is{" "}
                <em>"a system of visual fragments, cultural residue and symbolic reconstruction,"</em>{" "}
                where the entities are{" "}
                <em>
                  "reconstructed fragments of identity, culture, memory and signal."
                </em>{" "}
                Each piece stands alone while pointing toward something larger - a language forming
                through repetition, alignment and shared recognition.
              </p>
              <p>
                It challenges the idea of a fixed, finished artwork. By inviting participation,
                re-ordering and remixing - on-chain and in physical studies where he reworks older
                pieces - Dario is a clear example of an artist who explicitly designs <em>for</em>{" "}
                the remix rather than against it.{" "}
                <strong>"The structure remains open. The signals are still moving."</strong>
              </p>
              <div className="chips">
                <span className="chip">Fragmentation</span>
                <span className="chip">Reconstruction</span>
                <span className="chip">On-chain signal</span>
                <span className="chip">Remix invited</span>
              </div>
              <p className="note" style={{ marginTop: "0.875rem" }}>
                - The future is R3ORDR.{" "}
                <a href="https://R3ORDR.com" target="_blank" rel="noopener noreferrer">
                  R3ORDR.com ↗
                </a>
              </p>
            </div>
          </section>

          <hr className="div" />

          {/* Conclusion */}
          <section className="block" id="conclusion">
            <div className="kicker">Conclusion</div>
            <h2 className="sec">Remixing as Creative Evolution</h2>
            <p>
              From Gilgamesh tablets and biblical synthesis, through Roman copies and Duchamp's
              moustache, to AI remixes on artist-owned models and tokenised Hot Wheels -{" "}
              <strong>remixing is how culture advances</strong>. When a work transforms its source,
              it earns its place; fair use and thoughtful protocols (open source, R3ORDR,
              Titles.xyz) protect innovation and creators at the same time.
            </p>
            <p>
              In the NFT and Web3 space we are doing more than collecting. We are actively remixing
              physical heritage (Mattel's cars), social rituals (gifting in the Times Square
              Challenge), artistic protocols (Dario's R3ORDR) and AI creativity (Titles.xyz) into
              new, owned, communal experiences. The OneHub-powered Times Square Challenge embodies
              the whole thread: tokenisation remixes real industries and creative participation
              ahead of NFT.NYC 2026.
            </p>
            <p>
              Remixing democratises creativity while demanding better systems for attribution,
              compensation and permissionless transformation. The future belongs to those who
              remix wisely - with respect for the source and a vision for what comes next.
            </p>
          </section>

          {/* Key takeaways */}
          <div className="takeaways">
            <h2>Key Takeaways</h2>
            <ul>
              <li>
                Remixing is the oldest creative instinct - the same move whether it is a clay
                tablet, a marble copy or a forked repo
              </li>
              <li>
                The law rewards transformation: fair use protects remixes that add new meaning,
                purpose or audience
              </li>
              <li>
                <em>Apple v. Corellium</em> is the modern "inspiration" case - copying proprietary
                tech is defensible for genuinely new, non-substitutive purposes
              </li>
              <li>
                The Bible, Rome, the Renaissance and hip-hop are all remix cultures separated only
                by their tools
              </li>
              <li>
                Web3 adds what every earlier era lacked - provenance, attribution and automatic
                payment to the source
              </li>
              <li>
                HotGarage.Kred, the Times Square Challenge, R3ORDR and Titles.xyz carry the thread
                forward today
              </li>
            </ul>
          </div>

          <hr className="div" />

          {/* The Law */}
          <section className="block" id="law">
            <div className="kicker">The Rules</div>
            <h2 className="sec">The Law of the Remix</h2>
            <p>
              U.S. copyright law treats most remixes as <strong>derivative works</strong>, which
              ordinarily require permission from the original rights holder. The escape hatch is
              the <strong>fair use</strong> doctrine (17 U.S.C. § 107), a deliberate exception for
              transformative uses - commentary, criticism, parody, research, or a new purpose that
              serves the audience differently from the original.
            </p>
            <p>Courts weigh four factors together:</p>
            <ul className="clean">
              <li>
                <strong>Purpose and character</strong> of the use - is it transformative, does it
                add new meaning or a new market
              </li>
              <li>
                <strong>Nature</strong> of the original work - factual and functional works enjoy
                thinner protection than expressive ones
              </li>
              <li>
                <strong>Amount and substantiality</strong> taken relative to the whole
              </li>
              <li>
                <strong>Market effect</strong> - does the remix substitute for the original or sit
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
            <h3 className="sub">Cases that allow inspiration</h3>
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
                  <em>Apple v. Corellium</em> - the inspiration case
                </h4>
                <p>
                  Corellium built virtual iOS environments - full copies of Apple's operating
                  system, plus added tooling - so security researchers could test and find bugs.
                  The court ruled it <strong>fair use</strong>: highly transformative (a research
                  instrument, rather than a competing consumer phone), operating on the functional
                  nature of OS software, with no harm to Apple's iPhone sales. This is the modern
                  template for "inspiration" - copying proprietary technology is defensible when
                  the purpose is genuinely new and serves the wider ecosystem.
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
                  <em>Oracle v. Google</em>
                </h4>
                <p>
                  Google reimplemented Java APIs to build Android. The Supreme Court held this a
                  fair use - a new purpose, in a new platform, for a new generation of devices. The
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
                  <em>Campbell v. Acuff-Rose</em>
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
                  <em>Cariou v. Prince</em>
                </h4>
                <p>
                  Richard Prince reworked Patrick Cariou's photographs into new appropriation
                  paintings. Most were ruled transformative - visual remixing protected when the
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
          </section>

          <hr className="div" />

          {/* FAQ */}
          <section className="block faq" id="faq">
            <div className="kicker">FAQ</div>
            <h2 className="sec">Frequently Asked Questions</h2>
            <details>
              <summary>Is remixing the same as copying?</summary>
              <p>
                No. Copying reproduces; remixing transforms. The legal and creative value lives in
                what the new work adds - new meaning, a new purpose, a new audience. A photocopy
                substitutes for the original; a remix sits beside it and says something the source
                never did.
              </p>
            </details>
            <details>
              <summary>What is the "inspiration" case involving Apple?</summary>
              <p>
                It is <em>Apple v. Corellium</em>, affirmed by the 11th Circuit in 2023. Corellium
                made virtual copies of iOS for security research, and the court ruled it fair use
                because the purpose was highly transformative and posed no harm to Apple's product
                market. It is the clearest modern precedent for inspiration drawn from proprietary
                technology.
              </p>
            </details>
            <details>
              <summary>Is the Bible really a remix?</summary>
              <p>
                Many scholars describe it that way. Its flood, creation and immortality narratives
                parallel older Mesopotamian and Canaanite sources, which biblical authors reworked
                into a new monotheistic framework. Synthesis and reinterpretation are core to how
                the text was formed - the ultimate cultural remix.
              </p>
            </details>
            <details>
              <summary>How does the Times Square Challenge let me remix?</summary>
              <p>
                Mission #2 invites you to remix a 2025 billboard artwork through Collect.Kred. Your
                remix carries a chain of ownership back to the original artist, displays on the
                Times Square billboard beside the original, and splits primary sales 40% to you and
                40% to the artist. The gifting mechanic adds a second layer, where each turn is a
                plain-language semantic edit that builds on the last.
              </p>
            </details>
            <details>
              <summary>How do artists get paid when their work is remixed?</summary>
              <p>
                Provenance is the answer. On-chain royalties and platforms like Titles.xyz record
                creative lineage so payment flows automatically every time a model, style or asset
                is built upon. HotGarage.Kred and the Times Square Challenge use the same principle
                - the original creator keeps a share of everything downstream.
              </p>
            </details>
          </section>

          {/* CTA */}
          <div className="cta">
            <h2>Add Your Voice to the Remix</h2>
            <p>
              The Times Square Challenge is a free, 12-mission showcase of how tokenisation
              reshapes real industries - leading into NFT.NYC 2026. Collect, remix and gift your
              way onto the leaderboard.
            </p>
            <a
              className="btn"
              href="https://OneHub.NFT.NYC/ts-challenge"
              target="_blank"
              rel="noopener noreferrer"
            >
              Join the Times Square Challenge
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
        </div>
      </article>

      <SiteFooter stage={stage} />
    </div>
  );
}
