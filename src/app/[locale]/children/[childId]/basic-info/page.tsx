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
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export type LifeStatus = "alive" | "passed";

export interface LocalizedName {
  value: string;
  language: string;
}

export interface FamilyMember {
  name?: string;
  altNames?: LocalizedName[];
  status?: LifeStatus;
}

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
        <InfoRow label="First name" value={b.name} />
        <InfoRow label="Last name" value={b.lastname} />
        <InfoRow label="Middle name" value={b.middleName} />
        <InfoRow label="Saint name" value={b.saintName} />
        <InfoRow label="Other name" value={b.otherName} />
        <InfoRow label="Nickname" value={b.nickname} />
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

        <InfoRow label="Mother" value={b.motherName} />
        <InfoRow label="Father" value={b.fatherName} />

        {/* NEW GRANDPARENTS STRUCTURE */}
        <InfoRow label="Paternal Grandfather" value={b.paternalGrandfather?.name} />
        <InfoRow label="Paternal Grandmother" value={b.paternalGrandmother?.name} />
        <InfoRow label="Maternal Grandfather" value={b.maternalGrandfather?.name} />
        <InfoRow label="Maternal Grandmother" value={b.maternalGrandmother?.name} />

        <InfoRow label="Guardian" value={b.parent} />

        {(b.brother ?? []).length > 0 && (
          <InfoRow label="Brother(s)" value={(b.brother ?? []).join(", ")} />
        )}
        {(b.sister ?? []).length > 0 && (
          <InfoRow label="Sister(s)" value={(b.sister ?? []).join(", ")} />
        )}

        {!b.motherName &&
          !b.fatherName &&
          !b.paternalGrandfather &&
          !b.paternalGrandmother &&
          !b.maternalGrandfather &&
          !b.maternalGrandmother &&
          !b.parent &&
          (b.brother ?? []).length === 0 &&
          (b.sister ?? []).length === 0 && (
            <EmptyState emoji="👨‍👩‍👧‍👦" message="No family information recorded yet." />
          )}
      </Card>
    </div>
  );
}
