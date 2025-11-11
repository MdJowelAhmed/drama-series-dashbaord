import { useState } from 'react';
import { Plus, Pencil, Trash2, User, Mail, Phone, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'manager', label: 'Manager' },
  { value: 'editor', label: 'Editor' },
];

const getRoleBadgeColor = (role) => {
  const colors = {
    admin: 'bg-red-100 text-red-800',
    moderator: 'bg-blue-100 text-blue-800',
    supervisor: 'bg-purple-100 text-purple-800',
    manager: 'bg-green-100 text-green-800',
    editor: 'bg-orange-100 text-orange-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};

export default function UserManagement() {
  const [users, setUsers] = useState([
    { id: 1, name: 'Karim Ahmed', email: 'karim@example.com', phone: '01712345678', role: 'admin' },
    { id: 2, name: 'Rahim Khan', email: 'rahim@example.com', phone: '01812345678', role: 'moderator' },
    { id: 3, name: 'Fatima Begum', email: 'fatima@example.com', phone: '01912345678', role: 'supervisor' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: '' });

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', password: '', role: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: '',
      role: user.role,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.role) {
      alert('Please fill all required fields');
      return;
    }

    if (!editingId && !formData.password.trim()) {
      alert('Password is required for new users');
      return;
    }

    if (editingId) {
      setUsers(
        users.map((user) =>
          user.id === editingId
            ? { ...user, name: formData.name, email: formData.email, phone: formData.phone, role: formData.role }
            : user
        )
      );
    } else {
      const newUser = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
      };
      setUsers([...users, newUser]);
    }

    setIsModalOpen(false);
    setFormData({ name: '', email: '', phone: '', password: '', role: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (value) => {
    setFormData({
      ...formData,
      role: value,
    });
  };

  return (
    <div className="min-h-screen  p-8">
      <div className="">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold t mb-2">User Management</h1>
            <p className="">Manage team members and their roles</p>
          </div>
          <Button onClick={openCreateModal} className="gap-2 py-6">
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </div>

        <div className="bg-secondary rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200 ">
                <tr >
                  <th className="text-left px-6 py-3 text-xs font-medium text-accent-foreground uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-accent-foreground uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-accent-foreground uppercase tracking-wider">Phone</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-accent-foreground uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className="transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-accent">
                     
                        <User className="w-4 h-4 " />
                        {user.name}
                    
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-accent">
                    
                        <Mail className="w-4 h-4" />
                        {user.email}
                    
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-accent">
                   
                        <Phone className="w-4 h-4" />
                        {user.phone}
                   
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-accent">
                      <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-accent">
                    
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(user)} className="h-8 w-8">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} className="h-8 w-8 text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                    
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-500 text-lg">No users yet. Add your first team member!</p>
            </div>
          )}
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit User' : 'Add New User'}</DialogTitle>
              <DialogDescription>
                {editingId ? 'Update user information and role.' : 'Add a new team member to the system.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="Enter full name" value={formData.name} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="example@email.com" value={formData.email} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" placeholder="01712345678" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password {editingId && '(Leave blank to keep current)'}</Label>
                <Input id="password" name="password" type="password" placeholder={editingId ? "Enter new password" : "Enter password"} value={formData.password} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>{editingId ? 'Update User' : 'Create User'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
