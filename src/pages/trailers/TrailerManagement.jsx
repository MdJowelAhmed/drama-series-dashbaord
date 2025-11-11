import { useState } from 'react';
import { Plus, Trash2, Video, Edit2, Play, Clock, Eye, Film, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const INITIAL_TRAILERS = [
  {
    id: 1,
    title: "The Last Kingdom - Official Trailer",
    duration: 180,
    video_url: "https://www.freepik.com/free-video/aerial-wide-green-plantation-field-sunny-day_3384827#fromView=subhome",
    thumbnail_url: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400",
    created_at: "2024-01-10",
    views: "1.2M",
    type: "Official Trailer",
    color: "#3b82f6",
    contentName: "Season 1 Announcement",
    content: "Experience the epic journey of warriors and kingdoms in this thrilling first look at The Last Kingdom."
  },
  {
    id: 2,
    title: "The Last Kingdom - Teaser",
    duration: 60,
    video_url: "https://example.com/trailer2.mp4",
    thumbnail_url: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400",
    created_at: "2024-01-05",
    views: "890K",
    type: "Teaser",
    color: "#10b981",
    contentName: "Coming Soon",
    content: "A glimpse into the world of heroes, battles, and destiny. Coming soon to your screens."
  },
  {
    id: 3,
    title: "Behind The Scenes",
    duration: 240,
    video_url: "https://example.com/trailer3.mp4",
    thumbnail_url: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400",
    created_at: "2024-02-15",
    views: "650K",
    type: "BTS",
    color: "#8b5cf6",
    contentName: "Making of The Last Kingdom",
    content: "Go behind the scenes and discover how the epic battles and stunning visuals were brought to life."
  },
  {
    id: 4,
    title: "Season 2 - First Look",
    duration: 150,
    video_url: "https://example.com/trailer4.mp4",
    thumbnail_url: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400",
    created_at: "2024-03-01",
    views: "1.5M",
    type: "Season Trailer",
    color: "#ef4444",
    contentName: "Season 2 Preview",
    content: "The war continues. New enemies emerge. The stakes have never been higher. Season 2 coming soon."
  },
  {
    id: 5,
    title: "Character Spotlight - Hero",
    duration: 120,
    video_url: "https://example.com/trailer5.mp4",
    thumbnail_url: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400",
    created_at: "2024-01-25",
    views: "720K",
    type: "Character Spotlight",
    color: "#f59e0b",
    contentName: "Meet the Hero",
    content: "Discover the journey of our main protagonist - a warrior destined for greatness."
  }
];

const VideoUploadModal = ({ video, onClose, onSave }) => {
  const [title, setTitle] = useState(video?.title || "");
  const [duration, setDuration] = useState(video ? Math.floor(video.duration / 60) : "");
  const [type, setType] = useState(video?.type || "");
  const [color, setColor] = useState(video?.color || "#3b82f6");
  const [contentName, setContentName] = useState(video?.contentName || "");
  const [content, setContent] = useState(video?.content || "");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [dragActive, setDragActive] = useState({ video: false, thumbnail: false });

  const handleDrag = (e, fileType) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive((prev) => ({ ...prev, [fileType]: true }));
    } else if (e.type === "dragleave") {
      setDragActive((prev) => ({ ...prev, [fileType]: false }));
    }
  };

  const handleDrop = (e, fileType) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [fileType]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (fileType === "video") {
        setVideoFile(file);
      } else {
        setThumbnailFile(file);
      }
    }
  };

  const handleFileChange = (e, fileType) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (fileType === "video") {
        setVideoFile(file);
      } else {
        setThumbnailFile(file);
      }
    }
  };

  const handleSave = () => {
    if (!title.trim() || !duration || !type) return;

    const videoData = {
      title,
      duration: parseInt(duration) * 60,
      type,
      color,
      contentName,
      content,
      video_url: videoFile ? `https://example.com/${videoFile.name}` : video?.video_url || "https://example.com/video.mp4",
      thumbnail_url: thumbnailFile ? URL.createObjectURL(thumbnailFile) : video?.thumbnail_url || "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: video?.views || "0",
    };

    onSave(videoData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFFFF3B] rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-accent">
            {video ? "Edit Trailer" : "Upload Trailer"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-accent mb-2">Trailer Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-md focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-transparent text-white"
                placeholder="Enter trailer title"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-accent mb-2">Duration (minutes) *</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-md focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-transparent text-white"
                placeholder="Enter duration"
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-accent mb-2">Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-md focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-transparent text-white"
              >
                <option value="">Select type</option>
                <option value="Official Trailer">Official Trailer</option>
                <option value="Teaser">Teaser</option>
                <option value="BTS">Behind The Scenes</option>
                <option value="Season Trailer">Season Trailer</option>
                <option value="Character Spotlight">Character Spotlight</option>
                <option value="Announcement">Announcement</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-accent mb-2">Color</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-12 w-20 border-2 border-slate-200 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-md focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-transparent text-white"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-accent mb-2">Content Name</label>
            <input
              type="text"
              value={contentName}
              onChange={(e) => setContentName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-md focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-transparent text-white"
              placeholder="Enter content name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-accent mb-2">Description</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-md focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none bg-transparent text-white"
              placeholder="Enter trailer description"
              rows="4"
            />
          </div>

          {!video && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-accent mb-2">Video File</label>
                <div
                  onDragEnter={(e) => handleDrag(e, "video")}
                  onDragLeave={(e) => handleDrag(e, "video")}
                  onDragOver={(e) => handleDrag(e, "video")}
                  onDrop={(e) => handleDrop(e, "video")}
                  className={`border-2 border-dashed rounded-md p-8 text-center transition-all ${
                    dragActive.video ? "border-blue-500 bg-blue-50 scale-105" : "border-slate-300 hover:border-slate-400"
                  }`}
                >
                  <Upload className="h-12 w-12 mx-auto text-accent mb-3" />
                  <p className="text-sm text-accent mb-3 font-medium">
                    {videoFile ? videoFile.name : "Drag and drop video file here, or click to browse"}
                  </p>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, "video")}
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

              <div>
                <label className="block text-sm font-semibold text-accent mb-2">Thumbnail Image</label>
                <div
                  onDragEnter={(e) => handleDrag(e, "thumbnail")}
                  onDragLeave={(e) => handleDrag(e, "thumbnail")}
                  onDragOver={(e) => handleDrag(e, "thumbnail")}
                  onDrop={(e) => handleDrop(e, "thumbnail")}
                  className={`border-2 border-dashed rounded-md p-8 text-center transition-all ${
                    dragActive.thumbnail ? "border-blue-500 bg-blue-50 scale-105" : "border-slate-300 hover:border-slate-400"
                  }`}
                >
                  {thumbnailFile ? (
                    <div className="space-y-3">
                      <img
                        src={URL.createObjectURL(thumbnailFile)}
                        alt="Thumbnail preview"
                        className="h-40 mx-auto rounded-md object-cover shadow-lg"
                      />
                      <p className="text-sm text-accent font-medium">{thumbnailFile.name}</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 mx-auto text-accent mb-3" />
                      <p className="text-sm text-accent mb-3 font-medium">
                        Drag and drop thumbnail here, or click to browse
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, "thumbnail")}
                    accept="image/*"
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    className="inline-block px-6 py-2.5 bg-primary text-white rounded-md cursor-pointer hover:shadow-lg hover:scale-105 font-medium transition-all mt-2"
                  >
                    Choose Thumbnail
                  </label>
                </div>
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
              disabled={!title.trim() || !duration || !type}
              className="px-6 py-6"
            >
              {video ? "Update" : "Upload"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TrailerDetailsModal = ({ trailer, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFFFF3B] rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-accent">Trailer Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          <img src={trailer.thumbnail_url} alt={trailer.title} className="w-full h-64 object-cover rounded-xl shadow-lg" />
          
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-bold text-accent mb-2">{trailer.title}</h4>
              <div className="flex items-center gap-4 flex-wrap text-sm text-accent">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.floor(trailer.duration / 60)}:{(trailer.duration % 60).toString().padStart(2, '0')}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {trailer.views} views
                </span>
                <span className="px-3 py-1 bg-primary text-white rounded-full font-semibold">
                  {trailer.type}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: trailer.color }} />
                  <span className="text-accent">{trailer.color}</span>
                </div>
              </div>
            </div>

            {trailer.contentName && (
              <div>
                <h5 className="font-semibold text-accent mb-1">Content Name</h5>
                <p className="text-white/70">{trailer.contentName}</p>
              </div>
            )}

            <div>
              <h5 className="font-semibold text-accent mb-1">Description</h5>
              <p className="text-white/70 leading-relaxed">{trailer.content}</p>
            </div>

            <div>
              <h5 className="font-semibold text-accent mb-1">Upload Date</h5>
              <p className="text-white/70">{new Date(trailer.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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

const TrailerManagement = () => {
  const [trailers, setTrailers] = useState(INITIAL_TRAILERS);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTrailer, setEditingTrailer] = useState(null);
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleUploadTrailer = () => {
    setEditingTrailer(null);
    setUploadModalOpen(true);
  };

  const handleEditTrailer = (trailer) => {
    setEditingTrailer(trailer);
    setUploadModalOpen(true);
  };

  const handleSaveTrailer = (trailerData) => {
    if (editingTrailer) {
      setTrailers(prev => prev.map(t => 
        t.id === editingTrailer.id ? { ...t, ...trailerData } : t
      ));
    } else {
      const newTrailer = {
        id: Date.now(),
        ...trailerData,
        created_at: new Date().toISOString()
      };
      setTrailers(prev => [...prev, newTrailer]);
    }
    setUploadModalOpen(false);
  };

  const handleDeleteTrailer = () => {
    setTrailers(prev => prev.filter(t => t.id !== itemToDelete.id));
    setDeleteDialogOpen(false);
  };

  const handleViewDetails = (trailer) => {
    setSelectedTrailer(trailer);
    setDetailsModalOpen(true);
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
            className="flex items-center gap-2 px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all font-semibold"
          >
            <Plus className="h-5 w-5" />
            Upload Trailer
          </Button>
        </div>

        <div className="bg-secondary rounded-3xl shadow-xl p-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
              <p className="text-sm text-white/80 font-medium mb-2">Total Trailers</p>
              <p className="text-4xl font-bold text-accent">{trailers.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
              <p className="text-sm text-white/80 font-medium mb-2">Total Views</p>
              <p className="text-4xl font-bold text-accent">
                {trailers.reduce((acc, t) => acc + parseFloat(t.views.replace(/[MK]/g, '')), 0).toFixed(1)}M
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
              <p className="text-sm text-white/80 font-medium mb-2">Latest Upload</p>
              <p className="text-lg font-bold text-accent">
                {trailers.length > 0 ? new Date(Math.max(...trailers.map(t => new Date(t.created_at)))).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {trailers.length === 0 ? (
          <div className="bg-secondary rounded-3xl shadow-xl p-16 text-center border border-white/20">
            <Film className="h-20 w-20 mx-auto text-accent mb-4" />
            <p className="text-white/70 text-lg font-medium">No trailers found. Upload your first trailer to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trailers.map((trailer) => (
              <div key={trailer.id} className="overflow-hidden hover:shadow-lg bg-secondary transition-shadow flex flex-col rounded-2xl border border-white/20">
                <div className="relative h-48 overflow-hidden">
                  <img src={trailer.thumbnail_url} alt={trailer.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute top-3 right-3 bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.floor(trailer.duration / 60)}:{(trailer.duration % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="absolute top-3 left-3 w-6 h-6 rounded-full shadow-lg" style={{ backgroundColor: trailer.color }} />
                </div>
                
                <div className="p-4 flex-1">
                  <span className="inline-block bg-primary text-white px-3 py-1 rounded-md text-xs font-bold mb-2">
                    {trailer.type}
                  </span>
                  <h3 className="font-semibold text-accent text-lg mb-2 line-clamp-2">{trailer.title}</h3>
                  <p className="text-sm text-accent mb-3 line-clamp-2">{trailer.content || "No description"}</p>
                  
                  <div className="flex items-center justify-between text-sm text-accent">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {trailer.views}
                    </span>
                    <span>{new Date(trailer.created_at).toLocaleDateString()}</span>
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
                        setItemToDelete({ id: trailer.id, name: trailer.title });
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
          <VideoUploadModal
            video={editingTrailer}
            onClose={() => setUploadModalOpen(false)}
            onSave={handleSaveTrailer}
          />
        )}

        {detailsModalOpen && selectedTrailer && (
          <TrailerDetailsModal
            trailer={selectedTrailer}
            onClose={() => setDetailsModalOpen(false)}
          />
        )}

        {deleteDialogOpen && (
          <DeleteDialog
            item={itemToDelete}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={handleDeleteTrailer}
          />
        )}
      </div>
    </div>
  );
};

export default TrailerManagement;