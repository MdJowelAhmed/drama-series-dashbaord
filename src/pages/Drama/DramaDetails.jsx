import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Video, Edit2, Upload, X, Play, Clock, Calendar, Eye, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import VideoUploadModal from '@/components/modals/VideoUploadModal';
import VideoDetailsModal from '@/components/modals/VideoDetailsModal';

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

const VIDEO_TYPES = [
  "Science Fiction",
  "Romantic",
  "War",
  "History",
  "Action",
  "Comedy",
  "Drama",
  "Thriller",
  "Horror",
  "Mystery",
  "Fantasy",
  "Adventure",
  "Crime",
  "Biography",
  "Documentary",
  "Animation",
  "Musical",
  "Western",
  "Superhero",
  "Noir"
];

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
        views: "450K",
        type: "Action",
        tags: ["pilot", "introduction", "heroes"],
        color: "#3b82f6",
        content: "The beginning of an epic journey where heroes are born and destinies are forged."
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
        views: "380K",
        type: "Adventure",
        tags: ["adventure", "quest", "journey"],
        color: "#10b981",
        content: "A mysterious call to adventure leads our heroes into unknown territories."
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
        views: "420K",
        type: "War",
        tags: ["battle", "combat", "victory"],
        color: "#ef4444",
        content: "The first major confrontation that tests the strength and courage of our warriors."
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
        views: "290K",
        type: "Drama",
        tags: ["alliance", "friendship", "unity"],
        color: "#8b5cf6",
        content: "New friendships are formed as unlikely allies join forces for a greater cause."
      }
    ]
  }
];

// VideoUploadModal component has been moved to a separate file

// VideoDetailsModal component has been moved to a separate file

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
  const [videoDetailsModalOpen, setVideoDetailsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
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
    setEditingVideo(null);
    setVideoModalOpen(true);
  };

  const handleEditVideo = (video, seriesId) => {
    setSelectedSeriesId(seriesId);
    setEditingVideo(video);
    setVideoModalOpen(true);
  };

  const handleSaveVideo = (videoData) => {
    setSeries(prev => prev.map(s => {
      if (s.id === selectedSeriesId) {
        if (editingVideo) {
          return {
            ...s,
            videos: s.videos.map(v => 
              v.id === editingVideo.id 
                ? { ...v, ...videoData }
                : v
            )
          };
        } else {
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

  const handleViewDetails = (video) => {
    setSelectedVideo(video);
    setVideoDetailsModalOpen(true);
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
      <div className="mx-auto space-y-8">
        <Button className="flex items-center gap-2 py-6 font-medium hover:gap-3 transition-all group">
          <ArrowLeft className="h-5 w-5 group-hover:scale-110 transition-transform" />
          Back to Dramas
        </Button>

        <div className="bg-secondary rounded-3xl shadow-sm border border-white/20">
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
                  <h1 className="text-4xl font-bold text-accent">
                    {drama.title}
                  </h1>
                  <span className="px-4 py-1.5 text-accent text-sm rounded-full font-semibold shadow-lg">
                    {drama.status}
                  </span>
                </div>
                <p className="text-white/70 text-lg leading-relaxed">{drama.description}</p>
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

              <div className="flex items-center gap-3 text-accent">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">Released: {new Date(drama.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-accent">Series & Videos</h2>
          <Button
            onClick={handleCreateSeries}
            className="flex items-center gap-2 py-6 text-white px-6 rounded-md hover:shadow-xl hover:scale-105 transition-all font-semibold"
          >
            <Plus className="h-5 w-5" />
            Add Series
          </Button>
        </div>

        {series.length === 0 ? (
          <div className="bg-secondary backdrop-blur-sm rounded-3xl shadow-xl p-16 text-center border border-white/20">
            <div className="text-slate-400 mb-4">
              <Video className="h-20 w-20 mx-auto" />
            </div>
            <p className="text-slate-600 text-lg font-medium">No series found. Add a new series to get started!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {series.map((s) => (
              <div key={s.id} className="bg-secondary rounded-3xl shadow-xl overflow-hidden border border-white/20 hover:shadow-2xl transition-all">
                <div className="p-6 bg-secondary border-b border-slate-200">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <h3 className="text-2xl font-bold text-accent">
                      <span className="text-accent">Series {s.series_number}:</span> {s.title}
                    </h3>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleEditSeries(s)}
                        className="py-6"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleUploadVideo(s.id)}
                        className="py-6"
                      >
                        <Video className="h-4 w-4" />
                        Upload Video
                      </Button>
                      <Button
                        onClick={() => {
                          setItemToDelete({ type: 'series', id: s.id, name: s.title });
                          setDeleteDialogOpen(true);
                        }}
                        className="py-6"
                      >
                        <Trash2 className="h-5 w-5 text-white" />
                      </Button>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                            <div 
                              className="absolute top-3 left-3 w-6 h-6 rounded-full shadow-lg"
                              style={{ backgroundColor: video.color }}
                            />
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
                                <p className="text-xs text-slate-600 mb-1">{video.type}</p>
                                <p className="text-sm text-slate-600 flex items-center gap-2 mb-1">
                                  <Play className="h-3 w-3" />
                                  {video.views} views
                                </p>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(video.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                              <Button
                                onClick={() => handleViewDetails(video)}
                                className="py-"
                              >
                                <Eye className="h-3 w-3" />
                                Details
                              </Button>
                              <Button
                                onClick={() => handleEditVideo(video, s.id)}
                                className=""
                              >
                                <Edit2 className="h-3 w-3" />
                                Edit
                              </Button>
                              <Button
                                onClick={() => {
                                  setItemToDelete({ type: 'video', id: video.id, name: video.title });
                                  setDeleteDialogOpen(true);
                                }}
                                className="-all"
                              >
                                <Trash2 className="h-4 w-4 text-white" />
                              </Button>
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
            video={editingVideo}
            onClose={() => setVideoModalOpen(false)}
            onSave={handleSaveVideo}
          />
        )}

        {videoDetailsModalOpen && selectedVideo && (
          <VideoDetailsModal
            video={selectedVideo}
            onClose={() => setVideoDetailsModalOpen(false)}
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