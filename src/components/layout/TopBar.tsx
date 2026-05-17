"use client";

import { useApp } from "@/context/AppContext";
import type { Locale } from "@/types";

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function TopBar({ title, showBack, onBack }: TopBarProps) {
  const { t, locale, setLocale } = useApp();

  const toggle = () => setLocale(locale === "th" ? "en" : "th");

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "var(--color-background-primary, #fff)",
        borderBottom: "0.5px solid var(--color-border-tertiary, #e5e7eb)",
        height: 56,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 10,
      }}
    >
      {showBack && (
        <button
          onClick={onBack}
          aria-label={t.common.back}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "6px 4px",
            color: "#7F77DD",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* Logo / title */}
      <div style={{ flex: 1 }}>
        {title ? (
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--color-text-primary, #111827)" }}>
            {title}
          </h1>
        ) : (
          <span style={{ fontSize: 18, fontWeight: 800, color: "#7F77DD", letterSpacing: "-0.03em" }}>
            {t.appName}
          </span>
        )}
      </div>

      {/* Lang toggle */}
      <button
        onClick={toggle}
        aria-label="Switch language"
        style={{
          padding: "5px 12px",
          borderRadius: 20,
          border: "1px solid var(--color-border-secondary, #e2e8f0)",
          background: "var(--color-background-secondary, #f8fafc)",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--color-text-secondary, #64748b)",
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "all .15s",
        }}
      >
        {t.common.switchLang}
      </button>
    </header>
  );
}
