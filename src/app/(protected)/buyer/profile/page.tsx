"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  DollarSign,
  ShoppingBag,
  Heart,
  TrendingUp,
  Pencil,
  Copy,
  Shield,
  Mail,
  Bell,
  Trash2,
  ExternalLink,
  Upload,
  X,
  CheckCircle2,
} from "lucide-react";

type ActivityItem = {
  id: string;
  title: string;
  date: string;
  amount: string;
  type: "Purchase" | "Sale";
  status: "Completed" | "Pending";
};

type Achievement = {
  id: string;
  title: string;
  subtitle: string;
  icon: "star" | "zap" | "trophy" | "users";
  earned?: boolean;
};

export default function BuyerProfilePage() {
  // Normally these come from your AuthContext + backend
  const [profile, setProfile] = useState({
    displayName: "Ashcharya Arts",
    username: "ashcharya_arts",
    email: "ashcharya@example.com",
    verified: true,
    country: "United States",
    timezone: "Pacific Time (PT)",
    currency: "USD ($)",
    bio:
      "Passionate about exploring new recipes and sharing culinary experiences on Web3....",
    memberSince: "2024",
    tags: ["User", "Top Buyer"],
    wallet: "0x1234...5678",
    networks: ["Ethereum Mainnet", "Polygon"],
    connectionStatus: "Wallet Connected",
    walletBalanceEth: "2.45 ETH",
    walletBalanceUsd: "$4,850.00",
  });

  // Stats cards
  const stats = useMemo(
    () => [
      {
        id: "spent",
        label: "Total Spent",
        value: "1.24 ETH",
        sub: "≈ $2,450",
        icon: DollarSign,
        color: "text-green-600",
        bg: "bg-green-50",
      },
      {
        id: "owned",
        label: "Recipes Owned",
        value: "23",
        sub: "+3 this month",
        icon: ShoppingBag,
        color: "text-blue-600",
        bg: "bg-blue-50",
      },
      {
        id: "fav",
        label: "Favorites",
        value: "47",
        sub: "Saved recipes",
        icon: Heart,
        color: "text-pink-600",
        bg: "bg-pink-50",
      },
      {
        id: "bal",
        label: "Balance",
        value: "0.36 ETH",
        sub: "≈ $712",
        icon: TrendingUp,
        color: "text-purple-600",
        bg: "bg-purple-50",
      },
    ],
    []
  );

  const activity: ActivityItem[] = [
    {
      id: "a1",
      title: "Spicy Thai Basil Chicken",
      date: "Jan 2, 2026",
      amount: "0.05 ETH",
      type: "Purchase",
      status: "Completed",
    },
    {
      id: "a2",
      title: "Chocolate Lava Cake Recipe",
      date: "Dec 28, 2025",
      amount: "0.12 ETH",
      type: "Sale",
      status: "Completed",
    },
    {
      id: "a3",
      title: "Homemade Ramen Bowl",
      date: "Dec 20, 2025",
      amount: "0.08 ETH",
      type: "Purchase",
      status: "Pending",
    },
  ];

  const achievements: Achievement[] = [
    { id: "ach1", title: "Top Buyer", subtitle: "Purchased 20+ recipes", icon: "star", earned: true },
    { id: "ach2", title: "Early Supporter", subtitle: "Joined in 2024", icon: "zap", earned: true },
    { id: "ach3", title: "Top Creator", subtitle: "Created 10+ recipes", icon: "trophy", earned: false },
    { id: "ach4", title: "Community Leader", subtitle: "Verified contributor", icon: "users", earned: false },
  ];

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Editable fields (modal state)
  const [editForm, setEditForm] = useState({
    displayName: profile.displayName,
    username: profile.username,
    bio: profile.bio,
  });

  useEffect(() => {
    // sync modal fields when profile changes or modal opens
    if (editOpen) {
      setEditForm({
        displayName: profile.displayName,
        username: profile.username,
        bio: profile.bio,
      });
    }
  }, [editOpen, profile]);

  // click outside closes modal
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!editOpen) return;
      const target = e.target as Node;
      if (modalRef.current && !modalRef.current.contains(target)) {
        setEditOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [editOpen]);

  const copyText = async (t: string) => {
    try {
      await navigator.clipboard.writeText(t);
    } catch {
      // ignore
    }
  };

  const saveProfile = () => {
    // ✅ UI fully functional: updates local page state (later call backend)
    setProfile((p) => ({
      ...p,
      displayName: editForm.displayName,
      username: editForm.username.replace("@", ""),
      bio: editForm.bio,
    }));
    setEditOpen(false);
  };

  const initials = (profile.displayName?.split(" ")?.map((w) => w[0])?.join("") || "AA").slice(0, 2).toUpperCase();

  return (
    <div className="max-w-[1100px]">
      <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                <Icon className={s.color} size={18} />
              </div>
              <div className="mt-3 text-xs text-gray-500">{s.label}</div>
              <div className="mt-1 text-lg font-semibold text-gray-900">{s.value}</div>
              <div className="mt-1 text-xs text-gray-400">{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Profile header card */}
      <div className="mt-5 bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-teal-600 text-white flex items-center justify-center text-xl font-bold">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-white rounded-full flex items-center justify-center border border-gray-200">
              <CheckCircle2 className="text-teal-600" size={16} />
            </div>
          </div>

          <div>
            <div className="font-semibold text-gray-900">{profile.displayName}</div>
            <div className="text-sm text-gray-500">
              Web3 food lover • Member since {profile.memberSince}
            </div>

            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {profile.tags.map((t) => (
                <span
                  key={t}
                  className={[
                    "px-3 py-1 rounded-full text-xs font-medium",
                    t === "Top Buyer" ? "bg-purple-50 text-purple-700" : "bg-teal-50 text-teal-700",
                  ].join(" ")}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setEditOpen(true)}
          className="rounded-xl bg-teal-600 text-white px-4 py-2 text-sm font-medium hover:bg-teal-700 transition flex items-center gap-2"
        >
          <Pencil size={16} />
          Edit Profile
        </button>
      </div>

      {/* Two-column cards */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Account Details */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
          <div className="text-sm font-semibold text-gray-900">Account Details</div>

          <div className="mt-4 space-y-4 text-sm">
            <Row label="Username" value={`@${profile.username}`} rightIcon={<CopyButton onClick={() => copyText(`@${profile.username}`)} />} />
            <Row
              label="Email Address"
              value={
                <span className="flex items-center gap-2">
                  {profile.email}
                  {profile.verified && (
                    <span className="flex items-center gap-1 text-xs text-teal-700">
                      <CheckCircle2 size={14} className="text-teal-600" />
                      Verified
                    </span>
                  )}
                </span>
              }
              rightIcon={<CopyButton onClick={() => copyText(profile.email)} />}
            />
            <Row label="Country" value={profile.country} />
            <Row label="Time Zone" value={profile.timezone} />
            <Row label="Preferred Currency" value={profile.currency} />
            <div>
              <div className="text-xs text-gray-500">Bio</div>
              <div className="mt-1 text-gray-900 leading-6">
                {profile.bio}{" "}
                <button className="text-teal-600 text-xs hover:underline">
                  View more ▾
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-400 flex items-center gap-2">
            <Shield size={14} className="text-gray-400" />
            Some details are synced from your Web3 login provider.
          </div>
        </div>

        {/* Wallet & Security */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
          <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Shield size={16} className="text-teal-600" />
            Wallet &amp; Security
          </div>

          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <div className="text-xs text-gray-500">Connected Wallet</div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="text-sm text-gray-900">{profile.wallet}</div>
              <CopyButton onClick={() => copyText(profile.wallet)} />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs text-gray-500">Network</div>
            <div className="mt-2 flex gap-2 flex-wrap">
              {profile.networks.map((n) => (
                <span key={n} className="px-3 py-1 rounded-full text-xs bg-purple-50 text-purple-700 border border-purple-100">
                  {n}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs text-gray-500">Connection Status</div>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-green-50 text-green-700 border border-green-100">
              <span className="h-2 w-2 rounded-full bg-green-600" />
              {profile.connectionStatus}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <button className="w-full rounded-xl bg-teal-600 text-white py-3 text-sm font-medium hover:bg-teal-700 transition">
              Navigate to Wallet
            </button>
            <button className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2">
              <ExternalLink size={16} />
              Manage Web3 Auth &amp; Devices
            </button>
          </div>

          <div className="mt-5 flex items-center justify-between text-sm">
            <div className="text-gray-500">Wallet Balance</div>
            <div className="text-gray-900 font-medium">{profile.walletBalanceEth}</div>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <div className="text-gray-500">≈ USD Value</div>
            <div className="text-gray-900 font-medium">{profile.walletBalanceUsd}</div>
          </div>
        </div>
      </div>

      {/* Security & Privacy + Activity */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Security & Privacy */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
          <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Shield size={16} className="text-teal-600" />
            Security &amp; Privacy
          </div>

          <div className="mt-4 space-y-3">
            <ActionRow
              icon={<Mail className="text-slate-600" size={18} />}
              title="Change Email"
              subtitle="Update your email address"
              action="Manage"
            />
            <ActionRow
              icon={<Bell className="text-slate-600" size={18} />}
              title="Notifications"
              subtitle="Manage email and push notifications"
              action="Configure"
            />
            <ActionRow
              danger
              icon={<Trash2 className="text-red-600" size={18} />}
              title="Delete Account"
              subtitle="Permanently delete your account"
              action="Request"
            />
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
          <div className="text-sm font-semibold text-gray-900">Activity</div>
          <div className="mt-2 text-xs text-gray-500">
            You have <span className="text-teal-700 font-medium">12 recipe purchases</span> and{" "}
            <span className="text-teal-700 font-medium">3 sales</span>
          </div>

          <div className="mt-4 space-y-3">
            {activity.map((a) => (
              <div key={a.id} className="border border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{a.title}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {a.date} • {a.amount} •{" "}
                    <span className={a.type === "Purchase" ? "text-blue-600" : "text-purple-600"}>
                      {a.type}
                    </span>
                  </div>
                </div>

                <span
                  className={[
                    "px-3 py-1 rounded-full text-xs font-medium border",
                    a.status === "Completed"
                      ? "bg-green-50 text-green-700 border-green-100"
                      : "bg-yellow-50 text-yellow-700 border-yellow-100",
                  ].join(" ")}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>

          <button className="mt-4 w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            View Transaction History →
          </button>
        </div>
      </div>

      {/* Achievements */}
      <div className="mt-5 lg:ml-[calc(50%+10px)]">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900">Achievements</div>
            <div className="text-xs text-gray-500">
              {achievements.filter((a) => a.earned).length} of {achievements.length} earned
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={[
                  "rounded-2xl border p-4",
                  a.earned ? "border-teal-200 bg-teal-50" : "border-gray-200 bg-white",
                ].join(" ")}
              >
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                    <span className="text-sm">{iconFor(a.icon)}</span>
                  </div>
                  {a.earned && (
                    <span className="h-6 w-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs">
                      ✓
                    </span>
                  )}
                </div>
                <div className="mt-3 text-sm font-semibold text-gray-900">{a.title}</div>
                <div className="mt-1 text-xs text-gray-500">{a.subtitle}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4">
          <div
            ref={modalRef}
            className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
              <div className="text-xl font-semibold text-gray-900">Edit Profile</div>
              <button
                onClick={() => setEditOpen(false)}
                className="h-10 w-10 rounded-xl hover:bg-gray-50 flex items-center justify-center"
                aria-label="Close"
              >
                <X className="text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="px-4 py-4">
              <div className="text-base font-medium text-gray-900">Profile Picture</div>

              <div className="mt-5 flex items-center gap-6">
                <div className="h-10 w-10 rounded-full bg-teal-600 text-white flex items-center justify-center text-xl font-bold">
                  {initials}
                </div>

                <button className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 transition flex items-center gap-2">
                  <Upload size={18} />
                  Upload New Photo
                </button>
              </div>

              <div className="mt-8 space-y-6">
                <Field
                  label="Display Name"
                  value={editForm.displayName}
                  onChange={(v) => setEditForm((s) => ({ ...s, displayName: v }))}
                />
                <Field
                  label="Username"
                  value={`@${editForm.username.replace("@", "")}`}
                  onChange={(v) =>
                    setEditForm((s) => ({
                      ...s,
                      username: v.replace("@", ""),
                    }))
                  }
                />
                <TextArea
                  label="Bio"
                  value={editForm.bio}
                  onChange={(v) => setEditForm((s) => ({ ...s, bio: v }))}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                className="rounded-xl bg-teal-600 text-white px-8 py-3 text-sm font-medium hover:bg-teal-700 transition shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Small Components ---------- */

function Row({
  label,
  value,
  rightIcon,
}: {
  label: string;
  value: any;
  rightIcon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="mt-1 text-gray-900">{value}</div>
      </div>
      {rightIcon ? <div className="mt-5">{rightIcon}</div> : null}
    </div>
  );
}

function CopyButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-9 w-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition flex items-center justify-center"
      aria-label="Copy"
      type="button"
    >
      <Copy size={16} className="text-gray-600" />
    </button>
  );
}

function ActionRow({
  icon,
  title,
  subtitle,
  action,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action: string;
  danger?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border p-4 flex items-center justify-between gap-4",
        danger ? "border-red-200 bg-red-50/40" : "border-gray-200 bg-white",
      ].join(" ")}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
          {icon}
        </div>
        <div className="min-w-0">
          <div className={["text-sm font-semibold truncate", danger ? "text-red-700" : "text-gray-900"].join(" ")}>
            {title}
          </div>
          <div className="text-xs text-gray-500 truncate">{subtitle}</div>
        </div>
      </div>

      <button
        className={[
          "text-sm font-medium",
          danger ? "text-red-600 hover:underline" : "text-teal-600 hover:underline",
        ].join(" ")}
      >
        {action} →
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-800">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-2xl border border-gray-200 px-5 py-4 outline-none focus:ring-2 focus:ring-teal-200"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-sm font-medium text-gray-800">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full min-h-[140px] rounded-2xl border border-gray-200 px-5 py-4 outline-none focus:ring-2 focus:ring-teal-200"
      />
    </div>
  );
}

function iconFor(k: Achievement["icon"]) {
  if (k === "star") return "⭐";
  if (k === "zap") return "⚡";
  if (k === "trophy") return "🏆";
  return "👥";
}