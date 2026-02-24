import { X, Clock, Calendar, Eye, Play, Film } from "lucide-react";
import { useState } from "react";
import { getVideoAndThumbnail } from "@/components/share/imageUrl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const VideoDetailsModal = ({ video, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Helper to format duration
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Check if videoUrl is an embed URL (iframe) or direct video URL
  const isEmbedUrl = video.videoUrl?.includes("iframe.mediadelivery.net/embed");
  const thumbnailSrc =
    video.thumbnailUrl || video.thumbnail_url
      ? getVideoAndThumbnail(video.thumbnailUrl || video.thumbnail_url)
      : null;
  const hasVideo = Boolean(video.videoUrl || video.video_url);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Episode {video.episodeNumber || video.episode_number || 0}: {video.title}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Video Player with Thumbnail Overlay */}
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-md aspect-video">
            {!isPlaying && thumbnailSrc ? (
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                className="group relative w-full h-full"
              >
                <img
                  src={thumbnailSrc}
                  alt={`${video.title} thumbnail`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 group-hover:bg-white shadow-lg">
                    <Play className="h-8 w-8 text-slate-900" />
                  </div>
                </div>
              </button>
            ) : hasVideo ? (
              isEmbedUrl ? (
                <iframe
                  src={video.videoUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={video.title}
                />
              ) : (
                <video
                  controls
                  className="w-full h-full"
                  poster={thumbnailSrc || undefined}
                  autoPlay
                >
                  <source src={video.videoUrl || video.video_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-900">
                <div className="text-center">
                  <Play className="h-16 w-16 text-white/50 mx-auto mb-4" />
                  <p className="text-white/70">No video available</p>
                </div>
              </div>
            )}
          </div>

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
            {/* <div className="bg-slate-50 rounded-xl p-4">
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
            </div> */}

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
      </DialogContent>
    </Dialog>
  );
};

export default VideoDetailsModal;
