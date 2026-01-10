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
import { movieService } from '@/services/movieService';

const movieSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  thumbnail_url: z.string().optional(),
  video_url: z.string().min(1, 'Video URL is required'),
  genre: z.string().optional(),
  duration: z.number().min(1, 'Duration is required (in seconds)'),
});

const CreateMovieModal = ({ open, onOpenChange, editingMovie = null, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(movieSchema),
    defaultValues: editingMovie || {
      title: '',
      description: '',
      thumbnail_url: '',
      video_url: '',
      genre: '',
      duration: 0,
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      if (editingMovie) {
        await movieService.updateMovie(editingMovie.id, data);
        toast.success('Movie updated successfully!');
      } else {
        await movieService.createMovie(data);
        toast.success('Movie created successfully!');
      }

      reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Failed to save movie');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingMovie ? 'Edit Movie' : 'Create New Movie'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter movie title"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter movie description"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="genre">Genre</Label>
            <Input
              id="genre"
              {...register('genre')}
              placeholder="e.g., Action, Comedy, Horror"
            />
            {errors.genre && (
              <p className="text-sm text-red-600 mt-1">{errors.genre.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="video_url">Video URL</Label>
            <Input
              id="video_url"
              {...register('video_url')}
              placeholder="https://example.com/movie.mp4"
            />
            {errors.video_url && (
              <p className="text-sm text-red-600 mt-1">{errors.video_url.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
            <Input
              id="thumbnail_url"
              {...register('thumbnail_url')}
              placeholder="https://example.com/image.jpg"
            />
            {errors.thumbnail_url && (
              <p className="text-sm text-red-600 mt-1">{errors.thumbnail_url.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="duration">Duration (seconds)</Label>
            <Input
              id="duration"
              type="number"
              {...register('duration', { valueAsNumber: true })}
              placeholder="e.g., 7200 for 2 hours"
            />
            {errors.duration && (
              <p className="text-sm text-red-600 mt-1">{errors.duration.message}</p>
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
              {loading ? 'Saving...' : editingMovie ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMovieModal;
