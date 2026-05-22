"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";

function LoginForm() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(redirect);
  }, [user, loading, router, redirect]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSubmitting(true);
    try {
      await login(email, password);
      router.push(redirect);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white border border-05 border-default rounded-[12px] p-8 flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-[20px] font-medium text-[#1a1a18] mb-1">Welcome back</h1>
        <p className="text-[13px] text-[#5a5a56]">Sign in to manage your links &amp; analytics</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-[#5a5a56] uppercase tracking-wider font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-[40px] px-3 border border-05 border-default rounded-[8px] text-[13px] text-[#1a1a18] outline-none focus:border-[#185FA5] focus:ring-3 focus:ring-[#185FA5]/15 transition-all bg-white"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-[#5a5a56] uppercase tracking-wider font-medium">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-[40px] px-3 border border-05 border-default rounded-[8px] text-[13px] text-[#1a1a18] outline-none focus:border-[#185FA5] focus:ring-3 focus:ring-[#185FA5]/15 transition-all bg-white"
          />
        </div>

        {/* Forgot password link */}
        <div className="text-right">
          <Link href="/forgot-password" className="text-[12px] text-[#185FA5] hover:underline font-medium">
            Forgot password?
          </Link>
        </div>

        {error && (
          <div className="bg-[#D85A30]/10 border border-05 border-[#D85A30]/30 text-[#D85A30] rounded-[8px] p-3 text-[12px]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-[40px] bg-[#185FA5] text-[#E6F1FB] hover:bg-[#0C447C] rounded-[8px] text-[13px] font-medium transition-colors flex items-center justify-center gap-2 disabled:bg-[#185FA5]/40"
        >
          {submitting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-[#E6F1FB]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <p className="text-[12px] text-[#5a5a56] text-center">
        No account?{" "}
        <Link href={redirect !== "/dashboard" ? `/register?redirect=${encodeURIComponent(redirect)}` : "/register"} className="text-[#185FA5] hover:underline font-medium">Create one free</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] flex flex-col items-center justify-center p-6 text-[#1a1a18]">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <Link href="/" className="flex justify-center mb-6 hover:opacity-90 transition-opacity">
          <Logo fontSize={18} size={24} />
        </Link>

        <Suspense fallback={
          <div className="bg-white border border-05 border-default rounded-[12px] p-8 text-center text-[13px] text-[#5a5a56]">
            Loading login form...
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
