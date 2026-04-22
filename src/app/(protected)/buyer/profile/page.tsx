"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DollarSign,
  BookOpen,
  Star,
  Wallet,
  Copy,
  Check,
  PencilLine,
  Shield,
  Activity,
  Trophy,
  Trash2,
  PlusCircle,
  ArrowUpRight,
} from "lucide-react";
import EditProfileModal from "@/components/buyer/EditProfileModal";
import WalletTopUpModal from "@/components/buyer/WalletTopUpModal";
import WalletWithdrawModal from "@/components/buyer/WalletWithdrawModal";
import WalletTransactionHistory from "@/components/buyer/WalletTransactionHistory";
import {
  deleteMyAccountPermanently,
  getMyBuyerProfile,
  updateMyBuyerProfile,
} from "@/lib/api/buyer";
import { getMyWalletOverview } from "@/lib/api/wallet";
import type { BuyerProfile } from "@/types/buyer";
import type { WalletOverview } from "@/types/wallet";
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
  if (wallet.length <= 18) return wallet;
  return `${wallet.slice(0, 7)}...${wallet.slice(-5)}`;
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

function formatDate(dateString?: string) {
  if (!dateString) return "Recent";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Recent";
  return date.toLocaleDateString();
}

function StatCard({
  iconWrapClassName,
  icon,
  label,
  value,
  subtext,
}: {
  iconWrapClassName: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`mb-4 inline-flex rounded-2xl p-3 shadow-sm ${iconWrapClassName}`}
      >
        {icon}
      </div>
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-2 text-[17px] font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{subtext}</p>
    </div>
  );
}

function ProgressBar({ value, target }: { value?: number; target?: number }) {
  const percentage =
    target && target > 0
      ? Math.min((Number(value || 0) / target) * 100, 100)
      : 0;

  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-teal-500 transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function BuyerProfileContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { resetAll } = useAuth();

  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [walletData, setWalletData] = useState<WalletOverview | null>(null);

  const [loading, setLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const shouldAutoOpenEdit = searchParams.get("edit") === "1";

  const loadWallet = async () => {
    try {
      setWalletLoading(true);
      const data = await getMyWalletOverview();
      setWalletData(data);
    } catch (err) {
      console.error("Failed to load wallet overview:", err);
      setWalletData(null);
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [profileData, walletOverview] = await Promise.all([
          getMyBuyerProfile(),
          getMyWalletOverview().catch(() => null),
        ]);

        if (!active) return;

        setProfile(profileData);
        setWalletData(walletOverview);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Failed to load profile"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
          setWalletLoading(false);
        }
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
    } else if (!shouldAutoOpenEdit) {
      setModalOpen(false);
    }
  }, [loading, profile, shouldAutoOpenEdit]);

useEffect(() => {
  const topupStatus = searchParams.get("topup");

  if (topupStatus === "cancelled") {
    router.replace(pathname, { scroll: false });
    return;
  }

  if (topupStatus !== "success") {
    return;
  }

  let cancelled = false;

  const refreshAfterTopup = async () => {
    const currentBalance = Number(
      walletData?.account_balance ?? profile?.account_balance ?? 0
    );

    for (let attempt = 0; attempt < 6; attempt += 1) {
      if (cancelled) return;

      try {
        const latestWallet = await getMyWalletOverview();

        if (cancelled) return;

        setWalletData(latestWallet);

        if (Number(latestWallet.account_balance || 0) > currentBalance) {
          router.replace(pathname, { scroll: false });
          return;
        }
      } catch (error) {
        console.error("Top-up refresh failed:", error);
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    router.replace(pathname, { scroll: false });
  };

  void refreshAfterTopup();

  return () => {
    cancelled = true;
  };
}, [searchParams, router, pathname, walletData, profile]);

  const initials = useMemo(() => {
    return getInitials(profile?.display_name, profile?.email);
  }, [profile?.display_name, profile?.email]);

  const effectiveWalletAddress =
    walletData?.wallet_address || profile?.wallet_address || "";
  const walletExplorerUrl = getWalletExplorerUrl(effectiveWalletAddress);
  const recentActivity = profile?.recent_activity || [];
  const badges = profile?.badges || [];
  const earnedBadges = badges.filter((badge) => badge.earned).length;
  const effectiveBalance = Number(
    walletData?.account_balance ?? profile?.account_balance ?? 0
  );

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
      throw err instanceof Error ? err : new Error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyWallet = async () => {
    if (!effectiveWalletAddress) return;

    try {
      await navigator.clipboard.writeText(effectiveWalletAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      alert("Failed to copy wallet address");
    }
  };

  const handlePermanentDelete = async () => {
    if (deleteConfirmText !== "DELETE") {
      alert('Type DELETE to confirm permanent account deletion.');
      return;
    }

    try {
      setDeleteLoading(true);
      await deleteMyAccountPermanently();
      await resetAll();
      router.replace("/signup");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700">
        {error || "Profile not found."}
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-[1320px] space-y-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            iconWrapClassName="bg-green-50"
            icon={
              <DollarSign
                className="h-5 w-5 text-green-600"
                strokeWidth={2.4}
              />
            }
            label="Total Spent"
            value={`${Number(profile.total_spent_xrp || 0).toFixed(2)} XRP`}
            subtext={`${profile.total_purchases || 0} purchases`}
          />
          <StatCard
            iconWrapClassName="bg-blue-50"
            icon={
              <BookOpen className="h-5 w-5 text-blue-600" strokeWidth={2.4} />
            }
            label="Recipes Owned"
            value={String(profile.total_purchases || 0)}
            subtext={`${profile.saved_recipes_count || 0} saved`}
          />
          <StatCard
            iconWrapClassName="bg-amber-50"
            icon={<Star className="h-5 w-5 text-amber-500" strokeWidth={2.4} />}
            label="Reviews Given"
            value={String(profile.feedback_count || 0)}
            subtext="Community activity"
          />
          <StatCard
            iconWrapClassName="bg-purple-50"
            icon={
              <Wallet className="h-5 w-5 text-purple-600" strokeWidth={2.4} />
            }
            label="Balance"
            value={`${effectiveBalance.toFixed(2)} XRP`}
            subtext={walletLoading ? "Loading wallet..." : "RecipeChain wallet balance"}
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {profile.profile_picture ? (
                <img
                  src={profile.profile_picture}
                  alt={profile.display_name || profile.email}
                  className="h-[76px] w-[76px] rounded-full object-cover shadow-md ring-4 ring-slate-50"
                />
              ) : (
                <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-teal-500 text-2xl font-bold text-white shadow-md">
                  {initials}
                </div>
              )}

              <div className="min-w-0">
                <h1 className="truncate text-[18px] font-semibold text-slate-900">
                  {profile.display_name}
                </h1>
                <p className="mt-1 text-[15px] text-slate-500">
                  XRPL buyer • Member since {formatJoinedYear(profile.joined_at)}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700">
                    Buyer
                  </span>
                  {profile.total_purchases >= 10 ? (
                    <span className="rounded-full bg-fuchsia-50 px-3 py-1 text-sm font-medium text-fuchsia-700">
                      Top Buyer
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 md:self-center"
            >
              <PencilLine className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-[17px] font-semibold text-slate-900">
                Account Details
              </h2>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div className="min-w-0">
                  <p className="text-sm text-slate-500">Display Name</p>
                  <p className="mt-2 break-words text-[15px] font-semibold text-slate-900">
                    {profile.display_name}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-slate-500">Email Address</p>
                  <p className="mt-2 break-all text-[15px] font-semibold text-slate-900">
                    {profile.email}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-slate-500">Wallet Address</p>
                  <p className="mt-2 break-all text-[15px] font-semibold text-slate-900">
                    {formatWallet(effectiveWalletAddress)}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-slate-500">Preferred Network</p>
                  <p className="mt-2 text-[15px] font-semibold text-slate-900">
                    XRPL Testnet
                  </p>
                </div>

                <div className="min-w-0 md:col-span-2">
                  <p className="text-sm text-slate-500">Bio</p>
                  <p className="mt-2 break-words text-[15px] leading-7 text-slate-900">
                    {profile.bio?.trim() || "No bio added yet"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-teal-600" />
                <h2 className="text-[17px] font-semibold text-slate-900">
                  Wallet & Security
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Connected Wallet</p>
                  <p className="mt-2 break-all text-[15px] font-semibold text-slate-900">
                    {formatWallet(effectiveWalletAddress)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Network</p>
                  <p className="mt-2 text-[15px] font-semibold text-slate-900">
                    XRP Ledger (XRPL) Testnet
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Connection Status</p>
                  <span className="mt-2 inline-flex rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
                    Wallet Connected
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">RecipeChain Balance</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {effectiveBalance.toFixed(2)} XRP
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Use this balance to buy recipes instantly.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleCopyWallet}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-slate-500" />
                        Copy Wallet Address
                      </>
                    )}
                  </button>

                  {walletExplorerUrl ? (
                    <a
                      href={walletExplorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
                    >
                      View on Explorer
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-400"
                    >
                      Explorer URL not configured
                    </button>
                  )}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setTopUpOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Top Up Wallet
                  </button>

                  <button
                    type="button"
                    onClick={() => setWithdrawOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    Withdraw Balance
                  </button>
                </div>
              </div>
            </section>

            <WalletTransactionHistory
              transactions={walletData?.recent_transactions || []}
            />

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-teal-600" />
                <h2 className="text-[17px] font-semibold text-slate-900">
                  Activity
                </h2>
              </div>

              <p className="mt-4 text-[15px] text-slate-500">
                You have {profile.total_purchases || 0} purchases and{" "}
                {profile.feedback_count || 0} reviews.
              </p>

              {recentActivity.length === 0 ? (
                <div className="mt-5 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5">
                  <p className="text-[16px] font-medium text-slate-800">
                    No recent buyer activity yet.
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Start exploring recipes and your purchases will appear here.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {recentActivity.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-semibold text-slate-900">
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatDate(item.date)} •{" "}
                            {Number(item.amount_xrp || 0).toFixed(2)} XRP
                          </p>
                        </div>

                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs font-medium",
                            item.status === "completed"
                              ? "bg-green-50 text-green-700"
                              : item.status === "pending"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-600",
                          ].join(" ")}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-teal-600" />
                  <h2 className="text-[17px] font-semibold text-slate-900">
                    Achievements
                  </h2>
                </div>
                <p className="text-sm text-slate-500">
                  {earnedBadges} of {badges.length} earned
                </p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                {badges.map((badge) => (
                  <div
                    key={badge.key}
                    className={[
                      "rounded-2xl border p-4",
                      badge.earned
                        ? "border-teal-300 bg-teal-50"
                        : "border-slate-200 bg-slate-50",
                    ].join(" ")}
                  >
                    <p
                      className={[
                        "text-[16px] font-semibold",
                        badge.earned ? "text-slate-900" : "text-slate-700",
                      ].join(" ")}
                    >
                      {badge.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {badge.description}
                    </p>

                    {!badge.earned ? (
                      <>
                        <ProgressBar
                          value={badge.progress}
                          target={badge.target}
                        />
                        <p className="mt-2 text-xs font-medium text-slate-400">
                          {badge.progress || 0}/{badge.target || 0}
                        </p>
                      </>
                    ) : (
                      <p className="mt-3 text-sm font-medium text-teal-700">
                        Earned
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                <h2 className="text-[17px] font-semibold text-slate-900">
                  Security & Privacy
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="mt-2 break-all text-[15px] font-semibold text-slate-900">
                    {profile.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Role</p>
                  <p className="mt-2 text-[15px] font-semibold text-slate-900">
                    {profile.role || "buyer"}
                  </p>
                </div>

                <div className="rounded-3xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-700">
                    Permanently delete this account and related buyer data.
                  </p>
                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-red-700">
                      Type DELETE to confirm
                    </label>
                    <input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="DELETE"
                      className="w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handlePermanentDelete}
                    disabled={deleteLoading}
                    className="mt-4 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                  >
                    {deleteLoading
                      ? "Deleting..."
                      : "Delete Account Permanently"}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <EditProfileModal
        open={modalOpen}
        profile={profile}
        isSaving={saving}
        onCloseAction={closeModal}
        onSaveAction={handleSave}
      />

      <WalletTopUpModal
        open={topUpOpen}
        onCloseAction={() => setTopUpOpen(false)}
        onSuccessAction={loadWallet}
      />

      <WalletWithdrawModal
        open={withdrawOpen}
        onCloseAction={() => setWithdrawOpen(false)}
        onSuccessAction={loadWallet}
      />
    </>
  );
}

export default function BuyerProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600" />
        </div>
      }
    >
      <BuyerProfileContent />
    </Suspense>
  );
}