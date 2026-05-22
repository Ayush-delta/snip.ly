import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = {
  title: "Support - Snip.ly",
};

export default function SupportPage() {
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
        <h1 className="text-[28px] font-medium text-[#1a1a18] tracking-[-0.5px] mb-8">
          Support &amp; Help Center
        </h1>
        
        {/* Assistance Info Card */}
        <div className="bg-[#f7f7f5] border border-05 border-default rounded-[12px] p-6 mb-10 flex flex-col items-start gap-4">
          <h2 className="text-[16px] font-medium text-[#185FA5]">Need immediate assistance?</h2>
          <p className="text-[13px] text-[#5a5a56] leading-[1.6]">
            Our support team is available Monday through Friday, 9am - 5pm EST. We typically respond to all inquiries within 24 hours.
          </p>
          <a
            href="mailto:ayush.root@zohomail.in"
            className="inline-block bg-[#185FA5] text-[#E6F1FB] hover:bg-[#0C447C] px-5 py-2 rounded-[8px] text-[13px] font-medium transition-colors"
          >
            Email Support
          </a>
        </div>

        {/* FAQs */}
        <div className="space-y-8">
          <h3 className="text-[16px] font-medium text-[#1a1a18]">Frequently Asked Questions</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-[13px] font-medium text-[#1a1a18] mb-1.5">How do I change my destination URL?</h4>
              <p className="text-[13px] text-[#5a5a56] leading-[1.6]">
                Currently, short links are permanent once created to ensure link integrity. If you made a mistake, please generate a new short link.
              </p>
            </div>
            
            <div>
              <h4 className="text-[13px] font-medium text-[#1a1a18] mb-1.5">How does the CTA Overlay work?</h4>
              <p className="text-[13px] text-[#5a5a56] leading-[1.6]">
                When you add a CTA overlay, we embed the target URL in an iframe and render your custom message on top of it. Note that some high-security websites (like banks or Google) set headers that prevent iframing.
              </p>
            </div>

            <div>
              <h4 className="text-[13px] font-medium text-[#1a1a18] mb-1.5">Are my analytics real-time?</h4>
              <p className="text-[13px] text-[#5a5a56] leading-[1.6]">
                Yes! All clicks, geographic data, and device information are logged instantly and will appear on your dashboard when you refresh the page.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
