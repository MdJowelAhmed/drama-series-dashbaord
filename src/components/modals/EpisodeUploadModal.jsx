import { useState, useEffect } from "react";
import { X, Upload, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getVideoAndThumbnail } from "@/components/share/imageUrl";

const API_BASE_URL = "http://72.62.164.122:5000/api/v1";
// const API_BASE_URL = "https://rakibur5003.binarybards.online/api/v1";

/**
 * EpisodeUploadModal - Modal for uploading/editing drama episodes
 * 
 * Data structure for API:
 * {
 *   "title": "The Hidden Valley",
 *   "description": "A short adventure clip for testing.",
 *   "duration": 245,
 *   "videoUrl": "https://example.com/videos/hidden-valley.mp4",
 *   "videoId": "vid_982374",
 *   "libraryId": "lib_202412",
 *   "thumbnailUrl": "https://example.com/thumbs/hidden-valley.jpg",
 *   "movieId": "692ef10c91135c2b0da0977a",
 *   "seasonId": "692effc029646c4dac76fddc",
 *   "episodeNumber": 1
 * }
 */
const EpisodeUploadModal = ({
  open,
  onClose,
  onSave,
  editingData = null,
  movieId,
  seasonId,
  nextEpisodeNumber = 1,
  generateUploadUrl,
  createMutation,
  updateMutation,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    episodeNumber: nextEpisodeNumber,
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [dragActive, setDragActive] = useState({ video: false, thumbnail: false });
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [errors, setErrors] = useState({});
  const [duration, setDuration] = useState(0);

  const isEditMode = !!editingData?._id || !!editingData?.id;

  // Initialize form data when modal opens or editingData changes
  useEffect(() => {
    if (open) {
      if (editingData) {
        setFormData({
          title: editingData.title || "",
          description: editingData.description || "",
          episodeNumber: editingData.episodeNumber || nextEpisodeNumber,
        });
        setDuration(editingData.duration || 0);
        
        // Set existing thumbnail preview
        const existingThumbnail = editingData.thumbnail_url || editingData.thumbnailUrl;
        if (existingThumbnail) {
          setThumbnailPreview(getVideoAndThumbnail(existingThumbnail));
        }
      } else {
        setFormData({
          title: "",
          description: "",
          episodeNumber: nextEpisodeNumber,
        });
        setDuration(0);
        setThumbnailPreview(null);
      }
      setVideoFile(null);
      setThumbnailFile(null);
      setUploadProgress(0);
      setUploadStatus("");
      setErrors({});
    }
  }, [open, editingData, nextEpisodeNumber]);

  // Clean up blob URLs on unmount
  useEffect(() => {
    return () => {
      if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

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
      handleFileSelect(e.dataTransfer.files[0], fileType);
    }
  };

  const handleFileSelect = (file, fileType) => {
    if (fileType === "video") {
      if (!file.type.startsWith("video/")) {
        toast.error("Please upload a valid video file");
        return;
      }
      setVideoFile(file);

      // Auto-detect duration
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        const durationInSeconds = Math.floor(video.duration);
        setDuration(durationInSeconds);
      };
      video.src = URL.createObjectURL(file);
      toast.success("Video selected successfully");
    } else {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be smaller than 5MB");
        return;
      }
      setThumbnailFile(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
      
      toast.success("Thumbnail selected successfully");
    }
  };

  const handleFileChange = (e, fileType) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0], fileType);
    }
  };

  // Upload video to Bunny Stream
  const uploadVideoToBunnyStream = async (videoFile, videoTitle) => {
    return new Promise(async (resolve, reject) => {
      try {
        setUploadStatus("Initializing video upload...");
        setUploadProgress(0);

        const result = await generateUploadUrl({
          title: videoTitle,
          fileName: videoFile.name,
        }).unwrap();

        // Debug: Log the full response to see what backend returns
        console.log("🔍 Generate Upload URL Response:", result);
        console.log("🔍 Response data:", result.data);

        const { videoId, uploadUrl, apiKey, embedUrl, libraryId } = result.data;
        
        // Try to get downloadUrls from different possible locations in the response
        // Note: Download URLs might not be available immediately after generating upload URL.
        // They may only be available after video is fully uploaded and processed by Bunny Stream.
        // Backend should return downloadUrls in the response if available.
        const downloadUrls = result.data?.downloadUrls || 
                            result.data?.download_urls || 
                            result?.downloadUrls || 
                            result?.download_urls || 
                            {};

        // Log downloadUrls for debugging
        if (Object.keys(downloadUrls).length > 0) {
          console.log("✅ Download URLs found:", downloadUrls);
        } else {
          console.warn("⚠️ Download URLs not found in backend response. Available keys:", Object.keys(result.data || {}));
          console.warn("💡 Note: Download URLs may need to be fetched after video upload completes, or backend needs to return them in generate-upload-url response.");
        }

        setUploadStatus("Uploading video to CDN...");

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percentComplete);
            setUploadStatus(`Uploading video: ${percentComplete}%`);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200 || xhr.status === 201) {
            setUploadStatus("Video upload complete!");
            setUploadProgress(100);
            resolve({
              videoId,
              libraryId,
              embedUrl,
              videoUrl: embedUrl,
              downloadUrls: downloadUrls || {}, // Pass the full downloadUrls object
            });
          } else {
            reject(new Error("Video upload failed"));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error during video upload"));
        });

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("AccessKey", apiKey);
        xhr.setRequestHeader("Content-Type", "application/octet-stream");
        xhr.send(videoFile);
      } catch (error) {
        reject(error);
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.episodeNumber || formData.episodeNumber < 0) {
      newErrors.episodeNumber = "Episode number is required";
    }

    if (!isEditMode && !videoFile) {
      newErrors.video = "Video file is required";
    }

    if (!isEditMode && !thumbnailFile) {
      newErrors.thumbnail = "Thumbnail is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setUploadingVideo(true);
      
      let videoUrl = editingData?.video_url || editingData?.videoUrl;
      let videoId = editingData?.videoId || editingData?.video_id;
      let libraryId = editingData?.libraryId || editingData?.library_id;
      let thumbnailUrl = editingData?.thumbnail_url || editingData?.thumbnailUrl;
      let downloadUrls = editingData?.downloadUrls || editingData?.download_urls || {};

      // Upload video if new file selected
      if (videoFile && generateUploadUrl) {
        const bunnyData = await uploadVideoToBunnyStream(
          videoFile,
          formData.title || "Untitled Episode"
        );
        videoUrl = bunnyData.videoUrl;
        videoId = bunnyData.videoId;
        libraryId = bunnyData.libraryId;
        downloadUrls = bunnyData.downloadUrls || {};
      }

      // Handle thumbnail upload using native fetch for FormData
      if (thumbnailFile && videoId) {
        setUploadStatus("Uploading thumbnail...");
        
        try {
          // Validate thumbnail file before upload
          if (!(thumbnailFile instanceof File) && !(thumbnailFile instanceof Blob)) {
            throw new Error("Invalid thumbnail file object");
          }
          
          if (thumbnailFile.size === 0) {
            throw new Error("Thumbnail file is empty");
          }
          
          console.log("Thumbnail file details:", {
            name: thumbnailFile.name,
            size: thumbnailFile.size,
            type: thumbnailFile.type,
            isFile: thumbnailFile instanceof File,
          });
          
          const formDataToSend = new FormData();
          // Append the file directly - 'thumbnail' is the expected field name
          formDataToSend.append("thumbnail", thumbnailFile);
          
          // Debug: Log FormData entries
          console.log("FormData entries:");
          for (const [key, value] of formDataToSend.entries()) {
            if (value instanceof File) {
              console.log(`  ${key}: File(name=${value.name}, size=${value.size}, type=${value.type})`);
            } else {
              console.log(`  ${key}:`, value);
            }
          }
          
          const token = localStorage.getItem("token");
          console.log("Uploading to:", `${API_BASE_URL}/video-management/${videoId}/thumbnail`);
          
          const response = await fetch(
            `${API_BASE_URL}/video-management/${videoId}/thumbnail`,
            {
              method: "POST",
              headers: {
                // Don't set Content-Type - browser will set it with boundary for FormData
                ...(token ? { "Authorization": `Bearer ${token}` } : {}),
              },
              body: formDataToSend,
            }
          );
          
          const thumbnailResult = await response.json();
          console.log("Thumbnail upload response:", thumbnailResult);
          
          if (!response.ok) {
            throw new Error(thumbnailResult.message || "Thumbnail upload failed");
          }
          
          thumbnailUrl = thumbnailResult.data?.result || 
                        thumbnailResult.data?.thumbnail_url ||
                        thumbnailResult.data?.thumbnailUrl ||
                        thumbnailResult.data?.url ||
                        thumbnailResult.thumbnailUrl || 
                        thumbnailResult.thumbnail_url ||
                        thumbnailResult.url;
          
          if (thumbnailUrl) {
            toast.success("Thumbnail uploaded successfully");
          }
        } catch (error) {
          console.error("Thumbnail upload failed:", error);
          toast.error("Thumbnail upload failed: " + (error?.message || "Upload failed"));
          setUploadingVideo(false);
          return;
        }
      }

      // Prepare submit data according to API requirements
      const submitData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || "",
        duration: duration,
        videoUrl: videoUrl,
        videoId: videoId,
        libraryId: libraryId,
        thumbnailUrl: thumbnailUrl,
        downloadUrls: downloadUrls, // Add full downloadUrls object to the data sent to backend
        movieId: movieId,
        seasonId: seasonId,
        episodeNumber: parseInt(formData.episodeNumber, 10),
      };

      setUploadStatus("Saving episode data...");

      if (isEditMode) {
        if (updateMutation) {
          await updateMutation({
            id: editingData._id || editingData.id,
            updatedData: submitData,
          }).unwrap();
        }
        toast.success("Episode updated successfully!");
      } else {
        if (createMutation) {
          await createMutation(submitData).unwrap();
        }
        toast.success("Episode created successfully!");
      }

      setUploadingVideo(false);
      setUploadProgress(0);
      setUploadStatus("");
      onSave?.(submitData);
      onClose();
    } catch (error) {
      setUploadingVideo(false);
      setUploadStatus("");
      console.error("Upload error:", error);
      const errorMessage = error?.data?.message || error?.message || "Operation failed";
      toast.error(errorMessage);
    }
  };

  const removeFile = (fileType) => {
    if (fileType === "video") {
      setVideoFile(null);
      setDuration(0);
    } else {
      setThumbnailFile(null);
      if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      const originalThumbnail = editingData?.thumbnail_url || editingData?.thumbnailUrl;
      setThumbnailPreview(originalThumbnail ? getVideoAndThumbnail(originalThumbnail) : null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFFFF3B] border border-white/10 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">
            {isEditMode ? "Edit Episode" : "Upload New Episode"}
          </h3>
          <button
            onClick={onClose}
            disabled={uploadingVideo}
            className="text-white/50 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Upload Progress */}
        {uploadingVideo && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
              <span className="font-medium text-blue-300">{uploadStatus}</span>
            </div>
            <div className="w-full bg-blue-900/50 rounded-full h-2.5">
              <div
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-blue-400 mt-2">{uploadProgress}% complete</p>
          </div>
        )}

        <div className="space-y-5">
          {/* Title and Episode Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label className="block text-sm font-semibold text-white/80 mb-2">
                Episode Title <span className="text-red-400">*</span>
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter episode title"
                disabled={uploadingVideo}
                className={`w-full px-4 py-3 border-2 border-slate-200/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/5 text-white placeholder:text-white/40 ${
                  errors.title ? "border-red-500" : ""
                }`}
              />
              {errors.title && (
                <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <Label className="block text-sm font-semibold text-white/80 mb-2">
                Episode Number <span className="text-red-400">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                value={formData.episodeNumber}
                onChange={(e) => handleInputChange("episodeNumber", e.target.value)}
                placeholder="1"
                disabled={uploadingVideo}
                className={`w-full px-4 py-3 border-2 border-slate-200/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/5 text-white placeholder:text-white/40 ${
                  errors.episodeNumber ? "border-red-500" : ""
                }`}
              />
              {errors.episodeNumber && (
                <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.episodeNumber}
                </p>
              )}
            </div>
          </div>

          {/* Duration Display */}
          {duration > 0 && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-300">
                <strong>Duration detected:</strong> {formatDuration(duration)} ({duration} seconds)
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <Label className="block text-sm font-semibold text-white/80 mb-2">
              Description
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter episode description..."
              rows={3}
              disabled={uploadingVideo}
              className="w-full px-4 py-3 border-2 border-slate-200/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/5 text-white placeholder:text-white/40 resize-none"
            />
          </div>

          {/* File Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Video Upload */}
            {!isEditMode && (
              <div>
                <Label className="block text-sm font-semibold text-white/80 mb-2">
                  Video File <span className="text-red-400">*</span>
                </Label>
                <div
                  onDragEnter={(e) => handleDrag(e, "video")}
                  onDragLeave={(e) => handleDrag(e, "video")}
                  onDragOver={(e) => handleDrag(e, "video")}
                  onDrop={(e) => handleDrop(e, "video")}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragActive.video
                      ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
                      : errors.video
                      ? "border-red-500/50 bg-red-500/5"
                      : "border-white/20 hover:border-white/40 bg-white/5"
                  }`}
                >
                  {videoFile ? (
                    <div className="space-y-3">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-400" />
                      <p className="text-sm text-white font-medium truncate max-w-full">
                        {videoFile.name}
                      </p>
                      <p className="text-xs text-white/50">
                        {formatFileSize(videoFile.size)}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile("video")}
                        disabled={uploadingVideo}
                        className="text-red-400 hover:text-red-300 border-red-400/50"
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 mx-auto text-white/40 mb-3" />
                      <p className="text-sm text-white/70 mb-2 font-medium">
                        Drag and drop video file here
                      </p>
                      <p className="text-xs text-white/40 mb-4">
                        Supports: MP4, WEBM, MOV, AVI
                      </p>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, "video")}
                        accept="video/*"
                        className="hidden"
                        id="episode-video-upload"
                        disabled={uploadingVideo}
                      />
                      <label
                        htmlFor="episode-video-upload"
                        className="inline-block px-6 py-2.5 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/80 font-medium transition-all"
                      >
                        Choose Video
                      </label>
                    </>
                  )}
                </div>
                {errors.video && (
                  <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.video}
                  </p>
                )}
              </div>
            )}

            {/* Thumbnail Upload */}
            <div className={isEditMode ? "md:col-span-2" : ""}>
              <Label className="block text-sm font-semibold text-white/80 mb-2">
                Thumbnail Image {!isEditMode && <span className="text-red-400">*</span>}
              </Label>
              {/* Hidden file input - always available */}
              <input
                type="file"
                onChange={(e) => handleFileChange(e, "thumbnail")}
                accept="image/*"
                className="hidden"
                id="episode-thumbnail-upload"
                disabled={uploadingVideo}
              />
              <div
                onDragEnter={(e) => handleDrag(e, "thumbnail")}
                onDragLeave={(e) => handleDrag(e, "thumbnail")}
                onDragOver={(e) => handleDrag(e, "thumbnail")}
                onDrop={(e) => handleDrop(e, "thumbnail")}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  dragActive.thumbnail
                    ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
                    : errors.thumbnail
                    ? "border-red-500/50 bg-red-500/5"
                    : "border-white/20 hover:border-white/40 bg-white/5"
                }`}
              >
                {thumbnailPreview || thumbnailFile ? (
                  <div className="space-y-3">
                    {/* Clickable thumbnail preview */}
                    <label htmlFor="episode-thumbnail-upload" className="cursor-pointer block">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="h-32 mx-auto rounded-lg object-cover shadow-lg border border-white/10 hover:opacity-80 transition-opacity"
                      />
                      <p className="text-xs text-white/50 mt-2">Click image to change</p>
                    </label>
                    {thumbnailFile && (
                      <>
                        <p className="text-sm text-white font-medium truncate max-w-full">
                          {thumbnailFile.name}
                        </p>
                        <p className="text-xs text-white/50">
                          {formatFileSize(thumbnailFile.size)}
                        </p>
                      </>
                    )}
                    <div className="flex gap-2 justify-center">
                      {/* Change Thumbnail Button */}
                      <label
                        htmlFor="episode-thumbnail-upload"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg cursor-pointer hover:bg-blue-500/30 font-medium transition-all border border-blue-500/30 text-sm"
                      >
                        <Upload className="h-4 w-4" />
                        {isEditMode ? "Change Thumbnail" : "Change"}
                      </label>
                      {/* Remove Button - only show if a new file is selected */}
                      {thumbnailFile && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFile("thumbnail")}
                          disabled={uploadingVideo}
                          className="text-red-400 hover:text-red-300 border-red-400/50"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 mx-auto text-white/40 mb-3" />
                    <p className="text-sm text-white/70 mb-2 font-medium">
                      Drag and drop thumbnail here
                    </p>
                    <p className="text-xs text-white/40 mb-4">
                      Supports: JPG, PNG, WEBP (Max 5MB)
                    </p>
                    <label
                      htmlFor="episode-thumbnail-upload"
                      className="inline-block px-6 py-2.5 bg-white/10 text-white rounded-lg cursor-pointer hover:bg-white/20 font-medium transition-all border border-white/20"
                    >
                      Choose Thumbnail
                    </label>
                  </>
                )}
              </div>
              {errors.thumbnail && (
                <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.thumbnail}
                </p>
              )}
            </div>
          </div>

          {/* Edit Mode Note */}
          {isEditMode && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-sm text-blue-300">
                <strong>Note:</strong> Video files cannot be changed after upload. You can update the thumbnail and other details.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <Button
              onClick={onClose}
              disabled={uploadingVideo}
              variant="outline"
              className="px-6 py-5 border-white/20 text-white hover:bg-white/10 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={uploadingVideo}
              className="px-6 py-5 bg-primary hover:bg-primary/80"
            >
              {uploadingVideo
                ? `Uploading... ${uploadProgress}%`
                : isEditMode
                ? "Update Episode"
                : "Upload Episode"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodeUploadModal;

