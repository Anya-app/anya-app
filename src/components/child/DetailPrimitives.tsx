import React from "react";

export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        border: "0.5px solid #e5e7eb",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

export function SectionLabel({
  emoji,
  label,
  color,
  bg,
}: {
  emoji: string;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "10px 14px",
        fontSize: 13,
        fontWeight: 700,
        background: bg,
        color: color,
      }}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </div>
  );
}

export function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 14px",
        borderBottom: "0.5px solid #f1f5f9",
        fontSize: 14,
      }}
    >
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value ?? "-"}</span>
    </div>
  );
}

export function EmptyState({
  emoji,
  message,
}: {
  emoji?: string;
  message: string;
}) {
  return (
    <div
      style={{
        padding: 20,
        textAlign: "center",
        border: "1px dashed #e5e7eb",
        borderRadius: 12,
        background: "#fafafa",
      }}
    >
      <div style={{ fontSize: 24 }}>{emoji}</div>
      <div style={{ marginTop: 6, color: "#6b7280" }}>{message}</div>
    </div>
  );
}
export function Pill({
  children,
  label,
  color = "#7F77DD",
  bg = "#F3F0FF",
}: {
  children?: React.ReactNode;
  label?: React.ReactNode;
  color?: string;
  bg?: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: bg,
        color,
      }}
    >
      {children ?? label}
    </span>
  );
}
export function ScoreBar({
  value,
  max,
  score,
  maxScore,
  color = "#7F77DD",
}: {
  value?: number;
  max?: number;
  score?: number;
  maxScore?: number;
  color?: string;
}) {
  const finalValue = score ?? value ?? 0;
  const finalMax = maxScore ?? max ?? 100;

  const percent =
    finalMax > 0
      ? Math.min(100, Math.max(0, (finalValue / finalMax) * 100))
      : 0;

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          height: 8,
          background: "#E5E7EB",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: color,
            borderRadius: 999,
          }}
        />
      </div>
      <div style={{ marginTop: 4, fontSize: 11, color: "#6B7280" }}>
        {finalValue} / {finalMax}
      </div>
    </div>
  );
}
