"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { ChangeEvent } from "react";
import type { Child, SchoolLevel, SchoolRecord, Term } from "@/types";
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

function makeEmptySchoolRecord(): SchoolRecord {
  return {
    id: makeId(),
    schoolLevel: "primary",
    schoolName: "",
    studentId: "",
    academicYear: "",
    term: "1",
    room: "",
    number: undefined,
  };
}

export default function SchoolPage() {
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

  const displayRecord = child.schoolRecords?.[0];
  const editRecord = draft.schoolRecords?.[0] ?? makeEmptySchoolRecord();

  const schoolFiles = (child.attachments ?? []).filter(
    (a) => a.section === "school"
  );

  function updateField(field: keyof SchoolRecord, value: string) {
    setDraft((prev) => {
      if (!prev) return prev;

      const existing = prev.schoolRecords ?? [];
      const base = existing[0] ?? makeEmptySchoolRecord();

      let nextValue: string | number | undefined = value;

      if (field === "number") {
        nextValue = value === "" ? undefined : Number(value);
      }

      if (field === "schoolLevel") {
        nextValue = value as SchoolLevel;
      }

      if (field === "term") {
        nextValue = value as Term;
      }

      const updatedRecord: SchoolRecord = {
        ...base,
        [field]: nextValue,
      };

      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        schoolRecords: [updatedRecord, ...existing.slice(1)],
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
            id: makeId(),
            section: "school",
            name: file.name,
            type: file.type,
            dataUrl: reader.result as string,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      setChild(updated);
      setDraft(updated);
      saveChild(childId, updated);
    };

    reader.readAsDataURL(file);
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
        <SectionLabel emoji="🏫" label="School" color="#7F77DD" bg="#EEEDFE" />

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
            <input type="file" onChange={handleFileUpload} style={{ display: "none" }} />
          </label>
        </div>
      </Card>

      <Card>
        <SectionLabel emoji="📘" label="School Info" color="#7F77DD" bg="#EEEDFE" />

        {!isEditing ? (
          <>
            <InfoRow label="School" value={displayRecord?.schoolName || "Not recorded"} />
            <InfoRow label="School Level" value={displayRecord?.schoolLevel || "Not recorded"} />
            <InfoRow label="Student ID" value={displayRecord?.studentId || "Not recorded"} />
            <InfoRow label="Academic Year" value={displayRecord?.academicYear || "Not recorded"} />
            <InfoRow label="Term" value={displayRecord?.term || "Not recorded"} />
            <InfoRow label="Room" value={displayRecord?.room || "Not recorded"} />
            <InfoRow label="Number" value={displayRecord?.number?.toString() || "Not recorded"} />
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            <label style={labelStyle}>
              School
              <input
                style={inputStyle}
                value={editRecord.schoolName ?? ""}
                onChange={(e) => updateField("schoolName", e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              School Level
              <select
                style={inputStyle}
                value={editRecord.schoolLevel}
                onChange={(e) => updateField("schoolLevel", e.target.value)}
              >
                <option value="kindergarten">Kindergarten</option>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="university">University</option>
              </select>
            </label>

            <label style={labelStyle}>
              Student ID
              <input
                style={inputStyle}
                value={editRecord.studentId ?? ""}
                onChange={(e) => updateField("studentId", e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              Academic Year
              <input
                style={inputStyle}
                value={editRecord.academicYear ?? ""}
                onChange={(e) => updateField("academicYear", e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              Term
              <select
                style={inputStyle}
                value={editRecord.term}
                onChange={(e) => updateField("term", e.target.value)}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="summer">Summer</option>
                <option value="special">Special</option>
              </select>
            </label>

            <label style={labelStyle}>
              Room
              <input
                style={inputStyle}
                value={editRecord.room ?? ""}
                onChange={(e) => updateField("room", e.target.value)}
              />
            </label>

            <label style={labelStyle}>
              Number
              <input
                type="number"
                style={inputStyle}
                value={editRecord.number ?? ""}
                onChange={(e) => updateField("number", e.target.value)}
              />
            </label>
          </div>
        )}
      </Card>

      <Card>
        <SectionLabel emoji="📎" label="School Attachments" color="#1D9E75" bg="#E1F5EE" />

        {schoolFiles.length > 0 ? (
          schoolFiles.map((a) => (
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

      <Card>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} style={bottomButtonStyle}>
            Edit School
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={saveEdit} style={{ ...bottomButtonStyle, background: "#1D9E75" }}>
              Save
            </button>

            <button
              onClick={cancelEdit}
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
        )}
      </Card>
    </div>
  );
}
