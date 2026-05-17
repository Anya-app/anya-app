"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function BottomNav() {
  const { locale, t } = useApp();
  const pathname = usePathname();

  const tabs = [
    {
      href: `/${locale}/dashboard`,
      label: t.nav.dashboard,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"}
          stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      href: `/${locale}/children`,
      label: t.nav.children,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="7" r="3" fill={active ? "currentColor" : "none"} />
          <circle cx="17" cy="8" r="2.5" fill={active ? "currentColor" : "none"} />
          <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
          <path d="M16 14c2.2.4 4 2.2 4 5" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: "var(--color-background-primary, #fff)",
        borderTop: "0.5px solid var(--color-border-tertiary, #e5e7eb)",
        display: "flex",
        zIndex: 50,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              textDecoration: "none",
              color: active ? "#7F77DD" : "var(--color-text-secondary, #6b7280)",
              fontSize: 11,
              fontWeight: active ? 700 : 500,
              transition: "color .15s",
            }}
          >
            {tab.icon(active)}
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
