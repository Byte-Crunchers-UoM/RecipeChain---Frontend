"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
  Info,
  Loader2,
  LogOut,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

import UnderReviewView from "./UnderReviewView";
import SubmittedDetailsModal from "./SubmittedDetailsModal";
import VerifiedSuccessView from "./VerifiedSuccessView";
import SellerVerificationRejectedView from "./SellerVerificationRejectedView";
import {
  fetchMe,
  fetchSellerKycStatus,
  markSellerKycApprovalPageSeen,
  submitSellerKyc,
  type SellerKycStatus,
} from "@/lib/api/sellerKyc";
import {
  parseSellerKycRejection,
  type SellerKycFieldKey,
} from "@/lib/kycRejection";

type FormState = {
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  nationality: string;
  address: string;
  phoneNo: string;
  nicNo: string;
  confirmAccuracy: boolean;
  agreeTerms: boolean;
};

type CountryOption = {
  code: CountryCode;
  label: string;
  dialCode: string;
};

type ErrorState = Record<string, string>;

type DateParts = {
  day: string;
  month: string;
  year: string;
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

const initialFormState: FormState = {
  fullName: "",
  dateOfBirth: "",
  nationality: "",
  address: "",
  phoneNo: "",
  nicNo: "",
  confirmAccuracy: false,
  agreeTerms: false,
};

const initialDobParts: DateParts = {
  day: "",
  month: "",
  year: "",
};

const regionNames =
  typeof Intl !== "undefined" && typeof Intl.DisplayNames !== "undefined"
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

const fallbackCountryLabels: Partial<Record<CountryCode, string>> = {
  XK: "Kosovo",
};

const COUNTRY_OPTIONS: CountryOption[] = getCountries()
  .map((code) => ({
    code,
    label: regionNames?.of(code) || fallbackCountryLabels[code] || code,
    dialCode: `+${getCountryCallingCode(code)}`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const MONTH_OPTIONS = [
  { value: "01", label: "Jan" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Apr" },
  { value: "05", label: "May" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Aug" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

function normalizeSpaces(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeName(value: string) {
  return value
    .replace(/[^A-Za-zÀ-ÿ.'\-\s]/g, "")
    .replace(/\s{2,}/g, " ")
    .trimStart();
}

function normalizeNationality(value: string) {
  return value
    .replace(/[^A-Za-zÀ-ÿ.'\-\s]/g, "")
    .replace(/\s{2,}/g, " ")
    .trimStart();
}

function normalizeAddress(value: string) {
  return value.replace(/\s{2,}/g, " ").trimStart();
}

function normalizeDocumentNumber(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9\-\/]/g, "")
    .replace(/\s+/g, "");
}

function normalizePhoneInput(value: string) {
  return value.replace(/[^\d+\s\-()]/g, "");
}

function formatPhoneInput(value: string, countryCode: CountryCode) {
  return new AsYouType(countryCode).input(value);
}

function buildInternationalPhone(
  localPhone: string,
  countryCode: CountryCode
): string | null {
  const phone = parsePhoneNumberFromString(localPhone, countryCode);
  if (!phone || !phone.isValid()) return null;
  return phone.number;
}

function getCountryOption(countryCode: CountryCode) {
  return (
    COUNTRY_OPTIONS.find((item) => item.code === countryCode) ||
    COUNTRY_OPTIONS.find((item) => item.code === "LK") ||
    COUNTRY_OPTIONS[0]
  );
}

function getDefaultCountryCode(nationality?: string | null): CountryCode {
  const value = nationality?.trim().toLowerCase();
  if (!value) return "LK";

  const directMatch = COUNTRY_OPTIONS.find((country) =>
    value.includes(country.label.toLowerCase())
  );
  if (directMatch) return directMatch.code;

  const demonymMap: Array<{ keywords: string[]; code: CountryCode }> = [
    { keywords: ["sri lankan", "ceylon"], code: "LK" },
    { keywords: ["indian"], code: "IN" },
    { keywords: ["american", "usa", "u.s.a", "united states"], code: "US" },
    { keywords: ["british", "uk", "u.k", "united kingdom"], code: "GB" },
    { keywords: ["canadian"], code: "CA" },
    { keywords: ["australian"], code: "AU" },
    { keywords: ["singaporean"], code: "SG" },
    { keywords: ["malaysian"], code: "MY" },
    { keywords: ["new zealander"], code: "NZ" },
    { keywords: ["emirati", "uae", "u.a.e"], code: "AE" },
  ];

  const demonymMatch = demonymMap.find((item) =>
    item.keywords.some((keyword) => value.includes(keyword))
  );

  return demonymMatch?.code || "LK";
}

function getPhonePlaceholder(countryCode: CountryCode) {
  switch (countryCode) {
    case "LK":
      return "71 234 5678";
    case "IN":
      return "98765 43210";
    case "US":
    case "CA":
      return "(201) 555-0123";
    case "GB":
      return "7400 123456";
    case "AU":
      return "412 345 678";
    case "SG":
      return "8123 4567";
    case "MY":
      return "12-345 6789";
    case "AE":
      return "50 123 4567";
    default:
      return "123-456-7890";
  }
}

function validateFullName(value: string) {
  const normalized = normalizeSpaces(value);

  if (!normalized) return "Full name is required.";
  if (normalized.length < 3) return "Full name must be at least 3 characters.";
  if (normalized.length > 80) return "Full name must be 80 characters or less.";
  if (!/^[A-Za-zÀ-ÿ.'\- ]+$/.test(normalized)) {
    return "Full name can only contain letters, spaces, apostrophes, dots, and hyphens.";
  }

  return "";
}

function validateDateOfBirth(value: string) {
  if (!value) return "Date of birth is required.";

  const parts = value.split("-");
  if (parts.length !== 3) return "Please enter a valid date of birth.";

  const [yearStr, monthStr, dayStr] = parts;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (!year || !month || !day) {
    return "Please enter a valid date of birth.";
  }

  const dob = new Date(year, month - 1, day);
  const today = new Date();

  const isSameDate =
    dob.getFullYear() === year &&
    dob.getMonth() === month - 1 &&
    dob.getDate() === day;

  if (!isSameDate) {
    return "Please enter a valid date of birth.";
  }

  if (dob > today) {
    return "Date of birth cannot be in the future.";
  }

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  if (age < 18) {
    return "You must be at least 18 years old to apply as a seller.";
  }

  if (age > 120) {
    return "Please enter a realistic date of birth.";
  }

  return "";
}

function validateNationality(value: string) {
  const normalized = normalizeSpaces(value);

  if (!normalized) return "Nationality is required.";
  if (normalized.length < 2) return "Nationality is too short.";
  if (normalized.length > 56) return "Nationality must be 56 characters or less.";
  if (!/^[A-Za-zÀ-ÿ.'\- ]+$/.test(normalized)) {
    return "Nationality can only contain letters, spaces, apostrophes, dots, and hyphens.";
  }

  return "";
}

function validateAddress(value: string) {
  const normalized = normalizeSpaces(value);

  if (!normalized) return "Residential address is required.";
  if (normalized.length < 10) {
    return "Please enter a more complete residential address.";
  }
  if (normalized.length > 200) {
    return "Residential address must be 200 characters or less.";
  }

  return "";
}

function validatePhone(value: string, countryCode: CountryCode) {
  const normalized = value.trim();

  if (!normalized) return "Phone number is required.";

  const phone = parsePhoneNumberFromString(normalized, countryCode);

  if (!phone || !phone.isValid()) {
    return `Please enter a valid ${getCountryOption(countryCode).label} phone number.`;
  }

  return "";
}

function validateNicNo(value: string, countryCode: CountryCode) {
  const normalized = value.trim().toUpperCase();

  if (!normalized) return "NIC / passport number is required.";
  if (normalized.length < 6) {
    return "NIC / passport number looks too short. Please check again.";
  }
  if (normalized.length > 20) {
    return "NIC / passport number must be 20 characters or less.";
  }

  if (countryCode === "LK") {
    const oldNicPattern = /^\d{9}[VX]$/;
    const newNicPattern = /^\d{12}$/;
    const passportPattern = /^[A-Z0-9]{6,20}$/;

    if (
      !oldNicPattern.test(normalized) &&
      !newNicPattern.test(normalized) &&
      !passportPattern.test(normalized)
    ) {
      return "Enter a valid Sri Lankan NIC or passport number.";
    }

    return "";
  }

  if (!/^[A-Z0-9\-\/]{6,20}$/.test(normalized)) {
    return "Enter a valid ID or passport number.";
  }

  return "";
}

function validateIdDocument(file: File | null) {
  if (!file) return "Please upload your government-issued ID.";

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return "Only JPG, PNG, and PDF files are allowed.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "File size must be 10MB or less.";
  }

  return "";
}

function formatWalletDisplay(value: string) {
  if (!value) return "Wallet address not available";
  if (value.length <= 18) return value;
  return `${value.slice(0, 10)} . . . ${value.slice(-6)}`;
}

function getDatePartsFromIso(value: string): DateParts {
  if (!value || !value.includes("-")) {
    return { day: "", month: "", year: "" };
  }

  const [year, month, day] = value.split("-");
  return {
    day: day || "",
    month: month || "",
    year: year || "",
  };
}

function buildIsoDateFromParts({ day, month, year }: DateParts): string {
  if (!day || !month || !year) return "";
  return `${year}-${month}-${day}`;
}

function getDaysInMonth(month: string, year: string) {
  if (!month || !year) return 31;
  const monthNum = Number(month);
  const yearNum = Number(year);
  if (!monthNum || !yearNum) return 31;
  return new Date(yearNum, monthNum, 0).getDate();
}

function getYearOptions() {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];
  for (let year = currentYear; year >= currentYear - 120; year -= 1) {
    years.push(String(year));
  }
  return years;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 border-b border-[#E8E8E8] pb-3">
      <h3 className="text-[16px] font-semibold text-[#2E3742]">{children}</h3>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-[#D64545]">{message}</p>;
}

export default function SellerKycForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [dobParts, setDobParts] = useState<DateParts>(initialDobParts);
  const [errors, setErrors] = useState<ErrorState>({});
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] =
    useState<CountryCode>("LK");

  const [kycStatus, setKycStatus] = useState<SellerKycStatus | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [walletCopied, setWalletCopied] = useState(false);

  const [showSubmittedDetails, setShowSubmittedDetails] = useState(false);
  const [isMarkingSeen, setIsMarkingSeen] = useState(false);
  const [forceShowForm, setForceShowForm] = useState(false);
  const [rejectedFieldKeys, setRejectedFieldKeys] = useState<SellerKycFieldKey[]>(
    []
  );
  const [rejectedFieldLabels, setRejectedFieldLabels] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [submittedDetails, setSubmittedDetails] = useState<{
    fullName?: string;
    dateOfBirth?: string;
    nationality?: string;
    address?: string;
    phoneNo?: string;
    nicNo?: string;
    walletAddress?: string;
    idFileName?: string;
  }>({});

  const fullNameRef = useRef<HTMLInputElement | null>(null);
  const dayRef = useRef<HTMLSelectElement | null>(null);
  const monthRef = useRef<HTMLSelectElement | null>(null);
  const yearRef = useRef<HTMLSelectElement | null>(null);
  const nationalityRef = useRef<HTMLInputElement | null>(null);
  const addressRef = useRef<HTMLTextAreaElement | null>(null);
  const phoneNoRef = useRef<HTMLInputElement | null>(null);
  const nicNoRef = useRef<HTMLInputElement | null>(null);
  const fileSectionRef = useRef<HTMLDivElement | null>(null);
  const legalSectionRef = useRef<HTMLDivElement | null>(null);

  const status = kycStatus?.verification_status ?? null;
  const isPending = status === "pending";
  const isApproved = status === "approved";
  const isRejected = status === "rejected";
  const hasSeenApprovedPage = kycStatus?.kyc_approval_page_seen === true;

  const selectedCountry = useMemo(
    () => getCountryOption(selectedCountryCode),
    [selectedCountryCode]
  );

  const getFieldClass = (field: SellerKycFieldKey) => {
    const highlighted = rejectedFieldKeys.includes(field);

    return [
      "h-[46px] w-full rounded-[12px] border bg-white px-4 text-[14px] text-[#344054] placeholder:text-[#A0A7B0] outline-none transition focus:border-[#19B5AE] focus:ring-4 focus:ring-[#19B5AE]/10",
      highlighted ? "border-[#F59E0B] bg-[#FFFBEA]" : "border-[#E6E8EC]",
    ].join(" ");
  };

  const getTextareaClass = (field: SellerKycFieldKey) => {
    const highlighted = rejectedFieldKeys.includes(field);

    return [
      "min-h-[96px] w-full rounded-[12px] border bg-white px-4 py-3 text-[14px] text-[#344054] placeholder:text-[#A0A7B0] outline-none transition focus:border-[#19B5AE] focus:ring-4 focus:ring-[#19B5AE]/10",
      highlighted ? "border-[#F59E0B] bg-[#FFFBEA]" : "border-[#E6E8EC]",
    ].join(" ");
  };

  const yearOptions = useMemo(() => getYearOptions(), []);
  const dayOptions = useMemo(() => {
    const count = getDaysInMonth(dobParts.month, dobParts.year);
    return Array.from({ length: count }, (_, index) =>
      String(index + 1).padStart(2, "0")
    );
  }, [dobParts.month, dobParts.year]);

  const buildSubmittedDetails = () => {
    const internationalPhone =
      buildInternationalPhone(formData.phoneNo, selectedCountryCode) ||
      `${selectedCountry.dialCode} ${formData.phoneNo.trim()}`;

    return {
      fullName: normalizeSpaces(formData.fullName),
      dateOfBirth: formData.dateOfBirth || "",
      nationality: normalizeSpaces(formData.nationality),
      address: normalizeSpaces(formData.address),
      phoneNo: internationalPhone,
      nicNo: formData.nicNo.trim().toUpperCase(),
      walletAddress: walletAddress || "",
      idFileName: idDocument?.name || kycStatus?.id_document_original_name || "",
    };
  };

  const validateSingleField = (
    fieldName: keyof FormState | "idDocument",
    nextValue?: string | boolean | File | null
  ) => {
    switch (fieldName) {
      case "fullName":
        return validateFullName(String(nextValue ?? formData.fullName));
      case "dateOfBirth":
        return validateDateOfBirth(String(nextValue ?? formData.dateOfBirth));
      case "nationality":
        return validateNationality(String(nextValue ?? formData.nationality));
      case "address":
        return validateAddress(String(nextValue ?? formData.address));
      case "phoneNo":
        return validatePhone(
          String(nextValue ?? formData.phoneNo),
          selectedCountryCode
        );
      case "nicNo":
        return validateNicNo(
          String(nextValue ?? formData.nicNo),
          selectedCountryCode
        );
      case "confirmAccuracy":
        return nextValue || formData.confirmAccuracy
          ? ""
          : "Please confirm that your details are accurate.";
      case "agreeTerms":
        return nextValue || formData.agreeTerms
          ? ""
          : "You must agree to RecipeChain's terms and policy.";
      case "idDocument":
        return validateIdDocument((nextValue as File | null) ?? idDocument);
      default:
        return "";
    }
  };

  const validateForm = () => {
    const nextErrors: ErrorState = {
      fullName: validateFullName(formData.fullName),
      dateOfBirth: validateDateOfBirth(formData.dateOfBirth),
      nationality: validateNationality(formData.nationality),
      address: validateAddress(formData.address),
      phoneNo: validatePhone(formData.phoneNo, selectedCountryCode),
      nicNo: validateNicNo(formData.nicNo, selectedCountryCode),
      idDocument: validateIdDocument(idDocument),
      confirmAccuracy: formData.confirmAccuracy
        ? ""
        : "Please confirm that your details are accurate.",
      agreeTerms: formData.agreeTerms
        ? ""
        : "You must agree to RecipeChain's terms and policy.",
    };

    const cleanedErrors = Object.fromEntries(
      Object.entries(nextErrors).filter(([, value]) => value)
    );

    setErrors(cleanedErrors);

    if (Object.keys(cleanedErrors).length > 0) {
      const scrollOptions: ScrollIntoViewOptions = {
        behavior: "smooth",
        block: "center",
      };

      if (cleanedErrors.fullName) {
        fullNameRef.current?.scrollIntoView(scrollOptions);
        fullNameRef.current?.focus();
      } else if (cleanedErrors.dateOfBirth) {
        dayRef.current?.scrollIntoView(scrollOptions);
        if (!dobParts.day) dayRef.current?.focus();
        else if (!dobParts.month) monthRef.current?.focus();
        else yearRef.current?.focus();
      } else if (cleanedErrors.nationality) {
        nationalityRef.current?.scrollIntoView(scrollOptions);
        nationalityRef.current?.focus();
      } else if (cleanedErrors.address) {
        addressRef.current?.scrollIntoView(scrollOptions);
        addressRef.current?.focus();
      } else if (cleanedErrors.phoneNo) {
        phoneNoRef.current?.scrollIntoView(scrollOptions);
        phoneNoRef.current?.focus();
      } else if (cleanedErrors.nicNo) {
        nicNoRef.current?.scrollIntoView(scrollOptions);
        nicNoRef.current?.focus();
      } else if (cleanedErrors.idDocument) {
        fileSectionRef.current?.scrollIntoView(scrollOptions);
      } else if (cleanedErrors.confirmAccuracy || cleanedErrors.agreeTerms) {
        legalSectionRef.current?.scrollIntoView(scrollOptions);
      }

      return false;
    }

    return true;
  };

  const handleDatePartChange = (part: keyof DateParts, value: string) => {
    setDobParts((prev) => {
      const nextParts: DateParts = {
        ...prev,
        [part]: value,
      };

      if (part === "month" || part === "year") {
        const maxDay = getDaysInMonth(nextParts.month, nextParts.year);
        if (nextParts.day && Number(nextParts.day) > maxDay) {
          nextParts.day = "";
        }
      }

      const nextDate = buildIsoDateFromParts(nextParts);

      setFormData((current) => ({
        ...current,
        dateOfBirth: nextDate,
      }));

      setErrors((currentErrors) => ({
        ...currentErrors,
        dateOfBirth:
          nextParts.day && nextParts.month && nextParts.year
            ? validateDateOfBirth(nextDate)
            : "Date of birth is required.",
      }));

      return nextParts;
    });
  };

  const handleDatePartBlur = () => {
    setErrors((prev) => ({
      ...prev,
      dateOfBirth: validateDateOfBirth(formData.dateOfBirth),
    }));
  };

  const handleLogout = async () => {
    try {
      setSubmitError("");

      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        localStorage.removeItem("seller");
        sessionStorage.clear();
      }

      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setSubmitError("Failed to logout. Please try again.");
    }
  };

  const handleApprovedPageContinue = async (targetPath: string) => {
    try {
      setIsMarkingSeen(true);
      setSubmitError("");

      await markSellerKycApprovalPageSeen();

      setKycStatus((prev) =>
        prev
          ? {
              ...prev,
              kyc_approval_page_seen: true,
            }
          : prev
      );

      router.replace(targetPath);
    } catch (error: any) {
      setSubmitError(error?.message || "Failed to continue. Please try again.");
    } finally {
      setIsMarkingSeen(false);
    }
  };

  const handleResubmitRejectedKyc = () => {
    const parsed = parseSellerKycRejection(kycStatus?.rejection_reason);

    setRejectedFieldKeys(parsed.items.map((item: any) => item.field));
    setRejectedFieldLabels(parsed.items.map((item: any) => item.label));
    setForceShowForm(true);
  };

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

            if (
                  statusData?.verification_status === "approved" &&
                  statusData?.kyc_approval_page_seen === true
                ) {
                  router.replace("/seller/dashboard");
                  return;
                }

            const derivedCountry = getDefaultCountryCode(
              statusData?.nationality || ""
            );
            setSelectedCountryCode(derivedCountry);

            let localPhone = statusData?.phone_no || "";
            const parsedStoredPhone = statusData?.phone_no
              ? parsePhoneNumberFromString(statusData.phone_no)
              : null;

            if (parsedStoredPhone?.country) {
              setSelectedCountryCode(parsedStoredPhone.country);
              localPhone = parsedStoredPhone.nationalNumber || localPhone;
            }

            setSubmittedDetails({
              fullName: statusData?.full_name || "",
              dateOfBirth: statusData?.date_of_birth || "",
              nationality: statusData?.nationality || "",
              address: statusData?.address || "",
              phoneNo: statusData?.phone_no || "",
              nicNo: statusData?.nic_no || "",
              walletAddress: currentUser?.wallet_address || "",
              idFileName: statusData?.id_document_original_name || "",
            });

            if (statusData?.verification_status === "rejected") {
              const existingDob = statusData?.date_of_birth || "";

              setFormData({
                fullName: statusData?.full_name || "",
                dateOfBirth: existingDob,
                nationality: statusData?.nationality || "",
                address: statusData?.address || "",
                phoneNo: localPhone,
                nicNo: statusData?.nic_no || "",
                confirmAccuracy: false,
                agreeTerms: false,
              });

              setDobParts(getDatePartsFromIso(existingDob));
            }
          }
        } catch (error) {
          if (!cancelled) {
            console.warn("No existing KYC status found:", error);
          }
        }
      } catch (error: any) {
        if (!cancelled) {
          setSubmitError(error?.message || "Failed to load seller details.");
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

  useEffect(() => {
    if (!isPending || userRole !== "seller") return;

    let cancelled = false;

    const intervalId = window.setInterval(async () => {
      try {
        const latestStatus = await fetchSellerKycStatus();

        if (cancelled) return;

        setKycStatus(latestStatus);

        if (latestStatus?.verification_status === "rejected") {
          const localPhone = latestStatus?.phone_no
            ? parsePhoneNumberFromString(latestStatus.phone_no)?.nationalNumber ||
              latestStatus.phone_no
            : "";

          setFormData((prev) => ({
            ...prev,
            fullName: latestStatus?.full_name || prev.fullName,
            dateOfBirth: latestStatus?.date_of_birth || prev.dateOfBirth,
            nationality: latestStatus?.nationality || prev.nationality,
            address: latestStatus?.address || prev.address,
            phoneNo: localPhone || prev.phoneNo,
            nicNo: latestStatus?.nic_no || prev.nicNo,
          }));
        }

        if (
          latestStatus?.verification_status === "approved" ||
          latestStatus?.verification_status === "rejected"
        ) {
          window.clearInterval(intervalId);
        }
      } catch (error) {
        console.warn("KYC polling failed:", error);
      }
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isPending, userRole]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "phoneNo") {
      const cleaned = normalizePhoneInput(value);
      const formatted = formatPhoneInput(cleaned, selectedCountryCode);

      setFormData((prev) => ({
        ...prev,
        phoneNo: formatted,
      }));

      setErrors((prev) => ({
        ...prev,
        phoneNo: validatePhone(formatted, selectedCountryCode),
      }));
      return;
    }

    let nextValue = value;

    if (name === "fullName") nextValue = normalizeName(value);
    if (name === "nationality") nextValue = normalizeNationality(value);
    if (name === "address") nextValue = normalizeAddress(value);
    if (name === "nicNo") nextValue = normalizeDocumentNumber(value);

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    const fieldError = validateSingleField(
      name as keyof FormState,
      typeof nextValue === "string" ? nextValue : String(nextValue)
    );

    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name } = e.target;
    const fieldName = name as keyof FormState;
    const fieldError = validateSingleField(fieldName);

    setErrors((prev) => ({
      ...prev,
      [fieldName]: fieldError,
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
      [field]: value
        ? ""
        : field === "confirmAccuracy"
        ? "Please confirm that your details are accurate."
        : "You must agree to RecipeChain's terms and policy.",
    }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextCountry = e.target.value as CountryCode;
    setSelectedCountryCode(nextCountry);

    setFormData((prev) => {
      const nextPhone = prev.phoneNo
        ? formatPhoneInput(normalizePhoneInput(prev.phoneNo), nextCountry)
        : prev.phoneNo;

      setErrors((currentErrors) => ({
        ...currentErrors,
        phoneNo: nextPhone ? validatePhone(nextPhone, nextCountry) : "",
        nicNo: prev.nicNo ? validateNicNo(prev.nicNo, nextCountry) : "",
      }));

      return {
        ...prev,
        phoneNo: nextPhone,
      };
    });
  };

  const handleFileChange = (file: File | null) => {
    setIdDocument(file);

    setErrors((prev) => ({
      ...prev,
      idDocument: validateIdDocument(file),
    }));
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

    try {
      await navigator.clipboard.writeText(walletAddress);
      setWalletCopied(true);

      setTimeout(() => {
        setWalletCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy wallet address:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (!validateForm()) return;

    const internationalPhone = buildInternationalPhone(
      formData.phoneNo,
      selectedCountryCode
    );

    if (!internationalPhone) {
      setErrors((prev) => ({
        ...prev,
        phoneNo: `Please enter a valid ${selectedCountry.label} phone number.`,
      }));
      phoneNoRef.current?.focus();
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = new FormData();
      payload.append("fullName", normalizeSpaces(formData.fullName));
      payload.append("dateOfBirth", formData.dateOfBirth);
      payload.append("nationality", normalizeSpaces(formData.nationality));
      payload.append("address", normalizeSpaces(formData.address));
      payload.append("phoneNo", internationalPhone);
      payload.append("nicNo", formData.nicNo.trim().toUpperCase());
      payload.append("confirmAccuracy", String(formData.confirmAccuracy));
      payload.append("agreeTerms", String(formData.agreeTerms));

      if (idDocument) {
        payload.append("idDocument", idDocument);
      }

      const detailsForModal = {
        ...buildSubmittedDetails(),
        phoneNo: internationalPhone,
      };
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
        full_name: normalizeSpaces(formData.fullName),
        display_name: normalizeSpaces(formData.fullName),
        date_of_birth: formData.dateOfBirth,
        nationality: normalizeSpaces(formData.nationality),
        address: normalizeSpaces(formData.address),
        phone_no: internationalPhone,
        nic_no: formData.nicNo.trim().toUpperCase(),
        cloudinary_public_id: null,
        id_document_resource_type:
          idDocument?.type === "application/pdf" ? "raw" : "image",
        id_document_original_name: idDocument?.name || "",
        kyc_approval_page_seen: false,
      });
    } catch (error: any) {
      setSubmitError(error?.message || "Failed to submit verification");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#F5F6F7]">
        <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-[#19B5AE]" />
          <span className="text-sm text-[#5F6B7A]">
            Loading seller verification...
          </span>
        </div>
      </div>
    );
  }

  if (userRole !== "seller") {
    return (
      <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Seller role required
        </h1>
        <p className="mt-3 text-slate-600">
          Please choose the seller role first before completing KYC.
        </p>
        <button
          type="button"
          onClick={() => router.push("/select-role")}
          className="mt-6 rounded-2xl bg-[#19B5AE] px-6 py-3 text-sm font-semibold text-white hover:opacity-95"
        >
          Go to role selection
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
          onLogout={handleLogout}
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

  if (isApproved && !hasSeenApprovedPage) {
    return (
      <VerifiedSuccessView
        submittedAt={kycStatus?.verification_submitted_at}
        verifiedAt={kycStatus?.verified_at}
        onLogout={handleLogout}
        onGoDashboard={() => handleApprovedPageContinue("/seller/dashboard")}
        onCreateRecipe={() => handleApprovedPageContinue("/seller/recipes")}
        isLoading={isMarkingSeen}
      />
    );
  }

  if (isRejected && !forceShowForm) {
    return (
      <SellerVerificationRejectedView
        rejectedAt={kycStatus?.verification_submitted_at}
        rejectionReason={kycStatus?.rejection_reason}
        onResubmit={handleResubmitRejectedKyc}
        onSupport={() => window.alert("Support page not connected yet.")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F7] text-[#2E3742]">
      <header className="border-b border-[#ECECEC] bg-white">
        <div className="relative mx-auto flex h-[72px] max-w-[1200px] items-center px-6">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="inline-flex items-center gap-2 text-sm text-[#6A7480] transition hover:text-[#2E3742]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="absolute left-1/2 -translate-x-1/2">
            <Image
              src="/Logo.png"
              alt="RecipeChain Logo"
              width={58}
              height={58}
              priority
              className="h-auto w-[46px] object-contain"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[980px] px-4 pb-16 pt-10 sm:px-6">
        <div className="mx-auto max-w-[660px]">
          <div className="text-center">
            <h1 className="text-[22px] font-semibold text-[#2F3844] sm:text-[24px]">
              Seller Verification
            </h1>
            <p className="mx-auto mt-3 max-w-[620px] text-[14px] leading-6 text-[#7B8794]">
              To start selling recipes on RecipeChain, please complete identity
              verification.
              <br className="hidden sm:block" />
              This information will be reviewed by our team.
            </p>
          </div>

          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between text-[12px] text-[#768190]">
              <span>Identity Verification</span>
              <span>Estimated time: 3-5 minutes</span>
            </div>
            <div className="h-[6px] w-full overflow-hidden rounded-full bg-[#DDEEEE]">
              <div className="h-full w-full rounded-full bg-[#19B5AE]" />
            </div>
          </div>


          {submitError ? (
            <div className="mt-6 rounded-[12px] border border-[#F5C2C7] bg-[#FFF1F2] px-4 py-3 text-sm text-[#B42318]">
              {submitError}
            </div>
          ) : null}

          {submitSuccess ? (
            <div className="mt-6 rounded-[12px] border border-[#B7E4C7] bg-[#ECFDF3] px-4 py-3 text-sm text-[#067647]">
              {submitSuccess}
            </div>
          ) : null}

          {forceShowForm && rejectedFieldLabels.length > 0 ? (
            <div className="mt-6 rounded-[12px] border border-[#F5C27A] bg-[#FFF8E7] px-4 py-4 text-sm text-[#8A5A00]">
              <p className="font-semibold">Please correct these fields before resubmitting:</p>
              <p className="mt-2">{rejectedFieldLabels.join(", ")}</p>
            </div>
          ) : null}

          <form
            className="mt-6 rounded-[18px] border border-[#E7E7E7] bg-white px-5 py-5 shadow-[0_10px_35px_rgba(15,23,42,0.08)] sm:px-7 sm:py-6"
            onSubmit={handleSubmit}
            noValidate
          >
            <section>
              <SectionTitle>Personal Details</SectionTitle>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-[13px] font-medium text-[#475467]"
                  >
                    Full Name <span className="text-[#FF5A5F]">*</span>
                  </label>
                  <input
                    ref={fullNameRef}
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="John Doe"
                    maxLength={80}
                    autoComplete="name"
                    className={getFieldClass("fullName")}
                  />
                  <FieldError message={errors.fullName} />
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-medium text-[#475467]">
                    Date of Birth <span className="text-[#FF5A5F]">*</span>
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    <select
                      ref={dayRef}
                      value={dobParts.day}
                      onChange={(e) => handleDatePartChange("day", e.target.value)}
                      onBlur={handleDatePartBlur}
                      className={[
                        "h-[46px] rounded-[12px] border bg-white px-3 text-[14px] text-[#344054] outline-none transition focus:border-[#19B5AE] focus:ring-4 focus:ring-[#19B5AE]/10",
                        rejectedFieldKeys.includes("dateOfBirth")
                          ? "border-[#F59E0B] bg-[#FFFBEA]"
                          : "border-[#E6E8EC]",
                      ].join(" ")}
                    >
                      <option value="">Day</option>
                      {dayOptions.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>

                    <select
                      ref={monthRef}
                      value={dobParts.month}
                      onChange={(e) =>
                        handleDatePartChange("month", e.target.value)
                      }
                      onBlur={handleDatePartBlur}
                      className={[
                        "h-[46px] rounded-[12px] border bg-white px-3 text-[14px] text-[#344054] outline-none transition focus:border-[#19B5AE] focus:ring-4 focus:ring-[#19B5AE]/10",
                        rejectedFieldKeys.includes("dateOfBirth")
                          ? "border-[#F59E0B] bg-[#FFFBEA]"
                          : "border-[#E6E8EC]",
                      ].join(" ")}
                    >
                      <option value="">Month</option>
                      {MONTH_OPTIONS.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>

                    <select
                      ref={yearRef}
                      value={dobParts.year}
                      onChange={(e) => handleDatePartChange("year", e.target.value)}
                      onBlur={handleDatePartBlur}
                      className={[
                        "h-[46px] rounded-[12px] border bg-white px-3 text-[14px] text-[#344054] outline-none transition focus:border-[#19B5AE] focus:ring-4 focus:ring-[#19B5AE]/10",
                        rejectedFieldKeys.includes("dateOfBirth")
                          ? "border-[#F59E0B] bg-[#FFFBEA]"
                          : "border-[#E6E8EC]",
                      ].join(" ")}
                    >
                      <option value="">Year</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <FieldError message={errors.dateOfBirth} />
                </div>

                <div>
                  <label
                    htmlFor="nationality"
                    className="mb-2 block text-[13px] font-medium text-[#475467]"
                  >
                    Nationality <span className="text-[#FF5A5F]">*</span>
                  </label>
                  <input
                    ref={nationalityRef}
                    id="nationality"
                    name="nationality"
                    type="text"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Sri Lankan"
                    maxLength={56}
                    autoComplete="country-name"
                    className={getFieldClass("nationality")}
                  />
                  <FieldError message={errors.nationality} />
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="mb-2 block text-[13px] font-medium text-[#475467]"
                  >
                    Residential Address <span className="text-[#FF5A5F]">*</span>
                  </label>
                  <textarea
                    ref={addressRef}
                    id="address"
                    name="address"
                    rows={4}
                    value={formData.address}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Street address, city, state, postal code, country"
                    maxLength={200}
                    autoComplete="street-address"
                    className={getTextareaClass("address")}
                  />
                  <FieldError message={errors.address} />
                </div>

                <div>
                  <label
                    htmlFor="phoneNo"
                    className="mb-2 block text-[13px] font-medium text-[#475467]"
                  >
                    Phone Number <span className="text-[#FF5A5F]">*</span>
                  </label>

                  <div className="flex gap-2">
                    <select
                      value={selectedCountryCode}
                      onChange={handleCountryChange}
                      className="h-[46px] min-w-[180px] rounded-[12px] border border-[#E6E8EC] bg-white px-3 text-[14px] text-[#344054] outline-none transition focus:border-[#19B5AE] focus:ring-4 focus:ring-[#19B5AE]/10"
                    >
                      {COUNTRY_OPTIONS.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.label} ({country.dialCode})
                        </option>
                      ))}
                    </select>

                    <input
                      ref={phoneNoRef}
                      id="phoneNo"
                      name="phoneNo"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      value={formData.phoneNo}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder={getPhonePlaceholder(selectedCountryCode)}
                      className={getFieldClass("phoneNo")}
                    />
                  </div>

                  <FieldError message={errors.phoneNo} />
                </div>

                <div>
                  <label
                    htmlFor="nicNo"
                    className="mb-2 block text-[13px] font-medium text-[#475467]"
                  >
                    NIC / Passport Number{" "}
                    <span className="text-[#FF5A5F]">*</span>
                  </label>
                  <input
                    ref={nicNoRef}
                    id="nicNo"
                    name="nicNo"
                    type="text"
                    value={formData.nicNo}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder={
                      selectedCountryCode === "LK"
                        ? "200012345678 or 123456789V"
                        : "Enter passport or national ID number"
                    }
                    maxLength={20}
                    autoComplete="off"
                    className={getFieldClass("nicNo")}
                  />
                  <FieldError message={errors.nicNo} />
                </div>
              </div>
            </section>

            <section ref={fileSectionRef} className="mt-8">
              <SectionTitle>Identity Documents</SectionTitle>

              <div className="rounded-[12px] bg-[#DFF7F4] px-4 py-3 text-[12px] text-[#45646B]">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#19B5AE]" />
                  <p>
                    Your documents are encrypted and securely stored. All
                    information is kept confidential and used only for
                    verification purposes.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-[13px] font-medium text-[#475467]">
                  Government-issued ID (Passport / Driver&apos;s License){" "}
                  <span className="text-[#FF5A5F]">*</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={onDragEnter}
                  onDragLeave={onDragLeave}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  className={[
                    "cursor-pointer rounded-[14px] border border-dashed px-6 py-9 text-center transition",
                    rejectedFieldKeys.includes("idDocument")
                      ? "border-[#F59E0B] bg-[#FFFBEA]"
                      : isDragging
                      ? "border-[#19B5AE] bg-[#F0FBFA]"
                      : "border-[#D6D9DE] bg-white hover:bg-[#FAFAFA]",
                  ].join(" ")}
                >
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#D9DEE3] text-[#67728A]">
                    <Upload className="h-5 w-5" />
                  </div>

                  {idDocument ? (
                    <>
                      <p className="mt-3 text-[14px] font-medium text-[#344054]">
                        {idDocument.name}
                      </p>
                      <p className="mt-1 text-[12px] text-[#7B8794]">
                        Click to replace or drag and drop another file
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-3 text-[14px] font-medium text-[#344054]">
                        Click to upload or drag file
                      </p>
                      <p className="mt-2 text-[12px] text-[#8A94A6]">
                        Accepted formats: JPG, PNG, PDF • Max size: 10MB
                      </p>
                    </>
                  )}
                </div>

                <FieldError message={errors.idDocument} />
              </div>
            </section>

            <section className="mt-8">
              <SectionTitle>Payout Wallet</SectionTitle>

              <div className="rounded-[12px] bg-[#F7F8FA] px-4 py-4">
                <p className="text-[12px] text-[#7C8795]">
                  Connected Wallet Address
                </p>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="truncate text-[14px] font-medium text-[#4B5565]">
                    {formatWalletDisplay(walletAddress)}
                  </p>

                  <div className="flex items-center gap-2">
                    {walletCopied ? (
                      <span className="text-xs font-medium text-[#19B5AE]">
                        Copied!
                      </span>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleCopyWallet}
                      className="rounded-md p-1.5 text-[#19B5AE] transition hover:bg-[#E9F8F6]"
                      aria-label={
                        walletCopied
                          ? "Copied successfully"
                          : "Copy wallet address"
                      }
                      title={
                        walletCopied
                          ? "Copied successfully"
                          : "Copy wallet address"
                      }
                    >
                      {walletCopied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <p className="mt-2 text-[12px] text-[#97A0AC]">
                Earnings from recipe sales will be sent to this wallet address.
              </p>
            </section>

            <section ref={legalSectionRef} className="mt-8">
              <SectionTitle>Legal Agreement</SectionTitle>

              <div className="space-y-3">
                <label className="flex items-start gap-3 text-[14px] text-[#344054]">
                  <input
                    type="checkbox"
                    checked={formData.confirmAccuracy}
                    onChange={(e) =>
                      handleToggle("confirmAccuracy", e.target.checked)
                    }
                    className="mt-0.5 h-4 w-4 rounded border-[#C7CDD4] text-[#19B5AE] focus:ring-[#19B5AE]"
                  />
                  <span>
                    I confirm that all information provided is accurate and
                    truthful.
                  </span>
                </label>
                <FieldError message={errors.confirmAccuracy} />

                <label className="flex items-start gap-3 text-[14px] text-[#344054]">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) =>
                      handleToggle("agreeTerms", e.target.checked)
                    }
                    className="mt-0.5 h-4 w-4 rounded border-[#C7CDD4] text-[#19B5AE] focus:ring-[#19B5AE]"
                  />
                  <span>
                    I agree to RecipeChain&apos;s{" "}
                    <a
                      href="/terms"
                      className="font-medium text-[#19B5AE] underline underline-offset-2"
                    >
                      Seller Terms
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      className="font-medium text-[#19B5AE] underline underline-offset-2"
                    >
                      Compliance Policy
                    </a>
                    .
                  </span>
                </label>
                <FieldError message={errors.agreeTerms} />
              </div>
            </section>

            <div className="mt-8 rounded-[12px] border-l-4 border-[#F5A524] bg-[#FFF5D7] px-4 py-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#F5A524]" />
                <div>
                  <p className="text-[14px] font-semibold text-[#6B5600]">
                    Review Notice
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-[#8A6B00]">
                    Your seller account will remain under review until approved.
                    This process typically takes 24-48 hours. You will receive
                    an email notification once your verification is complete.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-[48px] w-full items-center justify-center rounded-[12px] bg-[#8BD6CF] px-4 text-[14px] font-semibold text-white transition hover:bg-[#76CBC3] disabled:cursor-not-allowed disabled:opacity-80"
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

              <p className="mt-3 text-center text-[12px] text-[#98A2B3]">
                You will be notified once your verification is approved.
              </p>
            </div>

            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 text-[13px] font-medium text-[#6B7280] transition hover:text-[#374151]"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </form>
        </div>
      </main>

      <SubmittedDetailsModal
        open={showSubmittedDetails}
        onClose={() => setShowSubmittedDetails(false)}
        submittedAt={kycStatus?.verification_submitted_at}
        details={submittedDetails}
      />
    </div>
  );
}