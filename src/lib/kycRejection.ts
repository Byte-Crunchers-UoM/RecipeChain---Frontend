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

const DEFAULT_SUMMARY =
  "Your verification did not meet the requirements. Please review the items below and resubmit corrected information.";

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
    const parsed = JSON.parse(rawReason);

    const summary =
      typeof parsed?.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim()
        : DEFAULT_SUMMARY;

    const items = Array.isArray(parsed?.items)
      ? parsed.items
          .filter(Boolean)
          .map((item: any) => ({
            field: item.field as SellerKycFieldKey,
            label:
              typeof item.label === "string" && item.label.trim()
                ? item.label.trim()
                : "Verification item",
            status:
              typeof item.status === "string" ? item.status : "other",
            message:
              typeof item.message === "string" && item.message.trim()
                ? item.message.trim()
                : "Please review and update this item.",
          }))
          .filter((item: any) => !!item.field)
      : [];

    return { summary, items };
  } catch {
    return {
      summary: rawReason.trim(),
      items: [],
    };
  }
}