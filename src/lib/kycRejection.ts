export type SellerKycFieldKey =
  | "fullName"
  | "dateOfBirth"
  | "nationality"
  | "address"
  | "phoneNo"
  | "nicNo"
  | "idDocumentFront"
  | "idDocumentBack"
  | "confirmAccuracy"
  | "agreeTerms";

export type RejectionItemStatus =
  | "missing"
  | "incorrect"
  | "expired"
  | "mismatch"
  | "blurred"
  | "other";

export type SellerKycRejectionItem = {
  field: SellerKycFieldKey;
  label: string;
  status?: RejectionItemStatus;
  message: string;
};

export type ParsedSellerKycRejection = {
  summary: string;
  items: SellerKycRejectionItem[];
};

type RawParsedItem = {
  field?: unknown;
  label?: unknown;
  status?: unknown;
  message?: unknown;
};

type RawParsedRejection = {
  summary?: unknown;
  items?: unknown;
};

const DEFAULT_SUMMARY =
  "Your verification did not meet the requirements. Please review the items below and resubmit corrected information.";

const VALID_FIELDS: SellerKycFieldKey[] = [
  "fullName",
  "dateOfBirth",
  "nationality",
  "address",
  "phoneNo",
  "nicNo",
  "idDocumentFront",
  "idDocumentBack",
  "confirmAccuracy",
  "agreeTerms",
];

const VALID_STATUSES: RejectionItemStatus[] = [
  "missing",
  "incorrect",
  "expired",
  "mismatch",
  "blurred",
  "other",
];

function isValidField(value: unknown): value is SellerKycFieldKey {
  return typeof value === "string" && VALID_FIELDS.includes(value as SellerKycFieldKey);
}

function isValidStatus(value: unknown): value is RejectionItemStatus {
  return (
    typeof value === "string" &&
    VALID_STATUSES.includes(value as RejectionItemStatus)
  );
}

export function parseSellerKycRejection(
  rawReason?: string | null
): ParsedSellerKycRejection {
  if (!rawReason?.trim()) {
    return {
      summary: DEFAULT_SUMMARY,
      items: [],
    };
  }

  try {
    const parsed = JSON.parse(rawReason) as RawParsedRejection;

    const summary =
      typeof parsed.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim()
        : DEFAULT_SUMMARY;

    const items = Array.isArray(parsed.items)
      ? parsed.items
          .filter((item): item is RawParsedItem => Boolean(item) && typeof item === "object")
          .map((item): SellerKycRejectionItem | null => {
            if (!isValidField(item.field)) {
              return null;
            }

            return {
              field: item.field,
              label:
                typeof item.label === "string" && item.label.trim()
                  ? item.label.trim()
                  : "Verification item",
              status: isValidStatus(item.status) ? item.status : "other",
              message:
                typeof item.message === "string" && item.message.trim()
                  ? item.message.trim()
                  : "Please review and update this item.",
            };
          })
          .filter((item): item is SellerKycRejectionItem => item !== null)
      : [];

    return { summary, items };
  } catch {
    return {
      summary: rawReason.trim(),
      items: [],
    };
  }
}