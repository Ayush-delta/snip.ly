"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";

export default function FeaturesPage() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-white text-[#1a1a18] relative z-10">
      <title>Features - Snip.ly</title>
      
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

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="mb-16">
          <p className="text-[#185FA5] text-[11px] font-medium uppercase tracking-wider mb-2">Built for scale</p>
          <h1 className="text-[28px] font-medium text-[#1a1a18] tracking-[-0.5px] mb-3">
            Everything you need to manage your links
          </h1>
          <p className="text-[14px] text-[#5a5a56] max-w-[500px] mx-auto">
            Snip.ly goes beyond standard link shortening by offering deep analytics and embedded CTAs to maximize your conversions.
          </p>
        </div>

        {/* Features list */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-left">
          {[
            {
              icon: (
                <svg className="w-[18px] h-[18px] text-[#185FA5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              ),
              title: "Redis Cached",
              desc: "Sub-10ms redirects with 1-hour cache TTL",
            },
            {
              icon: (
                <svg className="w-[18px] h-[18px] text-[#185FA5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              ),
              title: "CTA Overlay",
              desc: "Embed your branded call-to-action on any page you share",
            },
            {
              icon: (
                <svg className="w-[18px] h-[18px] text-[#185FA5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              ),
              title: "Geo Analytics",
              desc: "Country-level click tracking via IP geolocation",
            },
            {
              icon: (
                <svg className="w-[18px] h-[18px] text-[#185FA5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              ),
              title: "Secure Auth",
              desc: "JWT access tokens + httpOnly refresh cookie rotation",
            },
            {
              icon: (
                <svg className="w-[18px] h-[18px] text-[#185FA5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20V10M18 20V4M6 20v-6" />
                </svg>
              ),
              title: "Deep Analytics",
              desc: "Clicks, devices, browsers, countries — all in one dashboard",
            },
            {
              icon: (
                <svg className="w-[18px] h-[18px] text-[#185FA5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              ),
              title: "QR Codes",
              desc: "Auto-generated, downloadable QR for every short link",
            },
          ].map((f) => (
            <div key={f.title} className="bg-white border border-05 border-default rounded-[12px] p-6 transition-colors duration-100 hover:border-emphasis flex flex-col gap-3">
              <div>{f.icon}</div>
              <h3 className="text-[13px] font-medium text-[#1a1a18]">{f.title}</h3>
              <p className="text-[12px] text-[#5a5a56] leading-[1.6]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="border-t border-05 border-default bg-white py-16 text-center">
        <div className="max-w-xl mx-auto px-6">
          {user ? (
            <>
              <h2 className="text-[20px] font-medium text-[#1a1a18] mb-3">
                Manage your links from your dashboard
              </h2>
              <p className="text-[14px] text-[#5a5a56] mb-6">Track clicks, configure CTA overlays, and download QR codes.</p>
              <Link href="/dashboard" className="inline-block bg-[#185FA5] text-[#E6F1FB] hover:bg-[#0C447C] px-6 py-2.5 rounded-[8px] text-[14px] font-medium transition-colors">
                Go to Dashboard
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-[20px] font-medium text-[#1a1a18] mb-3">
                Start shortening in seconds
              </h2>
              <p className="text-[14px] text-[#5a5a56] mb-6">No credit card. No friction. Just results.</p>
              <Link href="/register" className="inline-block bg-[#185FA5] text-[#E6F1FB] hover:bg-[#0C447C] px-6 py-2.5 rounded-[8px] text-[14px] font-medium transition-colors">
                Create Free Account
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
