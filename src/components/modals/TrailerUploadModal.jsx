import { useState, useEffect } from "react";
import { X, Upload, CheckCircle, Loader2, AlertCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getVideoAndThumbnail } from "@/components/share/imageUrl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

const TrailerUploadModal = ({
  open,
  onClose,
  onSave,
  editingData = null,
  generateUploadUrl,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contentName: "",
    color: "#3b82f6",
    duration: "",
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [dragActive, setDragActive] = useState({ video: false, thumbnail: false });
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [processingStatus, setProcessingStatus] = useState("");
  const [errors, setErrors] = useState({});
  const [videoDurationSeconds, setVideoDurationSeconds] = useState(0);

  const isEditMode = !!editingData?._id || !!editingData?.id;

  useEffect(() => {
    if (open) {
      if (editingData) {
        setFormData({
          title: editingData.title || "",
          description: editingData.description || "",
          contentName: editingData.contentName || "",
          color: editingData.color || "#3b82f6",
          duration: editingData.duration || "",
        });
        setVideoDurationSeconds(
          typeof editingData.duration === 'number' 
            ? editingData.duration 
            : editingData.duration?.includes(':') 
              ? parseDuration(editingData.duration) 
              : 0
        );
        
        const existingThumbnail = editingData.thumbnail_url || editingData.thumbnailUrl;
        if (existingThumbnail) {
          setThumbnailPreview(getVideoAndThumbnail(existingThumbnail));
        }
      } else {
        setFormData({
          title: "",
          description: "",
          contentName: "",
          color: "#3b82f6",
          duration: "",
        });
        setVideoDurationSeconds(0);
        setThumbnailPreview(null);
      }
      setVideoFile(null);
      setThumbnailFile(null);
      setUploadProgress(0);
      setUploadStatus("");
      setProcessingStatus("");
      setErrors({});
    }
  }, [open, editingData]);

  useEffect(() => {
    return () => {
      if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  const parseDuration = (durationStr) => {
    if (!durationStr || typeof durationStr !== 'string') return 0;
    const parts = durationStr.split(':');
    if (parts.length === 2) {
      const mins = parseInt(parts[0]) || 0;
      const secs = parseInt(parts[1]) || 0;
      return (mins * 60) + secs;
    }
    return 0;
  };

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

      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        const durationInSeconds = Math.floor(video.duration);
        setVideoDurationSeconds(durationInSeconds);
        
        // Auto-fill duration in MM:SS format
        const formatted = formatDuration(durationInSeconds);
        setFormData((prev) => ({ ...prev, duration: formatted }));
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

  // 🔥 Check video processing status
  const checkVideoProcessingStatus = async (videoId, libraryId, apiKey, maxAttempts = 30) => {
    let attempts = 0;
    const checkInterval = 3000; // Check every 3 seconds

    return new Promise((resolve, reject) => {
      const intervalId = setInterval(async () => {
        attempts++;
        
        try {
          const statusUrl = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;
          
          const response = await fetch(statusUrl, {
            method: "GET",
            headers: {
              "AccessKey": apiKey,
              "Accept": "application/json",
            },
          });

          if (!response.ok) {
            console.warn(`⚠️ Status check failed (attempt ${attempts}/${maxAttempts})`);
            if (attempts >= maxAttempts) {
              clearInterval(intervalId);
              reject(new Error("Video processing timeout"));
            }
            return;
          }

          const data = await response.json();
          const status = data.status;
          const encodingProgress = data.encodeProgress || 0;

          console.log(`📹 Video Status: ${status}, Progress: ${encodingProgress}%`);

          if (status === 0 || status === 1) {
            setProcessingStatus(`Processing video... ${encodingProgress}%`);
            setUploadProgress(90 + Math.floor(encodingProgress / 10));
          } else if (status === 2) {
            clearInterval(intervalId);
            reject(new Error("Video encoding failed"));
          } else if (status === 3 || status === 4) {
            setProcessingStatus("Video processing complete!");
            setUploadProgress(100);
            clearInterval(intervalId);
            setTimeout(() => resolve(data), 2000);
          }

          if (attempts >= maxAttempts) {
            clearInterval(intervalId);
            reject(new Error("Video processing timeout - video may still be processing"));
          }

        } catch (error) {
          console.error("Status check error:", error);
          if (attempts >= maxAttempts) {
            clearInterval(intervalId);
            reject(error);
          }
        }
      }, checkInterval);
    });
  };

  const getVideoUploadUrls = async (videoFile, videoTitle) => {
    try {
      setUploadStatus("Generating upload URL...");
      setUploadProgress(10);

      const result = await generateUploadUrl({
        title: videoTitle,
        fileName: videoFile.name,
      }).unwrap();

      console.log("🔍 Generate Upload URL Response:", result);

      const videoId = result.data?.videoId || 
                     result.data?.video_id || 
                     result.data?.id || 
                     result.data?._id ||
                     result?.videoId ||
                     result?.video_id;

      if (!videoId) {
        console.error("❌ VideoId not found in response:", result);
        throw new Error("Video ID not found in server response. Please try again.");
      }

      const embedUrl = result.data?.embedUrl || 
                      result.data?.embed_url || 
                      result.data?.uploadUrl || 
                      result.data?.upload_url || 
                      "";
      const libraryId = result.data?.libraryId || result.data?.library_id || "";
      const apiKey = result.data?.apiKey || 
                    result.data?.api_key || 
                    result.data?.accessKey ||
                    result.data?.access_key ||
                    result.data?.libraryApiKey ||
                    result.data?.library_api_key ||
                    "";
      
      const downloadUrls = result.data?.downloadUrls || 
                          result.data?.download_urls || 
                          result?.downloadUrls || 
                          result?.download_urls || 
                          {};

      console.log("✅ Extracted videoId:", videoId);
      console.log("✅ Upload URL:", embedUrl);

      return {
        videoId,
        libraryId,
        apiKey,
        embedUrl,
        videoUrl: embedUrl,
        downloadUrls: downloadUrls || {},
      };
    } catch (error) {
      console.error("Generate upload URL error:", error);
      throw error;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.duration?.trim()) {
      newErrors.duration = "Duration is required";
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
      let videoId = editingData?.videoId || editingData?.video_id || editingData?.videoId;
      let libraryId = editingData?.libraryId || editingData?.library_id;
      let apiKey = editingData?.apiKey || editingData?.api_key || "";
      let thumbnailUrl = editingData?.thumbnail_url || editingData?.thumbnailUrl;
      let downloadUrls = editingData?.downloadUrls || editingData?.download_urls || {};

      // Step 1: Generate upload URL if new video
      if (videoFile && generateUploadUrl) {
        const bunnyData = await getVideoUploadUrls(
          videoFile,
          formData.title || "Untitled Trailer"
        );
        
        if (!bunnyData.videoId) {
          toast.error("Failed to get Video ID from server. Please try again.");
          setUploadingVideo(false);
          return;
        }
        
        videoUrl = bunnyData.videoUrl;
        videoId = bunnyData.videoId;
        libraryId = bunnyData.libraryId;
        apiKey = bunnyData.apiKey || "";
        downloadUrls = bunnyData.downloadUrls || {};

        // Step 2: Upload video to Bunny Stream
        if (bunnyData.embedUrl) {
          setUploadStatus("Uploading video to Bunny Stream...");
          setUploadProgress(20);
          
          try {
            const xhr = new XMLHttpRequest();
            
            xhr.upload.addEventListener("progress", (event) => {
              if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 60) + 20;
                setUploadProgress(percentComplete);
                setUploadStatus(`Uploading video... ${percentComplete - 20}%`);
              }
            });

            const uploadPromise = new Promise((resolve, reject) => {
              xhr.addEventListener("load", () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  console.log("✅ Video uploaded successfully to Bunny Stream");
                  toast.success("Video uploaded! Now processing...");
                  setUploadProgress(80);
                  resolve();
                } else {
                  console.error("❌ Video upload failed:", xhr.status, xhr.statusText);
                  reject(new Error(`Video upload failed: ${xhr.status} ${xhr.statusText}`));
                }
              });

              xhr.addEventListener("error", () => {
                reject(new Error("Network error during video upload"));
              });
            });

            const uploadUrl = bunnyData.embedUrl.includes('/videos/')
              ? bunnyData.embedUrl
              : `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`;
            
            xhr.open("PUT", uploadUrl);
            
            if (apiKey) {
              xhr.setRequestHeader("AccessKey", apiKey);
            } else if (libraryId) {
              xhr.setRequestHeader("AccessKey", libraryId);
            } else {
              toast.error("Missing API Key for video upload");
              setUploadingVideo(false);
              return;
            }

            xhr.send(videoFile);
            await uploadPromise;

            // Step 3: Wait for video processing to complete
            setUploadStatus("Video uploaded! Waiting for processing...");
            setProcessingStatus("Processing video...");
            setUploadProgress(85);

            try {
              await checkVideoProcessingStatus(videoId, libraryId, apiKey);
              console.log("✅ Video processing complete!");
              toast.success("Video is ready!");
            } catch (processingError) {
              console.warn("⚠️ Processing check timeout:", processingError);
              toast.warning("Video uploaded but still processing. It will be available shortly.");
            }

          } catch (uploadError) {
            console.error("Video upload error:", uploadError);
            toast.error("Failed to upload video: " + uploadError.message);
            setUploadingVideo(false);
            return;
          }
        }
      }

      if (!videoId) {
        toast.error("Video ID is required");
        setUploadingVideo(false);
        return;
      }

      // Step 4: Upload thumbnail
      if (thumbnailFile && videoId) {
        setUploadStatus("Uploading thumbnail...");
        setUploadProgress(92);
        try {
          const thumbnailFormData = new FormData();
          thumbnailFormData.append("thumbnail", thumbnailFile);
          
          const token = localStorage.getItem("token");
          const thumbnailResponse = await fetch(
            `${API_BASE_URL}/video-management/${videoId}/thumbnail`,
            {
              method: "POST",
              headers: {
                ...(token ? { "Authorization": `Bearer ${token}` } : {}),
              },
              body: thumbnailFormData,
            }
          );

          if (thumbnailResponse.ok) {
            const thumbnailResult = await thumbnailResponse.json();
            thumbnailUrl = thumbnailResult.data?.result || 
                         thumbnailResult.data?.thumbnail_url ||
                         thumbnailResult.data?.thumbnailUrl ||
                         thumbnailResult.data?.url ||
                         thumbnailResult.thumbnailUrl || 
                         thumbnailResult.thumbnail_url ||
                         thumbnailResult.url;
            
            if (thumbnailUrl) {
              toast.success("Thumbnail uploaded");
            }
          }
        } catch (error) {
          console.error("Thumbnail upload error:", error);
          toast.warning("Thumbnail upload failed, but continuing...");
        }
      }

      // Step 5: Save trailer data as JSON
      const submitData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || "",
        contentName: formData.contentName?.trim() || "",
        color: formData.color || "#3b82f6",
        duration: formData.duration, // MM:SS format
        videoUrl: videoUrl || "",
        videoId: videoId,
        libraryId: libraryId || "",
        thumbnailUrl: thumbnailUrl || "",
        downloadUrls: downloadUrls || {}, // Always include, even if empty
      };

      console.log("📤 Submitting trailer data:", submitData);

      setUploadStatus("Saving trailer...");
      setUploadProgress(95);

      const token = localStorage.getItem("token");
      const endpoint = isEditMode
        ? `${API_BASE_URL}/trailer/update/${editingData._id || editingData.id}`
        : `${API_BASE_URL}/trailer/create`;

      console.log("📍 Using endpoint:", endpoint);

      const response = await fetch(endpoint, {
        method: isEditMode ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Operation failed");
      }

      const result = await response.json();
      setUploadProgress(100);
      setUploadStatus("Complete!");

      toast.success(
        isEditMode 
          ? "Trailer updated successfully!" 
          : "Trailer created successfully! Video is ready to watch."
      );

      setUploadingVideo(false);
      setUploadProgress(0);
      setUploadStatus("");
      setProcessingStatus("");
      onSave?.(submitData);
      onClose();
    } catch (error) {
      setUploadingVideo(false);
      setUploadStatus("");
      setProcessingStatus("");
      console.error("Upload error:", error);
      toast.error(error?.message || "Operation failed");
    }
  };

  const removeFile = (fileType) => {
    if (fileType === "video") {
      setVideoFile(null);
      setVideoDurationSeconds(0);
      setFormData((prev) => ({ ...prev, duration: "" }));
    } else {
      setThumbnailFile(null);
      if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      const originalThumbnail = editingData?.thumbnail_url || editingData?.thumbnailUrl;
      setThumbnailPreview(originalThumbnail ? getVideoAndThumbnail(originalThumbnail) : null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FFFFFF3B] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {isEditMode ? "Edit Trailer" : "Upload New Trailer"}
          </DialogTitle>
        </DialogHeader>

        {/* Upload Progress - Enhanced */}
        {uploadingVideo && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              {uploadProgress < 100 ? (
                <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-400" />
              )}
              <div className="flex-1">
                <p className="font-medium text-blue-300">{uploadStatus}</p>
                {processingStatus && (
                  <p className="text-sm text-blue-400 mt-1 flex items-center gap-2">
                    <Video className="h-4 w-4 animate-pulse" />
                    {processingStatus}
                  </p>
                )}
              </div>
            </div>
            <div className="w-full bg-blue-900/50 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-blue-400 mt-2">{uploadProgress}% complete</p>
          </div>
        )}

        <div className="space-y-5">
          {/* Title and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label className="block text-sm font-semibold text-white/80 mb-2">
                Trailer Title <span className="text-red-400">*</span>
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter trailer title"
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
                Duration (MM:SS) <span className="text-red-400">*</span>
              </Label>
              <Input
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                placeholder="e.g., 2:30"
                disabled={uploadingVideo}
                className={`w-full px-4 py-3 border-2 border-slate-200/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/5 text-white placeholder:text-white/40 ${
                  errors.duration ? "border-red-500" : ""
                }`}
              />
              {errors.duration && (
                <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.duration}
                </p>
              )}
            </div>
          </div>

          {/* Content Name and Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <Label className="block text-sm font-semibold text-white/80 mb-2">
                Content Name
              </Label>
              <Input
                value={formData.contentName}
                onChange={(e) => handleInputChange("contentName", e.target.value)}
                placeholder="Enter content name"
                disabled={uploadingVideo}
                className="w-full px-4 py-3 border-2 border-slate-200/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div>
              <Label className="block text-sm font-semibold text-white/80 mb-2">
                Color
              </Label>
              <div className="flex gap-3 items-center">
                <div className="relative">
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange("color", e.target.value)}
                    className="h-12 w-20 border-2 border-slate-200/30 rounded-lg cursor-pointer bg-transparent opacity-0 absolute inset-0 z-10"
                    disabled={uploadingVideo}
                  />
                  <div
                    className="h-12 w-20 rounded-lg border-2 border-white/30 shadow-inner cursor-pointer transition-all hover:border-white/50"
                    style={{ backgroundColor: formData.color }}
                  />
                </div>
                <div className="flex-1 px-4 py-3 border-2 border-slate-200/30 rounded-lg bg-white/5 flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white/30 shadow-md flex-shrink-0"
                    style={{ backgroundColor: formData.color }}
                  />
                  <span className="text-white font-medium">{formData.color.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="block text-sm font-semibold text-white/80 mb-2">
              Description
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter trailer description..."
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
                        id="trailer-video-upload"
                        disabled={uploadingVideo}
                      />
                      <label
                        htmlFor="trailer-video-upload"
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
              <input
                type="file"
                onChange={(e) => handleFileChange(e, "thumbnail")}
                accept="image/*"
                className="hidden"
                id="trailer-thumbnail-upload"
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
                    <label htmlFor="trailer-thumbnail-upload" className="cursor-pointer block">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="h-32 mx-auto rounded-lg object-cover shadow-lg border border-white/10 hover:opacity-80 transition-opacity"
                      />
                      <p className="text-xs text-white/50 mt-2">Click to change</p>
                    </label>
                    {thumbnailFile && (
                      <>
                        <p className="text-sm text-white font-medium truncate">
                          {thumbnailFile.name}
                        </p>
                        <p className="text-xs text-white/50">
                          {formatFileSize(thumbnailFile.size)}
                        </p>
                      </>
                    )}
                    <div className="flex gap-2 justify-center">
                      <label
                        htmlFor="trailer-thumbnail-upload"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg cursor-pointer hover:bg-blue-500/30 font-medium transition-all border border-blue-500/30 text-sm"
                      >
                        <Upload className="h-4 w-4" />
                        Change
                      </label>
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
                      Drag and drop thumbnail
                    </p>
                    <p className="text-xs text-white/40 mb-4">
                      JPG, PNG, WEBP (Max 5MB)
                    </p>
                    <label
                      htmlFor="trailer-thumbnail-upload"
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
                <strong>Note:</strong> Video cannot be changed after upload. Update thumbnail and details only.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <Button
              onClick={onClose}
              disabled={uploadingVideo}
              variant="outline"
              className="px-6 py-5 border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={uploadingVideo}
              className="px-6 py-5 bg-primary hover:bg-primary/80"
            >
              {uploadingVideo
                ? `${uploadProgress < 80 ? 'Uploading' : uploadProgress < 100 ? 'Processing' : 'Saving'}... ${uploadProgress}%`
                : isEditMode
                ? "Update Trailer"
                : "Upload Trailer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrailerUploadModal;
