export interface Form {
  id: string;
  user_id: string;
  form_type: 'account_opening' | 'loan_application';
  form_data: Record<string, any>;
  token: string;
  status: 'pending' | 'reviewed';
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  is_super_admin: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
}