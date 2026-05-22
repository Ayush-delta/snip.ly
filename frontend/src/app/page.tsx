"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import QRCode from "@/components/QRCode";
import Logo from "@/components/Logo";

export default function HomePage() {
  const { user, getToken } = useAuth();
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => { setYear(new Date().getFullYear()); }, []);

  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [result, setResult] = useState<{ shortUrl: string; code: string; original: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  async function handleShorten(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setResult(null); setLoading(true); setCopied(false); setShowQr(false);
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
    <main className="bg-white min-h-screen text-[#1a1a18] relative z-10">
      {/* Navigation */}
      <nav className="h-[52px] bg-white border-b border-05 border-default sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/features" className="text-[13px] text-[#5a5a56] hover:text-[#1a1a18] transition-colors font-medium">Features</Link>
            <Link href="/dashboard" className="text-[13px] text-[#5a5a56] hover:text-[#1a1a18] transition-colors font-medium">Analytics</Link>
            <Link href="/pricing" className="text-[13px] text-[#5a5a56] hover:text-[#1a1a18] transition-colors font-medium">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-[12px] text-[#5a5a56] font-medium">Hey, {user.name || user.email}</span>
                <Link href="/dashboard" className="text-[12px] text-[#185FA5] hover:text-[#0C447C] transition-colors font-medium">
                  My Links
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-[13px] text-[#5a5a56] hover:text-[#1a1a18] font-medium transition-colors">
                  Sign in
                </Link>
                <Link href="/register" className="text-[13px] bg-[#185FA5] text-[#E6F1FB] hover:bg-[#0C447C] px-3 py-1.5 rounded-[8px] font-medium transition-colors">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-[600px] mx-auto px-6 pt-[56px] pb-[48px] text-center flex flex-col items-center">
        <h1 className="text-[28px] font-medium tracking-[-0.5px] text-[#1a1a18] mb-3">
          Shorten links. Track every click.
        </h1>
        <p className="text-[14px] text-[#5a5a56] max-w-[480px] mb-8">
          Free URL shortener with real-time analytics, branded CTAs, and QR codes. No account needed.
        </p>

        {/* Shorten Form */}
        <form onSubmit={handleShorten} className="w-full">
          <div className="border border-05 border-default rounded-[12px] bg-white overflow-hidden flex items-center p-1 focus-within:border-[#185FA5] focus-within:ring-3 focus-within:ring-[#185FA5]/15 transition-all mb-4">
            <input
              type="url"
              required
              placeholder="Paste your long URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-transparent border-0 outline-none text-[#1a1a18] text-[14px] px-4 py-3 placeholder-[#9a9a96]"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#185FA5] text-[#E6F1FB] hover:bg-[#0C447C] rounded-[8px] px-4 py-2.5 text-[14px] font-medium transition-colors flex-shrink-0 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-[#E6F1FB]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Shortening
                </>
              ) : (
                "Shorten for free"
              )}
            </button>
          </div>

          {/* Custom Alias Input */}
          <div className="flex items-center gap-3 w-full mb-6">
            <span className="text-[13px] text-[#5a5a56] flex-shrink-0">Custom alias:</span>
            <div className="flex items-center flex-1 h-[36px] overflow-hidden rounded-[8px]">
              <div className="h-full bg-[#f7f7f5] border border-05 border-default px-3 flex items-center text-[13px] text-[#5a5a56] border-r-0 rounded-l-[8px]">
                snip.ly/
              </div>
              <input
                type="text"
                placeholder="alias"
                value={customCode}
                maxLength={12}
                onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                className="flex-1 h-full px-3 text-[13px] text-[#1a1a18] border border-05 border-default rounded-r-[8px] outline-none focus:border-[#185FA5] focus:ring-3 focus:ring-[#185FA5]/15 transition-all"
              />
            </div>
          </div>
        </form>

        <p className="text-[11px] text-[#9a9a96] mb-8">
          By shortening, you agree to our{" "}
          <Link href="/terms" className="text-[#185FA5] hover:underline">Terms</Link> and{" "}
          <Link href="/privacy" className="text-[#185FA5] hover:underline">Privacy Policy</Link>.
        </p>

        {/* Error Message */}
        {error && (
          <div className="w-full bg-[#D85A30]/10 border border-05 border-[#D85A30]/30 text-[#D85A30] rounded-[10px] p-3 text-[13px] mb-6 text-left">
            {error}
          </div>
        )}

        {/* Result Container */}
        {result && (
          <div className="w-full bg-[#f7f7f5] border border-05 border-default rounded-[12px] p-4 text-left mb-6">
            {/* Header Row */}
            <div className="flex items-center justify-between border-b border-05 border-default/50 pb-3 mb-3">
              <span className="text-[#1D9E75] text-[11px] uppercase tracking-wider font-medium flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Link Created
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowQr(!showQr)}
                  className={`text-[12px] border border-05 rounded-[8px] px-3 py-1.5 font-medium transition-colors ${
                    showQr 
                      ? "bg-[#185FA5] border-[#185FA5] text-[#E6F1FB]" 
                      : "bg-white border-default text-[#5a5a56] hover:text-[#185FA5] hover:border-[#185FA5]/30"
                  }`}
                >
                  QR Code
                </button>
                <Link
                  href={`/dashboard/${result.code}`}
                  className="text-[12px] bg-[#185FA5] text-[#E6F1FB] hover:bg-[#0C447C] rounded-[8px] px-3 py-1.5 font-medium transition-colors flex items-center gap-1"
                >
                  Analytics + CTA →
                </Link>
              </div>
            </div>

            {/* URL Row */}
            <div className="flex items-center justify-between gap-4 mb-2">
              <a
                href={result.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#185FA5] text-[16px] font-medium hover:underline truncate flex-1"
              >
                {result.shortUrl}
              </a>
              <button
                type="button"
                onClick={copyToClipboard}
                className="bg-white hover:bg-[#f7f7f5] text-[#1a1a18] border border-05 border-default rounded-[8px] px-4 py-2 text-[13px] font-medium transition-colors flex items-center gap-2 min-w-[76px] justify-center"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {/* Original URL */}
            <div className="text-[12px] text-[#5a5a56] truncate pr-12">
              ↳ {result.original}
            </div>

            {/* QR Code Expandable Section */}
            {showQr && (
              <div className="border-t border-05 border-default/50 mt-4 pt-4 flex flex-col items-center gap-3">
                <QRCode id={`qr-${result.code}`} value={result.shortUrl} size={140} />
                <button
                  type="button"
                  onClick={() => {
                    const svg = document.getElementById(`qr-${result.code}`);
                    if (svg) {
                      const svgData = new XMLSerializer().serializeToString(svg);
                      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                      const svgUrl = URL.createObjectURL(svgBlob);
                      const downloadLink = document.createElement("a");
                      downloadLink.href = svgUrl;
                      downloadLink.download = `qrcode-${result.code}.svg`;
                      document.body.appendChild(downloadLink);
                      downloadLink.click();
                      document.body.removeChild(downloadLink);
                    }
                  }}
                  className="text-[12px] text-[#185FA5] hover:underline font-medium flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download QR Code (SVG)
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Stats Bar */}
      <section className="border-y border-05 border-default bg-white py-8">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-y-6 md:gap-y-0 text-center">
          <div className="flex flex-col items-center">
            <div className="text-[22px] font-medium text-[#1a1a18]">2M+</div>
            <div className="text-[12px] text-[#5a5a56] mt-1">Links shortened</div>
          </div>
          <div className="flex flex-col items-center" style={{ borderLeft: "0.5px solid var(--border-default)" }}>
            <div className="text-[22px] font-medium text-[#1a1a18]">1.2M+</div>
            <div className="text-[12px] text-[#5a5a56] mt-1">Clicks tracked</div>
          </div>
          <div className="flex flex-col items-center md:border-l border-05 border-default" style={{ borderLeft: "0.5px solid var(--border-default)" }}>
            <div className="text-[22px] font-medium text-[#1a1a18]">42</div>
            <div className="text-[12px] text-[#5a5a56] mt-1">Countries</div>
          </div>
          <div className="flex flex-col items-center" style={{ borderLeft: "0.5px solid var(--border-default)" }}>
            <div className="text-[22px] font-medium text-[#1a1a18]">&lt;10ms</div>
            <div className="text-[12px] text-[#5a5a56] mt-1">Avg redirect</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-[56px]">
        <h2 className="text-[16px] font-medium text-[#1a1a18] mb-8 text-left">Everything you need</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <svg className="w-[18px] h-[18px] text-[#185FA5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              ),
              title: "Real-time analytics",
              desc: "Track clicks, devices, browsers, and country-level geolocation instantly.",
            },
            {
              icon: (
                <svg className="w-[18px] h-[18px] text-[#185FA5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
              ),
              title: "CTA overlay",
              desc: "Embed your branded call-to-action message and button on any shared page.",
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
              title: "QR codes",
              desc: "Generate customizable, downloadable QR codes for every short link.",
            },
            {
              icon: (
                <svg className="w-[18px] h-[18px] text-[#185FA5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              ),
              title: "Redis cached redirects",
              desc: "Sub-10ms redirect times powered by a robust Redis caching layer.",
            },
            {
              icon: (
                <svg className="w-[18px] h-[18px] text-[#185FA5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              ),
              title: "Secure auth (JWT)",
              desc: "Secure user registration and login with JWT access tokens and cookies.",
            },
            {
              icon: (
                <svg className="w-[18px] h-[18px] text-[#185FA5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              ),
              title: "Custom aliases",
              desc: "Create customized, easy-to-remember aliases for your shortened links.",
            },
          ].map((f) => (
            <div key={f.title} className="bg-white border border-05 border-default rounded-[12px] p-[18px] transition-colors duration-100 hover:border-emphasis flex flex-col items-start gap-3">
              <div>{f.icon}</div>
              <h3 className="text-[13px] font-medium text-[#1a1a18]">{f.title}</h3>
              <p className="text-[12px] text-[#5a5a56] leading-[1.6]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-05 border-default py-[56px] max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="flex flex-col items-start">
            <div className="text-[12px] text-[#9a9a96] mb-2 font-medium">01</div>
            <h3 className="text-[14px] font-medium text-[#1a1a18] mb-1">Paste your long URL</h3>
            <p className="text-[13px] text-[#5a5a56]">Drop any URL into the input. Add an optional custom slug.</p>
          </div>
          <div className="flex flex-col items-start md:pl-6" style={{ borderLeft: "0.5px solid var(--border-default)" }}>
            <div className="text-[12px] text-[#9a9a96] mb-2 font-medium">02</div>
            <h3 className="text-[14px] font-medium text-[#1a1a18] mb-1">Configure your settings</h3>
            <p className="text-[13px] text-[#5a5a56]">Customize the short link alias and add custom call-to-actions.</p>
          </div>
          <div className="flex flex-col items-start md:pl-6" style={{ borderLeft: "0.5px solid var(--border-default)" }}>
            <div className="text-[12px] text-[#9a9a96] mb-2 font-medium">03</div>
            <h3 className="text-[14px] font-medium text-[#1a1a18] mb-1">Share and track</h3>
            <p className="text-[13px] text-[#5a5a56]">Distribute shortened links and review analytics in real-time.</p>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="border-t border-05 border-default bg-white py-16">
        <div className="max-w-xl mx-auto px-6 text-center">
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

      {/* Footer */}
      <footer className="bg-white border-t border-05 border-default py-12">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center">
          <div className="mb-6">
            <Logo />
          </div>

          <div className="flex gap-8 mb-8 text-[13px] text-[#5a5a56]">
            <Link href="/features" className="hover:text-[#1a1a18] transition-colors">Features</Link>
            <Link href="/support" className="hover:text-[#1a1a18] transition-colors">Support</Link>
            <Link href="/privacy" className="hover:text-[#1a1a18] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#1a1a18] transition-colors">Terms of Service</Link>
          </div>

          <div className="text-[11px] text-[#9a9a96]" suppressHydrationWarning>
            Copyright © {year ?? ""} Sniply. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
