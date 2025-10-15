import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Video, Edit2, Upload, X, Play, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DUMMY_DRAMA = {
  id: 1,
  title: "The Last Kingdom",
  description: "An epic tale of warriors, kingdoms, and destiny. Follow the journey of heroes as they battle for honor and glory in a world torn by war and political intrigue.",
  thumbnail_url: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800",
  status: "Ongoing",
  genre: "Action",
  release_date: "2024-01-15",
  rating: 8.5,
  total_views: "2.4M"
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
        created_at: "2024-01-20",
        views: "450K"
      },
      {
        id: 2,
        series_id: 1,
        episode_number: 2,
        title: "The Call",
        duration: 2700,
        video_url: "https://example.com/video2.mp4",
        thumbnail_url: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400",
        created_at: "2024-01-27",
        views: "380K"
      },
      {
        id: 3,
        series_id: 1,
        episode_number: 3,
        title: "First Battle",
        duration: 3000,
        video_url: "https://example.com/video3.mp4",
        thumbnail_url: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400",
        created_at: "2024-02-03",
        views: "420K"
      }
    ]
  },
  {
    id: 2,
    drama_id: 1,
    series_number: 2,
    title: "Rising Storm",
    videos: [
      {
        id: 4,
        series_id: 2,
        episode_number: 1,
        title: "New Allies",
        duration: 2800,
        video_url: "https://example.com/video4.mp4",
        thumbnail_url: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400",
        created_at: "2024-02-10",
        views: "290K"
      }
    ]
  }
];

const SeriesModal = ({ series, onClose, onSave }) => {
  const [title, setTitle] = useState(series?.title || '');

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {series ? 'Edit Series' : 'Create New Series'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Series Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter series title"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 font-medium transition-all"
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
      thumbnail_url: thumbnailFile ? URL.createObjectURL(thumbnailFile) : 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400',
      views: '0'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Upload Video</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Episode Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter episode title"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter duration"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Video File
            </label>
            <div
              onDragEnter={(e) => handleDrag(e, 'video')}
              onDragLeave={(e) => handleDrag(e, 'video')}
              onDragOver={(e) => handleDrag(e, 'video')}
              onDrop={(e) => handleDrop(e, 'video')}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive.video ? 'border-blue-500 bg-blue-50 scale-105' : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <Upload className="h-12 w-12 mx-auto text-slate-400 mb-3" />
              <p className="text-sm text-slate-600 mb-3 font-medium">
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
                className="inline-block px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl cursor-pointer hover:shadow-lg hover:scale-105 font-medium transition-all"
              >
                Choose Video
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Thumbnail Image
            </label>
            <div
              onDragEnter={(e) => handleDrag(e, 'thumbnail')}
              onDragLeave={(e) => handleDrag(e, 'thumbnail')}
              onDragOver={(e) => handleDrag(e, 'thumbnail')}
              onDrop={(e) => handleDrop(e, 'thumbnail')}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive.thumbnail ? 'border-blue-500 bg-blue-50 scale-105' : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              {thumbnailFile ? (
                <div className="space-y-3">
                  <img
                    src={URL.createObjectURL(thumbnailFile)}
                    alt="Thumbnail preview"
                    className="h-40 mx-auto rounded-xl object-cover shadow-lg"
                  />
                  <p className="text-sm text-slate-600 font-medium">{thumbnailFile.name}</p>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto text-slate-400 mb-3" />
                  <p className="text-sm text-slate-600 mb-3 font-medium">
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
                className="inline-block px-6 py-2.5 bg-slate-700 text-white rounded-xl cursor-pointer hover:bg-slate-800 hover:scale-105 font-medium transition-all mt-2"
              >
                Choose Thumbnail
              </label>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 font-medium transition-all"
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-2xl font-bold mb-3 text-slate-900">Are you sure?</h3>
        <p className="text-slate-600 mb-6">
          This will permanently delete "<span className="font-semibold text-slate-900">{item?.name}</span>". This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-slate-200 rounded-xl hover:bg-slate-50 font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 hover:shadow-lg hover:scale-105 font-medium transition-all"
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
    <div className="min-h-screen p-6">
      <div className=" mx-auto space-y-8">
        <Button className="flex items-center gap-2  font-medium hover:gap-3 transition-all group">
          <ArrowLeft className="h-5 w-5 group-hover:scale-110 transition-transform" />
          Back to Dramas
        </Button>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm overflow-hidden border border-white/20">
          <div className="flex flex-col lg:flex-row gap-8 p-8">
            <div className="relative group">
              <img
                src={drama.thumbnail_url}
                alt={drama.title}
                className="w-full lg:w-80 h-[300px] object-cover rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {drama.title}
                  </h1>
                  <span className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm rounded-full font-semibold shadow-lg">
                    {drama.status}
                  </span>
                </div>
                <p className="text-slate-600 text-lg leading-relaxed">{drama.description}</p>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-5 rounded-2xl border border-blue-100/50 hover:shadow-lg transition-all hover:scale-105">
                  <p className="text-sm text-slate-600 font-medium mb-1">Total Series</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{series.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-100/50 hover:shadow-lg transition-all hover:scale-105">
                  <p className="text-sm text-slate-600 font-medium mb-1">Rating</p>
                  <p className="text-3xl font-bold text-green-600">⭐ {drama.rating}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-2xl border border-orange-100/50 hover:shadow-lg transition-all hover:scale-105">
                  <p className="text-sm text-slate-600 font-medium mb-1">Total Views</p>
                  <p className="text-3xl font-bold text-orange-600">{drama.total_views}</p>
                </div>
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-5 rounded-2xl border border-violet-100/50 hover:shadow-lg transition-all hover:scale-105">
                  <p className="text-sm text-slate-600 font-medium mb-1">Genre</p>
                  <p className="text-xl font-bold text-violet-600">{drama.genre}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">Released: {new Date(drama.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Series & Videos</h2>
          <Button
            onClick={handleCreateSeries}
            className="flex items-center gap-2  text-white px-6 py-3 rounded-md hover:shadow-xl hover:scale-105 transition-all font-semibold"
          >
            <Plus className="h-5 w-5" />
            Add Series
          </Button>
        </div>

        {series.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-16 text-center border border-white/20">
            <div className="text-slate-400 mb-4">
              <Video className="h-20 w-20 mx-auto" />
            </div>
            <p className="text-slate-600 text-lg font-medium">No series found. Add a new series to get started!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {series.map((s) => (
              <div key={s.id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden border border-white/20 hover:shadow-2xl transition-all">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <h3 className="text-2xl font-bold text-slate-900">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Series {s.series_number}:</span> {s.title}
                    </h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEditSeries(s)}
                        className="flex items-center gap-2 px-4 py-2 border-2 border-slate-200 rounded-xl hover:bg-white hover:shadow-lg transition-all font-medium"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleUploadVideo(s.id)}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-medium"
                      >
                        <Video className="h-4 w-4" />
                        Upload Video
                      </button>
                      <button
                        onClick={() => {
                          setItemToDelete({ type: 'series', id: s.id, name: s.title });
                          setDeleteDialogOpen(true);
                        }}
                        className="p-2 border-2 border-red-200 rounded-xl hover:bg-red-50 hover:scale-110 transition-all"
                      >
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {!s.videos || s.videos.length === 0 ? (
                    <div className="text-center py-12">
                      <Video className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500 font-medium">No videos uploaded yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {s.videos.map((video) => (
                        <div key={video.id} className="group relative bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:scale-105 transition-all">
                          <div className="relative">
                            <img 
                              src={video.thumbnail_url} 
                              alt={video.title}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play className="h-12 w-12 text-white" />
                            </div>
                            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-0.5 rounded-md text-xs font-bold mb-2">
                                  EP {video.episode_number}
                                </div>
                                <h4 className="font-bold text-slate-900 mb-1 line-clamp-2">
                                  {video.title}
                                </h4>
                                <p className="text-sm text-slate-600 flex items-center gap-2 mb-1">
                                  <Play className="h-3 w-3" />
                                  {video.views} views
                                </p>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(video.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setItemToDelete({ type: 'video', id: video.id, name: video.title });
                                  setDeleteDialogOpen(true);
                                }}
                                className="p-2 hover:bg-red-100 rounded-lg transition-all hover:scale-110"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </button>
                            </div>
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
