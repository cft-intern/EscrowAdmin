import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Category, FormFieldConfig, FormStep, FieldGroup } from '@/types/escrowTypes';
import categoryService, { buildCategoryBackendPayload } from '@/services/categoryService';
import handleCategoryApiError from '@/utils/categoryErrorHandler';

interface AdminUser {
  name: string;
  email: string;
}

interface CategoryContextType {
  adminUser: AdminUser | null;
  signup: (name: string, email: string) => void;
  logout: () => void;
  categories: Category[];
  activeCategoryId: string | null;
  setActiveCategoryId: (id: string | null) => void;
  isLoadingCategories: boolean;
  categoriesError: string | null;
  refreshCategories: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'fields'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getCategory: (id: string) => Category | undefined;
  
  // Step Operations
  addStep: (categoryId: string, name: string, description?: string) => void;
  updateStep: (categoryId: string, stepId: string, updates: Partial<FormStep>) => void;
  deleteStep: (categoryId: string, stepId: string) => void;
  reorderSteps: (categoryId: string, steps: FormStep[]) => void;

  // Field Group Operations
  addFieldGroup: (categoryId: string, stepId: string, groupName: string) => void;
  updateFieldGroup: (categoryId: string, stepId: string, groupId: string, updates: Partial<FieldGroup>) => void;
  deleteFieldGroup: (categoryId: string, stepId: string, groupId: string) => void;

  // Step-Aware Field Operations
  addFieldToStep: (categoryId: string, stepId: string, field: Omit<FormFieldConfig, 'id'>, groupId?: string) => void;
  updateFieldInStep: (categoryId: string, stepId: string, fieldId: string, updates: Partial<FormFieldConfig>) => void;
  deleteFieldFromStep: (categoryId: string, stepId: string, fieldId: string) => void;
  reorderFieldsInStep: (categoryId: string, stepId: string, fields: FormFieldConfig[]) => void;
  
  // Legacy / Direct Field Operations for specified category
  addField: (categoryId: string, field: Omit<FormFieldConfig, 'id'>) => void;
  updateField: (categoryId: string, fieldId: string, updates: Partial<FormFieldConfig>) => void;
  deleteField: (categoryId: string, fieldId: string) => void;
  duplicateField: (categoryId: string, fieldId: string) => void;
  reorderFields: (categoryId: string, fields: FormFieldConfig[]) => void;
  
  saveForm: (categoryId: string) => Promise<{ success: boolean; message: string }>;
  publishForm: (categoryId: string) => Promise<{ success: boolean; message: string }>;
  publishFormToDomains: (
    sourceCategoryId: string,
    targetDomainIds: string[],
    fieldsToPublish: FormFieldConfig[]
  ) => Promise<{ success: boolean; message: string }>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_USER = 'escrow_admin_user_v2';

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const tokenKey = import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY || 'admin_template_token';
      const token = localStorage.getItem(tokenKey);
      if (!token) return null;
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const refreshCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    setCategoriesError(null);
    try {
      const res = await categoryService.getAll();
      if (res && Array.isArray(res.data)) {
        setCategories(res.data);
        if (res.data.length > 0 && !activeCategoryId && res.data[0]) {
          setActiveCategoryId(res.data[0].id);
        }
      } else {
        setCategories([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch categories in Context:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to load categories from backend';
      setCategoriesError(msg);
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  }, [activeCategoryId]);

  useEffect(() => {
    refreshCategories();
  }, []);

  useEffect(() => {
    try {
      if (adminUser) {
        localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(adminUser));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
      }
    } catch {
      // ignore
    }
  }, [adminUser]);

  const signup = (name: string, email: string) => {
    const newUser = { name: name.trim() || 'Admin User', email: email.trim() || 'admin@example.com' };
    setAdminUser(newUser);
  };

  const logout = () => {
    const tokenKey = import.meta.env.VITE_AUTH_TOKEN_STORAGE_KEY || 'admin_template_token';
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
    setAdminUser(null);
  };

  const addCategory = async (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'fields'>): Promise<Category> => {
    try {
      const res = await categoryService.create({
        name: data.name || data.title,
        icon: data.icon,
        status: data.status,
        steps: [],
      });

      const newCat = res.data;
      setCategories((prev) => [newCat, ...prev.filter(c => c.id !== newCat.id)]);
      setActiveCategoryId(newCat.id);
      return newCat;
    } catch (err) {
      // If API fails, fall back to adding in-memory local object without pretending server created it
      const fallbackCat: Category = {
        ...data,
        id: `cat-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fields: [],
        escrowCount: 0,
      };
      setCategories((prev) => [fallbackCat, ...prev]);
      setActiveCategoryId(fallbackCat.id);
      return fallbackCat;
    }
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (activeCategoryId === id) {
      setActiveCategoryId(null);
    }
  };

  const getCategory = (id: string) => {
    return categories.find((c) => c.id === id);
  };

  // Step Operations
  const addStep = (categoryId: string, name: string, description?: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const currentSteps = cat.steps && cat.steps.length > 0 ? cat.steps : [
          {
            id: 'step-1',
            name: 'Basic Information',
            order: 1,
            description: 'General category inputs and parameters',
            fields: cat.fields || [],
            fieldGroups: [],
          }
        ];
        const newStep: FormStep = {
          id: `step-${Date.now()}`,
          name: name.trim() || `Step ${currentSteps.length + 1}`,
          order: currentSteps.length + 1,
          description: description || '',
          fields: [],
          fieldGroups: [],
        };
        const updatedSteps = [...currentSteps, newStep];
        return {
          ...cat,
          steps: updatedSteps,
          fields: updatedSteps.flatMap((s) => s.fields),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const updateStep = (categoryId: string, stepId: string, updates: Partial<FormStep>) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const updatedSteps = (cat.steps || []).map((s) =>
          s.id === stepId ? { ...s, ...updates } : s
        );
        return {
          ...cat,
          steps: updatedSteps,
          fields: updatedSteps.flatMap((s) => s.fields),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const deleteStep = (categoryId: string, stepId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const filtered = (cat.steps || []).filter((s) => s.id !== stepId);
        const reordered = filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
        return {
          ...cat,
          steps: reordered,
          fields: reordered.flatMap((s) => s.fields),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const reorderSteps = (categoryId: string, stepsToOrder: FormStep[]) => {
    const reordered = stepsToOrder.map((s, idx) => ({ ...s, order: idx + 1 }));
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          steps: reordered,
          fields: reordered.flatMap((s) => s.fields),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Field Group Operations
  const addFieldGroup = (categoryId: string, stepId: string, groupName: string) => {
    const newGroup: FieldGroup = {
      id: `group-${Date.now()}`,
      name: groupName.trim() || 'New Field Group',
    };
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const updatedSteps = (cat.steps || []).map((st) => {
          if (st.id !== stepId) return st;
          return {
            ...st,
            fieldGroups: [...(st.fieldGroups || []), newGroup],
          };
        });
        return {
          ...cat,
          steps: updatedSteps,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const updateFieldGroup = (categoryId: string, stepId: string, groupId: string, updates: Partial<FieldGroup>) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const updatedSteps = (cat.steps || []).map((st) => {
          if (st.id !== stepId) return st;
          return {
            ...st,
            fieldGroups: (st.fieldGroups || []).map((g) => (g.id === groupId ? { ...g, ...updates } : g)),
          };
        });
        return {
          ...cat,
          steps: updatedSteps,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const deleteFieldGroup = (categoryId: string, stepId: string, groupId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const updatedSteps = (cat.steps || []).map((st) => {
          if (st.id !== stepId) return st;
          // Unset groupId from fields in this group
          const updatedFields = st.fields.map((f) => (f.groupId === groupId ? { ...f, groupId: undefined } : f));
          return {
            ...st,
            fields: updatedFields,
            fieldGroups: (st.fieldGroups || []).filter((g) => g.id !== groupId),
          };
        });
        return {
          ...cat,
          steps: updatedSteps,
          fields: updatedSteps.flatMap((s) => s.fields),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Step-Aware Field Operations
  const addFieldToStep = (categoryId: string, stepId: string, fieldData: Omit<FormFieldConfig, 'id'>, groupId?: string) => {
    const newField: FormFieldConfig = {
      ...fieldData,
      id: `field-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      enabled: fieldData.enabled ?? true,
      groupId: groupId || fieldData.groupId,
    };

    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        let steps: FormStep[] = cat.steps && cat.steps.length > 0 ? [...cat.steps] : [
          {
            id: 'step-1',
            name: 'Basic Information',
            order: 1,
            description: 'General category inputs and parameters',
            fields: cat.fields || [],
            fieldGroups: [],
          }
        ];

        const targetStepIdx = steps.findIndex((s) => s.id === stepId);
        if (targetStepIdx !== -1) {
          const step = steps[targetStepIdx];
          if (step) {
            const updatedStep: FormStep = {
              ...step,
              fields: [...(step.fields || []), newField],
            };
            steps[targetStepIdx] = updatedStep;
          }
        } else if (steps.length > 0 && steps[0]) {
          const step = steps[0];
          steps[0] = { ...step, fields: [...(step.fields || []), newField] };
        }

        return {
          ...cat,
          steps,
          fields: steps.flatMap((s) => s.fields || []),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const updateFieldInStep = (categoryId: string, stepId: string, fieldId: string, updates: Partial<FormFieldConfig>) => {
    setCategories((prev: Category[]) =>
      prev.map((cat: Category) => {
        if (cat.id !== categoryId) return cat;
        const steps = (cat.steps || []).map((st) => {
          if (st.id !== stepId && !(st.fields || []).some((f) => f.id === fieldId)) return st;
          return {
            ...st,
            fields: (st.fields || []).map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
          };
        });
        return {
          ...cat,
          steps,
          fields: steps.flatMap((s) => s.fields || []),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const deleteFieldFromStep = (categoryId: string, stepId: string, fieldId: string) => {
    setCategories((prev: Category[]) =>
      prev.map((cat: Category) => {
        if (cat.id !== categoryId) return cat;
        const steps = (cat.steps || []).map((st) => ({
          ...st,
          fields: (st.fields || []).filter((f) => f.id !== fieldId),
        }));
        return {
          ...cat,
          steps,
          fields: steps.flatMap((s) => s.fields || []),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const reorderFieldsInStep = (categoryId: string, stepId: string, fields: FormFieldConfig[]) => {
    setCategories((prev: Category[]) =>
      prev.map((cat: Category) => {
        if (cat.id !== categoryId) return cat;
        const steps = (cat.steps || []).map((st) => (st.id === stepId ? { ...st, fields } : st));
        return {
          ...cat,
          steps,
          fields: steps.flatMap((s) => s.fields || []),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const addField = (categoryId: string, fieldData: Omit<FormFieldConfig, 'id'>) => {
    const cat = getCategory(categoryId);
    const firstStepId = cat?.steps && cat.steps.length > 0 && cat.steps[0] ? cat.steps[0].id : 'step-1';
    addFieldToStep(categoryId, firstStepId, fieldData);
  };

  const updateField = (categoryId: string, fieldId: string, updates: Partial<FormFieldConfig>) => {
    const cat = getCategory(categoryId);
    const targetStep = cat?.steps?.find((s) => (s.fields || []).some((f) => f.id === fieldId));
    const stepId = targetStep ? targetStep.id : 'step-1';
    updateFieldInStep(categoryId, stepId, fieldId, updates);
  };

  const deleteField = (categoryId: string, fieldId: string) => {
    const cat = getCategory(categoryId);
    const targetStep = cat?.steps?.find((s) => (s.fields || []).some((f) => f.id === fieldId));
    const stepId = targetStep ? targetStep.id : 'step-1';
    deleteFieldFromStep(categoryId, stepId, fieldId);
  };

  const duplicateField = (categoryId: string, fieldId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const target = (cat.fields || []).find((f) => f.id === fieldId);
        if (!target) return cat;
        const copy: FormFieldConfig = {
          ...target,
          id: `field-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          label: `${target.label} (Copy)`,
          name: `${target.name}_copy`,
        };
        const steps = (cat.steps || []).map((st) => {
          const idx = st.fields.findIndex((f) => f.id === fieldId);
          if (idx === -1) return st;
          const newStepFields = [...st.fields];
          newStepFields.splice(idx + 1, 0, copy);
          return { ...st, fields: newStepFields };
        });
        return {
          ...cat,
          steps,
          fields: steps.flatMap((s) => s.fields),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const reorderFields = (categoryId: string, fields: FormFieldConfig[]) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        // Assign to first step or distribute
        const steps: FormStep[] = cat.steps && cat.steps.length > 0 ? [...cat.steps] : [
          {
            id: 'step-1',
            name: 'Basic Information',
            order: 1,
            description: 'General category inputs and parameters',
            fields: [],
            fieldGroups: [],
          }
        ];
        if (steps.length > 0 && steps[0]) {
          steps[0] = { ...steps[0], fields };
        }
        return {
          ...cat,
          steps,
          fields,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const saveForm = async (categoryId: string): Promise<{ success: boolean; message: string }> => {
    const cat = categories.find((c: Category) => c.id === categoryId);
    if (!cat) {
      return { success: false, message: 'Category not found' };
    }

    const payload = buildCategoryBackendPayload(cat);

    try {
      const res = await categoryService.create(payload);
      const updatedCat = res.data;

      setCategories((prev: Category[]) =>
        prev.map((c: Category) => (c.id === categoryId ? { ...updatedCat, id: categoryId } : c))
      );

      return {
        success: true,
        message: 'Form saved as draft / active successfully.',
      };
    } catch (err: any) {
      const errMsg = handleCategoryApiError(err, { silent: true });
      return {
        success: false,
        message: errMsg,
      };
    }
  };

  const publishForm = async (categoryId: string) => {
    const cat = getCategory(categoryId);
    if (!cat) {
      return { success: false, message: 'Category not found' };
    }

    const payload = buildCategoryBackendPayload(cat);

    try {
      await categoryService.create(payload);
      setCategories((prev: Category[]) =>
        prev.map((c: Category) => (c.id === categoryId ? { ...c, status: 'active', updatedAt: new Date().toISOString() } : c))
      );
      return {
        success: true,
        message: `Category "${cat.title || cat.name}" published successfully via POST /category.`,
      };
    } catch (err: any) {
      const errMsg = handleCategoryApiError(err, { silent: true });
      return {
        success: false,
        message: errMsg,
      };
    }
  };

  const publishFormToDomains = async (
    sourceCategoryId: string,
    targetDomainIds: string[],
    fieldsToPublish: FormFieldConfig[]
  ): Promise<{ success: boolean; message: string }> => {
    if (!targetDomainIds || targetDomainIds.length === 0) {
      return { success: false, message: 'Please select at least one domain.' };
    }

    const sourceCat = getCategory(sourceCategoryId);

    try {
      await Promise.all(
        targetDomainIds.map(async (domainId) => {
          const targetCat = categories.find((c: Category) => c.id === domainId) || sourceCat;
          if (targetCat) {
            const catWithFields: Category = {
              ...targetCat,
              fields: fieldsToPublish,
              steps: sourceCat?.steps || targetCat.steps,
              status: 'active',
            };
            const payload = buildCategoryBackendPayload(catWithFields);
            await categoryService.create(payload);
          }
        })
      );

      setCategories((prev: Category[]) =>
        prev.map((c: Category) => {
          if (targetDomainIds.includes(c.id)) {
            return {
              ...c,
              fields: [...fieldsToPublish],
              steps: sourceCat?.steps || c.steps,
              status: 'active',
              updatedAt: new Date().toISOString(),
            };
          }
          return c;
        })
      );

      return {
        success: true,
        message: `Form published to ${targetDomainIds.length} domain(s) via POST /category.`,
      };
    } catch (err: any) {
      const errMsg = handleCategoryApiError(err, { silent: true });
      return {
        success: false,
        message: errMsg,
      };
    }
  };

  return (
    <CategoryContext.Provider
      value={{
        adminUser,
        signup,
        logout,
        categories,
        activeCategoryId,
        setActiveCategoryId,
        isLoadingCategories,
        categoriesError,
        refreshCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategory,
        addStep,
        updateStep,
        deleteStep,
        reorderSteps,
        addFieldGroup,
        updateFieldGroup,
        deleteFieldGroup,
        addFieldToStep,
        updateFieldInStep,
        deleteFieldFromStep,
        reorderFieldsInStep,
        addField,
        updateField,
        deleteField,
        duplicateField,
        reorderFields,
        saveForm,
        publishForm,
        publishFormToDomains,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory must be used within a CategoryProvider');
  }
  return context;
};
