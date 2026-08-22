import React, { useState } from 'react';
import { FormFieldConfig, FieldType } from '@/types/escrowTypes';
import {
  Upload,
  Image as ImageIcon,
  Wallet,
  Calendar,
  Clock,
  ArrowRight,
  Info,
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

interface DynamicFormRendererProps {
  title?: string;
  description?: string;
  fields: FormFieldConfig[];
  onSubmit?: (values: Record<string, any>) => void;
  submitButtonText?: string;
  className?: string;
}

export const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  title,
  description,
  fields = [],
  onSubmit,
  submitButtonText = 'Submit Escrow Details',
  className = '',
}) => {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeFields = fields.filter((f) => f.enabled !== false);

  const handleInputChange = (fieldName: string, val: any) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: val }));
    if (errors[fieldName]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldName];
        return copy;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    activeFields.forEach((field) => {
      if (field.required) {
        const val = formValues[field.name];
        if (val === undefined || val === null || val === '') {
          newErrors[field.name] = `${field.label} is required`;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (onSubmit) {
      onSubmit(formValues);
    }
  };

  const renderFieldInput = (field: FormFieldConfig) => {
    const val = formValues[field.name] ?? field.defaultValue ?? '';
    const err = errors[field.name];

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
            className={`bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl h-10 text-xs focus:ring-indigo-500 ${
              err ? 'border-rose-500' : ''
            }`}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={val}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder || `Describe ${field.label.toLowerCase()}...`}
            rows={field.rows || 3}
            className={`w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors ${
              err ? 'border-rose-500' : ''
            }`}
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
            placeholder={field.placeholder || '0'}
            className={`bg-slate-900 border-slate-800 text-slate-100 text-xs rounded-xl h-10 ${
              err ? 'border-rose-500' : ''
            }`}
          />
        );

      case 'select':
        return (
          <Select
            value={val || ''}
            onValueChange={(newVal) => handleInputChange(field.name, newVal)}
          >
            <SelectTrigger
              className={`w-full bg-slate-900 border-slate-800 text-slate-100 text-xs rounded-xl h-10 focus:ring-1 focus:ring-indigo-500 ${
                err ? 'border-rose-500' : ''
              }`}
            >
              <SelectValue placeholder={field.placeholder || 'Select an option...'} />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-xl shadow-2xl z-[100]">
              {field.options?.map((opt) => (
                <SelectItem
                  key={opt.id}
                  value={opt.value}
                  className="text-xs cursor-pointer focus:bg-indigo-600 focus:text-white rounded-lg py-2 my-0.5"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        return (
          <div className={`space-y-1.5 bg-slate-900 border border-slate-800 rounded-xl p-3 ${err ? 'border-rose-500' : ''}`}>
            {field.options?.map((opt) => {
              const currentArr = Array.isArray(val) ? val : [];
              const checked = currentArr.includes(opt.value);
              return (
                <label key={opt.id} className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleInputChange(field.name, [...currentArr, opt.value]);
                      } else {
                        handleInputChange(field.name, currentArr.filter((v: string) => v !== opt.value));
                      }
                    }}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2 pt-1">
            {field.options?.map((opt) => (
              <label key={opt.id} className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name={field.name}
                  value={opt.value}
                  checked={val === opt.value}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={!!val}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
            />
            <span>{field.description || 'Check to confirm'}</span>
          </label>
        );

      case 'toggle':
        return (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">{field.description || 'Enable option'}</span>
            <button
              type="button"
              onClick={() => handleInputChange(field.name, !val)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                val ? 'bg-indigo-600' : 'bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  val ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        );

      case 'date':
        return (
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="date"
              value={val}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={`pl-9 bg-slate-900 border-slate-800 text-slate-100 text-xs rounded-xl h-10 ${err ? 'border-rose-500' : ''}`}
            />
          </div>
        );

      case 'datetime':
        return (
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="datetime-local"
              value={val}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={`pl-9 bg-slate-900 border-slate-800 text-slate-100 text-xs rounded-xl h-10 ${err ? 'border-rose-500' : ''}`}
            />
          </div>
        );

      case 'file':
      case 'image':
        return (
          <div className={`rounded-xl border border-dashed border-slate-800 bg-slate-900/50 p-4 text-center space-y-2 hover:border-indigo-500/50 transition-colors ${err ? 'border-rose-500' : ''}`}>
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              {field.type === 'image' ? <ImageIcon className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
            </div>
            <div className="text-[11px] text-slate-400">
              <span className="text-indigo-400 font-medium">Click to upload</span> or drag and drop
            </div>
            <p className="text-[10px] text-slate-500">
              {field.allowedTypes?.join(', ') || (field.type === 'image' ? 'PNG, JPG, WEBP' : 'PDF, DOCX, ZIP')}{' '}
              (Max {field.maxSizeMb || 25}MB)
            </p>
          </div>
        );

      case 'wallet':
        return (
          <div className="space-y-1">
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
              <Input
                type="text"
                value={val}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                placeholder={field.placeholder || '0x...'}
                className={`pl-9 bg-slate-900 border-slate-800 text-slate-100 font-mono text-xs rounded-xl h-10 ${err ? 'border-rose-500' : ''}`}
              />
            </div>
            {field.supportedNetwork && (
              <span className="text-[10px] text-indigo-400 font-medium block">
                Network: {field.supportedNetwork}
              </span>
            )}
          </div>
        );

      case 'currency':
        return (
          <div className={`flex rounded-xl border border-slate-800 bg-slate-900 overflow-hidden focus-within:border-indigo-500 transition-colors ${err ? 'border-rose-500' : ''}`}>
            <div className="border-r border-slate-800 bg-slate-950/80">
              <Select
                value={field.currencySymbol || '$'}
                onValueChange={(sym) => handleInputChange(`${field.name}_symbol`, sym)}
              >
                <SelectTrigger className="h-10 border-0 bg-transparent px-3 text-xs font-semibold text-indigo-400 focus:ring-0 focus:border-0 gap-1.5 rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-xl shadow-2xl z-[100]">
                  <SelectItem value="$" className="text-xs cursor-pointer focus:bg-indigo-600 focus:text-white">USD ($)</SelectItem>
                  <SelectItem value="€" className="text-xs cursor-pointer focus:bg-indigo-600 focus:text-white">EUR (€)</SelectItem>
                  <SelectItem value="£" className="text-xs cursor-pointer focus:bg-indigo-600 focus:text-white">GBP (£)</SelectItem>
                  <SelectItem value="ETH" className="text-xs cursor-pointer focus:bg-indigo-600 focus:text-white">ETH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              type="number"
              value={val}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder || '0.00'}
              className="flex-1 border-0 bg-transparent text-slate-100 text-xs rounded-none h-10 focus:ring-0 focus:border-0"
            />
          </div>
        );

      case 'address':
        return (
          <div className={`space-y-2 bg-slate-900 border border-slate-800 rounded-xl p-3 ${err ? 'border-rose-500' : ''}`}>
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
            {field.requireCountry && (
              <Input
                placeholder="Country *"
                className="bg-slate-950 border-slate-800 text-slate-100 text-xs rounded-lg h-9"
              />
            )}
          </div>
        );

      default:
        return (
          <Input
            value={val}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={`bg-slate-900 border-slate-800 text-slate-100 text-xs rounded-xl h-10 ${err ? 'border-rose-500' : ''}`}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {title && (
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-100">{title}</h2>
          {description && <p className="text-xs text-slate-400 leading-relaxed">{description}</p>}
        </div>
      )}

      {activeFields.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30 p-6 text-center">
          <Info className="h-6 w-6 text-slate-500 mb-2" />
          <p className="text-xs text-slate-400 font-medium">No active fields configured</p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-3">
          {activeFields.map((field) => {
            const isHalf = field.width === 'half' || (!field.width && !['textarea', 'address', 'file', 'image', 'multiselect'].includes(field.type));
            const colSpanClass = isHalf ? 'col-span-12 sm:col-span-6' : 'col-span-12';
            const err = errors[field.name];

            return (
              <div key={field.id} className={`${colSpanClass} space-y-1.5 p-1`}>
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                    <span>{field.label}</span>
                    {field.required && <span className="text-rose-400 font-medium">*</span>}
                  </Label>
                </div>

                {field.type !== 'checkbox' && field.type !== 'toggle' && field.description && (
                  <p className="text-[11px] text-slate-400 leading-tight">{field.description}</p>
                )}

                {renderFieldInput(field)}

                {err && <p className="text-[10px] text-rose-400 font-medium">{err}</p>}
              </div>
            );
          })}
        </div>
      )}

      {activeFields.length > 0 && (
        <div className="pt-3 border-t border-slate-800">
          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
          >
            <span>{submitButtonText}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </form>
  );
};

export default DynamicFormRenderer;
