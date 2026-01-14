import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  ChevronLeft,
  ChevronRight,
  Bell,
  Clock,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useCreateRemainderMutation,
  useUpdateRemainderMutation,
  useDeleteRemainderMutation,
  useGetAllRemainderQuery,
  useToggleRemainderStatusMutation,
} from "@/redux/feature/RemainderApi";
import { toast } from "sonner";
import DeleteConfirmationModal from "@/components/share/DeleteConfirmationModal";
import { getImageUrl } from "@/components/share/imageUrl";
import ReminderFormModal from "./components/ReminderFormModal";
import ReminderDetailsModal from "./components/ReminderDetailsModal";
import { formatDateTime } from "./utils";

const RemainderManage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);

  // Build query params
  const queryParams = [
    { name: "page", value: currentPage },
    { name: "limit", value: perPage },
  ];

  if (searchQuery) {
    queryParams.push({ name: "searchTerm", value: searchQuery });
  }

  // RTK Query hooks
  const { data: remindersData, isLoading, error } = useGetAllRemainderQuery(queryParams);
  const [createRemainder, { isLoading: isCreating }] = useCreateRemainderMutation();
  const [updateRemainder, { isLoading: isUpdating }] = useUpdateRemainderMutation();
  const [deleteRemainder, { isLoading: isDeleting }] = useDeleteRemainderMutation();
  const [toggleStatus] = useToggleRemainderStatusMutation();

  const reminders = remindersData?.data || [];
  const meta = remindersData?.meta || { page: 1, limit: 10, total: 0, totalPage: 1 };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle create/edit
  const handleOpenCreateModal = () => {
    setEditingReminder(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (reminder) => {
    setEditingReminder(reminder);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingReminder(null);
  };

  // Handle save (create or update) - following Postman format
  const handleSaveReminder = async (formData, editingId) => {
    try {
      // Create FormData following Postman structure
      // thumbnail: File
      // data: JSON string with {name, description, reminderTime}
      const submitData = new FormData();

      // Add thumbnail if present
      if (formData.thumbnail) {
        submitData.append("thumbnail", formData.thumbnail);
      }

      // Create data object matching Postman format
      const dataObject = {
        name: formData.name,
        description: formData.description,
        reminderTime: new Date(formData.reminderTime).toISOString(),
      };

      submitData.append("data", JSON.stringify(dataObject));

      if (editingId) {
        // Update
        await updateRemainder({ id: editingId, formData: submitData }).unwrap();
        toast.success("Reminder updated successfully");
      } else {
        // Create
        await createRemainder(submitData).unwrap();
        toast.success("Reminder created successfully");
      }

      handleCloseFormModal();
    } catch (error) {
      console.error("Error saving reminder:", error);
      toast.error(error?.data?.message || "Failed to save reminder");
    }
  };

  // Handle delete
  const handleConfirmDelete = (reminder) => {
    setReminderToDelete(reminder);
    setDeleteDialogOpen(true);
  };

  const handleDeleteReminder = async () => {
    if (!reminderToDelete) return;

    try {
      await deleteRemainder(reminderToDelete._id).unwrap();
      toast.success("Reminder deleted successfully");
      setDeleteDialogOpen(false);
      setReminderToDelete(null);
    } catch (error) {
      console.error("Error deleting reminder:", error);
      toast.error(error?.data?.message || "Failed to delete reminder");
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (reminder) => {
    try {
      const newStatus = reminder.status === "active" ? "inactive" : "active";
      await toggleStatus({ id: reminder._id, status: newStatus }).unwrap();
      toast.success(`Reminder ${newStatus === "active" ? "activated" : "deactivated"}`);
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to update status");
    }
  };

  // Handle view details
  const handleViewDetails = (reminder) => {
    setSelectedReminder(reminder);
    setDetailsModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-accent mb-2">
              Reminder Management
            </h1>
            <p className="text-white/70">Manage all your reminders in one place</p>
          </div>
          <Button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-6 py-6 rounded-sm transition-all font-semibold"
          >
            <Plus className="h-5 w-5" />
            Add Reminder
          </Button>
        </div>

        {/* Search */}
        {/* <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reminders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div> */}

        {/* Table */}
        <div className="bg-secondary rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-600">Error loading reminders</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-accent-foreground uppercase tracking-wider">
                        Thumbnail
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-accent-foreground uppercase tracking-wider">
                        Name
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-accent-foreground uppercase tracking-wider">
                        Description
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-accent-foreground uppercase tracking-wider">
                        Reminder Time
                      </th>
                      {/* <th className="text-left px-6 py-3 text-xs font-medium text-accent-foreground uppercase tracking-wider">
                        Status
                      </th> */}
                      <th className="text-right px-6 py-3 text-xs font-medium text-accent-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reminders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-12">
                          <div className="flex flex-col items-center">
                            <Bell className="h-16 w-16 text-slate-300 mb-4" />
                            <p className="text-slate-600 text-lg">
                              No reminders found
                            </p>
                            <p className="text-slate-400 text-sm mt-1">
                              Create your first reminder to get started
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      reminders.map((reminder) => (
                        <tr
                          key={reminder._id}
                          className="transition-colors "
                        >
                          {/* Thumbnail */}
                          <td className="px-6 py-4">
                            <div className="h-16 w-32 rounded-lg overflow-hidden bg-slate-100">
                              {reminder.thumbnail ? (
                                <img
                                  src={getImageUrl(reminder.thumbnail)}
                                  alt={reminder.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Bell className="h-5 w-5 text-slate-400" />
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Name */}
                          <td className="px-6 py-4">
                            <div className="font-medium text-accent">
                              {reminder.name}
                            </div>
                          </td>

                          {/* Description */}
                          <td className="px-6 py-4">
                            <p className="text-accent text-sm truncate max-w-xs">
                              {reminder.description}
                            </p>
                          </td>

                          {/* Reminder Time */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-accent">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">
                                {formatDateTime(reminder.reminderTime)}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          {/* <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleStatus(reminder)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  reminder.status === "active"
                                    ? "bg-green-500"
                                    : "bg-slate-300"
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    reminder.status === "active"
                                      ? "translate-x-6"
                                      : "translate-x-1"
                                  }`}
                                />
                              </button>
                              <span className="text-sm text-accent capitalize">
                                {reminder.status}
                              </span>
                            </div>
                          </td> */}

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleViewDetails(reminder)}
                                className="p-2"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleOpenEditModal(reminder)}
                                className="p-2"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleConfirmDelete(reminder)}
                                className="p-2 bg-red-500 hover:bg-red-600"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta.totalPage > 1 && (
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Showing {(meta.page - 1) * meta.limit + 1} to{" "}
                    {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}{" "}
                    reminders
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-accent">
                      Page {meta.page} of {meta.totalPage}
                    </span>
                    <Button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(meta.totalPage, prev + 1))
                      }
                      disabled={currentPage === meta.totalPage}
                      className="px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Create/Edit Modal */}
        <ReminderFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseFormModal}
          onSave={handleSaveReminder}
          editingReminder={editingReminder}
          isLoading={isCreating || isUpdating}
        />

        {/* Details Modal */}
        {detailsModalOpen && (
          <ReminderDetailsModal
            reminder={selectedReminder}
            onClose={() => {
              setDetailsModalOpen(false);
              setSelectedReminder(null);
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationModal
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteReminder}
          isLoading={isDeleting}
          itemName={reminderToDelete?.name}
          title="Delete Reminder"
          description={`Are you sure you want to delete "${reminderToDelete?.name}"? This action cannot be undone.`}
        />
      </div>
    </div>
  );
};

export default RemainderManage;
