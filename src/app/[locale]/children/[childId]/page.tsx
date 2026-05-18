import { redirect } from "next/navigation";

export default function ChildIndexPage({
  params,
}: {
  params: { locale: string; childId: string };
}) {
  const { locale, childId } = params;

  redirect(`/${locale}/children/${childId}/basic-info`);
}
