import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Type,
  AlignLeft,
  Hash,
  Mail,
  Phone,
  Link,
  List,
  ListChecks,
  CircleDot,
  CheckSquare,
  ToggleLeft,
  Calendar,
  Clock,
  DollarSign,
  Upload,
  Image as ImageIcon,
  Wallet,
  MapPin,
  Plus,
  Search,
  GripVertical,
  Edit2,
  Copy,
  Trash2,
  Eye,
  Save,
  Send,
  Sparkles,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCategory } from '@/context/CategoryContext';
import { FieldType, FormFieldConfig } from '@/types/escrowTypes';
import { LiveFormPreview } from '@/components/admin/LiveFormPreview';
import { FieldEditorDrawer } from '@/components/admin/FieldEditorDrawer';
import toast from 'react-hot-toast';

interface FieldTypeDefinition {
  type: FieldType;
  label: string;
  category: 'Basic' | 'Selection' | 'Date' | 'Financial' | 'Upload' | 'Web3 / Address';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  defaultConfig: Partial<FormFieldConfig>;
}

const FIELD_TYPES: FieldTypeDefinition[] = [
  // Basic
  { type: 'text', label: 'Text', category: 'Basic', icon: Type, description: 'Single line text input', defaultConfig: { label: 'New Text Field', placeholder: 'Enter text' } },
  { type: 'textarea', label: 'Textarea', category: 'Basic', icon: AlignLeft, description: 'Multi-line text input', defaultConfig: { label: 'New Textarea Field', placeholder: 'Enter details...', rows: 4 } },
  { type: 'number', label: 'Number', category: 'Basic', icon: Hash, description: 'Numeric value input', defaultConfig: { label: 'New Number Field', min: 0 } },
  { type: 'email', label: 'Email', category: 'Basic', icon: Mail, description: 'Email address validation', defaultConfig: { label: 'Email Address', placeholder: 'user@example.com' } },
  { type: 'phone', label: 'Phone', category: 'Basic', icon: Phone, description: 'Phone number input', defaultConfig: { label: 'Phone Number', placeholder: '+1 (555) 000-0000' } },
  { type: 'url', label: 'URL', category: 'Basic', icon: Link, description: 'Web link URL input', defaultConfig: { label: 'Website URL', placeholder: 'https://example.com' } },

  // Selection
  {
    type: 'select',
    label: 'Select',
    category: 'Selection',
    icon: List,
    description: 'Single choice dropdown',
    defaultConfig: {
      label: 'New Select Field',
      options: [
        { id: 'opt-1', label: 'Option 1', value: 'option_1' },
        { id: 'opt-2', label: 'Option 2', value: 'option_2' },
      ],
    },
  },
  {
    type: 'multiselect',
    label: 'Multi Select',
    category: 'Selection',
    icon: ListChecks,
    description: 'Multiple choice dropdown',
    defaultConfig: {
      label: 'New Multi Select Field',
      options: [
        { id: 'opt-1', label: 'Option 1', value: 'option_1' },
        { id: 'opt-2', label: 'Option 2', value: 'option_2' },
      ],
    },
  },
  {
    type: 'radio',
    label: 'Radio',
    category: 'Selection',
    icon: CircleDot,
    description: 'Radio button selection',
    defaultConfig: {
      label: 'New Radio Field',
      options: [
        { id: 'opt-1', label: 'Option A', value: 'option_a' },
        { id: 'opt-2', label: 'Option B', value: 'option_b' },
      ],
    },
  },
  { type: 'checkbox', label: 'Checkbox', category: 'Selection', icon: CheckSquare, description: 'Single checkbox agree state', defaultConfig: { label: 'Terms Checkbox', description: 'I agree to requirements' } },
  { type: 'toggle', label: 'Toggle', category: 'Selection', icon: ToggleLeft, description: 'On / Off switch toggle', defaultConfig: { label: 'Enable Feature Toggle' } },

  // Date
  { type: 'date', label: 'Date', category: 'Date', icon: Calendar, description: 'Calendar date picker', defaultConfig: { label: 'Select Date' } },
  { type: 'datetime', label: 'Date & Time', category: 'Date', icon: Clock, description: 'Date and time picker', defaultConfig: { label: 'Select Date & Time' } },

  // Financial
  { type: 'currency', label: 'Currency', category: 'Financial', icon: DollarSign, description: 'Monetary amount input', defaultConfig: { label: 'Escrow Amount', currencySymbol: '$', placeholder: '0.00' } },

  // Upload
  { type: 'file', label: 'File Upload', category: 'Upload', icon: Upload, description: 'Documents & archives dropzone', defaultConfig: { label: 'File Upload', allowedTypes: ['.pdf', '.zip', '.docx'], maxSizeMb: 25 } },
  { type: 'image', label: 'Image Upload', category: 'Upload', icon: ImageIcon, description: 'Images dropzone', defaultConfig: { label: 'Image Upload', allowedTypes: ['.png', '.jpg', '.webp'], maxSizeMb: 10 } },

  // Web3 / Address
  { type: 'wallet', label: 'Wallet Address', category: 'Web3 / Address', icon: Wallet, description: 'Crypto wallet address input', defaultConfig: { label: 'Wallet Address', supportedNetwork: 'Ethereum (ERC-20)', placeholder: '0x...' } },
  { type: 'address', label: 'Address', category: 'Web3 / Address', icon: MapPin, description: 'Full physical address form', defaultConfig: { label: 'Shipping Address', requireCountry: true, requirePostalCode: true } },
];

export const FormBuilderPage: React.FC = () => {
  const { id: paramCategoryId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    categories,
    activeCategoryId,
    getCategory,
    addField,
    updateField,
    deleteField,
    duplicateField,
    reorderFields,
    saveForm,
    publishForm,
  } = useCategory();

  const currentCatId = paramCategoryId || activeCategoryId || categories[0]?.id;
  const category = currentCatId ? getCategory(currentCatId) : categories[0];

  // Mobile View Tab Switcher: 'palette' | 'builder' | 'preview'
  const [mobileTab, setMobileTab] = useState<'palette' | 'builder' | 'preview'>('builder');
  const [paletteSearch, setPaletteSearch] = useState('');

  // Field Drawer Editor State
  const [editingField, setEditingField] = useState<FormFieldConfig | null>(null);

  // Modals state
  const [deletingFieldId, setDeletingFieldId] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  // Drag and Drop reordering state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || !category || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const currentFields = [...(category.fields || [])];
    const movedItem = currentFields[draggedIndex];
    if (movedItem) {
      currentFields.splice(draggedIndex, 1);
      currentFields.splice(targetIndex, 0, movedItem);
      reorderFields(category.id, currentFields);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (!category) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-slate-200">No category selected</h2>
        <Button onClick={() => navigate('/categories')} className="mt-4 bg-indigo-600 text-white">
          Return to Categories
        </Button>
      </div>
    );
  }

  const fields = category.fields || [];

  // Group palette by category
  const filteredPalette = FIELD_TYPES.filter(
    (f) =>
      f.label.toLowerCase().includes(paletteSearch.toLowerCase()) ||
      f.category.toLowerCase().includes(paletteSearch.toLowerCase())
  );

  const categoriesGrouped = Array.from(new Set(filteredPalette.map((f) => f.category)));

  const handleAddField = (def: FieldTypeDefinition) => {
    const fieldName = `${def.type}_${Date.now().toString().slice(-4)}`;
    const newFieldData: Omit<FormFieldConfig, 'id'> = {
      type: def.type,
      label: def.defaultConfig.label || def.label,
      name: fieldName,
      required: true,
      enabled: true,
      order: fields.length + 1,
      ...def.defaultConfig,
    };

    addField(category.id, newFieldData);
    toast.success(`Added ${def.label} field`);

    // Automatically open drawer to edit newly added field
    const latestField: FormFieldConfig = {
      id: `temp-${Date.now()}`,
      ...newFieldData,
    };
    setEditingField(latestField);

    // Switch to builder view on mobile
    setMobileTab('builder');
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === fields.length - 1)
    )
      return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newFields = [...fields];
    const itemA = newFields[index];
    const itemB = newFields[targetIndex];
    if (itemA && itemB) {
      newFields[index] = itemB;
      newFields[targetIndex] = itemA;
      reorderFields(category.id, newFields);
    }
  };

  const handleSaveForm = () => {
    const result = saveForm(category.id);
    toast.success(result.message);
  };

  const handleConfirmPublish = async () => {
    const result = await publishForm(category.id);
    setIsPublishModalOpen(false);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold text-slate-100">{category.title || category.name}</h1>
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {fields.length} {fields.length === 1 ? 'Field' : 'Fields'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure dynamic inputs, custom validation rules, and layout for this escrow category.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleSaveForm}
            variant="outline"
            className="border-slate-800 bg-slate-950 text-slate-200 hover:text-white hover:bg-slate-900 text-xs font-semibold rounded-xl h-10 px-4 flex items-center gap-2"
          >
            <Save className="h-4 w-4 text-indigo-400" />
            <span>Save Draft</span>
          </Button>

          <Button
            onClick={() => setIsPublishModalOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 rounded-xl h-10 px-5 flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            <span>Publish Form</span>
          </Button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden rounded-xl bg-slate-950 p-1 border border-slate-800">
        <button
          onClick={() => setMobileTab('palette')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mobileTab === 'palette' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
        >
          Add Fields
        </button>
        <button
          onClick={() => setMobileTab('builder')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mobileTab === 'builder' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
        >
          Form Builder ({fields.length})
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mobileTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
        >
          Live Preview
        </button>
      </div>

      {/* 3-COLUMN MAIN BUILDER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN — FIELD TYPES PALETTE */}
        <div
          className={`lg:col-span-3 space-y-4 ${mobileTab === 'palette' ? 'block' : 'hidden lg:block'
            }`}
        >
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-2xl flex flex-col h-[calc(100vh-220px)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Available Field Types
              </h2>
              <span className="text-[10px] font-mono text-slate-500">{FIELD_TYPES.length} Types</span>
            </div>

            {/* Search Field Types */}
            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <Input
                placeholder="Search field types..."
                value={paletteSearch}
                onChange={(e) => setPaletteSearch(e.target.value)}
                className="pl-8 bg-slate-900 border-slate-800 text-slate-100 text-xs placeholder:text-slate-500 rounded-xl h-8"
              />
            </div>

            {/* Categorized List */}
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              {categoriesGrouped.map((catName) => (
                <div key={catName} className="space-y-2">
                  <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
                    {catName}
                  </h3>
                  <div className="grid grid-cols-1 gap-1.5">
                    {filteredPalette
                      .filter((f) => f.category === catName)
                      .map((fieldTypeDef) => {
                        const Icon = fieldTypeDef.icon;
                        return (
                          <button
                            key={fieldTypeDef.type}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/palette-type', fieldTypeDef.type);
                              e.dataTransfer.effectAllowed = 'copy';
                            }}
                            onClick={() => handleAddField(fieldTypeDef)}
                            className="group flex items-center justify-between w-full p-2.5 rounded-xl border border-slate-900 bg-slate-900/60 hover:bg-slate-900 hover:border-indigo-500/40 text-left transition-all shadow-sm cursor-grab active:cursor-grabbing"
                          >
                            <div className="flex items-center space-x-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 border border-slate-800 group-hover:border-indigo-500/40 group-hover:text-indigo-400 transition-colors text-slate-400">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-slate-200 group-hover:text-white block">
                                  {fieldTypeDef.label}
                                </span>
                                <span className="text-[10px] text-slate-500 block line-clamp-1">
                                  {fieldTypeDef.description}
                                </span>
                              </div>
                            </div>
                            <Plus className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN — FORM BUILDER FIELD LIST */}
        <div
          className={`lg:col-span-5 space-y-4 ${mobileTab === 'builder' ? 'block' : 'hidden lg:block'
            }`}
        >
          <div
            onDragOver={(e) => {
              if (e.dataTransfer.types.includes('text/palette-type')) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }
            }}
            onDrop={(e) => {
              const paletteType = e.dataTransfer.getData('text/palette-type');
              if (paletteType) {
                e.preventDefault();
                const def = FIELD_TYPES.find((f) => f.type === paletteType);
                if (def) handleAddField(def);
              }
            }}
            className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl flex flex-col h-[calc(100vh-220px)] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Form Schema Canvas
                </h2>
                <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {fields.length} Active
                </span>
              </div>
              <span className="text-[10px] text-slate-500">Drag to reorder</span>
            </div>

            {/* Field Canvas List */}
            {fields.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30 p-8 text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-200">No fields added yet</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Click or drag input types from the left palette to start building your dynamic form schema.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {fields.map((field, index) => {
                  const typeDef = FIELD_TYPES.find((t) => t.type === field.type);
                  const Icon = typeDef?.icon || Type;

                  return (
                    <div
                      key={field.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={() => {
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      className={`group relative rounded-xl border transition-all p-3.5 bg-slate-900/80 hover:bg-slate-900 ${dragOverIndex === index
                          ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                          : 'border-slate-800 hover:border-slate-700'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Drag Handle & Info */}
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <button
                            type="button"
                            className="mt-1 text-slate-600 group-hover:text-slate-400 cursor-grab active:cursor-grabbing p-0.5"
                            title="Drag to reorder"
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 border border-slate-800 shrink-0 text-indigo-400">
                            <Icon className="h-4.5 w-4.5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-xs font-bold text-slate-100 truncate">
                                {field.label}
                              </h4>
                              {field.required && (
                                <span className="text-[10px] text-rose-400 font-semibold bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                                  Required
                                </span>
                              )}
                              {field.width === 'half' && (
                                <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                                  Half Width
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                {field.name}
                              </span>
                              <span className="text-[10px] text-slate-500 uppercase font-mono">
                                • {field.type}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions Toolbar */}
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => handleMoveField(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-slate-500 hover:text-slate-200 disabled:opacity-30 transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleMoveField(index, 'down')}
                            disabled={index === fields.length - 1}
                            className="p-1 text-slate-500 hover:text-slate-200 disabled:opacity-30 transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingField(field)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Configuration"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => duplicateField(category.id, field.id)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Duplicate Field"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingFieldId(field.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Delete Field"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN — LIVE PREVIEW */}
        <div
          className={`lg:col-span-4 space-y-4 ${mobileTab === 'preview' ? 'block' : 'hidden lg:block'
            }`}
        >
          <LiveFormPreview
            title={category.title || category.name}
            description={category.description || ''}
            fields={fields}
            onReorder={(reordered) => reorderFields(category.id, reordered)}
          />
        </div>
      </div>

      {/* FIELD CONFIGURATION DRAWER */}
      {editingField && (
        <FieldEditorDrawer
          field={editingField}
          isOpen={Boolean(editingField)}
          onClose={() => setEditingField(null)}
          onSave={(updated) => {
            updateField(category.id, editingField.id, updated);
            setEditingField(null);
            toast.success(`Updated ${updated.label} configuration`);
          }}
        />
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingFieldId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Delete Field?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to remove this input from the category schema?
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <Button
                onClick={() => setDeletingFieldId(null)}
                variant="ghost"
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  deleteField(category.id, deletingFieldId);
                  setDeletingFieldId(null);
                  toast.success('Field deleted');
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM PUBLISH MODAL */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Publish Category Form Schema</h3>
                <p className="text-[11px] text-slate-400">{category.title || category.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Publishing will activate status for this category schema with {fields.length} input fields.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                onClick={() => setIsPublishModalOpen(false)}
                variant="ghost"
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmPublish}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl px-5"
              >
                Publish Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormBuilderPage;
