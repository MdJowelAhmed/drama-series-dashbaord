import React, { useRef, useState, useEffect } from "react";
import { Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLoginPageMutation } from "@/redux/feature/loginPage";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const buildImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${apiBaseUrl}${path}`;
};

const LoginImageModal = ({ open, onClose, onSuccess, existingImages = [] }) => {
  const [keptExistingImages, setKeptExistingImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [updateLoginImages, { isLoading }] = useLoginPageMutation();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setKeptExistingImages([...existingImages]);
      setFiles([]);
      setPreviewUrls([]);
      fileInputRef.current && (fileInputRef.current.value = "");
    }
  }, [open, existingImages]);

  const handleRemoveExisting = (indexToRemove) => {
    setKeptExistingImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleRemoveNewFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
    setPreviewUrls((prev) => {
      const url = prev[indexToRemove];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== indexToRemove);
    });
  };

  const handleFilesSelected = (fileList) => {
    const selectedFiles = Array.from(fileList || []);
    if (!selectedFiles.length) return;

    setFiles((prev) => [...prev, ...selectedFiles]);
    setPreviewUrls((prev) => [
      ...prev,
      ...selectedFiles.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleInputChange = (event) => {
    handleFilesSelected(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleFilesSelected(event.dataTransfer.files);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleSubmit = async () => {
    if (!keptExistingImages.length && !files.length) return;

    const formData = new FormData();

    // Fetch existing images and convert to File, then add to formData
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    for (const path of keptExistingImages) {
      try {
        const url = buildImageUrl(path);
        const res = await fetch(url, { headers });
        if (!res.ok) continue;
        const blob = await res.blob();
        const fileName = path.split("/").pop() || `existing-${Date.now()}.jpg`;
        const file = new File([blob], fileName, { type: blob.type || "image/jpeg" });
        formData.append("images", file);
      } catch (err) {
        console.warn("Could not fetch existing image:", path, err);
      }
    }

    files.forEach((file) => {
      formData.append("images", file);
    });
    formData.append(
      "data",
      JSON.stringify({
        key: "login",
        type: "image",
      })
    );

    try {
      await updateLoginImages(formData).unwrap();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update login images", error);
    }
  };

  const handleClose = () => {
    setKeptExistingImages([]);
    setFiles([]);
    setPreviewUrls((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return [];
    });
    onClose();
  };

  const hasImages = keptExistingImages.length > 0 || files.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl bg-[#FFFFFF3B] backdrop-blur-lg border-white/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-accent">
            Update Login Images
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-accent/10">
                <Upload className="h-6 w-6 text-accent" />
              </div>
              <p className="text-sm text-accent font-medium">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400">
                You can select multiple images. They will all be shown on the login page.
              </p>
            </div>
            <input
              ref={fileInputRef}
              id="login-images-input"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleInputChange}
            />
          </div>

          {(keptExistingImages.length > 0 || previewUrls.length > 0) && (
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {keptExistingImages.map((imgPath, idx) => (
                <div key={`existing-${idx}`} className="relative">
                  <img
                    src={buildImageUrl(imgPath)}
                    alt={`Existing ${idx + 1}`}
                    className="h-32 w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExisting(idx)}
                    className="absolute top-1 right-1 p-1.5 rounded-full bg-red-500/90 hover:bg-red-500 text-white transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {previewUrls.map((src, idx) => (
                <div key={`new-${idx}`} className="relative">
                  <img
                    src={src}
                    alt={`New ${idx + 1}`}
                    className="h-32 w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveNewFile(idx)}
                    className="absolute top-1 right-1 p-1.5 rounded-full bg-red-500/90 hover:bg-red-500 text-white transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" onClick={handleSubmit} disabled={isLoading || !hasImages}>
              {isLoading ? "Uploading..." : "Update Images"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginImageModal;

