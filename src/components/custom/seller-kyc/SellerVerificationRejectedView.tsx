"use client";

import {
  AlertTriangle,
  CircleX,
  Headphones,
  RefreshCcw,
} from "lucide-react";
import Image from "next/image";
import { parseSellerKycRejection } from "@/lib/kycRejection";

type Props = {
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  onResubmit: () => void;
  onSupport?: () => void;
};

function formatDecisionDate(value?: string | null) {
  if (!value) return "Decision date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Decision date unavailable";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getStatusBadgeClass(status?: string) {
  switch (status) {
    case "missing":
      return "bg-[#FFF1C2] text-[#A36A00]";
    case "incorrect":
      return "bg-[#FFE0E0] text-[#D64545]";
    case "expired":
      return "bg-[#FFE9C7] text-[#C97A00]";
    case "mismatch":
      return "bg-[#FFE5F1] text-[#C0397A]";
    case "blurred":
      return "bg-[#E8EDFF] text-[#4A63C7]";
    default:
      return "bg-[#EEF2F6] text-[#5F6B7A]";
  }
}

export default function SellerVerificationRejectedView({
  rejectedAt,
  rejectionReason,
  onResubmit,
  onSupport,
}: Props) {
  const parsed = parseSellerKycRejection(rejectionReason);

  return (
    <div className="min-h-screen bg-[#F4F6F7]">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-1">
          <Image
            src="/Logo.png"
            alt="RecipeChain Logo"
            width={46}
            height={46}
            className="h-auto w-[46px] object-contain"
            priority
          />
          <div className="rounded-[12px] border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#3B4552]">
            Status: Rejected
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[980px] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-[660px] rounded-[18px] border border-[#E7E7E7] bg-white px-5 py-6 shadow-[0_10px_35px_rgba(15,23,42,0.08)] sm:px-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FFE5E5] px-4 py-2 text-sm font-semibold text-[#E5484D]">
            <CircleX className="h-4 w-4" />
            Verification Rejected
          </div>

          <h1 className="mt-6 text-[24px] font-bold text-[#24303D] sm:text-[28px]">
            Verification Could Not Be Approved
          </h1>

          <p className="mt-4 text-[15px] leading-7 text-[#708090]">
            {parsed.summary}
          </p>

          <div className="mt-6 rounded-[14px] border-l-4 border-[#EF4444] bg-[#FDE8E8] px-4 py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#D64545]" />
              <div>
                <p className="font-semibold text-[#A33A3A]">Action Required</p>
                <p className="mt-1 text-sm text-[#A33A3A]">
                  Your verification was rejected. You can resubmit corrected information at any time.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#FBE2E2]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#E5484D]">
                <CircleX className="h-8 w-8 text-[#E5484D]" />
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-[#7B8794]">
            Decision made on {formatDecisionDate(rejectedAt)}
          </p>

          <div className="mt-8">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
              <h2 className="text-[18px] font-semibold text-[#2E3742]">
                Items requiring attention:
              </h2>
            </div>

            <div className="space-y-3">
              {parsed.items.length > 0 ? (
                parsed.items.map((item, index) => (
                  <div
                    key={`${item.field}-${index}`}
                    className="rounded-[14px] border border-[#E6EAF0] bg-white px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[15px] font-semibold text-[#2E3742]">
                          {item.label}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#708090]">
                          {item.message}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                          item.status
                        )}`}
                      >
                        {item.status || "review"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[14px] border border-[#E6EAF0] bg-white px-4 py-4 text-sm text-[#708090]">
                  No structured rejection items were provided yet. Review the summary above and resubmit.
                </div>
              )}
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-[18px] font-semibold text-[#2E3742]">
              How to update your information:
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                'Click "Resubmit Verification"',
                "Provide requested items",
                "Submit for review",
              ].map((step, index) => (
                <div
                  key={step}
                  className="rounded-[14px] bg-[#F7F9FB] px-4 py-5 text-center"
                >
                  <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#D8F4F1] text-sm font-bold text-[#1D9D96]">
                    {index + 1}
                  </div>
                  <p className="mt-4 text-sm font-semibold text-[#334155]">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-[14px] bg-[#DFF3F1] px-5 py-5">
            <h3 className="text-[18px] font-semibold text-[#2E3742]">
              Important information:
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-[#4B5563]">
              <li>• Only provide the specific items requested above.</li>
              <li>• Your previously submitted information remains on file.</li>
              <li>• Review will resume immediately after submission.</li>
              <li>• Contact support if you need clarification on requirements.</li>
            </ul>
          </div>

          <div className="mt-6 rounded-[14px] bg-[#DFF3F1] px-5 py-5">
            <h3 className="text-[18px] font-semibold text-[#2E3742]">
              Document Guidelines:
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-[#4B5563]">
              <li>• Use a good camera in a well-lit environment.</li>
              <li>• Include all four corners of your ID in the photo.</li>
              <li>• Avoid glare, shadows, or reflections on documents.</li>
            </ul>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onResubmit}
              className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#169C97] px-5 py-4 text-sm font-semibold text-white transition hover:opacity-95"
            >
              <RefreshCcw className="h-4 w-4" />
              Resubmit Verification
            </button>

            <button
              type="button"
              onClick={onSupport}
              className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#D7DCE2] bg-white px-5 py-4 text-sm font-semibold text-[#2E3742] transition hover:bg-[#F8FAFC]"
            >
              <Headphones className="h-4 w-4" />
              Get Help from Support
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-[#98A2B3]">
            Need help? Your support team can assist with the verification process.
          </p>
        </div>
      </main>
    </div>
  );
}