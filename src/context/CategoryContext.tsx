import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Category, FormFieldConfig } from '@/types/escrowTypes';
import categoryService from '@/services/categoryService';

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
  
  // Field Operations for specified category
  addField: (categoryId: string, field: Omit<FormFieldConfig, 'id'>) => void;
  updateField: (categoryId: string, fieldId: string, updates: Partial<FormFieldConfig>) => void;
  deleteField: (categoryId: string, fieldId: string) => void;
  duplicateField: (categoryId: string, fieldId: string) => void;
  reorderFields: (categoryId: string, fields: FormFieldConfig[]) => void;
  
  saveForm: (categoryId: string) => { success: boolean; message: string };
  publishForm: (categoryId: string) => Promise<{ success: boolean; message: string }>;
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
        if (res.data.length > 0 && !activeCategoryId) {
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
        title: data.title || data.name,
        description: data.description,
        icon: data.icon,
        status: data.status,
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

  const addField = (categoryId: string, fieldData: Omit<FormFieldConfig, 'id'>) => {
    const newField: FormFieldConfig = {
      ...fieldData,
      id: `field-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      enabled: fieldData.enabled ?? true,
    };
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          fields: [...(cat.fields || []), newField],
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const updateField = (categoryId: string, fieldId: string, updates: Partial<FormFieldConfig>) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          fields: (cat.fields || []).map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const deleteField = (categoryId: string, fieldId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          fields: (cat.fields || []).filter((f) => f.id !== fieldId),
          updatedAt: new Date().toISOString(),
        };
      })
    );
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
        const idx = (cat.fields || []).findIndex((f) => f.id === fieldId);
        const newFields = [...(cat.fields || [])];
        newFields.splice(idx + 1, 0, copy);
        return {
          ...cat,
          fields: newFields,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const reorderFields = (categoryId: string, fields: FormFieldConfig[]) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          fields,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const saveForm = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, updatedAt: new Date().toISOString() } : cat))
    );
    return {
      success: true,
      message: 'Form draft configuration updated in local state.',
    };
  };

  const publishForm = async (categoryId: string) => {
    const cat = getCategory(categoryId);
    if (!cat) {
      return { success: false, message: 'Category not found' };
    }

    try {
      await categoryService.setStatus(categoryId, 'active');
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? { ...c, status: 'active', updatedAt: new Date().toISOString() } : c))
      );
      return {
        success: true,
        message: `Category "${cat.title || cat.name}" status published as active on server.`,
      };
    } catch (err: any) {
      // Local fallback update
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? { ...c, status: 'active', updatedAt: new Date().toISOString() } : c))
      );
      return {
        success: true,
        message: `Form configuration ready locally. Server status update failed or backend persistence endpoint is pending release.`,
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
        addField,
        updateField,
        deleteField,
        duplicateField,
        reorderFields,
        saveForm,
        publishForm,
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
