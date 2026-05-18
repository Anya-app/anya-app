import { notFound } from "next/navigation";
import { mockAppData } from "@/lib/data";
import type { AwardLevel } from "@/types";
import { Card, EmptyState } from "@/components/child/DetailPrimitives";

// ── Helpers ──────────────────────────────────────────────────

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const LEVEL_STYLE: Record<
  AwardLevel,
  { label: string; emoji: string; bg: string; color: string; border: string }
> = {
  international: {
    label: "International",
    emoji: "🌏",
    bg: "#FEF9C3",
    color: "#713F12",
    border: "#EAB308",
  },
  national: {
    label: "National",
    emoji: "🇹🇭",
    bg: "#FEE2E2",
    color: "#991B1B",
    border: "#EF4444",
  },
  provincial: {
    label: "Provincial",
    emoji: "🏙",
    bg: "#EDE9FE",
    color: "#4C1D95",
    border: "#8B5CF6",
  },
  district: {
    label: "District",
    emoji: "🗺",
    bg: "#DBEAFE",
    color: "#1E3A8A",
    border: "#3B82F6",
  },
  school: {
    label: "School",
    emoji: "🏫",
    bg: "#DCFCE7",
    color: "#14532D",
    border: "#22C55E",
  },
};

const CATEGORY_EMOJI: Record<string, string> = {
  วิทยาศาสตร์: "🔬",
  วิชาการ: "📚",
  กีฬา: "🏅",
  ดนตรี: "🎵",
  ศิลปะ: "🎨",
  Mathematics: "📐",
};

function categoryEmoji(cat?: string): string {
  if (!cat) return "🏆";
  return CATEGORY_EMOJI[cat] ?? "🏆";
}

// ── Page (Server Component) ──────────────────────────────────

export default async function AwardsPage({
  params,
}: {
  params: { locale: string; childId: string };
}) {
  const { childId } = params;
  const child = mockAppData.children.find((c) => c.id === childId);
  if (!child) notFound();

  const awards = [...(child.awards ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (awards.length === 0) {
    return (
      <div style={{ padding: "14px 16px" }}>
        <EmptyState emoji="🏆" message="No awards recorded yet." />
      </div>
    );
  }

  // ── Summary banner ─────────────────────────────────────────
  const levelCounts = awards.reduce<Partial<Record<AwardLevel, number>>>(
    (acc, a) => {
      if (a.level) acc[a.level] = (acc[a.level] ?? 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Trophy count banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #FEFCE8, #FEF9C3)",
          border: "1.5px solid #EAB30844",
          borderRadius: 12,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span style={{ fontSize: 36 }}>🏆</span>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#713F12" }}>
            {awards.length} Award{awards.length !== 1 ? "s" : ""}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
            {(Object.entries(levelCounts) as [AwardLevel, number][]).map(
              ([level, count]) => {
                const s = LEVEL_STYLE[level];
                return (
                  <span
                    key={level}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 10,
                      background: s.bg,
                      color: s.color,
                    }}
                  >
                    {s.emoji} {s.label} · {count}
                  </span>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Award cards */}
      {awards.map((award) => {
        const lvl = award.level ? LEVEL_STYLE[award.level] : null;
        const catEmoji = categoryEmoji(award.category);

        return (
          <Card key={award.id}>
            <div
              style={{
                padding: "14px",
                borderLeft: lvl ? `4px solid ${lvl.border}` : "4px solid #EAB308",
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 10,
                  background: lvl ? lvl.bg : "#FEF9C3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  flexShrink: 0,
                }}
              >
                {catEmoji}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 5, lineHeight: 1.4 }}>
                  {award.awardName}
                </div>

                {/* Badges row */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                  {lvl && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 10,
                        background: lvl.bg,
                        color: lvl.color,
                      }}
                    >
                      {lvl.emoji} {lvl.label}
                    </span>
                  )}
                  {award.category && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 10,
                        background: "var(--color-background-secondary, #f8fafc)",
                        color: "var(--color-text-secondary, #6b7280)",
                      }}
                    >
                      {award.category}
                    </span>
                  )}
                </div>

                {/* Date + Org */}
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--color-text-secondary, #6b7280)",
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <span>📅 {fmtDate(award.date)}</span>
                  {award.organization && <span>🏢 {award.organization}</span>}
                </div>

                {/* Note */}
                {award.note && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-secondary, #6b7280)",
                      marginTop: 6,
                      padding: "6px 10px",
                      background: "var(--color-background-secondary, #f8fafc)",
                      borderRadius: 7,
                      lineHeight: 1.5,
                      fontStyle: "italic",
                    }}
                  >
                    {award.note}
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
