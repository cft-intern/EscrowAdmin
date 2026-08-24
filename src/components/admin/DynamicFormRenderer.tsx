import React, { useEffect, useState } from 'react';
import categoryService from '@/services/categoryService';
import handleCategoryApiError from '@/utils/categoryErrorHandler';
import { FormFieldConfig, FormStep, SupportedFieldType } from '@/types/escrowTypes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, ChevronLeft, ChevronRight, Check, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface DynamicFormRendererProps {
  categoryId: string;
  onSuccess?: (response: any) => void;
  className?: string;
}

export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  categoryId,
  onSuccess,
  className = '',
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formSchema, setFormSchema] = useState<any>(null);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    const fetchFormSchema = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await categoryService.getForm(categoryId);
        if (isMounted) {
          setFormSchema(res.data);
        }
      } catch (err: any) {
        if (isMounted) {
          // Fallback to getById if /form endpoint falls back
          try {
            const catRes = await categoryService.getById(categoryId);
            setFormSchema(catRes.data);
          } catch (innerErr: any) {
            setError(err?.message || 'Failed to load dynamic form schema.');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (categoryId) {
      fetchFormSchema();
    }
  }, [categoryId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-sky-400 mb-3" />
        <p className="text-sm font-medium">Loading form configuration...</p>
      </div>
    );
  }

  if (error || !formSchema) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-center text-rose-300">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-rose-400" />
        <p className="text-sm font-semibold">{error || 'Form configuration not available.'}</p>
      </div>
    );
  }

  // Parse steps, fields, fieldGroups sorted by displayOrder
  const rawSteps = formSchema.steps || formSchema.data?.steps || [];
  const normalizedSteps: FormStep[] = Array.isArray(rawSteps) && rawSteps.length > 0
    ? [...rawSteps].sort((a, b) => (a.displayOrder || a.order || 0) - (b.displayOrder || b.order || 0))
    : [
        {
          id: 'step-1',
          name: formSchema.name || 'Step 1',
          order: 1,
          displayOrder: 1,
          fields: Array.isArray(formSchema.fields) ? formSchema.fields : Array.isArray(formSchema.fieldDefinitions) ? formSchema.fieldDefinitions : [],
          fieldGroups: Array.isArray(formSchema.fieldGroups) ? formSchema.fieldGroups : [],
        },
      ];

  const currentStep = (normalizedSteps[Math.min(activeStepIdx, normalizedSteps.length - 1)] || normalizedSteps[0]) || { id: 'step-1', name: 'Step 1', order: 1, fields: [], fieldGroups: [] };
  const rawFields: FormFieldConfig[] = (currentStep.fields && currentStep.fields.length > 0)
    ? currentStep.fields
    : ((currentStep as any).fieldDefinitions || []);
  const activeFields = [...rawFields].sort((a, b) => (a.displayOrder || a.order || 0) - (b.displayOrder || b.order || 0));
  const fieldGroups = [...(currentStep.fieldGroups || [])].sort((a, b) => (a.displayOrder || a.order || 0) - (b.displayOrder || b.order || 0));
  const ungroupedFields = activeFields.filter((f) => !f.groupId);

  const handleInputChange = (key: string, val: any) => {
    setFormValues((prev) => ({ ...prev, [key]: val }));
    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};
    for (const field of activeFields) {
      const fieldKey = field.key || field.name;
      const isReq = field.isRequired ?? field.required;
      const val = formValues[fieldKey];

      if (isReq && (val === undefined || val === null || val === '')) {
        errors[fieldKey] = `${field.label || fieldKey} is required.`;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStepIdx((prev) => Math.min(normalizedSteps.length - 1, prev + 1));
    } else {
      toast.error('Please fill in all required fields.');
    }
  };

  const handleSubmitContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateCurrentStep()) {
      toast.error('Please fix validation errors before submitting.');
      return;
    }

    // Format fields array for POST /contracts spec:
    // fields: [ { key: string, value: any } ] inside items[].fields
    const dynamicFieldsArray = Object.entries(formValues).map(([key, value]) => ({
      key,
      value,
    }));

    const contractPayload = {
      categoryId,
      items: [
        {
          fields: dynamicFieldsArray,
        },
      ],
    };

    setIsSubmitting(true);
    try {
      const response = await categoryService.submitContract(contractPayload);
      toast.success('Contract created successfully!');
      if (onSuccess) onSuccess(response);
    } catch (err: any) {
      handleCategoryApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInputField = (field: FormFieldConfig) => {
    const fieldKey = field.key || field.name;
    const typeUpper = String(field.fieldType || field.type || 'STRING').toUpperCase() as SupportedFieldType;
    const val = formValues[fieldKey] ?? field.defaultValue ?? '';
    const hasError = Boolean(validationErrors[fieldKey]);

    switch (typeUpper) {
      case 'STRING':
      case 'LOCATION':
        return (
          <Input
            type="text"
            value={val}
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            placeholder={field.placeholder || 'Enter value'}
            className={`bg-[#0b1329] border-[#1b2a4a] text-slate-100 placeholder:text-slate-500 rounded-xl h-11 text-xs focus:ring-1 ${
              hasError ? 'border-rose-500 ring-rose-500' : 'focus:ring-sky-500'
            }`}
          />
        );

      case 'TEXTAREA':
        return (
          <textarea
            value={val}
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            placeholder={field.placeholder || 'Enter text'}
            rows={field.rows || 3}
            className={`w-full rounded-xl border bg-[#0b1329] p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 resize-y ${
              hasError ? 'border-rose-500 ring-rose-500' : 'border-[#1b2a4a] focus:ring-sky-500'
            }`}
          />
        );

      case 'NUMBER':
        return (
          <Input
            type="number"
            value={val}
            min={field.min}
            max={field.max}
            step={field.step || 'any'}
            onChange={(e) => handleInputChange(fieldKey, e.target.value !== '' ? Number(e.target.value) : '')}
            placeholder={field.placeholder || '0'}
            className={`bg-[#0b1329] border-[#1b2a4a] text-slate-100 placeholder:text-slate-500 rounded-xl h-11 text-xs focus:ring-1 ${
              hasError ? 'border-rose-500 ring-rose-500' : 'focus:ring-sky-500'
            }`}
          />
        );

      case 'DATE':
        return (
          <Input
            type="date"
            value={val}
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            className={`bg-[#0b1329] border-[#1b2a4a] text-slate-100 rounded-xl h-11 text-xs focus:ring-1 ${
              hasError ? 'border-rose-500 ring-rose-500' : 'focus:ring-sky-500'
            }`}
          />
        );

      case 'BOOLEAN':
      case 'CHECKBOX':
        return (
          <label className="flex items-center space-x-3 cursor-pointer bg-[#0b1329] p-3.5 rounded-xl border border-[#1b2a4a]">
            <input
              type="checkbox"
              checked={Boolean(val)}
              onChange={(e) => handleInputChange(fieldKey, e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500 h-4 w-4"
            />
            <span className="text-xs font-semibold text-slate-200">{field.label}</span>
          </label>
        );

      case 'DROPDOWN':
        return (
          <Select value={String(val)} onValueChange={(v) => handleInputChange(fieldKey, v)}>
            <SelectTrigger className={`w-full bg-[#0b1329] border-[#1b2a4a] text-slate-100 rounded-xl h-11 text-xs ${
              hasError ? 'border-rose-500' : ''
            }`}>
              <SelectValue placeholder={field.placeholder || 'Select an option...'} />
            </SelectTrigger>
            <SelectContent className="bg-[#0e1935] border-[#1b2a4a] text-slate-100 rounded-xl shadow-2xl z-[200]">
              {(field.options || []).map((opt) => (
                <SelectItem key={opt.id || opt.value} value={opt.value} className="text-xs cursor-pointer focus:bg-sky-600 focus:text-white">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'RADIO':
        return (
          <div className="space-y-2 pt-1">
            {(field.options || []).map((opt) => (
              <label key={opt.id || opt.value} className="flex items-center space-x-2.5 text-xs text-slate-200 cursor-pointer bg-[#0b1329] p-3 rounded-xl border border-[#1b2a4a]">
                <input
                  type="radio"
                  name={fieldKey}
                  value={opt.value}
                  checked={String(val) === String(opt.value)}
                  onChange={() => handleInputChange(fieldKey, opt.value)}
                  className="text-sky-500 focus:ring-sky-500 bg-slate-950 border-slate-700"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'FILE':
      case 'IMAGE':
      case 'VIDEO':
      case 'DOCUMENT':
        return (
          <div className={`border border-dashed rounded-xl p-5 text-center bg-[#0b1329]/60 hover:border-sky-500/50 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[100px] ${
            hasError ? 'border-rose-500' : 'border-[#1b2a4a]'
          }`}>
            <Upload className="h-5 w-5 text-sky-400 mb-1.5" />
            <p className="text-xs font-semibold text-slate-300">Upload {typeUpper}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Max Size: {field.maxSizeMb || 25}MB
            </p>
          </div>
        );

      default:
        return (
          <Input
            type="text"
            value={val}
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            placeholder={field.placeholder || 'Enter value'}
            className="bg-[#0b1329] border-[#1b2a4a] text-slate-100 placeholder:text-slate-500 rounded-xl h-11 text-xs focus:ring-1 focus:ring-sky-500"
          />
        );
    }
  };

  const renderFieldCard = (field: FormFieldConfig) => {
    const fieldKey = field.key || field.name;
    const isReq = field.isRequired ?? field.required;
    const errorMsg = validationErrors[fieldKey];
    const isHalf = field.fieldsPerRow === 2 || field.width === 'half';
    const colSpanClass = isHalf ? 'col-span-12 md:col-span-6' : 'col-span-12';

    return (
      <div key={field.id || fieldKey} className={`${colSpanClass} space-y-1.5`}>
        <Label className="text-[11px] font-extrabold uppercase tracking-wider text-sky-400/90 flex items-center gap-1">
          <span>{field.label || fieldKey}</span>
          {isReq && <span className="text-rose-400">*</span>}
        </Label>

        {field.description && (
          <p className="text-[11px] text-slate-400 leading-tight">{field.description}</p>
        )}

        {renderInputField(field)}

        {errorMsg && (
          <p className="text-[11px] font-medium text-rose-400 flex items-center gap-1 pt-0.5">
            <AlertCircle className="h-3 w-3" />
            <span>{errorMsg}</span>
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmitContract} className={`space-y-6 ${className}`}>
      {/* Stepper Header */}
      {normalizedSteps.length > 1 && (
        <div className="inline-flex items-center space-x-3 bg-[#0a1329] border border-[#18284b] px-4 py-2.5 rounded-2xl overflow-x-auto max-w-full">
          {normalizedSteps.map((step, idx) => {
            const isActive = idx === activeStepIdx;
            const isPassed = idx < activeStepIdx;

            return (
              <React.Fragment key={step.id || idx}>
                <button
                  type="button"
                  onClick={() => setActiveStepIdx(idx)}
                  className="flex items-center space-x-2 text-xs font-semibold focus:outline-none shrink-0"
                >
                  <span
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-sky-500 text-slate-950 font-black shadow-lg shadow-sky-500/20'
                        : isPassed
                        ? 'bg-sky-900/60 text-sky-300 border border-sky-600/40'
                        : 'border border-[#203666] text-slate-400 bg-[#070f23]'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className={isActive ? 'text-slate-100 font-bold' : 'text-slate-400'}>
                    {step.stepName || step.name || `Step ${idx + 1}`}
                  </span>
                </button>

                {idx < normalizedSteps.length - 1 && (
                  <div className="w-8 h-[2px] bg-[#1d325e] shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Step Name & Description */}
      <div>
        <h3 className="text-lg font-bold text-slate-100">
          {currentStep.stepName || currentStep.name || `Step ${activeStepIdx + 1}`}
        </h3>
        {currentStep.description && (
          <p className="text-xs text-slate-400 mt-0.5">{currentStep.description}</p>
        )}
      </div>

      {/* Ungrouped & Grouped Fields */}
      <div className="space-y-6">
        {ungroupedFields.length > 0 && (
          <div className="rounded-2xl border border-[#16274a] bg-[#070e20] p-5 sm:p-6 shadow-lg">
            <div className="grid grid-cols-12 gap-4 sm:gap-5">
              {ungroupedFields.map((field) => renderFieldCard(field))}
            </div>
          </div>
        )}

        {fieldGroups.map((group) => {
          const groupFields = activeFields.filter((f) => f.groupId === group.id);
          if (groupFields.length === 0) return null;

          return (
            <div key={group.id} className="space-y-2">
              <h4 className="text-sm font-bold text-slate-200">{group.groupName || group.name}</h4>
              <div className="rounded-2xl border border-dashed border-[#1d3361] bg-[#070e20]/80 p-5 sm:p-6">
                <div className="grid grid-cols-12 gap-4 sm:gap-5">
                  {groupFields.map((field) => renderFieldCard(field))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation & Submit Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-[#132140]">
        <Button
          type="button"
          onClick={() => setActiveStepIdx((prev) => Math.max(0, prev - 1))}
          disabled={activeStepIdx === 0}
          variant="outline"
          className="border-[#1b2c52] bg-[#0a1226] text-slate-200 hover:bg-[#132347] hover:text-white disabled:opacity-40 rounded-xl px-5 h-10 text-xs font-semibold"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        {activeStepIdx < normalizedSteps.length - 1 ? (
          <Button
            type="button"
            onClick={handleNext}
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl px-6 h-10 text-xs shadow-lg shadow-sky-500/20 flex items-center gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl px-6 h-10 text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                Submitting Contract...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-1" />
                Submit Contract
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  );
};

export default DynamicFormRenderer;
