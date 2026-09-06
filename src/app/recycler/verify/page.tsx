import React, { Suspense } from "react";
import { RecyclerVerifyClient } from "@/components/recycler/RecyclerVerifyClient";

export default function RecyclerVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-8 text-xs text-cream-dim">
          Loading Intake Scanner...
        </div>
      }
    >
      <RecyclerVerifyClient />
    </Suspense>
  );
}
