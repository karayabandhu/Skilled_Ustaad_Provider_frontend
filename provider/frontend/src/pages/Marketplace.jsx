import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Gavel, RefreshCcw, Hammer } from "lucide-react";
import { getOpenBiddingRequests, getProviderBids } from "../services/api";
import { formatDate } from "../utils/formatters";
import { Button } from "../components/ui/button";
import SEO from "../components/SEO";
import { useTranslation } from "react-i18next";

const Marketplace = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [biddingRequests, setBiddingRequests] = useState([]);
  const [myBidRequestIds, setMyBidRequestIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const provider = JSON.parse(localStorage.getItem("providerData") || "{}");

  const fetchBids = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      // Normalize category for rebranding (Biding Services -> Digital Work -> Digital Services)
      const normalizedCategory =
        provider?.serviceCategory === "Biding Services" ||
        provider?.serviceCategory === "Digital Work" ||
        provider?.serviceCategory === "Digital Works" ||
        provider?.serviceCategory === "Digital Services" ||
        provider?.serviceCategory === "Web Development"
          ? "Digital Services"
          : provider?.serviceCategory;

      const [openRequestsRes, myBidsRes] = await Promise.allSettled([
        getOpenBiddingRequests(normalizedCategory, provider?.city),
        getProviderBids(),
      ]);

      const myBids =
        myBidsRes.status === "fulfilled" ? myBidsRes.value.data.bids || [] : [];
      const bidIds = myBids
        .map((bid) => bid.requestId?._id || bid.requestId)
        .filter(Boolean);
      setMyBidRequestIds(bidIds);

      const fetchedRequests =
        openRequestsRes.status === "fulfilled"
          ? openRequestsRes.value.data.requests || []
          : [];
      setBiddingRequests(fetchedRequests);
    } catch (err) {
      console.error("Error fetching marketplace bids:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBids();
    const interval = setInterval(() => fetchBids(true), 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCcw className="w-10 h-10 text-amber-500 animate-spin mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse">
          {t("bidding_marketplace.loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <SEO
        title={`${t("bidding_marketplace.title")} | Provider`}
        description={t("bidding_marketplace.subtitle")}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-amber-500 text-white rounded-[1.5rem] shadow-xl shadow-amber-500/20">
            <Gavel size={32} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic leading-none">
              {t("bidding_marketplace.title").split(" ")[0]}{" "}
              <span className="text-amber-500">
                {t("bidding_marketplace.title").split(" ")[1]}
              </span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {t("bidding_marketplace.subtitle")}
            </p>
          </div>
        </div>
        <Button
          onClick={() => fetchBids(true)}
          disabled={refreshing}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl px-6 py-6 shadow-sm flex items-center gap-2 font-black uppercase tracking-widest text-[10px]"
        >
          <RefreshCcw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing
            ? t("bidding_marketplace.refreshing")
            : t("bidding_marketplace.refresh")}
        </Button>
      </div>

      {biddingRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {biddingRequests.map((req) => (
            <div
              key={req._id}
              className="bg-white dark:bg-gray-950 rounded-[2.5rem] border border-gray-100 dark:border-gray-900 shadow-2xl shadow-black/5 overflow-hidden group hover:border-amber-500/30 transition-all duration-500"
            >
              <div className="p-8 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="px-4 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-500/10">
                    {req.category}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px] uppercase">
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    {formatDate(req.createdAt, "short")}
                  </div>
                </div>

                <h3 className="h-[72px] text-xl font-black text-gray-900 dark:text-white tracking-tighter mb-3 uppercase italic line-clamp-2">
                  {req.subService}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-8 italic leading-relaxed pl-4 border-l-2 border-gray-100 dark:border-gray-800">
                  "{req.description}"
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-900 mt-auto">
                  {" "}
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      {t("bidding_marketplace.max_budget")}
                    </p>
                    <p className="text-2xl font-black text-blue-600 tracking-tighter">
                      ₹{req.budget}
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      navigate(`/profile/bid/${req._id}`, {
                        state: { request: req },
                      })
                    }
                    disabled={
                      myBidRequestIds.includes(req._id) ||
                      provider?.status?.toLowerCase() !== "active" ||
                      provider?.isAvailable === false
                    }
                    className={`rounded-2xl h-12 px-8 font-black text-[11px] uppercase tracking-widest transition-all ${
                      myBidRequestIds.includes(req._id) ||
                      provider?.status?.toLowerCase() !== "active" ||
                      provider?.isAvailable === false
                        ? "bg-gray-100 dark:bg-gray-900 text-gray-400 border border-gray-200 dark:border-gray-800 cursor-not-allowed"
                        : "bg-amber-500 hover:bg-amber-600 text-white shadow-xl shadow-amber-500/20 active:scale-95"
                    }`}
                  >
                    {myBidRequestIds.includes(req._id)
                      ? t("bidding_marketplace.already_bid")
                      : provider?.status?.toLowerCase() !== "active"
                        ? t("bidding_marketplace.not_verified")
                        : provider?.isAvailable === false
                          ? "Go Online to Bid"
                          : t("bidding_marketplace.place_bid")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-gray-900/20 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
          <div className="w-24 h-24 bg-white dark:bg-gray-900 rounded-[2rem] flex items-center justify-center text-gray-300 shadow-xl mb-6">
            <Hammer size={48} />
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter uppercase mb-2">
            {t("bidding_marketplace.marketplace_quiet")}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium max-w-sm mx-auto leading-relaxed italic">
            {t("bidding_marketplace.no_opportunities_desc")}
          </p>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
