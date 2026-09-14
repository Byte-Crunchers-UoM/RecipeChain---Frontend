"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { X, FileText } from "lucide-react";

type Props = {
  open: boolean;
  onCloseAction: () => void;
  submittedAt?: string | null;
  details: {
    fullName?: string;
    dateOfBirth?: string;
    nationality?: string;
    address?: string;
    phoneNo?: string;
    walletAddress?: string;
    idFileName?: string;

    idDocumentFrontUrl?: string;
    idDocumentBackUrl?: string;
    idDocumentFrontName?: string;
    idDocumentBackName?: string;
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
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-900">
        {value || "Not available"}
      </p>
    </div>
  );
}

function isPdfUrl(value?: string) {
  if (!value) return false;
  return value.toLowerCase().includes(".pdf");
}

function DocumentPreviewCard({
  title,
  imageUrl,
  fileName,
}: {
  title: string;
  imageUrl?: string;
  fileName?: string;
}) {
  const hasFile = !!imageUrl || !!fileName;
  const isPdf = isPdfUrl(imageUrl) || fileName?.toLowerCase().endsWith(".pdf");

  return (
    <div className="rounded-2xl bg-slate-50 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>

      {!hasFile ? (
        <p className="mt-2 text-sm font-semibold text-slate-900">
          Not available
        </p>
      ) : isPdf ? (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {fileName || "PDF Document"}
              </p>
              <p className="text-xs text-slate-500">PDF preview not available</p>
            </div>
          </div>

          {imageUrl ? (
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Open PDF
            </a>
          ) : null}
        </div>
      ) : (
        <div className="mt-3">
          <div className="relative h-[220px] overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
                unoptimized
              />
            ) : null}
          </div>

          {fileName ? (
            <p className="mt-3 break-words text-sm font-semibold text-slate-900">
              {fileName}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function SubmittedDetailsModal({
  open,
  onCloseAction,
  submittedAt,
  details,
}: Props) {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseAction();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onCloseAction]);

  if (!open) return null;

  const handleOverlayMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onCloseAction();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6"
      onMouseDown={handleOverlayMouseDown}
    >
      <div
        ref={modalRef}
        className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl sm:p-8"
        onMouseDown={(event) => event.stopPropagation()}
      >
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
            onClick={onCloseAction}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
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
          <Row label="Uploaded File Names" value={details.idFileName} />
        </div>

        <div className="mt-4">
          <Row label="Residential Address" value={details.address} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <DocumentPreviewCard
            title="ID Document Front"
            imageUrl={details.idDocumentFrontUrl}
            fileName={details.idDocumentFrontName}
          />

          <DocumentPreviewCard
            title="ID Document Back"
            imageUrl={details.idDocumentBackUrl}
            fileName={details.idDocumentBackName}
          />
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onCloseAction}
            className="rounded-2xl bg-teal-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-teal-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}