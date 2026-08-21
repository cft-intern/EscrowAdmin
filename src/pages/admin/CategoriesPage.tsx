import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Layers,
  Edit2,
  FormInput,
  Trash2,
  Globe,
  Palette,
  Code2,
  Briefcase,
  Megaphone,
  Package,
  Folder,
  Sparkles,
  Cpu,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCategory } from '@/context/CategoryContext';
import { Category } from '@/types/escrowTypes';
import toast from 'react-hot-toast';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  Palette,
  Code2,
  Briefcase,
  Megaphone,
  Package,
  Folder,
  Sparkles,
  Cpu,
};

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    setActiveCategoryId,
  } = useCategory();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  // Form inputs for modal
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Globe');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || cat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCreateModal = () => {
    setTitle('');
    setDescription('');
    setIcon('Globe');
    setStatus('active');
    setIsCreateOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setTitle(cat.title);
    setDescription(cat.description);
    setIcon(cat.icon || 'Globe');
    setStatus(cat.status);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Category title is required.');
      return;
    }

    const newCat = addCategory({
      title: title.trim(),
      name: title.trim(),
      description: description.trim(),
      icon,
      status,
    });

    setIsCreateOpen(false);
    toast.success(`Category "${newCat.title}" created successfully!`);
    // Navigate straight to form builder for newly created category
    setActiveCategoryId(newCat.id);
    navigate(`/categories/${newCat.id}/builder`);
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !title.trim()) return;

    updateCategory(editingCategory.id, {
      title: title.trim(),
      name: title.trim(),
      description: description.trim(),
      icon,
      status,
    });

    setEditingCategory(null);
    toast.success('Category updated successfully.');
  };

  const handleDeleteCategory = () => {
    if (!deletingCategoryId) return;
    const cat = categories.find((c) => c.id === deletingCategoryId);
    deleteCategory(deletingCategoryId);
    setDeletingCategoryId(null);
    toast.success(`Category "${cat?.title || ''}" deleted.`);
  };

  const renderIcon = (iconName: string) => {
    const IconComp = ICON_MAP[iconName] || Layers;
    return <IconComp className="h-6 w-6 text-indigo-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            Categories
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create and configure the forms required for each escrow category.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20 rounded-xl px-5 h-10 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Category</span>
        </Button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-950/60 border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl text-sm"
          />
        </div>

        <div className="flex items-center space-x-1.5 self-end sm:self-auto bg-slate-950/60 border border-slate-800 rounded-xl p-1">
          {(['all', 'active', 'inactive'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Cards Grid */}
      {filteredCategories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-12 text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
            <Layers className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No categories found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'No categories match your search filters.'
              : 'Create your first escrow category to start defining form requirements.'}
          </p>
          {!searchQuery && (
            <Button onClick={openCreateModal} size="sm" className="bg-indigo-600 text-white rounded-xl">
              + Create Category
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((category) => {
            const fieldCount = category.fields?.length || 0;
            return (
              <div
                key={category.id}
                className="group rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Category Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 group-hover:border-indigo-500/40 transition-colors">
                        {renderIcon(category.icon)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 text-base group-hover:text-indigo-300 transition-colors">
                          {category.title}
                        </h3>
                        <span className="text-[11px] font-medium text-slate-400">
                          {fieldCount} {fieldCount === 1 ? 'Field' : 'Fields'} configured
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        category.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {category.status === 'active' ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <XCircle className="h-3 w-3 text-slate-400" />
                      )}
                      <span className="capitalize">{category.status}</span>
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {category.description || 'No description provided.'}
                  </p>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-900 flex items-center justify-between gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(category)}
                    className="flex-1 text-xs text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg h-8"
                  >
                    <Edit2 className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => {
                      setActiveCategoryId(category.id);
                      navigate(`/categories/${category.id}/builder`);
                    }}
                    className="flex-1 text-xs font-medium bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-lg h-8 shadow-sm"
                  >
                    <FormInput className="mr-1.5 h-3.5 w-3.5" />
                    Form Builder
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingCategoryId(category.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg h-8 px-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-100">Create New Category</h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">Category Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Website Development"
                  className="bg-slate-950/70 border-slate-800 text-slate-100 text-sm h-10 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-4">
                {/* Visual Icon Grid Selection */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Category Icon</Label>
                  <div className="grid grid-cols-5 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    {Object.keys(ICON_MAP).map((ic) => {
                      const IconComponent = ICON_MAP[ic] || Layers;
                      const isSelected = icon === ic;
                      return (
                        <button
                          key={ic}
                          type="button"
                          onClick={() => setIcon(ic)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs transition-all ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 font-bold shadow-md shadow-indigo-500/10'
                              : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <IconComponent className="h-4 w-4 mb-1" />
                          <span className="text-[10px] truncate max-w-full">{ic}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status Selection */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Category Status</Label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setStatus('active')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('inactive')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        status === 'inactive'
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Inactive
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsCreateOpen(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl px-4 h-9"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl px-5 h-9 shadow-lg shadow-indigo-600/20">
                  Create Category & Build Form
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-100">Edit Category</h2>
              <button onClick={() => setEditingCategory(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">Category Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-slate-950/70 border-slate-800 text-slate-100 text-sm h-10 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-4">
                {/* Visual Icon Grid Selection */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Category Icon</Label>
                  <div className="grid grid-cols-5 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    {Object.keys(ICON_MAP).map((ic) => {
                      const IconComponent = ICON_MAP[ic] || Layers;
                      const isSelected = icon === ic;
                      return (
                        <button
                          key={ic}
                          type="button"
                          onClick={() => setIcon(ic)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs transition-all ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400 font-bold shadow-md shadow-indigo-500/10'
                              : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <IconComponent className="h-4 w-4 mb-1" />
                          <span className="text-[10px] truncate max-w-full">{ic}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status Selection */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Category Status</Label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setStatus('active')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('inactive')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        status === 'inactive'
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Inactive
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingCategory(null)}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl px-4 h-9"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl px-5 h-9 shadow-lg shadow-indigo-600/20">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingCategoryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Delete Category?</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to remove this category and all its configured form fields? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3">
              <Button
                variant="ghost"
                onClick={() => setDeletingCategoryId(null)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl px-4 h-9"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteCategory}
                className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl"
              >
                Delete Category
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
