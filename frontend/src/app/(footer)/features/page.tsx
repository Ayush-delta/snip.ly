import Link from "next/link";

export const metadata = {
  title: "Features - Snip.ly",
};

const FEATURES = [
  { icon: "⚡", title: "Redis Cached", desc: "Sub-10ms redirects with 1-hour cache TTL", color: "var(--accent)" },
  { icon: "📺", title: "CTA Overlay", desc: "Embed your branded call-to-action on any page you share", color: "var(--accent2)" },
  { icon: "🌍", title: "Geo Analytics", desc: "Country-level click tracking via IP geolocation", color: "var(--accent3)" },
  { icon: "🔐", title: "Secure Auth", desc: "JWT access tokens + httpOnly refresh cookie rotation", color: "var(--warn)" },
  { icon: "📊", title: "Deep Analytics", desc: "Clicks, devices, browsers, countries — all in one dashboard", color: "var(--red)" },
  { icon: "📷", title: "QR Codes", desc: "Auto-generated, downloadable QR for every short link", color: "#89b4fa" },
];

export default function FeaturesPage() {
  return (
    <main style={{ minHeight: "100vh", position: "relative", zIndex: 1 }}>
      <nav style={{ borderBottom: "1px solid var(--border)", background: "rgba(7,7,16,0.85)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" style={{ fontFamily: "var(--font-syne)", color: "var(--accent)" }} className="text-xl font-black">
            snip<span style={{ color: "var(--accent2)" }}>.</span>ly
          </Link>
          <Link href="/" style={{ color: "var(--muted)", fontSize: 13 }} className="hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-20">
          <p style={{ color: "var(--accent2)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>Built for scale</p>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(36px,5vw,54px)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 16 }}>
            Everything you need <br/>to <span style={{ color: "var(--accent)" }}>supercharge</span> your links
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 15, maxWidth: 500, margin: "0 auto" }}>
            Snip.ly goes beyond standard link shortening by offering deep analytics and embedded CTAs to maximize your conversions.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="glow-card" style={{ background: "rgba(20,20,42,0.6)", border: "1px solid var(--border)", borderRadius: 14, padding: "28px 24px", backdropFilter: "blur(8px)" }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "var(--font-syne)", fontSize: 16, fontWeight: 700, color: f.color, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      <section style={{ borderTop: "1px solid var(--border)", background: "linear-gradient(135deg, rgba(0,229,255,0.04) 0%, rgba(191,95,255,0.04) 100%)" }}>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(26px,4vw,44px)", fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 12 }}>
            Start shortening in <span style={{ color: "var(--accent)" }}>10 seconds</span>
          </h2>
          <Link href="/register" style={{ background: "var(--accent)", color: "#000", fontFamily: "var(--font-syne)", fontWeight: 900, borderRadius: 12, padding: "14px 32px", fontSize: 15, display: "inline-block", marginTop: 20 }}>
            Create Free Account →
          </Link>
        </div>
      </section>
    </main>
  );
}
