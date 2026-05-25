"use client";

import type {
  ActivityGoal,
  BasicInfo,
  Child,
  FamilyMember,
  SchoolRecord,
  SubActivity,
} from "@/types";
import { mockAppData } from "@/lib/data";

export const CHILDREN_STORAGE_KEY = "anya_children";

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

function emptyNames() {
  return {
    th: { fullName: "" },
    en: { fullName: "" },
  };
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

    // Legacy Grandfather / Grandmother are migrated into the paternal side.
    // Maternal side is created blank and can be filled in Basic Info later.
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
    const found = (mockAppData.children as Child[]).find((c) => c.id === childId);
    return found ? normalizeChild(found) : null;
  }

  const single = readJson<Child>(`child-${childId}`);
  if (single) {
    const normalized = normalizeChild(single);
    localStorage.setItem(`child-${childId}`, JSON.stringify(normalized));
    return normalized;
  }

  const found = getAllChildren().find((c) => c.id === childId) ?? null;
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
  const updatedAll = all.some((c) => c.id === childId)
    ? all.map((c) => (c.id === childId ? updatedChild : c))
    : [updatedChild, ...all];

  localStorage.setItem(CHILDREN_STORAGE_KEY, JSON.stringify(updatedAll));
}

export function deleteChild(childId: string): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(`child-${childId}`);

  const localChildren = readJson<Child[]>(CHILDREN_STORAGE_KEY) ?? [];
  const updatedAll = localChildren.filter((c) => c.id !== childId);
  localStorage.setItem(CHILDREN_STORAGE_KEY, JSON.stringify(updatedAll));
}

/* =========================
   Export ALL children
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

/* =========================
   Export SINGLE child
========================= */
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
  const safeName = (child.basicInfo?.name || "child").replace(/[^\w\u0E00-\u0E7F-]+/g, "-");

  a.href = url;
  a.download = `anya-child-${safeName}-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/* =========================
   Import children
========================= */
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

        // Accept both: backup of all children and a single-child exported file.
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
