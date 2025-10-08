export interface AdminProfile {
  id_admin_profile: number;
  id_account: number;
  email: string;
  name: string;
  lastname: string;
  department: string | null;
  notes: string | null;
  created_at: string;
}
