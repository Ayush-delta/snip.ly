"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <Link href="/" style={{ display: "block", textAlign: "center", fontFamily: "var(--font-syne)", fontSize: 22, fontWeight: 900, color: "var(--accent)", marginBottom: 32 }}>
          snip<span style={{ color: "var(--accent2)" }}>.</span>ly
        </Link>

        <div className="glass" style={{ border: "1px solid var(--border)", borderRadius: 20, padding: "36px 32px" }}>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>Welcome back</h1>
          <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", marginBottom: 28 }}>Sign in to manage your links &amp; analytics</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Email</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "var(--font-mono)", transition: "border-color 0.2s" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,255,0.4)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Password</label>
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "var(--font-mono)", transition: "border-color 0.2s" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,255,0.4)")}
                onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Forgot password link — right-aligned under the password field */}
            <div style={{ textAlign: "right", marginBottom: 18 }}>
              <Link href="/forgot-password" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, opacity: 0.85 }}>
                Forgot password?
              </Link>
            </div>

            {error && (
              <div style={{ background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.25)", color: "var(--red)", borderRadius: 8, padding: "10px 14px", fontSize: 12, marginBottom: 16 }}>
                ⚠ {error}
              </div>
            )}

            <button type="submit" disabled={submitting} style={{ width: "100%", background: submitting ? "rgba(0,229,255,0.3)" : "var(--accent)", color: "#000", border: "none", borderRadius: 10, padding: "13px", fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 14, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}>
              {submitting ? (<><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" /></svg>Signing in…</>) : "Sign In →"}
            </button>
          </form>

          <p style={{ color: "var(--muted)", fontSize: 12, textAlign: "center", marginTop: 20 }}>
            No account?{" "}
            <Link href="/register" style={{ color: "var(--accent)", fontWeight: 700 }}>Create one free →</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
