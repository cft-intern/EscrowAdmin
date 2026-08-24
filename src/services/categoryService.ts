import apiClient from '@/utils/api';
import { ApiResponse } from '@/types';
import {
  Category,
  FormFieldConfig,
  FormStep,
  FieldGroup,
  FieldType,
  SupportedFieldType,
  mapFieldTypeToApi,
  VALID_FIELD_TYPES,
  RESERVED_FIELD_KEYS,
  generateUniqueFieldKey,
  sanitizeFieldKey,
} from '@/types/escrowTypes';

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  requiresShipping?: boolean;
  status?: string;
  steps?: any[];
  fields?: FormFieldConfig[];
  [key: string]: any;
}

export const mapFieldFromApi = (f: any, idx: number, groupId?: string): FormFieldConfig => {
  const fTypeUpper = mapFieldTypeToApi(f.fieldType, f.type);
  const isReq = Boolean(f.isRequired ?? f.required);
  const dispOrder = typeof f.displayOrder === 'number' ? f.displayOrder : typeof f.order === 'number' ? f.order : idx;

  return {
    id: f.id ? String(f.id) : `f-${idx}-${Date.now()}`,
    name: f.name || f.key || `field_${idx}`,
    key: f.key || f.name || `field_${idx}`,
    label: f.label || f.title || f.name || `Field ${idx + 1}`,
    type: fTypeUpper.toLowerCase() as FieldType,
    fieldType: fTypeUpper,
    required: isReq,
    isRequired: isReq,
    enabled: f.enabled !== false,
    placeholder: f.placeholder || '',
    description: f.description || f.tooltip || f.tooltipContent || '',
    tooltip: f.tooltip || f.tooltipContent || f.description || '',
    defaultValue: f.defaultValue,
    order: dispOrder + 1,
    displayOrder: dispOrder,
    width: f.fieldsPerRow === 2 || f.width === 'half' ? 'half' : 'full',
    fieldsPerRow: f.fieldsPerRow === 2 || f.width === 'half' ? 2 : 1,
    groupId: f.groupId || groupId,
    options: Array.isArray(f.options)
      ? f.options.map((opt: any, optIdx: number) => ({
          id: opt.id ? String(opt.id) : `opt-${optIdx}`,
          label: typeof opt === 'string' ? opt : opt.label || opt.name || opt.value || `Option ${optIdx + 1}`,
          value: typeof opt === 'string' ? opt : opt.value || opt.label || `option_${optIdx + 1}`,
        }))
      : undefined,

    // Validations
    min: f.min ?? f.minValue,
    max: f.max ?? f.maxValue,
    minValue: f.minValue ?? f.min,
    maxValue: f.maxValue ?? f.max,
    allowDecimal: f.allowDecimal,
    minLength: f.minLength,
    maxLength: f.maxLength,
    noWhitespaceOnly: f.noWhitespaceOnly,
    alphabetsOnly: f.alphabetsOnly,
    uploadType: f.uploadType,
    minUploadCount: f.minUploadCount,
    maxUploadCount: f.maxUploadCount,
    fileSizeLimit: f.fileSizeLimit,
    allowedTypes: f.allowedTypes,
    maxSizeMb: f.maxSizeMb || (f.fileSizeLimit ? Math.round(f.fileSizeLimit / (1024 * 1024)) : undefined),
    maxFiles: f.maxFiles || f.maxUploadCount,
    checkboxText: f.checkboxText,
    checkboxLink: f.checkboxLink,
    tooltipType: f.tooltipType,
    tooltipContent: f.tooltipContent,
  };
};

export const mapCategoryFromApi = (raw: any): Category => {
  if (!raw || typeof raw !== 'object') {
    const defaultStep: FormStep = {
      id: 'step-1',
      name: 'Basic Information',
      stepName: 'Basic Information',
      order: 1,
      displayOrder: 0,
      description: 'General category inputs and parameters',
      fields: [],
      fieldGroups: [],
    };
    return {
      id: `cat-${Date.now()}`,
      title: 'Untitled Category',
      name: 'Untitled Category',
      slug: 'untitled-category',
      description: '',
      icon: 'Globe',
      requiresShipping: false,
      status: 'active',
      fields: [],
      steps: [defaultStep],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  let steps: FormStep[] = [];
  if (Array.isArray(raw.steps) && raw.steps.length > 0) {
    steps = raw.steps.map((st: any, sIdx: number) => {
      const stepId = String(st.id || `step-${sIdx + 1}`);
      const rawDirectFields = Array.isArray(st.fieldDefinitions) && st.fieldDefinitions.length > 0
        ? st.fieldDefinitions
        : Array.isArray(st.fields)
        ? st.fields
        : [];
      const directFields = rawDirectFields.map((f: any, fIdx: number) => mapFieldFromApi(f, fIdx));

      const rawGroups = Array.isArray(st.fieldGroups) ? st.fieldGroups : [];
      const groupFieldsList: FormFieldConfig[] = [];

      const fieldGroups: FieldGroup[] = rawGroups.map((g: any, gIdx: number) => {
        const groupId = String(g.id || `group-${gIdx + 1}`);
        const gName = g.groupName || g.name || `Group ${gIdx + 1}`;
        const rawGroupFields = Array.isArray(g.fieldDefinitions) && g.fieldDefinitions.length > 0
          ? g.fieldDefinitions
          : Array.isArray(g.fields)
          ? g.fields
          : [];
        const mappedGroupFields = rawGroupFields.map((gf: any, gfIdx: number) =>
          mapFieldFromApi(gf, gfIdx, groupId)
        );
        groupFieldsList.push(...mappedGroupFields);

        return {
          id: groupId,
          name: gName,
          groupName: gName,
          description: g.description || '',
          order: typeof g.displayOrder === 'number' ? g.displayOrder + 1 : g.order || gIdx + 1,
          displayOrder: typeof g.displayOrder === 'number' ? g.displayOrder : gIdx,
          fields: mappedGroupFields,
        };
      });

      const allStepFields = [...directFields, ...groupFieldsList];
      const stepName = st.stepName || st.name || `Step ${sIdx + 1}`;
      const stepDisplayOrder = typeof st.displayOrder === 'number' ? st.displayOrder : sIdx;

      return {
        id: stepId,
        name: stepName,
        stepName: stepName,
        order: stepDisplayOrder + 1,
        displayOrder: stepDisplayOrder,
        description: st.description || '',
        fields: allStepFields,
        fieldGroups,
      };
    });
  } else {
    const rawFields = Array.isArray(raw.fieldDefinitions) && raw.fieldDefinitions.length > 0
      ? raw.fieldDefinitions
      : Array.isArray(raw.fields)
      ? raw.fields
      : [];
    const fields = rawFields.map((f: any, idx: number) => mapFieldFromApi(f, idx));
    steps = [
      {
        id: 'step-1',
        name: 'Basic Information',
        stepName: 'Basic Information',
        order: 1,
        displayOrder: 0,
        description: 'General category inputs and parameters',
        fields,
        fieldGroups: [],
      },
    ];
  }

  const allFields = steps.flatMap((s) => s.fields);
  const catName = raw.name || raw.title || 'Untitled Category';

  return {
    id: String(raw.id || raw.categoryId || `cat-${Date.now()}`),
    title: catName,
    name: catName,
    slug: raw.slug || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    description: raw.description || '',
    icon: raw.icon || 'Shield',
    requiresShipping: Boolean(raw.requiresShipping),
    status: raw.status === 'inactive' ? 'inactive' : 'active',
    displayOrder: typeof raw.displayOrder === 'number' ? raw.displayOrder : raw.order,
    escrowCount: raw.escrowCount || raw.escrowsCount || 0,
    fields: allFields,
    steps,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
};

export const formatFieldForBackend = (
  f: FormFieldConfig,
  index: number,
  seenKeys?: Set<string>
): Record<string, any> => {
  const typeUpper = mapFieldTypeToApi(f.fieldType, f.type);

  // Pre-flight Validation
  if (!(VALID_FIELD_TYPES as readonly string[]).includes(typeUpper)) {
    throw new Error(
      `Invalid field type "${f.fieldType || f.type}" for field "${f.label || f.name}". ` +
      `Expected one of: ${VALID_FIELD_TYPES.join(', ')}.`
    );
  }

  const isReq = Boolean(f.isRequired ?? f.required);
  const rawCandidateKey = (f.key || f.name || f.label || `field_${index}`).trim();

  // Ensure key is non-reserved and unique across all steps/groups
  let finalKey = sanitizeFieldKey(rawCandidateKey);
  if (seenKeys) {
    if (RESERVED_FIELD_KEYS.has(finalKey) || seenKeys.has(finalKey)) {
      finalKey = generateUniqueFieldKey(f.label || rawCandidateKey, seenKeys, RESERVED_FIELD_KEYS, f.key);
    }
    seenKeys.add(finalKey);
  } else if (RESERVED_FIELD_KEYS.has(finalKey)) {
    finalKey = `${finalKey}_field`;
  }

  const base: Record<string, any> = {
    label: f.label || `Field ${index + 1}`,
    key: finalKey,
    fieldType: typeUpper,
    isRequired: isReq,
    displayOrder: index,
  };

  if (typeUpper === 'STRING' || typeUpper === 'TEXTAREA') {
    if (typeof f.minLength === 'number') base.minLength = f.minLength;
    if (typeof f.maxLength === 'number') base.maxLength = f.maxLength;
    if (typeof f.noWhitespaceOnly === 'boolean') base.noWhitespaceOnly = f.noWhitespaceOnly;
    if (typeof f.alphabetsOnly === 'boolean') base.alphabetsOnly = f.alphabetsOnly;
  } else if (typeUpper === 'NUMBER') {
    const minVal = f.minValue ?? f.min;
    const maxVal = f.maxValue ?? f.max;
    if (typeof minVal === 'number') base.minValue = minVal;
    if (typeof maxVal === 'number') base.maxValue = maxVal;
  } else if (['FILE', 'IMAGE', 'VIDEO', 'DOCUMENT'].includes(typeUpper)) {
    const rawUpload = typeof f.uploadType === 'object' && f.uploadType !== null ? (f.uploadType as any).value : f.uploadType;
    const uploadStr = typeof rawUpload === 'string' ? rawUpload.toUpperCase() : '';
    base.uploadType = ['SINGLE', 'MULTIPLE'].includes(uploadStr)
      ? uploadStr
      : (f.maxFiles && f.maxFiles > 1 ? 'MULTIPLE' : 'SINGLE');

    if (typeof f.minUploadCount === 'number') base.minUploadCount = f.minUploadCount;
    if (typeof f.maxUploadCount === 'number') base.maxUploadCount = f.maxUploadCount;
    else if (typeof f.maxFiles === 'number') base.maxUploadCount = f.maxFiles;
    if (typeof f.fileSizeLimit === 'number') base.fileSizeLimit = f.fileSizeLimit;
    else if (typeof f.maxSizeMb === 'number') base.fileSizeLimit = f.maxSizeMb * 1024 * 1024;
  } else if (['DROPDOWN', 'RADIO'].includes(typeUpper)) {
    if (Array.isArray(f.options)) {
      base.options = f.options.map((opt: any) => ({
        label: typeof opt === 'string' ? opt : opt.label || opt.name || opt.value || '',
        value: typeof opt === 'string' ? opt : opt.value || opt.label || '',
      }));
    } else {
      base.options = [];
    }
  } else if (typeUpper === 'CHECKBOX') {
    if (f.checkboxText) base.checkboxText = f.checkboxText;
    if (f.checkboxLink) base.checkboxLink = f.checkboxLink;
  }

  if (f.targetRole) {
    const rawRole = typeof f.targetRole === 'object' && f.targetRole !== null ? (f.targetRole as any).value : f.targetRole;
    const roleStr = typeof rawRole === 'string' ? rawRole.toUpperCase() : '';
    if (['BUYER', 'SELLER', 'BOTH'].includes(roleStr)) {
      base.targetRole = roleStr;
    }
  }

  if (f.tooltipType) base.tooltipType = f.tooltipType;
  if (f.tooltipContent || f.tooltip) base.tooltipContent = f.tooltipContent || f.tooltip;

  return base;
};

export const buildCategoryBackendPayload = (cat: Category): CreateCategoryPayload => {
  const stepsSource = Array.isArray(cat.steps) && cat.steps.length > 0
    ? cat.steps
    : [
        {
          id: 'step-1',
          name: 'Basic Information',
          stepName: 'Basic Information',
          order: 1,
          displayOrder: 0,
          fields: cat.fields || [],
          fieldGroups: [],
        },
      ];

  const seenCategoryKeys = new Set<string>();

  const stepsPayload = stepsSource.map((st, stepIdx) => {
    const rawStepFields = Array.isArray(st.fields) ? st.fields : [];
    const directFields = rawStepFields.filter((f) => !f.groupId);
    const groupsSource = Array.isArray(st.fieldGroups) ? st.fieldGroups : [];

    const fieldGroupsPayload = groupsSource.map((g, gIdx) => {
      const fieldsInGroup = rawStepFields.filter((f) => f.groupId === g.id);
      return {
        groupName: g.groupName || g.name || `Group ${gIdx + 1}`,
        displayOrder: gIdx,
        fields: fieldsInGroup.map((f, fIdx) => formatFieldForBackend(f, fIdx, seenCategoryKeys)),
      };
    });

    return {
      stepName: st.stepName || st.name || `Step ${stepIdx + 1}`,
      displayOrder: stepIdx,
      fields: directFields.map((f, fIdx) => formatFieldForBackend(f, fIdx, seenCategoryKeys)),
      fieldGroups: fieldGroupsPayload,
    };
  });

  const catName = cat.name || cat.title || 'Untitled Category';
  const catSlug = cat.slug || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  return {
    name: catName,
    slug: catSlug,
    description: cat.description || '',
    icon: cat.icon || 'uploads/categories/default.png',
    requiresShipping: Boolean(cat.requiresShipping),
    steps: stepsPayload,
  };
};

export const categoryService = {
  // GET /category
  async getAll(status?: string): Promise<ApiResponse<Category[]>> {
    let url = '/category';
    if (status && status !== 'all') {
      const clean = typeof status === 'string' ? status.trim() : String(status);
      const titleStatus = clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
      url = `/category?status=${encodeURIComponent(titleStatus)}`;
    }
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
    const formattedPayload = {
      ...payload,
      status: payload.status
        ? payload.status.charAt(0).toUpperCase() + payload.status.slice(1).toLowerCase()
        : 'Active',
    };

    if (typeof import.meta !== 'undefined' && import.meta?.env?.DEV) {
      console.log('[CATEGORY] create request payload:', formattedPayload);
    }

    const response = await apiClient.post('/category', formattedPayload);
    const rawData = response.data?.data || response.data;
    const normalized = mapCategoryFromApi(rawData);
    return {
      data: normalized,
      message: response.data?.message || 'Category created successfully',
      success: response.data?.success !== false,
    };
  },

  // GET /category/{categoryId}/form
  async getById(categoryId: number | string): Promise<ApiResponse<Category>> {
    try {
      const response = await apiClient.get(`/category/${categoryId}/form`);
      const rawData = response.data?.data || response.data;
      const normalized = mapCategoryFromApi(rawData);
      return {
        data: normalized,
        message: response.data?.message || 'Category fetched successfully',
        success: response.data?.success !== false,
      };
    } catch (err) {
      const response = await apiClient.get(`/category/${categoryId}`);
      const rawData = response.data?.data || response.data;
      const normalized = mapCategoryFromApi(rawData);
      return {
        data: normalized,
        message: response.data?.message || 'Category fetched successfully',
        success: response.data?.success !== false,
      };
    }
  },

  // DELETE /category/{id}
  async delete(categoryId: number | string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/category/${categoryId}`);
    return {
      data: undefined,
      message: response.data?.message || 'Category deleted successfully',
      success: response.data?.success !== false,
    };
  },

  // PATCH /category/{categoryId}/status/Active or /category/{categoryId}/status/Inactive
  async setStatus(categoryId: number | string, status: string | { value: string }): Promise<ApiResponse<Category>> {
    const rawStatus = typeof status === 'object' && status !== null ? (status as any).value : status;
    const cleanStatus = typeof rawStatus === 'string' ? rawStatus.trim() : String(rawStatus || '');
    const titleStatus = cleanStatus.charAt(0).toUpperCase() + cleanStatus.slice(1).toLowerCase(); // e.g. "Active", "Inactive"
    const upperStatus = cleanStatus.toUpperCase(); // e.g. "ACTIVE", "INACTIVE"

    if (typeof import.meta !== 'undefined' && import.meta?.env?.DEV) {
      console.log('[CATEGORY] setStatus payload:', { categoryId, rawStatus, titleStatus, upperStatus });
    }

    try {
      const response = await apiClient.patch(`/category/${categoryId}/status/${titleStatus}`);
      const rawData = response.data?.data || response.data;
      const normalized = mapCategoryFromApi(rawData);
      return {
        data: normalized,
        message: response.data?.message || 'Category status updated successfully',
        success: response.data?.success !== false,
      };
    } catch (err: any) {
      if (err?.response?.status === 400 && String(err?.response?.data?.message || '').includes('enum string is expected')) {
        const response = await apiClient.patch(`/category/${categoryId}/status/${upperStatus}`);
        const rawData = response.data?.data || response.data;
        const normalized = mapCategoryFromApi(rawData);
        return {
          data: normalized,
          message: response.data?.message || 'Category status updated successfully',
          success: response.data?.success !== false,
        };
      }
      throw err;
    }
  },

  // GET /category/{id}/form
  async getForm(categoryId: number | string): Promise<ApiResponse<any>> {
    const response = await apiClient.get(`/category/${categoryId}/form`);
    const rawData = response.data?.data || response.data;
    return {
      data: rawData,
      message: response.data?.message || 'Category form loaded successfully',
      success: response.data?.success !== false,
    };
  },

  // POST /contracts
  async submitContract(payload: { items: Array<{ fields: Array<{ key: string; value: any }> }>; [key: string]: any }): Promise<ApiResponse<any>> {
    const response = await apiClient.post('/contracts', payload);
    return {
      data: response.data?.data || response.data,
      message: response.data?.message || 'Contract submitted successfully',
      success: response.data?.success !== false,
    };
  },

  // PUT or PATCH /category/{categoryId} to update steps / fields
  async update(categoryId: number | string, payload: any): Promise<ApiResponse<Category>> {
    try {
      const response = await apiClient.patch(`/category/${categoryId}`, payload);
      const rawData = response.data?.data || response.data;
      const normalized = mapCategoryFromApi(rawData);
      return {
        data: normalized,
        message: response.data?.message || 'Category updated successfully',
        success: response.data?.success !== false,
      };
    } catch (err) {
      try {
        const response = await apiClient.put(`/category/${categoryId}`, payload);
        const rawData = response.data?.data || response.data;
        const normalized = mapCategoryFromApi(rawData);
        return {
          data: normalized,
          message: response.data?.message || 'Category updated successfully',
          success: response.data?.success !== false,
        };
      } catch (innerErr: any) {
        throw innerErr;
      }
    }
  },
};

export default categoryService;
