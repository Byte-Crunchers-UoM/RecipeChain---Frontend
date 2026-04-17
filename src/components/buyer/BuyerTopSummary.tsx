"use client";

type Props = {
  displayName?: string;
  email?: string;
  profilePicture?: string;
  onShowProfile?: () => void;
};

function getInitials(name?: string, email?: string) {
  const source = String(name || email || "U").trim();
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function BuyerTopSummary({
  displayName,
  email,
  profilePicture,
  onShowProfile,
}: Props) {
  const initials = getInitials(displayName, email);

  return (
    <div className="w-[360px] rounded-[28px] bg-white p-5 shadow-xl">
      <div className="flex items-start gap-4">
        {profilePicture ? (
          <img
            src={profilePicture}
            alt={displayName || email || "Buyer"}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-xl font-bold text-white">
            {initials}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-2xl font-semibold text-slate-900">
            {displayName || email || "Buyer"}
          </p>
          <p className="truncate text-base text-slate-500">{email || "-"}</p>
          <p className="mt-1 text-base text-slate-400">
            XRPL buyer • Recipe collector
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onShowProfile}
        className="mt-5 w-full rounded-2xl bg-teal-600 px-4 py-3 text-lg font-semibold text-white hover:bg-teal-700"
      >
        Show Profile
      </button>
    </div>
  );
}