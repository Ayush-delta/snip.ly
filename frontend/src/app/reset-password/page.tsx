"use client";

import { useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";

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
const STRENGTH_COLORS = ["", "#D85A30", "#D85A30", "#185FA5", "#185FA5", "#1D9E75"];

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

  const strength = getStrength(password);
  const allRulesPass = strength === RULES.length;

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

  if (!token) {
    return (
      <div className="text-center py-4 flex flex-col items-center gap-4">
        <p className="text-[13px] text-[#D85A30]">Invalid or missing password reset token.</p>
        <Link href="/forgot-password" className="text-[#185FA5] hover:underline font-medium text-[13px]">
          Request a new link
        </Link>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center flex flex-col items-center gap-4 py-4">
        <div className="w-12 h-12 bg-[#1D9E75]/10 text-[#1D9E75] rounded-full flex items-center justify-center text-[20px]">
          ✓
        </div>
        <h2 className="text-[16px] font-medium text-[#1a1a18]">Password Reset!</h2>
        <p className="text-[13px] text-[#5a5a56]">Your password has been successfully updated. You have been logged out of all devices.</p>
        <button
          onClick={() => router.push("/login")}
          className="w-full h-[40px] bg-[#185FA5] text-[#E6F1FB] hover:bg-[#0C447C] rounded-[8px] text-[13px] font-medium transition-colors"
        >
          Log In Now
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Password */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-[#5a5a56] uppercase tracking-wider font-medium">New Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => { setPassword(e.target.value); setTouched((t) => ({ ...t, password: true })); }}
          placeholder="Min. 8 characters"
          autoComplete="new-password"
          className="w-full h-[40px] px-3 border border-05 border-default rounded-[8px] text-[13px] text-[#1a1a18] outline-none focus:border-[#185FA5] focus:ring-3 focus:ring-[#185FA5]/15 transition-all bg-white"
        />

        {/* Strength bar */}
        {touched.password && password.length > 0 && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((seg) => (
                <div
                  key={seg}
                  className="flex-1 h-[3px] rounded-[1px] transition-colors"
                  style={{
                    backgroundColor: seg <= strength ? STRENGTH_COLORS[strength] : "rgba(0,0,0,0.06)",
                  }}
                />
              ))}
            </div>
            <p className="text-[11px] font-medium mb-2" style={{ color: STRENGTH_COLORS[strength] }}>
              {STRENGTH_LABELS[strength]}
            </p>

            <div className="flex flex-col gap-1">
              {RULES.map((r) => {
                const ok = r.test(password);
                return (
                  <p key={r.id} className={`text-[11px] flex items-center gap-1.5 ${ok ? "text-[#1D9E75]" : "text-[#9a9a96]"}`}>
                    <span>{ok ? "✓" : "○"}</span> {r.label}
                  </p>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Confirm password */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-[#5a5a56] uppercase tracking-wider font-medium">Confirm New Password</label>
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => { setConfirm(e.target.value); setConfirmErr(""); }}
          onBlur={handleConfirmBlur}
          placeholder="Repeat password"
          autoComplete="new-password"
          className={`w-full h-[40px] px-3 border border-05 rounded-[8px] text-[13px] text-[#1a1a18] outline-none focus:border-[#185FA5] focus:ring-3 focus:ring-[#185FA5]/15 transition-all bg-white ${
            confirmErr ? "border-[#D85A30]" : "border-default"
          }`}
        />
        {confirmErr && <p className="text-[11px] text-[#D85A30] mt-1">{confirmErr}</p>}
        {confirm.length > 0 && !confirmErr && password === confirm && (
          <p className="text-[11px] text-[#1D9E75] mt-1">✓ Passwords match</p>
        )}
      </div>

      {submitErr && (
        <div className="bg-[#D85A30]/10 border border-05 border-[#D85A30]/30 text-[#D85A30] rounded-[8px] p-3 text-[12px]">
          {submitErr}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full h-[40px] bg-[#185FA5] text-[#E6F1FB] hover:bg-[#0C447C] rounded-[8px] text-[13px] font-medium transition-colors flex items-center justify-center gap-2 disabled:bg-[#185FA5]/40"
      >
        {status === "loading" ? (
          <>
            <svg className="animate-spin h-4 w-4 text-[#E6F1FB]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Resetting password
          </>
        ) : (
          "Reset Password"
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] flex flex-col items-center justify-center p-6 text-[#1a1a18]">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <Link href="/" className="flex justify-center mb-6 hover:opacity-90 transition-opacity">
          <Logo fontSize={18} size={24} />
        </Link>

        {/* Card */}
        <div className="bg-white border border-05 border-default rounded-[12px] p-8 flex flex-col gap-6">
          <h1 className="text-[20px] font-medium text-[#1a1a18] text-center">Set New Password</h1>
          
          <Suspense fallback={<p className="text-[13px] text-[#5a5a56] text-center">Loading...</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
