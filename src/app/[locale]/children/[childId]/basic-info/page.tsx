"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { calcAge, type BasicInfo, type Child, type FamilyMember } from "@/types";
import { saveChild } from "@/lib/childStorage";
import {
  Card,
  SectionLabel,
  InfoRow,
} from "@/components/child/DetailPrimitives";

type FamilyKey =
  | "father"
  | "mother"
  | "paternalGrandfather"
  | "paternalGrandmother"
  | "maternalGrandfather"
  | "maternalGrandmother";

type FamilyLanguage = "th" | "en";

const FAMILY_GROUPS: Array<{
  label: string;
  emoji: string;
  color: string;
  bg: string;
  members: Array<{ key: FamilyKey; label: string; thaiLabel: string }>;
}> = [
  {
    label: "Parents",
    emoji: "👨‍👩‍👧",
    color: "#059669",
    bg: "#ECFDF5",
    members: [
      { key: "father", label: "Father", thaiLabel: "บิดา" },
      { key: "mother", label: "Mother", thaiLabel: "มารดา" },
    ],
  },
  {
    label: "Paternal Grandparents — ฝั่งพ่อ",
    emoji: "👴",
    color: "#2563EB",
    bg: "#EFF6FF",
    members: [
      { key: "paternalGrandfather", label: "Paternal Grandfather", thaiLabel: "ปู่" },
      { key: "paternalGrandmother", label: "Paternal Grandmother", thaiLabel: "ย่า" },
    ],
  },
  {
    label: "Maternal Grandparents — ฝั่งแม่",
    emoji: "👵",
    color: "#DB2777",
    bg: "#FDF2F8",
    members: [
      { key: "maternalGrandfather", label: "Maternal Grandfather", thaiLabel: "ตา" },
      { key: "maternalGrandmother", label: "Maternal Grandmother", thaiLabel: "ยาย" },
    ],
  },
];

function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function legacyFamilyName(info: BasicInfo, key: FamilyKey): string {
  if (key === "father") return info.fatherName ?? "";
  if (key === "mother") return info.motherName ?? "";
  if (key === "paternalGrandfather") return info.grandfather ?? "";
  if (key === "paternalGrandmother") return info.grandmother ?? "";
  return "";
}

function getLanguageName(
  info: BasicInfo,
  key: FamilyKey,
  language: FamilyLanguage
): string {
  const member = info[key];
  const storedName = member?.names?.[language]?.fullName?.trim();

  if (storedName) return storedName;

  const alternateName = member?.altNames?.find((name) => {
    const languageValue = name.language.toLowerCase();
    return language === "th"
      ? languageValue.includes("thai") || languageValue.includes("th")
      : languageValue.includes("english") || languageValue.includes("en");
  })?.value;

  if (alternateName) return alternateName;

  if (language === "en") {
    return member?.name ?? legacyFamilyName(info, key);
  }

  return "";
}

function showFamilyValue(info: BasicInfo, key: FamilyKey): string {
  const thai = getLanguageName(info, key, "th");
  const english = getLanguageName(info, key, "en");

  if (thai && english) return `${thai} / ${english}`;
  return thai || english || "-";
}

export default function BasicInfoPage() {
  const routeParams = useParams();
  const childId = String(routeParams.childId ?? routeParams.id ?? "");
  const { children, setChildren } = useApp();

  const originalChild = children.find((c) => c.id === childId);
  const [child, setChild] = useState<Child | undefined>(originalChild);
  const [draft, setDraft] = useState<Child | undefined>(originalChild);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setChild(originalChild);
    setDraft(originalChild);
    setIsEditing(false);
  }, [originalChild]);

  if (!child || !draft) {
    return <div style={{ padding: 16 }}>Child not found</div>;
  }

  const b = child.basicInfo;
  const db = draft.basicInfo;
  const age = calcAge(b.dateOfBirth);

  function updateBasicField<K extends keyof BasicInfo>(
    field: K,
    value: BasicInfo[K]
  ) {
    setDraft((previous) => {
      if (!previous) return previous;

      return {
        ...previous,
        updatedAt: new Date().toISOString(),
        basicInfo: {
          ...previous.basicInfo,
          [field]: value,
        },
      };
    });
  }

  function updateFamilyName(
    key: FamilyKey,
    language: FamilyLanguage,
    value: string
  ) {
    setDraft((previous) => {
      if (!previous) return previous;

      const basicInfo = previous.basicInfo;
      const existingMember: FamilyMember = basicInfo[key] ?? {};
      const nextMember: FamilyMember = {
        ...existingMember,
        name: language === "en" ? value : existingMember.name ?? "",
        names: {
          ...existingMember.names,
          [language]: {
            ...existingMember.names?.[language],
            fullName: value,
          },
        },
      };

      const nextBasicInfo: BasicInfo = {
        ...basicInfo,
        [key]: nextMember,
      };

      // Keep old fields updated while other pages are still being upgraded.
      if (language === "en") {
        if (key === "father") nextBasicInfo.fatherName = value;
        if (key === "mother") nextBasicInfo.motherName = value;
        if (key === "paternalGrandfather") nextBasicInfo.grandfather = value;
        if (key === "paternalGrandmother") nextBasicInfo.grandmother = value;
      }

      return {
        ...previous,
        updatedAt: new Date().toISOString(),
        basicInfo: nextBasicInfo,
      };
    });
  }

  function save() {
    if (!draft) return;

    const savedDraft: Child = draft;

    saveChild(savedDraft.id, savedDraft);

    setChildren((previous: Child[]) =>
      previous.map((item) => (item.id === savedDraft.id ? savedDraft : item))
    );

    setChild(savedDraft);
    setDraft(savedDraft);
    setIsEditing(false);
  }

  function cancel() {
    setDraft(child);
    setIsEditing(false);
  }

  return (
    <div style={pageStyle}>
      <Card>
        <SectionLabel emoji="🪪" label="Basic Info" color="#7F77DD" bg="#EEEDFE" />

        {!isEditing ? (
          <>
            <InfoRow label="Name" value={`${b.name ?? ""} ${b.lastname ?? ""}`.trim() || "-"} />
            <InfoRow label="Nickname" value={b.nickname || "-"} />
            <InfoRow label="Gender" value={b.gender || "-"} />
            <InfoRow
              label="Date of birth"
              value={
                b.dateOfBirth
                  ? `${fmtDate(b.dateOfBirth)}${age !== null ? ` (${age} yrs)` : ""}`
                  : "-"
              }
            />
            <InfoRow label="Place of birth" value={b.placeOfBirth || "-"} />
          </>
        ) : (
          <div style={formGrid}>
            <InputField
              label="First name"
              value={db.name ?? ""}
              onChange={(value) => updateBasicField("name", value)}
            />
            <InputField
              label="Last name"
              value={db.lastname ?? ""}
              onChange={(value) => updateBasicField("lastname", value)}
            />
            <InputField
              label="Nickname"
              value={db.nickname ?? ""}
              onChange={(value) => updateBasicField("nickname", value)}
            />
            <label style={fieldStyle}>
              <span style={fieldLabelStyle}>Gender</span>
              <select
                value={db.gender ?? ""}
                onChange={(event) =>
                  updateBasicField(
                    "gender",
                    event.target.value as BasicInfo["gender"]
                  )
                }
                style={inputStyle}
              >
                <option value="">Select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label style={fieldStyle}>
              <span style={fieldLabelStyle}>Date of birth</span>
              <input
                type="date"
                value={db.dateOfBirth ?? ""}
                onChange={(event) =>
                  updateBasicField("dateOfBirth", event.target.value)
                }
                style={inputStyle}
              />
            </label>
            <InputField
              label="Place of birth"
              value={db.placeOfBirth ?? ""}
              onChange={(value) => updateBasicField("placeOfBirth", value)}
            />
          </div>
        )}
      </Card>

      <Card>
        <SectionLabel emoji="📛" label="Other Names" color="#6366F1" bg="#EEF2FF" />

        {!isEditing ? (
          <>
            <InfoRow label="Middle name" value={b.middleName || "-"} />
            <InfoRow label="Saint name" value={b.saintName || "-"} />
            <InfoRow label="Other name" value={b.otherName || "-"} />
          </>
        ) : (
          <div style={formGrid}>
            <InputField
              label="Middle name"
              value={db.middleName ?? ""}
              onChange={(value) => updateBasicField("middleName", value)}
            />
            <InputField
              label="Saint name"
              value={db.saintName ?? ""}
              onChange={(value) => updateBasicField("saintName", value)}
            />
            <InputField
              label="Other name"
              value={db.otherName ?? ""}
              onChange={(value) => updateBasicField("otherName", value)}
            />
          </div>
        )}
      </Card>

      {FAMILY_GROUPS.map((group) => (
        <Card key={group.label}>
          <SectionLabel
            emoji={group.emoji}
            label={group.label}
            color={group.color}
            bg={group.bg}
          />

          {!isEditing ? (
            <>
              {group.members.map((member) => (
                <InfoRow
                  key={member.key}
                  label={`${member.label} (${member.thaiLabel})`}
                  value={showFamilyValue(b, member.key)}
                />
              ))}
            </>
          ) : (
            <div style={familyEditContainer}>
              {group.members.map((member) => (
                <div key={member.key} style={familyMemberBox}>
                  <div style={memberTitleStyle}>
                    {member.label} <span style={memberThaiStyle}>({member.thaiLabel})</span>
                  </div>
                  <div style={formGrid}>
                    <InputField
                      label="ชื่อภาษาไทย"
                      value={getLanguageName(db, member.key, "th")}
                      onChange={(value) =>
                        updateFamilyName(member.key, "th", value)
                      }
                      placeholder={`ชื่อ${member.thaiLabel} ภาษาไทย`}
                    />
                    <InputField
                      label="English name"
                      value={getLanguageName(db, member.key, "en")}
                      onChange={(value) =>
                        updateFamilyName(member.key, "en", value)
                      }
                      placeholder={`${member.label} English name`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}

      <Card>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} style={btnPrimary}>
            Edit Basic Info
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={save} style={btnSave}>
              Save
            </button>
            <button onClick={cancel} style={btnCancel}>
              Cancel
            </button>
          </div>
        )}
      </Card>
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
    <label style={fieldStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={inputStyle}
        placeholder={placeholder ?? label}
      />
    </label>
  );
}

const pageStyle: CSSProperties = {
  padding: 16,
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const formGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 10,
  padding: "12px 0",
};

const familyEditContainer: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
  padding: "12px 0",
};

const familyMemberBox: CSSProperties = {
  border: "1px solid #E5E7EB",
  borderRadius: 14,
  padding: 12,
  background: "#FFFFFF",
};

const memberTitleStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: 14,
  color: "#374151",
  marginBottom: 4,
};

const memberThaiStyle: CSSProperties = {
  color: "#6B7280",
  fontWeight: 500,
};

const fieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 5,
};

const fieldLabelStyle: CSSProperties = {
  color: "#6B7280",
  fontSize: 12,
  fontWeight: 600,
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

const btnPrimary: CSSProperties = {
  width: "100%",
  background: "#7F77DD",
  color: "#FFFFFF",
  border: "none",
  padding: "12px 14px",
  borderRadius: 999,
  fontWeight: 700,
  cursor: "pointer",
};

const btnSave: CSSProperties = {
  flex: 1,
  background: "#1D9E75",
  color: "#FFFFFF",
  border: "none",
  padding: "12px 14px",
  borderRadius: 999,
  fontWeight: 700,
  cursor: "pointer",
};

const btnCancel: CSSProperties = {
  flex: 1,
  background: "#FFFFFF",
  color: "#374151",
  border: "1px solid #E5E7EB",
  padding: "12px 14px",
  borderRadius: 999,
  fontWeight: 700,
  cursor: "pointer",
};
