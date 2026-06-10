import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";

/**
 * Diagnostic page for the iOS double-tap bug. Bare bones: no
 * TooltipProvider, no Helmet, no Tailwind hover classes, no fixed
 * headers, no third-party scripts. Each button logs which tap count
 * triggered the click so we can see if iOS is firing click on the
 * first or second tap.
 *
 * Renders below all App.tsx providers (it's a Route child), but
 * deliberately avoids inheriting any inline styles or transforms.
 *
 * If single-tap fires here on iOS, the bug lives somewhere in the
 * home-page render tree (SiteHeader / Index sections / etc.).
 * If even THIS needs double-tap, the bug lives in the global app
 * shell or is browser/device specific.
 */
export default function TapTest() {
  const [counts, setCounts] = useState({ a: 0, b: 0, c: 0, d: 0 });

  const bump = (key: keyof typeof counts) =>
    setCounts((prev) => ({ ...prev, [key]: prev[key] + 1 }));

  return (
    <div
      style={{
        padding: "2rem",
        paddingTop: "8rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "#fff",
        color: "#000",
        minHeight: "100vh",
      }}
    >
      {/* Bisection step 2: include the site header on this page. If
          taps now need to double, the header (fixed + backdrop-filter
          blur, known iOS bug surface) is the culprit. */}
      <SiteHeader theme="light" onToggleTheme={() => {}} stage={0} />
      <h1 style={{ marginBottom: "1rem" }}>iOS Tap Test (with SiteHeader)</h1>
      <p style={{ marginBottom: "2rem", maxWidth: "40rem" }}>
        Tap each button once. The counter next to it should increment by 1.
        If you need to tap twice, the iOS double-tap bug is in the global
        app shell, not in the home-page code.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => bump("a")}
            style={{
              padding: "1rem 1.5rem",
              fontSize: "1rem",
              background: "#3B82F6",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
            }}
          >
            A: Plain button, no styles beyond color
          </button>
          <span style={{ fontFamily: "monospace" }}>count: {counts.a}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => bump("b")}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
            style={{
              padding: "1rem 1.5rem",
              fontSize: "1rem",
              background: "#10B981",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              transition: "transform 180ms ease",
            }}
          >
            B: onMouseEnter transform, like our headers
          </button>
          <span style={{ fontFamily: "monospace" }}>count: {counts.b}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              bump("c");
            }}
            style={{
              padding: "1rem 1.5rem",
              fontSize: "1rem",
              background: "#8B5CF6",
              color: "#fff",
              borderRadius: "0.5rem",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            C: Plain anchor tag
          </a>
          <span style={{ fontFamily: "monospace" }}>count: {counts.c}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => bump("d")}
            style={{
              padding: "1rem 1.5rem",
              fontSize: "1rem",
              background: "#F59E0B",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
            }}
            onPointerDown={() => console.log("pointerdown")}
            onTouchStart={() => console.log("touchstart")}
          >
            D: Plain button with pointerdown/touchstart logging
          </button>
          <span style={{ fontFamily: "monospace" }}>count: {counts.d}</span>
        </div>
      </div>

      <p style={{ marginTop: "3rem", fontSize: "0.875rem", color: "#666" }}>
        build: {typeof __BUILD_SHA__ !== "undefined" ? __BUILD_SHA__ : "dev"}
      </p>
    </div>
  );
}
