import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Video,
  CreditCard,
  Users,
  Settings,
  ChevronDown,
  ReceiptPoundSterling
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const navItems = [
    {
      name: 'Overview',
      path: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Drama Management',
      path: '/dramas',
      icon: Film,
    },
    {
      name: 'Trailer Management',
      path: '/trailers',
      icon: Video,
    },
    {
      name: 'Report Analytics',
      path: '/reports',
      icon: ReceiptPoundSterling,
    },
    {
      name: 'Category Management',
      path: '/categories',
      icon: ReceiptPoundSterling,
    },
    {
      name: 'Subscription Package',
      path: '/subscriptions',
      icon: CreditCard,
    },
    {
      name: 'User Management',
      path: '/users',
      icon: Users,
    },
  ];

  const settingsItems = [
    { name: 'Profile', path: '/settings/profile' },
    { name: 'Change Password', path: '/settings/password' },
    { name: 'Terms & Conditions', path: '/settings/terms' },
    { name: 'Privacy Policy', path: '/settings/privacy' },
  ];

  return (
    <div className="w-72 min-h-screen bg-black/30 backdrop-blur-sm text-white flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {/* <Film className="h-8 w-8 text-primary" /> */}
          <img src="/assets/logo.png" alt="logo" className="h- w-16" />
          <h1 className="text-2xl font-bold">Creepy Shorts</h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-slate-300 hover:bg-slate-800"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={cn(
              "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors text-slate-300 hover:bg-slate-800",
              location.pathname.startsWith('/settings') && "bg-slate-800"
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

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center">
            <span className="text-sm font-bold">AD</span>
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-slate-400">admin@cine.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
