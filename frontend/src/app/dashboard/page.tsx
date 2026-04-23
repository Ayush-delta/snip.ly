"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

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

  if (loading || fetching) return <LoadingScreen />;

  return (
    <main style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid var(--border)", background: "rgba(7,7,16,0.9)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" style={{ fontFamily: "var(--font-syne)", fontSize: 20, fontWeight: 900, color: "var(--accent)" }}>
            snip<span style={{ color: "var(--accent2)" }}>.</span>ly
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ color: "var(--muted)", fontSize: 12 }}>{user?.email}</span>
            <button onClick={async () => { await logout(); router.push("/"); }} style={{ background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.2)", color: "var(--red)", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ color: "var(--muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Your Links</p>
            <h1 style={{ fontFamily: "var(--font-syne)", fontSize: 28, fontWeight: 900 }}>
              {user?.name ? `${user.name}'s dashboard` : "My Dashboard"}
            </h1>
          </div>
          <Link href="/" style={{ background: "var(--accent)", color: "#000", fontFamily: "var(--font-syne)", fontWeight: 800, borderRadius: 10, padding: "10px 20px", fontSize: 13 }}>
            + Shorten New Link
          </Link>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Total Links", value: links.length, color: "var(--accent)" },
            { label: "Total Clicks", value: links.reduce((a, l) => a + l.click_count, 0), color: "var(--accent3)" },
            { label: "With CTA", value: links.filter((l) => l.has_cta).length, color: "var(--accent2)" },
          ].map((s) => (
            <div key={s.label} className="glass glow-card" style={{ border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ color: "var(--muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontFamily: "var(--font-syne)", fontSize: 30, fontWeight: 900, color: s.color }}>{s.value.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.2)", color: "var(--red)", borderRadius: 10, padding: "12px 16px", fontSize: 13, marginBottom: 20 }}>
            ⚠ {error}
          </div>
        )}

        {/* Links table */}
        {links.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
            <p style={{ fontFamily: "var(--font-syne)", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No links yet</p>
            <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>Shorten your first URL and it will appear here.</p>
            <Link href="/" style={{ background: "var(--accent)", color: "#000", fontFamily: "var(--font-syne)", fontWeight: 800, borderRadius: 10, padding: "12px 24px" }}>
              Create Your First Link
            </Link>
          </div>
        ) : (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px 100px 120px", gap: 16, padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.02)" }}>
              {["Short URL", "Destination", "Clicks", "Created", "Actions"].map((h) => (
                <div key={h} style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>{h}</div>
              ))}
            </div>

            {links.map((link, i) => (
              <div
                key={link.short_code}
                style={{
                  display: "grid", gridTemplateColumns: "180px 1fr 80px 100px 120px",
                  gap: 16, padding: "16px 20px", alignItems: "center",
                  borderBottom: i < links.length - 1 ? "1px solid var(--border)" : "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    /{link.short_code}
                  </span>
                  {link.has_cta && (
                    <span style={{ background: "rgba(191,95,255,0.15)", border: "1px solid rgba(191,95,255,0.25)", color: "var(--accent2)", borderRadius: 4, padding: "1px 5px", fontSize: 9, fontWeight: 700 }}>CTA</span>
                  )}
                </div>
                <div style={{ color: "var(--muted)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {link.original}
                </div>
                <div style={{ color: "var(--accent3)", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700 }}>
                  {link.click_count.toLocaleString()}
                </div>
                <div style={{ color: "var(--muted)", fontSize: 11 }}>
                  {new Date(link.created_at).toLocaleDateString()}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => copy(link.short_url || `/${link.short_code}`, link.short_code)} style={{ background: copied === link.short_code ? "rgba(0,255,157,0.1)" : "rgba(0,229,255,0.07)", border: `1px solid ${copied === link.short_code ? "rgba(0,255,157,0.3)" : "rgba(0,229,255,0.15)"}`, color: copied === link.short_code ? "var(--accent3)" : "var(--accent)", borderRadius: 6, padding: "5px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                    {copied === link.short_code ? "✓" : "Copy"}
                  </button>
                  <Link href={`/dashboard/${link.short_code}`} style={{ background: "rgba(191,95,255,0.07)", border: "1px solid rgba(191,95,255,0.15)", color: "var(--accent2)", borderRadius: 6, padding: "5px 8px", fontSize: 10, fontWeight: 700 }}>
                    Stats
                  </Link>
                  <button onClick={() => handleDelete(link.short_code)} style={{ background: "rgba(255,71,87,0.07)", border: "1px solid rgba(255,71,87,0.15)", color: "var(--red)", borderRadius: 6, padding: "5px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "var(--muted)", fontSize: 13 }}>Loading your dashboard…</p>
      </div>
    </div>
  );
}
