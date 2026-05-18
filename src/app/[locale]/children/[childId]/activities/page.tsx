"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { mockAppData } from "@/lib/data";
import type { Activity, Child } from "@/types";
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
    endDate: "",
    role: "",
    note: "",
  };
}

function fmtDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function saveChild(childId: string, data: Child) {
  localStorage.setItem(`child-${childId}`, JSON.stringify(data));
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
  const [draftActivity, setDraftActivity] = useState<Activity>(
    makeEmptyActivity()
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`child-${params.childId}`);
    if (saved) {
      const parsed = JSON.parse(saved) as Child;
      setChild(parsed);
    }
  }, [params.childId]);

  if (!child) {
    return <div style={{ padding: 16 }}>Child not found</div>;
  }

  const activities = [...(child.activities ?? [])].sort(
    (a, b) => new Date(b.date || "1900-01-01").getTime() - new Date(a.date || "1900-01-01").getTime()
  );

  function openAddForm() {
    setDraftActivity(makeEmptyActivity());
    setEditingId(null);
    setIsFormOpen(true);
  }

  function openEditForm(activity: Activity) {
    setDraftActivity(activity);
    setEditingId(activity.id);
    setIsFormOpen(true);
  }

  function cancelForm() {
    setDraftActivity(makeEmptyActivity());
    setEditingId(null);
    setIsFormOpen(false);
  }

  function updateField(field: keyof Activity, value: string) {
    setDraftActivity((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function saveActivity() {
    if (!draftActivity.activityName.trim()) {
      alert("Please enter activity name.");
      return;
    }

    if (!draftActivity.date) {
      alert("Please enter activity date.");
      return;
    }

    const existing = child.activities ?? [];

    const updatedActivities = editingId
      ? existing.map((a) => (a.id === editingId ? draftActivity : a))
      : [draftActivity, ...existing];

    const updatedChild: Child = {
      ...child,
      updatedAt: new Date().toISOString(),
      activities: updatedActivities,
    };

    setChild(updatedChild);
    saveChild(params.childId, updatedChild);
    cancelForm();
  }

  function deleteActivity(id: string) {
    const ok = confirm("Delete this activity?");
    if (!ok) return;

    const updatedChild: Child = {
      ...child,
      updatedAt: new Date().toISOString(),
      activities: (child.activities ?? []).filter((a) => a.id !== id),
    };

    setChild(updatedChild);
    saveChild(params.childId, updatedChild);
  }

  function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

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

      const updatedChild: Child = {
        ...child,
        updatedAt: new Date().toISOString(),
        attachments: [...(child.attachments || []), newAttachment],
      };

      setChild(updatedChild);
      saveChild(params.childId, updatedChild);
    };

    reader.readAsDataURL(file);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(child, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${child.basicInfo?.name ?? "child"}-activities.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <SectionLabel emoji="⭐" label="Activities" color="#7F77DD" bg="#EEEDFE" />

          <button onClick={openAddForm} style={{ border: "none", background: "#7F77DD", color: "white", padding: "8px 12px", borderRadius: 999 }}>
            + Add
          </button>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <label style={{ background: "#E1F5EE", color: "#1D9E75", padding: "8px 12px", borderRadius: 999, cursor: "pointer", fontSize: 13 }}>
            Upload Activity File
            <input type="file" onChange={handleFileUpload} style={{ display: "none" }} />
          </label>

          <button onClick={exportJson} style={{ border: "1px solid #E5E7EB", background: "white", color: "#374151", padding: "8px 12px", borderRadius: 999 }}>
            Export JSON
          </button>
        </div>
      </Card>

      {isFormOpen && (
        <Card>
          <SectionLabel emoji="✏️" label={editingId ? "Edit Activity" : "Add Activity"} color="#7F77DD" bg="#EEEDFE" />

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            <label style={labelStyle}>
              Activity Name
              <input style={inputStyle} value={draftActivity.activityName} onChange={(e) => updateField("activityName", e.target.value)} />
            </label>

            <label style={labelStyle}>
              Category
              <input style={inputStyle} value={draftActivity.category ?? ""} onChange={(e) => updateField("category", e.target.value)} placeholder="กีฬา, ดนตรี, วิชาการ, ศิลปะ" />
            </label>

            <label style={labelStyle}>
              Date
              <input type="date" style={inputStyle} value={draftActivity.date} onChange={(e) => updateField("date", e.target.value)} />
            </label>

            <label style={labelStyle}>
              End Date
              <input type="date" style={inputStyle} value={draftActivity.endDate ?? ""} onChange={(e) => updateField("endDate", e.target.value)} />
            </label>

            <label style={labelStyle}>
              Role
              <input style={inputStyle} value={draftActivity.role ?? ""} onChange={(e) => updateField("role", e.target.value)} placeholder="Participant, Leader, Performer" />
            </label>

            <label style={labelStyle}>
              Note
              <textarea style={{ ...inputStyle, minHeight: 80 }} value={draftActivity.note ?? ""} onChange={(e) => updateField("note", e.target.value)} />
            </label>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={saveActivity} style={{ border: "none", background: "#1D9E75", color: "white", padding: "8px 12px", borderRadius: 999 }}>
                Save
              </button>

              <button onClick={cancelForm} style={{ border: "1px solid #E5E7EB", background: "white", color: "#6B7280", padding: "8px 12px", borderRadius: 999 }}>
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <SectionLabel emoji="📋" label="Activity Timeline" color="#1D9E75" bg="#E1F5EE" />

        {activities.length > 0 ? (
          activities.map((a) => (
            <div key={a.id} style={{ padding: "12px 14px", borderBottom: "0.5px solid #F1F5F9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>
                    {a.activityName}
                  </div>

                  <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
                    📅 {fmtDate(a.date)}
                    {a.endDate ? ` → ${fmtDate(a.endDate)}` : ""}
                  </div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                    {a.category && (
                      <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "#EEEDFE", color: "#7F77DD", fontWeight: 700 }}>
                        {a.category}
                      </span>
                    )}

                    {a.role && (
                      <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "#F8FAFC", color: "#6B7280", fontWeight: 700 }}>
                        {a.role}
                      </span>
                    )}
                  </div>

                  {a.note && (
                    <div style={{ fontSize: 12, color: "#6B7280", marginTop: 8, lineHeight: 1.5 }}>
                      {a.note}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button onClick={() => openEditForm(a)} style={{ border: "1px solid #E5E7EB", background: "white", padding: "6px 10px", borderRadius: 999, fontSize: 12 }}>
                    Edit
                  </button>

                  <button onClick={() => deleteActivity(a.id)} style={{ border: "none", background: "#FEE2E2", color: "#DC2626", padding: "6px 10px", borderRadius: 999, fontSize: 12 }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState emoji="⭐" message="No activities yet." />
        )}
      </Card>

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
