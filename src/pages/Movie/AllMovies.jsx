import { useState } from 'react';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Dummy Data
const initialMovies = [
  {
    id: 1,
    title: "Inception",
    description: "A thief who steals corporate secrets through dream-sharing technology",
    genre: "Sci-Fi Thriller",
    duration: 148,
    thumbnail_url: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800",
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    title: "The Shawshank Redemption",
    description: "Two imprisoned men bond over years, finding redemption through acts of decency",
    genre: "Drama",
    duration: 142,
    thumbnail_url: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800",
    created_at: "2024-02-20T14:15:00Z"
  },
  {
    id: 3,
    title: "The Dark Knight",
    description: "Batman faces the Joker in a battle for Gotham's soul",
    genre: "Action",
    duration: 152,
    thumbnail_url: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800",
    created_at: "2024-03-10T09:45:00Z"
  },
  {
    id: 4,
    title: "Forrest Gump",
    description: "The presidencies of Kennedy and Johnson unfold through the perspective of an Alabama man",
    genre: "Drama",
    duration: 142,
    thumbnail_url: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800",
    created_at: "2024-04-05T16:20:00Z"
  },
  {
    id: 5,
    title: "Interstellar",
    description: "A team of explorers travel through a wormhole in space",
    genre: "Sci-Fi Adventure",
    duration: 169,
    thumbnail_url: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800",
    created_at: "2024-05-12T11:00:00Z"
  },
  {
    id: 6,
    title: "Parasite",
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship",
    genre: "Thriller",
    duration: 132,
    thumbnail_url: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800",
    created_at: "2024-06-18T13:30:00Z"
  },
  {
    id: 7,
    title: "The Matrix",
    description: "A computer hacker learns about the true nature of his reality",
    genre: "Sci-Fi Action",
    duration: 136,
    thumbnail_url: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800",
    created_at: "2024-07-22T10:15:00Z"
  },
  {
    id: 8,
    title: "Pulp Fiction",
    description: "The lives of two mob hitmen, a boxer, and a pair of diner bandits intertwine",
    genre: "Crime",
    duration: 154,
    thumbnail_url: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800",
    created_at: "2024-08-30T15:45:00Z"
  }
];

const AllMovies = () => {
  const [movies, setMovies] = useState(initialMovies);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    duration: '',
    thumbnail_url: ''
  });

  const filteredMovies = movies.filter((movie) =>
    movie.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    setMovies(movies.filter(m => m.id !== selectedMovie.id));
    setDeleteDialogOpen(false);
    setSelectedMovie(null);
  };

  const handleCreate = () => {
    const newMovie = {
      id: Math.max(...movies.map(m => m.id), 0) + 1,
      ...formData,
      duration: parseInt(formData.duration) || 0,
      created_at: new Date().toISOString(),
      thumbnail_url: formData.thumbnail_url || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800'
    };
    setMovies([...movies, newMovie]);
    setCreateModalOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    setMovies(movies.map(m => 
      m.id === selectedMovie.id 
        ? { ...m, ...formData, duration: parseInt(formData.duration) || 0 }
        : m
    ));
    setCreateModalOpen(false);
    setSelectedMovie(null);
    setIsEditing(false);
    resetForm();
  };

  const openEditModal = (movie) => {
    setSelectedMovie(movie);
    setIsEditing(true);
    setFormData({
      title: movie.title,
      description: movie.description,
      genre: movie.genre,
      duration: movie.duration.toString(),
      thumbnail_url: movie.thumbnail_url
    });
    setCreateModalOpen(true);
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedMovie(null);
    resetForm();
    setCreateModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      genre: '',
      duration: '',
      thumbnail_url: ''
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({...formData, thumbnail_url: reader.result});
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
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({...formData, thumbnail_url: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const MovieForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="Enter movie title"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Enter description"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="genre">Genre</Label>
          <Input
            id="genre"
            value={formData.genre}
            onChange={(e) => setFormData({...formData, genre: e.target.value})}
            placeholder="e.g., Action, Drama"
          />
        </div>
        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({...formData, duration: e.target.value})}
            placeholder="120"
          />
        </div>
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
                onClick={() => setFormData({...formData, thumbnail_url: ''})}
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
                <label htmlFor="file-upload" className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                  Click to upload
                </label>
                {' '}or drag and drop
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
      <div className=" mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Movie Management</h1>
            <p className="text-slate-600 mt-1">Manage all your movies</p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Movie
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search movies..."
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
              <Card key={movie.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={movie.thumbnail_url}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-600">Movie</Badge>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 truncate">{movie.title}</h3>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {movie.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
                    <span>{movie.genre || 'Movie'}</span>
                    <span>{new Date(movie.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditModal(movie)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedMovie(movie);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Movie' : 'Create New Movie'}</DialogTitle>
            </DialogHeader>
            <MovieForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setCreateModalOpen(false);
                setIsEditing(false);
                setSelectedMovie(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button 
                onClick={isEditing ? handleEdit : handleCreate} 
                disabled={!formData.title || !formData.duration}
              >
                {isEditing ? 'Save Changes' : 'Create Movie'}
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
                This will permanently delete "{selectedMovie?.title}".
                This action cannot be undone.
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