"use client";

import { useChild } from "@/context/ChildContext";
import { useApp } from "@/context/AppContext";
import { calcAge, getChildColor, getInitials } from "@/types";
import { mockAppData } from "@/lib/data";

export default function ChildHeader() {
  const child = useChild();
  const { t } = useApp();

  // Derive color index from position in children array
  const idx = mockAppData.children.findIndex((c) => c.id === child.id);
  const color = getChildColor(idx);
  const initials = getInitials(child.basicInfo.name, child.basicInfo.lastname);
  const age = calcAge(child.basicInfo.dateOfBirth);
  const school = child.schoolRecords?.[0];

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${color.dot}22, ${color.dot}11)`,
        borderBottom: `0.5px solid ${color.dot}33`,
        padding: "14px 16px 12px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      {/* Avatar */}
      <div
        aria-hidden="true"
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: color.bg,
          border: `2px solid ${color.dot}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          fontWeight: 800,
          color: color.text,
          flexShrink: 0,
          letterSpacing: -1,
        }}
      >
        {initials}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: "var(--color-text-primary, #111827)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {child.basicInfo.name}
          {child.basicInfo.nickname && child.basicInfo.nickname !== child.basicInfo.name
            ? ` "${child.basicInfo.nickname}"`
            : ""}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--color-text-secondary, #6b7280)",
            marginTop: 2,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          {age !== null && (
            <span>
              🎂 {age} {t.child.age}
            </span>
          )}
          {school && (
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 200,
              }}
            >
              🏫 {school.schoolName}
            </span>
          )}
        </div>
      </div>

      {/* Award count pill */}
      {(child.awards?.length ?? 0) > 0 && (
        <div
          style={{
            background: "#FEF9C3",
            color: "#854D0E",
            borderRadius: 20,
            padding: "4px 10px",
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          🏆 {child.awards!.length}
        </div>
      )}
    </div>
  );
}
