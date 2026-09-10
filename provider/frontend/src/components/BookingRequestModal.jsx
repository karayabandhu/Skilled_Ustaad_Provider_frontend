import React from "react";
import {
  X,
  MapPin,
  Clock,
  User,
  Phone,
  Briefcase,
  IndianRupee,
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
  Crown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { handleBookingAction, api } from "../services/api";
import { toast } from "sonner";
import { isSubscriptionActive } from "../utils/subscriptionUtils";
import SubscriptionModal from "./SubscriptionModal";

const BookingRequestModal = ({ booking, onClose }) => {
  const [step, setStep] = React.useState("details"); // 'details' or 'estimate'
  const [estimate, setEstimate] = React.useState(60); // default 60 mins
  const [loading, setLoading] = React.useState(false);
  const [acceptedBookingId, setAcceptedBookingId] = React.useState(null);
  const [timeLeft, setTimeLeft] = React.useState(15); // 15s timeout matching backend batch response timeout
  const [showSubModal, setShowSubModal] = React.useState(false);

  const [localAlreadyAccepted, setLocalAlreadyAccepted] = React.useState(false);

  const hasActiveSub = isSubscriptionActive();

  if (!booking) return null;

  const currentProviderId = localStorage.getItem("providerId");
  const jobProviderId = booking.providerId?._id || booking.providerId;
  const isAlreadyAccepted = 
    localAlreadyAccepted ||
    (booking.providerId && jobProviderId !== currentProviderId) ||
    (booking.status && booking.status !== "paid" && booking.status !== "pending" && booking.status !== "no_provider_found");
  const serviceName = (
    booking.serviceType ||
    booking.service ||
    booking.category ||
    ""
  ).toLowerCase();

  const isEmergencyService =
    serviceName.includes("emergency") ||
    booking.category?.toLowerCase() === "emergency service";
  let warningMessage = "";
  if (isAlreadyAccepted) {
    if (booking.status === "cancelled") {
      warningMessage = "This job has been cancelled by the customer.";
    } else {
      warningMessage = "This job has already been accepted by another expert.";
    }
  }

  React.useEffect(() => {
    if (step !== "details" || isAlreadyAccepted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, onClose, isAlreadyAccepted]);

  const handleAction = async (action) => {
    try {
      setLoading(true);
      const bId = booking._id || booking.id || booking.bookingId;
      if (!bId) throw new Error("Booking ID missing");

      const res = await handleBookingAction(bId, action);

      if (action === "accepted") {
        setAcceptedBookingId(bId);
        setStep("estimate");
      } else {
        onClose();
      }
    } catch (err) {
      console.error(`Error ${action}ing booking:`, err);
      const errorMsg =
        err.response?.data?.error || err.response?.data?.message || err.message;

      if (errorMsg.includes("already busy") || errorMsg.includes("schedule")) {
        toast.error("Scheduling Conflict", {
          description:
            "Your schedule on that date and time is already busy with another job!",
          duration: 6000,
        });
        onClose();
      } else if (errorMsg.includes("already been accepted") || errorMsg === "Booking already taken" || errorMsg.includes("got to this job first")) {
        toast.error("Booking Already Taken", {
          description: "Oops! Another expert just accepted this job.",
        });
        setLocalAlreadyAccepted(true); // Show the in-modal banner instead of closing
      } else {
        toast.error("Acceptance Failed", {
          description: errorMsg,
        });
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEstimate = async () => {
    try {
      setLoading(true);
      await api.put("/provider/booking/estimate", {
        bookingId: acceptedBookingId,
        duration: estimate,
      });
      toast.success("Schedule Updated", {
        description: `We've blocked ${estimate} mins + 20 mins buffer for this job.`,
      });
      onClose();
    } catch (err) {
      console.error("Error saving estimate:", err);
      toast.error("Estimate Failed", {
        description:
          "Could not save job duration. You can update it later in job details.",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Calculate timer percentage for progress bar
  const TOTAL_TIME = 15;
  const timerPercent = (timeLeft / TOTAL_TIME) * 100;
  const circumference = 2 * Math.PI * 18; // radius = 18
  const timerColor =
    timeLeft > 8 ? "#22c55e" : timeLeft > 4 ? "#f59e0b" : "#ef4444";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          {/* Timer Progress Bar at top of modal */}
          {step === "details" && !isAlreadyAccepted && (
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/20 z-20">
              <motion.div
                className="h-full rounded-full transition-colors duration-500"
                style={{ backgroundColor: timerColor }}
                animate={{ width: `${timerPercent}%` }}
                transition={{ duration: 0.9, ease: "linear" }}
              />
            </div>
          )}

          {/* Header Image/Background */}
          <div
            className={`relative h-32 p-6 flex items-end ${
              isEmergencyService
                ? "bg-gradient-to-r from-red-600 to-rose-700"
                : "bg-gradient-to-r from-blue-600 to-indigo-700"
            }`}
          >
            <div className="absolute top-4 right-4 flex items-center gap-3">
              {step === "details" && !isAlreadyAccepted && (
                <div className="relative w-10 h-10 flex items-center justify-center">
                  {/* Circular countdown SVG */}
                  <svg
                    className="absolute inset-0 w-10 h-10 -rotate-90"
                    viewBox="0 0 40 40"
                  >
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      fill="none"
                      stroke={timerColor}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={
                        circumference * (1 - timerPercent / 100)
                      }
                      style={{
                        transition:
                          "stroke-dashoffset 0.9s linear, stroke 0.5s",
                      }}
                    />
                  </svg>
                  <span className="text-white text-[11px] font-black leading-none relative z-10">
                    {timeLeft}
                  </span>
                </div>
              )}
              <button
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <Briefcase className="text-white w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight uppercase">
                New Service Request
              </h2>
            </div>
          </div>

          {step === "details" ? (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Warning Banner if accepted */}
              {isAlreadyAccepted && (
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-3 text-left">
                  <div className="p-1.5 bg-amber-100 dark:bg-amber-800 rounded-lg shrink-0 mt-0.5">
                    <AlertCircle
                      size={16}
                      className="text-amber-700 dark:text-amber-400"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest leading-none mb-1">
                      Job Status
                    </p>
                    <p className="text-xs text-amber-700/80 dark:text-amber-400/80 font-bold leading-relaxed">
                      {warningMessage}
                    </p>
                  </div>
                </div>
              )}
              {/* Service & Price */}
              <div
                className={`flex justify-between items-start gap-4 p-4 rounded-2xl border ${
                  isEmergencyService
                    ? "bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30"
                    : "bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30"
                }`}
              >
                <div>
                  <p
                    className={`text-xs font-bold uppercase tracking-widest mb-1 ${
                      isEmergencyService
                        ? "text-red-600 dark:text-red-400"
                        : "text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    Requested Service
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase line-clamp-1">
                    {booking.serviceType ||
                      booking.service ||
                      "General Service"}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Total Pay
                  </p>
                  <div
                    className={`flex items-center text-2xl font-black font-mono ${
                      isEmergencyService
                        ? "text-red-700 dark:text-red-400"
                        : "text-blue-700 dark:text-blue-400"
                    }`}
                  >
                    <IndianRupee className="w-5 h-5" />
                    <span>{booking.totalPrice || booking.price || 0}</span>
                  </div>
                </div>
              </div>

              {/* Earnings Breakdown */}
              {(() => {
                const totalPrice = booking.totalPrice || booking.price || 0;
                const commission = Math.round(totalPrice * 0.1);
                const inHand = totalPrice - commission;
                return (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5 text-xs text-left">
                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                      <span className="font-bold uppercase tracking-tight">
                        Service Charge (Base Price)
                      </span>
                      <span className="font-bold font-mono flex items-center gap-0.5">
                        <IndianRupee size={12} />
                        {totalPrice}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-red-500 dark:text-red-400">
                      <span className="font-bold uppercase tracking-tight">
                        Platform Commission (10%)
                      </span>
                      <span className="font-bold font-mono flex items-center gap-0.5">
                        - <IndianRupee size={12} />
                        {commission}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-500 pt-2.5 border-t border-dashed border-slate-200 dark:border-slate-700">
                      <span className="font-black uppercase tracking-tight">
                        In Hand Amount (Your Earning)
                      </span>
                      <span className="font-black font-mono flex items-center gap-0.5">
                        <IndianRupee size={12} />
                        {inHand}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl h-fit">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Customer
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {booking.userId?.fullName ||
                        booking.customerName ||
                        "Member Customer"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl h-fit">
                    <CalendarDays className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Date
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {booking.bookingDate || booking.date
                        ? new Date(booking.bookingDate || booking.date).toLocaleDateString()
                        : "Instant Request"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl h-fit">
                    <Clock className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Time Slot
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {booking.bookingSlot || booking.time || "Morning / Standard"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 col-span-1 sm:col-span-2">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl h-fit">
                    <MapPin className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Location
                    </p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 italic">
                      {booking.houseNo || booking.colony || booking.landMark
                        ? `${booking.houseNo ? booking.houseNo + ", " : ""}${booking.colony ? booking.colony + ", " : ""}${booking.city}${booking.landMark ? " (Near " + booking.landMark + ")" : ""}`
                        : booking.address || "Location shared upon acceptance"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subscription Notice Banner */}
              {!hasActiveSub && !isAlreadyAccepted && (
                <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/60 rounded-xl text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
                      <Lock size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                        Subscription Required / Expired
                      </p>
                      <p className="text-xs text-amber-700/90 dark:text-amber-300/90 font-medium leading-tight mt-0.5">
                        You are verified by admin, but you need an active subscription plan to accept job requests.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSubModal(true)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Crown size={14} />
                    <span>Subscribe Now</span>
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  onClick={() => handleAction("declined")}
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-6 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/30 transition-all disabled:opacity-50"
                >
                  <XCircle size={18} />
                  <span>Pass Job</span>
                </motion.button>
                <motion.button
                  whileHover={!isAlreadyAccepted && hasActiveSub ? { scale: 1.02 } : {}}
                  whileTap={!isAlreadyAccepted && hasActiveSub ? { scale: 0.98 } : {}}
                  disabled={loading || isAlreadyAccepted || !hasActiveSub}
                  onClick={() => {
                    if (!hasActiveSub) {
                      setShowSubModal(true);
                      return;
                    }
                    handleAction("accepted");
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-bold uppercase tracking-widest text-xs rounded-2xl transition-all ${
                    isAlreadyAccepted || !hasActiveSub
                      ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-none"
                      : isEmergencyService
                        ? "bg-red-600 text-white shadow-lg shadow-red-500/20 hover:bg-red-700"
                        : "bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
                  }`}
                >
                  {loading ? (
                    <Clock className="animate-spin" />
                  ) : !hasActiveSub ? (
                    <Lock size={18} />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                  <span>{isAlreadyAccepted ? "Job Taken" : !hasActiveSub ? "Subscription Required" : "Accept Job"}</span>
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 space-y-6 text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-white dark:border-gray-800 shadow-xl">
                <Clock className="text-green-600 w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                  Job Accepted!
                </h3>
                <p className="text-sm text-gray-500 font-medium max-w-[250px] mx-auto mt-2">
                  How long do you estimate this job will take to complete?
                </p>
              </div>

              <div className="py-4">
                <div className="flex items-center justify-center gap-6 mb-8">
                  {[30, 60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setEstimate(mins)}
                      className={`flex flex-col items-center gap-2 group transition-all ${estimate === mins ? "scale-110" : "opacity-50 grayscale hover:opacity-100 hover:grayscale-0"}`}
                    >
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all ${estimate === mins ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/30 text-white" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600"}`}
                      >
                        <span className="text-lg font-black">{mins}</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tighter">
                        Mins
                      </span>
                    </button>
                  ))}
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-3 text-left">
                  <div className="p-1.5 bg-amber-100 dark:bg-amber-800 rounded-lg shrink-0 mt-0.5">
                    <Clock size={12} className="text-amber-700" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest leading-none mb-1">
                      Expert Tip
                    </p>
                    <p className="text-xs text-amber-700/80 dark:text-amber-400/80 font-medium leading-relaxed">
                      We automatically add a{" "}
                      <span className="font-bold underline">
                        20-minute buffer
                      </span>{" "}
                      after your end time to account for travel.
                    </p>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveEstimate}
                disabled={loading}
                className="w-full py-5 bg-green-600 text-white font-black uppercase tracking-[0.2em] text-sm rounded-2xl shadow-xl shadow-green-500/20 hover:bg-green-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <Clock className="animate-spin" />
                ) : (
                  <CheckCircle2 size={20} />
                )}
                Confirm Schedule
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>

      <SubscriptionModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
      />
    </AnimatePresence>
  );
};

export default BookingRequestModal;
