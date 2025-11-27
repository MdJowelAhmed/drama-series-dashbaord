import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "@/layout/AuthLayout";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";

const LoginPage = ({ onForgotPassword, onSignUp }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log("Login:", { email, password });
      alert("Login successful!");
    }, 1500);
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
                  onClick={onForgotPassword}
                  className="text-sm text-blue-400 hover:text-blue-300 transition"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition"
              >
                {loading ? "Signing in..." : "Sign In"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-300 text-sm">
                Don't have an account?{" "}
                <button
                  onClick={onSignUp}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </Card>
      </div>
  
  );
};

export default LoginPage;