import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/layout/AuthLayout";
import { useLoginMutation } from "@/redux/feature/authApi";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { baseUrl } from "@/redux/base-url/baseUrlApi";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  // Check if user is already logged in with valid token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          localStorage.removeItem('userProfile');
          return;
        }
        // If role is SUPER_ADMIN or ADMIN, redirect to home
        if (decoded.role === 'SUPER_ADMIN' || decoded.role === 'ADMIN') {
          navigate("/");
        } else {
          // Remove invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('userProfile');
        }
      } catch (error) {
        // Invalid token, remove it
        localStorage.removeItem('token');
        localStorage.removeItem('userProfile');
      }
    }
  }, [navigate]);

  // Function to fetch user profile for ADMIN users
  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${baseUrl}/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      return null;
    }
  };

  const onFinish = async () => {
    try {
      setLoading(true);
      const response = await login({
        email,
        password,
      }).unwrap();

      if (response.success) {
        const token = response.data.accessToken;
        localStorage.setItem("token", token);

        // Decode token to check role
        const decoded = jwtDecode(token);

        // Check if role is SUPER_ADMIN or ADMIN
        if (decoded.role === "SUPER_ADMIN") {
          // Store role info for sidebar
          localStorage.setItem("userProfile", JSON.stringify({ role: "SUPER_ADMIN" }));
          navigate("/");
        } else if (decoded.role === "ADMIN") {
          // Fetch profile to get pageAccess
          const profileData = await fetchUserProfile(token);
          if (profileData) {
            // Store profile data with pageAccess
            localStorage.setItem("userProfile", JSON.stringify({
              role: "ADMIN",
              pageAccess: profileData.pageAccess || [],
              name: profileData.name,
              email: profileData.email,
            }));
            navigate("/");
          } else {
            localStorage.removeItem("token");
            toast.error("Failed to fetch user profile. Please try again.");
          }
        } else {
          // If role is neither SUPER_ADMIN nor ADMIN, show error and remove token
          localStorage.removeItem("token");
          localStorage.removeItem("userProfile");
          toast.error("Access denied. Only ADMIN or SUPER_ADMIN can access this application.");
        }
      }
    } catch (err) {
      console.error("Login failed:", err);
      toast.error(err.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };


const handleForgotPassword = () => {
  navigate("/forgot-password");
};

  return (
  
      <div className="flex justify-center px-4">
        <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
          <div className="p-8">
            {/* Logo/Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-gray-300 text-sm">Sign in to your account</p>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-400 hover:text-blue-300 transition"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <Button
                onClick={onFinish}
                disabled={isLoading || loading}
                className="w-full   text-white font-semibold py-6 rounded-lg flex items-center justify-center gap-2 transition"
              >
                {isLoading || loading ? (
                  <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>

            
          </div>
        </Card>
      </div>
  
  );
};

export default LoginPage;