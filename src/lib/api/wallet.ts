import type { WalletOverview, WalletTransaction } from "@/types/wallet";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type ApiMessageResponse = {
  ok?: boolean;
  message?: string;
};

type WalletOverviewResponse = {
  wallet: WalletOverview;
};

type WalletTransactionsResponse = {
  transactions?: WalletTransaction[];
};

type StripeTopupCheckoutResponse = {
  ok: boolean;
  sessionId: string;
  url: string;
};

export type BuyRecipeResponse = ApiMessageResponse & {
  paymentId?: string;
  recipeId?: string;
  payment?: {
    recipe_title?: string;
    amount?: number | string;
  };
  recipe?: {
    title?: string;
    price?: number | string;
  };
};

type WithdrawalRequestResponse = ApiMessageResponse & {
  withdrawalId?: string;
};

type RefundRequestResponse = ApiMessageResponse & {
  refundId?: string;
};

/**
 * Parses backend JSON responses and converts failed API responses into readable errors.
 *
 * @param resp - Fetch response returned from the backend.
 * @returns Parsed response body typed according to the caller.
 */
async function parseJson<T>(resp: Response): Promise<T> {
  const data = await resp.json().catch(() => null);

  if (!resp.ok) {
    // Backend messages are preferred because they usually explain business-rule failures.
    throw new Error(data?.message || "Request failed");
  }

  return data as T;
}

/**
 * Fetches the current user's wallet overview.
 *
 * @returns Wallet balance/address summary for the logged-in user.
 */
export async function getMyWalletOverview(): Promise<WalletOverview> {
  const resp = await fetch(`${API_BASE}/wallet/me`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    // Wallet balances must be fresh after top-ups, purchases, or withdrawals.
    cache: "no-store",
  });

  const data = await parseJson<WalletOverviewResponse>(resp);

  return data.wallet;
}

/**
 * Fetches the current user's wallet transaction history.
 *
 * @returns List of wallet transactions, or an empty list when no transactions exist.
 */
export async function getMyWalletTransactions(): Promise<WalletTransaction[]> {
  const resp = await fetch(`${API_BASE}/wallet/transactions`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    // Transaction history changes often, so cached data can confuse users.
    cache: "no-store",
  });

  const data = await parseJson<WalletTransactionsResponse>(resp);

  return data.transactions || [];
}

/**
 * Creates a Stripe Checkout session for wallet top-up.
 *
 * @param payload - Top-up amount selected by the user.
 * @returns Stripe Checkout session details including redirect URL.
 */
export async function createStripeTopupCheckoutSession(payload: {
  amount: number;
}): Promise<StripeTopupCheckoutResponse> {
  const resp = await fetch(`${API_BASE}/wallet/topup/checkout-session`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseJson<StripeTopupCheckoutResponse>(resp);
}

/**
 * Purchases a recipe using the logged-in buyer's wallet balance.
 *
 * @param recipeId - ID of the recipe the buyer wants to purchase.
 * @returns Backend response for the wallet purchase operation.
 */
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

/**
 * Creates a wallet withdrawal request for the logged-in user.
 *
 * @param payload - Withdrawal amount, destination XRPL wallet, and optional note.
 * @returns Backend response for the withdrawal request.
 */
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

/**
 * Creates a refund request for a previous wallet payment.
 *
 * @param payload - Payment ID and optional reason for the refund request.
 * @returns Backend response for the refund request.
 */
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