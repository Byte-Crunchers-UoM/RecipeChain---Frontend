"use client";

import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  submittedAt?: string | null;
  details: {
    fullName?: string;
    dateOfBirth?: string;
    nationality?: string;
    address?: string;
    phoneNo?: string;
    walletAddress?: string;
    idFileName?: string;
  };
};

function formatSubmittedDate(dateString?: string | null) {
  if (!dateString) return "Not available";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-900">
        {value || "Not available"}
      </p>
    </div>
  );
}

export default function SubmittedDetailsModal({
  open,
  onClose,
  submittedAt,
  details,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <div className="w-full max-w-3xl rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-[-0.02em] text-slate-900">
              Submitted Verification Details
            </h2>
            <p className="mt-3 text-lg text-slate-500">
              Submitted on {formatSubmittedDate(submittedAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Row label="Full Name" value={details.fullName} />
          <Row label="Date of Birth" value={details.dateOfBirth} />
          <Row label="Nationality" value={details.nationality} />
          <Row label="Phone Number" value={details.phoneNo} />
          <Row label="Wallet Address" value={details.walletAddress} />
          <Row label="Uploaded Document" value={details.idFileName} />
        </div>

        <div className="mt-4">
          <Row label="Residential Address" value={details.address} />
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-teal-600 px-6 py-3 text-base font-semibold text-white hover:bg-teal-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}