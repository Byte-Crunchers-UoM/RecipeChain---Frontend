"use client";

type Props = {
  confirmAccuracy: boolean;
  agreeTerms: boolean;
  errors: Record<string, string>;
  onToggleAction: (
    field: "confirmAccuracy" | "agreeTerms",
    value: boolean
  ) => void;
};

export default function LegalAgreementSection({
  confirmAccuracy,
  agreeTerms,
  errors,
  onToggleAction,
}: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={confirmAccuracy}
            onChange={(e) =>
              onToggleAction("confirmAccuracy", e.target.checked)
            }
            className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />

          <span className="text-sm text-slate-700">
            I confirm that all information provided is accurate and truthful.
          </span>
        </label>

        {errors.confirmAccuracy ? (
          <p className="mt-1 text-sm text-red-600">
            {errors.confirmAccuracy}
          </p>
        ) : null}
      </div>

      <div>
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => onToggleAction("agreeTerms", e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />

          <span className="text-sm text-slate-700">
            I agree to RecipeChain&apos;s{" "}
            <a
              href="/terms"
              className="font-medium text-teal-600 hover:underline"
            >
              Seller Terms
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="font-medium text-teal-600 hover:underline"
            >
              Compliance Policy
            </a>
            .
          </span>
        </label>

        {errors.agreeTerms ? (
          <p className="mt-1 text-sm text-red-600">{errors.agreeTerms}</p>
        ) : null}
      </div>
    </div>
  );
}