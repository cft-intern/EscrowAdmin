import React, { createContext, useContext, useState, useEffect } from 'react';
import { Category, FormFieldConfig, FormOption } from '@/types/escrowTypes';

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
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'fields'>) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getCategory: (id: string) => Category | undefined;
  
  // Field Operations for active category / specified category
  addField: (categoryId: string, field: Omit<FormFieldConfig, 'id'>) => void;
  updateField: (categoryId: string, fieldId: string, updates: Partial<FormFieldConfig>) => void;
  deleteField: (categoryId: string, fieldId: string) => void;
  duplicateField: (categoryId: string, fieldId: string) => void;
  reorderFields: (categoryId: string, fields: FormFieldConfig[]) => void;
  
  saveForm: (categoryId: string) => void;
  publishForm: (categoryId: string) => void;
}

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-website-dev',
    title: 'Website Development',
    name: 'Website Development',
    description: 'Professional website development services, web apps, and landing pages.',
    icon: 'Globe',
    status: 'active',
    displayOrder: 1,
    escrowCount: 12,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-02-01T14:30:00Z',
    fields: [
      {
        id: 'f-1',
        name: 'project_type',
        label: 'Project Type',
        type: 'select',
        required: true,
        enabled: true,
        placeholder: 'Select project type',
        description: 'Choose the primary scope of web development required.',
        options: [
          { id: 'opt-1', label: 'E-commerce Website', value: 'ecommerce' },
          { id: 'opt-2', label: 'SaaS Web Application', value: 'saas' },
          { id: 'opt-3', label: 'Portfolio / Landing Page', value: 'landing' },
          { id: 'opt-4', label: 'Custom Web Platform', value: 'custom' },
        ],
      },
      {
        id: 'f-2',
        name: 'project_name',
        label: 'Project Name',
        type: 'text',
        required: true,
        enabled: true,
        placeholder: 'e.g. NextGen Crypto Exchange UI',
        description: 'Give a brief title for your web development project.',
        minLength: 3,
        maxLength: 100,
      },
      {
        id: 'f-3',
        name: 'budget_usd',
        label: 'Budget (USD)',
        type: 'currency',
        required: true,
        enabled: true,
        placeholder: '0.00',
        currencySymbol: '$',
        minAmount: 100,
        maxAmount: 100000,
        description: 'Total agreed escrow amount for completion.',
      },
      {
        id: 'f-4',
        name: 'deadline',
        label: 'Target Completion Date',
        type: 'date',
        required: true,
        enabled: true,
        description: 'Expected delivery deadline for milestones.',
      },
      {
        id: 'f-5',
        name: 'requirements',
        label: 'Detailed Requirements',
        type: 'textarea',
        required: true,
        enabled: true,
        placeholder: 'Describe features, design specs, tech stack, and deliverables...',
        rows: 4,
        minLength: 20,
      },
      {
        id: 'f-6',
        name: 'reference_url',
        label: 'Reference Website URL',
        type: 'url',
        required: false,
        enabled: true,
        placeholder: 'https://example.com',
        description: 'Link to a benchmark or sample design website.',
      },
    ],
  },
  {
    id: 'cat-graphic-design',
    title: 'Graphic Design',
    name: 'Graphic Design',
    description: 'Branding, UI/UX designs, illustrations, and digital artwork.',
    icon: 'Palette',
    status: 'active',
    displayOrder: 2,
    escrowCount: 8,
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-02-10T11:20:00Z',
    fields: [
      {
        id: 'f-g1',
        name: 'design_category',
        label: 'Design Type',
        type: 'radio',
        required: true,
        enabled: true,
        options: [
          { id: 'gopt-1', label: 'Brand Identity / Logo', value: 'logo' },
          { id: 'gopt-2', label: 'UI/UX App Design', value: 'uiux' },
          { id: 'gopt-3', label: 'Social Media Banners', value: 'banner' },
          { id: 'gopt-4', label: '3D Illustration', value: '3d' },
        ],
      },
      {
        id: 'f-g2',
        name: 'brand_assets',
        label: 'Brand Assets Upload',
        type: 'file',
        required: true,
        enabled: true,
        allowedTypes: ['.pdf', '.zip', '.svg', '.ai', '.psd'],
        maxSizeMb: 50,
        maxFiles: 5,
        description: 'Upload existing logos, style guides, or reference materials.',
      },
      {
        id: 'f-g3',
        name: 'design_software',
        label: 'Required Software',
        type: 'multiselect',
        required: false,
        enabled: true,
        options: [
          { id: 'sw-1', label: 'Figma', value: 'figma' },
          { id: 'sw-2', label: 'Adobe Illustrator', value: 'illustrator' },
          { id: 'sw-3', label: 'Adobe Photoshop', value: 'photoshop' },
          { id: 'sw-4', label: 'Blender 3D', value: 'blender' },
        ],
      },
      {
        id: 'f-g4',
        name: 'design_fee',
        label: 'Design Escrow Amount',
        type: 'currency',
        required: true,
        enabled: true,
        placeholder: '0.00',
        currencySymbol: '$',
        description: 'Total escrow amount for design deliverables.',
      },
    ],
  },
  {
    id: 'cat-software-dev',
    title: 'Software Development',
    name: 'Software Development',
    description: 'Custom software development, API integrations, and mobile applications.',
    icon: 'Code2',
    status: 'active',
    displayOrder: 3,
    escrowCount: 15,
    createdAt: '2026-01-22T09:00:00Z',
    updatedAt: '2026-02-12T16:45:00Z',
    fields: [
      {
        id: 'f-s1',
        name: 'tech_stack',
        label: 'Target Architecture',
        type: 'text',
        required: true,
        enabled: true,
        placeholder: 'e.g. Node.js, Python, Rust, React Native',
      },
      {
        id: 'f-s2',
        name: 'wallet_address',
        label: 'Payout Wallet Address',
        type: 'wallet',
        required: true,
        enabled: true,
        supportedNetwork: 'Ethereum (ERC-20)',
        placeholder: '0x...',
        description: 'Address to receive milestone funds upon verification.',
      },
      {
        id: 'f-s3',
        name: 'software_escrow_amount',
        label: 'Contract Escrow Amount',
        type: 'currency',
        required: true,
        enabled: true,
        placeholder: '0.00',
        currencySymbol: '$',
        description: 'Agreed escrow funding amount.',
      },
    ],
  },
  {
    id: 'cat-consulting',
    title: 'Consulting Services',
    name: 'Consulting Services',
    description: 'Business, financial, and technical advisory services.',
    icon: 'Briefcase',
    status: 'active',
    displayOrder: 4,
    escrowCount: 5,
    createdAt: '2026-01-25T14:00:00Z',
    updatedAt: '2026-02-14T09:15:00Z',
    fields: [
      {
        id: 'f-c1',
        name: 'consulting_fee',
        label: 'Consulting Retainer / Fee',
        type: 'currency',
        required: true,
        enabled: true,
        placeholder: '0.00',
        currencySymbol: '$',
        description: 'Agreed advisory fee.',
      },
    ],
  },
  {
    id: 'cat-marketing',
    title: 'Digital Marketing',
    name: 'Digital Marketing',
    description: 'SEO, social media management, content creation, and ad campaigns.',
    icon: 'Megaphone',
    status: 'active',
    displayOrder: 5,
    escrowCount: 7,
    createdAt: '2026-01-28T11:00:00Z',
    updatedAt: '2026-02-15T10:00:00Z',
    fields: [
      {
        id: 'f-m1',
        name: 'campaign_budget',
        label: 'Campaign Budget',
        type: 'currency',
        required: true,
        enabled: true,
        placeholder: '0.00',
        currencySymbol: '$',
        description: 'Escrow budget allocation for marketing.',
      },
    ],
  },
  {
    id: 'cat-physical-goods',
    title: 'Physical Products',
    name: 'Physical Products',
    description: 'Escrow for physical items, hardware, and goods shipping.',
    icon: 'Package',
    status: 'inactive',
    displayOrder: 6,
    escrowCount: 2,
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-02-16T12:00:00Z',
    fields: [
      {
        id: 'f-p1',
        name: 'shipping_address',
        label: 'Shipping Destination',
        type: 'address',
        required: true,
        enabled: true,
        requireCountry: true,
        requirePostalCode: true,
        description: 'Complete delivery address for escrow shipment.',
      },
      {
        id: 'f-p2',
        name: 'goods_price',
        label: 'Product Purchase Price',
        type: 'currency',
        required: true,
        enabled: true,
        placeholder: '0.00',
        currencySymbol: '$',
        description: 'Total purchase price held in escrow.',
      },
    ],
  },
];

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_CATEGORIES = 'escrow_admin_categories_v3';
const LOCAL_STORAGE_KEY_USER = 'escrow_admin_user_v2';

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Default admin logged in for smooth previewing or initialized
    return { name: 'John Admin', email: 'admin@example.com' };
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_CATEGORIES;
  });

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>('cat-website-dev');

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch {
      // ignore
    }
  }, [categories]);

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
    setAdminUser(null);
  };

  const addCategory = (data: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'fields'>): Category => {
    const newCat: Category = {
      ...data,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fields: [],
      escrowCount: 0,
      displayOrder: categories.length + 1,
    };
    setCategories((prev) => [newCat, ...prev]);
    setActiveCategoryId(newCat.id);
    return newCat;
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
          fields: [...cat.fields, newField],
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
          fields: cat.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
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
          fields: cat.fields.filter((f) => f.id !== fieldId),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const duplicateField = (categoryId: string, fieldId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const target = cat.fields.find((f) => f.id === fieldId);
        if (!target) return cat;
        const copy: FormFieldConfig = {
          ...target,
          id: `field-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          label: `${target.label} (Copy)`,
          name: `${target.name}_copy`,
        };
        const idx = cat.fields.findIndex((f) => f.id === fieldId);
        const newFields = [...cat.fields];
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
  };

  const publishForm = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, status: 'active', updatedAt: new Date().toISOString() } : cat
      )
    );
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
