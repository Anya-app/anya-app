"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import TopBar from "@/components/layout/TopBar";
import { getChildColor, getInitials, calcAge, type Child } from "@/types";

type Gender = "male" | "female" | "other";

type ChildForm = {
  name: string;
  lastname: string;
  nickname: string;
  dateOfBirth: string;
  gender: "" | Gender;
};

function emptyForm(): ChildForm {
  return {
    name: "",
    lastname: "",
    nickname: "",
    dateOfBirth: "",
    gender: "",
  };
}

function createChild(form: ChildForm): Child {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    basicInfo: {
      name: form.name.trim() || "New Child",
      lastname: form.lastname.trim(),
      nickname: form.nickname.trim(),
      dateOfBirth: form.dateOfBirth,
      gender: form.gender || undefined,
    },
    profilePhotoUrl: "",
    createdAt: now,
    updatedAt: now,
    health: {},
    schoolRecords: [],
    activities: [],
    awards: [],
    calendarEvents: [],
    attachments: [],
  };
}

export default function DashboardPage() {
  const { children, setChildren, t, locale } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState<ChildForm>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddChild = () => {
    const newChild = createChild(form);
    setChildren((prev: Child[]) => [...prev, newChild]);
    setForm(emptyForm());
    setIsAddOpen(false);
  };

  const handleDeleteChild = (id: string) => {
    const ok = window.confirm("Delete this child?");
    if (!ok) return;

    setChildren((prev: Child[]) => prev.filter((c) => c.id !== id));
  };

  const updateBasicInfo = (
    childId: string,
    field: "name" | "lastname" | "nickname" | "dateOfBirth" | "gender",
    value: string
  ) => {
    setChildren((prev: Child[]) =>
      prev.map((child) =>
        child.id === childId
          ? {
              ...child,
              updatedAt: new Date().toISOString(),
              basicInfo: {
                ...child.basicInfo,
                [field]: field === "gender" ? (value || undefined) : value,
              },
            }
          : child
      )
    );
  };

  return (
    <>
      <TopBar />

      <div style={{ padding: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 22 }}>{t.dashboard.title}</h1>
            <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: 13 }}>
              {children.length} {t.nav.children}
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            style={{
              background: "#7F77DD",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            + {t.children.addChild}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {children.map((child, i) => {
            const color = getChildColor(i);
            const initials = getInitials(child.basicInfo.name, child.basicInfo.lastname);
            const age = calcAge(child.basicInfo.dateOfBirth);
            const isEditing = editingId === child.id;

            return (
              <div
                key={child.id}
                style={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: 14,
                  padding: 14,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      background: color.bg,
                      color: color.text,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>

                  <div style={{ flex: 1 }}>
                    {isEditing ? (
                      <div style={{ display: "grid", gap: 8 }}>
                        <input
                          value={child.basicInfo.name}
                          onChange={(e) => updateBasicInfo(child.id, "name", e.target.value)}
                          placeholder="First name"
                          style={inputStyle}
                        />
                        <input
                          value={child.basicInfo.lastname}
                          onChange={(e) => updateBasicInfo(child.id, "lastname", e.target.value)}
                          placeholder="Last name"
                          style={inputStyle}
                        />
                        <input
                          value={child.basicInfo.nickname ?? ""}
                          onChange={(e) => updateBasicInfo(child.id, "nickname", e.target.value)}
                          placeholder="Nickname"
                          style={inputStyle}
                        />
                        <input
                          type="date"
                          value={child.basicInfo.dateOfBirth}
                          onChange={(e) => updateBasicInfo(child.id, "dateOfBirth", e.target.value)}
                          style={inputStyle}
                        />
                        <select
                          value={child.basicInfo.gender ?? ""}
                          onChange={(e) => updateBasicInfo(child.id, "gender", e.target.value)}
                          style={inputStyle}
                        >
                          <option value="">Select gender</option>
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    ) : (
                      <Link
                        href={`/${locale}/children/${child.id}/basic-info`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div style={{ fontWeight: 800, fontSize: 15 }}>
                          {child.basicInfo.name} {child.basicInfo.lastname}
                        </div>
                        <div style={{ color: "#6B7280", fontSize: 13, marginTop: 3 }}>
                          {child.basicInfo.nickname ? `${child.basicInfo.nickname} · ` : ""}
                          {age !== null ? `${age} ${t.children.age}` : "No birth date"}
                          {child.basicInfo.gender ? ` · ${child.basicInfo.gender}` : ""}
                        </div>
                      </Link>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => setEditingId(isEditing ? null : child.id)}
                      style={smallButtonStyle}
                    >
                      {isEditing ? "Done" : t.common.edit}
                    </button>

                    <button
                      onClick={() => handleDeleteChild(child.id)}
                      style={{
                        ...smallButtonStyle,
                        background: "#FEE2E2",
                        color: "#B91C1C",
                      }}
                    >
                      {t.common.delete}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isAddOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 50,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              background: "#fff",
              borderRadius: 18,
              padding: 18,
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <h2 style={{ margin: "0 0 12px", fontSize: 18 }}>{t.children.addChild}</h2>

            <div style={{ display: "grid", gap: 10 }}>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="First name"
                style={inputStyle}
              />
              <input
                value={form.lastname}
                onChange={(e) => setForm({ ...form, lastname: e.target.value })}
                placeholder="Last name"
                style={inputStyle}
              />
              <input
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                placeholder="Nickname"
                style={inputStyle}
              />
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                style={inputStyle}
              />
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value as ChildForm["gender"] })}
                style={inputStyle}
              >
                <option value="">Select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setForm(emptyForm());
                }}
                style={smallButtonStyle}
              >
                {t.common.cancel}
              </button>

              <button
                onClick={handleAddChild}
                style={{
                  ...smallButtonStyle,
                  background: "#7F77DD",
                  color: "#fff",
                }}
              >
                {t.common.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #E5E7EB",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
};

const smallButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 9,
  padding: "8px 10px",
  background: "#F3F4F6",
  color: "#374151",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 12,
};
