import React, { useState, useRef, useEffect } from "react";
import { ShieldCheck, CheckCircle2, RotateCcw } from "lucide-react";
import { verifyOTP, registerProvider } from "../../services/api";

const Step2OTP = ({ nextStep, data }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleChange = (e, index) => {
    const value = e.target.value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;

    try {
      setIsResending(true);
      setError("");
      await registerProvider({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber
      });
      setResendTimer(60);
      setOtp(["", "", "", ""]);
      inputRefs.current[0].focus();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 4) {
      setError("Please enter the complete 4-digit OTP.");
      return;
    }

    try {
      const response = await verifyOTP({
        phoneNumber: data.phoneNumber,
        otp: enteredOtp
      });

      const { accessToken } = response.data;
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        nextStep();
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/30 rounded-full flex items-center justify-center border-4 border-blue-100 dark:border-blue-900/50">
          <ShieldCheck size={32} className="text-blue-600" />
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          We've sent a secure code to
        </p>
        <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
          +91 {data.phoneNumber}
        </p>
        {/* Testing Hint */}
        {["9999999999", "1234567890"].includes(data.phoneNumber) && (
          <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mt-2">
            Demo Mode: Use OTP 1234
          </p>
        )}
      </div>

      <form onSubmit={handleVerifyOTP} className="space-y-8 text-center">
        <div className="flex justify-center gap-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-14 h-16 text-center text-2xl font-black bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none dark:text-white transition-all shadow-sm"
              required
              autoFocus={index === 0}
            />
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold flex items-center justify-center gap-2 border border-red-100 dark:border-red-900/20">
            <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
            {error}
          </div>
        )}

        <div className="pt-2">
          <button
            type="button"
            disabled={resendTimer > 0 || isResending}
            onClick={handleResend}
            className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline underline-offset-4 disabled:text-slate-400 disabled:no-underline flex items-center justify-center gap-2 mx-auto"
          >
            <RotateCcw size={14} className={isResending ? "animate-spin" : ""} />
            {resendTimer > 0
              ? `Resend OTP in ${resendTimer}s`
              : isResending ? "Sending..." : "Didn't receive code? Resend OTP"}
          </button>
        </div>

        <button
          type="submit"
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <CheckCircle2 size={22} />
          Verify & Continue
        </button>
      </form>
    </div>
  );
};

export default Step2OTP;
