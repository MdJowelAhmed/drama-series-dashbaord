// Verify OTP Page
const VerifyOtpPage = ({ email, onBackToLogin, onOtpVerified }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleSubmit = () => {
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        console.log("OTP verified:", otpValue);
        onOtpVerified();
      }, 1500);
    }
  };

  return (
    <AuthLayout>
      <div className="flex justify-center px-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
          <div className="p-8">
            <button
              onClick={onBackToLogin}
              className="text-gray-300 hover:text-white text-sm mb-6 flex items-center gap-1"
            >
              ← Back to Login
            </button>

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
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !digit && index > 0) {
                        document.getElementById(`otp-${index - 1}`)?.focus();
                      }
                    }}
                    className="w-12 h-12 bg-white/10 border border-white/20 text-white text-center text-lg font-semibold rounded-lg focus:bg-white/20 focus:border-blue-400 outline-none transition"
                  />
                ))}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading || otp.join("").length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>

              <div className="text-center">
                <p className="text-gray-300 text-sm">
                  Didn't receive code?{" "}
                  <button className="text-blue-400 hover:text-blue-300 font-semibold">
                    Resend
                  </button>
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AuthLayout>
  );
};
