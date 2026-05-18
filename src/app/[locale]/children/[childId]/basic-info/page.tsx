import { notFound } from "next/navigation";
import { mockAppData } from "@/lib/data";
import { calcAge } from "@/types";
import {
  Card,
  SectionLabel,
  InfoRow,
  EmptyState,
} from "@/components/child/DetailPrimitives";

function fmtDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

export type LifeStatus = "alive" | "passed";
 
export interface LocalizedName {
  value: string;    // the name in the other language
  language: string; // human-readable language label, e.g. "Thai", "Chinese"
}
 
export interface FamilyMember {
  name?: string;
  altNames?: LocalizedName[];
  status?: LifeStatus;
}

// Next.js 14: params is a plain object, not a Promise
export default async function BasicInfoPage({
  params,
}: {
  params: { locale: string; childId: string };
}) {
  const child = mockAppData.children.find((c) => c.id === params.childId);
  if (!child) notFound();

  const b = child.basicInfo;
  const age = calcAge(b.dateOfBirth);

  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

      <Card>
        <SectionLabel emoji="🪪" label="Identity" color="#7F77DD" bg="#EEEDFE" />
        <InfoRow label="First name"   value={b.name} />
        <InfoRow label="Last name"    value={b.lastname} />
        <InfoRow label="Middle name"  value={b.middleName} />
        <InfoRow label="Saint name"   value={b.saintName} />
        <InfoRow label="Other name"   value={b.otherName} />
        <InfoRow label="Nickname"     value={b.nickname} />
      </Card>

      <Card>
        <SectionLabel emoji="🎂" label="Birth" color="#0369A1" bg="#E0F2FE" />
        <InfoRow
          label="Date of birth"
          value={
            b.dateOfBirth
              ? `${fmtDate(b.dateOfBirth)}${age !== null ? `  (${age} yrs)` : ""}`
              : undefined
          }
        />
        <InfoRow label="Place of birth" value={b.placeOfBirth} />
      </Card>

      <Card>
        <SectionLabel emoji="👨‍👩‍👧‍👦" label="Family" color="#1D9E75" bg="#E1F5EE" />
        <InfoRow label="Mother"      value={b.motherName} />
        <InfoRow label="Father"      value={b.fatherName} />
        <InfoRow label="Grandfather" value={b.grandfather} />
        <InfoRow label="Grandmother" value={b.grandmother} />
        <InfoRow label="Guardian"    value={b.parent} />
        {(b.brother ?? []).length > 0 && (
          <InfoRow label="Brother(s)" value={(b.brother ?? []).join(", ")} />
        )}
        {(b.sister ?? []).length > 0 && (
          <InfoRow label="Sister(s)" value={(b.sister ?? []).join(", ")} />
        )}
        {!b.motherName && !b.fatherName && !b.grandfather &&
         !b.grandmother && !b.parent &&
         (b.brother ?? []).length === 0 && (b.sister ?? []).length === 0 && (
          <EmptyState emoji="👨‍👩‍👧‍👦" message="No family information recorded yet." />
        )}
      </Card>

    </div>
  );
},

paternalGrandfather: {
      name: "Vittaya Chanthavanij",
      altNames: [{ value: "วิทยา ฉันทวานิช", language: "Thai" }],
      status: "Passed",
    },
    paternalGrandmother: {
      name: "Sunida Chanthavanij",
      altNames: [{ value: "สุนิดา ฉันทวานิช", language: "Thai" }],
      status: "Passed",
    },
 
    // Mother's side
    maternalGrandfather: {
      name: "Nuttanun Suppaponsiri",
      altNames: [{ value: "ณัฐนันต์ ศูภผลศิริ", language: "Thai" }],
      status: "Passed",
    },
    maternalGrandmother: {
      name: "Piyaporn Rodtieng",
      altNames: [{ value: "ปิยาภรณ์ รอดเที่ยง", language: "Thai" }],
      status: "Alive",
    },
 
    parent: "",          // guardian name (if different from parents)
    brother: [],
    sister: [],
  },
};
