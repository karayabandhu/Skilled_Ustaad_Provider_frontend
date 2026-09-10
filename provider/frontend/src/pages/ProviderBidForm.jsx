import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Gavel,
  FileText,
  Image,
  Link as LinkIcon,
  IndianRupee,
  Clock,
  Briefcase,
} from "lucide-react";
import { placeBid, getProviderBids, getProviderProfile } from "../services/api";
import { formatDate } from "../utils/formatters";
import SEO from "../components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const ProviderBidForm = () => {
  const { t } = useTranslation();
  const { requestId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const request = location.state?.request;
  const [showFullFeatures, setShowFullFeatures] = useState(false);
  const [showFullDomainHosting, setShowFullDomainHosting] = useState(false);
  const [showFullDesignAssets, setShowFullDesignAssets] = useState(false);
  const [showFullOtherDetails, setShowFullOtherDetails] = useState(false);

  const [providerData, setProviderData] = useState(() => {
    return JSON.parse(localStorage.getItem("providerData") || "{}");
  });
  const isOffline = providerData?.isAvailable !== true;

  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const res = await getProviderProfile();
        const profile = res.data?.provider || res.provider || res;
        if (profile) {
          localStorage.setItem("providerData", JSON.stringify(profile));
          setProviderData(profile);
        }
      } catch (err) {
        console.error("Error fetching provider profile:", err);
      }
    };
    fetchLatestProfile();
  }, []);

  const [formData, setFormData] = useState({
    amount: request?.budget || "",
    estimatedDuration: "2",
    proposal: "",
    experience: "",
    projectLink: "",
    proofOfWorkImage: "", // Base64 or URL
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAlreadyBid, setHasAlreadyBid] = useState(false);

  useEffect(() => {
    const checkExistingBid = async () => {
      try {
        const res = await getProviderBids();
        const bids = res.data.bids || [];
        const alreadyBid = bids.some(
          (bid) => (bid.requestId?._id || bid.requestId) === requestId,
        );
        setHasAlreadyBid(alreadyBid);
        if (alreadyBid) {
          toast.info(t("bid_form.toast_already_bid"));
        }
      } catch (err) {
        console.error("Error checking existing bid:", err);
      }
    };
    checkExistingBid();
  }, [requestId]);

  // Convert uploaded image to Base64 for easy JSON transmission
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, proofOfWorkImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const latestProviderData = JSON.parse(localStorage.getItem("providerData") || "{}");
    if (latestProviderData?.isAvailable !== true) {
      toast.error("You are offline. Please turn on your availability to send proposals.");
      return;
    }

    if (!formData.amount || !formData.proposal) {
      toast.error(t("bid_form.toast_fill_required"));
      return;
    }

    setIsSubmitting(true);
    try {
      const bidAmount = Number(formData.amount);
      await placeBid({
        requestId: requestId,
        amount: bidAmount,
        message: formData.proposal, // Fallback for backward compatibility
        proposal: formData.proposal,
        estimatedDuration: formData.estimatedDuration,
        experience: formData.experience,
        proofOfWorkImage: formData.proofOfWorkImage,
        projectLink: formData.projectLink,
      });

      toast.success(t("bid_form.toast_success"));
      setTimeout(() => {
        navigate("/profile/my-bids");
      }, 2000);
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || t("bid_form.toast_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:text-white">
        {t("bid_form.error_not_found")}
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-4 pb-24 bg-gray-50 dark:bg-gray-950 transition-colors duration-500 relative">
      <SEO title={`${t("bid_form.title")} | ${request.subService}`} />

      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-10 relative flex items-center justify-center">
          {/* Back arrow only — no text */}
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="absolute left-0 flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-900 shadow-sm hover:bg-amber-500 hover:text-white text-gray-500 dark:text-gray-400 transition-all group"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Centered heading */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Gavel size={16} className="text-amber-500" />
              <span className="text-amber-500 font-black uppercase tracking-[0.2em] text-[10px] italic">
                {t("common.marketplace")}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
              {t("bid_form.submit_proposal").split(" ")[0]}{" "}
              <span className="text-amber-500 italic">
                {t("bid_form.submit_proposal").split(" ").slice(1).join(" ")}
              </span>
            </h1>
          </div>
        </div>

        <div className="space-y-8">
          {" "}
          {/* Left: Job Summary */}
          <div className="space-y-6">
            {" "}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-amber-500/5 overflow-hidden">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
                {t("bid_form.job_details")}
              </h3>
              <div className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4">
                {request.category}
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter mb-4 uppercase leading-tight">
                {request.subService}
              </h2>
              <div className="space-y-4 mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  "{request.description}"
                </p>

                {request.deadline && (
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300">
                    <Clock size={14} className="text-amber-500" />
                    <span>
                      {t("bid_form.deadline")}:{" "}
                      {formatDate(request.deadline, "short")}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 mb-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  {t("bid_form.customer_budget")}
                </p>
                <p className="text-2xl font-black text-blue-600 tracking-tighter">
                  ₹{request.budget}
                </p>
              </div>

              {request.keyFeatures && (
                <div className="mb-6">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    {t("bid_form.key_features")}
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800 whitespace-pre-wrap break-words overflow-hidden">
                    {showFullFeatures
                      ? request.keyFeatures
                      : `${(request.keyFeatures || "").slice(0, 180)}${
                          (request.keyFeatures || "").length > 180 ? "..." : ""
                        }`}

                    {(request.keyFeatures || "").length > 180 && (
                      <button
                        type="button"
                        onClick={() => setShowFullFeatures(!showFullFeatures)}
                        className="block mt-2 text-amber-500 font-black text-xs hover:underline"
                      >
                        {showFullFeatures ? "See Less" : "See More"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {request.technicalAssets &&
                (request.technicalAssets.domainHosting ||
                  request.technicalAssets.designAssets ||
                  request.technicalAssets.other) && (
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                      {t("bid_form.technical_assets")}
                    </h4>
                    <div className="space-y-3">
                      {request.technicalAssets.domainHosting && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                          <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">
                            {t("bid_form.domain_hosting")}
                          </p>
                          <p className="text-xs font-medium dark:text-gray-300 whitespace-pre-wrap break-words overflow-hidden text-left">
                            {showFullDomainHosting
                              ? String(
                                  request.technicalAssets.domainHosting || "",
                                ).trim()
                              : `${String(
                                  request.technicalAssets.domainHosting || "",
                                )
                                  .trim()
                                  .slice(0, 100)}${
                                  String(
                                    request.technicalAssets.domainHosting || "",
                                  ).trim().length > 100
                                    ? "..."
                                    : ""
                                }`}

                            {String(
                              request.technicalAssets.domainHosting || "",
                            ).trim().length > 100 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setShowFullDomainHosting(
                                    !showFullDomainHosting,
                                  )
                                }
                                className="block mt-2 text-amber-500 font-black text-xs hover:underline"
                              >
                                {showFullDomainHosting
                                  ? "See Less"
                                  : "See More"}
                              </button>
                            )}
                          </p>
                        </div>
                      )}
                      {request.technicalAssets.designAssets && (
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                          <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest mb-1">
                            {t("bid_form.design_assets")}
                          </p>
                          <p className="text-xs font-medium dark:text-gray-300 whitespace-pre-wrap break-words overflow-hidden">
                            {showFullDesignAssets
                              ? request.technicalAssets.designAssets
                              : `${request.technicalAssets.designAssets.slice(0, 100)}${
                                  request.technicalAssets.designAssets.length >
                                  100
                                    ? "..."
                                    : ""
                                }`}
                            {request.technicalAssets.designAssets.length >
                              100 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setShowFullDesignAssets(!showFullDesignAssets)
                                }
                                className="block mt-2 text-amber-500 font-black text-xs hover:underline"
                              >
                                {showFullDesignAssets ? "See Less" : "See More"}
                              </button>
                            )}{" "}
                          </p>
                        </div>
                      )}
                      {request.technicalAssets.other && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                            {t("bid_form.other_details")}
                          </p>
                          <p className="text-xs font-medium dark:text-gray-300 whitespace-pre-wrap break-words overflow-hidden">
                            {showFullOtherDetails
                              ? request.technicalAssets.other
                              : `${request.technicalAssets.other.slice(0, 120)}${
                                  request.technicalAssets.other.length > 120
                                    ? "..."
                                    : ""
                                }`}
                            {request.technicalAssets.other.length > 120 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setShowFullOtherDetails(!showFullOtherDetails)
                                }
                                className="block mt-2 text-amber-500 font-black text-xs hover:underline"
                              >
                                {showFullOtherDetails ? "See Less" : "See More"}
                              </button>
                            )}{" "}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
          {/* Right: Bidding Form */}
          <div>
            {" "}
            <form onSubmit={handleSubmit} className="space-y-8">
              {isOffline && (
                <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-sm font-bold flex items-center gap-3 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-rose-600 animate-pulse shrink-0" />
                  <div>
                    <p className="uppercase tracking-widest text-[10px] mb-0.5">Availability Required</p>
                    <p className="opacity-90 font-medium">You are currently OFFLINE. Go to your dashboard to turn availability ONLINE to submit proposals.</p>
                  </div>
                </div>
              )}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 p-8 md:p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-amber-500/5"
              >
                <h2 className="text-lg font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  {t("bid_form.your_bid_terms")}
                </h2>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">
                      {t("bid_form.your_cost")}
                    </label>
                    <div className="relative">
                      <IndianRupee
                        size={16}
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.amount}
                        onChange={(e) => {
                          const onlyDigits = e.target.value.replace(/\D/g, "");
                          setFormData({ ...formData, amount: onlyDigits });
                        }}
                        className="w-full bg-gray-50 dark:bg-gray-800/50 border-none p-4 pl-12 rounded-3xl font-bold text-gray-900 dark:text-white focus:ring-2 ring-amber-500/30 transition-all outline-none"
                        placeholder={t("bid_form.placeholder_cost")}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">
                      {t("bid_form.timeline")}
                    </label>
                    <div className="relative">
                      <Clock
                        size={16}
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        value={formData.estimatedDuration}
                        onChange={(e) => {
                          const val = e.target.value;
                          // Allow only digits, max 3 chars (1–999 days)
                          if (/^\d*$/.test(val) && val.length <= 3) {
                            setFormData({
                              ...formData,
                              estimatedDuration: val,
                            });
                          }
                        }}
                        inputMode="numeric"
                        maxLength={3}
                        className="w-full bg-gray-50 dark:bg-gray-800/50 border-none p-4 pl-12 rounded-3xl font-bold text-gray-900 dark:text-white focus:ring-2 ring-amber-500/30 transition-all outline-none"
                        placeholder="e.g. 3 (Days, max 999)"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">
                    {t("bid_form.experience_label")}
                  </label>
                  <div className="relative">
                    <Briefcase
                      size={16}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={formData.experience}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (
                          /^\d*$/.test(val) &&
                          (val === "" || Number(val) <= 60)
                        ) {
                          setFormData({ ...formData, experience: val });
                        }
                      }}
                      inputMode="numeric"
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border-none p-4 pl-12 rounded-3xl font-bold text-gray-900 dark:text-white focus:ring-2 ring-amber-500/30 transition-all outline-none"
                      placeholder="e.g. 5 (Years)"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">
                    {t("bid_form.detailed_proposal")}
                  </label>
                  <textarea
                    value={formData.proposal}
                    onChange={(e) =>
                      setFormData({ ...formData, proposal: e.target.value })
                    }
                    className="w-full bg-gray-50 dark:bg-gray-800/50 border-none p-6 rounded-[2rem] font-medium text-gray-900 dark:text-white focus:ring-2 ring-amber-500/30 transition-all outline-none min-h-[150px] resize-none"
                    placeholder={t("bid_form.placeholder_proposal")}
                    required
                  />
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-900 p-8 md:p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-amber-500/5"
              >
                <h2 className="text-lg font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                    <Image size={18} />
                  </div>
                  {t("bid_form.proof_of_work")}
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                      <LinkIcon size={12} /> Drive Link
                    </label>
                    <input
                      type="url"
                      value={formData.projectLink}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          projectLink: e.target.value,
                        })
                      }
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border-none p-4 rounded-3xl font-bold text-gray-900 dark:text-white focus:ring-2 ring-amber-500/30 transition-all outline-none"
                      placeholder="e.g. Google Drive link..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                      <Image size={12} /> {t("bid_form.upload_image")}
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full bg-gray-50 dark:bg-gray-800/50 border-none p-3.5 rounded-3xl font-bold text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 transition-all outline-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {formData.proofOfWorkImage && (
                  <div className="mt-6 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 max-h-48 flex justify-center bg-gray-50 dark:bg-gray-950">
                    <img
                      src={formData.proofOfWorkImage}
                      alt="Proof"
                      className="object-contain h-full"
                    />
                  </div>
                )}
              </motion.section>

              <button
                type="submit"
                disabled={isSubmitting || hasAlreadyBid || isOffline}
                className={`w-full py-6 rounded-[2rem] font-black text-lg transition-all shadow-xl flex items-center justify-center gap-4 group active:scale-95 disabled:cursor-not-allowed ${
                  hasAlreadyBid || isOffline
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700 shadow-none"
                    : "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30"
                }`}
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : hasAlreadyBid ? (
                  <>
                    {t("bid_form.already_submitted")}
                    <Gavel size={20} className="opacity-50" />
                  </>
                ) : isOffline ? (
                  <>
                    Offline (Please Go Online)
                    <Gavel size={20} className="opacity-50" />
                  </>
                ) : (
                  <>
                    {t("bid_form.submit_proposal")}
                    <Gavel
                      size={20}
                      className="group-hover:-rotate-12 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderBidForm;
