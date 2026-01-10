import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * SeasonFormModal - Modal for creating/editing drama seasons
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is open
 * @param {Function} props.onClose - Callback when modal closes
 * @param {Function} props.onSave - Callback when save is successful (receives season data)
 * @param {Object} props.editingData - Data for editing mode (null for create)
 * @param {string} props.movieId - The movie/drama ID from URL
 * @param {number} props.nextSeasonNumber - Next season number for auto-fill
 * @param {boolean} props.isLoading - Loading state for submit button
 */
const SeasonFormModal = ({
  open,
  onClose,
  onSave,
  editingData = null,
  movieId,
  nextSeasonNumber = 1,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    seasonNumber: nextSeasonNumber,
    description: "",
  });
  const [errors, setErrors] = useState({});

  const isEditMode = !!editingData?._id || !!editingData?.id;

  // Initialize form data when modal opens or editingData changes
  useEffect(() => {
    if (open) {
      if (editingData) {
        setFormData({
          title: editingData.title || "",
          seasonNumber: editingData.seasonNumber || nextSeasonNumber,
          description: editingData.description || "",
        });
      } else {
        setFormData({
          title: `Season ${nextSeasonNumber}`,
          seasonNumber: nextSeasonNumber,
          description: "",
        });
      }
      setErrors({});
    }
  }, [open, editingData, nextSeasonNumber]);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.seasonNumber || formData.seasonNumber < 1) {
      newErrors.seasonNumber = "Season number must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    // Prepare data according to API requirements
    const submitData = {
      title: formData.title.trim(),
      seasonNumber: parseInt(formData.seasonNumber, 10),
      movieId: movieId,
      description: formData.description?.trim() || "",
    };

    onSave(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-[#FFFFFF3B] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {isEditMode ? "Edit Season" : "Create New Season"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Title Field */}
          <div>
            <Label className="block text-sm font-semibold text-white/80 mb-2">
              Season Title <span className="text-red-400">*</span>
            </Label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="e.g., Season 1"
              disabled={isLoading}
              className={`w-full px-4 py-3 border-2 border-slate-200/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/5 text-white placeholder:text-white/40 ${
                errors.title ? "border-red-500" : ""
              }`}
            />
            {errors.title && (
              <p className="text-sm text-red-400 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Season Number Field */}
          <div>
            <Label className="block text-sm font-semibold text-white/80 mb-2">
              Season Number <span className="text-red-400">*</span>
            </Label>
            <Input
              type="number"
              min="1"
              value={formData.seasonNumber}
              onChange={(e) => handleInputChange("seasonNumber", e.target.value)}
              placeholder="1"
              disabled={isLoading}
              className={`w-full px-4 py-3 border-2 border-slate-200/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/5 text-white placeholder:text-white/40 ${
                errors.seasonNumber ? "border-red-500" : ""
              }`}
            />
            {errors.seasonNumber && (
              <p className="text-sm text-red-400 mt-1">{errors.seasonNumber}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <Label className="block text-sm font-semibold text-white/80 mb-2">
              Description
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter season description..."
              rows={4}
              disabled={isLoading}
              className="w-full px-4 py-3 border-2 border-slate-200/30 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white/5 text-white placeholder:text-white/40 resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <p className="text-sm text-blue-300">
              <strong>Note:</strong> This season will be added to the current drama. You can upload episodes after creating the season.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <Button
              onClick={onClose}
              disabled={isLoading}
              variant="outline"
              className="px-6 py-5 border-white/20 text-white hover:bg-white/10 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-5 bg-primary hover:bg-primary/80"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditMode ? "Update Season" : "Create Season"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SeasonFormModal;

