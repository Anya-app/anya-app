"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import TopBar from "@/components/layout/TopBar";
import { getChildColor, getInitials, calcAge, type Child } from "@/types";

// ── Helpers ──────────────────────────────────────────────────

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = h % 12 || 12;
  return `${hh}:${m < 10 ? "0" + m : m} ${ampm}`;
}

type EventCat = "school" | "activity" | "exam" | "goal" | "family";

interface DayEvent {
  id: string;
  childId: string;
  childName: string;
  time: string;
  endTime?: string;
  title: string;
  cat: EventCat;
  desc?: string;
}

function buildTodayEvents(children: Child[]): DayEvent[] {
  const events: DayEvent[] = [];
  children.forEach((child) => {
    const name = child.basicInfo.nickname || child.basicInfo.name;

    // School blocks
    const record = child.schoolRecords?.[0];
    if (record?.normalSchoolTime) {
      events.push({
        id: `school-${child.id}`,
        childId: child.id,
        childName: name,
        time: record.normalSchoolTime.startTime,
        endTime: record.normalSchoolTime.endTime,
        title: record.schoolName,
        cat: "school",
        desc: `${record.room ?? ""} · ${record.schoolLevel}`,
      });
    }

    // Upcoming exams (next 7 days)
    const today = new Date();
    const in7 = new Date(today);
    in7.setDate(in7.getDate() + 7);
    record?.examDates?.forEach((ex) => {
      const d = new Date(ex.date);
      if (d >= today && d <= in7) {
        events.push({
          id: `exam-${child.id}-${ex.subject}`,
          childId: child.id,
          childName: name,
          time: ex.startTime ?? "09:00",
          endTime: ex.endTime,
          title: `${ex.subject} — exam`,
          cat: "exam",
          desc: ex.room,
        });
      }
    });

    // Activities
    child.activities?.forEach((act) => {
      events.push({
        id: act.id,
        childId: child.id,
        childName: name,
        time: "15:30",
        title: act.activityName,
        cat: "activity",
        desc: act.role,
      });
    });
  });

  return events.sort((a, b) => toMin(a.time) - toMin(b.time));
}

// ── Cat styling ──────────────────────────────────────────────

const CAT_PILL: Record<EventCat, { bg: string; color: string; label: string }> = {
  school:   { bg: "#EEEDFE", color: "#534AB7", label: "school" },
  activity: { bg: "#E1F5EE", color: "#0F6E56", label: "activity" },
  exam:     { bg: "#FAECE7", color: "#993C1D", label: "exam" },
  goal:     { bg: "#FBEAF0", color: "#993556", label: "goal" },
  family:   { bg: "#FAEEDA", color: "#854F0B", label: "family" },
};

const DOT_COLOR: Record<EventCat, string> = {
  school: "#7F77DD", activity: "#1D9E75", exam: "#D85A30", goal: "#D4537E", family: "#BA7517",
};

// ── Components ───────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{ background: "var(--color-background-secondary, #f8fafc)", borderRadius: 8, padding: "12px 14px" }}>
      <div style={{ fontSize: 12, color: "var(--color-text-secondary, #6b7280)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function ChildChip({
  child,
  index,
  locale,
  active,
  onClick,
}: {
  child: Child;
  index: number;
  locale: string;
  active: boolean;
  onClick: () => void;
}) {
  const color = getChildColor(index);
  const name = child.basicInfo.nickname || child.basicInfo.name;
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        flexShrink: 0,
        padding: "7px 14px",
        borderRadius: 20,
        border: `1px solid ${active ? "#7F77DD" : "var(--color-border-secondary, #e2e8f0)"}`,
        background: active ? "#7F77DD" : "var(--color-background-secondary, #f8fafc)",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        whiteSpace: "nowrap",
        color: active ? "#fff" : "var(--color-text-primary, #111827)",
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "all .15s",
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: color.bg,
          color: color.text,
          fontSize: 10,
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {getInitials(child.basicInfo.name)}
      </span>
      {name}
    </button>
  );
}

// ── Page ─────────────────────────────────────────────────────

export default function DashboardPage() {
  const { children, t, locale } = useApp();
  const [selectedId, setSelectedId] = useState<string | "all">("all");

  const filtered = selectedId === "all" ? children : children.filter((c) => c.id === selectedId);
  const events = buildTodayEvents(filtered);

  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dateLabel = `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  const schoolCount = events.filter((e) => e.cat === "school").length;
  const actCount = events.filter((e) => e.cat === "activity").length;
  const examCount = events.filter((e) => e.cat === "exam").length;

  const nowMin = now.getHours() * 60 + now.getMinutes();
  let nowInserted = false;

  return (
    <>
      <TopBar />

      {/* Header */}
      <div
        style={{
          background: "var(--color-background-primary, #fff)",
          borderBottom: "0.5px solid var(--color-border-tertiary, #e5e7eb)",
          padding: "12px 16px 10px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{t.dashboard.title}</h1>
        <p style={{ margin: "2px 0 12px", fontSize: 13, color: "var(--color-text-secondary, #6b7280)" }}>
          {dateLabel}
        </p>

        {/* Child selector chips */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
          {/* All chip */}
          <button
            onClick={() => setSelectedId("all")}
            aria-pressed={selectedId === "all"}
            style={{
              flexShrink: 0,
              padding: "7px 14px",
              borderRadius: 20,
              border: `1px solid ${selectedId === "all" ? "#7F77DD" : "var(--color-border-secondary, #e2e8f0)"}`,
              background: selectedId === "all" ? "#7F77DD" : "var(--color-background-secondary, #f8fafc)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              color: selectedId === "all" ? "#fff" : "var(--color-text-primary, #111827)",
              transition: "all .15s",
            }}
          >
            All
          </button>
          {children.map((child, i) => (
            <ChildChip
              key={child.id}
              child={child}
              index={i}
              locale={locale}
              active={selectedId === child.id}
              onClick={() => setSelectedId(child.id)}
            />
          ))}
        </div>
      </div>

      <div style={{ padding: "0 0 16px" }}>
        {/* Stats */}
        <section style={{ padding: "12px 16px 0" }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary, #6b7280)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {t.dashboard.todayAt}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            <StatCard label={`🏫 ${t.dashboard.school}`} value={schoolCount} color="#7F77DD" />
            <StatCard label={`⭐ ${t.dashboard.activities}`} value={actCount} color="#1D9E75" />
            <StatCard label={`📝 ${t.dashboard.exams}`} value={examCount} color="#D85A30" />
          </div>
        </section>

        {/* Timeline */}
        <section style={{ padding: "16px 16px 0" }}>
          <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary, #6b7280)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {t.dashboard.timeline}
          </p>
          <div
            style={{
              background: "var(--color-background-primary, #fff)",
              borderRadius: 12,
              border: "0.5px solid var(--color-border-tertiary, #e5e7eb)",
              padding: "16px 16px 10px 52px",
              position: "relative",
            }}
          >
            {/* Vertical line */}
            <div style={{ position: "absolute", left: 36, top: 0, bottom: 0, width: 1, background: "var(--color-border-tertiary, #e5e7eb)" }} />

            {events.length === 0 ? (
              <p style={{ color: "var(--color-text-secondary, #6b7280)", fontSize: 13, textAlign: "center", padding: "12px 0" }}>
                {t.dashboard.noSchool}
              </p>
            ) : (
              events.map((ev) => {
                const evMin = toMin(ev.time);
                let nowMark: React.ReactNode = null;
                if (!nowInserted && evMin > nowMin) {
                  nowInserted = true;
                  nowMark = (
                    <div key="now" style={{ position: "relative", marginBottom: 10 }}>
                      <div style={{ position: "absolute", left: -20, top: 8, width: 10, height: 10, borderRadius: "50%", background: "#D4537E", boxShadow: "0 0 0 3px rgba(212,83,126,.25)" }} />
                      <div style={{ position: "absolute", left: -21, top: 12, right: -12, height: 1, background: "rgba(212,83,126,.4)" }} />
                      <span style={{ position: "absolute", right: 0, top: 6, fontSize: 11, color: "#D4537E", fontWeight: 600 }}>Now</span>
                    </div>
                  );
                }

                const catStyle = CAT_PILL[ev.cat];
                const childIdx = filtered.findIndex((c) => c.id === ev.childId);
                const childColor = getChildColor(Math.max(childIdx, 0));

                return (
                  <div key={ev.id}>
                    {nowMark}
                    <div style={{ position: "relative", marginBottom: 10 }}>
                      {/* Time */}
                      <div style={{ position: "absolute", left: -52, top: 10, width: 30, textAlign: "right", fontSize: 11, color: "var(--color-text-secondary, #6b7280)", lineHeight: 1.2 }}>
                        {ev.time.split(":")[0]}
                        <br />
                        <span style={{ fontSize: 10 }}>{ev.time.split(":")[1]}</span>
                      </div>
                      {/* Dot */}
                      <div style={{ position: "absolute", left: -20, top: 12, width: 10, height: 10, borderRadius: "50%", background: DOT_COLOR[ev.cat], border: "2px solid var(--color-background-primary, #fff)" }} />
                      {/* Card */}
                      <div style={{ background: "var(--color-background-secondary, #f8fafc)", border: "0.5px solid var(--color-border-tertiary, #e5e7eb)", borderRadius: 8, padding: "8px 10px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 3, gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{ev.title}</span>
                          <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 10, background: catStyle.bg, color: catStyle.color, fontWeight: 600 }}>
                              {catStyle.label}
                            </span>
                            {selectedId === "all" && (
                              <span style={{ fontSize: 11, background: childColor.bg, color: childColor.text, borderRadius: 10, padding: "2px 6px", fontWeight: 600 }}>
                                {ev.childName}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--color-text-secondary, #6b7280)" }}>
                          {fmtTime(ev.time)}{ev.endTime ? ` – ${fmtTime(ev.endTime)}` : ""}
                          {ev.desc ? ` · ${ev.desc}` : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Children quick cards */}
        <section style={{ padding: "16px 16px 0" }}>
          <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary, #6b7280)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {t.nav.children}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {children.map((child, i) => {
              const color = getChildColor(i);
              const initials = getInitials(child.basicInfo.name, child.basicInfo.lastname);
              const age = calcAge(child.basicInfo.dateOfBirth);
              const school = child.schoolRecords?.[0];
              return (
                <Link
                  key={child.id}
                  href={`/${locale}/children/${child.id}/basic-info`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "var(--color-background-primary, #fff)",
                    border: "0.5px solid var(--color-border-tertiary, #e5e7eb)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: color.bg, color: color.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, flexShrink: 0 }}>
                    {initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{child.basicInfo.name} {child.basicInfo.lastname}</div>
                    <div style={{ fontSize: 12, color: "var(--color-text-secondary, #6b7280)", marginTop: 2 }}>
                      {age !== null && `${age} ${t.children.age}`}
                      {school && ` · ${school.schoolName}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {(child.awards?.length ?? 0) > 0 && (
                      <span style={{ fontSize: 12, background: "#FEF9C3", color: "#854D0E", borderRadius: 10, padding: "3px 8px", fontWeight: 700 }}>
                        🏆 {child.awards!.length}
                      </span>
                    )}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
