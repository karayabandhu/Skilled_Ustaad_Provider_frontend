import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, QrCode, Loader2 } from "lucide-react";
import QRScanner from "./common/QRScanner";
import { toast } from "sonner";

export default function AssignmentVerifyModal({
  show,
  onClose,
  onVerify,
  darkMode,
  title = "Verify Assignment",
  subtitle = "Scan customer's QR or enter the 6-digit OTP to start service"
}) {

  const [otp, setOtp] = useState("");
  const inputRef = useRef(null);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setOtp("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [show]);

  const handleSubmit = async (scannedOtp) => {
    const finalOtp = scannedOtp || otp;
    if (finalOtp.length !== 6) {
      return; // Or show error
    }

    setLoading(true);
    try {
      await onVerify(finalOtp);
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = (data) => {
    let scannedOtp = "";

    // Normalize data: Handle if scanner returns a string or an object
    const dataStr = (typeof data === 'string') ? data.trim() : (data?.otp || data?.OTP || data?.verificationCode || JSON.stringify(data));

    // console.log("QR Data Scanned:", dataStr);

    // 1. Check for raw 6-digit OTP first (fastest)
    const rawMatches = dataStr.match(/\b\d{6}\b/);
    if (rawMatches) {
      scannedOtp = rawMatches[0];
    } else {
      // 2. Attempt to parse JSON
      if (dataStr.startsWith('{') || dataStr.startsWith('[')) {
        try {
          const parsed = JSON.parse(dataStr);
          scannedOtp = parsed.otp || parsed.OTP || parsed.verificationCode || "";
        } catch (e) {
          console.warn("QR JSON parse failed", e);
        }
      }

      // 3. Check for common key-value formats or URLs
      if (!scannedOtp || String(scannedOtp).length !== 6) {
        // Check for format: booking:ID|otp:123456
        if (dataStr.includes('|otp:')) {
          const parts = dataStr.split('|otp:');
          scannedOtp = parts.length > 1 ? parts[1].substring(0, 6) : "";
        }
        // Check for URL query params: ?otp=123456
        else if (dataStr.includes('otp=')) {
          const urlMatch = dataStr.match(/otp=(\d{6})/);
          if (urlMatch) scannedOtp = urlMatch[1];
        }
        // Final fallback: Any sequence of 6 digits anywhere in the string
        else {
          const anyDigits = dataStr.match(/\d{6}/);
          if (anyDigits) scannedOtp = anyDigits[0];
        }
      }
    }

    const finalOtp = String(scannedOtp).trim();

    // Safety: If we found something, update the UI even if it's not 6 digits (let user fix)
    if (finalOtp) {
      setOtp(finalOtp.substring(0, 6));
    }

    if (finalOtp && finalOtp.length === 6) {
      setShowScanner(false);
      onVerify(finalOtp);
    } else {
      console.error("No valid 6-digit OTP found in QR:", dataStr);
      toast.error("Invalid QR format. Please use the customer's verification OTP manually if QR fails.");
      setShowScanner(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setOtp("");
    setShowScanner(false);
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
              onClick={handleClose}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{
                scale: showScanner ? 0.95 : 1,
                opacity: showScanner ? 0.3 : 1,
                y: 0
              }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`fixed inset-0 z-[101] flex items-center justify-center px-4 ${showScanner ? 'pointer-events-none' : 'pointer-events-auto'}`}
            >
              <div
                className={`relative w-full max-w-md rounded-[2.5rem] p-6 sm:p-10
                ${darkMode ? 'bg-slate-900 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'bg-white border-slate-100 shadow-2xl'} border`}
              >

                <button
                  onClick={handleClose}
                  className="absolute right-4 top-4 sm:right-6 sm:top-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>

                <div className="flex justify-center mb-6 sm:mb-8">
                  <div className="p-4 sm:p-5 rounded-[2rem] bg-indigo-600/10 dark:bg-indigo-500/10 border border-indigo-500/20 shadow-inner">
                    <ShieldCheck className="text-indigo-600 dark:text-indigo-400" size={32} md:size={40} />
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-center mb-2 tracking-tighter dark:text-white uppercase italic">
                  {title}
                </h2>

                <p className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 sm:mb-10 font-medium leading-relaxed max-w-[280px] mx-auto">
                  {subtitle}
                </p>

                <div className="space-y-6 sm:space-y-8">
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className={`w-full text-center tracking-[15px] md:tracking-[25px]
                        text-3xl sm:text-4xl font-black py-4 sm:py-6 rounded-3xl outline-none border-2 transition-all
                        ${darkMode
                          ? "bg-slate-950 border-slate-800 focus:border-indigo-500 text-white"
                          : "bg-slate-50 border-slate-200 focus:border-indigo-400 text-slate-800"
                        } placeholder:text-slate-100 dark:placeholder:text-slate-900`}
                      placeholder="000000"
                    />
                  </div>

                  <button
                    onClick={() => handleSubmit()}
                    disabled={otp.length !== 6 || loading}
                    className="w-full py-4 sm:py-5 rounded-3xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black transition-all active:scale-[0.98] shadow-xl shadow-indigo-600/30 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : "Confirm Manually"}
                  </button>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">or use scanner</span>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                  </div>

                  <button
                    onClick={() => setShowScanner(true)}
                    className="w-full py-4 sm:py-5 rounded-3xl bg-emerald-500 hover:bg-emerald-400 text-white font-black transition-all active:scale-[0.98] shadow-xl shadow-emerald-500/30 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
                  >
                    <QrCode size={20} />
                    Scan QR Code
                  </button>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full mt-6 sm:mt-10 py-2 text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-[0.3em]"
                >
                  Cancel & Return
                </button>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {showScanner && (
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
          darkMode={darkMode}
        />
      )}
    </>
  );
}
