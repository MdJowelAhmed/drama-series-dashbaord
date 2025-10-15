import { useState } from 'react';
import { Search, Eye, Trash2 } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      full_name: 'Ahmed Hassan',
      email: 'ahmed.hassan@example.com',
      phone: '01712345678',
      subscription_package: 'Premium Plan',
      subscription_end: '2025-12-10',
      is_active: true,
      created_at: '2024-01-15'
    },
    {
      id: 2,
      full_name: 'Fatima Rahman',
      email: 'fatima.rahman@example.com',
      phone: '01823456789',
      subscription_package: 'Basic Plan',
      subscription_end: '2025-11-20',
      is_active: true,
      created_at: '2024-03-22'
    },
    {
      id: 3,
      full_name: 'Karim Uddin',
      email: 'karim.uddin@example.com',
      phone: '01934567890',
      subscription_package: null,
      subscription_end: null,
      is_active: false,
      created_at: '2024-05-10'
    },
    {
      id: 4,
      full_name: 'Nusrat Jahan',
      email: 'nusrat.jahan@example.com',
      phone: '01645678901',
      subscription_package: 'Enterprise Plan',
      subscription_end: '2026-01-15',
      is_active: true,
      created_at: '2024-02-08'
    },
    {
      id: 5,
      full_name: 'Rafiq Ahmed',
      email: 'rafiq.ahmed@example.com',
      phone: '01756789012',
      subscription_package: 'Premium Plan',
      subscription_end: '2025-10-30',
      is_active: true,
      created_at: '2024-06-12'
    },
    {
      id: 6,
      full_name: 'Sultana Begum',
      email: 'sultana.begum@example.com',
      phone: null,
      subscription_package: null,
      subscription_end: null,
      is_active: false,
      created_at: '2024-08-20'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = users.filter((user) =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    setUsers(users.filter(user => user.id !== selectedUser.id));
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const handleToggleStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, is_active: !user.is_active } : user
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className=" mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-600 mt-1">Manage all registered users</p>
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

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 uppercase tracking-wider">Subscription</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-600 uppercase tracking-wider">Joined</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-600">
                      No users found
                    </td>
                  </tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{user.full_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700">{user.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.subscription_package 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {user.subscription_package || 'None'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            user.is_active ? 'bg-blue-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              user.is_active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="text-sm text-slate-700">
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-700">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setDetailsDialogOpen(true);
                          }}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteDialogOpen(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {detailsDialogOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">User Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Name</p>
                    <p className="text-base text-slate-900">{selectedUser.full_name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Email</p>
                    <p className="text-base text-slate-900">{selectedUser.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Phone</p>
                    <p className="text-base text-slate-900">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Subscription Type</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedUser.subscription_package 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {selectedUser.subscription_package || 'None'}
                    </span>
                  </div>
                  
                  {selectedUser.subscription_end && (
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Subscription Expires</p>
                      <p className="text-base text-slate-900">{formatDate(selectedUser.subscription_end)}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedUser.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {selectedUser.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Joined</p>
                    <p className="text-base text-slate-900">{formatDate(selectedUser.created_at)}</p>
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

        {deleteDialogOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Are you sure?</h2>
              <p className="text-slate-600 mb-6">
                This will permanently delete {selectedUser.full_name}'s account. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setSelectedUser(null);
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

export default UserManagement;