/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  User,
  Building2,
  Store,
  Briefcase,
  Users,
  FileText,
  Landmark,
  Edit2,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
  Rocket,
  ShieldAlert,
  MapPin,
  Check,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const ReviewSectionHeader = ({ title, icon: Icon, onEdit, stepNumber }) => (
  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
        <Icon size={16} />
      </div>
      <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
        {title}
      </h5>
    </div>
    <button
      type="button"
      onClick={() => onEdit(stepNumber)}
      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
    >
      <Edit2 size={13} />
      <span>Edit</span>
    </button>
  </div>
);

const BusinessStep7Review = ({
  data,
  prevStep,
  goToStep,
  onSubmitApplication,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [isFinalConfirmed, setIsFinalConfirmed] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!isFinalConfirmed) {
      setError(t("business_reg.err_review_confirm", "Please review and confirm your application details by checking the declaration box."));
      return;
    }

    onSubmitApplication();
  };

  const docs = data.documents || {};
  const workers = Array.isArray(data.workers) ? data.workers : [];

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
        <h4 className="text-xl font-black text-slate-900 dark:text-white">
          {t("business_reg.step7_title", "Review Application Details")}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t("business_reg.step7_subtitle", "Please verify all entered information carefully before final submission to admin review.")}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-semibold animate-in fade-in">
          <ShieldAlert size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Review Cards */}
      <div className="space-y-4">
        {/* 1. Owner Details */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <ReviewSectionHeader
            title={t("business_reg.owner_details", "1. Owner Details")}
            icon={User}
            onEdit={goToStep}
            stepNumber={1}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Full Legal Name
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {data.ownerName || "—"}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Mobile Number
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {data.phoneNumber || "—"}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Email Address
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                {data.email || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Business Details */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <ReviewSectionHeader
            title={t("business_reg.biz_details", "2. Business & Shop Details")}
            icon={Store}
            onEdit={goToStep}
            stepNumber={2}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Business Name
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {data.businessName || "—"}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Entity Type
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {data.businessType || "—"}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                GSTIN
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {data.gstNumber || "Not Provided (Unregistered)"}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/80 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Business Address
            </span>
            <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">
              {[data.shopNumber, data.colony, data.landmark, data.city, data.state, data.pinCode]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        </div>

        {/* 3. Services & Location */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <ReviewSectionHeader
            title={t("business_reg.services_location", "3. Services & Specialization")}
            icon={Briefcase}
            onEdit={goToStep}
            stepNumber={3}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Category
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {data.serviceCategory || "—"}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Trade / Specialization
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {data.providerSubService || "—"}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Years Established
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {data.experience ? `${data.experience} Years` : "—"}
              </p>
            </div>
          </div>
          {Array.isArray(data.subService) && data.subService.length > 0 && (
            <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Offered Tasks ({data.subService.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {data.subService.map((task) => (
                  <span
                    key={task}
                    className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-300"
                  >
                    {task}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. Workers */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <ReviewSectionHeader
            title={t("business_reg.workers_count", "4. Registered Workers ({{count}})", { count: workers.length })}
            icon={Users}
            onEdit={goToStep}
            stepNumber={4}
          />
          <div className="space-y-2">
            {workers.map((w, idx) => (
              <div
                key={w.id || idx}
                className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {w.name}
                    </span>
                    <span className="text-slate-400 text-[11px] ml-2">
                      ({w.role})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-mono text-[11px] pl-7 sm:pl-0">
                  <span>📱 {w.phone}</span>
                  {w.experience && <span>⏳ {w.experience} yrs exp</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Documents Uploaded */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <ReviewSectionHeader
            title={t("business_reg.docs_summary", "5. Verification Documents")}
            icon={FileText}
            onEdit={goToStep}
            stepNumber={5}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {[
              { key: "businessRegistrationProof", label: "Registration / Trade License", req: true },
              { key: "ownerGovtId", label: "Owner Government ID", req: true },
              { key: "addressProof", label: "Business Address Proof", req: true },
              { key: "businessLogoOrShopPhoto", label: "Shop Photo / Logo", req: true },
              { key: "gstCertificate", label: "GST Certificate", req: Boolean(data.gstNumber) },
              { key: "workerIdProofs", label: "Worker ID Proofs", req: false },
            ].map(({ key, label, req }) => {
              const file = docs[key];
              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate mr-2">
                    {label}
                  </span>
                  {file ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 shrink-0">
                      <CheckCircle2 size={13} />
                      Attached
                    </span>
                  ) : req ? (
                    <span className="text-[10px] font-black uppercase text-red-500 shrink-0">
                      Missing *
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">
                      Optional
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Bank Details */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <ReviewSectionHeader
            title={t("business_reg.bank_summary", "6. Settlement & Bank Account")}
            icon={Landmark}
            onEdit={goToStep}
            stepNumber={6}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Account Holder
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {data.accountHolderName || "—"}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Account Number
              </span>
              <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {data.bankAccountNumber
                  ? `•••• •••• •••• ${data.bankAccountNumber.slice(-4)}`
                  : "—"}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                IFSC Code / UPI
              </span>
              <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {data.ifscCode || "—"} / {data.upiId || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <div className="pt-2">
        <label className="flex items-start gap-3 p-4 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-2xl cursor-pointer group">
          <input
            type="checkbox"
            checked={isFinalConfirmed}
            onChange={(e) => setIsFinalConfirmed(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <div className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
            <strong className="text-slate-900 dark:text-white font-bold block mb-0.5">
              {t("business_reg.declaration_final_title", "Final Declaration & Submission Consent")}
            </strong>
            {t("business_reg.declaration_final_desc", "I hereby verify that all business details, worker profiles, and uploaded documents are accurate and legally authentic. I understand that my business application will remain under review until admin verification.")}
          </div>
        </label>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-4 pt-4">
        <button
          type="button"
          onClick={prevStep}
          disabled={loading}
          className="flex-1 h-14 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <ChevronLeft size={18} />
          <span>{t("business_reg.back", "Back")}</span>
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex-[2] h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t("business_reg.submitting", "Submitting Application...")}</span>
            </div>
          ) : (
            <>
              <Rocket size={18} />
              <span>{t("business_reg.submit_application", "Submit Business Application")}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BusinessStep7Review;
