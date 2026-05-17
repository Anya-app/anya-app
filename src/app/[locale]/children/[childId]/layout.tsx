import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { mockAppData } from "@/lib/data";
import { ChildProvider } from "@/context/ChildContext";
import ChildHeaderServer from "./_components/ChildHeaderServer";
import ChildTabBarServer from "./_components/ChildTabBarServer";

export default async function ChildLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string; childId: string }>;
}) {
  const { locale, childId } = await params;
  const child = mockAppData.children.find((c) => c.id === childId);

  if (!child) notFound();

  return (
    <ChildProvider child={child}>
      {/* ChildHeader and ChildTabBar are Server-Component wrappers
          that pass data down; they import the client components. */}
      <ChildHeaderServer child={child} />
      <ChildTabBarServer childId={childId} locale={locale} />
      <div style={{ padding: "0" }}>{children}</div>
    </ChildProvider>
  );
}
