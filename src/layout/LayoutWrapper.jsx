import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const LayoutWrapper = () => {
  // Sidebar width and Navbar height define kore nilam
  const sidebarWidth = "290px";
  const navbarHeight = "80px";

  return (
    <div className="flex bg-[url('/assets/User.png')] bg-cover bg-center bg-no-repeat w-full h-full  overflow-hidden">
      
      {/* Sidebar */}
      <div
        className="fixed top-0 left-0 h-full"
        style={{ width: sidebarWidth }}
      >
        <Sidebar />
      </div>

      {/* Main content area */}
      <div
        className="flex-1 flex flex-col min-w-0"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Navbar */}
        <div
          className="fixed  mr-3 top-0 right-0 left-0 bg-black/30 backdrop-blur-sm z-50"
          style={{ height: navbarHeight, marginLeft: sidebarWidth }}
        >
          <Navbar />
        </div>

        {/* Main content */}
        <main
          className="flex-1 overflow-y-auto h-full w-full"
          style={{ paddingTop: navbarHeight }}
        >
          <div className=" h-full shadow-sm p-4 md:p-6 lg:p-10 text-white"
              //  style={{
              //    background:
              //      "linear-gradient(to right, rgba(152,28,44,0.2), rgba(191,56,56,0.2))",
              //  }}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default LayoutWrapper;
