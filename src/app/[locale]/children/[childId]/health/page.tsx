"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { ChangeEvent } from "react";
import type { Child } from "@/types";
import { getChildById, saveChild } from "@/lib/childStorage";
import { Card, SectionLabel, InfoRow } from "@/components/child/DetailPrimitives";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  fontSize: 14,
};

const labelStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 6,
  fontSize: 13,
  color: "#6B7280",
};

const bottomButtonStyle = {
  width: "100%",
  border: "none",
  background: "#7F77DD",
  color: "white",
  padding: "12px 14px",
  borderRadius: 999,
  fontSize: 15,
  fontWeight: 700,
};

export default function HealthPage() {
  const params = useParams<{ locale: string; childId: string }>();
  const childId = params.childId;

  const [child, setChild] = useState<Child | null>(null);
  const [draft, setDraft] = useState<Child | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const found = getChildById(childId);
    if (found) {
      setChild(found);
      setDraft(found);
    }
  }, [childId]);

  if (!child || !draft) {
    return <div style={{ padding: 16 }}>Child not found</div>;
  }

  const h = child.health ?? {};
  const dh = draft.health ?? {};
  const m = h.measurements ?? {};
  const dm = dh.measurements ?? {};

  function updateMeasurement(field: string, value: string) {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        health: {
          ...prev.health,
          measurements: {
            ...prev.health?.measurements,
            [field]: value === "" ? undefined : Number(value),
          },
        },
      };
    });
  }

  function updateTextArray(field: "congenitalDisease" | "bodyMarks", value: string) {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        health: {
          ...prev.health,
          [field]: value
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),
        },
      };
    });
  }

  function saveEdit() {
    saveChild(childId, draft);
    setChild(draft);
    setIsEditing(false);
  }

  function cancelEdit() {
    setDraft(child);
    setIsEditing(false);
  }

  function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !draft) return;

    const reader = new FileReader();

    reader.onload = () => {
      const updated: Child = {
        ...draft,
        updatedAt: new Date().toISOString(),
        attachments: [
          ...(draft.attachments ?? []),
          {
            id: crypto.randomUUID(),
            section: "health",
            name: file.name,
            type: file.type,
            dataUrl: reader.result as string,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      setDraft(updated);
      setChild(updated);
      saveChild(childId, updated);
    };

    reader.readAsDataURL(file);
  }

  return (
    <div style={{ padding: "14px 16px 120px", display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <SectionLabel emoji="❤️" label="Health" color="#DC2626" bg="#FEE2E2" />
        <div style={{ marginTop: 12 }}>
          <label style={{ background: "#E1F5EE", color: "#1D9E75", padding: "8px 12px", borderRadius: 999, cursor: "pointer", fontSize: 13 }}>
            Upload Health File
            <input type="file" onChange={handleFileUpload} style={{ display: "none" }} />
          </label>
        </div>
      </Card>

      <Card>
        <SectionLabel emoji="⚕️" label="Medical" color="#DC2626" bg="#FEE2E2" />
        {!isEditing ? (
          <>
            <InfoRow label="Conditions" value={(h.congenitalDisease ?? []).join(", ") || "None recorded"} />
            <InfoRow label="Body marks" value={(h.bodyMarks ?? []).join(", ") || "None recorded"} />
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            <label style={labelStyle}>
              Conditions
              <input style={inputStyle} value={(dh.congenitalDisease ?? []).join(", ")} onChange={(e) => updateTextArray("congenitalDisease", e.target.value)} />
            </label>
            <label style={labelStyle}>
              Body marks
              <input style={inputStyle} value={(dh.bodyMarks ?? []).join(", ")} onChange={(e) => updateTextArray("bodyMarks", e.target.value)} />
            </label>
          </div>
        )}
      </Card>

      <Card>
        <SectionLabel emoji="📏" label="Measurements" color="#7C3AED" bg="#F3E8FF" />
        {!isEditing ? (
          <>
            <InfoRow label="Weight" value={m.weight ? `${m.weight} kg` : undefined} />
            <InfoRow label="Height" value={m.height ? `${m.height} cm` : undefined} />
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            <label style={labelStyle}>
              Weight
              <input type="number" style={inputStyle} value={dm.weight ?? ""} onChange={(e) => updateMeasurement("weight", e.target.value)} />
            </label>
            <label style={labelStyle}>
              Height
              <input type="number" style={inputStyle} value={dm.height ?? ""} onChange={(e) => updateMeasurement("height", e.target.value)} />
            </label>
          </div>
        )}
      </Card>

      <Card>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} style={bottomButtonStyle}>
            Edit Health
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={saveEdit} style={{ ...bottomButtonStyle, background: "#1D9E75" }}>
              Save
            </button>
            <button onClick={cancelEdit} style={{ ...bottomButtonStyle, background: "white", color: "#6B7280", border: "1px solid #E5E7EB" }}>
              Cancel
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
