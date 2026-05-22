import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = {
  title: "Terms of Service - Snip.ly",
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-white text-[#1a1a18] relative z-10">
      {/* Nav */}
      <nav className="h-[52px] bg-white border-b border-05 border-default sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo />
          </Link>
          <Link href="/" className="text-[13px] text-[#5a5a56] hover:text-[#1a1a18] transition-colors font-medium">
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-[28px] font-medium text-[#1a1a18] tracking-[-0.5px] mb-2">
          Terms of Service
        </h1>
        <p className="text-[12px] text-[#9a9a96] mb-10">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-[14px] text-[#1a1a18] leading-[1.7]">
          <div>
            <h2 className="text-[16px] font-medium text-[#185FA5] mb-3">1. Acceptance of Terms</h2>
            <p className="text-[#5a5a56]">
              By accessing or using Snip.ly, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our service.
            </p>
          </div>

          <div>
            <h2 className="text-[16px] font-medium text-[#185FA5] mb-3">2. Use of Service</h2>
            <p className="mb-3 text-[#5a5a56]">You agree not to use Snip.ly to:</p>
            <ul className="list-disc pl-6 space-y-2 text-[#5a5a56]">
              <li>Shorten links to malicious, illegal, or spam content.</li>
              <li>Distribute malware, phishing attempts, or illegal materials.</li>
              <li>Attempt to bypass our rate limits or abuse our APIs.</li>
            </ul>
            <p className="mt-3 text-[#5a5a56]">
              We reserve the right to remove any link or ban any user that violates these terms without prior notice.
            </p>
          </div>

          <div>
            <h2 className="text-[16px] font-medium text-[#185FA5] mb-3">3. Intellectual Property</h2>
            <p className="text-[#5a5a56]">
              The Snip.ly service and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </div>

          <div>
            <h2 className="text-[16px] font-medium text-[#185FA5] mb-3">4. Limitation of Liability</h2>
            <p className="text-[#5a5a56]">
              In no event shall Snip.ly, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
