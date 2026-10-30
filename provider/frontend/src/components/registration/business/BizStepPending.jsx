import React from "react";
import { Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BizStepPending = ({ data }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
      {/* Status icon */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-900/20 border-4 border-amber-100 dark:border-amber-800/50 flex items-center justify-center">
            <Clock size={36} className="text-amber-500" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center border-2 border-white dark:border-slate-900">
            <ShieldCheck size={14} className="text-white" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Application Submitted!
        </h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
          Your business registration is now{" "}
          <strong className="text-amber-600 dark:text-amber-400">under review</strong>. Our admin
          team will verify your details and documents within 24–48 hours.
        </p>
      </div>

      {/* Status card */}
      <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/50 p-5 text-left space-y-3">
        <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">
          Application Status
        </p>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <span className="text-sm font-black text-amber-700 dark:text-amber-300">
            Pending Admin Review
          </span>
        </div>
        {data?.businessName && (
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Business:{" "}
            <strong className="text-slate-800 dark:text-white">{data.businessName}</strong>
          </p>
        )}
        {data?.email && (
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Notification will be sent to:{" "}
            <strong className="text-slate-800 dark:text-white">{data.email}</strong>
          </p>
        )}
      </div>

      {/* What happens next */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 text-left space-y-3">
        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          What Happens Next
        </p>
        {[
          "Admin reviews your business documents and worker details.",
          "You receive an email / SMS notification on approval or if changes are needed.",
          "Once approved, log in to access your business dashboard.",
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[9px] font-black text-white">{i + 1}</span>
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
              {step}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
        >
          Go to Login
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full h-12 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default BizStepPending;
