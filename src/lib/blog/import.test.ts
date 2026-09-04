import { describe, it, expect } from "vitest";
import { importPostFile, markdownToPost, htmlToPost } from "./import";

describe("markdownToPost", () => {
  it("parses the shapes our real posts use (title, bold, quote, table, divider, headings)", () => {
    const md = [
      "# The Times Square Challenge: 12 Missions",
      "",
      "> The Times Square Challenge is a free, 12-mission program.",
      ">",
      "> Every mission is plotted on an interactive map.",
      "",
      "---",
      "",
      "## Summary",
      "",
      "The **TS Challenge** is a *showcase* with a [link](https://collect.nft.nyc).",
      "",
      "| Attribute | Detail |",
      "|---|---|",
      "| Platform | Collect.NFT.NYC |",
      "| Cost | Free |",
    ].join("\n");

    const post = markdownToPost(md);

    expect(post.title).toBe("The Times Square Challenge: 12 Missions");
    expect(post.blocks.map((b) => b.type)).toEqual([
      "quote",
      "divider",
      "heading",
      "paragraph",
      "table",
    ]);

    const quote = post.blocks[0];
    if (quote.type !== "quote") throw new Error("expected quote");
    expect(quote.text).toContain("free, 12-mission program");
    expect(quote.text).toContain("interactive map");

    const heading = post.blocks[2];
    if (heading.type !== "heading") throw new Error("expected heading");
    expect(heading).toMatchObject({ level: 2, text: "Summary" });

    const para = post.blocks[3];
    if (para.type !== "paragraph") throw new Error("expected paragraph");
    expect(para.html).toContain("<strong>TS Challenge</strong>");
    expect(para.html).toContain("<em>showcase</em>");
    expect(para.html).toContain('<a href="https://collect.nft.nyc">link</a>');

    const table = post.blocks[4];
    if (table.type !== "table") throw new Error("expected table");
    expect(table.headers).toEqual(["Attribute", "Detail"]);
    expect(table.rows).toEqual([
      ["Platform", "Collect.NFT.NYC"],
      ["Cost", "Free"],
    ]);
  });

  it("parses frontmatter into metadata", () => {
    const md = [
      "---",
      "title: Hello World",
      "author: NFT.NYC",
      "tag: TS Challenge",
      "description: A test post.",
      "hero_image_url: https://example.com/hero.png",
      "---",
      "",
      "Body text.",
    ].join("\n");

    const post = markdownToPost(md);
    expect(post.title).toBe("Hello World");
    expect(post.author).toBe("NFT.NYC");
    expect(post.tag).toBe("TS Challenge");
    expect(post.description).toBe("A test post.");
    expect(post.hero_image_url).toBe("https://example.com/hero.png");
    expect(post.blocks).toEqual([{ type: "paragraph", html: "Body text." }]);
  });

  it("parses lists (bullet, ordered, one nesting level)", () => {
    const md = [
      "- one **bold**",
      "- two",
      "  - nested a",
      "  - nested b",
      "- three",
      "",
      "1. first",
      "2. second",
    ].join("\n");

    const post = markdownToPost(md);
    const [bullets, ordered] = post.blocks;
    if (bullets.type !== "list" || ordered.type !== "list") throw new Error("expected lists");
    expect(bullets.style).toBe("bullet");
    expect(bullets.items).toHaveLength(3);
    expect(bullets.items[0].html).toBe("one <strong>bold</strong>");
    expect(bullets.items[1].html).toContain("<ul><li>nested a</li><li>nested b</li></ul>");
    expect(ordered.style).toBe("ordered");
    expect(ordered.items.map((i) => i.html)).toEqual(["first", "second"]);
  });

  it("maps GitHub-style callouts, images, fences, and quote attribution", () => {
    const md = [
      "> [!WARNING]",
      "> Do not do the thing.",
      "",
      "![A skyline](https://example.com/sky.png \"Night view\")",
      "",
      "```js",
      "const x = 1 < 2;",
      "```",
      "",
      "> Stay hungry.",
      "> - Steve",
    ].join("\n");

    const post = markdownToPost(md);
    expect(post.blocks[0]).toEqual({
      type: "callout",
      kind: "warning",
      html: "<p>Do not do the thing.</p>",
    });
    expect(post.blocks[1]).toEqual({
      type: "image",
      url: "https://example.com/sky.png",
      alt: "A skyline",
      caption: "Night view",
    });
    const pre = post.blocks[2];
    if (pre.type !== "custom_html") throw new Error("expected custom_html");
    expect(pre.html).toContain('<pre><code class="language-js">');
    expect(pre.html).toContain("const x = 1 &lt; 2;");
    expect(post.blocks[3]).toEqual({
      type: "quote",
      text: "Stay hungry.",
      attribution: "Steve",
    });
  });

  it("routes raw HTML islands through the HTML converter", () => {
    const md = [
      "Intro paragraph.",
      "",
      '<div class="stat-grid"><span>42</span></div>',
      "",
      "Outro.",
    ].join("\n");

    const post = markdownToPost(md);
    expect(post.blocks.map((b) => b.type)).toEqual(["paragraph", "custom_html", "paragraph"]);
    const custom = post.blocks[1];
    if (custom.type !== "custom_html") throw new Error("expected custom_html");
    expect(custom.html).toContain('class="stat-grid"');
  });

  it("derives description and read minutes when absent", () => {
    const post = markdownToPost("# T\n\nFirst paragraph here.\n");
    expect(post.description).toBe("First paragraph here.");
    expect(post.read_minutes).toBeGreaterThanOrEqual(1);
  });
});

describe("htmlToPost", () => {
  it("maps standard elements to blocks and pulls title/meta", () => {
    const html = `
      <html><head>
        <title>My Post</title>
        <meta name="description" content="Meta desc.">
        <meta property="og:image" content="https://example.com/og.png">
      </head><body>
        <h1>My Post</h1>
        <p>Hello <strong>world</strong>.</p>
        <h3>Section</h3>
        <ul><li>a</li><li><em>b</em></li></ul>
        <figure><img src="https://example.com/i.png" alt="pic"><figcaption>Cap</figcaption></figure>
        <blockquote>Wise words<cite>Someone</cite></blockquote>
        <table><thead><tr><th>H1</th><th>H2</th></tr></thead>
          <tbody><tr><td>a</td><td>b</td></tr></tbody></table>
        <hr>
        <div class="widget"><canvas></canvas></div>
      </body></html>`;

    const post = htmlToPost(html);
    expect(post.title).toBe("My Post");
    expect(post.description).toBe("Meta desc.");
    expect(post.hero_image_url).toBe("https://example.com/og.png");
    // Leading h1 duplicating the title is dropped
    expect(post.blocks.map((b) => b.type)).toEqual([
      "paragraph", "heading", "list", "image", "quote", "table", "divider", "custom_html",
    ]);
    expect(post.blocks[1]).toMatchObject({ level: 3, text: "Section" });
    expect(post.blocks[3]).toMatchObject({ url: "https://example.com/i.png", alt: "pic", caption: "Cap" });
    expect(post.blocks[4]).toMatchObject({ text: "Wise words", attribution: "Someone" });
    expect(post.blocks[5]).toMatchObject({ headers: ["H1", "H2"], rows: [["a", "b"]] });
    const widget = post.blocks[7];
    if (widget.type !== "custom_html") throw new Error("expected custom_html");
    expect(widget.html).toContain('class="widget"');
  });

  it("recurses through plain wrapper divs and merges details into an FAQ", () => {
    const html = `
      <div>
        <p>Wrapped.</p>
        <details><summary>Q1?</summary><p>A1.</p></details>
        <details><summary>Q2?</summary><p>A2.</p></details>
      </div>`;

    const post = htmlToPost(html);
    expect(post.blocks.map((b) => b.type)).toEqual(["paragraph", "faq"]);
    const faq = post.blocks[1];
    if (faq.type !== "faq") throw new Error("expected faq");
    expect(faq.items).toEqual([
      { q: "Q1?", a: "A1." },
      { q: "Q2?", a: "A2." },
    ]);
  });

  it("clamps h1/h5/h6 into the 2-4 heading range", () => {
    const post = htmlToPost("<p>x</p><h1>One</h1><h5>Five</h5><h6>Six</h6>");
    const levels = post.blocks.filter((b) => b.type === "heading").map((b) => b.type === "heading" && b.level);
    expect(levels).toEqual([2, 4, 4]);
  });
});

describe("htmlToPost normalization", () => {
  it("descends into classed wrappers and isolates a widget (e.g. image slider) in place", () => {
    const html = `
      <div class="page-wrap">
        <div class="content-col">
          <h2>Intro</h2>
          <p>Before the slider.</p>
          <div class="ba-slider" data-slider>
            <img src="/before.png"><img src="/after.png">
            <button class="handle">drag</button>
          </div>
          <p>After the slider.</p>
        </div>
      </div>`;

    const post = htmlToPost(html);
    expect(post.blocks.map((b) => b.type)).toEqual([
      "heading", "paragraph", "custom_html", "paragraph",
    ]);
    const slider = post.blocks[2];
    if (slider.type !== "custom_html") throw new Error("expected custom_html");
    expect(slider.html).toContain('class="ba-slider"');
    expect(slider.html).toContain("/before.png");
    expect(slider.html).toContain("<button");
  });

  it("normalizes inline markup: spans/styles stripped, standard tags kept", () => {
    const html = `
      <p>Keep <b>bold</b>, <span style="color:red">unwrap span</span>,
         <a href="/x" class="fancy" style="font-weight:bold">link</a> and <code>code</code>.</p>`;

    const post = htmlToPost(html);
    const p = post.blocks[0];
    if (p.type !== "paragraph") throw new Error("expected paragraph");
    expect(p.html).toBe(
      'Keep <strong>bold</strong>, unwrap span, <a href="/x">link</a> and <code>code</code>.',
    );
  });

  it("prefers <article> content and drops nav/header/footer chrome", () => {
    const html = `
      <body>
        <nav><a href="/">Home</a><a href="/blog">Blog</a></nav>
        <header><img src="/logo.png"></header>
        <article><p>The actual content.</p></article>
        <footer><p>Copyright</p></footer>
      </body>`;

    const post = htmlToPost(html);
    expect(post.blocks).toEqual([{ type: "paragraph", html: "The actual content." }]);
  });

  it("keeps a lone-image wrapper as an image block and nested lists inside items", () => {
    const html = `
      <p>x</p>
      <div class="img-wrap"><img src="/hero.png" alt="Hero"></div>
      <ul><li>top <b>one</b><ul><li>sub</li></ul></li><li>two</li></ul>`;

    const post = htmlToPost(html);
    expect(post.blocks[1]).toMatchObject({ type: "image", url: "/hero.png", alt: "Hero" });
    const list = post.blocks[2];
    if (list.type !== "list") throw new Error("expected list");
    expect(list.items[0].html).toBe("top <strong>one</strong><ul><li>sub</li></ul>");
    expect(list.items[1].html).toBe("two");
  });

  it("maps button-styled anchors to CTA blocks", () => {
    const post = htmlToPost(
      '<p>x</p><a class="btn btn-primary" href="/register">Register Now</a>',
    );
    expect(post.blocks[1]).toEqual({ type: "cta", label: "Register Now", href: "/register" });
  });

  it("keeps classed text-only containers verbatim as custom_html", () => {
    const post = htmlToPost('<p>x</p><div class="stat-grid"><span>42</span><span>launches</span></div>');
    const stat = post.blocks[1];
    if (stat.type !== "custom_html") throw new Error("expected custom_html");
    expect(stat.html).toContain('class="stat-grid"');
  });
});

describe("importPostFile", () => {
  it("dispatches by extension and rejects unknown types", () => {
    expect(importPostFile("a.md", "# Hi\n\nBody.").title).toBe("Hi");
    expect(importPostFile("a.html", "<h1>Hi</h1><p>Body.</p>").title).toBe("Hi");
    expect(() => importPostFile("a.docx", "")).toThrow(/Unsupported/);
  });
});
