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
// MULTI-LANGUAGE NAME / FAMILY MEMBER
// ============================================================

export interface LocalizedName {
  value: string;
  language: string;
}

export interface MultiLanguageNames {
  th?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
  };
  en?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
  };
  zh?: {
    fullName?: string;
  };
  other?: Array<{
    language: string;
    fullName: string;
  }>;
}

export interface FamilyMember {
  name?: string;
  altNames?: LocalizedName[];
  status?: LifeStatus;
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
  showPresentYearFirst: boolean;
  schoolLevel: SchoolLevel;
  schoolName: string;
  studentId?: string;
  academicYear: string;
  room?: string;
  number?: number;
  term: Term;
  startDate: string;
  endDate?: string;
  classPosition?: ClassPosition[];
  schoolPosition?: SchoolPosition[];
  classSchedule?: ScheduleSlot[];
  normalSchoolTime?: { startTime: string; endTime: string };
  activitySchoolTime?: { startTime: string; endTime: string };
  examDates?: ExamDate[];
  fieldTrips?: FieldTrip[];
  activities?: SchoolActivity[];
  grades?: TermGrade[];
  yearlyNote?: string;
}

// ============================================================
// ACTIVITY (OLD)
// ============================================================

export interface Activity {
  id: string;
  activityName: string;
  category?: string;
  date: string;
  endDate?: string;
  role?: string;
  note?: string;
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
// CHILD (FINAL)
// ============================================================

export interface Child {
  id: string;
  basicInfo: BasicInfo;

  calendarEvents?: CalendarEvent[];
  profilePhotoUrl?: string;
  createdAt: string;
  updatedAt: string;

  // ✅ health ใช้ของเดิม
  health?: Health;

  // ✅ school + grade (ของเดิม)
  schoolRecords?: SchoolRecord[];

  // ✅ ของใหม่
  school?: School;
  activitiesNew?: Activities;
  awardsNew?: Awards;
  attachments?: Attachment[];
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

export function calcAge(dob: string): number | null {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return age < 0 ? 0 : age;
}
