import React, { useState, useEffect } from 'react';
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
  Send,
  Save,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Layers,
  FolderPlus,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCategory } from '@/context/CategoryContext';
import { FieldType, FormFieldConfig, FormStep, FieldGroup, mapFieldTypeToApi, generateUniqueFieldKey } from '@/types/escrowTypes';
import { categoryService } from '@/services/categoryService';
import { LiveFormPreview } from '@/components/admin/LiveFormPreview';
import { FieldEditorDrawer } from '@/components/admin/FieldEditorDrawer';
import { PublishFormModal } from '@/components/admin/PublishFormModal';
import { FormPreviewModal } from '@/components/admin/FormPreviewModal';
import handleCategoryApiError from '@/utils/categoryErrorHandler';
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
  // Supported Standard Types
  { type: 'STRING' as FieldType, label: 'STRING', category: 'Basic', icon: Type, description: 'Text string field', defaultConfig: { label: 'String Input', fieldType: 'STRING', key: 'string_input' } },
  { type: 'TEXTAREA' as FieldType, label: 'TEXTAREA', category: 'Basic', icon: AlignLeft, description: 'Multi-line text area', defaultConfig: { label: 'Description', fieldType: 'TEXTAREA', key: 'description_field' } },
  { type: 'NUMBER' as FieldType, label: 'NUMBER', category: 'Basic', icon: Hash, description: 'Numeric input', defaultConfig: { label: 'Quantity', fieldType: 'NUMBER', key: 'quantity' } },
  { type: 'BOOLEAN' as FieldType, label: 'BOOLEAN', category: 'Selection', icon: ToggleLeft, description: 'Boolean true/false toggle', defaultConfig: { label: 'Is Active', fieldType: 'BOOLEAN', key: 'is_active' } },
  { type: 'CHECKBOX' as FieldType, label: 'CHECKBOX', category: 'Selection', icon: CheckSquare, description: 'Checkbox toggle', defaultConfig: { label: 'Accept Terms', fieldType: 'CHECKBOX', key: 'accept_terms' } },
  { type: 'DATE' as FieldType, label: 'DATE', category: 'Date', icon: Calendar, description: 'Date picker input', defaultConfig: { label: 'Expiry Date', fieldType: 'DATE', key: 'expiry_date' } },
  { type: 'DROPDOWN' as FieldType, label: 'DROPDOWN', category: 'Selection', icon: List, description: 'Dropdown selection menu', defaultConfig: { label: 'Category Select', fieldType: 'DROPDOWN', key: 'category_select', options: [{ id: 'opt-1', label: 'Option 1', value: 'option_1' }] } },
  { type: 'RADIO' as FieldType, label: 'RADIO', category: 'Selection', icon: CircleDot, description: 'Radio button selection', defaultConfig: { label: 'Choice Radio', fieldType: 'RADIO', key: 'choice_radio', options: [{ id: 'opt-1', label: 'Option A', value: 'option_a' }] } },
  { type: 'LOCATION' as FieldType, label: 'LOCATION', category: 'Web3 / Address', icon: MapPin, description: 'Location & address field', defaultConfig: { label: 'Location', fieldType: 'LOCATION', key: 'location' } },
  
  // Upload Types
  { type: 'FILE' as FieldType, label: 'FILE', category: 'Upload', icon: Upload, description: 'File upload document', defaultConfig: { label: 'Attachment File', fieldType: 'FILE', key: 'attachment_file', maxSizeMb: 25 } },
  { type: 'IMAGE' as FieldType, label: 'IMAGE', category: 'Upload', icon: ImageIcon, description: 'Image asset upload', defaultConfig: { label: 'Cover Image', fieldType: 'IMAGE', key: 'cover_image', maxSizeMb: 10 } },
  { type: 'VIDEO' as FieldType, label: 'VIDEO', category: 'Upload', icon: Upload, description: 'Video file upload', defaultConfig: { label: 'Demo Video', fieldType: 'VIDEO', key: 'demo_video', maxSizeMb: 100 } },
  { type: 'DOCUMENT' as FieldType, label: 'DOCUMENT', category: 'Upload', icon: Upload, description: 'PDF / Doc file upload', defaultConfig: { label: 'Contract Document', fieldType: 'DOCUMENT', key: 'contract_document', maxSizeMb: 50 } },

  // Friendly Helpers
  { type: 'text', label: 'Text', category: 'Basic', icon: Type, description: 'Single line text input', defaultConfig: { label: 'New Text Field', fieldType: 'STRING', placeholder: 'Enter text' } },
  { type: 'email', label: 'Email', category: 'Basic', icon: Mail, description: 'Email address validation', defaultConfig: { label: 'Email Address', fieldType: 'STRING', placeholder: 'user@example.com' } },
  { type: 'phone', label: 'Phone', category: 'Basic', icon: Phone, description: 'Phone number input', defaultConfig: { label: 'Phone Number', fieldType: 'STRING', placeholder: '+1 (555) 000-0000' } },
  { type: 'url', label: 'URL', category: 'Basic', icon: Link, description: 'Web link URL input', defaultConfig: { label: 'Website URL', fieldType: 'STRING', placeholder: 'https://example.com' } },
  { type: 'currency', label: 'Currency', category: 'Financial', icon: DollarSign, description: 'Monetary amount input', defaultConfig: { label: 'Escrow Amount', fieldType: 'NUMBER', currencySymbol: '$', placeholder: '0.00' } },
  { type: 'wallet', label: 'Wallet Address', category: 'Web3 / Address', icon: Wallet, description: 'Crypto wallet address input', defaultConfig: { label: 'Wallet Address', fieldType: 'STRING', supportedNetwork: 'Ethereum (ERC-20)', placeholder: '0x...' } },
];

export const FormBuilderPage: React.FC = () => {
  const { id: paramCategoryId, domainId } = useParams<{ id?: string; domainId?: string }>();
  const navigate = useNavigate();
  const {
    categories,
    activeCategoryId,
    getCategory,
    updateCategory,
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
    duplicateField,
    saveForm,
  } = useCategory();

  const currentCatId = domainId || paramCategoryId || activeCategoryId || categories[0]?.id;
  const category = currentCatId ? getCategory(currentCatId) : categories[0];

  // Mobile View Tab Switcher: 'palette' | 'builder' | 'preview'
  const [mobileTab, setMobileTab] = useState<'palette' | 'builder' | 'preview'>('builder');
  const [paletteSearch, setPaletteSearch] = useState('');

  // Active Step state inside Form Builder
  const [selectedStepId, setSelectedStepId] = useState<string>('');

  // Field Drawer Editor State
  const [editingField, setEditingField] = useState<FormFieldConfig | null>(null);

  // Modals state
  const [deletingFieldId, setDeletingFieldId] = useState<string | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [newStepName, setNewStepName] = useState('');
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  // Form info editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [slugInput, setSlugInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [iconInput, setIconInput] = useState('');
  const [requiresShippingInput, setRequiresShippingInput] = useState(false);
  const [hasSlugConflict, setHasSlugConflict] = useState(false);

  // Drag and Drop reordering state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    if (!currentCatId) return;

    let isMounted = true;
    const fetchCategoryFormDetail = async () => {
      setIsLoadingDetail(true);
      try {
        const response = await categoryService.getById(currentCatId);
        if (response && response.data && isMounted) {
          updateCategory(currentCatId, response.data);
        }
      } catch (err) {
        console.error('Failed to load category form detail:', err);
      } finally {
        if (isMounted) setIsLoadingDetail(false);
      }
    };

    fetchCategoryFormDetail();
  }, [currentCatId]);

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

  const steps: FormStep[] = category.steps && category.steps.length > 0 ? category.steps : [
    {
      id: 'step-1',
      name: 'Basic Information',
      order: 1,
      description: 'General category inputs and parameters',
      fields: category.fields || [],
      fieldGroups: [],
    }
  ];

  const currentStep = steps.find((s) => s.id === selectedStepId) || steps[0];
  const activeStep: FormStep = currentStep || steps[0] || {
    id: 'step-1',
    name: 'Basic Information',
    order: 1,
    description: '',
    fields: category.fields || [],
    fieldGroups: [],
  };
  const stepFields = activeStep.fields || [];
  const totalFieldsCount = steps.reduce((sum, s) => sum + (s.fields ? s.fields.length : 0), 0);

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
    if (draggedIndex === null || !activeStep || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const currentFields = [...(activeStep.fields || [])];
    const movedItem = currentFields[draggedIndex];
    if (movedItem) {
      currentFields.splice(draggedIndex, 1);
      currentFields.splice(targetIndex, 0, movedItem);
      reorderFieldsInStep(category.id, activeStep.id, currentFields);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Group palette by category
  const filteredPalette = FIELD_TYPES.filter(
    (f) =>
      f.label.toLowerCase().includes(paletteSearch.toLowerCase()) ||
      f.category.toLowerCase().includes(paletteSearch.toLowerCase())
  );

  const categoriesGrouped = Array.from(new Set(filteredPalette.map((f) => f.category)));

  const handleAddField = (def: FieldTypeDefinition, groupId?: string) => {
    const targetLabel = def.defaultConfig.label || def.label;
    const existingKeys = (category?.steps || []).flatMap((st) => (st.fields || []).map((f) => f.key || f.name));
    const safeKey = generateUniqueFieldKey(
      def.defaultConfig.key || targetLabel,
      existingKeys
    );
    const validFieldType = mapFieldTypeToApi(def.defaultConfig.fieldType, def.type as string);

    const newFieldData: Omit<FormFieldConfig, 'id'> = {
      type: def.type,
      fieldType: validFieldType,
      label: targetLabel,
      required: true,
      enabled: true,
      order: stepFields.length + 1,
      fieldsPerRow: def.type === 'textarea' || def.type === 'address' || def.type === 'file' || def.type === 'image' ? 1 : 2,
      width: def.type === 'textarea' || def.type === 'address' || def.type === 'file' || def.type === 'image' ? 'full' : 'half',
      groupId: groupId,
      ...def.defaultConfig,
      key: safeKey,
      name: safeKey,
    };

    addFieldToStep(category.id, activeStep.id, newFieldData, groupId);
    toast.success(`Added ${def.label} to ${activeStep.name}`);

    // Switch to builder view on mobile
    setMobileTab('builder');
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === stepFields.length - 1)
    )
      return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newFields = [...stepFields];
    const itemA = newFields[index];
    const itemB = newFields[targetIndex];
    if (itemA && itemB) {
      newFields[index] = itemB;
      newFields[targetIndex] = itemA;
      reorderFieldsInStep(category.id, activeStep.id, newFields);
    }
  };

  const handleCreateStep = () => {
    if (!newStepName.trim()) return;
    addStep(category.id, newStepName.trim());
    toast.success(`Created step "${newStepName.trim()}"`);
    setNewStepName('');
    setIsAddStepModalOpen(false);
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim() || !currentStep) return;
    addFieldGroup(category.id, currentStep.id, newGroupName.trim());
    toast.success(`Added field group "${newGroupName.trim()}"`);
    setNewGroupName('');
    setIsAddGroupModalOpen(false);
  };

  const handleMoveStep = (stepIdx: number, direction: 'left' | 'right') => {
    if (
      (direction === 'left' && stepIdx === 0) ||
      (direction === 'right' && stepIdx === steps.length - 1)
    )
      return;

    const targetIdx = direction === 'left' ? stepIdx - 1 : stepIdx + 1;
    const newSteps = [...steps];
    const itemA = newSteps[stepIdx];
    const itemB = newSteps[targetIdx];
    if (itemA && itemB) {
      newSteps[stepIdx] = itemB;
      newSteps[targetIdx] = itemA;
      reorderSteps(category.id, newSteps);
    }
  };

  const validateFieldKeysUnique = (): { isUnique: boolean; duplicateKey?: string } => {
    const allFields = steps.flatMap((s) => s.fields || []);
    const keysSeen = new Set<string>();

    for (const f of allFields) {
      const k = (f.key || f.name || f.label || '').toLowerCase().trim();
      if (!k) continue;
      if (keysSeen.has(k)) {
        return { isUnique: false, duplicateKey: k };
      }
      keysSeen.add(k);
    }
    return { isUnique: true };
  };

  const handleSaveTitleDesc = () => {
    if (titleInput.trim()) {
      updateCategory(category.id, {
        title: titleInput.trim(),
        name: titleInput.trim(),
        slug: slugInput.trim() || titleInput.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: descInput.trim(),
        icon: iconInput || category.icon || 'Shield',
        requiresShipping: requiresShippingInput,
      });
      toast.success('Category information updated');
    }
    setIsEditingTitle(false);
  };

  const handleSaveDraft = async () => {
    if (isSavingDraft) return;

    const keyCheck = validateFieldKeysUnique();
    if (!keyCheck.isUnique) {
      toast.error(`Duplicate field key "${keyCheck.duplicateKey}" found. All field keys must be unique.`);
      return;
    }

    setIsSavingDraft(true);
    setHasSlugConflict(false);

    try {
      const res = await saveForm(category.id);
      if (res.success) {
        toast.success('Form saved as draft! You can continue editing or publish later.');
      } else {
        if (res.message.toLowerCase().includes('slug')) {
          setHasSlugConflict(true);
          setIsEditingTitle(true);
        }
        toast.error(res.message || 'Failed to save draft.');
      }
    } catch (err: any) {
      handleCategoryApiError(err, {
        onSlugConflict: () => {
          setHasSlugConflict(true);
          setIsEditingTitle(true);
        },
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden space-y-4 min-h-0">
      {/* Top Header & Actions */}
      <div className="shrink-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div>
          <button
            onClick={() => navigate('/categories')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-400 mb-1 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Domains</span>
          </button>

          {!isEditingTitle ? (
            <div className="flex items-center space-x-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100">{category.title || category.name}</h1>
              <button
                onClick={() => {
                  setTitleInput(category.title || category.name);
                  setSlugInput(category.slug || (category.title || category.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  setDescInput(category.description || '');
                  setIconInput(category.icon || 'Shield');
                  setRequiresShippingInput(Boolean(category.requiresShipping));
                  setIsEditingTitle(true);
                }}
                className="p-1 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Edit Category Info (Name, Slug, Shipping)"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {totalFieldsCount} {totalFieldsCount === 1 ? 'Field' : 'Fields'} across {steps.length} {steps.length === 1 ? 'Step' : 'Steps'}
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 mt-1 bg-slate-950 p-2 rounded-2xl border border-slate-800">
              <Input
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="Category Name"
                className="bg-slate-900 border-slate-700 text-slate-100 font-bold text-xs h-9 rounded-xl w-44"
              />
              <div className="relative">
                <Input
                  value={slugInput}
                  onChange={(e) => {
                    setSlugInput(e.target.value);
                    if (hasSlugConflict) setHasSlugConflict(false);
                  }}
                  placeholder="Slug"
                  className={`bg-slate-900 font-mono text-indigo-300 text-xs h-9 rounded-xl w-36 ${
                    hasSlugConflict
                      ? 'border-2 border-red-500 ring-2 ring-red-500/30 text-red-300'
                      : 'border-slate-700'
                  }`}
                />
                {hasSlugConflict && (
                  <span className="text-[10px] text-red-400 font-semibold block mt-0.5 animate-pulse">
                    Slug Conflict
                  </span>
                )}
              </div>
              <Input
                value={descInput}
                onChange={(e) => setDescInput(e.target.value)}
                placeholder="Description"
                className="bg-slate-900 border-slate-700 text-slate-100 text-xs h-9 rounded-xl w-48"
              />
              <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer px-2.5 py-1 bg-slate-900 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  checked={requiresShippingInput}
                  onChange={(e) => setRequiresShippingInput(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 bg-slate-950"
                />
                <span>Requires Shipping</span>
              </label>
              <Button onClick={handleSaveTitleDesc} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 px-3 rounded-xl">
                Save Info
              </Button>
            </div>
          )}

          <p className="text-xs text-slate-400 mt-0.5">
            {category.description || 'Configure multi-step dynamic inputs, custom validation rules, and layout for this form.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setIsPreviewModalOpen(true)}
            variant="outline"
            className="border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800 hover:text-white font-bold text-xs rounded-xl h-10 px-4 flex items-center gap-2 shadow-sm"
          >
            <Eye className="h-4 w-4 text-sky-400" />
            <span>Preview Form</span>
          </Button>

          <Button
            onClick={() => {
              if (totalFieldsCount === 0) {
                toast.error('Input fields is 0. At least 1 field is required to publish.');
                return;
              }
              setIsPublishModalOpen(true);
            }}
            disabled={totalFieldsCount === 0}
            title={totalFieldsCount === 0 ? 'Input fields is 0. At least 1 field is required.' : 'Publish Form'}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 rounded-xl h-10 px-5 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            <span>Publish Form</span>
          </Button>
        </div>
      </div>

      {/* Multi-Step Toolbar Bar */}
      <div className="shrink-0 bg-slate-950 border border-slate-800 rounded-2xl p-2 flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center space-x-2 min-w-max">
          <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Layers className="h-4 w-4 text-indigo-400" />
            <span>Steps:</span>
          </div>

          {steps.map((step, sIdx) => {
            const isSelected = step.id === activeStep.id;
            return (
              <div key={step.id} className="flex items-center space-x-1 bg-slate-900/60 rounded-xl p-1 border border-slate-800">
                <button
                  onClick={() => setSelectedStepId(step.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="h-4 w-4 rounded-full bg-slate-950/60 flex items-center justify-center text-[10px] font-mono">
                    {sIdx + 1}
                  </span>
                  <span>{step.name}</span>
                  <span className="text-[10px] opacity-75 font-normal">
                    ({step.fields.length})
                  </span>
                </button>

                {isSelected && (
                  <div className="flex items-center space-x-0.5 border-l border-slate-800 pl-1">
                    <button
                      onClick={() => handleMoveStep(sIdx, 'left')}
                      disabled={sIdx === 0}
                      className="p-1 text-slate-500 hover:text-slate-200 disabled:opacity-30"
                      title="Move Step Left"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveStep(sIdx, 'right')}
                      disabled={sIdx === steps.length - 1}
                      className="p-1 text-slate-500 hover:text-slate-200 disabled:opacity-30"
                      title="Move Step Right"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                    {steps.length > 1 && (
                      <button
                        onClick={() => {
                          deleteStep(category.id, step.id);
                          toast.success(`Deleted step "${step.name}"`);
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Delete Step"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Button
            onClick={() => setIsAddStepModalOpen(true)}
            variant="outline"
            className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 text-xs font-semibold h-8 rounded-xl px-3"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Step
          </Button>

          {currentStep && (
            <Button
              onClick={() => setIsAddGroupModalOpen(true)}
              variant="outline"
              className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 text-xs font-semibold h-8 rounded-xl px-3"
            >
              <FolderPlus className="h-3.5 w-3.5 mr-1" />
              Add Field Group
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="shrink-0 flex lg:hidden rounded-xl bg-slate-950 p-1 border border-slate-800">
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
          Form Builder ({totalFieldsCount})
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
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full overflow-hidden">
        {/* LEFT COLUMN — FIELD TYPES PALETTE */}
        <div
          className={`lg:col-span-3 h-full flex flex-col min-h-0 ${
            mobileTab === 'palette' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-2xl flex flex-col h-full overflow-hidden space-y-3 min-h-0">
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
            <div className="space-y-4 flex-1 overflow-y-auto pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-800/80 [&::-webkit-scrollbar-thumb]:rounded-full">
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

        {/* CENTER COLUMN — FORM BUILDER FIELD LIST FOR ACTIVE STEP */}
        <div
          className={`lg:col-span-5 h-full flex flex-col min-h-0 ${
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
            className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl flex flex-col h-full overflow-hidden space-y-4 min-h-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {currentStep ? currentStep.name : 'Form Canvas'}
                </h2>
                <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {stepFields.length} Step Fields
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium shrink-0">Drag to reorder fields</span>
            </div>

            {/* Field Canvas List */}
            {stepFields.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30 p-8 text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-200">Input fields is 0 in {currentStep?.name}</h3>
                <p className="text-xs text-rose-300 font-medium max-w-xs leading-relaxed bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                  At least 1 field is required to publish this form.
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs">
                  Click or drag input types from the left palette to add fields to this step.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-800/80 [&::-webkit-scrollbar-thumb]:rounded-full">
                {stepFields.map((field, index) => {
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
                      className={`group relative rounded-xl border transition-all p-3.5 bg-slate-900/80 hover:bg-slate-900 ${
                        dragOverIndex === index
                          ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        {/* Drag Handle & Info */}
                        <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                          <button
                            type="button"
                            className="mt-1 text-slate-600 group-hover:text-slate-400 cursor-grab active:cursor-grabbing p-0.5 shrink-0"
                            title="Drag to reorder"
                          >
                            <GripVertical className="h-4 w-4" />
                          </button>

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 border border-slate-800 shrink-0 text-indigo-400">
                            <Icon className="h-4.5 w-4.5" />
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            {/* Label & Badges */}
                            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                              <h4 className="text-xs font-bold text-slate-100 truncate max-w-[150px] sm:max-w-[220px]">
                                {field.label || 'Untitled Field'}
                              </h4>
                              {field.required && (
                                <span className="text-[9px] text-rose-400 font-semibold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 shrink-0">
                                  Required
                                </span>
                              )}
                              {(field.fieldsPerRow === 2 || field.width === 'half') ? (
                                <span className="text-[9px] text-indigo-400 font-semibold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 shrink-0">
                                  2 Per Row
                                </span>
                              ) : (
                                <span className="text-[9px] text-slate-400 font-semibold bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700 shrink-0">
                                  Full Width
                                </span>
                              )}
                            </div>

                            {/* Key & Type */}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-mono text-indigo-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 max-w-full truncate">
                                key: {field.name || field.key}
                              </span>
                              <span className="text-[10px] text-slate-500 uppercase font-mono shrink-0">
                                • {field.type}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions Toolbar */}
                        <div className="flex items-center space-x-0.5 shrink-0 bg-slate-950/60 p-1 rounded-lg border border-slate-800/80">
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
                            disabled={index === stepFields.length - 1}
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
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => duplicateField(category.id, field.id)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Duplicate Field"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingFieldId(field.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Delete Field"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
          className={`lg:col-span-4 h-full flex flex-col min-h-0 ${
            mobileTab === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          <LiveFormPreview
            title={category.title || category.name}
            description={category.description || ''}
            fields={category.fields || []}
            steps={steps}
            onReorder={(reordered) => reorderFieldsInStep(category.id, activeStep.id, reordered)}
          />
        </div>
      </div>

      {/* CREATE STEP MODAL */}
      {isAddStepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Add New Form Step</h3>
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold">Step Name</label>
              <Input
                value={newStepName}
                onChange={(e) => setNewStepName(e.target.value)}
                placeholder="e.g. Contact Details"
                className="bg-slate-950 border-slate-800 text-xs rounded-xl h-10"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                onClick={() => setIsAddStepModalOpen(false)}
                variant="ghost"
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateStep}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
              >
                Create Step
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE FIELD GROUP MODAL */}
      {isAddGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Add Field Group</h3>
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-semibold">Group Name</label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g. Bank Information"
                className="bg-slate-950 border-slate-800 text-xs rounded-xl h-10"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                onClick={() => setIsAddGroupModalOpen(false)}
                variant="ghost"
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateGroup}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
              >
                Create Group
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* FIELD CONFIGURATION DRAWER */}
      {editingField && (
        <FieldEditorDrawer
          field={editingField}
          isOpen={Boolean(editingField)}
          onClose={() => setEditingField(null)}
          onSave={(updated) => {
            updateFieldInStep(category.id, activeStep.id, editingField.id, updated);
            setEditingField(null);
            toast.success(`Updated ${updated.label} configuration`);
          }}
          existingKeys={(category?.steps || []).flatMap((st) => (st.fields || []).map((f) => f.key || f.name))}
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
              Are you sure you want to remove this input from the category step schema?
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
                  deleteFieldFromStep(category.id, activeStep.id, deletingFieldId);
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

      {/* PUBLISH TO DOMAINS SELECTION MODAL */}
      <PublishFormModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        currentCategoryId={category.id}
        currentCategoryName={category.title || category.name}
        fields={category.fields || []}
      />

      {/* INTERACTIVE MULTI-STEP FORM PREVIEW MODAL */}
      <FormPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        onEditForm={() => setIsPreviewModalOpen(false)}
        categoryTitle={category.title || category.name}
        categoryDescription={category.description}
        steps={steps}
        fields={category.fields || []}
      />
    </div>
  );
};

export default FormBuilderPage;
