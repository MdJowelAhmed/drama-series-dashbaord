import { useState } from 'react';
import { Plus, Trash2, Edit2, Play, Clock, Eye, Film, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import TrailerUploadModal from '@/components/modals/TrailerUploadModal';
import VideoDetailsModal from '@/components/videoUpload/VideoDetailsModal';
import DeleteConfirmationModal from '@/components/share/DeleteConfirmationModal';
import {
  useVideoUrlGenerateMutation,
  useDeleteTrailerMutation,
  useGetAllTrailerQuery,
} from '@/redux/feature/trailerApi';
import { getVideoAndThumbnail } from '@/components/share/imageUrl';

const TrailerManagement = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTrailer, setEditingTrailer] = useState(null);
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // RTK Query hooks
  const { data: trailersData, isLoading: isLoadingTrailers, refetch } = useGetAllTrailerQuery();
  const [generateUploadUrl] = useVideoUrlGenerateMutation();
  const [deleteTrailer, { isLoading: isDeleting }] = useDeleteTrailerMutation();

  const trailers = trailersData?.data?.result || [];
  console.log(trailers);

  const handleUploadTrailer = () => {
    setEditingTrailer(null);
    setUploadModalOpen(true);
  };

  const handleEditTrailer = (trailer) => {
    setEditingTrailer(trailer);
    setUploadModalOpen(true);
  };

  const handleSaveTrailer = () => {
    refetch();
    setUploadModalOpen(false);
  };

  const handleDeleteTrailer = async () => {
    try {
      await deleteTrailer(itemToDelete.id).unwrap();
      toast.success("Trailer deleted successfully");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete trailer");
    }
  };

  const handleViewDetails = (trailer) => {
    setSelectedTrailer(trailer);
    setDetailsModalOpen(true);
  };

  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    if (typeof duration === 'string' && duration.includes(':')) return duration;
    const totalSeconds = parseInt(duration);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-accent mb-2">Trailer Management</h1>
            <p className="text-white/70">Manage all your drama trailers in one place</p>
          </div>
          <Button
            onClick={handleUploadTrailer}
            className="flex items-center gap-2 px-6 py-6 rounded-sm transition-all font-semibold"
          >
            <Plus className="h-5 w-5" />
            Upload Trailer
          </Button>
        </div>

        {isLoadingTrailers ? (
          <div className="bg-secondary rounded-3xl shadow-xl p-16 text-center border border-white/20">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-primary border-t-transparent rounded-full mb-4" />
            <p className="text-white/70 text-lg font-medium">Loading trailers...</p>
          </div>
        ) : trailers.length === 0 ? (
          <div className="bg-secondary rounded-3xl shadow-xl p-16 text-center border border-white/20">
            <Film className="h-20 w-20 mx-auto text-accent mb-4" />
            <p className="text-white/70 text-lg font-medium">No trailers found. Upload your first trailer to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trailers?.map((trailer) => (
              <div key={trailer._id || trailer.id} className="overflow-hidden hover:shadow-lg bg-secondary transition-shadow flex flex-col rounded-2xl border border-white/20">
                <div className="relative h-60 overflow-hidden">
                  <img 
                    src={getVideoAndThumbnail(trailer.thumbnail_url || trailer.thumbnailUrl) || "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400"} 
                    alt={trailer.title} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute top-3 right-3 bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(trailer.duration)}
                  </div>
                  {trailer.color && (
                    <div className="absolute top-3 left-3 w-6 h-6 rounded-full shadow-lg" style={{ backgroundColor: trailer.color }} />
                  )}
                </div>
                
                <div className="p-4 flex-1">
                  {trailer.type && (
                    <span className="inline-block bg-primary text-white px-3 py-1 rounded-md text-xs font-bold mb-2">
                      {trailer.type}
                    </span>
                  )}
                  <h3 className="font-semibold text-accent text-lg mb-2 line-clamp-2">{trailer.title}</h3>
                  <p className="text-sm text-accent mb-3 line-clamp-2">{trailer.description || trailer.content || "No description"}</p>
                  
                  <div className="flex items-center justify-between text-sm text-accent">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {trailer.views || "0"}
                    </span>
                    <span>{trailer.created_at || trailer.createdAt ? new Date(trailer.created_at || trailer.createdAt).toLocaleDateString() : ''}</span>
                  </div>
                </div>

                <div className="flex justify-between gap-10 p-4">
                  <Button
                    size="sm"
                    className="flex-1 py-5"
                    onClick={() => handleViewDetails(trailer)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <div className="flex gap-5">
                    <Button
                      size="sm"
                      className="flex-1 py-5"
                      onClick={() => handleEditTrailer(trailer)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 py-5"
                      onClick={() => {
                        setItemToDelete({ id: trailer._id || trailer.id, name: trailer.title });
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trailer Upload Modal */}
        <TrailerUploadModal
          open={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onSave={handleSaveTrailer}
          editingData={editingTrailer}
          generateUploadUrl={generateUploadUrl}
        />

        {/* Video Details Modal */}
        {detailsModalOpen && selectedTrailer && (
          <VideoDetailsModal
            video={selectedTrailer}
            onClose={() => setDetailsModalOpen(false)}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationModal
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteTrailer}
          isLoading={isDeleting}
          itemName={itemToDelete?.name}
          title="Delete Trailer"
          description={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        />
      </div>
    </div>
  );
};

export default TrailerManagement;
