import { notFound } from "next/navigation";
import { mockAppData } from "@/lib/data";
import type { SchoolRecord, TermGrade } from "@/types";
import {
  Card,
  SectionLabel,
  InfoRow,
  Pill,
  EmptyState,
  ScoreBar,
} from "@/components/child/DetailPrimitives";

// ── Helpers ──────────────────────────────────────────────────

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function levelLabel(level: string): string {
  const map: Record<string, string> = {
    university: "University",
    secondary: "Secondary",
    primary: "Primary",
    kindergarten: "Kindergarten",
  };
  return map[level] ?? level;
}

function gradeColor(score: number, max: number): string {
  const pct = (score / max) * 100;
  if (pct >= 80) return "#16A34A";
  if (pct >= 60) return "#D97706";
  return "#DC2626";
}

// ── Sub-components ───────────────────────────────────────────

function RecordCard({ record }: { record: SchoolRecord }) {
  return (
    <Card>
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          background: "linear-gradient(135deg, #4F46E522, #7F77DD11)",
          borderBottom: "0.5px solid #7F77DD22",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-text-primary, #111827)" }}>
            {record.schoolName}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary, #6b7280)", marginTop: 3 }}>
            {levelLabel(record.schoolLevel)} · Year {record.academicYear} · Term {record.term}
          </div>
        </div>
        {record.grades?.[0]?.gpa && (
          <div
            style={{
              background: "#7F77DD",
              color: "#fff",
              borderRadius: 10,
              padding: "4px 12px",
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            GPA {record.grades[0].gpa.toFixed(2)}
          </div>
        )}
      </div>

      {/* Core details */}
      <InfoRow label="Student ID" value={record.studentId} mono />
      <InfoRow label="Room"       value={record.room} />
      <InfoRow label="Number"     value={record.number} />
      <InfoRow
        label="School hours"
        value={
          record.normalSchoolTime
            ? `${record.normalSchoolTime.startTime} – ${record.normalSchoolTime.endTime}`
            : undefined
        }
      />
      <InfoRow
        label="Activity hours"
        value={
          record.activitySchoolTime
            ? `${record.activitySchoolTime.startTime} – ${record.activitySchoolTime.endTime}`
            : undefined
        }
      />
      <InfoRow
        label="Dates"
        value={
          record.startDate
            ? `${fmtDate(record.startDate)}${record.endDate ? ` → ${fmtDate(record.endDate)}` : ""}`
            : undefined
        }
      />

      {/* Positions */}
      {(record.classPosition ?? []).length > 0 && (
        <div style={{ padding: "8px 14px 4px" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--color-text-secondary, #6b7280)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 6,
            }}
          >
            Class rank
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {record.classPosition!.map((p, i) => (
              <Pill
                key={i}
                label={`🏅 #${p.rank}${p.outOf ? ` / ${p.outOf}` : ""} — Term ${p.term} ${p.academicYear}`}
                bg="#EEEDFE"
                color="#7F77DD"
              />
            ))}
          </div>
        </div>
      )}

      {(record.schoolPosition ?? []).length > 0 && (
        <div style={{ padding: "8px 14px 12px" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--color-text-secondary, #6b7280)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 6,
            }}
          >
            School role
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {record.schoolPosition!.map((p, i) => (
              <Pill key={i} label={`⭐ ${p.title}`} bg="#FEF9C3" color="#854D0E" />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function ScheduleCard({ record }: { record: SchoolRecord }) {
  const slots = record.classSchedule ?? [];
  if (slots.length === 0) return null;

  const byDay = DAYS.reduce<Record<string, typeof slots>>(
    (acc, d) => ({ ...acc, [d]: slots.filter((s) => s.day === d) }),
    {} as Record<string, typeof slots>
  );

  return (
    <Card>
      <SectionLabel emoji="🗓" label="Class Schedule" color="#7F77DD" bg="#EEEDFE" />

      {DAYS.filter((d) => byDay[d].length > 0).map((day) => (
        <div key={day}>
          <div
            style={{
              padding: "6px 14px",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--color-text-secondary, #6b7280)",
              background: "var(--color-background-secondary, #f8fafc)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            {day}
          </div>
          {byDay[day]
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((slot, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 14px",
                  borderBottom: "0.5px solid var(--color-border-tertiary, #f1f5f9)",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--color-text-secondary, #6b7280)",
                    width: 80,
                    flexShrink: 0,
                    fontWeight: 500,
                  }}
                >
                  {slot.startTime}–{slot.endTime}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{slot.subject}</div>
                  {slot.teacher && (
                    <div style={{ fontSize: 12, color: "var(--color-text-secondary, #6b7280)", marginTop: 1 }}>
                      {slot.teacher}
                      {slot.room ? ` · ${slot.room}` : ""}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      ))}
    </Card>
  );
}

function GradesCard({ grades }: { grades: TermGrade[] }) {
  if (grades.length === 0) return null;

  return (
    <Card>
      <SectionLabel emoji="📊" label="Grades" color="#16A34A" bg="#DCFCE7" />

      {grades.map((g, gi) => (
        <div key={gi}>
          {/* Term header */}
          <div
            style={{
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 700,
              color: "var(--color-text-secondary, #6b7280)",
              background: "var(--color-background-secondary, #f8fafc)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Term {g.term} — {g.type}</span>
            {g.gpa && (
              <span style={{ color: "#16A34A", fontSize: 13 }}>
                GPA {g.gpa.toFixed(2)}
              </span>
            )}
          </div>

          {/* Subject rows */}
          {(g.subjectScores ?? []).map((s) => {
            const color = gradeColor(s.score, s.maxScore);
            return (
              <div
                key={s.subject}
                style={{
                  padding: "10px 14px",
                  borderBottom: "0.5px solid var(--color-border-tertiary, #f1f5f9)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{s.subject}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>
                    {s.score}/{s.maxScore}
                    {s.grade ? ` · ${s.grade}` : ""}
                  </span>
                </div>
                <ScoreBar score={s.score} maxScore={s.maxScore} color={color} />
              </div>
            );
          })}
        </div>
      ))}
    </Card>
  );
}

function ExamsCard({ record }: { record: SchoolRecord }) {
  const exams = record.examDates ?? [];
  if (exams.length === 0) return null;

  return (
    <Card>
      <SectionLabel emoji="📝" label="Exam Dates" color="#D85A30" bg="#FAECE7" />

      {exams.map((ex, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 14px",
            borderBottom: "0.5px solid var(--color-border-tertiary, #f1f5f9)",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: "#FAECE7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            📝
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{ex.subject}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary, #6b7280)", marginTop: 1 }}>
              {fmtDate(ex.date)}
              {ex.startTime ? ` · ${ex.startTime}` : ""}
              {ex.endTime   ? `–${ex.endTime}` : ""}
              {ex.room      ? ` · ${ex.room}` : ""}
            </div>
          </div>
        </div>
      ))}
    </Card>
  );
}

function FieldTripsCard({ record }: { record: SchoolRecord }) {
  const trips = record.fieldTrips ?? [];
  if (trips.length === 0) return null;

  return (
    <Card>
      <SectionLabel emoji="🚌" label="Field Trips" color="#1D9E75" bg="#E1F5EE" />

      {trips.map((t, i) => (
        <div
          key={i}
          style={{
            padding: "10px 14px",
            borderBottom: "0.5px solid var(--color-border-tertiary, #f1f5f9)",
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 8,
              background: "#E1F5EE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            🚌
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary, #6b7280)", marginTop: 1 }}>
              {fmtDate(t.date)}
              {t.destination ? ` · ${t.destination}` : ""}
            </div>
            {t.note && (
              <div style={{ fontSize: 12, color: "var(--color-text-secondary, #6b7280)", marginTop: 2, fontStyle: "italic" }}>
                {t.note}
              </div>
            )}
          </div>
        </div>
      ))}
    </Card>
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
