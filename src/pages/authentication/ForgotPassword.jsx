import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForgotPasswordMutation } from "@/redux/feature/authApi";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      const response = await forgotPassword({ email }).unwrap();

      if (response.success) {
        localStorage.setItem("resetEmail", email);
        toast.success(response.message || "OTP sent to your email");
        navigate("/verify-email");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send reset link");
    }
  };

  return (
    <div className="flex justify-center px-4">
      <Card className="w-full max-w-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-gray-300 text-sm">
              Enter your email to receive a reset link
            </p>
          </div>

          <div className="space-y-10">
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
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="pl-10 bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20"
                  required
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-6 text-white font-semibold rounded-lg"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
