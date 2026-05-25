"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import TopBar from "@/components/layout/TopBar";
import { calcAge, getChildColor, getInitials } from "@/types";
import {
  exportChildrenExcel,
  exportChildrenJson,
  exportSingleChildJson,
  importChildrenExcel,
  importChildrenJson,
} from "@/lib/childStorage";

export default function ChildrenPage() {
  const { children, t, locale } = useApp();

  return (
    <>
      <TopBar title={t.children.title} />

      <div style={{ padding: "16px" }}>
        <section
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: 16,
            padding: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: "#6B7280",
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Backup & Restore
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <button
              type="button"
              onClick={exportChildrenJson}
              style={buttonStyle("#2563EB", "#FFFFFF")}
            >
              Export Backup JSON
            </button>

            <label style={labelButtonStyle("#E5E7EB", "#374151")}>
              Import Backup JSON
              <input
                type="file"
                accept=".json,application/json"
                style={{ display: "none" }}
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;

                  try {
                    await importChildrenJson(file);
                    alert("Import JSON success");
                    window.location.reload();
                  } catch {
                    alert("Import JSON failed. Please select a valid ANYA backup file.");
                  } finally {
                    event.target.value = "";
                  }
                }}
              />
            </label>
          </div>

          <div
            style={{
              fontSize: 13,
              color: "#6B7280",
              fontWeight: 700,
              margin: "14px 0 8px",
            }}
          >
            Edit Data with Excel
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <button
              type="button"
              onClick={exportChildrenExcel}
              style={buttonStyle("#1D9E75", "#FFFFFF")}
            >
              Export Editable Excel
            </button>

            <label style={labelButtonStyle("#E1F5EE", "#087F5B")}>
              Import Edited Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                style={{ display: "none" }}
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;

                  try {
                    await importChildrenExcel(file);
                    alert("Import Excel success");
                    window.location.reload();
                  } catch (error) {
                    const message =
                      error instanceof Error ? error.message : "Import Excel failed";
                    alert(message);
                  } finally {
                    event.target.value = "";
                  }
                }}
              />
            </label>
          </div>

          <select
            defaultValue=""
            onChange={(event) => {
              if (!event.target.value) return;
              exportSingleChildJson(event.target.value);
              event.currentTarget.value = "";
            }}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              fontSize: 14,
              background: "#FFFFFF",
            }}
          >
            <option value="">Export selected child JSON...</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.basicInfo.name} {child.basicInfo.lastname}
              </option>
            ))}
          </select>

          <p
            style={{
              margin: "9px 2px 0",
              fontSize: 11,
              lineHeight: 1.45,
              color: "#6B7280",
            }}
          >
            JSON = full backup. Excel = edit names, family, school, activity goals,
            sub activities and awards. Keep all ID columns unchanged.
          </p>
        </section>

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
              position: "relative",
              zIndex: 2,
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
                    background: "var(--color-background-primary, #fff)",
                    borderRadius: 16,
                    border: "0.5px solid var(--color-border-tertiary, #e5e7eb)",
                    padding: "18px 12px 14px",
                    textAlign: "center",
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    transition: "transform .15s, box-shadow .15s",
                    position: "relative",
                    zIndex: 3,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(event) => {
                    (event.currentTarget as HTMLElement).style.transform =
                      "translateY(-2px)";
                    (event.currentTarget as HTMLElement).style.boxShadow =
                      "0 4px 16px rgba(0,0,0,0.10)";
                  }}
                  onMouseLeave={(event) => {
                    (event.currentTarget as HTMLElement).style.transform = "";
                    (event.currentTarget as HTMLElement).style.boxShadow =
                      "0 1px 4px rgba(0,0,0,0.06)";
                  }}
                >
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
                      letterSpacing: -1,
                    }}
                  >
                    {initials}
                  </div>

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

                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--color-text-secondary, #6b7280)",
                    }}
                  >
                    {child.basicInfo.nickname &&
                    child.basicInfo.nickname !== child.basicInfo.name
                      ? child.basicInfo.nickname
                      : ""}
                    {age !== null ? (
                      <>
                        {child.basicInfo.nickname &&
                        child.basicInfo.nickname !== child.basicInfo.name
                          ? " · "
                          : ""}
                        {age} {t.children.age}
                      </>
                    ) : null}
                  </div>

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
                          maxWidth: 120,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
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
            color: "var(--color-text-secondary, #6b7280)",
          }}
        >
          {children.length} / 12 children
        </p>
      </div>
    </>
  );
}

function buttonStyle(background: string, color: string) {
  return {
    padding: "10px 8px",
    minHeight: 42,
    borderRadius: 999,
    border: "none",
    background,
    color,
    fontWeight: 600,
    fontSize: 12,
    cursor: "pointer",
  };
}

function labelButtonStyle(background: string, color: string) {
  return {
    padding: "10px 8px",
    minHeight: 42,
    boxSizing: "border-box" as const,
    borderRadius: 999,
    background,
    color,
    textAlign: "center" as const,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}
