import React, { useState } from 'react';
import { FormFieldConfig, FormStep, FieldType, FieldGroup } from '@/types/escrowTypes';
import { X, Upload, ChevronLeft, ChevronRight, Info, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface FormPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditForm?: () => void;
  categoryTitle: string;
  categoryDescription?: string;
  steps: FormStep[];
  fields?: FormFieldConfig[];
}

export const FormPreviewModal: React.FC<FormPreviewModalProps> = ({
  isOpen,
  onClose,
  onEditForm,
  categoryTitle,
  categoryDescription,
  steps,
  fields = [],
}) => {
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [previewRole, setPreviewRole] = useState<'buyer' | 'seller'>('buyer');

  if (!isOpen) return null;

  const normalizedSteps: FormStep[] = steps && steps.length > 0 ? steps : [
    {
      id: 'step-1',
      name: 'Step 1',
      order: 1,
      description: 'Default step details',
      fields: fields,
      fieldGroups: [],
    }
  ];

  const currentStep = normalizedSteps[Math.min(activeStepIdx, normalizedSteps.length - 1)] || normalizedSteps[0];
  const stepFields: FormFieldConfig[] = (currentStep?.fields && currentStep.fields.length > 0)
    ? currentStep.fields
    : ((currentStep as any)?.fieldDefinitions || []);

  const activeFields = stepFields.filter((f) => {
    if (f.enabled === false) return false;
    const role = f.targetRole || 'both';
    return role === 'both' || role === previewRole;
  });

  // Group fields by groupId
  const fieldGroups = currentStep?.fieldGroups || [];
  const ungroupedFields = activeFields.filter((f) => !f.groupId);

  const handleInputChange = (fieldName: string, val: any) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: val }));
  };

  const renderFieldInput = (field: FormFieldConfig) => {
    const val = formValues[field.name] ?? field.defaultValue ?? '';

    switch (field.type as FieldType) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <Input
            type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
            value={val}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder || 'Enter'}
            className="bg-[#0b1329] border-[#1b2a4a] text-slate-100 placeholder:text-slate-500 rounded-xl h-11 text-xs focus:ring-1 focus:ring-sky-500"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={val}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder || 'Enter Description'}
            rows={field.rows || 3}
            className="w-full rounded-xl border border-[#1b2a4a] bg-[#0b1329] p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-y"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={val}
            min={field.min}
            max={field.max}
            step={field.step || 1}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder || 'Enter'}
            className="bg-[#0b1329] border-[#1b2a4a] text-slate-100 placeholder:text-slate-500 rounded-xl h-11 text-xs focus:ring-1 focus:ring-sky-500"
          />
        );

      case 'currency':
        return (
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-sky-400">
              {field.currencySymbol || '$'}
            </div>
            <Input
              type="number"
              value={val}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder="0.00"
              className="pl-8 bg-[#0b1329] border-[#1b2a4a] text-slate-100 placeholder:text-slate-500 rounded-xl h-11 text-xs focus:ring-1 focus:ring-sky-500"
            />
          </div>
        );

      case 'date':
      case 'datetime':
        return (
          <Input
            type={field.type === 'datetime' ? 'datetime-local' : 'date'}
            value={val}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="bg-[#0b1329] border-[#1b2a4a] text-slate-100 rounded-xl h-11 text-xs focus:ring-1 focus:ring-sky-500"
          />
        );

      case 'select':
        return (
          <Select value={val} onValueChange={(v) => handleInputChange(field.name, v)}>
            <SelectTrigger className="w-full bg-[#0b1329] border-[#1b2a4a] text-slate-100 rounded-xl h-11 text-xs">
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

      case 'radio':
        return (
          <div className="space-y-2 pt-1">
            {(field.options || []).map((opt) => (
              <label key={opt.id || opt.value} className="flex items-center space-x-2.5 text-xs text-slate-200 cursor-pointer bg-[#0b1329] p-3 rounded-xl border border-[#1b2a4a]">
                <input
                  type="radio"
                  name={field.name}
                  value={opt.value}
                  checked={val === opt.value}
                  onChange={() => handleInputChange(field.name, opt.value)}
                  className="text-sky-500 focus:ring-sky-500 bg-slate-950 border-slate-700"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center space-x-2.5 text-xs text-slate-200 cursor-pointer bg-[#0b1329] p-3 rounded-xl border border-[#1b2a4a]">
            <input
              type="checkbox"
              checked={Boolean(val)}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500 h-4 w-4"
            />
            <span className="font-medium">{field.label}</span>
          </label>
        );

      case 'file':
      case 'image':
        return (
          <div className="border border-dashed border-[#1b2a4a] rounded-xl p-5 text-center bg-[#0b1329]/60 hover:border-sky-500/50 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[100px]">
            <Upload className="h-5 w-5 text-sky-400 mb-1.5" />
            <p className="text-xs font-semibold text-slate-300">Click Here to Upload</p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Max size: {field.maxSizeMb || 25}MB
            </p>
          </div>
        );

      default:
        return (
          <Input
            type="text"
            value={val}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder || 'Enter'}
            className="bg-[#0b1329] border-[#1b2a4a] text-slate-100 placeholder:text-slate-500 rounded-xl h-11 text-xs focus:ring-1 focus:ring-sky-500"
          />
        );
    }
  };

  const renderFieldCard = (field: FormFieldConfig) => {
    const isHalf = field.fieldsPerRow === 2 || field.width === 'half' || (!field.width && !['textarea', 'address', 'file', 'image', 'multiselect'].includes(field.type));
    const colSpanClass = isHalf ? 'col-span-12 md:col-span-6' : 'col-span-12';

    return (
      <div key={field.id} className={`${colSpanClass} space-y-1.5`}>
        <Label className="text-[11px] font-extrabold uppercase tracking-wider text-sky-400/90 flex items-center gap-1">
          <span>{field.label}</span>
          {field.required && <span className="text-rose-400">*</span>}
        </Label>

        {field.type !== 'checkbox' && field.type !== 'toggle' && field.description && (
          <p className="text-[11px] text-slate-400 leading-tight">{field.description}</p>
        )}

        {renderFieldInput(field)}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl border border-[#1b2a4a] bg-[#050b18] text-slate-100 shadow-2xl flex flex-col overflow-hidden my-auto max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#132140]">
          <div>
            <h2 className="text-xl font-bold text-slate-100">{categoryTitle || 'Untitled Asset Class'}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {categoryDescription || 'Preview of the dynamic form for this asset class'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {onEditForm && (
              <Button
                type="button"
                onClick={() => {
                  onClose();
                  onEditForm();
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-4 h-9 text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Form</span>
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#132140] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Multi-Step Stepper Component (Exact matching screenshot design) */}
          <div className="inline-flex items-center space-x-3 bg-[#0a1329] border border-[#18284b] px-4 py-2.5 rounded-2xl">
            {normalizedSteps.map((step, idx) => {
              const isActive = idx === activeStepIdx;
              const isPassed = idx < activeStepIdx;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-sky-500 text-slate-950 font-mono'
                          : isPassed
                          ? 'bg-sky-900/50 text-sky-300 font-mono'
                          : 'bg-[#121f3a] text-slate-400 font-mono'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`text-xs font-bold transition-colors ${
                        isActive ? 'text-sky-300' : isPassed ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {idx < normalizedSteps.length - 1 && (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Active Step Fields Card */}
          {activeFields.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-dashed border-[#1d3361] bg-[#070e20]">
              <Info className="h-8 w-8 text-sky-400/50 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No input fields configured for this step</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Ungrouped Fields */}
              {ungroupedFields.length > 0 && (
                <div className="grid grid-cols-12 gap-4 sm:gap-5">
                  {ungroupedFields.map((field) => renderFieldCard(field))}
                </div>
              )}

              {/* Grouped Fields */}
              {fieldGroups.map((group) => {
                const groupFields = activeFields.filter((f) => f.groupId === group.id);
                if (groupFields.length === 0) return null;

                return (
                  <div key={group.id} className="space-y-3">
                    <div className="border-b border-[#16274a] pb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300">
                        {group.name}
                      </h4>
                      {group.description && (
                        <p className="text-[11px] text-slate-400 mt-0.5">{group.description}</p>
                      )}
                    </div>
                    <div className="rounded-2xl border border-dashed border-[#1d3361] bg-[#070e20]/80 p-5 sm:p-6">
                      <div className="grid grid-cols-12 gap-4 sm:gap-5">
                        {groupFields.map((field) => renderFieldCard(field))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 border-t border-[#132140] flex items-center justify-between bg-[#040814]">
          <Button
            type="button"
            onClick={() => setActiveStepIdx((prev) => Math.max(0, prev - 1))}
            disabled={activeStepIdx === 0}
            variant="outline"
            className="border-[#1b2c52] bg-[#0a1226] text-slate-200 hover:bg-[#132347] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-xl px-5 h-10 text-xs font-semibold"
          >
            Back
          </Button>

          <div className="flex items-center space-x-3">
            {onEditForm && (
              <Button
                type="button"
                onClick={() => {
                  onClose();
                  onEditForm();
                }}
                variant="outline"
                className="border-indigo-500/40 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 font-bold rounded-xl px-4 h-10 text-xs flex items-center gap-1.5"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Form</span>
              </Button>
            )}

            {activeStepIdx < normalizedSteps.length - 1 ? (
              <Button
                type="button"
                onClick={() => setActiveStepIdx((prev) => Math.min(normalizedSteps.length - 1, prev + 1))}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl px-6 h-10 text-xs shadow-lg shadow-sky-500/20"
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={onClose}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl px-6 h-10 text-xs shadow-lg shadow-sky-500/20"
              >
                Finish
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
