import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Video,
  Edit2,
  Upload,
  X,
  Play,
  Clock,
  Calendar,
  Eye,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

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
  "Noir",
];

const VideoUploadModal = ({ video, onClose, onSave }) => {
  const [title, setTitle] = useState(video?.title || "");
  const [duration, setDuration] = useState(
    video ? Math.floor(video.duration / 60) : ""
  );
  const [type, setType] = useState(video?.type || "");
  const [tags, setTags] = useState(video?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [color, setColor] = useState(video?.color || "#3b82f6");
  const [contentName, setContentName] = useState(video?.contentName || "");
  const [content, setContent] = useState(video?.content || "");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [dragActive, setDragActive] = useState({
    video: false,
    thumbnail: false,
  });

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

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = () => {
    if (!title.trim() || !duration || !type) return;

    const videoData = {
      title,
      duration: parseInt(duration) * 60,
      type,
      tags,
      color,
      contentName,
      content,
      video_url: videoFile
        ? `https://example.com/${videoFile.name}`
        : video?.video_url || "https://example.com/video.mp4",
      thumbnail_url: thumbnailFile
        ? URL.createObjectURL(thumbnailFile)
        : video?.thumbnail_url ||
          "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400",
      views: video?.views || "0",
    };

    onSave(videoData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFFFF3B] rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-accent">
            {video ? "Edit Video" : "Upload Video"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label className="block text-sm font-semibold text-accent mb-2">
                Episode Title *
              </Label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className=""
                placeholder="Enter episode title"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-accent mb-2">
                Duration (minutes) *
              </label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className=""
                placeholder="Enter duration"
                min="1"
              />
            </div>
          </div>

          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-accent mb-2">
                Type *
              </label>

              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full px-4 py-[22px] border-2 border-slate-200 rounded-md focus:ring-4 focus:ring-accent-foreground focus:border-blue-500 outline-none transition-all bg-transparent text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-accent mb-2">
                Color
              </label>
              <div className="flex gap-3 items-center">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-12 w-20 border-2 border-slate-200 rounded-md cursor-pointer"
                />
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-md focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div> */}

          {/* <div>
            <label className="block text-sm font-semibold text-accent mb-2">
              Content Name
            </label>
            <Input
              type="text"
              value={contentName}
              onChange={(e) => setContentName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-md focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter content name"
            />
          </div> */}

          {/* <div>
            <label className="block text-sm font-semibold text-accent mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddTag())
                }
                className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-md focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                placeholder="Type a tag and press Enter"
              />
              <Button
                onClick={handleAddTag}
                type="button"
                className="px-6 py-6   rounded-md font-medium transition-all"
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div> */}

          <div>
            <label className="block text-sm font-semibold text-accent mb-2">
              Description
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-md focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none"
              placeholder="Enter content description"
              rows="4"
            />
          </div>

          {!video && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {" "}
                <div>
                  <label className="block text-sm font-semibold text-accent mb-2">
                    Video File
                  </label>
                  <div
                    onDragEnter={(e) => handleDrag(e, "video")}
                    onDragLeave={(e) => handleDrag(e, "video")}
                    onDragOver={(e) => handleDrag(e, "video")}
                    onDrop={(e) => handleDrop(e, "video")}
                    className={`border-2 border-dashed rounded-md p-8 text-center transition-all ${
                      dragActive.video
                        ? "border-blue-500 bg-blue-50 scale-105"
                        : "border-slate-300 hover:border-slate-400"
                    }`}
                  >
                    <Upload className="h-12 w-12 mx-auto text-accent mb-3" />
                    <p className="text-sm text-accent mb-3 font-medium">
                      {videoFile
                        ? videoFile.name
                        : "Drag and drop video file here, or click to browse"}
                    </p>
                    <Input
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
                  <label className="block text-sm font-semibold text-accent mb-2">
                    Thumbnail Image
                  </label>
                  <div
                    onDragEnter={(e) => handleDrag(e, "thumbnail")}
                    onDragLeave={(e) => handleDrag(e, "thumbnail")}
                    onDragOver={(e) => handleDrag(e, "thumbnail")}
                    onDrop={(e) => handleDrop(e, "thumbnail")}
                    className={`border-2 border-dashed rounded-md p-8 text-center transition-all ${
                      dragActive.thumbnail
                        ? "border-blue-500 bg-blue-50 scale-105"
                        : "border-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {thumbnailFile ? (
                      <div className="space-y-3">
                        <img
                          src={URL.createObjectURL(thumbnailFile)}
                          alt="Thumbnail preview"
                          className="h-40 mx-auto rounded-md object-cover shadow-lg"
                        />
                        <p className="text-sm text-accent font-medium">
                          {thumbnailFile.name}
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 mx-auto text-slate-400 mb-3" />
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
                      className="inline-block px-6 py-2.5 bg-primary text-white rounded-md cursor-pointer hover:bg-primary hover:scale-105 font-medium transition-all mt-2"
                    >
                      Choose Thumbnail
                    </label>
                  </div>
                </div>
              </div>
            </>
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
              className="px-6 py-6 "
            >
              {video ? "Update" : "Upload"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadModal;
