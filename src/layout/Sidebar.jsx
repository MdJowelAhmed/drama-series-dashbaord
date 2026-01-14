import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Film,
  Video,
  CreditCard,
  Users,
  Settings,
  ChevronDown,
  ReceiptPoundSterling,
  LogOut,
  X,
  Bell,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

// Map sidebar paths to pageAccess values
const PAGE_ACCESS_MAP = {
  "/": "dashboard",
  "/movies": "movie",
  "/trailers": "trailer",
  "/ad-management": "ad",
  "/reports": "report",
  "/categories": "category",
  "/subscriptions": "subscription",
  "/remainder": "remainder",
  "/users": "user",
  "/controllers": "controller", // Only SUPER_ADMIN should see this
};

const Sidebar = ({ onNavigate, showCloseButton = false }) => {
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
    navigate("/login");
  };

  const handleLinkClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  // Get user profile from localStorage
  const userProfile = useMemo(() => {
    try {
      const stored = localStorage.getItem("userProfile");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const allNavItems = [
    {
      name: "Overview",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Movies Management",
      path: "/movies",
      icon: Film,
    },
    {
      name: "Trailer Management",
      path: "/trailers",
      icon: Video,
    },
    {
      name: "Ad Management",
      path: "/ad-management",
      icon: Video,
    },
    {
      name: "Report Analytics",
      path: "/reports",
      icon: ReceiptPoundSterling,
    },
    {
      name: "Category Management",
      path: "/categories",
      icon: ReceiptPoundSterling,
    },
    {
      name: "Subscription Package",
      path: "/subscriptions",
      icon: CreditCard,
    },
    {
      name: "Remainder Management",
      path: "/remainder",
      icon: Bell,
    },
    {
      name: "User Management",
      path: "/users",
      icon: Users,
    },
    {
      name: "Controller Management",
      path: "/controllers",
      icon: Users,
      superAdminOnly: true, // Only SUPER_ADMIN can see this
    },
  ];

  // Filter nav items based on user role and pageAccess
  const navItems = useMemo(() => {
    if (!userProfile) return allNavItems;

    // SUPER_ADMIN can see all pages
    if (userProfile.role === "SUPER_ADMIN") {
      return allNavItems;
    }

    // ADMIN users - filter based on pageAccess
    if (userProfile.role === "ADMIN" && userProfile.pageAccess) {
      const accessiblePages = userProfile.pageAccess
        .filter((page) => page.access)
        .map((page) => page.name);

      return allNavItems.filter((item) => {
        // Hide superAdminOnly items from ADMIN users
        if (item.superAdminOnly) return false;

        const pageKey = PAGE_ACCESS_MAP[item.path];
        return accessiblePages.includes(pageKey);
      });
    }

    return allNavItems;
  }, [userProfile]);

  const settingsItems = [
    { name: "Profile", path: "/settings/profile" },
    { name: "Change Password", path: "/settings/password" },
    { name: "User Agreement", path: "/settings/agreement" },
    { name: "Privacy Policy", path: "/settings/privacy" },
  ];


  return (
    <div className="w-72 h-screen bg-black/30 backdrop-blur-sm text-white flex flex-col shrink-0 overflow-hidden relative">
      {/* Close Button for Mobile */}
      {showCloseButton && onNavigate && (
        <button
          onClick={onNavigate}
          className="absolute top-4 right-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 p-2 hover:bg-white/10 text-white"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      
      <div className="p-4 sm:p-6 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-center gap-2">
          <img src="/assets/logo.png" alt="logo" className="h-auto w-24 sm:w-28" />
        </div>
      </div>

      <nav className="flex-1 p-3 sm:p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-white hover:text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}

        <div>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={cn(
              "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors text-slate-300 hover:bg-slate-800",
              location.pathname.startsWith("/settings") && "bg-slate-800"
            )}
          >
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                settingsOpen && "rotate-180"
              )}
            />
          </button>

          {settingsOpen && (
            <div className="ml-4 mt-2 space-y-1">
              {settingsItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleLinkClick}
                    className={cn(
                      "block px-4 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-[#BF3838] text-white"
                        : "text-slate-400 hover:bg-slate-800"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800 shrink-0">
        <div className="flex items-center gap-3 px-4">
          
          <div>
            {/* <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-slate-400">admin@cine.com</p> */}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition text-white"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
