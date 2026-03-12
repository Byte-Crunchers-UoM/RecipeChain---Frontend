"use client";

import { useRef } from "react";
import { FileText, Upload, X } from "lucide-react";

type Props = {
  file: File | null;
  error?: string;
  isDragging: boolean;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileChange: (file: File | null) => void;
};

export default function DocumentUploadSection({
  file,
  error,
  isDragging,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openPicker = () => inputRef.current?.click();

  const readableSize = file
    ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
    : "";

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-slate-600">
        <p>
          Your documents are encrypted and securely stored. All information is kept confidential and used only for
          verification purposes.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-800">
          Government-issued ID (Passport / Driver&apos;s License) <span className="text-red-500">*</span>
        </label>

        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
        />

        <div
          onClick={openPicker}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          className={[
            "cursor-pointer rounded-2xl border-2 border-dashed px-6 py-10 text-center transition",
            isDragging ? "border-teal-500 bg-teal-50" : "border-slate-300 bg-white hover:border-teal-400",
            error ? "border-red-400" : "",
          ].join(" ")}
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
            <Upload className="h-6 w-6 text-slate-500" />
          </div>

          {!file ? (
            <>
              <p className="text-sm font-medium text-slate-700">Click to upload or drag file</p>
              <p className="mt-2 text-xs text-slate-500">Accepted formats: JPG, PNG, PDF • Max size: 10MB</p>
            </>
          ) : (
            <div className="mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl border bg-slate-50 px-4 py-3 text-left">
              <div className="flex min-w-0 items-center gap-3">
                <FileText className="h-5 w-5 shrink-0 text-teal-600" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-500">{readableSize}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileChange(null);
                }}
                className="rounded-full p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}