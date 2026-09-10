import React, { useState, useEffect } from "react";
import DailyChartInfoModal from "../components/DailyChartInfoModal";
import SEO from "../components/SEO";
import {
  Download,
  CreditCard,
  RefreshCcw,
  BarChart3,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  History,
  Settings,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Banknote,
  Plus,
  Image as ImageIcon,
} from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";

import {
  getEarningsDashboard,
  getTransactionHistory,
  getEarningsPaymentMethods,
  withdrawEarningsFunds,
  getProviderProfile,
  addEarningsPaymentMethod,
} from "../services/api";
import { useNavigate } from "react-router-dom";

// Refactor Foundation Imports
import { useSocket } from "../context/SocketContext";
import { useFetch } from "../hooks/useFetch";
import { usePagination } from "../hooks/usePagination";
import { formatCurrency, formatDate } from "../utils/formatters";
import { toast } from "sonner";
import { getFriendlyErrorMessage } from "../utils/errors";
import {
  LoadingSkeleton,
  ErrorView,
  EmptyState,
} from "../components/common/StatusViews";
import { StatCard, StatsGrid } from "../components/common/DashboardStats";
import ProfileHeader from "../components/profile/ProfileHeader";
import InvoiceModal from "../components/profile/InvoiceModal";
import ManagePaymentMethodsModal from "../components/profile/ManagePaymentMethodsModal";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { useTranslation } from "react-i18next";

const ProfileEarnings = () => {
  const { t } = useTranslation();
  // Data Fetching
  const {
    data: dashboard,
    loading: dashLoading,
    error: dashError,
    refresh: refreshDash,
  } = useFetch(getEarningsDashboard);
  const {
    data: transactions,
    loading: transLoading,
    refresh: refreshTrans,
  } = useFetch(getTransactionHistory);
  const { data: paymentMethods, refresh: refreshMethods } = useFetch(
    getEarningsPaymentMethods,
  );
  const { data: profileResponse } = useFetch(getProviderProfile);
  const provider = profileResponse?.provider || {};
  const navigate = useNavigate();

  // States
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isMethodsOpen, setIsMethodsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const toWholeRupees = (value) => {
    const num = Number(value || 0);
    return Number.isFinite(num) ? Math.floor(num) : 0;
  };

  // Real-time updates
  const { on } = useSocket();

  // Refresh button
  const refreshAll = () => {
    refreshDash();
    refreshTrans();
    refreshMethods();
  };

  useEffect(() => {
    const unsub = on("payout_status_updated", () => {
      refreshDash();
      refreshTrans();
      refreshMethods();
    });

    return unsub;
  }, [on, refreshDash, refreshTrans, refreshMethods]);

  // Auto-select first method or default
  useEffect(() => {
    if (paymentMethods?.length > 0 && !selectedMethodId) {
      const defaultMethod =
        paymentMethods.find((m) => m.isDefault) || paymentMethods[0];
      setSelectedMethodId(defaultMethod._id);
    }
  }, [paymentMethods, selectedMethodId]);

  // Pagination - Job Earnings
  const {
    currentItems: currentTransactions,
    currentPage: transPage,
    totalPages: transTotalPages,
    nextPage: transNextPage,
    prevPage: transPrevPage,
  } = usePagination(transactions || [], 5);

  // Pagination - Payout History
  const {
    currentItems: currentPayouts,
    currentPage: payoutPage,
    totalPages: payoutTotalPages,
    nextPage: payoutNextPage,
    prevPage: payoutPrevPage,
  } = usePagination(dashboard?.payoutHistory || [], 5);

  const handleWithdraw = async (e) => {
    e?.preventDefault();
    const amount = toWholeRupees(withdrawAmount);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount to withdraw.");
      return;
    }

    if (amount > toWholeRupees(dashboard?.availableBalance || 0)) {
      toast.error("Requested amount exceeds your available balance.");
      return;
    }

    if (parseFloat(withdrawAmount) > (dashboard?.availableBalance || 0)) {
      toast.error("Requested amount exceeds your available balance.");
      return;
    }

    if (!selectedMethodId) {
      toast.error("Please select a preferred payment method.");
      return;
    }

    setWithdrawLoading(true);
    try {
      let finalMethodId = selectedMethodId;

      // Special handling for the virtual "Profile Bank" option
      if (selectedMethodId === "profile_bank") {
        // 1. Check if this bank is already in the payment methods list
        const existing = paymentMethods?.find((m) => {
          try {
            const d = JSON.parse(m.details);
            return d.accountNumber === provider.bankAccountNumber;
          } catch (e) {
            return false;
          }
        });

        if (existing) {
          finalMethodId = existing._id;
        } else {
          // 2. Add it as a formal payment method first
          const addRes = await addEarningsPaymentMethod({
            type: "Bank",
            name: provider.accountHolderName || "Primary Bank",
            details: JSON.stringify({
              accountNumber: provider.bankAccountNumber,
              ifscCode: provider.ifscCode,
              upiId: provider.upiId,
            }),
          });

          // Assuming the backend returns the new method in data or we need to refresh
          // For safety, we'll try to find it in the refreshed list or wait for it
          // But usually addRes.data has the new object
          finalMethodId = addRes.data?._id || addRes.data?.id;

          if (!finalMethodId) {
            // Backup: Refresh and try to find it
            await refreshMethods();
            throw new Error(
              "Payout method was being initialized. Please try clicking 'Request Funds' again.",
            );
          }
        }
      }

      await withdrawEarningsFunds({
        amount,
        methodId: finalMethodId,
      });

      toast.success("Payout request submitted successfully!");
      setWithdrawAmount("");
      refreshAll();
    } catch (err) {
      console.error(err);
      toast.error(
        getFriendlyErrorMessage(
          err,
          "Failed to process payout request. Please try again later.",
        ),
      );
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleViewInvoice = (trans) => {
    setSelectedTransaction(trans);
    setIsInvoiceOpen(true);
  };

  if (dashLoading && !dashboard) return <LoadingSkeleton />;
  if (dashError && !dashboard) return <ErrorView message={dashError} onRetry={refreshAll} />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO title="Earnings & Finance | Kaam Mitra" />

      <ProfileHeader
        title={t("earnings.title")}
        subtitle={t("earnings.subtitle")}
        onRefresh={refreshAll}
        loading={dashLoading || transLoading}
      />

      {/* Stats Section */}
      <StatsGrid>
        <StatCard
          title={t("earnings.total_work_value")}
          value={dashboard?.totalEarning}
          isCurrency
          icon={Banknote}
          colorClass="text-purple-600"
        />
        {/* <StatCard
          title={t('earnings.platform_earnings')}
          value={dashboard?.walletEarnings}
          isCurrency
          icon={Wallet}
          colorClass="text-blue-600 font-black"
        /> */}

        {/* <StatCard
          title={t('earnings.external_earnings')}
          value={dashboard?.externalEarnings}
          isCurrency
          icon={Banknote}
          colorClass="text-emerald-600"
        /> */}
        <StatCard
          title={t("earnings.available_balance")}
          value={dashboard?.availableBalance}
          isCurrency
          icon={CreditCard}
          colorClass="text-blue-600"
        />
        <StatCard
          title={t("earnings.funds_on_hold")}
          value={dashboard?.onHoldBalance}
          isCurrency
          icon={Clock}
          colorClass="text-amber-500"
        />
        {/* <StatCard
          title={t('earnings.admin_commission')}
          value={dashboard?.adminCommission}
          isCurrency
          icon={TrendingUp}
          colorClass="text-rose-500"
        /> */}
        <StatCard
          title={t("earnings.total_jobs")}
          value={dashboard?.totalJobs || transactions?.length}
          icon={BarChart3}
          colorClass="text-amber-600"
        />
      </StatsGrid>
      {/* 
       <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              {t('earnings.secure_payouts')}
            </h3>
            <p className="text-sm opacity-80 mb-4">{t('earnings.secure_desc')}</p>
            <Button variant="secondary" className="w-full text-blue-600 font-bold rounded-xl" onClick={() => window.open('https://wa.me/yournumber', '_blank')}>
              {t('earnings.support_center')}
            </Button>
          </div> */}
      <div className="mt-3 mb-2 flex flex-wrap items-center gap-2 text-sm text-blue-600 font-semibold">
        <ShieldCheck className="w-4 h-4" />

        <span>{t("earnings.secure_payouts")}</span>

        <span className="text-gray-400">·</span>

        <span className="text-gray-500 font-normal">
          {t("earnings.secure_desc")}
        </span>

        <button
          onClick={() => window.open("https://provider.skilledustaad.com/support", "_blank")}
          className="ml-2 underline text-blue-700 hover:text-blue-800 font-semibold"
        >
          {t("earnings.support_center")}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {" "}
        {/* Left Column: Actions & Form */}
        <div className="lg:col-span-4 space-y-6 h-full flex flex-col">
          {" "}
          {/* Payout Request Form */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-green-500" />
              {t("earnings.request_payout")}
            </h3>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">
                  {t("earnings.amount_to_withdraw")}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                    Rs
                  </span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="0"
                    value={withdrawAmount}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/\D/g, "");
                      setWithdrawAmount(onlyDigits);
                    }}
                    className="pl-10 rounded-xl h-12 font-bold"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  {t("earnings.available_label")}:{" "}
                  <span className="font-bold text-green-600">
                    ₹
                    {toWholeRupees(
                      dashboard?.availableBalance || 0,
                    ).toLocaleString("en-IN")}{" "}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">
                  {t("earnings.payment_method")}
                </label>
                <select
                  value={selectedMethodId}
                  onChange={(e) => setSelectedMethodId(e.target.value)}
                  className="w-full rounded-xl h-12 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                >
                  <option value="" disabled>
                    {t("earnings.select_method")}
                  </option>
                  {/* Show Profile Bank Account as an option if preferred by user */}
                  {provider.bankAccountNumber && (
                    <option value="profile_bank">
                      {t("earnings.primary_bank")}:{" "}
                      {provider.bankAccountNumber.slice(-4)}
                    </option>
                  )}
                  {paymentMethods?.length > 0 ? (
                    paymentMethods.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.type})
                      </option>
                    ))
                  ) : (
                    <option value="none" disabled>
                      No methods found
                    </option>
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => setIsMethodsOpen(true)}
                  className="text-[10px] text-blue-600 mt-1 hover:underline flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" />{" "}
                  {t("earnings.manage_methods")}
                </button>
              </div>

              {/* Show details for selected profile bank */}
              {selectedMethodId === "profile_bank" && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 space-y-2 anim-fade-in shadow-inner">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-500 font-medium">
                      Account Holder:
                    </span>
                    <span className="font-bold text-blue-700 dark:text-blue-300">
                      {provider.accountHolderName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-500 font-medium">
                      Bank / IFSC:
                    </span>
                    <span className="font-bold text-blue-700 dark:text-blue-300">
                      {provider.ifscCode}
                    </span>
                  </div>
                  {provider.upiId && (
                    <div className="flex justify-between items-center text-[10px] border-t border-blue-200/30 pt-1 mt-1">
                      <span className="text-gray-500 font-medium">UPI ID:</span>
                      <span className="font-bold text-blue-700 dark:text-blue-300">
                        {provider.upiId}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                disabled={
                  withdrawLoading || !withdrawAmount || !selectedMethodId
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-6 h-auto transition-all transform active:scale-95"
              >
                {withdrawLoading ? (
                  <RefreshCcw className="w-5 h-5 animate-spin" />
                ) : (
                  t("earnings.request_funds")
                )}
              </Button>
            </form>
          </div>
          {/* <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              {t('earnings.secure_payouts')}
            </h3>
            <p className="text-sm opacity-80 mb-4">{t('earnings.secure_desc')}</p>
            <Button variant="secondary" className="w-full text-blue-600 font-bold rounded-xl" onClick={() => window.open('https://wa.me/yournumber', '_blank')}>
              {t('earnings.support_center')}
            </Button>
          </div> */}
          {/* Saved Payment Methods Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" />
                {t("earnings.payment_methods_title")}
              </h3>
              <button
                onClick={() => setIsMethodsOpen(true)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-blue-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Linked Payout Sources */}
            {(provider.bankAccountNumber || provider.upiId) && (
              <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                    {t("earnings.profile_verified_source")}
                  </span>
                  {/* <button
                    onClick={() => navigate("/profile")}
                    className="text-[10px] font-bold text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {t("earnings.edit")}
                  </button> */}
                </div>

                <div className="space-y-3">
                  {provider.bankAccountNumber && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                        <Banknote className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold dark:text-white">
                          **** **** {provider.bankAccountNumber.slice(-4)}
                        </p>
                        <p className="text-[9px] text-gray-400 uppercase">
                          {provider.ifscCode}
                        </p>
                      </div>
                    </div>
                  )}
                  {provider.upiId && (
                    <div className="flex items-center gap-3 border-t border-blue-100/50 dark:border-blue-800/30 pt-2">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                        <Wallet className="w-4 h-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold dark:text-white">
                          {provider.upiId}
                        </p>
                        <p className="text-[9px] text-gray-400 uppercase">
                          {t("earnings.primary_upi")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {paymentMethods?.length > 0 ? (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method._id}
                    className="p-3 rounded-xl border border-gray-50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <Banknote className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold dark:text-white">
                          {method.name}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase">
                          {method.type}
                        </p>
                      </div>
                    </div>
                    {method.isDefault && (
                      <Badge variant="secondary" className="text-[8px] h-4">
                        {t("earnings.default_badge")}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-gray-400 mb-2">
                  {t("earnings.no_methods_saved")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[10px] h-8 rounded-lg"
                  onClick={() => setIsMethodsOpen(true)}
                >
                  {t("earnings.add_method")}
                </Button>
              </div>
            )}
          </div>
        </div>
        {/* Right Column: Transactions */}
        {/* Payout Request History */}
        <div className="lg:col-span-8 h-full">
          {" "}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
            {" "}
            <h3 className="text-lg font-bold dark:text-white mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-purple-500" />
              {t("earnings.payout_history")}
            </h3>
            {currentPayouts?.length > 0 ? (
              <div className="space-y-4">
                {currentPayouts.map((payout) => (
                  <div
                    key={payout._id}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-xl ${payout.status === "SUCCESS" ||
                            payout.status === "Approved"
                            ? "bg-green-100 text-green-600"
                            : payout.status === "PENDING" ||
                              payout.status === "Pending"
                              ? "bg-amber-100 text-amber-600"
                              : "bg-red-100 text-red-600"
                          }`}
                      >
                        {payout.status === "SUCCESS" ||
                          payout.status === "Approved" ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : payout.status === "PENDING" ||
                          payout.status === "Pending" ? (
                          <Clock className="w-5 h-5" />
                        ) : (
                          <AlertCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm dark:text-white">
                          {payout.method}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {formatDate(
                            payout.date ||
                            payout.requestedAt ||
                            payout.updatedAt ||
                            payout.createdAt,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-sm dark:text-white">
                        {formatCurrency(payout.amount)}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-[9px] uppercase tracking-wider ${payout.status === "SUCCESS" ||
                            payout.status === "Approved"
                            ? "border-green-200 text-green-600 bg-green-50"
                            : payout.status === "PENDING" ||
                              payout.status === "Pending"
                              ? "border-amber-200 text-amber-600 bg-amber-50"
                              : "border-red-200 text-red-600 bg-red-50"
                          }`}
                      >
                        {payout.status === "SUCCESS" ||
                          payout.status === "Approved"
                          ? t("earnings.status.success")
                          : payout.status === "PENDING" ||
                            payout.status === "Pending"
                            ? t("earnings.status.pending")
                            : t("earnings.status.failed")}
                      </Badge>
                      {payout.receipt &&
                        (payout.status === "SUCCESS" ||
                          payout.status === "Approved") && (
                          <a
                            href={
                              payout.receipt.startsWith("http://") || payout.receipt.startsWith("https://")
                                ? payout.receipt
                                : `${(import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || "http://localhost:5000/api").replace(/\/api\/v1$/, "").replace(/\/api$/, "")}${payout.receipt}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 block text-[10px] text-blue-600 hover:underline font-bold flex items-center justify-end gap-1"
                          >
                            <ImageIcon className="w-3 h-3" />{" "}
                            {t("earnings.view_receipt")}
                          </a>
                        )}
                    </div>
                  </div>
                ))}

                {/* Payout Pagination */}
                {payoutTotalPages > 1 && (
                  <div className="mt-6 flex justify-center pt-4 border-t border-gray-50 dark:border-gray-800">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={payoutPrevPage}
                            className={`cursor-pointer ${payoutPage === 1 ? "pointer-events-none opacity-50" : ""}`}
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <span className="text-[10px] px-3 text-gray-400">
                            {t("common.page")} {payoutPage} {t("common.of")}{" "}
                            {payoutTotalPages}
                          </span>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext
                            onClick={payoutNextPage}
                            className={`cursor-pointer ${payoutPage === payoutTotalPages ? "pointer-events-none opacity-50" : ""}`}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                title={t("earnings.no_payouts")}
                description={t("earnings.no_payouts_desc")}
                icon={History}
              />
            )}
          </div>
        </div>
        {/* Transaction History Card (Job Earnings) */}
        <div className="lg:col-span-12 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              {t("earnings.job_earnings_history")}
            </h3>
          </div>

          {transactions?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 dark:border-gray-700 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <th className="py-3 px-2">
                      {t("earnings.service_breakdown")}
                    </th>
                    <th className="py-3 px-2">{t("earnings.date")}</th>
                    <th className="py-3 px-2 text-right">
                      {t("earnings.earning_breakdown")}
                    </th>
                    <th className="py-3 px-2 text-right">
                      {t("earnings.action")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {currentTransactions.map((item) => (
                    <tr
                      key={item._id}
                      className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="py-4 px-2">
                        <p className="font-bold text-sm dark:text-white">
                          {item.serviceType}
                        </p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">
                          Value:{" "}
                          <span className="text-purple-600">
                            {item.servicePrice}
                          </span>
                        </p>
                        <p className="text-[8px] text-gray-400 font-mono truncate max-w-[100px]">
                          {item.jobId}
                        </p>
                      </td>
                      <td className="py-4 px-2 text-xs text-gray-500">
                        {formatDate(item.date || item.createdAt)}
                      </td>
                      <td className="py-4 px-2 text-right">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-blue-600">
                            {item.walletEarning}{" "}
                            <span className="text-[9px] text-gray-400 font-normal">
                              (Wallet)
                            </span>
                          </p>
                          <p className="text-xs font-bold text-emerald-600">
                            {item.externalEarning}{" "}
                            <span className="text-[9px] text-gray-400 font-normal">
                              (Direct)
                            </span>
                          </p>
                          <p className="text-[8px] text-gray-400 italic">
                            Token Paid: {item.tokenPaid}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <button
                          onClick={() => handleViewInvoice(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {transTotalPages > 1 && (
                <div className="mt-8 flex justify-center border-t border-gray-50 dark:border-gray-800 pt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={transPrevPage}
                          className={`cursor-pointer ${transPage === 1 ? "pointer-events-none opacity-50" : ""}`}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="text-sm px-4 text-gray-500">
                          {t("common.page")} {transPage} {t("common.of")}{" "}
                          {transTotalPages}
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          onClick={transNextPage}
                          className={`cursor-pointer ${transPage === transTotalPages ? "pointer-events-none opacity-50" : ""}`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title={t("earnings.no_transactions")}
              description={t("earnings.no_transactions_desc")}
              icon={BarChart3}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        transaction={selectedTransaction}
      />

      <ManagePaymentMethodsModal
        isOpen={isMethodsOpen}
        onClose={() => setIsMethodsOpen(false)}
        paymentMethods={paymentMethods}
        onUpdate={refreshMethods}
      />
    </div>
  );
};

export default ProfileEarnings;
