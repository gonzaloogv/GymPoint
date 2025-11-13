export interface Transaction {
  id_ledger: number;
  id_user_profile: number;
  user: {
    name: string;
    email: string;
  } | null;
  delta: number;
  reason: string;
  ref_type: string | null;
  ref_id: number | null;
  balance_after: number;
  created_at: string;
}
