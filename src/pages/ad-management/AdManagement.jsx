import { useState } from 'react';
import { Plus, Trash2, Edit2, Play, Eye, Film, ExternalLink, X } from 'lucide-react';
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

const AdDetailsModal = ({ ad, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFFFF3B] rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-accent">Ad Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-bold text-accent mb-2">{ad.title}</h4>
            </div>

            <div>
              <h5 className="font-semibold text-accent mb-1">Link URL</h5>
              <a 
                href={ad.link_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline break-all flex items-center gap-2"
              >
                {ad.link_url}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {ad.description && (
              <div>
                <h5 className="font-semibold text-accent mb-1">Description</h5>
                <p className="text-white/70">{ad.description}</p>
              </div>
            )}

            <div>
              <h5 className="font-semibold text-accent mb-1">Upload Date</h5>
              <p className="text-white/70">
                {ad.created_at || ad.createdAt 
                  ? new Date(ad.created_at || ad.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  : 'N/A'
                }
              </p>
            </div>
          </div>
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
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
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

  const ads = adsData?.data || [];

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

  const handleViewDetails = (ad) => {
    setSelectedAd(ad);
    setDetailsModalOpen(true);
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
            {ads.map((ad) => (
              <div key={ad._id || ad.id} className="overflow-hidden hover:shadow-lg bg-secondary transition-shadow flex flex-col rounded-2xl border border-white/20">
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  {ad.thumbnail_url || ad.thumbnailUrl ? (
                    <img 
                      src={ad.thumbnail_url || ad.thumbnailUrl} 
                      alt={ad.title} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <Film className="h-20 w-20 text-white/30" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                </div>
                
                <div className="p-4 flex-1">
                  <h3 className="font-semibold text-accent text-lg mb-2 line-clamp-2">{ad.title}</h3>
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
                  
                  <div className="text-sm text-accent">
                    <span>
                      {ad.created_at || ad.createdAt 
                        ? new Date(ad.created_at || ad.createdAt).toLocaleDateString()
                        : ''
                      }
                    </span>
                  </div>
                </div>

                <div className="flex justify-between gap-10 p-4">
                  <Button
                    size="sm"
                    className="flex-1 py-5"
                    onClick={() => handleViewDetails(ad)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <div className="flex gap-5">
                    <Button
                      size="sm"
                      className="flex-1 py-5"
                      onClick={() => handleEditAd(ad)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 py-5"
                      onClick={() => {
                        setItemToDelete({ id: ad._id || ad.id, name: ad.title });
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

        {/* Ad Details Modal */}
        {detailsModalOpen && selectedAd && (
          <AdDetailsModal
            ad={selectedAd}
            onClose={() => setDetailsModalOpen(false)}
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
