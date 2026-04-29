"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      await forgotPassword(email);
      setStatus("success");
      setMessage("If that email exists, we have sent a password reset link.");
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "An error occurred");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
    borderRadius: 10, padding: "12px 14px", color: "var(--text)", fontSize: 13,
    outline: "none", fontFamily: "var(--font-mono)", transition: "border-color 0.2s", boxSizing: "border-box"
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <Link href="/" style={{ display: "block", textAlign: "center", fontFamily: "var(--font-syne)", fontSize: 22, fontWeight: 900, color: "var(--accent)", marginBottom: 32 }}>
          snip<span style={{ color: "var(--accent2)" }}>.</span>ly
        </Link>

        <div className="glass" style={{ border: "1px solid var(--border)", borderRadius: 20, padding: "36px 32px" }}>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>Reset Password</h1>
          
          {status === "success" ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 48, height: 48, background: "rgba(46, 213, 115, 0.1)", color: "#2ed573", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>✓</div>
              <p style={{ color: "var(--text)", fontSize: 14, marginBottom: 24 }}>{message}</p>
              <Link href="/login" style={{ display: "block", width: "100%", background: "rgba(255,255,255,0.05)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px", fontFamily: "var(--font-syne)", fontWeight: 700, fontSize: 14, textAlign: "center", textDecoration: "none" }}>
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", marginBottom: 28 }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Email</label>
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" autoComplete="email"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,255,0.4)")}
                    onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>

                {status === "error" && (
                  <div style={{ background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.25)", color: "var(--red)", borderRadius: 8, padding: "10px 14px", fontSize: 12, marginBottom: 16 }}>
                    ⚠ {message}
                  </div>
                )}

                <button
                  type="submit" disabled={status === "loading"}
                  style={{ width: "100%", background: status === "loading" ? "rgba(0,229,255,0.3)" : "var(--accent)", color: "#000", border: "none", borderRadius: 10, padding: "13px", fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 14, cursor: status === "loading" ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}
                >
                  {status === "loading" ? "Sending..." : "Send Reset Link →"}
                </button>
              </form>
            </>
          )}

          <p style={{ color: "var(--muted)", fontSize: 12, textAlign: "center", marginTop: 24 }}>
            Remember your password?{" "}
            <Link href="/login" style={{ color: "var(--accent)", fontWeight: 700 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
