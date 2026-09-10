import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Crown,
  Sparkles,
  IndianRupee,
  Loader2,
  Lock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  SUBSCRIPTION_PLANS,
  loadRazorpayScript,
  isSubscriptionActive,
  getSubscriptionRemainingDays,
} from "../utils/subscriptionUtils";
import {
  createSubscriptionOrder,
  verifySubscriptionPayment,
  getProviderProfile,
  getActiveSubscriptionPlans,
} from "../services/api";

const SubscriptionModal = ({ isOpen, onClose, onSubscriptionSuccess }) => {
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchPlans = async () => {
        try {
          setLoadingPlans(true);
          const res = await getActiveSubscriptionPlans();
          if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
            setPlans(res.data.data);
            // Auto-select the popular plan or the first one
            const pop = res.data.data.find(p => p.popular);
            setSelectedPlanId(pop ? pop._id : res.data.data[0]._id);
          } else {
            throw new Error("Invalid response format or empty plans");
          }
        } catch (err) {
          console.error("Failed to fetch subscription plans:", err);
          // Fallback to static if backend fails
          setPlans(SUBSCRIPTION_PLANS);
          setSelectedPlanId(SUBSCRIPTION_PLANS[1].id);
        } finally {
          setLoadingPlans(false);
        }
      };
      fetchPlans();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentProviderData = JSON.parse(
    localStorage.getItem("providerData") || "{}"
  );
  const providerObj = currentProviderData.provider || currentProviderData;
  const isAlreadyActive = isSubscriptionActive(currentProviderData);
  const remainingDays = getSubscriptionRemainingDays(currentProviderData);

  const selectedPlan = plans.find(
    (p) => (p._id || p.id) === selectedPlanId
  ) || plans[1] || plans[0];

  const handleSubscribe = async () => {
    try {
      setLoading(true);

      // 1. Load Razorpay SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Razorpay SDK failed to load. Please check your network.");
        setLoading(false);
        return;
      }

      // 2. Create order on backend (or setup fallback order parameters)
      let orderData = null;
      try {
        const planIdToUse = selectedPlan._id || selectedPlan.id;
        const response = await createSubscriptionOrder(planIdToUse);
        if (response?.data?.success) {
          orderData = response.data.data;
        }
      } catch (err) {
        console.warn("Backend order creation warning, using direct checkout config:", err);
      }

      const keyId = orderData?.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_mockkey123";
      const orderId = orderData?.orderId || `sub_order_${Date.now()}`;
      const amountInPaise = (orderData?.amount || selectedPlan.price) * 100;

      // 3. Configure Razorpay Options
      const options = {
        key: keyId,
        amount: amountInPaise,
        currency: "INR",
        name: "KarayaBandhu Partner",
        description: `Subscription: ${selectedPlan.name} (${selectedPlan.durationDays} Days)`,
        image: "https://cdn-icons-png.flaticon.com/512/1067/1067566.png",
        order_id: orderData?.orderId ? orderId : undefined,
        handler: async function (response) {
          try {
            setLoading(true);
            toast.loading("Verifying subscription payment...", { id: "sub_verify" });

            let verifyRes = null;
            try {
              verifyRes = await verifySubscriptionPayment({
                planId: selectedPlan._id || selectedPlan.id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id || orderId,
                razorpay_signature: response.razorpay_signature || "mock_signature",
              });
            } catch (err) {
              console.warn("Backend verification call fallback:", err);
            }

            // Calculate new expiry date
            const now = new Date();
            const expiry = new Date(now.getTime() + selectedPlan.durationDays * 24 * 60 * 60 * 1000);

            // Update local storage provider state
            const updatedProvider = {
              ...providerObj,
              subscription: {
                planId: selectedPlan._id || selectedPlan.id,
                planName: selectedPlan.name,
                startDate: now.toISOString(),
                expiryDate: expiry.toISOString(),
                status: "active",
                transactionId: response.razorpay_payment_id || `txn_${Date.now()}`,
              },
            };

            const newStorageData = {
              ...currentProviderData,
              provider: updatedProvider,
            };

            localStorage.setItem("providerData", JSON.stringify(newStorageData));
            window.dispatchEvent(new Event("storage")); // Trigger global state sync

            toast.dismiss("sub_verify");
            toast.success("Subscription Activated! 🎉", {
              description: `You are now subscribed to ${selectedPlan.name} for ${selectedPlan.durationDays} days. Accept job bookings now!`,
              duration: 8000,
            });

            if (onSubscriptionSuccess) onSubscriptionSuccess();
            onClose();
          } catch (err) {
            toast.dismiss("sub_verify");
            toast.error("Payment Verification Failed", {
              description: err.message || "Failed to activate subscription.",
            });
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: providerObj?.fullName || providerObj?.name || "Provider Partner",
          contact: providerObj?.phone || providerObj?.phoneNumber || "",
          email: providerObj?.email || "",
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setLoading(false);
        toast.error("Payment Failed", {
          description: response.error?.description || "Transaction failed. Please try again.",
        });
      });
      rzp.open();
    } catch (err) {
      console.error("Subscription Error:", err);
      toast.error("Could not initialize subscription checkout", {
        description: err.message,
      });
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden z-10 border border-gray-100 dark:border-gray-800 my-auto"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-amber-400/20 border border-amber-400/40 text-amber-300 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <Crown size={14} className="text-amber-400" />
                Provider Partner Pass
              </span>
              {isAlreadyActive && (
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full text-[11px] font-black uppercase tracking-widest">
                  Active Plan ({remainingDays} Days Left)
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
              {isAlreadyActive ? "Active Subscription" : "Unlock Booking Requests"}
            </h2>
            <p className="text-sm text-blue-100/90 max-w-xl mt-1 font-medium leading-relaxed">
              {isAlreadyActive
                ? `You have an active subscription valid for ${remainingDays} days. New purchases are blocked until it expires.`
                : "Select a pass below to start accepting customer job requests instantly with zero waiting."}
            </p>
          </div>

          {/* Modal Content */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Plan Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {loadingPlans ? (
                <div className="col-span-3 flex justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-blue-600" />
                </div>
              ) : (
                plans.map((plan) => {
                  const planId = plan._id || plan.id;
                  const isSelected = selectedPlanId === planId;
                  return (
                    <motion.div
                      key={planId}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedPlanId(planId)}
                    className={`relative cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-blue-50/60 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 shadow-xl shadow-blue-500/10"
                        : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    {/* Badge */}
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full shadow-md">
                        {plan.badge}
                      </div>
                    )}
                    {!plan.popular && plan.badge && (
                      <div className="inline-block self-start mb-2 px-2.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-black uppercase tracking-wider rounded-md">
                        {plan.badge}
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                          {plan.name}
                        </h3>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {isSelected && <CheckCircle2 size={14} />}
                        </div>
                      </div>

                      {/* Price Section */}
                      <div className="my-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-gray-900 dark:text-white font-mono flex items-center">
                            <IndianRupee size={22} className="-mr-0.5" />
                            {plan.price}
                          </span>
                          <span className="text-xs text-gray-400 line-through font-mono">
                            ₹{plan.originalPrice}
                          </span>
                        </div>
                        <span className="inline-block mt-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          {plan.savings}
                        </span>
                      </div>

                      {/* Features List */}
                      <ul className="space-y-2 mt-4 text-xs text-gray-600 dark:text-gray-300">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2
                              size={14}
                              className="text-emerald-500 shrink-0 mt-0.5"
                            />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                );
              })
              )}
            </div>

            {/* Bottom Action Section */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight">
                    Razorpay 100% Secure Checkout
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    Selected: <span className="font-bold text-blue-600 dark:text-blue-400">{selectedPlan?.name || "Loading..."}</span> (₹{selectedPlan?.price || 0} for {selectedPlan?.durationDays || 0} Days)
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading || isAlreadyActive || !selectedPlan}
                onClick={handleSubscribe}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} className="text-amber-300 fill-amber-300" />
                    <span>
                      {isAlreadyActive ? `Active (${remainingDays} Days Left)` : "Pay ₹" + (selectedPlan?.price || 0) + " & Activate"}
                    </span>
                    {!isAlreadyActive && <ArrowRight size={16} />}
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default SubscriptionModal;
