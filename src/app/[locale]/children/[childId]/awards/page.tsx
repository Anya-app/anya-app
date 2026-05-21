"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useParams } from "next/navigation";
import type { Award, AwardLevel, Child } from "@/types";
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
  background: "#BA7517",
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

function makeEmptyAward(): Award {
  return {
    id: makeId(),
    awardName: "",
    category: "",
    date: "",
    organization: "",
    level: "school",
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

export default function AwardsPage() {
  const params = useParams<{ locale: string; childId: string }>();
  const childId = params.childId;

  const [child, setChild] = useState<Child | null>(null);
  const [draftAward, setDraftAward] = useState<Award>(makeEmptyAward());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const found = getChildById(childId);
    if (found) setChild(found);
  }, [childId]);

  if (!child) {
    return <div style={{ padding: 16 }}>Child not found</div>;
  }

  const awards = [...(child.awards ?? [])].sort(
    (a, b) =>
      new Date(b.date || "1900-01-01").getTime() -
      new Date(a.date || "1900-01-01").getTime()
  );

  const awardFiles = (child.attachments ?? []).filter(
    (a) => a.section === "awards"
  );

  function openAddForm() {
    setDraftAward(makeEmptyAward());
    setEditingId(null);
    setIsFormOpen(true);
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 50);
  }

  function openEditForm(award: Award) {
    setDraftAward({ ...award });
    setEditingId(award.id);
    setIsFormOpen(true);
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 50);
  }

  function cancelForm() {
    setDraftAward(makeEmptyAward());
    setEditingId(null);
    setIsFormOpen(false);
  }

  function updateField(field: keyof Award, value: string) {
    setDraftAward((prev) => ({
      ...prev,
      [field]: field === "level" ? (value as AwardLevel) : value,
    }));
  }

  function saveAward() {
    if (!child) return;

    if (!draftAward.awardName.trim()) {
      alert("Please enter award name.");
      return;
    }

    const existing = child.awards ?? [];

    const updatedAwards = editingId
      ? existing.map((a) => (a.id === editingId ? draftAward : a))
      : [draftAward, ...existing];

    const updatedChild: Child = {
      ...child,
      updatedAt: new Date().toISOString(),
      awards: updatedAwards,
    };

    setChild(updatedChild);
    saveChild(childId, updatedChild);
    cancelForm();
  }

  function deleteAward(id: string) {
    if (!child) return;
    if (!confirm("Delete this award?")) return;

    const updatedChild: Child = {
      ...child,
      updatedAt: new Date().toISOString(),
      awards: (child.awards ?? []).filter((a) => a.id !== id),
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
            section: "awards",
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
    a.download = `${child.basicInfo?.name ?? "child"}-awards.json`;
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
        <SectionLabel emoji="🏆" label="Awards" color="#BA7517" bg="#FAEEDA" />

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
            Upload Award File
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

      {awards.length > 0 ? (
        awards.map((a) => (
          <Card key={a.id}>
            <SectionLabel
              emoji="🏅"
              label={a.awardName || "Untitled Award"}
              color="#BA7517"
              bg="#FAEEDA"
            />

            <InfoRow label="Category" value={a.category || "Not recorded"} />
            <InfoRow label="Date" value={fmtDate(a.date) || "Not recorded"} />
            <InfoRow label="Organization" value={a.organization || "Not recorded"} />
            <InfoRow label="Level" value={a.level || "Not recorded"} />
            <InfoRow label="Note" value={a.note || "Not recorded"} />

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                onClick={() => openEditForm(a)}
                style={{
                  border: "none",
                  background: "#BA7517",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: 999,
                }}
              >
                Edit
              </button>

              <button
                onClick={() => deleteAward(a.id)}
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
          <EmptyState emoji="🏆" message="No awards recorded yet." />
        </Card>
      )}

      <Card>
        <SectionLabel emoji="📎" label="Award Attachments" color="#1D9E75" bg="#E1F5EE" />

        {awardFiles.length > 0 ? (
          awardFiles.map((a) => (
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
          <EmptyState emoji="📎" message="No award files uploaded yet." />
        )}
      </Card>

      {isFormOpen && (
        <Card>
          <SectionLabel
            emoji="✏️"
            label={editingId ? "Edit Award" : "Add Award"}
            color="#BA7517"
            bg="#FAEEDA"
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            <label style={labelStyle}>
              Award Name
              <input
                style={inputStyle}
                value={draftAward.awardName}
                onChange={(e) => updateField("awardName", e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              Category
              <input
                style={inputStyle}
                value={draftAward.category ?? ""}
                onChange={(e) => updateField("category", e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              Date
              <input
                type="date"
                style={inputStyle}
                value={draftAward.date ?? ""}
                onChange={(e) => updateField("date", e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              Organization
              <input
                style={inputStyle}
                value={draftAward.organization ?? ""}
                onChange={(e) => updateField("organization", e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              Level
              <select
                style={inputStyle}
                value={draftAward.level ?? "school"}
                onChange={(e) => updateField("level", e.target.value)}
              >
                <option value="school">School</option>
                <option value="district">District</option>
                <option value="province">Province</option>
                <option value="national">National</option>
                <option value="international">International</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label style={labelStyle}>
              Note
              <textarea
                style={{ ...inputStyle, minHeight: 90 }}
                value={draftAward.note ?? ""}
                onChange={(e) => updateField("note", e.target.value)}
              />
            </label>

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={saveAward} style={{ ...bottomButtonStyle, background: "#1D9E75" }}>
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
            + Add Award
          </button>
        </Card>
      )}
    </div>
  );
}
