import { useMemo, useState, type FormEvent } from "react";
import Header from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageMeta from "@/components/PageMeta";
import { supabase } from "@/lib/supabase";
import "@/styles/vibesprint.css";
import "@/styles/sprintfeedback.css";

/**
 * Sprint feedback survey (/sprintfeedback). Posts to the
 * submit-sprint-feedback edge function, which stores the answers in
 * sprint_feedback and emails them to contact@peoplebrowsr.com.
 * Not linked from the nav — shared directly with sprinters.
 */

const SUBMITTED_OPTIONS = [
  "Yes, I submitted",
  "I started but didn't finish",
  "I registered but didn't start",
];

const BLOCKER_OPTIONS = [
  "Not enough time",
  "The brief/ask was unclear",
  "Technical issues with the Domains.Kred API",
  "Ran out of Lovable build credits",
  "Didn't have the coding/design skills I needed",
  "Lost interest partway through",
];

const SUPPORT_OPTIONS = [
  "Yes, and it helped",
  "Yes, but it didn't help much",
  "No, I didn't need to",
  "No, but I wish I had (bad timing, didn't know about it, etc.)",
];

const EXAMPLE_OPTIONS = [
  "Yes, I remixed one directly",
  "Yes, just to look at as a reference",
  "No, I built from scratch",
  "No, I didn't know they were there",
];

function Scale({
  name,
  value,
  onChange,
  min,
  max,
  minLabel,
  maxLabel,
}: {
  name: string;
  value: number | null;
  onChange: (n: number) => void;
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
}) {
  const values = [];
  for (let i = min; i <= max; i++) values.push(i);
  return (
    <div>
      <div className="scale" role="group" aria-label={name}>
        {values.map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={value === v}
            onClick={() => onChange(v)}
          >
            {v}
          </button>
        ))}
      </div>
      <div className="scale-ends">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

export default function SprintFeedback() {
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (document.documentElement.getAttribute("data-theme") as "dark" | "light") || "dark"
  );
  const stage = useMemo(() => Number(localStorage.getItem("nftnyc-stage") ?? 0), []);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const [email, setEmail] = useState("");
  const [overall, setOverall] = useState<number | null>(null);
  const [submittedProject, setSubmittedProject] = useState("");
  const [blockers, setBlockers] = useState<string[]>([]);
  const [blockersOther, setBlockersOther] = useState("");
  const [kitClarity, setKitClarity] = useState<number | null>(null);
  const [kitComments, setKitComments] = useState("");
  const [support, setSupport] = useState("");
  const [apiRating, setApiRating] = useState<number | null>(null);
  const [apiFriction, setApiFriction] = useState("");
  const [exampleApps, setExampleApps] = useState("");
  const [nps, setNps] = useState<number | null>(null);

  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const showBlockers = submittedProject !== "" && submittedProject !== SUBMITTED_OPTIONS[0];

  const toggleBlocker = (label: string) =>
    setBlockers((prev) =>
      prev.includes(label) ? prev.filter((b) => b !== label) : [...prev, label]
    );

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (overall === null) {
      setFormError("Please rate your overall Sprint experience.");
      return;
    }
    if (!submittedProject) {
      setFormError("Please tell us whether you submitted a project.");
      return;
    }
    setSending(true);
    setFormError(null);
    try {
      const { data, error } = await supabase.functions.invoke("submit-sprint-feedback", {
        body: {
          sprint: "sprint1",
          email: email.trim(),
          overall_rating: overall,
          submitted_project: submittedProject,
          blockers: showBlockers ? blockers : [],
          blockers_other: showBlockers ? blockersOther.trim() : "",
          kit_clarity: kitClarity,
          kit_comments: kitComments.trim(),
          support_session: support,
          api_rating: apiRating,
          api_friction: apiFriction.trim(),
          example_apps: exampleApps,
          next_sprint_nps: nps,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    } catch (err) {
      console.error("Sprint feedback failed:", err);
      setFormError(
        err instanceof Error && err.message
          ? err.message
          : "We couldn't save your feedback. Please try again, or email team@nft.nyc."
      );
      setSending(false);
      return;
    }
    setSending(false);
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      data-theme={theme}
      style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)" }}
    >
      <PageMeta page="sprintfeedback" />
      <Header theme={theme} onToggleTheme={toggleTheme} stage={stage} />

      <div className="vibesprint sprintfeedback">
        <div className="wrap" style={{ paddingTop: 96, maxWidth: 760 }}>
          <section id="feedback">
            <h1>Sprint feedback</h1>
            <p className="lead">
              Two minutes, and it shapes the next Sprint. Tell us what worked, what got in the way,
              and what you'd change. Every answer except the first two is optional.
            </p>

            {done ? (
              <div className="success" role="status">
                <b>Thank you.</b> Your feedback is in, and it goes straight to the team planning the
                next Sprint.
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate style={{ display: "block" }}>
                <div className="qcard">
                  <p className="q">1. Overall, how would you rate your Sprint experience?</p>
                  <Scale
                    name="Overall experience"
                    value={overall}
                    onChange={setOverall}
                    min={1}
                    max={5}
                    minLabel="1 — Poor"
                    maxLabel="5 — Excellent"
                  />
                </div>

                <div className="qcard">
                  <p className="q">2. Did you submit a project for this Sprint?</p>
                  <div className="opts">
                    {SUBMITTED_OPTIONS.map((o) => (
                      <label className="opt" key={o}>
                        <input
                          type="radio"
                          name="submitted"
                          value={o}
                          checked={submittedProject === o}
                          onChange={() => setSubmittedProject(o)}
                        />
                        <span>{o}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {showBlockers && (
                  <div className="qcard">
                    <p className="q">3. What stopped you from finishing or starting?</p>
                    <p className="hint">Select all that apply.</p>
                    <div className="opts">
                      {BLOCKER_OPTIONS.map((o) => (
                        <label className="opt" key={o}>
                          <input
                            type="checkbox"
                            checked={blockers.includes(o)}
                            onChange={() => toggleBlocker(o)}
                          />
                          <span>{o}</span>
                        </label>
                      ))}
                    </div>
                    <div className="sub">
                      <p className="q">Other</p>
                      <textarea
                        value={blockersOther}
                        maxLength={2000}
                        onChange={(e) => setBlockersOther(e.target.value)}
                        placeholder="Anything else that got in the way"
                      />
                    </div>
                  </div>
                )}

                <div className="qcard">
                  <p className="q">
                    4. How clear was your Sprint kit (what you needed to build and submit)?
                  </p>
                  <Scale
                    name="Kit clarity"
                    value={kitClarity}
                    onChange={setKitClarity}
                    min={1}
                    max={5}
                    minLabel="1 — Unclear"
                    maxLabel="5 — Very clear"
                  />
                  <div className="sub">
                    <p className="q">Anything in the kit that was confusing or missing? (optional)</p>
                    <textarea
                      value={kitComments}
                      maxLength={2000}
                      onChange={(e) => setKitComments(e.target.value)}
                    />
                  </div>
                </div>

                <div className="qcard">
                  <p className="q">5. Did you join a live engineer support session?</p>
                  <div className="opts">
                    {SUPPORT_OPTIONS.map((o) => (
                      <label className="opt" key={o}>
                        <input
                          type="radio"
                          name="support"
                          value={o}
                          checked={support === o}
                          onChange={() => setSupport(o)}
                        />
                        <span>{o}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="qcard">
                  <p className="q">6. How was working with the Domains.Kred API and docs?</p>
                  <Scale
                    name="API and docs"
                    value={apiRating}
                    onChange={setApiRating}
                    min={1}
                    max={5}
                    minLabel="1 — Painful"
                    maxLabel="5 — Smooth"
                  />
                  <div className="sub">
                    <p className="q">
                      What was the biggest friction point with the API or docs, if any? (optional)
                    </p>
                    <textarea
                      value={apiFriction}
                      maxLength={2000}
                      onChange={(e) => setApiFriction(e.target.value)}
                    />
                  </div>
                </div>

                <div className="qcard">
                  <p className="q">7. Did you use the example app(s) provided in your kit?</p>
                  <div className="opts">
                    {EXAMPLE_OPTIONS.map((o) => (
                      <label className="opt" key={o}>
                        <input
                          type="radio"
                          name="examples"
                          value={o}
                          checked={exampleApps === o}
                          onChange={() => setExampleApps(o)}
                        />
                        <span>{o}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="qcard">
                  <p className="q">8. How likely are you to join the next Sprint?</p>
                  <Scale
                    name="Likelihood to join the next Sprint"
                    value={nps}
                    onChange={setNps}
                    min={0}
                    max={10}
                    minLabel="0 — Not at all likely"
                    maxLabel="10 — Extremely likely"
                  />
                </div>

                <div className="qcard">
                  <p className="q">Your email (optional)</p>
                  <p className="hint">
                    Only if you're happy for us to follow up on anything you've written.
                  </p>
                  <input
                    type="email"
                    value={email}
                    autoComplete="email"
                    maxLength={255}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>

                <div className="form-actions">
                  <button className="btn" type="submit" disabled={sending}>
                    {sending ? "Sending…" : "Send feedback"}
                  </button>
                  <span className="form-note">
                    Takes about two minutes. Answers go to the Flash Sprints team.
                  </span>
                </div>
                {formError && (
                  <p className="form-note" role="alert" style={{ marginTop: 10, color: "#F15621" }}>
                    {formError}
                  </p>
                )}
              </form>
            )}
          </section>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
