"use client";

import type { Child } from "@/types";
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

function mergeChildren(localChildren: Child[], mockChildren: Child[]): Child[] {
  const map = new Map<string, Child>();

  mockChildren.forEach((child) => map.set(child.id, child));
  localChildren.forEach((child) => map.set(child.id, child));

  return Array.from(map.values());
}

export function getAllChildren(): Child[] {
  if (typeof window === "undefined") return mockAppData.children as Child[];

  const localChildren = readJson<Child[]>(CHILDREN_STORAGE_KEY) ?? [];
  return mergeChildren(localChildren, mockAppData.children as Child[]);
}

export function getChildById(childId: string): Child | null {
  if (typeof window === "undefined") {
    return (mockAppData.children as Child[]).find((c) => c.id === childId) ?? null;
  }

  const single = readJson<Child>(`child-${childId}`);
  if (single) return single;

  const found = getAllChildren().find((c) => c.id === childId) ?? null;

  if (found) {
    localStorage.setItem(`child-${childId}`, JSON.stringify(found));
  }

  return found;
}

export function saveChild(childId: string, child: Child): void {
  if (typeof window === "undefined") return;

  const updatedChild: Child = {
    ...child,
    id: childId,
    updatedAt: new Date().toISOString(),
  };

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

export function importChildrenJson(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Browser only"));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));

        if (!Array.isArray(data)) {
          throw new Error("Invalid backup file");
        }

        localStorage.setItem(CHILDREN_STORAGE_KEY, JSON.stringify(data));

        data.forEach((child: Child) => {
          if (child?.id) {
            localStorage.setItem(`child-${child.id}`, JSON.stringify(child));
          }
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

  const safeName = child.basicInfo?.name || "child";

  a.href = url;
  a.download = `anya-child-${safeName}-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

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

  const safeName = child.basicInfo?.name || "child";

  a.href = url;
  a.download = `anya-child-${safeName}-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  a.click();
  URL.revokeObjectURL(url);
}

