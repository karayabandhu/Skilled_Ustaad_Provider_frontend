import React, { useState } from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Building2,
  FileText,
  Users,
  ArrowRight,
  RefreshCw,
  Home,
  Headphones,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { updateBusinessApplicationStatus, resetBusinessApplication } from "../../../services/businessRegistration";

const BusinessStep8Status = ({
  application,
  onResolveChanges,
  onStartNewRegistration,
  setIsAuthenticated,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Local state to reflect interactive simulation updates immediately
  const [currentApp, setCurrentApp] = useState(application);

  const status = currentApp?.status || "under_review";
  const referenceId = currentApp?.referenceId || "SU-BIZ-2026-PENDING";
  const summary = currentApp?.summary || {};

  // Handlers for simulator actions
  const handleSimulateRequestChanges = () => {
    const updated = updateBusinessApplicationStatus("changes_requested", {
      adminFeedback:
        "The uploaded Business Address Proof was unclear or obscured. Please re-upload a clear electricity bill or registered lease agreement to proceed with approval.",
      requestedChangesStep: 5, // Documents step
    });
    if (updated) setCurrentApp({ ...updated });
  };

  const handleSimulateApprove = () => {
    const updated = updateBusinessApplicationStatus("approved", {
      adminFeedback: "All business documents, worker records, and bank details have been verified and approved by the Skilled Ustaad Compliance Team.",
    });
    if (updated) {
      setCurrentApp({ ...updated });
    }
  };

  const handleProceedToDashboard = () => {
    // Set approved business provider profile in localStorage
    const businessProviderData = {
      id: currentApp.referenceId,
      name: summary.businessName || summary.ownerName,
      fullName: summary.ownerName,
      phoneNumber: summary.phoneNumber,
      email: summary.email,
      businessName: summary.businessName,
      businessType: summary.businessType,
      serviceCategory: summary.serviceCategory,
      providerSubService: summary.providerSubService,
      status: "Active", // Approved!
      providerType: "business",
      workersCount: summary.totalWorkers || 1,
      bankAccountNumber: summary.bankAccountNumber,
      ifscCode: summary.ifscCode,
    };

    localStorage.setItem("providerData", JSON.stringify(businessProviderData));
    localStorage.setItem("providerId", currentApp.referenceId);
    localStorage.setItem("providerPhone", summary.phoneNumber || "");
    if (setIsAuthenticated) setIsAuthenticated(true);
    window.dispatchEvent(new Event("storage"));
    navigate("/profile");
  };

  const handleReset = () => {
    resetBusinessApplication();
    if (onStartNewRegistration) {
      onStartNewRegistration();
    } else {
      navigate("/register", { replace: true });
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Header Banner */}
      <div
        className={`p-6 md:p-8 rounded-3xl border-2 transition-all ${
          status === "approved"
            ? "bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-500/40"
            : status === "changes_requested"
            ? "bg-amber-50/80 dark:bg-amber-950/20 border-amber-500/40"
            : "bg-blue-50/80 dark:bg-blue-950/20 border-blue-500/40"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg ${
                status === "approved"
                  ? "bg-emerald-600 shadow-emerald-600/30"
                  : status === "changes_requested"
                  ? "bg-amber-500 shadow-amber-500/30"
                  : "bg-blue-600 shadow-blue-600/30 animate-pulse"
              }`}
            >
              {status === "approved" ? (
                <CheckCircle2 size={30} />
              ) : status === "changes_requested" ? (
                <AlertTriangle size={30} />
              ) : (
                <Clock size={30} />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                    status === "approved"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                      : status === "changes_requested"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                  }`}
                >
                  {status === "approved"
                    ? "Approved & Activated"
                    : status === "changes_requested"
                    ? "Action Required: Changes Requested"
                    : "Pending / Under Review"}
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {status === "approved"
                  ? "Business Application Approved!"
                  : status === "changes_requested"
                  ? "Admin Requested Changes"
                  : "Application Under Review"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Ref ID: <span className="font-bold text-slate-800 dark:text-slate-200">{referenceId}</span>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Application Type
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Commercial / Shop Owner
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {currentApp?.submittedAt
                ? new Date(currentApp.submittedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Just now"}
            </span>
          </div>
        </div>
      </div>

      {/* Changes Requested Action Alert */}
      {status === "changes_requested" && (
        <div className="p-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-3xl space-y-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-sm font-black text-amber-900 dark:text-amber-200">
                Admin Review Feedback
              </h5>
              <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                {currentApp.adminFeedback ||
                  "Some details or documents require correction. Please update the requested sections and resubmit your application."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onResolveChanges(currentApp.requestedChangesStep || 5)}
            className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-amber-600/20 active:scale-[0.98] transition-all"
          >
            <span>Update Requested Information (Step {currentApp.requestedChangesStep || 5})</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Approved Action Banner */}
      {status === "approved" && (
        <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-3xl space-y-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={22} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h5 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                Your Business is Now Live on Skilled Ustaad!
              </h5>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                You can now access your business partner dashboard, manage worker jobs, and start taking bookings.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleProceedToDashboard}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all"
          >
            <span>Proceed to Business Dashboard</span>
            <ArrowRight size={18} />
          </button>
        </div>
      )}

      {/* Flowchart Approval Stages Tracker */}
      <div className="p-6 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-5">
        <h5 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          {t("business_reg.workflow_stages", "Registration & Approval Flowchart")}
        </h5>

        <div className="space-y-4">
          {/* Stage 1: Submitted */}
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Check size={16} strokeWidth={3} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h6 className="text-xs font-black text-slate-900 dark:text-white">
                  1. Business Application Submitted
                </h6>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Completed
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Owner info, shop details, worker roster ({summary.totalWorkers || 1} workers), and bank details recorded.
              </p>
            </div>
          </div>

          {/* Stage 2: KYC & Compliance */}
          <div className="flex items-start gap-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                status === "approved"
                  ? "bg-emerald-500"
                  : status === "changes_requested"
                  ? "bg-amber-500"
                  : "bg-blue-600 animate-pulse"
              }`}
            >
              {status === "approved" ? (
                <Check size={16} strokeWidth={3} />
              ) : status === "changes_requested" ? (
                <AlertTriangle size={15} />
              ) : (
                <Clock size={16} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h6 className="text-xs font-black text-slate-900 dark:text-white">
                  2. Document & Worker Verification Audit
                </h6>
                <span
                  className={`text-[10px] font-bold ${
                    status === "approved"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : status === "changes_requested"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {status === "approved"
                    ? "Verified"
                    : status === "changes_requested"
                    ? "Action Needed"
                    : "In Progress"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Verification of trade registration, address proof, owner ID, and worker profiles.
              </p>
            </div>
          </div>

          {/* Stage 3: Admin Review & Decision */}
          <div className="flex items-start gap-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                status === "approved"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400"
              }`}
            >
              {status === "approved" ? (
                <Check size={16} strokeWidth={3} />
              ) : (
                <ShieldCheck size={16} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h6 className="text-xs font-black text-slate-900 dark:text-white">
                  3. Admin Review & Decision
                </h6>
                <span
                  className={`text-[10px] font-bold ${
                    status === "approved"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400"
                  }`}
                >
                  {status === "approved" ? "Approved" : "Awaiting Decision"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Admin can approve the application or request changes. Accounts are never automatically activated.
              </p>
            </div>
          </div>

          {/* Stage 4: Business Live Activation */}
          <div className="flex items-start gap-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                status === "approved"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400"
              }`}
            >
              {status === "approved" ? (
                <Check size={16} strokeWidth={3} />
              ) : (
                <Building2 size={16} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h6 className="text-xs font-black text-slate-900 dark:text-white">
                  4. Commercial Profile Activation
                </h6>
                <span
                  className={`text-[10px] font-bold ${
                    status === "approved"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400"
                  }`}
                >
                  {status === "approved" ? "Active" : "Locked"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Dispatch workers, accept commercial leads, and receive payouts directly into bank account.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Flowchart Approval Simulator (Interactive Test Controls) */}
      <div className="p-5 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 border border-slate-300 dark:border-slate-700 rounded-3xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Admin Approval Flowchart Simulator
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
            Interactive Test Tools
          </span>
        </div>

        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          In production, admin approval happens via the administrator control plane. You can test both branches of the flowchart right here:
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={handleSimulateRequestChanges}
            className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <AlertTriangle size={14} />
            <span>Simulate: Admin Requests Changes</span>
          </button>

          <button
            type="button"
            onClick={handleSimulateApprove}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <CheckCircle2 size={14} />
            <span>Simulate: Admin Approves Application</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const updated = updateBusinessApplicationStatus("under_review");
              if (updated) setCurrentApp({ ...updated });
            }}
            className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Clock size={14} />
            <span>Reset to Under Review</span>
          </button>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <Home size={15} />
          <span>Return to Homepage</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/support")}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Headphones size={15} />
            <span>Partner Support</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw size={14} />
            <span>Start New Application</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessStep8Status;

