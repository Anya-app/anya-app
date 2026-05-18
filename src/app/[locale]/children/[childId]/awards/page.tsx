"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useParams } from "next/navigation";
import { mockAppData } from "@/lib/data";
import type { Award, AwardLevel, Child } from "@/types";
import {
  Card,
  SectionLabel,
  InfoRow,
  EmptyState,
} from "@/components/child/DetailPrimitives";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  fontSize: 14,
};

const labelStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 6,
  fontSize: 13,
  color: "#6B7280",
};

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random()}`;
}

function makeEmptyAward(): Award {
  return {
    id: makeId(),
    awardName: "",
    category: "",
    date: "",
    organization: "",
    level: "school",
    note: "",
  };
}

function fmtDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function saveChild(childId: string, data: Child) {
  localStorage.setItem(`child-${childId}`, JSON.stringify(data));
}

export default function AwardsPage() {
  const params = useParams<{ locale: string; childId: string }>();
  const childId = params.childId;

  const originalChild = mockAppData.children.find(
    (c) => c.id === childId
  );

  const [child, setChild] = useState<Child | undefined>(originalChild);
  const [draftAward, setDraftAward] = useState<Award>(makeEmptyAward());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`child-${childId}`);
    if (saved) {
      setChild(JSON.parse(saved));
    }
  }, [childId]);

  if (!child) {
    return <div style={{ padding: 16 }}>Child not found</div>;
  }

  // ✅ FIX TS ERROR
  const currentChild = child;

  const awards = [...(currentChild.awards ?? [])].sort(
    (a, b) =>
      new Date(b.date || "1900-01-01").getTime() -
      new Date(a.date || "1900-01-01").getTime()
  );

  function openAddForm() {
    setDraftAward(makeEmptyAward());
    setEditingId(null);
    setIsFormOpen(true);
  }

  function openEditForm(award: Award) {
    setDraftAward({ ...award });
    setEditingId(award.id);
    setIsFormOpen(true);
  }

  function cancelForm() {
    setDraftAward(makeEmptyAward());
    setEditingId(null);
    setIsFormOpen(false);
  }

  function updateField(field: keyof Award, value: string) {
    setDraftAward((prev) => ({
      ...prev,
      [field]: field === "level" ? (value as AwardLevel) : value,
    }));
  }

  function saveAward() {
    if (!draftAward.awardName.trim()) {
      alert("Please enter award name.");
      return;
    }

    if (!draftAward.date) {
      alert("Please enter award date.");
      return;
    }

    const existing = currentChild.awards ?? [];

    const updatedAwards = editingId
      ? existing.map((a) =>
          a.id === editingId ? draftAward : a
        )
      : [draftAward, ...existing];

    const updatedChild: Child = {
      ...currentChild,
      updatedAt: new Date().toISOString(),
      awards: updatedAwards,
    };

    setChild(updatedChild);
    saveChild(childId, updatedChild);
    cancelForm();
  }

  function deleteAward(id: string) {
    if (!confirm("Delete this award?")) return;

    const updatedChild: Child = {
      ...currentChild,
      updatedAt: new Date().toISOString(),
      awards: (currentChild.awards ?? []).filter(
        (a) => a.id !== id
      ),
    };

    setChild(updatedChild);
    saveChild(childId, updatedChild);
  }

  function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const newAttachment = {
        id: makeId(),
        section: "awards" as const,
        name: file.name,
        type: file.type,
        dataUrl: reader.result as string,
        createdAt: new Date().toISOString(),
      };

      const updatedChild: Child = {
        ...currentChild,
        updatedAt: new Date().toISOString(),
        attachments: [
          ...(currentChild.attachments ?? []),
          newAttachment,
        ],
      };

      setChild(updatedChild);
      saveChild(childId, updatedChild);
    };

    reader.readAsDataURL(file);
  }

  function exportJson() {
    const blob = new Blob(
      [JSON.stringify(currentChild, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${
      currentChild.basicInfo?.name ?? "child"
    }-awards.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <SectionLabel emoji="🏆" label="Awards" color="#BA7517" bg="#FAEEDA" />
          <button onClick={openAddForm}>+ Add</button>
        </div>
      </Card>

      {awards.map((a) => (
        <div key={a.id}>
          {a.awardName}
          <button onClick={() => openEditForm(a)}>Edit</button>
          <button onClick={() => deleteAward(a.id)}>Delete</button>
        </div>
      ))}

      <input type="file" onChange={handleFileUpload} />
      <button onClick={exportJson}>Export JSON</button>
    </div>
  );
}
