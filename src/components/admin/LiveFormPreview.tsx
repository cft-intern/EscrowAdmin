import React, { useState } from 'react';
import { FormFieldConfig, FieldType } from '@/types/escrowTypes';
import {
  Upload,
  Image as ImageIcon,
  Wallet,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  ChevronDown,
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

interface LiveFormPreviewProps {
  title: string;
  description: string;
  fields: FormFieldConfig[];
  onReorder?: (reorderedFields: FormFieldConfig[]) => void;
}

export const LiveFormPreview: React.FC<LiveFormPreviewProps> = ({ title, description, fields, onReorder }) => {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const activeFields = fields.filter((f) => f.enabled !== false);

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
            placeholder={field.placeholder || `Describe ${field.label.toLowerCase()}...`}
            rows={field.rows || 3}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
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
            className="bg-slate-900 border-slate-800 text-slate-100 text-xs rounded-xl h-10"
          />
        );

      case 'select':
        return (
          <Select
            value={val || ''}
            onValueChange={(newVal) => handleInputChange(field.name, newVal)}
          >
            <SelectTrigger className="w-full bg-slate-900 border-slate-800 text-slate-100 text-xs rounded-xl h-10 focus:ring-1 focus:ring-indigo-500">
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
          <div className="space-y-1.5 bg-slate-900 border border-slate-800 rounded-xl p-3">
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
              className="pl-9 bg-slate-900 border-slate-800 text-slate-100 text-xs rounded-xl h-10"
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
              className="pl-9 bg-slate-900 border-slate-800 text-slate-100 text-xs rounded-xl h-10"
            />
          </div>
        );

      case 'file':
      case 'image':
        return (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/50 p-4 text-center space-y-2 hover:border-indigo-500/50 transition-colors">
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
                className="pl-9 bg-slate-900 border-slate-800 text-slate-100 font-mono text-xs rounded-xl h-10"
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
          <div className="flex rounded-xl border border-slate-800 bg-slate-900 overflow-hidden focus-within:border-indigo-500 transition-colors">
            <div className="border-r border-slate-800 bg-slate-950/80">
              <Select
                value={field.currencySymbol || '$'}
                onValueChange={(sym) => handleInputChange(`${field.name}_symbol`, sym)}
              >
                <SelectTrigger className="h-10 border-0 bg-transparent px-3 text-xs font-semibold text-indigo-400 focus:ring-0 focus:border-0 gap-1.5 rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-xl shadow-2xl z-[100]">
                  <SelectItem value="$" className="text-xs focus:bg-indigo-600 focus:text-white cursor-pointer">USD ($)</SelectItem>
                  <SelectItem value="€" className="text-xs focus:bg-indigo-600 focus:text-white cursor-pointer">EUR (€)</SelectItem>
                  <SelectItem value="£" className="text-xs focus:bg-indigo-600 focus:text-white cursor-pointer">GBP (£)</SelectItem>
                  <SelectItem value="ETH" className="text-xs focus:bg-indigo-600 focus:text-white cursor-pointer">Ethereum (ETH)</SelectItem>
                  <SelectItem value="SOL" className="text-xs focus:bg-indigo-600 focus:text-white cursor-pointer">Solana (SOL)</SelectItem>
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
            className="bg-slate-900 border-slate-800 text-slate-100 text-xs rounded-xl h-10"
          />
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl flex flex-col h-[calc(100vh-260px)] space-y-4">
      {/* Header Banner (Fixed) */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Form Preview</h3>
        </div>
        <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full">
          Buyer Form View
        </span>
      </div>

      {/* Form Title & Description (Fixed) */}
      <div className="space-y-1 shrink-0">
        <h2 className="text-lg font-bold text-slate-100">{title || 'Category Title'}</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          {description || 'Please provide details for your escrow transaction.'}
        </p>
      </div>

      {/* Dynamic Fields List (Scrollable Inner Area) */}
      {activeFields.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30 p-6 text-center">
          <Info className="h-6 w-6 text-slate-500 mb-2" />
          <p className="text-xs text-slate-400 font-medium">Form live preview will appear here</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Add and configure fields in the builder column.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-12 gap-3 content-start">
          {activeFields.map((field, idx) => {
            const isHalf = field.width === 'half' || (!field.width && !['textarea', 'address', 'file', 'image', 'multiselect'].includes(field.type));
            const colSpanClass = isHalf ? 'col-span-12 sm:col-span-6' : 'col-span-12';

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
                className={`${colSpanClass} space-y-1.5 p-2 rounded-xl border transition-all ${
                  dragOverIdx === idx
                    ? 'border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/30'
                    : 'border-transparent hover:border-slate-800/80 hover:bg-slate-900/40'
                } ${onReorder ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                    <span>{field.label}</span>
                    {field.required && <span className="text-rose-300 font-medium">*</span>}
                  </Label>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">{field.type}</span>
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

      {/* Action button mock (Fixed Bottom) */}
      <div className="pt-3 border-t border-slate-800 shrink-0">
        <button
          type="button"
          className="w-full h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
        >
          <span>Continue to Escrow Deposit</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
