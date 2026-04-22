import type { WalletOverview, WalletTransaction } from "@/types/wallet";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function parseJson(resp: Response) {
  const data = await resp.json().catch(() => null);
  if (!resp.ok) {
    throw new Error(data?.message || "Request failed");
  }
  return data;
}

export async function getMyWalletOverview(): Promise<WalletOverview> {
  const resp = await fetch(`${API_BASE}/wallet/me`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const data = await parseJson(resp);
  return data.wallet;
}

export async function getMyWalletTransactions(): Promise<WalletTransaction[]> {
  const resp = await fetch(`${API_BASE}/wallet/transactions`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const data = await parseJson(resp);
  return data.transactions || [];
}

type StripeTopupCheckoutResponse = {
  ok: boolean;
  sessionId: string;
  url: string;
};

export async function createStripeTopupCheckoutSession(
  payload: { amount: number }
): Promise<StripeTopupCheckoutResponse> {
  const resp = await fetch(`${API_BASE}/wallet/topup/checkout-session`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseJson(resp);
}

export async function buyRecipeWithWalletBalance(recipeId: string) {
  const resp = await fetch(`${API_BASE}/wallet/buy`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipeId }),
  });

  return parseJson(resp);
}

export async function createWithdrawalRequest(payload: {
  amount: number;
  destinationWallet: string;
  note?: string;
}) {
  const resp = await fetch(`${API_BASE}/wallet/withdrawals`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseJson(resp);
}

export async function createRefundRequest(payload: {
  paymentId: string;
  reason?: string;
}) {
  const resp = await fetch(`${API_BASE}/wallet/refunds`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseJson(resp);
}