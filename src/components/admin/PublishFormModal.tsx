import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FormFieldConfig } from '@/types/escrowTypes';
import { useCategory } from '@/context/CategoryContext';
import handleCategoryApiError from '@/utils/categoryErrorHandler';
import { Search, Send, CheckCircle2, Shield, Loader2, X, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PublishFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCategoryId: string;
  currentCategoryName: string;
  fields: FormFieldConfig[];
}

export const PublishFormModal: React.FC<PublishFormModalProps> = ({
  isOpen,
  onClose,
  currentCategoryId,
  currentCategoryName,
  fields,
}) => {
  const { categories, publishFormToDomains, saveForm } = useCategory();
  const [selectedDomainIds, setSelectedDomainIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // Pre-select current domain by default when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDomainIds([currentCategoryId]);
      setSearchQuery('');
      setIsPublishing(false);
    }
  }, [isOpen, currentCategoryId]);

  if (!isOpen) return null;

  // Filter available domains by search query
  const filteredDomains = categories.filter((cat) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const name = (cat.name || cat.title || '').toLowerCase();
    return name.includes(q);
  });

  const handleToggleDomain = (id: string) => {
    setSelectedDomainIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const visibleIds = filteredDomains.map((d) => d.id);
    const combined = Array.from(new Set([...selectedDomainIds, ...visibleIds]));
    setSelectedDomainIds(combined);
  };

  const handleClearSelection = () => {
    setSelectedDomainIds([]);
  };

  const handleConfirmPublish = async () => {
    if (isPublishing) return;

    if (fields.length === 0) {
      toast.error('Input fields is 0. At least 1 field is required to publish.');
      return;
    }

    if (selectedDomainIds.length === 0) {
      toast.error('Please select at least one domain to publish to.');
      return;
    }

    setIsPublishing(true);

    try {
      // Execute domain activation and form schema publishing
      const result = await publishFormToDomains(currentCategoryId, selectedDomainIds, fields);

      if (result.success) {
        toast.success(`Form published successfully for ${selectedDomainIds.length} domain(s).`);
        onClose();
      } else {
        toast.error(result.message || 'Unable to publish form.');
      }
    } catch (err: any) {
      handleCategoryApiError(err);
    } finally {
      setIsPublishing(false);
    }
  };

  const selectedDomainsList = categories.filter((c) => selectedDomainIds.includes(c.id));
  const hasZeroFields = fields.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-100">Publish Form Schema</h2>
              <p className="text-xs text-slate-400">Select the domains where this form should be active.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPublishing}
            className="text-slate-400 hover:text-white transition-colors p-1 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Meta Info */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-slate-200">Source: {currentCategoryName}</span>
          </div>
          <span
            className={`font-bold px-2 py-0.5 rounded-full border text-[10px] ${
              hasZeroFields
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
            }`}
          >
            {fields.length} {fields.length === 1 ? 'Input Field' : 'Input Fields'}
          </span>
        </div>

        {/* 0 Fields Warning Banner */}
        {hasZeroFields && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2.5 shrink-0">
            <X className="h-4 w-4 text-rose-400 shrink-0" />
            <span>
              <strong>Input fields is 0:</strong> At least 1 field is required to publish this form.
            </span>
          </div>
        )}

        {/* Search & Bulk Controls */}
        <div className="space-y-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <Input
              placeholder="Search domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isPublishing}
              className="pl-8 bg-slate-950 border-slate-800 text-slate-100 text-xs placeholder:text-slate-500 rounded-xl h-9 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSelectAll}
                disabled={isPublishing || filteredDomains.length === 0}
                className="text-indigo-400 hover:text-indigo-300 font-semibold text-[11px] disabled:opacity-40 transition-colors"
              >
                Select All ({filteredDomains.length})
              </button>
              <span className="text-slate-700">•</span>
              <button
                type="button"
                onClick={handleClearSelection}
                disabled={isPublishing || selectedDomainIds.length === 0}
                className="text-slate-400 hover:text-slate-200 font-semibold text-[11px] disabled:opacity-40 transition-colors"
              >
                Clear Selection
              </button>
            </div>

            <span className="font-bold text-slate-300 bg-slate-950 px-2.5 py-0.5 rounded-md border border-slate-800 text-[11px]">
              Selected: <span className="text-indigo-400">{selectedDomainIds.length}</span> {selectedDomainIds.length === 1 ? 'domain' : 'domains'}
            </span>
          </div>
        </div>

        {/* Scrollable Domain Selection List */}
        <div className="min-h-0 flex-1 overflow-y-auto space-y-2 pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full">
          {filteredDomains.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <p className="text-xs text-slate-400 font-medium">No domains match your search query.</p>
            </div>
          ) : (
            filteredDomains.map((cat) => {
              const isSelected = selectedDomainIds.includes(cat.id);
              const isCurrent = cat.id === currentCategoryId;
              const title = cat.title || cat.name || 'Untitled Category';
              const inputCount = Array.isArray(cat.fields) ? cat.fields.length : 0;

              return (
                <div
                  key={cat.id}
                  onClick={() => !isPublishing && handleToggleDomain(cat.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-indigo-600/10 border-indigo-500/50 ring-1 ring-indigo-500/20'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-950 hover:border-slate-700'
                  } ${isPublishing ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="text-indigo-400 shrink-0">
                      {isSelected ? (
                        <CheckSquare className="h-4.5 w-4.5 text-indigo-400" />
                      ) : (
                        <Square className="h-4.5 w-4.5 text-slate-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-slate-100' : 'text-slate-300'}`}>
                          {title}
                        </span>
                        {isCurrent && (
                          <span className="bg-indigo-500/20 text-indigo-300 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border border-indigo-500/30">
                            Current
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {inputCount} {inputCount === 1 ? 'active input' : 'active inputs'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      cat.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {cat.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Summary Confirmation Box */}
        {selectedDomainIds.length > 0 && (
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-1.5 shrink-0">
            <div className="flex items-center space-x-1.5 text-indigo-300 text-xs font-bold">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>Will become ACTIVE form for:</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight line-clamp-2 font-medium">
              {selectedDomainsList.map((d) => d.title || d.name).join(', ')}
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 border-t border-slate-800 pt-4 shrink-0">
          <Button
            type="button"
            onClick={onClose}
            disabled={isPublishing}
            variant="ghost"
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleConfirmPublish}
            disabled={selectedDomainIds.length === 0 || isPublishing || hasZeroFields}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 rounded-xl px-5 h-10 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Publish Form ({selectedDomainIds.length})</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
