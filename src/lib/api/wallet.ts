import type { WalletOverview, WalletTransaction } from "@/types/wallet";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type ApiMessageResponse = {
  ok?: boolean;
  success?: boolean;
  message?: string;
  error?: string;
};

type WalletOverviewResponse = ApiMessageResponse & {
  wallet?: WalletOverview;
};

type WalletTransactionsResponse = ApiMessageResponse & {
  transactions?: WalletTransaction[];
};

type StripeTopupCheckoutResponse = ApiMessageResponse & {
  sessionId: string;
  url: string;
};

export type BuyRecipeResponse = ApiMessageResponse & {
  paymentId?: string | number;
  recipeId?: string | number;
  payment?: {
    id?: string | number;
    payment_id?: string | number;
    recipe_title?: string;
    amount?: number | string;
  };
  recipe?: {
    id?: string | number;
    title?: string;
    price?: number | string;
  };
};

type WithdrawalRequestResponse = ApiMessageResponse & {
  withdrawalId?: string | number;
};

type RefundRequestResponse = ApiMessageResponse & {
  refundId?: string | number;
};

async function parseJson<T>(resp: Response): Promise<T> {
  const text = await resp.text();

  let data: any = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!resp.ok) {
        throw new Error(`Server returned non-JSON response. Status: ${resp.status}`);
      }

      throw new Error("Server returned an invalid JSON response");
    }
  }

  if (!resp.ok) {
    throw new Error(data?.message || data?.error || "Request failed");
  }

  return data as T;
}

export async function getMyWalletOverview(): Promise<WalletOverview> {
  const resp = await fetch(`${API_BASE}/wallet/me`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const data = await parseJson<WalletOverviewResponse>(resp);

  if (!data?.wallet) {
    throw new Error("Wallet overview was not returned by the server");
  }

  return data.wallet;
}

export async function getMyWalletTransactions(): Promise<WalletTransaction[]> {
  const resp = await fetch(`${API_BASE}/wallet/transactions`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  const data = await parseJson<WalletTransactionsResponse>(resp);

  return data.transactions || [];
}

export async function createStripeTopupCheckoutSession(payload: {
  amount: number;
}): Promise<StripeTopupCheckoutResponse> {
  const resp = await fetch(`${API_BASE}/wallet/topup/checkout-session`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await parseJson<StripeTopupCheckoutResponse>(resp);

  if (!data?.url) {
    throw new Error("Stripe checkout URL was not returned");
  }

  return data;
}

export async function buyRecipeWithWalletBalance(
  recipeId: string
): Promise<BuyRecipeResponse> {
  const resp = await fetch(`${API_BASE}/wallet/buy`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipeId }),
  });

  return parseJson<BuyRecipeResponse>(resp);
}

export async function createWithdrawalRequest(payload: {
  amount: number;
  destinationWallet: string;
  note?: string;
}): Promise<WithdrawalRequestResponse> {
  const resp = await fetch(`${API_BASE}/wallet/withdrawals`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseJson<WithdrawalRequestResponse>(resp);
}

export async function createRefundRequest(payload: {
  paymentId: string;
  reason?: string;
}): Promise<RefundRequestResponse> {
  const resp = await fetch(`${API_BASE}/wallet/refunds`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseJson<RefundRequestResponse>(resp);
}