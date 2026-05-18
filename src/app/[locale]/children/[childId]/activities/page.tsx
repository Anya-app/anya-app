"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useParams } from "next/navigation";
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

function saveChild(childId: string, data: Child) {
  localStorage.setItem(`child-${childId}`, JSON.stringify(data));
}

export default function ActivitiesPage() {
  const params = useParams<{ locale: string; childId: string }>();
  const childId = params.childId;

  const originalChild = mockAppData.children.find(
    (c) => c.id === childId
  );

  const [child, setChild] = useState<Child | undefined>(originalChild);
  const [draftActivity, setDraftActivity] = useState<Activity>(
    makeEmptyActivity()
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`child-${childId}`);
    if (saved) {
      setChild(JSON.parse(saved));
    }
  }, [childId]);

  if (!child) {
    return <div style={{ padding: 16 }}>Child not found</div>;
  }

  // ✅ FIX: lock child ให้ TS มั่นใจว่าไม่ undefined
  const currentChild = child;

  const activities = [...(currentChild.activities ?? [])].sort(
    (a, b) =>
      new Date(b.date || "1900-01-01").getTime() -
      new Date(a.date || "1900-01-01").getTime()
  );

  function openAddForm() {
    setDraftActivity(makeEmptyActivity());
    setEditingId(null);
    setIsFormOpen(true);
  }

  function openEditForm(activity: Activity) {
    setDraftActivity({ ...activity });
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

    const existing = currentChild.activities ?? [];

    const updatedActivities = editingId
      ? existing.map((a) =>
          a.id === editingId ? draftActivity : a
        )
      : [draftActivity, ...existing];

    const updatedChild: Child = {
      ...currentChild,
      updatedAt: new Date().toISOString(),
      activities: updatedActivities,
    };

    setChild(updatedChild);
    saveChild(childId, updatedChild);
    cancelForm();
  }

  function deleteActivity(id: string) {
    if (!confirm("Delete this activity?")) return;

    const updatedChild: Child = {
      ...currentChild,
      updatedAt: new Date().toISOString(),
      activities: (currentChild.activities ?? []).filter(
        (a) => a.id !== id
      ),
    };

    setChild(updatedChild);
    saveChild(childId, updatedChild);
  }

  function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const newAttachment = {
        id: makeId(),
        section: "activities" as const,
        name: file.name,
        type: file.type,
        dataUrl: reader.result as string,
        createdAt: new Date().toISOString(),
      };

      const updatedChild: Child = {
        ...currentChild,
        updatedAt: new Date().toISOString(),
        attachments: [
          ...(currentChild.attachments ?? []),
          newAttachment,
        ],
      };

      setChild(updatedChild);
      saveChild(childId, updatedChild);
    };

    reader.readAsDataURL(file);
  }

  function exportJson() {
    const blob = new Blob(
      [JSON.stringify(currentChild, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${
      currentChild.basicInfo?.name ?? "child"
    }-activities.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ padding: 16 }}>
      <button onClick={openAddForm}>+ Add Activity</button>

      {isFormOpen && (
        <div>
          <input
            placeholder="Activity Name"
            value={draftActivity.activityName}
            onChange={(e) =>
              updateField("activityName", e.target.value)
            }
          />
          <input
            type="date"
            value={draftActivity.date}
            onChange={(e) =>
              updateField("date", e.target.value)
            }
          />
          <button onClick={saveActivity}>Save</button>
          <button onClick={cancelForm}>Cancel</button>
        </div>
      )}

      {activities.map((a) => (
        <div key={a.id}>
          {a.activityName}
          <button onClick={() => openEditForm(a)}>Edit</button>
          <button onClick={() => deleteActivity(a.id)}>
            Delete
          </button>
        </div>
      ))}

      <input type="file" onChange={handleFileUpload} />
      <button onClick={exportJson}>Export JSON</button>
    </div>
  );
}
