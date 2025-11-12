import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  User,
  Mail,
  Phone,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const AVAILABLE_PAGES = [
  { value: "dashboard", label: "Dashboard Overview" },
  { value: "users", label: "Users Management" },
  { value: 'category', label: 'Category management' },
  { value: "movies", label: "Movies Management" },
  { value: "trailers", label: "Trailers Management" },
  { value: "reports", label: "Reports Analysis" },
  // { value: "settings", label: "Settings" },
  // { value: 'analytics', label: 'Analytics' },
];

export default function ControllerManagement() {
  const [controllers, setControllers] = useState([
    {
      id: 1,
      name: "Karim Ahmed",
      email: "karim@example.com",
      phone: "01712345678",
      pageAccess: ["dashboard", "users", "products", "orders"],
    },
    {
      id: 2,
      name: "Rahim Khan",
      email: "rahim@example.com",
      phone: "01812345678",
      pageAccess: ["dashboard", "products", "reports"],
    },
    {
      id: 3,
      name: "Fatima Begum",
      email: "fatima@example.com",
      phone: "01912345678",
      pageAccess: ["dashboard", "orders", "analytics"],
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    pageAccess: [],
  });

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      pageAccess: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (controller) => {
    setEditingId(controller.id);
    setFormData({
      name: controller.name,
      email: controller.email,
      phone: controller.phone,
      password: "",
      pageAccess: controller.pageAccess,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim()
    ) {
      alert("Please fill all required fields");
      return;
    }

    if (!editingId && !formData.password.trim()) {
      alert("Password is required for new controllers");
      return;
    }

    if (formData.pageAccess.length === 0) {
      alert("Please select at least one page access");
      return;
    }

    if (editingId) {
      setControllers(
        controllers.map((controller) =>
          controller.id === editingId
            ? {
                ...controller,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                pageAccess: formData.pageAccess,
              }
            : controller
        )
      );
    } else {
      const newController = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        pageAccess: formData.pageAccess,
      };
      setControllers([...controllers, newController]);
    }

    setIsModalOpen(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      pageAccess: [],
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this controller?")) {
      setControllers(controllers.filter((controller) => controller.id !== id));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePageAccess = (pageValue) => {
    setFormData({
      ...formData,
      pageAccess: formData.pageAccess.includes(pageValue)
        ? formData.pageAccess.filter((p) => p !== pageValue)
        : [...formData.pageAccess, pageValue],
    });
  };

  return (
    <div className="min-h-screen ">
      <div className="">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Controller Management</h1>
            <p className="">Manage controllers and their page access</p>
          </div>
          <Button onClick={openCreateModal} className="gap-2 py-6">
            <Plus className="w-4 h-4" />
            Add Controller
          </Button>
        </div>

        <div className="bg-white/30 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Page Access
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {controllers.map((controller) => (
                  <tr
                    key={controller.id}
                    className="transition-colors "
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 " />
                        <span className="text-sm font-medium ">
                          {controller.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 " />
                        <span className="text-sm ">{controller.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 " />
                        <span className="text-sm ">{controller.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {controller.pageAccess.map((page) => (
                          <Badge
                            key={page}
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 text-xs"
                          >
                            {AVAILABLE_PAGES.find((p) => p.value === page)
                              ?.label || page}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(controller)}
                          className="h-8 w-8"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(controller.id)}
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {controllers.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-500 text-lg">
                No controllers yet. Add your first controller!
              </p>
            </div>
          )}
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Controller" : "Add New Controller"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update controller information and page access."
                  : "Add a new controller to the system."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="01712345678"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password {editingId && "(Leave blank to keep current)"}
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={
                      editingId ? "Enter new password" : "Enter password"
                    }
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label>Page Access Permissions</Label>
                <div className="border border-slate-200 grid grid-cols-2 rounded-lg p-4 space-y-2 bg-">
                  {AVAILABLE_PAGES.map((page) => (
                    <div
                      key={page.value}
                      onClick={() => togglePageAccess(page.value)}
                      className=" gap-3 flex items-center p-2  rounded cursor-pointer transition-colors"
                    >
                      {formData.pageAccess.includes(page.value) ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 " />
                      )}
                      <span className="text-sm font-medium ">{page.label}</span>
                    </div>
                  ))}
                </div>
                {formData.pageAccess.length > 0 && (
                  <p className="text-xs ">
                    {formData.pageAccess.length} page
                    {formData.pageAccess.length !== 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingId ? "Update Controller" : "Create Controller"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
