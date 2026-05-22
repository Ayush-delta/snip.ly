"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function PricingPage() {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<"form" | "processing" | "success">("form");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [error, setError] = useState("");

  const handleCheckoutOpen = (planName: string) => {
    setCheckoutPlan(planName);
    setPaymentStep("form");
    setCardName("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
    setError("");
  };

  const handleCheckoutClose = () => {
    setCheckoutPlan(null);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!cardName || !cardNumber || !cardExpiry || !cardCvc) {
      setError("Please fill in all payment details.");
      return;
    }

    if (cardNumber.replace(/\s/g, "").length < 16) {
      setError("Please enter a valid 16-digit card number.");
      return;
    }

    setPaymentStep("processing");

    setTimeout(() => {
      setPaymentStep("success");
    }, 1500);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  return (
    <main className="min-h-screen bg-white text-[#1a1a18] relative z-10">
      {/* Nav */}
      <nav className="h-[52px] bg-white border-b border-05 border-default sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-full flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo />
          </Link>
          <Link href="/" className="text-[13px] text-[#5a5a56] hover:text-[#1a1a18] transition-colors font-medium">
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* Pricing Header */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="mb-12">
          <h1 className="text-[28px] font-medium text-[#1a1a18] tracking-[-0.5px] mb-2">
            Simple, transparent pricing
          </h1>
          <p className="text-[14px] text-[#5a5a56] max-w-[500px] mx-auto mb-8">
            Choose the plan that fits your redirection needs. Upgrade or downgrade at any time.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center bg-[#f7f7f5] border border-05 border-default p-0.5 rounded-[8px]">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 rounded-[6px] text-[13px] font-medium transition-all ${
                !isAnnual
                  ? "bg-white text-[#1a1a18] border border-05 border-default shadow-sm"
                  : "text-[#5a5a56] hover:text-[#1a1a18]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-1.5 rounded-[6px] text-[13px] font-medium transition-all flex items-center gap-1.5 ${
                isAnnual
                  ? "bg-white text-[#1a1a18] border border-05 border-default shadow-sm"
                  : "text-[#5a5a56] hover:text-[#1a1a18]"
              }`}
            >
              Annually
              <span className="bg-[#185FA5]/10 text-[#185FA5] text-[10px] px-1.5 py-0.5 rounded-[4px] font-medium">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto items-stretch">
          {/* Free Plan */}
          <div className="bg-white border border-05 border-default rounded-[12px] p-6 flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <h3 className="text-[14px] font-medium text-[#5a5a56] uppercase tracking-wider">Free</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-[32px] font-medium tracking-tight text-[#1a1a18]">$0</span>
                  <span className="text-[13px] text-[#9a9a96] ml-1">/mo</span>
                </div>
                <p className="text-[12px] text-[#9a9a96] mt-1">Perfect for personal use</p>
              </div>

              <div className="border-t border-05 border-default my-4" />

              <ul className="flex flex-col gap-3 mb-6">
                {[
                  "50 links per month",
                  "Basic analytics (clicks, countries)",
                  "1 custom domain",
                  "Standard redirect speed",
                ].map((feature, i) => (
                  <li key={i} className="text-[13px] text-[#5a5a56] flex items-start gap-2">
                    <svg className="w-4 h-4 text-[#1D9E75] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button
              disabled
              className="w-full h-[40px] border border-05 border-default rounded-[8px] text-[13px] font-medium text-[#9a9a96] bg-[#f7f7f5] cursor-not-allowed text-center"
            >
              Current Plan
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white border border-05 border-[#185FA5] rounded-[12px] p-6 flex flex-col justify-between relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#185FA5] text-[#E6F1FB] text-[10px] font-medium uppercase tracking-wider px-2.5 py-0.5 rounded-[10px]">
              Most Popular
            </span>
            <div>
              <div className="mb-4">
                <h3 className="text-[14px] font-medium text-[#185FA5] uppercase tracking-wider">Pro</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-[32px] font-medium tracking-tight text-[#1a1a18]">
                    {isAnnual ? "$15" : "$19"}
                  </span>
                  <span className="text-[13px] text-[#9a9a96] ml-1">/mo</span>
                </div>
                <p className="text-[12px] text-[#9a9a96] mt-1">
                  {isAnnual ? "Billed annually ($180/yr)" : "Billed monthly"}
                </p>
              </div>

              <div className="border-t border-05 border-default my-4" />

              <ul className="flex flex-col gap-3 mb-6">
                {[
                  "Unlimited links",
                  "Deep analytics (devices, referrers)",
                  "CTA overlays",
                  "Custom aliases",
                  "5 custom domains",
                  "Priority support",
                ].map((feature, i) => (
                  <li key={i} className="text-[13px] text-[#5a5a56] flex items-start gap-2">
                    <svg className="w-4 h-4 text-[#1D9E75] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleCheckoutOpen("Pro")}
              className="w-full h-[40px] bg-[#185FA5] text-[#E6F1FB] hover:bg-[#0C447C] rounded-[8px] text-[13px] font-medium transition-colors text-center"
            >
              Upgrade to Pro
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white border border-05 border-default rounded-[12px] p-6 flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <h3 className="text-[14px] font-medium text-[#5a5a56] uppercase tracking-wider">Enterprise</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-[32px] font-medium tracking-tight text-[#1a1a18]">
                    {isAnnual ? "$79" : "$99"}
                  </span>
                  <span className="text-[13px] text-[#9a9a96] ml-1">/mo</span>
                </div>
                <p className="text-[12px] text-[#9a9a96] mt-1">
                  {isAnnual ? "Billed annually ($948/yr)" : "Billed monthly"}
                </p>
              </div>

              <div className="border-t border-05 border-default my-4" />

              <ul className="flex flex-col gap-3 mb-6">
                {[
                  "Everything in Pro",
                  "Unlimited custom domains",
                  "Team collaboration (up to 5)",
                  "Dedicated support SLA",
                  "99.9% uptime SLA",
                  "API Access & Webhooks",
                ].map((feature, i) => (
                  <li key={i} className="text-[13px] text-[#5a5a56] flex items-start gap-2">
                    <svg className="w-4 h-4 text-[#1D9E75] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleCheckoutOpen("Enterprise")}
              className="w-full h-[40px] border border-05 border-[#185FA5] text-[#185FA5] hover:bg-[#185FA5]/5 rounded-[8px] text-[13px] font-medium transition-colors text-center"
            >
              Upgrade to Enterprise
            </button>
          </div>
        </div>
      </section>

      {/* Checkout Simulator Modal Overlay */}
      {checkoutPlan && (
        <div className="fixed inset-0 z-50 bg-[#1a1a18]/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white border border-05 border-default rounded-[12px] p-6 max-w-[400px] w-full flex flex-col gap-6 shadow-sm">
            
            {paymentStep === "form" && (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-[18px] font-medium text-[#1a1a18]">Complete Upgrade</h2>
                    <p className="text-[12px] text-[#5a5a56] mt-0.5">
                      Upgrading to {checkoutPlan} ({isAnnual ? "Annual Billing" : "Monthly Billing"})
                    </p>
                  </div>
                  <button
                    onClick={handleCheckoutClose}
                    className="text-[#9a9a96] hover:text-[#1a1a18] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Plan details box */}
                <div className="bg-[#f7f7f5] border border-05 border-default rounded-[8px] p-4 flex justify-between items-center text-[13px]">
                  <span className="font-medium text-[#1a1a18]">{checkoutPlan} Plan</span>
                  <span className="font-medium text-[#1a1a18]">
                    {checkoutPlan === "Pro"
                      ? isAnnual ? "$15/mo ($180 total)" : "$19/mo"
                      : isAnnual ? "$79/mo ($948 total)" : "$99/mo"
                    }
                  </span>
                </div>

                <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-4">
                  {/* Cardholder Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[#5a5a56] uppercase tracking-wider font-medium">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full h-[40px] px-3 border border-05 border-default rounded-[8px] text-[13px] text-[#1a1a18] outline-none focus:border-[#185FA5] focus:ring-3 focus:ring-[#185FA5]/15 transition-all bg-white"
                    />
                  </div>

                  {/* Card Number */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] text-[#5a5a56] uppercase tracking-wider font-medium">Card Number</label>
                    <input
                      type="text"
                      required
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="4000 1234 5678 9010"
                      className="w-full h-[40px] px-3 border border-05 border-default rounded-[8px] text-[13px] text-[#1a1a18] outline-none focus:border-[#185FA5] focus:ring-3 focus:ring-[#185FA5]/15 transition-all bg-white"
                    />
                  </div>

                  {/* Expiry & CVC */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-[#5a5a56] uppercase tracking-wider font-medium">Expiration</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        className="w-full h-[40px] px-3 border border-05 border-default rounded-[8px] text-[13px] text-[#1a1a18] outline-none focus:border-[#185FA5] focus:ring-3 focus:ring-[#185FA5]/15 transition-all bg-white text-center"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-[#5a5a56] uppercase tracking-wider font-medium">CVC</label>
                      <input
                        type="text"
                        required
                        maxLength={3}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/gi, ""))}
                        placeholder="123"
                        className="w-full h-[40px] px-3 border border-05 border-default rounded-[8px] text-[13px] text-[#1a1a18] outline-none focus:border-[#185FA5] focus:ring-3 focus:ring-[#185FA5]/15 transition-all bg-white text-center"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-[#D85A30]/10 border border-05 border-[#D85A30]/30 text-[#D85A30] rounded-[8px] p-3 text-[12px]">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full h-[40px] bg-[#185FA5] text-[#E6F1FB] hover:bg-[#0C447C] rounded-[8px] text-[13px] font-medium transition-colors text-center mt-2"
                  >
                    Pay &amp; Upgrade
                  </button>
                </form>
              </>
            )}

            {paymentStep === "processing" && (
              <div className="py-12 flex flex-col items-center gap-4 text-center">
                <svg className="animate-spin h-8 w-8 text-[#185FA5]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <h3 className="text-[15px] font-medium text-[#1a1a18]">Processing Payment...</h3>
                <p className="text-[12px] text-[#5a5a56]">Securing your connection and billing details.</p>
              </div>
            )}

            {paymentStep === "success" && (
              <div className="py-6 flex flex-col items-center gap-4 text-center">
                <div className="w-12 h-12 bg-[#1D9E75]/10 text-[#1D9E75] rounded-full flex items-center justify-center text-[20px] font-bold">
                  ✓
                </div>
                <h2 className="text-[18px] font-medium text-[#1a1a18]">Upgrade Successful!</h2>
                <p className="text-[13px] text-[#5a5a56] leading-[1.6]">
                  Thank you! Your account has been upgraded to the <strong>{checkoutPlan}</strong> plan. A receipt has been sent to your email.
                </p>
                <div className="w-full flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => {
                      handleCheckoutClose();
                      router.push("/dashboard");
                    }}
                    className="w-full h-[40px] bg-[#185FA5] text-[#E6F1FB] hover:bg-[#0C447C] rounded-[8px] text-[13px] font-medium transition-colors text-center"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={handleCheckoutClose}
                    className="w-full h-[40px] bg-[#f7f7f5] hover:bg-[#e6e6e2] text-[#1a1a18] border border-05 border-default rounded-[8px] text-[13px] font-medium transition-colors text-center"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </main>
  );
}
