"use client";

import { useEffect, useState } from "react";

export default function ChildDetailClient({ initialChild }: any) {
  const [child, setChild] = useState(initialChild);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`child-${initialChild.id}`);
    if (saved) setChild(JSON.parse(saved));
  }, [initialChild.id]);

  function saveChild() {
    localStorage.setItem(`child-${child.id}`, JSON.stringify(child));
    setEditing(false);
  }

  function updateHealth(field: string, value: any) {
    setChild({
      ...child,
      health: {
        ...child.health,
        [field]: value,
      },
    });
  }

  function attachFile(section: string, file: File) {
    const reader = new FileReader();

    reader.onload = () => {
      const newAttachment = {
        id: crypto.randomUUID(),
        section,
        name: file.name,
        type: file.type,
        dataUrl: reader.result as string,
        createdAt: new Date().toISOString(),
      };

      setChild({
        ...child,
        attachments: [...(child.attachments || []), newAttachment],
      });
    };

    reader.readAsDataURL(file);
  }

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => setEditing(true)}>Edit</button>
      {editing && <button onClick={saveChild}>Save</button>}

      <h2>Health</h2>

      {editing ? (
        <>
          <input
            placeholder="Weight"
            value={child.health?.weight || ""}
            onChange={(e) =>
              updateHealth("weight", Number(e.target.value))
            }
          />

          <input
            placeholder="Height"
            value={child.health?.height || ""}
            onChange={(e) =>
              updateHealth("height", Number(e.target.value))
            }
          />

          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) attachFile("health", file);
            }}
          />
        </>
      ) : (
        <>
          <p>Weight: {child.health?.weight || "-"}</p>
          <p>Height: {child.health?.height || "-"}</p>
        </>
      )}

      <h3>Attachments</h3>
      {(child.attachments || [])
        .filter((a: any) => a.section === "health")
        .map((a: any) => (
          <div key={a.id}>
            <a href={a.dataUrl} download={a.name}>
              {a.name}
            </a>
          </div>
        ))}
    </div>
  );
}
