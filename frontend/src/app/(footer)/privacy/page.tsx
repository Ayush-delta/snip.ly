import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = {
  title: "Privacy Policy - Snip.ly",
};

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-[12px] text-[#9a9a96] mb-10">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-[14px] text-[#1a1a18] leading-[1.7]">
          <div>
            <h2 className="text-[16px] font-medium text-[#185FA5] mb-3">1. Information We Collect</h2>
            <p className="mb-3 text-[#5a5a56]">We collect two types of information when you use Snip.ly:</p>
            <ul className="list-disc pl-6 space-y-2 text-[#5a5a56]">
              <li><strong>Account Information:</strong> When you register, we collect your name, email address, and authentication credentials.</li>
              <li><strong>Link Analytics:</strong> When a user clicks on a shortened link, we collect their IP address, browser type, device type, and geographic location to provide analytics to the link creator.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-[16px] font-medium text-[#185FA5] mb-3">2. How We Use Information</h2>
            <p className="mb-3 text-[#5a5a56]">The information we collect is used in the following ways:</p>
            <ul className="list-disc pl-6 space-y-2 text-[#5a5a56]">
              <li>To provide, maintain, and improve our services.</li>
              <li>To provide users with detailed analytics on their link performance.</li>
              <li>To communicate with you about your account or our services.</li>
              <li>To detect, prevent, and address technical issues or malicious activity.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-[16px] font-medium text-[#185FA5] mb-3">3. Data Security & Sharing</h2>
            <p className="text-[#5a5a56]">
              We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. 
              We implement a variety of security measures including JWT authentication, httpOnly cookies, and encryption to maintain the safety of your personal information.
            </p>
          </div>

          <div>
            <h2 className="text-[16px] font-medium text-[#185FA5] mb-3">4. Your Rights</h2>
            <p className="text-[#5a5a56]">
              You have the right to access, correct, or delete your personal data. If you wish to delete your account and all associated links and analytics, please contact us at <a href="mailto:ayush.root@zohomail.in" className="text-[#185FA5] hover:underline font-medium">ayush.root@zohomail.in</a>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
