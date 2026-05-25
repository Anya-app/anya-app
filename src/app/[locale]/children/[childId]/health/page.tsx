"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { ChangeEvent, CSSProperties } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Child, GrowthRecord } from "@/types";
import { getChildById, saveChild } from "@/lib/childStorage";
import { Card, SectionLabel, InfoRow } from "@/components/child/DetailPrimitives";

type BodyMetricKey =
  | "chest"
  | "shoulder"
  | "arm"
  | "neck"
  | "waist"
  | "hip"
  | "thigh"
  | "legLength";

const bodyMetricOptions: Array<{ key: BodyMetricKey; label: string }> = [
  { key: "chest", label: "รอบอก" },
  { key: "shoulder", label: "ไหล่" },
  { key: "arm", label: "แขน" },
  { key: "neck", label: "รอบคอ" },
  { key: "waist", label: "เอว" },
  { key: "hip", label: "สะโพก" },
  { key: "thigh", label: "รอบต้นขา" },
  { key: "legLength", label: "ความยาวขา" },
];

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  fontSize: 14,
  background: "#FFFFFF",
  boxSizing: "border-box",
};

const labelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 13,
  color: "#6B7280",
};

const primaryButtonStyle: CSSProperties = {
  border: "none",
  background: "#7F77DD",
  color: "white",
  padding: "11px 15px",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  ...primaryButtonStyle,
  background: "white",
  color: "#6B7280",
  border: "1px solid #E5E7EB",
};

const dangerButtonStyle: CSSProperties = {
  ...secondaryButtonStyle,
  color: "#DC2626",
  border: "1px solid #FECACA",
};

function newMeasurement(): GrowthRecord {
  return {
    id: "",
    date: new Date().toISOString().slice(0, 10),
    height: undefined,
    weight: undefined,
    clothingSize: "",
    chest: undefined,
    shoulder: undefined,
    arm: undefined,
    neck: undefined,
    waist: undefined,
    hip: undefined,
    thigh: undefined,
    legLength: undefined,
    other: "",
  };
}

function makeId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `growth-${crypto.randomUUID()}`;
  }
  return `growth-${Date.now()}`;
}

function sortMeasurements(records: GrowthRecord[]): GrowthRecord[] {
  return [...records].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
}

function toOptionalNumber(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatDate(date: string): string {
  if (!date) return "-";
  const value = new Date(`${date}T00:00:00`);
  if (Number.isNaN(value.getTime())) return date;
  return value.toLocaleDateString("en-GB");
}

function formatCm(value?: number): string {
  return value === undefined ? "-" : `${value} cm`;
}

function latestSnapshot(record: GrowthRecord | undefined) {
  if (!record) return {};
  return {
    weight: record.weight,
    height: record.height,
    clothingSize: record.clothingSize,
    chest: record.chest,
    shoulder: record.shoulder,
    arm: record.arm,
    neck: record.neck,
    waist: record.waist,
    hip: record.hip,
    thigh: record.thigh,
    legLength: record.legLength,
    other: record.other,
  };
}

export default function HealthPage() {
  const params = useParams<{ locale: string; childId: string }>();
  const childId = params.childId;

  const [child, setChild] = useState<Child | null>(null);
  const [isEditingMedical, setIsEditingMedical] = useState(false);
  const [medicalDraft, setMedicalDraft] = useState({
    congenitalDisease: "",
    bodyMarks: "",
  });
  const [measurementDraft, setMeasurementDraft] = useState<GrowthRecord | null>(null);
  const [selectedBodyMetric, setSelectedBodyMetric] =
    useState<BodyMetricKey>("chest");

  useEffect(() => {
    const found = getChildById(childId);
    if (found) setChild(found);
  }, [childId]);

  const records = useMemo(
    () => sortMeasurements(child?.health?.growthTrack ?? []),
    [child]
  );

  const latestRecord = records.length > 0 ? records[records.length - 1] : undefined;
  const bodyMetricLabel =
    bodyMetricOptions.find((option) => option.key === selectedBodyMetric)?.label ??
    "รอบอก";

  const chartData = useMemo(
    () =>
      records.map((record) => {
        const clothingSizeNumeric =
          record.clothingSize && Number.isFinite(Number(record.clothingSize))
            ? Number(record.clothingSize)
            : undefined;

        return {
          ...record,
          dateLabel: formatDate(record.date),
          selectedBodyValue: record[selectedBodyMetric],
          clothingSizeNumeric,
        };
      }),
    [records, selectedBodyMetric]
  );

  const hasNumericClothingSize = chartData.some(
    (record) => record.clothingSizeNumeric !== undefined
  );

  function persist(nextChild: Child) {
    const updated = {
      ...nextChild,
      updatedAt: new Date().toISOString(),
    };
    saveChild(childId, updated);
    setChild(updated);
  }

  function startEditMedical() {
    setMedicalDraft({
      congenitalDisease: (child?.health?.congenitalDisease ?? []).join(", "),
      bodyMarks: (child?.health?.bodyMarks ?? []).join(", "),
    });
    setIsEditingMedical(true);
  }

  function saveMedical() {
    if (!child) return;

    persist({
      ...child,
      health: {
        ...child.health,
        congenitalDisease: medicalDraft.congenitalDisease
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        bodyMarks: medicalDraft.bodyMarks
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      },
    });
    setIsEditingMedical(false);
  }

  function updateDraftNumber(field: BodyMetricKey | "height" | "weight", value: string) {
    setMeasurementDraft((previous) =>
      previous ? { ...previous, [field]: toOptionalNumber(value) } : previous
    );
  }

  function saveMeasurement() {
    if (!child || !measurementDraft || !measurementDraft.date) return;

    const record: GrowthRecord = {
      ...measurementDraft,
      id: measurementDraft.id || makeId(),
      clothingSize: measurementDraft.clothingSize?.trim() || undefined,
      other: measurementDraft.other?.trim() || undefined,
    };

    const existing = child.health?.growthTrack ?? [];
    const nextRecords = sortMeasurements(
      existing.some((item) => item.id === record.id)
        ? existing.map((item) => (item.id === record.id ? record : item))
        : [...existing, record]
    );
    const latest = nextRecords[nextRecords.length - 1];

    persist({
      ...child,
      health: {
        ...child.health,
        growthTrack: nextRecords,
        measurements: latestSnapshot(latest),
      },
    });
    setMeasurementDraft(null);
  }

  function deleteMeasurement(recordId: string | undefined) {
    if (!child || !recordId) return;
    const shouldDelete = window.confirm("Delete this measurement record?");
    if (!shouldDelete) return;

    const nextRecords = sortMeasurements(
      (child.health?.growthTrack ?? []).filter((record) => record.id !== recordId)
    );
    const latest = nextRecords.length > 0 ? nextRecords[nextRecords.length - 1] : undefined;

    persist({
      ...child,
      health: {
        ...child.health,
        growthTrack: nextRecords,
        measurements: latestSnapshot(latest),
      },
    });
    if (measurementDraft?.id === recordId) setMeasurementDraft(null);
  }

  function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !child) return;

    const reader = new FileReader();
    reader.onload = () => {
      persist({
        ...child,
        attachments: [
          ...(child.attachments ?? []),
          {
            id: makeId(),
            section: "health",
            name: file.name,
            type: file.type,
            dataUrl: reader.result as string,
            createdAt: new Date().toISOString(),
          },
        ],
      });
    };
    reader.readAsDataURL(file);
  }

  if (!child) {
    return <div style={{ padding: 16 }}>Child not found</div>;
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
        <SectionLabel emoji="❤️" label="Health" color="#DC2626" bg="#FEE2E2" />
        <div style={{ marginTop: 12 }}>
          <label
            style={{
              background: "#E1F5EE",
              color: "#1D9E75",
              padding: "8px 12px",
              borderRadius: 999,
              cursor: "pointer",
              fontSize: 13,
              display: "inline-block",
            }}
          >
            Upload Health File
            <input type="file" onChange={handleFileUpload} style={{ display: "none" }} />
          </label>
        </div>
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <SectionLabel emoji="⚕️" label="Medical" color="#DC2626" bg="#FEE2E2" />
          {!isEditingMedical && (
            <button onClick={startEditMedical} style={secondaryButtonStyle}>
              Edit
            </button>
          )}
        </div>

        {!isEditingMedical ? (
          <>
            <InfoRow
              label="Conditions"
              value={(child.health?.congenitalDisease ?? []).join(", ") || "None recorded"}
            />
            <InfoRow
              label="Body marks"
              value={(child.health?.bodyMarks ?? []).join(", ") || "None recorded"}
            />
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            <label style={labelStyle}>
              Conditions
              <input
                style={inputStyle}
                value={medicalDraft.congenitalDisease}
                onChange={(event) =>
                  setMedicalDraft((previous) => ({
                    ...previous,
                    congenitalDisease: event.target.value,
                  }))
                }
                placeholder="e.g. Asthma, Allergy"
              />
            </label>
            <label style={labelStyle}>
              Body marks
              <input
                style={inputStyle}
                value={medicalDraft.bodyMarks}
                onChange={(event) =>
                  setMedicalDraft((previous) => ({
                    ...previous,
                    bodyMarks: event.target.value,
                  }))
                }
                placeholder="e.g. Birthmark on left arm"
              />
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={saveMedical} style={{ ...primaryButtonStyle, background: "#1D9E75" }}>
                Save
              </button>
              <button onClick={() => setIsEditingMedical(false)} style={secondaryButtonStyle}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <SectionLabel emoji="📏" label="Latest Measurement" color="#7C3AED" bg="#F3E8FF" />
          <button onClick={() => setMeasurementDraft(newMeasurement())} style={primaryButtonStyle}>
            + Add
          </button>
        </div>

        {latestRecord ? (
          <div style={{ marginTop: 8 }}>
            <InfoRow label="Measured date" value={formatDate(latestRecord.date)} />
            <InfoRow label="Height" value={formatCm(latestRecord.height)} />
            <InfoRow
              label="Weight"
              value={latestRecord.weight === undefined ? "-" : `${latestRecord.weight} kg`}
            />
            <InfoRow label="ขนาดตัว / Size" value={latestRecord.clothingSize || "-"} />
            <InfoRow label="รอบอก" value={formatCm(latestRecord.chest)} />
            <InfoRow label="ไหล่" value={formatCm(latestRecord.shoulder)} />
            <InfoRow label="แขน" value={formatCm(latestRecord.arm)} />
            <InfoRow label="รอบคอ" value={formatCm(latestRecord.neck)} />
            <InfoRow label="เอว" value={formatCm(latestRecord.waist)} />
            <InfoRow label="สะโพก" value={formatCm(latestRecord.hip)} />
            <InfoRow label="รอบต้นขา" value={formatCm(latestRecord.thigh)} />
            <InfoRow label="ความยาวขา" value={formatCm(latestRecord.legLength)} />
            <InfoRow label="Other" value={latestRecord.other || "-"} />
          </div>
        ) : (
          <p style={{ color: "#6B7280", fontSize: 14, margin: "14px 0 0" }}>
            ยังไม่มีประวัติการวัด กด Add เพื่อบันทึกครั้งแรก
          </p>
        )}
      </Card>

      {measurementDraft && (
        <Card>
          <SectionLabel
            emoji="✍️"
            label={measurementDraft.id ? "Edit Measurement" : "Add Measurement"}
            color="#7C3AED"
            bg="#F3E8FF"
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 10,
              marginTop: 14,
            }}
          >
            <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
              วันที่วัด
              <input
                type="date"
                style={inputStyle}
                value={measurementDraft.date}
                onChange={(event) =>
                  setMeasurementDraft((previous) =>
                    previous ? { ...previous, date: event.target.value } : previous
                  )
                }
              />
            </label>

            <label style={labelStyle}>
              ส่วนสูง (cm)
              <input
                type="number"
                inputMode="decimal"
                style={inputStyle}
                value={measurementDraft.height ?? ""}
                onChange={(event) => updateDraftNumber("height", event.target.value)}
              />
            </label>
            <label style={labelStyle}>
              น้ำหนัก (kg)
              <input
                type="number"
                inputMode="decimal"
                style={inputStyle}
                value={measurementDraft.weight ?? ""}
                onChange={(event) => updateDraftNumber("weight", event.target.value)}
              />
            </label>

            <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
              ขนาดตัว / Clothing Size
              <input
                style={inputStyle}
                value={measurementDraft.clothingSize ?? ""}
                onChange={(event) =>
                  setMeasurementDraft((previous) =>
                    previous ? { ...previous, clothingSize: event.target.value } : previous
                  )
                }
                placeholder="เช่น 120, S, M"
              />
            </label>

            {bodyMetricOptions.map((option) => (
              <label key={option.key} style={labelStyle}>
                {option.label} (cm)
                <input
                  type="number"
                  inputMode="decimal"
                  style={inputStyle}
                  value={measurementDraft[option.key] ?? ""}
                  onChange={(event) => updateDraftNumber(option.key, event.target.value)}
                />
              </label>
            ))}

            <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
              Other
              <textarea
                style={{ ...inputStyle, minHeight: 72, resize: "vertical" }}
                value={measurementDraft.other ?? ""}
                onChange={(event) =>
                  setMeasurementDraft((previous) =>
                    previous ? { ...previous, other: event.target.value } : previous
                  )
                }
                placeholder="ข้อมูลเพิ่มเติม"
              />
            </label>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button
              onClick={saveMeasurement}
              style={{ ...primaryButtonStyle, background: "#1D9E75", flex: 1 }}
            >
              Save Measurement
            </button>
            <button
              onClick={() => setMeasurementDraft(null)}
              style={{ ...secondaryButtonStyle, flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </Card>
      )}

      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div>
            <SectionLabel emoji="📈" label="Growth Timeline" color="#0369A1" bg="#E0F2FE" />
            <p style={{ margin: "8px 0 0", color: "#6B7280", fontSize: 12 }}>
              แกน X = วันที่วัด · แกน Y = น้ำหนัก / ส่วนสูง / ขนาดตัว
            </p>
          </div>
          <label style={{ ...labelStyle, minWidth: 130 }}>
            เส้นขนาดตัว
            <select
              style={inputStyle}
              value={selectedBodyMetric}
              onChange={(event) => setSelectedBodyMetric(event.target.value as BodyMetricKey)}
            >
              {bodyMetricOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {chartData.length > 0 ? (
          <div style={{ width: "100%", height: 300, marginTop: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 6, right: 12, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="height"
                  name="ส่วนสูง (cm)"
                  stroke="#2563EB"
                  strokeWidth={2}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="น้ำหนัก (kg)"
                  stroke="#16A34A"
                  strokeWidth={2}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="selectedBodyValue"
                  name={`${bodyMetricLabel} (cm)`}
                  stroke="#7C3AED"
                  strokeWidth={2}
                  connectNulls
                />
                {hasNumericClothingSize && (
                  <Line
                    type="monotone"
                    dataKey="clothingSizeNumeric"
                    name="ขนาดตัว"
                    stroke="#F97316"
                    strokeWidth={2}
                    connectNulls
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p style={{ color: "#6B7280", fontSize: 14, margin: "14px 0 0" }}>
            กราฟจะแสดงเมื่อมีข้อมูลการวัดอย่างน้อย 1 รายการ
          </p>
        )}
      </Card>

      <Card>
        <SectionLabel emoji="🗓️" label="Measurement History" color="#1D9E75" bg="#E1F5EE" />

        {records.length === 0 ? (
          <p style={{ color: "#6B7280", fontSize: 14, margin: "14px 0 0" }}>
            No measurement history recorded.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            {[...records].reverse().map((record) => (
              <div
                key={record.id ?? record.date}
                style={{
                  border: "1px solid #E5E7EB",
                  borderRadius: 14,
                  padding: 12,
                  background: "#FAFAFA",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <strong style={{ fontSize: 14 }}>{formatDate(record.date)}</strong>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => setMeasurementDraft({ ...record })}
                      style={{ ...secondaryButtonStyle, padding: "6px 10px", fontSize: 12 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMeasurement(record.id)}
                      style={{ ...dangerButtonStyle, padding: "6px 10px", fontSize: 12 }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    color: "#4B5563",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px 14px",
                  }}
                >
                  <span>สูง {record.height ?? "-"} cm</span>
                  <span>หนัก {record.weight ?? "-"} kg</span>
                  <span>รอบอก {record.chest ?? "-"} cm</span>
                  <span>เอว {record.waist ?? "-"} cm</span>
                  <span>สะโพก {record.hip ?? "-"} cm</span>
                  <span>Size {record.clothingSize || "-"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
