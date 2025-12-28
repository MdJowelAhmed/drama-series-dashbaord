import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Video,
  Edit2,
  Play,
  Clock,
  Calendar,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// API Hooks
import { useGetDramaByIdQuery } from "@/redux/feature/dramaManagement/dramaManagementApi";
import {
  useGetSeasonsByMovieIdQuery,
  useCreateDramaSeasonMutation,
  useUpdateDramaSeasonMutation,
  useDeleteDramaSeasonMutation,
} from "@/redux/feature/dramaManagement/dramaDetailsApi";
import {
  useCreateDramaVideoMutation,
  useDramaVideoUrlGenerateMutation,
  useUpdateDramaVideoMutation,
  useDeleteDramaVideoMutation,
  useGetVideosBySeasonIdQuery,
} from "@/redux/feature/dramaManagement/DramaVideoUploadApi";

// Components
import SeasonFormModal from "@/components/modals/SeasonFormModal";
import EpisodeUploadModal from "@/components/modals/EpisodeUploadModal";
import VideoDetailsModal from "@/components/modals/VideoDetailsModal";
import { getImageUrl, getVideoAndThumbnail } from "@/components/share/imageUrl";

// SeasonCard Component - Fetches and displays videos for a season
const SeasonCard = ({
  season,
  movieId,
  onEditSeason,
  onUploadEpisode,
  onDeleteSeason,
  onEditVideo,
  onDeleteVideo,
  onViewDetails,
  formatDuration,
}) => {
  // Fetch videos for this specific season
  const {
    data: videosData,
    isLoading: isVideosLoading,
    refetch: refetchVideos,
  } = useGetVideosBySeasonIdQuery(season._id || season.id);

  const videos = videosData?.data || [];

  return (
    <div className="bg-secondary rounded-3xl shadow-xl overflow-hidden border border-white/20 hover:shadow-2xl transition-all">
      <div className="p-6 bg-secondary border-b border-slate-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-2xl font-bold text-accent">
              <span className="text-accent">Season {season.seasonNumber}:</span>{" "}
              {season.title}
            </h3>
            {season.description && (
              <p className="text-white/60 mt-1 text-sm">{season.description}</p>
            )}
            <p className="text-white/40 text-xs mt-1">
              {videos.length} episode{videos.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => onEditSeason(season)} className="py-6">
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              onClick={() => onUploadEpisode(season._id || season.id, refetchVideos)}
              className="py-6"
            >
              <Video className="h-4 w-4 mr-1" />
              Upload Episode
            </Button>
            <Button
              onClick={() => onDeleteSeason(season)}
              variant="destructive"
              className="py-6"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {isVideosLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 mx-auto text-blue-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading episodes...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <Video className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No episodes uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6">
            {videos.map((video) => (
              <div
                key={video._id || video.id}
                className="group relative bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:scale-105 transition-all"
              >
                <div className="relative">
                  <img
                    src={getVideoAndThumbnail(video.thumbnailUrl || video.thumbnail_url)}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(video.duration)}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-0.5 rounded-md text-xs font-bold mb-2">
                        EP {video.episodeNumber || 0}
                      </div>
                      <h4 className="font-bold text-slate-900 mb-1 line-clamp-2">
                        {video.title}
                      </h4>
                      <p className="text-sm text-slate-600 flex items-center gap-2 mb-1">
                        <Play className="h-3 w-3" />
                        {video.views || 0} views
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {video.createdAt
                          ? new Date(video.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200">
                    <Button
                      size="sm"
                      onClick={() => onViewDetails(video)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onEditVideo(video, season._id || season.id, refetchVideos)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDeleteVideo(video, refetchVideos)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DramaDetails = () => {
  const { id: movieId } = useParams();
  const navigate = useNavigate();

  // Modal states
  const [seasonModalOpen, setSeasonModalOpen] = useState(false);
  const [episodeModalOpen, setEpisodeModalOpen] = useState(false);
  const [videoDetailsModalOpen, setVideoDetailsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Selected items
  const [editingSeason, setEditingSeason] = useState(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [refetchVideosCallback, setRefetchVideosCallback] = useState(null);

  // API Queries
  const {
    data: dramaData,
    isLoading: isDramaLoading,
    isError: isDramaError,
    refetch: refetchDrama,
  } = useGetDramaByIdQuery(movieId, { skip: !movieId });

  const {
    data: seasonsData,
    isLoading: isSeasonsLoading,
    refetch: refetchSeasons,
  } = useGetSeasonsByMovieIdQuery(movieId, { skip: !movieId });

  // API Mutations
  const [createSeason, { isLoading: isCreatingSeason }] = useCreateDramaSeasonMutation();
  const [updateSeason, { isLoading: isUpdatingSeason }] = useUpdateDramaSeasonMutation();
  const [deleteSeason, { isLoading: isDeletingSeason }] = useDeleteDramaSeasonMutation();
  const [createVideo] = useCreateDramaVideoMutation();
  const [generateVideoUrl] = useDramaVideoUrlGenerateMutation();
  const [updateVideo] = useUpdateDramaVideoMutation();
  const [deleteVideo, { isLoading: isDeletingVideo }] = useDeleteDramaVideoMutation();

  // Extract data
  const drama = dramaData?.data || null;
  const seasons = seasonsData?.data || [];

  // Format duration helper
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Season handlers
  const handleCreateSeason = () => {
    setEditingSeason(null);
    setSeasonModalOpen(true);
  };

  const handleEditSeason = (season) => {
    setEditingSeason(season);
    setSeasonModalOpen(true);
  };

  const handleSaveSeason = async (seasonData) => {
    try {
      if (editingSeason) {
        await updateSeason({
          id: editingSeason._id || editingSeason.id,
          updatedData: seasonData,
        }).unwrap();
        toast.success("Season updated successfully");
      } else {
        await createSeason(seasonData).unwrap();
        toast.success("Season created successfully");
      }
      setSeasonModalOpen(false);
      setEditingSeason(null);
      refetchSeasons();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to save season");
    }
  };

  const handleDeleteSeasonClick = (season) => {
    setItemToDelete({
      type: "season",
      id: season._id || season.id,
      name: season.title,
    });
    setDeleteDialogOpen(true);
  };

  const handleDeleteSeason = async () => {
    if (!itemToDelete?.id) return;
    try {
      await deleteSeason(itemToDelete.id).unwrap();
      toast.success("Season deleted successfully");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      refetchSeasons();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete season");
    }
  };

  // Episode/Video handlers
  const handleUploadEpisode = (seasonId, refetchCallback) => {
    setSelectedSeasonId(seasonId);
    setEditingVideo(null);
    setRefetchVideosCallback(() => refetchCallback);
    setEpisodeModalOpen(true);
  };

  const handleEditVideo = (video, seasonId, refetchCallback) => {
    setSelectedSeasonId(seasonId);
    setEditingVideo(video);
    setRefetchVideosCallback(() => refetchCallback);
    setEpisodeModalOpen(true);
  };

  const handleSaveVideo = () => {
    setEpisodeModalOpen(false);
    setEditingVideo(null);
    setSelectedSeasonId(null);
    // Refetch videos for the specific season
    if (refetchVideosCallback) {
      refetchVideosCallback();
    }
  };

  const handleDeleteVideoClick = (video, refetchCallback) => {
    setItemToDelete({
      type: "video",
      id: video._id || video.id,
      name: video.title,
    });
    setRefetchVideosCallback(() => refetchCallback);
    setDeleteDialogOpen(true);
  };

  const handleDeleteVideo = async () => {
    if (!itemToDelete?.id) return;
    try {
      await deleteVideo(itemToDelete.id).unwrap();
      toast.success("Episode deleted successfully");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      // Refetch videos for the specific season
      if (refetchVideosCallback) {
        refetchVideosCallback();
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete episode");
    }
  };

  const handleViewDetails = (video) => {
    setSelectedVideo(video);
    setVideoDetailsModalOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete?.type === "season") {
      handleDeleteSeason();
    } else {
      handleDeleteVideo();
    }
  };

  // Get next episode number for a season
  const getNextEpisodeNumber = (seasonId) => {
    // This will be handled by the season card's video count
    return 1;
  };

  // Loading state
  if (isDramaLoading || isSeasonsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Error state
  if (isDramaError || !drama) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-600">Failed to load drama details</p>
        <Button onClick={() => refetchDrama()}>Try Again</Button>
        <Button variant="outline" onClick={() => navigate("/dramas")}>
          Back to Dramas
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate("/dramas")}
          className="flex items-center gap-2 py-5 font-medium hover:gap-3 transition-all group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:scale-110 transition-transform" />
          Back to Dramas
        </Button>

        {/* Drama Info Card */}
        <div className="bg-secondary rounded-3xl shadow-sm border border-white/20">
          <div className="flex flex-col lg:flex-row gap-8 p-8">
            <div className="relative group">
              <img
                src={getImageUrl(drama.thumbnail)}
                alt={drama.title}
                className="w-full lg:w-80 h-[300px] object-cover rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src =
                    "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <h1 className="text-4xl font-bold text-accent">{drama.title}</h1>
                  <span
                    className={`px-4 py-1.5 text-white text-sm rounded-full font-semibold shadow-lg ${
                      drama.status === "Completed"
                        ? "bg-green-500/90"
                        : drama.status === "Ongoing"
                        ? "bg-blue-500/90"
                        : "bg-yellow-500/90"
                    }`}
                  >
                    {drama.status}
                  </span>
                </div>
                <p className="text-white/70 text-lg leading-relaxed">
                  {drama.description || "No description available"}
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-5 rounded-2xl border border-blue-100/50 hover:shadow-lg transition-all hover:scale-105">
                  <p className="text-sm text-slate-600 font-medium mb-1">Total Seasons</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {seasons.length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-100/50 hover:shadow-lg transition-all hover:scale-105">
                  <p className="text-sm text-slate-600 font-medium mb-1">Rating</p>
                  <p className="text-3xl font-bold text-green-600">⭐ {drama.rating || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-2xl border border-orange-100/50 hover:shadow-lg transition-all hover:scale-105">
                  <p className="text-sm text-slate-600 font-medium mb-1">Total Views</p>
                  <p className="text-3xl font-bold text-orange-600">{drama.totalViews || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-5 rounded-2xl border border-violet-100/50 hover:shadow-lg transition-all hover:scale-105">
                  <p className="text-sm text-slate-600 font-medium mb-1">Genre</p>
                  <p className="text-xl font-bold text-violet-600">{drama.genre || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-accent">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">
                  Created:{" "}
                  {drama.createdAt
                    ? new Date(drama.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Seasons & Episodes Section */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-accent">Seasons & Episodes</h2>
          <Button
            onClick={handleCreateSeason}
            className="flex items-center gap-2 py-6 text-white px-6 rounded-md hover:shadow-xl hover:scale-105 transition-all font-semibold"
          >
            <Plus className="h-5 w-5" />
            Add Season
          </Button>
        </div>

        {seasons.length === 0 ? (
          <div className="bg-secondary backdrop-blur-sm rounded-3xl shadow-xl p-16 text-center border border-white/20">
            <div className="text-slate-400 mb-4">
              <Video className="h-20 w-20 mx-auto" />
            </div>
            <p className="text-slate-600 text-lg font-medium">
              No seasons found. Add a new season to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {seasons.map((season) => (
              <SeasonCard
                key={season._id || season.id}
                season={season}
                movieId={movieId}
                onEditSeason={handleEditSeason}
                onUploadEpisode={handleUploadEpisode}
                onDeleteSeason={handleDeleteSeasonClick}
                onEditVideo={handleEditVideo}
                onDeleteVideo={handleDeleteVideoClick}
                onViewDetails={handleViewDetails}
                formatDuration={formatDuration}
              />
            ))}
          </div>
        )}

        {/* Season Form Modal */}
        <SeasonFormModal
          open={seasonModalOpen}
          onClose={() => {
            setSeasonModalOpen(false);
            setEditingSeason(null);
          }}
          onSave={handleSaveSeason}
          editingData={editingSeason}
          movieId={movieId}
          nextSeasonNumber={seasons.length + 1}
          isLoading={isCreatingSeason || isUpdatingSeason}
        />

        {/* Episode Upload Modal */}
        {episodeModalOpen && selectedSeasonId && (
          <EpisodeUploadModal
            open={episodeModalOpen}
            onClose={() => {
              setEpisodeModalOpen(false);
              setEditingVideo(null);
              setSelectedSeasonId(null);
            }}
            onSave={handleSaveVideo}
            editingData={editingVideo}
            movieId={movieId}
            seasonId={selectedSeasonId}
            nextEpisodeNumber={1}
            generateUploadUrl={generateVideoUrl}
            createMutation={createVideo}
            updateMutation={updateVideo}
          />
        )}

        {/* Video Details Modal */}
        {videoDetailsModalOpen && selectedVideo && (
          <VideoDetailsModal video={selectedVideo} onClose={() => setVideoDetailsModalOpen(false)} />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{itemToDelete?.name}".{" "}
                {itemToDelete?.type === "season" &&
                  "All episodes in this season will also be deleted. "}
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeletingSeason || isDeletingVideo}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={isDeletingSeason || isDeletingVideo}
              >
                {(isDeletingSeason || isDeletingVideo) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default DramaDetails;
