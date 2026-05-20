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

      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        basicInfo: {
          ...prev.basicInfo,
          [field]: value,
        },
      };
    });
  }

  function save() {
    if (!draft) return;

    saveChild(draft.id, draft);

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
      
      {/* BASIC */}
      <Card>
        <SectionLabel emoji="🪪" label="Basic Info" color="#7F77DD" bg="#EEEDFE" />

        {!isEditing ? (
          <>
            <InfoRow label="Name" value={`${b.name} ${b.lastname}`} />
            <InfoRow label="Nickname" value={b.nickname} />
            <InfoRow label="Gender" value={b.gender} />
            <InfoRow
              label="Date of birth"
              value={
                b.dateOfBirth
                  ? `${fmtDate(b.dateOfBirth)}${age ? ` (${age} yrs)` : ""}`
                  : "-"
              }
            />
            <InfoRow label="Place of birth" value={b.placeOfBirth} />
          </>
        ) : (
          <>
            <input value={db.name ?? ""} onChange={(e) => update("name", e.target.value)} style={inputStyle} placeholder="First name" />
            <input value={db.lastname ?? ""} onChange={(e) => update("lastname", e.target.value)} style={inputStyle} placeholder="Last name" />
            <input value={db.nickname ?? ""} onChange={(e) => update("nickname", e.target.value)} style={inputStyle} placeholder="Nickname" />
            <input type="date" value={db.dateOfBirth ?? ""} onChange={(e) => update("dateOfBirth", e.target.value)} style={inputStyle} />
            <input value={db.placeOfBirth ?? ""} onChange={(e) => update("placeOfBirth", e.target.value)} style={inputStyle} placeholder="Place of birth" />
          </>
        )}
      </Card>

      {/* EXTRA NAME */}
      <Card>
        <SectionLabel emoji="📛" label="Other Names" color="#6366F1" bg="#EEF2FF" />

        {!isEditing ? (
          <>
            <InfoRow label="Middle name" value={b.middleName} />
            <InfoRow label="Saint name" value={b.saintName} />
            <InfoRow label="Other name" value={b.otherName} />
          </>
        ) : (
          <>
            <input value={db.middleName ?? ""} onChange={(e) => update("middleName", e.target.value)} style={inputStyle} placeholder="Middle name" />
            <input value={db.saintName ?? ""} onChange={(e) => update("saintName", e.target.value)} style={inputStyle} placeholder="Saint name" />
            <input value={db.otherName ?? ""} onChange={(e) => update("otherName", e.target.value)} style={inputStyle} placeholder="Other name" />
          </>
        )}
      </Card>

      {/* FAMILY */}
      <Card>
        <SectionLabel emoji="👨‍👩‍👧" label="Family" color="#059669" bg="#ECFDF5" />

        {!isEditing ? (
          <>
            <InfoRow label="Father" value={b.fatherName} />
            <InfoRow label="Mother" value={b.motherName} />
            <InfoRow label="Grandfather" value={b.grandfather} />
            <InfoRow label="Grandmother" value={b.grandmother} />
          </>
        ) : (
          <>
            <input value={db.fatherName ?? ""} onChange={(e) => update("fatherName", e.target.value)} style={inputStyle} placeholder="Father" />
            <input value={db.motherName ?? ""} onChange={(e) => update("motherName", e.target.value)} style={inputStyle} placeholder="Mother" />
            <input value={db.grandfather ?? ""} onChange={(e) => update("grandfather", e.target.value)} style={inputStyle} placeholder="Grandfather" />
            <input value={db.grandmother ?? ""} onChange={(e) => update("grandmother", e.target.value)} style={inputStyle} placeholder="Grandmother" />
          </>
        )}
      </Card>

      {/* ACTION */}
      <Card>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} style={btnPrimary}>
            Edit
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={save} style={btnSave}>Save</button>
            <button onClick={cancel} style={btnCancel}>Cancel</button>
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

const btnPrimary = {
  background: "#7F77DD",
  color: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: 999,
};

const btnSave = {
  background: "#1D9E75",
  color: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: 999,
};

const btnCancel = {
  border: "1px solid #E5E7EB",
  padding: "10px 14px",
  borderRadius: 999,
};
