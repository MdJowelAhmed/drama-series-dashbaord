import { useState, useEffect } from "react";
import { Upload, CheckCircle, Loader2, AlertCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

const AdUploadModal = ({
  open,
  onClose,
  onSave,
  editingData = null,
  generateUploadUrl,
}) => {
  const [formData, setFormData] = useState({
    name: "",
  });
  const [videoFile, setVideoFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [processingStatus, setProcessingStatus] = useState("");
  const [errors, setErrors] = useState({});
  const [duration, setDuration] = useState(0);

  const isEditMode = !!editingData?._id || !!editingData?.id;

  useEffect(() => {
    if (open) {
      if (editingData) {
        setFormData({
          name: editingData.name || editingData.title || "",
        });
        setDuration(editingData.duration || 0);
      } else {
        setFormData({
          name: "",
        });
        setDuration(0);
      }
      setVideoFile(null);
      setUploadProgress(0);
      setUploadStatus("");
      setProcessingStatus("");
      setErrors({});
    }
  }, [open, editingData]);

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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
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
      setDuration(durationInSeconds);
    };
    video.src = URL.createObjectURL(file);
    toast.success("Video selected successfully");
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // 🔥 Check video processing status
  const checkVideoProcessingStatus = async (videoId, libraryId, apiKey, maxAttempts = 30) => {
    let attempts = 0;
    const checkInterval = 3000;

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
    
    if (!formData.name?.trim()) {
      newErrors.name = "Ad name is required";
    }

    if (!isEditMode && !videoFile) {
      newErrors.video = "Video file is required";
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
      let downloadUrls = editingData?.downloadUrls || editingData?.download_urls || {};

      // Step 1: Generate upload URL if new video
      if (videoFile && generateUploadUrl) {
        const bunnyData = await getVideoUploadUrls(
          videoFile,
          formData.name || "Untitled Ad"
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

      // Step 4: Save ad data
      const submitData = {
        name: formData.name.trim(),
        duration: duration,
        videoUrl: videoUrl || "",
        videoId: videoId,
        libraryId: libraryId || "",
        downloadUrls: downloadUrls,
      };

      setUploadStatus("Saving ad...");
      setUploadProgress(95);

      const token = localStorage.getItem("token");
      const response = await fetch(
        isEditMode
          ? `${API_BASE_URL}/ad-management/update/${editingData._id || editingData.id}`
          : `${API_BASE_URL}/ad-management/create`,
        {
          method: isEditMode ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(submitData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Operation failed");
      }

      const result = await response.json();
      setUploadProgress(100);
      setUploadStatus("Complete!");

      toast.success(
        isEditMode 
          ? "Ad updated successfully!" 
          : "Ad created successfully! Video is ready to watch."
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

  const removeFile = () => {
    setVideoFile(null);
    setDuration(0);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FFFFFF3B] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {isEditMode ? "Edit Ad" : "Upload New Ad"}
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
          {/* Ad Name */}
          <div>
            <Label className="block text-sm font-semibold text-white/80 mb-2">
              Ad Name <span className="text-red-400">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter ad name"
              disabled={uploadingVideo}
              className={`w-full px-4 py-3 border-2 border-slate-200/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/5 text-white placeholder:text-white/40 ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="text-sm text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Video Upload */}
          {!isEditMode && (
            <div>
              <Label className="block text-sm font-semibold text-white/80 mb-2">
                Video File <span className="text-red-400">*</span>
              </Label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive
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
                      onClick={removeFile}
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
                      onChange={handleFileChange}
                      accept="video/*"
                      className="hidden"
                      id="ad-video-upload"
                      disabled={uploadingVideo}
                    />
                    <label
                      htmlFor="ad-video-upload"
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

          {/* Edit Mode Note */}
          {isEditMode && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-sm text-blue-300">
                <strong>Note:</strong> Video cannot be changed after upload. Update ad name only.
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
                ? "Update Ad"
                : "Upload Ad"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdUploadModal;
