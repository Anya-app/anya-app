"use client";

import * as XLSX from "xlsx";
import type {
  Activity,
  ActivityGoal,
  ActivityGoalStatus,
  Award,
  AwardLevel,
  BasicInfo,
  Child,
  FamilyMember,
  LifeStatus,
  SchoolLevel,
  SchoolRecord,
  SubActivity,
  SubActivityStatus,
  Term,
} from "@/types";
import { mockAppData } from "@/lib/data";

export const CHILDREN_STORAGE_KEY = "anya_children";

type ExcelRow = Record<string, unknown>;

type FamilyKey =
  | "father"
  | "mother"
  | "paternalGrandfather"
  | "paternalGrandmother"
  | "maternalGrandfather"
  | "maternalGrandmother";

const FAMILY_ROWS: Array<{ key: FamilyKey; label: string }> = [
  { key: "father", label: "Father / บิดา" },
  { key: "mother", label: "Mother / มารดา" },
  { key: "paternalGrandfather", label: "Paternal Grandfather / ปู่" },
  { key: "paternalGrandmother", label: "Paternal Grandmother / ย่า" },
  { key: "maternalGrandfather", label: "Maternal Grandfather / ตา" },
  { key: "maternalGrandmother", label: "Maternal Grandmother / ยาย" },
];

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

function makeId(prefix = "id"): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function text(value: unknown): string {
  return value === undefined || value === null ? "" : String(value).trim();
}

function optionalText(value: unknown): string | undefined {
  const valueText = text(value);
  return valueText || undefined;
}

function toNumber(value: unknown): number | undefined {
  const valueText = text(value);
  if (!valueText) return undefined;

  const parsed = Number(valueText);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function emptyNames() {
  return {
    th: { fullName: "" },
    en: { fullName: "" },
  };
}

function familyThai(member?: FamilyMember): string {
  return (
    member?.names?.th?.fullName ??
    member?.altNames?.find((name) =>
      name.language.toLowerCase().includes("thai")
    )?.value ??
    ""
  );
}

function familyEnglish(member?: FamilyMember): string {
  return member?.names?.en?.fullName ?? member?.name ?? "";
}

function normalizeFamilyMember(
  member?: FamilyMember | string,
  legacyName = ""
): FamilyMember {
  if (typeof member === "string") {
    return {
      name: member,
      names: { ...emptyNames(), en: { fullName: member } },
      altNames: [],
    };
  }

  const name = member?.name ?? legacyName;

  return {
    ...member,
    name,
    names: member?.names ?? {
      ...emptyNames(),
      en: { fullName: name },
    },
    altNames: member?.altNames ?? [],
  };
}

function normalizeBasicInfo(info: BasicInfo): BasicInfo {
  const father = normalizeFamilyMember(info.father, info.fatherName ?? "");
  const mother = normalizeFamilyMember(info.mother, info.motherName ?? "");

  return {
    ...info,
    names: info.names ?? {
      th: {
        firstName: info.name ?? "",
        lastName: info.lastname ?? "",
        fullName: `${info.name ?? ""} ${info.lastname ?? ""}`.trim(),
      },
      en: { fullName: "" },
    },
    fatherName: info.fatherName ?? father.name ?? "",
    motherName: info.motherName ?? mother.name ?? "",
    father,
    mother,
    paternalGrandfather: normalizeFamilyMember(
      info.paternalGrandfather,
      info.grandfather ?? ""
    ),
    paternalGrandmother: normalizeFamilyMember(
      info.paternalGrandmother,
      info.grandmother ?? ""
    ),
    maternalGrandfather: normalizeFamilyMember(info.maternalGrandfather),
    maternalGrandmother: normalizeFamilyMember(info.maternalGrandmother),
    brother: info.brother ?? [],
    sister: info.sister ?? [],
  };
}

function schoolRecordTime(record: SchoolRecord): number {
  const date = record.startDate || record.endDate;
  if (date) {
    const value = Date.parse(date);
    if (!Number.isNaN(value)) return value;
  }

  const year = Number(record.academicYear);
  return Number.isFinite(year) ? year : 0;
}

export function sortSchoolRecordsNewestFirst(
  records: SchoolRecord[] = []
): SchoolRecord[] {
  return [...records].sort((a, b) => schoolRecordTime(b) - schoolRecordTime(a));
}

function subActivityTime(item: SubActivity): number {
  const value = Date.parse(item.date || item.endDate || "");
  return Number.isNaN(value) ? 0 : value;
}

function normalizeActivityGoal(goal: ActivityGoal): ActivityGoal {
  return {
    ...goal,
    subActivities: [...(goal.subActivities ?? [])].sort(
      (a, b) => subActivityTime(b) - subActivityTime(a)
    ),
  };
}

export function sortActivityGoalsNewestFirst(
  goals: ActivityGoal[] = []
): ActivityGoal[] {
  return [...goals]
    .map(normalizeActivityGoal)
    .sort((a, b) => {
      const aTime = Date.parse(a.targetDate || a.updatedAt || a.createdAt || "");
      const bTime = Date.parse(b.targetDate || b.updatedAt || b.createdAt || "");
      return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
    });
}

export function normalizeChild(child: Child): Child {
  return {
    ...child,
    basicInfo: normalizeBasicInfo(child.basicInfo),
    health: {
      congenitalDisease: child.health?.congenitalDisease ?? [],
      bodyMarks: child.health?.bodyMarks ?? [],
      growthTrack: child.health?.growthTrack ?? [],
      measurements: child.health?.measurements ?? {},
    },
    schoolRecords: sortSchoolRecordsNewestFirst(child.schoolRecords ?? []),
    activities: [...(child.activities ?? [])].sort(
      (a, b) => Date.parse(b.date || "") - Date.parse(a.date || "")
    ),
    activityGoals: sortActivityGoalsNewestFirst(child.activityGoals ?? []),
    awards: child.awards ?? [],
    calendarEvents: child.calendarEvents ?? [],
    attachments: child.attachments ?? [],
  };
}

function mergeChildren(localChildren: Child[], mockChildren: Child[]): Child[] {
  const map = new Map<string, Child>();

  mockChildren.forEach((child) => map.set(child.id, normalizeChild(child)));
  localChildren.forEach((child) => map.set(child.id, normalizeChild(child)));

  return Array.from(map.values());
}

export function getAllChildren(): Child[] {
  const mockChildren = (mockAppData.children as Child[]).map(normalizeChild);

  if (typeof window === "undefined") return mockChildren;

  const localChildren = readJson<Child[]>(CHILDREN_STORAGE_KEY) ?? [];
  const merged = mergeChildren(localChildren, mockChildren);

  localStorage.setItem(CHILDREN_STORAGE_KEY, JSON.stringify(merged));
  merged.forEach((child) => {
    localStorage.setItem(`child-${child.id}`, JSON.stringify(child));
  });

  return merged;
}

export function getChildById(childId: string): Child | null {
  if (typeof window === "undefined") {
    const found = (mockAppData.children as Child[]).find((child) => child.id === childId);
    return found ? normalizeChild(found) : null;
  }

  const single = readJson<Child>(`child-${childId}`);
  if (single) {
    const normalized = normalizeChild(single);
    localStorage.setItem(`child-${childId}`, JSON.stringify(normalized));
    return normalized;
  }

  const found = getAllChildren().find((child) => child.id === childId) ?? null;
  if (found) localStorage.setItem(`child-${childId}`, JSON.stringify(found));
  return found;
}

export function saveChild(childId: string, child: Child): void {
  if (typeof window === "undefined") return;

  const updatedChild = normalizeChild({
    ...child,
    id: childId,
    updatedAt: new Date().toISOString(),
  });

  localStorage.setItem(`child-${childId}`, JSON.stringify(updatedChild));

  const all = getAllChildren();
  const updatedAll = all.some((item) => item.id === childId)
    ? all.map((item) => (item.id === childId ? updatedChild : item))
    : [updatedChild, ...all];

  localStorage.setItem(CHILDREN_STORAGE_KEY, JSON.stringify(updatedAll));
}

export function deleteChild(childId: string): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(`child-${childId}`);

  const localChildren = readJson<Child[]>(CHILDREN_STORAGE_KEY) ?? [];
  const updatedAll = localChildren.filter((child) => child.id !== childId);
  localStorage.setItem(CHILDREN_STORAGE_KEY, JSON.stringify(updatedAll));
}

/* =========================
   JSON Backup / Restore
========================= */
export function exportChildrenJson(): void {
  if (typeof window === "undefined") return;

  const children = getAllChildren();
  const blob = new Blob([JSON.stringify(children, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `anya-children-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSingleChildJson(childId: string): void {
  if (typeof window === "undefined") return;

  const child = getChildById(childId);

  if (!child) {
    alert("Child not found");
    return;
  }

  const blob = new Blob([JSON.stringify(child, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const safeName = (child.basicInfo?.name || "child").replace(
    /[^\w\u0E00-\u0E7F-]+/g,
    "-"
  );

  a.href = url;
  a.download = `anya-child-${safeName}-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importChildrenJson(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Browser only"));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const rawData: unknown = JSON.parse(String(reader.result));
        const imported = Array.isArray(rawData) ? rawData : [rawData];

        if (!imported.every((item) => item && typeof item === "object" && "id" in item)) {
          throw new Error("Invalid backup file");
        }

        const normalizedImported = (imported as Child[]).map(normalizeChild);
        const currentChildren = getAllChildren();
        const merged = mergeChildren(normalizedImported, currentChildren);

        localStorage.setItem(CHILDREN_STORAGE_KEY, JSON.stringify(merged));
        merged.forEach((child) => {
          localStorage.setItem(`child-${child.id}`, JSON.stringify(child));
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/* =========================
   Editable Excel Export
========================= */
function addSheet(
  workbook: XLSX.WorkBook,
  name: string,
  rows: Array<Record<string, string | number>>
): void {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, name);
}

export function exportChildrenExcel(): void {
  if (typeof window === "undefined") return;

  const children = getAllChildren().map(normalizeChild);
  const workbook = XLSX.utils.book_new();

  addSheet(workbook, "README", [
    {
      Instruction:
        "Edit cell values only. Do not delete or change ID columns: Child ID, Record ID, Activity ID, Goal ID, Sub Activity ID, Award ID.",
    },
    {
      Instruction:
        "To remove a history/activity/goal/award record, clear all editable fields in that row but keep the Child ID.",
    },
    {
      Instruction:
        "Attachments and uploaded files are preserved in JSON backup and are not edited in Excel.",
    },
  ]);

  addSheet(
    workbook,
    "Children",
    children.map((child) => ({
      "Child ID": child.id,
      "First Name": child.basicInfo.name ?? "",
      "Last Name": child.basicInfo.lastname ?? "",
      Nickname: child.basicInfo.nickname ?? "",
      "Date of Birth": child.basicInfo.dateOfBirth ?? "",
      Gender: child.basicInfo.gender ?? "",
      "Place of Birth": child.basicInfo.placeOfBirth ?? "",
      "Middle Name": child.basicInfo.middleName ?? "",
      "Saint Name": child.basicInfo.saintName ?? "",
      "Other Name": child.basicInfo.otherName ?? "",
    }))
  );

  addSheet(
    workbook,
    "Family",
    children.flatMap((child) =>
      FAMILY_ROWS.map(({ key, label }) => {
        const member = child.basicInfo[key];
        return {
          "Child ID": child.id,
          Relationship: key,
          Label: label,
          "Thai Name": familyThai(member),
          "English Name": familyEnglish(member),
          Status: member?.status ?? "",
        };
      })
    )
  );

  addSheet(
    workbook,
    "Education History",
    children.flatMap((child) => {
      const records = child.schoolRecords ?? [];
      const exportRows = records.length > 0 ? records : [null];

      return exportRows.map((record) => ({
        "Child ID": child.id,
        "Record ID": record?.id ?? "",
        "School Name": record?.schoolName ?? "",
        "School Level": record?.schoolLevel ?? "",
        "Student ID": record?.studentId ?? "",
        "Academic Year": record?.academicYear ?? "",
        Term: record?.term ?? "",
        Room: record?.room ?? "",
        Number: record?.number ?? "",
        "Start Date": record?.startDate ?? "",
        "End Date": record?.endDate ?? "",
        Note: record?.yearlyNote ?? "",
      }));
    })
  );

  addSheet(
    workbook,
    "Activities",
    children.flatMap((child) => {
      const records = child.activities ?? [];
      const exportRows = records.length > 0 ? records : [null];

      return exportRows.map((activity) => ({
        "Child ID": child.id,
        "Activity ID": activity?.id ?? "",
        "Activity Name": activity?.activityName ?? "",
        Category: activity?.category ?? "",
        Date: activity?.date ?? "",
        "End Date": activity?.endDate ?? "",
        Role: activity?.role ?? "",
        Note: activity?.note ?? "",
      }));
    })
  );

  addSheet(
    workbook,
    "Activity Goals",
    children.flatMap((child) => {
      const records = child.activityGoals ?? [];
      const exportRows = records.length > 0 ? records : [null];

      return exportRows.map((goal) => ({
        "Child ID": child.id,
        "Goal ID": goal?.id ?? "",
        "Goal Name": goal?.goalName ?? "",
        Category: goal?.category ?? "",
        "Target Date": goal?.targetDate ?? "",
        Status: goal?.status ?? "",
        Note: goal?.note ?? "",
      }));
    })
  );

  addSheet(
    workbook,
    "Sub Activities",
    children.flatMap((child) => {
      const rows = (child.activityGoals ?? []).flatMap((goal) =>
        (goal.subActivities ?? []).map((sub) => ({
          "Child ID": child.id,
          "Goal ID": goal.id,
          "Sub Activity ID": sub.id,
          "Sub Activity": sub.title ?? "",
          Date: sub.date ?? "",
          "End Date": sub.endDate ?? "",
          Status: sub.status ?? "",
          Target: sub.target ?? "",
          Result: sub.result ?? "",
          Note: sub.note ?? "",
        }))
      );

      return rows.length > 0
        ? rows
        : [
            {
              "Child ID": child.id,
              "Goal ID": "",
              "Sub Activity ID": "",
              "Sub Activity": "",
              Date: "",
              "End Date": "",
              Status: "",
              Target: "",
              Result: "",
              Note: "",
            },
          ];
    })
  );

  addSheet(
    workbook,
    "Awards",
    children.flatMap((child) => {
      const records = child.awards ?? [];
      const exportRows = records.length > 0 ? records : [null];

      return exportRows.map((award) => ({
        "Child ID": child.id,
        "Award ID": award?.id ?? "",
        "Award Name": award?.awardName ?? "",
        Category: award?.category ?? "",
        Date: award?.date ?? "",
        Organization: award?.organization ?? "",
        Level: award?.level ?? "",
        Note: award?.note ?? "",
      }));
    })
  );

  XLSX.writeFile(
    workbook,
    `anya-editable-data-${new Date().toISOString().slice(0, 10)}.xlsx`
  );
}

/* =========================
   Edited Excel Import
========================= */
function rowsFromSheet(workbook: XLSX.WorkBook, sheetName: string): ExcelRow[] | null {
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) return null;

  return XLSX.utils.sheet_to_json<ExcelRow>(worksheet, {
    defval: "",
    raw: false,
  });
}

function validFamilyKey(value: string): value is FamilyKey {
  return FAMILY_ROWS.some((item) => item.key === value);
}

function isSchoolLevel(value: string): value is SchoolLevel {
  return ["university", "secondary", "primary", "kindergarten"].includes(value);
}

function isTerm(value: string): value is Term {
  return ["1", "2", "3", "summer", "special"].includes(value);
}

function isGoalStatus(value: string): value is ActivityGoalStatus {
  return ["planned", "in_progress", "completed", "cancelled"].includes(value);
}

function isSubStatus(value: string): value is SubActivityStatus {
  return ["planned", "in_progress", "completed", "passed", "not_passed"].includes(
    value
  );
}

function isAwardLevel(value: string): value is AwardLevel {
  return ["school", "district", "provincial", "national", "international"].includes(
    value
  );
}

function isLifeStatus(value: string): value is LifeStatus {
  return ["alive", "passed"].includes(value);
}

export async function importChildrenExcel(file: File): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("Browser only");
  }

  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const childrenRows = rowsFromSheet(workbook, "Children");

  if (!childrenRows) {
    throw new Error("Invalid Excel file: Children sheet not found");
  }

  const childrenMap = new Map<string, Child>(
    getAllChildren().map((child) => [child.id, normalizeChild(child)])
  );

  childrenRows.forEach((row) => {
    const childId = text(row["Child ID"]);
    const existing = childrenMap.get(childId);
    if (!existing) return;

    const basicInfo: BasicInfo = {
      ...existing.basicInfo,
      name: text(row["First Name"]) || existing.basicInfo.name,
      lastname: text(row["Last Name"]),
      nickname: optionalText(row.Nickname),
      dateOfBirth: text(row["Date of Birth"]),
      gender:
        text(row.Gender) === "male" ||
        text(row.Gender) === "female" ||
        text(row.Gender) === "other"
          ? (text(row.Gender) as "male" | "female" | "other")
          : undefined,
      placeOfBirth: optionalText(row["Place of Birth"]),
      middleName: optionalText(row["Middle Name"]),
      saintName: optionalText(row["Saint Name"]),
      otherName: optionalText(row["Other Name"]),
    };

    childrenMap.set(childId, {
      ...existing,
      basicInfo,
      updatedAt: new Date().toISOString(),
    });
  });

  const familyRows = rowsFromSheet(workbook, "Family");
  if (familyRows) {
    familyRows.forEach((row) => {
      const childId = text(row["Child ID"]);
      const relationship = text(row.Relationship);
      const existing = childrenMap.get(childId);

      if (!existing || !validFamilyKey(relationship)) return;

      const englishName = text(row["English Name"]);
      const thaiName = text(row["Thai Name"]);
      const statusText = text(row.Status);

      const member: FamilyMember = {
        ...(existing.basicInfo[relationship] ?? {}),
        name: englishName,
        names: {
          ...(existing.basicInfo[relationship]?.names ?? {}),
          th: { fullName: thaiName },
          en: { fullName: englishName },
        },
        status: isLifeStatus(statusText) ? statusText : undefined,
      };

      const basicInfo: BasicInfo = {
        ...existing.basicInfo,
        [relationship]: member,
      };

      if (relationship === "father") basicInfo.fatherName = englishName;
      if (relationship === "mother") basicInfo.motherName = englishName;
      if (relationship === "paternalGrandfather") basicInfo.grandfather = englishName;
      if (relationship === "paternalGrandmother") basicInfo.grandmother = englishName;

      childrenMap.set(childId, {
        ...existing,
        basicInfo,
        updatedAt: new Date().toISOString(),
      });
    });
  }

  const educationRows = rowsFromSheet(workbook, "Education History");
  if (educationRows) {
    childrenMap.forEach((child, childId) => {
      const records: SchoolRecord[] = educationRows
        .filter((row) => text(row["Child ID"]) === childId)
        .filter(
          (row) =>
            text(row["School Name"]) ||
            text(row["Academic Year"]) ||
            text(row["Student ID"])
        )
        .map((row) => {
          const level = text(row["School Level"]);
          const term = text(row.Term);

          return {
            id: text(row["Record ID"]) || makeId("school"),
            schoolName: text(row["School Name"]),
            schoolLevel: isSchoolLevel(level) ? level : "kindergarten",
            studentId: optionalText(row["Student ID"]),
            academicYear: text(row["Academic Year"]),
            term: isTerm(term) ? term : "1",
            room: optionalText(row.Room),
            number: toNumber(row.Number),
            startDate: optionalText(row["Start Date"]),
            endDate: optionalText(row["End Date"]),
            yearlyNote: optionalText(row.Note),
          };
        });

      childrenMap.set(childId, {
        ...child,
        schoolRecords: sortSchoolRecordsNewestFirst(records),
      });
    });
  }

  const activityRows = rowsFromSheet(workbook, "Activities");
  if (activityRows) {
    childrenMap.forEach((child, childId) => {
      const records: Activity[] = activityRows
        .filter((row) => text(row["Child ID"]) === childId)
        .filter((row) => text(row["Activity Name"]) || text(row.Date))
        .map((row) => ({
          id: text(row["Activity ID"]) || makeId("activity"),
          activityName: text(row["Activity Name"]),
          category: optionalText(row.Category),
          date: text(row.Date),
          endDate: optionalText(row["End Date"]),
          role: optionalText(row.Role),
          note: optionalText(row.Note),
        }));

      childrenMap.set(childId, {
        ...child,
        activities: records,
      });
    });
  }

  const goalRows = rowsFromSheet(workbook, "Activity Goals");
  const subActivityRows = rowsFromSheet(workbook, "Sub Activities");

  if (goalRows) {
    childrenMap.forEach((child, childId) => {
      const records: ActivityGoal[] = goalRows
        .filter((row) => text(row["Child ID"]) === childId)
        .filter((row) => text(row["Goal Name"]) || text(row["Target Date"]))
        .map((row) => {
          const goalId = text(row["Goal ID"]) || makeId("goal");
          const status = text(row.Status);

          const subActivities: SubActivity[] = (subActivityRows ?? [])
            .filter(
              (subRow) =>
                text(subRow["Child ID"]) === childId &&
                text(subRow["Goal ID"]) === goalId
            )
            .filter(
              (subRow) =>
                text(subRow["Sub Activity"]) ||
                text(subRow.Date) ||
                text(subRow.Target) ||
                text(subRow.Result)
            )
            .map((subRow) => {
              const subStatus = text(subRow.Status);

              return {
                id: text(subRow["Sub Activity ID"]) || makeId("sub"),
                title: text(subRow["Sub Activity"]),
                date: optionalText(subRow.Date),
                endDate: optionalText(subRow["End Date"]),
                status: isSubStatus(subStatus) ? subStatus : "planned",
                target: optionalText(subRow.Target),
                result: optionalText(subRow.Result),
                note: optionalText(subRow.Note),
              };
            });

          return {
            id: goalId,
            goalName: text(row["Goal Name"]),
            category: optionalText(row.Category),
            targetDate: optionalText(row["Target Date"]),
            status: isGoalStatus(status) ? status : "planned",
            note: optionalText(row.Note),
            subActivities,
            updatedAt: new Date().toISOString(),
          };
        });

      childrenMap.set(childId, {
        ...child,
        activityGoals: sortActivityGoalsNewestFirst(records),
      });
    });
  }

  const awardRows = rowsFromSheet(workbook, "Awards");
  if (awardRows) {
    childrenMap.forEach((child, childId) => {
      const records: Award[] = awardRows
        .filter((row) => text(row["Child ID"]) === childId)
        .filter((row) => text(row["Award Name"]) || text(row.Date))
        .map((row) => {
          const level = text(row.Level);

          return {
            id: text(row["Award ID"]) || makeId("award"),
            awardName: text(row["Award Name"]),
            category: optionalText(row.Category),
            date: text(row.Date),
            organization: optionalText(row.Organization),
            level: isAwardLevel(level) ? level : undefined,
            note: optionalText(row.Note),
          };
        });

      childrenMap.set(childId, {
        ...child,
        awards: records,
      });
    });
  }

  const importedChildren = Array.from(childrenMap.values()).map(normalizeChild);
  localStorage.setItem(CHILDREN_STORAGE_KEY, JSON.stringify(importedChildren));
  importedChildren.forEach((child) => {
    localStorage.setItem(`child-${child.id}`, JSON.stringify(child));
  });
}
