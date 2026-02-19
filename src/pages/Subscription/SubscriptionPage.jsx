import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetAllPackageQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
} from "@/redux/feature/packageApi";
import { toast } from "sonner";
import DeleteConfirmationModal from "@/components/share/DeleteConfirmationModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Duration options that match the API's expected enum values
const DURATION_OPTIONS = [
  { value: "1 month", label: "1 Month" },
  { value: "3 months", label: "3 Months" },
  { value: "6 months", label: "6 Months" },
  { value: "1 year", label: "1 Year" },
];

// Payment type options that match the API's expected enum values
const PAYMENT_TYPE_OPTIONS = [
  { value: "Yearly", label: "Yearly" },
  { value: "Monthly", label: "Monthly" },
];

// Membership types that can see discounts
const MEMBERSHIP_OPTIONS = [
  { value: "all", label: "All Users" },
  { value: "premium", label: "Premium Members" },
  { value: "gold", label: "Gold Members" },
  { value: "platinum", label: "Platinum Members" },
  { value: "vip", label: "VIP Members" },
];

export default function SubscriptionPackagesManagement() {
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [currentPackage, setCurrentPackage] = useState({
    name: "",
    description: "",
    price: "",
    duration: "1 month",
    paymentType: "Yearly",
    subscriptionType: "app",
    // New discount fields
    discountPercentage: "",
    discountVisibleTo: "all",
    // Platform fields
    isGoogle: true,
    googleProductId: "",
    appleProductId: "",
  });
  const [editingPackageId, setEditingPackageId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);

  // RTK Query hooks
  const { data: packagesData, isLoading: isLoadingPackages } =
    useGetAllPackageQuery();
  const [createPackage, { isLoading: isCreating }] =
    useCreatePackageMutation();
  const [updatePackage, { isLoading: isUpdating }] =
    useUpdatePackageMutation();
  const [deletePackage, { isLoading: isDeleting }] =
    useDeletePackageMutation();

  const subscriptionPackages = packagesData?.data || [];

  // Form validation function
  const isFormValid = () => {
    const requiredFields = [
      "name",
      "description",
      "price",
      "duration",
      "paymentType",
    ];

    // Check if all required fields have values
    for (let field of requiredFields) {
      if (
        !currentPackage[field] ||
        currentPackage[field].toString().trim() === ""
      ) {
        return false;
      }
    }

    // Check if price is a valid positive number
    const price = Number(currentPackage.price);
    if (isNaN(price) || price <= 0) {
      return false;
    }

    // Check if discount percentage is valid (if provided)
    if (currentPackage.discountPercentage !== "") {
      const discount = Number(currentPackage.discountPercentage);

      if (
        !Number.isInteger(discount) ||
        isNaN(discount) ||
        discount < 0 ||
        discount > 99
      ) {
        return false;
      }
    }

    // App subscription specific validation - always required
    if (currentPackage.isGoogle && !currentPackage.googleProductId) {
      return false;
    }
    if (!currentPackage.isGoogle && !currentPackage.appleProductId) {
      return false;
    }

    return true;
  };

  // Package functions
  const openPackageModal = (packageObj = null) => {
    if (packageObj) {
      // Edit existing - normalize data to match API expectations
      const normalizedDuration =
        packageObj.duration?.toLowerCase() || "1 month";

      setCurrentPackage({
        name: packageObj.name || "",
        description: packageObj.description || "",
        price: packageObj.price?.toString() || "",
        duration: normalizedDuration,
        paymentType:
          packageObj.paymentType === "One-time"
            ? "Yearly"
            : packageObj.paymentType || "Yearly",
        subscriptionType: "app",
        // Handle discount fields with defaults
        discountPercentage: packageObj.discountPercentage?.toString() || packageObj.discount?.toString() || "",
        discountVisibleTo: packageObj.discountVisibleTo || "all",
        // Platform specific
        isGoogle: packageObj.hasOwnProperty("isGoogle")
          ? packageObj.isGoogle
          : true,
        googleProductId: packageObj.googleProductId || "",
        appleProductId: packageObj.appleProductId || "",
      });
      setEditingPackageId(packageObj._id || packageObj.id);
    } else {
      // Add new
      setCurrentPackage({
        name: "",
        description: "",
        price: "",
        duration: "1 month",
        paymentType: "Yearly",
        subscriptionType: "app",
        discountPercentage: "",
        discountVisibleTo: "all",
        isGoogle: true,
        googleProductId: "",
        appleProductId: "",
      });
      setEditingPackageId(null);
    }
    setShowPackageModal(true);
  };

  const savePackage = async () => {
    // Double check form validity before saving
    if (!isFormValid()) {
      toast.error("Please fill in all required fields with valid values.");
      return;
    }

    try {
      // Format package data - send original price and discount percentage to backend
      const formattedPackage = {
        name: currentPackage.name,
        description: currentPackage.description,
        price: Number(currentPackage.price),
        duration: currentPackage.duration,
        paymentType: currentPackage.paymentType,
        subscriptionType: "app",
        discount: currentPackage.discountPercentage
          ? parseInt(currentPackage.discountPercentage, 10)
          : 0,
        discountVisibleTo: currentPackage.discountVisibleTo,
        // App-specific fields - always required
        isGoogle: currentPackage.isGoogle,
      };

      if (currentPackage.isGoogle) {
        formattedPackage.googleProductId = currentPackage.googleProductId;
      } else {
        formattedPackage.appleProductId = currentPackage.appleProductId;
      }

      if (editingPackageId !== null) {
        // Update existing package
        await updatePackage({
          id: editingPackageId,
          updatedData: formattedPackage,
        }).unwrap();
        toast.success("Package updated successfully");
      } else {
        // Add new package
        await createPackage(formattedPackage).unwrap();
        toast.success("Package created successfully");
      }
      setShowPackageModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving package:", error);
      toast.error(
        error?.data?.message || "Please check all fields and try again."
      );
    }
  };

  const resetForm = () => {
    setCurrentPackage({
      name: "",
      description: "",
      price: "",
      duration: "1 month",
      paymentType: "Yearly",
      subscriptionType: "app",
      discountPercentage: "",
      discountVisibleTo: "all",
      isGoogle: true,
      googleProductId: "",
      appleProductId: "",
    });
    setEditingPackageId(null);
  };

  const handlePackageChange = (e) => {
    const { name, value } = e.target;
    setCurrentPackage((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const confirmDeletePackage = (id) => {
    setPackageToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeletePackage = async () => {
    if (!packageToDelete) return;
    try {
      await deletePackage(packageToDelete).unwrap();
      toast.success("Package deleted successfully");
      setDeleteDialogOpen(false);
      setPackageToDelete(null);
    } catch (error) {
      console.error("Error deleting package:", error);
      toast.error(
        error?.data?.message || "An error occurred while deleting the package."
      );
    }
  };

  // All packages are app subscriptions
  const filteredPackages = subscriptionPackages;

  if (isLoadingPackages) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-accent">
              Subscription Packages
            </h1>
            <p className="text-accent mt-1">
              Manage subscription plans and pricing
            </p>
          </div>
        </div>

        {/* Add Button */}
        <div className="flex items-center justify-end mb-6">
          <Button
            className="flex items-center gap-2 px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
            onClick={() => openPackageModal()}
          >
            <Plus size={18} />
            Add Subscription Package
          </Button>
        </div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPackages.length === 0 ? (
            <div className="p-4 col-span-full text-center text-gray-500">
              No subscription packages found. Add a new package to get started.
            </div>
          ) : (
            filteredPackages.map((pkg) => {
              const hasDiscount = pkg.discount > 0;
              const originalPrice = pkg.originalPrice || pkg.price;
              const discountedPrice = hasDiscount
                ? originalPrice * (1 - pkg.discount / 100)
                : pkg.price;

              return (
                <div
                  key={pkg.id || pkg._id}
                  className="relative flex-1 p-10 border rounded-lg min-w-64 bg-secondary"
                >

                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div className="absolute top-2 right-2 px-2 py-1 text-xs text-white bg-red-500 rounded-full">
                      {pkg.discount}% OFF
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      className="p-1 mr-2 hover:bg-gray-100 rounded"
                      onClick={() => openPackageModal(pkg)}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                      onClick={() => confirmDeletePackage(pkg.id || pkg._id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>

                  <div className="mb-3 text-sm text-center">{pkg.name}</div>

                  {/* Updated Price Display */}
                  <div className="mb-3 text-center">
                    {hasDiscount ? (
                      <div>
                        {/* Original Price with strikethrough */}
                        <div className="text-2xl font-bold text-gray-400 line-through mb-1">
                          ${originalPrice}
                        </div>
                        {/* Discounted Price */}
                        <div className="text-5xl font-bold text-red-600">
                          ${discountedPrice.toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-6xl font-bold">${pkg.price}</div>
                    )}
                  </div>

                  <div className="mb-2 text-xs text-center">
                    {DURATION_OPTIONS.find(
                      (opt) => opt.value === pkg.duration?.toLowerCase()
                    )?.label || pkg.duration}{" "}
                    - {pkg.paymentType}
                  </div>

                  <p className="mb-8 text-xs text-center">{pkg.description}</p>
                  <button className="w-full py-2 text-white bg-red-500 rounded-md hover:bg-red-600">
                    Subscribe
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Add/Edit Subscription Package Modal */}
        <Dialog open={showPackageModal} onOpenChange={(open) => {
          setShowPackageModal(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-[#FFFFFF3B]  backdrop-blur-lg">
            <DialogHeader>
              <DialogTitle>
                {editingPackageId !== null ? "Edit Package" : "Add New Package"}
              </DialogTitle>
              <DialogDescription>
                {editingPackageId !== null
                  ? "Update package information and settings."
                  : "Create a new subscription package for your users."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={currentPackage.name}
                    onChange={handlePackageChange}
                    placeholder="e.g. Basic Plan, Premium Plan"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">
                    Duration <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={currentPackage.duration}
                    onValueChange={(value) =>
                      setCurrentPackage((prev) => ({ ...prev, duration: value }))
                    }
                  >
                    <SelectTrigger className="py-[22px] border border-white/50 ">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Original Price <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={currentPackage.price}
                    onChange={handlePackageChange}
                    placeholder="e.g. 60.99"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Payment Type */}
                <div className="space-y-2">
                  <Label htmlFor="paymentType">
                    Payment Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={currentPackage.paymentType}
                    onValueChange={(value) =>
                      setCurrentPackage((prev) => ({ ...prev, paymentType: value }))
                    }
                   
                  >
                    <SelectTrigger className="py-[22px] border border-white/50 ">
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Discount Section */}
                <div className="space-y-2 p-4 border rounded-md border-white/50">
                  <Label htmlFor="discountPercentage">
                    Discount Percentage (%)
                  </Label>
                  <Input
                    id="discountPercentage"
                    name="discountPercentage"
                    type="number"
                    value={currentPackage.discountPercentage}
                    onChange={(e) => {
                      const value = e.target.value;

                      if (!/^\d*$/.test(value)) {
                        toast.error(
                          "Fractional numbers (decimals) are not allowed."
                        );
                        return;
                      }

                      if (value.length > 2) {
                        toast.error(
                          "Discount can only be up to 2 digits (1-99)."
                        );
                        return;
                      }

                      setCurrentPackage((prev) => ({
                        ...prev,
                        discountPercentage: value,
                      }));
                    }}
                    placeholder="e.g. 20 (for 20% off)"
                    min="0"
                    max="99"
                  />
                  <p className="text-xs ">
                    Enter a discount percentage from 1-99. The final price will
                    be calculated automatically.
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={currentPackage.description}
                    onChange={handlePackageChange}
                    placeholder="Enter package description"
                    rows={5}
                  />
                </div>
              </div>

              {/* App Configuration */}
              <div className="space-y-4 p-4 border rounded-md border-white/50">
                <h3 className="text-lg font-semibold ">
                  App Configuration
                </h3>

                {/* Platform Selection */}
                <div className="space-y-2">
                  <Label>
                    Platform <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isGoogle"
                        checked={currentPackage.isGoogle === true}
                        onChange={() =>
                          setCurrentPackage((prev) => ({
                            ...prev,
                            isGoogle: true,
                          }))
                        }
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <span className="text-sm ">
                        Google Play
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isGoogle"
                        checked={currentPackage.isGoogle === false}
                        onChange={() =>
                          setCurrentPackage((prev) => ({
                            ...prev,
                            isGoogle: false,
                          }))
                        }
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <span className="text-sm ">
                        Apple App Store
                      </span>
                    </label>
                  </div>
                </div>

                {/* Product ID Input */}
                <div className="space-y-2">
                  <Label htmlFor="productId">
                    {currentPackage.isGoogle
                      ? "Google Product ID"
                      : "Apple Product ID"}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="productId"
                    type="text"
                    value={
                      currentPackage.isGoogle
                        ? currentPackage.googleProductId
                        : currentPackage.appleProductId
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      setCurrentPackage((prev) => ({
                        ...prev,
                        [prev.isGoogle ? "googleProductId" : "appleProductId"]:
                          val,
                      }));
                    }}
                    placeholder={
                      currentPackage.isGoogle
                        ? "e.g. basic_03"
                        : "e.g. com.app.basic"
                    }
                  />
                  <p className="text-xs ">
                    This ID must match the product ID configured in{" "}
                    {currentPackage.isGoogle
                      ? "Google Play Console"
                      : "App Store Connect"}
                    .
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPackageModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={savePackage}
                disabled={!isFormValid() || isCreating || isUpdating}
              >
                {isCreating || isUpdating ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>

            {/* Validation message */}
            {!isFormValid() && (
              <p className="text-sm text-red-600 text-center">
                Please fill in all required fields with valid values
              </p>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationModal
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeletePackage}
          isLoading={isDeleting}
          title="Delete Subscription Package"
          description="Are you sure you want to delete this subscription package? This action cannot be undone."
        />
      </div>
    </div>
  );
}
