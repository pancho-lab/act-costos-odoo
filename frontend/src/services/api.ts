import axios from 'axios';
import { Product, Category, CostChange, ApiResponse } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const odooApi = {
  testConnection: () => api.get<ApiResponse<any>>('/odoo/test-connection'),
  syncProducts: () => api.post<ApiResponse<any>>('/odoo/sync/products'),
  syncCategories: () => api.post<ApiResponse<any>>('/odoo/sync/categories'),
};

export const productsApi = {
  getAll: (categoryId?: number) => 
    api.get<ApiResponse<Product[]>>('/products', {
      params: categoryId ? { category_id: categoryId } : {}
    }),
  getByCategory: (categoryId: number) => 
    api.get<ApiResponse<Product[]>>(`/products/category/${categoryId}`),
  updateCost: (odooId: number, newCost: number) =>
    api.put<ApiResponse<any>>(`/products/${odooId}/cost`, { newCost }),
  updateCategoryCost: (categoryId: number, newCost: number) =>
    api.put<ApiResponse<any>>(`/products/category/${categoryId}/cost`, { newCost }),
};

export const categoriesApi = {
  getAll: () => api.get<ApiResponse<Category[]>>('/categories'),
  getWithCounts: () => api.get<ApiResponse<Category[]>>('/categories/with-counts'),
  getById: (odooId: number) => api.get<ApiResponse<Category>>(`/categories/${odooId}`),
};

export const changesApi = {
  getAll: (filters?: { synced?: boolean; categoryId?: number }) =>
    api.get<ApiResponse<CostChange[]>>('/changes', { params: filters }),
  getPendingSync: () => api.get<ApiResponse<CostChange[]>>('/changes/pending-sync'),
  syncToOdoo: () => api.post<ApiResponse<any>>('/changes/sync-to-odoo'),
};

export default api;