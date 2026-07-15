import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfileQuery } from "@/redux/feature/authApi";
import AppImage from "@/components/share/AppImage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Navbar = ({ onMenuClick }) => {
  const { data } = useProfileQuery();
  const profile = data?.data;
  const name = profile?.name || "User";
  const email = profile?.email || "";

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
          {name}
        </h2>
      </div>

      {/* Profile Image with name/email tooltip */}
      <div className="flex items-center gap-2 sm:gap-4 sm:mr-10">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                aria-label={`${name}${email ? `, ${email}` : ""}`}
              >
                <AppImage
                  src={profile?.image}
                  alt={name}
                  width={128}
                  height={128}
                  quality={80}
                  fallbackSrc="/assets/profile.jpg"
                  className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover border-2 border-white/20"
                />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              align="end"
              className="bg-slate-900 border border-white/10 text-white px-3 py-2"
            >
              <div className="space-y-0.5 text-left">
                <p className="text-sm font-semibold leading-tight">{name}</p>
                {email ? (
                  <p className="text-xs text-white/70 leading-tight">{email}</p>
                ) : null}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default Navbar;
