import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  Briefcase,
  IndianRupee,
  Calendar,
  FileText,
  Hammer,
  ShieldCheck,
  Link as LinkIcon,
  MessageSquare,
  Zap,
  Award,
  Image as ImageIcon,
  User,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { formatDate, formatCurrency } from "../utils/formatters";
import { getBiddingRequestById } from "../services/api";

const BidDetailsModal = ({ bid, onClose }) => {
  const { t } = useTranslation();
  const [fullRequest, setFullRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFullMessage, setShowFullMessage] = useState(false);
  const [showFullProposal, setShowFullProposal] = useState(false);
  const [showFullReqDesc, setShowFullReqDesc] = useState(false);
  const [showFullFeatures, setShowFullFeatures] = useState(false);
  const [showFullDomainHosting, setShowFullDomainHosting] = useState(false);
  const [showFullDesignAssets, setShowFullDesignAssets] = useState(false);
  const [showFullOtherDetails, setShowFullOtherDetails] = useState(false);
  useEffect(() => {
    if (!bid?.requestId) return;
    const requestId =
      typeof bid.requestId === "string" ? bid.requestId : bid.requestId._id;
    if (!requestId) return;

    setLoading(true);
    getBiddingRequestById(requestId)
      .then((res) => {
        const data = res.data?.request || res.data;
        if (data) setFullRequest(data);
      })
      .catch(() => {
        // Silently fail — we'll use the partial data from the list
      })
      .finally(() => setLoading(false));
  }, [bid]);

  if (!bid || !bid.requestId) return null;

  // Merge: full API response takes priority, then partial list data
  const partialRequest = typeof bid.requestId === "object" ? bid.requestId : {};
  const request = { ...partialRequest, ...fullRequest };

  // Use bid-level data directly as the primary source, fallback to nested selectedBid
  const offer = {
    amount: bid.amount || request.selectedBid?.amount,
    message: bid.message || request.selectedBid?.message,
    estimatedDuration:
      bid.estimatedDuration || request.selectedBid?.estimatedDuration,
    proposal: bid.proposal || request.selectedBid?.proposal,
    experience: bid.experience || request.selectedBid?.experience,
    projectLink: bid.projectLink || request.selectedBid?.projectLink,
    proofOfWorkImage:
      bid.proofOfWorkImage || request.selectedBid?.proofOfWorkImage,
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-8 md:pt-12 p-4 sm:p-8 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30 }}
          className="relative w-full max-w-5xl bg-white dark:bg-slate-900 uppercase tracking-tight font-black  border-gray-200 dark:border-slate-800 rounded-3xl md:rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.15)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden z-10"
        >
          {/* Header Section */}
          <div className="p-6 md:p-8 border-b border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-900 gap-6">
            <div className="flex items-center gap-4 md:gap-5 w-full sm:w-auto">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                {offer.proofOfWorkImage ? (
                  <img
                    src={offer.proofOfWorkImage}
                    alt="POW"
                    className="w-full h-full object-cover rounded-xl md:rounded-2xl"
                  />
                ) : (
                  <User size={28} className="md:w-8 md:h-8" />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight italic">
                  {offer.experience
                    ? t("bid_modal.verified_proposal")
                    : t("bid_modal.project_collaboration")}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-1.5">
                    <Award size={10} className="text-amber-500" />
                    <span className="text-[9px] md:text-[10px] font-black text-amber-500 uppercase tracking-widest">
                      {t("bid_modal.premium_provider")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute top-6 right-6 sm:relative sm:top-0 sm:right-0 p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl md:rounded-2xl text-slate-700 dark:text-slate-200 transition-all active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          {/* Main Content Grid */}
<div className="p-6 md:p-8 lg:p-10  space-y-10">            {" "}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
              {/* Left Column: Provider's Offer */}
              <div className="space-y-8 md:space-y-10">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xs font-black text-slate-600 dark:text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em]">
                    {t("bid_modal.provider_offer")}
                  </h3>
                </div>

                {/* Quote Card */}
                <div
                  className="p-6 md:p-8 bg-white dark:bg-gradient-to-br dark:from-slate-800 dark:to-slate-900
 border-gray-200 dark:border-slate-700 rounded-[1.5rem] md:rounded-[2rem]   shadow-xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-4 relative z-10">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                        {t("bid_modal.your_quote")}
                      </p>
                      <p className="text-3xl md:text-4xl font-black uppercase tracking-tight font-black italic tracking-tighter">
                        {formatCurrency(offer.amount)}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">
                        {t("bid_modal.timeframe")}
                      </p>
                      <p className="text-base md:text-lg font-black text-slate-700  dark:text-slate-300 italic">
                        {offer.estimatedDuration || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Offer Details */}
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare size={14} className="text-indigo-400" />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {t("bid_modal.prof_message")}
                      </p>
                    </div>
                    <div className="p-5 md:p-6 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl italic text-sm leading-relaxed break-words overflow-x-hidden overflow-y-auto no-scrollbar max-h-32 min-w-0">
                      {request.description || offer.message || t("bid_modal.no_message")}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                      {t("bid_modal.detailed_proposal")}
                    </p>
                    <div className="p-5 md:p-6 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs leading-relaxed whitespace-pre-wrap break-words overflow-x-hidden overflow-y-auto no-scrollbar min-w-0 max-h-60">
                      {offer.proposal || t("bid_modal.agreed_terms")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                        {t("bid_modal.rel_experience")}
                      </p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {offer.experience || t("bid_modal.verified_proposal")}
                      </p>
                    </div>
                    {offer.projectLink && (
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                          {t("bid_modal.proof_of_work")}
                        </p>
                        <a
                          href={offer.projectLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <LinkIcon size={14} />
                          <span className="text-xs font-black uppercase tracking-widest">
                            {t("bid_modal.view_project")}
                          </span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Your Requirement */}
              <div className="space-y-8 md:space-y-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <FileText size={18} className="text-blue-500" />
                  </div>
                  <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                    {t("bid_modal.your_requirement")}
                  </h3>
                </div>

                {/* Requirement Overview */}
                <div className="p-6 md:p-8 bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 rounded-[1.5rem] md:rounded-[2rem]">
                  <h4 className="text-lg md:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight mb-4">
                    {request.subService || request.category}
                  </h4>

                  {/* Added Description */}
                  {/* <div className="mb-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      {t("bid_modal.detailed_desc")}
                    </p>
                    <div className="text-xs text-slate-400 leading-relaxed italic border-l-2 border-indigo-500/30 pl-4 w-full max-w-full break-words whitespace-pre-wrap overflow-hidden">
                      {showFullReqDesc
                        ? request.description || t("bid_modal.no_desc")
                        : `${(request.description || t("bid_modal.no_desc")).slice(0, 180)}${
                            (request.description || "").length > 180
                              ? "..."
                              : ""
                          }`}

                      {(request.description || "").length > 180 && (
                        <button
                          onClick={() => setShowFullReqDesc(!showFullReqDesc)}
                          className="block mt-2 text-indigo-400 font-black text-xs hover:underline"
                        >
                          {showFullReqDesc ? "See Less" : "See More"}
                        </button>
                      )}
                    </div>
                  </div> */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 pt-4 border-t border-slate-700/30">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                        {t("bid_modal.customer_budget")}
                      </p>
                      <p className="text-lg font-black text-blue-400">
                        {formatCurrency(request.budget)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                        {t("bid_modal.deadline")}
                      </p>
                      <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                        {" "}
                        {request.deadline
                          ? formatDate(request.deadline, "short")
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features & Assets */}
                <div className="space-y-8">
                  {request.keyFeatures && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Hammer size={14} className="text-blue-400" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {t("bid_modal.key_features")}
                        </p>
                      </div>
                      <div className="p-5 md:p-6 bg-white dark:bg-slate-800/40 rounded-2xl border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs leading-relaxed w-full max-w-full break-words whitespace-pre-wrap overflow-x-hidden overflow-y-auto no-scrollbar max-h-32">
                        {request.keyFeatures}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldCheck size={14} className="text-blue-400" />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {t("bid_modal.tech_assets")}
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 md:p-5 border border-slate-200 dark:border-slate-700 rounded-2xl ">
                          <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">
                            {t("bid_modal.domain_hosting")}
                          </p>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 break-all whitespace-pre-wrap overflow-x-hidden overflow-y-auto no-scrollbar max-h-24">
                            {request.technicalAssets?.domainHosting || t("bid_modal.not_provided")}
                          </div>
                        </div>
                        <div
                          className="p-4 md:p-5  rounded-2xl border bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm/60
border border-gray-200 dark:border-slate-800 "
                        >
                          <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-2">
                            {t("bid_modal.design_assets")}
                          </p>
                          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 break-all whitespace-pre-wrap overflow-x-hidden overflow-y-auto no-scrollbar max-h-24">
                            {request.technicalAssets?.designAssets || t("bid_modal.not_provided")}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 md:p-5 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                        {" "}
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">
                          {t("bid_modal.other_details")}
                        </p>
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 break-all whitespace-pre-wrap overflow-x-hidden overflow-y-auto no-scrollbar max-h-24">
                          {request.technicalAssets?.other || t("bid_modal.no_add_details")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action */}
{/* <div className="sticky bottom-0 left-0 right-0 p-4 md:p-5 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)]">            <button
              onClick={onClose}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95"
            >
              {t("bid_modal.close_view")}
            </button>
          </div> */}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BidDetailsModal;
