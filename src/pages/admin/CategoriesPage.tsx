import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Layers,
  Edit2,
  FormInput,
  Trash2,
  Eye,
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
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCategory } from '@/context/CategoryContext';
import { Category } from '@/types/escrowTypes';
import categoryService, { buildCategoryBackendPayload, mapCategoryFromApi } from '@/services/categoryService';
import handleCategoryApiError from '@/utils/categoryErrorHandler';
import { FormPreviewModal } from '@/components/admin/FormPreviewModal';
import toast from 'react-hot-toast';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
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
  const { setActiveCategoryId, addCategory, refreshCategories } = useCategory();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Delete & Preview Modal States
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewCategory, setPreviewCategory] = useState<Category | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Form inputs for modal
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugTouched, setIsSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Shield');
  const [status, setStatus] = useState<string>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugTouched) {
      const generatedSlug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  };

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
      setIsError(true);
      const msg = handleCategoryApiError(err, { silent: true });
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
    setSlug('');
    setIsSlugTouched(false);
    setDescription('');
    setIcon('Shield');
    setStatus('active');
    setIsCreateOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    const catName = cat.title || cat.name || '';
    setTitle(catName);
    setSlug(cat.slug || catName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
    setIsSlugTouched(true);
    setDescription(cat.description || '');
    setIcon(cat.icon || 'Shield');
    setStatus(cat.status || 'active');
    setIsEditOpen(true);
  };

  // PATCH /category/{id} - Update Category Metadata & Form
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !editingCategory) return;

    const categoryName = title.trim();
    if (!categoryName) {
      toast.error('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory.status !== status) {
        await categoryService.setStatus(editingCategory.id, status);
      }

      const categorySlug = slug.trim() || categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const updatedCategoryObj: Category = {
        ...editingCategory,
        title: categoryName,
        name: categoryName,
        slug: categorySlug,
        description: description.trim(),
        icon,
        status: status as 'active' | 'inactive',
      };

      const payload = buildCategoryBackendPayload(updatedCategoryObj);
      await categoryService.update(editingCategory.id, payload);

      toast.success(`Category "${categoryName}" updated successfully!`);
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? updatedCategoryObj : c))
      );
      if (refreshCategories) {
        refreshCategories();
      }
      setIsEditOpen(false);
      setEditingCategory(null);
    } catch (err: any) {
      if (err?.response?.status === 409 || err?.status === 409) {
        toast.error('The category form cannot be updated after a contract item has used it.');
      } else {
        handleCategoryApiError(err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE /category/{id}
  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      await categoryService.delete(categoryToDelete.id);
      toast.success(`Category "${categoryToDelete.title || categoryToDelete.name}" deleted successfully!`);
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      if (refreshCategories) {
        refreshCategories();
      }
      setCategoryToDelete(null);
    } catch (err: any) {
      if (err?.response?.status === 409 || err?.status === 409) {
        toast.error('A category cannot be deleted after a contract item has used it. Deactivate it with status Inactive instead.');
      } else {
        handleCategoryApiError(err);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // GET /category/{id}/form - View Form Preview
  const handleViewForm = async (cat: Category) => {
    setIsLoadingPreview(true);
    try {
      const response = await categoryService.getForm(cat.id);
      if (response && response.data) {
        const normalized = mapCategoryFromApi(response.data);
        setPreviewCategory(normalized);
      } else {
        setPreviewCategory(cat);
      }
    } catch (err) {
      try {
        const response = await categoryService.getById(cat.id);
        if (response && response.data) {
          setPreviewCategory(response.data);
        } else {
          setPreviewCategory(cat);
        }
      } catch {
        setPreviewCategory(cat);
      }
    } finally {
      setIsLoadingPreview(false);
      setIsPreviewOpen(true);
    }
  };

  // POST /category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const categoryName = title.trim();
    const categorySlug = slug.trim() || categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (!categoryName) {
      toast.error('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await categoryService.create({
        name: categoryName,
        slug: categorySlug,
        icon,
        status,
        steps: [],
      });

      const newCat = response.data;
      toast.success(`Category "${newCat.name || newCat.title}" created successfully!`);
      setIsCreateOpen(false);

      // Refresh list & context
      if (refreshCategories) {
        await refreshCategories();
      }
      await fetchCategories();

      // Refresh page
      window.location.reload();
    } catch (err: any) {
      handleCategoryApiError(err);
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
      handleCategoryApiError(err);
    }
  };

  const handleOpenBuilder = (catId: string) => {
    setActiveCategoryId(catId);
    navigate(`/form-builder/${catId}`);
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

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto">
          <span className="text-xs text-slate-400 font-medium shrink-0">Status:</span>
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
            const IconComp = ICON_MAP[cat.icon] || Shield || Globe;
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
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md shadow-purple-600/20 text-white group-hover:scale-105 transition-transform">
                        <IconComp className="h-5 w-5 stroke-[2]" />
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
                  <div className="flex flex-col">
                    <span className="text-[11px]">
                      {fieldsCount > 0 ? (
                        <span className="text-indigo-300 font-bold flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                          Active Form ({fieldsCount} {fieldsCount === 1 ? 'Input' : 'Inputs'})
                        </span>
                      ) : (
                        <span className="text-slate-500 font-medium">No Active Form</span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {cat.escrowCount || 0} Escrows
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                    <Button
                      onClick={() => handleViewForm(cat)}
                      title="View Form Structure"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 rounded-lg flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">View Form</span>
                    </Button>

                    <Button
                      onClick={() => openEditModal(cat)}
                      title="Edit Category Details"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      onClick={() => setCategoryToDelete(cat)}
                      title="Delete Category"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      onClick={() => handleOpenBuilder(cat.id)}
                      className="h-8 px-2.5 text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg flex items-center gap-1.5 transition-all"
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
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Website Development"
                  className="bg-slate-950 border-slate-800 text-slate-100 text-xs rounded-xl h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-300">Category Slug *</Label>
                <Input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setIsSlugTouched(true);
                  }}
                  placeholder="e.g. website-development"
                  className="bg-slate-950 border-slate-800 text-indigo-300 font-mono text-xs rounded-xl h-10"
                  required
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

      {/* Edit Category Modal */}
      {isEditOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-100">Edit Category</h2>
                <p className="text-xs text-slate-400">Update category details and status</p>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                ID: {editingCategory.id}
              </span>
            </div>

            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-300">Category Name / Title *</Label>
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Website Development"
                  className="bg-slate-950 border-slate-800 text-slate-100 text-xs rounded-xl h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-300">Category Slug *</Label>
                <Input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setIsSlugTouched(true);
                  }}
                  placeholder="e.g. website-development"
                  className="bg-slate-950 border-slate-800 text-indigo-300 font-mono text-xs rounded-xl h-10"
                  required
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
                  <Label className="text-xs font-medium text-slate-300">Status</Label>
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
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingCategory(null);
                  }}
                  variant="ghost"
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl h-10 px-4 shadow-lg shadow-indigo-600/20"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Delete Category</h2>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              Are you sure you want to delete category <strong className="text-slate-100">{categoryToDelete.title || categoryToDelete.name}</strong> (ID: {categoryToDelete.id})?
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                variant="ghost"
                disabled={isDeleting}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDeleteCategory}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl h-10 px-4 shadow-lg shadow-rose-600/20"
              >
                {isDeleting ? 'Deleting...' : 'Delete Category'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Form Preview Modal */}
      {isPreviewOpen && previewCategory && (
        <FormPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewCategory(null);
          }}
          onEditForm={() => {
            const catId = previewCategory.id;
            setIsPreviewOpen(false);
            setPreviewCategory(null);
            handleOpenBuilder(catId);
          }}
          categoryTitle={previewCategory.title || previewCategory.name}
          categoryDescription={previewCategory.description}
          steps={previewCategory.steps || []}
          fields={previewCategory.fields || []}
        />
      )}
    </div>
  );
};

export default CategoriesPage;
