"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import TopBar from "@/components/layout/TopBar";
import { calcAge, getChildColor, getInitials } from "@/types";
import {
  exportChildrenJson,
  importChildrenJson,
} from "@/lib/childStorage";

export default function ChildrenPage() {
  const { children, t, locale } = useApp();

  return (
    <>
      <TopBar title={t.children.title} />

      <div style={{ padding: "16px" }}>
        {/* ✅ Backup Buttons */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            onClick={exportChildrenJson}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 999,
              border: "none",
              background: "#2563EB",
              color: "white",
              fontWeight: 600,
            }}
          >
            Export Backup
          </button>

          <label
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 999,
              background: "#E5E7EB",
              textAlign: "center",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Import Backup
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                await importChildrenJson(file);
                alert("Import success");
                window.location.reload();
              }}
            />
          </label>
        </div>

        {/* ✅ Children Grid */}
        {children.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>👶</div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px" }}>
              {t.children.noChildren}
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--color-text-secondary, #6b7280)",
                margin: 0,
              }}
            >
              {t.children.noChildrenSub}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 12,
            }}
          >
            {children.map((child, i) => {
              const color = getChildColor(i);
              const initials = getInitials(
                child.basicInfo.name,
                child.basicInfo.lastname
              );
              const age = calcAge(child.basicInfo.dateOfBirth);
              const school = child.schoolRecords?.[0];

              return (
                <Link
                  key={child.id}
                  href={`/${locale}/children/${child.id}/basic-info`}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    border: "0.5px solid #e5e7eb",
                    padding: "18px 12px 14px",
                    textAlign: "center",
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      background: color.bg,
                      border: `2px solid ${color.dot}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      fontWeight: 800,
                      color: color.text,
                    }}
                  >
                    {initials}
                  </div>

                  {/* Name */}
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: "100%",
                    }}
                  >
                    {child.basicInfo.name}
                  </div>

                  {/* Subtitle */}
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    {child.basicInfo.nickname}
                    {age !== null && ` · ${age} ${t.children.age}`}
                  </div>

                  {/* Tags */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 4,
                      justifyContent: "center",
                    }}
                  >
                    {school && (
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 7px",
                          borderRadius: 10,
                          background: color.bg,
                          color: color.text,
                          fontWeight: 600,
                        }}
                      >
                        {school.schoolLevel}
                      </span>
                    )}

                    {(child.awards?.length ?? 0) > 0 && (
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 7px",
                          borderRadius: 10,
                          background: "#FEF9C3",
                          color: "#854D0E",
                          fontWeight: 600,
                        }}
                      >
                        🏆 {child.awards!.length}
                      </span>
                    )}

                    {(child.activities?.length ?? 0) > 0 && (
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 7px",
                          borderRadius: 10,
                          background: "#E1F5EE",
                          color: "#0F6E56",
                          fontWeight: 600,
                        }}
                      >
                        ⭐ {child.activities!.length}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <p
          style={{
            textAlign: "center",
            marginTop: 16,
            fontSize: 12,
            color: "#6b7280",
          }}
        >
          {children.length} / 12 children
        </p>
      </div>
    </>
  );
}
