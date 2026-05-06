export type WalletTransaction = {
  transaction_id: string;
  user_id: string;
  type: "topup" | "purchase" | "refund" | "withdrawal" | "adjustment";
  direction: "credit" | "debit";
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "rejected";
  description: string | null;
  tx_hash: string | null;
  reference_table: string | null;
  reference_id: string | null;
  created_at: string;
};

export type WalletOverview = {
  wallet_address: string;
  email: string;
  account_balance: number;
  recent_transactions: WalletTransaction[];
};
