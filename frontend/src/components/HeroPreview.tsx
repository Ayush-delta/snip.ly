"use client";
import { useEffect, useState } from "react";

const BARS = [4, 7, 5, 9, 6, 8, 12, 10, 14, 11, 15, 13];

// Animated floating dashboard preview card for hero right-column
export default function HeroPreview() {
  const [count, setCount] = useState(1247);
  const [activeBar, setActiveBar] = useState(BARS.length - 1);
  // Store random value in state so it doesn't cause infinite re-renders
  const [lastMinute, setLastMinute] = useState(3);

  useEffect(() => {
    const tick = () => {
      setCount((c) => c + Math.floor(Math.random() * 3) + 1);
      setActiveBar((b) => (b + 1) % BARS.length);
      setLastMinute(Math.floor(Math.random() * 5) + 1);
    };
    const id = setInterval(tick, 2500);
    return () => clearInterval(id);
  }, []); // no deps needed — BARS is a constant now

  return (
    <div
      style={{
        background: "rgba(20,20,36,0.7)",
        border: "1px solid rgba(0,229,255,0.15)",
        borderRadius: "20px",
        backdropFilter: "blur(20px)",
        padding: "24px",
        width: "100%",
        maxWidth: "360px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,229,255,0.05)",
        fontFamily: "var(--font-mono)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div
          style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "var(--accent3)",
            boxShadow: "0 0 8px var(--accent3)",
            animation: "pulse 1.5s infinite",
          }}
        />
        <span style={{ color: "var(--muted)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Live Analytics
        </span>
      </div>

      {/* Big number */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: "var(--muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
          Total Clicks
        </div>
        <div style={{ color: "var(--accent)", fontSize: 36, fontFamily: "var(--font-syne)", fontWeight: 900, lineHeight: 1 }}>
          {count.toLocaleString()}
        </div>
        <div style={{ color: "var(--accent3)", fontSize: 11, marginTop: 6 }}>
          ↑ +{lastMinute} in the last minute
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 48, marginBottom: 20 }}>
        {BARS.map((b, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${(b / 15) * 100}%`,
              background: i === activeBar ? "var(--accent)" : "rgba(0,229,255,0.15)",
              borderRadius: "3px 3px 0 0",
              transition: "height 0.5s ease, background 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          { label: "Countries", val: "42", color: "var(--accent2)" },
          { label: "Mobile", val: "68%", color: "var(--accent3)" },
          { label: "Today", val: "234", color: "var(--warn)" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 8,
              padding: "8px 10px",
            }}
          >
            <div style={{ color: s.color, fontSize: 14, fontWeight: 700 }}>{s.val}</div>
            <div style={{ color: "var(--muted)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
