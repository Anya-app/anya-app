import { notFound } from "next/navigation";
import { mockAppData } from "@/lib/data";
import {
  Card,
  SectionLabel,
  InfoRow,
  EmptyState,
} from "@/components/child/DetailPrimitives";

// ── Helpers ──────────────────────────────────────────────────

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function bmiStatus(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "#0369A1" };
  if (bmi < 25)   return { label: "Normal",      color: "#16A34A" };
  if (bmi < 30)   return { label: "Overweight",  color: "#D97706" };
  return               { label: "Obese",         color: "#DC2626" };
}

// ── Page (Server Component) ──────────────────────────────────

export default async function HealthPage({
  params,
}: {
  params: { locale: string; childId: string };
}) {
  const { childId } = params;
  const child = mockAppData.children.find((c) => c.id === childId);
  if (!child) notFound();

  const health = child.health;

  if (!health) {
    return (
      <div style={{ padding: "14px 16px" }}>
        <EmptyState emoji="❤️" message="No health information recorded yet." />
      </div>
    );
  }

  const m = health.measurements ?? {};
  const bmi =
    m.weight && m.height
      ? (m.weight / (m.height / 100) ** 2).toFixed(1)
      : null;
  const bmiInfo = bmi ? bmiStatus(Number(bmi)) : null;

  const growth = [...(health.growthTrack ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

      {/* ── Overview stat tiles ─────────────────────────────── */}
      {(m.weight || m.height) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[
            { icon: "⚖️", label: "Weight", value: m.weight ? `${m.weight} kg` : "—" },
            { icon: "📏", label: "Height", value: m.height ? `${m.height} cm` : "—" },
            { icon: "📐", label: "BMI",    value: bmi ?? "—" },
          ].map((tile) => (
            <div
              key={tile.label}
              style={{
                background: "var(--color-background-primary, #fff)",
                borderRadius: 12,
                border: "0.5px solid var(--color-border-tertiary, #e5e7eb)",
                padding: "14px 10px",
                textAlign: "center",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{tile.icon}</div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color:
                    tile.label === "BMI" && bmiInfo
                      ? bmiInfo.color
                      : "#7F77DD",
                }}
              >
                {tile.value}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary, #6b7280)", marginTop: 2 }}>
                {tile.label === "BMI" && bmiInfo
                  ? bmiInfo.label
                  : tile.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Medical conditions ───────────────────────────────── */}
      <Card>
        <SectionLabel emoji="⚕️" label="Medical" color="#DC2626" bg="#FEE2E2" />

        {(health.congenitalDisease ?? []).length > 0 ? (
          <div style={{ padding: "10px 14px", display: "flex", flexWrap: "wrap", gap: 6 }}>
            {health.congenitalDisease!.map((d) => (
              <span
                key={d}
                style={{
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  background: "#FEE2E2",
                  color: "#991B1B",
                }}
              >
                {d}
              </span>
            ))}
          </div>
        ) : (
          <InfoRow label="Conditions" value="None recorded" />
        )}

        {(health.bodyMarks ?? []).length > 0 && (
          <>
            <div
              style={{
                padding: "8px 14px 4px",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--color-text-secondary, #6b7280)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Body marks
            </div>
            {health.bodyMarks!.map((mark) => (
              <InfoRow key={mark} label="" value={`• ${mark}`} />
            ))}
          </>
        )}
      </Card>

      {/* ── Body measurements ────────────────────────────────── */}
      {Object.keys(m).length > 0 && (
        <Card>
          <SectionLabel emoji="📏" label="Measurements" color="#7C3AED" bg="#F3E8FF" />

          <InfoRow label="Weight"            value={m.weight   ? `${m.weight} kg`   : undefined} />
          <InfoRow label="Height"            value={m.height   ? `${m.height} cm`   : undefined} />
          <InfoRow label="Shoulder width"    value={m.shoulder ? `${m.shoulder} cm` : undefined} />
          <InfoRow label="Upper arm"         value={m.upperArm ? `${m.upperArm} cm` : undefined} />
          <InfoRow label="Arm"               value={m.arm      ? `${m.arm} cm`      : undefined} />
          <InfoRow label="Chest"             value={m.chest    ? `${m.chest} cm`    : undefined} />
          <InfoRow label="Waist / Hip"       value={m.waistHip ? `${m.waistHip} cm` : undefined} />
          <InfoRow label="Leg"               value={m.leg      ? `${m.leg} cm`      : undefined} />
          <InfoRow
            label="Thigh circumference"
            value={m.thighCircumference ? `${m.thighCircumference} cm` : undefined}
          />
          <InfoRow label="Shoe size (EU)"    value={m.shoeSize ? `${m.shoeSize}` : undefined} />
        </Card>
      )}

      {/* ── Growth track ─────────────────────────────────────── */}
      {growth.length > 0 && (
        <Card>
          <SectionLabel emoji="📈" label="Growth track" color="#0369A1" bg="#E0F2FE" />

          {/* Mini sparkline header row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              padding: "8px 14px",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--color-text-secondary, #6b7280)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              borderBottom: "0.5px solid var(--color-border-tertiary, #f1f5f9)",
            }}
          >
            <span>Date</span>
            <span style={{ textAlign: "center" }}>Weight</span>
            <span style={{ textAlign: "right" }}>Height</span>
          </div>

          {growth.map((record, i) => {
            const prev = growth[i + 1];
            const wDelta = prev ? record.weight - prev.weight : null;
            const hDelta = prev ? record.height - prev.height : null;
            const isLatest = i === 0;

            return (
              <div
                key={record.date}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  padding: "10px 14px",
                  borderBottom: "0.5px solid var(--color-border-tertiary, #f1f5f9)",
                  background: isLatest
                    ? "var(--color-background-secondary, #f8fafc)"
                    : undefined,
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: isLatest ? 700 : 500 }}>
                    {fmtDate(record.date)}
                  </div>
                  {isLatest && (
                    <div style={{ fontSize: 10, color: "#7F77DD", fontWeight: 600, marginTop: 1 }}>
                      Latest
                    </div>
                  )}
                </div>

                <div style={{ textAlign: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{record.weight} kg</span>
                  {wDelta !== null && (
                    <span
                      style={{
                        display: "block",
                        fontSize: 11,
                        color: wDelta >= 0 ? "#16A34A" : "#DC2626",
                        fontWeight: 600,
                      }}
                    >
                      {wDelta >= 0 ? "+" : ""}{wDelta.toFixed(1)}
                    </span>
                  )}
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{record.height} cm</span>
                  {hDelta !== null && (
                    <span
                      style={{
                        display: "block",
                        fontSize: 11,
                        color: hDelta >= 0 ? "#16A34A" : "#DC2626",
                        fontWeight: 600,
                      }}
                    >
                      {hDelta >= 0 ? "+" : ""}{hDelta.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {!m.weight && !m.height && growth.length === 0 && (
        <EmptyState emoji="📊" message="No measurements recorded yet." />
      )}
    </div>
  );
}
