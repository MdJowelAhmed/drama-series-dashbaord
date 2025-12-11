import { X, Clock, Calendar, Eye, Play, Film } from "lucide-react";
import { getVideoAndThumbnail } from "@/components/share/imageUrl";

const VideoDetailsModal = ({ video, onClose }) => {
  // Helper to format duration
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Check if videoUrl is an embed URL (iframe) or direct video URL
  const isEmbedUrl = video.videoUrl?.includes("iframe.mediadelivery.net/embed");

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Episode {video.episodeNumber || video.episode_number || 0}: {video.title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Video Player */}
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video">
            {isEmbedUrl ? (
              <iframe
                src={video.videoUrl}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={video.title}
              />
            ) : video.videoUrl ? (
              <video
                controls
                className="w-full h-full"
                poster={getVideoAndThumbnail(video.thumbnailUrl || video.thumbnail_url)}
              >
                <source src={video.videoUrl || video.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-900">
                <div className="text-center">
                  <Play className="h-16 w-16 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70">No video available</p>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail Preview */}
          {(video.thumbnailUrl || video.thumbnail_url) && (
            <div className="flex items-center gap-4">
              <img
                src={getVideoAndThumbnail(video.thumbnailUrl || video.thumbnail_url)}
                alt={`${video.title} thumbnail`}
                className="w-32 h-20 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div>
                <p className="text-sm text-slate-500">Thumbnail</p>
                <p className="text-xs text-slate-400 truncate max-w-xs">
                  {video.thumbnailUrl || video.thumbnail_url}
                </p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-5 rounded-2xl border border-blue-100">
              <p className="text-sm text-slate-600 font-medium mb-1">Duration</p>
              <p className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {formatDuration(video.duration)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-100">
              <p className="text-sm text-slate-600 font-medium mb-1">Views</p>
              <p className="text-2xl font-bold text-green-600 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {video.views || 0}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-2xl border border-orange-100">
              <p className="text-sm text-slate-600 font-medium mb-1">Episode</p>
              <p className="text-2xl font-bold text-orange-600 flex items-center gap-2">
                <Film className="h-5 w-5" />
                #{video.episodeNumber || video.episode_number || 0}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            {video.description && (
              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Description</h4>
                <p className="text-slate-600 leading-relaxed">{video.description}</p>
              </div>
            )}

            {/* Technical Details */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h4 className="text-lg font-bold text-slate-900 mb-3">Technical Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {video.videoId && (
                  <div>
                    <span className="text-slate-500">Video ID:</span>
                    <span className="ml-2 font-mono text-slate-700">{video.videoId}</span>
                  </div>
                )}
                {video.libraryId && (
                  <div>
                    <span className="text-slate-500">Library ID:</span>
                    <span className="ml-2 font-mono text-slate-700">{video.libraryId}</span>
                  </div>
                )}
                {video.movieId && (
                  <div>
                    <span className="text-slate-500">Movie ID:</span>
                    <span className="ml-2 font-mono text-slate-700">{video.movieId}</span>
                  </div>
                )}
                {video.seasonId && (
                  <div>
                    <span className="text-slate-500">Season ID:</span>
                    <span className="ml-2 font-mono text-slate-700">{video.seasonId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="flex items-center gap-3 text-slate-600 pt-2 border-t border-slate-200">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">
                Published:{" "}
                {(video.createdAt || video.created_at)
                  ? new Date(video.createdAt || video.created_at).toLocaleDateString("en-US", {
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
    </div>
  );
};

export default VideoDetailsModal;
