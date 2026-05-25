export type WalletTransaction = {
  transaction_id?: string;
  id?: string;
  user_id?: string;
  type?: "topup" | "purchase" | "refund" | "withdrawal" | "adjustment" | string;
  direction?: "credit" | "debit" | string;
  amount?: number;
  amount_xrp?: number;
  currency?: string;
  status?: "pending" | "completed" | "failed" | "rejected" | string;
  description?: string | undefined;
  tx_hash?: string | null;
  reference_table?: string | null;
  reference_id?: string | null;
  created_at?: string;
  time_stamp?: string;
  date?: string;
};

export type WalletOverview = {
  wallet_address: string;
  email: string;
  account_balance: number;
  recent_transactions: WalletTransaction[];
};