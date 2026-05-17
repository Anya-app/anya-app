import { redirect } from "next/navigation";

export default async function ChildIndexPage({
  params,
}: {
  params: Promise<{ locale: string; childId: string }>;
}) {
  const { locale, childId } = await params;
  redirect(`/${locale}/children/${childId}/basic-info`);
}
