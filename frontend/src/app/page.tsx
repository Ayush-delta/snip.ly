"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import QRCodeComponent from "@/components/QRCode";
import TypewriterText from "@/components/TypewriterText";
import HeroPreview from "@/components/HeroPreview";
import AnimatedCounter from "@/components/AnimatedCounter";

const FEATURES = [
  { icon: "⚡", title: "Redis Cached", desc: "Sub-10ms redirects with 1-hour cache TTL", color: "var(--accent)" },
  { icon: "📺", title: "CTA Overlay", desc: "Embed your branded call-to-action on any page you share", color: "var(--accent2)" },
  { icon: "🌍", title: "Geo Analytics", desc: "Country-level click tracking via IP geolocation", color: "var(--accent3)" },
  { icon: "🔐", title: "Secure Auth", desc: "JWT access tokens + httpOnly refresh cookie rotation", color: "var(--warn)" },
  { icon: "📊", title: "Deep Analytics", desc: "Clicks, devices, browsers, countries — all in one dashboard", color: "var(--red)" },
  { icon: "📷", title: "QR Codes", desc: "Auto-generated, downloadable QR for every short link", color: "#89b4fa" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Paste your long URL",
    desc: "Drop any URL into the input. Add a custom alias or let us generate one for you.",
    accent: "var(--accent)",
  },
  {
    step: "02",
    title: "Add your CTA (optional)",
    desc: "Overlay your brand's message and button on any destination page — no code needed.",
    accent: "var(--accent2)",
  },
  {
    step: "03",
    title: "Share & track everything",
    desc: "Every click is logged. Open your dashboard for real-time geo, device, and browser analytics.",
    accent: "var(--accent3)",
  },
];

export default function HomePage() {
  const { user, getToken } = useAuth();

  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [result, setResult] = useState<{ shortUrl: string; code: string; original: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  async function handleShorten(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setResult(null); setLoading(true); setCopied(false); setShowQR(false);
    try {
      const token = await getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/shorten`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ url, customCode: customCode || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to shorten URL");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    if (!result) return;
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main style={{ position: "relative", zIndex: 1 }}>
      {/* ── Nav ── */}
      <nav style={{ borderBottom: "1px solid var(--border)", background: "rgba(7,7,16,0.85)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div style={{ fontFamily: "var(--font-syne)", color: "var(--accent)" }} className="text-xl font-black">
            snip<span style={{ color: "var(--accent2)" }}>.</span>ly
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span style={{ color: "var(--muted)", fontSize: 12 }}>Hey, {user.name || user.email}</span>
                <Link href="/dashboard" style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", color: "var(--accent)", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700 }}>
                  My Links →
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" style={{ color: "var(--muted)", fontSize: 12 }}>Sign in</Link>
                <Link href="/register" style={{ background: "var(--accent)", color: "#000", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 800, fontFamily: "var(--font-syne)" }}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <div style={{ background: "rgba(0,229,255,0.07)", border: "1px solid rgba(0,229,255,0.18)", color: "var(--accent)", borderRadius: 100, display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", animation: "pulse 1.5s infinite" }} />
              AI-Powered • Real-time Analytics
            </div>

            <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(36px,5.5vw,60px)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: 16 }}>
              Shorten.<br />
              <span style={{ color: "var(--accent2)" }}>Overlay.</span> Track.<br />
              <span style={{ color: "var(--accent)" }}>
                <TypewriterText words={["Every click.", "Every link.", "Every campaign."]} />
              </span>
            </h1>

            <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.75, marginBottom: 32, maxWidth: 460 }}>
              Shorten any URL, embed your branded call-to-action on the destination page, and track every click with real-time geo, device, and browser analytics.
            </p>

            {/* ── Shorten form ── */}
            <form onSubmit={handleShorten}>
              <div className="input-glow" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: 4, display: "flex", alignItems: "center", gap: 8, marginBottom: 10, transition: "all 0.2s" }}>
                <span style={{ color: "var(--muted)", paddingLeft: 12, fontSize: 14 }}>🔗</span>
                <input
                  type="url" required
                  placeholder="Paste your long URL..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: 13, padding: "12px 4px" }}
                />
                <button type="submit" disabled={loading} style={{ background: loading ? "rgba(0,229,255,0.15)" : "var(--accent)", color: loading ? "var(--muted)" : "#000", border: "none", borderRadius: 10, padding: "10px 20px", fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 13, cursor: loading ? "not-allowed" : "pointer", flexShrink: 0, display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}>
                  {loading ? (<><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" /></svg>Shortening</>) : "Shorten →"}
                </button>
              </div>

              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 10, display: "flex", alignItems: "center", gap: 8, padding: "9px 14px" }}>
                <span style={{ color: "var(--muted)", fontSize: 11 }}>Custom alias (optional):</span>
                <span style={{ color: "var(--muted)", fontSize: 11 }}>snip.ly/</span>
                <input
                  type="text" placeholder="my-link" value={customCode} maxLength={12}
                  onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--accent3)", fontFamily: "var(--font-mono)", fontSize: 12 }}
                />
              </div>
            </form>

            {!user && (
              <p style={{ color: "var(--muted)", fontSize: 11, marginTop: 10 }}>
                ✦ Free forever · No account required to shorten ·{" "}
                <Link href="/register" style={{ color: "var(--accent)" }}>Sign up</Link> to save links &amp; add CTAs
              </p>
            )}

            {/* Error */}
            {error && (
              <div style={{ background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.25)", color: "var(--red)", borderRadius: 10, padding: "12px 16px", marginTop: 12, fontSize: 13 }}>
                ⚠ {error}
              </div>
            )}

            {/* Result */}
            {result && (
              <div style={{ background: "var(--card)", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 14, marginTop: 14, overflow: "hidden" }}>
                <div style={{ background: "rgba(0,229,255,0.04)", borderBottom: "1px solid rgba(0,229,255,0.1)", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--accent3)", fontFamily: "var(--font-syne)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>✓ Link Created</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setShowQR(!showQR)} style={{ background: "rgba(191,95,255,0.1)", border: "1px solid rgba(191,95,255,0.2)", color: "var(--accent2)", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                      {showQR ? "Hide QR" : "QR Code"}
                    </button>
                    <Link href={`/dashboard/${result.code}`} style={{ background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", color: "var(--accent)", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700 }}>
                      Analytics + CTA →
                    </Link>
                  </div>
                </div>
                <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {result.shortUrl}
                  </span>
                  <button onClick={copyToClipboard} style={{ background: copied ? "rgba(0,255,157,0.1)" : "rgba(0,229,255,0.08)", border: `1px solid ${copied ? "rgba(0,255,157,0.3)" : "rgba(0,229,255,0.2)"}`, color: copied ? "var(--accent3)" : "var(--accent)", borderRadius: 8, padding: "7px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", flexShrink: 0, fontFamily: "var(--font-syne)" }}>
                    {copied ? "✓ Copied!" : "Copy"}
                  </button>
                </div>
                <div style={{ borderTop: "1px solid var(--border)", padding: "8px 16px" }}>
                  <p style={{ color: "var(--muted)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>↳ {result.original}</p>
                </div>
                {showQR && (
                  <div style={{ borderTop: "1px solid var(--border)", padding: "20px", display: "flex", justifyContent: "center" }}>
                    <QRCodeComponent value={result.shortUrl} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right — animated preview */}
          <div className="hidden md:flex justify-center">
            <div style={{ animation: "fadeUp 0.9s 0.2s ease both", filter: "drop-shadow(0 32px 48px rgba(0,229,255,0.08))" }}>
              <HeroPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.015)" }}>
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Active Marketers", value: 100000, suffix: "+" },
            { label: "Links Shortened", value: 85000000, suffix: "M+" },
            { label: "Clicks Tracked", value: 268000000, suffix: "M+" },
            { label: "Avg Redirect", value: 10, suffix: "ms" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontFamily: "var(--font-syne)", fontSize: 28, fontWeight: 900, color: "var(--accent)" }}>
                <AnimatedCounter target={s.label === "Avg Redirect" ? s.value : Math.round(s.value / (s.suffix.includes("M") ? 1000000 : 1000))} suffix={s.suffix} />
              </div>
              <div style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p style={{ color: "var(--accent)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>How it works</p>
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(24px,4vw,42px)", fontWeight: 900, letterSpacing: "-0.02em" }}>Three steps to smarter links</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.step} className="glow-card" style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 24px" }}>
              <div style={{ fontFamily: "var(--font-syne)", fontSize: 42, fontWeight: 900, color: step.accent, opacity: 0.2, lineHeight: 1, marginBottom: 16 }}>{step.step}</div>
              <h3 style={{ fontFamily: "var(--font-syne)", fontSize: 16, fontWeight: 700, marginBottom: 10, color: step.accent }}>{step.title}</h3>
              <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="features" style={{ borderTop: "1px solid var(--border)" }} className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p style={{ color: "var(--accent2)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>Built for scale</p>
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(24px,4vw,42px)", fontWeight: 900, letterSpacing: "-0.02em" }}>Everything you need</h2>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="glow-card" style={{ background: "rgba(20,20,42,0.6)", border: "1px solid var(--border)", borderRadius: 14, padding: "22px 20px", backdropFilter: "blur(8px)" }}>
              <div style={{ fontSize: 26, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "var(--font-syne)", fontSize: 14, fontWeight: 700, color: f.color, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BOTTOM BANNER ── */}
      <section style={{ borderTop: "1px solid var(--border)", background: "linear-gradient(135deg, rgba(0,229,255,0.04) 0%, rgba(191,95,255,0.04) 100%)" }}>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(26px,4vw,44px)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 12 }}>
            Start shortening in <span style={{ color: "var(--accent)" }}>10 seconds</span>
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 28 }}>No credit card. No friction. Just results.</p>
          <Link href="/register" style={{ background: "var(--accent)", color: "#000", fontFamily: "var(--font-syne)", fontWeight: 900, borderRadius: 12, padding: "14px 32px", fontSize: 15, display: "inline-block" }}>
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#11141e", padding: "60px 0 40px", borderTop: "1px solid var(--border)" }}>
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center">
          {/* Logo */}
          <div style={{ fontFamily: "var(--font-syne)", color: "#fff", fontSize: 28, fontWeight: 900, marginBottom: 40, display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM7.5 9.5C7.5 8.395 8.395 7.5 9.5 7.5H11V5.5H9.5C7.291 5.5 5.5 7.291 5.5 9.5C5.5 11.709 7.291 13.5 9.5 13.5H11V11.5H9.5C8.395 11.5 7.5 10.605 7.5 9.5ZM14.5 10.5H13V12.5H14.5C15.605 12.5 16.5 13.395 16.5 14.5C16.5 15.605 15.605 16.5 14.5 16.5H13V18.5H14.5C16.709 18.5 18.5 16.709 18.5 14.5C18.5 12.291 16.709 10.5 14.5 10.5Z" fill="white"/>
            </svg>
            snip.ly
          </div>

          {/* Divider */}
          <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 40 }}></div>

          {/* Links Grid */}
          <div className="w-full flex justify-center gap-32 md:gap-48 mb-20 text-center">
            <div className="flex flex-col gap-5">
              <h4 style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Product</h4>
              <Link href="/features" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", transition: "color 0.2s" }} className="hover:text-white">Features</Link>
            </div>
            <div className="flex flex-col gap-5">
              <h4 style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 4 }}>Resources</h4>
              <Link href="/support" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", transition: "color 0.2s" }} className="hover:text-white">Support</Link>
              <Link href="/privacy" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", transition: "color 0.2s" }} className="hover:text-white">Privacy Policy</Link>
              <Link href="/terms" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", transition: "color 0.2s" }} className="hover:text-white">Terms of Service</Link>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex gap-8 mb-8">
            <a href="#" aria-label="Facebook" style={{ color: "rgba(255,255,255,0.4)", transition: "color 0.2s" }} className="hover:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.324V1.325C24 .597 23.403 0 22.675 0z"/></svg>
            </a>
            <a href="#" aria-label="Twitter" style={{ color: "rgba(255,255,255,0.4)", transition: "color 0.2s" }} className="hover:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" aria-label="Instagram" style={{ color: "rgba(255,255,255,0.4)", transition: "color 0.2s" }} className="hover:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="#" aria-label="Email" style={{ color: "rgba(255,255,255,0.4)", transition: "color 0.2s" }} className="hover:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3v18h24v-18h-24zm6.623 7.928l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.928h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z"/></svg>
            </a>
          </div>

          {/* Copyright */}
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>
            Copyright © {new Date().getFullYear()} Sniply.
          </div>
        </div>
      </footer>
    </main>
  );
}
