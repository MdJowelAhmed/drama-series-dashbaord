import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Video, Edit2, Upload, X } from 'lucide-react';

const DUMMY_DRAMA = {
  id: 1,
  title: "The Last Kingdom",
  description: "An epic tale of warriors, kingdoms, and destiny. Follow the journey of heroes as they battle for honor and glory.",
  thumbnail_url: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800",
  status: "Ongoing",
  genre: "Action",
  release_date: "2024-01-15"
};

const INITIAL_SERIES = [
  {
    id: 1,
    drama_id: 1,
    series_number: 1,
    title: "The Beginning",
    videos: [
      {
        id: 1,
        series_id: 1,
        episode_number: 1,
        title: "Pilot",
        duration: 2400,
        video_url: "https://example.com/video1.mp4",
        thumbnail_url: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400",
        created_at: "2024-01-20"
      },
      {
        id: 2,
        series_id: 1,
        episode_number: 2,
        title: "The Call",
        duration: 2700,
        video_url: "https://example.com/video2.mp4",
        thumbnail_url: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400",
        created_at: "2024-01-27"
      }
    ]
  },
  {
    id: 2,
    drama_id: 1,
    series_number: 2,
    title: "Rising Storm",
    videos: []
  }
];

const SeriesModal = ({ series, onClose, onSave }) => {
  const [title, setTitle] = useState(series?.title || '');

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">
            {series ? 'Edit Series' : 'Create New Series'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Series Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter series title"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {series ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoUploadModal = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [dragActive, setDragActive] = useState({ video: false, thumbnail: false });

  const handleDrag = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [type]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (type === 'video') {
        setVideoFile(file);
      } else {
        setThumbnailFile(file);
      }
    }
  };

  const handleFileChange = (e, type) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'video') {
        setVideoFile(file);
      } else {
        setThumbnailFile(file);
      }
    }
  };

  const handleSave = () => {
    if (!title.trim() || !duration) return;
    
    onSave({
      title,
      duration: parseInt(duration) * 60,
      video_url: videoFile ? `https://example.com/${videoFile.name}` : 'https://example.com/video.mp4',
      thumbnail_url: thumbnailFile ? URL.createObjectURL(thumbnailFile) : 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Upload Video</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Episode Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter episode title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter duration"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Video File
            </label>
            <div
              onDragEnter={(e) => handleDrag(e, 'video')}
              onDragLeave={(e) => handleDrag(e, 'video')}
              onDragOver={(e) => handleDrag(e, 'video')}
              onDrop={(e) => handleDrop(e, 'video')}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive.video ? 'border-blue-500 bg-blue-50' : 'border-slate-300'
              }`}
            >
              <Upload className="h-10 w-10 mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-600 mb-2">
                {videoFile ? videoFile.name : 'Drag and drop video file here, or click to browse'}
              </p>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'video')}
                accept="video/*"
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
              >
                Choose Video
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Thumbnail Image
            </label>
            <div
              onDragEnter={(e) => handleDrag(e, 'thumbnail')}
              onDragLeave={(e) => handleDrag(e, 'thumbnail')}
              onDragOver={(e) => handleDrag(e, 'thumbnail')}
              onDrop={(e) => handleDrop(e, 'thumbnail')}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive.thumbnail ? 'border-blue-500 bg-blue-50' : 'border-slate-300'
              }`}
            >
              {thumbnailFile ? (
                <div className="space-y-2">
                  <img
                    src={URL.createObjectURL(thumbnailFile)}
                    alt="Thumbnail preview"
                    className="h-32 mx-auto rounded-lg object-cover"
                  />
                  <p className="text-sm text-slate-600">{thumbnailFile.name}</p>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 mb-2">
                    Drag and drop thumbnail here, or click to browse
                  </p>
                </>
              )}
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'thumbnail')}
                accept="image/*"
                className="hidden"
                id="thumbnail-upload"
              />
              <label
                htmlFor="thumbnail-upload"
                className="inline-block px-4 py-2 bg-slate-600 text-white rounded-lg cursor-pointer hover:bg-slate-700 mt-2"
              >
                Choose Thumbnail
              </label>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteDialog = ({ item, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-2">Are you sure?</h3>
        <p className="text-slate-600 mb-6">
          This will permanently delete "{item?.name}". This action cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const DramaDetails = () => {
  const [drama] = useState(DUMMY_DRAMA);
  const [series, setSeries] = useState(INITIAL_SERIES);
  const [seriesModalOpen, setSeriesModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleCreateSeries = () => {
    setEditingSeries(null);
    setSeriesModalOpen(true);
  };

  const handleEditSeries = (s) => {
    setEditingSeries(s);
    setSeriesModalOpen(true);
  };

  const handleSaveSeries = (seriesData) => {
    if (editingSeries) {
      setSeries(prev => prev.map(s => 
        s.id === editingSeries.id 
          ? { ...s, ...seriesData }
          : s
      ));
    } else {
      const newSeries = {
        id: Date.now(),
        drama_id: drama.id,
        series_number: series.length + 1,
        ...seriesData,
        videos: []
      };
      setSeries(prev => [...prev, newSeries]);
    }
    setSeriesModalOpen(false);
  };

  const handleDeleteSeries = (seriesId) => {
    setSeries(prev => prev.filter(s => s.id !== seriesId));
    setDeleteDialogOpen(false);
  };

  const handleUploadVideo = (seriesId) => {
    setSelectedSeriesId(seriesId);
    setVideoModalOpen(true);
  };

  const handleSaveVideo = (videoData) => {
    setSeries(prev => prev.map(s => {
      if (s.id === selectedSeriesId) {
        const newVideo = {
          id: Date.now(),
          series_id: selectedSeriesId,
          episode_number: (s.videos?.length || 0) + 1,
          ...videoData,
          created_at: new Date().toISOString()
        };
        return {
          ...s,
          videos: [...(s.videos || []), newVideo]
        };
      }
      return s;
    }));
    setVideoModalOpen(false);
  };

  const handleDeleteVideo = (videoId) => {
    setSeries(prev => prev.map(s => ({
      ...s,
      videos: s.videos?.filter(v => v.id !== videoId) || []
    })));
    setDeleteDialogOpen(false);
  };

  const handleDelete = () => {
    if (itemToDelete.type === 'series') {
      handleDeleteSeries(itemToDelete.id);
    } else {
      handleDeleteVideo(itemToDelete.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Back to Dramas
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex gap-6">
            <img
              src={drama.thumbnail_url}
              alt={drama.title}
              className="w-64 h-96 object-cover rounded-lg"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-900">{drama.title}</h1>
                <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                  {drama.status}
                </span>
              </div>
              <p className="text-slate-600 mt-4">{drama.description}</p>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Total Series</p>
                  <p className="text-2xl font-bold">{series.length}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Genre</p>
                  <p className="text-xl font-bold">{drama.genre}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">Release Date</p>
                  <p className="text-sm font-bold">
                    {new Date(drama.release_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Series & Videos</h2>
          <button
            onClick={handleCreateSeries}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Series
          </button>
        </div>

        {series.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-slate-600">No series found. Add a new series to get started!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {series.map((s) => (
              <div key={s.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">
                      Series {s.series_number}: {s.title}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditSeries(s)}
                        className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-slate-50"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleUploadVideo(s.id)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
                      >
                        <Video className="h-4 w-4" />
                        Upload Video
                      </button>
                      <button
                        onClick={() => {
                          setItemToDelete({ type: 'series', id: s.id, name: s.title });
                          setDeleteDialogOpen(true);
                        }}
                        className="p-2 border border-red-200 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {!s.videos || s.videos.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No videos uploaded yet</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {s.videos.map((video) => (
                        <div key={video.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-1">
                                Episode {video.episode_number}: {video.title}
                              </h4>
                              <p className="text-xs text-slate-600 mb-2">
                                Duration: {Math.floor(video.duration / 60)}m {video.duration % 60}s
                              </p>
                              <p className="text-xs text-slate-500">
                                {new Date(video.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setItemToDelete({ type: 'video', id: video.id, name: video.title });
                                setDeleteDialogOpen(true);
                              }}
                              className="p-1 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {seriesModalOpen && (
          <SeriesModal
            series={editingSeries}
            onClose={() => setSeriesModalOpen(false)}
            onSave={handleSaveSeries}
          />
        )}

        {videoModalOpen && (
          <VideoUploadModal
            onClose={() => setVideoModalOpen(false)}
            onSave={handleSaveVideo}
          />
        )}

        {deleteDialogOpen && (
          <DeleteDialog
            item={itemToDelete}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default DramaDetails;