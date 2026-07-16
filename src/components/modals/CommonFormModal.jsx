import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, Tag, Upload, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetSubcategoriesByCategoryQuery } from "@/redux/feature/subcategoryApi";

const isLibraryCategory = (category) =>
  (category?.name || "").trim().toLowerCase() === "library";

const getInitialCategoryIds = (data) => {
  if (data?.categoryIds?.length) {
    return data.categoryIds.map((c) =>
      typeof c === "object" ? c._id : c
    );
  }
  if (data?.categories?.length) {
    return data.categories.map((c) => c._id || c);
  }
  if (data?.categoryId) {
    const id = data.categoryId?._id || data.categoryId;
    return id ? [id] : [];
  }
  return [];
};

const getInitialSubCategoryIds = (data) => {
  if (data?.subCategoryIds?.length) {
    return data.subCategoryIds.map((s) =>
      typeof s === "object" ? s._id : s
    );
  }
  if (data?.subCategories?.length) {
    return data.subCategories.map((s) => (typeof s === "object" ? s._id : s));
  }
  return [];
};

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
  const [categoryIds, setCategoryIds] = useState(() =>
    getInitialCategoryIds(data)
  );
  const [subCategoryIds, setSubCategoryIds] = useState(() =>
    getInitialSubCategoryIds(data)
  );
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
    categoryIds: getInitialCategoryIds(data),
    subCategoryIds: getInitialSubCategoryIds(data),
  });

  const [dragActive, setDragActive] = useState(false);
  const categoryTriggerRef = useRef(null);
  const subCategoryTriggerRef = useRef(null);
  const [categoryMenuWidth, setCategoryMenuWidth] = useState(undefined);
  const [subCategoryMenuWidth, setSubCategoryMenuWidth] = useState(undefined);

  const selectedLibraryCategory = useMemo(
    () =>
      categories?.find(
        (cat) => categoryIds.includes(cat._id) && isLibraryCategory(cat)
      ) || null,
    [categories, categoryIds]
  );
  const isLibrarySelected = Boolean(selectedLibraryCategory);

  const {
    data: subcategoryResponse,
    isFetching: isFetchingSubcategories,
  } = useGetSubcategoriesByCategoryQuery(selectedLibraryCategory?._id, {
    skip: !selectedLibraryCategory?._id,
  });
  const availableSubcategories = subcategoryResponse?.data || [];

  useEffect(() => {
    setFormData((prev) => ({ ...prev, categoryIds }));
  }, [categoryIds]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, subCategoryIds }));
  }, [subCategoryIds]);

  useEffect(() => {
    if (!isLibrarySelected && subCategoryIds.length > 0) {
      setSubCategoryIds([]);
    }
  }, [isLibrarySelected, subCategoryIds.length]);

  useEffect(() => {
    if (!availableSubcategories.length) return;
    const validIds = new Set(availableSubcategories.map((s) => s._id));
    setSubCategoryIds((prev) => {
      const filtered = prev.filter((id) => validIds.has(id));
      return filtered.length === prev.length ? prev : filtered;
    });
  }, [availableSubcategories]);

  const handleCategoryToggle = (catId, checked) => {
    setCategoryIds((prev) =>
      checked ? [...prev, catId] : prev.filter((id) => id !== catId)
    );
  };

  const handleSubCategoryToggle = (subId, checked) => {
    setSubCategoryIds((prev) =>
      checked ? [...prev, subId] : prev.filter((id) => id !== subId)
    );
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

  const handleSave = () => {
    if (!formData.title.trim() || categoryIds.length === 0) return;
    onSave(formData);
  };

  const selectedCategories =
    categories?.filter((cat) => categoryIds.includes(cat._id)) || [];

  const categoryDisplayLabel = (() => {
    if (selectedCategories.length === 0) return "Select categories";
    if (selectedCategories.length === 1) return selectedCategories[0].name;
    if (selectedCategories.length === 2) {
      return selectedCategories.map((c) => c.name).join(", ");
    }
    return `${selectedCategories
      .slice(0, 2)
      .map((c) => c.name)
      .join(", ")} +${selectedCategories.length - 2}`;
  })();

  const selectedSubcategories = availableSubcategories.filter((sub) =>
    subCategoryIds.includes(sub._id)
  );

  const subCategoryDisplayLabel = (() => {
    if (isFetchingSubcategories && !availableSubcategories.length) {
      return "Loading subcategories…";
    }
    if (selectedSubcategories.length === 0) return "Select subcategories";
    if (selectedSubcategories.length === 1) return selectedSubcategories[0].name;
    if (selectedSubcategories.length === 2) {
      return selectedSubcategories.map((s) => s.name).join(", ");
    }
    return `${selectedSubcategories
      .slice(0, 2)
      .map((s) => s.name)
      .join(", ")} +${selectedSubcategories.length - 2}`;
  })();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-[#FFFFFF3B] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">{title}</DialogTitle>
        </DialogHeader>

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
            <div ref={categoryTriggerRef} className="relative w-full">
              <Label>Categories *</Label>
              <DropdownMenu
                modal={false}
                onOpenChange={(open) => {
                  if (open && categoryTriggerRef.current) {
                    setCategoryMenuWidth(
                      categoryTriggerRef.current.offsetWidth
                    );
                  }
                }}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "mt-1 flex h-12 w-full items-center justify-between gap-2 rounded-md border border-white/40 bg-transparent px-3 text-sm shadow-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring",
                      categoryIds.length === 0
                        ? "text-white"
                        : "text-white"
                    )}
                  >
                    <span className="truncate text-left">
                      {categoryDisplayLabel}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={4}
                  style={{ width: categoryMenuWidth }}
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  className={cn(
                    "z-[200] max-h-60 overflow-y-auto overscroll-contain",
                    "border-white/20 bg-[#1a1a2e] p-1 text-white shadow-xl"
                  )}
                >
                  {categories?.length ? (
                    categories.map((cat) => (
                      <DropdownMenuCheckboxItem
                        key={cat._id}
                        checked={categoryIds.includes(cat._id)}
                        onCheckedChange={(checked) =>
                          handleCategoryToggle(cat._id, checked === true)
                        }
                        onSelect={(e) => e.preventDefault()}
                        className="cursor-pointer text-white focus:bg-white/10 focus:text-white"
                      >
                        {cat.name}
                      </DropdownMenuCheckboxItem>
                    ))
                  ) : (
                    <p className="px-2 py-2 text-sm text-white">
                      No categories available
                    </p>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div ref={subCategoryTriggerRef} className="relative w-full">
              <Label
                className={cn(!isLibrarySelected && "text-white")}
              >
                Tags
              </Label>
              <DropdownMenu
                modal={false}
                onOpenChange={(open) => {
                  if (open && subCategoryTriggerRef.current) {
                    setSubCategoryMenuWidth(
                      subCategoryTriggerRef.current.offsetWidth
                    );
                  }
                }}
              >
                <DropdownMenuTrigger asChild disabled={!isLibrarySelected}>
                  <button
                    type="button"
                    disabled={!isLibrarySelected}
                    title={
                      !isLibrarySelected
                        ? "Select the 'Library' category to enable tags"
                        : undefined
                    }
                    className={cn(
                      "mt-1 flex h-12 w-full items-center justify-between gap-2 rounded-md border border-white/40 bg-transparent px-3 text-sm shadow-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring",
                      !isLibrarySelected
                        ? "cursor-not-allowed opacity-50 text-white"
                        : subCategoryIds.length === 0
                          ? "text-white"
                          : "text-white"
                    )}
                  >
                    <span className="truncate text-left">
                      {!isLibrarySelected
                        ? "Select 'Library' category first"
                        : subCategoryDisplayLabel}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={4}
                  style={{ width: subCategoryMenuWidth }}
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                  className={cn(
                    "z-[200] max-h-60 overflow-y-auto overscroll-contain",
                    "border-white/20 bg-[#1a1a2e] p-1 text-white shadow-xl"
                  )}
                >
                  {availableSubcategories.length ? (
                    availableSubcategories.map((sub) => (
                      <DropdownMenuCheckboxItem
                        key={sub._id}
                        checked={subCategoryIds.includes(sub._id)}
                        onCheckedChange={(checked) =>
                          handleSubCategoryToggle(sub._id, checked === true)
                        }
                        onSelect={(e) => e.preventDefault()}
                        className="cursor-pointer text-white focus:bg-white/10 focus:text-white"
                      >
                        {sub.name}
                      </DropdownMenuCheckboxItem>
                    ))
                  ) : (
                    <p className="px-2 py-2 text-sm text-white">
                      {isFetchingSubcategories
                        ? "Loading…"
                        : "No subcategories available"}
                    </p>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              {isLibrarySelected && selectedSubcategories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedSubcategories.map((sub) => (
                    <span
                      key={sub._id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                    >
                      <Tag className="h-3 w-3" />
                      {sub.name}
                      <button
                        type="button"
                        onClick={() =>
                          handleSubCategoryToggle(sub._id, false)
                        }
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
            <div className="flex items-center gap-2">
              <Label className="">Thumbnail</Label>
              <span className="text-xs text-white/70">(Better performance for upload webp image)</span>
            </div>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload").click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer mt-2 ${dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-300 hover:border-blue-500"
                }`}
            >
              {formData.thumbnail ? (
                <div className="space-y-3">
                  <img
                    src={formData.thumbnail}
                    alt="Thumbnail preview"
                    loading="lazy"
                    decoding="async"
                    className="mx-auto h-40 w-full object-cover rounded-lg"
                  />
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
                    PNG, JPG, GIF up to 5MB
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
            <Button variant="outline" className="text-white" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.title.trim() || categoryIds.length === 0}
            >
              {data ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommonFormModal;
