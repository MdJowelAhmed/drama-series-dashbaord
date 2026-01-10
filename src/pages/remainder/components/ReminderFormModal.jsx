import { useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getImageUrl } from "@/components/share/imageUrl";
import { initialFormState } from "../constants";

const ReminderFormModal = ({
  isOpen,
  onClose,
  onSave,
  editingReminder,
  isLoading,
}) => {
  const [formData, setFormData] = useState(initialFormState);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingReminder) {
        // Format datetime for input
        const formattedTime = editingReminder.reminderTime
          ? new Date(editingReminder.reminderTime).toISOString().slice(0, 16)
          : "";

        setFormData({
          name: editingReminder.name || "",
          description: editingReminder.description || "",
          reminderTime: formattedTime,
          thumbnail: null,
          thumbnailPreview: editingReminder.thumbnail
            ? getImageUrl(editingReminder.thumbnail)
            : null,
        });
      } else {
        setFormData(initialFormState);
      }
    }
  }, [editingReminder, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (file) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({
          ...prev,
          thumbnail: file,
          thumbnailPreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = (e) => {
    e?.stopPropagation();
    setFormData((prev) => ({
      ...prev,
      thumbnail: null,
      thumbnailPreview: null,
    }));
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter a reminder name");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter a description");
      return;
    }
    if (!formData.reminderTime) {
      toast.error("Please select a reminder time");
      return;
    }
    if (!editingReminder && !formData.thumbnail && !formData.thumbnailPreview) {
      toast.error("Please upload a thumbnail image");
      return;
    }

    onSave(formData, editingReminder?._id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FFFFFF3B] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-accent">
            {editingReminder ? "Edit Reminder" : "Create New Reminder"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter reminder name (e.g., Drink Water)"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter reminder description"
              rows={3}
            />
          </div>

          {/* Reminder Time */}
          <div>
            <Label htmlFor="reminderTime">
              Reminder Time <span className="text-red-500">*</span>
            </Label>
            <Input
              id="reminderTime"
              name="reminderTime"
              type="datetime-local"
              value={formData.reminderTime}
              onChange={handleInputChange}
            />
          </div>

          {/* Thumbnail Upload */}
          <div>
            <Label>
              Thumbnail <span className="text-red-500">*</span>
            </Label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() =>
                document.getElementById("reminder-file-upload").click()
              }
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-white/40 hover:border-accent"
              }`}
            >
              {formData.thumbnailPreview ? (
                <div className="space-y-3">
                  <img
                    src={formData.thumbnailPreview}
                    alt="Thumbnail preview"
                    className="mx-auto h-40 w-full object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeThumbnail}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center">
                    <Upload className="h-6 w-6 text-accent" />
                  </div>
                  <div className="text-sm text-accent">
                    <span className="text-accent hover:text-blue-700 cursor-pointer font-medium">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </div>
                  <p className="text-xs text-accent">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                </div>
              )}
              <input
                id="reminder-file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files[0])}
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : editingReminder
                ? "Update Reminder"
                : "Create Reminder"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderFormModal;
