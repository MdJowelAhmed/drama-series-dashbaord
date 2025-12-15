import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProfileQuery } from "@/redux/feature/authApi";
import { getImageUrl } from "@/components/share/imageUrl";

const Navbar = () => {
  const { data } = useProfileQuery();
  console.log(data);
  return (
    <div className="h-20 bg-  flex items-center justify-between px-6 ">
      <div className="">
        <p>Welcome Back, </p>
        <h2 className="text-white text-xl font-medium">
          {data?.data?.name}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </Button> */}

        <img
          src={getImageUrl(data?.data?.image)}
          alt="logo"
          className="h-16 w-16  rounded-full object-cover cursor-pointer  mr-10"
        />
      </div>
    </div>
  );
};

export default Navbar;
