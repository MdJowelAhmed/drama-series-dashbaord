import { useState } from "react";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const SubscriptionManager = () => {
  const [subscriptions, setSubscriptions] = useState([
    {
      id: 1,
      name: "Basic Plan",
      price: 299,
      duration_days: 30,
      description: "Perfect for individuals getting started",
      features: [
        "Access to basic features",
        "Email support",
        "5 GB storage",
        "Single user",
      ],
    },
    {
      id: 2,
      name: "Premium Plan",
      price: 799,
      duration_days: 30,
      description: "Most popular choice for professionals",
      features: [
        "All basic features",
        "Priority support",
        "50 GB storage",
        "Up to 5 users",
        "Advanced analytics",
      ],
    },
    {
      id: 3,
      name: "Enterprise Plan",
      price: 1999,
      duration_days: 30,
      description: "For large teams and organizations",
      features: [
        "All premium features",
        "24/7 phone support",
        "Unlimited storage",
        "Unlimited users",
        "Custom integrations",
        "Dedicated account manager",
      ],
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [selectedForDelete, setSelectedForDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration_days: "",
    description: "",
    features: [""],
  });

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      duration_days: "",
      description: "",
      features: [""],
    });
    setEditingSubscription(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      name: subscription.name,
      price: subscription.price.toString(),
      duration_days: subscription.duration_days.toString(),
      description: subscription.description,
      features: subscription.features.length > 0 ? subscription.features : [""],
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    const filteredFeatures = formData.features.filter((f) => f.trim() !== "");

    if (
      !formData.name ||
      !formData.price ||
      !formData.duration_days ||
      !formData.description
    ) {
      return;
    }

    if (editingSubscription) {
      setSubscriptions(
        subscriptions.map((sub) =>
          sub.id === editingSubscription.id
            ? {
                ...sub,
                name: formData.name,
                price: Number(formData.price),
                duration_days: Number(formData.duration_days),
                description: formData.description,
                features: filteredFeatures,
              }
            : sub
        )
      );
    } else {
      const newSubscription = {
        id: Math.max(...subscriptions.map((s) => s.id), 0) + 1,
        name: formData.name,
        price: Number(formData.price),
        duration_days: Number(formData.duration_days),
        description: formData.description,
        features: filteredFeatures,
      };
      setSubscriptions([...subscriptions, newSubscription]);
    }

    setModalOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    setSubscriptions(
      subscriptions.filter((sub) => sub.id !== selectedForDelete.id)
    );
    setDeleteDialogOpen(false);
    setSelectedForDelete(null);
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, ""],
    });
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({
      ...formData,
      features: newFeatures,
    });
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-accent">
              Subscription Packages
            </h1>
            <p className="text-accent mt-1">
              Manage subscription plans and pricing
            </p>
          </div>
          <Button
            onClick={openCreateModal}
            className="flex items-center gap-2  text-white px-4 py-2 rounded-md  transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="p-6 flex-grow">
                <h3 className="text-2xl font-bold text-slate-900">
                  {subscription.name}
                </h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-slate-900">
                    ৳{subscription.price}
                  </span>
                  <span className="text-sm text-slate-600">
                    /{subscription.duration_days} days
                  </span>
                </div>

                <p className="text-sm text-slate-600 mt-4 mb-6">
                  {subscription.description}
                </p>

                <ul className="space-y-3 mb-6">
                  {subscription.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2 p-4 mt-auto">
                <Button
                  onClick={() => openEditModal(subscription)}
                  className="flex-1 flex items-center justify-center gap-1 border border-slate-300 text px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  onClick={() => {
                    setSelectedForDelete(subscription);
                    setDeleteDialogOpen(true);
                  }}
                  className="border border-slate-300 px-3 py-2 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  {editingSubscription
                    ? "Edit Subscription Plan"
                    : "Create New Subscription Plan"}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Price (৳)
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Duration (days)
                      </label>
                      <input
                        type="number"
                        value={formData.duration_days}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration_days: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Features
                    </label>
                    <div className="space-y-2">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) =>
                              updateFeature(index, e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter feature"
                          />
                          {formData.features.length > 1 && (
                            <button
                              onClick={() => removeFeature(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addFeature}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add Feature
                    </button>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setModalOpen(false);
                        resetForm();
                      }}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingSubscription ? "Update Plan" : "Create Plan"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {deleteDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Are you sure?
              </h2>
              <p className="text-slate-600 mb-6">
                This will permanently delete "{selectedForDelete?.name}". Users
                with this subscription will need to be migrated to another plan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setSelectedForDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;
