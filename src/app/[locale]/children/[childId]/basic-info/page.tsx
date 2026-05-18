"use client";

import { useEffect, useState } from "react";
import { mockAppData } from "@/lib/data";
import { calcAge, type Child } from "@/types";
import {
  Card,
  SectionLabel,
  InfoRow,
  EmptyState,
} from "@/components/child/DetailPrimitives";

function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function FamilyValue({
  member,
}: {
  member?: {
    name?: string;
    altNames?: Array<{ value: string; language: string }>;
    status?: "alive" | "passed";
  };
}) {
  if (!member?.name) return <>-</>;

  const isPassed = member.status === "passed";

  return (
    <span style={{ color: isPassed ? "#9CA3AF" : "inherit" }}>
      {member.name}
      {member.altNames?.length ? (
        <span style={{ marginLeft: 6 }}>
          ({member.altNames.map((n) => n.value).join(", ")})
        </span>
      ) : null}
      {isPassed ? (
        <span style={{ marginLeft: 8, fontSize: 12 }}>Passed</span>
      ) : null}
    </span>
  );
}

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

export default function BasicInfoPage({
  params,
}: {
  params: { locale: string; childId: string };
}) {
  const originalChild = mockAppData.children.find((c) => c.id === params.childId);

  const [child, setChild] = useState<Child | undefined>(originalChild);
  const [draft, setDraft] = useState<Child | undefined>(originalChild);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(`child-${params.childId}`);

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Child;
        setChild(parsed);
        setDraft(parsed);
      } catch {
        localStorage.removeItem(`child-${params.childId}`);
      }
    }
  }, [params.childId]);

  if (!child || !draft) {
    return <div style={{ padding: 16 }}>Child not found</div>;
  }

  const b = child.basicInfo;
  const db = draft.basicInfo;
  const age = calcAge(b.dateOfBirth);

  function updateBasicInfo(field: string, value: string) {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        basicInfo: {
          ...prev.basicInfo,
          [field]: value,
        },
      };
    });
  }

  function updateName(lang: "th" | "en" | "zh", value: string) {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        basicInfo: {
          ...prev.basicInfo,
          names: {
            ...prev.basicInfo.names,
            [lang]: {
              ...prev.basicInfo.names?.[lang],
              fullName: value,
            },
          },
        },
      };
    });
  }

  function updateFamily(
    key:
      | "paternalGrandfather"
      | "paternalGrandmother"
      | "maternalGrandfather"
      | "maternalGrandmother",
    field: "name" | "status",
    value: string
  ) {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        basicInfo: {
          ...prev.basicInfo,
          [key]: {
            ...prev.basicInfo[key],
            [field]: value,
          },
        },
      };
    });
  }

  function saveEdit() {
    localStorage.setItem(`child-${params.childId}`, JSON.stringify(draft));
    setChild(draft);
    setIsEditing(false);
    setSaveMessage("Saved on this device");
  }

  function cancelEdit() {
    setDraft(child);
    setIsEditing(false);
  }

 function exportJson() {
  if (!child) return; // ✅ FIX

  const blob = new Blob([JSON.stringify(child, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${child.id}-basic-info.json`;
  a.click();

  URL.revokeObjectURL(url);
}

  function resetLocalData() {
    localStorage.removeItem(`child-${params.childId}`);
    if (originalChild) {
      setChild(originalChild);
      setDraft(originalChild);
      setSaveMessage("Reset to original data");
    }
  }

  function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError("");

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Child;

        if (!parsed.id || !parsed.basicInfo) {
          setUploadError("JSON format ไม่ถูกต้อง ต้องมี id และ basicInfo");
          return;
        }

        localStorage.setItem(`child-${params.childId}`, JSON.stringify(parsed));
        setChild(parsed);
        setDraft(parsed);
        setIsEditing(false);
        setSaveMessage("Uploaded and saved on this device");
      } catch {
        setUploadError("อ่านไฟล์ JSON ไม่ได้ กรุณาตรวจ format อีกครั้ง");
      }
    };

    reader.readAsText(file);
  }
function handleFileUpload(
  section: "health" | "school" | "activities" | "awards",
  event: React.ChangeEvent<HTMLInputElement>
) {
  const file = event.target.files?.[0];
  if (!file || !draft) return;

  const reader = new FileReader();

  reader.onload = () => {
    const newAttachment = {
      id: crypto.randomUUID(),
      section,
      name: file.name,
      type: file.type,
      dataUrl: reader.result as string,
      createdAt: new Date().toISOString(),
    };

    setDraft({
      ...draft,
      attachments: [...(draft.attachments || []), newAttachment],
    });
  };

  reader.readAsDataURL(file);
}
  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
          <SectionLabel emoji="🪪" label="Identity" color="#7F77DD" bg="#EEEDFE" />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} style={{ border: "none", background: "#7F77DD", color: "white", padding: "8px 12px", borderRadius: 999, fontSize: 13 }}>
                Edit
              </button>
            ) : (
              <>
                <button onClick={saveEdit} style={{ border: "none", background: "#1D9E75", color: "white", padding: "8px 12px", borderRadius: 999, fontSize: 13 }}>
                  Save
                </button>
                <button onClick={cancelEdit} style={{ border: "1px solid #E5E7EB", background: "white", color: "#6B7280", padding: "8px 12px", borderRadius: 999, fontSize: 13 }}>
                  Cancel
                </button>
              </>
            )}

            <button onClick={exportJson} style={{ border: "1px solid #E5E7EB", background: "white", color: "#7F77DD", padding: "8px 12px", borderRadius: 999, fontSize: 13 }}>
              Export JSON
            </button>

            <button onClick={resetLocalData} style={{ border: "1px solid #E5E7EB", background: "white", color: "#9CA3AF", padding: "8px 12px", borderRadius: 999, fontSize: 13 }}>
              Reset
            </button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ display: "inline-block", background: "#EEEDFE", color: "#7F77DD", padding: "8px 12px", borderRadius: 999, fontSize: 13, cursor: "pointer" }}>
            Upload JSON
            <input type="file" accept="application/json" onChange={handleUpload} style={{ display: "none" }} />
          </label>

          {uploadError && <div style={{ color: "#DC2626", fontSize: 13, marginTop: 8 }}>{uploadError}</div>}
          {saveMessage && <div style={{ color: "#1D9E75", fontSize: 13, marginTop: 8 }}>{saveMessage}</div>}
        </div>

        {!isEditing ? (
          <>
            <InfoRow label="First name" value={b.name} />
            <InfoRow label="Last name" value={b.lastname} />
            <InfoRow label="Thai full name" value={b.names?.th?.fullName} />
            <InfoRow label="English full name" value={b.names?.en?.fullName} />
            <InfoRow label="Chinese name" value={b.names?.zh?.fullName} />
            <InfoRow label="Middle name" value={b.middleName} />
            <InfoRow label="Saint name" value={b.saintName} />
            <InfoRow label="Other name" value={b.otherName} />
            <InfoRow label="Nickname" value={b.nickname} />
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            <label style={labelStyle}>First name<input style={inputStyle} value={db.name ?? ""} onChange={(e) => updateBasicInfo("name", e.target.value)} /></label>
            <label style={labelStyle}>Last name<input style={inputStyle} value={db.lastname ?? ""} onChange={(e) => updateBasicInfo("lastname", e.target.value)} /></label>
            <label style={labelStyle}>Thai full name<input style={inputStyle} value={db.names?.th?.fullName ?? ""} onChange={(e) => updateName("th", e.target.value)} /></label>
            <label style={labelStyle}>English full name<input style={inputStyle} value={db.names?.en?.fullName ?? ""} onChange={(e) => updateName("en", e.target.value)} /></label>
            <label style={labelStyle}>Chinese name<input style={inputStyle} value={db.names?.zh?.fullName ?? ""} onChange={(e) => updateName("zh", e.target.value)} /></label>
            <label style={labelStyle}>Middle name<input style={inputStyle} value={db.middleName ?? ""} onChange={(e) => updateBasicInfo("middleName", e.target.value)} /></label>
            <label style={labelStyle}>Saint name<input style={inputStyle} value={db.saintName ?? ""} onChange={(e) => updateBasicInfo("saintName", e.target.value)} /></label>
            <label style={labelStyle}>Other name<input style={inputStyle} value={db.otherName ?? ""} onChange={(e) => updateBasicInfo("otherName", e.target.value)} /></label>
            <label style={labelStyle}>Nickname<input style={inputStyle} value={db.nickname ?? ""} onChange={(e) => updateBasicInfo("nickname", e.target.value)} /></label>
          </div>
        )}
      </Card>

      <Card>
        <SectionLabel emoji="🎂" label="Birth" color="#0369A1" bg="#E0F2FE" />

        {!isEditing ? (
          <>
            <InfoRow
              label="Date of birth"
              value={b.dateOfBirth ? `${fmtDate(b.dateOfBirth)}${age !== null ? `  (${age} yrs)` : ""}` : undefined}
            />
            <InfoRow label="Place of birth" value={b.placeOfBirth} />
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            <label style={labelStyle}>Date of birth<input type="date" style={inputStyle} value={db.dateOfBirth ?? ""} onChange={(e) => updateBasicInfo("dateOfBirth", e.target.value)} /></label>
            <label style={labelStyle}>Place of birth<input style={inputStyle} value={db.placeOfBirth ?? ""} onChange={(e) => updateBasicInfo("placeOfBirth", e.target.value)} /></label>
          </div>
        )}
      </Card>

      <Card>
        <SectionLabel emoji="👨‍👩‍👧‍👦" label="Family" color="#1D9E75" bg="#E1F5EE" />

        {!isEditing ? (
          <>
            <InfoRow label="Mother" value={b.motherName} />
            <InfoRow label="Father" value={b.fatherName} />
            <InfoRow label="Paternal Grandfather" value={<FamilyValue member={b.paternalGrandfather} />} />
            <InfoRow label="Paternal Grandmother" value={<FamilyValue member={b.paternalGrandmother} />} />
            <InfoRow label="Maternal Grandfather" value={<FamilyValue member={b.maternalGrandfather} />} />
            <InfoRow label="Maternal Grandmother" value={<FamilyValue member={b.maternalGrandmother} />} />
            <InfoRow label="Guardian" value={b.parent} />

            {(b.brother ?? []).length > 0 && <InfoRow label="Brother(s)" value={(b.brother ?? []).join(", ")} />}
            {(b.sister ?? []).length > 0 && <InfoRow label="Sister(s)" value={(b.sister ?? []).join(", ")} />}

            {!b.motherName &&
              !b.fatherName &&
              !b.paternalGrandfather &&
              !b.paternalGrandmother &&
              !b.maternalGrandfather &&
              !b.maternalGrandmother &&
              !b.parent &&
              (b.brother ?? []).length === 0 &&
              (b.sister ?? []).length === 0 && (
                <EmptyState emoji="👨‍👩‍👧‍👦" message="No family information recorded yet." />
              )}
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            <label style={labelStyle}>Mother<input style={inputStyle} value={db.motherName ?? ""} onChange={(e) => updateBasicInfo("motherName", e.target.value)} /></label>
            <label style={labelStyle}>Father<input style={inputStyle} value={db.fatherName ?? ""} onChange={(e) => updateBasicInfo("fatherName", e.target.value)} /></label>

            {[
              ["paternalGrandfather", "Paternal Grandfather"],
              ["paternalGrandmother", "Paternal Grandmother"],
              ["maternalGrandfather", "Maternal Grandfather"],
              ["maternalGrandmother", "Maternal Grandmother"],
            ].map(([key, label]) => {
              const k = key as
                | "paternalGrandfather"
                | "paternalGrandmother"
                | "maternalGrandfather"
                | "maternalGrandmother";

              return (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={labelStyle}>
                    {label}
                    <input style={inputStyle} value={db[k]?.name ?? ""} onChange={(e) => updateFamily(k, "name", e.target.value)} />
                  </label>

                  <select value={db[k]?.status ?? "alive"} onChange={(e) => updateFamily(k, "status", e.target.value)} style={inputStyle}>
                    <option value="alive">Alive</option>
                    <option value="passed">Passed</option>
                  </select>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
