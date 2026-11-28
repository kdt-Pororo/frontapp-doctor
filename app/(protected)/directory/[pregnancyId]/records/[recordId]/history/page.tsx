import { Suspense } from "react";
import RecordHistory from "@/app/(protected)/patients/[pregnancyId]/records/[recordId]/history/_components/RecordHistory";
export const instant = false;
type Props = { params: Promise<{ pregnancyId: string; recordId: string }> };
export default function Page(props: Props) {
  return (
    <Suspense
      fallback={
        <p className="p-8 text-sm text-slate-400">
          열람 권한을 확인하고 있습니다.
        </p>
      }
    >
      <Content {...props} />
    </Suspense>
  );
}
async function Content({ params }: Props) {
  return <RecordHistory {...await params} sharedAccess />;
}
