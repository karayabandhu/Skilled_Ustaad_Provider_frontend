import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, QrCode } from "lucide-react";
import QRScanner from "./common/QRScanner";
import { toast } from "sonner";

export default function OtpModal({
  show,
  onClose,
  onVerify,
  darkMode,
}) {

  const [otp, setOtp] = useState("");
  const inputRef = useRef(null);
  const [showScanner, setShowScanner] = useState(false);

  /* ================= AUTO FOCUS ================= */
  useEffect(() => {
    if (show) {
      setOtp("");
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [show]);

  /* ================= VERIFY ================= */
  const handleSubmit = (scannedOtp) => {
    const finalOtp = scannedOtp || otp;
    if (finalOtp.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }

    onVerify(finalOtp);
  };

  /* ================= SCAN HANDLER ================= */
  const handleScanSuccess = (data) => {
    const scannedOtp = data.otp || data;
    if (scannedOtp) {
      setOtp(scannedOtp);
      setShowScanner(false);
      // Auto-submit after scan
      onVerify(scannedOtp);
    }
  };

  /* ================= CLOSE ================= */
  const handleClose = () => {
    setOtp("");
    setShowScanner(false);
    onClose(); // slider reset handled in parent
  };

  return (
    <>
      <AnimatePresence>
        {show && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55]"
              onClick={handleClose}
            />

            {/* MODAL */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 40 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[60] flex items-center justify-center px-4"
            >
              <div
                className={`relative w-full max-w-md rounded-3xl p-8
                ${darkMode ? 'bg-slate-900/90' : 'bg-white/70'} backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden`}
              >
                
                {/* DECORATIVE BACKGROUND */}
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                {/* CLOSE BUTTON */}
                <button
                  onClick={handleClose}
                  className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} className="text-slate-500" />
                </button>

                {/* ICON */}
                <div className="flex justify-center mb-6">
                  <div className="p-4 rounded-3xl bg-indigo-100 dark:bg-indigo-900/40 shadow-inner">
                    <ShieldCheck className="text-indigo-600" size={32} />
                  </div>
                </div>

                {/* TITLE */}
                <h2 className="text-2xl font-black text-center mb-2 tracking-tighter dark:text-white uppercase">
                  Verify Assignment
                </h2>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">
                  Scan customer's QR or enter the 6-digit OTP to complete service
                </p>

                {/* OTP INPUT */}
                <div className="relative group">
                  <input
                    ref={inputRef}
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, ""))
                    }
                    className={`w-full text-center tracking-[12px]
                    text-3xl font-black py-4 rounded-2xl outline-none border transition-all
                    ${
                      darkMode
                        ? "bg-slate-950 border-slate-700 focus:border-indigo-500 text-white"
                        : "bg-slate-50 border-slate-200 focus:border-indigo-400 text-slate-800"
                    } placeholder:text-slate-200 dark:placeholder:text-slate-800`}
                    placeholder="000000"
                  />
                  
                  {/* SCAN BUTTON OVERLAY (Optional or Below) */}
                </div>

                <div className="flex flex-col gap-3 mt-8">
                  {/* VERIFY BUTTON */}
                  <button
                    onClick={() => handleSubmit()}
                    className="w-full py-4 rounded-2xl
                    bg-indigo-600 hover:bg-indigo-700
                    text-white font-bold transition active:scale-[0.98] shadow-lg shadow-indigo-600/20 uppercase tracking-widest text-sm"
                  >
                    Confirm Manually
                  </button>

                  <div className="flex items-center gap-4 my-3">
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Or use scanner</span>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                  </div>

                  {/* SCAN QR BUTTON */}
                  <button
                    onClick={() => setShowScanner(true)}
                    className="w-full py-4 rounded-2xl
                    bg-emerald-500 hover:bg-emerald-600
                    text-white font-bold transition active:scale-[0.98] shadow-lg shadow-emerald-500/20 uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                  >
                    <QrCode size={20} />
                    Scan QR Code
                  </button>
                </div>

                {/* CANCEL */}
                <button
                  onClick={handleClose}
                  className="w-full mt-6 py-2 text-xs font-black
                  text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                >
                  Cancel & Return
                </button>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* QR SCANNER MODAL */}
      <AnimatePresence>
          {showScanner && (
              <QRScanner 
                  onScanSuccess={handleScanSuccess}
                  onClose={() => setShowScanner(false)}
                  darkMode={darkMode}
              />
          )}
      </AnimatePresence>
    </>
  );
}