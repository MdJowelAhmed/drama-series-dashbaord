import { useState } from 'react';
import { X, Clock, Eye, Play, Calendar, Tag, Pause } from 'lucide-react';
import VideoPlayerManagement from './VideoPlayerManagement';
import { getVideoAndThumbnail } from '../share/imageUrl';

/**
 * VideoDetailsModal - A reusable video details modal component with video player
 * 
 * @param {Object} props
 * @param {Object} props.video - The video/trailer data to display
 * @param {Function} props.onClose - Callback when modal closes
 */
const VideoDetailsModal = ({ video, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!video) return null;

  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    if (typeof duration === 'string' && duration.includes(':')) return duration;
    if (typeof duration === 'string' && duration.includes('Min')) return duration;
    const totalSeconds = parseInt(duration);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const thumbnailUrl = getVideoAndThumbnail(video.thumbnail_url || video.thumbnailUrl) || 
    "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400";

  // Extract video info for the player
  const videoData = {
    videoId: video.videoId || video.video_id,
    libraryId: video.libraryId || video.library_id || "412466",
    title: video.title,
  };

  const hasVideoData = videoData.videoId && videoData.libraryId;

  const handlePlayClick = () => {
    if (hasVideoData) {
      setIsPlaying(true);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Video Details</h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Video Player / Thumbnail Preview */}
          <div className="relative rounded-xl overflow-hidden bg-black">
            {isPlaying && hasVideoData ? (
              <div className="relative">
                <VideoPlayerManagement
                  video={videoData}
                  autoplay={true}
                  showControls={true}
                  onEnded={handleVideoEnded}
                  onError={() => setIsPlaying(false)}
                  aspectRatio="16:9"
                />
                {/* Back to thumbnail button */}
                <button
                  onClick={() => setIsPlaying(false)}
                  className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-sm font-medium flex items-center gap-2 transition-all z-20"
                >
                  <Pause className="h-4 w-4" />
                  Stop
                </button>
              </div>
            ) : (
              <>
                <img 
                  src={thumbnailUrl} 
                  alt={video.title} 
                  className="w-full h-72 object-cover" 
                />
                {/* Play button overlay */}
                <div 
                  onClick={handlePlayClick}
                  className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                    hasVideoData ? 'cursor-pointer hover:bg-black/50' : 'cursor-not-allowed'
                  }`}
                >
                  <div className={`bg-white/20 backdrop-blur-sm rounded-full p-5 transition-transform ${
                    hasVideoData ? 'hover:scale-110 hover:bg-white/30' : 'opacity-50'
                  }`}>
                    <Play className="h-14 w-14 text-white" fill="white" />
                  </div>
                  {!hasVideoData && (
                    <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/70 text-sm bg-black/50 px-3 py-1 rounded-full">
                      Video not available
                    </p>
                  )}
                </div>
                {/* Duration Badge */}
                {video.duration && (
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-semibold flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(video.duration)}
                  </div>
                )}
                {/* Color Indicator */}
                {video.color && (
                  <div 
                    className="absolute top-3 left-3 w-8 h-8 rounded-full shadow-lg border-2 border-white" 
                    style={{ backgroundColor: video.color }} 
                  />
                )}
              </>
            )}
          </div>
          
          {/* Content Info */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <h4 className="text-xl font-bold text-white mb-2">{video.title}</h4>
              
              {/* Meta Info Row */}
              <div className="flex items-center gap-4 flex-wrap text-sm text-white/70">
                {/* Duration */}
                {video.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(video.duration)}
                  </span>
                )}
                
                {/* Views */}
                {video.views !== undefined && (
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {video.views} views
                  </span>
                )}
                
                {/* Type Badge */}
                {video.type && (
                  <span className="px-3 py-1 bg-primary text-white rounded-full font-semibold text-xs">
                    {video.type}
                  </span>
                )}
                
                {/* Color Display */}
                {video.color && (
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-white/30" 
                      style={{ backgroundColor: video.color }} 
                    />
                    <span className="text-white/50">{video.color}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Name */}
            {video.contentName && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="font-semibold text-white/80 mb-1 text-sm uppercase tracking-wide">Content Name</h5>
                <p className="text-white/90">{video.contentName}</p>
              </div>
            )}

            {/* Description */}
            {(video.description || video.content) && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="font-semibold text-white/80 mb-2 text-sm uppercase tracking-wide">Description</h5>
                <p className="text-white/70 leading-relaxed">{video.description || video.content}</p>
              </div>
            )}

            {/* Tags */}
            {video.tags && video.tags.length > 0 && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="font-semibold text-white/80 mb-2 text-sm uppercase tracking-wide flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </h5>
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-primary/20 text-white/90 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Equipment */}
            {video.equipment && video.equipment.length > 0 && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="font-semibold text-white/80 mb-2 text-sm uppercase tracking-wide">Equipment</h5>
                <div className="flex flex-wrap gap-2">
                  {video.equipment.map((eq, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm font-medium"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Video Info (for debugging/admin) */}
            {hasVideoData && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h5 className="font-semibold text-white/80 mb-2 text-sm uppercase tracking-wide">Video Info</h5>
                <div className="text-white/50 text-sm space-y-1">
                  <p>Video ID: {videoData.videoId}</p>
                  <p>Library ID: {videoData.libraryId}</p>
                </div>
              </div>
            )}

            {/* Date Info */}
            <div className="flex items-center gap-2 text-sm text-white/50 pt-2 border-t border-white/10">
              <Calendar className="h-4 w-4" />
              <span>
                Created: {formatDate(video.created_at || video.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailsModal;
