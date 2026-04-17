"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import EditProfileModal from "@/components/buyer/EditProfileModal";
import {
  deleteMyAccountPermanently,
  getMyBuyerProfile,
  updateMyBuyerProfile,
} from "@/lib/api/buyer";
import type { BuyerProfile } from "@/types/buyer";
import { useAuth } from "@/context/AuthContext";

const XRPL_EXPLORER_BASE =
  process.env.NEXT_PUBLIC_XRPL_EXPLORER_BASE_URL || "";

function formatJoinedYear(dateString?: string) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Recently";
  return String(date.getFullYear());
}

function formatWallet(wallet?: string) {
  if (!wallet) return "Not connected";
  if (wallet.length <= 12) return wallet;
  return `${wallet.slice(0, 8)}...${wallet.slice(-6)}`;
}

function getWalletExplorerUrl(wallet?: string) {
  if (!wallet || !XRPL_EXPLORER_BASE) return "";
  return `${XRPL_EXPLORER_BASE.replace(/\/$/, "")}/${wallet}`;
}

function getInitials(name?: string, email?: string) {
  const source = String(name || email || "U").trim();
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function BuyerProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { resetAll } = useAuth();

  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const shouldAutoOpenEdit = searchParams.get("edit") === "1";

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getMyBuyerProfile();
        if (active) setProfile(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load profile");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loading && profile && shouldAutoOpenEdit) {
      setModalOpen(true);
    }
  }, [loading, profile, shouldAutoOpenEdit]);

  const initials = useMemo(() => {
    return getInitials(profile?.display_name, profile?.email);
  }, [profile?.display_name, profile?.email]);

  const earnedBadges =
    profile?.badges?.filter((badge) => badge.earned).length || 0;

  const walletExplorerUrl = getWalletExplorerUrl(profile?.wallet_address);
  const recentActivity = profile?.recent_activity || [];
  const badges = profile?.badges || [];

  const closeModal = () => {
    setModalOpen(false);

    if (shouldAutoOpenEdit) {
      router.replace(pathname, { scroll: false });
    }
  };

  const handleSave = async (payload: {
    displayName: string;
    bio: string;
    profilePhoto?: File | null;
  }) => {
    try {
      setSaving(true);
      const updated = await updateMyBuyerProfile(payload);
      setProfile(updated);
      window.dispatchEvent(new Event("buyer-profile-updated"));
      closeModal();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyWallet = async () => {
    if (!profile?.wallet_address) return;

    try {
      await navigator.clipboard.writeText(profile.wallet_address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      alert("Failed to copy wallet address");
    }
  };

  const handlePermanentDelete = async () => {
    const confirmed = window.confirm(
      "This will permanently delete your buyer account and related buyer data. This action cannot be undone. Do you want to continue?"
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(true);
      const result = await deleteMyAccountPermanently();
      alert(result?.message || "Account deleted permanently.");
      await resetAll();
      router.replace("/signup");
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to delete account permanently"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-base text-slate-600">
        Loading buyer profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-600">
          Buyer profile not found.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Spent"
          value={`${profile.total_spent_xrp.toFixed(2)} XRP`}
          sub={`${profile.total_purchases} purchases`}
        />
        <StatCard
          label="Recipes Owned"
          value={String(profile.total_purchases)}
          sub={`${profile.saved_recipes_count} saved`}
        />
        <StatCard
          label="Reviews Given"
          value={String(profile.feedback_count)}
          sub="Community activity"
        />
        <StatCard
          label="Balance"
          value={`${profile.account_balance.toFixed(2)} XRP`}
          sub="XRPL wallet balance"
        />
      </div>

      <div className="rounded-3xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {profile.profile_picture ? (
              <img
                src={profile.profile_picture}
                alt={profile.display_name || profile.email}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-500 text-3xl font-bold text-white">
                {initials}
              </div>
            )}

            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                {profile.display_name || profile.email}
              </h2>
              <p className="text-slate-500">
                XRPL buyer • Member since {formatJoinedYear(profile.joined_at)}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                  Buyer
                </span>
                {profile.total_purchases >= 10 ? (
                  <span className="rounded-full bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700">
                    Top Buyer
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="rounded-2xl bg-teal-600 px-5 py-3 text-white hover:bg-teal-700"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        <div className="space-y-5">
          <SectionCard title="Account Details">
            <DetailRow
              label="Display Name"
              value={profile.display_name || profile.email}
            />
            <DetailRow label="Email Address" value={profile.email || "-"} />
            <DetailRow
              label="Wallet Address"
              value={formatWallet(profile.wallet_address)}
            />
            <DetailRow label="Preferred Network" value="XRPL" />
            <DetailRow
              label="Bio"
              value={profile.bio || "No bio added yet"}
              multiline
            />
          </SectionCard>

          <SectionCard title="Wallet & Security">
            <DetailRow
              label="Connected Wallet"
              value={formatWallet(profile.wallet_address)}
            />
            <DetailRow label="Network" value="XRP Ledger (XRPL)" />
            <DetailRow
              label="Connection Status"
              value={profile.wallet_address ? "Wallet Connected" : "Not Connected"}
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleCopyWallet}
                disabled={!profile.wallet_address}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? "Copied" : "Copy Wallet Address"}
              </button>

              {walletExplorerUrl ? (
                <a
                  href={walletExplorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Open in Explorer
                </a>
              ) : (
                <div className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm text-slate-400">
                  Explorer URL not configured
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Security & Privacy">
            <DetailRow label="Email" value={profile.email || "-"} />
            <DetailRow label="Role" value={profile.role || "buyer"} />

            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">
                Permanently delete this account and related buyer data.
              </p>
              <button
                type="button"
                onClick={handlePermanentDelete}
                disabled={deleteLoading}
                className="mt-3 rounded-2xl bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleteLoading ? "Deleting..." : "Delete Account Permanently"}
              </button>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-5">
          <SectionCard title="Activity">
            <div className="mb-4 text-sm text-slate-500">
              You have {profile.total_purchases} purchases and {profile.feedback_count} reviews.
            </div>

            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-slate-500">No recent buyer activity yet.</p>
              ) : (
                recentActivity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{item.title}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(item.date).toLocaleDateString()} •{" "}
                        {item.amount_xrp.toFixed(2)} XRP • Purchase
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-sm ${
                        item.status === "completed"
                          ? "bg-green-50 text-green-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title={`Achievements (${earnedBadges} earned)`}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {badges.map((badge) => (
                <div
                  key={badge.key}
                  className={`rounded-2xl border p-4 ${
                    badge.earned
                      ? "border-teal-500 bg-teal-50"
                      : "border-slate-200 bg-slate-50 opacity-70"
                  }`}
                >
                  <p className="font-semibold text-slate-800">{badge.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {badge.description}
                  </p>
                  <p
                    className={`mt-3 text-sm font-medium ${
                      badge.earned ? "text-teal-700" : "text-slate-400"
                    }`}
                  >
                    {badge.earned ? "Earned" : "Locked"}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <EditProfileModal
        open={modalOpen}
        profile={profile}
        isSaving={saving}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-3xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{sub}</p>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-xl font-semibold text-slate-900">{title}</h3>
      {children}
    </div>
  );
}

function DetailRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="mb-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-slate-800 ${multiline ? "whitespace-pre-wrap" : ""}`}>
        {value}
      </p>
    </div>
  );
}