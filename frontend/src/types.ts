export interface Product {
  id: number;
  odoo_id: number;
  code: string;
  name: string;
  category_id: number;
  category_name: string;
  cost: number;
  last_updated: string;
}

export interface Category {
  id: number;
  odoo_id: number;
  name: string;
  parent_id: number | null;
  last_updated: string;
  product_count?: number;
}

export interface CostChange {
  id: number;
  product_odoo_id: number;
  product_name: string;
  old_cost: number;
  new_cost: number;
  change_type: 'manual' | 'bulk_category';
  category_id: number;
  category_name: string;
  synced_to_odoo: boolean;
  created_at: string;
  synced_at: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}