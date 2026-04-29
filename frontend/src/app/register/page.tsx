"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const RULES = [
  { id: "len",   label: "At least 8 characters",           test: (p: string) => p.length >= 8 },
  { id: "upper", label: "One uppercase letter (A–Z)",       test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower", label: "One lowercase letter (a–z)",       test: (p: string) => /[a-z]/.test(p) },
  { id: "digit", label: "One number (0–9)",                 test: (p: string) => /[0-9]/.test(p) },
  { id: "spec",  label: "One special character (@$!%*?&…)", test: (p: string) => /[@$!%*?&#^()_+\-=/|"'`~]/.test(p) },
];

function getStrength(password: string): number {
  return RULES.filter((r) => r.test(password)).length;
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
const STRENGTH_COLORS = ["", "#ff4757", "#ffa502", "#eccc68", "#2ed573", "#00e5ff"];

export default function RegisterPage() {
  const { register, user, loading } = useAuth();
  const router = useRouter();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");

  const [emailErr,   setEmailErr]   = useState("");
  const [confirmErr, setConfirmErr] = useState("");
  const [submitErr,  setSubmitErr]  = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched,    setTouched]    = useState({ password: false });

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  const strength = getStrength(password);
  const allRulesPass = strength === RULES.length;

  const handleEmailBlur = useCallback(() => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr("Please enter a valid email address.");
    } else {
      setEmailErr("");
    }
  }, [email]);

  // Validate confirm password on blur
  const handleConfirmBlur = useCallback(() => {
    if (confirm && confirm !== password) {
      setConfirmErr("Passwords do not match.");
    } else {
      setConfirmErr("");
    }
  }, [confirm, password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitErr("");

    // Client-side guard — backend enforces the same rules
    if (!allRulesPass) {
      return setSubmitErr("Please meet all password requirements.");
    }
    if (password !== confirm) {
      setConfirmErr("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register(name, email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setSubmitErr(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.03)",
    border: "1px solid var(--border)", borderRadius: 10,
    padding: "12px 14px", color: "var(--text)", fontSize: 13,
    outline: "none", fontFamily: "var(--font-mono)", transition: "border-color 0.2s",
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 11, color: "var(--muted)",
    textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6,
  };
  const fieldErrStyle: React.CSSProperties = {
    fontSize: 11, color: "#ff4757", marginTop: 5,
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <Link href="/" style={{ display: "block", textAlign: "center", fontFamily: "var(--font-syne)", fontSize: 22, fontWeight: 900, color: "var(--accent)", marginBottom: 32 }}>
          snip<span style={{ color: "var(--accent2)" }}>.</span>ly
        </Link>

        <div className="glass" style={{ border: "1px solid var(--border)", borderRadius: 20, padding: "36px 32px" }}>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 800, marginBottom: 6, textAlign: "center" }}>Create your account</h1>
          <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", marginBottom: 28 }}>Free forever. No credit card needed.</p>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Name</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your name" autoComplete="name"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,255,0.4)")}
                onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Email <span style={{ color: "#ff4757" }}>*</span></label>
              <input
                type="email" required value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailErr(""); }}
                onBlur={handleEmailBlur}
                placeholder="you@example.com" autoComplete="email"
                style={{ ...inputStyle, borderColor: emailErr ? "rgba(255,71,87,0.5)" : undefined }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,255,0.4)")}
              />
              {emailErr && <p style={fieldErrStyle}>⚠ {emailErr}</p>}
            </div>

            {/* Password + strength meter */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Password <span style={{ color: "#ff4757" }}>*</span></label>
              <input
                type="password" required value={password}
                onChange={(e) => { setPassword(e.target.value); setTouched((t) => ({ ...t, password: true })); }}
                placeholder="Min. 8 characters" autoComplete="new-password"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,255,0.4)")}
                onBlur={(e)  => (e.target.style.borderColor = "var(--border)")}
              />

              {/* Strength bar */}
              {touched.password && password.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                    {[1,2,3,4,5].map((seg) => (
                      <div key={seg} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: seg <= strength ? STRENGTH_COLORS[strength] : "rgba(255,255,255,0.08)",
                        transition: "background 0.3s",
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 10, color: STRENGTH_COLORS[strength], marginBottom: 6, fontWeight: 600 }}>
                    {STRENGTH_LABELS[strength]}
                  </p>

                  {/* Per-rule checklist */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {RULES.map((r) => {
                      const ok = r.test(password);
                      return (
                        <p key={r.id} style={{ fontSize: 11, color: ok ? "#2ed573" : "var(--muted)", display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ fontSize: 9 }}>{ok ? "✓" : "○"}</span> {r.label}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div style={{ marginBottom: 22 }}>
              <label style={labelStyle}>Confirm password <span style={{ color: "#ff4757" }}>*</span></label>
              <input
                type="password" required value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setConfirmErr(""); }}
                onBlur={handleConfirmBlur}
                placeholder="Repeat password" autoComplete="new-password"
                style={{ ...inputStyle, borderColor: confirmErr ? "rgba(255,71,87,0.5)" : undefined }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,255,0.4)")}
              />
              {confirmErr && <p style={fieldErrStyle}>⚠ {confirmErr}</p>}
              {/* Live match indicator */}
              {confirm.length > 0 && !confirmErr && password === confirm && (
                <p style={{ fontSize: 11, color: "#2ed573", marginTop: 5 }}>✓ Passwords match</p>
              )}
            </div>

            {/* Submit-level error */}
            {submitErr && (
              <div style={{ background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.25)", color: "var(--red)", borderRadius: 8, padding: "10px 14px", fontSize: 12, marginBottom: 16 }}>
                ⚠ {submitErr}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{ width: "100%", background: submitting ? "rgba(0,229,255,0.3)" : "var(--accent)", color: "#000", border: "none", borderRadius: 10, padding: "13px", fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 14, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", marginTop: 4 }}
            >
              {submitting
                ? (<><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" /></svg>Creating account…</>)
                : "Create Account →"
              }
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

