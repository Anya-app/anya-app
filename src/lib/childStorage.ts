import type { Child } from "@/types";

export const CHILDREN_STORAGE_KEY = "anya_children";

export function getAllChildren(): Child[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(CHILDREN_STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as Child[];
  } catch {
    return [];
  }
}

export function getChildById(childId: string): Child | null {
  if (typeof window === "undefined") return null;

  const singleRaw = localStorage.getItem(`child-${childId}`);
  if (singleRaw) {
    try {
      return JSON.parse(singleRaw) as Child;
    } catch {
      localStorage.removeItem(`child-${childId}`);
    }
  }

  const all = getAllChildren();
  const found = all.find((c) => c.id === childId) ?? null;

  if (found) {
    localStorage.setItem(`child-${childId}`, JSON.stringify(found));
  }

  return found;
}

export function saveChild(childId: string, child: Child): void {
  if (typeof window === "undefined") return;

  const updatedChild: Child = {
    ...child,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(`child-${childId}`, JSON.stringify(updatedChild));

  const all = getAllChildren();
  const exists = all.some((c) => c.id === childId);

  const updatedAll = exists
    ? all.map((c) => (c.id === childId ? updatedChild : c))
    : [updatedChild, ...all];

  localStorage.setItem(CHILDREN_STORAGE_KEY, JSON.stringify(updatedAll));
}

export function deleteChild(childId: string): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(`child-${childId}`);

  const all = getAllChildren();
  const updatedAll = all.filter((c) => c.id !== childId);

  localStorage.setItem(CHILDREN_STORAGE_KEY, JSON.stringify(updatedAll));
}
