import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  return (
    <div className="h-20 bg-  flex items-center justify-between px-6">
      <div className="flex items-center flex-1 max-w-xl">
        {/* <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search dramas, movies, users..."
            className="pl-10"
          />
        </div> */}
      </div>

      <div className="flex items-center gap-4">
        {/* <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </Button> */}
        <img src="/assets/profile.jpg" alt="logo" className="h-16 w-16 ml-10 rounded-full object-cover" />
      </div>
    </div>
  );
};

export default Navbar;
