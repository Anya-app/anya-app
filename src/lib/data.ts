import type { AppData } from "@/types";

export const mockAppData: AppData = {
  version: "2.0.0",
  children: [
    {
      id: "child-001",
      profilePhotoUrl: undefined,
      createdAt: "2024-01-10T08:00:00Z",
      updatedAt: "2025-04-01T10:30:00Z",
      basicInfo: {
        // ✅ NEW MULTI LANGUAGE
        names: {
          th: {
            fullName: "ชื่อไทย",
          },
          en: {
            fullName: "English Name",
          },
          zh: {
            fullName: "Chinese Name",
          },
        },

        // OLD (ยังใช้ UI เดิม)
        name: "ชื่อเด็ก",
        lastname: "นามสกุลเด็ก",

        saintName: "ชื่อนักบุญถ้ามี",
        nickname: "ชื่อเล่น",
        dateOfBirth: "dd-mm-yyyy",
        placeOfBirth: "birthplace",

        motherName: "mom",
        fatherName: "dad",
        mother: {
          name: "mom",
          names: { th: { fullName: "" }, en: { fullName: "mom" } },
          altNames: [],
        },
        father: {
          name: "dad",
          names: { th: { fullName: "" }, en: { fullName: "dad" } },
          altNames: [],
        },

        paternalGrandfather: {
          name: "Grandpa",
          altNames: [{ value: "คุณปู่", language: "Thai" }],
          status: "passed",
        },
        paternalGrandmother: {
          name: "grandma",
          altNames: [{ value: "คุณย่า", language: "Thai" }],
          status: "passed",
        },
        maternalGrandfather: {
          name: "grandpa",
          altNames: [{ value: "คุณตา", language: "Thai" }],
          status: "passed",
        },
        maternalGrandmother: {
          name: "Grandma",
          altNames: [{ value: "คุณยาย", language: "Thai" }],
          status: "alive",
        },

        brother: [],
        sister: [],
      },

      health: {
        congenitalDisease: [],
        bodyMarks: [],
        measurements: {
          weight: 22,
          height: 130,
          shoulder: 30,
          upperArm: 20,
          arm: 20,
          chest: 60,
          waistHip: 60,
          leg: 80,
          thighCircumference: 40,
          shoeSize: 34,
        },
        growthTrack: [
          { date: "2023-06-01", weight: 25, height: 110 },
          { date: "2024-01-01", weight: 27, height: 115 },
          { date: "2025-01-01", weight: 28, height: 120 },
        ],
      },

      schoolRecords: [
        {
          id: "school-001-a",
          showPresentYearFirst: true,
          schoolLevel: "primary",
          schoolName: "schoolname",
          studentId: "number",
          academicYear: "2569",
          room: "เลขห้อง",
          number: 1,
          term: "1",
          startDate: "2025-05-18",
          endDate: "2025-10-10",
          normalSchoolTime: { startTime: "07:30", endTime: "15:00" },
          activitySchoolTime: { startTime: "15:30", endTime: "16:30" },
          classPosition: [
            { rank: 3, term: "1", academicYear: "2568", outOf: 35 },
          ],
          schoolPosition: [
            { title: "testตำแหน่งห้อง", startDate: "2025-05-18" },
          ],
          classSchedule: [
            { day: "Mon", startTime: "08:00", endTime: "09:00", subject: "คณิตศาสตร์", teacher: "ครูอรุณ" },
            { day: "Mon", startTime: "09:00", endTime: "10:00", subject: "ภาษาไทย", teacher: "ครูนภา" },
            { day: "Tue", startTime: "08:00", endTime: "09:00", subject: "วิทยาศาสตร์", teacher: "ครูพรรณ" },
          ],
          examDates: [
            { subject: "คณิตศาสตร์", date: "2025-09-10", startTime: "09:00", endTime: "11:00", room: "ห้องสอบ 1" },
          ],
          fieldTrips: [
            { name: "ทัศนศึกษาพิพิธภัณฑ์วิทยาศาสตร์", date: "2025-07-20", destination: "อพวช. ปทุมธานี" },
          ],
          grades: [
            {
              term: "1",
              type: "midterm",
              gpa: 3.75,
              subjectScores: [
                { subject: "คณิตศาสตร์", score: 88, maxScore: 100, grade: "A" },
                { subject: "ภาษาไทย", score: 82, maxScore: 100, grade: "B+" },
                { subject: "วิทยาศาสตร์", score: 90, maxScore: 100, grade: "A" },
              ],
            },
          ],
          yearlyNote: "นักเรียนมีความรับผิดชอบสูง ควรพัฒนาทักษะการนำเสนอ",
        },
      ],

      activities: [
        {
          id: "act-001-a",
          activityName: "ค่ายวิทยาศาสตร์เยาวชน",
          category: "วิชาการ",
          date: "2025-08-01",
          endDate: "2025-08-03",
          role: "ผู้เข้าร่วม",
          note: "ได้รับเกียรติบัตรผ่านการอบรม",
        },
      ],

      activityGoals: [],

      awards: [
        {
          id: "testaward-001-a",
          awardName: "รางวัลชนะเลิศระบายสี",
          category: "Art",
          date: "2025-02-14",
          organization: "testสสวท.",
          level: "provincial",
          note: "testระดับชั้นprimary",
        },
      ],

      calendarEvents: [],
    },

    {
      id: "child-002",
      profilePhotoUrl: undefined,
      createdAt: "2024-03-20T09:00:00Z",
      updatedAt: "2025-05-01T08:00:00Z",
      basicInfo: {
        // ✅ NEW
        names: {
          en: {
            fullName: "Alice Golden",
          },
        },

        name: "Alice",
        lastname: "Golden",
        nickname: "Alice",
        dateOfBirth: "2017-11-08",
        placeOfBirth: "test pet hospital",
        motherName: "Golden re",
        fatherName: "Golder L",
        mother: {
          name: "Golden re",
          names: { th: { fullName: "" }, en: { fullName: "Golden re" } },
          altNames: [],
        },
        father: {
          name: "Golder L",
          names: { th: { fullName: "" }, en: { fullName: "Golder L" } },
          altNames: [],
        },
        paternalGrandfather: { name: "", names: { th: { fullName: "" }, en: { fullName: "" } }, altNames: [] },
        paternalGrandmother: { name: "", names: { th: { fullName: "" }, en: { fullName: "" } }, altNames: [] },
        maternalGrandfather: { name: "", names: { th: { fullName: "" }, en: { fullName: "" } }, altNames: [] },
        maternalGrandmother: { name: "", names: { th: { fullName: "" }, en: { fullName: "" } }, altNames: [] },
        sister: [],
        brother: [],
      },

      health: {},
      schoolRecords: [],
      activities: [],
      activityGoals: [],
      awards: [],
      calendarEvents: [],
    },
  ],
};
