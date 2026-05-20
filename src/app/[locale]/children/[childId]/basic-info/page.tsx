"use client";

import { useParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useEffect, useState } from "react";
import { calcAge, type Child } from "@/types";
import { saveChild } from "@/lib/childStorage";
import {
  Card,
  SectionLabel,
  InfoRow,
} from "@/components/child/DetailPrimitives";

function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function BasicInfoPage() {
  const routeParams = useParams();
  const childId = String(routeParams.childId ?? routeParams.id ?? "");
  const { children, setChildren } = useApp();

  const originalChild = children.find((c) => c.id === childId);

  const [child, setChild] = useState<Child | undefined>(originalChild);
  const [draft, setDraft] = useState<Child | undefined>(originalChild);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setChild(originalChild);
    setDraft(originalChild);
  }, [originalChild]);

  if (!child || !draft) {
    return <div style={{ padding: 16 }}>Child not found</div>;
  }

  const b = child.basicInfo;
  const db = draft.basicInfo;
  const age = calcAge(b.dateOfBirth);

  function update(field: string, value: string) {
    setDraft((prev) => {
      if (!prev) return prev;

      const nextBasicInfo = {
        ...prev.basicInfo,
        [field]: value,
      };

      const firstName =
        field === "name"
          ? value.trim() || "New Child"
          : nextBasicInfo.name || "New Child";

      const lastName =
        field === "lastname"
          ? value.trim()
          : nextBasicInfo.lastname || "";

      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        basicInfo: {
          ...nextBasicInfo,
          name: firstName,
          lastname: lastName,
          names: {
            ...nextBasicInfo.names,
            th: {
              ...nextBasicInfo.names?.th,
              firstName,
              lastName,
              fullName: `${firstName} ${lastName}`.trim(),
            },
            en: {
              ...nextBasicInfo.names?.en,
              firstName,
              lastName,
              fullName: `${firstName} ${lastName}`.trim(),
            },
          },
        },
      };
    });
  }

  function save() {
    if (!draft) return;

    // ✅ save localStorage
    saveChild(draft.id, draft);

    // ✅ update state
    setChildren((prev: Child[]) =>
      prev.map((c) => (c.id === draft.id ? draft : c))
    );

    setChild(draft);
    setIsEditing(false);
  }

  function cancel() {
    setDraft(child);
    setIsEditing(false);
  }

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <SectionLabel emoji="🪪" label="Basic Info" color="#7F77DD" bg="#EEEDFE" />

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              style={{ background: "#7F77DD", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 999 }}
            >
              Edit
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={save}
                style={{ background: "#1D9E75", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 999 }}
              >
                Save
              </button>
              <button
                onClick={cancel}
                style={{ border: "1px solid #E5E7EB", padding: "8px 12px", borderRadius: 999 }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {!isEditing ? (
          <>
            <InfoRow label="Name" value={`${b.name} ${b.lastname}`} />
            <InfoRow label="Nickname" value={b.nickname} />
            <InfoRow
              label="Date of birth"
              value={
                b.dateOfBirth
                  ? `${fmtDate(b.dateOfBirth)}${age ? ` (${age} yrs)` : ""}`
                  : "-"
              }
            />
            <InfoRow label="Gender" value={b.gender} />
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            <input
              value={db.name ?? ""}
              onChange={(e) => update("name", e.target.value)}
              placeholder="First name"
              style={inputStyle}
            />
            <input
              value={db.lastname ?? ""}
              onChange={(e) => update("lastname", e.target.value)}
              placeholder="Last name"
              style={inputStyle}
            />
            <input
              value={db.nickname ?? ""}
              onChange={(e) => update("nickname", e.target.value)}
              placeholder="Nickname"
              style={inputStyle}
            />
            <input
              type="date"
              value={db.dateOfBirth ?? ""}
              onChange={(e) => update("dateOfBirth", e.target.value)}
              style={inputStyle}
            />
            <select
              value={db.gender ?? ""}
              onChange={(e) => update("gender", e.target.value)}
              style={inputStyle}
            >
              <option value="">Select gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}
      </Card>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  fontSize: 14,
};
