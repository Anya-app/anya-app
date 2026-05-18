"use client";

import { useEffect, useState } from "react";
import { mockAppData } from "@/lib/data";
import type { Child, SchoolRecord, SchoolLevel, Term } from "@/types";
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

function makeEmptySchoolRecord(): SchoolRecord {
  return {
    id: crypto.randomUUID(),
    schoolLevel: "primary",
    schoolName: "",
    studentId: "",
    academicYear: "",
    term: "1",
    room: "",
    number: undefined,
  };
}

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

  const record: SchoolRecord =
    draft.schoolRecords?.[0] ?? makeEmptySchoolRecord();

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
      localStorage.setItem(`child-${params.childId}`, JSON.stringify(updated));
    };

    reader.readAsDataURL(file);
  }

  const r = child.schoolRecords?.[0];

  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <SectionLabel emoji="🏫" label="School" color="#7F77DD" bg="#EEEDFE" />

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
            Upload School File
            <input type="file" onChange={handleFileUpload} style={{ display: "none" }} />
          </label>
        </div>
      </Card>

      <Card>
        <SectionLabel emoji="📘" label="School Info" color="#7F77DD" bg="#EEEDFE" />

        {!isEditing ? (
          <>
            <InfoRow label="School" value={r?.schoolName} />
            <InfoRow label="School Level" value={r?.schoolLevel} />
            <InfoRow label="Student ID" value={r?.studentId} />
            <InfoRow label="Academic Year" value={r?.academicYear} />
            <InfoRow label="Term" value={r?.term} />
            <InfoRow label="Room" value={r?.room} />
            <InfoRow label="Number" value={r?.number?.toString()} />
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={labelStyle}>
              School
              <input style={inputStyle} value={record.schoolName ?? ""} onChange={(e) => updateField("schoolName", e.target.value)} />
            </label>

            <label style={labelStyle}>
              School Level
              <select style={inputStyle} value={record.schoolLevel} onChange={(e) => updateField("schoolLevel", e.target.value)}>
                <option value="kindergarten">Kindergarten</option>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="university">University</option>
              </select>
            </label>

            <label style={labelStyle}>
              Student ID
              <input style={inputStyle} value={record.studentId ?? ""} onChange={(e) => updateField("studentId", e.target.value)} />
            </label>

            <label style={labelStyle}>
              Academic Year
              <input style={inputStyle} value={record.academicYear ?? ""} onChange={(e) => updateField("academicYear", e.target.value)} />
            </label>

            <label style={labelStyle}>
              Term
              <select style={inputStyle} value={record.term} onChange={(e) => updateField("term", e.target.value)}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="summer">Summer</option>
                <option value="special">Special</option>
              </select>
            </label>

            <label style={labelStyle}>
              Room
              <input style={inputStyle} value={record.room ?? ""} onChange={(e) => updateField("room", e.target.value)} />
            </label>

            <label style={labelStyle}>
              Number
              <input type="number" style={inputStyle} value={record.number ?? ""} onChange={(e) => updateField("number", e.target.value)} />
            </label>
          </div>
        )}
      </Card>

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
