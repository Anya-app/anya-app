"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Child, Locale } from "@/types";
import { mockAppData } from "@/lib/data";

const STORAGE_KEY = "anya-app-children-v1";

export const messages = {
  en: {
    appName: "KidPath",
    tagline: "Your children's journey, all in one place",
    nav: { dashboard: "Dashboard", children: "Children" },
    dashboard: {
      title: "Dashboard",
      todayAt: "Today at a glance",
      school: "School",
      activities: "Activities",
      exams: "Exams today",
      goalAvg: "Goal avg.",
      timeline: "Today's timeline",
      schoolToday: "School today",
      activitiesToday: "Activities today",
      examsReminders: "Exams & reminders",
      goals: "Goal progress",
      quickActions: "Quick actions",
      noSchool: "No school today",
      noActivities: "No activities today",
      noExams: "No exams or reminders",
    },
    children: {
      title: "Children",
      addChild: "Add Child",
      noChildren: "No children yet",
      noChildrenSub: "Tap + to add your first child",
      age: "yrs",
    },
    child: {
      basicInfo: "Basic Info",
      health: "Health",
      school: "School",
      activities: "Activities",
      awards: "Awards",
      age: "years old",
    },
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      back: "Back",
      switchLang: "ภาษาไทย",
      loading: "Loading…",
      noData: "No data yet",
    },
  },
  th: {
    appName: "KidPath",
    tagline: "บันทึกการเดินทางของลูก ครบในที่เดียว",
    nav: { dashboard: "หน้าแรก", children: "เด็กๆ" },
    dashboard: {
      title: "แดชบอร์ด",
      todayAt: "วันนี้ในมุมมองรวม",
      school: "โรงเรียน",
      activities: "กิจกรรม",
      exams: "สอบวันนี้",
      goalAvg: "เฉลี่ยเป้าหมาย",
      timeline: "ไทม์ไลน์วันนี้",
      schoolToday: "โรงเรียนวันนี้",
      activitiesToday: "กิจกรรมวันนี้",
      examsReminders: "การสอบและการแจ้งเตือน",
      goals: "ความคืบหน้าเป้าหมาย",
      quickActions: "ดำเนินการด่วน",
      noSchool: "ไม่มีข้อมูลโรงเรียนวันนี้",
      noActivities: "ไม่มีกิจกรรมวันนี้",
      noExams: "ไม่มีการสอบหรือการแจ้งเตือน",
    },
    children: {
      title: "เด็กๆ",
      addChild: "เพิ่มเด็ก",
      noChildren: "ยังไม่มีเด็ก",
      noChildrenSub: "กด + เพื่อเพิ่มเด็กคนแรก",
      age: "ปี",
    },
    child: {
      basicInfo: "ข้อมูลพื้นฐาน",
      health: "สุขภาพ",
      school: "โรงเรียน",
      activities: "กิจกรรม",
      awards: "รางวัล",
      age: "ปี",
    },
    common: {
      save: "บันทึก",
      cancel: "ยกเลิก",
      delete: "ลบ",
      edit: "แก้ไข",
      add: "เพิ่ม",
      back: "กลับ",
      switchLang: "English",
      loading: "กำลังโหลด…",
      noData: "ยังไม่มีข้อมูล",
    },
  },
} as const;

export type Messages = (typeof messages)[Locale];

interface AppContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Messages;

  children: Child[];
  setChildren: React.Dispatch<React.SetStateAction<Child[]>>;

  selectedChildId: string | null;
  setSelectedChildId: (id: string | null) => void;
  getChildById: (id: string) => Child | undefined;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({
  children: reactChildren,
  defaultLocale = "th",
}: {
  children: ReactNode;
  defaultLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const [appChildren, setChildren] = useState<Child[]>(() => {
    if (typeof window === "undefined") return mockAppData.children;

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return mockAppData.children;
      return JSON.parse(saved) as Child[];
    } catch {
      return mockAppData.children;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appChildren));
    } catch {
      // ignore localStorage error
    }
  }, [appChildren]);

  const getChildById = (id: string) => appChildren.find((c) => c.id === id);

  const t = useMemo(() => messages[locale], [locale]);

  const value: AppContextValue = {
    locale,
    setLocale,
    t,
    children: appChildren,
    setChildren,
    selectedChildId,
    setSelectedChildId,
    getChildById,
  };

  return <AppContext.Provider value={value}>{reactChildren}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
