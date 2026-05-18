// ============================================================
// ENUMS
// ============================================================

export type SchoolLevel = "university" | "secondary" | "primary" | "kindergarten";
export type Term = "1" | "2" | "3" | "summer" | "special";
export type AwardLevel = "school" | "district" | "provincial" | "national" | "international";
export type GradeType = "midterm" | "final";
export type CalendarEventSource = "school" | "activity" | "goal" | "other";
export type LifeStatus = "alive" | "passed";

// ============================================================
// MULTI-LANGUAGE NAME
// ============================================================

export interface LocalizedName {
  value: string;
  language: string;
}

export interface MultiLanguageNames {
  th?: { firstName?: string; lastName?: string; fullName?: string };
  en?: { firstName?: string; lastName?: string; fullName?: string };
  zh?: { fullName?: string };
}

// ============================================================
// HEALTH
// ============================================================

export interface GrowthRecord {
  date: string;
  weight: number;
  height: number;
}

export interface HealthMeasurements {
  weight?: number;
  height?: number;
  shoulder?: number;
  upperArm?: number;
  arm?: number;
  chest?: number;
  waistHip?: number;
  leg?: number;
  thighCircumference?: number;
  shoeSize?: number;
}

export interface Health {
  congenitalDisease?: string[];
  bodyMarks?: string[];
  growthTrack?: GrowthRecord[];
  measurements?: HealthMeasurements;
}

// ============================================================
// SCHOOL
// ============================================================

export interface SubjectScore {
  subject: string;
  score: number;
  maxScore: number;
  grade?: string;
}

export interface TermGrade {
  term: Term;
  type: GradeType;
  gpa?: number;
  subjectScores?: SubjectScore[];
}

export interface ClassPosition {
  rank: number;
  term: Term;
  academicYear: string;
  outOf?: number;
}

export interface SchoolPosition {
  title: string;
  startDate: string;
  endDate?: string;
}

export interface SchoolRecord {
  id: string;
  showPresentYearFirst?: boolean;
  schoolLevel: SchoolLevel;
  schoolName: string;
  studentId?: string;
  academicYear: string;
  room?: string;
  number?: number;
  term: Term;
  startDate?: string;
  endDate?: string;

  normalSchoolTime?: { startTime: string; endTime: string };
  activitySchoolTime?: { startTime: string; endTime: string };

  classPosition?: ClassPosition[];     // ✅ เพิ่ม
  schoolPosition?: SchoolPosition[];   // ✅ เพิ่ม

  grades?: TermGrade[];
}

// ============================================================
// ACTIVITY (OLD)
// ============================================================

export interface Activity {
  id: string;
  activityName: string;
  date: string;
}

// ============================================================
// AWARD (OLD)
// ============================================================

export interface Award {
  id: string;
  awardName: string;
  category?: string;
  date: string;
  organization?: string;
  level?: AwardLevel;
  note?: string;
}

// ============================================================
// CALENDAR
// ============================================================

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  source: CalendarEventSource;
}

// ============================================================
// BASIC INFO
// ============================================================

export interface BasicInfo {
  names?: MultiLanguageNames;

  name: string;
  lastname: string;
  middleName?: string;
  saintName?: string;
  otherName?: string;
  nickname?: string;

  dateOfBirth: string;
  placeOfBirth?: string;

  motherName?: string;
  fatherName?: string;

  paternalGrandfather?: FamilyMember;
  paternalGrandmother?: FamilyMember;
  maternalGrandfather?: FamilyMember;
  maternalGrandmother?: FamilyMember;

  parent?: string;
  brother?: string[];
  sister?: string[];
}

// ============================================================
// NEW STRUCTURE
// ============================================================

export interface School {
  schoolName?: string;
  studentId?: string;
  year?: string;
}

export interface Activities {
  items?: string[];
}

export interface Awards {
  items?: string[];
}

export interface Attachment {
  id: string;
  section: "health" | "school" | "activities" | "awards";
  name: string;
  type: string;
  dataUrl: string;
  createdAt: string;
}

// ============================================================
// CHILD (FINAL)
// ============================================================

export interface Child {
  id: string;
  basicInfo: BasicInfo;

  createdAt: string;
  updatedAt: string;

  // ✅ ของเดิม
  health?: Health;
  schoolRecords?: SchoolRecord[];
  activities?: Activity[];
  awards?: Award[];

  // ✅ ของใหม่
  school?: School;
  activitiesNew?: Activities;
  awardsNew?: Awards;
  attachments?: Attachment[];

  calendarEvents?: CalendarEvent[];
}

// ============================================================
// APP ROOT
// ============================================================

export interface AppData {
  children: Child[];
  version: string;
}

// ============================================================
// HELPERS
// ============================================================

export const CHILD_COLORS = [
  { bg: "#EEEDFE", text: "#7F77DD" },
  { bg: "#FBEAF0", text: "#D4537E" },
  { bg: "#E1F5EE", text: "#1D9E75" },
];

export function getChildColor(index: number) {
  return CHILD_COLORS[index % CHILD_COLORS.length];
}

export function getInitials(name: string, lastname?: string): string {
  return ((name?.[0] ?? "") + (lastname?.[0] ?? "")).toUpperCase();
}

export function calcAge(dob: string): number | null {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}
