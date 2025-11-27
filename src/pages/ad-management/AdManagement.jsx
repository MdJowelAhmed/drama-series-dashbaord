import { useState } from 'react';
import { Plus, Trash2, Edit2, Play, Eye, Film, Upload, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const INITIAL_ADS = [
  {
    id: 1,
    title: "Summer Sale 2024",
    video_url: "https://player.cloudinary.com/embed/?cloud_name=dztlololv&public_id=tnltcigkupvd7ehcwfuu&profile=cld-default",
    link_url: "https://example.com/summer-sale",
    created_at: "2024-01-10"
  },
  {
    id: 2,
    title: "New Product Launch",
    video_url: "https://example.com/ad2.mp4",
    link_url: "https://example.com/new-product",
    created_at: "2024-01-15"
  },
  {
    id: 3,
    title: "Brand Campaign",
    video_url: "https://example.com/ad3.mp4",
    link_url: "https://example.com/brand-campaign",
    created_at: "2024-02-01"
  }
];

const AdUploadModal = ({ ad, onClose, onSave }) => {
  const [title, setTitle] = useState(ad?.title || "");
  const [linkUrl, setLinkUrl] = useState(ad?.link_url || "");
  const [videoFile, setVideoFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setVideoFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
    }
  };

  const handleSave = () => {
    if (!title.trim() || !linkUrl.trim()) return;

    const adData = {
      title,
      link_url: linkUrl,
      video_url: videoFile ? `https://example.com/${videoFile.name}` : ad?.video_url || "https://example.com/video.mp4"
    };

    onSave(adData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFFFF3B] rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-accent">
            {ad ? "Edit Ad" : "Upload Ad"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-accent mb-2">Ad Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-md focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-transparent text-white"
              placeholder="Enter ad title"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-accent mb-2">Link URL *</label>
            <div className="relative">
              <ExternalLink className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-accent" />
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-md focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-transparent text-white"
                placeholder="https://example.com/your-link"
              />
            </div>
          </div>

          {!ad && (
            <div>
              <label className="block text-sm font-semibold text-accent mb-2">Video File</label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-md p-8 text-center transition-all ${
                  dragActive ? "border-blue-500 bg-blue-50 scale-105" : "border-slate-300 hover:border-slate-400"
                }`}
              >
                <Upload className="h-12 w-12 mx-auto text-accent mb-3" />
                <p className="text-sm text-accent mb-3 font-medium">
                  {videoFile ? videoFile.name : "Drag and drop video file here, or click to browse"}
                </p>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="video/*"
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="inline-block px-6 py-2.5 bg-primary text-white rounded-md cursor-pointer hover:shadow-lg hover:scale-105 font-medium transition-all"
                >
                  Choose Video
                </label>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <Button
              onClick={onClose}
              className="px-6 py-6 border-2 bg-transparent text-white hover:bg-slate-50 hover:text-black transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim() || !linkUrl.trim()}
              className="px-6 py-6"
            >
              {ad ? "Update" : "Upload"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

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

            <div>
              <h5 className="font-semibold text-accent mb-1">Upload Date</h5>
              <p className="text-white/70">{new Date(ad.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteDialog = ({ item, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-2xl font-bold mb-3 text-slate-900">Are you sure?</h3>
        <p className="text-slate-600 mb-6">
          This will permanently delete "<span className="font-semibold text-slate-900">{item?.name}</span>". This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-6 py-2.5 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 hover:shadow-lg hover:scale-105 font-medium transition-all">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const AdManagement = () => {
  const [ads, setAds] = useState(INITIAL_ADS);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [selectedAd, setSelectedAd] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleUploadAd = () => {
    setEditingAd(null);
    setUploadModalOpen(true);
  };

  const handleEditAd = (ad) => {
    setEditingAd(ad);
    setUploadModalOpen(true);
  };

  const handleSaveAd = (adData) => {
    if (editingAd) {
      setAds(prev => prev.map(a => 
        a.id === editingAd.id ? { ...a, ...adData } : a
      ));
    } else {
      const newAd = {
        id: Date.now(),
        ...adData,
        created_at: new Date().toISOString()
      };
      setAds(prev => [...prev, newAd]);
    }
    setUploadModalOpen(false);
  };

  const handleDeleteAd = () => {
    setAds(prev => prev.filter(a => a.id !== itemToDelete.id));
    setDeleteDialogOpen(false);
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

        {ads.length === 0 ? (
          <div className="bg-secondary rounded-3xl shadow-xl p-16 text-center border border-white/20">
            <Film className="h-20 w-20 mx-auto text-accent mb-4" />
            <p className="text-white/70 text-lg font-medium">No ads found. Upload your first ad to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ads.map((ad) => (
              <div key={ad.id} className="overflow-hidden hover:shadow-lg bg-secondary transition-shadow flex flex-col rounded-2xl border border-white/20">
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Film className="h-20 w-20 text-white/30" />
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
                    <span>{new Date(ad.created_at).toLocaleDateString()}</span>
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
                        setItemToDelete({ id: ad.id, name: ad.title });
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

        {uploadModalOpen && (
          <AdUploadModal
            ad={editingAd}
            onClose={() => setUploadModalOpen(false)}
            onSave={handleSaveAd}
          />
        )}

        {detailsModalOpen && selectedAd && (
          <AdDetailsModal
            ad={selectedAd}
            onClose={() => setDetailsModalOpen(false)}
          />
        )}

        {deleteDialogOpen && (
          <DeleteDialog
            item={itemToDelete}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={handleDeleteAd}
          />
        )}
      </div>
    </div>
  );
};

export default AdManagement;