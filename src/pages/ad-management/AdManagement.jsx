import { useState } from 'react';
import { Plus, Trash2, Edit2, Play, Film, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReusableVideoUploadModal from '@/components/videoUpload/ReusableVideoUploadModal';
import {
  useCreateAdMutation,
  useVideoUrlGenerateAdMutation,
  useUpdateAdMutation,
  useDeleteAdMutation,
  useGetAllAdQuery,
} from '@/redux/feature/adApi';

// Field configuration for Ad upload
const AD_FIELDS = [
  {
    name: "title",
    label: "Ad Title",
    type: "text",
    placeholder: "Enter ad title",
    required: true,
    gridCols: 2,
  },
  {
    name: "link_url",
    label: "Link URL",
    type: "url",
    placeholder: "https://example.com/your-link",
    required: true,
    gridCols: 2,
    icon: ExternalLink,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter ad description (optional)",
    required: false,
    gridCols: 2,
    rows: 3,
  },
];

const VideoPlayerModal = ({ ad, onClose }) => {
  const videoUrl = ad?.videoUrl || ad?.video_url;
  const downloadUrls = ad?.downloadUrls || ad?.download_urls || {};
  const videoSource = downloadUrls?.hd || downloadUrls?.sd || downloadUrls?.mobile || downloadUrls?.original || videoUrl;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#FFFFFF3B] rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-accent">{ad?.title || ad?.name || 'Video Player'}</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {videoUrl && videoUrl.includes('iframe.mediadelivery.net') ? (
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={videoUrl}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                allowFullScreen
              />
            </div>
          ) : videoSource ? (
            <video
              controls
              className="w-full rounded-lg"
              style={{ maxHeight: '70vh' }}
            >
              <source src={videoSource} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="bg-slate-800 rounded-lg p-16 text-center">
              <Film className="h-20 w-20 mx-auto text-white/30 mb-4" />
              <p className="text-white/70">Video not available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DeleteDialog = ({ item, onClose, onConfirm, isLoading }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-2xl font-bold mb-3 text-slate-900">Are you sure?</h3>
        <p className="text-slate-600 mb-6">
          This will permanently delete "<span className="font-semibold text-slate-900">{item?.name}</span>". This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="px-6 py-2.5 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isLoading}
            className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 hover:shadow-lg hover:scale-105 font-medium transition-all disabled:opacity-50"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdManagement = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [selectedAd, setSelectedAd] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // RTK Query hooks
  const { data: adsData, isLoading: isLoadingAds, refetch } = useGetAllAdQuery();
  const [createAd] = useCreateAdMutation();
  const [generateUploadUrl] = useVideoUrlGenerateAdMutation();
  const [updateAd] = useUpdateAdMutation();
  const [deleteAd, { isLoading: isDeleting }] = useDeleteAdMutation();

  const ads = Array.isArray(adsData?.data?.result) ? adsData.data.result : [];

  const handleUploadAd = () => {
    setEditingAd(null);
    setUploadModalOpen(true);
  };

  const handleEditAd = (ad) => {
    setEditingAd(ad);
    setUploadModalOpen(true);
  };

  const handleSaveAd = () => {
    refetch();
    setUploadModalOpen(false);
  };

  const handleDeleteAd = async () => {
    try {
      await deleteAd(itemToDelete.id).unwrap();
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handlePlayVideo = (ad) => {
    setSelectedAd(ad);
    setVideoPlayerOpen(true);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-accent mb-2">Ad Management</h1>
            <p className="text-white/70">Manage all your advertisements in one place</p>
          </div>
          <Button
            onClick={handleUploadAd}
            className="flex items-center gap-2 px-6 py-6 rounded-sm transition-all font-semibold"
          >
            <Plus className="h-5 w-5" />
            Upload Ad
          </Button>
        </div>

        {isLoadingAds ? (
          <div className="bg-secondary rounded-3xl shadow-xl p-16 text-center border border-white/20">
            <div className="animate-spin h-12 w-12 mx-auto border-4 border-primary border-t-transparent rounded-full mb-4" />
            <p className="text-white/70 text-lg font-medium">Loading ads...</p>
          </div>
        ) : ads.length === 0 ? (
          <div className="bg-secondary rounded-3xl shadow-xl p-16 text-center border border-white/20">
            <Film className="h-20 w-20 mx-auto text-accent mb-4" />
            <p className="text-white/70 text-lg font-medium">No ads found. Upload your first ad to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ads.map((ad) => {
              const videoUrl = ad?.videoUrl || ad?.video_url;
              const downloadUrls = ad?.downloadUrls || ad?.download_urls || {};
              const videoSource = downloadUrls?.hd || downloadUrls?.sd || downloadUrls?.mobile || downloadUrls?.original || videoUrl;

              return (
                <div key={ad._id || ad.id} className="overflow-hidden hover:shadow-lg bg-secondary transition-shadow flex flex-col rounded-2xl border border-white/20">
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    {videoUrl && videoUrl.includes('iframe.mediadelivery.net') ? (
                      <div className="relative w-full h-full">
                        <iframe
                          src={videoUrl}
                          className="w-full h-full pointer-events-none"
                          allow="accelerometer; gyroscope; encrypted-media; picture-in-picture;"
                          allowFullScreen
                        />
                        <div 
                          className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-all"
                          onClick={() => handlePlayVideo(ad)}
                        >
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-all hover:scale-110">
                            <Play className="h-12 w-12 text-white" fill="white" />
                          </div>
                        </div>
                      </div>
                    ) : videoSource ? (
                      <>
                        <video
                          className="w-full h-full object-cover pointer-events-none"
                          muted
                          playsInline
                        >
                          <source src={videoSource} type="video/mp4" />
                        </video>
                        <div 
                          className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-all"
                          onClick={() => handlePlayVideo(ad)}
                        >
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-all hover:scale-110">
                            <Play className="h-12 w-12 text-white" fill="white" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div 
                        className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-all"
                        onClick={() => handlePlayVideo(ad)}
                      >
                        <Film className="h-20 w-20 text-white/30 mb-4" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-all hover:scale-110">
                            <Play className="h-12 w-12 text-white" fill="white" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 flex-1">
                    <h3 className="font-semibold text-accent text-lg mb-2 line-clamp-2">{ad.title || ad.name}</h3>
                    {ad.link_url && (
                      <div className="flex items-center gap-2 text-sm text-accent mb-3">
                        <ExternalLink className="h-4 w-4" />
                        <a 
                          href={ad.link_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {ad.link_url}
                        </a>
                      </div>
                    )}
                    
                    <div className="text-sm text-accent">
                      <span>
                        {ad.created_at || ad.createdAt 
                          ? new Date(ad.created_at || ad.createdAt).toLocaleDateString()
                          : ''
                        }
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 p-4">
                    <Button
                      size="sm"
                      className="py-5"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAd(ad);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="py-5"
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToDelete({ id: ad._id || ad.id, name: ad.title || ad.name });
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Reusable Video Upload Modal */}
        <ReusableVideoUploadModal
          open={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onSave={handleSaveAd}
          editingData={editingAd}
          title="Upload Ad"
          fields={AD_FIELDS}
          generateUploadUrl={generateUploadUrl}
          createMutation={createAd}
          updateMutation={updateAd}
          showThumbnail={false}
          showVideo={true}
        />

        {/* Video Player Modal */}
        {videoPlayerOpen && selectedAd && (
          <VideoPlayerModal
            ad={selectedAd}
            onClose={() => {
              setVideoPlayerOpen(false);
              setSelectedAd(null);
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {deleteDialogOpen && (
          <DeleteDialog
            item={itemToDelete}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={handleDeleteAd}
            isLoading={isDeleting}
          />
        )}
      </div>
    </div>
  );
};

export default AdManagement;
