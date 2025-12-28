import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

const LayoutWrapper = () => {
  // Sidebar width and Navbar height define kore nilam
  const sidebarWidth = "290px";
  const navbarHeight = "80px";
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-[url('/assets/User.png')] bg-cover bg-center bg-no-repeat w-full h-full overflow-hidden">
      
      {/* Desktop Sidebar - Hidden on mobile */}
      <div
        className="hidden md:block fixed top-0 left-0 h-full z-40"
        style={{ width: sidebarWidth }}
      >
        <Sidebar />
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="w-[290px] p-0 bg-black/30 backdrop-blur-sm text-white border-0 [&>button]:hidden"
        >
          <Sidebar 
            onNavigate={() => setSidebarOpen(false)} 
            showCloseButton={true}
          />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div
        className="flex-1 flex flex-col min-w-0 md:ml-[290px]"
      >
        {/* Navbar */}
        <div
          className="fixed md:mr-3 top-0 right-0 left-0 md:left-[290px] bg-black/30 backdrop-blur-sm z-50"
          style={{ height: navbarHeight }}
        >
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
        </div>

        {/* Main content */}
        <main
          className="flex-1 overflow-y-auto h-full w-full"
          style={{ paddingTop: navbarHeight }}
        >
          <div className="h-full shadow-sm p-4 sm:p-6 lg:p-10 text-white">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default LayoutWrapper;
