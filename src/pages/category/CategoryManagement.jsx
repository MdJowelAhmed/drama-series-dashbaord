import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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

  const getErrorMessage = (error, fallbackMessage) => {
    return (
      error?.data?.message ||
      error?.data?.error?.[0]?.message ||
      fallbackMessage
    );
  };

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
          categoryData: { name: formData.name } 
        }).unwrap();
        toast.success("Category updated successfully");
      } else {
        await createCategory({ name: formData.name }).unwrap();
        toast.success("Category created successfully");
      }
      
      setIsModalOpen(false);
      setFormData({ name: '' });
      setEditingId(null);
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error(getErrorMessage(error, "Failed to save category"));
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
      toast.success("Category deleted successfully");
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete category"));
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
          <h1 className="text-4xl font-bold mb-2">Category Manager</h1>
          <p>Manage your product categories</p>
        </div>
        <Button onClick={openCreateModal} className="gap-2 py-6 rounded-sm">
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Card key={category._id} className="hover:shadow-lg transition-shadow backdrop-blur-md bg-white/30">
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
                      disabled={isUpdatingStatus && pendingStatus?.category._id === category._id}
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
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500 text-lg">No categories yet. Create your first category!</p>
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