import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Eye, Trash2, ChevronLeft, ChevronRight, FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import DeleteConfirmationModal from '@/components/share/DeleteConfirmationModal';
import AppImage from '@/components/share/AppImage';
import { baseUrl } from '@/redux/base-url/baseUrlApi';
import { useDeleteUserMutation, useGetAllUserQuery, useToggleUserStatusMutation } from '@/redux/feature/usersApi';

const USER_CATEGORY_OPTIONS = [
  { value: '', label: 'All Users' },
  { value: 'active', label: 'Active Users' },
  { value: 'inactive', label: 'Inactive Users' },
  { value: 'paid', label: 'Paid Users' },
  { value: 'free', label: 'Free Users' },
];

const buildUserQueryFilters = ({ page, limit, searchQuery, category }) => {
  const filters = { page, limit };

  if (searchQuery?.trim()) {
    filters.searchTerm = searchQuery.trim();
  }

  if (category === "active") {
    filters.status = "active";
  } else if (category === "inactive") {
    filters.status = "inactive";
  } else if (category === "paid") {
    filters.isSubscribed = "true";
  } else if (category === "free") {
    filters.isSubscribed = "false";
  }

  return filters;
};

const filtersToSearchString = (filters) => {
  const searchParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value != null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString().replace(/\+/g, "%20");
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatWatchTime = (user) => {
  const details = user?.watchTimeDetails;
  if (details?.formatted) return details.formatted;

  const totalSeconds =
    details?.totalSeconds ?? user?.totalWatchTime ?? 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getSubscriptionPackageName = (user) => {
  const sub = user?.activeSubscription;
  if (sub?.packageName) return sub.packageName;
  if (sub?.subscriptionId) return sub.subscriptionId;
  return '';
};

const getSubscriptionPrice = (user) => {
  const price = user?.activeSubscription?.price;
  return price != null && price !== '' ? price : '';
};

const getSubscriptionEndDate = (user) => {
  const end = user?.activeSubscription?.currentPeriodEnd;
  return end ? formatDateTime(end) : '';
};

const mapUserToExportRow = (user) => ({
  Name: user.name || '',
  Email: user.email || '',
  Age: user.age ?? '',
  Gender: user.gender || '',
  'Watch Time': formatWatchTime(user),
  Role: user.role || '',
  Verified: user.verified ? 'Yes' : 'No',
  Status: user.status || '',
  'Subscription Package': getSubscriptionPackageName(user),
  'Subscription Price': getSubscriptionPrice(user),
  'Subscription End Date': getSubscriptionEndDate(user),
  Online: user.onlineStatus?.isOnline ? 'Online' : 'Offline',
  'Last Seen': user.onlineStatus?.lastSeen
    ? formatDate(user.onlineStatus.lastSeen)
    : '',
  'Joined Date': user.createdAt ? formatDate(user.createdAt) : '',
});

const formatUserExportPdfLine = (row, index) =>
  `${index + 1}. ${row.Name} | ${row.Email} | Age: ${row.Age || 'N/A'} | Gender: ${row.Gender || 'N/A'} | Watch Time: ${row['Watch Time']} | Role: ${row.Role} | Status: ${row.Status} | Verified: ${row.Verified} | Package: ${row['Subscription Package'] || 'N/A'} | Price: ${row['Subscription Price'] !== '' ? row['Subscription Price'] : 'N/A'} | End Date: ${row['Subscription End Date'] || 'N/A'} | Online: ${row.Online} | Last Seen: ${row['Last Seen'] || 'N/A'} | Joined: ${row['Joined Date']}`;

const downloadUsersExcel = ({ users, filterSlug, dateSlug }) => {
  const rows = users.map(mapUserToExportRow);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Users');
  XLSX.writeFile(wb, `users-export-${filterSlug}-${dateSlug}.xlsx`);
};

const downloadUsersPdf = ({ users, filterSlug, dateSlug, activeCategoryLabel }) => {
  const doc = new jsPDF();
  let y = 16;

  doc.setFontSize(16);
  doc.text('Users Export', 14, y);
  y += 10;

  doc.setFontSize(10);
  doc.text(`Filter: ${activeCategoryLabel}`, 14, y);
  y += 6;
  doc.text(`Exported: ${dateSlug}`, 14, y);
  y += 6;
  doc.text(`Total users: ${users.length}`, 14, y);
  y += 10;

  doc.setFontSize(8);
  users.forEach((user, index) => {
    const row = mapUserToExportRow(user);
    const line = formatUserExportPdfLine(row, index);
    const wrapped = doc.splitTextToSize(line, 180);
    doc.text(wrapped, 14, y);
    y += 4 * wrapped.length + 2;

    if (y > 280) {
      doc.addPage();
      y = 16;
    }
  });

  doc.save(`users-export-${filterSlug}-${dateSlug}.pdf`);
};

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [perPage, setPerPage] = useState(10);
  const [exportingFormat, setExportingFormat] = useState(null);

  const queryFilters = useMemo(
    () =>
      buildUserQueryFilters({
        page: currentPage,
        limit: perPage,
        searchQuery,
        category: categoryFilter,
      }),
    [currentPage, perPage, searchQuery, categoryFilter]
  );

  const { data: usersData, isLoading, error } = useGetAllUserQuery(queryFilters);
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

  // Reset page when search or filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, searchQuery ? 500 : 0);
    return () => clearTimeout(timer);
  }, [searchQuery, categoryFilter]);

  const users = usersData?.data || [];
  const meta = usersData?.meta || { page: 1, limit: 10, total: 0, totalPage: 1 };

  const activeCategoryLabel =
    USER_CATEGORY_OPTIONS.find((opt) => opt.value === categoryFilter)?.label ||
    'All Users';

  const fetchAllFilteredUsers = useCallback(async () => {
    const exportFilters = buildUserQueryFilters({
      page: 1,
      limit: Math.max(meta.total, 1),
      searchQuery,
      category: categoryFilter,
    });

    const token = localStorage.getItem('token');
    const response = await fetch(
      `${baseUrl}/user-management?${filtersToSearchString(exportFilters)}`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}`, token } : {}),
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch users for export');
    }

    const result = await response.json();
    return Array.isArray(result?.data) ? result.data : [];
  }, [meta.total, searchQuery, categoryFilter]);

  const handleExportUsers = async (format) => {
    try {
      setExportingFormat(format);
      const allUsers = await fetchAllFilteredUsers();

      if (!allUsers.length) {
        toast.error('No users found to export for the selected filter');
        return;
      }

      const filterSlug = categoryFilter || 'all';
      const dateSlug = new Date().toISOString().slice(0, 10);
      const exportPayload = { users: allUsers, filterSlug, dateSlug, activeCategoryLabel };

      if (format === 'pdf') {
        downloadUsersPdf(exportPayload);
      } else {
        downloadUsersExcel(exportPayload);
      }

      toast.success(
        `Exported ${allUsers.length} user(s) (${activeCategoryLabel}) as ${format.toUpperCase()}`
      );
    } catch (err) {
      toast.error(err?.message || 'Failed to export users');
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-accent">User Management</h1>
            <p className="text-accent mt-1">Manage all registered users</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => handleExportUsers('excel')}
              disabled={exportingFormat !== null || isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white"
            >
              {exportingFormat === 'excel' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              Excel
            </Button>
            <Button
              onClick={() => handleExportUsers('pdf')}
              disabled={exportingFormat !== null || isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
            >
              {exportingFormat === 'pdf' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              PDF
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="user-category-filter" className="text-sm text-accent whitespace-nowrap">
              Filter
            </label>
            <select
              id="user-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="min-w-[160px] px-3 py-2 border border-slate-300 rounded-lg text-accent focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {USER_CATEGORY_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
                      <th className="text-left px-6 py-3 text-xs font-medium text-accent-foreground uppercase tracking-wider">Age</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-accent-foreground uppercase tracking-wider">Gender</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-accent-foreground uppercase tracking-wider">Subscription Package</th>
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
                        <td colSpan="10" className="text-center py-12 text-slate-600">
                          No users found
                        </td>
                      </tr>
                    ) : users.map((user) => (
                      <tr key={user._id} className="transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {user.image ? (
                              <AppImage src={user.image} alt={user.name} width={64} className="h-8 w-8 rounded-full object-cover" />
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
                        <td className="px-6 py-4 whitespace-nowrap text-accent">{user.age ?? 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-accent capitalize">{user.gender || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-accent max-w-[180px] truncate" title={getSubscriptionPackageName(user) || undefined}>
                          {getSubscriptionPackageName(user) || '—'}
                        </td>
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
                              className="p-2 text-white rounded-lg transition-colors "
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
            <div className=" bg-[#FFFFFF3B] border border-white/10 backdrop-blur-lg rounded-xl shadow-xl max-w-xl w-full">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-6">User Details</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    {selectedUser.image ? (
                      <AppImage src={selectedUser.image} alt={selectedUser.name} width={128} className="h-16 w-16 rounded-full object-cover" />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-2xl">
                          {selectedUser.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedUser.name}</h3>
                      <p className="text-sm text-white/50">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white mb-1">Role : </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {selectedUser.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white mb-1">Age : </p>
                      <p className="text-base text-white">{selectedUser.age ?? 'N/A'}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white mb-1">Gender : </p>
                      <p className="text-base text-white capitalize">{selectedUser.gender || 'N/A'}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white mb-1">Verification Status : </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedUser.verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedUser.verified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white mb-1">Subscription : </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {selectedUser.isSubscribed === true || selectedUser.isSubscribe === true
                          ? 'Paid'
                          : 'Free'}
                      </span>
                    </div>

                    {selectedUser.activeSubscription && (
                      <>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white mb-1">Subscription Package : </p>
                          <p className="text-base text-white">
                            {getSubscriptionPackageName(selectedUser) || 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white mb-1">Subscription Price : </p>
                          <p className="text-base text-white">
                            {getSubscriptionPrice(selectedUser) !== ''
                              ? `$${getSubscriptionPrice(selectedUser)}`
                              : 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white mb-1">Subscription End Date : </p>
                          <p className="text-base text-white">
                            {getSubscriptionEndDate(selectedUser) || 'N/A'}
                          </p>
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white mb-1">Account Status : </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        selectedUser.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white mb-1">Online Status : </p>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${
                          selectedUser.onlineStatus?.isOnline ? 'bg-green-500' : 'bg-slate-300'
                        }`} />
                        <span className="text-sm text-white">
                          {selectedUser.onlineStatus?.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                   
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white mb-1">Last seen : </p>
                    {selectedUser.onlineStatus?.lastSeen && !selectedUser.onlineStatus?.isOnline && (
                        <p className="text-xs text-white mt-1">
                         {formatDate(selectedUser.onlineStatus.lastSeen)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white mb-1">Total Watch Time : </p>
                      <p className="text-base font-medium text-white">
                        {formatWatchTime(selectedUser)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white mb-1">Joined : </p>
                      <p className="text-base text-white">{formatDate(selectedUser.createdAt)}</p>
                    </div>
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