"use client";

import { useEffect, useState } from "react";
import type { Child } from "@/types";
import {
  Card,
  SectionLabel,
  InfoRow,
  EmptyState,
} from "@/components/child/DetailPrimitives";

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

export default function HealthPage({
  params,
}: {
  params: { locale: string; childId: string };
}) {
  const [child, setChild] = useState<Child | null>(null);
  const [draft, setDraft] = useState<Child | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // ✅ โหลด child จาก storage กลาง
  useEffect(() => {
    const single = localStorage.getItem(`child-${params.childId}`);

    if (single) {
      const parsed = JSON.parse(single) as Child;
      setChild(parsed);
      setDraft(parsed);
      return;
    }

    const allRaw = localStorage.getItem("anya_children");
    const all = allRaw ? (JSON.parse(allRaw) as Child[]) : [];
    const found = all.find((c) => c.id === params.childId);

    if (found) {
      setChild(found);
      setDraft(found);
      localStorage.setItem(`child-${params.childId}`, JSON.stringify(found));
    }
  }, [params.childId]);

  if (!child || !draft) {
    return <div style={{ padding: 16 }}>Child not found</div>;
  }

  // ✅ FIX สำคัญ (ตัวที่หายไป)
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
    if (!draft) return;

    // ✅ save ทั้ง 2 ที่
    localStorage.setItem(`child-${params.childId}`, JSON.stringify(draft));

    const allRaw = localStorage.getItem("anya_children");
    const all = allRaw ? (JSON.parse(allRaw) as Child[]) : [];
    const updatedAll = all.map((c) =>
      c.id === params.childId ? draft : c
    );
    localStorage.setItem("anya_children", JSON.stringify(updatedAll));

    setChild(draft);
    setIsEditing(false);
  }

  function cancelEdit() {
    setDraft(child);
    setIsEditing(false);
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !draft) return;

    const reader = new FileReader();

    reader.onload = () => {
      const newAttachment = {
        id: crypto.randomUUID(),
        section: "health" as const,
        name: file.name,
        type: file.type,
        dataUrl: reader.result as string,
        createdAt: new Date().toISOString(),
      };

      const updated = {
        ...draft,
        updatedAt: new Date().toISOString(),
        attachments: [...(draft.attachments || []), newAttachment],
      };

      setDraft(updated);
      setChild(updated);
      localStorage.setItem(`child-${params.childId}`, JSON.stringify(updated));
    };

    reader.readAsDataURL(file);
  }

  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
          <SectionLabel emoji="❤️" label="Health" color="#DC2626" bg="#FEE2E2" />

          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} style={{ border: "none", background: "#7F77DD", color: "white", padding: "8px 12px", borderRadius: 999 }}>
              Edit
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={saveEdit} style={{ border: "none", background: "#1D9E75", color: "white", padding: "8px 12px", borderRadius: 999 }}>
                Save
              </button>
              <button onClick={cancelEdit} style={{ border: "1px solid #E5E7EB", background: "white", color: "#6B7280", padding: "8px 12px", borderRadius: 999 }}>
                Cancel
              </button>
            </div>
          )}
        </div>

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
            <label style={labelStyle}>Weight<input type="number" style={inputStyle} value={dm.weight ?? ""} onChange={(e) => updateMeasurement("weight", e.target.value)} /></label>
            <label style={labelStyle}>Height<input type="number" style={inputStyle} value={dm.height ?? ""} onChange={(e) => updateMeasurement("height", e.target.value)} /></label>
          </div>
        )}
      </Card>
    </div>
  );
}
