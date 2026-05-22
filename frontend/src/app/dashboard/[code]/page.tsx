"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import QRCode from "@/components/QRCode";
import Sparkline from "@/components/Sparkline";
import Logo from "@/components/Logo";

const COLORS = ["#185FA5", "#0C447C", "#5a5a56", "#9a9a96", "#b4cbe1"];
const TABS = ["Overview", "Clicks", "Audience", "CTA Editor"] as const;
type Tab = (typeof TABS)[number];

interface AnalyticsData {
  code: string; original: string; createdAt: string;
  totalClicks: number; recentClicks: number;
  clicksOverTime: { date: string; clicks: number }[];
  topCountries: { country: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
}

interface CTAData {
  message: string; button_text: string; button_url: string;
  position: string; bg_color: string; text_color: string; btn_color: string; enabled: boolean;
}

const DEFAULT_CTA: CTAData = {
  message: "Check out our website!", button_text: "Visit Us", button_url: "",
  position: "bottom-left", bg_color: "#f7f7f5", text_color: "#1a1a18", btn_color: "#185FA5", enabled: true,
};

export default function AnalyticsDashboard() {
  const params = useParams();
  const code = params.code as string;
  const router = useRouter();
  const { user, loading: authLoading, getToken } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cta, setCta] = useState<CTAData>(DEFAULT_CTA);
  const [ctaSaving, setCtaSaving] = useState(false);
  const [ctaSaved, setCtaSaved] = useState(false);
  const [ctaError, setCtaError] = useState("");
  const [copied, setCopied] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const shortUrl = typeof window !== "undefined" ? `${window.location.origin}/${code}` : `/${code}`;

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?redirect=/dashboard/${code}`);
    }
  }, [authLoading, user, code, router]);

  // Fetch analytics
  useEffect(() => {
    if (authLoading || !user) return;

    async function fetchAnalytics() {
      try {
        const token = await getToken();
        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const res = await fetch(`${apiUrl}/analytics/${code}`, {
          headers,
          credentials: "include"
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setData(json);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [code, apiUrl, authLoading, user, getToken]);

  // Fetch existing CTA config
  useEffect(() => {
    if (authLoading || !user) return;
    async function fetchCTA() {
      try {
        const token = await getToken();
        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const r = await fetch(`${apiUrl}/cta/${code}`, {
          headers,
          credentials: "include"
        });
        const d = await r.json();
        if (d.cta) setCta({ ...DEFAULT_CTA, ...d.cta });
      } catch {
        // Ignored
      }
    }
    fetchCTA();
  }, [code, apiUrl, authLoading, user, getToken]);

  async function saveCTA() {
    if (!user) return;
    setCtaSaving(true); setCtaError(""); setCtaSaved(false);
    try {
      const token = await getToken();
      const res = await fetch(`${apiUrl}/cta`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shortCode: code, ...cta, buttonText: cta.button_text, buttonUrl: cta.button_url, bgColor: cta.bg_color, textColor: cta.text_color, btnColor: cta.btn_color }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setCtaSaved(true);
      setTimeout(() => setCtaSaved(false), 3000);
    } catch (err: unknown) {
      setCtaError(err instanceof Error ? err.message : "Failed to save CTA");
    } finally {
      setCtaSaving(false);
    }
  }

  if (authLoading || loading) return <LoadingScreen />;
  if (!user) return null;
  if (error) return <ErrorScreen error={error} code={code} />;
  if (!data) return null;

  const sparkData = data.clicksOverTime.slice(-7).map((d) => d.clicks);

  return (
    <main className="bg-white min-h-screen text-[#1a1a18] relative z-10">
      {/* Navigation */}
      <nav className="h-[52px] bg-white border-b border-05 border-default sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-[#5a5a56] font-medium">Refreshes every 30s</span>
            {user && (
              <Link href="/dashboard" className="text-[12px] text-[#185FA5] hover:text-[#0C447C] transition-colors font-medium">
                ← My Links
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] text-[#9a9a96] uppercase tracking-wider font-medium mb-1">Analytics Dashboard</p>
          <h1 className="text-[28px] font-medium text-[#1a1a18] mb-1">/{code}</h1>
          <span className="text-[12px] text-[#5a5a56] break-all">↳ {data.original}</span>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Clicks", value: data.totalClicks, color: "#185FA5" },
            { label: "Last 24h", value: data.recentClicks, color: "#185FA5" },
            { label: "Countries", value: data.topCountries.length, color: "#185FA5" },
            { label: "Created", value: new Date(data.createdAt).toLocaleDateString(), color: "#185FA5" },
          ].map((s) => (
            <div key={s.label} className="bg-[#f7f7f5] rounded-[8px] p-4 flex flex-col justify-between h-[100px]">
              <span className="text-[12px] text-[#5a5a56] font-medium">{s.label}</span>
              <div className="flex items-end justify-between">
                <span className="text-[24px] font-medium text-[#1a1a18]">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</span>
                {typeof s.value === "number" && sparkData.length > 1 && (
                  <Sparkline data={sparkData} color="#185FA5" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Short URL details + QR code */}
        <div className="bg-white border border-05 border-default rounded-[12px] p-4 px-6 flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div className="min-w-[200px] flex-1">
            <p className="text-[11px] text-[#5a5a56] uppercase tracking-wider font-medium mb-1">Short URL</p>
            <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-[#185FA5] text-[15px] font-medium hover:underline">
              {shortUrl}
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={async () => { await navigator.clipboard.writeText(shortUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="text-[13px] bg-white hover:bg-[#f7f7f5] text-[#1a1a18] border border-05 border-default hover:border-emphasis rounded-[8px] px-3.5 py-1.5 font-medium transition-colors"
            >
              {copied ? "✓ Copied!" : "Copy"}
            </button>
            <div className="border border-05 border-default rounded-[8px] p-1 bg-white flex-shrink-0">
              <QRCode value={shortUrl} size={48} />
            </div>
          </div>
        </div>

        {/* Tabs switcher */}
        <div className="flex justify-center gap-6 border-b border-05 border-default mb-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pt-3 pb-3 text-[13px] font-medium border-b-2 transition-all focus:outline-none ${
                activeTab === tab ? "border-[#185FA5] text-[#185FA5]" : "border-transparent text-[#5a5a56] hover:text-[#1a1a18]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "Overview" && (
          <div>
            <ChartCard title="Clicks Over Time" subtitle="Last 30 days">
              {data.clicksOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data.clicksOverTime}>
                    <XAxis dataKey="date" tick={{ fill: "#5a5a56", fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "#5a5a56", fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
                    <Tooltip contentStyle={{ background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="clicks" stroke="#185FA5" strokeWidth={1.5} dot={{ r: 2, fill: "#185FA5" }} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No clicks recorded yet. Share your link to start collecting statistics!" />
              )}
            </ChartCard>
          </div>
        )}

        {/* Clicks Tab */}
        {activeTab === "Clicks" && (
          <div>
            <ChartCard title="Daily Clicks" subtitle="Last 30 days detail">
              {data.clicksOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.clicksOverTime}>
                    <XAxis dataKey="date" tick={{ fill: "#5a5a56", fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "#5a5a56", fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
                    <Tooltip contentStyle={{ background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="clicks" fill="#185FA5" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No click analytics recorded." />
              )}
            </ChartCard>
          </div>
        )}

        {/* Audience Tab */}
        {activeTab === "Audience" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="Device Types" subtitle="Click distribution">
              {data.deviceBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.deviceBreakdown.map((d) => ({ name: d.device || "desktop", value: d.count }))}
                      cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                      style={{ fontSize: 10, fill: "#1a1a18" }}
                    >
                      {data.deviceBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No device statistics available." />
              )}
            </ChartCard>

            <ChartCard title="Top Countries" subtitle="By click count">
              {data.topCountries.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.topCountries.map((c) => ({ name: c.country, clicks: c.count }))} layout="vertical">
                    <XAxis type="number" tick={{ fill: "#5a5a56", fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "#1a1a18", fontSize: 11 }} tickLine={false} axisLine={false} width={60} />
                    <Tooltip contentStyle={{ background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="clicks" fill="#185FA5" radius={[0, 2, 2, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState message="No geographic data yet." />
              )}
            </ChartCard>

            <div className="md:col-span-2">
              <ChartCard title="Browsers" subtitle="Top browsers distribution">
                {data.browserBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.browserBreakdown.map((b) => ({ name: b.browser, clicks: b.count }))}>
                      <XAxis dataKey="name" tick={{ fill: "#5a5a56", fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: "#5a5a56", fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
                      <Tooltip contentStyle={{ background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="clicks" fill="#185FA5" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState message="No browser data recorded." />
                )}
              </ChartCard>
            </div>
          </div>
        )}

        {/* CTA Editor Tab */}
        {activeTab === "CTA Editor" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CTA Overlays configuration */}
            <div className="border border-05 border-default rounded-[12px] p-6 bg-white flex flex-col gap-4">
              {!user ? (
                <div className="text-center py-12">
                  <p className="text-[13px] text-[#5a5a56] mb-4">Sign in to add a CTA overlay to this link.</p>
                  <Link href="/login" className="inline-block bg-[#185FA5] text-[#E6F1FB] hover:bg-[#0C447C] rounded-[8px] px-4 py-2 text-[13px] font-medium transition-colors">
                    Sign In
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-[14px] font-medium text-[#1a1a18]">CTA Overlay Settings</h3>

                  {[
                    { label: "Message", key: "message" as const, type: "text", placeholder: "Check out our website!" },
                    { label: "Button Text", key: "button_text" as const, type: "text", placeholder: "Visit Us" },
                    { label: "Button URL", key: "button_url" as const, type: "url", placeholder: "https://yoursite.com" },
                  ].map((f) => (
                    <div key={f.key} className="flex flex-col gap-1">
                      <label className="text-[11px] text-[#5a5a56] uppercase tracking-wider font-medium">{f.label}</label>
                      <input
                        type={f.type}
                        value={cta[f.key]}
                        placeholder={f.placeholder}
                        onChange={(e) => setCta({ ...cta, [f.key]: e.target.value })}
                        className="w-full h-[40px] px-3 border border-05 border-default rounded-[8px] text-[13px] text-[#1a1a18] outline-none focus:border-[#185FA5] focus:ring-3 focus:ring-[#185FA5]/15 transition-all bg-white"
                      />
                    </div>
                  ))}

                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[#5a5a56] uppercase tracking-wider font-medium">Position</label>
                    <select
                      value={cta.position}
                      onChange={(e) => setCta({ ...cta, position: e.target.value })}
                      className="w-full h-[40px] px-3 border border-05 border-default rounded-[8px] bg-white text-[13px] text-[#1a1a18] outline-none focus:border-[#185FA5] focus:ring-3 focus:ring-[#185FA5]/15 transition-all"
                    >
                      {["bottom-left", "bottom-right", "bottom-center"].map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {([["bg_color", "Background"], ["text_color", "Text"], ["btn_color", "Button"]] as const).map(([k, l]) => (
                      <div key={k} className="flex flex-col gap-1">
                        <label className="text-[11px] text-[#5a5a56] uppercase tracking-wider font-medium">{l}</label>
                        <input
                          type="color"
                          value={cta[k]}
                          onChange={(e) => setCta({ ...cta, [k]: e.target.value })}
                          className="w-full h-[36px] rounded-[8px] border border-05 border-default bg-transparent cursor-pointer p-0.5"
                        />
                      </div>
                    ))}
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer py-2">
                    <input
                      type="checkbox"
                      checked={cta.enabled}
                      onChange={(e) => setCta({ ...cta, enabled: e.target.checked })}
                      className="h-4 w-4 rounded border-default text-[#185FA5] focus:ring-[#185FA5]/15"
                    />
                    <span className="text-[13px] text-[#1a1a18]">Enable CTA overlay</span>
                  </label>

                  {ctaError && (
                    <div className="bg-[#D85A30]/10 border border-05 border-[#D85A30]/30 text-[#D85A30] rounded-[8px] p-3 text-[12px]">
                      {ctaError}
                    </div>
                  )}

                  <button
                    onClick={saveCTA}
                    disabled={ctaSaving}
                    className={`w-full py-2.5 rounded-[8px] text-[13px] font-medium transition-colors ${
                      ctaSaved
                        ? "bg-[#1D9E75] text-white"
                        : "bg-[#185FA5] text-[#E6F1FB] hover:bg-[#0C447C] disabled:bg-[#185FA5]/40"
                    }`}
                  >
                    {ctaSaving ? "Saving..." : ctaSaved ? "Saved!" : "Save CTA"}
                  </button>
                </div>
              )}
            </div>

            {/* Live CTA preview */}
            <div>
              <p className="text-[11px] text-[#5a5a56] uppercase tracking-wider font-medium mb-3">Live Preview</p>
              <div className="border border-05 border-default rounded-[12px] h-[320px] relative overflow-hidden bg-[#f7f7f5]">
                <div className="w-full h-full flex items-center justify-center text-[12px] text-[#9a9a96]">
                  Destination website container
                </div>
                {cta.enabled && (
                  <div
                    style={{
                      position: "absolute",
                      ...(cta.position === "bottom-right"
                        ? { right: 16, bottom: 16 }
                        : cta.position === "bottom-center"
                        ? { left: "50%", bottom: 16, transform: "translateX(-50%)" }
                        : { left: 16, bottom: 16 }),
                      backgroundColor: cta.bg_color,
                      color: cta.text_color,
                      border: "0.5px solid rgba(0,0,0,0.12)",
                      borderRadius: 12,
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      maxWidth: 280,
                      fontSize: 12,
                    }}
                  >
                    <span className="flex-1 truncate">{cta.message || "Your custom CTA message"}</span>
                    <a
                      href="#"
                      style={{
                        backgroundColor: cta.btn_color,
                        color: cta.text_color === "#ffffff" || cta.text_color === "#fff" ? "#ffffff" : "#000000",
                        borderRadius: 6,
                        padding: "6px 10px",
                        fontSize: 11,
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        textDecoration: "none",
                      }}
                      className="border border-05 border-default/20"
                    >
                      {cta.button_text || "Visit Link"}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center border-t border-05 border-default pt-8">
          <Link
            href="/"
            className="text-[13px] bg-[#f7f7f5] hover:bg-[#e6e6e2] text-[#1a1a18] border border-05 border-default rounded-[8px] px-6 py-2.5 font-medium transition-colors"
          >
            ← Shorten another URL
          </Link>
        </div>
      </div>
    </main>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-05 border-default rounded-[12px] p-6 transition-colors duration-100 hover:border-emphasis flex flex-col gap-4">
      <div>
        <h3 className="text-[14px] font-medium text-[#1a1a18]">{title}</h3>
        <p className="text-[12px] text-[#5a5a56]">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg className="w-6 h-6 text-[#9a9a96] mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="9" y1="3" x2="9" y2="21" />
      </svg>
      <p className="text-[13px] text-[#5a5a56]">{message}</p>
    </div>
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
        <p className="text-[13px] text-[#5a5a56]">Loading analytics…</p>
      </div>
    </div>
  );
}

function ErrorScreen({ error, code }: { error: string; code: string }) {
  const isAuthError = error.includes("Authentication") || error.includes("token");
  return (
    <div className="min-h-screen bg-white flex items-center justify-center text-[#1a1a18] px-6">
      <div className="border border-05 border-[#D85A30]/30 rounded-[12px] p-8 text-center max-w-[360px] bg-[#f7f7f5]">
        <svg className="w-8 h-8 text-[#D85A30] mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <p className="text-[14px] text-[#D85A30] font-medium mb-4">{error}</p>
        {isAuthError ? (
          <Link href={`/login?redirect=/dashboard/${code}`} className="inline-block bg-[#185FA5] text-[#E6F1FB] hover:bg-[#0C447C] rounded-[8px] px-4 py-2 text-[13px] font-medium transition-colors">
            Sign In
          </Link>
        ) : (
          <Link href="/" className="text-[13px] text-[#185FA5] hover:underline font-medium">Go back home</Link>
        )}
      </div>
    </div>
  );
}
