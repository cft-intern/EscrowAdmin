import React, { useState, useEffect } from 'react';
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
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCategory } from '@/context/CategoryContext';
import { Category } from '@/types/escrowTypes';
import categoryService from '@/services/categoryService';
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
  const { setActiveCategoryId, addCategory } = useCategory();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form inputs for modal
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Globe');
  const [status, setStatus] = useState<string>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load categories from real backend GET /category
  const fetchCategories = async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');
    try {
      const response = await categoryService.getAll(statusFilter !== 'all' ? statusFilter : undefined);
      if (response && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        setCategories([]);
      }
    } catch (err: any) {
      console.error('Fetch categories API error:', err);
      setIsError(true);
      const msg = err.response?.data?.message || err.message || 'Failed to load categories from backend API';
      setErrorMessage(msg);
      setCategories([]);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [statusFilter]);

  const filteredCategories = categories.filter((cat) => {
    const catTitle = cat.title || cat.name || '';
    const catDesc = cat.description || '';
    const matchesSearch =
      catTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catDesc.toLowerCase().includes(searchQuery.toLowerCase());
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
    setTitle(cat.title || cat.name || '');
    setDescription(cat.description || '');
    setIcon(cat.icon || 'Globe');
    setStatus(cat.status || 'active');
  };

  // POST /category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Category title is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await categoryService.create({
        name: title.trim(),
        title: title.trim(),
        description: description.trim(),
        icon,
        status,
      });

      const newCat = response.data;
      toast.success(`Category "${newCat.title || newCat.name}" created successfully!`);
      setIsCreateOpen(false);

      // Refresh list
      fetchCategories();
    } catch (err: any) {
      console.error('Create category API error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to create category on backend';
      toast.error(msg);

      // Fallback local creation in Context if needed
      const createdLocal = await addCategory({
        title: title.trim(),
        name: title.trim(),
        description: description.trim(),
        icon,
        status: status as 'active' | 'inactive',
      });
      setCategories((prev) => [createdLocal, ...prev]);
      setIsCreateOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // PATCH /category/{id}/status/{status}
  const handleToggleStatus = async (cat: Category) => {
    const newStatus = cat.status === 'active' ? 'inactive' : 'active';
    try {
      await categoryService.setStatus(cat.id, newStatus);
      toast.success(`Category "${cat.title || cat.name}" status updated to ${newStatus}`);
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, status: newStatus as 'active' | 'inactive' } : c))
      );
    } catch (err: any) {
      console.error('Status update API error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to update category status';
      toast.error(msg);
    }
  };

  const handleOpenBuilder = (catId: string) => {
    setActiveCategoryId(catId);
    navigate(`/categories/${catId}/builder`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Layers className="h-6 w-6 text-indigo-400" />
            Escrow Categories
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage category schemas, status configurations, and dynamic form inputs.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 rounded-xl h-10 px-4 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Category</span>
        </Button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-950 border-slate-800 text-slate-100 text-xs rounded-xl h-9 placeholder:text-slate-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['all', 'active', 'inactive'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                  statusFilter === st ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <Button
            onClick={fetchCategories}
            variant="outline"
            size="icon"
            className="h-9 w-9 bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-100 rounded-xl"
            title="Refresh Categories"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Category Grid / States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 rounded-2xl border border-slate-800 bg-slate-900/40 animate-pulse p-5 space-y-4">
              <div className="h-6 w-1/2 bg-slate-800 rounded-lg" />
              <div className="h-4 w-3/4 bg-slate-800/60 rounded" />
              <div className="h-10 w-full bg-slate-800/40 rounded-xl mt-auto" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 text-center space-y-3">
          <AlertTriangle className="h-8 w-8 text-rose-400 mx-auto" />
          <h3 className="text-base font-bold text-rose-300">Failed to Load Categories</h3>
          <p className="text-xs text-rose-400/80 max-w-md mx-auto">{errorMessage || 'Could not connect to backend category service.'}</p>
          <Button onClick={fetchCategories} className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl mt-2">
            Retry Connection
          </Button>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center space-y-3">
          <Folder className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No categories found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery ? 'No categories match your search filters.' : 'There are no active categories in the system yet.'}
          </p>
          <Button onClick={openCreateModal} className="bg-indigo-600 text-white text-xs font-bold rounded-xl">
            Create First Category
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((cat) => {
            const IconComp = ICON_MAP[cat.icon] || Globe;
            const fieldsCount = Array.isArray(cat.fields) ? cat.fields.length : 0;
            const catTitle = cat.title || cat.name || 'Untitled Category';

            return (
              <div
                key={cat.id}
                className="group relative rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl hover:border-indigo-500/50 hover:shadow-indigo-500/5 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
                        <IconComp className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                          {catTitle}
                        </h2>
                        <span className="text-[10px] text-slate-500 font-mono">ID: {cat.id}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(cat)}
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1 transition-all ${
                        cat.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {cat.status === 'active' ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                    {cat.description || 'No description provided for this category.'}
                  </p>
                </div>

                {/* Footer Info & Actions */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-medium">
                    <span>{fieldsCount} Inputs</span>
                    <span>•</span>
                    <span>{cat.escrowCount || 0} Escrows</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => openEditModal(cat)}
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-xs text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      onClick={() => handleOpenBuilder(cat.id)}
                      className="h-8 px-3 text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <FormInput className="h-3.5 w-3.5" />
                      <span>Form Builder</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Category Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Create New Category</h2>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-300">Category Name / Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Website Development"
                  className="bg-slate-950 border-slate-800 text-slate-100 text-xs rounded-xl h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-300">Description</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the category..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-300">Icon</Label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {Object.keys(ICON_MAP).map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-300">Initial Status</Label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  variant="ghost"
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl h-10 px-4"
                >
                  {isSubmitting ? 'Creating...' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
