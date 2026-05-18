"use client";

import { useEffect, useState } from "react";
import { mockAppData } from "@/lib/data";
import type { Child, SchoolRecord } from "@/types";
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

export default function SchoolPage({
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

  const record: SchoolRecord = draft.schoolRecords?.[0] ?? {
    id: crypto.randomUUID(),
    schoolName: "",
    studentId: "",
    academicYear: "",
    term: "",
    room: "",
    number: "",
  };

  function updateField(field: string, value: string) {
    setDraft((prev) => {
      if (!prev) return prev;

      const existing = prev.schoolRecords ?? [];

      const updatedRecord = {
        ...existing[0],
        [field]: value,
      };

      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        schoolRecords: [updatedRecord],
      };
    });
  }

  function saveEdit() {
    localStorage.setItem(
      `child-${params.childId}`,
      JSON.stringify(draft)
    );
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
        section: "school" as const,
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
      localStorage.setItem(
        `child-${params.childId}`,
        JSON.stringify(updated)
      );
    };

    reader.readAsDataURL(file);
  }

  const r = child.schoolRecords?.[0];

  return (
    <div
      style={{
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* HEADER */}
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <SectionLabel emoji="🏫" label="School" color="#7F77DD" bg="#EEEDFE" />

          <div style={{ display: "flex", gap: 8 }}>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
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
            ) : (
              <>
                <button
                  onClick={saveEdit}
                  style={{
                    border: "none",
                    background: "#1D9E75",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: 999,
                  }}
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  style={{
                    border: "1px solid #E5E7EB",
                    background: "white",
                    padding: "8px 12px",
                    borderRadius: 999,
                  }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
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
            Upload School File
            <input
              type="file"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </Card>

      {/* SCHOOL INFO */}
      <Card>
        <SectionLabel emoji="📘" label="School Info" color="#7F77DD" bg="#EEEDFE" />

        {!isEditing ? (
          <>
            <InfoRow label="School" value={r?.schoolName} />
            <InfoRow label="Student ID" value={r?.studentId} />
            <InfoRow label="Year" value={r?.academicYear} />
            <InfoRow label="Term" value={r?.term} />
            <InfoRow label="Room" value={r?.room} />
            <InfoRow label="Number" value={r?.number} />
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={labelStyle}>
              School
              <input
                style={inputStyle}
                value={record.schoolName ?? ""}
                onChange={(e) => updateField("schoolName", e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              Student ID
              <input
                style={inputStyle}
                value={record.studentId ?? ""}
                onChange={(e) => updateField("studentId", e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              Academic Year
              <input
                style={inputStyle}
                value={record.academicYear ?? ""}
                onChange={(e) => updateField("academicYear", e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              Term
              <input
                style={inputStyle}
                value={record.term ?? ""}
                onChange={(e) => updateField("term", e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              Room
              <input
                style={inputStyle}
                value={record.room ?? ""}
                onChange={(e) => updateField("room", e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              Number
              <input
                style={inputStyle}
                value={record.number ?? ""}
                onChange={(e) => updateField("number", e.target.value)}
              />
            </label>
          </div>
        )}
      </Card>

      {/* ATTACHMENTS */}
      <Card>
        <SectionLabel emoji="📎" label="School Attachments" color="#1D9E75" bg="#E1F5EE" />

        {(child.attachments || []).filter((a) => a.section === "school").length > 0 ? (
          (child.attachments || [])
            .filter((a) => a.section === "school")
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
          <EmptyState emoji="📎" message="No school files uploaded yet." />
        )}
      </Card>
    </div>
  );
}
// ── Page (Server Component) ──────────────────────────────────

export default async function SchoolPage({
  params,
}: {
  params: { locale: string; childId: string };
}) {
  const { childId } = params;
  const child = mockAppData.children.find((c) => c.id === childId);
  if (!child) notFound();

  const records = child.schoolRecords ?? [];

  if (records.length === 0) {
    return (
      <div style={{ padding: "14px 16px" }}>
        <EmptyState emoji="🏫" message="No school records yet." />
      </div>
    );
  }

  // Show most recent first (showPresentYearFirst = true by default)
  const sorted = [...records].sort((a, b) =>
    b.academicYear.localeCompare(a.academicYear)
  );

  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
      {sorted.map((record) => (
        <div key={record.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <RecordCard    record={record} />
          <GradesCard    grades={record.grades ?? []} />
          <ScheduleCard  record={record} />
          <ExamsCard     record={record} />
          <FieldTripsCard record={record} />

          {/* Yearly note */}
          {record.yearlyNote && (
            <Card>
              <SectionLabel emoji="📋" label="Teacher's note" color="#BA7517" bg="#FAEEDA" />
              <p
                style={{
                  margin: 0,
                  padding: "12px 14px",
                  fontSize: 13,
                  color: "var(--color-text-primary, #111827)",
                  lineHeight: 1.6,
                  fontStyle: "italic",
                }}
              >
                "{record.yearlyNote}"
              </p>
            </Card>
          )}
        </div>
      ))}
    </div>
  );
}
