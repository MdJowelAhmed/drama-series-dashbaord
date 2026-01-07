import { useState } from "react";
import { Pencil, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetAllPackageQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
} from "@/redux/feature/packageApi";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
        {showPackageModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => {
              setShowPackageModal(false);
              resetForm();
            }}
          >
            <div
              className="w-full max-w-3xl overflow-hidden bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-2xl font-bold text-red-500">
                  {editingPackageId !== null
                    ? "Edit Package"
                    : "Add New Package"}
                </h2>
                <button
                  onClick={() => {
                    setShowPackageModal(false);
                    resetForm();
                  }}
                  className="hover:bg-gray-100 rounded p-1"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4">
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Title */}
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={currentPackage.name}
                        onChange={handlePackageChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="e.g. Basic Plan, Premium Plan"
                        required
                      />
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Duration <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="duration"
                        value={currentPackage.duration}
                        onChange={handlePackageChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      >
                        {DURATION_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Original Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={currentPackage.price}
                        onChange={handlePackageChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="e.g. 60.99"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    {/* Payment Type */}
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Payment Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="paymentType"
                        value={currentPackage.paymentType}
                        onChange={handlePackageChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      >
                        {PAYMENT_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Discount Section */}
                    <div className="p-4 border rounded-md bg-gray-50">
                      {/* Discount Percentage */}
                      <div className="">
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Discount Percentage (%)
                        </label>
                        <input
                          type="number"
                          name="discountPercentage"
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
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="e.g. 20 (for 20% off)"
                          min="0"
                          max="99"
                        />

                        <p className="mt-1 text-xs text-gray-500">
                          Enter a discount percentage from 1-99. The final price
                          will be calculated automatically.
                        </p>
                      </div>
                    </div>
                    {/* Description */}
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={currentPackage.description}
                        onChange={handlePackageChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        rows="4"
                        placeholder="Enter package description"
                        required
                      ></textarea>
                    </div>
                  </div>

                  {/* App Configuration - Always shown */}
                  <div className="p-4 border rounded-md bg-blue-50">
                      <h3 className="mb-3 text-lg font-semibold text-gray-700">
                        App Configuration
                      </h3>

                      {/* Platform Selection */}
                      <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                          Platform <span className="text-red-500">*</span>
                        </label>
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
                            <span className="text-sm text-gray-700">
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
                            <span className="text-sm text-gray-700">
                              Apple App Store
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Product ID Input */}
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          {currentPackage.isGoogle
                            ? "Google Product ID"
                            : "Apple Product ID"}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
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
                              // Update the field corresponding to the current platform selection
                              [prev.isGoogle
                                ? "googleProductId"
                                : "appleProductId"]: val,
                            }));
                          }}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder={
                            currentPackage.isGoogle
                              ? "e.g. basic_03"
                              : "e.g. com.app.basic"
                          }
                          required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          This ID must match the product ID configured in{" "}
                          {currentPackage.isGoogle
                            ? "Google Play Console"
                            : "App Store Connect"}
                          .
                        </p>
                      </div>
                    </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="p-4">
                <button
                  className={`w-full py-3 font-medium text-white rounded-md transition-colors ${
                    !isFormValid() || isCreating || isUpdating
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                  onClick={savePackage}
                  disabled={!isFormValid() || isCreating || isUpdating}
                >
                  {isCreating || isUpdating ? "Saving..." : "Save"}
                </button>

                {/* Validation message */}
                {!isFormValid() && (
                  <p className="mt-2 text-sm text-red-600 text-center">
                    Please fill in all required fields with valid values
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete this subscription package?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPackageToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePackage}
                className="bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
