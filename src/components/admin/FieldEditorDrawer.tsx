import React, { useState, useEffect } from 'react';
import { FormFieldConfig, FieldType, FormOption, mapFieldTypeToApi, RESERVED_FIELD_KEYS, sanitizeFieldKey } from '@/types/escrowTypes';
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
  existingKeys?: string[];
}

export const FieldEditorDrawer: React.FC<FieldEditorDrawerProps> = ({
  field,
  isOpen,
  onClose,
  onSave,
  existingKeys = [],
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
    const autoKey = val.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    setFormData((prev) => ({
      ...prev,
      label: val,
      key: prev.key ? prev.key : autoKey,
      name: prev.name ? prev.name : autoKey,
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

  const cleanedKey = sanitizeFieldKey(formData.key || formData.name || formData.label || '');
  const isReserved = RESERVED_FIELD_KEYS.has(cleanedKey);
  const isDuplicate = Boolean(
    existingKeys &&
      existingKeys
        .filter((k) => k?.toLowerCase() !== field?.key?.toLowerCase())
        .map((k) => k?.toLowerCase())
        .includes(cleanedKey)
  );

  let keyError: string | null = null;
  if (isReserved) {
    keyError = `Field key "${cleanedKey}" is reserved. Please choose another key (e.g. ${cleanedKey}_field).`;
  } else if (isDuplicate) {
    keyError = `Field key "${cleanedKey}" is already used by another field.`;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label?.trim() || keyError) return;

    const fieldKey = cleanedKey;
    const selectedType = mapFieldTypeToApi(formData.fieldType as string, formData.type as string);

    const updatedField: FormFieldConfig = {
      ...(field as FormFieldConfig),
      ...(formData as FormFieldConfig),
      label: formData.label.trim(),
      key: fieldKey,
      name: fieldKey,
      fieldType: selectedType,
      type: selectedType.toLowerCase() as FieldType,
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
            {/* Field Type Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Field Type *</Label>
              <Select
                value={String(formData.fieldType || formData.type || 'STRING').toUpperCase()}
                onValueChange={(val) => {
                  handleChange('fieldType', val);
                  handleChange('type', val.toLowerCase());
                }}
              >
                <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-slate-100 font-mono text-xs rounded-xl h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-xl shadow-2xl z-[150] max-h-60 overflow-y-auto">
                  {['STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'FILE', 'IMAGE', 'DROPDOWN', 'RADIO', 'TEXTAREA', 'VIDEO', 'LOCATION', 'DOCUMENT', 'CHECKBOX'].map((t) => (
                    <SelectItem key={t} value={t} className="text-xs font-mono cursor-pointer focus:bg-indigo-600 focus:text-white">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            {/* Field Key */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Field Key (Unique Variable Key) *</Label>
              <Input
                value={formData.key || formData.name || ''}
                onChange={(e) => {
                  const rawVal = e.target.value.toLowerCase().replace(/[^a-z0-9_]+/g, '_');
                  handleChange('key', rawVal);
                  handleChange('name', rawVal);
                }}
                placeholder="e.g. project_name"
                className={`bg-slate-950 font-mono text-indigo-300 text-xs rounded-xl h-10 ${
                  keyError ? 'border-rose-500 ring-1 ring-rose-500 text-rose-300' : 'border-slate-800'
                }`}
                required
              />
              {keyError && (
                <p className="text-[11px] font-semibold text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{keyError}</span>
                </p>
              )}
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

            {/* Target Role (Buyer / Seller / Both) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">Target Role / Form Assignment</Label>
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                {[
                  { id: 'both', label: 'Both Roles' },
                  { id: 'buyer', label: 'Buyer Only' },
                  { id: 'seller', label: 'Seller Only' },
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleChange('targetRole', role.id)}
                    className={`py-2 px-2 rounded-lg text-xs font-bold transition-all ${
                      (formData.targetRole === role.id || (!formData.targetRole && role.id === 'both'))
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TYPE SPECIFIC CONFIGURATIONS */}
            {(() => {
              const fTypeUpper = String(formData.fieldType || formData.type || 'STRING').toUpperCase();

              return (
                <>
                  {/* TEXT & TEXTAREA */}
                  {(fTypeUpper === 'STRING' || fTypeUpper === 'TEXTAREA' || fieldType === 'text' || fieldType === 'textarea') && (
                    <div className="space-y-4 pt-2 border-t border-slate-800">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">String & Textarea Validation</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-300">Min Length</Label>
                          <Input
                            type="number"
                            value={formData.minLength ?? ''}
                            onChange={(e) => handleChange('minLength', parseInt(e.target.value) || undefined)}
                            placeholder="e.g. 2"
                            className="bg-slate-950 border-slate-800 text-xs rounded-xl h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-300">Max Length</Label>
                          <Input
                            type="number"
                            value={formData.maxLength ?? ''}
                            onChange={(e) => handleChange('maxLength', parseInt(e.target.value) || undefined)}
                            placeholder="e.g. 80"
                            className="bg-slate-950 border-slate-800 text-xs rounded-xl h-9"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(formData.noWhitespaceOnly)}
                            onChange={(e) => handleChange('noWhitespaceOnly', e.target.checked)}
                            className="rounded border-slate-700 bg-slate-900 text-indigo-600"
                          />
                          <span>No Whitespace Only</span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(formData.alphabetsOnly)}
                            onChange={(e) => handleChange('alphabetsOnly', e.target.checked)}
                            className="rounded border-slate-700 bg-slate-900 text-indigo-600"
                          />
                          <span>Alphabets Only</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* NUMBER */}
                  {(fTypeUpper === 'NUMBER' || fieldType === 'number') && (
                    <div className="space-y-4 pt-2 border-t border-slate-800">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Number Validation</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-300">Min Value</Label>
                          <Input
                            type="number"
                            value={formData.minValue ?? formData.min ?? ''}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              handleChange('minValue', isNaN(val) ? undefined : val);
                              handleChange('min', isNaN(val) ? undefined : val);
                            }}
                            placeholder="e.g. 1886"
                            className="bg-slate-950 border-slate-800 text-xs rounded-xl h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-300">Max Value</Label>
                          <Input
                            type="number"
                            value={formData.maxValue ?? formData.max ?? ''}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              handleChange('maxValue', isNaN(val) ? undefined : val);
                              handleChange('max', isNaN(val) ? undefined : val);
                            }}
                            placeholder="e.g. 2100"
                            className="bg-slate-950 border-slate-800 text-xs rounded-xl h-9"
                          />
                        </div>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.allowDecimal ?? true}
                            onChange={(e) => handleChange('allowDecimal', e.target.checked)}
                            className="rounded border-slate-700 bg-slate-900 text-indigo-600"
                          />
                          <span>Allow Decimal Values</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* UPLOAD (FILE, IMAGE, VIDEO, DOCUMENT) */}
                  {(['FILE', 'IMAGE', 'VIDEO', 'DOCUMENT'].includes(fTypeUpper) || fieldType === 'file' || fieldType === 'image') && (
                    <div className="space-y-4 pt-2 border-t border-slate-800">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upload Settings</h3>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-300 font-semibold">Upload Type</Label>
                        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                          <button
                            type="button"
                            onClick={() => handleChange('uploadType', 'SINGLE')}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                              formData.uploadType === 'SINGLE' || !formData.uploadType
                                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Single File
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChange('uploadType', 'MULTIPLE')}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                              formData.uploadType === 'MULTIPLE'
                                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            Multiple Files
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-300">Min Count</Label>
                          <Input
                            type="number"
                            value={formData.minUploadCount ?? 1}
                            onChange={(e) => handleChange('minUploadCount', parseInt(e.target.value) || 1)}
                            className="bg-slate-950 border-slate-800 text-xs rounded-xl h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-300">Max Count</Label>
                          <Input
                            type="number"
                            value={formData.maxUploadCount ?? formData.maxFiles ?? 10}
                            onChange={(e) => {
                              const cnt = parseInt(e.target.value) || 10;
                              handleChange('maxUploadCount', cnt);
                              handleChange('maxFiles', cnt);
                            }}
                            className="bg-slate-950 border-slate-800 text-xs rounded-xl h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-300">File Size (Bytes)</Label>
                          <Input
                            type="number"
                            value={formData.fileSizeLimit ?? (formData.maxSizeMb ? formData.maxSizeMb * 1024 * 1024 : 10485760)}
                            onChange={(e) => {
                              const bytes = parseInt(e.target.value) || 10485760;
                              handleChange('fileSizeLimit', bytes);
                              handleChange('maxSizeMb', Math.round(bytes / (1024 * 1024)));
                            }}
                            className="bg-slate-950 border-slate-800 text-xs rounded-xl h-9"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* OPTIONS MANAGEMENT (DROPDOWN, RADIO, SELECT, MULTISELECT) */}
                  {(['DROPDOWN', 'RADIO'].includes(fTypeUpper) || ['select', 'multiselect', 'radio'].includes(fieldType)) && (
                    <div className="space-y-4 pt-2 border-t border-slate-800">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Options ({options.length})</h3>
                      <div className="flex gap-2">
                        <Input
                          value={newOptionLabel}
                          onChange={(e) => setNewOptionLabel(e.target.value)}
                          placeholder="Enter option label..."
                          className="bg-slate-950 border-slate-800 text-xs rounded-xl h-9"
                        />
                        <Button
                          type="button"
                          onClick={handleAddOption}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 px-3 rounded-xl shrink-0"
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
                              placeholder="Label"
                              className="flex-1 bg-transparent text-xs text-slate-100 focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-500 font-mono">val: {opt.value}</span>
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

                  {/* CHECKBOX SETTINGS */}
                  {(fTypeUpper === 'CHECKBOX' || fieldType === 'checkbox') && (
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Checkbox Details</h3>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-300">Checkbox Label Text</Label>
                        <Input
                          value={formData.checkboxText || ''}
                          onChange={(e) => handleChange('checkboxText', e.target.value)}
                          placeholder="e.g. I agree to the terms and conditions"
                          className="bg-slate-950 border-slate-800 text-xs rounded-xl h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-300">Optional Link URL</Label>
                        <Input
                          value={formData.checkboxLink || ''}
                          onChange={(e) => handleChange('checkboxLink', e.target.value)}
                          placeholder="https://example.com/terms"
                          className="bg-slate-950 border-slate-800 font-mono text-indigo-300 text-xs rounded-xl h-9"
                        />
                      </div>
                    </div>
                  )}

                  {/* TOOLTIP & HELP CONTENT */}
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tooltip & Help Info</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-300">Tooltip Type</Label>
                        <Select
                          value={formData.tooltipType || 'info'}
                          onValueChange={(t) => handleChange('tooltipType', t)}
                        >
                          <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-100 text-xs rounded-xl h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-slate-100 rounded-xl z-[150]">
                            <SelectItem value="info" className="text-xs">Info Popover</SelectItem>
                            <SelectItem value="warning" className="text-xs">Warning Note</SelectItem>
                            <SelectItem value="help" className="text-xs">Help Icon</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-300">Tooltip Content</Label>
                        <Input
                          value={formData.tooltipContent || formData.tooltip || ''}
                          onChange={(e) => {
                            handleChange('tooltipContent', e.target.value);
                            handleChange('tooltip', e.target.value);
                          }}
                          placeholder="Guidance for user..."
                          className="bg-slate-950 border-slate-800 text-xs rounded-xl h-9"
                        />
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
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
            <Button
              type="submit"
              disabled={Boolean(keyError)}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs rounded-xl px-5 h-9 shadow-lg shadow-indigo-600/20"
            >
              Save Field Configuration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
