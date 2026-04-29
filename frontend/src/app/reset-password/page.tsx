"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// ── Password complexity rules (mirrors backend PasswordSchema exactly) ─────────
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

function ResetPasswordForm() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");

  const [confirmErr, setConfirmErr] = useState("");
  const [submitErr,  setSubmitErr]  = useState("");
  const [status,     setStatus]     = useState<"idle" | "loading" | "success">("idle");
  const [touched,    setTouched]    = useState({ password: false });

  // Live strength score
  const strength = getStrength(password);
  const allRulesPass = strength === RULES.length;

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

    if (!token) {
      return setSubmitErr("Missing reset token. Please request a new link.");
    }

    if (!allRulesPass) {
      return setSubmitErr("Please meet all password requirements.");
    }
    if (password !== confirm) {
      setConfirmErr("Passwords do not match.");
      return;
    }

    setStatus("loading");
    try {
      await resetPassword(token, password);
      setStatus("success");
    } catch (err: unknown) {
      setStatus("idle");
      setSubmitErr(err instanceof Error ? err.message : "Failed to reset password.");
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

  if (!token) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <p style={{ color: "var(--red)", marginBottom: 16 }}>Invalid or missing password reset token.</p>
        <Link href="/forgot-password" style={{ color: "var(--accent)", fontWeight: 700 }}>Request a new link →</Link>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ width: 48, height: 48, background: "rgba(46, 213, 115, 0.1)", color: "#2ed573", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>✓</div>
        <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 18, marginBottom: 8 }}>Password Reset!</h2>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>Your password has been successfully updated. You have been logged out of all devices.</p>
        <button onClick={() => router.push("/login")} style={{ width: "100%", background: "var(--accent)", color: "#000", border: "none", borderRadius: 10, padding: "13px", fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
          Log In Now
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Password + strength meter */}
      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>New Password</label>
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
        <label style={labelStyle}>Confirm New Password</label>
        <input
          type="password" required value={confirm}
          onChange={(e) => { setConfirm(e.target.value); setConfirmErr(""); }}
          onBlur={handleConfirmBlur}
          placeholder="Repeat password" autoComplete="new-password"
          style={{ ...inputStyle, borderColor: confirmErr ? "rgba(255,71,87,0.5)" : undefined }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,255,0.4)")}
        />
        {confirmErr && <p style={fieldErrStyle}>⚠ {confirmErr}</p>}
        {confirm.length > 0 && !confirmErr && password === confirm && (
          <p style={{ fontSize: 11, color: "#2ed573", marginTop: 5 }}>✓ Passwords match</p>
        )}
      </div>

      {submitErr && (
        <div style={{ background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.25)", color: "var(--red)", borderRadius: 8, padding: "10px 14px", fontSize: 12, marginBottom: 16 }}>
          ⚠ {submitErr}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        style={{ width: "100%", background: status === "loading" ? "rgba(0,229,255,0.3)" : "var(--accent)", color: "#000", border: "none", borderRadius: 10, padding: "13px", fontFamily: "var(--font-syne)", fontWeight: 800, fontSize: 14, cursor: status === "loading" ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}
      >
        {status === "loading" ? "Resetting..." : "Reset Password →"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <Link href="/" style={{ display: "block", textAlign: "center", fontFamily: "var(--font-syne)", fontSize: 22, fontWeight: 900, color: "var(--accent)", marginBottom: 32 }}>
          snip<span style={{ color: "var(--accent2)" }}>.</span>ly
        </Link>

        <div className="glass" style={{ border: "1px solid var(--border)", borderRadius: 20, padding: "36px 32px" }}>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 800, marginBottom: 24, textAlign: "center" }}>Set New Password</h1>
          
          <Suspense fallback={<p style={{ color: "var(--muted)", textAlign: "center" }}>Loading...</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
