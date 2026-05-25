// ============================================================
// ENUMS
// ============================================================

export type Locale = "th" | "en";
export type SchoolLevel = "university" | "secondary" | "primary" | "kindergarten";
export type Term = "1" | "2" | "3" | "summer" | "special";
export type AwardLevel = "school" | "district" | "provincial" | "national" | "international";
export type GradeType = "midterm" | "final";
export type CalendarEventSource = "school" | "activity" | "goal" | "other";
export type LifeStatus = "alive" | "passed";
export type ActivityGoalStatus = "planned" | "in_progress" | "completed" | "cancelled";
export type SubActivityStatus = "planned" | "in_progress" | "completed" | "passed" | "not_passed";

// ============================================================
// NAME / FAMILY
// ============================================================

export interface LocalizedName {
  value: string;
  language: string;
}

export interface MultiLanguageNames {
  th?: { firstName?: string; lastName?: string; fullName?: string };
  en?: { firstName?: string; lastName?: string; fullName?: string };
  zh?: { fullName?: string };
  other?: Array<{ language: string; fullName: string }>;
}

export interface FamilyMember {
  // Legacy field: kept so old data and old UI do not break.
  name?: string;
  // New field: supports Thai / English / Chinese / other names.
  names?: MultiLanguageNames;
  altNames?: LocalizedName[];
  status?: LifeStatus;
}

// ============================================================
// HEALTH
// ============================================================

export interface GrowthRecord {
  id?: string;
  date: string;
  weight?: number;
  height?: number;
  clothingSize?: string;
  chest?: number;
  shoulder?: number;
  arm?: number;
  neck?: number;
  waist?: number;
  hip?: number;
  thigh?: number;
  legLength?: number;
  other?: string;
}

export interface HealthMeasurements {
  weight?: number;
  height?: number;
  clothingSize?: string;
  chest?: number;
  shoulder?: number;
  upperArm?: number;
  arm?: number;
  neck?: number;
  waist?: number;
  waistHip?: number;
  hip?: number;
  thigh?: number;
  thighCircumference?: number;
  leg?: number;
  legLength?: number;
  shoeSize?: number;
  other?: string;
}

export interface Health {
  congenitalDisease?: string[];
  bodyMarks?: string[];
  growthTrack?: GrowthRecord[];
  measurements?: HealthMeasurements;
}

// ============================================================
// SCHOOL / EDUCATION HISTORY
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

export interface ScheduleSlot {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  startTime: string;
  endTime: string;
  subject?: string;
  teacher?: string;
  room?: string;
}

export interface ExamDate {
  subject: string;
  date: string;
  startTime?: string;
  endTime?: string;
  room?: string;
}

export interface FieldTrip {
  name: string;
  date: string;
  destination?: string;
  note?: string;
}

export interface SchoolActivity {
  name: string;
  date: string;
  description?: string;
  role?: string;
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

  classPosition?: ClassPosition[];
  schoolPosition?: SchoolPosition[];
  classSchedule?: ScheduleSlot[];
  examDates?: ExamDate[];
  fieldTrips?: FieldTrip[];
  activities?: SchoolActivity[];
  grades?: TermGrade[];
  yearlyNote?: string;
}

// ============================================================
// ACTIVITY / GOAL / MILESTONE / AWARD
// ============================================================

// Existing activity timeline record: kept for old records and event-style activities.
export interface Activity {
  id: string;
  activityName: string;
  category?: string;
  date: string;
  endDate?: string;
  role?: string;
  note?: string;
}

export interface SubActivity {
  id: string;
  title: string;
  date?: string;
  endDate?: string;
  status?: SubActivityStatus;
  target?: string;
  result?: string;
  note?: string;
}

export interface ActivityGoal {
  id: string;
  goalName: string;
  category?: string;
  targetDate?: string;
  status?: ActivityGoalStatus;
  note?: string;
  subActivities: SubActivity[];
  createdAt?: string;
  updatedAt?: string;
}

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
// CALENDAR / DASHBOARD TIMELINE
// ============================================================

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  allDay?: boolean;
  startTime?: string;
  endTime?: string;
  source: CalendarEventSource;
  sourceId?: string;
  color?: string;
  note?: string;
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
  gender?: "male" | "female" | "other";

  // Legacy string fields: retained for current screens and old backups.
  motherName?: string;
  fatherName?: string;
  grandfather?: string;
  grandmother?: string;

  // New structured family members. Each member supports names in 2+ languages.
  father?: FamilyMember;
  mother?: FamilyMember;
  paternalGrandfather?: FamilyMember; // ปู่
  paternalGrandmother?: FamilyMember; // ย่า
  maternalGrandfather?: FamilyMember; // ตา
  maternalGrandmother?: FamilyMember; // ยาย

  parent?: string;
  brother?: string[];
  sister?: string[];
}

// ============================================================
// LEGACY SIMPLE STRUCTURE / ATTACHMENTS
// ============================================================

export interface School {
  schoolName?: string;
  studentId?: string;
  year?: string;
  room?: string;
  number?: string;
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
// CHILD / APP ROOT
// ============================================================

export interface Child {
  id: string;
  basicInfo: BasicInfo;

  profilePhotoUrl?: string;
  createdAt: string;
  updatedAt: string;

  health?: Health;

  // Education history. The School page will sort the latest record first.
  schoolRecords?: SchoolRecord[];

  // Existing event-style activity entries.
  activities?: Activity[];

  // New goal -> sub activity/milestone structure.
  activityGoals?: ActivityGoal[];

  awards?: Award[];
  calendarEvents?: CalendarEvent[];

  // Retained for backwards compatibility.
  school?: School;
  activitiesNew?: Activities;
  awardsNew?: Awards;
  attachments?: Attachment[];
}

export interface AppData {
  children: Child[];
  version: string;
}

// ============================================================
// HELPERS
// ============================================================

export const CHILD_COLORS = [
  { bg: "#EEEDFE", text: "#7F77DD", dot: "#7F77DD" },
  { bg: "#FBEAF0", text: "#D4537E", dot: "#D4537E" },
  { bg: "#E1F5EE", text: "#1D9E75", dot: "#1D9E75" },
  { bg: "#FAEEDA", text: "#BA7517", dot: "#BA7517" },
  { bg: "#E0F2FE", text: "#0369A1", dot: "#0369A1" },
  { bg: "#FEE2E2", text: "#DC2626", dot: "#DC2626" },
  { bg: "#F3E8FF", text: "#7C3AED", dot: "#7C3AED" },
  { bg: "#FFEDD5", text: "#EA580C", dot: "#EA580C" },
] as const;

export function getChildColor(index: number) {
  return CHILD_COLORS[index % CHILD_COLORS.length];
}

export function getInitials(name: string, lastname?: string): string {
  const first = name?.trim()[0] ?? "";
  const last = lastname?.trim()[0] ?? "";
  return (first + last).toUpperCase() || "?";
}

export function calcAge(dob: string): number | null {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return age < 0 ? 0 : age;
}