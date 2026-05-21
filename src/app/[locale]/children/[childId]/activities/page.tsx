"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useParams } from "next/navigation";
import type { Activity, Child } from "@/types";
import { getChildById, saveChild } from "@/lib/childStorage";
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

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random()}`;
}

function makeEmptyActivity(): Activity {
  return {
    id: makeId(),
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

export default function ActivitiesPage() {
  const params = useParams<{ locale: string; childId: string }>();
  const childId = params.childId;

  const [child, setChild] = useState<Child | null>(null);
  const [draftActivity, setDraftActivity] = useState<Activity>(makeEmptyActivity());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const found = getChildById(childId);
    if (found) setChild(found);
  }, [childId]);

  if (!child) {
    return <div style={{ padding: 16 }}>Child not found</div>;
  }

  const activities = [...(child.activities ?? [])].sort(
    (a, b) =>
      new Date(b.date || "1900-01-01").getTime() -
      new Date(a.date || "1900-01-01").getTime()
  );

  const activityFiles = (child.attachments ?? []).filter(
    (a) => a.section === "activities"
  );

  function openAddForm() {
    setDraftActivity(makeEmptyActivity());
    setEditingId(null);
    setIsFormOpen(true);
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 50);
  }

  function openEditForm(activity: Activity) {
    setDraftActivity({ ...activity });
    setEditingId(activity.id);
    setIsFormOpen(true);
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 50);
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
    if (!child) return;

    if (!draftActivity.activityName.trim()) {
      alert("Please enter activity name.");
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
    saveChild(childId, updatedChild);
    cancelForm();
  }

  function deleteActivity(id: string) {
    if (!child) return;
    if (!confirm("Delete this activity?")) return;

    const updatedChild: Child = {
      ...child,
      updatedAt: new Date().toISOString(),
      activities: (child.activities ?? []).filter((a) => a.id !== id),
    };

    setChild(updatedChild);
    saveChild(childId, updatedChild);
  }

  function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    if (!child) return;

    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const updatedChild: Child = {
        ...child,
        updatedAt: new Date().toISOString(),
        attachments: [
          ...(child.attachments ?? []),
          {
            id: makeId(),
            section: "activities",
            name: file.name,
            type: file.type,
            dataUrl: reader.result as string,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      setChild(updatedChild);
      saveChild(childId, updatedChild);
    };

    reader.readAsDataURL(file);
  }

  function exportJson() {
    if (!child) return;

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
    <div
      style={{
        padding: "14px 16px 120px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <Card>
        <SectionLabel emoji="🎨" label="Activities" color="#2563EB" bg="#DBEAFE" />

        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <label
            style={{
              background: "#E1F5EE",
              color: "#1D9E75",
              padding: "8px 12px",
              borderRadius: 999,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Upload Activity File
            <input type="file" onChange={handleFileUpload} style={{ display: "none" }} />
          </label>

          <button
            onClick={exportJson}
            style={{
              border: "1px solid #E5E7EB",
              background: "white",
              color: "#6B7280",
              padding: "8px 12px",
              borderRadius: 999,
            }}
          >
            Export JSON
          </button>
        </div>
      </Card>

      {activities.length > 0 ? (
        activities.map((a) => (
          <Card key={a.id}>
            <SectionLabel
              emoji="🌟"
              label={a.activityName || "Untitled Activity"}
              color="#2563EB"
              bg="#DBEAFE"
            />

            <InfoRow label="Category" value={a.category || "Not recorded"} />
            <InfoRow label="Date" value={fmtDate(a.date) || "Not recorded"} />
            <InfoRow label="End Date" value={fmtDate(a.endDate) || "Not recorded"} />
            <InfoRow label="Role" value={a.role || "Not recorded"} />
            <InfoRow label="Note" value={a.note || "Not recorded"} />

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={() => openEditForm(a)}
                style={{
                  border: "none",
                  background: "#7F77DD",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: 999,
                }}
              >
                Edit
              </button>

              <button
                onClick={() => deleteActivity(a.id)}
                style={{
                  border: "1px solid #FCA5A5",
                  background: "white",
                  color: "#DC2626",
                  padding: "8px 12px",
                  borderRadius: 999,
                }}
              >
                Delete
              </button>
            </div>
          </Card>
        ))
      ) : (
        <Card>
          <EmptyState emoji="🎨" message="No activities recorded yet." />
        </Card>
      )}

      <Card>
        <SectionLabel emoji="📎" label="Activity Attachments" color="#1D9E75" bg="#E1F5EE" />

        {activityFiles.length > 0 ? (
          activityFiles.map((a) => (
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

      {isFormOpen && (
        <Card>
          <SectionLabel
            emoji="✏️"
            label={editingId ? "Edit Activity" : "Add Activity"}
            color="#2563EB"
            bg="#DBEAFE"
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            <label style={labelStyle}>
              Activity Name
              <input
                style={inputStyle}
                value={draftActivity.activityName}
                onChange={(e) => updateField("activityName", e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              Category
              <input
                style={inputStyle}
                value={draftActivity.category ?? ""}
                onChange={(e) => updateField("category", e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              Start Date
              <input
                type="date"
                style={inputStyle}
                value={draftActivity.date ?? ""}
                onChange={(e) => updateField("date", e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              End Date
              <input
                type="date"
                style={inputStyle}
                value={draftActivity.endDate ?? ""}
                onChange={(e) => updateField("endDate", e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              Role
              <input
                style={inputStyle}
                value={draftActivity.role ?? ""}
                onChange={(e) => updateField("role", e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              Note
              <textarea
                style={{ ...inputStyle, minHeight: 90 }}
                value={draftActivity.note ?? ""}
                onChange={(e) => updateField("note", e.target.value)}
              />
            </label>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={saveActivity} style={{ ...bottomButtonStyle, background: "#1D9E75" }}>
                Save
              </button>

              <button
                onClick={cancelForm}
                style={{
                  ...bottomButtonStyle,
                  background: "white",
                  color: "#6B7280",
                  border: "1px solid #E5E7EB",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {!isFormOpen && (
        <Card>
          <button onClick={openAddForm} style={bottomButtonStyle}>
            + Add Activity
          </button>
        </Card>
      )}
    </div>
  );
}
