import React, { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function CategoryManager() {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Electronics', description: 'Electronic items and gadgets' },
    { id: 2, name: 'Clothing', description: 'Apparel and fashion items' },
    { id: 3, name: 'Books', description: 'Books and publications' },
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      return;
    }
    
    if (editingId) {
      // Edit existing category
      setCategories(categories.map(cat => 
        cat.id === editingId 
          ? { ...cat, name: formData.name, description: formData.description }
          : cat
      ));
    } else {
      // Create new category
      const newCategory = {
        id: Date.now(),
        name: formData.name,
        description: formData.description
      };
      setCategories([...categories, newCategory]);
    }
    
    setIsModalOpen(false);
    setFormData({ name: '', description: '' });
  };

  const handleDelete = (id) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold  mb-2">Category Manager</h1>
            <p className="">Manage your product categories</p>
          </div>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{category.name}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(category)}
                      className="h-8 w-8"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category.id)}
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
                <p className=''>{category.description}</p>
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
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Enter category description"
                  value={formData.description}
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
      </div>
    </div>
  );
}