import React, { useState } from 'react';
import { FormFieldConfig, FieldType, FormStep } from '@/types/escrowTypes';
import {
  Upload,
  Image as ImageIcon,
  Wallet,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  ChevronDown,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LiveFormPreviewProps {
  title: string;
  description: string;
  fields: FormFieldConfig[];
  steps?: FormStep[];
  onReorder?: (reorderedFields: FormFieldConfig[]) => void;
}

export const LiveFormPreview: React.FC<LiveFormPreviewProps> = ({ title, description, fields, steps, onReorder }) => {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [previewRole, setPreviewRole] = useState<'buyer' | 'seller'>('buyer');
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);

  const activeSteps = steps && steps.length > 0 ? steps : [
    {
      id: 'step-1',
      name: 'Basic Information',
      order: 1,
      description: 'General category inputs and parameters',
      fields: fields,
      fieldGroups: [],
    }
  ];

  const currentStep = activeSteps[Math.min(activeStepIdx, activeSteps.length - 1)] || activeSteps[0];
  const stepFields = currentStep ? currentStep.fields : fields;

  const activeFields = stepFields.filter((f) => {
    if (f.enabled === false) return false;
    const role = f.targetRole || 'both';
    return role === 'both' || role === previewRole;
  });

  const handleInputChange = (fieldName: string, val: any) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: val }));
  };

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragOverIdx !== idx) {
      setDragOverIdx(idx);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx || !onReorder) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }

    const newActive = [...activeFields];
    const movedItem = newActive[draggedIdx];
    if (movedItem) {
      newActive.splice(draggedIdx, 1);
      newActive.splice(targetIdx, 0, movedItem);
      onReorder(newActive);
    }

    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const renderPreviewInput = (field: FormFieldConfig) => {
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
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl h-10 text-xs focus:ring-indigo-500"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={val}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            rows={field.rows || 3}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            placeholder={field.placeholder || '0.00'}
            className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl h-10 text-xs focus:ring-indigo-500"
          />
        );

      case 'currency':
        return (
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-400">
              {field.currencySymbol || '$'}
            </div>
            <Input
              type="number"
              value={val}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder="0.00"
              className="pl-8 bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl h-10 text-xs focus:ring-indigo-500"
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
            className="bg-slate-900 border-slate-800 text-slate-100 rounded-xl h-10 text-xs focus:ring-indigo-500"
          />
        );

      case 'select':
        return (
          <Select value={val} onValueChange={(v) => handleInputChange(field.name, v)}>
            <SelectTrigger className="w-full bg-slate-900 border-slate-800 text-slate-100 rounded-xl h-10 text-xs">
              <SelectValue placeholder={field.placeholder || 'Select an option...'} />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-xl shadow-2xl z-[150]">
              {(field.options || []).map((opt) => (
                <SelectItem key={opt.id || opt.value} value={opt.value} className="text-xs cursor-pointer focus:bg-indigo-600 focus:text-white">
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
              <label key={opt.id || opt.value} className="flex items-center space-x-2.5 text-xs text-slate-200 cursor-pointer bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-colors">
                <input
                  type="radio"
                  name={field.name}
                  value={opt.value}
                  checked={val === opt.value}
                  onChange={() => handleInputChange(field.name, opt.value)}
                  className="text-indigo-600 focus:ring-indigo-500 bg-slate-950 border-slate-700"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center space-x-2.5 text-xs text-slate-200 cursor-pointer bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <input
              type="checkbox"
              checked={Boolean(val)}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span className="font-medium">{field.label}</span>
          </label>
        );

      case 'file':
      case 'image':
        return (
          <div className="border border-dashed border-slate-800 rounded-xl p-4 text-center bg-slate-900/40 hover:border-indigo-500/50 transition-colors cursor-pointer">
            <Upload className="h-5 w-5 text-indigo-400 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-slate-300">
              Drop files here or click to upload
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Max size: {field.maxSizeMb || 25}MB
            </p>
          </div>
        );

      case 'address':
        return (
          <div className="space-y-2 bg-slate-900 border border-slate-800 rounded-xl p-3">
            <Input
              placeholder="Street Address"
              className="bg-slate-950 border-slate-800 text-slate-100 text-xs rounded-lg h-9"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="City"
                className="bg-slate-950 border-slate-800 text-slate-100 text-xs rounded-lg h-9"
              />
              <Input
                placeholder={field.requirePostalCode ? 'Postal Code *' : 'Postal Code'}
                className="bg-slate-950 border-slate-800 text-slate-100 text-xs rounded-lg h-9"
              />
            </div>
          </div>
        );

      default:
        return (
          <Input
            type="text"
            value={val}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl h-10 text-xs focus:ring-indigo-500"
          />
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-5 shadow-2xl flex flex-col h-full overflow-hidden space-y-4 min-h-0">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Live Form Preview
          </h2>
        </div>

        {/* Role Toggle Switcher */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setPreviewRole('buyer')}
            className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
              previewRole === 'buyer'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Buyer View
          </button>
          <button
            type="button"
            onClick={() => setPreviewRole('seller')}
            className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
              previewRole === 'seller'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Seller View
          </button>
        </div>
      </div>

      {/* Form Title & Description (Fixed) */}
      <div className="space-y-1 shrink-0">
        <h2 className="text-base sm:text-lg font-bold text-slate-100">{title || 'Category Title'}</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          {description || 'Please provide details for your escrow transaction.'}
        </p>
      </div>

      {/* Multi-Step Indicator Header */}
      {activeSteps.length > 1 && (
        <div className="shrink-0 bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-indigo-400 uppercase tracking-wider">
              Step {activeStepIdx + 1} of {activeSteps.length}: {currentStep?.name || 'Step'}
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              {Math.round(((activeStepIdx + 1) / activeSteps.length) * 100)}% Complete
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-300"
              style={{ width: `${((activeStepIdx + 1) / activeSteps.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Dynamic Fields List (Natural Flow Area) */}
      {activeFields.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30 p-6 text-center min-h-[200px]">
          <Info className="h-6 w-6 text-slate-500 mb-2" />
          <p className="text-xs text-slate-400 font-medium">Form live preview will appear here</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Add and configure fields in the builder column.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1.5 grid grid-cols-12 gap-3 content-start [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-800/80 [&::-webkit-scrollbar-thumb]:rounded-full">
          {activeFields.map((field, idx) => {
            const isHalf = field.fieldsPerRow === 2 || field.width === 'half';
            const colSpanClass = isHalf ? 'col-span-12 xl:col-span-6' : 'col-span-12';

            return (
              <div
                key={field.id}
                draggable={!!onReorder}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={() => {
                  setDraggedIdx(null);
                  setDragOverIdx(null);
                }}
                className={`${colSpanClass} space-y-1.5 p-3 rounded-xl border transition-all ${
                  dragOverIdx === idx
                    ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                    : 'border-slate-900 hover:border-slate-800 bg-slate-900/40'
                } ${onReorder ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <Label className="text-xs font-semibold text-slate-200 flex items-center gap-1 min-w-0 max-w-[calc(100%-55px)]">
                    <span className="truncate">{field.label || 'Untitled'}</span>
                    {field.required && <span className="text-rose-400 font-bold shrink-0">*</span>}
                  </Label>
                  <span className="text-[9px] font-mono text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800 uppercase shrink-0">
                    {field.type}
                  </span>
                </div>

                {field.type !== 'checkbox' && field.type !== 'toggle' && field.description && (
                  <p className="text-[11px] text-slate-400 leading-tight">{field.description}</p>
                )}

                {renderPreviewInput(field)}
              </div>
            );
          })}
        </div>
      )}

      {/* Multi-Step Controls Footer */}
      {activeSteps.length > 1 && (
        <div className="shrink-0 flex items-center justify-between pt-3 border-t border-slate-800 bg-slate-950">
          <button
            type="button"
            onClick={() => setActiveStepIdx((prev) => Math.max(0, prev - 1))}
            disabled={activeStepIdx === 0}
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous Step</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStepIdx((prev) => Math.min(activeSteps.length - 1, prev + 1))}
            disabled={activeStepIdx === activeSteps.length - 1}
            className="flex items-center gap-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-4 py-1.5 rounded-lg shadow-md shadow-indigo-600/20"
          >
            <span>Next Step</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
