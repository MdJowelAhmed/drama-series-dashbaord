import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { subscriptionService } from '@/services/subscriptionService';

const subscriptionSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be 0 or greater'),
  duration_days: z.number().min(1, 'Duration (in days) is required'),
  features: z.string().optional(),
});

const SubscriptionModal = ({ open, onOpenChange, editingSubscription = null, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: editingSubscription
      ? {
          name: editingSubscription.name,
          description: editingSubscription.description || '',
          price: Number(editingSubscription.price),
          duration_days: editingSubscription.duration_days,
          features: JSON.stringify(editingSubscription.features || []),
        }
      : {
          name: '',
          description: '',
          price: 0,
          duration_days: 30,
          features: '',
        },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const packageData = {
        name: data.name,
        description: data.description,
        price: data.price,
        duration_days: data.duration_days,
        features: data.features ? JSON.parse(data.features) : [],
      };

      if (editingSubscription) {
        await subscriptionService.updatePackage(editingSubscription.id, packageData);
        toast.success('Subscription updated successfully!');
      } else {
        await subscriptionService.createPackage(packageData);
        toast.success('Subscription created successfully!');
      }

      reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Failed to save subscription');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingSubscription ? 'Edit Subscription Plan' : 'Create New Plan'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Plan Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Premium Plan"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Brief description of the plan"
              rows={2}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="price">Price (BDT)</Label>
            <Input
              id="price"
              type="number"
              {...register('price', { valueAsNumber: true })}
              placeholder="e.g., 599"
            />
            {errors.price && (
              <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="duration_days">Duration (Days)</Label>
            <Input
              id="duration_days"
              type="number"
              {...register('duration_days', { valueAsNumber: true })}
              placeholder="e.g., 30 for 1 month"
            />
            {errors.duration_days && (
              <p className="text-sm text-red-600 mt-1">{errors.duration_days.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="features">Features (JSON array format)</Label>
            <Textarea
              id="features"
              {...register('features')}
              placeholder='["HD Quality", "5 Devices", "Full Content Library"]'
              rows={3}
            />
            {errors.features && (
              <p className="text-sm text-red-600 mt-1">{errors.features.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : editingSubscription ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;
