import { useState, useEffect, useRef } from "react";
import { X, Upload, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getVideoAndThumbnail } from "../share/imageUrl";
import { baseUrl } from "@/redux/base-url/baseUrlApi";

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
  const [errors, setErrors] = useState({});

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
      setErrors({});
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
        const duration = Math.floor(video.duration);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;

        if (fields.some(f => f.name === "duration")) {
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

        const { videoId, uploadUrl, apiKey, embedUrl, libraryId, id, _id, downloadUrls } = result.data;

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
              dbId: _id || id,
              downloadUrls: downloadUrls || {},
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

    fields.forEach((field) => {
      if (field.required && !formData[field.name]?.toString().trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    if (!isEditMode && showVideo && !videoFile) {
      newErrors.video = "Video file is required";
    }

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
      let videoId = editingData?.videoId || editingData?.video_id;
      let libraryId = editingData?.libraryId || editingData?.library_id;
      let thumbnailUrl = editingData?.thumbnail_url || editingData?.thumbnailUrl;
      let downloadUrls = editingData?.downloadUrls || editingData?.download_urls || {};
      let createdDbId = null;

      // Upload video if new file selected
      if (videoFile && generateUploadUrl) {
        const bunnyData = await uploadVideoToBunnyStream(
          videoFile,
          formData.title || "Untitled"
        );
        videoUrl = bunnyData.videoUrl;
        videoId = bunnyData.videoId;
        libraryId = bunnyData.libraryId;
        createdDbId = bunnyData.dbId;
        downloadUrls = bunnyData.downloadUrls || {};
      }

      // Handle thumbnail upload - Use native fetch for reliable FormData handling
      if (thumbnailFile && videoId) {
        setUploadStatus("Uploading thumbnail...");

        try {
          // Create FormData with the thumbnail file
          const formDataToSend = new FormData();
          formDataToSend.append("thumbnail", thumbnailFile, thumbnailFile.name);

          console.log("Uploading thumbnail for videoId:", videoId);
          console.log("Thumbnail file details:", {
            name: thumbnailFile.name,
            size: thumbnailFile.size,
            type: thumbnailFile.type
          });

          // Get auth token
          const token = localStorage.getItem("token");

          // Use native fetch for FormData upload - more reliable than RTK Query
          const response = await fetch(
            `${baseUrl}/trailer/${videoId}/thumbnail`,
            // `http://10.10.7.48:5003/api/v1/trailer/${videoId}/thumbnail`,
            {
              method: "POST",
              headers: {
                // Don't set Content-Type - browser sets it with boundary for FormData
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

          // Extract thumbnail URL from response - check various possible paths
          thumbnailUrl = thumbnailResult.data?.result ||
            thumbnailResult.data?.thumbnail_url ||
            thumbnailResult.data?.url ||
            thumbnailResult.thumbnailUrl ||
            thumbnailResult.thumbnail_url ||
            thumbnailResult.url;

          if (thumbnailUrl) {
            toast.success("Thumbnail uploaded successfully");
            console.log("Thumbnail URL:", thumbnailUrl);
          } else {
            console.warn("Thumbnail uploaded but URL not found in response:", thumbnailResult);
          }
        } catch (error) {
          console.error("Thumbnail upload failed:", error);
          const errorMsg = error?.message || "Upload failed";
          toast.error("Thumbnail upload failed: " + errorMsg);
          // Don't continue if thumbnail is required but failed
          setUploadingVideo(false);
          isSubmittingRef.current = false;
          return;
        }
      } else if (thumbnailFile && !videoId) {
        console.error("Cannot upload thumbnail without videoId");
        toast.error("Cannot upload thumbnail: Video ID is missing");
        setUploadingVideo(false);
        isSubmittingRef.current = false;
        return;
      }

      // Prepare submit data
      const submitData = {
        ...formData,
        videoUrl: videoUrl,
        video_url: videoUrl,
        videoId: videoId,
        libraryId: libraryId,
        downloadUrls: downloadUrls,
        download_urls: downloadUrls,
      };

      // Only include thumbnail if we have a valid CDN URL (not blob)
      if (thumbnailUrl && !thumbnailUrl.startsWith("blob:")) {
        submitData.thumbnailUrl = thumbnailUrl;
        submitData.thumbnail_url = thumbnailUrl;
      } else if (showThumbnail && !isEditMode) {
        // For new uploads without thumbnail URL, show error
        toast.error("Thumbnail is required but URL is missing");
        setUploadingVideo(false);
        isSubmittingRef.current = false;
        return;
      }

      setUploadStatus("Saving...");

      if (isEditMode) {
        if (updateMutation) {
          await updateMutation({
            id: editingData._id || editingData.id,
            updatedData: submitData,
          }).unwrap();
        }
        toast.success("Updated successfully!");
      } else {
        // If we have a createdDbId from the upload step, we should UPDATE that record
        if (createdDbId && updateMutation) {
          await updateMutation({
            id: createdDbId,
            updatedData: submitData,
          }).unwrap();
          toast.success("Created successfully!");
        } else if (createMutation) {
          await createMutation(submitData).unwrap();
          toast.success("Created successfully!");
        }
      }

      setUploadingVideo(false);
      setUploadProgress(0);
      setUploadStatus("");
      isSubmittingRef.current = false;
      onSave?.(submitData);
      onClose();
    } catch (error) {
      setUploadingVideo(false);
      setUploadStatus("");
      isSubmittingRef.current = false;
      console.error("Upload error:", error);
      const errorMessage = error?.data?.message || error?.message || "Operation failed";
      toast.error(errorMessage);
    }
  };

  const removeFile = (fileType) => {
    if (fileType === "video") {
      setVideoFile(null);
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFFFF3B] border border-white/10 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">
            {isEditMode ? `Edit ${title.replace("Upload ", "")}` : title}
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
              {showVideo && !isEditMode && (
                <div>
                  <Label className="block text-sm font-semibold text-white/80 mb-2">
                    Video File <span className="text-red-400">*</span>
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

          {/* Edit Mode Note */}
          {isEditMode && showVideo && (
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
                  ? "Update"
                  : "Upload"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReusableVideoUploadModal;