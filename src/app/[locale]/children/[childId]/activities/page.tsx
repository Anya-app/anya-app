import { notFound } from "next/navigation";
import { mockAppData } from "@/lib/data";
import { Card, SectionLabel, EmptyState } from "@/components/child/DetailPrimitives";

// ── Helpers ──────────────────────────────────────────────────

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Category → colour mapping (falls back to brand purple)
const CAT_STYLE: Record<string, { bg: string; color: string; emoji: string }> = {
  กีฬา:      { bg: "#DCFCE7", color: "#15803D", emoji: "⚽" },
  ดนตรี:     { bg: "#EDE9FE", color: "#6D28D9", emoji: "🎵" },
  วิชาการ:   { bg: "#DBEAFE", color: "#1D4ED8", emoji: "📚" },
  อาสาสมัคร: { bg: "#FEF9C3", color: "#854D0E", emoji: "🤝" },
  ศิลปะ:     { bg: "#FCE7F3", color: "#9D174D", emoji: "🎨" },
};

function catStyle(cat?: string) {
  if (!cat) return { bg: "#EEEDFE", color: "#7F77DD", emoji: "⭐" };
  return CAT_STYLE[cat] ?? { bg: "#EEEDFE", color: "#7F77DD", emoji: "⭐" };
}

// ── Page (Server Component) ──────────────────────────────────

export default async function ActivitiesPage({
  params,
}: {
  params: { locale: string; childId: string };
}) {
  const { childId } = params;
  const child = mockAppData.children.find((c) => c.id === childId);
  if (!child) notFound();

  const activities = child.activities ?? [];

  // Also collect school-level activities from school records
const schoolActivities = [];

  const all = [
    ...activities,
    ...schoolActivities,
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (all.length === 0) {
    return (
      <div style={{ padding: "14px 16px" }}>
        <EmptyState emoji="⭐" message="No activities recorded yet." />
      </div>
    );
  }

  // Group by category
  const categories = Array.from(new Set(all.map((a) => a.category ?? "Other")));

  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

      {/* Summary pill row */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {categories.map((cat) => {
          const style = catStyle(cat);
          const count = all.filter((a) => (a.category ?? "Other") === cat).length;
          return (
            <span
              key={cat}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                background: style.bg,
                color: style.color,
              }}
            >
              {style.emoji} {cat} · {count}
            </span>
          );
        })}
      </div>

      {/* Activity cards */}
      {all.map((act) => {
        const style = catStyle(act.category);
        return (
          <Card key={act.id}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                padding: "14px",
                gap: 12,
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: style.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {style.emoji}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                  {act.activityName}
                </div>

                {/* Category + role pills */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 5 }}>
                  {act.category && (
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 10,
                        background: style.bg,
                        color: style.color,
                        fontWeight: 600,
                      }}
                    >
                      {act.category}
                    </span>
                  )}
                  {act.role && (
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 10,
                        background: "var(--color-background-secondary, #f8fafc)",
                        color: "var(--color-text-secondary, #6b7280)",
                        fontWeight: 500,
                      }}
                    >
                      {act.role}
                    </span>
                  )}
                </div>

                {/* Date */}
                <div style={{ fontSize: 12, color: "var(--color-text-secondary, #6b7280)" }}>
                  📅 {fmtDate(act.date)}
                  {act.endDate ? ` → ${fmtDate(act.endDate)}` : ""}
                </div>

                {/* Note */}
                {act.note && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-secondary, #6b7280)",
                      marginTop: 5,
                      padding: "6px 10px",
                      background: "var(--color-background-secondary, #f8fafc)",
                      borderRadius: 7,
                      lineHeight: 1.5,
                    }}
                  >
                    {act.note}
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
