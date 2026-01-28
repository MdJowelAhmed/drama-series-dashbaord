import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLoginPageMutation } from "@/redux/feature/loginPage";

const LoginImageModal = ({ open, onClose, onSuccess }) => {
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [updateLoginImages, { isLoading }] = useLoginPageMutation();
  const fileInputRef = useRef(null);

  const handleFilesSelected = (fileList) => {
    const selectedFiles = Array.from(fileList || []);
    if (!selectedFiles.length) return;

    setFiles(selectedFiles);
    setPreviewUrls(selectedFiles.map((file) => URL.createObjectURL(file)));
  };

  const handleInputChange = (event) => {
    handleFilesSelected(event.target.files);
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
    if (!files.length) return;

    const formData = new FormData();
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
    setFiles([]);
    setPreviewUrls([]);
    onClose();
  };

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

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {previewUrls.map((src, idx) => (
                <img
                  key={idx}
                  src={src}
                  alt={`Preview ${idx + 1}`}
                  className="h-32 w-full rounded-lg object-cover"
                />
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            {/* <Button variant="outline" type="button" onClick={handleClose}>
              Cancel
            </Button> */}
            <Button type="button" onClick={handleSubmit} disabled={isLoading || !files.length}>
              {isLoading ? "Uploading..." : "Update Images"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginImageModal;

