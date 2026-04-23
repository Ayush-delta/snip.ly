import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - Snip.ly",
};

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: 40, fontSize: 14 }}>Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-10" style={{ color: "var(--text)", lineHeight: 1.7, fontSize: 15 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 700, marginBottom: 16, color: "var(--accent)" }}>1. Information We Collect</h2>
            <p style={{ marginBottom: 12 }}>We collect two types of information when you use Snip.ly:</p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--muted)" }}>
              <li><strong>Account Information:</strong> When you register, we collect your name, email address, and authentication credentials.</li>
              <li><strong>Link Analytics:</strong> When a user clicks on a shortened link, we collect their IP address, browser type, device type, and geographic location to provide analytics to the link creator.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 700, marginBottom: 16, color: "var(--accent)" }}>2. How We Use Information</h2>
            <p style={{ marginBottom: 12 }}>The information we collect is used in the following ways:</p>
            <ul className="list-disc pl-6 space-y-2" style={{ color: "var(--muted)" }}>
              <li>To provide, maintain, and improve our services.</li>
              <li>To provide users with detailed analytics on their link performance.</li>
              <li>To communicate with you about your account or our services.</li>
              <li>To detect, prevent, and address technical issues or malicious activity.</li>
            </ul>
          </div>

          <div>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 700, marginBottom: 16, color: "var(--accent)" }}>3. Data Security & Sharing</h2>
            <p style={{ color: "var(--muted)" }}>
              We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. 
              We implement a variety of security measures including JWT authentication, httpOnly cookies, and encryption to maintain the safety of your personal information.
            </p>
          </div>

          <div>
            <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 700, marginBottom: 16, color: "var(--accent)" }}>4. Your Rights</h2>
            <p style={{ color: "var(--muted)" }}>
              You have the right to access, correct, or delete your personal data. If you wish to delete your account and all associated links and analytics, please contact us at <a href="mailto:ayush.root@zohomail.in" style={{ color: "var(--accent)" }}>ayush.root@zohomail.in</a>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
