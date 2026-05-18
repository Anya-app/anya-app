"use client";

import { useEffect, useState } from "react";
import { mockAppData } from "@/lib/data";
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
  const originalChild = mockAppData.children.find((c) => c.id === params.childId);

  const [child, setChild] = useState<Child | undefined>(originalChild);
  const [draft, setDraft] = useState<Child | undefined>(originalChild);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`child-${params.childId}`);
    if (saved) {
      const parsed = JSON.parse(saved) as Child;
      setChild(parsed);
      setDraft(parsed);
    }
  }, [params.childId]);

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
    localStorage.setItem(`child-${params.childId}`, JSON.stringify(draft));
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

          <div style={{ display: "flex", gap: 8 }}>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} style={{ border: "none", background: "#7F77DD", color: "white", padding: "8px 12px", borderRadius: 999 }}>
                Edit
              </button>
            ) : (
              <>
                <button onClick={saveEdit} style={{ border: "none", background: "#1D9E75", color: "white", padding: "8px 12px", borderRadius: 999 }}>
                  Save
                </button>
                <button onClick={cancelEdit} style={{ border: "1px solid #E5E7EB", background: "white", color: "#6B7280", padding: "8px 12px", borderRadius: 999 }}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: "inline-block", background: "#E1F5EE", color: "#1D9E75", padding: "8px 12px", borderRadius: 999, fontSize: 13, cursor: "pointer" }}>
            Upload Health File
            <input type="file" onChange={handleFileUpload} style={{ display: "none" }} />
          </label>
        </div>
      </Card>

      <Card>
        <SectionLabel emoji="⚕️" label="Medical" color="#DC2626" bg="#FEE2E2" />

        {!isEditing ? (
          <>
            <InfoRow label="Conditions" value={(h.congenitalDisease ?? []).join(", ") || "None recorded" } />
            <InfoRow label="Body marks" value={(h.bodyMarks ?? []).join(", ") || "None recorded" } />
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            <label style={labelStyle}>
              Conditions
              <input
                style={inputStyle}
                value={(dh.congenitalDisease ?? []).join(", ")}
                onChange={(e) => updateTextArray("congenitalDisease", e.target.value)}
                placeholder="เช่น Asthma, Allergy"
              />
            </label>

            <label style={labelStyle}>
              Body marks
              <input
                style={inputStyle}
                value={(dh.bodyMarks ?? []).join(", ")}
                onChange={(e) => updateTextArray("bodyMarks", e.target.value)}
                placeholder="เช่น mole on left arm"
              />
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
            <InfoRow label="Shoulder" value={m.shoulder ? `${m.shoulder} cm` : undefined} />
            <InfoRow label="Upper arm" value={m.upperArm ? `${m.upperArm} cm` : undefined} />
            <InfoRow label="Arm" value={m.arm ? `${m.arm} cm` : undefined} />
            <InfoRow label="Chest" value={m.chest ? `${m.chest} cm` : undefined} />
            <InfoRow label="Waist / Hip" value={m.waistHip ? `${m.waistHip} cm` : undefined} />
            <InfoRow label="Leg" value={m.leg ? `${m.leg} cm` : undefined} />
            <InfoRow label="Thigh circumference" value={m.thighCircumference ? `${m.thighCircumference} cm` : undefined} />
            <InfoRow label="Shoe size" value={m.shoeSize ? `${m.shoeSize}` : undefined} />

            {Object.keys(m).length === 0 && (
              <EmptyState emoji="📊" message="No measurements recorded yet." />
            )}
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            <label style={labelStyle}>Weight<input type="number" style={inputStyle} value={dm.weight ?? ""} onChange={(e) => updateMeasurement("weight", e.target.value)} /></label>
            <label style={labelStyle}>Height<input type="number" style={inputStyle} value={dm.height ?? ""} onChange={(e) => updateMeasurement("height", e.target.value)} /></label>
            <label style={labelStyle}>Shoulder<input type="number" style={inputStyle} value={dm.shoulder ?? ""} onChange={(e) => updateMeasurement("shoulder", e.target.value)} /></label>
            <label style={labelStyle}>Upper arm<input type="number" style={inputStyle} value={dm.upperArm ?? ""} onChange={(e) => updateMeasurement("upperArm", e.target.value)} /></label>
            <label style={labelStyle}>Arm<input type="number" style={inputStyle} value={dm.arm ?? ""} onChange={(e) => updateMeasurement("arm", e.target.value)} /></label>
            <label style={labelStyle}>Chest<input type="number" style={inputStyle} value={dm.chest ?? ""} onChange={(e) => updateMeasurement("chest", e.target.value)} /></label>
            <label style={labelStyle}>Waist / Hip<input type="number" style={inputStyle} value={dm.waistHip ?? ""} onChange={(e) => updateMeasurement("waistHip", e.target.value)} /></label>
            <label style={labelStyle}>Leg<input type="number" style={inputStyle} value={dm.leg ?? ""} onChange={(e) => updateMeasurement("leg", e.target.value)} /></label>
            <label style={labelStyle}>Thigh circumference<input type="number" style={inputStyle} value={dm.thighCircumference ?? ""} onChange={(e) => updateMeasurement("thighCircumference", e.target.value)} /></label>
            <label style={labelStyle}>Shoe size<input type="number" style={inputStyle} value={dm.shoeSize ?? ""} onChange={(e) => updateMeasurement("shoeSize", e.target.value)} /></label>
          </div>
        )}
      </Card>

      <Card>
        <SectionLabel emoji="📎" label="Health Attachments" color="#1D9E75" bg="#E1F5EE" />

        {(child.attachments || []).filter((a) => a.section === "health").length > 0 ? (
          (child.attachments || [])
            .filter((a) => a.section === "health")
            .map((a) => (
              <InfoRow
                key={a.id}
                label="File"
                value={
                  <a href={a.dataUrl} download={a.name}>
                    📎 {a.name}
                  </a>
                }
              />
            ))
        ) : (
          <EmptyState emoji="📎" message="No health files uploaded yet." />
        )}
      </Card>
    </div>
  );
}
