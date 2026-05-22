"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";

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

  return (
    <main className="min-h-screen bg-[#f7f7f5] flex flex-col items-center justify-center p-6 text-[#1a1a18]">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <Link href="/" className="flex justify-center mb-6 hover:opacity-90 transition-opacity">
          <Logo fontSize={18} size={24} />
        </Link>

        {/* Card */}
        <div className="bg-white border border-05 border-default rounded-[12px] p-8 flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-[20px] font-medium text-[#1a1a18] mb-1">Reset Password</h1>
          </div>

          {status === "success" ? (
            <div className="text-center flex flex-col items-center gap-4 py-4">
              <div className="w-12 h-12 bg-[#1D9E75]/10 text-[#1D9E75] rounded-full flex items-center justify-center text-[20px]">
                ✓
              </div>
              <p className="text-[13px] text-[#5a5a56]">{message}</p>
              <Link
                href="/login"
                className="w-full py-2.5 bg-[#f7f7f5] hover:bg-[#e6e6e2] text-[#1a1a18] border border-05 border-default rounded-[8px] text-[13px] font-medium transition-colors text-center"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <p className="text-[13px] text-[#5a5a56] text-center">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-[#5a5a56] uppercase tracking-wider font-medium">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full h-[40px] px-3 border border-05 border-default rounded-[8px] text-[13px] text-[#1a1a18] outline-none focus:border-[#185FA5] focus:ring-3 focus:ring-[#185FA5]/15 transition-all bg-white"
                  />
                </div>

                {status === "error" && (
                  <div className="bg-[#D85A30]/10 border border-05 border-[#D85A30]/30 text-[#D85A30] rounded-[8px] p-3 text-[12px]">
                    {message}
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
                      Sending link
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          )}

          <p className="text-[12px] text-[#5a5a56] text-center">
            Remember your password?{" "}
            <Link href="/login" className="text-[#185FA5] hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
