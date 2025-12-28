import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfileQuery } from "@/redux/feature/authApi";
import { getImageUrl } from "@/components/share/imageUrl";

const Navbar = ({ onMenuClick }) => {
  const { data } = useProfileQuery();
  
  return (
    <div className="h-20 flex items-center justify-between px-4 sm:px-6">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-white hover:bg-white/10"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Welcome Section */}
      <div className="flex-1 md:flex-none">
        <p className="text-xs sm:text-sm text-slate-300">Welcome Back, </p>
        <h2 className="text-white text-lg sm:text-xl font-medium truncate">
          {data?.data?.name || "User"}
        </h2>
      </div>

      {/* Profile Image */}
      <div className="flex items-center gap-2 sm:gap-4">
        <img
          src={getImageUrl(data?.data?.image)}
          alt="profile"
          className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover cursor-pointer sm:mr-10"
        />
      </div>
    </div>
  );
};

export default Navbar;
