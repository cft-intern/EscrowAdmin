import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
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
  AlertTriangle,
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
    setActiveCategoryId,
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
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!category || draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newFields = [...fields];
    const movedItem = newFields[draggedIndex];
    if (movedItem) {
      newFields.splice(draggedIndex, 1);
      newFields.splice(targetIndex, 0, movedItem);
      reorderFields(category.id, newFields);
      toast.success('Fields reordered');
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
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
    saveForm(category.id);
    toast.success('Form draft saved successfully!');
  };

  const handleConfirmPublish = () => {
    publishForm(category.id);
    setIsPublishModalOpen(false);
    toast.success(`Category "${category.title}" form published successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold text-slate-100">{category.title}</h1>
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
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            mobileTab === 'palette' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          Add Fields
        </button>
        <button
          onClick={() => setMobileTab('builder')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            mobileTab === 'builder' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          Form Builder ({fields.length})
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            mobileTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          Live Preview
        </button>
      </div>

      {/* 3-COLUMN MAIN BUILDER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN — FIELD TYPES PALETTE */}
        <div
          className={`lg:col-span-3 space-y-4 ${
            mobileTab === 'palette' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-2xl flex flex-col h-[calc(100vh-260px)] space-y-4">
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
          className={`lg:col-span-5 space-y-4 ${
            mobileTab === 'builder' ? 'block' : 'hidden lg:block'
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
            className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl flex flex-col h-[calc(100vh-260px)] space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Form Structure
                </h2>
                <span className="text-[11px] font-medium text-slate-400">({fields.length} Fields)</span>
              </div>
              <span className="text-[10px] text-slate-500">Click & edit or drag to arrange</span>
            </div>

            {/* EMPTY STATE */}
            {fields.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 text-center p-6 space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 shadow-inner">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-200">No fields added yet</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Build your category form by selecting a field type from the left panel.
                </p>
                <Button
                  onClick={() => {
                    const firstType = FIELD_TYPES[0];
                    if (firstType) handleAddField(firstType);
                  }}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs mt-2 shadow-lg shadow-indigo-600/20"
                >
                  + Add Your First Field
                </Button>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`group relative rounded-2xl border p-4 shadow-lg transition-all flex flex-col space-y-3 cursor-grab active:cursor-grabbing ${
                      dragOverIndex === idx
                        ? 'border-indigo-500 bg-indigo-500/15 ring-2 ring-indigo-500/30 scale-[1.01]'
                        : field.enabled !== false
                        ? 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                        : 'border-slate-900 bg-slate-950/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {/* Left: Drag Handle (GripVertical) + Order buttons & Field Label */}
                      <div className="flex items-center space-x-2.5">
                        <div className="flex items-center space-x-1">
                          <GripVertical className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 shrink-0 cursor-grab" />
                          <div className="flex flex-col space-y-0.5">
                            <button
                              onClick={() => handleMoveField(idx, 'up')}
                              disabled={idx === 0}
                              className="text-slate-600 hover:text-slate-300 disabled:opacity-20"
                              title="Move Up"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleMoveField(idx, 'down')}
                              disabled={idx === fields.length - 1}
                              className="text-slate-600 hover:text-slate-300 disabled:opacity-20"
                              title="Move Down"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-slate-100">{field.label}</span>
                            {field.required && (
                              <span className="text-[10px] font-semibold text-rose-300 bg-rose-500/10 border border-rose-400/20 px-2 py-0.5 rounded-full">
                                Required
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-slate-500">
                            internal_name: {field.name}
                          </span>
                        </div>
                      </div>

                      {/* Right: Type Badge & Enable switch */}
                      <div className="flex items-center space-x-2">
                        {/* Width Badge Toggle */}
                        <button
                          type="button"
                          onClick={() => {
                            const currentHalf = field.width === 'half' || (!field.width && !['textarea', 'address', 'file', 'image', 'multiselect'].includes(field.type));
                            updateField(category.id, field.id, { width: currentHalf ? 'full' : 'half' });
                          }}
                          title="Click to toggle Field Width (Half vs Full)"
                          className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-800 hover:text-slate-200 px-2 py-0.5 rounded border border-slate-700 transition-colors"
                        >
                          {(field.width === 'half' || (!field.width && !['textarea', 'address', 'file', 'image', 'multiselect'].includes(field.type))) ? '50% Row' : '100% Row'}
                        </button>

                        <span className="text-[10px] font-mono font-semibold uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          {field.type}
                        </span>

                        <button
                          onClick={() => updateField(category.id, field.id, { enabled: !(field.enabled ?? true) })}
                          title={field.enabled !== false ? 'Enabled' : 'Disabled'}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            field.enabled !== false ? 'bg-emerald-600' : 'bg-slate-800'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ${
                              field.enabled !== false ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Currency Dropdown Field Inline Preview */}
                    {field.type === 'currency' && (
                      <div className="my-2.5 flex rounded-lg border border-slate-800 bg-slate-950 overflow-hidden text-[11px]">
                        <div className="flex items-center px-2 py-1 bg-slate-900 border-r border-slate-800 text-indigo-400 font-semibold space-x-1">
                          <span>{field.currencySymbol || '$'}</span>
                          <span className="text-[9px] text-slate-400">▼ (USD, EUR, GBP, ETH, SOL)</span>
                        </div>
                        <div className="px-2.5 py-1 text-slate-500 italic flex-1">
                          {field.placeholder || '0.00'}
                        </div>
                      </div>
                    )}

                    {/* Card Footer Actions */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {field.placeholder || field.description || 'No placeholder configured'}
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setEditingField(field)}
                          className="flex items-center space-x-1 px-2 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => duplicateField(category.id, field.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                          title="Duplicate"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingFieldId(field.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN — LIVE DYNAMIC PREVIEW */}
        <div
          className={`lg:col-span-4 ${
            mobileTab === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="sticky top-20">
            <LiveFormPreview
              title={category.title}
              description={category.description}
              fields={fields}
              onReorder={(newFields) => {
                reorderFields(category.id, newFields);
                toast.success('Fields reordered');
              }}
            />
          </div>
        </div>
      </div>

      {/* FIELD EDITOR DRAWER */}
      <FieldEditorDrawer
        field={editingField}
        isOpen={!!editingField}
        onClose={() => setEditingField(null)}
        onSave={(updatedField) => {
          updateField(category.id, updatedField.id, updatedField);
          toast.success(`Updated "${updatedField.label}" configuration.`);
        }}
      />

      {/* DELETE FIELD CONFIRMATION MODAL */}
      {deletingFieldId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="h-5 w-5 text-rose-300" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Delete Field?</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to remove this field from the category form?
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3">
              <Button
                variant="ghost"
                onClick={() => setDeletingFieldId(null)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl px-4 h-9"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  deleteField(category.id, deletingFieldId);
                  setDeletingFieldId(null);
                  toast.success('Field deleted.');
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl"
              >
                Delete Field
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH FORM CONFIRMATION MODAL */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-100">Publish Category Form</h3>
              <p className="text-sm font-semibold text-indigo-400">{category.title}</p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Configured Fields:</span>
                <span className="font-bold text-white">{fields.length} fields</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800">
                This will make the current form configuration the active configuration for this category.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <Button
                variant="ghost"
                onClick={() => setIsPublishModalOpen(false)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl px-4 h-9"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmPublish}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl px-4"
              >
                Publish Form
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
