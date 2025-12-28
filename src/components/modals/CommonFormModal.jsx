import React, { useEffect, useState } from "react";
import { X, Tag, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// const VIDEO_TYPES = [
//   "Science Fiction",
//   "Romantic",
//   "War",
//   "History",
//   "Action",
//   "Comedy",
//   "Drama",
//   "Thriller",
//   "Horror",
//   "Mystery",
//   "Fantasy",
//   "Adventure",
//   "Crime",
//   "Biography",
//   "Documentary",
//   "Animation",
//   "Musical",
//   "Western",
//   "Superhero",
//   "Noir",
// ];

const CommonFormModal = ({
  title,
  categories,
  data,
  onClose,
  onSave,
  showStatus = false,
  showGenre = false,
  showVideoFields = false,
}) => {
  const [categoryId, setCategoryId] = useState(data?.categoryId?._id || data?.categoryId || "");
  console.log(categories);
  const [formData, setFormData] = useState({
    title: data?.title || "",
    description: data?.description || "",
    genre: data?.genre || "",
    status: data?.status || "Ongoing",
    tags: data?.tags || [],
    color: data?.accentColor || data?.color || "#3b82f6",
    thumbnail: data?.thumbnail || data?.thumbnail_url || null,
    thumbnailFile: null, // Store actual file for API upload
    contentName: data?.contentName || "",
    categoryId: data?.categoryId?._id || data?.categoryId || "",
  });

  const [tagInput, setTagInput] = useState("");
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, categoryId }));
  }, [categoryId]);

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
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        thumbnail: reader.result,
        thumbnailFile: file, // Store actual file for API upload
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFFFF3B] rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-accent">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter title"
              />
            </div>

            <div>
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                value={formData.genre}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, genre: e.target.value }))
                }
                placeholder="e.g., Action, Drama, Comedy"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text- mb-1">
                Category *
              </label>

              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full px-4 py-[22px] border border-white/40 rounded-md focus:ring-4 focus:ring-accent-foreground focus:border-blue-500 outline-none transition-all  text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-3">
                <Input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddTag())
                  }
                  placeholder="Type a tag and press Enter"
                />
                <Button onClick={handleAddTag} type="button" className="h-12">
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, idx) => (
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
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {" "}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="contentName">Top Banner </Label>
              <Input
                id="contentName"
                value={formData.contentName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    contentName: e.target.value,
                  }))
                }
                placeholder="Enter top banner "
              />
            </div>
            <div>
              <Label>Accent Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, color: e.target.value }))
                  }
                  className="w-12 h-10 p-0 border-0 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color.toUpperCase()}
                  onChange={(e) => {
                    const v = e.target.value;
                    const normalized = v.startsWith("#") ? v : `#${v}`;
                    setFormData((prev) => ({ ...prev, color: normalized }));
                  }}
                  className="px-3 py-2 border rounded-md w-28"
                />
                {/* <div
                  className="w-8 h-8 rounded-full shadow-sm"
                  style={{ backgroundColor: formData.color }}
                /> */}
                {/* <p className="text-xs text-slate-500">Preview & HEX</p> */}
              </div>
            </div>
          </div>

          <div>
            <Label>Thumbnail</Label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload").click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-300 hover:border-blue-500"
              }`}
            >
              {formData.thumbnail ? (
                <div className="space-y-3">
                  <img
                    src={formData.thumbnail}
                    alt="Preview"
                    className="mx-auto h-40 w-full object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData((prev) => ({
                        ...prev,
                        thumbnail: null,
                        thumbnailFile: null,
                      }));
                    }}
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
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files[0])}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.title.trim()}>
              {data ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommonFormModal;
