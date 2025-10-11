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
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { dramaService } from '@/services/dramaService';

const seriesSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  series_number: z.number().min(1, 'Series number is required'),
  description: z.string().optional(),
});

const CreateSeriesModal = ({ open, onOpenChange, dramaId, editingSeries = null, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(seriesSchema),
    defaultValues: editingSeries || {
      title: '',
      series_number: 1,
      description: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const seriesData = {
        ...data,
        drama_id: dramaId,
      };

      if (editingSeries) {
        await dramaService.updateSeries(editingSeries.id, seriesData);
        toast.success('Series updated successfully!');
      } else {
        await dramaService.createSeries(seriesData);
        toast.success('Series created successfully!');
      }

      reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Failed to save series');
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
            {editingSeries ? 'Edit Series' : 'Create New Series'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Series Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Season 1"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="series_number">Series Number</Label>
            <Input
              id="series_number"
              type="number"
              {...register('series_number', { valueAsNumber: true })}
              placeholder="1"
            />
            {errors.series_number && (
              <p className="text-sm text-red-600 mt-1">{errors.series_number.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter series description"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
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
              {loading ? 'Saving...' : editingSeries ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSeriesModal;
