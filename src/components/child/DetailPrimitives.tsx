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
}: {
  label: string;
  value?: React.ReactNode;
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
