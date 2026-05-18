"use client";

import { useEffect, useState } from "react";
import { mockAppData } from "@/lib/data";
import type { Child, Activity } from "@/types";
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

function makeEmptyActivity(): Activity {
  return {
    id: crypto.randomUUID(),
    activityName: "",
    category: "",
    date: "",
    role: "",
    note: "",
  };
}

export default function ActivitiesPage({
  params,
}: {
  params: { locale: string; childId: string };
}) {
  const originalChild = mockAppData.children.find(
    (c) => c.id === params.childId
  );

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

  const activities = draft.activities ?? [];
  const current = activities[0] ?? makeEmptyActivity();

  function updateField(field: keyof Activity, value: string) {
    setDraft((prev) => {
      if (!prev) return prev;

      const existing = prev.activities ?? [];
      const base = existing[0] ?? makeEmptyActivity();

      const updated: Activity = {
        ...base,
        [field]: value,
      };

      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        activities: [updated, ...existing.slice(1)],
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
        section: "activities" as const,
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

  const list = child.activities ?? [];

  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
      
      {/* HEADER */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <SectionLabel emoji="⭐" label="Activities" color="#7F77DD" bg="#EEEDFE" />

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
                <button onClick={cancelEdit} style={{ border: "1px solid #E5E7EB", background: "white", padding: "8px 12px", borderRadius: 999 }}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ background: "#E1F5EE", color: "#1D9E75", padding: "8px 12px", borderRadius: 999, cursor: "pointer", fontSize: 13 }}>
            Upload Activity File
            <input type="file" onChange={handleFileUpload} style={{ display: "none" }} />
          </label>
        </div>
      </Card>

      {/* FORM */}
      <Card>
        <SectionLabel emoji="✏️" label="Add / Edit Activity" color="#7F77DD" bg="#EEEDFE" />

        {!isEditing ? (
          <>
            <InfoRow label="Name" value={list[0]?.activityName} />
            <InfoRow label="Category" value={list[0]?.category} />
            <InfoRow label="Date" value={list[0]?.date} />
            <InfoRow label="Role" value={list[0]?.role} />
            <InfoRow label="Note" value={list[0]?.note} />
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={labelStyle}>
              Activity Name
              <input style={inputStyle} value={current.activityName} onChange={(e) => updateField("activityName", e.target.value)} />
            </label>

            <label style={labelStyle}>
              Category
              <input style={inputStyle} value={current.category ?? ""} onChange={(e) => updateField("category", e.target.value)} />
            </label>

            <label style={labelStyle}>
              Date
              <input type="date" style={inputStyle} value={current.date} onChange={(e) => updateField("date", e.target.value)} />
            </label>

            <label style={labelStyle}>
              Role
              <input style={inputStyle} value={current.role ?? ""} onChange={(e) => updateField("role", e.target.value)} />
            </label>

            <label style={labelStyle}>
              Note
              <input style={inputStyle} value={current.note ?? ""} onChange={(e) => updateField("note", e.target.value)} />
            </label>
          </div>
        )}
      </Card>

      {/* LIST */}
      <Card>
        <SectionLabel emoji="📋" label="Activity List" color="#1D9E75" bg="#E1F5EE" />

        {list.length > 0 ? (
          list.map((a) => (
            <InfoRow
              key={a.id}
              label={a.activityName}
              value={`${a.date} ${a.role ? "· " + a.role : ""}`}
            />
          ))
        ) : (
          <EmptyState emoji="⭐" message="No activities yet." />
        )}
      </Card>

      {/* ATTACHMENTS */}
      <Card>
        <SectionLabel emoji="📎" label="Activity Attachments" color="#1D9E75" bg="#E1F5EE" />

        {(child.attachments || []).filter((a) => a.section === "activities").length > 0 ? (
          (child.attachments || [])
            .filter((a) => a.section === "activities")
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
          <EmptyState emoji="📎" message="No activity files uploaded yet." />
        )}
      </Card>
    </div>
  );
}
