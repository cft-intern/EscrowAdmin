import apiClient from '@/utils/api';
import { ApiResponse } from '@/types';
import { Category, FormFieldConfig } from '@/types/escrowTypes';

export interface CreateCategoryPayload {
  name: string;
  title?: string;
  description?: string;
  icon?: string;
  status?: string;
  fields?: FormFieldConfig[];
}

export const mapCategoryFromApi = (raw: any): Category => {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `cat-${Date.now()}`,
      title: 'Untitled Category',
      name: 'Untitled Category',
      description: '',
      icon: 'Globe',
      status: 'active',
      fields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const rawFields = Array.isArray(raw.fields) ? raw.fields : [];
  const fields: FormFieldConfig[] = rawFields.map((f: any, idx: number) => ({
    id: f.id ? String(f.id) : `f-${idx}-${Date.now()}`,
    name: f.name || f.key || `field_${idx}`,
    label: f.label || f.title || f.name || `Field ${idx + 1}`,
    type: f.type || 'text',
    required: Boolean(f.required),
    enabled: f.enabled !== false,
    placeholder: f.placeholder || '',
    description: f.description || '',
    defaultValue: f.defaultValue,
    order: typeof f.order === 'number' ? f.order : idx + 1,
    width: f.width === 'half' ? 'half' : 'full',
    options: Array.isArray(f.options)
      ? f.options.map((opt: any, optIdx: number) => ({
          id: opt.id ? String(opt.id) : `opt-${optIdx}`,
          label: typeof opt === 'string' ? opt : opt.label || opt.name || opt.value || `Option ${optIdx + 1}`,
          value: typeof opt === 'string' ? opt : opt.value || opt.label || `option_${optIdx + 1}`,
        }))
      : undefined,
    min: f.min,
    max: f.max,
    step: f.step,
    minLength: f.minLength,
    maxLength: f.maxLength,
    rows: f.rows,
    allowedTypes: f.allowedTypes,
    maxSizeMb: f.maxSizeMb,
    maxFiles: f.maxFiles,
    currencySymbol: f.currencySymbol || '$',
    minAmount: f.minAmount,
    maxAmount: f.maxAmount,
    supportedNetwork: f.supportedNetwork,
    requireCountry: f.requireCountry,
    requirePostalCode: f.requirePostalCode,
  }));

  return {
    id: String(raw.id || raw.categoryId || `cat-${Date.now()}`),
    title: raw.title || raw.name || 'Untitled Category',
    name: raw.name || raw.title || 'Untitled Category',
    description: raw.description || '',
    icon: raw.icon || 'Globe',
    status: raw.status === 'inactive' ? 'inactive' : 'active',
    displayOrder: raw.displayOrder || raw.order,
    escrowCount: raw.escrowCount || raw.escrowsCount || 0,
    fields,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
};

export const categoryService = {
  // GET /category
  async getAll(status?: string): Promise<ApiResponse<Category[]>> {
    const url = status && status !== 'all' ? `/category?status=${encodeURIComponent(status)}` : '/category';
    const response = await apiClient.get(url);
    const rawData = response.data?.data || response.data;
    const items = Array.isArray(rawData) ? rawData : [];
    const normalized = items.map(mapCategoryFromApi);
    return {
      data: normalized,
      message: response.data?.message || 'Categories retrieved successfully',
      success: response.data?.success !== false,
    };
  },

  // POST /category
  async create(payload: CreateCategoryPayload): Promise<ApiResponse<Category>> {
    const body = {
      name: payload.name || payload.title,
      title: payload.title || payload.name,
      description: payload.description || '',
      icon: payload.icon || 'Globe',
      status: payload.status || 'active',
      ...(payload.fields ? { fields: payload.fields } : {}),
    };
    const response = await apiClient.post('/category', body);
    const rawData = response.data?.data || response.data;
    const normalized = mapCategoryFromApi(rawData);
    return {
      data: normalized,
      message: response.data?.message || 'Category created successfully',
      success: response.data?.success !== false,
    };
  },

  // GET /category/{categoryId}
  async getById(categoryId: number | string): Promise<ApiResponse<Category>> {
    const response = await apiClient.get(`/category/${categoryId}`);
    const rawData = response.data?.data || response.data;
    const normalized = mapCategoryFromApi(rawData);
    return {
      data: normalized,
      message: response.data?.message || 'Category fetched successfully',
      success: response.data?.success !== false,
    };
  },

  // PATCH /category/{categoryId}/status/{status}
  async setStatus(categoryId: number | string, status: string): Promise<ApiResponse<Category>> {
    const response = await apiClient.patch(`/category/${categoryId}/status/${status}`);
    const rawData = response.data?.data || response.data;
    const normalized = mapCategoryFromApi(rawData);
    return {
      data: normalized,
      message: response.data?.message || 'Category status updated successfully',
      success: response.data?.success !== false,
    };
  },
};

export default categoryService;
