import Link from "next/link";

export const metadata = {
  title: "Support - Snip.ly",
};

export default function SupportPage() {
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

      <section className="max-w-3xl mx-auto px-6 py-20">
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, marginBottom: 24 }}>
          Support <span style={{ color: "var(--accent2)" }}>&amp; Help Center</span>
        </h1>
        
        <div style={{ background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.1)", borderRadius: 16, padding: "32px", marginBottom: 40 }}>
          <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 20, fontWeight: 700, color: "var(--accent)", marginBottom: 16 }}>Need immediate assistance?</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.6, marginBottom: 20 }}>
            Our support team is available Monday through Friday, 9am - 5pm EST. We typically respond to all inquiries within 24 hours.
          </p>
          <a href="mailto:ayush.root@zohomail.in" style={{ display: "inline-block", background: "var(--accent)", color: "#000", fontFamily: "var(--font-syne)", fontWeight: 800, padding: "10px 24px", borderRadius: 8 }}>
            Email Support
          </a>
        </div>

        <div className="space-y-12">
          <div>
            <h3 style={{ fontFamily: "var(--font-syne)", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Frequently Asked Questions</h3>
            
            <div className="space-y-8 mt-6">
              <div>
                <h4 style={{ color: "var(--text)", fontWeight: 600, marginBottom: 8 }}>How do I change my destination URL?</h4>
                <p style={{ color: "var(--muted)", lineHeight: 1.6, fontSize: 14 }}>
                  Currently, short links are permanent once created to ensure link integrity. If you made a mistake, please generate a new short link.
                </p>
              </div>
              
              <div>
                <h4 style={{ color: "var(--text)", fontWeight: 600, marginBottom: 8 }}>How does the CTA Overlay work?</h4>
                <p style={{ color: "var(--muted)", lineHeight: 1.6, fontSize: 14 }}>
                  When you add a CTA overlay, we embed the target URL in an iframe and render your custom message on top of it. Note that some high-security websites (like banks or Google) set headers that prevent iframing.
                </p>
              </div>

              <div>
                <h4 style={{ color: "var(--text)", fontWeight: 600, marginBottom: 8 }}>Are my analytics real-time?</h4>
                <p style={{ color: "var(--muted)", lineHeight: 1.6, fontSize: 14 }}>
                  Yes! All clicks, geographic data, and device information are logged instantly and will appear on your dashboard when you refresh the page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
