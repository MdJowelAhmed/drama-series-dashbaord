import { useState, useEffect, useRef } from "react";
import { X, Upload, CheckCircle, Loader2, AlertCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getVideoAndThumbnail } from "../share/imageUrl";
import { baseUrl } from "@/redux/base-url/baseUrlApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

/**
 * ReusableVideoUploadModal - A dynamic video upload modal with proper thumbnail handling
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is open
 * @param {Function} props.onClose - Callback when modal closes
 * @param {Function} props.onSave - Callback when save is successful
 * @param {Object} props.editingData - Data for editing mode (null for create)
 * @param {string} props.title - Modal title (e.g., "Upload Trailer", "Upload Ad")
 * @param {Array} props.fields - Array of field configurations
 * @param {Function} props.generateUploadUrl - RTK Query mutation hook for generating upload URL
 * @param {Function} props.createMutation - RTK Query mutation hook for creating
 * @param {Function} props.updateMutation - RTK Query mutation hook for updating
 * @param {Function} props.uploadThumbnail - RTK Query mutation hook for uploading thumbnail (optional)
 * @param {boolean} props.showThumbnail - Whether to show thumbnail upload (default: true)
 * @param {boolean} props.showVideo - Whether to show video upload (default: true)
 */

const ReusableVideoUploadModal = ({
  open,
  onClose,
  onSave,
  editingData = null,
  title = "Upload Video",
  fields = [],
  generateUploadUrl,
  createMutation,
  updateMutation,
  uploadThumbnail,
  showThumbnail = true,
  showVideo = true,
}) => {
  const [formData, setFormData] = useState({});
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [dragActive, setDragActive] = useState({ video: false, thumbnail: false });
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [processingStatus, setProcessingStatus] = useState("");
  const [errors, setErrors] = useState({});
  const [duration, setDuration] = useState(0);

  // Ref to prevent double submission (synchronous guard)
  const isSubmittingRef = useRef(false);

  const isEditMode = !!editingData?._id || !!editingData?.id;

  // Initialize form data when modal opens or editingData changes
  useEffect(() => {
    if (open) {
      // Reset submitting ref when modal opens
      isSubmittingRef.current = false;

      if (editingData) {
        const initialData = {};
        fields.forEach((field) => {
          initialData[field.name] = editingData[field.name] || "";
        });
        setFormData(initialData);

        // Set existing thumbnail preview
        const existingThumbnail = editingData.thumbnail_url || editingData.thumbnailUrl;
        if (existingThumbnail) {
          setThumbnailPreview(getVideoAndThumbnail(existingThumbnail));
        }
      } else {
        const initialData = {};
        fields.forEach((field) => {
          initialData[field.name] = field.defaultValue || "";
        });
        setFormData(initialData);
        setThumbnailPreview(null);
      }
      setVideoFile(null);
      setThumbnailFile(null);
      setUploadProgress(0);
      setUploadStatus("");
      setProcessingStatus("");
      setErrors({});
      setDuration(editingData?.duration || 0);
    } else {
      // Reset submitting ref when modal closes
      isSubmittingRef.current = false;
    }
  }, [open, editingData, fields]);

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

        if (fields.some(f => f.name === "duration")) {
          const minutes = Math.floor(durationInSeconds / 60);
          const seconds = durationInSeconds % 60;
          const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;
          setFormData((prev) => ({ ...prev, duration: formatted }));
        }
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

  // 🔥 Check video processing status
  const checkVideoProcessingStatus = async (videoId, libraryId, apiKey, maxAttempts = 30) => {
    let attempts = 0;
    const checkInterval = 3000; // Check every 3 seconds

    return new Promise((resolve, reject) => {
      const intervalId = setInterval(async () => {
        attempts++;
        
        try {
          // Check video status from Bunny CDN
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

          // Update processing status UI
          if (status === 0 || status === 1) {
            // 0 = Queued, 1 = Processing
            setProcessingStatus(`Processing video... ${encodingProgress}%`);
            setUploadProgress(90 + Math.floor(encodingProgress / 10)); // 90-100%
          } else if (status === 2) {
            // 2 = Encoding Failed
            clearInterval(intervalId);
            reject(new Error("Video encoding failed"));
          } else if (status === 3 || status === 4) {
            // 3 = Finished, 4 = Resolution Finished
            setProcessingStatus("Video processing complete!");
            setUploadProgress(100);
            clearInterval(intervalId);
            
            // Wait a bit for CDN propagation
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

  // Generate upload URL to get videoId and URLs
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

    fields.forEach((field) => {
      if (field.required && !formData[field.name]?.toString().trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    if (!isEditMode && showVideo && !videoFile) {
      newErrors.video = "Video file is required";
    }
    // In edit mode, video is optional - user can update if needed

    // Require thumbnail for new uploads
    if (!isEditMode && showThumbnail && !thumbnailFile) {
      newErrors.thumbnail = "Thumbnail is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Prevent double submission using synchronous ref check
    if (isSubmittingRef.current) {
      console.log("Submission already in progress, ignoring duplicate call");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Set ref immediately (synchronous) to block any subsequent calls
      isSubmittingRef.current = true;
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
          formData.title || "Untitled"
        );
        
        if (!bunnyData.videoId) {
          toast.error("Failed to get Video ID from server. Please try again.");
          setUploadingVideo(false);
          isSubmittingRef.current = false;
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
                const percentComplete = Math.round((event.loaded / event.total) * 60) + 20; // 20-80%
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
              isSubmittingRef.current = false;
              return;
            }

            xhr.send(videoFile);
            await uploadPromise;

            // 🔥 Step 3: Wait for video processing to complete
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
              // Continue anyway - video will process in background
            }

          } catch (uploadError) {
            console.error("Video upload error:", uploadError);
            toast.error("Failed to upload video: " + uploadError.message);
            setUploadingVideo(false);
            isSubmittingRef.current = false;
            return;
          }
        }
      }

      if (!videoId) {
        toast.error("Video ID is required");
        setUploadingVideo(false);
        isSubmittingRef.current = false;
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

      // Step 5: Save data as JSON (not FormData)
      const submitData = {
        ...formData,
        duration: duration || formData.duration || 0,
        videoUrl: videoUrl || "",
        videoId: videoId,
        libraryId: libraryId || "",
        thumbnailUrl: thumbnailUrl || "",
        downloadUrls: downloadUrls,
      };

      setUploadStatus("Saving...");
      setUploadProgress(95);

      const token = localStorage.getItem("token");
      
      // Determine endpoint dynamically from title prop
      let endpoint = "";
      if (title.toLowerCase().includes("ad")) {
        endpoint = isEditMode
          ? `${API_BASE_URL}/ad/update/${editingData._id || editingData.id}`
          : `${API_BASE_URL}/ad/create`;
      } else if (title.toLowerCase().includes("trailer")) {
        endpoint = isEditMode
          ? `${API_BASE_URL}/trailer/update/${editingData._id || editingData.id}`
          : `${API_BASE_URL}/trailer/create`;
      } else {
        // Default fallback
        endpoint = isEditMode
          ? `${API_BASE_URL}/video-management/update/${editingData._id || editingData.id}`
          : `${API_BASE_URL}/video-management/create`;
      }

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
          ? "Updated successfully!" 
          : "Created successfully! Video is ready to watch."
      );

      setUploadingVideo(false);
      setUploadProgress(0);
      setUploadStatus("");
      setProcessingStatus("");
      isSubmittingRef.current = false;
      onSave?.(submitData);
      onClose();
    } catch (error) {
      setUploadingVideo(false);
      setUploadStatus("");
      setProcessingStatus("");
      isSubmittingRef.current = false;
      console.error("Upload error:", error);
      toast.error(error?.message || "Operation failed");
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
      // Reset to original thumbnail if in edit mode
      const originalThumbnail = editingData?.thumbnail_url || editingData?.thumbnailUrl;
      setThumbnailPreview(originalThumbnail ? getVideoAndThumbnail(originalThumbnail) : null);

      // Clear thumbnail error if exists
      if (errors.thumbnail) {
        setErrors((prev) => ({ ...prev, thumbnail: null }));
      }
    }
  };

  const renderField = (field) => {
    const commonProps = {
      id: field.name,
      value: formData[field.name] || "",
      onChange: (e) => handleInputChange(field.name, e.target.value),
      placeholder: field.placeholder,
      disabled: uploadingVideo,
      className: `w-full px-4 py-3 border-2 border-slate-200/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/5 text-white placeholder:text-white/40 ${errors[field.name] ? "border-red-500" : ""
        }`,
    };

    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            {...commonProps}
            rows={field.rows || 4}
            className={`${commonProps.className} resize-none`}
          />
        );
      case "url":
        return (
          <div className="relative">
            {field.icon && (
              <field.icon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
            )}
            <Input
              {...commonProps}
              type="url"
              className={`${commonProps.className} ${field.icon ? "pl-12" : ""}`}
            />
          </div>
        );
      case "color":
        const colorValue = formData[field.name] || field.defaultValue || "#3b82f6";
        return (
          <div className="flex gap-3 items-center">
            <div className="relative">
              <Input
                type="color"
                value={colorValue}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                className="h-12 w-20 border-2 border-slate-200/30 rounded-lg cursor-pointer bg-transparent opacity-0 absolute inset-0 z-10"
                disabled={uploadingVideo}
              />
              {/* Color Preview Box */}
              <div
                className="h-12 w-20 rounded-lg border-2 border-white/30 shadow-inner cursor-pointer transition-all hover:border-white/50"
                style={{ backgroundColor: colorValue }}
              />
            </div>
            {/* Color Preview with Hex Value */}
            <div
              className="flex-1 px-4 py-3 border-2 border-slate-200/30 rounded-lg bg-white/5 flex items-center gap-3"
            >
              <div
                className="w-6 h-6 rounded-full border-2 border-white/30 shadow-md flex-shrink-0"
                style={{ backgroundColor: colorValue }}
              />
              <span className="text-white font-medium">{colorValue.toUpperCase()}</span>
            </div>
          </div>
        );
      case "number":
        return <Input {...commonProps} type="number" min={field.min || 0} />;
      default:
        return <Input {...commonProps} type="text" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FFFFFF3B] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {isEditMode ? `Edit ${title.replace("Upload ", "")}` : title}
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
          {/* Dynamic Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {fields.map((field) => (
              <div
                key={field.name}
                className={field.gridCols === 2 ? "md:col-span-2" : ""}
              >
                <Label className="block text-sm font-semibold text-white/80 mb-2">
                  {field.label} {field.required && <span className="text-red-400">*</span>}
                </Label>
                {renderField(field)}
                {errors[field.name] && (
                  <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* File Upload Section */}
          {(showVideo || showThumbnail) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Video Upload */}
              {showVideo && (
                <div>
                  <Label className="block text-sm font-semibold text-white/80 mb-2">
                    Video File {!isEditMode && <span className="text-red-400">*</span>}
                  </Label>
                  <div
                    onDragEnter={(e) => handleDrag(e, "video")}
                    onDragLeave={(e) => handleDrag(e, "video")}
                    onDragOver={(e) => handleDrag(e, "video")}
                    onDrop={(e) => handleDrop(e, "video")}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive.video
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
                          id="video-upload"
                          disabled={uploadingVideo}
                        />
                        <label
                          htmlFor="video-upload"
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
              {showThumbnail && (
                <div className={!showVideo || isEditMode ? "md:col-span-2" : ""}>
                  <Label className="block text-sm font-semibold text-white/80 mb-2">
                    Thumbnail Image {!isEditMode && <span className="text-red-400">*</span>}
                  </Label>
                  {/* Hidden file input - always available */}
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, "thumbnail")}
                    accept="image/*"
                    className="hidden"
                    id="thumbnail-upload"
                    disabled={uploadingVideo}
                  />
                  <div
                    onDragEnter={(e) => handleDrag(e, "thumbnail")}
                    onDragLeave={(e) => handleDrag(e, "thumbnail")}
                    onDragOver={(e) => handleDrag(e, "thumbnail")}
                    onDrop={(e) => handleDrop(e, "thumbnail")}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${dragActive.thumbnail
                      ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
                      : errors.thumbnail
                        ? "border-red-500/50 bg-red-500/5"
                        : "border-white/20 hover:border-white/40 bg-white/5"
                      }`}
                  >
                    {thumbnailPreview || thumbnailFile ? (
                      <div className="space-y-3">
                        {/* Clickable thumbnail preview */}
                        <label htmlFor="thumbnail-upload" className="cursor-pointer block">
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
                            htmlFor="thumbnail-upload"
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
                          htmlFor="thumbnail-upload"
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
              )}
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
                ? `${uploadProgress < 80 ? 'Uploading' : uploadProgress < 100 ? 'Processing' : 'Saving'}... ${uploadProgress}%`
                : isEditMode
                ? "Update"
                : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReusableVideoUploadModal;