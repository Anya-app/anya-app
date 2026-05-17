"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";

interface ChildTabBarProps {
  childId: string;
}

export default function ChildTabBar({ childId }: ChildTabBarProps) {
  const { locale, t } = useApp();
  const pathname = usePathname();

  const base = `/${locale}/children/${childId}`;

  const tabs = [
    { href: `${base}/basic-info`, label: t.child.basicInfo, emoji: "🪪" },
    { href: `${base}/health`,     label: t.child.health,    emoji: "❤️" },
    { href: `${base}/school`,     label: t.child.school,    emoji: "🏫" },
    { href: `${base}/activities`, label: t.child.activities, emoji: "⭐" },
    { href: `${base}/awards`,     label: t.child.awards,    emoji: "🏆" },
  ];

  return (
    <nav
      aria-label="Child sections"
      style={{
        display: "flex",
        overflowX: "auto",
        scrollbarWidth: "none",
        background: "var(--color-background-primary, #fff)",
        borderBottom: "2px solid var(--color-border-tertiary, #e5e7eb)",
        position: "sticky",
        top: 56,          // below TopBar
        zIndex: 30,
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
              flex: "none",
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "11px 14px",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: active ? 700 : 500,
              color: active ? "#7F77DD" : "var(--color-text-secondary, #6b7280)",
              borderBottom: `2.5px solid ${active ? "#7F77DD" : "transparent"}`,
              marginBottom: -2,
              whiteSpace: "nowrap",
              transition: "color .15s",
            }}
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
