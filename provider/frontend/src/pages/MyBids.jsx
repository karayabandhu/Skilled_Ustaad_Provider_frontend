import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Gavel,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MessageCircle,
  Calendar,
} from "lucide-react";
import { getProviderBids } from "../services/api";
import { formatDate, formatCurrency } from "../utils/formatters";
import { LoadingSkeleton, EmptyState } from "../components/common/StatusViews";
import { useFetch } from "../hooks/useFetch";
import SEO from "../components/SEO";
import BidDetailsModal from "../components/BidDetailsModal";
import { useSocket } from "../context/SocketContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const MyBids = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    data: bidsData,
    loading,
    error,
    refresh: fetchBids,
  } = useFetch(getProviderBids, [], {
    immediate: true,
    pollingInterval: 30000,
  });
  const { on } = useSocket();
  const [selectedBid, setSelectedBid] = useState(null);

  useEffect(() => {
    const handleBidAccepted = () => {
      // console.log("Bid accepted event received, refreshing...");
      fetchBids();
    };

    const cleanup = on("bid_accepted", handleBidAccepted);
    return () => cleanup && typeof cleanup === "function" && cleanup();
  }, [on, fetchBids]);

  const bids = bidsData?.bids || [];

  if (loading && !bidsData) return <LoadingSkeleton />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <SEO
        title={`${t("my_bids.title")} | Provider`}
        description={t("my_bids.subtitle")}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
            {t("my_bids.title").split(" ")[0]}{" "}
            <span className="text-blue-600">
              {t("my_bids.title").split(" ")[1]}
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">
            {t("my_bids.subtitle")}
          </p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm text-xs font-black text-blue-600 uppercase tracking-widest">
            {t("my_bids.total_bids")}: {bids.length}
          </div>
        </div>
      </div>

      {bids.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {bids.map((bid) => (
            <div
              key={bid._id}
              onClick={() => setSelectedBid(bid)}
              className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-black/5 overflow-hidden group hover:border-blue-500/30 transition-all duration-500 cursor-pointer active:scale-[0.99] h-full flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex flex-col lg:grid lg:grid-cols-[1fr_240px] gap-6 lg:gap-6">
                  {/* Service Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-600">
                        <Gavel size={20} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="w-fit text-[8px] font-black text-blue-600 uppercase tracking-widest bg-blue-600/5 dark:bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/10">
                          {bid.requestId?.category || t("common.project_bid")}
                        </span>
                        <div
                          className="flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase tracking-widest cursor-pointer hover:text-amber-400 transition-colors"
                          onClick={() => setSelectedBid(bid)}
                        >
                          <Eye size={10} /> {t("my_bids.view_details")}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic leading-none mb-2">
                        {bid.requestId?.subService ||
                          t("common.general_service")}
                      </h3>

                      <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm leading-relaxed line-clamp-2 italic border-l-2 border-gray-100 dark:border-gray-800 pl-4 my-3">
                        {(() => {
                          const desc =
                            bid.requestId?.description ||
                            bid.proposal ||
                            bid.message;

                          if (!desc) return t("my_bids.no_description");

                          return desc.length > 120
                            ? desc.slice(0, 120) + "..."
                            : desc;
                        })()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
                      <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Calendar size={12} className="text-blue-500" />
                        <span className="text-gray-600 dark:text-slate-400">
                          {bid.status === "accepted"
                            ? `${t("my_bids.accepted_on")} ${formatDate(bid.updatedAt, "short")}`
                            : `${t("my_bids.submitted_on")} ${formatDate(bid.createdAt, "short")}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Clock size={12} className="text-blue-500" />
                        <span className="text-gray-600 dark:text-slate-400">
                          {t("my_bids.posted_on")}{" "}
                          {formatDate(
                            bid.requestId?.createdAt || bid.createdAt,
                            "short",
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <AlertCircle size={12} className="text-rose-500" />
                        <span className="text-rose-500/80">
                          {t("my_bids.deadline")}{" "}
                          {formatDate(bid.requestId?.deadline, "short")}
                        </span>
                      </div>
                    </div>
                    {/* Estimated Duration */}
                    <div className="mt-4 p-3 bg-blue-600/5 dark:bg-blue-500/5 rounded-2xl border border-blue-500/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">
                          {t("my_bids.est_duration")}
                        </span>
                        <span className="text-xs font-black text-gray-900 dark:text-white italic">
                          {bid.estimatedDuration}
                        </span>
                      </div>

                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full transition-all duration-1000 ${
                            bid.status === "accepted"
                              ? "bg-emerald-500 w-full"
                              : bid.status === "rejected"
                                ? "bg-rose-500 w-full"
                                : "bg-blue-600 w-1/2"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bid Details Sidebar */}
                  <div className="space-y-4 lg:border-l lg:border-gray-100 lg:dark:border-gray-800 lg:pl-8">
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm group/price">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                          {t("my_bids.your_price")}
                        </p>
                        <p className="text-lg font-black text-blue-600 tracking-tighter transition-transform group-hover/price:scale-105 origin-left">
                          {formatCurrency(bid.amount)}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm group/cprice">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                          {t("my_bids.customer_price")}
                        </p>
                        <p className="text-lg font-black text-amber-600 tracking-tighter transition-transform group-hover/cprice:scale-105 origin-left">
                          {formatCurrency(bid.requestId?.budget)}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm col-span-2 lg:col-span-1">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                          {t("my_bids.bid_status")}
                        </p>
                        <div className="flex items-center gap-2">
                          {bid.status === "accepted" ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg w-full">
                              <CheckCircle
                                size={14}
                                className="text-emerald-500"
                              />
                              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                {t("my_bids.status.accepted")}
                              </span>
                            </div>
                          ) : bid.status === "rejected" ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg w-full">
                              <XCircle size={14} className="text-rose-500" />
                              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">
                                {t("my_bids.status.rejected")}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg w-full">
                              <Clock size={14} className="text-amber-500" />
                              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                                {t("my_bids.status.pending")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* <div className="p-3 bg-blue-600/5 dark:bg-blue-500/5 rounded-2xl border border-blue-500/10 space-y-3"> */}

                    {/* <div className=" p-3 bg-blue-600/5 dark:bg-blue-500/5 rounded-2xl border border-blue-500/10 space-y-3">
                      {" "}
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">
                          {t("my_bids.est_duration")}
                        </span>
                        <span className="text-xs font-black text-gray-900 dark:text-white italic">
                          {bid.estimatedDuration}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full transition-all duration-1000 ${bid.status === "accepted" ? "bg-emerald-500 w-full" : bid.status === "rejected" ? "bg-rose-500 w-full" : "bg-blue-600 w-1/2"}`}
                        />
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="px-8 py-5 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        bid.status === "accepted" &&
                        (bid.bookingId || bid.requestId?.bookingId || bid._id)
                      ) {
                        navigate(
                          `/profile/job/${bid.bookingId || bid.requestId?.bookingId || bid._id}`,
                          {
                            state: { scrollToChat: true },
                          },
                        );
                      } else {
                        toast.info(t("my_bids.toast_message_disabled"));
                      }
                    }}
                    className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                  >
                    <MessageCircle size={14} /> {t("my_bids.message_customer")}
                  </button>
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter italic">
                  {t("my_bids.submitted_date_label")}{" "}
                  {formatDate(bid.createdAt, "full")}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={t("my_bids.no_bids")}
          description={t("my_bids.no_bids_desc")}
          icon={Gavel}
        />
      )}

      {selectedBid && (
        <BidDetailsModal
          bid={selectedBid}
          onClose={() => setSelectedBid(null)}
        />
      )}
    </div>
  );
};

export default MyBids;
