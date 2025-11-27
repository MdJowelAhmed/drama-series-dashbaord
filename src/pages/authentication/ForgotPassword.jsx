import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useState } from "react";

// Forgot Password Page
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      console.log("Reset link sent to:", email);
    }, 1500);
  };

  if (submitted) {
    return (
     
        <div className="flex justify-center px-4">
          <Card className="w-full max-w-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-gray-300 text-sm mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <Button
                onClick={onBackToLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
              >
                Back to Login
              </Button>
            </div>
          </Card>
        </div>
      
    );
  }

  return (
    
      <div className="flex justify-center px-4">
        <Card className="w-full max-w-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
          <div className="p-8">
            {/* <button
              onClick={onBackToLogin}
              className="text-gray-300 hover:text-white text-sm mb-6 flex items-center gap-1"
            >
              ← Back to Login
            </button> */}

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
                    className="pl-10 bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20"
                    required
                  />
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-6   text-white font-semibold  rounded-lg"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
          </div>
        </Card>
      </div>

  );
};

export default ForgotPasswordPage;