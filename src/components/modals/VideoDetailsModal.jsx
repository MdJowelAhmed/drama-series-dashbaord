import { X, Clock, Calendar, Eye, Tag } from "lucide-react";

const VideoDetailsModal = ({ video, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Episode {video.episode_number}: {video.title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video">
            <video
              controls
              className="w-full h-full"
              poster={video.thumbnail_url}
            >
              <source src="hhttps://res.cloudinary.com/dztlololv/video/upload/v1762870073/3-min_Stretch_Great_in_the_morning_or_between_work_Beginners_Apartment_Friendly_-_Marina_Fitness_480p_h264_youtube_o4nse6.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-5 rounded-2xl border border-blue-100">
              <p className="text-sm text-slate-600 font-medium mb-1">
                Duration
              </p>
              <p className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {Math.floor(video.duration / 60)}:
                {(video.duration % 60).toString().padStart(2, "0")}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-100">
              <p className="text-sm text-slate-600 font-medium mb-1">Views</p>
              <p className="text-2xl font-bold text-green-600 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {video.views}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-2xl border border-orange-100">
              <p className="text-sm text-slate-600 font-medium mb-1">Type</p>
              <p className="text-xl font-bold text-orange-600">{video.type}</p>
            </div>
          </div>

          <div className="space-y-4">
            {video.contentName && (
              <div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">
                  Content Name
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  {video.contentName}
                </p>
              </div>
            )}

            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                Description
              </h4>
              <p className="text-slate-600 leading-relaxed">{video.content}</p>
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {video?.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {video.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                        style={{
                          backgroundColor: `${video.color}20`,
                          color: video.color,
                        }}
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-600 pt-2 border-t border-slate-200">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">
                Published:{" "}
                {new Date(video.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetailsModal;
