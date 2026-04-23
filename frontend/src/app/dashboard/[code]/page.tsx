"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import QRCode from "@/components/QRCode";
import Sparkline from "@/components/Sparkline";

const COLORS = ["#00e5ff", "#bf5fff", "#00ff9d", "#ff9800", "#ff4757", "#89b4fa"];
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
  position: "bottom-left", bg_color: "#1a1a26", text_color: "#e8e8f0", btn_color: "#00e5ff", enabled: true,
};

export default function AnalyticsDashboard() {
  const params = useParams();
  const code = params.code as string;
  const { user, getToken } = useAuth();

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

  // Fetch analytics
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`${apiUrl}/analytics/${code}`);
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
  }, [code, apiUrl]);

  // Fetch existing CTA config
  useEffect(() => {
    if (!user) return;
    fetch(`${apiUrl}/cta/${code}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.cta) setCta({ ...DEFAULT_CTA, ...d.cta }); })
      .catch(() => {});
  }, [code, apiUrl, user]);

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

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;
  if (!data) return null;

  const sparkData = data.clicksOverTime.slice(-7).map((d) => d.clicks);

  return (
    <main style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid var(--border)", background: "rgba(7,7,16,0.9)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" style={{ fontFamily: "var(--font-syne)", fontSize: 20, fontWeight: 900, color: "var(--accent)" }}>
            snip<span style={{ color: "var(--accent2)" }}>.</span>ly
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent3)", display: "inline-block" }} />
            <span style={{ color: "var(--muted)", fontSize: 11 }}>Live • refreshes every 30s</span>
            {user && <Link href="/dashboard" style={{ color: "var(--muted)", fontSize: 12, marginLeft: 12 }}>← My Links</Link>}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Analytics Dashboard</p>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: 30, fontWeight: 900, marginBottom: 4 }}>/{code}</h1>
          <p style={{ color: "var(--muted)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 500 }}>↳ {data.original}</p>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr) repeat(2,1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total Clicks", value: data.totalClicks, color: "var(--accent)", icon: "🖱" },
            { label: "Last 24h", value: data.recentClicks, color: "var(--accent3)", icon: "⚡" },
            { label: "Countries", value: data.topCountries.length, color: "var(--accent2)", icon: "🌍" },
            { label: "Created", value: new Date(data.createdAt).toLocaleDateString(), color: "var(--warn)", icon: "📅" },
          ].map((s) => (
            <div key={s.label} className="glass glow-card" style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <span>{s.icon}</span>
                <span style={{ color: "var(--muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>{s.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "var(--font-syne)", fontSize: 26, fontWeight: 900, color: s.color }}>{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</div>
                {typeof s.value === "number" && sparkData.length > 1 && (
                  <Sparkline data={sparkData} color={s.color} />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Short URL + QR */}
        <div className="glass" style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "18px 22px", display: "flex", alignItems: "center", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ color: "var(--muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Short URL</p>
            <p style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700 }}>{shortUrl}</p>
          </div>
          <button onClick={async () => { await navigator.clipboard.writeText(shortUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={{ background: copied ? "rgba(0,255,157,0.1)" : "rgba(0,229,255,0.08)", border: `1px solid ${copied ? "rgba(0,255,157,0.3)" : "rgba(0,229,255,0.2)"}`, color: copied ? "var(--accent3)" : "var(--accent)", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
            {copied ? "✓ Copied!" : "Copy"}
          </button>
          <QRCode value={shortUrl} size={80} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: "10px 18px", fontSize: 13, fontWeight: 700, fontFamily: "var(--font-syne)", border: "none", background: "none", cursor: "pointer", color: activeTab === tab ? "var(--accent)" : "var(--muted)", borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent", transition: "all 0.2s", marginBottom: -1 }}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === "Overview" && (
          <div>
            <ChartCard title="Clicks Over Time" subtitle="Last 30 days">
              {data.clicksOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={data.clicksOverTime}>
                    <defs>
                      <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, fontFamily: "var(--font-mono)" }} />
                    <Area type="monotone" dataKey="clicks" stroke="#00e5ff" strokeWidth={2} fill="url(#cg)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <EmptyState message="No clicks yet. Share your link to start tracking!" />}
            </ChartCard>
          </div>
        )}

        {/* ── Clicks Tab ── */}
        {activeTab === "Clicks" && (
          <div style={{ display: "grid", gap: 16 }}>
            <ChartCard title="Daily Clicks" subtitle="Last 30 days detail">
              {data.clicksOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.clicksOverTime}>
                    <XAxis dataKey="date" tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="clicks" fill="#00e5ff" radius={[3, 3, 0, 0]} opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyState message="No clicks recorded yet." />}
            </ChartCard>
          </div>
        )}

        {/* ── Audience Tab ── */}
        {activeTab === "Audience" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <ChartCard title="Device Types" subtitle="Click distribution">
              {data.deviceBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={data.deviceBreakdown.map((d) => ({ name: d.device || "desktop", value: d.count }))}
                      cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                      {data.deviceBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <EmptyState message="No device data yet." />}
            </ChartCard>

            <ChartCard title="Top Countries" subtitle="By click count">
              {data.topCountries.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.topCountries.map((c) => ({ name: c.country, clicks: c.count }))} layout="vertical">
                    <XAxis type="number" tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "var(--text)", fontSize: 11 }} tickLine={false} axisLine={false} width={55} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="clicks" fill="#bf5fff" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyState message="No country data yet." />}
            </ChartCard>

            <ChartCard title="Browsers" subtitle="Top 5">
              {data.browserBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.browserBreakdown.map((b) => ({ name: b.browser, clicks: b.count }))}>
                    <XAxis dataKey="name" tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="clicks" fill="#00ff9d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <EmptyState message="No browser data yet." />}
            </ChartCard>

            <div className="glass" style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px" }}>
              <p style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 13, marginBottom: 16 }}>💡 AI Insight</p>
              <p style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.75 }}>
                {data.totalClicks === 0
                  ? "No clicks yet. Share your link to start collecting analytics."
                  : `Your link has received ${data.totalClicks.toLocaleString()} total clicks. ${data.recentClicks > 0 ? `${data.recentClicks} clicks in the last 24 hours.` : "No clicks in the last 24 hours."} ${data.topCountries[0] ? `Top traffic source: ${data.topCountries[0].country}.` : ""} ${data.deviceBreakdown[0] ? `Most visitors use ${data.deviceBreakdown[0].device || "desktop"} devices.` : ""}`}
              </p>
            </div>
          </div>
        )}

        {/* ── CTA Editor Tab ── */}
        {activeTab === "CTA Editor" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Form */}
            <div className="glass" style={{ border: "1px solid var(--border)", borderRadius: 16, padding: "24px" }}>
              {!user ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 16 }}>Sign in to add a CTA overlay to this link.</p>
                  <Link href="/login" style={{ background: "var(--accent)", color: "#000", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 800, fontFamily: "var(--font-syne)" }}>Sign In</Link>
                </div>
              ) : (
                <>
                  <p style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 14, marginBottom: 20 }}>📺 CTA Overlay Config</p>

                  {[
                    { label: "Message", key: "message" as const, type: "text", placeholder: "Check out our website!" },
                    { label: "Button Text", key: "button_text" as const, type: "text", placeholder: "Visit Us" },
                    { label: "Button URL", key: "button_url" as const, type: "url", placeholder: "https://yoursite.com" },
                  ].map((f) => (
                    <div key={f.key} style={{ marginBottom: 14 }}>
                      <label style={{ display: "block", fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>{f.label}</label>
                      <input type={f.type} value={cta[f.key]} placeholder={f.placeholder}
                        onChange={(e) => setCta({ ...cta, [f.key]: e.target.value })}
                        style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", fontSize: 12, outline: "none", fontFamily: "var(--font-mono)" }} />
                    </div>
                  ))}

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Position</label>
                    <select value={cta.position} onChange={(e) => setCta({ ...cta, position: e.target.value })}
                      style={{ width: "100%", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px", color: "var(--text)", fontSize: 12, outline: "none" }}>
                      {["bottom-left", "bottom-right", "bottom-center"].map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
                    {([["bg_color", "Background"], ["text_color", "Text"], ["btn_color", "Button"]] as const).map(([k, l]) => (
                      <div key={k}>
                        <label style={{ display: "block", fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>{l}</label>
                        <input type="color" value={cta[k]} onChange={(e) => setCta({ ...cta, [k]: e.target.value })}
                          style={{ width: "100%", height: 36, borderRadius: 8, border: "1px solid var(--border)", background: "none", cursor: "pointer", padding: 2 }} />
                      </div>
                    ))}
                  </div>

                  <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, cursor: "pointer" }}>
                    <input type="checkbox" checked={cta.enabled} onChange={(e) => setCta({ ...cta, enabled: e.target.checked })} />
                    <span style={{ color: "var(--text)", fontSize: 13 }}>Enable CTA overlay</span>
                  </label>

                  {ctaError && <div style={{ background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.2)", color: "var(--red)", borderRadius: 8, padding: "10px 14px", fontSize: 12, marginBottom: 14 }}>⚠ {ctaError}</div>}

                  <button onClick={saveCTA} disabled={ctaSaving}
                    style={{ width: "100%", background: ctaSaved ? "rgba(0,255,157,0.2)" : "var(--accent)", color: ctaSaved ? "var(--accent3)" : "#000", border: ctaSaved ? "1px solid rgba(0,255,157,0.3)" : "none", borderRadius: 10, padding: "12px", fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 13, cursor: ctaSaving ? "not-allowed" : "pointer", transition: "all 0.2s" }}>
                    {ctaSaving ? "Saving…" : ctaSaved ? "✓ Saved!" : "Save CTA"}
                  </button>
                </>
              )}
            </div>

            {/* Live Preview */}
            <div>
              <p style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Live Preview</p>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: 14, height: 320, position: "relative", overflow: "hidden" }}>
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>Destination page preview</span>
                </div>
                {/* CTA Preview */}
                <div style={{
                  position: "absolute",
                  ...(cta.position === "bottom-right" ? { right: 16, bottom: 16 } : cta.position === "bottom-center" ? { left: "50%", bottom: 16, transform: "translateX(-50%)" } : { left: 16, bottom: 16 }),
                  background: cta.bg_color, color: cta.text_color,
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 14px",
                  display: "flex", alignItems: "center", gap: 10, maxWidth: 280,
                  fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}>
                  <span style={{ flex: 1 }}>{cta.message || "Your message here"}</span>
                  <a href="#" style={{ background: cta.btn_color, color: "#000", borderRadius: 6, padding: "6px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", textDecoration: "none" }}>
                    {cta.button_text || "Visit Us"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 28, display: "flex", justifyContent: "center" }}>
          <Link href="/" style={{ background: "rgba(0,229,255,0.07)", border: "1px solid rgba(0,229,255,0.2)", color: "var(--accent)", borderRadius: 10, padding: "10px 22px", fontSize: 13, fontWeight: 700, fontFamily: "var(--font-syne)" }}>
            ← Shorten another URL
          </Link>
        </div>
      </div>
    </main>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="glass glow-card" style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px" }}>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 13 }}>{title}</p>
        <p style={{ color: "var(--muted)", fontSize: 11 }}>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 12 }}>{message}</div>;
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "var(--muted)", fontSize: 13 }}>Loading analytics…</p>
      </div>
    </div>
  );
}

function ErrorScreen({ error }: { error: string }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="glass" style={{ border: "1px solid rgba(255,71,87,0.25)", borderRadius: 16, padding: "32px", textAlign: "center", maxWidth: 340 }}>
        <p style={{ fontSize: 32, marginBottom: 12 }}>⚠️</p>
        <p style={{ fontFamily: "var(--font-syne)", color: "var(--red)", fontWeight: 700, marginBottom: 12 }}>{error}</p>
        <Link href="/" style={{ color: "var(--accent)", fontSize: 13 }}>Go back home</Link>
      </div>
    </div>
  );
}
