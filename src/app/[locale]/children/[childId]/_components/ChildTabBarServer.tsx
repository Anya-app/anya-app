import ChildTabBarClient from "@/components/layout/ChildTabBar";

export default function ChildTabBarServer({
  childId,
  locale,
}: {
  childId: string;
  locale: string;
}) {
  return <ChildTabBarClient childId={childId} />;
}
