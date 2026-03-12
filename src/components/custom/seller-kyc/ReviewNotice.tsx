"use client";

import { AlertCircle } from "lucide-react";

export default function ReviewNotice() {
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-slate-800">Review Notice</p>
          <p className="mt-1 text-sm text-slate-600">
            Your seller account will remain under review until approved. This process typically takes 24–48 hours. You
            will receive a notification once your verification is complete.
          </p>
        </div>
      </div>
    </div>
  );
}