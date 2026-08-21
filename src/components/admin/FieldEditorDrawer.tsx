import React, { useState, useEffect } from 'react';
import { FormFieldConfig, FieldType, FormOption } from '@/types/escrowTypes';
import { X, Plus, Trash2, GripVertical, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FieldEditorDrawerProps {
  field: FormFieldConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedField: FormFieldConfig) => void;
}

export const FieldEditorDrawer: React.FC<FieldEditorDrawerProps> = ({
  field,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<FormFieldConfig>>({});
  const [options, setOptions] = useState<FormOption[]>([]);
  const [newOptionLabel, setNewOptionLabel] = useState('');

  useEffect(() => {
    if (field) {
      setFormData({ ...field });
      setOptions(field.options ? [...field.options] : []);
    }
  }, [field]);

  if (!isOpen || !field) return null;

  const handleChange = (key: keyof FormFieldConfig, val: any) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleLabelChange = (val: string) => {
    // Automatically generate clean internal variable name if name is empty or matches previous label slug
    const autoName = val.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    setFormData((prev) => ({
      ...prev,
      label: val,
      name: prev.name ? prev.name : autoName,
    }));
  };

  const handleAddOption = () => {
    if (!newOptionLabel.trim()) return;
    const newOpt: FormOption = {
      id: `opt-${Date.now()}`,
      label: newOptionLabel.trim(),
      value: newOptionLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    };
    setOptions((prev) => [...prev, newOpt]);
    setNewOptionLabel('');
  };

  const handleRemoveOption = (id: string) => {
    setOptions((prev) => prev.filter((o) => o.id !== id));
  };

  const handleOptionChange = (id: string, label: string) => {
    setOptions((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              label,
              value: label.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
            }
          : o
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label?.trim()) return;

    const updatedField: FormFieldConfig = {
      ...(field as FormFieldConfig),
      ...(formData as FormFieldConfig),
      label: formData.label.trim(),
      name: (formData.name || formData.label).toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      options: options.length > 0 ? options : undefined,
    };

    onSave(updatedField);
    onClose();
  };

  const fieldType = (formData.type || field.type) as FieldType;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header (Fixed) */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5 bg-slate-950/60 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-100">Edit Field Configuration</h2>
            <p className="text-xs text-slate-400">Configure parameters, labels, and validation rules.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form Wrapper */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Field Type Badge */}
            <div className="flex items-center justify-between rounded-xl bg-slate-950 p-3 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400">Field Type</span>
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                {fieldType}
              </span>
            </div>

            {/* Label */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Field Label *</Label>
              <Input
                value={formData.label || ''}
                onChange={(e) => handleLabelChange(e.target.value)}
                placeholder="e.g. Project Name"
                className="bg-slate-950 border-slate-800 text-slate-100 text-xs rounded-xl h-10"
                required
              />
            </div>

            {/* Internal Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Internal Name (Variable Identifier)</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="project_name"
                className="bg-slate-950 border-slate-800 font-mono text-indigo-300 text-xs rounded-xl h-10"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Description / Help Text</Label>
              <Input
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Explain what the user needs to provide..."
                className="bg-slate-950 border-slate-800 text-slate-100 text-xs rounded-xl h-10"
              />
            </div>

            {/* Placeholder (For text, number, select, etc.) */}
            {['text', 'textarea', 'number', 'email', 'phone', 'url', 'select', 'currency', 'wallet'].includes(fieldType) && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">Placeholder Text</Label>
                <Input
                  value={formData.placeholder || ''}
                  onChange={(e) => handleChange('placeholder', e.target.value)}
                  placeholder="Enter placeholder hint..."
                  className="bg-slate-950 border-slate-800 text-slate-100 text-xs rounded-xl h-10"
                />
              </div>
            )}

            {/* Required Switch */}
            <div className="flex items-center justify-between rounded-xl bg-slate-950 p-3.5 border border-slate-800">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Required Field</span>
                <span className="text-[11px] text-slate-400">User must fill this field to proceed</span>
              </div>
              <button
                type="button"
                onClick={() => handleChange('required', !formData.required)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.required ? 'bg-indigo-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.required ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Field Width (Full vs Half) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Field Size / Grid Layout</Label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleChange('width', 'half')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                    (formData.width === 'half' || (!formData.width && fieldType !== 'textarea' && fieldType !== 'address' && fieldType !== 'file' && fieldType !== 'image'))
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Half Width (2 Per Row)
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('width', 'full')}
                  className={`py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                    (formData.width === 'full' || (!formData.width && (fieldType === 'textarea' || fieldType === 'address' || fieldType === 'file' || fieldType === 'image')))
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Full Width (1 Per Row)
                </button>
              </div>
            </div>

            {/* TYPE SPECIFIC CONFIGURATIONS */}

            {/* TEXT & TEXTAREA */}
            {(fieldType === 'text' || fieldType === 'textarea') && (
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Text Validation</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Min Length</Label>
                    <Input
                      type="number"
                      value={formData.minLength ?? ''}
                      onChange={(e) => handleChange('minLength', parseInt(e.target.value) || undefined)}
                      placeholder="0"
                      className="bg-slate-950 border-slate-800 text-xs rounded-xl h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Max Length</Label>
                    <Input
                      type="number"
                      value={formData.maxLength ?? ''}
                      onChange={(e) => handleChange('maxLength', parseInt(e.target.value) || undefined)}
                      placeholder="100"
                      className="bg-slate-950 border-slate-800 text-xs rounded-xl h-9"
                    />
                  </div>
                </div>
                {fieldType === 'textarea' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Rows</Label>
                    <Input
                      type="number"
                      value={formData.rows ?? 4}
                      onChange={(e) => handleChange('rows', parseInt(e.target.value) || 4)}
                      className="bg-slate-950 border-slate-800 text-xs rounded-xl h-9"
                    />
                  </div>
                )}
              </div>
            )}

            {/* NUMBER */}
            {fieldType === 'number' && (
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Number Bounds</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Min Value</Label>
                    <Input
                      type="number"
                      value={formData.min ?? ''}
                      onChange={(e) => handleChange('min', parseFloat(e.target.value))}
                      className="bg-slate-950 border-slate-800 text-xs rounded-xl h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Max Value</Label>
                    <Input
                      type="number"
                      value={formData.max ?? ''}
                      onChange={(e) => handleChange('max', parseFloat(e.target.value))}
                      className="bg-slate-950 border-slate-800 text-xs rounded-xl h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Step</Label>
                    <Input
                      type="number"
                      value={formData.step ?? 1}
                      onChange={(e) => handleChange('step', parseFloat(e.target.value) || 1)}
                      className="bg-slate-950 border-slate-800 text-xs rounded-xl h-9"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CURRENCY */}
            {fieldType === 'currency' && (
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Currency Options</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Currency Symbol</Label>
                    <Select
                      value={formData.currencySymbol || '$'}
                      onValueChange={(sym) => handleChange('currencySymbol', sym)}
                    >
                      <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-slate-100 text-xs rounded-xl h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-xl shadow-2xl z-[150]">
                        <SelectItem value="$" className="text-xs cursor-pointer focus:bg-indigo-600 focus:text-white">USD ($)</SelectItem>
                        <SelectItem value="€" className="text-xs cursor-pointer focus:bg-indigo-600 focus:text-white">EUR (€)</SelectItem>
                        <SelectItem value="£" className="text-xs cursor-pointer focus:bg-indigo-600 focus:text-white">GBP (£)</SelectItem>
                        <SelectItem value="ETH" className="text-xs cursor-pointer focus:bg-indigo-600 focus:text-white">Ethereum (ETH)</SelectItem>
                        <SelectItem value="SOL" className="text-xs cursor-pointer focus:bg-indigo-600 focus:text-white">Solana (SOL)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Min Amount</Label>
                    <Input
                      type="number"
                      value={formData.minAmount ?? ''}
                      onChange={(e) => handleChange('minAmount', parseFloat(e.target.value))}
                      className="bg-slate-950 border-slate-800 text-xs rounded-xl h-9"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* OPTIONS MANAGEMENT (SELECT, MULTISELECT, RADIO) */}
            {['select', 'multiselect', 'radio'].includes(fieldType) && (
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Options</h3>
                
                <div className="flex gap-2">
                  <Input
                    value={newOptionLabel}
                    onChange={(e) => setNewOptionLabel(e.target.value)}
                    placeholder="Enter new option..."
                    className="bg-slate-950 border-slate-800 text-xs rounded-xl h-9"
                  />
                  <Button
                    type="button"
                    onClick={handleAddOption}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 px-3 rounded-xl"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {options.map((opt) => (
                    <div key={opt.id} className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <GripVertical className="h-4 w-4 text-slate-600 shrink-0" />
                      <input
                        type="text"
                        value={opt.label}
                        onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                        className="flex-1 bg-transparent text-xs text-slate-100 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(opt.id)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WALLET */}
            {fieldType === 'wallet' && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <Label className="text-xs font-semibold text-slate-300">Supported Network</Label>
                <Select
                  value={formData.supportedNetwork || 'Ethereum (ERC-20)'}
                  onValueChange={(net) => handleChange('supportedNetwork', net)}
                >
                  <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-slate-100 text-xs rounded-xl h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-xl shadow-2xl z-[150]">
                    <SelectItem value="Ethereum (ERC-20)" className="text-xs cursor-pointer focus:bg-indigo-600 focus:text-white">Ethereum (ERC-20)</SelectItem>
                    <SelectItem value="Polygon" className="text-xs cursor-pointer focus:bg-indigo-600 focus:text-white">Polygon</SelectItem>
                    <SelectItem value="Solana" className="text-xs cursor-pointer focus:bg-indigo-600 focus:text-white">Solana</SelectItem>
                    <SelectItem value="Arbitrum" className="text-xs cursor-pointer focus:bg-indigo-600 focus:text-white">Arbitrum</SelectItem>
                    <SelectItem value="Multi-chain" className="text-xs cursor-pointer focus:bg-indigo-600 focus:text-white">Multi-chain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* UPLOAD (FILE/IMAGE) */}
            {(fieldType === 'file' || fieldType === 'image') && (
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upload Limits</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Max File Size (MB)</Label>
                    <Input
                      type="number"
                      value={formData.maxSizeMb ?? 25}
                      onChange={(e) => handleChange('maxSizeMb', parseInt(e.target.value) || 25)}
                      className="bg-slate-950 border-slate-800 text-xs rounded-xl h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Max Files</Label>
                    <Input
                      type="number"
                      value={formData.maxFiles ?? 5}
                      onChange={(e) => handleChange('maxFiles', parseInt(e.target.value) || 5)}
                      className="bg-slate-950 border-slate-800 text-xs rounded-xl h-9"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ADDRESS Options */}
            {fieldType === 'address' && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requireCountry ?? true}
                    onChange={(e) => handleChange('requireCountry', e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600"
                  />
                  <span>Require Country selection</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requirePostalCode ?? true}
                    onChange={(e) => handleChange('requirePostalCode', e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600"
                  />
                  <span>Require Postal Code</span>
                </label>
              </div>
            )}
          </div>

          {/* Modal Footer (Fixed Pinned Bottom) */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end space-x-3 shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl px-4 h-9"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl px-5 h-9 shadow-lg shadow-indigo-600/20">
              Save Field Configuration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
