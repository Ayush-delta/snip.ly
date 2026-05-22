"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import QRCode from "@/components/QRCode";
import Logo from "@/components/Logo";

interface LinkRow {
  short_code: string;
  original: string;
  short_url: string;
  click_count: number;
  created_at: string;
  has_cta: boolean;
}

export default function DashboardPage() {
  const { user, loading, logout, getToken } = useAuth();
  const router = useRouter();
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  // Inline shortener states
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [shortenLoading, setShortenLoading] = useState(false);
  const [shortenError, setShortenError] = useState("");
  const [shortenResult, setShortenResult] = useState<{ shortUrl: string; code: string; original: string } | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [shortenCopied, setShortenCopied] = useState(false);

  // Search & sorting states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const inlineInputRef = useRef<HTMLInputElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    async function fetchLinks() {
      try {
        const token = await getToken();
        const res = await fetch(`${apiUrl}/links`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setLinks(data.links);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load links");
      } finally {
        setFetching(false);
      }
    }
    fetchLinks();
  }, [user, apiUrl, getToken]);

  async function handleDelete(code: string) {
    if (!confirm(`Delete /${code}? This cannot be undone.`)) return;
    const token = await getToken();
    await fetch(`${apiUrl}/links/${code}`, {
      method: "DELETE",
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
    });
    setLinks((prev) => prev.filter((l) => l.short_code !== code));
  }

  async function copy(url: string, code: string) {
    await navigator.clipboard.writeText(url);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleInlineShorten(e: React.FormEvent) {
    e.preventDefault();
    setShortenError("");
    setShortenResult(null);
    setShortenLoading(true);
    setShortenCopied(false);
    setShowQr(false);

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

      setShortenResult(data);
      setUrl("");
      setCustomCode("");

      // Add to list immediately
      const newLink: LinkRow = {
        short_code: data.code,
        original: data.original,
        short_url: data.shortUrl,
        click_count: 0,
        created_at: new Date().toISOString(),
        has_cta: false,
      };
      setLinks((prev) => [newLink, ...prev]);
    } catch (err: unknown) {
      setShortenError(err instanceof Error ? err.message : "Failed to shorten URL");
    } finally {
      setShortenLoading(false);
    }
  }

  // Filter and sort links
  const filteredLinks = links
    .filter((link) => {
      const term = searchTerm.toLowerCase();
      return (
        link.short_code.toLowerCase().includes(term) ||
        link.original.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "clicks_desc") {
        return b.click_count - a.click_count;
      }
      if (sortBy === "clicks_asc") {
        return a.click_count - b.click_count;
      }
      return 0;
    });

  // Pagination
  const totalItems = filteredLinks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedLinks = filteredLinks.slice(startIndex, endIndex);

  if (loading || fetching) return <LoadingScreen />;

  return (
    <main className="bg-white min-h-screen text-[#1a1a18] relative z-10">
      {/* Navigation */}
      <nav className="h-[52px] bg-white border-b border-05 border-default sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[12px] text-[#5a5a56] font-medium">{user?.email}</span>
            <button
              onClick={async () => { await logout(); router.push("/"); }}
              className="text-[12px] text-[#D85A30] hover:text-[#b84a24] font-medium transition-colors bg-[#D85A30]/10 hover:bg-[#D85A30]/15 border border-05 border-[#D85A30]/20 rounded-[8px] px-3 py-1.5"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="text-[11px] text-[#9a9a96] uppercase tracking-wider font-medium mb-1">Overview</p>
            <h1 className="text-[28px] font-medium text-[#1a1a18]">
              {user?.name ? `${user.name}'s dashboard` : "My Dashboard"}
            </h1>
          </div>
          <button
            onClick={() => inlineInputRef.current?.focus()}
            className="bg-[#185FA5] text-[#E6F1FB] hover:bg-[#0C447C] rounded-[8px] px-4 py-2.5 text-[13px] font-medium transition-colors"
          >
            + Shorten New Link
          </button>
        </div>

        {/* Inline URL Shortener Form */}
        <div className="bg-[#f7f7f5] border border-05 border-default rounded-[12px] p-5 mb-8">
          <h2 className="text-[14px] font-medium text-[#1a1a18] mb-3">Shorten a new link</h2>
          <form onSubmit={handleInlineShorten} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 min-w-0">
                <input
                  type="url"
                  required
                  ref={inlineInputRef}
                  placeholder="Paste your long URL (e.g. https://example.com)..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full h-[40px] px-3 border border-05 border-default rounded-[8px] text-[13px] text-[#1a1a18] outline-none bg-white focus:border-[#185FA5] focus:ring-3 focus:ring-[#185FA5]/15 transition-all"
                />
              </div>
              <div className="w-full md:w-[220px] flex items-center h-[40px] overflow-hidden rounded-[8px]">
                <div className="h-full bg-white border border-05 border-default border-r-0 px-2.5 flex items-center text-[12px] text-[#5a5a56] rounded-l-[8px] select-none">
                  snip.ly/
                </div>
                <input
                  type="text"
                  placeholder="custom-alias"
                  value={customCode}
                  maxLength={12}
                  onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                  className="flex-1 h-full px-2.5 text-[12px] text-[#1a1a18] border border-05 border-default rounded-r-[8px] outline-none bg-white focus:border-[#185FA5] focus:ring-3 focus:ring-[#185FA5]/15 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={shortenLoading}
                className="h-[40px] px-5 bg-[#185FA5] text-[#E6F1FB] hover:bg-[#0C447C] rounded-[8px] text-[13px] font-medium transition-colors disabled:bg-[#185FA5]/40 flex-shrink-0 flex items-center justify-center gap-1.5"
              >
                {shortenLoading ? "Shortening..." : "Shorten"}
              </button>
            </div>
          </form>

          {/* Inline Shorten Error */}
          {shortenError && (
            <div className="mt-3 bg-[#D85A30]/10 border border-05 border-[#D85A30]/30 text-[#D85A30] rounded-[8px] p-3 text-[12px]">
              {shortenError}
            </div>
          )}

          {/* Inline Shorten Result */}
          {shortenResult && (
            <div className="mt-4 bg-white border border-05 border-default rounded-[8px] p-4 text-left">
              {/* Header Row */}
              <div className="flex items-center justify-between border-b border-05 border-default/50 pb-2.5 mb-2.5">
                <span className="text-[#1D9E75] text-[11px] uppercase tracking-wider font-medium flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Link Created Successfully
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQr(!showQr)}
                    className={`text-[11px] border border-05 rounded-[6px] px-2.5 py-1 transition-colors ${
                      showQr 
                        ? "bg-[#185FA5] border-[#185FA5] text-[#E6F1FB]" 
                        : "bg-white border-default text-[#5a5a56] hover:text-[#185FA5] hover:border-[#185FA5]/30"
                    }`}
                  >
                    QR Code
                  </button>
                  <Link
                    href={`/dashboard/${shortenResult.code}`}
                    className="text-[11px] bg-[#185FA5] text-[#E6F1FB] hover:bg-[#0C447C] rounded-[6px] px-2.5 py-1 transition-colors flex items-center gap-1"
                  >
                    Analytics + CTA →
                  </Link>
                </div>
              </div>

              {/* URL Row */}
              <div className="flex items-center justify-between gap-4 mb-1">
                <a
                  href={shortenResult.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#185FA5] text-[14px] font-medium hover:underline truncate flex-1"
                >
                  {shortenResult.shortUrl}
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(shortenResult.shortUrl);
                    setShortenCopied(true);
                    setTimeout(() => setShortenCopied(false), 2000);
                  }}
                  className="bg-[#f7f7f5] hover:bg-[#ecece9] text-[#1a1a18] border border-05 border-default rounded-[6px] px-3 py-1 text-[12px] font-medium transition-colors flex items-center gap-1 min-w-[64px] justify-center"
                >
                  {shortenCopied ? "Copied" : "Copy"}
                </button>
              </div>

              {/* Original URL */}
              <div className="text-[11px] text-[#5a5a56] truncate pr-12">
                ↳ {shortenResult.original}
              </div>

              {/* QR Code Expandable Section */}
              {showQr && (
                <div className="border-t border-05 border-default/50 mt-3 pt-3 flex flex-col items-center gap-2">
                  <QRCode id={`qr-inline-${shortenResult.code}`} value={shortenResult.shortUrl} size={120} />
                  <button
                    type="button"
                    onClick={() => {
                      const svg = document.getElementById(`qr-inline-${shortenResult.code}`);
                      if (svg) {
                        const svgData = new XMLSerializer().serializeToString(svg);
                        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
                        const svgUrl = URL.createObjectURL(svgBlob);
                        const downloadLink = document.createElement("a");
                        downloadLink.href = svgUrl;
                        downloadLink.download = `qrcode-${shortenResult.code}.svg`;
                        document.body.appendChild(downloadLink);
                        downloadLink.click();
                        document.body.removeChild(downloadLink);
                      }
                    }}
                    className="text-[11px] text-[#185FA5] hover:underline font-medium flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download QR Code (SVG)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Links", value: links.length },
            { label: "Total Clicks", value: links.reduce((a, l) => a + l.click_count, 0) },
            { label: "With CTA Overlay", value: links.filter((l) => l.has_cta).length },
          ].map((s) => (
            <div key={s.label} className="bg-[#f7f7f5] rounded-[8px] p-4 flex flex-col">
              <span className="text-[12px] text-[#5a5a56] font-medium mb-1">{s.label}</span>
              <span className="text-[24px] font-medium text-[#1a1a18]">{s.value.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-[#D85A30]/10 border border-05 border-[#D85A30]/30 text-[#D85A30] rounded-[10px] p-3 text-[13px] mb-6">
            {error}
          </div>
        )}

        {/* Links list section */}
        {links.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-05 border-default rounded-[12px] text-center bg-white">
            <svg className="w-6 h-6 text-[#9a9a96] mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <p className="text-[14px] text-[#5a5a56] mb-4">No links shortened yet.</p>
            <button
              onClick={() => inlineInputRef.current?.focus()}
              className="inline-block border border-05 border-[#185FA5] hover:bg-[#E6F1FB] text-[#185FA5] px-4 py-2 rounded-[8px] text-[13px] font-medium transition-colors"
            >
              Shorten a link
            </button>
          </div>
        ) : (
          <>
            {/* Search & Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4">
              <div className="relative w-full sm:w-[320px]">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-3.5 h-3.5 text-[#9a9a96]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search by URL or short code..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full h-[36px] pl-9 pr-3 border border-05 border-default rounded-[8px] text-[12px] text-[#1a1a18] bg-white outline-none focus:border-[#185FA5] focus:ring-3 focus:ring-[#185FA5]/15 transition-all"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-[11px] text-[#5a5a56] uppercase tracking-wider font-medium flex-shrink-0">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                  className="h-[36px] px-2.5 border border-05 border-default rounded-[8px] bg-white text-[12px] text-[#1a1a18] outline-none focus:border-[#185FA5] focus:ring-3 focus:ring-[#185FA5]/15 transition-all cursor-pointer"
                >
                  <option value="newest">Newest Created</option>
                  <option value="oldest">Oldest Created</option>
                  <option value="clicks_desc">Most Clicks</option>
                  <option value="clicks_asc">Least Clicks</option>
                </select>
              </div>
            </div>

            {totalItems === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border border-05 border-default rounded-[12px] text-center bg-white">
                <svg className="w-6 h-6 text-[#9a9a96] mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p className="text-[13px] text-[#5a5a56]">No links found matching &ldquo;{searchTerm}&rdquo;</p>
              </div>
            ) : (
              <div className="border border-05 border-default rounded-[12px] overflow-hidden bg-white">
                {/* Headers */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[#f7f7f5] border-b border-05 border-default text-[11px] uppercase tracking-wider text-[#5a5a56] font-medium">
                  <div className="col-span-8">Link Details</div>
                  <div className="col-span-2 text-right">Analytics</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Link Rows */}
                <div className="divide-y divide-[#f0f0ee]">
                  {paginatedLinks.map((link) => (
                    <div
                      key={link.short_code}
                      className="grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors duration-100 hover:bg-[#f7f7f5]/40"
                    >
                      {/* Left Column (Details) */}
                      <div className="col-span-8 overflow-hidden pr-4 flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/dashboard/${link.short_code}`}
                            className="text-[14px] font-medium text-[#185FA5] hover:underline"
                          >
                            /{link.short_code}
                          </Link>
                          {link.has_cta && (
                            <span className="bg-[#185FA5]/10 border border-05 border-[#185FA5]/25 text-[#185FA5] text-[10px] px-1.5 py-0.5 rounded-[4px] font-medium">
                              CTA Overlay
                            </span>
                          )}
                        </div>
                        <span className="text-[12px] text-[#5a5a56] truncate w-full block">
                          {link.original}
                        </span>
                      </div>

                      {/* Right Column (Stats) */}
                      <div className="col-span-2 text-right flex flex-col items-end gap-1">
                        <span className="text-[14px] font-medium text-[#1a1a18]">
                          {link.click_count.toLocaleString()} click{link.click_count === 1 ? "" : "s"}
                        </span>
                        <span className="text-[12px] text-[#9a9a96]">
                          {new Date(link.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>

                      {/* Actions Column */}
                      <div className="col-span-2 flex items-center justify-end gap-1.5">
                        {/* Copy Button */}
                        <button
                          onClick={() => copy(link.short_url || `/${link.short_code}`, link.short_code)}
                          className="h-8 w-8 flex items-center justify-center rounded-[6px] border border-05 border-transparent hover:border-default hover:bg-white text-[#5a5a56] hover:text-[#185FA5] transition-colors"
                          title="Copy short URL"
                        >
                          {copied === link.short_code ? (
                            <svg className="w-[14px] h-[14px] text-[#1D9E75]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          )}
                        </button>

                        {/* Stats Link */}
                        <Link
                          href={`/dashboard/${link.short_code}`}
                          className="h-8 w-8 flex items-center justify-center rounded-[6px] border border-05 border-transparent hover:border-default hover:bg-white text-[#5a5a56] hover:text-[#185FA5] transition-colors"
                          title="View link analytics"
                        >
                          <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10" />
                            <line x1="12" y1="20" x2="12" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="14" />
                          </svg>
                        </Link>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(link.short_code)}
                          className="h-8 w-8 flex items-center justify-center rounded-[6px] border border-05 border-transparent hover:border-[#D85A30]/30 hover:bg-[#D85A30]/10 text-[#5a5a56] hover:text-[#D85A30] transition-colors"
                          title="Delete link"
                        >
                          <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalItems > 0 && (
                  <div className="flex items-center justify-between px-6 py-4 bg-[#f7f7f5] border-t border-05 border-default text-[12px]">
                    <span className="text-[#5a5a56] font-medium">
                      Showing {startIndex + 1}-{endIndex} of {totalItems} link{totalItems === 1 ? "" : "s"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="border border-05 border-default hover:border-emphasis disabled:border-default/40 bg-white text-[#5a5a56] disabled:text-[#9a9a96] px-3 py-1.5 rounded-[8px] font-medium transition-colors disabled:pointer-events-none"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="border border-05 border-default hover:border-emphasis disabled:border-default/40 bg-white text-[#5a5a56] disabled:text-[#9a9a96] px-3 py-1.5 rounded-[8px] font-medium transition-colors disabled:pointer-events-none"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center text-[#1a1a18]">
      <div className="text-center">
        <svg className="animate-spin h-6 w-6 text-[#185FA5] mx-auto mb-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-[13px] text-[#5a5a56]">Loading dashboard…</p>
      </div>
    </div>
  );
}
