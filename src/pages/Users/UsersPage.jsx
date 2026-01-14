import { useState, useEffect } from 'react';
import { Search, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import DeleteConfirmationModal from '@/components/share/DeleteConfirmationModal';
import { useDeleteUserMutation, useGetAllUserQuery, useToggleUserStatusMutation } from '@/redux/feature/usersApi';
// import { 
//   useGetAllUserQuery, 
//   useDeleteUserMutation, 
//   useToggleUserStatusMutation 
// } from '../redux/feature/usersApi';

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [perPage, setPerPage] = useState(10);

  // Build query params
  const queryParams = [
    {
      name: 'page',
      value: currentPage
    },
    {
      name: 'limit',
      value: perPage
    }
  ]
  
  if (searchQuery) {
    queryParams.append({
      name: 'searchTerm',
      value: searchQuery
    });
  }

  const { data: usersData, isLoading, error } = useGetAllUserQuery(queryParams);
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [toggleUserStatus] = useToggleUserStatusMutation();

  const handleDelete = async () => {
    try {
      await deleteUser(selectedUser._id).unwrap();
      toast.success("User deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete user");
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      await toggleUserStatus({ id: userId, status: newStatus }).unwrap();
    } catch (err) {
      console.error('Failed to toggle user status:', err);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const users = usersData?.data || [];
  const meta = usersData?.meta || { page: 1, limit: 10, total: 0, totalPage: 1 };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-accent">User Management</h1>
            <p className="text-accent mt-1">Manage all registered users</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-secondary rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-accent">Loading users...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-red-600">Error loading users</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-accent-foreground uppercase tracking-wider">Name</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-accent-foreground uppercase tracking-wider">Email</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-accent-foreground uppercase tracking-wider">Role</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-accent-foreground uppercase tracking-wider">Verified</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-accent-foreground uppercase tracking-wider">Status</th>
                      {/* <th className="text-left px-6 py-3 text-xs font-medium text-accent-foreground uppercase tracking-wider">Online</th> */}
                      <th className="text-right px-6 py-3 text-xs font-medium text-accent-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-12 text-slate-600">
                          No users found
                        </td>
                      </tr>
                    ) : users.map((user) => (
                      <tr key={user._id} className="transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {user.image ? (
                              <img src={user.image} alt={user.name} className="h-8 w-8 rounded-full" />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">
                                  {user.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="font-medium text-accent">{user.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-accent">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.verified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.verified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleStatus(user._id, user.status)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                user.status === 'active' ? 'bg-blue-600' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  user.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                            <span className="text-sm text-accent capitalize">
                              {user.status}
                            </span>
                          </div>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${
                              user.onlineStatus?.isOnline ? 'bg-green-500' : 'bg-slate-300'
                            }`} />
                            <span className="text-sm text-accent">
                              {user.onlineStatus?.isOnline ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => {
                                setSelectedUser(user);
                                setDetailsDialogOpen(true);
                              }}
                              className="p-2 text-accent rounded-lg transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => {
                                setSelectedUser(user);
                                setDeleteDialogOpen(true);
                              }}
                              className="p-2 text-accent rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {meta.totalPage > 1 && (
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} users
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-accent">
                      Page {meta.page} of {meta.totalPage}
                    </span>
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(meta.totalPage, prev + 1))}
                      disabled={currentPage === meta.totalPage}
                      className="px-3 py-1 border border-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {detailsDialogOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">User Details</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    {selectedUser.image ? (
                      <img src={selectedUser.image} alt={selectedUser.name} className="h-16 w-16 rounded-full" />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-2xl">
                          {selectedUser.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{selectedUser.name}</h3>
                      <p className="text-sm text-slate-500">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Role</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {selectedUser.role}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Verification Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedUser.verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedUser.verified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Account Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        selectedUser.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Online Status</p>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${
                          selectedUser.onlineStatus?.isOnline ? 'bg-green-500' : 'bg-slate-300'
                        }`} />
                        <span className="text-sm text-slate-900">
                          {selectedUser.onlineStatus?.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      {selectedUser.onlineStatus?.lastSeen && !selectedUser.onlineStatus?.isOnline && (
                        <p className="text-xs text-slate-500 mt-1">
                          Last seen: {formatDate(selectedUser.onlineStatus.lastSeen)}
                        </p>
                      )}
                    </div>

                    {selectedUser.stripeCustomerId && (
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">Stripe Customer ID</p>
                        <p className="text-sm text-slate-900">{selectedUser.stripeCustomerId}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Joined</p>
                      <p className="text-base text-slate-900">{formatDate(selectedUser.createdAt)}</p>
                    </div>

                    {selectedUser.pageAccess && selectedUser.pageAccess.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">Page Access</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedUser.pageAccess.map((page, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
                              {page}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setDetailsDialogOpen(false)}
                    className="w-full px-4 py-2 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <DeleteConfirmationModal
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          isLoading={isDeleting}
          itemName={selectedUser?.name}
          title="Delete User"
          description={`This will permanently delete ${selectedUser?.name}'s account. This action cannot be undone.`}
        />
      </div>
    </div>
  );
};

export default UserManagement;