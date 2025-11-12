import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Video, Edit2, Play, Clock, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  total_views: "2.4M",
  created_at: "2024-01-15"
};

const INITIAL_VIDEOS = [
  {
    id: 1,
    drama_id: 1,
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
    drama_id: 1,
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
    drama_id: 1,
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
  },
  {
    id: 4,
    drama_id: 1,
    episode_number: 4,
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
];

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
  const [videos, setVideos] = useState(INITIAL_VIDEOS);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoDetailsModalOpen, setVideoDetailsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleUploadVideo = () => {
    setEditingVideo(null);
    setVideoModalOpen(true);
  };

  const handleEditVideo = (video) => {
    setEditingVideo(video);
    setVideoModalOpen(true);
  };

  const handleSaveVideo = (videoData) => {
    if (editingVideo) {
      setVideos(prev => prev.map(v => 
        v.id === editingVideo.id 
          ? { ...v, ...videoData }
          : v
      ));
    } else {
      const newVideo = {
        id: Date.now(),
        drama_id: drama.id,
        episode_number: videos.length + 1,
        ...videoData,
        created_at: new Date().toISOString()
      };
      setVideos(prev => [...prev, newVideo]);
    }
    setVideoModalOpen(false);
  };

  const handleDeleteVideo = () => {
    setVideos(prev => prev.filter(v => v.id !== itemToDelete.id));
    setDeleteDialogOpen(false);
  };

  const handleViewDetails = (video) => {
    setSelectedVideo(video);
    setVideoDetailsModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto space-y-6">
        <div className="bg-secondary rounded-3xl shadow-sm border border-white/20">
          <div className="flex flex-col lg:flex-row gap-8 p-8">
            <div className="relative group">
              <img
                src={drama.thumbnail_url}
                alt={drama.title}
                className="w-full lg:w-80 h-[300px] object-cover rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-2 right-2">
                <Badge className="bg-white/30 text-white">
                  {drama.status}
                </Badge>
              </div>
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-accent mb-3">
                  {drama.title}
                </h1>
                <p className="text-white/70 text-lg leading-relaxed">{drama.description}</p>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-5 rounded-2xl border border-blue-100/50 hover:shadow-lg transition-all hover:scale-105">
                  <p className="text-sm text-slate-600 font-medium mb-1">Total Videos</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{videos.length}</p>
                </div>
                {/* <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-100/50 hover:shadow-lg transition-all hover:scale-105">
                  <p className="text-sm text-slate-600 font-medium mb-1">Rating</p>
                  <p className="text-3xl font-bold text-green-600">⭐ {drama.rating}</p>
                </div> */}
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
          <h2 className="text-3xl font-bold text-accent">Videos</h2>
          <Button
            onClick={handleUploadVideo}
            className="flex items-center gap-2 py-6 text-white px-6 rounded-md  transition-all font-semibold"
          >
            <Plus className="h-5 w-5" />
            Upload Episode
          </Button>
        </div>

        {videos.length === 0 ? (
          <div className="bg-secondary backdrop-blur-sm rounded-3xl shadow-xl p-16 text-center border border-white/20">
            <div className="text-slate-400 mb-4">
              <Video className="h-20 w-20 mx-auto" />
            </div>
            <p className="text-slate-600 text-lg font-medium">No videos found. Upload a video to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {videos.map((video) => (
              <Card
                key={video.id}
                className="overflow-hidden hover:shadow-lg bg-secondary transition-shadow flex flex-col"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center group cursor-pointer">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-black/70 backdrop-blur-sm text-white flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                    </Badge>
                  </div>
                  <div 
                    className="absolute top-2 left-2 w-6 h-6 rounded-full shadow-lg"
                    style={{ backgroundColor: video.color }}
                  />
                </div>
                <CardContent className="p-4 flex-1">
                  <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-0.5 rounded-md text-xs font-bold mb-2">
                    EP {video.episode_number}
                  </div>
                  <h3 className="font-semibold text-accent text-lg mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-accent mb-3 line-clamp-2">
                    {video.content || video.type}
                  </p>
                  <div className="flex items-center justify-between text-sm text-accent">
                    <span className="flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      {video.views}
                    </span>
                    <span>
                      {new Date(video.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
                <div className="flex justify-between gap-3 p-4">
                  <Button
                    size="sm"
                    className="flex-1 py-5"
                    onClick={() => handleViewDetails(video)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <div className="flex gap-3">
                    <Button 
                      size="sm" 
                      className="flex-1 py-5" 
                      onClick={() => handleEditVideo(video)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 py-5"
                      onClick={() => {
                        setItemToDelete({ id: video.id, name: video.title });
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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
            onConfirm={handleDeleteVideo}
          />
        )}
      </div>
    </div>
  );
};

export default DramaDetails;