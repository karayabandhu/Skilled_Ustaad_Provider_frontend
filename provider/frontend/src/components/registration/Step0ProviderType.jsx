import React from "react";
import { User, Building2, ChevronRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TypeCard = ({ icon: Icon, title, subtitle, features, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group w-full text-left p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-white/50 dark:bg-slate-900/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl"
  >
    <div className="flex items-start gap-4">
      <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800 shrink-0 group-hover:scale-110 transition-transform">
        <Icon size={28} className="text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h3>
          <ChevronRight
            size={20}
            className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0"
          />
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
          {subtitle}
        </p>
        <ul className="mt-3 space-y-1.5">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </button>
);

const Step0ProviderType = ({ onSelect }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800/50 mb-2">
          <ShieldCheck size={14} className="text-blue-600" />
          <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">
            Choose Your Account Type
          </span>
        </div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
          Select how you want to offer services on Skilled Ustaad.
        </p>
      </div>

      <div className="space-y-4">
        <TypeCard
          icon={User}
          title="Individual Provider"
          subtitle="Register as a solo professional offering services directly to customers."
          features={[
            "Single provider account",
            "Personal service profile",
            "Direct booking & earnings",
          ]}
          onClick={() => onSelect("individual")}
        />

        <TypeCard
          icon={Building2}
          title="Business / Shop Owner"
          subtitle="Register your business and manage a team of workers under one account."
          features={[
            "Business profile with GST support",
            "Add & manage multiple workers",
            "Centralized bookings & earnings",
          ]}
          onClick={() => onSelect("business")}
        />
      </div>

      <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 pt-2">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-blue-600 dark:text-blue-400 font-black hover:underline"
        >
          Already a partner? Login Securely
        </button>
      </p>
    </div>
  );
};

export default Step0ProviderType;
