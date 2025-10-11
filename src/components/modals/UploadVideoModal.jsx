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
import { dramaService } from '@/services/dramaService';

const videoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  video_url: z.string().min(1, 'Video URL is required'),
  episode_number: z.number().min(1, 'Episode number is required'),
  duration: z.number().min(1, 'Duration is required (in seconds)'),
});

const UploadVideoModal = ({ open, onOpenChange, seriesId, editingVideo = null, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(videoSchema),
    defaultValues: editingVideo || {
      title: '',
      video_url: '',
      episode_number: 1,
      duration: 0,
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const videoData = {
        ...data,
        series_id: seriesId,
      };

      if (editingVideo) {
        await dramaService.updateVideo(editingVideo.id, videoData);
        toast.success('Video updated successfully!');
      } else {
        await dramaService.uploadVideo(videoData);
        toast.success('Video uploaded successfully!');
      }

      reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Failed to upload video');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingVideo ? 'Edit Video' : 'Upload New Video'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Video Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Episode 1: The Beginning"
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="video_url">Video URL</Label>
            <Input
              id="video_url"
              {...register('video_url')}
              placeholder="https://example.com/video.mp4"
            />
            {errors.video_url && (
              <p className="text-sm text-red-600 mt-1">{errors.video_url.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="episode_number">Episode Number</Label>
              <Input
                id="episode_number"
                type="number"
                {...register('episode_number', { valueAsNumber: true })}
                placeholder="1"
              />
              {errors.episode_number && (
                <p className="text-sm text-red-600 mt-1">{errors.episode_number.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                {...register('duration', { valueAsNumber: true })}
                placeholder="e.g., 3600 for 1 hour"
              />
              {errors.duration && (
                <p className="text-sm text-red-600 mt-1">{errors.duration.message}</p>
              )}
            </div>
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
              {loading ? 'Uploading...' : editingVideo ? 'Update' : 'Upload'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadVideoModal;
