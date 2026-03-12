"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Copy, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import DocumentUploadSection from "./DocumentUploadSection";
import LegalAgreementSection from "./LegalAgreementSection";
import ReviewNotice from "./ReviewNotice";
import UnderReviewView from "./UnderReviewView";
import SubmittedDetailsModal from "./SubmittedDetailsModal";

import {
  fetchMe,
  fetchSellerKycStatus,
  submitSellerKyc,
  type SellerKycStatus,
} from "@/lib/api/sellerKyc";

type FormState = {
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  phoneNo: string;
  confirmAccuracy: boolean;
  agreeTerms: boolean;
};

const initialFormState: FormState = {
  fullName: "",
  dateOfBirth: "",
  nationality: "",
  address: "",
  phoneNo: "",
  confirmAccuracy: false,
  agreeTerms: false,
};

export default function SellerKycForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);

  const [kycStatus, setKycStatus] = useState<SellerKycStatus | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const [showSubmittedDetails, setShowSubmittedDetails] = useState(false);
  const [submittedDetails, setSubmittedDetails] = useState<{
    fullName?: string;
    dateOfBirth?: string;
    nationality?: string;
    address?: string;
    phoneNo?: string;
    walletAddress?: string;
    idFileName?: string;
  }>({});

  const fullNameRef = useRef<HTMLInputElement | null>(null);
  const dateOfBirthRef = useRef<HTMLInputElement | null>(null);
  const nationalityRef = useRef<HTMLInputElement | null>(null);
  const addressRef = useRef<HTMLTextAreaElement | null>(null);
  const phoneNoRef = useRef<HTMLInputElement | null>(null);
  const fileSectionRef = useRef<HTMLElement | null>(null);
  const legalSectionRef = useRef<HTMLElement | null>(null);

  const status = kycStatus?.verification_status ?? null;
  const isPending = status === "pending";
  const isVerified = status === "verified";
  const isRejected = status === "rejected";

  const maxDate = useMemo(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }, []);

  const buildSubmittedDetails = () => ({
    fullName: formData.fullName?.trim() || "",
    dateOfBirth: formData.dateOfBirth || "",
    nationality: formData.nationality?.trim() || "",
    address: formData.address?.trim() || "",
    phoneNo: formData.phoneNo?.trim() || "",
    walletAddress: walletAddress || "",
    idFileName: idDocument?.name || "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      try {
        const me = await fetchMe();

        if (cancelled) return;

        const currentUser = me?.data;
        setWalletAddress(currentUser?.wallet_address || "");
        setUserRole(currentUser?.role || null);

        if (currentUser?.role !== "seller") {
          setLoadingPage(false);
          return;
        }

        try {
          const statusData = await fetchSellerKycStatus();

          if (!cancelled) {
            setKycStatus(statusData);

            setSubmittedDetails({
              fullName: statusData?.full_name || "",
              dateOfBirth: statusData?.date_of_birth || "",
              nationality: statusData?.nationality || "",
              address: statusData?.address || "",
              phoneNo: statusData?.phone_no || "",
              walletAddress: currentUser?.wallet_address || "",
              idFileName: statusData?.id_photo_path
                ? statusData.id_photo_path.split("/").pop() || ""
                : "",
            });

            if (statusData?.full_name || statusData?.date_of_birth || statusData?.nationality || statusData?.address || statusData?.phone_no) {
              setFormData((prev) => ({
                ...prev,
                fullName: statusData?.full_name || prev.fullName,
                dateOfBirth: statusData?.date_of_birth || prev.dateOfBirth,
                nationality: statusData?.nationality || prev.nationality,
                address: statusData?.address || prev.address,
                phoneNo: statusData?.phone_no || prev.phoneNo,
              }));
            }
          }
        } catch {
          if (!cancelled) {
            setKycStatus(null);
          }
        }
      } catch (error: any) {
        if (!cancelled) {
          setSubmitError(error?.message || "Failed to load your account details");
        }
      } finally {
        if (!cancelled) {
          setLoadingPage(false);
        }
      }
    }

    loadPage();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") return;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleToggle = (
    field: "confirmAccuracy" | "agreeTerms",
    value: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleFileChange = (file: File | null) => {
    setIdDocument(file);
    setErrors((prev) => ({
      ...prev,
      idDocument: "",
    }));
  };

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = "Full name is required";
    }

    if (!formData.dateOfBirth) {
      nextErrors.dateOfBirth = "Date of birth is required";
    }

    if (!formData.nationality.trim()) {
      nextErrors.nationality = "Nationality is required";
    }

    if (!formData.address.trim()) {
      nextErrors.address = "Residential address is required";
    }

    if (!formData.phoneNo.trim()) {
      nextErrors.phoneNo = "Phone number is required";
    }

    if (!idDocument) {
      nextErrors.idDocument = "Government-issued ID is required";
    } else {
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

      if (!allowedTypes.includes(idDocument.type)) {
        nextErrors.idDocument = "Only JPG, PNG and PDF files are allowed";
      }

      if (idDocument.size > 10 * 1024 * 1024) {
        nextErrors.idDocument = "File size must be 10MB or less";
      }
    }

    if (!formData.confirmAccuracy) {
      nextErrors.confirmAccuracy =
        "Please confirm your information is accurate";
    }

    if (!formData.agreeTerms) {
      nextErrors.agreeTerms =
        "Please agree to the terms and compliance policy";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const scrollOptions: ScrollIntoViewOptions = {
        behavior: "smooth",
        block: "center",
      };

      if (nextErrors.fullName) {
        fullNameRef.current?.scrollIntoView(scrollOptions);
        fullNameRef.current?.focus();
      } else if (nextErrors.dateOfBirth) {
        dateOfBirthRef.current?.scrollIntoView(scrollOptions);
        dateOfBirthRef.current?.focus();
      } else if (nextErrors.nationality) {
        nationalityRef.current?.scrollIntoView(scrollOptions);
        nationalityRef.current?.focus();
      } else if (nextErrors.address) {
        addressRef.current?.scrollIntoView(scrollOptions);
        addressRef.current?.focus();
      } else if (nextErrors.phoneNo) {
        phoneNoRef.current?.scrollIntoView(scrollOptions);
        phoneNoRef.current?.focus();
      } else if (nextErrors.idDocument) {
        fileSectionRef.current?.scrollIntoView(scrollOptions);
      } else if (nextErrors.confirmAccuracy || nextErrors.agreeTerms) {
        legalSectionRef.current?.scrollIntoView(scrollOptions);
      }

      return false;
    }

    return true;
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0] || null;
    handleFileChange(file);
  };

  const handleCopyWallet = async () => {
    if (!walletAddress) return;
    await navigator.clipboard.writeText(walletAddress);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const payload = new FormData();
      payload.append("fullName", formData.fullName.trim());
      payload.append("dateOfBirth", formData.dateOfBirth);
      payload.append("nationality", formData.nationality.trim());
      payload.append("address", formData.address.trim());
      payload.append("phoneNo", formData.phoneNo.trim());
      payload.append("confirmAccuracy", String(formData.confirmAccuracy));
      payload.append("agreeTerms", String(formData.agreeTerms));

      if (idDocument) {
        payload.append("idDocument", idDocument);
      }

      const detailsForModal = buildSubmittedDetails();
      setSubmittedDetails(detailsForModal);

      const result = await submitSellerKyc(payload);

      setSubmitSuccess(
        result?.message || "Verification submitted successfully."
      );

      setKycStatus({
        verification_status: "pending",
        verification_submitted_at: new Date().toISOString(),
        verified_at: null,
        rejection_reason: null,
        full_name: formData.fullName.trim(),
        date_of_birth: formData.dateOfBirth,
        nationality: formData.nationality.trim(),
        address: formData.address.trim(),
        phone_no: formData.phoneNo.trim(),
        id_photo_path: idDocument?.name || "",
      });
    } catch (error: any) {
      setSubmitError(error?.message || "Failed to submit verification");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-xl border bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
          <span className="text-sm text-slate-600">
            Loading seller verification...
          </span>
        </div>
      </div>
    );
  }

  if (userRole && userRole !== "seller") {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">
          Seller verification is only for seller accounts
        </h2>
        <p className="mt-3 text-slate-600">
          Your current account role is not seller. Please switch to a seller
          account first.
        </p>
        <button
          type="button"
          onClick={() => router.push("/select-role")}
          className="mt-6 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Go to role selection
        </button>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-9 w-9 text-emerald-600" />
        </div>
        <h2 className="mt-5 text-3xl font-bold text-slate-900">
          Seller verification approved
        </h2>
        <p className="mt-3 text-slate-600">
          Your seller account has been verified successfully. You can now
          continue to your seller dashboard and manage your recipes.
        </p>
        <button
          type="button"
          onClick={() => router.push("/seller/dashboard")}
          className="mt-6 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700"
        >
          Go to seller dashboard
        </button>
      </div>
    );
  }

  if (isPending) {
    return (
      <>
        <UnderReviewView
          submittedAt={kycStatus?.verification_submitted_at}
          onViewDetails={() => setShowSubmittedDetails(true)}
          onGoDashboard={() => router.push("/seller/dashboard")}
        />

        <SubmittedDetailsModal
          open={showSubmittedDetails}
          onClose={() => setShowSubmittedDetails(false)}
          submittedAt={kycStatus?.verification_submitted_at}
          details={submittedDetails}
        />
      </>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      <div className="mb-8 text-center">
        <div className="mx-auto mb-6 flex justify-center">
          <Image
            src="/Logo.png"
            alt="RecipeChain logo"
            width={90}
            height={90}
            className="h-auto w-[90px] object-contain"
            priority
          />
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Seller Verification
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-slate-500">
          To start selling recipes on RecipeChain, please complete identity
          verification. This information will be reviewed by our team.
        </p>

        <div className="mx-auto mt-8 max-w-3xl">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
            <span>Identity Verification</span>
            <span>Estimated time: 3-5 minutes</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200">
            <div className="h-2 w-full rounded-full bg-teal-500" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {submitError ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        {submitSuccess ? (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {submitSuccess}
          </div>
        ) : null}

        {isRejected ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {kycStatus?.rejection_reason ||
              "Your previous verification was rejected. Please review your details and submit again."}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">
              Personal Details
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-5">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  ref={fullNameRef}
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
                {errors.fullName ? (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.fullName}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="dateOfBirth"
                    className="mb-2 block text-sm font-medium text-slate-800"
                  >
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={dateOfBirthRef}
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    max={maxDate}
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                  {errors.dateOfBirth ? (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.dateOfBirth}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="nationality"
                    className="mb-2 block text-sm font-medium text-slate-800"
                  >
                    Nationality <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={nationalityRef}
                    id="nationality"
                    name="nationality"
                    type="text"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    placeholder="Sri Lankan"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                  {errors.nationality ? (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.nationality}
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Residential Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  ref={addressRef}
                  id="address"
                  name="address"
                  rows={4}
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address, city, state, postal code, country"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
                {errors.address ? (
                  <p className="mt-2 text-sm text-red-600">{errors.address}</p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="phoneNo"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  ref={phoneNoRef}
                  id="phoneNo"
                  name="phoneNo"
                  type="tel"
                  value={formData.phoneNo}
                  onChange={handleInputChange}
                  placeholder="+94 71 252 5789"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
                {errors.phoneNo ? (
                  <p className="mt-2 text-sm text-red-600">{errors.phoneNo}</p>
                ) : null}
              </div>
            </div>
          </section>

          <section ref={fileSectionRef}>
            <h2 className="mb-5 text-lg font-semibold text-slate-900">
              Identity Documents
            </h2>
            <DocumentUploadSection
              file={idDocument}
              error={errors.idDocument}
              isDragging={isDragging}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onFileChange={handleFileChange}
            />
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Payout Wallet
            </h2>
            <div className="rounded-xl border bg-slate-50 px-4 py-4">
              <p className="text-xs text-slate-500">Connected Wallet Address</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="truncate text-sm font-medium text-slate-800">
                  {walletAddress || "Wallet address not available"}
                </p>
                <button
                  type="button"
                  onClick={handleCopyWallet}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                  aria-label="Copy wallet address"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Earnings from recipe sales will be sent to this wallet address.
              </p>
            </div>
          </section>

          <section ref={legalSectionRef}>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Legal Agreement
            </h2>
            <LegalAgreementSection
              confirmAccuracy={formData.confirmAccuracy}
              agreeTerms={formData.agreeTerms}
              errors={errors}
              onToggle={handleToggle}
            />
          </section>

          <ReviewNotice />

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-xl bg-teal-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-teal-300"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit for Review"
            )}
          </button>

          <p className="text-center text-xs text-slate-500">
            You will be notified once your verification is approved.
          </p>
        </form>
      </div>
    </div>
  );
}