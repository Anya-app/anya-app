"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import TopBar from "@/components/layout/TopBar";
import { getChildColor, getInitials, calcAge, type Child } from "@/types";

// ✅ เพิ่ม child ใหม่
function createEmptyChild(): Child {
  return {
    id: crypto.randomUUID(),
    basicInfo: {
      name: "New Child",
      lastname: "",
      nickname: "",
      dateOfBirth: "",
      gender: "",
    },
    healthRecords: [],
    schoolRecords: [],
    activities: [],
    awards: [],
  };
}

// ── Page ─────────────────────────────────────────────────────

export default function DashboardPage() {
  const { children, setChildren, t, locale } = useApp(); // ✅ ต้องมี setChildren
  const [selectedId, setSelectedId] = useState<string | "all">("all");

  // ✅ ADD CHILD
  const handleAddChild = () => {
    const newChild = createEmptyChild();
    setChildren((prev: Child[]) => [...prev, newChild]);
  };

  // ✅ DELETE CHILD
  const handleDeleteChild = (id: string) => {
    const ok = window.confirm("Delete this child?");
    if (!ok) return;
    setChildren((prev: Child[]) => prev.filter((c) => c.id !== id));
  };

  return (
    <>
      <TopBar />

      {/* Header */}
      <div style={{ padding: "16px" }}>
        <h1>{t.dashboard.title}</h1>

        {/* ✅ ADD BUTTON */}
        <button
          onClick={handleAddChild}
          style={{
            marginTop: 10,
            padding: "8px 12px",
            borderRadius: 8,
            background: "#7F77DD",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          + Add Child
        </button>
      </div>

      {/* Children list */}
      <div style={{ padding: "0 16px" }}>
        {children.map((child, i) => {
          const color = getChildColor(i);
          const initials = getInitials(child.basicInfo.name, child.basicInfo.lastname);
          const age = calcAge(child.basicInfo.dateOfBirth);

          return (
            <div
              key={child.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 12,
                padding: "12px",
                marginBottom: 10,
              }}
            >
              {/* LEFT */}
              <Link
                href={`/${locale}/children/${child.id}/basic-info`}
                style={{ display: "flex", gap: 12, textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: color.bg,
                    color: color.text,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}
                >
                  {initials}
                </div>

                <div>
                  <div style={{ fontWeight: 700 }}>
                    {child.basicInfo.name} {child.basicInfo.lastname}
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {age !== null && `${age} yrs`}
                  </div>
                </div>
              </Link>

              {/* RIGHT */}
              <button
                onClick={() => handleDeleteChild(child.id)}
                style={{
                  background: "#EF4444",
                  color: "#fff",
                  border: "none",
                  padding: "6px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
