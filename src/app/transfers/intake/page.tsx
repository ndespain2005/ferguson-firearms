import { Suspense } from "react";
import TransferIntakeClient from "./TransferIntakeClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="px-4 py-10 text-white/60">Loading…</div>}>
      <TransferIntakeClient />
    </Suspense>
  );
}
