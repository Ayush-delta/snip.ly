import Link from "next/link";

export const metadata = {
  title: "Terms of Service - Snip.ly",
};

export default function TermsOfServicePage() {
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
        <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, marginBottom: 12 }}>
          Terms of Service
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: 40, fontSize: 14 }}>Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-10" style={{ color: "var(--text)", lineHeight: 1.7, fontSize: 15 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 700, marginBottom: 16, color: "var(--accent)" }}>1. Acceptance of Terms</h2>
            <p style={{ color: "var(--muted)" }}>
              By accessing or using Snip.ly, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our service.
            </p>
          </div>

          <div>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 700, marginBottom: 16, color: "var(--accent)" }}>2. Use of Service</h2>
            <p style={{ marginBottom: 12 }}>You agree not to use Snip.ly to:</p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--muted)" }}>
              <li>Shorten links to malicious, illegal, or spam content.</li>
              <li>Distribute malware, phishing attempts, or illegal materials.</li>
              <li>Attempt to bypass our rate limits or abuse our APIs.</li>
            </ul>
            <p style={{ marginTop: 12, color: "var(--muted)" }}>
              We reserve the right to remove any link or ban any user that violates these terms without prior notice.
            </p>
          </div>

          <div>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 700, marginBottom: 16, color: "var(--accent)" }}>3. Intellectual Property</h2>
            <p style={{ color: "var(--muted)" }}>
              The Snip.ly service and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </div>

          <div>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 700, marginBottom: 16, color: "var(--accent)" }}>4. Limitation of Liability</h2>
            <p style={{ color: "var(--muted)" }}>
              In no event shall Snip.ly, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
