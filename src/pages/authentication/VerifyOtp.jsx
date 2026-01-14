import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useOtpVerifyMutation, useResendOtpMutation } from "@/redux/feature/authApi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const [otpVerify, { isLoading }] = useOtpVerifyMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    if (!storedEmail) {
      toast.error("Email not found. Please start over.");
      navigate("/forgot-password");
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }

    try {
      const response = await otpVerify({
        email,
        oneTimeCode: Number(otpValue),
      }).unwrap();

      if (response.success) {
        toast.success(response.message || "OTP verified successfully");
        localStorage.setItem("resetToken", response.data.verifyToken);
        navigate("/reset-password");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Invalid OTP");
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await resendOtp({ email }).unwrap();

      if (response.success) {
        toast.success(response.message || "OTP resent successfully");
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="flex justify-center px-4">
      <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Verify OTP</h1>
            <p className="text-gray-300 text-sm">
              Enter the 6-digit code sent to <strong>{email}</strong>
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 bg-white/10 border border-white/20 text-white text-center text-lg font-semibold rounded-lg focus:bg-white/20 focus:border-blue-400 outline-none transition"
                />
              ))}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isLoading || otp.join("").length !== 6}
              className="w-full text-white font-semibold rounded-md disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>

            <div className="text-center">
              <p className="text-gray-300 text-sm">
                Didn't receive code?{" "}
                <button
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-blue-400 hover:text-blue-300 font-semibold disabled:opacity-50"
                >
                  {isResending ? "Sending..." : "Resend"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VerifyOtpPage;
