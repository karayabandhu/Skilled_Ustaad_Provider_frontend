/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { User, Building2, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Store, Users, Landmark, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";

const ProviderTypeSelector = ({ onSelectType }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-2">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800/50 mb-4">
          <Sparkles size={16} className="text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest">
            {t("provider_type.badge", "Partner Onboarding")}
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
          {t("provider_type.title", "Choose Your Provider Type")}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 font-medium max-w-xl mx-auto text-sm md:text-base">
          {t("provider_type.subtitle", "Select how you would like to partner with Skilled Ustaad. You can register as an independent professional or onboard your business.")}
        </p>
      </div>

      {/* Two Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10">
        {/* Option 1: Individual Provider */}
        <motion.div
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="relative group bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-3xl p-6 md:p-8 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all flex flex-col justify-between"
        >
          {/* Top Badge */}
          <div className="flex items-center justify-between mb-6">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-wider rounded-full border border-blue-200 dark:border-blue-800">
              {t("provider_type.individual_tag", "Solo Professional")}
            </span>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <User size={26} />
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              {t("provider_type.individual_title", "Individual Provider")}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 font-medium">
              {t("provider_type.individual_desc", "Ideal for independent technicians, plumbers, electricians, cleaners, and solo service providers offering skills directly to customers.")}
            </p>

            {/* Highlights */}
            <div className="space-y-3 mb-8">
              {[
                t("provider_type.ind_feature1", "Direct customer bookings & instant payouts"),
                t("provider_type.ind_feature2", "Flexible schedule — work whenever you want"),
                t("provider_type.ind_feature3", "Quick 4-step streamlined registration"),
                t("provider_type.ind_feature4", "No firm or shop registration required"),
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700 dark:text-slate-300 font-semibold">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onSelectType("individual")}
            className="w-full h-14 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg group-hover:bg-blue-600 transition-all duration-300 active:scale-[0.98]"
          >
            <span>{t("provider_type.continue_individual", "Register as Individual")}</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Option 2: Business / Shop Owner */}
        <motion.div
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="relative group bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-3xl p-6 md:p-8 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all flex flex-col justify-between"
        >
          {/* Top Badge */}
          <div className="flex items-center justify-between mb-6">
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-black uppercase tracking-wider rounded-full border border-indigo-200 dark:border-indigo-800">
              {t("provider_type.business_tag", "Shop & Firm Owner")}
            </span>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
              <Building2 size={26} />
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              {t("provider_type.business_title", "Business / Shop Owner")}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 font-medium">
              {t("provider_type.business_desc", "For service agencies, repair shops, contractor teams, and retail businesses managing multiple workers and service dispatches.")}
            </p>

            {/* Highlights */}
            <div className="space-y-3 mb-8">
              {[
                t("provider_type.biz_feature1", "Add and manage multiple workers under one business"),
                t("provider_type.biz_feature2", "Registered shop & optional GST tax invoicing"),
                t("provider_type.biz_feature3", "Commercial badge & priority high-value project leads"),
                t("provider_type.biz_feature4", "Centralized bank payouts & worker dispatch control"),
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700 dark:text-slate-300 font-semibold">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onSelectType("business")}
            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all duration-300"
          >
            <span>{t("provider_type.continue_business", "Register as Business / Shop")}</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* Trust & Policy Footnote */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-blue-600" />
          <span>{t("provider_type.guarantee_kyc", "100% Verified Partners")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Landmark size={16} className="text-emerald-600" />
          <span>{t("provider_type.guarantee_bank", "Direct Secure Bank Settlements")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Store size={16} className="text-purple-600" />
          <span>{t("provider_type.guarantee_growth", "Empowering Local Businesses")}</span>
        </div>
      </div>
    </div>
  );
};

export default ProviderTypeSelector;
