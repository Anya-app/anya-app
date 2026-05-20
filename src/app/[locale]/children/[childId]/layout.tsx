import type { ReactNode } from "react";
import ChildTabBarServer from "./_components/ChildTabBarServer";

export default async function ChildLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string; childId: string }>;
}) {
  const { locale, childId } = await params;

  return (
    <>
      <ChildTabBarServer childId={childId} locale={locale} />
      <div style={{ padding: "0" }}>{children}</div>
    </>
  );
}
