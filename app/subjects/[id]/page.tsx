import { SubjectDetail } from "@/components/subjects/SubjectDetail";

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SubjectDetail id={id} />;
}
