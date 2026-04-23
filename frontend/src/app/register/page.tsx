"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const { register, user, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError("Passwords do not match.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    setSubmitting(true);
    try {
      await register(name, email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
    borderRadius: 10, padding: "12px 14px", color: "var(--text)", fontSize: 13,
    outline: "none", fontFamily: "var(--font-mono)", transition: "border-color 0.2s",
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <Link href="/" style={{ display: "block", textAlign: "center", fontFamily: "var(--font-syne)", fontSize: 22, fontWeight: 900, color: "var(--accent)", marginBottom: 32 }}>
          snip<span style={{ color: "var(--accent2)" }}>.</span>ly
        </Link>

        <div className="glass" style={{ border: "1px solid var(--border)", borderRadius: 20, padding: "36px 32px" }}>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>Create your account</h1>
          <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", marginBottom: 28 }}>Free forever. No credit card needed.</p>

          <form onSubmit={handleSubmit}>
            {[
              { label: "Name", type: "text", val: name, set: setName, placeholder: "Your name" },
              { label: "Email", type: "email", val: email, set: setEmail, placeholder: "you@example.com" },
              { label: "Password", type: "password", val: password, set: setPassword, placeholder: "Min. 8 characters" },
              { label: "Confirm password", type: "password", val: confirm, set: setConfirm, placeholder: "Repeat password" },
            ].map((field) => (
              <div key={field.label} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{field.label}</label>
                <input
                  type={field.type} required={field.label !== "Name"} value={field.val}
                  onChange={(e) => field.set(e.target.value)} placeholder={field.placeholder}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,255,0.4)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
              </div>
            ))}

            {error && (
              <div style={{ background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.25)", color: "var(--red)", borderRadius: 8, padding: "10px 14px", fontSize: 12, marginBottom: 16 }}>
                ⚠ {error}
              </div>
            )}

            <button type="submit" disabled={submitting} style={{ width: "100%", background: submitting ? "rgba(0,229,255,0.3)" : "var(--accent)", color: "#000", border: "none", borderRadius: 10, padding: "13px", fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 14, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", marginTop: 4 }}>
              {submitting ? (<><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" /></svg>Creating account…</>) : "Create Account →"}
            </button>
          </form>

          <p style={{ color: "var(--muted)", fontSize: 12, textAlign: "center", marginTop: 20 }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--accent)", fontWeight: 700 }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
