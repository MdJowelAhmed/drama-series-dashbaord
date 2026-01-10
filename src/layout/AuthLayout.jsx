import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
      style={{ backgroundImage: "url('/assets/User.webp')" }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6">
        <Outlet />
      </div>
    </div>
  );
};
