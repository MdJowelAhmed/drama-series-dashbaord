import { useState } from "react";
import { Plus, Search, Eye, Trash2, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import DeleteConfirmationModal from "@/components/share/DeleteConfirmationModal";
import {
  useGetAllDramaQuery,
  useCreateDramaMutation,
  useUpdateDramaMutation,
  useDeleteDramaMutation,
} from "@/redux/feature/dramaManagement/dramaManagementApi";
import { getImageUrl } from "@/components/share/imageUrl";
import CommonFormModal from "@/components/modals/CommonFormModal";
import { useGetAllCategoryQuery } from "@/redux/feature/categoryApi";

const AllDramas = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDrama, setSelectedDrama] = useState(null);
  const navigate = useNavigate();

  // RTK Query hooks
  const { data: dramasData, isLoading, isError, refetch } = useGetAllDramaQuery([
    { name: "searchTerm", value: searchQuery },
  ]);
  const [createDrama, { isLoading: isCreating }] = useCreateDramaMutation();
  const [updateDrama, { isLoading: isUpdating }] = useUpdateDramaMutation();
  const [deleteDrama, { isLoading: isDeleting }] = useDeleteDramaMutation();
  const {data:categoryData} = useGetAllCategoryQuery();
  const categories = categoryData?.data || [];
  console.log(categories);
  const dramas = dramasData?.data || [];

  const filteredDramas = dramas.filter((drama) =>
    drama.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (!selectedDrama?._id) return;
    try {
      await deleteDrama(selectedDrama._id).unwrap();
      toast.success("Drama deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedDrama(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete drama");
    }
  };

  const handleCreate = async (formData) => {
    try {
      // Prepare FormData for API (form-data with thumbnail and data)
      const submitData = new FormData();

      // Add thumbnail file if exists
      if (formData.thumbnailFile) {
        submitData.append("thumbnail", formData.thumbnailFile);
      }

      // Prepare data object
      const dataObject = {
        title: formData.title,
        // type: formData.type,
        genre: formData.genre,
        tags: formData.tags || [],
        description: formData.description,
        accentColor: formData.color,
        status: formData.status || "Ongoing",
        contentName: formData.contentName,
        categoryId: formData.categoryId,
      };

      // Add data as JSON string
      submitData.append("data", JSON.stringify(dataObject));

      await createDrama(submitData).unwrap();
      toast.success("Drama created successfully");
      setCreateModalOpen(false);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create drama");
    }
  };

  const handleEdit = async (formData) => {
    if (!selectedDrama?._id) return;
    try {
      // Prepare FormData for API
      const submitData = new FormData();

      // Add thumbnail file if new file selected
      if (formData.thumbnailFile) {
        submitData.append("thumbnail", formData.thumbnailFile);
      }

      // Prepare data object
      const dataObject = {
        title: formData.title,
        // type: formData.type,
        categoryId: formData.categoryId,
        genre: formData.genre,
        tags: formData.tags || [],
        description: formData.description,
        accentColor: formData.color,
        status: formData.status || "Ongoing",
        contentName: formData.contentName,
      };

      // Add data as JSON string
      submitData.append("data", JSON.stringify(dataObject));

      await updateDrama({
        id: selectedDrama._id,
        updatedData: submitData,
      }).unwrap();
      toast.success("Drama updated successfully");
      setEditModalOpen(false);
      setSelectedDrama(null);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update drama");
    }
  };

  const openEditModal = (drama) => {
    setSelectedDrama(drama);
    setEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-600">Failed to load dramas</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }
  const handleViewDetails = (drama) => {
    navigate(`/movies/${drama._id}`);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-accent">
              Drama Management
            </h1>
            <p className="text-accent mt-1">
              Manage all your dramas and series
            </p>
          </div>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="bg-primary py-6 text-accent shadow hover:bg-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Drama
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search dramas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {/* <div className="text-sm text-accent">
            Total: {dramasData?.data?.meta?.total || 0} dramas
          </div> */}
        </div>

        {filteredDramas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No dramas found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredDramas.map((drama) => (
              <Card
                key={drama._id}
                className="overflow-hidden hover:shadow-lg bg-secondary transition-shadow flex flex-col"
              >
                <div className="relative h-72 overflow-hidden bg-slate-200">
                  {drama.thumbnail ? (
                    <img
                      src={getImageUrl(drama.thumbnail)}
                      alt={drama.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge
                 style={{ backgroundColor: drama.accentColor }}
                 className="text-white"
                    >
                      {drama.status}
                    </Badge>
                  </div>
                  {drama.accentColor && (
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1"
                      style={{ backgroundColor: drama.accentColor }}
                    />
                  )}
                </div>
                <CardContent className="p-4 flex-1">
                  <h3 className="font-semibold text-accent  mb-1 truncate">
                    {drama.title}
                  </h3>
                  {/* <p className="text-sm text-accent mb-3 line-clamp-2">
                    {drama.description || "No description"}
                  </p> */}
                  {/* <div className="flex items-center justify-between text-sm text-accent">
                    <span className="font-medium">{drama.genre || drama.type}</span>
                    <span>
                      {drama.createdAt
                        ? new Date(drama.createdAt).toLocaleDateString()
                        : "-"}
                    </span>
                  </div> */}
                  {drama.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {drama.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-50 text-slate-600 px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {drama.tags.length > 3 && (
                        <span className="text-xs text-slate-400">
                          +{drama.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 justify-between">
                    <span>Views: {drama.totalViews || 0}</span>
                    <span>Rating: {drama.rating || 0}</span>
                  </div>
                </CardContent>
                <div className="flex justify-between gap-10 px-4 pb-2">
                  <Button
                    size="sm"
                    className="flex-1 py-5"
                    // onClick={() => navigate(`/dramas/${drama._id}`)}
                    onClick={() => handleViewDetails(drama)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="py-5"
                      onClick={() => openEditModal(drama)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="py-5 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setSelectedDrama(drama);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Drama Modal */}
        {createModalOpen && (
          <CommonFormModal
            title="Create New Drama"
            data={null}
            onClose={() => setCreateModalOpen(false)}
            categories={categories}
            onSave={handleCreate}
            showStatus={true}
            showGenre={true}
          />
        )}

        {/* Edit Drama Modal */}
        {editModalOpen && selectedDrama && (
          <CommonFormModal
            title="Edit Drama"
            categories={categories}
            data={{
              ...selectedDrama,
              thumbnail: selectedDrama.thumbnail ? getImageUrl(selectedDrama.thumbnail) : null,
            }}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedDrama(null);
            }}
            onSave={handleEdit}
            showStatus={true}
            showGenre={true}
          />
        )}

        {/* Delete Dialog */}
        <DeleteConfirmationModal
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          isLoading={isDeleting}
          itemName={selectedDrama?.title}
          title="Delete Drama"
          description={`This will permanently delete "${selectedDrama?.title}" and all its series and videos. This action cannot be undone.`}
        />
      </div>
    </div>
  );
};

export default AllDramas;
