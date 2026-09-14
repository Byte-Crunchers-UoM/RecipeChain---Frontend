export type WalletTransactionType =
  | "topup"
  | "top-up"
  | "purchase"
  | "buy"
  | "refund"
  | "withdraw"
  | "withdrawal"
  | "adjustment"
  | "sale"
  | "transfer"
  | string;

export type WalletTransactionDirection = "credit" | "debit" | string;

export type WalletDirection = WalletTransactionDirection;

export type WalletTransactionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "success"
  | "failed"
  | "cancelled"
  | "rejected"
  | string;

export type WalletTransaction = {
  transaction_id?: string | number | null;
  id?: string | number | null;
  user_id?: string | number | null;

  type?: WalletTransactionType | null;
  direction?: WalletTransactionDirection | null;

  amount?: number | string | null;
  amount_xrp?: number | string | null;
  currency?: string | null;

  status?: WalletTransactionStatus | null;
  description?: string | null;

  tx_hash?: string | null;
  reference_table?: string | null;
  reference_id?: string | number | null;

  created_at?: string | null;
  time_stamp?: string | null;
  date?: string | null;
};

export type XrpUsdRateQuote = {
  usdAmount?: number;
  amountXrp?: number;
  xrpUsdRate: number;
  source?: string;
  coinId?: string;
  fetchedAt?: string;
  cacheSeconds?: number;
  cached?: boolean;
};

export type WalletOverview = {
  wallet_address?: string | null;
  email?: string | null;

  account_balance?: number | string | null;
  recipechain_balance?: number | string | null;

  xrpl_testnet_balance?: number | string | null;
  xrpl_balance_status?: string | null;
  xrpl_balance_error?: string | null;
  xrpl_network?: string | null;

  recent_transactions?: WalletTransaction[];
};