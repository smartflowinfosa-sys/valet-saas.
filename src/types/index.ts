export interface Company {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface User {
  id: string;
  company_id: string;
  email: string;
  role: 'admin' | 'staff';
}