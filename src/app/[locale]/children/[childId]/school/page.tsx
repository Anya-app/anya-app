"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type CSSProperties } from "react";
import { useParams } from "next/navigation";
import type { Child, SchoolLevel, SchoolRecord, Term } from "@/types";
import {
  getChildById,
  saveChild,
  sortSchoolRecordsNewestFirst,
} from "@/lib/childStorage";
import {
  Card,
  SectionLabel,
  InfoRow,
  EmptyState,
} from "@/components/child/DetailPrimitives";

function makeId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function makeEmptySchoolRecord(): SchoolRecord {
  return {
    id: makeId(),
    schoolLevel: "kindergarten",
    schoolName: "",
    studentId: "",
    academicYear: "",
    term: "1",
    room: "",
    number: undefined,
    startDate: "",
    endDate: "",
    yearlyNote: "",
  };
}

function displayValue(value?: string | number): string {
  if (value === undefined || value === null || String(value).trim() === "") {
    return "Not recorded";
  }

  return String(value);
}

function schoolLevelLabel(level?: SchoolLevel): string {
  const labels: Record<SchoolLevel, string> = {
    kindergarten: "Kindergarten",
    primary: "Primary",
    secondary: "Secondary",
    university: "University",
  };

  return level ? labels[level] : "Not recorded";
}

function termLabel(term?: Term): string {
  const labels: Record<Term, string> = {
    "1": "Term 1",
    "2": "Term 2",
    "3": "Term 3",
    summer: "Summer",
    special: "Special",
  };

  return term ? labels[term] : "Not recorded";
}

function fmtDate(iso?: string): string {
  if (!iso) return "-";

  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function SchoolPage() {
  const params = useParams<{ locale: string; childId: string }>();
  const childId = params.childId;

  const [child, setChild] = useState<Child | null>(null);
  const [draftRecords, setDraftRecords] = useState<SchoolRecord[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const found = getChildById(childId);

    if (found) {
      const sorted = sortSchoolRecordsNewestFirst(found.schoolRecords ?? []);
      const normalized = { ...found, schoolRecords: sorted };
      setChild(normalized);
      setDraftRecords(sorted);
    }
  }, [childId]);

  const currentRecord = useMemo(
    () => sortSchoolRecordsNewestFirst(child?.schoolRecords ?? [])[0],
    [child]
  );

  const historyRecords = useMemo(
    () => sortSchoolRecordsNewestFirst(child?.schoolRecords ?? []),
    [child]
  );

  if (!child) {
    return <div style={{ padding: 16 }}>Child not found</div>;
  }

  const schoolFiles = (child.attachments ?? []).filter(
    (attachment) => attachment.section === "school"
  );

  function beginEdit() {
    if (!child) return;

    const existing = sortSchoolRecordsNewestFirst(child.schoolRecords ?? []);
    setDraftRecords(existing.length > 0 ? existing : [makeEmptySchoolRecord()]);
    setIsEditing(true);
  }

  function addSchoolRecord() {
    setDraftRecords((previous) => [makeEmptySchoolRecord(), ...previous]);
  }

  function removeSchoolRecord(recordId: string) {
    setDraftRecords((previous) =>
      previous.length === 1
        ? [makeEmptySchoolRecord()]
        : previous.filter((record) => record.id !== recordId)
    );
  }

  function updateRecord<K extends keyof SchoolRecord>(
    recordId: string,
    field: K,
    value: SchoolRecord[K]
  ) {
    setDraftRecords((previous) =>
      previous.map((record) =>
        record.id === recordId ? { ...record, [field]: value } : record
      )
    );
  }

  function saveEdit() {
    if (!child) return;

    const currentChild: Child = child;

    const cleanedRecords = draftRecords.filter((record) => {
      return Boolean(
        record.schoolName.trim() ||
          record.academicYear.trim() ||
          record.studentId?.trim() ||
          record.room?.trim() ||
          record.startDate ||
          record.endDate
      );
    });

    const sortedRecords = sortSchoolRecordsNewestFirst(cleanedRecords);
    const updatedChild: Child = {
      ...currentChild,
      updatedAt: new Date().toISOString(),
      schoolRecords: sortedRecords,
    };

    saveChild(childId, updatedChild);
    setChild(updatedChild);
    setDraftRecords(sortedRecords);
    setIsEditing(false);
  }

  function cancelEdit() {
    if (!child) return;

    setDraftRecords(sortSchoolRecordsNewestFirst(child.schoolRecords ?? []));
    setIsEditing(false);
  }

  function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    if (!child) return;

    const currentChild: Child = child;
    const file = event.target.files?.[0];
    if (!file) return;

    const inputElement = event.target;
    const reader = new FileReader();

    reader.onload = () => {
      const updatedChild: Child = {
        ...currentChild,
        updatedAt: new Date().toISOString(),
        attachments: [
          ...(currentChild.attachments ?? []),
          {
            id: makeId(),
            section: "school",
            name: file.name,
            type: file.type,
            dataUrl: String(reader.result),
            createdAt: new Date().toISOString(),
          },
        ],
      };

      saveChild(childId, updatedChild);
      setChild(updatedChild);
      inputElement.value = "";
    };

    reader.readAsDataURL(file);
  }

  return (
    <div style={pageStyle}>
      <Card>
        <label style={uploadButtonStyle}>
          Upload School File
          <input
            type="file"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
        </label>
      </Card>

      <Card>
        <SectionLabel
          emoji="🏫"
          label="Current School — Latest Record"
          color="#7F77DD"
          bg="#EEEDFE"
        />

        {currentRecord ? (
          <>
            <InfoRow label="School" value={displayValue(currentRecord.schoolName)} />
            <InfoRow
              label="School Level"
              value={schoolLevelLabel(currentRecord.schoolLevel)}
            />
            <InfoRow label="Student ID" value={displayValue(currentRecord.studentId)} />
            <InfoRow
              label="Academic Year"
              value={displayValue(currentRecord.academicYear)}
            />
            <InfoRow label="Term" value={termLabel(currentRecord.term)} />
            <InfoRow label="Room" value={displayValue(currentRecord.room)} />
            <InfoRow label="Number" value={displayValue(currentRecord.number)} />
            <InfoRow
              label="Period"
              value={`${fmtDate(currentRecord.startDate)} — ${fmtDate(
                currentRecord.endDate
              )}`}
            />
            {currentRecord.yearlyNote ? (
              <InfoRow label="Note" value={currentRecord.yearlyNote} />
            ) : null}
          </>
        ) : (
          <EmptyState emoji="🏫" message="No school history recorded yet." />
        )}
      </Card>

      <Card>
        <SectionLabel
          emoji="📚"
          label="Education History"
          color="#2563EB"
          bg="#EFF6FF"
        />

        {!isEditing ? (
          historyRecords.length > 0 ? (
            <div style={historyListStyle}>
              {historyRecords.map((record, index) => (
                <div key={record.id} style={historyItemStyle}>
                  <div style={historyHeaderStyle}>
                    <div>
                      <div style={historySchoolStyle}>
                        {record.schoolName || "School not recorded"}
                      </div>
                      <div style={historyMetaStyle}>
                        {displayValue(record.academicYear)} · {termLabel(record.term)} ·{" "}
                        {schoolLevelLabel(record.schoolLevel)}
                      </div>
                    </div>
                    {index === 0 ? <span style={latestBadgeStyle}>LATEST</span> : null}
                  </div>

                  <div style={historyDetailGridStyle}>
                    <span>Student ID: {displayValue(record.studentId)}</span>
                    <span>Room: {displayValue(record.room)}</span>
                    <span>Number: {displayValue(record.number)}</span>
                    <span>
                      Period: {fmtDate(record.startDate)} — {fmtDate(record.endDate)}
                    </span>
                  </div>

                  {record.yearlyNote ? (
                    <div style={noteStyle}>{record.yearlyNote}</div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState emoji="📚" message="No education history added yet." />
          )
        ) : (
          <div style={editorContainerStyle}>
            <button type="button" onClick={addSchoolRecord} style={addButtonStyle}>
              + Add Education Record
            </button>

            {draftRecords.map((record, index) => (
              <SchoolRecordEditor
                key={record.id}
                record={record}
                index={index}
                onChange={updateRecord}
                onRemove={removeSchoolRecord}
              />
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionLabel
          emoji="📎"
          label="School Attachments"
          color="#1D9E75"
          bg="#E1F5EE"
        />

        {schoolFiles.length > 0 ? (
          schoolFiles.map((attachment) => (
            <InfoRow
              key={attachment.id}
              label="File"
              value={
                <a href={attachment.dataUrl} download={attachment.name}>
                  📎 {attachment.name}
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
          <button onClick={beginEdit} style={primaryButtonStyle}>
            Edit Education History
          </button>
        ) : (
          <div style={actionRowStyle}>
            <button onClick={saveEdit} style={saveButtonStyle}>
              Save
            </button>
            <button onClick={cancelEdit} style={cancelButtonStyle}>
              Cancel
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

function SchoolRecordEditor({
  record,
  index,
  onChange,
  onRemove,
}: {
  record: SchoolRecord;
  index: number;
  onChange: <K extends keyof SchoolRecord>(
    recordId: string,
    field: K,
    value: SchoolRecord[K]
  ) => void;
  onRemove: (recordId: string) => void;
}) {
  return (
    <div style={editorCardStyle}>
      <div style={editorHeaderStyle}>
        <strong style={{ color: "#374151" }}>
          Education Record {index + 1}
        </strong>
        <button
          type="button"
          onClick={() => onRemove(record.id)}
          style={deleteButtonStyle}
        >
          Delete
        </button>
      </div>

      <div style={formGridStyle}>
        <InputField
          label="School"
          value={record.schoolName}
          onChange={(value) => onChange(record.id, "schoolName", value)}
        />

        <label style={labelStyle}>
          <span>School Level</span>
          <select
            style={inputStyle}
            value={record.schoolLevel}
            onChange={(event) =>
              onChange(record.id, "schoolLevel", event.target.value as SchoolLevel)
            }
          >
            <option value="kindergarten">Kindergarten</option>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="university">University</option>
          </select>
        </label>

        <InputField
          label="Student ID"
          value={record.studentId ?? ""}
          onChange={(value) => onChange(record.id, "studentId", value)}
        />

        <InputField
          label="Academic Year"
          value={record.academicYear}
          placeholder="e.g. 2026 or 2569"
          onChange={(value) => onChange(record.id, "academicYear", value)}
        />

        <label style={labelStyle}>
          <span>Term</span>
          <select
            style={inputStyle}
            value={record.term}
            onChange={(event) =>
              onChange(record.id, "term", event.target.value as Term)
            }
          >
            <option value="1">Term 1</option>
            <option value="2">Term 2</option>
            <option value="3">Term 3</option>
            <option value="summer">Summer</option>
            <option value="special">Special</option>
          </select>
        </label>

        <InputField
          label="Room"
          value={record.room ?? ""}
          onChange={(value) => onChange(record.id, "room", value)}
        />

        <label style={labelStyle}>
          <span>Number</span>
          <input
            type="number"
            style={inputStyle}
            value={record.number ?? ""}
            onChange={(event) =>
              onChange(
                record.id,
                "number",
                event.target.value === "" ? undefined : Number(event.target.value)
              )
            }
          />
        </label>

        <label style={labelStyle}>
          <span>Start Date</span>
          <input
            type="date"
            style={inputStyle}
            value={record.startDate ?? ""}
            onChange={(event) =>
              onChange(record.id, "startDate", event.target.value)
            }
          />
        </label>

        <label style={labelStyle}>
          <span>End Date</span>
          <input
            type="date"
            style={inputStyle}
            value={record.endDate ?? ""}
            onChange={(event) =>
              onChange(record.id, "endDate", event.target.value)
            }
          />
        </label>

        <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
          <span>Note</span>
          <textarea
            style={{ ...inputStyle, minHeight: 74, resize: "vertical" }}
            value={record.yearlyNote ?? ""}
            onChange={(event) =>
              onChange(record.id, "yearlyNote", event.target.value)
            }
            placeholder="Class teacher, learning note, special achievement, etc."
          />
        </label>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label style={labelStyle}>
      <span>{label}</span>
      <input
        style={inputStyle}
        value={value}
        placeholder={placeholder ?? label}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

const pageStyle: CSSProperties = {
  padding: "14px 16px 120px",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  fontSize: 14,
  boxSizing: "border-box",
  background: "#FFFFFF",
};

const labelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 13,
  color: "#6B7280",
};

const uploadButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "9px 18px",
  background: "#E1F5EE",
  color: "#0F9F79",
  borderRadius: 999,
  cursor: "pointer",
  fontWeight: 500,
};

const historyListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  padding: "12px 0",
};

const historyItemStyle: CSSProperties = {
  padding: 12,
  border: "1px solid #E5E7EB",
  borderRadius: 14,
  background: "#FFFFFF",
};

const historyHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 10,
};

const historySchoolStyle: CSSProperties = {
  fontWeight: 700,
  color: "#111827",
  fontSize: 15,
};

const historyMetaStyle: CSSProperties = {
  fontSize: 13,
  color: "#6B7280",
  marginTop: 3,
};

const historyDetailGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 7,
  marginTop: 10,
  color: "#4B5563",
  fontSize: 13,
};

const latestBadgeStyle: CSSProperties = {
  background: "#E1F5EE",
  color: "#087F5B",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
  padding: "5px 9px",
};

const noteStyle: CSSProperties = {
  marginTop: 10,
  padding: 9,
  background: "#F9FAFB",
  borderRadius: 10,
  color: "#4B5563",
  fontSize: 13,
};

const editorContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  padding: "12px 0",
};

const editorCardStyle: CSSProperties = {
  border: "1px solid #E5E7EB",
  borderRadius: 14,
  padding: 12,
  background: "#FAFAFF",
};

const editorHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: 10,
};

const addButtonStyle: CSSProperties = {
  border: "1px dashed #7F77DD",
  background: "#F5F3FF",
  color: "#6658D3",
  padding: "11px 14px",
  borderRadius: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const deleteButtonStyle: CSSProperties = {
  border: "none",
  background: "#FEE2E2",
  color: "#DC2626",
  borderRadius: 999,
  padding: "6px 11px",
  fontWeight: 600,
  cursor: "pointer",
};

const primaryButtonStyle: CSSProperties = {
  width: "100%",
  border: "none",
  background: "#7F77DD",
  color: "#FFFFFF",
  padding: "12px 14px",
  borderRadius: 999,
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
};

const actionRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
};

const saveButtonStyle: CSSProperties = {
  ...primaryButtonStyle,
  background: "#1D9E75",
  flex: 1,
};

const cancelButtonStyle: CSSProperties = {
  ...primaryButtonStyle,
  flex: 1,
  background: "#FFFFFF",
  color: "#6B7280",
  border: "1px solid #E5E7EB",
};
