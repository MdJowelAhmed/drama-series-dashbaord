import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import DeleteConfirmationModal from '@/components/share/DeleteConfirmationModal';
import {
  useDeleteCategoryMutation,
  useGetAllCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from '@/redux/feature/categoryApi';
import {
  useCreateSubcategoryMutation,
  useDeleteSubcategoryMutation,
  useGetSubcategoriesByCategoryQuery,
} from '@/redux/feature/subcategoryApi';

const getErrorMessage = (error, fallbackMessage) =>
  error?.data?.message ||
  error?.data?.error?.[0]?.message ||
  fallbackMessage;

const isLibraryCategory = (category) =>
  (category?.name || '').trim().toLowerCase() === 'library';

function LibrarySubcategorySection({ category }) {
  const {
    data: subcategoryData,
    isFetching,
  } = useGetSubcategoriesByCategoryQuery(category._id, {
    skip: !category._id,
  });
  const [createSubcategory, { isLoading: isCreating }] =
    useCreateSubcategoryMutation();
  const [deleteSubcategory, { isLoading: isDeleting }] =
    useDeleteSubcategoryMutation();

  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [viewOpen, setViewOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const subcategories = subcategoryData?.data || [];

  const openAdd = () => {
    setIsAdding(true);
    setInputValue('');
  };

  const closeAdd = () => {
    setIsAdding(false);
    setInputValue('');
  };

  const handleAdd = async () => {
    const value = inputValue.trim();
    if (!value) return;

    if (
      subcategories.some(
        (sub) => sub.name.trim().toLowerCase() === value.toLowerCase()
      )
    ) {
      toast.error('Subcategory already exists');
      return;
    }

    try {
      await createSubcategory({
        categoryId: category._id,
        name: value,
      }).unwrap();
      toast.success('Subcategory added');
      setInputValue('');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to add subcategory'));
    }
  };

  const handleDelete = async (sub) => {
    try {
      setDeletingId(sub._id);
      await deleteSubcategory(sub._id).unwrap();
      toast.success('Subcategory removed');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to remove subcategory'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <CardContent className="pt-0 space-y-3">
      <div className="flex items-center justify-between border-t border-white/40 pt-3">
        <p className="text-xs font-medium text-muted-foreground">
          {isFetching
            ? 'Loading…'
            : `${subcategories.length} subcategor${
                subcategories.length === 1 ? 'y' : 'ies'
              }`}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setViewOpen(true)}
          className="h-7 gap-1.5 px-2 text-xs"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </Button>
      </div>

      {isAdding ? (
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              } else if (e.key === 'Escape') {
                closeAdd();
              }
            }}
            placeholder="Subcategory name"
            disabled={isCreating}
            className="h-9 text-sm"
          />
          <Button
            type="button"
            size="icon"
            onClick={handleAdd}
            disabled={isCreating || !inputValue.trim()}
            className="h-9 w-9 shrink-0"
            aria-label="Add subcategory"
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={closeAdd}
            disabled={isCreating}
            className="h-9 w-9 shrink-0"
            aria-label="Done"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openAdd}
          className="gap-1.5 w-full"
        >
          <Plus className="w-4 h-4" />
          Add Subcategory
        </Button>
      )}

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{category.name} — Subcategories</DialogTitle>
            <DialogDescription>
              {subcategories.length === 0
                ? 'No subcategories yet. Add one from the category card.'
                : `Total ${subcategories.length} subcategor${
                    subcategories.length === 1 ? 'y' : 'ies'
                  }.`}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto space-y-2 py-2">
            {isFetching && subcategories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Loading subcategories…
              </p>
            ) : subcategories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No subcategories found.
              </p>
            ) : (
              subcategories.map((sub) => (
                <div
                  key={sub._id}
                  className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white/60 px-3 py-2"
                >
                  <span className="text-sm font-medium break-words">
                    {sub.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(sub)}
                    disabled={isDeleting && deletingId === sub._id}
                    className="h-8 w-8 text-red-600 hover:text-red-700"
                    aria-label={`Delete ${sub.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setViewOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  );
}

export default function CategoryManager() {
  const { data: categoryData, isLoading, isError } = useGetAllCategoryQuery();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdatingStatus }] = useUpdateCategoryMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  const categories = categoryData?.data || [];
  const regularCategories = categories.filter((c) => !isLibraryCategory(c));
  const libraryCategories = categories.filter((c) => isLibraryCategory(c));

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingId(category._id);
    setFormData({ name: category.name });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    try {
      if (editingId) {
        await updateCategory({
          id: editingId,
          categoryData: { name: formData.name },
        }).unwrap();
        toast.success('Category updated successfully');
      } else {
        await createCategory({ name: formData.name }).unwrap();
        toast.success('Category created successfully');
      }

      setIsModalOpen(false);
      setFormData({ name: '' });
      setEditingId(null);
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error(getErrorMessage(error, 'Failed to save category'));
    }
  };

  const handleDeleteClick = (category) => {
    setItemToDelete(category);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteCategory(itemToDelete._id).unwrap();
      toast.success('Category deleted successfully');
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete category'));
    }
  };

  const handleChange = (e) => {
    setFormData({ name: e.target.value });
  };

  const isCategoryActive = (category) =>
    (category.status ?? 'active').toLowerCase() === 'active';

  const requestStatusChange = (category, checked) => {
    const nextStatus = checked ? 'active' : 'inactive';
    if (isCategoryActive(category) === checked) return;
    setPendingStatus({ category, nextStatus });
    setStatusConfirmOpen(true);
  };

  const closeStatusConfirm = () => {
    setStatusConfirmOpen(false);
    setPendingStatus(null);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;
    const { category, nextStatus } = pendingStatus;
    try {
      await updateCategory({
        id: category._id,
        categoryData: { status: nextStatus },
      }).unwrap();
      toast.success(
        nextStatus === 'active' ? 'Category activated' : 'Category deactivated'
      );
      closeStatusConfirm();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update status'));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <p className="text-lg">Loading categories...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <p className="text-lg text-red-600">Error loading categories</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Category Management</h1>
          <p>Manage all your categories in here</p>
        </div>
        <Button onClick={openCreateModal} className="gap-2 py-6 rounded-sm">
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {(() => {
        const renderCategoryCard = (category) => {
          const isLibrary = isLibraryCategory(category);
          return (
            <Card
              key={category._id}
              className="hover:shadow-lg transition-shadow backdrop-blur-md bg-white/30"
            >
              <CardHeader>
                <CardTitle className="flex justify-between items-start gap-2">
                  <span className="min-w-0 break-words">{category.name}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <div
                      className="flex items-center gap-1.5"
                      title={isCategoryActive(category) ? 'Active' : 'Inactive'}
                    >
                      <span className="text-xs font-normal text-muted-foreground whitespace-nowrap hidden sm:inline">
                        {/* {isCategoryActive(category) ? 'Active' : 'Inactive'} */}
                      </span>
                      <Switch
                        checked={isCategoryActive(category)}
                        disabled={
                          isUpdatingStatus &&
                          pendingStatus?.category._id === category._id
                        }
                        onCheckedChange={(checked) =>
                          requestStatusChange(category, checked)
                        }
                        aria-label={`Toggle status for ${category.name}`}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(category)}
                      className="h-8 w-8"
                    >
                      <Pencil className="w-6 h-6" />
                    </Button>
                    {/* <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(category)}
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-6 h-6" />
                    </Button> */}
                  </div>
                </CardTitle>
              </CardHeader>

              {isLibrary && <LibrarySubcategorySection category={category} />}
            </Card>
          );
        };

        return (
          <div className="space-y-6">
            {regularCategories.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {regularCategories.map(renderCategoryCard)}
              </div>
            )}

            {libraryCategories.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {libraryCategories.map(renderCategoryCard)}
              </div>
            )}
          </div>
        );
      })()}

      {categories.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500 text-lg">
            No categories yet. Create your first category!
          </p>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the category information below.'
                : 'Add a new category to organize your products.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter category name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={statusConfirmOpen}
        onOpenChange={(open) => {
          if (!open) closeStatusConfirm();
        }}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Confirm status change</DialogTitle>
            <DialogDescription>
              {pendingStatus?.nextStatus === 'active'
                ? `Activate category "${pendingStatus?.category?.name}"? It will be marked as active.`
                : `Deactivate category "${pendingStatus?.category?.name}"? It will be marked as inactive.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isUpdatingStatus}
              onClick={closeStatusConfirm}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isUpdatingStatus}
              onClick={confirmStatusChange}
            >
              {isUpdatingStatus ? 'Updating…' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        itemName={itemToDelete?.name}
        title="Delete Category"
        description={`Are you sure you want to delete the category "${itemToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
