import { useState } from "react";
import { Plus, Search, Eye, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";

// Dummy Data
const initialMovies = [
  {
    id: 1,
    title: "The Crown",
    description: "A historical drama about the reign of Queen Elizabeth II",
    genre: "Historical Drama",
    status: "Completed",
    thumbnail_url:
      "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800",
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    title: "Breaking Bad",
    description: "A chemistry teacher turned methamphetamine manufacturer",
    genre: "Crime Thriller",
    status: "Completed",
    thumbnail_url:
      "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800",
    created_at: "2024-02-20T14:15:00Z",
  },
  {
    id: 3,
    title: "Stranger Things",
    description: "Supernatural events in a small town during the 1980s",
    genre: "Sci-Fi Horror",
    status: "Ongoing",
    thumbnail_url:
      "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800",
    created_at: "2024-03-10T09:45:00Z",
  },
  {
    id: 4,
    title: "Money Heist",
    description: "A group of criminals plan and execute elaborate heists",
    genre: "Action Thriller",
    status: "Completed",
    thumbnail_url:
      "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800",
    created_at: "2024-04-05T16:20:00Z",
  },
  {
    id: 5,
    title: "The Witcher",
    description: "A monster hunter navigates a world of magic and danger",
    genre: "Fantasy Adventure",
    status: "Ongoing",
    thumbnail_url:
      "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800",
    created_at: "2024-05-12T11:00:00Z",
  },
  {
    id: 6,
    title: "Dark",
    description: "Time travel and family secrets in a German town",
    genre: "Sci-Fi Mystery",
    status: "Completed",
    thumbnail_url:
      "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800",
    created_at: "2024-06-18T13:30:00Z",
  },
];

const AllMovies = () => {
  const [movies, setMovies] = useState(initialMovies);
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDrama, setSelectedDrama] = useState(null);
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "",
    status: "Ongoing",
    thumbnail_url: "",
  });

  const filteredMovies = movies.filter((movie) =>
    movie.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    setMovies(movies.filter((m) => m.id !== selectedDrama.id));
    setDeleteDialogOpen(false);
    setSelectedDrama(null);
  };

  const handleCreate = () => {
    const newDrama = {
      id: Math.max(...dramas.map((d) => d.id), 0) + 1,
      ...formData,
      created_at: new Date().toISOString(),
      thumbnail_url:
        formData.thumbnail_url ||
        "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800",
    };
    setDramas([...dramas, newDrama]);
    setCreateModalOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    setDramas(
      dramas.map((d) => (d.id === selectedDrama.id ? { ...d, ...formData } : d))
    );
    setEditModalOpen(false);
    setSelectedDrama(null);
    resetForm();
  };

  const openEditModal = (drama) => {
    setSelectedDrama(drama);
    setFormData({
      title: drama.title,
      description: drama.description,
      genre: drama.genre,
      status: drama.status,
      thumbnail_url: drama.thumbnail_url,
    });
    setEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      genre: "",
      status: "Ongoing",
      thumbnail_url: "",
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, thumbnail_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, thumbnail_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const DramaForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter drama title"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Enter description"
          rows={3}
        />
      </div>
      <div>
        <Label htmlFor="genre">Genre</Label>
        <Input
          id="genre"
          value={formData.genre}
          onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
          placeholder="e.g., Action, Drama, Comedy"
        />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-md"
        >
          <option value="Ongoing">Ongoing</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      <div>
        <Label>Thumbnail Image</Label>
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
        >
          {formData.thumbnail_url ? (
            <div className="space-y-3">
              <img
                src={formData.thumbnail_url}
                alt="Preview"
                className="mx-auto h-40 w-full object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData({ ...formData, thumbnail_url: "" })}
              >
                Remove Image
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-slate-400" />
              </div>
              <div className="text-sm text-slate-600">
                <label
                  htmlFor="file-upload"
                  className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
                >
                  Click to upload
                </label>{" "}
                or drag and drop
              </div>
              <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Drama Management
            </h1>
            <p className="text-slate-600 mt-1">
              Manage all your dramas and series
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setCreateModalOpen(true);
            }}
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
        </div>

        {filteredMovies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No movies found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <Card
                key={movie.id}
                className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
              >
                <div className="relative h-42 overflow-hidden">
                  <img
                    src={movie.thumbnail_url}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-white/30 text-white">
                      {movie.status}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4 flex-1">
                  <h3 className="font-semibold text-black text-lg mb-2 truncate">
                    {movie.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {movie.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>{movie.genre || "movie"}</span>
                    <span>
                      {new Date(movie.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
                <div className="flex justify-between gap-10 p-4">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/movies/${movie.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <div className="flex gap-5">
                    <Button size="sm" onClick={() => openEditModal(movie)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedmovie(movie);
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

        {/* Create Modal */}
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New movie</DialogTitle>
            </DialogHeader>
            <DramaForm />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!formData.title}>
                Create Drama
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Drama</DialogTitle>
            </DialogHeader>
            <DramaForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit} disabled={!formData.title}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{selectedDrama?.title}" and all
                its series and videos. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AllMovies;