import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useResetPasswordMutation } from "@/redux/feature/authApi";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    if (!storedEmail) {
      toast.error("Session expired. Please start over.");
      navigate("/forgot-password");
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      const response = await resetPassword({
        email,
        newPassword: password,
        confirmPassword,
      }).unwrap();

      if (response.success) {
        localStorage.removeItem("resetEmail");
        toast.success(response.message || "Password reset successfully");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to reset password");
    }
  };

  const handleBackToLogin = () => {
    localStorage.removeItem("resetEmail");
    navigate("/login");
  };

  return (
    <div className="flex justify-center px-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
        <div className="p-8">
          <button
            onClick={handleBackToLogin}
            className="text-gray-300 hover:text-white text-sm mb-6 flex items-center gap-1"
          >
            ← Back to Login
          </button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-gray-300 text-sm">Create a new password for your account</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                New Password
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
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="pl-10 pr-10 bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full text-white font-semibold py-6 rounded-lg"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
