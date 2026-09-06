// src/lib/api/wallet.ts

import type {
  WalletOverview,
  WalletTransaction,
  XrpUsdRateQuote,
} from "@/lib/types/wallet";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

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

type XrpUsdRateResponse = ApiMessageResponse & {
  quote?: XrpUsdRateQuote;
};

type StripeTopupCheckoutResponse = ApiMessageResponse & {
  sessionId?: string;
  url?: string;
  quote?: XrpUsdRateQuote;
};

export type BuyRecipeResponse = ApiMessageResponse & {
  paymentId?: string | number;
  recipeId?: string | number;

  payment?: {
    id?: string | number;
    payment_id?: string | number;
    recipe_id?: string | number;
    recipe_title?: string;
    amount?: number | string;
    status?: string;
  };

  recipe?: {
    id?: string | number;
    recipe_id?: string | number;
    title?: string;
    price?: number | string;
  };

  newBalance?: number | string;
  commissionAmount?: number | string;
  sellerAmount?: number | string;
};

type WithdrawalRequestResponse = ApiMessageResponse & {
  request?: unknown;
  withdrawalId?: string | number;
};

type RefundRequestResponse = ApiMessageResponse & {
  request?: unknown;
  refundId?: string | number;
};

async function parseJson<T>(resp: Response): Promise<T> {
  const text = await resp.text();

  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!resp.ok) {
        throw new Error(
          `Server returned non-JSON response. Status: ${resp.status}`
        );
      }

      throw new Error("Server returned an invalid JSON response");
    }
  }

  if (!resp.ok) {
    const errorData = data as ApiMessageResponse | null;

    throw new Error(
      errorData?.message || errorData?.error || "Request failed"
    );
  }

  return data as T;
}

export async function getMyWalletOverview(): Promise<WalletOverview> {
  const resp = await fetch(`${API_BASE}/wallet/me`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
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
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await parseJson<WalletTransactionsResponse>(resp);

  return data.transactions || [];
}

export async function getXrpUsdRate(): Promise<XrpUsdRateQuote> {
  const resp = await fetch(`${API_BASE}/wallet/xrp-rate`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await parseJson<XrpUsdRateResponse>(resp);

  if (!data?.quote?.xrpUsdRate) {
    throw new Error("XRP/USD rate was not returned by the server");
  }

  return data.quote;
}

/**
 * New top-up flow:
 * Frontend sends XRP amount.
 * Backend gets live XRP/USD rate.
 * Backend calculates USD amount.
 * Stripe charges USD.
 * Webhook credits exact XRP amount.
 */
export async function createStripeTopupCheckoutSession(payload: {
  xrpAmount: number;
}): Promise<StripeTopupCheckoutResponse> {
  const resp = await fetch(`${API_BASE}/wallet/topup/checkout-session`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      xrpAmount: payload.xrpAmount,
    }),
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipeId,
    }),
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: payload.amount,
      destinationWallet: payload.destinationWallet,
      note: payload.note,
    }),
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      paymentId: payload.paymentId,
      reason: payload.reason,
    }),
  });

  return parseJson<RefundRequestResponse>(resp);
}